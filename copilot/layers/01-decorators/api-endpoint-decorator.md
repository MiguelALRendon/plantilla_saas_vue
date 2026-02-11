# 🌐 ApiEndpoint Decorator

**Referencias:**
- `api-methods-decorator.md` - ApiMethods
- `persistent-decorator.md` - Persistent
- `persistent-key-decorator.md` - PersistentKey
- `../02-base-entity/crud-operations.md` - CRUD

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/api_endpoint_decorator.ts`

---

## 🎯 Propósito

Define la **URL base del endpoint de API** para operaciones CRUD de una entidad. Este decorador indica al sistema dónde hacer las peticiones HTTP (GET, POST, PUT, DELETE) para persistir datos en el backend.

**Importante:** Este es un **decorador de clase**, no de propiedad.

---

## 🔑 Símbolo de Metadatos

```typescript
export const API_ENDPOINT_KEY = Symbol('api_endpoint');
```

### Almacenamiento

```typescript
// En el prototype de la clase
proto[API_ENDPOINT_KEY] = '/api/customers';
```

---

## 💻 Firma del Decorador

```typescript
function ApiEndpoint(endpoint: string): ClassDecorator
```

### Tipos

```typescript
export type ApiEndpointUrl = string;  // '/api/products'
```

---

## 📖 Uso Básico

### Endpoint Estándar

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { ApiEndpoint, Persistent } from '@/decorations';

@ModuleName('Customer', 'Customers')
@ApiEndpoint('/api/customers')          // ← Define URL base
@Persistent(true, 'id')                 // ← Habilita persistencia
export class Customer extends BaseEntity {
    @PropertyName('Customer Name', String)
    name!: string;
}
```

### Peticiones Generadas Automáticamente

```typescript
// Crear nuevo customer
const customer = new Customer({ name: 'John Doe' });
await customer.save();
// → POST /api/customers
// Body: { name: "John Doe" }

// Actualizar customer existente
customer.name = 'Jane Doe';
await customer.save();
// → PUT /api/customers/123
// Body: { id: 123, name: "Jane Doe" }

// Eliminar customer
await customer.delete();
// → DELETE /api/customers/123

// Obtener lista
const customers = await Customer.getElementList();
// → GET /api/customers

// Obtener uno por ID
const customer = await Customer.getElement(123);
// → GET /api/customers/123
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos Estáticos

#### `getApiEndpoint(): string`
Obtiene la URL base del endpoint de API.

```typescript
// Uso
@ApiEndpoint('/api/products')
class Product extends BaseEntity {}

Product.getApiEndpoint();
// Retorna: "/api/products"

// Ubicación en BaseEntity (línea ~110)
public static getApiEndpoint(): string {
    return this.prototype[API_ENDPOINT_KEY] || '';
}
```

### Métodos de Instancia (usan getApiEndpoint)

#### `save(): Promise<this>`
Crea o actualiza el registro (POST o PUT).

```typescript
// Crear nuevo (POST)
const product = new Product({ name: 'Laptop' });
await product.save();
// → POST {apiEndpoint}
// URL final: POST /api/products

// Actualizar existente (PUT)
product.name = 'Gaming Laptop';
await product.save();
// → PUT {apiEndpoint}/{id}
// URL final: PUT /api/products/42

// Ubicación en BaseEntity (línea ~710)
```

#### `delete(): Promise<boolean>`
Elimina el registro (DELETE).

```typescript
const product = await Product.getElement(42);
await product.delete();
// → DELETE {apiEndpoint}/{id}
// URL final: DELETE /api/products/42

// Ubicación en BaseEntity (línea ~790)
```

#### `getElementList(): Promise<Array<this>>`
Obtiene lista de registros (GET).

```typescript
const products = await Product.getElementList();
// → GET {apiEndpoint}
// URL final: GET /api/products

// Ubicación en BaseEntity (línea ~615)
```

#### `getElement(id: any): Promise<this>`
Obtiene un registro por ID (GET).

```typescript
const product = await Product.getElement(42);
// → GET {apiEndpoint}/{id}
// URL final: GET /api/products/42

