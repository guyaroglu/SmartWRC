import { afterAll, describe, expect, it } from "vitest";
import { CheckStatus, GateStatus, ModuleKey, OnboardingType, VerificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  addEvidence,
  createReleaseFromTemplate,
  passCheck,
  startCheck,
  submitForReview,
} from "@/lib/release-service";
import { isPendingReviewFor } from "@/lib/review-queue";

const created: string[] = [];

async function userByEmail(email: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { email }, include: { team: true } });
  return {
    model: u,
    as: {
      id: u.id,
      role: u.role,
      teamId: u.teamId,
      teamKey: u.team?.key ?? null,
      isActive: true as const,
    },
  };
}

describe("SELF / CROSS_TEAM / LIVE_UNVERIFIED", () => {
  it("Frontend SELF work is approved only by SEO (2026-10-01 rule)", async () => {
    const pm = await userByEmail("pm@smartnet.local");
    const fe = await userByEmail("frontend@smartnet.local");
    const seo = await userByEmail("seo@smartnet.local");
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0" } });
    const release = await createReleaseFromTemplate({
      user: pm.as,
      projectId: project.id,
      name: `SELF flow ${Date.now()}`,
      templateVersionId: template.id,
      modules: [ModuleKey.FRONTEND],
    });
    created.push(release.id);

    const selfCheck = await prisma.releaseCheck.findFirstOrThrow({
      where: { releaseId: release.id, controlCode: "FE-003" },
      include: { ownerTeam: true },
    });
    expect(selfCheck.verificationType).toBe(VerificationType.SELF);

    await startCheck(fe.as, selfCheck.id);
    await addEvidence(fe.as, selfCheck.id, { type: "TEXT", body: "Primary nav works on production homepage." });
    await submitForReview(fe.as, selfCheck.id);

    const pending = {
      ownerUserId: selfCheck.ownerUserId,
      ownerTeamId: selfCheck.ownerTeamId,
      ownerTeamKey: selfCheck.ownerTeam.key,
      reviewerUserId: selfCheck.reviewerUserId,
      verificationType: selfCheck.verificationType,
      status: CheckStatus.REVIEW,
    };
    expect(isPendingReviewFor(seo.as, pending)).toBe(true);
    expect(isPendingReviewFor(fe.as, pending)).toBe(false);

    await expect(passCheck(fe.as, selfCheck.id)).rejects.toThrow();
    await expect(passCheck(seo.as, selfCheck.id)).resolves.toMatchObject({ status: CheckStatus.PASS });
    const after = await prisma.releaseCheck.findUniqueOrThrow({ where: { id: selfCheck.id } });
    expect(after.status).toBe(CheckStatus.PASS);
  }, 20000);

  it("CROSS_TEAM owner cannot PASS; assigned reviewer can; unsubmitted stays out of queue", async () => {
    const pm = await userByEmail("pm@smartnet.local");
    const content = await userByEmail("content@smartnet.local");
    const seo = await userByEmail("seo@smartnet.local");
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0" } });
    const release = await createReleaseFromTemplate({
      user: pm.as,
      projectId: project.id,
      name: `CROSS flow ${Date.now()}`,
      templateVersionId: template.id,
      modules: [ModuleKey.CONTENT],
    });
    created.push(release.id);

    const cross = await prisma.releaseCheck.findFirstOrThrow({
      where: { releaseId: release.id, controlCode: "CNT-017" },
      include: { ownerTeam: true },
    });
    expect(cross.verificationType).toBe(VerificationType.CROSS_TEAM);
    expect(cross.reviewerUserId).toBe(seo.model.id);

    const unsubmitted = {
      ownerUserId: cross.ownerUserId,
      ownerTeamId: cross.ownerTeamId,
      ownerTeamKey: cross.ownerTeam.key,
      reviewerUserId: cross.reviewerUserId,
      verificationType: cross.verificationType,
      status: CheckStatus.NOT_STARTED,
    };
    expect(isPendingReviewFor(seo.as, unsubmitted)).toBe(false);

    await startCheck(content.as, cross.id);
    await addEvidence(content.as, cross.id, { type: "TEXT", body: "No staging URLs remain in rendered HTML." });
    await submitForReview(content.as, cross.id);
    await expect(passCheck(content.as, cross.id)).rejects.toThrow();

    const pending = { ...unsubmitted, status: CheckStatus.REVIEW };
    expect(isPendingReviewFor(seo.as, pending)).toBe(true);
    expect(isPendingReviewFor(content.as, pending)).toBe(false);

    await passCheck(seo.as, cross.id);
    const after = await prisma.releaseCheck.findUniqueOrThrow({ where: { id: cross.id } });
    expect(after.status).toBe(CheckStatus.PASS);
  }, 20000);

  it("LIVE_UNVERIFIED does not fabricate PASS and stays NOT_ASSESSED until baseline", async () => {
    const pm = await userByEmail("pm@smartnet.local");
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0-pilot" } });
    const release = await createReleaseFromTemplate({
      user: pm.as,
      projectId: project.id,
      name: `LIVE_UNVERIFIED ${Date.now()}`,
      templateVersionId: template.id,
      modules: [ModuleKey.FRONTEND, ModuleKey.NETWORK],
      onboardingType: OnboardingType.LIVE_UNVERIFIED,
    });
    created.push(release.id);

    const checks = await prisma.releaseCheck.findMany({ where: { releaseId: release.id } });
    expect(release.baselineCompleted).toBe(false);
    expect(release.deploymentStatus).toBe("NOT_DEPLOYED");
    expect(release.gateStatus).toBe(GateStatus.NOT_ASSESSED);
    expect(checks.length).toBeGreaterThan(0);
    expect(checks.every((c) => c.status === CheckStatus.NOT_STARTED)).toBe(true);
    expect(checks.some((c) => c.status === CheckStatus.PASS)).toBe(false);
  }, 20000);
});

afterAll(async () => {
  if (created.length) {
    await prisma.release.deleteMany({ where: { id: { in: created } } });
  }
  await prisma.$disconnect();
});
