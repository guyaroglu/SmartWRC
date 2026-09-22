import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/authz";

export async function requireUser(): Promise<AuthUser & { name: string; email: string }> {
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
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
    teamKey: user.team?.key ?? null,
    isActive: user.isActive,
  };
}
