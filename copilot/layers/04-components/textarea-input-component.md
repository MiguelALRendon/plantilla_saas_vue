# 📝 TextAreaComponent - Área de Texto Multilinea

**Referencias:**
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadatos
- [text-input-component.md](text-input-component.md) - Input de texto base
- `../../01-decorators/string-type-decorator.md` - Decorador StringTypeDef
- `../../tutorials/02-validations.md` - Sistema de validaciones

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/TextAreaComponent.vue`  
**Tipo de propiedad:** `String` con `@StringTypeDef(StringType.TEXTAREA)`

---

## 🎯 Propósito

Componente para entrada de **texto multilínea** (párrafos, descripciones largas, comentarios). Características:

- ✅ Elemento `<textarea>` nativo
- ✅ Soporte para múltiples líneas
- ✅ Auto-resize según contenido
- ✅ Validación de 2 niveles (Required y Sync)

**Nota:** TextAreaComponent NO soporta validación asíncrona actualmente.

---

## 🔧 Activación Automática

El componente se genera automáticamente cuando:

```typescript
@PropertyName('Description', String)
@StringTypeDef(StringType.TEXTAREA)  // ← Activa TextAreaComponent
description!: string;
```

---

## 📋 Props

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
        type: String,
        required: true,
        default: '',
    },
}
```

---

## 📐 Template

```vue
<template>
<div class="TextInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <!-- Label -->
    <label 
        :for="'id-' + metadata.propertyName" 
        class="label-input"
    >
        {{ metadata.propertyName }}
    </label>

    <!-- Textarea element -->
    <textarea 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', $event.target.value)" 
    />
    
    <!-- Validation messages -->
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">
            {{ message }}
        </span>
    </div>
</div>
</template>
```

**Diferencias con TextInputComponent:**
- ✅ Usa `<textarea>` en lugar de `<input>`
- ✅ NO tiene help text (omitido en implementación)
- ✅ Casting a `HTMLTextAreaElement` en lugar de `HTMLInputElement`

---

## 🎨 Características Visuales

### Renderizado

```
┌─────────────────────────────────────┐
│ Description                         │
│ ┌─────────────────────────────────┐ │
│ │ This is a product description   │ │
│ │ that spans multiple lines.      │ │
│ │ It supports paragraphs and      │ │
│ │ line breaks.                    │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Estados CSS

```css
/* Normal */
.TextInput {
    /* Estilos base */
}

/* Disabled */
.TextInput.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Inválido */
.TextInput.nonvalidated {
    border-color: red;
}
```

---

## ✅ Sistema de Validación (2 Niveles)

**⚠️ IMPORTANTE:** TextAreaComponent actualmente **NO soporta validación asíncrona**. Solo niveles 1 y 2.

### Nivel 1: Required (trim)

```typescript
if (this.metadata.required.value && 
    (!this.modelValue || this.modelValue.trim() === '')) {
    validated = false;
    this.validationMessages.push(
        this.metadata.requiredMessage.value || 
        `${this.metadata.propertyName} is required.`
    );
}
```

### Nivel 2: Validación Síncrona

```typescript
if (!this.metadata.validated.value) {
    validated = false;
    this.validationMessages.push(
        this.metadata.validatedMessage.value || 
        `${this.metadata.propertyName} is not valid.`
    );
}
```

**Ejemplo: Validar longitud máxima**
```typescript
@Validation(
    (entity) => entity.description.length <= 500,
    'Description must be 500 characters or less'
)
description!: string;
```

---

## 🔄 Lifecycle y Event Handling

### Mounted

```typescript
mounted() {
    Application.eventBus.on('validate-inputs', this.saveItem);
}
```

**⚠️ NOTA:** El método está nombrado `saveItem` pero en realidad ejecuta validación. Es inconsistente con otros componentes que usan `handleValidation`.

### BeforeUnmount

```typescript
beforeUnmount() {
    Application.eventBus.off('validate-inputs', this.saveItem);
}
```

### Método de Validación

```typescript
methods: {
    isValidated(): boolean {  // ← Síncrono, NO async
        var validated = true;
        this.validationMessages = [];
        
        if (this.metadata.required.value && 
            (!this.modelValue || this.modelValue.trim() === '')) {
            validated = false;
            this.validationMessages.push(
                this.metadata.requiredMessage.value || 
                `${this.metadata.propertyName} is required.`
            );
        }
        
        if (!this.metadata.validated.value) {
            validated = false;
            this.validationMessages.push(
                this.metadata.validatedMessage.value || 
                `${this.metadata.propertyName} is not valid.`
            );
        }
        
        return validated;
    },
    
    saveItem() {  // ← Método mal nombrado
        this.isInputValidated = this.isValidated();
        if (!this.isInputValidated) {
            Application.View.value.isValid = false;
        }
    },
}
```

---

## 🎓 Ejemplo Completo

### Definición de Entidad

```typescript
import { BaseEntity } from './base_entitiy';
import {
    PropertyName,
    PropertyIndex,
    Required,
    StringTypeDef,
    Validation,
    ViewGroup
} from '@/decorations';
import { StringType } from '@/enums/string_type';

