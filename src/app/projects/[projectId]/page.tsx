import Link from "next/link";
import { notFound } from "next/navigation";
import { createReleaseAction } from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, Field, GateBadge, PageHeader, PrimaryButton, SelectInput, Shell, TextInput } from "@/components/shell";
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

      <h2 className="text-base font-bold text-sand-900">Varsayılan ekip eşlemesi</h2>
      <ul className="text-sm text-sand-700">
        {project.teamAssignments.map((a) => (
          <li key={a.id}>
            {teamLabel[a.team.key] ?? a.team.name} → {a.user.name}
          </li>
        ))}
      </ul>

      {!readOnly && canCreateRelease(user) ? (
        <form action={createReleaseAction} className="space-y-3 rounded-card border border-sand-200 bg-white p-5 shadow-card">
          <h2 className="font-bold text-sand-900">Yeni release</h2>
          <input type="hidden" name="projectId" value={project.id} />
          <Field label="Release adı">
            <TextInput name="name" placeholder="Website Migration" required className="rounded-xl" />
          </Field>
          <Field label="Şablon sürümü">
            <SelectInput name="templateVersionId" required className="w-full rounded-xl">
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
            <SelectInput name="onboardingType" className="w-full rounded-xl">
              <option value="NEW">Yeni</option>
              <option value="IN_PROGRESS">Devam eden</option>
              <option value="LIVE_UNVERIFIED">Canlı, doğrulanmamış</option>
            </SelectInput>
          </Field>
          <p className="text-xs text-sand-500">
            Canlı, doğrulanmamış: geçmiş pre-launch kontroller PASS yazılmaz. Baseline bitene kadar kapı Henüz Değerlendirilmedi kalır.
          </p>
          <Field label="Hedef tarih">
            <TextInput name="targetDate" type="date" className="rounded-xl" />
          </Field>
          <fieldset className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
            <legend className="mb-1 text-xs font-semibold text-sand-800">Modüller</legend>
            {MODULES.map((m) => (
              <label key={m} className="flex items-center gap-2">
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
          <PrimaryButton>Release oluştur</PrimaryButton>
        </form>
      ) : null}

      <h2 className="text-base font-bold text-sand-900">Release’ler</h2>
      <ul className="space-y-2">
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
              <Card className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                <div>
                  <Link className="font-bold no-underline" href={`/releases/${r.id}`}>
                    {r.name}
                  </Link>
                  <p className="text-xs text-sand-500">Hedef: {dateShortTr(r.targetDate)}</p>
                </div>
                <span className="text-sm">
                  <GateBadge gate={r.gateStatus} />
                  {blockers.length ? ` · ${blockers.length} kritik` : ""}
                </span>
              </Card>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
