# ApiMethods Decorator

## 1. Propósito

El decorator ApiMethods especifica qué métodos HTTP están permitidos para operaciones CRUD de una entidad BaseEntity, proporcionando control granular sobre capacidades de manipulación de datos a nivel de clase. Almacena array de métodos HTTP válidos (GET, POST, PUT, PATCH, DELETE) en prototype de clase como metadata accesible a través de getApiMethods() y isMethodAllowed(method). BaseEntity consulta esta metadata antes de ejecutar save(), delete(), getElementList() para verificar si método HTTP correspondiente está permitido, bloqueando operaciones no autorizadas y mostrando error al usuario. Sin decorator, ALL methods están permitidos por defecto. Casos de uso: entidades read-only con solo GET (reports, audit logs consultables), append-only logs con GET y POST (sin UPDATE/DELETE), prevenir eliminación física usando solo GET/POST/PUT (forzar soft delete pattern), PATCH incremental en lugar de PUT completo, restricciones según ambiente (DELETE solo en development). Critical para implementar restricciones de operaciones a nivel frontend, aunque backend DEBE implementar validaciones equivalentes.

## 2. Alcance

**Responsabilidades cubiertas:**
- Definir array de strings representando HTTP methods permitidos en clase entity
- Almacenar methods como Symbol metadata en prototype de clase decorada
- Normalizar methods a uppercase (GET, POST, PUT, PATCH, DELETE) eliminando case sensitivity
- Validar que methods sean válidos (solo GET/POST/PUT/PATCH/DELETE), filtrando inválidos silenciosamente
- Soportar sintaxis array (['GET', 'POST']) y string separado por comas ('GET,POST,PUT')
- Proveer getApiMethods() que retorna string[] o undefined (undefined = all methods permitidos)
- Proveer isMethodAllowed(method) que verifica si method específico está en array permitido
- Bloquear operaciones CRUD cuando método HTTP requerido NO está permitido (save POST/PUT, delete DELETE, getElementList GET)
- Mostrar error toast/console.warn cuando operación bloqueada por ApiMethods

**Límites del alcance:**
- Decorator NO valida que backend tenga mismo control (developer responsable de implementar validación server-side)
- NO modifica comportamiento de axios instance (interceptors, timeout, headers)
- NO cambia formato de request/response (JSON serialization manejada por toDictionary)
- isMethodAllowed() retorna boolean, NO throw exception (caller decide acción)
- Validación es frontend-only, NO securiza backend (backend DEBE implementar same restrictions)
- NO soporta métodos HTTP custom o no estándar (solo GET/POST/PUT/PATCH/DELETE)
- NO permite métodos condicionales dinámicos en runtime (metadata fijada en decoration time)
- Si decorator NO aplicado, getApiMethods() retorna undefined interpretado como ALL methods permitidos
- Override de save/delete puede ignorar isMethodAllowed() si no llama super.save/super.delete (responsabilidad de developer)

## 3. Definiciones Clave

**API_METHODS_METADATA Symbol:** Identificador único usado como property key en prototype para almacenar array de HTTP methods. Evita colisiones con propiedades normales. Definido como `export const API_METHODS_METADATA = Symbol('apiMethods')`.

**HttpMethod Enum:** Enumeración de métodos HTTP válidos. Valores: GET, POST, PUT, PATCH, DELETE. Usado para type safety en TypeScript.

```typescript
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}
```

**Decorator Signature:** `function ApiMethods(methods: HttpMethod[]): ClassDecorator`. Acepta ÚNICAMENTE array de tipo HttpMethod ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'), NO acepta strings genéricos ni strings separados por comas.

**Type Safety:** TypeScript valida en compile-time que solo métodos HTTP válidos se pasen. Ejemplo válido: `@ApiMethods(['GET', 'POST'])`. Ejemplo inválido: `@ApiMethods(['get', 'INVALID'])` → error de compilación.

**getApiMethods() Accessor:** Método estático en BaseEntity que retorna `this.prototype[API_METHODS_METADATA]` (string[] o undefined). undefined significa NO hay restricciones (all methods permitidos).

