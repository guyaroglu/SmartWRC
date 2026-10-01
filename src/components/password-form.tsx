import { changeOwnPasswordAction } from "@/app/actions";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/account-service";

// Own password change: current password is always required; the new one twice.
export function PasswordForm({ forced = false }: { forced?: boolean }) {
  return (
    <form action={changeOwnPasswordAction} className="flex max-w-md flex-col gap-4">
      {forced ? <input type="hidden" name="forced" value="1" /> : null}
      <Field label={forced ? "Geçici şifre" : "Mevcut şifre"}>
        <TextInput name="current" type="password" required autoComplete="current-password" />
      </Field>
      <Field label={`Yeni şifre (en az ${MIN_PASSWORD_LENGTH} karakter)`}>
        <TextInput name="next" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
      </Field>
      <Field label="Yeni şifre (tekrar)">
        <TextInput name="confirm" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
      </Field>
      <PrimaryButton className="self-start">Şifreyi Değiştir</PrimaryButton>
    </form>
  );
}
