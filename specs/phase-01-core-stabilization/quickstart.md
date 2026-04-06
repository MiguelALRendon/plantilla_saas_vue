# Quickstart: Phase 01 - Core Stabilization

**Branch**: `phase-01-core-stabilization`
**Date**: 2026-03-05 | **Last updated**: 2026-03-25
**Goal**: Validate first functional framework version with production-oriented checks.

## 1. Prerequisites

**System requirements**:
- Node.js ^20.19.0 or >=22.12.0 (per `package.json` `engines` field) and npm 9+
- Git (to clone/checkout branch `phase-01-core-stabilization`)

**Setup steps**:

1. Clone or checkout the branch:

```bash
git checkout phase-01-core-stabilization
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (copy from `.env.example` if available) and configure:

```env
# App Identity
VITE_APP_NAME=My SaaS Application
VITE_APP_VERSION=1.0.0
VITE_SQUARED_APP_LOGO_IMAGE=   # path or URL to 1:1 ratio squared logo image

# API
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Auth
VITE_AUTH_TOKEN_KEY=auth_token
VITE_AUTH_REFRESH_TOKEN_KEY=refresh_token
VITE_SESSION_TIMEOUT=3600000

# i18n / Theming
VITE_SELECTED_LANGUAGE=en      # uses Language enum: 'en' | 'es' | etc.
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=info

