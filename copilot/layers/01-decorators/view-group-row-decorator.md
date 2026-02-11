# 🔢 ViewGroupRow Decorator

**Referencias:**
- `view-group-decorator.md` - ViewGroup organiza campos, ViewGroupRow organiza filas
- `css-column-class-decorator.md` - CssColumnClass + ViewGroupRow para layouts precisos
- `property-index-decorator.md` - PropertyIndex vs ViewGroupRow
- `../../02-base-entity/base-entity-core.md` - getViewGroupRow() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/view_group_row_decorator.ts`

---

## 🎯 Propósito

El decorador `@ViewGroupRow()` controla en qué **fila** se muestra una propiedad dentro de un ViewGroup, permitiendo layouts multi-columna organizados por filas explícitas.

**Beneficios:**
- Control fino de layout en formularios
- Múltiples campos en una misma fila
- Organización visual clara
- Layouts complejos sin CSS manual

---

## 📝 Sintaxis

```typescript
@ViewGroupRow(rowIndex: number)
propertyName: Type;
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `rowIndex` | `number` | Sí | Número de fila (1, 2, 3...) |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/view_group_row_decorator.ts

/**
 * Symbol para almacenar metadata de view group row
 */
export const VIEW_GROUP_ROW_METADATA = Symbol('viewGroupRow');

/**
 * @ViewGroupRow() - Define el número de fila de una propiedad en un ViewGroup
 * 
 * @param rowIndex - Número de fila (1, 2, 3...)
 * @returns PropertyDecorator
 */
export function ViewGroupRow(rowIndex: number): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[VIEW_GROUP_ROW_METADATA]) {
            target[VIEW_GROUP_ROW_METADATA] = {};
        }
        
        // Guardar row index
        target[VIEW_GROUP_ROW_METADATA][propertyKey] = rowIndex;
    };
}
```

**Ubicación:** `src/decorations/view_group_row_decorator.ts` (línea ~1-30)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[VIEW_GROUP_ROW_METADATA] = {
    'name': 1,        // Fila 1
    'sku': 1,         // Fila 1 (misma fila que name)
    'price': 2,       // Fila 2
    'stock': 2,       // Fila 2 (misma fila que price)
    'category': 2,    // Fila 2 (misma fila que price y stock)
    'description': 3  // Fila 3
};
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el número de fila de una propiedad
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns Número de fila o undefined
 */
public getViewGroupRow(propertyKey: string): number | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    const rowMetadata = constructor.prototype[VIEW_GROUP_ROW_METADATA];
    
    if (!rowMetadata) {
        return undefined;
    }
    
    return rowMetadata[propertyKey];
}

/**
 * Obtiene el número de fila (método estático)
 */
public static getViewGroupRow(propertyKey: string): number | undefined {
    const rowMetadata = this.prototype[VIEW_GROUP_ROW_METADATA];
    
    if (!rowMetadata) {
        return undefined;
    }
    
    return rowMetadata[propertyKey];
}

/**
 * Obtiene propiedades agrupadas por fila
 */
public static getPropertiesByRow(viewGroupName?: string): Map<number, string[]> {
    const properties = viewGroupName 
        ? this.getPropertiesByViewGroup().get(viewGroupName) || []
        : this.getProperties();
    
    const rowMetadata = this.prototype[VIEW_GROUP_ROW_METADATA];
    const propertiesByRow = new Map<number, string[]>();
    
    properties.forEach(prop => {
        const row = rowMetadata?.[prop] || 1;  // Default: row 1
        
        if (!propertiesByRow.has(row)) {
            propertiesByRow.set(row, []);
        }
        
        propertiesByRow.get(row)!.push(prop);
    });
    
    return propertiesByRow;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1560-1630)

---

## 🎨 Impacto en UI

### DetailView con ViewGroupRow

```vue
<!-- src/views/default_detailview.vue -->

<template>
  <div class="detail-view">
    <form @submit.prevent="saveEntity">
      <!-- Iterar por grupos -->
      <div 
        v-for="[groupName, groupProps] in propertiesByGroup" 
        :key="groupName"
        class="view-group"
      >
        <h3 class="group-title">{{ groupName }}</h3>
        
        <!-- Iterar por filas dentro del grupo -->
        <div 
          v-for="[rowIndex, rowProps] in getRowsForGroup(groupProps)" 
          :key="rowIndex"
          class="row"
        >
          <!-- Campos en la fila -->
          <div 
            v-for="prop in rowProps" 
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
        </div>
      </div>
      
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';

const entityClass = computed(() => Application.View.value.entityClass);

