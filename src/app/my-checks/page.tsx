import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader, PriorityBadge, Shell, StatusBadge } from "@/components/shell";
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
      <div className="flex flex-wrap gap-1 rounded-full bg-sand-100 p-0.5 text-xs font-semibold">
        {FILTERS.map((filter) => (
          <Link
            key={filter.id}
            href={`/my-checks?f=${filter.id}`}
            className={`rounded-full px-3 py-1.5 no-underline ${f === filter.id ? "bg-white text-sand-900 shadow-card" : "text-sand-700"}`}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Bu filtrede görev yok." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-sand-200 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-sand-50 text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400">
                <th className="px-5 py-3">Öncelik</th>
                <th>Kontrol</th>
                <th>Proje</th>
                <th>Release</th>
                <th>Durum</th>
                <th>Hedef</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-sand-200">
                  <td className="px-5 py-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td>
                    <Link className="font-semibold no-underline" href={`/checks/${c.id}`}>
                      {c.title}
                    </Link>
                  </td>
                  <td className="text-sand-600">{c.release.project.name}</td>
                  <td className="text-sand-600">{c.release.name}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="text-sand-500">{dateShortTr(c.release.targetDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
