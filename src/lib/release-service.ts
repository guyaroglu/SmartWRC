import {
  CheckSource,
  CheckStatus,
  DeploymentStatus,
  DomainKey,
  EvidenceType,
  GateStatus,
  ModuleKey,
  OnboardingType,
  Priority,
  Role,
  TeamKey,
  VerificationType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { assertReadyNotUserSet, calculateGate, openRiskCounts, type GateCheckInput } from "@/lib/gate";
import {
  assert,
  canChangeOwner,
  canChangePriority,
  canChangeReviewer,
  canCreateAdHocIssue,
  canCreateProject,
  canCreateRelease,
  canEditCheck,
  canFailCheck,
  canPassCheck,
  canReopenCheck,
  canSubmitReview,
  canWaiveCheck,
  type AuthUser,
} from "@/lib/authz";
import { assertTransition } from "@/lib/workflow";
import {
  canCompleteProductionVerification,
  canEmergencyDeploy,
  canMarkAsDeployed,
  canReopenVerifiedRelease,
  canStartPostLaunchVerification,
  isProductionLocked,
} from "@/lib/lifecycle";

async function loadCheck(checkId: string) {
  const check = await prisma.releaseCheck.findUnique({
    where: { id: checkId },
    include: {
      ownerTeam: true,
      evidence: true,
      release: { include: { checks: { include: { evidence: true } } } },
    },
  });
  if (!check) throw new Error("Check not found");
  return check;
}

function checkAuthzInput(check: Awaited<ReturnType<typeof loadCheck>>) {
  return {
    ownerUserId: check.ownerUserId,
    ownerTeamId: check.ownerTeamId,
    ownerTeamKey: check.ownerTeam.key,
    reviewerUserId: check.reviewerUserId,
    verificationType: check.verificationType,
  };
}

function assertReleaseWritable(release: { deploymentStatus: DeploymentStatus }) {
  if (isProductionLocked(release)) {
    throw new Error("PRODUCTION_VERIFIED release is locked. Reopen Release is required.");
  }
}

function toGateChecks(
  checks: { status: CheckStatus; priority: Priority; releaseBlocker: boolean; evidenceRequired: boolean; verificationType: VerificationType; module: ModuleKey; evidence: { id: string }[] }[],
): GateCheckInput[] {
  return checks.map((c) => ({
    status: c.status,
    priority: c.priority,
    releaseBlocker: c.releaseBlocker,
    evidenceRequired: c.evidenceRequired,
    verificationType: c.verificationType,
    module: c.module,
    evidenceCount: c.evidence.length,
  }));
}

async function recalcGate(releaseId: string) {
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: { checks: { include: { evidence: true } } },
  });
  if (!release) throw new Error("Release not found");
  if (release.archived) return release.gateStatus;

  const next = calculateGate(
    {
      onboardingType: release.onboardingType,
      baselineCompleted: release.baselineCompleted,
      deploymentStatus: release.deploymentStatus,
    },
    toGateChecks(release.checks),
  );
  assertReadyNotUserSet(next, release.gateStatus, "engine");
  const risks = openRiskCounts(
    {
      onboardingType: release.onboardingType,
      baselineCompleted: release.baselineCompleted,
      deploymentStatus: release.deploymentStatus,
    },
    toGateChecks(release.checks),
  );
  if (next === GateStatus.READY && risks.p0 > 0) {
    throw new Error("Gate engine invariant violated: READY with open blocking P0");
  }

  if (next !== release.gateStatus) {
    await prisma.release.update({
      where: { id: releaseId },
      data: { gateStatus: next },
    });
    await writeAudit({
      entityType: "Release",
      entityId: releaseId,
      action: "GATE_RECALCULATED",
      oldValue: release.gateStatus,
      newValue: next,
    });
  }
  return next;
}

export async function createProject(user: AuthUser, name: string) {
  assert(canCreateProject(user), "Not allowed to create project");
  const project = await prisma.project.create({
    data: { name: name.trim(), createdById: user.id },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "Project",
    entityId: project.id,
    action: "CREATED",
    newValue: { name: project.name },
  });
  return project;
}

