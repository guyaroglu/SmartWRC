import { afterAll, describe, expect, it } from "vitest";
import {
  CheckSource,
  CheckStatus,
  DomainKey,
  GateStatus,
  ModuleKey,
  Priority,
  Role,
  TeamKey,
  VerificationType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  canCreateAdHocIssue,
  canEditCheck,
  canPassCheck,
  canFailCheck,
  type AuthUser,
  type CheckAuthzInput,
} from "@/lib/authz";
import { isPendingReviewFor } from "@/lib/review-queue";
import {
  addEvidence,
  createAdHocCheck,
  createReleaseFromTemplate,
  failCheck,
  markDeployed,
  markProductionVerified,
  passCheck,
  startCheck,
  startPostLaunch,
  submitForReview,
} from "@/lib/release-service";

// ---------------------------------------------------------------------------
// Pure authorization: approval authority follows the verification contract.
// ---------------------------------------------------------------------------

const fe: AuthUser = { id: "fe", role: Role.TEAM_MEMBER, teamId: "t-fe", teamKey: TeamKey.FRONTEND, isActive: true };
const content: AuthUser = { id: "cnt", role: Role.TEAM_MEMBER, teamId: "t-cnt", teamKey: TeamKey.CONTENT, isActive: true };
const content2: AuthUser = { id: "cnt2", role: Role.TEAM_MEMBER, teamId: "t-cnt", teamKey: TeamKey.CONTENT, isActive: true };
const net: AuthUser = { id: "net", role: Role.TEAM_MEMBER, teamId: "t-net", teamKey: TeamKey.NETWORK, isActive: true };
const seo: AuthUser = { id: "seo", role: Role.SEO_LEAD, teamId: "t-seo", teamKey: TeamKey.SEO, isActive: true };
const pm: AuthUser = { id: "pm", role: Role.PROJECT_MANAGER, teamId: null, teamKey: null, isActive: true };
const mgmt: AuthUser = { id: "mg", role: Role.MANAGEMENT, teamId: null, teamKey: null, isActive: true };
const admin: AuthUser = { id: "adm", role: Role.SYSTEM_ADMIN, teamId: null, teamKey: null, isActive: true };

const feSelf: CheckAuthzInput = { ownerUserId: "fe", ownerTeamId: "t-fe", ownerTeamKey: TeamKey.FRONTEND, reviewerUserId: "fe", verificationType: VerificationType.SELF };
const feSeoGated: CheckAuthzInput = { ...feSelf, reviewerUserId: "seo", verificationType: VerificationType.SEO_GATED };
const seoOwnedSeoGated: CheckAuthzInput = { ownerUserId: "seo", ownerTeamId: "t-seo", ownerTeamKey: TeamKey.SEO, reviewerUserId: "seo", verificationType: VerificationType.SEO_GATED };
const cntCrossNetReviewer: CheckAuthzInput = { ownerUserId: "cnt", ownerTeamId: "t-cnt", ownerTeamKey: TeamKey.CONTENT, reviewerUserId: "net", verificationType: VerificationType.CROSS_TEAM };
const cntCrossSeoReviewer: CheckAuthzInput = { ...cntCrossNetReviewer, reviewerUserId: "seo" };
const cntCrossOwnTeamReviewer: CheckAuthzInput = { ...cntCrossNetReviewer, reviewerUserId: "cnt2" };

