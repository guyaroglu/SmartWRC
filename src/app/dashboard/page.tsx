import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, GateBadge, PriorityBadge, Shell, StatusBadge } from "@/components/shell";
import { CheckStatus, Role } from "@prisma/client";
import { firstName, relativeTr } from "@/lib/format";
import { isPendingReviewFor } from "@/lib/review-queue";
import { blockingChecks, mainOwnerRisk, teamSummaries } from "@/lib/release-view";
import { openRiskCounts } from "@/lib/gate";
import { teamLabel } from "@/lib/labels";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === Role.MANAGEMENT) redirect("/management");

  const myChecks = user.teamId
    ? await prisma.releaseCheck.findMany({
        where: {
          ownerTeamId: user.teamId,
          status: { notIn: [CheckStatus.PASS, CheckStatus.NA, CheckStatus.WAIVED, CheckStatus.REMOVED_FROM_SCOPE] },
        },
        include: { release: { include: { project: true } } },
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
      })
    : [];

  const reviewCandidates = await prisma.releaseCheck.findMany({
    where: { status: CheckStatus.REVIEW },
    include: { release: { include: { project: true } }, ownerTeam: true, ownerUser: true },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });
  const myReviews = reviewCandidates.filter((c) =>
    isPendingReviewFor(user, {
      ownerUserId: c.ownerUserId,
      ownerTeamId: c.ownerTeamId,
      ownerTeamKey: c.ownerTeam.key,
      reviewerUserId: c.reviewerUserId,
      verificationType: c.verificationType,
      status: c.status,
    }),
  );

  const releases = await prisma.release.findMany({
    where: { archived: false },
    include: { project: true, checks: { include: { ownerTeam: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const fail = myChecks.filter((c) => c.status === CheckStatus.FAIL);
  const critical = myChecks.filter((c) => c.priority === "P0");
  const todo = myChecks.filter((c) => c.status === CheckStatus.NOT_STARTED);
  const blocked = myChecks.filter((c) => c.status === CheckStatus.BLOCKED);
  const approaching = releases.filter((r) => r.gateStatus !== "READY" && r.targetDate).slice(0, 3);

  return (
    <Shell name={user.name} role={user.role}>
      {user.role === Role.TEAM_MEMBER ? (
        <>
          <h1 className="text-2xl font-semibold">Merhaba {firstName(user.name)}</h1>
          <p className="mt-2 text-ink/70">
            Bugün senden beklenen {myChecks.length} kontrol var.
            {critical.length ? ` ${critical.length} kritik kontrol açık.` : ""}
            {fail.length ? ` ${fail.length} kontrol düzeltme için sana geri gönderildi.` : ""}
          </p>
          <CheckSection title="Düzeltme Gerekenler" items={fail} empty="Düzeltme bekleyen iş yok." />
          <CheckSection title="Kritik Kontroller" items={critical} empty="Açık kritik kontrol yok." />
          <CheckSection title="Yapılacaklar" items={todo} empty="Yeni yapılacak kontrol yok." />
          <CheckSection title="Bloklananlar" items={blocked} empty="Bloklanan kontrol yok." />
        </>
      ) : null}

      {user.role === Role.SEO_LEAD ? (
        <>
          <h1 className="text-2xl font-semibold">Merhaba {firstName(user.name)}</h1>
          <p className="mt-2 text-ink/70">
            {myReviews.length} onay bekliyor. {releases.filter((r) => openP0(r) > 0).length} release’te kritik blocker var.
            {approaching.length ? ` ${approaching.length} release yayına yaklaşıyor.` : ""}
          </p>
          <section className="mt-6">
            <h2 className="font-medium">Onay Bekleyenler</h2>
            <ul className="mt-2 space-y-2">
              {myReviews.length === 0 ? <li className="text-sm text-ink/55">Onay bekleyen kontrol yok.</li> : null}
              {myReviews.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <Card>
                    <Link className="font-medium no-underline" href={`/checks/${c.id}`}>
                      {c.release.project.name} — {c.title}
                    </Link>
                    <p className="mt-1 text-xs text-ink/55">
                      {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name} gönderdi · {relativeTr(c.updatedAt)} · {c.priority === "P0" ? "Kritik" : "Yüksek"}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
          <SeoRisks releases={releases} />
          <ReleaseList releases={releases} />
        </>
      ) : null}

      {user.role === Role.PROJECT_MANAGER || user.role === Role.SYSTEM_ADMIN ? (
        <>
          <h1 className="text-2xl font-semibold">
            {user.role === Role.SYSTEM_ADMIN ? "Sistem özeti" : `Merhaba ${firstName(user.name)}`}
          </h1>
          <p className="mt-2 text-ink/70">Release’i ne blokluyor ve kimde bekliyor?</p>
          <ReleaseList releases={releases} showOwners />
        </>
      ) : null}
    </Shell>
  );
}

function openP0(r: {
  onboardingType: "NEW" | "IN_PROGRESS" | "LIVE_UNVERIFIED";
  baselineCompleted: boolean;
  deploymentStatus: "NOT_DEPLOYED" | "DEPLOYED" | "POST_LAUNCH_VERIFYING" | "PRODUCTION_VERIFIED";
  checks: { status: CheckStatus; priority: "P0" | "P1" | "P2" | "P3"; releaseBlocker: boolean; module: string; evidenceRequired: boolean; verificationType: string }[];
}) {
  return openRiskCounts(
    {
      onboardingType: r.onboardingType,
      baselineCompleted: r.baselineCompleted,
      deploymentStatus: r.deploymentStatus,
    },
    r.checks.map((c) => ({
      status: c.status,
      priority: c.priority,
      releaseBlocker: c.releaseBlocker,
      evidenceRequired: c.evidenceRequired,
      verificationType: c.verificationType as never,
      module: c.module as never,
      evidenceCount: 0,
    })),
  ).p0;
}

function CheckSection({
  title,
  items,
  empty,
}: {
  title: string;
  items: { id: string; title: string; priority: "P0" | "P1" | "P2" | "P3"; status: CheckStatus; release: { name: string; project: { name: string } } }[];
  empty: string;
}) {
  return (
    <section className="mt-6">
      <h2 className="font-medium">{title}</h2>
      {items.length === 0 ? <p className="mt-2 text-sm text-ink/55">{empty}</p> : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-ink/50">
                <th className="py-2">Öncelik</th>
                <th>Kontrol</th>
                <th>Proje</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="py-2"><PriorityBadge priority={c.priority} /></td>
                  <td><Link className="no-underline" href={`/checks/${c.id}`}>{c.title}</Link></td>
                  <td className="text-ink/70">{c.release.project.name}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ReleaseList({
  releases,
  showOwners = false,
}: {
  releases: {
    id: string;
    name: string;
    gateStatus: "NO_GO" | "AT_RISK" | "READY" | "NOT_ASSESSED";
    onboardingType: "NEW" | "IN_PROGRESS" | "LIVE_UNVERIFIED";
    baselineCompleted: boolean;
    deploymentStatus: "NOT_DEPLOYED" | "DEPLOYED" | "POST_LAUNCH_VERIFYING" | "PRODUCTION_VERIFIED";
    project: { name: string };
    checks: {
      id: string;
      title: string;
      status: CheckStatus;
      priority: "P0" | "P1" | "P2" | "P3";
      releaseBlocker: boolean;
      module: string;
      domains: string[];
      ownerTeamId: string;
      ownerTeam: { key: string; name: string };
    }[];
  }[];
  showOwners?: boolean;
}) {
  return (
    <section className="mt-6">
      <h2 className="font-medium">Release Durumu</h2>
      <ul className="mt-2 space-y-2">
        {releases.map((r) => {
          const blockers = blockingChecks(
            {
              onboardingType: r.onboardingType,
              baselineCompleted: r.baselineCompleted,
              deploymentStatus: r.deploymentStatus,
            },
            r.checks as never,
          );
          const owner = mainOwnerRisk(blockers);
          const teams = showOwners
            ? teamSummaries(
                {
                  onboardingType: r.onboardingType,
                  baselineCompleted: r.baselineCompleted,
                  deploymentStatus: r.deploymentStatus,
                },
                r.checks as never,
              ).filter((t) => t.openP0 > 0)
            : [];
          return (
            <li key={r.id}>
              <Card className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link className="font-medium no-underline" href={`/releases/${r.id}`}>
                    {r.project.name} — {r.name}
                  </Link>
                  {teams.length ? (
                    <p className="mt-1 text-xs text-ink/55">
                      Bekleyen ekipler: {teams.map((t) => `${t.name} (${t.openP0})`).join(", ")}
                    </p>
                  ) : null}
                </div>
                <span className="text-xs">
                  <GateBadge gate={r.gateStatus} />
                  {blockers.length ? ` · ${blockers.length} kritik · ${owner}` : ""}
                </span>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SeoRisks({
  releases,
}: {
  releases: {
    id: string;
    name: string;
    project: { name: string };
    onboardingType: "NEW" | "IN_PROGRESS" | "LIVE_UNVERIFIED";
    baselineCompleted: boolean;
    deploymentStatus: "NOT_DEPLOYED" | "DEPLOYED" | "POST_LAUNCH_VERIFYING" | "PRODUCTION_VERIFIED";
    checks: {
      id: string;
      title: string;
      status: CheckStatus;
      priority: "P0" | "P1" | "P2" | "P3";
      releaseBlocker: boolean;
      module: string;
      domains: string[];
      ownerTeamId: string;
      ownerTeam: { key: string; name: string };
    }[];
  }[];
}) {
  const risks = releases.flatMap((r) =>
    r.checks
      .filter(
        (c) =>
          (c.priority === "P0" || c.priority === "P1") &&
          (c.domains.includes("SEO") || c.domains.includes("GEO")) &&
          !["PASS", "NA", "WAIVED", "REMOVED_FROM_SCOPE"].includes(c.status),
      )
      .map((c) => ({ ...c, releaseName: r.name, projectName: r.project.name })),
  );
  return (
    <section className="mt-6">
      <h2 className="font-medium">Kritik SEO/GEO Riskleri</h2>
      <ul className="mt-2 space-y-2">
        {risks.length === 0 ? <li className="text-sm text-ink/55">Açık SEO/GEO riski yok.</li> : null}
        {risks.slice(0, 8).map((c) => (
          <li key={c.id}>
            <Card>
              <Link className="no-underline" href={`/checks/${c.id}`}>
                {c.projectName} — {c.title}
              </Link>
              <p className="mt-1 text-xs text-ink/55">
                Sorumlu ekip: {teamLabel[c.ownerTeam.key] ?? c.ownerTeam.name} · {c.releaseName}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
