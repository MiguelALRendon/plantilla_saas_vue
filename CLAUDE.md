# CLAUDE.md — plantilla_saas_vue

Framework Vue 3 + TypeScript **dirigido por metadatos**: declaras una entidad y unos decoradores, y el framework genera la UI CRUD (lista, detalle, formularios, validación y llamadas a API) automáticamente.

> **El código es la fuente de la verdad.** La guía para agentes es: este archivo, `.claude/rules/`, las skills `saas-framework-kit:*` y `docs/generated/` (generado desde el código). El antiguo sistema de gobernanza (GitHub Spec Kit / Copilot) fue eliminado: aquí solo se trabaja con Claude.

## Arquitectura (5 capas, flujo unidireccional)

`Entities → Decorators → BaseEntity → Application → UI`

1. **Entities** (`src/entities/`) — clases que extienden `BaseEntity`; declaran el modelo.
2. **Decorators** (`src/decorations/`) — escriben metadatos en el prototipo (nombre, tipo, validación, UI).
3. **BaseEntity** (`src/entities/base_entity.ts`) — motor: CRUD, validación, mapeo de persistencia, hooks de ciclo de vida y lectura de metadatos.
4. **Application** (`src/models/application.ts`) — singleton orquestador: estado de vista, router, modales/toasts, `axiosInstance`, event bus (`mitt`).
5. **UI** (`src/components/`, `src/views/`) — componentes Vue resueltos desde metadatos (`src/models/input_registry.ts` + `src/composables/useFormRenderer.ts`).

Reglas de oro: la UI nunca accede a entidades directamente, **todo pasa por `Application`**; las entidades nunca usan `axios` directo, usan **`Application.axiosInstance`**.

## Stack
Vue 3 (Composition API) · TypeScript strict + `experimentalDecorators` · Pinia (`src/stores/`) · vue-router · axios · mitt · Vite. i18n propio en `src/languages/` vía `GetLanguagedText` (claves `common.*`, `errors.*`, `validation.*`, `navigation.*`, `custom.*`).

## Comandos
- **Dev:** `npm run dev` (Vite → http://localhost:5173).
- **Build:** `npm run build`.
- **Type-check (USAR ESTE):** `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit` — exit 0 = limpio.
  ⚠️ `npm run type-check` y `npx` **fallan** en este entorno (error de path de Windows al hacer spawn de npx); NO es un error de código.
- **Tests:** `npx playwright test` (E2E) · `npx vitest` (unit).

## Reglas duras (las aplica el hook del plugin; ver `.claude/rules/`)
- Toda entidad **DEBE** `extends BaseEntity`.
- **Prohibido `any`** → usar `unknown` + narrowing.
- **Prohibido `import axios`** fuera de `src/models/application.ts`.
- **Prohibido `README.md`/`INDEX.md`** dentro de `src/`.
- CSS: sin `!important`, sin colores/`z-index` hardcodeados (tokens en `src/css/constants.css`), animar solo `transform`/`opacity`.
- `.env` no se trackea ni se lee.

## Estilo
4 espacios (TS) / 2 (templates Vue) · comillas simples · trailing commas en multilínea · tipado explícito · JSDoc en métodos/propiedades públicos · `// #region` en clases. Naming: `snake_case.ts` para entidades, `PascalCase` para clases, `XxxComponent.vue`, `useXxx.ts` para composables, `SCREAMING_SNAKE_CASE` para constantes.

## Cómo añadir cosas (usa las skills)
- Entidad nueva → `/saas-framework-kit:new-entity` (recuerda registrarla en `src/main.ts`).
- Decorador nuevo → `/saas-framework-kit:new-decorator`.
- Input de formulario nuevo → `/saas-framework-kit:new-input` (regístralo en `src/models/input_registry.ts`).
- Regenerar referencia desde el código → `/saas-framework-kit:regen-docs`.

Reglas detalladas por capa: `.claude/rules/`. Referencia (generada): `docs/generated/`.

## Verificación de cambios
Tras tocar `.ts`/`.vue`: corre el type-check (arriba). Para UI usa el subagente `browser-tester` (Playwright) o `npm run dev`. El backend vive en el proyecto hermano **`saas-api`** (http://localhost:8200); para E2E completo debe estar corriendo.
