# ⚙️ BaseEntity: CRUD Operations

**Referencias:**
- `base-entity-core.md` - Núcleo de BaseEntity
- `validation-system.md` - Sistema de validación
- `lifecycle-hooks.md` - Hooks del ciclo de vida
- `../01-decorators/api-endpoint-decorator.md` - ApiEndpoint
- `../01-decorators/persistent-decorator.md` - Persistent

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts`

---

## 🎯 Propósito

BaseEntity proporciona **métodos CRUD completos** (Create, Read, Update, Delete) para interactuar con el backend de forma automática. Cada entidad que extiende BaseEntity hereda estos métodos sin necesidad de implementación adicional.

**Patrón:** Active Record Pattern  
**Protocolo:** REST API (GET, POST, PUT, DELETE)

---

## 📚 Métodos CRUD

### 1. save() - Crear o Actualizar

#### Firma

```typescript
public async save(): Promise<this>
```

#### Descripción

Guarda la entidad en el backend. Automáticamente determina si es una **creación** (POST) o **actualización** (PUT) basándose en si el ID existe.

#### Comportamiento

```typescript
// Si NO tiene ID → POST (crear)
const product = new Product({ name: 'Laptop', price: 1299 });
await product.save();
// → POST /api/products
// Body: { name: "Laptop", price: 1299 }
// Response: { id: 42, name: "Laptop", price: 1299, ... }

// Si tiene ID → PUT (actualizar)
product.price = 1199;
await product.save();
// → PUT /api/products/42
// Body: { id: 42, name: "Laptop", price: 1199 }
// Response: { id: 42, name: "Laptop", price: 1199, ... }
```

#### Flujo Completo

```
1. Usuario llama entity.save()
        ↓
2. Ejecuta beforeSave() hook
        ↓
3. Valida campos requeridos
        ↓
4. Valida reglas de validación (sync)
        ↓
5. Valida reglas async
        ↓
6. Si hay errores → Muestra toast y retorna entity sin guardar
        ↓
7. Serializa entity con toDictionary()
        ↓
8. Determina método HTTP:
   - Si NO tiene PK → POST
   - Si tiene PK → PUT
        ↓
9. Construye URL:
   - POST: {endpoint}
   - PUT: {endpoint}/{id}
        ↓
10. Hace request con Application.axiosInstance
        ↓
11. Actualiza entity con response.data
        ↓
12. Ejecuta afterSave() hook
        ↓
13. Muestra toast de éxito
        ↓
14. Emite evento 'saved' en Application.eventBus
        ↓
