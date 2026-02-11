# 📘 Tutorial 3: Sistema de Relaciones (Objetos y Arrays)

**Referencias:**
- `01-basic-crud.md` - Tutorial básico
- `02-validations.md` - Validaciones
- `../layers/04-components/ObjectInputComponent.md` - Input de objetos (cuando exista)
- `../layers/04-components/ArrayInputComponent.md` - Input de arrays (cuando exista)

---

## 🎯 Objetivo

Aprender a trabajar con **relaciones entre entidades** usando los componentes especializados del framework:

- ✅ Objetos anidados (`ObjectInputComponent`)
- ✅ Arrays de entidades (`ArrayInputComponent`)
- ✅ Lookups y selección en modales
- ✅ Validaciones en relaciones

**Tiempo estimado:** 30-45 minutos

---

## 📋 Requisitos Previos

- Tutorial 1 completado (CRUD básico)
- Entender decoradores básicos
- Familiaridad con TypeScript

---

## 🏗️ Arquitectura de Relaciones

### Tipos de Relaciones Soportados

| Tipo | Decorador | Componente | Uso |
|------|----------|------------|-----|
| **Objeto 1:1** | `@PropertyName('Name', EntityClass)` | ObjectInputComponent | Un objeto relacionado |
| **Array 1:N** | `@PropertyName('Items', ArrayOf(EntityClass))` | ArrayInputComponent | Lista de objetos |

**Nota:** El framework NO soporta actualmente relaciones N:N directas. Se implementan mediante arrays.

---

## 🚀 Parte 1: Relación 1:1 (Objeto Anidado)

### Escenario
Crear un sistema de **Orders** donde cada orden tiene un **Customer** asociado.

### Paso 1: Entidad Customer

Crea `src/entities/customer.ts`:

```typescript
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
    UniquePropertyKey,
    StringTypeDef
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import ICONS from '@/constants/icons';

@DefaultProperty('name')
@UniquePropertyKey('id')
@ModuleName('Customers')
@ModuleIcon(ICONS.USERS)
@ApiEndpoint('/api/customers')
@Persistent()
export class Customer extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Customer Name', String)
    @Required(true)
    name!: string;
    
    @PropertyIndex(3)
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    email!: string;
}
```

**Puntos clave:**
- `@DefaultProperty('name')` - Define qué propiedad mostrar en lookups
- `@UniquePropertyKey('id')` - Define identificador único

### Paso 2: Entidad Order con Relación

Crea `src/entities/order.ts`:

```typescript
import { BaseEntity } from './base_entitiy';
import { Customer } from './customer';
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

@DefaultProperty('orderNumber')
@UniquePropertyKey('id')
@ModuleName('Orders')
@ModuleIcon(ICONS.ORDERS)
@ApiEndpoint('/api/orders')
@Persistent()
export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Order Number', String)
    @Required(true)
    orderNumber!: string;
    
    @PropertyIndex(3)
    @PropertyName('Customer', Customer)  // ← RELACIÓN
    @Required(true)
    customer!: Customer;
    
    @PropertyIndex(4)
    @PropertyName('Total Amount', Number)
    @Required(true)
    totalAmount!: number;
}
```

**Observa:**
```typescript
@PropertyName('Customer', Customer)
customer!: Customer;
```

- **Tipo:** `Customer` (no `String` ni `Number`)
- **Genera:** `ObjectInputComponent` automáticamente

### Paso 3: Registrar Módulos

En `src/models/application.ts`:

```typescript
import { Customer } from '@/entities/customer';
import { Order } from '@/entities/order';

Application.ModuleList.value.push(Customer, Order);
```

### Paso 4: Probar Funcionalidad

1. **Navega a Orders**
2. **Click "New"**
3. **Verás el input de Customer:**

```
┌─────────────────────────────────────┐
│ Customer                            │
│ ┌──────────────────┬───┐           │
│ │ [Nombre cliente] │ 🔍 │          │
│ └──────────────────┴───┘           │
└─────────────────────────────────────┘
```

4. **Click en botón 🔍 (lupa)**
5. **Se abre modal con lista de Customers**
6. **Click en un customer**
7. **Modal se cierra**
8. **Input muestra nombre del customer seleccionado**

---

## 🔧 Cómo Funciona ObjectInputComponent

