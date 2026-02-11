# 🔑 PersistentKey Decorator

**Referencias:**
- `persistent-decorator.md` - Persistent habilita sincronización con backend
- `api-endpoint-decorator.md` - ApiEndpoint define URL base
- `primary-property-decorator.md` - Primary define primary key alternativa
- `../../02-base-entity/crud-operations.md` - save(), delete() usan persistent key
- `../../tutorials/01-basic-crud.md` - Persistent key en CRUD

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/persistent_key_decorator.ts`

---

## 🎯 Propósito

El decorador `@PersistentKey()` especifica qué propiedad usar como **identificador único** para operaciones de persistencia (save, update, delete).

**Sin @PersistentKey:**
- Default: Se usa la propiedad marcada con `@Primary()` o `'id'`

**Con @PersistentKey:**
- La propiedad especificada se usa como identificador en URLs de API
- Ejemplo: `/api/products/PROD-001` en lugar de `/api/products/42`

**Diferencia con @Primary:**
- `@Primary()`: Identifica primary key conceptual (puede ser compuesta)
- `@PersistentKey()`: Identifica qué campo usar en URLs de API (siempre uno solo)

---

## 📝 Sintaxis

```typescript
@PersistentKey()
propertyName: Type;
```

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/persistent_key_decorator.ts

/**
 * Symbol para almacenar metadata de persistent key
 */
export const PERSISTENT_KEY_METADATA = Symbol('persistentKey');

/**
 * @PersistentKey() - Marca una propiedad como persistent key (identificador en URLs)
 * 
 * @returns PropertyDecorator
 */
export function PersistentKey(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Guardar persistent key en prototype
        target.constructor.prototype[PERSISTENT_KEY_METADATA] = propertyKey;
    };
}
```

**Ubicación:** `src/decorations/persistent_key_decorator.ts` (línea ~1-20)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[PERSISTENT_KEY_METADATA] = 'id';      // Default
Product.prototype[PERSISTENT_KEY_METADATA] = 'sku';     // Custom
User.prototype[PERSISTENT_KEY_METADATA] = 'username';   // Custom
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene la persistent key (identificador para URLs)
 * 
 * @returns Nombre de la propiedad persistent key
 */
public static getPersistentKey(): string {
    const persistentKey = this.prototype[PERSISTENT_KEY_METADATA];
    
    // Si no hay @PersistentKey, usar primary property
    if (!persistentKey) {
        return this.getPrimaryProperty();
    }
    
    return persistentKey;
}

/**
 * Obtiene el valor de la persistent key de una instancia
 */
public getPersistentKeyValue(): any {
    const constructor = this.constructor as typeof BaseEntity;
    const persistentKey = constructor.getPersistentKey();
    return this[persistentKey];
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1080-1110)

---

## 🔧 Impacto en CRUD Operations

### save() con PersistentKey

```typescript
// src/entities/base_entitiy.ts

public async save(): Promise<boolean> {
    // ... validaciones ...
    
    const constructor = this.constructor as typeof BaseEntity;
    const endpoint = constructor.getApiEndpoint();
    const persistentKey = constructor.getPersistentKey();
    const keyValue = this[persistentKey];
    const isNew = !keyValue;
    
    try {
        let response;
        
        if (isNew) {
            // POST /api/products
            response = await Application.axiosInstance.post(
                endpoint,
                this.toDictionary()
            );
        } else {
            // PUT /api/products/{persistentKeyValue}
            response = await Application.axiosInstance.put(
                `${endpoint}/${keyValue}`,  // ← Usa persistent key value
                this.toDictionary()
            );
        }
        
        this.updateFromDictionary(response.data);
        this.afterSave();
        
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

### 1. Default: ID Numérico

```typescript
import { PropertyName } from '@/decorations/property_name_decorator';
import { Primary } from '@/decorations/primary_property_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Primary()
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
}
```

**Comportamiento:**
```typescript
const product = await Product.getElement(42);
// → GET /api/products/42

await product.save();
// → PUT /api/products/42

await product.delete();
// → DELETE /api/products/42
```

---

### 2. Custom: SKU String

```typescript
import { PersistentKey } from '@/decorations/persistent_key_decorator';

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Primary()  // Primary key conceptual
    id!: number;
    
    @PropertyName('SKU', String)
    @PersistentKey()  // ← Usar SKU en URLs
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

await product.save();
// → POST /api/products
// → Response: { id: 42, sku: 'PROD-001', name: 'Laptop' }

