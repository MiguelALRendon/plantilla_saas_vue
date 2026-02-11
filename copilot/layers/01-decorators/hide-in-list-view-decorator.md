# 🙈 HideInListView Decorator

**Referencias:**
- `hide-in-detail-view-decorator.md` - HideInDetailView para ocultar en detalle
- `property-index-decorator.md` - PropertyIndex controla orden, Hide controla visibilidad
- `view-group-decorator.md` - ViewGroup organiza, Hide oculta
- `../../02-base-entity/base-entity-core.md` - isHideInListView() accessor
- `../../tutorials/01-basic-crud.md` - Hide decorators en tutorial

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/hide_in_list_view_decorator.ts`

---

## 🎯 Propósito

El decorador `@HideInListView()` oculta una propiedad en las **vistas de lista** (List View / tabla), pero la muestra en vistas de detalle (Detail View / formulario).

**Casos de Uso:**
- Campos muy largos (descriptions, content, JSON)
- Información sensible que solo debe verse en detalle
- Metadatos técnicos (timestamps, IDs internos)
- Campos que ocupan mucho espacio en tablas

---

## 📝 Sintaxis

```typescript
@HideInListView()
propertyName: Type;
```

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/hide_in_list_view_decorator.ts

/**
 * Symbol para almacenar metadata de hide in list view
 */
export const HIDE_IN_LIST_VIEW_METADATA = Symbol('hideInListView');

/**
 * @HideInListView() - Oculta una propiedad en ListView (tabla)
 * 
 * @returns PropertyDecorator
 */
export function HideInListView(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[HIDE_IN_LIST_VIEW_METADATA]) {
            target[HIDE_IN_LIST_VIEW_METADATA] = [];
        }
        
        // Agregar propiedad a lista de ocultas
        target[HIDE_IN_LIST_VIEW_METADATA].push(propertyKey);
    };
}
```

**Ubicación:** `src/decorations/hide_in_list_view_decorator.ts` (línea ~1-25)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[HIDE_IN_LIST_VIEW_METADATA] = [
    'description',      // Texto largo
    'internalNotes',    // Info interna
    'createdAt',        // Metadata
    'updatedAt'         // Metadata
];
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Verifica si una propiedad está oculta en ListView
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns true si está oculta en ListView
 */
public isHideInListView(propertyKey: string): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    const hideMetadata = constructor.prototype[HIDE_IN_LIST_VIEW_METADATA];
    
    if (!hideMetadata) {
        return false;
    }
    
    return hideMetadata.includes(propertyKey);
}

/**
 * Verifica si una propiedad está oculta en ListView (método estático)
 */
public static isHideInListView(propertyKey: string): boolean {
    const hideMetadata = this.prototype[HIDE_IN_LIST_VIEW_METADATA];
    
    if (!hideMetadata) {
        return false;
    }
    
    return hideMetadata.includes(propertyKey);
}

/**
 * Obtiene todas las propiedades visibles en ListView
 */
public static getListViewProperties(): string[] {
    const allProperties = this.getProperties();
    
    return allProperties.filter(prop => !this.isHideInListView(prop));
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1230-1280)

---

## 🎨 Impacto en UI

### ListView con HideInListView

```vue
<!-- src/views/default_listview.vue -->

<template>
  <div class="list-view">
    <table>
      <thead>
        <tr>
          <!-- Solo columnas visibles -->
          <th v-for="prop in visibleProperties" :key="prop">
            {{ entityClass.getPropertyName(prop) }}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entity in entities" :key="entity.id">
          <!-- Solo valores visibles -->
          <td v-for="prop in visibleProperties" :key="prop">
            {{ formatValue(entity, prop) }}
          </td>
          <td>
            <button @click="editEntity(entity)">Edit</button>
            <button @click="deleteEntity(entity)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Application from '@/models/application';

const entityClass = computed(() => Application.View.value.entityClass);
const entities = ref<BaseEntity[]>([]);

// Obtener solo propiedades visibles en ListView
const visibleProperties = computed(() => {
    return entityClass.value.getListViewProperties();
});

async function loadData() {
    entities.value = await entityClass.value.getElementList();
}

onMounted(() => {
    loadData();
});
</script>
```

### DetailView Muestra TODO

```vue
<!-- src/views/default_detailview.vue -->

<template>
  <div class="detail-view">
    <form @submit.prevent="saveEntity">
      <!-- Todas las propiedades (incluyendo las ocultas en ListView) -->
      <div 
        v-for="prop in allProperties" 
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
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const entityClass = computed(() => Application.View.value.entityClass);

// Obtener TODAS las propiedades (incluyendo ocultas en ListView)
const allProperties = computed(() => {
    return entityClass.value.getProperties();
});
</script>
```

---

