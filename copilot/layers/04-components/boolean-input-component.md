# BooleanInputComponent

## 1. Propósito

BooleanInputComponent es un componente de formulario tipo toggle button para propiedades booleanas que renderiza interfaz clickable con iconos visuales indicando estado true (CHECK MARK verde) o false (CANCEL X roja rotada). El componente implementa v-model interno mediante computed property get/set, emitiendo update:modelValue al alternar estado con click. Integra sistema completo de validación de tres niveles (required que valida true, synchronous validation, async validation), metadata mediante useInputMetadata composable (propertyName, helpText, disabled, required, validated), y estilos dinámicos con transiciones animadas de rotación de icono y cambios de color. Proporciona feedback visual de estados disabled y nonvalidated mediante clases CSS condicionales y mensajes de validación renderizados debajo del input.

**Ubicación del código fuente:** src/components/Form/BooleanInputComponent.vue

**Tipo de propiedad:** Boolean

**Activación automática:** Propiedades decoradas con tipo Boolean generan BooleanInputComponent

**Patrón de diseño:** Toggle Button + Icon Animation + Validation Feedback

## 2. Alcance

### Responsabilidades

1. **Renderizado de Toggle Button:**
   - Renderizar button element con label mostrando metadata.propertyName
   - Renderizar div.input-button con clase true condicional basada en modelValue
   - Renderizar span con icono dinámico: GGICONS.CHECK si true, GGICONS.CANCEL si false
   - Aplicar clase disabled a container si metadata.disabled.value es true
   - Aplicar clase nonvalidated a container si isInputValidated es false

2. **Gestión de Estado Booleano:**
   - Implementar computed property value con get retornando this.modelValue
   - Implementar set en value que emite update:modelValue con nuevo valor booleano
   - Bindear @click="value = !value" a button para alternar estado
   - Prevenir cambios cuando disabled mediante :disabled binding
   - Mantener sincronización bidireccional con v-model del componente padre

3. **Animaciones y Transiciones:**
   - Aplicar transform: rotate(180deg) a icono cuando modelValue es false
   - Aplicar transform: rotate(0deg) cuando modelValue es true
   - Establecer transition: 0.5s ease en icono para animación suave
   - Cambiar background-color a var(--btn-info) cuando true
   - Cambiar color a var(--accent-red) cuando false

4. **Sistema de Validación Tri-Level:**
   - Nivel 1 Required: Verificar metadata.required.value && !this.modelValue (debe ser true)
   - Nivel 2 Sync: Verificar !metadata.validated.value agregando message
   - Nivel 3 Async: Ejecutar await entity.isAsyncValidation(propertyKey)
   - Poblar validationMessages array con errores de los tres niveles
   - Computed isInputValidated retorna metadata.validated.value && validationMessages.length === 0
   - Renderizar validation-messages div con span por cada mensaje

5. **Integración de Metadata:**
   - Ejecutar useInputMetadata composable con entityClass, entity, propertyKey
   - Extraer propertyName, helpText, disabled, required, validated de metadata
   - Renderizar help-text div si metadata.helpText.value existe
   - Usar metadata.requiredMessage.value en mensaje de required
   - Usar metadata.validatedMessage.value en mensaje de sync validation

### Límites

1. **NO implementa checkbox HTML nativo** - Es button custom, no input type="checkbox"
2. **NO soporta estados intermedios** - Solo true/false, no null o undefined como tercero
3. **NO implementa toggle switch estilo iOS** - Es button con iconos, no switch slider
4. **NO customiza iconos via props** - Iconos hardcoded a CHECK y CANCEL
5. **NO permite cambio programático cuando disabled** - Completamente readonly cuando disabled
6. **NO valida formato de valor** - Asume siempre boolean puro
7. **NO emite eventos adicionales** - Solo update:modelValue, no eventos de focus/blur
8. **NO soporta indeterminate state** - Común en checkboxes de selección parcial

## 3. Definiciones Clave

