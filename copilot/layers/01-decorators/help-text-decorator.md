# 💬 HelpText Decorator

**Referencias:**
- `property-name-decorator.md` - Define el label del campo
- `validation-decorator.md` - Help text vs validation errors
- `../../02-base-entity/base-entity-core.md` - getHelpText() accessor
- `../../tutorials/02-validations.md` - Help text en formularios

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/help_text_decorator.ts`

---

## 🎯 Propósito

El decorador `@HelpText()` agrega **texto de ayuda descriptivo** que se muestra debajo del campo en formularios para proporcionar contexto, instrucciones o ejemplos al usuario.

**Beneficios:**
- Mejora la UX con instrucciones claras
- Reduce errores de entrada
- Proporciona ejemplos de formato esperado
- Se muestra persistentemente (no solo en errores)

**Diferencia con errores de validación:**
- **HelpText:** Siempre visible, propósito educativo
- **Validation Error:** Solo visible cuando hay error

---

## 📝 Sintaxis

```typescript
@HelpText(text: string | ((entity: BaseEntity) => string))
propertyName: Type;
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `text` | `string \| Function` | Sí | Texto de ayuda o función que retorna el texto |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/help_text_decorator.ts

/**
 * Symbol para almacenar metadata de help text
 */
export const HELP_TEXT_METADATA = Symbol('helpText');

/**
 * @HelpText() - Agrega texto de ayuda descriptivo a un campo
 * 
 * @param text - Texto de ayuda (string o función)
 * @returns PropertyDecorator
 */
export function HelpText(
    text: string | ((entity: BaseEntity) => string)
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[HELP_TEXT_METADATA]) {
            target[HELP_TEXT_METADATA] = {};
        }
        
        // Guardar texto de ayuda
        target[HELP_TEXT_METADATA][propertyKey] = text;
    };
}
```

**Ubicación:** `src/decorations/help_text_decorator.ts` (línea ~1-30)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[HELP_TEXT_METADATA] = {
    'name': 'Enter the product name (max 100 characters)',
    'sku': 'SKU format: XXXX-YYYY (e.g., PROD-0042)',
    'price': 'Price in USD, without currency symbol',
    'stock': (entity) => entity.id ? 'Current stock level' : 'Initial stock quantity'
}
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el texto de ayuda de una propiedad
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns Texto de ayuda o undefined
 */
public getHelpText(propertyKey: string): string | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    const helpTextMetadata = constructor.prototype[HELP_TEXT_METADATA];
    
    if (!helpTextMetadata || !helpTextMetadata[propertyKey]) {
        return undefined;
    }
    
    const text = helpTextMetadata[propertyKey];
    
    // Si es función, evaluarla con la instancia
    if (typeof text === 'function') {
        return text(this);
    }
    
    // Si es string, retornar directamente
    return text;
}

/**
 * Obtiene el texto de ayuda de una propiedad (método estático)
 */
public static getHelpText(propertyKey: string): string | undefined {
    const helpTextMetadata = this.prototype[HELP_TEXT_METADATA];
    
    if (!helpTextMetadata || !helpTextMetadata[propertyKey]) {
        return undefined;
    }
    
    const text = helpTextMetadata[propertyKey];
    
    // Si es función, retornar undefined (necesita instancia para evaluar)
    if (typeof text === 'function') {
        return undefined;
    }
    
    return text;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~810-850)

---

## 🎨 Impacto en UI

### FormInput con Help Text

```vue
<!-- src/components/Form/TextInput.vue -->

