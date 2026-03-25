# Tasks: Phase 01 - Core Stabilization — Doc-Accuracy Patch Cycle

**Input**: Design documents from `/specs/phase-01-core-stabilization/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`, `tech-debt-register.md`
**Source of truth**: committed code on branch `phase-01-core-stabilization`

**Tests**: No code-test tasks. Validation is: every DA-xx and DG-xx item in `tech-debt-register.md` has a matching doc correction.

**Organization**: Tasks are grouped by user story (affected artifact) so each file can be corrected and independently verified.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different file, no unmet dependency)
- **[US1]**: `data-model.md` entity accuracy
- **[US2]**: `quickstart.md` environment and prerequisites accuracy
- **[US3]**: `contracts/base-entity-stability-contract.md` operation-sequence accuracy
- **[US4]**: `contracts/application-orchestration-contract.md` Pinia store accuracy
- **[US5]**: `research.md` decorator inventory completeness

---

## Phase 1: Setup (Patch Cycle Initialization)

**Purpose**: Open the doc-accuracy patch cycle in spec artifacts; create the consolidated tech-debt register.

- [X] T001 Update `specs/phase-01-core-stabilization/spec.md` status header to "Doc-Accuracy Patch Cycle 2 Active"; add cycle-2 policy note mirroring the existing Documentation Cycle Policy section
- [X] T002 Create `specs/phase-01-core-stabilization/tech-debt-register.md` consolidating all engineering debts (TD-02–TD-07), behavioral debts (BD-01–BD-05), documentation accuracy debts (DA-01–DA-10), and documentation completeness gaps (DG-01–DG-07)

---

## Phase 2: Foundational (Cross-Analysis Baseline)

**Purpose**: Blocking prerequisite — confirm the full list of env variables and decorator files before writing any content.

**⚠️ CRITICAL**: Phases 3–7 depend on the source lists produced here.

- [X] T003 Read `src/stores/app_config_store.ts` and `src/models/application.ts`; produce the canonical complete list of all `import.meta.env.*` variables consumed by the application; record in `tech-debt-register.md` DA-10 evidence column
- [X] T004 [P] Read all 35 files in `src/decorations/`; produce the canonical complete decorator list with scope (Class/Property/Method) and one-line behavior; record list as reference for T017

**Checkpoint**: Exact env var list and decorator inventory confirmed — content phases can now proceed in parallel

---

## Phase 3: User Story 1 — data-model.md Entity Accuracy (P1) 🎯 MVP

**Goal**: `data-model.md` accurately and completely documents all implemented entities and their properties

**Independent Test**: Every `@PropertyIndex`-decorated field in `src/entities/configuration.ts` and `src/entities/product.ts` has a matching entry in `data-model.md`; no field documented in `data-model.md` is absent from the source file

- [X] T005 [P] [US1] Fix DA-02: remove `asyncValidationDebounce` from the Configuration field list in `specs/phase-01-core-stabilization/data-model.md` §1.4; add a note clarifying it is computed inline inside `toAppConfiguration()` and is not a decorated class property in `specs/phase-01-core-stabilization/data-model.md`
- [X] T006 [P] [US1] Fix DA-03: change `selectedLanguage: string` to `selectedLanguage: Language` (enum) in `specs/phase-01-core-stabilization/data-model.md` §1.4 Configuration fields
- [X] T007 [US1] Fix DA-04: add all 9 missing Configuration field entries (indices 3, 6–13) to `specs/phase-01-core-stabilization/data-model.md` §1.4 — `squared_app_logo_image: string` (3), `apiRetryAttempts: number` (6), `environment: string` (7), `logLevel: string` (8), `authTokenKey: string` (9), `authRefreshTokenKey: string` (10), `sessionTimeout: number` (11), `itemsPerPage: number` (12), `maxFileSize: number` (13)
- [X] T008 [US1] Fix DG-01: add a new §1.5 Product entity section to `specs/phase-01-core-stabilization/data-model.md` marked *[Implemented — `src/entities/product.ts`]* documenting all 24 decorated properties grouped by `@ViewGroup`, the `@Module` config (`/api/products`, GET/POST/PUT/DELETE), and all key decorators used (`@AsyncValidation`, `@ArrayOf`, `@TabOrder`, `@Validation`, `@StringTypeDef`, `@SupportedFiles`, etc.)
- [X] T009 [US1] Fix DG-02: add a §2.3 Home entity entry to `specs/phase-01-core-stabilization/data-model.md` under "Existing Framework Entities in Scope" marked *[Implemented — `src/entities/home.ts`]* documenting its three class decorators (`@Module`, `@ModuleDefaultComponent`, `@NotRequiresLogin`) and intentionally empty property body

