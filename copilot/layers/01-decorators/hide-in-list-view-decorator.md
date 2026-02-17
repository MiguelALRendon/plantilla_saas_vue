# HideInListView Decorator

## 1. Propósito

El decorador `@HideInListView()` oculta una propiedad en vistas de lista (ListView / tabla) mientras la mantiene visible en vistas de detalle (DetailView / formulario). Este decorador optimiza la presentación tabular de datos mediante la eliminación selectiva de columnas que ocupan mucho espacio, contienen información sensible, o son más apropiadas para visualización en contextos de edición individual.

**Casos de uso principales:**
- Campos de texto largo como descripciones, contenido HTML, o documentación extensa que rompen el layout de tablas
- Información sensible que debe visualizarse solo en contextos de edición controlada
- Metadatos técnicos como timestamps, IDs internos, o datos de revisión relevantes solo en detalle
- Estructuras de datos complejas como JSON, arrays de objetos, o relaciones anidadas difíciles de representar en celdas
- Campos que requieren renderizado especial o formateo avanzado incompatible con formato tabular simple

**Objetivos del decorador:**
- Mantener tablas legibles y escaneables visualmente limitando columnas a información esencial
- Proteger privacidad ocultando datos sensibles en vistas públicas masivas
- Optimizar performance de renderizado reduciendo cantidad de celdas DOM en listas grandes
- Preservar acceso completo a información en contextos de edición donde es necesaria
- Permitir balance flexible entre información resumida en listas versus detalle completo en formularios

## 2. Alcance

### Responsabilidades

- Almacenar metadata de visibilidad en ListView mediante Symbol dedicado en prototype
- Proporcionar API de consulta para verificar visibilidad de propiedades específicas en tablas
- Permitir filtrado de propiedades para generación dinámica de columnas de tabla
- Integrarse con componentes ListView para renderizado condicional de columnas
- Mantener visibilidad completa en DetailView independientemente de configuración ListView
- Coordinar con sistema de metadata de BaseEntity para acceso unificado a configuración

### Límites

- No afecta la persistencia de datos ni el almacenamiento en backend
- No modifica la visibilidad en DetailView (usar @HideInDetailView para ese propósito)
- No implementa control de permisos ni seguridad a nivel de campo
- No proporciona formateo de valores en celdas (usar @DisplayFormat para ese propósito)
- No gestiona ordenamiento o agrupación de columnas (usar @PropertyIndex para orden)
- No aplica lógica de validación ni transformaciones de datos

## 3. Definiciones Clave

**HIDE_IN_LIST_VIEW_KEY (Symbol):**
- Identificador único para almacenar lista de propiedades ocultas en ListView
- Ubicación: `prototype` de la clase entity
- Tipo: `Symbol`
- Valor almacenado: Array de strings con nombres de propiedades

**isHideInListView() (Método de instancia):**
- Accessor de BaseEntity que verifica si una propiedad debe ocultarse en ListView
- Parámetros: `propertyKey: string`
- Retorno: `boolean` (true si oculta en ListView)
- Ubicación: `src/entities/base_entity.ts` línea ~1230

**getListViewProperties() (Método estático):**
- Obtiene lista filtrada de propiedades visibles en ListView
- Retorno: `string[]` con nombres de propiedades no ocultas
- Filtra usando isHideInListView() sobre resultado de getProperties()
- Ubicación: `src/entities/base_entity.ts` línea ~1260

**ListView vs DetailView:**
- ListView: Vista de tabla para mostrar múltiples entidades simultáneamente, optimizada para escaneo rápido
- DetailView: Vista de formulario para crear/editar una entidad individual, optimizada para completitud de información

**Diferenciación con @HideInDetailView:**
- @HideInListView: Oculta en tablas, muestra en formularios
- @HideInDetailView: Oculta en formularios, muestra en tablas
- Complementarios: Pueden aplicarse simultáneamente para ocultar en ambas vistas si es necesario

**Campos largos:**
- Propiedades que contienen más de 100-200 caracteres típicamente
- Incluye tipos TEXTAREA, HTML, JSON, arrays de objetos
- Rompen layout de tablas si se renderizan sin limitación


## 4. Descripción Técnica

### 4.1. Implementación del Decorador

**Ubicación:** `src/decorations/hide_in_list_view_decorator.ts` (línea ~1-25)

