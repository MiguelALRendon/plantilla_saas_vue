# Regla: Estilo de código (siempre activa)

Conciso y verificable. Para detalles por capa, ver las otras reglas en `.claude/rules/`.

- **Indentación:** 4 espacios en TS/JS, 2 en templates Vue. Sin tabs.
- **Comillas:** simples por defecto; template literals para interpolación (no concatenar con `+`).
- **Trailing commas** obligatorias en arrays/objetos/parámetros/imports multilínea.
- **Tipado explícito** en variables, parámetros y retornos. **`any` prohibido** → `unknown` + narrowing.
- **JSDoc** en métodos y propiedades públicos.
- **`// #region` / `// #endregion`** para organizar secciones de clases (PROPERTIES, METHODS, ...).
- **Imports** en orden: framework Vue → librerías externas → alias `@/` → relativos.
- **Naming:** `snake_case.ts` (entidades/archivos), `PascalCase` (clases/decoradores), `XxxComponent.vue`, `useXxx.ts` (composables), `SCREAMING_SNAKE_CASE` (constantes), `camelCase` (métodos/vars). Nombres descriptivos, no ambiguos (evita `data`, `value`, `temp`, `item`).
- **Sin `console.*`** en código de producción (usa el manejo de errores del framework).
- **Sin `README.md`/`INDEX.md`** dentro de `src/`.
