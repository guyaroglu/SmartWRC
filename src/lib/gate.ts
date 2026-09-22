import {
  CheckStatus,
  DeploymentStatus,
  GateStatus,
  ModuleKey,
  OnboardingType,
  Priority,
  type ReleaseCheck,
} from "@prisma/client";

const RESOLVED: CheckStatus[] = [
  CheckStatus.PASS,
  CheckStatus.NA,
  CheckStatus.WAIVED,
  CheckStatus.REMOVED_FROM_SCOPE,
];

const OPEN_WORK: CheckStatus[] = [
  CheckStatus.NOT_STARTED,
  CheckStatus.IN_PROGRESS,
  CheckStatus.REVIEW,
  CheckStatus.FAIL,
  CheckStatus.BLOCKED,
  CheckStatus.DONE_NEEDS_VERIFICATION,
];

export type GateCheckInput = Pick<
  ReleaseCheck,
  | "status"
  | "priority"
  | "releaseBlocker"
  | "evidenceRequired"
  | "verificationType"
  | "module"
> & { evidenceCount: number };

function inGateScope(release: GateReleaseInput, check: GateCheckInput): boolean {
  const post = check.module === ModuleKey.POST_LAUNCH;
  const deployed =
    release.deploymentStatus === DeploymentStatus.DEPLOYED ||
    release.deploymentStatus === DeploymentStatus.POST_LAUNCH_VERIFYING ||
    release.deploymentStatus === DeploymentStatus.PRODUCTION_VERIFIED;
  if (post && !deployed) return false;
  if (!post && release.deploymentStatus !== DeploymentStatus.NOT_DEPLOYED) {
    return true;
  }
  return !post || deployed;
}

export type GateReleaseInput = {
  onboardingType: OnboardingType;
  baselineCompleted: boolean;
  deploymentStatus: DeploymentStatus;
};

export function isResolved(status: CheckStatus): boolean {
  return RESOLVED.includes(status);
}

export function isP0Blocker(check: Pick<GateCheckInput, "priority" | "releaseBlocker">): boolean {
  return check.priority === Priority.P0 || check.releaseBlocker;
}

export function hasRequiredEvidence(check: GateCheckInput): boolean {
  if (!check.evidenceRequired) return true;
  if (check.status === CheckStatus.NA || check.status === CheckStatus.WAIVED) return true;
  if (check.status === CheckStatus.REMOVED_FROM_SCOPE) return true;
  return check.evidenceCount > 0;
}

export function hasRequiredVerification(check: GateCheckInput): boolean {
  if (check.status === CheckStatus.NA || check.status === CheckStatus.WAIVED) return true;
  if (check.status === CheckStatus.REMOVED_FROM_SCOPE) return true;
  return check.status === CheckStatus.PASS;
}

export function openRiskCounts(release: GateReleaseInput, checks: GateCheckInput[]) {
  const inScope = checks.filter((c) => c.status !== CheckStatus.REMOVED_FROM_SCOPE && inGateScope(release, c));
  const unresolved = inScope.filter((c) => !isResolved(c.status));
  const p0 = unresolved.filter(isP0Blocker);
  const p1 = unresolved.filter((c) => c.priority === Priority.P1);
  return { p0: p0.length, p1: p1.length };
}

export function calculateGate(release: GateReleaseInput, checks: GateCheckInput[]): GateStatus {
  const inScope = checks.filter((c) => c.status !== CheckStatus.REMOVED_FROM_SCOPE && inGateScope(release, c));

  if (!release.baselineCompleted && release.onboardingType !== OnboardingType.NEW) {
    return GateStatus.NOT_ASSESSED;
  }

  if (inScope.length === 0) {
    return release.baselineCompleted ? GateStatus.READY : GateStatus.NOT_ASSESSED;
  }

  const p0 = inScope.filter(isP0Blocker);
  const unresolvedP0 = p0.filter((c) => !isResolved(c.status));
  const failedP0 = p0.filter((c) => c.status === CheckStatus.FAIL);
  const missingP0Evidence = p0.filter((c) => !isResolved(c.status) && !hasRequiredEvidence(c));
  const missingP0Verification = p0.filter((c) => !hasRequiredVerification(c));

  if (
    unresolvedP0.length > 0 ||
    failedP0.length > 0 ||
    missingP0Evidence.length > 0 ||
    missingP0Verification.length > 0
  ) {
    return GateStatus.NO_GO;
  }

  const mandatory = inScope.filter((c) => c.priority === Priority.P0 || c.priority === Priority.P1 || c.releaseBlocker);
  const openMandatory = mandatory.filter((c) => OPEN_WORK.includes(c.status));
  const missingEvidence = mandatory.filter((c) => !hasRequiredEvidence(c));
  const pendingReview = mandatory.filter((c) => c.status === CheckStatus.REVIEW);
  const unresolvedP1 = inScope.filter((c) => c.priority === Priority.P1 && !isResolved(c.status));

  const ready =
    unresolvedP0.length === 0 &&
    openMandatory.length === 0 &&
    missingEvidence.length === 0 &&
    pendingReview.length === 0 &&
    unresolvedP1.length === 0 &&
    release.baselineCompleted;

  if (ready) return GateStatus.READY;
  return GateStatus.AT_RISK;
}

export function assertReadyNotUserSet(next: GateStatus, previous: GateStatus, source: "engine" | "user") {
  if (source === "user" && next === GateStatus.READY) {
    throw new Error("READY cannot be selected by a user");
  }
  return { previous, next };
}