**BooleanInputComponent**: Componente Vue de formulario que renderiza toggle button para propiedades booleanas con iconos CHECK/CANCEL animados y validación completa.

**value computed property**: Computed con get() retornando modelValue y set(val) emitiendo update:modelValue, permitiendo sintaxis v-model interna simplificada como value = !value.

**modelValue**: Prop boolean required con default false que contiene estado actual del toggle, sincronizado con v-model del componente padre mediante eventos update:modelValue.

**metadata**: Objeto reactive retornado por useInputMetadata composable conteniendo: propertyName (string), helpText (MaybeRef<string>), disabled (MaybeRef<boolean>), required (MaybeRef<boolean>), validated (MaybeRef<boolean>), requiredMessage, validatedMessage.

**isInputValidated**: Computed property que evalúa metadata.validated.value && validationMessages.length === 0, retornando true solo si todas las validaciones pasan.

**validationMessages**: Data property Array<string> que acumula mensajes de error de required validation, sync validation y async validation, renderizados en template.

**input-button class**: Div que contiene icono animado, recibe clase true condicionalmente cuando modelValue es true, aplicando estilos de transform y background-color.

**Icon Animation**: Transición CSS de transform rotate(180deg) para false a rotate(0deg) para true con ease 0.5s, acompañada de cambio de color rojo a verde.

## 4. Descripción Técnica

BooleanInputComponent implementa template con estructura div.boolean-input-container aplicando clases condicionales disabled y nonvalidated mediante object syntax de :class. El button.BooleanInput contiene label con for bindeado a 'id-' + metadata.propertyName y text interpolation mostrando metadata.propertyName seguido de dos puntos. El div.input-button aplica clase true mediante :class="['input-button', { true: modelValue }]", conteniendo span con :class="GGCLASS" y class="icon", renderizando conditional icon: modelValue ? GGICONS.CHECK : GGICONS.CANCEL. El button bindea @click="value = !value" y :disabled="metadata.disabled.value".

El computed value implementa patrón getter/setter: get() retorna this.modelValue para reading, set(val: boolean) ejecuta this.$emit('update:modelValue', val) para writing, permitiendo sintaxis simplificada en template como value = !value que internamente emite evento y actualiza modelValue por Vue reactivity.

El method isValidated() es async function retornando Promise<boolean>, inicializa validated: true y limpia validationMessages array. Ejecuta three-level validation: 1) verifica this.metadata.required.value && !this.modelValue (required verifica true específicamente, no solo truthy), agrega mensaje de metadata.requiredMessage.value o default; 2) verifica !this.metadata.validated.value, agrega metadata.validatedMessage.value o default; 3) ejecuta const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey), si false agrega entity.asyncValidationMessage(propertyKey). Retorna validated boolean acumulativo.

Los estilos CSS implementan transitions: .input-button .icon tiene transition: 0.5s ease aplicado a transform property, ejecutando smooth rotation entre 180deg (false) y 0deg (true). El estado false aplica color: var(--accent-red) sin background, estado true aplica background-color: var(--btn-info) y color: var(--white) mediante clase .input-button.true. El hover state aplica background-color: var(--bg-gray) a button. Los estados disabled y nonvalidated modifican opacidad y colors de label y icon.

## 5. Flujo de Funcionamiento

**Montaje Inicial (false):**
1. Component recibe props: entityClass (User), entity (user instance), propertyKey ('active'), modelValue (false)
2. setup() ejecuta useInputMetadata(entityClass, entity, propertyKey)
3. metadata extraído: { propertyName: 'Active', required: false, disabled: false, validated: true }
4. Template renderiza button con label 'Active:'
5. modelValue es false, computed value.get() retorna false
6. Template evalúa modelValue ? GGICONS.CHECK : GGICONS.CANCEL → GGICONS.CANCEL
7. Clase true no se aplica a input-button
8. CSS aplica transform: rotate(180deg) y color: var(--accent-red) a icon
9. Icon X roja rotada se muestra

