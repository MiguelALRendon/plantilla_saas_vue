---
paths:
  - "tests/**/*.ts"
  - "vitest.config.ts"
  - "playwright.config.ts"
---

# Regla: Tests

- **Unit (Vitest):** `tests/unit/*.spec.ts`. **E2E (Playwright):** `tests/e2e/*.spec.ts`.
- **Correr (sandbox):** `node node_modules/vitest/vitest.mjs run`. En terminal normal/CI: `npm run test` (unit) · `npm run test:e2e`.
- **HTTP en unit:** mockea `Application.axiosInstance` con `vi.spyOn(Application.axiosInstance, 'get'|'post'|'put'|'delete')`. Nunca pegues a la red real.
- **Entidad de prueba:** declara campos `campo?: Tipo` (sin inicializador — ver `.claude/rules/entities.md`) y un `@Module({ name, icon, apiEndpoint, apiMethods })` **con `icon`** (sin icon, `save/update/delete` cortocircuitan en `validateModuleConfiguration`). Patrón completo en `tests/unit/base_entity_crud.spec.ts`.
- **E2E selectores `data-testid`:** inputs `input-<propertyKey>`, login `login-form`/`login-submit`, lista `data-table`/`btn-new`, filas `row-<id>`. El CRUD E2E está env-gated (`E2E_USER`/`E2E_PASS`) y requiere el backend `saas-api`.
- Mantén verde: type-check + unit + lint. CI ya los corre (`.github/workflows/ci.yml`).
