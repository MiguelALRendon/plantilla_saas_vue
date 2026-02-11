# 🎣 Lifecycle Hooks de BaseEntity

**Referencias:**
- `crud-operations.md` - save(), delete()
- `validation-system.md` - validateInputs()
- `base-entity-core.md` - Núcleo de BaseEntity
- `../../02-FLOW-ARCHITECTURE.md` - Flujos completos

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts` (líneas ~860-920)

---

## 🎯 Propósito

Los **lifecycle hooks** (ganchos del ciclo de vida) son métodos que se ejecutan automáticamente en momentos específicos del ciclo de vida de una entidad. Permiten ejecutar lógica custom antes/después de operaciones CRUD sin modificar los métodos principales.

---

## 🔄 Hooks Disponibles

### 1. beforeSave()

#### Firma

```typescript
protected beforeSave(): void
```

#### Cuándo se Ejecuta

Inmediatamente **antes** de ejecutar validaciones y antes de hacer el HTTP request (POST/PUT).

#### Caso de Uso

- Normalizar/limpiar datos antes de validar
- Calcular campos derivados
- Generar valores por defecto
- Logging/auditing

#### Flujo

```
entity.save() llamado
        ↓
beforeSave() ← AQUÍ
        ↓
validateInputs()
        ↓
HTTP request (POST/PUT)
        ↓
afterSave()
```

#### Ejemplo Básico

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('SKU', String)
    sku?: string;
    
    protected beforeSave(): void {
        // Normalizar nombre
        this.name = this.name.trim().toUpperCase();
        
        // Generar SKU si no existe
        if (!this.sku) {
            this.sku = `PROD-${Date.now()}`;
        }
    }
}

// Uso
const product = new Product({ name: '  laptop  ' });
await product.save();
// → beforeSave() ejecuta
// → name = "LAPTOP", sku = "PROD-1707566400000"
// → Validaciones
// → POST /api/products
```

#### Ubicación en save()

```typescript
public async save(): Promise<this> {
    // beforeSave ejecuta AQUÍ ←
    this.beforeSave();
    
    // Validar
    if (!await this.validateInputs()) {
        return this;
    }
    
    // ... HTTP request ...
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~715)

---

### 2. afterSave()

#### Firma

```typescript
protected afterSave(): void
```

#### Cuándo se Ejecuta

Inmediatamente **después** de que el HTTP request sea exitoso y después de actualizar la entidad con la respuesta.

#### Caso de Uso

- Invalidar cachés
- Emitir eventos custom
- Actualizar relaciones
- Logging/auditing
- Sincronizar con otros sistemas

#### Flujo

```
entity.save() llamado
        ↓
beforeSave()
        ↓
validateInputs()
        ↓
HTTP request (POST/PUT) exitoso
        ↓
Actualizar entity con response.data
        ↓
afterSave() ← AQUÍ
        ↓
Toast de éxito
```

#### Ejemplo Básico

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    protected afterSave(): void {
        console.log(`Product ${this.id} saved successfully!`);
        
        // Invalidar caché
        CacheService.invalidate('products');
        
        // Emitir evento custom
        Application.eventBus.emit('product-updated', { product: this });
    }
}

// Uso
const product = new Product({ name: 'Laptop' });
await product.save();
// → ... validaciones y HTTP ...
// → Entity actualizada con respuesta
// → afterSave() ejecuta
// → Console: "Product 42 saved successfully!"
// → Caché invalidado
// → Evento emitido
```

#### Ubicación en save()

```typescript
public async save(): Promise<this> {
    // ... beforeSave, validación, request ...
    
    // Actualizar con respuesta
    Object.assign(this, response.data);
    
    // afterSave ejecuta AQUÍ ←
    this.afterSave();
    
    // Toast de éxito
    Application.showToast('Saved successfully', 'success');
    
    return this;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~770)

---

### 3. beforeDelete()

#### Firma

```typescript
protected beforeDelete(): void
```

#### Cuándo se Ejecuta

Inmediatamente **antes** de hacer el HTTP request DELETE.

#### Caso de Uso

- Validar que se puede eliminar (ej: no tiene dependencias)
- Logging/auditing
- Confirmar acción con usuario
- Limpiar datos relacionados

#### Flujo

```
entity.delete() llamado
        ↓
beforeDelete() ← AQUÍ
        ↓
HTTP request (DELETE)
        ↓
