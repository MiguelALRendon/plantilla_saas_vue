# Quickstart: Phase 01 - Core Stabilization

**Branch**: `phase-01-core-stabilization`
**Date**: 2026-03-05
**Goal**: Validate first functional framework version with production-oriented checks.

## 1. Prerequisites

1. Install dependencies:

```bash
npm install
```

2. Configure environment values (`.env` or equivalent):
- `VITE_API_BASE_URL`

3. Ensure at least one representative module is registered in Application.

## 2. Development Validation Flow

1. Run dev server:

```bash
npm run dev
```

2. Validate core behavior:
- Sidebar renders registered module.
- List view loads from configured endpoint.
- Detail view renders metadata-driven inputs.
- Required/sync/async validations trigger in order.
- Save/update/delete operations surface success and failure correctly.

3. Validate navigation safety:
- Dirty-state confirmation appears on unsafe transition.

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
- Route loading (`/`, module route, detail route).
- CRUD sequence with one representative module.
- Error surfacing for failed API response.
- Loading indicators and view reconciliation behavior.

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
