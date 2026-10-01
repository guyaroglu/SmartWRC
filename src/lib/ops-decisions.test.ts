import { afterAll, describe, expect, it } from "vitest";
import { CheckStatus, DomainKey, ModuleKey, Priority, Role, TeamKey, VerificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminChangeUsername, adminCreateUser, adminUpdateUser, verifyLogin } from "@/lib/account-service";
import { setProjectTeamDefault } from "@/lib/project-team";
import { addEvidence, assignCheckUser, createAdHocCheck, createProject, createReleaseFromTemplate, passCheck, startCheck, submitForReview } from "@/lib/release-service";

const tag = Math.random().toString(36).slice(2, 7);
const TEMP = "Gecici-Sifre-2026";
const projects: string[] = [];
const users: string[] = [];

async function as(username: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { username }, include: { team: true } });
  return { id: u.id, role: u.role, teamId: u.teamId, teamKey: u.team?.key ?? null, isActive: u.isActive };
}
const actor = (u: { id: string; role: Role; teamId: string | null }) => ({ id: u.id, role: u.role, teamId: u.teamId, isActive: true });

async function person(name: string, teamKey: TeamKey | null = TeamKey.FRONTEND, role: Role = Role.TEAM_MEMBER) {
  const u = await adminCreateUser(await as("admin"), { name, username: `${name}-${tag}`, role, teamKey, temporaryPassword: TEMP, isActive: true });
  users.push(u.id);
  return u;
}

async function frontendTask() {
  const pm = await as("pm");
  const project = await createProject(pm, `Ops decisions ${tag} ${projects.length}`);
  projects.push(project.id);
  const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.1" } });
  const release = await createReleaseFromTemplate({ user: pm, projectId: project.id, name: "R", templateVersionId: template.id, modules: [ModuleKey.ECOMMERCE] });
  const task = await createAdHocCheck(await as("gokhanuyaroglu"), {
    releaseId: release.id,
    title: "H1 eksik",
    domains: [DomainKey.SEO],
    ownerTeamKey: TeamKey.FRONTEND,
    priority: Priority.P1,
    verificationType: VerificationType.SEO_GATED,
  });
  return { project, release, task };
}

describe("evidence: reporter, assigned owner-team person, reviewer", () => {
  it("SEO reporter and the assigned Frontend user add evidence; others cannot; approval unchanged", async () => {
    const { task } = await frontendTask();
    const assigned = await person("fe-assigned");
    const otherFe = await person("fe-other");
    await assignCheckUser(await as("pm"), task.id, assigned.id, "assign");

    await expect(addEvidence(await as("gokhanuyaroglu"), task.id, { type: "TEXT", body: "Kaynak: H1 export" })).resolves.toBeTruthy();
    await expect(addEvidence(actor(assigned), task.id, { type: "TEXT", body: "Düzeltildi" })).resolves.toBeTruthy();
    for (const u of [actor(otherFe), await as("backend"), await as("pm"), await as("management")]) {
      await expect(addEvidence(u, task.id, { type: "TEXT", body: "x" })).rejects.toThrow("Not allowed to add evidence");
    }
    // Governance: the assigned person works the task, only SEO approves it.
    await startCheck(actor(assigned), task.id);
    await submitForReview(actor(assigned), task.id);
    await expect(passCheck(actor(assigned), task.id)).rejects.toThrow();
    await expect(passCheck(await as("pm"), task.id)).rejects.toThrow();
    await expect(passCheck(await as("gokhanuyaroglu"), task.id)).resolves.toMatchObject({ status: CheckStatus.PASS });
  }, 30000);

  it("a PM who opened the issue may add its source evidence (reporter rule)", async () => {
    const { release } = await frontendTask();
    const pm = await as("pm");
    const issue = await createAdHocCheck(pm, { releaseId: release.id, title: "PM bulgusu", domains: [DomainKey.SEO], ownerTeamKey: TeamKey.FRONTEND, priority: Priority.P2, verificationType: VerificationType.SEO_GATED });
    await expect(addEvidence(pm, issue.id, { type: "TEXT", body: "Kaynak" })).resolves.toBeTruthy();
  }, 30000);
});

describe("username change keeps the same account", () => {
  it("old username stops working, new one works, same id, audited, password untouched", async () => {
    const u = await person("rename");
    const admin = await as("admin");
    await adminChangeUsername(admin, u.id, `Renamed-${tag}`);
    expect(await verifyLogin(`rename-${tag}`, TEMP)).toBeNull();
    expect((await verifyLogin(`renamed-${tag}`, TEMP))?.id).toBe(u.id);
    const audit = await prisma.auditEvent.findFirstOrThrow({ where: { entityId: u.id, action: "USERNAME_CHANGED" } });
    expect(audit).toMatchObject({ actorId: admin.id, oldValue: `rename-${tag}`, newValue: `renamed-${tag}` });
    await expect(adminChangeUsername(admin, u.id, "admin")).rejects.toThrow("Username already exists");
  });
});

