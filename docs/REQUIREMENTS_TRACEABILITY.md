# SmartNet Web Release Control — Requirements Traceability

**Document type:** Specification analysis (not architecture, not implementation)  
**Source of truth:** `PROJECT_SHEET.md` — v1.1 FINAL CANONICAL  
**Execution boundaries:** `AGENTS.md`  
**Decision protocol:** `GOKHAN_GATE.md`  
**Purpose:** Prevent product requirements from disappearing during architecture and implementation.  
**Analysis status:** Pre-design. No product behavior invented. No V0 scope expansion.

**Source-read note:** At analysis time the workspace copies of `PROJECT_SHEET.md`, `AGENTS.md`, and `GOKHAN_GATE.md` were 0-byte on disk. This document is derived from the complete editor-backed canonical texts of those three files (Project Sheet header: SmartNet Web Release Control, Version 1.1 FINAL CANONICAL). If the on-disk files later differ, this traceability document must be re-checked against the saved Project Sheet.

---

# PART 1 — PRODUCT MODEL SUMMARY

This section restates the Product Sheet. It does not redesign the product.

## What WRC is

SmartNet Web Release Control (WRC) is a self-hosted internal **web release-quality and governance** platform.

It verifies that SmartNet-developed or SmartNet-managed web projects pass the required technical, content, SEO, and GEO controls **before go-live and after go-live**.

Its core product question is:

> Bu release güvenli ve doğrulanmış biçimde yayına çıkabilir mi?

Its organizational principle is:

> SEO kontrol etsin değil; doğru ekip doğru işi doğru yapsın.

Canonical one-sentence product definition (Project Sheet §110):

> SmartNet Web Release Control, web projelerinde Backend, Frontend, Network, Content ve SEO ekiplerinin kendi sorumluluklarını kanıtla tamamlamasını, gerekli kontrollerin doğru ekip tarafından doğrulanmasını ve bir web release'inin yayına hazır olup olmadığının sistem tarafından objektif biçimde belirlenmesini sağlayan şirket içi release-quality ve governance platformudur.

WRC answers, objectively and auditably, the 14 questions in Project Sheet §2:

1. Which controls must be done?
2. Which team actually owns the control?
3. Which user will execute it?
4. Is it known why the control matters?
5. Is how to check explained?
6. Is how to fix explained?
7. Is evidence required?
8. Who will verify the control?
9. If it fails, who is the real owner?
10. Does it block the release?
11. Is the release actually READY?
12. Was production verified after deploy?
13. Who changed what, when?
14. Is the same error repeating by team?

## What WRC is not

WRC is **not** a general project-management, ticketing, or checklist-only application.

Explicitly not WRC:

- Sprint management, story points, general task management, Gantt, timesheets
- Employee tracking, CRM, wiki, team chat, resource planning
- Generic kanban builder, software backlog management, general bug tracker
- Mobile app, general document management, customer portal
- Automated crawler, GSC / Bing / GA4 APIs, AI assistant
- Complex notification engines, Slack integration, advanced reporting / charts
- Generic workflow builder

Development work is outside WRC. Verification of the released result is inside WRC.

Example:

- Development task: “Header component geliştir.” → not WRC
- WRC control: “Header ve navigation production ortamında desktop ve mobilde doğru çalışıyor mu?”

Scope guards that must be preserved:

> Biz Jira yapmıyoruz.  
> Biz yalnızca checklist uygulaması da yapmıyoruz.  
> Biz SmartNet'in Web Release Quality Gate sistemini yapıyoruz.  
> Biz insanların işini SEO'nun yapacağı bir checklist sistemi yapmıyoruz.

Custom development is valid only while the product stays inside Web Release Control, remains a modular monolith, does not add general PM features, remains company-owned, and remains maintainable by at least a second technical person.

## Why Release is the central operational unit

The system’s center is **Release**, not Project and not Task.

Natural primitive:

```text
Project
→ Release
→ Release Check
→ Evidence
→ Verification
→ Gate
→ Deploy
→ Production Verification
```

A Project is the long-lived customer / site / product (Audi Türkiye, Vaillant Türkiye).  
A Release is a specific publish / change period under that Project (Website Migration — October 2026).

The Project is created once. A separate Release is created for each important go-live.

Not every small change is a Release. A Release is required or strongly indicated when the change affects URL structure, domain, migration, indexability, canonical/redirect behaviour, tracking, production infrastructure, critical templates, language/country, major redesign or content architecture, forms / lead generation, e-commerce critical flow, SEO/GEO visibility, or important customer-facing functionality.

A Release is the unit that can be READY or NO_GO. A Project cannot.

## Team vs Domain

These are different concepts and must stay different.

**Team** = the team that does the work.  
Initial teams: Backend, Frontend, Network, Content, SEO.  
Future-possible teams (not V0 expansion by stealth): UX, Analytics, QA, Design.  
Teams should not be hardcoded more than necessary.

**Domain** = the quality area the control affects.  
Initial domains: SEO, GEO, PERFORMANCE, ANALYTICS, INFRASTRUCTURE, UX, ACCESSIBILITY, SECURITY, CONTENT_QUALITY.

A control may have multiple domains. Domain does not assign ownership.

Example: “Main content is accessible in rendered HTML”  
Owner Team = Frontend. Domains = SEO, GEO.

GEO is a domain, not a team. GEO controls may be owned by Network, Frontend, Content, Backend, or SEO.

## Owner vs Reviewer

These are different concepts and must stay different.

**Owner** = the team/user responsible for implementing or remediating the control.  
**Reviewer** = the user/team that verifies the result, when verification is not purely SELF.

SEO may review a Frontend-owned canonical control without becoming its owner.

## Found By vs Owned By

These are different concepts and must stay different.

**Found By** = who detected the issue.  
**Owned By** = who must fix it.

Example: 54 pages have incorrect canonical.  
Found By = SEO. Owned By = Frontend. Domain = SEO.

Management must not see this as “SEO has 54 problems.”  
Correct framing: “SEO tarafından tespit edilen Frontend kaynaklı problem.”

Detection by SEO does not transfer ownership to SEO.

## Verification types

Every check has exactly one of:

| Type | Meaning | Example |
|---|---|---|
| `SELF` | Owner team may verify its own control | Broken image yok — Owner Frontend |
| `CROSS_TEAM` | Another user or team verifies | GA4 conversion event — Owner Frontend, Reviewer SEO |
| `SEO_GATED` | Cannot PASS without SEO approval | Migration redirect mapping — Owner Backend, Reviewer SEO |

**Priority and Verification Type are different.**  
P0 does not mean “must have SEO review.”

Bottleneck-prevention target:

- Majority of checks: `SELF`
- Selected checks: `CROSS_TEAM`
- Only truly SEO-critical checks: `SEO_GATED`

SEO’s daily work must not become hundreds of simple checkbox verifications.

## Release gate principle

Release Gate is **not** a user-selectable field.

It is calculated by the Gate Engine from real check state.

Gate states:

- `NOT_ASSESSED`
- `NO_GO`
- `AT_RISK`
- `READY`

`READY` cannot be selected, edited, or forced as a cosmetic label.

`NOT_ASSESSED` exists so a newly imported in-progress project is not falsely shown as `NO_GO` before baseline/mandatory classification is complete.

Minimum `NO_GO` rule:

- any unresolved P0 release blocker, or
- any failed P0 blocker, or
- required P0 evidence missing, or
- required P0 verification missing

`READY` requires: no unresolved release blocker; all mandatory P0 checks resolved; required P1 rules satisfied; required evidence present; required reviews completed; no mandatory check in FAIL / BLOCKED / REVIEW; baseline completed.

Deployment lifecycle is stored separately:

- `NOT_DEPLOYED`
- `DEPLOYED`
- `POST_LAUNCH_VERIFYING`
- `PRODUCTION_VERIFIED`

Gate state ≠ deployment state.

Normal deploy may be marked only when Gate = `READY`, by `PROJECT_MANAGER` or `SEO_LEAD`.

Non-READY deploy is not a silent bypass. It requires a separate `EMERGENCY_DEPLOY_OVERRIDE` with reason, open risks, two approvers (`PM + SEO Lead` or `PM + Management`), timestamp, and an explicit audit event `DEPLOYED WITH OPEN RISKS`. That operation does **not** create `READY`.

## Template / version principle

Master template and ReleaseCheck instance are **not** the same record.

When a Release is created, applicable controls are copied as a **full metadata snapshot**, not title-only.

Later template `v1.5` must not change historical releases created from `v1.4`.

Required snapshot fields: Title, Description, Owner Team, Reviewer, Domains, Priority, Verification Type, Release Blocker, Evidence Requirement, Why It Matters, Expected Result, How To Check, How To Fix, Escalation Rule, Lifecycle Phase.

If an active release’s copied metadata must change, that is an explicit release-level edit with actor, reason, and audit — not a template mutation.

Only applicable controls are instantiated. The system must not dump the entire master library into every release.

## Onboarding models

Onboarding types:

| Type | Meaning |
|---|---|
| `NEW` | New release / new work entering WRC in the normal create flow |
| `IN_PROGRESS` | Existing unfinished work imported into WRC |
| `LIVE_UNVERIFIED` | Site already in production; historical pre-launch checks are not faked |

For `IN_PROGRESS`, checks are not all forced to `NOT_STARTED`. Allowed initial states: `NOT_STARTED`, `IN_PROGRESS`, `DONE_NEEDS_VERIFICATION`, `BLOCKED`, `N/A`.

`DONE_NEEDS_VERIFICATION` is **not** `PASS`.

A `baseline_at` timestamp is recorded. The system does not invent history. Audit states that previous execution existed outside WRC.

Baseline is classified by the owning teams:

- Backend classifies Backend controls
- Frontend classifies Frontend controls
- Network classifies Network controls
- Content classifies Content controls
- SEO classifies only its own controls and required verifications

SEO does not fill the whole baseline.

For `LIVE_UNVERIFIED`, production-verification controls run. Success may produce `PRODUCTION_VERIFIED`. Pre-launch history is not fabricated as PASS.

## Post-launch verification principle

Successful deploy is **not** production verification.

Flow:

```text
READY → DEPLOYED → POST_LAUNCH_VERIFYING → PRODUCTION_VERIFIED
```

Checkpoints exist and are not all mandatory for every project:

- `RELEASE_DAY`
- `T_PLUS_24H`
- `T_PLUS_7D`

`PRODUCTION_VERIFIED` may occur only when the required post-launch checkpoints are complete. It is not a cosmetic label.

A `PRODUCTION_VERIFIED` release cannot be changed by normal users. Change requires `Reopen Release` with reason, actor, timestamp, and audit.

## Audit principle

Audit is append-only evidence, not decoration.

