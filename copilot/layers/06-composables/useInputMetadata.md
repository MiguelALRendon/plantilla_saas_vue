# 🎣 useInputMetadata Composable

**Referencias:**
- `../02-base-entity/metadata-access.md` - Métodos de metadata de BaseEntity
- `../02-base-entity/validation-system.md` - Sistema de validación
- `../04-components/Form/` - Componentes de input que usan este composable
- `../01-decorators/property-name-decorator.md` - @PropertyName
- `../01-decorators/required-decorator.md` - @Required
- `../01-decorators/disabled-decorator.md` - @Disabled
- `../01-decorators/validation-decorator.md` - @Validation
- `../01-decorators/help-text-decorator.md` - @HelpText

---

## 📍 Ubicación en el Código

**Archivo:** `src/composables/useInputMetadata.ts` (líneas 1-38)  
**Función:** `export function useInputMetadata()`

---

## 🎯 Propósito

`useInputMetadata` es un **composable de Vue 3** que proporciona acceso reactivo a los metadatos de una propiedad de BaseEntity. Es el puente entre los decoradores aplicados a las propiedades y los componentes de input.

**Concepto fundamental:**  
> Todos los componentes de formulario (TextInput, NumberInput, etc.) usan este composable para obtener metadata reactiva (nombre, required, disabled, validation, help text) de las propiedades decoradas.

**Ventajas:**
- ✅ **Reactivo** - Los computed se actualizan automáticamente
- ✅ **Centralizado** - Lógica de metadata en un solo lugar
- ✅ **Type-safe** - Retorna interface tipada
- ✅ **Reutilizable** - Usado por todos los inputs

---

## 📝 Firma y Tipos

```typescript
export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entityClass` | `typeof BaseEntity` | Clase de la entidad (para acceder a métodos estáticos) |
| `entity` | `BaseEntity` | Instancia de la entidad (para acceder a métodos de instancia reactivos) |
| `propertyKey` | `string` | Nombre de la propiedad (camelCase) a la que pertenece el input |

### Retorna: InputMetadata

```typescript
export interface InputMetadata {
    propertyName: string;                        // Nombre legible de la propiedad
    required: ComputedRef<boolean>;              // Si es requerida
    disabled: ComputedRef<boolean>;              // Si está deshabilitada
    validated: ComputedRef<boolean>;             // Si pasa la validación
    requiredMessage: ComputedRef<string | undefined>;   // Mensaje de error de required
    validatedMessage: ComputedRef<string | undefined>;  // Mensaje de error de validation
    helpText: ComputedRef<string | undefined>;          // Texto de ayuda
}
```

**Todas las propiedades (excepto `propertyName`) son `ComputedRef` para reactividad automática.**

---

## 🔧 Implementación Completa

```typescript
import type { BaseEntity } from '@/entities/base_entitiy';
import { computed, type ComputedRef } from 'vue';

export interface InputMetadata {
    propertyName: string;
    required: ComputedRef<boolean>;
    disabled: ComputedRef<boolean>;
    validated: ComputedRef<boolean>;
    requiredMessage: ComputedRef<string | undefined>;
    validatedMessage: ComputedRef<string | undefined>;
    helpText: ComputedRef<string | undefined>;
}

export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata {
    // Obtener nombre legible (estático, no reactivo)
    const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;

    // Metadatos reactivos
    const required = computed(() => entity.isRequired(propertyKey));
    const disabled = computed(() => entity.isDisabled(propertyKey));
    const validated = computed(() => entity.isValidation(propertyKey));
    const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
    const validatedMessage = computed(() => entity.validationMessage(propertyKey));
    const helpText = computed(() => entity.getHelpText(propertyKey));

    return {
        propertyName,
        required,
        disabled,
        validated,
        requiredMessage,
        validatedMessage,
        helpText,
    };
}
```

---

## 🎨 Propiedad: propertyName

```typescript
const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;
```

**Tipo:** `string` (NO reactivo)

**Propósito:** Obtiene el nombre legible definido en `@PropertyName()`.

**Fuente:** `BaseEntity.getPropertyNameByKey()` (método estático)

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Unit Price', Number)
    price!: number;
}

const product = new Product({ name: 'Widget', price: 100 });

const metadata1 = useInputMetadata(Product, product, 'name');
console.log(metadata1.propertyName); // 'Product Name'

const metadata2 = useInputMetadata(Product, product, 'price');
console.log(metadata2.propertyName); // 'Unit Price'

