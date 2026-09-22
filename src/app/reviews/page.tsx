import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { PriorityBadge, Shell } from "@/components/shell";
import { CheckStatus, Role } from "@prisma/client";
import { isPendingReviewFor } from "@/lib/review-queue";
import { relativeTr } from "@/lib/format";
import { teamLabel } from "@/lib/labels";
import { redirect } from "next/navigation";

export default async function ReviewsPage() {
  const user = await requireUser();
  if (user.role === Role.MANAGEMENT) redirect("/management");
  const checks = await prisma.releaseCheck.findMany({
    where: { status: CheckStatus.REVIEW },
    include: {
      release: { include: { project: true } },
      ownerTeam: true,
      ownerUser: true,
      evidence: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  const mine = checks.filter((c) =>
    isPendingReviewFor(user, {
      ownerUserId: c.ownerUserId,
      ownerTeamId: c.ownerTeamId,
      ownerTeamKey: c.ownerTeam.key,
      reviewerUserId: c.reviewerUserId,
      verificationType: c.verificationType,
      status: c.status,
    }),
  );

  return (
    <Shell name={user.name} role={user.role}>
      <h1 className="text-2xl font-semibold">Onaylar</h1>
      <p className="mt-1 text-sm text-ink/65">Sadece gerçekten sizin onayınızı gerektiren kontroller burada görünür.</p>
      <ul className="mt-4 space-y-2">
        {mine.length === 0 ? <li className="text-sm text-ink/55">Bekleyen onay yok.</li> : null}
        {mine.map((c) => (
          <li key={c.id} className="rounded-lg border border-ink/10 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link className="font-medium no-underline" href={`/checks/${c.id}`}>
                  {c.title}
                </Link>
                <p className="mt-1 text-sm text-ink/65">
                  {c.release.project.name} · {c.release.name}
                </p>
                <p className="mt-1 text-xs text-ink/55">
                  Sorumlu ekip: {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name}
                  {c.ownerUser ? ` · ${c.ownerUser.name}` : ""} · Kanıt: {c.evidence.length} · {relativeTr(c.updatedAt)}
                </p>
              </div>
              <PriorityBadge priority={c.priority} />
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
