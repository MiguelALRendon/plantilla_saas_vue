# Research: Phase 01 - Core Stabilization

**Branch**: `phase-01-core-stabilization`
**Date**: 2026-03-05 | **Last updated**: 2026-03-25
**Phase**: Documentation Realignment — code is source of truth

---

## Documentation Sync Inventory

**Cycle**: Documentation-only realignment. No source code changes.
**Source of truth**: `src/` implementation as committed on branch `phase-01-core-stabilization`.

| Artifact | Current State | Realignment Action |
|----------|--------------|-------------------|
| `spec.md` | Status "Draft"; historical task references (T017-T164); Phase 2 status table incomplete | Update status, rewrite traceability, remove stale sections |
| `plan.md` | Implementation phases F1-F4 marked as planned; some constitution notes stale | Update summary framing, add documentation-scope clause, add closure section |
| `research.md` | Phase 2 post-mortem + TDs present; assumptions section pre-dates implementation | Remove stale pre-implementation assumptions; add implemented baseline snapshot |
| `data-model.md` | Conceptual entities mostly valid; some field lists may diverge from actual code | Reconcile entity field sets with implementation; remove stale entries |
| `quickstart.md` | Prerequisites accurate; smoke checklists 1-18 complete; extended log present | Rebuild prerequisites section for clarity; add release-readiness gate |
| `contracts/base-entity-stability-contract.md` | Core invariants accurate; format minimal | Update with Phase 2 addenda; remove any obsolete clauses |
| `contracts/application-orchestration-contract.md` | Updated for dirty-guard centralization; accurate | Verify alignment; remove any pre-implementation planning language |
| `contracts/metadata-ui-contract.md` | Updated for sidebar/table finalized behavior; accurate | Verify alignment; ensure finalized behavior notes are canonical |

---

## Documentation Artifact Checklist

All artifacts below must satisfy the acceptance criteria before this phase is marked complete.

- [ ] `spec.md`: Status reflects implemented reality; traceability maps to Cycle 2 documentation tasks T001-T026; no stale Phase 1/2 implementation T-number references.
- [ ] `plan.md`: Summary reflects delivered scope; implementation phases marked as completed; documentation-scope clause present.
- [ ] `research.md`: Pre-implementation assumptions removed or superseded; implemented-baseline snapshot present; maintenance protocol present.
- [ ] `data-model.md`: All entity fields match implemented behavior; no conceptual-only entries without a note; Product and Home entities documented.
- [ ] `quickstart.md`: Prerequisites are immediately executable; all 15 env vars listed; bootstrap sequence documented; no references to non-existent env variables.
- [ ] `contracts/base-entity-stability-contract.md`: Operation sequences for `save()`, `update()`, and `delete()` reflect actual implementation; `getDirtyState()` used (not `isDirty`).
- [ ] `contracts/application-orchestration-contract.md`: Routing and view rules reflect current behavior; `moduleList` correctly described as ref inside `view` store; `Application.ListButtons` documented.
- [ ] `contracts/metadata-ui-contract.md`: Rendering guarantees match current metadata interpretation; finalized behavior notes are authoritative.
- [ ] `tech-debt-register.md`: All DA-xx and DG-xx items have a corresponding fix task; Fix Task IDs are correct; DA-10 Code Reality includes the canonical 15-variable env var list.

---

## Editorial Rules (Documentation Realignment)

### Stale-Content Removal

1. **Delete, do not patch around stale content.** If a statement contradicts the implemented behavior, delete or replace it entirely. Do not add inline qualifications like "originally planned" unless they serve as historical context with explicit attribution.
2. **Pre-implementation assumptions are stale if superseded.** Assumptions written before the code was implemented must be evaluated against the actual behavior. If the assumption no longer holds, it must be removed.
3. **Task references to old implementation T-numbers (T017-T164) in spec.md sections 10 and 12 must be replaced** with documentation-realignment task T-numbers (T001-T048).
4. **Planning-future language must be replaced.** Phrases like "will be," "must be implemented," "should produce" must be converted to present tense if the feature is delivered, or removed if no longer relevant.
5. **Superseded status markers must be updated.** "Draft" status fields, empty completion tables, and "in progress" markers from prior phases must reflect actual completion state.

### Contract Synchronization Rules

