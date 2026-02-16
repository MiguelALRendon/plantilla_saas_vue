# HelpText Decorator

## 1. Propósito

El decorator HelpText agrega texto de ayuda descriptivo que se muestra permanentemente debajo del campo en formularios para proporcionar contexto, instrucciones o ejemplos al usuario. Mejora UX con instrucciones claras, reduce errores de entrada, proporciona ejemplos de formato esperado, y se muestra persistentemente (NO solo en errores como validation errors). Critical para campos con formatos específicos (SKU: XXXX-YYYY, phone: +1 (555) 123-4567, date: MM/DD/YYYY), campos con restricciones no obvias (username: 3-20 caracteres alphanumeric only, password: min 8 chars con uppercase/lowercase/number), contexto dinámico basado en estado (stock: "initial quantity" en create vs "current stock X, enter new" en edit), y prevención proactiva de errores mediante ejemplos concretos. HelpText difiere fundamentalmente de validation errors: HelpText siempre visible con propósito educativo/preventivo, aparece antes de interacción, usa estilo visual neutral (gray, italic), y proporciona guidance positiva. Validation errors solo visibles cuando hay error, aparecen después de validación falla, usan estilo visual de alerta (red, bold), y indican qué está mal. Soporta help text dinámico mediante functions que evalúan entity state: `@HelpText((entity) => entity.isPaid ? 'Paid invoice' : 'Enter amount')`. Framework separa completamente educational guidance (HelpText) de error messaging (Validation), permitiendo optimal UX donde usuarios entienden qué hacer ANTES de error occurrence.

## 2. Alcance

**Responsabilidades cubiertas:**
- Definir texto de ayuda estático (string) o dinámico (function) para propiedad
- Mostrar help text permanentemente debajo de input field en formularios
- Aplicar estilo visual neutral (gray color, italic font, smaller size) para differentiate de errors
- Proveer getHelpText(propertyKey) accessor que retorna string o undefined
- Soportar help text dinámico con function evaluation: `@HelpText((entity) => dynamicText)`
- Evaluar function conditions en cada render usando entity instance como this context
- Permitir multiidioma mediante functions que acceden a Application.AppConfiguration.locale
- Mostrar ejemplos, formatos esperados, límites de caracteres, y guías de uso
- Coexistir con validation errors (help text arriba, error messages abajo cuando hay error)

**Límites del alcance:**
- Decorator NO valida el campo (solo proporciona información educativa)
- NO reemplaza validation error messages (son complementarios, NO sustitutos)
- NO oculta o modifica el campo (solo añade texto informativo debajo)
- help text NO desaparece cuando hay error de validación (ambos pueden mostrarse simultáneamente)
- Function help text NO debe tener side effects (no modificar state, no API calls, no logging)
- Help text NO es placeholder (placeholder dentro de input, help text debajo de input)
- Static getHelpText() retorna undefined para function-based help text (necesita instance)
- NO valida que help text sea conciso (developer responsable de mantener textos breves)
- NO soporta rich text o HTML (solo plain text strings)
- NO afecta a validation logic, toDictionary(), o save() operations

## 3. Definiciones Clave

**HELP_TEXT_METADATA Symbol:** Identificador único usado como property key en prototype para almacenar object map de help text strings o functions. Definido como `export const HELP_TEXT_METADATA = Symbol('helpText')`. Estructura: `{ [propertyKey: string]: string | ((entity: BaseEntity) => string) }`.

**HelpText Type:** Type union `string | ((entity: BaseEntity) => string)`. String estático para help text fijo, function para help text dinámico evaluado en runtime.

**Decorator Signature:** `function HelpText(text: string): PropertyDecorator`. Parámetro único text es string. NO acepta functions - solo strings literales.

**NOTA CRÍTICA:** El decorador SOLO acepta strings, NO acepta funciones. No hay soporte para help text dinámico via functions.

**Static Help Text:** String constante almacenado en metadata, siempre retorna mismo texto. Ejemplo: `'Format: YYYY-MM-DD (e.g., 2025-01-15)'`.