Minimum fields: Actor, Timestamp, Entity, Action, Old Value, New Value, Reason.

Audit events are not hard-deleted and are not silently overwritten. `updatedAt` is not a substitute for audit history.

Production Project / Release history is archived, not hard-deleted. Users are deactivated, not deleted. After activation, a ReleaseCheck is not silently hard-deleted; if needed it becomes `REMOVED_FROM_SCOPE` with reason and audit.

## Evidence principle

Evidence types: `URL`, `TEXT`, `SCREENSHOT`, `FILE`, `EXTERNAL_TICKET`, `TEST_RESULT`.

If evidence is required, the control cannot PASS without it.

> “Yaptım” evidence değildir.

Evidence files are not publicly downloadable. Download requires an authenticated user plus a permission check. File metadata lives in the database. V0 storage may be persistent mounted storage.

## SEO role

SEO Lead is a full operational user responsible for SEO/GEO quality standards.

SEO Lead **can**: view all projects/releases/checks; change owner/reviewer/priority; reopen; fail; verify; manage blockers; waive; override; manage templates; manage SEO/GEO rules.

SEO Lead **is not** the person who completes other teams’ normal required controls in their place.

SEO’s full authority exists so SEO can govern the system when needed — not so SEO becomes the default executor of SEO-impacting work.

SEO defines standards, makes critical SEO/GEO decisions, verifies required controls, corrects wrong ownership, and may override/reopen — without absorbing Backend, Frontend, Network, or Content ownership.

SEO Lead ≠ System Admin. The same human may hold both roles in the pilot, but the system-level distinction remains.

## Management role

Management is a **read-only** executive view.

Management’s question is: “Site yayına çıkabilir mi?”

Management sees gate, P0/P1 counts, and main owner risk — not a technical junkyard.

Management cannot modify operational data.

The only specified Management write-adjacent exception in the Product Sheet is participation as Approver 2 on `EMERGENCY_DEPLOY_OVERRIDE` (`PM + Management`). That exception does not make Management an operational editor.

## Golden Scenario

Named V0 Golden Scenario (`AGENTS.md` / `GOKHAN_GATE.md`), which must work end-to-end or V0 is not complete:

1. Create a release.
2. Frontend user logs in.
3. Frontend sees their assigned checks.
4. Frontend completes a P0 check.
5. Frontend attaches required evidence.
6. Frontend submits it for review.
7. SEO sees the review.
8. SEO fails it.
9. Frontend corrects and resubmits it.
10. SEO passes it.
11. Release gate recalculates.
12. Another Network P0 blocker keeps the release `NO_GO`.
13. Network blocker is resolved.
14. Gate automatically becomes `READY`.
15. Management user sees `READY` and zero blockers.
16. Full audit history remains available.

Project Sheet §90 extends this into the official manual acceptance test with project creation, template instantiation, cross-team edit denial, PM marking `DEPLOYED`, post-launch checks, `PRODUCTION_VERIFIED`, and Management read-only history. If that scenario does not work, V0 is not complete.

V0 is not “many screens exist.” V0 is this vertical slice plus the required V0 capabilities in §85 and §113.

---

# PART 2 — REQUIREMENT TRACEABILITY MATRIX

Coverage rule: every numbered Product Sheet section appears.  
No section is silently treated as irrelevant.  
V0 classification follows `PROJECT_SHEET.md` §85–§87, §103–§104, §113. V0 scope is not expanded.

V0 Relevance values:

- `REQUIRED_V0` — needed for the V0/pilot Golden Scenario or listed V0 must-have / DoD
- `SUPPORTING_V0` — constrains V0 or must be represented, but is not itself a new V0 feature
- `FUTURE` — explicitly later
- `EXPLICITLY_OUT_OF_SCOPE` — Product Sheet forbids building this as WRC