1. **Contracts must be updated before spec or plan.** If a behavior changed in implementation, update the relevant contract first, then align spec/plan references to it.
2. **No contract clause may be removed without confirming it is no longer true.** Check the `src/` implementation before removing a guarantee.
3. **Contract notes labeled "Finalized" are authoritative.** Do not modify these without evidence from the code.
4. **Cross-contract terminology must be identical.** If `metadata-ui-contract.md` uses "anchored footer," `spec.md` must also use "anchored footer" — not "pinned" or "fixed."
5. **Contracts under `specs/phase-01-core-stabilization/contracts/` are scoped to phase 01.** The master contracts in `copilot/` are not modified in this cycle.

---

## 1. Production hardening baseline

Decision: Use a production baseline centered on deterministic build, env-driven API configuration, and runtime smoke validation.

Rationale: The framework already has the required stack and layered architecture. The main production risk is configuration drift and silent runtime inconsistency, not missing framework primitives.

Alternatives considered:
- Full platform redesign before first release: rejected due to high risk and violation of stabilization objective.
- Introduce new external state management: rejected by constitution (A4) and unnecessary for core stabilization.

## 2. CRUD lifecycle consistency

Decision: Define canonical lifecycle order for all module CRUD flows:
1. Metadata guards
2. Validation sequence (required -> sync -> async)
3. Loading state handling
4. API call
5. View/state update
6. Success or failure surfacing

Rationale: Most instability in metadata-driven systems comes from out-of-order lifecycle operations. Stabilizing execution order reduces behavioral divergence across modules.

Alternatives considered:
- Allow per-component lifecycle customization: rejected because it introduces nondeterminism and weakens A3.
- Add bypass flags to skip guards: rejected as it undermines reliability goals.

## 3. Observability and failure surfacing

Decision: Keep observability minimal and framework-native:
- Surface all user-visible failures via toast/dialog patterns.
- Keep structured console logging for diagnostic traces in development.
- Standardize error payload mapping for API responses.

Rationale: This approach improves diagnosability while preserving current architecture and avoiding non-essential dependencies.

Alternatives considered:
- Add full external telemetry stack now: deferred; useful but out of scope for first stabilization phase.

## 4. First functional production version definition

Decision: The first functional version is complete when all of the following pass:
- At least one representative module executes end-to-end CRUD reliably.
- Routing and view transitions are stable under normal usage.
- Validation and dirty-state protections work predictably.
- Production build and startup flow is reproducible with documented steps.

Rationale: A usable first version requires operational confidence, not full feature completeness.

Alternatives considered:
- Wait for full automation test suite before release: deferred to a post-stabilization phase.

## 5. Constraints and architectural compatibility

Decision: Core stabilization remains strictly inside MI LOGICA bounds:
- 5-layer architecture unchanged.
- Unidirectional data flow enforced.
- Metadata-driven UI behavior preserved.
- TypeScript + Vue 3 + Decorators stack unchanged.

Rationale: Stabilization must increase reliability without changing architectural identity.

Alternatives considered:
- Introducing a mid-layer abstraction for flexibility: rejected as A1 violation risk.

## 6. Decorator Behavior — Confirmed in Implementation

1. `@OnViewFunction` metadata is attached to methods only and consumed by action-bar composition. Non-method placement is a no-op; no runtime error is thrown.
2. `@NotRequiresLogin()` is metadata-only; `isNotRequiresLogin()` returns `true` only for entities decorated with it. Router guard integration is pending (TD-04).

## 7. Technical Debt: Login Integration

`@NotRequiresLogin()` is introduced now as a contract marker only. Login/authorization guards must consume this metadata in a dedicated authentication phase.

Login-phase TODO references:

1. Add route guard integration that checks `entity.isNotRequiresLogin()` before auth enforcement.
2. Add module-level auth policy documentation with precedence over per-entity exemptions.
3. Add automated tests covering mixed protected/open modules.

## Planning Summary (Historical)

All prior unknowns were resolved before implementation. No constitutional blocker was identified. Design proceeded to data model, contracts, and quickstart artifacts.

## Implemented Baseline Snapshot

This snapshot describes the delivered state of the framework at the close of Phase 01 (including Phase 2 tasks).

### Architecture

