# Tutorial 3: Sistema de Relaciones entre Entidades

## 1. Propósito

Este tutorial proporciona instrucciones completas para implementar relaciones entre entidades utilizando los componentes especializados del framework. El desarrollador aprenderá a trabajar con objetos anidados y arrays de entidades para crear estructuras de datos complejas.

### Objetivos de Aprendizaje

El desarrollador implementará:
- Relaciones uno a uno mediante objetos anidados (ObjectInputComponent)
- Relaciones uno a muchos mediante arrays de entidades (ArrayInputComponent)
- Sistema de lookups y selección modal de entidades
- Validaciones en propiedades relacionadas
- Gestión de entidades relacionadas en formularios

Duración estimada de implementación: 30-45 minutos

## 2. Alcance

### Incluye

- Definición de relaciones 1:1 con objetos anidados
- Definición de relaciones 1:N con arrays de entidades
- Configuración de DefaultProperty para lookups
- Implementación de UniquePropertyKey para identificación
- Sistema de búsqueda y selección modal (LOOKUPVIEW)
- Validaciones Required en relaciones
- Validaciones de longitud en arrays

### No Incluye

- Relaciones N:N directas (muchos a muchos)
- Lazy loading de entidades relacionadas
- Paginación de arrays grandes (>100 items)
- Edición inline en ArrayInputComponent
- Filtros avanzados en lookups
- Cascading saves automáticos
- Gestión de relaciones circulares

## 3. Definiciones Clave

### Términos Fundamentales

**Relación 1:1 (Uno a Uno)**: Asociación donde una entidad contiene referencia a exactamente una instancia de otra entidad. Implementada con ObjectInputComponent.

**Relación 1:N (Uno a Muchos)**: Asociación donde una entidad contiene array de instancias de otra entidad. Implementada con ArrayInputComponent.

**ObjectInputComponent**: Componente especializado para renderizar y gestionar propiedades que contienen objetos (instancias de BaseEntity).

**ArrayInputComponent**: Componente especializado para renderizar y gestionar propiedades que contienen arrays de objetos (instancias de BaseEntity).

**DefaultProperty**: Decorador que define qué propiedad de una entidad se muestra en lookups y representaciones textuales. Ejemplo: customer.name.

**UniquePropertyKey**: Decorador que define la propiedad que actúa como identificador único de la entidad, típicamente 'id'.

**Lookup**: Modal que muestra lista de entidades disponibles para selección. Utiliza default_lookup_listview.vue.

**ArrayOf(Class)**: Función helper que indica que una propiedad es array de instancias de una clase específica.

**TabOrder**: Decorador que define el orden de aparición de tabs en formularios cuando propiedades son arrays.

## 4. Descripción Técnica

### Arquitectura de Relaciones

El framework detecta automáticamente el tipo de relación basándose en el tipo especificado en @PropertyName y renderiza el componente apropiado.

### Relación 1:1 (Objeto Anidado)

**Declaración:**
```typescript
@PropertyName('Customer', Customer)
customer!: Customer;
```

**Componente Generado:** ObjectInputComponent

**Características:**
- Input readonly que muestra valor de DefaultProperty
- Botón de búsqueda (icono lupa) que abre modal
- Modal muestra lista de entidades disponibles mediante LOOKUPVIEW
- Selección actualiza v-model con entidad seleccionada
- Método getDefaultPropertyValue() extrae texto a mostrar

**Metadata Utilizada:**
- `propertyType`: Class reference (Customer)
- `propertyName`: String para label
- Lectura de @DefaultProperty de la clase relacionada
- Lectura de @UniquePropertyKey para identificación

### Relación 1:N (Array de Entidades)

**Declaración:**
```typescript
@TabOrder(1)
@PropertyName('Order Items', ArrayOf(OrderItem))
items!: Array<OrderItem>;
```

**Componente Generado:** ArrayInputComponent

**Características:**
- Renderizado como tab en formulario
- Tabla que muestra items del array
- Búsqueda local por texto
- Botón "Agregar" que abre modal lookup
- Modo selección con checkboxes para eliminación múltiple
- Botón "Eliminar" para remover items seleccionados

**Metadata Utilizada:**
- `propertyType`: ArrayOf result (contiene Class reference)
- `tabOrder`: Número para ordenar tabs
- Lectura de metadata de clase contenida para columnas

