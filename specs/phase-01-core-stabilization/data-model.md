# Data Model: Phase 01 - Core Stabilization

**Branch**: `phase-01-core-stabilization`
**Date**: 2026-03-05 | **Last updated**: 2026-03-25
**Phase**: Documentation Realignment

> **Note**: Entities in section 1 marked *[Conceptual]* are documentation models used to describe framework behavior; they are not TypeScript classes in `src/`. Entities marked *[Implemented]* correspond to actual classes in `src/entities/`.

## 1. Stabilization Domain Entities

### 1.0 ExtraFunctions *[Implemented — as metadata type]*

Represents one custom method action surfaced in action bars. Produced by the `@OnViewFunction` decorator and stored in entity method metadata.

Fields:
- `icon: GGIconKey`
- `text: string`
- `viewTypes: ViewTypes[]`
- `fn: () => unknown`

Validation rules:
- `fn` must be bound to the current entity instance before UI execution.
- `viewTypes` drives visibility; button appears only when current view matches.

### 1.1 ModuleStabilityProfile *[Conceptual — documentation only]*

Documentation model representing stability expectations for a registered module. Not a TypeScript class; describes what can be inferred from class-level and property-level metadata on any `BaseEntity` subclass.

Fields:
- `moduleName: string`
- `apiEndpoint: string`
- `allowedMethods: string[]`
- `hasRequiredMetadata: boolean`
- `uiGenerationMode: 'metadata-driven'`
- `lastVerificationAt: string`

Validation rules:
- `moduleName` and `apiEndpoint` are mandatory.
- `allowedMethods` must include at least `GET` for list/detail navigation consistency.
- `uiGenerationMode` is fixed to `metadata-driven` (A3 guard).

### 1.2 CrudLifecycleState *[Conceptual — lifecycle documentation model]*

Documentation model describing runtime lifecycle consistency checkpoints for an entity operation. Reflects the canonical CRUD phase order: `guard → validate → persist → reconcile → notify`. Not a TypeScript class.

Fields:
- `isLoading: boolean`
- `isDirty: boolean`
- `isValid: boolean`
- `operation: 'load' | 'create' | 'update' | 'delete'`
- `phase: 'guard' | 'validate' | 'persist' | 'reconcile' | 'notify'`
- `errorMessage?: string`

Validation rules:
- `phase` transition must follow canonical order.
- `persist` phase cannot execute if `isValid` is false.

### 1.3 ProductionReadinessChecklist *[Conceptual — release gate model]*

Documentation model representing the gate criteria for first production release. All fields are satisfied as of Phase 01 closure. Not a TypeScript class.

Fields:
- `buildDeterministic: boolean`
- `envConfigured: boolean`
- `routingSmokePass: boolean`
- `crudSmokePass: boolean`
- `errorSurfacingPass: boolean`
- `releaseCandidate: boolean`

Validation rules:
- `releaseCandidate` can be true only when all other fields are true.

### 1.4 Configuration *[Implemented — `src/entities/configuration.ts`]*

Editable application-level configuration entity extending `BaseEntity`.

Fields (15 decorated class properties, ordered by `@PropertyIndex`, mirrors `AppConfiguration` contract):

