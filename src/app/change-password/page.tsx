import { redirect } from "next/navigation";
import { FeedbackAlert } from "@/components/ui";
import { PasswordForm } from "@/components/password-form";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

// Temporary password (new account or admin reset): the user sets their own before anything else.
export default async function ChangePasswordPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const user = await requireUser({ allowPasswordChange: true });
  const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { mustChangePassword: true } });
  if (!row.mustChangePassword) redirect("/profile");
  const { err } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-card border border-sand-200 bg-white p-8 shadow-raised">
        <h1 className="text-page font-bold text-sand-900">Yeni şifre belirle</h1>
        <p className="text-sm text-sand-800">
          {user.name} ({user.username}), hesabın geçici bir şifreyle açıldı. Devam etmeden önce kendi şifreni belirle; ardından yeni şifrenle tekrar giriş yaparsın.
        </p>
        {err ? <FeedbackAlert title="İşlem yapılamadı" body={err} /> : null}
        <PasswordForm forced />
      </div>
    </div>
  );
}