export async function createReleaseFromTemplate(input: {
  user: AuthUser;
  projectId: string;
  name: string;
  templateVersionId: string;
  modules: ModuleKey[];
  targetDate?: Date;
  onboardingType?: OnboardingType;
}) {
  assert(canCreateRelease(input.user), "Not allowed to create release");
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    include: { teamAssignments: true },
  });
  if (!project || project.archived) throw new Error("Project not found");

  const version = await prisma.templateVersion.findUnique({
    where: { id: input.templateVersionId },
    include: { controls: true },
  });
  if (!version) throw new Error("Template version not found");

  const teams = await prisma.team.findMany();
  const teamByKey = new Map(teams.map((t) => [t.key, t]));
  // Reviewer comes from the control's catalogue definition (defaultReviewerRole), never from
  // a hard-coded “CROSS_TEAM = SEO” rule. SELF is verified inside the owner team.
  const reviewerByRole = new Map<Role, { id: string; teamId: string | null } | null>();
  async function reviewerForRole(role: Role | null) {
    if (!role) return null;
    if (!reviewerByRole.has(role)) {
      const u = await prisma.user.findFirst({ where: { role, isActive: true }, orderBy: { createdAt: "asc" } });
      reviewerByRole.set(role, u ? { id: u.id, teamId: u.teamId } : null);
    }
    return reviewerByRole.get(role) ?? null;
  }

  const selected = new Set(input.modules);
  const applicable = version.controls.filter(
    (c) => selected.has(c.module) || c.applicableModules.some((m) => selected.has(m)),
  );

  const unique = new Map(applicable.map((c) => [c.controlCode, c]));
  for (const control of unique.values()) await reviewerForRole(control.defaultReviewerRole);

  const release = await prisma.$transaction(async (tx) => {
    const created = await tx.release.create({
      data: {
        projectId: project.id,
        name: input.name.trim(),
        templateVersionId: version.id,
        targetDate: input.targetDate,
        onboardingType: input.onboardingType ?? OnboardingType.NEW,
        baselineCompleted: (input.onboardingType ?? OnboardingType.NEW) === OnboardingType.NEW,
        baselineAt: (input.onboardingType ?? OnboardingType.NEW) === OnboardingType.NEW ? new Date() : null,
        activatedAt: new Date(),
        createdById: input.user.id,
        scopes: { create: [...selected].map((module) => ({ module })) },
        teamAssignments: {
          create: project.teamAssignments.map((a) => ({
            teamId: a.teamId,
            userId: a.userId,
          })),
        },
      },
    });

    for (const control of unique.values()) {
      const ownerTeam = teamByKey.get(control.ownerTeamKey);
      if (!ownerTeam) continue;
      const assignment = project.teamAssignments.find((a) => a.teamId === ownerTeam.id);
      const defaultReviewer =
        control.verificationType === VerificationType.SELF ? null : await reviewerForRole(control.defaultReviewerRole);
      // CROSS_TEAM invariant: the reviewer never belongs to the owner team. If a catalogue
      // entry resolves to an owner-team reviewer, leave it unassigned for PM/Admin to set.
      const reviewerId =
        control.verificationType === VerificationType.SELF
          ? assignment?.userId ?? null
          : control.verificationType === VerificationType.CROSS_TEAM && defaultReviewer?.teamId === ownerTeam.id
            ? null
            : defaultReviewer?.id ?? null;

      await tx.releaseCheck.create({
        data: {
          releaseId: created.id,
          controlCode: control.controlCode,
          title: control.title,
          description: control.description,
          ownerTeamId: ownerTeam.id,
          ownerUserId: assignment?.userId ?? null,
          reviewerUserId: reviewerId,
          domains: control.domains,
          priority: control.priority,
          verificationType: control.verificationType,
          releaseBlocker: control.releaseBlocker || control.priority === Priority.P0,
          evidenceRequired: control.evidenceRequired,
          whyItMatters: control.whyItMatters,
          expectedResult: control.expectedResult,
          howToCheck: control.howToCheck,
          howToFix: control.howToFix,
          escalationRule: control.escalationRule,
          lifecyclePhase: control.lifecyclePhase,
          module: control.module,
          checkpoint: control.checkpoint,
          templateControlSnapshot: {
            controlCode: control.controlCode,
            title: control.title,
            description: control.description,
            ownerTeamKey: control.ownerTeamKey,
            domains: control.domains,
            priority: control.priority,
            verificationType: control.verificationType,
            releaseBlocker: control.releaseBlocker,
            evidenceRequired: control.evidenceRequired,
            whyItMatters: control.whyItMatters,
            expectedResult: control.expectedResult,
            howToCheck: control.howToCheck,
            howToFix: control.howToFix,
            escalationRule: control.escalationRule,
            lifecyclePhase: control.lifecyclePhase,
            module: control.module,
            version: version.version,
          },
        },
      });
    }

    return created;
  });

  await writeAudit({
    actorId: input.user.id,
    entityType: "Release",
    entityId: release.id,
    action: "CREATED",
    newValue: { name: release.name, modules: input.modules },
  });

  await recalcGate(release.id);
  return prisma.release.findUniqueOrThrow({ where: { id: release.id } });
}

