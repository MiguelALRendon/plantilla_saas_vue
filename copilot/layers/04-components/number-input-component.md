# 🔢 NumberInputComponent - Input Numérico

**Referencias:**
- `form-inputs.md` - Overview del sistema de inputs
- `useInputMetadata-composable.md` - Composable de metadatos
- `../../01-decorators/display-format-decorator.md` - Formato de números

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/NumberInputComponent.vue`  
**Export:** `src/components/Form/index.ts`

---

## 🎯 Propósito

Componente de input numérico con **botones de incremento/decremento** y **format display opcional**. Acepta números enteros y decimales.

**Uso automático:**  
Se genera automáticamente para propiedades de tipo `Number`.

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
        type: Number,
        required: true,
        default: 0,
    },
}
```

---

## 🎨 Template

```vue
<template>
<div class="TextInput NumberInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>
    
    <!-- Botón decrementar -->
    <button class="left" @click="decrementValue" :disabled="metadata.disabled.value">
        <span :class="GGCLASS">{{ GGICONS.REMOVE }}</span>
    </button>

    <!-- Input numérico -->
    <input
        type="text"
        class="main-input"
        :value="displayValue"
        :disabled="metadata.disabled.value"
        @keypress="handleKeyPress"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
    />

    <!-- Botón incrementar -->
    <button class="right" @click="incrementValue" :disabled="metadata.disabled.value">
        <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
    </button>
</div>

<div class="help-text" v-if="metadata.helpText.value">
    <span>{{ metadata.helpText.value }}</span>
</div>

<div class="validation-messages">
    <span v-for="message in validationMessages" :key="message">
        {{ message }}
    </span>
</div>
</template>
```

---

## 🔧 Script

### Data

```typescript
data() {
    return {
        GGICONS,
        GGCLASS,
        textInputId: 'text-input-' + this.propertyKey,
        isInputValidated: true,
        validationMessages: [] as string[],
        isFocused: false,  // Controla formato display
    }
}
```

---

## 🎯 Methods Especiales

### handleKeyPress()

Valida teclas permitidas **antes** de que se ingresen:

```typescript
handleKeyPress(event: KeyboardEvent) {
    const char = event.key;
    const currentValue = (event.target as HTMLInputElement).value;
    
    // Permitir: números, punto decimal, signo menos al inicio
    const isNumber = /^\d$/.test(char);
    const isDot = char === '.' && !currentValue.includes('.');
    const isMinus = char === '-' && currentValue.length === 0;
    
    if (!isNumber && !isDot && !isMinus) {
        event.preventDefault();
    }
}
```

**Validaciones:**
- ✅ Números (0-9)
- ✅ Punto decimal (solo si no existe ya)
- ✅ Signo menos (solo al inicio)
- ❌ Letras, símbolos, espacios

### handleInput()

Convierte string a número y emite actualización:

```typescript
handleInput(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    
    // Permitir valores intermedios
    if (inputValue === '' || inputValue === '-') {
        return;
    }
    
    const numValue = parseFloat(inputValue);
    
    if (!isNaN(numValue)) {
        this.$emit('update:modelValue', numValue);
    }
}
```

**Casos especiales:**
- `''` (vacío) → No emite, espera más input
- `'-'` (solo signo) → No emite, espera número
- `'123'` → Emite `123`
- `'12.5'` → Emite `12.5`

### handleFocus() / handleBlur()

```typescript
handleFocus() {
    this.isFocused = true;
},
handleBlur() {
    this.isFocused = false;
    // Corregir valores inválidos
    if (this.modelValue === null || this.modelValue === undefined || isNaN(this.modelValue)) {
        this.$emit('update:modelValue', 0);
    }
}
```

**Flujo:**
1. **Focus:** Muestra valor raw (sin formato)
2. **Blur:** Muestra valor formateado + corrige inválidos a 0

### incrementValue() / decrementValue()

```typescript
incrementValue() {
    const newValue = (this.modelValue || 0) + 1;
    this.$emit('update:modelValue', newValue);
},
decrementValue() {
    const newValue = (this.modelValue || 0) - 1;
    this.$emit('update:modelValue', newValue);
}
```

---

## 💎 Computed: displayValue

Alterna entre valor raw y formateado:

