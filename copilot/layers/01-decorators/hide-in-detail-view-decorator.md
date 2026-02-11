# 🚫 HideInDetailView Decorator

**Referencias:**
- `hide-in-list-view-decorator.md` - HideInListView para ocultar en lista
- `property-index-decorator.md` - PropertyIndex controla orden
- `readonly-decorator.md` - Readonly vs Hide
- `../../02-base-entity/base-entity-core.md` - isHideInDetailView() accessor
- `../../tutorials/01-basic-crud.md` - Hide decorators en tutorial

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/hide_in_detail_view_decorator.ts`

---

## 🎯 Propósito

El decorador `@HideInDetailView()` oculta una propiedad en las **vistas de detalle** (DetailView / formulario), pero la muestra en vistas de lista (ListView / tabla).

**Casos de Uso:**
- Campos calculados de solo lectura (totales, counts)
- Timestamps que no se deben editar
- IDs internos que solo sirven para referencia
- Información derivada que se muestra en tabla pero no se edita

---

## 📝 Sintaxis

```typescript
@HideInDetailView()
propertyName: Type;
```

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/hide_in_detail_view_decorator.ts

/**
 * Symbol para almacenar metadata de hide in detail view
 */
export const HIDE_IN_DETAIL_VIEW_METADATA = Symbol('hideInDetailView');

/**
 * @HideInDetailView() - Oculta una propiedad en DetailView (formulario)
 * 
 * @returns PropertyDecorator
 */
export function HideInDetailView(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[HIDE_IN_DETAIL_VIEW_METADATA]) {
            target[HIDE_IN_DETAIL_VIEW_METADATA] = [];
        }
        
        // Agregar propiedad a lista de ocultas
        target[HIDE_IN_DETAIL_VIEW_METADATA].push(propertyKey);
    };
}
```

**Ubicación:** `src/decorations/hide_in_detail_view_decorator.ts` (línea ~1-25)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Order.prototype[HIDE_IN_DETAIL_VIEW_METADATA] = [
    'createdAt',        // Timestamp (solo info)
    'itemsCount',       // Calculado (solo mostrar)
    'statusLabel',      // Derivado (solo mostrar)
    'formattedTotal'    // Calculado (solo mostrar)
];
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Verifica si una propiedad está oculta en DetailView
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns true si está oculta en DetailView
 */
public isHideInDetailView(propertyKey: string): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    const hideMetadata = constructor.prototype[HIDE_IN_DETAIL_VIEW_METADATA];
    
    if (!hideMetadata) {
        return false;
    }
    
    return hideMetadata.includes(propertyKey);
}

/**
 * Verifica si una propiedad está oculta en DetailView (método estático)
 */
public static isHideInDetailView(propertyKey: string): boolean {
    const hideMetadata = this.prototype[HIDE_IN_DETAIL_VIEW_METADATA];
    
    if (!hideMetadata) {
        return false;
    }
    
    return hideMetadata.includes(propertyKey);
}

/**
 * Obtiene todas las propiedades visibles en DetailView
 */
public static getDetailViewProperties(): string[] {
    const allProperties = this.getProperties();
    
    return allProperties.filter(prop => !this.isHideInDetailView(prop));
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1280-1330)

---

## 🎨 Impacto en UI

### ListView Muestra TODO

```vue
<!-- src/views/default_listview.vue -->

<template>
  <div class="list-view">
    <table>
      <thead>
        <tr>
          <!-- Todas las columnas (incluyendo ocultas en DetailView) -->
          <th v-for="prop in listViewProperties" :key="prop">
            {{ entityClass.getPropertyName(prop) }}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entity in entities" :key="entity.id">
          <td v-for="prop in listViewProperties" :key="prop">
            {{ formatValue(entity, prop) }}
          </td>
          <td>
            <button @click="editEntity(entity)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const listViewProperties = computed(() => {
    // Obtener propiedades visibles en ListView
    return entityClass.value.getListViewProperties();
});
</script>
```

