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
- Turkish UX & ownership closeout (branch `wrc-tr-ux-ownership-closeout`): canonical Turkish vocabulary in labels/nav/pages (Genel Bakış, Yayın, Kontrol Görevi, Doğrulayan, Tespit Eden, Yayın Kararı, Mevcut Canlı Durumu Kaydet…); domain errors translated at the `?err=` boundary (`src/lib/tr-messages.ts`); audit history rendered as Turkish sentences; check header shows Sorumlu ekip / Tespit eden / Etkilenen alan / Doğrulayan side by side; next-step hints; non-owners see “Görev durumu” instead of “Yapman gereken”; evidence/blocked/priority selects show Turkish labels; Turkish 404 and error pages; successful check/release actions redirect to the clean page so a stale error banner does not survive; reference doc `docs/UX_OWNERSHIP_TR.md`
- Pre-staging spec closure (branch `wrc-spec-closure`): `ReleaseCheck.source` (`TEMPLATE` | `AD_HOC`, additive migration `20260924120000_release_check_source`, existing rows TEMPLATE); `createAdHocCheck` + “+ Yeni Sorun” on Release Detail (SEO Lead / PM / Admin; not on PRODUCTION_VERIFIED; Found By = session user; `ADH-###` code; creation snapshot in `templateControlSnapshot`; CREATED audit with source/owner/priority/verification; gate recalculated); approval authority by verification contract (SELF owner team, CROSS_TEAM assigned reviewer outside owner team, SEO_GATED SEO Lead; Admin override); implementation actions owner team only; template reviewer from `defaultReviewerRole` (no hard-coded SEO)
- SEO technical approval rule (2026-10-01, PROJECT_SHEET §117): `canReviewCheck` — Frontend/Backend/Network/Content-owned work is approved / sent back only by SEO Lead (Admin override), whatever the verification type; PM and Management never approve; SEO-owned work keeps the §116 contract. New releases and new ad-hoc issues get the SEO Lead as reviewer for F/B/N/C work; existing stored reviewers are not rewritten (authorization ignores them, UI shows “SEO”). No schema change.
- §117 closeout: WAIVED / N/A on every task (F/B/N/C and SEO-owned) decided only by SEO Lead (Admin override); PM and Management blocked server-side and see no control. `markNotApplicable` service (reason + audit, §17) + “Uygulanamaz Olarak İşaretle” in Yönetici işlemleri. `changeReviewer` rejects a non-SEO reviewer on F/B/N/C work and the reviewer select lists only SEO there; `changeOwner` to a F/B/N/C team sets the SEO Lead as reviewer (in the OWNER_CHANGED audit).
- DEV reconciliation (one-off script, run once and not kept in the repo; idempotent, audited, no deletes): 10 active F/B/N/C checks with a non-SEO stored reviewer → SEO Lead (REVIEWER_CHANGED, actor System Admin); 4 terminal historical rows untouched; FE-008 live-test priority restored P2 → P1 from audit (status PASS kept: no workflow path back, evidence append-only); disposable releases “TR UX closeout (disposable)” and “UI redesign disposable” archived (RELEASE_ARCHIVED audit)
- Evidence view (`src/lib/evidence-view.ts`): URL / SCREENSHOT / EXTERNAL_TICKET records whose body starts with a real http(s) URL get an “Aç ↗” / “Görüntüle ↗” link (leading URL only, `target=_blank`, `rel=noopener noreferrer`); every record's full text is shown wrapped (was truncated to one line). TEXT / TEST_RESULT never become links; FILE has no storage in V0, so no download is offered; non-http schemes are never linked
- Check detail: removed the redundant “… Tespit eden, işi yapan ekip değildir …” line (metadata fields already show it)
- Dikkat Gerektirenler can be cleared: per-item “×” and “Tümünü temizle”; per-user `AttentionDismissal` (additive migration `20261001150000_attention_dismissal`); item key = id + state stamp, so an item returns when its state changes; badge shows the real total; AuditEvent never touched
- Archived releases / projects are excluded from Görevlerim, dashboard assigned list and Onaylar (previously leaked)
- DEV demo/test data archived (not deleted; audit is append-only and FK-less): projects Audi Türkiye (seed demo, 5 releases) and Deneme Projesi (1 release) via a one-off script (not kept; every change is a RELEASE_ARCHIVED / PROJECT_ARCHIVED audit row); seed no longer un-archives Audi on re-seed
- File / screenshot evidence: bytes stored in Postgres (`EvidenceFile`, additive migration `20261001170000_evidence_file`; metadata `fileName` / `fileSize` / `mimeType` on Evidence). Allow-list PNG / JPG / WEBP / PDF / CSV / XLSX / ZIP / TXT / JSON, max 25 MB (real audit PDFs reach ~20 MB), extension + magic-byte check, active-content MIME types refused, file name is display text only. Served by `GET /evidence/:id` (session required by middleware and re-checked server-side; images/PDF inline, others attachment, `?download=1` forces download; `nosniff`, `private, no-store`). Upload goes through `addEvidence`; File/Screenshot without a valid upload creates no record. Server action body limit 26 MB (`next.config.ts`)
- Tests run file-by-file (`fileParallelism: false`): files share `wrc_test` and delete their own releases in `afterAll`, which raced with global queries in other files
- `scripts/onboard-solen.ts` kept as the idempotent Şölen onboarding tool. Fail-closed: outside local development (NODE_ENV=production or a non-localhost DATABASE_URL) all of `SOLEN_PM` / `SOLEN_SEO` / `SOLEN_FRONTEND` / `SOLEN_BACKEND` / `SOLEN_NETWORK` / `SOLEN_CONTENT` are required; every person must exist, be active and have the expected role/team. Validation runs before the first write; otherwise it exits 1 with nothing written. Local development may use the demo accounts
- Post-v1 ops usability (branch `feature/ops-usability-accounts-evidence`, not committed):
  - Accounts: `User.username` (unique, trimmed/lowercase, `[a-z0-9._-]`, 3–32) + `mustChangePassword`; e-mail optional (additive migration `20261002090000_user_username_password_change`; existing accounts got their e-mail local part as username, no row changed otherwise). Login accepts username or e-mail (transition). System Admin creates users (name, username, optional e-mail, role, team, temporary password, active), changes role/team/active, resets temporary passwords; the last active System Admin cannot be removed; no public registration. New and reset accounts must set their own password (`/change-password`, enforced in `requireUser` and the evidence route) before working. `Profilim` (/profile): name, username, role, team, status + own password change (current password required). bcrypt hashes only; audit `USER_CREATED` / `USER_UPDATED` / `PASSWORD_RESET` / `PASSWORD_CHANGED` never contain a password or hash
  - Task assignment: “Ekip İçinde Ata” assigns an active member of the owner team (`assignCheckUser`, audit `ASSIGNEE_CHANGED`); owner team, reviewer and §116/§117 governance unchanged. “Sorumlu Ekibi Değiştir” keeps the existing cross-team move. Default people from project/release mappings are used only while active, so a retired account gets no new work
  - Team readiness: each team shows “X açık · Y kritik”; open = open work (terminal PASS/NA/WAIVED/REMOVED excluded), critical = the existing blocker rule; Problem Var (critical > 0) / Devam Ediyor (open > 0) / Hazır (open = 0). Dashboard team chips show the open count
  - Evidence header counts “N kanıt”
  - Evidence permission (final decision): the reporter (Found By), the assigned person in the owner team (anyone in it while team-owned) and the effective reviewer may add evidence; Management never; System Admin override kept; nobody edits/deletes others' evidence; approval rules unchanged
  - Şölen source backfill: source folder fully scanned (26 files, no subfolders; xlsx / zip / csv contents and PDF text via pdftotext). `docs/SOLEN_EVIDENCE_BACKFILL.md` rebuilt: VERIFIED 24, PARTIAL 1 (ADH-021), NO DIRECT SOURCE REQUIRED 2 (ADH-026/027), SOURCE NOT FOUND 1 (ADH-024, legacy UA id not in any file). 33 FILE evidence attached to 25 tasks by the reporter (SEO lead), from the original files; the 28 TEXT evidence rows unchanged
  - Existing SEO lead login renamed `seo` → `gokhanuyaroglu` (same user id, relations and password; `USERNAME_CHANGED` audit). E-mail login still works as the legacy fallback
  - Reproducible: `prisma/seed.ts` creates the SEO lead as `gokhanuyaroglu` on a fresh install, and on an existing install renames only the legacy `seo` login to it on the same user id (password, e-mail and relations untouched). Verified on a fresh probe DB (db push + seed → `gokhanuyaroglu`, no `seo` username; username and legacy e-mail login work, `seo` does not) and on `wrc_test`; probe dropped
  - Evidence binaries are database state: the 33 Şölen FILE evidence (~77 MB) live in Postgres (`EvidenceFile`), not in source code or migrations. Moving to staging/production needs a DB backup/restore or a controlled evidence migration. DEV checkpoint: `C:\Users\Monster Abra\Desktop\SmartWRC Backups\wrc-dev-20261001-172536.dump` (pg_dump custom format, 58.9 MB, outside the repo; TOC verified with `pg_restore -l`, not restored)
  - Project team settings (“Proje ekibi” on the project page; PM / SEO / Frontend / Backend / Network / Content): only eligible active people; additive `Project.pmUserId` (migration `20261002120000_project_pm_default`); changes defaults for new work and the active releases' defaults, never reassigns existing tasks; audit `PROJECT_TEAM_CHANGED`
  - Deactivation / team / role change is refused server-side while the person is owner or reviewer of open work or still a project/release default (archived and terminal history excluded); the error names what blocks; no override
  - Seed re-runs no longer reset demo passwords or re-activate retired accounts
