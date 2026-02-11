# 🔐 ModulePermission Decorator

**Referencias:**
- `module-name-decorator.md` - ModuleName define nombre, ModulePermission define acceso
- `module-icon-decorator.md` - ModuleIcon + ModulePermission para módulos completos
- `../../03-application/application-security.md` - Sistema de permisos
- `../../02-base-entity/base-entity-core.md` - getModulePermission() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/module_permission_decorator.ts`

---

## 🎯 Propósito

El decorador `@ModulePermission()` define el **permiso requerido** para acceder a un módulo (entidad). Se usa para control de acceso basado en roles (RBAC).

**Beneficios:**
- Control de acceso granular por módulo
- Seguridad centralizada
- Permisos por roles
- Ocultar módulos sin permiso

---

## 📝 Sintaxis

```typescript
@ModulePermission(permission: string)
export class EntityName extends BaseEntity {
    // ...
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `permission` | `string` | Sí | Identificador de permiso (ej: 'products.view', 'admin') |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/module_permission_decorator.ts

/**
 * Symbol para almacenar metadata de module permission
 */
export const MODULE_PERMISSION_KEY = Symbol('module_permission');

/**
 * @ModulePermission() - Define permiso requerido para acceder al módulo
 * 
 * @param permission - Identificador de permiso
 * @returns ClassDecorator
 */
export function ModulePermission(permission: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_PERMISSION_KEY] = permission;
    };
}
```

**Ubicación:** `src/decorations/module_permission_decorator.ts` (línea ~1-20)

---

## 🔍 Metadata Storage

### Estructura en Class

```typescript
// Metadata se guarda en la clase (no en prototype)
Product[MODULE_PERMISSION_KEY] = 'products.manage';
User[MODULE_PERMISSION_KEY] = 'users.manage';
Invoice[MODULE_PERMISSION_KEY] = 'admin';
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el permiso requerido del módulo
 * 
 * @returns Permiso requerido o undefined
 */
public static getModulePermission(): string | undefined {
    return (this as any)[MODULE_PERMISSION_KEY];
}

/**
 * Verifica si el usuario actual tiene permiso para acceder al módulo
 * 
 * @param user - Usuario actual
 * @returns true si tiene permiso
 */
public static hasPermission(user: User): boolean {
    const requiredPermission = this.getModulePermission();
    
    // Sin permiso requerido → acceso público
    if (!requiredPermission) {
        return true;
    }
    
    // Verificar si usuario tiene el permiso
    return user.permissions?.includes(requiredPermission) || false;
}

/**
 * Verifica permiso (método de instancia)
 */
public hasPermission(user: User): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.hasPermission(user);
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~200-240)

---

## 🎨 Impacto en Application

### Router con Permisos

```typescript
// src/router/index.ts

import { Application } from '@/models/application';

const router = createRouter({
    history: createWebHistory(),
    routes: []  // Rutas dinámicas
});

// Before each navigation
router.beforeEach((to, from, next) => {
    const entityClass = Application.View.value?.entityClass;
    
    if (entityClass) {
        const requiredPermission = entityClass.getModulePermission();
        
        if (requiredPermission) {
            const currentUser = Application.currentUser;
            
            if (!currentUser) {
                // No autenticado → redirect a login
                return next('/login');
            }
            
            if (!entityClass.hasPermission(currentUser)) {
                // Sin permiso → redirect a access denied
                return next('/access-denied');
            }
        }
    }
    
    next();
});
```

### Menu con Filtro de Permisos

```vue
<!-- src/components/SideBarComponent.vue -->

<template>
  <div class="sidebar">
    <SideBarItemComponent 
      v-for="module in availableModules" 
      :key="module.name"
      :module="module"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Application } from '@/models/application';

// Solo mostrar módulos con permiso
const availableModules = computed(() => {
    const allModules = Application.getEntityClasses();
    const currentUser = Application.currentUser;
    
    if (!currentUser) {
        return [];
    }
    
    // Filtrar por permiso
    return allModules.filter(entityClass => {
        return entityClass.hasPermission(currentUser);
    });
});
</script>
```

---

## 🧪 Ejemplos de Uso

### 1. Basic Permission

```typescript
import { ModulePermission } from '@/decorations/module_permission_decorator';
import { ModuleName } from '@/decorations/module_name_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Products')
@ModulePermission('products.manage')  // ← Solo usuarios con 'products.manage'
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
}

// Uso:
const currentUser = Application.currentUser;
const hasAccess = Product.hasPermission(currentUser);
// hasAccess = true si user.permissions.includes('products.manage')
```

---

### 2. Admin-Only Modules

```typescript
@ModuleName('Users')
@ModulePermission('admin')  // ← Solo administradores
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Username', String)
    username!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    @PropertyName('Role', String)
    role!: string;
}
```

