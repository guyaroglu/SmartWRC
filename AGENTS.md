# SmartNet Web Release Control — Agent Constitution

## Source of Truth

The frozen product specification is:

PROJECT_SHEET.md

Read it completely before making architectural or implementation decisions.

The Project Sheet defines product scope, business rules, terminology,
roles, workflows, release semantics and V0 success criteria.

Do not reinterpret the product into a generic project management,
ticketing, checklist or task-management application.

The core product question is:

"Is this web release actually ready to go live?"

The organizational principle is:

"SEO defines standards and verifies critical controls.
The team responsible for implementation owns the implementation."

---

## Primary Goal

Build a usable V0/Pilot of SmartNet Web Release Control as quickly as
possible while preserving the core business invariants defined in
PROJECT_SHEET.md.

Optimize for:

1. correct business behavior
2. end-to-end pilot usability
3. data integrity
4. maintainability
5. implementation speed

Do NOT optimize for architectural sophistication.

---

## Architecture Constraint

Use a modular monolith.

Preferred baseline:

- Next.js
- TypeScript
- PostgreSQL
- Prisma or Drizzle
- established authentication library
- Docker
- Docker Compose

Do NOT introduce:

- microservices
- Kubernetes
- Redis
- event buses
- workflow engines
- unnecessary infrastructure
- paid external services

unless explicitly approved by Gökhan.

---

## Autonomous Decision Authority

You MAY independently decide:

- folder structure
- component structure
- naming
- TypeScript implementation details
- ORM choice between Prisma and Drizzle
- validation library
- form implementation
- test framework
- API/server-action implementation
- internal service boundaries
- styling details
- responsive behavior
- loading states
- empty states
- error presentation
- accessibility improvements
- minor UX details
- refactors required to maintain quality
- seed/demo data required for testing

Prefer the simplest robust implementation.

---

## Product Decisions You MUST NOT Change

Do not independently change:

- Release being the central operational unit
- Team vs Domain distinction
- Owner vs Reviewer distinction
- Found By vs Owned By distinction
- SELF / CROSS_TEAM / SEO_GATED verification model
- release gate being system-calculated
- READY not being manually selectable
- DEPLOYED != PRODUCTION_VERIFIED
- template version immutability for existing releases
- append-only audit semantics
- evidence enforcement
- role / permission intent
- onboarding types
- release/check lifecycle intent
- V0 scope boundaries
- SEO full operational access principle
- ownership/accountability model

---

## STOP CONDITIONS

Stop only the affected workstream and leave a clear decision request if
implementation requires one of the following:

1. changing a core product invariant
2. materially changing role or permission semantics
3. changing Release from the central domain model
4. removing a V0 capability
5. adding a paid third-party dependency
6. adding unnecessary infrastructure
7. making a destructive database operation
8. accessing a production system
9. deploying to production
10. exposing or modifying secrets
11. making an irreversible architectural decision not supported by the Project Sheet
12. resolving contradictory product requirements where different choices would materially change user behavior

When one workstream is blocked, continue other independent safe work.

Do not stop for ordinary implementation choices.

---

## Ambiguity Rule

If the Project Sheet leaves a minor implementation detail unspecified:

1. choose the simplest reasonable behavior
2. document the assumption
3. keep the implementation reversible
4. continue

If ambiguity materially changes business behavior, treat it as a STOP CONDITION.

Do not invent major product features.

---

## Scope Discipline

V0 explicitly excludes:

- general project management
- Gantt
- sprint management
- story points
- timesheets
- chat
- wiki
- CRM
- mobile app
- customer portal
- advanced reporting
- GSC integration
- Bing integration
- automated crawler
- AI assistant
- complex notifications
- workflow designer

Do not implement these even if they appear useful.

---

## Business Invariants

The following must be enforced server-side and tested.

1. READY cannot be directly selected by a user.
2. Existing release instances are not mutated when templates change.
3. Owner and reviewer are separate concepts.
4. Found By and Owned By are separate concepts.
5. SEO access does not transfer normal ownership of other teams' work.
6. Required evidence rules must be enforced.
7. Authorization must be enforced server-side.
8. DEPLOYED does not mean PRODUCTION_VERIFIED.
9. Audit history cannot be silently overwritten.
10. A control must not be duplicated into different team checklists.

---

## Verification Standard

Never equate:

code written
=
task complete.

For completed work run, when applicable:

- unit tests
- integration tests
- permission tests
- state-transition tests
- typecheck
- lint
- production build
- actual browser verification

Critical business invariants require automated tests.

---

## V0 Golden Scenario

The system is not considered V0-complete until this real workflow works:

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
12. Another Network P0 blocker keeps the release NO_GO.
13. Network blocker is resolved.
14. Gate automatically becomes READY.
15. Management user sees READY and zero blockers.
16. Full audit history remains available.

This scenario must be tested end-to-end.

---

## Data Safety

Never:

- delete persistent data to make tests pass
- reset production databases
- rewrite migration history
- silently bypass authorization
- disable business rules for convenience
- fabricate successful verification

Use separate development/test data.

---

## Completion Reporting

Maintain:

docs/IMPLEMENTATION_STATUS.md

After meaningful milestones update:

### Implemented
What actually exists.

### Verified
What was actually tested.

### Not Yet Verified
What exists but has not been proven working.

### Assumptions
Minor decisions made autonomously.

### Blocked Decisions
Only issues requiring Gökhan.

### Next
Highest-value remaining V0 work.

Do not report something as complete merely because code compiles.