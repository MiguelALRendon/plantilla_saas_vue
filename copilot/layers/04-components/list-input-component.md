# 📋 ListInputComponent - Selector Dropdown de Lista

**Referencias:**
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadatos
- `../../02-base-entity/metadata-access.md` - Acceso a metadatos
- `../../tutorials/02-validations.md` - Sistema de validaciones

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/ListInputComponent.vue`  
**Modelo:** `EnumAdapter` - Adaptador para enums y listas de opciones  
**Tipo de propiedad:** `String` o `Number` con opciones predefinidas

---

## 🎯 Propósito

Componente dropdown personalizado para **seleccionar opciones de una lista predefinida**. Características:

- ✅ Dropdown animado con transición
- ✅ Formato automático de valores (snake_case → Title Case) 
- ✅ Posicionamiento inteligente (arriba/abajo según espacio)
- ✅ Click fuera para cerrar
- ✅ Opción seleccionada resaltada
- ✅ Validación de 3 niveles del framework

---

## 🔧 Activación

A diferencia de otros inputs, ListInputComponent requiere **integración manual**:

```typescript
// En DefaultDetailView o componente custom
<ListInputComponent
    :entity-class="entityClass"
    :entity="entity"
    property-key="status"
    :property-enum-values="statusEnumAdapter"  // ← EnumAdapter
    v-model="entity.status"
/>
```

**Nota:** Actualmente no se genera automáticamente desde decoradores.

---

## 📋 Props

```typescript
props: {
    entityClass: {
        type: Function as unknown as () => typeof BaseEntity,
        required: true,
    },
    entity: {
        type: Object as () => BaseEntity,
        required: true,
    },
    propertyKey: {
        type: String,
        required: true,
    },
    propertyEnumValues: {
        type: Object as () => EnumAdapter,  // ← Específico de List
        required: true,
    },
    modelValue: {
        type: [String, Number],
        required: true,
        default: '',
    },
}
```

---

## 🎨 EnumAdapter

### Estructura

```typescript
class EnumAdapter {
    getKeyValuePairs(): Array<{ key: string, value: string | number }>;
}
```

### Ejemplo de Uso

```typescript
import { EnumAdapter } from '@/models/enum_adapter';

// Definir enum
enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

// Crear adapter
const statusAdapter = new EnumAdapter(OrderStatus);

// Obtener pairs
statusAdapter.getKeyValuePairs();
// [
//   { key: 'PENDING', value: 'PENDING' },
//   { key: 'CONFIRMED', value: 'CONFIRMED' },
//   ...
// ]
```

---

## 📐 Template

```vue
<template>
<div class="ListInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <!-- Botón header (trigger) -->
    <button 
        class="list-input-header" 
        @click="openOptions" 
        :id="'id-4-click-on' + metadata.propertyName" 
        :disabled="metadata.disabled.value"
    >
        <div class="list-input-container">
            <div class="label-and-value">
                <!-- Label flotante -->
                <label 
                    class="label" 
                    :class="[{active: actualOption != ''}]"
                >
                    {{ metadata.propertyName }}
                </label>
                
                <!-- Valor seleccionado -->
                <label 
                    class="value" 
                    :class="[{active: actualOption != ''}]"
                >
                    {{ actualOption }}
                </label>
            </div>
            
            <!-- Flecha (rota al abrir) -->
            <span 
                class="arrow" 
                :class="[GGCLASS, {active: droped}]"
            >
                {{ GGICONS.ARROW_UP }}
            </span>
        </div>
    </button>
    
    <!-- Dropdown body (lista de opciones) -->
    <div 
        class="list-input-body" 
        :class="[
            {enabled: droped}, 
            {'from-bottom': fromBottom}
        ]"
    >
        <div class="list-input-items-wrapper">
            <!-- Opción individual -->
            <div 
                class="list-input-item" 
                v-for="value in propertyEnumValues.getKeyValuePairs()" 
                :class="[{selected: modelValue == value.value}]"
                :key="value.key"
                @click="$emit('update:modelValue', value.value); droped = false;"
            >
                <span>{{ parseValue(value.key) }}</span>
            </div>
        </div>
    </div>
    
    <!-- Help text -->
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
    <!-- Validation messages -->
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">
            {{ message }}
        </span>
    </div>
