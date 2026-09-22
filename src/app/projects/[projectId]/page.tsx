import Link from "next/link";
import { notFound } from "next/navigation";
import { createReleaseAction } from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, GateBadge, Shell } from "@/components/shell";
import { canCreateRelease } from "@/lib/authz";
import { ModuleKey } from "@prisma/client";
import { blockingChecks } from "@/lib/release-view";
import { dateShortTr } from "@/lib/format";
import { moduleLabel } from "@/lib/labels";
import { Role } from "@prisma/client";

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
    <Shell name={user.name} role={user.role}>
      <h1 className="text-2xl font-semibold">{project.name}</h1>
      <p className="text-sm text-ink/65">Gate, proje değil release üzerindedir.</p>

      <h2 className="mt-6 font-medium">Varsayılan ekip eşlemesi</h2>
      <ul className="mt-2 text-sm">
        {project.teamAssignments.map((a) => (
          <li key={a.id}>
            {a.team.name} → {a.user.name}
          </li>
        ))}
      </ul>

      {!readOnly && canCreateRelease(user) ? (
        <form action={createReleaseAction} className="mt-6 space-y-3 rounded-lg border border-ink/10 bg-white p-4">
          <h2 className="font-medium">Yeni release</h2>
          <input type="hidden" name="projectId" value={project.id} />
          <input className="w-full rounded border px-3 py-2" name="name" placeholder="Website Migration" required />
          <select className="w-full rounded border px-3 py-2" name="templateVersionId" required>
            {templates
              .slice()
              .sort((a, b) => (a.version.includes("pilot") ? -1 : b.version.includes("pilot") ? 1 : 0))
              .map((t) => (
              <option key={t.id} value={t.id}>
                {t.template.name} v{t.version}
              </option>
            ))}
          </select>
          <select className="w-full rounded border px-3 py-2" name="onboardingType">
            <option value="NEW">Yeni</option>
            <option value="IN_PROGRESS">Devam eden</option>
            <option value="LIVE_UNVERIFIED">Canlı, doğrulanmamış</option>
          </select>
          <input className="w-full rounded border px-3 py-2" type="date" name="targetDate" />
          <fieldset className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
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
          <button className="rounded bg-accent px-3 py-2 text-white" type="submit">
            Release oluştur
          </button>
        </form>
      ) : null}

      <h2 className="mt-6 font-medium">Release&apos;ler</h2>
      <ul className="mt-2 space-y-2">
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
              <Card className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link className="font-medium no-underline" href={`/releases/${r.id}`}>{r.name}</Link>
                  <p className="text-xs text-ink/55">Hedef: {dateShortTr(r.targetDate)}</p>
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