**isMethodAllowed(method) Validator:** Método estático en BaseEntity que verifica si method específico está permitido. Signature: `isMethodAllowed(method: string): boolean`. Retorna true si NO hay decorator (undefined) o si method está en array permitido.

**Default Behavior:** Si @ApiMethods NO está aplicado, getApiMethods() retorna undefined, isMethodAllowed() retorna true para TODOS los methods. All CRUD operations habilitadas por defecto.

**Read-Only Entity:** Entidad con @ApiMethods(['GET']) que solo permite lectura. save() y delete() bloqueados, solo getElement/getElementList permitidos.

**Append-Only Entity:** Entidad con @ApiMethods(['GET', 'POST']) que permite crear y leer pero NO actualizar ni eliminar. Patrón usado en audit logs, event logs.

**Soft Delete Pattern:** Prevenir eliminación física usando @ApiMethods(['GET', 'POST', 'PUT']). Override delete() para setear flag isDeleted=true y llamar save() (PUT) en lugar de DELETE físico.

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
// src/decorations/api_methods_decorator.ts
export const API_METHODS_KEY = Symbol('api_methods');

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function ApiMethods(methods: HttpMethod[]): ClassDecorator {
    return function (target: any) {
        (target as any)[API_METHODS_KEY] = methods;
    };
}
```

**Parámetros:**
- `methods: HttpMethod[]` - Array tipado de métodos HTTP permitidos. Los valores válidos son: 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'

**Tipo HttpMethod:** Union type que acepta exclusivamente los cinco métodos HTTP estándar en uppercase.

**Uso:**
```typescript
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
export class Product extends BaseEntity {
    // ...
}
```

### Accessors en BaseEntity

```typescript
// src/entities/base_entitiy.ts - Línea 1040
public static getApiMethods(): string[] | undefined {
    return this.prototype[API_METHODS_METADATA];
}

public getApiMethods(): string[] | undefined {
    return (this.constructor as typeof BaseEntity).getApiMethods();
}

// Línea 1050
public static isMethodAllowed(method: string): boolean {
    const allowedMethods = this.getApiMethods();
    
    // Si NO hay decorator, permitir todos
    if (!allowedMethods) {
        return true;
    }
    
    // Verificar si method está en array permitido
    return allowedMethods.includes(method.toUpperCase());
}

