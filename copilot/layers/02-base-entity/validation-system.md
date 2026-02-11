# 🔐 Sistema de Validación de BaseEntity

**Referencias:**
- `crud-operations.md` - Operaciones CRUD
- `base-entity-core.md` - Núcleo de BaseEntity
- `../01-decorators/required-decorator.md` - Required
- `../01-decorators/validation-decorator.md` - Validation
- `../01-decorators/async-validation-decorator.md` - AsyncValidation

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts` (líneas ~350-450)

---

## 🎯 Propósito

BaseEntity implementa un **sistema de validación de 3 niveles** que se ejecuta automáticamente antes de guardar (save/update). Este sistema garantiza la integridad de datos tanto en frontend como en coordinación con el backend.

---

## 🏗️ Arquitectura del Sistema

### Niveles de Validación

```
┌─────────────────────────────────────────┐
│   NIVEL 1: Required Validation          │  ← Más básico
│   ¿Campo obligatorio tiene valor?       │
└─────────────┬───────────────────────────┘
              │ ✓ Pasa
              ↓
┌─────────────────────────────────────────┐
│   NIVEL 2: Sync Validation              │  ← Reglas síncronas
│   ¿Valor cumple reglas (regex, rango)?  │
└─────────────┬───────────────────────────┘
              │ ✓ Pasa
              ↓
┌─────────────────────────────────────────┐
│   NIVEL 3: Async Validation             │  ← Validaciones con API
│   ¿Valor único/disponible en servidor?  │
└─────────────┬───────────────────────────┘
              │ ✓ Todas pasan
              ↓
         ✅ VÁLIDO → Procede save()
```

---

## 📋 validateInputs() - Método Principal

### Firma

```typescript
public async validateInputs(): Promise<boolean>
```

### Descripción

Valida todas las propiedades de la entidad ejecutando los 3 niveles de validación. Retorna `true` si TODO es válido, `false` si hay algún error.

### Uso

```typescript
const product = new Product({
    name: '',  // Requerido pero vacío
    price: -10  // Precio negativo (inválido)
});

const isValid = await product.validateInputs();
// Retorna: false

console.log(product.validationErrors);
// {
//   name: ['Name is required'],
//   price: ['Price must be positive']
// }
```

### Flujo Interno

```
1. validateInputs() llamado
        ↓
2. Inicializa validationErrors = {}
        ↓
3. Obtiene lista de propiedades: getProperties()
        ↓
4. Para cada propiedad:
        ↓
   a. Nivel 1: ¿isRequired? → valida no vacío
        ↓ (pasa)
   b. Nivel 2: ¿isValidation? → valida con función sync
        ↓ (pasa)
   c. Nivel 3: ¿isAsyncValidation? → valida con función async
        ↓
5. Acumula errores en validationErrors
        ↓
6. Si hay errores:
   - Emite evento 'validation-failed' en eventBus
   - Retorna false
        ↓
7. Si NO hay errores:
   - Emite evento 'validation-passed'
   - Retorna true
```

### Código Interno (Simplificado)

```typescript
public async validateInputs(): Promise<boolean> {
    this.validationErrors = {};
    let hasErrors = false;
    
    const properties = this.getProperties();
    
    for (const key of properties) {
        const errors: string[] = [];
        
        // NIVEL 1: Required
        if (this.isRequired(key)) {
            const value = (this as any)[key];
            
            if (value === null || value === undefined || value === '') {
                errors.push(this.requiredMessage(key));
                hasErrors = true;
            }
        }
        
        // NIVEL 2: Validation (sync)
        if (this.isValidation(key)) {
            const isValid = this.isValidation(key);
            
            if (!isValid) {
                errors.push(this.validationMessage(key));
                hasErrors = true;
            }
        }
        
        // NIVEL 3: AsyncValidation
        if (this.isAsyncValidation) {
            const isValid = await this.isAsyncValidation(key);
            
            if (!isValid) {
                errors.push(this.asyncValidationMessage(key));
                hasErrors = true;
            }
        }
        
        // Guardar errores de esta propiedad
        if (errors.length > 0) {
            this.validationErrors[key] = errors;
        }
    }
    
    // Emitir evento
    if (hasErrors) {
        Application.eventBus.emit('validation-failed', {
            entity: this,
            errors: this.validationErrors
        });
    } else {
        Application.eventBus.emit('validation-passed', {
            entity: this
        });
    }
    
    return !hasErrors;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~350)

---

## 🎯 Métodos de Validación por Nivel

