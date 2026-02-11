# 🔄 AsyncValidation Decorator

**Referencias:**
- `required-decorator.md` - Required
- `validation-decorator.md` - Validation
- `property-name-decorator.md` - PropertyName
- `../02-base-entity/validation-system.md` - Sistema de validación

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/async_validation_decorator.ts`

---

## 🎯 Propósito

Define validaciones **asíncronas** que requieren llamadas a servidor o APIs externas. Se ejecuta después de Required y Validation, permitiendo validaciones complejas como verificar unicidad de valores, disponibilidad de recursos, o validaciones de negocio que requieren datos del backend.

---

## 🔑 Símbolo de Metadatos

```typescript
export const ASYNC_VALIDATION_KEY = Symbol('async_validation');
```

### Almacenamiento

```typescript
proto[ASYNC_VALIDATION_KEY] = {
    'email': {
        validation: async (entity) => {
            const response = await fetch(`/api/check-email?email=${entity.email}`);
            return response.json().available;
        },
        message: 'Email already exists'
    },
    'username': {
        validation: async (entity) => await checkUsernameAvailable(entity.username),
        message: 'Username is taken'
    }
}
```

---

## 💻 Firma del Decorador

```typescript
function AsyncValidation(
    validation: (instance: any) => Promise<boolean>,
    message: string
): PropertyDecorator
```

### Tipos

```typescript
export interface AsyncValidationMetadata {
    validation: (instance: any) => Promise<boolean>;
    message: string;
}
```

---

## 📖 Uso Básico

### Verificar Unicidad en Servidor

```typescript
export class User extends BaseEntity {
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @AsyncValidation(
        async (entity) => {
            // Llamada a API para verificar si email existe
            const response = await fetch(
                `/api/users/check-email?email=${entity.email}&excludeId=${entity.id || ''}`
            );
            const data = await response.json();
            return data.available;  // true = disponible, false = ya existe
        },
        'Email already registered'
    )
    email!: string;
}
```

### Usando Axios (Recomendado)

```typescript
import Application from '@/models/application';

export class Product extends BaseEntity {
    @PropertyName('SKU', String)
    @Required(true)
    @AsyncValidation(
        async (entity) => {
            try {
                const response = await Application.axiosInstance.get(
                    `/api/products/check-sku`,
                    {
                        params: {
                            sku: entity.sku,
                            excludeId: entity.id
                        }
                    }
                );
                return response.data.available;
            } catch (error) {
                console.error('SKU check failed:', error);
                return true;  // En caso de error, permitir (o false para bloquear)
            }
        },
        'SKU already exists in system'
    )
    sku!: string;
}
```

---

## 🔀 Validaciones Condicionales

### Validar Solo Si Campo Tiene Valor

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Tax ID', String)
    @AsyncValidation(
        async (entity) => {
            // No validar si está vacío (dejar que @Required lo maneje)
            if (!entity.taxId) return true;
            
            const response = await Application.axiosInstance.get(
                `/api/validate-tax-id?taxId=${entity.taxId}`
            );
            return response.data.valid;
        },
        'Invalid or existing Tax ID'
    )
    taxId?: string;
}
```

### Validar Basado en Otra Propiedad

```typescript
export class Order extends BaseEntity {
    @PropertyName('Country', String)
    country!: string;
    
    @PropertyName('Postal Code', String)
    @AsyncValidation(
        async (entity) => {
            if (!entity.postalCode || !entity.country) return true;
            
            // Validar código postal según país
            const response = await Application.axiosInstance.post(
                '/api/validate-postal-code',
                {
                    postalCode: entity.postalCode,
                    country: entity.country
                }
            );
            return response.data.valid;
        },
        'Invalid postal code for selected country'
    )
    postalCode?: string;
}
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos de Instancia

#### `isAsyncValidation(key: string): Promise<boolean>`
Evalúa validación asíncrona de una propiedad.

```typescript
// Uso
const user = new User({ email: 'test@example.com' });
const isValid = await user.isAsyncValidation('email');
// Retorna: true (disponible) o false (ya existe)

