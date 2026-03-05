# Implementation Plan: Framework SaaS Vue — Arquitectura de 5 Capas

**Branch**: `001-framework-saas-spec` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-framework-saas-spec/spec.md`

---

## Summary

Retrospective and forward-looking implementation plan for the SaaS Vue Meta-Programming Framework — a Vue 3 + TypeScript system that auto-generates complete CRUD interfaces from decorator metadata. Phases 1-7 are fully implemented as of 2026-02-26. Phases 8-10 constitute the planned evolution roadmap.

The framework's core value proposition: **declare an entity once via decorators → framework generates sidebar entry, list view, detail form, validation, persistence, and CRUD operations automatically** (UC-001: achievable in 15 minutes).

---

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`) + Vue 3.x (Composition API)
**Primary Dependencies**: Vue 3, Vite (build), Axios (HTTP), Vue Router, mitt (EventBus)
**Storage**: LocalStorage (via `@Persistent` decorator) + REST API via Axios
**Testing**: None currently (optional per `05-ENFORCEMENT`); planned Phase 8 — Vitest + `@vue/test-utils`
**Target Platform**: Browser SPA (Vite bundle)
**Project Type**: Web application framework (meta-programming library + reference SPA)
**Performance Goals**: 15-minute new-module onboarding (UC-001); < 200ms list rendering for typical datasets
**Constraints**: Metadata MUST reside on `BaseEntity.prototype` via Symbols; stack is immutable per AXIOM A4; no Pinia/Vuex permitted
**Scale/Scope**: 31 decorators, 35+ UI components, 9 BaseEntity method groups, 4 Application service files, 1 composable

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### MI LÓGICA Verification (4 AXIOMS - NON-NEGOTIABLE)

- [x] **A1 [5-Layer Architecture]**: All implementation phases map to exactly one of 5 layers: Entities → Decorators → BaseEntity → Application → UI. No intermediate layers exist or are planned.
- [x] **A2 [Unidirectional Flow]**: Data flows strictly Entity → Decorators → Metadata → BaseEntity → Application → UI. No layer skips, no bidirectional flows.
- [x] **A3 [Metadata-Driven UI]**: All form generation, table rendering, validation and column layout are derived exclusively from decorators. No UI component contains non-metadata business logic.
- [x] **A4 [Tech Stack Immutability]**: Stack is TypeScript + Vue 3 + Decorators (Vite + Axios auxiliary). Zero external state managers. No stack substitution in any of Phases 1-10.

**Result: ALL AXIOMS PASS ✅ — Plan proceeds.**

### Core Principles Verification

- [x] **SPEC-FIRST**: `spec.md` exists and was created before plan; `data-model.md` and `contracts/` document design before code changes
- [x] **Documentation Sync**: Plan phases require documentation updates before code; `research.md` + `data-model.md` + `contracts/` + `quickstart.md` all created
- [x] **Architectural Authorization**: No new layers introduced; all future phases (8-10) are injection points or extensions within existing 5-layer model
- [x] **Contract Hierarchy**: `00-CONTRACT.md` → `05-ENFORCEMENT` → `04-UI-DESIGN` → `06-CODE-STYLING` reviewed as part of constitution load
- [x] **Folder Indexes**: Layer READMEs maintained; `.specify/memory/constitution.md` as central memory
- [x] **11-Section Structure**: Not applicable to plan artifacts; applies to `/copilot/layers/` documentation files
- [x] **NO /src/ Documentation**: Confirmed — all documentation in `/copilot/` and `/specs/`. No README files in `/src/`

### Breaking Change Assessment

- [x] Phases 1-7 (retrospective): Zero breaking changes registered — clean history confirmed in `BREAKING-CHANGES.md`
- [x] Phases 8-10 (future): Phase 9 i18n may require `@PropertyName` signature change → MUST register in `BREAKING-CHANGES.md` before implementation
- [x] 6 active contractual exceptions in `EXCEPCIONES.md` — none violate MI LÓGICA; all pre-authorized

