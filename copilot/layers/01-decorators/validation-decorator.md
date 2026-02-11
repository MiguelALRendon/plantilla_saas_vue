# ✔️ Validation Decorator

**Referencias:**
- `required-decorator.md` - Required
- `async-validation-decorator.md` - AsyncValidation
- `property-name-decorator.md` - PropertyName
- `../02-base-entity/validation-system.md` - Sistema de validación

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/validation_decorator.ts`

---

## 🎯 Propósito

Define validaciones **síncronas custom** que se evalúan instantáneamente sin llamadas a servidor. Se ejecuta después de la validación Required.

---

## 🔑 Símbolo de Metadatos

```typescript
export const VALIDATION_KEY = Symbol('validation');
```

### Almacenamiento

```typescript
proto[VALIDATION_KEY] = {
    'stock': {
        condition: (entity) => entity.stock >= 0,
        message: 'Stock cannot be negative'
    },
    'email': {
        condition: (entity) => entity.email.includes('@'),
        message: 'Email must contain @'
    }
}
```

---

## 💻 Firma del Decorador

```typescript
function Validation(
    condition: boolean | ((instance: any) => boolean),
    message: string
): PropertyDecorator
```

### Tipos

```typescript
export type ValidationCondition = boolean | ((instance: any) => boolean);

export interface ValidationMetadata {
    condition: ValidationCondition;
    message: string;
}
```

---

## 📖 Uso Básico

### Validación Simple

```typescript
export class Product extends BaseEntity {
    @PropertyName('Stock', Number)
    @Validation((entity) => entity.stock >= 0, 'Stock cannot be negative')
    stock!: number;
    
    @PropertyName('Price', Number)
    @Validation((entity) => entity.price > 0, 'Price must be greater than 0')
    price!: number;
}
```

### Validación con Múltiples Condiciones

```typescript
export class User extends BaseEntity {
    @PropertyName('Age', Number)
    @Validation(
        (entity) => entity.age >= 18 && entity.age <= 120,
        'Age must be between 18 and 120'
    )
    age!: number;
}
```

### Validación Basada en Otra Propiedad

```typescript
export class Product extends BaseEntity {
    @PropertyName('Discount Percentage', Number)
    discount!: number;
    
    @PropertyName('Final Price', Number)
    @Validation(
        (entity) => {
            const discountedPrice = entity.price * (1 - entity.discount / 100);
            return entity.finalPrice === discountedPrice;
        },
        'Final price must match calculated discount'
    )
    finalPrice!: number;
}
```

---

## 🔀 Validaciones Condicionales

### Validar Solo Si Propiedad Tiene Valor

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Phone', String)
    @Validation(
        (entity) => {
            // Solo valida si phone existe
            if (!entity.phone) return true;
            return /^\d{10}$/.test(entity.phone);
        },
        'Phone must be 10 digits'
    )
    phone?: string;
}
```

### Validar Rango de Fechas

```typescript
export class Event extends BaseEntity {
    @PropertyName('Start Date', Date)
    startDate!: Date;
    
    @PropertyName('End Date', Date)
    @Validation(
        (entity) => {
            if (!entity.startDate || !entity.endDate) return true;
            return entity.endDate > entity.startDate;
        },
        'End date must be after start date'
    )
    endDate!: Date;
}
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos de Instancia

#### `isValidation(key: string): boolean`
Evalúa si una propiedad pasa su validación.

```typescript
// Uso
const product = new Product({ stock: -5 });
product.isValidation('stock');  // false (stock negativo)

const product2 = new Product({ stock: 10 });
product2.isValidation('stock');  // true

// Ubicación en BaseEntity (línea ~375)
public isValidation(key: string): boolean {
    const validation = (this.constructor as any).prototype[VALIDATION_KEY]?.[key];
    if (!validation) return true;  // Sin validación = válido
    
    const condition = validation.condition;
    if (typeof condition === 'function') {
        return condition(this);
    }
    return Boolean(condition);
}
```

#### `validationMessage(key: string): string`
Obtiene el mensaje de validación.

```typescript
// Uso
product.validationMessage('stock');
// Retorna: "Stock cannot be negative"

