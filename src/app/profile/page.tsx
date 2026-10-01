import { Card, FeedbackAlert, PageHeader, Shell, Badge } from "@/components/shell";
import { PasswordForm } from "@/components/password-form";
import { requireUser } from "@/lib/current-user";
import { roleLabel, teamLabel } from "@/lib/labels";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ err?: string; ok?: string }> }) {
  const user = await requireUser();
  const { err, ok } = await searchParams;
  const rows: [string, React.ReactNode][] = [
    ["Ad Soyad", user.name],
    ["Kullanıcı adı", user.username],
    ["Rol", roleLabel[user.role] ?? user.role],
    ["Ekip", user.teamKey ? teamLabel[user.teamKey] ?? user.teamKey : "—"],
    ["Durum", <Badge key="s" tone={user.isActive ? "success" : "neutral"} dot>{user.isActive ? "Aktif" : "Pasif"}</Badge>],
  ];
  return (
    <Shell user={user}>
      <PageHeader title="Profilim" subtitle="Rol, ekip ve hesap durumu sistem yöneticisi tarafından yönetilir." />
      {err ? <FeedbackAlert title="İşlem yapılamadı" body={err} /> : null}
      {ok ? <FeedbackAlert tone="warning" title="Şifren değiştirildi." /> : null}
      <Card className="px-6 py-5">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-[160px_1fr]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-sand-500">{k}</dt>
              <dd className="font-bold text-sand-900">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card className="flex flex-col gap-4 px-6 py-5">
        <h2 className="text-base font-bold text-sand-900">Şifre değiştir</h2>
        <PasswordForm />
      </Card>
    </Shell>
  );
}