// Obtener propiedades agrupadas
const propertiesByGroup = computed(() => {
    return entityClass.value.getPropertiesByViewGroup();
});

// Obtener filas para un grupo
function getRowsForGroup(properties: string[]): Map<number, string[]> {
    const rowsMap = new Map<number, string[]>();
    
    properties.forEach(prop => {
        const row = entityClass.value.getViewGroupRow(prop) || 1;
        
        if (!rowsMap.has(row)) {
            rowsMap.set(row, []);
        }
        
        rowsMap.get(row)!.push(prop);
    });
    
    // Ordenar por número de fila
    return new Map([...rowsMap.entries()].sort((a, b) => a[0] - b[0]));
}

function getCssColumnClass(prop: string): string {
    return entityClass.value.getCssColumnClass(prop);
}
</script>
```

---

## 🧪 Ejemplos de Uso

### 1. Two Columns Per Row

```typescript
import { ViewGroupRow } from '@/decorations/view_group_row_decorator';
import { ViewGroup } from '@/decorations/view_group_decorator';
import { CssColumnClass } from '@/decorations/css_column_class_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { Required } from '@/decorations/required_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class User extends BaseEntity {
    // Fila 1: firstName | lastName
    @PropertyName('First Name', String)
    @Required()
    @ViewGroup('Personal Info')
    @ViewGroupRow(1)  // ← Fila 1
    @CssColumnClass('col-md-6')
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @Required()
    @ViewGroup('Personal Info')
    @ViewGroupRow(1)  // ← Fila 1 (misma fila)
    @CssColumnClass('col-md-6')
    lastName!: string;
    
    // Fila 2: email | phone
    @PropertyName('Email', String)
    @Required()
    @ViewGroup('Personal Info')
    @ViewGroupRow(2)  // ← Fila 2
    @CssColumnClass('col-md-6')
    email!: string;
    
    @PropertyName('Phone', String)
    @ViewGroup('Personal Info')
    @ViewGroupRow(2)  // ← Fila 2 (misma fila)
    @CssColumnClass('col-md-6')
    phone!: string;
}
```

**Resultado en UI:**
```
┌─ Personal Info ──────────────────────────────────────┐
│ ┌────────────────────────┬────────────────────────┐  │
│ │ First Name             │ Last Name              │  │  ← Fila 1
│ │ [John                ] │ [Doe                 ] │  │
│ ├────────────────────────┼────────────────────────┤  │
│ │ Email                  │ Phone                  │  │  ← Fila 2
│ │ [john@example.com    ] │ [(555) 123-4567      ] │  │
│ └────────────────────────┴────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

### 2. Three Columns Per Row

```typescript
export class Product extends BaseEntity {
    // Fila 1: name (full width)
    @PropertyName('Product Name', String)
    @Required()
    @ViewGroup('Basic Info')
    @ViewGroupRow(1)
    @CssColumnClass('col-md-12')
    name!: string;
    
    // Fila 2: price | stock | category (3 columnas)
    @PropertyName('Price', Number)
    @Required()
    @ViewGroup('Basic Info')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-4')
    price!: number;
    
    @PropertyName('Stock', Number)
    @Required()
    @ViewGroup('Basic Info')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-4')
    stock!: number;
    
    @PropertyName('Category', String)
    @ViewGroup('Basic Info')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-4')
    category!: string;
}
```

**Resultado:**
```
┌─ Basic Info ─────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────┐ │
│ │ Product Name                                     │ │  ← Fila 1
│ │ [Wireless Mouse                                ] │ │
│ ├───────────────┬───────────────┬──────────────────┤ │
│ │ Price         │ Stock         │ Category         │ │  ← Fila 2
│ │ [$25        ] │ [50         ] │ [Electronics   ] │ │
│ └───────────────┴───────────────┴──────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

### 3. Complex Address Form

```typescript
export class Customer extends BaseEntity {
    // Row 1: Full name (full width)
    @PropertyName('Full Name', String)
    @Required()
    @ViewGroup('Contact Info')
    @ViewGroupRow(1)
    @CssColumnClass('col-md-12')
    fullName!: string;
    
    // Row 2: Email (8 cols) + Phone (4 cols)
    @PropertyName('Email', String)
    @Required()
    @ViewGroup('Contact Info')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-8')
    email!: string;
    
    @PropertyName('Phone', String)
    @ViewGroup('Contact Info')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-4')
    phone!: string;
    
    // Row 3: Address (full width)
    @PropertyName('Street Address', String)
    @Required()
    @ViewGroup('Address')
    @ViewGroupRow(1)  // ← Row 1 of "Address" group
    @CssColumnClass('col-md-12')
    address!: string;
    
