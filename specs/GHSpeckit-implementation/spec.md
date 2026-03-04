# Feature Specification: Framework SaaS Vue — Especificación Técnica Completa

**Feature Branch**: `001-framework-saas-spec`
**Created**: 2026-02-26
**Status**: Draft

---

## Table of Contents

1. [User Scenarios & Testing](#1-user-scenarios--testing)
2. [Requirements — Layer 2: Decoradores](#2-requirements--layer-2-decoradores-31-decoradores)
3. [Requirements — Layer 3: BaseEntity](#3-requirements--layer-3-baseentity)
4. [Requirements — Layer 4: Application Singleton](#4-requirements--layer-4-application-singleton)
5. [Requirements — Layer 5: UI Components](#5-requirements--layer-5-ui-components)
6. [Requirements — Layer 1+5: Advanced (Entities, Enums, Models, Router, Types)](#6-requirements--layer-15-advanced)
7. [Requirements — Layer 5: Composables](#7-requirements--layer-5-composables)
8. [Architecture Flows](#8-architecture-flows)
9. [UI Design System Contract](#9-ui-design-system-contract)
10. [Code Styling Standards](#10-code-styling-standards)
11. [Key Entities & Data Models](#11-key-entities--data-models)
12. [Success Criteria](#12-success-criteria)

> **Nota sobre numeración de capas**: Los números de sección en este spec (§2–§7) son índices de sección de documento, no números de capa arquitectónica. La arquitectura de 5 capas canónica está definida en [`/copilot/00-CONTRACT.md`](/copilot/00-CONTRACT.md) (AXIOMA A1):
> | Capa Arquitectónica | Nombre | Sección del Spec |
> |---|---|---|
> | Capa 1 | Entidades (Declaración) | §6 Advanced |
> | Capa 2 | Decoradores (Metadatos) | §2 |
> | Capa 3 | BaseEntity (Lógica CRUD) | §3 |
> | Capa 4 | Application (Orquestador) | §4 |
> | Capa 5 | UI Components (Generados) | §5, §7 |

---

## 1. User Scenarios & Testing

### UC-001 — Developer Creates a New CRUD Module in 15 Minutes

**Actor**: Backend developer unfamiliar with the framework.

**Precondition**: Framework scaffolding exists. `src/entities/` exists. `src/models/application.ts` contains the module registration block.

**Acceptance Scenario**:

```gherkin
Given a developer creates a new file src/entities/customer.ts
And the developer applies at minimum:
    @ModuleName('Customer')
    @ModuleIcon('user')
    @ApiEndpoint('/api/customers')
    @ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
    @Persistent()
    @DefaultProperty('name')
    @PrimaryProperty('id')
    @UniquePropertyKey('id')
  to the class declaration
And applies @PropertyName + @PropertyIndex + @CSSColumnClass + @Required + @HelpText to at least one property
And registers the class: Application.registerModule(Customer)
When the developer runs npm run dev
Then the sidebar shows a "Customer" entry with the user icon
And clicking the sidebar item navigates to /customer
And a table renders with the correct column headers
And clicking "New" navigates to /customer/new
And the form renders with a labeled input for each @PropertyName property
And clicking "Save" sends a POST to /api/customers
And clicking an existing row navigates to /customer/:id
And clicking "Save" there sends a PUT to /api/customers/:id
```

**Edge Cases**:
- If @Persistent() is missing, save() throws an error and shows a config dialog.
- If @ApiEndpoint is missing, CRUD operations fail with a descriptive console error.
- If @PropertyName is not applied, the property does not appear in any list or form.

---

### UC-002 — User Fills a Form with Validation Errors and Corrects Them

**Actor**: End user interacting with a DetailView form.

**Precondition**: An entity exists with @Required, @Validation, and @AsyncValidation decorators on various properties.

**Acceptance Scenario**:

```gherkin
Given the user navigates to a DetailView for a new entity
And the entity has:
    @Required(true, 'Name is required') on property name
    @Validation(e => e.age >= 18, 'Must be adult') on property age
    @AsyncValidation(async e => email check, 'Email already taken') on property email
When the user clicks "Validate" with all fields empty
Then each input displays its validation error message below the field
And the "Save" button remains disabled (Application.View.value.isValid = false)
When the user fills in all fields correctly
And clicks "Validate" again
Then all validation messages disappear
And Application.View.value.isValid = true
When the user clicks "Save"
Then beforeSave() hook executes first
Then a POST (or PUT) request is sent to the API
Then afterSave() hook executes on success
Then a success toast notification appears
```

**Edge Cases**:
- Async validation only runs after Required and Sync validations pass (short-circuit).
- If the user navigates away while form is dirty, a confirmation dialog appears.
- If API returns 4xx, the error toast shows error.response.data.message.

---

### UC-003 — Developer Customizes List View and Detail View with Custom Components

**Actor**: Senior developer wanting a custom product list table.

**Precondition**: Framework is running. Product entity is registered.

**Acceptance Scenario**:

```gherkin
Given the developer applies @ModuleListComponent(CustomProductList) to the Product class
And @ModuleDetailComponent(CustomProductDetail) to the Product class
When the user clicks "Products" in the sidebar
Then CustomProductList renders instead of DefaultListView
When the user clicks a row
Then CustomProductDetail renders instead of DefaultDetailView
Given the developer also applies @ModuleCustomComponents({ 'price-cell': PriceCellComponent })
When CustomProductDetail references <price-cell> in its template
Then PriceCellComponent is resolved automatically
```

**Edge Cases**:
- Fallback to DefaultListView if getModuleListComponent() returns undefined.
- @ModuleCustomComponents resolves components by string key; unregistered keys render nothing.

---

## 2. Requirements — Layer 1: Decoradores (31 Decoradores)

### 2.1 Decoradores de Clase

Class decorators store metadata directly on `target` (the class constructor). They must be placed immediately above the class declaration.

---

#### FR-001 — @ApiEndpoint(url: string)

**File**: `src/decorations/api_endpoint_decorator.ts`

**Type**: ClassDecorator

**Signature**:
```typescript
export function ApiEndpoint(url: string): ClassDecorator
```

**Symbol Key**: `API_ENDPOINT_KEY` (Symbol)

**Metadata stored**: `target[API_ENDPOINT_KEY] = url`

**BaseEntity accessor**: `static getApiEndpoint(): string | undefined`

**Behavior**: Stores the base REST endpoint URL. Used by save(), update(), delete(), getElement(), and getElementList().

**Rules**:
- URL must NOT end with '/'.
- save() builds `POST ${url}` and `PUT ${url}/${pkValue}`.
- delete() and update() build `${url}/${uniquePropertyValue}`.
- getElementList() sends `GET ${url}`.
- getElement(oid) sends `GET ${url}/${oid}`.

**Example**:
```typescript
@ApiEndpoint('/api/customers')
export class Customer extends BaseEntity {}
```

---

#### FR-002 — @ApiMethods(methods: HttpMethod[])

**File**: `src/decorations/api_methods_decorator.ts`

**Type**: ClassDecorator

**Signature**:
```typescript
export function ApiMethods(methods: HttpMethod[]): ClassDecorator
// HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
```

**Symbol Key**: `API_METHODS_KEY` (Symbol)

**BaseEntity accessor**: `static getApiMethods(): HttpMethod[] | undefined`

**Behavior**: Whitelists the HTTP methods allowed. If undefined (decorator not applied), all methods are implicitly allowed.

**Rules**:
- validateApiMethod(method) returns false if method is not in the array.
- Always include 'GET' unless data is write-only.

**Example**:
```typescript
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
export class Product extends BaseEntity {}
```

---

#### FR-003 — @DefaultProperty(propertyName: string)

**File**: `src/decorations/default_property_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `DEFAULT_PROPERTY_KEY` (Symbol)

**BaseEntity accessor**: `getDefaultPropertyValue(): any`

**Behavior**: Marks one property as the "display representative" of the entity. Used in lookup dropdowns.

**Rules**:
- Exactly one property per class should carry this decorator.
- If missing, validateModuleConfiguration() returns false.

**Example**:
```typescript
@DefaultProperty('name')
export class Customer extends BaseEntity {
    name!: string;
}
// customer.getDefaultPropertyValue() returns 'Acme Corp'
```

---

#### FR-004 — @ModuleCustomComponents(Record<string, Component>)

**File**: `src/decorations/module_custom_components_decorator.ts`

**Type**: ClassDecorator

**Signature**:
```typescript
export function ModuleCustomComponents(
    components: Record<string, Component>
): ClassDecorator
```

**Symbol Key**: `MODULE_CUSTOM_COMPONENTS_KEY` (Symbol)

**Metadata stored**: A Map<string, Component> built from the passed record.

**BaseEntity accessor**: `getModuleCustomComponents(): Map<string, Component> | undefined`

---

#### FR-005 — @ModuleDefaultComponent(component: Component)

**File**: `src/decorations/module_default_component_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `MODULE_DEFAULT_COMPONENT_KEY`

**BaseEntity accessor**: `static getModuleDefaultComponent(): Component`

**Behavior**: Sets the component rendered when navigating from the sidebar. Falls back to DefaultListView if not provided.

---

#### FR-006 — @ModuleDetailComponent(component: Component)

**File**: `src/decorations/module_detail_component_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `MODULE_DETAIL_COMPONENT_KEY`

**BaseEntity accessor**: `static getModuleDetailComponent(): Component`

**Behavior**: Overrides the default detail/form view. Falls back to DefaultDetailView if not provided.

---

#### FR-007 — @ModuleIcon(icon: string)

**File**: `src/decorations/module_icon_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `MODULE_ICON_KEY` (stored on prototype)

**Default**: `'circle'`

**BaseEntity accessor**: `static getModuleIcon(): string`

**Behavior**: Provides the icon identifier used in the sidebar and TopBar. Icon strings must correspond to valid keys in `src/constants/icons.ts`.

---

#### FR-008 — @ModuleListComponent(component: Component)

**File**: `src/decorations/module_list_component_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `MODULE_LIST_COMPONENT_KEY`

**BaseEntity accessor**: `static getModuleListComponent(): Component`

**Behavior**: Overrides the list/table view. Falls back to DefaultListView if not provided.

---

#### FR-009 — @ModuleName(name: string)

**File**: `src/decorations/module_name_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `MODULE_NAME_KEY`

**BaseEntity accessor**: `static getModuleName(): string | undefined`

**Behavior**: Sets the human-readable module name. **Mandatory** for all registered modules. Router uses `moduleName.toLowerCase()` as the URL path segment.

**Rules**:
- Missing @ModuleName causes validateModuleConfiguration() to return false.

---

#### FR-010 — @ModulePermission(permission: string)

**File**: `src/decorations/module_permission_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `MODULE_PERMISSION_KEY`

**BaseEntity accessor**: `static getModulePermission(): string | undefined`, `static hasPermission(user): boolean`

**Behavior**: Marks the module as permission-guarded. If not applied, the module is public.

---

#### FR-011 — @Persistent()

**File**: `src/decorations/persistent_decorator.ts`

**Type**: ClassDecorator (no parameters)

**Symbol Key**: `PERSISTENT_KEY`

**Metadata stored**: `target[PERSISTENT_KEY] = true`

**Behavior**: Marks entity as capable of HTTP CRUD operations. If not applied, save(), update(), and delete() throw errors.

---

#### FR-012 — @PrimaryProperty(propertyName: string)

**File**: `src/decorations/primary_property_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `PRIMARY_PROPERTY_KEY`

**Default**: `'id'`

**BaseEntity accessors**: `getPrimaryProperty()`, `getPrimaryPropertyValue()`, `getPrimaryPropertyKey()`

**Behavior**: Identifies the property used as the entity's unique identifier. isNew() checks getPrimaryPropertyValue() === undefined or null. save() uses this to decide POST vs. PUT.

---

#### FR-013 — @UniquePropertyKey(propertyName: string)

**File**: `src/decorations/unique_decorator.ts`

**Type**: ClassDecorator

**Symbol Key**: `UNIQUE_KEY`

**BaseEntity accessor**: `getUniquePropertyKey(): string | undefined`, `getUniquePropertyValue(): any`

**Behavior**: Defines the property used as the OID in URL construction for update() and delete() calls. Required for validatePersistenceConfiguration() to pass.

---

### 2.2 Decoradores de Propiedad

Property decorators store metadata on `target.constructor.prototype[SYMBOL_KEY]` as `Record<propertyKey, value>`.

---

#### FR-014 — @AsyncValidation(condition, message?)

**File**: `src/decorations/async_validation_decorator.ts`

**Type**: PropertyDecorator

**Signature**:
```typescript
export function AsyncValidation(
    condition: (entity: BaseEntity) => Promise<boolean>,
    message?: string
): PropertyDecorator
```

**Symbol Key**: `ASYNC_VALIDATION_KEY`

**BaseEntity accessor**: `async isAsyncValidation(key: string): Promise<boolean>`

**Behavior**: Level-3 validation. Runs only after Level-1 (Required) and Level-2 (Sync) validations pass.

**Example**:
```typescript
@AsyncValidation(
    async (entity) => {
        const result = await axios.get(`/api/check-email?email=${entity.email}`);
        return !result.data.exists;
    },
    'Email already registered'
)
email!: string;
```

---

#### FR-015 — @CSSColumnClass(cssClass: string)

**File**: `src/decorations/css_column_class_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `CSS_COLUMN_CLASS_KEY`

**Default**: `'col-md-12'`

**BaseEntity accessor**: `getCssColumnClass(key: string): string`

**Behavior**: Associates a Bootstrap/CSS grid column class. getCSSClasses() returns `Record<string, string>` used in form rendering.

---

#### FR-016 — @Disabled(condition?)

**File**: `src/decorations/disabled_decorator.ts`

**Type**: PropertyDecorator

**Signature**:
```typescript
export function Disabled(
    condition?: boolean | ((entity: BaseEntity) => boolean)
): PropertyDecorator
```

**Symbol Key**: `DISABLED_KEY`

**BaseEntity accessor**: `isDisabled(key: string): boolean`

**CRITICAL behavior**: Properties marked @Disabled are **EXCLUDED from toDictionary()** and NOT sent in HTTP requests.

**Distinction from @ReadOnly**:
- @Disabled: excluded from HTTP payload (display-only computed fields).
- @ReadOnly: included in HTTP payload (readonly to user but must reach API).

---

#### FR-017 — @DisplayFormat(format)

**File**: `src/decorations/display_format_decorator.ts`

**Type**: PropertyDecorator

**Signature**:
```typescript
export function DisplayFormat(
    format: string | ((value: any) => string)
): PropertyDecorator
```

**Symbol Key**: `DISPLAY_FORMAT_KEY`

**BaseEntity accessors**: `getDisplayFormat(key)`, `getFormattedValue(key): string`

**Example**:
```typescript
@DisplayFormat((value) => `$${value.toFixed(2)} USD`)
price!: number;
// getFormattedValue('price') returns '$99.99 USD'
```

---

#### FR-018 — @HelpText(text: string)

**File**: `src/decorations/help_text_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `HELP_TEXT_KEY`

**BaseEntity accessor**: `getHelpText(key: string): string | undefined`

**Behavior**: Static help message rendered below input fields. Only static strings are supported.

---

#### FR-019 — @HideInDetailView()

**File**: `src/decorations/hide_in_detail_view_decorator.ts`

**Type**: PropertyDecorator (no parameters)

**Symbol Key**: `HIDE_IN_DETAIL_VIEW_KEY` (stored as an array of property keys)

**BaseEntity accessor**: `isHideInDetailView(key: string): boolean`

**Behavior**: Prevents property from rendering in DetailView. Property remains in toDictionary() and is sent to the API.

---

#### FR-020 — @HideInListView()

**File**: `src/decorations/hide_in_list_view_decorator.ts`

**Type**: PropertyDecorator (no parameters)

**Symbol Key**: `HIDE_IN_LIST_VIEW_KEY` (stored as an array of property keys)

**BaseEntity accessor**: `isHideInListView(key: string): boolean`

**Behavior**: Prevents property from appearing as a column in ListView tables.

---

#### FR-021 — @Mask(mask: string, side: MaskSide)

**File**: `src/decorations/mask_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `MASK_KEY`

**Metadata stored**: `{ mask: string, side: MaskSide }` per property key

**BaseEntity accessor**: `getMask(key: string): { mask: string, side: MaskSide } | undefined`

> ~~**Note**: @Mask is defined but NOT currently exported from `src/decorations/index.ts`. Cannot be used until exported.~~ **Resolved T175**: `@Mask` and `MaskSides` are fully exported from `src/decorations/index.ts`. `getMask()` instance method added to `BaseEntity`.

---

#### FR-022 — @PersistentKey(backendKey: string)

**File**: `src/decorations/persistent_key_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `PERSISTENT_KEY_KEY`

**BaseEntity accessor**: `getPersistentKey()`, `getPersistentKeyValue()`

**Behavior**: Maps TypeScript camelCase property name to API snake_case key name.

**Example**:
```typescript
@PersistentKey('first_name')
firstName!: string;
// Sent to API as: { "first_name": "John" }
```

---

#### FR-023 — @PropertyIndex(index: number)

**File**: `src/decorations/property_index_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `PROPERTY_INDEX_KEY`

**Default**: `Number.MAX_SAFE_INTEGER`

**BaseEntity accessor**: `getPropertyIndices(): Record<string, number>`

**Behavior**: Controls render order. getKeys() returns properties sorted ascending by @PropertyIndex values.

---

#### FR-024 — @PropertyName(name: string, type: PropertyType)

**File**: `src/decorations/property_name_decorator.ts`

**Type**: PropertyDecorator

**Signature**:
```typescript
export function PropertyName(
    name: string,
    type: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor | ArrayConstructor | typeof BaseEntity
): PropertyDecorator
```

**Symbol Keys**: `PROPERTY_NAME_KEY`, `PROPERTY_TYPE_KEY`, `ARRAY_ELEMENT_TYPE_KEY` (for arrays)

**BaseEntity accessors**:
- `static getProperties(): Record<string, string>` — non-array properties only
- `static getAllPropertiesNonFilter(): Record<string, string>` — includes arrays
- `static getPropertyType(key): Constructor | undefined`
- `static getPropertyTypes(): Record<string, Constructor>`

**Behavior**: The **most fundamental decorator**. A property without @PropertyName is invisible to the entire framework.

**Example**:
```typescript
@PropertyName('Customer Name', String)
name!: string;

@PropertyName('Age', Number)
age!: number;

@PropertyName('Orders', Array)
orders!: Order[];
```

---

#### FR-025 — @ReadOnly(condition?)

**File**: `src/decorations/readonly_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `READONLY_KEY`

**BaseEntity accessor**: `isReadOnly(key: string): boolean`

**CRITICAL behavior**: Properties marked @ReadOnly ARE **INCLUDED in toDictionary()** and sent to the API. Input is rendered with `readonly` attribute.

**Example**:
```typescript
@ReadOnly((entity) => entity.status === 'paid')
totalAmount!: number;
```

---

#### FR-026 — @Required(condition, message?)

**File**: `src/decorations/required_decorator.ts`

**Type**: PropertyDecorator

**Signature**:
```typescript
export function Required(
    condition: boolean | ((entity: BaseEntity) => boolean),
    message?: string
): PropertyDecorator
```

**Symbol Key**: `REQUIRED_KEY`

**BaseEntity accessors**: `isRequired(key): boolean`, `requiredMessage(key): string`

**Behavior**: Level-1 validation. Ensures the field has a non-empty, non-null, non-whitespace value.

**Example**:
```typescript
@Required(true, 'Customer name is required')
name!: string;

@Required((entity) => entity.type === 'business')
taxId?: string;
```

---

#### FR-027 — @StringTypeDef(stringType: StringType)

**File**: `src/decorations/string_type_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `STRING_TYPE_KEY`

**Default**: `StringType.TEXT`

**BaseEntity accessor**: `getStringType(): Record<string, StringType>`

**Enum**:
```typescript
export enum StringType {
    EMAIL,         // 0  — EmailInputComponent
    PASSWORD,      // 1  — PasswordInputComponent
    TEXT,          // 2  — TextInputComponent (default)
    TELEPHONE,     // 3  — TextInputComponent (mask: phone format)
    URL,           // 4  — TextInputComponent (type="url")
    TEXTAREA,      // 5  — TextAreaComponent
    DATE,          // 6  — DateInputComponent
    TIME,          // 7  — TimeInputComponent
    DATETIME,      // 8  — DateTimeInputComponent
    COLOR,         // 9  — ColorInputComponent
    NUMBER,        // 10 — NumberInputComponent
}
```

**Rules**: DefaultDetailView reads getStringType() to dispatch the correct input component.

---

#### FR-028 — @TabOrder(order: number)

**File**: `src/decorations/tab_order_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `TAB_ORDER_KEY`

**Default**: `Number.MAX_SAFE_INTEGER`

**BaseEntity accessors**: `getTabOrders(): Record<string, number>`, `getArrayKeysOrdered(): string[]`

**Behavior**: Controls keyboard Tab navigation order in forms. getArrayKeysOrdered() returns array property keys sorted by TabOrder.

---

#### FR-029 — @Validation(condition, message: string)

**File**: `src/decorations/validation_decorator.ts`

**Type**: PropertyDecorator

**Signature**:
```typescript
export function Validation(
    condition: boolean | ((entity: BaseEntity) => boolean),
    message: string
): PropertyDecorator
```

**Symbol Key**: `VALIDATION_KEY`

**BaseEntity accessors**: `isValidation(key): boolean`, `validationMessage(key): string | undefined`

**Behavior**: Level-2 synchronous validation. Message is required.

**Example**:
```typescript
@Validation(
    (entity) => entity.price > 0,
    'Price must be positive'
)
price!: number;
```

---

#### FR-030 — @ViewGroup(groupName: string)

**File**: `src/decorations/view_group_decorator.ts`

**Type**: PropertyDecorator

**Symbol Key**: `VIEW_GROUP_KEY`

**Default**: `'General'`

**BaseEntity accessor**: `getViewGroups(): Record<string, string>`

**Behavior**: Groups properties into named sections in DetailView forms. DefaultDetailView iterates this to create FormGroupComponent sections.

---

#### FR-031 — @ViewGroupRowDecorator(rowType: ViewGroupRow)

**File**: `src/decorations/view_group_row_decorator.ts`

**Export name**: `ViewGroupRowDecorator` (NOT ViewGroupRow — conflicts with enum)

**Type**: PropertyDecorator

**Symbol Key**: `VIEW_GROUP_ROW_KEY`

**Enum**:
```typescript
export enum ViewGroupRow {
    SINGLE = 'single',  // 100% width — one property per row
    PAIR   = 'pair',    // 50% + 50% — two properties side by side
    TRIPLE = 'triple'   // 33% + 33% + 33% — three properties per row
}
```

**BaseEntity accessor**: `getViewGroupRows(): Record<string, ViewGroupRow>`

**Behavior**: Controls horizontal grid layout within a ViewGroup. Consecutive properties with the same ViewGroupRow value are grouped into the same row container.

**CSS rendering**:
- SINGLE: `grid-template-columns: 1fr`
- PAIR: `grid-template-columns: 1fr 1fr` (FormRowTwoItemsComponent)
- TRIPLE: `grid-template-columns: 1fr 1fr 1fr` (FormRowThreeItemsComponent)

**Example**:
```typescript
@ViewGroupRowDecorator(ViewGroupRow.PAIR)
@PropertyName('First Name', String)
firstName!: string;

@ViewGroupRowDecorator(ViewGroupRow.PAIR)
@PropertyName('Last Name', String)
lastName!: string;    // firstName and lastName render side by side

@ViewGroupRowDecorator(ViewGroupRow.SINGLE)
@PropertyName('Bio', String)
bio?: string;         // bio renders full width
```

---

### 2.3 Decorator Application Order

Decorators execute **bottom-to-top** (closest to class/property declaration runs first):

```typescript
// Execution order: @PropertyIndex runs FIRST, then @DisplayFormat, then @PropertyName
@PropertyName('Price', Number)
@DisplayFormat((v) => `$${v}`)
@PropertyIndex(3)
price!: number;
```

For class decorators, the bottommost class decorator executes first:
```typescript
@ModuleName('Product')
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
export class Product extends BaseEntity {}
```

---

## 3. Requirements — Layer 2: BaseEntity

**File**: `src/entities/base_entity.ts`

**TypeScript constraints**:
- No `any` in signatures, casts, or catch blocks.
- Dynamic metadata access must use `unknown` + `Record<PropertyKey, unknown>`.
- Error handling uses `unknown` with safe message normalization.

---

### 3.1 Class Structure

```typescript
export abstract class BaseEntity {
    [key: string]: unknown;                            // Index signature for dynamic properties
    public _isLoading: boolean = false;
    public _originalState?: Record<string, unknown>;   // Snapshot for dirty checking
    public _isSaving?: boolean = false;
    public entityObjectId?: string;
}
```

### 3.2 Constructor

```typescript
constructor(data: Record<string, unknown>) {
    Object.assign(this, data);
    this._originalState = structuredClone(this.toPersistentObject());
}
```

Object.assign maps all data properties onto the instance. structuredClone creates a deep-copy snapshot of business data only.

---

### 3.3 State Management Methods

| Method | Signature | Behavior |
|--------|-----------|---------|
| setLoading() | `public setLoading(): void` | Sets `_isLoading = true` |
| loaded() | `public loaded(): void` | Sets `_isLoading = false` |
| getLoadingState() | `public getLoadingState(): boolean` | Returns `_isLoading` |
| getSaving | `get getSaving(): boolean` | Returns `_isSaving` |
| isNull() | `public isNull(): boolean` | Returns false (overridden in EmptyEntity) |
| isNew() | `public isNew(): boolean` | Returns `getPrimaryPropertyValue() === undefined || null` |

---

### 3.4 Data Conversion Methods

**toObject(): Record<string, unknown>**  
Returns ALL properties including `_isLoading`, `_originalState`. NOT suitable for API requests.

**toPersistentObject(): Record<string, unknown>**  
Returns ONLY properties decorated with @PropertyName. Used for:
- Creating `_originalState` in constructor.
- Dirty state comparison.
- Serialization before HTTP requests.

---

### 3.5 Dirty State Detection

```typescript
public getDirtyState(): boolean {
    const snapshotJson = JSON.stringify(this._originalState);
    const actualJson = JSON.stringify(this.toPersistentObject());
    return snapshotJson !== actualJson;
}

public resetChanges(): void {
    Object.assign(this, structuredClone(this._originalState));
}
```

Application.changeView() calls getDirtyState() and opens a confirmation dialog if true.

---

### 3.6 CRUD Operations

**save(): Promise<this>**

1. beforeSave() hook
2. Application.ApplicationUIService.showLoadingMenu()
3. validateInputs() — if false, hide loading and return this
4. validatePersistenceConfiguration() — if false, return this
5. Obtain endpoint = getApiEndpoint()
6. toPersistentObject() serialization
7. If isNew(): POST ${endpoint} with data
8. Else: PUT ${endpoint}/${getPrimaryPropertyValue()} with data
9. Object.assign(this, response.data) + update _originalState
10. afterSave() hook
11. Show success toast
12. Return this

**update(): Promise<this>**

Similar to save() but:
- ALWAYS uses PUT (never POST).
- Fails immediately if isNew() is true.
- Uses getUniquePropertyValue() for URL (not primary key).
- Maps data with mapToPersistentKeys() before request.
- Maps response with mapFromPersistentKeys() after response.

**delete(): Promise<void>**

1. validatePersistenceConfiguration()
2. validateApiMethod('DELETE')
3. isNew() check — error if true
4. beforeDelete() hook
5. DELETE ${endpoint}/${getUniquePropertyValue()}
6. afterDelete() hook on success
7. deleteFailed() hook on error

**static getElementList(filter = ''): Promise<T[]>**

Sends GET ${endpoint}?${filter}. Maps each item with mapFromPersistentKeys(). Creates instances with `new this(mappedData)`. Returns [] on error.

**static getElement(oid: string): Promise<T>**

Sends GET ${endpoint}/${oid}. Maps response with mapFromPersistentKeys(). Returns `new this(mappedData)`.

---

### 3.7 Validation System (Three Levels)

The validation is **event-driven**, not imperative:

```typescript
public async validateInputs(): Promise<boolean> {
    Application.View.value.isValid = true;             // Optimistic reset
    Application.ApplicationUIService.showLoadingMenu();
    await new Promise(resolve => setTimeout(resolve, 50));
    Application.eventBus.emit('validate-inputs');       // Broadcasts to all mounted inputs
    const keys = this.getKeys();
    await Promise.all(keys.map(key => this.isAsyncValidation(key)));
    await new Promise(resolve => setTimeout(resolve, 50));
    this.onValidated();
    Application.ApplicationUIService.hideLoadingMenu();
    return Application.View.value.isValid;
}
```

Each mounted input component receives the 'validate-inputs' event and validates itself. If any input fails, it sets Application.View.value.isValid = false.

**Validation levels on entity**:

| Level | Method | Decorator | Description |
|-------|--------|-----------|-------------|
| 1 | isRequired(key) | @Required | Field has non-empty value |
| 1 | requiredMessage(key) | @Required | Error message |
| 2 | isValidation(key) | @Validation | Sync business rule passes |
| 2 | validationMessage(key) | @Validation | Error message |
| 3 | async isAsyncValidation(key) | @AsyncValidation | Async check passes |
| 3 | asyncValidationMessage(key) | @AsyncValidation | Error message |

---

### 3.8 Configuration Validation

```typescript
public validateModuleConfiguration(): boolean
// Checks: @ModuleName, @ModuleIcon, @DefaultProperty, @PrimaryProperty

public validatePersistenceConfiguration(): boolean
// Extends validateModuleConfiguration() + checks: @UniquePropertyKey, @ApiEndpoint, @ApiMethods

public validateApiMethod(method: HttpMethod): boolean
// Checks if method is in getApiMethods(); true if @ApiMethods not defined
```

---

### 3.9 Lifecycle Hooks

All hooks have empty no-op default implementations. Subclasses override as needed:

```typescript
public beforeSave(): void {}
public afterSave(): void {}
public beforeUpdate(): void {}
public afterUpdate(): void {}
public beforeDelete(): void {}
public afterDelete(): void {}
public updateFailed(): void {}
public deleteFailed(): void {}
public onValidated(): void {}
public afterRefresh(): void {}   // Called after refresh() completes successfully
public refreshFailed(): void {}  // Called when refresh() fails (network or HTTP error)
```

Throwing an Error inside beforeSave() or beforeDelete() cancels the entire operation.

**`refresh(filter?: string): Promise<this[]>`** — Sends `GET ${endpoint}?${filter}`, maps each item with `mapFromPersistentKeys()`, and returns hydrated instances of the concrete class. Calls `afterRefresh()` on success and `refreshFailed()` on error. Used by RefreshButtonComponent to reload the list view data.

---

### 3.10 Persistent Keys System

```typescript
static getPersistentKeys(): Record<string, string>
static getPersistentKeyByPropertyKey(key: string): string | undefined
static getPropertyKeyByPersistentKey(persistentKey: string): string | undefined
static mapToPersistentKeys(data: Record<string, unknown>): Record<string, unknown>
static mapFromPersistentKeys(data: Record<string, unknown>): Record<string, unknown>
```

- Properties WITHOUT @PersistentKey retain their original name (passthrough).
- mapToPersistentKeys is called before HTTP requests.
- mapFromPersistentKeys is called after HTTP responses.

---

### 3.11 Static Methods Summary

| Method | Returns | Description |
|--------|---------|-------------|
| getModuleName() | string or undefined | From @ModuleName |
| getModuleIcon() | string or undefined | From @ModuleIcon |
| getModulePermission() | string or undefined | From @ModulePermission |
| getModuleDefaultComponent() | Component | @ModuleDefaultComponent or DefaultListView |
| getModuleListComponent() | Component | @ModuleListComponent or DefaultListView |
| getModuleDetailComponent() | Component | @ModuleDetailComponent or DefaultDetailView |
| getModuleCustomComponents() | Map or null | @ModuleCustomComponents or null |
| getProperties() | Record<string,string> | Non-array @PropertyName properties |
| getAllPropertiesNonFilter() | Record<string,string> | ALL @PropertyName properties |
| getPropertyNameByKey(key) | string or undefined | Readable name for a key |
| getPropertyTypes() | Record<string,any> | Key to Constructor mapping |
| getPropertyType(key) | Constructor or undefined | Type for a specific key |
| getArrayPropertyType(key) | typeof BaseEntity or undefined | Element type for Array properties |
| getCSSClasses() | Record<string,string> | Key to CSS column class |
| createNewInstance() | T | new this({}) — empty entity |
| hasPermission(user) | boolean | Checks user against @ModulePermission |

---

### 3.12 EmptyEntity

```typescript
export class EmptyEntity extends BaseEntity {
    public override isNull(): boolean {
        return true;
    }
}
```

Used as a null-safe placeholder. Calling isNull() returns true, allowing conditional renders without null checks.

---

## 4. Requirements — Layer 3: Application Singleton

**File**: `src/models/application.ts`

**Export**: `export default Application;` (the singleton instance)

---

### 4.1 Singleton Pattern

```typescript
class ApplicationClass implements ApplicationUIContext {
    private static instance: ApplicationClass | null = null;

    private constructor() { /* initialize all reactive properties */ }

    static getInstance(): ApplicationClass {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }
}

const Application = ApplicationClass.getInstance();
export default Application;
export { Application };
```

---

### 4.2 Reactive Properties (Ref<T>)

| Property | Type | Purpose |
|----------|------|---------|
| AppConfiguration | Ref<AppConfiguration> | Global app config |
| View | Ref<View> | Current active view state |
| ModuleList | Ref<(typeof BaseEntity)[]> | Registered module classes |
| modal | Ref<Modal> | Global modal state |
| dropdownMenu | Ref<DropdownMenu> | Contextual dropdown state |
| confirmationMenu | Ref<confirmationMenu> | Confirmation dialog state |
| ListButtons | Ref<Component[]> | Buttons rendered in ActionsComponent |
| ToastList | Ref<Toast[]> | Active toast notifications |

---

### 4.3 View State Object

```typescript
interface View {
    entityClass: typeof BaseEntity | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
    isValid: boolean;
    entityOid: string;
}
```

---

### 4.4 Navigation Methods

```typescript
Application.changeViewToListView(moduleClass: typeof BaseEntity): void
Application.changeViewToDetailView(entity: BaseEntity): void
Application.changeViewToDefaultView(moduleClass: typeof BaseEntity): void
Application.changeView(entityClass, entity, component, viewType, oid): void
```

**Dirty State Guard**: changeView() calls entity.getDirtyState(). If true, opens a confirmation dialog before navigating.

---

### 4.5 setButtonList()

Called 405ms after view change (400ms loading transition + 5ms buffer):

```typescript
// LISTVIEW:
ListButtons = [NewButtonComponent, RefreshButtonComponent]

// DETAILVIEW + isPersistent:
ListButtons = [
    NewButtonComponent, RefreshButtonComponent,
    ValidateButtonComponent, SaveButtonComponent,
    SaveAndNewButtonComponent, SendToDeviceButtonComponent
]

// DETAILVIEW + not persistent:
ListButtons = [ValidateButtonComponent]
```

---

### 4.6 axiosInstance

```typescript
// Request interceptor
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem(AppConfiguration.value.authTokenKey);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem(AppConfiguration.value.authTokenKey);
        }
        return Promise.reject(error);
    }
);
```

---

### 4.7 Event Bus

**Implementation**: `mitt<Events>()` — typed pub/sub.

**Access**: `Application.eventBus`

**Defined Events**:

| Event Name | Payload | Emitted By | Consumed By |
|------------|---------|------------|-------------|
| validate-inputs | void | ValidateButtonComponent / validateInputs() | All mounted input components |
| validate-entity | void | ValidateButtonComponent | Entities with cross-field validations |
| toggle-sidebar | boolean or void | TopBarComponent | SideBarComponent |
| show-loading | void | showLoadingScreen() | LoadingScreenComponent |
| hide-loading | void | hideLoadingScreen() | LoadingScreenComponent |
| show-modal | void | showModal() | ModalComponent |
| hide-modal | void | closeModal() | ModalComponent |
| show-confirmation | void | openConfirmationMenu() | ConfirmationDialogComponent |
| hide-confirmation | void | closeConfirmationMenu() | ConfirmationDialogComponent |
| show-loading-menu | void | showLoadingMenu() | LoadingPopupComponent |
| hide-loading-menu | void | hideLoadingMenu() | LoadingPopupComponent |

**Cleanup rule**: ALWAYS call `eventBus.off()` in `onBeforeUnmount()` with the exact same handler reference.

---

### 4.8 ApplicationUIService Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| showToast | (message: string, type: ToastType): void | Pushes toast to ToastList |
| showModal | (entity, viewType, customViewId?): void | Opens global modal |
| showModalOnFunction | (entity, onCloseFunction, viewType, customViewId?): void | Opens modal with callback |
| closeModal | (): void | Emits hide-modal, clears after 150ms |
| closeModalOnFunction | (param): void | Calls callback then closes |
| openDropdownMenu | (position: HTMLElement, title, component, width?): void | Positions and shows dropdown |
| closeDropdownMenu | (): void | Hides, clears after 500ms |
| openConfirmationMenu | (type, title, message, onAccept?, acceptText?, cancelText?): void | Shows dialog |
| showLoadingScreen | (): void | Emits show-loading |
| hideLoadingScreen | (): void | Emits hide-loading |
| showLoadingMenu | (): void | Emits show-loading-menu |
| hideLoadingMenu | (): void | Emits hide-loading-menu |
| toggleSidebar | (state?: boolean): void | Emits toggle-sidebar |
| toggleDarkMode | (): void | Toggles AppConfiguration.isDarkMode |

---

### 4.9 AppConfiguration Interface

```typescript
interface AppConfiguration {
    appName: string;
    appVersion: string;
    apiBaseUrl: string;           // VITE_API_BASE_URL
    apiTimeout: number;           // 30000
    apiRetryAttempts: number;     // 3
    environment: string;          // import.meta.env.MODE
    logLevel: string;             // 'info'
    authTokenKey: string;         // 'auth_token'
    authRefreshTokenKey: string;  // 'refresh_token'
    sessionTimeout: number;       // 3600000
    itemsPerPage: number;         // 20
    maxFileSize: number;          // 5242880 (5MB)
    isDarkMode: boolean;          // from localStorage
}
```

---

### 4.10 ApplicationDataService Transformers

```typescript
// Transformers available for manual data mapping
transformers: {
    date: TransformerConfig;
    decimal: TransformerConfig;
    boolean: TransformerConfig;
    enum: (enumRef: any) => TransformerConfig;
    entity: <T extends BaseEntity>(constructor: AbstractEntityConstructor<T>) => EntityTransformer<T>;
    arrayOfEntities: <T extends BaseEntity>(constructor: AbstractEntityConstructor<T>) => ArrayTransformer<T>;
}
```

---

## 5. Requirements — Layer 4: UI Components

### 5.1 ComponentContainerComponent

**File**: `src/components/ComponentContainerComponent.vue`

**Template structure**:
```html
<div class="ViewContainer">
    <TopBarComponent />
    <div class="ComponentContainer">
        <ActionsComponent />
        <component v-if="currentComponent" :is="currentComponent" />
    </div>
    <LoadingScreenComponent />
</div>
```

**Data**: `currentComponent: Component | null`

**Behavior**:
- On created(): `currentComponent = markRaw(Application.View.value.component)`
- Watch on Application.View.value.component: showLoadingScreen → await 400ms → currentComponent = markRaw(newVal) → hideLoadingScreen
- markRaw() prevents Vue from deep-reactive-wrapping the component object

**CSS**:
- `.ViewContainer`: `display: flex; flex-direction: column; height: 100vh;`
- `.ComponentContainer`: `max-height: calc(100vh - 50px); overflow: auto;`

---

### 5.2 ActionsComponent

**File**: `src/components/ActionsComponent.vue`

**Template**:
```html
<div class="floating-actions" :class="{ 'at-top': isAtTop }">
    <component
        v-for="(component, index) in Application.ListButtons.value"
        :key="index"
        :is="component"
    />
</div>
```

**Lifecycle**: mounted() adds scroll listener on `.ComponentContainer`. beforeUnmount() removes it.

**CSS**: `position: sticky; top: 0; opacity: 0.3` default. `.at-top` class and `:hover`: `opacity: 1`.

---

### 5.3 TopBarComponent

**File**: `src/components/TopBarComponent.vue`

**Computed**:
- title: `Application.View.value.entityClass?.getModuleName() ?? 'Default'`
- icon: `Application.View.value.entityClass?.getModuleIcon() ?? ''`

**EventBus**: Subscribes to toggle-sidebar in mounted(), cleans up in beforeUnmount().

**Methods**: `toggleSidebar()` calls `Application.ApplicationUIService.toggleSidebar()`.

**CSS**: Height 50px, flex row, justify-content: space-between.

---

### 5.4 SideBarComponent

**File**: `src/components/SideBarComponent.vue`

**Data**: `toggled: boolean = true` (expanded by default)

**EventBus handler**:
- `if (payload === undefined) this.toggled = !this.toggled; else this.toggled = payload;`

**CSS**:
- Collapsed: `max-width: 68px`
- Expanded (.toggled): `max-width: 250px; transition: max-width 0.5s ease`

---

### 5.5 SideBarItemComponent

**File**: `src/components/SideBarItemComponent.vue`

**Props**: `module: typeof BaseEntity` (required)

**Computed**: `isActive` compares module.getModuleName() with Application.View.value.entityClass?.getModuleName()

**Method**: `setNewView()` calls `Application.changeViewToDefaultView(this.module)`

**Rules**:
- NEVER manipulate DOM directly
- NEVER use this.$router.push()
- NEVER store active state in data() — always derive from isActive computed

---

### 5.6 TabControllerComponent + TabComponent

**TabControllerComponent** (`src/components/TabControllerComponent.vue`):
- Props: `tabs: string[]`
- Data: `selectedTab: number = 0`
- `setActiveTab(index)`: removes .active from all, adds to target

**TabComponent** (`src/components/TabComponent.vue`):
- Visibility controlled by CSS class toggled by TabControllerComponent
- Default slot for tab body content

---

### 5.7 LoadingScreenComponent

**File**: `src/components/LoadingScreenComponent.vue`

**EventBus**: on('show-loading') → isLoading = true; on('hide-loading') → isLoading = false

**CSS**:
- `position: absolute; top: 50px; z-index: 99999`
- Default: `opacity: 0; pointer-events: none`
- .active: `opacity: 1; pointer-events: all; transition: opacity 0.3s ease`

---

### 5.8 DropdownMenuComponent

**File**: `src/components/DropdownMenuComponent.vue`

**State source**: Application.dropdownMenu.value

**Smart positioning**: CSS classes (not inline styles) — dropdown-pos-left|center|right, dropdown-pos-top|bottom based on viewport.

**Closes on**: click outside, Escape key press.

---

### 5.9 Form Input Components — Common Contract

All input components share:

**Common Props**:
```typescript
entityClass: Function as PropType<typeof BaseEntity>,   // Required
entity:      Object as PropType<BaseEntity>,            // Required
propertyKey: String,                                    // Required
modelValue:  [String, Number, Boolean, Date, Object]    // Required (v-model support)
```

**Common Setup**:
```typescript
const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
```

**Common validation in mounted()**:
```typescript
Application.eventBus.on('validate-inputs', () => {
    validationMessages = [];
    isInputValidated = true;
    // Level 1: Required check
    if (metadata.required.value && !modelValue?.toString().trim()) {
        validationMessages.push(metadata.requiredMessage.value);
        isInputValidated = false;
        Application.View.value.isValid = false;
    }
    // Level 2: Sync validation
    if (!metadata.validated.value) {
        validationMessages.push(metadata.validatedMessage.value);
        isInputValidated = false;
        Application.View.value.isValid = false;
    }
    // Level 3: Async validation (awaited by validateInputs() separately)
});
```

**Cleanup**: `Application.eventBus.off('validate-inputs', handler)` in `beforeUnmount()`

**Data common**: `isInputValidated: boolean = true`, `validationMessages: string[] = []`

---

### 5.9.1 TextInputComponent

**Activates for**: String properties with StringType.TEXT

**Input**: `<input type="text">` with `:value="modelValue"` and `@input` emitting `update:modelValue`

**CSS class**: `nonvalidated` when `!isInputValidated`

---

### 5.9.2 NumberInputComponent

**Activates for**: Number properties

**Special features**:
- `+` / `-` increment/decrement buttons
- `type="text"` so handleKeyPress can filter: digits, `.`, `-` at start, Backspace, Delete, arrows only
- `focusState`: true = raw value; false = formatted via getFormattedValue()

---

### 5.9.3 BooleanInputComponent

**Activates for**: Boolean properties

**Renders**: `<input type="checkbox">`

---

### 5.9.4 DateInputComponent

**Activates for**: Date properties

**Renders**: `<input type="date">`

---

### 5.9.5 EmailInputComponent

**Activates for**: String with StringType.EMAIL

**Renders**: `<input type="email">` with HTML5 format validation

---

### 5.9.6 PasswordInputComponent

**Activates for**: String with StringType.PASSWORD

**Renders**: `<input type="password">` — value masked visually

---

### 5.9.7 TextAreaComponent

**Activates for**: String with StringType.TEXTAREA

**Renders**: `<textarea>` — multiline expandable

---

### 5.9.8 ObjectInputComponent

**Activates for**: Properties whose type extends BaseEntity

**Behavior**: Shows getDefaultPropertyValue() of related entity. On click, opens lookup modal via showModalOnFunction(). onCloseFunction emits update:modelValue with selected entity.

---

### 5.9.9 ArrayInputComponent

**Activates for**: Array properties of BaseEntity subclasses

**Renders**: Sub-table with Add/Edit/Delete per row

**Footer**: The sub-table MUST include a `<tfoot>` that is statically visible at all times. `tfoot` MUST use `position: sticky; bottom: 0; background-color: var(--white); z-index: var(--z-base)` so it remains anchored at the bottom of `.table-scroll-wrapper`'s visible scroll area. The tfoot row contains the "Add" action button.

---

### 5.9.10 EnumInputComponent

**Activates for**: Enum list selections

**Renders**: `<select>` with EnumAdapter.getKeyValuePairs() for options

---

### 5.10 Form Layout Components

**FormGroupComponent**: Props `title: string`. Renders a border-wrapped section with a title header.

**FormRowTwoItemsComponent**: CSS `grid-template-columns: 1fr 1fr`. Used for ViewGroupRow.PAIR properties.

**FormRowThreeItemsComponent**: CSS `grid-template-columns: 1fr 1fr 1fr`. Used for ViewGroupRow.TRIPLE.

---

### 5.11 View Components

**default_listview.vue**:
- Mounted: sets Application.View.value.viewType = ViewTypes.LISTVIEW
- Delegates rendering to DetailViewTableComponent

**default_detailview.vue**:
- groupedProperties computed: reads getKeys() → filter !isHideInDetailView → getViewGroups() → getViewGroupRows() → chunk consecutive same-rowType properties
- Input selection: Number → NumberInputComponent, String/TEXT → TextInputComponent, etc.
- Below groups: array property tabs using getArrayKeysOrdered()

**default_lookup_listview.vue**:
- Renders LookupItemComponent items for entity selection in ObjectInputComponent modals

**DetailViewTableComponent**:
- Headers: getProperties() filtered by !isHideInListView
- Rows: getElementList()
- Cell values: `getCellValue(item, column)` — for enum properties (type is not String/Number/Boolean/Date/Array/BaseEntity) resolves the numeric value to its human-readable key name via `EnumAdapter`; for BaseEntity properties shows `getDefaultPropertyValue()`; otherwise calls `getFormattedValue(column)` (SC-017)
- Row click: Application.changeViewToDetailView(entity)
- `<tfoot>` MUST use `position: sticky; bottom: 0; background-color: var(--white); z-index: var(--z-base)` so it remains visually anchored at the bottom of `.table-wrapper`'s visible scroll area at all times. `tbody` rows scroll above it; the footer never scrolls out of view.
- Column headers MUST expose a drag-handle (FR-032): see §5.16 for full specification.

---

### 5.12 Action Button Components

**NewButtonComponent**: `entityClass.createNewInstance()` → `Application.changeViewToDetailView(newEntity)`

**RefreshButtonComponent**: re-calls getElementList() (ListView) or getElement(oid) (DetailView)

**SaveButtonComponent**: `await entity.save()`. Disabled when !Application.View.value.isValid.

**SaveAndNewButtonComponent**: `await entity.save()` → on success, navigate to new entity.

**ValidateButtonComponent**: `await entity.validateInputs()` → shows result toast.

**SendToDeviceButtonComponent**: Reserved for external device integration.

> **⚠ TECHNICAL DEBT — `GenericButtonComponent`**: `src/components/Buttons/GenericButtonComponent.vue` exists as a stub (`<button class="button">Generic</button>`) and is not referenced anywhere in the framework. It has no handler, no icon, no label binding, and no defined purpose. It MUST either be given a concrete role (e.g. base class for custom module buttons) or removed. Tracked as L1 in the implementation backlog.

---

### 5.13 Toast Components

**ToastContainerComponent**: `position: fixed; bottom-right; z-index: var(--z-toast)`

**ToastItemComponent**:
- Auto-removes after `toast.duration` (default 3000ms)
- SUCCESS → `var(--success-primary)`, ERROR → `var(--error-primary)`, etc.

---

### 5.14 Dialog Components

**ConfirmationDialogComponent**:
- Listens to show-confirmation/hide-confirmation
- Buttons: "Accept" (calls confirmationAction()) and "Cancel"
- Header color from ConfMenuType

**ModalComponent**:
- Listens to show-modal/hide-modal
- Renders Application.modal.value.modalView
- Backdrop click closes modal

---

### 5.15 LookupItemComponent

**File**: `src/components/Informative/LookupItemComponent.vue`

**On click**: `Application.ApplicationUIService.closeModalOnFunction(entity)` — passes selected entity back to ObjectInputComponent callback.

---

### 5.16 FR-032 — Interactive Column Resize (DetailViewTableComponent)

**File**: `src/components/Informative/DetailViewTableComponent.vue`

**Behavior**: Column headers in `DetailViewTableComponent` MUST expose a drag-handle on the right edge of each `<thead td>` that allows the user to resize that column's width via `mousedown`/`mousemove`/`mouseup`. Resize is runtime-only (not persisted between sessions).

**Implementation rules**:
- Column widths are stored in a local `Ref<Record<string, number>>` (`columnWidths`) keyed by column name.
- On mount, `columnWidths` is initialized with each header cell's `offsetWidth`.
- Each `<thead td>` MUST have `position: relative` and contain a `<span class="col-resize-handle">` as its last child.
- The handle spans the full height of the header cell and is `6px` wide on its right edge.
- On `mousedown` on the handle: record `startX = event.clientX` and `startWidth = columnWidths[column]`; attach `mousemove` and `mouseup` listeners on `document`.
- On `mousemove`: `columnWidths[column] = Math.max(minColWidth, startWidth + (event.clientX - startX))` where `minColWidth` is the pixel value of `var(--table-width-very-small)`.
- On `mouseup`: remove document-level listeners.
- Both `<thead td>` and matching `<tbody td>` for each column MUST receive `:style="{ width: columnWidths[col] + 'px', minWidth: columnWidths[col] + 'px' }"` binding.
- CSS: `.col-resize-handle { position: absolute; right: 0; top: 0; width: 6px; height: 100%; cursor: col-resize; user-select: none; background: transparent; }`

**Minimum column width**: pixel value equivalent of `var(--table-width-very-small)` resolved at mount time.

**Double-click auto-fit**: Double-clicking a `<thead>` cell MUST trigger an auto-fit that sets `columnWidths[column]` to `Math.max(th.scrollWidth, max_cell_scrollWidth)` where `max_cell_scrollWidth` is the maximum `scrollWidth` found across all matching `tbody` cells for that column index. The header cell's own `scrollWidth` MUST be included in the maximum, so a column is **never** auto-fitted narrower than its header label. The minimum column width constraint (pixel value of `var(--table-width-very-small)`) still applies. This behavior MUST be identical in both `DetailViewTableComponent` and `ArrayInputComponent`.

---

### 5.17 FR-034 — Pagination Bar (DetailViewTableComponent + ArrayInputComponent)

**Files**: `src/components/Informative/DetailViewTableComponent.vue`, `src/components/Form/ArrayInputComponent.vue`

**Behavior**: Both `DetailViewTableComponent` and the sub-table in `ArrayInputComponent` MUST display a pagination bar that is always visible. The bar is rendered inside the sticky `<tfoot>` element.

**Page-size selector**:
- A `<select>` element MUST offer options `10`, `20`, `50`, `100`, and `ALL` (string `'ALL'`).
- Default value: `10`.
- On change, `currentPage` MUST reset to `1`.
- When `ALL` is selected, navigation buttons are disabled and all rows are rendered.

**Navigation buttons**:
- A previous-page button (`‹`) and a next-page button (`›`) rendered as round buttons:
  - `background-color: var(--green-main)` (green)
  - `border-radius: 50%`
  - `color: var(--white)`
  - `:disabled` when at first or last page respectively.
- Numeric page-pill buttons for the visible page range (current ± 2), rendered with the same round green style; the active page pill MUST have higher visual prominence (e.g. increased opacity or border).

**Data source**:
- Pagination is computed entirely in memory from the full dataset — no additional API calls are made.
- `DetailViewTableComponent`: slices from `data` (the full loaded entity list).
- `ArrayInputComponent`: slices from `filteredData` (post-search computed list); resets `currentPage` to `1` whenever the filtered list length changes.

**Computed properties required**:
- `pageSize: Ref<number | 'ALL'>` — defaults to `10`.
- `currentPage: Ref<number>` — defaults to `1`.
- `totalPages: ComputedRef<number>` — `Math.ceil(dataset.length / pageSize)` (returns `1` when `pageSize === 'ALL'`).
- `paginatedRows` / `paginatedItems: ComputedRef<BaseEntity[]>` — sliced dataset; no slice when `pageSize === 'ALL'`.

---

## 6. Requirements — Layer 5: Advanced

### 6.1 Enums

**Location**: `src/enums/`

| Enum | Values | Usage |
|------|--------|-------|
| ViewTypes | LISTVIEW(0), DETAILVIEW(1), DEFAULTVIEW(2), CUSTOMVIEW(3), LOOKUPVIEW(4) | Application.View.value.viewType and button sets |
| StringType | EMAIL(0), PASSWORD(1), TEXT(2), TELEPHONE(3), URL(4), TEXTAREA(5) | Controls which input component renders |
| ViewGroupRow | SINGLE('single'), PAIR('pair'), TRIPLE('triple') | Form column layout |
| ToastType | SUCCESS(0), ERROR(1), INFO(2), WARNING(3) | Toast visual style |
| ConfMenuType | INFO(0), SUCCESS(1), WARNING(2), ERROR(3) | Confirmation dialog style |
| DetailTypes | NEW(0), EDIT(1) | Defined — reserved for future router use; do not use in application code |
| MaskSides | START(0), END(1) | Used by @Mask — exported from `src/decorations/index.ts` |

**Rules**:
- ALWAYS use enum constants, never raw numbers.
- `DetailTypes` is defined but reserved; do not use in application code.
- `StringType.TELEPHONE` and `StringType.URL` fall back to `TextInputComponent` until dedicated input components are implemented.

---

### 6.2 Models

**Location**: `src/models/`

| Model | Type | Description |
|-------|------|-------------|
| AppConfiguration | Interface | Global app settings |
| View | Interface | Current view state |
| Modal | Interface | Global modal state |
| DropdownMenu | Interface | Dropdown position/content state |
| confirmationMenu | Interface | Confirmation dialog state |
| Toast | Class | Toast notification (auto-generates random 9-char ID) |
| ApplicationUIContext | Interface | Groups all UI reactive state |
| EnumAdapter | Class | Converts enums to {key, value}[] for dropdowns |

**Toast class constructor**:
```typescript
constructor(message: string, type: ToastType) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.message = message;
    this.type = type;
}
```

**EnumAdapter.getKeyValuePairs()**: Filters numeric reverse-mapping keys with `isNaN(Number(key))`.

---

### 6.3 Router

**File**: `src/router/index.ts`

**Routes**:
```typescript
{ path: '/', redirect: () => `/${firstModule.getModuleName().toLowerCase()}` }
{ path: '/:module', meta: { viewType: 'list' } }
{ path: '/:module/:oid', meta: { viewType: 'detail' } }
```

**beforeEach algorithm**:
1. Extract moduleName and oid from to.params
2. Find moduleClass in ModuleList by getModuleName() lowercase
3. Anti-loop: compare currentModuleName + currentOid with params
4. If different: handle 'new' OID (createNewInstance) or numeric OID (sync View)
5. next()

**TypeScript constraint**: src/router/index.ts must NOT use `any`.

---

### 6.4 Types

**src/types/events.ts**:
```typescript
export type Events = {
    'validate-inputs': void;
    'validate-entity': void;
    'toggle-sidebar': boolean | void;
    'show-loading': void;
    'hide-loading': void;
    'show-modal': void;
    'hide-modal': void;
    'show-confirmation': void;
    'hide-confirmation': void;
    'show-loading-menu': void;
    'hide-loading-menu': void;
};
```

**src/types/assets.d.ts**: Declares *.png, *.jpg, *.jpeg, *.svg, *.gif, *.webp as string exports.

---

## 7. Requirements — Layer 6: Composables

### 7.1 useInputMetadata

**File**: `src/composables/useInputMetadata.ts`

**Interface**:
```typescript
export interface InputMetadata {
    propertyName: string;                               // STATIC — not ComputedRef
    required: ComputedRef<boolean>;
    disabled: ComputedRef<boolean>;
    validated: ComputedRef<boolean>;
    requiredMessage: ComputedRef<string | undefined>;
    validatedMessage: ComputedRef<string | undefined>;
    helpText: ComputedRef<string | undefined>;
}
```

**Implementation**:
```typescript
export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata {
    const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;
    return {
        propertyName,                                             // Static string
        required:          computed(() => entity.isRequired(propertyKey)),
        disabled:          computed(() => entity.isDisabled(propertyKey)),
        validated:         computed(() => entity.isValidation(propertyKey)),
        requiredMessage:   computed(() => entity.requiredMessage(propertyKey)),
        validatedMessage:  computed(() => entity.validationMessage(propertyKey)),
        helpText:          computed(() => entity.getHelpText(propertyKey)),
    };
}
```

**Key distinctions**:
- `propertyName` is a static string — decorators are applied at class definition, never change at runtime.
- `validated = true` means validation PASSES; `false` means it FAILS.
- All ComputedRefs recalculate when entity instance changes.

**Usage in input components**:
```typescript
// setup()
const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
return { metadata };

// template
:disabled="metadata.disabled.value"
{{ metadata.propertyName }}
```

---

## 8. Architecture Flows

### 8.1 Application Bootstrap Flow

```
main.ts
  → createApp(App)
  → app.use(router)
  → Application.initializeApplication(router)
      ↳ Application.router = router
      ↳ registerRouterListeners() (beforeEach, afterEach guards)
  → initializeRouterWithApplication(Application)  [legacy no-op]
  → app.mount('#app')
  → App.vue mounts (ComponentContainerComponent + SideBarComponent)
  → Router.beforeEach fires for initial URL
  → Redirects / → /firstModule
  → Application.changeViewToListView(First Module)
  → View.value updated
  → ComponentContainerComponent watch fires
  → DefaultListView renders
```

---

### 8.2 Module Creation & Registration

```
Create src/entities/customer.ts
  → Apply class decorators (bottom-to-top):
      @UniquePropertyKey('id')
      @PrimaryProperty('id')
      @DefaultProperty('name')
      @Persistent()
      @ApiMethods(['GET','POST','PUT','DELETE'])
      @ApiEndpoint('/api/customers')
      @ModuleIcon('user')
      @ModuleName('Customer')
  → Apply property decorators to each field
  → Register in main.ts:
      Application.registerModule(Customer)
  → SideBarComponent reactively re-renders new item
  → Router home redirect now considers Customer
```

---

### 8.3 List View Rendering Flow

```
User clicks SideBarItemComponent
  → setNewView() → Application.changeViewToDefaultView(CustomerClass)
  → Application.setViewChanges(CustomerClass, null, ListComponent, LISTVIEW, '')
  → Application.View.value updated
  → router.push('/customer')
  → ComponentContainerComponent watch fires:
      showLoadingScreen()
      await 400ms
      currentComponent = markRaw(DefaultListView)
      hideLoadingScreen()
  → setTimeout(405ms) → setButtonList() → [NewButton, RefreshButton]
  → DefaultListView mounted() → viewType = LISTVIEW
  → DetailViewTableComponent renders:
      headers = getProperties() filtered by !isHideInListView
      rows = await getElementList()
      cells = entity.getFormattedValue(key)
  → User sees populated table
```

---

### 8.4 Detail View Form Generation Flow

```
User clicks table row
  → Application.changeViewToDetailView(entity)
  → Application.View.value.entityObject = entity, viewType = DETAILVIEW
  → router.push('/customer/42')
  → DefaultDetailView renders, groupedProperties computed:
      1. entity.getKeys()           (sorted by @PropertyIndex)
      2. filter !isHideInDetailView
      3. entity.getViewGroups()     (group names per property)
      4. entity.getViewGroupRows()  (SINGLE/PAIR/TRIPLE per property)
      5. Chunk into rows
  → For each group: <FormGroupComponent title="...">
      For each chunk:
        PAIR   → FormRowTwoItemsComponent
        TRIPLE → FormRowThreeItemsComponent
        SINGLE → <div>
          For each property in chunk:
            Number         → NumberInputComponent
            String/TEXT    → TextInputComponent
            String/EMAIL   → EmailInputComponent
            String/PASSWORD → PasswordInputComponent
            String/TEXTAREA → TextAreaComponent
            Boolean        → BooleanInputComponent
            Date           → DateInputComponent
            BaseEntity     → ObjectInputComponent
  → Array property tabs below (getArrayKeysOrdered())
```

---

### 8.5 Validation Flow

```
User clicks ValidateButton
  → entity.validateInputs()
  → Application.View.value.isValid = true  (optimistic reset)
  → showLoadingMenu()
  → await 50ms
  → eventBus.emit('validate-inputs')
  [All mounted input components receive event]
      Each runs handleValidation():
        L1: Required check → sets isValid=false if fails
        L2: Sync validation → sets isValid=false if fails
        L3: Async validation → sets isValid=false if fails
  → await Promise.all(async validations)
  → await 50ms
  → entity.onValidated() hook
  → hideLoadingMenu()
  → return Application.View.value.isValid
```

---

### 8.6 Save & Persistence Flow

```
User clicks SaveButton
  → entity.save()
  → entity.beforeSave() hook
  → showLoadingMenu()
  → await entity.validateInputs() — if false: return
  → validatePersistenceConfiguration() — if false: return
  → validateApiMethod('POST'/'PUT') — if false: return
  → endpoint = entity.getApiEndpoint()
  → data = mapToPersistentKeys(entity.toPersistentObject())
  → if isNew():  POST endpoint, data
    else:        PUT endpoint/pkValue, data
  → Object.assign(entity, mapFromPersistentKeys(response.data))
  → entity._originalState = structuredClone(toPersistentObject())
  → entity.afterSave() hook
  → showToast('Saved', ToastType.SUCCESS)
  → return entity
```

---

### 8.7 Navigation with Dirty State Guard

```
User clicks sidebar item while form is dirty
  → Application.changeView(...)
  → entity.getDirtyState() returns true
  → openConfirmationMenu(WARNING, 'Unsaved Changes', ...,
        onAccept: () => proceedWithNavigation())
  → User clicks "Accept": navigation proceeds
  → User clicks "Cancel": stays on current view
```

---

## 9. UI Design System Contract

### 9.1 CSS Architecture

```
src/css/constants.css   → Design tokens (ONLY source of truth)
src/css/main.css        → Global foundation, resets, base elements
src/css/form.css        → Form-specific styles
src/css/table.css       → Table-specific styles
<style scoped>          → Component-level styles (references tokens only)
```

**Prohibitions**:
- NO hardcoded values anywhere (no `16px`, no `#fff`, no `1000`).
- ALL values MUST use `var(--token-name)` from constants.css.
- NO local CSS variables in `<style scoped>` — all variables are global.
- Sizing properties (`width`, `height`, `padding`, `margin`, `gap`, `font-size`) MUST use relative units (`rem`, `em`, `%`, `vw`, `vh`, `clamp()`) or CSS token references. Fixed `px` values are only permitted for shell structural elements (TopBar, Sidebar) as defined in §9.5.
- NO fixed container widths (`width: 1200px` ❌). Use `max-width: 1200px` or `width: 100%` instead (✔).

---

### 9.2 CSS Token Reference

**Z-Index Hierarchy**:
```css
:root {
    --z-base:     1;
    --z-dropdown: 100;
    --z-sticky:   200;
    --z-overlay:  500;
    --z-modal:    1000;
    --z-toast:    1500;
    --z-tooltip:  2000;
}
/* LoadingScreenComponent uses z-index: 99999 (intentional exception during transitions) */
```

**Breakpoints** (canonical 6-tier system — all declared as CSS tokens):
```css
:root {
    --breakpoint-xl:      1400px;  /* Desktop XL        ≥ 1401px default */
    --breakpoint-lg:      1200px;  /* Desktop estándar  1201px–1400px */
    --breakpoint-md:       992px;  /* Laptop            993px–1200px */
    --breakpoint-sm:       768px;  /* Tablet horizontal 769px–992px  */
    --breakpoint-xs:       576px;  /* Tablet vertical / móvil grande 577px–768px */
    --breakpoint-xxs:      480px;  /* Móvil pequeño     ≤ 480px      */
}
```

**@media usage** — W3C CSS spec does NOT allow `var()` inside `@media` conditions. Raw pixel values are MANDATORY. Use the token-to-raw-value mapping from SC-016 and ALWAYS add an inline comment referencing the design token:
```css
/* ✔ Correct — raw value with inline token reference comment */
@media (max-width: 1400px) { }  /* var(--breakpoint-xl) = 1400px */
@media (max-width: 1200px) { }  /* var(--breakpoint-lg) = 1200px */
@media (max-width: 992px)  { }  /* var(--breakpoint-md) = 992px  */
@media (max-width: 768px)  { }  /* var(--breakpoint-sm) = 768px  */
@media (max-width: 576px)  { }  /* var(--breakpoint-xs) = 576px  */
@media (max-width: 480px)  { }  /* var(--breakpoint-xxs) = 480px */

/* ❌ Forbidden — CSS custom properties are invalid in @media conditions */
@media (max-width: var(--breakpoint-xl)) { }
```

**Responsive strategy**: Desktop-first. The base ruleset targets the largest viewport (≥ 1401px). Each `@media` tier overrides progressively smaller viewports. All layout, sizing, and spacing declarations MUST include overrides for applicable breakpoints (see §9.7).

---

### 9.3 Box Model

```css
*, *::before, *::after {
    box-sizing: border-box;  /* Immutable — never override */
}
```

---

### 9.4 Component Styling Rules

1. ALL component `<style>` blocks MUST use `<style scoped>`.
2. Animations ONLY on `transform` and `opacity` — never `width`, `height`, `margin`.
3. State changes via CSS classes ONLY: `.active`, `.disabled`, `.loading`, `.error`, `.success`, `.focus`, `.nonvalidated`.
4. Transitions: `transition: opacity 0.3s ease-in-out` or `transition: transform 0.3s ease`.
5. Never toggle inline styles.

---

### 9.5 Layout Specifications

- TopBar height: `50px` (used in `calc(100vh - 50px)` across the app)
- Sidebar collapsed: `68px`
- Sidebar expanded: `250px`
- LoadingScreenComponent top: `50px` (offsets TopBar)
- ActionsComponent z-index: `var(--z-sticky)` = 200
- ModalComponent z-index: `var(--z-modal)` = 1000
- ToastContainer z-index: `var(--z-toast)` = 1500
- LoadingScreenComponent z-index: 99999 (intentional — top priority during transitions)

**Shell structural px exception**: The fixed `px` values listed above (TopBar, Sidebar, LoadingScreen offset) are the ONLY permitted hardcoded pixel dimensions in the entire codebase. They define the immutable shell skeleton that all content areas are calculated against via `calc()`. All content-level components MUST use relative units per §9.1. This exception does NOT extend to margins, paddings, font sizes, or any property outside the shell skeleton.

---

### 9.6 Dark Mode

Controlled by `AppConfiguration.value.isDarkMode`. Token overrides in:
```css
:root[data-theme="dark"] {
    /* Override color tokens for dark scheme */
}
```

Toggled via `ApplicationUIService.toggleDarkMode()`.

---

### 9.7 Responsive Coverage Rules

#### 9.7.1 Viewport Meta Tag (Mandatory)

`index.html` MUST declare:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
Absence of this tag invalidates all responsive behaviour.

#### 9.7.2 @media Obligation

Every `<style scoped>` block in `.vue` files and every `.css` file MUST include `@media` overrides for all breakpoints where layout, sizing, or spacing changes. Specifically:

- **Mandatory coverage**: `width`, `height`, `max-width`, `min-width`, `padding`, `margin`, `gap`, `grid-template-columns`, `flex-direction`, `font-size`, `display` changes.
- **Exempt from @media requirement**: `color`, `background-color`, `font-family`, `border-color`, `opacity`, `transition`, `z-index`, `cursor`, `pointer-events`.
- Not every breakpoint requires an override — only declare overrides where a visual difference is required at that viewport.

**Pattern**:
```css
/* Base (Desktop XL ≥ 1401px) */
.my-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    padding: 2rem;
}

@media (max-width: var(--breakpoint-xl)) {
    .my-container { grid-template-columns: repeat(3, 1fr); } /* unchanged — can omit */
}
@media (max-width: var(--breakpoint-lg)) {
    .my-container { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: var(--breakpoint-md)) {
    .my-container { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
}
@media (max-width: var(--breakpoint-sm)) {
    .my-container { grid-template-columns: 1fr; padding: 1rem; }
}
@media (max-width: var(--breakpoint-xs)) {
    .my-container { padding: 0.75rem; }
}
@media (max-width: var(--breakpoint-xxs)) {
    .my-container { padding: 0.5rem; }
}
```

#### 9.7.3 Relative Units (Mandatory)

All sizing declarations MUST use relative units. Permitted units:

| Unit | Use Case |
|------|----------|
| `rem` | Font sizes, spacing based on root font size |
| `em` | Spacing relative to local font size |
| `%` | Container-relative widths and heights |
| `vw` / `vh` | Viewport-relative full-screen elements |
| `clamp(min, val, max)` | Typography and padding that scales continuously — preferred over breakpoints for `font-size` |
| `calc()` | Combining units (e.g., `calc(100vh - 50px)` for shell offset) |
| `fr` | Grid column/row fractions |

#### 9.7.4 Fluid Containers (Mandatory)

- All content-level containers MUST use `display: flex` or `display: grid`.
- Direct children of flex containers MUST NOT have fixed widths; use `flex: 1`, `min-width: 0`, or `%`.
- `flex-wrap: wrap` is REQUIRED on all flex containers whose children may reflow at smaller viewports.

**Prohibited**:
```css
❌ width: 1200px;           /* fixed content width */
❌ flex-wrap: nowrap;        /* on content containers — forces horizontal scroll */
```

**Permitted**:
```css
✔ max-width: 1200px;        /* limits max size but allows shrinking */
✔ width: 100%;              /* fills available space */
✔ flex-wrap: wrap;          /* allows reflow */
```

#### 9.7.5 Table Overflow Rule (Exception to flex-wrap)

Table components (`DetailViewTableComponent`, `ArrayInputComponent`, and any `<table>` element) are **exempt from `flex-wrap`**. Instead:

- Table cells MUST constrain text overflow with the CSS triplet:
```css
.table-cell {
    max-width: 200px;          /* adjust per column */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;   /* renders "..." at truncation point */
}
```
- Maximum visible characters per cell: **40 characters** (enforced via `max-width` calibrated to the column's `@CSSColumnClass`).
- `flex-wrap: nowrap` IS permitted on table row containers.
- Table containers (`<div class="table-wrapper">`) MUST use `overflow-x: auto` to enable horizontal scroll on small viewports rather than breaking layout.

---

## 10. Code Styling Standards

### 10.1 Indentation & Whitespace

- **Indentation**: 4 spaces (NO tabs)
- No trailing whitespace
- One blank line between methods/sections
- Max line length: ~120 characters

---

### 10.2 Quotes & Semicolons

- **Single quotes** by default: `const x = 'hello';`
- Template literals when variables are interpolated
- String concatenation with variable + text is FORBIDDEN (e.g., `variable + 'text'`)
- For variable + text composition, use template literals only: `${variable}${CONSTANT_TEXT}`
- Repeated text fragments (e.g., date/time suffixes) MUST be extracted to shared constants
- **Semicolons**: MANDATORY everywhere

---

### 10.3 Import Order

```typescript
// 1. Vue/framework imports
import { ref, computed, watch } from 'vue';

// 2. Third-party libraries
import axios from 'axios';

// 3. Internal imports — shallow paths first
import Application from '@/models/application';
import { BaseEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';

// 4. CSS imports (last)
import '@/css/main.css';
```

---

### 10.4 Code Regions (Required in all TypeScript files)

```typescript
// #region PROPERTIES
// ... all property declarations
// #endregion

// #region METHODS
// ... all methods
// #endregion

// #region OVERRIDES
// ... all override methods
// #endregion
```

---

### 10.5 TypeScript Strictness

- `strict: true` in tsconfig.json
- `noUnusedLocals: true`, `noUnusedParameters: true`
- NO `any` — use `unknown` + type guards
- Explicit return types on all public methods
- Interfaces preferred over type aliases for object shapes
- `override` keyword required when overriding parent methods
- `experimentalDecorators: true` and `emitDecoratorMetadata: true` required

---

### 10.6 JSDoc Requirements (All Public Members)

```typescript
/**
 * Saves the entity to the API via POST (new) or PUT (existing).
 *
 * @returns {Promise<this>} The updated entity instance.
 * @throws {Error} If validation fails or API returns an error.
 */
public async save(): Promise<this> { /* ... */ }
```

---

### 10.7 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| TypeScript files | snake_case.ts | base_entity.ts |
| Vue components | PascalCase.vue | TextInputComponent.vue |
| CSS classes | kebab-case | .floating-actions |
| Enum values | UPPER_SNAKE_CASE | ViewTypes.LISTVIEW |
| Symbol constants | UPPER_SNAKE_CASE | API_ENDPOINT_KEY |
| Variables/functions | camelCase | handleValidation() |
| Classes | PascalCase | ApplicationClass |

---

### 10.8 Vue Component Structure

```vue
<template>
    <!-- 4-space indentation -->
</template>

<script lang="ts">
// imports
export default {
    name: 'ComponentName',
    components: { /* ... */ },
    props: { /* ... */ },
    setup(props) { /* Composition API setup */ },
    data() { return { /* ... */ }; },
    computed: { /* ... */ },
    watch: { /* ... */ },
    mounted() { /* register eventBus listeners */ },
    beforeUnmount() { /* cleanup eventBus listeners */ },
    methods: { /* ... */ }
};
</script>

<style scoped>
/* CSS tokens only */
</style>
```

---

### 10.9 Git Commit Format

```
type(scope): description

Types: feat | fix | refactor | docs | test | chore | style
Examples:
feat(entity): add async validation short-circuit optimization
fix(router): prevent infinite loop on bidirectional sync
docs(spec): add architecture flows for detail view generation
```

---

## 11. Key Entities & Data Models

### 11.1 Minimum Required Entity Template

```typescript
import { BaseEntity } from '@/entities/base_entity';
import {
    ModuleName, ModuleIcon, ApiEndpoint, ApiMethods, Persistent,
    DefaultProperty, PrimaryProperty, UniquePropertyKey
} from '@/decorations';
import { PropertyName, PropertyIndex, Required, CSSColumnClass, HelpText } from '@/decorations';
import { HideInDetailView } from '@/decorations';

@UniquePropertyKey('id')
@PrimaryProperty('id')
@DefaultProperty('name')
@Persistent()
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@ApiEndpoint('/api/entities')
@ModuleIcon('circle')
@ModuleName('Entity')
export class MyEntity extends BaseEntity {

    // #region PROPERTIES

    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @HideInDetailView()
    id?: number;

    @PropertyIndex(2)
    @PropertyName('Name', String)
    @Required(true, 'Name is required')
    @CSSColumnClass('col-md-12')
    @HelpText('Enter the entity name')
    name!: string;

    // #endregion

    constructor(data: Record<string, unknown>) {
        super(data);
    }
}
```

---

### 11.2 Customer Entity — Complete Example

```typescript
@UniquePropertyKey('id')
@PrimaryProperty('id')
@DefaultProperty('name')
@Persistent()
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@ApiEndpoint('/api/customers')
@ModuleIcon('user-circle')
@ModuleName('Customer')
export class Customer extends BaseEntity {

    @PropertyIndex(1) @PropertyName('ID', Number) @HideInDetailView()
    id?: number;

    @PropertyIndex(2) @PropertyName('Customer Name', String)
    @Required(true, 'Name is required')
    @CSSColumnClass('col-md-12') @HelpText('Full company name')
    name!: string;

    @PropertyIndex(3) @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true) @Validation((e) => /.+@.+\..+/.test(e.email as string), 'Invalid email')
    @CSSColumnClass('col-md-6')
    email!: string;

    @PropertyIndex(4) @PropertyName('Phone', String)
    @StringTypeDef(StringType.TELEPHONE)
    @CSSColumnClass('col-md-6')
    phone?: string;

    @PropertyIndex(5) @PropertyName('Notes', String)
    @StringTypeDef(StringType.TEXTAREA)
    @CSSColumnClass('col-md-12')
    notes?: string;

    @PropertyIndex(6) @PropertyName('Active', Boolean)
    @CSSColumnClass('col-md-3')
    isActive: boolean = true;

    constructor(data: Record<string, unknown>) {
        super(data);
    }
}
```

---

### 11.3 Entity with ViewGroups, PersistentKeys, and Async Validation

```typescript
@UniquePropertyKey('userId')
@PrimaryProperty('userId')
@DefaultProperty('email')
@Persistent()
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@ApiEndpoint('/api/users')
@ModuleIcon('user')
@ModuleName('User')
export class User extends BaseEntity {

    @PropertyIndex(1) @PropertyName('User ID', Number) @HideInDetailView()
    @PersistentKey('user_id')
    userId?: number;

    @PropertyIndex(2) @PropertyName('First Name', String)
    @Required(true) @CSSColumnClass('col-md-6')
    @ViewGroup('Personal Info') @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    @PersistentKey('first_name')
    firstName!: string;

    @PropertyIndex(3) @PropertyName('Last Name', String)
    @Required(true) @CSSColumnClass('col-md-6')
    @ViewGroup('Personal Info') @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    @PersistentKey('last_name')
    lastName!: string;

    @PropertyIndex(4) @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true) @CSSColumnClass('col-md-12')
    @ViewGroup('Contact') @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    @AsyncValidation(async (e) => {
        const r = await Application.axiosInstance.get(
            `/api/check-email?email=${e.email as string}`
        );
        return !(r.data as { exists: boolean }).exists;
    }, 'Email already taken')
    email!: string;

    @PropertyIndex(5) @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required((e) => e.userId === undefined)
    @CSSColumnClass('col-md-12')
    @ViewGroup('Contact') @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    password?: string;

    constructor(data: Record<string, unknown>) {
        super(data);
    }
}
```

---

## 12. Success Criteria

### SC-001 — Module Registration Completeness
Any class extending BaseEntity pushed to Application.ModuleList.value MUST automatically appear in the sidebar with its icon, be navigable via router URL, and render a table view without additional configuration.

**Test**: Create class with minimum decorators, push to ModuleList, verify sidebar item renders and `/<moduleName>` shows a table.

---

### SC-002 — Decorator Metadata Isolation
Metadata stored by decorators on Prototype A MUST NOT bleed into Prototype B. Two entities with the same property name must have independent metadata.

**Test**: `@Required(true)` on Customer.name but NOT Product.name. `new Product({}).isRequired('name')` must return false.

---

### SC-003 — Validation Event Bus Architecture
validateInputs() must NOT directly inspect input values. It must emit 'validate-inputs' and await component responses. isValid must equal false if ANY component sets it to false.

**Test**: Mount form with required field empty. Call validateInputs(). Assert isValid === false without direct property inspection.

---

### SC-004 — Dirty State Accuracy
getDirtyState() must return false immediately after save() succeeds. Must return true after any @PropertyName property is modified.

**Test**: `entity.name = 'B'; assert getDirtyState() === true`. After save(), `assert getDirtyState() === false`.

---

### SC-005 — @Disabled vs @ReadOnly HTTP Behavior
@Disabled properties MUST NOT appear in the API payload. @ReadOnly properties MUST appear in the API payload.

**Test**: Inspect HTTP request body in save() — @Disabled field absent, @ReadOnly field present.

---

### SC-006 — Persistent Key Bidirectional Mapping
`mapFromPersistentKeys(mapToPersistentKeys(obj))` must deeply equal `obj` for any valid entity object.

**Test**: Round-trip assertion for all combination of @PersistentKey and plain properties.

---

### SC-007 — Dynamic Input Selection
DefaultDetailView MUST render the correct input component for each StringType without manual configuration.

**Test**: Entity with EMAIL, PASSWORD, TEXTAREA, and Number properties → assert correct input component appears in DOM for each.

---

### SC-008 — ViewGroupRow Layout Rendering
Consecutive PAIR properties must render inside FormRowTwoItemsComponent. SINGLE properties must NOT.

**Test**: Inspect DetailView DOM for correct row container around paired fields.

---

### SC-009 — Router Bidirectional Sync Without Infinite Loops
Application.changeViewToListView() triggers router.push(). The subsequent beforeEach guard must NOT call changeViewToListView() again.

**Test**: Spy on changeViewToListView. Click sidebar item. Spy called exactly ONCE.

---

### SC-010 — Event Bus Cleanup on Unmount
All eventBus.on() in components MUST be cleaned up with matching off() calls. Emitting 'validate-inputs' after unmount must NOT trigger the handler.

**Test**: Mount input. Unmount it. Emit 'validate-inputs'. Handler counter must remain at 0.

---

### SC-011 — CSS Token Compliance
No hardcoded dimension, color, or z-index values in component `<style scoped>` blocks.

**Test**: Regex audit of all .vue files — no `#xxx` hex colors, no raw px values outside variable definitions, no raw integers as z-index.

---

### SC-012 — Lifecycle Hook Execution Order
beforeSave() executes BEFORE validateInputs(). afterSave() executes ONLY after successful HTTP response.

**Test**: Spy on hooks. Mock axios.post. Verify execution order: beforeSave → validateInputs → axios.post → afterSave.

---

### SC-013 — EmptyEntity Null Safety
`new EmptyEntity().isNull()` must return true. Metadata accessors on EmptyEntity must not throw.

**Test**: `const e = new EmptyEntity({}); assert e.isNull() === true; assert e.getKeys().length === 0;`

---

### SC-014 — EnumAdapter Reverse Mapping Exclusion
`new EnumAdapter(ToastType).getKeyValuePairs()` must NOT include numeric keys from TypeScript enum reverse mapping.

**Test**: `assert pairs.every(p => isNaN(Number(p.key)));`

---

### SC-015 — Module Permission Guard
Module with @ModulePermission('admin.write') must return false for users without the permission and true for users with it.

**Test**: `Entity.hasPermission({ permissions: ['admin.read'] }) === false`. `Entity.hasPermission({ permissions: ['admin.write'] }) === true`.

---

### SC-016 — Responsive Coverage Compliance
All `<style scoped>` blocks in `.vue` files and all `.css` files MUST declare `@media` breakpoint overrides for every layout, sizing, and spacing property. All content containers MUST use relative units for sizing. Table cells MUST apply the overflow ellipsis CSS triplet.

**Design token → raw value reference** (CSS custom properties cannot be used inside `@media` conditions per W3C CSS spec; raw values are mandatory here):

| Token | Raw Value | Usage |
|---|---|---|
| `var(--breakpoint-mobile)` | `768px` | Mobile-first overrides |
| `var(--breakpoint-tablet)` | `1024px` | Tablet overrides |
| `var(--breakpoint-laptop)` | `1440px` | Laptop overrides |
| `var(--breakpoint-md)` | `992px` | Mid-size overrides (button collapse) |

**Compliance rule**: Every `@media (max-width: NNNpx)` rule MUST have an adjacent inline comment mapping the raw value to its design token, e.g. `/* var(--breakpoint-mobile) = 768px */`.

**Test**: Audit of all `.vue` and `.css` files:
1. Every `@media (max-width: NNNpx)` literal MUST be accompanied by a comment `/* var(--breakpoint-NAME) = NNNpx */`.
2. No `@media (max-width: NNNpx)` where NNN does NOT match a defined design token value.
3. No `width: [0-9]+px` on content containers (shell exceptions: `68px` sidebar-collapsed, `250px` sidebar-expanded, `50px` topbar-height).
4. All `<style scoped>` blocks containing `width|height|padding|margin|gap` MUST contain at least one `@media` block.
5. All `.table-cell`-equivalent selectors MUST include `overflow: hidden`, `white-space: nowrap`, `text-overflow: ellipsis`.

---

### SC-017 — Enum Property Display in ListView
For properties whose runtime type (via `getPropertyType()`) is recognized as an enum — i.e., the stored value is a number and the type is not `String`, `Number`, `Boolean`, `Date`, `Array`, or a `BaseEntity` subclass — `DetailViewTableComponent.getCellValue()` MUST return the human-readable key name (via `EnumAdapter.getKeyValuePairs()`) rather than the raw numeric value. The key is formatted via the same `parseValue()` helper used by `EnumInputComponent` (e.g., `STATUS_ACTIVE` → `Status Active`). Falls back to `getFormattedValue(column)` if no matching key is found.

**Test**: Entity with an enum property (e.g. `status: ViewTypes = ViewTypes.LISTVIEW`). Navigate to list view. Assert the table cell shows `'Listview'` (or equivalent human-readable string), NOT `'0'`.

---

*Specification complete. Covers 31 decorators, BaseEntity (all methods), Application singleton, 10+ input components, form layout components, view components, action buttons, toast/dialog/modal components, 7 enums, 8 models, router, types, and useInputMetadata composable. Total: framework layers 1–6 fully specified. FR-032 (column resize) and SC-017 (enum display) added 2026-03-04. FR-032 dblclick autofit contract and FR-034 pagination added 2026-03-04.*