### Sistema de Lookups

**Funcionamiento:**
```
Usuario click botón búsqueda/agregar
    ↓
showModalOnFunction(ClassType, callback, ViewTypes.LOOKUPVIEW)
    ↓
Modal se abre con default_lookup_listview.vue
    ↓
Lista muestra todas instancias de ClassType
    │
    ├─ Obtiene lista mediante ClassType.getElementList()
    ├─ Renderiza tabla con propiedades según PropertyIndex
    └─ Usuario filtra y busca
    ↓
Usuario click en un item
    ↓
callback(selectedItem) ejecuta
    │
    ├─ ObjectInput: Actualiza v-model con entidad seleccionada
    └─ ArrayInput: Agrega entidad a array
    ↓
Modal se cierra automáticamente
    ↓
UI se actualiza mostrando selección
```

### DefaultProperty y getDefaultPropertyValue()

**Configuración:**
```typescript
@DefaultProperty('name')
export class Customer extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
}
```

**Uso:**
```typescript
const customer = new Customer({ id: 1, name: 'John Doe' });
customer.getDefaultPropertyValue(); // Retorna: "John Doe"
```

**Aplicación:**
- ObjectInputComponent muestra este valor en input readonly
- ArrayInputComponent puede usar para columna principal
- ToString representation de la entidad

### UniquePropertyKey

**Configuración:**
```typescript
@UniquePropertyKey('id')
export class Customer extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
}
```

**Uso:**
- Identifica instancias únicas en arrays
- Soporta operaciones de agregar/eliminar sin duplicados
- Facilita serialización y deserialización

## 5. Flujo de Funcionamiento

### Flujo de Selección en ObjectInputComponent

```
Usuario en formulario ve ObjectInput
    ↓
    [Customer: [John Doe           ] [🔍]]
    ↓
Click botón lupa (🔍)
    ↓
openLookup() ejecuta
    ↓
Application.ApplicationUIService.showModalOnFunction(
    Customer,              // Tipo de entidad
    setNewValue,           // Callback
    ViewTypes.LOOKUPVIEW   // Tipo de modal
)
    ↓
Modal se renderiza con default_lookup_listview.vue
    ↓
ComponentContainerComponent carga vista
    ↓
Lista se pobla con Customer.getElementList()
    │
    ├─ GET /api/customers ejecuta
    ├─ Response deserializa a instancias Customer
    └─ Tabla renderiza con columnas según metadata
    ↓
Usuario ve tabla de customers disponibles:
    
    ┌────────────────────────────────────┐
    │ ID │ Name        │ Email          │
    ├────┼─────────────┼────────────────┤
    │ 1  │ John Doe    │ john@email.com │
    │ 2  │ Jane Smith  │ jane@email.com │
    └────────────────────────────────────┘
    ↓
Usuario click en fila (John Doe)
    ↓
callback(selectedCustomer) ejecuta
    ↓
setNewValue(newValue: Customer) {
    this.$emit('update:modelValue', newValue);
}
    ↓
v-model actualiza en formulario:
order.customer = selectedCustomer instance
    ↓
Modal se cierra
    ↓
ObjectInput renderiza con nuevo valor:
    [Customer: [John Doe           ] [🔍]]
```

### Flujo de Agregar Item en ArrayInputComponent

```
Usuario en tab "Order Items"
    ↓
Tabla vacía o con items existentes:
    
    ┌────────────────────────────────────────┐
    │ [Buscar...] [Agregar] [Seleccionar]    │
    ├────┬──────────────┬─────────┬─────────┤
    │ ID │ Product Name │ Quantity│ Price   │
    ├────┼──────────────┼─────────┼─────────┤
    │  1 │ Widget A     │ 5       │ $10.00  │
    └────┴──────────────┴─────────┴─────────┘
    ↓
Click botón [Agregar]
    ↓
openModal() ejecuta
    ↓
Application.ApplicationUIService.showModalOnFunction(
    OrderItem,             // Tipo de entidad
    addSelectedElement,    // Callback
    ViewTypes.LOOKUPVIEW
)
    ↓
Modal muestra lista de OrderItems disponibles
    ↓
Usuario selecciona "Widget B"
    ↓
addSelectedElement(newElement: OrderItem) ejecuta
    ↓
const updatedArray = [...this.modelValue, newElement];
this.$emit('update:modelValue', updatedArray);
    ↓
Array en entidad actualiza:
order.items = [...order.items, selectedItem]
    ↓
Modal se cierra
    ↓
Tabla re-renderiza con nuevo item:
    
    ├────┼──────────────┼─────────┼─────────┤
    │  1 │ Widget A     │ 5       │ $10.00  │
    │  2 │ Widget B     │ 3       │ $15.00  │ ← NUEVO
    └────┴──────────────┴─────────┴─────────┘
```