    // Row 4: City (6) + State (3) + ZIP (3)
    @PropertyName('City', String)
    @Required()
    @ViewGroup('Address')
    @ViewGroupRow(2)  // ← Row 2 of "Address" group
    @CssColumnClass('col-md-6')
    city!: string;
    
    @PropertyName('State', String)
    @Required()
    @ViewGroup('Address')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-3')
    state!: string;
    
    @PropertyName('ZIP Code', String)
    @Required()
    @ViewGroup('Address')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-3')
    zipCode!: string;
}
```

**Resultado:**
```
┌─ Contact Info ───────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────┐ │
│ │ Full Name                                        │ │  ← Row 1
│ │ [John Doe                                      ] │ │
│ ├────────────────────────────────────┬─────────────┤ │
│ │ Email                              │ Phone       │ │  ← Row 2
│ │ [john@example.com                ] │ [555-1234 ] │ │
│ └────────────────────────────────────┴─────────────┘ │
└──────────────────────────────────────────────────────┘

┌─ Address ────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────┐ │
│ │ Street Address                                   │ │  ← Row 1
│ │ [123 Main St                                   ] │ │
│ ├──────────────────────────────┬────────┬─────────┤ │
│ │ City                          │ State  │ ZIP Code│ │  ← Row 2
│ │ [New York                   ] │ [NY  ] │ [10001] │ │
│ └──────────────────────────────┴────────┴─────────┘ │
└──────────────────────────────────────────────────────┘
```

---

### 4. Asymmetric Rows

```typescript
export class Product extends BaseEntity {
    // Row 1: Name (8 cols) + SKU (4 cols)
    @PropertyName('Product Name', String)
    @ViewGroupRow(1)
    @CssColumnClass('col-md-8')
    name!: string;
    
    @PropertyName('SKU', String)
    @ViewGroupRow(1)
    @CssColumnClass('col-md-4')
    sku!: string;
    
    // Row 2: Price (3) + Cost (3) + Margin (3) + Stock (3)
    @PropertyName('Price', Number)
    @ViewGroupRow(2)
    @CssColumnClass('col-md-3')
    price!: number;
    
    @PropertyName('Cost', Number)
    @ViewGroupRow(2)
    @CssColumnClass('col-md-3')
    cost!: number;
    
    @PropertyName('Margin', Number)
    @ViewGroupRow(2)
    @CssColumnClass('col-md-3')
    margin!: number;
    
    @PropertyName('Stock', Number)
    @ViewGroupRow(2)
    @CssColumnClass('col-md-3')
    stock!: number;
    
    // Row 3: Description (full width)
    @PropertyName('Description', String)
    @ViewGroupRow(3)
    @CssColumnClass('col-md-12')
    description!: string;
}
```

**Resultado:**
```
┌────────────────────────────────────┬────────────────┐
│ Product Name                       │ SKU            │  ← Row 1
│ [Wireless Mouse                  ] │ [PROD-0042   ] │
├───────────┬───────────┬───────────┬────────────────┤
│ Price     │ Cost      │ Margin    │ Stock          │  ← Row 2
│ [$25    ] │ [$12    ] │ [52%    ] │ [50          ] │
├────────────────────────────────────────────────────┤
│ Description                                        │  ← Row 3
│ [High-quality wireless mouse with ergonomic...  ] │
└────────────────────────────────────────────────────┘
```

---

### 5. Without ViewGroupRow (Default Behavior)

```typescript
export class Product extends BaseEntity {
    // Sin ViewGroupRow → todos en fila separada
    @PropertyName('Product Name', String)
    @CssColumnClass('col-md-6')
    name!: string;
    
    @PropertyName('SKU', String)
    @CssColumnClass('col-md-6')
    sku!: string;
    
    @PropertyName('Price', Number)
    @CssColumnClass('col-md-6')
    price!: number;
}
```

**Resultado (sin ViewGroupRow):**
```
┌────────────────────────────────────────────────────┐
│ Product Name                                       │  ← Row 1
│ [Wireless Mouse                                  ] │
├────────────────────────────────────────────────────┤
│ SKU                                                │  ← Row 2
│ [PROD-0042                                       ] │
├────────────────────────────────────────────────────┤
│ Price                                              │  ← Row 3
│ [$25                                             ] │
└────────────────────────────────────────────────────┘
```

**Con ViewGroupRow:**
```
┌────────────────────────────┬───────────────────────┐
│ Product Name               │ SKU                   │  ← Row 1
│ [Wireless Mouse          ] │ [PROD-0042          ] │
├────────────────────────────┴───────────────────────┤
│ Price                                              │  ← Row 2
│ [$25                                             ] │
└────────────────────────────────────────────────────┘
```

---

### 6. Responsive Rows

```vue
<template>
  <div class="detail-view">
    <form>
      <div 
        v-for="[rowIndex, rowProps] in propertiesByRow" 
        :key="rowIndex"
        :class="getRowClass(rowProps)"
      >
        <div 
          v-for="prop in rowProps" 
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
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const isMobile = computed(() => window.innerWidth < 768);

