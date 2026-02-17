# ArrayInputComponent

## 1. Propósito

ArrayInputComponent es un componente complejo de formulario que gestiona arrays de entidades relacionadas mediante interfaz de tabla interactiva con funcionalidades CRUD completas, implementando relaciones 1:N entre entidades. El componente renderiza tabla con header personalizado (icono, título, búsqueda, botones de acción), filas de datos con valores formateados, modo de selección con checkboxes para eliminación múltiple, y modal de lookup para agregar nuevos items. Proporciona búsqueda en tiempo real sobre default property de items, validación de required (array no vacío) y validación sincrónica personalizada, confirmación antes de eliminar mediante modal, y emisión de eventos update:modelValue para sincronización con v-model.

**Ubicación del código fuente:** src/components/Form/ArrayInputComponent.vue

**Tipo de propiedad:** Array<BaseEntity> (arrays de objetos relacionados)

**Decoradores relacionados:** @ArrayOf(EntityClass), @TabOrder(number), @Validation, @Required

**Patrón de diseño:** Interactive Data Table + Modal Selection + Validation System

## 2. Alcance

### Responsabilidades

1. **Renderizado de Tabla Interactiva:**
   - Renderizar header con icono y nombre de módulo obtenidos de typeValue.getModuleIcon() y getModuleName()
   - Renderizar thead con nombres de propiedades obtenidos de typeValue.getProperties()
   - Renderizar tbody con filas por cada item en filteredData mediante v-for
   - Renderizar td con valores de propiedades usando item[property] para cada key en item.getKeys()
   - Aplicar clase selected a filas cuando item está en selectedItems array

2. **Gestión de Modo Selección:**
   - Mantener data property isSelection (boolean) para controlar modo de selección
   - Mostrar columna de checkboxes mediante clase display cuando isSelection es true
   - Renderizar botón con iconos ADD/REMOVE por cada fila
   - Agregar/remover items de selectedItems array al click en checkbox
   - Habilitar botón Eliminar solo cuando selectedItems.length > 0
   - Limpiar selectedItems a array vacío al desactivar modo selección

3. **Búsqueda en Tiempo Real:**
   - Mantener data property search (string) bindeada a input mediante v-model
   - Computed filteredData filtra modelValue usando getDefaultPropertyValue() de cada item
   - Aplicar toLowerCase() para case-insensitive matching
   - Usar includes() para match parcial en display value
   - Retornar modelValue completo si search está vacío

4. **Agregar Items via Modal:**
   - Method openModal() ejecuta ApplicationUIService.showModalOnFunction()
   - Pasar typeValue (clase de items) como primer argumento
   - Pasar addSelectedElement como callback function
   - Especificar ViewTypes.LOOKUPVIEW para modal de selección
   - Callback addSelectedElement recibe BaseEntity | undefined
   - Crear nuevo array con spread [...this.modelValue, newElement]
   - Emitir update:modelValue con nuevo array sin mutar original

5. **Eliminar Items con Confirmación:**
   - Method showDeleteModal() ejecuta ApplicationUIService.openConfirmationMenu()
   - Mostrar warning type con mensaje de confirmación
   - Callback ejecuta filter() para crear nuevo array excluyendo selectedItems
   - Emitir update:modelValue con array filtrado
   - Limpiar selectedItems a array vacío
   - Establecer isSelection a false para salir de modo selección

6. **Sistema de Validación Bi-Level:**
   - Nivel 1: Validar required mediante modelValue null/undefined/empty
   - Generar mensaje desde requireddMessage prop o default message
   - Nivel 2: Ejecutar entity.isValidation(propertyKey) si entity y propertyKey provistos
   - Obtener mensaje desde entity.validationMessage(propertyKey)
   - Poblar validationMessages array con errores detectados
   - Computed isInputValidated retorna validated prop && validationMessages.length === 0
   - Renderizar alertas en header si !isInputValidated

### Límites

1. **NO implementa paginación** - Todos los items se renderizan simultáneamente, degradación de performance con >100 items
2. **NO permite edición inline** - Solo agregar/eliminar completo, sin edición de campos individuales en tabla
3. **NO soporta validación asíncrona** - isValidation() es sincrónico, no ejecuta isAsyncValidation()
4. **NO implementa ordenamiento** - Columnas no son clicables para sort, mantiene orden original de array
5. **NO busca en todas las propiedades** - Búsqueda limitada a getDefaultPropertyValue(), no full-text search
6. **NO previene duplicados** - Puede agregar mismo item múltiples veces si modal lo permite
7. **NO persiste selección** - selectedItems se limpia al cambiar de modo selección
8. **NO customiza renderizado de celdas** - Valores mostrados como toString(), sin formateo específico

