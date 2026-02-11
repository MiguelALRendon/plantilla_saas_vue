# 🎨 DefaultProperty Decorator

**Referencias:**
- `required-decorator.md` - Required valida presencia, DefaultProperty asigna valor inicial
- `validation-decorator.md` - DefaultProperty se ejecuta antes de validaciones
- `primary-property-decorator.md` - DefaultProperty útil para auto-generated IDs
- `../../02-base-entity/base-entity-core.md` - getDefaultValue() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/default_property_decorator.ts`

---

## 🎯 Propósito

El decorador `@DefaultProperty()` asigna un **valor por defecto** a una propiedad cuando se crea una nueva instancia de entidad. Útil para campos con valores iniciales predeterminados.

**Beneficios:**
- Valores iniciales automáticos
- Reduce código boilerplate en constructores
- Valores calculados dinámicamente
- Mejora UX con defaults sensatos

---

## 📝 Sintaxis

```typescript
@DefaultProperty(defaultValue: any | (() => any))
propertyName: Type;
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `defaultValue` | `any \| (() => any)` | Sí | Valor por defecto o función que lo genera |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/default_property_decorator.ts

/**
 * Symbol para almacenar metadata de default property
 */
export const DEFAULT_PROPERTY_METADATA = Symbol('defaultProperty');

/**
 * @DefaultProperty() - Asigna valor por defecto a una propiedad
 * 
 * @param defaultValue - Valor por defecto o función generadora
 * @returns PropertyDecorator
 */
export function DefaultProperty(defaultValue: any | (() => any)): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[DEFAULT_PROPERTY_METADATA]) {
            target[DEFAULT_PROPERTY_METADATA] = {};
        }
        
        // Guardar valor o función
        target[DEFAULT_PROPERTY_METADATA][propertyKey] = defaultValue;
    };
}
```

**Ubicación:** `src/decorations/default_property_decorator.ts` (línea ~1-30)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[DEFAULT_PROPERTY_METADATA] = {
    'status': 'active',
    'stock': 0,
    'createdAt': () => new Date(),  // Función
    'id': () => Math.random().toString(36).substr(2, 9)  // Función
};
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el valor por defecto de una propiedad
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns Valor por defecto o undefined
 */
public getDefaultValue(propertyKey: string): any {
    const constructor = this.constructor as typeof BaseEntity;
    const defaultMetadata = constructor.prototype[DEFAULT_PROPERTY_METADATA];
    
    if (!defaultMetadata || !defaultMetadata[propertyKey]) {
        return undefined;
    }
    
    const defaultValue = defaultMetadata[propertyKey];
    
    // Si es función, ejecutarla
    if (typeof defaultValue === 'function') {
        return defaultValue.call(this);
    }
    
    return defaultValue;
}

/**
 * Obtiene el valor por defecto (método estático)
 */
public static getDefaultValue(propertyKey: string): any {
    const defaultMetadata = this.prototype[DEFAULT_PROPERTY_METADATA];
    
    if (!defaultMetadata || !defaultMetadata[propertyKey]) {
        return undefined;
    }
    
    const defaultValue = defaultMetadata[propertyKey];
    
    if (typeof defaultValue === 'function') {
        return defaultValue();
    }
    
    return defaultValue;
}

/**
 * Aplica valores por defecto a todas las propiedades
 */
public applyDefaults(): void {
    const constructor = this.constructor as typeof BaseEntity;
    const properties = constructor.getProperties();
    
    properties.forEach(prop => {
        // Solo aplicar si la propiedad está vacía
        if (this[prop] === undefined || this[prop] === null) {
            const defaultValue = this.getDefaultValue(prop);
            if (defaultValue !== undefined) {
                this[prop] = defaultValue;
            }
        }
    });
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1630-1710)

---

## 🔄 Integración con Constructor

### BaseEntity Constructor

```typescript
// src/entities/base_entitiy.ts

/**
 * Constructor de BaseEntity
 */
constructor(data?: Partial<T>) {
    // 1. Aplicar valores por defecto
    this.applyDefaults();
    
    // 2. Sobrescribir con data si existe
    if (data) {
        Object.assign(this, data);
    }
    
    // 3. Inicializar errors
    this.errors = {};
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~50-65)

---

## 🧪 Ejemplos de Uso

### 1. Static Default Values

