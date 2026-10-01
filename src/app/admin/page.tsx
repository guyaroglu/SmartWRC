import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Badge, Card, FeedbackAlert, Field, PageHeader, PrimaryButton, SecondaryButton, SelectInput, Shell, TextInput } from "@/components/shell";
import { canManageSystem } from "@/lib/authz";
import { redirect } from "next/navigation";
import { homePath } from "@/lib/nav";
import { roleLabel, teamLabel } from "@/lib/labels";
import { adminCreateUserAction, adminResetPasswordAction, adminUpdateUserAction } from "@/app/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/account-service";
import { CheckStatus, Role, TeamKey } from "@prisma/client";

const ROLES = [Role.TEAM_MEMBER, Role.SEO_LEAD, Role.PROJECT_MANAGER, Role.MANAGEMENT, Role.SYSTEM_ADMIN];
const TEAMS = [TeamKey.FRONTEND, TeamKey.BACKEND, TeamKey.NETWORK, TeamKey.CONTENT, TeamKey.SEO];
const DONE = [CheckStatus.PASS, CheckStatus.NA, CheckStatus.WAIVED, CheckStatus.REMOVED_FROM_SCOPE];
const OK: Record<string, string> = {
  created: "Kullanıcı oluşturuldu. İlk girişte kendi şifresini belirleyecek.",
  updated: "Kullanıcı güncellendi.",
  reset: "Geçici şifre ayarlandı. Kullanıcı sonraki girişte şifresini değiştirecek.",
};

function RoleSelect({ value }: { value?: Role }) {
  return (
    <SelectInput name="role" defaultValue={value ?? Role.TEAM_MEMBER} aria-label="Rol">
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {roleLabel[r] ?? r}
        </option>
      ))}
    </SelectInput>
  );
}

function TeamSelect({ value }: { value?: TeamKey | null }) {
  return (
    <SelectInput name="team" defaultValue={value ?? ""} aria-label="Ekip">
      <option value="">Ekip yok (PM / Yönetim / Sistem)</option>
      {TEAMS.map((t) => (
        <option key={t} value={t}>
          {teamLabel[t] ?? t}
        </option>
      ))}
    </SelectInput>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ err?: string; ok?: string }> }) {
  const user = await requireUser();
  if (!canManageSystem(user)) redirect(homePath(user.role));
  const { err, ok } = await searchParams;
  const users = await prisma.user.findMany({
    include: {
      team: true,
      _count: { select: { ownedChecks: { where: { status: { notIn: DONE }, release: { archived: false } } } } },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <Shell user={user}>
      <PageHeader
        title="Sistem Yönetimi"
        subtitle="Hesapları yalnızca sistem yöneticisi açar; dışarıdan kayıt yoktur. Yeni ve sıfırlanan hesaplar ilk girişte kendi şifresini belirler."
      />
      {err ? <FeedbackAlert title="İşlem yapılamadı" body={err} /> : null}
      {ok && OK[ok] ? <FeedbackAlert tone="warning" title={OK[ok]} /> : null}

      <Card className="flex flex-col gap-4 px-6 py-5">
        <h2 className="text-base font-bold text-sand-900">Kullanıcı oluştur</h2>
        <form action={adminCreateUserAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Ad Soyad">
            <TextInput name="name" required autoComplete="off" />
          </Field>
          <Field label="Kullanıcı adı (ör. adsoyad)">
            <TextInput name="username" required pattern="[A-Za-z0-9][A-Za-z0-9._\-]{2,31}" autoComplete="off" />
          </Field>
          <Field label="E-posta (isteğe bağlı)">
            <TextInput name="email" type="email" autoComplete="off" />
          </Field>
          <Field label="Rol">
            <RoleSelect />
          </Field>
          <Field label="Ekip (ekip üyesi için zorunlu; SEO Lideri → SEO)">
            <TeamSelect />
          </Field>
          <Field label={`Geçici şifre (en az ${MIN_PASSWORD_LENGTH} karakter)`}>
            <TextInput name="temporaryPassword" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
          </Field>
          <label className="flex items-center gap-2 text-[13px] font-semibold text-sand-800">
            <input type="checkbox" name="isActive" defaultChecked /> Aktif
          </label>
          <div className="md:col-span-2">
            <PrimaryButton>Kullanıcı Oluştur</PrimaryButton>
          </div>
        </form>
      </Card>

      <div className="overflow-x-auto rounded-card border border-sand-200 bg-white shadow-card">
        <table className="w-full min-w-[980px] text-left text-[13px]">
          <thead>
            <tr className="bg-sand-50 text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">
              <th className="py-3 pl-5 pr-3 font-bold">Ad</th>
              <th className="px-3 py-3 font-bold">Kullanıcı adı</th>
              <th className="px-3 py-3 font-bold">Rol · Ekip · Durum</th>
              <th className="px-3 py-3 font-bold">Açık görev</th>
              <th className="py-3 pl-3 pr-5 font-bold">Geçici şifre</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-sand-200 align-top">
                <td className="py-3.5 pl-5 pr-3">
                  <div className="text-sm font-bold text-sand-900">{u.name}</div>
                  <div className="text-xs text-sand-500">{u.email ?? "—"}</div>
                  <div className="mt-1 flex gap-1.5">
                    <Badge tone={u.isActive ? "success" : "neutral"} dot>
                      {u.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                    {u.mustChangePassword ? <Badge tone="warning">Şifre değişimi bekliyor</Badge> : null}
                  </div>
                </td>
                <td className="px-3 py-3.5 font-semibold text-sand-800">{u.username}</td>
                <td className="px-3 py-3.5">
                  <form action={adminUpdateUserAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <RoleSelect value={u.role} />
                    <TeamSelect value={u.team?.key ?? null} />
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-sand-800">
                      <input type="checkbox" name="isActive" defaultChecked={u.isActive} /> Aktif
                    </label>
                    <SecondaryButton size="sm">Kaydet</SecondaryButton>
                  </form>
                </td>
                <td className="px-3 py-3.5 text-sand-800">
                  {u._count.ownedChecks}
                  {u._count.ownedChecks && u.isActive ? <div className="text-xs text-sand-500">Pasife almadan önce yeniden ata</div> : null}
                </td>
                <td className="py-3.5 pl-3 pr-5">
                  <form action={adminResetPasswordAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <TextInput
                      name="temporaryPassword"
                      type="password"
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      autoComplete="new-password"
                      aria-label={`${u.username} için geçici şifre`}
                      className="w-40"
                    />
                    <SecondaryButton size="sm">Sıfırla</SecondaryButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
