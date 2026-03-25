# Technical Debt Register: Phase 01 - Core Stabilization

**Branch**: `phase-01-core-stabilization`
**Last updated**: 2026-03-25
**Source of truth**: committed code on branch `phase-01-core-stabilization`
**Analysis method**: Cross-comparison of all spec artifacts in `specs/phase-01-core-stabilization/` against source files in `src/`

This register consolidates all engineering debt, behavioral debt, documentation accuracy debt, and documentation completeness gaps identified for Phase 01.

---

## Section 1: Engineering Debt (Pre-Existing, from plan.md)

These items were documented during Phase 01 implementation and remain open.

| ID | Description | Category | Severity | Resolution Phase |
|----|-------------|----------|----------|-----------------|
| TD-02 | JWT token stored in `localStorage` — violates OWASP A07 (Identification/Authentication Failure). `localStorage.getItem(authTokenKey)` is used directly in `src/models/application.ts`. | Security | High | Authentication phase |
| TD-03 | Zero automated test coverage. No Vitest, no unit tests, no integration tests exist in the repository. | Testing | High | Post-stabilization testing phase |
| TD-04 | `@NotRequiresLogin()` decorator marks entities as login-exempt but the router guard in `src/router/index.ts` does not consume `isNotRequiresLogin()`. The security boundary is not enforced. | Security | High | Authentication phase |
| TD-05 | `@ModulePermission` decorator file exists (`src/decorations/module_permission_decorator.ts`) but field/action permission enforcement is not implemented anywhere in rendering or action logic. | Security | Medium | Authentication phase |
| TD-07 | `@AsyncValidation` debounce behavior (`VITE_ASYNC_VALIDATION_DEBOUNCE`) cannot be end-to-end verified without a real backend fixture with a controlled response delay. | Testing | Low | Testing phase |

> **Closed debts**: TD-01 (platform clarification — resolved as CSR-first SPA) and TD-06 (breadcrumb navigation — explicitly not required) were closed in Phase 01.

---

## Section 2: Behavioral Debt (Code behavior needs triage)

These items describe code behavior that is inconsistent with documented operation sequences or with peer methods. The code is the source of truth; these are flagged for review to determine if the behavior is intentional design or an unintended omission.

| ID | File | Method | Observed Behavior | Expected by Contract / Peer Method | Severity |
|----|------|--------|------------------|-------------------------------------|----------|
| BD-01 | `src/entities/base_entity.ts` | `update()` | Does **not** call `validateInputs()` before persisting. Invalid/dirty data can reach the API without running any validation. | `save()` calls `await this.validateInputs()` as step 2 before any API call. | High |
| BD-02 | `src/entities/base_entity.ts` | `update()` | Does **not** call `showLoadingMenu()` or `hideLoadingMenu()`. No global loading overlay is shown during update operations. | `save()` sets `_isSaving=true` and calls `showLoadingMenu()` before the API; calls `hideLoadingMenu()` and `_isSaving=false` in finally. | Medium |
| BD-03 | `src/entities/base_entity.ts` | `update()` | Does **not** emit a success toast after a successful API response. | `save()` calls `showToast(...)` on success. | Low |
| BD-04 | `src/entities/base_entity.ts` | `delete()` | Does **not** activate/deactivate the loading overlay. No visual feedback during delete. | `save()` and `update()` both set `_isSaving` state; contract documents loading as step 2 of delete. | Medium |
| BD-05 | `src/entities/base_entity.ts` | `delete()` | Does **not** show a success notification. Only calls the `afterDelete()` no-op hook. | Contract documents step 5 as "Notify outcome (success toast / error dialog)". | Low |

> **Triage note**: BD-01 is the highest-risk item. Calling `update()` without input validation means required-field and sync-validation checks are bypassed on any edit-flow that calls `update()` instead of `save()`. Determine in Phase 02 planning whether this is intentional (e.g., optimistic updates) or a bug.

---

## Section 3: Documentation Accuracy Debt (Doc claims ≠ Code reality)

These items are documentation errors where spec artifacts make claims that are factually incorrect when compared against committed source code. Each item has a corresponding fix task in `tasks.md`.

