# ✔️ Unique Decorator

**Referencias:**
- `primary-property-decorator.md` - Primary también implica unique
- `required-decorator.md` - Unique + Required para validación completa
- `validation-decorator.md` - Unique como validación especial
- `async-validation-decorator.md` - Validación async de unicidad
- `../../02-base-entity/base-entity-core.md` - isUnique() accessor
- `../../tutorials/02-validations.md` - Unique constraints en tutorial

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/unique_decorator.ts`

---

## 🎯 Propósito

El decorador `@Unique()` marca que **una propiedad debe tener un valor único** en toda la colección de entidades. Valida que no existan duplicados antes de guardar.

**Beneficios:**
- Previene duplicados (usernames, emails, SKUs)
- Validación automática antes de save()
- Mensajes de error descriptivos
- Validación en cliente y servidor

---

## 📝 Sintaxis

```typescript
@Unique(errorMessage?: string)
propertyName: Type;
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `errorMessage` | `string` | No | Mensaje de error personalizado |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/unique_decorator.ts

/**
 * Symbol para almacenar metadata de unique
 */
export const UNIQUE_METADATA = Symbol('unique');

/**
 * @Unique() - Marca una propiedad como unique
 * 
 * @param errorMessage - Mensaje de error personalizado (opcional)
 * @returns PropertyDecorator
 */
export function Unique(errorMessage?: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[UNIQUE_METADATA]) {
            target[UNIQUE_METADATA] = {};
        }
        
        // Guardar metadata de unique
        target[UNIQUE_METADATA][propertyKey] = {
            errorMessage: errorMessage || `${String(propertyKey)} must be unique`
        };
    };
}
```

**Ubicación:** `src/decorations/unique_decorator.ts` (línea ~1-30)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
User.prototype[UNIQUE_METADATA] = {
    'username': {
        errorMessage: 'Username already exists'
    },
    'email': {
        errorMessage: 'Email address is already registered'
    },
    'ssn': {
        errorMessage: 'SSN must be unique'
    }
};
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Verifica si una propiedad es unique
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns true si es unique
 */
public isUnique(propertyKey: string): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    const uniqueMetadata = constructor.prototype[UNIQUE_METADATA];
    
    if (!uniqueMetadata || !uniqueMetadata[propertyKey]) {
        return false;
    }
    
    return true;
}

/**
 * Obtiene el mensaje de error de unique
 */
public getUniqueErrorMessage(propertyKey: string): string {
    const constructor = this.constructor as typeof BaseEntity;
    const uniqueMetadata = constructor.prototype[UNIQUE_METADATA];
    
    if (!uniqueMetadata || !uniqueMetadata[propertyKey]) {
        return `${propertyKey} must be unique`;
    }
    
    return uniqueMetadata[propertyKey].errorMessage;
}

/**
 * Valida unicidad de una propiedad
 */
public async validateUnique(propertyKey: string): Promise<string | null> {
    if (!this.isUnique(propertyKey)) {
        return null;  // No es unique, no validar
    }
    
    const value = this[propertyKey];
    
    // Si está vacío, no validar unique (usar Required para validar vacío)
    if (value === null || value === undefined || value === '') {
        return null;
    }
    
    // Obtener todas las entidades para validar unicidad
    const constructor = this.constructor as typeof BaseEntity;
    const allEntities = await constructor.getElementList();
    
    // Buscar duplicados (excluyendo entidad actual)
    const isDuplicate = allEntities.some(entity => {
        // Excluir la entidad actual (si tiene ID)
        if (this.id && entity.id === this.id) {
            return false;
        }
        
        // Comparar valores
        return entity[propertyKey] === value;
    });
    
    if (isDuplicate) {
        return this.getUniqueErrorMessage(propertyKey);
    }
    
    return null;
}

/**
 * Valida todas las propiedades unique antes de guardar
 */
public async validateUniqueConstraints(): Promise<Record<string, string>> {
    const errors: Record<string, string> = {};
    const properties = (this.constructor as typeof BaseEntity).getProperties();
    
    for (const prop of properties) {
        if (this.isUnique(prop)) {
            const error = await this.validateUnique(prop);
            if (error) {
                errors[prop] = error;
            }
        }
    }
    
    return errors;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1330-1440)

---

## 🔄 Integración con CRUD

### Save con Validación de Unique

```typescript
// src/entities/base_entitiy.ts

