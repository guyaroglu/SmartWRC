import Link from "next/link";
import { createProjectAction } from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, GateBadge, PageHeader, PrimaryButton, Shell, TextInput } from "@/components/shell";
import { IconChevronRight } from "@/components/icons";
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
        <Card className="px-5 py-[18px]">
          <form action={createProjectAction} className="flex flex-wrap items-center gap-2">
            <label htmlFor="new-project" className="w-full text-xs font-semibold text-sand-800">
              Yeni proje
            </label>
            <TextInput id="new-project" name="name" placeholder="Proje adı" required className="min-w-0 flex-1 basis-56" />
            <PrimaryButton>Proje Oluştur</PrimaryButton>
          </form>
        </Card>
      ) : null}
      {projects.length === 0 ? <EmptyState title="Henüz proje yok." /> : null}
      <ul className="flex flex-col gap-3">
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
              <Link href={`/projects/${p.id}`} className="group block">
                <Card className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-[18px] transition-colors duration-fast ease-out group-hover:border-sand-300">
                  <div className="min-w-0 flex-1">
                    <div className="text-title font-bold text-sand-900">{p.name}</div>
                    <div className="mt-0.5 text-[13px] text-sand-500">
                      {current ? `Aktif release: ${current.name}` : "Aktif release yok"}
                      {blockers.length ? (
                        <>
                          {" · "}
                          <strong className="font-bold text-rust-700">{blockers.length} kritik blocker</strong>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {current ? <GateBadge gate={current.gateStatus} /> : null}
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
