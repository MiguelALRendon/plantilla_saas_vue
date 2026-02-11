# 📅 DateInputComponent - Selector de Fecha con Calendario

**Referencias:**
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadatos
- [text-input-component.md](text-input-component.md) - Input de texto base
- `../../tutorials/02-validations.md` - Sistema de validaciones

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/DateInputComponent.vue`  
**Tipo de propiedad:** `Date`

---

## 🎯 Propósito

Componente para selección de fechas con **picker nativo del navegador**. Características:

- ✅ Input visual formateado (DD/MM/YYYY)
- ✅ Input oculto nativo `type="date"` (YYYY-MM-DD)
- ✅ Botón con icono de calendario 📅
- ✅ Picker nativo del navegador
- ✅ Validación de 3 niveles del framework

---

## 🔧 Activación Automática

El componente se genera automáticamente cuando:

```typescript
@PropertyName('Birth Date', Date)  // ← Tipo Date activa DateInputComponent
birthDate!: Date;
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
        type: String,  // ← Formato: 'YYYY-MM-DD'
        required: true,
        default: '',
    },
}
```

---

## 📐 Template

```vue
<template>
<div class="TextInput DateInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <!-- Label -->
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>
    
    <!-- Input visual (readonly, muestra formato DD/MM/YYYY) -->
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" " 
        :value="formattedDate"  <!-- ← Fecha formateada -->
        :disabled="metadata.disabled.value"
        readonly  <!-- ← Solo lectura -->
    />
    
    <!-- Input oculto (date picker nativo) -->
    <input 
        ref="dateInput"
        :id="'date-id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="date"  <!-- ← Picker nativo -->
        class="date-input"  <!-- ← Oculto con CSS -->
        :value="modelValue"  <!-- ← Formato YYYY-MM-DD -->
        :disabled="metadata.disabled.value"
        @input="updateDate" 
    />
    
    <!-- Botón que abre el calendario -->
    <button 
        class="right" 
        @click="openCalendar" 
        :disabled="metadata.disabled.value"
    >
        <span :class="GGCLASS">{{ GGICONS.CALENDAR }}</span>
    </button>
</div>

<!-- Help text -->
<div class="help-text" v-if="metadata.helpText.value">
    <span>{{ metadata.helpText.value }}</span>
</div>

<!-- Validation messages -->
<div class="validation-messages">
    <span v-for="message in validationMessages" :key="message">
        {{ message }}
    </span>
</div>
</template>
```

---

## 🎨 Arquitectura de Doble Input

### Input Visual (Display)
```vue
<input 
    type="text" 
    :value="formattedDate"  <!-- "25/12/2025" -->
    readonly
/>
```
- **Propósito:** Mostrar fecha al usuario en formato legible
- **Características:** Solo lectura, no editable directamente

### Input Oculto (Picker)
```vue
<input 
    ref="dateInput"
    type="date"
    :value="modelValue"  <!-- "2025-12-25" -->
    @input="updateDate"
    class="date-input"  <!-- visibility: hidden -->
/>
```
- **Propósito:** Abrir picker nativo del navegador
- **Características:** Oculto con CSS, formato ISO 8601

### Flujo de Interacción

```
Usuario click en botón 📅
    ↓
openCalendar() ejecuta
    ↓
this.$refs.dateInput.showPicker()
    ↓
Picker nativo se abre
    ↓
Usuario selecciona fecha
    ↓
@input="updateDate" ejecuta
    ↓
$emit('update:modelValue', 'YYYY-MM-DD')
    ↓
v-model actualiza entity.birthDate
    ↓
formattedDate computed se recalcula
    ↓
