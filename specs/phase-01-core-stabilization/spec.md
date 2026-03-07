# Feature Specification: Phase 01 - Core Stabilization

**Feature Branch**: `phase-01-core-stabilization`
**Created**: 2026-03-05
**Status**: Draft

## 1. Objective

Stabilize the framework core to deliver a production-ready first functional version focused on consistent CRUD module behavior across all modules.

This phase prioritizes predictability and operational robustness over adding new features.

## Clarifications

### Session 2026-03-07

- Q: Should all navigation entry points share one dirty-guard transition pipeline? → A: Yes. All navigations must use a single centralized dirty-guard navigation method.
- Q: How should table pagination/footer behave in wide/long tables? → A: Footer/pagination stays pinned to the visible container; only table header/body scroll.
- Q: How should sidebar expanded layout be structured? → A: Header logo-only, modules in body, and footer with app title above @galurensoft + version.
- Q: How should collapsed sidebar behave for text and logo? → A: No visible text, icon-only items with mini-padding and rounded borders, and use squared app logo in 1:1 ratio.

## 2. Scope

In scope:
- Harden the 5-layer architecture flow: Entities -> Decorators -> BaseEntity -> Application -> UI.
- Normalize metadata interpretation for list/detail views.
- Standardize CRUD lifecycle behavior (`save`, `update`, `delete`, `getElement`, `getElementList`).
- Stabilize global application state transitions (`View`, loading states, dirty-state guards).
- Define production baseline practices (build, env, observability hooks, rollback strategy).

Out of scope:
- New architectural layers.
- Tech-stack replacement.
- Major UI redesign unrelated to core stability.
- Plugin marketplace and advanced ecosystem items.

## 3. User Scenarios

### US-01: Framework developer ships a stable CRUD module

Given an entity with required decorators and module registration,
when running the app in dev or production mode,
then list/detail CRUD behavior is deterministic and aligned with metadata.

### US-02: End user edits data safely

Given a detail view with validations,
when the user modifies fields and saves,
then dirty-state protection, validation flow, and API persistence occur in a reliable order.

### US-03: Team deploys first functional production version

Given production build artifacts,
when deployed to target hosting,
then startup, routing, API integration, and error handling work without contract violations.

## 4. Functional Requirements

1. The core MUST preserve MI LOGICA axioms A1-A4 with no exceptions.
2. The framework MUST render list/detail UI only from decorator metadata.
3. BaseEntity CRUD methods MUST enforce endpoint and method validation before network calls.
4. The application orchestrator MUST centralize navigation and view transitions.
5. Validation flow MUST run required and sync validations before async validation.
6. Core module registration MUST produce deterministic sidebar and routing behavior.
7. Production configuration MUST support environment-based API base URL.
8. All navigation entry points (sidebar, profile menu, configuration actions, and programmatic redirects) MUST use a single centralized dirty-guard transition pipeline with identical state and timing behavior.
9. Table pagination/footer MUST remain anchored to the visible table container and MUST NOT expand to full table content width; only table header/body regions may scroll.
10. Sidebar expanded layout MUST use three regions: header (logo-only), body (module navigation), and footer (application title above copyright and app version).
11. Sidebar collapsed layout MUST hide all module text labels, render module entries as icon-only controls with reduced padding and rounded borders, and switch header branding to a dedicated `squared_app_logo_image` system variable rendered at a constant 1:1 ratio.

## 5. Non-Functional Requirements

1. Reliability: no silent failure in CRUD operations; errors must surface through toast/dialog and logs.
2. Maintainability: implementation must preserve current layer boundaries and naming conventions.
3. Performance: list/detail transitions should remain responsive for normal SaaS datasets.
4. Operability: build and run workflow must be documented and repeatable.

## 6. Success Criteria

1. First production-capable version can be built and started without architectural violations.
2. At least one representative CRUD module works end-to-end with validated metadata-driven UI.
3. Core lifecycle behaviors (load, validate, save, delete, navigate) are stable and reproducible.
4. Planning artifacts are complete for task generation (`plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`).

## 7. Risks

