import Link from "next/link";
import { createProjectAction } from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, GateBadge, Shell } from "@/components/shell";
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
    <Shell name={user.name} role={user.role}>
      <h1 className="text-2xl font-semibold">Projeler</h1>
      {canCreateProject(user) ? (
        <form action={createProjectAction} className="mt-4 flex gap-2">
          <input className="rounded border px-3 py-2" name="name" placeholder="Yeni proje adı" required />
          <button className="rounded bg-accent px-3 py-2 text-white" type="submit">
            Proje oluştur
          </button>
        </form>
      ) : null}
      <ul className="mt-4 space-y-2">
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
              <Card>
                <Link className="text-lg font-medium no-underline" href={`/projects/${p.id}`}>
                  {p.name}
                </Link>
                {current ? (
                  <p className="mt-1 text-sm text-ink/65">
                    Aktif release: {current.name}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-ink/55">Aktif release yok</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  {current ? <GateBadge gate={current.gateStatus} /> : null}
                  {blockers.length ? <span className="text-ink/60">{blockers.length} kritik blocker</span> : null}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
