# HideInDetailView Decorator

## 1. Propósito

El decorador `@HideInDetailView()` oculta una propiedad en vistas de detalle (DetailView / formulario) mientras la mantiene visible en vistas de lista (ListView / tabla). Este decorador controla selectivamente la presentación de propiedades en diferentes contextos de visualización sin afectar la persistencia ni el procesamiento de datos.

**Casos de uso principales:**
- Campos calculados de solo lectura que aportan valor en tablas pero no requieren edición
- Timestamps de auditoría que deben mostrarse como información contextual pero no son editables
- IDs internos y códigos de referencia útiles para identificación rápida en listas
- Información derivada de otras propiedades que se calcula automáticamente
- Agregaciones y valores estadísticos que se muestran como resumen en tablas

**Objetivos del decorador:**
- Mantener formularios de edición limpios y enfocados en datos editables
- Proporcionar información completa y contextual en vistas de tabla
- Evitar confusión del usuario con campos que no puede modificar
- Optimizar el flujo de edición mostrando solo propiedades relevantes
- Separar claramente entre datos de entrada y datos derivados/calculados

## 2. Alcance

### Responsabilidades

- Almacenar metadata de visibilidad en DetailView mediante Symbol dedicado
- Proporcionar API de consulta para verificar visibilidad de propiedades específicas
- Permitir filtrado de propiedades para generación de formularios dinámicos
- Integrarse con componentes DetailView para renderizado condicional
- Mantener visibilidad completa en ListView independientemente de configuración DetailView
- Coordinar con sistema de metadata de BaseEntity para acceso unificado

### Límites

- No afecta la persistencia de datos ni operaciones de guardado en backend
- No modifica la visibilidad en ListView (usar @HideInListView para ese propósito)
- No aplica lógica de deshabilitación (usar @Readonly para campos visibles pero no editables)
- No implementa validaciones de negocio ni transformaciones de datos
- No gestiona permisos de acceso ni seguridad a nivel de campo
- No proporciona formateo de valores (usar @DisplayFormat para ese propósito)

## 3. Definiciones Clave

**HIDE_IN_DETAIL_VIEW_METADATA (Symbol):**
- Identificador único para almacenar lista de propiedades ocultas en DetailView
- Ubicación: `prototype` de la clase entity
- Tipo: `Symbol`
- Valor almacenado: Array de strings con nombres de propiedades

**isHideInDetailView() (Método de instancia):**
- Accessor de BaseEntity que verifica si una propiedad debe ocultarse en DetailView
- Parámetros: `propertyKey: string`
- Retorno: `boolean` (true si oculta en DetailView)
- Ubicación: `src/entities/base_entitiy.ts` línea ~1280

**getDetailViewProperties() (Método estático):**
- Obtiene lista filtrada de propiedades visibles en DetailView
- Retorno: `string[]` con nombres de propiedades no ocultas
- Filtra usando isHideInDetailView() sobre resultado de getProperties()
- Ubicación: `src/entities/base_entitiy.ts` línea ~1310

**DetailView vs ListView:**
- DetailView: Vista de formulario para crear/editar una entidad individual, enfocada en campos editables
- ListView: Vista de tabla para mostrar múltiples entidades, enfocada en información contextual y navegación

**Diferenciación con @HideInListView:**
- @HideInDetailView: Oculta en formularios, muestra en tablas
- @HideInListView: Oculta en tablas, muestra en formularios
- Complementarios: Pueden usarse en propiedades diferentes según necesidad de visualización

**Diferenciación con @Readonly:**
- @HideInDetailView: Campo no aparece en formulario
- @Readonly: Campo aparece en formulario pero deshabilitado
- Uso conjunto: No es común porque @Readonly ya implica visibilidad controlada


## 4. Descripción Técnica

### 4.1. Implementación del Decorador

**Ubicación:** `src/decorations/hide_in_detail_view_decorator.ts` (línea ~1-25)

