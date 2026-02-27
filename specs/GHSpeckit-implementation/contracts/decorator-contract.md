# Contract: Decorator Catalog

**Version**: 1.0.0
**Branch**: `001-framework-saas-spec`
**Date**: 2026-02-26
**Authority**: MI LÓGICA AXIOM A3 + A4

All 31 decorators defined here constitute the complete public metadata API of the framework. Their signatures are frozen contracts. Any signature change requires Architect authorization and registration in `BREAKING-CHANGES.md`.

---

## Class Decorators (applied to entity class declaration)

```typescript
/** Module display name shown in sidebar and router. */
@ModuleName(name: string): ClassDecorator

/** REST base URL for CRUD operations. e.g. '/api/products' */
@ApiEndpoint(url: string): ClassDecorator

/** Allowed HTTP methods for the module. */
@ApiMethods(methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>): ClassDecorator

/** Enables CRUD persistence for the entity. Required for save/load/delete. */
@Persistent(): ClassDecorator

/** Property key whose value is the display label in list views. */
@DefaultProperty(propertyKey: string): ClassDecorator

/** Property key used as primary key (for PUT URLs and identity). */
@PrimaryProperty(propertyKey: string): ClassDecorator

/** Property key used as unique identifier for URL segments. */
@UniquePropertyKey(propertyKey: string): ClassDecorator

/** Icon identifier string for sidebar/topbar. Matches icons catalog. */
@ModuleIcon(iconKey: string): ClassDecorator

/** Required permission(s) to access this module. */
@ModulePermission(permission: string | string[]): ClassDecorator

/** Override default list view with custom component. */
@ModuleListComponent(component: Component): ClassDecorator

/** Override default detail view with custom component. */
@ModuleDetailComponent(component: Component): ClassDecorator

/** Override default module landing page component. */
@ModuleDefaultComponent(component: Component): ClassDecorator

/** Register named custom components for this module. */
@ModuleCustomComponents(components: Record<string, Component>): ClassDecorator
```

---

## Property Decorators (applied to entity class properties)

### Identity & Rendering

```typescript
/** Mark property as visible in UI; set its display label and data type.
 *  Required for ANY property to appear in list or detail views. */
@PropertyName(label: string, type: PropertyType): PropertyDecorator

/** Set sort index for rendering order in list columns and form fields (lower = first). */
@PropertyIndex(index: number): PropertyDecorator

/** Set CSS class for this property's column in list/table view. */
@CSSColumnClass(cssClass: string): PropertyDecorator

/** Set display formatter: transforms raw value to display string. */
@DisplayFormat(formatter: (value: unknown, entity: BaseEntity) => string): PropertyDecorator

/** Set helper text shown below input in detail view. */
@HelpText(text: string): PropertyDecorator

/** Set input mask pattern (e.g. '##/##/####' for date). */
@Mask(pattern: string): PropertyDecorator

/** Set HTML input subtype for string properties. */
@StringTypeDef(subtype: 'email' | 'password' | 'url' | 'tel'): PropertyDecorator

/** Set tab order for keyboard navigation. */
@TabOrder(order: number): PropertyDecorator
```

### Visibility

```typescript
/** Hide property from list/table view (still visible in detail form). */
@HideInListView(): PropertyDecorator

/** Hide property from detail/form view (still visible in list view). */
@HideInDetailView(): PropertyDecorator
```

### Layout (Detail View)

```typescript
/** Assign property to a named section/group in the detail view form. */
@ViewGroup(groupName: string): PropertyDecorator

/** Set row position within the ViewGroup section. */
@ViewGroupRow(row: number): PropertyDecorator
```

### State

```typescript
/** Disable input. Accepts static boolean or dynamic function. */
@Disabled(value: boolean | ((entity: BaseEntity) => boolean)): PropertyDecorator

/** Make input read-only (displayed but not editable). */
@ReadOnly(): PropertyDecorator
```

### Persistence (property level)

```typescript
/** Include this property in toStorage() serialization. */
@Persistent(): PropertyDecorator

/** Set LocalStorage key for this property. */
@PersistentKey(key: string): PropertyDecorator
```

### Validation

```typescript
/** Mark property as required. Blocks save if empty/null. */
@Required(required: boolean, message?: string): PropertyDecorator

/** Add synchronous validation rule. Multiple decorators stack. */
@Validation(
  fn: (entity: BaseEntity) => boolean,
  message: string
): PropertyDecorator

/** Add asynchronous validation rule (e.g., API uniqueness check). 
 *  Runs only after all sync validations pass. */
@AsyncValidation(
  fn: (entity: BaseEntity) => Promise<boolean>,
  message: string
): PropertyDecorator

/** Assert property value is unique across backend records. 
 *  Implemented as @AsyncValidation calling GET endpoint. */
@Unique(message?: string): PropertyDecorator
```

---

## PropertyType Values

```typescript
type PropertyType =
  | typeof Number    // numeric input
  | typeof String    // text input
  | typeof Boolean   // checkbox/switch
  | typeof Date      // date picker
  | typeof Array     // array input (repeated items)
  | typeof Object    // nested object form
  | typeof BaseEntity // lookup / relation input
```

---

## Stacking Rules

| Decorator | Max per property | Stackable |
|---|---|---|
| `@PropertyName` | 1 | No |
| `@PropertyIndex` | 1 | No |
| `@Required` | 1 | No |
| `@Validation` | unlimited | Yes — all run in order |
| `@AsyncValidation` | unlimited | Yes — all run in order |
| `@DisplayFormat` | 1 | No |
| `@ViewGroup` | 1 | No |
| `@ViewGroupRow` | 1 | No |
| All others | 1 | No |

---

## Usage Example (Minimal Functional Entity)

```typescript
@ModuleName('Product')
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleIcon('box')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    @PropertyIndex(0)
    @HideInListView()    // managed by backend
    id!: number;

    @PropertyName('Name', String)
    @PropertyIndex(1)
    @Required(true, 'Product name is required')
    @CSSColumnClass('col-6')
    @HelpText('Enter the product display name')
    name!: string;

    @PropertyName('Price', Number)
    @PropertyIndex(2)
    @Required(true, 'Price is required')
    @Validation(p => p.price >= 0, 'Price must be non-negative')
    @CSSColumnClass('col-3')
    price!: number;
}
```
