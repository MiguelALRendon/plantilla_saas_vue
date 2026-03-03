# Tasks: Framework SaaS Vue — Arquitectura de 5 Capas

**Input**: Design documents from `/specs/001-framework-saas-spec/`
**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [data-model.md](data-model.md) · [research.md](research.md) · [quickstart.md](quickstart.md) · [contracts/](contracts/)
**Tests**: Not requested — no test tasks included per spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: UC-001 — Developer creates CRUD module in 15 minutes (P1 MVP)
- **[US2]**: UC-002 — User fills form with validation and corrects errors (P2)
- **[US3]**: UC-003 — Developer customizes list/detail views with custom components (P3)
- Setup phase / Foundational phase: no story label
- Checkbox states: `[ ]` = not started · `[x]` = implemented · `[~]` = in progress · `[!]` = blocked

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Verify and establish project scaffolding, tooling, and global configuration required before any code can be written.

- [x] T001 Verify tsconfig.json has `experimentalDecorators: true` and `emitDecoratorMetadata: true` in tsconfig.json
- [x] T002 [P] Verify package.json dependencies: vue, vite, axios, vue-router, mitt, typescript in package.json
- [x] T003 [P] Create `.env` template with `VITE_API_BASE_URL` variable in .env.example
- [x] T004 [P] Create folder structure: `src/decorations/`, `src/entities/`, `src/models/`, `src/components/Form/`, `src/components/Buttons/`, `src/components/Modal/`, `src/components/Informative/`, `src/views/`, `src/router/`, `src/enums/`, `src/types/`, `src/validators/`, `src/composables/`, `src/css/`, `src/constants/`
- [x] T005 [P] Configure Vite path alias `@` → `src/` in vite.config.js
- [x] T006 [P] Verify tsconfig.json has `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- [x] T007 [P] Verify `src/env.d.ts` declares `ImportMetaEnv` with `VITE_API_BASE_URL`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Covers all 31 decorators, BaseEntity (full), Application singleton, EventBus, Enums, Types, Router config, CSS design tokens, and the `useInputMetadata` composable.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

---

### 2A — Decorator Foundation (Symbol Keys + Barrel Export)

- [x] T008 Create `src/decorations/index.ts` barrel export — initially empty, add exports as each decorator is implemented
- [x] T009 Define all Symbol keys as module-scoped constants at the top of each decorator file (one per file)

---

### 2B — Class Decorators (13 decorators, store metadata on `target`)

- [x] T010 [P] Implement `@ApiEndpoint(url: string)` and `API_ENDPOINT_KEY` Symbol in `src/decorations/api_endpoint_decorator.ts`; export from index.ts
- [x] T011 [P] Implement `@ApiMethods(methods: HttpMethod[])` and `API_METHODS_KEY` Symbol in `src/decorations/api_methods_decorator.ts`; define `HttpMethod` union type; export from index.ts
- [x] T012 [P] Implement `@DefaultProperty(propertyName: string)` and `DEFAULT_PROPERTY_KEY` Symbol in `src/decorations/default_property_decorator.ts`; export from index.ts
- [x] T013 [P] Implement `@ModuleCustomComponents(components: Record<string, Component>)` and `MODULE_CUSTOM_COMPONENTS_KEY` Symbol in `src/decorations/module_custom_components_decorator.ts`; store as `Map<string, Component>`; export from index.ts
- [x] T014 [P] Implement `@ModuleDefaultComponent(component: Component)` and `MODULE_DEFAULT_COMPONENT_KEY` Symbol in `src/decorations/module_default_component_decorator.ts`; export from index.ts
- [x] T015 [P] Implement `@ModuleDetailComponent(component: Component)` and `MODULE_DETAIL_COMPONENT_KEY` Symbol in `src/decorations/module_detail_component_decorator.ts`; export from index.ts
- [x] T016 [P] Implement `@ModuleIcon(icon: string)` and `MODULE_ICON_KEY` Symbol in `src/decorations/module_icon_decorator.ts`; default `'circle'`; store on prototype; export from index.ts
- [x] T017 [P] Implement `@ModuleListComponent(component: Component)` and `MODULE_LIST_COMPONENT_KEY` Symbol in `src/decorations/module_list_component_decorator.ts`; export from index.ts
- [x] T018 [P] Implement `@ModuleName(name: string)` and `MODULE_NAME_KEY` Symbol in `src/decorations/module_name_decorator.ts`; export from index.ts
- [x] T019 [P] Implement `@ModulePermission(permission: string)` and `MODULE_PERMISSION_KEY` Symbol in `src/decorations/module_permission_decorator.ts`; export from index.ts
- [x] T020 [P] Implement `@Persistent()` (no parameters) and `PERSISTENT_KEY` Symbol in `src/decorations/persistent_decorator.ts`; store `target[PERSISTENT_KEY] = true`; export from index.ts
- [x] T021 [P] Implement `@PrimaryProperty(propertyName: string)` and `PRIMARY_PROPERTY_KEY` Symbol in `src/decorations/primary_property_decorator.ts`; default `'id'`; export from index.ts
- [x] T022 [P] Implement `@UniquePropertyKey(propertyName: string)` and `UNIQUE_KEY` Symbol in `src/decorations/unique_decorator.ts`; export from index.ts (note: export name is `UniquePropertyKey`, not `Unique`)

---

### 2C — Property Decorators (18 decorators, store metadata on `target.constructor.prototype[SYMBOL_KEY]`)

- [x] T023 [P] Implement `@AsyncValidation(condition, message?)` and `ASYNC_VALIDATION_KEY` Symbol in `src/decorations/async_validation_decorator.ts`; store `{ condition, message }` per property key; export from index.ts
- [x] T024 [P] Implement `@CSSColumnClass(cssClass: string)` and `CSS_COLUMN_CLASS_KEY` Symbol in `src/decorations/css_column_class_decorator.ts`; default `'col-md-12'`; export from index.ts (export as `CSSColumnClass`)
- [x] T025 [P] Implement `@Disabled(condition?)` and `DISABLED_KEY` Symbol in `src/decorations/disabled_decorator.ts`; accept `boolean | ((entity) => boolean) | undefined`; export from index.ts
- [x] T026 [P] Implement `@DisplayFormat(format)` and `DISPLAY_FORMAT_KEY` Symbol in `src/decorations/display_format_decorator.ts`; accept `string | ((value: any) => string)`; export from index.ts
- [x] T027 [P] Implement `@HelpText(text: string)` and `HELP_TEXT_KEY` Symbol in `src/decorations/help_text_decorator.ts`; export from index.ts
- [x] T028 [P] Implement `@HideInDetailView()` and `HIDE_IN_DETAIL_VIEW_KEY` Symbol in `src/decorations/hide_in_detail_view_decorator.ts`; store as array of property keys; export from index.ts
- [x] T029 [P] Implement `@HideInListView()` and `HIDE_IN_LIST_VIEW_KEY` Symbol in `src/decorations/hide_in_list_view_decorator.ts`; store as array of property keys; export from index.ts
- [x] T030 [P] Implement `@Mask(mask: string, side: MaskSide)` and `MASK_KEY` Symbol in `src/decorations/mask_decorator.ts`; store `{ mask, side }` per property key; initially unexported — subsequently exported via T175 Polish
- [x] T031 [P] Implement `@PersistentKey(backendKey: string)` and `PERSISTENT_KEY_KEY` Symbol in `src/decorations/persistent_key_decorator.ts`; export from index.ts
- [x] T032 [P] Implement `@PropertyIndex(index: number)` and `PROPERTY_INDEX_KEY` Symbol in `src/decorations/property_index_decorator.ts`; default `Number.MAX_SAFE_INTEGER`; export from index.ts
- [x] T033 [P] Implement `@PropertyName(name: string, type)` with `PROPERTY_NAME_KEY`, `PROPERTY_TYPE_KEY`, `ARRAY_ELEMENT_TYPE_KEY` Symbols in `src/decorations/property_name_decorator.ts`; handle Array type by storing element type in ARRAY_ELEMENT_TYPE_KEY; export from index.ts
- [x] T034 [P] Implement `@ReadOnly(condition?)` and `READONLY_KEY` Symbol in `src/decorations/readonly_decorator.ts`; accept `boolean | ((entity) => boolean) | undefined`; export from index.ts
- [x] T035 [P] Implement `@Required(condition, message?)` and `REQUIRED_KEY` Symbol in `src/decorations/required_decorator.ts`; accept `boolean | ((entity) => boolean)`; export from index.ts
- [x] T036 [P] Implement `@StringTypeDef(stringType: StringType)` and `STRING_TYPE_KEY` Symbol in `src/decorations/string_type_decorator.ts`; default `StringType.TEXT`; export from index.ts (export as `StringTypeDef`)
- [x] T037 [P] Implement `@TabOrder(order: number)` and `TAB_ORDER_KEY` Symbol in `src/decorations/tab_order_decorator.ts`; default `Number.MAX_SAFE_INTEGER`; export from index.ts
- [x] T038 [P] Implement `@Validation(condition, message: string)` and `VALIDATION_KEY` Symbol in `src/decorations/validation_decorator.ts`; accept `boolean | ((entity) => boolean)`; export from index.ts
- [x] T039 [P] Implement `@ViewGroup(groupName: string)` and `VIEW_GROUP_KEY` Symbol in `src/decorations/view_group_decorator.ts`; default `'General'`; export from index.ts
- [x] T040 [P] Implement `@ViewGroupRowDecorator(rowType: ViewGroupRow)` and `VIEW_GROUP_ROW_KEY` Symbol in `src/decorations/view_group_row_decorator.ts`; export name MUST be `ViewGroupRowDecorator` (not `ViewGroupRow` — enum name conflict); export from index.ts

---

### 2D — Enums and Types System

- [x] T041 [P] Create `src/enums/view_type.ts` with `export enum ViewTypes { LISTVIEW=0, DETAILVIEW=1, DEFAULTVIEW=2, CUSTOMVIEW=3, LOOKUPVIEW=4 }`
- [x] T042 [P] Create `src/enums/string_type.ts` with `export enum StringType { EMAIL=0, PASSWORD=1, TEXT=2, TELEPHONE=3, URL=4, TEXTAREA=5 }`
- [x] T043 [P] Create `src/enums/view_group_row.ts` with `export enum ViewGroupRow { SINGLE='single', PAIR='pair', TRIPLE='triple' }`
- [x] T044 [P] Create `src/enums/ToastType.ts` with `export enum ToastType { SUCCESS=0, ERROR=1, INFO=2, WARNING=3 }` (PascalCase filename per actual implementation)
- [x] T045 [P] Create `src/enums/conf_menu_type.ts` with `export enum ConfMenuType { INFO=0, SUCCESS=1, WARNING=2, ERROR=3 }`
- [x] T046 [P] Create `src/enums/mask_sides.ts` with `export enum MaskSides { START=0, END=1 }` (internal use only, do not expose publicly yet)
- [x] T047 [P] Create `src/types/events.ts` with typed `Events` interface for all 11 EventBus event names
- [x] T048 [P] Create `src/types/assets.d.ts` declaring `*.png`, `*.jpg`, `*.jpeg`, `*.svg`, `*.gif`, `*.webp` as `string` exports

---

### 2E — Models and Interfaces

- [x] T049 [P] Create `src/models/AppConfiguration.ts` with `AppConfiguration` interface (all 13 fields per spec §4.9) (PascalCase filename per actual implementation)
- [x] T050 [P] Create `src/models/View.ts` with `View` interface (`entityClass`, `entityObject`, `component`, `viewType`, `isValid`, `entityOid`) (PascalCase filename per actual implementation)
- [x] T051 [P] Create `src/models/modal.ts` with `Modal` interface for global modal state
- [x] T052 [P] Create `src/models/dropdown_menu.ts` with `DropdownMenu` interface for contextual menu state
- [x] T053 [P] Create `src/models/confirmation_menu.ts` with `confirmationMenu` interface for dialog state
- [x] T054 [P] Create `src/models/Toast.ts` with `Toast` class; constructor generates random 9-char ID via `Math.random().toString(36).substr(2, 9)` (PascalCase filename per actual implementation)
- [x] T055 [P] Create `src/models/application_ui_context.ts` with `ApplicationUIContext` interface grouping all reactive UI state refs
- [x] T056 [P] Create `src/models/enum_adapter.ts` with `EnumAdapter` class; implement `getKeyValuePairs(enumRef)` filtering numeric reverse-mapping keys with `isNaN(Number(key))`

---

### 2F — BaseEntity Abstract Class

- [x] T057 Create abstract class `BaseEntity` with index signature `[key: string]: unknown` and four public properties (`_isLoading`, `_originalState`, `_isSaving`, `entityObjectId`) in `src/entities/base_entity.ts`
- [x] T058 Implement `constructor(data: Record<string, unknown>)` with `Object.assign(this, data)` and `this._originalState = structuredClone(this.toPersistentObject())` in `src/entities/base_entity.ts`
- [x] T059 [P] Implement state methods: `setLoading()`, `loaded()`, `getLoadingState()`, `getSaving` getter, `isNull()` (returns false), `isNew()` (checks getPrimaryPropertyValue === undefined | null) in `src/entities/base_entity.ts`
- [x] T060 Implement `toPersistentObject(): Record<string, unknown>` — returns ONLY `@PropertyName`-decorated properties (uses `getProperties()` keys) in `src/entities/base_entity.ts`
- [x] T061 Implement `toObject(): Record<string, unknown>` — returns all properties including `_isLoading`, `_originalState` in `src/entities/base_entity.ts`
- [x] T062 Implement `getDirtyState(): boolean` using `JSON.stringify` comparison of `_originalState` vs `toPersistentObject()` in `src/entities/base_entity.ts`
- [x] T063 Implement `resetChanges(): void` with `Object.assign(this, structuredClone(this._originalState))` in `src/entities/base_entity.ts`
- [x] T064 Implement `validateModuleConfiguration(): boolean` — checks `@ModuleName`, `@ModuleIcon`, `@DefaultProperty`, `@PrimaryProperty` exist in `src/entities/base_entity.ts`
- [x] T065 Implement `validatePersistenceConfiguration(): boolean` — extends validateModuleConfiguration + checks `@UniquePropertyKey`, `@ApiEndpoint`, `@ApiMethods` in `src/entities/base_entity.ts`
- [x] T066 Implement `validateApiMethod(method: HttpMethod): boolean` — returns true if `@ApiMethods` not set; else checks inclusion in `src/entities/base_entity.ts`
- [x] T067 Implement all class-level metadata accessors as static methods: `getModuleName()`, `getModuleIcon()`, `getModulePermission()`, `getModuleDefaultComponent()`, `getModuleListComponent()`, `getModuleDetailComponent()`, `getModuleCustomComponents()` in `src/entities/base_entity.ts`
- [x] T068 Implement property metadata accessors: `static getProperties()` (non-array), `static getAllPropertiesNonFilter()` (all), `static getPropertyNameByKey(key)`, `static getPropertyType(key)`, `static getPropertyTypes()`, `static getArrayPropertyType(key)` in `src/entities/base_entity.ts`
- [x] T069 Implement `static getCSSClasses(): Record<string, string>` and `static createNewInstance(): T` (returns `new this({})`) in `src/entities/base_entity.ts`
- [x] T070 Implement `getKeys(): string[]` — returns `getProperties()` keys sorted ascending by `@PropertyIndex` value in `src/entities/base_entity.ts`
- [x] T071 Implement `getValues(): unknown[]` — returns values in same order as `getKeys()` in `src/entities/base_entity.ts`
- [x] T072 Implement validation metadata accessors: `isRequired(key)`, `requiredMessage(key)`, `isValidation(key)`, `validationMessage(key)`, `isDisabled(key)`, `isReadOnly(key)`, `isHideInDetailView(key)`, `isHideInListView(key)` in `src/entities/base_entity.ts`
- [x] T073 Implement display accessors: `getHelpText(key)`, `getDisplayFormat(key)`, `getFormattedValue(key): string`, `getViewGroups(): Record<string,string>`, `getViewGroupRows(): Record<string, ViewGroupRow>`, `getCssColumnClass(key): string` in `src/entities/base_entity.ts`
- [x] T074 Implement `getStringType(): Record<string, StringType>` and `getPropertyIndices(): Record<string, number>` in `src/entities/base_entity.ts`
- [x] T075 Implement `getTabOrders(): Record<string, number>` and `getArrayKeysOrdered(): string[]` (array property keys sorted by TabOrder) in `src/entities/base_entity.ts`
- [x] T076 Implement `getPrimaryProperty()`, `getPrimaryPropertyValue()`, `getPrimaryPropertyKey()` in `src/entities/base_entity.ts`
- [x] T077 Implement `getUniquePropertyKey()`, `getUniquePropertyValue()`, `getDefaultPropertyValue()` in `src/entities/base_entity.ts`
- [x] T078 Implement `getApiEndpoint()`, `getApiMethods()` in `src/entities/base_entity.ts`
- [x] T079 Implement persistent key system: `static getPersistentKeys()`, `static getPersistentKeyByPropertyKey(key)`, `static getPropertyKeyByPersistentKey(persistentKey)`, `static mapToPersistentKeys(data)`, `static mapFromPersistentKeys(data)` in `src/entities/base_entity.ts`
- [x] T080 Implement `getMask(key)` accessor in `src/entities/base_entity.ts`
- [x] T081 Implement `async isAsyncValidation(key: string): Promise<boolean>` — reads `ASYNC_VALIDATION_KEY` metadata and executes condition; returns true if no async validation defined in `src/entities/base_entity.ts`
- [x] T082 Implement `asyncValidationMessage(key)` in `src/entities/base_entity.ts`
- [x] T083 Implement all lifecycle hooks as empty no-op methods: `beforeSave()`, `afterSave()`, `beforeUpdate()`, `afterUpdate()`, `beforeDelete()`, `afterDelete()`, `updateFailed()`, `deleteFailed()`, `onValidated()` in `src/entities/base_entity.ts`
- [x] T084 Implement `static async getElementList(filter?: string): Promise<T[]>` — sends `GET ${endpoint}?${filter}`, maps with `mapFromPersistentKeys`, creates instances via `new this(mappedData)`, returns `[]` on error in `src/entities/base_entity.ts`
- [x] T085 Implement `static async getElement(oid: string): Promise<T>` — sends `GET ${endpoint}/${oid}`, maps with `mapFromPersistentKeys`, returns `new this(mappedData)` in `src/entities/base_entity.ts`
- [x] T086 Implement `async save(): Promise<this>` — follows 11-step flow (beforeSave → showLoadingMenu → validateInputs → validatePersistenceConfig → isNew? POST : PUT → assign response → update _originalState → afterSave → toast) in `src/entities/base_entity.ts`
- [x] T087 Implement `async update(): Promise<this>` — always PUT using `getUniquePropertyValue()` for URL, maps with persistent keys in `src/entities/base_entity.ts`
- [x] T088 Implement `async delete(): Promise<void>` — validatePersistenceConfig → validateApiMethod('DELETE') → isNew check → beforeDelete → DELETE → afterDelete / deleteFailed in `src/entities/base_entity.ts`
- [x] T089 Implement `async validateInputs(): Promise<boolean>` — event-driven: reset isValid → showLoadingMenu → await 50ms → emit 'validate-inputs' → await async validations → await 50ms → onValidated → hideLoadingMenu → return isValid in `src/entities/base_entity.ts`
- [x] T090 Create `EmptyEntity` class extending `BaseEntity` with `override isNull(): boolean { return true; }` in `src/entities/base_entity.ts`
- [x] T091 Create `src/validators/common_validators.ts` with predefined `@Validation`-compatible validator functions (e.g., isPositive, isEmail, isNotEmpty)
- [x] T092 Add `#region`/`#endregion` code region comments to all sections in `src/entities/base_entity.ts` (PROPERTIES, METHODS, CRUD, VALIDATION, METADATA, LIFECYCLE, OVERRIDES)