```typescript
/**
 * Symbol para almacenar metadata de hide in list view
 */
export const HIDE_IN_LIST_VIEW_KEY = Symbol('hideInListView');

/**
 * @HideInListView() - Oculta una propiedad en ListView (tabla)
 * 
 * @returns PropertyDecorator
 */
export function HideInListView(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[HIDE_IN_LIST_VIEW_KEY]) {
            target[HIDE_IN_LIST_VIEW_KEY] = [];
        }
        
        // Agregar propiedad a lista de ocultas
        target[HIDE_IN_LIST_VIEW_KEY].push(propertyKey);
    };
}
```

**Elementos técnicos:**

1. **Symbol HIDE_IN_LIST_VIEW_KEY:**
   - Identificador único para evitar colisiones en prototype
   - Almacena array de nombres de propiedades ocultas en ListView
   - Accesible desde BaseEntity y componentes UI

2. **PropertyDecorator:**
   - Función que retorna PropertyDecorator estándar de TypeScript
   - Recibe `target` (prototype de la clase) y `propertyKey` (nombre de propiedad)
   - Modifica prototype sin afectar instancias existentes

3. **Inicialización del array:**
   - Verifica existencia de metadata antes de agregar
   - Crea array vacío si es primera propiedad con @HideInListView
   - Permite múltiples propiedades ocultas en misma clase

4. **Adición a lista:**
   - Usa `push()` para agregar propertyKey al array
   - Mantiene orden de declaración de propiedades
   - Soporta herencia (cada clase tiene su propia lista)

### 4.2. Metadata Storage

**Estructura en prototype:**

```typescript
// Ejemplo: Product con campos ocultos en tabla
Product.prototype[HIDE_IN_LIST_VIEW_KEY] = [
    'description',      // Texto largo
    'internalNotes',    // Info interna
    'createdAt',        // Metadata
    'updatedAt'         // Metadata
];
```

**Características del almacenamiento:**
- Metadata se almacena en `prototype` de la clase, no en instancias individuales
- Array contiene strings con nombres de propiedades exactos
- Accesible mediante Symbol para evitar conflictos con propiedades normales
- Persiste durante toda la vida de la aplicación (no se serializa con entidad)

### 4.3. Accessors en BaseEntity

**Ubicación:** `src/entities/base_entity.ts` (línea ~1230-1280)

```typescript
/**
 * Verifica si una propiedad está oculta en ListView
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns true si está oculta en ListView
 */
public isHideInListView(propertyKey: string): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    const hideMetadata = constructor.prototype[HIDE_IN_LIST_VIEW_KEY];
    
    if (!hideMetadata) {
        return false;
    }
    
    return hideMetadata.includes(propertyKey);
}

/**
 * Verifica si una propiedad está oculta en ListView (método estático)
 */
public static isHideInListView(propertyKey: string): boolean {
    const hideMetadata = this.prototype[HIDE_IN_LIST_VIEW_KEY];
    
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

**Métodos disponibles:**

1. **isHideInListView() (instancia):**
   - Verifica si propiedad específica está oculta en ListView
   - Accede a metadata mediante constructor de instancia
   - Retorna `false` si no hay metadata (ninguna propiedad oculta)
   - Usa `includes()` para búsqueda eficiente en array

2. **isHideInListView() (estático):**
   - Versión estática para uso sin instancia
   - Útil en componentes que solo tienen referencia a clase
   - Accede directamente a `prototype` de la clase
   - Misma lógica de verificación que versión de instancia

3. **getListViewProperties():**
   - Obtiene lista completa de propiedades visibles en ListView
   - Usa `getProperties()` como base (todas las propiedades)
   - Filtra usando `isHideInListView()` para excluir ocultas
   - Retorna array limpio listo para renderizado en tablas

### 4.4. Integración con UI

**ListView (Tabla) - Exclusión de columnas ocultas:**

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

**DetailView (Formulario) - Inclusión de todos los campos:**

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
    // getProperties() NO filtra por @HideInListView
    return entityClass.value.getProperties();
});
</script>
```

**Diferenciación de métodos:**
- `getListViewProperties()`: Filtra propiedades con @HideInListView
- `getDetailViewProperties()`: Filtra propiedades con @HideInDetailView (independiente)
- Los dos decoradores son complementarios y no interfieren entre sí

## 5. Flujo de Funcionamiento

### Fase 1: Decoración de Propiedad (Design Time)

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Description', String)
    @StringType(StringTypeEnum.TEXTAREA)
    @HideInListView()  // ← 1. Decorador aplicado en tiempo de compilación
    description!: string;
}
```

**Acciones:**
1. TypeScript procesa decorador durante compilación
2. Función `HideInListView()` se ejecuta inmediatamente
3. PropertyDecorator agrega 'description' a `Product.prototype[HIDE_IN_LIST_VIEW_KEY]`
4. Metadata queda disponible para runtime

### Fase 2: Carga de Entity Class (Runtime - Inicialización)

```typescript
// Application carga clase Product
Application.View.value.entityClass = Product;