**Dynamic Help Text:** Function en metadata evaluada EN CADA render del input component. Retorna string diferente según entity state. Ejemplo: `(entity: Product) => entity.id ? 'Edit mode' : 'Create mode'`.

**getHelpText(propertyKey) Accessor:** Método de instancia en BaseEntity que retorna help text string o undefined. Si metadata es function, ejecuta con entity instance. Ubicado en línea ~810 de base_entity.ts.

**Static getHelpText(propertyKey):** Método estático en BaseEntity que retorna help text string o undefined. Si metadata es function, retorna undefined (necesita instance para evaluar).

**Help Text vs Validation Error:** Help text siempre visible (educational, preventive), validation error solo visible cuando validación falla (reactive, corrective). Ambos pueden mostrarse simultáneamente.

**Help Text vs Placeholder:** Placeholder dentro de input field (desaparece cuando usuario escribe), help text debajo de input field (permanece siempre visible).

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
// src/decorations/help_text_decorator.ts
export const HELP_TEXT_KEY = Symbol('help_text');

export function HelpText(text: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[HELP_TEXT_KEY]) {
            proto[HELP_TEXT_KEY] = {};
        }
        proto[HELP_TEXT_KEY][propertyKey] = text;
    };
}
```

**Parámetros:**
- `text: string` - Texto de ayuda estático que se muestra debajo del campo de entrada

**Uso correcto:**
```typescript
export class Customer extends BaseEntity {
    @PropertyName('Email', String)
    @HelpText('Enter a valid email address')  // Solo strings
    email!: string;
}
```

export const HELP_TEXT_METADATA = Symbol('helpText');
export type HelpTextType = string | ((entity: BaseEntity) => string);
```

Ubicación: `src/decorations/help_text_decorator.ts` (líneas 1-30)

### Metadata Storage en Prototype

```typescript
// Estructura en prototype después de aplicar decorators
Product.prototype[HELP_TEXT_METADATA] = {
    'name': 'Enter the product name (max 100 characters)',
    'sku': 'SKU format: XXXX-YYYY (e.g., PROD-0042)',
    'price': 'Price in USD, without currency symbol',
    'stock': (entity: Product) => {
        if (!entity.id) {
            return 'Enter initial stock quantity';
        }
        return `Current stock: ${entity.stock}. Enter new quantity to update.`;
    }
}
```

### Accessor Método getHelpText() en BaseEntity

```typescript
// src/entities/base_entity.ts

/**
 * Obtiene el texto de ayuda de una propiedad (método de instancia)
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
    
    // Si es función, evaluarla con la instancia actual
    if (typeof text === 'function') {
        return text(this);
    }
    
    // Si es string, retornar directamente
    return text;
}

/**
 * Obtiene el texto de ayuda de una propiedad (método estático)
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns Texto de ayuda o undefined si es function-based
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

Ubicación: `src/entities/base_entity.ts` (líneas ~810-855)

### Integración en Form Input Component

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
    
    <!-- Help Text (siempre visible si existe) -->
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
import type BaseEntity from '@/entities/base_entity';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
    entityClass: typeof BaseEntity;
}>();

// Computed que obtiene help text
const helpText = computed(() => {
    return props.entity.getHelpText(props.property);
});

// Computed que obtiene validation error
const validationError = computed(() => {
    return props.entity.validationErrors?.[props.property];
});

const propertyLabel = computed(() => {
    return props.entityClass.getPropertyName(props.property);
});

const isRequired = computed(() => {
    return props.entity.isRequired(props.property);
});

// ...other computed properties and methods
</script>

<style scoped>
.help-text {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 0.875rem;       /* 14px */
    line-height: 1.25rem;
    color: var(--gray-text);            /* Gray-500 */
    font-style: italic;
}

.error-text {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 0.875rem;
    color: var(--error-primary);            /* Red-500 */
    font-weight: 500;
}

.error-text::before {
    content: '[!] ';
    margin-right: 4px;
}
</style>
```

