# Disabled Decorator

## 1. Propósito

El decorator Disabled marca propiedad como deshabilitada en interfaz de usuario, impidiendo edición por usuario Y excluyendo valor de requests HTTP al backend. Los campos disabled se muestran visualmente deshabilitados (grayed out, opacity reducida, cursor not-allowed) pero mantienen visibilidad para propósitos informativos (audit fields, computed values, auto-generated IDs). Critical para IDs auto-incrementales que backend genera, campos de auditoría (createdAt, updatedAt, createdBy) que backend gestiona, SKUs o códigos que no deben modificarse post-creation, valores calculados que frontend muestra pero backend no necesita recibir, y prevención de edición según estado (orden completada, factura pagada, documento aprobado). Disabled difiere fundamentalmente de ReadOnly: Disabled NO envía valor al backend en save() (excluded de toDictionary()), NO valida el campo (Required/Validation ignorados), y tiene estilo visual más evidente (grayed out vs solo non-editable). ReadOnly envía valor al backend, valida normalmente, y tiene estilo visual menos intrusivo. Soporta conditional disabling mediante functions que evalúan estado de entity: `@Disabled((entity) => entity.status === 'locked')`.

## 2. Alcance

**Responsabilidades cubiertas:**
- Marcar propiedad como disabled en UI (input disabled attribute = true)
- Aplicar estilos visuales de disabled (grayed out, opacity 0.6, cursor not-allowed, background-color #f5f5f5)
- Excluir propiedad de toDictionary() output usado en POST/PUT requests al backend
- Prevenir edición de campo en forms independientemente de user input attempts
- Soportar disabling estático (boolean true) y dinámico (function que retorna boolean evaluado en runtime)
- Proveer isDisabled(propertyKey) accessor estático e instancia que retorna boolean indicando disabled state
- Ignorar validaciones (@Required, @Validation, @AsyncValidation) en campos disabled (validación skipped)
- Evaluar function conditions en cada render de input component (reactive disabling según entity state changes)
- Permitir conditional disabling basado en entity state: `@Disabled((entity) => entity.id > 0)` deshabilita solo en edit mode

**Límites del alcance:**
- Decorator NO oculta visualmente el campo (usar @HideInDetailView para eso)
- NO previene modificación programática de valor en código (this.disabledProp = newValue es permitido, solo UI bloqueada)
- NO modifica comportamiento de accessors (getter/setter siguen funcionando normalmente)
- isDisabled() retorna boolean, NO throw exception si acceso a metadata falla
- Function conditions NO reciben parámetros adicionales (solo receiven entity instance como this context)
- NO valida que backend tenga lógica correspondiente (developer responsable de asegurar que backend NO espera campos disabled)
- Static isDisabled(propertyKey) retorna false para function conditions (necesita instance para evaluar)
- Exclusión de toDictionary() es automática, NO configurable (NO hay opción "disabled pero enviar igual")
- NO afecta a fromJSON() o constructor assignment (valores pueden asignarse en loading data de backend)

## 3. Definiciones Clave

**DISABLED_METADATA Symbol:** Identificador único usado como property key en prototype para almacenar object map de disabled conditions. Definido como `export const DISABLED_METADATA = Symbol('disabled')`. Estructura: `{ [propertyKey: string]: boolean | ((entity: BaseEntity) => boolean) }`.

**Disabled Condition Type:** Type union `boolean | ((entity: BaseEntity) => boolean)`. Valor true deshabilita siempre, false nunca deshabilita, function evaluada en runtime que retorna boolean.

**Decorator Signature:** `function Disabled(condition?: boolean | ((entity: BaseEntity) => boolean) = true): PropertyDecorator`. Default value true si NO se pasa parámetro.

**Static Disabling:** Valor boolean true en metadata que deshabilita propiedad permanentemente. Usado para IDs, audit fields, auto-generated values.

**Dynamic Disabling:** Function en metadata evaluada EN CADA render del input component. Ejemplo: `@Disabled((entity: Product) => entity.id > 0)` deshabilita solo en edit mode.

**isDisabled(propertyKey) Accessor:** Método estático e instancia en BaseEntity que retorna boolean. Evalúa metadata: si es boolean retorna directamente, si es function ejecuta con entity instance.

**toDictionary() Exclusion:** Disabled fields son SKIPPED: `if (this.isDisabled(prop)) continue;` previene inclusión en output object.

**Disabled vs ReadOnly:** Disabled NO envía al backend, NO valida, estilo visual más intrusivo. ReadOnly envía al backend, valida, estilo menos intrusivo.

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
// src/decorations/disabled_decorator.ts

import { DISABLED_METADATA } from './index';

/**
 * Marca una propiedad como deshabilitada en la interfaz de usuario
 * y excluida de requests al backend
 * 
 * @param condition - Boolean true o function que retorna boolean
 * @returns PropertyDecorator
 */
export function Disabled(
    condition: boolean | ((entity: any) => boolean) = true
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const propKey = propertyKey.toString();
        
        if (!target[DISABLED_METADATA]) {
            target[DISABLED_METADATA] = {};
        }
        
        target[DISABLED_METADATA][propKey] = condition;
    };
}
```

Ubicación: `src/decorations/disabled_decorator.ts` (líneas 1-30)

### Metadata Storage en Prototype

```typescript
// Estructura en prototype después de aplicar decorators
Product.prototype[DISABLED_METADATA] = {
    'id': true,                              // Siempre disabled (static)
    'createdAt': true,                       // Siempre disabled (static)
    'updatedAt': true,                       // Siempre disabled (static)
    'sku': (entity) => entity.id > 0,        // Dynamic: disabled solo en edit mode
    'price': (entity) => entity.status === 'locked'  // Dynamic: disabled por estado
}
```

### Accessor Método isDisabled() en BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Verifica si una propiedad está deshabilitada (método de instancia)
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns true si está deshabilitada
 */
public isDisabled(propertyKey: string): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    const disabledMetadata = constructor.prototype[DISABLED_METADATA];
    
    if (!disabledMetadata || !disabledMetadata[propertyKey]) {
        return false;
    }
    
    const condition = disabledMetadata[propertyKey];
    
    // Si es función, evaluarla con la instancia actual
    if (typeof condition === 'function') {
        return condition(this);
    }
    
    // Si es boolean, retornar directamente
    return condition === true;
}

/**
 * Verifica si una propiedad está deshabilitada (método estático)
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns true si está deshabilitada (solo para static conditions)
 */
public static isDisabled(propertyKey: string): boolean {
    const disabledMetadata = this.prototype[DISABLED_METADATA];
    
    if (!disabledMetadata || !disabledMetadata[propertyKey]) {
        return false;
    }
    
    const condition = disabledMetadata[propertyKey];
    
    // Si es función, retornar false (necesita instancia para evaluar)
    if (typeof condition === 'function') {
        return false;
    }
    
    return condition === true;
}
```

