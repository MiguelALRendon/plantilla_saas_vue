# Contract: Metadata-Driven UI Stability

## Purpose

Ensure list/detail UI behavior remains a deterministic function of decorators metadata.

## Interface Commitments

1. Visible list columns derive from property metadata and visibility decorators.
2. Detail input composition derives from property type and decorator metadata.
3. Validation messages and help texts derive from metadata and entity validation state.
4. Custom component overrides must remain explicit and module-scoped.

## Rendering Guarantees

1. Properties without display metadata are excluded from generated UI.
2. Grouping and ordering logic must follow metadata ordering contracts.
3. Conditional disabled/readonly behavior must evaluate from decorator contracts only.
4. Table pagination/footer controls must remain anchored to the visible container width, while only header/body regions may scroll.
5. Sidebar expanded layout must preserve header/body/footer region semantics; collapsed layout must hide labels and remain icon-only.

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