---

### 3. Role-Based Permissions

```typescript
// Super Admin: Acceso total
@ModuleName('System Settings')
@ModulePermission('superadmin')
export class SystemSettings extends BaseEntity {
    @PropertyName('Setting Key', String)
    key!: string;
    
    @PropertyName('Setting Value', String)
    value!: string;
}

// Admin: Gestión de usuarios
@ModuleName('Users')
@ModulePermission('admin')
export class User extends BaseEntity {
    // ...
}

// Manager: Gestión de productos
@ModuleName('Products')
@ModulePermission('products.manage')
export class Product extends BaseEntity {
    // ...
}

// Employee: Solo lectura
@ModuleName('Inventory')
@ModulePermission('inventory.read')
export class Inventory extends BaseEntity {
    // ...
}

// Customer: Sin permiso (público)
@ModuleName('Public Products')
// Sin @ModulePermission → acceso público
export class PublicProduct extends BaseEntity {
    // ...
}
```

---

### 4. Granular Permissions

```typescript
// Vista de productos (lectura)
@ModuleName('Products')
@ModulePermission('products.view')
export class Product extends BaseEntity {
    // ...
}

// Edición de productos
@ModuleName('Product Management')
@ModulePermission('products.edit')
export class ProductManagement extends BaseEntity {
    // ...
}

// Eliminación de productos
@ModuleName('Product Admin')
@ModulePermission('products.delete')
export class ProductAdmin extends BaseEntity {
    // ...
}
```

---

### 5. Permission Check in Component

```vue
<template>
  <div class="product-list">
    <h2>Products</h2>
    
    <!-- Solo mostrar botón si tiene permiso -->
    <button 
      v-if="canCreate"
      @click="createProduct"
    >
      Create Product
    </button>
    
    <table>
      <!-- Lista de productos -->
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Application } from '@/models/application';
import Product from '@/entities/products';

const currentUser = computed(() => Application.currentUser);

const canCreate = computed(() => {
    if (!currentUser.value) return false;
    return Product.hasPermission(currentUser.value);
});

function createProduct() {
    if (canCreate.value) {
        // Crear producto
    }
}
</script>
```

---

### 6. Multiple Permission Levels

```typescript
// Usuario Model
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Username', String)
    username!: string;
    
    @PropertyName('Role', String)
    role!: 'customer' | 'employee' | 'manager' | 'admin' | 'superadmin';
    
    @PropertyName('Permissions', Array)
    permissions!: string[];
}

// Role → Permissions mapping
const rolePermissions: Record<string, string[]> = {
    'customer': [],
    'employee': ['inventory.read', 'orders.view'],
    'manager': ['inventory.read', 'orders.view', 'products.manage', 'orders.manage'],
    'admin': ['inventory.read', 'orders.view', 'products.manage', 'orders.manage', 'users.manage', 'admin'],
    'superadmin': ['*']  // Todos los permisos
};

// Verificar permiso con wildcard
function hasPermission(user: User, requiredPermission: string): boolean {
    if (user.permissions.includes('*')) {
        return true;  // Superadmin
    }
    
    return user.permissions.includes(requiredPermission);
}
```

---

### 7. Hierarchical Permissions

```typescript
// Permisos jerárquicos: admin.* incluye admin.users, admin.settings, etc.

function hasPermission(user: User, requiredPermission: string): boolean {
    // Check exact match
    if (user.permissions.includes(requiredPermission)) {
        return true;
    }
    
    // Check wildcard
    if (user.permissions.includes('*')) {
        return true;
    }
    
    // Check hierarchical (e.g., admin.* includes admin.users)
    const parts = requiredPermission.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
        const wildcard = parts.slice(0, i).join('.') + '.*';
        if (user.permissions.includes(wildcard)) {
            return true;
        }
    }
    
    return false;
}

// Ejemplo:
// User permissions: ['admin.*']
// hasPermission(user, 'admin.users')     → true
// hasPermission(user, 'admin.settings')  → true
// hasPermission(user, 'products.manage') → false
```

---

### 8. Permission Guard Composable

```typescript
// composables/usePermission.ts

import { computed } from 'vue';
import { Application } from '@/models/application';
import type BaseEntity from '@/entities/base_entitiy';

export function usePermission(entityClass: typeof BaseEntity) {
    const currentUser = computed(() => Application.currentUser);
    
    const hasPermission = computed(() => {
        if (!currentUser.value) return false;
        return entityClass.hasPermission(currentUser.value);
    });
    
    const requiredPermission = computed(() => {
        return entityClass.getModulePermission();
    });
    
    return {
        hasPermission,
        requiredPermission,
        currentUser
    };
}

// Uso en componente:
<script setup lang="ts">
import { usePermission } from '@/composables/usePermission';
import Product from '@/entities/products';

const { hasPermission, requiredPermission } = usePermission(Product);
</script>

<template>
  <div v-if="hasPermission">
    <!-- Contenido protegido -->
  </div>
  <div v-else>
    <p>You need "{{ requiredPermission }}" permission to access this module.</p>
  </div>
</template>
```

