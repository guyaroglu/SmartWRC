import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { PageHeader, Shell } from "@/components/shell";
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
      <PageHeader title="Kullanıcılar" subtitle="Kullanıcılar yönetici tarafından oluşturulur. Açık kayıt yoktur." />
      <div className="overflow-x-auto rounded-card border border-sand-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-sand-50 text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400">
              <th className="px-5 py-3">Ad</th>
              <th>E-posta</th>
              <th>Rol</th>
              <th>Ekip</th>
              <th>Aktif</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-sand-200">
                <td className="px-5 py-3 font-semibold">{u.name}</td>
                <td>{u.email}</td>
                <td>{roleLabel[u.role] ?? u.role}</td>
                <td>{u.team ? teamLabel[u.team.key] ?? u.team.name : "—"}</td>
                <td>{u.isActive ? "Aktif" : "Pasif"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
