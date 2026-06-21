---
paths:
  - "src/models/**/*.ts"
  - "src/router/**/*.ts"
  - "src/stores/**/*.ts"
---

# Regla: Application, Router y Stores

## Application (`src/models/application.ts`)
- Es un **singleton** (`ApplicationClass.getInstance()`, export default `Application`). No instanciar `ApplicationClass` en otro sitio.
- Es el **único** lugar autorizado para crear/usar `axios` (`this.axiosInstance` + interceptores). Toda llamada HTTP del framework pasa por `Application.axiosInstance`.
- Servicios de UI a través de `Application.ApplicationUIService` (toasts, modales, loading, confirmaciones). Estado reactivo respaldado por Pinia vía `_connectPinia()`.

## Router (`src/router/index.ts`)
- La navegación entre vistas se hace con los métodos de `Application` (`changeViewToListView/DetailView/DefaultView`, `navigateWithDirtyGuard`), no con `router.push` suelto desde componentes.
- El guard `beforeEach` sincroniza `Application.View` con la URL y aplica el guard de auth (`current_user` en `sessionStorage`) y el dirty-state guard.

## Stores (`src/stores/`)
- Pinia con `defineStore` y setup-store (`ref`). Exporta en `src/stores/index.ts`.
- Son el backing reactivo de `Application` (no dupliques estado): `appConfig`, `view`, `ui`.

## Prohibido
- `any`. Segundo `new ApplicationClass()`. `axios` importado fuera de este archivo. `router.push` directo desde componentes UI saltándose `Application`.
