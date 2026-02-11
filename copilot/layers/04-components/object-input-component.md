# 🔗 ObjectInputComponent - Selector de Objeto con Modal Lookup

**Referencias:**
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadatos
- `../../tutorials/03-relations.md` - Tutorial de relaciones
- `../../03-application/ui-services.md` - ApplicationUIService
- `../../01-decorators/property-name-decorator.md` - PropertyName con tipos

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Form/ObjectInputComponent.vue`  
**Tipo de propiedad:** `BaseEntity` (objetos anidados)  
**Uso:** Relaciones 1:1 entre entidades

---

## 🎯 Propósito

Componente para **seleccionar objetos relacionados** mediante modal de lookup. Implementa relaciones 1:1 entre entidades. Características:

- ✅ Input readonly mostrando objeto seleccionado
- ✅ Botón de búsqueda (🔍) que abre modal lookup
- ✅ Modal con lista de objetos disponibles
- ✅ Selección mediante click
- ✅ Validación de required (null, undefined, EmptyEntity)
- ✅ Validación de 3 niveles del framework

---

## 🔧 Activación Automática

El componente se genera automáticamente cuando:

```typescript
import { Customer } from './customer';

@PropertyName('Customer', Customer)  // ← Tipo BaseEntity activa ObjectInputComponent
customer!: Customer;
```

**Clave:** El segundo parámetro de `@PropertyName` es una clase que hereda de `BaseEntity`.

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
    modelValue: {
        type: Object as PropType<BaseEntity>,
        required: false,
        default: () => new EmptyEntity({}),  // ← Valor por defecto
    },
    modelType: {
        type: Function as unknown as PropType<typeof BaseEntity>,
        required: true,  // ← Clase del objeto relacionado (ej: Customer)
    },
}
```

**Props críticos:**
- `modelValue` - El objeto relacionado actual (Customer instance)
- `modelType` - La clase del objeto (Customer class)

---

## 📐 Template

```vue
<template>
<div class="TextInput ObjectInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <!-- Label -->
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>
    
    <!-- Input readonly (muestra objeto seleccionado) -->
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue?.getDefaultPropertyValue()"  <!-- ← Display value -->
        :disabled="metadata.disabled.value"
        readonly="true"  <!-- ← No editable directamente -->
        @input="$emit('update:modelValue', modelValue)" 
    />
    
    <!-- Botón de búsqueda (abre modal) -->
    <button 
        class="right" 
        @click="Application.ApplicationUIService.showModalOnFunction(
            modelType,          // ← Customer class
            setNewValue,        // ← Callback
            ViewTypes.LOOKUPVIEW
        )" 
        :disabled="metadata.disabled.value"
    >
        <span :class="GGCLASS">{{ GGICONS.SEARCH }}</span>
    </button>
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
</template>
```

---

## 🔄 Flujo de Selección

### 1. Display Value (getDefaultPropertyValue)

```vue
:value="modelValue?.getDefaultPropertyValue()"
```

**¿Qué muestra?**
- Si `customer` seleccionado → Muestra `customer.name` (definido por `@DefaultProperty`)
- Si no hay selección → Muestra vacío

**Ejemplo:**
```typescript
// En Customer entity
@DefaultProperty('name')
export class Customer extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
}

// En Order entity
@PropertyName('Customer', Customer)
customer!: Customer;

// Input muestra:
order.customer.getDefaultPropertyValue()  // → "John Doe"
```

### 2. Abrir Modal de Lookup

```typescript
showModalOnFunction(
    modelType,          // Customer class
    setNewValue,        // Callback para recibir selección
    ViewTypes.LOOKUPVIEW // Tipo de modal
)
```

**¿Qué pasa?**
1. ApplicationUIService crea modal
2. Modal renderiza `default_lookup_listview.vue`
3. Lista muestra todos los Customer disponibles
4. Usuario click en un customer
5. Modal ejecuta `setNewValue(selectedCustomer)`
6. Modal se cierra

### 3. Callback setNewValue

```typescript
methods: {
    setNewValue(newValue: BaseEntity | undefined) {
        this.$emit('update:modelValue', newValue);
    }
}
```

**Flujo completo:**
```
Usuario click en botón 🔍
    ↓
showModalOnFunction(Customer, setNewValue, LOOKUPVIEW)
    ↓
Modal se abre con lista de Customers
    ↓
Usuario selecciona "John Doe"
    ↓
Modal ejecuta: setNewValue(customerJohn)
    ↓
setNewValue emite: update:modelValue(customerJohn)
    ↓
v-model actualiza: order.customer = customerJohn
    ↓
Input actualiza display: "John Doe"
    ↓
Modal se cierra
```

---

## ✅ Sistema de Validación (3 Niveles)

### Nivel 1: Required

```typescript
if (this.metadata.required.value && 
    (this.modelValue === null || 
     this.modelValue === undefined || 
     this.modelValue instanceof EmptyEntity)) {
    validated = false;
    this.validationMessages.push(
        this.metadata.requiredMessage.value || 
        `${this.metadata.propertyName} is required.`
    );
}
```

**Validación especial para objetos:**
- `null` - No válido
- `undefined` - No válido
- `EmptyEntity` - No válido (valor por defecto)
- `Customer instance` - Válido ✓

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

**Ejemplo: Validar que customer esté activo**
```typescript
@Validation(
    (entity) => entity.customer.active === true,
    'Customer must be active'
)
customer!: Customer;
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

**Ejemplo: Verificar crédito disponible**
```typescript
@AsyncValidation(
    async (entity) => {
        if (!entity.customer || entity.customer instanceof EmptyEntity) return true;
        const response = await fetch(`/api/customers/${entity.customer.id}/credit`);
        const { hasCredit } = await response.json();
        return hasCredit;
    },
    'Customer has no available credit'
)
customer!: Customer;
```

---

## 🎓 Ejemplo Completo

### Definición de Entidades

```typescript
// entities/customer.ts
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

