# 📊 ArrayInputComponent - Tabla Interactiva para Arrays de Entidades

**Referencias:**
- `../../tutorials/03-relations.md` - Tutorial de relaciones
- `../../03-application/ui-services.md` - ApplicationUIService
- `../../01-decorators/property-name-decorator.md` - ArrayOf decorator
- [object-input-component.md](object-input-component.md) - Selector de objeto individual

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/ArrayInputComponent.vue`  
**Tipo de propiedad:** `Array<BaseEntity>` (arrays de objetos)  
**Uso:** Relaciones 1:N entre entidades  
**Decorador:** `@ArrayOf(EntityClass)`

---

## 🎯 Propósito

Componente complejo para **gestionar listas de objetos relacionados** mediante interfaz de tabla interactiva. Implementa relaciones 1:N. Características:

- ✅ Tabla con header (icono, título, búsqueda, botones)
- ✅ Botón "Agregar" - Abre modal lookup
- ✅ Botón "Seleccionar" - Toggle modo selección
- ✅ Botón "Eliminar" - Elimina items seleccionados
- ✅ Búsqueda en tiempo real por display value
- ✅ Confirmación antes de eliminar
- ✅ Validación de required (array vacío)
- ✅ Validación personalizada (longitud mínima, etc.)

---

## 🔧 Activación Automática

El componente se genera automáticamente cuando:

```typescript
import { OrderItem } from './order_item';

@PropertyName('Items', ArrayOf(OrderItem))  // ← ArrayOf activa ArrayInputComponent
items!: Array<OrderItem>;
```

**⚠️ IMPORTANTE:** Los arrays NO usan `@PropertyIndex`. Usan `@TabOrder` para aparecer en tabs.

```typescript
@TabOrder(1)  // ← Orden del tab
@PropertyName('Order Items', ArrayOf(OrderItem))
items!: Array<OrderItem>;
```

---

## 📋 Props

```typescript
props: {
    modelValue: {
        type: Array<BaseEntity>,
        required: true,
        default: () => [],  // ← Array vacío por defecto
    },
    typeValue: {
        type: Function as unknown as PropType<typeof BaseEntity | undefined>,
        required: true,  // ← Clase de items (OrderItem)
    },
    entity: {
        type: Object as PropType<BaseEntity>,
        required: false,  // ← Entidad padre (Order)
    },
    propertyKey: {
        type: String,
        required: false,  // ← Key de la propiedad ('items')
    },
    required: {
        type: Boolean,
        required: false,
        default: false,
    },
    requireddMessage: {  // ← Typo en código original
        type: String,
        required: false,
        default: '',
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false,
    },
    validated: {
        type: Boolean,
        required: false,
        default: true,
    },
    validatedMessage: {
        type: String,
        required: false,
        default: '',
    },
}
```

**Props críticos:**
- `modelValue` - Array de objetos (OrderItem[])
- `typeValue` - Clase del item (OrderItem class)
- `entity` - Entidad padre para validaciones
- `propertyKey` - Para acceder a metadatos

---

## 📐 Template

### Header Row

```vue
<div class="table-header-row">
    <!-- Left side: Icono, título, alertas -->
    <div class="left-side-space">
        <div class="icon">
            <img :src="typeValue?.getModuleIcon()" alt="">
        </div>
        <span class="title">{{ typeValue?.getModuleName() }}</span>
        
        <!-- Alertas de validación -->
        <div class="advice" v-if="!isInputValidated">
            <div class="alert-btn">!</div>
            <div class="val-list">
                <span v-for="message in validationMessages">
                    {{ message }}
                </span>
            </div>
        </div>
    </div>

    <!-- Right side: Búsqueda, botones -->
    <div class="right-side-space">
        <!-- Input de búsqueda -->
        <div class="TextInput" style="width: 100%">
            <label class="label-input">
                Buscar {{ typeValue?.getModuleName() }}
            </label>
            <input 
                type="text" 
                class="main-input" 
                placeholder=" "
                v-model="search"
                :disabled="disabled"
            />
        </div>
        
        <!-- Botón Eliminar -->
        <button 
            class="button alert fill" 
            :disabled="selectedItems.length == 0 || disabled"
            @click="showDeleteModal"
        >
            <span :class="GGCLASS">{{ GGICONS.DELETE }}</span>
            Eliminar
        </button>
        
        <!-- Botón Seleccionar -->
        <button 
            class="button success fill" 
            @click="toggleSelection"
            :disabled="modelValue.length == 0 || disabled"
        >
            <span :class="GGCLASS">
                {{ isSelection ? GGICONS.SELECT_CHECKBOX : GGICONS.SELECT_VOID }}
            </span>
            Seleccionar
        </button>
        
        <!-- Botón Agregar -->
        <button 
            class="button secondary fill" 
            @click="openModal" 
            :disabled="disabled"
        >
            <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
            Agregar
        </button>
    </div>