// Ubicación en BaseEntity (línea ~390)
public validationMessage(key: string): string {
    const validation = (this.constructor as any).prototype[VALIDATION_KEY]?.[key];
    return validation?.message || 'Validation failed';
}
```

---

## 🎨 Impacto en UI

### Validación en Tiempo Real

```typescript
// En TextInputComponent (y todos los form inputs)
async isValidated(): Promise<boolean> {
    let validated = true;
    this.validationMessages = [];
    
    // Nivel 1: Required
    if (this.metadata.required.value && !this.modelValue) {
        validated = false;
        this.validationMessages.push(this.metadata.requiredMessage.value);
    }
    
    // Nivel 2: Validation (sync) ← AQUÍ
    if (!this.metadata.validated.value) {
        validated = false;
        this.validationMessages.push(this.metadata.validatedMessage.value);
    }
    
    // Nivel 3: AsyncValidation
    // ...
    
    return validated;
}
```

**Ubicación:** `src/components/Form/TextInputComponent.vue` (línea ~75)

### Metadata Computed

```typescript
// En useInputMetadata composable
const metadata = {
    validated: computed(() => entity.isValidation(propertyKey)),
    validatedMessage: computed(() => entity.validationMessage(propertyKey))
}
```

**Ubicación:** `src/composables/useInputMetadata.ts`

### Visual en UI

```vue
<div class="validation-messages" v-if="!isInputValidated">
  <span>{{ validationMessage }}</span>
</div>
```

**Resultado:**
```
Stock
[  -5  ]
❌ Stock cannot be negative
```

---

## 🔗 Decoradores Relacionados

### Stack Completo de Validación

```typescript
@PropertyIndex(1)
@PropertyName('Email', String)
@StringTypeDef(StringType.EMAIL)
@Required(true)                          // Nivel 1: No vacío
@Validation(                             // Nivel 2: Formato (sync) ← ESTE
    (entity) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email),
    'Invalid email format'
)
@AsyncValidation(                        // Nivel 3: Único (async)
    async (entity) => await checkEmailUnique(entity.email),
    'Email already exists'
)
email!: string;
```

### Orden de Ejecución

```
Usuario escribe → Nivel 1: Required
                      ↓ (pasa)
                  Nivel 2: Validation (sync) ← AQUÍ
                      ↓ (pasa)
                  Nivel 3: AsyncValidation
```

---

## ⚠️ Consideraciones Importantes

### 1. Es Síncrono

`@Validation` debe ser instantáneo, NO puede hacer llamadas async:

```typescript
// ❌ INCORRECTO - No usar await/async
@Validation(
    async (entity) => {
        const result = await fetch('/api/check');  // ❌ NO
        return result.valid;
    },
    'Invalid'
)

// ✅ CORRECTO - Usa @AsyncValidation para llamadas async
@AsyncValidation(
    async (entity) => {
        const result = await fetch('/api/check');  // ✅ SÍ
        return result.valid;
    },
    'Invalid'
)
```

### 2. Acceso a Toda la Entidad

La función recibe la instancia completa:

```typescript
@Validation(
    (entity) => {
        // Acceso a TODAS las propiedades
        return entity.maxPrice > entity.minPrice;
    },
    'Max price must exceed min price'
)
maxPrice!: number;
```

### 3. Manejo de Valores Undefined

Siempre verifica valores undefined/null:

```typescript
// ❌ PELIGROSO
@Validation(
    (entity) => entity.email.includes('@'),  // Error si email undefined
    'Invalid email'
)

// ✅ SEGURO
@Validation(
    (entity) => !entity.email || entity.email.includes('@'),
    'Invalid email'
)
// O mejor aún:
@Validation(
    (entity) => {
        if (!entity.email) return true;  // No validar si vacío
        return entity.email.includes('@');
    },
    'Invalid email'
)
```

### 4. Performance

Validations se ejecutan en cada cambio, mantén la lógica simple:

```typescript
// ✅ RÁPIDO
@Validation((entity) => entity.stock >= 0, 'Invalid stock')

