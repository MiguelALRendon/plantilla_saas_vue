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
