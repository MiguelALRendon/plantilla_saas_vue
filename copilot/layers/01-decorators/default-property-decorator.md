# DefaultProperty Decorator

## 1. Propósito

El decorator DefaultProperty asigna valor inicial automático a una propiedad cuando se crea nueva instancia de BaseEntity. El valor se aplica en constructor mediante applyDefaults() ANTES de Object.assign(data), permitiendo sobrescritura explícita por caller. Soporta valores estáticos (strings, numbers, booleans) y dinámicos (functions ejecutadas en cada instantiation). Los valores default mejoran developer experience reduciendo boilerplate en constructores, garantizan valores sensatos para campos opcionales (status='active', stock=0, isActive=true), previenen undefined/null en propiedades críticas, y soportan computed defaults contextuales mediante function access a this. Critical para auto-generated IDs (UUID, timestamps), valores de inicialización de estado (status enums, empty arrays), defaults de configuración (theme=light, language=es), y reducción de lógica condicional en código cliente. DefaultProperty NO satisface validación @Required (usuario puede clear valor post-instantiation), pero complementa Required proporcionando valor inicial válido.

## 2. Alcance

**Responsabilidades cubiertas:**
- Definir valor default para propiedad específica en clase entity
- Almacenar default value como Symbol metadata en prototype de clase decorada
- Soportar valores estáticos (primitives: string, number, boolean, null) y valores dinámicos (functions que retornan computed value)
- Aplicar defaults automáticamente en constructor BaseEntity mediante applyDefaults() invocado ANTES de Object.assign
- Solo aplicar default si propiedad es undefined o null en momento de construction (no sobrescribir valores existentes)
- Proveer getDefaultValue(propertyKey) accessor estático e instancia que retorna default value o undefined
- Ejecutar function defaults en cada instantiation con context de instancia (this binding) permitiendo computed values
- Permitir override de defaults mediante data parameter en constructor: new Product({status:'custom'}) sobrescribe default 'active'
- Soportar defaults complejos: arrays vacíos (() => []), objects vacíos (() => ({})), timestamps (() => new Date()), UUIDs (() => uuidv4())

**Límites del alcance:**
- Decorator NO valida el tipo del valor default (developer responsable de asegurar type compatibility con propiedad)
- NO verifica que default satisfaga @Required validation (Required valida EN save, DefaultProperty asigna EN construction)
- NO previene que usuario modifique/elimine valor post-construction (product.status=null es permitido después de constructor)
- Function defaults NO reciben parámetros (context solo mediante this binding)
- NO aplica defaults a propiedades ya asignadas en data constructor parameter (explicit values siempre ganan)
- NO re-aplica defaults después de construction (applyDefaults() llamado solo UNA vez en constructor)
- NO soporta defaults condicionales basados en otras propiedades SIN usar function (static values evaluados en decoration time)
- Arrays/objects literales NO son wrapped automáticamente en function (developer debe usar () => [] para evitar shared references)
- NO garantiza que function default retorne value del tipo correcto (responsabilidad de developer)

## 3. Definiciones Clave

**DEFAULT_PROPERTY_METADATA Symbol:** Identificador único usado como property key en prototype para almacenar object map de defaults. Evita colisiones con propiedades normales. Definido como `export const DEFAULT_PROPERTY_METADATA = Symbol('defaultProperty')`. Estructura: `{ [propertyKey: string]: any | (() => any) }`.

**Default Value Type:** Type union `any | (() => any)`. Puede ser valor primitivo directo (string, number, boolean, null) o function que retorna valor. Function ejecutada en cada new constructor invocation para computed/dynamic defaults.

**Decorator Signature:** `function DefaultProperty(defaultValue: any | (() => any)): PropertyDecorator`. Recibe valor o function, retorna decorator que almacena metadata en prototype.

**Static Default:** Valor literal almacenado en metadata que es asignado directamente a propiedad. Ejemplo: `@DefaultProperty('active')` asigna string 'active' a cada nueva instancia. PELIGRO: Si valor es array/object literal, todas las instancias comparten MISMA referencia.

**Dynamic Default:** Function almacenada en metadata que se ejecuta EN cada constructor invocation retornando computed value. Ejemplo: `@DefaultProperty(() => new Date())` ejecuta function en cada new Product(), generando timestamp único para cada instancia.