---

## Project Structure

### Documentation (this feature)

```text
specs/001-framework-saas-spec/
├── plan.md              ← This file (speckit.plan output)
├── research.md          ← Phase 0: resolved unknowns
├── data-model.md        ← Phase 1: entity + metadata schemas
├── quickstart.md        ← Phase 1: 15-minute new module guide
├── contracts/
│   ├── base-entity-contract.md   ← BaseEntity public API
│   ├── decorator-contract.md     ← All 31 decorators catalog
│   └── application-contract.md  ← Application singleton API
└── tasks.md             ← Phase 2 output (speckit.tasks — NOT created by this command)
```

### Source Code (repository root)

```text
src/
├── decorations/         # Layer 2: 31 decorator implementations
│   ├── index.ts         # Barrel export of all decorators
│   └── *_decorator.ts   # Individual decorator files
├── entities/            # Layer 1: Domain entity class declarations
│   └── *.ts
├── models/              # Layer 2-3: BaseEntity + Application singleton
│   ├── BaseEntity.ts    # Abstract base class (Layer 2-3 boundary)
│   └── application.ts   # Singleton orchestrator (Layer 3)
├── components/          # Layer 4: 35+ Vue components
│   ├── Form/            # Input components
│   ├── Buttons/         # Action buttons
│   ├── Modal/           # Modal dialogs
│   ├── Informative/     # Read-only display components
│   └── *.vue            # Core layout components
├── composables/         # Layer 4 composables
│   └── useInputMetadata.ts
├── views/               # Auto-generated default views
│   ├── default_listview.vue
│   ├── default_detailview.vue
│   └── default_lookup_listview.vue
├── router/
│   └── index.ts         # Vue Router + auto-route generation
├── types/               # Shared TypeScript types
├── enums/               # Domain enums
├── validators/          # Predefined validator functions for @Validation
└── css/
    ├── constants.css    # CSS custom properties / design tokens
    ├── main.css
    ├── form.css
    └── table.css
```

**Structure Decision**: Single SPA project. No backend (framework is API-agnostic). Source organized by architectural layer.

## Complexity Tracking

*No constitution violations in this plan — table omitted.*

---

## Implementation Phases

### Phase 1: Fundamentos — Decorators + BaseEntity Core
**Status**: ✅ IMPLEMENTED
**Objective**: Establish the metadata infrastructure: the prototype-based Symbol storage system and the abstract entity class that consumes it.

**Deliverables**:
- TypeScript configuration with `experimentalDecorators: true` and `emitDecoratorMetadata: true`
- `src/decorations/` — Symbol key definitions + decorator factories (class + property decorators)
- `src/models/BaseEntity.ts` — abstract class, constructor, `getMetadata()`, `getPropertyMetadata()`, `getVisibleProperties()`
- Basic validation: `@Required`, `@Validation`, `validateInputs()`, `validateProperty()`

**Dependencies**: None — foundational layer.

**Completion criteria**:
- Entity class with `@ModuleName` + `@PropertyName` can yield metadata via `getMetadata()`
- `validateInputs()` returns `false` + populates `_errors` when `@Required` property is empty
- TypeScript compiles with strict mode on

**Risks**:
- `experimentalDecorators` + `emitDecoratorMetadata` require exact tsconfig; omission silently breaks metadata
- Symbol key collisions if decorator files don't use module-scoped Symbols

---

### Phase 2: CRUD y Persistencia
**Status**: ✅ IMPLEMENTED
**Objective**: Enable full Create/Read/Update/Delete lifecycle and LocalStorage persistence.