### Nivel 1: Required Validation

#### `isRequired(key: string): boolean`

Evalúa si un campo es requerido.

```typescript
// Definición
@PropertyName('Name', String)
@Required(true)
name!: string;

// Uso
entity.isRequired('name');  // true
entity.isRequired('description');  // false
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~275)

#### `requiredMessage(key: string): string`

Obtiene el mensaje de error para campo requerido.

```typescript
entity.requiredMessage('name');
// Retorna: "Name is required"
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~285)

---

### Nivel 2: Sync Validation

#### `isValidation(key: string): boolean`

Evalúa validación síncrona (función).

```typescript
// Definición
@PropertyName('Email', String)
@Validation(
    (entity) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(entity.email),
    'Invalid email format'
)
email!: string;

// Uso
const product = new Product({ email: 'invalid' });
product.isValidation('email');
// Retorna: false (no pasa regex)
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~360)

#### `validationMessage(key: string): string`

Obtiene el mensaje de error de validación síncrona.

```typescript
product.validationMessage('email');
// Retorna: "Invalid email format"
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~375)

---

### Nivel 3: Async Validation

#### `isAsyncValidation(key: string): Promise<boolean>`

Evalúa validación asíncrona (con llamada a API).

```typescript
// Definición
@PropertyName('Username', String)
@AsyncValidation(
    async (entity) => {
        const response = await fetch(`/api/check-username?username=${entity.username}`);
        return (await response.json()).available;
    },
    'Username already taken'
)
username!: string;

// Uso
const user = new User({ username: 'john_doe' });
const isAvailable = await user.isAsyncValidation('username');
// Retorna: true (disponible) o false (tomado)
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~395)

#### `asyncValidationMessage(key: string): string`

Obtiene el mensaje de error de validación asíncrona.

```typescript
user.asyncValidationMessage('username');
// Retorna: "Username already taken"
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~410)

---

## 💾 Almacenamiento de Errores

### Property: validationErrors

```typescript
public validationErrors: Record<string, string[]> = {};
```

Almacena todos los errores de validación encontrados:

```typescript
const product = new Product({
    name: '',        // Required, vacío
    price: -10,      // Validación: debe ser positivo
    email: 'invalid' // Validación: formato inválido
});

await product.validateInputs();

console.log(product.validationErrors);
// {
//   name: ['Name is required'],
//   price: ['Price must be positive'],
//   email: ['Invalid email format']
// }
```

---

## 🔌 Integración con save()

### Validación Automática

`save()` llama automáticamente a `validateInputs()`:

```typescript
public async save(): Promise<this> {
    // ... beforeSave hook ...
    
    // VALIDACIÓN AUTOMÁTICA
    if (!await this.validateInputs()) {
        Application.showToast('Please fix validation errors', 'error');
        return this;  // ← No procede con save
    }
    
    // ... continúa con HTTP request ...
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~720)

### Flujo Completo con Validación

```
Usuario hace click "Save"
        ↓
entity.save() llamado
        ↓
beforeSave() hook ejecuta
        ↓
validateInputs() ejecuta
        ↓
¿Errores encontrados?
    ├─ SÍ → Muestra toast con errores
    │       → Retorna entity sin guardar
    │       → UI muestra errores en campos
    │
    └─ NO → Procede con serialización
          → Hace HTTP request (POST/PUT)
          → Actualiza entity con response
          → afterSave() hook ejecuta
          → Muestra toast de éxito
          → Retorna entity actualizado