public isMethodAllowed(method: string): boolean {
    return (this.constructor as typeof BaseEntity).isMethodAllowed(method);
}
```

### Integración en save()

```typescript
// src/entities/base_entitiy.ts - Línea 710
public async save(): Promise<this> {
    const constructor = this.constructor as typeof BaseEntity;
    const primaryKey = constructor.getPrimaryProperty();
    const isNew = !this[primaryKey];
    const requiredMethod = isNew ? 'POST' : 'PUT';
    
    // Verificar si método está permitido
    if (!constructor.isMethodAllowed(requiredMethod)) {
        console.warn(`${requiredMethod} not allowed for ${constructor.name}`);
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            `Cannot ${isNew ? 'create' : 'update'} ${constructor.getModuleName()}`
        );
        return this;  // Retornar sin ejecutar HTTP request
    }
    
    // Validaciones...
    const endpoint = constructor.getApiEndpoint();
    const url = isNew ? endpoint : `${endpoint}/${this.getUniquePropertyValue()}`;
    
    try {
        const response = await Application.axiosInstance[isNew ? 'post' : 'put'](
            url,
            this.toDictionary()
        );
        Object.assign(this, response.data);
        return this;
    } catch (error) {
        console.error('Save failed:', error);
        return this;
    }
}
```

### Integración en delete()

```typescript
// src/entities/base_entitiy.ts - Línea 819
public async delete(): Promise<void> {
    const constructor = this.constructor as typeof BaseEntity;
    
    // Verificar si DELETE está permitido
    if (!constructor.isMethodAllowed('DELETE')) {
        console.warn(`DELETE not allowed for ${constructor.name}`);
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            `Cannot delete ${constructor.getModuleName()}`
        );
        return false;  // Bloquear eliminación
    }
    
    const endpoint = constructor.getApiEndpoint();
    const uniqueKey = this.getUniquePropertyValue();
    
    try {
        await Application.axiosInstance.delete(`${endpoint}/${uniqueKey}`);
        return true;
    } catch (error) {
        console.error('Delete failed:', error);
        return false;
    }
}
```

### Integración en getElementList()

```typescript
// src/entities/base_entitiy.ts - Línea 615
public static async getElementList<T extends BaseEntity>(
    this: new () => T,
    filters?: any
): Promise<T[]> {
    // Verificar si GET está permitido
    if (!this.isMethodAllowed('GET')) {
        console.warn(`GET not allowed for ${this.name}`);
        return [];  // Retornar array vacío
    }
    
    const endpoint = this.getApiEndpoint();
    
    try {
        const response = await Application.axiosInstance.get(endpoint, {
            params: filters
        });
        return response.data.map((data: any) => new this(data));
    } catch (error) {
        console.error('GetElementList failed:', error);
        return [];
    }
}
```

### Ejemplo Completo: Read-Only Entity

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { 
    ApiEndpoint, 
    ApiMethods, 
    Persistent, 
    ModuleName, 
    PropertyName, 
    PrimaryProperty 
} from '@/decorations';

@ApiEndpoint('/api/reports')
@ApiMethods(['GET'])
@Persistent()
@ModuleName('Report', 'Reports')
export class Report extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Report ID', Number)
    id!: number;
    
    @PropertyName('Report Name', String)
    name!: string;
    
    @PropertyName('Generated At', Date)
    generatedAt!: Date;
}

// Uso:
const reports = await Report.getElementList();
// GET /api/reports (permitido)

const report = new Report({ name: 'Sales Report' });
await report.save();
// Error toast: "Cannot create Report"
// NO ejecuta POST /api/reports

report.id = 5;
report.name = 'Modified';
await report.save();
// Error toast: "Cannot update Report"
// NO ejecuta PUT /api/reports/5

await report.delete();
// Error toast: "Cannot delete Report"
// NO ejecuta DELETE /api/reports/5
```

### Ejemplo Completo: Append-Only Audit Log

```typescript
@ApiEndpoint('/api/audit-logs')
@ApiMethods(['GET', 'POST'])
@Persistent()
@ModuleName('Audit Log', 'Audit Logs')
export class AuditLog extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Log ID', Number)
    id!: number;
    
    @PropertyName('Action', String)
    action!: string;
    
    @PropertyName('User', String)
    user!: string;
    
    @PropertyName('Timestamp', Date)
    timestamp!: Date;
}

// Uso:
const log = new AuditLog({ 
    action: 'User logged in', 
    user: 'john@example.com',
    timestamp: new Date()
});
await log.save();
// POST /api/audit-logs (permitido - log es nuevo)

log.id = 42;
log.action = 'Modified action';
await log.save();
// Error toast: "Cannot update Audit Log"
// NO ejecuta PUT /api/audit-logs/42 (UPDATE bloqueado)

await log.delete();
// Error toast: "Cannot delete Audit Log"
// NO ejecuta DELETE /api/audit-logs/42 (DELETE bloqueado)

const logs = await AuditLog.getElementList();
// GET /api/audit-logs (permitido)
```

## 5. Flujo de Funcionamiento

### Flujo de Application del Decorator

```
Developer define clase con @ApiMethods
@ApiMethods(['GET', 'POST', 'PUT'])
export class Product extends BaseEntity {}
        ↓
Decorator function ejecuta en tiempo de clase
        ↓
Normalizar input a array
methods = ['GET', 'POST', 'PUT']
Si string: split por comas → ['GET', 'POST', 'PUT']
        ↓
Convertir a uppercase
methods = methods.map(m => m.toUpperCase())
['get', 'POST', 'Put'] → ['GET', 'POST', 'PUT']
        ↓
Validar y filtrar métodos válidos
validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
methods = methods.filter(m => validMethods.includes(m))
['GET', 'POST', 'PUT', 'INVALID'] → ['GET', 'POST', 'PUT']
        ↓
Almacenar en prototype
target.prototype[API_METHODS_METADATA] = ['GET', 'POST', 'PUT']
        ↓
Metadata permanece en prototype
Todas las instancias acceden mismo array
```