### Template

```vue
<div class="ObjectInput">
    <label>{{ metadata.propertyName }}</label>
    
    <!-- Input readonly -->
    <input 
        type="text" 
        :value="modelValue?.getDefaultPropertyValue()"
        readonly
    />
    
    <!-- Botón de búsqueda -->
    <button @click="openLookup">
        <span>🔍</span>
    </button>
</div>
```

### Método openLookup()

```typescript
methods: {
    openLookup() {
        Application.ApplicationUIService.showModalOnFunction(
            this.modelType,      // Customer class
            this.setNewValue,    // Callback
            ViewTypes.LOOKUPVIEW // Tipo de modal
        );
    },
    
    setNewValue(newValue: BaseEntity | undefined) {
        this.$emit('update:modelValue', newValue);
    }
}
```

### Flujo Completo

```
1. Usuario click en botón 🔍
    ↓
2. showModalOnFunction(Customer, callback, LOOKUPVIEW)
    ↓
3. Modal se abre con default_lookup_listview.vue
    ↓
4. Tabla muestra lista de Customers
    ↓
5. Usuario click en un customer
    ↓
6. callback(selectedCustomer) ejecuta
    ↓
7. setNewValue() emite update:modelValue
    ↓
8. v-model actualiza order.customer
    ↓
9. Modal se cierra
    ↓
10. Input muestra customer.name (getDefaultPropertyValue())
```

---

## 🚀 Parte 2: Relación 1:N (Arrays)

### Escenario
Agregar **OrderItems** a cada Order (líneas del pedido).

### Paso 1: Entidad OrderItem

Crea `src/entities/order_item.ts`:

```typescript
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

@DefaultProperty('productName')
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
    productName!: string;
    
    @PropertyIndex(3)
    @PropertyName('Quantity', Number)
    @Required(true)
    quantity!: number;
    
    @PropertyIndex(4)
    @PropertyName('Unit Price', Number)
    @Required(true)
    unitPrice!: number;
}
```

### Paso 2: Agregar Array a Order

Modifica `src/entities/order.ts`:

```typescript
import {
    // ... imports anteriores
    ArrayOf,
    TabOrder,
    Validation
} from '@/decorations';
import { OrderItem } from './order_item';

export class Order extends BaseEntity {
    // ... propiedades anteriores ...
    
    @TabOrder(1)
    @PropertyName('Order Items', ArrayOf(OrderItem))
    @Required(true)
    @Validation(
        (entity) => entity.items?.length > 0, 
        'Order must have at least one item'
    )
    items!: Array<OrderItem>;
}
```

**Observa:**
```typescript
@TabOrder(1)  // ← Orden del tab
@PropertyName('Order Items', ArrayOf(OrderItem))  // ← Decorador especial
items!: Array<OrderItem>;
```

### Paso 3: Registrar OrderItem

```typescript
import { OrderItem } from '@/entities/order_item';

Application.ModuleList.value.push(Customer, Order, OrderItem);
```

### Paso 4: Probar Funcionalidad

1. **Navega a Orders**
2. **Click "New"**
3. **Scroll hasta abajo**
4. **Verás Tab "Order Items"**
5. **Click en el tab**

**Interfaz generada:**

```
┌─────────────────────────────────────────────┐
│ 🔍 Buscar Order Items     [Agregar] [...]  │
├─────────────────────────────────────────────┤
│ ID │ Product Name │ Quantity │ Unit Price  │
├────┼──────────────┼──────────┼────────────┤
│    │ (vacío)      │          │             │
└─────────────────────────────────────────────┘
```

6. **Click en "Agregar"**
7. **Modal se abre con lista de OrderItems**
8. **Selecciona un item**
9. **Item aparece en la tabla**
10. **Repite para agregar más items**

### Eliminar Items

1. **Click en "Seleccionar"** (botón aparece si hay items)
2. **Checkboxes aparecen en filas**
3. **Selecciona items a eliminar**
4. **Click en "Eliminar"**
5. **Modal de confirmación aparece**
6. **Confirmar → Items eliminados**

---

## 🔧 Cómo Funciona ArrayInputComponent

### Template Simplificado