// Ubicación en BaseEntity (línea ~395)
public async isAsyncValidation(key: string): Promise<boolean> {
    const asyncValidation = (this.constructor as any).prototype[ASYNC_VALIDATION_KEY]?.[key];
    if (!asyncValidation) return true;  // Sin validación = válido
    
    try {
        const validation = asyncValidation.validation;
        const result = await validation(this);
        return result;
    } catch (error) {
        console.error(`[AsyncValidation] Error validating ${key}:`, error);
        return false;  // En error, considerar inválido
    }
}
```

#### `asyncValidationMessage(key: string): string`
Obtiene mensaje de validación asíncrona.

```typescript
// Uso
user.asyncValidationMessage('email');
// Retorna: "Email already registered"

// Ubicación en BaseEntity (línea ~410)
public asyncValidationMessage(key: string): string {
    const asyncValidation = (this.constructor as any).prototype[ASYNC_VALIDATION_KEY]?.[key];
    return asyncValidation?.message || 'Async validation failed';
}
```

---

## 🎨 Impacto en UI

### Indicador de Cargando

Mientras se ejecuta la validación asíncrona, el input muestra un indicador de loading:

```vue
<template>
  <div class="async-input" :class="{ validating: isValidating }">
    <label>{{ metadata.propertyName }}</label>
    
    <div class="input-wrapper">
      <input v-model="modelValue" @blur="handleBlur" />
      
      <!-- Spinner mientras valida -->
      <span v-if="isValidating" class="spinner">⏳</span>
      
      <!-- Check o X según resultado -->
      <span v-else-if="hasValidated">
        <span v-if="isValid" class="valid">✅</span>
        <span v-else class="invalid">❌</span>
      </span>
    </div>
    
    <div class="validation-messages">
      <span v-for="message in validationMessages">{{ message }}</span>
    </div>
  </div>
</template>
```

### Validación en Tiempo Real con Debounce

Para evitar demasiadas llamadas al servidor:

```typescript
export default {
    data() {
        return {
            isValidating: false,
            debounceTimer: null as any
        }
    },
    watch: {
        modelValue(newValue) {
            // Cancelar timer previo
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            
            // Esperar 500ms antes de validar
            this.debounceTimer = setTimeout(async () => {
                await this.validateAsync();
            }, 500);
        }
    },
    methods: {
        async validateAsync() {
            this.isValidating = true;
            
            // Ejecutar validación
            const isValid = await this.entity.isAsyncValidation(this.propertyKey);
            
            this.isValidating = false;
            
            if (!isValid) {
                this.validationMessages.push(
                    this.entity.asyncValidationMessage(this.propertyKey)
                );
            }
        }
    }
}
```

**Ubicación:** `src/components/Form/TextInputComponent.vue` (línea ~85)

---

## 🔗 Decoradores Relacionados

### Stack Completo de Validación

```typescript
@PropertyIndex(1)
@PropertyName('Username', String)
@Required(true)                    // Nivel 1: No vacío
@Validation(                       // Nivel 2: Formato (sync)
    (entity) => /^[a-zA-Z0-9_]{3,20}$/.test(entity.username),
    'Username: 3-20 chars, alphanumeric and underscore only'
)
@AsyncValidation(                  // Nivel 3: Disponibilidad (async) ← ESTE
    async (entity) => {
        const response = await fetch(`/api/check-username?username=${entity.username}`);
        return (await response.json()).available;
    },
    'Username already taken'
)
username!: string;
```

### Orden de Ejecución

```
Usuario escribe → Nivel 1: Required
                      ↓ (pasa)
                  Nivel 2: Validation (sync)
                      ↓ (pasa)
                  Nivel 3: AsyncValidation (async) ← AQUÍ
                      ↓ (hace fetch)
                      ↓ (espera respuesta)
                      ↓ (retorna true/false)
```

---

## ⚠️ Consideraciones Importantes

### 1. Siempre Retornar Boolean

La función debe retornar `Promise<boolean>`:

```typescript
// ✅ CORRECTO
@AsyncValidation(
    async (entity) => {
        const response = await fetch(`/api/check`);
        const data = await response.json();
        return data.available;  // boolean
    },
    'Already exists'
)