Ubicación: `src/components/Form/TextInput.vue` (líneas ~1-90)

## 5. Flujo de Funcionamiento

### Fase 1: Aplicación del Decorator

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required()
    @HelpText('Enter the product name (max 100 characters)')  // ← Decorator aquí
    name!: string;
}

// Resultado en prototype:
Product.prototype[HELP_TEXT_METADATA] = {
    'name': 'Enter the product name (max 100 characters)'
}
```

### Fase 2: Constructor y Metadata Disponible

```typescript
const product = new Product();

// Metadata de help text disponible en prototype
console.log(product.getHelpText('name'));  
// "Enter the product name (max 100 characters)"
```

### Fase 3: Renderizado en Form Input

```vue
<template>
  <!-- TextInput component renderiza campo -->
  <div class="form-group">
    <label>Product Name *</label>
    <input v-model="product.name" />
    
    <!-- Help text computed evalúa getHelpText() -->
    <p v-if="helpText" class="help-text">
      {{ helpText }}  <!-- "Enter the product name (max 100 characters)" -->
    </p>
  </div>
</template>

<script setup>
const helpText = computed(() => props.entity.getHelpText(props.property));
</script>
```

Flujo interno:

1. Component renderiza input field
2. Computed `helpText` ejecuta `entity.getHelpText('name')`
3. BaseEntity.getHelpText() accede a prototype metadata
4. Si text es function, ejecuta con entity instance
5. Si text es string, retorna directamente
6. Vue renderiza help text debajo de input

### Fase 4: Help Text Dinámico Evaluation

```typescript
export class Product extends BaseEntity {
    @PropertyName('Stock', Number)
    @HelpText((entity: Product) => {
        if (!entity.id) {
            return 'Enter initial stock quantity';
        }
        return `Current stock: ${entity.stock}. Enter new quantity to update.`;
    })
    stock!: number;
}

// CREATE MODE (id = undefined):
const newProduct = new Product();
console.log(newProduct.getHelpText('stock'));
// "Enter initial stock quantity"

// EDIT MODE (id = 42, stock = 150):
const existingProduct = await Product.getElement(42);
existingProduct.stock = 150;
console.log(existingProduct.getHelpText('stock'));
// "Current stock: 150. Enter new quantity to update."
```

### Fase 5: Interacción con Validation Errors

```typescript
export class User extends BaseEntity {
    @PropertyName('Email', String)
    @Required()
    @HelpText('Enter a valid email address (e.g., user@example.com)')
    @Validation((value: string) => {
        if (!value?.includes('@')) {
            return 'Invalid email format';
        }
        return null;
    })
    email!: string;
}

const user = new User();

// ESTADO INICIAL (sin error):
// UI muestra:
// - Help text: "Enter a valid email address (e.g., user@example.com)"
// - Error: (no visible)

// ESTADO CON ERROR (después de validation falla):
user.email = 'userexample.com';
await user.validateInputs();

// UI muestra:
// - Help text: "Enter a valid email address (e.g., user@example.com)" (sigue visible)
// - Error: "Invalid email format" (ahora visible en rojo)
```

## 6. Reglas Obligatorias

### Regla 1: Help Text DEBE Ser Conciso

```typescript
// CORRECTO (conciso y claro):
@HelpText('Format: YYYY-MM-DD (e.g., 2025-01-15)')
date!: Date;

// INCORRECTO (demasiado largo):
@HelpText('Please enter the date in the following format: YYYY-MM-DD, where YYYY is the 4-digit year, MM is the 2-digit month, and DD is the 2-digit day. For example, January 5, 2025 would be entered as 2025-01-05.')
date!: Date;

// Límite recomendado: 80-100 caracteres
```

### Regla 2: Help Text DEBE Proporcionar Información Útil

```typescript
// CORRECTO (información útil no obvia):
@PropertyName('Product Name', String)
@HelpText('Max 100 characters, alphanumeric only')
name!: string;

