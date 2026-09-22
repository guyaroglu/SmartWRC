import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/shell";
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
    <Shell name={user.name} role={user.role}>
      <h1 className="text-2xl font-semibold">Şablonlar</h1>
      <p className="text-sm text-ink/65">
        Şablon sürümleri değişmez. Mevcut release kayıtları şablon güncellenince değişmez.
      </p>
      {versions.map((v) => {
        const byModule = new Map<string, typeof v.controls>();
        for (const c of v.controls) {
          const list = byModule.get(c.module) ?? [];
          list.push(c);
          byModule.set(c.module, list);
        }
        return (
          <section key={v.id} className="mt-4 rounded-lg border border-ink/10 bg-white p-4">
            <h2 className="font-medium">{v.template.name}</h2>
            <p className="mt-1 text-sm text-ink/60">
              Sürüm {v.version} · {v.controls.length} kontrol · {v.releases.length} release kullanıyor · {dateShortTr(v.createdAt)} · Aktif
            </p>
            {[...byModule.entries()].map(([module, controls]) => (
              <details key={module} className="mt-3">
                <summary className="cursor-pointer text-sm font-medium">
                  {moduleLabel[module] ?? module} ({controls.length})
                </summary>
                <ul className="mt-2 space-y-1 text-sm">
                  {controls.map((c) => (
                    <li key={c.id}>
                      {c.title}
                      <span className="ml-2 text-xs text-ink/45">
                        {c.controlCode} · {teamLabel[c.ownerTeamKey] ?? c.ownerTeamKey}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </section>
        );
      })}
    </Shell>
  );
}
