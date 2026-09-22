import { PrismaClient } from "@prisma/client";
import { startCheck, addEvidence, reopenCheck } from "../src/lib/release-service";

const p = new PrismaClient();

async function main() {
  const fe = await p.user.findUniqueOrThrow({
    where: { email: "frontend@smartnet.local" },
    include: { team: true },
  });
  const user = {
    id: fe.id,
    role: fe.role,
    teamId: fe.teamId,
    teamKey: fe.team?.key ?? null,
    isActive: true as const,
  };
  const checkId = "cmub60wbb000dlvdw5mzxkam3";
  const before = await p.releaseCheck.findUniqueOrThrow({
    where: { id: checkId },
    include: { release: true, evidence: true },
  });
  console.log(
    JSON.stringify(
      {
        status: before.status,
        deploy: before.release.deploymentStatus,
        evidence: before.evidence.length,
      },
      null,
      2,
    ),
  );
  for (const label of ["startCheck", "addEvidence", "reopenCheck"] as const) {
    try {
      if (label === "startCheck") await startCheck(user, checkId);
      if (label === "addEvidence") {
        await addEvidence(user, checkId, { type: "TEXT", body: "lock probe should fail" });
      }
      if (label === "reopenCheck") await reopenCheck(user, checkId, "lock probe");
      console.log(JSON.stringify({ [label]: "UNEXPECTED_SUCCESS" }));
    } catch (e) {
      console.log(JSON.stringify({ [label]: String(e instanceof Error ? e.message : e) }));
    }
  }
  const after = await p.releaseCheck.findUniqueOrThrow({
    where: { id: checkId },
    include: { evidence: true },
  });
  console.log(
    JSON.stringify(
      { statusAfter: after.status, evidenceAfter: after.evidence.length, unchanged: after.status === before.status && after.evidence.length === before.evidence.length },
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
