import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { GateBadge, Shell } from "@/components/shell";
import { blockingChecks, mainOwnerRisk } from "@/lib/release-view";
import { dateShortTr } from "@/lib/format";
import { Role } from "@prisma/client";

export default async function ManagementPage() {
  const user = await requireUser();
  const releases = await prisma.release.findMany({
    where: { archived: false },
    include: { project: true, checks: { include: { ownerTeam: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Shell name={user.name} role={user.role}>
      <h1 className="text-2xl font-semibold">Yönetim Özeti</h1>
      <p className="text-sm text-ink/65">Site yayına çıkabilir mi? Bu görünüm salt okunur.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-ink/50">
              <th className="py-2">Proje</th>
              <th>Release</th>
              <th>Durum</th>
              <th className="text-right">Kritik</th>
              <th>Ana Risk</th>
              <th>Hedef</th>
            </tr>
          </thead>
          <tbody>
            {releases.map((r) => {
              const blockers = blockingChecks(
                {
                  onboardingType: r.onboardingType,
                  baselineCompleted: r.baselineCompleted,
                  deploymentStatus: r.deploymentStatus,
                },
                r.checks,
              );
              const owner = mainOwnerRisk(blockers);
              return (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="py-2">{r.project.name}</td>
                  <td>
                    <Link className="no-underline" href={`/releases/${r.id}`}>{r.name}</Link>
                  </td>
                  <td>
                    <GateBadge gate={r.gateStatus} />
                  </td>
                  <td className="text-right">{blockers.length}</td>
                  <td>{owner}</td>
                  <td>{dateShortTr(r.targetDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {user.role !== Role.MANAGEMENT ? (
        <p className="mt-4 text-xs text-ink/45">Operasyonel düzenleme bu ekrandan yapılmaz.</p>
      ) : null}
    </Shell>
  );
}
