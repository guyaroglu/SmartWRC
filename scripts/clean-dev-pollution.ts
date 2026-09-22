import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { SEED_CONTROLS } from "../prisma/controls";

try {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^"(.*)"$/, "$1");
    }
  }
} catch {
  /* env file optional if DATABASE_URL already set */
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}
if (/test/i.test(url)) {
  throw new Error("Refusing to run DEV cleanup against a test database URL");
}

const prisma = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const golden = await prisma.release.findMany({
    where: { OR: [{ name: { startsWith: "Golden " } }, { name: { startsWith: "Golden lifecycle " } }] },
    select: { id: true, name: true },
  });
  if (golden.length) {
    await prisma.release.deleteMany({ where: { id: { in: golden.map((r) => r.id) } } });
  }
  const canonical = SEED_CONTROLS.find((c) => c.code === "FE-014");
  if (!canonical) throw new Error("FE-014 missing from seed controls");
  await prisma.templateControl.updateMany({
    where: { controlCode: "FE-014" },
    data: { title: canonical.title },
  });
  console.log(`Removed ${golden.length} generated Golden/test releases and restored FE-014.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
