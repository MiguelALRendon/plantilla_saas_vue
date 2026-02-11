# 🎯 TabOrder Decorator

**Referencias:**
- `property-index-decorator.md` - PropertyIndex controla orden visual, TabOrder controla navegación
- `required-decorator.md` - TabOrder útil para guiar hacia campos requeridos
- `disabled-decorator.md` - Campos disabled se saltan en tab order
- `view-group-decorator.md` - TabOrder dentro de grupos
- `../../02-base-entity/base-entity-core.md` - getTabOrder() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/tab_order_decorator.ts`

---

## 🎯 Propósito

El decorador `@TabOrder()` controla el **orden de navegación con la tecla Tab** en formularios, permitiendo definir una secuencia lógica independiente del orden visual de los campos.

**Beneficios:**
- Mejora UX en formularios complejos
- Navegación eficiente con teclado
- Accesibilidad para usuarios con discapacidad
- Control fino de flujo de entrada de datos

---

## 📝 Sintaxis

```typescript
@TabOrder(order: number)
propertyName: Type;
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `order` | `number` | Sí | Índice de orden de navegación (1, 2, 3...) |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/tab_order_decorator.ts

/**
 * Symbol para almacenar metadata de tab order
 */
export const TAB_ORDER_METADATA = Symbol('tabOrder');

/**
 * @TabOrder() - Define el orden de navegación con Tab
 * 
 * @param order - Índice de orden (1, 2, 3...)
 * @returns PropertyDecorator
 */
export function TabOrder(order: number): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[TAB_ORDER_METADATA]) {
            target[TAB_ORDER_METADATA] = {};
        }
        
        // Guardar tab order
        target[TAB_ORDER_METADATA][propertyKey] = order;
    };
}
```

**Ubicación:** `src/decorations/tab_order_decorator.ts` (línea ~1-25)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
User.prototype[TAB_ORDER_METADATA] = {
    'firstName': 1,
    'lastName': 2,
    'email': 3,
    'phone': 4,
    'address': 5,
    'city': 6,
    'state': 7,
    'zipCode': 8
};
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el tab order de una propiedad
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns Índice de tab order o undefined
 */
public getTabOrder(propertyKey: string): number | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    const tabOrderMetadata = constructor.prototype[TAB_ORDER_METADATA];
    
    if (!tabOrderMetadata) {
        return undefined;
    }
    
    return tabOrderMetadata[propertyKey];
}

/**
 * Obtiene el tab order (método estático)
 */
public static getTabOrder(propertyKey: string): number | undefined {
    const tabOrderMetadata = this.prototype[TAB_ORDER_METADATA];
    
    if (!tabOrderMetadata) {
        return undefined;
    }
    
    return tabOrderMetadata[propertyKey];
}

/**
 * Obtiene propiedades ordenadas por tab order
 */
public static getPropertiesByTabOrder(): string[] {
    const properties = this.getProperties();
    const tabOrderMetadata = this.prototype[TAB_ORDER_METADATA];
    
    if (!tabOrderMetadata) {
        // Sin tab order, retornar orden original
        return properties;
    }
    
    // Separar propiedades con y sin tab order
    const withTabOrder: Array<{ prop: string; order: number }> = [];
    const withoutTabOrder: string[] = [];
    
    properties.forEach(prop => {
        const order = tabOrderMetadata[prop];
        if (order !== undefined) {
            withTabOrder.push({ prop, order });
        } else {
            withoutTabOrder.push(prop);
        }
    });
    
    // Ordenar por tab order
    withTabOrder.sort((a, b) => a.order - b.order);
    
    // Combinar: primero con tab order, luego sin orden
    return [
        ...withTabOrder.map(item => item.prop),
        ...withoutTabOrder
    ];
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1440-1520)

---

## 🎨 Impacto en UI

### DetailView con TabOrder

```vue
<!-- src/views/default_detailview.vue -->

<template>
  <div class="detail-view">
    <form @submit.prevent="saveEntity">
      <!-- Campos ordenados por tab order -->
      <div 
        v-for="(prop, index) in orderedProperties" 
        :key="prop"
        class="form-group"
      >
        <component 
          :is="getInputComponent(prop)"
          v-model="entity[prop]"
          :property="prop"
          :entity="entity"
          :tabindex="index + 1"
        />
      </div>
      
      <button type="submit" :tabindex="orderedProperties.length + 1">
        Save
      </button>
      <button type="button" @click="cancel" :tabindex="orderedProperties.length + 2">
        Cancel
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';