/**
 * Guarda la entidad (CREATE o UPDATE)
 */
public async save(): Promise<void> {
    // 1. Validar campos requeridos
    const requiredErrors = this.validateRequired();
    
    // 2. Validar unique constraints
    const uniqueErrors = await this.validateUniqueConstraints();
    
    // 3. Ejecutar validaciones personalizadas
    const customErrors = await this.validate();
    
    // 4. Combinar errores
    this.errors = {
        ...requiredErrors,
        ...uniqueErrors,
        ...customErrors
    };
    
    // 5. Si hay errores, no guardar
    if (Object.keys(this.errors).length > 0) {
        throw new Error('Validation failed');
    }
    
    // 6. Determinar CREATE o UPDATE
    const isNew = this.isNew();
    const endpoint = this.getApiEndpoint();
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? endpoint : `${endpoint}/${this[this.getPersistentKey()]}`;
    
    // 7. Guardar en servidor
    await axios({
        method,
        url,
        data: this.toJSON()
    });
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~800-850)

---

## 🧪 Ejemplos de Uso

### 1. Username Único

```typescript
import { Unique } from '@/decorations/unique_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { Required } from '@/decorations/required_decorator';
import { StringType, StringTypeEnum } from '@/decorations/string_type_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Username', String)
    @Required()
    @Unique('Username already exists')  // ← Mensaje personalizado
    @StringType(StringTypeEnum.USERNAME)
    username!: string;
    
    @PropertyName('Email', String)
    @Required()
    @Unique('Email address is already registered')
    @StringType(StringTypeEnum.EMAIL)
    email!: string;
}

// Uso:
const user = new User();
user.username = 'john_doe';
user.email = 'john@example.com';

await user.save();  
// Si username o email ya existen, lanza error con mensaje personalizado
```

---

### 2. SKU Único

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    @Required()
    name!: string;
    
    @PropertyName('SKU', String)
    @Required()
    @Unique('SKU must be unique. This SKU already exists.')
    sku!: string;
    
    @PropertyName('Price', Number)
    @Required()
    price!: number;
}

// Uso:
const product1 = new Product();
product1.name = 'Laptop';
product1.sku = 'PROD-2025-0042';
product1.price = 999;
await product1.save();  // ✅ OK

const product2 = new Product();
product2.name = 'Mouse';
product2.sku = 'PROD-2025-0042';  // ← Duplicado
product2.price = 25;
await product2.save();  
// ❌ Error: "SKU must be unique. This SKU already exists."
```

---

### 3. Email Único

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Customer ID', Number)
    id!: number;
    
    @PropertyName('Full Name', String)
    @Required()
    fullName!: string;
    
    @PropertyName('Email', String)
    @Required()
    @Unique('This email is already registered')
    @StringType(StringTypeEnum.EMAIL)
    email!: string;
    
    @PropertyName('Phone', String)
    @Unique('Phone number already in use')
    @Mask('(###) ###-####')
    phone?: string;
}
```

---

### 4. Multiple Unique Constraints

```typescript
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    // Unique #1: Username
    @PropertyName('Username', String)
    @Required()
    @Unique('Username already taken')
    username!: string;
    
    // Unique #2: Email
    @PropertyName('Email', String)
    @Required()
    @Unique('Email already registered')
    email!: string;
    
    // Unique #3: SSN
    @PropertyName('SSN', String)
    @Unique('SSN must be unique')
    ssn?: string;
}

// Al guardar, valida TODOS los unique constraints:
const user = new User();
user.username = 'existing_user';  // ← Ya existe
user.email = 'new@example.com';   // ← OK
user.ssn = '123-45-6789';         // ← Ya existe

await user.save();
// user.errors = {
//     username: 'Username already taken',
//     ssn: 'SSN must be unique'
// }
```

