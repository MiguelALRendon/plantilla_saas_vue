# 💾 Persistent Decorator

**Referencias:**
- `api-endpoint-decorator.md` - ApiEndpoint define la URL base
- `api-methods-decorator.md` - ApiMethods define métodos HTTP permitidos
- `persistent-key-decorator.md` - PersistentKey define la primary key
- `../../02-base-entity/crud-operations.md` - save(), delete() usan Persistent
- `../../03-application/application-singleton.md` - axios instance

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/persistent_decorator.ts`

---

## 🎯 Propósito

El decorador `@Persistent()` marca una entidad como **persistente**, indicando que debe sincronizarse con un backend a través de HTTP requests.

**Sin @Persistent:**
- Entidad es solo local (en memoria)
- `save()`, `update()`, `delete()` no hacen HTTP requests
- `getElementList()`, `getElement()` retornan datos locales/mock

**Con @Persistent:**
- Entidad sincroniza con backend
- CRUD operations hacen HTTP requests
- Datos se guardan en base de datos del servidor

---

## 📝 Sintaxis

```typescript
@Persistent(persistent: boolean = true)
export class EntityName extends BaseEntity {
    // ...
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `persistent` | `boolean` | No | `true` | Si `true`, entidad es persistente (hace HTTP requests) |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/persistent_decorator.ts

/**
 * Symbol para almacenar metadata de persistent
 */
export const PERSISTENT_METADATA = Symbol('persistent');

/**
 * @Persistent() - Marca una entidad como persistente (sincroniza con backend)
 * 
 * @param persistent - Si la entidad es persistente (default: true)
 * @returns ClassDecorator
 */
export function Persistent(persistent: boolean = true): ClassDecorator {
    return function (target: any) {
        // Guardar flag en prototype
        target.prototype[PERSISTENT_METADATA] = persistent;
    };
}
```

**Ubicación:** `src/decorations/persistent_decorator.ts` (línea ~1-25)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[PERSISTENT_METADATA] = true;   // Persistente
MockProduct.prototype[PERSISTENT_METADATA] = false;  // Solo local
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Verifica si la entidad es persistente
 * 
 * @returns true si la entidad sincroniza con backend
 */
public static isPersistent(): boolean {
    const persistent = this.prototype[PERSISTENT_METADATA];
    return persistent !== false;  // Default: true
}

/**
 * Verifica si la entidad es persistente (método de instancia)
 */
public isPersistent(): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.isPersistent();
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1000-1020)

---

## 🔧 Impacto en CRUD Operations

### save() con Persistent

```typescript
// src/entities/base_entitiy.ts

public async save(): Promise<boolean> {
    // Ejecutar beforeSave hook
    this.beforeSave();
    
    // Validar
    const isValid = await this.validateInputs();
    if (!isValid) {
        return false;
    }
    
    // ========================================
    // CHECK: ¿Es persistente?
    // ========================================
    const constructor = this.constructor as typeof BaseEntity;
    
    if (!constructor.isPersistent()) {
        // NO persistente → solo guardar localmente
        console.log('[BaseEntity] Not persistent, saving locally');
        this.afterSave();
        return true;
    }
    
    // ========================================
    // SÍ persistente → HTTP request
    // ========================================
    
    const endpoint = constructor.getApiEndpoint();
    const primaryKey = constructor.getPrimaryProperty();
    const isNew = !this[primaryKey];
    
    try {
        let response;
        
        if (isNew) {
            // POST /api/products
            response = await Application.axiosInstance.post(
                endpoint,
                this.toDictionary()
            );
        } else {
            // PUT /api/products/42
            response = await Application.axiosInstance.put(
                `${endpoint}/${this[primaryKey]}`,
                this.toDictionary()
            );
        }
        
        // Actualizar entidad con respuesta del servidor
        this.updateFromDictionary(response.data);
        
        // Ejecutar afterSave hook
        this.afterSave();
        
        // Emitir evento
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

### delete() con Persistent

```typescript
public async delete(): Promise<boolean> {
    // Ejecutar beforeDelete hook
    this.beforeDelete();
    
    const constructor = this.constructor as typeof BaseEntity;
    
    if (!constructor.isPersistent()) {
        // NO persistente → solo eliminar localmente
        console.log('[BaseEntity] Not persistent, deleting locally');
        this.afterDelete();
        return true;
    }
    
    // SÍ persistente → HTTP request
    const endpoint = constructor.getApiEndpoint();
    const primaryKey = constructor.getPrimaryProperty();
    const id = this[primaryKey];
    
    try {
        // DELETE /api/products/42
        await Application.axiosInstance.delete(`${endpoint}/${id}`);
        
        // Ejecutar afterDelete hook
        this.afterDelete();
        
        // Emitir evento
        Application.eventBus.emit('entity-deleted', {
            entityClass: constructor,
            entity: this,
            id: id
        });
        
        return true;
    } catch (error) {
        console.error('[BaseEntity] Delete failed:', error);
        return false;
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~340-380)

---

### getElementList() con Persistent

```typescript
public static async getElementList(): Promise<BaseEntity[]> {
    if (!this.isPersistent()) {
        // NO persistente → retornar mock data
        console.log('[BaseEntity] Not persistent, returning mock data');
        return this.getMockData();
    }
    
    // SÍ persistente → HTTP request
    const endpoint = this.getApiEndpoint();
    
    try {
        // GET /api/products
        const response = await Application.axiosInstance.get(endpoint);
        
        // Convertir JSON a instancias
        const entities = response.data.map((data: any) => {
            const entity = new this();
            entity.updateFromDictionary(data);
            return entity;
        });
        
        // Emitir evento
        Application.eventBus.emit('entity-list-fetched', {
            entityClass: this,
            entities: entities,
            count: entities.length
        });
        
        return entities;
    } catch (error) {
        console.error('[BaseEntity] getElementList failed:', error);
        return [];
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~390-430)

---

### getElement() con Persistent

```typescript
public static async getElement(id: any): Promise<BaseEntity | null> {
    if (!this.isPersistent()) {
        // NO persistente → buscar en mock data
        const mockData = this.getMockData();
        const primaryKey = this.getPrimaryProperty();
        
        return mockData.find(entity => entity[primaryKey] === id) || null;
    }
    
    // SÍ persistente → HTTP request
    const endpoint = this.getApiEndpoint();
    
    try {
        // GET /api/products/42
        const response = await Application.axiosInstance.get(`${endpoint}/${id}`);
        
        // Convertir JSON a instancia
        const entity = new this();
        entity.updateFromDictionary(response.data);
        
        // Emitir evento
        Application.eventBus.emit('entity-fetched', {
            entityClass: this,
            entity: entity,
            id: id
        });
        
        return entity;
    } catch (error) {
        console.error('[BaseEntity] getElement failed:', error);
        return null;
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~440-480)

---

## 🧪 Ejemplos de Uso

### 1. Entidad Persistente (Default)

```typescript
import { Persistent } from '@/decorations/persistent_decorator';
import { ApiEndpoint } from '@/decorations/api_endpoint_decorator';
import { ModuleName } from '@/decorations/module_name_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()  // ← Entidad persistente (hace HTTP requests)
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
}
```

**Comportamiento:**
```typescript
const product = new Product();
product.name = 'Laptop';
product.price = 999;

await product.save();
// → POST /api/products
// → Request body: { name: 'Laptop', price: 999 }

const products = await Product.getElementList();
// → GET /api/products
// → Retorna datos del servidor

await product.delete();
// → DELETE /api/products/42
```

---

### 2. Entidad No Persistente (Local/Mock)

```typescript
@ModuleName('MockProduct', 'Mock Products')
@Persistent(false)  // ← NO persistente (solo local)
export class MockProduct extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // Mock data estático
    public static getMockData(): MockProduct[] {
        return [
            Object.assign(new MockProduct(), { id: 1, name: 'Mock Product 1' }),
            Object.assign(new MockProduct(), { id: 2, name: 'Mock Product 2' }),
            Object.assign(new MockProduct(), { id: 3, name: 'Mock Product 3' })
        ];
    }
}
```

**Comportamiento:**
```typescript
const product = new MockProduct();
product.name = 'Test Product';

await product.save();
// → NO hace HTTP request
// → Solo guarda en memoria localmente

const products = await MockProduct.getElementList();
// → NO hace HTTP request
// → Retorna getMockData()

await product.delete();
// → NO hace HTTP request
// → Solo elimina de memoria local
```

---

### 3. Desarrollo con Mock, Producción con Backend

```typescript
// Determinar si usar backend o mock según environment
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent(USE_BACKEND)  // ← Configurable por environment
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    // Mock data para desarrollo
    public static getMockData(): Product[] {
        return [
            Object.assign(new Product(), { 
                id: 1, 
                name: 'Laptop Dell XPS 13', 
                price: 1299 
            }),
            Object.assign(new Product(), { 
                id: 2, 
                name: 'Mouse Logitech MX Master', 
                price: 99 
            })
        ];
    }
}
```

**.env.development:**
```env
VITE_USE_BACKEND=false  # Usar mock data
```

**.env.production:**
```env
VITE_USE_BACKEND=true   # Usar backend real
```

**Comportamiento:**
- **Desarrollo:** `@Persistent(false)` → Mock data, no HTTP requests
- **Producción:** `@Persistent(true)` → Backend real, HTTP requests

---

### 4. Entidad Híbrida (Persistent + Cache Local)

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    // Cache local
    private static cache: Map<number, Product> = new Map();
    private static cacheExpiry: number = 5 * 60 * 1000;  // 5 minutos
    private static cacheTimestamp: number = 0;
    
    /**
     * Override getElementList con cache
     */
    public static override async getElementList(): Promise<Product[]> {
        const now = Date.now();
        
        // Verificar cache válido
        if (this.cache.size > 0 && (now - this.cacheTimestamp) < this.cacheExpiry) {
            console.log('[Product] Using cached data');
            return Array.from(this.cache.values());
        }
        
        // Cache expirado o vacío → hacer HTTP request
        const products = await super.getElementList() as Product[];
        
        // Actualizar cache
        this.cache.clear();
        products.forEach(product => {
            this.cache.set(product.id, product);
        });
        this.cacheTimestamp = now;
        
        return products;
    }
    
    /**
     * Override getElement con cache
     */
    public static override async getElement(id: number): Promise<Product | null> {
        // Intentar obtener de cache
        if (this.cache.has(id)) {
            console.log('[Product] Using cached product:', id);
            return this.cache.get(id) || null;
        }
        
        // No en cache → hacer HTTP request
        const product = await super.getElement(id) as Product;
        
        if (product) {
            this.cache.set(id, product);
        }
        
        return product;
    }
}
```

---

### 5. Entidad con Validación Previa

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    @Required()
    name!: string;
    
