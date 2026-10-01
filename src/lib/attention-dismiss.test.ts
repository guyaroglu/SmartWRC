import { afterAll, describe, expect, it } from "vitest";
import { DomainKey, ModuleKey, Priority, Role, TeamKey, VerificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dismissAllAttention, dismissAttention, loadAttentionBundle } from "@/lib/attention-load";
import { changePriority, createAdHocCheck, createReleaseFromTemplate } from "@/lib/release-service";

// Notifications are derived; clearing stores only the user's cleared state and never touches audit.
// A team-less user who personally owns the fixture checks keeps this isolated from parallel tests.

const releases: string[] = [];
const users: string[] = [];

async function as(email: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { email }, include: { team: true } });
  return { id: u.id, role: u.role, teamId: u.teamId, teamKey: u.team?.key ?? null, isActive: true as const };
}

async function fixture() {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const u = await prisma.user.create({
    data: { email: `attn-${stamp}@test.local`, name: "Attention Probe", passwordHash: "x", role: Role.TEAM_MEMBER },
  });
  users.push(u.id);
  const me = { id: u.id, role: u.role, teamId: null, teamKey: null, isActive: true as const };
  const pm = await as("pm@smartnet.local");
  const seo = await as("seo@smartnet.local");
  const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
  const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.1" } });
  const release = await createReleaseFromTemplate({
    user: pm,
    projectId: project.id,
    name: `Attention ${stamp}`,
    templateVersionId: template.id,
    modules: [ModuleKey.ECOMMERCE],
  });
  releases.push(release.id);
  const ids: string[] = [];
  for (const title of ["one", "two", "three"]) {
    const c = await createAdHocCheck(seo, {
      releaseId: release.id,
      title: `Attention ${title}`,
      domains: [DomainKey.SEO],
      ownerTeamKey: TeamKey.FRONTEND,
      priority: Priority.P1,
      verificationType: VerificationType.SEO_GATED,
    });
    await prisma.releaseCheck.update({ where: { id: c.id }, data: { ownerUserId: u.id } }); // fixture ownership
    ids.push(c.id);
  }
  return { me, pm, ids };
}

describe("clearing Dikkat Gerektirenler", () => {
  it("single dismiss hides one item for this user only, persists, and leaves audit untouched", async () => {
    const { me, ids } = await fixture();
    const before = await loadAttentionBundle(me);
    expect(before.items.map((i) => i.href).sort()).toEqual(ids.map((id) => `/checks/${id}`).sort());

    const other = await fixture(); // another user with their own items
    const otherBefore = (await loadAttentionBundle(other.me)).items.map((i) => i.key);
    const auditWhere = { entityId: { in: [...ids, ...other.ids] } };
    const auditBefore = await prisma.auditEvent.count({ where: auditWhere });

    await dismissAttention(me, [before.items[0].key]);
    await dismissAttention(me, [before.items[0].key]); // idempotent

    const after = await loadAttentionBundle(me); // fresh load = after refresh
    expect(after.items).toHaveLength(2);
    expect(after.total).toBe(before.total - 1); // badge count
    expect(after.items.some((i) => i.key === before.items[0].key)).toBe(false);
    expect((await loadAttentionBundle(other.me)).items.map((i) => i.key)).toEqual(otherBefore);
    expect(await prisma.auditEvent.count({ where: auditWhere })).toBe(auditBefore);
  }, 30000);

  it("dismiss all clears every item; a cleared item comes back when its state changes", async () => {
    const { me, pm, ids } = await fixture();
    await dismissAllAttention(me);
    expect(await loadAttentionBundle(me)).toMatchObject({ items: [], total: 0 });
    await changePriority(pm, ids[0], Priority.P0, "escalated");
    const again = await loadAttentionBundle(me);
    expect(again.items.map((i) => i.href)).toEqual([`/checks/${ids[0]}`]);
  }, 30000);
});

afterAll(async () => {
  if (releases.length) await prisma.release.deleteMany({ where: { id: { in: releases } } });
  if (users.length) await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.$disconnect();
});
