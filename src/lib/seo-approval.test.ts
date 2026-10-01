import { afterAll, describe, expect, it } from "vitest";
import { CheckStatus, DomainKey, GateStatus, ModuleKey, Priority, TeamKey, VerificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  addEvidence,
  changeOwner,
  changePriority,
  changeReviewer,
  createAdHocCheck,
  createReleaseFromTemplate,
  failCheck,
  markDeployed,
  markNotApplicable,
  passCheck,
  reopenCheck,
  startCheck,
  submitForReview,
  waiveCheck,
} from "@/lib/release-service";

// 2026-10-01 rule: Frontend / Backend / Network / Content work has exactly one technical
// approver — SEO. PM plans and tracks, Management reads; neither approves a task.
// These call the same service functions the server actions call, so a hidden button
// cannot be bypassed by posting to the action directly (CASE 7).

const created: string[] = [];

async function as(email: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { email }, include: { team: true } });
  return { id: u.id, role: u.role, teamId: u.teamId, teamKey: u.team?.key ?? null, isActive: true as const };
}

async function openTask(owner: TeamKey, verificationType: VerificationType = VerificationType.SEO_GATED, priority: Priority = Priority.P1) {
  const pm = await as("pm@smartnet.local");
  const seo = await as("seo@smartnet.local");
  const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
  const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.1" } });
  const release = await createReleaseFromTemplate({
    user: pm,
    projectId: project.id,
    name: `SEO approval ${owner} ${Date.now()}`,
    templateVersionId: template.id,
    modules: [ModuleKey.ECOMMERCE], // no catalogue controls → only the task below
  });
  created.push(release.id);
  const task = await createAdHocCheck(seo, {
    releaseId: release.id,
    title: `${owner} probe`,
    domains: [DomainKey.SEO],
    ownerTeamKey: owner,
    priority,
    verificationType,
  });
  return { task, release };
}

async function submittedTask(owner: TeamKey, ownerEmail: string, verificationType: VerificationType = VerificationType.SEO_GATED) {
  const { task, release } = await openTask(owner, verificationType);
  const ownerUser = await as(ownerEmail);
  await startCheck(ownerUser, task.id);
  await addEvidence(ownerUser, task.id, { type: "TEXT", body: "Done, evidence attached." });
  await submitForReview(ownerUser, task.id);
  return { task, release, ownerUser };
}