**Deliverables**:
- `save()`, `update()`, `delete()`, `getElement()`, `getElementList()`, `refresh()` on BaseEntity
- Lifecycle hooks: `beforeSave`, `afterSave`, `beforeLoad`, `afterLoad`, `beforeDelete`, `afterDelete`
- `toStorage()`, `fromStorage()`, `toJSON()`, `fromJSON()`, `clone()`, `isDirty()`
- `@PersistentKey`, `@Persistent` (property-level), LocalStorage integration
- `deepEqual()` + `deepClone()` utilities for dirty-state tracking (Phase 1 update: Feb 18, 2026)

**Dependencies**: Phase 1 (`@ApiEndpoint`, `@ApiMethods`, `@PrimaryProperty`, `@Persistent` class-level must exist)

**Completion criteria**:
- `save()` on new entity sends `POST`; on existing entity sends `PUT` with correct URL
- `delete()` sends `DELETE` and fires lifecycle hooks
- `isDirty()` returns `true` after property mutation, `false` after successful `save()`
- `toStorage()` only serializes `@Persistent`-marked properties

**Risks**:
- Axios configuration must be done before first CRUD call — Application singleton must exist
- Dirty tracking with `deepClone` on large nested entities may have performance implications

---

### Phase 3: Application Layer — Singleton, EventBus, UI Services
**Status**: ✅ IMPLEMENTED
**Objective**: Create the global orchestrator bridging entities, router, and UI.

**Deliverables**:
- `src/models/application.ts` — singleton with `View`, `ModuleList`, `router`, `axiosInstance`
- `EventBus` (mitt-based `emit`, `on`, `off`) with standard events catalog
- Toast service, Dialog/Modal service, Confirmation service, Loading service
- `ApplicationDataService` — auxiliary data transformation using entity metadata (Feb 18, 2026 addition)

**Dependencies**: Phase 1 + Phase 2

**Completion criteria**:
- `Application.ModuleList.value.push(SomeEntity)` causes sidebar to re-render reactively
- `Application.showToast(...)` auto-dismisses after `duration` ms
- Standard EventBus events emit/receive correctly (entity:saved, entity:deleted, etc.)

**Risks**: Circular imports between `application.ts` ↔ `BaseEntity.ts` — covered by EXC-001

---

### Phase 4: Componentes UI Base
**Status**: ✅ IMPLEMENTED
**Objective**: Core layout shell + basic input components.

**Deliverables**:
- Core: `TopBarComponent`, `SideBarComponent`, `SideBarItemComponent`, `ComponentContainerComponent`, `LoadingScreenComponent`
- Navigation: `TabComponent`, `TabControllerComponent`, `DropdownMenuComponent`
- Basic inputs: `TextInputComponent`, `NumberInputComponent`, `BooleanInputComponent`, `DateInputComponent`
- `useInputMetadata` composable (extracts decorator metadata for input rendering)

**Dependencies**: Phase 3 (all components consume `Application.View`, `Application.ModuleList`)

**Completion criteria**:
- Sidebar renders one entry per `Application.ModuleList` entry using `@ModuleName` + `@ModuleIcon` metadata
- `useInputMetadata(entity, propertyKey)` returns `{ label, type, required, helpText, disabled, errors }`
- Composition API migration completed for priority components (ActionsComponent, FormGroupComponent, DetailViewTableComponent — Feb 18, 2026)

**Risks**: `useInputMetadata` is the critical path — incorrect metadata extraction breaks all form rendering

---

### Phase 5: Componentes Avanzados
**Status**: ✅ IMPLEMENTED
**Objective**: Complex inputs, modal system, and auto-generated views.

**Deliverables**:
- Complex inputs: `ArrayInputComponent`, `ObjectInputComponent`, `ListInputComponent` + lookup
- Modal system: `DialogComponents`, confirmation dialogs, modal overlay
- Views: `DetailViewTableComponent` (renders `@ViewGroup` sections), `default_listview`, `default_detailview`, `default_lookup_listview`
- `ActionsComponent` (dynamic action buttons from Application.View context)