```typescript
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

**Elementos técnicos:**

1. **Symbol HIDE_IN_DETAIL_VIEW_METADATA:**
   - Identificador único para evitar colisiones en prototype
   - Almacena array de nombres de propiedades ocultas en DetailView
   - Accesible desde BaseEntity y componentes UI

2. **PropertyDecorator:**
   - Función que retorna PropertyDecorator estándar de TypeScript
   - Recibe `target` (prototype de la clase) y `propertyKey` (nombre de propiedad)
   - Modifica prototype sin afectar instancias existentes

3. **Inicialización del array:**
   - Verifica existencia de metadata antes de agregar
   - Crea array vacío si es primera propiedad con @HideInDetailView
   - Permite múltiples propiedades ocultas en misma clase

4. **Adición a lista:**
   - Usa `push()` para agregar propertyKey al array
   - Mantiene orden de declaración de propiedades
   - Soporta herencia (cada clase tiene su propia lista)

### 4.2. Metadata Storage

**Estructura en prototype:**

```typescript
// Ejemplo: Order con campos ocultos
Order.prototype[HIDE_IN_DETAIL_VIEW_METADATA] = [
    'createdAt',        // Timestamp (solo info)
    'itemsCount',       // Calculado (solo mostrar)
    'statusLabel',      // Derivado (solo mostrar)
    'formattedTotal'    // Calculado (solo mostrar)
];
```

**Características del almacenamiento:**
- Metadata se almacena en `prototype` de la clase, no en instancias individuales
- Array contiene strings con nombres de propiedades exactos
- Accesible mediante Symbol para evitar conflictos con propiedades normales
- Persiste durante toda la vida de la aplicación (no se serializa con entidad)

### 4.3. Accessors en BaseEntity

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1280-1330)

```typescript
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

**Métodos disponibles:**

1. **isHideInDetailView() (instancia):**
   - Verifica si propiedad específica está oculta en DetailView
   - Accede a metadata mediante constructor de instancia
   - Retorna `false` si no hay metadata (ninguna propiedad oculta)
   - Usa `includes()` para búsqueda eficiente en array

2. **isHideInDetailView() (estático):**
   - Versión estática para uso sin instancia
   - Útil en componentes que solo tienen referencia a clase
   - Accede directamente a `prototype` de la clase
   - Misma lógica de verificación que versión de instancia

3. **getDetailViewProperties():**
   - Obtiene lista completa de propiedades visibles en DetailView
   - Usa `getProperties()` como base (todas las propiedades)
   - Filtra usando `isHideInDetailView()` para excluir ocultas
   - Retorna array limpio listo para renderizado en formularios

### 4.4. Integración con UI

**DetailView (Formulario) - Exclusión de campos ocultos:**

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

**ListView (Tabla) - Inclusión de todos los campos:**

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
    // getListViewProperties() NO filtra por @HideInDetailView
    return entityClass.value.getListViewProperties();
});
</script>
```

**Diferenciación de métodos:**
- `getDetailViewProperties()`: Filtra propiedades con @HideInDetailView
- `getListViewProperties()`: Filtra propiedades con @HideInListView (independiente)
- Los dos decoradores son complementarios y no interfieren entre sí

## 5. Flujo de Funcionamiento

### Fase 1: Decoración de Propiedad (Design Time)

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Created At', Date)
    @HideInDetailView()  // ← 1. Decorador aplicado en tiempo de compilación
    createdAt!: Date;
}
```

**Acciones:**
1. TypeScript procesa decorador durante compilación
2. Función `HideInDetailView()` se ejecuta inmediatamente
3. PropertyDecorator agrega 'createdAt' a `Order.prototype[HIDE_IN_DETAIL_VIEW_METADATA]`
4. Metadata queda disponible para runtime

### Fase 2: Carga de Entity Class (Runtime - Inicialización)

```typescript
// Application carga clase Order
Application.View.value.entityClass = Order;

// Metadata ya está disponible en prototype
console.log(Order.isHideInDetailView('createdAt')); // true
console.log(Order.isHideInDetailView('id')); // false
```

**Acciones:**
1. Aplicación carga clase entity en Application singleton
2. Metadata de decoradores ya está almacenada en prototype
3. Métodos estáticos pueden consultar metadata inmediatamente
4. No requiere instanciación de entidad para consultar visibilidad

### Fase 3: Renderizado de DetailView (Creación/Edición)

```vue
<script setup>
// Obtener propiedades visibles en DetailView
const editableProperties = computed(() => {
    return entityClass.value.getDetailViewProperties();
    // Retorna: ['id', 'customerName', 'amount', ...]
    // NO incluye: ['createdAt', 'updatedAt', 'itemsCount', ...]
});
</script>

<template>
  <div v-for="prop in editableProperties" :key="prop">
    <!-- Renderiza solo propiedades NO ocultas en DetailView -->
    <FormInput :property="prop" v-model="entity[prop]" />
  </div>
</template>
```

