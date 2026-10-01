import { compare, hash } from "bcryptjs";
import { CheckStatus, Role, TeamKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { assert, canManageSystem, type AuthUser } from "@/lib/authz";

// Accounts are opened only by System Admin (no public registration). Passwords are stored as bcrypt
// hashes (same cost as the seed) and never written to audit or logs.
const BCRYPT_ROUNDS = 10;
export const MIN_PASSWORD_LENGTH = 10;

export function normalizeUsername(raw: string): string {
  const u = raw.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(u)) throw new Error("Invalid username");
  return u;
}

function assertPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error("Password too short");
}

/** Login: username, or e-mail during the transition. Inactive accounts never sign in. */
export async function verifyLogin(identifier: string, password: string) {
  const id = identifier.trim().toLowerCase();
  if (!id || !password) return null;
  const user = await prisma.user.findUnique({
    where: id.includes("@") ? { email: id } : { username: id },
    include: { team: true },
  });
  if (!user || !user.isActive) return null;
  if (!(await compare(password, user.passwordHash))) return null;
  return user;
}

export async function changeOwnPassword(user: AuthUser, current: string, next: string, confirm: string) {
  const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!row.isActive) throw new Error("Authentication required");
  if (!(await compare(current, row.passwordHash))) throw new Error("Current password is wrong");
  if (next !== confirm) throw new Error("New passwords do not match");
  assertPassword(next);
  if (await compare(next, row.passwordHash)) throw new Error("New password must differ from the current one");
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hash(next, BCRYPT_ROUNDS), mustChangePassword: false },
  });
  await writeAudit({ actorId: user.id, entityType: "User", entityId: user.id, action: "PASSWORD_CHANGED" });
}

// Role ↔ team: team members and SEO leads belong to a team (SEO lead → SEO); PM, Management and
// System Admin have none. Governance comes from the role, so a team never grants approval rights.
async function resolveTeamId(role: Role, teamKey: TeamKey | null): Promise<string | null> {
  if (role === Role.SEO_LEAD) teamKey = TeamKey.SEO;
  if (role !== Role.TEAM_MEMBER && role !== Role.SEO_LEAD) return null;
  if (!teamKey) throw new Error("Team is required for this role");
  const team = await prisma.team.findUnique({ where: { key: teamKey } });
  if (!team) throw new Error("Team not found");
  return team.id;
}

export type NewUserInput = {
  name: string;
  username: string;
  email?: string | null;
  role: Role;
  teamKey: TeamKey | null;
  temporaryPassword: string;
  isActive: boolean;
};

export async function adminCreateUser(admin: AuthUser, input: NewUserInput) {
  assert(canManageSystem(admin), "Not allowed to manage users");
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");
  const username = normalizeUsername(input.username);
  const email = input.email?.trim().toLowerCase() || null;
  assertPassword(input.temporaryPassword);
  if (await prisma.user.findUnique({ where: { username } })) throw new Error("Username already exists");
  if (email && (await prisma.user.findUnique({ where: { email } }))) throw new Error("E-mail already exists");
  const teamId = await resolveTeamId(input.role, input.teamKey);
  const created = await prisma.user.create({
    data: {
      name,
      username,
      email,
      role: input.role,
      teamId,
      isActive: input.isActive,
      passwordHash: await hash(input.temporaryPassword, BCRYPT_ROUNDS),
      mustChangePassword: true,
    },
  });
  await writeAudit({
    actorId: admin.id,
    entityType: "User",
    entityId: created.id,
    action: "USER_CREATED",
    newValue: { username, name, role: input.role, team: input.role === Role.SEO_LEAD ? TeamKey.SEO : input.teamKey, isActive: input.isActive },
  });
  return created;
}

async function assertKeepsAnActiveAdmin(userId: string, nextRole: Role, nextActive: boolean) {
  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const losesAdmin = target.role === Role.SYSTEM_ADMIN && target.isActive && (nextRole !== Role.SYSTEM_ADMIN || !nextActive);
  if (!losesAdmin) return;
  const others = await prisma.user.count({ where: { role: Role.SYSTEM_ADMIN, isActive: true, id: { not: userId } } });
  if (others === 0) throw new Error("Cannot remove the last active System Admin");
}