// Propiedad sin decorador
const metadata3 = useInputMetadata(Product, product, 'unknownProp');
console.log(metadata3.propertyName); // 'unknownProp' (fallback)
```

**Uso en template:**

```vue
<template>
    <label>{{ metadata.propertyName }}</label>
</template>
```

---

## ✅ Propiedad: required

```typescript
const required = computed(() => entity.isRequired(propertyKey));
```

**Tipo:** `ComputedRef<boolean>` (reactivo)

**Propósito:** Indica si la propiedad es requerida según `@Required()`.

**Fuente:** `entity.isRequired(propertyKey)` (método de instancia)

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('Name', String)
    @Required()
    name!: string;
    
    @PropertyName('Email', String)
    @Required({ condition: (entity) => entity.name !== '' })
    email!: string;
    
    @PropertyName('Phone', String)
    phone?: string;  // Sin @Required
}

const user = new User({ name: '', email: '' });

const nameMetadata = useInputMetadata(User, user, 'name');
console.log(nameMetadata.required.value); // true (siempre requerido)

const emailMetadata = useInputMetadata(User, user, 'email');
console.log(emailMetadata.required.value); // false (name está vacío)

// Cambiar nombre
user.name = 'Alice';
console.log(emailMetadata.required.value); // true (ahora es requerido)

const phoneMetadata = useInputMetadata(User, user, 'phone');
console.log(phoneMetadata.required.value); // false
```

**Uso en template:**

```vue
<template>
    <label>
        {{ metadata.propertyName }}
        <span v-if="metadata.required.value" class="required">*</span>
    </label>
</template>
```

---

## 🔒 Propiedad: disabled

```typescript
const disabled = computed(() => entity.isDisabled(propertyKey));
```

**Tipo:** `ComputedRef<boolean>` (reactivo)

**Propósito:** Indica si la propiedad está deshabilitada según `@Disabled()`.

**Fuente:** `entity.isDisabled(propertyKey)` (método de instancia)

**Ejemplo:**

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order Number', String)
    @Disabled()
    orderNumber!: string;  // Siempre disabled
    
    @PropertyName('Status', String)
    status!: string;
    
    @PropertyName('Discount', Number)
    @Disabled({ condition: (entity) => entity.status === 'completed' })
    discount!: number;
}

const order = new Order({ orderNumber: 'ORD-001', status: 'pending', discount: 0 });

const orderNumMetadata = useInputMetadata(Order, order, 'orderNumber');
console.log(orderNumMetadata.disabled.value); // true

const discountMetadata = useInputMetadata(Order, order, 'discount');
console.log(discountMetadata.disabled.value); // false (status no es 'completed')

// Completar orden
order.status = 'completed';
console.log(discountMetadata.disabled.value); // true (ahora está disabled)
```

**Uso en template:**

```vue
<template>
    <input 
        v-model="entity[propertyKey]"
        :disabled="metadata.disabled.value"
    />
</template>
```

---

## ✔️ Propiedad: validated

```typescript
const validated = computed(() => entity.isValidation(propertyKey));
```

**Tipo:** `ComputedRef<boolean>` (reactivo)

**Propósito:** Indica si la propiedad pasa la validación según `@Validation()`.

**Fuente:** `entity.isValidation(propertyKey)` (método de instancia)

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Price', Number)
    @Validation({
        condition: (entity) => entity.price > 0,
        message: 'El precio debe ser mayor a 0'
    })
    price!: number;
    
    @PropertyName('Stock', Number)
    @Validation({
        condition: (entity) => entity.stock >= 0,
        message: 'El stock no puede ser negativo'
    })
    stock!: number;
}

const product = new Product({ price: -10, stock: 5 });

const priceMetadata = useInputMetadata(Product, product, 'price');
console.log(priceMetadata.validated.value); // false (-10 no pasa validación)

const stockMetadata = useInputMetadata(Product, product, 'stock');
console.log(stockMetadata.validated.value); // true (5 >= 0)

// Corregir precio
product.price = 100;
console.log(priceMetadata.validated.value); // true
```

**Uso en template:**

```vue
<template>
    <input 
        v-model="entity[propertyKey]"
        :class="{ 'is-invalid': !metadata.validated.value }"
    />
    <div v-if="!metadata.validated.value" class="error">
        {{ metadata.validatedMessage.value }}
    </div>
</template>
```

---

## 📝 Propiedad: requiredMessage

