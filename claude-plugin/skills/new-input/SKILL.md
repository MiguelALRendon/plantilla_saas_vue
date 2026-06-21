---
name: new-input
description: Andamia un componente de input de formulario nuevo y lo registra en el input registry para que el form renderer lo resuelva. Úsala al añadir un tipo de input al framework.
argument-hint: [NombreInput] [StringType?]
---

# Crear un input de formulario nuevo

Patrón real: `src/components/Form/TextInputComponent.vue` + registro en `src/models/input_registry.ts`. Lee ambos antes de generar.

Input solicitado: **$ARGUMENTS**

## Pasos
1. Crea `src/components/Form/<Pascal>Component.vue` con `<script setup lang="ts">`:
   - Props: `entityClass: typeof BaseEntity`, `entity: BaseEntity`, `propertyKey: string`, `modelValue?: T`.
   - `const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);`.
   - Emite `update:modelValue` al cambiar; añade `:data-testid="\`input-${propertyKey}\`"` al control.
   - Validación: en `onMounted` `Application.eventBus.on('validate-inputs', handleValidation)`; en `onBeforeUnmount` el `off`; en fallo `Application.View.value.isValid = false` y muestra mensajes en `.validation-messages`.
   - `<style scoped>` con tokens de `src/css/constants.css`. Sin `!important`, sin lógica en template.
2. Si introduces un subtipo de String, añádelo al enum `src/enums/string_type.ts`.
3. **Regístralo** en `src/models/input_registry.ts`: importa el componente y añade `inputRegistry.register(<propType>, <StringType|null>, <Pascal>Component);` (ver los registros existentes al final del archivo).
4. Verifica: `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit`.

Cumple `.claude/rules/components.md`.