describe("spec closure — authorization", () => {
  it("only SEO Lead, PM and System Admin may open a new ad-hoc issue", () => {
    expect(canCreateAdHocIssue(seo)).toBe(true);
    expect(canCreateAdHocIssue(pm)).toBe(true);
    expect(canCreateAdHocIssue(admin)).toBe(true);
    expect(canCreateAdHocIssue(fe)).toBe(false);
    expect(canCreateAdHocIssue(mgmt)).toBe(false);
  });

  it("implementation actions belong to the owner team (SEO/PM coordinate, do not implement)", () => {
    expect(canEditCheck(fe, feSelf)).toBe(true);
    expect(canEditCheck(seo, feSelf)).toBe(false);
    expect(canEditCheck(pm, feSelf)).toBe(false);
    expect(canEditCheck(seo, seoOwnedSeoGated)).toBe(true);
    expect(canEditCheck(admin, feSelf)).toBe(true);
    expect(canEditCheck(mgmt, feSelf)).toBe(false);
  });

  it("PM has no universal review privilege", () => {
    for (const check of [feSelf, feSeoGated, cntCrossNetReviewer, cntCrossSeoReviewer]) {
      expect(canPassCheck(pm, check)).toBe(false);
      expect(canFailCheck(pm, check)).toBe(false);
    }
  });

  it("SEO has no universal review privilege", () => {
    expect(canPassCheck(seo, feSelf)).toBe(false);
    expect(canPassCheck(seo, cntCrossNetReviewer)).toBe(false);
    expect(isPendingReviewFor(seo, { ...feSelf, status: CheckStatus.REVIEW })).toBe(false);
    expect(isPendingReviewFor(seo, { ...cntCrossNetReviewer, status: CheckStatus.REVIEW })).toBe(false);
  });

  it("SEO_GATED: SEO Lead approves, the implementation team cannot self-approve", () => {
    expect(canPassCheck(seo, feSeoGated)).toBe(true);
    expect(canPassCheck(fe, feSeoGated)).toBe(false);
    expect(canPassCheck(seo, seoOwnedSeoGated)).toBe(true); // approved exception: SEO-owned standards
  });

  it("CROSS_TEAM: only the assigned reviewer outside the owner team approves", () => {
    expect(canPassCheck(net, cntCrossNetReviewer)).toBe(true); // non-SEO reviewer works
    expect(canPassCheck(seo, cntCrossNetReviewer)).toBe(false); // SEO not assigned → denied
    expect(canPassCheck(pm, cntCrossNetReviewer)).toBe(false);
    expect(canPassCheck(content, cntCrossNetReviewer)).toBe(false); // owner
    expect(canPassCheck(fe, cntCrossNetReviewer)).toBe(false); // unrelated
    expect(canPassCheck(seo, cntCrossSeoReviewer)).toBe(true); // SEO only when actually assigned
    expect(canPassCheck(content2, cntCrossOwnTeamReviewer)).toBe(false); // owner-team reviewer
    expect(isPendingReviewFor(net, { ...cntCrossNetReviewer, status: CheckStatus.REVIEW })).toBe(true);
  });

  it("SELF stays inside the owner team", () => {
    expect(canPassCheck(fe, feSelf)).toBe(true);
    expect(canPassCheck(net, feSelf)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Domain (wrc_test): AD_HOC issues are ordinary ReleaseChecks.
// ---------------------------------------------------------------------------

const created: string[] = [];

async function userByEmail(email: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { email }, include: { team: true } });
  return {
    model: u,
    as: { id: u.id, role: u.role, teamId: u.teamId, teamKey: u.team?.key ?? null, isActive: true as const },
  };
}

async function emptyRelease(name: string) {
  const pmUser = await userByEmail("pm@smartnet.local");
  const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
  const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0" } });
  // ECOMMERCE has no catalogue controls → a NEW release with zero template checks.
  const release = await createReleaseFromTemplate({
    user: pmUser.as,
    projectId: project.id,
    name: `${name} ${Date.now()}`,
    templateVersionId: template.id,
    modules: [ModuleKey.ECOMMERCE],
  });
  created.push(release.id);
  return release;
}

describe("spec closure — AD_HOC issues", () => {
  it("template-generated checks default to source TEMPLATE", async () => {
    const pmUser = await userByEmail("pm@smartnet.local");
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0" } });
    const release = await createReleaseFromTemplate({
      user: pmUser.as,
      projectId: project.id,
      name: `Source default ${Date.now()}`,
      templateVersionId: template.id,
      modules: [ModuleKey.CONTENT],
    });
    created.push(release.id);
    const checks = await prisma.releaseCheck.findMany({ where: { releaseId: release.id } });
    expect(checks.length).toBeGreaterThan(0);
    expect(checks.every((c) => c.source === CheckSource.TEMPLATE)).toBe(true);
    // Catalogue-driven reviewer: CNT-017 keeps its SEO reviewer from defaultReviewerRole.
    const seoUser = await userByEmail("seo@smartnet.local");
    expect(checks.find((c) => c.controlCode === "CNT-017")?.reviewerUserId).toBe(seoUser.model.id);
  }, 20000);

  it("SEO opens an issue: Found By = creator, owner stays Frontend, P0 blocks, flow passes, gate recalculates", async () => {
    const seoUser = await userByEmail("seo@smartnet.local");
    const feUser = await userByEmail("frontend@smartnet.local");
    const release = await emptyRelease("AD_HOC SEO");
    expect(release.gateStatus).toBe(GateStatus.READY);

    const issue = await createAdHocCheck(seoUser.as, {
      releaseId: release.id,
      title: "Canonical staging domain gösteriyor",
      domains: [DomainKey.SEO],
      ownerTeamKey: TeamKey.FRONTEND,
      priority: Priority.P0,
      verificationType: VerificationType.SEO_GATED,
      evidence: { type: "URL", body: "https://www.audi.com.tr/blog → canonical staging" },
    });
    const stored = await prisma.releaseCheck.findUniqueOrThrow({ where: { id: issue.id }, include: { ownerTeam: true } });
    expect(stored.source).toBe(CheckSource.AD_HOC);
    expect(stored.foundByUserId).toBe(seoUser.model.id);
    expect(stored.foundByTeamId).toBe(seoUser.model.teamId);
    expect(stored.ownerTeam.key).toBe(TeamKey.FRONTEND);
    expect(stored.ownerUserId).not.toBe(seoUser.model.id);
    expect(stored.releaseBlocker).toBe(true);
    expect(stored.controlCode).toMatch(/^ADH-\d{3}$/);
    expect((stored.templateControlSnapshot as { source?: string }).source).toBe("AD_HOC");

    const audit = await prisma.auditEvent.findFirstOrThrow({ where: { entityType: "ReleaseCheck", entityId: issue.id, action: "CREATED" } });
    expect(audit.actorId).toBe(seoUser.model.id);
    expect(audit.newValue).toMatchObject({ source: "AD_HOC", ownerTeamKey: "FRONTEND", priority: "P0", verificationType: "SEO_GATED" });

    // Unresolved AD_HOC P0 affects the calculated decision like any template P0.
    expect((await prisma.release.findUniqueOrThrow({ where: { id: release.id } })).gateStatus).toBe(GateStatus.NO_GO);

    // SEO cannot implement Frontend's work; Frontend cannot self-approve SEO_GATED.
    await expect(startCheck(seoUser.as, issue.id)).rejects.toThrow();
    await startCheck(feUser.as, issue.id);
    await addEvidence(feUser.as, issue.id, { type: "TEXT", body: "SITE_URL düzeltildi; /blog canonical production." });
    await submitForReview(feUser.as, issue.id);
    await expect(passCheck(feUser.as, issue.id)).rejects.toThrow();
    await failCheck(seoUser.as, issue.id, "Hâlâ bir sayfada staging görünüyor.");
    await startCheck(feUser.as, issue.id);
    await addEvidence(feUser.as, issue.id, { type: "TEXT", body: "Kalan sayfa da düzeltildi." });
    await submitForReview(feUser.as, issue.id);
    await passCheck(seoUser.as, issue.id);

    const after = await prisma.releaseCheck.findUniqueOrThrow({ where: { id: issue.id }, include: { evidence: true } });
    expect(after.status).toBe(CheckStatus.PASS);
    expect(after.evidence.length).toBe(3);
    expect(after.foundByUserId).toBe(seoUser.model.id);
    expect((await prisma.release.findUniqueOrThrow({ where: { id: release.id } })).gateStatus).toBe(GateStatus.READY);
  }, 30000);

  it("Team Member and Management cannot open issues; PM and Admin can (Found By = creator)", async () => {
    const release = await emptyRelease("AD_HOC perms");
    const base = {
      releaseId: release.id,
      title: "Perm probe",
      domains: [DomainKey.UX],
      ownerTeamKey: TeamKey.FRONTEND,
      priority: Priority.P2,
      verificationType: VerificationType.SELF,
    };
    await expect(createAdHocCheck((await userByEmail("frontend@smartnet.local")).as, base)).rejects.toThrow("Not allowed to create ad-hoc issue");
    await expect(createAdHocCheck((await userByEmail("management@smartnet.local")).as, base)).rejects.toThrow("Not allowed to create ad-hoc issue");
    const pmUser = await userByEmail("pm@smartnet.local");
    const adminUser = await userByEmail("admin@smartnet.local");
    const byPm = await createAdHocCheck(pmUser.as, base);
    const byAdmin = await createAdHocCheck(adminUser.as, { ...base, title: "Admin probe" });
    expect(byPm.foundByUserId).toBe(pmUser.model.id);
    expect(byAdmin.foundByUserId).toBe(adminUser.model.id);
    expect(byPm.controlCode).not.toBe(byAdmin.controlCode);
  }, 20000);

  it("CROSS_TEAM with a non-SEO reviewer: only that reviewer approves; owner-team reviewer rejected", async () => {
    const pmUser = await userByEmail("pm@smartnet.local");
    const contentUser = await userByEmail("content@smartnet.local");
    const netUser = await userByEmail("network@smartnet.local");
    const seoUser = await userByEmail("seo@smartnet.local");
    const feUser = await userByEmail("frontend@smartnet.local");
    const release = await emptyRelease("AD_HOC cross");

    await expect(
      createAdHocCheck(pmUser.as, {
        releaseId: release.id,
        title: "Owner-team reviewer probe",
        domains: [DomainKey.CONTENT_QUALITY],
        ownerTeamKey: TeamKey.CONTENT,
        priority: Priority.P1,
        verificationType: VerificationType.CROSS_TEAM,
        reviewerUserId: contentUser.model.id,
      }),
    ).rejects.toThrow("CROSS_TEAM reviewer must not belong to the owner team");

    const issue = await createAdHocCheck(pmUser.as, {
      releaseId: release.id,
      title: "Kampanya sayfasında kırık iç link",
      domains: [DomainKey.CONTENT_QUALITY],
      ownerTeamKey: TeamKey.CONTENT,
      priority: Priority.P1,
      verificationType: VerificationType.CROSS_TEAM,
      reviewerUserId: netUser.model.id,
    });
    await startCheck(contentUser.as, issue.id);
    await addEvidence(contentUser.as, issue.id, { type: "TEXT", body: "Link düzeltildi." });
    await submitForReview(contentUser.as, issue.id);
    await expect(passCheck(seoUser.as, issue.id)).rejects.toThrow();
    await expect(passCheck(pmUser.as, issue.id)).rejects.toThrow();
    await expect(passCheck(contentUser.as, issue.id)).rejects.toThrow();
    await expect(passCheck(feUser.as, issue.id)).rejects.toThrow();
    await expect(passCheck(netUser.as, issue.id)).resolves.toMatchObject({ status: CheckStatus.PASS });
  }, 30000);

  it("PRODUCTION_VERIFIED release cannot receive an ad-hoc issue directly", async () => {
    const pmUser = await userByEmail("pm@smartnet.local");
    const seoUser = await userByEmail("seo@smartnet.local");
    const release = await emptyRelease("AD_HOC locked");
    await markDeployed(pmUser.as, release.id);
    await startPostLaunch(pmUser.as, release.id);
    await markProductionVerified(pmUser.as, release.id);
    await expect(
      createAdHocCheck(seoUser.as, {
        releaseId: release.id,
        title: "Locked probe",
        domains: [DomainKey.SEO],
        ownerTeamKey: TeamKey.FRONTEND,
        priority: Priority.P0,
        verificationType: VerificationType.SEO_GATED,
      }),
    ).rejects.toThrow(/locked/);
    expect(await prisma.releaseCheck.count({ where: { releaseId: release.id } })).toBe(0);
  }, 30000);
});

describe("spec closure — catalogue CROSS_TEAM invariant", () => {
  it("v1.1 fixes BASE-006 (Network owns, PM verifies) and leaves v1.0 untouched", async () => {
    const v10 = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0" }, include: { controls: true } });
    const v11 = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.1" }, include: { controls: true } });
    const old = v10.controls.find((c) => c.controlCode === "BASE-006")!;
    const fixed = v11.controls.find((c) => c.controlCode === "BASE-006")!;
    expect(old.ownerTeamKey).toBe(TeamKey.SEO);
    expect(fixed.ownerTeamKey).toBe(TeamKey.NETWORK);
    expect(fixed.verificationType).toBe(VerificationType.CROSS_TEAM);
    expect(fixed.defaultReviewerRole).toBe(Role.PROJECT_MANAGER);
    expect(v11.controls.length).toBe(v10.controls.length);
  });

  it("future releases from any template version never assign a CROSS_TEAM reviewer from the owner team", async () => {
    const pmUser = await userByEmail("pm@smartnet.local");
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const versions = await prisma.templateVersion.findMany();
    for (const version of versions) {
      const release = await createReleaseFromTemplate({
        user: pmUser.as,
        projectId: project.id,
        name: `Invariant ${version.version} ${Date.now()}`,
        templateVersionId: version.id,
        modules: Object.values(ModuleKey),
      });
      created.push(release.id);
      const cross = await prisma.releaseCheck.findMany({
        where: { releaseId: release.id, verificationType: VerificationType.CROSS_TEAM },
        include: { reviewerUser: true },
      });
      for (const c of cross) {
        expect(c.reviewerUser?.teamId ?? null).not.toBe(c.ownerTeamId);
      }
      const base006 = cross.find((c) => c.controlCode === "BASE-006");
      if (version.version === "1.0") expect(base006?.reviewerUserId).toBeNull(); // guard: left for PM to assign
      if (version.version === "1.1") expect(base006?.reviewerUserId).toBe(pmUser.model.id);
    }
  }, 60000);
});

afterAll(async () => {
  if (created.length) {
    await prisma.release.deleteMany({ where: { id: { in: created } } });
  }
  await prisma.$disconnect();
});
