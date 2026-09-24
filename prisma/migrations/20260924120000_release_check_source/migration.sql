-- Additive: distinguish template-generated checks from newly discovered (ad-hoc) issues.
-- Existing rows default to TEMPLATE; no data is rewritten.
CREATE TYPE "CheckSource" AS ENUM ('TEMPLATE', 'AD_HOC');

ALTER TABLE "ReleaseCheck" ADD COLUMN "source" "CheckSource" NOT NULL DEFAULT 'TEMPLATE';
