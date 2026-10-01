import { Role, TeamKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { assert, isOperationalEditor, type AuthUser } from "@/lib/authz";

export type ProjectTeamSlot = "PM" | TeamKey;
export const PROJECT_TEAM_SLOTS: ProjectTeamSlot[] = ["PM", TeamKey.SEO, TeamKey.FRONTEND, TeamKey.BACKEND, TeamKey.NETWORK, TeamKey.CONTENT];

/** Active people who may hold a slot: PM → project managers; a team → its members (SEO → SEO lead too). */
export async function eligibleProjectPeople(slot: ProjectTeamSlot) {
  if (slot === "PM") return prisma.user.findMany({ where: { isActive: true, role: Role.PROJECT_MANAGER }, orderBy: { name: "asc" } });
  return prisma.user.findMany({
    where: { isActive: true, team: { key: slot }, role: { in: [Role.TEAM_MEMBER, Role.SEO_LEAD] } },
    orderBy: { name: "asc" },
  });
}

// Project default people. Used for new releases and new tasks only: existing tasks are never
// reassigned here (that is an explicit per-task action). Active releases of the project take the new
// team default too, so new issues opened in them follow it.
export async function setProjectTeamDefault(user: AuthUser, projectId: string, slot: ProjectTeamSlot, userId: string) {
  assert(user.isActive && isOperationalEditor(user), "Not allowed to change the project team");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.archived) throw new Error("Project not found");
  const eligible = await eligibleProjectPeople(slot);
  assert(eligible.some((u) => u.id === userId), "Person is not an active member for this project role");

  if (slot === "PM") {
    await prisma.project.update({ where: { id: projectId }, data: { pmUserId: userId } });
    await writeAudit({ actorId: user.id, entityType: "Project", entityId: projectId, action: "PROJECT_TEAM_CHANGED", oldValue: { slot, userId: project.pmUserId }, newValue: { slot, userId } });
    return;
  }
  const team = await prisma.team.findUniqueOrThrow({ where: { key: slot } });
  const before = await prisma.projectTeamAssignment.findUnique({ where: { projectId_teamId: { projectId, teamId: team.id } } });
  await prisma.projectTeamAssignment.upsert({
    where: { projectId_teamId: { projectId, teamId: team.id } },
    update: { userId },
    create: { projectId, teamId: team.id, userId },
  });
  const releases = await prisma.releaseTeamAssignment.updateMany({
    where: { teamId: team.id, release: { projectId, archived: false } },
    data: { userId },
  });
  await writeAudit({
    actorId: user.id,
    entityType: "Project",
    entityId: projectId,
    action: "PROJECT_TEAM_CHANGED",
    oldValue: { slot, userId: before?.userId ?? null },
    newValue: { slot, userId, activeReleaseDefaultsUpdated: releases.count },
  });
}