- 5-layer flow preserved: Entities → Decorators → BaseEntity → Application → UI.
- Unidirectional data flow enforced (no UI-to-entity side channels outside application orchestration).
- Metadata-driven rendering: list columns and detail inputs derived entirely from property decorators.
- State management: three Pinia stores (`appConfig`, `view`, `ui`) back `ApplicationClass` reactive properties.
- **`previewFile` shared reactive ref**: a `shallowRef<File | null>` declared in `src/stores/file_preview_store.ts`. Used for modal file preview coordination between the `Configuration` entity (injected via `@ModuleCustomComponents`) and `FilePreviewComponent`. This is **not** a Pinia store but is architecturally equivalent to a fourth piece of global reactive state. Not surfaced through `Application.*` properties. (Fixes DG-04)

### Decorators Delivered

Complete inventory of all 34 delivered decorator files in `src/decorations/` (excluding `index.ts`).

**Class-scope decorators** (applied to entity class):

| Decorator | Scope | Behavior |
|-----------|-------|----------|
| `@Module(config)` | Class | Chains `@ModuleName`, `@ModuleIcon`, `@ApiEndpoint`, `@ApiMethods`, `@Persistent` into one call |
| `@DefaultProperty(key)` | Class | Marks which property is used as display label in relation fields |
| `@DefaultViewButtonList(buttons)` | Class | Overrides the default action button list shown in list/detail views |
| `@ModuleCustomComponents(components)` | Class | Registers custom Vue components to inject alongside the module UI |
| `@ModuleDefaultComponent(component)` | Class | Sets the Vue component rendered as the module's default (home) view |
| `@ModuleDetailComponent(component)` | Class | Sets the Vue component rendered as the module's detail view |
| `@ModuleListComponent(component)` | Class | Sets the Vue component rendered as the module's list view |
| `@ModulePermission(permission)` | Class | Attaches a permission key to the module (enforcement pending — see TD-05) |
| `@NotRequiresLogin()` | Class | Marks entity as auth-exempt; `isNotRequiresLogin()` returns `true` |
| `@PrimaryProperty(key)` | Class | Designates the primary key property used in CRUD operations |
| `@UniquePropertyKey(key)` | Class | Designates the unique identifier property for deduplication |

**Method-scope decorators** (applied to entity methods):

| Decorator | Scope | Behavior |
|-----------|-------|----------|
| `@OnViewFunction(icon, text, viewTypes[])` | Method | Registers method as action button; button is filtered and shown only when active `ViewType` matches |

**Property-scope decorators** (applied to entity class properties):

| Decorator | Scope | Behavior |
|-----------|-------|----------|
| `@AsyncValidation(fn)` | Property | Registers an async validator function; debounce controlled by `VITE_ASYNC_VALIDATION_DEBOUNCE` (default 300 ms) |
| `@CSSColumnClass(class)` | Property | Attaches a CSS class string to the property's table column in list view |
| `@Disabled(condition?)` | Property | Marks the field as non-editable; optionally accepts a reactive condition |
| `@DisplayFormat(fn)` | Property | Registers a formatting function applied when rendering the value in list view |
| `@HelpText(text)` | Property | Attaches a helper text string displayed below the input in detail view |
| `@HideInDetailView()` | Property | Excludes the property from detail view rendering |
| `@HideInListView()` | Property | Excludes the property from list view (table column) rendering |
| `@Mask(pattern)` | Property | Applies an input mask pattern for formatted data entry |
| `@MaxSizeFiles(mb)` | Property | Sets the maximum allowed upload file size in megabytes for FILE fields |
| `@MaxStringSize(n)` | Property | Sets the maximum character length for string-type inputs |
| `@MaxTagSize(n)` | Property | Sets the maximum character length per tag in TAGS fields |
| `@MaxTags(n)` | Property | Sets the maximum number of tags allowed in TAGS fields |
| `@PersistentKey(key)` | Property | Overrides the serialization key used when mapping to/from the API payload |
| `@PropertyIndex(n)` | Property | Sets the display order index; properties are rendered in ascending index order |
| `@PropertyName(label)` | Property | Sets the human-readable label shown in list columns and detail form inputs |
| `@Readonly(condition?)` | Property | Marks the field as read-only in the UI; optionally accepts a reactive condition |
| `@Required()` | Property | Marks the field as required; triggers required validation before sync/async checks |
| `@StringTypeDef(type)` | Property | Declares the semantic input type (e.g., `EMAIL`, `PASSWORD`, `URL`, `TEXTAREA`, `FILE`, `TAGS`, `DATE`, `TIME`, `DATETIME`, `COLOR`, `SEARCH`, `TELEPHONE`, `CREDIT_CARD`, etc.) |
| `@SupportedFiles(types)` | Property | Restricts accepted file mime types for FILE fields |
| `@TabOrder(n)` | Property | Assigns the property to a named tab group with the given order index |
| `@Validation(fn)` | Property | Registers a sync validator function; runs after required checks, before async |
| `@ViewGroup(group)` | Property | Groups the property under a named collapsible section in detail view |
| `@ViewGroupRow(row)` | Property | Positions the property within a horizontal row inside its `@ViewGroup` |
| `@ArrayOf(EntityClass)` | Property | Declares that the property is a typed array of a `BaseEntity` subclass |

