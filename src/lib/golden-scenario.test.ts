import { afterAll, describe, expect, it } from "vitest";
import { CheckStatus, DeploymentStatus, GateStatus, ModuleKey, Priority, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  addEvidence,
  createReleaseFromTemplate,
  emergencyDeploy,
  failCheck,
  markDeployed,
  markProductionVerified,
  passCheck,
  reopenRelease,
  startCheck,
  startPostLaunch,
  submitForReview,
} from "@/lib/release-service";
import { canEditCheck } from "@/lib/authz";
import { openRiskCounts } from "@/lib/gate";
import { SEED_CONTROLS } from "../../prisma/controls";

const createdReleaseIds: string[] = [];

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

describe("golden scenario + V0 invariants", () => {
  it("runs create → fail → pass → network blocker → READY → deploy → reopen", async () => {
    const pm = await userByEmail("pm@smartnet.local");
    const fe = await userByEmail("frontend@smartnet.local");
    const net = await userByEmail("network@smartnet.local");
    const seo = await userByEmail("seo@smartnet.local");
    const mgmt = await userByEmail("management@smartnet.local");
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const template = await prisma.templateVersion.findFirstOrThrow({
      where: { version: "1.0-pilot" },
    });

    const release = await createReleaseFromTemplate({
      user: pm.as,
      projectId: project.id,
      name: `Golden ${Date.now()}`,
      templateVersionId: template.id,
      modules: [ModuleKey.FRONTEND, ModuleKey.NETWORK],
    });
    createdReleaseIds.push(release.id);

    const frontendCheck = await prisma.releaseCheck.findFirstOrThrow({
      where: { releaseId: release.id, controlCode: "FE-014" },
      include: { ownerTeam: true },
    });
    const networkCheck = await prisma.releaseCheck.findFirstOrThrow({
      where: { releaseId: release.id, controlCode: "NET-015" },
      include: { ownerTeam: true },
    });

    expect(frontendCheck.ownerTeam.key).toBe("FRONTEND");
    expect(frontendCheck.reviewerUserId).not.toBe(frontendCheck.ownerUserId);
    expect(frontendCheck.foundByUserId ?? null).not.toBe(frontendCheck.ownerUserId);

    expect(
      canEditCheck(fe.as, {
        ownerUserId: networkCheck.ownerUserId,
        ownerTeamId: networkCheck.ownerTeamId,
        ownerTeamKey: networkCheck.ownerTeam.key,
        reviewerUserId: networkCheck.reviewerUserId,
        verificationType: networkCheck.verificationType,
      }),
    ).toBe(false);

    await expect(startCheck(fe.as, networkCheck.id)).rejects.toThrow();
    await startCheck(fe.as, frontendCheck.id);
    await expect(startCheck(fe.as, frontendCheck.id)).resolves.toMatchObject({ status: CheckStatus.IN_PROGRESS });
    await addEvidence(fe.as, frontendCheck.id, { type: "URL", body: "https://www.example.com/product" });
    await submitForReview(fe.as, frontendCheck.id);
    await expect(submitForReview(fe.as, frontendCheck.id)).resolves.toMatchObject({ status: CheckStatus.REVIEW });
    await expect(passCheck(fe.as, frontendCheck.id)).rejects.toThrow();
    await failCheck(seo.as, frontendCheck.id, "Canonical points to staging domain.");
    await startCheck(fe.as, frontendCheck.id);
    await addEvidence(fe.as, frontendCheck.id, { type: "URL", body: "https://www.example.com/product canonical fixed" });
    await submitForReview(fe.as, frontendCheck.id);
    await passCheck(seo.as, frontendCheck.id);
    await expect(passCheck(seo.as, frontendCheck.id)).resolves.toMatchObject({ status: CheckStatus.PASS });

    let current = await prisma.release.findUniqueOrThrow({
      where: { id: release.id },
      include: { checks: { include: { evidence: true } } },
    });
    expect(current.gateStatus).toBe(GateStatus.NO_GO);
    expect(
      openRiskCounts(
        {
          onboardingType: current.onboardingType,
          baselineCompleted: current.baselineCompleted,
          deploymentStatus: current.deploymentStatus,
        },
        current.checks.map((c) => ({
          status: c.status,
          priority: c.priority,
          releaseBlocker: c.releaseBlocker,
          evidenceRequired: c.evidenceRequired,
          verificationType: c.verificationType,
          module: c.module,
          evidenceCount: c.evidence.length,
        })),
      ).p0,
    ).toBeGreaterThan(0);

    await startCheck(net.as, networkCheck.id);
    await addEvidence(net.as, networkCheck.id, { type: "TEXT", body: "Googlebot 200 on / and /robots.txt" });
    await submitForReview(net.as, networkCheck.id);
    await passCheck(seo.as, networkCheck.id);

    current = await prisma.release.findUniqueOrThrow({
      where: { id: release.id },
      include: { checks: { include: { evidence: true } } },
    });
    expect(current.gateStatus).toBe(GateStatus.READY);
    const readyRisks = openRiskCounts(
      {
        onboardingType: current.onboardingType,
        baselineCompleted: current.baselineCompleted,
        deploymentStatus: current.deploymentStatus,
      },
      current.checks.map((c) => ({
        status: c.status,
        priority: c.priority,
        releaseBlocker: c.releaseBlocker,
        evidenceRequired: c.evidenceRequired,
        verificationType: c.verificationType,
        module: c.module,
        evidenceCount: c.evidence.length,
      })),
    );
    expect(readyRisks.p0).toBe(0);

    await expect(markDeployed(mgmt.as, release.id)).rejects.toThrow();
    await expect(startCheck(mgmt.as, frontendCheck.id)).rejects.toThrow();
    await markDeployed(pm.as, release.id);
    current = await prisma.release.findUniqueOrThrow({
      where: { id: release.id },
      include: { checks: { include: { evidence: true } } },
    });
    expect(current.deploymentStatus).toBe(DeploymentStatus.DEPLOYED);
    expect(current.gateStatus).toBe(GateStatus.READY);

    await startPostLaunch(pm.as, release.id);
    current = await prisma.release.findUniqueOrThrow({
      where: { id: release.id },
      include: { checks: { include: { evidence: true } } },
    });
    expect(current.deploymentStatus).toBe(DeploymentStatus.POST_LAUNCH_VERIFYING);
    expect(current.deploymentStatus).not.toBe(DeploymentStatus.PRODUCTION_VERIFIED);
    await markProductionVerified(pm.as, release.id);
    current = await prisma.release.findUniqueOrThrow({
      where: { id: release.id },
      include: { checks: { include: { evidence: true } } },
    });
    expect(current.deploymentStatus).toBe(DeploymentStatus.PRODUCTION_VERIFIED);

    await expect(startCheck(fe.as, frontendCheck.id)).rejects.toThrow(/locked/i);
    await expect(reopenRelease(fe.as, release.id, "nope")).rejects.toThrow();
    await reopenRelease(seo.as, release.id, "Post-launch canonical regression");
    current = await prisma.release.findUniqueOrThrow({
      where: { id: release.id },
      include: { checks: { include: { evidence: true } } },
    });
    expect(current.deploymentStatus).toBe(DeploymentStatus.POST_LAUNCH_VERIFYING);
    expect(current.deploymentStatus).not.toBe(DeploymentStatus.PRODUCTION_VERIFIED);
    expect(current.reopenedAt).not.toBeNull();

    await startCheck(fe.as, frontendCheck.id);
    current = await prisma.release.findUniqueOrThrow({
      where: { id: release.id },
      include: { checks: { include: { evidence: true } } },
    });
    expect(current.gateStatus).toBe(GateStatus.NO_GO);
    expect(current.deploymentStatus).toBe(DeploymentStatus.POST_LAUNCH_VERIFYING);
    expect(
      openRiskCounts(
        {
          onboardingType: current.onboardingType,
          baselineCompleted: current.baselineCompleted,
          deploymentStatus: current.deploymentStatus,
        },
        current.checks.map((c) => ({
          status: c.status,
          priority: c.priority,
          releaseBlocker: c.releaseBlocker,
          evidenceRequired: c.evidenceRequired,
          verificationType: c.verificationType,
          module: c.module,
          evidenceCount: c.evidence.length,
        })),
      ).p0,
    ).toBeGreaterThan(0);

    const events = await prisma.auditEvent.findMany({
      where: { OR: [{ entityId: release.id }, { entityId: frontendCheck.id }, { entityId: networkCheck.id }] },
      orderBy: { createdAt: "asc" },
    });
    expect(events.some((e) => e.action === "STATUS_CHANGED" && e.newValue === CheckStatus.FAIL)).toBe(true);
    expect(events.some((e) => e.action === "STATUS_CHANGED" && e.newValue === CheckStatus.PASS)).toBe(true);
    expect(events.some((e) => e.action === "GATE_RECALCULATED" && e.newValue === GateStatus.READY)).toBe(true);
    expect(events.some((e) => e.action === "RELEASE_REOPENED")).toBe(true);

    const originalTitle = frontendCheck.title;
    await prisma.templateControl.updateMany({
      where: { controlCode: "FE-014" },
      data: { title: "MUTATED TITLE SHOULD NOT APPEAR ON RELEASE" },
    });
    const after = await prisma.releaseCheck.findUniqueOrThrow({ where: { id: frontendCheck.id } });
    expect(after.title).toBe(originalTitle);
    const canonical = SEED_CONTROLS.find((c) => c.code === "FE-014")!.title;
    await prisma.templateControl.updateMany({
      where: { controlCode: "FE-014" },
      data: { title: canonical },
    });

    expect(pm.model.role).toBe(Role.PROJECT_MANAGER);
    expect(seo.model.role).toBe(Role.SEO_LEAD);
    expect(Priority.P0).toBe("P0");
  }, 30000);

  it("emergency deploy does not create READY and normal deploy is blocked on NO_GO", async () => {
    const pm = await userByEmail("pm@smartnet.local");
    const seo = await userByEmail("seo@smartnet.local");
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0-pilot" } });
    const release = await createReleaseFromTemplate({
      user: pm.as,
      projectId: project.id,
      name: `Golden lifecycle ${Date.now()}`,
      templateVersionId: template.id,
      modules: [ModuleKey.FRONTEND, ModuleKey.NETWORK],
    });
    createdReleaseIds.push(release.id);
    expect(release.gateStatus).toBe(GateStatus.NO_GO);
    await expect(markDeployed(pm.as, release.id)).rejects.toThrow();
    await emergencyDeploy(pm.as, release.id, {
      reason: "Business-critical launch window",
      openRisks: "Open P0 canonical and WAF checks",
      approver2Id: seo.model.id,
    });
    const current = await prisma.release.findUniqueOrThrow({ where: { id: release.id } });
    expect(current.deploymentStatus).toBe(DeploymentStatus.DEPLOYED);
    expect(current.gateStatus).not.toBe(GateStatus.READY);
    expect(current.gateStatus).toBe(GateStatus.NO_GO);
  }, 20000);
});

afterAll(async () => {
  if (createdReleaseIds.length) {
    await prisma.release.deleteMany({ where: { id: { in: createdReleaseIds } } });
  }
  const canonical = SEED_CONTROLS.find((c) => c.code === "FE-014")!.title;
  await prisma.templateControl.updateMany({
    where: { controlCode: "FE-014" },
    data: { title: canonical },
  });
  await prisma.$disconnect();
});
