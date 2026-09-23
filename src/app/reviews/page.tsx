import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckStatus, Role } from "@prisma/client";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { isPendingReviewFor } from "@/lib/review-queue";
import { relativeTr } from "@/lib/format";
import { teamLabel } from "@/lib/labels";
import { EmptyState, PageHeader, PriorityBadge, Shell } from "@/components/shell";
import { TeamGlyph } from "@/components/icons";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const user = await requireUser();
  if (user.role === Role.MANAGEMENT) redirect("/management");
  const { f = "all" } = await searchParams;
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
  const criticalCount = mine.filter((c) => c.priority === "P0").length;
  const filtered = mine.filter((c) => {
    if (f === "critical") return c.priority === "P0";
    if (f === "no-evidence") return c.evidence.length === 0;
    return true;
  });
  const filters = [
    { id: "all", label: "Tümü" },
    { id: "critical", label: "Kritik" },
    { id: "no-evidence", label: "Kanıtsız" },
  ];

  return (
    <Shell user={user}>
      <PageHeader
        title="Onaylar"
        subtitle={
          <>
            <strong className="text-sand-900">{mine.length} kontrol</strong> onay bekliyor
            {criticalCount ? (
              <>
                {" "}
                · <strong className="text-rust-700">{criticalCount} tanesi kritik</strong>
              </>
            ) : null}
          </>
        }
        actions={
          <div className="flex gap-1 rounded-full bg-sand-100 p-0.5 text-xs font-semibold">
            {filters.map((filter) => (
              <Link
                key={filter.id}
                href={`/reviews?f=${filter.id}`}
                className={`rounded-full px-3 py-1.5 no-underline ${f === filter.id ? "bg-white text-sand-900 shadow-card" : "text-sand-700"}`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="Onay bekleyen kontrol yok." body="Ekipler kanıt gönderdiğinde burada görünür." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-sand-200 bg-white shadow-card">
          <div className="grid min-w-[760px] grid-cols-[minmax(0,2.6fr)_1fr_0.8fr_0.9fr_0.8fr_90px] gap-3 bg-sand-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400">
            <span>Kontrol</span>
            <span>Sorumlu</span>
            <span>Öncelik</span>
            <span>Kanıt</span>
            <span>Gönderildi</span>
            <span />
          </div>
          {filtered.map((c) => {
            const critical = c.priority === "P0";
            return (
              <div
                key={c.id}
                className="grid min-w-[760px] grid-cols-[minmax(0,2.6fr)_1fr_0.8fr_0.9fr_0.8fr_90px] items-center gap-3 border-t border-sand-200 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-sand-500">{c.release.project.name}</div>
                  <div className="mt-0.5 text-sm font-bold leading-snug text-sand-900">{c.title}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-sand-900">
                  <TeamGlyph teamKey={c.ownerTeam.key} />
                  {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name}
                </span>
                <PriorityBadge priority={c.priority} />
                <span className={`text-[13px] font-semibold ${c.evidence.length === 0 ? "text-rust-700" : "text-sand-800"}`}>
                  {c.evidence.length} kanıt
                </span>
                <span className="text-[13px] text-sand-500">{relativeTr(c.updatedAt)}</span>
                <Link
                  href={`/checks/${c.id}`}
                  className={`inline-flex h-[34px] items-center justify-center rounded-xl px-3 text-xs font-semibold no-underline ${
                    critical ? "bg-clay-500 text-white hover:bg-clay-600" : "border border-sand-300 bg-white text-sand-800 hover:bg-sand-50"
                  }`}
                >
                  İncele
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
