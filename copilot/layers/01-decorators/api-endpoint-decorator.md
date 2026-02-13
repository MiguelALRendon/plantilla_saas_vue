# ApiEndpoint Decorator

## 1. Propósito

El decorator ApiEndpoint define la URL base del endpoint de API para operaciones CRUD de una entidad BaseEntity. Establece la ubicación del servicio backend donde el sistema realizará peticiones HTTP (GET, POST, PUT, DELETE) para persistir y consultar datos. El endpoint se almacena en el prototype de la clase decorada como metadata accesible a través de getApiEndpoint(), método estático y de instancia usado por save(), delete(), getElement(), getElementList() para construir URLs completas. Critical para aplicaciones que interactúan con backend REST, permitiendo configuración centralizada de URLs sin hardcoding en métodos individuales. Sin ApiEndpoint, entidades marcadas como @Persistent() no pueden ejecutar operaciones CRUD. Soporta endpoints relativos ('/api/products'), absolutos ('https://api.backend.com/products'), con versionado ('/api/v2/products'), y parámetros dinámicos mediante override de getApiEndpoint() en subclases.

## 2. Alcance

**Responsabilidades cubiertas:**
- Definir string URL base para endpoints de API en clase entity
- Almacenar endpoint como Symbol metadata en prototype de clase decorada
- Proveer acceso a endpoint mediante getApiEndpoint() estático y de instancia
- Construir URLs completas para operaciones CRUD: POST {endpoint} para create, PUT {endpoint}/{id} para update, DELETE {endpoint}/{id} para delete, GET {endpoint} para list, GET {endpoint}/{id} para read
- Soportar endpoints relativos (comenzando con '/') y absolutos (con protocolo https://)
- Permitir versionado de API mediante prefijos en endpoint ('/api/v1/products', '/api/v2/products')
- Habilitar override de getApiEndpoint() en subclases para endpoints dinámicos (multi-tenancy, modo admin)

**Límites del alcance:**
- Decorator NO valida existencia de endpoint en backend (responsabilidad de developer verificar que backend tenga routes implementadas)
- NO maneja query parameters (añadidos por caller en axios request options)
- NO construye URLs de acciones custom (entity.approve() debe construir endpoint/{id}/approve manualmente)
- NO gestiona trailing slashes automáticamente (developer debe evitar incluir '/' al final)
- NO modifica comportamiento de axios instance (timeout, headers, interceptors configurados en Application.axiosInstance)
- NO cambia formato de request/response (JSON serialization manejada por toDictionary() y constructor)
- NO valida formato de URL (developer responsable de usar URLs válidas)
- Override de getApiEndpoint() es responsabilidad de developer, NO automático

## 3. Definiciones Clave

**API_ENDPOINT_KEY Symbol:** Identificador único usado como property key en prototype para almacenar endpoint string. Evita colisiones con propiedades normales. Definido como `export const API_ENDPOINT_KEY = Symbol('api_endpoint')`.

**ApiEndpointUrl Type:** Type alias `string` representando URL de endpoint. Puede ser relativa (`'/api/products'`) o absoluta (`'https://api.backend.com/products'`).

**Decorator Signature:** `function ApiEndpoint(endpoint: string): ClassDecorator`. Recibe string URL, retorna function que decora clase.

**Endpoint Relativo:** URL comenzando con '/' sin protocolo ni dominio. Ejemplo: `'/api/customers'`. Axios usa base URL configurada en Application.axiosInstance.

**Endpoint Absoluto:** URL completa con protocolo y dominio. Ejemplo: `'https://api.mybackend.com/products'`. Axios hace request a URL exacta sin concatenar base URL.

**getApiEndpoint() Accessor:** Método estático en BaseEntity que retorna `this.prototype[API_ENDPOINT_KEY] || ''`. Accede metadata de endpoint sin necesidad de instancia.

**CRUD URL Construction:** Patrón de construcción de URLs: CREATE usa `POST {endpoint}`, READ usa `GET {endpoint}/{id}`, UPDATE usa `PUT {endpoint}/{id}`, DELETE usa `DELETE {endpoint}/{id}`, LIST usa `GET {endpoint}`.

**PersistentKey Integration:** ApiEndpoint usa getUniquePropertyValue() (NO getPrimaryPropertyValue()) para construir URLs con ID. URL {endpoint}/{id} donde id es valor de propiedad con @UniquePropertyKey. En delete() y update(), {id} es unique value.

**Trailing Slash:** Barra final en URL. ApiEndpoint NO debe incluir trailing slash. `/api/products/` es incorrecto (causa `/api/products//123`), `/api/products` es correcto.

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
// src/decorations/api_endpoint_decorator.ts
export const API_ENDPOINT_KEY = Symbol('api_endpoint');

export function ApiEndpoint(path: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[API_ENDPOINT_KEY] = path;
    };
}
```

**Nota importante:** El decorador almacena el endpoint directamente en `target` (la clase), NO en `target.prototype`. Este es el patrón correcto para decoradores de clase que almacenan metadata a nivel de clase completa.

### Accessor en BaseEntity

```typescript
// src/entities/base_entitiy.ts - Línea 110
public static getApiEndpoint(): string {
    return this.prototype[API_ENDPOINT_KEY] || '';
}

