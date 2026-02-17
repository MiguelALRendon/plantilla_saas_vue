# BaseEntity: Lifecycle Hooks

## 1. Propósito

Los lifecycle hooks (ganchos del ciclo de vida) son métodos que se ejecutan automáticamente en momentos específicos del ciclo de vida de una entidad durante operaciones CRUD. Permiten ejecutar lógica custom antes y después de operaciones críticas (save, delete, validación) sin modificar los métodos principales. Los hooks disponibles son: beforeSave() que ejecuta pre-validación, afterSave() que ejecuta post-persistencia exitosa, beforeDelete() que ejecuta pre-eliminación, afterDelete() que ejecuta post-eliminación exitosa, y onValidated() que ejecuta post-validación completa. Estos mecanismos permiten implementar patrones como revisión automática, soft deletes, normalización de datos, cache invalidation, y notificaciones externas de forma declarativa sin alterar la lógica CRUD base.

## 2. Alcance

**Responsabilidades cubiertas:**
- beforeSave(): Hook ejecutado inmediatamente antes de validateInputs() en save()
- afterSave(): Hook ejecutado después de HTTP request exitoso y actualización de entidad
- beforeDelete(): Hook ejecutado inmediatamente antes de HTTP DELETE request
- afterDelete(): Hook ejecutado después de HTTP DELETE request exitoso
- onValidated(): Hook ejecutado después de completar validaciones síncronas y asíncronas
- Integración automática en flujo CRUD sin necesidad de invocación explícita
- Soporte para herencia de hooks mediante super.hookName() en subclases
- Mecanismo de cancelación de operaciones mediante throw Error en hooks before*

**Límites del alcance:**
- Hooks son síncronos por defecto (no async), excepto implementaciones custom en afterSave
- No proveen rollback automático si afterSave/afterDelete fallan (operación HTTP ya completada)
- No implementan retry logic si hook falla (responsabilidad del desarrollador)
- No ejecutan en operaciones de lectura (getElement, getElementList)
- No proveen hooks granulares por propiedad (solo nivel entidad completa)
- onValidated() depende de Application.View.value para isValid, no es independiente

## 3. Definiciones Clave

**beforeSave():** Hook public ejecutado inmediatamente antes de validateInputs() en save(). Permite normalizar datos, calcular campos derivados, generar defaults, o validar pre-condiciones business logic. Si lanza excepción, aborta save() sin ejecutar validaciones ni HTTP request.

**afterSave():** Hook public ejecutado después de que HTTP request (POST/PUT) sea exitoso y después de actualizar entidad con response.data. Permite invalidar cachés, emitir eventos custom, sincronizar sistemas externos, o ejecutar operaciones en cascada. Solo ejecuta si request HTTP fue exitoso.

**beforeDelete():** Hook public ejecutado inmediatamente antes de HTTP DELETE request. Permite validar condiciones de eliminación (ejemplo: verificar no tiene dependencias), logging/auditing, o cancelar eliminación mediante throw Error. Si lanza excepción, aborta delete() sin hacer request HTTP.

**afterDelete():** Hook public ejecutado después de que HTTP DELETE request sea exitoso. Permite invalidar cachés, limpiar datos relacionados, emitir eventos, o logging/auditing. Solo ejecuta si request HTTP fue exitoso (status 200-299).

**onValidated():** Hook public ejecutado después de que todas las validaciones (síncronas y asíncronas) completen, después de esperar 50ms para procesamiento de resultados, y antes de ocultar loading menu. Permite ejecutar lógica post-validación, actualizar UI, o emitir eventos custom de validación completa.

**public vs Public:** Hooks beforeSave, afterSave, beforeDelete, afterDelete son public (solo accesibles desde subclases). onValidated es public (accesible desde cualquier código). Esta distinción protege integridad de flujo CRUD.

**Cancelación mediante throw Error:** Lanzar excepción dentro de beforeSave() o beforeDelete() cancela la operación completa, impidiendo ejecución de validaciones y HTTP request. La excepción se propaga al caller para manejo.

**Post-success execution:** afterSave() y afterDelete() solo ejecutan SI el HTTP request fue exitoso (status 200-299). Si request falla (4xx, 5xx, network error), estos hooks NO ejecutan.

