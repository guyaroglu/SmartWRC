import { CheckStatus } from "@prisma/client";
import type { AuthUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { blockingChecks } from "@/lib/release-view";
import { countPendingReviews, deriveAttentionItems, type AttentionCheck } from "@/lib/attention";

export async function loadAttentionBundle(user: AuthUser) {
  const [rawChecks, rawReleases, reviewCandidates] = await Promise.all([
    prisma.releaseCheck.findMany({
      where: {
        release: { archived: false },
        status: { notIn: [CheckStatus.PASS, CheckStatus.NA, CheckStatus.WAIVED, CheckStatus.REMOVED_FROM_SCOPE] },
      },
      include: { ownerTeam: true, release: { include: { project: true } } },
      orderBy: { updatedAt: "desc" },
      take: 80,
    }),
    prisma.release.findMany({
      where: { archived: false, gateStatus: { in: ["NO_GO", "AT_RISK"] } },
      include: { project: true, checks: { include: { ownerTeam: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.releaseCheck.findMany({
      where: { status: CheckStatus.REVIEW, release: { archived: false } },
      include: { ownerTeam: true },
      take: 80,
    }),
  ]);

  const checks: AttentionCheck[] = rawChecks.map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    priority: c.priority,
    ownerUserId: c.ownerUserId,
    ownerTeamId: c.ownerTeamId,
    ownerTeamKey: c.ownerTeam.key,
    reviewerUserId: c.reviewerUserId,
    verificationType: c.verificationType,
    releaseId: c.releaseId,
    releaseName: c.release.name,
    projectName: c.release.project.name,
  }));

  const releases = rawReleases.map((r) => ({
    id: r.id,
    name: r.name,
    projectName: r.project.name,
    gateStatus: r.gateStatus,
    openP0: blockingChecks(
      {
        onboardingType: r.onboardingType,
        baselineCompleted: r.baselineCompleted,
        deploymentStatus: r.deploymentStatus,
      },
      r.checks,
    ).length,
  }));

  const reviewCount = countPendingReviews(
    user,
    reviewCandidates.map((c) => ({
      ownerUserId: c.ownerUserId,
      ownerTeamId: c.ownerTeamId,
      ownerTeamKey: c.ownerTeam.key,
      reviewerUserId: c.reviewerUserId,
      verificationType: c.verificationType,
      status: c.status,
    })),
  );

  return {
    items: deriveAttentionItems(user, checks, releases),
    reviewCount,
  };
}
