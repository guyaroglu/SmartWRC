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
  buttonClass,
  Card,
  DangerButton,
  FeedbackAlert,
  Field,
  GateHeadline,
  GroupHeading,
  PrimaryButton,
  PriorityBadge,
  ProgressBar,
  SecondaryButton,
  Segmented,
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
import { auditSentence } from "@/lib/tr-messages";
import {
  canCompleteProductionVerification,
  canEmergencyDeploy,
  canMarkAsDeployed,
  canReopenVerifiedRelease,
  canStartPostLaunchVerification,
  isProductionLocked,
} from "@/lib/lifecycle";
import { IconChevronRight, IconLockOpen, IconPaperclip, IconRocket, TeamGlyph } from "@/components/icons";
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
  const ownerSentence = !ownerLine
    ? ""
    : ownerCounts.size === 1
      ? blockers.length === 1
        ? `${ownerLine} ekibinde.`
        : blockers.length === 2
          ? `İkisi de ${ownerLine} ekibinde.`
          : `Hepsi ${ownerLine} ekibinde.`
      : `Çoğu ${ownerLine} ekibinde.`;

  const explanation =
    release.gateStatus === "READY"
      ? locked
        ? "Tüm kritik kontroller tamamlandı. Yayın canlıda doğrulandı."
        : "Tüm kritik kontroller tamamlandı."
      : release.gateStatus === "NO_GO"
        ? `${blockers.length} kritik konu çözülmeli.${ownerLine ? ` ${ownerLine === "Network" ? "İkisi de" : "Sorumlu"} ${ownerLine} ekibinde.` : ""}`
        : release.gateStatus === "AT_RISK"
          ? "Kritik engel yok ama açık işler var. Yayına çıkmadan önce bu riskler gözden geçirilmeli."
          : "Yayın kararı henüz verilmedi. Canlıdaki mevcut durum kaydedildiğinde hesaplanır.";

  const lifecycle = !readOnly
    ? canMarkAsDeployed(user, release)
      ? {
          label: "Sonraki adım",
          title: "Yayına alındı olarak işaretle",
          note: "Yayın kararı: Yayına Hazır. Bu adım yayını “Yayına Alındı” yapar; canlıda doğrulandı anlamına gelmez.",
          action: markDeployedAction,
          button: "Yayına Alındı Olarak İşaretle",
        }
      : canStartPostLaunchVerification(user, release)
        ? {
            label: "Sonraki adım",
            title: "Yayın sonrası kontrolü başlat",
            note: "Yayına alınan sitenin canlıda kontrolü başlar.",
            action: startPostLaunchAction,
            button: "Yayın Sonrası Kontrolü Başlat",
          }
        : canCompleteProductionVerification(user, release)
          ? {
              label: "Sonraki adım",
              title: "Canlı doğrulamayı tamamla",
              note: "Yayın kilitlenir. Sonradan değişiklik için yeniden açılması gerekir.",
              action: markProductionVerifiedAction,
              button: "Canlı Doğrulamayı Tamamla",
            }
          : canReopenVerifiedRelease(user, release)
            ? {
                label: "Kilidi aç",
                title: "Yayın kilitli",
                note: "Kilit kalkar; yayın kararı yeniden hesaplanır. İşlem kayda geçer.",
                action: reopenReleaseAction,
                button: "Yayını Yeniden Aç",
                reason: true,
              }
            : canMarkDeployed(user) && !release.baselineCompleted
              ? {
                  label: "Mevcut durum",
                  title: "Mevcut canlı durumu kaydet",
                  note: "Site zaten canlıda ama doğrulanmamış. Bu adım bugünkü durumu başlangıç olarak kaydeder; yayın kararı bundan sonra hesaplanır.",
                  action: completeBaselineAction,
                  button: "Mevcut Canlı Durumu Kaydet",
                }
              : null
    : null;
  // Presentation only: while the gate blocks deployment, show the next lifecycle step
  // disabled with its reason (server-side rules unchanged; no form is rendered).
  const waitingForGate =
    !lifecycle && !readOnly && canMarkDeployed(user) && release.deploymentStatus === "NOT_DEPLOYED" && release.gateStatus !== "READY"
      ? {
          title: "Sonraki adım: Yayına alma",
          button: "Yayına Alındı Olarak İşaretle",
          note: blockers.length
            ? `${blockers.length} kritik${ownerLine && ownerCounts.size === 1 ? ` ${ownerLine}` : ""} kontrolü kapanınca aktifleşir.`
            : "Yayın kararı “Yayına Hazır” olunca aktifleşir.",
        }
      : null;

  const readiness = CANONICAL_TEAMS.map((key) => {
    const row = teams.find((t) => t.key === key);
    return {
      key,
      name: teamLabel[key] ?? key,
      state: row?.status ?? "Kapsam dışı",
      tone: !row ? "neutral" : row.openP0 > 0 ? "bad" : row.status === "Hazır" ? "ok" : "warn",
      crit: row?.openP0 ?? 0,
      present: Boolean(row),
    };
  });

  return (
    <Shell user={user}>
      <div className="flex min-h-[34px] flex-wrap items-center gap-1.5 text-[13px] text-sand-500">
        <Link href={`/projects/${release.projectId}`} className="text-sand-500 hover:text-clay-600">
          {release.project.name}
        </Link>
        <IconChevronRight size={14} />
        <span className="font-semibold text-sand-900">{release.name}</span>
      </div>

      {err ? <FeedbackAlert title="İşlem yapılamadı" body={err} /> : null}
      <Card className="grid grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <div className="flex flex-col gap-3.5 px-6 py-6 md:px-7">
          <div>
            <div className="text-[13px] font-semibold text-sand-500">{release.project.name}</div>
            <h1 className="mt-0.5 text-page font-bold text-sand-900">{release.name}</h1>
          </div>
          <div className="flex flex-col gap-2">
            <GateHeadline gate={release.gateStatus} />
            <p className="text-[15px] text-sand-800">
              {release.gateStatus === "NO_GO" && blockers.length ? (
                <>
                  <strong className="text-rust-700">{blockers.length} kritik konu çözülmeli.</strong> {ownerSentence}
                </>
              ) : (
                explanation
              )}
            </p>
          </div>
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
          <div className="text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">Yayın adımları</div>
          {lifecycle ? (
            <>
              <div className="text-sm font-bold text-sand-900">{lifecycle.title}</div>
              <form action={lifecycle.action} className="flex flex-col gap-2">
                <input type="hidden" name="releaseId" value={release.id} />
                {"reason" in lifecycle && lifecycle.reason ? (
                  <>
                    <TextInput name="reason" placeholder="Yeniden açma nedeni" aria-label="Yeniden açma nedeni" required />
                    <SecondaryButton className="w-full" icon={<IconLockOpen size={17} />}>
                      {lifecycle.button}
                    </SecondaryButton>
                  </>
                ) : (
                  <PrimaryButton className="w-full" icon={<IconRocket size={17} />}>
                    {lifecycle.button}
                  </PrimaryButton>
                )}
              </form>
              <p className="text-xs text-sand-500" style={{ lineHeight: 1.45 }}>
                {lifecycle.note}
              </p>
            </>
          ) : waitingForGate ? (
            <>
              <div className="text-sm font-bold text-sand-900">{waitingForGate.title}</div>
              <button type="button" disabled className={buttonClass("primary", "md", "w-full")}>
                <IconRocket size={17} />
                {waitingForGate.button}
              </button>
              <p className="text-xs text-sand-500" style={{ lineHeight: 1.45 }}>
                {waitingForGate.note}
              </p>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-sand-900">{deploymentLabel[release.deploymentStatus]}</div>
              <p className="text-xs text-sand-500" style={{ lineHeight: 1.45 }}>
                {readOnly ? "Yönetim görünümü salt okunur." : "Şu anda yapılabilecek bir yayın adımı yok."}
              </p>
            </>
          )}
        </div>
      </Card>

      <div>
        <GroupHeading>Ekip hazırlığı</GroupHeading>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
          {readiness.map((t) => (
            <div
              key={t.key}
              className={`flex flex-col gap-2 rounded-panel border p-3.5 ${
                t.tone === "bad" ? "border-rust-100 bg-rust-100" : "border-sand-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-sand-900">
                <TeamGlyph teamKey={t.key} size={15} />
                {t.name}
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`text-[13px] font-bold ${
                    t.tone === "bad" ? "text-rust-700" : t.tone === "ok" ? "text-olive-700" : t.tone === "warn" ? "text-honey-700" : "text-sand-700"
                  }`}
                >
                  {t.state}
                </span>
                <span className="whitespace-nowrap text-xs text-sand-500">{t.crit} kritik</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {blockers.length ? (
        <Card className="border-rust-100 px-5 py-[18px]">
          <div className="mb-1.5 flex items-center gap-2.5">
            <h2 className="text-base font-bold text-sand-900">Yayını Engelleyenler</h2>
            <span className="rounded-chip bg-rust-100 px-[7px] py-1 text-[11px] font-semibold leading-none text-rust-700">
              {blockers.length}
            </span>
          </div>
          <div className="hidden grid-cols-[minmax(0,2.4fr)_1.1fr_0.8fr_1.1fr_1.2fr_20px] gap-3 px-2.5 py-2 text-[11px] font-bold uppercase tracking-eyebrow text-sand-400 md:grid">
            <span>Kontrol</span>
            <span>Sorumlu</span>
            <span>Öncelik</span>
            <span>Durum</span>
            <span>Doğrulama</span>
            <span />
          </div>
          {blockers.map((c) => {
            const lastReview = "reviews" in c ? (c as typeof release.checks[number]).reviews?.[0] : undefined;
            return (
              <Link
                key={c.id}
                href={`/checks/${c.id}`}
                className="grid grid-cols-1 items-center gap-3 border-t border-sand-200 px-2.5 py-3 transition-colors duration-fast ease-out hover:bg-sand-50 md:grid-cols-[minmax(0,2.4fr)_1.1fr_0.8fr_1.1fr_1.2fr_20px]"
              >
                <span className="text-sm font-bold text-sand-900" style={{ lineHeight: 1.35 }}>
                  {c.title}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-[5px] text-[13px] font-bold text-sand-900">
                    <TeamGlyph teamKey={c.ownerTeam.key} />
                    {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name}
                  </span>
                  <span className="text-xs text-sand-500">{"ownerUser" in c ? (c as typeof release.checks[number]).ownerUser?.name ?? "Ekip" : "Ekip"}</span>
                </div>
                <span>
                  <PriorityBadge priority={c.priority} />
                </span>
                <span>
                  <StatusBadge status={c.status} />
                </span>
                <span className="text-xs text-sand-800">
                  {lastReview?.decision === "FAIL" ? lastReview.reason ?? "Düzeltme istendi" : verificationLabel[c.verificationType]}
                </span>
                <IconChevronRight size={16} className="text-sand-400" />
              </Link>
            );
          })}
        </Card>
      ) : null}

      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[13px] font-bold uppercase tracking-eyebrow text-sand-500">Kontrol görevleri</h2>
          <Segmented
            items={[
              ["all", "Tümü"],
              ["critical", "Kritik"],
              ["fail", "Düzeltme Gereken"],
              ["blocked", "Engellenen"],
              ["review", "Onay Bekleyen"],
            ].map(([id, label]) => ({
              href: `/releases/${release.id}?f=${id}${domain ? `&domain=${domain}` : ""}`,
              label,
              active: f === id,
            }))}
          />
        </div>
        <Card className="overflow-hidden">
          {orderedTeams.map((group) => {
            const teamProgress = calculateProgress(group.checks);
            // Prototype: only the team carrying open criticals starts expanded.
            const open = group.openP0 > 0 || f !== "all";
            const openCount = group.total - group.done;
            return (
              <details key={group.key} open={open} className="border-t border-sand-200 first:border-t-0">
                <summary className="grid cursor-pointer grid-cols-[20px_minmax(0,1fr)] items-center gap-3 px-5 py-3.5 transition-colors duration-fast ease-out hover:bg-sand-50 md:grid-cols-[20px_minmax(0,1fr)_160px_110px]">
                  <IconChevronRight size={16} className="chev text-sand-500 transition-transform duration-fast ease-out" />
                  <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-sand-900">
                    <TeamGlyph teamKey={group.key} size={16} />
                    {group.name}
                    {group.openP0 > 0 ? (
                      <span className="text-xs font-semibold text-rust-700">{group.openP0} kritik açık</span>
                    ) : openCount > 0 ? (
                      <span className="text-xs font-semibold text-sand-500">{openCount} açık</span>
                    ) : null}
                  </span>
                  <ProgressBar
                    percent={teamProgress.percent}
                    className="hidden md:block"
                    barClassName={group.openP0 > 0 ? "bg-rust-500" : group.total > 0 && group.done === group.total ? "bg-olive-500" : "bg-sand-700"}
                  />
                  <span className="hidden text-right text-[13px] text-sand-500 md:block">
                    <strong className="text-sand-900">{group.done}</strong> / {group.total} tamamlandı
                  </span>
                </summary>
                <div className="px-3 pb-3 md:pl-[52px] md:pr-5">
                  {group.checks.map((c) => (
                    <Link
                      key={c.id}
                      href={`/checks/${c.id}`}
                      className="grid grid-cols-1 items-center gap-x-3 gap-y-1.5 rounded-row px-3 py-2.5 transition-colors duration-fast ease-out hover:bg-sand-50 md:grid-cols-[minmax(0,1fr)_70px_130px_110px_60px]"
                    >
                      <span className="text-[13px] font-semibold text-sand-900">{c.title}</span>
                      <span>
                        <PriorityBadge priority={c.priority} />
                      </span>
                      <span>
                        <StatusBadge status={c.status} />
                      </span>
                      <span className="truncate text-xs text-sand-500">{"ownerUser" in c ? (c as typeof release.checks[number]).ownerUser?.name ?? teamLabel[c.ownerTeam.key] : teamLabel[c.ownerTeam.key]}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-sand-500">
                        <IconPaperclip size={13} />
                        {c.evidence?.length ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </Card>
      </div>

      {!readOnly && canEmergencyDeploy(user, release) ? (
        <details className="rounded-card border border-sand-200 bg-white shadow-card">
          <summary className="flex cursor-pointer items-center gap-2.5 px-[22px] py-4">
            <IconChevronRight size={16} className="chev text-sand-500 transition-transform duration-fast ease-out" />
            <h2 className="text-[15px] font-bold text-sand-900">Acil Yayın İşlemleri</h2>
          </summary>
          <form action={emergencyDeployAction} className="flex flex-col gap-3 px-[22px] pb-5 md:pl-12">
            <p className="text-[13px] text-sand-500">Bu yol Yayına Hazır durumu üretmez. Riskler açık kalır.</p>
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
            <div>
              <DangerButton>Riskleri Kabul Ederek Yayına Al</DangerButton>
            </div>
          </form>
        </details>
      ) : null}

      <details className="rounded-card border border-sand-200 bg-white shadow-card">
        <summary className="flex cursor-pointer items-center gap-2.5 px-[22px] py-4">
          <IconChevronRight size={16} className="chev text-sand-500 transition-transform duration-fast ease-out" />
          <h2 className="text-[15px] font-bold text-sand-900">Geçmiş</h2>
          <span className="text-xs text-sand-500">{audit.length + checkAudit.length} kayıt</span>
        </summary>
        <ol className="flex flex-col gap-2.5 px-[22px] pb-4 text-[13px] md:pl-12">
          {[...audit, ...checkAudit]
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((e) => (
              <li key={e.id} className="grid grid-cols-[130px_minmax(0,1fr)] gap-3">
                <span className="text-sand-500">{e.createdAt.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</span>
                <span className="text-sand-800">
                  <strong className="text-sand-900">{e.actor?.name ?? "Sistem"}</strong> {auditSentence(e)}
                </span>
              </li>
            ))}
        </ol>
      </details>
    </Shell>
  );
}
