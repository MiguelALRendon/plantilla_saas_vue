# 🔑 Primary Property Decorator

**Referencias:**
- `persistent-key-decorator.md` - PersistentKey vs Primary
- `unique-decorator.md` - Unique puede combinarse con Primary
- `required-decorator.md` - Primary properties son automáticamente required
- `../../02-base-entity/crud-operations.md` - CRUD usa primary property
- `../../tutorials/01-basic-crud.md` - Primary property en tutorial

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/primary_property_decorator.ts`

---

## 🎯 Propósito

El decorador `@Primary()` marca una propiedad como **primary key** de la entidad, identificando de forma única cada registro.

**Sin @Primary:**
- Default: Se asume que la propiedad `'id'` es la primary key

**Con @Primary:**
- La propiedad marcada es la primary key
- Se usa para determinar si una entidad es nueva o existente
- Se usa en operaciones de actualización y eliminación

---

## 📝 Sintaxis

```typescript
@Primary()
propertyName: Type;
```

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/primary_property_decorator.ts

/**
 * Symbol para almacenar metadata de primary property
 */
export const PRIMARY_PROPERTY_METADATA = Symbol('primaryProperty');

/**
 * @Primary() - Marca una propiedad como primary key
 * 
 * @returns PropertyDecorator
 */
export function Primary(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Guardar primary property en prototype
        target.constructor.prototype[PRIMARY_PROPERTY_METADATA] = propertyKey;
    };
}
```

**Ubicación:** `src/decorations/primary_property_decorator.ts` (línea ~1-20)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[PRIMARY_PROPERTY_METADATA] = 'id';      // Default o explícito
User.prototype[PRIMARY_PROPERTY_METADATA] = 'userId';     // Custom
Customer.prototype[PRIMARY_PROPERTY_METADATA] = undefined; // Usa 'id' por default
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el nombre de la primary property
 * 
 * @returns Nombre de la propiedad primary key (default: 'id')
 */
public static getPrimaryProperty(): string {
    const primaryProperty = this.prototype[PRIMARY_PROPERTY_METADATA];
    return primaryProperty || 'id';  // Default: 'id'
}

/**
 * Obtiene el valor de la primary key de una instancia
 */
public getPrimaryValue(): any {
    const constructor = this.constructor as typeof BaseEntity;
    const primaryProperty = constructor.getPrimaryProperty();
    return this[primaryProperty];
}

/**
 * Verifica si la entidad es nueva (no tiene primary key asignada)
 */
public isNew(): boolean {
    const primaryValue = this.getPrimaryValue();
    return !primaryValue || primaryValue === 0 || primaryValue === '';
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1120-1160)

---

## 🔧 Impacto en CRUD Operations

### save() con Primary

```typescript
// src/entities/base_entitiy.ts

public async save(): Promise<boolean> {
    this.beforeSave();
    
    const isValid = await this.validateInputs();
    if (!isValid) return false;
    
    const constructor = this.constructor as typeof BaseEntity;
    const endpoint = constructor.getApiEndpoint();
    const primaryProperty = constructor.getPrimaryProperty();
    const primaryValue = this[primaryProperty];
    
    // ========================================
    // CHECK: ¿Es nueva entidad?
    // ========================================
    const isNew = !primaryValue;
    
    try {
        let response;
        
        if (isNew) {
            // POST /api/products (crear)
            response = await Application.axiosInstance.post(
                endpoint,
                this.toDictionary()
            );
        } else {
            // PUT /api/products/42 (actualizar)
            response = await Application.axiosInstance.put(
                `${endpoint}/${primaryValue}`,
                this.toDictionary()
            );
        }
        
        // Actualizar primary key desde respuesta del servidor
        this[primaryProperty] = response.data[primaryProperty];
        this.updateFromDictionary(response.data);
        
        this.afterSave();
        
        Application.eventBus.emit('entity-saved', {
            entityClass: constructor,
            entity: this,
            isNew: isNew
        });
        
        return true;
    } catch (error) {
        console.error('[BaseEntity] Save failed:', error);
        return false;
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~250-330)

---

## 🧪 Ejemplos de Uso

### 1. Default: 'id' Property

```typescript
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    // No @Primary() → usa 'id' por default
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
}
```

**Comportamiento:**
```typescript
const product = new Product();
product.name = 'Laptop';

console.log(product.isNew());  // → true (id no asignado)

await product.save();
// → POST /api/products (crear)
// → Response: { id: 42, name: 'Laptop' }

console.log(product.id);        // → 42
console.log(product.isNew());   // → false