**Click para Alternar a true:**
1. Usuario click en button
2. Event handler @click="value = !value" ejecuta
3. value setter se invoca con !false = true
4. Setter ejecuta this.$emit('update:modelValue', true)
5. Evento bubbles a componente padre
6. Padre actualiza v-model bindeado: entity.active = true
7. Vue reactivity propaga cambio a prop modelValue
8. BooleanInputComponent recibe modelValue: true
9. Template re-evalúa conditional icon → GGICONS.CHECK
10. Clase true se aplica a input-button
11. CSS transition ejecuta: transform 180deg → 0deg en 0.5s ease
12. background-color cambia a var(--btn-info), color a var(--white)
13. Icon CHECK marca verde sin rotación se muestra con animación

**Validación Required (debe ser true):**
1. Entity tiene @Required(true, 'You must accept terms')
2. Usuario intenta guardar con acceptTerms: false
3. DefaultDetailView ejecuta entity.isValidated()
4. BaseEntity ejecuta BooleanInputComponent.isValidated()
5. isValidated() verifica metadata.required.value: true && modelValue: false
6. Condición true, validated = false
7. validationMessages.push('You must accept terms')
8. isValidated() retorna false
9. computed isInputValidated evalúa: validated (true de metadata) && messages.length (1) → false
10. Template aplica clase nonvalidated a container
11. CSS cambia label color a var(--accent-red)
12. validation-messages div renderiza span con 'You must accept terms'
13. Usuario ve feedback visual de error

**Disabled State:**
1. Entity tiene @Disabled(true) en emailVerified property
2. metadata.disabled.value es true
3. Template aplica :disabled="true" a button
4. Container recibe clase disabled
5. CSS aplica cursor: not-allowed y pointer-events: none
6. Label color cambia a var(--gray-light)
7. Icon background a var(--gray-light), color a var(--gray-lighter)
8. Usuario no puede click en button

**Validación Asíncrona:**
1. Entity tiene @AsyncValidation verificando email único
2. Usuario cambia agreeToPrivacyPolicy a true
3. isValidated() ejecuta await entity.isAsyncValidation('agreeToPrivacyPolicy')
4. BaseEntity ejecuta async validator function
5. Validator ejecuta fetch('/api/check-agreement', { email: entity.email })
6. API retorna { exists: true }
7. Validator retorna false
8. isValidated() agrega entity.asyncValidationMessage('agreeToPrivacyPolicy')
9. validationMessages incluye 'Privacy policy agreement already exists for this email'
10. isInputValidated retorna false
11. Template renderiza mensaje de error async

## 6. Reglas Obligatorias

### 6.1 Required Valida true Específicamente

Required en BooleanInputComponent valida que valor sea true, NO solo truthy:

```typescript
// ✅ CORRECTO - Verifica true explícito
if (this.metadata.required.value && !this.modelValue) {
    // modelValue debe ser true para pasar
}

// ❌ INCORRECTO - Truthy check
if (this.metadata.required.value && !modelValue) {
    // Pasa con cualquier valor truthy
}
```

### 6.2 Uso de Computed value para Toggle

SIEMPRE usar computed value para alternar, NO modificar modelValue directamente:

```vue
<!-- ✅ CORRECTO -->
<button @click="value = !value">

<!-- ❌ INCORRECTO - Muta prop -->
<button @click="modelValue = !modelValue">
```

### 6.3 Emisión de Update ModelValue

SIEMPRE emitir update:modelValue en setter de value, NO en click handler:

```typescript
// ✅ CORRECTO
computed: {
    value: {
        set(val: boolean) {
            this.$emit('update:modelValue', val);
        }
    }
}

// ❌ INCORRECTO
methods: {
    toggle() {
        this.$emit('update:modelValue', !this.modelValue);
    }
}
```

### 6.4 Props Required y Default

modelValue DEBE tener required: true y default: false:

```typescript
// ✅ CORRECTO
modelValue: {
    type: Boolean,
    required: true,
    default: false
}

// ❌ INCORRECTO - No default
modelValue: {
    type: Boolean,
    required: true
}
```

