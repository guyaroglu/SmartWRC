import { CheckStatus, Role } from "@prisma/client";
import { canReviewCheck, type AuthUser, type CheckAuthzInput } from "@/lib/authz";

export type ReviewQueueCheck = CheckAuthzInput & { status: CheckStatus };

// A review lands in someone's Onaylar queue only if the verification contract makes them
// the verifier. System Admin keeps an overview of every pending review.
export function isPendingReviewFor(user: AuthUser, check: ReviewQueueCheck): boolean {
  if (check.status !== CheckStatus.REVIEW) return false;
  if (user.role === Role.MANAGEMENT) return false;
  if (user.role === Role.SYSTEM_ADMIN) return true;
  return canReviewCheck(user, check);
}
