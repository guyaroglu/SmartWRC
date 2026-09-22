-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TEAM_MEMBER', 'SEO_LEAD', 'PROJECT_MANAGER', 'MANAGEMENT', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "TeamKey" AS ENUM ('BACKEND', 'FRONTEND', 'NETWORK', 'CONTENT', 'SEO');

-- CreateEnum
CREATE TYPE "DomainKey" AS ENUM ('SEO', 'GEO', 'PERFORMANCE', 'ANALYTICS', 'INFRASTRUCTURE', 'UX', 'ACCESSIBILITY', 'SECURITY', 'CONTENT_QUALITY');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('SELF', 'CROSS_TEAM', 'SEO_GATED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('P0', 'P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'PASS', 'FAIL', 'BLOCKED', 'NA', 'WAIVED', 'DONE_NEEDS_VERIFICATION', 'REMOVED_FROM_SCOPE');

-- CreateEnum
CREATE TYPE "GateStatus" AS ENUM ('NOT_ASSESSED', 'NO_GO', 'AT_RISK', 'READY');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('NOT_DEPLOYED', 'DEPLOYED', 'POST_LAUNCH_VERIFYING', 'PRODUCTION_VERIFIED');

-- CreateEnum
CREATE TYPE "OnboardingType" AS ENUM ('NEW', 'IN_PROGRESS', 'LIVE_UNVERIFIED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('URL', 'TEXT', 'SCREENSHOT', 'FILE', 'EXTERNAL_TICKET', 'TEST_RESULT');

-- CreateEnum
CREATE TYPE "BlockedByParty" AS ENUM ('BACKEND', 'FRONTEND', 'NETWORK', 'CONTENT', 'SEO', 'CLIENT', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "ResultSource" AS ENUM ('MANUAL', 'AUTOMATION', 'API', 'CRAWLER');

-- CreateEnum
CREATE TYPE "FailReason" AS ENUM ('NOT_IMPLEMENTED', 'WRONG_IMPLEMENTATION', 'MISUNDERSTOOD_REQUIREMENT', 'ENVIRONMENT_ISSUE', 'MISSING_EVIDENCE', 'REGRESSION', 'DEPENDENCY_FAILURE', 'OTHER');

-- CreateEnum
CREATE TYPE "Checkpoint" AS ENUM ('RELEASE_DAY', 'T_PLUS_24H', 'T_PLUS_7D');

-- CreateEnum
CREATE TYPE "ModuleKey" AS ENUM ('BASE', 'BACKEND', 'FRONTEND', 'NETWORK', 'CONTENT', 'SEO', 'GEO', 'ANALYTICS', 'MIGRATION', 'MULTILINGUAL', 'ECOMMERCE', 'POST_LAUNCH');

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "key" "TeamKey" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "teamId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTeamAssignment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProjectTeamAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "immutable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateControl" (
    "id" TEXT NOT NULL,
    "templateVersionId" TEXT NOT NULL,
    "controlCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerTeamKey" "TeamKey" NOT NULL,
    "defaultReviewerRole" "Role",
    "domains" "DomainKey"[],
    "priority" "Priority" NOT NULL,
    "verificationType" "VerificationType" NOT NULL,
    "releaseBlocker" BOOLEAN NOT NULL,
    "evidenceRequired" BOOLEAN NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "howToCheck" TEXT NOT NULL,
    "howToFix" TEXT NOT NULL,
    "escalationRule" TEXT NOT NULL,
    "lifecyclePhase" TEXT NOT NULL,
    "module" "ModuleKey" NOT NULL,
    "checkpoint" "Checkpoint",
    "applicableModules" "ModuleKey"[],

    CONSTRAINT "TemplateControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "onboardingType" "OnboardingType" NOT NULL DEFAULT 'NEW',
    "templateVersionId" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "baselineAt" TIMESTAMP(3),
    "baselineCompleted" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "gateStatus" "GateStatus" NOT NULL DEFAULT 'NOT_ASSESSED',
    "deploymentStatus" "DeploymentStatus" NOT NULL DEFAULT 'NOT_DEPLOYED',
    "deployedAt" TIMESTAMP(3),
    "deployedById" TEXT,
    "deploymentNote" TEXT,
    "deploymentReference" TEXT,
    "emergencyReason" TEXT,
    "emergencyOpenRisks" TEXT,
    "reopenedAt" TIMESTAMP(3),
    "reopenedById" TEXT,
    "reopenReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseScope" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "module" "ModuleKey" NOT NULL,

    CONSTRAINT "ReleaseScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseTeamAssignment" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReleaseTeamAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseCheck" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "controlCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerTeamId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "reviewerUserId" TEXT,
    "domains" "DomainKey"[],
    "priority" "Priority" NOT NULL,
    "verificationType" "VerificationType" NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "releaseBlocker" BOOLEAN NOT NULL,
    "evidenceRequired" BOOLEAN NOT NULL,
    "foundByUserId" TEXT,
    "foundByTeamId" TEXT,
    "blockedBy" "BlockedByParty",
    "blockReason" TEXT,
    "whyItMatters" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "howToCheck" TEXT NOT NULL,
    "howToFix" TEXT NOT NULL,
    "escalationRule" TEXT NOT NULL,
    "lifecyclePhase" TEXT NOT NULL,
    "module" "ModuleKey" NOT NULL,
    "checkpoint" "Checkpoint",
    "resultSource" "ResultSource" NOT NULL DEFAULT 'MANUAL',
    "failReason" "FailReason",
    "failNote" TEXT,
    "waiveReason" TEXT,
    "waiveRisk" TEXT,
    "waivedById" TEXT,
    "waivedAt" TIMESTAMP(3),
    "naReason" TEXT,
    "naById" TEXT,
    "naAt" TIMESTAMP(3),
    "templateControlSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "ReleaseCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "body" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "decision" "CheckStatus" NOT NULL,
    "reason" TEXT,
    "failReason" "FailReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_key_key" ON "Team"("key");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTeamAssignment_projectId_teamId_key" ON "ProjectTeamAssignment"("projectId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateVersion_templateId_version_key" ON "TemplateVersion"("templateId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateControl_templateVersionId_controlCode_key" ON "TemplateControl"("templateVersionId", "controlCode");

-- CreateIndex
CREATE INDEX "Release_projectId_idx" ON "Release"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseScope_releaseId_module_key" ON "ReleaseScope"("releaseId", "module");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseTeamAssignment_releaseId_teamId_key" ON "ReleaseTeamAssignment"("releaseId", "teamId");

-- CreateIndex
CREATE INDEX "ReleaseCheck_releaseId_status_idx" ON "ReleaseCheck"("releaseId", "status");

-- CreateIndex
CREATE INDEX "ReleaseCheck_ownerTeamId_idx" ON "ReleaseCheck"("ownerTeamId");

-- CreateIndex
CREATE INDEX "ReleaseCheck_reviewerUserId_idx" ON "ReleaseCheck"("reviewerUserId");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamAssignment" ADD CONSTRAINT "ProjectTeamAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamAssignment" ADD CONSTRAINT "ProjectTeamAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamAssignment" ADD CONSTRAINT "ProjectTeamAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateControl" ADD CONSTRAINT "TemplateControl_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "TemplateVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "TemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_deployedById_fkey" FOREIGN KEY ("deployedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_reopenedById_fkey" FOREIGN KEY ("reopenedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseScope" ADD CONSTRAINT "ReleaseScope_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTeamAssignment" ADD CONSTRAINT "ReleaseTeamAssignment_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTeamAssignment" ADD CONSTRAINT "ReleaseTeamAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTeamAssignment" ADD CONSTRAINT "ReleaseTeamAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseCheck" ADD CONSTRAINT "ReleaseCheck_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseCheck" ADD CONSTRAINT "ReleaseCheck_ownerTeamId_fkey" FOREIGN KEY ("ownerTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseCheck" ADD CONSTRAINT "ReleaseCheck_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseCheck" ADD CONSTRAINT "ReleaseCheck_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseCheck" ADD CONSTRAINT "ReleaseCheck_foundByUserId_fkey" FOREIGN KEY ("foundByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseCheck" ADD CONSTRAINT "ReleaseCheck_foundByTeamId_fkey" FOREIGN KEY ("foundByTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "ReleaseCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "ReleaseCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