Ubicación: `src/entities/base_entitiy.ts` (líneas 730-770)

### Exclusión en toDictionary()

```typescript
// src/entities/base_entitiy.ts

/**
 * Convierte la entidad a un objeto plano para enviar al servidor
 * EXCLUYE campos disabled automáticamente
 */
public toDictionary(): Record<string, any> {
    const dict: Record<string, any> = {};
    const properties = this.getProperties();
    
    for (const prop of properties) {
        // SKIP: Campos disabled no se envían al backend
        if (this.isDisabled(prop)) {
            continue;
        }
        
        // SKIP: Campos readonly (opcional según configuración)
        // if (this.isReadOnly(prop)) {
        //     continue;
        // }
        
        dict[prop] = this[prop];
    }
    
    return dict;
}
```

Ubicación: `src/entities/base_entitiy.ts` (líneas 180-210)

### Integración en UI Components

```vue
<!-- src/components/Form/TextInput.vue -->

<template>
  <input
    v-model="modelValue"
    type="text"
    :disabled="isDisabled"
    :class="{ 'disabled': isDisabled }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type BaseEntity from '@/entities/base_entitiy';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
    entityClass: typeof BaseEntity;
}>();

// Computed reactive que evalúa isDisabled()
const isDisabled = computed(() => {
    return props.entity.isDisabled(props.property);
});
</script>

<style scoped>
.disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
```

Ubicación: `src/components/Form/TextInput.vue` (líneas 1-35)

## 5. Flujo de Funcionamiento

### Fase 1: Aplicación del Decorator

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Disabled()  // ← Decorator ejecutado aquí
    id!: number;
}

// Resultado después de ejecutar decorator:
Product.prototype[DISABLED_METADATA] = {
    'id': true
}
```

### Fase 2: Constructor y Carga de Data

```typescript
const product = new Product();
product.id = 42;            // Asignación programática permitida
product.name = 'Laptop';

// Metadata ya está disponible en prototype
console.log(product.isDisabled('id'));  // true
```

### Fase 3: Renderizado en UI

```vue
<template>
  <!-- Component evalúa isDisabled() -->
  <TextInput
    v-model="product.id"
    property="id"
    :entity="product"
  />
  <!-- Resultado: <input disabled="true" class="disabled" /> -->
</template>
```

Flujo dentro del component:

1. Component recibe `entity` y `property`
2. Computed `isDisabled` ejecuta `entity.isDisabled(property)`
3. BaseEntity.isDisabled() accede a metadata
4. Si condition es function, ejecuta con entity instance
5. Retorna boolean
6. Vue reactive system actualiza `:disabled` attribute

### Fase 4: User Interaction (Bloqueado)

```
Usuario intenta escribir en input
    ↓
Browser previene input por disabled attribute
    ↓
Ningún evento emitido, valor NO cambia
```

### Fase 5: Guardado al Backend

```typescript
await product.save();

// Dentro de save():
const payload = product.toDictionary();

// toDictionary() itera properties:
for (const prop of properties) {
    if (this.isDisabled(prop)) {
        continue;  // ← 'id' es skipped
    }
    dict[prop] = this[prop];
}

// Payload final:
{
    name: 'Laptop'
    // id: NO incluido
}
```

### Fase 6: Response del Backend

```typescript
// Backend response:
{
    id: 42,        // Backend retorna el ID
    name: 'Laptop',
    createdAt: '2025-01-15T10:30:00Z'
}

// fromJSON() asigna valores (incluye disabled fields):
product.fromJSON(response);

console.log(product.id);  // 42 (disabled field puede recibir valores)
```

### Flujo con Dynamic Condition

```typescript
export class Product extends BaseEntity {
    @PropertyName('SKU', String)
    @Disabled((entity: Product) => entity.id > 0)
    sku!: string;
}

