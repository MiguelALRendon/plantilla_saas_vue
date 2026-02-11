# ✅ Required Decorator

**Referencias:**
- `property-name-decorator.md` - PropertyName
- `validation-decorator.md` - Validation
- `async-validation-decorator.md` - AsyncValidation
- `../02-base-entity/validation-system.md` - Sistema de validación
- `../04-components/form-inputs.md` - Inputs

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/required_decorator.ts`

---

## 🎯 Propósito

Marca una propiedad como **obligatoria**, habilitando validación automática de campo requerido en la UI.

---

## 🔑 Símbolo de Metadatos

```typescript
export const REQUIRED_KEY = Symbol('required');
```

### Almacenamiento

```typescript
proto[REQUIRED_KEY] = {
    'email': { 
        condition: true,
        message: 'Email is required'
    },
    'weight': {
        validation: (entity) => entity.type === 'physical',
        message: 'Weight required for physical products'
    }
}
```

---

## 💻 Firma del Decorador

```typescript
function Required(
    conditionOrValidation: boolean | ((instance: any) => boolean),
    message?: string
): PropertyDecorator
```

### Tipos

```typescript
export type RequiredCondition = boolean | ((instance: any) => boolean);

export interface RequiredMetadata {
    condition?: RequiredCondition;    // Si tiene mensaje
    message?: string;
    validation?: RequiredCondition;   // Si NO tiene mensaje
}
```

---

## 📖 Uso Básico

### Required Siempre (Incondicional)

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Name', String)
    @Required(true)
    name!: string;
    
    @PropertyName('Email', String)
    @Required(true)
    email!: string;
}
```

**Resultado:**
- Asterisco rojo (*) en label
- Validación: campo no puede estar vacío
- Mensaje por defecto: "Field is required"

### Required con Mensaje Custom

```typescript
export class Product extends BaseEntity {
    @PropertyName('SKU', String)
    @Required(true, 'Product SKU is mandatory')
    sku!: string;
}
```

**Resultado:**
- Mensaje personalizado: "Product SKU is mandatory"

---

## 🔀 Required Condicional

### Basado en Otra Propiedad

```typescript
export class Product extends BaseEntity {
    @PropertyName('Type', ProductType)
    type!: ProductType;
    
    @PropertyName('Weight', Number)
    @Required((entity) => entity.type === 'physical')
    weight?: number;
    
    @PropertyName('Download Link', String)
    @Required((entity) => entity.type === 'digital')
    downloadLink?: string;
}
```

**Comportamiento:**
- Si `type === 'physical'` → `weight` es required
- Si `type === 'digital'` → `downloadLink` es required
- La validación se reevalúa reactivamente cuando `type` cambia

### Basado en Múltiples Condiciones

```typescript
export class Order extends BaseEntity {
    @PropertyName('Status', OrderStatus)
    status!: OrderStatus;
    
    @PropertyName('Payment Method', String)
    paymentMethod?: string;
    
    @PropertyName('Credit Card', String)
    @Required((entity) => {
        return entity.status === 'paid' && 
               entity.paymentMethod === 'credit_card';
    }, 'Credit card required for paid orders')
    creditCard?: string;
}
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos de Instancia

#### `isRequired(key: string): boolean`
Verifica si una propiedad es requerida.

```typescript
// Uso
const product = new Product({ type: 'physical' });
product.isRequired('weight');  // true
product.isRequired('downloadLink');  // false

// Ubicación en BaseEntity (línea ~350)
public isRequired(key: string): boolean {
    const required = (this.constructor as any).prototype[REQUIRED_KEY]?.[key];
    if (!required) return false;
    
    const condition = required.condition ?? required.validation;
    if (typeof condition === 'function') {
        return condition(this);
    }
    return Boolean(condition);
}
```

#### `requiredMessage(key: string): string`
Obtiene el mensaje de required.

```typescript
// Uso
product.requiredMessage('weight');
// Retorna: "Weight required for physical products"
// O por defecto: "Field is required"