afterDelete()
```

#### Ejemplo Básico

```typescript
export class Category extends BaseEntity {
    @PropertyName('Category Name', String)
    name!: string;
    
    @PropertyName('Products', Array)
    @ArrayOf(Product)
    products!: Product[];
    
    protected beforeDelete(): void {
        // Verificar que no tenga productos
        if (this.products && this.products.length > 0) {
            throw new Error(
                `Cannot delete category "${this.name}" because it has ${this.products.length} products`
            );
        }
        
        console.log(`Deleting category: ${this.name}`);
    }
}

// Uso
const category = await Category.getElement(10);
await category.delete();
// → beforeDelete() ejecuta
// → Si tiene productos → throw Error (no procede)
// → Si no tiene productos → DELETE /api/categories/10
```

#### Ubicación en delete()

```typescript
public async delete(): Promise<boolean> {
    // beforeDelete ejecuta AQUÍ ←
    this.beforeDelete();
    
    // Verificar ID
    const pkValue = this.getPrimaryPropertyValue();
    if (!pkValue) {
        throw new Error('Cannot delete without ID');
    }
    
    // ... HTTP DELETE ...
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~795)

---

### 4. afterDelete()

#### Firma

```typescript
protected afterDelete(): void
```

#### Cuándo se Ejecuta

Inmediatamente **después** de que el HTTP request DELETE sea exitoso.

#### Caso de Uso

- Invalidar cachés
- Limpiar datos relacionados
- Emitir eventos
- Logging/auditing
- Actualizar UI

#### Flujo

```
entity.delete() llamado
        ↓
beforeDelete()
        ↓
HTTP request (DELETE) exitoso
        ↓
afterDelete() ← AQUÍ
        ↓
Toast de éxito
```

#### Ejemplo Básico

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    protected afterDelete(): void {
        console.log(`Product ${this.name} deleted`);
        
        // Invalidar caché
        CacheService.invalidate('products');
        
        // Emitir evento
        Application.eventBus.emit('product-deleted', { productId: this.id });
    }
}

// Uso
const product = await Product.getElement(42);
await product.delete();
// → beforeDelete()
// → DELETE /api/products/42
// → afterDelete() ejecuta
// → Console: "Product Laptop deleted"
// → Caché invalidado
// → Evento emitido
```

#### Ubicación en delete()

```typescript
public async delete(): Promise<boolean> {
    // ... beforeDelete, verificaciones ...
    
    try {
        // HTTP DELETE
        await Application.axiosInstance.delete(`${endpoint}/${pkValue}`);
        
        // afterDelete ejecuta AQUÍ ←
        this.afterDelete();
        
        // Toast de éxito
        Application.showToast('Deleted successfully', 'success');
        
        return true;
    } catch (error) {
        // ...
    }
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~825)

---

### 5. onValidated()

#### Firma

```typescript
public onValidated(): void
```

#### Cuándo se Ejecuta

Inmediatamente **después** de que todas las validaciones (síncronas y asíncronas) completen exitosamente, justo antes de ocultar el menú de carga.

#### Caso de Uso

- Ejecutar lógica post-validación
- Actualizar UI después de validar
- Emitir eventos de validación completa
- Logging/auditing de validaciones

#### Flujo

```
entity.validateInputs() llamado
        ↓
Validaciones síncronas
        ↓
Validaciones asíncronas (Promise.all)
        ↓
Esperar 50ms para procesar resultados
        ↓
onValidated() ← AQUÍ
        ↓
Ocultar loading menu
        ↓
Retornar isValid
```

#### Ejemplo Básico

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required()
    name!: string;
    
    @PropertyName('SKU', String)
    @Required()
    @AsyncValidation(async (value) => {
        const exists = await checkSkuExists(value);
        return exists ? 'SKU already exists' : undefined;
    })
    sku!: string;
    
    public onValidated(): void {
        console.log('Validation completed!');
        
        // Emitir evento custom
        Application.eventBus.emit('product-validated', {
            valid: Application.View.value.isValid,
            errors: this.errors
        });
    }
}