// CREATE MODE (id = undefined):
const newProduct = new Product();
console.log(newProduct.isDisabled('sku'));  // false → condition(newProduct) retorna false

// UI renderiza con disabled=false → SKU editable

// EDIT MODE (id = 42):
const existingProduct = await Product.getElement(42);
console.log(existingProduct.isDisabled('sku'));  // true → condition(existingProduct) retorna true

// UI renderiza con disabled=true → SKU no editable
```

## 6. Reglas Obligatorias

### Regla 1: IDs Auto-generados DEBEN usar @Disabled

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Primary()
    @Disabled()  // ← OBLIGATORIO para IDs auto-incrementales
    id!: number;
}
```

Razón: Backend genera el ID, frontend NO debe enviarlo en POST/PUT.

### Regla 2: Audit Fields DEBEN usar @Disabled

```typescript
export class Product extends BaseEntity {
    @PropertyName('Created At', Date)
    @Disabled()  // ← OBLIGATORIO
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @Disabled()  // ← OBLIGATORIO
    updatedAt!: Date;
    
    @PropertyName('Created By', String)
    @Disabled()  // ← OBLIGATORIO
    createdBy!: string;
}
```

Razón: Backend gestiona estos campos automáticamente.

### Regla 3: Campos que NO deben enviarse al Backend DEBEN usar @Disabled

```typescript
export class Product extends BaseEntity {
    // Campo calculado en frontend, NO enviarlo al backend
    @PropertyName('Full Description', String)
    @Disabled()
    get fullDescription(): string {
        return `${this.name} - ${this.sku}`;
    }
}
```

### Regla 4: @Disabled + @Required es Inválido

```typescript
// INCORRECTO:
@PropertyName('Product ID', Number)
@Disabled()
@Required()  // ← INVÁLIDO: disabled fields NO se validan
id!: number;

// CORRECTO (si el campo es disabled, no necesita @Required):
@PropertyName('Product ID', Number)
@Disabled()
id!: number;
```

### Regla 5: Dynamic Conditions DEBEN ser Pure Functions

```typescript
// CORRECTO:
@Disabled((entity: Product) => entity.status === 'locked')
price!: number;

// INCORRECTO (side effects):
@Disabled((entity: Product) => {
    console.log('Evaluating...');  // ← NO: side effects
    return entity.status === 'locked';
})
price!: number;
```

Razón: Function se ejecuta en cada render (puede ser miles de veces).

### Regla 6: Usar @Disabled para Prevención de Edición, NO @ReadOnly

```typescript
// Caso: ID que NO debe editarse Y NO debe enviarse
@PropertyName('Product ID', Number)
@Disabled()  // ← CORRECTO
id!: number;

// NO usar:
@PropertyName('Product ID', Number)
@ReadOnly()  // ← INCORRECTO: envía al backend innecesariamente
id!: number;
```

## 7. Prohibiciones

### Prohibición 1: NO usar @Disabled para Campos que Backend Espera

```typescript
// INCORRECTO:
export class Product extends BaseEntity {
    @PropertyName('Price', Number)
    @Disabled()  // ← ERROR: backend espera price en PUT
    price!: number;
}

// Si backend requiere el campo, usar @ReadOnly en lugar de @Disabled
@PropertyName('Price', Number)
@ReadOnly()  // ← CORRECTO: envía al backend pero no editable
price!: number;
```

### Prohibición 2: NO combinar @Disabled con @Required, @Validation, @AsyncValidation

```typescript
// INCORRECTO:
@PropertyName('Product ID', Number)
@Disabled()
@Required()  // ← Inútil: disabled fields NO se validan
id!: number;

// CORRECTO (elegir uno u otro):
@PropertyName('Product ID', Number)
@Disabled()  // Si NO debe validarse
id!: number;

// O:
@PropertyName('Product Name', String)
@Required()  // Si DEBE validarse (entonces NO usar @Disabled)
name!: string;
```

### Prohibición 3: NO usar @Disabled para Ocultar Campos

```typescript
// INCORRECTO (usa @Disabled para ocultar):
@PropertyName('Secret', String)
@Disabled()  // ← Campo sigue visible, solo disabled
secret!: string;

// CORRECTO (usar @HideInDetailView):
@PropertyName('Secret', String)
@HideInDetailView()  // ← Campo NO renderizado
secret!: string;
```

### Prohibición 4: NO confiar en @Disabled para Validación de Seguridad

```typescript
// INSEGURO:
@PropertyName('Price', Number)
@Disabled((entity: Product) => {
    const user = Application.currentUser;
    return user?.role !== 'admin';  // ← INSEGURO: frontend puede manipularse
})
price!: number;

// Disabled previene edición en UI, pero NO previene:
// - Modificación programática: product.price = 9999;
// - Manipulación de requests HTTP en DevTools
// - Bypass de frontend

// SEGURO: Backend DEBE validar permisos SIEMPRE
```

### Prohibición 5: NO usar @Disabled con Getters sin Setter

```typescript
// INNECESARIO:
@PropertyName('Full Name', String)
@Disabled()  // ← Innecesario: getter es readonly por naturaleza
get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
}

// CORRECTO (omitir @Disabled, getters son implícitamente disabled):
@PropertyName('Full Name', String)
get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
}
```

