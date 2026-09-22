import { CheckStatus, Role, VerificationType } from "@prisma/client";
import { isSeoGovernor, type AuthUser, type CheckAuthzInput } from "@/lib/authz";

export type ReviewQueueCheck = CheckAuthzInput & { status: CheckStatus };

export function isPendingReviewFor(user: AuthUser, check: ReviewQueueCheck): boolean {
  if (check.status !== CheckStatus.REVIEW) return false;
  if (user.role === Role.MANAGEMENT) return false;
  if (user.role === Role.SYSTEM_ADMIN) return true;
  if (check.verificationType === VerificationType.SEO_GATED) {
    return isSeoGovernor(user);
  }
  if (check.verificationType === VerificationType.CROSS_TEAM) {
    return check.reviewerUserId === user.id;
  }
  if (check.verificationType === VerificationType.SELF) {
    if (user.role === Role.SEO_LEAD) return false;
    if (check.reviewerUserId === user.id) return true;
    return user.role === Role.TEAM_MEMBER && Boolean(user.teamId && user.teamId === check.ownerTeamId);
  }
  return false;
}
