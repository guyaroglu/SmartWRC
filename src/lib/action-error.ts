import { redirect } from "next/navigation";
import { userFacingError } from "@/lib/tr-messages";

function isNextRedirect(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("digest" in err)) return false;
  return String((err as { digest?: unknown }).digest).includes("NEXT_REDIRECT");
}

export function redirectOnFailure(href: string, err: unknown): never {
  if (isNextRedirect(err)) throw err;
  const message = err instanceof Error ? userFacingError(err.message) : "İşlem reddedildi.";
  const sep = href.includes("?") ? "&" : "?";
  redirect(`${href}${sep}err=${encodeURIComponent(message)}`);
}
