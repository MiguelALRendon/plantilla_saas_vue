# 📘 Tutorial 2: Sistema de Validaciones

**Referencias:**
- `01-basic-crud.md` - Tutorial previo
- `../layers/02-base-entity/validation-system.md` - Sistema de validación
- `../layers/01-decorators/required-decorator.md` - @Required
- `../layers/01-decorators/validation-decorator.md` - @Validation
- `../layers/01-decorators/async-validation-decorator.md` - @AsyncValidation

---

## 🎯 Objetivo

Al completar este tutorial, dominarás el sistema de validación de 3 niveles del framework:

- ✅ Validaciones Required
- ✅ Validaciones síncronas
- ✅ Validaciones asíncronas
- ✅ Mensajes de error personalizados
- ✅ Validaciones condicionales
- ✅ Validación manual vs automática

**Tiempo estimado:** 25-30 minutos

---

## 📋 Requisitos Previos

- Haber completado Tutorial 01-basic-crud.md
- Entender decoradores básicos
- Conocer async/await de JavaScript

---

## 🏗️ Niveles de Validación

El framework soporta 3 niveles de validación que se ejecutan en orden:

```
1. Required → 2. Sync Validation → 3. Async Validation
```

Todos se ejecutan cuando:
- Usuario hace click en "Save"
- Se llama manualmente a `entity.validateInputs()`
- Se hace click en "Validate"

---

## 1️⃣ NIVEL 1: Validaciones Required

### Concepto

Verifica que un campo tiene valor antes de guardar.

### Ejemplo Básico

```typescript
import { BaseEntity } from './base_entitiy';
import { PropertyName, Required } from '@/decorations';

export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Name', String)
    @Required(true)  // ← Campo obligatorio
    name!: string;
    
    @PropertyIndex(2)
    @PropertyName('Description', String)
    // No tiene @Required, es opcional
    description?: string;
}
```

**Comportamiento:**
- Si `name` está vacío → muestra error "Field is required"
- Si `description` está vacío → NO muestra error

### Mensaje Personalizado

```typescript
@Required(true, 'El nombre del producto es obligatorio')
name!: string;
```

**Resultado:**  
Error muestra: "El nombre del producto es obligatorio"

### Required Condicional

```typescript
export class Order extends BaseEntity {
    @PropertyName('Tipo', String)
    type!: 'DOMESTIC' | 'INTERNATIONAL';
    
    @PropertyName('Código Postal', String)
    @Required((entity) => entity.type === 'DOMESTIC', 'ZIP code required for domestic orders')
    zipCode?: string;
    
    @PropertyName('País', String)
    @Required((entity) => entity.type === 'INTERNATIONAL', 'Country required for international orders')
    country?: string;
}
```

**Funcionamiento:**
- Si `type = 'DOMESTIC'` → `zipCode` es requerido, `country` opcional
- Si `type = 'INTERNATIONAL'` → `country` es requerido, `zipCode` opcional

**Código real de Required:**
```typescript
export function Required(
    validation: boolean | ((entity: BaseEntity) => boolean),
    message?: string
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        // ... guarda metadata
    };
}
```

---

## 2️⃣ NIVEL 2: Validaciones Síncronas

### Concepto

Valida reglas de negocio usando funciones que se ejecutan en el mismo thread (no async).

### Sintaxis

```typescript
@Validation(
    (entity) => condición_booleana,
    'Mensaje de error si falla'
)
```

### Ejemplo 1: Validación Numérica

```typescript
export class Product extends BaseEntity {
    @PropertyName('Price', Number)
    @Required(true)
    @Validation((entity) => entity.price > 0, 'Price must be greater than 0')
    price!: number;
    
    @PropertyName('Stock', Number)
    @Validation((entity) => entity.stock >= 0, 'Stock cannot be negative')
    stock!: number;
}
```

**Funcionamiento:**
```typescript
product.price = -10;
product.isValidation('price'); // false
product.validationMessage('price'); // 'Price must be greater than 0'

product.price = 99.99;
product.isValidation('price'); // true
```

### Ejemplo 2: Validación de Rango

```typescript
@PropertyName('Age', Number)
@Validation(
    (entity) => entity.age >= 18 && entity.age <= 100,
    'Age must be between 18 and 100'
)
age!: number;
```

### Ejemplo 3: Validación de Formato

```typescript
@PropertyName('Phone', String)
@Validation(
    (entity) => /^\d{10}$/.test(entity.phone),
    'Phone must be 10 digits'
)
phone!: string;
```

### Ejemplo 4: Validación Cross-Field

```typescript
export class DateRange extends BaseEntity {
    @PropertyName('Start Date', Date)
    @Required(true)
    startDate!: Date;
    
    @PropertyName('End Date', Date)
    @Required(true)
    @Validation(
        (entity) => entity.endDate > entity.startDate,
        'End date must be after start date'
    )
    endDate!: Date;
}
```

