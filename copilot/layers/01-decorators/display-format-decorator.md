# DisplayFormat Decorator

## 1. Propósito

El decorator DisplayFormat define función de formateo para transformar valor de propiedad al mostrarlo en ListView (tabla) y contextos de solo lectura. NO afecta valor almacenado ni input de edición. Critical para presentación visual de datos sin alterar data source: formatear moneda (1234.5 → $1,234.50), fechas (2024-01-15 → January 15, 2024), booleanos (true → ✅ Yes, false → ❌ No), truncar texto (Very long description... → Very long desc...), números (1234567 → 1,234,567), estados con badges (pending → ⏳ Pending), porcentajes (0.15 → 15%), tamaños de archivo (1048576 → 1.00 MB), duraciones (1.5 → 1h 30min), y relaciones de objects (Product object → Laptop (SKU: LAP-001)). Formateo aplicado exclusivamente en rendering de UI mediante getFormattedValue() accessor en BaseEntity, NO modifica valor real de propiedad ni afecta save()/toDictionary() output. Soporta formatters estáticos (simple functions) y dinámicos con this binding para acceder a entity instance (multimoneda según currency field). Framework separa completamente presentación visual de data storage, permitiendo cambiar formatting logic sin impactar backend contracts o validation rules.

## 2. Alcance

**Responsabilidades cubiertas:**
- Definir función de formateo que transforma valor raw a string formateado para display
- Aplicar formateo en ListView (tabla) mediante getFormattedValue() para todas las celdas
- Aplicar formateo en DetailView en modo readonly (no editable)
- Proveer getDisplayFormat(propertyKey) accessor que retorna formatter function o undefined
- Proveer getFormattedValue(propertyKey) accessor que ejecuta formatter y retorna string formateado
- Soportar formatters con this binding para acceder a otras propiedades de entity (multimoneda, contexto)
- Manejar valores null/undefined retornando '-' por defecto si formatter no los maneja
- Formatear tipos básicos sin formatter: Date → toLocaleDateString(), null → '-', otros → String(value)
- Permitir reutilización de formatters mediante factory functions o objeto común de formatters

**Límites del alcance:**
- Decorator NO modifica valor almacenado en propiedad (solo afecta visualización)
- NO aplica formateo en inputs editables (input muestra valor raw directamente)
- NO afecta toDictionary() output (backend recibe valores raw sin formatear)
- NO afecta validation (validaciones operan sobre valores raw)
- formatter NO debe tener side effects (no modificar state, no API calls, no logging)
- formatter function DEBE retornar string siempre (NO number, boolean, u otros tipos)
- Formateo ejecutado en cada render de UI (debe ser rápido, evitar cálculos costosos)
- NO valida que formatter retorne string (developer responsable de type correctness)
- getDisplayFormat() retorna undefined si NO hay formatter definido para propertyKey
- NO crea computed properties ni reactive values (solo transforma valor existente)

## 3. Definiciones Clave

**DISPLAY_FORMAT_KEY Symbol:** Identificador único usado como property key en prototype para almacenar object map de formatter functions. Definido como `export const DISPLAY_FORMAT_KEY = Symbol('display_format')`. Estructura: `{ [propertyKey: string]: (value: any) => string }`.

**DisplayFormatter Type:** Type alias `type DisplayFormatter = (value: any) => string`. Function que recibe valor de cualquier tipo y retorna string formateado. DEBE ser pure function sin side effects.

**Decorator Signature:** `function DisplayFormat(formatter: (value: any) => string): PropertyDecorator`. Parámetro único formatter es function que transforma valor.

**Formatter Function:** Function almacenada en metadata que ejecuta transformación de valor. Recibe valor raw como parámetro, opcionalmente puede usar this binding para acceder a entity instance. DEBE retornar string.

**getDisplayFormat(propertyKey) Accessor:** Método de instancia en BaseEntity que retorna formatter function o undefined. Ubicado en línea ~200 de base_entitiy.ts.

**getFormattedValue(propertyKey) Accessor:** Método de instancia en BaseEntity que ejecuta formatter si existe o aplica formateo por defecto, siempre retorna string. Ubicado en línea ~210 de base_entitiy.ts.

**Static Formatter:** Formatter function sin this binding, recibe solo value parameter. Ejemplo: `(value: number) => '$' + value.toFixed(2)`.