```vue
<div class="ArrayInput">
    <!-- Header con búsqueda y botones -->
    <div class="header">
        <input v-model="search" placeholder="Buscar..." />
        <button @click="showDeleteModal">Eliminar</button>
        <button @click="toggleSelection">Seleccionar</button>
        <button @click="openModal">Agregar</button>
    </div>
    
    <!-- Tabla con items -->
    <table>
        <thead>
            <tr>
                <th v-if="isSelection"></th>  <!-- Checkbox column -->
                <th v-for="header">{{ header }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in filteredData">
                <td v-if="isSelection">
                    <button @click="toggleItemSelection(item)">
                        {{ selected ? '-' : '+' }}
                    </button>
                </td>
                <td v-for="property">{{ item[property] }}</td>
            </tr>
        </tbody>
    </table>
</div>
```

### Métodos Principales

#### openModal()

```typescript
openModal() {
    Application.ApplicationUIService.showModalOnFunction(
        this.typeValue,           // OrderItem class
        this.addSelectedElement,  // Callback
        ViewTypes.LOOKUPVIEW
    );
}
```

#### addSelectedElement()

```typescript
addSelectedElement(newElement: BaseEntity | undefined) {
    if (newElement) {
        const updatedArray = [...this.modelValue, newElement];
        this.$emit('update:modelValue', updatedArray);
    }
}
```

#### showDeleteModal()

```typescript
showDeleteModal() {
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.WARNING,
        'Confirmar eliminación',
        '¿Desea continuar?',
        () => {
            const updatedArray = this.modelValue.filter(
                item => !this.selectedItems.includes(item)
            );
            this.$emit('update:modelValue', updatedArray);
            this.selectedItems = [];
        }
    );
}
```

### Búsqueda en Array

```typescript
computed: {
    filteredData() {
        if (!this.search) {
            return this.modelValue;
        }
        return this.modelValue.filter(item => {
            // Busca en todas las propiedades
            return Object.values(item).some(val => 
                String(val).toLowerCase().includes(this.search.toLowerCase())
            );
        });
    }
}
```

---

## ✅ Validaciones en Relaciones

### Validar Objeto Required

```typescript
@PropertyName('Customer', Customer)
@Required(true, 'Customer is required')
customer!: Customer;
```

**Comportamiento:**
- Si customer es `null`, `undefined` o `EmptyEntity` → Error
- Input muestra mensaje: "Customer is required"

### Validar Array Mínimo de Items

```typescript
@PropertyName('Items', ArrayOf(OrderItem))
@Required(true)
@Validation(
    (entity) => entity.items?.length >= 2,
    'Order must have at least 2 items'
)
items!: Array<OrderItem>;
```

**Comportamiento:**
- Si `items.length < 2` → Error
- Tab muestra indicador de error (!)
- Formulario no se puede guardar

### Validación Asíncrona en Relaciones

```typescript
@PropertyName('Customer', Customer)
@Required(true)
@AsyncValidation(
    async (entity) => {
        // Verificar que customer tenga crédito disponible
        const hasCredit = await checkCustomerCredit(entity.customer.id);
        return hasCredit;
    },
    'Customer has no available credit'
)
customer!: Customer;
```

---

## 🎓 Ejemplo Completo: Sistema de Orders

### order.ts (Completo)

```typescript
import { BaseEntity } from './base_entitiy';
import { Customer } from './customer';
import { OrderItem } from './order_item';
import {
    PropertyName,
    PropertyIndex,
    Required,
    ModuleName,
    ModuleIcon,
    ApiEndpoint,
    Persistent,
    DefaultProperty,
    UniquePropertyKey,
    ArrayOf,
    TabOrder,
    Validation,
    ViewGroup,
    DisplayFormat
} from '@/decorations';
import ICONS from '@/constants/icons';

@DefaultProperty('orderNumber')
@UniquePropertyKey('id')
@ModuleName('Orders')
@ModuleIcon(ICONS.ORDERS)
@ApiEndpoint('/api/orders')
@Persistent()
export class Order extends BaseEntity {
    @ViewGroup('Basic Information')
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    @ViewGroup('Basic Information')
    @PropertyIndex(2)
    @PropertyName('Order Number', String)
    @Required(true)
    orderNumber!: string;
    
    @ViewGroup('Customer Information')
    @PropertyIndex(3)
    @PropertyName('Customer', Customer)
    @Required(true, 'Customer is required')
    customer!: Customer;
    
    @ViewGroup('Financial')
    @PropertyIndex(4)
    @PropertyName('Subtotal', Number)
    @DisplayFormat((e) => `$${e.subtotal?.toFixed(2) || '0.00'}`)
    subtotal!: number;
    
    @ViewGroup('Financial')
    @PropertyIndex(5)
    @PropertyName('Tax', Number)
    @DisplayFormat((e) => `$${e.tax?.toFixed(2) || '0.00'}`)
    tax!: number;
    
    @ViewGroup('Financial')
    @PropertyIndex(6)
    @PropertyName('Total Amount', Number)
    @DisplayFormat((e) => `$${e.totalAmount?.toFixed(2) || '0.00'}`)
    @Required(true)
    totalAmount!: number;
    
    // Array en tab
    @TabOrder(1)
    @PropertyName('Order Items', ArrayOf(OrderItem))
    @Required(true)
    @Validation(
        (entity) => entity.items?.length > 0, 
        'Order must have at least one item'
    )
    items!: Array<OrderItem>;
}
```

