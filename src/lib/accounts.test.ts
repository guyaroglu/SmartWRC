import { afterAll, describe, expect, it } from "vitest";
import { CheckStatus, DomainKey, ModuleKey, Priority, Role, TeamKey, VerificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminCreateUser, adminResetPassword, adminUpdateUser, changeOwnPassword, verifyLogin } from "@/lib/account-service";
import { assignCheckUser, createAdHocCheck, createReleaseFromTemplate, passCheck, startCheck, addEvidence, submitForReview } from "@/lib/release-service";
import { canReviewCheck } from "@/lib/authz";

const users: string[] = [];
const releases: string[] = [];
const tag = Math.random().toString(36).slice(2, 7);
const TEMP = "Gecici-Sifre-2026";

async function as(username: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { username }, include: { team: true } });
  return { id: u.id, role: u.role, teamId: u.teamId, teamKey: u.team?.key ?? null, isActive: u.isActive };
}

async function newUser(name: string, role: Role = Role.TEAM_MEMBER, teamKey: TeamKey | null = TeamKey.BACKEND) {
  const admin = await as("admin");
  const u = await adminCreateUser(admin, { name, username: `${name}-${tag}`, role, teamKey, temporaryPassword: TEMP, isActive: true });
  users.push(u.id);
  return u;
}

describe("accounts (System Admin only, no public registration)", () => {
  it("admin creates a user with a temporary password; username is normalised and unique", async () => {
    const admin = await as("admin");
    const u = await adminCreateUser(admin, { name: "Kadir Test", username: `  KadirTest-${tag} `, role: Role.TEAM_MEMBER, teamKey: TeamKey.BACKEND, temporaryPassword: TEMP, isActive: true });
    users.push(u.id);
    expect(u).toMatchObject({ username: `kadirtest-${tag}`, mustChangePassword: true, email: null });
    expect(u.passwordHash).not.toContain(TEMP);
    await expect(adminCreateUser(admin, { name: "Dup", username: `kadirtest-${tag}`, role: Role.TEAM_MEMBER, teamKey: TeamKey.BACKEND, temporaryPassword: TEMP, isActive: true })).rejects.toThrow("Username already exists");
    await expect(adminCreateUser(admin, { name: "Bad", username: "a b", role: Role.TEAM_MEMBER, teamKey: TeamKey.BACKEND, temporaryPassword: TEMP, isActive: true })).rejects.toThrow("Invalid username");
    await expect(adminCreateUser(await as("pm"), { name: "X", username: `pmmade-${tag}`, role: Role.TEAM_MEMBER, teamKey: TeamKey.BACKEND, temporaryPassword: TEMP, isActive: true })).rejects.toThrow("Not allowed");
  });

  it("same team holds two active users and both are assignable; owner team stays Backend", async () => {
    const a = await newUser("kadir");
    const b = await newUser("veysel");
    const backend = await prisma.team.findUniqueOrThrow({ where: { key: TeamKey.BACKEND } });
    const active = await prisma.user.findMany({ where: { teamId: backend.id, isActive: true, id: { in: [a.id, b.id] } } });
    expect(active).toHaveLength(2);

    const pm = await as("pm");
    const seo = await as("gokhanuyaroglu");
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.1" } });
    const release = await createReleaseFromTemplate({ user: pm, projectId: project.id, name: `Accounts ${tag}`, templateVersionId: template.id, modules: [ModuleKey.ECOMMERCE] });
    releases.push(release.id);
    const task = await createAdHocCheck(seo, { releaseId: release.id, title: "Backend probe", domains: [DomainKey.SEO], ownerTeamKey: TeamKey.BACKEND, priority: Priority.P1, verificationType: VerificationType.SEO_GATED });
    await assignCheckUser(pm, task.id, a.id, "Kadir");
    await assignCheckUser(pm, task.id, b.id, "Veysel");
    const after = await prisma.releaseCheck.findUniqueOrThrow({ where: { id: task.id } });
    expect(after).toMatchObject({ ownerUserId: b.id, ownerTeamId: backend.id, reviewerUserId: seo.id });
    await expect(assignCheckUser(pm, task.id, (await as("frontend")).id, "wrong team")).rejects.toThrow("active member of the owner team");

    // Governance unchanged: the new Backend users work the task, only SEO approves it.
    const veysel = await as(b.username);
    await startCheck(veysel, task.id);
    await addEvidence(veysel, task.id, { type: "TEXT", body: "done" });
    await submitForReview(veysel, task.id);
    const input = { ownerUserId: after.ownerUserId, ownerTeamId: after.ownerTeamId, ownerTeamKey: TeamKey.BACKEND, reviewerUserId: after.reviewerUserId, verificationType: after.verificationType };
    expect(canReviewCheck(veysel, input)).toBe(false);
    expect(canReviewCheck(await as(a.username), input)).toBe(false);
    await expect(passCheck(veysel, task.id)).rejects.toThrow();
    await expect(passCheck(seo, task.id)).resolves.toMatchObject({ status: CheckStatus.PASS });
  }, 30000);

  it("PM / Management created in the SEO team still cannot approve", async () => {
    const pmInSeo = await newUser("pmseo", Role.PROJECT_MANAGER, TeamKey.SEO);
    const mgmtInSeo = await newUser("mgmtseo", Role.MANAGEMENT, TeamKey.SEO);
    expect(pmInSeo.teamId).toBeNull(); // PM / Management never belong to a team
    expect(mgmtInSeo.teamId).toBeNull();
    const seoTeam = await prisma.team.findUniqueOrThrow({ where: { key: TeamKey.SEO } });
    const seoSelf = { ownerUserId: null, ownerTeamId: seoTeam.id, ownerTeamKey: TeamKey.SEO, reviewerUserId: null, verificationType: VerificationType.SELF };
    for (const u of [pmInSeo, mgmtInSeo]) {
      expect(canReviewCheck({ id: u.id, role: u.role, teamId: u.teamId, isActive: true }, seoSelf)).toBe(false);
    }
  });
});

