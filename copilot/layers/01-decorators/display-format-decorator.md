# 🎨 DisplayFormat Decorator

**Referencias:**
- `property-name-decorator.md` - PropertyName
- `string-type-decorator.md` - StringType
- `mask-decorator.md` - Mask
- `../04-components/list-view-component.md` - ListView rendering

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/display_format_decorator.ts`

---

## 🎯 Propósito

Define una **función de formateo** para transformar el valor de una propiedad al mostrarlo en la **ListView (tabla)** y otros contextos de solo lectura. No afecta el valor almacenado ni el input de edición.

Casos de uso:
- Formatear moneda: `1234.5` → `$1,234.50`
- Formatear fechas: `2024-01-15` → `15/01/2024` o `January 15, 2024`
- Formatear booleanos: `true` → `✅ Yes` / `false` → `❌ No`
- Truncar texto: `"Very long description..."` → `"Very long desc..."`
- Formatear números: `1234567` → `1,234,567`

---

## 🔑 Símbolo de Metadatos

```typescript
export const DISPLAY_FORMAT_KEY = Symbol('display_format');
```

### Almacenamiento

```typescript
proto[DISPLAY_FORMAT_KEY] = {
    'price': (value: number) => `$${value.toFixed(2)}`,
    'isActive': (value: boolean) => value ? '✅ Active' : '❌ Inactive',
    'createdAt': (value: Date) => value.toLocaleDateString('en-US')
}
```

---

## 💻 Firma del Decorador

```typescript
function DisplayFormat(formatter: (value: any) => string): PropertyDecorator
```

### Tipos

```typescript
export type DisplayFormatter = (value: any) => string;
```

---

## 📖 Uso Básico

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

## 🔍 Funciones Accesoras en BaseEntity

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
