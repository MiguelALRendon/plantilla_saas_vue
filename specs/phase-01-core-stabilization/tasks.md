# Tasks: Phase 01 - Core Stabilization

**Input**: Design documents from `/specs/phase-01-core-stabilization/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`

**Tests**: Include minimal smoke/manual checks per affected flow.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unmet dependency)
- **[US1]**: Stable extensible module actions and module cleanup (P1)
- **[US2]**: Configuration entity and configuration detail flow (P2)
- **[US3]**: Login-exemption metadata and production closure checks (P3)

---

## Phase 1: Setup (Shared Planning and Alignment)

**Purpose**: Confirm feature boundaries and planning assets before code tasks.

- [ ] T001 Validate feature artifacts are complete in `specs/phase-01-core-stabilization/plan.md`
- [ ] T002 [P] Document requested scope additions for decorators/entities in `specs/phase-01-core-stabilization/spec.md`
- [ ] T003 [P] Add tasking assumptions and risks for new decorators in `specs/phase-01-core-stabilization/research.md`
- [ ] T004 [P] Add model notes for `ExtraFunctions` and `Configuration` in `specs/phase-01-core-stabilization/data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and metadata plumbing required by user stories.

**⚠️ CRITICAL**: No user story implementation starts until this phase is complete.

- [ ] T005 Create `ExtraFunctions` interface in `src/types/extra_functions.ts`
- [ ] T006 [P] Export `ExtraFunctions` in `src/types/index.ts`
- [ ] T007 [P] Add `ViewType[]` compatibility imports in `src/types/extra_functions.ts`
- [ ] T008 Implement symbol key and metadata helpers for view functions in `src/decorations/on_view_function_decorator.ts`
- [ ] T009 [P] Export `OnViewFunction` in `src/decorations/index.ts`
- [ ] T010 Implement symbol key and decorator function for login exemption in `src/decorations/not_requires_login_decorator.ts`
- [ ] T011 [P] Export `NotRequiresLogin` in `src/decorations/index.ts`
- [ ] T012 Add `getCustomFunctions(): ExtraFunctions[]` base contract in `src/entities/base_entity.ts`
- [ ] T013 Add `isNotRequiresLogin(): boolean` in `src/entities/base_entity.ts`
- [ ] T014 Add technical debt note for login-phase implementation in `specs/phase-01-core-stabilization/research.md`

**Checkpoint**: Metadata foundation ready for story implementation.

---

## Phase 3: User Story 1 - Dynamic View Actions and Base Module Cleanup (Priority: P1) 🎯 MVP

**Goal**: Enable method-scoped custom view actions via `@OnViewFunction`, render them in the action bar by current `ViewType`, add `Home` module, and remove `Customer` from active flow.

**Independent Test**: A module method decorated with `@OnViewFunction` appears as a button only in configured views (DEFAULT/LIST/DETAIL), executes on current entity instance, `Home` appears in module list, and `Customer` is removed from registration.

### Tests and Smoke Checks for User Story 1

- [ ] T015 [P] [US1] Add manual smoke checklist for `OnViewFunction` per view type in `specs/phase-01-core-stabilization/quickstart.md`
- [ ] T016 [P] [US1] Add method-decorator misuse validation case (class/property no-op) in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 1

- [ ] T017 [US1] Implement `@OnViewFunction(icon, text, viewTypes[])` as method-only metadata decorator in `src/decorations/on_view_function_decorator.ts`
- [ ] T018 [US1] Implement no-op behavior for non-method usage inside `src/decorations/on_view_function_decorator.ts`
- [ ] T019 [US1] Extend metadata extraction to return bound functions in `src/entities/base_entity.ts`
- [ ] T020 [US1] Create reusable button prop contract for extra actions in `src/components/Buttons/GenericButtonComponent.vue`
- [ ] T021 [US1] Render icon/text from `ExtraFunctions` metadata in `src/components/Buttons/GenericButtonComponent.vue`
- [ ] T022 [US1] Ensure extra action executes bound instance method in `src/components/Buttons/GenericButtonComponent.vue`
- [ ] T023 [US1] Inject filtered custom buttons by current view in `src/models/application.ts`
- [ ] T024 [US1] Merge extra buttons with existing action list in `src/components/ActionsComponent.vue`
- [ ] T025 [P] [US1] Create `Home` entity scaffold extendable by inheritance in `src/entities/home.ts`
- [ ] T026 [US1] Register `Home` module in startup flow in `src/main.ts`
- [ ] T027 [P] [US1] Remove `Customer` entity registration and imports from `src/main.ts`
- [ ] T028 [P] [US1] Remove `Customer` entity file and references in `src/entities/customer.ts`
- [ ] T029 [US1] Remove stale customer references from docs/examples in `specs/phase-01-core-stabilization/quickstart.md`
- [ ] T030 [US1] Validate action bar behavior for DEFAULTVIEW in `src/views/default_detailview.vue`
- [ ] T031 [US1] Validate action bar behavior for LISTVIEW in `src/views/default_listview.vue`
- [ ] T032 [US1] Validate action bar behavior for DETAILVIEW in `src/views/default_detailview.vue`

**Checkpoint**: US1 complete with dynamic decorator-based actions and module cleanup.

---

## Phase 4: User Story 2 - Configuration Entity and Dedicated Detail Flow (Priority: P2)

**Goal**: Move system configuration into a `Configuration` BaseEntity instance, open it from `ConfigurationListComponent`, and persist changes via localStorage from a dedicated `guardar` method.

**Independent Test**: From `ConfigurationListComponent`, user opens Configuration detail, sees all configuration fields including theme and language, modifies values, saves with `guardar`, and values persist to localStorage and reload correctly.

### Tests and Smoke Checks for User Story 2

- [ ] T033 [P] [US2] Add configuration detail smoke steps and expected behavior in `specs/phase-01-core-stabilization/quickstart.md`
- [ ] T034 [P] [US2] Add persistence verification steps for `guardar` + reload in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 2

- [ ] T035 [US2] Create `Configuration` entity extending `BaseEntity` in `src/entities/configuration.ts`
- [ ] T036 [US2] Move `AppConfiguration` structure into `Configuration` entity properties in `src/entities/configuration.ts`
- [ ] T037 [US2] Implement `guardar()` localStorage persistence method in `src/entities/configuration.ts`
- [ ] T038 [US2] Add mapper/helpers between `Application.AppConfiguration` and `Configuration` in `src/models/application.ts`
- [ ] T039 [US2] Add navigation button to open configuration detail in `src/views/ConfigurationListComponent.vue`
- [ ] T040 [US2] Load current app configuration object into configuration detail flow in `src/views/ConfigurationListComponent.vue`
- [ ] T041 [US2] Render full configuration fields in detail view components in `src/views/default_detailview.vue`
- [ ] T042 [US2] Include theme and language fields in `Configuration` detail rendering in `src/entities/configuration.ts`
- [ ] T043 [US2] Remove theme/language controls from `ConfigurationListComponent` in `src/views/ConfigurationListComponent.vue`
- [ ] T044 [US2] Ensure `Configuration` is NOT registered in module list in `src/main.ts`
- [ ] T045 [US2] Add save action wiring to call `guardar()` for configuration entity in `src/components/Buttons/SaveButtonComponent.vue`
- [ ] T046 [US2] Validate configuration reload applies dark mode and language state in `src/App.vue`

**Checkpoint**: US2 complete with dedicated configuration entity/detail flow and persistence.

---

## Phase 5: User Story 3 - Login Exemption Metadata and Production Readiness Closure (Priority: P3)

**Goal**: Introduce `@NotRequiresLogin()` metadata support and close first functional version with production smoke checks and technical debt tracking.

**Independent Test**: Entities decorated with `@NotRequiresLogin()` return true from `isNotRequiresLogin()`, non-decorated entities return false, and release smoke checklist passes build/preview/critical navigation flows.

### Tests and Smoke Checks for User Story 3

- [ ] T047 [P] [US3] Add smoke checks for login-exemption metadata behavior in `specs/phase-01-core-stabilization/quickstart.md`
- [ ] T048 [P] [US3] Add production build and preview acceptance checklist in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 3

- [ ] T049 [US3] Implement `@NotRequiresLogin()` decorator metadata storage in `src/decorations/not_requires_login_decorator.ts`
- [ ] T050 [US3] Implement boolean resolver for login exemption in `src/entities/base_entity.ts`
- [ ] T051 [US3] Add example usage on `Home` entity in `src/entities/home.ts`
- [ ] T052 [US3] Mark login enforcement integration as technical debt in `specs/phase-01-core-stabilization/plan.md`
- [ ] T053 [US3] Document login-phase TODO references in `specs/phase-01-core-stabilization/research.md`
- [ ] T054 [US3] Validate no runtime regressions in module registration and view transitions in `src/models/application.ts`
- [ ] T055 [US3] Validate production-oriented smoke flow completion in `specs/phase-01-core-stabilization/quickstart.md`

**Checkpoint**: US3 complete with metadata support and release closure criteria.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Final consistency, documentation, and readiness validation across stories.

- [ ] T056 [P] Update task traceability notes in `specs/phase-01-core-stabilization/spec.md`
- [ ] T057 [P] Update contracts with finalized behavior notes in `specs/phase-01-core-stabilization/contracts/metadata-ui-contract.md`
- [ ] T058 Perform end-to-end smoke pass for US1-US3 in `specs/phase-01-core-stabilization/quickstart.md`
- [ ] T059 Confirm no constitutional violations introduced in `specs/phase-01-core-stabilization/plan.md`
- [ ] T060 Prepare implementation handoff summary in `specs/phase-01-core-stabilization/research.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; can proceed after US1 or in parallel when foundation is complete.
- **Phase 5 (US3)**: Depends on Phase 2 and partially on US1 (`Home` usage example).
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational completion.
- **US2 (P2)**: Uses existing detail flow; independent of US3.
- **US3 (P3)**: Depends on `Home` availability from US1 for a concrete decorator usage example.

