# Research: Framework SaaS Vue — Implementation Plan

**Branch**: `001-framework-saas-spec`
**Date**: 2026-02-26
**Phase**: 0 — Resolves all NEEDS CLARIFICATION from Technical Context

---

## 1. Resolved: Testing Strategy

**Decision**: No mandatory automated testing currently in place.

**Rationale**: Per `05-ENFORCEMENT-TECHNICAL-CONTRACT.md` §2: *"Testing automatizado: recomendado pero no obligatorio contractualmente"*. The framework operates in a manual-review enforcement model where the Architect is the authoritative gate.

**Planned path (Phase 8)**: Vitest + `@vue/test-utils` for unit and component tests; integration tests via Playwright. No test runner configuration exists today.

**Alternatives considered**:
- Jest: rejected (Vite-based project; Vitest is native)
- Cypress: deferred (E2E, planned Phase 8 alongside Playwright)

---

## 2. Resolved: Performance Goals

**Decision**:
- New-module onboarding: 15 minutes to functional CRUD (UC-001 acceptance criterion)
- List rendering with metadata: < 200 ms perceived (small-to-medium datasets)
- CRUD operations: < 1 s round-trip (delegated to backend; frontend overhead < 50 ms)
- LocalStorage persistence: synchronous, < 5 ms for typical entity size

**Rationale**: Derived directly from UC-001 scenario acceptance criteria in `spec.md`. The primary performance objective of the framework is **developer** productivity, not runtime throughput. Runtime performance follows Vue 3's native reactivity guarantees.

**Alternatives considered**: None — this is declarative from the spec.

---

## 3. Resolved: Constraints

**Decision**:
- **Platform**: Browser SPA only (Vue 3 + Vite bundle)
- **Offline persistence**: LocalStorage via `@Persistent` + `toStorage()` / `fromStorage()` — synchronous, no service worker required
- **API communication**: Axios (mandatory per constitution `VI. Tech Stack Immutability`); REST endpoints declared via `@ApiEndpoint`
- **State management prohibition**: No Pinia or Vuex (constitution explicitly prohibits); state lives in `BaseEntity` reactive properties + Vue reactivity system
- **Memory constraints**: Metadata stored on `BaseEntity.prototype` via Symbol keys; shared across all instances (zero per-instance overhead for metadata)

**Rationale**: All constraints derive from AXIOM A4 (immutable stack) and 6 registered exceptions in `EXCEPCIONES.md`. Exception EXC-001 covers the prototype-level Symbol indexing pattern which enables zero-overhead metadata.

---

## 4. Resolved: Scale & Scope

**Decision** (current state as of 2026-02-26):

| Layer | Count | Notes |
|---|---|---|
| Decorators | 31 | Fully catalogued in `layers/01-decorators/README.md` |
| BaseEntity method groups | 9 | CRUD, Validation, Lifecycle, Metadata, Persistence, State, Static, Additional |
| Application service files | 4 | Singleton, Router, EventBus, UI Services |
| UI Components | 35+ | Core(8), Form inputs(10), Layout(2), Modal(3), Buttons(2+), Informative(3+) |
| Views (auto-generated) | 3 | `default_listview`, `default_detailview`, `default_lookup_listview` |
| Composables | 1 | `useInputMetadata` |
| Active contractual exceptions | 6 | All in `EXCEPCIONES.md`, none violate MI LÓGICA |
| Breaking changes | 0 | Clean history as of this date |

**Rationale**: Enumerated from layer READMEs and spec catalog. No NEEDS CLARIFICATION remains.

---

## 5. Resolved: Implementation Ordering Dependencies

**Decision**: The correct topological build order is:

```
1. TypeScript config (experimentalDecorators, emitDecoratorMetadata)
2. Decorator infrastructure (Symbol keys + prototype storage)
3. BaseEntity core (abstract class + metadata access)
4. Validation system (depends on decorator metadata)
5. CRUD operations (depends on BaseEntity core + @ApiEndpoint)
6. Lifecycle hooks (depends on CRUD)
7. Persistence (depends on BaseEntity + @Persistent)
8. State management / dirty tracking (depends on BaseEntity core)
9. Application singleton (depends on BaseEntity class reference)
10. EventBus (depends on Application)
11. Router integration (depends on Application + ModuleList)
12. UI Services: Toast, Dialog, Loading (depends on Application)
13. Core UI components: TopBar, SideBar, Container (depends on Application)
14. Basic input components (depends on useInputMetadata + BaseEntity metadata)
15. useInputMetadata composable (depends on BaseEntity metadata layer)
16. Layout components (depends on core + basic inputs)
17. Advanced inputs: Array, Object, List (depends on basic inputs)
18. Modal system (depends on Application.modal service)
19. Advanced view components: DetailViewTable, List views (depends on @ViewGroup)
20. Advanced decorators: @ViewGroup, @AsyncValidation, @Unique (depends on full metadata system)
21. Enums, Types, Models (utility layer, no hard dependency)
22. Advanced router (guards, auto-routes — depends on Application + ModuleList)
```

**Rationale**: Derived from AXIOM A2 (unidirectional flow) — no component can consume a layer that doesn't exist yet. Dependency violations would break the prototype chain for metadata resolution.

---

## 6. Resolved: Future Phase Technology Choices

**Phase 8 — Performance & DX**:
- Virtual scrolling: `@tanstack/virtual` (framework-agnostic, tree-shakeable) — **Decision**: evaluate at implementation time; do not commit to specific library now
- CLI scaffolding: `commander` + `handlebars` templates — deferred evaluation  
- Hot reload: Vite HMR already covers this natively; decorator metadata HMR requires custom Vite plugin (planned)

**Phase 9 — i18n**:
- Vue I18n v9+ is Composition API compatible; metadata translation via `@PropertyName` accepting `{en, es}` object — architectural design needed

**Phase 10 — Plugins**:
- Plugin system must not violate AXIOM A1 (no new layers); plugins must be injection points within existing 5 layers
- Plugin Registry pattern: Application-level `PluginMap` using same Symbol-key metadata mechanism

---

## 7. Resolved: Contractual Compatibility Assessment

All planned phases (1-10) are compatible with MI LÓGICA:

| Phase | A1 (5 layers) | A2 (unidirectional) | A3 (metadata-driven UI) | A4 (stack) |
|---|---|---|---|---|
| 1-7 (implemented) | ✅ | ✅ | ✅ | ✅ |
| 8 (optimization) | ✅ | ✅ | ✅ | ✅ |
| 9 (i18n, theming) | ✅ | ✅ | ✅* | ✅ |
| 10 (plugins) | ✅** | ✅ | ✅ | ✅ |

*Phase 9 i18n: `@PropertyName` must accept locale-keyed objects; metadata structure change requires architect authorization as potential breaking change.

**Phase 10 plugins: Must be implemented as injection points within existing layers — new "plugin layer" would violate A1.

---

## Summary

All NEEDS CLARIFICATION items resolved. No blockers for Phase 1 design.

**Key findings**:
1. Framework is fully implemented through Phase 7 as of 2026-02-26
2. Zero breaking changes; 6 active exceptions (none MI LÓGICA violations)
3. Build order follows strict topological sort constrained by AXIOM A2
4. Future phases (8-10) are architecturally compatible with all 4 axioms
5. Testing (Phase 8) is the largest technical debt item