### Flujo de Validación en save() - CREATE

```
Usuario crea nueva instancia
const product = new Product({ name: 'Widget' })
        ↓
Usuario llama save()
await product.save()
        ↓
save() determina método HTTP requerido
const isNew = !this.getPrimaryPropertyValue()
isNew = true (product.id === undefined)
requiredMethod = 'POST'
        ↓
save() verifica si POST permitido
const constructor = this.constructor as typeof BaseEntity
const allowed = constructor.isMethodAllowed('POST')
        ↓
isMethodAllowed('POST') ejecuta
        ↓
Obtener array de métodos permitidos
const allowedMethods = this.getApiMethods()
allowedMethods = ['GET', 'POST', 'PUT']  (desde decorator)
        ↓
Verificar si 'POST' está en array
allowedMethods.includes('POST')
['GET', 'POST', 'PUT'].includes('POST') → true
        ↓
return true
        ↓
save() continúa con HTTP request
await Application.axiosInstance.post(endpoint, data)
POST /api/products
```

### Flujo de Validación en save() - UPDATE (Bloqueado)

```
Usuario modifica entity existente
product.name = 'Super Widget'
        ↓
Usuario llama save()
await product.save()
        ↓
save() determina método HTTP requerido
const isNew = !this.getPrimaryPropertyValue()
isNew = false (product.id === 5)
requiredMethod = 'PUT'
        ↓
save() verifica si PUT permitido
const allowed = constructor.isMethodAllowed('PUT')
        ↓
isMethodAllowed('PUT') ejecuta
        ↓
Obtener array de métodos permitidos
const allowedMethods = this.getApiMethods()
allowedMethods = ['GET', 'POST']  (sin PUT)
        ↓
Verificar si 'PUT' está en array
allowedMethods.includes('PUT')
['GET', 'POST'].includes('PUT') → false
        ↓
return false
        ↓
save() detecta método NO permitido
if (!allowed) {
    console.warn('PUT not allowed for Product')
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.ERROR,
        'Cannot update Product'
    )
    return this  // NO ejecuta HTTP request
}
        ↓
Usuario ve error toast
"Cannot update Product"
        ↓
save() retorna sin ejecutar HTTP
NO se ejecuta PUT /api/products/5
```

### Flujo de Validación en delete() (Bloqueado)

```
Usuario intenta eliminar entity
await product.delete()
        ↓
delete() verifica si DELETE permitido
const allowed = constructor.isMethodAllowed('DELETE')
        ↓
isMethodAllowed('DELETE') ejecuta
        ↓
Obtener array de métodos permitidos
allowedMethods = ['GET', 'POST', 'PUT']  (sin DELETE)
        ↓
Verificar si 'DELETE' está en array
allowedMethods.includes('DELETE')
['GET', 'POST', 'PUT'].includes('DELETE') → false
        ↓
return false
        ↓
delete() detecta método NO permitido
if (!allowed) {
    console.warn('DELETE not allowed for Product')
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.ERROR,
        'Cannot delete Product'
    )
    return false  // NO ejecuta HTTP request
}
        ↓
Usuario ve error toast
"Cannot delete Product"
        ↓
delete() retorna false sin ejecutar HTTP
NO se ejecuta DELETE /api/products/5
```

### Flujo Sin Decorator (All Methods Permitidos)

```
Developer define clase SIN @ApiMethods
export class Product extends BaseEntity {}
        ↓
NO hay metadata almacenada
prototype[API_METHODS_METADATA] = undefined
        ↓
Usuario llama save()
await product.save()
        ↓
save() verifica método
const allowed = constructor.isMethodAllowed('POST')
        ↓
isMethodAllowed('POST') ejecuta
        ↓
Obtener array de métodos permitidos
const allowedMethods = this.getApiMethods()
allowedMethods = undefined  (NO hay decorator)
        ↓
Verificar si undefined
if (!allowedMethods) {
    return true  // Sin decorator = permitir TODO
}
        ↓
return true
        ↓
save() ejecuta HTTP request normalmente
POST /api/products (permitido por defecto)
```