### Flujo de Eliminar Items en ArrayInputComponent

```
Usuario en tab con items
    ↓
Click botón [Seleccionar]
    ↓
toggleSelection() ejecuta
    ├─ isSelection.value = true
    └─ Checkboxes aparecen en primera columna
    ↓
    ┌─┬────┬──────────────┬─────────┬─────────┐
    │☐│ ID │ Product Name │ Quantity│ Price   │
    ├─┼────┼──────────────┼─────────┼─────────┤
    │☐│  1 │ Widget A     │ 5       │ $10.00  │
    │☐│  2 │ Widget B     │ 3       │ $15.00  │
    └─┴────┴──────────────┴─────────┴─────────┘
    ↓
Usuario click checkboxes (Widget A)
    ↓
toggleItemSelection(item) ejecuta
    ├─ selectedItems.value.push(item)
    └─ Checkbox marca como seleccionado
    ↓
    │☑│  1 │ Widget A     │ 5       │ $10.00  │ ← SELECCIONADO
    │☐│  2 │ Widget B     │ 3       │ $15.00  │
    ↓
Click botón [Eliminar] (ahora visible)
    ↓
showDeleteModal() ejecuta
    ↓
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,
    'Confirmar eliminación',
    '¿Desea continuar?',
    confirmCallback
)
    ↓
Modal de confirmación aparece
    ↓
Usuario click [Confirmar]
    ↓
confirmCallback ejecuta:
const updatedArray = this.modelValue.filter(
    item => !this.selectedItems.includes(item)
);
this.$emit('update:modelValue', updatedArray);
    ↓
Array actualiza removiendo seleccionados:
order.items = order.items.filter(item => item.id !== 1)
    ↓
Tabla re-renderiza sin items eliminados:
    
    ├────┼──────────────┼─────────┼─────────┤
    │  2 │ Widget B     │ 3       │ $15.00  │
    └────┴──────────────┴─────────┴─────────┘
```

### Flujo de Búsqueda Local en ArrayInputComponent

```
Usuario ingresa texto en campo de búsqueda
    ↓
v-model actualiza: search.value = "widget"
    ↓
computed filteredData() re-evalúa:
    │
    └─ return modelValue.filter(item => {
           return Object.values(item).some(val => 
               String(val).toLowerCase().includes(search.toLowerCase())
           );
       });
    ↓
Vue re-renderiza tabla con items filtrados
    ↓
Solo items que contienen "widget" en cualquier propiedad se muestran
```

## 6. Reglas Obligatorias

### Reglas de Definición de Relaciones

1. Toda entidad relacionada DEBE extender BaseEntity.
2. Toda entidad relacionada DEBE tener @ModuleName, @ApiEndpoint, @Persistent.
3. Toda entidad relacionada DEBE definir @DefaultProperty.
4. Toda entidad relacionada DEBE definir @UniquePropertyKey.
5. Las relaciones 1:1 DEBEN usar tipo directo de clase: `customer!: Customer`.
6. Las relaciones 1:N DEBEN usar ArrayOf helper: `items!: Array<OrderItem>` con @PropertyName decorator especificando ArrayOf(OrderItem).
7. PropiedadesLas propiedades de array DEBEN tener @TabOrder para renderizado correcto.

### Reglas de Registro

1. TODAS las entidades relacionadas DEBEN registrarse en Application.ModuleList.
2. El orden de registro NO afecta las relaciones.
3. Entidades solo usadas como relaciones (sin módulo propio) AÚN deben registrarse.

### Reglas de Lookups

1. El lookup mostrará TODAS las instancias disponibles mediante getElementList().
2. NO hay paginación automática en lookups.
3. NO hay filtros automáticos en lookups más allá de búsqueda textual.
4. El callback DEBE aceptar entidad completa, no solo ID.