product.name = 'Gaming Laptop';
await product.save();
// → PUT /api/products/PROD-001  ← Usa SKU, no ID
// → URL construida con persistentKey (sku)

await product.delete();
// → DELETE /api/products/PROD-001  ← Usa SKU

const product = await Product.getElement('PROD-001');
// → GET /api/products/PROD-001  ← Usa SKU
```

---

### 3. Username como Key

```typescript
@ModuleName('User', 'Users')
@ApiEndpoint('/api/users')
@Persistent()
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    @Primary()
    id!: number;
    
    @PropertyName('Username', String)
    @Required()
    @PersistentKey()  // ← Usar username en URLs
    username!: string;
    
    @PropertyName('Email', String)
    email!: string;
}
```

**Comportamiento:**
```typescript
const user = await User.getElement('john_doe');
// → GET /api/users/john_doe

await user.save();
// → PUT /api/users/john_doe

await user.delete();
// → DELETE /api/users/john_doe
```

---

### 4. UUID como Key

```typescript
import { StringType, StringTypeEnum } from '@/decorations/string_type_decorator';

@ModuleName('API Key', 'API Keys')
@ApiEndpoint('/api/keys')
@Persistent()
export class ApiKey extends BaseEntity {
    @PropertyName('Key ID', String)
    @Primary()
    @PersistentKey()
    @StringType(StringTypeEnum.UUID)
    keyId!: string;
    
    @PropertyName('Key Name', String)
    name!: string;
    
    @PropertyName('Created At', Date)
    createdAt!: Date;
}
```

**Comportamiento:**
```typescript
const apiKey = new ApiKey();
apiKey.keyId = crypto.randomUUID();  // '550e8400-e29b-41d4-a716-446655440000'
apiKey.name = 'Production Key';

await apiKey.save();
// → POST /api/keys
// → { keyId: '550e8400-...', name: 'Production Key' }

await apiKey.save();
// → PUT /api/keys/550e8400-e29b-41d4-a716-446655440000

const key = await ApiKey.getElement('550e8400-e29b-41d4-a716-446655440000');
// → GET /api/keys/550e8400-e29b-41d4-a716-446655440000
```

---

### 5. Email como Key

```typescript
@ModuleName('Newsletter Subscriber', 'Newsletter Subscribers')
@ApiEndpoint('/api/subscribers')
@Persistent()
export class NewsletterSubscriber extends BaseEntity {
    @PropertyName('Email', String)
    @Required()
    @StringType(StringTypeEnum.EMAIL)
    @PersistentKey()  // ← Email es la key
    email!: string;
    
    @PropertyName('Subscribed At', Date)
    subscribedAt!: Date;
    
    @PropertyName('Is Active', Boolean)
    isActive: boolean = true;
}
```

**Comportamiento:**
```typescript
const subscriber = new NewsletterSubscriber();
subscriber.email = 'john@example.com';

await subscriber.save();
// → POST /api/subscribers

await subscriber.save();
// → PUT /api/subscribers/john@example.com

const sub = await NewsletterSubscriber.getElement('john@example.com');
// → GET /api/subscribers/john@example.com

await subscriber.delete();
// → DELETE /api/subscribers/john@example.com
```

---

### 6. Composite Key (String Concatenation)

```typescript
@ModuleName('Order Item', 'Order Items')
@ApiEndpoint('/api/order-items')
@Persistent()
export class OrderItem extends BaseEntity {
    @PropertyName('Order ID', Number)
    orderId!: number;
    
    @PropertyName('Product ID', Number)
    productId!: number;
    