### UI Behaviors Delivered

- Sidebar expanded layout: header (logo-only), body (module navigation), footer (title + copyright + version).
- Sidebar collapsed layout: icon-only items, reduced padding, rounded borders, `squared_app_logo_image` at 1:1 ratio.
- Table footer/pagination anchored to container width; only header/body scrolls.
- All navigation entry points use a single centralized dirty-guard pipeline.

### CRUD Lifecycle Order (Canonical)

`guard → validate (required → sync → async) → loading-on → API call → state reconcile → loading-off → notify`

### save() vs update() Behavioral Difference

> **Under triage** — see BD-01 through BD-05 in `tech-debt-register.md`.

| Step | `save()` | `update()` |
|------|---------|------------|
| 1. Endpoint guard | `validatePersistenceConfiguration()` | `validatePersistenceConfiguration()` |
| 2. Method guard | `validateApiMethod('POST')` | `validateApiMethod('PUT')` |
| 3. isNew() guard | No (save assumes new entity) | Yes — returns with ERROR dialog if entity has no persisted ID |
| 4. Input validation | `validateInputs()` — required → sync → async | **Not performed** |
| 5. Loading overlay | `_isSaving = true`; `showLoadingMenu()` | **Not shown** (`_isSaving = true` but no `showLoadingMenu`) |
| 6. API call | POST | PUT |
| 7. State reconcile | `Object.assign`; `_originalState` reset | `Object.assign`; `_originalState` reset |
| 8. Success notification | `showToast(SUCCESS)` | **Not emitted** |
| 9. On error | `saveFailed()`; `openConfirmationMenu(ERROR)` | `updateFailed()`; `openConfirmationMenu(ERROR)` |

**Key difference**: `update()` bypasses input validation (BD-01), loading overlay (BD-02), and success toast (BD-03). Calling `update()` with invalid data allows it to reach the API without any validation checks. This is the highest-risk behavioral debt item in the current codebase.

### Open Technical Debts

| ID | Area | Status |
|----|------|--------|
| TD-02 | JWT in localStorage | OPEN |
| TD-03 | Zero automated test coverage | OPEN |
| TD-04 | @NotRequiresLogin router guard | OPEN |
| TD-05 | Field/action permission enforcement | OPEN |
| TD-07 | Async validation debounce verification | OPEN |

---

## Canonical Terminology

Use these terms consistently across all artifacts:

| Preferred Term | Do Not Use |
|----------------|------------|
| 5-layer architecture | 5-layer model, layered model |
| application orchestrator / Application | app orchestrator, orchestration service |
| centralized dirty-guard navigation | dirty-guard pipeline, navigation guard |
| container-anchored footer | pinned footer, fixed-position footer |
| metadata-driven UI | decorator-driven UI, metadata-based UI |
| Pinia store | store, reactive store |
| CSR (Client-Side Rendering) | SPA-only (prefer CSR-first) |

---

## Implementation Handoff Summary

1. Foundational metadata and decorators for custom actions and login exemption are implemented.
2. Action-bar rendering now supports method-driven, view-filtered custom buttons.
3. Configuration management moved into `Configuration` entity with local persistence path.
4. Startup modules include `Home` and no longer include legacy `Customer`.
5. Remaining work should focus on dedicated login phase behavior and automation depth.

---

## Phase 2 Post-Analysis Technical Debts

Added after Phase 01 post-mortem analysis (2026-03-06). All items are formally tracked as open debts.

### TD-01: Platform Clarification — CSR-First Architecture

**Status**: RESOLVED (clarification only)