### Reglas de Validación en Relaciones

1. @Required en objeto: Valida que objeto no sea null/undefined.
2. @Required en array: NO garantiza que array tenga elementos, solo que no sea null.
3. Para validar longitud de array, usar @Validation con length check.
4. Validaciones en entidad relacionada NO se ejecutan automáticamente desde entidad padre.

## 7. Prohibiciones

### Prohibiciones de Diseño

1. NO implementar relaciones N:N directas. Usar entidad intermedia con dos relaciones 1:N.
2. NO crear relaciones circulares (A contiene B, B contiene A).
3. NO omitir @DefaultProperty en entidades relacionadas. Resultado: lookup muestra "[object Object]".
4. NO omitir @UniquePropertyKey. Resultado: problemas al eliminar items de arrays.
5. NO usar objetos anidados profundos (>2 niveles) sin considerar complejidad.

### Prohibiciones de Implementación

1. NO modificar directamente arrays de relaciones sin emitir evento update:modelValue.
2. NO asumir que entidad relacionada está completamente cargada. Verificar propiedades necesarias.
3. NO crear dependencias circulares entre entidades.
4. NO hardcodear lógica de lookup. Usar sistema provisto.
5. NO editar items de array inline sin componente especializado.

### Prohibiciones de Performance

1. NO cargar arrays de >100 items sin considerar impacto en UI.
2. NO hacer llamadas API individuales para cada item de lookup. Usar getElementList().
3. NO renderizar ArrayInputComponent con datos masivos sin lazy loading externo.

## 8. Dependencias

### Dependencias de Código

**Obligatorias:**
- `BaseEntity` de `@/entities/base_entitiy` - Clase base para todas las entidades
- `@DefaultProperty` de `@/decorations` - Decorador para propiedad por defecto
- `@UniquePropertyKey` de `@/decorations` - Decorador para clave única
- `@TabOrder` de `@/decorations` - Decorador para orden de tabs
- `ArrayOf` helper de `@/decorations` - Helper para especificar arrays tipados
- `Application` de `@/models/application` - Para ApplicationUIService

**Componentes Framework:**
- ObjectInputComponent - Renderizado de objetos relacionados
- ArrayInputComponent - Renderizado de arrays
- default_lookup_listview.vue - Vista de selección modal

### Dependencias Previas

- Módulos relacionados deben estar registrados en ModuleList
- Módulos relacionados deben tener endpoints funcionales para getElementList()

## 9. Relaciones

### Relaciones con Otros Tutoriales

**Tutorial 01 (CRUD Básico)**: Las relaciones extienden conceptos de Tutorial 01:
- Entidades relacionadas siguen mismo patrón de definición
- Validaciones aplicables también a propiedades relacionadas
- Sistema de persistencia compatible con relaciones

**Tutorial 02 (Validaciones)**: Validaciones aplican a relaciones:
- @Required valida presencia de objeto o array
- @Validation valida propiedades del objeto relacionado
- @AsyncValidation puede verificar existencia en servidor

### Relaciones con Capas del Framework

**Capa de Componentes (04-components/):**
- ObjectInputComponent.vue - Componente para objetos 1:1
- ArrayInputComponent.vue - Componente para arrays 1:N
- default_lookup_listview.vue - Vista de lookup modal

**Capa de Decoradores (01-decorators/):**
- default-property-decorator.md - @DefaultProperty
- unique-property-key-decorator.md - @UniquePropertyKey
- tab-order-decorator.md - @TabOrder

**Capa de Base Entity (02-base-entity/):**
- serialization.md - Serialización de relaciones
- crud-operations.md - Guardado de entidades con relaciones

## 10. Notas de Implementación

### Requisitos Previos

**Tutoriales completados:**
- Tutorial 01-basic-crud.md
- Tutorial 02-validations.md (recomendado)

**Conocimientos necesarios:**
- Comprensión de relaciones de bases de datos
- TypeScript: tipos de clase y arrays
- Vue 3 slots y componentes dinámicos

### Ejemplo 1: Sistema de Orders (Relación 1:1)

**Paso 1: Definir Entidad Customer**

Crear `src/entities/customer.ts`:

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

**Análisis de Decoradores:**
- `@DefaultProperty('name')`: Lookup mostrará el nombre del customer
- `@UniquePropertyKey('id')`: Identifica customers únicamente por ID
- Resto de decoradores: Configuración estándar de módulo

