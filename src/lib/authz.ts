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

export function canEditCheck(user: AuthUser, check: CheckAuthzInput): boolean {
  if (!user.isActive) return false;
  if (isOperationalEditor(user)) return true;
  if (user.role === Role.MANAGEMENT) return false;
  if (user.role === Role.TEAM_MEMBER) {
    return Boolean(user.teamId && user.teamId === check.ownerTeamId);
  }
  return false;
}

export function canAddEvidence(user: AuthUser, check: CheckAuthzInput): boolean {
  return canEditCheck(user, check);
}

export function canSubmitReview(user: AuthUser, check: CheckAuthzInput): boolean {
  return canEditCheck(user, check);
}

export function canReviewCheck(user: AuthUser, check: CheckAuthzInput): boolean {
  if (!user.isActive) return false;
  if (user.role === Role.MANAGEMENT) return false;
  if (isSeoGovernor(user)) return true;
  if (user.role === Role.PROJECT_MANAGER) {
    return check.verificationType !== VerificationType.SEO_GATED;
  }
  if (check.reviewerUserId && check.reviewerUserId === user.id) return true;
  if (check.verificationType === VerificationType.SELF) {
    return Boolean(user.teamId && user.teamId === check.ownerTeamId);
  }
  return false;
}

export function canPassCheck(user: AuthUser, check: CheckAuthzInput): boolean {
  if (!canReviewCheck(user, check)) return false;
  if (check.verificationType === VerificationType.SEO_GATED) {
    return isSeoGovernor(user);
  }
  return true;
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