This framework is a **CSR-first (Client-Side Rendering)** SaaS template. Although some utilities may be compatible with SSR environments, the architecture is not designed for SSR and the majority of its patterns (singleton, `window` access, `localStorage`, reactive refs) assume a browser context. No SSR support is planned. Any future SSR work would require a dedicated phase.

### TD-02: Authentication Flow

**Status**: OPEN — Technical Debt

The current authentication implementation has the following known issues:
1. JWT access token stored in `localStorage` — vulnerable to XSS (OWASP A07).
2. No refresh token rotation on 401 — token revocation requires manual logout.
3. `logout()` in `TopBarComponent` was a stub (`console.log`), addressed in Phase 2 (T099).
4. When 401 is received, refresh token (`authRefreshTokenKey`) is not cleared alongside the access token.

**Remediation scope**: Dedicated auth phase. Options include: HttpOnly cookie strategy (requires backend coordination), in-memory token with refresh cycle, or short-lived JWT with sliding refresh.

Cross-references: T099 (logout fix in Phase 2), T052 (login guard tech debt from Phase 1).

### TD-03: Automated Testing — Zero Coverage Baseline

**Status**: OPEN — Technical Debt

The project has a zero automated-test baseline. No unit, integration, or E2E tests exist. This means:
1. Decorator metadata extraction regressions are undetected.
2. Validator logic is not verified for edge cases.
3. Application state machine transitions have no regression harness.
4. Form rendering correctness depends entirely on manual smoke checks.

**Remediation scope**: Adopt Vitest (native Vite integration). Priority coverage: `BaseEntity` static methods, `common_validators.ts`, Pinia stores (after US5), `useInputMetadata.ts`.

### TD-04: @NotRequiresLogin Router Guard Integration

**Status**: OPEN — Technical Debt

`@NotRequiresLogin()` decorator is implemented as metadata-only (T049–T053). The `router/index.ts` guard does NOT consume `isNotRequiresLogin()` for auth enforcement. Until this is wired, the decorator has no runtime effect on routing.

**Remediation scope**: Dedicated login/auth phase. The guard implementation requires a concrete auth session service to check against.

Cross-references: T052, T053 (Phase 1 debt markers), T109 (Phase 2 debt marker).

### TD-05: Field-Level and Action-Level Permission System

**Status**: OPEN — Technical Debt

`@ModulePermission` decorator exists and is stored in metadata, but no runtime permission enforcement is implemented in:
- Column rendering (should hide/disable columns based on user role)
- Action buttons (should suppress buttons not permitted for current user)
- Detail form fields (should disable fields the user cannot edit)

**Remediation scope**: Depends on auth phase being complete (requires a user session with role information). Design should use `Application.ApplicationUIService` to inject permission context.

### TD-06: Breadcrumb Navigation — Explicitly Not Required

**Status**: CLOSED — Architectural Decision

Breadcrumb navigation was evaluated and **explicitly decided to not be required** for this system. The current `TopBarComponent` showing module name + icon is sufficient for navigation context. This decision is final for the current scope and should be re-evaluated only if multi-level entity hierarchies are introduced.

---

### TD-07: Async Validation Debounce — Evaluation Deferred

**Status**: OPEN — Technical Debt

The debounce wrapper in `useInputMetadata.ts` (T131) is implemented: `isAsyncValidation(propertyKey)` calls are delayed by `Application.AppConfiguration.value.asyncValidationDebounce` ms (default 300 ms, configurable via `VITE_ASYNC_VALIDATION_DEBOUNCE`). However, correctness verification requires at least one entity property carrying a real `@AsyncValidation` decorator wired to an external or mock endpoint.

Until such a scenario is available in the project, the feature is functionally untestable against observable behaviour. The current `product.ts` has the commented-out `AsyncValidators` import but no active `@AsyncValidation` usage.

**Remediation scope**: Add a local mock async validator to `product.ts` (e.g. on the `email` field simulating a duplicate-check) and document the debounce smoke-test steps in `quickstart.md`.

Cross-references: T129–T131 (debounce implementation in Phase 15), T023 / T081 (decorator + BaseEntity accessor).

---

## Phase 2 Implementation Summary (T081–T133)

**Completed**: All 53 tasks across Phases 8–16 implemented.

### Key decisions made during implementation

