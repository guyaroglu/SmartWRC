# GÖKHAN GATE — Decision & Execution Protocol

## Purpose

This document defines HOW consequential decisions must be made while
designing and implementing SmartNet Web Release Control.

It does NOT define product requirements.

Product requirements come from:

1. PROJECT_SHEET.md — product source of truth
2. AGENTS.md — execution boundaries and agent operating rules
3. GOKHAN_GATE.md — decision-quality protocol

GOKHAN_GATE.md must never be used to silently reinterpret,
expand or replace requirements in PROJECT_SHEET.md.

When rules appear to conflict, preserve the product requirements and
follow the more conservative/reversible execution path.

---

# 1. Core Principle

The goal is not to build the most sophisticated system.

The goal is to deliver the smallest robust SmartNet Web Release Control
implementation that proves the real operational model works.

Before doing additional work, ask:

> Will this materially improve the real V0 outcome?

If not, omit it.

Architecture, abstractions, tooling and automation are means, not goals.

---

# 2. State Auditor

Before making a consequential recommendation or implementation decision,
establish the current state.

Separate:

- VERIFIED
- ASSUMED
- UNKNOWN

Never infer the state of the whole system from one file,
one test result, one screenshot, one endpoint or one successful run.

Before modifying an existing implementation, inspect the related:

- product requirement
- current code
- database model
- permissions
- state transitions
- tests
- downstream behavior

Preserve relevant existing state.

If a material UNKNOWN could change the decision:

- verify it when possible,
- otherwise document it explicitly.

Do not guess through material uncertainty.

---

# 3. Systems Thinker

Before consequential changes, check upstream and downstream effects.

Ask:

- What depends on this?
- What can this break?
- Can this create duplicate state?
- Can this suppress required behavior?
- Can this overwrite history?
- Can this corrupt ownership, permissions or auditability?
- Can this make rollback harder?
- Can this make future maintenance unnecessarily expensive?

Prefer fixing root causes.

However:

> Do not redesign the system when a small robust fix is sufficient.

Respect the complexity budget.

---

# 4. Red Team

Before accepting a consequential solution, actively try to falsify it.

Check for:

- data loss
- invalid state transitions
- authorization bypass
- duplicate records
- silent failures
- false PASS conditions
- false READY conditions
- missing blockers
- overwritten audit history
- template mutation
- owner/reviewer confusion
- Found By / Owned By confusion
- frontend-only permission enforcement
- tests that pass while real usage fails
- happy-path-only implementations
- hidden operational cost
- unnecessary infrastructure
- irreversible decisions

Do not accept:

> "Tests pass"

as sufficient proof that the implementation works.

---

# 5. Product / Outcome Owner

Optimize for the actual business outcome.

For WRC the desired outcome is:

> The correct team owns the correct release-quality responsibility,
> provides appropriate evidence,
> required verification happens,
> and release readiness is calculated objectively.

Do not optimize for:

- number of features
- number of tables
- number of services
- abstraction purity
- framework novelty
- maximum automation
- maximum configurability

Prefer:

> simple + explicit + testable + reversible

over:

> clever + generic + future-proof-looking

unless the latter materially improves V0 success.

---

# 6. User Proxy

Before finalizing a consequential decision, predict the strongest
reasonable objection Gökhan could raise.

Examples:

- Does this preserve the actual requirement?
- Did we accidentally turn WRC into Jira?
- Does SEO become the bottleneck again?
- Is ownership still clear?
- Can Management accidentally change operational data?
- Is READY truly system-calculated?
- Can someone bypass the UI and modify state through the server?
- Did we really process every required rule?
- Did anything disappear between specification and implementation?
- Are we claiming something works only because tests are green?

If the solution cannot withstand the strongest reasonable objection,
improve it before proceeding.

---

# 7. State-Changing Actions

Before destructive, persistent or difficult-to-reverse actions,
establish:

CURRENT STATE
→ ACTION
→ EXPECTED NEXT STATE
→ SIDE EFFECTS
→ RECOVERY / ROLLBACK
→ INTERACTION WITH PREVIOUS STATE

This applies especially to:

- database migrations
- schema changes
- permission changes
- auth changes
- data transformations
- deletes
- resets
- dependency replacements
- framework changes
- deployment
- production configuration
- overwrites
- migration-history changes

Prefer reversible actions.

Never destroy state merely to make implementation easier.

---

# 8. Reconciliation

For important product functionality, reconcile the full chain.

For WRC:

PRODUCT REQUIREMENT
→ ARCHITECTURE
→ DATA MODEL
→ SERVER RULE
→ UI
→ TEST
→ ACTUAL USER FLOW
→ GOLDEN SCENARIO

Any unexplained requirement loss is a potential defect.

For checks:

MASTER CONTROL
→ TEMPLATE VERSION
→ RELEASE INSTANCE
→ OWNER
→ EXECUTION
→ EVIDENCE
→ REVIEW
→ STATUS
→ RELEASE GATE
→ AUDIT

For release readiness:

OPEN CHECKS
→ PRIORITY
→ BLOCKER RULES
→ EVIDENCE
→ REQUIRED REVIEW
→ GATE CALCULATION
→ RELEASE STATUS

Every material difference must be explainable.

---

# 9. Verification Levels

Never collapse different levels of evidence.

Use these distinctions:

## TECHNICALLY TESTED

Automated tests, typecheck, lint and/or build passed.

This does not prove real application behavior.

## LIVE VERIFIED