**Acciones:**
1. DetailView obtiene `entityClass` desde Application
2. Llama a `getDetailViewProperties()` para obtener lista filtrada
3. Método retorna solo propiedades no marcadas con @HideInDetailView
4. Vue renderiza inputs solo para propiedades visibles
5. Campos ocultos (`createdAt`, etc.) no aparecen en formulario

### Fase 4: Renderizado de ListView (Tabla)

```vue
<script setup>
// Obtener propiedades visibles en ListView
const listViewProperties = computed(() => {
    return entityClass.value.getListViewProperties();
    // Retorna todas las propiedades incluyendo @HideInDetailView
    // Solo filtra propiedades con @HideInListView
});
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="prop in listViewProperties" :key="prop">
          {{ entityClass.getPropertyName(prop) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entity in entities" :key="entity.id">
        <td v-for="prop in listViewProperties" :key="prop">
          <!-- Muestra TODAS las propiedades incluyendo createdAt -->
          {{ formatValue(entity, prop) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

**Acciones:**
1. ListView obtiene `entityClass` desde Application
2. Llama a `getListViewProperties()` que NO filtra por @HideInDetailView
3. Método solo filtra propiedades con @HideInListView (diferente decorador)
4. Vue renderiza columnas para todas las propiedades visibles
5. Campos con @HideInDetailView SÍ aparecen en tabla (createdAt, etc.)

## 6. Reglas Obligatorias

### 6.1. Campos Calculados y Derivados Deben Usar @HideInDetailView

**Regla:** Propiedades calculadas automáticamente (getters, agregaciones, formateo) deben ocultarse en DetailView porque no son editables directamente.

```typescript
// CORRECTO
export class Order extends BaseEntity {
    @PropertyName('Subtotal', Number)
    subtotal!: number;
    
    @PropertyName('Tax', Number)
    tax!: number;
    
    @PropertyName('Total', Number)
    @HideInDetailView()  // ← Campo calculado
    get total(): number {
        return this.subtotal + this.tax;
    }
}

// INCORRECTO
export class Order extends BaseEntity {
    @PropertyName('Total', Number)
    // ❌ Falta @HideInDetailView - campo calculado editable causa inconsistencia
    get total(): number {
        return this.subtotal + this.tax;
    }
}
```

### 6.2. Timestamps de Auditoría Deben Usar @HideInDetailView

**Regla:** Campos como `createdAt`, `updatedAt`, `deletedAt` deben ocultarse en formularios porque se gestionan automáticamente por el sistema.

```typescript
// CORRECTO
export class Product extends BaseEntity {
    @PropertyName('Created At', Date)
    @DisplayFormat('datetime')
    @HideInDetailView()  // ← Timestamp auto-gestionado
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @DisplayFormat('datetime')
    @HideInDetailView()  // ← Timestamp auto-gestionado
    updatedAt!: Date;
}

// INCORRECTO
export class Product extends BaseEntity {
    @PropertyName('Created At', Date)
    // ❌ Falta @HideInDetailView - usuario no debe editar timestamp
    createdAt!: Date;
}
```

### 6.3. Primary Key NO Debe Usar @HideInDetailView

**Regla:** La primary key debe ser visible en ambas vistas (ListView y DetailView) para identificación clara de la entidad.

```typescript
// CORRECTO
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @Primary()
    id!: number;  // ← Visible en DetailView y ListView
}

// INCORRECTO
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @Primary()
    @HideInDetailView()  // ❌ Primary key debe ser visible
    id!: number;
}
```

### 6.4. Información Derivada de Relaciones Debe Usar @HideInDetailView

**Regla:** Campos que muestran información derivada de foreign keys (nombres de entidades relacionadas) deben ocultarse en DetailView porque se edita la foreign key, no el nombre.

```typescript
// CORRECTO
export class Order extends BaseEntity {
    @PropertyName('Customer ID', Number)
    customerId!: number;  // ← Editable en DetailView (dropdown)
    
