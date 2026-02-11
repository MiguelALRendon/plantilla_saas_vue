# ✅ BooleanInputComponent - Input de Boolean

**Referencias:**
- `form-inputs.md` - Overview del sistema de inputs
- `useInputMetadata-composable.md` - Composable de metadatos

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/BooleanInputComponent.vue`  
**Export:** `src/components/Form/index.ts`

---

## 🎯 Propósito

Componente tipo **toggle button** para propiedades booleanas. Muestra iconos de CHECK (✓) o CANCEL (✗) según el estado.

**Uso automático:**  
Se genera automáticamente para propiedades de tipo `Boolean`.

---

## 📦 Props

```typescript
props: {
    entityClass: {
        type: Function as unknown as () => typeof BaseEntity,
        required: true,
    },
    entity: {
        type: Object as () => BaseEntity,
        required: true,
    },
    propertyKey: {
        type: String,
        required: true,
    },
    modelValue: {
        type: Boolean,
        required: true,
        default: false,
    },
}
```

---

## 🎨 Template

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

## 🔧 Script

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

## 🎨 Estados Visuales

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

## ✅ Sistema de Validación

### isValidated()

```typescript
async isValidated(): Promise<boolean> {
    var validated = true;
    this.validationMessages = [];
    
    // Required: debe ser true
    if (this.metadata.required.value && !this.modelValue) {
        validated = false;
        this.validationMessages.push(
            this.metadata.requiredMessage.value || 
            `${this.metadata.propertyName} is required.`
        );
    }
    
    // Sync validation
    if (!this.metadata.validated.value) {
        validated = false;
        this.validationMessages.push(
            this.metadata.validatedMessage.value || 
            `${this.metadata.propertyName} is not valid.`
        );
    }
    
    // Async validation
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

## 🎓 Ejemplos de Uso

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

## 🎨 Estilos Personalizados (Scoped)

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
    margin-block: .5rem;
    padding: 0.5rem .25rem;
    cursor: pointer;
    align-items: center;
    border-radius: 1rem;
    transition: 0.5s ease;
    border: 0px solid transparent;
}

.BooleanInput:hover {
    background-color: var(--bg-gray);
}
```

### Label

```css
.BooleanInput .label-input-boolean {
    color: var(--lavender);
    font-size: 1rem;
    height: fit-content;
    cursor: pointer;
}
```

### Ícono

```css
.BooleanInput .input-button {
    margin-left: 1rem;
}

.BooleanInput .input-button .icon {
    transform: rotate(180deg);
    transition: 0.5s ease;
    color: var(--accent-red);
    border-radius: 100%;
}

.BooleanInput .input-button.true .icon {
    transform: rotate(0deg);
    background-color: var(--btn-info);
    color: var(--white);
}
```

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

## 📝 Notas Importantes

1. **Default false:** Valor por defecto es `false`
2. **Required = true:** Valida que el valor sea `true`, no solo que exista
3. **Button type:** Es un `<button>`, no un `<input type="checkbox">`
4. **Animación:** Transición de rotación en el ícono (0.5s)
5. **Hover effect:** Fondo gris en hover
6. **Iconos Google:** Usa `GGICONS.CHECK` y `GGICONS.CANCEL`

---

## 🔧 Alternativas

Para casos especiales, considera:
- **Checkbox HTML nativo:** Si necesitas compatibilidad con formularios HTML
- **Switch component:** Si quieres un toggle tipo iOS
- **Radio buttons:** Para opciones múltiples excluyentes

---

## 🎨 Personalización de Iconos

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

## 🔗 Referencias

- **Overview:** `form-inputs.md`
- **Composable:** `useInputMetadata-composable.md`
- **Required Decorator:** `../../01-decorators/required-decorator.md`
- **Disabled Decorator:** `../../01-decorators/disabled-decorator.md`
- **Icons:** `src/constants/ggicons.ts`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
