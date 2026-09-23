import { loginAction } from "@/app/actions";
import { Field, PrimaryButton, TextInput } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4">
      <div className="w-full max-w-md rounded-card border border-sand-200 bg-white p-8 shadow-raised">
        <div className="text-[13px] font-extrabold tracking-tight text-sand-900">SmartNet</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-clay-600">WRC</div>
        <h1 className="mt-4 text-[26px] font-bold tracking-tight text-sand-900">Giriş</h1>
        <p className="mt-1 text-sm text-sand-600">İç release kalite kapısı. Public kayıt yoktur.</p>
        <form action={loginAction} className="mt-6 space-y-4">
          <Field label="E-posta">
            <TextInput name="email" type="email" required autoComplete="username" />
          </Field>
          <Field label="Şifre">
            <TextInput name="password" type="password" required autoComplete="current-password" />
          </Field>
          {error ? <p className="text-sm font-semibold text-rust-700">Giriş başarısız.</p> : null}
          <PrimaryButton className="w-full">Giriş</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
