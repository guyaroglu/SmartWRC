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
  foundByUserId?: string | null;
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

// Evidence (add only — nobody edits or deletes someone else's): the reporter adds the finding's
// source, the assigned person in the owner team (anyone in it while the task is team-owned) adds fix
// proof, and the effective reviewer adds verification proof. Management never; Admin override kept.
// Approval rights are unchanged (canReviewCheck).
export function canAddEvidence(user: AuthUser, check: CheckAuthzInput): boolean {
  if (!user.isActive || user.role === Role.MANAGEMENT) return false;
  if (user.role === Role.SYSTEM_ADMIN) return true;
  if (check.foundByUserId && check.foundByUserId === user.id) return true;
  if (isOwnerTeamMember(user, check) && (!check.ownerUserId || check.ownerUserId === user.id)) return true;
  return canReviewCheck(user, check);
}

export function canSubmitReview(user: AuthUser, check: CheckAuthzInput): boolean {
  return canEditCheck(user, check);
}

function isOwnerTeamMember(user: AuthUser, check: CheckAuthzInput): boolean {
  return Boolean(user.teamId && user.teamId === check.ownerTeamId);
}

// Approval authority (PASS / request changes), enforced server-side:
// - Work owned by Frontend, Backend, Network or Content: the SEO Lead is the only technical
//   approver, whatever the verification type (Gökhan, 2026-10-01; supersedes §116 SELF/CROSS_TEAM
//   for these teams).
// - SEO-owned work keeps its contract: SEO_GATED → SEO Lead, CROSS_TEAM → assigned reviewer
//   outside the SEO team, SELF → SEO team.
// - PM and Management never approve a task. System Admin keeps its administrative override.
// Task approval is not release readiness: the release decision stays calculated by the gate.
export function canReviewCheck(user: AuthUser, check: CheckAuthzInput): boolean {
  if (!user.isActive) return false;
  if (user.role === Role.SYSTEM_ADMIN) return true;
  if (user.role === Role.MANAGEMENT || user.role === Role.PROJECT_MANAGER) return false;
  if (check.ownerTeamKey !== TeamKey.SEO) return user.role === Role.SEO_LEAD;
  if (check.verificationType === VerificationType.SEO_GATED) return user.role === Role.SEO_LEAD;
  if (check.verificationType === VerificationType.CROSS_TEAM) {
    return Boolean(check.reviewerUserId && check.reviewerUserId === user.id) && !isOwnerTeamMember(user, check);
  }
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

// WAIVED / NA close a task without technical approval, so the final decision is SEO's for every
// task (§117, 2026-10-01) — otherwise PM could bypass the SEO review. PM and Management never;
// System Admin override kept.
export function canWaiveCheck(user: AuthUser): boolean {
  return user.isActive && isSeoGovernor(user);
}

export function canMarkNa(user: AuthUser): boolean {
  return user.isActive && isSeoGovernor(user);
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
