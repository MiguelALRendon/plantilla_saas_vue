# 📏 CssColumnClass Decorator

**Referencias:**
- `property-index-decorator.md` - PropertyIndex controla orden, CssColumnClass controla ancho
- `view-group-decorator.md` - ViewGroup organiza, CssColumnClass ajusta layout
- `view-group-row-decorator.md` - ViewGroupRow + CssColumnClass para layouts precisos
- `../../02-base-entity/base-entity-core.md` - getCssColumnClass() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/css_column_class_decorator.ts`

---

## 🎯 Propósito

El decorador `@CssColumnClass()` asigna **clases CSS de columna** a una propiedad para controlar su ancho en layouts de grid/columnas, típicamente usando sistemas como Bootstrap, Tailwind, o custom CSS Grid.

**Beneficios:**
- Control preciso de layout en formularios
- Layouts responsivos con grid systems
- Columnas de diferentes anchos
- Multi-column forms sin CSS manual

---

## 📝 Sintaxis

```typescript
@CssColumnClass(className: string)
propertyName: Type;
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `className` | `string` | Sí | Clase(s) CSS para la columna (ej: 'col-md-6', 'w-1/2') |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/css_column_class_decorator.ts

/**
 * Symbol para almacenar metadata de CSS column class
 */
export const CSS_COLUMN_CLASS_METADATA = Symbol('cssColumnClass');

/**
 * @CssColumnClass() - Asigna clase CSS de columna a una propiedad
 * 
 * @param className - Clase(s) CSS a aplicar (ej: 'col-md-6')
 * @returns PropertyDecorator
 */
export function CssColumnClass(className: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[CSS_COLUMN_CLASS_METADATA]) {
            target[CSS_COLUMN_CLASS_METADATA] = {};
        }
        
        // Guardar clase CSS
        target[CSS_COLUMN_CLASS_METADATA][propertyKey] = className;
    };
}
```

**Ubicación:** `src/decorations/css_column_class_decorator.ts` (línea ~1-30)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[CSS_COLUMN_CLASS_METADATA] = {
    'name': 'col-md-8',          // 8/12 columnas
    'sku': 'col-md-4',            // 4/12 columnas
    'price': 'col-md-3',          // 3/12 columnas
    'stock': 'col-md-3',          // 3/12 columnas
    'category': 'col-md-6',       // 6/12 columnas
    'description': 'col-md-12'    // Full width
};
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene la clase CSS de columna de una propiedad
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns Clase CSS o 'col-md-12' (default full width)
 */
public getCssColumnClass(propertyKey: string): string {
    const constructor = this.constructor as typeof BaseEntity;
    const cssMetadata = constructor.prototype[CSS_COLUMN_CLASS_METADATA];
    
    if (!cssMetadata || !cssMetadata[propertyKey]) {
        return 'col-md-12';  // Default: full width
    }
    
    return cssMetadata[propertyKey];
}

/**
 * Obtiene la clase CSS de columna (método estático)
 */
public static getCssColumnClass(propertyKey: string): string {
    const cssMetadata = this.prototype[CSS_COLUMN_CLASS_METADATA];
    
    if (!cssMetadata || !cssMetadata[propertyKey]) {
        return 'col-md-12';
    }
    
    return cssMetadata[propertyKey];
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1520-1560)

---

## 🎨 Impacto en UI

### DetailView con CssColumnClass

```vue
<!-- src/views/default_detailview.vue -->

<template>
  <div class="detail-view">
    <form @submit.prevent="saveEntity" class="row">
      <!-- Cada campo con su clase CSS de columna -->
      <div 
        v-for="prop in properties" 
        :key="prop"
        :class="getCssColumnClass(prop)"
      >
        <component 
          :is="getInputComponent(prop)"
          v-model="entity[prop]"
          :property="prop"
          :entity="entity"
        />
      </div>
      
      <div class="col-md-12">
        <button type="submit">Save</button>
        <button type="button" @click="cancel">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';

const entityClass = computed(() => Application.View.value.entityClass);
const properties = computed(() => entityClass.value.getProperties());

function getCssColumnClass(propertyName: string): string {
    return entityClass.value.getCssColumnClass(propertyName);
}
</script>

<style scoped>
/* Bootstrap Grid */
.row {
    display: flex;
    flex-wrap: wrap;
    margin: -15px;
}

.row > div {
    padding: 15px;
}

/* Responsive columns */
@media (min-width: 768px) {
    .col-md-1 { width: 8.333%; }
    .col-md-2 { width: 16.666%; }
    .col-md-3 { width: 25%; }
    .col-md-4 { width: 33.333%; }
    .col-md-6 { width: 50%; }
    .col-md-8 { width: 66.666%; }
    .col-md-12 { width: 100%; }
}