export class Product extends BaseEntity {
    @ViewGroup('Basic Information')
    @PropertyIndex(1)
    @PropertyName('Product Name', String)
    @Required(true)
    name!: string;
    
    @ViewGroup('Details')
    @PropertyIndex(2)
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)  // ← Genera TextAreaComponent
    @Required(true, 'Description is required')
    @Validation(
        (entity) => entity.description.length >= 20,
        'Description must be at least 20 characters'
    )
    @Validation(
        (entity) => entity.description.length <= 500,
        'Description must be 500 characters or less'
    )
    description!: string;
    
    @ViewGroup('Details')
    @PropertyIndex(3)
    @PropertyName('Additional Notes', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Required(false)
    notes?: string;
}
```

### UI Generada

```vue
<!-- Description (Required) -->
<div class="TextInput">
    <label>Description</label>
    <textarea 
        v-model="product.description"
        placeholder=" "
    ></textarea>
    
    <div class="validation-messages" v-if="!isValid">
        <span>Description is required</span>
        <span>Description must be at least 20 characters</span>
        <span>Description must be 500 characters or less</span>
    </div>
</div>

<!-- Additional Notes (Optional) -->
<div class="TextInput">
    <label>Additional Notes</label>
    <textarea 
        v-model="product.notes"
        placeholder=" "
    ></textarea>
</div>
```

---

## 💡 Buenas Prácticas

### ✅ DO:

```typescript
// Validar longitud mínima y máxima
@Validation(
    (entity) => {
        const len = entity.description.length;
        return len >= 20 && len <= 500;
    },
    'Description must be between 20 and 500 characters'
)
description!: string;

// Validar contenido (sin HTML)
@Validation(
    (entity) => !/<[^>]*>/g.test(entity.description),
    'HTML tags are not allowed'
)
description!: string;

// Usar para textos largos
@StringTypeDef(StringType.TEXTAREA)
comments!: string;
```

### ❌ DON'T:

```typescript
// No usar para textos cortos (usar TextInput)
@StringTypeDef(StringType.TEXTAREA)  // ❌ Overkill
firstName!: string;

// No usar validación asíncrona (no soportada)
@AsyncValidation(async (entity) => { ... })  // ❌ NO FUNCIONA
description!: string;

// No omitir validación de longitud máxima
@PropertyName('Description', String)  // ❌ Sin límite
@StringTypeDef(StringType.TEXTAREA)
description!: string;
```

---

## ⚠️ Limitaciones Actuales

### 1. No Soporta Validación Asíncrona

```typescript
// ❌ NO FUNCIONA
@AsyncValidation(
    async (entity) => await checkProfanity(entity.description),
    'Description contains inappropriate content'
)
description!: string;
```

**Razón:** El método `isValidated()` no es async y no ejecuta `isAsyncValidation()`.

### 2. No Tiene Help Text

```typescript
// ⚠️ NO SE MOSTRARÁ
@HelpText('Enter a detailed product description')
description!: string;
```

**Razón:** La sección de help text está omitida en el template.

### 3. Método Mal Nombrado

```typescript
mounted() {
    Application.eventBus.on('validate-inputs', this.saveItem);  // ← Debería ser handleValidation
}
```

**Impacto:** Solo confusión de naming, funciona correctamente.

---

## 🧪 Casos de Uso Comunes

### 1. Descripción de Producto

```typescript
@PropertyName('Product Description', String)
@StringTypeDef(StringType.TEXTAREA)
@Required(true)
@Validation(
    (entity) => entity.description.length >= 50 && entity.description.length <= 1000,
    'Description must be between 50 and 1000 characters'
)
description!: string;
```

### 2. Comentarios

```typescript
@PropertyName('Comments', String)
@StringTypeDef(StringType.TEXTAREA)
@Required(false)
comments?: string;
```

### 3. Dirección Postal

```typescript
@PropertyName('Full Address', String)
@StringTypeDef(StringType.TEXTAREA)
@Required(true)
@Validation(
    (entity) => entity.address.split('\n').length >= 2,
    'Address must include street and city'
)
address!: string;
```

### 4. Términos y Condiciones

```typescript
@PropertyName('Terms and Conditions', String)
@StringTypeDef(StringType.TEXTAREA)
@Required(true)
@Disabled(true)  // Solo lectura
terms!: string;
```

---

## 🆚 Diferencias con TextInputComponent

| Aspecto | TextInputComponent | TextAreaComponent |
|---------|-------------------|-------------------|
| **Elemento HTML** | `<input type="text">` | `<textarea>` |
| **Multilinea** | No | Sí |
| **Help Text** | Sí | No (omitido) |
| **Validación Async** | Sí | No |
| **Auto-resize** | No aplica | Sí (según contenido) |
| **Chars counter** | No | No |
| **Activación** | `String` por defecto | `@StringTypeDef(StringType.TEXTAREA)` |

---

## 🔗 Referencias

- **TextInputComponent:** [text-input-component.md](text-input-component.md)
- **StringTypeDef Decorator:** `../../01-decorators/string-type-decorator.md`
- **Validation Decorator:** `../../01-decorators/validation-decorator.md`
- **useInputMetadata:** [useInputMetadata-composable.md](useInputMetadata-composable.md)

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual, con limitaciones documentadas)