const MODULE_BY_TEAM: Record<TeamKey, ModuleKey> = {
  [TeamKey.BACKEND]: ModuleKey.BACKEND,
  [TeamKey.FRONTEND]: ModuleKey.FRONTEND,
  [TeamKey.NETWORK]: ModuleKey.NETWORK,
  [TeamKey.CONTENT]: ModuleKey.CONTENT,
  [TeamKey.SEO]: ModuleKey.SEO,
};

export type AdHocIssueInput = {
  releaseId: string;
  title: string;
  description?: string;
  domains: DomainKey[];
  ownerTeamKey: TeamKey;
  priority: Priority;
  verificationType: VerificationType;
  /** Required for CROSS_TEAM: the assigned verifier (must not belong to the owner team). */
  reviewerUserId?: string | null;
  evidence?: { type: EvidenceType; body: string } | null;
};

/**
 * “+ Yeni Sorun”: add a newly discovered issue to an editable release as an ordinary
 * ReleaseCheck (source AD_HOC). Found By is always the authenticated creator; the owner
 * team does the work. The creation snapshot is frozen in templateControlSnapshot.
 */
export async function createAdHocCheck(user: AuthUser, input: AdHocIssueInput) {
  assert(canCreateAdHocIssue(user), "Not allowed to create ad-hoc issue");
  const title = input.title.trim();
  if (!title) throw new Error("Ad-hoc issue requires a title");
  if (!input.domains.length) throw new Error("Ad-hoc issue requires an affected domain");

  const release = await prisma.release.findUnique({
    where: { id: input.releaseId },
    include: { teamAssignments: true, project: { include: { teamAssignments: true } } },
  });
  if (!release || release.archived) throw new Error("Release not found");
  assertReleaseWritable(release);

  const ownerTeam = await prisma.team.findUnique({ where: { key: input.ownerTeamKey } });
  if (!ownerTeam) throw new Error("Owner team not found");
  const assignment =
    release.teamAssignments.find((a) => a.teamId === ownerTeam.id) ??
    release.project.teamAssignments.find((a) => a.teamId === ownerTeam.id);

  let reviewerUserId: string | null;
  if (input.verificationType === VerificationType.SELF) {
    reviewerUserId = assignment?.userId ?? null;
  } else if (input.verificationType === VerificationType.SEO_GATED) {
    const seo = await prisma.user.findFirst({ where: { role: Role.SEO_LEAD, isActive: true }, orderBy: { createdAt: "asc" } });
    reviewerUserId = seo?.id ?? null;
  } else {
    if (!input.reviewerUserId) throw new Error("CROSS_TEAM requires an assigned reviewer");
    const reviewer = await prisma.user.findUnique({ where: { id: input.reviewerUserId } });
    if (!reviewer || !reviewer.isActive || reviewer.role === Role.MANAGEMENT) {
      throw new Error("CROSS_TEAM reviewer is not a valid active user");
    }
    if (reviewer.teamId && reviewer.teamId === ownerTeam.id) {
      throw new Error("CROSS_TEAM reviewer must not belong to the owner team");
    }
    reviewerUserId = reviewer.id;
  }

  const existingCodes = await prisma.releaseCheck.count({
    where: { releaseId: release.id, source: CheckSource.AD_HOC },
  });
  let seq = existingCodes + 1;
  let controlCode = `ADH-${String(seq).padStart(3, "0")}`;
  while (await prisma.releaseCheck.findFirst({ where: { releaseId: release.id, controlCode } })) {
    seq += 1;
    controlCode = `ADH-${String(seq).padStart(3, "0")}`;
  }

  const description = input.description?.trim() || title;
  const releaseBlocker = input.priority === Priority.P0;
  const createdAt = new Date();
  const sop = {
    whyItMatters: `Yayın sırasında tespit edilen sorun: ${description}`,
    expectedResult: `Sorun giderilmiş olmalı: ${title}`,
    howToCheck: "Sorunun tespit edildiği yerde yeniden kontrol et ve düzeltmeyi kanıtla (URL, ekran görüntüsü bağlantısı veya açıklama).",
    howToFix: description,
    escalationRule: "Sorumlu ekip çözemiyorsa veya sahiplik yanlışsa PM'e bildir.",
  };
  const lifecyclePhase = release.deploymentStatus === DeploymentStatus.NOT_DEPLOYED ? "PRE_LAUNCH" : "POST_LAUNCH";

  const check = await prisma.$transaction(async (tx) => {
    const created = await tx.releaseCheck.create({
      data: {
        releaseId: release.id,
        controlCode,
        source: CheckSource.AD_HOC,
        title,
        description,
        ownerTeamId: ownerTeam.id,
        ownerUserId: assignment?.userId ?? null,
        reviewerUserId,
        domains: input.domains,
        priority: input.priority,
        verificationType: input.verificationType,
        releaseBlocker,
        evidenceRequired: true,
        foundByUserId: user.id,
        foundByTeamId: user.teamId ?? null,
        ...sop,
        lifecyclePhase,
        module: MODULE_BY_TEAM[input.ownerTeamKey],
        templateControlSnapshot: {
          source: CheckSource.AD_HOC,
          controlCode,
          title,
          description,
          ownerTeamKey: input.ownerTeamKey,
          domains: input.domains,
          priority: input.priority,
          verificationType: input.verificationType,
          releaseBlocker,
          evidenceRequired: true,
          reviewerUserId,
          foundByUserId: user.id,
          foundByTeamId: user.teamId ?? null,
          createdById: user.id,
          createdAt: createdAt.toISOString(),
          ...sop,
          lifecyclePhase,
        },
      },
    });
    if (input.evidence?.body.trim()) {
      await tx.evidence.create({
        data: { checkId: created.id, type: input.evidence.type, body: input.evidence.body.trim(), createdById: user.id },
      });
    }
    return created;
  });

  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: check.id,
    action: "CREATED",
    newValue: {
      source: CheckSource.AD_HOC,
      controlCode,
      releaseId: release.id,
      ownerTeamKey: input.ownerTeamKey,
      priority: input.priority,
      verificationType: input.verificationType,
      reviewerUserId,
      foundByUserId: user.id,
      createdAt: createdAt.toISOString(),
    },
  });
  if (input.evidence?.body.trim()) {
    await writeAudit({
      actorId: user.id,
      entityType: "ReleaseCheck",
      entityId: check.id,
      action: "EVIDENCE_ADDED",
      newValue: { type: input.evidence.type, body: input.evidence.body.trim() },
    });
  }
  await recalcGate(release.id);
  return check;
}

