import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckStatus, Role } from "@prisma/client";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { assignedCheckWhere } from "@/lib/assigned";
import { dateContext, greeting, isCompactVerified } from "@/lib/display";
import { dateShortTr } from "@/lib/format";
import { teamLabel } from "@/lib/labels";
import { calculateProgress, progressLabel } from "@/lib/progress";
import { countPendingReviews, deriveAttentionItems } from "@/lib/attention";
import { blockingChecks, mainOwnerRisk, teamSummaries } from "@/lib/release-view";
import { Card, EmptyState, GateBadge, ProgressBar, SectionTitle, Shell, StatusBadge, TeamBadge } from "@/components/shell";
import { IconChevronRight, IconLock, TeamGlyph } from "@/components/icons";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === Role.MANAGEMENT) redirect("/management");

  const [releases, assigned, reviewCandidates] = await Promise.all([
    prisma.release.findMany({
      where: { archived: false },
      include: {
        project: true,
        createdBy: true,
        checks: { include: { ownerTeam: true } },
      },
      orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.releaseCheck.findMany({
      where: assignedCheckWhere(user),
      include: { ownerTeam: true, release: { include: { project: true } } },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
      take: 8,
    }),
    prisma.releaseCheck.findMany({
      where: { status: CheckStatus.REVIEW, release: { archived: false } },
      include: { ownerTeam: true, release: { include: { project: true } } },
      take: 40,
    }),
  ]);

  const active = releases.filter((r) => !isCompactVerified(r.deploymentStatus));
  const verified = releases.filter((r) => isCompactVerified(r.deploymentStatus));
  const blocked = active.filter((r) => r.gateStatus === "NO_GO");
  const criticalOpen = active.reduce((n, r) => {
    return (
      n +
      blockingChecks(
        {
          onboardingType: r.onboardingType,
          baselineCompleted: r.baselineCompleted,
          deploymentStatus: r.deploymentStatus,
        },
        r.checks,
      ).length
    );
  }, 0);
  const pendingReviews = countPendingReviews(
    user,
    reviewCandidates.map((c) => ({
      ownerUserId: c.ownerUserId,
      ownerTeamId: c.ownerTeamId,
      ownerTeamKey: c.ownerTeam.key,
      reviewerUserId: c.reviewerUserId,
      verificationType: c.verificationType,
      status: c.status,
    })),
  );

  const attention = deriveAttentionItems(
    user,
    [
      ...assigned.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        priority: c.priority,
        ownerUserId: c.ownerUserId,
        ownerTeamId: c.ownerTeamId,
        ownerTeamKey: c.ownerTeam.key,
        reviewerUserId: c.reviewerUserId,
        verificationType: c.verificationType,
        releaseId: c.releaseId,
        releaseName: c.release.name,
        projectName: c.release.project.name,
      })),
      ...reviewCandidates.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        priority: c.priority,
        ownerUserId: c.ownerUserId,
        ownerTeamId: c.ownerTeamId,
        ownerTeamKey: c.ownerTeam.key,
        reviewerUserId: c.reviewerUserId,
        verificationType: c.verificationType,
        releaseId: c.releaseId,
        releaseName: c.release.name,
        projectName: c.release.project.name,
      })),
    ],
    active.map((r) => ({
      id: r.id,
      name: r.name,
      projectName: r.project.name,
      gateStatus: r.gateStatus,
      openP0: blockingChecks(
        {
          onboardingType: r.onboardingType,
          baselineCompleted: r.baselineCompleted,
          deploymentStatus: r.deploymentStatus,
        },
        r.checks,
      ).length,
    })),
    5,
  );

  const pills = [
    { n: active.length, label: "aktif yayın", dot: "bg-sand-500" },
    { n: blocked.length, label: "yayın hazır değil", dot: "bg-rust-500" },
    { n: criticalOpen, label: "kritik kontrol açık", dot: "bg-rust-500" },
    { n: pendingReviews, label: "onay bekliyor", dot: "bg-honey-400" },
  ];

  return (
    <Shell user={user}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs font-semibold text-sand-500">{dateContext()}</div>
          <h1 className="mt-1 text-page font-bold text-sand-900">{greeting(user.name)}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {pills.map((p) => (
            <div
              key={p.label}
              className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-sand-200 bg-white px-3.5 text-[13px] text-sand-800"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${p.dot}`} />
              <strong className="font-extrabold text-sand-900">{p.n}</strong>
              {p.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-3">
          <SectionTitle meta="Hedef tarihe göre">Aktif Yayınlar</SectionTitle>
          {active.length === 0 ? <EmptyState title="Aktif yayın yok." body="Yeni bir yayın oluşturulduğunda burada görünür." /> : null}
          {active.map((r) => {
            const releaseInput = {
              onboardingType: r.onboardingType,
              baselineCompleted: r.baselineCompleted,
              deploymentStatus: r.deploymentStatus,
            };
            const blockers = blockingChecks(releaseInput, r.checks);
            const owner = mainOwnerRisk(blockers);
            const ownerTeam = blockers[0]?.ownerTeam;
            const progress = calculateProgress(r.checks);
            const teams = teamSummaries(releaseInput, r.checks);
            return (
              <Link key={r.id} href={`/releases/${r.id}`} className="group block">
                <Card className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-[minmax(0,1fr)_auto] px-5 py-[18px] transition-colors duration-fast ease-out group-hover:border-sand-300">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-sand-500">{r.project.name}</div>
                    <div className="mt-0.5 text-[17px] font-bold text-sand-900">{r.name}</div>
                  </div>
                  <GateBadge gate={r.gateStatus} />
                  <div className="col-span-full grid grid-cols-2 gap-3 border-t border-sand-200 pt-3.5 sm:grid-cols-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">Kritik</div>
                      <div className={`mt-0.5 text-xl font-extrabold ${blockers.length ? "text-rust-700" : "text-sand-900"}`}>
                        {blockers.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">Engel kimde</div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-sand-900">
                        {ownerTeam ? <TeamGlyph teamKey={ownerTeam.key} /> : null}
                        {owner}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">İlerleme</div>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar percent={progress.percent} className="flex-1" />
                        <span className="text-xs font-bold text-sand-800">{progressLabel(progress)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">Hedef</div>
                      <div className="mt-1.5 text-sm font-bold text-sand-900">{dateShortTr(r.targetDate)}</div>
                    </div>
                  </div>
                  <div className="col-span-full flex flex-wrap gap-1.5">
                    {teams.map((t) => (
                      <TeamBadge
                        key={t.key}
                        teamKey={t.key}
                        name={t.name}
                        tone={t.openP0 > 0 ? "danger" : t.status === "Hazır" ? "success" : "warning"}
                      />
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
          {verified.map((r) => (
            <Link
              key={r.id}
              href={`/releases/${r.id}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-panel border border-sand-200 bg-sand-50 px-4 py-3 text-[13px] text-sand-800 hover:text-sand-800"
            >
              <IconLock size={15} className="text-olive-700" />
              <strong className="text-sand-900">
                {r.project.name} · {r.name}
              </strong>
              <span>Canlıda doğrulandı{r.targetDate ? `, ${dateShortTr(r.targetDate)}` : ""}</span>
              <span className="ml-auto font-semibold text-olive-700">Yayında</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="px-5 py-[18px]">
            <h2 className="mb-3 text-base font-bold text-sand-900">Dikkat Gerektirenler</h2>
            {attention.length === 0 ? (
              <EmptyState title="Dikkat gerektiren kayıt yok." body="Açık düzeltme veya onay olduğunda burada görünür." />
            ) : (
              <div className="flex flex-col gap-1">
                {attention.map((a) => (
                  <Link
                    key={a.id}
                    href={a.href}
                    className="flex items-center gap-3 rounded-row p-2.5 transition-colors duration-fast ease-out hover:bg-sand-50"
                  >
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-tile text-[15px] font-extrabold ${
                        a.tone === "danger"
                          ? "bg-rust-100 text-rust-700"
                          : a.tone === "warning"
                            ? "bg-honey-100 text-honey-700"
                            : a.tone === "brand"
                              ? "bg-clay-50 text-clay-700"
                              : "bg-sand-100 text-sand-700"
                      }`}
                    >
                      {a.n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-sand-900">{a.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-sand-500">{a.meta}</span>
                    </span>
                    <IconChevronRight size={16} className="text-sand-400" />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="px-5 py-[18px]">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-base font-bold text-sand-900">Bana Atananlar</h2>
              <span className="text-xs font-bold text-sand-500">{assigned.length}</span>
            </div>
            {assigned.length === 0 ? (
              <EmptyState title="Sana atanan açık iş yok." />
            ) : (
              assigned.map((c) => (
                <Link
                  key={c.id}
                  href={`/checks/${c.id}`}
                  className="flex flex-col gap-1.5 border-t border-sand-200 py-2.5"
                >
                  <div className="text-[13px] font-bold text-sand-900" style={{ lineHeight: 1.35 }}>
                    {c.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-sand-500">
                      {c.release.project.name} · {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))
            )}
          </Card>
        </div>
      </div>
    </Shell>
  );
}