### Prohibición 6: NO usar Dynamic Conditions con Efectos Secundarios

```typescript
// PROHIBIDO:
let evaluationCount = 0;

@Disabled((entity: Product) => {
    evaluationCount++;  // ← PROHIBIDO: side effect
    fetch('/log-evaluation');  // ← PROHIBIDO: API call
    return entity.status === 'locked';
})
price!: number;

// Razón: Function se ejecuta en cada render (decenas/cientos de veces)
```

## 8. Dependencias e Integraciones

### Dependencia 1: BaseEntity Core

```typescript
// BaseEntity provee isDisabled() accessor
import BaseEntity from '@/entities/base_entitiy';

export class Product extends BaseEntity {
    @Disabled()
    id!: number;
}

// isDisabled() disponible:
const product = new Product();
console.log(product.isDisabled('id'));  // true
```

Archivo: [base-entity-core.md](../02-base-entity/base-entity-core.md)

### Dependencia 2: toDictionary() Method

```typescript
// toDictionary() integra exclusión de disabled fields
public toDictionary(): Record<string, any> {
    const dict: Record<string, any> = {};
    const properties = this.getProperties();
    
    for (const prop of properties) {
        if (this.isDisabled(prop)) {
            continue;  // ← Disabled fields excluded
        }
        dict[prop] = this[prop];
    }
    
    return dict;
}
```

Archivo: [state-and-conversion.md](../02-base-entity/state-and-conversion.md)

### Dependencia 3: Validation System

```typescript
// Validation system skipea disabled fields
public validateInputs(): boolean {
    const properties = this.getProperties();
    
    for (const prop of properties) {
        // Skip disabled fields
        if (this.isDisabled(prop)) {
            continue;
        }
        
        // Validar solo campos enabled
        if (this.isRequired(prop) && !this[prop]) {
            this.validationErrors[prop] = `${prop} is required`;
        }
    }
}
```

Archivo: [validation-system.md](../02-base-entity/validation-system.md)

### Dependencia 4: Form Input Components

```vue
<!-- TextInput.vue, NumberInput.vue, DateInput.vue, etc. -->
<template>
  <input
    :disabled="isDisabled"
    :class="{ 'disabled': isDisabled }"
  />
</template>

<script setup>
const isDisabled = computed(() => props.entity.isDisabled(props.property));
</script>
```

Archivos:
- `src/components/Form/TextInput.vue`
- `src/components/Form/NumberInput.vue`
- `src/components/Form/DateInput.vue`
- `src/components/Form/SelectInput.vue`
- Todos los form inputs DEBEN implementar esta lógica

### Dependencia 5: CRUD Operations

```typescript
// save() usa toDictionary() que excluye disabled fields
public async save(): Promise<boolean> {
    const payload = this.toDictionary();  // ← Disabled fields excluded
    
    const method = this.isNew() ? 'POST' : 'PUT';
    const response = await fetch(this.getApiEndpoint(), {
        method,
        body: JSON.stringify(payload)  // ← NO contiene disabled fields
    });
    
    return response.ok;
}
```

Archivo: [crud-operations.md](../02-base-entity/crud-operations.md)

### Dependencia 6: Module Icon Decorator

```typescript
// Disabled NO afecta a module decorators
@ModuleName('Products')
@ModuleIcon('shopping-cart')
export class Product extends BaseEntity {
    @Disabled()
    id!: number;
}

// Module metadata sigue funcionando normalmente
```

### Dependencia 7: Property Name Decorator

```typescript
// @PropertyName DEBE aplicarse ANTES de @Disabled
@PropertyName('Product ID', Number)  // ← PRIMERO
@Disabled()                           // ← SEGUNDO
id!: number;

// NO al revés:
// @Disabled()  // ← INCORRECTO
// @PropertyName('Product ID', Number)
// id!: number;
```

Archivo: [property-name-decorator.md](property-name-decorator.md)

## 9. Relaciones con Otros Elementos

### Relación con @ReadOnly

**Diferencias Clave:**

| Aspecto | @Disabled | @ReadOnly |
|---------|-----------|-----------|
| **Editable en UI** | No | No |
| **Se envía al backend** | NO | SÍ |
| **Se valida** | NO | SÍ |
| **Estilo visual** | Grayed out, opacity baja | Normal, solo sin cursor edición |
| **Uso típico** | IDs, audit fields | Campos calculados, referencias |

**Ejemplo Comparativo:**

```typescript
export class Product extends BaseEntity {
    // Disabled: No editable, NO se envía, NO se valida
    @PropertyName('Product ID', Number)
    @Disabled()
    @Required()  // ← Ignored
    id!: number;
    
    // ReadOnly: No editable, SÍ se envía, SÍ se valida
    @PropertyName('SKU', String)
    @ReadOnly()
    @Required()  // ← Validado
    sku!: string;
}

// Al guardar:
await product.save();

// Request:
{
    // id: NO incluido (disabled)
    sku: 'PROD-001'  // SÍ incluido (readonly)
}
```

Archivo: [readonly-decorator.md](readonly-decorator.md)

### Relación con @Required

**Interacción:** @Disabled ANULA @Required