## 🧪 Ejemplos de Uso

### 1. Ocultar Campos Largos

```typescript
import { HideInListView } from '@/decorations/hide_in_list_view_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { StringType, StringTypeEnum } from '@/decorations/string_type_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    // Description larga → ocultar en tabla
    @PropertyName('Description', String)
    @StringType(StringTypeEnum.TEXTAREA)
    @HideInListView()  // ← Solo en DetailView
    description!: string;
}
```

**Resultado:**

**ListView (Tabla):**
```
| Product ID | Product Name | Price   | Actions |
|------------|--------------|---------|---------|
| 42         | Laptop       | $999    | Edit    |
| 43         | Mouse        | $25     | Edit    |
```

**DetailView (Formulario):**
```
Product ID: 42
Product Name: [Laptop]
Price: [999]
Description: [This is a high-performance gaming laptop...]  ← Visible aquí
```

---

### 2. Ocultar Metadatos

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // Timestamps → ocultar en tabla
    @PropertyName('Created At', Date)
    @HideInListView()
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @HideInListView()
    updatedAt!: Date;
    
    @PropertyName('Created By', String)
    @HideInListView()
    createdBy!: string;
}
```

---

### 3. Ocultar Información Sensible

```typescript
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Username', String)
    username!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    // Info sensible → solo en DetailView
    @PropertyName('Social Security Number', String)
    @HideInListView()  // ← No mostrar en tabla pública
    ssn!: string;
    
    @PropertyName('Salary', Number)
    @HideInListView()
    salary!: number;
}
```

---

### 4. Ocultar Campos Técnicos

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    customerName!: string;
    
    @PropertyName('Total', Number)
    total!: number;
    
    @PropertyName('Status', String)
    status!: string;
    
    // Campos técnicos → ocultar en tabla
    @PropertyName('Raw API Response', String)
    @StringType(StringTypeEnum.JSON)
    @HideInListView()
    apiResponse!: string;
    
    @PropertyName('Internal Notes', String)
    @HideInListView()
    internalNotes!: string;
}
```

---

### 5. Combo: HideInListView + ViewGroup

```typescript
export class Product extends BaseEntity {
    // Información básica (visible en lista)
    @PropertyName('Product ID', Number)
    @ViewGroup('Basic Info')
    id!: number;
    
    @PropertyName('Product Name', String)
    @ViewGroup('Basic Info')
    name!: string;
    
    @PropertyName('Price', Number)
    @ViewGroup('Basic Info')
    price!: number;
    
    // Información detallada (solo en DetailView)
    @PropertyName('Description', String)
    @StringType(StringTypeEnum.TEXTAREA)
    @ViewGroup('Details')
    @HideInListView()
    description!: string;
    
    @PropertyName('Specifications', String)
    @StringType(StringTypeEnum.JSON)
    @ViewGroup('Details')
    @HideInListView()
    specifications!: string;
    
    // Metadatos (solo en DetailView)
    @PropertyName('Created At', Date)
    @ViewGroup('Metadata')
    @HideInListView()
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @ViewGroup('Metadata')
    @HideInListView()
    updatedAt!: Date;
}
```

---

### 6. Ocultar Relaciones Complejas

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    customerName!: string;
    
    @PropertyName('Total', Number)
    total!: number;
    
    // Order items → ocultar en tabla (mostrar count en su lugar)
    @PropertyName('Order Items', Array)
    @HideInListView()  // ← Demasiado complejo para tabla
    items!: OrderItem[];
    
    // Mostrar solo count en tabla
    @PropertyName('Items Count', Number)
    get itemsCount(): number {
        return this.items?.length || 0;
    }
}
```

**ListView muestra:**
```
| Order ID | Customer    | Total    | Items Count |
|----------|-------------|----------|-------------|
| 100      | John Doe    | $500     | 3           |
```

**DetailView muestra:**
```
Order ID: 100
Customer: John Doe
Total: $500
Items Count: 3
Order Items:  ← Tabla completa de items aquí
```

---

### 7. HTML/Rich Content

```typescript
export class BlogPost extends BaseEntity {
    @PropertyName('Post ID', Number)
    id!: number;
    
    @PropertyName('Title', String)
    title!: string;
    
    @PropertyName('Author', String)
    author!: string;
    
    @PropertyName('Published At', Date)
    publishedAt!: Date;
    
    // HTML content → ocultar en tabla
    @PropertyName('Content', String)
    @StringType(StringTypeEnum.HTML)
    @HideInListView()  // ← Demasiado largo y complejo
    content!: string;
    