---

### 5. Unique con Validación Adicional

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('SKU', String)
    @Required()
    @Unique('SKU already exists')
    @Validation((value: string) => {
        // Formato específico: PROD-YYYY-####
        if (!/^PROD-\d{4}-\d{4}$/.test(value)) {
            return 'SKU must follow format: PROD-YYYY-####';
        }
        return null;
    })
    sku!: string;
}

// Valida AMBOS:
// 1. Formato correcto (Validation)
// 2. No duplicado (Unique)
```

---

### 6. Unique Case-Insensitive

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Required()
    @Unique('Username already exists')
    @Validation((value: string) => {
        // Convertir a lowercase antes de guardar
        return null;
    })
    username!: string;
}

// En BaseEntity, modificar validación:
public async validateUnique(propertyKey: string): Promise<string | null> {
    if (!this.isUnique(propertyKey)) return null;
    
    let value = this[propertyKey];
    if (value === null || value === undefined || value === '') return null;
    
    // Case-insensitive comparison para strings
    if (typeof value === 'string') {
        value = value.toLowerCase();
    }
    
    const constructor = this.constructor as typeof BaseEntity;
    const allEntities = await constructor.getElementList();
    
    const isDuplicate = allEntities.some(entity => {
        if (this.id && entity.id === this.id) return false;
        
        let entityValue = entity[propertyKey];
        if (typeof entityValue === 'string') {
            entityValue = entityValue.toLowerCase();
        }
        
        return entityValue === value;
    });
    
    return isDuplicate ? this.getUniqueErrorMessage(propertyKey) : null;
}
```

---

### 7. Unique con AsyncValidation

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Required()
    @Unique('Username already exists')
    @AsyncValidation(async (value: string) => {
        // Validar en servidor real-time
        const response = await axios.get(`/api/users/check-username`, {
            params: { username: value }
        });
        
        if (response.data.exists) {
            return 'Username is already taken';
        }
        
        return null;
    })
    username!: string;
}
```

---

### 8. Composite Unique (Simulado)

```typescript
// TypeScript no soporta @Unique en múltiples propiedades juntas
// Solución: Validation personalizada

export class Enrollment extends BaseEntity {
    @PropertyName('Enrollment ID', Number)
    id!: number;
    
    @PropertyName('Student ID', Number)
    @Required()
    studentId!: number;
    
    @PropertyName('Course ID', Number)
    @Required()
    courseId!: number;
    
    // Validar combinación única
    @Validation(async function(this: Enrollment) {
        const constructor = this.constructor as typeof BaseEntity;
        const allEnrollments = await constructor.getElementList();
        
        const isDuplicate = allEnrollments.some(e => {
            if (this.id && e.id === this.id) return false;
            return e.studentId === this.studentId && 
                   e.courseId === this.courseId;
        });
        
        if (isDuplicate) {
            return 'Student is already enrolled in this course';
        }
        
        return null;
    })
    private _compositeUnique!: void;
}
```

---

### 9. Unique con UI Feedback

```vue
<!-- TextInput con validación unique real-time -->

<template>
  <div class="form-group">
    <label>
      {{ propertyLabel }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    
    <input
      v-model="localValue"
      @blur="checkUnique"
      :class="{ 'error': uniqueError }"
    />
    
    <!-- Unique validation error -->
    <p v-if="uniqueError" class="error-text">
      {{ uniqueError }}
    </p>
    
    <!-- Check icon -->
    <span v-if="isChecking" class="checking">
      Checking availability...
    </span>
    <span v-else-if="isAvailable" class="available">
      ✓ Available
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
}>();

const localValue = ref(props.modelValue);
const isChecking = ref(false);
const isAvailable = ref(false);
const uniqueError = ref<string | null>(null);

const isUnique = computed(() => {
    return props.entity.isUnique(props.property);
});

async function checkUnique() {
    if (!isUnique.value) return;
    
    isChecking.value = true;
    isAvailable.value = false;
    uniqueError.value = null;
    
    // Validar unique
    const error = await props.entity.validateUnique(props.property);
    
    isChecking.value = false;
    
    if (error) {
        uniqueError.value = error;
    } else {
        isAvailable.value = true;
    }
}
</script>

