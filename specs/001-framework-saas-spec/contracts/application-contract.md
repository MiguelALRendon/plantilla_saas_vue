# Contract: Application Singleton API

**Version**: 1.0.0
**Branch**: `001-framework-saas-spec`
**Date**: 2026-02-26
**Authority**: MI LÓGICA AXIOM A1 (Layer 3 orchestrator)

`Application` is the singleton orchestrator (Layer 3). It is the ONLY layer permitted to hold global state. UI components and BaseEntity instances MUST NOT replicate its responsibilities.

---

## Singleton Access

```typescript
import Application from '@/models/application'
// Application is a singleton instance — never instantiated with `new`
```

---

## View State API

```typescript
// Current active view (reactive)
Application.View: Ref<{
  entityClass: typeof BaseEntity | null
  entityObject: BaseEntity | null
  component: Component | null
  viewType: ViewType
  isValid: boolean
  isDirty: boolean       // mirrors entityObject._isDirty
}>

// Navigate to a module's list view
Application.navigateToList(entityClass: typeof BaseEntity): void

// Navigate to a module's detail view for a specific entity
Application.navigateToDetail(entityObject: BaseEntity): void

// Navigate to the new-entity detail form
Application.navigateToNew(entityClass: typeof BaseEntity): void
```

---

## Module Registry API

```typescript
// Reactive list of all registered entity classes
Application.ModuleList: Ref<Array<typeof BaseEntity>>

// Get module metadata by module name
Application.getModuleByName(name: string): typeof BaseEntity | undefined
```

**Usage**: Push entity classes at boot time:
```typescript
Application.ModuleList.value.push(Product, Customer, Order)
```

---

## HTTP Client API

```typescript
// Configured Axios instance — shared across all CRUD operations
Application.axiosInstance: AxiosInstance
// Interceptors: auth token injection, error toast on 4xx/5xx, loading state management
```

**Prohibited**: Do NOT replace `axiosInstance` or add competing HTTP clients.

---

## EventBus API

```typescript
// Emit a global event
Application.emit(event: string, payload?: unknown): void

// Listen to a global event
Application.on(event: string, handler: (payload: unknown) => void): void

// Remove listener
Application.off(event: string, handler: (payload: unknown) => void): void
```

**Standard events**:

| Event | Payload | Emitted by |
|---|---|---|
| `entity:saved` | `{ entity: BaseEntity }` | `BaseEntity.save()` |
| `entity:deleted` | `{ entityClass: typeof BaseEntity, id: unknown }` | `BaseEntity.delete()` |
| `entity:loaded` | `{ entity: BaseEntity }` | `BaseEntity.refresh()` |
| `validation:failed` | `{ errors: Record<string, string[]> }` | `validateInputs()` |
| `view:changed` | `{ viewType: ViewType }` | `Application.navigateTo*` |

---

## UI Services API

### Toast Service

```typescript
Application.showToast(options: {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number   // ms; default 3000; 0 = persistent
}): void

Application.dismissToast(id: string): void

Application.ToastList: Ref<Toast[]>  // reactive list for ToastComponents to render
```

### Dialog / Modal Service

```typescript
Application.showModal(options: {
  title: string
  component: Component
  props?: Record<string, unknown>
  onConfirm?: () => void
  onCancel?: () => void
}): void

Application.closeModal(): void

Application.modal: Ref<ModalState>  // reactive for ModalComponent to render
```

### Confirmation Service

```typescript
Application.showConfirmation(options: {
  message: string
  confirmLabel?: string   // default: 'Confirm'
  cancelLabel?: string    // default: 'Cancel'
  onConfirm: () => void
  onCancel?: () => void
}): void

Application.confirmationMenu: Ref<ConfirmationMenuState>
```

### Loading Service

```typescript
Application.setLoading(loading: boolean): void
Application.isLoading: Ref<boolean>
```

---

## App Configuration API

```typescript
Application.AppConfiguration: {
  apiBaseUrl: string         // base URL prefixed to all @ApiEndpoint values
  authTokenKey: string       // LocalStorage key for auth token
  defaultPageSize: number    // default list view page size
  // Extend at project level — do not modify framework defaults
}
```

---

## Router Integration

```typescript
Application.router: Router  // Vue Router instance

// Automatic route generation based on ModuleList at app boot:
// /:moduleName        → default list view
// /:moduleName/new    → new entity detail view
// /:moduleName/:id    → existing entity detail view
```

---

## Contracts / Obligations

- Application MUST be initialized before `createApp()` completes mounting
- `ModuleList` MUST be populated before sidebar renders (sidebar reads it reactively)
- `axiosInstance` interceptors MUST remain active for all CRUD operations
- UI components MUST NOT import `axiosInstance` directly — use `BaseEntity` methods
- Application MUST NOT import any `src/components/` files (no circular Layer 3 → Layer 4 dependency)