```typescript
const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
```

**Tipo:** `ComputedRef<string | undefined>` (reactivo)

**Propósito:** Obtiene el mensaje de error personalizado de `@Required()`.

**Fuente:** `entity.requiredMessage(propertyKey)` (método de instancia)

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('Name', String)
    @Required({ message: 'El nombre es obligatorio' })
    name!: string;
    
    @PropertyName('Email', String)
    @Required({ message: 'Debe proporcionar un email válido' })
    email!: string;
    
    @PropertyName('Phone', String)
    @Required()  // Sin mensaje custom
    phone!: string;
}

const user = new User({});

const nameMetadata = useInputMetadata(User, user, 'name');
console.log(nameMetadata.requiredMessage.value); 
// 'El nombre es obligatorio'

const emailMetadata = useInputMetadata(User, user, 'email');
console.log(emailMetadata.requiredMessage.value);
// 'Debe proporcionar un email válido'

const phoneMetadata = useInputMetadata(User, user, 'phone');
console.log(phoneMetadata.requiredMessage.value);
// undefined (no tiene mensaje custom)
```

**Uso en template:**

```vue
<template>
    <input v-model="entity[propertyKey]" />
    <div v-if="metadata.required.value && !entity[propertyKey]" class="error">
        {{ metadata.requiredMessage.value || 'Este campo es requerido' }}
    </div>
</template>
```

---

## 📝 Propiedad: validatedMessage

```typescript
const validatedMessage = computed(() => entity.validationMessage(propertyKey));
```

**Tipo:** `ComputedRef<string | undefined>` (reactivo)

**Propósito:** Obtiene el mensaje de error de validación de `@Validation()`.

**Fuente:** `entity.validationMessage(propertyKey)` (método de instancia)

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Price', Number)
    @Validation({
        condition: (entity) => entity.price >= 0,
        message: 'El precio no puede ser negativo'
    })
    price!: number;
    
    @PropertyName('Discount', Number)
    @Validation({
        condition: (entity) => entity.discount >= 0 && entity.discount <= 100,
        message: 'El descuento debe estar entre 0 y 100'
    })
    discount!: number;
}

const product = new Product({ price: -50, discount: 150 });

const priceMetadata = useInputMetadata(Product, product, 'price');
console.log(priceMetadata.validatedMessage.value);
// 'El precio no puede ser negativo'

const discountMetadata = useInputMetadata(Product, product, 'discount');
console.log(discountMetadata.validatedMessage.value);
// 'El descuento debe estar entre 0 y 100'
```

**Uso en template:**

```vue
<template>
    <input v-model.number="entity[propertyKey]" />
    <div v-if="!metadata.validated.value" class="error">
        {{ metadata.validatedMessage.value }}
    </div>
</template>
```

---

## ℹ️ Propiedad: helpText

```typescript
const helpText = computed(() => entity.getHelpText(propertyKey));
```

**Tipo:** `ComputedRef<string | undefined>` (reactivo)

**Propósito:** Obtiene el texto de ayuda de `@HelpText()`.

**Fuente:** `entity.getHelpText(propertyKey)` (método de instancia)

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @HelpText('Mínimo 4 caracteres, solo letras y números')
    username!: string;
    
    @PropertyName('Email', String)
    @HelpText('Ejemplo: usuario@dominio.com')
    email!: string;
    
    @PropertyName('Phone', String)
    phone!: string;  // Sin @HelpText
}

const user = new User({});

const usernameMetadata = useInputMetadata(User, user, 'username');
console.log(usernameMetadata.helpText.value);
// 'Mínimo 4 caracteres, solo letras y números'

const emailMetadata = useInputMetadata(User, user, 'email');
console.log(emailMetadata.helpText.value);
// 'Ejemplo: usuario@dominio.com'

const phoneMetadata = useInputMetadata(User, user, 'phone');
console.log(phoneMetadata.helpText.value);
// undefined
```

**Uso en template:**

```vue
<template>
    <label>{{ metadata.propertyName }}</label>
    <input v-model="entity[propertyKey]" />
    <small v-if="metadata.helpText.value" class="help-text">
        {{ metadata.helpText.value }}
    </small>