// INCORRECTO (redundante con label):
@PropertyName('Product Name', String)
@HelpText('Enter the product name')  // ← Obvio, no añade valor
name!: string;
```

### Regla 3: Dynamic Help Text Functions DEBEN Ser Pure

```typescript
// CORRECTO (pure function):
@HelpText((entity: Product) => {
    return entity.id ? 'Edit mode' : 'Create mode';
})

// INCORRECTO (side effects):
@HelpText((entity: Product) => {
    console.log('Evaluating help text');  // ← Side effect
    fetch('/log-access');  // ← Side effect
    return 'Help text';
})
```

### Regla 4: Usar Help Text para Prevenir Validation Errors

```typescript
// CORRECTO (help text muestra formato esperado):
@PropertyName('SKU', String)
@Required()
@HelpText('Format: XXXX-YYYY (e.g., PROD-0042)')  // ← Previene errores
@Validation((value: string) => {
    if (!/^[A-Z]{4}-\d{4}$/.test(value)) {
        return 'Invalid SKU format';
    }
    return null;
})
sku!: string;
```

### Regla 5: Help Text DEBE Incluir Ejemplos para Formatos Complejos

```typescript
// CORRECTO (con ejemplo):
@HelpText('Format: +1 (555) 123-4567')
phone!: string;

// CORRECTO (con múltiples ejemplos):
@HelpText('Comma-separated tags (e.g., "electronics, laptop, portable")')
tags!: string;

// INCORRECTO (sin ejemplo):
@HelpText('Enter phone number in correct format')  // ← No ayuda al usuario
phone!: string;
```

## 7. Prohibiciones

### Prohibición 1: NO Usar Help Text como Validation Error Message

```typescript
// PROHIBIDO (help text usado como error message):
@PropertyName('Email', String)
@HelpText('Invalid email format')  // ← ERROR: esto es error message, no help

// CORRECTO (separar help text y error message):
@PropertyName('Email', String)
@HelpText('Enter a valid email address (e.g., user@example.com)')  // ← Help
@Validation((value: string) => {
    if (!value?.includes('@')) {
        return 'Invalid email format';  // ← Error message
    }
    return null;
})
email!: string;
```

### Prohibición 2: NO Duplicar Información del Label

```typescript
// PROHIBIDO (redundante):
@PropertyName('Product Name', String)
@HelpText('Enter the product name')  // ← Duplica label
name!: string;

// CORRECTO (información adicional):
@PropertyName('Product Name', String)
@HelpText('Max 100 characters')
name!: string;
```

### Prohibición 3: NO Usar HTML o Markdown en Help Text

```typescript
// PROHIBIDO (HTML no renderizado):
@HelpText('Click <a href="/help">here</a> for help')  // ← HTML escaped
linkField!: string;

// PROHIBIDO (Markdown no procesado):
@HelpText('**Bold text** [link](url)')  // ← Renderizado como texto plano
field!: string;

// CORRECTO (plain text):
@HelpText('Visit docs.example.com/help for more information')
field!: string;
```

### Prohibición 4: NO Usar Help Text para Instrucciones Críticas

```typescript
// PROHIBIDO (instrucción crítica en help text, usuario puede ignorar):
@PropertyName('Delete Confirmation', String)
@HelpText('WARNING: This action cannot be undone!')  // ← Muy crítico para help text
deleteConfirmation!: string;

// CORRECTO (usar modal confirmation o validation warning):
// Mostrar modal de confirmación antes de delete action
```

### Prohibición 5: NO Hacer API Calls en Dynamic Help Text

```typescript
// PROHIBIDO (API call):
@HelpText(async (entity: Product) => {  // ← async prohibited
    const config = await fetch('/api/config');
    return config.helpText;
})

// CORRECTO (usar Application config o computed property):
@HelpText((entity: Product) => {
    const config = Application.AppConfiguration;
    return config.helpTexts['productName'] || 'Default help text';
})
```

## 8. Dependencias

### Dependencia 1: BaseEntity Core

```typescript
// BaseEntity provee getHelpText() accessor
import BaseEntity from '@/entities/base_entity';

