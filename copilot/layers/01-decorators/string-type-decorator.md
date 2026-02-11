# 🔤 StringType Decorator

**Referencias:**
- `property-name-decorator.md` - PropertyName define tipo base, StringType especifica subtipo
- `mask-decorator.md` - Mask formatea entrada, StringType valida formato
- `validation-decorator.md` - StringType agrega validación automática
- `../../02-base-entity/base-entity-core.md` - getStringType() accessor
- `../../tutorials/02-validations.md` - StringType en validaciones

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/string_type_decorator.ts`  
**Enum:** `src/enums/string_type.ts`

---

## 🎯 Propósito

El decorador `@StringType()` especifica el **tipo semántico** de un campo String, permitiendo:

1. **Validación automática** de formato (email, URL, phone, etc.)
2. **Input component especializado** (EmailInput, URLInput, PhoneInput, etc.)
3. **Formato visual apropiado** (clickable links, mailto links, tel links)
4. **Validación del lado del cliente** sin código custom

**Beneficio Principal:** Define QUÉ tipo de string es → Framework provee validación + componente automáticamente.

---

## 📝 Sintaxis

```typescript
@StringType(type: StringTypeEnum)
propertyName: string;
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `type` | `StringTypeEnum` | Sí | Tipo semántico del string |

---

## 🎯 StringTypeEnum

```typescript
// src/enums/string_type.ts

export enum StringTypeEnum {
    TEXT = 'text',                  // Texto normal
    EMAIL = 'email',                // Email address
    URL = 'url',                    // URL/Link
    PHONE = 'phone',                // Número de teléfono
    PASSWORD = 'password',          // Contraseña
    TEXTAREA = 'textarea',          // Texto largo (múltiples líneas)
    HTML = 'html',                  // HTML content
    MARKDOWN = 'markdown',          // Markdown content
    JSON = 'json',                  // JSON string
    COLOR = 'color',                // Color (hex, rgb)
    UUID = 'uuid',                  // UUID/GUID
    SSN = 'ssn',                    // Social Security Number
    EIN = 'ein',                    // Employer Identification Number
    CREDIT_CARD = 'credit_card',    // Número de tarjeta de crédito
    ZIPCODE = 'zipcode',            // Código postal
    IPV4 = 'ipv4',                  // Dirección IPv4
    IPV6 = 'ipv6',                  // Dirección IPv6
    MAC_ADDRESS = 'mac_address',    // Dirección MAC
    SLUG = 'slug',                  // URL slug (lowercase, dashes)
    USERNAME = 'username',          // Username (alphanumeric)
    CURRENCY = 'currency'           // Currency code (USD, EUR, etc.)
}
```

**Ubicación:** `src/enums/string_type.ts`

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/string_type_decorator.ts

import { StringTypeEnum } from '@/enums/string_type';

/**
 * Symbol para almacenar metadata de string type
 */
export const STRING_TYPE_METADATA = Symbol('stringType');

/**
 * @StringType() - Especifica el tipo semántico de un string
 * 
 * @param type - Tipo del string (email, url, phone, etc.)
 * @returns PropertyDecorator
 */
export function StringType(type: StringTypeEnum): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[STRING_TYPE_METADATA]) {
            target[STRING_TYPE_METADATA] = {};
        }
        
        // Guardar tipo
        target[STRING_TYPE_METADATA][propertyKey] = type;
    };
}
```

**Ubicación:** `src/decorations/string_type_decorator.ts` (línea ~1-30)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Customer.prototype[STRING_TYPE_METADATA] = {
    'email': StringTypeEnum.EMAIL,
    'website': StringTypeEnum.URL,
    'phone': StringTypeEnum.PHONE,
    'notes': StringTypeEnum.TEXTAREA
}
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el StringType de una propiedad
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns StringType o undefined
 */
public getStringType(propertyKey: string): StringTypeEnum | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    const stringTypeMetadata = constructor.prototype[STRING_TYPE_METADATA];
    
    if (!stringTypeMetadata || !stringTypeMetadata[propertyKey]) {
        return undefined;
    }
    
    return stringTypeMetadata[propertyKey];
}

/**
 * Obtiene el StringType (método estático)
 */
public static getStringType(propertyKey: string): StringTypeEnum | undefined {
    const stringTypeMetadata = this.prototype[STRING_TYPE_METADATA];
    
    if (!stringTypeMetadata || !stringTypeMetadata[propertyKey]) {
        return undefined;
    }
    
    return stringTypeMetadata[propertyKey];
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~960-990)

---

## 🎨 Impacto en UI

### Input Component Selection

```vue
<!-- DetailView.vue -->