| Project Sheet Section | Requirement / Principle | V0 Relevance | Expected Implementation Destination | Risk if Missed |
|---|---|---|---|---|
| §0 Executive Summary | WRC is release-quality governance; SEO is not the default fixer of SEO-impacting work | SUPPORTING_V0 | Product model, role copy, ownership rules | Product is rebuilt as “SEO checklist tool” |
| §1 Problem Statement | Prevent ownership fog, unverified “done”, duplicate checklists, invisible release risk | SUPPORTING_V0 | Ownership, SSoT views, gate, management view | Same organizational failure mode continues |
| §2 Product Goal | System must answer the 14 release-quality questions objectively | REQUIRED_V0 | ReleaseCheck, Evidence, Review, Gate, Audit | Feature set drifts to task tracking |
| §3 What WRC will not do | Not Jira / not checklist-only / not general PM | EXPLICITLY_OUT_OF_SCOPE | Scope guard; do not implement listed features | WRC becomes generic PM |
| §4 ADR — Why custom | Custom modular monolith; revert conditions if it becomes checklist/PM/black box | SUPPORTING_V0 | Architecture constraint, maintainer/docs/ops | Wrong platform or unjustified complexity |
| §5 Main domain model | Release is the center; Project→Release→Checks→Gate→Deploy→Prod Verified | REQUIRED_V0 | Domain model | Task or Project becomes the aggregate root |
| §6 Project vs Release | Project is long-lived; Release is a publish period | REQUIRED_V0 | Project, Release | One project-wide checklist; no release gate |
| §7 Release creation criteria | Not every change is a Release; SEO/infra/URL/migration/etc. trigger Release | SUPPORTING_V0 | Release create guidance / release type | Either noise releases or skipped governance |
| §8 Team vs Domain | Team does work; Domain is quality area; multi-domain allowed | REQUIRED_V0 | Team, Domain, ReleaseCheck | SEO domain ⇒ SEO owner |
| §9 Organization roles | TEAM_MEMBER, SEO_LEAD, PROJECT_MANAGER, MANAGEMENT, SYSTEM_ADMIN; SEO_LEAD ≠ SYSTEM_ADMIN | REQUIRED_V0 | AuthZ / Role | Role collapse; admin/SEO confusion |
| §10 SEO Lead authority | Full operational access without absorbing other teams’ required work | REQUIRED_V0 | AuthZ, check execution rules | SEO becomes executor or loses governance |
| §11 Permission matrix | Capability matrix; server-side enforce; UI hide is insufficient | REQUIRED_V0 | AuthZ, server actions/API | Frontend-only RBAC |
| §12 Verification model | SELF / CROSS_TEAM / SEO_GATED; P0 ≠ SEO review | REQUIRED_V0 | ReleaseCheck.verification_type, review rules | All work SEO-gated or nothing verified |
| §13 ReleaseCheck model | Required fields including snapshot, owner, reviewer, found_by, blocker, evidence, education fields | REQUIRED_V0 | ReleaseCheck entity | Incomplete check; lost distinctions |
| §14 Master Control model | Library metadata including applicability, escalation, lifecycle | REQUIRED_V0 | TemplateControl / Master Control | Weak templates; missing teaching layer |
| §15 Education layer | Why / Expected / How to Check / How to Fix / Escalate on the same screen | REQUIRED_V0 | Check detail UI + snapshot fields | Checkbox-only product |
| §16 Status state machine | NOT_STARTED→IN_PROGRESS→REVIEW→PASS; FAIL/BLOCKED/N/A/WAIVED; FAIL→IN_PROGRESS→REVIEW→PASS | REQUIRED_V0 | ReleaseCheck workflow | Illegal or missing transitions |
| §17 N/A | Reason + actor + timestamp; P0 N/A only authorized | REQUIRED_V0 | ReleaseCheck workflow, AuthZ | Silent skip of P0 controls |
| §18 WAIVED | Reason + risk + actor + timestamp; not silent PASS; may be accepted risk | REQUIRED_V0 | ReleaseCheck workflow, Gate Engine | False PASS or untracked risk |
| §19 Priority | P0–P3; owner cannot unilaterally downgrade own P0/P1 | REQUIRED_V0 | ReleaseCheck.priority, AuthZ | Hidden blockers via priority drop |
| §20 Found By ≠ Owned By | Detection ≠ ownership; reporting by owner team | REQUIRED_V0 | ReleaseCheck found_by / owner, reporting | SEO blamed for others’ defects |
| §21 Blocked model | Blocked By + Reason required; SEO blocker only when SEO actually blocks | REQUIRED_V0 | ReleaseCheck blocked_by, Gate | Fake SEO blockers; missing dependency |
| §22 Evidence | Types + required-evidence blocks PASS; “I did it” is not evidence | REQUIRED_V0 | Evidence, PASS validator | False PASS |
| §23 Release Gate | Calculated gate vs separate deployment lifecycle | REQUIRED_V0 | Gate Engine, Release states | Manual READY; mixed deploy/gate |
| §24 NOT_ASSESSED | New / incomplete baseline / unclassified mandatory controls | REQUIRED_V0 | Gate Engine, onboarding | False NO_GO on import |
| §25 NO_GO | Unresolved/failed P0 blocker or missing P0 evidence/verification | REQUIRED_V0 | Gate Engine | False READY |
| §26 AT_RISK | No open P0 but unresolved P1 / pending review / missing evidence / important non-blocking issue | REQUIRED_V0 | Gate Engine | Binary go/no-go; lost risk signal |
| §27 READY | Mandatory conditions; not manually changeable | REQUIRED_V0 | Gate Engine | Cosmetic READY |
| §28 Deployment authority | Mark deployed only if READY, by PM or SEO Lead; record who/when/note/ref | REQUIRED_V0 | Deployment action, AuthZ, Audit | Uncontrolled or unattributed deploy |
| §29 Emergency deploy override | Separate operation; 2 approvers; audit DEPLOYED WITH OPEN RISKS; does not create READY | REQUIRED_V0 | Emergency override, Audit, Gate (unchanged) | Silent bypass of gate |
| §30 Post-launch verification | READY→DEPLOYED→POST_LAUNCH_VERIFYING→PRODUCTION_VERIFIED | REQUIRED_V0 | Deployment state machine, checkpoints | Deploy treated as verified |
| §31 Verification checkpoints | RELEASE_DAY, T+24H, T+7D; not all mandatory per project | REQUIRED_V0 | VerificationCheckpoint, post-launch checks | Missing post-launch model |
| §32 PRODUCTION_VERIFIED | Only after required checkpoints; not cosmetic | REQUIRED_V0 | Gate/deploy derivation | False production verified |
| §33 New release flow | Project→type→modules→date→generate checks→default assignments→review scope→activate | REQUIRED_V0 | Release create flow | Manual ad-hoc checklists |
| §34 Release scope questions | Applicable modules only; no indiscriminate master dump | REQUIRED_V0 | ReleaseScope, template instantiation | Duplicate/irrelevant controls |
| §35 Onboarding types | NEW / IN_PROGRESS / LIVE_UNVERIFIED | REQUIRED_V0 | Release onboarding | Forced fake history or unusable import |
| §36 IN_PROGRESS | Allowed initial states; DONE_NEEDS_VERIFICATION ≠ PASS | REQUIRED_V0 | Onboarding, workflow | Imported work auto-PASS |
| §37 Baseline | baseline_at recorded; history not invented | REQUIRED_V0 | Baseline, Audit | Fabricated audit/history |
| §38 Baseline responsibility | Each team classifies its own controls; SEO does not fill all | REQUIRED_V0 | Onboarding UX + AuthZ | SEO becomes onboarding bottleneck |
| §39 LIVE_UNVERIFIED | No fake pre-launch PASSes; run production verification | REQUIRED_V0 | Onboarding, post-launch | Fake historical PASS |
| §40 Project team mapping | Default users per team; auto-applied; release-level override | REQUIRED_V0 | ProjectTeamAssignment, ReleaseTeamAssignment | Unassigned checks; manual chaos |
| §41 Template versioning | Snapshot at create; later template versions do not mutate past releases | REQUIRED_V0 | TemplateVersion, ReleaseCheck snapshot | Historical meaning rewritten |
| §42 Full snapshot rule | Snapshot all listed master metadata, not title only | REQUIRED_V0 | ReleaseCheck.template_control_snapshot | Past releases silently change meaning |
| §43 Template modules | BASE, BACKEND, FRONTEND, NETWORK, CONTENT, SEO, GEO, ANALYTICS, MIGRATION, MULTILINGUAL, ECOMMERCE, POST_LAUNCH | REQUIRED_V0 | Template modules / ReleaseScope | Missing scope families |
| §44 Master library BASE | Seed controls BASE-001–010 with owners/priorities/verification | REQUIRED_V0 | Seed / Master Control Library | Empty or invented V0 checklist |
| §45 Master library BACKEND | Seed BE-001–020; SEO-domain items can be Backend-owned | REQUIRED_V0 | Seed / Master Control Library | Redirect/sitemap work assigned to SEO |
| §46 Master library FRONTEND | Seed FE-001–032; canonical/content-render owned by Frontend | REQUIRED_V0 | Seed / Master Control Library | Frontend SEO-impacting work owned by SEO |
| §47 Master library NETWORK | Seed NET-001–025; crawler access owned by Network | REQUIRED_V0 | Seed / Master Control Library | Bot-block issues dumped on SEO |
| §48 Master library CONTENT | Seed CNT-001–030; content quality owned by Content | REQUIRED_V0 | Seed / Master Control Library | Content defects owned by SEO |
| §49 Master library SEO | Seed SEO-001–027; strategy/indexability owned by SEO | REQUIRED_V0 | Seed / Master Control Library | SEO strategy controls missing or mis-owned |
| §50 Master library GEO | GEO is not a team; owners vary; GEO-001–020 | REQUIRED_V0 | Seed / Master Control Library | GEO treated as SEO-owned team |
| §51 Master library ANALYTICS | Seed ANL-001–010; often Frontend/SEO CROSS_TEAM | REQUIRED_V0 | Seed / Master Control Library | Tracking holes or SEO-only ownership |
| §52 Master library MIGRATION | Seed MIG-001–015 | REQUIRED_V0 | Seed / Master Control Library | Migration releases under-controlled |
| §53 Master library MULTILINGUAL | Seed ML-001–008 | REQUIRED_V0 | Seed / Master Control Library | Hreflang/language defects unowned |
| §54 Master library POST LAUNCH | Seed POST-001–020 by checkpoint | REQUIRED_V0 | Seed / VerificationCheckpoint | Deploy = done |
| §55 Single source of truth | One control record; different views: do / review / status / risk | REQUIRED_V0 | ReleaseCheck views, not copied checklists | Duplicate controls per team |
| §56 UI routes | Single app; /dashboard /projects /releases /checks /my-checks /reviews /templates /admin | REQUIRED_V0 | App routes | Per-team apps or missing work queues |
| §57 Dashboard Team Member | “What do I need to do?” My/Returned/Blocked/Due Soon | REQUIRED_V0 | Team dashboard, My Checks | Users cannot find their work |
| §58 Dashboard SEO | Awaiting SEO Review, P0, fails, SEO/GEO domain, open releases. Repeated Issues widget exists in the mock but is TIER 3 / not a V0-dashboard must (§87, §99) | REQUIRED_V0 | SEO dashboard, Reviews | SEO cannot govern; or SEO inbox is everything |
| §59 Dashboard PM | What blocks release and who is waiting | REQUIRED_V0 | PM dashboard | Coordination without owner visibility |
| §60 Dashboard Management | Can it go live? Read-only table of gate/P0/P1/owner risk | REQUIRED_V0 | Management view, AuthZ | Management edits ops data or sees noise |
| §61 Release screen | Gate + deployment + counts; tabs; team/domain/priority/status filters | REQUIRED_V0 | Release UI | Gate and ownership invisible |
| §62 Check detail screen | Owner/domain/priority/verification/status + education + role actions | REQUIRED_V0 | Check detail UI, AuthZ | Actions leak across roles |
| §63 Audit log | Append-only; actor/time/entity/action/old/new/reason | REQUIRED_V0 | AuditEvent | Unreconstructable history |
| §64 Delete / archive | Archive project/release; deactivate user; REMOVED_FROM_SCOPE; never hard-delete audit | REQUIRED_V0 | Persistence / lifecycle | Lost production history |
| §65 Verified release lock | PRODUCTION_VERIFIED immutable without Reopen Release + reason | REQUIRED_V0 | Release lock, Audit | Silent rewrite of verified history |
| §66 Fail reasons | Schema categories required; V0 UI optional | SUPPORTING_V0 | ReleaseCheck.fail_reason schema | Future reporting blocked; not a V0 UI must |
| §67 Result source | MANUAL / AUTOMATION / API / CRAWLER; V0 mainly MANUAL | SUPPORTING_V0 | ReleaseCheck.result_source | Future automation harder; do not build crawler |
| §68 Technical architecture | Next.js modular monolith + PostgreSQL + evidence storage + Docker Compose | REQUIRED_V0 | Application architecture | Microservices / split repos |
| §69 Technical stack | Canonical stack; no k8s/redis/kafka/event bus/split FE-BE repos | REQUIRED_V0 | Stack constraint | Complexity budget breach |
| §70 Authentication | Auth.js; admin-created accounts; no public signup; hashed passwords; server session | REQUIRED_V0 | AuthN | Custom auth; public registration |
| §71 Authorization | Server-side capability functions listed | REQUIRED_V0 | AuthZ | UI-only permission theater |
| §72 Security requirements | HTTPS, cookies, least privilege, secrets, upload limits, CSRF, audit | REQUIRED_V0 | Security baseline | Unsafe internal app |
| §73 Evidence file security | No public path; auth + permission on download | REQUIRED_V0 | Evidence storage / download | Evidence leak or bypass |
| §74 Environments | Staging ≠ production DB/env/host/credentials | REQUIRED_V0 | Ops | Shared prod data in staging |
| §75 Database migrations | Versioned; reviewed; backup before risky; documented | REQUIRED_V0 | Migrations / ops docs | Unrecoverable schema change |
| §76 Deployment model | Git→build→image→staging→smoke→prod; unique tags; not `latest`-only | REQUIRED_V0 | Deployment | Unrollbackable prod |
| §77 Application rollback | Previous known-good image; backup if migration incompatible | REQUIRED_V0 | Rollback docs/process | Irreversible failed deploy |
| §78 Database recovery | Stop writes → assess → rollback or restore → known-good app → smoke | REQUIRED_V0 | Recovery docs | Data loss |
| §79 Backup | Daily PG + evidence; pre-deploy backup; retention 30d daily / 12w weekly | REQUIRED_V0 | Backup | Unrecoverable pilot |
| §80 Restore test | BACKUP EXISTS ≠ RESTORE VERIFIED; required before pilot production accept | REQUIRED_V0 | Restore verification | False recovery confidence |
| §81 Health & monitoring | /health (app+DB); error/authz/authn logs; restart policy | SUPPORTING_V0 | Ops endpoints/logging | Blind production failures |
| §82 Technical ownership | Company repo + infra; required docs; second maintainer; not Gökhan-laptop-only | REQUIRED_V0 | Repo, docs, hosting | Bus-factor / custom-decision violation |
| §83 Source control | Single repo; main/feature/fix; prod from controlled main; no live editing | SUPPORTING_V0 | Git workflow | Uncontrolled production edits |
| §84 Claude + Codex split | Review vs implementation lanes; no random dual-edit | SUPPORTING_V0 | Agent process | Conflicting implementation |
| §85 48-hour V0 scope | Must-have list: auth through restore test | REQUIRED_V0 | V0 backlog boundary | Missing core or extra features |
| §86 V0 out of scope | Crawler, GSC/Bing/GA4 APIs, AI, portal, notifications, advanced reports, PM, etc. | EXPLICITLY_OUT_OF_SCOPE | Do not implement | Scope creep |
| §87 Implementation priority | T0 cannot cut; T1 should not; T2 may simplify; T3 may drop; correctness > polish | SUPPORTING_V0 | Build order | Polish over invariants |
| §88 48-hour build plan | Foundation→domain→workflow→usability→accountability→pilot | SUPPORTING_V0 | Vertical-slice plan | Horizontal unfinished subsystems |
| §89 Test strategy | Gate, RBAC, workflow, snapshot, audit automated tests | REQUIRED_V0 | Test suite | Green tests, wrong product |
| §90 Manual acceptance test | 22-step real-user flow including deploy and PRODUCTION_VERIFIED | REQUIRED_V0 | E2E / Golden Scenario | False V0 completion |
| §91 Technical data model | Minimum entities listed; future entities not V0 | REQUIRED_V0 | Data model | Missing aggregates or premature future tables as product |
| §92 Data integrity invariants | 15 rules at DB/business-logic level | REQUIRED_V0 | Server rules + tests | Core invariants unenforced |
| §93 Release history integrity | No retroactive master-template mutation; explicit audited release edit only | REQUIRED_V0 | Snapshot + release-level edit | Historical rewrite |
| §94 System failure principle | Do not collapse verification levels | SUPPORTING_V0 | Status language, DoD reporting | “Tests passed” = production success |
| §95 Management reporting | Can it go live / what blocks / who owns / how many critical / target date | REQUIRED_V0 | Management dashboard | Unusable exec view |
| §96 Responsibility reporting | Open blockers counted by owning team, not by domain | REQUIRED_V0 | Reporting | SEO appears to own all SEO-domain defects |
| §97 SEO bottleneck rule | Full access ≠ all checks SEO-reviewed; majority SELF | REQUIRED_V0 | Template defaults, verification assignment | SEO bottleneck returns |
| §98 Learning KPI | First Pass Approval Rate | FUTURE | Future reporting | Do not block V0; do not build as V0 must |
| §99 Other quality KPIs | Repeated issues, loops, fail reasons, etc.; not mandatory on V0 dashboard | FUTURE | Future reporting | Scope creep if built as V0 must |
| §100 First pilot | Real in-progress SmartNet project; tests onboarding through post-launch | REQUIRED_V0 | Pilot plan | Toy-data-only V0 |
| §101 Pilot success criteria | Find own checks, cannot edit others, less SEO transfer, gate/audit/restore work | REQUIRED_V0 | Pilot acceptance | Wrong success definition |
| §102 Product success metrics | Success ≠ 100% checkboxes; fewer SEO dumps, more team ownership/knowledge | SUPPORTING_V0 | Outcome framing | Checkbox-completion KPI |
| §103 Future automation | Crawler→results→WRC→gate; crawler not in V0 | FUTURE | Future automation | Premature crawler |
| §104 Future integrations | GSC/Bing/GA4/GTM/AI/perf/notifications only after proven need | FUTURE | Future integrations | Speculative integrations |
| §105 Complexity budget | Add only if it improves release quality, ownership, verification, or release decision | SUPPORTING_V0 | Change filter | Feature sprawl |
| §106 Non-negotiable rules | 20 product rules that must never be violated | REQUIRED_V0 | Invariants, tests | Silent product mutation |
| §107 Unresolved decisions | None for V0 core; chat-only decisions are not canonical | SUPPORTING_V0 | Change control | Shadow specification |
| §108 Change management | Domain changes need impact, migration, rollback, approval | SUPPORTING_V0 | Spec versioning | Silent domain rewrite |
| §109 Project Sheet versioning | v1.1 FINAL CANONICAL; later v1.2+; old spec in git | SUPPORTING_V0 | Spec control | Lost canonical text |
| §110 One-sentence definition | Release-quality governance platform definition | SUPPORTING_V0 | Product identity | Identity drift |
| §111 Organizational sentence | Doğru ekip doğru işi doğru yapsın | SUPPORTING_V0 | Ownership model | SEO-does-all design |
| §112 V0 main goal | Real project/users/permissions/ownership/checks/evidence/review/gate/audit/deploy/restore | REQUIRED_V0 | V0 definition of success | Enterprise-platform detour |
| §113 Definition of Done V0 | Checklist of runtime, RBAC, workflows, onboarding, gate, backup/restore, real pilot | REQUIRED_V0 | V0 DoD | Partial implementation called done |
| §114 Final scope guard | Three sentences: not Jira; not SEO-does-the-work checklist; web release quality gate | REQUIRED_V0 | Scope guard | Identity collapse |
| §115 Final decision | Build custom WRC under listed conditions; else re-evaluate architecture | REQUIRED_V0 | Architecture decision record | Conditions forgotten |

