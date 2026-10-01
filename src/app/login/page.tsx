import { loginAction } from "@/app/actions";
import { Field, PrimaryButton, TextInput } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; changed?: string }>;
}) {
  const { error, changed } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4">
      <div className="w-full max-w-md rounded-card border border-sand-200 bg-white p-8 shadow-raised">
        <div className="flex items-center gap-[9px]">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-500 text-[13px] font-extrabold leading-none text-white">
            S
          </span>
          <span className="text-[15px] font-extrabold tracking-tight text-sand-900" style={{ lineHeight: 1.15 }}>
            SmartNet WRC
          </span>
        </div>
        <h1 className="mt-6 text-page font-bold text-sand-900">Giriş</h1>
        <p className="mt-1.5 text-sm text-sand-800">SmartNet iç yayın kontrol sistemi. Hesaplar sistem yöneticisi tarafından açılır.</p>
        <form action={loginAction} className="mt-6 flex flex-col gap-4">
          <Field label="Kullanıcı adı veya e-posta">
            <TextInput name="identifier" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false} />
          </Field>
          <Field label="Şifre">
            <TextInput name="password" type="password" required autoComplete="current-password" />
          </Field>
          {changed ? <p className="text-sm font-semibold text-olive-700">Şifren değiştirildi. Yeni şifrenle giriş yap.</p> : null}
          {error ? <p className="text-sm font-semibold text-rust-700">Giriş başarısız.</p> : null}
          <PrimaryButton className="w-full">Giriş</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