export class Product extends BaseEntity {
    @HelpText('Enter product name')
    name!: string;
}

// getHelpText() disponible:
const product = new Product();
console.log(product.getHelpText('name'));  // "Enter product name"
```

Archivo: [base-entity-core.md](../02-base-entity/base-entity-core.md)

### Dependencia 2: PropertyName Decorator

```typescript
// PropertyName define label, HelpText añade contexto adicional
@PropertyName('Email Address', String)  // ← Label
@HelpText('Enter a valid email (e.g., user@example.com)')  // ← Help
email!: string;
```

Archivo: [property-name-decorator.md](property-name-decorator.md)

### Dependencia 3: Validation System

```typescript
// HelpText y Validation complementarios
@PropertyName('Username', String)
@HelpText('3-20 characters, alphanumeric only')  // ← Preventivo
@Validation((value: string) => {
    if (value.length < 3) {
        return 'Username too short';  // ← Reactivo
    }
    return null;
})
username!: string;
```

Archivo: [validation-decorator.md](validation-decorator.md)

### Dependencia 4: Form Input Components

```vue
<!-- TextInput, NumberInput, DateInput, etc. deben implementar help text -->
<template>
  <div class="form-group">
    <input v-model="modelValue" />
    
    <!-- Help text integration obligatoria -->
    <p v-if="helpText" class="help-text">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
const helpText = computed(() => props.entity.getHelpText(props.property));
</script>
```

Archivos:
- `src/components/Form/TextInput.vue`
- `src/components/Form/NumberInput.vue`
- `src/components/Form/DateInput.vue`
- Todos los form inputs DEBEN mostrar help text

### Dependencia 5: Application Configuration

```typescript
// Dynamic help text puede acceder a Application config
import Application from '@/models/application';

@HelpText((entity: Product) => {
    const locale = Application.AppConfiguration.locale;
    const messages = {
        'en-US': 'Enter product name',
        'es-ES': 'Ingrese nombre del producto'
    };
    return messages[locale] || messages['en-US'];
})
name!: string;
```

## 9. Relaciones

### Relación con @Validation

**Diferencia Crítica:** HelpText es preventivo (siempre visible), Validation es reactivo (solo cuando error)

```typescript
export class User extends BaseEntity {
    @PropertyName('Password', String)
    @Required()
    @HelpText('Min 8 characters, 1 uppercase, 1 lowercase, 1 number')  // ← Preventivo
    @Validation((value: string) => {
        if (value.length < 8) {
            return 'Password must be at least 8 characters';  // ← Reactivo
        }
        return null;
    })
    password!: string;
}
```

**UI States:**

Estado inicial:
- Help text visible: "Min 8 characters, 1 uppercase, 1 lowercase, 1 number"
- Error: No visible

Después de validation falla:
- Help text visible: "Min 8 characters..." (sigue visible)
- Error visible: "Password must be at least 8 characters" (ahora visible en rojo)

Archivo: [validation-decorator.md](validation-decorator.md)

### Relación con @Required

**Complementarios:** Required marca campo obligatorio, HelpText explica qué ingresar

```typescript
@PropertyName('Email', String)
@Required()  // ← Indica que es obligatorio (asterisco en label)
@HelpText('Enter a valid email address (e.g., user@example.com)')  // ← Explica formato
email!: string;
```

Archivo: [required-decorator.md](required-decorator.md)

### Relación con Placeholder

**Diferencia:** Placeholder dentro de input (desaparece), HelpText debajo de input (permanece)

```typescript
@PropertyName('Search', String)
// Placeholder attribute en component: placeholder="Type to search..."
@HelpText('Search by name, SKU, or category')  // ← Instrucciones adicionales
searchQuery!: string;
```

**UI:**
```
Search
┌──────────────────────────────────┐
│ Type to search...                │  ← Placeholder (desaparece al escribir)
└──────────────────────────────────┘
Search by name, SKU, or category     ← Help text (siempre visible)
```

### Relación con @Disabled

**Interacción:** Disabled fields pueden tener help text explicando por qué están disabled

```typescript
@PropertyName('Created At', Date)
@Disabled()
@HelpText('This field is automatically set by the system')
createdAt!: Date;
```

Archivo: [disabled-decorator.md](disabled-decorator.md)

### Relación con @StringType

**Complementarios:** StringType define tipo de input, HelpText explica formato esperado

```typescript
@PropertyName('Email', String)
@StringType('email')  // ← Selecciona EmailInput component
@HelpText('Enter a valid email address')  // ← Explica formato
email!: string;