export async function startCheck(user: AuthUser, checkId: string) {
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  assert(canEditCheck(user, checkAuthzInput(check)), "Not allowed to edit this check");
  if (check.status === CheckStatus.IN_PROGRESS) return check;
  assertTransition(check.status, CheckStatus.IN_PROGRESS);
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: { status: CheckStatus.IN_PROGRESS },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "STATUS_CHANGED",
    oldValue: check.status,
    newValue: CheckStatus.IN_PROGRESS,
  });
  await recalcGate(check.releaseId);
  return updated;
}

export async function addEvidence(
  user: AuthUser,
  checkId: string,
  input: { type: "URL" | "TEXT" | "SCREENSHOT" | "FILE" | "EXTERNAL_TICKET" | "TEST_RESULT"; body: string },
) {
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  assert(canEditCheck(user, checkAuthzInput(check)), "Not allowed to add evidence");
  const evidence = await prisma.evidence.create({
    data: {
      checkId,
      type: input.type,
      body: input.body.trim(),
      createdById: user.id,
    },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "EVIDENCE_ADDED",
    newValue: { type: input.type, body: input.body },
  });
  await recalcGate(check.releaseId);
  return evidence;
}

export async function submitForReview(user: AuthUser, checkId: string) {
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  assert(canSubmitReview(user, checkAuthzInput(check)), "Not allowed to submit this check");
  if (check.status === CheckStatus.REVIEW) return check;
  if (check.evidenceRequired && check.evidence.length === 0) {
    throw new Error("Required evidence is missing");
  }
  let current = check.status;
  if (current === CheckStatus.FAIL) {
    assertTransition(CheckStatus.FAIL, CheckStatus.IN_PROGRESS);
    await prisma.releaseCheck.update({
      where: { id: checkId },
      data: { status: CheckStatus.IN_PROGRESS },
    });
    current = CheckStatus.IN_PROGRESS;
  }
  assertTransition(current, CheckStatus.REVIEW);
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: { status: CheckStatus.REVIEW },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "STATUS_CHANGED",
    oldValue: check.status,
    newValue: CheckStatus.REVIEW,
  });
  await recalcGate(check.releaseId);
  return updated;
}

