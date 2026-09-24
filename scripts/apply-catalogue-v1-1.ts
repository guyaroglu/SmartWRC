// Adds catalogue v1.1 to an existing database without touching users, releases or older
// template versions. Idempotent and create-only. Usage: npx tsx scripts/apply-catalogue-v1-1.ts
import { PrismaClient } from "@prisma/client";
import { ensureCatalogueV11 } from "../prisma/catalogue";

const prisma = new PrismaClient();
ensureCatalogueV11(prisma)
  .then((r) => console.log(r.created ? `Catalogue v1.1 created (${r.controls} controls).` : `Catalogue v1.1 already present (${r.controls} controls); nothing changed.`))
  .finally(() => prisma.$disconnect());
