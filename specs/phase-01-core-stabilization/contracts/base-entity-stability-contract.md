# Contract: BaseEntity Stability

## Purpose

Define stabilization guarantees for BaseEntity runtime behavior during phase 01.

## Interface Commitments

1. Metadata guards must execute before persistence calls.
2. Validation chain order is fixed: required -> sync -> async.
3. CRUD operations must update loading and dirty state coherently.
4. API errors must be surfaced consistently through Application UI signaling.

## Operation Sequence

For `save()` and `update()`:
1. Guard metadata and method allowance.
2. Validate inputs.
3. Activate loading state.
4. Execute API call.
5. Reconcile instance state from response.
6. Deactivate loading state.
7. Notify outcome.

For `delete()`:
1. Guard metadata and method allowance.
2. Activate loading state.
3. Execute API call.
4. Deactivate loading state.
5. Notify outcome.

## Invariants

- No persistence call without endpoint metadata.
- No async validation before required and sync validations.
- No silent error suppression.
