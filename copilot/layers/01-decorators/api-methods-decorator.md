# 🔗 ApiMethods Decorator

**Referencias:**
- `api-endpoint-decorator.md` - ApiEndpoint define URL, ApiMethods define métodos HTTP
- `persistent-decorator.md` - Persistent habilita HTTP requests
- `persistent-key-decorator.md` - PersistentKey identifica registro
- `../../02-base-entity/crud-operations.md` - save(), delete() usan métodos HTTP
- `../../03-application/application-singleton.md` - axios instance

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/api_methods_decorator.ts`

---

## 🎯 Propósito

El decorador `@ApiMethods()` especifica qué **métodos HTTP** están permitidos para una entidad, permitiendo control granular sobre las operaciones CRUD disponibles.

**Sin @ApiMethods:**
- Default: Todos los métodos habilitados (GET, POST, PUT, DELETE)

**Con @ApiMethods:**
- Solo los métodos especificados están permitidos
- Otros métodos lanzan error o se comportan localmente

**Casos de Uso:**
- **Read-only entities:** Solo GET (no crear/editar/eliminar)
- **Append-only logs:** Solo GET, POST (no PUT, DELETE)
- **Custom restrictions:** Solo ciertos métodos según lógica de negocio

---

## 📝 Sintaxis

```typescript
@ApiMethods(methods: string[] | string)
export class EntityName extends BaseEntity {
    // ...
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `methods` | `string[]` \| `string` | Sí | Array de métodos HTTP permitidos o string separado por comas |

### Métodos HTTP Válidos

- `'GET'` - Obtener datos (getElementList(), getElement())
- `'POST'` - Crear nuevo (save() cuando es nuevo)
- `'PUT'` - Actualizar existente (save() cuando existe)
- `'PATCH'` - Actualización parcial
- `'DELETE'` - Eliminar (delete())

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/api_methods_decorator.ts

/**
 * Symbol para almacenar metadata de api methods
 */
export const API_METHODS_METADATA = Symbol('apiMethods');

/**
 * Métodos HTTP estándar
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

/**
 * @ApiMethods() - Especifica métodos HTTP permitidos
 * 
 * @param methods - Array de métodos HTTP o string separado por comas
 * @returns ClassDecorator
 */
export function ApiMethods(methods: string[] | string): ClassDecorator {
    return function (target: any) {
        // Normalizar a array
        let methodsArray: string[];
        
        if (typeof methods === 'string') {
            // String separado por comas: "GET,POST,PUT"
            methodsArray = methods.split(',').map(m => m.trim().toUpperCase());
        } else {
            // Ya es array: ['GET', 'POST', 'PUT']
            methodsArray = methods.map(m => m.toUpperCase());
        }
        
        // Validar métodos
        const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
        methodsArray = methodsArray.filter(m => validMethods.includes(m));
        
        // Guardar en prototype
        target.prototype[API_METHODS_METADATA] = methodsArray;
    };
}
```

**Ubicación:** `src/decorations/api_methods_decorator.ts` (línea ~1-50)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[API_METHODS_METADATA] = ['GET', 'POST', 'PUT', 'DELETE'];
ReadOnlyEntity.prototype[API_METHODS_METADATA] = ['GET'];
AuditLog.prototype[API_METHODS_METADATA] = ['GET', 'POST'];
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene los métodos HTTP permitidos
 * 
 * @returns Array de métodos HTTP o undefined (todos permitidos)
 */
public static getApiMethods(): string[] | undefined {
    return this.prototype[API_METHODS_METADATA];
}

/**
 * Verifica si un método HTTP está permitido
 * 
 * @param method - Método HTTP (GET, POST, PUT, DELETE)
 * @returns true si está permitido
 */
public static isMethodAllowed(method: string): boolean {
    const allowedMethods = this.getApiMethods();
    
    // Si no hay metadata, todos los métodos permitidos
    if (!allowedMethods) {
        return true;
    }
    
    // Verificar si método está en la lista
    return allowedMethods.includes(method.toUpperCase());
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~1040-1070)

---

## 🔧 Impacto en CRUD Operations

### save() con ApiMethods

```typescript
// src/entities/base_entitiy.ts

public async save(): Promise<boolean> {
    // ... validaciones ...
    
    const constructor = this.constructor as typeof BaseEntity;
    
    if (!constructor.isPersistent()) {
        return true;  // No persistente
    }
    
    const endpoint = constructor.getApiEndpoint();
    const primaryKey = constructor.getPrimaryProperty();
    const isNew = !this[primaryKey];
    
    // ========================================
    // CHECK: ¿Método permitido?
    // ========================================
    
    const requiredMethod = isNew ? 'POST' : 'PUT';
    
    if (!constructor.isMethodAllowed(requiredMethod)) {
        console.warn(`[BaseEntity] ${requiredMethod} not allowed for ${constructor.name}`);
        Application.showToast(
            `Cannot ${isNew ? 'create' : 'update'} ${constructor.getModuleNameSingular()}`,
            'error'
        );
        return false;
    }
    
    // ========================================
    // Método permitido → hacer request
    // ========================================
    
    try {
        let response;
        
        if (isNew) {
            response = await Application.axiosInstance.post(
                endpoint,
                this.toDictionary()
            );
        } else {
            response = await Application.axiosInstance.put(
                `${endpoint}/${this[primaryKey]}`,
                this.toDictionary()
            );
        }
        
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

### delete() con ApiMethods

```typescript
public async delete(): Promise<boolean> {
    // ... beforeDelete hook ...
    
    const constructor = this.constructor as typeof BaseEntity;
    
    if (!constructor.isPersistent()) {
        return true;
    }
    
    // ========================================
    // CHECK: ¿DELETE permitido?
    // ========================================
    
    if (!constructor.isMethodAllowed('DELETE')) {
        console.warn(`[BaseEntity] DELETE not allowed for ${constructor.name}`);
        Application.showToast(
            `Cannot delete ${constructor.getModuleNameSingular()}`,
            'error'
        );
        return false;
    }
    
    // ========================================
    // DELETE permitido → hacer request
    // ========================================
    
    const endpoint = constructor.getApiEndpoint();
    const primaryKey = constructor.getPrimaryProperty();
    const id = this[primaryKey];
    
    try {
        await Application.axiosInstance.delete(`${endpoint}/${id}`);
        
        this.afterDelete();
        
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

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~340-390)

---

### getElementList() con ApiMethods

```typescript
public static async getElementList(): Promise<BaseEntity[]> {
    if (!this.isPersistent()) {
        return this.getMockData();
    }
    
    // ========================================
    // CHECK: ¿GET permitido?
    // ========================================
    
    if (!this.isMethodAllowed('GET')) {
        console.warn(`[BaseEntity] GET not allowed for ${this.name}`);
        return [];
    }
    
    // ========================================
    // GET permitido → hacer request
    // ========================================
    
    const endpoint = this.getApiEndpoint();
    
    try {
        const response = await Application.axiosInstance.get(endpoint);
        
        const entities = response.data.map((data: any) => {
            const entity = new this();
            entity.updateFromDictionary(data);
            return entity;
        });
        
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

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~400-450)

---

## 🧪 Ejemplos de Uso

### 1. Read-Only Entity (Solo GET)

```typescript
import { ApiMethods } from '@/decorations/api_methods_decorator';
import { ApiEndpoint } from '@/decorations/api_endpoint_decorator';
import { ModuleName } from '@/decorations/module_name_decorator';
import { Persistent } from '@/decorations/persistent_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Report', 'Reports')
@ApiEndpoint('/api/reports')
@Persistent()
@ApiMethods(['GET'])  // ← Solo lectura
export class Report extends BaseEntity {
    @PropertyName('Report ID', Number)
    id!: number;
    
    @PropertyName('Report Name', String)
    name!: string;
    
    @PropertyName('Generated At', Date)
    generatedAt!: Date;
}
```

**Comportamiento:**
```typescript
// ✅ PERMITIDO: Leer reportes
const reports = await Report.getElementList();
// → GET /api/reports ✓

const report = await Report.getElement(42);
// → GET /api/reports/42 ✓

// ❌ BLOQUEADO: Crear, editar, eliminar
const report = new Report();
await report.save();
// → Error: "POST not allowed for Report"
// → No hace HTTP request

await report.delete();
// → Error: "DELETE not allowed for Report"
// → No hace HTTP request
```

---

### 2. Append-Only Log (GET, POST)

```typescript
@ModuleName('Audit Log', 'Audit Logs')
@ApiEndpoint('/api/audit-logs')
@Persistent()
@ApiMethods(['GET', 'POST'])  // ← Solo leer y crear (no editar/eliminar)
export class AuditLog extends BaseEntity {
    @PropertyName('Log ID', Number)
    id!: number;
    
    @PropertyName('Action', String)
    action!: string;
    
    @PropertyName('User', String)
    user!: string;
    
    @PropertyName('Timestamp', Date)
    timestamp!: Date;
}
```

**Comportamiento:**
```typescript
// ✅ PERMITIDO: Leer logs
const logs = await AuditLog.getElementList();
// → GET /api/audit-logs ✓

// ✅ PERMITIDO: Crear log
const log = new AuditLog();
log.action = 'User logged in';
log.user = 'john@example.com';
await log.save();
// → POST /api/audit-logs ✓

// ❌ BLOQUEADO: Editar log existente
log.id = 42;
log.action = 'Modified action';
await log.save();
// → Error: "PUT not allowed for Audit Log"

// ❌ BLOQUEADO: Eliminar log
await log.delete();
// → Error: "DELETE not allowed for Audit Log"
```

---

### 3. No Deletes (GET, POST, PUT)

```typescript
@ModuleName('Customer', 'Customers')
@ApiEndpoint('/api/customers')
@Persistent()
@ApiMethods(['GET', 'POST', 'PUT'])  // ← Todo menos DELETE
export class Customer extends BaseEntity {
    @PropertyName('Customer ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    name!: string;
    
    @PropertyName('Email', String)
    email!: string;
}
```

**Comportamiento:**
```typescript
// ✅ PERMITIDO: Leer, crear, editar
const customers = await Customer.getElementList();  // ✓ GET
const customer = new Customer();
await customer.save();  // ✓ POST (crear)
customer.name = 'Updated';
await customer.save();  // ✓ PUT (editar)

// ❌ BLOQUEADO: Eliminar
await customer.delete();
// → Error: "DELETE not allowed for Customer"
// → Usar soft delete en su lugar
```

---

### 4. Soft Delete Instead of Hard Delete

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
@ApiMethods(['GET', 'POST', 'PUT'])  // ← No DELETE (usar soft delete)
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Is Deleted', Boolean)
    isDeleted: boolean = false;
    
    /**
     * Override delete() para soft delete
     */
    public override async delete(): Promise<boolean> {
        // En lugar de DELETE HTTP request, hacer PUT con isDeleted=true
        this.isDeleted = true;
        return await this.save();  // PUT /api/products/42 con isDeleted:true
    }
    
    /**
     * Override getElementList() para filtrar deleted
     */
    public static override async getElementList(): Promise<Product[]> {
        const products = await super.getElementList() as Product[];
        
        // Filtrar productos eliminados
        return products.filter(p => !p.isDeleted);
    }
}
```

**Comportamiento:**
```typescript
const product = await Product.getElement(42);

await product.delete();
// → NO hace DELETE /api/products/42
// → En su lugar: PUT /api/products/42 con { isDeleted: true }

const products = await Product.getElementList();
// → GET /api/products
// → Filtra localmente productos con isDeleted=true
```

---

### 5. Custom Methods (PATCH)

```typescript
@ModuleName('User', 'Users')
@ApiEndpoint('/api/users')
@Persistent()
@ApiMethods(['GET', 'POST', 'PATCH'])  // ← PATCH en lugar de PUT
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Username', String)
    username!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    /**
     * Override save() para usar PATCH
     */
    public override async save(): Promise<boolean> {
        this.beforeSave();
        
        const isValid = await this.validateInputs();
        if (!isValid) return false;
        
        const constructor = this.constructor as typeof BaseEntity;
        const endpoint = constructor.getApiEndpoint();
        const primaryKey = constructor.getPrimaryProperty();
        const isNew = !this[primaryKey];
        
        try {
            let response;
            
            if (isNew) {
                // POST para crear
                response = await Application.axiosInstance.post(
                    endpoint,
                    this.toDictionary()
                );
            } else {
                // PATCH para actualizar (solo campos modificados)
                const changes = this.getChanges();  // Solo campos modificados
                
                response = await Application.axiosInstance.patch(
                    `${endpoint}/${this[primaryKey]}`,
                    changes
                );
            }
            
            this.updateFromDictionary(response.data);
            this.afterSave();
            
            return true;
        } catch (error) {
            console.error('[User] Save failed:', error);
            return false;
        }
    }
    
    /**
     * Obtener solo campos modificados
     */
    private getChanges(): Record<string, any> {
        // Implementación para detectar cambios
        // Retornar solo propiedades que cambiaron
        return {};
    }
}
```

---

### 6. String Syntax

```typescript
// Array syntax
@ApiMethods(['GET', 'POST', 'PUT'])
export class Product extends BaseEntity {}

// String syntax (equivalente)
@ApiMethods('GET,POST,PUT')
export class Product extends BaseEntity {}

// String con espacios
@ApiMethods('GET, POST, PUT')
export class Product extends BaseEntity {}
```

---

### 7. Conditional Methods (Environment)

```typescript
// Permitir DELETE solo en development
const isDev = import.meta.env.DEV;

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
@ApiMethods(isDev ? ['GET', 'POST', 'PUT', 'DELETE'] : ['GET', 'POST', 'PUT'])
export class Product extends BaseEntity {
    // En development: Todos los métodos
    // En production: No DELETE
}
```

---

### 8. UI Conditional Actions

```vue
<!-- ListView.vue -->

<template>
  <div class="list-view">
    <table>
      <tbody>
        <tr v-for="entity in entities" :key="entity.id">
          <td>{{ entity.name }}</td>
          <td class="actions">
            <!-- Editar: Solo si PUT permitido -->
            <button 
              v-if="entityClass.isMethodAllowed('PUT')"
              @click="editEntity(entity)"
            >
              Edit
            </button>
            
            <!-- Eliminar: Solo si DELETE permitido -->
            <button 
              v-if="entityClass.isMethodAllowed('DELETE')"
              @click="deleteEntity(entity)"
              class="danger"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Create: Solo si POST permitido -->
    <button 
      v-if="entityClass.isMethodAllowed('POST')"
      @click="createNew"
      class="create-button"
    >
      Create New
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';

const entityClass = computed(() => Application.View.value.entityClass);
</script>
```

**Resultado:**
- Si DELETE no permitido → Botón "Delete" no aparece
- Si POST no permitido → Botón "Create New" no aparece
- Si PUT no permitido → Botón "Edit" no aparece

---

## ⚠️ Consideraciones Importantes

### 1. Default: Todos los Métodos Permitidos

```typescript
// Sin @ApiMethods
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {}

Product.getApiMethods();  // → undefined (todos permitidos)
Product.isMethodAllowed('GET');    // → true
Product.isMethodAllowed('POST');   // → true
Product.isMethodAllowed('PUT');    // → true
Product.isMethodAllowed('DELETE'); // → true
```

### 2. Métodos Case-Insensitive

```typescript
// Todos equivalentes:
@ApiMethods(['GET', 'POST'])
@ApiMethods(['get', 'post'])
@ApiMethods(['Get', 'Post'])

// Se normalizan a uppercase internamente
```

### 3. Métodos Inválidos Se Ignoran

```typescript
@ApiMethods(['GET', 'POST', 'INVALID'])
//                           ^^^^^^^^^ Ignorado

Product.getApiMethods();  // → ['GET', 'POST']
```

### 4. UI Debe Respetar Restricciones

```typescript
// ✅ CORRECTO: Verificar antes de mostrar botón
<button v-if="entityClass.isMethodAllowed('DELETE')">
  Delete
</button>

// ❌ INCORRECTO: Mostrar siempre (usuario ve error)
<button @click="deleteEntity">Delete</button>
// Cliente puede intentar, pero obtendrá error del servidor
```

### 5. Backend Debe Validar También

```typescript
// ⚠️ @ApiMethods es solo frontend hint
// Backend DEBE validar permisos también

// Backend (Express):
app.delete('/api/reports/:id', (req, res) => {
    // Verificar permiso en backend
    return res.status(403).json({ error: 'DELETE not allowed' });
});
```

---

## 📚 Tabla de Métodos HTTP

| Método | Operación | Endpoint | Body | Idempotente |
|--------|-----------|----------|------|-------------|
| GET | Leer lista | `/api/products` | No | Sí |
| GET | Leer uno | `/api/products/42` | No | Sí |
| POST | Crear | `/api/products` | Sí | No |
| PUT | Actualizar completo | `/api/products/42` | Sí | Sí |
| PATCH | Actualizar parcial | `/api/products/42` | Sí (parcial) | No |
| DELETE | Eliminar | `/api/products/42` | No | Sí |

---

## 📚 Referencias Adicionales

- `api-endpoint-decorator.md` - Define URL base
- `persistent-decorator.md` - Habilita HTTP requests
- `persistent-key-decorator.md` - Define primary key
- `../../02-base-entity/crud-operations.md` - save(), delete() usan métodos HTTP
- `../../03-application/application-singleton.md` - Application.axiosInstance
- `../../tutorials/01-basic-crud.md` - CRUD completo en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/api_methods_decorator.ts`  
**Líneas:** ~50