</template>
```

---

## 🎯 Uso en Componentes de Input

### TextInputComponent.vue

```vue
<template>
    <div class="input-group">
        <label>
            {{ metadata.propertyName }}
            <span v-if="metadata.required.value" class="required">*</span>
        </label>
        
        <input 
            type="text"
            v-model="entity[propertyKey]"
            :disabled="metadata.disabled.value"
            :class="{ 
                'is-invalid': !metadata.validated.value || showRequiredError 
            }"
        />
        
        <!-- Mensaje de error Required -->
        <div v-if="showRequiredError" class="error">
            {{ metadata.requiredMessage.value || 'Este campo es requerido' }}
        </div>
        
        <!-- Mensaje de error Validation -->
        <div v-if="!metadata.validated.value" class="error">
            {{ metadata.validatedMessage.value }}
        </div>
        
        <!-- Texto de ayuda -->
        <small v-if="metadata.helpText.value" class="help-text">
            {{ metadata.helpText.value }}
        </small>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entitiy';

const props = defineProps<{
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
}>();

// 🎣 Usar composable
const metadata = useInputMetadata(
    props.entityClass,
    props.entity,
    props.propertyKey
);

const showRequiredError = computed(() => {
    return metadata.required.value && !props.entity[props.propertyKey];
});
</script>
```

---

### NumberInputComponent.vue

```vue
<template>
    <div class="input-group">
        <label>
            {{ metadata.propertyName }}
            <span v-if="metadata.required.value" class="required">*</span>
        </label>
        
        <input 
            type="number"
            v-model.number="entity[propertyKey]"
            :disabled="metadata.disabled.value"
            :class="{ 'is-invalid': !isValid }"
        />
        
        <div v-if="errorMessage" class="error">
            {{ errorMessage }}
        </div>
        
        <small v-if="metadata.helpText.value" class="help-text">
            {{ metadata.helpText.value }}
        </small>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entitiy';

const props = defineProps<{
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
}>();

const metadata = useInputMetadata(
    props.entityClass,
    props.entity,
    props.propertyKey
);

const isValid = computed(() => {
    const value = props.entity[props.propertyKey];
    
    // Validar required
    if (metadata.required.value && (value === null || value === undefined)) {
        return false;
    }
    
    // Validar @Validation
    return metadata.validated.value;
});

const errorMessage = computed(() => {
    const value = props.entity[props.propertyKey];
    
    // Mensaje de required
    if (metadata.required.value && (value === null || value === undefined)) {
        return metadata.requiredMessage.value || 'Este campo es requerido';
    }
    
    // Mensaje de validation
    if (!metadata.validated.value) {
        return metadata.validatedMessage.value;
    }
    
    return null;
});
</script>
```

---

### BooleanInputComponent.vue

```vue
<template>
    <div class="checkbox-group">
        <label>
            <input 
                type="checkbox"
                v-model="entity[propertyKey]"
                :disabled="metadata.disabled.value"
            />
            {{ metadata.propertyName }}
        </label>
        
        <small v-if="metadata.helpText.value" class="help-text">
            {{ metadata.helpText.value }}
        </small>
    </div>
</template>

<script setup lang="ts">
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entitiy';

const props = defineProps<{
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
}>();

const metadata = useInputMetadata(
    props.entityClass,
    props.entity,
    props.propertyKey
);
</script>
```

---

## 🔄 Reactividad y Comportamiento Dinámico

### Ejemplo 1: Disabled Condicional

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Status', String)
    status!: string;
    
    @PropertyName('Total', Number)
    @Disabled({ condition: (entity) => entity.status === 'paid' })
    total!: number;
}

const invoice = new Invoice({ status: 'pending', total: 100 });
const metadata = useInputMetadata(Invoice, invoice, 'total');

console.log(metadata.disabled.value); // false

// Cambiar estado
invoice.status = 'paid';

// ✅ Reactivo: metadata.disabled se actualiza automáticamente
console.log(metadata.disabled.value); // true
```

**En template:**

```vue
<template>
    <input 
        v-model.number="invoice.total"
        :disabled="metadata.disabled.value"
    />
    <!-- Input se deshabilita automáticamente cuando status = 'paid' -->
</template>
```

---

### Ejemplo 2: Required Condicional

```typescript
export class Order extends BaseEntity {
    @PropertyName('Shipping Required', Boolean)
    shippingRequired!: boolean;
    
    @PropertyName('Shipping Address', String)
    @Required({ condition: (entity) => entity.shippingRequired })
    shippingAddress?: string;
}

const order = new Order({ shippingRequired: false });
const metadata = useInputMetadata(Order, order, 'shippingAddress');

console.log(metadata.required.value); // false

// Activar envío
order.shippingRequired = true;

// ✅ Reactivo: metadata.required se actualiza
console.log(metadata.required.value); // true
```