const entityClass = computed(() => Application.View.value.entityClass);

// Obtener propiedades ordenadas por tab order
const orderedProperties = computed(() => {
    return entityClass.value.getPropertiesByTabOrder();
});
</script>
```

### TextInput con Tabindex

```vue
<!-- src/components/Form/TextInput.vue -->

<template>
  <div class="form-group">
    <label :for="inputId">
      {{ propertyLabel }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="localValue"
      type="text"
      :tabindex="tabindex"
      :disabled="isDisabled"
      :readonly="isReadOnly"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
    tabindex?: number;  // ← Tab order desde parent
}>();
</script>
```

---

## 🧪 Ejemplos de Uso

### 1. Basic Tab Order

```typescript
import { TabOrder } from '@/decorations/tab_order_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { Required } from '@/decorations/required_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class User extends BaseEntity {
    // Tab order lógico: nombre → apellido → email → teléfono
    @PropertyName('First Name', String)
    @Required()
    @TabOrder(1)  // ← Primera parada
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @Required()
    @TabOrder(2)  // ← Segunda parada
    lastName!: string;
    
    @PropertyName('Email', String)
    @Required()
    @TabOrder(3)  // ← Tercera parada
    email!: string;
    
    @PropertyName('Phone', String)
    @TabOrder(4)  // ← Cuarta parada
    phone!: string;
}

// Usuario presiona Tab:
// firstName → lastName → email → phone → Save button
```

---

### 2. Skip Visual Order

```typescript
export class Product extends BaseEntity {
    // Orden visual en UI: id, name, description, price, stock
    // Orden tab: name → price → stock (skip ID y description)
    
    @PropertyName('Product ID', Number)
    // Sin TabOrder → se ignora en navegación Tab
    id!: number;
    
    @PropertyName('Product Name', String)
    @Required()
    @TabOrder(1)  // ← Primera parada
    name!: string;
    
    @PropertyName('Description', String)
    @StringType(StringTypeEnum.TEXTAREA)
    // Sin TabOrder → al final
    description!: string;
    
    @PropertyName('Price', Number)
    @Required()
    @TabOrder(2)  // ← Segunda parada
    price!: number;
    
    @PropertyName('Stock', Number)
    @Required()
    @TabOrder(3)  // ← Tercera parada
    stock!: number;
}

// Tab order: name → price → stock → description
```

---

### 3. Address Form (Logical Flow)

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Full Name', String)
    @Required()
    @TabOrder(1)
    fullName!: string;
    
    @PropertyName('Email', String)
    @Required()
    @TabOrder(2)
    email!: string;
    
    // Address section
    @PropertyName('Street Address', String)
    @Required()
    @TabOrder(3)
    address!: string;
    
    @PropertyName('City', String)
    @Required()
    @TabOrder(4)
    city!: string;
    
    @PropertyName('State', String)
    @Required()
    @TabOrder(5)
    state!: string;
    
    @PropertyName('ZIP Code', String)
    @Required()
    @TabOrder(6)
    zipCode!: string;
    
    // Contact section
    @PropertyName('Phone', String)
    @TabOrder(7)
    phone!: string;
}

// Flujo natural de arriba hacia abajo
```

---

### 4. Multi-Column Layout

```typescript
export class Employee extends BaseEntity {
    // Layout visual:
    // | firstName | lastName  |
    // | email     | phone     |
    // | department| position  |
    
    // Tab order horizontal: firstName → lastName → email → phone → ...
    
    @PropertyName('First Name', String)
    @TabOrder(1)
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @TabOrder(2)
    lastName!: string;
    
    @PropertyName('Email', String)
    @TabOrder(3)
    email!: string;
    
    @PropertyName('Phone', String)
    @TabOrder(4)
    phone!: string;
    
    @PropertyName('Department', String)
    @TabOrder(5)
    department!: string;
    
    @PropertyName('Position', String)
    @TabOrder(6)
    position!: string;
}
```

---

### 5. Skip Disabled Fields

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @Readonly()
    // Sin TabOrder → disabled field, skip
    id!: number;
    
    @PropertyName('Customer Name', String)
    @Required()
    @TabOrder(1)
    customerName!: string;
    
    @PropertyName('Product', String)
    @Required()
    @TabOrder(2)
    productName!: string;
    
    @PropertyName('Quantity', Number)
    @Required()
    @TabOrder(3)
    quantity!: number;
    
    @PropertyName('Created At', Date)
    @Readonly()
    // Sin TabOrder → auto-generated, skip
    createdAt!: Date;
}