## 3. Definiciones Clave

**ArrayInputComponent**: Componente Vue de formulario que renderiza tabla interactiva para gestión de arrays de BaseEntity, con funcionalidades de agregar (modal), eliminar (selección múltiple), búsqueda y validación.

**modelValue**: Prop Array<BaseEntity> que contiene items actuales, sincronizado con v-model del componente padre. Debe ser tratado como inmutable, creando nuevos arrays para emit update:modelValue.

**typeValue**: Prop PropType<typeof BaseEntity> que contiene clase de items (OrderItem, InvoiceLine, etc.), utilizada para obtener metadata mediante getModuleName(), getModuleIcon(), getProperties().

**filteredData**: Computed property que retorna subset de modelValue filtrado por search string, matcheando contra getDefaultPropertyValue() de cada item con toLowerCase() e includes().

**isSelection**: Data property boolean que controla modo de selección, mostrando columna de checkboxes cuando true, ocultándola cuando false.

**selectedItems**: Data property Array<BaseEntity> que almacena items marcados para eliminación, poblado mediante clicks en checkboxes, limpiado al ejecutar eliminación o desactivar modo.

**openModal**: Method que ejecuta ApplicationUIService.showModalOnFunction(typeValue, addSelectedElement, ViewTypes.LOOKUPVIEW) para abrir modal de selección de items disponibles.

**showDeleteModal**: Method que ejecuta ApplicationUIService.openConfirmationMenu() con warning type y callback que filtra modelValue excluyendo selectedItems.

**addSelectedElement**: Callback function recibida por modal de selección, ejecutada con item seleccionado, crea nuevo array con spread operator y emite update:modelValue.

## 4. Descripción Técnica

ArrayInputComponent implementa template estructurado en tres secciones principales: table-header-row (controles superiores), table (datos), y validation alerts (mensajes de error). El header contiene left-side-space con icono (img con src desde typeValue.getModuleIcon()), título (span con typeValue.getModuleName()), y alertas condicionales (renderizadas si !isInputValidated). El right-side-space contiene input de búsqueda (TextInput class con v-model="search"), botón Eliminar (alert fill class, disabled si selectedItems.length == 0), botón Seleccionar (success fill class, disabled si modelValue.length == 0), y botón Agregar (secondary fill class).

La tabla implementa thead con tr conteniendo th por cada propiedad en typeValue.getProperties(), más th adicional con clase selection visible solo cuando isSelection es true. El tbody utiliza v-for iterando filteredData, renderizando tr por cada item con clase selected aplicada condicionalmente si item está en selectedItems. Cada tr contiene td con clase selection (checkbox button), seguido de td por cada property en item.getKeys(), mostrando item[property] como valor.

El computed filteredData implementa algoritmo de filtrado: retorna modelValue completo si search es falsy, ejecuta filter() sobre modelValue si search tiene valor, obtiene defaultValue de cada item mediante getDefaultPropertyValue(), verifica tipo string y ejecuta toLowerCase().includes(search.toLowerCase()) para case-insensitive matching parcial.

Los methods implementan lógica de gestión: openModal() ejecuta ApplicationUIService.showModalOnFunction(this.typeValue, this.addSelectedElement, ViewTypes.LOOKUPVIEW), addSelectedElement(newElement: BaseEntity | undefined) verifica truthy, crea updatedArray como [...this.modelValue, newElement], emite update:modelValue con updatedArray; toggleSelection() invierte this.isSelection y limpia this.selectedItems si modo se desactiva; showDeleteModal() ejecuta ApplicationUIService.openConfirmationMenu(confMenuType.WARNING, título, mensaje, callback), el callback ejecuta filter((item) => !this.selectedItems.includes(item)), emite update:modelValue con array filtrado, limpia selectedItems y establece isSelection: false.

El sistema de validación ejecuta en dos fases: watch sobre validated prop con immediate: true, ejecuta validateInput() que limpia validationMessages, verifica required && (!modelValue || modelValue.length === 0) agregando mensaje de requireddMessage o default, verifica entity && propertyKey ejecutando entity.isValidation(propertyKey), si false agrega entity.validationMessage(propertyKey) a validationMessages. El computed isInputValidated retorna validated && validationMessages.length === 0.