</div>
</template>
```

---

## 🔧 Métodos Principales

### parseValue() - Formato de Texto

```typescript
parseValue(key: string): string {
    return key
        .toLowerCase()              // 'PENDING' → 'pending'
        .split('_')                 // 'order_status' → ['order', 'status']
        .map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        )  // ['Order', 'Status']
        .join(' ');                 // 'Order Status'
}
```

**Ejemplos:**
```typescript
parseValue('PENDING')          → 'Pending'
parseValue('ORDER_CONFIRMED')  → 'Order Confirmed'
parseValue('IN_PROGRESS')      → 'In Progress'
```

### openOptions() - Toggle Dropdown

```typescript
openOptions() {
    // Calcular posición del botón
    const rect = document
        .getElementById('id-4-click-on' + this.metadata.propertyName)
        ?.getBoundingClientRect();
    
    if (rect) {
        // Determinar si abrair hacia arriba o abajo
        this.fromBottom = (window.innerHeight - rect.bottom) < 300;
    }
    
    // Toggle dropdown
    this.droped = !this.droped;
}
```

**Lógica de posicionamiento:**
```
┌─────────────────────┐
│ Espacio disponible  │
│ arriba > 300px      │
│ ┌─────────────────┐ │
│ │ [Dropdown Up]   │ │  ← fromBottom = true
│ │ Option 1        │ │
│ │ Option 2        │ │
│ └─────────────────┘ │
│ ▼ Select Status ▼   │  ← Botón trigger
│                     │
│                     │
├─────────────────────┤
│ Espacio disponible  │
│ abajo < 300px       │
└─────────────────────┘
```

### handleClickOutside() - Cerrar al click externo

```typescript
handleClickOutside(event: MouseEvent) {
    if(this.droped) {
        const dropdown = this.$el;
        if (!dropdown) return;

        // Si click fue fuera del dropdown
        if (!dropdown.contains(event.target as Node)) {
            this.droped = false;
        }
    }
}
```

**Lifecycle:**
```typescript
mounted() {
    document.addEventListener('click', this.handleClickOutside);
    Application.eventBus.on('validate-inputs', this.handleValidation);
}

beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    Application.eventBus.off('validate-inputs', this.handleValidation);
}
```

---

## 🔄 Computed Property: actualOption

```typescript
computed: {
    actualOption(): String | number {
        var value = this.propertyEnumValues.getKeyValuePairs().find(
            (pair) => pair.value === this.modelValue
        )?.key || '';
        
        return this.parseValue(value);
    }
}
```

**Flujo:**
```
modelValue: 'CONFIRMED'
    ↓
Buscar en getKeyValuePairs()
    ↓
Encontrar: { key: 'CONFIRMED', value: 'CONFIRMED' }
    ↓
Extraer key: 'CONFIRMED'
    ↓
parseValue('CONFIRMED')
    ↓
actualOption: 'Confirmed'  ← Mostrado en UI
```

---

## ✅ Sistema de Validación (3 Niveles)

### Nivel 1: Required

```typescript
if (this.metadata.required.value && this.modelValue === '') {
    validated = false;
    this.validationMessages.push(
        this.metadata.requiredMessage.value || 
        `${this.metadata.propertyName} is required.`
    );
}
```

### Nivel 2: Validación Síncrona

```typescript
if (!this.metadata.validated.value) {
    validated = false;
    this.validationMessages.push(
        this.metadata.validatedMessage.value || 
        `${this.metadata.propertyName} is not valid.`
    );
}
```

### Nivel 3: Validación Asíncrona

```typescript
const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
if (!isAsyncValid) {
    validated = false;
    const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
    if (asyncMessage) {
        this.validationMessages.push(asyncMessage);
    }
}
```

---

## 🎓 Ejemplo Completo

### Definición de Enum y Entidad

```typescript
// enums/order_status.ts
export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

// entities/order.ts
import { BaseEntity } from './base_entitiy';
import { OrderStatus } from '@/enums/order_status';
import {
    PropertyName,
    PropertyIndex,
    Required,
    Validation,
    HelpText
} from '@/decorations';

export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Order Number', String)
    @Required(true)
    orderNumber!: string;
    
    @PropertyIndex(2)
    @PropertyName('Status', String)
    @Required(true, 'Status is required')
    @HelpText('Select the current order status')
    @Validation(
        (entity) => Object.values(OrderStatus).includes(entity.status),
        'Invalid status'
    )
    status!: string;
}
```

### Uso en defaultcomponente Custom

```vue
<template>
<div>
    <!-- Input normal -->
    <TextInputComponent
        :entity-class="Order"
        :entity="order"
        property-key="orderNumber"
        v-model="order.orderNumber"
    />
    
    <!-- List Input (manual) -->
    <ListInputComponent
        :entity-class="Order"
        :entity="order"
        property-key="status"
        :property-enum-values="statusEnumAdapter"
        v-model="order.status"
    />