**En template:**

```vue
<template>
    <label>
        {{ metadata.propertyName }}
        <span v-if="metadata.required.value" class="required">*</span>
        <!-- Asterisco aparece/desaparece dinámicamente -->
    </label>
    <input v-model="order.shippingAddress" />
</template>
```

---

### Ejemplo 3: Validación en Tiempo Real

```typescript
export class User extends BaseEntity {
    @PropertyName('Password', String)
    password!: string;
    
    @PropertyName('Confirm Password', String)
    @Validation({
        condition: (entity) => entity.confirmPassword === entity.password,
        message: 'Las contraseñas no coinciden'
    })
    confirmPassword!: string;
}

const user = new User({ password: 'abc123', confirmPassword: '' });
const metadata = useInputMetadata(User, user, 'confirmPassword');

console.log(metadata.validated.value); // false
console.log(metadata.validatedMessage.value); // 'Las contraseñas no coinciden'

// Usuario escribe en confirmPassword
user.confirmPassword = 'abc123';

// ✅ Reactivo: validación se actualiza
console.log(metadata.validated.value); // true
console.log(metadata.validatedMessage.value); // undefined
```

**En template:**

```vue
<template>
    <input type="password" v-model="user.password" />
    
    <input 
        type="password" 
        v-model="user.confirmPassword"
        :class="{ 'is-invalid': !metadata.validated.value }"
    />
    
    <div v-if="!metadata.validated.value" class="error">
        {{ metadata.validatedMessage.value }}
        <!-- Mensaje se actualiza en tiempo real -->
    </div>
</template>
```

---

## 📋 Ejemplo Completo: Formulario Reactivo

```typescript
// ========================================
// 1. Definir Entidad con Decoradores
// ========================================

@ModuleName('User', 'Users')
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Required({ message: 'El usuario es obligatorio' })
    @Validation({
        condition: (entity) => entity.username.length >= 4,
        message: 'Mínimo 4 caracteres'
    })
    @HelpText('Solo letras y números')
    username!: string;
    
    @PropertyName('Email', String)
    @Required({ message: 'El email es obligatorio' })
    @Validation({
        condition: (entity) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email),
        message: 'Email inválido'
    })
    @HelpText('Ejemplo: usuario@dominio.com')
    email!: string;
    
    @PropertyName('Age', Number)
    @Validation({
        condition: (entity) => entity.age >= 18,
        message: 'Debe ser mayor de 18 años'
    })
    age!: number;
    
    @PropertyName('Subscribe to Newsletter', Boolean)
    subscribe!: boolean;
    
    @PropertyName('Newsletter Email', String)
    @Required({ condition: (entity) => entity.subscribe })
    @Disabled({ condition: (entity) => !entity.subscribe })
    @HelpText('Solo si deseas suscribirte')
    newsletterEmail?: string;
}

// ========================================
// 2. Componente Formulario
// ========================================
```

