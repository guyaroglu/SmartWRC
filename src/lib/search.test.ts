import { afterAll, describe, expect, it } from "vitest";
import { ModuleKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createReleaseFromTemplate } from "@/lib/release-service";
import { searchVisible } from "@/lib/search";

const created: string[] = [];
const createdProjects: string[] = [];
const stamp = Date.now();
const projectName = `UISEARCH Project ${stamp}`;
const releaseName = `UISEARCH Release ${stamp}`;

async function userByEmail(email: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { email }, include: { team: true } });
  return {
    id: u.id,
    role: u.role,
    teamId: u.teamId,
    teamKey: u.team?.key ?? null,
    isActive: u.isActive,
  };
}

describe("global search", () => {
  it("returns project, release and control hits for an authorized user", async () => {
    const pm = await userByEmail("pm@smartnet.local");
    const project = await prisma.project.create({
      data: { name: projectName, createdById: pm.id },
    });
    createdProjects.push(project.id);
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.0-pilot" } });
    const release = await createReleaseFromTemplate({
      user: pm,
      projectId: project.id,
      name: releaseName,
      templateVersionId: template.id,
      modules: [ModuleKey.FRONTEND],
    });
    created.push(release.id);

    const projectHits = await searchVisible(pm, projectName);
    expect(projectHits.some((h) => h.kind === "project" && h.title === projectName && h.href === `/projects/${project.id}`)).toBe(true);

    const releaseHits = await searchVisible(pm, releaseName);
    expect(releaseHits.some((h) => h.kind === "release" && h.title === releaseName && h.href === `/releases/${release.id}`)).toBe(true);

    const check = await prisma.releaseCheck.findFirstOrThrow({
      where: { releaseId: release.id, controlCode: "FE-014" },
    });
    const checkHits = await searchVisible(pm, check.title.slice(0, 18));
    expect(checkHits.some((h) => h.kind === "check" && h.id === check.id && h.href === `/checks/${check.id}`)).toBe(true);
  });

  it("filters out inactive users (same visibility as navigation)", async () => {
    const inactive = {
      id: "inactive",
      role: "TEAM_MEMBER" as const,
      teamId: null,
      teamKey: null,
      isActive: false,
    };
    const hits = await searchVisible(inactive, projectName);
    expect(hits).toEqual([]);
  });
});

afterAll(async () => {
  if (created.length) {
    await prisma.release.deleteMany({ where: { id: { in: created } } });
  }
  if (createdProjects.length) {
    await prisma.project.deleteMany({ where: { id: { in: createdProjects } } });
  }
});