    @PropertyName('Customer Name', String)
    @HideInDetailView()  // ← Derivado de customerId
    customerName!: string;  // ← Solo mostrar en ListView
}

// INCORRECTO
export class Order extends BaseEntity {
    @PropertyName('Customer ID', Number)
    customerId!: number;
    
    @PropertyName('Customer Name', String)
    // ❌ Falta @HideInDetailView - confunde porque no es editable directamente
    customerName!: string;
}
```

### 6.5. Status Labels Derivados Deben Usar @HideInDetailView

**Regla:** Cuando existe un código de estado (`statusCode`) y un label derivado (`statusLabel`), el label debe ocultarse en DetailView.

```typescript
// CORRECTO
export class Order extends BaseEntity {
    @PropertyName('Status Code', String)
    statusCode!: string;  // ← Editable en DetailView (P, S, D, C)
    
    @PropertyName('Status', String)
    @HideInDetailView()  // ← Label derivado
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

### 6.6. Agregaciones y Contadores Deben Usar @HideInDetailView

**Regla:** Campos que contienen agregaciones (sumas, promedios, conteos) deben ocultarse en DetailView porque se calculan desde colecciones relacionadas.

```typescript
// CORRECTO
export class Department extends BaseEntity {
    @PropertyName('Employee Count', Number)
    @HideInDetailView()  // ← Agregación
    employeeCount!: number;
    
    @PropertyName('Total Salaries', Number)
    @HideInDetailView()  // ← Suma
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

## 7. Prohibiciones

### 7.1. NO Usar @HideInDetailView en Campos Editables Requeridos

**Prohibición:** No ocultar campos que deben ser editados por el usuario, especialmente si tienen validación @Required.

```typescript
// PROHIBIDO
export class Order extends BaseEntity {
    @PropertyName('Status', String)
    @Required()
    @HideInDetailView()  // ❌ Campo requerido no puede estar oculto
    status!: string;
}

// PERMITIDO
export class Order extends BaseEntity {
    @PropertyName('Status', String)
    @Required()
    status!: string;  // ✅ Campo requerido visible
    
    @PropertyName('Status Label', String)
    @HideInDetailView()  // ✅ Label derivado oculto
    get statusLabel(): string {
        return this.status === 'A' ? 'Active' : 'Inactive';
    }
}
```

### 7.2. NO Usar @HideInDetailView en Foreign Keys

**Prohibición:** No ocultar foreign keys porque son necesarias para establecer relaciones durante edición.

```typescript
// PROHIBIDO
export class OrderItem extends BaseEntity {
    @PropertyName('Order ID', Number)
    @HideInDetailView()  // ❌ Foreign key oculta impide crear relación
    orderId!: number;
}

// PERMITIDO
export class OrderItem extends BaseEntity {
    @PropertyName('Order ID', Number)
    orderId!: number;  // ✅ Foreign key visible y editable
    
    @PropertyName('Order Number', String)
    @HideInDetailView()  // ✅ Información derivada oculta
    orderNumber!: string;
}
```

### 7.3. NO Combinar @HideInDetailView con @Required sin Default Value

**Prohibición:** No ocultar campos requeridos sin proporcionar valor por defecto, causará errores de validación.

```typescript
// PROHIBIDO
export class Product extends BaseEntity {
    @PropertyName('Created By', String)
    @Required()
    @HideInDetailView()  // ❌ Requerido sin default causará error
    createdBy!: string;
}

// PERMITIDO - Opción 1: Asignar valor automático
export class Product extends BaseEntity {
    @PropertyName('Created By', String)
    @HideInDetailView()
    createdBy: string = Application.currentUser.id;  // ✅ Default value
}

// PERMITIDO - Opción 2: No ocultar
export class Product extends BaseEntity {
    @PropertyName('Created By', String)
    @Required()
    createdBy!: string;  // ✅ Visible y editable
}
```

### 7.4. NO Usar @HideInDetailView para Controlar Permisos

**Prohibición:** No usar este decorador como mecanismo de seguridad o control de permisos. Los datos siguen accesibles en cliente.

```typescript
// PROHIBIDO - Falsa sensación de seguridad
export class User extends BaseEntity {
    @PropertyName('Password Hash', String)
    @HideInDetailView()  // ❌ NO protege datos sensibles
    passwordHash!: string;  // Datos siguen en memoria del cliente
}

// PERMITIDO - Usar exclusión en backend
export class User extends BaseEntity {
    // ✅ No incluir datos sensibles en respuestas API
    // Backend debe excluir passwordHash de JSON response
}
```

### 7.5. NO Ocultar Campos que Afectan Validaciones Dependientes

**Prohibición:** No ocultar campos cuyos valores afectan validaciones de otros campos visibles, causará confusión.

```typescript
// PROHIBIDO
export class Product extends BaseEntity {
    @PropertyName('Has Discount', Boolean)
    @HideInDetailView()  // ❌ Campo oculto afecta validación de discountAmount
    hasDiscount!: boolean;
    