// Método de instancia (delegación al estático)
public getApiEndpoint(): string {
    return (this.constructor as typeof BaseEntity).getApiEndpoint();
}
```

### Uso en save() - CREATE

```typescript
// src/entities/base_entitiy.ts - Línea 710
public async save(): Promise<this> {
    const endpoint = (this.constructor as typeof BaseEntity).getApiEndpoint();
    
    if (!endpoint) {
        throw new Error(
            `No API endpoint defined for ${this.constructor.name}. ` +
            `Use @ApiEndpoint decorator.`
        );
    }
    
    const isNew = !this.getPrimaryPropertyValue();
    
    if (isNew) {
        const response = await Application.axiosInstance.post(
            endpoint,  // POST /api/products
            this.toDictionary()
        );
        Object.assign(this, response.data);
    } else {
        const id = this.getUniquePropertyValue();
        const response = await Application.axiosInstance.put(
            `${endpoint}/${id}`,  // PUT /api/products/123
            this.toDictionary()
        );
        Object.assign(this, response.data);
    }
    
    return this;
}
```

### Uso en delete() - DELETE

```typescript
// src/entities/base_entitiy.ts - Línea 819
public async delete(): Promise<void> {
    if (!this.validateApiMethod('DELETE')) {
        return;
    }
    
    const endpoint = (this.constructor as typeof BaseEntity).getApiEndpoint();
    const uniqueKey = this.getUniquePropertyValue();
    
    try {
        await Application.axiosInstance.delete(`${endpoint}/${uniqueKey}`);
        // DELETE /api/products/123
        return true;
    } catch (error) {
        console.error('Delete failed:', error);
        return false;
    }
}
```

### Uso en getElement() - READ

```typescript
// src/entities/base_entitiy.ts - Línea 650
public static async getElement<T extends BaseEntity>(
    this: new () => T,
    id: any
): Promise<T> {
    const endpoint = this.getApiEndpoint();
    
    const response = await Application.axiosInstance.get(
        `${endpoint}/${id}`
    );
    // GET /api/products/123
    
    return new this(response.data);
}
```

### Uso en getElementList() - LIST

```typescript
// src/entities/base_entitiy.ts - Línea 615
public static async getElementList<T extends BaseEntity>(
    this: new () => T,
    filters?: any
): Promise<T[]> {
    const endpoint = this.getApiEndpoint();
    
    const response = await Application.axiosInstance.get(endpoint, {
        params: filters
    });
    // GET /api/products?category=electronics
    
    return response.data.map((data: any) => new this(data));
}
```

### Ejemplo Completo

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { ApiEndpoint, Persistent, PropertyName, PrimaryProperty } from '@/decorations';

@ApiEndpoint('/api/customers')
@Persistent()
@ModuleName('Customer', 'Customers')
export class Customer extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Customer ID', Number)
    id?: number;
    
    @PropertyName('Customer Name', String)
    name!: string;
    
    @PropertyName('Email', String)
    email!: string;
}

// CREATE
const customer = new Customer({ name: 'John Doe', email: 'john@example.com' });
await customer.save();
// → POST /api/customers
// Body: { name: "John Doe", email: "john@example.com" }

// READ
const loaded = await Customer.getElement(5);
// → GET /api/customers/5

// UPDATE
loaded.name = 'Jane Doe';
await loaded.save();
// → PUT /api/customers/5
// Body: { id: 5, name: "Jane Doe", email: "john@example.com" }

// DELETE
await loaded.delete();
// → DELETE /api/customers/5

// LIST
const all = await Customer.getElementList();
// → GET /api/customers

// LIST con filtros
const filtered = await Customer.getElementList({ active: true });
// → GET /api/customers?active=true
```

