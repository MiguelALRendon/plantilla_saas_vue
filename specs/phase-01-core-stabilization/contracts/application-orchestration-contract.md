# Contract: Application Orchestration Stability

**Phase**: 01 - Core Stabilization | **Last updated**: 2026-03-25

## Purpose

Define stable orchestration behavior for module registration, view transitions, and UI state signaling as delivered in phase 01.

## Interface Commitments

1. Module registration produces deterministic sidebar and routing availability. Modules without `@Persistent` are registerable but do not expose list/CRUD API actions.
2. View transitions preserve dirty-state protections before destructive navigation.
3. Loading, toast, and dialog interactions are centralized through Application services. No component issues its own loading-state change outside Application orchestration.
4. Navigation helpers do not bypass core view state updates.
5. All navigation entry points (sidebar, profile dropdown, configuration action, and programmatic redirects) delegate to a single centralized dirty-guard orchestration path.

## Routing and View Rules

1. Registered module → list/default/detail views reachable by canonical routes.
2. View changes update `Application.View` before rendering dependent components.
3. When dirty-state protection triggers, confirmation flow must resolve before route/view switch.
4. All navigation entry points use a single dirty-guard orchestration path.
5. Post-confirmation transition ordering is canonical: `loading start → view transition → router sync → loading end → button-list refresh`.
6. `Application.View`, `Application.AppConfiguration`, and `Application.ModuleList` are backed by Pinia reactive state. The three Pinia stores are `appConfig`, `view`, and `ui`. `Application.ModuleList` is backed by `moduleList`, a `ref` inside the `view` store extracted via `storeToRefs(viewStore).moduleList` in `src/models/application.ts` — there is no separate `moduleList` Pinia store. `Application.ListButtons` is similarly backed by `listButtons`, a `ref` extracted from the `view` store via `storeToRefs`. Callers continue to access these as `Ref<T>` properties — no breaking change.

## Error Handling

1. API and validation failures map to user-visible notifications via toast or dialog.
2. Orchestration errors are inspectable through development console logs.