The relevant flow was actually run in the application
with development/test data and observed to work.

## PRODUCTION VERIFIED

The relevant behavior was verified in the real deployed production environment.

Only use this term when production was actually tested.

## END-GOAL ACHIEVED

The real operational outcome has been achieved.

For V0 this means the Golden Scenario genuinely works end-to-end.

Do not claim a stronger level than the available evidence supports.

---

# 10. Golden Scenario Is The Primary Acceptance Test

The V0 Golden Scenario defined in PROJECT_SHEET.md and AGENTS.md
is more important than broad feature coverage.

Prioritize reaching this vertical slice early:

Release created
→ team member receives check
→ evidence
→ review
→ fail
→ correction
→ resubmit
→ pass
→ another blocker keeps NO_GO
→ blocker resolved
→ READY recalculated
→ Management sees correct state
→ audit history preserved

If this does not work, V0 is not successful even if many screens exist.

---

# 11. Complexity Budget

The default answer to additional complexity is NO unless justified.

Before adding:

- new service
- new abstraction layer
- new package
- new persistence system
- background worker
- cache
- event architecture
- workflow engine
- generic plugin system
- complex configuration
- generalized permission engine

prove that the current V0 requirement cannot be solved robustly without it.

Prefer fewer moving parts.

For V0:

- modular monolith is preferred
- PostgreSQL is the primary persistent store
- no Redis unless explicitly approved
- no microservices
- no event bus
- no Kubernetes
- no speculative integrations

---

# 12. Build Vertically, Not Horizontally

Prefer complete usable flows over isolated technical subsystems.

Bad sequence:

Auth
→ every database table
→ every API
→ every dashboard
→ then integration

Preferred sequence:

minimal auth
→ required roles
→ project/release
→ one real check
→ evidence
→ review
→ gate calculation
→ audit
→ Golden Scenario

Then expand remaining V0 functionality.

This exposes incorrect assumptions early.

---

# 13. Data Integrity Rules

Never silently:

- duplicate release checks
- overwrite audit history
- mutate historical template-derived release data
- change ownership semantics
- convert FAIL to PASS
- waive a blocker
- drop required evidence
- bypass review
- downgrade priority
- change reviewer requirements

All consequential changes must be explicit and auditable.

---

# 14. Permission Verification

Do not consider RBAC complete because buttons are hidden.

For consequential operations, verify authorization at the server boundary.

Test at minimum:

- permitted user succeeds
- unauthorized user fails
- direct request cannot bypass UI restrictions

Management read-only behavior must also be enforced server-side.

---

# 15. Release Gate Safety

Release status is derived state.

Do not treat READY as an editable field.

When implementing gate logic:

1. define inputs explicitly
2. make calculation deterministic
3. test conflicting conditions
4. test boundary cases
5. verify recalculation after state changes

A UI displaying READY is insufficient proof.

The underlying gate engine must produce READY from valid state.

---

# 16. Template Safety

Template and release instances must remain separate concepts.

Before any template change ask:

> Could this alter an existing release?

If yes, the implementation is unsafe unless the product specification
explicitly allows it.

Existing release history must remain stable.

---

# 17. Auditability

Important operational actions must generate append-only audit events.

Do not rely solely on mutable timestamps such as `updatedAt`.

Audit records should make it possible to reconstruct meaningful changes,
including:

- actor
- action
- previous state where relevant
- new state
- timestamp
- reason when required

Audit history is evidence, not decoration.

---

# 18. Failure Handling

Do not turn unexpected situations into false success.

If an operation partially fails:

- preserve valid previous state
- surface the failure
- avoid partial silent updates
- log enough context to diagnose the issue

Prefer transactions for related persistent changes when appropriate.

---

# 19. Assumption Policy

Minor implementation assumptions may be made autonomously when they are:

- reversible
- low-risk
- not product-defining
- consistent with PROJECT_SHEET.md

Record meaningful assumptions in:

docs/DECISIONS.md

Do not ask Gökhan about trivial engineering choices.

Ask only when different answers would materially change:

- business behavior
- user responsibility
- data semantics
- permission semantics
- release outcome
- V0 scope
- irreversible architecture

---

# 20. Stop Rule

A STOP does not mean all work must stop.

When a material decision blocks one workstream:

1. isolate the blocked area
2. document the exact decision needed
3. explain the alternatives and consequences
4. continue unrelated safe work

Only stop the whole project when the unresolved decision affects
the architectural or product foundation of nearly all remaining work.

---

# 21. Decision Record

For consequential implementation choices document:

## Decision
What was chosen.

## Why
Why this is the simplest robust option.

## Alternatives Considered
Only meaningful alternatives.

## Risks
Material risks.

## Reversibility
How difficult it is to change later.

Do not create ADR bureaucracy for trivial choices.

---

# 22. Definition of Done

"Implemented" means code exists.

"Technically tested" means automated/static checks passed.

"Live verified" means actual application behavior was exercised.

"V0 complete" requires the Golden Scenario and required V0 capabilities.

Never use these terms interchangeably.

---

# 23. Final Decision Filter

Before considering consequential work complete, ask:

1. Does it satisfy PROJECT_SHEET.md?
2. Did we preserve the business invariants?
3. Did we introduce unnecessary complexity?
4. Did we test the strongest failure mode?
5. Can authorization be bypassed?
6. Can data/history be corrupted?
7. Is the result actually verified at the level claimed?
8. Does this materially advance the Golden Scenario?

If any important answer is unclear, investigate before declaring completion.