export async function failCheck(user: AuthUser, checkId: string, reason: string) {
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  assert(canFailCheck(user, checkAuthzInput(check)), "Not allowed to fail this check");
  assertTransition(check.status, CheckStatus.FAIL);
  if (!reason.trim()) throw new Error("Fail reason is required");
  const actor = await prisma.user.findUnique({ where: { id: user.id } });
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: {
      status: CheckStatus.FAIL,
      failNote: reason.trim(),
      foundByUserId: check.foundByUserId ?? user.id,
      foundByTeamId: check.foundByTeamId ?? actor?.teamId ?? null,
    },
  });
  await prisma.review.create({
    data: {
      checkId,
      actorId: user.id,
      decision: CheckStatus.FAIL,
      reason: reason.trim(),
    },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "STATUS_CHANGED",
    oldValue: check.status,
    newValue: CheckStatus.FAIL,
    reason,
  });
  await recalcGate(check.releaseId);
  return updated;
}

export async function passCheck(user: AuthUser, checkId: string) {
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  assert(canPassCheck(user, checkAuthzInput(check)), "Not allowed to pass this check");
  if (check.status === CheckStatus.PASS) return check;
  assertTransition(check.status, CheckStatus.PASS);
  if (check.verificationType === VerificationType.SEO_GATED && user.role !== Role.SEO_LEAD && user.role !== Role.SYSTEM_ADMIN) {
    throw new Error("SEO_GATED checks require SEO verification");
  }
  if (check.evidenceRequired && check.evidence.length === 0) {
    throw new Error("Required evidence is missing");
  }
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: {
      status: CheckStatus.PASS,
      verifiedAt: new Date(),
      completedAt: new Date(),
    },
  });
  await prisma.review.create({
    data: {
      checkId,
      actorId: user.id,
      decision: CheckStatus.PASS,
    },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "STATUS_CHANGED",
    oldValue: check.status,
    newValue: CheckStatus.PASS,
  });
  await recalcGate(check.releaseId);
  return updated;
}

export async function blockCheck(user: AuthUser, checkId: string, blockedBy: string, reason: string) {
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  assert(canEditCheck(user, checkAuthzInput(check)) || canChangeOwner(user), "Not allowed to block");
  if (!reason.trim()) throw new Error("BLOCKED requires a reason");
  if (!blockedBy) throw new Error("BLOCKED requires Blocked By");
  assertTransition(check.status, CheckStatus.BLOCKED);
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: { status: CheckStatus.BLOCKED, blockedBy: blockedBy as never, blockReason: reason.trim() },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "STATUS_CHANGED",
    oldValue: check.status,
    newValue: CheckStatus.BLOCKED,
    reason,
  });
  await recalcGate(check.releaseId);
  return updated;
}

export async function waiveCheck(user: AuthUser, checkId: string, reason: string, risk: string) {
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  assert(canWaiveCheck(user), "Not allowed to waive");
  if (!reason.trim() || !risk.trim()) throw new Error("WAIVED requires reason and risk explanation");
  assertTransition(check.status, CheckStatus.WAIVED);
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: {
      status: CheckStatus.WAIVED,
      waiveReason: reason.trim(),
      waiveRisk: risk.trim(),
      waivedById: user.id,
      waivedAt: new Date(),
    },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "STATUS_CHANGED",
    oldValue: check.status,
    newValue: CheckStatus.WAIVED,
    reason,
  });
  await recalcGate(check.releaseId);
  return updated;
}