---

### 2G — Application Singleton

- [x] T093 Create `ApplicationClass` with private constructor and `static getInstance()` singleton pattern in `src/models/application.ts`
- [x] T094 Add all 8 reactive `Ref<T>` properties to `ApplicationClass`: `AppConfiguration`, `View`, `ModuleList`, `modal`, `dropdownMenu`, `confirmationMenu`, `ListButtons`, `ToastList` in `src/models/application.ts`
- [x] T095 Initialize `axiosInstance` with `axios.create({ baseURL, timeout })` in constructor of `ApplicationClass` in `src/models/application.ts`
- [x] T096 Add request interceptor to `axiosInstance`: reads auth token from localStorage and sets `Authorization: Bearer ${token}` header in `src/models/application.ts`
- [x] T097 Add response interceptor to `axiosInstance`: clears auth token on 401 responses in `src/models/application.ts`
- [x] T098 Create `eventBus` using `mitt<Events>()` on `ApplicationClass` in `src/models/application.ts`
- [x] T099 Implement `initializeApplication(router)`: stores router reference and calls `registerRouterListeners()` in `src/models/application.ts`
- [x] T100 Implement `changeView(entityClass, entity, component, viewType, oid)` with dirty-state guard: call `entity?.getDirtyState()`, if true open confirmation dialog before proceeding in `src/models/application.ts`
- [x] T101 Implement `changeViewToListView(moduleClass)`, `changeViewToDetailView(entity)`, `changeViewToDefaultView(moduleClass)` navigation convenience methods in `src/models/application.ts`
- [x] T102 Implement `setButtonList()` — LISTVIEW: `[NewButtonComponent, RefreshButtonComponent]`; DETAILVIEW+persistent: full 6 buttons; DETAILVIEW+not persistent: `[ValidateButtonComponent]`; called 405ms after view change in `src/models/application.ts`
- [x] T103 Implement `ApplicationUIService` class with modal methods: `showToast()`, `showModal()`, `showModalOnFunction()`, `closeModal()`, `closeModalOnFunction()` — extracted to `src/models/application_ui_service.ts`; instantiated on `ApplicationClass` as `this.ApplicationUIService`
- [x] T104 Implement remaining `ApplicationUIService` UI control methods in `src/models/application_ui_service.ts`: `openDropdownMenu()`, `closeDropdownMenu()` (clears after 500ms), `openConfirmationMenu()`, `showLoadingScreen()`, `hideLoadingScreen()`, `showLoadingMenu()`, `hideLoadingMenu()`, `toggleSidebar()`, `toggleDarkMode()`
- [x] T105 Implement `ApplicationDataService` class with transformer utilities: `date`, `decimal`, `boolean`, `enum(enumRef)`, `entity(constructor)`, `arrayOfEntities(constructor)` — extracted to `src/models/application_data_service.ts`; instantiated on `ApplicationClass` as `this.ApplicationDataService`
- [x] T106 Export the singleton: `const Application = ApplicationClass.getInstance(); export default Application; export { Application };` in `src/models/application.ts`