</div>
</template>

<script lang="ts">
import { EnumAdapter } from '@/models/enum_adapter';
import { OrderStatus } from '@/enums/order_status';

export default {
    data() {
        return {
            statusEnumAdapter: new EnumAdapter(OrderStatus)
        };
    }
}
</script>
```

### UI Generada

**Estado Cerrado:**
```
┌─────────────────────────────────────┐
│ Status                              │
│ ┌───────────────────────────┬─────┐ │
│ │ Confirmed                 │  ▼  │ │
│ └───────────────────────────┴─────┘ │
└─────────────────────────────────────┘
```

**Estado Abierto:**
```
┌─────────────────────────────────────┐
│ Status                              │
│ ┌───────────────────────────┬─────┐ │
│ │ Confirmed                 │  ▲  │ │
│ └───────────────────────────┴─────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Pending                         │ │
│ │ Confirmed                    ✓  │ │  ← Seleccionado
│ │ Processing                      │ │
│ │ Shipped                         │ │
│ │ Delivered                       │ │
│ │ Cancelled                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎨 Animaciones y Transiciones

### Flecha Rotativa

```css
.list-input-container .arrow {
    transition: transform 0.3s ease;
    transform: rotate(180deg);  /* ▼ */
}
.list-input-container .arrow.active {
    transform: rotate(0deg);    /* ▲ */
}
```

### Label Flotante

```css
.label-and-value .label {
    position: absolute;
    top: 0.9rem;
    transition: 0.5s ease;
}

.label-and-value .label.active {
    background-color: var(--sky);
    font-size: 0.75rem;
    top: -1.1rem;  /* ← Sube */
    border-radius: 0.5rem;
}
```

### Dropdown Expansion

```css
.list-input-body {
    display: grid;
    grid-template-rows: 0fr;  /* Colapsado */
    transition: grid-template-rows 0.3s ease;
}

.list-input-body.enabled {
    grid-template-rows: 1fr;  /* Expandido */
}
```

---

## 💡 Buenas Prácticas

### ✅ DO:

```typescript
// Usar enums tipados
enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

// Crear adapter
const adapter = new EnumAdapter(Status);

// Validar valor contra enum
@Validation(
    (entity) => Object.values(Status).includes(entity.status),
    'Invalid status value'
)
status!: string;
```

### ❌ DON'T:

```typescript
// No usar listas hardcodeadas
const statusList = ['active', 'inactive'];  // ❌ Sin type safety

// No omitir validación de valores permitidos
@PropertyName('Status', String)  // ❌ Sin validación
status!: string;
```

---

## 🧪 Casos de Uso Comunes

### 1. Estado de Pedido

```typescript
enum OrderStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@PropertyName('Status', String)
@Required(true)
status!: string;

// En componente:
statusAdapter = new EnumAdapter(OrderStatus);
```

### 2. Prioridad

```typescript
enum Priority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    URGENT = 4
}

@PropertyName('Priority', Number)
@Required(true)
priority!: number;

// En componente:
priorityAdapter = new EnumAdapter(Priority);
```

### 3. Categoría

```typescript
enum ProductCategory {
    ELECTRONICS = 'ELECTRONICS',
    CLOTHING = 'CLOTHING',
    FOOD = 'FOOD',
    BOOKS = 'BOOKS'
}

@PropertyName('Category', String)
@Required(true)
category!: string;

categoryAdapter = new EnumAdapter(ProductCategory);
```

---

## ⚠️ Limitaciones Actuales

### 1. No se genera automáticamente

**Problema:** Requiere integración manual en cada vista.

**Workaround:** Crear wrapper component o modificar DefaultDetailView.

### 2. Posicionamiento en scrollables

**Problema:** Si el dropdown está en un contenedor con scroll, el posicionamiento puede fallar.

### 3. Búsqueda/Filtrado

**Problema:** No tiene búsqueda interna. Para listas largas (>20 items), la UX sufre.

---

## 🔗 Referencias

- **EnumAdapter:** `../../models/enum_adapter.md` (no documentado aún)
- **Validation Decorator:** `../../01-decorators/validation-decorator.md`
- **useInputMetadata:** [useInputMetadata-composable.md](useInputMetadata-composable.md)
- **Tutorial Validaciones:** `../../tutorials/02-validations.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual, con limitaciones documentadas)