| ID | Artifact | Location | Doc Claims | Code Reality | Severity | Fix Task |
|----|----------|----------|------------|--------------|----------|----------|
| DA-01 | `quickstart.md` | §1 Prerequisites | Node.js 18+ | `package.json` `engines`: `"node": "^20.19.0 \|\| >=22.12.0"` | Medium | T010 ✅ |
| DA-02 | `data-model.md` | §1.4 Configuration fields | `asyncValidationDebounce: number` is a class field loaded from `VITE_ASYNC_VALIDATION_DEBOUNCE` | **Not a class property**. Only computed inline inside `toAppConfiguration()` as `Number(import.meta.env.VITE_ASYNC_VALIDATION_DEBOUNCE) \|\| 300`. Never decorated, never rendered in UI, never editable by user. | High | T005 ✅ |
| DA-03 | `data-model.md` | §1.4 Configuration fields | `selectedLanguage: string` | `selectedLanguage!: Language` — uses the `Language` enum, not a plain string | Low | T006 ✅ |
| DA-04 | `data-model.md` | §1.4 Configuration fields | 6 fields listed (indices 1, 2, 4, 5, 14, 15) | **15 decorated class properties** exist (indices 1–15). 9 fields are completely absent from documentation: `squared_app_logo_image` (3), `apiRetryAttempts` (6), `environment` (7), `logLevel` (8), `authTokenKey` (9), `authRefreshTokenKey` (10), `sessionTimeout` (11), `itemsPerPage` (12), `maxFileSize` (13) | High | T007 ✅ |
| DA-05 | `contracts/application-orchestration-contract.md` | Commitment 6 | "`moduleList`" named as a Pinia store | **No `moduleList` store exists**. The three Pinia stores are `appConfig`, `view`, `ui`. `moduleList` is a `ref` *inside* the `view` store, extracted via `storeToRefs(viewStore).moduleList` in `src/models/application.ts`. | Medium | T017 ✅ |
| DA-06 | `contracts/base-entity-stability-contract.md` | Invariants / operation sequences | `isDirty` resets to `false` after save/update | **`isDirty` property does not exist**. Dirty state is computed by `getDirtyState()` which compares `_originalState` with `toPersistentObject()` using `deepEqual`. It is reset indirectly by reassigning `this._originalState = deepClone(this.toPersistentObject())` after a successful save. | Low | T014 ✅ |
| DA-07 | `contracts/base-entity-stability-contract.md` | Operation Sequence: `update()` | `update()` follows same sequence as `save()`: validateInputs → activate loading → API call → deactivate loading → notify outcome | **Actual `update()` sequence**: validatePersistenceConfiguration → API call → assign `_originalState` → navigate. No `validateInputs`, no `showLoadingMenu`/`hideLoadingMenu`, no success toast. | High | T015 ✅ |
| DA-08 | `contracts/base-entity-stability-contract.md` | Operation Sequence: `delete()` | `delete()`: activate loading state → API call → deactivate loading → notify outcome (success toast / error) | **Actual `delete()` sequence**: validatePersistenceConfiguration → API call → `afterDelete()` hook. No loading state activation/deactivation, no success notification. | Medium | T016 ✅ |
| DA-09 | `quickstart.md` | §1 Prerequisites | References `VITE_APP_LOGO` env variable | `VITE_APP_LOGO` does **not exist** in source code. The correct variable is `VITE_SQUARED_APP_LOGO_IMAGE`, read in `src/stores/app_config_store.ts` and `src/models/application.ts`. | Low | T011 ✅ |
| DA-10 | `quickstart.md` | §1 Prerequisites `.env` template | Template lists 5 variables: `VITE_API_BASE_URL`, `VITE_APP_NAME`, `VITE_APP_VERSION`, `VITE_API_TIMEOUT`, `VITE_ASYNC_VALIDATION_DEBOUNCE` | Code reads **15 env variables** in total (`src/stores/app_config_store.ts`): `VITE_APP_NAME` (→appName, default 'My SaaS Application'), `VITE_APP_VERSION` (→appVersion, default '1.0.0'), `VITE_SQUARED_APP_LOGO_IMAGE` (→squared_app_logo_image), `VITE_API_BASE_URL` (→apiBaseUrl), `VITE_API_TIMEOUT` (→apiTimeout, default 30000), `VITE_API_RETRY_ATTEMPTS` (→apiRetryAttempts, default 3), `VITE_ENVIRONMENT` (→environment, default 'development'), `VITE_LOG_LEVEL` (→logLevel, default 'info'), `VITE_AUTH_TOKEN_KEY` (→authTokenKey, default 'auth_token'), `VITE_AUTH_REFRESH_TOKEN_KEY` (→authRefreshTokenKey, default 'refresh_token'), `VITE_SESSION_TIMEOUT` (→sessionTimeout, default 3600000), `VITE_ITEMS_PER_PAGE` (→itemsPerPage, default 20), `VITE_MAX_FILE_SIZE` (→maxFileSize, default 5242880), `VITE_SELECTED_LANGUAGE` (→selectedLanguage: Language enum, default Language.EN), `VITE_ASYNC_VALIDATION_DEBOUNCE` (NOT a class property — computed inline in `toAppConfiguration()` only, default 300). **10 are missing** from the `.env` template. | High | T012 ✅ |

---

## Section 4: Documentation Completeness Gaps (Code exists, docs are silent)

