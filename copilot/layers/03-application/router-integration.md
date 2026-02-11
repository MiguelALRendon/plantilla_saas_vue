# 🛣️ Router Integration

**Referencias:**
- `application-singleton.md` - Application gestiona router
- `event-bus.md` - Eventos de navegación
- `../02-base-entity/crud-operations.md` - CRUD navega usando router
- `../../02-FLOW-ARCHITECTURE.md` - Flujo de navegación completo

---

## 📍 Ubicación en el Código

**Archivo:** `src/router/index.ts`  
**Integración:** `src/models/application.ts`

---

## 🎯 Propósito

El sistema de **routing automático** genera rutas dinámicamente para cada módulo registrado, eliminando la necesidad de definir rutas manualmente. Cada entidad con `@ModuleName` obtiene automáticamente:

1. **ListView route:** `/entity-name` (lista de registros)
2. **DetailView route:** `/entity-name/:id` (ver/editar registro)
3. **Create route:** `/entity-name/new` (crear nuevo registro)

**Beneficio:** Registras una entidad → rutas creadas automáticamente.

---

## 🏗️ Configuración del Router

### Router Base (index.ts)

```typescript
// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Vistas por defecto
import DefaultListView from '@/views/default_listview.vue';
import DefaultDetailView from '@/views/default_detailview.vue';

// Rutas estáticas (si las hay)
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
```

**Ubicación:** `src/router/index.ts` (línea ~1-30)

---

## 🔄 Sistema de Rutas Genéricas

### Implementación Real del Framework

El framework utiliza un **sistema de rutas genéricas** que funcionan para TODAS las entidades, sin necesidad de crear rutas específicas por módulo.

### Rutas Definidas en router/index.ts

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import DefaultListView from '@/views/default_listview.vue';
import DefaultDetailView from '@/views/default_detailview.vue';