## 6. Reglas Obligatorias

**Regla 1:** Methods deben ser strings válidos entre GET, POST, PUT, PATCH, DELETE. Methods inválidos filtrados silenciosamente.

**Regla 2:** Methods son case-insensitive. 'get', 'GET', 'Get' todos normalizados a 'GET'.

**Regla 3:** Decorator acepta array `['GET', 'POST']` o string `'GET,POST,PUT'`. Ambas sintaxis equivalentes.

**Regla 4:** Sin decorator, getApiMethods() retorna undefined interpretado como ALL methods permitidos. Default behavior es permissive.

**Regla 5:** isMethodAllowed() retorna boolean. NO throw exception, caller decide acción (logging, toast, return false).

**Regla 6:** save() determina método requerido dinámicamente: POST si isNew() true, PUT si isNew() false. Verificar ambos si entity puede crear Y actualizar.

**Regla 7:** Backend DEBE implementar same restrictions. ApiMethods es frontend validation, NO securiza backend.

**Regla 8:** Override de save/delete que NO llaman super.save/super.delete pueden ignorar isMethodAllowed(). Developer responsable de mantener consistencia.

**Regla 9:** Métodos custom (entity.approve()) NO están cubiertos por ApiMethods. Developer debe verificar manualmente si requiere restricciones.

**Regla 10:** ApiMethods metadata fijada en decoration time. NO modificar dynamically en runtime sin side effects.

## 7. Prohibiciones

**Prohibido:** Asumir que ApiMethods securiza backend. Backend DEBE validar métodos HTTP independientemente de frontend.

**Prohibido:** Usar métodos HTTP no estándar. Solo GET/POST/PUT/PATCH/DELETE soportados, otros filtrados silenciosamente.

**Prohibido:** Modificar this.prototype[API_METHODS_METADATA] directamente en runtime. Puede causar race conditions entre instancias.

**Prohibido:** Esperar exception cuando método bloqueado. isMethodAllowed() retorna false, caller maneja error (log/toast/return).

**Prohibido:** Aplicar ApiMethods a entidades sin @Persistent o @ApiEndpoint. No tiene efecto si entidad NO hace HTTP requests.

**Prohibido:** Asumir que decorator aplica a métodos custom. entity.approve() NO verificado por ApiMethods, solo save/delete/getElementList.

**Prohibido:** Confiar solo en restricciones frontend para prevenir malicious actions. Usuario puede bypass frontend, backend DEBE validar.

**Prohibido:** Cambiar methods dinámicamente según user role en runtime. Decorator ejecuta en class definition time, NO runtime.

**Prohibido:** Omitir validación en override de CRUD methods. Si override save/delete sin llamar super, verificar isMethodAllowed manualmente.

**Prohibido:** Usar PATCH sin override de save(). save() default usa POST/PUT, PATCH requiere custom implementation de getChanges().

## 8. Dependencias

**Decoradores Relacionados:**
- @ApiEndpoint: Define URL base para HTTP requests, usado en save/delete/getElementList
- @Persistent: Habilita persistencia HTTP, required para que ApiMethods tenga efecto
- @UniquePropertyKey: Define propiedad usada como ID en URLs de update/delete
- @ModuleName: Define nombres usados en error messages ("Cannot update Product")

**BaseEntity Methods:**
- save(): Verifica isMethodAllowed('POST'/'PUT') antes de ejecutar HTTP request
- delete(): Verifica isMethodAllowed('DELETE') antes de ejecutar HTTP request
- getElementList(): Verifica isMethodAllowed('GET') antes de ejecutar HTTP request
- getElement(): Usa GET pero NO verifica ApiMethods (assumed read access)
- isNew(): Determina si usar POST o PUT en save()
- getUniquePropertyValue(): Obtiene ID para URLs de update/delete