**Sections traced:** 0 through 115 inclusive = **116 numbered sections**.

---

# PART 3 — BUSINESS INVARIANTS

Rules below are taken from explicit Project Sheet / AGENTS lists or are directly implied by those texts.  
No independent business rules were invented.

`TEST REQUIRED = YES` means an automated or explicit acceptance test is required by §89, §92, `AGENTS.md` Business Invariants, or V0 DoD.

| ID | RULE | SOURCE SECTION | ENFORCEMENT LOCATION | TEST REQUIRED |
|---|---|---|---|---|
| INV-001 | `READY` cannot be directly selected, edited, or manually set by any user | §23, §27, §92.1, §106.7, AGENTS invariant 1 | Gate Engine (derived state only) | YES |
| INV-002 | Gate status is calculated from actual check / evidence / review / baseline state, not stored as an authoritative editable field | §23, §92.14 | Gate Engine | YES |
| INV-003 | Unresolved or failed P0 release blocker, missing required P0 evidence, or missing required P0 verification ⇒ `NO_GO` | §25 | Gate Engine | YES |
| INV-004 | `READY` is forbidden unless: no unresolved release blocker; all mandatory P0 resolved; required P1 rules satisfied; required evidence present; required reviews completed; no mandatory check in FAIL/BLOCKED/REVIEW; baseline completed | §27 | Gate Engine | YES |
| INV-005 | Gate states (`NOT_ASSESSED` / `NO_GO` / `AT_RISK` / `READY`) are not the same as deployment states (`NOT_DEPLOYED` / `DEPLOYED` / `POST_LAUNCH_VERIFYING` / `PRODUCTION_VERIFIED`) | §23, §30 | Release state model | YES |
| INV-006 | `DEPLOYED` does not mean `PRODUCTION_VERIFIED` | §30, §32, §92.15, §106.8, AGENTS invariant 8 | Deployment state machine | YES |
| INV-007 | Normal deploy may be marked only when Gate = `READY` | §28 | Deployment command + AuthZ | YES |
| INV-008 | Non-READY deploy requires `EMERGENCY_DEPLOY_OVERRIDE`; it does not create `READY` | §29, §92.10 | Emergency deploy command, Gate Engine | YES |
| INV-009 | Emergency override requires reason, open risks, two approvers (`PM + SEO Lead` or `PM + Management`), timestamp, and audit `DEPLOYED WITH OPEN RISKS` | §29 | Emergency deploy command, Audit | YES |
| INV-010 | Only `PROJECT_MANAGER` or `SEO_LEAD` may mark deployed (under INV-007/INV-008) | §28, §11 | AuthZ | YES |
| INV-011 | `PRODUCTION_VERIFIED` may occur only after required post-launch checkpoints complete | §32, §31 | Checkpoint completion + derived state | YES |
| INV-012 | `PRODUCTION_VERIFIED` releases cannot be silently changed; change requires `Reopen Release` + reason + actor + timestamp + audit | §65, §92.2 | Release lock | YES |
| INV-013 | New / incomplete-baseline / unclassified-mandatory releases are `NOT_ASSESSED`, not automatic `NO_GO` | §24, §37 | Gate Engine, onboarding | YES |
| INV-014 | Owner and Reviewer are separate concepts and remain independently assignable | §12, §92.12, §106.3, AGENTS invariant 3 | ReleaseCheck model, AuthZ | YES |
| INV-015 | Found By and Owned By are separate concepts and remain independently assignable | §20, §92.11, §106.4, AGENTS invariant 4 | ReleaseCheck model, reporting | YES |
| INV-016 | Team and Domain are separate concepts; domain membership does not assign ownership | §8, §92.13, §106.5 | ReleaseCheck / Master Control model | YES |
| INV-017 | Priority and Verification Type are separate; P0 does not imply SEO review | §12, §19, §106.6 | ReleaseCheck model, review routing | YES |
| INV-018 | SEO full access does not transfer normal ownership of other teams’ required controls | §0, §10, §106.1, §106.2, §106.13, AGENTS invariant 5 | AuthZ + execution rules | YES |
| INV-019 | In normal flow, SEO does not complete another team’s required control in that team’s place | §0, §10, §106.13 | Check execution / ownership | YES |
| INV-020 | SEO Lead and System Admin are different roles even if one person holds both in pilot | §9, §106.15 | Role model | YES |
| INV-021 | Management cannot modify operational data | §11, §60, §106.14 | AuthZ (server-side) | YES |
| INV-022 | Authorization is enforced server-side; hiding UI controls is not sufficient | §11, §71, AGENTS invariant 7 | AuthZ on every consequential command | YES |
| INV-023 | A team member cannot edit another team’s check | §11, §89 RBAC | AuthZ `canEditCheck` | YES |
| INV-024 | Owner user cannot unilaterally downgrade their own control from P0/P1 | §19, §11, §89 | AuthZ `canChangePriority` | YES |
| INV-025 | `SEO_GATED` cannot PASS without SEO verification | §12, §92.7 | Review / PASS validator | YES |
| INV-026 | If evidence is required, PASS is forbidden without required evidence | §22, §92.6, §106.9, AGENTS invariant 6 | PASS validator, Evidence | YES |
| INV-027 | “Yaptım” / status change without evidence object is not evidence | §22 | Evidence model | YES |
| INV-028 | Unauthorized status transitions are forbidden | §16, §92.5 | Workflow engine + AuthZ | YES |
| INV-029 | `BLOCKED` cannot be saved without Blocked By and Block Reason | §21, §92.8, §89 | Workflow validator | YES |
| INV-030 | `WAIVED` cannot be saved without Reason, Risk explanation, Waived by, Timestamp | §18, §92.9 | Workflow validator | YES |
| INV-031 | `WAIVED` is not a silent `PASS` | §18, §106.9 | Status model, Gate Engine | YES |
| INV-032 | `N/A` requires reason, actor, timestamp; P0 `N/A` only by authorized users | §17 | Workflow validator, AuthZ | YES |
| INV-033 | `DONE_NEEDS_VERIFICATION` is not `PASS` | §36 | Onboarding / status model | YES |
| INV-034 | A single control is not copied into multiple team checklists; one record, role-specific views | §55, §106.12, AGENTS invariant 10 | Template instantiation, queries/views | YES |
| INV-035 | Template changes do not mutate existing release instances / snapshots | §41, §42, §92.4, §106.11, AGENTS invariant 2 | TemplateVersion vs ReleaseCheck snapshot | YES |
| INV-036 | ReleaseCheck snapshot includes the full metadata list in §42, not title only | §42 | Instantiation | YES |
| INV-037 | After activation, ReleaseCheck is not silently hard-deleted; use `REMOVED_FROM_SCOPE` + reason + audit | §64 | Persistence / audit | YES |
| INV-038 | Active-release historical metadata changes require explicit release-level edit + actor + reason + audit | §93 | Release-level edit command | YES |
| INV-039 | Only applicable controls are instantiated for the selected modules / release type | §34, §33 | Template instantiation | YES |
| INV-040 | Audit history is append-only and cannot be silently overwritten or hard-deleted | §63, §64, §92.3, §106.10, AGENTS invariant 9 | AuditEvent writer / storage | YES |
| INV-041 | Production Project and Release records are archived, not hard-deleted | §64, §106.20 | Persistence | YES |
| INV-042 | Users are deactivated, not deleted | §64 | User lifecycle | YES |
| INV-043 | System does not invent execution history that happened outside WRC | §37, §39 | Onboarding / baseline | YES |
| INV-044 | Baseline is classified by owning teams; SEO does not solo-fill other teams’ baseline | §38 | Onboarding AuthZ / UX | YES |
| INV-045 | `LIVE_UNVERIFIED` must not fabricate pre-launch PASS history | §39 | Onboarding | YES |
| INV-046 | Evidence files are not publicly addressable; download requires authentication and permission | §73 | Evidence download | YES |
| INV-047 | No public self-registration | §70, §72 | AuthN | YES |
| INV-048 | WRC must not become a general project-management system | §3, §4, §86, §106.16, §114 | Scope guard | YES — scope/review, not a runtime unit test alone |
| INV-049 | Release, not Project or Task, is the operational unit that the gate evaluates | §5, §6 | Domain model, Gate Engine | YES |
| INV-050 | Majority of controls must be `SELF`; only truly SEO-critical controls are `SEO_GATED` | §97 | Master library defaults / template design | YES — seed/library review + bottleneck test |
| INV-051 | Responsibility reporting counts blockers by owning team, not by domain or finder | §20, §96 | Reporting queries | YES |
| INV-052 | Verification levels must not be collapsed (`TECHNICALLY TESTED` ≠ `PRODUCTION VERIFIED` ≠ `END-GOAL ACHIEVED`; `BACKUP EXISTS` ≠ `RESTORE VERIFIED`) | §80, §94, §106.18, §106.19 | Status language, ops acceptance | YES — acceptance/process |
| INV-053 | Staging and production must not share database, credentials, or hostnames | §74 | Environment configuration | YES — ops check |
| INV-054 | Secrets are not committed to git; production admin access is restricted | §72 | Security / repo policy | YES — review |
| INV-055 | UI polish must not be traded for core correctness | §87, §106.17 | Implementation priority | YES — process/review |