---

### 2H — Router Configuration

- [x] T107 Create `src/router/index.ts` with three routes: `'/'` redirect, `'/:module'` (list view), `'/:module/:oid'` (detail view); no `any` types allowed
- [x] T108 Implement `beforeEach` guard: extract moduleName + oid → find moduleClass in ModuleList → anti-loop check → handle 'new' OID (createNewInstance) or numeric OID → call changeView → next() in `src/router/index.ts`
- [x] T109 Call `Application.initializeApplication(router)` in `src/main.ts` before `app.mount('#app')`

---

### 2I — CSS Design Token Foundation

- [x] T110 [P] Create `src/css/constants.css` with all design tokens: z-index hierarchy (`--z-base`, `--z-dropdown`, `--z-sticky`, `--z-overlay`, `--z-modal`, `--z-toast`, `--z-tooltip`), breakpoints (`--breakpoint-mobile: 767px`, `--breakpoint-tablet: 1023px`, `--breakpoint-laptop: 1439px`), color tokens, spacing tokens, typography tokens
- [x] T111 [P] Create `src/css/main.css` with global foundation: `box-sizing: border-box` reset on `*, *::before, *::after`; base font; `dark-mode` data attribute override block; import constants.css
- [x] T112 [P] Create `src/css/form.css` with form base styles and input state classes: `.nonvalidated`, `.disabled`, `.readonly`, `.focus`; all values via CSS tokens only
- [x] T113 [P] Create `src/css/table.css` with table base styles; all values via CSS tokens only
- [x] T114 Import all CSS files in `src/main.ts` (last in import order)