| Area | Decision |
|------|----------|
| Pinia bootstrap timing | `setActivePinia(createPinia())` called before `Application.initializeApplication()` in `main.ts` so stores are usable before the Vue app mounts. |
| ApplicationClass public API | `Application.AppConfiguration`, `Application.View`, `Application.ModuleList`, etc. remain `Ref<T>` properties; now backed by Pinia `storeToRefs()` instead of bare `ref()`. No breaking change for callers. |
| InputRegistry | Module-level singleton (`inputRegistry`) with `register()`/`resolve()`. 16 input types registered via dedicated `OBJECT_TYPE_SENTINEL` and `ENUM_TYPE_SENTINEL` symbols to avoid type-constructor collisions. |
| useFormRenderer composable | Wraps `inputRegistry.resolve()` + model value helpers (get/set). Used by `default_detailview.vue` to replace the 16-branch v-if cascade. |
| Module composite decorator | `@Module(config)` chains `@ModuleName`, `@ModuleIcon`, `@ApiEndpoint`, `@ApiMethods`, `@Persistent` in a single call. Individual decorators remain available. |
| Async validation debounce | `useInputMetadata` now debounces `entity.isValidation()` calls using `Application.AppConfiguration.value.asyncValidationDebounce` (env: `VITE_ASYNC_VALIDATION_DEBOUNCE`, default 300 ms). |
| BaseEntity index type | Narrowed from `unknown` to `string \| number \| boolean \| Date \| BaseEntity \| BaseEntity[] \| object \| null \| undefined` to reduce type-casting noise. |
| system_name.png | Placeholder asset; replace with actual brand logo before production deployment. |

---

## Documentation Changelog