```typescript
@PropertyName('Product ID', Number)
@Disabled()
@Required()  // ← IGNORADO por validation system
id!: number;

// validateInputs() skipea campos disabled:
if (this.isDisabled(prop)) {
    continue;  // ← Required check no ejecutado
}
```

**Regla:** NO combinar @Disabled + @Required (inútil).

Archivo: [required-decorator.md](required-decorator.md)

### Relación con @Validation

**Interacción:** @Disabled ANULA @Validation

```typescript
@PropertyName('Email', String)
@Disabled()
@Validation((value) => /\S+@\S+\.\S+/.test(value))  // ← IGNORADO
email!: string;

// Validation system skipea disabled fields
```

Archivo: [validation-decorator.md](validation-decorator.md)

### Relación con @AsyncValidation

**Interacción:** @Disabled ANULA @AsyncValidation

```typescript
@PropertyName('Username', String)
@Disabled()
@AsyncValidation(async (value) => {
    const response = await fetch(`/api/check-username/${value}`);
    return response.ok;
})  // ← NUNCA ejecutado si disabled
username!: string;
```

Archivo: [async-validation-decorator.md](async-validation-decorator.md)

### Relación con @HideInDetailView

**Diferencia:** @Disabled muestra campo (grayed out), @HideInDetailView NO renderiza

```typescript
export class Product extends BaseEntity {
    // Disabled: Visible pero no editable
    @PropertyName('Created At', Date)
    @Disabled()
    createdAt!: Date;
    
    // Hidden: NO renderizado
    @PropertyName('Internal ID', String)
    @HideInDetailView()
    internalId!: string;
}
```

Archivo: [hide-in-detail-view-decorator.md](hide-in-detail-view-decorator.md)

### Relación con @Primary

**Patrón Común:** Primary keys suelen ser disabled

```typescript
@PropertyName('Product ID', Number)
@Primary()   // ← Marca como primary key
@Disabled()  // ← Previene edición y envío
id!: number;
```

Archivo: [primary-property-decorator.md](primary-property-decorator.md)

### Relación con @Persistent

**Independiente:** @Disabled NO afecta @Persistent

```typescript
@PropertyName('Product ID', Number)
@Persistent('product_id')  // ← Mapping camelCase ↔ snake_case
@Disabled()                 // ← Exclusión de toDictionary()
id!: number;

// Cuando carga data (fromJSON):
// Usa persistent key 'product_id' normalmente

// Cuando guarda data (toDictionary):
// Excluye 'id' completamente (disabled)
```

Archivo: [persistent-decorator.md](persistent-decorator.md)

## 10. Notas de Implementación

### Nota 1: Dynamic Conditions son Re-evaluadas en Cada Render

```typescript
@PropertyName('Price', Number)
@Disabled((entity: Product) => {
    console.log('EVALUATED!');  // ← Se ejecuta múltiples veces
    return entity.status === 'locked';
})
price!: number;
```

**Implicación:** Functions DEBEN ser:
- Rápidas (sin async, sin API calls)
- Sin side effects (no modificar state, no logging)
- Deterministas (mismo input → mismo output)

### Nota 2: Static isDisabled() NO evalúa Functions

```typescript
export class Product extends BaseEntity {
    @Disabled((entity: Product) => entity.id > 0)
    sku!: string;
}

// Método estático retorna false para functions
Product.isDisabled('sku');  // false (necesita instance)

// Método de instancia evalúa la function
const product = new Product();
product.id = 42;
product.isDisabled('sku');  // true (evalúa function con instance)
```

### Nota 3: Disabled NO previene Asignación Programática

```typescript
export class Product extends BaseEntity {
    @Disabled()
    id!: number;
}

const product = new Product();
product.id = 42;  // ← PERMITIDO (solo UI está disabled)

console.log(product.id);  // 42
```

**Disabled previene:**
- Edición en UI por usuario
- Inclusión en toDictionary()

**Disabled NO previene:**
- Asignación programática (`this.id = value`)
- fromJSON() assignment
- Constructor assignment

### Nota 4: Combinar con Getters

```typescript
export class Product extends BaseEntity {
    @PropertyName('First Name', String)
    firstName!: string;
    
    @PropertyName('Last Name', String)
    lastName!: string;
    
    // Getter calculado: implícitamente disabled (no necesita decorator)
    @PropertyName('Full Name', String)
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
    
    // Si quieres forzar disabled explícitamente (opcional):
    @PropertyName('Display Name', String)
    @Disabled()
    get displayName(): string {
        return this.fullName.toUpperCase();
    }
}
```

### Nota 5: Disabled Durante Loading State

```typescript
export class Product extends BaseEntity {
    @Disabled()
    id!: number;
    
    // Opcional: Deshabilitar todos los campos durante loading
    @PropertyName('Name', String)
    @Disabled((entity: Product) => entity.getLoadingState())
    name!: string;
}

// Durante carga:
const product = Product.getElement(42);
product.isDisabled('name');  // true (loading state)

// Después de cargar:
await product.loaded();
product.isDisabled('name');  // false (carga completa)
```

Archivo: [state-and-conversion.md](../02-base-entity/state-and-conversion.md)

### Nota 6: Disabled vs Null Values

```typescript
export class Product extends BaseEntity {
    @Disabled()
    id?: number;  // ← Puede ser null/undefined
}

const product = new Product();
console.log(product.id);  // undefined

// Disabled NO significa "valor siempre presente"
// Solo significa "no editable y no enviar al backend"
```