describe("SEO is the only technical approver of Frontend/Backend/Network/Content work", () => {
  it("CASE 1 — Frontend submits, SEO approves", async () => {
    const { task } = await submittedTask(TeamKey.FRONTEND, "frontend@smartnet.local");
    await expect(passCheck(await as("seo@smartnet.local"), task.id)).resolves.toMatchObject({ status: CheckStatus.PASS });
  }, 30000);

  it("CASE 2 — Backend submits, SEO requests changes", async () => {
    const { task } = await submittedTask(TeamKey.BACKEND, "backend@smartnet.local");
    await expect(failCheck(await as("seo@smartnet.local"), task.id, "Canonical still points to redirect URL.")).resolves.toMatchObject({
      status: CheckStatus.FAIL,
    });
  }, 30000);

  it("CASE 3 — Network submits, PM cannot approve or request changes", async () => {
    const { task } = await submittedTask(TeamKey.NETWORK, "network@smartnet.local");
    const pm = await as("pm@smartnet.local");
    await expect(passCheck(pm, task.id)).rejects.toThrow("Not allowed to pass this check");
    await expect(failCheck(pm, task.id, "PM opinion")).rejects.toThrow("Not allowed to fail this check");
    expect((await prisma.releaseCheck.findUniqueOrThrow({ where: { id: task.id } })).status).toBe(CheckStatus.REVIEW);
  }, 30000);

  it("CASE 4 — Content submits, Management cannot approve", async () => {
    const { task } = await submittedTask(TeamKey.CONTENT, "content@smartnet.local");
    await expect(passCheck(await as("management@smartnet.local"), task.id)).rejects.toThrow("Not allowed to pass this check");
    expect((await prisma.releaseCheck.findUniqueOrThrow({ where: { id: task.id } })).status).toBe(CheckStatus.REVIEW);
  }, 30000);

  it("CASE 5 — PM assigns and re-prioritises within existing permissions", async () => {
    const { task, ownerUser } = await submittedTask(TeamKey.CONTENT, "content@smartnet.local");
    const pm = await as("pm@smartnet.local");
    await expect(changeOwner(pm, task.id, ownerUser.id, "Content lead owns copy")).resolves.toBeTruthy();
    await expect(changePriority(pm, task.id, Priority.P0, "Ekim P0")).resolves.toMatchObject({ priority: Priority.P0 });
  }, 30000);

  it("CASE 6 — Management keeps a read-only release view; the release decision stays calculated", async () => {
    const { release } = await submittedTask(TeamKey.FRONTEND, "frontend@smartnet.local");
    const mgmt = await as("management@smartnet.local");
    const before = await prisma.release.findUniqueOrThrow({ where: { id: release.id } });
    expect(before.gateStatus).not.toBe(GateStatus.READY); // open REVIEW work is not ready
    await expect(markDeployed(mgmt, release.id)).rejects.toThrow();
    expect((await prisma.release.findUniqueOrThrow({ where: { id: release.id } })).gateStatus).toBe(before.gateStatus);
  }, 30000);

  it("CASE 7 — even with every type (SELF / CROSS_TEAM) PM is blocked server-side; SEO decides", async () => {
    const pm = await as("pm@smartnet.local");
    const seo = await as("seo@smartnet.local");
    for (const v of [VerificationType.SELF, VerificationType.CROSS_TEAM]) {
      const { task, ownerUser } = await submittedTask(TeamKey.FRONTEND, "frontend@smartnet.local", v);
      expect(task.reviewerUserId).toBe(seo.id);
      await expect(passCheck(pm, task.id)).rejects.toThrow();
      await expect(passCheck(ownerUser, task.id)).rejects.toThrow(); // owner team cannot self-approve
      await expect(passCheck(seo, task.id)).resolves.toMatchObject({ status: CheckStatus.PASS });
    }
  }, 60000);

  it("CASE 8 — submit / request changes / approve / reopen are audited with the right actor", async () => {
    const { task, ownerUser } = await submittedTask(TeamKey.FRONTEND, "frontend@smartnet.local");
    const seo = await as("seo@smartnet.local");
    const pm = await as("pm@smartnet.local");
    await failCheck(seo, task.id, "Hero image still lazy-loaded.");
    await startCheck(ownerUser, task.id);
    await submitForReview(ownerUser, task.id);
    await passCheck(seo, task.id);
    await reopenCheck(pm, task.id, "Regression after deploy");

    const events = await prisma.auditEvent.findMany({ where: { entityType: "ReleaseCheck", entityId: task.id }, orderBy: { createdAt: "asc" } });
    const status = (from: string, to: string) => events.find((e) => e.action === "STATUS_CHANGED" && e.oldValue === from && e.newValue === to);
    expect(status("IN_PROGRESS", "REVIEW")?.actorId).toBe(ownerUser.id);
    expect(status("REVIEW", "FAIL")?.actorId).toBe(seo.id);
    expect(status("REVIEW", "PASS")?.actorId).toBe(seo.id);
    expect(events.find((e) => e.action === "REOPENED")?.actorId).toBe(pm.id);
    expect(events.every((e) => e.createdAt instanceof Date)).toBe(true);
  }, 30000);
});

describe("stored reviewer stays SEO on Frontend/Backend/Network/Content work", () => {
  it("a non-SEO reviewer is rejected; moving SEO work to Frontend makes SEO the reviewer", async () => {
    const pm = await as("pm@smartnet.local");
    const seo = await as("seo@smartnet.local");
    const net = await as("network@smartnet.local");
    const fe = await as("frontend@smartnet.local");
    const { task } = await openTask(TeamKey.CONTENT, VerificationType.CROSS_TEAM);
    await expect(changeReviewer(pm, task.id, net.id, "try")).rejects.toThrow("reviewed by SEO");
    const { task: seoWork } = await openTask(TeamKey.SEO, VerificationType.SELF);
    await changeReviewer(pm, seoWork.id, net.id, "SEO-owned cross review");
    await changeOwner(pm, seoWork.id, fe.id, "Implementation is Frontend's");
    expect((await prisma.releaseCheck.findUniqueOrThrow({ where: { id: seoWork.id } })).reviewerUserId).toBe(seo.id);
  }, 30000);
});

