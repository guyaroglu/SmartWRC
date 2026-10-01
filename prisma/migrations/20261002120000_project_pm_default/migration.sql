-- Additive: optional default PM per project (project team settings). Existing rows stay NULL.
ALTER TABLE "Project" ADD COLUMN "pmUserId" TEXT;
ALTER TABLE "Project" ADD CONSTRAINT "Project_pmUserId_fkey" FOREIGN KEY ("pmUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