**applyDefaults() Method:** Método de instancia en BaseEntity invocado en constructor que itera todas las properties obtenidas de getProperties(), verificando si cada property es undefined/null, y si lo es, obteniendo default value mediante getDefaultValue(prop) y asignando a this[prop]. Ejecutado ANTES de Object.assign(this, data) para permitir override.

**getDefaultValue(propertyKey) Accessor:** Método estático e instancia en BaseEntity que retorna default value para propiedad específica. Si metadata contiene function, la ejecuta (con this binding en version de instancia, sin context en estática). Si no hay default metadata, retorna undefined.

**Function Context (this binding):** En defaults de tipo function, this refiere a instancia de entity siendo construida, permitiendo access a otras propiedades para computed defaults contextuales. Ejemplo: `@DefaultProperty(function(this: Product) { return this.type === 'digital' ? 9999 : 0; })`.

**Shared Reference Problem:** Problema cuando developer usa array/object literal como default (`@DefaultProperty([])`) en lugar de function (`@DefaultProperty(() => [])`). Todas las instancias comparten MISMA referencia de array/object, causando mutations inesperadas cross-instance. SIEMPRE usar function para arrays/objects.

**Override Behavior:** Cuando constructor recibe data parameter con valor para property que tiene default, Object.assign(this, data) sobrescribe valor default aplicado por applyDefaults(). Explicit values en constructor tienen PRECEDENCIA sobre defaults.

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
// src/decorations/default_property_decorator.ts
export const DEFAULT_PROPERTY_KEY = Symbol('default_property');

export function DefaultProperty(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[DEFAULT_PROPERTY_KEY] = propertyName;
    };
}
```

**IMPORTANTE:** Este decorador NO establece valores por defecto para propiedades. Su función real es marcar cuál propiedad se debe usar como representación textual por defecto de la entidad (similar a `__str__` en Python).

**Ejemplo de uso correcto:**
```typescript
@DefaultProperty('name')  // 'name' será la propiedad usada para mostrar la entidad
@ModuleName('Products')
export class Product extends BaseEntity {
    id!: number;
    name!: string;
    description!: string;
}

// Cuando se necesite representar un Product como texto, se usará product.name
```

### Accessor en BaseEntity

```typescript
// src/entities/base_entitiy.ts - Línea 1630
public getDefaultValue(propertyKey: string): any {
    const constructor = this.constructor as typeof BaseEntity;
    const defaultMetadata = constructor.prototype[DEFAULT_PROPERTY_METADATA];
    
    if (!defaultMetadata || !defaultMetadata[propertyKey]) {
        return undefined;
    }
    
    const defaultValue = defaultMetadata[propertyKey];
    
    // Si es función, ejecutarla con context de instancia
    if (typeof defaultValue === 'function') {
        return defaultValue.call(this);  // ← this binding
    }
    
    return defaultValue;
}

// Método estático (sin context)
public static getDefaultValue(propertyKey: string): any {
    const defaultMetadata = this.prototype[DEFAULT_PROPERTY_METADATA];
    
    if (!defaultMetadata || !defaultMetadata[propertyKey]) {
        return undefined;
    }
    
    const defaultValue = defaultMetadata[propertyKey];
    
    if (typeof defaultValue === 'function') {
        return defaultValue();  // ← Sin this binding
    }
    
    return defaultValue;
}
```

### applyDefaults Method

```typescript
// src/entities/base_entitiy.ts - Línea 1680
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

### Integración en Constructor

```typescript
// src/entities/base_entitiy.ts - Línea 50
constructor(data?: Partial<T>) {
    // 1. Aplicar valores por defecto PRIMERO
    this.applyDefaults();
    
    // 2. Sobrescribir con data si existe
    if (data) {
        Object.assign(this, data);
    }
    
    // 3. Inicializar errors
    this.errors = {};
}
```

### Ejemplo Completo - Static Defaults

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { PropertyName, Required, DefaultProperty } from '@/decorations';

export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id?: number;
    
    @PropertyName('Product Name', String)
    @Required()
    name!: string;
    
    @PropertyName('Status', String)
    @DefaultProperty('active')  // ← Static default
    status!: string;
    
    @PropertyName('Stock', Number)
    @DefaultProperty(0)  // ← Numeric default
    stock!: number;
    
    @PropertyName('Is Featured', Boolean)
    @DefaultProperty(false)  // ← Boolean default
    isFeatured!: boolean;
}

