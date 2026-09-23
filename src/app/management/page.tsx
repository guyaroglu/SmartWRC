import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { blockingChecks, mainOwnerRisk } from "@/lib/release-view";
import { dateShortTr } from "@/lib/format";
import { gateHeadline } from "@/lib/labels";
import { gateChipTone } from "@/lib/display";
import { IconEye } from "@/components/icons";
import { EmptyState, PageHeader, Shell } from "@/components/shell";
import { Role } from "@prisma/client";

export default async function ManagementPage() {
  const user = await requireUser();
  const releases = await prisma.release.findMany({
    where: { archived: false },
    include: { project: true, checks: { include: { ownerTeam: true } } },
    orderBy: { createdAt: "desc" },
  });
  const ready = releases.filter((r) => r.gateStatus === "READY").length;
  const risk = releases.filter((r) => r.gateStatus === "AT_RISK").length;
  const nogo = releases.filter((r) => r.gateStatus === "NO_GO").length;

  return (
    <Shell user={user}>
      <PageHeader
        title="Yayın Durumu"
        subtitle={
          <>
            {releases.length} site
            {ready ? (
              <>
                {" "}
                · <strong className="text-olive-700">{ready} yayına hazır</strong>
              </>
            ) : null}
            {risk ? (
              <>
                {" "}
                · <strong className="text-honey-700">{risk} riskli</strong>
              </>
            ) : null}
            {nogo ? (
              <>
                {" "}
                · <strong className="text-rust-700">{nogo} hazır değil</strong>
              </>
            ) : null}
          </>
        }
      />

      {releases.length === 0 ? (
        <EmptyState title="Gösterilecek release yok." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-sand-200 bg-white shadow-card">
          <div className="grid min-w-[720px] grid-cols-[minmax(0,1.8fr)_1.3fr_0.7fr_1.2fr_0.8fr] gap-4 bg-sand-50 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400">
            <span>Site / Release</span>
            <span>Durum</span>
            <span>Kritik</span>
            <span>Risk kimde</span>
            <span>Hedef</span>
          </div>
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
            const tone = gateChipTone(r.gateStatus);
            return (
              <div
                key={r.id}
                className="grid min-w-[720px] grid-cols-[minmax(0,1.8fr)_1.3fr_0.7fr_1.2fr_0.8fr] items-center gap-4 border-t border-sand-200 px-6 py-[18px]"
              >
                <div>
                  <div className="text-base font-bold text-sand-900">{r.project.name}</div>
                  <Link href={`/releases/${r.id}`} className="mt-0.5 block text-[13px] text-sand-500 no-underline hover:text-clay-600">
                    {r.name}
                  </Link>
                </div>
                <span className={`inline-flex items-center gap-2 text-[17px] font-extrabold ${tone.fg}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${tone.fg.replace("text-", "bg-")}`} />
                  {gateHeadline[r.gateStatus]}
                </span>
                <span className={`text-[17px] font-extrabold ${blockers.length ? "text-rust-700" : "text-sand-900"}`}>
                  {blockers.length}
                </span>
                <span className="text-sm text-sand-800">{owner}</span>
                <span className="text-sm font-semibold text-sand-900">{dateShortTr(r.targetDate)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-sand-500">
        <IconEye size={14} />
        Salt okunur görünüm.
        {user.role !== Role.MANAGEMENT ? " Operasyonel düzenleme bu ekrandan yapılmaz." : ""}
      </div>
    </Shell>
  );
}