**Paso 2: Definir Entidad Order con Relación**

Crear `src/entities/order.ts`:

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
@ModuleName('Order', 'Orders')
@ModuleIcon(ICONS.ORDERS)
@ApiEndpoint('/api/orders')
@Persistent()
@ModuleName('Orders')
@ApiEndpoint('/api/orders')
@DefaultProperty('orderNumber')
@PrimaryProperty('id')
@UniquePropertyKey('id')
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
    @PropertyName('Customer', Customer)  // ← RELACIÓN 1:1
    @Required(true)
    customer!: Customer;
    
    @PropertyIndex(4)
    @PropertyName('Total Amount', Number)
    @Required(true)
    totalAmount!: number;
}
```

**Análisis de la Relación:**
```typescript
@PropertyName('Customer', Customer)
customer!: Customer;
```
- Tipo es `Customer` (clase, no String ni Number)
- Framework detecta tipo y genera ObjectInputComponent automáticamente
- @Required valida que customer no sea null/undefined

**Paso 3: Registrar Módulos**

En `src/models/application.ts`:

```typescript
import { Customer } from '@/entities/customer';
import { Order } from '@/entities/order';

Application.ModuleList.value.push(Customer, Order);
```

**Paso 4: Prueba de Funcionalidad**

1. Navegar a Orders
2. Click "New Order"
3. Formulario muestra:

```
Order Number: [________________]
Customer:     [Select...     ] [🔍]
Total Amount: [________________]
```

4. Click botón [🔍]
5. Modal abre con lista de Customers
6. Click en un Customer
7. Modal cierra
8. Campo Customer muestra nombre seleccionado

### Ejemplo 2: Sistema con Array (Relación 1:N)

**Paso 1: Definir Entidad OrderItem**

Crear `src/entities/order_item.ts`:

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

**Paso 2: Agregar Array a Order**

Modificar `src/entities/order.ts`:

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

**Análisis:**
```typescript
@TabOrder(1)  // Orden del tab (1 = primer tab)
@PropertyName('Order Items', ArrayOf(OrderItem))  // Helper especial
@Validation((e) => e.items?.length > 0, 'Min 1 item')  // Validación de longitud
items!: Array<OrderItem>;
```

**Paso 3: Registrar OrderItem**

```typescript
import { OrderItem } from '@/entities/order_item';

Application.ModuleList.value.push(Customer, Order, OrderItem);
```

**Paso 4: Prueba de Funcionalidad**

1. Navegar a Orders
2. Click "New Order"
3. Completar campos básicos
4. Scroll abajo - Ver tab "Order Items"
5. Click en tab
6. Interfaz muestra:

```
┌─────────────────────────────────────────────────────┐
│ 🔍 [Buscar Order Items...]    [Agregar] [...]     │
├─────────────────────────────────────────────────────┤
│ ID │ Product Name │ Quantity │ Unit Price          │
├────┼──────────────┼──────────┼──────────────────────┤
│    │ (vacío)      │          │                      │
└─────────────────────────────────────────────────────┘
```

7. Click [Agregar]
8. Modal muestra lista de OrderItems
9. Seleccionar un item
10. Item aparece en tabla
11. Repetir para agregar más items

**Eliminar Items:**

1. Click botón [Seleccionar] (botón [...])
2. Checkboxes aparecen en primera columna
3. Seleccionar items a eliminar
4. Click [Eliminar]
5. Modal de confirmación
6. Confirmar → Items removidos

### Ejemplo 3: Entidad Completa con Relaciones

**Order Completo con Customer y Items:**

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
    @DisplayFormat((value) => `$${value?.toFixed(2) || '0.00'}`)
    subtotal!: number;
    
    @ViewGroup('Financial')
    @PropertyIndex(5)
    @PropertyName('Tax', Number)
    @DisplayFormat((value) => `$${value?.toFixed(2) || '0.00'}`)
    tax!: number;
    
    @ViewGroup('Financial')
    @PropertyIndex(6)
    @PropertyName('Total Amount', Number)
    @DisplayFormat((value) => `$${value?.toFixed(2) || '0.00'}`)
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

**Resultado Visual:**

```
┌─────────────────────────────────────────┐
│ Basic Information                       │
│ ┌─────────────────────────────────────┐│
│ ││ Order Number: [ORD-2024-001]       ││
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