// Ubicación en BaseEntity (línea ~650)
```

---

## 🎨 Construcción de URLs

### URL Completa

```typescript
@ApiEndpoint('/api/v1/customers')
export class Customer extends BaseEntity {}

// Peticiones:
// Lista:    GET    /api/v1/customers
// Detalle:  GET    /api/v1/customers/123
// Crear:    POST   /api/v1/customers
// Editar:   PUT    /api/v1/customers/123
// Eliminar: DELETE /api/v1/customers/123
```

### Con Versionado de API

```typescript
@ApiEndpoint('/api/v2/products')
export class Product extends BaseEntity {}

// GET /api/v2/products
// POST /api/v2/products
```

### Con Prefijo Custom

```typescript
@ApiEndpoint('/admin-api/users')
export class User extends BaseEntity {}

// POST /admin-api/users
// DELETE /admin-api/users/456
```

### Base URL Relativa

```typescript
// Si tu app está en https://myapp.com
@ApiEndpoint('/api/orders')
export class Order extends BaseEntity {}

// → https://myapp.com/api/orders
```

### Base URL Absoluta (Otro Servidor)

```typescript
// Si el backend está en otro dominio
@ApiEndpoint('https://api.mybackend.com/products')
export class Product extends BaseEntity {}

// → https://api.mybackend.com/products
```

---

## 🔗 Decoradores Relacionados

### Stack Completo de Persistencia

```typescript
@ModuleName('Invoice', 'Invoices')
@ApiEndpoint('/api/invoices')           // ← URL base
@ApiMethods({                           // ← Métodos permitidos
    create: true,
    read: true,
    update: true,
    delete: true,
    list: true
})
@Persistent(true, 'id')                 // ← Habilita persistencia con PK
@PersistentKey('invoiceId')             // ← Nombre custom de PK en API
export class Invoice extends BaseEntity {
    @PropertyName('Invoice Number', String)
    invoiceNumber!: string;
}
```

### Flujo Completo

```
1. Usuario hace click "Save"
        ↓
2. entity.save() es llamado
        ↓
3. Verifica: isPersistent() → true
        ↓
4. Obtiene: getApiEndpoint() → "/api/invoices"
        ↓
5. Verifica método permitido: canCreate() / canUpdate()
        ↓
6. Construye URL:
   - Si es nuevo: POST /api/invoices
   - Si existe: PUT /api/invoices/123
        ↓
7. Serializa datos con toDictionary()
        ↓
8. Hace petición con Application.axiosInstance
        ↓
9. Procesa respuesta y actualiza entity
```

---

## 🧪 Ejemplos Avanzados

### 1. Endpoints Anidados (Relaciones Parent-Child)

```typescript
// Parent
@ApiEndpoint('/api/projects')
export class Project extends BaseEntity {
    @PropertyName('Project Name', String)
    name!: string;
}

// Child (tasks dentro de projects)
@ApiEndpoint('/api/projects/:projectId/tasks')  // ← Nota el parámetro
export class Task extends BaseEntity {
    @PropertyName('Project', Project)
    project!: Project;
    
    @PropertyName('Task Name', String)
    name!: string;
    
    // Override save() para construir URL correcta
    async save(): Promise<this> {
        if (!this.project?.id) {
            throw new Error('Project is required to save Task');
        }
        
        // Reemplazar :projectId con ID real
        const endpoint = Task.getApiEndpoint().replace(
            ':projectId',
            this.project.id.toString()
        );
        
        // Temporalmente cambiar endpoint
        const originalEndpoint = (this.constructor as any).prototype[API_ENDPOINT_KEY];
        (this.constructor as any).prototype[API_ENDPOINT_KEY] = endpoint;
        
        // Llamar save original
        const result = await super.save();
        
        // Restaurar endpoint
        (this.constructor as any).prototype[API_ENDPOINT_KEY] = originalEndpoint;
        
        return result;
    }
}