product.name = 'Gaming Laptop';
await product.save();
// → PUT /api/products/42 (actualizar)
```

---

### 2. Custom Primary Key

```typescript
import { Primary } from '@/decorations/primary_property_decorator';

@ModuleName('User', 'Users')
@ApiEndpoint('/api/users')
@Persistent()
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    @Primary()  // ← Explícitamente marca como primary
    userId!: number;
    
    @PropertyName('Username', String)
    username!: string;
    
    @PropertyName('Email', String)
    email!: string;
}
```

**Comportamiento:**
```typescript
const user = new User();
user.username = 'john_doe';
user.email = 'john@example.com';

console.log(user.isNew());  // → true (userId no asignado)

await user.save();
// → POST /api/users (crear)
// → Response: { userId: 100, username: 'john_doe', email: '...' }

console.log(user.userId);    // → 100
console.log(user.isNew());   // → false

user.email = 'john.doe@example.com';
await user.save();
// → PUT /api/users/100 (actualizar)
```

---

### 3. String Primary Key

```typescript
@ModuleName('Country', 'Countries')
@ApiEndpoint('/api/countries')
@Persistent()
export class Country extends BaseEntity {
    @PropertyName('Country Code', String)
    @Primary()
    @StringType(StringTypeEnum.TEXT)
    code!: string;  // 'US', 'ES', 'FR', etc.
    
    @PropertyName('Country Name', String)
    name!: string;
}
```

**Comportamiento:**
```typescript
const country = new Country();
country.code = 'US';
country.name = 'United States';

await country.save();
// → POST /api/countries
// → { code: 'US', name: 'United States' }

country.name = 'United States of America';
await country.save();
// → PUT /api/countries/US
```

---

### 4. UUID Primary Key

```typescript
@ModuleName('API Token', 'API Tokens')
@ApiEndpoint('/api/tokens')
@Persistent()
export class ApiToken extends BaseEntity {
    @PropertyName('Token', String)
    @Primary()
    @StringType(StringTypeEnum.UUID)
    token!: string;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Created At', Date)
    createdAt!: Date;
    
    // Auto-generar UUID antes de guardar
    beforeSave(): void {
        if (!this.token) {
            this.token = crypto.randomUUID();
        }
    }
}
```

**Comportamiento:**
```typescript
const apiToken = new ApiToken();
apiToken.name = 'Production Token';

await apiToken.save();
// → token auto-generado: '550e8400-e29b-41d4-a716-446655440000'
// → POST /api/tokens
// → { token: '550e8400-...', name: 'Production Token' }

apiToken.name = 'Production Token (Updated)';
await apiToken.save();
// → PUT /api/tokens/550e8400-e29b-41d4-a716-446655440000
```

---

### 5. Composite Primary Key (Simulated)

```typescript
// TypeScript no soporta composite keys directamente,
// pero podemos simularlas con un campo calculado

@ModuleName('Order Item', 'Order Items')
@ApiEndpoint('/api/order-items')
@Persistent()
export class OrderItem extends BaseEntity {
    @PropertyName('Order ID', Number)
    orderId!: number;
    
    @PropertyName('Product ID', Number)
    productId!: number;
    
    // Primary key compuesta como string
    @PropertyName('Composite ID', String)
    @Primary()
    get compositeId(): string {
        return `${this.orderId}-${this.productId}`;
    }
    
    set compositeId(value: string) {
        const [orderId, productId] = value.split('-').map(Number);
        this.orderId = orderId;
        this.productId = productId;
    }
    
    @PropertyName('Quantity', Number)
    quantity!: number;
}
```

**Comportamiento:**
```typescript
const item = new OrderItem();
item.orderId = 100;
item.productId = 42;
item.quantity = 5;

console.log(item.compositeId);  // → '100-42'
console.log(item.isNew());      // → true

await item.save();
// → POST /api/order-items
// → { compositeId: '100-42', quantity: 5 }

item.quantity = 10;
await item.save();
// → PUT /api/order-items/100-42
```

---

### 6. Auto-Incrementing ID

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Primary()
    @Disabled()  // ID asignado por servidor, no editable
    id!: number;
    
    @PropertyName('Product Name', String)
    @Required()
    name!: string;
}
```

**Comportamiento:**
```typescript
const product = new Product();
product.name = 'Laptop';
// id no asignado todavía

await product.save();
// → POST /api/products
// → Server response: { id: 42, name: 'Laptop' }
// → product.id ahora es 42 (asignado por servidor)

console.log(product.id);  // → 42 (auto-incrementado por servidor)
```

---