### Nota 7: Disabled en Arrays o Relations

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @Disabled()
    id!: number;
    
    // Array de items: individual items NO disabled
    @PropertyName('Items', Array)
    items!: OrderItem[];
}

// 'items' NO está disabled, pero 'id' sí
const order = new Order();
order.isDisabled('id');     // true
order.isDisabled('items');  // false

// Si quieres disabled:
@PropertyName('Items', Array)
@Disabled()  // ← Ahora 'items' está disabled
items!: OrderItem[];
```

### Nota 8: Performance con Muchos Campos Disabled

```typescript
// Si tienes muchos fields con dynamic conditions:
export class LargeEntity extends BaseEntity {
    @Disabled((e: LargeEntity) => e.status === 'locked')
    field1!: string;
    
    @Disabled((e: LargeEntity) => e.status === 'locked')
    field2!: string;
    
    // ... 50 fields más con la misma condition
}

// OPTIMIZACIÓN: Cachear el resultado
private _cachedStatus?: string;
private _isLocked?: boolean;

public get isLocked(): boolean {
    if (this.status !== this._cachedStatus) {
        this._cachedStatus = this.status;
        this._isLocked = this.status === 'locked';
    }
    return this._isLocked!;
}

// Usar getter en conditions:
@Disabled((e: LargeEntity) => e.isLocked)
field1!: string;
```

### Nota 9: Disabled en Nested Objects

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Disabled()
    id!: number;
    
    @PropertyName('Specifications', Object)
    specifications!: {
        weight: number;
        dimensions: string;
    };
}

// 'specifications' NO está disabled (es objeto normal)
// Para deshabilitar el objeto completo:
@PropertyName('Specifications', Object)
@Disabled()
specifications!: { weight: number; dimensions: string; };

// Para deshabilitar propiedades individuales del objeto:
// (Requiere crear entity separada para Specifications)
```

### Nota 10: Testing Disabled Fields

```typescript
import { describe, it, expect } from 'vitest';
import Product from '@/entities/products';

describe('Disabled Decorator', () => {
    it('should mark id as disabled', () => {
        const product = new Product();
        expect(product.isDisabled('id')).toBe(true);
    });
    
    it('should exclude disabled fields from toDictionary', () => {
        const product = new Product();
        product.id = 42;
        product.name = 'Laptop';
        
        const dict = product.toDictionary();
        
        expect(dict.id).toBeUndefined();  // ← Disabled field excluded
        expect(dict.name).toBe('Laptop');
    });
    
    it('should evaluate dynamic conditions', () => {
        const product = new Product();
        
        // Create mode: sku enabled
        product.id = 0;
        expect(product.isDisabled('sku')).toBe(false);
        
        // Edit mode: sku disabled
        product.id = 42;
        expect(product.isDisabled('sku')).toBe(true);
    });
});
```

## 11. Referencias Cruzadas

### Documentación de Framework

- [BaseEntity Core](../02-base-entity/base-entity-core.md) - Implementación de isDisabled()
- [State and Conversion](../02-base-entity/state-and-conversion.md) - toDictionary() exclusion
- [Validation System](../02-base-entity/validation-system.md) - Validación skip de disabled fields
- [CRUD Operations](../02-base-entity/crud-operations.md) - save() con disabled exclusion

### Decorators Relacionados

- [readonly-decorator.md](readonly-decorator.md) - Diferencias Disabled vs ReadOnly
- [required-decorator.md](required-decorator.md) - Interacción Required + Disabled
- [validation-decorator.md](validation-decorator.md) - Validación ignorada en disabled
- [async-validation-decorator.md](async-validation-decorator.md) - AsyncValidation ignorada
- [hide-in-detail-view-decorator.md](hide-in-detail-view-decorator.md) - Ocultar vs Disabled
- [hide-in-list-view-decorator.md](hide-in-list-view-decorator.md) - Ocultar en listas
- [primary-property-decorator.md](primary-property-decorator.md) - Primary + Disabled pattern
- [persistent-decorator.md](persistent-decorator.md) - Persistent keys con Disabled

### Tutorials

- [01-basic-crud.md](../../tutorials/01-basic-crud.md) - Uso de Disabled en CRUD
- [02-validations.md](../../tutorials/02-validations.md) - Disabled excluye validaciones

### Components

- `src/components/Form/TextInput.vue` - Implementación disabled
- `src/components/Form/NumberInput.vue` - Implementación disabled
- `src/components/Form/DateInput.vue` - Implementación disabled
- `src/components/Form/SelectInput.vue` - Implementación disabled

### Código Fuente

- `src/decorations/disabled_decorator.ts` - Implementación decorator
- `src/decorations/index.ts` - Export DISABLED_METADATA Symbol
- `src/entities/base_entitiy.ts` - isDisabled() accessor methods

### Ejemplos de Uso

```typescript
// Entity con disabled fields
// Ver: src/entities/products.ts

export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Primary()
    @Disabled()
    id!: number;
    
    @PropertyName('Product Name', String)
    @Required()
    name!: string;
    
    @PropertyName('SKU', String)
    @Disabled((entity: Product) => entity.id > 0)
    sku!: string;
    
    @PropertyName('Created At', Date)
    @Disabled()
    createdAt!: Date;
}
```

