# Data Model: Phase 01 - Core Stabilization

**Branch**: `phase-01-core-stabilization`
**Date**: 2026-03-05
**Phase**: 1 - Design and contracts

## 1. Stabilization Domain Entities

### 1.0 ExtraFunctions

Represents one custom method action surfaced in action bars.

Fields:
- `icon: GGIconKey`
- `text: string`
- `viewTypes: ViewTypes[]`
- `fn: () => unknown`

Validation rules:
- `fn` must be bound to the current entity instance before UI execution.
- `viewTypes` drives visibility; button appears only when current view matches.

### 1.1 ModuleStabilityProfile

Represents stability expectations for a registered module.

Fields:
- `moduleName: string`
- `apiEndpoint: string`
- `allowedMethods: string[]`
- `hasRequiredMetadata: boolean`
- `uiGenerationMode: 'metadata-driven'`
- `lastVerificationAt: string`

Validation rules:
- `moduleName` and `apiEndpoint` are mandatory.
- `allowedMethods` must include at least `GET` for list/detail navigation consistency.
- `uiGenerationMode` is fixed to `metadata-driven` (A3 guard).

### 1.2 CrudLifecycleState

Represents runtime lifecycle consistency checkpoints for an entity operation.

Fields:
- `isLoading: boolean`
- `isDirty: boolean`
- `isValid: boolean`
- `operation: 'load' | 'create' | 'update' | 'delete'`
- `phase: 'guard' | 'validate' | 'persist' | 'reconcile' | 'notify'`
- `errorMessage?: string`

Validation rules:
- `phase` transition must follow canonical order.
- `persist` phase cannot execute if `isValid` is false.

### 1.3 ProductionReadinessChecklist

Represents criteria to ship first functional version.

Fields:
- `buildDeterministic: boolean`
- `envConfigured: boolean`
- `routingSmokePass: boolean`
- `crudSmokePass: boolean`
- `errorSurfacingPass: boolean`
- `releaseCandidate: boolean`

Validation rules:
- `releaseCandidate` can be true only when all other fields are true.

### 1.4 Configuration

Represents editable application-level configuration as a `BaseEntity` implementation.

Fields:
- Mirrors current `AppConfiguration` contract fields.
- Includes `isDarkMode` and `selectedLanguage` as persisted settings.

Validation rules:
- Configuration save flow must persist to localStorage via entity method.
- Configuration entity is operational but not registered in `ModuleList`.

## 2. Existing Framework Entities in Scope

### 2.1 BaseEntity (existing, stabilized behavior)

Key stabilized behaviors:
- Metadata access and property ordering.
- CRUD guards for endpoint/method configuration.
- Validation chain ordering and error assignment.
- Dirty-state and loading-state updates around persistence.

### 2.2 Application (existing singleton, stabilized orchestration)

Key stabilized behaviors:
- Module registration consistency.
- View transitions and route-oriented context updates.
- Centralized UI signaling for loading, dialogs, and toasts.

## 3. Relationships

1. `ModuleStabilityProfile` is derived from class-level and property-level metadata of `BaseEntity` descendants.
2. `CrudLifecycleState` maps 1:1 to each runtime operation invoked through `BaseEntity` methods and coordinated by `Application` view state.
3. `ProductionReadinessChecklist` aggregates outcomes from smoke checks over routing, CRUD, and error surfacing behavior.

## 4. State Transitions

### 4.1 CRUD Lifecycle

`guard -> validate -> persist -> reconcile -> notify`

Transition constraints:
- `guard` failure ends flow with `notify` error.
- `validate` failure skips `persist` and ends with `notify` error.
- `persist` success must be followed by state reconciliation (`isDirty=false` where applicable).

### 4.2 Release Readiness

`draft -> smoke-verified -> release-candidate`

Transition constraints:
- Move to `smoke-verified` only if routing and CRUD checks pass.
- Move to `release-candidate` only if production env and error surfacing checks pass.

## 5. Contract Alignment Notes

- A1: no new layer modeled.
- A2: transitions follow unidirectional orchestration.
- A3: module profile is metadata-derived.
- A4: no stack change implied by model.