<template>
  <div class="form-group">
    <!-- Label -->
    <label :for="inputId">
      {{ propertyLabel }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    
    <!-- Input -->
    <input
      :id="inputId"
      v-model="modelValue"
      type="text"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      @blur="validate"
    />
    
    <!-- Help Text (siempre visible) -->
    <p v-if="helpText" class="help-text">
      {{ helpText }}
    </p>
    
    <!-- Validation Error (solo cuando hay error) -->
    <p v-if="validationError" class="error-text">
      {{ validationError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type BaseEntity from '@/entities/base_entitiy';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
    entityClass: typeof BaseEntity;
}>();

const helpText = computed(() => {
    return props.entity.getHelpText(props.property);
});

const validationError = computed(() => {
    return props.entity.errors[props.property];
});

const propertyLabel = computed(() => {
    return props.entityClass.getPropertyName(props.property);
});

const isRequired = computed(() => {
    return props.entity.isRequired(props.property);
});

// ...
</script>

<style scoped>
.help-text {
    margin-top: 4px;
    font-size: 0.875rem;
    color: #6b7280;  /* Gray */
    font-style: italic;
}

.error-text {
    margin-top: 4px;
    font-size: 0.875rem;
    color: #ef4444;  /* Red */
    font-weight: 500;
}
</style>
```

**Ubicación:** `src/components/Form/TextInput.vue`

---

## 🧪 Ejemplos de Uso

### 1. Help Text Simple

```typescript
import { HelpText } from '@/decorations/help_text_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { Required } from '@/decorations/required_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required()
    @HelpText('Enter the full product name (max 100 characters)')
    name!: string;
    
    @PropertyName('SKU', String)
    @Required()
    @HelpText('SKU format: XXXX-YYYY (e.g., PROD-0042)')
    sku!: string;
    
    @PropertyName('Price', Number)
    @Required()
    @HelpText('Price in USD, without currency symbol')
    price!: number;
}
```

**Resultado en UI:**
```
Product Name *
┌─────────────────────────────────┐
│                                 │
└─────────────────────────────────┘
Enter the full product name (max 100 characters)

SKU *
┌─────────────────────────────────┐
│                                 │
└─────────────────────────────────┘
SKU format: XXXX-YYYY (e.g., PROD-0042)
```

---

### 2. Help Text Dinámico

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Stock', Number)
    @HelpText((entity: Product) => {
        if (!entity.id) {
            return 'Enter initial stock quantity';
        }
        return `Current stock: ${entity.stock}. Enter new quantity to update.`;
    })
    stock!: number;
}
```

**Comportamiento:**
- **Crear nuevo:** "Enter initial stock quantity"
- **Editar existente:** "Current stock: 150. Enter new quantity to update."

---

### 3. Help Text con Formato

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Email', String)
    @Required()
    @HelpText('Enter a valid email address (e.g., user@example.com)')
    email!: string;
    
    @PropertyName('Phone', String)
    @HelpText('Format: +1 (555) 123-4567')
    phone!: string;
    
    @PropertyName('Birth Date', Date)
    @HelpText('Format: MM/DD/YYYY (you must be 18+ to register)')
    birthDate!: Date;
}
```

---

### 4. Help Text con Instrucciones

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Customer', String)
    @Required()
    @HelpText('Type customer name to search or select from dropdown')
    customerName!: string;
    
    @PropertyName('Delivery Date', Date)
    @Required()
    @HelpText('Select a date at least 3 days from today')
    deliveryDate!: Date;
    
    @PropertyName('Notes', String)
    @HelpText('Add any special instructions (optional, max 500 characters)')
    notes?: string;
}
```

---

### 5. Help Text Contextual

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice ID', Number)
    id!: number;
    
    @PropertyName('Is Paid', Boolean)
    isPaid!: boolean;
    
    @PropertyName('Amount', Number)
    @Required()
    @HelpText((entity: Invoice) => {
        if (entity.isPaid) {
            return 'This invoice has been paid. Amount cannot be changed.';
        }
        return 'Enter the invoice amount in USD';
    })
    amount!: number;
    
    @PropertyName('Payment Date', Date)
    @HelpText((entity: Invoice) => {
        if (entity.isPaid) {
            return 'Date when payment was received';
        }
        return 'Payment date will be set automatically when marked as paid';
    })
    paymentDate?: Date;
}
```

**Comportamiento:**
- Si `isPaid === true`: "This invoice has been paid..."
- Si `isPaid === false`: "Enter the invoice amount..."

---

### 6. Help Text con Links (Markdown)

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Category', String)
    @Required()
    @HelpText('Select a category. Need to add a new one? Contact support at support@example.com')
    category!: string;
    
    @PropertyName('Description', String)
    @HelpText('Markdown supported. See formatting guide at docs.example.com/markdown')
    description!: string;
}
```

---

### 7. Help Text para Validaciones Complejas

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Required()
    @HelpText('3-20 characters, alphanumeric only, no spaces')
    @Validation((value: string) => {
        if (value.length < 3 || value.length > 20) {
            return 'Username must be between 3 and 20 characters';
        }
        if (!/^[a-zA-Z0-9]+$/.test(value)) {
            return 'Username must be alphanumeric only';
        }
        return null;
    })
    username!: string;
    
    @PropertyName('Password', String)
    @Required()
    @HelpText('Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number')
    @Validation((value: string) => {
        if (value.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(value)) {
            return 'Password must contain at least 1 uppercase letter';
        }
        if (!/[a-z]/.test(value)) {
            return 'Password must contain at least 1 lowercase letter';
        }
        if (!/[0-9]/.test(value)) {
            return 'Password must contain at least 1 number';
        }
        return null;
    })
    password!: string;
}
```

**Resultado:**
- **Help Text:** Siempre visible, muestra requisitos
- **Validation Error:** Solo visible cuando validación falla, muestra qué requisito específico falló

---

### 8. Help Text con Ejemplos

```typescript
export class Product extends BaseEntity {
    @PropertyName('Weight', Number)
    @Required()
    @HelpText('Weight in pounds (e.g., 2.5 for 2.5 lbs)')
    weight!: number;
    
    @PropertyName('Dimensions', String)
    @HelpText('Format: L x W x H in inches (e.g., "10 x 5 x 3")')
    dimensions!: string;
    
