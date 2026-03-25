# Feature Specification: Phase 01 - Core Stabilization

**Feature Branch**: `phase-01-core-stabilization`
**Created**: 2026-03-05 | **Last updated**: 2026-03-25
**Status**: Implemented — Doc-Accuracy Patch Cycle 2 — Complete

---

## Documentation Cycle Policy (This Cycle Only)

**Code is the source of truth.** This documentation-realignment cycle does not introduce code changes. All specification updates must reflect the behavior of the committed implementation on branch `phase-01-core-stabilization`. Any discrepancy between a documentation claim and the actual code must be resolved by updating the documentation to match the code, never the reverse.

**Non-goals for this cycle**:
- Introducing or proposing new features.
- Changing architectural decisions.
- Opening new technical debt without attributing it to a committed code state.

---

## Traceability Format (Documentation Realignment)

All task-to-spec references in this document must use the documentation-realignment task IDs in the format `T001`–`T026` (Cycle 2 — Doc-Accuracy Patch). Legacy implementation task references (e.g., T017-T164) are retained only inside clearly marked historical sections; new traceability entries must reference documentation-realignment tasks only.

> **Cycle history**: Cycle 1 covered T001–T048 (Documentation Realignment, 2026-03-25). Cycle 2 covers T001–T026 (Doc-Accuracy Patch, 2026-03-25) correcting cross-analysis findings from `tech-debt-register.md`.

## Documentation Integrity Acceptance Gate

This documentation realignment is complete when:
1. All documentation-realignment tasks T001–T026 (Cycle 2 — Doc-Accuracy Patch) are marked `[X]` in `tasks.md`. Cycle 1 tasks T001–T048 were satisfied in the prior realignment cycle.
2. No `spec.md` section contains unresolved stale Phase 1/2 implementation T-number references outside historical notes.
3. All artifacts in the checklist in `research.md` satisfy their acceptance criteria.
4. Contracts match current implemented behavior; no planning-future language remains.
5. `quickstart.md` is immediately executable with the committed codebase.

---

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

In scope (all items delivered):
- Harden the 5-layer architecture flow: Entities -> Decorators -> BaseEntity -> Application -> UI.
- Normalize metadata interpretation for list/detail views.
- Standardize CRUD lifecycle behavior (`save`, `update`, `delete`, `getElement`, `getElementList`).
- Stabilize global application state transitions (`View`, loading states, dirty-state guards).
- Define production baseline practices (build, env, observability hooks, rollback strategy).
- Centralized dirty-guard navigation pipeline across all entry points (sidebar, menus, programmatic redirects).
- Container-anchored table pagination/footer (scrollable header/body only).
- Sidebar expanded/collapsed branding layout (header/body/footer regions; icon-only collapsed mode).

Out of scope:
- New architectural layers.
- Tech-stack replacement.
- UI redesign beyond core stability clarifications already implemented above.
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

1. First production-capable version is built and runs without architectural violations. ✅ Delivered.
2. At least one representative CRUD module works end-to-end with validated metadata-driven UI. ✅ Delivered.
3. Core lifecycle behaviors (load, validate, save, delete, navigate) are stable and reproducible. ✅ Delivered.
4. Planning artifacts are complete: `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/` exist and reflect implementation. ✅ Delivered.

## 7. Risks

1. Inconsistent legacy patterns in UI components may bypass Application flow.
2. Metadata edge cases may cause rendering drift between list and detail views.
3. Production deployment variability (env/build/server config) can expose missing assumptions.

## 8. Pre-Implementation Gate (Historical — Satisfied)

Original gate criteria for running `/task` — all satisfied before implementation began:
- All clarifications in research are resolved. ✅
- Constitution checks pass pre-design and post-design. ✅
- Data model and contracts reflect the core stabilization scope. ✅

## 9. Phase Additions — Delivered

All items below were implemented and smoke-tested in Phase 01.

1. `@OnViewFunction(icon, text, viewTypes[])` method-level decorator for metadata-driven extra action buttons. ✅
2. `@NotRequiresLogin()` class-level decorator as metadata-only capability (technical debt until login phase). ✅
3. `Configuration` entity for system configuration editing and local persistence flow. ✅
4. `Home` entity as starter module baseline (non-persistent). ✅
5. Legacy `Customer` module removed from default starter flow. ✅

## 10. Implementation Task Traceability (Historical Reference)

> The following mapping is historical. Original implementation tasks were numbered T001–T164 across Phase 1 and Phase 2. All implementation tasks are **complete**. The documentation-realignment tasks are tracked in `tasks.md` (T001–T048).

| Feature Area | Implementation Status | Documentation-Realignment Task |
|---|---|---|
| OnViewFunction decorator + action bar | ✅ Delivered | T032 (spec traceability update) |
| Configuration entity + persistence | ✅ Delivered | T022–T023 (data-model reconciliation) |
| Home module + Customer removal | ✅ Delivered | T022–T023 |
| @NotRequiresLogin metadata | ✅ Delivered | T019–T020 (research baseline) |
| Production build + smoke closure | ✅ Delivered | T024–T025 (quickstart), T034 (release gate) |
| FR8: Unified dirty-guard navigation | ✅ Delivered | T027 (orchestration contract) |
| FR9: Container-anchored table footer | ✅ Delivered | T028 (metadata-UI contract) |
| FR10–11: Sidebar branding (expanded/collapsed) | ✅ Delivered | T028 (metadata-UI contract) |
| Pinia state backing (Phase 2) | ✅ Delivered | T020 (research baseline snapshot) |
| Component correctness + i18n (Phase 2) | ✅ Delivered | T025 (quickstart smoke sections) |
| Technical debt documentation (Phase 2) | ✅ Delivered | T037–T038 (research changelog + maintenance) |
| Table column sort (Phase 2) | ✅ Delivered | T028 (metadata-UI contract) |
| ArrayInput select-all (Phase 2) | ✅ Delivered | T025 (quickstart) |
| Form registry + useFormRenderer (Phase 2) | ✅ Delivered | T026–T028 (contract updates) |
| @Module composite decorator + debounce (Phase 2) | ✅ Delivered | T022 (data-model), T028 (contract) |