export async function changeOwner(user: AuthUser, checkId: string, ownerUserId: string, reason: string) {
  assert(canChangeOwner(user), "Not allowed to change owner");
  const owner = await prisma.user.findUnique({ where: { id: ownerUserId }, include: { team: true } });
  if (!owner?.teamId) throw new Error("Owner must belong to a team");
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: { ownerUserId: owner.id, ownerTeamId: owner.teamId },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "OWNER_CHANGED",
    oldValue: { ownerUserId: check.ownerUserId, ownerTeamId: check.ownerTeamId },
    newValue: { ownerUserId: owner.id, ownerTeamId: owner.teamId },
    reason,
  });
  return updated;
}

export async function changeReviewer(user: AuthUser, checkId: string, reviewerUserId: string, reason: string) {
  assert(canChangeReviewer(user), "Not allowed to change reviewer");
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: { reviewerUserId },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "REVIEWER_CHANGED",
    oldValue: check.reviewerUserId ?? undefined,
    newValue: reviewerUserId,
    reason,
  });
  return updated;
}

export async function changePriority(user: AuthUser, checkId: string, priority: Priority, reason: string) {
  assert(canChangePriority(user), "Not allowed to change priority");
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: { priority, releaseBlocker: priority === Priority.P0 || check.releaseBlocker },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "PRIORITY_CHANGED",
    oldValue: check.priority,
    newValue: priority,
    reason,
  });
  await recalcGate(check.releaseId);
  return updated;
}

export async function reopenCheck(user: AuthUser, checkId: string, reason: string) {
  assert(canReopenCheck(user), "Not allowed to reopen");
  const check = await loadCheck(checkId);
  assertReleaseWritable(check.release);
  assertTransition(check.status, CheckStatus.IN_PROGRESS);
  const updated = await prisma.releaseCheck.update({
    where: { id: checkId },
    data: { status: CheckStatus.IN_PROGRESS, verifiedAt: null, completedAt: null },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "ReleaseCheck",
    entityId: checkId,
    action: "REOPENED",
    oldValue: check.status,
    newValue: CheckStatus.IN_PROGRESS,
    reason,
  });
  await recalcGate(check.releaseId);
  return updated;
}

export async function reopenRelease(user: AuthUser, releaseId: string, reason: string) {
  const release = await prisma.release.findUnique({ where: { id: releaseId } });
  if (!release) throw new Error("Release not found");
  assert(canReopenVerifiedRelease(user, release), "Not allowed to reopen this release");
  if (!reason.trim()) throw new Error("Reopen Release requires a reason");
  const updated = await prisma.release.update({
    where: { id: releaseId },
    data: {
      deploymentStatus: DeploymentStatus.POST_LAUNCH_VERIFYING,
      reopenedAt: new Date(),
      reopenedById: user.id,
      reopenReason: reason.trim(),
    },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "Release",
    entityId: releaseId,
    action: "RELEASE_REOPENED",
    oldValue: { deployment: release.deploymentStatus, gate: release.gateStatus },
    newValue: { deployment: DeploymentStatus.POST_LAUNCH_VERIFYING, reopened: true },
    reason,
  });
  await recalcGate(releaseId);
  return updated;
}

export async function completeBaseline(user: AuthUser, releaseId: string) {
  assert(canCreateRelease(user), "Not allowed to complete baseline");
  const release = await prisma.release.findUnique({ where: { id: releaseId } });
  if (!release) throw new Error("Release not found");
  const updated = await prisma.release.update({
    where: { id: releaseId },
    data: { baselineCompleted: true, baselineAt: release.baselineAt ?? new Date() },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "Release",
    entityId: releaseId,
    action: "BASELINE_COMPLETED",
    oldValue: { baselineCompleted: release.baselineCompleted },
    newValue: { baselineCompleted: true },
    reason: "Previous execution history existed outside WRC where applicable.",
  });
  await recalcGate(releaseId);
  return updated;
}