## 5. Flujo de Funcionamiento

### Flujo de Aplicación del Decorator

```
Developer define clase con @ApiEndpoint
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {}
        ↓
Decorator function ejecuta en tiempo de clase
        ↓
Obtener prototype de clase target
const proto = target.prototype
        ↓
Almacenar endpoint en prototype
proto[API_ENDPOINT_KEY] = '/api/products'
        ↓
Metadata permanece en prototype
Todas las instancias acceden mismo endpoint
```

### Flujo de CREATE (save nueva entidad)

```
Usuario crea nueva instancia
const product = new Product({ name: 'Widget', price: 99 })
        ↓
Usuario llama save()
await product.save()
        ↓
save() verifica isPersistent()
        ↓ (true)
save() obtiene endpoint
const endpoint = this.constructor.getApiEndpoint()
endpoint = '/api/products'
        ↓
save() verifica si es nuevo
const isNew = !this.getPrimaryPropertyValue()
isNew = true (id === undefined)
        ↓
Construir URL para CREATE
method = 'post'
url = endpoint  // '/api/products'
        ↓
Serializar entity a JSON
data = this.toDictionary()
data = { name: "Widget", price: 99 }
        ↓
Hacer request HTTP
await Application.axiosInstance.post(url, data)
        ↓
POST /api/products
Body: { name: "Widget", price: 99 }
        ↓
Backend procesa y retorna entity con ID
response.data = { id: 5, name: "Widget", price: 99 }
        ↓
Actualizar instancia con response
Object.assign(this, response.data)
product.id = 5
        ↓
Retornar instancia actualizada
return this
```

### Flujo de UPDATE (save entidad existente)

```
Usuario modifica entity existente
product.name = 'Super Widget'
product.price = 150
        ↓
Usuario llama save()
await product.save()
        ↓
save() obtiene endpoint
endpoint = '/api/products'
        ↓
save() verifica si es nuevo
isNew = !this.getPrimaryPropertyValue()
isNew = false (product.id === 5)
        ↓
Construir URL para UPDATE con unique ID
const id = this.getUniquePropertyValue()
id = 5
method = 'put'
url = `${endpoint}/${id}`  // '/api/products/5'
        ↓
Serializar entity a JSON
data = this.toDictionary()
data = { id: 5, name: "Super Widget", price: 150 }
        ↓
Hacer request HTTP
await Application.axiosInstance.put(url, data)
        ↓
PUT /api/products/5
Body: { id: 5, name: "Super Widget", price: 150 }
        ↓
Backend actualiza y retorna entity
response.data = { id: 5, name: "Super Widget", price: 150, updatedAt: "2024-01-15" }
        ↓
Actualizar instancia con response
Object.assign(this, response.data)
product.updatedAt = "2024-01-15"
        ↓
Retornar instancia actualizada
return this
```

### Flujo de DELETE

```
Usuario decide eliminar entity
await product.delete()
        ↓
delete() verifica permisos
this.validateApiMethod('DELETE')
        ↓ (true - permitido)
delete() obtiene endpoint
endpoint = '/api/products'
        ↓
delete() obtiene unique ID
const uniqueKey = this.getUniquePropertyValue()
uniqueKey = 5
        ↓
Construir URL DELETE
url = `${endpoint}/${uniqueKey}`  // '/api/products/5'
        ↓
Hacer request HTTP
await Application.axiosInstance.delete(url)
        ↓
DELETE /api/products/5
        ↓
Backend elimina registro y retorna success
response.status = 200
        ↓
delete() retorna true
return true
```

### Flujo de READ (getElement)

```
Usuario solicita entity por ID
const product = await Product.getElement(5)
        ↓
getElement() obtiene endpoint (estático)
const endpoint = Product.getApiEndpoint()
endpoint = '/api/products'
        ↓
Construir URL con ID
url = `${endpoint}/${id}`  // '/api/products/5'
        ↓
Hacer request HTTP
await Application.axiosInstance.get(url)
        ↓
GET /api/products/5
        ↓
Backend retorna entity data
response.data = { id: 5, name: "Widget", price: 99 }
        ↓
Construir instancia con data
return new Product(response.data)
        ↓
Retornar instancia populated
product.id = 5, product.name = "Widget", product.price = 99
```