## 5. Flujo de Funcionamiento

**Montaje y Validación Inicial:**
1. Component recibe props: modelValue (Array<OrderItem>), typeValue (OrderItem class), entity (Order), propertyKey ('items'), required (true)
2. Component monta y ejecuta watch con immediate: true sobre validated prop
3. validateInput() limpia validationMessages array
4. Verifica required: true y modelValue.length === 0
5. Agrega mensaje 'Order must have items' a validationMessages
6. computed isInputValidated evalúa: validated (true) && validationMessages.length (1) retorna false
7. Template renderiza alerta en header con mensaje de required
8. Botones Seleccionar y Eliminar disabled por modelValue.length === 0

**Agregar Nuevo Item via Modal:**
1. Usuario click en botón Agregar
2. openModal() ejecuta ApplicationUIService.showModalOnFunction(OrderItem, addSelectedElement, LOOKUPVIEW)
3. ApplicationUIService establece modal.value.showing: true, component: DefaultLookupListView, entityClass: OrderItem
4. Modal renderiza lista de OrderItems disponibles desde OrderItem.fetchAll()
5. Usuario selecciona item 'Laptop HP' en modal
6. Modal ejecuta callback addSelectedElement con selectedItem como argumento
7. addSelectedElement verifica selectedItem truthy
8. Crea updatedArray: [...modelValue, selectedItem] = [selectedItem]
9. Emite update:modelValue(updatedArray)
10. Padre actualiza v-model, modelValue ahora [selectedItem]
11. validateInput() re-ejecuta, modelValue.length === 1, no agrega mensaje required
12. isInputValidated retorna true, alerta desaparece
13. Botones Seleccionar y Eliminar se habilitan

**Búsqueda en Tiempo Real:**
1. Usuario escribe 'lap' en input de búsqueda
2. v-model actualiza search: 'lap'
3. computed filteredData recalcula
4. Ejecuta filter sobre modelValue array de 3 items
5. Por cada item ejecuta getDefaultPropertyValue() retornando 'Laptop HP', 'Mouse Logitech', 'Keyboard Razer'
6. Aplica toLowerCase(): 'laptop hp', 'mouse logitech', 'keyboard razer'
7. Ejecuta includes('lap'): true, false, false
8. filteredData retorna [item con 'Laptop HP']
9. Template re-renderiza tbody mostrando solo 1 fila
10. Usuario borra búsqueda, search: '', filteredData retorna modelValue completo

**Modo Selección y Eliminación:**
1. Usuario click en botón Seleccionar
2. toggleSelection() ejecuta, isSelection: false → true
3. Template muestra columna selection mediante clase display
4. Usuario click en checkbox de 'Mouse Logitech'
5. Verifica selectedItems.includes(item): false
6. Ejecuta selectedItems.push(item)
7. selectedItems: [item]
8. Template aplica clase selected a tr
9. Botón Eliminar se habilita por selectedItems.length > 0
10. Usuario click en botón Eliminar
11. showDeleteModal() ejecuta
12. ApplicationUIService.openConfirmationMenu muestra modal de warning
13. Usuario click en Confirmar en modal
14. Callback ejecuta filter((item) => !selectedItems.includes(item))
15. updatedArray excluye 'Mouse Logitech', contiene 2 items
16. Emite update:modelValue(updatedArray)
17. selectedItems = [], isSelection: false
18. Modal se cierra, tabla actualiza mostrando 2 filas

**Validación Sincrónica Personalizada:**
1. Order tiene @Validation((entity) => entity.items.length >= 2, 'Minimum 2 items')
2. modelValue.length === 1 (solo 'Laptop HP')
3. validateInput() ejecuta entity.isValidation('items')
4. BaseEntity ejecuta validation decorators sobre 'items'
5. Validation function retorna entity.items.length >= 2 → false
6. entity.validationMessage('items') retorna 'Minimum 2 items'
7. validationMessages.push('Minimum 2 items')
8. isInputValidated retorna false
9. Template renderiza alerta con 'Minimum 2 items'
10. Usuario agrega segundo item 'Mouse Logitech'
11. modelValue.length === 2
12. Validation function retorna true
13. validationMessages queda vacío
14. isInputValidated retorna true, alerta desaparece

## 6. Reglas Obligatorias

### 6.1 Inmutabilidad de modelValue

SIEMPRE crear nuevo array para emit update:modelValue, NUNCA mutar modelValue directamente:

