# Contract: Application Orchestration Stability

## Purpose

Define stable orchestration behavior for module registration, view transitions, and UI state signaling.

## Interface Commitments

1. Module registration must produce deterministic sidebar and routing availability.
2. View transitions must preserve dirty-state protections before destructive navigation.
3. Loading, toast, and dialog interactions must remain centralized through Application services.
4. Navigation helpers must not bypass core view state updates.

## Routing and View Rules

1. Registered module -> list/default/detail views remain reachable by canonical routes.
2. View changes must update `Application.View` before rendering dependent components.
3. When dirty-state protection triggers, confirmation flow must resolve before route/view switch.
4. All navigation entrypoints (sidebar, profile dropdown actions, configuration actions, and programmatic view redirects) must delegate to a single dirty-guard orchestration path.
5. Post-confirmation transition ordering is canonical: loading start -> view transition -> router sync -> loading end -> button-list refresh.

## Error Handling

1. API and validation failures must map to user-visible notifications.
2. Orchestration errors must be inspectable through development logs.