```typescript
computed: {
    displayValue(): string {
        // Durante edición: valor raw
        if (this.isFocused) {
            return this.modelValue?.toString() || '';
        }
        
        // Fuera de foco: aplicar formato si existe
        const format = this.entity.getDisplayFormat(this.propertyKey);
        
        if (format) {
            return this.entity.getFormattedValue(this.propertyKey);
        }
        
        return this.modelValue?.toString() || '0';
    }
}
```

**Ejemplo:**
```typescript
@DisplayFormat((entity) => `$${entity.price.toFixed(2)}`)
price!: number;

// Con focus: "99.99"
// Sin focus: "$99.99"
```

---

## ✅ Sistema de Validación

### isValidated()

```typescript
async isValidated(): Promise<boolean> {
    var validated = true;
    this.validationMessages = [];
    
    // Required: validar null/undefined
    if (this.metadata.required.value && (this.modelValue === null || this.modelValue === undefined)) {
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

**Diferencias con TextInput:**
- Valida `null` y `undefined` (no valida 0)
- No hace `trim()` (números no tienen espacios)

---

## 🎓 Ejemplos de Uso

### 1. Precio con Formato

```typescript
@PropertyName('Price', Number)
@Required(true)
@Validation((e) => e.price > 0, 'Price must be positive')
@DisplayFormat((e) => `$${e.price.toFixed(2)}`)
@HelpText('Product price in USD')
price!: number;
```

**Comportamiento:**
- Usuario escribe: `99.99`
- Durante edición: Input muestra `99.99`
- Al hacer blur: Input muestra `$99.99`

### 2. Cantidad de Stock

```typescript
@PropertyName('Stock Quantity', Number)
@Required(true)
@Validation((e) => e.stock >= 0 && Number.isInteger(e.stock), 'Must be a positive integer')
stock!: number;
```

**Comportamiento:**
- Click en `+`: Incrementa de 1 en 1
- Click en `-`: Decrementa de 1 en 1
- Usuario puede escribir directamente

### 3. Porcentaje

```typescript
@PropertyName('Discount %', Number)
@Validation((e) => e.discount >= 0 && e.discount <= 100, 'Must be between 0 and 100')
@DisplayFormat((e) => `${e.discount}%`)
discount!: number;
```

### 4. Temperatura (Negativos)

```typescript
@PropertyName('Temperature (°C)', Number)
@DisplayFormat((e) => `${e.temperature}°C`)
temperature!: number;  // Permite negativos
```

---

## 🔔 Eventos

### Emit: update:modelValue

```typescript
$emit('update:modelValue', newValue: number)
```

**Cuándo:**
- Usuario escribe y hace blur
- Click en botón `+` o `-`

---

## 🎨 Estados Visuales

### Layout de Botones

```
┌──────────────────────────────┐
│  Label                       │
├──┬──────────────────────┬────┤
│- │  [Input]            │ + │
└──┴──────────────────────┴────┘
```

### CSS Classes

- `.NumberInput` - Estilo específico de número
- `.left` - Botón decrementar
- `.right` - Botón incrementar
- `.disabled` - Estado deshabilitado
- `.nonvalidated` - Estado inválido

---

## 📝 Notas Importantes

1. **Default 0:** Si valor es `null`/`undefined`, se asigna `0` en blur
2. **Decimales permitidos:** Acepta punto decimal automáticamente
3. **Signo menos:** Solo al inicio del número
4. **Display format:** Solo se aplica cuando input NO tiene focus
5. **Type="text":** No usa `type="number"` para tener control total
6. **Validación en keypress:** Previene ingreso de caracteres inválidos

---

## 🔧 Compatibilidad con Decimales

```typescript
// Enteros
123    ✅
-456   ✅

// Decimales
12.5   ✅
-0.99  ✅
.5     ❌ (debe iniciar con 0)

// Inválidos
abc    ❌ Bloqueado por keypress
12..5  ❌ Solo un punto permitido
- 5    ❌ Sin espacios
```

---

## 🔗 Referencias

- **Overview:** `form-inputs.md`
- **Composable:** `useInputMetadata-composable.md`
- **DisplayFormat Decorator:** `../../01-decorators/display-format-decorator.md`
- **Validation Decorator:** `../../01-decorators/validation-decorator.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
