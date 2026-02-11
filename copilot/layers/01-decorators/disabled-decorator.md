# 🚫 Disabled Decorator

**Referencias:**
- `readonly-decorator.md` - Similar pero diferente comportamiento
- `required-decorator.md` - Puede combinarse con Disabled
- `validation-decorator.md` - Campos disabled no se validan
- `../../02-base-entity/base-entity-core.md` - isDisabled() accessor
- `../../tutorials/02-validations.md` - Disabled en validaciones

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/disabled_decorator.ts`

---

## 🎯 Propósito

El decorador `@Disabled()` marca una propiedad como **deshabilitada** en la interfaz de usuario. Los campos deshabilitados:

- Se muestran visualmente deshabilitados (grayed out)
- No son editables por el usuario
- NO se envían al servidor en requests
- NO se validan
- Son completamente ignorados en el formulario

**Diferencia con @ReadOnly:**
- `@ReadOnly`: Campo visible, no editable, **SE envía al servidor**
- `@Disabled`: Campo no editable, **NO se envía al servidor**, **NO se valida**

---

## 📝 Sintaxis

```typescript
@Disabled(condition?: boolean | ((entity: BaseEntity) => boolean))
propertyName: Type;
```

### Parámetros

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `condition` | `boolean \| Function` | No | `true` | Condición para deshabilitar. Si es función, recibe la instancia de la entidad |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/disabled_decorator.ts

/**
 * Symbol para almacenar metadata de disabled
 */
export const DISABLED_METADATA = Symbol('disabled');

/**
 * @Disabled() - Deshabilita un campo en la UI
 * 
 * @param condition - Condición para deshabilitar (boolean o función)
 * @returns PropertyDecorator
 */
export function Disabled(
    condition: boolean | ((entity: BaseEntity) => boolean) = true
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[DISABLED_METADATA]) {
            target[DISABLED_METADATA] = {};
        }
        
        // Guardar condición
        target[DISABLED_METADATA][propertyKey] = condition;
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
