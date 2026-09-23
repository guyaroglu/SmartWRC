import { CheckStatus } from "@prisma/client";

/**
 * Presentation-only release/team progress.
 * Formula: completed applicable / total applicable
 *   completed = PASS
 *   excluded from denominator = NA, REMOVED_FROM_SCOPE
 *   every other status = incomplete
 * Gate logic must not use this percentage.
 */
export type ProgressInput = { status: CheckStatus };

export type ProgressResult = {
  completed: number;
  total: number;
  percent: number;
};

const EXCLUDED: CheckStatus[] = [CheckStatus.NA, CheckStatus.REMOVED_FROM_SCOPE];

export function isProgressApplicable(status: CheckStatus): boolean {
  return !EXCLUDED.includes(status);
}

export function isProgressComplete(status: CheckStatus): boolean {
  return status === CheckStatus.PASS;
}

export function calculateProgress(checks: ProgressInput[]): ProgressResult {
  const applicable = checks.filter((c) => isProgressApplicable(c.status));
  const completed = applicable.filter((c) => isProgressComplete(c.status)).length;
  const total = applicable.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export function progressLabel(progress: ProgressResult): string {
  if (progress.total === 0) return "—";
  return `${progress.percent}%`;
}