**Herencia de hooks:** Subclases pueden override hooks y llamar super.hookName() para ejecutar lógica del padre antes o después de lógica custom. Orden de ejecución: BaseEntity → ParentClass → CurrentClass.

**Default implementations:** BaseEntity define todos los hooks como métodos vacíos (no-op). Subclases hacen override solo de los hooks que necesitan, sin obligación de implementarlos todos.

## 4. Descripción Técnica

### Firma de Métodos

```typescript
// Hooks CRUD
public beforeSave(): void
public afterSave(): void
public beforeDelete(): void
public afterDelete(): void

// Hook de validación
public onValidated(): void
```

Todos los hooks tienen implementación default vacía (no-op) en BaseEntity. Subclases hacen override según necesidad.

**Ubicación en código:** src/entities/base_entity.ts (líneas 860-920 para hooks CRUD, línea 953 para onValidated)

### beforeSave() - Implementación

Ejecutado en primera línea de save() antes de validaciones o HTTP request:

```typescript
public async save(): Promise<this> {
    // beforeSave ejecuta AQUÍ
    this.beforeSave();
    
    // Validar
    if (!await this.validateInputs()) {
        return this;
    }
    
    // ... HTTP request ...
}
```

**Ubicación:** Línea ~715

Ejemplo de normalización y defaults:

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('SKU', String)
    sku?: string;
    
    public beforeSave(): void {
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
// → Validaciones y POST /api/products
```

### afterSave() - Implementación

Ejecutado después de HTTP request exitoso y actualización de entidad con response:

```typescript
public async save(): Promise<this> {
    // ...  HTTP request exitoso ...
    
    // Actualizar entidad
    Object.assign(this, response.data);
    
    // afterSave ejecuta AQUÍ
    this.afterSave();
    
    // Toast de éxito
    Application.showToast('Saved successfully', 'success');
    
    return this;
}
```

**Ubicación:** Línea ~770

Ejemplo de cache invalidation y eventos:

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    public afterSave(): void {
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
// → HTTP POST exitoso
// → Entity actualizada
// → afterSave() ejecuta
// → Console log, caché invalidado, evento emitido
```

### beforeDelete() - Implementación

Ejecutado inmediatamente antes de HTTP DELETE request:

```typescript
public async delete(): Promise<void> {
    // beforeDelete ejecuta AQUÍ
    this.beforeDelete();
    
    // Verificar ID
    const pkValue = this.getPrimaryPropertyValue();
    if (!pkValue) {
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Error',
            'Cannot delete without ID'
        );
        return;  // Early return
    }
    
    // ... HTTP DELETE ...
}
```

**Ubicación:** Línea ~795

Ejemplo de validación de dependencias:

```typescript
export class Category extends BaseEntity {
    @PropertyName('Category Name', String)
    name!: string;
    
    @PropertyName('Products', Array)
    @ArrayOf(Product)
    products!: Product[];
    
    public beforeDelete(): void {
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

### afterDelete() - Implementación

Ejecutado después de HTTP DELETE request exitoso:

```typescript
public async delete(): Promise<void> {
    // ... beforeDelete, HTTP DELETE exitoso ...
    
    // afterDelete ejecuta AQUÍ
    this.afterDelete();
    
    // Toast de éxito
    Application.showToast('Deleted successfully', 'success');
    
    return true;
}
```

**Ubicación:** Línea ~825

Ejemplo de cleanup y eventos:

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    public afterDelete(): void {
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
// → DELETE /api/products/42 exitoso
// → afterDelete() ejecuta
// → Console log, caché invalidado, evento emitido
```

### onValidated() - Implementación

Ejecutado después de completar todas las validaciones:

```typescript
public async validateInputs(): Promise<boolean> {
    // ... validaciones síncronas ...
    
    // Validaciones asíncronas
    await Promise.all(asyncValidationPromises);
    
    // Esperar procesamiento
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // onValidated ejecuta AQUÍ
    this.onValidated();
    
    Application.ApplicationUIService.hideLoadingMenu();
    
    return Application.View.value.isValid;
}
```

**Ubicación:** Llamada en línea 585, definición en línea 953

Ejemplo de eventos post-validación:

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
// → Validaciones síncronas y asíncronas
// → onValidated() ejecuta
// → Console log y evento emitido
```

## 5. Flujo de Funcionamiento

### Flujo de save() con Hooks

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
│   toObject()              │  (Serializar)
└───────────┬───────────────┘
            ↓
┌───────────────────────────┐
│   HTTP Request (POST/PUT) │
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

### Flujo de delete() con Hooks

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

### Flujo de validateInputs() con onValidated

```
validateInputs() llamado
        ↓
Validaciones síncronas
        ↓
Validaciones asíncronas (Promise.all)
        ↓
Esperar 50ms para procesamiento
        ↓
┌───────────────────────────┐
│   onValidated()           │  ← Hook
└───────────┬───────────────┘
            ↓
Application.ApplicationUIService.hideLoadingMenu()
        ↓
Retorna isValid
```

## 6. Reglas Obligatorias

**Regla 1:** beforeSave() DEBE ejecutarse como primera operación en save(), antes de validateInputs() y HTTP request. Este orden no puede alterarse.

**Regla 2:** afterSave() SOLO DEBE ejecutarse si HTTP request fue exitoso (status 200-299) y después de actualizar entidad con response.data.

**Regla 3:** beforeDelete() DEBE ejecutarse antes de HTTP DELETE request. Si lanza excepción, delete() DEBE abortar sin hacer request.

**Regla 4:** afterDelete() SOLO DEBE ejecutarse si HTTP DELETE request fue exitoso. No ejecuta en caso de error HTTP.

**Regla 5:** onValidated() DEBE ejecutarse después de esperar 50ms tras completar Promise.all() de validaciones asíncronas.

**Regla 6:** Excepciones lanzadas en beforeSave() o beforeDelete() DEBEN propagarse al caller y abortar operación completa.

**Regla 7:** Hooks son métodos public (beforeSave, afterSave, beforeDelete, afterDelete) excepto onValidated que es public. Esta visibilidad no debe alterarse.

**Regla 8:** Default implementations en BaseEntity DEBEN ser métodos vacíos (no-op) para permitir override opcional en subclases.

**Regla 9:** Subclases que hacen override de hooks DEBEN considerar llamar super.hookName() si extienden clase que también override el hook.

**Regla 10:** Hooks NO DEBEN modificar el valor de retorno de métodos CRUD (save retorna this, delete retorna boolean).

## 7. Prohibiciones

**Prohibido:** Llamar save() recursivamente dentro de beforeSave() o afterSave(). Esto genera loop infinito.

**Prohibido:** Llamar delete() recursivamente dentro de beforeDelete() o afterDelete(). Esto genera loop infinito.

**Prohibido:** Declarar hooks como async (async beforeSave(), async beforeDelete()). Los hooks son síncronos por diseño.

**Prohibido:** Modificar el flujo de save()/delete() para omitir ejecución de hooks. Los hooks son parte integral del ciclo de vida.

**Prohibido:** Ejecutar operaciones HTTP largas (> 100ms) en hooks síncronos. Degrada performance y bloquea UI.

**Prohibido:** Hacer override de onValidated() sin considerar Application.View.value.isValid. Este estado es necesario para UI.

**Prohibido:** Ignorar errores lanzados desde beforeSave() o beforeDelete(). Deben manejarse o propagarse al caller.

**Prohibido:** Ejecutar afterSave() o afterDelete() manualmente desde código externo. Solo deben ejecutarse dentro de flujo CRUD.

**Prohibido:** Modificar primaryProperty value en afterSave(). La entidad ya fue persistida y cambiar ID causa inconsistencia.

**Prohibido:** Asumir que afterSave()/afterDelete() siempre ejecutarán. Solo ejecutan si HTTP request fue exitoso.

## 8. Dependencias

**BaseEntity Core:**
- save(): Método que invoca beforeSave() y afterSave()
- delete(): Método que invoca beforeDelete() y afterDelete()
- validateInputs(): Método que invoca onValidated()
- toObject(): Para serialización en save()
- getPrimaryPropertyValue(): Para verificar ID en delete()

**Application Singleton:**
- Application.eventBus: Para emitir eventos custom en hooks
- Application.showToast(): Para mostrar mensajes post-operación
- Application.ApplicationUIService.hideLoadingMenu(): En onValidated()
- Application.View.value.isValid: Para verificar resultado de validación
- Application.axiosInstance: Para HTTP requests en save()/delete()

**Validation System:**
- validateInputs(): Ejecutado después de beforeSave() en flujo save()
- validationErrors: Accesible desde hooks para verificar errores de validación

**TypeScript:**
- public visibility: Para hooks CRUD (beforeSave, afterSave, beforeDelete, afterDelete)
- Public visibility: Para onValidated()
- Void return type: Todos los hooks retornan void

**Herencia:**
- super.hookName(): Para llamar implementación de hook en clase padre
- Override mechanism: Para implementar hooks custom en subclases

## 9. Relaciones

**Relación con CRUD Operations (N:1):**
Cada operación save() y delete() invoca múltiples hooks (before/after) en secuencia definida. Los hooks dependen de estos métodos para su ejecución pero no pueden existir independientemente.

**Relación con Validation System (1:1):**
beforeSave() ejecuta ANTES de validateInputs(). onValidated() ejecuta DESPUÉS de validateInputs(). Orden es estrictamente secuencial y no paralelo.

**Relación con EventBus (N:1):**
Hooks típicamente emiten eventos al Application.eventBus para notificar operaciones completadas. Múltiples hooks pueden emitir a mismo eventBus.

**Relación con Inheritance (1:N):**
BaseEntity define hooks base vacíos. Múltiples subclases pueden override hooks y llamar super.hookName() para mantener lógica del padre.

**Relación con HTTP Layer (1:1):**
afterSave() y afterDelete() tienen relación directa con éxito/fallo de HTTP request. Solo ejecutan si request HTTP fue exitoso.

**Relación con UI Services (N:1):**
Hooks acceden a Application.ApplicationUIService para operaciones UI como hideLoadingMenu(), showToast(), openDialog().

**Relación con Cache Services (N:1):**
Hooks post-operación (afterSave, afterDelete) típicamente invalidan cachés. Múltiples entidades pueden acceder al mismo cache service.

### Hooks Adicionales de Operaciones CRUD

Además de los hooks principales documentados arriba, BaseEntity define hooks adicionales para casos específicos de CRUD operations:

#### onSaving(): void

**Ubicación:** src/entities/base_entity.ts línea 896  
**Ejecutado:** En create() método antes del HTTP POST request  
**Propósito:** Hook específico para operaciones de creación (POST), ejecutado después de beforeSave() y validateInputs()

```typescript
public async create(): Promise<this> {
    this.onSaving();  // ← Ejecuta aquí
    
    const response = await Application.axiosInstance.post(endpoint, this.toObject());
    Object.assign(this, response.data);
    return this;
}
```

**Uso example:**
```typescript
export class Product extends BaseEntity {
    public onSaving(): void {
        console.log('Creating new product...');
        // Lógica específica para creación
    }
}
```

#### saveFailed(): void

**Ubicación:** src/entities/base_entity.ts línea 902  
**Ejecutado:** En create() cuando HTTP POST request falla  
**Propósito:** Permite ejecutar lógica cuando una operación de creación falla

```typescript
public async create(): Promise<this> {
    try {
        this.onSaving();
        const response = await Application.axiosInstance.post(endpoint, this.toObject());
        Object.assign(this, response.data);
    } catch (error) {
        this.saveFailed();  // ← Ejecuta aquí en error
        throw error;
    }
}
```

**Uso example:**
```typescript
export class Product extends BaseEntity {
    public saveFailed(): void {
        console.error('Failed to create product');
        Application.showToast('Failed to save product', 'error');
    }
}
```

#### onUpdating(): void

**Ubicación:** src/entities/base_entity.ts línea 909  
**Ejecutado:** En update() método antes del HTTP PUT request  
**Propósito:** Hook específico para operaciones de actualización (PUT), ejecutado después de beforeSave() y validateInputs()

```typescript
public async update(): Promise<this> {
    this.onUpdating();  // ← Ejecuta aquí
    
    const primaryValue = this.getPrimaryPropertyValue();
    const response = await Application.axiosInstance.put(
        `${endpoint}/${primaryValue}`,
        this.toObject()
    );
    Object.assign(this, response.data);
    return this;
}
```

**Uso example:**
```typescript
export class Product extends BaseEntity {
    public onUpdating(): void {
        this.updatedAt = new Date();
        console.log('Updating existing product...');
    }
}
```

#### updateFailed(): void

**Ubicación:** src/entities/base_entity.ts línea 915  
**Ejecutado:** En update() cuando HTTP PUT request falla  
**Propósito:** Permite ejecutar lógica cuando una operación de actualización falla

```typescript
public async update(): Promise<this> {
    try {
        this.onUpdating();
        const primaryValue = this.getPrimaryPropertyValue();
        const response = await Application.axiosInstance.put(
            `${endpoint}/${primaryValue}`,
            this.toObject()
        );
        Object.assign(this, response.data);
    } catch (error) {
        this.updateFailed();  // ← Ejecuta aquí en error
        throw error;
    }
}
```

**Uso example:**
```typescript
export class Product extends BaseEntity {
    public updateFailed(): void {
        console.error('Failed to update product');
        Application.showToast('Failed to update product', 'error');
    }
}
```

#### onDeleting(): void

**Ubicación:** src/entities/base_entity.ts línea 922  
**Ejecutado:** En delete() después de beforeDelete() y antes del HTTP DELETE request  
**Propósito:** Hook adicional antes de eliminación, ejecutado después de beforeDelete()

```typescript
public async delete(): Promise<boolean> {
    this.beforeDelete();
    this.onDeleting();  // ← Ejecuta aquí
    
    const primaryValue = this.getPrimaryPropertyValue();
    await Application.axiosInstance.delete(`${endpoint}/${primaryValue}`);
    
    return true;
}
```

#### deleteFailed(): void

**Ubicación:** src/entities/base_entity.ts línea 928  
**Ejecutado:** En delete() cuando HTTP DELETE request falla  
**Propósito:** Permite ejecutar lógica cuando una operación de eliminación falla

```typescript
public async delete(): Promise<boolean> {
    try {
        this.beforeDelete();
        this.onDeleting();
        const primaryValue = this.getPrimaryPropertyValue();
        await Application.axiosInstance.delete(`${endpoint}/${primaryValue}`);
    } catch (error) {
        this.deleteFailed();  // ← Ejecuta aquí en error
        throw error;
    }
}
```

#### afterGetElement(): void

**Ubicación:** src/entities/base_entity.ts línea 932  
**Ejecutado:** En getElement() static method después de HTTP GET exitoso  
**Propósito:** Permite ejecutar lógica después de cargar una entidad individual desde el servidor

```typescript
public static async getElement<T extends BaseEntity>(
    this: new () => T,
    id: any
): Promise<T> {
    const endpoint = (this as any).getApiEndpoint();
    const response = await Application.axiosInstance.get(`${endpoint}/${id}`);
    
    const instance = new this();
    Object.assign(instance, response.data);
    
    (instance as any).afterGetElement();  // ← Ejecuta aquí
    
    return instance;
}
```

**Uso example:**
```typescript
export class Product extends BaseEntity {
    public afterGetElement(): void {
        console.log(`Product ${this.id} loaded from server`);
        this.trackChanges(); // Iniciar tracking de cambios
    }
}
```

#### getElementFailed(): void

**Ubicación:** src/entities/base_entity.ts línea 935  
**Ejecutado:** En getElement() cuando HTTP GET request falla  
**Propósito:** Permite ejecutar lógica cuando falla cargar una entidad individual

```typescript
public static async getElement<T extends BaseEntity>(
    this: new () => T,
    id: any
): Promise<T> {
    try {
        const endpoint = (this as any).getApiEndpoint();
        const response = await Application.axiosInstance.get(`${endpoint}/${id}`);
        
        const instance = new this();
        Object.assign(instance, response.data);
        (instance as any).afterGetElement();
        
        return instance;
    } catch (error) {
        const tempInstance = new this();
        (tempInstance as any).getElementFailed();  // ← Ejecuta aquí en error
        throw error;
    }
}
```

#### afterGetElementList(): void

**Ubicación:** src/entities/base_entity.ts línea 694  
**Ejecutado:** En getElementList() static method después de HTTP GET exitoso  
**Propósito:** Permite ejecutar lógica después de cargar lista de entidades desde el servidor

```typescript
public static async getElementList<T extends BaseEntity>(
    this: new () => T
): Promise<T[]> {
    const endpoint = (this as any).getApiEndpoint();
    const response = await Application.axiosInstance.get(endpoint);
    
    const instances = response.data.map((item: any) => {
        const instance = new this();
        Object.assign(instance, item);
        return instance;
    });
    
    if (instances.length > 0) {
        (instances[0] as any).afterGetElementList();  // ← Ejecuta en primera instancia
    }
    
    return instances;
}
```

**Uso example:**
```typescript
export class Product extends BaseEntity {
    public afterGetElementList(): void {
        console.log('Products list loaded from server');
        // Lógica post-carga de lista
    }
}
```

#### getElementListFailed(): void

**Ubicación:** src/entities/base_entity.ts línea 699  
**Ejecutado:** En getElementList() cuando HTTP GET request falla  
**Propósito:** Permite ejecutar lógica cuando falla cargar lista de entidades

```typescript
public static async getElementList<T extends BaseEntity>(
    this: new () => T
): Promise<T[]> {
    try {
        const endpoint = (this as any).getApiEndpoint();
        const response = await Application.axiosInstance.get(endpoint);
        
        const instances = response.data.map((item: any) => {
            const instance = new this();
            Object.assign(instance, item);
            return instance;
        });
        
        if (instances.length > 0) {
            (instances[0] as any).afterGetElementList();
        }
        
        return instances;
    } catch (error) {
        const tempInstance = new this();
        (tempInstance as any).getElementListFailed();  // ← Ejecuta aquí en error
        throw error;
    }
}
```

#### afterRefresh(): void

**Ubicación:** src/entities/base_entity.ts línea 866  
**Ejecutado:** En refresh() method después de HTTP GET exitoso  
**Propósito:** Permite ejecutar lógica después de recargar entidad actual desde el servidor

```typescript
public async refresh(): Promise<void> {
    const primaryValue = this.getPrimaryPropertyValue();
    const endpoint = (this.constructor as typeof BaseEntity).getApiEndpoint();
    
    const response = await Application.axiosInstance.get(
        `${endpoint}/${primaryValue}`
    );
    
    Object.assign(this, response.data);
    this.afterRefresh();  // ← Ejecuta aquí
}
```

**Uso example:**
```typescript
export class Product extends BaseEntity {
    public afterRefresh(): void {
        console.log('Product data refreshed from server');
        this.trackChanges(); // Reiniciar tracking después de refresh
    }
}
```

#### refreshFailed(): void

**Ubicación:** src/entities/base_entity.ts línea 869  
**Ejecutado:** En refresh() cuando HTTP GET request falla  
**Propósito:** Permite ejecutar lógica cuando falla refrescar una entidad

```typescript
public async refresh(): Promise<void> {
    try {
        const primaryValue = this.getPrimaryPropertyValue();
        const endpoint = (this.constructor as typeof BaseEntity).getApiEndpoint();
        
        const response = await Application.axiosInstance.get(
            `${endpoint}/${primaryValue}`
        );
        
        Object.assign(this, response.data);
        this.afterRefresh();
    } catch (error) {
        this.refreshFailed();  // ← Ejecuta aquí en error
        throw error;
    }
}
```

**Uso example:**
```typescript
export class Product extends BaseEntity {
    public refreshFailed(): void {
        console.error('Failed to refresh product data');
        Application.showToast('Failed to refresh data', 'error');
    }
}
```

## 10. Notas de Implementación

### Ejemplo 1: Timestamps Automáticos

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
    
    public beforeSave(): void {
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
// → createdAt = ahora, createdBy = "john_doe"
// → updatedAt = ahora, updatedBy = "john_doe"
```

### Ejemplo 2: Soft Delete

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
    async delete(): Promise<void> {
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
    }
    
    // Método para hard delete
    async hardDelete(): Promise<void> {
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

### Ejemplo 3: Validación en beforeSave

```typescript
export class Order extends BaseEntity {
    @PropertyName('Items', Array)
    @ArrayOf(OrderItem)
    items!: OrderItem[];
    
    @PropertyName('Status', String)
    status!: string;
    
    @PropertyName('Total', Number)
    @ReadOnly(true)
    total!: number;
    
    public beforeSave(): void {
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
}
```

### Ejemplo 4: Cascading Save en afterSave

```typescript
export class Order extends BaseEntity {
    @PropertyName('Items', Array)
    @ArrayOf(OrderItem)
    items!: OrderItem[];
    
    public async afterSave(): Promise<void> {
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

### Ejemplo 5: Cache Invalidation

```typescript
export class Product extends BaseEntity {
    public afterSave(): void {
        // Invalidar cachés relacionados
        CacheService.invalidate('products');
        CacheService.invalidate('product-list');
        CacheService.invalidate(`product-${this.id}`);
        
        // Si tiene categoría, invalidar caché de categoría
        if (this.category) {
            CacheService.invalidate(`category-${this.category.id}-products`);
        }
    }
    
    public afterDelete(): void {
        // Invalidar cachés al eliminar
        CacheService.invalidate('products');
        CacheService.invalidate('product-list');
        CacheService.invalidate(`product-${this.id}`);
    }
}
```

### Ejemplo 6: Webhooks y Notificaciones

```typescript
export class Order extends BaseEntity {
    @PropertyName('Status', String)
    status!: string;
    
    private previousStatus?: string;
    
    public beforeSave(): void {
        // Guardar estado anterior
        this.previousStatus = this.status;
    }
    
    public async afterSave(): Promise<void> {
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

### Ejemplo 7: Confirmación Antes de Eliminar

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    public beforeDelete(): void {
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

### Ejemplo 8: Logging y Auditing

```typescript
export class BaseEntity {
    public beforeSave(): void {
        // Log en consola (desarrollo)
        console.log(`[beforeSave] ${this.constructor.name}`, this.toObject());
    }
    
    public afterSave(): void {
        // Log en servidor (producción)
        if (import.meta.env.PROD) {
            AuditService.log({
                action: this.id ? 'update' : 'create',
                entityType: this.constructor.name,
                entityId: this.id,
                userId: Application.currentUser?.id,
                timestamp: new Date(),
                data: this.toObject()
            });
        }
    }
    
    public afterDelete(): void {
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

### Consideración 1: Hooks son Síncronos

```typescript
// CORRECTO: Síncrono
public beforeSave(): void {
    this.name = this.name.toUpperCase();
}

// INCORRECTO: No usar async en hook base
public async beforeSave(): Promise<void> {
    await someAsyncOperation();  // ← No se esperará
}

// SOLUCIÓN: Crear método async separado
public beforeSave(): void {
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

### Consideración 2: No Llamar save() dentro de beforeSave()

```typescript
// INCORRECTO: Loop infinito
public beforeSave(): void {
    this.updatedAt = new Date();
    await this.save();  // ← Loop infinito
}

// CORRECTO: Solo modificar propiedades
public beforeSave(): void {
    this.updatedAt = new Date();
}
```

### Consideración 3: Excepciones Cancelan Operación

```typescript
public beforeSave(): void {
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

### Consideración 4: Hooks Solo Ejecutan en Éxito

```typescript
public afterSave(): void {
    console.log('Saved!');
}

await product.save();
// → Si HTTP request falla → afterSave() NO ejecuta
// → Si HTTP request éxito → afterSave() ejecuta
```

### Consideración 5: Herencia de Hooks

```typescript
class BaseAuditEntity extends BaseEntity {
    public beforeSave(): void {
        this.updatedAt = new Date();
    }
}

class Product extends BaseAuditEntity {
    public beforeSave(): void {
        super.beforeSave();  // ← Llamar hook del padre
        
        // Lógica adicional
        this.sku = this.sku.toUpperCase();
    }
}
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- crud-operations.md: Implementación de save() y delete() que invocan hooks
- validation-system.md: validateInputs() ejecutado en flujo save() después de beforeSave()
- base-entity-core.md: Arquitectura general de BaseEntity y estructura de clase

**Archivos fuente:**
- src/entities/base_entity.ts: Implementación completa de todos los hooks

**Líneas relevantes en código:**
- Línea 715: beforeSave() invocado en save()
- Línea 770: afterSave() invocado en save()
- Línea 795: beforeDelete() invocado en delete()
- Línea 825: afterDelete() invocado en delete()
- Línea 585: onValidated() invocado en validateInputs()
- Líneas 860-920: Definiciones default de hooks CRUD
- Línea 953: Definición default de onValidated()

**Última actualización:** 11 de Febrero, 2026