// Metadata ya está disponible en prototype
console.log(Product.isHideInListView('description')); // true
console.log(Product.isHideInListView('id')); // false
```

**Acciones:**
1. Aplicación carga clase entity en Application singleton
2. Metadata de decoradores ya está almacenada en prototype
3. Métodos estáticos pueden consultar metadata inmediatamente
4. No requiere instanciación de entidad para consultar visibilidad

### Fase 3: Renderizado de ListView (Tabla)

```vue
<script setup>
// Obtener propiedades visibles en ListView
const visibleProperties = computed(() => {
    return entityClass.value.getListViewProperties();
    // Retorna: ['id', 'name', 'price', 'stock', ...]
    // NO incluye: ['description', 'internalNotes', 'createdAt', ...]
});
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="prop in visibleProperties" :key="prop">
          <!-- Renderiza solo columnas NO ocultas en ListView -->
          {{ entityClass.getPropertyName(prop) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entity in entities" :key="entity.id">
        <td v-for="prop in visibleProperties" :key="prop">
          {{ formatValue(entity, prop) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

**Acciones:**
1. ListView obtiene `entityClass` desde Application
2. Llama a `getListViewProperties()` para obtener lista filtrada
3. Método retorna solo propiedades no marcadas con @HideInListView
4. Vue renderiza columnas solo para propiedades visibles
5. Campos ocultos (`description`, etc.) no aparecen en tabla

### Fase 4: Renderizado de DetailView (Formulario)

```vue
<script setup>
// Obtener TODAS las propiedades
const allProperties = computed(() => {
    return entityClass.value.getProperties();
    // Retorna todas las propiedades incluyendo @HideInListView
    // Solo filtra propiedades con @HideInDetailView
});
</script>

<template>
  <form>
    <div v-for="prop in allProperties" :key="prop">
      <!-- Muestra TODAS las propiedades incluyendo description -->
      <FormInput :property="prop" v-model="entity[prop]" />
    </div>
  </form>
</template>
```

**Acciones:**
1. DetailView obtiene `entityClass` desde Application
2. Llama a `getProperties()` que NO filtra por @HideInListView
3. Método puede filtrar por @HideInDetailView si existe
4. Vue renderiza inputs para todas las propiedades visibles
5. Campos con @HideInListView SÍ aparecen en formulario (description, etc.)

## 6. Reglas Obligatorias

### 6.1. Campos de Texto Largo Deben Usar @HideInListView

**Regla:** Propiedades TEXTAREA, HTML, JSON u otro contenido extenso deben ocultarse en ListView porque rompen layout tabular.

```typescript
// CORRECTO
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;  // Visible (corto)
    
    @PropertyName('Description', String)
    @StringType(StringTypeEnum.TEXTAREA)
    @HideInListView()  // ← Campo largo ocultado
    description!: string;
}

// INCORRECTO
export class BlogPost extends BaseEntity {
    @PropertyName('Content', String)
    @StringType(StringTypeEnum.HTML)
    // ❌ Falta @HideInListView - contenido largo romperá tabla
    content!: string;
}
```

### 6.2. Metadatos de Revisión Pueden Usar @HideInListView

**Regla:** Timestamps y campos de revisión pueden ocultarse en ListView si no son críticos para identificación visual rápida.

```typescript
// CORRECTO - Metadatos ocultos
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;  // Visible
    
    @PropertyName('Product Name', String)
    name!: string;  // Visible
    
    @PropertyName('Created At', Date)
    @HideInListView()  // ← Metadata no crítica para lista
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @HideInListView()
    updatedAt!: Date;
}

// PERMITIDO - Metadatos visibles si son importantes
export class Order extends BaseEntity {
    @PropertyName('Order Date', Date)
    orderDate!: Date;  // ✅ Información crítica, mantener visible
}
```

### 6.3. Primary Key NO Debe Usar @HideInListView

**Regla:** La primary key debe ser visible en ListView para identificación y acciones Edit/Delete.

```typescript
// CORRECTO
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @Primary()
    id!: number;  // ← Visible en ListView y DetailView
}

// INCORRECTO
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @Primary()
    @HideInListView()  // ❌ Primary key debe ser visible para identificación
    id!: number;
}
```

### 6.4. Información Sensible Debe Usar @HideInListView

**Regla:** Datos sensibles (salarios, SSN, contraseñas, etc.) deben ocultarse en ListView masivo, mostrarse solo en DetailView controlado.

```typescript
// CORRECTO
export class Employee extends BaseEntity {
    @PropertyName('Employee ID', Number)
    id!: number;  // Visible
    
    @PropertyName('Name', String)
    name!: string;  // Visible
    
    @PropertyName('Department', String)
    department!: string;  // Visible
    
    @PropertyName('Salary', Number)
    @HideInListView()  // ← Información sensible oculta en lista pública
    salary!: number;
    
    @PropertyName('SSN', String)
    @HideInListView()
    ssn!: string;
}
```

### 6.5. Estructuras de Datos Complejas Deben Usar @HideInListView

**Regla:** Arrays, JSON, objetos anidados deben ocultarse en ListView porque no tienen representación tabular efectiva.

```typescript
// CORRECTO
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    customerName!: string;
    
    @PropertyName('Order Items', Array)
    @HideInListView()  // ← Array complejo oculto
    items!: OrderItem[];
    
    // Mostrar solo resumen en tabla
    @PropertyName('Items Count', Number)
    get itemsCount(): number {
        return this.items?.length || 0;
    }
}

// INCORRECTO
export class Product extends BaseEntity {
    @PropertyName('Specifications', Object)
    // ❌ Falta @HideInListView - objeto no se puede mostrar en celda efectivamente
    specifications!: Record<string, any>;
}
```

### 6.6. Balance 4-8 Columnas Visibles en ListView

**Regla:** Mantener número de columnas visibles entre 4-8 para legibilidad óptima. Ocultar columnas adicionales.

```typescript
// CORRECTO - 5 columnas visibles
export class Product extends BaseEntity {
    id!: number;               // 1. Visible
    name!: string;             // 2. Visible
    category!: string;         // 3. Visible
    price!: number;            // 4. Visible
    stock!: number;            // 5. Visible
    
    @HideInListView()
    description!: string;      // Oculta (6)
    @HideInListView()
    specifications!: string;   // Oculta (7)
    @HideInListView()
    internalNotes!: string;    // Oculta (8)
}

// INCORRECTO - 12 columnas visibles (tabla ilegible)
export class Product extends BaseEntity {
    id!: number;               // Sin control de columnas
    name!: string;
    category!: string;
    subcategory!: string;
    brand!: string;
    model!: string;
    color!: string;
    size!: string;
    weight!: number;
    price!: number;
    stock!: number;
    sku!: string;
    // Demasiadas columnas sin @HideInListView
}
```

## 7. Prohibiciones

### 7.1. NO Ocultar Identificadores Únicos Necesarios para Actions

**Prohibición:** No ocultar campos que se usan en botones de acción (Edit, Delete, View).

```typescript
// PROHIBIDO
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @HideInListView()  // ❌ ID necesario para Edit/Delete actions
    id!: number;
}

// PERMITIDO
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;  // ✅ Visible para identificación
}
```

### 7.2. NO Ocultar Información Crítica para Decision-Making

**Prohibición:** No ocultar campos que usuarios necesitan ver para tomar decisiones en contexto de lista.

```typescript
// PROHIBIDO
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Order Status', String)
    @HideInListView()  // ❌ Status crítico para triage de órdenes
    status!: string;
}

// PERMITIDO
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Order Status', String)
    status!: string;  // ✅ Visible para decisiones rápidas
    
    @PropertyName('Internal Processing Notes', String)
    @HideInListView()  // ✅ Notas internas pueden ocultarse
    processingNotes!: string;
}
```

### 7.3. NO Usar @HideInListView para Performance Optimization

**Prohibición:** No usar este decorador como mecanismo de optimización. Datos siguen cargados en memoria.

```typescript
// PROHIBIDO - Falsa optimización
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    @HideInListView()  // ❌ NO optimiza carga de datos, solo oculta columna
    description!: string;
    // Backend sigue enviando description en JSON response
}

// CORRECTO - Optimizar en backend
// Backend debe implementar:
// GET /api/products?fields=id,name,price  (excluir description)
// GET /api/products/42  (incluir todos los campos)
```

### 7.4. NO Combinar con Todos los Campos (Tabla Vacía)

**Prohibición:** No ocultar todas las propiedades de una entidad excepto ID, tabla quedaría sin información útil.

```typescript
// PROHIBIDO - Tabla vacía
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;  // Única columna visible
    
    @PropertyName('Product Name', String)
    @HideInListView()  // ❌ Todo oculto
    name!: string;
    
    @PropertyName('Price', Number)
    @HideInListView()
    price!: number;
    
    @PropertyName('Stock', Number)
    @HideInListView()
    stock!: number;
}
// ListView renderizará: | ID | Actions | (inútil)
```

### 7.5. NO Ocultar Campos Sin Considerar Búsqueda

**Prohibición:** No ocultar campos searchables sin proporcionar alternativa de búsqueda.

```typescript
// PROHIBIDO - Campo searchable oculto sin alternativa
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('SKU', String)
    @HideInListView()  // ❌ SKU oculto pero usuarios buscan por SKU
    sku!: string;
}

// PERMITIDO - Proporcionar búsqueda
<template>
  <input 
    type="text" 
    v-model="searchQuery" 
    placeholder="Search by ID, Name, or SKU"
  />
  <!-- Búsqueda funciona en campos ocultos también -->
</template>
```

### 7.6. NO Usar para Ocultar Errores de Diseño

**Prohibición:** No usar @HideInListView para tapar problemas de diseño de entidad. Refactorizar si es necesario.

```typescript
// PROHIBIDO - Esconder mal diseño
export class Order extends BaseEntity {
    // ... propiedades normales ...
    
    @PropertyName('Temporary Data Dump', String)
    @HideInListView()  // ❌ Campo mal diseñado, no debería existir
    tempDataDump!: string;
}

// CORRECTO - Refactorizar entidad
export class Order extends BaseEntity {
    // Diseñar propiedades específicas en lugar de dumps genéricos
    @PropertyName('Processing Status', String)
    processingStatus!: string;
    
    @PropertyName('Last Sync Timestamp', Date)
    lastSyncAt!: Date;
}
```

## 8. Dependencias

### 8.1. BaseEntity (Core)

**Relación:** BaseEntity proporciona métodos de acceso a metadata de @HideInListView.

**Dependencias:**
```typescript
// src/entities/base_entity.ts
import { HIDE_IN_LIST_VIEW_KEY } from '@/decorations/hide_in_list_view_decorator';

public isHideInListView(propertyKey: string): boolean
public static isHideInListView(propertyKey: string): boolean
public static getListViewProperties(): string[]
```

**Uso:** Decorador almacena metadata, BaseEntity la lee y procesa.

### 8.2. ListView Component

**Relación:** ListView usa `getListViewProperties()` para determinar qué columnas renderizar en tablas.

**Dependencias:**
```vue
<!-- src/views/default_listview.vue -->
<script setup>
import { computed } from 'vue';
import Application from '@/models/application';

const visibleProperties = computed(() => {
    return Application.View.value.entityClass.getListViewProperties();
});
</script>
```

**Uso:** ListView excluye columnas con @HideInListView de la tabla.

### 8.3. DetailView Component

**Relación:** DetailView NO es afectado por @HideInListView, usa `getProperties()` o `getDetailViewProperties()`.

**Independencia:**
```vue
<!-- src/views/default_detailview.vue -->
<script setup>
const allProperties = computed(() => {
    // getProperties() NO filtra por @HideInListView
    return entityClass.value.getProperties();
});
</script>
```

### 8.4. @PropertyName Decorator

**Relación:** @PropertyName se usa junto con @HideInListView para definir headers de columnas visibles.

**Uso conjunto:**
```typescript
@PropertyName('Product Name', String)
name!: string;  // Visible - header "Product Name"

@PropertyName('Description', String)
@HideInListView()
description!: string;  // Oculto - no renderiza columna
```

### 8.5. @DisplayFormat Decorator

**Relación:** @DisplayFormat solo afecta columnas visibles. Si campo está oculto con @HideInListView, formato no se aplica en tabla.

**Interacción:**
```typescript
@PropertyName('Created At', Date)
@DisplayFormat('datetime')  // Formato solo aplica si columna es visible
@HideInListView()
createdAt!: Date;
// displayFormat no se ejecuta en ListView porque columna está oculta
```

### 8.6. Export/Print Operations

**Relación:** Al exportar o imprimir, usar `getProperties()` en lugar de `getListViewProperties()` para incluir campos ocultos.

**Diferenciación:**
```typescript
function exportToCSV(entities: BaseEntity[]) {
    // Usar getProperties() NO getListViewProperties()
    const allProperties = entities[0].constructor.getProperties();
    
    const csv = entities.map(entity => {
        // Incluir campos ocultos en ListView en export
        return allProperties.map(prop => entity[prop]).join(',');
    }).join('\n');
    
    return csv;
}
```

### 8.7. Search/Filter Operations

**Relación:** Búsquedas deben ejecutarse sobre todas las propiedades, incluyendo las ocultas en ListView.

**Integración:**
```typescript
function searchEntities(query: string, entities: BaseEntity[]): BaseEntity[] {
    return entities.filter(entity => {
        const allProperties = entity.constructor.getProperties();
        
        // Buscar en TODAS las propiedades (incluso ocultas)
        return allProperties.some(prop => {
            const value = entity[prop]?.toString().toLowerCase();
            return value?.includes(query.toLowerCase());
        });
    });
}
```

## 9. Relaciones

### 9.1. Con @HideInDetailView (Complementario)

**Relación:** Decoradores complementarios para control granular de visibilidad en diferentes vistas.

**Uso conjunto:**
```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;  // Visible en ambas vistas
    
    @PropertyName('Description', String)
    @HideInListView()  // ← Oculto en tabla (texto largo)
    description!: string;  // ← Visible en formulario
    
    @PropertyName('Created At', Date)
    @HideInDetailView()  // ← Oculto en formulario (timestamp)
    createdAt!: Date;  // ← Visible en tabla
    
    @PropertyName('Internal ID', String)
    @HideInListView()
    @HideInDetailView()  // ← Oculto en ambas vistas
    internalId!: string;
}
```

**Matriz de visibilidad:**
```
Campo       | ListView | DetailView
------------|----------|------------
name        | ✅ Show  | ✅ Show    (ningún decorator)
description | ❌ Hide  | ✅ Show    (@HideInListView)
createdAt   | ✅ Show  | ❌ Hide    (@HideInDetailView)
internalId  | ❌ Hide  | ❌ Hide    (ambos decorators)
```

### 9.2. Con @StringType (Indicador común)

**Relación:** @StringType con valores TEXTAREA, HTML, JSON típicamente requiere @HideInListView.

**Patrón común:**
```typescript
export class BlogPost extends BaseEntity {
    @PropertyName('Post Title', String)
    title!: string;  // Visible
    
    @PropertyName('Content', String)
    @StringType(StringTypeEnum.HTML)
    @HideInListView()  // ← HTML extenso oculto en tabla
    content!: string;
    
    @PropertyName('Metadata', String)
    @StringType(StringTypeEnum.JSON)
    @HideInListView()  // ← JSON oculto en tabla
    metadata!: string;
}
```

### 9.3. Con @ViewGroup (Organizacional)

**Relación:** @ViewGroup organiza campos en DetailView independientemente de visibilidad en ListView.

**Uso conjunto:**
```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @ViewGroup('Basic')
    id!: number;
    
    @PropertyName('Product Name', String)
    @ViewGroup('Basic')
    name!: string;
    
    @PropertyName('Description', String)
    @ViewGroup('Details')  // Grupo en DetailView
    @HideInListView()  // Oculto en ListView
    description!: string;
    
    @PropertyName('Specifications', String)
    @ViewGroup('Details')
    @HideInListView()
    specifications!: string;
}
```

### 9.4. Con @PropertyIndex (Ordenamiento)

**Relación:** @PropertyIndex controla orden de columnas en ListView solo para propiedades visibles.

**Interacción:**
```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @PropertyIndex(1)
    id!: number;
    
    @PropertyName('Customer Name', String)
    @PropertyIndex(2)
    customerName!: string;
    
    @PropertyName('Internal Notes', String)
    @PropertyIndex(3)
    @HideInListView()  // ← PropertyIndex ignorado porque columna oculta
    internalNotes!: string;
    
    @PropertyName('Total', Number)
    @PropertyIndex(4)
    total!: number;
}

// ListView muestra columnas en orden: 1, 2, 4 (excluye 3)
```

### 9.5. Con @Readonly (Compatibilidad)

**Relación:** @Readonly afecta DetailView (deshabilita input), @HideInListView afecta ListView (oculta columna).

**Uso conjunto:**
```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice Number', String)
    @Readonly()  // ← Deshabilitado en DetailView
    @HideInListView()  // ← Oculto en ListView (auto-generado)
    invoiceNumber!: string;
    
    @PropertyName('Created At', Date)
    @Readonly()  // ← Deshabilitado en DetailView
    @HideInListView()  // ← Oculto en ListView (metadata)
    createdAt!: Date;
}
```

### 9.6. Con Module Custom Components

**Relación:** Componentes ListView personalizados deben respetar `getListViewProperties()`.

**Responsabilidad del componente:**
```vue
<!-- CustomListView.vue -->
<script setup>
import { computed } from 'vue';

const visibleProperties = computed(() => {
    // Respetar decorador @HideInListView
    return props.entityClass.getListViewProperties();
});
</script>

<template>
  <table>
    <!-- Renderizar solo columnas visibles -->
    <th v-for="prop in visibleProperties" :key="prop">
      {{ props.entityClass.getPropertyName(prop) }}
    </th>
  </table>
</template>
```

## 10. Notas de Implementación

### Nota 1: Campos Ocultos Siguen en Datos de Entity

Campos con @HideInListView siguen presentes en instancia de entity y accesibles programáticamente:

```typescript
const product = new Product();
product.description = "Long description...";  // ✅ Propiedad existe
console.log(product.description);  // ✅ Accesible

// Solo afecta renderizado en ListView:
const props = Product.getListViewProperties();
console.log(props.includes('description'));  // false (no se renderiza en tabla)

// Pero sigue en entity:
console.log(product.hasOwnProperty('description'));  // true
```

### Nota 2: Responsive Columns con Lógica Adicional

Implementar ocultamiento adaptativo adicional en componente para dispositivos móviles:

```typescript
// En componente ListView
const visibleProperties = computed(() => {
    let props = entityClass.value.getListViewProperties();
    
    // En móvil, ocultar columnas adicionales dinámicamente
    if (window.innerWidth < 768) {
        // Mostrar solo ID, nombre, y status en móvil
        props = props.filter(p => 
            p === 'id' || 
            p === 'name' || 
            p === 'status'
        );
    } else if (window.innerWidth < 1024) {
        // En tablet, limitar a 5 columnas
        props = props.slice(0, 5);
    }
    
    return props;
});
```

### Nota 3: Export Must Include Hidden Fields

Operaciones de exportación deben usar `getProperties()` para incluir campos ocultos:

```typescript
function exportToExcel(entities: BaseEntity[]) {
    const entityClass = entities[0].constructor as typeof BaseEntity;
    const allProperties = entityClass.getProperties();
    // NO usar getListViewProperties() aquí
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    
    // Headers completos (incluyendo campos ocultos en ListView)
    worksheet.addRow(
        allProperties.map(prop => entityClass.getPropertyName(prop))
    );
    
    // Datos completos
    entities.forEach(entity => {
        worksheet.addRow(
            allProperties.map(prop => entity[prop])
        );
    });
    
    return workbook;
}
```

### Nota 4: Search/Filter Debe Buscar en Campos Ocultos

Búsquedas deben ejecutarse sobre todas las propiedades para no frustrar usuarios:

```typescript
function filterEntities(searchQuery: string, entities: BaseEntity[]): BaseEntity[] {
    const entityClass = entities[0].constructor as typeof BaseEntity;
    const allProperties = entityClass.getProperties();
    
    return entities.filter(entity => {
        // Buscar en TODAS las propiedades (incluso ocultas en ListView)
        return allProperties.some(prop => {
            const value = entity[prop];
            if (value == null) return false;
            
            const stringValue = value.toString().toLowerCase();
            return stringValue.includes(searchQuery.toLowerCase());
        });
    });
}
```

### Nota 5: Herencia Preserva Metadata de Clase Padre

Clases hijas heredan propiedades ocultas de clase padre:

```typescript
export class BaseProduct extends BaseEntity {
    @PropertyName('Description', String)
    @HideInListView()
    description!: string;
}

export class PhysicalProduct extends BaseProduct {
    @PropertyName('Weight', Number)
    weight!: number;
    
    // description heredado sigue oculto en ListView
}

const props = PhysicalProduct.getListViewProperties();
console.log(props.includes('description'));  // false (heredado)
console.log(props.includes('weight'));  // true
```

### Nota 6: Performance Considerations

Ocultar columnas mejora renderizado DOM pero NO optimiza transferencia de datos:

```typescript
// ❌ INCORRECTO - Asumir que @HideInListView optimiza carga
// Backend sigue enviando TODOS los campos en JSON response

// ✅ CORRECTO - Implementar campo selection en backend
// GET /api/products?fields=id,name,price,stock
// Backend: Excluir description, internalNotes de query SQL y response JSON

// GET /api/products/42
// Backend: Incluir TODOS los campos para DetailView
```

### Nota 7: Testing de Visibilidad

Test de visibilidad de columnas en diferentes vistas:

```typescript
import { describe, it, expect } from 'vitest';
import { Product } from '@/entities/product';

describe('Product column visibility', () => {
    it('should hide long text fields in ListView', () => {
        expect(Product.isHideInListView('description')).toBe(true);
        expect(Product.isHideInListView('internalNotes')).toBe(true);
    });
    
    it('should show essential fields in ListView', () => {
        expect(Product.isHideInListView('id')).toBe(false);
        expect(Product.isHideInListView('name')).toBe(false);
        expect(Product.isHideInListView('price')).toBe(false);
    });
    
    it('should return filtered property list', () => {
        const listProps = Product.getListViewProperties();
        const allProps = Product.getProperties();
        
        expect(listProps.length).toBeLessThan(allProps.length);
        expect(listProps.includes('description')).toBe(false);
        expect(allProps.includes('description')).toBe(true);
    });
});
```

### Nota 8: Column Limit Recommendations

Mantener balance óptimo de columnas visibles:

```typescript
// ✅ RECOMENDADO: 4-8 columnas en desktop
// - 1-2 identificadores (ID, SKU)
// - 2-3 campos descriptivos (Name, Category, Brand)
// - 1-2 métricas (Price, Stock)
// - 1-2 estados (Status, Active)

// ✅ RECOMENDADO: 2-4 columnas en mobile
// - ID
// - Name
// - Status
// - Actions

// ❌ EVITAR: >10 columnas (scroll horizontal excesivo)
// ❌ EVITAR: <3 columnas (información insuficiente)
```

### Nota 9: Diferenciación con Display None en CSS

`@HideInListView` elimina columna completamente, CSS `display: none` solo oculta visualmente:

```typescript
// @HideInListView - NO renderiza DOM
<th v-for="prop in visibleProperties">  
  <!-- 'description' NO aparece en loop -->
</th>

// CSS display: none - Renderiza DOM pero oculto
<th v-for="prop in allProperties" :style="{ display: isHidden(prop) ? 'none' : 'table-cell' }">
  <!-- 'description' aparece en DOM pero invisible -->
</th>

// Benefit: @HideInListView reduce DOM nodes = mejor performance
```

### Nota 10: Dynamic Visibility NO Soportado Nativamente

Decorador es estático, para visibilidad dinámica usar lógica en componente:

```typescript
// NO POSIBLE: Visibilidad condicional basada en rol
// No se puede hacer: @HideInListView(if user.role !== 'admin')

// ALTERNATIVA: Lógica en componente
<template>
  <th v-for="prop in filteredProperties" :key="prop">
    {{ entityClass.getPropertyName(prop) }}
  </th>
</template>

<script setup>
const filteredProperties = computed(() => {
    let props = entityClass.value.getListViewProperties();
    
    // Lógica custom adicional a decoradores
    if (!user.value.isAdmin) {
        props = props.filter(p => p !== 'internalCost' && p !== 'profitMargin');
    }
    
    return props;
});
</script>
```

## 11. Referencias Cruzadas

### Documentación de Framework

- [Base Entity Core](../02-base-entity/base-entity-core.md) - Métodos `isHideInListView()`, `getListViewProperties()`
- [Metadata Access](../02-base-entity/metadata-access.md) - Sistema de metadata y accessors
- [Static Methods](../02-base-entity/static-methods.md) - Métodos estáticos de consulta

### Decoradores Relacionados

- [HideInDetailView Decorator](hide-in-detail-view-decorator.md) - Ocultar en DetailView (complementario)
- [PropertyName Decorator](property-name-decorator.md) - Nombres de visualización en columnas
- [PropertyIndex Decorator](property-index-decorator.md) - Orden de columnas en tabla
- [DisplayFormat Decorator](display-format-decorator.md) - Formateo de valores en celdas
- [StringType Decorator](string-type-decorator.md) - Tipos de string (TEXTAREA, HTML, JSON)
- [ViewGroup Decorator](view-group-decorator.md) - Organización de campos en DetailView

### Componentes de UI

- DefaultListView Component (src/views/default_listview.vue) - Implementación de tablas
- DefaultDetailView Component (src/views/default_detailview.vue) - Implementación de formularios
- FormInput Components (src/components/Form/) - Inputs de formulario

### Tutoriales y Ejemplos

- [Basic CRUD Tutorial](../../tutorials/01-basic-crud.md) - Uso de hide decorators en CRUD
- [Advanced Module Example](../../examples/advanced-module-example.md) - Visibilidad avanzada en módulos

**Ubicación del archivo fuente:**
- Path: `src/decorations/hide_in_list_view_decorator.ts`
- Líneas: ~25

**Símbolos exportados:**
```typescript
export const HIDE_IN_LIST_VIEW_KEY: Symbol
export function HideInListView(): PropertyDecorator
```