const routes = [
    {
        path: '/',
        redirect: () => {
            // Redirigir al primer módulo
            if (Application.ModuleList.value.length > 0) {
                const firstModule = Application.ModuleList.value[0];
                const moduleName = firstModule.getModuleName()?.toLowerCase() || 'home';
                return `/${moduleName}`;
            }
            return '/home';
        }
    },
    {
        // RUTA GENÉRICA PARA TODAS LAS LISTAS
        path: '/:module',
        name: 'ModuleList',
        component: DefaultListView,
        // :module puede ser "products", "customers", "orders", etc.
    },
    {
        // RUTA GENÉRICA PARA TODOS LOS DETALLES
        path: '/:module/:oid',
        name: 'ModuleDetail',
        component: DefaultDetailView,
        // :module = nombre del módulo
        // :oid = identificador del registro ("42", "new", etc.)
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Integración con Application
export function initializeRouterWithApplication(app: typeof Application) {
    router.beforeEach((to, from, next) => {
        const moduleName = to.params.module as string;
        const oid = to.params.oid as string;
        
        if (moduleName) {
            // Buscar módulo en ModuleList
            const moduleClass = app.ModuleList.value.find(
                m => m.getModuleName()?.toLowerCase() === moduleName.toLowerCase()
            );
            
            if (moduleClass) {
                app.View.value.entityClass = moduleClass;
                app.View.value.entityOid = oid || '';
            }
        }
        
        next();
    });
}

export default router;
```

**Ubicación:** `src/router/index.ts`

### Cómo se Registran los Módulos

```typescript
// En src/models/application.ts (final del archivo)
import { Products } from '@/entities/products';
import { Customer } from '@/entities/customer';
import { Order } from '@/entities/order';

// Agregar módulos directamente al array
Application.ModuleList.value.push(Products, Customer, Order);

// No se crean rutas dinámicas
// Las rutas genéricas /:module y /:module/:oid ya existen para todos
```

**Ubicación:** `src/models/application.ts` (línea ~279)

### Ventajas del Sistema de Rutas Genéricas

✅ **Configuración simple** - Solo 2 rutas para infinitas entidades  
✅ **Sin código repetitivo** - No hay `addRoute()` por cada módulo  
✅ **URL consistentes** - Todas las entidades usan el mismo patrón  
✅ **Fácil mantenimiento** - Cambios en una ruta afectan a todas  
✅ **Type-safe** - Los componentes leen `Application.View` para saber qué entidad renderizar

### Ejemplos de URLs

```
/products          → Lista de productos
/products/42       → Detalle del producto con OID 42
/products/new      → Crear nuevo producto

/customers         → Lista de clientes
/customers/100     → Detalle del cliente con OID 100  
/customers/new     → Crear nuevo cliente

/orders            → Lista de órdenes
/orders/xyz-123    → Detalle de la orden con OID xyz-123
/orders/new        → Crear nueva orden
```

Todas estas URLs usan las mismas 2 rutas genéricas definidas en el router.

---

## 🎯 Flujo de Navegación Completo

### 1. Usuario Hace Click en "Products" (SideBar)

```
1. Usuario click "Products" en sidebar
        ↓
2. SideBarItemComponent llama:
   Application.changeViewToDefaultView(Product)
        ↓
3. Application actualiza View.value:
   - entityClass = Product
   - viewType = DEFAULTVIEW
   - entityObject = null
        ↓
4. Application.router.push({ 
     name: 'ModuleList', 
     params: { module: 'products' } 
   })
   → Navega a /products
        ↓
5. Router busca ruta '/:module'
   → Encuentra: {
       path: '/:module',
       name: 'ModuleList',
       component: DefaultListView
     }
        ↓
6. Router guard (beforeEach) ejecuta:
   - Lee params.module = 'products'
   - Busca en ModuleList la clase Product
   - Confirma que Application.View.entityClass = Product
        ↓
7. DefaultListView se monta
        ↓
8. DefaultListView lee Application.View.value.entityClass
   → entityClass = Product
        ↓
9. DetailViewTableComponent usa Product para:
   - Obtener metadatos (columnas, nombres)
   - Renderizar tabla
        ↓
10. Tabla con productos se muestra
```

### 2. Usuario Hace Click en "Edit" (ListView)

```
1. Usuario click "Edit" en fila producto ID 42
        ↓
2. DetailViewTableComponent llama:
   Application.changeViewToDetailView(productInstance)
        ↓
3. Application actualiza View.value:
   - entityClass = Product
   - viewType = DETAILVIEW  
   - entityObject = productInstance
   - entityOid = "42"
        ↓
4. Application.router.push({ 
     name: 'ModuleDetail', 
     params: { module: 'products', oid: '42' } 
   })
   → Navega a /products/42
2. ListView llama:
   Application.changeViewToDetailView(Product, 42)
        ↓
3. Application.changeView(Product, ViewType.DETAIL, 42)
        ↓
4. Application actualiza View.value:
   - entityClass = Product
   - viewType = DETAIL
   - entity = null (temporalmente)
        ↓
5. Application.router.push('/products/42')
        ↓
6. Router busca ruta '/products/42'
   → Encuentra: {
       path: '/products/:id',
       component: DefaultDetailView,
       meta: { entityClass: Product, viewType: DETAIL }
     }
        ↓
7. DefaultDetailView se monta
        ↓
8. DefaultDetailView lee route.params.id = '42'
        ↓
9. DefaultDetailView carga producto:
   product = await Product.getElement(42)
        ↓
10. DefaultDetailView actualiza Application.View.value.entity = product
        ↓
11. Renderiza formulario con datos del producto
```

### 3. Usuario Hace Click en "Create" (ListView)

```
1. Usuario click "Create New" en ListView
        ↓
2. ListView llama:
   Application.changeViewToDetailView(Product)
        ↓
3. Application.changeView(Product, ViewType.DETAIL)  // sin ID
        ↓
4. Application.router.push('/products/new')
        ↓
5. Router busca ruta '/products/new'
   → Encuentra: '/products/:id' (donde :id = 'new')
        ↓
6. DefaultDetailView se monta
        ↓
7. DetailView detecta params.id === 'new'
        ↓
8. DetailView crea nueva instancia:
   product = new Product()
        ↓
9. Application.View.value.entity = product
        ↓
10. Renderiza formulario vacío
```

---

## 🧩 Componentes de Vista

### DefaultListView

```vue
<!-- src/views/default_listview.vue -->

<template>
  <div class="list-view">
    <!-- Header -->
    <div class="header">
      <h1>{{ moduleNamePlural }}</h1>
      <button @click="createNew">Create New</button>
    </div>
    
    <!-- Loading -->
    <div v-if="isLoading" class="loading">Loading...</div>
    
    <!-- Table -->
    <table v-else>
      <thead>
        <tr>
          <th v-for="prop in displayProperties" :key="prop">
            {{ entityClass.getPropertyName(prop) }}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entity in entities" :key="entity[primaryKey]">
          <td v-for="prop in displayProperties" :key="prop">
            {{ formatValue(entity, prop) }}
          </td>
          <td>
            <button @click="editEntity(entity)">Edit</button>
            <button @click="deleteEntity(entity)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Application from '@/models/application';
import type BaseEntity from '@/entities/base_entitiy';

// ========================================
// Setup
// ========================================

const route = useRoute();
const entityClass = computed(() => Application.View.value.entityClass);
const entities = ref<BaseEntity[]>([]);
const isLoading = ref(true);

// ========================================
// Computed
// ========================================

const moduleNamePlural = computed(() => 
    entityClass.value?.getModuleNamePlural() || ''
);

const displayProperties = computed(() => 
    entityClass.value?.getProperties().filter(prop => 
        !entityClass.value.isHideInListView(prop)
    ) || []
);

const primaryKey = computed(() => 
    entityClass.value?.getPrimaryProperty() || 'id'
);

// ========================================
// Methods
// ========================================

async function loadData() {
    if (!entityClass.value) return;
    
    isLoading.value = true;
    try {
        entities.value = await entityClass.value.getElementList();
    } catch (error) {
        console.error('Failed to load entities:', error);
        Application.showToast('Failed to load data', 'error');
    } finally {
        isLoading.value = false;
    }
}

function createNew() {
    Application.changeViewToDetailView(entityClass.value);
}

function editEntity(entity: BaseEntity) {
    const id = entity[primaryKey.value];
    Application.changeViewToDetailView(entityClass.value, id);
}

async function deleteEntity(entity: BaseEntity) {
    Application.showModal({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete this ${entityClass.value.getModuleNameSingular()}?`,
        buttons: [
            {
                label: 'Cancel',
                action: () => Application.closeModal()
            },
            {
                label: 'Delete',
                action: async () => {
                    const deleted = await entity.delete();
                    if (deleted) {
                        Application.closeModal();
                        await loadData();  // Reload list
                    }
                },
                primary: true,
                dangerous: true
            }
        ]
    });
}

function formatValue(entity: BaseEntity, prop: string): string {
    const value = entity[prop];
    const displayFormat = entityClass.value.getDisplayFormat(prop);
    
    if (displayFormat) {
        return displayFormat(value);
    }
    
    return value?.toString() || '';
}

// ========================================
// Lifecycle
// ========================================

onMounted(() => {
    loadData();
    
    // Escuchar eventos de actualización
    Application.eventBus.on('entity-saved', loadData);
    Application.eventBus.on('entity-deleted', loadData);
});

onUnmounted(() => {
    Application.eventBus.off('entity-saved', loadData);
    Application.eventBus.off('entity-deleted', loadData);
});
</script>
```

**Ubicación:** `src/views/default_listview.vue` (línea ~1-150)

---

### DefaultDetailView

```vue
<!-- src/views/default_detailview.vue -->

<template>
  <div class="detail-view">
    <!-- Header -->
    <div class="header">
      <h1>{{ isNew ? 'Create' : 'Edit' }} {{ moduleNameSingular }}</h1>
      <button @click="goBack">Back to List</button>
    </div>
    
    <!-- Loading -->
    <div v-if="isLoading" class="loading">Loading...</div>
    
    <!-- Form -->
    <form v-else @submit.prevent="saveEntity">
      <div 
        v-for="prop in editableProperties" 
        :key="prop"
        class="form-group"
      >
        <label>
          {{ entityClass.getPropertyName(prop) }}
          <span v-if="entityClass.isRequired(prop)" class="required">*</span>
        </label>
        
        <!-- Componente de input dinámico -->
        <component 
          :is="getInputComponent(prop)"
          v-model="entity[prop]"
          :property="prop"
          :entity="entity"
          :entity-class="entityClass"
          :disabled="entityClass.isReadOnly(prop) || entityClass.isDisabled(prop)"
        />
        
        <!-- Error de validación -->
        <span v-if="entity.errors[prop]" class="error">
          {{ entity.errors[prop] }}
        </span>
      </div>
      
      <!-- Actions -->
      <div class="actions">
        <button type="button" @click="goBack">Cancel</button>
        <button type="submit" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Application from '@/models/application';
import type BaseEntity from '@/entities/base_entitiy';

// ========================================
// Setup
// ========================================

const route = useRoute();
const entity = ref<BaseEntity | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);

const entityClass = computed(() => Application.View.value.entityClass);
const isNew = computed(() => route.params.id === 'new');

// ========================================
// Computed
// ========================================

const moduleNameSingular = computed(() => 
    entityClass.value?.getModuleNameSingular() || ''
);

const editableProperties = computed(() => 
    entityClass.value?.getProperties().filter(prop => 
        !entityClass.value.isHideInDetailView(prop)
    ) || []
);

// ========================================
// Methods
// ========================================

async function loadData() {
    if (!entityClass.value) return;
    
    isLoading.value = true;
    try {
        if (isNew.value) {
            // Crear nueva instancia
            entity.value = new entityClass.value();
        } else {
            // Cargar existente
            const id = route.params.id;
            entity.value = await entityClass.value.getElement(id);
        }
        
        // Actualizar Application.View
        Application.View.value.entity = entity.value;
    } catch (error) {
        console.error('Failed to load entity:', error);
        Application.showToast('Failed to load data', 'error');
        goBack();
    } finally {
        isLoading.value = false;
    }
}

async function saveEntity() {
    if (!entity.value) return;
    
    isSaving.value = true;
    try {
        const saved = await entity.value.save();
        
        if (saved) {
            Application.showToast('Saved successfully', 'success');
            goBack();
        }
    } catch (error) {
        console.error('Save failed:', error);
        Application.showToast('Save failed', 'error');
    } finally {
        isSaving.value = false;
    }
}

function goBack() {
    Application.changeViewToListView(entityClass.value);
}

function getInputComponent(prop: string): string {
    const type = entityClass.value.getPropertyType(prop);
    
    // Mapeo tipo → componente
    const componentMap = {
        String: 'TextInput',
        Number: 'NumberInput',
        Boolean: 'CheckboxInput',
        Date: 'DateInput',
        Object: 'ObjectInput',
        Array: 'ArrayInput'
    };
    
    return componentMap[type.name] || 'TextInput';
}

// ========================================
// Lifecycle
// ========================================

onMounted(() => {
    loadData();
});
</script>
```

**Ubicación:** `src/views/default_detailview.vue` (línea ~1-140)

---

## 🛠️ Guards de Navegación

### Proteger Rutas (Auth)

```typescript
// src/router/index.ts

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!Application.currentUser;
    const requiresAuth = to.meta.requiresAuth !== false;  // por defecto true
    
    if (requiresAuth && !isAuthenticated) {
        // Redirigir a login
        next({
            path: '/login',
            query: { redirect: to.fullPath }  // Guardar ruta destino
        });
    } else {
        next();
    }
});
```

### Actualizar Application.View en Navegación

```typescript
router.beforeEach((to, from, next) => {
    // Si la ruta tiene meta.entityClass, actualizar View
    if (to.meta.entityClass) {
        Application.View.value.entityClass = to.meta.entityClass;
        Application.View.value.viewType = to.meta.viewType;
    }
    
    next();
});
```

### Verificar Permisos por Módulo

```typescript
router.beforeEach((to, from, next) => {
    const entityClass = to.meta.entityClass;
    
    if (entityClass) {
        const permission = entityClass.getModulePermission();
        const userHasPermission = Application.currentUser?.hasPermission(permission);
        
        if (!userHasPermission) {
            Application.showToast('You do not have permission', 'error');
            next(false);  // Bloquear navegación
            return;
        }
    }
    
    next();
});
```

**Ubicación:** `src/router/index.ts` (línea ~40-80)

---

## 🔧 API de Router Internal

### initializeRouter()

```typescript
initializeRouter(router: Router): void
```

**Propósito:** Vincula la instancia de Vue Router con Application.

**Parámetros:**
- `router: Router` - Instancia de Vue Router creada con `createRouter()`

**Ubicación:** `src/models/application.ts` (línea 269)

**Ejemplo:**

```typescript
// src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Application from './models/application';

const app = createApp(App);

// ========================================
// VINCULAR ROUTER CON APPLICATION
// ========================================
Application.initializeRouter(router);
// → Application.router = router
// → Permite a Application controlar navegación

app.use(router);
app.mount('#app');
```

**Comportamiento:**
- Almacena referencia al router en `Application.router`
- Debe llamarse **antes** de navegar o cambiar vistas
-Solo necesita llamarse una vez durante inicialización de la app

**Error común:**

```typescript
// ❌ INCORRECTO: Cambiar vista antes de inicializar router
Application.changeViewToDefaultView(Product);  // ← Error: router es undefined
Application.initializeRouter(router);

// ✅ CORRECTO: Inicializar router primero
Application.initializeRouter(router);
Application.changeViewToDefaultView(Product);
```

**Nota:** Los módulos se agregan directamente a `ModuleList.value.push()` y no requieren configuración especial del router.

---

### updateRouterFromView()

```typescript
private updateRouterFromView(
    entityClass: typeof BaseEntity, 
    entity: BaseEntity | null = null
): void
```

**Propósito:** Sincroniza la URL del router con el estado de `Application.View`.

**Parámetros:**
- `entityClass: typeof BaseEntity` - Clase de la entidad actual
- `entity: BaseEntity | null` - Instancia de entidad (null para listview)

**Ubicación:** `src/models/application.ts` (línea 169)

**Comportamiento:**

```
Si entity es null:
    → Navegar a /:module (ListView)
    
Si entity existe:
    → Navegar a /:module/:oid (DetailView)
    
Prevenir navegación duplicada:
    → Si ya estamos en la ruta correcta, no navegar
```

**Ejemplo de uso interno:**

```typescript
// Dentro de Application.changeView()
private setViewChanges = (
    entityClass: typeof BaseEntity, 
    viewType: ViewTypes, 
    entity: BaseEntity | null = null
) => {
    // Actualizar Application.View
    this.View.value = {
        entityClass,
        viewType,
        entityObject: entity,
        // ...
    };
    
    // Sincronizar URL con estado
    this.updateRouterFromView(entityClass, entity);
    // → Si ListView: router.push('/products')
    // → Si DetailView: router.push('/products/42')
};
```

**Lógica interna:**

```typescript
private updateRouterFromView = (
    entityClass: typeof BaseEntity, 
    entity: BaseEntity | null = null
) => {
    if (!this.router) return;
    
    const moduleName = entityClass.getModuleName() || entityClass.name;
    const moduleNameLower = moduleName.toLowerCase();
    
    const currentRoute = this.router.currentRoute.value;
    
    if (entity) {
        // DetailView: /:module/:oid
        const targetPath = `/${moduleNameLower}/${this.View.value.entityOid}`;
        
        if (currentRoute.path !== targetPath) {
            this.router.push(targetPath).catch(err => {
                // Ignorar error de navegación duplicada
                if (err.name !== 'NavigationDuplicated') {
                    console.error('Navigation error:', err);
                }
            });
        }
    } else {
        // ListView: /:module
        const targetPath = `/${moduleNameLower}`;
        
        if (currentRoute.path !== targetPath) {
            this.router.push(targetPath).catch(err => {
                if (err.name !== 'NavigationDuplicated') {
                    console.error('Navigation error:', err);
                }
            });
        }
    }
};
```

**Casos de uso:**

```
Usuario llama: Application.changeViewToListView(Product)
    ↓
Application.setViewChanges(Product, LISTVIEW, null)
    ↓
Application.updateRouterFromView(Product, null)
    ↓
Router.push('/products')  ← URL sincronizada

---

Usuario llama: Application.changeViewToDetailView(Product, 42)
    ↓
Application.setViewChanges(Product, DETAILVIEW, productInstance)
    ↓
Application.updateRouterFromView(Product, productInstance)
    ↓
Router.push('/products/42')  ← URL sincronizada
```

**Prevención de navegación duplicada:**

```typescript
// Si ya estamos en /products, no navegar de nuevo
this.router.currentRoute.value.path === '/products'
// → Skip navigation
// → Evita error NavigationDuplicated

// Si navegamos de /products a /products/42
this.router.currentRoute.value.path !== '/products/42'
// → Proceder con navigation
```

---

## 🧪 Ejemplos de Uso

### 1. Navegación Programática

```typescript
// En cualquier componente o código

// Ir a lista de productos
Application.changeViewToListView(Product);
// → Router navega a /products
// → DefaultListView se monta
// → Carga Product.getElementList()

// Ir a editar producto 42
Application.changeViewToDetailView(Product, 42);
// → Router navega a /products/42
// → DefaultDetailView se monta
// → Carga Product.getElement(42)

// Crear nuevo producto
Application.changeViewToDetailView(Product);
// → Router navega a /products/new
// → DetailView crea new Product()
```

### 2. Usar useRouter en Componentes

```vue
<script setup>
import { useRouter } from 'vue-router';
import Application from '@/models/application';

const router = useRouter();

// Navegar directamente con router
function navigateToProducts() {
    router.push('/products');
}

// O usar Application (recomendado)
function navigateToProducts() {
    Application.changeViewToListView(Product);
}
</script>
```

### 3. Leer Params en Componente

```vue
<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

// Leer ID de la ruta /products/42
const productId = route.params.id;  // '42'

// Leer query params /products?search=laptop
const search = route.query.search;  // 'laptop'
</script>
```

### 4. Navegación con Query Params

```typescript
// Navegar con query params
Application.router.push({
    path: '/products',
    query: {
        search: 'laptop',
        category: 'electronics',
        page: 2
    }
});
// → URL: /products?search=laptop&category=electronics&page=2

// Leer en componente
const route = useRoute();
const search = route.query.search;       // 'laptop'
const category = route.query.category;   // 'electronics'
const page = Number(route.query.page);   // 2
```

### 5. Redirigir Después de Guardar

```typescript
async function saveProduct(product: Product) {
    const saved = await product.save();
    
    if (saved) {
        // Opción 1: Volver a lista
        Application.changeViewToListView(Product);
        
        // Opción 2: Ir a detalle del producto guardado
        Application.changeViewToDetailView(Product, product.id);
        
        // Opción 3: Ir a otra vista
        Application.changeViewToListView(Order);
    }
}
```

### 6. Componentes Custom por Módulo

```typescript
// Entity con componentes custom
import ProductListView from '@/views/ProductListView.vue';
import ProductDetailView from '@/views/ProductDetailView.vue';

@ModuleName('Products')
@ModuleListComponent(ProductListView)
@ModuleDetailComponent(ProductDetailView)
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    // ... propiedades
}
```

**Funcionamiento:**

1. Entidad define componentes custom con decoradores
2. Al navegar a `/products`, el router carga `DefaultListView`
3. `DefaultListView` lee `Product.getModuleListComponent()`
4. Si retorna componente custom, lo usa; sino usa vista default
5. Lo mismo para DetailView

**Ventaja:** No requiere modificar rutas, solo decoradores en la entidad.

**Nota:** El sistema de rutas genéricas soporta componentes custom sin necesidad de crear rutas adicionales. Los componentes leen `Application.View.value.entityClass` para determinar qué entidad renderizar y qué componente custom usar (si está definido).

---

## ⚠️ Consideraciones Importantes

### 1. Order de Registro Importa

```typescript
// ✅ CORRECTO: Configurar router antes de cambiar vistas
Application.initializeRouter(router);
Application.changeViewToDefaultView(Product);

// ❌ INCORRECTO: Router no configurado
Application.changeViewToDefaultView(Product);  // ← Error: router es undefined
Application.initializeRouter(router);
```

### 2. Agregar Módulos a ModuleList

```typescript
// Los módulos se agregan directamente al array
Application.ModuleList.value.push(Product);

// Agregar múltiples módulos
Application.ModuleList.value.push(Product, Customer, Order);

// Evitar duplicados (opcional)
if (!Application.ModuleList.value.includes(Product)) {
    Application.ModuleList.value.push(Product);
}
```

### 3. OIDs en URL

```typescript
// URLs esperadas:
'/products'       → ListView
'/products/42'    → DetailView (OID "42")
'/products/new'   → DetailView (crear nuevo)

// OIDs pueden ser string o number
// El framework los trata como string en las URLs
```

### 4. Parámetros de Ruta

```typescript
// Las rutas genéricas tienen parámetros:
{
    path: '/:module/:oid',
    name: 'ModuleDetail',
    component: DefaultDetailView
}

// Acceso a parámetros:
    }
}

// Acceder en componente:
const route = useRoute();
const entityClass = route.meta.entityClass;
```

---

## 📚 Referencias Adicionales

- `application-singleton.md` - Application.router, changeView()
- `event-bus.md` - Eventos de navegación
- `../02-base-entity/crud-operations.md` - save() redirige después de crear
- `../../02-FLOW-ARCHITECTURE.md` - Diagrama flujo navegación
- `../../tutorials/01-basic-crud.md` - Navegación en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/router/index.ts`, `src/models/application.ts`  
**Líneas totales:** ~150 (router), ~280 (application)