### 6.5 Verificación de Disabled

SIEMPRE verificar disabled en button y en container:

```vue
<!-- ✅ CORRECTO -->
<div class="boolean-input-container" :class="{disabled: metadata.disabled.value}">
    <button :disabled="metadata.disabled.value">

<!-- ❌ INCORRECTO - Solo en button -->
<div class="boolean-input-container">
    <button :disabled="metadata.disabled.value">
```

### 6.6 Iconos Condicionales

SIEMPRE usar ternary operator para iconos, NO v-if/v-else:

```vue
<!-- ✅ CORRECTO -->
{{ modelValue ? GGICONS.CHECK : GGICONS.CANCEL }}

<!-- ❌ INCORRECTO -->
<span v-if="modelValue">{{ GGICONS.CHECK }}</span>
<span v-else>{{ GGICONS.CANCEL }}</span>
```

### 6.7 Tokens CSS Obligatorios

TODOS los valores CSS en BooleanInputComponent DEBEN usar tokens de constants.css (04-UI-CONTRACT §6.4). Valores numéricos directos (1rem, 0.5s, 100%, etc.) están PROHIBIDOS. SIEMPRE usar:
- var(--spacing-xs), var(--spacing-xxs), var(--spacing-lg) para spacing
- var(--border-radius-large), var(--border-radius-full) para border-radius
- var(--transition-normal), var(--timing-ease) para transiciones
- var(--font-size-base) para font-size
- var(--lavender), var(--accent-red), var(--btn-info), var(--white), var(--bg-gray) para colores
- Usar 0 sin unidades para valores cero (unit-less zero), NO 0px, 0rem, etc.

## 7. Prohibiciones

1. NO usar input type="checkbox" - Component es button element, no checkbox nativo
2. NO permitir estados intermedios - Solo true/false, no null/undefined como tercero estado
3. NO modificar modelValue prop directamente - Siempre emitir update:modelValue
4. NO omitir validación de required - Required debe verificar true específicamente, no truthy
5. NO implementar custom icons via props - Iconos son GGICONS.CHECK y GGICONS.CANCEL fixed
6. NO aplicar disabled solo a button - Container también debe recibir clase disabled para estilos
7. NO ejecutar validación en cada click - Validación ejecuta cuando DefaultDetailView llama isValidated()
8. NO usar v-model directamente en template - Usar computed property value con get/set
9. NO omitir transiciones CSS - Icon debe animar con transform rotate transition 0.5s
10. NO renderizar help-text cuando vacío - Usar v-if="metadata.helpText.value" para conditional rendering
11. NO hardcodear valores CSS en BooleanInputComponent (04-UI-CONTRACT §6.4) - SIEMPRE usar tokens de constants.css. Ejemplos de valores prohibidos:
    - NO usar `margin-left: 1rem`, usar `margin-left: var(--spacing-lg)`
    - NO usar `border-radius: 100%`, usar `border-radius: var(--border-radius-full)`
    - NO usar `transition: 0.5s ease`, usar `transition: var(--transition-normal) var(--timing-ease)`
    - NO usar `border: 0px solid transparent`, usar `border: 0 solid transparent` (unit-less zero)
    - NO usar `font-size: 1rem`, usar `font-size: var(--font-size-base)`

## 8. Dependencias

### Dependencias Directas

**useInputMetadata Composable:**
- useInputMetadata(entityClass, entity, propertyKey) - Retorna metadata object
- metadata.propertyName - Nombre display de propiedad
- metadata.helpText.value - Texto de ayuda opcional
- metadata.disabled.value - Estado disabled
- metadata.required.value - Si propiedad es required
- metadata.validated.value - Estado de sync validation
- metadata.requiredMessage.value - Mensaje custom de required
- metadata.validatedMessage.value - Mensaje custom de validation