---

### 2J — useInputMetadata Composable

- [x] T115 Implement `useInputMetadata(entityClass, entity, propertyKey): InputMetadata` in `src/composables/useInputMetadata.ts` with `InputMetadata` interface: static `propertyName` string + six `ComputedRef` fields (`required`, `disabled`, `validated`, `requiredMessage`, `validatedMessage`, `helpText`); all ComputedRefs delegate to entity instance methods

---

### 2K — Core Layout Shell Components

- [x] T116 Implement `ComponentContainerComponent.vue` with `ViewContainer` + `ComponentContainer` layout, `TopBarComponent`, `ActionsComponent`, dynamic `<component :is>`, `LoadingScreenComponent`; watch on `Application.View.value.component` triggers 400ms loading transition with `markRaw()` in `src/components/ComponentContainerComponent.vue`
- [x] T117 Import and register `ComponentContainerComponent` and `SideBarComponent` in `src/App.vue`
- [x] T118 Confirm `src/main.ts` creates app, uses router, calls `Application.initializeApplication(router)`, and mounts to `#app`

**Checkpoint**: Foundation complete — all user story implementation can now begin.

---

## Phase 3: User Story 1 — Developer Creates CRUD Module in 15 Minutes (Priority: P1) 🎯 MVP

**Goal**: A developer with minimum knowledge can declare an entity class with the required decorators, register it, run `npm run dev`, and immediately have a working sidebar entry, list view, and detail form with CRUD operations, without writing any additional configuration.

**Independent Test**: Follow `quickstart.md`. Create a `Customer` entity with minimum decorators. Push to `Application.ModuleList.value`. Run `npm run dev`. Verify: sidebar shows "Customer" entry, `/customer` renders table, `/customer/new` shows empty form, Save sends POST, row click sends GET.

---

### Layout & Navigation (UC-001)