</div>
```

### Table

```vue
<table class="table">
    <!-- Header -->
    <thead>
        <tr>
            <!-- Columna checkbox (solo visible en modo selección) -->
            <th class="selection" :class="[{display: isSelection}]"></th>
            
            <!-- Columnas de propiedades -->
            <th v-for="header in typeValue?.getProperties()">
                {{ header }}
            </th>
        </tr>
    </thead>
    
    <!-- Body con items -->
    <tbody>
        <tr 
            v-for="item in filteredData" 
            :class="[{selected: selectedItems.includes(item)}]"
        >
            <!-- Botón selección -->
            <td class="selection" :class="[{display: isSelection}]">
                <button 
                    class="select-btn" 
                    :class="[{added: selectedItems.includes(item)}]"
                    @click="selectedItems.includes(item) ? 
                            selectedItems.splice(selectedItems.indexOf(item), 1) : 
                            selectedItems.push(item)"
                >
                    <span :class="GGCLASS">
                        {{ selectedItems.includes(item) ? GGICONS.REMOVE : GGICONS.ADD }}
                    </span>
                </button>
            </td>
            
            <!-- Valores de propiedades -->
            <td v-for="property in item.getKeys()">
                {{ item[property] }}
            </td>
        </tr>
    </tbody>
    
    <tfoot></tfoot>
</table>
```

---

## 🔧 Métodos Principales

### openModal() - Agregar Item

```typescript
openModal() {
    Application.ApplicationUIService.showModalOnFunction(
        this.typeValue!,        // OrderItem class
        this.addSelectedElement, // Callback
        ViewTypes.LOOKUPVIEW
    );
}
```

**Flujo:**
1. Usuario click en "Agregar"
2. Modal se abre con lista de OrderItems disponibles
3. Usuario selecciona un item
4. Modal ejecuta `addSelectedElement(selectedItem)`
5. Item se agrega al array
6. Modal se cierra

### addSelectedElement() - Callback de Selección

```typescript
addSelectedElement(newElement: BaseEntity | undefined) {
    if (newElement) {
        const updatedArray = [...this.modelValue, newElement];
        this.$emit('update:modelValue', updatedArray);
    }
}
```

**⚠️ INMUTABILIDAD:**
- Crea nuevo array con spread operator: `[...this.modelValue, newElement]`
- NO modifica array original
- Vue detecta cambio correctamente

### toggleSelection() - Modo Selección

```typescript
toggleSelection() {
    this.isSelection = !this.isSelection;
    if (!this.isSelection) {
        this.selectedItems = [];  // ← Limpiar selección al desactivar
    }
}
```

**Estados:**
```
isSelection: false
├─ Botón muestra: "Seleccionar" (⬜)
├─ Columna checkboxes: Oculta
└─ selectedItems: []

isSelection: true
├─ Botón muestra: "Seleccionar" (☑)
├─ Columna checkboxes: Visible
└─ selectedItems: [...items seleccionados]
```

### showDeleteModal() - Eliminar con Confirmación

```typescript
showDeleteModal() {
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.WARNING,
        'Confirmar eliminación',
        'El elemento que esta a punto de eliminarse no podrá ser recuperado. ¿Desea continuar?',
        () => {
            // Callback de confirmación
            const updatedArray = this.modelValue.filter(
                item => !this.selectedItems.includes(item)
            );
            this.$emit('update:modelValue', updatedArray);
            this.selectedItems = [];
            this.isSelection = false;
        },
    );
}
```

**Flujo:**
```
Usuario selecciona items (checkboxes)
    ↓
Click en botón "Eliminar"
    ↓
Modal de confirmación aparece
    ↓
Usuario click en "Confirmar"
    ↓
filter() crea nuevo array sin items seleccionados
    ↓
emit update:modelValue con nuevo array
    ↓
Limpiar selectedItems
    ↓
Desactivar modo selección
    ↓
Modal se cierra
```

---

## 🔍 Búsqueda en Tiempo Real

### Computed Property: filteredData

```typescript
computed: {
    filteredData() {
        if (!this.search) {
            return this.modelValue;  // Sin filtro
        }
        
        return this.modelValue.filter(item => {
            const defaultValue = item.getDefaultPropertyValue();
            if (defaultValue && typeof defaultValue === 'string') {
                return defaultValue.toLowerCase().includes(
                    this.search.toLowerCase()
                );
            }
            return false;
        });
    }
}
```

**Funcionamiento:**
- Busca en `getDefaultPropertyValue()` de cada item
- Case-insensitive
- Match parcial (includes)

**Ejemplo:**
```typescript
// OrderItem con @DefaultProperty('productName')
items = [
    { id: 1, productName: 'Laptop HP', quantity: 2 },
    { id: 2, productName: 'Mouse Logitech', quantity: 5 },
    { id: 3, productName: 'Keyboard Razer', quantity: 1 }
];

