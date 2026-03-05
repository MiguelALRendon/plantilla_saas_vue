# Quickstart: Phase 01 - Core Stabilization

**Branch**: `phase-01-core-stabilization`
**Date**: 2026-03-05
**Goal**: Validate first functional framework version with production-oriented checks.

## 1. Prerequisites

1. Install dependencies:

```bash
npm install
```

2. Configure environment values (`.env` or equivalent):
- `VITE_API_BASE_URL`

3. Ensure at least one representative module is registered in Application.

## 2. Development Validation Flow

1. Run dev server:

```bash
npm run dev
```

2. Validate core behavior:
- Sidebar renders registered module.
- List view loads from configured endpoint.
- Detail view renders metadata-driven inputs.
- Required/sync/async validations trigger in order.
- Save/update/delete operations surface success and failure correctly.

3. Validate navigation safety:
- Dirty-state confirmation appears on unsafe transition.

## 3. Production-Oriented Validation Flow

1. Build production artifacts:

```bash
npm run build
```

2. Preview production bundle locally:

```bash
npm run preview
```

3. Execute smoke checks on preview:
- Route loading (`/`, module route, detail route).
- CRUD sequence with one representative module.
- Error surfacing for failed API response.
- Loading indicators and view reconciliation behavior.

## 4. Release Readiness Gate

Release candidate is accepted when all checks pass:
1. Build succeeds without blocking errors.
2. Environment configuration is correctly applied.
3. Metadata-driven UI behaves consistently in list/detail.
4. CRUD lifecycle is stable and deterministic.
5. Failure paths are visible and diagnosable.

## 5. Troubleshooting

1. Missing module in sidebar:
- Verify module registration and decorator metadata.

2. CRUD call fails unexpectedly:
- Verify endpoint and allowed methods metadata.
- Verify `VITE_API_BASE_URL` configuration.

3. Incorrect input rendering:
- Verify property metadata and ordering decorators.

4. Dirty-state not respected:
- Verify transition path uses Application orchestration flow.