- [x] T119 [P] [US1] Implement `TopBarComponent.vue`: computed `title` and `icon` from `Application.View.value.entityClass`, `toggleSidebar()` method calling `Application.ApplicationUIService.toggleSidebar()`; EventBus listener cleanup in `beforeUnmount`; height 50px via CSS token in `src/components/TopBarComponent.vue`
- [x] T120 [P] [US1] Implement `SideBarComponent.vue`: `toggled: boolean = true` data, EventBus `toggle-sidebar` handler (`payload === undefined → toggle, else = payload`); CSS `max-width: 68px` collapsed / `max-width: 250px` expanded with `transition: max-width 0.5s ease` in `src/components/SideBarComponent.vue`
- [x] T121 [US1] Implement `SideBarItemComponent.vue`: prop `module: typeof BaseEntity`, computed `isActive` (compares `getModuleName()` with current View), `setNewView()` calls `Application.changeViewToDefaultView(this.module)`; NEVER use `this.$router.push()` or DOM manipulation in `src/components/SideBarItemComponent.vue`
- [x] T122 [US1] Render `SideBarItemComponent` for each entry in `Application.ModuleList.value` inside `SideBarComponent.vue` template loop

---

### List View (UC-001)

- [x] T123 [P] [US1] Implement `DetailViewTableComponent.vue`: compute headers from `entityClass.getProperties()` filtered by `!isHideInListView(key)`; call `getElementList()` on mount; render rows with `entity.getFormattedValue(key)` for each cell; row click calls `Application.changeViewToDetailView(entity)` in `src/components/Informative/DetailViewTableComponent.vue`
- [x] T124 [US1] Implement `src/views/default_listview.vue`: on mounted set `Application.View.value.viewType = ViewTypes.LISTVIEW`; render `DetailViewTableComponent` passing current `entityClass` in `src/views/default_listview.vue`

---

### Detail Form & Basic Inputs (UC-001)

- [x] T125 [P] [US1] Implement `TextInputComponent.vue` (activates for String/TEXT): common props contract (`entityClass`, `entity`, `propertyKey`, `modelValue`); `useInputMetadata` in setup; `<input type="text">`; `@input` emits `update:modelValue`; `nonvalidated` CSS class when `!isInputValidated`; EventBus `validate-inputs` listener with L1+L2 validation logic; cleanup in `beforeUnmount` in `src/components/Form/TextInputComponent.vue`
- [x] T126 [P] [US1] Implement `NumberInputComponent.vue` (activates for Number): `<input type="text">` with `handleKeyPress` filtering digits/`.`/`-`/backspace only; `+`/`-` increment buttons; `focusState` toggles raw vs formatted value display; same validation contract as TextInput in `src/components/Form/NumberInputComponent.vue`
- [x] T127 [P] [US1] Implement `BooleanInputComponent.vue` (activates for Boolean): `<input type="checkbox">`; same props/validation contract in `src/components/Form/BooleanInputComponent.vue`
- [x] T128 [P] [US1] Implement `DateInputComponent.vue` (activates for Date): `<input type="date">`; same props/validation contract in `src/components/Form/DateInputComponent.vue`
- [x] T129 [US1] Implement `src/views/default_detailview.vue`: on mount reads entity from `Application.View.value.entityObject`; compute `groupedProperties` from: `getKeys()` → filter `!isHideInDetailView` → `getViewGroups()` → `getViewGroupRows()` → chunk consecutive same-rowType properties; for each group render `FormGroupComponent`; dispatch correct input component per type (Number→NumberInput, String/TEXT→TextInput, String/EMAIL→EmailInput, Boolean→BooleanInput, Date→DateInput, BaseEntity→ObjectInput); render array tab section below groups in `src/views/default_detailview.vue`
- [x] T130 [P] [US1] Implement `FormGroupComponent.vue`: prop `title: string`; renders border-wrapped section with title header via CSS tokens in `src/components/Form/FormGroupComponent.vue`
- [x] T131 [P] [US1] Implement `FormRowTwoItemsComponent.vue`: CSS `grid-template-columns: 1fr 1fr`; default slot in `src/components/Form/FormRowTwoItemsComponent.vue`
- [x] T132 [P] [US1] Implement `FormRowThreeItemsComponent.vue`: CSS `grid-template-columns: 1fr 1fr 1fr`; default slot in `src/components/Form/FormRowThreeItemsComponent.vue`

---

### Action Buttons (UC-001)

- [x] T133 [P] [US1] Implement `NewButtonComponent.vue`: calls `entityClass.createNewInstance()` → `Application.changeViewToDetailView(newEntity)` in `src/components/Buttons/NewButtonComponent.vue`
- [x] T134 [P] [US1] Implement `RefreshButtonComponent.vue`: LISTVIEW → re-calls `getElementList()`; DETAILVIEW → re-calls `getElement(oid)` in `src/components/Buttons/RefreshButtonComponent.vue`
- [x] T135 [P] [US1] Implement `SaveButtonComponent.vue`: calls `await entity.save()`; disabled when `!Application.View.value.isValid` in `src/components/Buttons/SaveButtonComponent.vue`
- [x] T136 [P] [US1] Implement `SaveAndNewButtonComponent.vue`: `await entity.save()` → on success call `Application.changeViewToDetailView(entityClass.createNewInstance())` in `src/components/Buttons/SaveAndNewButtonComponent.vue`
- [x] T137 [P] [US1] Implement `ValidateButtonComponent.vue`: calls `await entity.validateInputs()` → shows result toast in `src/components/Buttons/ValidateButtonComponent.vue`
- [x] T138 [P] [US1] Implement `SendToDeviceButtonComponent.vue`: stub reserved for external device integration in `src/components/Buttons/SendToDeviceButtonComponent.vue`
- [x] T139 [US1] Implement `ActionsComponent.vue`: `position: sticky; top: 0; opacity: 0.3`; scroll listener on `.ComponentContainer` adds `.at-top` (opacity 1); render `Application.ListButtons.value` via `v-for :is="component"` in `src/components/ActionsComponent.vue`
- [x] T140 [US1] Register all button components in `Application.setButtonList()` import block in `src/models/application.ts`

**Checkpoint**: User Story 1 complete — any entity with minimum decorators registered in ModuleList auto-generates working sidebar + list + form + CRUD.

---

## Phase 4: User Story 2 — User Fills Form with Validation Errors and Corrects Them (Priority: P2)

**Goal**: An end user can fill a form that has `@Required`, `@Validation`, and `@AsyncValidation` decorators, see per-field error messages upon clicking Validate, correct the errors, re-validate, and Save with the full hook + toast lifecycle.

**Independent Test**: Create entity with `@Required`, `@Validation`, and `@AsyncValidation` on separate properties. Navigate to new detail view. Click Validate with all fields empty. Verify each input shows its error message below. Fill fields. Click Validate. Verify no errors and `isValid = true`. Click Save. Verify POST sent and success toast appears.

---

### Input Validation Infrastructure (UC-002)