### Within Each User Story

- Define/adjust tests and smoke checks first.
- Implement decorators/types before consuming components.
- Implement model/entity behavior before UI integration.
- Complete story validation before moving to next priority.

---

## Parallel Opportunities

- Setup tasks `T002-T004` can run in parallel.
- Foundational tasks `T006-T007`, `T009`, `T011` can run in parallel after base files exist.
- US1 smoke tasks `T015-T016` can run in parallel with early implementation.
- US1 module cleanup tasks `T025`, `T027`, `T028` can run in parallel.
- US2 smoke tasks `T033-T034` can run in parallel.
- US3 smoke tasks `T047-T048` can run in parallel.
- Polish docs tasks `T056-T057` can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallelizable documentation/smoke prep
T015 [US1] quickstart view-type smoke checklist
T016 [US1] quickstart no-op misuse checklist

# Parallelizable code tasks after decorator contract exists
T025 [US1] create src/entities/home.ts
T027 [US1] remove customer registration in src/main.ts
T028 [US1] remove src/entities/customer.ts references
```

## Parallel Example: User Story 2

```bash
# Parallelizable validation preparation
T033 [US2] config detail smoke steps
T034 [US2] guardar persistence smoke steps

# Parallelizable implementation slices
T039 [US2] open detail button in src/views/ConfigurationListComponent.vue
T043 [US2] remove theme/language controls in src/views/ConfigurationListComponent.vue
```

## Parallel Example: User Story 3

```bash
# Parallelizable docs and validation
T047 [US3] login exemption smoke checks
T048 [US3] production acceptance checklist

# Parallelizable technical debt documentation
T052 [US3] plan technical debt note
T053 [US3] research technical debt references
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Complete US1 for decorator-driven extra actions + module cleanup.
3. Validate US1 independently via quickstart smoke checks.

### Incremental Delivery

1. Deliver US1 (core extensibility and cleanup baseline).
2. Deliver US2 (configuration refactor and persistence flow).
3. Deliver US3 (login-exemption metadata + production closure).

### Suggested MVP Scope

MVP scope is **US1 only** once foundational tasks are complete.
