import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyLogin } from "@/lib/account-service";
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
        identifier: { label: "Kullanıcı adı veya e-posta", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await verifyLogin(String(credentials?.identifier ?? ""), String(credentials?.password ?? ""));
        if (!user) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
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