search = 'lap'  →  Muestra: [Laptop HP]
search = 'log'  →  Muestra: [Mouse Logitech]
search = ''     →  Muestra: [todos]
```

---

## ✅ Sistema de Validación (2 Niveles)

**⚠️ NOTA:** ArrayInputComponent NO soporta validación asíncrona actualmente.

### Nivel 1: Required (Array Vacío)

```typescript
if (this.required && (!this.modelValue || this.modelValue.length === 0)) {
    this.validationMessages.push(
        this.requireddMessage || 
        `${this.typeValue?.getModuleName()} is required.`
    );
}
```

**Validación:**
- Array `null` o `undefined` → Error
- Array vacío `[]` → Error
- Array con items → Válido ✓

### Nivel 2: Validación Síncrona (Custom)

```typescript
if (this.entity && this.propertyKey) {
    const isValid = this.entity.isValidation(this.propertyKey);
    if (!isValid) {
        const validationMsg = this.entity.validationMessage(this.propertyKey);
        this.validationMessages.push(
            validationMsg || 
            `${this.typeValue?.getModuleName()} is not valid.`
        );
    }
}
```

**Ejemplo: Validar longitud mínima**
```typescript
@Validation(
    (entity) => entity.items.length >= 2,
    'Order must have at least 2 items'
)
items!: Array<OrderItem>;
```

**Ejemplo: Validar total mínimo**
```typescript
@Validation(
    (entity) => {
        const total = entity.items.reduce(
            (sum, item) => sum + (item.quantity * item.unitPrice), 
            0
        );
        return total >= 100;
    },
    'Order total must be at least $100'
)
items!: Array<OrderItem>;
```

---

## 🎓 Ejemplo Completo

### Definición de Entidades

```typescript
// entities/order_item.ts
import { BaseEntity } from './base_entitiy';
import {
    PropertyName,
    PropertyIndex,
    Required,
    ModuleName,
    ModuleIcon,
    ApiEndpoint,
    Persistent,
    DefaultProperty,
    UniquePropertyKey
} from '@/decorations';
import ICONS from '@/constants/icons';

@DefaultProperty('productName')  // ← Mostrado en búsqueda
@UniquePropertyKey('id')
@ModuleName('Order Items')
@ModuleIcon(ICONS.LIST)
@ApiEndpoint('/api/order-items')
@Persistent()
export class OrderItem extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Product Name', String)
    @Required(true)
    productName!: string;  // ← Usado en búsqueda
    
    @PropertyIndex(3)
    @PropertyName('Quantity', Number)
    @Required(true)
    quantity!: number;
    
    @PropertyIndex(4)
    @PropertyName('Unit Price', Number)
    @Required(true)
    unitPrice!: number;
}

// entities/order.ts
import { BaseEntity } from './base_entitiy';
import { OrderItem } from './order_item';
import {
    PropertyName,
    PropertyIndex,
    Required,
    TabOrder,
    Validation,
    ArrayOf
} from '@/decorations';