@media (max-width: 767px) {
    [class*="col-md-"] {
        width: 100%;  /* Stack en móviles */
    }
}
</style>
```

---

## 🧪 Ejemplos de Uso

### 1. Two-Column Layout

```typescript
import { CssColumnClass } from '@/decorations/css_column_class_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { Required } from '@/decorations/required_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class User extends BaseEntity {
    // Primera fila: firstName | lastName
    @PropertyName('First Name', String)
    @Required()
    @CssColumnClass('col-md-6')  // ← 50% width
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @Required()
    @CssColumnClass('col-md-6')  // ← 50% width
    lastName!: string;
    
    // Segunda fila: email | phone
    @PropertyName('Email', String)
    @Required()
    @CssColumnClass('col-md-6')
    email!: string;
    
    @PropertyName('Phone', String)
    @CssColumnClass('col-md-6')
    phone!: string;
}
```

**Resultado en UI:**
```
┌─────────────────────────┬─────────────────────────┐
│ First Name              │ Last Name               │
│ [John                 ] │ [Doe                  ] │
├─────────────────────────┼─────────────────────────┤
│ Email                   │ Phone                   │
│ [john@example.com     ] │ [(555) 123-4567       ] │
└─────────────────────────┴─────────────────────────┘
```

---

### 2. Asymmetric Columns

```typescript
export class Product extends BaseEntity {
    // Name: 8 cols, SKU: 4 cols
    @PropertyName('Product Name', String)
    @Required()
    @CssColumnClass('col-md-8')  // ← 66.666% width
    name!: string;
    
    @PropertyName('SKU', String)
    @Required()
    @CssColumnClass('col-md-4')  // ← 33.333% width
    sku!: string;
    
    // Price: 3 cols, Stock: 3 cols, Category: 6 cols
    @PropertyName('Price', Number)
    @Required()
    @CssColumnClass('col-md-3')  // ← 25%
    price!: number;
    
    @PropertyName('Stock', Number)
    @Required()
    @CssColumnClass('col-md-3')  // ← 25%
    stock!: number;
    
    @PropertyName('Category', String)
    @CssColumnClass('col-md-6')  // ← 50%
    category!: string;
    
    // Description: full width
    @PropertyName('Description', String)
    @StringType(StringTypeEnum.TEXTAREA)
    @CssColumnClass('col-md-12')  // ← 100% width
    description!: string;
}
```

**Resultado:**
```
┌────────────────────────────────────────┬──────────────────┐
│ Product Name                           │ SKU              │
│ [Wireless Mouse                      ] │ [PROD-0042     ] │
├────────────┬────────────┬──────────────────────────────────┤
│ Price      │ Stock      │ Category                         │
│ [$25     ] │ [50      ] │ [Electronics                   ] │
├──────────────────────────────────────────────────────────┤
│ Description                                              │
│ [                                                       ]│
│ [                                                       ]│
└──────────────────────────────────────────────────────────┘
```

---

### 3. Address Form (Complex Layout)

```typescript
export class Customer extends BaseEntity {
    // Row 1: Full name
    @PropertyName('Full Name', String)
    @Required()
    @CssColumnClass('col-md-12')
    fullName!: string;
    
    // Row 2: Email (8) + Phone (4)
    @PropertyName('Email', String)
    @Required()
    @CssColumnClass('col-md-8')
    email!: string;
    
    @PropertyName('Phone', String)
    @CssColumnClass('col-md-4')
    phone!: string;
    
    // Row 3: Address full width
    @PropertyName('Street Address', String)
    @Required()
    @CssColumnClass('col-md-12')
    address!: string;
    
    // Row 4: City (6) + State (3) + ZIP (3)
    @PropertyName('City', String)
    @Required()
    @CssColumnClass('col-md-6')
    city!: string;
    
    @PropertyName('State', String)
    @Required()
    @CssColumnClass('col-md-3')
    state!: string;
    
    @PropertyName('ZIP Code', String)
    @Required()
    @CssColumnClass('col-md-3')
    zipCode!: string;
}
```

**Resultado:**
```
┌──────────────────────────────────────────────────────────┐
│ Full Name                                                │
│ [John Doe                                              ] │
├────────────────────────────────────────┬─────────────────┤
│ Email                                  │ Phone           │
│ [john@example.com                    ] │ [(555) 123-4567]│
├──────────────────────────────────────────────────────────┤
│ Street Address                                           │
│ [123 Main St                                           ] │
├──────────────────────────────────┬────────┬─────────────┤
│ City                              │ State  │ ZIP Code    │
│ [New York                       ] │ [NY  ] │ [10001    ] │
└──────────────────────────────────┴────────┴─────────────┘
```

---

### 4. Tailwind CSS Classes

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required()
    @CssColumnClass('w-2/3')  // ← Tailwind: 66.666%
    name!: string;
    
    @PropertyName('SKU', String)
    @Required()
    @CssColumnClass('w-1/3')  // ← Tailwind: 33.333%
    sku!: string;
    
    @PropertyName('Price', Number)
    @CssColumnClass('w-1/4')  // ← 25%
    price!: number;
    
    @PropertyName('Stock', Number)
    @CssColumnClass('w-1/4')  // ← 25%
    stock!: number;
    
    @PropertyName('Category', String)
    @CssColumnClass('w-1/2')  // ← 50%
    category!: string;
    
    @PropertyName('Description', String)
    @CssColumnClass('w-full')  // ← 100%
    description!: string;
}
```