- [x] T141 [US2] Extend all input components (TextInput, NumberInput, BooleanInput, DateInput) with Level 3 async validation: call `entity.isAsyncValidation(propertyKey)` and push result to `validationMessages` if fails; set `Application.View.value.isValid = false` in respective component files
- [x] T142 [P] [US2] Implement `EmailInputComponent.vue` (activates for String/EMAIL): `<input type="email">`; HTML5 format validation; full three-level validation contract in `src/components/Form/EmailInputComponent.vue`
- [x] T143 [P] [US2] Implement `PasswordInputComponent.vue` (activates for String/PASSWORD): `<input type="password">`; same validation contract in `src/components/Form/PasswordInputComponent.vue`
- [x] T144 [P] [US2] Implement `TextAreaComponent.vue` (activates for String/TEXTAREA): `<textarea>`; multiline; same validation contract in `src/components/Form/TextAreaComponent.vue`

---

### Toast Notification System (UC-002)

- [x] T145 [P] [US2] Implement `ToastItemComponent.vue`: auto-removes after `toast.duration` ms (default 3000); SUCCESS→`var(--success-primary)`, ERROR→`var(--error-primary)`, INFO→`var(--info-primary)`, WARNING→`var(--warning-primary)` via CSS tokens in `src/components/Informative/ToastItemComponent.vue`
- [x] T146 [US2] Implement `ToastContainerComponent.vue`: `position: fixed; bottom-right; z-index: var(--z-toast)`; renders `ToastItemComponent` for each entry in `Application.ToastList.value` in `src/components/Informative/ToastContainerComponent.vue`
- [x] T147 [US2] Register `ToastContainerComponent` in `src/App.vue` template

---

### Loading Popup and Validation UX (UC-002)

- [x] T148 [P] [US2] Implement `LoadingScreenComponent.vue`: EventBus `show-loading` → `isLoading = true`; `hide-loading` → `isLoading = false`; `position: absolute; top: 50px; z-index: 99999`; `.active` class: `opacity: 1; pointer-events: all; transition: opacity 0.3s ease`; cleanup in `beforeUnmount` in `src/components/LoadingScreenComponent.vue`
- [x] T149 [P] [US2] Implement `LoadingPopupComponent.vue` (the inline validation loading overlay): EventBus `show-loading-menu` → visible; `hide-loading-menu` → hidden; smaller than full-screen loading in `src/components/Informative/LoadingPopupComponent.vue`

---

### Dirty State Guard and Confirmation Dialog (UC-002)

- [x] T150 [P] [US2] Implement `ConfirmationDialogComponent.vue`: EventBus `show-confirmation` → visible with title/message/buttons; `hide-confirmation` → hidden; "Accept" calls `confirmationAction()`; "Cancel" closes; header color from `ConfMenuType` in `src/components/Modal/ConfirmationDialogComponent.vue`
- [x] T151 [US2] Wire `ConfirmationDialogComponent` in `src/App.vue` template
- [x] T152 [US2] Verify `Application.changeView()` calls `entity?.getDirtyState()` and triggers `openConfirmationMenu(WARNING, ...)` if true before proceeding with navigation in `src/models/application.ts`

---

### Validation Display Styling (UC-002)

- [x] T153 [P] [US2] Add validation error message display template block to all input components: render `validationMessages` list below input; apply `.nonvalidated` CSS class to input when `!isInputValidated` (all input component files in `src/components/Form/`)
- [x] T154 [US2] Add `@HelpText` display block to all input components: render `metadata.helpText.value` below input (above or below validation messages) per common contract (all input component files in `src/components/Form/`)
- [x] T155 [US2] Add `@Disabled` and `@ReadOnly` binding to all input components: `:disabled="metadata.disabled.value"` and `:readonly="metadata.readonly ? isReadOnly(propertyKey) : undefined"` per common contract (all input component files in `src/components/Form/`)

**Checkpoint**: User Story 2 complete — three-level validation with visual feedback, dirty-state guard, toasts, and async validation all work end-to-end.

---

## Phase 5: User Story 3 — Developer Customizes List/Detail Views with Custom Components (Priority: P3)

**Goal**: A senior developer can override the default list or detail views with custom components using `@ModuleListComponent` and `@ModuleDetailComponent`. Custom sub-components can be resolved via `@ModuleCustomComponents({ 'key': Component })`. Lookup/object selection via modal works.

**Independent Test**: Apply `@ModuleListComponent(CustomList)` and `@ModuleDetailComponent(CustomDetail)` to an entity. Verify `CustomList` renders on sidebar click instead of DefaultListView. Verify `CustomDetail` renders on row click. Apply `@ModuleCustomComponents({ 'price-cell': PriceCellComponent })`. Verify `PriceCellComponent` resolves.

---

### Custom View Resolution (UC-003)

- [x] T156 [US3] Update `Application.changeViewToDefaultView(moduleClass)` to call `moduleClass.getModuleDefaultComponent()` which returns `@ModuleDefaultComponent` component if set, else falls back to `DefaultListView` in `src/models/application.ts`
- [x] T157 [US3] Update `Application.changeViewToListView(moduleClass)` to call `moduleClass.getModuleListComponent()` — returns `@ModuleListComponent` if set, else `DefaultListView` in `src/models/application.ts`
- [x] T158 [US3] Update `Application.changeViewToDetailView(entity)` to call `entity.constructor.getModuleDetailComponent()` — returns `@ModuleDetailComponent` if set, else `DefaultDetailView` in `src/models/application.ts`
- [x] T159 [US3] Implement custom component resolution in `ComponentContainerComponent.vue`: register `Application.View.value.entityClass?.getModuleCustomComponents()` entries as local components using `defineComponent` or `app.component` pattern; components available by string key in `src/components/ComponentContainerComponent.vue`

---

### Dropdown Menu (UC-003)

- [x] T160 [P] [US3] Implement `DropdownMenuComponent.vue`: reads from `Application.dropdownMenu.value`; smart viewport-based positioning via CSS classes (`dropdown-pos-left/center/right`, `dropdown-pos-top/bottom`); closes on click-outside or Escape key; NO inline styles — CSS classes only in `src/components/DropdownMenuComponent.vue`
- [x] T161 [US3] Register `DropdownMenuComponent` in `src/App.vue` template

---

### Modal System (UC-003)

- [x] T162 [P] [US3] Implement `ModalComponent.vue`: EventBus `show-modal` → visible; `hide-modal` → hidden; renders `Application.modal.value.modalView` as dynamic component; backdrop click calls `Application.ApplicationUIService.closeModal()`; `z-index: var(--z-modal)` in `src/components/Modal/ModalComponent.vue`
- [x] T163 [US3] Register `ModalComponent` in `src/App.vue` template

---

### Lookup and Object Input (UC-003)

