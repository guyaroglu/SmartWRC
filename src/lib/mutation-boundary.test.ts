import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DeploymentStatus, GateStatus, ModuleKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createReleaseFromTemplate, markDeployed } from "@/lib/release-service";

const ROOT = process.cwd();

function source(rel: string) {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("public mutation boundary for gate and deployment", () => {
  it("server actions never accept gateStatus or deploymentStatus from FormData", () => {
    const src = source("src/app/actions.ts");
    expect(src).not.toMatch(/formData\.get\(\s*["']gateStatus["']\s*\)/);
    expect(src).not.toMatch(/formData\.get\(\s*["']deploymentStatus["']\s*\)/);
    expect(src).not.toMatch(/\bgateStatus\b/);
    expect(src).not.toMatch(/\bdeploymentStatus\b/);
  });

  it("release-service writes gateStatus only via the Gate Engine", () => {
    const src = source("src/lib/release-service.ts");
    const engineFn = src.match(/async function recalcGate[\s\S]*?(?=\nexport async function |\nexport \{ recalcGate \})/);
    expect(engineFn?.[0]).toMatch(/calculateGate\(/);
    expect(engineFn?.[0]).toMatch(/data:\s*\{\s*gateStatus:\s*next\s*\}/);

    const exported = [...src.matchAll(/export async function (\w+)/g)].map((m) => m[1]);
    for (const name of exported) {
      const body = src.split(`export async function ${name}`)[1]?.split(/export async function /)[0] ?? "";
      if (/\bgateStatus\s*:/.test(body)) {
        throw new Error(`${name} writes gateStatus; only recalcGate may persist derived gate state`);
      }
    }
  });

  it("release-service writes deploymentStatus only via dedicated lifecycle operations", () => {
    const allowed = new Set([
      "reopenRelease",
      "markDeployed",
      "startPostLaunch",
      "markProductionVerified",
      "emergencyDeploy",
    ]);
    const src = source("src/lib/release-service.ts");
    const exported = [...src.matchAll(/export async function (\w+)/g)].map((m) => m[1]);
    for (const name of exported) {
      const body = src.split(`export async function ${name}`)[1]?.split(/export async function /)[0] ?? "";
      if (/\bdeploymentStatus\s*:/.test(body) && !allowed.has(name)) {
        throw new Error(`${name} writes deploymentStatus but is not a dedicated lifecycle operation`);
      }
    }
    for (const name of allowed) {
      expect(exported).toContain(name);
    }
  });

  it("injected READY/DEPLOYED on create is ignored; check work cannot mark deployed while NO_GO", async () => {
    const pm = await prisma.user.findUniqueOrThrow({
      where: { email: "pm@smartnet.local" },
      include: { team: true },
    });
    const project = await prisma.project.findFirstOrThrow({ where: { name: "Audi Türkiye" } });
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0-pilot" } });
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
      name: `Boundary ${Date.now()}`,
      templateVersionId: template.id,
      modules: [ModuleKey.FRONTEND, ModuleKey.NETWORK],
      ...({
        gateStatus: GateStatus.READY,
        deploymentStatus: DeploymentStatus.PRODUCTION_VERIFIED,
      } as object),
    });
    expect(release.gateStatus).toBe(GateStatus.NO_GO);
    expect(release.deploymentStatus).toBe(DeploymentStatus.NOT_DEPLOYED);
    await expect(markDeployed(user, release.id)).rejects.toThrow();
    const after = await prisma.release.findUniqueOrThrow({ where: { id: release.id } });
    expect(after.gateStatus).toBe(GateStatus.NO_GO);
    expect(after.deploymentStatus).toBe(DeploymentStatus.NOT_DEPLOYED);
    await prisma.release.delete({ where: { id: release.id } });
  }, 20000);
});
