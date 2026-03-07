# Research: Phase 01 - Core Stabilization

**Branch**: `phase-01-core-stabilization`
**Date**: 2026-03-05
**Phase**: 0 - Clarification and technical decisions

## 1. Production hardening baseline

Decision: Use a production baseline centered on deterministic build, env-driven API configuration, and runtime smoke validation.

Rationale: The framework already has the required stack and layered architecture. The main production risk is configuration drift and silent runtime inconsistency, not missing framework primitives.

Alternatives considered:
- Full platform redesign before first release: rejected due to high risk and violation of stabilization objective.
- Introduce new external state management: rejected by constitution (A4) and unnecessary for core stabilization.

## 2. CRUD lifecycle consistency

Decision: Define canonical lifecycle order for all module CRUD flows:
1. Metadata guards
2. Validation sequence (required -> sync -> async)
3. Loading state handling
4. API call
5. View/state update
6. Success or failure surfacing

Rationale: Most instability in metadata-driven systems comes from out-of-order lifecycle operations. Stabilizing execution order reduces behavioral divergence across modules.

Alternatives considered:
- Allow per-component lifecycle customization: rejected because it introduces nondeterminism and weakens A3.
- Add bypass flags to skip guards: rejected as it undermines reliability goals.

## 3. Observability and failure surfacing

Decision: Keep observability minimal and framework-native:
- Surface all user-visible failures via toast/dialog patterns.
- Keep structured console logging for diagnostic traces in development.
- Standardize error payload mapping for API responses.

Rationale: This approach improves diagnosability while preserving current architecture and avoiding non-essential dependencies.

Alternatives considered:
- Add full external telemetry stack now: deferred; useful but out of scope for first stabilization phase.

## 4. First functional production version definition

Decision: The first functional version is complete when all of the following pass:
- At least one representative module executes end-to-end CRUD reliably.
- Routing and view transitions are stable under normal usage.
- Validation and dirty-state protections work predictably.
- Production build and startup flow is reproducible with documented steps.

Rationale: A usable first version requires operational confidence, not full feature completeness.

Alternatives considered:
- Wait for full automation test suite before release: deferred to a post-stabilization phase.

## 5. Constraints and architectural compatibility

Decision: Core stabilization remains strictly inside MI LOGICA bounds:
- 5-layer architecture unchanged.
- Unidirectional data flow enforced.
- Metadata-driven UI behavior preserved.
- TypeScript + Vue 3 + Decorators stack unchanged.

Rationale: Stabilization must increase reliability without changing architectural identity.

Alternatives considered:
- Introducing a mid-layer abstraction for flexibility: rejected as A1 violation risk.

## 6. Assumptions for Decorator Additions

1. `@OnViewFunction` metadata is attached to methods only and consumed by action-bar composition.
2. Invalid placement of `@OnViewFunction` (class/property) is ignored with no runtime failure.
3. `@NotRequiresLogin()` is metadata-only in this phase and does not alter routing/guard behavior yet.

## 7. Technical Debt: Login Integration

`@NotRequiresLogin()` is introduced now as a contract marker only. Login/authorization guards must consume this metadata in a dedicated authentication phase.

Login-phase TODO references:

1. Add route guard integration that checks `entity.isNotRequiresLogin()` before auth enforcement.
2. Add module-level auth policy documentation with precedence over per-entity exemptions.
3. Add automated tests covering mixed protected/open modules.

## Summary

All prior unknowns are resolved for planning scope. No constitutional blocker was identified.
Phase 1 design can proceed directly to data model, contracts, and quickstart artifacts.

## Implementation Handoff Summary

1. Foundational metadata and decorators for custom actions and login exemption are implemented.
2. Action-bar rendering now supports method-driven, view-filtered custom buttons.
3. Configuration management moved into `Configuration` entity with local persistence path.
4. Startup modules include `Home` and no longer include legacy `Customer`.
5. Remaining work should focus on dedicated login phase behavior and automation depth.

---

## Phase 2 Post-Analysis Technical Debts

Added after Phase 01 post-mortem analysis (2026-03-06). All items are formally tracked as open debts.

### TD-01: Platform Clarification — CSR-First Architecture

**Status**: RESOLVED (clarification only)

This framework is a **CSR-first (Client-Side Rendering)** SaaS template. Although some utilities may be compatible with SSR environments, the architecture is not designed for SSR and the majority of its patterns (singleton, `window` access, `localStorage`, reactive refs) assume a browser context. No SSR support is planned. Any future SSR work would require a dedicated phase.

### TD-02: Authentication Flow

**Status**: OPEN — Technical Debt

The current authentication implementation has the following known issues:
1. JWT access token stored in `localStorage` — vulnerable to XSS (OWASP A07).
2. No refresh token rotation on 401 — token revocation requires manual logout.
3. `logout()` in `TopBarComponent` was a stub (`console.log`), addressed in Phase 2 (T099).
4. When 401 is received, refresh token (`authRefreshTokenKey`) is not cleared alongside the access token.

