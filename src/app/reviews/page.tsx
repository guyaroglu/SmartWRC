import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckStatus, Role } from "@prisma/client";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { isPendingReviewFor } from "@/lib/review-queue";
import { relativeTr } from "@/lib/format";
import { teamLabel } from "@/lib/labels";
import { buttonClass, EmptyState, PageHeader, PriorityBadge, Segmented, Shell } from "@/components/shell";
import { IconPaperclip, TeamGlyph } from "@/components/icons";

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
            <strong className="text-sand-900">{mine.length} görev</strong> onay bekliyor
            {criticalCount ? (
              <>
                {" "}
                · <strong className="text-rust-700">{criticalCount} tanesi kritik</strong>
              </>
            ) : null}
            <span className="mt-1 block text-[13px] text-sand-500">
              Burada yalnızca doğrulaması sana düşen görevler var. Ekip İçi Onay görevlerini ekip kendisi doğrular.
            </span>
          </>
        }
        actions={
          <Segmented
            items={filters.map((filter) => ({ href: `/reviews?f=${filter.id}`, label: filter.label, active: f === filter.id }))}
          />
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="Onay bekleyen görev yok." body="Ekipler kanıt ekleyip onaya gönderdiğinde burada görünür." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-sand-200 bg-white shadow-card">
          <div className="grid min-w-[760px] grid-cols-[minmax(0,2.6fr)_1fr_0.8fr_0.9fr_0.8fr_90px] gap-3 bg-sand-50 px-5 py-3 text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">
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
                className="grid min-w-[760px] grid-cols-[minmax(0,2.6fr)_1fr_0.8fr_0.9fr_0.8fr_90px] items-center gap-3 border-t border-sand-200 px-5 py-3.5 transition-colors duration-fast ease-out hover:bg-sand-50"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-sand-500">{c.release.project.name}</div>
                  <div className="mt-0.5 text-sm font-bold text-sand-900" style={{ lineHeight: 1.35 }}>
                    {c.title}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-sand-900">
                  <TeamGlyph teamKey={c.ownerTeam.key} />
                  {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name}
                </span>
                <span>
                  <PriorityBadge priority={c.priority} />
                </span>
                <span
                  className={`inline-flex items-center gap-[5px] text-[13px] font-semibold ${c.evidence.length === 0 ? "text-rust-700" : "text-sand-800"}`}
                >
                  <IconPaperclip size={13} />
                  {c.evidence.length} kanıt
                </span>
                <span className="text-[13px] text-sand-500">{relativeTr(c.updatedAt)}</span>
                <Link href={`/checks/${c.id}`} className={buttonClass(critical ? "primary" : "secondary", "sm")}>
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