### Ejemplo 5: Validación Compleja

```typescript
@PropertyName('Discount Percentage', Number)
@Validation(
    (entity) => {
        // Validación compleja con múltiples condiciones
        if (entity.discountPercentage < 0) return false;
        if (entity.discountPercentage > 100) return false;
        
        // Si el tipo es 'VIP', puede tener hasta 50% descuento
        if (entity.customerType === 'VIP') {
            return entity.discountPercentage <= 50;
        }
        
        // Si es cliente normal, máximo 20%
        return entity.discountPercentage <= 20;
    },
    'Invalid discount percentage'
)
discountPercentage!: number;
```

---

## 3️⃣ NIVEL 3: Validaciones Asíncronas

### Concepto

Validaciones que requieren llamadas a API o bases de datos.

### Sintaxis

```typescript
@AsyncValidation(
    async (entity) => {
        const result = await apiCall();
        return result.isValid; // true = válido, false = inválido
    },
    'Mensaje de error si falla'
)
```

### Ejemplo 1: Email Único

```typescript
// En un archivo de servicios
async function checkEmailUnique(email: string): Promise<boolean> {
    try {
        const response = await Application.axiosInstance.get(
            `/api/users/check-email?email=${email}`
        );
        return response.data.isUnique;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

// En la entidad
export class User extends BaseEntity {
    @PropertyName('Email', String)
    @Required(true)
    @StringTypeDef(StringType.EMAIL)
    @AsyncValidation(
        async (entity) => await checkEmailUnique(entity.email),
        'Email already registered'
    )
    email!: string;
}
```

**Funcionamiento:**
```typescript
user.email = 'test@example.com';

// Al guardar o validar:
const isValid = await user.isAsyncValidation('email');
// Llama a la API → retorna true si el email está disponible
```

### Ejemplo 2: Username Único

```typescript
@PropertyName('Username', String)
@Required(true)
@AsyncValidation(
    async (entity) => {
        if (entity.username.length < 3) return true; // No validar si muy corto
        
        const response = await Application.axiosInstance.get(
            `/api/users/check-username?username=${entity.username}`
        );
        return response.data.available;
    },
    'Username is already taken'
)
username!: string;
```

### Ejemplo 3: Validación con Contexto

```typescript
@PropertyName('Code', String)
@AsyncValidation(
    async (entity) => {
        // Solo validar si es un nuevo registro
        if (!entity.isNew()) {
            return true; // Si está editando, no validar el código
        }
        
        const response = await Application.axiosInstance.get(
            `/api/products/check-code?code=${entity.code}`
        );
        return response.data.isUnique;
    },
    'Product code already exists'
)
code!: string;
```

### Ejemplo 4: Validación con Debounce

```typescript
// Función helper con debounce
let debounceTimer: NodeJS.Timeout | null = null;

async function checkWithDebounce(
    value: string, 
    checkFunction: (val: string) => Promise<boolean>
): Promise<boolean> {
    return new Promise((resolve) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(async () => {
            const result = await checkFunction(value);
            resolve(result);
        }, 500); // Espera 500ms después de que el usuario deja de escribir
    });
}

// En la entidad
@AsyncValidation(
    async (entity) => await checkWithDebounce(
        entity.email,
        async (email) => {
            const response = await Application.axiosInstance.get(
                `/api/check-email?email=${email}`
            );
            return response.data.isUnique;
        }
    ),
    'Email already exists'
)
email!: string;
```

---

## 🔄 Flujo Completo de Validación

### Al Hacer Click en "Save"

```
Usuario → Click "Save"
    ↓
BaseEntity.save()
    ↓
validatePersistenceConfiguration() ✓
    ↓
validateInputs()
    ↓
    Emite evento 'validate-inputs'
    ↓
    TODOS los inputs ejecutan isValidated():
        ├─→ NIVEL 1: isRequired() ?
        │   └─→ Si falla: agrega mensaje, validated = false
        │
        ├─→ NIVEL 2: isValidation() ?
        │   └─→ Si falla: agrega mensaje, validated = false
        │
        └─→ NIVEL 3: isAsyncValidation() ?
            └─→ Si falla: agrega mensaje, validated = false
    ↓
    ¿Todos válidos?
    │
    ├─→ SÍ: Continúa con save()
    │         ↓
    │       POST/PUT a API
    │         ↓
    │       Toast de éxito
    │
    └─→ NO: No guarda
            ↓
          Muestra errores en cada input
          ↓
          Application.View.value.isValid = false
```

---

## 🎨 Visualización de Errores

### En el Input