---

### 5. Multiple Classes

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required()
    @CssColumnClass('col-md-6 col-lg-8')  // ← Responsive: 50% en tablet, 66% en desktop
    name!: string;
    
    @PropertyName('SKU', String)
    @CssColumnClass('col-md-6 col-lg-4')  // ← 50% en tablet, 33% en desktop
    sku!: string;
    
    @PropertyName('Description', String)
    @CssColumnClass('col-12')  // ← 100% en todos los tamaños
    description!: string;
}
```

---

### 6. Custom CSS Grid

```typescript
export class Event extends BaseEntity {
    @PropertyName('Event Name', String)
    @Required()
    @CssColumnClass('grid-col-span-2')  // ← Custom CSS Grid
    name!: string;
    
    @PropertyName('Date', Date)
    @Required()
    @CssColumnClass('grid-col-span-1')
    eventDate!: Date;
    
    @PropertyName('Time', String)
    @Required()
    @CssColumnClass('grid-col-span-1')
    eventTime!: string;
}

// CSS:
// .grid-container {
//     display: grid;
//     grid-template-columns: repeat(2, 1fr);
//     gap: 15px;
// }
// 
// .grid-col-span-1 { grid-column: span 1; }
// .grid-col-span-2 { grid-column: span 2; }
```

---

### 7. ViewGroup + CssColumnClass

```typescript
export class Product extends BaseEntity {
    // Basic Info Group
    @PropertyName('Product Name', String)
    @ViewGroup('Basic Info')
    @CssColumnClass('col-md-8')
    name!: string;
    
    @PropertyName('SKU', String)
    @ViewGroup('Basic Info')
    @CssColumnClass('col-md-4')
    sku!: string;
    
    // Pricing Group
    @PropertyName('Price', Number)
    @ViewGroup('Pricing')
    @CssColumnClass('col-md-4')
    price!: number;
    
    @PropertyName('Cost', Number)
    @ViewGroup('Pricing')
    @CssColumnClass('col-md-4')
    cost!: number;
    
    @PropertyName('Tax Rate', Number)
    @ViewGroup('Pricing')
    @CssColumnClass('col-md-4')
    taxRate!: number;
}
```

**Resultado:**
```
┌─ Basic Info ─────────────────────────────────────────────┐
│ ┌────────────────────────────┬────────────────────────┐  │
│ │ Product Name               │ SKU                    │  │
│ │ [Wireless Mouse          ] │ [PROD-0042           ] │  │
│ └────────────────────────────┴────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌─ Pricing ────────────────────────────────────────────────┐
│ ┌───────────┬───────────┬──────────────────────────────┐ │
│ │ Price     │ Cost      │ Tax Rate                     │ │
│ │ [$25    ] │ [$12    ] │ [8.5%                      ] │ │
│ └───────────┴───────────┴──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 8. Conditional Classes in Vue

```vue
<template>
  <div class="detail-view">
    <form class="row">
      <div 
        v-for="prop in properties" 
        :key="prop"
        :class="getColumnClass(prop)"
      >
        <component 
          :is="getInputComponent(prop)"
          v-model="entity[prop]"
          :property="prop"
          :entity="entity"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const isMobile = computed(() => window.innerWidth < 768);

function getColumnClass(propertyName: string): string {
    const baseClass = entityClass.value.getCssColumnClass(propertyName);
    
    // En móvil, todo full width
    if (isMobile.value) {
        return 'col-12';
    }
    
    return baseClass;
}
</script>
```

---

### 9. Dynamic Forms with Auto-Layout

```typescript
export class DynamicForm extends BaseEntity {
    // Campos sin CssColumnClass → auto-layout full width
    @PropertyName('Title', String)
    title!: string;  // ← col-md-12 (default)
    
    // Campos con CssColumnClass → layout específico
    @PropertyName('First Name', String)
    @CssColumnClass('col-md-6')
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @CssColumnClass('col-md-6')
    lastName!: string;
}
```

---

### 10. Complex Dashboard Layout