Última actualización: 11 de Febrero, 2026  
Archivo fuente: `src/decorations/disabled_decorator.ts`  
Líneas: 30

    };
}
```

**Ubicación:** `src/decorations/disabled_decorator.ts` (línea ~1-30)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[DISABLED_METADATA] = {
    'id': true,                              // Siempre disabled
    'createdAt': true,                       // Siempre disabled
    'isActive': (entity) => entity.id > 0    // Disabled si existe (editing)
}
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Verifica si una propiedad está deshabilitada
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns true si está deshabilitada
 */
public isDisabled(propertyKey: string): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    const disabledMetadata = constructor.prototype[DISABLED_METADATA];
    
    if (!disabledMetadata || !disabledMetadata[propertyKey]) {
        return false;
    }
    
    const condition = disabledMetadata[propertyKey];
    
    // Si es función, evaluarla con la instancia
    if (typeof condition === 'function') {
        return condition(this);
    }
    
    // Si es boolean, retornar directamente
    return condition === true;
}

/**
 * Verifica si una propiedad está deshabilitada (método estático)
 */
public static isDisabled(propertyKey: string): boolean {
    const disabledMetadata = this.prototype[DISABLED_METADATA];
    
    if (!disabledMetadata || !disabledMetadata[propertyKey]) {
        return false;
    }
    
    const condition = disabledMetadata[propertyKey];
    
    // Si es función, retornar false (necesita instancia para evaluar)
    if (typeof condition === 'function') {
        return false;
    }
    
    return condition === true;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~730-770)

---

## 🎨 Impacto en UI

### FormInput Renderizado

```vue
<!-- src/components/Form/TextInput.vue -->

<template>
  <input
    v-model="modelValue"
    type="text"
    :disabled="isDisabled"
    :class="{ 'disabled': isDisabled }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
    entityClass: typeof BaseEntity;
}>();

const isDisabled = computed(() => {
    return props.entity.isDisabled(props.property);
});
</script>

<style scoped>
.disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
```

### Excluir de toDictionary()

```typescript
// src/entities/base_entitiy.ts

/**
 * Convierte la entidad a un objeto plano para enviar al servidor
 * EXCLUYE campos disabled
 */
public toDictionary(): Record<string, any> {
    const dict: Record<string, any> = {};
    const properties = this.getProperties();
    
    for (const prop of properties) {
        // ⚠️ Saltar propiedades disabled
        if (this.isDisabled(prop)) {
            continue;
        }
        
        // ⚠️ Saltar propiedades readonly (opcional, según configuración)
        // if (this.isReadOnly(prop)) {
        //     continue;
        // }
        
        dict[prop] = this[prop];
    }
    
    return dict;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~180-210)

---

## 🧪 Ejemplos de Uso

### 1. Deshabilitar Siempre (Primary Key)

```typescript
import { Disabled } from '@/decorations/disabled_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class Product extends BaseEntity {
    // ID siempre disabled (auto-generado por servidor)
    @PropertyName('Product ID', Number)
    @Disabled()
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
}
```

**Resultado:**
- Campo "Product ID" aparece disabled en forms
- `id` NO se envía en POST/PUT requests
- Usuario no puede editar el ID

---

### 2. Deshabilitar en Edición, Habilitar en Creación

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Disabled()
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // SKU: editable al crear, disabled al editar
    @PropertyName('SKU', String)
    @Disabled((entity: Product) => entity.id > 0)
    sku!: string;
}
```

**Comportamiento:**
- **Crear nuevo producto:** SKU editable (id = undefined o 0)
- **Editar producto existente:** SKU disabled (id > 0)

---

### 3. Deshabilitar Campos de Auditoría

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Disabled()
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // Campos de auditoría: siempre disabled
    @PropertyName('Created At', Date)
    @Disabled()
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @Disabled()
    updatedAt!: Date;
    
    @PropertyName('Created By', String)
    @Disabled()
    createdBy!: string;
}
```

**Resultado:**
- Campos de auditoría visibles pero no editables
- NO se envían al servidor (servidor los gestiona)

---

### 4. Deshabilitar por Estado

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    @Disabled()
    id!: number;
    
    @PropertyName('Customer', String)
    name!: string;
    
    // Total: disabled si orden está completada
    @PropertyName('Total', Number)
    @Disabled((entity: Order) => entity.status === 'completed')
    total!: number;
    
    // Status: siempre editable
    @PropertyName('Status', String)
    status!: 'pending' | 'processing' | 'completed' | 'cancelled';
}
```

**Comportamiento:**
- Si `status === 'completed'`: Total disabled (no editable)
- Si `status !== 'completed'`: Total editable

---

### 5. Deshabilitar por Permisos

```typescript
import Application from '@/models/application';

export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Disabled()
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // Precio: solo editable por admins
    @PropertyName('Price', Number)
    @Disabled((entity: Product) => {
        const user = Application.currentUser;
        return user?.role !== 'admin';
    })
    price!: number;
}
```

**Comportamiento:**
- **Admin users:** Precio editable
- **Non-admin users:** Precio disabled

---

### 6. Combo @Disabled + @ReadOnly

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Disabled()          // No editable, no se envía
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('SKU', String)
    @ReadOnly()          // No editable, SÍ se envía
    sku!: string;
    
    @PropertyName('Created At', Date)
    @Disabled()          // No editable, no se envía (servidor lo gestiona)
    createdAt!: Date;
}
```

