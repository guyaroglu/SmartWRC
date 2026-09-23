import { describe, expect, it } from "vitest";
import { CheckStatus, Priority, Role, TeamKey, VerificationType } from "@prisma/client";
import type { AuthUser } from "@/lib/authz";
import { countPendingReviews, deriveAttentionItems, isActionableAssigned, isAssignedToUser } from "@/lib/attention";
import type { AttentionCheck } from "@/lib/attention";

const fe: AuthUser = { id: "fe", role: Role.TEAM_MEMBER, teamId: "team-fe", teamKey: TeamKey.FRONTEND, isActive: true };
const seo: AuthUser = { id: "seo", role: Role.SEO_LEAD, teamId: "team-seo", teamKey: TeamKey.SEO, isActive: true };
const pm: AuthUser = { id: "pm", role: Role.PROJECT_MANAGER, teamId: null, teamKey: null, isActive: true };

function check(partial: Partial<AttentionCheck> & Pick<AttentionCheck, "id" | "status" | "title">): AttentionCheck {
  return {
    ownerUserId: "fe",
    ownerTeamId: "team-fe",
    ownerTeamKey: TeamKey.FRONTEND,
    reviewerUserId: "seo",
    verificationType: VerificationType.SEO_GATED,
    priority: Priority.P0,
    releaseId: "rel-1",
    releaseName: "Website Migration",
    projectName: "Audi Türkiye",
    ...partial,
  };
}

describe("attention center", () => {
  it("includes a correction item for the assigned owner", () => {
    const items = deriveAttentionItems(
      fe,
      [check({ id: "c1", status: CheckStatus.FAIL, title: "Canonical" })],
      [],
    );
    expect(items.some((i) => i.kind === "correction" && i.href === "/checks/c1")).toBe(true);
  });

  it("does not include completed items as assigned work", () => {
    expect(isActionableAssigned({ status: CheckStatus.PASS })).toBe(false);
    const items = deriveAttentionItems(
      fe,
      [check({ id: "c2", status: CheckStatus.PASS, title: "Done" })],
      [],
    );
    expect(items).toEqual([]);
  });

  it("counts only reviews the user is allowed to decide", () => {
    const seoGated = {
      ownerUserId: "fe",
      ownerTeamId: "team-fe",
      ownerTeamKey: TeamKey.FRONTEND,
      reviewerUserId: "seo",
      verificationType: VerificationType.SEO_GATED,
      status: CheckStatus.REVIEW,
    };
    const self = { ...seoGated, verificationType: VerificationType.SELF, reviewerUserId: "fe" };
    expect(countPendingReviews(seo, [seoGated, self])).toBe(1);
    expect(countPendingReviews(fe, [seoGated, self])).toBe(1);
    expect(countPendingReviews(fe, [seoGated])).toBe(0);
  });

  it("shows blocked releases to PM/SEO, not as fake notifications", () => {
    const items = deriveAttentionItems(pm, [], [
      { id: "r1", name: "Migration", projectName: "Audi", gateStatus: "NO_GO", openP0: 2 },
    ]);
    expect(items.some((i) => i.kind === "release" && i.href === "/releases/r1")).toBe(true);
  });

  it("treats ownerUser as assignment, not domain", () => {
    expect(isAssignedToUser(fe, { ownerUserId: "fe", ownerTeamId: "team-fe" })).toBe(true);
    expect(isAssignedToUser(fe, { ownerUserId: "other", ownerTeamId: "team-fe" })).toBe(false);
    expect(isAssignedToUser(fe, { ownerUserId: null, ownerTeamId: "team-fe" })).toBe(true);
  });
});
