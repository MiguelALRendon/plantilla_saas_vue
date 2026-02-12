# TextInputComponent

## 1. Propósito

Componente de input de texto plano para propiedades de tipo `String` sin subtipo especial definido por `@StringTypeDef`.

**Uso automático:**  
Se genera automáticamente para propiedades `String` con `StringType.TEXT` o sin decorador `@StringTypeDef`.

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
        type: String,
        required: true,
        default: '',
    },
}
```

### Descripción de Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `entityClass` | `typeof BaseEntity` | ✅ | Clase de la entidad |
| `entity` | `BaseEntity` | ✅ | Instancia de la entidad |
| `propertyKey` | `string` | ✅ | Nombre de la propiedad |
| `modelValue` | `string` | ✅ | Valor actual (v-model) |

---

## 🎨 Template

```vue
<template>
<div class="TextInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <label 
        :for="'id-' + metadata.propertyName" 
        class="label-input">
        {{ metadata.propertyName }}
    </label>

    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" 
    />
    
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

### Setup

```typescript
setup(props) {
    const metadata = useInputMetadata(
        props.entityClass, 
        props.entity, 
        props.propertyKey
    );
    return { metadata };
}
```

### Data

```typescript
data() {
    return {
        textInputId: 'text-input-' + this.propertyKey,
        isInputValidated: true,
        validationMessages: [] as string[],
    }
}
```

### Lifecycle Hooks

```typescript
mounted() {
    Application.eventBus.on('validate-inputs', this.handleValidation);
},
beforeUnmount() {
    Application.eventBus.off('validate-inputs', this.handleValidation);
}
```

### Methods

#### isValidated()

```typescript
async isValidated(): Promise<boolean> {
    var validated = true;
    this.validationMessages = [];
    
    // NIVEL 1: Required validation
    if (this.metadata.required.value && (!this.modelValue || this.modelValue.trim() === '')) {
        validated = false;
        this.validationMessages.push(
            this.metadata.requiredMessage.value || 
            `${this.metadata.propertyName} is required.`
        );
    }
    
    // NIVEL 2: Sync validation
    if (!this.metadata.validated.value) {
        validated = false;
        this.validationMessages.push(
            this.metadata.validatedMessage.value || 
            `${this.metadata.propertyName} is not valid.`
        );
    }
    
    // NIVEL 3: Async validation
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

#### handleValidation()

```typescript
async handleValidation() {
    this.isInputValidated = await this.isValidated();
    if (!this.isInputValidated) {
        Application.View.value.isValid = false;
    }
}
```

---

## 🔄 Flujo de Datos (v-model)

```
Usuario escribe en input
    ↓
@input emite 'update:modelValue' con nuevo valor
    ↓
v-model actualiza entity[propertyKey]
    ↓
Vue reactivity propaga cambio
    ↓
entity.getDirtyState() detecta cambio
```

**Código:**
```vue
<input 
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" 
/>
```

---

## ✅ Sistema de Validación

### Nivel 1: Required

```typescript
if (this.metadata.required.value && (!this.modelValue || this.modelValue.trim() === '')) {
    validated = false;
}
```

**Nota:** Valida strings vacíos y solo espacios (`trim()`).

**Activado por:**
```typescript
@Required(true, 'Name is required')
name!: string;
```

### Nivel 2: Validación Síncrona

```typescript
if (!this.metadata.validated.value) {
    validated = false;
}
```

**Activado por:**
```typescript
@Validation((entity) => entity.name.length >= 3, 'Minimum 3 characters')
name!: string;
```

### Nivel 3: Validación Asíncrona

```typescript
const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
if (!isAsyncValid) {
    validated = false;
}
```

**Activado por:**
```typescript
@AsyncValidation(
    async (entity) => await checkNameUnique(entity.name),
    'Name already exists'
)
name!: string;
```

---

## 🎨 Estados Visuales (CSS)

### Normal

```css
.TextInput {
    /* Estado normal */
}
```

### Disabled

```css
.TextInput.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
}
```

**Activado por:**
```typescript
@Disabled(true)
// o
@Disabled((entity) => entity.isLocked)
name!: string;
```

### No Validado

```css
.TextInput.nonvalidated {
    /* Styling de error */
}
.TextInput.nonvalidated label {
    color: var(--red);
}
```

**Activado cuando:** `isInputValidated === false`

---

## 🎓 Ejemplo de Uso

### Definición en Entidad

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required(true, 'Product name is required')
    @HelpText('Enter the display name for this product')
    @Validation(
        (entity) => entity.name.length >= 3 && entity.name.length <= 100,
        'Name must be between 3 and 100 characters'
    )
    name!: string;
}
```

### Uso en DefaultDetailView

```vue
<TextInputComponent
    :entity-class="Product"
    :entity="product"
    property-key="name"
    v-model="product.name"
/>
```

### Resultado Visual

```html
<!-- Input generado -->
<div class="TextInput">
    <label for="id-Product Name">Product Name</label>
    <input 
        id="id-Product Name"
        name="Product Name"
        type="text"
        value="Widget"
    />
    <div class="help-text">
        <span>Enter the display name for this product</span>
    </div>
    <div class="validation-messages">
        <!-- Vacío si todo es válido -->
    </div>
</div>
```

---

## 🔔 Eventos

### Emit: update:modelValue

```typescript
$emit('update:modelValue', newValue)
```

**Cuándo:** Cada vez que el usuario escribe en el input  
**Parámetro:** Nuevo valor del input (string)  
**Uso:** v-model binding

---

## 🎯 Casos de Uso

### 1. Nombre de Usuario

```typescript
@PropertyName('Username', String)
@Required(true)
@Validation((e) => /^[a-zA-Z0-9_]+$/.test(e.username), 'Only letters, numbers and underscore')
username!: string;
```

### 2. Código de Producto

```typescript
@PropertyName('SKU', String)
@Required(true)
@Validation((e) => /^[A-Z]{3}-\d{4}$/.test(e.sku), 'Format: ABC-1234')
@AsyncValidation(async (e) => await checkSKUUnique(e.sku), 'SKU already exists')
sku!: string;
```

### 3. Descripción Corta

```typescript
@PropertyName('Short Description', String)
@HelpText('Max 255 characters')
@Validation((e) => e.shortDesc.length <= 255, 'Too long')
shortDesc!: string;
```

---

## 📝 Notas Importantes

1. **Trim en required:** Valida que no sea solo espacios vacíos
2. **Event listener cleanup:** Se limpia automáticamente en `beforeUnmount()`
3. **Async validation:** Siempre se ejecuta después de required y sync validation
4. **isInputValidated:** Controla la clase CSS `nonvalidated`
5. **Help text:** Solo se muestra si existe en metadatos

---

## 🔧 Personalización

Para inputs de texto especializados, considera usar:
- `EmailInputComponent` - Para emails (type="email")
- `PasswordInputComponent` - Para contraseñas (type="password")
- `TextAreaComponent` - Para texto multilinea

---

## 🔗 Referencias

- **Overview:** `form-inputs.md`
- **Composable:** `useInputMetadata-composable.md`
- **Validación:** `../../02-base-entity/validation-system.md`
- **Required Decorator:** `../../01-decorators/required-decorator.md`
- **Validation Decorator:** `../../01-decorators/validation-decorator.md`
- **AsyncValidation Decorator:** `../../01-decorators/async-validation-decorator.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
