# Contract: Metadata-Driven UI Stability

**Phase**: 01 - Core Stabilization | **Last updated**: 2026-03-25

## Purpose

Ensure list/detail UI behavior remains a deterministic function of decorator metadata, as delivered in phase 01.

## Interface Commitments

1. Visible list columns derive from property metadata and visibility decorators.
2. Detail input composition derives from property type and decorator metadata. Input type resolution uses `InputRegistry` with `OBJECT_TYPE_SENTINEL` and `ENUM_TYPE_SENTINEL` symbols for collision-free disambiguation.
3. Validation messages and help texts derive from metadata and entity validation state.
4. Custom component overrides remain explicit and module-scoped.

## Rendering Guarantees

1. Properties without display metadata are excluded from generated UI.
2. Grouping and ordering logic follows metadata ordering contracts.
3. Conditional disabled/readonly behavior evaluates from decorator contracts only.
4. Table pagination/footer controls remain anchored to the visible container width; only header/body regions scroll horizontally.
5. Sidebar expanded layout preserves three regions: header (logo-only), body (module navigation), footer (app title + copyright + version).
6. Sidebar collapsed layout hides all module text labels; entries render icon-only with reduced padding and rounded borders; header uses `squared_app_logo_image` at a fixed 1:1 ratio.
7. Custom action buttons (`@OnViewFunction`) render only when the active `ViewType` matches the button's declared `viewTypes` array.
8. `@OnViewFunction` on a class or property declaration is a no-op; no button is generated and no runtime error is thrown.

## Anti-Patterns (Prohibited)

1. Hardcoded business rules in generated UI components.
2. Bypassing metadata interpretation with ad-hoc per-view rules.
3. Introducing alternate configuration sources that replace decorators.

## Finalized Behavior Notes

1. Custom action buttons are generated from method decorators (`@OnViewFunction`) and filtered by active `ViewType`.
2. Invalid `@OnViewFunction` placement (class/property) is ignored as no-op.
3. Action callbacks execute bound to the active entity instance.
4. Login exemption is represented as metadata (`@NotRequiresLogin`) and resolved through `isNotRequiresLogin()`.
5. Collapsed sidebar header branding uses a dedicated `squared_app_logo_image` configuration value rendered with fixed 1:1 ratio.
6. `useFormRenderer` composable resolves input components from `InputRegistry`; the 16-branch `v-if` cascade in `default_detailview.vue` is replaced by registry lookup.
