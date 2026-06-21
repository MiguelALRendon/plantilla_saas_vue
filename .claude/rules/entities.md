---
paths:
  - "src/entities/**/*.ts"
---

# Regla: Entidades

Patrón canónico (ver `src/entities/user.ts`, `src/entities/capitulo.ts`). El código es la fuente de la verdad.

## Estructura
- La clase **DEBE** `extends BaseEntity` y exportarse con nombre `PascalCase`; el archivo es `snake_case.ts`.
- **Decoradores de clase** (arriba de `export class`): `@Module({ name, icon, apiEndpoint, apiMethods, persistent })` + `@PrimaryProperty('id')` + `@UniquePropertyKey('id')` + `@DefaultProperty('campoVisible')`. Opcional `@NotRequiresLogin()`, `@ModulePermission(...)`.
- **Decoradores de propiedad**, en orden: `@PropertyIndex(n)` → `@PropertyName('clave.i18n', Tipo)` → validación (`@Required`, `@Validation`, `@AsyncValidation`) → visibilidad (`@HideInListView`, `@HideInDetailView`) → UI (`@StringTypeDef`, `@Mask`, `@DisplayFormat`, `@HelpText`) → condicionales (`@Disabled`, `@ReadOnly`).

## Serialización (clave)
- Una propiedad con `@PropertyName` **se incluye** en el payload de la API (`toPersistentObject`).
- Una propiedad **sin** `@PropertyName` (p.ej. `created_at`, relaciones expandidas) NO se serializa: úsalas para campos de solo-respuesta. Decláralas como `campo?: Tipo`.

## Tipos i18n
`@PropertyName`, mensajes de validación, `@HelpText` y `name` del módulo aceptan claves i18n (`custom.*`, `common.*`, ...) que se resuelven con `GetLanguagedText`.

## Ciclo de vida
Sobrescribe hooks con `override` (no-ops en la base): `beforeSave/onSaving/afterSave/saveFailed`, `before/onUpdating/afterUpdate/updateFailed`, `before/onDeleting/afterDelete/deleteFailed`, `afterGetElement(List)`, `afterRefresh`, `onValidated`. `afterSave()` puede devolver `true` para suprimir el toast por defecto.

## Registro
Una entidad persistente solo aparece como módulo si se registra en `src/main.ts` con `Application.registerModule(MiEntidad)` (después de `Application.initializeApplication(router)`).

## Prohibido
- No llamar `axios` directamente: usa los métodos CRUD de `BaseEntity` (`save/update/delete/getElement/getElementList`).
- No usar `any`. No acceder a `proto[SYMBOL]` directo: usa los getters de `BaseEntity`.
- No meter lógica de UI/negocio fuera de los hooks documentados.

Usa la skill `/saas-framework-kit:new-entity` para andamiar.