function getRowClass(rowProps: string[]): string {
    // En móvil, stack verticalmente
    if (isMobile.value) {
        return 'row-mobile';
    }
    
    return 'row';
}

function getColumnClass(prop: string): string {
    const baseClass = entityClass.value.getCssColumnClass(prop);
    
    // En móvil, todo full width
    if (isMobile.value) {
        return 'col-12';
    }
    
    return baseClass;
}
</script>
```

---

### 7. Dynamic Row Generation

```vue
<template>
  <div class="detail-view">
    <form>
      <!-- Generar rows dinámicamente -->
      <div 
        v-for="row in maxRows" 
        :key="row"
        class="row"
      >
        <div 
          v-for="prop in getPropertiesInRow(row)" 
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
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const entityClass = computed(() => Application.View.value.entityClass);
const properties = computed(() => entityClass.value.getProperties());

// Obtener máximo número de filas
const maxRows = computed(() => {
    let max = 1;
    properties.value.forEach(prop => {
        const row = entityClass.value.getViewGroupRow(prop) || 1;
        if (row > max) max = row;
    });
    return max;
});

// Obtener propiedades en una fila específica
function getPropertiesInRow(rowIndex: number): string[] {
    return properties.value.filter(prop => {
        const row = entityClass.value.getViewGroupRow(prop) || 1;
        return row === rowIndex;
    });
}
</script>
```

---

### 8. Conditional Rows

```typescript
export class Invoice extends BaseEntity {
    // Row 1: Always visible
    @PropertyName('Invoice Number', String)
    @ViewGroupRow(1)
    @CssColumnClass('col-md-6')
    invoiceNumber!: string;
    
    @PropertyName('Date', Date)
    @ViewGroupRow(1)
    @CssColumnClass('col-md-6')
    invoiceDate!: Date;
    
    // Row 2: Only if paid
    @PropertyName('Payment Method', String)
    @ViewGroupRow(2)
    @CssColumnClass('col-md-6')
    paymentMethod?: string;
    
    @PropertyName('Payment Date', Date)
    @ViewGroupRow(2)
    @CssColumnClass('col-md-6')
    paymentDate?: Date;
}

// En Vue, ocultar row 2 si no está pagado:
<div 
    v-if="entity.paymentMethod"
    class="row"
>
  <!-- Display row 2 fields -->
</div>
```

---

### 9. Nested Groups with Rows

```typescript
export class Employee extends BaseEntity {
    // Group 1: Personal Info
    // Row 1
    @PropertyName('First Name', String)
    @ViewGroup('Personal Info')
    @ViewGroupRow(1)
    @CssColumnClass('col-md-6')
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @ViewGroup('Personal Info')
    @ViewGroupRow(1)
    @CssColumnClass('col-md-6')
    lastName!: string;
    
    // Row 2
    @PropertyName('Email', String)
    @ViewGroup('Personal Info')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-12')
    email!: string;
    
    // Group 2: Employment
    // Row 1
    @PropertyName('Department', String)
    @ViewGroup('Employment')
    @ViewGroupRow(1)
    @CssColumnClass('col-md-6')
    department!: string;
    
    @PropertyName('Position', String)
    @ViewGroup('Employment')
    @ViewGroupRow(1)
    @CssColumnClass('col-md-6')
    position!: string;
    
    // Row 2
    @PropertyName('Salary', Number)
    @ViewGroup('Employment')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-4')
    salary!: number;
    
    @PropertyName('Start Date', Date)
    @ViewGroup('Employment')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-4')
    startDate!: Date;
    
    @PropertyName('Status', String)
    @ViewGroup('Employment')
    @ViewGroupRow(2)
    @CssColumnClass('col-md-4')
    status!: string;
}
```

**Resultado:**
```
┌─ Personal Info ──────────────────────────────────────┐
│ ┌────────────────────────┬────────────────────────┐  │
│ │ First Name             │ Last Name              │  │  ← Row 1
│ │ [John                ] │ [Doe                 ] │  │
│ ├────────────────────────────────────────────────┤  │
│ │ Email                                          │  │  ← Row 2
│ │ [john.doe@example.com                        ] │  │
│ └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