- [x] T164 [P] [US3] Implement `LookupItemComponent.vue`: receives entity as prop; on click calls `Application.ApplicationUIService.closeModalOnFunction(entity)` to pass selected entity back to ObjectInputComponent callback in `src/components/Informative/LookupItemComponent.vue`
- [x] T165 [US3] Implement `src/views/default_lookup_listview.vue`: calls `getElementList()` on target entity class; renders `LookupItem` for each result; used inside modal for object selection in `src/views/default_lookup_listview.vue`
- [x] T166 [US3] Implement `ObjectInputComponent.vue` (activates for properties whose type extends BaseEntity): displays `getDefaultPropertyValue()` of related entity; on click calls `Application.ApplicationUIService.showModalOnFunction(entity, onCloseFunction, ViewTypes.LOOKUPVIEW)` to open lookup; `onCloseFunction` emits `update:modelValue` with selected entity in `src/components/Form/ObjectInputComponent.vue`

---

### Remaining Complex Inputs (UC-003)

- [x] T167 [P] [US3] Implement `ArrayInputComponent.vue` (activates for Array properties of BaseEntity subclasses): renders sub-table with Add/Edit/Delete per row; each row opened in modal via `showModal`; row rendered by `DefaultDetailView` in `src/components/Form/ArrayInputComponent.vue`
- [x] T168 [P] [US3] Implement `ListInputComponent.vue` (activates for enum list selections): renders `<select>` with `EnumAdapter.getKeyValuePairs(enumRef)` for options; same validation contract in `src/components/Form/ListInputComponent.vue`

---

### Tab Components (UC-003)

- [x] T169 [P] [US3] Implement `TabComponent.vue`: visibility controlled by CSS `.active` class toggled by parent `TabControllerComponent`; default slot for tab body content in `src/components/TabComponent.vue`
- [x] T170 [US3] Implement `TabControllerComponent.vue`: prop `tabs: string[]`; data `selectedTab: number = 0`; `setActiveTab(index)` removes `.active` from all and adds to target; renders tabs header bar in `src/components/TabControllerComponent.vue`
- [x] T171 [US3] Integrate `TabControllerComponent` + `TabComponent` in `default_detailview.vue` for array property tabs section (uses `getArrayKeysOrdered()`) in `src/views/default_detailview.vue`

**Checkpoint**: User Story 3 complete — custom component overrides, modal lookup system, and complex inputs all functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Technical debt resolution, developer experience improvements, and validation of quickstart scenario end-to-end.

- [x] T172 [P] Apply `#region`/`#endregion` comments to all Vue component `<script>` sections that are missing them (PROPERTIES, METHODS, LIFECYCLE, OVERRIDES sections per code standards)
- [x] T182 [P] Create `src/enums/detail_type.ts` with `export enum DetailTypes { NEW, EDIT }` — tracks new vs edit state in router detail view navigation
- [x] T183 [P] Create `src/types/decorator.types.ts` — barrel re-export of all decorator types from `src/decorations/index.ts`: `AsyncValidationMetadata`, `DisabledMetadata`, `DisplayFormatValue`, `HttpMethod`, `ReadOnlyMetadata`, `RequiredMetadata`, `ValidationMetadata`
- [x] T184 [P] Create `src/types/entity.types.ts` with entity type aliases used by BaseEntity and Application: `EntityData`, `MetadataRecord`, `EntityConstructor<T>`, `ConcreteEntityClass<T>`, `DecoratedPrototype<T>`, `DecoratedConstructor<T>`, `TransformableEntityClass<T>`
- [x] T185 [P] Create `src/types/service.types.ts` with API and transformation types: `TransformFunction`, `Transformer`, `TransformationSchema`, `RetryableAxiosRequestConfig` (axios retry metadata extension); consumed by `ApplicationDataService` and `BaseEntity`
- [x] T186 [P] Create `src/types/ui.types.ts` with UI state type aliases: `EntityCtor` (= `typeof BaseEntity`) and `ViewState` interface mirroring `View`; consumed by `ApplicationUIContext` and `ApplicationUIService`
- [x] T187 [P] Create `src/types/index.ts` barrel re-exporting all type modules: `decorator.types`, `entity.types`, `service.types`, `ui.types`, `events`
- [x] T188 [P] Create `src/utils/deep_compare.ts` with `deepEqual(obj1, obj2): boolean` (recursive structural comparison) and `deepClone<T>(obj: T): T` (structured clone via `JSON.parse/stringify` fallback); used internally by `BaseEntity.getDirtyState()` and `BaseEntity` constructor snapshot
- [x] T189 [P] Implement `GenericButtonComponent.vue` — base button stub providing shared button template and scoped style anchor; no props; used as baseline for button system in `src/components/Buttons/GenericButtonComponent.vue`
- [x] T190 [US1] Implement `src/views/list.vue` — minimal home/debug view with dark mode toggle button (`Application.ApplicationUIService.toggleDarkMode()`); serves as initial landing route distinct from `default_listview.vue`
- [x] T173 [P] Add JSDoc `/** ... */` comments to all public methods in `src/entities/base_entity.ts` and `src/models/application.ts`
- [x] T174 [P] Replace any remaining raw number literals in Vue components with CSS token references (`var(--z-modal)`, etc.) across `src/components/`
- [x] T175 [P] Export `@Mask` decorator from `src/decorations/index.ts` and document status (currently listed as unexported in spec §FR-021); requires `MaskSides` enum also exported from `src/enums/`
- [x] T176 [P] Implement `hasPermission(user): boolean` static method on BaseEntity reading `@ModulePermission` for future route guard use in `src/entities/base_entity.ts`
- [x] T177 [US1] Run `quickstart.md` scenario end-to-end: create Customer entity, register in ModuleList, verify sidebar + list + detail + save + validation work per UC-001 acceptance criteria in `src/entities/`
- [x] T178 [P] Verify SC-001 through SC-009 success criteria from spec.md §12 pass in browser
- [x] T179 [P] Add uniqueness validation to `Application.ModuleList.value.push()` — warn if two modules have the same `getModuleName()` (risk: route collision per plan.md risk registry) in `src/models/application.ts`
- [x] T180 [P] Verify `src/router/index.ts` has no `any` types (TypeScript constraint per spec §6.3)
- [x] T181 [P] Verify `src/entities/base_entity.ts` has no `any` in signatures, casts, or catch blocks; replace with `unknown` + type guards per spec §3 TypeScript constraints
- [x] T191 [P] Extract date-time suffix literal into global constant `DATE_TIME_LOCAL_SUFFIX`; replace all usages with template literals `${value}${DATE_TIME_LOCAL_SUFFIX}` in Date inputs and detail view; codify variable+text concatenation prohibition in spec §10.2
- [x] T192 [US1] Extend `StringType` runtime coverage in `default_detailview.vue` to dispatch dedicated components for `TELEPHONE`, `URL`, `URL_IMAGE`, `SEARCH`, `CREDIT_CARD`, `CREDIT_CARD_DATE`, and `CREDIT_CARD_CVV`
- [x] T193 [P] Implement `TelephoneInputComponent.vue` with optional `lenght` prop (default `10`), text-only numeric capture, and format `XXX XXX XXXX`
- [x] T194 [P] Implement `UrlInputComponent.vue` with `http/https` validation and disabled-state anchor rendering using CSS blue token
- [x] T195 [P] Implement `UrlImageInputComponent.vue` with URL validation and image preview area capped at `15rem`
- [x] T196 [P] Implement `SearchInputComponent.vue` with integrated search button and shared validation contract
- [x] T197 [P] Implement `CreditCardInputComponent.vue` with numeric-only input and format `XXXX XXXX XXXX XXXX`
- [x] T198 [P] Implement `CreditCardDateInputComponent.vue` with format `XX/XX` and month/year range validation (`01-12` / `01-99`)
- [x] T199 [P] Implement `CreditCardCvvInputComponent.vue` with numeric-only max 3 digits
- [x] T200 [US1] Add Product entity sample fields to exercise all new `StringType` inputs and export components in `src/components/Form/index.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup; BLOCKS all user story phases
  - 2A–2E (Symbols, Enums, Models): No inter-dependencies — all parallelizable
  - 2F (BaseEntity): Depends on 2B+2C (decorator Symbols must exist) + 2D (enums) + 2E (models)
  - 2G (Application): Depends on 2D (enums) + 2E (models) + partial 2F (BaseEntity for typing)
  - 2H (Router): Depends on 2G (Application)
  - 2I (CSS): No dependencies — parallelizable with all of Phase 2
  - 2J (useInputMetadata): Depends on 2F (BaseEntity) + 2C (@Required, @Disabled etc.)
  - 2K (Shell): Depends on 2G (Application) + 2I (CSS)
- **Phase 3 (US1)**: Depends on ALL of Phase 2 — especially BaseEntity, Application, Router, CSS, useInputMetadata, Shell
- **Phase 4 (US2)**: Depends on Phase 3 completion (extends input components, adds validation display)
- **Phase 5 (US3)**: Depends on Phase 2 completion; can start in parallel with Phase 4 if staffed
- **Polish**: Depends on all desired user story phases complete

### User Story Independence

| Story | Start After | Can Parallel With | Independently Testable |
|-------|------------|-------------------|----------------------|
| US1 (P1) | Phase 2 complete | — | ✅ Full CRUD module in isolation |
| US2 (P2) | Phase 3 complete | US3 (different files) | ✅ Validation flow independently testable |
| US3 (P3) | Phase 2 complete | US2 (different files) | ✅ Custom views independently testable |

### Within Each User Story

1. Layout/Shell components before form components
2. Form components before view components
3. View components before action buttons
4. All implementations before integration wiring

### Parallelizable Opportunities Per Phase

**Phase 2 — within a single developer session**:

```
Parallel Track A: Decorator Symbols (T010–T040)
Parallel Track B: Enums + Types + Models (T041–T056)
    ↓ (both complete)