### Resultado Visual

```
┌─────────────────────────────────────────┐
│ Basic Information                       │
│ ┌─────────────────────────────────────┐│
│ ││ Order Number: [____________]       ││
│ │└─────────────────────────────────────┘│
│                                         │
│ Customer Information                    │
│ ┌─────────────────────────────────────┐│
│ ││ Customer: [John Doe      ] [🔍]   ││
│ │└─────────────────────────────────────┘│
│                                         │
│ Financial                               │
│ ┌─────────────────────────────────────┐│
│ ││ Subtotal:  $100.00                 ││
│ ││ Tax:       $8.00                   ││
│ ││ Total:     $108.00                 ││
│ │└─────────────────────────────────────┘│
│                                         │
│ Tabs                                    │
│ ┌──────────────┬─────────────────────┐ │
│ ││ Order Items │                     │ │
│ ├──────────────┴─────────────────────┤ │
│ ││  [Tabla con items]                │ │
│ │└──────────────────────────────────┘│ │
└─────────────────────────────────────────┘
```

---

## 📝 Notas Importantes

### Limitaciones Actuales

1. **No hay lazy loading:** Arrays cargan todos los items al abrir
2. **No hay paginación:** En arrays grandes puede ser lento
3. **Búsqueda simple:** Solo texto, sin filtros avanzados
4. **No hay edición inline:** Solo agregar/eliminar, no editar en tabla
5. **Lookups sin filtros:** Modal muestra todos los registros

### Buenas Prácticas

✅ **DO:**
- Usar `@DefaultProperty` para definir qué mostrar en lookups
- Usar `@TabOrder` para ordenar tabs de arrays
- Validar longitud mínima de arrays importantes
- Usar `@ViewGroup` para organizar objetos relacionados

❌ **DON'T:**
- No usar arrays grandes (>100 items) sin considerar performance
- No omitir validaciones required en relaciones críticas
- No olvidar registrar todas las entidades en ModuleList
- No usar relaciones circulares (A → B → A)

---

## 🔧 Troubleshooting

### "Cannot read property 'getDefaultPropertyValue' of undefined"

**Causa:** Objeto relacionado no inicializado  
**Solución:**
```typescript
// Opción 1: Valor default en constructor
constructor(data: any) {
    super(data);
    this.customer = data.customer || new EmptyEntity({});
}

// Opción 2: Nullable
customer?: Customer;
```

### Array no se muestra en formulario

**Causa:** Falta decorador `@TabOrder`  
**Solución:**
```typescript
@TabOrder(1)
@PropertyName('Items', ArrayOf(OrderItem))
items!: Array<OrderItem>;
```

### Modal de lookup vacío

**Causa:** Entidad no registrada en ModuleList  
**Solución:**
```typescript
Application.ModuleList.value.push(Customer);
```

---

## 🔗 Referencias

- **ObjectInputComponent:** `../layers/04-components/object-input-component.md` (futura)
- **ArrayInputComponent:** `../layers/04-components/array-input-component.md` (futura)
- **ArrayOf Decorator:** `../layers/01-decorators/` (no documentado aún)
- **Lookup View:** `../layers/04-components/views-overview.md`
- **Validation:** `02-validations.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual)