# Limits
VITE_ITEMS_PER_PAGE=20
VITE_MAX_FILE_SIZE=5242880     # bytes (5 MB default)
```

> **Note**: `VITE_ASYNC_VALIDATION_DEBOUNCE` is consumed by `toAppConfiguration()` in `src/stores/app_config_store.ts` (default 300 ms) but is **not** a decorated class property of `Configuration` — it does not appear in the UI and does not need to be set for basic operation.

> **Removed**: `VITE_APP_LOGO` does not exist in the codebase. Use `VITE_SQUARED_APP_LOGO_IMAGE` for sidebar branding (fixes DA-09).

4. Verify at least one persistent module (`@Persistent`) is registered in `Application.initializeApplication()`.

### Bootstrap Sequence

> This sequence is executed in `src/main.ts` and must be preserved in this order.

```
1. const pinia = createPinia()
2. setActivePinia(pinia)           ← required before Application methods use stores
3. Application.initializeApplication(router)  ← loads AppConfiguration from env/localStorage
4. Application.registerModule(Home)
5. Application.registerModule(Product)    ← (repeat for each module)
6. const app = createApp(App)
7. app.use(pinia)
8. app.use(router)
9. app.mount('#app')
10. document.title = Application.AppConfiguration.value.appName
```

> **Critical**: `setActivePinia(pinia)` must be called **before** `Application.initializeApplication()` because `Application` methods access Pinia stores during initialization. Reversing this order causes a "no active Pinia" error.

## 2. Development Validation Flow

1. Run dev server:

```bash
npm run dev
```

2. Validate core behavior:
   - Sidebar renders all registered modules with correct name and icon.
   - List view loads from configured endpoint and displays metadata-driven columns.
   - Detail view renders metadata-driven inputs with correct types and labels.
   - Required, sync, and async validations trigger in correct order on save attempt.
   - Save/update/delete operations surface success toast and failure dialog correctly.
   - Collapsed sidebar shows icon-only entries with `squared_app_logo_image` at 1:1 ratio.
   - Expanded sidebar footer shows app title, `© galurensoft`, and version number.

3. Validate navigation safety:
   - Modify a detail-view field; confirm dirty-state confirmation appears on any navigation attempt.
   - Accept confirmation; confirm view transitions and action buttons update correctly.
   - Repeat using sidebar, profile menu, and configuration action entrypoints.

4. Validate table layout:
   - Open a module with many columns; confirm horizontal scroll is on header/body only.
   - Confirm pagination/footer controls remain anchored to container width.

## 3. Production-Oriented Validation Flow

1. Build production artifacts:

```bash
npm run build
```

2. Preview production bundle locally:

```bash
npm run preview
```

3. Execute smoke checks on preview:
   - Route loading (`/`, module list route, module detail route).
   - Full CRUD sequence with one representative persistent module.
   - Error surfacing for a failed API response (wrong endpoint).
   - Loading indicators and view reconciliation behavior.
   - Configuration detail open, save, and reload from localStorage.

## 4. Release Readiness Gate

Release candidate is accepted when all checks pass:
1. Build succeeds without blocking errors.
2. Environment configuration is correctly applied.
3. Metadata-driven UI behaves consistently in list/detail.
4. CRUD lifecycle is stable and deterministic.
5. Failure paths are visible and diagnosable.

## 5. Troubleshooting

1. Missing module in sidebar:
- Verify module registration and decorator metadata.

2. CRUD call fails unexpectedly:
- Verify endpoint and allowed methods metadata.
- Verify `VITE_API_BASE_URL` configuration.

3. Incorrect input rendering:
- Verify property metadata and ordering decorators.

4. Dirty-state not respected:
- Verify transition path uses Application orchestration flow.

## 6. Dynamic Action Buttons Smoke Checklist

Validate `@OnViewFunction` behavior for each view:

1. Decorate one entity method with `@OnViewFunction('ADD', 'Custom Action', [ViewTypes.DEFAULTVIEW])`.
2. Open module default view and verify button text/icon is rendered.
3. Confirm same button does not render in LISTVIEW or DETAILVIEW.
4. Repeat with LISTVIEW and DETAILVIEW mappings.
5. Click each rendered button and confirm the bound entity instance method executes.

Decorator misuse no-op validation:

1. Attempt to apply `@OnViewFunction` to class or property.
2. Confirm application does not crash and no action button is generated from invalid placement.

## 7. Configuration Detail Smoke Checklist

1. Open `ConfigurationListComponent` and click the settings button.
2. Verify `Configuration` detail is loaded with all `AppConfiguration` fields.
3. Confirm theme (`isDarkMode`) and language (`selectedLanguage`) fields are visible.
4. Update at least one text setting and one numeric setting.
5. Execute `Guardar` and verify success toast is shown.

Persistence and reload checks:

1. Reload the browser tab.
2. Verify dark mode and selected language are restored from localStorage.
3. Confirm API base URL and timeout settings are loaded into `Application.AppConfiguration`.

## 8. Login Exemption and Production Acceptance

Login-exemption metadata checks:

1. Confirm `Home` entity is decorated with `@NotRequiresLogin()`.
2. Verify `homeEntity.isNotRequiresLogin()` returns true.
3. Verify non-decorated entities return false.

Production build and preview acceptance checklist:

1. Run `npm run build` successfully.
2. Run `npm run preview` and validate route loading for Home and Product modules.
3. Validate dynamic action buttons render only in matching view types.
4. Validate configuration save and reload path in preview mode.
5. Confirm no blocking console/runtime errors in core navigation flows.

## 9. End-to-End Smoke Completion Log

- US1: Passed action-bar view filtering and instance-bound custom actions.
- US2: Passed configuration detail edit/persist/reload flow.
- US3: Passed login-exemption metadata resolution and production acceptance checklist.

## 10. Non-Persistent Regression Checklist (US4)

1. Open `Home` module and verify there is no `ApiEndpoint no definido` runtime error.
2. Confirm list fetch is skipped for non-persistent entities (`@Persistent` not present).
3. Confirm persistence-driven actions (save/update/delete/list reload) are not shown for non-persistent modules.
4. Confirm `Configuration` action from dropdown closes the dropdown before detail navigation.
5. Confirm app still loads persistent modules normally with list/data API flow.

## 11. Framework i18n Verification Checklist (US4)

1. Open `Configuration` detail and verify framework labels are translation-key based (not hardcoded strings).
2. Verify save action text resolves from `common.save`.
3. Trigger a guarded persistence path in a non-persistent entity and verify user-facing messages resolve from `errors.json` keys.
4. Switch language and verify framework settings labels/messages change accordingly.
5. Confirm no newly introduced hardcoded framework-level labels or error titles remain in touched flows.

## 12. Extended Smoke Completion Log

- US4: Passed non-persistent safety guards, dropdown close behavior, and framework i18n hardening checks.

## 13. Pinia State Backing Smoke Checklist (US5 — T085/T086)

1. After navigation, verify `Application.View.value.entityClass` returns the correct entity for that module.
2. Verify `Application.AppConfiguration.value.appName` matches the `VITE_APP_NAME` value from `.env`.
3. Open Vue DevTools → Pinia tab; confirm three stores are visible: `appConfig`, `view`, `ui`.
4. Trigger a toast notification and verify `Application.ToastList.value` array updates in the Pinia `ui` store.
5. Open a modal (e.g. confirm delete) and verify `Application.modal.value.show` becomes `true` in the Pinia `ui` store.
6. Reload the page; confirm the app boots without `[Vue warn]` errors related to Pinia.

## 14. Component Fixes Smoke Checklist (US6 — T096/T097)

1. Click the profile icon in the top bar; verify the dropdown opens without console errors (no `getElementById` warnings).
2. Click **Cerrar sesión** (logout); verify `authTokenKey` and `authRefreshTokenKey` are removed from `localStorage` and the browser navigates to `/login`.
3. With the sidebar expanded, verify the header shows the system logo image and the app name text.
4. With the sidebar expanded, verify the footer shows `© galurensoft` and a version number (e.g. `v0.0.1`).
5. Open a modal dialog; verify the accept button reads the `common.accept` translation key (e.g. "Aceptar" in Spanish).
6. Open a modal dialog; verify the close button reads the `common.close` translation key (e.g. "Cerrar" in Spanish).
7. Switch language to English; verify modal buttons update to "Accept" and "Close" without page reload.

## 15. Table Footer Anchoring Checklist (US12 — T141)

1. Open a module list with enough columns to force horizontal overflow.
2. Verify table header/body scroll horizontally while pagination/footer remains aligned to container width.
3. Resize viewport to tablet/mobile widths and confirm footer controls remain inside container bounds.
4. Verify footer controls do not split to opposite extremes of content width in any breakpoint.
5. Confirm previous/next/page-size interactions still work after layout refactor.

## 16. Dirty-Guard Cross-Entrypoint Timing Checklist (US13 — T146)

1. Modify a persistent entity in detail view to produce dirty state.
2. Navigate using sidebar module item and accept dirty confirmation; verify view change and action buttons update consistently.
3. Repeat from profile menu -> Configuration action and accept dirty confirmation; verify same timing/order as sidebar flow.
4. Repeat from configuration action fallback path and verify no delayed button refresh compared to sidebar flow.
5. Confirm no entrypoint bypasses dirty confirmation when unsaved changes exist.

## 17. Sidebar Branding Checklist (US14 — T153)

1. With expanded sidebar, verify header displays only logo image (no title text).
2. Verify footer displays app title first, then `© galurensoft`, then version.
3. Collapse sidebar and verify module labels are hidden (icon-only entries).
4. In collapsed mode, verify each module item has compact padding and rounded borders.
5. Verify collapsed header uses `squared_app_logo_image` and renders with 1:1 ratio.

## 18. Clarification Set Smoke Completion Log (US12-US14)

- US12: Footer anchoring implementation completed; pagination/footer now outside scroll region in both array and detail tables.
- US13: Navigation orchestration centralized through dirty-guard pipeline and shared transition timing.
- US14: Sidebar expanded/collapsed branding behavior implemented with icon-only collapsed mode and square-logo switching.

---

## 19. Release-Readiness Documentation Checklist

**Purpose**: Final gate for declaring Phase 01 documentation pack production-ready and handing off to the next implementation phase.

| Check | Criterion | Status |
|-------|-----------|--------|
| Spec status | `spec.md` status reflects implemented reality | ✅ |
| Scope alignment | Scope section covers all delivered behaviors | ✅ |
| FR coverage | All 11 functional requirements match implementation | ✅ |
| Traceability | Sections 10 references documentation-realignment tasks T001-T048 | ✅ |
| Plan framing | `plan.md` implementation phases marked as delivered | ✅ |
| Research baseline | Implemented-baseline snapshot present in `research.md` | ✅ |
| Terminology | Canonical terminology table present in `research.md` | ✅ |
| Data model | Conceptual vs implemented entities clearly distinguished | ✅ |
| Quickstart executable | Prerequisites runnable from clean checkout; smoke sections current | ✅ |
| Contract: BaseEntity | Invariants reflect delivered behavior; non-persistent guard documented | ✅ |
| Contract: Orchestration | Dirty-guard pipeline and Pinia backing documented | ✅ |
| Contract: Metadata-UI | Sidebar, table footer, form registry behaviors documented | ✅ |
| Tech debt register | Open debts TD-02 through TD-07 recorded in `research.md` | ✅ |
| Tasks backlog | `tasks.md` contains only documentation-realignment tasks T001-T048 | ✅ |

**Outcome**: All documentation artifacts are aligned with the committed implementation. Phase 01 is closed for documentation. Next implementation work should open a new feature branch and spec.

---

## 20. Documentation Realignment Verification Log (T047)

**Run date**: 2026-03-25  
**Scope**: Documentation-only cycle — T001–T048 (no source code modified)

| Artifact | Verification Result | Notes |
|----------|--------------------|--------------------------------------------|
| `spec.md` | ✅ Pass | Status header updated; traceability section aligned to T001-T048; section numbering 13–15 sequential |
| `plan.md` | ✅ Pass | Documentation-only scope clause present; all F1–F4 phases marked delivered; debt register table present |
| `research.md` | ✅ Pass | Implemented-baseline snapshot, canonical terminology, documentation changelog (37 entries), and maintenance protocol present |
| `data-model.md` | ✅ Pass | `[Conceptual]` vs `[Implemented]` annotations added to all entities; `Configuration` fields fully listed |
| `quickstart.md` | ✅ Pass | Prerequisites rebuilt with `.env` template; smoke sections current; release-readiness checklist in Section 19 |
| `contracts/base-entity-stability-contract.md` | ✅ Pass | Non-persistent guard, `isDirty=false` post-save invariant, and `BaseEntity` index type narrowing documented |
| `contracts/application-orchestration-contract.md` | ✅ Pass | Pinia backing note, Routing Rule 6, and present-tense error handling language in place |
| `contracts/metadata-ui-contract.md` | ✅ Pass | `InputRegistry`, `useFormRenderer`, sidebar-collapse guarantee (Rule 6), and `@OnViewFunction` filters (Rules 7–8) documented |

**T047 Outcome**: End-to-end documentation pass complete. All 8 artifacts verified consistent. Tasks T001–T046 confirmed complete.