---

# PART 4 — ACTORS AND RESPONSIBILITIES

Actors below are the **teams / roles named in the task**.  
System roles from §9 still apply: Backend/Frontend/Network/Content users are `TEAM_MEMBER`; SEO below is the SEO function (`SEO_LEAD` has the full SEO matrix; an SEO team member is not specified as a weaker SEO role). `SYSTEM_ADMIN` is omitted from columns but remains a distinct role.

Legend:

- **Normal ownership:** default owner of implementation / remediation
- **Review authority:** may PASS/FAIL as reviewer when assigned, or by role
- **Escalation authority:** may change owner/reviewer/priority, reopen, waive, override, manage blockers
- **Read visibility:** what they may view
- **Administrative authority:** project/release/template/user/system administration

| Actor | Normal ownership | Review authority | Escalation authority | Read visibility | Administrative authority |
|---|---|---|---|---|---|
| **Backend** | Backend-owned ReleaseChecks (API, redirects implementation, sitemap generation, server status, deleted-resource policy, etc.) | `SELF` on own checks; `CROSS_TEAM` only if assigned reviewer | None for P0/P1 downgrade, reopen, owner change. May Block with reason. Escalate to SEO only when strategy is undefined — not because Backend work is unfinished | Own checks; other teams View | None |
| **Frontend** | Frontend-owned ReleaseChecks (canonical render, titles/H1 render, critical content in HTML, forms UI, production assets, etc.) | `SELF` on own checks; assigned `CROSS_TEAM` if designated | Same as Backend: execute, evidence, submit review, block. Cannot take SEO’s review role unless assigned | Own checks; other teams View | None |
| **Network** | Network/infra-owned ReleaseChecks (DNS, SSL, CDN, WAF/crawler access, robots staleness at edge, backup/restore infra, etc.) | `SELF` on own infra checks; assigned cross-team where specified | Same TEAM_MEMBER limits. Crawler-block issues stay Network-owned even if Found By = SEO | Own checks; other teams View | None |
| **Content** | Content-owned ReleaseChecks (completeness, placeholders, H1 meaning, slugs if CMS, alt text, internal link targets, GEO factual/first-party content, etc.) | `SELF` on own checks; assigned `CROSS_TEAM` | Same TEAM_MEMBER limits. Technical SEO fields remain SEO-gated (CNT-030) but Content still owns content entry | Own checks; other teams View | None |
| **SEO** | Owns **SEO strategy / SEO-standard / SEO-owned library items** (robots policy, indexability strategy, canonical strategy, hreflang strategy, GSC verification, migration mapping authorship, SEO-owned GEO items). Does **not** become default owner of every SEO-domain or GEO-domain control | Reviews assigned `CROSS_TEAM` and all `SEO_GATED`. May Fail / Verify / Reopen. Must not be routed every `SELF` check | Full: change owner, reviewer, priority; manage blockers; waive; override; reopen. Used to correct wrong ownership, not to absorb work | All projects, releases, checks | Create project/release; mark deployed; manage templates and SEO/GEO rules. Not System Settings / not the only user-admin path |
| **Project Manager** | Owns BASE/PM controls (scope, date, assignments, communication/escalation, module selection). Coordinates; does not become technical owner of team checks | May review (matrix ✓). Not a substitute for required SEO_GATED SEO verification | Change owner/reviewer/priority; reopen; fail; limited override/waive/templates. Mark deployed when READY | All operational release data | Create project/release; limited user administration; limited template management. Not System Settings |
| **Management** | None | None | None as operational editor. Specified exception: may be Approver 2 on emergency deploy (`PM + Management`) | Read-only: gate, P0/P1, main owner risk, activity/history | None |

## Anti-pattern this matrix exists to prevent

SEO-impacting ≠ SEO-owned.

| Symptom | Forbidden interpretation | Required interpretation |
|---|---|---|
| Canonical wrong | SEO owns it because Domain = SEO | Owner = Frontend; Reviewer = SEO when `SEO_GATED` |
| Redirect missing | SEO ticket | Owner = Backend; SEO reviews mapping |
| Googlebot 403 | SEO incident | Owner = Network; Found By may be SEO |
| H1 / alt / copy wrong | SEO content task | Owner = Content |
| Canonical strategy unclear | Frontend blocked by itself | Owner may stay Frontend; Blocked By = SEO if strategy is undefined |
| 54 canonical defects | “SEO has 54 problems” | Found By SEO, Owned By Frontend |

SEO dashboard widgets (Awaiting SEO Review, P0 Blockers, SEO/GEO Domain) must not be implemented as “every SEO-domain check is SEO’s to-do list.” Domain filters are risk lenses. My Checks / owner queues are execution lenses.

---

# PART 5 — CORE DOMAIN CONCEPTS

Do not collapse these because collapse would simplify implementation.

| NAME | MEANING | NOT THE SAME AS | IMPORTANT RELATIONSHIPS |
|---|---|---|---|
| **WRC** | Web release-quality gate / governance system | Jira, generic task manager, checklist app, crawler, CMS | Evaluates Releases, not development backlogs |
| **Project** | Long-lived customer / site / product | Release; Task | Has many Releases; holds default team mapping |
| **Release** | Specific publish/change period under a Project; central operational unit | Project; development sprint; single check | Instantiates ReleaseChecks from a TemplateVersion; has Gate + Deployment states |
| **ReleaseCheck** | One instantiated control on one Release, with snapshot + execution + verification | TemplateControl; Master Control; a Jira ticket | Belongs to one Release; one Owner Team; optional Reviewer; zero-or-more Evidence; contributes to Gate |
| **Master Control / TemplateControl** | Reusable control definition in the library | ReleaseCheck instance | Versioned via TemplateVersion; snapshotted at instantiation |
| **Template** | Named control set family (e.g. Corporate Website) | A live Release | Has versions; selected by release type/modules |
| **TemplateVersion** | Immutable published version of a template | Live mutable checklist shared by all releases | Release binds to the version used at creation |
| **Template snapshot** | Frozen master metadata copied onto ReleaseCheck | Live join to current master row | Protects historical meaning |
| **Team** | Who does the work | Domain; Role | Owner Team on controls; Backend/Frontend/Network/Content/SEO |
| **Domain** | Quality area affected | Team; Owner | Many-to-many on a control; reporting lens |
| **Owner / Owned By** | Who must implement or fix | Reviewer; Found By; Domain | Default from master; overridable by SEO/PM |
| **Reviewer** | Who verifies when not purely informal SELF | Owner | Required for CROSS_TEAM / SEO_GATED |
| **Found By** | Who detected the issue | Owned By | Independent field; used in reporting |
| **Role** | TEAM_MEMBER / SEO_LEAD / PROJECT_MANAGER / MANAGEMENT / SYSTEM_ADMIN | Team | Capabilities in §11 |
| **SEO Lead** | Full operational SEO/GEO governor | System Admin; Owner of all SEO-domain work | Access ≠ ownership |
| **System Admin** | Technical system administration | SEO Lead | System settings, user administration |
| **Verification Type** | SELF / CROSS_TEAM / SEO_GATED | Priority; Domain | Routes who can create PASS |
| **Priority** | P0–P3 risk class | Verification Type; release_blocker flag (related but separately stored) | P0 = critical / release blocker class |
| **Release Blocker** | Whether this control can hold the gate | Priority; Blocked status | Input to Gate Engine |
| **Status (check)** | NOT_STARTED / IN_PROGRESS / REVIEW / PASS / FAIL / BLOCKED / N/A / WAIVED (+ onboarding/scope states) | Gate state; Deployment state | Workflow in §16 |
| **READY** | Derived gate value: release may be deployed under normal rule | DEPLOYED; user-picked status; WAIVED | Never user-set |
| **DEPLOYED** | Deployment was marked | READY; PRODUCTION_VERIFIED | Requires READY or emergency override |
| **PRODUCTION_VERIFIED** | Required post-launch checkpoints completed | DEPLOYED; STAGING VERIFIED; tests passed | Locks the release |
| **NOT_ASSESSED** | Gate not yet calculable honestly | NO_GO | Used on new/incomplete baseline |
| **NO_GO** | Calculated unsafe-to-ship | AT_RISK; NOT_ASSESSED | P0 / missing P0 evidence or verification |
| **AT_RISK** | No open P0, but remaining risk | READY; NO_GO | P1 / pending review / missing evidence / non-blocking issues |
| **NOT_DEPLOYED** | Deployment lifecycle start | NOT_ASSESSED | Independent of gate |
| **POST_LAUNCH_VERIFYING** | After deploy, checkpoints running | PRODUCTION_VERIFIED | §30 |
| **VerificationCheckpoint** | RELEASE_DAY / T+24H / T+7D window | Gate state | Not all required on every project |
| **Evidence** | URL/TEXT/SCREENSHOT/FILE/EXTERNAL_TICKET/TEST_RESULT artifact | Note; “done” checkbox; audit timestamp | May be required for PASS |
| **Review** | Verification decision on a submitted check | Execution; ownership | Produces PASS/FAIL (and audit) |
| **BLOCKED** | Check cannot proceed; dependency recorded | WAIVED; N/A; SEO ownership | Requires Blocked By + Reason |
| **N/A** | Control not applicable to this release | WAIVED; PASS | Reason + actor + time |
| **WAIVED** | Conscious accepted risk / not performing the control | PASS; N/A | Reason + risk + actor + time |
| **DONE_NEEDS_VERIFICATION** | Imported work claimed done outside WRC, not yet verified | PASS | IN_PROGRESS onboarding only |
| **REMOVED_FROM_SCOPE** | Explicit audited removal after activation | Hard delete; N/A | Reason + audit |
| **ARCHIVED** | Soft-end of Project or Release | Hard delete | History retained |
| **DEACTIVATED** | User no longer active | Deleted user | History retained |
| **Baseline / baseline_at** | Point WRC starts knowing an in-progress release | Invented historical PASS | Audit discloses outside history |
| **Onboarding type** | NEW / IN_PROGRESS / LIVE_UNVERIFIED | Gate state; Deployment state | Changes allowed initial check states |
| **LIVE_UNVERIFIED** | Already-live site without trusted pre-launch WRC history | NEW release; PRODUCTION_VERIFIED | Uses production verification path |
| **ProjectTeamAssignment** | Default users per team on a Project | ReleaseCheck owner snapshot | Copied, then overridable on Release |
| **ReleaseTeamAssignment** | Release-level owner mapping | Project default | Overrides project defaults |
| **ReleaseScope** | Selected modules / applicability answers | Full master library | Filters instantiation |
| **Module** | BASE/BACKEND/FRONTEND/NETWORK/CONTENT/SEO/GEO/ANALYTICS/MIGRATION/MULTILINGUAL/ECOMMERCE/POST_LAUNCH | Team | Applicability, not ownership |
| **Lifecycle Phase** | When the control applies (pre-launch / post-launch / etc.) | Status | Snapshot field |
| **Education fields** | Why It Matters, Expected Result, How To Check, How To Fix, Escalation | The pass/fail result | Copied onto every check |
| **Escalation Rule** | When to escalate (e.g. strategy unclear → SEO) | Transfer of ownership | Does not auto-reassign owner |
| **Fail Reason** | Categorical reason for FAIL; schema in V0, UI optional | Status FAIL itself | §66 |
| **Result Source** | MANUAL / AUTOMATION / API / CRAWLER | Verification Type | V0 mainly MANUAL |
| **Override** | SEO/PM (limited) capability to govern the system when needed | WAIVED; Emergency Deploy; SEO becoming owner | Exact effect: see Part 6 / 7 |
| **EMERGENCY_DEPLOY_OVERRIDE** | Two-person audited deploy with open risks | READY; silent bypass | Does not change gate to READY |
| **Reopen (check)** | SEO/PM/Admin returns a closed check to work | Reopen Release | Check-level |
| **Reopen Release** | Unlocks a PRODUCTION_VERIFIED release | Check reopen | Release-level + audit |
| **AuditEvent** | Append-only reconstruction record | `updatedAt`; notes | Actor/action/old/new/reason/time |
| **SSoT view** | Same ReleaseCheck shown as Do / Review / Status / Risk | Duplicated per-team copies | §55 |
| **First Pass Approval Rate** | Learning KPI: passed first review / submitted | Gate READY; checkbox completion | FUTURE dashboard |
| **TECHNICALLY TESTED** | Automated/static checks passed | LIVE VERIFIED; PRODUCTION VERIFIED; END-GOAL ACHIEVED | GOKHAN_GATE / §94 |
| **RESTORE VERIFIED** | Restore actually exercised | BACKUP EXISTS | §80 |
| **Golden Scenario** | Required end-to-end V0 acceptance path | “Many screens exist” | AGENTS + §90 |