```typescript
import { DefaultProperty } from '@/decorations/default_property_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import { Required } from '@/decorations/required_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    @Required()
    name!: string;
    
    @PropertyName('Status', String)
    @DefaultProperty('active')  // ← Valor estático
    status!: string;
    
    @PropertyName('Stock', Number)
    @DefaultProperty(0)  // ← Valor numérico
    stock!: number;
    
    @PropertyName('Is Featured', Boolean)
    @DefaultProperty(false)  // ← Valor booleano
    isFeatured!: boolean;
}

// Uso:
const product = new Product();
console.log(product.status);      // 'active'
console.log(product.stock);       // 0
console.log(product.isFeatured);  // false

// Sobrescribir default:
const product2 = new Product({ status: 'inactive', stock: 10 });
console.log(product2.status);  // 'inactive' (sobrescrito)
console.log(product2.stock);   // 10 (sobrescrito)
```

---

### 2. Function-Based Defaults (Dynamic)

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Order Number', String)
    @DefaultProperty(() => {
        // Generar número de orden único
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    })
    orderNumber!: string;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())  // ← Función que genera Date actual
    createdAt!: Date;
    
    @PropertyName('Status', String)
    @DefaultProperty(() => 'pending')  // ← Función que retorna string
    status!: string;
}

// Uso:
const order1 = new Order();
console.log(order1.orderNumber);  // 'ORD-1234567890123-456'
console.log(order1.createdAt);    // 2025-02-10T10:30:00.000Z

const order2 = new Order();
console.log(order2.orderNumber);  // 'ORD-1234567890456-789' (diferente)
console.log(order2.createdAt);    // 2025-02-10T10:30:05.000Z (diferente)
```

---

### 3. UUID Generation

```typescript
import { v4 as uuidv4 } from 'uuid';

export class User extends BaseEntity {
    @PropertyName('User ID', String)
    @Primary()
    @DefaultProperty(() => uuidv4())  // ← Generar UUID automático
    id!: string;
    
    @PropertyName('Username', String)
    @Required()
    username!: string;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())
    createdAt!: Date;
}

// Uso:
const user = new User({ username: 'john_doe' });
console.log(user.id);  // '550e8400-e29b-41d4-a716-446655440000'
```

---

### 4. Computed Defaults (Context-Aware)

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice Number', String)
    @DefaultProperty(function(this: Invoice) {
        // Acceso a 'this' para valores contextuales
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000);
        return `INV-${year}${month}-${random}`;
    })
    invoiceNumber!: string;
    
    @PropertyName('Due Date', Date)
    @DefaultProperty(function() {
        // Due date: 30 días desde hoy
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        return dueDate;
    })
    dueDate!: Date;
    
    @PropertyName('Status', String)
    @DefaultProperty('draft')
    status!: string;
}

// Uso:
const invoice = new Invoice();
console.log(invoice.invoiceNumber);  // 'INV-202502-4567'
console.log(invoice.dueDate);        // 2025-03-12T10:30:00.000Z (30 días después)
```

---

### 5. Array/Object Defaults

```typescript
export class ShoppingCart extends BaseEntity {
    @PropertyName('Cart ID', String)
    id!: string;
    
    @PropertyName('Items', Array)
    @DefaultProperty(() => [])  // ← Array vacío (función para evitar compartir referencia)
    items!: any[];
    
    @PropertyName('Metadata', Object)
    @DefaultProperty(() => ({}))  // ← Objeto vacío (función)
    metadata!: Record<string, any>;
    
    @PropertyName('Tax Rate', Number)
    @DefaultProperty(0.08)  // ← 8% tax
    taxRate!: number;
}

// ⚠️ IMPORTANTE: Usar función para arrays/objects
// Evita compartir referencia entre instancias

// ❌ MALO:
@DefaultProperty([])  // ← Todas las instancias comparten el mismo array
items!: any[];

// ✅ BUENO:
@DefaultProperty(() => [])  // ← Cada instancia tiene su propio array
items!: any[];
```

---

### 6. Enum Defaults

```typescript
enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Status', String)
    @DefaultProperty(OrderStatus.PENDING)  // ← Enum default
    status!: OrderStatus;
    
    @PropertyName('Priority', String)
    @DefaultProperty('normal')  // ← 'low' | 'normal' | 'high'
    priority!: 'low' | 'normal' | 'high';
}
```

---

### 7. Conditional Defaults

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Type', String)
    @Required()
    type!: 'physical' | 'digital';
    
    @PropertyName('Stock', Number)
    @DefaultProperty(function(this: Product) {
        // Default stock basado en tipo
        return this.type === 'digital' ? 9999 : 0;
    })
    stock!: number;
    
    @PropertyName('Shipping Required', Boolean)
    @DefaultProperty(function(this: Product) {
        return this.type === 'physical';
    })
    shippingRequired!: boolean;
}

// Uso:
const physicalProduct = new Product({ type: 'physical' });
console.log(physicalProduct.stock);            // 0
console.log(physicalProduct.shippingRequired); // true