**Dependencies**: Phase 4 (complex inputs wrap basic inputs; views depend on full component system)

**Completion criteria**:
- `ArrayInputComponent` can add/remove items; each item rendered by correct input type
- `DetailViewTableComponent` groups properties by `@ViewGroup` in correct `@ViewGroupRow` order
- `default_listview` shows only properties without `@HideInListView`

**Risks**: `ObjectInputComponent` recursive rendering depth; `ListInputComponent` requires related entity in `ModuleList`

---

### Phase 6: Decoradores Avanzados
**Status**: ✅ IMPLEMENTED
**Objective**: Complete the 31-decorator catalog.

**Deliverables**:
- UI layout: `@ViewGroup`, `@ViewGroupRow`, `@HideInListView`, `@HideInDetailView`, `@TabOrder`, `@CSSColumnClass`
- State: `@Disabled` (static + dynamic fn), `@ReadOnly`
- Display: `@DisplayFormat`, `@Mask`, `@HelpText`, `@StringTypeDef`
- Validation: `@AsyncValidation`, `@Unique`
- Module UI overrides: `@ModuleCustomComponents`, `@ModuleListComponent`, `@ModuleDetailComponent`, `@ModuleDefaultComponent`

**Dependencies**: Phases 1-5 (decorators need UI consumers to be meaningful)

**Completion criteria**:
- `@ViewGroup('Pricing')` causes `DetailViewTableComponent` to render a "Pricing" section
- `@Disabled(e => e.status === 'closed')` dynamically disables input
- `@AsyncValidation` short-circuits after sync failures

**Risks**: `@AsyncValidation` with slow endpoints can degrade UX — debounce strategy needed

---

### Phase 7: Sistema Avanzado — Enums, Types, Router, Composables
**Status**: ✅ IMPLEMENTED
**Objective**: Complete auxiliary systems for entity modeling and auto-navigation.

**Deliverables**:
- `src/enums/`, `src/types/`, `src/models/` auxiliary interfaces
- `src/validators/common_validators.ts` — predefined `@Validation`-compatible catalog
- Auto-route generation: `/:moduleName`, `/:moduleName/new`, `/:moduleName/:id`
- Permission guards from `@ModulePermission`
- Application navigation helpers: `navigateToList()`, `navigateToDetail()`, `navigateToNew()`

**Dependencies**: All Phases 1-6

**Completion criteria**:
- Registering `Product` auto-creates `/products`, `/products/new`, `/products/:id` routes
- `@ModulePermission('admin')` blocks route for unauthorized users
- `common_validators.ts` exports validators directly usable with `@Validation`

**Risks**: Route name collisions from duplicate `@ModuleName` values — uniqueness validation required

---

### Phase 8: Optimización y Developer Experience *(PRÓXIMO)*
**Status**: 🔜 PLANNED
**Objective**: Performance improvements and developer tooling.

**Deliverables**:
- Lazy loading of view components (`defineAsyncComponent`)
- Virtual scrolling for large lists
- Metadata caching to avoid prototype lookups on every render tick
- CLI scaffolding: `npx framework-cli generate:entity EntityName`
- Vite plugin for decorator HMR metadata invalidation
- Vitest + `@vue/test-utils` test setup; decorator metadata test utilities
- Playwright E2E setup

**Dependencies**: Phases 1-7 fully stable

**Completion criteria**:
- 1000+ row list renders without perceptible jank
- `npx framework-cli generate:entity` produces a correctly decorated entity file
- Vitest can assert decorator metadata in unit tests

**Risks**: Virtual scrolling changes DOM structure; Vite HMR + decorators is a known edge case

---

### Phase 9: Features Adicionales — i18n, Multi-tenancy, Theming *(FUTURO)*
**Status**: 📅 FUTURE
**Objective**: Internationalization, multi-tenant, and advanced theming.

