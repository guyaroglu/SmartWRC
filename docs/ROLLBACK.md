# Known-good rollback (local V0)

This is the reversible local recovery path. It is not a production runbook and does not replace SmartNet-hosted backup policy.

## What is known-good

- Application: last git commit that passed `npm run typecheck`, `npm test` on `wrc_test`, and a clean `next start` `/health`.
- Database: a `pg_dump` of the intended database, taken before a risky migrate/deploy.

## Databases

| Name | Role |
|---|---|
| `wrc` | Local DEV. Do not restore over this to “make tests pass”. |
| `wrc_test` | Automated tests. Safe dump source for the restore drill. |
| `wrc_restore_probe` | Throwaway restore target. Created and dropped by the drill. |

## Isolated restore drill (required before claiming restore works)

```text
npm run db:restore-drill
```

The script dumps `wrc_test`, restores into `wrc_restore_probe`, checks user counts, then drops the probe. It refuses if the dump source is `wrc` or any name that is not a test database.

`BACKUP EXISTS` is not `RESTORE VERIFIED`. A dump file on disk is not evidence.

## If a bad local app deploy happens

1. Stop the Node process that serves the app.
2. `git checkout` the last known-good commit.
3. `npm install` if lockfile changed.
4. `npx prisma generate`
5. `npm run build`
6. `npx next start -p 3002`
7. `GET /health` must return `{"ok":true,"db":"up"}`

Do not run `next build` over a running `next start` that shares `.next`.

## If a local schema change is incompatible

1. Do not restore onto `wrc` until the dump has been proven on `wrc_restore_probe`.
2. Restore the proven dump onto a new database, point a throwaway `DATABASE_URL` at it, smoke `/health`.
3. Only then consider replacing DEV.

## Out of scope here

HTTPS, SmartNet-hosted backup retention, and production image rollback are not local V0 gaps and are not claimed done by this document.