### DetailView con HideInDetailView

```vue
<!-- src/views/default_detailview.vue -->

<template>
  <div class="detail-view">
    <form @submit.prevent="saveEntity">
      <!-- Solo campos editables (excluir ocultos en DetailView) -->
      <div 
        v-for="prop in editableProperties" 
        :key="prop"
        class="form-group"
      >
        <component 
          :is="getInputComponent(prop)"
          v-model="entity[prop]"
          :property="prop"
          :entity="entity"
        />
      </div>
      
      <button type="submit">Save</button>
      <button type="button" @click="cancel">Cancel</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';

const entityClass = computed(() => Application.View.value.entityClass);

// Obtener solo propiedades editables (excluir ocultas en DetailView)
const editableProperties = computed(() => {
    return entityClass.value.getDetailViewProperties();
});
</script>
```

---

## 🧪 Ejemplos de Uso

### 1. Ocultar Timestamps

```typescript
import { HideInDetailView } from '@/decorations/hide_in_detail_view_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { DisplayFormat } from '@/decorations/display_format_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    // Timestamps → mostrar en tabla, no editar en formulario
    @PropertyName('Created At', Date)
    @DisplayFormat('datetime')
    @HideInDetailView()  // ← No editable
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @DisplayFormat('datetime')
    @HideInDetailView()  // ← No editable
    updatedAt!: Date;
}
```

**Resultado:**

**ListView (Tabla):**
```
| Product ID | Product Name | Price   | Created At          | Updated At          |
|------------|--------------|---------|---------------------|---------------------|
| 42         | Laptop       | $999    | 2025-02-10 10:00    | 2025-02-10 15:30    |
```

**DetailView (Formulario):**
```
Product ID: 42
Product Name: [Laptop]
Price: [999]
(createdAt y updatedAt no se muestran)
```

---

### 2. Ocultar Campos Calculados

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    customerName!: string;
    
    @PropertyName('Subtotal', Number)
    subtotal!: number;
    
    @PropertyName('Tax', Number)
    tax!: number;
    
    // Total calculado → mostrar en tabla, no en formulario
    @PropertyName('Total', Number)
    @HideInDetailView()  // ← Calculado automáticamente
    get total(): number {
        return this.subtotal + this.tax;
    }
    
    // Items count → mostrar en tabla, no en formulario
    @PropertyName('Items Count', Number)
    @HideInDetailView()
    itemsCount!: number;
}
```

**ListView:**
```
| Order ID | Customer    | Subtotal | Tax   | Total | Items Count |
|----------|-------------|----------|-------|-------|-------------|
| 100      | John Doe    | $450     | $50   | $500  | 3           |
```

**DetailView:**
```
Order ID: 100
Customer Name: [John Doe]
Subtotal: [450]
Tax: [50]
(Total no se muestra porque se calcula automáticamente)
(Items Count no se muestra porque se deriva de items[])
```

---

### 3. Ocultar IDs Internos

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // ID interno → útil en tabla para referencia, no editable
    @PropertyName('Internal SKU', String)
    @HideInDetailView()  // ← Auto-generado, no editable
    internalSku!: string;
    
    @PropertyName('Legacy ID', Number)
    @HideInDetailView()  // ← Migración, solo referencia
    legacyId?: number;
}
```

---

