import { PrismaClient } from "@prisma/client";

const base = process.env.AUTH_URL ?? "http://localhost:3002";
const prisma = new PrismaClient();

async function login(email: string, password: string) {
  const csrfRes = await fetch(`${base}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie?.() ?? [];
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${base}/dashboard`,
    json: "true",
  });
  const res = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      cookie: csrfCookies.map((c) => c.split(";")[0]).join("; "),
    },
    body,
    redirect: "manual",
  });
  const set = [...csrfCookies, ...(res.headers.getSetCookie?.() ?? [])];
  const cookie = set.map((c) => c.split(";")[0]).join("; ");
  if (!/session-token|authjs\.session/i.test(cookie)) {
    throw new Error(`Login failed for ${email}: ${res.status} cookies=${cookie}`);
  }
  return cookie;
}

async function page(cookie: string, path: string, mustInclude: string[]) {
  const res = await fetch(`${base}${path}`, { headers: { cookie }, redirect: "manual" });
  const html = await res.text();
  if (res.status >= 400) throw new Error(`${path} status ${res.status}`);
  for (const s of mustInclude) {
    if (!html.includes(s)) throw new Error(`${path} missing "${s}"`);
  }
  return html;
}

async function main() {
  const password = "Pilot2026!";
  const fe = await login("frontend@smartnet.local", password);
  await page(fe, "/dashboard", ["My Checks", "Frontend User"]);
  await page(fe, "/my-checks", ["My Checks", "kendi ekibinizin"]);

  const seo = await login("seo@smartnet.local", password);
  await page(seo, "/reviews", ["Reviews", "Doğrulama kuyruğu"]);

  const mgmt = await login("management@smartnet.local", password);
  const mgmtHtml = await page(mgmt, "/management", ["Management", "Read-only", "Gate"]);
  if (mgmtHtml.includes("name=\"checkId\"")) throw new Error("Management saw mutation forms");

  const pm = await login("pm@smartnet.local", password);
  await page(pm, "/projects/seed-audi-turkiye", ["Audi Türkiye", "Yeni release"]);

  const release = await prisma.release.findFirst({
    where: { projectId: "seed-audi-turkiye" },
    orderBy: { createdAt: "desc" },
    include: { checks: true },
  });
  if (!release) throw new Error("No release to inspect");
  await page(pm, `/releases/${release.id}`, ["READY", "Checks", "Activity"]);

  console.log("Authenticated page verification passed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