// Uso
const product = new Product({ name: 'Laptop', sku: 'LAP-001' });
await product.validateInputs();
// → Validaciones síncronas (required)
// → Validaciones asíncronas (checkSkuExists)
// → onValidated() ejecuta
// → Console: "Validation completed!"
// → Evento emitido
```

#### Ubicación en validateInputs()

```typescript
public async validateInputs(): Promise<boolean> {
    // ... validaciones síncronas ...
    
    // Validaciones asíncronas
    await Promise.all(asyncValidationPromises);
    
    // Esperar procesamiento de resultados
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // onValidated ejecuta AQUÍ ←
    this.onValidated();
    
    Application.ApplicationUIService.hideLoadingMenu();
    
    return Application.View.value.isValid;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea 585 - llamada, línea 953 - definición)

---

## 🧪 Ejemplos Completos

### 1. Timestamps Automáticos

```typescript
export class BaseAuditEntity extends BaseEntity {
    @PropertyName('Created At', Date)
    @ReadOnly(true)
    createdAt?: Date;
    
    @PropertyName('Updated At', Date)
    @ReadOnly(true)
    updatedAt?: Date;
    
    @PropertyName('Created By', String)
    @ReadOnly(true)
    createdBy?: string;
    
    @PropertyName('Updated By', String)
    @ReadOnly(true)
    updatedBy?: string;
    
    protected beforeSave(): void {
        const currentUser = Application.currentUser?.username;
        
        if (!this.id) {
            // Es creación
            this.createdAt = new Date();
            this.createdBy = currentUser;
        }
        
        // Siempre actualizar
        this.updatedAt = new Date();
        this.updatedBy = currentUser;
    }
}

// Usar en otras entidades
export class Product extends BaseAuditEntity {
    @PropertyName('Product Name', String)
    name!: string;
    // Hereda: createdAt, updatedAt, createdBy, updatedBy
}

// Uso
const product = new Product({ name: 'Laptop' });
await product.save();
// → beforeSave() ejecuta
// → createdAt = ahora
// → createdBy = "john_doe"
// → updatedAt = ahora
// → updatedBy = "john_doe"

product.name = 'Gaming Laptop';
await product.save();
// → beforeSave() ejecuta
// → createdAt = [sin cambios]
// → createdBy = [sin cambios]
// → updatedAt = ahora (actualizado)
// → updatedBy = "john_doe" (actualizado)
```

### 2. Soft Delete

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Deleted At', Date)
    @ReadOnly(true)
    deletedAt?: Date;
    
    @PropertyName('Deleted By', String)
    @ReadOnly(true)
    deletedBy?: string;
    
    // Override delete para soft delete
    async delete(): Promise<boolean> {
        // Ejecutar beforeDelete
        this.beforeDelete();
        
        // Marcar como eliminado en lugar de eliminar
        this.deletedAt = new Date();
        this.deletedBy = Application.currentUser?.username;
        
        // Guardar cambios
        await this.save();
        
        // Ejecutar afterDelete
        this.afterDelete();
        
        Application.showToast('Product archived', 'success');
        
        return true;
    }
    
    // Método para hard delete
    async hardDelete(): Promise<boolean> {
        return super.delete();  // Llama al delete real
    }
    
    // Método para restaurar
    async restore(): Promise<boolean> {
        this.deletedAt = undefined;
        this.deletedBy = undefined;
        await this.save();
        return true;
    }
}

// Uso
const product = await Product.getElement(42);

// Soft delete (marca deletedAt)
await product.delete();
// → beforeDelete()
// → deletedAt = ahora
// → save() (actualiza en DB)
// → afterDelete()

// Restaurar
await product.restore();
// → deletedAt = undefined
// → save()

// Hard delete (elimina registro)
await product.hardDelete();
// → DELETE /api/products/42
```

### 3. Validación en beforeSave

```typescript
export class Order extends BaseEntity {
    @PropertyName('Items', Array)
    @ArrayOf(OrderItem)
    items!: OrderItem[];
    
    @PropertyName('Status', String)
    status!: string;
    
    protected beforeSave(): void {
        // Validar que tenga items
        if (!this.items || this.items.length === 0) {
            throw new Error('Order must have at least one item');
        }
        
        // Calcular total automáticamente
        this.total = this.items.reduce((sum, item) => sum + item.total, 0);
        
        // Si es nueva orden, status = 'draft'
        if (!this.id) {
            this.status = 'draft';
        }
    }
    
    @PropertyName('Total', Number)
    @ReadOnly(true)
    total!: number;
}
```

### 4. Cascading Save en afterSave

```typescript
export class Order extends BaseEntity {
    @PropertyName('Items', Array)
    @ArrayOf(OrderItem)
    items!: OrderItem[];
    