// Uso:
const product = new Product();
console.log(product.status);      // 'active'
console.log(product.stock);       // 0
console.log(product.isFeatured);  // false

// Override defaults:
const product2 = new Product({ status: 'inactive', stock: 10 });
console.log(product2.status);  // 'inactive' (sobrescrito)
console.log(product2.stock);   // 10 (sobrescrito)
```

### Ejemplo Completo - Dynamic Defaults (Functions)

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order Number', String)
    @DefaultProperty(() => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    })
    orderNumber!: string;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())  // ← Nueva fecha en cada instancia
    createdAt!: Date;
}

// Cada instancia obtiene valores únicos:
const order1 = new Order();
console.log(order1.orderNumber);  // 'ORD-1234567890123-456'
console.log(order1.createdAt);    // 2025-02-10T10:30:00.000Z

const order2 = new Order();
console.log(order2.orderNumber);  // 'ORD-1234567890456-789' (diferente)
console.log(order2.createdAt);    // 2025-02-10T10:30:05.000Z (diferente)
```

## 5. Flujo de Funcionamiento


### Flujo de Aplicación del Decorator

```
Developer define propiedad con @DefaultProperty
@DefaultProperty('active')
status!: string
        ↓
Decorator function ejecuta en tiempo de clase
        ↓
Verificar si metadata object existe
if (!target[DEFAULT_PROPERTY_METADATA])
        ↓
Crear metadata object si no existe
target[DEFAULT_PROPERTY_METADATA] = {}
        ↓
Almacenar default value en metadata map
target[DEFAULT_PROPERTY_METADATA]['status'] = 'active'
        ↓
Metadata permanece en prototype
Todas las instancias acceden mismo default
```

### Flujo de Constructor (Application de Defaults)

```
Usuario crea nueva instancia
const product = new Product({ name: 'Widget' })
        ↓
Constructor BaseEntity ejecuta
constructor(data?: Partial<T>)
        ↓
PASO 1: Aplicar defaults
this.applyDefaults()
        ↓
applyDefaults() obtiene properties
const properties = this.constructor.getProperties()
properties = ['id', 'name', 'status', 'stock']
        ↓
Iterar cada propiedad
properties.forEach(prop => {...})
        ↓
Para cada prop, verificar si está vacía
if (this[prop] === undefined || this[prop] === null)
        ↓
Propiedad 'id': this.id === undefined
        ↓ (true - está vacía)
Obtener default value
defaultValue = this.getDefaultValue('id')
        ↓
getDefaultValue() busca en metadata
const defaultMetadata = constructor.prototype[DEFAULT_PROPERTY_METADATA]
defaultValue = defaultMetadata['id']  // undefined (sin default)
        ↓
No hay default, siguiente property
        ↓
Propiedad 'name': this.name === undefined
        ↓ (true - está vacía)
defaultValue = this.getDefaultValue('name')  // undefined (sin default)
        ↓
Propiedad 'status': this.status === undefined
        ↓ (true - está vacía)
defaultValue = this.getDefaultValue('status')
defaultValue = 'active'  ← Default encontrado
        ↓
Asignar default a propiedad
this.status = 'active'
        ↓
Propiedad 'stock': this.stock === undefined
        ↓ (true - está vacía)
defaultValue = this.getDefaultValue('stock')
defaultValue = 0
        ↓
Asignar default
this.stock = 0
        ↓
PASO 2: Sobrescribir con data
if (data) Object.assign(this, data)
        ↓
data = { name: 'Widget' }
Object.assign(this, data)
        ↓
this.name = 'Widget'  ← Sobrescribe undefined
this.status = 'active'  ← Mantiene default (no en data)
this.stock = 0  ← Mantiene default (no en data)
        ↓
PASO 3: Inicializar errors
this.errors = {}
        ↓
Instance completa
product.name = 'Widget'
product.status = 'active' (de default)
product.stock = 0 (de default)
```

### Flujo de Function Default (Dynamic)

