import { loginAction } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">SmartNet WRC</h1>
      <p className="mt-1 text-sm text-ink/70">İç release kalite kapısı. Public kayıt yoktur.</p>
      <form action={loginAction} className="mt-6 space-y-3 rounded border border-ink/10 bg-white p-4">
        <label className="block text-sm">
          E-posta
          <input className="mt-1 w-full rounded border px-3 py-2" name="email" type="email" required />
        </label>
        <label className="block text-sm">
          Şifre
          <input className="mt-1 w-full rounded border px-3 py-2" name="password" type="password" required />
        </label>
        {error ? <p className="text-sm text-danger">Giriş başarısız.</p> : null}
        <button className="w-full rounded bg-accent px-3 py-2 text-white" type="submit">
          Giriş
        </button>
      </form>
    </div>
  );
}