Input visual muestra "DD/MM/YYYY"
```

---

## 🔄 Computed Property: formattedDate

```typescript
computed: {
    formattedDate(): string {
        if (!this.modelValue) return '';
        
        // Crear fecha desde string YYYY-MM-DD
        const date = new Date(this.modelValue + 'T00:00:00');
        
        // Validar fecha
        if (isNaN(date.getTime())) return '';
        
        // Formatear a DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }
}
```

**Ejemplos:**
```typescript
modelValue: '2025-12-25' → formattedDate: '25/12/2025'
modelValue: '2024-01-01' → formattedDate: '01/01/2024'
modelValue: ''           → formattedDate: ''
modelValue: 'invalid'    → formattedDate: ''
```

---

## 🔧 Métodos Principales

### updateDate()

```typescript
methods: {
    updateDate(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.$emit('update:modelValue', value);
    }
}
```

**Flujo:**
1. Usuario selecciona fecha en picker
2. Input hidden dispara @input
3. updateDate() extrae valor (YYYY-MM-DD)
4. Emite update:modelValue
5. v-model actualiza entity

### openCalendar()

```typescript
openCalendar() {
    (this.$refs.dateInput as HTMLInputElement).showPicker();
}
```

**API Nativa:**
- `showPicker()` - Método HTML5 que abre el date picker
- **Soporte:** Chrome 99+, Edge 99+, Safari 16+
- **Fallback:** Click directo en input funciona en navegadores antiguos

---

## ✅ Sistema de Validación (3 Niveles)

### Nivel 1: Required

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

**Ejemplo: Validar edad mínima**
```typescript
@Validation(
    (entity) => {
        if (!entity.birthDate) return true;
        const date = new Date(entity.birthDate);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age >= 18;
    },
    'Must be at least 18 years old'
)
birthDate!: string;
```

### Nivel 3: Validación Asíncrona

```typescript
const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
if (!isAsyncValid) {
    validated = false;
    const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
    if (asyncMessage) {
        this.validationMessages.push(asyncMessage);
    }
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
    Validation,
    HelpText,
    ViewGroup
} from '@/decorations';

export class Employee extends BaseEntity {
    @ViewGroup('Personal Information')
    @PropertyIndex(1)
    @PropertyName('Birth Date', Date)  // ← Genera DateInputComponent
    @Required(true, 'Birth date is required')
    @HelpText('Must be at least 18 years old')
    @Validation(
        (entity) => {
            if (!entity.birthDate) return false;
            const birthDate = new Date(entity.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return age - 1 >= 18;
            }
            return age >= 18;
        },
        'Employee must be at least 18 years old'
    )
    birthDate!: string;
    
    @ViewGroup('Employment')
    @PropertyIndex(2)
    @PropertyName('Hire Date', Date)
    @Required(true)
    @Validation(
        (entity) => {
            if (!entity.hireDate) return false;
            const hireDate = new Date(entity.hireDate);
            const today = new Date();
            return hireDate <= today;
        },
        'Hire date cannot be in the future'
    )
    hireDate!: string;
}
```

### UI Generada

```
┌─────────────────────────────────────┐
│ Personal Information                │
│ ┌─────────────────────────────────┐ │
│ │ Birth Date                      │ │
│ │ ┌─────────────────────────┬───┐│ │
│ │ │ 15/03/1990              │📅 ││ │
│ │ └─────────────────────────┴───┘│ │
│ │ Must be at least 18 years old  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Employment                          │
│ ┌─────────────────────────────────┐ │
│ │ Hire Date                       │ │
│ │ ┌─────────────────────────┬───┐│ │
│ │ │ 01/01/2025              │📅 ││ │
│ │ └─────────────────────────┴───┘│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 💡 Buenas Prácticas

### ✅ DO:

```typescript
// Validar rango de fechas
@Validation(
    (entity) => {
        const start = new Date(entity.startDate);
        const end = new Date(entity.endDate);
        return end >= start;
    },
    'End date must be after start date'
)
endDate!: string;

// Validar edad mínima
@Validation(
    (entity) => {
        const age = calculateAge(entity.birthDate);
        return age >= 18;
    },
    'Must be 18 or older'
)
birthDate!: string;

// Usar help text descriptivo
@HelpText('Select the date when the contract starts')
startDate!: string;
```

### ❌ DON'T:

```typescript
// No usar String para fechas
@PropertyName('Birth Date', String)  // ❌ Incorrecto
birthDate!: string;

// Usar Date:
@PropertyName('Birth Date', Date)  // ✅ Correcto
birthDate!: string;

// No omitir validación de rangos
@PropertyName('End Date', Date)  // ❌ Sin validación
endDate!: string;
```

---

## 🧪 Casos de Uso Comunes

### 1. Fecha de Nacimiento

```typescript
@PropertyName('Birth Date', Date)
@Required(true)
@Validation(
    (entity) => calculateAge(entity.birthDate) >= 18,
    'Must be at least 18 years old'
)
birthDate!: string;
```

### 2. Rango de Fechas

```typescript
@PropertyName('Start Date', Date)
@Required(true)
startDate!: string;

@PropertyName('End Date', Date)
@Required(true)
@Validation(
    (entity) => new Date(entity.endDate) >= new Date(entity.startDate),
    'End date must be after start date'
)
endDate!: string;
```

### 3. Fecha Futura (Reservas)

```typescript
@PropertyName('Reservation Date', Date)
@Required(true)
@Validation(
    (entity) => new Date(entity.reservationDate) > new Date(),
    'Reservation must be in the future'
)
reservationDate!: string;
```

---

## 🔗 Referencias

- **TextInputComponent:** [text-input-component.md](text-input-component.md)
- **Validation Decorator:** `../../01-decorators/validation-decorator.md`
- **useInputMetadata:** [useInputMetadata-composable.md](useInputMetadata-composable.md)
- **Tutorial Validaciones:** `../../tutorials/02-validations.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual)
