# Implementation Status

## Implemented

- Next.js + TypeScript + Prisma + PostgreSQL (Docker) + Auth.js credentials
- Users, teams, roles, project default team mapping
- Versioned templates with full control snapshot on ReleaseCheck
- Release create + applicable modules
- ReleaseCheck workflow: start, evidence, submit, fail, resubmit, pass, block, waive, reopen
- Owner ≠ Reviewer, Found By ≠ Owned By, Team ≠ Domain
- Server-side RBAC (team cannot edit other team; Management read-only; SEO_GATED requires SEO)
- Calculated gate: NOT_ASSESSED / NO_GO / AT_RISK / READY (READY not user-set)
- POST_LAUNCH checks excluded from pre-deploy READY
- Lifecycle ops only: markDeployed, emergencyDeploy, startPostLaunch, markProductionVerified, reopenRelease
- PRODUCTION_VERIFIED lock; explicit reopen → POST_LAUNCH_VERIFYING then gate recalc
- Emergency deploy does not create READY
- Append-only audit
- Test isolation: TEST_DATABASE_URL / `wrc_test`; fail-fast if NODE_ENV=test and URL is not a test DB
- Role-oriented Turkish UI: nav, dashboards, Görevlerim, Onaylar, teaching check detail, grouped release page, management summary
- Seed: Audi Türkiye + Corporate Website v1.0 and v1.0-pilot (FE-014 + NET-015)
- `/health`

## Verified

- `npm run typecheck` (pass)
- `npm test` — 29 tests on `wrc_test` (pass), including Golden Scenario service flow, reopen → POST_LAUNCH_VERIFYING, READY⇒P0=0, lifecycle auth, review-queue SEO bottleneck, DB isolation guard
- `npm run build` (pass)
- GET `/health` on a clean `next start -p 3002` after `.next` rebuild → `{"ok":true,"db":"up"}` HTTP 200 (no `331.js`)
- Browser: Frontend login, role nav (Ana Sayfa / Görevlerim / Projeler), team dashboard, check teaching layout, start + evidence, submit for review, cannot edit Network check, `/templates` redirect
- Browser: PM login, nav (Ana Sayfa / Projeler), create Website Migration, release page shows team groups, blockers by owner team, emergency under secondary section, no normal deploy on NO_GO
- DEV Golden pollution removed; FE-014 template title restored to canonical seed value

Independent verifier has not returned PASS. Do not treat this as V0-complete.

## Not Yet Verified

- Full multi-user browser Golden Scenario after submit (SEO Düzeltme İste / Onayla, Network resolve, READY deploy, post-launch, Production Doğrulandı, Management read-only on READY)
- Live browser for Network, Content, SEO Lead, Management, Admin accounts after the Frontend/PM pass
- Independent verifier agent PASS
- Isolated restore drill
- HTTPS / SmartNet-hosted environment
- Evidence file-on-disk upload (V0 uses URL/TEXT/SCREENSHOT/TEST_RESULT body)

## Assumptions

- Prisma (Sheet canonical)
- SELF goes through REVIEW; owner team may PASS SELF; SEO_GATED requires SEO_LEAD/SYSTEM_ADMIN
- SEO Reviews queue excludes SELF (SEO can still open a check if they navigate there)
- Unresolved in-scope P1 ⇒ AT_RISK
- WAIVED is not PASS and is not an open blocker
- P0 implies release blocker
- POST_LAUNCH ignored by gate until DEPLOYED
- Test DB is created on the same Postgres instance as `wrc_test`; `prisma db push` + seed in Vitest globalSetup (does not rewrite applied DEV migrations)
- Previous `Cannot find module './331.js'` was stale `.next` overlap between `next build` and `next dev`; no code workaround
- Demo password `Pilot2026!`
- AUTH_URL currently http://localhost:3002

## Blocked Decisions

- None

## Next

- Complete remaining live role logins (SEO / Network / Content / Management / Admin) and the rest of the browser Golden Scenario
- Independent verifier run
- Then expand remaining spec seed controls only after verifier PASS
