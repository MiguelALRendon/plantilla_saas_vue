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
- **[US4]**: Non-persistent safety guards and framework i18n hardening (P1)
- **[US15]**: Calendar and time input components with custom calendar/clock UI (P1)
- **[US16]**: Color picker input component (P1)
- **[US17]**: File upload input with SupportedFiles and MaxSizeFiles decorators (P1)
- **[US18]**: Tag input with MaxTags, MaxTagSize, and MaxStringSize decorators (P1)

---

## Phase 1: Setup (Shared Planning and Alignment)

**Purpose**: Confirm feature boundaries and planning assets before code tasks.

- [X] T001 Validate feature artifacts are complete in `specs/phase-01-core-stabilization/plan.md`
- [X] T002 [P] Document requested scope additions for decorators/entities in `specs/phase-01-core-stabilization/spec.md`
- [X] T003 [P] Add tasking assumptions and risks for new decorators in `specs/phase-01-core-stabilization/research.md`
- [X] T004 [P] Add model notes for `ExtraFunctions` and `Configuration` in `specs/phase-01-core-stabilization/data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and metadata plumbing required by user stories.

**⚠️ CRITICAL**: No user story implementation starts until this phase is complete.

- [X] T005 Create `ExtraFunctions` interface in `src/types/extra_functions.ts`
- [X] T006 [P] Export `ExtraFunctions` in `src/types/index.ts`
- [X] T007 [P] Add `ViewType[]` compatibility imports in `src/types/extra_functions.ts`
- [X] T008 Implement symbol key and metadata helpers for view functions in `src/decorations/on_view_function_decorator.ts`
- [X] T009 [P] Export `OnViewFunction` in `src/decorations/index.ts`
- [X] T010 Implement symbol key and decorator function for login exemption in `src/decorations/not_requires_login_decorator.ts`
- [X] T011 [P] Export `NotRequiresLogin` in `src/decorations/index.ts`
- [X] T012 Add `getCustomFunctions(): ExtraFunctions[]` base contract in `src/entities/base_entity.ts`
- [X] T013 Add `isNotRequiresLogin(): boolean` in `src/entities/base_entity.ts`
- [X] T014 Add technical debt note for login-phase implementation in `specs/phase-01-core-stabilization/research.md`
- [X] T061 [P] Update `GenericButtonComponent` visual palette using framework CSS tokens in `src/components/Buttons/GenericButtonComponent.vue`
- [X] T062 Add startup localStorage bootstrap contract (set if missing, load if present) in `src/models/application.ts`

**Checkpoint**: Metadata foundation ready for story implementation.

---

## Phase 3: User Story 1 - Dynamic View Actions and Base Module Cleanup (Priority: P1) 🎯 MVP

**Goal**: Enable method-scoped custom view actions via `@OnViewFunction`, render them in the action bar by current `ViewType`, add `Home` module, and remove `Customer` from active flow.

**Independent Test**: A module method decorated with `@OnViewFunction` appears as a button only in configured views (DEFAULT/LIST/DETAIL), executes on current entity instance, `Home` appears in module list, and `Customer` is removed from registration.

### Tests and Smoke Checks for User Story 1

- [X] T015 [P] [US1] Add manual smoke checklist for `OnViewFunction` per view type in `specs/phase-01-core-stabilization/quickstart.md`
- [X] T016 [P] [US1] Add method-decorator misuse validation case (class/property no-op) in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 1

- [X] T017 [US1] Implement `@OnViewFunction(icon, text, viewTypes[])` as method-only metadata decorator in `src/decorations/on_view_function_decorator.ts`
- [X] T018 [US1] Implement no-op behavior for non-method usage inside `src/decorations/on_view_function_decorator.ts`
- [X] T019 [US1] Extend metadata extraction to return bound functions in `src/entities/base_entity.ts`
- [X] T020 [US1] Create reusable button prop contract for extra actions in `src/components/Buttons/GenericButtonComponent.vue`
- [X] T021 [US1] Render icon/text from `ExtraFunctions` metadata in `src/components/Buttons/GenericButtonComponent.vue`
- [X] T022 [US1] Ensure extra action executes bound instance method in `src/components/Buttons/GenericButtonComponent.vue`
- [X] T023 [US1] Inject filtered custom buttons by current view in `src/models/application.ts`
- [X] T024 [US1] Merge extra buttons with existing action list in `src/components/ActionsComponent.vue`
- [X] T025 [P] [US1] Create `Home` entity scaffold extendable by inheritance in `src/entities/home.ts`
- [X] T026 [US1] Register `Home` module in startup flow in `src/main.ts`
- [X] T027 [P] [US1] Remove `Customer` entity registration and imports from `src/main.ts`
- [X] T028 [P] [US1] Remove `Customer` entity file and references in `src/entities/customer.ts`
- [X] T029 [US1] Remove stale customer references from docs/examples in `specs/phase-01-core-stabilization/quickstart.md`
- [X] T030 [US1] Validate action bar behavior for DEFAULTVIEW in `src/views/default_detailview.vue`
- [X] T031 [US1] Validate action bar behavior for LISTVIEW in `src/views/default_listview.vue`
- [X] T032 [US1] Validate action bar behavior for DETAILVIEW in `src/views/default_detailview.vue`

**Checkpoint**: US1 complete with dynamic decorator-based actions and module cleanup.

---

## Phase 4: User Story 2 - Configuration Entity and Dedicated Detail Flow (Priority: P2)

**Goal**: Move system configuration into a `Configuration` BaseEntity instance, open it from `ConfigurationListComponent`, and persist changes via localStorage from a dedicated `guardar` method.

**Independent Test**: From `ConfigurationListComponent`, user opens Configuration detail, sees all configuration fields including theme and language, modifies values, saves with `guardar`, and values persist to localStorage and reload correctly.

### Tests and Smoke Checks for User Story 2

- [X] T033 [P] [US2] Add configuration detail smoke steps and expected behavior in `specs/phase-01-core-stabilization/quickstart.md`
- [X] T034 [P] [US2] Add persistence verification steps for `guardar` + reload in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 2

- [X] T035 [US2] Create `Configuration` entity extending `BaseEntity` in `src/entities/configuration.ts`
- [X] T036 [US2] Move `AppConfiguration` structure into `Configuration` entity properties in `src/entities/configuration.ts`
- [X] T037 [US2] Implement `guardar()` localStorage persistence method in `src/entities/configuration.ts`
- [X] T038 [US2] Add mapper/helpers between `Application.AppConfiguration` and `Configuration` in `src/models/application.ts`
- [X] T039 [US2] Add navigation button to open configuration detail in `src/views/ConfigurationListComponent.vue`
- [X] T040 [US2] Load current app configuration object into configuration detail flow in `src/views/ConfigurationListComponent.vue`
- [X] T041 [US2] Render full configuration fields in detail view components in `src/views/default_detailview.vue`
- [X] T042 [US2] Include theme and language fields in `Configuration` detail rendering in `src/entities/configuration.ts`
- [X] T043 [US2] Remove theme/language controls from `ConfigurationListComponent` in `src/views/ConfigurationListComponent.vue`
- [X] T044 [US2] Ensure `Configuration` is NOT registered in module list in `src/main.ts`
- [X] T045 [US2] Add save action wiring to call `guardar()` for configuration entity in `src/components/Buttons/SaveButtonComponent.vue`
- [X] T046 [US2] Validate configuration reload applies dark mode and language state in `src/App.vue`

**Checkpoint**: US2 complete with dedicated configuration entity/detail flow and persistence.

---

## Phase 5: User Story 3 - Login Exemption Metadata and Production Readiness Closure (Priority: P3)

**Goal**: Introduce `@NotRequiresLogin()` metadata support and close first functional version with production smoke checks and technical debt tracking.

**Independent Test**: Entities decorated with `@NotRequiresLogin()` return true from `isNotRequiresLogin()`, non-decorated entities return false, and release smoke checklist passes build/preview/critical navigation flows.

### Tests and Smoke Checks for User Story 3

- [X] T047 [P] [US3] Add smoke checks for login-exemption metadata behavior in `specs/phase-01-core-stabilization/quickstart.md`
- [X] T048 [P] [US3] Add production build and preview acceptance checklist in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 3

- [X] T049 [US3] Implement `@NotRequiresLogin()` decorator metadata storage in `src/decorations/not_requires_login_decorator.ts`
- [X] T050 [US3] Implement boolean resolver for login exemption in `src/entities/base_entity.ts`
- [X] T051 [US3] Add example usage on `Home` entity in `src/entities/home.ts`
- [X] T052 [US3] Mark login enforcement integration as technical debt in `specs/phase-01-core-stabilization/plan.md`
- [X] T053 [US3] Document login-phase TODO references in `specs/phase-01-core-stabilization/research.md`
- [X] T054 [US3] Validate no runtime regressions in module registration and view transitions in `src/models/application.ts`
- [X] T055 [US3] Validate production-oriented smoke flow completion in `specs/phase-01-core-stabilization/quickstart.md`

**Checkpoint**: US3 complete with metadata support and release closure criteria.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Final consistency, documentation, and readiness validation across stories.

- [X] T056 [P] Update task traceability notes in `specs/phase-01-core-stabilization/spec.md`
- [X] T057 [P] Update contracts with finalized behavior notes in `specs/phase-01-core-stabilization/contracts/metadata-ui-contract.md`
- [X] T058 Perform end-to-end smoke pass for US1-US3 in `specs/phase-01-core-stabilization/quickstart.md`
- [X] T059 Confirm no constitutional violations introduced in `specs/phase-01-core-stabilization/plan.md`
- [X] T060 Prepare implementation handoff summary in `specs/phase-01-core-stabilization/research.md`

---

## Phase 7: User Story 4 - Persistence Guardrails and Framework Strings (Priority: P1)

**Goal**: Prevent non-`@Persistent` entities from accessing persistence operations, remove misleading runtime errors (like Home list fetch), close dropdown on configuration action, and replace framework hardcoded strings with i18n keys.

**Independent Test**: Enter Home module without API errors, confirm no persistence/list fetch buttons for non-persistent entities, open configuration detail closes dropdown, and all new framework labels/messages resolve via `src/languages/*.json`.

### Tests and Smoke Checks for User Story 4

- [X] T063 [P] [US4] Add regression checklist for non-persistent entities in `specs/phase-01-core-stabilization/quickstart.md`
- [X] T064 [P] [US4] Add i18n verification checklist for framework strings in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 4

- [X] T065 [US4] Add explicit `@Persistent` guard to `validatePersistenceConfiguration()` in `src/entities/base_entity.ts`
- [X] T066 [US4] Add persistence guard in `refresh()` to block list fetch for non-persistent entities in `src/entities/base_entity.ts`
- [X] T067 [US4] Add persistence guard in static `getElement()` in `src/entities/base_entity.ts`
- [X] T068 [US4] Add persistence guard in static `getElementList()` in `src/entities/base_entity.ts`
- [X] T069 [US4] Add persistence guard in static `getElementListPaginated()` in `src/entities/base_entity.ts`
- [X] T070 [US4] Add persistence guard/no-op contract for `buildRequestPayload()` in `src/entities/base_entity.ts`
- [X] T071 [US4] Add persistence guard/no-op contract for static `mapToPersistentKeys()` and `mapFromPersistentKeys()` in `src/entities/base_entity.ts`
- [X] T072 [US4] Restrict persistence-driven action buttons for non-persistent modules in `setButtonList()` at `src/models/application.ts`
- [X] T073 [US4] Block list API loading for non-persistent module classes in `loadData()` at `src/components/Informative/DetailViewTableComponent.vue`
- [X] T074 [US4] Close dropdown before opening Configuration detail in `src/views/ConfigurationListComponent.vue`
- [X] T075 [US4] Replace hardcoded framework labels in `src/entities/configuration.ts` with translation keys
- [X] T076 [US4] Replace hardcoded framework action text (`Guardar`) with translation key usage in `src/entities/configuration.ts`
- [X] T077 [US4] Add framework i18n keys (en/es/jp parity) in `src/languages/common.json`
- [X] T078 [US4] Add framework i18n error keys for persistence guard messages in `src/languages/errors.json`
- [X] T079 [US4] Replace remaining hardcoded framework-level error/title texts in `src/entities/base_entity.ts` with `GetLanguagedText(...)`
- [X] T080 [US4] Validate Home/default module opens without `ApiEndpoint no definido` runtime errors in `src/components/Informative/DetailViewTableComponent.vue`

**Checkpoint**: US4 complete with non-persistent safety and framework-level localization alignment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; can proceed after US1 or in parallel when foundation is complete.
- **Phase 5 (US3)**: Depends on Phase 2 and partially on US1 (`Home` usage example).
- **Phase 6 (Polish)**: Depends on completion of selected user stories.
- **Phase 7 (US4)**: Depends on Phase 2; should run before final release validation when non-persistent modules exist.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational completion.
- **US2 (P2)**: Uses existing detail flow; independent of US3.
- **US3 (P3)**: Depends on `Home` availability from US1 for a concrete decorator usage example.
- **US4 (P1)**: Depends on foundational decorators/BaseEntity and validates behavior introduced in US1-US3.

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
- US4 smoke tasks `T063-T064` can run in parallel.
- US4 i18n tasks `T077-T078` can run in parallel.

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

### Hotfix Scope (Post-MVP)

1. Complete foundational extensions `T061-T062`.
2. Complete US4 `T063-T080` before release candidate sign-off when Home/non-persistent modules are enabled.

---

---

# Phase 2 Extension: Code Quality, Pinia & Feature Hardening

**Context**: Follow-up tasks derived from the Phase 01 post-mortem analysis.  
**Platform note**: This framework is **CSR-first** (Client-Side Rendering). All references to SSR limitations in the original analysis (singleton pattern, `document` access) are **low-priority** for this platform and are addressed here only for correctness and testability, not SSR compatibility.

## User Stories (Phase 2)

- **[US5]**: Pinia state management integration — backs Application singleton with Pinia stores (P1)
- **[US6]**: Component correctness & i18n completeness — template refs, sidebar UI, modal i18n, timeout constants (P2)
- **[US7]**: Technical debt documentation — auth, testing, permissions, guards (P3)
- **[US8]**: Table column sort with server-side integration (P2)
- **[US9]**: ArrayInputComponent select-all in selection column header (P2)
- **[US10]**: BaseEntity index type tightening + form renderer registry optimization (P3)
- **[US11]**: `@Module` combined decorator + async validation debounce (P3)

---

## Phase 8: Foundational – Quality Constants and Pinia Setup

**Purpose**: Create shared constants and install Pinia before user-story work begins.

**⚠️ CRITICAL**: T081–T084 must complete before Phase 9 (Pinia store creation) starts.

- [X] T081 Extract `VIEW_TRANSITION_DELAY_MS` (400ms) and `BUTTON_UPDATE_DELAY_MS` (405ms) as separately exported named constants in `src/models/application.ts` replacing all three hardcoded `setTimeout(..., 405)` calls and the private static constant
- [X] T082 [P] Install `pinia` dependency in `package.json` via `npm install pinia`
- [X] T083 [P] Create `src/stores/` directory with empty barrel export file `src/stores/index.ts`
- [X] T084 Register `createPinia()` instance in `src/main.ts` via `app.use(createPinia())` before `app.mount`

**Checkpoint**: Constants and Pinia infrastructure ready for user story implementation.

---

## Phase 9: User Story 5 – Pinia State Management Integration (Priority: P1) 🎯 MVP

**Goal**: Back all reactive properties of `ApplicationClass` with Pinia stores while preserving the public singleton API (`Application.View.value`, etc.) unchanged. Enables Vue DevTools inspection and independently testable state slices.

**Independent Test**: `Application.View.value` and all other public accessors function identically; Vue DevTools shows `appConfigStore`, `viewStore`, `uiStore` stores with live state; each store can be mocked in isolation via `setActivePinia()` in future unit tests.

### Tests and Smoke Checks for User Story 5

- [X] T085 [P] [US5] Add smoke checklist verifying Application singleton public API is unchanged after Pinia backing in `specs/phase-01-core-stabilization/quickstart.md`
- [X] T086 [P] [US5] Add DevTools inspection note confirming store state visibility in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 5

- [X] T087 [US5] Create `src/stores/app_config_store.ts` using `defineStore('appConfig', ...)` with all `AppConfiguration` fields matching `src/models/app_configuration.ts`
- [X] T088 [US5] Create `src/stores/view_store.ts` using `defineStore('view', ...)` with `entityClass`, `entityObject`, `component`, `viewType`, `isValid`, `entityOid`, `ModuleList`, `ListButtons` fields
- [X] T089 [US5] Create `src/stores/ui_store.ts` using `defineStore('ui', ...)` with `ToastList`, `modal`, `dropdownMenu`, `confirmationMenu` fields
- [X] T090 [P] [US5] Export all stores from `src/stores/index.ts`
- [X] T091 [US5] Refactor `ApplicationClass` constructor to initialize `AppConfiguration` Ref from Pinia `appConfigStore` via `storeToRefs()`
- [X] T092 [US5] Refactor `ApplicationClass` constructor to back `View`, `ModuleList`, `ListButtons` Refs from Pinia `viewStore` via `storeToRefs()`
- [X] T093 [US5] Refactor `ApplicationClass` constructor to back `ToastList`, `modal`, `dropdownMenu`, `confirmationMenu` Refs from Pinia `uiStore` via `storeToRefs()`
- [X] T094 [US5] Verify all public API accessors (`Application.View.value`, `Application.ToastList.value`, `Application.AppConfiguration.value`, etc.) remain fully functional after Pinia backing
- [X] T095 [US5] Verify `loadConfigurationFromStorage()` and `applyConfigurationSnapshot()` write through the Pinia store and changes appear in DevTools

**Checkpoint**: US5 complete — Application singleton retains full public API backed by inspectable Pinia state.

---

## Phase 10: User Story 6 – Component Correctness & i18n Completeness (Priority: P2)

**Goal**: Replace imperative `document.getElementById` with Vue template refs in `TopBarComponent`; implement real logout; complete `SideBarComponent` header/footer; replace hardcoded Spanish in `ModalComponent`; externalize `setTimeout` magic numbers as named constants.

**Independent Test**: Profile dropdown opens via `templateRef`; logout clears both auth tokens and redirects to `/login`; sidebar shows app name and `© galurensoft v{version}`; modal footer buttons change language with the language selector; no `405` magic number remains in `application.ts`.

### Tests and Smoke Checks for User Story 6

- [X] T096 [P] [US6] Add smoke checklist for TopBar template ref and logout behavior in `specs/phase-01-core-stabilization/quickstart.md`
- [X] T097 [P] [US6] Add modal i18n language-switch verification step (change language → verify modal button labels update) in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 6

- [X] T098 [P] [US6] Replace `document.getElementById('dropdown-profile-button')!` with `ref<HTMLElement | null>(null)` template reference; replace `var` with `const`; bind `ref="profileBtnRef"` in template in `src/components/TopBarComponent.vue`
- [X] T099 [P] [US6] Implement real `logout()`: remove `authTokenKey` and `authRefreshTokenKey` from `localStorage`, call `Application.router?.push('/login')` in `src/components/TopBarComponent.vue`
- [X] T100 [P] [US6] Create `SYSTEM_NAME_ICON` constant in `src/constants/icons.ts` pointing to `'@/assets/icons/system_name.png'`
- [X] T101 [US6] Update `SideBarComponent` header: display app name from `Application.AppConfiguration.value.appName` and logo from `SYSTEM_NAME_ICON` in `src/components/SideBarComponent.vue`
- [X] T102 [US6] Add footer content to `SideBarComponent`: copyright tag `© galurensoft` and app version from `Application.AppConfiguration.value.appVersion` in `src/components/SideBarComponent.vue`
- [X] T103 [P] [US6] Replace hardcoded `Aceptar` with `GetLanguagedText('common.accept')` and `Cerrar` with `GetLanguagedText('common.close')` in `src/components/Modal/ModalComponent.vue`
- [X] T104 [P] [US6] Verify `common.accept` and `common.close` i18n keys exist with all 3 languages (en/es/jp) in `src/languages/common.json`; add if missing
- [X] T105 [P] [US6] Replace all three `setTimeout(..., 405)` calls in `changeViewToDefaultView`, `changeViewToListView`, `changeViewToDetailView` with `BUTTON_UPDATE_DELAY_MS` constant in `src/models/application.ts`
- [X] T106 [P] [US6] Delete empty `src/mixins/` directory

**Checkpoint**: US6 complete — Vue-idiomatic DOM access, real logout, complete sidebar UI, localized modal, and no magic timeout numbers.

---

## Phase 11: User Story 7 – Technical Debt Documentation (Priority: P3)

**Purpose**: Formally document all architectural debts identified in the Phase 01 post-mortem review into traceable research entries.

**Independent Test**: All debt entries exist in `research.md` or `spec.md` with remediation scope and cross-references.

- [X] T107 [P] [US7] Mark authentication flow (JWT token in localStorage, missing refresh token rotation, stub logout) as technical debt in `specs/phase-01-core-stabilization/research.md`
- [X] T108 [P] [US7] Mark automated testing absence (zero unit/integration tests at project baseline) as technical debt in `specs/phase-01-core-stabilization/research.md`
- [X] T109 [P] [US7] Mark `@NotRequiresLogin` router guard integration (declared in T052/T053 but not wired) as open technical debt with cross-reference in `specs/phase-01-core-stabilization/research.md`
- [X] T110 [P] [US7] Mark field-level and action-level permission system based on `@ModulePermission` as technical debt in `specs/phase-01-core-stabilization/research.md`
- [X] T111 [P] [US7] Document "breadcrumb navigation is not required for this system" as an explicit architectural decision in `specs/phase-01-core-stabilization/spec.md`

**Checkpoint**: US7 complete — all identified debts formally tracked.

---

## Phase 12: User Story 8 – Table Column Sort with Server-Side Integration (Priority: P2)

**Goal**: Add per-column sort buttons (to the left of each column label) in `DetailViewTableComponent` that send `sortBy` and `sortDir` params to `getElementListPaginated`, with each column having a structural `min-width` that accounts for sort button + label text + filter button.

**Independent Test**: Clicking a column sort button cycles null → asc → desc → null; `loadData()` re-fires with correct params on each toggle; sort icon reflects active direction; each column is at minimum as wide as its content (sort-btn + text + filter-btn).

### Implementation for User Story 8

- [X] T112 [P] [US8] Add optional `sortBy?: string` and `sortDir?: 'asc' | 'desc'` fields to `ListQueryParams` in `src/types/service.types.ts`
- [X] T113 [US8] Add `sortColumn` (`Ref<string | null>`) and `sortDirection` (`Ref<'asc' | 'desc' | null>`) reactive state in `src/components/Informative/DetailViewTableComponent.vue`
- [X] T114 [US8] Add sort toggle button element in `<th>` to the LEFT of the column label using CSS tokens `--gray-light` (default) and `--gray-medium` (hover) as colors, with hover brightness transition, in `src/components/Informative/DetailViewTableComponent.vue`
- [X] T115 [US8] Implement `toggleSort(column: string)` function cycling `null → 'asc' → 'desc' → null`, updating `sortColumn` and `sortDirection`, and calling `loadData()` in `src/components/Informative/DetailViewTableComponent.vue`
- [X] T116 [US8] Pass `sortBy: sortColumn.value ?? undefined` and `sortDir: sortDirection.value ?? undefined` to `getElementListPaginated(...)` in `loadData()` in `src/components/Informative/DetailViewTableComponent.vue`
- [X] T117 [US8] Set `min-width` on each `<th>` ensuring width ≥ sort-button-width + label-min-content + filter-button-width using `min-content` sizing and CSS `width: max(min-content, ...)` in `src/components/Informative/DetailViewTableComponent.vue`

**Checkpoint**: US8 complete — server-aware column sort with content-driven min-width enforcement.

---

## Phase 13: User Story 9 – ArrayInputComponent Select All (Priority: P2)

**Goal**: When the selection column is visible (after clicking "Seleccionar"), add a select-all button in the `<th class="selection">` header cell that selects or deselects all visible (current-page) items.

**Independent Test**: With `isSelection` active, select-all button in `<th>` selects all `paginatedItems`; clicking again deselects all; icon state reflects current select-all status; individual row toggles remain functional.

### Implementation for User Story 9

- [X] T118 [US9] Add `isAllSelected` computed (all `paginatedItems` are in `selectedItems`) in `src/components/Form/ArrayInputComponent.vue`
- [X] T119 [US9] Add `toggleSelectAll()` method that calls `selectAll()` or `deselectAll()` based on `isAllSelected` state in `src/components/Form/ArrayInputComponent.vue`
- [X] T120 [US9] Add select-all button inside `<th class="selection">` that is visible only when `isSelection === true`, using icon logic matching individual row select buttons, in `src/components/Form/ArrayInputComponent.vue`
- [X] T121 [P] [US9] Add i18n keys `common.select_all` and `common.deselect_all` (en/es/jp parity) to `src/languages/common.json`

**Checkpoint**: US9 complete — select-all toggle in selection column header.

---

## Phase 14: User Story 10 – BaseEntity Index Type Tightening & Form Registry Optimization (Priority: P3)

**Goal**: Tighten `[key: string]: unknown` index signature in `BaseEntity` to a concrete union type and replace the 16-branch `v-if` cascade + `propertyMetadata` computed in `default_detailview.vue` with a registry-based component resolver.

**Independent Test**: TypeScript compilation clean after index type change; `default_detailview.vue` renders all existing input types via registry with no `propertyMetadata` computed; adding a new input type requires only one registry entry.

### Implementation for User Story 10

- [X] T122 [US10] Change `[key: string]: unknown` in `src/entities/base_entity.ts` to `[key: string]: string | number | boolean | Date | BaseEntity | BaseEntity[] | object | null | undefined` — resolve any resulting TypeScript property declaration conflicts
- [X] T123 [US10] Create `src/models/input_registry.ts` implementing `InputRegistry` class with `register(propType: unknown, stringType: StringType, component: Component)` and `resolve(propType: unknown, stringType: StringType): Component | null`
- [X] T124 [US10] Register all 19 existing input component mappings in `InputRegistry` (Number, Date, Boolean, String×8 StringTypes, EnumAdapter, BaseEntity subclass, Array) in `src/models/input_registry.ts`
- [X] T125 [US10] Create `src/composables/useFormRenderer.ts` exposing `resolveInputForProp(key): Component | null`, `getModelValue(key): unknown`, `setModelValue(key, val): void` backed by `InputRegistry` and entity metadata
- [X] T126 [US10] Replace the `propertyMetadata` computed block and all 16+ `v-if` branches in `src/views/default_detailview.vue` with `<component :is="resolveInputForProp(prop)" v-bind="getInputProps(prop)" />` using `useFormRenderer`

**Checkpoint**: US10 complete — registry-based form rendering replaces v-if cascade; index type tightened.

---

## Phase 15: User Story 11 – @Module Combined Decorator & Async Validation Debounce (Priority: P3)

**Goal**: Add a composed `@Module(config)` class decorator as shorthand for common module decorators (purely additive, existing entities are backward compatible); add configurable debounce for `isAsyncValidation` calls in `useInputMetadata` using `AppConfiguration.asyncValidationDebounce`.

**Independent Test**: An entity using `@Module({...})` behaves identically to one using individual decorators; async validation fires only after debounce delay; debounce is configurable from `.env` via `VITE_ASYNC_VALIDATION_DEBOUNCE` (default 300ms).

### Implementation for User Story 11

- [X] T127 [US11] Create `src/decorations/module_decorator.ts` implementing `@Module(config: ModuleConfig)` that internally composes `@ModuleName`, `@ModuleIcon`, `@ApiEndpoint`, `@ApiMethods`, and `@Persistent` decorators — no `BaseEntity` changes required (purely additive)
- [X] T128 [P] [US11] Export `Module` decorator and `ModuleConfig` type from `src/decorations/index.ts`
- [X] T129 [P] [US11] Add `asyncValidationDebounce: number` field (default `300`) to `AppConfiguration` interface in `src/models/app_configuration.ts`
- [X] T130 [P] [US11] Read `VITE_ASYNC_VALIDATION_DEBOUNCE` env variable in `ApplicationClass` constructor with `Number(import.meta.env.VITE_ASYNC_VALIDATION_DEBOUNCE) || 300` and assign to `AppConfiguration.asyncValidationDebounce` in `src/models/application.ts`
- [X] T131 [US11] Implement debounce wrapper in `src/composables/useInputMetadata.ts` — debounce `isAsyncValidation(propertyKey)` calls by `Application.AppConfiguration.value.asyncValidationDebounce` ms using a local `setTimeout`/`clearTimeout` pattern

**Checkpoint**: US11 complete — composable module shorthand available; async validation debounced.

---

## Phase 16: Phase 2 Polish

- [X] T132 [P] Update task traceability notes for Phase 2 user stories (US5–US11) in `specs/phase-01-core-stabilization/spec.md`
- [X] T133 [P] Add Phase 2 post-analysis summary and CSR platform clarification to `specs/phase-01-core-stabilization/research.md`

---

## Phase 17: User Story 8 — Corrections: Client-Side Sort + Column Min-Width (Phase 2.5)

**Goal**: Implement actual in-memory data sorting in `DetailViewTableComponent` so the sort state cycles visually AND re-orders the displayed rows. Enforce correct column min-width accounting for sort button + label + filter button. Both fixes must compose correctly with the existing column-filter pipeline (`filteredRows → sortedRows → paginatedRows`).

**Independent Test**: Click a column header sort button → rows visually re-order ascending/descending/reset without any extra API call; activating a column filter AND a sort simultaneously applies both; each column header never clips its sort-btn + label + filter-btn content even on narrow labels.

### Implementation for User Story 8 (Phase 2.5 corrections)

- [X] T134 [SPEC] [US8] Add a note to `specs/phase-01-core-stabilization/spec.md` §US8 clarifying that column sort is client-side (in-memory against current page data) and MUST compose with column filters: the pipeline order is `data → filteredRows → sortedRows → paginatedRows`. in `specs/phase-01-core-stabilization/spec.md`
- [X] T135 [US8] Add `sortedRows` computed in `src/components/Informative/DetailViewTableComponent.vue` that derives from `filteredRows.value`, spreads it to a new array, and sorts by `getCellValue()` using numeric comparison when both values are parseable as numbers and `String.localeCompare` otherwise; direction is `sortDirection.value` (`asc`/`desc`/`null`); change `paginatedRows` to derive from `sortedRows.value` in `src/components/Informative/DetailViewTableComponent.vue`
- [X] T136 [US8] Remove the `loadData()` call from `toggleSort()` in `src/components/Informative/DetailViewTableComponent.vue` — sort is in-memory; re-fetching from the API on every sort toggle is unnecessary and counter to the "internal ordering" requirement in `src/components/Informative/DetailViewTableComponent.vue`
- [X] T137 [US8] Wrap the column label text node in a `<span class="col-label">` inside the `<thead td>` template so it becomes a targetable flex child; update the template in `src/components/Informative/DetailViewTableComponent.vue`
- [X] T138 [P] [US8] Update `thead td` CSS to `display: flex; align-items: center; gap: 2px; padding-right: 10px`; add `.col-label { flex: 1 1 auto; white-space: nowrap; font-weight: bold; }`; remove `position: absolute; right: 8px; top: 50%; transform: translateY(-50%)` from `.col-filter-btn` and replace with `flex-shrink: 0; margin-left: auto`; keep `position: absolute; right: 0` on `.col-resize-handle`; remove the now-redundant `min-width: max(min-content, 5rem)` (flex natural sizing is enough) in `src/components/Informative/DetailViewTableComponent.vue`

**Checkpoint**: US8 fully functional — in-memory sort, sort+filter composition, and accurate min-width.

---

## Phase 18: User Story 11 — @Module Decorator Applied to Entities (Phase 2.5)

**Goal**: Apply the `@Module` composite decorator to the only qualifying persistent entity (`Product`) so the decorator can be evaluated against a real usage. Non-persistent entities (`Home`, `Configuration`) are exempt — `@Module` implies `@Persistent` and an API endpoint, which those entities do not have.

**Independent Test**: `Product` entity compiled from `@Module({...})` behaves identically to the previous individual-decorator version; TypeScript shows no errors; all Product-related decorators (`@DefaultProperty`, `@PrimaryProperty`, etc.) are preserved; `Home` and `Configuration` remain unchanged.

### Implementation for User Story 11 (Phase 2.5 corrections)

- [X] T139 [US11] Replace the five individual class decorators `@ModuleName`, `@ModuleIcon`, `@ApiEndpoint`, `@ApiMethods`, and `@Persistent` on the `Product` class with a single `@Module({ name: 'custom.products.title', icon: ICONS.PRODUCTS, apiEndpoint: '/api/products', apiMethods: ['GET', 'POST', 'PUT', 'DELETE'] })` call; remove the five now-unused decorator imports and add `Module` to the `@/decorations` import block in `src/entities/product.ts`

**Checkpoint**: US11 visually demonstrable — `@Module` in use on a real persistent entity.

---

## Phase 19: Phase 2.5 Polish — Technical Debt

**Purpose**: Document the deferred items identified during Phase 2 checklist review.

- [X] T140 [P] Add TD-07 to `specs/phase-01-core-stabilization/research.md`: Async Validation Debounce Evaluation status — **OPEN (evaluation deferred)**. The debounce wrapper in `useInputMetadata.ts` (T131) is implemented, but correctness verification requires at least one entity with a real `@AsyncValidation` decorator wired to a remote endpoint. Until such a scenario is available, the feature is untestable in practice. Remediation: add a local mock async validator to `product.ts` (e.g. on the `email` field) and document the debounce smoke-test steps in `quickstart.md`. in `specs/phase-01-core-stabilization/research.md`

**Checkpoint**: Phase 2.5 polish complete — all open debts formally tracked.

---

## Phase 2.5 Dependencies

- **Phase 17 (US8 corrections)**: Fully independent — only touches `DetailViewTableComponent.vue`. T137 (template) must precede T138 (CSS), but T134 (spec) and T135–T136 (computed/toggleSort) are parallel.
- **Phase 18 (US11 corrections)**: Fully independent — only touches `product.ts`.
- **Phase 19 (Polish)**: Fully independent — only touches `research.md`.

## Phase 2.5 Parallel Opportunities

```
Parallel: T134 (spec note) + T135 (sortedRows) + T136 (remove loadData from toggleSort)
  ↓
  T137 (wrap col-label span)
  ↓
  T138 (flex CSS)

Parallel: T139 (product.ts @Module)
Parallel: T140 (research.md TD-07)
```

## Phase 2.5 Task Count

| Phase | Tasks | Story | Parallelizable |
|-------|-------|-------|----------------|
| Phase 17: US8 corrections | T134–T138 | US8 | 2 of 5 |
| Phase 18: US11 corrections | T139 | US11 | 0 |
| Phase 19: Polish | T140 | — | 1 of 1 |
| **TOTAL** | **7 tasks** | | **~3 parallelizable** |

- **Phase 8 (Foundational)**: Starts after Phase 7 is complete. Blocks Phase 9 only.
- **Phase 9 (US5 – Pinia)**: Depends on Phase 8 (pinia install). Independent of all other Phase 2 stories.
- **Phase 10 (US6 – Component Fixes)**: Depends on Phase 8 (constants T081). Independent of Phase 9.
- **Phase 11 (US7 – Tech Debt Docs)**: Depends on Phase 8 (context). All tasks fully parallelizable.
- **Phase 12 (US8 – Table Sort)**: Depends on Phase 8. Independent of Phase 9.
- **Phase 13 (US9 – Array SelectAll)**: Independent. Depends on Phase 8.
- **Phase 14 (US10 – BaseEntity + Form)**: Depends on Phase 8. Recommended to run after Phase 10.
- **Phase 15 (US11 – Decorators)**: Depends on Phase 8. Independent of Phase 9.
- **Phase 16 (Polish)**: Depends on all Phase 2 phases completing.

## Phase 2 Parallel Opportunities

```bash
# Phase 8 — all parallel after T081
T082 install pinia
T083 create stores/ barrel

# Phase 9 — stores parallel after T084
T087 create app_config_store.ts
T088 create view_store.ts
T089 create ui_store.ts

# Phase 11 — all tech debt docs are fully parallel
T107 auth debt note
T108 testing debt note
T109 NotRequiresLogin guard debt note
T110 permissions debt note
T111 no-breadcrumb decision

# Phase 10 — component fixes parallel across files
T098 TopBar template ref fix
T099 TopBar logout
T100 SYSTEM_NAME_ICON constant
T103 ModalComponent i18n fix
T104 common.json key check
T105 replace setTimeout constants
T106 delete mixins/
```

## Phase 2 MVP Scope

Suggested Phase 2 MVP: **US5 (Pinia) + US6 (Component Fixes)**. These deliver the highest value with lowest risk and unblock further testing infrastructure.

---

## Phase 20: User Story 12 - Container-Anchored Table Footer and Pagination (Priority: P1)

**Goal**: Keep table pagination/footer anchored to the visible container while allowing horizontal/vertical scroll only in header/body regions for long and wide datasets.

**Independent Test**: With a wide table and horizontal overflow, footer controls remain inside container bounds and do not split to table extremes; scrolling affects only header/body content.

### Tests and Smoke Checks for User Story 12

- [X] T141 [P] [US12] Add regression smoke steps for footer/pagination container anchoring on wide and long tables in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 12

- [X] T142 [US12] Refactor table layout into fixed footer region plus scrollable header/body wrapper in `src/components/Form/ArrayInputComponent.vue`
- [X] T143 [US12] Update table CSS so pagination/footer width follows container width instead of total table content width in `src/components/Form/ArrayInputComponent.vue`
- [X] T144 [P] [US12] Add sticky/overflow guards so horizontal scroll applies only to data region and not footer controls in `src/components/Form/ArrayInputComponent.vue`
- [X] T145 [US12] Align pagination container behavior with list table implementation and prevent footer clipping on resize in `src/components/Informative/DetailViewTableComponent.vue`

**Checkpoint**: US12 complete with stable container-pinned table footer behavior.

---

## Phase 21: User Story 13 - Unified Dirty-Guard Navigation Pipeline (Priority: P1)

**Goal**: Enforce a single centralized dirty-guard navigation pipeline for all entry points (sidebar, profile menu, configuration actions, and programmatic redirects) with identical timing/state transitions.

**Independent Test**: Trigger dirty confirmation and accept navigation from sidebar, profile menu, and configuration action; all paths change view and button states with identical timing and no lag divergence.

### Tests and Smoke Checks for User Story 13

- [X] T146 [P] [US13] Add cross-entrypoint dirty-guard timing regression checklist (sidebar/profile/config) in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 13

- [X] T147 [US13] Implement centralized `navigateWithDirtyGuard(...)` orchestration method in `src/models/application.ts`
- [X] T148 [US13] Route sidebar navigation calls through centralized dirty-guard orchestration in `src/components/SideBarComponent.vue`
- [X] T149 [US13] Route profile-menu navigation actions through centralized dirty-guard orchestration in `src/components/TopBarComponent.vue`
- [X] T150 [US13] Route configuration entry navigation through centralized dirty-guard orchestration in `src/views/ConfigurationListComponent.vue`
- [X] T151 [US13] Normalize post-confirmation state/timer order in one place using existing constants in `src/models/application.ts`
- [X] T152 [US13] Remove duplicated per-component dirty-check branches after centralization in `src/components/SideBarComponent.vue`

**Checkpoint**: US13 complete with deterministic dirty-guard navigation behavior regardless of source entrypoint.

---

## Phase 22: User Story 14 - Sidebar Branding Layout and Collapsed Icon-Only Mode (Priority: P2)

**Goal**: Enforce sidebar regions (header logo-only, body modules, footer title + brand/version) and collapsed icon-only behavior using a dedicated `squared_app_logo_image` system variable rendered at 1:1 ratio.

**Independent Test**: Expanded sidebar shows logo-only header, module list in body, and footer with app title above `@galurensoft` + version; collapsed sidebar hides text, shows rounded compact icon-only items, and switches to square logo at fixed 1:1 ratio.

### Tests and Smoke Checks for User Story 14

- [X] T153 [P] [US14] Add expanded/collapsed sidebar branding checklist with visual acceptance criteria in `specs/phase-01-core-stabilization/quickstart.md`

### Implementation for User Story 14

- [X] T154 [US14] Add `squared_app_logo_image` to app configuration model contract and defaults in `src/models/app_configuration.ts`
- [X] T155 [US14] Initialize and persist `squared_app_logo_image` in configuration bootstrap/load flow in `src/models/application.ts`
- [X] T156 [P] [US14] Add squared app logo asset constant and exports for sidebar usage in `src/constants/icons.ts`
- [X] T157 [US14] Refactor sidebar layout into explicit header/body/footer regions per clarified structure in `src/components/SideBarComponent.vue`
- [X] T158 [US14] Implement collapsed-header logo switch to squared image with enforced `aspect-ratio: 1 / 1` in `src/components/SideBarComponent.vue`
- [X] T159 [US14] Hide module labels and render compact rounded icon-only state when sidebar is collapsed in `src/components/SideBarItemComponent.vue`
- [X] T160 [US14] Add responsive/sidebar style safeguards for collapsed spacing and clipping prevention in `src/css/main.css`

**Checkpoint**: US14 complete with deterministic expanded/collapsed sidebar branding and layout behavior.

---

## Phase 23: Polish and Cross-Cutting Concerns (Clarification Set 2026-03-07)

- [X] T161 [P] Update traceability notes for FR8-FR11 clarifications in `specs/phase-01-core-stabilization/spec.md`
- [X] T162 [P] Update orchestration contract with centralized dirty-guard pipeline invariants in `specs/phase-01-core-stabilization/contracts/application-orchestration-contract.md`
- [X] T163 [P] Add table-footer anchoring and sidebar branding guarantees to UI contract in `specs/phase-01-core-stabilization/contracts/metadata-ui-contract.md`
- [X] T164 Execute end-to-end smoke pass for US12-US14 and record outcomes in `specs/phase-01-core-stabilization/quickstart.md`

---

## Clarification Set Dependencies (US12-US14)

- **Phase 20 (US12)**: Independent from prior phase features except table/list components and shared CSS tokens.
- **Phase 21 (US13)**: Depends on existing `Application` orchestration and must precede final smoke validation.
- **Phase 22 (US14)**: Depends on sidebar component baseline (`US6`) and configuration bootstrap (`US2`, `US5`).
- **Phase 23 (Polish)**: Depends on Phases 20-22 completion.

## Clarification Set Parallel Opportunities

```bash
# US12
T141 quickstart smoke checklist
T144 overflow guard styles

# US13
T146 dirty-guard timing smoke checklist
T149 profile-menu navigation routing

# US14
T153 sidebar branding checklist
T156 squared logo constants
```

## Clarification Set MVP Scope

Suggested MVP for this clarification set: **US13 first**, then **US12**, then **US14**.

---

---

# Phase 3 Extension: Rich Input Components — Calendar, Color, File Upload, Tag

**Context**: New input component set requested in the 2026-03-07 session. All components follow the existing 5-layer meta-programming pattern: new `StringType` enum values → new decorators → new `BaseEntity` methods → new form components → `InputRegistry` registration. No architectural changes.

## User Stories (Phase 3)

- **[US15]**: Calendar and time input components with custom calendar/clock UI (P1)
- **[US16]**: Color picker input component (P1)
- **[US17]**: File upload input with `@SupportedFiles` and `@MaxSizeFiles` decorators (P1)
- **[US18]**: Tag input with `@MaxTags`, `@MaxTagSize`, and `@MaxStringSize` decorators (P1)

---

## Phase 24: Foundational — New StringType Values

**Purpose**: Extend the `StringType` enum with all new input type sentinels required by US15–US18. All user story phases below depend on this task.

**⚠️ CRITICAL**: T165 must complete before any Phase 25–28 task starts.

- [X] T165 Add `DATE`, `TIME`, `DATETIME`, `COLOR`, `FILE`, `TAGS` values to `StringType` enum in `src/enums/string_type.ts`

**Checkpoint**: New `StringType` values available for registry registration and decorator usage.

---

## Phase 25: User Story 15 — Calendar and Time Input Components (Priority: P1) 🎯 MVP

**Goal**: Replace the native `<input type="date">` in `DateInputComponent` with a custom calendar dropdown; add `HourInputComponent` backed by a circular clock picker; add `DateTimeInputComponent` combining both pickers; all store as strings with `StringType.DATE`, `StringType.TIME`, `StringType.DATETIME`.

**Independent Test**: `DateInputComponent` opens a grid calendar on button click, selecting a day emits `YYYY-MM-DD`; `HourInputComponent` opens a circular clock, confirming emits `HH:MM`; `DateTimeInputComponent` opens calendar + clock side-by-side and emits `YYYY-MM-DDTHH:MM`; all three respond to `required`/`disabled`/`readonly` metadata and show `validation-messages`.

### Informative Picker Components

- [X] T166 [US15] Create `CalendarComponent.vue` — full-size grid-adaptive month calendar: month/year header with prev/next navigation buttons, 7-column day grid, today highlight, selected-day highlight, emits `select(dateStr: string)` (ISO `YYYY-MM-DD`) on day click in `src/components/Informative/CalendarComponent.vue`
- [X] T167 [P] [US15] Create `CalendarForInputComponent.vue` — compact variant of `CalendarComponent`: same month-grid logic and `select` emit, reduced padding/font-size designed for use inside Teleport dropdown panels in `src/components/Informative/CalendarForInputComponent.vue`
- [X] T168 [US15] Create `ClockPickerComponent.vue` — circular SVG clock picker: hour ring (1–12/1–24) rendered as clickable arc segments and draggable handle; after hour selection auto-advances to minute ring (0, 5, 10 … 55); AM/PM toggle button; emits `select(timeStr: string)` (`HH:MM` 24-hour format) after minute selection; displays live HH:MM value at centre during interaction in `src/components/Informative/ClockPickerComponent.vue`

### Form Input Components

- [X] T169 [US15] Rewrite `DateInputComponent.vue` — readonly string input displaying locale-formatted date + calendar-icon button; button opens Teleport dropdown containing `CalendarForInputComponent`; day selection closes dropdown, formats display string, emits `update:modelValue` as `YYYY-MM-DD`; closing without picking preserves current value; validates `required` and async validations; data type is `String` with `StringType.DATE` in `src/components/Form/DateInputComponent.vue`
- [X] T170 [US15] Create `HourInputComponent.vue` — readonly string input displaying `HH:MM` + clock-icon button; button opens Teleport dropdown containing `ClockPickerComponent`; after clock emits `select`, closes dropdown and emits `update:modelValue` as `HH:MM`; closing without confirming preserves current value; validates `required` and async validations; data type is `String` with `StringType.TIME` in `src/components/Form/HourInputComponent.vue`
- [X] T171 [US15] Create `DateTimeInputComponent.vue` — readonly string input displaying `YYYY-MM-DD HH:MM` + combined-icon button; button opens Teleport dropdown showing `CalendarForInputComponent` and `ClockPickerComponent` side-by-side; date and time can be picked in any order; "Aceptar" confirm button in dropdown footer applies selection and emits `update:modelValue` as `YYYY-MM-DDTHH:MM`; closing without confirming preserves current value; validates `required` and async validations; data type is `String` with `StringType.DATETIME` in `src/components/Form/DateTimeInputComponent.vue`

### Registry and Exports

- [X] T172 [US15] Register `StringType.DATE` → `DateInputComponent`, `StringType.TIME` → `HourInputComponent`, `StringType.DATETIME` → `DateTimeInputComponent` in `src/models/input_registry.ts`
- [X] T173 [P] [US15] Export `HourInputComponent` and `DateTimeInputComponent` from `src/components/Form/index.ts`

**Checkpoint**: US15 complete — three custom date/time inputs backed by calendar and clock pickers.

---

## Phase 26: User Story 16 — Color Picker Input Component (Priority: P1)

**Goal**: Provide a `ColorInputComponent` where the left 50% is a text input showing the hex value and the right 50% is a solid-color button. Clicking the button opens a Teleport dropdown with a circular HSL color picker + brightness slider and an "Aceptar" confirm button. Closing without confirming discards changes and restores the previous value. Default value is white (`#ffffff`).

**Independent Test**: Opening the dropdown shows the picker initialized to the current value (or white if unset); dragging the circle selects a colour that previews live on the button; clicking "Aceptar" applies it and updates the text input; pressing Escape or clicking outside closes without applying; hex/rgb/hsl lines each have a functional copy-to-clipboard button.

### Picker Component

- [X] T174 [US16] Create `ColorPickerComponent.vue` — circular HSL color wheel (canvas radial gradient, hue on angle, saturation on radius) with a draggable/clickable selection dot; vertical brightness slider below the wheel; below the slider: three read-only lines showing `hex: #rrggbb`, `rgb(r, g, b)`, `hsl(h, s%, l%)` each followed by a small copy-to-clipboard icon button that calls `navigator.clipboard.writeText`; emits `update:modelValue(colorHex: string)` on every interaction so the parent can preview in `src/components/Informative/ColorPickerComponent.vue`

### Form Input Component

- [X] T175 [US16] Create `ColorInputComponent.vue` — flex row: text input (50% width, shows hex string, user-editable) + solid-color button (50% width, `background-color` = current value, no label or icon); default model value is `#ffffff`; clicking button opens Teleport dropdown containing `ColorPickerComponent` + "Aceptar" button in footer; picker emits live previews that update the button colour without committing; "Aceptar" closes dropdown and emits confirmed `update:modelValue`; clicking outside / Escape closes without applying and restores previous value; text input edits are reflected immediately as hex on blur; data type is `String` with `StringType.COLOR` in `src/components/Form/ColorInputComponent.vue`

### Registry and Exports

- [X] T176 [US16] Register `StringType.COLOR` → `ColorInputComponent` in `src/models/input_registry.ts`
- [X] T177 [P] [US16] Export `ColorInputComponent` from `src/components/Form/index.ts`

**Checkpoint**: US16 complete — colour input with live-preview HSL picker and confirm-before-apply flow.

---

## Phase 27: User Story 17 — File Upload Input with Decorators (Priority: P1)

**Goal**: Add `@SupportedFiles(formats)` and `@MaxSizeFiles(mb)` property decorators with corresponding `BaseEntity` readers, and a `FileUploadInputComponent` that enforces type/size rules, shows a preview button when a file is loaded, and opens a `FilePreviewComponent` popup. The `FilePreviewComponent` is also registered on `Configuration` via `@ModuleCustomComponents`.

**Independent Test**: Uploading a file whose MIME/extension is not in `@SupportedFiles` is rejected with a toast; uploading a file exceeding `@MaxSizeFiles` MB is rejected with a toast and the input is marked nonvalidated; a valid upload succeeds with a success toast and shows the preview button; clicking the preview button opens a popup with image or PDF preview; `getSupportedFiles` and `getMaxFileSizeBytes` return correct values from entity metadata.

### Decorators and BaseEntity

- [X] T178 [US17] Create `@SupportedFiles(formats: string[])` property decorator storing the formats array via `SUPPORTED_FILES_KEY` Symbol on the class prototype in `src/decorations/supported_files_decorator.ts`
- [X] T179 [P] [US17] Create `@MaxSizeFiles(size: number)` property decorator storing the raw MB number via `MAX_SIZE_FILES_KEY` Symbol on the class prototype in `src/decorations/max_size_files_decorator.ts`
- [X] T180 [P] [US17] Export `SupportedFiles`, `SUPPORTED_FILES_KEY`, `MaxSizeFiles`, `MAX_SIZE_FILES_KEY` from `src/decorations/index.ts`
- [X] T181 [US17] Add `getSupportedFiles(propertyKey: string): string[] | undefined` to `BaseEntity` reading `SUPPORTED_FILES_KEY` prototype metadata for the given property in `src/entities/base_entity.ts`
- [X] T182 [P] [US17] Add `getMaxFileSizeBytes(propertyKey: string): number | undefined` to `BaseEntity` reading `MAX_SIZE_FILES_KEY` prototype metadata and returning `storedValue * 1024 * 1024`; returns `undefined` if decorator is not applied in `src/entities/base_entity.ts`

### Informative and Form Components

- [X] T183 [US17] Create `FilePreviewComponent.vue` — receives `file: File` prop; if `file.type` starts with `image/`, renders `<img :src="objectUrl">`; if `file.type` is `application/pdf`, renders `<embed :src="objectUrl" type="application/pdf">`; shows an unsupported-type placeholder otherwise; creates object URL via `URL.createObjectURL(file)` on mount and revokes it on `onBeforeUnmount` in `src/components/Informative/FilePreviewComponent.vue`
- [X] T184 [US17] Create `FileUploadInputComponent.vue` — readonly string input showing file name (empty when no file); upload icon button triggers hidden `<input type="file">` with `accept` attribute built from `entity.getSupportedFiles(propertyKey)` joined as comma-separated list; on file selected: if file size in bytes exceeds `entity.getMaxFileSizeBytes(propertyKey)` → show error toast + mark `isInputValidated = false` + cancel; otherwise: store the `File` object as model value, show success toast, set `isInputValidated = true`; when a file is loaded, render a square preview button (height equals input height, uses same border/background CSS tokens as standard inputs, adapts to `disabled`/`nonvalidated` class state) between the text input and the upload button; clicking preview button opens modal via `Application.ApplicationUIService.showModalOnFunction` passing `FilePreviewComponent` and the stored `File` object; only one file at a time; data type is `String` with `StringType.FILE` in `src/components/Form/FileUploadInputComponent.vue`

### Configuration and Registry

- [X] T185 [US17] Add `FilePreviewComponent` to the `@ModuleCustomComponents([...])` decorator list on the `Configuration` entity so it is registered in the application's custom component catalog in `src/entities/configuration.ts`
- [X] T186 [US17] Register `StringType.FILE` → `FileUploadInputComponent` in `src/models/input_registry.ts`
- [X] T187 [P] [US17] Export `FileUploadInputComponent` from `src/components/Form/index.ts`

**Checkpoint**: US17 complete — file upload with decorator-driven type/size rules, toast feedback, and inline preview.

---

## Phase 28: User Story 18 — Tag Input with Decorator Constraints (Priority: P1)

**Goal**: Add `@MaxTags`, `@MaxTagSize`, and `@MaxStringSize` property decorators with `BaseEntity` readers, and a `TagInputComponent` that renders comma-separated values as editable outlined chips. Validation enforces per-tag size, overall string length, and maximum tag count, with toast feedback per violation. Editing a single chip disallows comma-split.

**Independent Test**: Adding tags via comma-split correctly splits, validates each chip against `MaxTagSize`, checks total string length against `MaxStringSize`, limits count via `MaxTags`, shows a toast per violated constraint, skips violating tags, and adds valid ones; editing a chip with a comma triggers toast + revert; deleting a chip updates the model value; all three decorators return correct values from `BaseEntity`.

### Decorators and BaseEntity

- [X] T188 [US18] Create `@MaxTags(n: number)` property decorator storing `n` via `MAX_TAGS_KEY` Symbol on the class prototype in `src/decorations/max_tags_decorator.ts`
- [X] T189 [P] [US18] Create `@MaxTagSize(n: number)` property decorator storing `n` via `MAX_TAG_SIZE_KEY` Symbol on the class prototype in `src/decorations/max_tag_size_decorator.ts`
- [X] T190 [P] [US18] Create `@MaxStringSize(n: number)` property decorator storing `n` via `MAX_STRING_SIZE_KEY` Symbol on the class prototype in `src/decorations/max_string_size_decorator.ts`
- [X] T191 [P] [US18] Export `MaxTags`, `MAX_TAGS_KEY`, `MaxTagSize`, `MAX_TAG_SIZE_KEY`, `MaxStringSize`, `MAX_STRING_SIZE_KEY` from `src/decorations/index.ts`
- [X] T192 [US18] Add `getMaxTags(propertyKey: string): number | undefined` to `BaseEntity` reading `MAX_TAGS_KEY` prototype metadata in `src/entities/base_entity.ts`
- [X] T193 [P] [US18] Add `getMaxTagSize(propertyKey: string): number | undefined` to `BaseEntity` reading `MAX_TAG_SIZE_KEY` prototype metadata in `src/entities/base_entity.ts`
- [X] T194 [P] [US18] Add `getMaxStringSize(propertyKey: string): number | undefined` to `BaseEntity` reading `MAX_STRING_SIZE_KEY` prototype metadata in `src/entities/base_entity.ts`

### Form Component

- [X] T195 [US18] Create `TagInputComponent.vue` — `modelValue` is a comma-separated string (e.g. `"alpha,beta,gamma"`); renders chips as a flex-wrap row of outlined button-style elements (CSS token `outlined`, not `fill`) each showing tag text and a delete icon button; clicking a chip's text label enters single-chip inline edit mode: a comma character in the edit value triggers toast `validation.tag_no_comma` + reverts to previous value; on blur/Enter re-validates: if result violates `MaxTagSize` → toast + revert, if result violates `MaxStringSize` (whole new joined string) → toast + revert; an add-button (`GGICONS.ADD`, icon-only) appears after the last chip; clicking it shows an inline text input; on Enter or blur splits input by comma producing candidate tags; each candidate is processed sequentially: skip and toast if it exceeds `MaxTagSize` (if defined); skip and toast if appending it would make the full comma-joined string exceed `MaxStringSize` (if defined); stop and toast remaining if adding it would exceed `MaxTags` count limit (if defined); valid tags are appended to the model value; emits `update:modelValue` after every destructive action (add/delete/edit); full validation runs on the `validate-inputs` event; data type is `String` with `StringType.TAGS` in `src/components/Form/TagInputComponent.vue`

### Registry and Exports

- [X] T196 [US18] Register `StringType.TAGS` → `TagInputComponent` in `src/models/input_registry.ts`
- [X] T197 [P] [US18] Export `TagInputComponent` from `src/components/Form/index.ts`

**Checkpoint**: US18 complete — tag input with outlined-chip UI and decorator-driven constraint validation.

---

## Phase 29: Phase 3 Fixes and Polish

- [X] T198 Fix typo `lenght` → `length` in prop definition and all internal `props.lenght` usages in `src/components/Form/TelephoneInputComponent.vue`

**Checkpoint**: Phase 3 fixes complete.

---

## Phase 3 Dependencies

- **Phase 24 (Foundational — StringType)**: Must complete before any Phase 25–28 task.
- **Phase 25 (US15 — Date/Time)**: Depends on Phase 24. T166/T167/T168 (informative pickers) must precede T169/T170/T171 (form inputs). T172/T173 (registry/exports) follow.
- **Phase 26 (US16 — Color)**: Depends on Phase 24. T174 (picker) must precede T175 (input). T176/T177 follow.
- **Phase 27 (US17 — File)**: Depends on Phase 24. T178/T179/T180 (decorators) and T181/T182 (BaseEntity) precede T183/T184 (components). T185/T186/T187 follow.
- **Phase 28 (US18 — Tags)**: Depends on Phase 24. T188–T194 (decorators + BaseEntity) precede T195 (component). T196/T197 follow.
- **Phase 29 (Fixes)**: Independent of all above. Can run at any time.

## Phase 3 Parallel Opportunities

```bash
# Phase 24 (single blocking task — no parallelism)
T165 add DATE, TIME, DATETIME, COLOR, FILE, TAGS to StringType

# Phase 25 — after T165
Parallel: T166 CalendarComponent.vue + T167 CalendarForInputComponent.vue + T168 ClockPickerComponent.vue
  ↓
  T169 DateInputComponent.vue rewrite
  T170 HourInputComponent.vue (after T168)
  T171 DateTimeInputComponent.vue (after T167 + T168)
  ↓
  T172 register in InputRegistry
Parallel: T173 Form/index.ts export

# Phase 26 — after T165
  T174 ColorPickerComponent.vue
  ↓
  T175 ColorInputComponent.vue
  ↓
  T176 register in InputRegistry
Parallel: T177 Form/index.ts export

# Phase 27 — after T165
Parallel: T178 @SupportedFiles + T179 @MaxSizeFiles + T180 index.ts exports
  ↓
Parallel: T181 getSupportedFiles BaseEntity + T182 getMaxFileSizeBytes BaseEntity
  ↓
  T183 FilePreviewComponent.vue
  T184 FileUploadInputComponent.vue (after T183)
  T185 Configuration @ModuleCustomComponents
  ↓
  T186 register in InputRegistry
Parallel: T187 Form/index.ts export

# Phase 28 — after T165
Parallel: T188 @MaxTags + T189 @MaxTagSize + T190 @MaxStringSize + T191 index.ts exports
  ↓
Parallel: T192 getMaxTags + T193 getMaxTagSize + T194 getMaxStringSize in BaseEntity
  ↓
  T195 TagInputComponent.vue
  ↓
  T196 register in InputRegistry
Parallel: T197 Form/index.ts export

# Phase 29 — independent at any time
  T198 fix TelephoneInputComponent lenght typo
```

## Phase 3 Task Count

| Phase | Tasks | Story | Parallelizable |
|-------|-------|-------|----------------|
| Phase 24: Foundational | T165 | — | 0 |
| Phase 25: US15 Date/Time | T166–T173 | US15 | 4 of 8 |
| Phase 26: US16 Color | T174–T177 | US16 | 1 of 4 |
| Phase 27: US17 File Upload | T178–T187 | US17 | 6 of 10 |
| Phase 28: US18 Tag Input | T188–T197 | US18 | 7 of 10 |
| Phase 29: Fixes | T198 | — | 1 of 1 |
| **TOTAL** | **34 tasks** | | **~19 parallelizable** |

## Phase 3 MVP Scope

Suggested Phase 3 MVP: **US15 first** (most foundational — calendar/clock used by other date inputs), then **US18** (tag input, high utility), then **US17** (file upload), then **US16** (color picker).