### 7. Custom ID Assignment

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    @PropertyName('Product ID', String)
    @Primary()
    id!: string;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // Generar ID custom antes de guardar
    beforeSave(): void {
        if (!this.id) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            this.id = `PROD-${timestamp}-${random}`;
        }
    }
}
```

**Comportamiento:**
```typescript
const product = new Product();
product.name = 'Laptop';

await product.save();
// → ID auto-generado: 'PROD-1707555600000-742'
// → POST /api/products
// → { id: 'PROD-1707555600000-742', name: 'Laptop' }
```

---

### 8. Primary + PersistentKey

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    // Primary: Identificador interno (número)
    @PropertyName('Product ID', Number)
    @Primary()  // ← Primary key para lógica interna
    id!: number;
    
    // PersistentKey: Identificador en URLs (string)
    @PropertyName('SKU', String)
    @Required()
    @PersistentKey()  // ← Usado en URLs de API
    sku!: string;
    
    @PropertyName('Product Name', String)
    name!: string;
}
```

**Comportamiento:**
```typescript
const product = new Product();
product.sku = 'PROD-001';
product.name = 'Laptop';

console.log(product.isNew());  // → true (id no asignado)

await product.save();
// → POST /api/products
// → { id: 42, sku: 'PROD-001', name: 'Laptop' }

console.log(product.id);        // → 42 (primary internal)
console.log(product.isNew());   // → false (id asignado)

product.name = 'Gaming Laptop';
await product.save();
// → PUT /api/products/PROD-001  ← Usa persistentKey (sku) en URL
// → Pero isNew() usa primary (id) para determinar si es nuevo
```

---

## 🔄 Primary vs PersistentKey

| Aspecto | @Primary() | @PersistentKey() |
|---------|------------|------------------|
| **Propósito** | Identificador conceptual único | Identificador en URLs de API |
| **Determina isNew()** | ✅ Sí | ❌ No |
| **Usado en save()** | ✅ Sí (detectar create vs update) | ✅ Sí (construir URL) |
| **Usado en delete()** | ❌ No (usa persistentKey) | ✅ Sí |
| **Tipo común** | Number (auto-increment) | String (SKU, username, slug) |
| **Cantidad** | Uno (o ninguno, usa 'id') | Uno (o ninguno, usa primary) |

---

## ⚠️ Consideraciones Importantes

### 1. Default es 'id'

```typescript
// Sin @Primary() → usa 'id' automáticamente
export class Product extends BaseEntity {
    id!: number;  // ← Primary key por convención
}

Product.getPrimaryProperty();  // → 'id'
```

### 2. Solo Una Primary Property

```typescript
// ❌ ERROR: No puede haber múltiples @Primary
export class Product extends BaseEntity {
    @Primary()
    id!: number;
    
    @Primary()  // ← Error: Solo una primary property
    userId!: number;
}

// Para composite keys, usar string concatenado:
@Primary()
get compositeKey(): string {
    return `${this.field1}-${this.field2}`;
}
```

### 3. Primary Debe Ser Único

```typescript
// ⚠️ Primary key DEBE ser único en backend
// Backend debe garantizar:
// - Unique constraint en DB
// - Auto-increment (si numeric)
// - Validación de duplicados
```

### 4. Primary No Debe Cambiar

```typescript
// ⚠️ PELIGRO: Cambiar primary key después de crear

const product = new Product();
product.id = 42;
await product.save();  // PUT /api/products/42

// Cambiar primary key:
product.id = 100;
await product.save();
// → PUT /api/products/100  ← Intenta actualizar producto diferente!

// ✅ MEJOR: Primary key inmutable
@PropertyName('Product ID', Number)
@Primary()
@ReadOnly()  // No editable
id!: number;
```

### 5. Primary con Disabled/ReadOnly

```typescript
// Patrón común: Primary key readonly
@PropertyName('Product ID', Number)
@Primary()
@Disabled()  // No editable en UI, no se envía al servidor
id!: number;

// O readonly si necesitas enviarlo:
@PropertyName('Product ID', Number)
@Primary()
@ReadOnly()  // No editable en UI, SÍ se envía al servidor
id!: number;
```

---

## 📚 Referencias Adicionales

- `persistent-key-decorator.md` - PersistentKey vs Primary
- `unique-decorator.md` - Unique validation
- `required-decorator.md` - Primary properties son required
- `../../02-base-entity/crud-operations.md` - save() usa primary property
- `../../tutorials/01-basic-crud.md` - Primary property en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/primary_property_decorator.ts`  
**Líneas:** ~20
