# 🔒 ReadOnly Decorator

**Referencias:**
- `disabled-decorator.md` - Disabled
- `property-name-decorator.md` - PropertyName
- `required-decorator.md` - Required
- `../04-components/form-inputs.md` - Form inputs

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/readonly_decorator.ts`

---

## 🎯 Propósito

Marca una propiedad como **solo lectura** (read-only), impidiendo que el usuario la edite en la UI. El campo se renderiza como texto plano o input deshabilitado.

Casos de uso comunes:
- Campos autogenerados: ID, timestamps
- Campos calculados: totales, promedios
- Campos del sistema: createdBy, updatedBy
- Campos bloqueados por estado: invoice completed → fields readonly

**Diferencia con @Disabled:**
- `@ReadOnly`: Campo NUNCA editable (siempre bloqueado)
- `@Disabled`: Campo condicionalmente editable (función decide)

---

## 🔑 Símbolo de Metadatos

```typescript
export const READONLY_KEY = Symbol('readonly');
```

### Almacenamiento

```typescript
proto[READONLY_KEY] = {
    'id': true,
    'createdAt': true,
    'totalAmount': true  // Campo calculado
}
```

---

## 💻 Firma del Decorador

```typescript
function ReadOnly(readonly: boolean = true): PropertyDecorator
```

### Tipos

```typescript
export type ReadOnlyState = boolean;
```

---

## 📖 Uso Básico

### Campos de Sistema

```typescript
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Product ID', Number)
    @ReadOnly(true)  // ← Siempre readonly
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Product Name', String)
    @Required(true)
    name!: string;  // ← Editable
    
    @PropertyIndex(10)
    @PropertyName('Created At', Date)
    @ReadOnly(true)  // ← Siempre readonly
    createdAt!: Date;
    
    @PropertyIndex(11)
    @PropertyName('Updated At', Date)
    @ReadOnly(true)  // ← Siempre readonly
    updatedAt!: Date;
}
```

**Resultado en DetailView:**

```
╔═══════════════════════════════════════╗
║         Product Details               ║
╠═══════════════════════════════════════╣
║  Product ID:  1                       ║  ← Texto plano (readonly)
║  Product Name: [Laptop            ]   ║  ← Input editable
║  Created At:  2024-01-15 10:30 AM     ║  ← Texto plano (readonly)
║  Updated At:  2024-02-10 14:22 PM     ║  ← Texto plano (readonly)
╚═══════════════════════════════════════╝
```

### Campo Calculado

```typescript
export class Order extends BaseEntity {
    @PropertyName('Items', Array)
    @ArrayOf(OrderItem)
    items!: OrderItem[];
    
    @PropertyName('Subtotal', Number)
    @ReadOnly(true)  // ← Calculado, no editable
    @DisplayFormat((v) => v ? `$${v.toFixed(2)}` : '-')
    get subtotal(): number {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }
    
    @PropertyName('Tax', Number)
    @ReadOnly(true)  // ← Calculado, no editable
    @DisplayFormat((v) => v ? `$${v.toFixed(2)}` : '-')
    get tax(): number {
        return this.subtotal * 0.10;  // 10% tax
    }
    
    @PropertyName('Total', Number)
    @ReadOnly(true)  // ← Calculado, no editable
    @DisplayFormat((v) => v ? `$${v.toFixed(2)}` : '-')
    get total(): number {
        return this.subtotal + this.tax;
    }
}
```

**Resultado:**

```
╔═══════════════════════════════════════╗
║  Subtotal:  $1,200.00                 ║  ← Readonly, calculado
║  Tax:       $120.00                   ║  ← Readonly, calculado
║  Total:     $1,320.00                 ║  ← Readonly, calculado
╚═══════════════════════════════════════╝
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos de Instancia

#### `isReadOnly(key: string): boolean`
Verifica si una propiedad es readonly.

```typescript
// Uso
const product = new Product();

product.isReadOnly('id');
// Retorna: true

product.isReadOnly('name');
// Retorna: false

// Ubicación en BaseEntity (línea ~330)
public isReadOnly(key: string): boolean {
    const readonly = (this.constructor as any).prototype[READONLY_KEY];
    return readonly?.[key] === true;
}
```

---

## 🎨 Impacto en UI

### Input Component con ReadOnly

