import { describe, expect, it } from "vitest";
import { Role, TeamKey, VerificationType } from "@prisma/client";
import {
  canEditCheck,
  canPassCheck,
  canChangePriority,
  canMarkDeployed,
  type AuthUser,
  type CheckAuthzInput,
} from "@/lib/authz";

const frontend: AuthUser = { id: "fe", role: Role.TEAM_MEMBER, teamId: "team-fe", teamKey: TeamKey.FRONTEND, isActive: true };
const network: AuthUser = { id: "net", role: Role.TEAM_MEMBER, teamId: "team-net", teamKey: TeamKey.NETWORK, isActive: true };
const seo: AuthUser = { id: "seo", role: Role.SEO_LEAD, teamId: "team-seo", teamKey: TeamKey.SEO, isActive: true };
const management: AuthUser = { id: "mg", role: Role.MANAGEMENT, teamId: null, teamKey: null, isActive: true };
const pm: AuthUser = { id: "pm", role: Role.PROJECT_MANAGER, teamId: null, teamKey: null, isActive: true };

const frontendCheck: CheckAuthzInput = {
  ownerUserId: "fe",
  ownerTeamId: "team-fe",
  ownerTeamKey: TeamKey.FRONTEND,
  reviewerUserId: "seo",
  verificationType: VerificationType.SEO_GATED,
};

const backendCheck: CheckAuthzInput = {
  ownerUserId: "be",
  ownerTeamId: "team-be",
  ownerTeamKey: TeamKey.BACKEND,
  reviewerUserId: "seo",
  verificationType: VerificationType.SEO_GATED,
};

describe("authorization", () => {
  it("frontend cannot edit backend check", () => {
    expect(canEditCheck(frontend, backendCheck)).toBe(false);
    expect(canEditCheck(frontend, frontendCheck)).toBe(true);
  });

  it("team member cannot change P0 priority", () => {
    expect(canChangePriority(frontend)).toBe(false);
    expect(canChangePriority(seo)).toBe(true);
  });

  it("management cannot modify checks or pass", () => {
    expect(canEditCheck(management, frontendCheck)).toBe(false);
    expect(canPassCheck(management, frontendCheck)).toBe(false);
    expect(canMarkDeployed(management)).toBe(false);
  });

  it("SEO_GATED requires SEO, not the owner team", () => {
    expect(canPassCheck(frontend, frontendCheck)).toBe(false);
    expect(canPassCheck(seo, frontendCheck)).toBe(true);
    expect(canPassCheck(pm, frontendCheck)).toBe(false);
  });

  it("SEO access does not make SEO the owner of frontend work", () => {
    expect(frontendCheck.ownerTeamKey).toBe(TeamKey.FRONTEND);
    expect(canEditCheck(seo, frontendCheck)).toBe(true);
    expect(frontendCheck.ownerTeamId).not.toBe(seo.teamId);
  });

  it("network user cannot edit frontend check", () => {
    expect(canEditCheck(network, frontendCheck)).toBe(false);
  });
});
