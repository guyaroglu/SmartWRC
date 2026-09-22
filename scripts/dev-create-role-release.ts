import { ModuleKey } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { createReleaseFromTemplate } from "../src/lib/release-service";

const p = new PrismaClient();

async function main() {
  const pm = await p.user.findUniqueOrThrow({
    where: { email: "pm@smartnet.local" },
    include: { team: true },
  });
  const project = await p.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
  const template = await p.templateVersion.findFirstOrThrow({ where: { version: "1.0" } });
  const user = {
    id: pm.id,
    role: pm.role,
    teamId: pm.teamId,
    teamKey: pm.team?.key ?? null,
    isActive: true as const,
  };
  const release = await createReleaseFromTemplate({
    user,
    projectId: project.id,
    name: "DEV browser verification — Backend/Content",
    templateVersionId: template.id,
    modules: [ModuleKey.BACKEND, ModuleKey.CONTENT],
  });
  const checks = await p.releaseCheck.findMany({
    where: { releaseId: release.id },
    include: { ownerTeam: true },
    orderBy: { controlCode: "asc" },
  });
  console.log(
    JSON.stringify(
      {
        releaseId: release.id,
        name: release.name,
        checks: checks.map((c) => ({
          id: c.id,
          code: c.controlCode,
          owner: c.ownerTeam.key,
          verification: c.verificationType,
          title: c.title,
        })),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