**Dynamic Formatter con this Binding:** Formatter function que usa this context para acceder a entity instance y otras propiedades. Ejemplo: `function(this: Invoice, value: number) { return this.currency + value; }`.

**Default Formatting:** Formateo aplicado por getFormattedValue() cuando NO hay DisplayFormat definido: null/undefined → '-', Date → toLocaleDateString(), otros → String(value).

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
// src/decorations/display_format_decorator.ts

import { DISPLAY_FORMAT_KEY } from './index';

/**
 * Define función de formateo para transformar valor de propiedad en visualización
 * 
 * @param formatter - Function que recibe valor y retorna string formateado
 * @returns PropertyDecorator
 */
export function DisplayFormat(
    formatter: (value: any) => string
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        const propKey = propertyKey.toString();
        
        if (!proto[DISPLAY_FORMAT_KEY]) {
            proto[DISPLAY_FORMAT_KEY] = {};
        }
        
        proto[DISPLAY_FORMAT_KEY][propKey] = formatter;
    };
}

export type DisplayFormatter = (value: any) => string;
export const DISPLAY_FORMAT_KEY = Symbol('display_format');
```

Ubicación: `src/decorations/display_format_decorator.ts` (líneas 1-30)

### Metadata Storage en Prototype

```typescript
// Estructura en prototype después de aplicar decorators
Product.prototype[DISPLAY_FORMAT_KEY] = {
    'price': (value: number) => {
        if (value == null) return '-';
        return `$${value.toFixed(2)}`;
    },
    'isActive': (value: boolean) => value ? 'Active' : 'Inactive',
    'createdAt': (value: Date) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('en-US');
    },
    'discount': (value: number) => {
        if (value == null) return '-';
        return `${(value * 100).toFixed(0)}%`;
    }
}
```

### Accessor Método getDisplayFormat() en BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene la función de formateo de una propiedad
 * 
 * @param key - Nombre de la propiedad
 * @returns Formatter function o undefined si no existe
 */
public getDisplayFormat(key: string): DisplayFormatter | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    const displayFormats = constructor.prototype[DISPLAY_FORMAT_KEY];
    
    if (!displayFormats) {
        return undefined;
    }
    
    return displayFormats[key];
}
```

Ubicación: `src/entities/base_entitiy.ts` (líneas ~200-215)

### Accessor Método getFormattedValue() en BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el valor formateado de una propiedad aplicando DisplayFormat si existe
 * 
 * @param key - Nombre de la propiedad
 * @returns String formateado
 */
public getFormattedValue(key: string): string {
    const value = (this as any)[key];
    
    // Intentar obtener formatter
    const formatter = this.getDisplayFormat(key);
    
    if (formatter) {
        try {
            return formatter.call(this, value);
        } catch (error) {
            console.error(`Error formatting ${key}:`, error);
            return String(value);
        }
    }
    
    // Sin formatter, aplicar formateo por defecto
    if (value == null) {
        return '-';
    }
    
    if (value instanceof Date) {
        return value.toLocaleDateString();
    }
    
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    
    return String(value);
}
```

Ubicación: `src/entities/base_entitiy.ts` (líneas ~220-255)

### Integración en ListView Component

```vue
<!-- src/views/default_listview.vue -->