    protected async afterSave(): Promise<void> {
        // Guardar items en cascada
        if (this.items && this.items.length > 0) {
            for (const item of this.items) {
                item.orderId = this.id;  // Asignar FK
                await item.save();
            }
        }
        
        console.log(`Order ${this.id} and ${this.items.length} items saved`);
    }
}

// Uso
const order = new Order({
    customer: customer,
    items: [
        new OrderItem({ product: product1, quantity: 2 }),
        new OrderItem({ product: product2, quantity: 1 })
    ]
});

await order.save();
// → beforeSave()
// → POST /api/orders
// → afterSave()
//   → item1.save() (POST /api/order-items)
//   → item2.save() (POST /api/order-items)
```

### 5. Cache Invalidation

```typescript
export class Product extends BaseEntity {
    protected afterSave(): void {
        // Invalidar cachés relacionados
        CacheService.invalidate('products');
        CacheService.invalidate('product-list');
        CacheService.invalidate(`product-${this.id}`);
        
        // Si tiene categoría, invalidar caché de categoría
        if (this.category) {
            CacheService.invalidate(`category-${this.category.id}-products`);
        }
    }
    
    protected afterDelete(): void {
        // Invalidar cachés al eliminar
        CacheService.invalidate('products');
        CacheService.invalidate('product-list');
        CacheService.invalidate(`product-${this.id}`);
    }
}
```

### 6. Webhooks/External Notifications

```typescript
export class Order extends BaseEntity {
    @PropertyName('Status', String)
    status!: string;
    
    private previousStatus?: string;
    
    protected beforeSave(): void {
        // Guardar estado anterior
        this.previousStatus = this.status;
    }
    
    protected async afterSave(): Promise<void> {
        // Si cambió el status, notificar
        if (this.previousStatus !== this.status) {
            await this.notifyStatusChange();
        }
    }
    
    private async notifyStatusChange(): Promise<void> {
        // Enviar webhook
        await Application.axiosInstance.post('/webhooks/order-status-changed', {
            orderId: this.id,
            oldStatus: this.previousStatus,
            newStatus: this.status,
            timestamp: new Date()
        });
        
        // Enviar email al cliente
        if (this.status === 'shipped') {
            await EmailService.sendOrderShipped(this);
        }
    }
}
```

### 7.  Confirmación Antes de Eliminar

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    protected beforeDelete(): void {
        // Pedir confirmación al usuario
        const confirmed = confirm(
            `Are you sure you want to delete "${this.name}"? This action cannot be undone.`
        );
        
        if (!confirmed) {
            throw new Error('Delete cancelled by user');
        }
    }
}

// Al llamar delete(), si usuario cancela:
await product.delete();
// → beforeDelete() ejecuta
// → Muestra confirm() dialog
// → Si usuario cancela → throw Error
// → delete() no procede (no hace HTTP request)
```

### 8. Logging/Auditing

```typescript
export class BaseEntity {
    protected beforeSave(): void {
        // Log en consola (desarrollo)
        console.log(`[beforeSave] ${this.constructor.name}`, this.toDictionary());
    }
    
    protected afterSave(): void {
        // Log en servidor (producción)
        if (import.meta.env.PROD) {
            AuditService.log({
                action: this.id ? 'update' : 'create',
                entityType: this.constructor.name,
                entityId: this.id,
                userId: Application.currentUser?.id,
                timestamp: new Date(),
                data: this.toDictionary()
            });
        }
    }
    
    protected afterDelete(): void {
        // Log eliminación
        AuditService.log({
            action: 'delete',
            entityType: this.constructor.name,
            entityId: this.id,
            userId: Application.currentUser?.id,
            timestamp: new Date()
        });
    }
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Hooks son Síncronos (excepto afterSave custom)

```typescript
// ✅ CORRECTO: Síncrono
protected beforeSave(): void {
    this.name = this.name.toUpperCase();
}

// ❌ NO USAR async en hook base
protected async beforeSave(): Promise<void> {
    await someAsyncOperation();  // ← No se esperará
}

// ✅ SI necesitas async, llamar desde otro lugar:
protected beforeSave(): void {
    // Lógica síncrona aquí
}

async customPreSaveLogic(): Promise<void> {
    // Lógica asíncrona aquí
    await someAsyncOperation();
}