15. Retorna entity actualizado
```

#### Código Interno (Simplificado)

```typescript
public async save(): Promise<this> {
    // Hook pre-save
    this.beforeSave();
    
    // Validar
    if (!await this.validateInputs()) {
        Application.showToast('Validation errors', 'error');
        return this;
    }
    
    // Verificar persistencia
    if (!this.isPersistent()) {
        throw new Error('Entity is not persistent');
    }
    
    // Obtener endpoint
    const endpoint = (this.constructor as typeof BaseEntity).getApiEndpoint();
    
    // Determinar si es creación o actualización
    const pkValue = this.getPrimaryPropertyValue();
    const isNew = !pkValue;
    
    // Serializar
    const data = this.toDictionary();
    
    try {
        let response;
        
        if (isNew) {
            // POST - Crear
            response = await Application.axiosInstance.post(endpoint, data);
        } else {
            // PUT - Actualizar
            response = await Application.axiosInstance.put(
                `${endpoint}/${pkValue}`,
                data
            );
        }
        
        // Actualizar entity con respuesta
        Object.assign(this, response.data);
        
        // Hook post-save
        this.afterSave();
        
        // Toast de éxito
        Application.showToast(
            `${this.getModuleNameSingular()} saved successfully`,
            'success'
        );
        
        // Emitir evento
        Application.eventBus.emit('saved', {
            entityClass: this.constructor,
            entity: this
        });
        
        return this;
        
    } catch (error: any) {
        Application.showToast(
            error.response?.data?.message || 'Save failed',
            'error'
        );
        throw error;
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~710)

---

### 2. update() - Actualizar

#### Firma

```typescript
public async update(data?: Partial<this>): Promise<this>
```

#### Descripción

Alias de `save()` pero específicamente para actualizaciones. Opcionalmente acepta un objeto con campos a actualizar.

#### Uso

```typescript
// Opción 1: Modificar propiedades y luego update
const product = await Product.getElement(42);
product.price = 999;
await product.update();

// Opción 2: Pasar datos directamente
await product.update({ price: 999, stock: 50 });

// Ambos ejecutan: PUT /api/products/42
```

#### Código Interno

```typescript
public async update(data?: Partial<this>): Promise<this> {
    if (data) {
        Object.assign(this, data);
    }
    
    return this.save();  // Delega a save()
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~780)

---

### 3. delete() - Eliminar

#### Firma

```typescript
public async delete(): Promise<boolean>
```

#### Descripción

Elimina la entidad del backend.

#### Uso

```typescript
const product = await Product.getElement(42);
const deleted = await product.delete();

// → DELETE /api/products/42

if (deleted) {
    console.log('Product deleted successfully');
}
```

#### Flujo

```
1. Usuario llama entity.delete()
        ↓
2. Ejecuta beforeDelete() hook
        ↓
3. Verifica que tiene ID (PK)
        ↓
4. Obtiene endpoint
        ↓
5. Hace DELETE request:
   DELETE {endpoint}/{id}
        ↓
6. Si éxito:
   a. Ejecuta afterDelete() hook
   b. Muestra toast de éxito
   c. Emite evento 'deleted'
   d. Retorna true
        ↓
7. Si error:
   a. Muestra toast de error
   b. Retorna false
```

#### Código Interno

```typescript
public async delete(): Promise<boolean> {
    // Hook pre-delete
    this.beforeDelete();
    
    // Verificar ID
    const pkValue = this.getPrimaryPropertyValue();
    if (!pkValue) {
        throw new Error('Cannot delete entity without ID');
    }
    
    // Verificar persistencia
    if (!this.isPersistent()) {
        throw new Error('Entity is not persistent');
    }
    
    // Obtener endpoint
    const endpoint = (this.constructor as typeof BaseEntity).getApiEndpoint();
    
    try {
        await Application.axiosInstance.delete(`${endpoint}/${pkValue}`);
        
        // Hook post-delete
        this.afterDelete();
        
        // Toast de éxito
        Application.showToast(
            `${this.getModuleNameSingular()} deleted successfully`,
            'success'
        );
        
        // Emitir evento
        Application.eventBus.emit('deleted', {
            entityClass: this.constructor,
            entity: this
        });
        
        return true;
        
    } catch (error: any) {
        Application.showToast(
            error.response?.data?.message || 'Delete failed',
            'error'
        );
        return false;
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~790)

---

### 4. getElementList() - Obtener Lista (Estático)

#### Firma

```typescript
public static async getElementList<T extends BaseEntity>(
    this: new () => T,
    filters?: Record<string, any>
): Promise<T[]>
```

#### Descripción

Obtiene lista de todos los registros de la entidad desde el backend.

#### Uso

```typescript
// Obtener todos los productos
const products = await Product.getElementList();
// → GET /api/products
// Response: [{ id: 1, name: 'Laptop', ... }, { id: 2, ... }]

// Con filtros (query params)
const activeProducts = await Product.getElementList({ active: true });
// → GET /api/products?active=true

// Con paginación
const page2 = await Product.getElementList({ page: 2, limit: 20 });
// → GET /api/products?page=2&limit=20
```

#### Código Interno

```typescript
public static async getElementList<T extends BaseEntity>(
    this: new () => T,
    filters?: Record<string, any>
): Promise<T[]> {
    // Obtener endpoint
    const endpoint = this.getApiEndpoint();
    
    try {
        const response = await Application.axiosInstance.get(endpoint, {
            params: filters
        });
        
        // Convertir cada objeto en instancia de la entidad
        const entities = response.data.map((data: any) => {
            const entity = new this();
            Object.assign(entity, data);
            return entity;
        });
        
        // Emitir evento
        Application.eventBus.emit('list-fetched', {
            entityClass: this,
            entities: entities
        });
        
        return entities;
        
    } catch (error: any) {
        Application.showToast(
            error.response?.data?.message || 'Failed to fetch list',
            'error'
        );
        return [];
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~615)

---

### 5. getElement() - Obtener Por ID (Estático)

#### Firma

```typescript
public static async getElement<T extends BaseEntity>(
    this: new () => T,
    id: any
): Promise<T | null>
```

#### Descripción

Obtiene un registro específico por su ID desde el backend.

#### Uso

```typescript
// Obtener producto con ID 42
const product = await Product.getElement(42);
// → GET /api/products/42

if (product) {
    console.log(product.name);  // "Laptop"
} else {
    console.log('Product not found');
}
```

#### Código Interno

```typescript
public static async getElement<T extends BaseEntity>(
    this: new () => T,
    id: any
): Promise<T | null> {
    // Obtener endpoint
    const endpoint = this.getApiEndpoint();
    
    try {
        const response = await Application.axiosInstance.get(`${endpoint}/${id}`);
        
        // Crear instancia y asignar datos
        const entity = new this();
        Object.assign(entity, response.data);
        
        // Emitir evento
        Application.eventBus.emit('element-fetched', {
            entityClass: this,
            entity: entity
        });
        
        return entity;
        
    } catch (error: any) {
        if (error.response?.status === 404) {
            Application.showToast('Record not found', 'warning');
        } else {
            Application.showToast(
                error.response?.data?.message || 'Failed to fetch record',
                'error'
            );
        }
        return null;
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~650)

---

## 🔄 Métodos Auxiliares

### toDictionary() - Serialización

```typescript
public toDictionary(): Record<string, any> {
    const dict: Record<string, any> = {};
    
    // Obtener todas las propiedades
    const properties = this.getProperties();
    
    properties.forEach(key => {
        const value = (this as any)[key];
        
        // Serializar según tipo
        if (value instanceof BaseEntity) {
            // Relación: solo enviar ID
            dict[key] = value.getPrimaryPropertyValue();
        } else if (Array.isArray(value)) {
            // Array: serializar cada elemento
            dict[key] = value.map(item => 
                item instanceof BaseEntity 
                    ? item.toDictionary() 
                    : item
            );
        } else if (value instanceof Date) {
            // Fecha: ISO string
            dict[key] = value.toISOString();
        } else {
            // Valor primitivo
            dict[key] = value;
        }
    });
    
    return dict;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~520)

### fromDictionary() - Deserialización

```typescript
public static fromDictionary<T extends BaseEntity>(
    this: new () => T,
    data: Record<string, any>
): T {
    const entity = new this();
    
    Object.entries(data).forEach(([key, value]) => {
        // Aquí podrías agregar lógica de transformación
        // Por ejemplo, convertir strings ISO a Date
        if (entity.getPropertyType(key) === Date && typeof value === 'string') {
            (entity as any)[key] = new Date(value);
        } else {
            (entity as any)[key] = value;
        }
    });
    
    return entity;
}
```

---

## 🧪 Ejemplos de Uso Completos

### 1. CRUD Básico

```typescript
// CREATE
const product = new Product({
    name: 'Gaming Laptop',
    price: 1599,
    stock: 10
});
await product.save();
console.log(product.id);  // 42 (generado por backend)

// READ
const products = await Product.getElementList();
console.log(products.length);  // 5

const oneProduct = await Product.getElement(42);
console.log(oneProduct.name);  // "Gaming Laptop"

// UPDATE
oneProduct.price = 1499;
await oneProduct.save();

// DELETE
await oneProduct.delete();
```

### 2. Con Validaciones

```typescript
const product = new Product({ name: '' });  // Nombre vacío

await product.save();
// → Validación falla
// → Toast: "Validation errors"
// → No hace request al backend
// → Retorna product sin cambios
```

### 3. Con Relaciones

```typescript
// Crear orden con items
const order = new Order({
    customer: await Customer.getElement(10),
    items: [
        new OrderItem({ product: await Product.getElement(1), quantity: 2 }),
        new OrderItem({ product: await Product.getElement(3), quantity: 1 })
    ]
});

await order.save();
// → POST /api/orders
// Body: {
//   customer: 10,  ← Solo ID
//   items: [
//     { product: 1, quantity: 2 },
//     { product: 3, quantity: 1 }
//   ]
// }
```

### 4. Con Hooks

```typescript
export class Product extends BaseEntity {
    beforeSave() {
        // Normalizar nombre
        this.name = this.name.trim().toUpperCase();
        
        // Generar SKU si no existe
        if (!this.sku) {
            this.sku = `PROD-${Date.now()}`;
        }
    }
    
    afterSave() {
        console.log(`Product ${this.id} saved!`);
        
        // Invalidar caché
        CacheService.invalidate('products');
    }
}

const product = new Product({ name: '  laptop  ' });
await product.save();
// → beforeSave() ejecuta → name = "LAPTOP", sku = "PROD-1707566400000"
// → save() ejecuta
// → afterSave() ejecuta → log + invalidate cache
```

### 5. Manejo de Errores

```typescript
try {
    const product = new Product({ name: 'Test' });
    await product.save();
} catch (error: any) {
    if (error.response?.status === 422) {
        // Validation error del backend
        console.error('Backend validation failed:', error.response.data.errors);
    } else if (error.response?.status === 500) {
        // Server error
        console.error('Server error');
    } else {
        // Network error
        console.error('Network error');
    }
}
```

### 6. Actualización Parcial

```typescript
const product = await Product.getElement(42);

// Solo actualizar stock
await product.update({ stock: 25 });
// → PUT /api/products/42
// Body: { id: 42, stock: 25, ... (todos los campos) }
```

### 7. Soft Delete (Custom)

```typescript
export class Product extends BaseEntity {
    @PropertyName('Deleted At', Date)
    @ReadOnly(true)
    deletedAt?: Date;
    
    // Override delete para soft delete
    async delete(): Promise<boolean> {
        this.deletedAt = new Date();
        await this.save();
        return true;
    }
    
    // Método para hard delete
    async hardDelete(): Promise<boolean> {
        return super.delete();  // Llama al delete original
    }
}

await product.delete();       // Soft delete (marca deletedAt)
await product.hardDelete();   // Hard delete (elimina registro)
```

### 8. Batch Operations

```typescript
// Crear múltiples
const products = [
    new Product({ name: 'Product 1', price: 10 }),
    new Product({ name: 'Product 2', price: 20 }),
    new Product({ name: 'Product 3', price: 30 })
];

await Promise.all(products.map(p => p.save()));
// → 3 requests POST en paralelo

// Eliminar múltiples
const toDelete = await Product.getElementList({ discontinued: true });
await Promise.all(toDelete.map(p => p.delete()));
// → N requests DELETE en paralelo
```

---

## ⚠️ Consideraciones Importantes

### 1. Siempre Validar Antes de Guardar

`save()` valida automáticamente, pero puedes validar manualmente:

```typescript
const product = new Product({ name: '' });

if (await product.validateInputs()) {
    await product.save();
} else {
    console.log('Fix validation errors first');
}
```

### 2. getElementList() Retorna Instancias

```typescript
const products = await Product.getElementList();

// Cada elemento es una instancia de Product
products[0] instanceof Product;  // true

// Tiene todos los métodos
await products[0].save();
products[0].getPropertyName('name');  // "Product Name"
```

### 3. Manejo de IDs Compuestos

Si tu entidad usa clave primaria compuesta:

```typescript
@Persistent(true, ['customerId', 'productId'])
export class CustomerProduct extends BaseEntity {
    @PropertyName('Customer ID', Number)
    customerId!: number;
    
    @PropertyName('Product ID', Number)
    productId!: number;
    
    // Override getPrimaryPropertyValue()
    getPrimaryPropertyValue(): any {
        return `${this.customerId}-${this.productId}`;
    }
}

// save() construirá URL:
// PUT /api/customer-products/10-42
```

### 4. Response del Backend Debe Coincidir

El backend debe retornar el objeto completo después de create/update:

```typescript
// POST /api/products
// Request: { name: "Laptop", price: 1299 }

// Response: { id: 42, name: "Laptop", price: 1299, createdAt: "..." }
//           ↑ Incluir ID y campos autogenerados
```

### 5. No Llamar save() dentro de beforeSave()

```typescript
// ❌ INCORRECTO: Loop infinito
beforeSave() {
    this.updatedAt = new Date();
    await this.save();  // ← Loop infinito
}

// ✅ CORRECTO: Solo modificar propiedades
beforeSave() {
    this.updatedAt = new Date();
}
```

---

## 📚 Referencias Adicionales

- `base-entity-core.md` - Núcleo y arquitectura
- `validation-system.md` - Sistema de validación
- `lifecycle-hooks.md` - beforeSave, afterSave, etc.
- `metadata-access.md` - Métodos de acceso a metadatos
- `../01-decorators/api-endpoint-decorator.md` - Configurar endpoint
- `../01-decorators/persistent-decorator.md` - Habilitar persistencia
- `../../tutorials/01-basic-crud.md` - Tutorial CRUD básico

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/entities/base_entitiy.ts`  
**Líneas relevantes:** 615-850 (CRUD operations)
