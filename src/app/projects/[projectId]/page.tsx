import Link from "next/link";
import { notFound } from "next/navigation";
import { createReleaseAction } from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, Eyebrow, Field, GateBadge, PageHeader, PrimaryButton, SelectInput, Shell, TeamBadge, TextInput } from "@/components/shell";
import { IconChevronRight } from "@/components/icons";
import { canCreateRelease } from "@/lib/authz";
import { ModuleKey, Role } from "@prisma/client";
import { blockingChecks } from "@/lib/release-view";
import { dateShortTr } from "@/lib/format";
import { moduleLabel, teamLabel } from "@/lib/labels";

const MODULES = Object.values(ModuleKey);

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      releases: {
        include: { checks: { include: { ownerTeam: true } } },
        orderBy: { createdAt: "desc" },
      },
      teamAssignments: { include: { team: true, user: true } },
    },
  });
  if (!project) notFound();
  const templates = await prisma.templateVersion.findMany({ include: { template: true } });
  const readOnly = user.role === Role.MANAGEMENT;

  return (
    <Shell user={user}>
      <PageHeader title={project.name} subtitle="Gate, proje değil release üzerindedir." />

      <Card className="flex flex-col gap-3 px-5 py-[18px]">
        <h2 className="text-base font-bold text-sand-900">Varsayılan ekip eşlemesi</h2>
        {project.teamAssignments.length === 0 ? (
          <p className="text-[13px] text-sand-500">Eşleme yok.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {project.teamAssignments.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-row bg-sand-50 px-3 py-2.5 text-[13px] text-sand-800">
                <TeamBadge teamKey={a.team.key} name={teamLabel[a.team.key] ?? a.team.name} />
                <span className="truncate font-semibold text-sand-900">{a.user.name}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {!readOnly && canCreateRelease(user) ? (
        <form action={createReleaseAction} className="flex flex-col gap-3.5 rounded-card border border-sand-200 bg-white px-5 py-[18px] shadow-card">
          <h2 className="text-base font-bold text-sand-900">Yeni release</h2>
          <input type="hidden" name="projectId" value={project.id} />
          <Field label="Release adı">
            <TextInput name="name" placeholder="Website Migration" required />
          </Field>
          <Field label="Şablon sürümü">
            <SelectInput name="templateVersionId" required className="w-full">
              {templates
                .slice()
                .sort((a, b) => (a.version.includes("pilot") ? -1 : b.version.includes("pilot") ? 1 : 0))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.template.name} v{t.version}
                  </option>
                ))}
            </SelectInput>
          </Field>
          <Field label="Onboarding tipi">
            <SelectInput name="onboardingType" className="w-full">
              <option value="NEW">Yeni</option>
              <option value="IN_PROGRESS">Devam eden</option>
              <option value="LIVE_UNVERIFIED">Canlı, doğrulanmamış</option>
            </SelectInput>
          </Field>
          <p className="text-xs text-sand-500" style={{ lineHeight: 1.45 }}>
            Canlı, doğrulanmamış: geçmiş pre-launch kontroller PASS yazılmaz. Baseline bitene kadar kapı Henüz Değerlendirilmedi kalır.
          </p>
          <Field label="Hedef tarih">
            <TextInput name="targetDate" type="date" />
          </Field>
          <fieldset className="grid grid-cols-2 gap-2 text-[13px] text-sand-800 md:grid-cols-3">
            <legend className="mb-1.5 text-xs font-semibold text-sand-800">Modüller</legend>
            {MODULES.map((m) => (
              <label key={m} className="flex items-center gap-2 accent-clay-500">
                <input
                  type="checkbox"
                  name="modules"
                  value={m}
                  defaultChecked={["FRONTEND", "NETWORK", "SEO", "POST_LAUNCH"].includes(m)}
                />
                {moduleLabel[m] ?? m}
              </label>
            ))}
          </fieldset>
          <div>
            <PrimaryButton>Release Oluştur</PrimaryButton>
          </div>
        </form>
      ) : null}

      <Eyebrow className="-mb-2 text-[13px] text-sand-500">Release’ler</Eyebrow>
      <ul className="flex flex-col gap-3">
        {project.releases.map((r) => {
          const blockers = blockingChecks(
            {
              onboardingType: r.onboardingType,
              baselineCompleted: r.baselineCompleted,
              deploymentStatus: r.deploymentStatus,
            },
            r.checks,
          );
          return (
            <li key={r.id}>
              <Link href={`/releases/${r.id}`} className="group block">
                <Card className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-[18px] transition-colors duration-fast ease-out group-hover:border-sand-300">
                  <div className="min-w-0 flex-1">
                    <div className="text-title font-bold text-sand-900">{r.name}</div>
                    <div className="mt-0.5 text-[13px] text-sand-500">
                      Hedef {dateShortTr(r.targetDate)}
                      {blockers.length ? (
                        <>
                          {" · "}
                          <strong className="font-bold text-rust-700">{blockers.length} kritik</strong>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <GateBadge gate={r.gateStatus} />
                  <IconChevronRight size={16} className="text-sand-400" />
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
