import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const ids = ["cmub60wbb000dlvdw5mzxkam3", "cmub60wbj000flvdw044dnhyq"];
  const checks = await p.releaseCheck.findMany({
    where: { id: { in: ids } },
    include: {
      ownerTeam: true,
      evidence: true,
      release: true,
    },
  });
  for (const c of checks) {
    console.log(
      JSON.stringify(
        {
          code: c.controlCode,
          status: c.status,
          owner: c.ownerTeam.name,
          evidence: c.evidence.length,
          gate: c.release.gateStatus,
          deploy: c.release.deploymentStatus,
        },
        null,
        2,
      ),
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