- Şölen backlog export (read-only): `docs/SOLEN_BACKLOG_EXPORT.md` — 28 tasks P0 → P1 → P2 + 3 deferred
- Şölen onboarding (`scripts/onboard-solen.ts`, idempotent, domain services only): project “Şölen SEO & GEO”, team mapping, release “Ekim 2026 — İlk uygulama dönemi” (v1.1, LIVE_UNVERIFIED, target 2026-10-31, baseline completed), 28 root-cause AD_HOC tasks (P0 6 / P1 20 / P2 2; SEO 9, Frontend 9, Backend 3, Content 6, Network 1), each with evidence, acceptance criteria and dependencies in the SOP; second run creates 0

## Verified

Environment wording: TECHNICALLY TESTED = tests/typecheck/build; LOCAL LIVE VERIFIED = browser on the local DEV server (:3003) or the local `next start` build (:3002). Nothing has been deployed to or verified on production: PRODUCTION VERIFIED = NO.

- SEO approval rule: typecheck pass; `npm test` 15 files / 82 tests on `wrc_test` (new `seo-approval.test.ts` CASE 1–8; review-queue / attention / verification-types / spec-closure expectations changed to the new rule); build pass
- §117 closeout: `seo-approval.test.ts` 12 tests (CASE 1–8 + reviewer guard + WAIVED/N/A blocked for PM/Management, allowed for SEO with SEO as audit actor, SEO-owned WAIVED/N/A blocked for PM/Management, allowed for SEO)
- Post-v1 ops usability: typecheck pass; `npm test` 21 files / 109 tests (new `accounts.test.ts`, `team-readiness.test.ts`); build pass. Migration reconciliation on DEV: users, team/project/release assignments, owned/reviewer/found-by/evidence/review/audit-actor counts and password hashes identical before/after. LOCAL LIVE (:3002; System Admin sign-in by the user; two disposable Backend test accounts with locally generated test passwords): admin created both (Backend, “Şifre değişimi bekliyor”); a disposable Backend task offered both in “Ekip İçinde Ata” and was assigned to one (owner team Backend, reviewer SEO unchanged); Şölen release cards showed Frontend 9 açık · 3 kritik / Backend 3 · 0 / Network 1 · 0 / Content 6 · 0 / SEO 9 · 3; test user signed in by username (mixed case) with the temporary password → forced to /change-password (dashboard, my-checks, profile and evidence blocked) → changed → old password rejected → new password works; Profilim showed the account read-only, wrong current password rejected, change succeeded; both test accounts deactivated through Sistem Yönetimi and the deactivated account could not sign in; disposable project archived. Audit for these steps contains no password or hash
- Final pre-commit (LOCAL LIVE, final build :3002, Frontend sign-in by the user): JPG screenshot uploaded through the real “Kanıt Ekle” server action on a disposable task (archived afterwards); name + size shown; Görüntüle inline and İndir attachment returned the same 4,518 bytes; still available after reload; DB Evidence (SCREENSHOT, image/jpeg, 4518) + EvidenceFile (4518 bytes, JPEG magic). onboard-solen runs: local defaults → 0 created / 28 existing; non-dev missing env, partial env, unknown user + wrong team → exit 1 with DB snapshot identical (also on a DB without Şölen); non-dev with all valid people → 0 created, snapshot identical
- Cleanup turn: `npm test` 17 files / 91 tests (new `evidence-view.test.ts`, `attention-dismiss.test.ts`); build pass. LOCAL LIVE (:3002, SEO sign-in by the user): Şölen ADH-012 evidence “Crawl: 23 H1 missing, 8 multiple H1.” (TEXT) fully readable, no fake link; URL evidence on an archived acceptance check links the leading URL with noopener; redundant line gone, metadata intact; nonexistent check → Turkish 404; logged-out check URL → 307 to /login; notification single clear 10 → 9 and survives reload; clear all → 0 and survives reload; Projeler / dashboard / Görevlerim / Onaylar / Yayın Durumu show only Şölen
- §117 closeout LOCAL LIVE (local `next start` build :3002, sign-in by the user, disposable release “§117 canlı doğrulama (disposable)” in Audi Türkiye via a one-off fixture script (not kept), archived afterwards): PM saw no Muaf Tut / Uygulanamaz on the Frontend task or the SEO-owned task; F/B/N/C reviewer select offered only the SEO Lead; PM moved an SEO-owned CROSS_TEAM task (reviewer Network) to Frontend → UI and DB both show reviewer SEO, OWNER_CHANGED audit actor PM; SEO marked the Frontend task N/A and waived the SEO task → DB status NA / WAIVED, audit actor SEO. Şölen untouched (28 NOT_STARTED, no new audit)
- SEO approval rule live (DEV :3003, sign-in per role by the user, 2026-10-01): Frontend FE-008 (SELF) start → evidence → submit, no Onayla; PM no Onayla / Düzeltme İste, priority P1 → P2 succeeded and audited, Şölen visible; SEO queue contained FE-008, SEO PASS; Şölen release shows NO_GO with 6 P0 blockers; Management redirected to read-only Yayın Durumu, Şölen row NO_GO, no controls

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
- Live role acceptance (2026-09-24, DEV :3003, fresh sign-in per role by the user): PM, Content, Frontend, SEO Lead, Management; role nav, dashboard, Görevlerim, Bana Atananlar, Reviews queue/badge, Release/Check detail, locked release, Yayın Durumu verified in the UI
- SELF live PASS: FE-008 (Frontend start → evidence → submit → Frontend PASS) and FE-003 (Frontend PASS); no SEO step; release critical 11 → 10, Frontend 4 → 3
- CROSS_TEAM live PASS: CNT-017 (Content owner; reviewer SEO Lead as assigned) start → evidence → submit → FAIL with feedback → owner resume → new evidence → resubmit → PASS; owner/unrelated team had no approve control; feedback labelled as generic, not SEO
- SEO_GATED loop: FE-015 Frontend submit → SEO FAIL (current finding) → Frontend fix + evidence → resubmit → SEO PASS
- LIVE_UNVERIFIED live: disposable release baseline completed by PM through the UI (baselineAt set, NOT_ASSESSED → NO_GO); SEO FAIL on FE-015 shown as blocker with Frontend owner and finding text; remediation lowered critical 10 → 9
- No-F5 refresh confirmed after start, add evidence, submit, fail, resume, resubmit, pass (SELF, SEO_GATED, CROSS_TEAM) and baseline completion
- Audit trail verified read-only for FE-008, FE-003, FE-015, CNT-017 and the release baseline
- Turkish UX closeout: typecheck pass; `npm test` 13 files / 58 tests on `wrc_test` (54 existing + 4 message tests); build pass
- Turkish UX closeout live (DEV :3003, fresh sign-in per role by the user): PM created “TR UX closeout (disposable) — sahiplik doğrulama” from Corporate Website v1.0 through the form → 18 checks generated, 0 mismatches vs template (owner team, verification, priority, evidence, snapshot version); Frontend start → no-evidence submit rejected with Turkish message → evidence → submit (FE-015, FE-014), no approve on SEO_GATED, no controls on Network/Content checks; SEO queue held only the two SEO_GATED items; SEO FAIL on FE-015 “Canonical staging domain gösteriyor.” → Tespit eden SEO/Gökhan, Sorumlu Frontend, Etkilenen alan SEO, P0, SEO Onayı Zorunlu; SEO PASS on FE-014; Management fresh session read-only (0 forms/buttons), Turkish
- Final cleanup: AGENTS.md aligned with §116; `npm test` 14 files / 72 tests on `wrc_test` (+2 catalogue invariant tests); `prisma generate` clean after the stale 3002 server was stopped by the user; build pass; fresh `next start -p 3002` → `/health` 200 `{"ok":true,"db":"up"}`; dashboard/release/check smoke clean
- Spec closure: typecheck pass; `npm test` 14 files / 70 tests on `wrc_test` (58 + 12 new in `spec-closure.test.ts`; `authz.test.ts` SEO edit expectation tightened); build pass
- Spec closure live (DEV :3003, fresh sign-in per role by the user): SEO opened ADH-001 “Canonical staging domain gösteriyor” (SEO / Frontend / P0 / SEO_GATED) → Found By SEO, owner Frontend, gate 11→12 critical; SEO had no implementation controls; PM opened ADH-002 (Content, CROSS_TEAM, reviewer Network User) → Found By PM; owner-team reviewer rejected in Turkish; Frontend start → evidence → submit, no self-approve, no “+ Yeni Sorun”; Content submit, no self-approve; PM had no Onayla/Düzeltme İste on either; SEO queue showed only ADH-001, no approve on ADH-002; SEO FAIL → Frontend resume/evidence/resubmit → SEO PASS (12→11); Network User PASSed ADH-002; Management fresh session read-only, no “+ Yeni Sorun”; locked Website Migration shows no “+ Yeni Sorun”, reopen unchanged

