# Implementation Status

## Implemented

- Next.js + TypeScript + Prisma + PostgreSQL (Docker) + Auth.js credentials
- Users, teams, roles, project default team mapping
- Versioned templates with full control snapshot on ReleaseCheck
- Release create + applicable modules
- ReleaseCheck workflow: start, evidence, submit, fail, resubmit, pass, block, waive, reopen
- `startCheck` / `submitForReview` / `passCheck` same-status calls are idempotent
- Owner ≠ Reviewer, Found By ≠ Owned By, Team ≠ Domain
- Server-side RBAC (team cannot edit other team; Management read-only; SEO_GATED requires SEO)
- Calculated gate: NOT_ASSESSED / NO_GO / AT_RISK / READY (READY not user-set)
- POST_LAUNCH checks excluded from pre-deploy READY
- Lifecycle ops only: markDeployed, emergencyDeploy, startPostLaunch, markProductionVerified, reopenRelease
- Public FormData paths do not accept `gateStatus` / `deploymentStatus`
- PRODUCTION_VERIFIED lock; explicit reopen → POST_LAUNCH_VERIFYING then gate recalc
- Locked check page hides mutation/review/advanced forms and states the lock; rejected actions redirect with `?err=` instead of an Application error overlay
- Emergency deploy does not create READY
- Append-only audit
- Test isolation: TEST_DATABASE_URL / `wrc_test`
- Isolated restore drill: `npm run db:restore-drill` dumps `wrc_test` → `wrc_restore_probe` → drop probe (never writes DEV `wrc`)
- Known-good local rollback path: `docs/ROLLBACK.md`
- Role-oriented Turkish UI
- Seed: Audi Türkiye + Corporate Website v1.0 and v1.0-pilot
- `/health`

## Verified

- `npm run typecheck` after this local-gap pass (pass)
- `npm test` — 37 tests on `wrc_test` (pass): previous 33 plus SELF owner PASS + SEO queue exclusion, CROSS_TEAM owner cannot PASS / assigned reviewer can / unsubmitted not queued, LIVE_UNVERIFIED creates no fabricated PASS and stays NOT_ASSESSED
- Golden Scenario and mutation-boundary tests still pass; DEV Website Migration unchanged after tests (READY + PRODUCTION_VERIFIED; FE-014 2 evidence; NET-015 1 evidence)
- `npm run db:restore-drill` — ok; 8 users restored onto probe; DEV user count unchanged
- `npm run build` after stopping the previous `next start`
- Clean `next start -p 3002` `/health` → `{"ok":true,"db":"up"}` HTTP 200
- Browser (Admin, rebuilt bundle): locked FE-014 shows lock copy, only Çıkış, no Kanıt Ekle / Gelişmiş işlemler; two existing evidence items remain

Independent verifier previously returned FAIL for V0 / Pilot. This pass closed local gaps only. Do not treat this as verifier PASS, V0-complete, or Pilot READY.

## Not Yet Verified

- Independent verifier re-run after this pass
- HTTPS / SmartNet-hosted environment
- Staging smoke on a SmartNet host
- Real SmartNet pilot scenario
- Evidence file-on-disk upload (V0 uses URL/TEXT/SCREENSHOT/TEST_RESULT body)
- LIVE_UNVERIFIED starting already DEPLOYED / POST_LAUNCH_VERIFYING (unspecified; not invented)

## Assumptions

- Prisma (Sheet canonical)
- SELF still goes through REVIEW; owner team may PASS SELF; SEO_GATED requires SEO_LEAD/SYSTEM_ADMIN
- Canonical Content controls (CNT-*) remain CROSS_TEAM; templates were not mutated
- LIVE_UNVERIFIED starts `NOT_DEPLOYED`, `baselineCompleted=false`, checks `NOT_STARTED` (no fake PASS). Initial deployment axis left unspecified by the Sheet and was not changed.
- Test DB is `wrc_test` on the same Postgres instance; restore drill uses only `wrc_test` / `wrc_restore_probe`
- Demo password `Pilot2026!`
- AUTH_URL currently http://localhost:3002
- Temporary DEV release `cmuba6u1o0001lv7sh8fzl6wz` is retained; not product data

## Blocked Decisions

- Whether LIVE_UNVERIFIED should start as DEPLOYED / POST_LAUNCH_VERIFYING instead of NOT_DEPLOYED (would change user-visible onboarding). Conservative current behavior kept.

## Next

- Independent verifier re-run on this local-gap pass
- Hosted/HTTPS/staging/real pilot remain outside local remediation