```
Developer define propiedad con function default
@DefaultProperty(() => new Date())
createdAt!: Date
        ↓
Decorator almacena FUNCTION en metadata
target[DEFAULT_PROPERTY_METADATA]['createdAt'] = () => new Date()
        ↓
Usuario crea nueva instancia
const order = new Order()
        ↓
Constructor ejecuta applyDefaults()
        ↓
applyDefaults() verifica propiedad 'createdAt'
this.createdAt === undefined
        ↓ (true - está vacía)
Obtener default value
defaultValue = this.getDefaultValue('createdAt')
        ↓
getDefaultValue() detecta que es function
if (typeof defaultValue === 'function')
        ↓ (true)
Ejecutar function con this binding
return defaultValue.call(this)
        ↓
Function ejecuta: new Date()
        ↓
Retorna Date object con timestamp actual
return Date {2025-02-10T10:30:00.000Z}
        ↓
Asignar resultado a propiedad
this.createdAt = Date {2025-02-10T10:30:00.000Z}
        ↓
Siguiente instancia ejecuta NUEVA función
const order2 = new Order()
        ↓
Function ejecuta NUEVAMENTE
() => new Date()
        ↓
Retorna NUEVA fecha (diferente timestamp)
return Date {2025-02-10T10:30:05.000Z}
        ↓
Cada instancia tiene valor único
order.createdAt !== order2.createdAt
```

### Flujo de Override (Explicit Value en Constructor)

```
Usuario crea instancia con valor explícito
const product = new Product({ status: 'inactive', name: 'Widget' })
        ↓
Constructor ejecuta applyDefaults()
        ↓
applyDefaults() verifica 'status'
this.status === undefined
        ↓ (true - todavía no asignado)
Asignar default
this.status = 'active'
        ↓
Object.assign(this, data)
data = { status: 'inactive', name: 'Widget' }
        ↓
Sobrescribir con valores de data
this.status = 'inactive'  ← Sobrescribe 'active'
this.name = 'Widget'
        ↓
Valor explícito gana sobre default
product.status = 'inactive' (NO 'active')
```

### Flujo de Function Context (this binding)

```
Developer define computed default
@DefaultProperty(function(this: Product) {
    return this.type === 'digital' ? 9999 : 0;
})
stock!: number
        ↓
Usuario crea instancia con type
const product = new Product({ type: 'digital' })
        ↓
Constructor ejecuta applyDefaults()
        ↓
PERO property 'stock' verificada DESPUÉS de type assigned?
NO - applyDefaults() ejecuta ANTES de Object.assign
        ↓
PROBLEMA: this.type es undefined cuando function ejecuta
        ↓
SOLUCIÓN: Evaluar después de Object.assign manualmente
O usar lifecycle hook afterConstruct si existe
O asegurar orden de evaluación de properties
```

## 6. Reglas Obligatorias

**Regla 1:** SIEMPRE usar function para array/object defaults. `@DefaultProperty(() => [])` NO `@DefaultProperty([])`. Arrays/objects literales causan shared reference cross-instances.

**Regla 2:** Default values DEBEN ser del mismo tipo que propiedad decorada. `@PropertyName('Count', Number) @DefaultProperty('zero')` causa type error.

**Regla 3:** Function defaults NO reciben parámetros. Usar this binding para access a instance properties: `function(this: Entity) { return this.otherProp; }`.

**Regla 4:** applyDefaults() solo asigna a properties undefined o null. Si property ya tiene valor, default NO se aplica (incluye valores falsy como 0, false, '').

**Regla 5:** Explicit values en constructor parameter sobrescriben defaults. `new Product({status:'custom'})` ignora default 'active'.

**Regla 6:** Defaults NO satisfacen @Required validation. Usuario puede clear valor post-construction: `product.status = null` es válido hasta save().

**Regla 7:** Function defaults ejecutan EN CADA instantiation. Evitar operaciones costosas en defaults (DB queries, heavy computation).

**Regla 8:** Arrow functions en defaults NO tienen this binding. Usar regular function: `function(this: Entity) {...}` NO `() => {...}` si this es necesario.

**Regla 9:** getDefaultValue() retorna undefined si NO hay default metadata. Verificar `if (defaultValue !== undefined)` antes de usar.

**Regla 10:** Defaults aplicados en constructor antes de lifecycle hooks. Si hook modifica property, sobreescribe default.

## 7. Prohibiciones

**Prohibido:** Usar array/object literal como default sin function wrapper. `@DefaultProperty([])` causa shared references, SIEMPRE `@DefaultProperty(() => [])`.

**Prohibido:** Asumir que default satisface @Required. DefaultProperty asigna valor inicial, Required valida en save(). Usuario puede clear valor después.

**Prohibido:** Usar arrow functions si necesitas this context. `@DefaultProperty(() => this.id)` devuelve undefined, usar `function(this: Entity) { return this.id; }`.