// Ubicación en BaseEntity (línea ~365)
public requiredMessage(key: string): string {
    const required = (this.constructor as any).prototype[REQUIRED_KEY]?.[key];
    return required?.message || 'Field is required';
}
```

---

## 🎨 Impacto en UI

### En Input Components

Todos los inputs usan el composable `useInputMetadata`:

```typescript
// En src/composables/useInputMetadata.ts
const metadata = {
    required: computed(() => entity.isRequired(propertyKey)),
    requiredMessage: computed(() => entity.requiredMessage(propertyKey))
}
```

### Visual en Formulario

```vue
<template>
  <div :class="{ 'non-validated': !isInputValidated }">
    <label>
      {{ metadata.propertyName }}
      <span v-if="metadata.required.value" class="required">*</span>
    </label>
    
    <input v-model="modelValue" />
    
    <div class="validation-messages">
      <span v-for="message in validationMessages">
        {{ message }}
      </span>
    </div>
  </div>
</template>
```

**Resultado visual:**
```
Product Name *
[                    ]
↑ Asterisco rojo si required
```

### Validación en Tiempo Real

```typescript
// En cada input component
async isValidated(): Promise<boolean> {
    let validated = true;
    this.validationMessages = [];
    
    // Validación Required
    if (this.metadata.required.value && (!this.modelValue || this.modelValue.trim() === '')) {
        validated = false;
        this.validationMessages.push(
            this.metadata.requiredMessage.value
        );
    }
    
    // ... otras validaciones
    
    return validated;
}
```

**Ubicación:** `src/components/Form/TextInputComponent.vue` (línea ~70)

---

## 🔗 Decoradores Relacionados

### Usado Frecuentemente Con

```typescript
@PropertyIndex(1)
@PropertyName('Email', String)
@Required(true)                     // ← Este decorador
@StringTypeDef(StringType.EMAIL)    // Tipo específico
@Validation(                        // Validación adicional
    (entity) => entity.email.includes('@'),
    'Invalid email format'
)
@AsyncValidation(                   // Validación asíncrona
    async (entity) => await checkEmailUnique(entity.email),
    'Email already exists'
)
email!: string;
```

### Jerarquía de Validación

```
1. Required  ← Primera validación (más básica)
2. Validation (sync)
3. AsyncValidation (async)
```

---

## ⚠️ Consideraciones Importantes

### 1. Solo Valida Vacío

`@Required` solo verifica si el valor existe, NO valida formato:

```typescript
// Required verifica que haya valor
@Required(true)
@PropertyName('Email', String)
email!: string;

// Usuario escribe: "abc"
// Required: ✅ PASA (hay valor)
// Pero no es un email válido

// Para validar formato, usa @Validation o StringType.EMAIL
@Required(true)
@StringTypeDef(StringType.EMAIL)  // HTML5 email validation
email!: string;
```

### 2. Valores Falsy

Cuidado con valores que son válidos pero "falsy":

```typescript
@PropertyName('Quantity', Number)
@Required(true)
quantity!: number;

// Usuario ingresa: 0
// Required falla porque 0 es falsy

// SOLUCIÓN: Usar Validation custom
@Validation((entity) => entity.quantity !== undefined && entity.quantity !== null)
quantity!: number;
```

### 3. Orden de Decoradores

El orden NO importa técnicamente, pero por convención:

```typescript
// ✅ RECOMENDADO (Orden lógico)
@PropertyIndex(1)
@ViewGroup('Info')
@PropertyName('Name', String)
@Required(true)
@HelpText('Enter name')
name!: string;

// ✅ También funciona (pero menos legible)
@Required(true)
@PropertyName('Name', String)
@PropertyIndex(1)
name!: string;
```

### 4. Required Condicional y Reactividad

Las condiciones se reevalúan en tiempo real:

```typescript
@PropertyName('Type', String)
type!: string;

@Required((entity) => entity.type === 'premium')
premium_feature?: string;

// Usuario selecciona type = 'premium'
// → Automáticamente premium_feature se vuelve required
// → El asterisco (*) aparece
// → La validación se activa
```

---

## 🧪 Ejemplos Avanzados

### Múltiples Condiciones Complejas

```typescript
export class ShippingOrder extends BaseEntity {
    @PropertyName('Shipping Method', String)
    shippingMethod!: string;
    
    @PropertyName('Is International', Boolean)
    isInternational!: boolean;
    
    @PropertyName('Country', String)
    country?: string;
    
