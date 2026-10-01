import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/authz";

export type CurrentUser = AuthUser & { name: string; username: string; email: string | null };

/** Signed-in, active user. Accounts with a temporary password are sent to /change-password first. */
export async function requireUser(options: { allowPasswordChange?: boolean } = {}): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { team: true },
  });
  if (!user || !user.isActive) {
    throw new Error("Authentication required");
  }
  if (user.mustChangePassword && !options.allowPasswordChange) redirect("/change-password");
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
    teamKey: user.team?.key ?? null,
    isActive: user.isActive,
  };
}
