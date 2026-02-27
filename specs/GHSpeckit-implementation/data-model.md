# Data Model: Framework SaaS Vue

**Branch**: `001-framework-saas-spec`
**Date**: 2026-02-26
**Phase**: 1 — Design & Contracts

---

## 1. Core Entities

### 1.1 BaseEntity (abstract)

The root abstract class every domain entity extends. Stores no data itself — it provides infrastructure.

```typescript
abstract class BaseEntity {
  // === Metadata (stored on prototype, not instance) ===
  // Accessed via Symbol keys; see Decorator Metadata Model below

  // === Instance State ===
  [key: string]: unknown           // allow property declaration via decorators

  // === Protected Runtime State ===
  protected _originalState: Record<string, unknown>  // snapshot at load time
  protected _isDirty: boolean                        // computed from deepEqual
  protected _isNew: boolean                          // true until first save()
  protected _isLoading: boolean                      // true during async ops
  protected _errors: Record<string, string[]>        // field-level validation errors
}
```

**Fields**:

| Field | Type | Source | Description |
|---|---|---|---|
| `_originalState` | `Record<string, unknown>` | Internal | Deep clone at load/creation; used for dirty tracking |
| `_isDirty` | `boolean` | Computed | `deepEqual(current, _originalState) === false` |
| `_isNew` | `boolean` | Internal | `true` until `save()` succeeds with POST response |
| `_isLoading` | `boolean` | Internal | Set `true` during save/load/delete async ops |
| `_errors` | `Record<string, string[]>` | Validation | Property-keyed array of error messages; empty = valid |

**State Transitions**:

```
[Created] → _isNew=true, _isDirty=false
    ↓ user modifies property
[Modified] → _isNew=true, _isDirty=true
    ↓ save() POST success
[Saved] → _isNew=false, _isDirty=false, _originalState refreshed
    ↓ user modifies property
[Modified again] → _isNew=false, _isDirty=true
    ↓ save() PUT success
[Updated] → _isNew=false, _isDirty=false, _originalState refreshed
    ↓ delete() success
[Deleted] → instance should be discarded
```

**Validation rules**:
- `validateInputs()` runs synchronous validators first, then async (short-circuit)
- `_errors` is cleared before each validation run
- `_errors` populated per-field; empty arrays = field valid

---

### 1.2 Decorator Metadata Schema

All metadata lives on `BaseEntity.prototype` keyed by Symbols. Each decorator stores a unique Symbol-keyed entry.

**Class-level metadata** (set once per decorated class):

| Symbol Key (conceptual) | Type | Set by | Description |
|---|---|---|---|
| `SYM_MODULE_NAME` | `string` | `@ModuleName` | Display name in sidebar + router |
| `SYM_API_ENDPOINT` | `string` | `@ApiEndpoint` | REST base URL, e.g. `/api/products` |
| `SYM_API_METHODS` | `string[]` | `@ApiMethods` | Allowed HTTP verbs: `['GET','POST','PUT','DELETE']` |
| `SYM_PERSISTENT` | `boolean` | `@Persistent` | Enables save/load/delete; required for CRUD |
| `SYM_DEFAULT_PROPERTY` | `string` | `@DefaultProperty` | Property key used as display label in list views |
| `SYM_PRIMARY_PROPERTY` | `string` | `@PrimaryProperty` | Property key used as PK for URLs / PUT |
| `SYM_UNIQUE_KEY` | `string` | `@UniquePropertyKey` | Property key used for uniqueness / URL segment |
| `SYM_MODULE_ICON` | `string` | `@ModuleIcon` | Icon identifier for sidebar/topbar |
| `SYM_MODULE_PERMISSION` | `string \| string[]` | `@ModulePermission` | Required permission(s) to access module |
| `SYM_MODULE_LIST_COMPONENT` | `Component` | `@ModuleListComponent` | Custom list view component (overrides default) |
| `SYM_MODULE_DETAIL_COMPONENT` | `Component` | `@ModuleDetailComponent` | Custom detail view component (overrides default) |
| `SYM_MODULE_DEFAULT_COMPONENT` | `Component` | `@ModuleDefaultComponent` | Custom default view component |
| `SYM_MODULE_CUSTOM_COMPONENTS` | `Record<string, Component>` | `@ModuleCustomComponents` | Named additional component overrides |

**Property-level metadata** (array of entries per property key):

| Symbol Key (conceptual) | Entry type | Set by | Description |
|---|---|---|---|
| `SYM_PROPERTY_NAME` | `{ name: string, type: PropertyType }` | `@PropertyName` | Display label + data type |
| `SYM_PROPERTY_INDEX` | `number` | `@PropertyIndex` | Sort order for rendering |
| `SYM_REQUIRED` | `{ required: boolean, message: string }` | `@Required` | Field required rule |
| `SYM_VALIDATION` | `Array<{ fn: (e) => boolean, message: string }>` | `@Validation` | Sync validators |
| `SYM_ASYNC_VALIDATION` | `Array<{ fn: async (e) => boolean, message: string }>` | `@AsyncValidation` | Async validators |
| `SYM_CSS_COLUMN_CLASS` | `string` | `@CSSColumnClass` | CSS class for table column width |
| `SYM_DISPLAY_FORMAT` | `(value: unknown) => string` | `@DisplayFormat` | Formatter for list/detail display |
| `SYM_HELP_TEXT` | `string` | `@HelpText` | Helper hint below input |
| `SYM_MASK` | `string` | `@Mask` | Input mask pattern |
| `SYM_STRING_TYPE` | `'email' \| 'password' \| 'url' \| 'tel'` | `@StringTypeDef` | HTML input subtype |
| `SYM_DISABLED` | `boolean \| ((e) => boolean)` | `@Disabled` | Static or dynamic disabled state |
| `SYM_READONLY` | `boolean` | `@ReadOnly` | Read-only input rendering |
| `SYM_HIDE_IN_LIST` | `boolean` | `@HideInListView` | Exclude from list/table columns |
| `SYM_HIDE_IN_DETAIL` | `boolean` | `@HideInDetailView` | Exclude from detail/form view |
| `SYM_TAB_ORDER` | `number` | `@TabOrder` | Accessibility tab ordering |
| `SYM_VIEW_GROUP` | `string` | `@ViewGroup` | Group/section name in detail view |
| `SYM_VIEW_GROUP_ROW` | `number` | `@ViewGroupRow` | Row within view group |
| `SYM_PERSISTENT_PROP` | `boolean` | `@Persistent` (property) | Include in `toStorage()` serialization |
| `SYM_PERSISTENT_KEY` | `string` | `@PersistentKey` | LocalStorage key for property |
| `SYM_UNIQUE` | `boolean` | `@Unique` | Uniqueness validation rule |

