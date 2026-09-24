import { Role, TeamKey, VerificationType, type User } from "@prisma/client";

export type AuthUser = Pick<User, "id" | "role" | "teamId" | "isActive"> & {
  teamKey?: TeamKey | null;
};

export type CheckAuthzInput = {
  ownerUserId: string | null;
  ownerTeamId: string;
  ownerTeamKey: TeamKey;
  reviewerUserId: string | null;
  verificationType: VerificationType;
};

export function isSeoGovernor(user: AuthUser): boolean {
  return user.role === Role.SEO_LEAD || user.role === Role.SYSTEM_ADMIN;
}

export function isOperationalEditor(user: AuthUser): boolean {
  return (
    user.role === Role.SEO_LEAD ||
    user.role === Role.PROJECT_MANAGER ||
    user.role === Role.SYSTEM_ADMIN
  );
}

export function canViewRelease(_user: AuthUser): boolean {
  return _user.isActive;
}

// Implementation actions (start, evidence, submit) belong to the owner team.
// SEO and PM coordinate (owner/reviewer/priority/block/reopen/waive) but do not implement
// another team's work; System Admin keeps its administrative override.
export function canEditCheck(user: AuthUser, check: CheckAuthzInput): boolean {
  if (!user.isActive) return false;
  if (user.role === Role.SYSTEM_ADMIN) return true;
  if (user.role === Role.MANAGEMENT || user.role === Role.PROJECT_MANAGER) return false;
  return Boolean(user.teamId && user.teamId === check.ownerTeamId);
}

export function canAddEvidence(user: AuthUser, check: CheckAuthzInput): boolean {
  return canEditCheck(user, check);
}

export function canSubmitReview(user: AuthUser, check: CheckAuthzInput): boolean {
  return canEditCheck(user, check);
}

function isOwnerTeamMember(user: AuthUser, check: CheckAuthzInput): boolean {
  return Boolean(user.teamId && user.teamId === check.ownerTeamId);
}

// Approval authority comes from the check's verification contract, not from a broad role:
// - SELF: the owner team only (its assigned reviewer is an owner-team member).
// - CROSS_TEAM: only the assigned reviewer, and never someone from the owner team.
// - SEO_GATED: the SEO Lead; the implementation team never approves its own work.
//   (SEO-owned SEO_GATED standards are verified by the SEO Lead — approved exception.)
// PM and SEO have no universal review privilege. System Admin keeps its override.
export function canReviewCheck(user: AuthUser, check: CheckAuthzInput): boolean {
  if (!user.isActive) return false;
  if (user.role === Role.MANAGEMENT) return false;
  if (user.role === Role.SYSTEM_ADMIN) return true;
  if (check.verificationType === VerificationType.SEO_GATED) {
    return user.role === Role.SEO_LEAD;
  }
  if (check.verificationType === VerificationType.CROSS_TEAM) {
    return Boolean(check.reviewerUserId && check.reviewerUserId === user.id) && !isOwnerTeamMember(user, check);
  }
  // SELF (Ekip İçi Onay): verified inside the owner team only.
  return isOwnerTeamMember(user, check);
}

export function canPassCheck(user: AuthUser, check: CheckAuthzInput): boolean {
  return canReviewCheck(user, check);
}

export function canFailCheck(user: AuthUser, check: CheckAuthzInput): boolean {
  return canReviewCheck(user, check);
}

export function canReopenCheck(user: AuthUser): boolean {
  return isOperationalEditor(user);
}

export function canChangeOwner(user: AuthUser): boolean {
  return isOperationalEditor(user);
}

export function canChangeReviewer(user: AuthUser): boolean {
  return isOperationalEditor(user);
}

export function canChangePriority(user: AuthUser): boolean {
  return isOperationalEditor(user);
}

export function canWaiveCheck(user: AuthUser): boolean {
  return user.role === Role.SEO_LEAD || user.role === Role.SYSTEM_ADMIN || user.role === Role.PROJECT_MANAGER;
}

export function canMarkNa(user: AuthUser, priorityIsP0: boolean): boolean {
  if (priorityIsP0) return isOperationalEditor(user);
  return canEditCheck(user, {
    ownerUserId: user.id,
    ownerTeamId: user.teamId ?? "",
    ownerTeamKey: user.teamKey ?? TeamKey.SEO,
    reviewerUserId: null,
    verificationType: VerificationType.SELF,
  }) || isOperationalEditor(user);
}

export function canMarkDeployed(user: AuthUser): boolean {
  return user.role === Role.PROJECT_MANAGER || user.role === Role.SEO_LEAD || user.role === Role.SYSTEM_ADMIN;
}

export function canCreateProject(user: AuthUser): boolean {
  return isOperationalEditor(user);
}

export function canCreateRelease(user: AuthUser): boolean {
  return isOperationalEditor(user);
}

// “+ Yeni Sorun”: newly discovered issues are opened by SEO Lead, PM or System Admin.
// Team members work on assigned checks; Management stays read-only.
export function canCreateAdHocIssue(user: AuthUser): boolean {
  return user.isActive && isOperationalEditor(user);
}

export function canManageTemplates(user: AuthUser): boolean {
  return user.role === Role.SEO_LEAD || user.role === Role.SYSTEM_ADMIN || user.role === Role.PROJECT_MANAGER;
}

export function canManageSystem(user: AuthUser): boolean {
  return user.role === Role.SYSTEM_ADMIN;
}

export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