---

### 9. API Request with Permission

```typescript
// src/entities/base_entitiy.ts

public async save(): Promise<void> {
    const constructor = this.constructor as typeof BaseEntity;
    const requiredPermission = constructor.getModulePermission();
    
    // Verificar permiso antes de guardar
    if (requiredPermission && !constructor.hasPermission(Application.currentUser!)) {
        throw new Error(`Permission denied: ${requiredPermission}`);
    }
    
    // Validaciones...
    
    // Guardar en servidor
    const endpoint = this.getApiEndpoint();
    await axios.post(endpoint, this.toJSON(), {
        headers: {
            'X-Required-Permission': requiredPermission  // ← Backend también valida
        }
    });
}
```

---

### 10. Dynamic Permission Assignment

```typescript
// Admin panel: Asignar permisos dinámicamente

export class RolePermission extends BaseEntity {
    @PropertyName('Role', String)
    @Required()
    role!: string;
    
    @PropertyName('Permissions', Array)
    @Required()
    permissions!: string[];
}

// Cargar permisos desde backend
async function loadUserPermissions(userId: number): Promise<string[]> {
    const response = await axios.get(`/api/users/${userId}/permissions`);
    return response.data.permissions;
}

// Actualizar usuario con permisos
const user = await User.getElement(1);
user.permissions = await loadUserPermissions(user.id);

// Verificar acceso
const canAccessProducts = Product.hasPermission(user);
```

---

## ⚠️ Consideraciones Importantes

### 1. Backend Validation REQUIRED

```typescript
// ⚠️ IMPORTANTE: Frontend permission check NO es suficiente
// Backend DEBE validar permisos en cada request

// Frontend (como medida UX):
if (!Product.hasPermission(currentUser)) {
    alert('No permission');
    return;
}

// Backend (seguridad real):
// API Middleware:
app.post('/api/products', requirePermission('products.manage'), (req, res) => {
    // Solo ejecuta si usuario tiene permiso
});
```

### 2. Permission String Format

```typescript
// ✅ BUENO: Formato consistente
'products.manage'
'users.edit'
'admin'
'superadmin'

// ⚠️ EVITAR: Formato inconsistente
'PRODUCTS_MANAGE'
'edit-users'
'Admin'
```

### 3. Public Modules (No Permission)

```typescript
// Sin @ModulePermission → módulo público
@ModuleName('Public Blog')
export class PublicBlog extends BaseEntity {
    // Accesible sin autenticación
}

// hasPermission() retorna true para módulos públicos
```

### 4. Permission Caching

```typescript
// Cachear permisos de usuario para performance
class Application {
    private static _currentUser: User | null = null;
    private static _permissionsCache: Set<string> | null = null;
    
    public static get currentUser(): User | null {
        return this._currentUser;
    }
    
    public static set currentUser(user: User | null) {
        this._currentUser = user;
        
        // Actualizar cache
        this._permissionsCache = user 
            ? new Set(user.permissions) 
            : null;
    }
    
    public static hasPermission(permission: string): boolean {
        if (!this._permissionsCache) return false;
        
        // O(1) lookup con Set
        return this._permissionsCache.has(permission) || 
               this._permissionsCache.has('*');
    }
}
```

### 5. Testing Permissions

```typescript
describe('Product Module Permission', () => {
    it('should require products.manage permission', () => {
        expect(Product.getModulePermission()).toBe('products.manage');
    });
    
    it('should grant access to users with permission', () => {
        const user = new User();
        user.permissions = ['products.manage'];
        
        expect(Product.hasPermission(user)).toBe(true);
    });
    
    it('should deny access to users without permission', () => {
        const user = new User();
        user.permissions = ['orders.view'];
        
        expect(Product.hasPermission(user)).toBe(false);
    });
    
    it('should grant access to superadmin', () => {
        const admin = new User();
        admin.permissions = ['*'];
        
        expect(Product.hasPermission(admin)).toBe(true);
    });
});
```

---

## 📚 Referencias Adicionales

- `module-name-decorator.md` - Nombre del módulo
- `module-icon-decorator.md` - Icono del módulo
- `../../03-application/application-security.md` - Sistema de seguridad
- `../../02-base-entity/base-entity-core.md` - getModulePermission(), hasPermission()
- `../../tutorials/03-security.md` - Tutorial de permisos (si existe)

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/module_permission_decorator.ts`  
**Líneas:** ~20