describe("WAIVED / N/A cannot bypass the SEO review on Frontend/Backend/Network/Content work", () => {
  it("PM and Management are blocked from WAIVED and N/A; the task stays open", async () => {
    const pm = await as("pm@smartnet.local");
    const mgmt = await as("management@smartnet.local");
    for (const owner of [TeamKey.FRONTEND, TeamKey.BACKEND, TeamKey.NETWORK, TeamKey.CONTENT]) {
      const { task } = await openTask(owner, VerificationType.SELF, Priority.P0);
      for (const u of [pm, mgmt]) {
        await expect(waiveCheck(u, task.id, "not needed", "low")).rejects.toThrow("Not allowed to waive");
        await expect(markNotApplicable(u, task.id, "not needed")).rejects.toThrow("Not allowed to mark N/A");
      }
      expect((await prisma.releaseCheck.findUniqueOrThrow({ where: { id: task.id } })).status).toBe(CheckStatus.NOT_STARTED);
    }
  }, 60000);

  it("SEO can waive and mark N/A; the audit actor is SEO", async () => {
    const seo = await as("seo@smartnet.local");
    const { task: w } = await openTask(TeamKey.FRONTEND, VerificationType.SELF, Priority.P0);
    await expect(waiveCheck(seo, w.id, "Third-party widget, out of our control", "Minor CLS accepted")).resolves.toMatchObject({
      status: CheckStatus.WAIVED,
      waivedById: seo.id,
    });
    const { task: n } = await openTask(TeamKey.NETWORK, VerificationType.SEO_GATED, Priority.P0);
    await expect(markNotApplicable(seo, n.id, "No CDN on this release")).resolves.toMatchObject({ status: CheckStatus.NA, naReason: "No CDN on this release" });
    for (const [id, to] of [[w.id, "WAIVED"], [n.id, "NA"]] as const) {
      const e = await prisma.auditEvent.findFirstOrThrow({ where: { entityId: id, action: "STATUS_CHANGED", newValue: { equals: to } } });
      expect(e.actorId).toBe(seo.id);
    }
  }, 30000);

  it("SEO-owned work: PM and Management are blocked from WAIVED and N/A; SEO decides and is the audit actor", async () => {
    const pm = await as("pm@smartnet.local");
    const mgmt = await as("management@smartnet.local");
    const seo = await as("seo@smartnet.local");
    const { task: w } = await openTask(TeamKey.SEO, VerificationType.SELF, Priority.P1);
    const { task: n } = await openTask(TeamKey.SEO, VerificationType.SELF, Priority.P0);
    for (const u of [pm, mgmt]) {
      for (const t of [w, n]) {
        await expect(waiveCheck(u, t.id, "Out of scope this period", "Low")).rejects.toThrow("Not allowed to waive");
        await expect(markNotApplicable(u, t.id, "Not relevant")).rejects.toThrow("Not allowed to mark N/A");
      }
    }
    expect((await prisma.releaseCheck.findUniqueOrThrow({ where: { id: w.id } })).status).toBe(CheckStatus.NOT_STARTED);
    await expect(waiveCheck(seo, w.id, "Out of scope this period", "Low")).resolves.toMatchObject({ status: CheckStatus.WAIVED, waivedById: seo.id });
    await expect(markNotApplicable(seo, n.id, "No hreflang on a TR-only release")).resolves.toMatchObject({ status: CheckStatus.NA });
    for (const [id, to] of [[w.id, "WAIVED"], [n.id, "NA"]] as const) {
      const e = await prisma.auditEvent.findFirstOrThrow({ where: { entityId: id, action: "STATUS_CHANGED", newValue: { equals: to } } });
      expect(e.actorId).toBe(seo.id);
    }
  }, 30000);
});

afterAll(async () => {
  if (created.length) await prisma.release.deleteMany({ where: { id: { in: created } } });
  await prisma.$disconnect();
});
