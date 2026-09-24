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
- Approved Claude Design translated into the Next.js / Tailwind product (AppShell, Dashboard, Release Detail, Check Detail, Reviews, Management)
- Role-driven sidebar (prototype-only screens not shipped)
- Real global search over Project / Release / ReleaseCheck with `canViewRelease` visibility
- Attention Center derived from current FAIL / review / assignment / blocked-release state (no notification platform)
- Presentation-only progress: PASS / applicable checks excluding NA and REMOVED_FROM_SCOPE
- Existing `Release.targetDate` used; no new schema field
- Seed: Audi Türkiye + Corporate Website v1.0 and v1.0-pilot
- `/health`
- Visual parity pass (branch `wrc-ui-visual-parity`, presentation only): `_ds/tokens/*.css` mapped into `tailwind.config.ts` + `globals.css` (colors, Plus Jakarta Sans via next/font, `normal` line-height scale, radii 6/8/10/12/16/28, elevation shadows); Lucide icon geometry; DS Sidebar/TopBar/Badge/Button/Avatar anatomy; five reference screens + secondary pages restyled; phone-width icon rail for the sidebar

## Verified

- `npm run typecheck` after UI redesign (pass)
- `npm test` — 12 files / 54 tests on `wrc_test` (pass): previous 37 plus progress, search authorization, attention derivation, role navigation
- Golden Scenario, mutation-boundary, SELF / CROSS_TEAM / LIVE_UNVERIFIED tests still pass
- `npm run build` + `next start -p 3002` `/health` → `{"ok":true,"db":"up"}` HTTP 200
- Browser (System Admin): new shell, Dashboard, Search (Audi → project + 2 releases), Attention, Release Detail, locked Check Detail, Reviews empty state, Yayın Durumu, Şablonlar, Kullanıcılar, login
- Other-role live sessions and SELF/CROSS browser closeout were not completed (password fill blocked in this environment)
- Visual parity pass: typecheck pass; `npm test` 12 files / 54 tests on `wrc_test` (pass); `npm run build` pass
- Visual parity pass, side-by-side at 1440px (headless Chrome render of the prototype vs the app DOM, System Admin session): Dashboard, blocked Release, ready Release, correction Check, locked Check, Reviews, Management; secondary pages checked for consistency
- Visual parity pass smoke (System Admin, DEV :3003): search results + links, attention bell, lifecycle panel, locked state, workflow start → evidence → submit → fail on the disposable release; no horizontal overflow at 1440 / 1024 / 768 / 390
- Action refresh fix: successful check/release server actions now call `revalidatePath("/", "layout")`; live-verified on the disposable FAIL check (FAIL → IN_PROGRESS updated status and CTA without reload); typecheck + 54/54 tests on `wrc_test` pass

Independent verifier previously returned FAIL for V0 / Pilot. This UI pass does not re-establish verifier PASS, V0-complete, or Pilot READY.

## Not Yet Verified

- Independent verifier re-run after this UI pass
- HTTPS / SmartNet-hosted environment
- Staging smoke on a SmartNet host
- Real SmartNet pilot scenario
- Evidence file-on-disk upload (V0 uses URL/TEXT/SCREENSHOT/TEST_RESULT body)
- LIVE_UNVERIFIED starting already DEPLOYED / POST_LAUNCH_VERIFYING (unspecified; not invented)
- Visual parity pass: non-admin role sessions not re-checked in the browser (role navigation covered by `nav.test.ts` only)
- `npm run lint`: `next lint` fails to start ("Failed to patch ESLint"), a tooling/version issue unrelated to this pass

## Assumptions

- Prisma (Sheet canonical)
- SELF still goes through REVIEW; owner team may PASS SELF; SEO_GATED requires SEO_LEAD/SYSTEM_ADMIN
- Canonical Content controls (CNT-*) remain CROSS_TEAM; templates were not mutated
- LIVE_UNVERIFIED starts `NOT_DEPLOYED`, `baselineCompleted=false`, checks `NOT_STARTED` (no fake PASS). Initial deployment axis left unspecified by the Sheet and was not changed.
- Test DB is `wrc_test` on the same Postgres instance; restore drill uses only `wrc_test` / `wrc_restore_probe`
- Demo password `Pilot2026!`
- AUTH_URL currently http://localhost:3002
- Temporary DEV release `cmuba6u1o0001lv7sh8fzl6wz` is retained; not product data
- Progress percent is presentation only and is not an input to `calculateGate`
- Greeting uses local clock (morning / afternoon / evening) rather than always “Günaydın”
- SEO_LEAD keeps Şablonlar because `canManageTemplates` already authorizes it
- Release lifecycle panel shows the next step disabled with its reason while the gate blocks deployment (presentation only; no form rendered)
- Release team accordion opens only teams with open criticals (or all when a filter is active)
- Management rows are display-ordered NO_GO → AT_RISK → NOT_ASSESSED → READY; footer shows render time as "Son güncelleme"
- Below `md` the sidebar collapses to an icon rail (prototype has no phone spec)
- DEV disposable release now has one FAIL and one REVIEW check (created for visual verification with approval)
- Search visibility equals current navigation: any active user can discover non-archived records; inactive users get none

## Blocked Decisions

- Whether LIVE_UNVERIFIED should start as DEPLOYED / POST_LAUNCH_VERIFYING instead of NOT_DEPLOYED (would change user-visible onboarding). Conservative current behavior kept.

## Next

- Freeze this UI candidate after local browser acceptance
- Independent verifier re-run
- Hosted/HTTPS/staging/real pilot remain operations work
