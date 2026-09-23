# SmartNet Web Release Control

Internal web release-quality gate. Not Jira. Not a generic checklist.

## Local setup

1. Copy `.env.example` to `.env` (already present for local pilot).
2. Start PostgreSQL: `npm run db:up`
3. Install: `npm install`
4. `npx prisma generate`
5. `npx prisma db push`
6. `npm run db:seed`
7. `npm run dev`

Open http://localhost:3000

Demo password for all seeded users: `Pilot2026!`

| Email | Role |
|---|---|
| frontend@smartnet.local | Frontend TEAM_MEMBER |
| network@smartnet.local | Network TEAM_MEMBER |
| seo@smartnet.local | SEO_LEAD |
| pm@smartnet.local | PROJECT_MANAGER |
| management@smartnet.local | MANAGEMENT |
| admin@smartnet.local | SYSTEM_ADMIN |

## Golden Scenario

1. PM or SEO creates a release on Audi Türkiye (Frontend + Network + SEO modules).
2. Frontend logs in, opens My Checks, starts FE-014, adds evidence, submits review.
3. SEO fails it, Frontend resumes and resubmits, SEO passes it.
4. Gate stays NO_GO while NET-015 (or another Network P0) is open.
5. Network resolves its P0 with evidence + required verification.
6. Remaining P0/P1 in the selected modules must also be resolved before READY.
7. Management sees READY and zero blockers. Audit keeps the sequence.

## Commands

- `npm test` — gate, authz, and Golden Scenario integration tests
- `npm run typecheck`
- `npm run build`
- `GET /health` — app + database

## Backup / restore (local)

See `docs/ROLLBACK.md`.

```text
npm run db:restore-drill
```

This restores `wrc_test` onto throwaway `wrc_restore_probe` and then drops the probe. It does not write to DEV `wrc`.

BACKUP EXISTS is not RESTORE VERIFIED.