@DefaultProperty('name')  // ← Define display value
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
    name!: string;  // ← Mostrado en ObjectInput
    
    @PropertyIndex(3)
    @PropertyName('Active', Boolean)
    active!: boolean;
}

// entities/order.ts
import { BaseEntity } from './base_entitiy';
import { Customer } from './customer';
import {
    PropertyName,
    PropertyIndex,
    Required,
    Validation,
    AsyncValidation,
    HelpText
} from '@/decorations';

export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Order Number', String)
    @Required(true)
    orderNumber!: string;
    
    @PropertyIndex(2)
    @PropertyName('Customer', Customer)  // ← Genera ObjectInputComponent
    @Required(true, 'Customer is required')
    @HelpText('Select the customer for this order')
    @Validation(
        (entity) => {
            if (!entity.customer || entity.customer instanceof EmptyEntity) return false;
            return entity.customer.active === true;
        },
        'Customer must be active'
    )
    @AsyncValidation(
        async (entity) => {
            if (!entity.customer || entity.customer instanceof EmptyEntity) return true;
            const response = await fetch(`/api/customers/${entity.customer.id}/credit`);
            const { hasCredit } = await response.json();
            return hasCredit;
        },
        'Customer has no available credit'
    )
    customer!: Customer;
}
```

### UI Generada

```
┌─────────────────────────────────────┐
│ Order Details                       │
│ ┌─────────────────────────────────┐ │
│ │ Order Number: [____________]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Customer                        │ │
│ │ ┌─────────────────────────┬───┐│ │
│ │ │ John Doe                │ 🔍││ │
│ │ └─────────────────────────┴───┘│ │
│ │ Select the customer for...      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Click en botón 🔍:**

```
┌─────────────────────────────────────┐
│ Select Customer                     │
│ ┌─────────────────────────────────┐ │
│ │ Search: [________]            X │ │
│ ├─────────────────────────────────┤ │
│ │ ID │ Name     │ Active │ Email │ │
│ ├────┼──────────┼────────┼───────┤ │
│ │ 1  │ John Doe │ ✓      │ j@... │ │  ← Click
│ │ 2  │ Jane Smt │ ✓      │ jane@.│ │
│ │ 3  │ Bob Jns  │ ✗      │ bob@. │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Después de selección:**

```
┌─────────────────────────────────────┐
│ Customer                            │
│ ┌─────────────────────────┬───┐    │
│ │ John Doe                │ 🔍 │    │  ← Actualizado
│ └─────────────────────────┴───┘    │
└─────────────────────────────────────┘
```

---

## 💡 Buenas Prácticas

### ✅ DO:

```typescript
// Usar @DefaultProperty para definir display
@DefaultProperty('name')
export class Customer extends BaseEntity {
    name!: string;
}

// Validar que objeto no sea EmptyEntity
@Validation(
    (entity) => !(entity.customer instanceof EmptyEntity),
    'Customer is required'
)
customer!: Customer;

// Validar propiedades del objeto relacionado
@Validation(
    (entity) => entity.customer.active,
    'Customer must be active'
)
customer!: Customer;

// Registrar entidad en ModuleList
Application.ModuleList.value.push(Customer, Order);
```

### ❌ DON'T:

```typescript
// No omitir @DefaultProperty
export class Customer extends BaseEntity {  // ❌ No display value
    name!: string;
}

// No olvidar registrar entidades
// ❌ Customer no en ModuleList → Modal vacío

// No usar String para relaciones
@PropertyName('Customer', String)  // ❌ Genera TextInput
customerId!: string;  // ❌ No es relación real
```

---

## 🧪 Casos de Uso Comunes

### 1. Order → Customer

```typescript
@PropertyName('Customer', Customer)
@Required(true)
customer!: Customer;
```

### 2. Employee → Department

```typescript
@PropertyName('Department', Department)
@Required(true)
@Validation(
    (entity) => entity.department.isActive,
    'Department is inactive'
)
department!: Department;
```

### 3. Product → Category (Opcional)

```typescript
@PropertyName('Category', Category)
@Required(false)
category?: Category;
```

---

## ⚠️ Limitaciones Actuales

### 1. No hay filtros en modal lookup

**Problema:** Modal muestra todos los registros sin paginación ni filtros avanzados.

**Impacto:** Problemas de performance con >100 registros.

### 2. No se puede crear objeto desde modal

**Problema:** Solo puedes seleccionar objetos existentes, no crear nuevos.

**Workaround:** Usuario debe ir a módulo de Customer, crear, luego volver a Order.

### 3. Display value limitado a una propiedad

**Problema:** Solo puedes mostrar `getDefaultPropertyValue()`, no múltiples campos.

**Ejemplo deseable:**
```
┌──────────────────────────┐
│ John Doe (john@email.com)│  ← No soportado
└──────────────────────────┘
```

---

## 🔗 Referencias

- **Tutorial Relaciones:** `../../tutorials/03-relations.md`  
- **ArrayInputComponent:** [array-input-component.md](array-input-component.md) - Para relaciones 1:N
- **PropertyName Decorator:** `../../01-decorators/property-name-decorator.md`
- **UI Services:** `../../03-application/ui-services.md`
- **EmptyEntity:** `../../02-base-entity/base-entity-core.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual, con limitaciones documentadas)
