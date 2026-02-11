# 📧 EmailInputComponent - Input de Email con Validación HTML5

**Referencias:**
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadatos
- [text-input-component.md](text-input-component.md) - Input de texto base
- `../../01-decorators/string-type-decorator.md` - Decorador StringTypeDef
- `../../tutorials/02-validations.md` - Sistema de validaciones

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/EmailInputComponent.vue`  
**Tipo de propiedad:** `String` con `@StringTypeDef(StringType.EMAIL)`

---

## 🎯 Propósito

Componente especializado para entrada y validación de direcciones de correo electrónico. Utiliza el tipo HTML5 `<input type="email">` que proporciona:

- ✅ Validación HTML5 nativa del formato de email
- ✅ Teclado optimizado en dispositivos móviles
- ✅ Icono visual de correo (📧) en el label
- ✅ Sistema de validación de 3 niveles del framework

---

## 🔧 Activación Automática

El componente se genera automáticamente cuando:

```typescript
@PropertyName('Email', String)
@StringTypeDef(StringType.EMAIL)  // ← Activa EmailInputComponent
email!: string;
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
    <!-- Label con icono de correo -->
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }} 
        <span :class="GGCLASS" class="icon">{{ GGICONS.MAIL }}</span>
    </label>
    
    <!-- Input tipo email -->
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="email"  <!-- ← Validación HTML5 -->
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', $event.target.value)" 
    />
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

## 🎨 Características Visuales

### Icono de Correo

```vue
<span :class="GGCLASS" class="icon">{{ GGICONS.MAIL }}</span>
```

**Renderiza:**
```
┌─────────────────────────────────────┐
│ Email Address 📧                    │
│ ┌─────────────────────────────────┐ │
│ │ user@example.com                │ │
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

## ✅ Sistema de Validación (3 Niveles)

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

**Punto clave:** Usa `.trim()` para evitar espacios en blanco como valor válido.

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

**Activado por:**
```typescript
@Validation(
    (entity) => entity.email.includes('@'), 
    'Email must contain @'
)
email!: string;
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

**Activado por:**
```typescript
@AsyncValidation(
    async (entity) => {
        const response = await fetch(`/api/check-email?email=${entity.email}`);
        const data = await response.json();
        return !data.exists;
    },
    'Email already registered'
)
email!: string;
```

---

## 📱 Validación HTML5 Nativa

El tipo `type="email"` proporciona validación del navegador:

### Qué valida el navegador:
- ✅ Formato básico: `texto@dominio.extension`
- ✅ No permite espacios
- ✅ Requiere `@` y `.`

### Qué NO valida:
- ❌ Existencia del dominio
- ❌ Formato RFC completo
- ❌ Unicidad del email

**Ejemplo de validación HTML5:**
```
usuario@ejemplo.com  ✅ Válido
usuario@ejemplo      ❌ Inválido (falta TLD)
usuario.ejemplo.com  ❌ Inválido (falta @)
usuario @ejemplo.com ❌ Inválido (espacios)
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
    AsyncValidation,
    HelpText,
    ViewGroup,
    Validation
} from '@/decorations';
import { StringType } from '@/enums/string_type';

export class User extends BaseEntity {
    @ViewGroup('Contact Information')
    @PropertyIndex(1)
    @PropertyName('Email Address', String)
    @StringTypeDef(StringType.EMAIL)  // ← Genera EmailInputComponent
    @Required(true, 'Email is required')
    @HelpText('Enter a valid email address')
    @Validation(
        (entity) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email),
        'Invalid email format'
    )
    @AsyncValidation(
        async (entity) => {
            if (!entity.email) return true;
            const response = await fetch(`/api/users/check-email?email=${entity.email}`);
            const { available } = await response.json();
            return available;
        },
        'This email is already registered'
    )
    email!: string;
    
    @ViewGroup('Contact Information')
    @PropertyIndex(2)
    @PropertyName('Secondary Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(false)
    secondaryEmail?: string;
}
```