```vue
<div class="TextInput" :class="{ nonvalidated: !isInputValidated }">
    <label>{{ metadata.propertyName }}</label>
    <input v-model="modelValue" />
    
    <!-- Mensajes de error -->
    <div class="validation-messages" v-if="validationMessages.length > 0">
        <span v-for="message in validationMessages" :key="message">
            {{ message }}
        </span>
    </div>
</div>
```

**CSS:**
```css
.TextInput.nonvalidated {
    border-color: #dc3545;
    background-color: #fff5f5;
}

.validation-messages {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}
```

---

## 🧪 Ejemplos Prácticos Completos

### Ejemplo 1: Formulario de Registro

```typescript
@ModuleName('Users')
@ApiEndpoint('/api/users')
@Persistent()
export class User extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Username', String)
    @Required(true, 'Username is required')
    @Validation(
        (entity) => entity.username.length >= 3,
        'Username must be at least 3 characters'
    )
    @AsyncValidation(
        async (entity) => {
            const response = await Application.axiosInstance.get(
                `/api/users/check-username?username=${entity.username}`
            );
            return response.data.available;
        },
        'Username already taken'
    )
    username!: string;
    
    @PropertyIndex(2)
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true, 'Email is required')
    @AsyncValidation(
        async (entity) => {
            const response = await Application.axiosInstance.get(
                `/api/users/check-email?email=${entity.email}`
            );
            return response.data.available;
        },
        'Email already registered'
    )
    email!: string;
    
    @PropertyIndex(3)
    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true, 'Password is required')
    @Validation(
        (entity) => entity.password.length >= 8,
        'Password must be at least 8 characters'
    )
    @Validation(
        (entity) => /[A-Z]/.test(entity.password),
        'Password must contain at least one uppercase letter'
    )
    @Validation(
        (entity) => /[0-9]/.test(entity.password),
        'Password must contain at least one number'
    )
    password!: string;
    
    @PropertyIndex(4)
    @PropertyName('Age', Number)
    @Required(true)
    @Validation(
        (entity) => entity.age >= 18,
        'You must be at least 18 years old'
    )
    age!: number;
}
```

### Ejemplo 2: Validación de Producto

```typescript
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('SKU', String)
    @Required(true)
    @Validation(
        (entity) => /^[A-Z]{3}-\d{4}$/.test(entity.sku),
        'SKU must follow format: ABC-1234'
    )
    @AsyncValidation(
        async (entity) => {
            if (entity.isNew()) {
                const response = await Application.axiosInstance.get(
                    `/api/products/check-sku?sku=${entity.sku}`
                );
                return response.data.isUnique;
            }
            return true;
        },
        'SKU already exists'
    )
    sku!: string;
    
    @PropertyName('Price', Number)
    @Required(true)
    @Validation(
        (entity) => entity.price > 0,
        'Price must be greater than 0'
    )
    @Validation(
        (entity) => entity.price < 1000000,
        'Price seems too high, please verify'
    )
    price!: number;
    
    @PropertyName('Discount', Number)
    @Validation(
        (entity) => {
            if (!entity.discount) return true; // Opcional
            return entity.discount >= 0 && entity.discount <= 100;
        },
        'Discount must be between 0 and 100'
    )
    @Validation(
        (entity) => {
            if (!entity.discount) return true;
            const finalPrice = entity.price * (1 - entity.discount / 100);
            return finalPrice > 0;
        },
        'Final price after discount cannot be 0 or negative'
    )
    discount?: number;
}
```

---

## 🛠️ Validación Manual

### Validar Todo el Formulario

```typescript
const validateAll = async () => {
    const isValid = await product.validateInputs();
    
    if (isValid) {
        Application.ApplicationUIService.showToast(
            'All fields are valid!',
            ToastType.SUCCESS
        );
    } else {
        Application.ApplicationUIService.showToast(
            'Please fix the errors',
            ToastType.ERROR
        );
    }
};
```

### Validar Campo Específico

```typescript
// Validación manual de un solo campo
const validateEmail = async () => {
    const isReq = user.isRequired('email');
    const isSyncValid = user.isValidation('email');
    const isAsyncValid = await user.isAsyncValidation('email');
    
    if (isReq && !user.email) {
        console.log('Email is required');
    }
    
    if (!isSyncValid) {
        console.log(user.validationMessage('email'));
    }
    
    if (!isAsyncValid) {
        console.log(user.asyncValidationMessage('email'));
    }
};
```

---

## ⚡ Mejores Prácticas

### DO ✅

1. **Usar mensajes claros y específicos**
   ```typescript
   @Required(true, 'Please enter the product name')
   // ✅ Claro y específico
   ```

2. **Validar en el frontend Y backend**
   ```typescript
   // Frontend: validación inmediata
   @Validation((e) => e.price > 0, 'Invalid price')
   
   // Backend: también debe validar (no confiar solo en frontend)
   ```

