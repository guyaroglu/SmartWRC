-- Additive: uploaded evidence files (bytes in their own table; metadata on Evidence). Existing rows unchanged.
ALTER TABLE "Evidence" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "Evidence" ADD COLUMN "mimeType" TEXT;

CREATE TABLE "EvidenceFile" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "EvidenceFile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EvidenceFile_evidenceId_key" ON "EvidenceFile"("evidenceId");

ALTER TABLE "EvidenceFile" ADD CONSTRAINT "EvidenceFile_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
