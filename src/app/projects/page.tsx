import Link from "next/link";
import { createProjectAction } from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, Field, GateBadge, PageHeader, PrimaryButton, Shell, TextInput } from "@/components/shell";
import { canCreateProject } from "@/lib/authz";
import { blockingChecks } from "@/lib/release-view";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { archived: false },
    include: {
      releases: {
        where: { archived: false },
        include: { checks: { include: { ownerTeam: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Shell user={user}>
      <PageHeader title="Projeler" subtitle="Gate proje değil, release üzerindedir." />
      {canCreateProject(user) ? (
        <form action={createProjectAction} className="flex flex-wrap items-end gap-2">
          <Field label="Yeni proje" className="min-w-64 flex-1">
            <TextInput name="name" placeholder="Proje adı" required />
          </Field>
          <PrimaryButton>Proje oluştur</PrimaryButton>
        </form>
      ) : null}
      {projects.length === 0 ? <EmptyState title="Henüz proje yok." /> : null}
      <ul className="space-y-2">
        {projects.map((p) => {
          const active = p.releases.filter((r) => r.deploymentStatus !== "PRODUCTION_VERIFIED");
          const current = active[0] ?? p.releases[0];
          const blockers = current
            ? blockingChecks(
                {
                  onboardingType: current.onboardingType,
                  baselineCompleted: current.baselineCompleted,
                  deploymentStatus: current.deploymentStatus,
                },
                current.checks,
              )
            : [];
          return (
            <li key={p.id}>
              <Card className="px-5 py-4">
                <Link className="text-lg font-bold no-underline" href={`/projects/${p.id}`}>
                  {p.name}
                </Link>
                <p className="mt-1 text-sm text-sand-600">
                  {current ? `Aktif release: ${current.name}` : "Aktif release yok"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  {current ? <GateBadge gate={current.gateStatus} /> : null}
                  {blockers.length ? <span className="text-sand-600">{blockers.length} kritik blocker</span> : null}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