1. Inconsistent legacy patterns in UI components may bypass Application flow.
2. Metadata edge cases may cause rendering drift between list and detail views.
3. Production deployment variability (env/build/server config) can expose missing assumptions.

## 8. Acceptance Gate for Tasking

`/task` can run only when:
- All clarifications in research are resolved.
- Constitution checks pass pre-design and post-design.
- Data model and contracts reflect the core stabilization scope.

## 9. Phase Additions (Implementation Kickoff)

1. Add method-level decorator `@OnViewFunction(icon, text, viewTypes[])` for metadata-driven extra action buttons.
2. Add class-level decorator `@NotRequiresLogin()` as metadata-only capability (technical debt until login phase).
3. Introduce `Configuration` entity to centralize system configuration editing and persistence flow.
4. Introduce extendable `Home` entity as startup module baseline.
5. Remove legacy `Customer` module from default starter flow.

## 10. Task Traceability Notes

1. OnViewFunction capability: covered by `T017-T024`, `T030-T032`.
2. Configuration entity and persistence flow: covered by `T035-T046`.
3. Home module and cleanup: covered by `T025-T029`, `T051`.
4. NotRequiresLogin and technical debt: covered by `T049-T053`.
5. Production and smoke closure: covered by `T047-T048`, `T055`, `T058-T060`.
6. Clarification FR8 (unified dirty-guard navigation): covered by `T146-T152`.
7. Clarification FR9 (container-anchored table footer): covered by `T141-T145`.
8. Clarification FR10-FR11 (sidebar expanded/collapsed branding): covered by `T153-T160`.
9. Clarification-set polish and contract sync: covered by `T161-T164`.

## 11. Architectural Decisions (Phase 2 Additions)

1. **No breadcrumb navigation**: Breadcrumb is explicitly NOT required for this system. The TopBar showing module name + icon is the canonical navigation context. Re-evaluate only if multi-level entity hierarchies are introduced.
2. **CSR-first platform**: Framework is designed exclusively for Client-Side Rendering. SSR support is out of scope and not planned.

## 12. Task Traceability Notes – Phase 2 Extension

1. Pinia state integration: covered by `T082-T095` (US5).
2. Component correctness & i18n: covered by `T096-T106` (US6).
3. Technical debt documentation: covered by `T107-T111` (US7).
4. Table column sort: covered by `T112-T117` (US8).
5. ArrayInput select-all: covered by `T118-T121` (US9).
6. BaseEntity type + form registry: covered by `T122-T126` (US10).
7. @Module decorator + debounce: covered by `T127-T131` (US11).

## 13.5. Phase 2.5 Correction Notes

### US8 — Table Column Sort

Column sort is **client-side (in-memory)** against the current page returned by `getElementListPaginated`. No additional API call is made on sort toggle. The processing pipeline is strictly ordered:

```
data (server page) → filteredRows (column filters applied) → sortedRows (sort applied) → paginatedRows (rendered)
```

The `sortBy` / `sortDir` fields on `ListQueryParams` remain for future server-side sort delegation but are not used for in-memory sort behaviour.

---

## 13. Phase 2 Implementation Completion Status

| User Story | Tasks | Status | Key Deliverables |
|------------|-------|--------|-----------------|
| US5 – Pinia State Backing | T082–T095 | ✅ Done | 3 Pinia stores, ApplicationClass refactored, main.ts updated |
| US6 – Component Correctness | T096–T106 | ✅ Done | TopBar ref fix + logout, Sidebar branding, Modal i18n, mixins/ deleted |
| US7 – Tech Debt Docs | T107–T111 | ✅ Done | TD-01 through TD-06 in research.md |
| US8 – Table Column Sort | T112–T117 | ✅ Done | sortBy/sortDir in ListQueryParams, sort button, toggleSort, CSS |
| US9 – ArrayInput Select-All | T118–T121 | ✅ Done | isAllSelected computed, toggleSelectAll, i18n keys |
| US10 – Form Registry | T122–T126 | ✅ Done | InputRegistry, useFormRenderer, default_detailview refactor |
| US11 – @Module + Debounce | T127–T131 | ✅ Done | module_decorator.ts, barrel export, asyncValidationDebounce |
