import { CheckStatus } from "@prisma/client";
import type { AuthUser } from "@/lib/authz";

const COMPLETED: CheckStatus[] = [
  CheckStatus.PASS,
  CheckStatus.NA,
  CheckStatus.WAIVED,
  CheckStatus.REMOVED_FROM_SCOPE,
];

// Archived releases (and archived projects) are out of every working list.
const LIVE_RELEASE = { archived: false, project: { archived: false } };

/** Existing ownership: personal owner, else team-owned unassigned work. */
export function assignedCheckWhere(user: AuthUser) {
  const open = { status: { notIn: COMPLETED }, release: LIVE_RELEASE };
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
    return { ownerTeamId: user.teamId, status: { not: CheckStatus.REMOVED_FROM_SCOPE }, release: LIVE_RELEASE };
  }
  return { ownerUserId: user.id, status: { not: CheckStatus.REMOVED_FROM_SCOPE }, release: LIVE_RELEASE };
}
