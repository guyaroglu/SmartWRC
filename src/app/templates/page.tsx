import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader, Shell } from "@/components/shell";
import { IconChevronRight } from "@/components/icons";
import { canManageTemplates } from "@/lib/authz";
import { redirect } from "next/navigation";
import { dateShortTr } from "@/lib/format";
import { moduleLabel, teamLabel } from "@/lib/labels";
import { homePath } from "@/lib/nav";

export default async function TemplatesPage() {
  const user = await requireUser();
  if (!canManageTemplates(user)) redirect(homePath(user.role));
  const versions = await prisma.templateVersion.findMany({
    include: { template: true, controls: true, releases: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Shell user={user}>
      <PageHeader
        title="Şablonlar"
        subtitle="Şablon sürümleri değişmez. Mevcut release kayıtları şablon güncellenince değişmez."
      />
      {versions.map((v) => {
        const byModule = new Map<string, typeof v.controls>();
        for (const c of v.controls) {
          const list = byModule.get(c.module) ?? [];
          list.push(c);
          byModule.set(c.module, list);
        }
        return (
          <Card key={v.id} className="overflow-hidden">
            <div className="px-5 py-[18px]">
            <h2 className="text-base font-bold text-sand-900">{v.template.name}</h2>
            <p className="mt-1 text-[13px] text-sand-500">
              Sürüm {v.version} · {v.controls.length} kontrol · {v.releases.length} release kullanıyor · {dateShortTr(v.createdAt)} · Aktif
            </p>
            </div>
            {[...byModule.entries()].map(([module, controls]) => (
              <details key={module} className="border-t border-sand-200">
                <summary className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors duration-fast ease-out hover:bg-sand-50">
                  <IconChevronRight size={16} className="chev text-sand-500 transition-transform duration-fast ease-out" />
                  <span className="text-sm font-bold text-sand-900">{moduleLabel[module] ?? module}</span>
                  <span className="text-xs font-semibold text-sand-500">{controls.length} kontrol</span>
                </summary>
                <ul className="flex flex-col px-3 pb-3 md:pl-[52px] md:pr-5">
                  {controls.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-row px-3 py-2.5">
                      <span className="min-w-0 flex-1 text-[13px] font-semibold text-sand-900">{c.title}</span>
                      <span className="text-xs text-sand-500">
                        {c.controlCode} · {teamLabel[c.ownerTeamKey] ?? c.ownerTeamKey}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </Card>
        );
      })}
    </Shell>
  );
}