    // Composite key como string
    @PropertyName('Composite Key', String)
    @PersistentKey()
    get compositeKey(): string {
        return `${this.orderId}-${this.productId}`;
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

await item.save();
// → POST /api/order-items

await item.save();
// → PUT /api/order-items/100-42

const item = await OrderItem.getElement('100-42');
// → GET /api/order-items/100-42
```

---

### 7. Slug como Key

```typescript
@ModuleName('Blog Post', 'Blog Posts')
@ApiEndpoint('/api/posts')
@Persistent()
export class BlogPost extends BaseEntity {
    @PropertyName('Post ID', Number)
    @Primary()
    id!: number;
    
    @PropertyName('Title', String)
    @Required()
    title!: string;
    
    @PropertyName('Slug', String)
    @Required()
    @StringType(StringTypeEnum.SLUG)
    @PersistentKey()  // ← Slug en URLs (SEO-friendly)
    slug!: string;
    
    @PropertyName('Content', String)
    @StringType(StringTypeEnum.MARKDOWN)
    content!: string;
    
    // Auto-generate slug from title
    beforeSave(): void {
        if (!this.slug && this.title) {
            this.slug = this.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
    }
}
```

**Comportamiento:**
```typescript
const post = new BlogPost();
post.title = 'My First Blog Post';
// slug auto-generated: 'my-first-blog-post'

await post.save();
// → POST /api/posts
// → { id: 42, slug: 'my-first-blog-post', ... }

const post = await BlogPost.getElement('my-first-blog-post');
// → GET /api/posts/my-first-blog-post  ← SEO-friendly URL
```

---

## 🔄 Primary vs PersistentKey

| Aspecto | @Primary() | @PersistentKey() |
|---------|------------|------------------|
| **Propósito** | Identifica primary key conceptual | Identifica campo para URLs de API |
| **Cantidad** | Puede ser múltiple (composite) | Solo uno |
| **Uso** | Lógica de negocio, validaciones | URLs, HTTP requests |
| **Ejemplo** | ID interno (número) | SKU, username, slug (string) |

### Ejemplo Comparativo

```typescript
export class Product extends BaseEntity {
    // Primary: Identificador interno
    @PropertyName('Product ID', Number)
    @Primary()  // ← Para lógica interna
    id!: number;
    
    // PersistentKey: Identificador en API
    @PropertyName('SKU', String)
    @PersistentKey()  // ← Para URLs de API
    sku!: string;
}

// Uso:
product.id;   // → 42 (primary key interna)
product.sku;  // → 'PROD-001' (persistent key para API)

// En URLs:
// GET /api/products/PROD-001  ← Usa persistentKey (sku)
// NO usa id (42)
```

---

## ⚠️ Consideraciones Importantes

### 1. URL Encoding

```typescript
@PersistentKey()
email!: string;

const subscriber = await NewsletterSubscriber.getElement('john+test@example.com');
// → GET /api/subscribers/john%2Btest%40example.com
// ⚠️ Email debe ser URL-encoded

// BaseEntity debe hacer:
const encodedKey = encodeURIComponent(keyValue);
const url = `${endpoint}/${encodedKey}`;
```

### 2. Solo Una PersistentKey

```typescript
// ❌ ERROR: No puede haber múltiples @PersistentKey
export class Product extends BaseEntity {
    @PersistentKey()
    id!: number;
    
    @PersistentKey()  // ← Error: Solo puede haber una
    sku!: string;
}

// ✅ CORRECTO: Solo una
export class Product extends BaseEntity {
    @Primary()
    id!: number;
    
    @PersistentKey()  // ← Una sola persistent key
    sku!: string;
}
```

### 3. Debe Ser Único

```typescript
// ⚠️ PersistentKey DEBE ser único en el backend

@PersistentKey()
username!: string;  // DEBE ser único

// Backend debe garantizar uniqueness:
// - Unique constraint en DB
// - Validación en endpoints
```

### 4. Inmutable Después de Creación

```typescript
// ⚠️ CUIDADO: Cambiar persistentKey después de crear

const product = new Product();
product.sku = 'PROD-001';
await product.save();  // POST /api/products

// Cambiar SKU:
product.sku = 'PROD-002';
await product.save();  
// → PUT /api/products/PROD-002  ← Intenta actualizar producto diferente!

// ✅ MEJOR: SKU inmutable después de creación
@PropertyName('SKU', String)
@PersistentKey()
@ReadOnly()  // No editable después de creación
sku!: string;
```

### 5. getElement() con PersistentKey

```typescript
// PersistentKey afecta cómo se obtienen elementos

// Con ID (default):
const product = await Product.getElement(42);
// → GET /api/products/42

// Con SKU (persistentKey):
const product = await Product.getElement('PROD-001');
// → GET /api/products/PROD-001

// El tipo del parámetro cambia según persistentKey:
// - ID: number
// - SKU: string
// - UUID: string
```

---

## 📚 Referencias Adicionales

- `persistent-decorator.md` - Persistent habilita sincronización
- `primary-property-decorator.md` - Primary vs PersistentKey
- `api-endpoint-decorator.md` - ApiEndpoint define URL base
- `../../02-base-entity/crud-operations.md` - save(), delete() usan persistent key
- `../../tutorials/01-basic-crud.md` - Persistent key en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/persistent_key_decorator.ts`  
**Líneas:** ~20