```typescript
// ✅ CORRECTO
const updatedArray = [...this.modelValue, newElement];
this.$emit('update:modelValue', updatedArray);

// ❌ INCORRECTO - Muta prop directamente
this.modelValue.push(newElement);
this.$emit('update:modelValue', this.modelValue);
```

### 6.2 Uso de @TabOrder para Arrays

Arrays NO usan @PropertyIndex, DEBEN usar @TabOrder:

```typescript
// ✅ CORRECTO
@TabOrder(1)
@PropertyName('Items', ArrayOf(OrderItem))
items!: Array<OrderItem>;

// ❌ INCORRECTO
@PropertyIndex(1)
@PropertyName('Items', ArrayOf(OrderItem))
items!: Array<OrderItem>;
```

### 6.3 @DefaultProperty en Entity de Items

Entity de items DEBE tener @DefaultProperty para búsqueda:

```typescript
// ✅ CORRECTO
@DefaultProperty('productName')
export class OrderItem extends BaseEntity {
    productName!: string;
}

// ❌ INCORRECTO - Búsqueda no funciona
export class OrderItem extends BaseEntity {
    productName!: string;
}
```

### 6.4 Limpieza de selectedItems al Desactivar Modo

SIEMPRE limpiar selectedItems al establecer isSelection: false:

```typescript
toggleSelection() {
    this.isSelection = !this.isSelection;
    if (!this.isSelection) {
        this.selectedItems = [];  // ✅ OBLIGATORIO
    }
}
```

### 6.5 Confirmación Antes de Eliminar

SIEMPRE usar openConfirmationMenu antes de eliminar, NUNCA eliminar directamente:

```typescript
// ✅ CORRECTO
showDeleteModal() {
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.WARNING,
        'Confirmar eliminación',
        '¿Desea continuar?',
        () => {
            const updated = this.modelValue.filter(item => !this.selectedItems.includes(item));
            this.$emit('update:modelValue', updated);
        }
    );
}

// ❌ INCORRECTO - No pide confirmación
deleteItems() {
    const updated = this.modelValue.filter(item => !this.selectedItems.includes(item));
    this.$emit('update:modelValue', updated);
}
```

### 6.6 Registro de Ambas Entidades

SIEMPRE registrar entity padre y entity de items en Application.ModuleList:

```typescript
// ✅ CORRECTO
Application.ModuleList = new Map([
    ['orders', Order],
    ['order-items', OrderItem]  // ← Necesario para modal
]);

// ❌ INCORRECTO - Modal de OrderItem fallará
Application.ModuleList = new Map([
    ['orders', Order]
]);
```

## 7. Prohibiciones

1. NO mutar modelValue prop directamente - Siempre crear nuevo array y emitir update:modelValue
2. NO usar @PropertyIndex para array properties - Usar @TabOrder exclusivamente
3. NO omitir @DefaultProperty en entity de items - Búsqueda depende de getDefaultPropertyValue()
4. NO olvidar registrar entity de items en ModuleList - Modal LOOKUPVIEW requiere entity registrada
5. NO eliminar items sin confirmación - ApplicationUIService.openConfirmationMenu es obligatorio
6. NO renderizar más de 100 items sin paginación - Performance degradada severamente
7. NO intentar edición inline - Component no soporta, solo add/remove completo
8. NO usar validación asíncrona - ArrayInputComponent no ejecuta isAsyncValidation()
9. NO persistir selectedItems entre activaciones de modo - Limpiar al desactivar isSelection
10. NO asumir orden específico - Array mantiene orden de inserción, no hay sort

## 8. Dependencias

### Dependencias Directas

**Application Singleton:**
- Application.ApplicationUIService.showModalOnFunction() - Abrir modal de lookup para selección
- Application.ApplicationUIService.openConfirmationMenu() - Modal de confirmación para eliminación

**BaseEntity:**
- typeValue.getModuleName() - Nombre del módulo para título
- typeValue.getModuleIcon() - Icono del módulo para header
- typeValue.getProperties() - Array de nombres de propiedades para thead
- item.getKeys() - Array de keys de propiedades para iterar valores
- item.getDefaultPropertyValue() - Valor default para búsqueda
- entity.isValidation(propertyKey) - Validación sincrónica
- entity.validationMessage(propertyKey) - Mensaje de validación

**Vue Core:**
- Props: modelValue, typeValue, entity, propertyKey, required, validated, disabled
- Emit: update:modelValue
- v-model directive para two-way binding
- Computed properties: filteredData, isInputValidated
- Watch: sobre validated prop con immediate: true
- v-for directive para iteración

