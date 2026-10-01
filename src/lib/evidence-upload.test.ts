import { afterAll, describe, expect, it } from "vitest";
import { DomainKey, ModuleKey, Priority, TeamKey, VerificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { addEvidence, createAdHocCheck, createReleaseFromTemplate, startCheck } from "@/lib/release-service";
import { loadEvidenceFile } from "@/lib/evidence-download";

const releases: string[] = [];
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

async function as(email: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { email }, include: { team: true } });
  return { id: u.id, role: u.role, teamId: u.teamId, teamKey: u.team?.key ?? null, isActive: true as const };
}

async function frontendTask() {
  const pm = await as("pm@smartnet.local");
  const seo = await as("seo@smartnet.local");
  const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
  const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.1" } });
  const release = await createReleaseFromTemplate({
    user: pm,
    projectId: project.id,
    name: `Evidence upload ${Date.now()}`,
    templateVersionId: template.id,
    modules: [ModuleKey.ECOMMERCE],
  });
  releases.push(release.id);
  const task = await createAdHocCheck(seo, {
    releaseId: release.id,
    title: "Upload probe",
    domains: [DomainKey.SEO],
    ownerTeamKey: TeamKey.FRONTEND,
    priority: Priority.P1,
    verificationType: VerificationType.SEO_GATED,
  });
  const fe = await as("frontend@smartnet.local");
  await startCheck(fe, task.id);
  return { task, fe };
}

describe("file / screenshot evidence", () => {
  it("stores the upload with the record, audits metadata only, and serves it to a signed-in user", async () => {
    const { task, fe } = await frontendTask();
    const e = await addEvidence(fe, task.id, { type: "SCREENSHOT", body: "", file: { name: "../hero.png", type: "image/png", bytes: PNG } });
    expect(e).toMatchObject({ body: "hero.png", fileName: "hero.png", fileSize: PNG.length, mimeType: "image/png" });

    const audit = await prisma.auditEvent.findFirstOrThrow({ where: { entityId: task.id, action: "EVIDENCE_ADDED" } });
    expect(audit.newValue).toMatchObject({ fileName: "hero.png", fileSize: PNG.length, mimeType: "image/png" });
    expect(JSON.stringify(audit.newValue)).not.toContain("data");

    const seo = await as("seo@smartnet.local");
    const got = await loadEvidenceFile(seo, e.id); // reviewer opens it from the task
    expect(got.status).toBe(200);
    if (got.status === 200) expect(Buffer.from(got.data).equals(PNG)).toBe(true);
  }, 30000);

  it("no upload, wrong type or a non-owner → no evidence record", async () => {
    const { task, fe } = await frontendTask();
    await expect(addEvidence(fe, task.id, { type: "FILE", body: "rapor" })).rejects.toThrow("Evidence file is required");
    await expect(addEvidence(fe, task.id, { type: "SCREENSHOT", body: "", file: { name: "r.pdf", bytes: Buffer.from("%PDF-1.4") } })).rejects.toThrow(
      "Screenshot must be an image",
    );
    await expect(addEvidence(fe, task.id, { type: "FILE", body: "", file: { name: "x.exe", bytes: Buffer.from("MZ") } })).rejects.toThrow("not allowed");
    await expect(addEvidence(fe, task.id, { type: "TEXT", body: "note", file: { name: "a.png", bytes: PNG } })).rejects.toThrow();
    const net = await as("network@smartnet.local");
    await expect(addEvidence(net, task.id, { type: "FILE", body: "", file: { name: "a.png", bytes: PNG } })).rejects.toThrow("Not allowed");
    expect(await prisma.evidence.count({ where: { checkId: task.id } })).toBe(0);
  }, 30000);

  it("download gate: anonymous 401, inactive 403, unknown id or text evidence 404", async () => {
    const { task, fe } = await frontendTask();
    const file = await addEvidence(fe, task.id, { type: "FILE", body: "crawl", file: { name: "crawl.csv", bytes: Buffer.from("url,h1\n") } });
    const text = await addEvidence(fe, task.id, { type: "TEXT", body: "Crawl: 23 H1 missing" });
    expect((await loadEvidenceFile(null, file.id)).status).toBe(401);
    expect((await loadEvidenceFile({ ...fe, isActive: false }, file.id)).status).toBe(403);
    expect((await loadEvidenceFile(fe, "does-not-exist")).status).toBe(404);
    expect((await loadEvidenceFile(fe, text.id)).status).toBe(404);
    expect((await loadEvidenceFile(fe, file.id)).status).toBe(200);
  }, 30000);
});

afterAll(async () => {
  if (releases.length) await prisma.release.deleteMany({ where: { id: { in: releases } } });
  await prisma.$disconnect();
});