// Tab order solo para campos editables
```

---

### 6. ViewGroups con TabOrder

```typescript
export class Product extends BaseEntity {
    // Basic Info Group (Tab 1-3)
    @PropertyName('Product Name', String)
    @ViewGroup('Basic Info')
    @TabOrder(1)
    name!: string;
    
    @PropertyName('SKU', String)
    @ViewGroup('Basic Info')
    @TabOrder(2)
    sku!: string;
    
    @PropertyName('Category', String)
    @ViewGroup('Basic Info')
    @TabOrder(3)
    category!: string;
    
    // Pricing Group (Tab 4-6)
    @PropertyName('Price', Number)
    @ViewGroup('Pricing')
    @TabOrder(4)
    price!: number;
    
    @PropertyName('Cost', Number)
    @ViewGroup('Pricing')
    @TabOrder(5)
    cost!: number;
    
    @PropertyName('Tax Rate', Number)
    @ViewGroup('Pricing')
    @TabOrder(6)
    taxRate!: number;
    
    // Inventory Group (Tab 7-8)
    @PropertyName('Stock', Number)
    @ViewGroup('Inventory')
    @TabOrder(7)
    stock!: number;
    
    @PropertyName('Reorder Level', Number)
    @ViewGroup('Inventory')
    @TabOrder(8)
    reorderLevel!: number;
}

// Tab order sigue grupos de forma lógica
```

---

### 7. Dynamic TabIndex in Vue

```vue
<template>
  <div class="detail-view">
    <form>
      <!-- Name -->
      <TextInput 
        v-model="entity.name"
        property="name"
        :entity="entity"
        :tabindex="getTabIndex('name')"
      />
      
      <!-- Description -->
      <TextInput 
        v-model="entity.description"
        property="description"
        :entity="entity"
        :tabindex="getTabIndex('description')"
      />
      
      <!-- Price -->
      <NumberInput 
        v-model="entity.price"
        property="price"
        :entity="entity"
        :tabindex="getTabIndex('price')"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    entity: BaseEntity;
}>();

const orderedProperties = computed(() => {
    return (props.entity.constructor as typeof BaseEntity)
        .getPropertiesByTabOrder();
});

function getTabIndex(propertyName: string): number {
    const index = orderedProperties.value.indexOf(propertyName);
    return index >= 0 ? index + 1 : 9999;
}
</script>
```

---

### 8. Conditional Tab Order

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Required()
    @TabOrder(1)
    username!: string;
    
    @PropertyName('Password', String)
    @Required()
    @TabOrder(2)
    password!: string;
    
    @PropertyName('User Type', String)
    @Required()
    @TabOrder(3)
    userType!: 'admin' | 'employee' | 'customer';
    
    // Solo para admin (tab order 4 si es admin)
    @PropertyName('Admin Key', String)
    @TabOrder(4)
    adminKey?: string;
    
    // Para todos (tab order 5)
    @PropertyName('Email', String)
    @Required()
    @TabOrder(5)
    email!: string;
}

// En Vue, ocultar adminKey si no es admin:
<TextInput 
    v-if="entity.userType === 'admin'"
    v-model="entity.adminKey"
    property="adminKey"
    :entity="entity"
    :tabindex="4"
/>

// Si userType !== 'admin', tab salta de 3 a 5
```

---

### 9. Accessibility Enhancement

```vue
<template>
  <div class="form-group">
    <label :for="inputId">
      {{ propertyLabel }}
      <span v-if="isRequired" class="required" aria-label="required">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="localValue"
      type="text"
      :tabindex="tabindex"
      :aria-required="isRequired"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? errorId : helpTextId"
    />
    
    <p v-if="helpText" :id="helpTextId" class="help-text">
      {{ helpText }}
    </p>
    
    <p v-if="errorText" :id="errorId" class="error-text" role="alert">
      {{ errorText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const inputId = computed(() => `input-${props.property}`);
const helpTextId = computed(() => `help-${props.property}`);
const errorId = computed(() => `error-${props.property}`);

const hasError = computed(() => !!props.entity.errors[props.property]);
const errorText = computed(() => props.entity.errors[props.property]);
</script>
```

---

### 10. Complex Form with Sections

