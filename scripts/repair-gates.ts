import { prisma } from "../src/lib/prisma";
import { repairAllGates } from "../src/lib/release-service";

async function main() {
  await repairAllGates();
  const rows = await prisma.release.findMany({
    select: { name: true, gateStatus: true, deploymentStatus: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