    // Excerpt corto en tabla
    @PropertyName('Excerpt', String)
    excerpt!: string;
}
```

---

### 8. Conditional Hiding (Custom Logic)

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Internal Cost', Number)
    @HideInListView()  // ← Siempre ocultar en tabla
    internalCost!: number;
    
    @PropertyName('Profit Margin', Number)
    @HideInListView()
    get profitMargin(): number {
        return ((this.price - this.internalCost) / this.price) * 100;
    }
}

// En ListView component, lógica adicional:
const visibleProperties = computed(() => {
    let props = entityClass.value.getListViewProperties();
    
    // Ocultar cost/margin si usuario no es admin
    if (!Application.currentUser?.isAdmin) {
        props = props.filter(p => p !== 'internalCost' && p !== 'profitMargin');
    }
    
    return props;
});
```

---

## 🔄 HideInListView vs HideInDetailView

| Aspecto | @HideInListView() | @HideInDetailView() |
|---------|-------------------|---------------------|
| **ListView (Tabla)** | ❌ Oculta | ✅ Muestra |
| **DetailView (Formulario)** | ✅ Muestra | ❌ Oculta |
| **Uso típico** | Campos largos, metadatos | Campos calculados, IDs internos |

### Ejemplo Comparativo

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    // Visible en ambas vistas
    @PropertyName('Product Name', String)
    name!: string;
    
    // Solo en DetailView
    @PropertyName('Description', String)
    @HideInListView()  // ← Oculta en tabla
    description!: string;
    
    // Solo en ListView
    @PropertyName('Created At', Date)
    @HideInDetailView()  // ← Oculta en formulario
    createdAt!: Date;
    
    // En ninguna vista (ambos decorators)
    @PropertyName('Internal ID', String)
    @HideInListView()
    @HideInDetailView()
    internalId!: string;
}
```

**ListView:**
```
| Product ID | Product Name | Created At  |
|------------|--------------|-------------|
| 42         | Laptop       | 2025-02-10  |
```

**DetailView:**
```
Product ID: 42
Product Name: [Laptop]
Description: [High-performance gaming laptop...]  ← Visible aquí
```

---

## ⚠️ Consideraciones Importantes

### 1. Primary Key Siempre Visible en ListView

```typescript
// ⚠️ NO ocultar primary key en ListView
@PropertyName('Product ID', Number)
@Primary()
// @HideInListView()  // ← NO hacer esto
id!: number;

// ID es necesario para Edit/Delete actions
```

### 2. Balance Columnas Visibles

```typescript
// ✅ BUENO: 4-6 columnas en ListView
export class Product extends BaseEntity {
    id!: number;             // Visible
    name!: string;           // Visible
    price!: number;          // Visible
    stock!: number;          // Visible
    @HideInListView()
    description!: string;    // Oculta
    @HideInListView()
    specifications!: string; // Oculta
}

// ❌ MALO: Demasiadas columnas (difícil de leer)
export class Product extends BaseEntity {
    id!: number;
    name!: string;
    price!: number;
    stock!: number;
    category!: string;
    brand!: string;
    color!: string;
    weight!: number;
    dimensions!: string;
    // ... 10+ columnas más
}
```

### 3. Responsive Considerations

```typescript
// En componente ListView:
const visibleProperties = computed(() => {
    let props = entityClass.value.getListViewProperties();
    
    // En móvil, ocultar columnas adicionales
    if (window.innerWidth < 768) {
        props = props.filter(p => 
            p === 'id' || p === 'name' || p === 'status'
        );
    }
    
    return props;
});
```

### 4. Export/CSV Should Include All

```typescript
// Al exportar a CSV, incluir TODO (incluso campos ocultos)
function exportToCSV() {
    const allProperties = entityClass.value.getProperties();
    // NO usar getListViewProperties() aquí
    
    const headers = allProperties.map(prop => 
        entityClass.value.getPropertyName(prop)
    );
    
    // ... generar CSV con todas las propiedades
}
```

### 5. Search/Filter en Campos Ocultos

```typescript
// Permitir búsqueda en campos ocultos
function searchEntities(query: string) {
    return entities.value.filter(entity => {
        const allProperties = entityClass.value.getProperties();
        
        // Buscar en TODAS las propiedades (incluso ocultas)
        return allProperties.some(prop => {
            const value = entity[prop]?.toString().toLowerCase();
            return value?.includes(query.toLowerCase());
        });
    });
}
```

---

## 📚 Referencias Adicionales

- `hide-in-detail-view-decorator.md` - Ocultar en DetailView
- `property-index-decorator.md` - Orden de propiedades
- `view-group-decorator.md` - Organización de campos
- `display-format-decorator.md` - Formateo en ListView
- `../../02-base-entity/base-entity-core.md` - isHideInListView()
- `../../tutorials/01-basic-crud.md` - Hide decorators en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/hide_in_list_view_decorator.ts`  
**Líneas:** ~25