**Diferencias:**
- `id`: Disabled → NO editable, NO se envía
- `sku`: ReadOnly → NO editable, SÍ se envía
- `createdAt`: Disabled → NO editable, NO se envía (servidor lo gestiona)

---

### 7. Deshabilitar Según Otro Campo

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice ID', Number)
    @Disabled()
    id!: number;
    
    @PropertyName('Is Paid', Boolean)
    isPaid!: boolean;
    
    // Campos disabled si factura está pagada
    @PropertyName('Amount', Number)
    @Disabled((entity: Invoice) => entity.isPaid === true)
    amount!: number;
    
    @PropertyName('Due Date', Date)
    @Disabled((entity: Invoice) => entity.isPaid === true)
    dueDate!: Date;
    
    @PropertyName('Payment Date', Date)
    @Disabled((entity: Invoice) => entity.isPaid === false)
    paymentDate?: Date;
}
```

**Comportamiento:**
- Si `isPaid === true`:
  - Amount disabled
  - Due Date disabled
  - Payment Date editable
- Si `isPaid === false`:
  - Amount editable
  - Due Date editable
  - Payment Date disabled

---

### 8. Deshabilitar Temporalmente Durante Guardado

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Disabled()
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // Flag temporal
    private _isSaving: boolean = false;
    
    // Deshabilitar todos los campos durante guardado
    @PropertyName('Price', Number)
    @Disabled((entity: Product) => entity._isSaving)
    price!: number;
    
    // Override save() para establecer flag
    public override async save(): Promise<boolean> {
        this._isSaving = true;
        try {
            return await super.save();
        } finally {
            this._isSaving = false;
        }
    }
}
```

**Comportamiento:**
- Durante `save()`: Todos los campos disabled
- Después de `save()`: Campos vuelven a estado normal

---

## 🔄 Comparación: @Disabled vs @ReadOnly

| Aspecto | @Disabled | @ReadOnly |
|---------|-----------|-----------|
| **Editable en UI** | ❌ No | ❌ No |
| **Se envía al servidor** | ❌ No | ✅ Sí |
| **Se valida** | ❌ No | ✅ Sí |
| **Estilo visual** | Grayed out, opacidad baja | Normal, solo sin cursor de edición |
| **Uso típico** | IDs, campos de auditoría | Campos calculados, referencias |

### Ejemplo Comparativo

```typescript
export class Product extends BaseEntity {
    // Disabled: No editable, no se envía, no se valida
    @PropertyName('Product ID', Number)
    @Disabled()
    @Required()  // ← Ignored (disabled fields no se validan)
    id!: number;
    
    // ReadOnly: No editable, SÍ se envía, SÍ se valida
    @PropertyName('SKU', String)
    @ReadOnly()
    @Required()  // ← Se valida
    sku!: string;
    
    @PropertyName('Product Name', String)
    @Required()
    name!: string;
}

// ========================================
// Al guardar un producto existente:
// ========================================

const product = new Product();
product.id = 42;           // Disabled
product.sku = 'PROD-001';  // ReadOnly
product.name = 'Laptop';

await product.save();

// Request al servidor:
{
    // id: NO incluido (disabled)
    sku: 'PROD-001',  // SÍ incluido (readonly)
    name: 'Laptop'
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Disabled vs Hidden

```typescript
// @Disabled: Campo visible pero no editable
@PropertyName('Created At', Date)
@Disabled()
createdAt!: Date;

// @HideInDetailView: Campo no visible
@PropertyName('Internal ID', Number)
@HideInDetailView()
internalId!: number;
```

### 2. Disabled No Se Valida

```typescript
// ⚠️ Validaciones en campos disabled se ignoran
@PropertyName('Product ID', Number)
@Disabled()
@Required()      // ← Ignored
@Validation(...)  // ← Ignored
id!: number;
```

### 3. Funciones Dinámicas Se Re-evalúan

```typescript
@PropertyName('Price', Number)
@Disabled((entity: Product) => entity.isLocked)
price!: number;

// Cada vez que se renderiza el input, se evalúa la función
// Si entity.isLocked cambia, el estado disabled cambia automáticamente
```

### 4. No Afecta a toDictionary() de Otros Campos

```typescript
// Disabled solo excluye el campo disabled, no afecta a otros
@Disabled()
id!: number;

@PropertyName('Name', String)
name!: string;  // ← Se incluye normalmente en toDictionary()
```

### 5. Usar con @Primary

```typescript
// Patrón común: Primary key siempre disabled
@PropertyName('Product ID', Number)
@Primary()
@Disabled()
id!: number;
```

---

## 📚 Referencias Adicionales

- `readonly-decorator.md` - Diferencias entre Disabled y ReadOnly
- `required-decorator.md` - Disabled ignora Required
- `validation-decorator.md` - Disabled ignora Validation
- `hide-in-detail-view-decorator.md` - Alternativa para ocultar completamente
- `../../02-base-entity/base-entity-core.md` - isDisabled() implementation
- `../../tutorials/02-validations.md` - Disabled en tutorial de validaciones

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/disabled_decorator.ts`  
**Líneas:** ~30
