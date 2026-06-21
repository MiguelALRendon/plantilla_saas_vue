---
name: new-entity
description: Andamia una entidad nueva (subclase de BaseEntity) del framework SaaS Vue. Úsala cuando el usuario quiera añadir un módulo/entidad/modelo CRUD nuevo.
argument-hint: [NombreEntidad]
---

# Crear una entidad nueva

El código es la fuente de la verdad. Lee `src/entities/capitulo.ts` y `src/entities/user.ts` como patrón vigente antes de generar.

Entidad solicitada: **$ARGUMENTS**

## Pasos
1. Deriva el `snake_case` del archivo y el `PascalCase` de la clase desde "$ARGUMENTS".
2. Lee `src/entities/capitulo.ts` para copiar el patrón actual de imports (`@/decorations`, `@/constants/icons`) y decoradores.
3. Crea `src/entities/<snake>.ts`:
   - `export class <Pascal> extends BaseEntity` + `import { BaseEntity } from './base_entity';`.
   - Decoradores de clase: `@Module({ name, icon, apiEndpoint, apiMethods })`, `@PrimaryProperty('id')`, `@UniquePropertyKey('id')`, `@DefaultProperty('<campoVisible>')`. Para módulos no persistentes usa `@Module({ name, icon, persistent: false })`.
   - Propiedades: `@PropertyIndex(n)` + `@PropertyName('clave.i18n', Tipo)` + validación/UI (`@Required`, `@StringTypeDef`, `@HideInListView`, etc.).
   - **Clave de serialización:** solo las propiedades con `@PropertyName` se envían al API. Los campos de solo-respuesta (`id`, `created_at`, relaciones expandidas) se declaran SIN `@PropertyName` como `campo?: Tipo`.
4. Si es persistente, regístrala en `src/main.ts`: añade el `import` y `Application.registerModule(<Pascal>);` (después de `Application.initializeApplication(router)`).
5. Añade las claves i18n usadas a `src/languages/custom.json` (y demás si aplica).
6. Verifica: `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit` (exit 0).

Cumple `.claude/rules/entities.md`. Prohibido `any`; prohibido `axios` directo.
