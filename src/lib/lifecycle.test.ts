import { describe, expect, it } from "vitest";
import { CheckStatus, DeploymentStatus, GateStatus, ModuleKey, Priority, Role, TeamKey } from "@prisma/client";
import {
  canCompleteProductionVerification,
  canEmergencyDeploy,
  canMarkAsDeployed,
  canReopenVerifiedRelease,
  canStartPostLaunchVerification,
  isProductionLocked,
} from "@/lib/lifecycle";
import type { AuthUser } from "@/lib/authz";

const pm: AuthUser = { id: "pm", role: Role.PROJECT_MANAGER, teamId: null, teamKey: null, isActive: true };
const fe: AuthUser = { id: "fe", role: Role.TEAM_MEMBER, teamId: "fe", teamKey: TeamKey.FRONTEND, isActive: true };
const mgmt: AuthUser = { id: "mg", role: Role.MANAGEMENT, teamId: null, teamKey: null, isActive: true };
const seo: AuthUser = { id: "seo", role: Role.SEO_LEAD, teamId: "seo", teamKey: TeamKey.SEO, isActive: true };

describe("lifecycle actions", () => {
  it("locks PRODUCTION_VERIFIED regardless of reopen timestamp", () => {
    expect(isProductionLocked({ deploymentStatus: DeploymentStatus.PRODUCTION_VERIFIED })).toBe(true);
    expect(isProductionLocked({ deploymentStatus: DeploymentStatus.POST_LAUNCH_VERIFYING })).toBe(false);
  });

  it("allows mark deployed only when READY and not yet deployed", () => {
    expect(canMarkAsDeployed(pm, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.NOT_DEPLOYED })).toBe(true);
    expect(canMarkAsDeployed(pm, { gateStatus: GateStatus.NO_GO, deploymentStatus: DeploymentStatus.NOT_DEPLOYED })).toBe(false);
    expect(canMarkAsDeployed(mgmt, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.NOT_DEPLOYED })).toBe(false);
    expect(canMarkAsDeployed(fe, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.NOT_DEPLOYED })).toBe(false);
  });

  it("shows emergency deploy only for NO_GO/AT_RISK and not deployed", () => {
    expect(canEmergencyDeploy(pm, { gateStatus: GateStatus.NO_GO, deploymentStatus: DeploymentStatus.NOT_DEPLOYED })).toBe(true);
    expect(canEmergencyDeploy(pm, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.NOT_DEPLOYED })).toBe(false);
    expect(canEmergencyDeploy(pm, { gateStatus: GateStatus.NO_GO, deploymentStatus: DeploymentStatus.DEPLOYED })).toBe(false);
  });

  it("post-launch and production verification follow deployment state", () => {
    expect(canStartPostLaunchVerification(pm, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.DEPLOYED })).toBe(true);
    expect(canStartPostLaunchVerification(pm, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.NOT_DEPLOYED })).toBe(false);
    expect(
      canCompleteProductionVerification(pm, {
        gateStatus: GateStatus.READY,
        deploymentStatus: DeploymentStatus.POST_LAUNCH_VERIFYING,
        checks: [{ module: ModuleKey.POST_LAUNCH, priority: Priority.P0, status: CheckStatus.PASS }],
      }),
    ).toBe(true);
    expect(
      canCompleteProductionVerification(pm, {
        gateStatus: GateStatus.READY,
        deploymentStatus: DeploymentStatus.DEPLOYED,
        checks: [],
      }),
    ).toBe(false);
  });

  it("reopen is only available on PRODUCTION_VERIFIED for authorized roles", () => {
    expect(canReopenVerifiedRelease(seo, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.PRODUCTION_VERIFIED })).toBe(true);
    expect(canReopenVerifiedRelease(pm, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.PRODUCTION_VERIFIED })).toBe(true);
    expect(canReopenVerifiedRelease(fe, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.PRODUCTION_VERIFIED })).toBe(false);
    expect(canReopenVerifiedRelease(seo, { gateStatus: GateStatus.READY, deploymentStatus: DeploymentStatus.DEPLOYED })).toBe(false);
  });
});