// Uso:
const project = await Project.getElement(10);
const task = new Task({
    project: project,
    name: 'Design UI'
});
await task.save();
// → POST /api/projects/10/tasks
```

### 2. Endpoints con Query Parameters

```typescript
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    // Listar con filtros
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
const products = await Product.getElementList({
    category: 'electronics',
    minPrice: 100,
    maxPrice: 500
});
// → GET /api/products?category=electronics&minPrice=100&maxPrice=500
```

### 3. Múltiples Endpoints Según Modo

```typescript
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    // Modo normal: /api/products
    // Modo admin: /api/admin/products
    
    static getApiEndpoint(adminMode: boolean = false): string {
        const baseEndpoint = super.getApiEndpoint();
        
        if (adminMode && Application.currentUser?.isAdmin) {
            return baseEndpoint.replace('/api/', '/api/admin/');
        }
        
        return baseEndpoint;
    }
    
    async save(adminMode: boolean = false): Promise<this> {
        // Usar endpoint apropiado
        const endpoint = (this.constructor as typeof Product)
            .getApiEndpoint(adminMode);
        
        // Custom save logic...
    }
}

// Uso:
await product.save(true);   // → POST /api/admin/products
await product.save(false);  // → POST /api/products
```

### 4. Endpoints con Acciones Custom

```typescript
@ApiEndpoint('/api/orders')
export class Order extends BaseEntity {
    // CRUD normal usa /api/orders
    
    // Acción custom: Aprobar orden
    async approve(): Promise<boolean> {
        const endpoint = (this.constructor as typeof Order).getApiEndpoint();
        
        try {
            await Application.axiosInstance.post(
                `${endpoint}/${this.id}/approve`
            );
            return true;
        } catch (error) {
            console.error('Approval failed:', error);
            return false;
        }
    }
    
    // Acción custom: Cancelar orden
    async cancel(reason: string): Promise<boolean> {
        const endpoint = (this.constructor as typeof Order).getApiEndpoint();
        
        try {
            await Application.axiosInstance.post(
                `${endpoint}/${this.id}/cancel`,
                { reason }
            );
            return true;
        } catch (error) {
            console.error('Cancellation failed:', error);
            return false;
        }
    }
}

// Uso:
const order = await Order.getElement(123);
await order.approve();  // → POST /api/orders/123/approve
await order.cancel('Customer request');  // → POST /api/orders/123/cancel
```

### 5. Endpoints Dinámicos con Tenancy

```typescript
// Para aplicaciones multi-tenant
@ApiEndpoint('/api/{tenantId}/customers')
export class Customer extends BaseEntity {
    static getApiEndpoint(): string {
        const baseEndpoint = super.getApiEndpoint();
        const tenantId = Application.currentTenant?.id || 'default';
        
        return baseEndpoint.replace('{tenantId}', tenantId);
    }
}

// Si currentTenant.id = "acme":
// → GET /api/acme/customers

// Si currentTenant.id = "globex":
// → GET /api/globex/customers
```

---

## ⚠️ Consideraciones Importantes

### 1. Endpoint es Obligatorio para Persistencia

Si quieres guardar datos en backend, **DEBES** definir ApiEndpoint:

```typescript
// ❌ NO se puede guardar (sin endpoint)
@Persistent(true, 'id')
export class Product extends BaseEntity {}

await product.save();  // ← ERROR: No endpoint defined

// ✅ Se puede guardar
@ApiEndpoint('/api/products')
@Persistent(true, 'id')
export class Product extends BaseEntity {}

await product.save();  // ✓ POST /api/products
```

### 2. URLs Deben Comenzar con /

```typescript
// ✅ CORRECTO
@ApiEndpoint('/api/products')

// ❌ INCORRECTO (falta /)
@ApiEndpoint('api/products')
```

### 3. Sin Trailing Slash

```typescript
// ✅ CORRECTO
@ApiEndpoint('/api/products')

// ❌ EVITAR (slash al final)
@ApiEndpoint('/api/products/')
// Puede causar: /api/products//123
```

### 4. Backend Debe Existir

El endpoint debe existir en tu backend:

```typescript
@ApiEndpoint('/api/customers')
export class Customer extends BaseEntity {}

// Tu backend DEBE tener:
// GET    /api/customers      → Lista
// GET    /api/customers/:id  → Detalle
// POST   /api/customers      → Crear
// PUT    /api/customers/:id  → Actualizar
// DELETE /api/customers/:id  → Eliminar
```

### 5. CORS en Backend

Si frontend y backend están en diferentes dominios:

```typescript
// Frontend
@ApiEndpoint('https://api.mybackend.com/products')
export class Product extends BaseEntity {}