describe("login and passwords", () => {
  it("canonical SEO lead: username gokhanuyaroglu signs in, legacy e-mail still works, “seo” is not a login", async () => {
    const seo = await prisma.user.findUniqueOrThrow({ where: { email: "seo@smartnet.local" } });
    expect(seo).toMatchObject({ username: "gokhanuyaroglu", role: Role.SEO_LEAD, name: "Gökhan (SEO Lead)" });
    expect((await verifyLogin("gokhanuyaroglu", "Pilot2026!"))?.id).toBe(seo.id);
    expect((await verifyLogin("seo@smartnet.local", "Pilot2026!"))?.id).toBe(seo.id);
    expect(await verifyLogin("seo", "Pilot2026!")).toBeNull();
    expect(await prisma.user.findUnique({ where: { username: "seo" } })).toBeNull();
  });

  it("username login works; legacy e-mail login still works; inactive users cannot log in", async () => {
    const u = await newUser("login");
    expect((await verifyLogin(u.username.toUpperCase(), TEMP))?.id).toBe(u.id);
    expect(await verifyLogin(u.username, "wrong-password")).toBeNull();
    // Legacy demo account by e-mail (seed password).
    expect((await verifyLogin("pm@smartnet.local", "Pilot2026!"))?.username).toBe("pm");
    await adminUpdateUser(await as("admin"), u.id, { role: Role.TEAM_MEMBER, teamKey: TeamKey.BACKEND, isActive: false });
    expect(await verifyLogin(u.username, TEMP)).toBeNull();
  });

  it("own password change: correct current required, old stops working, new works, no secret in audit", async () => {
    const u = await newUser("pw");
    const me = { id: u.id, role: u.role, teamId: u.teamId, isActive: true };
    await expect(changeOwnPassword(me, "not-the-password", "Yeni-Sifre-12345", "Yeni-Sifre-12345")).rejects.toThrow("Current password is wrong");
    await expect(changeOwnPassword(me, TEMP, "Yeni-Sifre-12345", "Baska-Sifre-12345")).rejects.toThrow("do not match");
    await expect(changeOwnPassword(me, TEMP, "short", "short")).rejects.toThrow("too short");
    await changeOwnPassword(me, TEMP, "Yeni-Sifre-12345", "Yeni-Sifre-12345");
    expect(await verifyLogin(u.username, TEMP)).toBeNull();
    expect((await verifyLogin(u.username, "Yeni-Sifre-12345"))?.mustChangePassword).toBe(false);

    await adminResetPassword(await as("admin"), u.id, "Reset-Gecici-2026");
    const reset = await verifyLogin(u.username, "Reset-Gecici-2026");
    expect(reset?.mustChangePassword).toBe(true); // forced change on next sign-in
    await changeOwnPassword(me, "Reset-Gecici-2026", "Kendi-Sifrem-2026", "Kendi-Sifrem-2026");
    expect((await prisma.user.findUniqueOrThrow({ where: { id: u.id } })).mustChangePassword).toBe(false);

    const audit = await prisma.auditEvent.findMany({ where: { entityType: "User", entityId: u.id } });
    expect(audit.map((a) => a.action).sort()).toEqual(["PASSWORD_CHANGED", "PASSWORD_CHANGED", "PASSWORD_RESET", "USER_CREATED"]);
    const dump = JSON.stringify(audit);
    for (const secret of [TEMP, "Yeni-Sifre-12345", "Reset-Gecici-2026", "Kendi-Sifrem-2026", "$2"]) expect(dump).not.toContain(secret);
  });

  it("users cannot change their own role / team / status; the last active System Admin cannot be removed", async () => {
    const u = await newUser("self");
    await expect(adminUpdateUser({ id: u.id, role: u.role, teamId: u.teamId, isActive: true }, u.id, { role: Role.SYSTEM_ADMIN, teamKey: null, isActive: true })).rejects.toThrow("Not allowed");
    const admins = await prisma.user.findMany({ where: { role: Role.SYSTEM_ADMIN, isActive: true } });
    if (admins.length === 1) {
      const admin = await as("admin");
      await expect(adminUpdateUser(admin, admin.id, { role: Role.SYSTEM_ADMIN, teamKey: null, isActive: false })).rejects.toThrow("last active System Admin");
      await expect(adminUpdateUser(admin, admin.id, { role: Role.SEO_LEAD, teamKey: TeamKey.SEO, isActive: true })).rejects.toThrow("last active System Admin");
    }
  });
});

afterAll(async () => {
  if (releases.length) await prisma.release.deleteMany({ where: { id: { in: releases } } });
  if (users.length) {
    await prisma.releaseCheck.updateMany({ where: { ownerUserId: { in: users } }, data: { ownerUserId: null } });
    await prisma.evidence.deleteMany({ where: { createdById: { in: users } } });
    await prisma.user.updateMany({ where: { id: { in: users } }, data: { isActive: false } });
  }
  await prisma.$disconnect();
});
