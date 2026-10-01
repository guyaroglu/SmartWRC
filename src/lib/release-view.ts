import { CheckStatus, Priority, type ReleaseCheck } from "@prisma/client";
import { isResolved, type GateCheckInput, type GateReleaseInput, openRiskCounts } from "@/lib/gate";
import { teamLabel } from "@/lib/labels";

const OPEN_BLOCKER_STATUSES: CheckStatus[] = [
  CheckStatus.NOT_STARTED,
  CheckStatus.IN_PROGRESS,
  CheckStatus.REVIEW,
  CheckStatus.FAIL,
  CheckStatus.BLOCKED,
  CheckStatus.DONE_NEEDS_VERIFICATION,
];

export type CheckForView = Pick<
  ReleaseCheck,
  | "id"
  | "title"
  | "status"
  | "priority"
  | "releaseBlocker"
  | "module"
  | "domains"
  | "ownerTeamId"
  | "verificationType"
> & {
  ownerTeam: { key: string; name: string };
  evidence?: { id: string }[];
};

export function isOpenWork(status: CheckStatus): boolean {
  return OPEN_BLOCKER_STATUSES.includes(status);
}

export function blockingChecks(release: GateReleaseInput, checks: CheckForView[]): CheckForView[] {
  return checks.filter((c) => {
    if (c.module === "POST_LAUNCH" && release.deploymentStatus === "NOT_DEPLOYED") return false;
    if (c.status === CheckStatus.REMOVED_FROM_SCOPE) return false;
    const blocking = c.priority === Priority.P0 || c.releaseBlocker;
    return blocking && isOpenWork(c.status);
  });
}

export function mainOwnerRisk(checks: CheckForView[]): string {
  const counts = new Map<string, number>();
  for (const c of checks) {
    const key = teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

export function teamSummaries(release: GateReleaseInput, checks: CheckForView[]) {
  const byTeam = new Map<string, { key: string; name: string; checks: CheckForView[] }>();
  for (const c of checks) {
    const existing = byTeam.get(c.ownerTeamId);
    if (existing) existing.checks.push(c);
    else byTeam.set(c.ownerTeamId, { key: c.ownerTeam.key, name: c.ownerTeam.name, checks: [c] });
  }
  return [...byTeam.values()].map((group) => {
    const inScope = group.checks.filter((c) => {
      if (c.status === CheckStatus.REMOVED_FROM_SCOPE) return false;
      if (c.module === "POST_LAUNCH" && release.deploymentStatus === "NOT_DEPLOYED") return false;
      return true;
    });
    const done = inScope.filter((c) => isResolved(c.status)).length;
    // Workload = open work (terminal PASS / NA / WAIVED excluded); critical = the canonical blocker rule.
    const open = inScope.filter((c) => isOpenWork(c.status)).length;
    const openP0 = inScope.filter((c) => (c.priority === Priority.P0 || c.releaseBlocker) && isOpenWork(c.status)).length;
    const status = openP0 > 0 ? "Problem Var" : open > 0 ? "Devam Ediyor" : "Hazır";
    return {
      key: group.key,
      name: teamLabel[group.key] ?? group.name,
      total: inScope.length,
      done,
      open,
      openP0,
      status,
      checks: group.checks,
    };
  });
}

export function gateRisks(release: GateReleaseInput, checks: CheckForView[]) {
  const inputs: GateCheckInput[] = checks.map((c) => ({
    status: c.status,
    priority: c.priority,
    releaseBlocker: c.releaseBlocker,
    evidenceRequired: true,
    verificationType: "SEO_GATED",
    module: c.module,
    evidenceCount: c.evidence?.length ?? 0,
  }));
  return openRiskCounts(release, inputs);
}
