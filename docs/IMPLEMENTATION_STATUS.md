# Implementation Status

## Implemented

- Next.js + TypeScript + Prisma + PostgreSQL (Docker) + Auth.js credentials
- Users, teams, roles, project default team mapping
- Versioned templates with full control snapshot on ReleaseCheck
- Release create + applicable modules
- ReleaseCheck workflow: start, evidence, submit, fail, resubmit, pass, block, waive, reopen
- `startCheck` / `submitForReview` / `passCheck` same-status calls are idempotent (no `IN_PROGRESS→IN_PROGRESS` / `REVIEW→REVIEW` / `PASS→PASS` throw)
- Owner ≠ Reviewer, Found By ≠ Owned By, Team ≠ Domain
- Server-side RBAC (team cannot edit other team; Management read-only; SEO_GATED requires SEO)
- Calculated gate: NOT_ASSESSED / NO_GO / AT_RISK / READY (READY not user-set)
- POST_LAUNCH checks excluded from pre-deploy READY
- Lifecycle ops only: markDeployed, emergencyDeploy, startPostLaunch, markProductionVerified, reopenRelease
- Public FormData paths do not accept `gateStatus` / `deploymentStatus`
- PRODUCTION_VERIFIED lock; explicit reopen → POST_LAUNCH_VERIFYING then gate recalc
- Emergency deploy does not create READY
- Append-only audit
- Test isolation: TEST_DATABASE_URL / `wrc_test`; fail-fast if NODE_ENV=test and URL is not a test DB
- Role-oriented Turkish UI: nav, dashboards, Görevlerim, Onaylar, teaching check detail, grouped release page, management summary
- Seed: Audi Türkiye + Corporate Website v1.0 and v1.0-pilot (FE-014 + NET-015)
- `/health`

## Verified

- `npm run typecheck` (pass) after this recovery pass
- `npm test` — 33 tests on `wrc_test` (pass): Golden Scenario, idempotent start/submit/pass, mutation-boundary (no public `gateStatus`/`deploymentStatus` injection), reopen → POST_LAUNCH_VERIFYING, READY⇒P0=0, lifecycle auth, review-queue SEO bottleneck, DB isolation guard
- Tests did not mutate DEV: Website Migration remained READY + PRODUCTION_VERIFIED, FE-014 PASS (2 evidence), NET-015 PASS (1 evidence)
- `npm run build` (pass) after stopping the old `next start`
- Clean `next start -p 3002` after rebuild → GET `/health` `{"ok":true,"db":"up"}` HTTP 200 (no `331.js`)
- Live Golden on DEV Website Migration `cmub60way0001lvdw88io7r8a`:
  - SEO fail FE-014 (“Canonical staging domain gösteriyor.”); owner stayed Frontend
  - Frontend corrected + new evidence + resubmit; cannot self-approve SEO_GATED
  - SEO PASS FE-014; NET-015 still open → Yayına Hazır Değil; remaining blocker Network
  - Network owned NET-015 (domain SEO); start/evidence/submit; SEO PASS → gate auto READY (GATE_RECALCULATED 16:16:34); no manual READY
  - PM: Yayına Alındı → Yayın Sonrası Kontrolü → Production Doğrulaması (DEPLOYED ≠ PRODUCTION_VERIFIED)
  - Lock: mutate check rejected (`PRODUCTION_VERIFIED release is locked`)
  - Reopen “Canlı reopen doğrulaması” → POST_LAUNCH_VERIFYING; P0 reopen → NO_GO; PRODUCTION_VERIFIED + open mutable P0 did not occur
  - Remediating after reopen already in DEV audit: SEO PASS FE-014 + GATE_RECALCULATED 16:37:13; PM PRODUCTION_VERIFIED 17:02:16
- Live remaining roles (this recovery pass, no DEV reset):
  - Management: only Yönetim Özeti nav; Yayına Hazır / Yayına Hazır Değil; P0 0 vs 4 (Backend); no ops on release/check; `/admin` `/templates` `/reviews` `/dashboard` redirect home
  - Backend: own 3 checks on `DEV browser verification — Backend/Content`; can mutate BE-010; cannot mutate FE-014 or CNT-007
  - Content: own CNT-017 (Çapraz Onay) + CNT-007; cannot mutate BE-010; unsubmitted Content not in SEO Onaylar
  - Admin: full nav; Kullanıcılar (8 aktif), Şablonlar (v1.0-pilot + v1.0 immutability copy), Projeler
- Authenticated smoke as Admin: `/health` `/dashboard` `/projects` `/my-checks` `/reviews` `/management` `/templates` `/admin` `/releases/cmub60way0001lvdw88io7r8a` `/releases/cmuba6u1o0001lv7sh8fzl6wz` all HTTP 200, no overlay / 500 / `331.js`

Independent verifier has not run. Do not treat this as V0-complete or Pilot READY.

## Not Yet Verified

- Independent verifier agent PASS
- Isolated restore drill
- HTTPS / SmartNet-hosted environment
- Evidence file-on-disk upload (V0 uses URL/TEXT/SCREENSHOT/TEST_RESULT body)

## Assumptions

- Prisma (Sheet canonical)
- SELF goes through REVIEW; owner team may PASS SELF; SEO_GATED requires SEO_LEAD/SYSTEM_ADMIN
- Canonical Content controls (CNT-*) are CROSS_TEAM, not SELF; templates were not mutated to invent a SELF Content check
- SEO Reviews queue excludes SELF and excludes unsubmitted checks
- Unresolved in-scope P1 ⇒ AT_RISK
- WAIVED is not PASS and is not an open blocker
- P0 implies release blocker
- POST_LAUNCH ignored by gate until DEPLOYED
- Test DB is created on the same Postgres instance as `wrc_test`; `prisma db push` + seed in Vitest globalSetup (does not rewrite applied DEV migrations)
- Previous `Cannot find module './331.js'` was stale `.next` overlap between `next build` and `next start`; no code workaround
- Double-submit Application error on the old bundle was a real defect; source already returned same-status idempotently; rebuilt `next start` now includes that fix
- Demo password `Pilot2026!`
- AUTH_URL currently http://localhost:3002
- Temporary DEV release `cmuba6u1o0001lv7sh8fzl6wz` (“DEV browser verification — Backend/Content”) is retained for role verification; not product data

## Blocked Decisions

- None

## Next

- Independent verifier run (closed-loop; this implementation agent must not self-certify)
- Then expand remaining spec seed controls only after verifier PASS