    @PropertyName('Discount Amount', Number)
    @AsyncValidation('validateDiscountAmount')  // Depende de hasDiscount
    discountAmount?: number;
}

// PERMITIDO - Ambos visibles o lógica independiente
export class Product extends BaseEntity {
    @PropertyName('Has Discount', Boolean)
    hasDiscount!: boolean;  // ✅ Visible
    
    @PropertyName('Discount Amount', Number)
    @AsyncValidation('validateDiscountAmount')
    discountAmount?: number;  // ✅ Validación comprensible
}
```

### 7.6. NO Usar @HideInDetailView en Todas las Propiedades

**Prohibición:** No ocultar todas las propiedades de una entidad, formulario quedaría vacío.

```typescript
// PROHIBIDO
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @HideInDetailView()
    id!: number;
    
    @PropertyName('Product Name', String)
    @HideInDetailView()  // ❌ Todas ocultas
    name!: string;
    
    @PropertyName('Price', Number)
    @HideInDetailView()
    price!: number;
}
// DetailView renderizará formulario vacío
```

## 8. Dependencias

### 8.1. BaseEntity (Core)

**Relación:** BaseEntity proporciona métodos de acceso a metadata de @HideInDetailView.

**Dependencias:**
```typescript
// src/entities/base_entitiy.ts
import { HIDE_IN_DETAIL_VIEW_METADATA } from '@/decorations/hide_in_detail_view_decorator';

public isHideInDetailView(propertyKey: string): boolean
public static isHideInDetailView(propertyKey: string): boolean
public static getDetailViewProperties(): string[]
```

**Uso:** Decorador almacena metadata, BaseEntity la lee y procesa.

### 8.2. DetailView Component

**Relación:** DetailView usa `getDetailViewProperties()` para determinar qué campos renderizar en formularios.

**Dependencias:**
```vue
<!-- src/views/default_detailview.vue -->
<script setup>
import { computed } from 'vue';
import Application from '@/models/application';

