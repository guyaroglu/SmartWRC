import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { PriorityBadge, Shell, StatusBadge } from "@/components/shell";
import { CheckStatus } from "@prisma/client";
import { dateShortTr } from "@/lib/format";

const FILTERS = [
  { id: "open", label: "Tümü" },
  { id: "critical", label: "Kritik" },
  { id: "fail", label: "Düzeltme Gerekenler" },
  { id: "progress", label: "Üzerinde Çalışılanlar" },
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
    where: user.teamId
      ? { ownerTeamId: user.teamId, status: { not: CheckStatus.REMOVED_FROM_SCOPE } }
      : { ownerUserId: user.id, status: { not: CheckStatus.REMOVED_FROM_SCOPE } },
    include: { release: { include: { project: true } } },
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
    <Shell name={user.name} role={user.role}>
      <h1 className="text-2xl font-semibold">Görevlerim</h1>
      <p className="mt-1 text-sm text-ink/65">Sadece sizin ekibinizin sorumluluğundaki kontroller.</p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((filter) => (
          <Link
            key={filter.id}
            href={`/my-checks?f=${filter.id}`}
            className={`rounded-full px-3 py-1 no-underline ${f === filter.id ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-ink/10"}`}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-ink/50">
              <th className="py-2">Öncelik</th>
              <th>Kontrol</th>
              <th>Proje</th>
              <th>Release</th>
              <th>Durum</th>
              <th>Hedef</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="py-4 text-ink/55" colSpan={6}>
                  Bu filtrede görev yok.
                </td>
              </tr>
            ) : null}
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-ink/5">
                <td className="py-2"><PriorityBadge priority={c.priority} /></td>
                <td>
                  <Link className="no-underline" href={`/checks/${c.id}`}>{c.title}</Link>
                  {c.status === CheckStatus.BLOCKED ? <span className="ml-2 text-xs text-danger">Bloklandı</span> : null}
                </td>
                <td className="text-ink/70">{c.release.project.name}</td>
                <td className="text-ink/70">{c.release.name}</td>
                <td><StatusBadge status={c.status} /></td>
                <td className="text-ink/60">{dateShortTr(c.release.targetDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