```vue
<template>
  <div class="form-field">
    <label>{{ metadata.propertyName }}</label>
    
    <!-- Si es readonly, mostrar como texto plano -->
    <span v-if="metadata.isReadOnly" class="readonly-value">
      {{ formattedValue }}
    </span>
    
    <!-- Si NO es readonly, mostrar input editable -->
    <input
      v-else
      v-model="modelValue"
      :type="inputType"
      :disabled="metadata.isDisabled"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['entity', 'propertyKey', 'modelValue']);

const metadata = computed(() => ({
    propertyName: props.entity.getPropertyName(props.propertyKey),
    isReadOnly: props.entity.isReadOnly(props.propertyKey),
    isDisabled: props.entity.isDisabled(props.propertyKey)
}));

const formattedValue = computed(() => {
    return props.entity.getFormattedValue(props.propertyKey);
});
</script>
```

**Ubicación:** `src/components/Form/TextInputComponent.vue` (línea ~25)

### Styling de Campos ReadOnly

```css
.readonly-value {
    display: block;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: #666;
    font-family: monospace;
    cursor: not-allowed;
}
```

---

## 🔗 Decoradores Relacionados

### Combinar con Disabled

```typescript
export class Invoice extends BaseEntity {
    // ReadOnly: SIEMPRE bloqueado
    @PropertyName('Invoice Number', String)
    @ReadOnly(true)
    invoiceNumber!: string;
    
    // Disabled: Bloqueado CONDICIONALMENTE
    @PropertyName('Total Amount', Number)
    @Disabled((entity: Invoice) => entity.status === 'completed')
    totalAmount!: number;
}

// Comportamiento:
// - invoiceNumber: SIEMPRE readonly
// - totalAmount: readonly SI status === 'completed', editable si status === 'draft'
```

### ReadOnly + DisplayFormat

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order Total', Number)
    @ReadOnly(true)
    @DisplayFormat((v) => `$${v.toLocaleString()}`)
    total!: number;
}

// Muestra valor formateado: "$1,250.00" como texto plano
```

### ReadOnly + Validation (No tiene sentido)

```typescript
// ❌ Inútil: readonly nunca será editado, no necesita validación
@PropertyName('ID', Number)
@ReadOnly(true)
@Required(true)  // ← No tiene efecto (nunca se valida porque no se edita)
@Validation((e) => e.id > 0, 'Invalid ID')  // ← No tiene efecto
id!: number;

// ✅ Mejor: solo ReadOnly
@PropertyName('ID', Number)
@ReadOnly(true)
id!: number;
```

---

## 🧪 Ejemplos Avanzados

### 1. Timestamps Automáticos

```typescript
export class BaseAuditEntity extends BaseEntity {
    @PropertyIndex(9990)
    @PropertyName('Created At', Date)
    @ReadOnly(true)
    @DisplayFormat((v) => v ? new Date(v).toLocaleString() : '-')
    createdAt!: Date;
    
    @PropertyIndex(9991)
    @PropertyName('Created By', String)
    @ReadOnly(true)
    createdBy!: string;
    
    @PropertyIndex(9992)
    @PropertyName('Updated At', Date)
    @ReadOnly(true)
    @DisplayFormat((v) => v ? new Date(v).toLocaleString() : '-')
    updatedAt!: Date;
    
    @PropertyIndex(9993)
    @PropertyName('Updated By', String)
    @ReadOnly(true)
    updatedBy!: string;
}

// Usar en otras entidades
export class Customer extends BaseAuditEntity {
    @PropertyName('Customer Name', String)
    name!: string;
    // Hereda: createdAt, createdBy, updatedAt, updatedBy (todos readonly)
}
```

### 2. Status Workflow (ReadOnly Según Estado)

```typescript
export class PurchaseOrder extends BaseEntity {
    @PropertyName('Status', String)
    status!: string;  // 'draft', 'submitted', 'approved', 'completed'
    
    // Campos bloqueados después de submitir
    @PropertyName('Vendor', Vendor)
    @Disabled((entity: PurchaseOrder) => entity.status !== 'draft')
    vendor!: Vendor;
    
    // Aprobador: readonly hasta que se submita
    @PropertyName('Approver', User)
    @Disabled((entity: PurchaseOrder) => entity.status === 'draft')
    approver?: User;
    
    // Fecha de aprobación: siempre readonly (autogenerada)
    @PropertyName('Approved At', Date)
    @ReadOnly(true)
    approvedAt?: Date;
    