describe("project team defaults", () => {
  it("only eligible active people; existing tasks are not reassigned; active release defaults follow", async () => {
    const { project, release, task } = await frontendTask();
    const fe = await person("fe-default");
    const before = await prisma.releaseCheck.findUniqueOrThrow({ where: { id: task.id } });
    const pm = await as("pm");
    await setProjectTeamDefault(pm, project.id, TeamKey.FRONTEND, fe.id);
    const frontend = await prisma.team.findUniqueOrThrow({ where: { key: TeamKey.FRONTEND } });
    expect((await prisma.projectTeamAssignment.findUniqueOrThrow({ where: { projectId_teamId: { projectId: project.id, teamId: frontend.id } } })).userId).toBe(fe.id);
    const rel = await prisma.releaseTeamAssignment.findFirst({ where: { releaseId: release.id, teamId: frontend.id } });
    if (rel) expect(rel.userId).toBe(fe.id);
    expect((await prisma.releaseCheck.findUniqueOrThrow({ where: { id: task.id } })).ownerUserId).toBe(before.ownerUserId);

    await expect(setProjectTeamDefault(pm, project.id, TeamKey.FRONTEND, (await as("backend")).id)).rejects.toThrow("not an active member");
    await expect(setProjectTeamDefault(pm, project.id, "PM", fe.id)).rejects.toThrow("not an active member");
    await setProjectTeamDefault(pm, project.id, "PM", pm.id);
    await expect(setProjectTeamDefault(await as("management"), project.id, TeamKey.FRONTEND, fe.id)).rejects.toThrow("Not allowed");
    await expect(setProjectTeamDefault(await as("frontend"), project.id, TeamKey.FRONTEND, fe.id)).rejects.toThrow("Not allowed");
  }, 30000);
});

describe("deactivation / team change safety", () => {
  it("open work or project defaults block; reassignment unblocks; terminal history does not block", async () => {
    const admin = await as("admin");
    const pm = await as("pm");
    const { project, task } = await frontendTask();
    const u = await person("leaver");
    await assignCheckUser(pm, task.id, u.id, "assign");
    const off = { role: Role.TEAM_MEMBER, teamKey: TeamKey.FRONTEND, isActive: false };
    await expect(adminUpdateUser(admin, u.id, off)).rejects.toThrow("açık görevin sorumlusu");
    await expect(adminUpdateUser(admin, u.id, { role: Role.TEAM_MEMBER, teamKey: TeamKey.BACKEND, isActive: true })).rejects.toThrow("açık görevin sorumlusu");
    await expect(adminUpdateUser(admin, u.id, { role: Role.PROJECT_MANAGER, teamKey: null, isActive: true })).rejects.toThrow("açık görevin sorumlusu");

    await assignCheckUser(pm, task.id, null, "reassign to team");
    await setProjectTeamDefault(pm, project.id, TeamKey.FRONTEND, u.id);
    await expect(adminUpdateUser(admin, u.id, off)).rejects.toThrow("proje ekibi varsayılanı");
    await setProjectTeamDefault(pm, project.id, TeamKey.FRONTEND, (await as("frontend")).id);
    await expect(adminUpdateUser(admin, u.id, off)).resolves.toMatchObject({ isActive: false });

    // Terminal-only history: the person finished a task; that does not block retirement.
    const done = await frontendTask();
    const finisher = await person("finisher");
    await assignCheckUser(pm, done.task.id, finisher.id, "assign");
    await startCheck(actor(finisher), done.task.id);
    await addEvidence(actor(finisher), done.task.id, { type: "TEXT", body: "ok" });
    await submitForReview(actor(finisher), done.task.id);
    await passCheck(await as("gokhanuyaroglu"), done.task.id);
    await expect(adminUpdateUser(admin, finisher.id, off)).resolves.toMatchObject({ isActive: false });
  }, 60000);
});

afterAll(async () => {
  if (projects.length) {
    await prisma.release.updateMany({ where: { projectId: { in: projects } }, data: { archived: true } });
    await prisma.project.updateMany({ where: { id: { in: projects } }, data: { archived: true } });
  }
  if (users.length) await prisma.user.updateMany({ where: { id: { in: users } }, data: { isActive: false } });
  await prisma.$disconnect();
});