const editableProperties = computed(() => {
    return Application.View.value.entityClass.getDetailViewProperties();
});
</script>
```

**Uso:** DetailView excluye campos con @HideInDetailView del formulario.

### 8.3. ListView Component

**Relación:** ListView NO es afectado por @HideInDetailView, usa `getListViewProperties()` que filtra por @HideInListView.

**Independencia:**
```vue
<!-- src/views/default_listview.vue -->
<script setup>
const listViewProperties = computed(() => {
    // getListViewProperties() NO filtra por @HideInDetailView
    return entityClass.value.getListViewProperties();
});
</script>
```

### 8.4. @PropertyName Decorator

**Relación:** @PropertyName se usa junto con @HideInDetailView para definir nombres de visualización de campos ocultos en ListView.

**Uso conjunto:**
```typescript
@PropertyName('Created At', Date)
@DisplayFormat('datetime')
@HideInDetailView()
createdAt!: Date;
// PropertyName define header de columna en ListView
// HideInDetailView oculta en formulario
```

### 8.5. Save Operations

**Relación:** Operaciones de guardado pueden usar `getDetailViewProperties()` para enviar solo datos editables al backend.

**Integración opcional:**
```typescript
async function saveEntity(entity: BaseEntity) {
    const detailViewProps = entity.constructor.getDetailViewProperties();
    
    const dataToSave = {};
    detailViewProps.forEach(prop => {
        dataToSave[prop] = entity[prop];
    });
    
    // Enviar solo propiedades editables
    // Campos ocultos (timestamps, calculados) NO se sobrescriben
    await fetch('/api/entities', {
        method: 'POST',
        body: JSON.stringify(dataToSave)
    });
}
```

### 8.6. Export/Print Operations

**Relación:** Al exportar o imprimir, usar `getProperties()` en lugar de `getDetailViewProperties()` para incluir toda la información.

**Diferenciación:**
```typescript
function exportEntity(entity: BaseEntity) {
    // Usar getProperties() NO getDetailViewProperties()
    const allProperties = entity.constructor.getProperties();
    
    allProperties.forEach(prop => {
        // Incluir campos ocultos en DetailView
        console.log(`${prop}: ${entity[prop]}`);
    });
}
```

## 9. Relaciones

### 9.1. Con @HideInListView (Complementario)

**Relación:** Decoradores complementarios para control granular de visibilidad en diferentes vistas.

**Uso conjunto:**
```typescript
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    @HideInListView()  // ← Oculto en tabla (texto largo)
    description!: string;  // ← Visible en formulario
    
    @PropertyName('Created At', Date)
    @HideInDetailView()  // ← Oculto en formulario (timestamp)
    createdAt!: Date;  // ← Visible en tabla
}
```

**Matriz de visibilidad:**
```
Campo       | ListView | DetailView
------------|----------|------------
description | ❌ Hide  | ✅ Show    (@HideInListView)
createdAt   | ✅ Show  | ❌ Hide    (@HideInDetailView)
name        | ✅ Show  | ✅ Show    (ningún decorator)
```

### 9.2. Con @Readonly (Alternativa)

**Relación:** @Readonly es alternativa cuando campo debe ser visible pero no editable en DetailView.

**Diferenciación:**
```typescript
export class Invoice extends BaseEntity {
    // Opción 1: Ocultar completamente en DetailView
    @PropertyName('Created At', Date)
    @HideInDetailView()  // ← No aparece en formulario
    createdAt!: Date;
    
    // Opción 2: Mostrar pero deshabilitar en DetailView
    @PropertyName('Invoice Number', String)
    @Readonly()  // ← Aparece deshabilitado en formulario
    invoiceNumber!: string;
}
```

**Cuándo usar cada uno:**
- `@HideInDetailView`: Información no relevante para edición (timestamps, calculados)
- `@Readonly`: Información importante pero no editable (números de factura, códigos)

### 9.3. Con @DisplayFormat (Complementario)

**Relación:** @DisplayFormat formatea valores en ListView cuando campo está oculto en DetailView.

**Uso conjunto:**
```typescript
export class Product extends BaseEntity {
    @PropertyName('Created At', Date)
    @DisplayFormat('datetime')  // ← Formatea en ListView
    @HideInDetailView()  // ← Oculta en DetailView
    createdAt!: Date;
    
    @PropertyName('Price (USD)', String)
    @DisplayFormat((value) => `$${value.toFixed(2)}`)
    @HideInDetailView()  // ← Muestra formateado en tabla, no en formulario
    get formattedPrice(): string {
        return `$${this.price.toFixed(2)}`;
    }
}
```

### 9.4. Con @PropertyIndex (Complementario)

**Relación:** @PropertyIndex controla orden de columnas en ListView incluyendo campos con @HideInDetailView.

**Uso conjunto:**
```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @PropertyIndex(1)
    id!: number;
    
    @PropertyName('Customer Name', String)
    @PropertyIndex(2)
    customerName!: string;
    
    @PropertyName('Created At', Date)
    @PropertyIndex(3)
    @HideInDetailView()  // ← PropertyIndex afecta ListView solamente
    createdAt!: Date;
}
```

### 9.5. Con @Required y @Validation (Compatibilidad limitada)

**Relación:** Compatibilidad limitada porque validaciones en campos ocultos pueden causar errores sin feedback visual.

**Uso cauteloso:**
```typescript
// EVITAR: Validación en campo oculto
export class Product extends BaseEntity {
    @PropertyName('Created At', Date)
    @Required()  // ⚠️ Validación puede fallar sin indicador visual
    @HideInDetailView()
    createdAt!: Date;
}

// MEJOR: Asignar default value
export class Product extends BaseEntity {
    @PropertyName('Created At', Date)
    @HideInDetailView()
    createdAt: Date = new Date();  // ✅ Default automático
}
```

### 9.6. Con Getters/Computed Properties (Uso común)

**Relación:** @HideInDetailView es ideal para getters porque son calculados y no editables.

**Patrón recomendado:**
```typescript
export class Order extends BaseEntity {
    @PropertyName('Subtotal', Number)
    subtotal!: number;
    