| Date | Artifact | Change | Task |
|------|----------|--------|------|
| 2026-03-25 | `research.md` | Added Documentation Sync Inventory section | T001 |
| 2026-03-25 | `research.md` | Added Documentation Artifact Checklist | T004 |
| 2026-03-25 | `research.md` | Added Editorial Rules (stale-content removal + contract synchronization) | T005, T008 |
| 2026-03-25 | `spec.md` | Added Documentation Cycle Policy (code-as-source-of-truth) | T002 |
| 2026-03-25 | `plan.md` | Added Documentation-Only Scope clause | T003 |
| 2026-03-25 | `plan.md` | Added Date and Version Update Convention | T007 |
| 2026-03-25 | `spec.md` | Added Traceability Format and Documentation Integrity Acceptance Gate sections | T006, T009 |
| 2026-03-25 | `spec.md` | Updated status to "Implemented — Documentation Realignment Active" | T010 |
| 2026-03-25 | `spec.md` | Reconciled scope, success criteria, pre-implementation gate, phase additions | T011, T013, T015 |
| 2026-03-25 | `plan.md` | Rewrote Summary and implementation phases to delivered framing | T016 |
| 2026-03-25 | `plan.md` | Updated Technical Context testing note; trimmed constitution-check boilerplate | T017, T018 |
| 2026-03-25 | `research.md` | Replaced stale assumptions section with Confirmed Decorator Behaviors | T019 |
| 2026-03-25 | `research.md` | Added Implemented Baseline Snapshot section | T020 |
| 2026-03-25 | `research.md` | Added Canonical Terminology table | T021 |
| 2026-03-25 | `data-model.md` | Annotated conceptual vs implemented entities; expanded Configuration fields | T022, T023 |
| 2026-03-25 | `quickstart.md` | Rebuilt Prerequisites section with full env var list | T024 |
| 2026-03-25 | `quickstart.md` | Rebuilt Development and Production smoke sections | T025 |
| 2026-03-25 | `contracts/base-entity-stability-contract.md` | Updated invariants; added non-persistent guard and BaseEntity index type | T026, T029 |
| 2026-03-25 | `contracts/application-orchestration-contract.md` | Updated Pinia backing note; cleaned planning language | T027, T030 |
| 2026-03-25 | `contracts/metadata-ui-contract.md` | Added InputRegistry, form-renderer, and sidebar-collapse guarantees | T028, T031 |
| 2026-03-25 | `spec.md` | Rewrote Section 10 traceability to documentation-realignment tasks T001-T048 | T032 |
| 2026-03-25 | `quickstart.md` | Added Section 19 Release-Readiness Documentation Checklist | T034 |
| 2026-03-25 | `spec.md` | Added Section 14 Terminal Phase Closure | T035 |
| 2026-03-25 | `plan.md` | Added Final Plan Closure section and updated Technical Debt Register table | T036 |
| 2026-03-25 | `research.md` | Added this Documentation Changelog | T037 |
| 2026-03-25 | `research.md` | Added Documentation Maintenance Protocol | T038 |
| 2026-03-25 | `spec.md` | Cycle 2: Updated status to "Doc-Accuracy Patch Cycle 2 Active"; updated Traceability Format to T001-T026; updated Acceptance Gate to Cycle 2 gate | T001 (C2) |
| 2026-03-25 | `tech-debt-register.md` | Cycle 2: Created consolidated register (DA-01–DA-10, DG-01–DG-07, BD-01–BD-05, TD-02–TD-07) | T002 (C2) |
| 2026-03-25 | `tech-debt-register.md` | Cycle 2: Updated DA-10 Code Reality with canonical 15-variable env var list; corrected all 17 Fix Task IDs (all were off by -2) | T003 (C2) |
| 2026-03-25 | `data-model.md` | Cycle 2: Removed `asyncValidationDebounce` from Configuration fields; added inline note explaining it is not a class property (DA-02) | T005 (C2) |
| 2026-03-25 | `data-model.md` | Cycle 2: Fixed `selectedLanguage` type from `string` to `Language` enum (DA-03) | T006 (C2) |
| 2026-03-25 | `data-model.md` | Cycle 2: Added all 9 missing Configuration fields (indices 3, 6-13) in correct PropertyIndex order with env var and default (DA-04) | T007 (C2) |
| 2026-03-25 | `data-model.md` | Cycle 2: Added §1.5 Product entity with all 24 fields grouped by ViewGroup, module config, and key decorators (DG-01) | T008 (C2) |
| 2026-03-25 | `data-model.md` | Cycle 2: Added §2.3 Home entity with class decorators and empty property body note (DG-02) | T009 (C2) |
| 2026-03-25 | `quickstart.md` | Cycle 2: Fixed Node.js version from "18+" to "^20.19.0 or >=22.12.0" (DA-01) | T010 (C2) |
| 2026-03-25 | `quickstart.md` | Cycle 2: Replaced `VITE_APP_LOGO` with `VITE_SQUARED_APP_LOGO_IMAGE` (DA-09) | T011 (C2) |
| 2026-03-25 | `quickstart.md` | Cycle 2: Expanded .env template from 5 to 15 variables grouped by category with types, defaults, and notes (DA-10) | T012 (C2) |
| 2026-03-25 | `quickstart.md` | Cycle 2: Added Bootstrap Sequence subsection documenting main.ts initialization order (DG-06) | T013 (C2) |
| 2026-03-25 | `contracts/base-entity-stability-contract.md` | Cycle 2: Replaced all `isDirty` property references with `getDirtyState()` method; added note on how dirty state is reset (DA-06) | T014 (C2) |
| 2026-03-25 | `contracts/base-entity-stability-contract.md` | Cycle 2: Rewrote update() operation sequence to match actual implementation; added behavioral note cross-referencing BD-01–BD-03 (DA-07) | T015 (C2) |
| 2026-03-25 | `contracts/base-entity-stability-contract.md` | Cycle 2: Rewrote delete() operation sequence to match actual implementation; added behavioral note cross-referencing BD-04–BD-05 (DA-08) | T016 (C2) |
| 2026-03-25 | `contracts/application-orchestration-contract.md` | Cycle 2: Corrected Commitment 6 — replaced incorrect "moduleList store" with accurate description of moduleList as ref inside view store via storeToRefs (DA-05) | T017 (C2) |
| 2026-03-25 | `contracts/application-orchestration-contract.md` | Cycle 2: Added Application.ListButtons (listButtons ref from view store) to Pinia backing section (DG-05) | T018 (C2) |
| 2026-03-25 | `research.md` | Cycle 2: Expanded Decorators Delivered table from 4 entries to all 34 delivered decorators with scope and behavior (DG-07) | T019 (C2) |
| 2026-03-25 | `research.md` | Cycle 2: Added previewFile shallowRef to Architecture section (DG-04) | T020 (C2) |
| 2026-03-25 | `research.md` | Cycle 2: Added save() vs update() Behavioral Difference comparison table under Implemented Baseline Snapshot (DG-03) | T021 (C2) |
| 2026-03-25 | `research.md` | Cycle 2: Reset Documentation Artifact Checklist to [ ] for new cycle; added tech-debt-register.md as item 9 (T022) | T022 (C2) |