These items describe code components or behaviors that exist in the committed codebase but are not documented in any spec artifact. Each item has a corresponding task in `tasks.md`.

| ID | Component | Code Location | Gap Description | Severity | Fix Task |
|----|-----------|--------------|-----------------|----------|----------|
| DG-01 | `Product` entity | `src/entities/product.ts` | Entire entity is **absent from `data-model.md`**. `Product` is the primary demo CRUD module: 24+ decorated properties across 4 `@ViewGroup` regions; uses 20+ distinct decorators including `@AsyncValidation`, `@ArrayOf`, `@TabOrder`, `@Validation`; registered at `/api/products` with full `GET/POST/PUT/DELETE` CRUD. | High | T008 ✅ |
| DG-02 | `Home` entity | `src/entities/home.ts` | Mentioned in `spec.md §9` as delivered but has **no entity entry in `data-model.md`**. It is `@Module({ name: 'common.home', icon: ICONS.HOME, persistent: false })` + `@ModuleDefaultComponent(HomeView)` + `@NotRequiresLogin()`. | Low | T009 ✅ |
| DG-03 | `update()` vs `save()` behavioral difference | `src/entities/base_entity.ts` | `save()` runs a full lifecycle (validate → loading overlay → API → toast); `update()` is a bare API call. This significant behavioral difference is **not documented anywhere** as intentional design, known limitation, or architectural decision. | Medium | T021 ✅ |
| DG-04 | `previewFile` shared reactive ref | `src/stores/file_preview_store.ts` | A `shallowRef<File \| null>` shared between `Configuration` entity (via `@ModuleCustomComponents`) and `FilePreviewComponent`. **Not mentioned** in any spec. `research.md` states "three Pinia stores" only; this is a fourth piece of global reactive state (not a Pinia store, but architecturally equivalent). | Low | T020 ✅ |
| DG-05 | `Application.ListButtons` | `src/models/application.ts` | `listButtons` ref extracted from the `view` store via `storeToRefs` and exposed as `Application.ListButtons`. **Absent from `application-orchestration-contract.md`** Pinia backing section. | Low | T018 ✅ |
| DG-06 | Bootstrap / init sequence | `src/main.ts` | Pinia initialization order, `setActivePinia()` call, and `initializeApplication()` invocation sequence is **not documented** in `quickstart.md` or any contract. Developers must reverse-engineer it from `main.ts`. | Low | T013 ✅ |
| DG-07 | 31 undocumented decorators | `src/decorations/` (35 files total) | `research.md` Decorators Delivered table lists only 4 decorators (`@OnViewFunction`, `@NotRequiresLogin`, `@Module`, `@Persistent`). **31 delivered decorator files are entirely undocumented**: `@Required`, `@Validation`, `@AsyncValidation`, `@PropertyIndex`, `@PropertyName`, `@HideInDetailView`, `@HideInListView`, `@StringTypeDef`, `@DisplayFormat`, `@ViewGroup`, `@ViewGroupRow`, `@TabOrder`, `@CSSColumnClass`, `@Disabled`, `@Readonly`, `@DefaultProperty`, `@PrimaryProperty`, `@UniquePropertyKey`, `@MaxStringSize`, `@MaxTags`, `@MaxTagSize`, `@MaxSizeFiles`, `@HelpText`, `@Mask`, `@ArrayOf`, `@SupportedFiles`, `@DefaultViewButtonList`, `@ModuleDefaultComponent`, `@ModuleDetailComponent`, `@ModuleListComponent`, `@ModuleCustomComponents` | High | T019 ✅ |

---

## Summary

| Category | Count | High | Medium | Low |
|----------|-------|------|--------|-----|
| Engineering Debt (TD-xx) | 5 | 3 | 1 | 1 |
| Behavioral Debt (BD-xx) | 5 | 1 | 2 | 2 |
| Documentation Accuracy (DA-xx) | 10 | 4 | 3 | 3 |
| Documentation Completeness (DG-xx) | 7 | 2 | 1 | 4 |
| **Total** | **27** | **10** | **7** | **10** |

---

## Resolution Roadmap

| Priority | Items | Recommended Action |
|----------|-------|-------------------|
| **Immediate — doc-accuracy patch** | DA-01 through DA-10, DG-01 through DG-07 | Execute `tasks.md` Doc-Accuracy Patch Cycle (T001–T022) |
| **Triage — behavioral** | BD-01 through BD-05 | Phase 02 planning: decide if `update()`/`delete()` gaps are bugs or intentional design; BD-01 is highest risk |
| **Auth phase** | TD-02, TD-04, TD-05 | Address as a unit in the authentication implementation phase |
| **Testing phase** | TD-03, TD-07 | Dedicated testing phase with Vitest adoption |