| # | Field | Type | Env Variable | Default |
|---|-------|------|-------------|--------|
| 1 | `appName` | `string` | `VITE_APP_NAME` | `'My SaaS Application'` |
| 2 | `appVersion` | `string` | `VITE_APP_VERSION` | `'1.0.0'` |
| 3 | `squared_app_logo_image` | `string` | `VITE_SQUARED_APP_LOGO_IMAGE` | `ICONS.SQUARED_APP_LOGO` |
| 4 | `apiBaseUrl` | `string` | `VITE_API_BASE_URL` | `'https://api.my-saas-app.com'` |
| 5 | `apiTimeout` | `number` | `VITE_API_TIMEOUT` | `30000` |
| 6 | `apiRetryAttempts` | `number` | `VITE_API_RETRY_ATTEMPTS` | `3` |
| 7 | `environment` | `string` | `VITE_ENVIRONMENT` | `'development'` |
| 8 | `logLevel` | `string` | `VITE_LOG_LEVEL` | `'info'` |
| 9 | `authTokenKey` | `string` | `VITE_AUTH_TOKEN_KEY` | `'auth_token'` |
| 10 | `authRefreshTokenKey` | `string` | `VITE_AUTH_REFRESH_TOKEN_KEY` | `'refresh_token'` |
| 11 | `sessionTimeout` | `number` | `VITE_SESSION_TIMEOUT` | `3600000` |
| 12 | `itemsPerPage` | `number` | `VITE_ITEMS_PER_PAGE` | `20` |
| 13 | `maxFileSize` | `number` | `VITE_MAX_FILE_SIZE` | `5242880` |
| 14 | `isDarkMode` | `boolean` | — | persisted to `localStorage` |
| 15 | `selectedLanguage` | `Language` (enum) | `VITE_SELECTED_LANGUAGE` | `Language.EN` |

> **Note**: `asyncValidationDebounce` is **not a class property** of `Configuration`. It is computed inline inside `toAppConfiguration()` as `Number(import.meta.env.VITE_ASYNC_VALIDATION_DEBOUNCE) || 300`. It is never decorated, never rendered in the UI, and never editable by the user. (Fixes DA-02)

Validation rules:
- Configuration save flow persists `isDarkMode` and `selectedLanguage` to localStorage.
- Configuration entity is NOT registered in `ModuleList`; accessed via Configuration dropdown action.

### 1.5 Product *[Implemented — `src/entities/product.ts`]*

Primary demo CRUD module. Extends `BaseEntity`.

**Module configuration**:
- `@Module({ name: 'custom.products.title', icon: ICONS.PRODUCTS, apiEndpoint: '/api/products', apiMethods: ['GET','POST','PUT','DELETE'] })`
- `@DefaultProperty('name')` — property used as display label in relation fields
- `@PrimaryProperty('id')` — primary key
- `@UniquePropertyKey('id')` — unique identifier decorator

**Fields by `@ViewGroup`**:

*ViewGroup 1 — Identity*

| # | Field | Type | Key Decorators |
|---|-------|------|---------------|
| 1 | `id` | `Number` | `@HideInDetailView`, `@HideInListView` |
| 2 | `name` | `String` | `@Required` |
| 3 | `grupo` | `String` | `@StringTypeDef`, `@Required`, `@Disabled` |

*ViewGroup 2 — Main Data*

| # | Field | Type | Key Decorators |
|---|-------|------|---------------|
| 4 | `description` | `String` | `@StringTypeDef(TEXTAREA)`, `@Required` |
| 5 | `stock` | `Number` | `@DisplayFormat`, `@Validation(Validators.min)` |
| 6 | `genericDate` | `Date` | `@Required` |
| 7 | `Catedral` | `Product` | `@Required` — self-referencing relation |

*ViewGroup 3 — Contact & Security*

| # | Field | Type | Key Decorators |
|---|-------|------|---------------|
| 8 | `bolian` | `Boolean` | — |
| 9 | `email` | `String` | `@StringTypeDef(EMAIL)`, `@AsyncValidation`, `@Required` |
| 10 | `password` | `String` | `@StringTypeDef(PASSWORD)`, `@Required` |
| 11 | `phone` | `String` | `@StringTypeDef(TELEPHONE)` |
| 12 | `websiteUrl` | `String` | `@StringTypeDef(URL)` |
| 13 | `imageUrl` | `String` | `@StringTypeDef(URL_IMAGE)` |
| 14 | `searchQuery` | `String` | `@StringTypeDef(SEARCH)` |
| 15 | `cardNumber` | `String` | `@StringTypeDef(CREDIT_CARD)` |
| 16 | `cardDate` | `String` | `@StringTypeDef(CREDIT_CARD_DATE)` |
| 17 | `cardCvv` | `String` | `@StringTypeDef(CREDIT_CARD_CVV)` |