**Prohibido:** Ejecutar operaciones costosas en function defaults. Function ejecuta EN CADA new constructor, NO cachear resultado.

**Prohibido:** Depender de orden de evaluación de properties en computed defaults. applyDefaults() itera properties en orden arbitrario, this.otherProp puede ser undefined.

**Prohibido:** Modificar metadata en runtime. `target[DEFAULT_PROPERTY_METADATA]['prop'] = newValue` después de decoration time causa inconsistencias.

**Prohibido:** Retornar undefined de function default intencionalmente. getDefaultValue() interpreta undefined como "sin default", NO como "default es undefined".

**Prohibido:** Usar valores mutables compartidos. `const shared = []; @DefaultProperty(shared)` causa mismo problema que literal.

**Prohibido:** Asumir que default se re-aplica después de clear valor. applyDefaults() ejecuta solo en constructor, NO en save() ni después de modificaciones.

**Prohibido:** Usar defaults como validation. DefaultProperty es inicialización, Validation es verificación. Separar concerns claramente.

## 8. Dependencias

**Decoradores Relacionados:**
- @PropertyName: Define tipo de propiedad, default debe coincidir con tipo
- @Required: Valida presencia en save(), complementario a DefaultProperty que asigna valor inicial
- @PrimaryProperty: Puede usar DefaultProperty para auto-generated IDs (UUID, autoincrement simulado)
- @Validation: Ejecuta DESPUÉS de defaults aplicados, valida valor default si existe

**BaseEntity Methods:**
- constructor(): Invoca applyDefaults() como primer paso
- applyDefaults(): Método que itera properties y asigna defaults
- getDefaultValue(): Accessor que obtiene default value para propiedad específica
- getProperties(): Retorna array de property keys para iterar en applyDefaults()

**BaseEntity Prototype:**
- DEFAULT_PROPERTY_METADATA: Symbol key donde metadata map es almacenada
- Prototype chain: Subclases heredan defaults de parent classes (si parent también usa decorator)

**Constructor Data Parameter:**
- Object.assign(this, data): Sobrescribe defaults con valores explícitos del caller
- Precedencia: Explicit values > Default values > undefined

**Type System:**
- PropertyName type parameter: Default value debe ser compatible con tipo declarado
- TypeScript validation: Type mismatch causa compile-time error si strict mode

## 9. Relaciones

**Relación con @Required (Complementaria):**
DefaultProperty proporciona valor inicial válido que puede satisfacer Required en momento de construction, pero NO previene clear posterior. Required valida EN save(), DefaultProperty asigna EN construction.

**Relación con @PropertyName (1:1):**
Cada @DefaultProperty debe estar en propiedad decorada con @PropertyName. Type declarado en PropertyName debe coincidir con tipo de default value.

**Relación con constructor (N:1):**
Múltiples properties con defaults, todos aplicados en único constructor invocation mediante single applyDefaults() call.

**Relación con applyDefaults() (1:N):**
Un applyDefaults() call aplica defaults de múltiples properties iterando sobre getProperties() result.

**Relación con Object.assign (Secuencial):**
applyDefaults() ejecuta PRIMERO, Object.assign SEGUNDO. Defaults asignados por applyDefaults() pueden ser sobrescritos por Object.assign(data).

**Relación con @PrimaryProperty (Opcional):**
PrimaryProperty puede usar DefaultProperty para auto-generated IDs: `@PrimaryProperty() @DefaultProperty(() => uuidv4()) id!: string`.

**Relación con Validation decorators (Temporal):**
Defaults aplicados ANTES de constructor complete, validaciones ejecutan DESPUÉS en save(). Valor default puede ser validado o fallar validation si no cumple reglas.

**Relación con getProperties() (Dependency):**
applyDefaults() depende de getProperties() para obtener lista de properties a verificar. Si property NO está en getProperties(), default NO se aplica.

## 10. Notas de Implementación

### Ejemplo 1: UUID Auto-Generation

```typescript
import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from '@/entities/base_entitiy';
import { PropertyName, PrimaryProperty, DefaultProperty } from '@/decorations';

export class User extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('User ID', String)
    @DefaultProperty(() => uuidv4())  // ← UUID único por instancia
    id!: string;
    
    @PropertyName('Username', String)
    @Required()
    username!: string;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())
    createdAt!: Date;
}

// Uso:
const user1 = new User({ username: 'john_doe' });
console.log(user1.id);  // '550e8400-e29b-41d4-a716-446655440000'

const user2 = new User({ username: 'jane_doe' });
console.log(user2.id);  // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' (diferente)

await user1.save();  // POST /api/users con ID pre-generado
```