Required distinctions that must survive implementation:

```text
Team        ≠ Domain
Owner       ≠ Reviewer
Found By    ≠ Owned By
TemplateControl ≠ ReleaseCheck
READY       ≠ DEPLOYED
DEPLOYED    ≠ PRODUCTION_VERIFIED
Priority    ≠ Verification Type
WAIVED      ≠ PASS
DONE_NEEDS_VERIFICATION ≠ PASS
SEO access  ≠ SEO ownership
SEO Lead    ≠ System Admin
Gate state  ≠ Deployment state
BACKUP EXISTS ≠ RESTORE VERIFIED
Tests passed ≠ Production success
```

---

# PART 6 — STATE / WORKFLOW REQUIREMENTS

Extracted only. Not redesigned.  
Where the Product Sheet does not fully define a transition: `NEEDS_DESIGN`.

## 6.1 ReleaseCheck states

Specified states:

| State | Specified meaning |
|---|---|
| `NOT_STARTED` | Default unused control |
| `IN_PROGRESS` | Execution started |
| `REVIEW` | Submitted for verification |
| `PASS` | Verified success |
| `FAIL` | Verification rejected |
| `BLOCKED` | Cannot proceed; Blocked By + Reason required |
| `N/A` | Not applicable; reason + actor + timestamp |
| `WAIVED` | Conscious accepted risk; not silent PASS |
| `DONE_NEEDS_VERIFICATION` | Onboarding initial claim of prior completion; not PASS |
| `REMOVED_FROM_SCOPE` | Post-activation removal with reason + audit |

Specified happy path:

```text
NOT_STARTED → IN_PROGRESS → REVIEW → PASS
```

Specified fail loop:

```text
FAIL → IN_PROGRESS → REVIEW → PASS
```

Specified test transitions (§89): the happy path, `REVIEW → FAIL`, `FAIL → IN_PROGRESS`, and BLOCKED requires reason.

### NEEDS_DESIGN (check transitions)

- Whether `SELF` must enter `REVIEW` (owner self-reviews) or may go `IN_PROGRESS → PASS`. §16 shows REVIEW on the normal path; §12 says owner team may verify SELF. **Do not guess.** Conservative later choice must still prevent unauthenticated PASS and must not leave SELF checks stuck in REVIEW blocking READY.
- Legal sources of `BLOCKED` (`NOT_STARTED` / `IN_PROGRESS` / `REVIEW`?).
- `BLOCKED → IN_PROGRESS` (implied by work resuming; not drawn).
- Who may set `N/A` or `WAIVED` from which states.
- Whether `N/A` / `WAIVED` can return to `IN_PROGRESS`.
- `DONE_NEEDS_VERIFICATION → REVIEW` vs direct authorized PASS after verification.
- `PASS →` reopen target state (`IN_PROGRESS` vs `REVIEW`).
- Effect of Override on check status.
- Whether `REMOVED_FROM_SCOPE` is reachable from every state after activation.
- Whether CROSS_TEAM vs SEO_GATED use the same `REVIEW` state with different reviewer predicates (implied, not fully specified).

## 6.2 Release states

Two independent axes.

**Gate (calculated):** `NOT_ASSESSED` | `NO_GO` | `AT_RISK` | `READY`

**Deployment (lifecycle):** `NOT_DEPLOYED` | `DEPLOYED` | `POST_LAUNCH_VERIFYING` | `PRODUCTION_VERIFIED`

**Release record lifecycle:** active vs `ARCHIVED`

Specified deploy path:

```text
READY → DEPLOYED → POST_LAUNCH_VERIFYING → PRODUCTION_VERIFIED
```

Specified emergency path: deploy from `NO_GO` or `AT_RISK` via `EMERGENCY_DEPLOY_OVERRIDE` without creating `READY`.

### NEEDS_DESIGN (release transitions)

- Exact function from check-set → `AT_RISK` vs `READY` when some P1 remain (“Required P1 rules satisfied” vs “unresolved P1”).
- Whether `WAIVED` P0 counts as resolved blocker / accepted risk by default or by per-control configuration.
- Whether entering `POST_LAUNCH_VERIFYING` is automatic on `DEPLOYED` or a separate command.
- How `LIVE_UNVERIFIED` maps onto gate vs deployment axes at creation.
- `Reopen Release` from `PRODUCTION_VERIFIED`: destination gate and deployment states.
- Whether gate recalculation is synchronous on every check mutation (implied by Golden Scenario; mechanism not specified).
- Archive vs gate: does `ARCHIVED` freeze gate display?

## 6.3 Onboarding-specific states

| Item | Specified |
|---|---|
| Types | `NEW`, `IN_PROGRESS`, `LIVE_UNVERIFIED` |
| IN_PROGRESS initial check states | `NOT_STARTED`, `IN_PROGRESS`, `DONE_NEEDS_VERIFICATION`, `BLOCKED`, `N/A` |
| Baseline | `baseline_at` + audit that history existed outside WRC |
| LIVE_UNVERIFIED | No fake pre-launch PASS; production verification may yield `PRODUCTION_VERIFIED` |
| Gate during import | `NOT_ASSESSED` until baseline / mandatory classification complete |

### NEEDS_DESIGN

- Whether `WAIVED` is allowed as an IN_PROGRESS initial state (not listed).
- Who confirms baseline completion (needed for READY).
- Whether LIVE_UNVERIFIED starts `NOT_DEPLOYED` or already `DEPLOYED` / `POST_LAUNCH_VERIFYING`.

## 6.4 Review requirements

- `SELF`: owner team may verify.
- `CROSS_TEAM`: another user or team verifies; reviewer field used.
- `SEO_GATED`: cannot PASS without SEO approval.
- Permission: Team Member submits/reviews own or assigned; SEO Lead / PM / System Admin have broader review.
- Required reviews must be completed for READY.
- Pending required review contributes to AT_RISK and blocks READY.
- Golden Scenario requires FAIL then resubmit then PASS, with reason in audit.

### NEEDS_DESIGN

- Exact reviewer identity for SELF.
- Whether PM review can satisfy SEO_GATED (matrix gives PM Review ✓, but SEO_GATED text says SEO approval). **Do not guess.** Conservative reading: SEO_GATED still requires SEO.
- Multiple reviewers, reassignment mid-review.

## 6.5 Evidence requirements

- Types: URL, TEXT, SCREENSHOT, FILE, EXTERNAL_TICKET, TEST_RESULT.
- If `evidence_required`, PASS is impossible without evidence.
- Files: authenticated + authorized download; metadata in DB; V0 mounted storage allowed.
- Upload authorization, size limit, type allow-list required (§72).
- Missing required P0 evidence ⇒ NO_GO.
- Missing required evidence (non-P0) can produce AT_RISK and blocks READY.

### NEEDS_DESIGN

- Exact allow-list and size limits.
- Whether one evidence item satisfies, or type-specific minimums.
- Whether FAIL for `MISSING_EVIDENCE` is automatic or reviewer-set.

## 6.6 Blocker semantics

- `release_blocker` is a field on the control.
- P0 is defined as critical / release blocker.
- Gate NO_GO uses “unresolved P0 release blocker” and “failed P0 blocker.”
- Check status `BLOCKED` requires Blocked By ∈ {Backend, Frontend, Network, Content, SEO, Client, External} and Block Reason.
- SEO as Blocked By is valid only when SEO actually blocks (e.g. undefined canonical strategy), not when the owner has not implemented yet.
- Owner remains the implementing team while blocked.
- Blockers are visible on Release and dashboards; Management sees main owner risk.
- Unresolved release blockers block READY.