<style scoped>
.error {
    border-color: #dc2626;
}

.error-text {
    color: #dc2626;
    font-size: 0.875rem;
}

.checking {
    color: #6b7280;
    font-size: 0.875rem;
}

.available {
    color: #16a34a;
    font-size: 0.875rem;
}
</style>
```

---

### 10. Unique con Soft Delete

```typescript
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Username', String)
    @Required()
    @Unique('Username already exists')
    username!: string;
    
    @PropertyName('Is Deleted', Boolean)
    isDeleted: boolean = false;
}

// Modificar validación unique para excluir soft-deleted:
public async validateUnique(propertyKey: string): Promise<string | null> {
    if (!this.isUnique(propertyKey)) return null;
    
    const value = this[propertyKey];
    if (!value) return null;
    
    const constructor = this.constructor as typeof BaseEntity;
    const allEntities = await constructor.getElementList();
    
    // Excluir soft-deleted
    const activeEntities = allEntities.filter(e => !e.isDeleted);
    
    const isDuplicate = activeEntities.some(entity => {
        if (this.id && entity.id === this.id) return false;
        return entity[propertyKey] === value;
    });
    
    return isDuplicate ? this.getUniqueErrorMessage(propertyKey) : null;
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Primary Implica Unique

```typescript
// Primary key es automáticamente unique
@PropertyName('User ID', Number)
@Primary()
// @Unique()  ← No necesario, Primary ya implica unique
id!: number;
```

### 2. Unique Requiere Backend Enforcement

```typescript
// ⚠️ IMPORTANTE: Validación en cliente NO es suficiente
// Backend debe tener constraint UNIQUE en base de datos

// SQL:
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,  -- ← Constraint en DB
    email VARCHAR(100) UNIQUE
);

// NoSQL (MongoDB):
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
```

### 3. Performance con Grandes Datasets

```typescript
// ⚠️ PROBLEMA: getElementList() carga TODO en memoria
public async validateUnique(propertyKey: string): Promise<string | null> {
    // ...
    const allEntities = await constructor.getElementList();  // ← Problema
    // ...
}

// ✅ MEJOR: Validar en servidor con endpoint específico
@AsyncValidation(async (value: string) => {
    const response = await axios.get(`/api/users/check-username`, {
        params: { username: value }
    });
    return response.data.exists ? 'Username already exists' : null;
})
username!: string;
```

### 4. Unique + Case Sensitivity

```typescript
// ⚠️ CUIDADO: 'John', 'john', 'JOHN' son diferentes en validación default

// ✅ SOLUCIÓN: Normalizar antes de comparar
@Validation((value: string) => {
    // Convertir a lowercase antes de guardar
    return null;
})
@Unique('Username already exists')
username!: string;

// O en backend:
CREATE TABLE users (
    username VARCHAR(50) COLLATE utf8_bin UNIQUE  -- Case-sensitive
);
```

### 5. Race Conditions

```typescript
// ⚠️ RIESGO: Dos usuarios guardan simultáneamente

// User 1:                      User 2:
// checkUnique('john') → OK     checkUnique('john') → OK
// save() → OK                  save() → Duplicate!

// ✅ SOLUCIÓN: Backend debe validar y retornar error apropiado
try {
    await user.save();
} catch (error) {
    if (error.response?.status === 409) {  // Conflict
        user.errors.username = 'Username already exists';
    }
}
```

---

## 📚 Referencias Adicionales

- `primary-property-decorator.md` - Primary implica unique
- `required-decorator.md` - Unique + Required pattern
- `validation-decorator.md` - Validaciones personalizadas
- `async-validation-decorator.md` - Validación async de unicidad
- `../../02-base-entity/base-entity-core.md` - isUnique(), validateUnique()
- `../../tutorials/02-validations.md` - Tutorial de validaciones

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/unique_decorator.ts`  
**Líneas:** ~30
