import { CheckStatus, Priority, VerificationType } from "@prisma/client";

const ALLOWED: Record<CheckStatus, CheckStatus[]> = {
  [CheckStatus.NOT_STARTED]: [CheckStatus.IN_PROGRESS, CheckStatus.BLOCKED, CheckStatus.NA, CheckStatus.WAIVED],
  [CheckStatus.IN_PROGRESS]: [CheckStatus.REVIEW, CheckStatus.BLOCKED, CheckStatus.NA, CheckStatus.WAIVED],
  [CheckStatus.REVIEW]: [CheckStatus.PASS, CheckStatus.FAIL, CheckStatus.BLOCKED],
  [CheckStatus.FAIL]: [CheckStatus.IN_PROGRESS],
  [CheckStatus.BLOCKED]: [CheckStatus.IN_PROGRESS],
  [CheckStatus.PASS]: [CheckStatus.IN_PROGRESS],
  [CheckStatus.NA]: [CheckStatus.IN_PROGRESS],
  [CheckStatus.WAIVED]: [CheckStatus.IN_PROGRESS],
  [CheckStatus.DONE_NEEDS_VERIFICATION]: [CheckStatus.REVIEW, CheckStatus.IN_PROGRESS],
  [CheckStatus.REMOVED_FROM_SCOPE]: [],
};

export function canTransition(from: CheckStatus, to: CheckStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertTransition(from: CheckStatus, to: CheckStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal status transition: ${from} → ${to}`);
  }
}

export function requiresSeoToPass(verificationType: VerificationType): boolean {
  return verificationType === VerificationType.SEO_GATED;
}

export function isP0orP1(priority: Priority): boolean {
  return priority === Priority.P0 || priority === Priority.P1;
}