3. **Async validation solo cuando sea necesario**
   ```typescript
   // ✅ Verificar únicos en DB
   @AsyncValidation(async (e) => await checkUnique(e.email), ...)
   
   // ❌ NO usar async para validaciones simples
   @AsyncValidation(async (e) => e.price > 0, ...) // Usar @Validation!
   ```

4. **Combinar validaciones en orden lógico**
   ```typescript
   @Required(true)  // Primero: ¿tiene valor?
   @Validation((e) => e.email.includes('@'))  // Segundo: ¿formato válido?
   @AsyncValidation(async (e) => await checkUnique(e.email))  // Tercero: ¿único?
   ```

### DON'T ❌

1. **No poner lógica compleja en decoradores**
   ```typescript
   // ❌ MAL
   @Validation((entity) => {
       // 50 líneas de código...
   }, 'Error')
   
   // ✅ BIEN
   @Validation((entity) => entity.validateComplexRule(), 'Error')
   
   // Método en la clase:
   private validateComplexRule(): boolean {
       // Lógica compleja aquí
       return result;
   }
   ```

2. **No duplicar validaciones**
   ```typescript
   // ❌ MAL (duplicado)
   @Required(true)
   @Validation((e) => e.name !== '', 'Required') // Redundante!
   
   // ✅ BIEN
   @Required(true, 'Name is required')
   ```

3. **No hacer async validations lentas**
   ```typescript
   // ❌ MAL (sin timeout)
   @AsyncValidation(async (e) => {
       // Puede demorar 30 segundos...
       return await slowApi(e.value);
   })
   
   // ✅ BIEN (con timeout y debounce)
   @AsyncValidation(async (e) => {
       const controller = new AbortController();
       setTimeout(() => controller.abort(), 5000);
       return await apiWithTimeout(e.value, controller.signal);
   })
   ```

---

## 🎓 Ejercicios Prácticos

### Ejercicio 1: Formulario de Contacto

Crear un formulario de contacto con:
- Nombre (requerido, mínimo 2 caracteres)
- Email (requerido, formato válido)
- Teléfono (10 dígitos)
- Mensaje (requerido, entre 10 y 500 caracteres)

<details>
<summary>Ver solución</summary>

```typescript
@ModuleName('Contact')
export class ContactForm extends BaseEntity {
    @PropertyName('Name', String)
    @Required(true, 'Name is required')
    @Validation(
        (e) => e.name.length >= 2,
        'Name must be at least 2 characters'
    )
    name!: string;
    
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true, 'Email is required')
    email!: string;
    
    @PropertyName('Phone', String)
    @Validation(
        (e) => !e.phone || /^\d{10}$/.test(e.phone),
        'Phone must be 10 digits'
    )
    phone?: string;
    
    @PropertyName('Message', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Required(true, 'Message is required')
    @Validation(
        (e) => e.message.length >= 10 && e.message.length <= 500,
        'Message must be between 10 and 500 characters'
    )
    message!: string;
}
```
</details>

### Ejercicio 2: Validación de Tarjeta de Crédito

Crear validación para:
- Número de tarjeta (16 dígitos, algoritmo de Luhn)
- Fecha de expiración (formato MM/YY, no vencida)
- CVV (3 dígitos)

<details>
<summary>Ver solución</summary>

```typescript
export class CreditCard extends BaseEntity {
    @PropertyName('Card Number', String)
    @Required(true)
    @Validation(
        (e) => /^\d{16}$/.test(e.cardNumber),
        'Card number must be 16 digits'
    )
    @Validation(
        (e) => {
            // Algoritmo de Luhn
            let sum = 0;
            let isEven = false;
            for (let i = e.cardNumber.length - 1; i >= 0; i--) {
                let digit = parseInt(e.cardNumber[i]);
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                isEven = !isEven;
            }
            return sum % 10 === 0;
        },
        'Invalid card number'
    )
    cardNumber!: string;
    
    @PropertyName('Expiry Date', String)
    @Required(true)
    @Validation(
        (e) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(e.expiryDate),
        'Format must be MM/YY'
    )
    @Validation(
        (e) => {
            const [month, year] = e.expiryDate.split('/').map(Number);
            const expiry = new Date(2000 + year, month);
            const now = new Date();
            return expiry > now;
        },
        'Card has expired'
    )
    expiryDate!: string;
    
    @PropertyName('CVV', String)
    @Required(true)
    @Validation(
        (e) => /^\d{3}$/.test(e.cvv),
        'CVV must be 3 digits'
    )
    cvv!: string;
}
```
</details>

---

## 🔗 Referencias

- **Siguiente Tutorial:** `03-relations.md` - Relaciones entre entidades
- **Sistema de Validación:** `../layers/02-base-entity/validation-system.md`
- **Decoradores:** `../layers/01-decorators/`
- **Ejemplos:** `../examples/`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