┌─ Employment ─────────────────────────────────────────┐
│ ┌────────────────────────┬────────────────────────┐  │
│ │ Department             │ Position               │  │  ← Row 1
│ │ [Engineering         ] │ [Senior Developer    ] │  │
│ ├───────────────┬────────────────┬─────────────────┤  │
│ │ Salary        │ Start Date     │ Status          │  │  ← Row 2
│ │ [$95,000    ] │ [2020-01-15  ] │ [Active       ] │  │
│ └───────────────┴────────────────┴─────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

### 10. Testing ViewGroupRow

```typescript
describe('Product ViewGroupRow', () => {
    it('should have correct row assignments', () => {
        expect(Product.getViewGroupRow('name')).toBe(1);
        expect(Product.getViewGroupRow('sku')).toBe(1);
        expect(Product.getViewGroupRow('price')).toBe(2);
        expect(Product.getViewGroupRow('stock')).toBe(2);
    });
    
    it('should group properties by row', () => {
        const propertiesByRow = Product.getPropertiesByRow();
        
        expect(propertiesByRow.get(1)).toEqual(['name', 'sku']);
        expect(propertiesByRow.get(2)).toEqual(['price', 'stock', 'category']);
    });
    
    it('should default to row 1 if not specified', () => {
        expect(Product.getViewGroupRow('undefinedProp')).toBeUndefined();
        
        // En getPropertiesByRow, default a row 1
        const propertiesByRow = Product.getPropertiesByRow();
        // Propiedades sin ViewGroupRow van a row 1
    });
});
```

---

## ⚠️ Consideraciones Importantes

### 1. Row Numbers Start at 1

```typescript
// ✅ BUENO: Empezar en 1
@ViewGroupRow(1) firstName!: string;
@ViewGroupRow(2) email!: string;

// ❌ MALO: Empezar en 0
@ViewGroupRow(0) firstName!: string;  // ← Evitar 0
```

### 2. Gaps in Row Numbers

```typescript
// ✅ BUENO: Secuencia continua
@ViewGroupRow(1) name!: string;
@ViewGroupRow(2) email!: string;
@ViewGroupRow(3) phone!: string;

// ⚠️ EVITAR: Gaps innecesarios 
@ViewGroupRow(1) name!: string;
@ViewGroupRow(5) email!: string;  // ← Gap de 2-4 (rows vacías)
```

### 3. Column Sum Per Row

```typescript
// ✅ BUENO: Suma 12 por fila
@ViewGroupRow(1) @CssColumnClass('col-md-6') firstName!: string;  // 6
@ViewGroupRow(1) @CssColumnClass('col-md-6') lastName!: string;   // 6 → Total: 12

// ⚠️ PROBLEMA: Suma > 12 (wrap)
@ViewGroupRow(1) @CssColumnClass('col-md-8') firstName!: string;  // 8
@ViewGroupRow(1) @CssColumnClass('col-md-6') lastName!: string;   // 6 → Total: 14 (wrap)
```

### 4. ViewGroup Scope

```typescript
// ViewGroupRow es relativo al ViewGroup
@ViewGroup('Group A')
@ViewGroupRow(1)  // ← Row 1 de "Group A"
propertyA!: string;

@ViewGroup('Group B')
@ViewGroupRow(1)  // ← Row 1 de "Group B" (diferente)
propertyB!: string;

// Cada grupo tiene su propio sistema de filas
```

### 5. Default Behavior (Sin ViewGroupRow)

```typescript
// Sin ViewGroupRow → cada propiedad en su propia fila
@PropertyName('Name', String)
name!: string;  // ← Row 1 (implícito)

@PropertyName('Email', String)
email!: string;  // ← Row 2 (implícito)

// Con ViewGroupRow → control explícito
@PropertyName('Name', String)
@ViewGroupRow(1)
name!: string;  // ← Row 1 (explícito)

@PropertyName('Email', String)
@ViewGroupRow(1)  // ← Same row 1
email!: string;
```

---

## 📚 Referencias Adicionales

- `view-group-decorator.md` - ViewGroup organiza campos
- `css-column-class-decorator.md` - CssColumnClass controla anchos
- `property-index-decorator.md` - PropertyIndex vs ViewGroupRow
- `../../02-base-entity/base-entity-core.md` - getViewGroupRow(), getPropertiesByRow()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/view_group_row_decorator.ts`  
**Líneas:** ~30
