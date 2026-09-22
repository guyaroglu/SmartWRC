import { describe, expect, it } from "vitest";
import { CheckStatus, Role, TeamKey, VerificationType } from "@prisma/client";
import { isPendingReviewFor } from "@/lib/review-queue";
import type { AuthUser } from "@/lib/authz";

const seo: AuthUser = { id: "seo", role: Role.SEO_LEAD, teamId: "team-seo", teamKey: TeamKey.SEO, isActive: true };
const fe: AuthUser = { id: "fe", role: Role.TEAM_MEMBER, teamId: "team-fe", teamKey: TeamKey.FRONTEND, isActive: true };
const reviewer: AuthUser = { id: "rev", role: Role.TEAM_MEMBER, teamId: "team-be", teamKey: TeamKey.BACKEND, isActive: true };
const admin: AuthUser = { id: "adm", role: Role.SYSTEM_ADMIN, teamId: null, teamKey: null, isActive: true };

describe("review queue", () => {
  it("does not put SELF checks into the SEO queue", () => {
    expect(
      isPendingReviewFor(seo, {
        ownerUserId: "fe",
        ownerTeamId: "team-fe",
        ownerTeamKey: TeamKey.FRONTEND,
        reviewerUserId: "fe",
        verificationType: VerificationType.SELF,
        status: CheckStatus.REVIEW,
      }),
    ).toBe(false);
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

  it("shows CROSS_TEAM only to the assigned reviewer", () => {
    const check = {
      ownerUserId: "fe",
      ownerTeamId: "team-fe",
      ownerTeamKey: TeamKey.FRONTEND,
      reviewerUserId: "rev",
      verificationType: VerificationType.CROSS_TEAM,
      status: CheckStatus.REVIEW,
    };
    expect(isPendingReviewFor(reviewer, check)).toBe(true);
    expect(isPendingReviewFor(seo, check)).toBe(false);
    expect(isPendingReviewFor(fe, check)).toBe(false);
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