export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Order Number', String)
    @Required(true)
    orderNumber!: string;
    
    @TabOrder(1)  // ← Aparece en tab #1
    @PropertyName('Order Items', ArrayOf(OrderItem))  // ← Genera ArrayInputComponent
    @Required(true, 'Order must have items')
    @Validation(
        (entity) => entity.items.length >= 1,
        'Order must have at least 1 item'
    )
    @Validation(
        (entity) => {
            const total = entity.items.reduce(
                (sum, item) => sum + (item.quantity * item.unitPrice), 
                0
            );
            return total > 0;
        },
        'Order total must be greater than $0'
    )
    items!: Array<OrderItem>;
}
```

### UI Generada

**Vista de Tab:**

```
┌─────────────────────────────────────────────────────┐
│ Order Details                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Order Number: [ORD-001]                         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Tabs:                                               │
│ ┌──────────────┬─────────────────────────────────┐ │
│ │ Order Items  │                                 │ │  ← Tab activo
│ ├──────────────┴─────────────────────────────────┤ │
│ │                                                 │ │
│ │ [Vista de ArrayInputComponent abajo]            │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**ArrayInputComponent:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Order Items      [Buscar: _______] [Agregar] [Seleccionar] [Eliminar] │
├─────────────────────────────────────────────────────────────┤
│ ID │ Product Name  │ Quantity │ Unit Price │ Total        │
├────┼───────────────┼──────────┼────────────┼──────────────┤
│ 1  │ Laptop HP     │ 2        │ $800.00    │ $1,600.00    │
│ 2  │ Mouse Logitech│ 5        │ $25.00     │ $125.00      │
│ 3  │ Keyboard Razer│ 1        │ $150.00    │ $150.00      │
└─────────────────────────────────────────────────────────────┘
```

**Modo Selección Activo:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Order Items      [Buscar: _______] [Agregar] [☑ Seleccionar] [Eliminar ✓] │
├─────────────────────────────────────────────────────────────┤
│   │ ID │ Product Name  │ Quantity │ Unit Price │ Total     │
├───┼────┼───────────────┼──────────┼────────────┼───────────┤
│ + │ 1  │ Laptop HP     │ 2        │ $800.00    │ $1,600.00 │  ← No seleccionado
│ - │ 2  │ Mouse Logitech│ 5        │ $25.00     │ $125.00   │  ← Seleccionado
│ - │ 3  │ Keyboard Razer│ 1        │ $150.00    │ $150.00   │  ← Seleccionado
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Buenas Prácticas

### ✅ DO:

```typescript
// Usar @TabOrder para arrays
@TabOrder(1)
@PropertyName('Items', ArrayOf(OrderItem))
items!: Array<OrderItem>;

// Validar longitud mínima
@Validation(
    (entity) => entity.items.length >= 1,
    'Must have at least 1 item'
)
items!: Array<OrderItem>;

// Usar @DefaultProperty en items para búsqueda
@DefaultProperty('productName')
export class OrderItem extends BaseEntity {
    productName!: string;
}

// Registrar ambas entidades
Application.ModuleList.value.push(Order, OrderItem);
```

### ❌ DON'T:

```typescript
// No usar @PropertyIndex para arrays
@PropertyIndex(1)  // ❌ No funciona para arrays
items!: Array<OrderItem>;

// No omitir @TabOrder
@PropertyName('Items', ArrayOf(OrderItem))  // ❌ No aparecerá
items!: Array<OrderItem>;

// No olvidar @DefaultProperty en items
export class OrderItem extends BaseEntity {  // ❌ Búsqueda no funciona
    productName!: string;
}

// No olvidar registrar entidad de items
Application.ModuleList.value.push(Order); // ❌ OrderItem falta
```

---

## 🧪 Casos de Uso Comunes

### 1. Order → OrderItems

```typescript
@TabOrder(1)
@PropertyName('Order Items', ArrayOf(OrderItem))
@Required(true)
@Validation(
    (entity) => entity.items.length >= 1,
    'Order must have items'
)
items!: Array<OrderItem>;
```

### 2. Invoice → InvoiceLines

```typescript
@TabOrder(1)
@PropertyName('Invoice Lines', ArrayOf(InvoiceLine))
@Required(true)
@Validation(
    (entity) => {
        const total = entity.lines.reduce((sum, line) => sum + line.amount, 0);
        return total > 0;
    },
    'Invoice total must be greater than $0'
)
lines!: Array<InvoiceLine>;
```

### 3. Project → TeamMembers (Opcional)

```typescript
@TabOrder(2)
@PropertyName('Team Members', ArrayOf(Employee))
@Required(false)
teamMembers?: Array<Employee>;
```

---

## ⚠️ Limitaciones Actuales

### 1. No hay paginación

**Problema:** Todos los items se cargan y renderizan. Con >100 items, hay lag.

**Impacto:** Performance degradada.

### 2. No hay edición inline

**Problema:** Solo agregar/eliminar. No puedes editar quantity directamente en tabla.

**Workaround:** Usuario debe eliminar item y agregar uno nuevo con valores correctos.

### 3. No hay validación asíncrona

**Problema:** `isValidated()` no es async, no ejecuta `isAsyncValidation()`.

### 4. No hay ordenamiento

**Problema:** No puedes ordenar columnas (sort).

### 5. Búsqueda limitada

**Problema:** Solo busca en `getDefaultPropertyValue()`, no en todas las propiedades.

---

## 🔗 Referencias

- **Tutorial Relaciones:** `../../tutorials/03-relations.md`
- **ObjectInputComponent:** [object-input-component.md](object-input-component.md) - Para relaciones 1:1
- **ArrayOf Decorator:** `../../01-decorators/property-name-decorator.md`
- **TabOrder Decorator:** `../../01-decorators/tab-order-decorator.md`
- **UI Services:** `../../03-application/ui-services.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual, con limitaciones documentadas)