### Flujo de LIST (getElementList)

```
Usuario solicita lista de entities
const products = await Product.getElementList({ category: 'electronics' })
        ↓
getElementList() obtiene endpoint (estático)
const endpoint = Product.getApiEndpoint()
endpoint = '/api/products'
        ↓
Construir request con query params
url = endpoint  // '/api/products'
params = { category: 'electronics' }
        ↓
Hacer request HTTP con params
await Application.axiosInstance.get(url, { params })
        ↓
GET /api/products?category=electronics
        ↓
Backend retorna array de entities
response.data = [
    { id: 1, name: "Phone", price: 500 },
    { id: 2, name: "Laptop", price: 1000 }
]
        ↓
Mapear cada item a instancia
return response.data.map(data => new Product(data))
        ↓
Retornar array de instancias
[Product {id:1, name:"Phone"}, Product {id:2, name:"Laptop"}]
```

## 6. Reglas Obligatorias

**Regla 1:** ApiEndpoint DEBE comenzar con '/' si es URL relativa. '/api/products' es correcto, 'api/products' es incorrecto.

**Regla 2:** ApiEndpoint NO debe incluir trailing slash. '/api/products' es correcto, '/api/products/' es incorrecto (causa '/api/products//123').

**Regla 3:** ApiEndpoint DEBE estar definido si @Persistent() está aplicado. Entidad persistente sin endpoint causa error en save().

**Regla 4:** Backend DEBE implementar endpoints correspondientes. @ApiEndpoint('/api/products') requiere GET/POST/PUT/DELETE en backend.

**Regla 5:** URLs deben usar minúsculas para consistencia REST. '/api/products' es preferible a '/api/Products'.

**Regla 6:** Endpoints NO deben incluir query parameters. '/api/products?category=electronics' es incorrecto, pasar params en axios options.

**Regla 7:** getApiEndpoint() retorna string vacío '' si decorator NO está aplicado. Verificar `if (!endpoint)` antes de usar.

**Regla 8:** Override de getApiEndpoint() debe retornar string. NO retornar undefined ni null.

