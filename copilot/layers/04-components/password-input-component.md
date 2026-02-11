# 🔐 PasswordInputComponent - Input de Contraseña con Toggle de Visibilidad

**Referencias:**
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadatos
- [text-input-component.md](text-input-component.md) - Input de texto base
- `../../01-decorators/string-type-decorator.md` - Decorador StringTypeDef
- `../../tutorials/02-validations.md` - Sistema de validaciones

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/PasswordInputComponent.vue`  
**Tipo de propiedad:** `String` con `@StringTypeDef(StringType.PASSWORD)`

---

## 🎯 Propósito

Componente especializado para entrada de contraseñas con funcionalidad de **mostrar/ocultar contraseña**. Características:

- ✅ Toggle entre `type="password"` y `type="text"`
- ✅ Botón con icono de ojo (👁️ / 🙈)
- ✅ Validación de 3 niveles del framework
- ✅ Seguridad: Oculta contraseña por defecto

---

## 🔧 Activación Automática

El componente se genera automáticamente cuando:

```typescript
@PropertyName('Password', String)
@StringTypeDef(StringType.PASSWORD)  // ← Activa PasswordInputComponent
password!: string;
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
<div class="TextInput PasswordInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <!-- Label -->
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>
    
    <!-- Input con tipo dinámico -->
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        :type="showPassword ? 'text' : 'password'"  <!-- ← Toggle dinámico -->
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', $event.target.value)" 
    />
    
    <!-- Botón toggle visibilidad -->
    <button 
        class="right" 
        @click="togglePasswordVisibility" 
        :disabled="metadata.disabled.value"
    >
        <span :class="GGCLASS">
            {{ showPassword ? GGICONS.VISIBILITY_OFF : GGICONS.VISIBILITY }}
        </span>
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

## 🎨 Características Visuales

### Estado Oculto (Por Defecto)

```
┌─────────────────────────────────────┐
│ Password                            │
│ ┌───────────────────────────┬─────┐ │
│ │ ••••••••                  │ 👁️  │ │
│ └───────────────────────────┴─────┘ │
└─────────────────────────────────────┘
```

### Estado Visible (Click en botón)

```
┌─────────────────────────────────────┐
│ Password                            │
│ ┌───────────────────────────┬─────┐ │
│ │ myPassword123             │ 🙈  │ │
│ └───────────────────────────┴─────┘ │
└─────────────────────────────────────┘
```

---

## 🔄 Lógica de Toggle

### Data

```typescript
data() {
    return {
        GGICONS,
        GGCLASS,
        showPassword: false,  // ← Estado inicial: oculto
        isInputValidated: true,
        validationMessages: [] as string[],
    }
}
```

### Método Toggle

```typescript
methods: {
    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }
}
```

### Binding Dinámico del Tipo

```vue
<input :type="showPassword ? 'text' : 'password'" />
```

**Flujo:**
```
Estado inicial: showPassword = false
    ↓
Input renderiza: type="password" (••••)
    ↓
Usuario click en botón 👁️
    ↓
togglePasswordVisibility() ejecuta
    ↓
showPassword = true
    ↓
Input cambia a: type="text" (texto visible)
    ↓
Icono cambia: VISIBILITY → VISIBILITY_OFF (🙈)
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

**Ejemplo de validación de complejidad:**
```typescript
@Validation(
    (entity) => {
        const pwd = entity.password;
        return pwd.length >= 8 && 
               /[A-Z]/.test(pwd) && 
               /[a-z]/.test(pwd) && 
               /[0-9]/.test(pwd);
    },
    'Password must be 8+ chars with uppercase, lowercase, and number'
)
password!: string;
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

**Ejemplo: Verificar contraseña comprometida (Have I Been Pwned)**
```typescript
@AsyncValidation(
    async (entity) => {
        const hash = await sha1(entity.password);
        const response = await fetch(`https://api.pwnedpasswords.com/range/${hash.substring(0, 5)}`);
        const data = await response.text();
        return !data.includes(hash.substring(5));
    },
    'This password has been compromised in a data breach'
)
password!: string;
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
    HelpText,
    ViewGroup
} from '@/decorations';
import { StringType } from '@/enums/string_type';

export class User extends BaseEntity {
    @ViewGroup('Credentials')
    @PropertyIndex(1)
    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)  // ← Genera PasswordInputComponent
    @Required(true, 'Password is required')
    @HelpText('Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number')
    @Validation(
        (entity) => {
            const pwd = entity.password;
            if (!pwd) return false;
            return pwd.length >= 8 && 
                   /[A-Z]/.test(pwd) && 
                   /[a-z]/.test(pwd) && 
                   /[0-9]/.test(pwd);
        },
        'Password does not meet complexity requirements'
    )
    password!: string;
    
    @ViewGroup('Credentials')
    @PropertyIndex(2)
    @PropertyName('Confirm Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true, 'Please confirm your password')
    @Validation(
        (entity) => entity.confirmPassword === entity.password,
        'Passwords do not match'
    )
    confirmPassword!: string;
}
```

### UI Generada

```vue
<!-- Password -->
<div class="TextInput PasswordInput">
    <label>Password</label>
    <input 
        type="password" 
        v-model="user.password"
    />
    <button @click="togglePasswordVisibility">👁️</button>
    
    <div class="help-text">
        Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number
    </div>
    
    <div class="validation-messages" v-if="!isValid">
        <span>Password is required</span>
        <span>Password does not meet complexity requirements</span>
    </div>
