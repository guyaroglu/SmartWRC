import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Badge, PageHeader, Shell } from "@/components/shell";
import { canManageSystem } from "@/lib/authz";
import { redirect } from "next/navigation";
import { homePath } from "@/lib/nav";
import { roleLabel, teamLabel } from "@/lib/labels";

export default async function AdminPage() {
  const user = await requireUser();
  if (!canManageSystem(user)) redirect(homePath(user.role));
  const users = await prisma.user.findMany({ include: { team: true }, orderBy: { email: "asc" } });

  return (
    <Shell user={user}>
      <PageHeader title="Sistem Yönetimi" subtitle="Kullanıcılar ve rolleri. Hesaplar sistem yöneticisi tarafından açılır; dışarıdan kayıt yoktur." />
      <div className="overflow-x-auto rounded-card border border-sand-200 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="bg-sand-50 text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">
              <th className="py-3 pl-5 pr-3 font-bold">Ad</th>
              <th className="px-3 py-3 font-bold">E-posta</th>
              <th className="px-3 py-3 font-bold">Rol</th>
              <th className="px-3 py-3 font-bold">Ekip</th>
              <th className="py-3 pl-3 pr-5 font-bold">Aktif</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-sand-200">
                <td className="py-3.5 pl-5 pr-3 text-sm font-bold text-sand-900">{u.name}</td>
                <td className="px-3 py-3.5 text-sand-500">{u.email}</td>
                <td className="px-3 py-3.5 text-sand-800">{roleLabel[u.role] ?? u.role}</td>
                <td className="px-3 py-3.5 text-sand-800">{u.team ? teamLabel[u.team.key] ?? u.team.name : "—"}</td>
                <td className="py-3.5 pl-3 pr-5">
                  <Badge tone={u.isActive ? "success" : "neutral"} dot>
                    {u.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