**Regla 9:** Endpoints absolutos (https://) deben incluir protocolo completo. 'https://api.backend.com' es correcto, '//api.backend.com' puede causar problemas.

**Regla 10:** CRUD methods (save, delete, getElement, getElementList) usan getApiEndpoint() automáticamente. NO construir URLs manualmente en caller salvo acciones custom.

## 7. Prohibiciones

**Prohibido:** Aplicar @ApiEndpoint sin @Persistent() en entidades que deben persistir. Backend endpoint no se usará si isPersistent() retorna false.

**Prohibido:** Hardcodear URLs en métodos CRUD individuales. Siempre usar getApiEndpoint(), NO `await axios.post('/api/products', ...)`.

**Prohibido:** Incluir trailing slash en endpoint. '/api/products/' causa URLs incorrectas como '/api/products//123'.

**Prohibido:** Usar endpoint sin '/' inicial en URLs relativas. 'api/products' puede causar URLs incorrectas dependiendo de base URL.

**Prohibido:** Incluir ID o unique key en endpoint base. '/api/products/123' es incorrecto, usar '/api/products' y construir URLs con ID dinámicamente.

**Prohibido:** Incluir query parameters en endpoint string. '/api/products?active=true' es incorrecto, pasar params en axios options.

**Prohibido:** Cambiar endpoint dinámicamente sin override. Modificar `this.prototype[API_ENDPOINT_KEY]` directamente puede causar race conditions en multi-instancia.

**Prohibido:** Asumir que backend tiene CORS configurado. Endpoints absolutos (https://otro-dominio.com) requieren CORS en backend.

**Prohibido:** Usar caracteres especiales no válidos en URLs. Espacios, símbolos no encoded causan errors HTTP.

**Prohibido:** Omitir validación de endpoint en métodos custom. Si entity.approve() construye URL custom, verificar que getApiEndpoint() !== ''.

## 8. Dependencias

**Decoradores Relacionados:**
- @Persistent(): Habilita persistencia, requiere ApiEndpoint para funcionar
- @ApiMethods(): Define métodos HTTP permitidos, verifica antes de ejecutar request
- @UniquePropertyKey: Define propiedad usada como ID en URLs (delete, update usan unique value)
- @PersistentKey: Mapea nombres de propiedades a keys de API en request/response
- @ModuleName: Define nombre de módulo, no afecta ApiEndpoint pero suele usarse junto

**BaseEntity Methods:**
- save(): Usa getApiEndpoint() para construir POST/PUT URLs
- delete(): Usa getApiEndpoint() + getUniquePropertyValue() para DELETE URL
- getElement(): Usa getApiEndpoint() estático para GET URL
- getElementList(): Usa getApiEndpoint() estático para GET list URL
- isPersistent(): Verifica si @Persistent() está aplicado antes de usar endpoint
- getUniquePropertyValue(): Obtiene ID usado en URLs de update/delete
- toDictionary(): Serializa entity a JSON para request body

**Application Singleton:**
- Application.axiosInstance: Instancia axios configurada usada para hacer HTTP requests
- Application.currentUser: Puede usarse en override de getApiEndpoint() para permisos
- Application.currentTenant: Puede usarse en multi-tenancy para construir endpoints dinámicos

**Axios Configuration:**
- baseURL: Base URL configurada en axios, concatenada con endpoints relativos
- timeout: Timeout de requests HTTP
- headers: Headers por defecto (Authorization, Content-Type)
- interceptors: Interceptors para requests/responses globales

## 9. Relaciones

**Relación con @Persistent (1:1 necesaria):**
Cada entidad con @Persistent() DEBE tener @ApiEndpoint(). Persistent sin endpoint causa error en save().

**Relación con save() (1:N):**
Un endpoint usado por múltiples operaciones: save() usa POST {endpoint} para create, PUT {endpoint}/{id} para update.

**Relación con delete() (1:1):**
delete() usa endpoint una vez por invocación: DELETE {endpoint}/{uniqueKey}.

**Relación con getElement() (1:1):**
getElement(id) usa endpoint una vez: GET {endpoint}/{id}.

**Relación con getElementList() (1:N):**
getElementList() puede llamarse múltiples veces con diferentes filtros, todos usan mismo endpoint: GET {endpoint}?filter=value.

**Relación con @UniquePropertyKey (1:1 coordinada):**
ApiEndpoint define URL base, UniquePropertyKey define qué propiedad usar como {id} en URL. Ambos necesarios para construir URLs completas en update/delete.

**Relación con Application.axiosInstance (N:1):**
Múltiples entities con diferentes endpoints comparten misma instancia axios. baseURL configurada en axios concatena con endpoints relativos.

**Relación con Backend Routes (1:1 esperada):**
Cada @ApiEndpoint('/api/products') espera que backend tenga routes implementadas: GET/POST/PUT/DELETE /api/products.

## 10. Notas de Implementación

### Ejemplo 1: Stack Completo de Persistencia

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { 
    ApiEndpoint, 
    Persistent, 
    ApiMethods, 
    ModuleName,
    PropertyName,
    PrimaryProperty
} from '@/decorations';

@ApiEndpoint('/api/invoices')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
@ModuleName('Invoice', 'Invoices')
export class Invoice extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Invoice ID', Number)
    id?: number;
    
    @PropertyName('Invoice Number', String)
    invoiceNumber!: string;
    
    @PropertyName('Total', Number)
    total!: number;
}

// Uso completo CRUD
const invoice = new Invoice({ invoiceNumber: 'INV-001', total: 500 });
await invoice.save();           // POST /api/invoices
invoice.total = 600;
await invoice.save();           // PUT /api/invoices/1
await invoice.delete();         // DELETE /api/invoices/1
const all = await Invoice.getElementList();  // GET /api/invoices
const one = await Invoice.getElement(1);     // GET /api/invoices/1
```

### Ejemplo 2: Endpoints con Versionado

```typescript
@ApiEndpoint('/api/v2/products')
export class Product extends BaseEntity {
    // CRUD operations usan /api/v2/products
}

// URLs generadas:
// POST /api/v2/products
// GET /api/v2/products
// PUT /api/v2/products/123
// DELETE /api/v2/products/123
```

### Ejemplo 3: Endpoints Absolutos (Backend Externo)

```typescript
@ApiEndpoint('https://api.external.com/customers')
export class Customer extends BaseEntity {}

// axios hace requests a dominio completo:
// POST https://api.external.com/customers
// GET https://api.external.com/customers/5

// IMPORTANTE: Backend externo debe tener CORS configurado:
// Access-Control-Allow-Origin: https://myfrontend.com
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

### Ejemplo 4: Override para Multi-Tenancy

```typescript
@ApiEndpoint('/api/tenants/{tenantId}/orders')
export class Order extends BaseEntity {
    static getApiEndpoint(): string {
        const baseEndpoint = super.getApiEndpoint();
        const tenantId = Application.currentTenant?.id || 'default';
        return baseEndpoint.replace('{tenantId}', tenantId);
    }
}

// Si currentTenant.id = "acme":
// POST /api/tenants/acme/orders

// Si currentTenant.id = "globex":
// POST /api/tenants/globex/orders
```

### Ejemplo 5: getElementList con Filtros

```typescript
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    static async getElementList(filters?: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<Product[]> {
        const endpoint = this.getApiEndpoint();
        
        const response = await Application.axiosInstance.get(endpoint, {
            params: filters
        });
        
        return response.data.map((data: any) => new Product(data));
    }
}

// Uso:
const electronics = await Product.getElementList({ 
    category: 'electronics', 
    minPrice: 100 
});
// GET /api/products?category=electronics&minPrice=100
```

### Ejemplo 6: Acciones Custom con Endpoint Base

```typescript
@ApiEndpoint('/api/orders')
export class Order extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Order ID', Number)
    id?: number;
    
    @PropertyName('Status', String)
    status!: string;
    
    async approve(): Promise<boolean> {
        const endpoint = (this.constructor as typeof Order).getApiEndpoint();
        
        try {
            await Application.axiosInstance.post(
                `${endpoint}/${this.id}/approve`
            );
            this.status = 'approved';
            return true;
        } catch (error) {
            console.error('Approval failed:', error);
            return false;
        }
    }
    
    async cancel(reason: string): Promise<boolean> {
        const endpoint = (this.constructor as typeof Order).getApiEndpoint();
        
        try {
            await Application.axiosInstance.post(
                `${endpoint}/${this.id}/cancel`,
                { reason }
            );
            this.status = 'cancelled';
            return true;
        } catch (error) {
            console.error('Cancellation failed:', error);
            return false;
        }
    }
}

// Uso:
const order = await Order.getElement(123);
await order.approve();  // POST /api/orders/123/approve
await order.cancel('Customer request');  // POST /api/orders/123/cancel
```

### Ejemplo 7: Verificación de Endpoint Antes de Save

```typescript
const product = new Product({ name: 'Widget' });

// Verificar que endpoint está definido
const endpoint = Product.getApiEndpoint();

if (!endpoint) {
    console.error('No API endpoint configured for Product');
    console.error('Add @ApiEndpoint decorator to Product class');
} else {
    await product.save();  // Safe to save
}
```

### Consideración: Diferencia Primary vs Unique en URLs

```typescript
@ApiEndpoint('/api/invoices')
@UniquePropertyKey('invoiceNumber')
export class Invoice extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('ID', Number)
    id?: number;  // ID interno autoincremental
    
    @PropertyName('Invoice Number', String)
    invoiceNumber!: string;  // ID público 'INV-2024-001'
}

const invoice = new Invoice({ id: 5, invoiceNumber: 'INV-2024-001' });

// save() verifica isNew() con PRIMARY
console.log(invoice.isNew());  // false (id !== undefined)

// delete() construye URL con UNIQUE
await invoice.delete();
// DELETE /api/invoices/INV-2024-001  ← Usa invoiceNumber, NO id

// update() también usa UNIQUE
invoice.total = 500;
await invoice.save();
// PUT /api/invoices/INV-2024-001  ← Usa invoiceNumber, NO id
```

### Consideración: Backend Must Implement Matching Routes

```typescript
// Frontend
@ApiEndpoint('/api/customers')
export class Customer extends BaseEntity {}

// Backend DEBE tener estas routes implementadas:
// GET    /api/customers      → Lista todos los customers
// GET    /api/customers/:id  → Obtiene customer por ID
// POST   /api/customers      → Crea nuevo customer
// PUT    /api/customers/:id  → Actualiza customer existente
// DELETE /api/customers/:id  → Elimina customer

// Si backend no tiene route, axios retorna error 404
```

### Pattern: Construcción de URLs Dinámicas

```typescript
// Para relaciones parent-child o recursos nested
@ApiEndpoint('/api/projects/:projectId/tasks')
export class Task extends BaseEntity {
    @PropertyName('Project', Project)
    project!: Project;
    
    @PropertyName('Task Name', String)
    name!: string;
    
    // Override save para construir URL con projectId dinámico
    async save(): Promise<this> {
        if (!this.project?.id) {
            throw new Error('Project is required to save Task');
        }
        
        // Reemplazar :projectId con ID real
        const endpoint = (this.constructor as typeof Task)
            .getApiEndpoint()
            .replace(':projectId', this.project.id.toString());
        
        // Temporalmente cambiar endpoint para esta operación
        const originalEndpoint = (this.constructor as any)
            .prototype[API_ENDPOINT_KEY];
        
        (this.constructor as any).prototype[API_ENDPOINT_KEY] = endpoint;
        
        try {
            const result = await super.save();
            return result;
        } finally {
            // Restaurar endpoint original
            (this.constructor as any).prototype[API_ENDPOINT_KEY] = originalEndpoint;
        }
    }
}

// Uso:
const project = await Project.getElement(10);
const task = new Task({ project: project, name: 'Design UI' });
await task.save();
// POST /api/projects/10/tasks
```

### Pattern: Modo Admin con Endpoints Diferentes

```typescript
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    // Override para cambiar endpoint según modo
    static getApiEndpoint(adminMode: boolean = false): string {
        const baseEndpoint = super.getApiEndpoint();
        
        if (adminMode && Application.currentUser?.isAdmin) {
            return baseEndpoint.replace('/api/', '/api/admin/');
        }
        
        return baseEndpoint;
    }
    
    async save(adminMode: boolean = false): Promise<this> {
        const endpoint = (this.constructor as typeof Product)
            .getApiEndpoint(adminMode);
        
        const originalEndpoint = (this.constructor as any)
            .prototype[API_ENDPOINT_KEY];
        
        (this.constructor as any).prototype[API_ENDPOINT_KEY] = endpoint;
        
        try {
            return await super.save();
        } finally {
            (this.constructor as any).prototype[API_ENDPOINT_KEY] = originalEndpoint;
        }
    }
}

// Uso:
await product.save(true);   // POST /api/admin/products (admin)
await product.save(false);  // POST /api/products (normal)
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- api-methods-decorator.md: Define HTTP methods permitidos
- persistent-decorator.md: Habilita persistencia (requiere ApiEndpoint)
- persistent-key-decorator.md: Define clave primaria usada en URLs
- unique-decorator.md: @UniquePropertyKey define propiedad usada como ID en URLs
- ../02-base-entity/crud-operations.md: Implementación de save/delete/getElement/getElementList
- ../02-base-entity/persistence-methods.md: isPersistent, getUniquePropertyValue usado en CRUD
- ../03-application/application-singleton.md: Application.axiosInstance configuración
- ../../tutorials/03-api-integration.md: Tutorial completo de integración API
- ../../02-FLOW-ARCHITECTURE.md: Flujo de datos entre frontend y backend

**Archivos fuente:**
- src/decorations/api_endpoint_decorator.ts: Implementación del decorator (línea 10)
- src/entities/base_entitiy.ts: getApiEndpoint() accessor (línea 110), save() método (línea 710), delete() método (línea 790), getElement() método (línea 650), getElementList() método (línea 615)

**Líneas relevantes en código:**
- Línea 10 (api_endpoint_decorator.ts): Definición de API_ENDPOINT_KEY Symbol y función ApiEndpoint
- Línea 110 (base_entitiy.ts): getApiEndpoint() estático que lee metadata
- Línea 615 (base_entitiy.ts): getElementList() usa getApiEndpoint() para GET list
- Línea 650 (base_entitiy.ts): getElement() usa getApiEndpoint() para GET detail
- Línea 710 (base_entitiy.ts): save() usa getApiEndpoint() para POST/PUT
- Línea 790 (base_entitiy.ts): delete() usa getApiEndpoint() + uniqueKey para DELETE

**Última actualización:** 11 de Febrero, 2026
