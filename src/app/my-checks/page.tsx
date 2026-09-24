import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader, PriorityBadge, Segmented, Shell, StatusBadge } from "@/components/shell";
import { assignedTeamWhere } from "@/lib/assigned";
import { CheckStatus } from "@prisma/client";
import { dateShortTr } from "@/lib/format";

const FILTERS = [
  { id: "open", label: "Tümü" },
  { id: "critical", label: "Kritik" },
  { id: "fail", label: "Düzeltme Gerekenler" },
  { id: "progress", label: "Çalışılanlar" },
  { id: "review", label: "Onay Bekleyenler" },
  { id: "blocked", label: "Bloklananlar" },
  { id: "done", label: "Tamamlananlar" },
] as const;

export default async function MyChecksPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const user = await requireUser();
  const { f = "open" } = await searchParams;
  const checks = await prisma.releaseCheck.findMany({
    where: assignedTeamWhere(user),
    include: { release: { include: { project: true } }, ownerTeam: true },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
  });

  const filtered = checks.filter((c) => {
    if (f === "critical") return c.priority === "P0" && !["PASS", "NA", "WAIVED"].includes(c.status);
    if (f === "fail") return c.status === CheckStatus.FAIL;
    if (f === "progress") return c.status === CheckStatus.IN_PROGRESS;
    if (f === "review") return c.status === CheckStatus.REVIEW;
    if (f === "blocked") return c.status === CheckStatus.BLOCKED;
    if (f === "done") return ["PASS", "NA", "WAIVED"].includes(c.status);
    return !["PASS", "NA", "WAIVED"].includes(c.status);
  });

  return (
    <Shell user={user}>
      <PageHeader title="Görevlerim" subtitle="Sadece sizin ekibinizin sorumluluğundaki kontroller." />
      <div className="self-start">
        <Segmented items={FILTERS.map((filter) => ({ href: `/my-checks?f=${filter.id}`, label: filter.label, active: f === filter.id }))} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Bu filtrede görev yok." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-sand-200 bg-white shadow-card">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="bg-sand-50 text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">
                <th className="py-3 pl-5 pr-3 font-bold">Öncelik</th>
                <th className="px-3 py-3 font-bold">Kontrol</th>
                <th className="px-3 py-3 font-bold">Proje</th>
                <th className="px-3 py-3 font-bold">Release</th>
                <th className="px-3 py-3 font-bold">Durum</th>
                <th className="py-3 pl-3 pr-5 font-bold">Hedef</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-sand-200 transition-colors duration-fast ease-out hover:bg-sand-50">
                  <td className="py-3.5 pl-5 pr-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-3 py-3.5">
                    <Link className="text-sm font-bold text-sand-900 hover:text-clay-600" href={`/checks/${c.id}`} style={{ lineHeight: 1.35 }}>
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-sand-500">{c.release.project.name}</td>
                  <td className="px-3 py-3.5 text-sand-800">{c.release.name}</td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 pl-3 pr-5 text-sand-500">{dateShortTr(c.release.targetDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
