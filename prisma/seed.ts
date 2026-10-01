import { PrismaClient, Role, TeamKey, VerificationType } from "@prisma/client";
import { hash } from "bcryptjs";
import { controlText, SEED_CONTROLS } from "./controls";
import { ensureCatalogueV11 } from "./catalogue";

const prisma = new PrismaClient();

const PASSWORD = "Pilot2026!";

async function main() {
  const passwordHash = await hash(PASSWORD, 10);

  const teamDefs: { key: TeamKey; name: string }[] = [
    { key: TeamKey.BACKEND, name: "Backend" },
    { key: TeamKey.FRONTEND, name: "Frontend" },
    { key: TeamKey.NETWORK, name: "Network" },
    { key: TeamKey.CONTENT, name: "Content" },
    { key: TeamKey.SEO, name: "SEO" },
  ];

  const teams = new Map<TeamKey, { id: string }>();
  for (const def of teamDefs) {
    const team = await prisma.team.upsert({
      where: { key: def.key },
      update: { name: def.name },
      create: def,
    });
    teams.set(def.key, team);
  }

  const users = [
    { email: "frontend@smartnet.local", name: "Frontend User", role: Role.TEAM_MEMBER, team: TeamKey.FRONTEND },
    { email: "backend@smartnet.local", name: "Backend User", role: Role.TEAM_MEMBER, team: TeamKey.BACKEND },
    { email: "network@smartnet.local", name: "Network User", role: Role.TEAM_MEMBER, team: TeamKey.NETWORK },
    { email: "content@smartnet.local", name: "Content User", role: Role.TEAM_MEMBER, team: TeamKey.CONTENT },
    { email: "seo@smartnet.local", name: "Gökhan (SEO Lead)", role: Role.SEO_LEAD, team: TeamKey.SEO },
    { email: "pm@smartnet.local", name: "Project Manager", role: Role.PROJECT_MANAGER, team: null },
    { email: "management@smartnet.local", name: "Management", role: Role.MANAGEMENT, team: null },
    { email: "admin@smartnet.local", name: "System Admin", role: Role.SYSTEM_ADMIN, team: null },
  ];

  const createdUsers = new Map<string, { id: string }>();
  for (const u of users) {
    const row = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        teamId: u.team ? teams.get(u.team)!.id : null,
        passwordHash,
        isActive: true,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        teamId: u.team ? teams.get(u.team)!.id : null,
        passwordHash,
        isActive: true,
      },
    });
    createdUsers.set(u.email, row);
  }

  const project = await prisma.project.upsert({
    where: { id: "seed-audi-turkiye" },
    update: { name: "Audi Türkiye" }, // never un-archive DEV demo data on re-seed
    create: {
      id: "seed-audi-turkiye",
      name: "Audi Türkiye",
      createdById: createdUsers.get("pm@smartnet.local")!.id,
    },
  });

  const assignments: { team: TeamKey; email: string }[] = [
    { team: TeamKey.BACKEND, email: "backend@smartnet.local" },
    { team: TeamKey.FRONTEND, email: "frontend@smartnet.local" },
    { team: TeamKey.NETWORK, email: "network@smartnet.local" },
    { team: TeamKey.CONTENT, email: "content@smartnet.local" },
    { team: TeamKey.SEO, email: "seo@smartnet.local" },
  ];

  for (const a of assignments) {
    await prisma.projectTeamAssignment.upsert({
      where: { projectId_teamId: { projectId: project.id, teamId: teams.get(a.team)!.id } },
      update: { userId: createdUsers.get(a.email)!.id },
      create: {
        projectId: project.id,
        teamId: teams.get(a.team)!.id,
        userId: createdUsers.get(a.email)!.id,
      },
    });
  }

  const template = await prisma.template.upsert({
    where: { name: "Corporate Website" },
    update: {},
    create: { name: "Corporate Website" },
  });

  const version = await prisma.templateVersion.upsert({
    where: { templateId_version: { templateId: template.id, version: "1.0" } },
    update: {},
    create: { templateId: template.id, version: "1.0", immutable: true },
  });

  for (const control of SEED_CONTROLS) {
    const text = controlText(control.code, control.title);
    await prisma.templateControl.upsert({
      where: { templateVersionId_controlCode: { templateVersionId: version.id, controlCode: control.code } },
      update: {
        title: control.title,
        ownerTeamKey: control.owner,
        domains: control.domains,
        priority: control.priority,
        verificationType: control.verification,
        releaseBlocker: control.blocker ?? control.priority === "P0",
        evidenceRequired: control.evidence,
        module: control.module,
        checkpoint: control.checkpoint,
        applicableModules: [control.module],
        defaultReviewerRole: control.verification === VerificationType.SELF ? null : Role.SEO_LEAD,
        ...text,
      },
      create: {
        templateVersionId: version.id,
        controlCode: control.code,
        title: control.title,
        ownerTeamKey: control.owner,
        domains: control.domains,
        priority: control.priority,
        verificationType: control.verification,
        releaseBlocker: control.blocker ?? control.priority === "P0",
        evidenceRequired: control.evidence,
        module: control.module,
        checkpoint: control.checkpoint,
        applicableModules: [control.module],
        defaultReviewerRole: control.verification === VerificationType.SELF ? null : Role.SEO_LEAD,
        ...text,
      },
    });
  }

  const pilot = await prisma.templateVersion.upsert({
    where: { templateId_version: { templateId: template.id, version: "1.0-pilot" } },
    update: {},
    create: { templateId: template.id, version: "1.0-pilot", immutable: true },
  });
  const pilotCodes = new Set(["FE-014", "NET-015"]);
  for (const control of SEED_CONTROLS.filter((c) => pilotCodes.has(c.code))) {
    const text = controlText(control.code, control.title);
    await prisma.templateControl.upsert({
      where: { templateVersionId_controlCode: { templateVersionId: pilot.id, controlCode: control.code } },
      update: { title: control.title },
      create: {
        templateVersionId: pilot.id,
        controlCode: control.code,
        title: control.title,
        ownerTeamKey: control.owner,
        domains: control.domains,
        priority: control.priority,
        verificationType: control.verification,
        releaseBlocker: true,
        evidenceRequired: control.evidence,
        module: control.module,
        applicableModules: [control.module],
        defaultReviewerRole: Role.SEO_LEAD,
        ...text,
      },
    });
  }

  await ensureCatalogueV11(prisma);

  console.log("Seed complete. Demo password:", PASSWORD);
  console.log("Users:", users.map((u) => u.email).join(", "));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