    /**
     * Override save() con validación adicional
     */
    public override async save(): Promise<boolean> {
        // Validación custom antes de hacer HTTP request
        if (this.price < 0) {
            this.errors['price'] = 'Price cannot be negative';
            return false;
        }
        
        if (this.stock < 0) {
            this.errors['stock'] = 'Stock cannot be negative';
            return false;
        }
        
        // Proceder con save normal (hace HTTP request)
        return await super.save();
    }
}
```

---

### 6. Entidad con Retry Logic

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    /**
     * Override save() con retry logic
     */
    public override async save(): Promise<boolean> {
        const maxRetries = 3;
        let retries = 0;
        
        while (retries < maxRetries) {
            try {
                // Intentar save
                return await super.save();
            } catch (error) {
                retries++;
                
                if (retries >= maxRetries) {
                    console.error('[Product] Save failed after retries:', error);
                    Application.showToast('Save failed, please try again', 'error');
                    return false;
                }
                
                // Esperar antes de reintentar
                console.log(`[Product] Retry ${retries}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
        
        return false;
    }
}
```

---

### 7. Testing con Mock Data

```typescript
// src/entities/__tests__/product.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { Product } from '@/entities/product';

describe('Product Entity', () => {
    beforeEach(() => {
        // Forzar modo no-persistente para tests
        Product.prototype[PERSISTENT_METADATA] = false;
    });
    
    it('should save product locally', async () => {
        const product = new Product();
        product.name = 'Test Product';
        product.price = 99;
        
        const saved = await product.save();
        
        expect(saved).toBe(true);
        // NO hace HTTP request en tests
    });
    
    it('should get mock products', async () => {
        const products = await Product.getElementList();
        
        expect(products.length).toBeGreaterThan(0);
        // Retorna mock data
    });
});
```

---

## 🔄 Persistent vs Non-Persistent Comparison

| Aspecto | @Persistent(true) | @Persistent(false) |
|---------|-------------------|-------------------|
| **save()** | POST/PUT HTTP request | Solo guarda en memoria |
| **delete()** | DELETE HTTP request | Solo elimina de memoria |
| **getElementList()** | GET HTTP request | Retorna mock data |
| **getElement()** | GET HTTP request | Busca en mock data |
| **Requiere @ApiEndpoint** | ✅ Sí | ❌ No |
| **Uso típico** | Producción con backend | Desarrollo, testing, demos |

---

## ⚠️ Consideraciones Importantes

### 1. @Persistent Requiere @ApiEndpoint

```typescript
// ✅ CORRECTO: Persistent con ApiEndpoint
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    // ...
}