**Decoradores:**
- @ArrayOf(EntityClass) - Especifica clase de items en array
- @TabOrder(number) - Orden de tab para renderizado
- @DefaultProperty(key) - Propiedad usada en búsqueda
- @Required(boolean, message) - Validación de array no vacío
- @Validation(fn, message) - Validación sincrónica personalizada

### Dependencias de Enums

- ViewTypes.LOOKUPVIEW - Tipo de vista para modal de selección
- confMenuType.WARNING - Tipo de confirmación para eliminación

### Dependencias de CSS

- Variables: --white, --border-radius, --shadow, --gray-dark
- Classes: table, table-header-row, button, alert fill, success fill, secondary fill
- Icons: GGICONS.ADD, GGICONS.DELETE, GGICONS.REMOVE, GGICONS.SELECT_CHECKBOX, GGICONS.SELECT_VOID

## 9. Relaciones

**Componentes Relacionados:**

ArrayInputComponent → DefaultLookupListView (modal para agregar items)
ArrayInputComponent → ConfirmationModal (confirmación para eliminar)
ArrayInputComponent ← DefaultDetailView (renderizado en tabs)
ArrayInputComponent ← TabComponent (contenedor de tab)

**Flujo de Comunicación:**

User click Agregar → ArrayInputComponent.openModal() → ApplicationUIService.showModalOnFunction() → DefaultLookupListView.render() → User select item → DefaultLookupListView.callback() → ArrayInputComponent.addSelectedElement() → emit update:modelValue → Parent component updates v-model

User select items + click Eliminar → ArrayInputComponent.showDeleteModal() → ApplicationUIService.openConfirmationMenu() → ConfirmationModal.render() → User confirm → ConfirmationModal.callback() → ArrayInputComponent filters modelValue → emit update:modelValue

**Documentos Relacionados:**

- [object-input-component.md](object-input-component.md) - Relaciones 1:1
- [text-input-component.md](text-input-component.md) - Input simple
- [TabComponents.md](TabComponents.md) - Sistema de tabs
- [views-overview.md](views-overview.md) - DefaultDetailView que renderiza arrays
- property-name-decorator.md - Decorador @ArrayOf
- tab-order-decorator.md - Decorador @TabOrder
- validation-decorator.md - Decorador @Validation
- ui-services.md - ApplicationUIService methods
- 03-relations.md - Tutorial de relaciones 1:N

**Casos de Uso Típicos:**

- Order → OrderItems (pedidos con líneas)
- Invoice → InvoiceLines (facturas con líneas)
- Project → TeamMembers (proyectos con miembros)
- Category → Products (categorías con productos)
- Warehouse → Inventory (almacenes con inventario)

## 10. Notas de Implementación

### Normalización Contractual (2026-02-17)

- Se elimina el uso de `style` inline en template. El layout debe resolverse con clases CSS del componente.
- Se elimina el uso de `!important` en reglas de estado (`selected`, `selection`, `display`) para cumplir contrato UI/CSS.
- Cualquier override visual debe resolverse por especificidad controlada o estructura de selectores, nunca por `!important`.

### Definición de Entidades Completa

```typescript
// entities/order_item.ts
import { BaseEntity } from './base_entity';
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

// entities/order.ts
import { BaseEntity } from './base_entity';
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
    
    @TabOrder(1)
    @PropertyName('Order Items', ArrayOf(OrderItem))
    @Required(true, 'Order must have items')
    @Validation(
        (entity) => entity.items.length >= 1,
        'Order must have at least 1 item'
    )
    items!: Array<OrderItem>;
}
```

### Registro en Application

```typescript
// src/models/application.ts
import { Order } from '@/entities/order';
import { OrderItem } from '@/entities/order_item';

class Application {
    static ModuleList = new Map<string, typeof BaseEntity>([
        ['orders', Order],
        ['order-items', OrderItem]  // ← Crítico para modal
    ]);
}
```

### Validaciones Avanzadas

```typescript
// Validar longitud mínima
@Validation(
    (entity) => entity.items.length >= 2,
    'Order must have at least 2 items'
)
items!: Array<OrderItem>;

// Validar total mínimo
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

// Validar items únicos
@Validation(
    (entity) => {
        const ids = entity.items.map(item => item.id);
        const uniqueIds = new Set(ids);
        return ids.length === uniqueIds.size;
    },
    'Order cannot have duplicate items'
)
items!: Array<OrderItem>;
```

