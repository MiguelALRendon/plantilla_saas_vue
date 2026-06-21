---
paths:
  - "src/components/**/*.vue"
  - "src/views/**/*.vue"
---

# Regla: Componentes Vue

Patrón canónico de input (ver `src/components/Form/TextInputComponent.vue`). `<script setup lang="ts">` + Composition API.

## Inputs de formulario
- **Props:** `entityClass: typeof BaseEntity`, `entity: BaseEntity`, `propertyKey: string`, `modelValue?: T`.
- **Metadata:** `const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey)` → `propertyName`, `required`, `disabled`, `readonly`, `validated`, `requiredMessage`, `validatedMessage`, `helpText`.
- **v-model:** emite `update:modelValue` en el input (no `v-model` directo en el componente).
- **Validación:** suscríbete en `onMounted` a `Application.eventBus.on('validate-inputs', handleValidation)` y desuscríbete en `onBeforeUnmount`; si algo falla, `Application.View.value.isValid = false` y muestra mensajes en `.validation-messages`.
- **Registro:** un input nuevo NO se usa hasta registrarlo en `src/models/input_registry.ts` (`inputRegistry.register(propType, stringType, Componente)`).
- **`data-testid`:** los inputs base exponen `data-testid="input-<propertyKey>"` para Playwright; mantén esa convención.

## Estilo (orden en `<script setup>`)
imports → props → emits → refs → computed → watch → lifecycle → methods. Usa `// #region`.

## CSS
- `<style scoped>` obligatorio.
- Sin variables CSS locales: usa los **tokens** de `src/css/constants.css` (colores, spacings, radios, sombras, `z-index`, transiciones).
- Sin `!important`. Animar **solo** `transform`/`opacity`.
- Sin colores/`z-index`/spacings hardcodeados.

## Prohibido
- Lógica en el template (ternarios complejos, `.map/.filter`, aritmética, llamadas con args): muévela a `computed`/métodos.
- Acceso directo a entidades fuera de las props recibidas: el flujo pasa por `Application`/metadata.
- `any`.

Usa la skill `/saas-framework-kit:new-input` para andamiar un input + su registro.
