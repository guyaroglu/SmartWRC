import { PrismaClient } from "@prisma/client";
import { markProductionVerified, passCheck } from "../src/lib/release-service";

const p = new PrismaClient();

async function asUser(email: string) {
  const u = await p.user.findUniqueOrThrow({ where: { email }, include: { team: true } });
  return {
    id: u.id,
    role: u.role,
    teamId: u.teamId,
    teamKey: u.team?.key ?? null,
    isActive: true as const,
    email: u.email,
  };
}

async function main() {
  const seo = await asUser("seo@smartnet.local");
  const pm = await asUser("pm@smartnet.local");
  const fe014 = "cmub60wbb000dlvdw5mzxkam3";
  const releaseId = "cmub60way0001lvdw88io7r8a";

  const before = await p.releaseCheck.findUniqueOrThrow({
    where: { id: fe014 },
    include: { release: true },
  });
  console.log("before", { status: before.status, gate: before.release.gateStatus, deploy: before.release.deploymentStatus });

  await passCheck(seo, fe014);
  const mid = await p.release.findUniqueOrThrow({ where: { id: releaseId } });
  console.log("afterPass", { gate: mid.gateStatus, deploy: mid.deploymentStatus });

  await markProductionVerified(pm, releaseId);
  const after = await p.release.findUniqueOrThrow({ where: { id: releaseId } });
  const check = await p.releaseCheck.findUniqueOrThrow({ where: { id: fe014 } });
  const reopen = await p.auditEvent.findFirst({
    where: { entityId: releaseId, action: "RELEASE_REOPENED" },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(
    JSON.stringify(
      {
        fe014: check.status,
        gate: after.gateStatus,
        deploy: after.deploymentStatus,
        reopen: reopen
          ? { action: reopen.action, actor: reopen.actor?.email, reason: reopen.reason, at: reopen.createdAt }
          : null,
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