### Casos de Uso Completos

**Order → OrderItems:**

```typescript
@TabOrder(1)
@PropertyName('Order Items', ArrayOf(OrderItem))
@Required(true)
items!: Array<OrderItem>;
```

**Invoice → InvoiceLines:**

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

**Project → TeamMembers (Opcional):**

```typescript
@TabOrder(2)
@PropertyName('Team Members', ArrayOf(Employee))
@Required(false)
teamMembers?: Array<Employee>;
```

### Limitaciones y Workarounds

**Limitación 1: Sin Paginación**
- Con >100 items, performance degrada
- Workaround: Implementar filtrado más restrictivo o lazy loading manual

**Limitación 2: Sin Edición Inline**
- No se puede editar quantity directamente
- Workaround: Eliminar item y agregar nuevo con valores correctos

**Limitación 3: Sin Ordenamiento**
- Columnas no ordenables
- Workaround: Pre-ordenar array antes de establecer modelValue

**Limitación 4: Búsqueda Limitada**
- Solo busca en default property
- Workaround: Construir default property concatenando múltiples campos

### Debugging

```typescript
// Verificar items en array
console.log('Current items:', this.modelValue);
console.log('Filtered items:', this.filteredData);

// Verificar validación
console.log('Is valid:', this.isInputValidated);
console.log('Validation messages:', this.validationMessages);

// Verificar selección
console.log('Selection mode:', this.isSelection);
console.log('Selected items:', this.selectedItems);
```

## 11. Referencias Cruzadas

**Tutoriales:**
- [03-relations.md](../../tutorials/03-relations.md) - Tutorial completo de relaciones 1:N y ArrayOf

**Componentes Relacionados:**
- [object-input-component.md](object-input-component.md) - Relaciones 1:1 con objetos
- [TabComponents.md](TabComponents.md) - Sistema de tabs que contienen arrays
- [views-overview.md](views-overview.md) - DefaultDetailView que renderiza arrays
- [modal-components.md](modal-components.md) - Modales usados para agregar y confirmar

**Decoradores:**
- [property-name-decorator.md](../01-decorators/property-name-decorator.md) - @ArrayOf decorator
- [tab-order-decorator.md](../01-decorators/tab-order-decorator.md) - @TabOrder para arrays
- [validation-decorator.md](../01-decorators/validation-decorator.md) - @Validation sincrónica
- [required-decorator.md](../01-decorators/required-decorator.md) - @Required para arrays
- [default-property-decorator.md](../01-decorators/default-property-decorator.md) - @DefaultProperty para búsqueda

**Application Layer:**
- [ui-services.md](../03-application/ui-services.md) - showModalOnFunction y openConfirmationMenu
- [application-singleton.md](../03-application/application-singleton.md) - ModuleList registration

**BaseEntity:**
- [crud-operations.md](../02-base-entity/crud-operations.md) - fetchAll usado en modal
- [metadata-access.md](../02-base-entity/metadata-access.md) - getProperties, getKeys, getDefaultPropertyValue

**Arquitectura:**
- [02-FLOW-ARCHITECTURE.md](../../02-FLOW-ARCHITECTURE.md) - Flujo de renderizado de arrays en tabs
- [01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md) - Arquitectura de componentes dinámicos

**Ubicación del código fuente:** src/components/Form/ArrayInputComponent.vue

---

## Props

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

## Template

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

## Métodos Principales

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
            /** Callback de confirmación */
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

## Búsqueda en Tiempo Real

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

## Sistema de Validación (2 Niveles)

**Alcance:** ArrayInputComponent implementa validación required y validación síncrona. No incluye validación asíncrona.

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

## Ejemplo Completo

### Definición de Entidades

```typescript
// entities/order_item.ts
import { BaseEntity } from './base_entity';
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
import { BaseEntity } from './base_entity';
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

## Buenas Prácticas

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

## Casos de Uso Comunes

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

## Limitaciones Actuales

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

## Referencias

- **Tutorial Relaciones:** `../../tutorials/03-relations.md`
- **ObjectInputComponent:** [object-input-component.md](object-input-component.md) - Para relaciones 1:1
- **ArrayOf Decorator:** `../01-decorators/property-name-decorator.md`
- **TabOrder Decorator:** `../01-decorators/tab-order-decorator.md`
- **UI Services:** `../03-application/ui-services.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual, con limitaciones documentadas)