// ⚠️ LENTO (evitar operaciones pesadas)
@Validation((entity) => {
    // Cálculos complejos, loops grandes
    for (let i = 0; i < 10000; i++) { ... }
    return result;
}, 'Invalid')
```

---

## 🧪 Ejemplos Avanzados

### Validación de Listas

```typescript
export class Order extends BaseEntity {
    @PropertyName('Items', ArrayOf(OrderItem))
    @Validation(
        (entity) => entity.items && entity.items.length >= 1,
        'Order must have at least one item'
    )
    items!: Array<OrderItem>;
}
```

### Validación de Rango con Exclusiones

```typescript
export class Product extends BaseEntity {
    @PropertyName('Discount', Number)
    @Validation(
        (entity) => {
            const discount = entity.discount;
            return (discount >= 0 && discount <= 100) || discount === -1;
            // -1 = sin descuento especial
        },
        'Discount must be 0-100% or -1 for no discount'
    )
    discount!: number;
}
```

### Validación de Patrones Complejos

```typescript
export class Document extends BaseEntity {
    @PropertyName('Document Number', String)
    @Validation(
        (entity) => {
            // Formato: ABC-12345-XY
            const pattern = /^[A-Z]{3}-\d{5}-[A-Z]{2}$/;
            return pattern.test(entity.documentNumber);
        },
        'Document number must follow format: ABC-12345-XY'
    )
    documentNumber!: string;
}
```

### Validación Cruzada de Múltiples Campos

```typescript
export class Shipment extends BaseEntity {
    @PropertyName('Weight (kg)', Number)
    weight!: number;
    
    @PropertyName('Length (cm)', Number)
    length!: number;
    
    @PropertyName('Width (cm)', Number)
    width!: number;
    
    @PropertyName('Height (cm)', Number)
    height!: number;
    
    @PropertyName('Volume Weight', Number)
    @Validation(
        (entity) => {
            // Peso volumétrico = (L × W × H) / 5000
            const volumeWeight = (entity.length * entity.width * entity.height) / 5000;
            
            // El peso real o volumétrico debe estar dentr de rango válido
            const effectiveWeight = Math.max(entity.weight, volumeWeight);
            return effectiveWeight <= 30;  // Max 30kg
        },
        'Effective weight (actual or volumetric) cannot exceed 30kg'
    )
    volumeWeight!: number;
}
```

### Validación con Enums

```typescript
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest'
}

export class User extends BaseEntity {
    @PropertyName('Role', UserRole)
    role!: UserRole;
    
    @PropertyName('Permissions', String)
    @Validation(
        (entity) => {
            if (entity.role === UserRole.ADMIN) {
                return entity.permissions !== '';
            }
            return true;  // No required for other roles
        },
        'Admin users must have explicit permissions'
    )
    permissions?: string;
}
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function Validation(
    condition: ValidationCondition, 
    message: string
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        if (!proto[VALIDATION_KEY]) {
            proto[VALIDATION_KEY] = {};
        }
        
        proto[VALIDATION_KEY][propertyKey] = {
            condition: condition,
            message: message
        };
    };
}
```

### Validación Global

```typescript
// Llamado desde entity.save()
public async validateInputs(): Promise<boolean> {
    Application.View.value.isValid = true;
    
    // Emite evento para que todos los inputs validen
    Application.eventBus.emit('validate-inputs');
    
    // Espera respuestas
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verifica si alguno falló
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

## 📊 Flujo de Validación

```
1. Usuario modifica campo
        ↓
2. Input component detecta cambio
        ↓
3. Ejecuta this.isValidated()
        ↓
4. Valida Required (nivel 1)
        ↓ (pasa)
5. Valida Validation (nivel 2) ← AQUÍ
   - Llama entity.isValidation(propertyKey)
   - Ejecuta función: condition(entity)
   - Retorna true/false instantáneamente
        ↓
6. Si false:
   - isInputValidated = false
   - validationMessages.push(validationMessage)
   - Clase 'non-validated' aplicada
   - Mensaje mostrado en UI
        ↓
7. Si true: Continúa a AsyncValidation (nivel 3)
```

---

## 🎓 Casos de Uso Comunes

### 1. Validación de Rangos Numéricos
```typescript
@Validation((e) => e.age >= 18 && e.age <= 100, 'Invalid age range')
age!: number;
```

### 2. Validación de Formato String
```typescript
@Validation(
    (e) => /^\d{3}-\d{3}-\d{4}$/.test(e.phone),
    'Phone format: 555-123-4567'
)
phone!: string;
```

### 3. Validación de Relación Entre Campos
```typescript
@Validation(
    (e) => e.confirmPassword === e.password,
    'Passwords must match'
)
confirmPassword!: string;
```

### 4. Validación de Listas
```typescript
@Validation(
    (e) => e.tags.length <= 5,
    'Maximum 5 tags allowed'
)
tags!: Array<string>;
```

---

## 📚 Referencias Adicionales

- `required-decorator.md` - Validación required
- `async-validation-decorator.md` - Validaciones asíncronas
- `../02-base-entity/validation-system.md` - Sistema completo
- `../../tutorials/02-validations.md` - Tutorial de validaciones

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/validation_decorator.ts`