    @PropertyName('Customs Declaration', String)
    @Required((entity) => {
        return entity.shippingMethod === 'express' && 
               entity.isInternational === true &&
               entity.country !== 'USA';
    }, 'Customs declaration required for international express orders outside USA')
    customsDeclaration?: string;
}
```

### Required Basado en Permisos (Avanzado)

```typescript
export class Document extends BaseEntity {
    @PropertyName('Approver', User)
    @Required((entity) => {
        // Solo required si el usuario actual tiene permiso de aprobar
        return Application.currentUser?.hasPermission('documents.approve');
    }, 'Approver required for users with approval permissions')
    approver?: User;
}
```

### Required con Validación de Rango

```typescript
export class Product extends BaseEntity {
    @PropertyName('Min Stock', Number)
    @Required(true)
    minStock!: number;
    
    @PropertyName('Max Stock', Number)
    @Required((entity) => {
        // Max stock solo required si min stock > 0
        return entity.minStock > 0;
    })
    @Validation((entity) => {
        // Si max stock existe, debe ser mayor que min stock
        if (entity.maxStock !== undefined) {
            return entity.maxStock > entity.minStock;
        }
        return true;
    }, 'Max stock must be greater than min stock')
    maxStock?: number;
}
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function Required(
    conditionOrValidation: RequiredCondition, 
    message?: string
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        if (!proto[REQUIRED_KEY]) {
            proto[REQUIRED_KEY] = {};
        }
        
        const metadata: RequiredMetadata = message !== undefined 
            ? { condition: conditionOrValidation, message: message }
            : { validation: conditionOrValidation };
        
        proto[REQUIRED_KEY][propertyKey] = metadata;
    };
}
```

### Lógica de Validación

```typescript
// En BaseEntity
public async validateInputs(): Promise<boolean> {
    Application.View.value.isValid = true;
    
    // Emitir evento para que todos los inputs validen
    Application.eventBus.emit('validate-inputs');
    
    // Esperar a que inputs procesen
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar resultado
    if (!Application.View.value.isValid) {
        Application.ApplicationUIService.showToast(
            'Please fix validation errors',
            ToastType.ERROR
        );
        return false;
    }
    
    return true;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~630)

---

## 📊 Flujo de Validación Required

```
1. Usuario escribe en input
        ↓
2. v-model actualiza entity[propertyKey]
        ↓
3. Input component detecta cambio (watch/input event)
        ↓
4. Llama a isValidated()
        ↓
5. Verifica: entity.isRequired(propertyKey)
        ↓
6. Si required && valor vacío:
   - isInputValidated = false
   - validationMessages.push(requiredMessage)
   - Clase CSS 'non-validated' se agrega
   - Mensaje se muestra en UI
        ↓
7. Si required && valor tiene contenido:
   - Pasa al siguiente nivel de validación
   - (Validation sync → AsyncValidation)
```

---

## 🎓 Casos de Uso Comunes

### 1. Formularios de Registro
```typescript
@Required(true)
@PropertyName('Username', String)
username!: string;

@Required(true)
@StringTypeDef(StringType.EMAIL)
email!: string;

@Required(true)
@StringTypeDef(StringType.PASSWORD)
password!: string;
```

### 2. Direcciones Opcionales con Campos Requeridos
```typescript
@PropertyName('Has Shipping Address', Boolean)
hasShippingAddress!: boolean;

@Required((e) => e.hasShippingAddress)
shippingStreet?: string;

@Required((e) => e.hasShippingAddress)
shippingCity?: string;

@Required((e) => e.hasShippingAddress)
shippingZip?: string;
```

### 3. Formularios de Pago
```typescript
@Required(true)
@PropertyName('Payment Method', PaymentMethod)
paymentMethod!: PaymentMethod;

@Required((e) => e.paymentMethod === 'credit_card')
cardNumber?: string;

@Required((e) => e.paymentMethod === 'credit_card')
cardCVV?: string;
```

---

## 📚 Referencias Adicionales

- `validation-decorator.md` - Validaciones síncronas custom
- `async-validation-decorator.md` - Validaciones asíncronas
- `../02-base-entity/validation-system.md` - Sistema completo
- `../04-components/form-inputs.md` - Componentes de formulario

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/required_decorator.ts`