</div>

<!-- Confirm Password -->
<div class="TextInput PasswordInput">
    <label>Confirm Password</label>
    <input 
        type="password" 
        v-model="user.confirmPassword"
    />
    <button @click="togglePasswordVisibility">👁️</button>
    
    <div class="validation-messages" v-if="!isValid">
        <span>Please confirm your password</span>
        <span>Passwords do not match</span>
    </div>
</div>
```

---

## 💡 Buenas Prácticas

### ✅ DO:

```typescript
// Validar complejidad de contraseña
@Validation(
    (entity) => {
        const pwd = entity.password;
        return pwd.length >= 8 && 
               /[A-Z]/.test(pwd) && 
               /[a-z]/.test(pwd) && 
               /[0-9]/.test(pwd) &&
               /[!@#$%^&*]/.test(pwd);
    },
    'Password must contain uppercase, lowercase, number, and special character'
)
password!: string;

// Confirmar contraseña
@Validation(
    (entity) => entity.password === entity.confirmPassword,
    'Passwords must match'
)
confirmPassword!: string;

// Usar help text descriptivo
@HelpText('Choose a strong password to protect your account')
password!: string;
```

### ❌ DON'T:

```typescript
// No usar StringType.TEXT para passwords
@StringTypeDef(StringType.TEXT)  // ❌ Inseguro
password!: string;

// No omitir validación de complejidad
@PropertyName('Password', String)  // ❌ Sin validación
@StringTypeDef(StringType.PASSWORD)
password!: string;

// No guardar contraseñas en texto plano (lado servidor)
// Siempre hashear con bcrypt/argon2
```

---

## 🧪 Casos de Uso Comunes

### 1. Registro de Usuario

```typescript
@PropertyName('Password', String)
@StringTypeDef(StringType.PASSWORD)
@Required(true, 'Password is required')
@Validation(
    (entity) => entity.password.length >= 12,
    'Password must be at least 12 characters'
)
password!: string;

@PropertyName('Confirm Password', String)
@StringTypeDef(StringType.PASSWORD)
@Required(true)
@Validation(
    (entity) => entity.password === entity.confirmPassword,
    'Passwords do not match'
)
confirmPassword!: string;
```

### 2. Cambio de Contraseña

```typescript
@PropertyName('Current Password', String)
@StringTypeDef(StringType.PASSWORD)
@Required(true)
@AsyncValidation(
    async (entity) => await verifyCurrentPassword(entity.currentPassword),
    'Current password is incorrect'
)
currentPassword!: string;

@PropertyName('New Password', String)
@StringTypeDef(StringType.PASSWORD)
@Required(true)
@Validation(
    (entity) => entity.newPassword !== entity.currentPassword,
    'New password must be different from current password'
)
newPassword!: string;
```

### 3. PIN Numérico

```typescript
@PropertyName('PIN Code', String)
@StringTypeDef(StringType.PASSWORD)
@Required(true)
@Validation(
    (entity) => /^\d{4,6}$/.test(entity.pin),
    'PIN must be 4-6 digits'
)
pin!: string;
```

---

## 🔒 Consideraciones de Seguridad

### En el Cliente (Este Componente)
- ✅ Oculta contraseña por defecto
- ✅ Valida complejidad
- ✅ No guarda en localStorage
- ⚠️ Toggle visibilidad es para UX, no seguridad

### En el Servidor (NO implementado aquí)
- ✅ Hashear con bcrypt/argon2
- ✅ Salt única por usuario
- ✅ Nunca retornar password en respuestas API
- ✅ Rate limiting en endpoints de login

---

## 🆚 Diferencias con TextInputComponent

| Aspecto | TextInputComponent | PasswordInputComponent |
|---------|-------------------|------------------------|
| **type** | `text` | `password` / `text` (toggle) |
| **Visibilidad** | Siempre visible | Oculta por defecto |
| **Botón extra** | No | Sí (toggle visibility) |
| **Icono** | No | Sí (👁️ / 🙈) |
| **Autocomplete** | Sí | Depende del navegador |
| **Activación** | `String` por defecto | `@StringTypeDef(StringType.PASSWORD)` |

---

## 🔗 Referencias

- **TextInputComponent:** [text-input-component.md](text-input-component.md)
- **StringTypeDef Decorator:** `../../01-decorators/string-type-decorator.md`
- **Validation Decorator:** `../../01-decorators/validation-decorator.md`
- **useInputMetadata:** [useInputMetadata-composable.md](useInputMetadata-composable.md)

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual)