@PropertyName('Phone', String)
@StringType('phone')  // ← Selecciona PhoneInput component  
@HelpText('Format: +1 (555) 123-4567')  // ← Muestra ejemplo de formato
phone!: string;
```

Archivo: [string-type-decorator.md](string-type-decorator.md)

## 10. Notas de Implementación

### Nota 1: Dynamic Help Text Se Re-evalúa en Cada Render

```typescript
@HelpText((entity: Product) => {
    console.log('EVALUATED!');  // ← Se ejecuta en cada render
    return `Stock: ${entity.stock}`;
})
stock!: number;
```

**Implicación:** Functions DEBEN ser rápidas (sin async, sin API calls).

### Nota 2: Help Text y Validation Errors Son Independientes

```typescript
// Ambos pueden mostrarse simultáneamente
@PropertyName('Username', String)
@HelpText('3-20 characters, alphanumeric only')  // ← Siempre visible
@Validation((value) => {
    if (value.length < 3) {
        return 'Username too short';  // ← Visible solo si error
    }
    return null;
})
username!: string;
```

### Nota 3: Multiidioma con Application Config

```typescript
import Application from '@/models/application';

@HelpText((entity: Product) => {
    const locale = Application.AppConfiguration.locale || 'en-US';
    
    const messages: Record<string, string> = {
        'en-US': 'Enter product name (max 100 characters)',
        'es-ES': 'Ingrese nombre del producto (máximo 100 caracteres)',
        'fr-FR': 'Entrez le nom du produit (max 100 caractères)'
    };
    
    return messages[locale] || messages['en-US'];
})
name!: string;
```

### Nota 4: Help Text con Contador de Caracteres

```typescript
@PropertyName('Description', String)
@HelpText((entity: Product) => {
    const maxLength = 500;
    const currentLength = entity.description?.length || 0;
    const remaining = maxLength - currentLength;
    
    return `${remaining} characters remaining (max ${maxLength})`;
})
description!: string;

// UI actualiza automáticamente:
// Inicio: "500 characters remaining (max 500)"
// Después de escribir 50: "450 characters remaining (max 500)"
```

### Nota 5: Estilos CSS Recomendados

```css
/* src/css/form.css */

.help-text {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 0.875rem;       /* 14px */
    line-height: 1.25rem;
    color: var(--gray-text);            /* Gray-500 */
    font-style: italic;
}

.error-text {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 0.875rem;
    color: var(--error-primary);            /* Red-500 */
    font-weight: 500;
}

.error-text::before {
    content: '[!] ';
    margin-right: 4px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    .help-text {
        color: var(--gray-lighter);        /* Gray-400 */
    }
}
```

### Nota 6: Help Text Contextual Basado en Entity State

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Amount', Number)
    @Required()
    @HelpText((entity: Invoice) => {
        if (entity.isPaid) {
            return 'This invoice has been paid. Amount cannot be changed.';
        }
        return 'Enter the invoice amount in USD';
    })
    amount!: number;
}
```

### Nota 7: Testing Help Text

```typescript
import { describe, it, expect } from 'vitest';
import Product from '@/entities/products';

describe('HelpText Decorator', () => {
    it('should return static help text', () => {
        const product = new Product();
        expect(product.getHelpText('name'))
            .toBe('Enter the product name (max 100 characters)');
    });
    
    it('should evaluate dynamic help text', () => {
        const newProduct = new Product();
        newProduct.id = undefined;
        expect(newProduct.getHelpText('stock'))
            .toBe('Enter initial stock quantity');
        
        const existingProduct = new Product();
        existingProduct.id = 42;
        existingProduct.stock = 150;
        expect(existingProduct.getHelpText('stock'))
            .toContain('Current stock: 150');
    });
});
```

