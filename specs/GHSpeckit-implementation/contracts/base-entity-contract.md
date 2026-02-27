# Contract: BaseEntity Public API

**Version**: 1.0.0
**Branch**: `001-framework-saas-spec`
**Date**: 2026-02-26
**Authority**: MI LÓGICA AXIOM A1 + A2

This document is the authoritative public contract for `BaseEntity`. All implementing classes and all AI-generated code MUST conform to this interface. Any modification to this contract requires explicit Architect authorization and registration in `BREAKING-CHANGES.md`.

---

## Instance Methods (Public)

### CRUD Operations

```typescript
/** Save entity: POST if _isNew, PUT if not. Triggers beforeSave/afterSave hooks. */
save(): Promise<void>

/** Explicit update (always PUT). Identical post-condition to save() on existing record. */
update(): Promise<void>

/** Delete entity from backend. Triggers beforeDelete/afterDelete hooks. */
delete(): Promise<void>

/** Reload entity data from backend (GET by primary key). */
refresh(): Promise<void>
```

**Preconditions for CRUD**:
- Class MUST have `@Persistent()` decorator
- Class MUST have `@ApiEndpoint(url)` decorator
- Class MUST have `@ApiMethods([...])` permitting the HTTP verb being invoked

**Post-conditions**:
- `save()` POST: `_isNew = false`, `_originalState` refreshed
- `save()` PUT: `_isDirty = false`, `_originalState` refreshed
- `delete()`: instance invalidated, navigate to list view

---

### Validation

```typescript
/** Run all validators (sync first, then async). Populates _errors. Returns true if valid. */
validateInputs(): Promise<boolean>

/** Run validators for a single property key. Returns true if that property is valid. */
validateProperty(propertyKey: string): Promise<boolean>
```

**Short-circuit rule**: If any `@Required` or `@Validation` fails on a property, `@AsyncValidation` for that property does NOT run.

---

### Metadata Access

```typescript
/** Get class-level metadata value for a given Symbol key. */
getMetadata(symbol: symbol): unknown

/** Get property-level metadata for a given property key and Symbol. */
getPropertyMetadata(propertyKey: string, symbol: symbol): unknown

/** Get all property keys that have @PropertyName metadata (visible in UI). */
getVisibleProperties(): string[]
```

---

### Persistence / Serialization

```typescript
/** Serialize @Persistent-marked properties to a plain object for LocalStorage. */
toStorage(): Record<string, unknown>

/** Restore instance from a plain object (reverses toStorage). */
fromStorage(data: Record<string, unknown>): void

/** Serialize instance to plain JSON-compatible object. */
toJSON(): Record<string, unknown>

/** Restore instance from plain JSON object. */
fromJSON(data: Record<string, unknown>): void
```

---

### State

```typescript
/** Create a deep clone of the current instance. */
clone(): this

/** Check if current state differs from _originalState (deep equality). */
isDirty(): boolean
```

---

### Lifecycle Hooks (override in subclass)

```typescript
/** Called before save(). Throw to abort save. */
beforeSave(): Promise<void> | void

/** Called after successful save(). */
afterSave(): Promise<void> | void

/** Called before load/refresh. */
beforeLoad(): Promise<void> | void

/** Called after successful load/refresh. */
afterLoad(): Promise<void> | void

/** Called before delete(). Throw to abort delete. */
beforeDelete(): Promise<void> | void

/** Called after successful delete(). */
afterDelete(): Promise<void> | void
```

---

## Static Methods (Public)

```typescript
/** Fetch single entity by primary key. Returns hydrated instance. */
static getElement<T extends BaseEntity>(id: string | number): Promise<T>

/** Fetch list of all entities. Returns array of hydrated instances. */
static getElementList<T extends BaseEntity>(): Promise<T[]>
```

---

## Constructor Contract

```typescript
constructor(data?: Partial<ConcreteEntity>)
```

- Accepting `Partial<T>` allows inline initialization: `new Product({ name: 'Widget' })`
- `_isNew = true` after construction
- `_originalState` captures initial state at construction
- Does NOT trigger `beforeLoad`/`afterLoad` hooks (only `refresh()` does)

---

## Prohibited Usage

- MUST NOT call `Application.axiosInstance` directly from entity classes (use BaseEntity CRUD methods)
- MUST NOT import UI components in entity classes (violates AXIOM A1)
- MUST NOT mutate `Application.View` from entity classes (Application is Layer 3; entity is Layer 1)
- MUST NOT store metadata in instance variables (metadata belongs on prototype via Symbols)
