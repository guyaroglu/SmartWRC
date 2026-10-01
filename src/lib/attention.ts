import { CheckStatus, Priority, Role } from "@prisma/client";
import type { AuthUser } from "@/lib/authz";
import { isPendingReviewFor, type ReviewQueueCheck } from "@/lib/review-queue";
import { isOpenWork } from "@/lib/release-view";

export type AttentionKind = "correction" | "assigned" | "review" | "blocker" | "release";

export type AttentionItem = {
  id: string;
  /** id + state stamp: a cleared item comes back only when its state changes. */
  key: string;
  kind: AttentionKind;
  n: string;
  label: string;
  meta: string;
  href: string;
  tone: "danger" | "warning" | "brand" | "neutral";
};

export type AttentionCheck = ReviewQueueCheck & {
  id: string;
  title: string;
  priority: Priority;
  ownerTeamId: string;
  ownerUserId: string | null;
  releaseId: string;
  releaseName: string;
  projectName: string;
  updatedAt?: Date;
};

export type AttentionRelease = {
  id: string;
  name: string;
  projectName: string;
  gateStatus: "NO_GO" | "AT_RISK" | "READY" | "NOT_ASSESSED";
  openP0: number;
};

const COMPLETED: CheckStatus[] = [
  CheckStatus.PASS,
  CheckStatus.NA,
  CheckStatus.WAIVED,
  CheckStatus.REMOVED_FROM_SCOPE,
];

export function isAssignedToUser(user: AuthUser, check: Pick<AttentionCheck, "ownerUserId" | "ownerTeamId">): boolean {
  if (check.ownerUserId) return check.ownerUserId === user.id;
  return Boolean(user.teamId && user.teamId === check.ownerTeamId);
}

export function isActionableAssigned(check: Pick<AttentionCheck, "status">): boolean {
  return !COMPLETED.includes(check.status);
}

function stamp(c: AttentionCheck): string {
  return `${c.status}:${c.updatedAt?.getTime() ?? 0}`;
}

export function deriveAttentionItems(
  user: AuthUser,
  checks: AttentionCheck[],
  releases: AttentionRelease[],
  limit = 8,
  dismissed: ReadonlySet<string> = new Set(),
): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const c of checks) {
    if (c.status === CheckStatus.FAIL && isAssignedToUser(user, c)) {
      items.push({
        id: `fail-${c.id}`,
        key: `fail-${c.id}@${stamp(c)}`,
        kind: "correction",
        n: "!",
        label: "Düzeltme gerekli",
        meta: `${c.projectName} · ${c.title}`,
        href: `/checks/${c.id}`,
        tone: "danger",
      });
    }
  }

  for (const c of checks) {
    if (
      isPendingReviewFor(user, {
        ownerUserId: c.ownerUserId,
        ownerTeamId: c.ownerTeamId,
        ownerTeamKey: c.ownerTeamKey,
        reviewerUserId: c.reviewerUserId,
        verificationType: c.verificationType,
        status: c.status,
      })
    ) {
      items.push({
        id: `rev-${c.id}`,
        key: `rev-${c.id}@${stamp(c)}`,
        kind: "review",
        n: "1",
        label: "Onay bekliyor",
        meta: `${c.projectName} · ${c.title}`,
        href: `/checks/${c.id}`,
        tone: "warning",
      });
    }
  }

  for (const c of checks) {
    if (isAssignedToUser(user, c) && isActionableAssigned(c) && c.status !== CheckStatus.FAIL && c.status !== CheckStatus.REVIEW) {
      items.push({
        id: `asg-${c.id}`,
        key: `asg-${c.id}@${stamp(c)}`,
        kind: "assigned",
        n: c.priority === Priority.P0 ? "P0" : "•",
        label: "Sana atandı",
        meta: `${c.projectName} · ${c.title}`,
        href: `/checks/${c.id}`,
        tone: c.priority === Priority.P0 ? "danger" : "brand",
      });
    }
  }

  const caresAboutRelease =
    user.role === Role.PROJECT_MANAGER || user.role === Role.SEO_LEAD || user.role === Role.SYSTEM_ADMIN;
  if (caresAboutRelease) {
    for (const r of releases) {
      if (r.gateStatus === "NO_GO" && r.openP0 > 0) {
        items.push({
          id: `rel-${r.id}`,
          key: `rel-${r.id}@${r.gateStatus}:${r.openP0}`,
          kind: "release",
          n: String(r.openP0),
          label: "Yayına hazır değil",
          meta: `${r.projectName} · ${r.name}`,
          href: `/releases/${r.id}`,
          tone: "danger",
        });
      }
    }
  }

  if (user.role === Role.TEAM_MEMBER) {
    for (const c of checks) {
      if ((c.priority === Priority.P0 || c.priority === Priority.P1) && isOpenWork(c.status) && isAssignedToUser(user, c)) {
        if (!items.some((i) => i.href === `/checks/${c.id}`)) {
          items.push({
            id: `blk-${c.id}`,
            key: `blk-${c.id}@${stamp(c)}`,
            kind: "blocker",
            n: "P0",
            label: "Açık kritik kontrol",
            meta: `${c.projectName} · ${c.title}`,
            href: `/checks/${c.id}`,
            tone: "danger",
          });
        }
      }
    }
  }

  const seen = new Set<string>();
  const unique: AttentionItem[] = [];
  for (const item of items) {
    if (seen.has(item.href) || dismissed.has(item.key)) continue;
    seen.add(item.href);
    unique.push(item);
    if (unique.length >= limit) break;
  }
  return unique;
}

export function countPendingReviews(user: AuthUser, checks: ReviewQueueCheck[]): number {
  return checks.filter((c) => isPendingReviewFor(user, c)).length;
}
