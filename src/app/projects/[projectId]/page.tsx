import Link from "next/link";
import { notFound } from "next/navigation";
import { createReleaseAction, setProjectTeamAction } from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, Eyebrow, FeedbackAlert, Field, GateBadge, PageHeader, PrimaryButton, SecondaryButton, SelectInput, Shell, TeamBadge, TextInput } from "@/components/shell";
import { IconChevronRight } from "@/components/icons";
import { canCreateRelease, isOperationalEditor } from "@/lib/authz";
import { PROJECT_TEAM_SLOTS, eligibleProjectPeople } from "@/lib/project-team";
import { ModuleKey, Role } from "@prisma/client";
import { blockingChecks } from "@/lib/release-view";
import { dateShortTr } from "@/lib/format";
import { moduleLabel, teamLabel } from "@/lib/labels";

const MODULES = Object.values(ModuleKey);

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const { err, ok } = await searchParams;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      releases: {
        include: { checks: { include: { ownerTeam: true } } },
        orderBy: { createdAt: "desc" },
      },
      teamAssignments: { include: { team: true, user: true } },
      pmUser: true,
    },
  });
  if (!project) notFound();
  const canEditTeam = !project.archived && isOperationalEditor(user);
  const teamRows = await Promise.all(
    PROJECT_TEAM_SLOTS.map(async (slot) => ({
      slot,
      label: slot === "PM" ? "PM" : teamLabel[slot] ?? slot,
      current: slot === "PM" ? project.pmUser : project.teamAssignments.find((a) => a.team.key === slot)?.user ?? null,
      options: canEditTeam ? await eligibleProjectPeople(slot) : [],
    })),
  );
  const templates = await prisma.templateVersion.findMany({ include: { template: true } });
  const readOnly = user.role === Role.MANAGEMENT;

  return (
    <Shell user={user}>
      <PageHeader title={project.name} subtitle="Yayın kararı proje için değil, her yayın için ayrı verilir." />

      {err ? <FeedbackAlert title="İşlem yapılamadı" body={err} /> : null}
      {ok === "team" ? <FeedbackAlert tone="warning" title="Proje ekibi güncellendi. Mevcut görevler değişmedi." /> : null}
      <Card className="flex flex-col gap-3 px-5 py-[18px]">
        <h2 className="text-base font-bold text-sand-900">Proje ekibi</h2>
        <p className="text-xs text-sand-500" style={{ lineHeight: 1.45 }}>
          Varsayılan kişiler yeni yayın ve yeni görevlerde kullanılır. Mevcut görevler kendiliğinden yeni kişiye geçmez; onları görev
          sayfasından “Ekip İçinde Ata” ile ayrıca atarsın.
        </p>
        <ul className="flex flex-col gap-2">
          {teamRows.map((row) => (
            <li key={row.slot} className="flex flex-wrap items-center gap-2 rounded-row bg-sand-50 px-3 py-2.5 text-[13px] text-sand-800">
              {row.slot === "PM" ? (
                <span className="w-24 font-bold text-sand-900">PM</span>
              ) : (
                <span className="w-24">
                  <TeamBadge teamKey={row.slot} name={row.label} />
                </span>
              )}
              {canEditTeam ? (
                <form action={setProjectTeamAction} className="flex flex-1 flex-wrap items-center gap-2">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="slot" value={row.slot} />
                  <SelectInput name="userId" defaultValue={row.current?.id ?? ""} required aria-label={`${row.label} varsayılan kişisi`}>
                    <option value="" disabled>
                      Kişi seç
                    </option>
                    {row.options.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </SelectInput>
                  <SecondaryButton size="sm">Kaydet</SecondaryButton>
                  {row.current && !row.current.isActive ? <span className="text-xs font-semibold text-rust-700">Mevcut kişi pasif</span> : null}
                </form>
              ) : (
                <span className="font-semibold text-sand-900">{row.current?.name ?? "—"}</span>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {!readOnly && canCreateRelease(user) ? (
        <form action={createReleaseAction} className="flex flex-col gap-3.5 rounded-card border border-sand-200 bg-white px-5 py-[18px] shadow-card">
          <h2 className="text-base font-bold text-sand-900">Yeni Yayın</h2>
          <input type="hidden" name="projectId" value={project.id} />
          <Field label="Yayın adı">
            <TextInput name="name" placeholder="Website Migration" required />
          </Field>
          <Field label="Kontrol şablonu">
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
          <Field label="Sitenin durumu">
            <SelectInput name="onboardingType" className="w-full">
              <option value="NEW">Yeni site / ilk yayın</option>
              <option value="IN_PROGRESS">Yapımı devam eden</option>
              <option value="LIVE_UNVERIFIED">Zaten canlıda, doğrulanmamış</option>
            </SelectInput>
          </Field>
          <p className="text-xs text-sand-500" style={{ lineHeight: 1.45 }}>
            Kontrol görevleri seçilen şablondan otomatik oluşur; tek tek eklemen gerekmez. “Zaten canlıda” seçilirse geçmiş kontroller onaylanmış sayılmaz; mevcut canlı durum kaydedilene kadar yayın kararı “Henüz Değerlendirilmedi” kalır.
          </p>
          <Field label="Hedef tarih">
            <TextInput name="targetDate" type="date" />
          </Field>
          <fieldset className="grid grid-cols-2 gap-2 text-[13px] text-sand-800 md:grid-cols-3">
            <legend className="mb-1.5 text-xs font-semibold text-sand-800">Kapsam (hangi kontrol grupları oluşturulsun?)</legend>
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
            <PrimaryButton>Yayın Oluştur</PrimaryButton>
          </div>
        </form>
      ) : null}

      <Eyebrow className="-mb-2 text-[13px] text-sand-500">Yayınlar</Eyebrow>
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