### 4. Status Labels (Derivados)

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    customerName!: string;
    
    // Status code (editable en formulario)
    @PropertyName('Status Code', String)
    statusCode!: string;
    
    // Status label (mostrar en tabla, derivado del código)
    @PropertyName('Status', String)
    @HideInDetailView()  // ← Derivado de statusCode
    get statusLabel(): string {
        const labels: Record<string, string> = {
            'P': 'Pending',
            'S': 'Shipped',
            'D': 'Delivered',
            'C': 'Cancelled'
        };
        return labels[this.statusCode] || 'Unknown';
    }
}
```

**ListView:**
```
| Order ID | Customer    | Status      |
|----------|-------------|-------------|
| 100      | John Doe    | Pending     |  ← Muestra label
```

**DetailView:**
```
Order ID: 100
Customer Name: [John Doe]
Status Code: [P ▼]  ← Edita código
```

---

### 5. Formatted Values

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // Price como número (editable)
    @PropertyName('Price', Number)
    price!: number;
    
    // Price formateado (mostrar en tabla)
    @PropertyName('Price (USD)', String)
    @HideInDetailView()  // ← Derivado de price
    get formattedPrice(): string {
        return `$${this.price.toFixed(2)}`;
    }
}
```

**ListView:**
```
| Product ID | Product Name | Price (USD) |
|------------|--------------|-------------|
| 42         | Laptop       | $999.00     |  ← Formateado
```

**DetailView:**
```
Product ID: 42
Product Name: [Laptop]
Price: [999]  ← Campo numérico
```

---

### 6. Relational Info (Read-Only)

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    // Customer ID (editable en formulario)
    @PropertyName('Customer ID', Number)
    customerId!: number;
    
    // Customer Name (derivado, solo mostrar en tabla)
    @PropertyName('Customer Name', String)
    @HideInDetailView()  // ← Derivado de customerId
    customerName!: string;  // Cargado desde backend
    
    // Product ID (editable en formulario)
    @PropertyName('Product ID', Number)
    productId!: number;
    
    // Product Name (derivado, solo mostrar en tabla)
    @PropertyName('Product Name', String)
    @HideInDetailView()  // ← Derivado de productId
    productName!: string;  // Cargado desde backend
}
```

**ListView:**
```
| Order ID | Customer Name | Product Name | Total |
|----------|---------------|--------------|-------|
| 100      | John Doe      | Laptop       | $999  |
```

**DetailView:**
```
Order ID: 100
Customer ID: [5 ▼]  ← Dropdown con clientes
Product ID: [42 ▼]  ← Dropdown con productos
```

---

### 7. Aggregates (Sumas, Promedios)

```typescript
export class Department extends BaseEntity {
    @PropertyName('Department ID', Number)
    id!: number;
    
    @PropertyName('Department Name', String)
    name!: string;
    
    @PropertyName('Budget', Number)
    budget!: number;
    
    // Aggregates → mostrar en tabla, no editar
    @PropertyName('Employee Count', Number)
    @HideInDetailView()  // ← Calculado desde employees
    employeeCount!: number;
    
    @PropertyName('Total Salaries', Number)
    @HideInDetailView()  // ← Suma de salarios
    totalSalaries!: number;
    
    @PropertyName('Avg Salary', Number)
    @HideInDetailView()  // ← Promedio
    get avgSalary(): number {
        return this.employeeCount > 0 
            ? this.totalSalaries / this.employeeCount 
            : 0;
    }
}
```

---

### 8. Combo: HideInDetailView + Readonly

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    customerName!: string;
    
    @PropertyName('Amount', Number)
    amount!: number;
    
    // Opción 1: HideInDetailView (no se muestra)
    @PropertyName('Created At', Date)
    @HideInDetailView()
    createdAt!: Date;
    
    // Opción 2: Readonly (se muestra pero no se edita)
    @PropertyName('Invoice Number', String)
    @Readonly()  // ← Se muestra pero deshabilitado
    invoiceNumber!: string;
}
```

**DetailView:**
```
Invoice ID: 1001
Customer Name: [John Doe]
Amount: [500]
Invoice Number: INV-2025-1001  ← Visible pero deshabilitado (Readonly)
(Created At no se muestra - HideInDetailView)
```

---

## 🔄 HideInDetailView vs HideInListView