    // Total: siempre readonly (calculado)
    @PropertyName('Total', Number)
    @ReadOnly(true)
    @DisplayFormat((v) => v ? `$${v.toFixed(2)}` : '-')
    get total(): number {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }
}
```

### 3. Contador Autoincremental

```typescript
export class Ticket extends BaseEntity {
    @PropertyName('Ticket Number', String)
    @ReadOnly(true)
    @DisplayFormat((v) => `TICKET-${String(v).padStart(6, '0')}`)
    ticketNumber!: string;
    // ↑ "TICKET-000001", "TICKET-000042", etc.
    
    // El backend genera el número, frontend solo muestra
}
```

### 4. Campos de Integración Externa

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;  // Editable localmente
    
    // Sincronizado con API externa, no editable aquí
    @PropertyName('External ID', String)
    @ReadOnly(true)
    @HelpText('Synced from external system, cannot be edited')
    externalId?: string;
    
    @PropertyName('Last Sync', Date)
    @ReadOnly(true)
    @DisplayFormat((v) => v ? new Date(v).toLocaleString() : 'Never')
    lastSync?: Date;
}
```

### 5. Propiedades Computadas de Relación

```typescript
export class Employee extends BaseEntity {
    @PropertyName('First Name', String)
    firstName!: string;
    
    @PropertyName('Last Name', String)
    lastName!: string;
    
    // Full name: computado, readonly
    @PropertyName('Full Name', String)
    @ReadOnly(true)
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
    
    @PropertyName('Department', Department)
    department!: Department;
    
    // Manager: readonly, viene del departamento
    @PropertyName('Manager', User)
    @ReadOnly(true)
    get manager(): User | undefined {
        return this.department?.manager;
    }
}
```

### 6. Datos Históricos (Immutable)

```typescript
export class Transaction extends BaseEntity {
    // Transacciones son inmutables después de crearse
    @PropertyName('Transaction ID', String)
    @ReadOnly(true)
    id!: string;
    
    @PropertyName('Amount', Number)
    @ReadOnly(true)  // ← No editable después de creación
    @DisplayFormat((v) => `$${v.toFixed(2)}`)
    amount!: number;
    
    @PropertyName('Date', Date)
    @ReadOnly(true)  // ← No editable después de creación
    date!: Date;
    
    @PropertyName('Description', String)
    @ReadOnly(true)  // ← No editable después de creación
    description!: string;
    
    // Solo notas puede editarse
    @PropertyName('Notes', String)
    @StringTypeDef(StringType.TEXTAREA)
    notes?: string;  // ← Editable
}
```

### 7. ReadOnly Condicional con Override

```typescript
export class Document extends BaseEntity {
    @PropertyName('Status', String)
    status!: string;
    
    @PropertyName('Title', String)
    @ReadOnly(false)  // ← Por defecto editable
    title!: string;
    
    // Override isReadOnly() para lógica custom
    isReadOnly(key: string): boolean {
        // Si documento está archivado, TODO es readonly
        if (this.status === 'archived') {
            return true;
        }
        
        // Caso contrario, usar metadata normal
        return super.isReadOnly(key);
    }
}

// Uso:
const doc = new Document({ status: 'draft', title: 'My Doc' });
doc.isReadOnly('title');  // false (editable)

doc.status = 'archived';
doc.isReadOnly('title');  // true (bloqueado por archived)
```

### 8. ReadOnly + ViewGroup

```typescript
export class Invoice extends BaseEntity {
    // Editable
    @PropertyIndex(1)
    @PropertyName('Customer', Customer)
    @ViewGroup('Invoice Information')
    customer!: Customer;
    
    @PropertyIndex(2)
    @PropertyName('Issue Date', Date)
    @ViewGroup('Invoice Information')
    issueDate!: Date;
    
    // Readonly (cálculos)
    @PropertyIndex(20)
    @PropertyName('Subtotal', Number)
    @ViewGroup('Totals')
    @ReadOnly(true)
    @DisplayFormat((v) => `$${v.toFixed(2)}`)
    subtotal!: number;
    
    @PropertyIndex(21)
    @PropertyName('Tax', Number)
    @ViewGroup('Totals')
    @ReadOnly(true)
    @DisplayFormat((v) => `$${v.toFixed(2)}`)
    tax!: number;
    
    @PropertyIndex(22)
    @PropertyName('Total', Number)
    @ViewGroup('Totals')
    @ReadOnly(true)
    @DisplayFormat((v) => `$${v.toFixed(2)}`)
    total!: number;
}

// Resultado:
// Grupo "Invoice Information" → campos editables
// Grupo "Totals" → todo readonly (valores calculados)
```