### Validaciones en Relaciones

**Validar Objeto Required:**

```typescript
@PropertyName('Customer', Customer)
@Required(true, 'Customer is required')
customer!: Customer;
```

Comportamiento:
- Si customer es null, undefined o EmptyEntity → Error
- Input muestra mensaje: "Customer is required"

**Validar Array Mínimo de Items:**

```typescript
@PropertyName('Items', ArrayOf(OrderItem))
@Required(true)
@Validation(
    (entity) => entity.items?.length >= 2,
    'Order must have at least 2 items'
)
items!: Array<OrderItem>;
```

Comportamiento:
- Si items.length < 2 → Error
- Tab muestra indicador de error
- Formulario no se puede guardar hasta corregir

**Validación Asíncrona en Relaciones:**

```typescript
@PropertyName('Customer', Customer)
@Required(true)
@AsyncValidation(
    async (entity) => {
        // Verificar que customer tenga crédito disponible
        const response = await Application.axiosInstance.get(
            `/api/customers/${entity.customer.id}/credit-check`
        );
        return response.data.hasCredit;
    },
    'Customer has no available credit'
)
customer!: Customer;
```

### Troubleshooting

**Problema: "Cannot read property 'getDefaultPropertyValue' of undefined"**

Causa: Objeto relacionado no inicializado.  
Solución:
```typescript
// Opción 1: Valor default en constructor
constructor(data: any) {
    super(data);
    this.customer = data.customer || new EmptyEntity({});
}

// Opción 2: Tipo opcional
customer?: Customer;
```

**Problema: Array no se muestra en formulario**

Causa: Falta decorador @TabOrder.  
Solución:
```typescript
@TabOrder(1)
@PropertyName('Items', ArrayOf(OrderItem))
items!: Array<OrderItem>;
```

**Problema: Modal de lookup vacío**

Causa: Entidad no registrada en ModuleList.  
Solución:
```typescript
Application.ModuleList.value.push(Customer);
```

**Problema: Lookup muestra "[object Object]"**

Causa: Falta @DefaultProperty en entidad relacionada.  
Solución:
```typescript
@DefaultProperty('name')
export class Customer extends BaseEntity {
    name!: string;
}
```

## 11. Referencias Cruzadas

### Documentación del Framework

**Guías Fundamentales:**
- [../01-FRAMEWORK-OVERVIEW.md](../01-FRAMEWORK-OVERVIEW.md) - Arquitectura del framework
- [../02-FLOW-ARCHITECTURE.md](../02-FLOW-ARCHITECTURE.md) - Flujos de datos

**Capas de Decoradores:**
- [../layers/01-decorators/default-property-decorator.md](../layers/01-decorators/default-property-decorator.md) - @DefaultProperty
- [../layers/01-decorators/unique-property-key-decorator.md](../layers/01-decorators/unique-property-key-decorator.md) - @UniquePropertyKey  
- [../layers/01-decorators/tab-order-decorator.md](../layers/01-decorators/tab-order-decorator.md) - @TabOrder

**Capa de Componentes:**
- [../layers/04-components/object-input-component.md](../layers/04-components/object-input-component.md) - ObjectInputComponent (futura)
- [../layers/04-components/array-input-component.md](../layers/04-components/array-input-component.md) - ArrayInputComponent (futura)
- [../layers/04-components/views-overview.md](../layers/04-components/views-overview.md) - Lookup View

**Capa de Base Entity:**
- [../layers/02-base-entity/serialization.md](../layers/02-base-entity/serialization.md) - Serialización de relaciones
- [../layers/02-base-entity/crud-operations.md](../layers/02-base-entity/crud-operations.md) - CRUD con relaciones

### Tutoriales Relacionados

**Tutoriales Previos:**
- [01-basic-crud.md](01-basic-crud.md) - Fundamentos CRUD
- [02-validations.md](02-validations.md) - Validaciones aplicables a relaciones

### Enlaces Externos

**Conceptos de Diseño:**
- Database relationships: https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model
- Composition vs Aggregation: https://en.wikipedia.org/wiki/Object_composition

### Fecha y Versión

Última actualización: 11 de Febrero, 2026  
Versión del documento: 2.0.0  
Estado: Completo
