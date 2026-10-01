-- Additive: username login identifier, forced password change flag, email becomes optional.
-- Existing accounts keep working: each gets a unique username from its email local part
-- (lowercased, unsafe characters removed; a numeric suffix only on collision). No row is removed.
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

WITH base AS (
  SELECT id,
         COALESCE(NULLIF(lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9._-]', '', 'g')), ''), 'user') AS b,
         "createdAt"
  FROM "User"
), ranked AS (
  SELECT id, b, row_number() OVER (PARTITION BY b ORDER BY "createdAt", id) AS rn FROM base
)
UPDATE "User" u
SET username = CASE WHEN r.rn = 1 THEN r.b ELSE r.b || r.rn::text END
FROM ranked r
WHERE r.id = u.id;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
