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

## Anti-Patterns (Prohibited)

1. Hardcoded business rules in generated UI components.
2. Bypassing metadata interpretation with ad-hoc per-view rules.
3. Introducing alternate configuration sources that replace decorators.