**Deliverables**:
- Vue I18n v9+ integration; `@PropertyName` extended to accept locale maps
- Multi-tenant context in Application with Axios interceptor for tenant headers
- Dynamic theme switching; extended CSS custom properties; theme builder

**Dependencies**: Phase 8 stable

**⚠ Breaking Change Warning**: `@PropertyName` signature extension is a BREAKING CHANGE — MUST register in `BREAKING-CHANGES.md` and obtain Architect authorization before implementation.

**Risks**: `@PropertyName` migration affects all existing entity classes — migration tooling required

---

### Phase 10: Ecosystem — Plugins, Marketplace *(FUTURO LEJANO)*
**Status**: 📅 FUTURE (Post-Phase 9)
**Objective**: Third-party extension ecosystem without violating 5-layer architecture.

**Deliverables**:
- `Application.registerPlugin(plugin)` — injection-point-only plugin system (AXIOM A1: no new layers)
- Plugin Registry with metadata (name, version, compatibility)
- External decorator support following Symbol-key + prototype storage contract
- Module template library (e.g., `AuditableEntity` with `createdAt`, `updatedAt`)

**Dependencies**: Stable API surface from Phases 1-9; `contracts/` documents serve as external-facing spec

**⚠ AXIOM A1 Guard**: Plugins MUST be injection points only — no new architectural layers permitted.

---

## Dependency Graph

```
Phase 1 (Decorators + BaseEntity Core)
    ↓
Phase 2 (CRUD + Persistence)
    ↓
Phase 3 (Application Singleton)
    ↓
Phase 4 (UI Base Components)
    ↓
Phase 5 (Advanced Components)
    ↓  ↗ (Phase 6 can partially parallel Phase 5)
Phase 6 (Advanced Decorators)
    ↓
Phase 7 (Enums, Router, Types)
    ↓
Phase 8 (Optimization + DX)
    ↓
Phase 9 (i18n, Multi-tenancy)
    ↓
Phase 10 (Plugins + Ecosystem)
```

**Parallelizable in future phases**:
- Phase 8: Vitest setup ∥ virtual scrolling ∥ CLI tool
- Phase 9: i18n ∥ multi-tenancy ∥ theming
- Phase 10: Plugin system ∥ Marketplace ∥ Module templates

---

## Risk Registry

| Risk | Phase | Severity | Mitigation |
|---|---|---|---|
| `experimentalDecorators` tsconfig omission | 1 | HIGH | Document in Quickstart; tsconfig check in CI (Phase 8) |
| Circular import: Application ↔ BaseEntity | 3 | HIGH | Covered by EXC-001 lazy import pattern |
| `@PropertyName` breaking change for i18n | 9 | HIGH | Register in BREAKING-CHANGES.md; migration tool required |
| Plugin introducing new architectural layers | 10 | CRITICAL | Plugin spec enforces injection-point-only pattern |
| Virtual scrolling breaks CSS column layout | 8 | MEDIUM | Abstract column width calculation from DOM position |
| `@AsyncValidation` UX degradation | 6 | MEDIUM | Debounce or defer to save-time execution |
| Route collision from duplicate `@ModuleName` | 7 | MEDIUM | Uniqueness validation at `ModuleList.push()` |

---

## Technical Debt Registry

| Item | Introduced | Phase to Resolve | Notes |
|---|---|---|---|
| No automated tests | Phases 1-7 | Phase 8 | Optional per `05-ENFORCEMENT`; highest DX debt |
| EXC-004: Explicit typing pending in legacy block | Phase 4-5 | Phase 8 | Tracked in `EXCEPCIONES.md` |
| EXC-005: Inline logic in Vue legacy templates | Phase 4 | Phase 8 | 3 components migrated Feb 18, 2026 |
| EXC-006: Region comments pending in legacy | Phase 4-5 | Phase 8 | New code compliant; legacy retrofitting needed |
| No CLI scaffolding | All | Phase 8 | Developer must manually write all decorator boilerplate |