    @PropertyName('Tax', Number)
    tax!: number;
    
    @PropertyName('Total', Number)
    @HideInDetailView()  // ← Siempre en getters
    get total(): number {
        return this.subtotal + this.tax;
    }
}
```

## 10. Notas de Implementación

### Nota 1: Campos Ocultos Siguen en Datos de Entity

Campos con @HideInDetailView siguen presentes en instancia de entity y accesibles programáticamente:

```typescript
const order = new Order();
order.createdAt = new Date();  // ✅ Propiedad existe
console.log(order.createdAt);  // ✅ Accesible

// Solo afecta renderizado en DetailView:
const props = Order.getDetailViewProperties();
console.log(props.includes('createdAt'));  // false (no se renderiza en formulario)

// Pero sigue en entity:
console.log(order.hasOwnProperty('createdAt'));  // true
```

### Nota 2: Save Operations Pueden Excluir Campos Ocultos

Operaciones de guardado pueden usar `getDetailViewProperties()` para enviar solo datos editables, protegiendo timestamps y calculados:

```typescript
async function saveEntity(entity: BaseEntity) {
    const editableProps = entity.constructor.getDetailViewProperties();
    
    const payload = {};
    editableProps.forEach(prop => {
        payload[prop] = entity[prop];
    });
    
    // createdAt, updatedAt, etc. NO se envían al backend
    // Backend gestiona estos campos automáticamente
    await entity.save(payload);
}
```

### Nota 3: Export/Print Debe Incluir Campos Ocultos

Al exportar o imprimir entidades, usar `getProperties()` para incluir toda la información, no solo campos editables:

```typescript
function exportToCSV(entities: BaseEntity[]) {
    const allProperties = entities[0].constructor.getProperties();
    // NO usar getDetailViewProperties() aquí
    
    const csv = entities.map(entity => {
        return allProperties.map(prop => entity[prop]).join(',');
    }).join('\n');
    
    return csv;
}
```

### Nota 4: Herencia Preserva Metadata de Clase Padre

Clases hijas heredan propiedades ocultas de clase padre:

```typescript
export class BaseOrder extends BaseEntity {
    @PropertyName('Created At', Date)
    @HideInDetailView()
    createdAt!: Date;
}

export class CustomerOrder extends BaseOrder {
    @PropertyName('Customer Name', String)
    customerName!: string;
    
    // createdAt heredado sigue oculto en DetailView
}

const props = CustomerOrder.getDetailViewProperties();
console.log(props.includes('createdAt'));  // false (heredado)
console.log(props.includes('customerName'));  // true
```

### Nota 5: Compatibilidad con Module Custom Components

Cuando se usa @ModuleDetailComponent personalizado, es responsabilidad del componente respetar `getDetailViewProperties()`:

```vue
<!-- CustomDetailComponent.vue -->
<script setup>
import { computed } from 'vue';

const editableProperties = computed(() => {
    // Respetar decorador @HideInDetailView
    return props.entityClass.getDetailViewProperties();
});
</script>
```

### Nota 6: Testing de Visibilidad

Test de visibilidad de campos en diferentes vistas:

```typescript
import { describe, it, expect } from 'vitest';
import { Order } from '@/entities/order';

describe('Order visibility', () => {
    it('should hide timestamps in DetailView', () => {
        expect(Order.isHideInDetailView('createdAt')).toBe(true);
        expect(Order.isHideInDetailView('updatedAt')).toBe(true);
    });
    
    it('should show editable fields in DetailView', () => {
        expect(Order.isHideInDetailView('customerName')).toBe(false);
        expect(Order.isHideInDetailView('amount')).toBe(false);
    });
    
    it('should include hidden fields in all properties', () => {
        const allProps = Order.getProperties();
        const detailProps = Order.getDetailViewProperties();
        
        expect(allProps.includes('createdAt')).toBe(true);
        expect(detailProps.includes('createdAt')).toBe(false);
    });
});
```

### Nota 7: Diferenciación con @Disabled

@HideInDetailView oculta completamente, @Disabled muestra pero deshabilita:

```typescript
// Comparación de renderizado
export class Product extends BaseEntity {
    @PropertyName('Created At', Date)
    @HideInDetailView()  // ← No renderiza input
    createdAt!: Date;
    
