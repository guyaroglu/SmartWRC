import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/shell";
import { canManageSystem } from "@/lib/authz";
import { redirect } from "next/navigation";
import { homePath } from "@/lib/nav";
import { roleLabel, teamLabel } from "@/lib/labels";

export default async function AdminPage() {
  const user = await requireUser();
  if (!canManageSystem(user)) redirect(homePath(user.role));
  const users = await prisma.user.findMany({ include: { team: true }, orderBy: { email: "asc" } });

  return (
    <Shell name={user.name} role={user.role}>
      <h1 className="text-2xl font-semibold">Kullanıcılar</h1>
      <p className="text-sm text-ink/65">Kullanıcılar yönetici tarafından oluşturulur. Açık kayıt yoktur.</p>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-ink/50">
            <th className="py-2">Ad</th>
            <th>E-posta</th>
            <th>Rol</th>
            <th>Ekip</th>
            <th>Aktif</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-ink/5">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td>{roleLabel[u.role] ?? u.role}</td>
              <td>{u.team ? teamLabel[u.team.key] ?? u.team.name : "—"}</td>
              <td>{u.isActive ? "Aktif" : "Pasif"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Shell>
  );
}