**Application Singleton:**
- Application.axiosInstance: Instancia axios usada para HTTP requests
- Application.ApplicationUIService.openConfirmationMenu(): Muestra error toast cuando método bloqueado
- Application.currentUser: Puede usarse en logic condicional (aunque ApiMethods NO es dinámico)

**confMenuType Enum:**
- confMenuType.ERROR: Type de confirmation menu mostrado cuando método bloqueado

## 9. Relaciones

**Relación con save() (1:2):**
save() verifica TWO methods: POST para create (isNew true), PUT para update (isNew false). ApiMethods puede bloquear uno o ambos según configuración.

**Relación con delete() (1:1):**
delete() verifica ONE method: DELETE. ApiMethods puede bloquear eliminación manteniendo create/update.

**Relación con getElementList() (1:1):**
getElementList() verifica ONE method: GET. ApiMethods puede crear write-only entities bloqueando lectura (uncommon).

**Relación con @ApiEndpoint (coordinated):**
ApiMethods NO tiene efecto sin ApiEndpoint. Entidad necesita endpoint válido para que validación de methods sea relevante.

**Relación con @Persistent (prerequisite):**
ApiMethods inútil sin @Persistent. Entidad NO persistente NO hace HTTP requests, ApiMethods NO consulted.

**Relación con Backend Routes (1:1 esperada):**
Cada method permitido en frontend (GET/POST/PUT/DELETE) debe tener route correspondiente en backend implementado y protegido.

**Relación con UI Components (N:1):**
Múltiples UI components (ListView, DetailView, buttons) verifican isMethodAllowed() para mostrar/ocultar acciones (Edit, Delete, Create buttons).

## 10. Notas de Implementación

### Ejemplo 1: Soft Delete Pattern

```typescript
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT'])  // Sin DELETE físico
@Persistent()
@ModuleName('Product', 'Products')
export class Product extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Is Deleted', Boolean)
    isDeleted: boolean = false;
    
    // Override delete para soft delete
    public override async delete(): Promise<void> {
        this.isDeleted = true;
        await this.save();  // PUT con isDeleted=true
        // NO ejecuta DELETE físico
    }
    
    // Override getElementList para filtrar deleted
    public static override async getElementList<T extends BaseEntity>(
        this: new () => T,
        filters?: any
    ): Promise<T[]> {
        const products = await super.getElementList.call(this, filters) as Product[];
        return products.filter(p => !p.isDeleted);
    }
}

// Uso:
const product = await Product.getElement(5);
await product.delete();
// PUT /api/products/5 con { isDeleted: true }
// NO ejecuta DELETE /api/products/5

const active = await Product.getElementList();
// GET /api/products → filtra isDeleted=false
```

### Ejemplo 2: UI Condicional con isMethodAllowed

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Product } from '@/entities/products';

const products = ref<Product[]>([]);
const canCreate = computed(() => Product.isMethodAllowed('POST'));
const canUpdate = computed(() => Product.isMethodAllowed('PUT'));
const canDelete = computed(() => Product.isMethodAllowed('DELETE'));

const loadProducts = async () => {
    products.value = await Product.getElementList();
};

const createNew = () => {
    // Logic para crear nuevo product
};

const editProduct = (product: Product) => {
    // Logic para editar product
};

const deleteProduct = async (product: Product) => {
    const success = await product.delete();
    if (success) {
        await loadProducts();
    }
};

loadProducts();
</script>

<template>
    <div class="product-list">
        <table>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td>{{ product.name }}</td>
                    <td class="actions">
                        <button 
                            v-if="canUpdate" 
                            @click="editProduct(product)"
                            class="btn-edit"
                        >
                            Edit
                        </button>
                        
                        <button 
                            v-if="canDelete" 
                            @click="deleteProduct(product)"
                            class="btn-delete"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <button 
            v-if="canCreate" 
            @click="createNew"
            class="btn-create"
        >
            Create New Product
        </button>
        
        <p v-if="!canCreate && !canUpdate && !canDelete" class="read-only-notice">
            You have read-only access to products
        </p>
    </div>