### Ejemplo 2: Enum Defaults

```typescript
enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

enum Priority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high'
}

export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id?: number;
    
    @PropertyName('Status', String)
    @DefaultProperty(OrderStatus.PENDING)  // ← Enum default
    status!: OrderStatus;
    
    @PropertyName('Priority', String)
    @DefaultProperty(Priority.NORMAL)  // ← Enum default
    priority!: Priority;
}

// Uso:
const order = new Order();
console.log(order.status);    // 'pending'
console.log(order.priority);  // 'normal'

// Override:
const urgentOrder = new Order({ priority: Priority.HIGH });
console.log(urgentOrder.priority);  // 'high'
```

### Ejemplo 3: Computed Defaults (Context-Aware)

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice Number', String)
    @DefaultProperty(function(this: Invoice) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000);
        return `INV-${year}${month}-${random}`;
    })
    invoiceNumber!: string;
    
    @PropertyName('Issue Date', Date)
    @DefaultProperty(() => new Date())
    issueDate!: Date;
    
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
console.log(invoice.issueDate);      // 2025-02-10T10:30:00.000Z
console.log(invoice.dueDate);        // 2025-03-12T10:30:00.000Z (30 días después)
console.log(invoice.status);         // 'draft'
```

### Ejemplo 4: Array/Object Defaults (Correct Pattern)

```typescript
interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export class Customer extends BaseEntity {
    @PropertyName('Customer ID', Number)
    id?: number;
    
    @PropertyName('Full Name', String)
    @Required()
    fullName!: string;
    
    @PropertyName('Tags', Array)
    @DefaultProperty(() => [])  // ← Function wrapper para array    tags!: string[];
    
    @PropertyName('Billing Address', Object)
    @DefaultProperty((): Address => ({  // ← Function wrapper para object
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
    preferences!: Record<string, any>;
}

// Uso correcto:
const customer1 = new Customer({ fullName: 'John Doe' });
const customer2 = new Customer({ fullName: 'Jane Doe' });

customer1.tags.push('vip');
console.log(customer1.tags);  // ['vip']
console.log(customer2.tags);  // [] ← Independiente

customer1.billingAddress.city = 'New York';
console.log(customer2.billingAddress.city);  // '' ← Independiente
```

### Ejemplo 5: Timestamp Defaults con Usuario Actual

```typescript
import { Application } from '@/types/application';

export class AuditLog extends BaseEntity {
    @PropertyName('Log ID', Number)
    id?: number;
    
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
        // Obtener usuario actual de Application singleton
        return Application.currentUser?.username || 'system';
    })
    createdBy!: string;
}

// Uso:
const log = new AuditLog({ action: 'user.login' });
console.log(log.createdBy);  // 'john_doe' (usuario autenticado actual)
console.log(log.createdAt);  // 2025-02-10T10:30:00.000Z
```

### Ejemplo 6: Orden de Aplicación y Override

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id?: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Status', String)
    @DefaultProperty('draft')
    status!: string;
    
    @PropertyName('Stock', Number)
    @DefaultProperty(0)
    stock!: number;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())
    createdAt!: Date;
}

// CASO 1: Sin data - Todos los defaults aplicados
const product1 = new Product();
console.log(product1.status);     // 'draft' (default)
console.log(product1.stock);      // 0 (default)
console.log(product1.createdAt);  // Date actual (default)

// CASO 2: Override parcial - Algunos defaults, algunos explícitos
const product2 = new Product({ 
    name: 'Laptop',
    status: 'active'  // ← Sobrescribe default 'draft'
});
console.log(product2.status);     // 'active' (explícito gana)
console.log(product2.stock);      // 0 (default mantiene)
console.log(product2.createdAt);  // Date actual (default mantiene)

// CASO 3: Override completo - Todos explícitos
const product3 = new Product({
    name: 'Mouse',
    status: 'inactive',
    stock: 100,
    createdAt: new Date('2020-01-01')
});
console.log(product3.status);     // 'inactive' (explícito)
console.log(product3.stock);      // 100 (explícito)
console.log(product3.createdAt);  // 2020-01-01 (explícito)

// CASO 4: Clear valor después de construction
const product4 = new Product();
console.log(product4.status);  // 'draft' (default)
product4.status = '';  // ← Usuario clear valor
console.log(product4.status);  // '' (default NO se re-aplica)
```

### Consideración 1: Shared Reference Problem (CRITICAL)

```typescript
// PROBLEMA CRÍTICO: Arrays/Objects Literales

// INCORRECTO ❌
export class ShoppingCart extends BaseEntity {
    @DefaultProperty([])  // ← Literal array sin function
    items!: any[];
    
    @DefaultProperty({})  // ← Literal object sin function
    metadata!: Record<string, any>;
}

const cart1 = new ShoppingCart();
const cart2 = new ShoppingCart();

cart1.items.push('item1');
console.log(cart1.items);  // ['item1']
console.log(cart2.items);  // ['item1'] ← BUG: Compartido entre instancias!

cart1.metadata.userId = 'user-123';
console.log(cart1.metadata);  // {userId: 'user-123'}
console.log(cart2.metadata);  // {userId: 'user-123'} ← BUG: Compartido!

// CORRECTO ✅
export class ShoppingCart extends BaseEntity {
    @DefaultProperty(() => [])  // ← Function retorna nuevo array
    items!: any[];
    
    @DefaultProperty(() => ({}))  // ← Function retorna nuevo object
    metadata!: Record<string, any>;
}

const cart3 = new ShoppingCart();
const cart4 = new ShoppingCart();

cart3.items.push('item1');
console.log(cart3.items);  // ['item1']
console.log(cart4.items);  // [] ← Correcto: Independiente

cart3.metadata.userId = 'user-123';
console.log(cart3.metadata);  // {userId: 'user-123'}
console.log(cart4.metadata);  // {} ← Correcto: Independiente
```

### Consideración 2: Defaults NO Satisfacen @Required

```typescript
export class Product extends BaseEntity {
    @PropertyName('Status', String)
    @Required()  // ← Valida en save()
    @DefaultProperty('active')  // ← Asigna en constructor
    status!: string;
}

// Constructor asigna default correctamente
const product = new Product();
console.log(product.status);  // 'active' ← Default aplicado

// Usuario puede clear valor después
product.status = '';  // ← Permitido (aún no valida)

// Validación ejecuta en save()
await product.save();
// ERROR: ValidationError: 'Status' is required
// ← @Required detecta que status está vacío

// DefaultProperty solo asigna valor INICIAL
// NO previene modificación posterior
// Required valida ANTES de persistir
```

### Consideración 3: Function Context y this Binding

```typescript
export class Product extends BaseEntity {
    @PropertyName('Type', String)
    type!: 'physical' | 'digital';
    
    // INCORRECTO ❌: Arrow function NO tiene this binding
    @DefaultProperty(() => {
        // this === undefined aquí
        return this.type === 'digital' ? 9999 : 0;  // ← ERROR
    })
    stock1!: number;
    
    // CORRECTO ✅: Regular function tiene this binding
    @DefaultProperty(function(this: Product) {
        // this refiere a instancia Product
        return this.type === 'digital' ? 9999 : 0;  // ← OK
    })
    stock2!: number;
}

// Uso:
const physical = new Product({ type: 'physical' });
console.log(physical.stock1);  // NaN o error (this.type undefined)
console.log(physical.stock2);  // 0 (funcionó correctamente)

const digital = new Product({ type: 'digital' });
console.log(digital.stock2);   // 9999 (funcionó correctamente)
```

### Consideración 4: Orden de Ejecución en Constructor

```typescript
// BaseEntity constructor sequence:
constructor(data?: Partial<T>) {
    // PASO 1: Aplicar defaults
    this.applyDefaults();
    // En este punto: this.status = 'active' (default)
    
    // PASO 2: Sobrescribir con data
    if (data) {
        Object.assign(this, data);
    }
    // Si data.status existe: this.status = data.status (override)
    
    // PASO 3: Inicializar errors
    this.errors = {};
}

// Implicación: Defaults aplicados PRIMERO, data parameter gana SIEMPRE

const product1 = new Product();
// Resultado: status = 'active' (default, sin data)

const product2 = new Product({ status: 'custom' });
// Flujo interno:
// 1. applyDefaults() → this.status = 'active'
// 2. Object.assign() → this.status = 'custom' (sobrescribe)
// Resultado: status = 'custom'
```

### Pattern: Computed Defaults que Dependen de Otras Properties

```typescript
// PROBLEMA: Order indeterminístico de properties en applyDefaults()
export class Product extends BaseEntity {
    @PropertyName('Type', String)
    @DefaultProperty('physical')
    type!: 'physical' | 'digital';
    
    @PropertyName('Stock', Number)
    @DefaultProperty(function(this: Product) {
        // RIESGO: this.type puede ser undefined si 'stock' evalúa primero que 'type'
        return this.type === 'digital' ? 9999 : 0;
    })
    stock!: number;
}

// SOLUCIÓN 1: Pasar valor en constructor explícitamente
const physical = new Product({ type: 'physical', stock: 0 });

// SOLUCIÓN 2: Usar lifecycle hook afterConstruct (si existe)
// O evaluar en getter en lugar de default

// SOLUCIÓN 3: Proveer valor sensato que funcione sin context
@DefaultProperty(0)  // ← Default simple que funciona siempre
stock!: number;

// Luego calcular en método de instancia si necesario
public calculateDefaultStock(): number {
    return this.type === 'digital' ? 9999 : 0;
}
```

### Pattern: Auto-Generated Sequential IDs (Simulación)

```typescript
// Pattern para IDs secuenciales client-side (NO recomendado para producción)
let productIdCounter = 1;

export class Product extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Product ID', Number)
    @DefaultProperty(() => productIdCounter++)  // ← Incrementar global counter
    id?: number;
    
    @PropertyName('Product Name', String)
    name!: string;
}

// Uso:
const product1 = new Product({ name: 'Widget' });
console.log(product1.id);  // 1

const product2 = new Product({ name: 'Gadget' });
console.log(product2.id);  // 2

const product3 = new Product({ name: 'Tool' });
console.log(product3.id);  // 3

// ADVERTENCIA: IDs client-side pueden colisionar con IDs server-side
// Preferir UUID o dejar que backend genere IDs
```

### Pattern: Conditional Defaults Basados en Ambiente

```typescript
export class Feature extends BaseEntity {
    @PropertyName('Feature ID', String)
    id?: string;
    
    @PropertyName('Is Enabled', Boolean)
    @DefaultProperty(() => {
        // Habilitar features solo en development
        return process.env.NODE_ENV === 'development';
    })
    isEnabled!: boolean;
    
    @PropertyName('Debug Mode', Boolean)
    @DefaultProperty(() => {
        return process.env.NODE_ENV !== 'production';
    })
    debugMode!: boolean;
}

// En development:
const feature = new Feature();
console.log(feature.isEnabled);  // true
console.log(feature.debugMode);  // true

// En production:
console.log(feature.isEnabled);  // false
console.log(feature.debugMode);  // false
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- required-decorator.md: @Required valida en save(), @DefaultProperty asigna en construction - Complementarios
- validation-decorator.md: Validaciones ejecutan DESPUÉS de defaults aplicados
- primary-property-decorator.md: @PrimaryProperty puede combinar con @DefaultProperty para auto-generated IDs
- property-name-decorator.md: Tipo declarado en @PropertyName debe coincidir con tipo de default value
- persistent-decorator.md: Defaults aplicados ANTES de persistencia inicial
- ../02-base-entity/base-entity-core.md: Constructor invoca applyDefaults(), implementación de getDefaultValue()
- ../02-base-entity/validation-system.md: Validaciones ejecutan post-construction en save()
- ../../02-FLOW-ARCHITECTURE.md: Flujo Entity construction → Defaults → Data assignment → Validation

**Archivos fuente:**
- src/decorations/default_property_decorator.ts: Implementación del decorator (línea 5-30), Symbol DEFAULT_PROPERTY_METADATA
- src/entities/base_entitiy.ts: Constructor (línea 50-65), applyDefaults() método (línea 1680-1710), getDefaultValue() estático e instancia (línea 1630-1680)

**Líneas relevantes en código:**
- Línea 5 (default_property_decorator.ts): Definición de DEFAULT_PROPERTY_METADATA Symbol
- Línea 10 (default_property_decorator.ts): Función DefaultProperty que almacena metadata
- Línea 50 (base_entitiy.ts): Constructor que invoca applyDefaults() como primer paso
- Línea 1680 (base_entitiy.ts): applyDefaults() itera properties y asigna defaults
- Línea 1630 (base_entitiy.ts): getDefaultValue() accessor que maneja static values y functions

**Última actualización:** 11 de Febrero, 2026