## 12. Architectural Decisions

1. **No breadcrumb navigation**: Breadcrumb is explicitly NOT required for this system. The TopBar showing module name + icon is the canonical navigation context. Re-evaluate only if multi-level entity hierarchies are introduced.
2. **CSR-first platform**: Framework is designed exclusively for Client-Side Rendering. SSR support is out of scope and not planned.

## 13. Phase 2 Correction Notes

### US8 — Table Column Sort

Column sort is **client-side (in-memory)** against the current page returned by `getElementListPaginated`. No additional API call is made on sort toggle. The processing pipeline is strictly ordered:

```
data (server page) → filteredRows (column filters applied) → sortedRows (sort applied) → paginatedRows (rendered)
```

The `sortBy` / `sortDir` fields on `ListQueryParams` remain for future server-side sort delegation but are not used for in-memory sort behaviour.

---

## 14. Phase 2 Implementation Completion Status

| User Story | Tasks | Status | Key Deliverables |
|------------|-------|--------|-----------------|
| US5 – Pinia State Backing | T082–T095 | ✅ Done | 3 Pinia stores, ApplicationClass refactored, main.ts updated |
| US6 – Component Correctness | T096–T106 | ✅ Done | TopBar ref fix + logout, Sidebar branding, Modal i18n, mixins/ deleted |
| US7 – Tech Debt Docs | T107–T111 | ✅ Done | TD-01 through TD-06 in research.md |
| US8 – Table Column Sort | T112–T117 | ✅ Done | sortBy/sortDir in ListQueryParams, sort button, toggleSort, CSS |
| US9 – ArrayInput Select-All | T118–T121 | ✅ Done | isAllSelected computed, toggleSelectAll, i18n keys |
| US10 – Form Registry | T122–T126 | ✅ Done | InputRegistry, useFormRenderer, default_detailview refactor |
| US11 – @Module + Debounce | T127–T131 | ✅ Done | module_decorator.ts, barrel export, asyncValidationDebounce |

---

## 15. Terminal Phase Closure

**Status**: Phase 01 implementation is complete. Doc-Accuracy Patch Cycle 2 is complete (tasks T001–T026 in `tasks.md`).

**Handoff criteria for next phase**:
1. All Doc-Accuracy Patch Cycle 2 tasks T001–T026 marked `[X]` in `tasks.md`.
2. `quickstart.md` Section 19 release-readiness checklist fully satisfied.
3. No unresolved contradictions between `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`.
4. Open technical debts (TD-02 through TD-07) and behavioral debts (BD-01 through BD-05) documented in `tech-debt-register.md` and carried forward to the next phase backlog.

**Next phase scope recommendation**: Authentication/authorization phase (login guard, JWT remediation, `@NotRequiresLogin` router integration).

---

## 20. Cycle 2 Closure — Doc-Accuracy Patch

**Cycle**: Doc-Accuracy Patch Cycle 2
**Completed**: 2026-03-25
**Status**: ✅ All 26 tasks (T001–T026) completed

### Outcome Statement

A cross-analysis of `specs/phase-01-core-stabilization/` against committed source code on branch `phase-01-core-stabilization` identified 27 items of documentation debt: 10 documentation accuracy errors (DA-01–DA-10) and 7 documentation completeness gaps (DG-01–DG-07), plus 5 engineering debts (TD) and 5 behavioral debts (BD) carried over from Phase 01.

All 17 documentation accuracy and completeness items (DA-xx, DG-xx) have been corrected in this cycle. The behavioral debts (BD-01–BD-05) and engineering debts (TD-02–TD-05, TD-07) remain open and are tracked in `tech-debt-register.md` for triage in the next phase.

### Changes Applied

| File | Change Summary |
|------|---------------|
| `spec.md` | Status updated; Traceability Format updated to Cycle 2 T001–T026; Acceptance Gate updated |
| `tech-debt-register.md` | Created; Fix Task IDs corrected (+2 each); DA-10 Code Reality expanded with canonical 15-var list; all 17 DA/DG items verified ✅ |
| `data-model.md` | Configuration: 15 fields in correct order, correct types, asyncValidationDebounce note; §1.5 Product added; §2.3 Home added |
| `quickstart.md` | Node.js version corrected; VITE_APP_LOGO removed; .env template expanded to 15 vars in groups; Bootstrap Sequence added |
| `contracts/base-entity-stability-contract.md` | isDirty → getDirtyState(); update() and delete() sequences rewritten to match actual implementation with BD-xx cross-references |
| `contracts/application-orchestration-contract.md` | moduleList store corrected to ref-inside-view-store; Application.ListButtons documented |
| `research.md` | Decorators table expanded 4 → 34 entries; previewFile ref documented; save() vs update() comparison table added; checklist reset for Cycle 2; changelog updated |

### Reference

Full debt inventory and verification status: [`tech-debt-register.md`](tech-debt-register.md)
