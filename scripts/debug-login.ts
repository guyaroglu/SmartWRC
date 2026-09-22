import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = "http://localhost:3002";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "frontend@smartnet.local" } });
  console.log("user", !!user, user?.role, user?.isActive);
  console.log("password ok", user ? await compare("Pilot2026!", user.passwordHash) : false);

  const csrfRes = await fetch(`${base}/api/auth/csrf`);
  const rawCookies = csrfRes.headers.getSetCookie();
  console.log("csrf cookies", rawCookies);
  const json = await csrfRes.json();
  console.log("csrf json", json);

  const cookie = rawCookies.map((c) => c.split(";")[0]).join("; ");
  const res = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      cookie,
    },
    body: new URLSearchParams({
      csrfToken: json.csrfToken,
      email: "frontend@smartnet.local",
      password: "Pilot2026!",
      redirect: "false",
    }),
    redirect: "manual",
  });
  console.log("status", res.status);
  console.log("location", res.headers.get("location"));
  console.log("set-cookie", res.headers.getSetCookie());
  console.log("body", await res.text());
}

main().finally(() => prisma.$disconnect());