Parallel Track C: BaseEntity (T057–T092)
Parallel Track D: CSS (T110–T113)
    ↓ (both complete + all above)
Application (T093–T106)
    ↓
Router (T107–T109) + useInputMetadata (T115) + Shell (T116–T118)
```

**Phase 3 — parallel within US1**:

```
Parallel: TextInput (T125) + NumberInput (T126) + BooleanInput (T127) + DateInput (T128)
Parallel: NewButton (T133) + RefreshButton (T134) + SaveButton (T135) + ValidateButton (T137)
Parallel: TopBar (T119) + SideBar (T120) + DetailViewTableComponent (T123)
Parallel: FormGroupComponent (T130) + FormRowTwoItems (T131) + FormRowThreeItems (T132)
    ↓ (all above complete)
SideBarItemComponent (T121) → DefaultListView (T124) → DefaultDetailView (T129)
    ↓
ActionsComponent (T139) → setButtonList registration (T140)
```

---

## Implementation Strategy

### MVP Scope (Ship US1 First)

Implement Phases 1 + 2 + 3 (T001–T140) as a complete working increment. This delivers the full UC-001 story: a developer can create any CRUD module in 15 minutes from a blank entity file. This is the highest-value deliverable per plan.md.

### Increment 2 (Add US2)

Layer Phase 4 (T141–T155) on top. Validation feedback, toasts, async validation, and dirty-state guard enhance the already-working CRUD flow without breaking existing functionality.

### Increment 3 (Add US3)

Layer Phase 5 (T156–T171) on top. Custom component overrides and lookup modals are additive features that don't break basic CRUD.

### Technical Risk Mitigations (from plan.md Risk Registry)

| Risk | Affected Tasks | Mitigation |
|------|---------------|-----------|
| tsconfig missing experimentalDecorators | T001, T006 | Phase 1 gates on this check |
| Circular import Application ↔ BaseEntity | T093–T106 | Use lazy `import()` in Application where BaseEntity methods are called (EXC-001) |
| @Mask unexported | T030, T175 | Decorator implemented but NOT added to index.ts until T175 Polish — ✅ now exported |
| Route collision from duplicate @ModuleName | T107–T108, T179 | Uniqueness check in ModuleList.push() added in T179 Polish |
| @AsyncValidation UX degradation | T023, T081, T141 | Debounce strategy or defer to save-time via short-circuit (L1+L2 must pass first) |

---

## Task Count Summary

| Phase | Tasks | Story | Parallelizable |
|-------|-------|-------|----------------|
| Phase 1: Setup | T001–T007 | — | 6 of 7 |
| Phase 2A: Decorator Foundation | T008–T009 | — | 0 |
| Phase 2B: Class Decorators | T010–T022 | — | 13 of 13 |
| Phase 2C: Property Decorators | T023–T040 | — | 18 of 18 |
| Phase 2D: Enums + Types | T041–T048 | — | 8 of 8 |
| Phase 2E: Models | T049–T056 | — | 8 of 8 |
| Phase 2F: BaseEntity | T057–T092 | — | 13 of 36 |
| Phase 2G: Application | T093–T106 | — | 4 of 14 |
| Phase 2H: Router | T107–T109 | — | 0 |
| Phase 2I: CSS | T110–T114 | — | 4 of 5 |
| Phase 2J: Composable | T115 | — | 0 |
| Phase 2K: Shell | T116–T118 | — | 0 |
| Phase 3: US1 | T119–T140 | US1 | 15 of 22 |
| Phase 4: US2 | T141–T155 | US2 | 9 of 15 |
| Phase 5: US3 | T156–T171 | US3 | 8 of 16 |
| Polish | T172–T181 | — | 9 of 10 |
| Polish (additions) | T182–T190 | T190=US1 | 8 of 9 |
| **TOTAL** | **191 tasks** | | **~115 parallelizable** |

**Per user story**:
- **US1**: 22 tasks (T119–T140)
- **US2**: 15 tasks (T141–T155)
- **US3**: 16 tasks (T156–T171)