<script setup lang="ts">
import { computed } from 'vue';
import TextInput from '@/components/Form/TextInput.vue';
import EmailInput from '@/components/Form/EmailInput.vue';
import URLInput from '@/components/Form/URLInput.vue';
import PhoneInput from '@/components/Form/PhoneInput.vue';
import TextAreaInput from '@/components/Form/TextAreaInput.vue';
import PasswordInput from '@/components/Form/PasswordInput.vue';

function getInputComponent(property: string): Component {
    const stringType = entity.value.getStringType(property);
    
    // Mapeo StringType → Component
    switch (stringType) {
        case StringTypeEnum.EMAIL:
            return EmailInput;
        case StringTypeEnum.URL:
            return URLInput;
        case StringTypeEnum.PHONE:
            return PhoneInput;
        case StringTypeEnum.TEXTAREA:
            return TextAreaInput;
        case StringTypeEnum.PASSWORD:
            return PasswordInput;
        case StringTypeEnum.HTML:
            return HTMLEditorInput;
        case StringTypeEnum.MARKDOWN:
            return MarkdownEditorInput;
        case StringTypeEnum.COLOR:
            return ColorPickerInput;
        default:
            return TextInput;
    }
}
</script>

<template>
  <component 
    :is="getInputComponent(prop)"
    v-model="entity[prop]"
    :property="prop"
    :entity="entity"
  />
</template>
```

---

### EmailInput Component

```vue
<!-- src/components/Form/EmailInput.vue -->

<template>
  <div class="form-group">
    <label :for="inputId">
      {{ propertyLabel }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="localValue"
      type="email"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      @blur="validate"
      class="email-input"
    />
    
    <!-- Validación automática de email -->
    <p v-if="validationError" class="error-text">
      {{ validationError }}
    </p>
    
    <!-- Help text automático -->
    <p v-else-if="!helpText" class="help-text">
      Enter a valid email address
    </p>
    <p v-else class="help-text">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const localValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const validationError = computed(() => {
    return props.entity.errors[props.property];
});

function validate() {
    // Validación automática de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (localValue.value && !emailRegex.test(localValue.value)) {
        props.entity.errors[props.property] = 'Invalid email format';
    } else {
        delete props.entity.errors[props.property];
    }
}
</script>

<style scoped>
.email-input {
    font-family: monospace;  /* Mejor para emails */
}
</style>
```

---

### URLInput Component

```vue
<!-- src/components/Form/URLInput.vue -->