Independent verifier previously returned FAIL for V0 / Pilot. This UI pass does not re-establish verifier PASS, V0-complete, or Pilot READY.

## Not Yet Verified

- Independent verifier re-run after this UI pass
- HTTPS / SmartNet-hosted environment
- Staging smoke on a SmartNet host
- Real SmartNet pilot scenario
- Evidence file-on-disk upload (V0 uses URL/TEXT/SCREENSHOT/TEST_RESULT body)
- LIVE_UNVERIFIED starting already DEPLOYED / POST_LAUNCH_VERIFYING (unspecified; not invented)
- Visual parity pass: non-admin role sessions not re-checked in the browser (role navigation covered by `nav.test.ts` only)
- Live server-layer rejection by forged server-action POSTs (Management mutation, Frontend on Network/SEO_GATED, locked release) not run: blocked by the agent permission classifier. UI shows no controls for those roles; server rules are covered by `authz.test.ts`, `mutation-boundary.test.ts`, `verification-types.test.ts`, `lifecycle.test.ts`
- `npm run lint`: `next lint` fails to start ("Failed to patch ESLint"), a tooling/version issue unrelated to this pass

## Assumptions

- §117: Ekip İçi Onay (SELF) now means in-team approval only for SEO-owned work; F/B/N/C SELF tasks also go to the SEO queue
- Reconciliation actor is System Admin (system operation), with the §117 reason on every audit row
- Şölen SEO-owned tasks (9) are SELF with SEO Lead as reviewer: the §116 SELF contract for the SEO team (no new behavior)
- Şölen: 3 conditional items deferred, not created (GA4/GTM implementation after ADH-003; entity structured data implementation after ADH-021; backend status/canonical fixes after the investigations)