**Checkpoint**: `data-model.md` fully reflects all implemented entities — independently verifiable by comparing with `src/entities/`

---

## Phase 4: User Story 2 — quickstart.md Prerequisites Accuracy (P2)

**Goal**: `quickstart.md` Prerequisites section is executable from a clean checkout without environment setup failures

**Independent Test**: `.env` template from quickstart.md §1 contains every `import.meta.env.*` variable read in `src/`; Node version matches `package.json` engines field; no references to non-existent env variables

- [X] T010 [P] [US2] Fix DA-01: change Node.js version requirement in `specs/phase-01-core-stabilization/quickstart.md` §1 from "Node.js 18+" to "Node.js ^20.19.0 or >=22.12.0 (per package.json engines)"
- [X] T011 [P] [US2] Fix DA-09: remove the reference to `VITE_APP_LOGO` from `specs/phase-01-core-stabilization/quickstart.md` §1; replace with `VITE_SQUARED_APP_LOGO_IMAGE` (the variable that actually exists in `src/stores/app_config_store.ts`)
- [X] T012 [US2] Fix DA-10: expand the `.env` template in `specs/phase-01-core-stabilization/quickstart.md` §1 Prerequisites to include all 15 env variables consumed by the application, organized into groups (app identity, API, auth, i18n/theming, limits); each variable must include its type, default value, and source file reference
- [X] T013 [US2] Fix DG-06: add a "Bootstrap Sequence" subsection to `specs/phase-01-core-stabilization/quickstart.md` §1 documenting the initialization order from `src/main.ts`: createApp → createPinia → setActivePinia → app.use(pinia) → initializeApplication() → app.use(router) → app.mount

**Checkpoint**: A developer can follow quickstart.md §1 from a clean checkout and have all env vars configured correctly — no guessing required

---

## Phase 5: User Story 3 — base-entity-stability-contract.md Operation Sequence Accuracy (P3)

**Goal**: Contract operation sequences match actual BaseEntity method implementations

**Independent Test**: Each step listed in the contract for `save()`, `update()`, and `delete()` can be mapped to a specific line in `src/entities/base_entity.ts`; no step is documented that does not exist in code

- [X] T014 [P] [US3] Fix DA-06: replace all occurrences of `isDirty` (as a property reference) with `getDirtyState()` in `specs/phase-01-core-stabilization/contracts/base-entity-stability-contract.md`; add a note explaining it is a computed method, not a property, and how dirty state is reset (by reassigning `_originalState` after successful save)
- [X] T015 [US3] Fix DA-07: rewrite the `update()` operation sequence in `specs/phase-01-core-stabilization/contracts/base-entity-stability-contract.md` to accurately reflect the actual implementation: (1) validatePersistenceConfiguration, (2) API call, (3) reassign `_originalState`; add a behavioral note cross-referencing BD-01–BD-03 in `tech-debt-register.md` stating that the absence of `validateInputs`, loading overlay, and success toast is under triage
- [X] T016 [US3] Fix DA-08: rewrite the `delete()` operation sequence in `specs/phase-01-core-stabilization/contracts/base-entity-stability-contract.md` to accurately reflect the actual implementation: (1) validatePersistenceConfiguration, (2) API call, (3) `afterDelete()` hook; add a behavioral note cross-referencing BD-04–BD-05 in `tech-debt-register.md`

**Checkpoint**: All three CRUD method operation sequences in the contract are verifiable against `src/entities/base_entity.ts`

---

## Phase 6: User Story 4 — application-orchestration-contract.md Store Accuracy (P4)

**Goal**: Contract accurately describes which Pinia stores back `Application.*` properties

**Independent Test**: Every store ID named in the contract matches a `defineStore(id, ...)` call in `src/stores/`

- [X] T017 [US4] Fix DA-05: rewrite Commitment 6 in `specs/phase-01-core-stabilization/contracts/application-orchestration-contract.md` — replace the incorrect "`moduleList` store" claim with the accurate description: `Application.ModuleList` is backed by `moduleList`, a `ref` inside the `view` store extracted via `storeToRefs(viewStore).moduleList`; the three Pinia stores are `appConfig`, `view`, `ui`
- [X] T018 [P] [US4] Fix DG-05: add `Application.ListButtons` to the Pinia backing section of `specs/phase-01-core-stabilization/contracts/application-orchestration-contract.md` — `listButtons` ref extracted from `view` store via `storeToRefs`

