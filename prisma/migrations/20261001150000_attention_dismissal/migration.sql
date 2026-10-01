-- Additive: per-user cleared state for derived attention items. No existing table is changed.
CREATE TABLE "AttentionDismissal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttentionDismissal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AttentionDismissal_userId_itemKey_key" ON "AttentionDismissal"("userId", "itemKey");

ALTER TABLE "AttentionDismissal" ADD CONSTRAINT "AttentionDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
