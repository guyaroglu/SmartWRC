import {
  CheckStatus,
  DeploymentStatus,
  GateStatus,
  ModuleKey,
  Priority,
  type Release,
  type ReleaseCheck,
} from "@prisma/client";
import { canMarkDeployed, canReopenCheck, type AuthUser } from "@/lib/authz";

export type LifecycleRelease = Pick<Release, "gateStatus" | "deploymentStatus"> & {
  checks?: Pick<ReleaseCheck, "module" | "priority" | "status">[];
};

export function isProductionLocked(release: Pick<Release, "deploymentStatus">): boolean {
  return release.deploymentStatus === DeploymentStatus.PRODUCTION_VERIFIED;
}

export function canMarkAsDeployed(user: AuthUser, release: LifecycleRelease): boolean {
  return (
    canMarkDeployed(user) &&
    release.gateStatus === GateStatus.READY &&
    release.deploymentStatus === DeploymentStatus.NOT_DEPLOYED
  );
}

export function canEmergencyDeploy(user: AuthUser, release: LifecycleRelease): boolean {
  return (
    canMarkDeployed(user) &&
    release.deploymentStatus === DeploymentStatus.NOT_DEPLOYED &&
    (release.gateStatus === GateStatus.NO_GO || release.gateStatus === GateStatus.AT_RISK)
  );
}

export function canStartPostLaunchVerification(user: AuthUser, release: LifecycleRelease): boolean {
  return canMarkDeployed(user) && release.deploymentStatus === DeploymentStatus.DEPLOYED;
}

export function postLaunchP0Complete(release: LifecycleRelease): boolean {
  const post = (release.checks ?? []).filter((c) => c.module === ModuleKey.POST_LAUNCH && c.priority === Priority.P0);
  return post.every(
    (c) => c.status === CheckStatus.PASS || c.status === CheckStatus.NA || c.status === CheckStatus.WAIVED,
  );
}

export function canCompleteProductionVerification(user: AuthUser, release: LifecycleRelease): boolean {
  return (
    canMarkDeployed(user) &&
    release.deploymentStatus === DeploymentStatus.POST_LAUNCH_VERIFYING &&
    postLaunchP0Complete(release)
  );
}

export function canReopenVerifiedRelease(user: AuthUser, release: LifecycleRelease): boolean {
  return canReopenCheck(user) && release.deploymentStatus === DeploymentStatus.PRODUCTION_VERIFIED;
}