**Validation rules for metadata**:
- A property without `@PropertyName` is invisible to the UI (not rendered)
- A class without `@Persistent()` cannot `save()`, `load()`, or `delete()`
- A class without `@ApiEndpoint` cannot perform CRUD operations
- `@PrimaryProperty` and `@DefaultProperty` are required for full URL-based navigation
- Multiple `@Validation(fn, msg)` decorators on one property stack (all run)

---

### 1.3 Application Singleton State

```typescript
interface ApplicationState {
  // View State
  View: Ref<{
    entityClass: typeof BaseEntity | null  // currently active module class
    entityObject: BaseEntity | null        // currently active entity instance
    component: Component | null            // active view component
    viewType: ViewType                     // LISTVIEW | DETAILVIEW | DEFAULTVIEW
    isValid: boolean                       // true when all validation passes
    isDirty: boolean                       // delegates to entityObject._isDirty
  }>

  // Module Registry
  ModuleList: Ref<Array<typeof BaseEntity>>  // all registered entity classes

  // Navigation
  router: Router                             // Vue Router instance

  // HTTP
  axiosInstance: AxiosInstance              // configured with interceptors

  // UI Services
  modal: Ref<ModalState>
  dropdownMenu: Ref<DropdownMenuState>
  confirmationMenu: Ref<ConfirmationMenuState>
  ToastList: Ref<Toast[]>

  // Configuration
  AppConfiguration: AppConfig
}
```

**ViewType enum**:

| Value | Description |
|---|---|
| `LISTVIEW` | Table showing list of entity records |
| `DETAILVIEW` | Form for creating/editing a single entity |
| `DEFAULTVIEW` | Module landing page (default component) |

**State transition — View**:

```
DEFAULTVIEW (module selected)
    ↓ navigate to list
LISTVIEW (route: /:module)
    ↓ click "New" or click row
DETAILVIEW (route: /:module/new or /:module/:id)
    ↓ save success / cancel
LISTVIEW
```

---

### 1.4 Toast Model

```typescript
interface Toast {
  id: string           // UUID, for list keying
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number     // ms; 0 = persistent
  timestamp: Date
}
```

**Validation rules**: `duration > 0` triggers auto-dismiss; `duration === 0` requires manual close.

---

### 1.5 Modal State Model

```typescript
interface ModalState {
  visible: boolean
  title: string
  component: Component | null   // dynamic component rendered inside modal
  props: Record<string, unknown> // passed to dynamic component
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
}
```

---

### 1.6 ConfirmationMenu State Model

```typescript
interface ConfirmationMenuState {
  visible: boolean
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}
```

---

## 2. Relationships

```
typeof BaseEntity (class)
    ├── extends → BaseEntity (abstract)
    ├── decorated by → N Decorators (class level)
    ├── properties decorated by → M Decorators each
    └── registered in → Application.ModuleList

Application (singleton)
    ├── holds → Ref<View> (current viewType + entity)
    ├── holds → ModuleList (all registered typeof BaseEntity)
    ├── owns → axiosInstance (shared HTTP client)
    ├── owns → router (Vue Router)
    ├── owns → EventBus (mitt instance)
    └── owns → UI Services (modal, toast, dropdown, confirmation)

BaseEntity (instance)
    ├── inherits metadata from → prototype (via Symbol keys)
    ├── uses → axiosInstance via Application
    ├── emits events via → Application.EventBus
    └── triggers UI updates via → Application.View

Vue Component (UI Layer)
    ├── reads metadata via → useInputMetadata composable
    ├── binds entity instance via → Application.View.entityObject
    └── triggers CRUD via → entityObject.save() / delete()
```

---

## 3. Validation Rules Summary

| Rule | Scope | Enforced by |
|---|---|---|
| Entity must have `@Persistent()` for CRUD | Class | `BaseEntity.save()` runtime guard |
| Entity must have `@ApiEndpoint` for API calls | Class | `BaseEntity.save()` / `getElement()` runtime guard |
| Property must have `@PropertyName` to appear in UI | Property | `useInputMetadata` filter |
| `@Required(true)` properties must be non-null/empty | Property | `validateInputs()` |
| `@Validation(fn)` fn must return `true` for valid | Property | `validateInputs()` |
| `@AsyncValidation(fn)` runs only after sync passes | Property | `validateInputs()` short-circuit |
| `@Unique` triggers API availability check | Property | `validateInputs()` async stage |
| `ViewType` transitions follow state machine above | Application | `router` navigation guards |