### Nota 8: Help Text para Campos Complejos

```typescript
// Validación con múltiples reglas
@PropertyName('Password', String)
@Required()
@HelpText('Min 8 chars, 1 uppercase, 1 lowercase, 1 number')
@Validation((value: string) => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter';
    if (!/[a-z]/.test(value)) return 'Must contain lowercase letter';
    if (!/[0-9]/.test(value)) return 'Must contain number';
    return null;
})
password!: string;

// Help text muestra todos los requisitos
// Validation error muestra qué requisito específico falló
```

## 11. Referencias Cruzadas

### Documentación de Framework

- [BaseEntity Core](../02-base-entity/base-entity-core.md) - Implementación de getHelpText()
- [Validation System](../02-base-entity/validation-system.md) - Relación con validation errors
- [Additional Metadata](../02-base-entity/additional-metadata.md) - Métodos de acceso a metadata

### Decorators Relacionados

- [property-name-decorator.md](property-name-decorator.md) - Define label del campo
- [validation-decorator.md](validation-decorator.md) - Error messages vs help text
- [required-decorator.md](required-decorator.md) - Campos obligatorios con help
- [disabled-decorator.md](disabled-decorator.md) - Disabled fields con help text
- [string-type-decorator.md](string-type-decorator.md) - Tipo de input con help format

### Components

- `src/components/Form/TextInput.vue` - Implementación help text
- `src/components/Form/NumberInput.vue` - Implementación help text
- `src/components/Form/DateInput.vue` - Implementación help text
- Todos los form inputs deben mostrar help text

### Código Fuente

- `src/decorations/help_text_decorator.ts` - Implementación decorator
- `src/decorations/index.ts` - Export HELP_TEXT_METADATA Symbol
- `src/entities/base_entity.ts` - getHelpText() accessor methods

### Tutorials

- [02-validations.md](../../tutorials/02-validations.md) - Help text en formularios con validaciones

### CSS Styles

- `src/css/form.css` - Estilos para help-text y error-text classes

Última actualización: 11 de Febrero, 2026  
Archivo fuente: `src/decorations/help_text_decorator.ts`  
Líneas: 30

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
// src/entities/base_entity.ts

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

**Ubicación:** `src/entities/base_entity.ts` (línea ~810-850)

---

## Impacto en UI

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
import type BaseEntity from '@/entities/base_entity';

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
    color: var(--gray-text);  /* Gray */
    font-style: italic;
}

.error-text {
    margin-top: 4px;
    font-size: 0.875rem;
    color: var(--error-primary);  /* Red */
    font-weight: 500;
}
</style>
```

**Ubicación:** `src/components/Form/TextInput.vue`

---

## Ejemplos de Uso

### 1. Help Text Simple

```typescript
import { HelpText } from '@/decorations/help_text_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { Required } from '@/decorations/required_decorator';
import BaseEntity from '@/entities/base_entity';

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

## Estilos CSS Recomendados

```css
/* src/css/form.css */

.help-text {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 0.875rem;       /* 14px */
    line-height: 1.25rem;      /* 20px */
    color: var(--gray-text);            /* Gray-500 */
    font-style: italic;
}

.help-text a {
    color: var(--info-primary);            /* Blue-600 */
    text-decoration: underline;
}

.help-text a:hover {
    color: var(--info-darker);            /* Blue-700 */
}

/* Dark mode */
.dark .help-text {
    color: var(--gray-lighter);            /* Gray-400 */
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
    color: var(--error-primary);            /* Red-500 */
    font-weight: 500;
}

.error-text::before {
    content: '[!] ';
    margin-right: 4px;
}
```

---

## Consideraciones Importantes

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
[!] Invalid email format              ← Error (red)
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

## Referencias Adicionales

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