const digitalProduct = new Product({ type: 'digital' });
console.log(digitalProduct.stock);             // 9999
console.log(digitalProduct.shippingRequired);  // false
```

---

### 8. Nested Object Defaults

```typescript
interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export class Customer extends BaseEntity {
    @PropertyName('Customer ID', Number)
    id!: number;
    
    @PropertyName('Full Name', String)
    @Required()
    fullName!: string;
    
    @PropertyName('Billing Address', Object)
    @DefaultProperty((): Address => ({
        street: '',
        city: '',
        state: '',
        zipCode: ''
    }))
    billingAddress!: Address;
    
    @PropertyName('Preferences', Object)
    @DefaultProperty(() => ({
        newsletter: true,
        notifications: true,
        theme: 'light'
    }))
    preferences!: {
        newsletter: boolean;
        notifications: boolean;
        theme: string;
    };
}
```

---

### 9. Timestamp Defaults

```typescript
export class AuditLog extends BaseEntity {
    @PropertyName('Log ID', Number)
    id!: number;
    
    @PropertyName('Action', String)
    @Required()
    action!: string;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @DefaultProperty(() => new Date())
    updatedAt!: Date;
    
    @PropertyName('Created By', String)
    @DefaultProperty(() => {
        // Obtener usuario actual de la aplicación
        return Application.currentUser?.username || 'system';
    })
    createdBy!: string;
}
```

---

### 10. Override Defaults in Constructor

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Status', String)
    @DefaultProperty('draft')
    status!: string;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())
    createdAt!: Date;
}

// Caso 1: Usar defaults
const product1 = new Product();
console.log(product1.status);     // 'draft' (default)
console.log(product1.createdAt);  // Date actual (default)

// Caso 2: Sobrescribir algunos defaults
const product2 = new Product({ 
    name: 'Laptop',
    status: 'active'  // ← Sobrescribe default
});
console.log(product2.status);     // 'active' (sobrescrito)
console.log(product2.createdAt);  // Date actual (default se mantiene)

// Caso 3: Sobrescribir todos
const product3 = new Product({
    name: 'Mouse',
    status: 'inactive',
    createdAt: new Date('2020-01-01')  // ← Sobrescribe default
});
console.log(product3.status);     // 'inactive'
console.log(product3.createdAt);  // 2020-01-01
```

---

## ⚠️ Consideraciones Importantes

### 1. Arrays y Objects: Usar Funciones

```typescript
// ❌ MALO: Referencia compartida
@DefaultProperty([])  
items!: any[];

// Problema:
const cart1 = new Cart();
const cart2 = new Cart();
cart1.items.push('item1');
console.log(cart2.items);  // ['item1'] ← ¡Compartido!

// ✅ BUENO: Nueva instancia para cada entidad
@DefaultProperty(() => [])
items!: any[];

const cart1 = new Cart();
const cart2 = new Cart();
cart1.items.push('item1');
console.log(cart2.items);  // [] ← Independiente
```

### 2. Defaults vs Required

```typescript
// DefaultProperty NO satisface Required
@PropertyName('Status', String)
@Required()
@DefaultProperty('active')
status!: string;

// Usuario puede borrar el valor después:
const product = new Product();
product.status = '';  // ← Vacío
await product.save();  // ❌ Error: Required validation fails

// DefaultProperty solo asigna valor inicial
```

### 3. Execution Order

```typescript
// 1. Constructor ejecuta applyDefaults()
// 2. DefaultProperty asigna valores
// 3. Object.assign(this, data) sobrescribe
// 4. Validaciones se ejecutan en save()

const product = new Product({ status: 'custom' });
// Orden:
// 1. applyDefaults() → status = 'active'
// 2. Object.assign() → status = 'custom' (sobrescrito)
```

### 4. Context in Functions

```typescript
// Arrow functions NO tienen 'this'
@DefaultProperty(() => {
    // this is undefined aquí
    return 'value';
})

// Regular functions SÍ tienen 'this'
@DefaultProperty(function(this: Product) {
    // Acceso a this.otherProperty
    return this.type === 'digital' ? 9999 : 0;
})
```

### 5. Performance Considerations

```typescript
// ⚠️ Funciones costosas se ejecutan en CADA instancia nueva
@DefaultProperty(() => {
    // Operación costosa
    return expensiveComputation();
})
value!: string;

// Solo se ejecuta cuando se crea la instancia
// No ejecuta en getElementList() si Backend devuelve valor
```

---

## 📚 Referencias Adicionales

- `required-decorator.md` - Required vs DefaultProperty
- `validation-decorator.md` - Validaciones con defaults
- `primary-property-decorator.md` - Auto-generated IDs con defaults
- `../../02-base-entity/base-entity-core.md` - getDefaultValue(), applyDefaults()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/default_property_decorator.ts`  
**Líneas:** ~30