**BaseEntity:**
- entity.isAsyncValidation(propertyKey) - Async validation execution
- entity.asyncValidationMessage(propertyKey) - Mensaje de async validation

**Vue Core:**
- Props: entityClass, entity, propertyKey, modelValue
- Emit: update:modelValue
- Computed properties: value, isInputValidated
- Methods: isValidated() async
- v-model pattern mediante computed get/set

**Decoradores:**
- @Required(boolean, message) - Validación que valor sea true
- @Disabled(boolean) - Deshabilitar componente
- @HelpText(string) - Texto de ayuda
- @Validation(fn, message) - Validación sincrónica
- @AsyncValidation(fn, message) - Validación asíncrona

### Dependencias de Iconos

- GGICONS.CHECK - Icono de checkmark para true
- GGICONS.CANCEL - Icono de X para false
- GGCLASS - Clase CSS para iconos Google

### Dependencias de CSS

- Variables: --lavender, --bg-gray, --accent-red, --btn-info, --white, --gray-light, --gray-lighter
- Transitions: transform 0.5s ease
- Classes: boolean-input-container, BooleanInput, input-button, label-input-boolean

## 9. Relaciones

**Componentes Relacionados:**

BooleanInputComponent ← DefaultDetailView (renderiza en formulario)
BooleanInputComponent → useInputMetadata (obtiene metadata)
BooleanInputComponent → BaseEntity (ejecuta validaciones)

**Flujo de Comunicación:**

User click button → BooleanInputComponent.value setter → emit update:modelValue → Parent component updates v-model → Vue reactivity → modelValue prop updates → Template re-renders icon

DefaultDetailView calls entity.isValidated() → BaseEntity iterates properties → BooleanInputComponent.isValidated() → validates required/sync/async → returns boolean → BaseEntity aggregates results

**Documentos Relacionados:**

- [text-input-component.md](text-input-component.md) - Input de texto base
- [number-input-component.md](number-input-component.md) - Input numérico
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadata
- form-inputs.md - Overview de sistema de inputs
- required-decorator.md - Decorador @Required
- disabled-decorator.md - Decorador @Disabled
- validation-decorator.md - Decorador @Validation
- async-validation-decorator.md - Decorador @AsyncValidation

**Casos de Uso Típicos:**

- Checkbox de confirmación (términos y condiciones)
- Estado activo/inactivo de entidades
- Flags booleanos de configuración
- Permisos y autorizaciones
- Estados de verificación (email verified)

## 10. Notas de Implementación

### Normalización Contractual (2026-02-17)

- Los estados `.disabled` y `.nonvalidated` deben implementarse sin `!important`.
- La prioridad visual de estados se logra por orden y especificidad de selectores scoped.

### Definición de Entidad Básica

```typescript
@PropertyName('Active', Boolean)
active!: boolean;
```

### Checkbox con Required

```typescript
@PropertyName('Accept Terms', Boolean)
@Required(true, 'You must accept the terms and conditions')
acceptTerms!: boolean;
```

### Estado Read-Only

```typescript
@PropertyName('Email Verified', Boolean)
@Disabled(true)
emailVerified!: boolean;
```

### Con Help Text

```typescript
@PropertyName('Send Notifications', Boolean)
@HelpText('Receive email notifications for updates')
sendNotifications!: boolean;
```

### Validaciones Avanzadas

```typescript
// Validar que dos booleans no pueden ser true simultáneamente
@Validation(
    (entity) => !(entity.optionA && entity.optionB),
    'Cannot enable both options simultaneously'
)
optionA!: boolean;

// Validar que al menos uno sea true
@Validation(
    (entity) => entity.emailNotif || entity.smsNotif || entity.pushNotif,
    'At least one notification method must be enabled'
)
emailNotif!: boolean;
```

### Personalización de Iconos

Modificar iconos editando ternary operator en template:

```vue
<!-- Iconos alternativos -->
{{ modelValue ? GGICONS.TOGGLE_ON : GGICONS.TOGGLE_OFF }}
{{ modelValue ? GGICONS.STAR : GGICONS.STAR_OUTLINE }}
{{ modelValue ? GGICONS.FAVORITE : GGICONS.FAVORITE_BORDER }}
```