<template>
  <div class="form-group">
    <label :for="inputId">
      {{ propertyLabel }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    
    <div class="input-with-preview">
      <input
        :id="inputId"
        v-model="localValue"
        type="url"
        placeholder="https://example.com"
        :disabled="isDisabled"
        :readonly="isReadOnly"
        @blur="validate"
      />
      
      <!-- Preview link -->
      <a 
        v-if="localValue && isValidURL"
        :href="localValue" 
        target="_blank"
        class="preview-link"
      >
        <IconExternalLink />
      </a>
    </div>
    
    <p v-if="validationError" class="error-text">
      {{ validationError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import IconExternalLink from '@/assets/icons/external-link.vue';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const localValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const isValidURL = computed(() => {
    try {
        new URL(localValue.value);
        return true;
    } catch {
        return false;
    }
});

function validate() {
    if (localValue.value && !isValidURL.value) {
        props.entity.errors[props.property] = 'Invalid URL format';
    } else {
        delete props.entity.errors[props.property];
    }
}
</script>

<style scoped>
.input-with-preview {
    display: flex;
    align-items: center;
    gap: 8px;
}

.preview-link {
    color: #3b82f6;
    cursor: pointer;
}
</style>
```

---

## 🧪 Ejemplos de Uso

### 1. Email

```typescript
import { StringType } from '@/decorations/string_type_decorator';
import { StringTypeEnum } from '@/enums/string_type';
import { PropertyName } from '@/decorations/property_name_decorator';
import { Required } from '@/decorations/required_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class Customer extends BaseEntity {
    @PropertyName('Email', String)
    @Required()
    @StringType(StringTypeEnum.EMAIL)
    email!: string;
}
```

**Resultado:**
- Input type="email" (HTML5 validation)
- Validación automática de formato email
- Icono de email en UI
- Clickable mailto: link en ListView

---

### 2. URL/Website

```typescript
export class Company extends BaseEntity {
    @PropertyName('Website', String)
    @StringType(StringTypeEnum.URL)
    website!: string;
}
```

**Resultado:**
- Input type="url"
- Validación automática de formato URL
- Preview link icon
- Clickable link en ListView

---

### 3. Phone

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Phone', String)
    @Required()
    @StringType(StringTypeEnum.PHONE)
    phone!: string;
}
```

**Resultado:**
- Input type="tel"
- Validación de formato teléfono
- Icono de teléfono en UI
- Clickable tel: link en ListView

---

### 4. Password

```typescript
export class User extends BaseEntity {
    @PropertyName('Password', String)
    @Required()
    @StringType(StringTypeEnum.PASSWORD)
    password!: string;
}
```

**Resultado:**
- Input type="password" (oculta caracteres)
- Toggle show/hide password
- Validación de fortaleza de contraseña (opcional)
- NO se muestra en ListView (seguridad)

---

### 5. TextArea (Texto Largo)

```typescript
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    @StringType(StringTypeEnum.TEXTAREA)
    description!: string;
}
```

**Resultado:**
- `<textarea>` en lugar de `<input>`
- Múltiples líneas
- Auto-resize (opcional)
- Character counter (opcional)

---

### 6. HTML Editor

```typescript
export class BlogPost extends BaseEntity {
    @PropertyName('Content', String)
    @Required()
    @StringType(StringTypeEnum.HTML)
    content!: string;
}
```

**Resultado:**
- Rich text editor (TinyMCE, Quill, etc.)
- Toolbar de formato (bold, italic, links, etc.)
- Preview HTML
- Sanitización automática

---

### 7. Markdown

```typescript
export class Documentation extends BaseEntity {
    @PropertyName('Content', String)
    @StringType(StringTypeEnum.MARKDOWN)
    content!: string;
}
```

**Resultado:**
- Markdown editor con preview split
- Syntax highlighting
- Preview renderizado
- Toolbar de markdown shortcuts

---

### 8. Color Picker

```typescript
export class Theme extends BaseEntity {
    @PropertyName('Primary Color', String)
    @StringType(StringTypeEnum.COLOR)
    primaryColor!: string;
    
    @PropertyName('Secondary Color', String)
    @StringType(StringTypeEnum.COLOR)
    secondaryColor!: string;
}
```

**Resultado:**
- Input type="color" (native color picker)
- Preview de color
- Soporte hex, rgb, rgba
- Color palette (opcional)

---

### 9. UUID

```typescript
export class ApiKey extends BaseEntity {
    @PropertyName('Key ID', String)
    @HideInDetailView()  // Auto-generado
    @StringType(StringTypeEnum.UUID)
    keyId!: string;
}
```

**Resultado:**
- Validación de formato UUID
- Monospace font
- Copy to clipboard button
- Auto-generado (hidden en create)

---

### 10. JSON

```typescript
export class Configuration extends BaseEntity {
    @PropertyName('Settings', String)
    @StringType(StringTypeEnum.JSON)
    settings!: string;
}
```

**Resultado:**
- JSON editor con syntax highlighting
- Validación JSON automática
- Format/prettify button
- Error highlighting

---

### 11. Slug

```typescript
export class BlogPost extends BaseEntity {
    @PropertyName('Title', String)
    @Required()
    title!: string;
    
    @PropertyName('Slug', String)
    @Required()
    @StringType(StringTypeEnum.SLUG)
    slug!: string;
    
    // Auto-generate slug from title
    afterSave(): void {
        if (!this.slug && this.title) {
            this.slug = this.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
    }
}
```

**Resultado:**
- Validación de formato slug (lowercase, dashes only)
- Auto-generación desde title
- Preview URL

---

### 12. Username

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Required()
    @StringType(StringTypeEnum.USERNAME)
    username!: string;
}
```

**Resultado:**
- Validación alfanumérica
- No espacios, caracteres especiales
- Lowercase automático
- Availability check (async validation)

---

### 13. Credit Card

```typescript
export class Payment extends BaseEntity {
    @PropertyName('Card Number', String)
    @Required()
    @StringType(StringTypeEnum.CREDIT_CARD)
    @Mask('#### #### #### ####')  // Combinar con Mask
    cardNumber!: string;
}
```

**Resultado:**
- Validación Luhn algorithm
- Máscara automática (espacios cada 4 dígitos)
- Detección de tipo de tarjeta (Visa, Mastercard, etc.)
- Security considerations (no log, no cache)

---

### 14. IP Address

```typescript
export class Server extends BaseEntity {
    @PropertyName('IPv4 Address', String)
    @Required()
    @StringType(StringTypeEnum.IPV4)
    ipv4!: string;
    
    @PropertyName('IPv6 Address', String)
    @StringType(StringTypeEnum.IPV6)
    ipv6!: string;
}
```

**Resultado:**
- Validación de formato IP
- Máscaras apropiadas
- Ping/test connection button (opcional)

---

## 🔄 Validaciones Automáticas

### Email

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | null {
    if (!emailRegex.test(value)) {
        return 'Invalid email format';
    }
    return null;
}
```

### URL

```typescript
function validateURL(value: string): string | null {
    try {
        new URL(value);
        return null;
    } catch {
        return 'Invalid URL format';
    }
}
```

### Phone (US Format)

```typescript
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

function validatePhone(value: string): string | null {
    if (!phoneRegex.test(value)) {
        return 'Invalid phone format';
    }
    return null;
}
```

### UUID

```typescript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUUID(value: string): string | null {
    if (!uuidRegex.test(value)) {
        return 'Invalid UUID format';
    }
    return null;
}
```

### JSON

```typescript
function validateJSON(value: string): string | null {
    try {
        JSON.parse(value);
        return null;
    } catch {
        return 'Invalid JSON format';
    }
}
```

### Credit Card (Luhn Algorithm)

```typescript
function validateCreditCard(value: string): string | null {
    // Remove spaces/dashes
    const cardNumber = value.replace(/[\s-]/g, '');
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
        return 'Invalid credit card number';
    }
    
    return null;
}
```

---

## ⚠️ Consideraciones Importantes

### 1. StringType vs Mask

```typescript
// StringType: Define QUÉ tipo de string es
@StringType(StringTypeEnum.PHONE)

// Mask: Define CÓMO formatear la entrada
@Mask('(###) ###-####')

// ✅ PUEDEN COMBINARSE:
@PropertyName('Phone', String)
@StringType(StringTypeEnum.PHONE)  // → Valida formato teléfono
@Mask('(###) ###-####')            // → Formatea entrada
phone!: string;
```

### 2. StringType Agrega Validación Automática

```typescript
// Con StringType: Validación automática
@StringType(StringTypeEnum.EMAIL)
email!: string;
// → Framework valida formato email automáticamente

// Sin StringType: Validación manual
@Validation((value: string) => {
    if (!value.includes('@')) {
        return 'Invalid email';
    }
    return null;
})
email!: string;
```

### 3. Component Especializado vs Generic

```typescript
// Con StringType: Component especializado
@StringType(StringTypeEnum.EMAIL)
email!: string;
// → Usa EmailInput component (type="email", mailto link, etc.)

// Sin StringType: Component genérico
email!: string;
// → Usa TextInput component básico
```

### 4. Password Security

```typescript
// ⚠️ Passwords NO se muestran en ListView
@StringType(StringTypeEnum.PASSWORD)
password!: string;

// Password fields:
// - Input type="password"
// - NO se incluyen en toDictionary() para GET requests
// - Solo se envían en POST/PUT cuando se cambian
```

### 5. HTML/Markdown Sanitization

```typescript
// ⚠️ HTML content debe sanitizarse antes de renderizar
@StringType(StringTypeEnum.HTML)
content!: string;

// En display:
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(entity.content);
```

---

## 📚 Referencias Adicionales

- `property-name-decorator.md` - PropertyName define tipo base (String)
- `mask-decorator.md` - Mask formatea entrada, StringType valida
- `validation-decorator.md` - Validación custom adicional
- `display-format-decorator.md` - DisplayFormat para salida
- `../../02-base-entity/base-entity-core.md` - getStringType() implementation
- `../../tutorials/02-validations.md` - StringType en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/string_type_decorator.ts`  
**Enum:** `src/enums/string_type.ts`  
**Líneas:** ~30 (decorator), ~45 (enum)