// Y usar:
await order.customPreSaveLogic();
await order.save();
```

### 2. No Llamar save() dentro de beforeSave()

```typescript
// ❌ INCORRECTO: Loop infinito
protected beforeSave(): void {
    this.updatedAt = new Date();
    await this.save();  // ← Loop infinito
}

// ✅ CORRECTO: Solo modificar propiedades
protected beforeSave(): void {
    this.updatedAt = new Date();
}
```

### 3. Excepciones en Hooks Cancelan Operación

```typescript
protected beforeSave(): void {
    if (this.price < 0) {
        throw new Error('Price cannot be negative');
    }
}

// Al llamar save():
await product.save();
// → beforeSave() ejecuta
// → throw Error
// → save() no procede (no valida, no hace HTTP request)
// → Error se propaga al caller
```

### 4. afterSave/afterDelete Ejecutan Solo Si Éxito

```typescript
protected afterSave(): void {
    console.log('Saved!');
}

await product.save();
// → Si HTTP request falla → afterSave() NO ejecuta
// → Si HTTP request éxito → afterSave() ejecuta
```

### 5. Herencia de Hooks

```typescript
class BaseAuditEntity extends BaseEntity {
    protected beforeSave(): void {
        this.updatedAt = new Date();
    }
}

class Product extends BaseAuditEntity {
    protected beforeSave(): void {
        super.beforeSave();  // ← Llamar hook del padre
        
        // Lógica adicional
        this.sku = this.sku.toUpperCase();
    }
}
```

---

## 🔧 Implementación Interna

### Código de los Hooks

```typescript
// BaseEntity default implementations (vacías)
protected beforeSave(): void {
    // Override en subclases
}

protected afterSave(): void {
    // Override en subclases
}

protected beforeDelete(): void {
    // Override en subclases
}

protected afterDelete(): void {
    // Override en subclases
}

public onValidated(): void {
    // Override en subclases
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~860-920, onValidated en línea 953)

---

## 📊 Diagrama de Flujo Completo

### save() con Hooks

```
Usuario llama entity.save()
        ↓
┌───────────────────────────┐
│   beforeSave()            │  ← Hook 1
└───────────┬───────────────┘
            ↓
┌───────────────────────────┐
│   validateInputs()        │
└───────────┬───────────────┘
            ↓
     ¿Validación OK?
         ├─ NO → Retorna entity con errores
         └─ SÍ ↓
┌───────────────────────────┐
│   toDictionary()          │  (Serializar)
└───────────┬───────────────┘
            ↓
┌───────────────────────────┐
│   HTTP Request            │  (POST/PUT)
│   (POST/PUT)              │
└───────────┬───────────────┘
            ↓
     ¿Request exitoso?
         ├─ NO → Muestra error, retorna entity
         └─ SÍ ↓
┌───────────────────────────┐
│   Object.assign(response) │  (Actualizar entity)
└───────────┬───────────────┘
            ↓
┌───────────────────────────┐
│   afterSave()             │  ← Hook 2
└───────────┬───────────────┘
            ↓
┌───────────────────────────┐
│   Toast de éxito          │
└───────────┬───────────────┘
            ↓
        Retorna entity actualizado
```

### delete() con Hooks

```
Usuario llama entity.delete()
        ↓
┌───────────────────────────┐
│   beforeDelete()          │  ← Hook 1
└───────────┬───────────────┘
            ↓
     ¿Tiene ID?
         ├─ NO → throw Error
         └─ SÍ ↓
┌───────────────────────────┐
│   HTTP DELETE Request     │
└───────────┬───────────────┘
            ↓
     ¿Request exitoso?
         ├─ NO → Muestra error, retorna false
         └─ SÍ ↓
┌───────────────────────────┐
│   afterDelete()           │  ← Hook 2
└───────────┬───────────────┘
            ↓
┌───────────────────────────┐
│   Toast de éxito          │
└───────────┬───────────────┘
            ↓
        Retorna true
```

---

## 📚 Referencias Adicionales

- `crud-operations.md` - Métodos save() y delete()
- `validation-system.md` - validateInputs()
- `base-entity-core.md` - Arquitectura de BaseEntity
- `../../02-FLOW-ARCHITECTURE.md` - Flujos completos del sistema
- `../../tutorials/05-advanced-patterns.md` - Patrones con hooks

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/entities/base_entitiy.ts`  
**Líneas relevantes:** 860-920 (Lifecycle hooks)