    @PropertyName('SKU', String)
    @Disabled()  // ← Renderiza input deshabilitado
    sku!: string;
}
```

**DetailView output:**
```html
<!-- createdAt: No renderiza nada -->

<!-- sku: Renderiza input deshabilitado -->
<input type="text" value="SKU-001" disabled>
```

### Nota 8: Dynamic Visibility NO Soportado

El decorador es estático (design time), no soporta visibilidad dinámica basada en estado:

```typescript
// NO POSIBLE: Visibilidad condicional
// No se puede hacer: if (user.isAdmin) show field

// ALTERNATIVA: Usar lógica en componente
<template>
  <div v-for="prop in editableProperties" :key="prop">
    <FormInput 
      v-if="shouldShowField(prop)" 
      :property="prop" 
      v-model="entity[prop]" 
    />
  </div>
</template>

<script setup>
function shouldShowField(prop: string): boolean {
    // Lógica custom adicional a decoradores
    if (prop === 'sensitiveField' && !user.isAdmin) {
        return false;
    }
    return true;
}
</script>
```

### Nota 9: Ordenamiento de Campos en DetailView

El orden de campos en DetailView respeta @PropertyIndex incluso después de filtrar:

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @PropertyIndex(1)
    id!: number;
    
    @PropertyName('Customer Name', String)
    @PropertyIndex(2)
    customerName!: string;
    
    @PropertyName('Created At', Date)
    @PropertyIndex(3)
    @HideInDetailView()  // ← Filtrado DESPUÉS de ordenamiento
    createdAt!: Date;
    
    @PropertyName('Amount', Number)
    @PropertyIndex(4)
    amount!: number;
}

// getDetailViewProperties() retorna: ['id', 'customerName', 'amount']
// Orden preservado: 1, 2, 4 (excluye 3)
```

### Nota 10: Performance en Listas Grandes

`getDetailViewProperties()` se ejecuta una vez por clase, no por instancia, optimizando performance:

```typescript
// EFICIENTE: Computed en componente
const editableProperties = computed(() => {
    // Se ejecuta una vez, cachea resultado
    return entityClass.value.getDetailViewProperties();
});

// DetailView renderiza múltiples entidades usando misma lista:
entities.forEach(entity => {
    // editableProperties se reutiliza, no se recalcula por entidad
    renderForm(entity, editableProperties);
});
```

## 11. Referencias Cruzadas

### Documentación de Framework

- [Base Entity Core](../../02-base-entity/base-entity-core.md) - Métodos `isHideInDetailView()`, `getDetailViewProperties()`
- [Metadata Access](../../02-base-entity/metadata-access.md) - Sistema de metadata y accessors
- [Static Methods](../../02-base-entity/static-methods.md) - Métodos estáticos de consulta

### Decoradores Relacionados

- [HideInListView Decorator](hide-in-list-view-decorator.md) - Ocultar en ListView (complementario)
- [Readonly Decorator](readonly-decorator.md) - Alternativa para campos visibles pero no editables
- [Disabled Decorator](disabled-decorator.md) - Deshabilitar campos en formularios
- [PropertyName Decorator](property-name-decorator.md) - Nombres de visualización en ambas vistas
- [PropertyIndex Decorator](property-index-decorator.md) - Orden de propiedades en vistas
- [DisplayFormat Decorator](display-format-decorator.md) - Formateo de valores en ListView

### Componentes de UI

- DefaultDetailView Component (src/views/default_detailview.vue) - Implementación de formularios
- DefaultListView Component (src/views/default_listview.vue) - Implementación de tablas
- FormInput Components (src/components/Form/) - Inputs de formulario

### Tutoriales y Ejemplos

- [Basic CRUD Tutorial](../../tutorials/01-basic-crud.md) - Uso de hide decorators en CRUD
- [Advanced Module Example](../../examples/advanced-module-example.md) - Visibilidad avanzada

**Ubicación del archivo fuente:**
- Path: `src/decorations/hide_in_detail_view_decorator.ts`
- Líneas: ~25

**Símbolos exportados:**
```typescript
export const HIDE_IN_DETAIL_VIEW_METADATA: Symbol
export function HideInDetailView(): PropertyDecorator
```
