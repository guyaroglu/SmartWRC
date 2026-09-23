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
import {
  Card,
  EmptyState,
  FeedbackAlert,
  Field,
  GateHeadline,
  LockedBanner,
  PrimaryButton,
  PriorityBadge,
  ProgressBar,
  SecondaryButton,
  SelectInput,
  Shell,
  StatusBadge,
  TextInput,
} from "@/components/shell";
import { canMarkDeployed } from "@/lib/authz";
import { blockingChecks, teamSummaries } from "@/lib/release-view";
import { calculateProgress, progressLabel } from "@/lib/progress";
import { dateLongTr, dateShortTr } from "@/lib/format";
import { checkStatusLabel, deploymentLabel, teamLabel, verificationLabel } from "@/lib/labels";
import { CANONICAL_TEAMS } from "@/lib/display";
import {
  canCompleteProductionVerification,
  canEmergencyDeploy,
  canMarkAsDeployed,
  canReopenVerifiedRelease,
  canStartPostLaunchVerification,
  isProductionLocked,
} from "@/lib/lifecycle";
import { IconChevronRight, TeamGlyph } from "@/components/icons";
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
      createdBy: true,
      checks: { include: { ownerTeam: true, ownerUser: true, evidence: true, reviews: { orderBy: { createdAt: "desc" }, take: 1 } } },
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
  const progress = calculateProgress(release.checks);
  const readOnly = user.role === Role.MANAGEMENT;
  const locked = isProductionLocked(release);

  const filteredChecks = release.checks.filter((c) => {
    if (domain && !c.domains.includes(domain as never)) return false;
    if (f === "critical") return c.priority === "P0";
    if (f === "fail") return c.status === "FAIL";
    if (f === "blocked") return c.status === "BLOCKED";
    if (f === "review") return c.status === "REVIEW";
    return true;
  });
  const grouped = teamSummaries(releaseInput, filteredChecks);
  const groupedByKey = new Map(grouped.map((g) => [g.key, g]));
  const orderedTeams = [
    ...CANONICAL_TEAMS.map((key) => groupedByKey.get(key)).filter(Boolean),
    ...grouped.filter((g) => !CANONICAL_TEAMS.includes(g.key as never)),
  ] as typeof grouped;

  const ownerCounts = new Map<string, number>();
  for (const b of blockers) {
    const name = teamLabel[b.ownerTeam.key] ?? b.ownerTeam.name;
    ownerCounts.set(name, (ownerCounts.get(name) ?? 0) + 1);
  }
  const ownerLine = [...ownerCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const explanation =
    release.gateStatus === "READY"
      ? locked
        ? "Tüm kritik kontroller tamamlandı. Production doğrulandı."
        : "Tüm kritik kontroller tamamlandı."
      : release.gateStatus === "NO_GO"
        ? `${blockers.length} kritik konu çözülmeli.${ownerLine ? ` ${ownerLine === "Network" ? "İkisi de" : "Sorumlu"} ${ownerLine} ekibinde.` : ""}`
        : release.gateStatus === "AT_RISK"
          ? "Kritik olmayan açık riskler var. Yayına hazır değil sayılmaz; dikkat gerekir."
          : "Kapı henüz hesaplanmadı. Baseline veya kontroller tamamlanınca güncellenir.";

  const lifecycle = !readOnly
    ? canMarkAsDeployed(user, release)
      ? {
          label: "Sonraki adım",
          title: "Yayına alındı olarak işaretle",
          note: "Gate READY. Bu işlem DEPLOYED üretir; PRODUCTION_VERIFIED değildir.",
          action: markDeployedAction,
          button: "Yayına Alındı Olarak İşaretle",
        }
      : canStartPostLaunchVerification(user, release)
        ? {
            label: "Sonraki adım",
            title: "Yayın sonrası kontrolü başlat",
            note: "DEPLOYED sonrası doğrulama başlar.",
            action: startPostLaunchAction,
            button: "Yayın Sonrası Kontrolü Başlat",
          }
        : canCompleteProductionVerification(user, release)
          ? {
              label: "Sonraki adım",
              title: "Production doğrulamasını tamamla",
              note: "Release kilitlenir. Değişiklik için yeniden açmak gerekir.",
              action: markProductionVerifiedAction,
              button: "Production Doğrulamasını Tamamla",
            }
          : canReopenVerifiedRelease(user, release)
            ? {
                label: "Kilidi aç",
                title: "Release’i yeniden aç",
                note: "Kilit kalkar; gate yeniden hesaplanır.",
                action: reopenReleaseAction,
                button: "Release'i Yeniden Aç",
                reason: true,
              }
            : canMarkDeployed(user) && !release.baselineCompleted
              ? {
                  label: "Baseline",
                  title: "Baseline tamamla",
                  note: "LIVE_UNVERIFIED / henüz değerlendirilmedi durumunda kapıyı açar.",
                  action: completeBaselineAction,
                  button: "Baseline tamamla",
                }
              : null
    : null;

  const readiness = CANONICAL_TEAMS.map((key) => {
    const row = teams.find((t) => t.key === key);
    return {
      key,
      name: teamLabel[key] ?? key,
      state: row?.status ?? "Kapsam dışı",
      crit: row?.openP0 ?? 0,
      present: Boolean(row),
    };
  });

  return (
    <Shell user={user}>
      <div className="flex items-center gap-1.5 text-[13px] text-sand-500">
        <Link href={`/projects/${release.projectId}`} className="no-underline hover:text-clay-600">
          {release.project.name}
        </Link>
        <IconChevronRight size={14} />
        <span className="font-semibold text-sand-900">{release.name}</span>
      </div>

      {err ? <FeedbackAlert title="İşlem yapılamadı" body={err} /> : null}
      {locked ? <LockedBanner /> : null}

      <Card className="grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <div className="flex flex-col gap-3.5 px-6 py-6 md:px-7">
          <div>
            <div className="text-[13px] font-semibold text-sand-500">{release.project.name}</div>
            <h1 className="mt-0.5 text-[26px] font-bold tracking-tight text-sand-900">{release.name}</h1>
          </div>
          <GateHeadline gate={release.gateStatus} />
          <p className="text-[15px] text-sand-800">
            {release.gateStatus === "NO_GO" && blockers.length ? (
              <>
                <strong className="text-rust-700">{blockers.length} kritik konu çözülmeli. </strong>
                {ownerLine ? `${ownerLine} ekibinde.` : ""}
              </>
            ) : (
              explanation
            )}
          </p>
          <div className="flex flex-wrap gap-6 pt-1 text-xs text-sand-500">
            <span>
              Aşama <strong className="font-semibold text-sand-800">{deploymentLabel[release.deploymentStatus]}</strong>
            </span>
            <span>
              Hedef <strong className="font-semibold text-sand-800">{dateShortTr(release.targetDate)}</strong>
            </span>
            {release.createdBy ? (
              <span>
                PM <strong className="font-semibold text-sand-800">{release.createdBy.name}</strong>
              </span>
            ) : null}
            <span>
              İlerleme <strong className="font-semibold text-sand-800">{progressLabel(progress)}</strong>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-sand-200 bg-sand-50 p-6 lg:border-l lg:border-t-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400">Yaşam döngüsü</div>
          {lifecycle ? (
            <>
              <div className="text-sm font-bold text-sand-900">{lifecycle.title}</div>
              <form action={lifecycle.action} className="space-y-2">
                <input type="hidden" name="releaseId" value={release.id} />
                {"reason" in lifecycle && lifecycle.reason ? (
                  <TextInput name="reason" placeholder="Yeniden açma nedeni" required />
                ) : null}
                <PrimaryButton className="w-full">{lifecycle.button}</PrimaryButton>
              </form>
              <p className="text-xs leading-snug text-sand-500">{lifecycle.note}</p>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-sand-900">{deploymentLabel[release.deploymentStatus]}</div>
              <p className="text-xs leading-snug text-sand-500">
                {readOnly ? "Yönetim görünümü salt okunur." : "Şu anda geçerli bir yaşam döngüsü işlemi yok."}
              </p>
            </>
          )}
        </div>
      </Card>

      <div>
        <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em] text-sand-500">Ekip hazırlığı</h2>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
          {readiness.map((t) => (
            <div
              key={t.key}
              className={`flex flex-col gap-2 rounded-xl border p-3.5 ${
                t.crit > 0 ? "border-rust-100 bg-rust-100/40" : t.state === "Hazır" ? "border-olive-100 bg-olive-100/50" : "border-sand-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-sand-900">
                <TeamGlyph teamKey={t.key} />
                {t.name}
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-[13px] font-bold ${t.crit > 0 ? "text-rust-700" : t.state === "Hazır" ? "text-olive-700" : "text-sand-700"}`}>
                  {t.state}
                </span>
                <span className="text-xs text-sand-500">{t.crit} kritik</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {blockers.length ? (
        <Card className="border-rust-100 px-5 py-[18px]">
          <div className="mb-1.5 flex items-center gap-2.5">
            <h2 className="text-base font-bold text-sand-900">Yayını Engelleyenler</h2>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-rust-100 px-1.5 text-[11px] font-bold text-rust-700">
              {blockers.length}
            </span>
          </div>
          <div className="hidden grid-cols-[minmax(0,2.4fr)_1.1fr_0.8fr_1.1fr_1.2fr_20px] gap-3 px-2.5 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400 md:grid">
            <span>Kontrol</span>
            <span>Sorumlu</span>
            <span>Öncelik</span>
            <span>Durum</span>
            <span>Onay</span>
            <span />
          </div>
          {blockers.map((c) => {
            const lastReview = "reviews" in c ? (c as typeof release.checks[number]).reviews?.[0] : undefined;
            return (
              <Link
                key={c.id}
                href={`/checks/${c.id}`}
                className="grid items-center gap-3 border-t border-sand-200 px-2.5 py-3 no-underline hover:bg-sand-50 md:grid-cols-[minmax(0,2.4fr)_1.1fr_0.8fr_1.1fr_1.2fr_20px]"
              >
                <span className="text-sm font-bold leading-snug text-sand-900">{c.title}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1 text-[13px] font-bold text-sand-900">
                    <TeamGlyph teamKey={c.ownerTeam.key} />
                    {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name}
                  </span>
                  <span className="text-xs text-sand-500">{"ownerUser" in c ? (c as typeof release.checks[number]).ownerUser?.name ?? "Ekip" : "Ekip"}</span>
                </div>
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
                <span className="text-xs text-sand-800">
                  {lastReview?.decision === "FAIL" ? lastReview.reason ?? "Düzeltme istendi" : verificationLabel[c.verificationType]}
                </span>
                <IconChevronRight size={16} className="text-sand-400" />
              </Link>
            );
          })}
        </Card>
      ) : (
        <EmptyState title="Yayını engelleyen kritik konu yok." />
      )}

      <div>
        <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em] text-sand-500">Kontroller</h2>
        <div className="mb-3 flex flex-wrap gap-2 text-sm">
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
              className={`rounded-full px-3 py-1 no-underline ${f === id ? "bg-sand-900 text-white" : "bg-white text-sand-700 ring-1 ring-sand-200"}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <Card className="overflow-hidden">
          {orderedTeams.map((group) => {
            const teamProgress = calculateProgress(group.checks);
            const open = group.openP0 > 0 || group.done < group.total;
            return (
              <details key={group.key} open={open} className="border-t border-sand-200 first:border-0">
                <summary className="grid cursor-pointer grid-cols-[20px_minmax(0,1fr)] items-center gap-3 px-5 py-3.5 hover:bg-sand-50 md:grid-cols-[20px_minmax(0,1fr)_160px_110px]">
                  <IconChevronRight size={16} className="text-sand-500" />
                  <span className="flex items-center gap-2 text-sm font-bold text-sand-900">
                    <TeamGlyph teamKey={group.key} />
                    {group.name}
                    {group.openP0 > 0 ? <span className="text-xs font-semibold text-rust-700">{group.openP0} kritik açık</span> : null}
                  </span>
                  <ProgressBar percent={teamProgress.percent} className="hidden md:block" />
                  <span className="hidden text-right text-[13px] text-sand-500 md:block">
                    <strong className="text-sand-900">{group.done}</strong> / {group.total} tamamlandı
                  </span>
                </summary>
                <div className="px-5 pb-3 pl-[52px]">
                  {group.checks.map((c) => (
                    <Link
                      key={c.id}
                      href={`/checks/${c.id}`}
                      className="grid items-center gap-3 rounded-[10px] px-3 py-2.5 no-underline hover:bg-sand-50 md:grid-cols-[minmax(0,1fr)_70px_130px_110px_60px]"
                    >
                      <span className="text-[13px] font-semibold text-sand-900">{c.title}</span>
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-sand-500">{"ownerUser" in c ? (c as typeof release.checks[number]).ownerUser?.name ?? teamLabel[c.ownerTeam.key] : teamLabel[c.ownerTeam.key]}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-sand-500">{c.evidence?.length ?? 0}</span>
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </Card>
      </div>

      {!readOnly && canEmergencyDeploy(user, release) ? (
        <details className="rounded-card border border-sand-200 bg-white p-4 text-sm shadow-card">
          <summary className="cursor-pointer font-medium">Acil Yayın İşlemleri</summary>
          <form action={emergencyDeployAction} className="mt-3 space-y-2">
            <p className="text-sand-500">Bu yol Yayına Hazır durumu üretmez. Riskler açık kalır.</p>
            <input type="hidden" name="releaseId" value={release.id} />
            <Field label="Neden">
              <TextInput name="reason" required />
            </Field>
            <Field label="Açık riskler">
              <TextInput name="openRisks" required />
            </Field>
            <Field label="İkinci onay">
              <SelectInput name="approver2Id" required>
                {approvers
                  .filter((a) => a.id !== user.id)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </SelectInput>
            </Field>
            <SecondaryButton className="border-rust-500 text-rust-700">Riskleri Kabul Ederek Yayına Al</SecondaryButton>
          </form>
        </details>
      ) : null}

      <details>
        <summary className="cursor-pointer text-sm font-bold text-sand-900">Geçmiş</summary>
        <ol className="mt-2 space-y-1 text-xs text-sand-500">
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