// ❌ ERROR: Persistent sin ApiEndpoint
@Persistent()  // ← Error: No endpoint definido
export class Product extends BaseEntity {
    // ...
}
```

### 2. Default es Persistent

```typescript
// Sin @Persistent → Default: true
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    // ...
}

Product.isPersistent();  // → true (default)
```

### 3. Mock Data para Non-Persistent

```typescript
// Entidades no-persistentes deben proveer mock data
@Persistent(false)
export class MockProduct extends BaseEntity {
    // ✅ CORRECTO: Proveer getMockData()
    public static override getMockData(): MockProduct[] {
        return [/* mock data */];
    }
}

// ❌ INCORRECTO: No proveer mock data
@Persistent(false)
export class MockProduct extends BaseEntity {
    // getElementList() retornará []
}
```

### 4. Cambiar Persistent en Runtime

```typescript
// ⚠️ NO recomendado cambiar en runtime
Product.prototype[PERSISTENT_METADATA] = false;

// ✅ MEJOR: Usar environment variables
@Persistent(import.meta.env.VITE_USE_BACKEND === 'true')
```

### 5. Testing Considerations

```typescript
// En tests, forzar non-persistent
beforeEach(() => {
    Product.prototype[PERSISTENT_METADATA] = false;
});

// Después de tests, restaurar
afterEach(() => {
    Product.prototype[PERSISTENT_METADATA] = true;
});
```

---

## 📚 Referencias Adicionales

- `api-endpoint-decorator.md` - Define URL del backend
- `api-methods-decorator.md` - Define métodos HTTP permitidos
- `persistent-key-decorator.md` - Define primary key
- `../../02-base-entity/crud-operations.md` - save(), delete(), getElementList()
- `../../03-application/application-singleton.md` - Application.axiosInstance
- `../../tutorials/01-basic-crud.md` - Entidades persistentes en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/persistent_decorator.ts`  
**Líneas:** ~25