```typescript
export class JobApplication extends BaseEntity {
    // Personal Info (1-4)
    @PropertyName('First Name', String)
    @Required()
    @TabOrder(1)
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @Required()
    @TabOrder(2)
    lastName!: string;
    
    @PropertyName('Email', String)
    @Required()
    @TabOrder(3)
    email!: string;
    
    @PropertyName('Phone', String)
    @Required()
    @TabOrder(4)
    phone!: string;
    
    // Address (5-8)
    @PropertyName('Address', String)
    @TabOrder(5)
    address!: string;
    
    @PropertyName('City', String)
    @TabOrder(6)
    city!: string;
    
    @PropertyName('State', String)
    @TabOrder(7)
    state!: string;
    
    @PropertyName('ZIP', String)
    @TabOrder(8)
    zipCode!: string;
    
    // Employment (9-12)
    @PropertyName('Position Applying For', String)
    @Required()
    @TabOrder(9)
    position!: string;
    
    @PropertyName('Desired Salary', Number)
    @TabOrder(10)
    desiredSalary!: number;
    
    @PropertyName('Start Date', Date)
    @TabOrder(11)
    startDate!: Date;
    
    @PropertyName('Resume', String)
    @TabOrder(12)
    resumeUrl!: string;
}

// Tab order guía al usuario a través de secciones lógicas
```

---

## ⚠️ Consideraciones Importantes

### 1. Gaps in Tab Order

```typescript
// ✅ BUENO: Secuencia continua
@TabOrder(1) firstName!: string;
@TabOrder(2) lastName!: string;
@TabOrder(3) email!: string;

// ⚠️ EVITAR: Gaps innecesarios
@TabOrder(1) firstName!: string;
@TabOrder(5) lastName!: string;  // ← Gap de 2-4
@TabOrder(10) email!: string;    // ← Gap de 6-9

// Gaps solo si quieres reservar espacio para propiedades futuras
```

### 2. Conflicting Tab Orders

```typescript
// ❌ MALO: Misma tab order
@TabOrder(1) firstName!: string;
@TabOrder(1) lastName!: string;  // ← Conflicto

// Comportamiento indefinido, orden puede variar
```

### 3. Skip Readonly/Disabled

```typescript
// Readonly/Disabled fields no deberían tener TabOrder
@PropertyName('Created At', Date)
@Readonly()
// @TabOrder(5)  ← NO: campo no editable
createdAt!: Date;

// Excepto si necesitas que sea seleccionable (copy/paste)
@PropertyName('Invoice Number', String)
@Readonly()
@TabOrder(5)  // ← OK si usuario puede querer copiar
invoiceNumber!: string;
```

### 4. Mobile Considerations

```typescript
// En móviles, tab order menos importante (no hay Tab key)
// Pero sigue siendo útil para:
// 1. Lectores de pantalla
// 2. Teclados Bluetooth
// 3. Orden de validación

// Asegurar que tab order tenga sentido también en vertical
```

### 5. Testing Tab Order

```typescript
// Test que tab order esté configurado correctamente
describe('User Entity Tab Order', () => {
    it('should have correct tab order sequence', () => {
        const properties = User.getPropertiesByTabOrder();
        
        expect(properties[0]).toBe('firstName');
        expect(properties[1]).toBe('lastName');
        expect(properties[2]).toBe('email');
        expect(properties[3]).toBe('phone');
    });
    
    it('should not have gaps in tab order', () => {
        const properties = ['firstName', 'lastName', 'email', 'phone'];
        
        properties.forEach(prop => {
            const order = User.getTabOrder(prop);
            expect(order).toBeGreaterThan(0);
        });
        
        // Verificar secuencia continua
        const orders = properties.map(p => User.getTabOrder(p)!);
        for (let i = 0; i < orders.length - 1; i++) {
            expect(orders[i + 1]).toBe(orders[i] + 1);
        }
    });
});
```

---

## 📚 Referencias Adicionales

- `property-index-decorator.md` - Orden visual vs tab order
- `required-decorator.md` - TabOrder para campos requeridos
- `disabled-decorator.md` - Disabled fields skip tab
- `readonly-decorator.md` - Readonly fields tab behavior
- `view-group-decorator.md` - TabOrder dentro de grupos
- `../../02-base-entity/base-entity-core.md` - getTabOrder(), getPropertiesByTabOrder()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/tab_order_decorator.ts`  
**Líneas:** ~25