```

---

## 🎨 Impacto en UI

### Mostrar Errores en Input Component

```vue
<template>
  <div class="form-field" :class="{ 'has-error': hasErrors }">
    <label>{{ metadata.propertyName }}</label>
    
    <input
      v-model="modelValue"
      :class="{ 'input-error': hasErrors }"
      @blur="validate"
    />
    
    <!-- Mostrar mensajes de error -->
    <div v-if="hasErrors" class="error-messages">
      <span 
        v-for="(error, index) in errorMessages" 
        :key="index"
        class="error-message"
      >
        {{ error }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps(['entity', 'propertyKey', 'modelValue']);
const emit = defineEmits(['update:modelValue']);

const errorMessages = computed(() => {
    return props.entity.validationErrors[props.propertyKey] || [];
});

const hasErrors = computed(() => {
    return errorMessages.value.length > 0;
});

async function validate() {
    // Validar solo este campo
    await props.entity.validateInputs();
    
    // La UI se actualiza automáticamente gracias a computed()
}
</script>

<style scoped>
.has-error .input-error {
    border-color: #e74c3c;
    background-color: #fee;
}

.error-messages {
    margin-top: 4px;
}

.error-message {
    display: block;
    color: #e74c3c;
    font-size: 12px;
    margin-top: 2px;
}
</style>
```

**Ubicación:** `src/components/Form/TextInputComponent.vue` (línea ~60)

---

## 🧪 Ejemplos Completos

### 1. Validación Básica (Required + Validation)

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required(true)
    @Validation(
        (entity) => entity.name.length >= 3,
        'Name must be at least 3 characters'
    )
    name!: string;
    
    @PropertyName('Price', Number)
    @Required(true)
    @Validation(
        (entity) => entity.price > 0,
        'Price must be positive'
    )
    price!: number;
}

// Test
const product = new Product({ name: 'AB', price: -10 });
await product.validateInputs();
// false

console.log(product.validationErrors);
// {
//   name: ['Name must be at least 3 characters'],
//   price: ['Price must be positive']
// }
```

### 2. Validación Condicional

```typescript
export class Order extends BaseEntity {
    @PropertyName('Shipping Method', String)
    shippingMethod!: string;  // 'pickup' o 'delivery'
    
    @PropertyName('Shipping Address', String)
    @Required((entity: Order) => entity.shippingMethod === 'delivery')
    shippingAddress?: string;
}

// Test 1: Pickup (address no requerida)
const order1 = new Order({ shippingMethod: 'pickup' });
await order1.validateInputs();  // true

// Test 2: Delivery sin address (error)
const order2 = new Order({ shippingMethod: 'delivery' });
await order2.validateInputs();  // false
// validationErrors: { shippingAddress: ['Shipping Address is required'] }
```

### 3. Validación con AsyncValidation

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Required(true)
    @Validation(
        (entity) => /^[a-zA-Z0-9_]{3,20}$/.test(entity.username),
        'Username: 3-20 chars, alphanumeric and underscore only'
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
}

// Test
const user = new User({ username: 'jo' });
await user.validateInputs();
// false (falla en Validation: menos de 3 chars)

user.username = 'john_doe';
await user.validateInputs();
// Depende de la respuesta del servidor:
// - Si disponible → true
// - Si tomado → false con error "Username already taken"
```

### 4. Múltiples Validaciones en Un Campo

```typescript
export class Employee extends BaseEntity {
    @PropertyName('Email', String)
    @Required(true)
    @Validation(
        (entity) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(entity.email),
        'Invalid email format'
    )
    @Validation(
        (entity) => entity.email.endsWith('@company.com'),
        'Email must be from company domain'
    )
    @AsyncValidation(
        async (entity) => {
            const response = await Application.axiosInstance.get(
                `/api/employees/check-email?email=${entity.email}`
            );
            return response.data.available;
        },
        'Email already registered'
    )
    email!: string;
}

// Errores múltiples:
const employee = new Employee({ email: 'invalid' });
await employee.validateInputs();

console.log(employee.validationErrors.email);
// [
//   'Invalid email format',
//   'Email must be from company domain',
//   'Email already registered'  // (si también falla async)
// ]
```

### 5. Validación Cross-Field

```typescript
export class DateRange extends BaseEntity {
    @PropertyName('Start Date', Date)
    @Required(true)
    startDate!: Date;
    
    @PropertyName('End Date', Date)
    @Required(true)
    @Validation(
        (entity: DateRange) => {
            if (!entity.startDate || !entity.endDate) return true;
            return entity.endDate >= entity.startDate;
        },
        'End date must be after start date'
    )
    endDate!: Date;
}

// Test
const range = new DateRange({
    startDate: new Date('2024-12-31'),
    endDate: new Date('2024-01-01')  // Antes de startDate
});

await range.validateInputs();
// false
// validationErrors: { endDate: ['End date must be after start date'] }
```

### 6. Override validateInputs() para Custom Logic

```typescript
export class PurchaseOrder extends BaseEntity {
    @PropertyName('Items', Array)
    @ArrayOf(OrderItem)
    items!: OrderItem[];
    
    // Override para validación custom
    async validateInputs(): Promise<boolean> {
        // Ejecutar validaciones base
        const baseValid = await super.validateInputs();
        
        // Validación custom: al menos 1 item
        if (this.items.length === 0) {
            this.validationErrors['items'] = ['Order must have at least one item'];
            return false;
        }
        
        // Validación custom: total no excede límite
        const total = this.items.reduce((sum, item) => sum + item.total, 0);
        if (total > 100000) {
            this.validationErrors['items'] = ['Order total exceeds $100,000 limit'];
            return false;
        }
        
        return baseValid;
    }
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Orden de Ejecución

Las validaciones se ejecutan en orden estricto:

```
Required → Validation → AsyncValidation
```

Si Required falla, **NO se ejecutan** Validation ni AsyncValidation para ese campo (optimización).

### 2. Short-Circuit en Validaciones

```typescript
// Si un campo tiene:
@Required(true)
@Validation((e) => e.name.length >= 3, 'Min 3 chars')
@AsyncValidation(async (e) => await checkUnique(e.name), 'Already exists')

// Y el valor está vacío:
// - Required falla → agrega error
// - Validation NO se ejecuta (valor vacío, no tiene sentido validar longitud)
// - AsyncValidation NO se ejecuta (no hacer request innecesario)
```

### 3. Performance con AsyncValidation

Múltiples campos con AsyncValidation aumentan tiempo de validación:

```typescript
// 3 campos con async validation = 3 requests al servidor
@AsyncValidation(...) username!: string;
@AsyncValidation(...) email!: string;
@AsyncValidation(...) phone!: string;

// validateInputs() puede tardar 100-500ms
```

**Solución:** Debounce en UI para evitar validar en cada tecla.

### 4. Validación NO Previene Asignación

```typescript
product.name = '';  // ✓ Asignado (no hay prevención)

await product.validateInputs();  // false (error)

console.log(product.name);  // '' (el valor sigue allí)
```

Validación solo **detecta** problemas, no **previene** asignación.

### 5. validationErrors se Sobrescribe

Cada llamada a `validateInputs()` reinicia `validationErrors`:

```typescript
await product.validateInputs();  // Detecta errores
console.log(product.validationErrors);  // { name: [...] }

product.name = 'Valid Name';
await product.validateInputs();  // Re-valida
console.log(product.validationErrors);  // {} (limpio)
```

---

## 🔧 Extensiones Comunes

### 1. Validar Solo un Campo

```typescript
export class BaseEntity {
    async validateField(key: string): Promise<boolean> {
        const errors: string[] = [];
        
        // Required
        if (this.isRequired(key)) {
            const value = (this as any)[key];
            if (!value) {
                errors.push(this.requiredMessage(key));
            }
        }
        
        // Validation
        if (this.isValidation(key) && !this.isValidation(key)) {
            errors.push(this.validationMessage(key));
        }
        
        // AsyncValidation
        if (this.isAsyncValidation && !await this.isAsyncValidation(key)) {
            errors.push(this.asyncValidationMessage(key));
        }
        
        // Actualizar errores
        if (errors.length > 0) {
            this.validationErrors[key] = errors;
            return false;
        } else {
            delete this.validationErrors[key];
            return true;
        }
    }
}

// Uso
await product.validateField('name');
// Valida solo 'name', no otros campos
```

### 2. Validación con Warning vs Error

```typescript
export class Product extends BaseEntity {
    public validationWarnings: Record<string, string[]> = {};
    
    async validateInputs(): Promise<boolean> {
        const hasErrors = await super.validateInputs();
        
        // Agregar warnings (no bloquean save)
        if (this.price < 10) {
            this.validationWarnings['price'] = ['Price seems low, are you sure?'];
        }
        
        return hasErrors;  // Warnings no afectan resultado
    }
}
```

---

## � Métodos de Validación de Configuración

Estos métodos validan que la entidad esté correctamente configurada con los decoradores necesarios para operar en el framework.

### validateModuleConfiguration()

```typescript
public validateModuleConfiguration(): boolean
```

**Propósito:** Valida que la entidad tenga la configuración mínima requerida para funcionar como módulo en el framework.

**Retorna:** `true` si configuración válida, `false` si hay errores

**Ubicación:** Línea 532

**Validaciones obligatorias:**
1. `@ModuleName` debe estar definido
2. `@ModuleIcon` debe estar definido  
3. `@DefaultProperty` debe estar definido
4. `@PrimaryProperty` debe estar definido

**Implementación:**

```typescript
public validateModuleConfiguration(): boolean {
    const errors: string[] = [];
    const entityClass = this.constructor as typeof BaseEntity;
    
    if (!entityClass.getModuleName()) {
        errors.push('El módulo no tiene definido @ModuleName');
    }
    
    if (!entityClass.getModuleIcon()) {
        errors.push('El módulo no tiene definido @ModuleIcon');
    }
    
    if (!(this.constructor as any)[DEFAULT_PROPERTY_KEY]) {
        errors.push('El módulo no tiene definido @DefaultProperty');
    }
    
    if (!this.getPrimaryPropertyKey()) {
        errors.push('El módulo no tiene definido @PrimaryProperty');
    }
    
    if (errors.length > 0) {
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Error de configuración del módulo',
            errors.join('\n'),
            undefined,
            'Aceptar',
            'Cerrar'
        );
        return false;
    }
    
    return true;
}
```

**Ejemplo de uso correcto:**

```typescript
@DefaultProperty('name')
@PrimaryProperty('id')
@ModuleName('Products')
@ModuleIcon(ICONS.BOX)
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
}

const product = new Product({ id: 1, name: 'Widget' });
product.validateModuleConfiguration(); // true
```

**Ejemplo de configuración incorrecta:**

```typescript
// FALTA @ModuleName y @ModuleIcon
@DefaultProperty('name')
@PrimaryProperty('id')
export class BadProduct extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
}

const badProduct = new BadProduct({ id: 1 });
badProduct.validateModuleConfiguration(); 
// false
// Muestra dialog con errores:
// "El módulo no tiene definido @ModuleName"
// "El módulo no tiene definido @ModuleIcon"
```

**Usado internamente en:**
- `validatePersistenceConfiguration()` (se llama primero)
- Inicialización de módulos en Application

---

### validatePersistenceConfiguration()

```typescript
public validatePersistenceConfiguration(): boolean
```

**Propósito:** Valida que la entidad tenga la configuración completa para operaciones CRUD con persistencia (API).

**Retorna:** `true` si configuración válida, `false` si hay errores

**Ubicación:** Línea 603

**Validaciones obligatorias:**
1. Ejecuta `validateModuleConfiguration()` primero
2. `@UniquePropertyKey` debe estar definido
3. `@ApiEndpoint` debe estar definido
4. `@ApiMethods` debe estar definido

**Implementación:**

```typescript
public validatePersistenceConfiguration(): boolean {
    if (!this.validateModuleConfiguration()) {
        return false;
    }
    
    const errors: string[] = [];
    
    if (!this.getUniquePropertyKey()) {
        errors.push('La entidad no tiene definido @UniquePropertyKey');
    }
    
    if (!this.getApiEndpoint()) {
        errors.push('La entidad no tiene definido @ApiEndpoint');
    }
    
    if (!this.getApiMethods()) {
        errors.push('La entidad no tiene definido @ApiMethods');
    }
    
    if (errors.length > 0) {
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Error de configuración de persistencia',
            errors.join('\n'),
            undefined,
            'Aceptar',
            'Cerrar'
        );
        return false;
    }
    
    return true;
}
```

**Usado internamente en:**
- `save()` - Línea 713
- `update()` - Línea 768
- `delete()` - Línea 820

---

### validateApiMethod()

```typescript
public validateApiMethod(method: HttpMethod): boolean
```

**Propósito:** Valida que un método HTTP específico esté permitido en los `@ApiMethods` de la entidad.

**Retorna:** `true` si método permitido, `false` si no

**Ubicación:** Línea 637

**Parámetros:**
- `method: HttpMethod` - Método HTTP a validar ('GET', 'POST', 'PUT', 'DELETE')

**Implementación:**

```typescript
public validateApiMethod(method: HttpMethod): boolean {
    if (!this.isApiMethodAllowed(method)) {
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Método no permitido',
            `El método ${method} no está permitido en esta entidad`,
            undefined,
            'Aceptar',
            'Cerrar'
        );
        return false;
    }
    return true;
}
```

**Usado internamente en:**
- `save()` - Línea 717 (valida POST o PUT según isNew())
- `update()` - Línea 772 (valida PUT)
- `delete()` - Línea 824 (valida DELETE)

---

## �📚 Referencias Adicionales

- `crud-operations.md` - save() y validación automática
- `lifecycle-hooks.md` - beforeSave donde se valida
- `../01-decorators/required-decorator.md` - Campos requeridos
- `../01-decorators/validation-decorator.md` - Validaciones síncronas
- `../01-decorators/async-validation-decorator.md` - Validaciones asíncronas
- `../../tutorials/02-validations.md` - Tutorial de validaciones
- `../../02-FLOW-ARCHITECTURE.md` - Flujo de validación

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/entities/base_entitiy.ts`  
**Líneas relevantes:** 350-450 (Sistema de validación)