### Estilos Críticos

```css
.BooleanInput {
    display: flex;
    flex-direction: row;
    margin-block: .5rem;
    padding: 0.5rem .25rem;
    cursor: pointer;
    align-items: center;
    border-radius: 1rem;
    transition: 0.5s ease;
}

.BooleanInput:hover {
    background-color: var(--bg-gray);
}

.input-button .icon {
    transform: rotate(180deg);
    transition: 0.5s ease;
    color: var(--accent-red);
    border-radius: 100%;
}

.input-button.true .icon {
    transform: rotate(0deg);
    background-color: var(--btn-info);
    color: var(--white);
}

.boolean-input-container.disabled .BooleanInput {
    cursor: not-allowed;
    pointer-events: none;
}

.boolean-input-container.nonvalidated .BooleanInput label {
    color: var(--accent-red) !important;
}
```

### Debugging

```typescript
// Verificar estado
console.log('Current value:', this.modelValue);
console.log('Metadata:', this.metadata);

// Verificar validación
const isValid = await this.isValidated();
console.log('Is valid:', isValid);
console.log('Validation messages:', this.validationMessages);

// Verificar disabled
console.log('Is disabled:', this.metadata.disabled.value);
```

## 11. Referencias Cruzadas

**Form Inputs:**
- [form-inputs.md](form-inputs.md) - Overview del sistema de inputs
- [text-input-component.md](text-input-component.md) - Input de texto
- [number-input-component.md](number-input-component.md) - Input numérico
- [date-input-component.md](date-input-component.md) - Input de fecha

**Composables:**
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadata

**Decoradores:**
- [required-decorator.md](../01-decorators/required-decorator.md) - @Required decorator
- [disabled-decorator.md](../01-decorators/disabled-decorator.md) - @Disabled decorator
- [help-text-decorator.md](../01-decorators/help-text-decorator.md) - @HelpText decorator
- [validation-decorator.md](../01-decorators/validation-decorator.md) - @Validation decorator
- [async-validation-decorator.md](../01-decorators/async-validation-decorator.md) - @AsyncValidation decorator

**Constants:**
- ggicons.ts - Google Icons constantes

**Arquitectura:**
- [02-FLOW-ARCHITECTURE.md](../../02-FLOW-ARCHITECTURE.md) - Flujo de renderizado de formularios
- [01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md) - Visión general del framework

**Ubicación del código fuente:** src/components/Form/BooleanInputComponent.vue

---

## Template

```vue
<template>
<div class="boolean-input-container" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <button class="BooleanInput" @click="value = !value" :disabled="metadata.disabled.value">
        <label 
            :for="'id-' + metadata.propertyName" 
            class="label-input-boolean">
            {{ metadata.propertyName }}: 
        </label>

        <div :class="['input-button', { true: modelValue }]">
            <span :class="GGCLASS" class="icon">
                {{ modelValue ? GGICONS.CHECK : GGICONS.CANCEL }}
            </span>
        </div>
    </button>
    
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">
            {{ message }}
        </span>
    </div>
</div>
</template>
```

---

## Script

### Computed: value

Implementa v-model interno:

```typescript
computed: {
    value: {
        get(): boolean {
            return this.modelValue;
        },
        set(val: boolean) {
            this.$emit('update:modelValue', val);
        }
    }
}
```

**Uso:**
```vue
<button @click="value = !value">
```

Al hacer click, alterna el valor y emite el evento.

---

## Estados Visuales

### Estado FALSE (❌)

```
┌────────────────────────────┐
│  Active:  [🔴 ✗]          │  ← Ícono rojo rotado
└────────────────────────────┘
```

**CSS:**
```css
.input-button .icon {
    transform: rotate(180deg);
    color: var(--accent-red);
}
```

### Estado TRUE (✅)