// ❌ INCORRECTO
@AsyncValidation(
    async (entity) => {
        const response = await fetch(`/api/check`);
        return response;  // ❌ No es boolean
    },
    'Already exists'
)
```

### 2. Manejo de Errores

Siempre usa try-catch:

```typescript
@AsyncValidation(
    async (entity) => {
        try {
            const response = await Application.axiosInstance.get('/api/check');
            return response.data.available;
        } catch (error) {
            console.error('Validation error:', error);
            
            // Decidir qué hacer en caso de error:
            // Opción 1: Permitir (return true)
            // Opción 2: Bloquear (return false)
            // Opción 3: Re-throw para mostrar error diferente
            
            return true;  // En error de red, permitir
        }
    },
    'Validation failed'
)
```

### 3. Performance - Usar Debounce

Para evitar spam de requests:

```typescript
// ❌ MAL: Valida en cada tecla
@AsyncValidation(
    async (entity) => await checkEmail(entity.email),
    'Email exists'
)

// ✅ BIEN: Input component implementa debounce de 500ms
// Ver sección "Validación en Tiempo Real con Debounce"
```

### 4. Excluir ID Actual al Editar

Al validar unicidad en edición, excluye el registro actual:

```typescript
@AsyncValidation(
    async (entity) => {
        const response = await Application.axiosInstance.get(
            `/api/check-email`,
            {
                params: {
                    email: entity.email,
                    excludeId: entity.id || null  // ← Importante
                }
            }
        );
        return response.data.available;
    },
    'Email already exists'
)
email!: string;

// Backend debe ignorar el registro con ese ID:
// SELECT COUNT(*) FROM users WHERE email = ? AND id != ?
```

### 5. Timeout

Configura timeout para validaciones lentas:

```typescript
@AsyncValidation(
    async (entity) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);  // 5s
        
        try {
            const response = await fetch(`/api/slow-check`, {
                signal: controller.signal
            });
            clearTimeout(timeout);
            return (await response.json()).valid;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('Validation timeout');
                return true;  // Permitir en timeout
            }
            throw error;
        }
    },
    'Validation timeout or failed'
)
```

---

## 🧪 Ejemplos Avanzados

### 1. Validar Disponibilidad de Slot

```typescript
export class Appointment extends BaseEntity {
    @PropertyName('Date Time', Date)
    dateTime!: Date;
    
    @PropertyName('Doctor', Doctor)
    doctor!: Doctor;
    
    @PropertyName('Duration (minutes)', Number)
    @AsyncValidation(
        async (entity) => {
            if (!entity.dateTime || !entity.doctor) return true;
            
            const response = await Application.axiosInstance.post(
                '/api/appointments/check-availability',
                {
                    dateTime: entity.dateTime,
                    doctorId: entity.doctor.id,
                    duration: entity.duration,
                    excludeAppointmentId: entity.id
                }
            );
            return response.data.available;
        },
        'Time slot not available for selected doctor'
    )
    duration!: number;
}
```

### 2. Validar Crédito de Cliente

```typescript
export class PurchaseOrder extends BaseEntity {
    @PropertyName('Customer', Customer)
    customer!: Customer;
    
    @PropertyName('Total Amount', Number)
    @AsyncValidation(
        async (entity) => {
            if (!entity.customer || !entity.totalAmount) return true;
            
            const response = await Application.axiosInstance.get(
                `/api/customers/${entity.customer.id}/credit-check`,
                { params: { amount: entity.totalAmount } }
            );
            
            return response.data.approved;
        },
        'Customer credit limit exceeded or credit check failed'
    )
    totalAmount!: number;
}
```

### 3. Validar Dominio de Email Corporativo

```typescript
export class Employee extends BaseEntity {
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @AsyncValidation(
        async (entity) => {
            if (!entity.email) return true;
            
            const domain = entity.email.split('@')[1];
            
            // Verificar que el dominio sea válido y permitido
            const response = await Application.axiosInstance.get(
                '/api/validate-email-domain',
                { params: { domain } }
            );
            
            return response.data.valid && response.data.allowed;
        },
        'Email must be from an approved corporate domain'
    )
    email!: string;
}
```

### 4. Validar Stock Disponible

```typescript
export class OrderItem extends BaseEntity {
    @PropertyName('Product', Product)
    product!: Product;
    
