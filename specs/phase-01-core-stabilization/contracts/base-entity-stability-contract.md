# Contract: BaseEntity Stability

**Phase**: 01 - Core Stabilization | **Last updated**: 2026-03-25

## Purpose

Define stabilization guarantees for `BaseEntity` runtime behavior as delivered in phase 01.

## Interface Commitments

1. Metadata guards execute before every persistence call. No CRUD method reaches the network without a valid endpoint and allowed-method check.
2. Validation chain order is fixed: `required -> sync -> async`. Async validation is never invoked before required and sync checks pass.
3. CRUD operations update `isLoading` and dirty state coherently: loading on before the API call, loading off after, dirty state reset after successful save/update. Dirty state is computed by `getDirtyState()` (a method, not a property) which performs a deep comparison between `_originalState` and the current `toPersistentObject()` snapshot; it is reset to `false` by reassigning `this._originalState = deepClone(this.toPersistentObject())` after a successful save.
4. API errors are surfaced consistently through Application UI signaling (toast or dialog). No silent error suppression.
5. `BaseEntity` index type is `string | number | boolean | Date | BaseEntity | BaseEntity[] | object | null | undefined`. No `unknown` casting required by callers.
6. `isNotRequiresLogin()` returns `true` only when `@NotRequiresLogin()` is applied at the class level. Default is `false`.

## Operation Sequence

For `save()`:
1. Guard: `validatePersistenceConfiguration()` — returns early if false.
2. Guard: `validateApiMethod('POST')` — returns early if false.
3. Validate: run required, sync, and async validators (`validateInputs()`).
4. Activate loading state (`_isSaving = true`, `showLoadingMenu()`).
5. Execute API POST call.
6. Reconcile instance state from response (`Object.assign`, `_originalState` reset).
7. Deactivate loading state (`_isSaving = false`, `hideLoadingMenu()`).
8. Notify success (toast).
9. On error: deactivate loading; call `saveFailed()`; `openConfirmationMenu(ERROR)`.

For `update()`:
1. Guard: `validatePersistenceConfiguration()` — returns early if false.
2. Guard: `validateApiMethod('PUT')` — returns early if false.
3. Guard: `isNew()` check — shows ERROR dialog and returns if entity has no persisted ID.
4. Set `_isSaving = true`; call `beforeUpdate()` hook.
5. Execute API PUT call.
6. Reconcile: `Object.assign(this, mappedData)`; `_originalState = deepClone(toPersistentObject())`; `_isSaving = false`; call `afterUpdate()` hook.
7. On error: `_isSaving = false`; call `updateFailed()`; `openConfirmationMenu(ERROR)`.

> **Behavioral note**: `update()` does **not** call `validateInputs()`, does not show a loading overlay, and does not emit a success toast. This differs from `save()`. Items BD-01 (missing validation), BD-02 (missing loading overlay), and BD-03 (missing success toast) in `tech-debt-register.md` are under triage to determine if this is intentional design or an omission.

For `delete()`:
1. Guard: `validatePersistenceConfiguration()` — returns early if false.
2. Guard: `validateApiMethod('DELETE')` — returns early if false.
3. Guard: `isNew()` check — shows ERROR dialog and returns if entity has no persisted ID.
4. Call `beforeDelete()` hook.
5. Execute API DELETE call.
6. Call `afterDelete()` hook.
7. On error: call `deleteFailed()`; `openConfirmationMenu(ERROR)`.

> **Behavioral note**: `delete()` does **not** activate/deactivate a loading overlay and does **not** show a success notification. Items BD-04 (missing loading overlay) and BD-05 (missing success notification) in `tech-debt-register.md` are under triage.

## Invariants

- No persistence call without endpoint metadata.
- No async validation before required and sync validations.
- No silent error suppression.
- `getDirtyState()` returns `false` after a successful save or update (because `_originalState` is reassigned to match the current persisted state).
- Non-persistent entities (`@Persistent` absent) must not trigger list reload, save, update, or delete API flows.