```typescript
export class Dashboard extends BaseEntity {
    // Top row: 3 equal columns
    @PropertyName('Total Sales', Number)
    @DisplayFormat('currency')
    @CssColumnClass('col-md-4')
    totalSales!: number;
    
    @PropertyName('Orders Count', Number)
    @CssColumnClass('col-md-4')
    ordersCount!: number;
    
    @PropertyName('Revenue', Number)
    @DisplayFormat('currency')
    @CssColumnClass('col-md-4')
    revenue!: number;
    
    // Second row: 2 columns
    @PropertyName('Top Products', Array)
    @CssColumnClass('col-md-8')
    topProducts!: any[];
    
    @PropertyName('Recent Orders', Array)
    @CssColumnClass('col-md-4')
    recentOrders!: any[];
    
    // Bottom row: full width chart
    @PropertyName('Sales Chart', Object)
    @CssColumnClass('col-md-12')
    salesChart!: any;
}
```

**Resultado:**
```
┌────────────┬────────────┬────────────┐
│Total Sales │Orders Count│ Revenue    │
│ $45,000    │    150     │  $52,000   │
├─────────────────────────┼────────────┤
│ Top Products            │Recent      │
│ 1. Laptop               │Orders      │
│ 2. Mouse                │Order #100  │
│ 3. Keyboard             │Order #101  │
├─────────────────────────┴────────────┤
│ Sales Chart                          │
│ [Chart visualization here]           │
└──────────────────────────────────────┘
```

---

## ⚠️ Consideraciones Importantes

### 1. Total de 12 Columnas (Bootstrap)

```typescript
// ✅ BUENO: Suma 12 columnas por fila
@CssColumnClass('col-md-8') name!: string;   // 8
@CssColumnClass('col-md-4') sku!: string;    // 4 → Total: 12 ✓

// ⚠️ EVITAR: Suma mayor a 12 (wrap a nueva fila)
@CssColumnClass('col-md-8') name!: string;   // 8
@CssColumnClass('col-md-6') price!: number;  // 6 → Total: 14 (price wrap to next row)

// ⚠️ EVITAR: Suma menor a 12 (espacio vacío)
@CssColumnClass('col-md-4') name!: string;   // 4
@CssColumnClass('col-md-4') sku!: string;    // 4 → Total: 8 (4 columns empty)
```

### 2. Responsive Design

```typescript
// ✅ BUENO: Classes responsive
@CssColumnClass('col-12 col-md-6 col-lg-4')
// Mobile: 100%, Tablet: 50%, Desktop: 33.333%

// Bootstrap breakpoints:
// col-     < 576px (mobile)
// col-sm-  ≥ 576px (tablet)
// col-md-  ≥ 768px (desktop)
// col-lg-  ≥ 992px (large desktop)
// col-xl-  ≥ 1200px (extra large)
```

### 3. Default Behavior

```typescript
// Sin @CssColumnClass → default 'col-md-12' (full width)
@PropertyName('Description', String)
description!: string;  // ← Automáticamente 'col-md-12'

// Equivalente a:
@PropertyName('Description', String)
@CssColumnClass('col-md-12')
description!: string;
```

### 4. Conflictos con ViewGroupRow

```typescript
// ViewGroupRow controla wrap de filas
// CssColumnClass controla ancho de columnas
// Usar ambos juntos para layouts precisos

@PropertyName('First Name', String)
@ViewGroupRow(1)         // ← Fila 1
@CssColumnClass('col-md-6')  // ← 50% width
firstName!: string;

@PropertyName('Last Name', String)
@ViewGroupRow(1)         // ← Fila 1 (misma fila)
@CssColumnClass('col-md-6')  // ← 50% width
lastName!: string;

@PropertyName('Email', String)
@ViewGroupRow(2)         // ← Fila 2 (nueva fila)
@CssColumnClass('col-md-12')  // ← 100% width
email!: string;
```

### 5. Testing CSS Classes

```typescript
describe('Product CSS Column Classes', () => {
    it('should have correct CSS classes', () => {
        expect(Product.getCssColumnClass('name')).toBe('col-md-8');
        expect(Product.getCssColumnClass('sku')).toBe('col-md-4');
        expect(Product.getCssColumnClass('price')).toBe('col-md-3');
    });
    
    it('should default to col-md-12 if not set', () => {
        expect(Product.getCssColumnClass('undefinedProp')).toBe('col-md-12');
    });
});
```

---

## 📚 Referencias Adicionales

- `property-index-decorator.md` - PropertyIndex controla orden
- `view-group-decorator.md` - ViewGroup organiza campos
- `view-group-row-decorator.md` - ViewGroupRow + CssColumnClass para layouts
- `../../02-base-entity/base-entity-core.md` - getCssColumnClass()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/css_column_class_decorator.ts`  
**Líneas:** ~30