- SEO-owned SEO_GATED standards (SEO-001/002/008, POST-007) are verified by the SEO Lead (approved exception to “owner cannot self-approve”)
- AD_HOC issues always require evidence; evidence attached at creation documents the finding, the owner adds fix evidence
- Team members discover their CROSS_TEAM reviews through Genel Bakış attention/pill and `/reviews` (no Onaylar nav item for TEAM_MEMBER, unchanged)

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

- RESOLVED 2026-10-02 — init migration BOM: `20260921000100_init/migration.sql` began with a UTF-8 BOM, so `prisma migrate deploy` failed on an empty database (P3009). Only the 3-byte BOM was removed (old SHA-256 `3ae9cc93…92390f` minus BOM == new file `cfffe958…4d1ac0`, byte-identical otherwise). DEV `_prisma_migrations.checksum` for that single row updated old → new under an exact-match condition (migration was recorded with 0 steps; schema came from `db push`); nothing re-run, no row added or removed. `wrc_test` has no migration table (managed by `db push` in the test setup), so nothing to reconcile. Added the canonical `prisma/migrations/migration_lock.toml` (provider postgresql). Verified on an empty probe DB: `migrate deploy` applied all 6 migrations, seed ran (admin + SEO lead `gokhanuyaroglu`, no `seo`), second deploy “No pending migrations”, `migrate status` up to date, migrate diff vs schema = no difference; probe dropped. DEV `migrate status`: up to date.

- RESOLVED 2026-09-24 (PROJECT_SHEET §116): “+ Yeni Sorun”, PM/SEO review scope and owner-team-only implementation actions are approved and implemented.
- RESOLVED 2026-09-24 — BASE-006 catalogue defect: catalogue v1.1 (create-only, `prisma/catalogue.ts`, applied to DEV with `scripts/apply-catalogue-v1-1.ts`) sets owner Network / CROSS_TEAM / reviewer PM; v1.0 untouched; no historical BASE-006 checks existed. Release generation never assigns an owner-team CROSS_TEAM reviewer (left empty for PM). Full catalogue scan: BASE-006 (v1.0) was the only violation.

- Whether LIVE_UNVERIFIED should start as DEPLOYED / POST_LAUNCH_VERIFYING instead of NOT_DEPLOYED (would change user-visible onboarding). Conservative current behavior kept.

## Next


- Freeze this UI candidate after local browser acceptance
- Independent verifier re-run
- Hosted/HTTPS/staging/real pilot remain operations work