```
┌────────────────────────────┐
│  Active:  [🟢 ✓]          │  ← Ícono verde normal
└────────────────────────────┘
```

**CSS:**
```css
.input-button.true .icon {
    transform: rotate(0deg);
    background-color: var(--btn-info);
    color: var(--white);
}
```

### Transición

```css
.input-button .icon {
    transition: 0.5s ease;
}
```

Animación suave al cambiar de estado.

---

## 🔔 Interacción

### Click en Button

```typescript
@click="value = !value"
```

**Flujo:**
1. Usuario hace click en botón
2. Setter de `value` se ejecuta
3. Emite `update:modelValue` con nuevo valor
4. Vue actualiza `modelValue`
5. Ícono cambia con animación

### Disabled

```typescript
:disabled="metadata.disabled.value"
```

**CSS:**
```css
.boolean-input-container.disabled .BooleanInput {
    cursor: not-allowed;
    pointer-events: none;
    background-color: var(--gray-lighter);
}
```

---

## Sistema de Validación

### isValidated()

```typescript
async isValidated(): Promise<boolean> {
    var validated = true;
    this.validationMessages = [];
    
    /** Required: debe ser true */
    if (this.metadata.required.value && !this.modelValue) {
        validated = false;
        this.validationMessages.push(
            this.metadata.requiredMessage.value || 
            `${this.metadata.propertyName} is required.`
        );
    }
    
    /** Sync validation */
    if (!this.metadata.validated.value) {
        validated = false;
        this.validationMessages.push(
            this.metadata.validatedMessage.value || 
            `${this.metadata.propertyName} is not valid.`
        );
    }
    
    /** Async validation */
    const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
    if (!isAsyncValid) {
        validated = false;
        const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
        if (asyncMessage) {
            this.validationMessages.push(asyncMessage);
        }
    }
    
    return validated;
}
```

**Nota:** Required verifica que sea `true`, no solo que exista.

---

## Ejemplos de Uso

### 1. Checkbox Simple

```typescript
@PropertyName('Active', Boolean)
active!: boolean;
```

**Resultado:**
- Default: `false` (✗ rojo)
- Click: `true` (✓ verde)

### 2. Aceptar Términos (Required)

```typescript
@PropertyName('Accept Terms', Boolean)
@Required(true, 'You must accept the terms and conditions')
acceptTerms!: boolean;
```

**Comportamiento:**
- Si `false` al guardar → Error: "You must accept the terms and conditions"
- Debe estar en `true` para pasar validación

### 3. Estado con Validación

```typescript
@PropertyName('Email Verified', Boolean)
@Disabled(true)  // Solo lectura
emailVerified!: boolean;
```

**Comportamiento:**
- Usuario no puede cambiar el valor
- Se controla programáticamente

### 4. Configuración Opcional

```typescript
@PropertyName('Send Notifications', Boolean)
@HelpText('Receive email notifications for updates')
sendNotifications!: boolean;
```

---

## Estilos Personalizados (Scoped)

### Contenedor

```css
.boolean-input-container {
    width: 100%;
    box-sizing: border-box;
}
```

### Botón

```css
.BooleanInput {
    display: flex;
    flex-direction: row;
    margin-block: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-xxs);
    cursor: pointer;
    align-items: center;
    border-radius: var(--border-radius-large);
    transition: var(--transition-normal) var(--timing-ease);
    border: 0 solid transparent;
}

.BooleanInput:hover {
    background-color: var(--bg-gray);
}
```

**Nota importante:** El valor `border: 0 solid transparent` usa cero sin unidades (unit-less zero), que es la forma correcta y preferida en CSS para valores cero (04-UI-CONTRACT §6.4). Usar `0px`, `0rem`, etc. es innecesario y agrega bytes extra sin beneficio.

### Label

```css
.BooleanInput .label-input-boolean {
    color: var(--lavender);
    font-size: var(--font-size-base);
    height: fit-content;
    cursor: pointer;
}
```

### Ícono