<template>
  <table class="list-table">
    <thead>
      <tr>
        <th v-for="prop in properties" :key="prop">
          {{ entityClass.getPropertyName(prop) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entity in entities" :key="entity.getPrimaryPropertyValue()">
        <td v-for="prop in properties" :key="prop">
          <!-- Usa getFormattedValue() para aplicar DisplayFormat -->
          {{ entity.getFormattedValue(prop) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type BaseEntity from '@/entities/base_entitiy';

const props = defineProps<{
    entities: BaseEntity[];
    entityClass: typeof BaseEntity;
}>();

const properties = computed(() => {
    return props.entityClass.getProperties();
});
</script>
```

Ubicación: `src/views/default_listview.vue` (líneas ~80-115)

### Integración en DetailView ReadOnly

```vue
<!-- src/views/default_detailview.vue -->

<template>
  <div class="detail-view" :class="{ 'readonly': isReadOnly }">
    <div v-for="prop in entity.getProperties()" :key="prop" class="field">
      <label>{{ entity.getPropertyName(prop) }}</label>
      
      <!-- Modo ReadOnly: Usar formato -->
      <span v-if="isReadOnly" class="readonly-value">
        {{ entity.getFormattedValue(prop) }}
      </span>
      
      <!-- Modo Editable: Usar input sin formato -->
      <component
        v-else
        :is="getInputComponent(prop)"
        v-model="entity[prop]"
        :property="prop"
        :entity="entity"
      />
    </div>
  </div>
</template>
```

Ubicación: `src/views/default_detailview.vue` (líneas ~50-75)

## 5. Flujo de Funcionamiento

### Fase 1: Aplicación del Decorator

```typescript
export class Product extends BaseEntity {
    @PropertyName('Price', Number)
    @DisplayFormat((value: number) => {
        if (value == null) return '-';
        return `$${value.toFixed(2)}`;
    })  // ← Decorator ejecutado aquí
    price!: number;
}

// Resultado en prototype:
Product.prototype[DISPLAY_FORMAT_KEY] = {
    'price': (value: number) => {
        if (value == null) return '-';
        return `$${value.toFixed(2)}`;
    }
}
```

### Fase 2: Constructor y Asignación de Valores

```typescript
const product = new Product();
product.price = 1299.99;

// Valor raw almacenado:
console.log(product.price);  // 1299.99 (number)

// Metadata de formatter disponible en prototype
console.log(product.getDisplayFormat('price'));  // function
```

### Fase 3: Renderizado en ListView

```vue
<template>
  <!-- ListView itera entities y properties -->
  <tr v-for="entity in products">
    <td v-for="prop in properties">
      {{ entity.getFormattedValue(prop) }}
      <!-- ↑ Llama a BaseEntity.getFormattedValue() -->
    </td>
  </tr>
</template>
```

Flujo interno de getFormattedValue():

1. Obtiene valor raw: `value = entity['price']` → 1299.99
2. Llama getDisplayFormat('price') → retorna formatter function
3. Ejecuta formatter: `formatter.call(entity, 1299.99)` → "$1,299.99"
4. Retorna string formateado
5. Vue renderiza string en celda de tabla

### Fase 4: Formateo con this Binding (Multimoneda)

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Currency', String)
    currency!: string;  // 'USD', 'EUR', 'GBP'
    
    @PropertyName('Total Amount', Number)
    @DisplayFormat(function(this: Invoice, value: number) {
        if (value == null) return '-';
        
        const symbols: Record<string, string> = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        };
        
        const symbol = symbols[this.currency] || '';
        return `${symbol}${value.toFixed(2)}`;
    })
    totalAmount!: number;
}

// Uso:
const invoice = new Invoice();
invoice.currency = 'EUR';
invoice.totalAmount = 1500;

// getFormattedValue() ejecuta formatter con this = invoice
invoice.getFormattedValue('totalAmount');  // "€1500.00"
```

### Fase 5: Guardado al Backend (Formateo NO Afecta)

```typescript
const product = new Product();
product.price = 1299.99;

// Display en UI:
console.log(product.getFormattedValue('price'));  // "$1,299.99"

// Guardar al backend:
await product.save();

// toDictionary() usa valor raw:
const payload = product.toDictionary();
console.log(payload);
// {
//   price: 1299.99  // ← Valor raw, NO formateado
// }
```

## 6. Reglas Obligatorias

### Regla 1: Formatter DEBE Retornar String Siempre

```typescript
// CORRECTO:
@DisplayFormat((value: number) => `$${value}`)   // Retorna string

// INCORRECTO:
@DisplayFormat((value: number) => value * 2)     // ← ERROR: Retorna number
```

### Regla 2: Formatter DEBE Manejar null/undefined

```typescript
// CORRECTO:
@DisplayFormat((value: number) => {
    if (value == null) return '-';  // ← Manejo de null/undefined
    return `$${value.toFixed(2)}`;
})

// INCORRECTO (crash si value es null):
@DisplayFormat((value: number) => `$${value.toFixed(2)}`)  // ← Error si value null
```

### Regla 3: Formatter NO DEBE Tener Side Effects

```typescript
// CORRECTO (pure function):
@DisplayFormat((value: number) => {
    return `$${value.toFixed(2)}`;  // Solo transformación
})

// INCORRECTO (side effects):
@DisplayFormat((value: number) => {
    console.log('Formatting');  // ← Side effect
    return `$${value}`;
})
```

### Regla 4: Extraer Formatters Reutilizables

```typescript
// Crear utils/formatters.ts
export const Formatters = {
    currency: (value: number) => {
        if (value == null) return '-';
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
};

// Usar en entities
@DisplayFormat(Formatters.currency)
price!: number;
```

## 7. Prohibiciones

### Prohibición 1: NO Modificar Valor Original

```typescript
// PROHIBIDO (mutación):
@DisplayFormat((value: Product) => {
    value.name = value.name.toUpperCase();  // ← PROHIBIDO
    return value.name;
})

// CORRECTO:
@DisplayFormat((value: Product) => {
    return value.name.toUpperCase();  // ← Solo lectura
})
```

### Prohibición 2: NO Retornar Tipos Diferentes a String

```typescript
// PROHIBIDO:
@DisplayFormat((value: number) => value * 2)    // ← Retorna number

// CORRECTO:
@DisplayFormat((value: number) => String(value * 2))  // ← Retorna string
```

### Prohibición 3: NO Hacer API Calls

```typescript
// PROHIBIDO:
@DisplayFormat(async (value: number) => {  // ← async PROHIBIDO
    const rate = await fetch('/api/rate');
    return `$${value * rate}`;
})
```

### Prohibición 4: NO Confundir con @Mask

```typescript
// @DisplayFormat: Para visualización en tablas
@DisplayFormat((value: string) => value.toUpperCase())
sku!: string;

// @Mask: Para input mask durante edición
@Mask('(###) ###-####')
phone!: string;
```

## 8. Dependencias

### Dependencia 1: BaseEntity Core

```typescript
// BaseEntity provee getDisplayFormat() y getFormattedValue()
import BaseEntity from '@/entities/base_entitiy';

export class Product extends BaseEntity {
    @DisplayFormat((v) => `$${v}`)
    price!: number;
}
```

Archivo: [base-entity-core.md](../02-base-entity/base-entity-core.md)

### Dependencia 2: PropertyName Decorator

```typescript
// PropertyName debe aplicarse ANTES de DisplayFormat
@PropertyName('Price', Number)    // ← PRIMERO
@DisplayFormat((v) => `$${v}`)    // ← SEGUNDO
price!: number;
```

Archivo: [property-name-decorator.md](property-name-decorator.md)

### Dependencia 3: ListView Component

```vue
<!-- ListView usa getFormattedValue() -->
<td>{{ entity.getFormattedValue(prop) }}</td>
```

Archivo: `src/views/default_listview.vue`

### Dependencia 4: DetailView Component

```vue
<!-- DetailView usa getFormattedValue() en readonly -->
<span v-if="isReadOnly">
    {{ entity.getFormattedValue(prop) }}
</span>
```

Archivo: `src/views/default_detailview.vue`

## 9. Relaciones

### Relación con @StringType

**Diferencia:** @StringType define subtipo, @DisplayFormat define visualización

```typescript
@PropertyName('Email', String)
@StringType('email')        // ← Tipo
@DisplayFormat((v) => v.toLowerCase())  // ← Visualización
email!: string;
```

Archivo: [string-type-decorator.md](string-type-decorator.md)

### Relación con @Mask

**Diferencia:** @Mask para input, @DisplayFormat para visualización

```typescript
@Mask('(###) ###-####')      // ← Input mask
phone!: string;

@DisplayFormat((v) => `formatted`)  // ← Display format
otherField!: string;
```

Archivo: [mask-decorator.md](mask-decorator.md)

### Relación con @HideInListView

**Interacción:** Si hidden, DisplayFormat NO ejecutado

```typescript
@HideInListView()            // ← NO renderizado
@DisplayFormat((v) => v.toUpperCase())  // ← NO ejecutado
internalNotes!: string;
```

Archivo: [hide-in-list-view-decorator.md](hide-in-list-view-decorator.md)

## 10. Notas de Implementación

### Nota 1: Formatters Son Ejecutados en Cada Render

```typescript
@DisplayFormat((value: number) => {
    console.log('FORMATTING!');  // ← Ejecutado múltiples veces
    return `$${value}`;
})
price!: number;
```

### Nota 2: this Binding Requiere Function Declaration

```typescript
// CORRECTO con this:
@DisplayFormat(function(this: Invoice, value: number) {
    return this.currency + value;  // ← this accesible
})

// INCORRECTO (arrow function):
@DisplayFormat((value: number) => {
    return this.currency + value;  // ← ERROR: this undefined
})
```

### Nota 3: getFormattedValue() Maneja Errores

```typescript
public getFormattedValue(key: string): string {
    const formatter = this.getDisplayFormat(key);
    
    if (formatter) {
        try {
            return formatter.call(this, value);
        } catch (error) {
            console.error(`Error formatting ${key}:`, error);
            return String(value);  // ← Fallback
        }
    }
    // ...
}
```

### Nota 4: Ejemplos Avanzados

#### Formateo de Moneda Multimoneda

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Currency', String)
    currency!: string;
    
    @PropertyName('Total', Number)
    @DisplayFormat(function(this: Invoice, value: number) {
        const symbols = { USD: '$', EUR: '€', GBP: '£' };
        return `${symbols[this.currency] || ''}${value.toFixed(2)}`;
    })
    total!: number;
}
```

#### Truncar Texto

```typescript
@DisplayFormat((value: string) => {
    if (!value) return '-';
    const maxLength = 50;
    return value.length > maxLength 
        ? value.substring(0, maxLength) + '...' 
        : value;
})
content!: string;
```

#### Formatear Porcentaje

```typescript
@DisplayFormat((value: number) => {
    if (value == null) return '-';
    return `${(value * 100).toFixed(0)}%`;
})
discount!: number;  // 0.15 → "15%"
```

#### Formatear Tamaño de Archivo

```typescript
@DisplayFormat((value: number) => {
    if (value == null) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = value;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
})
fileSize!: number;  // 1048576 → "1.00 MB"
```

## 11. Referencias Cruzadas

### Documentación de Framework

- [BaseEntity Core](../02-base-entity/base-entity-core.md) - getDisplayFormat() y getFormattedValue()
- [Additional Metadata](../02-base-entity/additional-metadata.md) - Acceso a metadata de formateo
- [State and Conversion](../02-base-entity/state-and-conversion.md) - toDictionary() NO aplica DisplayFormat

### Decorators Relacionados

- [property-name-decorator.md](property-name-decorator.md) - Definición de propiedades
- [string-type-decorator.md](string-type-decorator.md) - Subtipo de string
- [mask-decorator.md](mask-decorator.md) - Máscara en inputs
- [hide-in-list-view-decorator.md](hide-in-list-view-decorator.md) - Ocultar en lista
- [default-property-decorator.md](default-property-decorator.md) - Valor inicial
- [validation-decorator.md](validation-decorator.md) - Validación opera sobre raw value

### Components

- `src/views/default_listview.vue` - ListView usa getFormattedValue()
- `src/views/default_detailview.vue` - DetailView usa getFormattedValue()

### Código Fuente

- `src/decorations/display_format_decorator.ts` - Implementación decorator
- `src/decorations/index.ts` - Export DISPLAY_FORMAT_KEY Symbol
- `src/entities/base_entitiy.ts` - getDisplayFormat() y getFormattedValue()

### Utilities

- `src/utils/formatters.ts` - Formatters reutilizables (currency, percentage, date)

Última actualización: 11 de Febrero, 2026  
Archivo fuente: `src/decorations/display_format_decorator.ts`  
Líneas: 30

```typescript
function DisplayFormat(formatter: (value: any) => string): PropertyDecorator
```

### Tipos

```typescript
export type DisplayFormatter = (value: any) => string;
```

---

## Uso Básico

### Formatear Precio

```typescript
export class Product extends BaseEntity {
    @PropertyName('Price', Number)
    @DisplayFormat((value) => {
        if (value == null) return '-';
        return `$${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    })
    price!: number;
}
```

**Vista de Lista:**
```
╔═══════════════════════════════════════╗
║ ID │ Product Name │ Price             ║
╠════╪══════════════╪════════════════════╣
║  1 │ Laptop       │ $1,299.99         ║  ← Formateado
║  2 │ Mouse        │ $24.95            ║  ← Formateado
║  3 │ Keyboard     │ $79.50            ║  ← Formateado
╚════╧══════════════╧════════════════════╝
```

**Vista de Edición:**
```
Price: [1299.99                    ]  ← Valor sin formato (editable)
```

### Formatear Fecha

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order Date', Date)
    @DisplayFormat((value) => {
        if (!value) return '-';
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    })
    orderDate!: Date;
}
```

**Resultado:** `2024-01-15` → `January 15, 2024`

### Formatear Boolean

```typescript
export class User extends BaseEntity {
    @PropertyName('Active', Boolean)
    @DisplayFormat((value) => value ? '✅ Yes' : '❌ No')
    isActive!: boolean;
}
```

**Resultado:**  
- `true` → `✅ Yes`  
- `false` → `❌ No`

---

## Funciones Accesoras en BaseEntity

### Métodos de Instancia

#### `getDisplayFormat(key: string): DisplayFormatter | undefined`
Obtiene la función de formateo de una propiedad.

```typescript
// Uso
const product = new Product({ price: 1299.99 });
const formatter = product.getDisplayFormat('price');

if (formatter) {
    console.log(formatter(product.price));
    // Output: "$1,299.99"
}

// Ubicación en BaseEntity (línea ~200)
public getDisplayFormat(key: string): DisplayFormatter | undefined {
    const displayFormats = (this.constructor as any).prototype[DISPLAY_FORMAT_KEY];
    return displayFormats?.[key];
}
```

#### `getFormattedValue(key: string): string`
Obtiene el valor formateado de una propiedad (aplicando DisplayFormat si existe).

```typescript
// Uso
const product = new Product({ 
    name: 'Laptop', 
    price: 1299.99 
});

product.getFormattedValue('name');
// Retorna: "Laptop" (sin formato, devuelve toString())

product.getFormattedValue('price');
// Retorna: "$1,299.99" (con formato aplicado)

// Ubicación en BaseEntity (línea ~210)
public getFormattedValue(key: string): string {
    const value = (this as any)[key];
    
    // Obtener formatter
    const formatter = this.getDisplayFormat(key);
    
    if (formatter) {
        return formatter(value);
    }
    
    // Sin formatter, retornar toString() o '-'
    if (value == null) return '-';
    
    if (value instanceof Date) {
        return value.toLocaleDateString();
    }
    
    return String(value);
}
```

---

## 🎨 Impacto en UI

### ListView (Tabla)

```vue
<template>
  <table class="list-table">
    <thead>
      <tr>
        <th v-for="prop in properties" :key="prop">
          {{ entityClass.prototype.getPropertyName(prop) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entity in entities" :key="entity.id">
        <td v-for="prop in properties" :key="prop">
          <!-- Usa getFormattedValue() para aplicar DisplayFormat -->
          {{ entity.getFormattedValue(prop) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

**Ubicación:** `src/views/default_listview.vue` (línea ~95)

### DetailView en Modo ReadOnly

```vue
<template>
  <div class="detail-view readonly">
    <div v-for="prop in entity.getProperties()" :key="prop">
      <label>{{ entity.getPropertyName(prop) }}</label>
      <span class="readonly-value">
        <!-- En modo readonly, usar formato -->
        {{ entity.getFormattedValue(prop) }}
      </span>
    </div>
  </div>
</template>
```

### DetailView en Modo Editable

```vue
<template>
  <div class="detail-view editable">
    <div v-for="prop in entity.getProperties()" :key="prop">
      <label>{{ entity.getPropertyName(prop) }}</label>
      
      <!-- Input editable NO usa DisplayFormat -->
      <input v-model="entity[prop]" />
      <!-- ↑ Valor raw: 1299.99 -->
      
      <!-- Preview con formato (opcional) -->
      <small class="format-preview">
        Preview: {{ entity.getFormattedValue(prop) }}
      </small>
      <!-- ↑ "$1,299.99" -->
    </div>
  </div>
</template>
```

---

## 🧪 Ejemplos Avanzados

### 1. Formateo de Moneda Multimoneda

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Currency', String)
    currency!: string;  // 'USD', 'EUR', 'GBP'
    
    @PropertyName('Total Amount', Number)
    @DisplayFormat(function(this: Invoice, value: number) {
        // "this" es la instancia de Invoice
        if (value == null) return '-';
        
        const symbol = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        }[this.currency] || '';
        
        return `${symbol}${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    })
    totalAmount!: number;
}

// Uso:
const invoice1 = new Invoice({ currency: 'USD', totalAmount: 1500 });
invoice1.getFormattedValue('totalAmount');  // "$1,500.00"

const invoice2 = new Invoice({ currency: 'EUR', totalAmount: 1500 });
invoice2.getFormattedValue('totalAmount');  // "€1,500.00"
```

### 2. Truncar Texto Largo

```typescript
export class Article extends BaseEntity {
    @PropertyName('Title', String)
    title!: string;
    
    @PropertyName('Content', String)
    @DisplayFormat((value) => {
        if (!value) return '-';
        const maxLength = 50;
        return value.length > maxLength 
            ? value.substring(0, maxLength) + '...' 
            : value;
    })
    content!: string;
}

// Resultado:
// "This is a very long article content that should be truncated..."
// → "This is a very long article content that should..."
```

### 3. Formatear Relación (ObjectInput)

```typescript
export class OrderItem extends BaseEntity {
    @PropertyName('Product', Product)
    @DisplayFormat((value: Product) => {
        if (!value) return '-';
        return `${value.name} (SKU: ${value.sku})`;
    })
    product!: Product;
}

// Resultado en lista:
// Product object → "Laptop (SKU: LAP-001)"
```

### 4. Formatear Array

```typescript
export class Project extends BaseEntity {
    @PropertyName('Tags', Array)
    @ArrayOf(String)
    @DisplayFormat((value: string[]) => {
        if (!value || value.length === 0) return '-';
        return value.join(', ');
    })
    tags!: string[];
}

// Resultado:
// ['typescript', 'vue', 'frontend'] → "typescript, vue, frontend"
```

### 5. Formatear Estado con Badges

```typescript
export class Order extends BaseEntity {
    @PropertyName('Status', String)
    @DisplayFormat((value: string) => {
        const badges: Record<string, string> = {
            'pending': '⏳ Pending',
            'processing': '🔄 Processing',
            'shipped': '📦 Shipped',
            'delivered': '✅ Delivered',
            'cancelled': '❌ Cancelled'
        };
        return badges[value] || value;
    })
    status!: string;
}
```

### 6. Formatear Porcentaje

```typescript
export class Product extends BaseEntity {
    @PropertyName('Discount', Number)
    @DisplayFormat((value: number) => {
        if (value == null) return '-';
        return `${(value * 100).toFixed(0)}%`;
    })
    discount!: number;  // 0.15 → "15%"
}
```

### 7. Formatear Fecha Relativa

```typescript
export class Notification extends BaseEntity {
    @PropertyName('Created At', Date)
    @DisplayFormat((value: Date) => {
        if (!value) return '-';
        
        const now = new Date();
        const date = value instanceof Date ? value : new Date(value);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    })
    createdAt!: Date;
}

// "Just now"
// "5 minutes ago"
// "2 hours ago"
// "3 days ago"
// "01/15/2024"
```

### 8. Formatear Tamaño de Archivo

```typescript
export class Attachment extends BaseEntity {
    @PropertyName('File Size', Number)  // En bytes
    @DisplayFormat((value: number) => {
        if (value == null) return '-';
        
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = value;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    })
    fileSize!: number;
}

// 1024 → "1.00 KB"
// 1048576 → "1.00 MB"
// 5242880 → "5.00 MB"
```

### 9. Formatear Duración

```typescript
export class Task extends BaseEntity {
    @PropertyName('Estimated Hours', Number)
    @DisplayFormat((value: number) => {
        if (value == null) return '-';
        
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        
        if (hours === 0) return `${minutes}min`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}min`;
    })
    estimatedHours!: number;
}

// 1.5 → "1h 30min"
// 0.25 → "15min"
// 2 → "2h"
```

### 10. Formatear con Contexto de Aplicación

```typescript
import Application from '@/models/application';

export class Product extends BaseEntity {
    @PropertyName('Price', Number)
    @DisplayFormat((value: number) => {
        if (value == null) return '-';
        
        // Obtener configuración de la aplicación
        const locale = Application.AppConfiguration?.locale || 'en-US';
        const currency = Application.AppConfiguration?.currency || 'USD';
        
        return value.toLocaleString(locale, {
            style: 'currency',
            currency: currency
        });
    })
    price!: number;
}

// Si locale='en-US', currency='USD' → "$1,299.99"
// Si locale='es-ES', currency='EUR' → "1.299,99 €"
```

---

## ⚠️ Consideraciones Importantes

### 1. DisplayFormat es Solo para Visualización

El valor formateado NO se guarda en el objeto:

```typescript
@DisplayFormat((v) => `$${v}`)
price!: number;

const product = new Product({ price: 100 });

console.log(product.price);  // 100 (valor raw)
console.log(product.getFormattedValue('price'));  // "$100" (formateado)

// Al guardar, se envía el valor raw: 100
await product.save();  // Body: { price: 100 }, no { price: "$100" }
```

### 2. Siempre Retornar String

La función DEBE retornar string:

```typescript
// ✅ CORRECTO
@DisplayFormat((v) => `$${v}`)  // Retorna string

// ❌ INCORRECTO
@DisplayFormat((v) => v * 2)  // Retorna number ← ERROR
```

### 3. Manejar Valores Nulos

```typescript
// ✅ BIEN
@DisplayFormat((value) => {
    if (value == null) return '-';  // ← Manejo de null/undefined
    return `$${value}`;
})

// ❌ MAL (crash si value es null)
@DisplayFormat((value) => `$${value.toFixed(2)}`)
```

### 4. No Mutar el Valor Original

```typescript
// ❌ MAL: Mutando objeto
@DisplayFormat((value: Product) => {
    value.name = value.name.toUpperCase();  // ← Mutación ❌
    return value.name;
})

// ✅ BIEN: Solo lectura
@DisplayFormat((value: Product) => {
    return value.name.toUpperCase();  // ← No muta
})
```

### 5. Performance en Listas Grandes

Si la lista tiene muchos registros (>1000), evita formateos costosos:

```typescript
// ❌ Lento para listas grandes
@DisplayFormat((value) => {
    // Cálculos complejos...
    return complexCalculation(value);
})

// ✅ Mejor: Precalcular o simplificar
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function DisplayFormat(formatter: (value: any) => string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        if (!proto[DISPLAY_FORMAT_KEY]) {
            proto[DISPLAY_FORMAT_KEY] = {};
        }
        
        proto[DISPLAY_FORMAT_KEY][propertyKey] = formatter;
    };
}
```

**Ubicación:** `src/decorations/display_format_decorator.ts` (línea ~10)

---

## 📊 Flujo de Formateo

```
1. ListView/DetailView necesita mostrar un valor
        ↓
2. Llama entity.getFormattedValue(propertyKey)
        ↓
3. BaseEntity.getFormattedValue() ejecuta:
   a. Obtiene el valor raw: entity[propertyKey]
   b. Verifica si hay DisplayFormat para esa propiedad
        ↓
4. Si hay DisplayFormat:
   a. Llama formatter(value)
   b. Retorna string formateado
        ↓
5. Si NO hay DisplayFormat:
   a. Si value es null → retorna '-'
   b. Si value es Date → retorna toLocaleDateString()
   c. Caso contrario → retorna String(value)
        ↓
6. El string se renderiza en la UI
```

---

## 🎓  Mejores Prácticas

### 1. Extraer Formateadores Comunes

```typescript
// utils/formatters.ts
export const Formatters = {
    currency: (value: number) => {
        if (value == null) return '-';
        return `$${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },
    
    percentage: (value: number) => {
        if (value == null) return '-';
        return `${(value * 100).toFixed(0)}%`;
    },
    
    date: (value: Date) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('en-US');
    },
    
    boolean: (value: boolean) => value ? '✅ Yes' : '❌ No'
};

// entities/product.ts
import { Formatters } from '@/utils/formatters';

export class Product extends BaseEntity {
    @DisplayFormat(Formatters.currency)
    price!: number;
    
    @DisplayFormat(Formatters.percentage)
    discount!: number;
}
```

### 2. Formateo Según Configuración

```typescript
// Crear factory function
function currencyFormatter() {
    return (value: number) => {
        const config = Application.AppConfiguration;
        return value.toLocaleString(config.locale, {
            style: 'currency',
            currency: config.currency
        });
    };
}

@DisplayFormat(currencyFormatter())
price!: number;
```

### 3. Documentar Formateo

```typescript
/**
 * Price of the product
 * Display: Formatted as currency with 2 decimals ($1,299.99)
 * Storage: Number (1299.99)
 */
@PropertyName('Price', Number)
@DisplayFormat((v) => v ? `$${v.toFixed(2)}` : '-')
price!: number;
```

---

## 📚 Referencias Adicionales

- `property-name-decorator.md` - Definir propiedades
- `string-type-decorator.md` - Tipos de string
- `mask-decorator.md` - Máscaras de input
- `../04-components/list-view-component.md` - Renderizado de lista
- `../../02-FLOW-ARCHITECTURE.md` - Flujo de datos

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/display_format_decorator.ts`