**Checkpoint**: Every `Application.*` property mentioned in the contract maps to a verified store or ref in `src/stores/` or `src/models/application.ts`

---

## Phase 7: User Story 5 — research.md Decorator Inventory Completeness (P5)

**Goal**: `research.md` Implemented Baseline Snapshot documents the complete set of delivered decorators

**Independent Test**: Decorator count in the research.md table equals the number of decorator files in `src/decorations/` (35 total, excluding `index.ts`)

- [X] T019 [US5] Fix DG-07: expand the Decorators Delivered table in `specs/phase-01-core-stabilization/research.md` Implemented Baseline Snapshot to include all 35 delivered decorators — scope (Class/Property/Method) and one-line behavior for each; use the canonical list produced in T004
- [X] T020 [P] [US5] Fix DG-04: add `previewFile` shared reactive ref to the Architecture section of `specs/phase-01-core-stabilization/research.md` — document it as a `shallowRef<File | null>` (not a Pinia store) used for modal file preview coordination between `Configuration` entity and `FilePreviewComponent`
- [X] T021 [P] [US5] Fix DG-03: add a "save() vs update() Behavioral Difference" note to the Implemented Baseline Snapshot in `specs/phase-01-core-stabilization/research.md` documenting: `save()` = full lifecycle (validateInputs → loading overlay → API → originalState reset → toast); `update()` = bare API call (no validation, no overlay, no toast); mark as under triage per BD-01–BD-05

**Checkpoint**: research.md Decorators Delivered table has all 35 entries; behavioral difference is documented

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Traceability, changelog, and cycle closure

- [X] T022 [P] Update `specs/phase-01-core-stabilization/research.md` Documentation Artifact Checklist: reset all 8 items to `[ ]` for the new cycle; add the new artifact `tech-debt-register.md` as item 9
- [X] T023 [P] Add all doc-accuracy patch changes (T001–T022) to `specs/phase-01-core-stabilization/research.md` Documentation Changelog table with date 2026-03-25 and cycle label "Cycle 2 — Doc-Accuracy Patch"
- [X] T024 Perform cross-file verification: for each DA-xx and DG-xx in `tech-debt-register.md`, confirm the corresponding fix task produced the expected change; mark verified items in `tech-debt-register.md` DA/DG columns with ✅; record any remaining unresolved items
- [X] T025 Update `specs/phase-01-core-stabilization/spec.md` status to "Doc-Accuracy Patch Cycle 2 — Complete"; add Section 20 "Cycle 2 Closure" with outcome statement and link to `tech-debt-register.md`
- [X] T026 Mark all T001–T025 as [X] in `specs/phase-01-core-stabilization/tasks.md`

---

## Dependencies

```
T001 → (any)
T002 → (any)
T003 → T012 (env var list needed before expanding .env template)
T004 → T019 (decorator list needed before expanding table)
T005, T006 → (independent)
T007 → T005 (should run after basic Configuration fixes)
T008 → T007 (Product section is large; do after Configuration is clean)
T009 → T008 (Home entry references Product as peer)
T010, T011 → (independent)
T012 → T003 (needs canonical env var list)
T013 → T012 (bootstrap note follows .env template)
T014 → (independent)
T015 → T014 (update() sequence after isDirty rename)
T016 → T015 (delete() after update())
T017, T018 → (independent)
T019 → T004 (needs decorator inventory from T004)
T020, T021 → (independent)
T022, T023 → T001-T021 (changelog/checklist after all fixes done)
T024 → T005-T021 (verification requires all fixes done)
T025 → T024
T026 → T025
```

## Parallel Execution Examples

**Batch A** (independent, run together):
```
T003 + T004 + T010 + T011 + T014
```

**Batch B** (after Batch A):
```
T005 + T006 + T012 + T015 + T017 + T018 + T020 + T021
```

**Batch C** (after Batch B):
```
T007 + T013 + T016 + T019
```

**Sequential close**:
```
T008 → T009 → T022 + T023 → T024 → T025 → T026
```

## Implementation Strategy

**MVP scope (stop here for minimum viable accuracy)**:
- T001 + T002: Cycle initialization and tech-debt-register.md
- T005 + T006 + T007: Fix Configuration field errors (highest user impact)
- T008: Document Product entity (biggest completeness gap)
- T012: Complete .env template (most usable fix for new developer onboarding)

The remaining phases (US3–US5) complete the full accuracy pass but do not block a developer from using the framework correctly.