| Aspecto | @HideInDetailView() | @HideInListView() |
|---------|---------------------|-------------------|
| **ListView (Tabla)** | ✅ Muestra | ❌ Oculta |
| **DetailView (Formulario)** | ❌ Oculta | ✅ Muestra |
| **Uso típico** | Campos calculados, timestamps | Campos largos, metadatos |

---

## 🔄 HideInDetailView vs Readonly

| Aspecto | @HideInDetailView() | @Readonly() |
|---------|---------------------|-------------|
| **ListView** | ✅ Muestra | ✅ Muestra |
| **DetailView** | ❌ Oculta completamente | ✅ Muestra pero deshabilitado |
| **Uso típico** | No relevante para edición | Datos importantes pero no editables |

### Ejemplo Comparativo

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    // Se oculta en DetailView
    @PropertyName('Created At', Date)
    @HideInDetailView()  // ← No se muestra en formulario
    createdAt!: Date;
    
    // Se muestra pero no editable
    @PropertyName('Invoice Number', String)
    @Readonly()  // ← Se muestra deshabilitado
    invoiceNumber!: string;
}
```

**DetailView:**
```
Order ID: 100
Invoice Number: INV-2025-100  [Disabled input]  ← Readonly
(Created At no se muestra)  ← HideInDetailView
```

---

## ⚠️ Consideraciones Importantes

### 1. No Ocultar Campos Editables

```typescript
// ❌ MALO: Ocultar campo editable importante
@PropertyName('Status', String)
@Required()
@HideInDetailView()  // ← Error: debe ser editable
status!: string;

// ✅ BUENO: Solo ocultar campos derivados/calculados
@PropertyName('Status Label', String)
@HideInDetailView()  // ← OK: derivado de status
get statusLabel(): string {
    return this.status === 'A' ? 'Active' : 'Inactive';
}
```

### 2. Primary Key Debe Ser Visible en AMBAS Vistas

```typescript
// ✅ BUENO: Primary key visible
@PropertyName('Product ID', Number)
@Primary()
id!: number;

// ❌ MALO: Ocultar primary key
@PropertyName('Product ID', Number)
@Primary()
@HideInDetailView()  // ← Error: necesario para identificar entidad
id!: number;
```

### 3. Validation en Campos Ocultos

```typescript
// ⚠️ CUIDADO: Validación en campo oculto
@PropertyName('Created At', Date)
@Required()  // ← Esta validación puede causar problemas
@HideInDetailView()
createdAt!: Date;

// ✅ MEJOR: Asignar valor automático
@PropertyName('Created At', Date)
@HideInDetailView()
createdAt: Date = new Date();  // ← Valor por defecto
```

### 4. Save Operations

```typescript
// Al guardar, campos ocultos en DetailView NO se envían por defecto
async function saveEntity(entity: BaseEntity) {
    const detailViewProps = entity.constructor.getDetailViewProperties();
    
    const dataToSave = {};
    detailViewProps.forEach(prop => {
        dataToSave[prop] = entity[prop];
    });
    
    // Campos ocultos en DetailView NO están en dataToSave
    // Esto previene sobrescribir timestamps, calculados, etc.
    
    await entity.save();
}
```

### 5. Export/Print Should Include

```typescript
// Al exportar/imprimir, incluir campos ocultos
function exportEntity(entity: BaseEntity) {
    const allProperties = entity.constructor.getProperties();
    // NO usar getDetailViewProperties() aquí
    
    allProperties.forEach(prop => {
        console.log(`${prop}: ${entity[prop]}`);
    });
}
```

---

## 📚 Referencias Adicionales

- `hide-in-list-view-decorator.md` - Ocultar en ListView
- `readonly-decorator.md` - Campos no editables pero visibles
- `property-index-decorator.md` - Orden de propiedades
- `display-format-decorator.md` - Formateo de valores
- `../../02-base-entity/base-entity-core.md` - isHideInDetailView()
- `../../tutorials/01-basic-crud.md` - Hide decorators en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/hide_in_detail_view_decorator.ts`  
**Líneas:** ~25