const CLOSED: CheckStatus[] = [CheckStatus.PASS, CheckStatus.NA, CheckStatus.WAIVED, CheckStatus.REMOVED_FROM_SCOPE];

/** Live work and defaults that still point at this person (archived and terminal history excluded). */
export async function openResponsibilities(userId: string) {
  const live = { status: { notIn: CLOSED }, release: { archived: false, project: { archived: false } } };
  const [owned, reviewing, projectDefaults, releaseDefaults, pmProjects] = await Promise.all([
    prisma.releaseCheck.count({ where: { ...live, ownerUserId: userId } }),
    prisma.releaseCheck.count({ where: { ...live, reviewerUserId: userId } }),
    prisma.projectTeamAssignment.count({ where: { userId, project: { archived: false } } }),
    prisma.releaseTeamAssignment.count({ where: { userId, release: { archived: false, project: { archived: false } } } }),
    prisma.project.count({ where: { pmUserId: userId, archived: false } }),
  ]);
  return { owned, reviewing, projectDefaults: projectDefaults + pmProjects, releaseDefaults };
}

// Deactivating, moving to another team or changing role is refused while the person still holds
// open work or project/release defaults — reassign first. No override.
async function assertNoOpenResponsibilities(userId: string) {
  const r = await openResponsibilities(userId);
  const parts = [
    r.owned && `${r.owned} açık görevin sorumlusu`,
    r.reviewing && `${r.reviewing} açık görevin doğrulayanı`,
    r.projectDefaults && `${r.projectDefaults} proje ekibi varsayılanı`,
    r.releaseDefaults && `${r.releaseDefaults} yayın varsayılanı`,
  ].filter(Boolean);
  if (parts.length) {
    throw new Error(`Kullanıcı pasife alınamaz veya ekibi/rolü değiştirilemez: hâlâ ${parts.join(", ")}. Önce görevleri yeniden ata ve proje ekibini güncelle.`);
  }
}

export async function adminUpdateUser(admin: AuthUser, userId: string, input: { role: Role; teamKey: TeamKey | null; isActive: boolean }) {
  assert(canManageSystem(admin), "Not allowed to manage users");
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { team: true } });
  await assertKeepsAnActiveAdmin(userId, input.role, input.isActive);
  const teamId = await resolveTeamId(input.role, input.teamKey);
  const deactivating = before.isActive && !input.isActive;
  if (deactivating || teamId !== before.teamId || input.role !== before.role) await assertNoOpenResponsibilities(userId);
  const updated = await prisma.user.update({ where: { id: userId }, data: { role: input.role, teamId, isActive: input.isActive }, include: { team: true } });
  await writeAudit({
    actorId: admin.id,
    entityType: "User",
    entityId: userId,
    action: "USER_UPDATED",
    oldValue: { role: before.role, team: before.team?.key ?? null, isActive: before.isActive },
    newValue: { role: updated.role, team: updated.team?.key ?? null, isActive: updated.isActive },
  });
  return updated;
}

export async function adminResetPassword(admin: AuthUser, userId: string, temporaryPassword: string) {
  assert(canManageSystem(admin), "Not allowed to manage users");
  assertPassword(temporaryPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hash(temporaryPassword, BCRYPT_ROUNDS), mustChangePassword: true },
  });
  await writeAudit({ actorId: admin.id, entityType: "User", entityId: userId, action: "PASSWORD_RESET" });
}

/** Rename the login identifier only: same user id, so every relation and audit actor stays intact. */
export async function adminChangeUsername(admin: AuthUser, userId: string, rawUsername: string) {
  assert(canManageSystem(admin), "Not allowed to manage users");
  const username = normalizeUsername(rawUsername);
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (before.username === username) return before;
  if (await prisma.user.findUnique({ where: { username } })) throw new Error("Username already exists");
  const updated = await prisma.user.update({ where: { id: userId }, data: { username } });
  await writeAudit({ actorId: admin.id, entityType: "User", entityId: userId, action: "USERNAME_CHANGED", oldValue: before.username, newValue: username });
  return updated;
}
