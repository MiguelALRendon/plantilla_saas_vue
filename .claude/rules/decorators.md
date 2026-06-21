---
paths:
  - "src/decorations/**/*.ts"
---

# Regla: Decoradores

Patrón canónico (ver `src/decorations/required_decorator.ts` para propiedad, `src/decorations/module_decorator.ts` para clase). Sistema basado en `experimentalDecorators` (decoradores legacy).

## Anatomía de un decorador
1. **Symbol KEY exportado:** `export const XXX_KEY = Symbol('xxx');`
2. **Tipos/interfaz de metadata** (si aplica): `export interface XxxMetadata { ... }`.
3. **Factory que devuelve el decorador:**
   - **PropertyDecorator** → escribe en el prototipo:
     ```ts
     export function Xxx(arg: T): PropertyDecorator {
         return function (target: object, propertyKey: string | symbol) {
             const proto = target.constructor.prototype;
             if (!proto[XXX_KEY]) proto[XXX_KEY] = {};
             proto[XXX_KEY][propertyKey] = metadata;
         };
     }
     ```
   - **ClassDecorator** → escribe en el constructor: `(target as unknown as Record<PropertyKey, unknown>)[XXX_KEY] = value;`

## Registro y lectura (3 pasos obligatorios)
1. **Exportar** `XXX_KEY` y `Xxx` (y sus tipos) en `src/decorations/index.ts`.
2. **Importar** `XXX_KEY` en `src/entities/base_entity.ts` (bloque de imports superior).
3. **Añadir un accessor** en `BaseEntity` que lea la metadata:
   ```ts
   public getXxx(propertyKey: string): T | undefined {
       const proto = ((this.constructor as typeof BaseEntity) as DecoratedConstructor<this>).prototype;
       const map = (proto[XXX_KEY] as Record<string, T>) ?? {};
       return map[propertyKey];
   }
   ```
   (Versión `static` si es metadata de clase.) Si el valor es texto mostrable, pásalo por `resolveI18nText`.

## Prohibido
- No almacenar metadata fuera del prototipo/constructor (nada de `Map`/`WeakMap` externos).
- No usar `any` (usa `unknown` + narrowing); mantén JSDoc en el factory.

Usa la skill `/saas-framework-kit:new-decorator` para andamiar los 3 pasos.