---

## Documentation Maintenance Protocol

**Purpose**: Keep spec artifacts aligned with the codebase after each batch of implementation work.

**Trigger**: After every feature branch or implementation batch is merged to `master` or `phase-*` branches.

### Checklist (run after each merge)

1. **Spec review** (`spec.md`):
   - Do any functional requirements describe planned behavior that is now delivered? Mark them ✅.
   - Are there references to task IDs that no longer exist? Update or remove them.

2. **Plan review** (`plan.md`):
   - Are any implementation phases marked as "planned" but now complete? Mark them ✅.
   - Are new technical debts introduced? Add them to the Technical Debt Register.

3. **Research review** (`research.md`):
   - Is the Implemented Baseline Snapshot still accurate? Update if new behaviors were added.
   - Are any decisions listed as "deferred" now resolved? Move to Confirmed/Delivered.
   - Add a row to the Documentation Changelog.

4. **Data model review** (`data-model.md`):
   - Were new entities added to `src/entities/`? Add them with *[Implemented]* annotation.
   - Were any conceptual entities promoted to implemented? Remove the *[Conceptual]* note.

5. **Quickstart review** (`quickstart.md`):
   - Are the Prerequisites still accurate for the current stack?
   - Do the smoke checklists reflect all current user stories and UI behaviors?
   - Is the Release-Readiness Checklist up to date?

6. **Contracts review** (`contracts/*.md`):
   - Follow the Contract Synchronization Rules in the Editorial Rules section above.
   - Update `Last updated` date on any modified contract file.

7. **Tasks review** (`tasks.md`):
   - Mark all completed tasks `[X]`.
   - If a documentation cycle is concluded, create a new tasks.md for the next cycle.

**Update the Last updated date** in each modified artifact's front-matter on every maintenance pass.

---

## Final Documentation Handoff Summary (T048)

**Cycle**: Phase 01 — Core Stabilization — Documentation Realignment  
**Completed**: 2026-03-25  
**Tasks completed**: T001–T048 (48/48)

### What Was Done

This documentation-realignment cycle brought all 8 spec artifacts into alignment with the committed implementation. No source code was modified. All changes were limited to the `specs/phase-01-core-stabilization/` directory.

| Artifact | Primary Changes |
|----------|----------------|
| `spec.md` | Status header updated; traceability section rewritten to reference T001-T048; section numbering corrected (13–15); terminal closure section added |
| `plan.md` | Documentation-only scope clause; all F1–F4 implementation phases marked delivered; technical debt register table; Final Plan Closure section |
| `research.md` | Assumptions → confirmed behaviors; implemented-baseline snapshot; canonical terminology table; documentation changelog (37 entries); maintenance protocol; artifact checklist all `[X]` |
| `data-model.md` | `[Conceptual]` / `[Implemented]` annotations on all entities; `Configuration` fields fully enumerated |
| `quickstart.md` | Prerequisites rebuilt with full `.env` template; smoke sections updated; Section 19 release-readiness checklist; Section 20 verification log |
| `base-entity-stability-contract.md` | Non-persistent guard; `isDirty=false` post-save invariant; `BaseEntity` index type narrowing; phase header |
| `application-orchestration-contract.md` | Pinia backing note; Routing Rule 6; present-tense error language; phase header |
| `metadata-ui-contract.md` | `InputRegistry` note; sidebar-collapse guarantee (Rule 6); `@OnViewFunction` filters (Rules 7–8); phase header |

### Acceptance Gate Result

All 8 artifacts in the Documentation Artifact Checklist are marked `[X]`. The release-readiness checklist in `quickstart.md` Section 19 shows 14/14 items passing. The end-to-end verification log in Section 20 confirms all artifacts consistent.

### Handoff Recommendations

1. **Next implementation phase** should open a new feature branch (`phase-02-*`) and create a corresponding `specs/phase-02-*/` directory.
2. **Do not modify** `specs/phase-01-core-stabilization/` after this commit except to fix factual errors found in review.
3. Track any newly discovered tech debt as new entries in the Technical Debt Register (`plan.md`) rather than opening tasks in this cycle.
4. Follow the Documentation Maintenance Protocol (see above) for every future documentation pass.

**Phase 01 is closed.**
