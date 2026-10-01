import { describe, expect, it } from "vitest";
import { CheckStatus, ModuleKey, Priority, VerificationType } from "@prisma/client";
import { teamSummaries, type CheckForView } from "@/lib/release-view";
import { evidenceCountLabel } from "@/lib/evidence-view";
import { readFileSync } from "node:fs";

const release = { onboardingType: "LIVE_UNVERIFIED" as const, baselineCompleted: true, deploymentStatus: "NOT_DEPLOYED" as const };
let n = 0;
function check(team: string, status: CheckStatus, priority: Priority = Priority.P1, module: ModuleKey = ModuleKey.BASE): CheckForView {
  n += 1;
  return {
    id: `c${n}`,
    title: "t",
    status,
    priority,
    releaseBlocker: priority === Priority.P0,
    module,
    domains: [],
    ownerTeamId: team,
    verificationType: VerificationType.SEO_GATED,
    ownerTeam: { key: team, name: team },
  };
}

describe("team readiness: workload (open) and risk (critical) from the same canonical rules", () => {
  it("5 open / 0 critical → Devam Ediyor; open P0 → Problem Var; nothing open → Hazır", () => {
    const rows = teamSummaries(release, [
      ...Array.from({ length: 5 }, () => check("BACKEND", CheckStatus.NOT_STARTED)),
      check("FRONTEND", CheckStatus.IN_PROGRESS, Priority.P0),
      check("FRONTEND", CheckStatus.REVIEW),
      check("CONTENT", CheckStatus.PASS),
      check("CONTENT", CheckStatus.WAIVED, Priority.P0),
      check("CONTENT", CheckStatus.NA),
      check("CONTENT", CheckStatus.REMOVED_FROM_SCOPE),
    ]);
    const by = Object.fromEntries(rows.map((r) => [r.key, r]));
    expect(by.BACKEND).toMatchObject({ open: 5, openP0: 0, status: "Devam Ediyor" });
    expect(by.FRONTEND).toMatchObject({ open: 2, openP0: 1, status: "Problem Var" });
    expect(by.CONTENT).toMatchObject({ open: 0, openP0: 0, status: "Hazır" }); // terminal work is not open
  });

  it("post-launch work before deployment is not counted", () => {
    const rows = teamSummaries(release, [check("NETWORK", CheckStatus.NOT_STARTED, Priority.P0, ModuleKey.POST_LAUNCH)]);
    expect(rows[0]).toMatchObject({ open: 0, openP0: 0, status: "Hazır" });
  });
});

describe("evidence wording and Şölen source manifest", () => {
  it("evidence header counts “kanıt”", () => {
    expect(evidenceCountLabel(1)).toBe("1 kanıt");
  });

  it("the backfill manifest covers every Şölen task ADH-001…ADH-028 exactly once", () => {
    const md = readFileSync("docs/SOLEN_EVIDENCE_BACKFILL.md", "utf8");
    const ids = [...md.matchAll(/^\| (ADH-\d{3}) \|/gm)].map((m) => m[1]);
    expect(ids).toEqual(Array.from({ length: 28 }, (_, i) => `ADH-${String(i + 1).padStart(3, "0")}`));
    // Every task carries one of the agreed verification states; only verified/partial sources are attached.
    const rows = [...md.matchAll(/^\| (ADH-\d{3}) \|.*\| (VERIFIED|PARTIAL|MANUAL REVIEW REQUIRED|NO DIRECT SOURCE REQUIRED|SOURCE NOT FOUND) \| ([^|]+) \|/gm)];
    expect(rows).toHaveLength(28);
    for (const [, , verification, backfill] of rows) {
      if (backfill.startsWith("ATTACHED")) expect(["VERIFIED", "PARTIAL"]).toContain(verification);
    }
  });
});