### NEEDS_DESIGN

- Independence of `priority=P0` vs `release_blocker=true` on P2/P3.
- Whether status `BLOCKED` on a P1 non-blocker yields AT_RISK only.
- Who may clear a block besides owner / SEO / PM.

## 6.7 Waiver semantics

- Conscious non-performance or accepted risk.
- Mandatory reason, risk explanation, waived by, timestamp.
- Not silent PASS.
- Gate Engine may treat as accepted risk according to configuration.
- SEO may waive; PM limited; Management cannot; Team Member cannot.

### NEEDS_DESIGN

- Default V0 configuration: does a waived P0 blocker still produce NO_GO?
- Whether waiver requires a second approver (not specified; do not invent).
- Reversibility.

## 6.8 Post-launch semantics

```text
READY → DEPLOYED → POST_LAUNCH_VERIFYING → PRODUCTION_VERIFIED
```

- Checkpoints: RELEASE_DAY, T+24H, T+7D; per-project optionality.
- POST-001–020 define seed post-launch controls.
- PRODUCTION_VERIFIED is derived from required checkpoint completion.
- Lock + Reopen Release after PRODUCTION_VERIFIED.
- LIVE_UNVERIFIED uses production verification rather than fake pre-launch.

### NEEDS_DESIGN

- Which checkpoint set is “required” per release type.
- Whether post-launch checks are ordinary ReleaseChecks in POST_LAUNCH module or a separate entity (`VerificationCheckpoint` is listed).
- Whether an open post-launch P0 can pull gate back from a previous READY after deploy (gate vs deployment interaction after go-live).

---

# PART 7 — TRUE AMBIGUITIES

Technical implementation choices are **not** product ambiguities.  
Not blockers: Prisma vs Drizzle, folder structure, component organization, CSS, form library, testing library, naming conventions.

`PROJECT_SHEET.md` §107: `NONE FOR V0 CORE PRODUCT.`

## A. MINOR — agent can safely resolve later

These do not change the product model if the simplest reversible, spec-consistent choice is taken and documented.

1. **SELF and the REVIEW box on the diagram.** Spec shows REVIEW on the normal path and also says SELF may be verified by the owner team. A reversible V0 choice is: SELF still uses the REVIEW state, and an owner-team user is the reviewer. Alternative `IN_PROGRESS → PASS` for SELF is also compatible if PASS rules (evidence, authz) still run. Either is documentable.
2. **Exact file-type allow-list and max upload size** for evidence.
3. **Password policy details** beyond “strong hashing” and Auth.js credentials.
4. **Health payload shape**, reverse-proxy choice, Docker volume layout.
5. **Due Soon** calculation if a check has no own due date (release target date is the only specified date).
6. **Fail-reason UI** (explicitly optional in V0; schema required).
7. **Escalation Rule storage** as text vs structured enum.
8. **Default timezone** (example uses Europe/Istanbul).
9. **Exact module-to-control applicability map** beyond the seed tables and scope questions.
10. **Repeated Issues widget** depth in V0 (TIER 3 may drop reporting UI).
11. **How many evidence items** satisfy `evidence_required`.
12. **Automatic vs explicit transition** into `POST_LAUNCH_VERIFYING` after DEPLOYED.
13. **Archive display** of historical gate values.
14. **Emergency override in the first vertical slice:** V0 must not allow silent non-READY deploy. Implementing “deploy only when READY” first, then emergency override before any real non-READY deploy, is consistent with §28–§29 and §85.
15. **Management as emergency Approver 2** while otherwise read-only: treat as the specified exception, not a general write grant.
16. **Team list configurability** (“should not be hardcoded more than necessary”) vs V0 seed of the five teams.
17. **ECOMMERCE module / scope question has no dedicated master-control library.** §34 and §43 name ECOMMERCE; §44–§54 provide no ECOMMERCE-* seed IDs. V0 can select the module and instantiate already-specified form, lead, frontend, backend, and analytics controls. Do not invent an ECOMMERCE library in this phase.
18. **§58 Repeated Issues widget vs §87 TIER 3 / §99.** The SEO dashboard is V0; the Repeated Issues reporting UI may be omitted in V0 without dropping the rest of the SEO dashboard.

## B. MATERIAL — different answers would change behavior, ownership, permissions, data semantics, release status, or V0 scope

These are real underspecifications. They are **not** used to invent features. Each has a conservative reading already present in the Sheet.

| Topic | Why it is material | Conservative reading already in the Sheet | Blocks V0 foundation? |
|---|---|---|---|
| **SEO_GATED vs PM Review ✓** | If PM PASS satisfies SEO_GATED, release status and SEO role change | §12: SEO_GATED cannot PASS without SEO approval. PM Review ✓ does not override that sentence | No — follow §12 |
| **“Required P1 rules satisfied” vs AT_RISK “unresolved P1”** | Changes READY vs AT_RISK | AT_RISK is the state with no P0 but unresolved P1; READY needs required P1 rules satisfied. Treat in-scope non-N/A/non-WAIVED P1 as required unless a later spec says otherwise | No — this reading is internally consistent |
| **WAIVED P0 vs NO_GO** | Changes release status | WAIVED is accepted risk, not PASS; V0 may treat waived control as not an open blocker, while still not counting it as PASS | No — must be explicit in gate tests when implemented |
| **`release_blocker` vs P0** | Could change which checks hold the gate | §19 defines P0 as release blocker; §25 keys off P0 release blockers. Do not invent P3 blockers in V0 without template data saying so | No |
| **Override vs Waive vs Emergency Deploy** | Different permission semantics | Three named operations exist. Do not merge them. V0 Golden Scenario does not require Override. Do not implement Override as “type READY” | No |
| **PM “Limited” waive / override / templates / user admin** | Changes permission surface | Implement the ✓ cells fully; treat Limited as strictly narrower than SEO Lead / System Admin and document the chosen subset | No — do not grant PM System Settings |
| **LIVE_UNVERIFIED initial deployment axis** | Changes whether a live site is shown NOT_DEPLOYED | Onboarding type ≠ gate. Do not fabricate pre-launch PASS. Gate starts NOT_ASSESSED until verification work is classified | No |
| **Post-launch P0 after READY/DEPLOYED** | Could reopen gate after go-live | Gate and deployment stay separate; PRODUCTION_VERIFIED waits on checkpoints. Do not silently keep READY if specified P0 post-launch checks fail — exact recalc is NEEDS_DESIGN, not a reason to skip post-launch | No |

### Material blocker verdict

**NO MATERIAL PRODUCT BLOCKERS FOUND.**

Rationale: §107 declares none for V0 core. Every material underspecification above has a conservative reading that preserves Release-centrality, Owner ≠ Reviewer, Found By ≠ Owned By, server-side RBAC, calculated READY, snapshot immutability, and the Golden Scenario. Those readings must be documented as assumptions when implementation starts — they must not be silently treated as new product law.

---

# PART 8 — GOLDEN SCENARIO TRACE

Traced from the named V0 Golden Scenario in `AGENTS.md` / `GOKHAN_GATE.md`, using only rules present in `PROJECT_SHEET.md`.  
No extra functionality added.

**Assumed starting fixture (not new product behavior):** a Project exists; template can generate checks; the created Release includes at least one Frontend-owned P0 check with required evidence and SEO review (`SEO_GATED` or assigned `CROSS_TEAM` to SEO), and a separate Network-owned P0 release blocker.

| Step | INPUT STATE | ACTOR | ACTION | SERVER RULE | RESULTING STATE | AUDIT EVENT | RELEASE GATE EFFECT |
|---|---|---|---|---|---|---|---|
| 1. Create a release | Project exists; actor authorized | SEO Lead or PM (§11) | Select project, type, modules, target date; generate applicable checks; apply default assignments; activate | Only applicable controls instantiated; full snapshot; default team mapping; no fabricated history | Release active; ReleaseChecks created; deployment `NOT_DEPLOYED`; gate `NOT_ASSESSED` or calculated from initial states | Release created / checks generated / activated | If mandatory P0 blockers exist and baseline/classification allows assessment → typically `NO_GO`; else `NOT_ASSESSED` |
| 2. Frontend user logs in | Admin-created Frontend TEAM_MEMBER | Frontend user | Authenticate via Auth.js session | No public signup; server-side session validation | Authenticated session | Auth success (sensitive auth failures are logged; success logging not specified — do not invent required success audit) | None |
| 3. Frontend sees assigned checks | Session + ReleaseChecks owned by Frontend | Frontend user | Open My Checks / team dashboard | `canView` own checks; other teams View-only | UI shows Frontend-owned checks only as executable work | None required | None |
| 4. Frontend completes a P0 check (execution) | Target check `NOT_STARTED` | Frontend owner | Start | `canEditCheck` only if owner team; cannot edit Backend/Network checks (§89) | `NOT_STARTED → IN_PROGRESS` | Status old→new | Recalc; still `NO_GO` if this or other P0 unresolved |
| 5. Frontend attaches required evidence | Check `IN_PROGRESS`; `evidence_required` | Frontend owner | Add Evidence (typed artifact, not “yaptım”) | Upload/authz/size/type rules; evidence linked to check | Evidence present; status still not PASS | Evidence added | Missing-P0-evidence condition cleared for this check only; other P0s may still force `NO_GO` |
| 6. Frontend submits for review | Evidence present | Frontend owner | Submit Review | `canSubmitReview` own check; cannot PASS SEO_GATED themselves | `IN_PROGRESS → REVIEW` | Status old→new | Required review now pending → not READY; `NO_GO` if still an unresolved P0 verification |
| 7. SEO sees the review | Check `REVIEW`, reviewer SEO | SEO Lead | Open Reviews / Awaiting SEO Review | SEO can view all checks; queue is reviews, not all SEO-domain work | Check visible in SEO review queue | None required | None |
| 8. SEO fails it | Check `REVIEW` | SEO Lead | Fail + reason | `canReviewCheck` / Fail; FAIL is not PASS; reason stored (category optional in V0) | `REVIEW → FAIL` | Status + reason (example: canonical points to staging) | Failed P0 blocker → `NO_GO` |
| 9. Frontend corrects and resubmits | Check `FAIL` | Frontend owner | Resume work, fix, evidence if still required, submit | Specified loop FAIL→IN_PROGRESS→REVIEW; still cannot self-PASS SEO_GATED | `FAIL → IN_PROGRESS → REVIEW` | Status transitions; evidence add if any | Still not READY |
| 10. SEO passes it | Check `REVIEW`; evidence present | SEO Lead | Pass | SEO_GATED / assigned review; required evidence enforced; server-side only | `REVIEW → PASS` | Status old→new | This P0 resolved; gate recalc |
| 11. Release gate recalculates | One Frontend P0 now PASS; Network P0 still open | System | Deterministic gate calculation | Inputs: open checks, priority, blocker rules, evidence, required review | Frontend P0 no longer holds the gate | Gate recalc may be audited; **NEEDS_DESIGN** whether gate changes themselves emit AuditEvent. Check events already exist | Remains `NO_GO` because Network P0 remains |
| 12. Network P0 keeps NO_GO | Network P0 unresolved/failed/missing evidence or verification | System (existing state) | No user “set NO_GO” | §25 minimum rule | Release stays `NO_GO` | None new | `NO_GO` |
| 13. Network blocker resolved | Network P0 open | Network TEAM_MEMBER + required reviewer if any | Complete, attach evidence if required, pass verification (`SELF` or SEO_GATED per that control) | Same evidence/review/authz rules; owner stays Network even if Found By was SEO | Network check `PASS` (or authorized N/A/WAIVED — Golden Scenario says resolved) | Status + evidence + review | Recalc |
| 14. Gate becomes READY | All mandatory READY conditions now true | System | Automatic recalculation | READY not user-selected; no mandatory FAIL/BLOCKED/REVIEW; baseline complete; required evidence/reviews present | Gate `READY`; deployment still `NOT_DEPLOYED` | If gate audit exists | `NO_GO`/`AT_RISK` → `READY` |
| 15. Management sees READY and zero blockers | Gate `READY` | Management | Open Management dashboard | Read-only server-side; cannot modify checks or set READY | View: READY, P0=0, P1 as actually remaining, Main Owner Risk empty | None | Display only |
| 16. Full audit history remains | All prior events | Any authorized viewer | Read Activity / audit | Append-only; no overwrite; no hard-delete | History reconstructible: start, evidence, submit, fail+reason, resubmit, pass, network resolution, gate path | Existing events unchanged | None |

