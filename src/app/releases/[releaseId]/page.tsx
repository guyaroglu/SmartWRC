import Link from "next/link";
import { notFound } from "next/navigation";
import {
  completeBaselineAction,
  emergencyDeployAction,
  markDeployedAction,
  markProductionVerifiedAction,
  reopenReleaseAction,
  startPostLaunchAction,
} from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { listAudit } from "@/lib/audit";
import { Card, DeploymentBadge, GateBadge, PriorityBadge, Shell, StatusBadge } from "@/components/shell";
import { canMarkDeployed } from "@/lib/authz";
import { blockingChecks, teamSummaries } from "@/lib/release-view";
import { dateLongTr } from "@/lib/format";
import { checkStatusLabel, teamLabel, verificationLabel } from "@/lib/labels";
import {
  canCompleteProductionVerification,
  canEmergencyDeploy,
  canMarkAsDeployed,
  canReopenVerifiedRelease,
  canStartPostLaunchVerification,
} from "@/lib/lifecycle";
import { Role } from "@prisma/client";

export default async function ReleasePage({
  params,
  searchParams,
}: {
  params: Promise<{ releaseId: string }>;
  searchParams: Promise<{ f?: string; domain?: string; err?: string }>;
}) {
  const user = await requireUser();
  const { releaseId } = await params;
  const { f = "all", domain, err } = await searchParams;
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: {
      project: true,
      checks: { include: { ownerTeam: true, evidence: true } },
    },
  });
  if (!release) notFound();
  const audit = await listAudit("Release", release.id);
  const checkAudit = await prisma.auditEvent.findMany({
    where: { entityType: "ReleaseCheck", entityId: { in: release.checks.map((c) => c.id) } },
    include: { actor: true },
    orderBy: { createdAt: "asc" },
  });
  const approvers = await prisma.user.findMany({
    where: { role: { in: ["SEO_LEAD", "PROJECT_MANAGER", "MANAGEMENT", "SYSTEM_ADMIN"] }, isActive: true },
  });

  const releaseInput = {
    onboardingType: release.onboardingType,
    baselineCompleted: release.baselineCompleted,
    deploymentStatus: release.deploymentStatus,
  };
  const blockers = blockingChecks(releaseInput, release.checks);
  const teams = teamSummaries(releaseInput, release.checks);
  const readOnly = user.role === Role.MANAGEMENT;

  const filteredChecks = release.checks.filter((c) => {
    if (domain && !c.domains.includes(domain as never)) return false;
    if (f === "critical") return c.priority === "P0";
    if (f === "fail") return c.status === "FAIL";
    if (f === "blocked") return c.status === "BLOCKED";
    if (f === "review") return c.status === "REVIEW";
    return true;
  });
  const grouped = teamSummaries(releaseInput, filteredChecks);

  return (
    <Shell name={user.name} role={user.role}>
      <p className="text-sm">
        <Link className="text-ink/60 no-underline" href={`/projects/${release.projectId}`}>
          {release.project.name}
        </Link>
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{release.project.name}</h1>
      <h2 className="mt-1 text-lg text-ink/70">{release.name}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <GateBadge gate={release.gateStatus} />
        <DeploymentBadge status={release.deploymentStatus} />
      </div>
      <p className="mt-2 text-sm text-ink/70">
        {blockers.length ? `${blockers.length} kritik konu çözülmeli` : "Açık kritik konu yok"}
        {release.targetDate ? ` · Hedef yayın: ${dateLongTr(release.targetDate)}` : ""}
      </p>
      {err ? <p className="mt-2 text-sm text-danger">{err}</p> : null}

      {!readOnly && canMarkDeployed(user) && !release.baselineCompleted ? (
        <form action={completeBaselineAction} className="mt-3">
          <input type="hidden" name="releaseId" value={release.id} />
          <button className="rounded border px-3 py-2 text-sm" type="submit">
            Baseline tamamla
          </button>
        </form>
      ) : null}

      {!readOnly ? (
        <div className="mt-4 space-y-3">
          {canMarkAsDeployed(user, release) ? (
            <form action={markDeployedAction}>
              <input type="hidden" name="releaseId" value={release.id} />
              <button className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white" type="submit">
                Yayına Alındı Olarak İşaretle
              </button>
            </form>
          ) : null}
          {canStartPostLaunchVerification(user, release) ? (
            <form action={startPostLaunchAction}>
              <input type="hidden" name="releaseId" value={release.id} />
              <button className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white" type="submit">
                Yayın Sonrası Kontrolü Başlat
              </button>
            </form>
          ) : null}
          {canCompleteProductionVerification(user, release) ? (
            <form action={markProductionVerifiedAction}>
              <input type="hidden" name="releaseId" value={release.id} />
              <button className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white" type="submit">
                Production Doğrulamasını Tamamla
              </button>
            </form>
          ) : null}
          {canReopenVerifiedRelease(user, release) ? (
            <form action={reopenReleaseAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="releaseId" value={release.id} />
              <input className="rounded border px-2 py-1 text-sm" name="reason" placeholder="Yeniden açma nedeni" required />
              <button className="rounded border px-3 py-2 text-sm" type="submit">
                Release&apos;i Yeniden Aç
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {!readOnly && canEmergencyDeploy(user, release) ? (
        <details className="mt-4 rounded-lg border border-ink/10 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-medium">Acil Yayın İşlemleri</summary>
          <form action={emergencyDeployAction} className="mt-3 space-y-2">
            <p className="text-ink/60">Bu yol Yayına Hazır durumu üretmez. Riskler açık kalır.</p>
            <input type="hidden" name="releaseId" value={release.id} />
            <input className="w-full rounded border px-2 py-1" name="reason" placeholder="Neden" required />
            <input className="w-full rounded border px-2 py-1" name="openRisks" placeholder="Açık riskler" required />
            <select className="w-full rounded border px-2 py-1" name="approver2Id" required>
              {approvers.filter((a) => a.id !== user.id).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button className="rounded border border-danger px-3 py-1 text-danger" type="submit">
              Riskleri Kabul Ederek Yayına Al
            </button>
          </form>
        </details>
      ) : null}

      <h2 className="mt-8 font-medium">Ekip özeti</h2>
      <table className="mt-2 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-ink/50">
            <th className="py-2">Ekip</th>
            <th>Durum</th>
            <th className="text-right">Açık Kritik</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.key} className="border-b border-ink/5">
              <td className="py-2">{t.name}</td>
              <td>{t.status}</td>
              <td className="text-right">{t.openP0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 font-medium">Yayını Engelleyenler</h2>
      <ul className="mt-2 space-y-2">
        {blockers.length === 0 ? <li className="text-sm text-ink/55">Kritik engel yok.</li> : null}
        {blockers.map((c) => (
          <li key={c.id}>
            <Card>
              <Link className="font-medium no-underline" href={`/checks/${c.id}`}>
                {c.title}
              </Link>
              <p className="mt-1 text-sm text-ink/65">
                {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name} · {checkStatusLabel[c.status]}
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-medium">Kontroller</h2>
      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        {[
          ["all", "Tümü"],
          ["critical", "Kritik"],
          ["fail", "Düzeltme Gereken"],
          ["blocked", "Bloklanan"],
          ["review", "Onay Bekleyen"],
        ].map(([id, label]) => (
          <Link
            key={id}
            href={`/releases/${release.id}?f=${id}${domain ? `&domain=${domain}` : ""}`}
            className={`rounded-full px-3 py-1 no-underline ${f === id ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {["SEO", "GEO", "PERFORMANCE", "ANALYTICS"].map((d) => (
          <Link
            key={d}
            href={`/releases/${release.id}?f=${f}&domain=${d}`}
            className={`rounded-full px-2 py-0.5 no-underline ${domain === d ? "bg-ink/80 text-white" : "text-ink/55"}`}
          >
            {d}
          </Link>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {grouped.map((group) => (
          <details key={group.key} open={group.openP0 > 0 || group.done < group.total} className="rounded-lg border border-ink/10 bg-white p-4">
            <summary className="cursor-pointer font-medium">
              {group.name}
              <span className="ml-2 text-sm font-normal text-ink/55">
                {group.done} / {group.total} tamamlandı
              </span>
            </summary>
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-ink/50">
                  <th className="py-1">Kontrol</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>Onay</th>
                  <th>Kanıt</th>
                </tr>
              </thead>
              <tbody>
                {group.checks.map((c) => (
                  <tr key={c.id} className="border-t border-ink/5">
                    <td className="py-2">
                      <Link className="no-underline" href={`/checks/${c.id}`}>{c.title}</Link>
                    </td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="text-ink/65">{verificationLabel[c.verificationType as never] ?? ""}</td>
                    <td className="text-ink/55">{c.evidence?.length ? `${c.evidence.length}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        ))}
      </div>

      <details className="mt-8">
        <summary className="cursor-pointer text-sm font-medium">Geçmiş</summary>
        <ol className="mt-2 space-y-1 text-xs text-ink/60">
          {[...audit, ...checkAudit]
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((e) => (
              <li key={e.id}>
                {e.createdAt.toLocaleString("tr-TR")} · {e.actor?.name ?? "sistem"} · {e.action}
                {e.reason ? ` — ${e.reason}` : ""}
              </li>
            ))}
        </ol>
      </details>
    </Shell>
  );
}