```vue
<template>
    <form @submit.prevent="save">
        <!-- Username -->
        <div class="input-group">
            <label>
                {{ usernameMetadata.propertyName }}
                <span v-if="usernameMetadata.required.value">*</span>
            </label>
            <input 
                v-model="user.username"
                :class="{ 'is-invalid': !usernameMetadata.validated.value }"
            />
            <div v-if="!usernameMetadata.validated.value" class="error">
                {{ usernameMetadata.validatedMessage.value }}
            </div>
            <small class="help">{{ usernameMetadata.helpText.value }}</small>
        </div>
        
        <!-- Email -->
        <div class="input-group">
            <label>
                {{ emailMetadata.propertyName }}
                <span v-if="emailMetadata.required.value">*</span>
            </label>
            <input 
                type="email"
                v-model="user.email"
                :class="{ 'is-invalid': !emailMetadata.validated.value }"
            />
            <div v-if="!emailMetadata.validated.value" class="error">
                {{ emailMetadata.validatedMessage.value }}
            </div>
            <small class="help">{{ emailMetadata.helpText.value }}</small>
        </div>
        
        <!-- Age -->
        <div class="input-group">
            <label>{{ ageMetadata.propertyName }}</label>
            <input 
                type="number"
                v-model.number="user.age"
                :class="{ 'is-invalid': !ageMetadata.validated.value }"
            />
            <div v-if="!ageMetadata.validated.value" class="error">
                {{ ageMetadata.validatedMessage.value }}
            </div>
        </div>
        
        <!-- Subscribe -->
        <div class="checkbox-group">
            <label>
                <input type="checkbox" v-model="user.subscribe" />
                {{ subscribeMetadata.propertyName }}
            </label>
        </div>
        
        <!-- Newsletter Email (condicional) -->
        <div class="input-group">
            <label>
                {{ newsletterMetadata.propertyName }}
                <span v-if="newsletterMetadata.required.value">*</span>
            </label>
            <input 
                type="email"
                v-model="user.newsletterEmail"
                :disabled="newsletterMetadata.disabled.value"
            />
            <small class="help">{{ newsletterMetadata.helpText.value }}</small>
        </div>
        
        <button type="submit" :disabled="!isFormValid">Guardar</button>
    </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useInputMetadata } from '@/composables/useInputMetadata';
import { User } from '@/entities/user';

const user = ref(new User({ 
    username: '', 
    email: '', 
    age: 0,
    subscribe: false
}));

// 🎣 Metadata para cada campo
const usernameMetadata = useInputMetadata(User, user.value, 'username');
const emailMetadata = useInputMetadata(User, user.value, 'email');
const ageMetadata = useInputMetadata(User, user.value, 'age');
const subscribeMetadata = useInputMetadata(User, user.value, 'subscribe');
const newsletterMetadata = useInputMetadata(User, user.value, 'newsletterEmail');

const isFormValid = computed(() => {
    return usernameMetadata.validated.value
        && emailMetadata.validated.value
        && ageMetadata.validated.value
        && (!newsletterMetadata.required.value || user.value.newsletterEmail);
});

const save = async () => {
    if (!isFormValid.value) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    await user.value.save();
};
</script>
```

---

## ⚠️ Consideraciones Importantes

### 1. propertyName NO es Reactivo

Solo `propertyName` es un string simple (no `ComputedRef`):

```typescript
const metadata = useInputMetadata(User, user, 'name');

console.log(metadata.propertyName);         // string
console.log(metadata.required);             // ComputedRef<boolean>
console.log(metadata.required.value);       // boolean

// ❌ INCORRECTO
console.log(metadata.propertyName.value);   // undefined (no es computed)

// ✅ CORRECTO
console.log(metadata.propertyName);         // 'Name'
```

### 2. Acceso a .value en Template vs Script

En templates de Vue 3, no necesitas `.value` para computed refs:

```vue
<!-- ✅ CORRECTO en template -->
<span v-if="metadata.required">*</span>

<!-- ❌ INCORRECTO en template -->
<span v-if="metadata.required.value">*</span>
```

En script setup, SÍ necesitas `.value`:

```typescript
// ✅ CORRECTO en script
console.log(metadata.required.value);

// ❌ INCORRECTO en script
console.log(metadata.required); // ComputedRef object
```

### 3. Actualización de entity Require Reactividad

Si cambias completamente la instancia de `entity`, necesitas re-llamar `useInputMetadata`:

```typescript
let user = new User({ name: 'Alice' });
const metadata = useInputMetadata(User, user, 'name');

// ❌ INCORRECTO: metadata sigue apuntando al user viejo
user = new User({ name: 'Bob' });

// ✅ CORRECTO: usar ref
const user = ref(new User({ name: 'Alice' }));
const metadata = useInputMetadata(User, user.value, 'name');

// Actualizar
user.value = new User({ name: 'Bob' });
// Necesitas re-crear metadata o usar watchEffect
```

### 4. helpText Puede Ser undefined

Siempre verifica antes de mostrar:

```vue
<!-- ✅ CORRECTO -->
<small v-if="metadata.helpText.value">
    {{ metadata.helpText.value }}
</small>

<!-- ❌ INCORRECTO: muestra "undefined" si no hay help text -->
<small>{{ metadata.helpText.value }}</small>
```

---

## 🔗 Referencias

- **BaseEntity Validation Methods:** `../02-base-entity/validation-system.md`
- **BaseEntity Metadata Methods:** `../02-base-entity/metadata-access.md`
- **Decorators:** `../01-decorators/property-name-decorator.md`, `required-decorator.md`, `validation-decorator.md`, etc.
- **Form Components:** `../04-components/Form/*`

---

**Última actualización:** 11 de Febrero, 2026  
**Archivo fuente:** `src/composables/useInputMetadata.ts`  
**Estado:** ✅ Completo
