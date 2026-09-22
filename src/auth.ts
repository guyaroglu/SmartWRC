import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role, TeamKey } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      teamId: string | null;
      teamKey: TeamKey | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { team: true },
        });
        if (!user || !user.isActive) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teamId: user.teamId,
          teamKey: user.team?.key ?? null,
        };
      },
    }),
  ],
  callbacks: {
    authorized: () => true,
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id: string;
          role: Role;
          teamId: string | null;
          teamKey: TeamKey | null;
        };
        token.id = u.id;
        token.role = u.role;
        token.teamId = u.teamId;
        token.teamKey = u.teamKey;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.id);
      session.user.role = token.role as Role;
      session.user.teamId = (token.teamId as string | null) ?? null;
      session.user.teamKey = (token.teamKey as TeamKey | null) ?? null;
      return session;
    },
  },
});