// Backend debe permitir CORS:
// Access-Control-Allow-Origin: https://myfrontend.com
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
// Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function ApiEndpoint(endpoint: string): ClassDecorator {
    return function <T extends Function>(target: T) {
        const proto = target.prototype;
        
        proto[API_ENDPOINT_KEY] = endpoint;
        
        return target;
    };
}
```

**Ubicación:** `src/decorations/api_endpoint_decorator.ts` (línea ~10)

### Uso en save() de BaseEntity

```typescript
// BaseEntity.save()
public async save(): Promise<this> {
    // Validaciones...
    
    const endpoint = (this.constructor as typeof BaseEntity).getApiEndpoint();
    
    if (!endpoint) {
        throw new Error(
            `No API endpoint defined for ${this.constructor.name}. ` +
            `Use @ApiEndpoint decorator.`
        );
    }
    
    const isNew = !this.getPrimaryPropertyValue();
    const method = isNew ? 'post' : 'put';
    const url = isNew ? endpoint : `${endpoint}/${this.getPrimaryPropertyValue()}`;
    
    const response = await Application.axiosInstance[method](
        url,
        this.toDictionary()
    );
    
    // Actualizar entity con respuesta
    Object.assign(this, response.data);
    
    return this;
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~710)

---

## 📊 Flujo de Petición HTTP

```
1. Usuario llama entity.save()
        ↓
2. BaseEntity.save() verifica isPersistent()
        ↓ (true)
3. Obtiene endpoint: getApiEndpoint() → "/api/customers"
        ↓
4. Determina método:
   - Si entity.id existe → PUT (update)
   - Si NO existe → POST (create)
        ↓
5. Construye URL:
   - POST: /api/customers
   - PUT:  /api/customers/123
        ↓
6. Serializa entity → JSON con toDictionary()
        ↓
7. Hace petición:
   Application.axiosInstance[method](url, data)
        ↓
8. Backend procesa y retorna datos
        ↓
9. Actualiza entity con respuesta:
   Object.assign(this, response.data)
        ↓
10. Retorna entity actualizado
```

---

## 🎓 Patrones de Diseño

### 1. RESTful Standard

```typescript
@ApiEndpoint('/api/resources')
// GET    /api/resources      → index
// POST   /api/resources      → store
// GET    /api/resources/:id  → show
// PUT    /api/resources/:id  → update
// DELETE /api/resources/:id  → destroy
```

### 2. RPC Style (Acciones)

```typescript
@ApiEndpoint('/api/orders')
// POST /api/orders/:id/approve
// POST /api/orders/:id/ship
// POST /api/orders/:id/deliver
```

### 3. GraphQL (Single Endpoint)

```typescript
@ApiEndpoint('/graphql')
export class Product extends BaseEntity {
    // Override métodos para usar queries GraphQL
    static async getElementList(): Promise<Product[]> {
        const query = `
            query {
                products {
                    id
                    name
                    price
                }
            }
        `;
        
        const response = await Application.axiosInstance.post(
            this.getApiEndpoint(),
            { query }
        );
        
        return response.data.data.products.map(
            (p: any) => new Product(p)
        );
    }
}
```

### 4. BFF (Backend for Frontend)

```typescript
// Diferentes endpoints para diferentes clientes
@ApiEndpoint('/api/mobile/products')  // Para app móvil
export class ProductMobile extends BaseEntity {}

@ApiEndpoint('/api/web/products')  // Para web app
export class ProductWeb extends BaseEntity {}
```

---

## 📚 Referencias Adicionales

- `api-methods-decorator.md` - Restricción de métodos HTTP
- `persistent-decorator.md` - Habilitar persistencia
- `persistent-key-decorator.md` - Clave primaria custom
- `../02-base-entity/crud-operations.md` - Operaciones CRUD
- `../03-application/application-singleton.md` - Axios instance
- `../../tutorials/03-api-integration.md` - Tutorial de API
- `../../02-FLOW-ARCHITECTURE.md` - Flujo de datos

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/api_endpoint_decorator.ts`