### UI Generada

```vue
<!-- Email Address -->
<div class="TextInput">
    <label>Email Address 📧</label>
    <input 
        type="email" 
        v-model="user.email" 
        placeholder=" "
    />
    <div class="help-text">
        <span>Enter a valid email address</span>
    </div>
    <div class="validation-messages" v-if="!isValid">
        <span>Email is required</span>
        <span>Invalid email format</span>
        <span>This email is already registered</span>
    </div>
</div>

<!-- Secondary Email -->
<div class="TextInput">
    <label>Secondary Email 📧</label>
    <input 
        type="email" 
        v-model="user.secondaryEmail" 
        placeholder=" "
    />
</div>
```

---

## 🔄 Flujo de Validación

```
Usuario escribe email
    ↓
@input emite 'update:modelValue'
    ↓
v-model actualiza entity.email
    ↓
Usuario intenta guardar
    ↓
BaseEntity llama validateInputs()
    ↓
Event bus emite 'validate-inputs'
    ↓
EmailInputComponent.handleValidation()
    ↓
1. Verifica required (con trim)
    ↓
2. Ejecuta validación síncrona (regex)
    ↓
3. Ejecuta validación asíncrona (API)
    ↓
Si alguna falla: Application.View.value.isValid = false
    ↓
Muestra mensajes de error en UI
```

---

## 🆚 Diferencias con TextInputComponent

| Aspecto | TextInputComponent | EmailInputComponent |
|---------|-------------------|---------------------|
| **type** | `text` | `email` |
| **Validación HTML5** | Ninguna | Formato de email |
| **Icono en label** | No | Sí (📧 MAIL) |
| **Teclado móvil** | Estándar | Email (@, .com) |
| **Activación** | `String` por defecto | `@StringTypeDef(StringType.EMAIL)` |

---

## 💡 Buenas Prácticas

### ✅ DO:

```typescript
// Usar validación async para unicidad
@AsyncValidation(
    async (entity) => await checkEmailUnique(entity.email),
    'Email already exists'
)
email!: string;

// Combinar con regex para formato estricto
@Validation(
    (entity) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(entity.email),
    'Invalid email format'
)
email!: string;

// Usar help text descriptivo
@HelpText('We will use this email for important notifications')
email!: string;
```

### ❌ DON'T:

```typescript
// No usar StringType.TEXT para emails
@StringTypeDef(StringType.TEXT)  // ❌ Incorrecto
email!: string;

// No omitir validación de formato
@PropertyName('Email', String)  // ❌ Sin validación
email!: string;

// No usar required sin trim (ya está implementado)
@Required(true)  // ✅ Ya valida con trim automáticamente
email!: string;
```

---

## 🧪 Casos de Uso Comunes

### 1. Login/Registro

```typescript
@PropertyName('Email', String)
@StringTypeDef(StringType.EMAIL)
@Required(true, 'Email is required to sign up')
@AsyncValidation(
    async (entity) => !(await emailExists(entity.email)),
    'This email is already taken'
)
email!: string;
```

### 2. Contacto Secundario (Opcional)

```typescript
@PropertyName('Alternative Email', String)
@StringTypeDef(StringType.EMAIL)
@Required(false)
alternativeEmail?: string;
```

### 3. Email con Dominio Específico

```typescript
@PropertyName('Corporate Email', String)
@StringTypeDef(StringType.EMAIL)
@Required(true)
@Validation(
    (entity) => entity.corporateEmail.endsWith('@company.com'),
    'Must use company email (@company.com)'
)
corporateEmail!: string;
```

---

## 🔗 Referencias

- **TextInputComponent:** [text-input-component.md](text-input-component.md)
- **StringTypeDef Decorator:** `../../01-decorators/string-type-decorator.md`
- **AsyncValidation:** `../../01-decorators/async-validation-decorator.md`
- **useInputMetadata:** [useInputMetadata-composable.md](useInputMetadata-composable.md)

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual)