    @PropertyName('Tags', String)
    @HelpText('Comma-separated tags (e.g., "electronics, laptop, portable")')
    tags!: string;
}
```

---

### 9. Help Text Multiidioma

```typescript
import Application from '@/models/application';

export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @HelpText((entity: Product) => {
        const locale = Application.AppConfiguration.locale;
        
        const messages = {
            'en-US': 'Enter the product name (max 100 characters)',
            'es-ES': 'Ingrese el nombre del producto (máximo 100 caracteres)',
            'fr-FR': 'Entrez le nom du produit (max 100 caractères)'
        };
        
        return messages[locale] || messages['en-US'];
    })
    name!: string;
}
```

---

### 10. Help Text con Contador de Caracteres

```typescript
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    @HelpText((entity: Product) => {
        const maxLength = 500;
        const currentLength = entity.description?.length || 0;
        const remaining = maxLength - currentLength;
        
        return `${remaining} characters remaining (max ${maxLength})`;
    })
    description!: string;
}
```

**Resultado:**
- Inicio: "500 characters remaining (max 500)"
- Después de escribir 50: "450 characters remaining (max 500)"
- Después de escribir 500: "0 characters remaining (max 500)"

---

## 🎨 Estilos CSS Recomendados

```css
/* src/css/form.css */

.help-text {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 0.875rem;       /* 14px */
    line-height: 1.25rem;      /* 20px */
    color: #6b7280;            /* Gray-500 */
    font-style: italic;
}

.help-text a {
    color: #2563eb;            /* Blue-600 */
    text-decoration: underline;
}

.help-text a:hover {
    color: #1d4ed8;            /* Blue-700 */
}

/* Dark mode */
.dark .help-text {
    color: #9ca3af;            /* Gray-400 */
}

/* Help text con icono */
.help-text::before {
    content: 'ⓘ ';
    margin-right: 4px;
}

/* Error overrides help text styling */
.error-text {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #ef4444;            /* Red-500 */
    font-weight: 500;
}

.error-text::before {
    content: '⚠ ';
    margin-right: 4px;
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Help Text vs Validation Error

```typescript
// Help Text: Siempre visible
@PropertyName('Email', String)
@HelpText('Enter a valid email address')  // ← Siempre visible
@Validation((value) => {
    if (!value.includes('@')) {
        return 'Invalid email format';      // ← Solo visible si hay error
    }
    return null;
})
email!: string;
```

**UI:**
```
Email *
┌─────────────────────────────────┐
│ user@example.com                │
└─────────────────────────────────┘
Enter a valid email address         ← Help text (gray)

// Si hay error:
Email *
┌─────────────────────────────────┐
│ userexample.com                 │  (campo con borde rojo)
└─────────────────────────────────┘
⚠ Invalid email format              ← Error (red)
```

### 2. Help Text Dinámico Se Re-evalúa

```typescript
@HelpText((entity: Product) => `Current stock: ${entity.stock}`)
stock!: number;

// Cada vez que se renderiza, se evalúa la función
// Si entity.stock cambia, el help text se actualiza automáticamente
```

### 3. Mantener Textos Concisos

```typescript
// ✅ BUENO: Conciso y claro
@HelpText('Format: YYYY-MM-DD')
date!: Date;

// ❌ MALO: Demasiado largo
@HelpText('Please enter the date in the following format: YYYY-MM-DD, where YYYY is the 4-digit year, MM is the 2-digit month, and DD is the 2-digit day. For example, January 5, 2025 would be entered as 2025-01-05.')
date!: Date;
```

### 4. Usar para Prevenir Errores

```typescript
// Help text ayuda a prevenir errores de validación
@PropertyName('SKU', String)
@Required()
@HelpText('Format: XXXX-YYYY (e.g., PROD-0042)')  // ← Muestra formato esperado
@Validation((value: string) => {
    if (!/^[A-Z]{4}-\d{4}$/.test(value)) {
        return 'Invalid SKU format';
    }
    return null;
})
sku!: string;
```

### 5. No Duplicar Información del Label

```typescript
// ❌ MALO: Redundante
@PropertyName('Product Name', String)
@HelpText('Enter the product name')
name!: string;

// ✅ BUENO: Agregar información útil
@PropertyName('Product Name', String)
@HelpText('Max 100 characters, alphanumeric only')
name!: string;
```

---

## 📚 Referencias Adicionales

- `property-name-decorator.md` - Label del campo
- `validation-decorator.md` - Mensajes de error vs help text
- `required-decorator.md` - Campos requeridos con help text
- `placeholder-decorator.md` - Placeholder vs help text
- `../../02-base-entity/base-entity-core.md` - getHelpText() implementation
- `../../tutorials/02-validations.md` - Help text en formularios

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/help_text_decorator.ts`  
**Líneas:** ~30