---

## ⚠️ Consideraciones Importantes

### 1. ReadOnly vs Disabled

```typescript
// ReadOnly: NUNCA editable
@ReadOnly(true)
id!: number;

// Disabled: CONDICIONALMENTE no editable
@Disabled((e) => e.isLocked)
amount!: number;
```

### 2. ReadOnly NO Previene Asignación en Código

ReadOnly solo afecta la UI, no previene asignación programática:

```typescript
@PropertyName('ID', Number)
@ReadOnly(true)
id!: number;

const product = new Product();

// ✅ Esto funciona (asignación programática)
product.id = 123;

// ❌ Usuario NO puede editar en UI
// El input se renderiza como texto plano
```

### 3. ReadOnly Aplicado en Creación Y Edición

```typescript
@PropertyName('ID', Number)
@ReadOnly(true)
id!: number;

// Al crear nuevo registro:
// - UI no muestra input para ID (es readonly)
// - ID se genera en backend y se asigna después del save

// Al editar registro existente:
// - ID se muestra como texto plano (no editable)
```

### 4. Campos ReadOnly en save()

Los campos readonly SE INCLUYEN en save():

```typescript
@PropertyName('Created At', Date)
@ReadOnly(true)
createdAt!: Date;

// save() envía:
// { createdAt: "2024-01-15T10:30:00Z", ... }

// Es responsabilidad del backend ignorar/reestablecer campos readonly
```

### 5. Usar con Getters (Computed Properties)

```typescript
// ✅ CORRECTO: getter + readonly
@PropertyName('Full Name', String)
@ReadOnly(true)
get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
}

// ❌ INCORRECTO: setter en readonly no tiene sentido
@PropertyName('Full Name', String)
@ReadOnly(true)
get fullName(): string {
    return this._fullName;
}
set fullName(value: string) {  // ← Nunca se llamará desde UI
    this._fullName = value;
}
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function ReadOnly(readonly: boolean = true): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        if (!proto[READONLY_KEY]) {
            proto[READONLY_KEY] = {};
        }
        
        proto[READONLY_KEY][propertyKey] = readonly;
    };
}
```

**Ubicación:** `src/decorations/readonly_decorator.ts` (línea ~10)

---

## 📊 Flujo de Renderizado

```
1. DetailView renderiza formulario
        ↓
2. Para cada propiedad, verifica: entity.isReadOnly(key)
        ↓
3. Si isReadOnly === true:
   a. Renderiza valor como texto plano o span
   b. Aplica DisplayFormat si existe
   c. Aplica estilo .readonly-value
   d. NO renderiza input
        ↓
4. Si isReadOnly === false:
   a. Renderiza input editable
   b. Verifica isDisabled() para disabled condicional
   c. Permite edición
```

---

## 🎓 Mejores Prácticas

### 1. Marcar Campos de Sistema

```typescript
// Siempre marcar como readonly:
// - IDs autogenerados
// - Timestamps (createdAt, updatedAt)
// - Campos del sistema (createdBy, updatedBy)
// - Campos calculados

@PropertyName('ID', Number)
@ReadOnly(true)
id!: number;

@PropertyName('Created At', Date)
@ReadOnly(true)
createdAt!: Date;
```

### 2. Documentar Por Qué Es ReadOnly

```typescript
/**
 * Total amount of the order
 * @readonly Calculated from items, cannot be edited directly
 */
@PropertyName('Total', Number)
@ReadOnly(true)
total!: number;
```

### 3. Usar HelpText para Explicar

```typescript
@PropertyName('External ID', String)
@ReadOnly(true)
@HelpText('Synced from external system every hour')
externalId!: string;
```

---

## 📚 Referencias Adicionales

- `disabled-decorator.md` - Disabled condicional
- `property-name-decorator.md` - Definir propiedades
- `display-format-decorator.md` - Formateo de valores
- `../04-components/form-inputs.md` - Componentes de formulario
- `../../02-FLOW-ARCHITECTURE.md` - Flujo de renderizado

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/readonly_decorator.ts`
