import { type PrismaClient } from "@prisma/client";
import { CATALOGUE_V1_1_OVERRIDES, catalogueDefaultReviewerRole, controlText, SEED_CONTROLS } from "./controls";

/**
 * Create “Corporate Website” v1.1 once. Create-only: an existing version is never
 * modified (template versions are immutable; existing releases keep their snapshots).
 */
export async function ensureCatalogueV11(prisma: PrismaClient) {
  const template = await prisma.template.findUniqueOrThrow({ where: { name: "Corporate Website" } });
  const existing = await prisma.templateVersion.findUnique({
    where: { templateId_version: { templateId: template.id, version: "1.1" } },
    include: { _count: { select: { controls: true } } },
  });
  if (existing) return { created: false, versionId: existing.id, controls: existing._count.controls };

  const version = await prisma.templateVersion.create({
    data: {
      templateId: template.id,
      version: "1.1",
      immutable: true,
      controls: {
        create: SEED_CONTROLS.map((control) => {
          const override = CATALOGUE_V1_1_OVERRIDES[control.code] ?? {};
          return {
            controlCode: control.code,
            title: control.title,
            ownerTeamKey: override.owner ?? control.owner,
            domains: control.domains,
            priority: control.priority,
            verificationType: control.verification,
            releaseBlocker: control.blocker ?? control.priority === "P0",
            evidenceRequired: control.evidence,
            module: control.module,
            checkpoint: control.checkpoint,
            applicableModules: [control.module],
            defaultReviewerRole:
              override.defaultReviewerRole !== undefined ? override.defaultReviewerRole : catalogueDefaultReviewerRole(control.verification),
            ...controlText(control.code, control.title),
          };
        }),
      },
    },
    include: { _count: { select: { controls: true } } },
  });
  return { created: true, versionId: version.id, controls: version._count.controls };
}