export async function markDeployed(user: AuthUser, releaseId: string, note?: string) {
  const release = await prisma.release.findUnique({ where: { id: releaseId } });
  if (!release) throw new Error("Release not found");
  assert(canMarkAsDeployed(user, release), "Yayına alma yalnızca Yayına Hazır ve henüz yayınlanmamış release için geçerlidir");
  const updated = await prisma.release.update({
    where: { id: releaseId },
    data: {
      deploymentStatus: DeploymentStatus.DEPLOYED,
      deployedAt: new Date(),
      deployedById: user.id,
      deploymentNote: note ?? null,
    },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "Release",
    entityId: releaseId,
    action: "DEPLOYED",
    oldValue: release.deploymentStatus,
    newValue: DeploymentStatus.DEPLOYED,
  });
  return updated;
}

export async function startPostLaunch(user: AuthUser, releaseId: string) {
  const release = await prisma.release.findUnique({ where: { id: releaseId } });
  if (!release) throw new Error("Release not found");
  assert(canStartPostLaunchVerification(user, release), "Yayın sonrası kontrol yalnızca Yayına Alındı durumunda başlatılır");
  const updated = await prisma.release.update({
    where: { id: releaseId },
    data: { deploymentStatus: DeploymentStatus.POST_LAUNCH_VERIFYING },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "Release",
    entityId: releaseId,
    action: "POST_LAUNCH_STARTED",
    oldValue: release.deploymentStatus,
    newValue: DeploymentStatus.POST_LAUNCH_VERIFYING,
  });
  return updated;
}

export async function markProductionVerified(user: AuthUser, releaseId: string) {
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: { checks: true },
  });
  if (!release) throw new Error("Release not found");
  assert(canCompleteProductionVerification(user, release), "Production doğrulaması yalnızca yayın sonrası kontrol aşamasında ve zorunlu kontroller tamamsa yapılabilir");
  const updated = await prisma.release.update({
    where: { id: releaseId },
    data: { deploymentStatus: DeploymentStatus.PRODUCTION_VERIFIED },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "Release",
    entityId: releaseId,
    action: "PRODUCTION_VERIFIED",
    oldValue: release.deploymentStatus,
    newValue: DeploymentStatus.PRODUCTION_VERIFIED,
  });
  return updated;
}

export async function emergencyDeploy(
  user: AuthUser,
  releaseId: string,
  input: { reason: string; openRisks: string; approver2Id: string },
) {
  if (!input.reason.trim() || !input.openRisks.trim() || !input.approver2Id) {
    throw new Error("Emergency deploy requires reason, open risks, and a second approver");
  }
  if (input.approver2Id === user.id) throw new Error("Two distinct approvers are required");
  const approver2 = await prisma.user.findUnique({ where: { id: input.approver2Id } });
  if (!approver2) throw new Error("Second approver not found");
  const allowed =
    (user.role === Role.PROJECT_MANAGER &&
      (approver2.role === Role.SEO_LEAD || approver2.role === Role.MANAGEMENT || approver2.role === Role.SYSTEM_ADMIN)) ||
    (user.role === Role.SEO_LEAD &&
      (approver2.role === Role.PROJECT_MANAGER || approver2.role === Role.MANAGEMENT || approver2.role === Role.SYSTEM_ADMIN)) ||
    user.role === Role.SYSTEM_ADMIN;
  assert(Boolean(allowed), "Emergency deploy approvers must be PM+SEO or PM+Management");

  const release = await prisma.release.findUnique({ where: { id: releaseId } });
  if (!release) throw new Error("Release not found");
  assert(canEmergencyDeploy(user, release), "Acil yayın yalnızca Yayına Hazır olmayan ve henüz yayınlanmamış release için geçerlidir");

  const updated = await prisma.release.update({
    where: { id: releaseId },
    data: {
      deploymentStatus: DeploymentStatus.DEPLOYED,
      deployedAt: new Date(),
      deployedById: user.id,
      emergencyReason: input.reason.trim(),
      emergencyOpenRisks: input.openRisks.trim(),
    },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "Release",
    entityId: releaseId,
    action: "DEPLOYED_WITH_OPEN_RISKS",
    oldValue: { gate: release.gateStatus, deployment: release.deploymentStatus },
    newValue: {
      gate: release.gateStatus,
      deployment: DeploymentStatus.DEPLOYED,
      approver2: approver2.email,
    },
    reason: input.reason,
  });
  return updated;
}

export { recalcGate };

export async function repairAllGates() {
  const releases = await prisma.release.findMany({ select: { id: true } });
  for (const r of releases) {
    await recalcGate(r.id);
  }
}