    @PropertyName('Quantity', Number)
    @Required(true)
    @Validation((e) => e.quantity > 0, 'Quantity must be positive')
    @AsyncValidation(
        async (entity) => {
            if (!entity.product || !entity.quantity) return true;
            
            const response = await Application.axiosInstance.get(
                `/api/products/${entity.product.id}/check-stock`,
                { params: { quantity: entity.quantity } }
            );
            
            if (!response.data.available) {
                // Opcionalmente, actualizar mensaje con stock actual
                entity._asyncValidationCustomMessage = 
                    `Only ${response.data.availableStock} units available`;
                return false;
            }
            
            return true;
        },
        'Insufficient stock'
    )
    quantity!: number;
}
```

### 5. Validar Código de Cupón

```typescript
export class Order extends BaseEntity {
    @PropertyName('Coupon Code', String)
    @AsyncValidation(
        async (entity) => {
            if (!entity.couponCode) return true;  // Cupón opcional
            
            const response = await Application.axiosInstance.post(
                '/api/coupons/validate',
                {
                    code: entity.couponCode,
                    customerId: entity.customer?.id,
                    orderTotal: entity.subtotal,
                    orderDate: entity.orderDate
                }
            );
            
            if (response.data.valid) {
                // Actualizar descuento automáticamente
                entity.discount = response.data.discountAmount;
                return true;
            }
            
            return false;
        },
        'Invalid or expired coupon code'
    )
    couponCode?: string;
}
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function AsyncValidation(
    validation: (instance: any) => Promise<boolean>,
    message: string
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        if (!proto[ASYNC_VALIDATION_KEY]) {
            proto[ASYNC_VALIDATION_KEY] = {};
        }
        
        proto[ASYNC_VALIDATION_KEY][propertyKey] = {
            validation: validation,
            message: message
        };
    };
}
```

### Validación Global en save()

```typescript
// En BaseEntity.save()
public async save(): Promise<this> {
    // ...validaciones previas...
    
    // Validar inputs (incluye async validation)
    if (!await this.validateInputs()) {
        return this;
    }
    
    // ...continuar con guardado...
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~710)

---

## 📊 Flujo de Validación Asíncrona

```
1. Usuario completa campo y hace blur (o debounce expira)
        ↓
2. Input component llama this.validateAsync()
        ↓
3. Muestra spinner de loading (isValidating = true)
        ↓
4. Llama entity.isAsyncValidation(propertyKey)
        ↓
5. BaseEntity obtiene metadata de ASYNC_VALIDATION_KEY
        ↓
6. Ejecuta función: await validation(entity)
        ↓
7. Función hace fetch/axios al servidor
        ↓ (espera...)
8. Servidor procesa y retorna { available: true/false }
        ↓
9. Función retorna boolean
        ↓
10. Input recibe resultado
        ↓
11. Si false:
    - isValidating = false
    - isValid = false
    - validationMessages.push(asyncValidationMessage)
    - Muestra ❌ y mensaje de error
        ↓
12. Si true:
    - isValidating = false
    - isValid = true
    - Muestra ✅
```

---

## 🎓 Casos de Uso Comunes

### 1. Unicidad de Valores
```typescript
@AsyncValidation(
    async (e) => await checkUnique(e.value),
    'Value already exists'
)
```

### 2. Validar con API Externa
```typescript
@AsyncValidation(
    async (e) => await validateZipCode(e.zipCode, e.country),
    'Invalid zip code'
)
```

### 3. Disponibilidad de Recursos
```typescript
@AsyncValidation(
    async (e) => await checkAvailability(e.resource, e.date),
    'Resource not available'
)
```

### 4. Reglas de Negocio Complejas
```typescript
@AsyncValidation(
    async (e) => await checkBusinessRule(e),
    'Business rule violation'
)
```

---

## 📚 Referencias Adicionales

- `required-decorator.md` - Validación required
- `validation-decorator.md` - Validaciones síncronas
- `../02-base-entity/validation-system.md` - Sistema completo
- `../../tutorials/02-validations.md` - Tutorial de validaciones
- `../../02-FLOW-ARCHITECTURE.md` - Flujo de validación

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/async_validation_decorator.ts`
