import { CheckStatus } from "@prisma/client";
import type { AuthUser } from "@/lib/authz";

const COMPLETED: CheckStatus[] = [
  CheckStatus.PASS,
  CheckStatus.NA,
  CheckStatus.WAIVED,
  CheckStatus.REMOVED_FROM_SCOPE,
];

/** Existing ownership: personal owner, else team-owned unassigned work. */
export function assignedCheckWhere(user: AuthUser) {
  const open = { status: { notIn: COMPLETED } };
  if (user.teamId) {
    return {
      ...open,
      OR: [{ ownerUserId: user.id }, { ownerTeamId: user.teamId, ownerUserId: null }],
    };
  }
  return { ...open, ownerUserId: user.id };
}

export function assignedTeamWhere(user: AuthUser) {
  if (user.teamId) {
    return { ownerTeamId: user.teamId, status: { not: CheckStatus.REMOVED_FROM_SCOPE } };
  }
  return { ownerUserId: user.id, status: { not: CheckStatus.REMOVED_FROM_SCOPE } };
}
