import { describe, expect, it } from "vitest";
import { CheckStatus, Role, TeamKey, VerificationType } from "@prisma/client";
import { isPendingReviewFor } from "@/lib/review-queue";
import type { AuthUser } from "@/lib/authz";

const seo: AuthUser = { id: "seo", role: Role.SEO_LEAD, teamId: "team-seo", teamKey: TeamKey.SEO, isActive: true };
const fe: AuthUser = { id: "fe", role: Role.TEAM_MEMBER, teamId: "team-fe", teamKey: TeamKey.FRONTEND, isActive: true };
const reviewer: AuthUser = { id: "rev", role: Role.TEAM_MEMBER, teamId: "team-be", teamKey: TeamKey.BACKEND, isActive: true };
const admin: AuthUser = { id: "adm", role: Role.SYSTEM_ADMIN, teamId: null, teamKey: null, isActive: true };

describe("review queue", () => {
  // 2026-10-01: Frontend/Backend/Network/Content work is approved only by SEO, so even SELF
  // work of those teams lands in the SEO queue.
  it("puts Frontend SELF work into the SEO queue (SEO is the only approver)", () => {
    expect(
      isPendingReviewFor(seo, {
        ownerUserId: "fe",
        ownerTeamId: "team-fe",
        ownerTeamKey: TeamKey.FRONTEND,
        reviewerUserId: "fe",
        verificationType: VerificationType.SELF,
        status: CheckStatus.REVIEW,
      }),
    ).toBe(true);
  });

  it("shows SEO_GATED reviews to SEO", () => {
    expect(
      isPendingReviewFor(seo, {
        ownerUserId: "fe",
        ownerTeamId: "team-fe",
        ownerTeamKey: TeamKey.FRONTEND,
        reviewerUserId: "seo",
        verificationType: VerificationType.SEO_GATED,
        status: CheckStatus.REVIEW,
      }),
    ).toBe(true);
    expect(
      isPendingReviewFor(fe, {
        ownerUserId: "fe",
        ownerTeamId: "team-fe",
        ownerTeamKey: TeamKey.FRONTEND,
        reviewerUserId: "seo",
        verificationType: VerificationType.SEO_GATED,
        status: CheckStatus.REVIEW,
      }),
    ).toBe(false);
  });

  it("Frontend CROSS_TEAM goes to SEO, not to a non-SEO assigned reviewer", () => {
    const check = {
      ownerUserId: "fe",
      ownerTeamId: "team-fe",
      ownerTeamKey: TeamKey.FRONTEND,
      reviewerUserId: "rev",
      verificationType: VerificationType.CROSS_TEAM,
      status: CheckStatus.REVIEW,
    };
    expect(isPendingReviewFor(reviewer, check)).toBe(false);
    expect(isPendingReviewFor(seo, check)).toBe(true);
    expect(isPendingReviewFor(fe, check)).toBe(false);
  });

  it("SEO-owned CROSS_TEAM still goes only to its assigned reviewer outside SEO", () => {
    const check = {
      ownerUserId: "seo",
      ownerTeamId: "team-seo",
      ownerTeamKey: TeamKey.SEO,
      reviewerUserId: "rev",
      verificationType: VerificationType.CROSS_TEAM,
      status: CheckStatus.REVIEW,
    };
    expect(isPendingReviewFor(reviewer, check)).toBe(true);
    expect(isPendingReviewFor(seo, check)).toBe(false);
  });

  it("lets SYSTEM_ADMIN see pending reviews", () => {
    expect(
      isPendingReviewFor(admin, {
        ownerUserId: "fe",
        ownerTeamId: "team-fe",
        ownerTeamKey: TeamKey.FRONTEND,
        reviewerUserId: "seo",
        verificationType: VerificationType.SELF,
        status: CheckStatus.REVIEW,
      }),
    ).toBe(true);
  });
});