</template>
```

### Ejemplo 3: PATCH Incremental en Lugar de PUT

```typescript
@ApiEndpoint('/api/users')
@ApiMethods(['GET', 'POST', 'PATCH'])  // PATCH en lugar de PUT
@Persistent()
@ModuleName('User', 'Users')
export class User extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Username', String)
    username!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    private _originalState: any = {};
    
    constructor(data?: any) {
        super(data);
        if (data) {
            this._originalState = { ...data };
        }
    }
    
    // Override save para usar PATCH incremental
    public override async save(): Promise<this> {
        const constructor = this.constructor as typeof BaseEntity;
        const endpoint = constructor.getApiEndpoint();
        const isNew = !this.getPrimaryPropertyValue();
        
        if (isNew) {
            // CREATE usa POST (permitido)
            if (!constructor.isMethodAllowed('POST')) {
                console.warn('POST not allowed');
                return this;
            }
            
            const response = await Application.axiosInstance.post(
                endpoint,
                this.toDictionary()
            );
            Object.assign(this, response.data);
            this._originalState = { ...response.data };
        } else {
            // UPDATE usa PATCH con solo cambios
            if (!constructor.isMethodAllowed('PATCH')) {
                console.warn('PATCH not allowed');
                return this;
            }
            
            const changes = this.getChanges();
            if (Object.keys(changes).length === 0) {
                console.log('No changes detected');
                return this;
            }
            
            const id = this.getUniquePropertyValue();
            const response = await Application.axiosInstance.patch(
                `${endpoint}/${id}`,
                changes
            );
            Object.assign(this, response.data);
            this._originalState = { ...response.data };
        }
        
        return this;
    }
    
    private getChanges(): Record<string, any> {
        const current = this.toDictionary();
        const changes: Record<string, any> = {};
        
        for (const key in current) {
            if (current[key] !== this._originalState[key]) {
                changes[key] = current[key];
            }
        }
        
        return changes;
    }
}

// Uso:
const user = await User.getElement(5);
user.email = 'newemail@example.com';  // Solo cambiar email
await user.save();
// PATCH /api/users/5 con { email: "newemail@example.com" }
// NO envía username ni otros campos sin cambios
```

### Ejemplo 4: Restricciones por Ambiente

```typescript
const isDevelopment = import.meta.env.DEV;

@ApiEndpoint('/api/products')
@ApiMethods(isDevelopment 
    ? ['GET', 'POST', 'PUT', 'DELETE']  // Development: todos los métodos
    : ['GET', 'POST', 'PUT']            // Production: sin DELETE físico
)
@Persistent()
@ModuleName('Product', 'Products')
export class Product extends BaseEntity {
    // En development: DELETE permitido
    // En production: DELETE bloqueado
}

// Development:
await product.delete();  // DELETE /api/products/5 (permitido)

// Production:
await product.delete();  // Error toast: "Cannot delete Product"
```

### Ejemplo 5: String Syntax Variations

```typescript
// Array syntax
@ApiMethods(['GET', 'POST', 'PUT'])
export class Product1 extends BaseEntity {}

// String syntax sin espacios
@ApiMethods('GET,POST,PUT')
export class Product2 extends BaseEntity {}

// String syntax con espacios
@ApiMethods('GET, POST, PUT')
export class Product3 extends BaseEntity {}

// Case insensitive
@ApiMethods(['get', 'Post', 'PUT'])
export class Product4 extends BaseEntity {}
// Todos normalizados a ['GET', 'POST', 'PUT']