*ViewGroup 4 — Scheduling, Media & Tags*

| # | Field | Type | Key Decorators |
|---|-------|------|---------------|
| 18 | `scheduledDate` | `Date` | `@StringTypeDef(DATE)` |
| 19 | `scheduledTime` | `String` | `@StringTypeDef(TIME)` |
| 20 | `scheduledDateTime` | `String` | `@StringTypeDef(DATETIME)` |
| 21 | `themeColor` | `String` | `@StringTypeDef(COLOR)` |
| 22 | `attachment` | `File` | `@StringTypeDef(FILE)`, `@SupportedFiles(...)`, `@MaxSizeFiles(5)` |
| 23 | `tags` | `Tags` | `@StringTypeDef(TAGS)`, `@MaxTags(10)`, `@MaxTagSize(30)`, `@MaxStringSize(200)` |

*Additional field (with @TabOrder)*

| Field | Type | Key Decorators |
|-------|------|---------------|
| `listaProductos` | `Product[]` | `@TabOrder(1)`, `@ArrayOf(Product)`, `@Required`, `@Validation(arr => arr.length > 3)` |

---

## 2. Existing Framework Entities in Scope

### 2.1 BaseEntity (existing, stabilized behavior)

Key stabilized behaviors:
- Metadata access and property ordering.
- CRUD guards for endpoint/method configuration.
- Validation chain ordering and error assignment.
- Dirty-state and loading-state updates around persistence.

### 2.2 Application (existing singleton, stabilized orchestration)

Key stabilized behaviors:
- Module registration consistency.
- View transitions and route-oriented context updates.
- Centralized UI signaling for loading, dialogs, and toasts.

### 2.3 Home *[Implemented — `src/entities/home.ts`]*

Navigation root entity. Extends `BaseEntity`. Intentionally has no decorated properties — its sole purpose is to register the home route with its default view component.

**Class decorators**:
- `@Module({ name: 'common.home', icon: ICONS.HOME, persistent: false })` — non-persistent; suppresses CRUD API actions
- `@ModuleDefaultComponent(HomeView)` — renders `HomeView` as the module's default view
- `@NotRequiresLogin()` — marks entity as auth-exempt; `isNotRequiresLogin()` returns `true`

**Property body**: empty — no `@PropertyIndex`-decorated fields.

---

## 3. Relationships

1. `ModuleStabilityProfile` is derived from class-level and property-level metadata of `BaseEntity` descendants.
2. `CrudLifecycleState` maps 1:1 to each runtime operation invoked through `BaseEntity` methods and coordinated by `Application` view state.
3. `ProductionReadinessChecklist` aggregates outcomes from smoke checks over routing, CRUD, and error surfacing behavior.

## 4. State Transitions

### 4.1 CRUD Lifecycle

`guard -> validate -> persist -> reconcile -> notify`

Transition constraints:
- `guard` failure ends flow with `notify` error.
- `validate` failure skips `persist` and ends with `notify` error.
- `persist` success must be followed by state reconciliation (`isDirty=false` where applicable).

### 4.2 Release Readiness

`draft -> smoke-verified -> release-candidate`

Transition constraints:
- Move to `smoke-verified` only if routing and CRUD checks pass.
- Move to `release-candidate` only if production env and error surfacing checks pass.

## 5. Contract Alignment Notes

- A1: no new layer modeled.
- A2: transitions follow unidirectional orchestration.
- A3: module profile is metadata-derived (conceptual entities) and rendered from decorator metadata (implemented entities).
- A4: no stack change implied by model.

---

*Last updated: 2026-03-25 — Documentation Realignment (T022-T023)*