**Remediation scope**: Dedicated auth phase. Options include: HttpOnly cookie strategy (requires backend coordination), in-memory token with refresh cycle, or short-lived JWT with sliding refresh.

Cross-references: T099 (logout fix in Phase 2), T052 (login guard tech debt from Phase 1).

### TD-03: Automated Testing — Zero Coverage Baseline

**Status**: OPEN — Technical Debt

The project has a zero automated-test baseline. No unit, integration, or E2E tests exist. This means:
1. Decorator metadata extraction regressions are undetected.
2. Validator logic is not verified for edge cases.
3. Application state machine transitions have no regression harness.
4. Form rendering correctness depends entirely on manual smoke checks.

**Remediation scope**: Adopt Vitest (native Vite integration). Priority coverage: `BaseEntity` static methods, `common_validators.ts`, Pinia stores (after US5), `useInputMetadata.ts`.

### TD-04: @NotRequiresLogin Router Guard Integration

**Status**: OPEN — Technical Debt

`@NotRequiresLogin()` decorator is implemented as metadata-only (T049–T053). The `router/index.ts` guard does NOT consume `isNotRequiresLogin()` for auth enforcement. Until this is wired, the decorator has no runtime effect on routing.

**Remediation scope**: Dedicated login/auth phase. The guard implementation requires a concrete auth session service to check against.

Cross-references: T052, T053 (Phase 1 debt markers), T109 (Phase 2 debt marker).

### TD-05: Field-Level and Action-Level Permission System

**Status**: OPEN — Technical Debt

`@ModulePermission` decorator exists and is stored in metadata, but no runtime permission enforcement is implemented in:
- Column rendering (should hide/disable columns based on user role)
- Action buttons (should suppress buttons not permitted for current user)
- Detail form fields (should disable fields the user cannot edit)

**Remediation scope**: Depends on auth phase being complete (requires a user session with role information). Design should use `Application.ApplicationUIService` to inject permission context.

### TD-06: Breadcrumb Navigation — Explicitly Not Required

**Status**: CLOSED — Architectural Decision

Breadcrumb navigation was evaluated and **explicitly decided to not be required** for this system. The current `TopBarComponent` showing module name + icon is sufficient for navigation context. This decision is final for the current scope and should be re-evaluated only if multi-level entity hierarchies are introduced.

---

### TD-07: Async Validation Debounce — Evaluation Deferred

**Status**: OPEN — Technical Debt

The debounce wrapper in `useInputMetadata.ts` (T131) is implemented: `isAsyncValidation(propertyKey)` calls are delayed by `Application.AppConfiguration.value.asyncValidationDebounce` ms (default 300 ms, configurable via `VITE_ASYNC_VALIDATION_DEBOUNCE`). However, correctness verification requires at least one entity property carrying a real `@AsyncValidation` decorator wired to an external or mock endpoint.

Until such a scenario is available in the project, the feature is functionally untestable against observable behaviour. The current `product.ts` has the commented-out `AsyncValidators` import but no active `@AsyncValidation` usage.

**Remediation scope**: Add a local mock async validator to `product.ts` (e.g. on the `email` field simulating a duplicate-check) and document the debounce smoke-test steps in `quickstart.md`.

Cross-references: T129–T131 (debounce implementation in Phase 15), T023 / T081 (decorator + BaseEntity accessor).

---

## Phase 2 Implementation Summary (T081–T133)

**Completed**: All 53 tasks across Phases 8–16 implemented.

### Key decisions made during implementation

| Area | Decision |
|------|----------|
| Pinia bootstrap timing | `setActivePinia(createPinia())` called before `Application.initializeApplication()` in `main.ts` so stores are usable before the Vue app mounts. |
| ApplicationClass public API | `Application.AppConfiguration`, `Application.View`, `Application.ModuleList`, etc. remain `Ref<T>` properties; now backed by Pinia `storeToRefs()` instead of bare `ref()`. No breaking change for callers. |
| InputRegistry | Module-level singleton (`inputRegistry`) with `register()`/`resolve()`. 16 input types registered via dedicated `OBJECT_TYPE_SENTINEL` and `ENUM_TYPE_SENTINEL` symbols to avoid type-constructor collisions. |
| useFormRenderer composable | Wraps `inputRegistry.resolve()` + model value helpers (get/set). Used by `default_detailview.vue` to replace the 16-branch v-if cascade. |
| Module composite decorator | `@Module(config)` chains `@ModuleName`, `@ModuleIcon`, `@ApiEndpoint`, `@ApiMethods`, `@Persistent` in a single call. Individual decorators remain available. |
| Async validation debounce | `useInputMetadata` now debounces `entity.isValidation()` calls using `Application.AppConfiguration.value.asyncValidationDebounce` (env: `VITE_ASYNC_VALIDATION_DEBOUNCE`, default 300 ms). |
| BaseEntity index type | Narrowed from `unknown` to `string \| number \| boolean \| Date \| BaseEntity \| BaseEntity[] \| object \| null \| undefined` to reduce type-casting noise. |
| system_name.png | Placeholder asset; replace with actual brand logo before production deployment. |