// Con métodos inválidos (filtrados)
@ApiMethods(['GET', 'POST', 'INVALID', 'DELETE'])
export class Product5 extends BaseEntity {}
// Almacenado: ['GET', 'POST', 'DELETE'] (INVALID removido)
```

### Consideración: Tabla de Métodos HTTP

| Método | Operación CRUD | URL Ejemplo | Request Body | Idempotente | ApiMethods Bloquea |
|--------|----------------|-------------|--------------|-------------|-------------------|
| GET | Read (list/detail) | `/api/products`, `/api/products/5` | No | Sí | getElementList() |
| POST | Create | `/api/products` | Sí (full entity) | No | save() cuando isNew |
| PUT | Update (full) | `/api/products/5` | Sí (full entity) | Sí | save() cuando !isNew |
| PATCH | Update (partial) | `/api/products/5` | Sí (solo changes) | No | Custom save() override |
| DELETE | Delete | `/api/products/5` | No | Sí | delete() |

### Consideración: Backend Must Match Frontend

```typescript
// Frontend
@ApiEndpoint('/api/reports')
@ApiMethods(['GET'])
export class Report extends BaseEntity {}

// Backend DEBE implementar SOLO GET
// Express.js example:
router.get('/api/reports', (req, res) => { /* ... */ });
router.get('/api/reports/:id', (req, res) => { /* ... */ });

// Backend NO debe exponer estos endpoints:
// router.post('/api/reports', ...)     ← Debe retornar 405 Method Not Allowed
// router.put('/api/reports/:id', ...)  ← Debe retornar 405 Method Not Allowed
// router.delete('/api/reports/:id', ...)  ← Debe retornar 405 Method Not Allowed
```

### Pattern: Verificación Manual en Métodos Custom

```typescript
@ApiEndpoint('/api/orders')
@ApiMethods(['GET', 'POST', 'PUT'])
@Persistent()
export class Order extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Status', String)
    status!: string;
    
    // Método custom NO cubierto por ApiMethods
    async approve(): Promise<boolean> {
        // Verificar manualmente si PUT permitido
        const constructor = this.constructor as typeof Order;
        if (!constructor.isMethodAllowed('PUT')) {
            console.warn('Cannot approve order: PUT not allowed');
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Cannot approve order'
            );
            return false;
        }
        
        const endpoint = constructor.getApiEndpoint();
        
        try {
            await Application.axiosInstance.put(
                `${endpoint}/${this.id}/approve`,
                {}
            );
            this.status = 'approved';
            return true;
        } catch (error) {
            console.error('Approval failed:', error);
            return false;
        }
    }
}
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- api-endpoint-decorator.md: Define URL base para HTTP requests verificados por ApiMethods
- persistent-decorator.md: Habilita persistencia required para que ApiMethods tenga efecto
- persistent-key-decorator.md: Define clave primaria usada en URLs de update/delete
- ../02-base-entity/crud-operations.md: save/delete/getElementList verifican ApiMethods
- ../02-base-entity/persistence-methods.md: isNew determina si usar POST o PUT
- ../03-application/application-singleton.md: Application.axiosInstance y UIService usados en validación
- ../../tutorials/01-basic-crud.md: Tutorial CRUD con restricciones de métodos
- ../../02-FLOW-ARCHITECTURE.md: Flujo de validación de operaciones

**Archivos fuente:**
- src/decorations/api_methods_decorator.ts: Implementación del decorator (línea 5), API_METHODS_METADATA Symbol, HttpMethod enum, ApiMethods function
- src/entities/base_entitiy.ts: getApiMethods() accessor (línea 1040), isMethodAllowed() validator (línea 1050), save() integration (línea 710), delete() integration (línea 790), getElementList() integration (línea 615)

**Líneas relevantes en código:**
- Línea 5 (api_methods_decorator.ts): Definición de API_METHODS_METADATA Symbol, HttpMethod enum, función ApiMethods con normalization/validation
- Línea 1040 (base_entitiy.ts): getApiMethods() estático que lee metadata
- Línea 1050 (base_entitiy.ts): isMethodAllowed() valida si method permitido
- Línea 710 (base_entitiy.ts): save() verifica isMethodAllowed('POST'/'PUT')
- Línea 790 (base_entitiy.ts): delete() verifica isMethodAllowed('DELETE')
- Línea 615 (base_entitiy.ts): getElementList() verifica isMethodAllowed('GET')

**Última actualización:** 11 de Febrero, 2026