```css
.BooleanInput .input-button {
    margin-left: var(--spacing-lg);
}

.BooleanInput .input-button .icon {
    transform: rotate(180deg);
    transition: var(--transition-normal) var(--timing-ease);
    color: var(--accent-red);
    border-radius: var(--border-radius-full);
}

.BooleanInput .input-button.true .icon {
    transform: rotate(0deg);
    background-color: var(--btn-info);
    color: var(--white);
}
```

**TOKENS CSS OBLIGATORIOS:**

- **--spacing-xs: 0.5rem** → Margin-block y padding vertical del botón
- **--spacing-xxs: 0.25rem** → Padding horizontal del botón
- **--spacing-lg: 1rem** → Margin-left del input-button
- **--border-radius-large: 1rem** → Border-radius del botón (esquinas redondeadas)
- **--border-radius-full: 100%** → Border-radius del icono (círculo perfecto)
- **--transition-normal: 0.5s** → Duración de transiciones de hover y rotación de icono
- **--timing-ease: ease** → Timing function para transiciones suaves
- **--font-size-base: 1rem** → Font-size del label
- **--bg-gray: #F5F5F5** → Background-color en hover
- **--lavender: #8B7FBF** → Color del label
- **--accent-red: #E74C3C** → Color del icono en estado false
- **--btn-info: #3498DB** → Background-color del icono en estado true
- **--white: #FFFFFF** → Color del icono en estado true

El icono usa `border-radius: var(--border-radius-full)` que equivale a `100%` para crear forma circular perfecta. El botón usa transition con duración `var(--transition-normal)` (0.5s) para animar tanto el hover como la rotación del icono de 180deg (false) a 0deg (true).

### Estados

```css
/* Focus */
.BooleanInput:focus {
    border: 2px solid var(--lavender);
}

/* Disabled */
.boolean-input-container.disabled .BooleanInput label {
    color: var(--gray-light) !important;
}
.boolean-input-container.disabled .BooleanInput span { 
    background-color: var(--gray-light) !important; 
    color: var(--gray-lighter) !important;
}

/* Invalid */
.boolean-input-container.nonvalidated .BooleanInput label {
    color: var(--accent-red) !important;
}
```

---

## 🔔 Eventos

### Emit: update:modelValue

```typescript
$emit('update:modelValue', newValue: boolean)
```

**Cuándo:** Click en botón (si no está disabled)

---

## Notas Importantes

1. **Default false:** Valor por defecto es `false`
2. **Required = true:** Valida que el valor sea `true`, no solo que exista
3. **Button type:** Es un `<button>`, no un `<input type="checkbox">`
4. **Animación:** Transición de rotación en el ícono (0.5s)
5. **Hover effect:** Fondo gris en hover
6. **Iconos Google:** Usa `GGICONS.CHECK` y `GGICONS.CANCEL`

---

## Alternativas

Para casos especiales, considera:
- **Checkbox HTML nativo:** Si necesitas compatibilidad con formularios HTML
- **Switch component:** Si quieres un toggle tipo iOS
- **Radio buttons:** Para opciones múltiples excluyentes

---

## Personalización de Iconos

Los iconos se pueden cambiar modificando:

```typescript
{{ modelValue ? GGICONS.CHECK : GGICONS.CANCEL }}
```

**Alternativas:**
```typescript
// Toggle
{{ modelValue ? GGICONS.TOGGLE_ON : GGICONS.TOGGLE_OFF }}

// Star
{{ modelValue ? GGICONS.STAR : GGICONS.STAR_OUTLINE }}

// Heart
{{ modelValue ? GGICONS.FAVORITE : GGICONS.FAVORITE_BORDER }}
```

---

## Referencias

- **Overview:** `form-inputs.md`
- **Composable:** `useInputMetadata-composable.md`
- **Required Decorator:** `../01-decorators/required-decorator.md`
- **Disabled Decorator:** `../01-decorators/disabled-decorator.md`
- **Icons:** `src/constants/ggicons.ts`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
