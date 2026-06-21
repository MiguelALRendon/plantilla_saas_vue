---
name: e2e
description: Corre la suite end-to-end de Playwright de la app SaaS Vue. Úsala para verificar flujos de UI (login, CRUD) tras cambios.
disable-model-invocation: true
allowed-tools: Bash(npx playwright *)
---

# Ejecutar la suite E2E (Playwright)

Requisitos: dev server corriendo (`npm run dev`, http://localhost:5173) y el backend `saas-api` (http://localhost:8200). Sin backend, solo pasarán los tests de render puro de UI.

## Acción
1. Ejecuta con Bash: `npx playwright test $ARGUMENTS`
2. Reporta tests que pasan/fallan con su mensaje.
3. Si fallan por selectores: los inputs base exponen `data-testid="input-<propertyKey>"`, el submit de login es `[data-testid="login-submit"]` y el formulario `[data-testid="login-form"]`.

Para depurar un test: `npx playwright test --ui` o `--debug`.