### Project Sheet §90 acceptance steps not in the 16-step named Golden Scenario

These are still V0-required. They are not new product. They extend the same chain.

| §90 step | Mapping |
|---|---|
| Create Project | Precondition / explicit PM or SEO action |
| Template generates checks | Step 1 |
| Frontend cannot edit Backend check | Invariant INV-023; must be tested during steps 3–6 |
| PM marks DEPLOYED | After step 14; INV-007/010 |
| Post-launch checks run | `DEPLOYED → POST_LAUNCH_VERIFYING` |
| PRODUCTION_VERIFIED | After required checkpoints; INV-006/011/012 |
| Management read-only history | Step 15–16 + INV-021 |

If this chain fails, V0 is not complete even if many screens exist.

---

# PART 9 — RISK REGISTER

Highest-risk implementation mistakes. Preventive rules are product rules, not new design.

| Risk | Rating | Why it happens | Preventive design rule |
|---|---|---|---|
| WRC turns into generic task management | HIGH | Familiar PM patterns; requests for backlog/kanban/chat | Enforce §3/§86/§114. ReleaseCheck is verification of a go-live, not a development task. Refuse sprint/Gantt/timesheet/chat/wiki. Complexity budget: if it does not improve release quality, ownership, verification, or the release decision, omit it |
| SEO becomes the bottleneck again | HIGH | Domain=SEO ⇒ assign to SEO; all P0 marked SEO_GATED | Ownership from Owner Team, not Domain. Seed libraries in §44–§54. Majority SELF (§97). SEO inbox = reviews + SEO-owned controls, not all SEO-domain items. Baseline classified by each team (§38) |
| Duplicate controls per team | HIGH | “Frontend checklist” + “SEO checklist” copies | One ReleaseCheck (§55). Views differ (Do / Review / Status / Risk). Instantiation must not clone per team |
| Owner / Reviewer collapse | HIGH | Single `assignee` field | Separate `owner_user_id` / `owner_team_id` and `reviewer_user_id`. Tests that a reviewer PASS does not change owner. SEO can review Frontend canonical without owning it |
| Found By / Owned By collapse | HIGH | Single `reporter` used as owner | Separate `found_by_*` and owner fields. Management copy: “detected by SEO, owned by {team}.” Reporting by owner team (§96) |
| Frontend-only RBAC | HIGH | Buttons hidden, server trusts client | Every consequential command runs `can*` server-side (§11, §71). Tests: permitted succeeds; unauthorized fails; direct request cannot bypass UI. Management read-only on server |
| Manually editable READY | HIGH | Status dropdown includes READY | READY is derived. No API/UI write path. Tests try to set READY and must fail. Emergency deploy does not write READY |
| False PASS | HIGH | Skip evidence, skip SEO_GATED, import as done | PASS validator: evidence rule, verification type, authorized reviewer, not DONE_NEEDS_VERIFICATION. LIVE_UNVERIFIED/IN_PROGRESS must not auto-PASS |
| False READY | HIGH | Gate ignores a P0, missing evidence, pending review, or incomplete baseline | Deterministic Gate Engine with §25–§27 tests, including conflicting/boundary cases. Recalc after every material check change |
| Template changes mutate releases | HIGH | ReleaseCheck joined live to master | Snapshot at create (§41–§42). Template v2 test must not change existing ReleaseCheck snapshot. Historical edit is explicit + audited |
| Audit history overwrite | HIGH | `updatedAt` or row mutate | Append-only AuditEvent; no hard-delete; reconstruct actor/action/old/new/reason/time. Tests for critical transitions |
| Deployment treated as production verification | HIGH | One “shipped” flag | Separate deployment enum. PRODUCTION_VERIFIED only from checkpoints. DoD and UI must show both axes |
| Evidence bypass | HIGH | PASS without artifact; public file URL | Required-evidence gate; typed evidence records; authorized download only. “Yaptım” rejected |
| V0 scope creep | HIGH | Useful extras (crawler, GSC, charts, notifications, AI) | §85 vs §86 vs TIER 0–3. Do not implement out-of-scope items. Prefer Golden Scenario vertical slice |
| Emergency deploy silently bypasses gate | HIGH | Mark deployed while NO_GO without override entity | Separate command, two approvers, mandatory audit `DEPLOYED WITH OPEN RISKS`, gate unchanged |
| WAIVED stored as PASS | HIGH | Convenience mapping | Distinct status; required risk fields; gate treats as accepted risk, not PASS |
| IN_PROGRESS / LIVE_UNVERIFIED fake history | HIGH | Import all PASS to look healthy | Allowed initial states only; DONE_NEEDS_VERIFICATION ≠ PASS; baseline_at; audit discloses outside history |
| Management can write operational data | HIGH | Shared edit screens | Server deny on edit/submit/review/priority/deploy except specified emergency approval |
| P0 N/A or priority drop by owner | HIGH | Local escape hatch | AuthZ: owner cannot downgrade own P0/P1; P0 N/A authorized-only |
| SEO Lead collapsed into System Admin | MEDIUM | Pilot same human | Separate role records and capabilities even if assigned to one user |
| Verification levels collapsed in reporting | MEDIUM | “Tests passed” language | Use §94 / GOKHAN_GATE vocabulary in status docs |
| Post-launch checkpoints never instantiated | MEDIUM | V0 polish cut too far | POST_LAUNCH is V0 must-have (§85, §113). UI polish may simplify; checks must exist |
| Health/restore skipped because backup file exists | MEDIUM | Ops theater | BACKUP EXISTS ≠ RESTORE VERIFIED; required before pilot accept |
| Override implemented as set-READY | HIGH | Name collision with emergency/gate | Override must not write READY. READY remains calculated |
| Single-maintainer / laptop deployment | MEDIUM | Speed | Company repo, Docker, docs, second maintainer — condition of the custom decision |

---

# FINAL SELF-REVIEW

## CHECK 1 — COVERAGE

Numbered Product Sheet sections: **§0–§115 = 116**. All appear in Part 2.

Also traced, not as extra numbered sections but as binding companions:

- `AGENTS.md`: source of truth, V0 goal, architecture constraint, autonomous vs frozen decisions, stop conditions, V0 exclusions, 10 business invariants, Golden Scenario, data safety, completion reporting
- `GOKHAN_GATE.md`: decision protocol only; must not replace Project Sheet; verification levels; vertical slice; template/audit/gate safety

Seed control IDs BASE-001–010, BE-001–020, FE-001–032, NET-001–025, CNT-001–030, SEO-001–027, GEO-001–020, ANL-001–010, MIG-001–015, ML-001–008, POST-001–020 are covered via §44–§54 as V0 seed libraries. Individual control rows are not re-listed as separate Product Sheet sections because they are contents of those sections.

Coverage fix applied after first draft: Part 1 now lists all 14 §2 questions (they had been collapsed to 12); §58 Repeated Issues is aligned with §87 TIER 3 / §99; ECOMMERCE-without-library is recorded as a minor ambiguity, not a silent omission.

## CHECK 2 — CONTRADICTION

Checked against `PROJECT_SHEET.md`, `AGENTS.md`, and `GOKHAN_GATE.md`.

| Potential tension | Resolution in this document |
|---|---|
| AGENTS 16-step Golden Scenario vs Sheet §90 22-step acceptance | Both kept. 16-step is the named Golden Scenario; §90 is the official manual acceptance superset |
| AGENTS allows Prisma **or** Drizzle; Sheet names Prisma | Not a product contradiction. Stack preference is Sheet-canonical; ORM choice remains an allowed engineering decision per AGENTS. Not treated as a product ambiguity |
| Management read-only vs Management as emergency Approver 2 | Recorded as specified exception; not generalized write access |
| SEO full access vs “SEO does not complete other teams’ work” | Access ≠ ownership; both invariants kept |
| PM Review ✓ vs SEO_GATED requires SEO | Conservative reading: SEO_GATED still requires SEO |
| GOKHAN_GATE must not reinterpret the Product Sheet | This file does not add features, does not expand V0, and marks incomplete transitions `NEEDS_DESIGN` instead of inventing them |
| Sheet §107 “no unresolved V0 decisions” vs Part 7 material list | Material items are underspecified edges with conservative readings; verdict remains **no material product blocker** |

No contradiction was introduced that would make READY user-editable, merge Owner/Reviewer, merge Found By/Owned By, merge Team/Domain, equate DEPLOYED with PRODUCTION_VERIFIED, allow template mutation of past releases, allow audit overwrite, move authorization only to the UI, or expand V0 into crawler/PM/AI.

---

# END OF REQUIREMENTS TRACEABILITY

**Next allowed phase (not started):** architecture, and only after this document is accepted as the coverage baseline.  
**Not started:** application code, Next.js init, dependencies, migrations, UI, APIs, implementation files.
