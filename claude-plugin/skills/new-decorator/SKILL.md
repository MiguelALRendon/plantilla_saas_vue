---
name: new-decorator
description: Andamia un decorador de metadatos nuevo (de propiedad o de clase) cableado de extremo a extremo. Úsala cuando el usuario quiera añadir un @Decorator al framework.
argument-hint: [NombreDecorador]
---

# Crear un decorador nuevo

Patrón real: `src/decorations/required_decorator.ts` (propiedad) y `src/decorations/module_decorator.ts` (clase). Lee uno antes de generar.

Decorador solicitado: **$ARGUMENTS**

## Pasos (los 3 de cableado son obligatorios)
1. Crea `src/decorations/<snake>_decorator.ts`:
   - `export const <NAME>_KEY = Symbol('<name>');`
   - (opcional) `export interface <Name>Metadata { ... }`
   - Factory `export function <Name>(...): PropertyDecorator` (o `ClassDecorator`):
     - **PropertyDecorator:** escribe `target.constructor.prototype[<NAME>_KEY][propertyKey] = metadata` (inicializa `{}` si no existe).
     - **ClassDecorator:** escribe `(target as unknown as Record<PropertyKey, unknown>)[<NAME>_KEY] = value`.
   - JSDoc con `@example`. Sin `any` (usa `unknown`/genéricos).
2. **Exporta** en `src/decorations/index.ts`: `export { <NAME>_KEY, <Name> } from './<snake>_decorator';` (+ `export type` si hay metadata).
3. **Cablea la lectura** en `src/entities/base_entity.ts`:
   - Importa `<NAME>_KEY` en el bloque de imports superior.
   - Añade un accessor: instancia `getXxx(propertyKey)` que lee `proto[<NAME>_KEY][propertyKey]`, o `static` si es metadata de clase. Si el valor es texto mostrable, pásalo por `resolveI18nText`.
4. Verifica: `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit`.

Cumple `.claude/rules/decorators.md`. La metadata SIEMPRE vive en el prototipo/constructor (nunca en estructuras externas).
