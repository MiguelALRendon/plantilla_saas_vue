# Router del Framework

## Propósito

El router maneja la navegación entre módulos y vistas del framework, sincronizándose automáticamente con el estado de `Application.View`. Utiliza Vue Router con rutas dinámicas que se mapean a módulos (entidades) y sus vistas de lista/detalle.

---

## Ubicación
`src/router/index.ts`

---

## Arquitectura de Rutas

### Esquema de URLs

```
/                           → Home (redirige al primer módulo)
/:module                    → Vista de lista del módulo
/:module/:oid               → Vista de detalle/edición
```

**Ejemplos**:
```
/products                   → Lista de productos
/products/new               → Crear nuevo producto
/products/123               → Editar producto con ID 123
/customers                  → Lista de clientes
/customers/456              → Editar cliente con ID 456
```

---

## Rutas Definidas

### 1. Ruta Home (`/`)

```typescript
{
    path: '/',
    name: 'Home',
    redirect: () => {
        // Redirigir al primer módulo si existe
        if (Application && Application.ModuleList.value.length > 0) {
            const firstModule = Application.ModuleList.value[0];
            const moduleName = firstModule.getModuleName() || firstModule.name;
            return `/${moduleName.toLowerCase()}`;
        }
        return '/';
    }
}
```

**Comportamiento**:
- Redirige automáticamente al primer módulo de `Application.ModuleList`
- Si `ModuleList` está vacío, permanece en `/`
- Usa `@ModuleName()` si está definido, sino usa el nombre de la clase

**Ejemplo**:
```typescript
Application.ModuleList.value = [Products, Customers, Orders];
// Navegación a / redirige a /products
```

---

### 2. Ruta ModuleList (`/:module`)

```typescript
{
    path: '/:module',
    name: 'ModuleList',
    component: { template: '<component-container-component />' },
    meta: { viewType: 'list' }
}
```

**Parámetros**:
- `module`: Nombre del módulo en lowercase (ej: `products`, `customers`)

**Componente Renderizado**: `ComponentContainerComponent`
- Lee `Application.View.value.component` para determinar qué vista renderizar
- Típicamente: `DefaultListView` → `DetailViewTableComponent`

**Metadata**:
- `viewType: 'list'` - Indica que es una vista de listado

**Flujo de Navegación**:
```
Usuario navega a /products
    ↓
Router busca módulo "products" en Application.ModuleList
    ↓
Encuentra clase Products
    ↓
Application.changeViewToListView(Products)
    ↓
Application.View.value = {
    entityClass: Products,
    entityObject: null,
    component: DefaultListView,
    viewType: ViewTypes.LISTVIEW,
    entityOid: ""
}
    ↓
ComponentContainerComponent renderiza DefaultListView
    ↓
DefaultListView renderiza DetailViewTableComponent con tabla de productos
```

---

### 3. Ruta ModuleDetail (`/:module/:oid`)

```typescript
{
    path: '/:module/:oid',
    name: 'ModuleDetail',
    component: { template: '<component-container-component />' },
    meta: { viewType: 'detail' }
}
```

**Parámetros**:
- `module`: Nombre del módulo en lowercase (ej: `products`)
- `oid`: Object ID - `"new"` para crear, o ID numérico para editar

**Componente Renderizado**: `ComponentContainerComponent`
- Renderiza `Application.View.value.component`
- Típicamente: `DefaultDetailView` con formulario dinámico

**Metadata**:
- `viewType: 'detail'` - Indica vista de detalle/edición

**Flujo de Navegación - Crear Nuevo**:
```
Usuario navega a /products/new
    ↓
Router detecta módulo "products" y oid "new"
    ↓
Application.View.value.entityOid = "new"
    ↓
moduleClass.createNewInstance()  // new Products()
    ↓
Application.changeViewToDetailView(newProduct)
    ↓
Application.View.value = {
    entityClass: Products,
    entityObject: newProduct,
    component: DefaultDetailView,
    viewType: ViewTypes.DETAILVIEW,
    entityOid: "new"
}
    ↓
ComponentContainerComponent renderiza DefaultDetailView
    ↓
Formulario vacío para crear producto
```

**Flujo de Navegación - Editar Existente**:
```
Usuario navega a /products/123
    ↓
Router detecta módulo "products" y oid "123"
    ↓
Application.View.value.entityOid = "123"
    ↓
(FUTURO: Cargar entidad desde API)
// const product = await Products.load(123);
    ↓
Application.changeViewToDetailView(product)
    ↓
Formulario con datos del producto ID 123
```

---

## Inicialización del Router

### initializeRouterWithApplication()

```typescript
let Application: any = null;

export function initializeRouterWithApplication(app: any) {
    Application = app;
}
```

**Propósito**: Inyectar la referencia de `Application` singleton en el router después de que ambos se hayan inicializado.

**Problema que Resuelve**: Dependencia circular
- `router/index.ts` necesita acceso a `Application` (para sincronizar rutas)
- `Application` necesita acceso a `router` (para navegar programáticamente)
- No pueden importarse directamente entre sí

**Solución**: Lazy initialization
```typescript
// main.ts
import Application from '@/models/application';
import router, { initializeRouterWithApplication } from '@/router';

// 1. Crear app
const app = createApp(App);

// 2. Montar router
app.use(router);

// 3. Inicializar Application con router
Application.initializeApplication(router);

// 4. Inyectar Application en router
initializeRouterWithApplication(Application);

// 5. Montar app
app.mount('#app');
```

---

## Navigation Guards

### beforeEach - Sincronización con Application

```typescript
router.beforeEach((to, _from, next) => {
    if (!Application) {
        next();
        return;
    }

    const moduleName = to.params.module as string;
    const oid = to.params.oid as string;

    // Buscar el módulo correspondiente
    const moduleClass = Application.ModuleList.value.find((mod: typeof BaseEntity) => {
        const modName = mod.getModuleName() || mod.name;
        return modName.toLowerCase() === moduleName?.toLowerCase();
    });

    if (moduleClass) {
        const currentModule = Application.View.value.entityClass;
        const currentModuleName = currentModule ? 
            (currentModule.getModuleName() || currentModule.name).toLowerCase() : '';
        const currentOid = Application.View.value.entityOid;
        
        // Solo actualizar Application si la URL es diferente
        if (currentModuleName !== moduleName.toLowerCase() || currentOid !== (oid || '')) {
            if (oid && to.meta.viewType === 'detail') {
                Application.View.value.entityOid = oid;
                
                if (oid === 'new') {
                    const newEntity = moduleClass.createNewInstance();
                    Application.changeViewToDetailView(newEntity);
                } else {
                    console.log('[Router] Preparando detail view para OID:', oid);
                }
            } else {
                Application.View.value.entityOid = '';
                
                if (Application.View.value.viewType !== 'LISTVIEW') {
                    Application.changeViewToListView(moduleClass);
                }
            }
        }
        
        next();
    } else {
        console.warn('[Router] Módulo no encontrado:', moduleName);
        next();
    }
});
```

**Funcionalidad**:

1. **Validación de Application**:
   - Si `Application` no está inicializado, permite navegación sin sincronizar
   
2. **Extracción de Parámetros**:
   - `moduleName` (ej: `"products"`)
   - `oid` (ej: `"123"`, `"new"`, o `undefined` para lista)

3. **Búsqueda de Módulo**:
   ```typescript
   const moduleClass = Application.ModuleList.value.find((mod: typeof BaseEntity) => {
       const modName = mod.getModuleName() || mod.name;
       return modName.toLowerCase() === moduleName?.toLowerCase();
   });
   ```
   - Busca en `ModuleList` la clase que coincida con el nombre de la URL
   - Usa `@ModuleName()` decorador si existe, sino usa nombre de clase

4. **Detección de Cambios**:
   - Compara estado actual de `Application.View` con parámetros de URL
   - Solo actualiza si son diferentes (evita re-renders innecesarios)

5. **Sincronización**:
   
   **Para Detail View** (`/:module/:oid`):
   ```typescript
   Application.View.value.entityOid = oid;
   
   if (oid === 'new') {
       const newEntity = moduleClass.createNewInstance();
       Application.changeViewToDetailView(newEntity);
   }
   // else: cargar desde API (FUTURO)
   ```
   
   **Para List View** (`/:module`):
   ```typescript
   Application.View.value.entityOid = '';
   Application.changeViewToListView(moduleClass);
   ```

6. **Manejo de Errores**:
   - Si el módulo no existe en `ModuleList`, imprime warning pero permite navegación
   - Esto previene que la app se rompa si alguien navega a un módulo inexistente

---

### afterEach - Logging de Navegación

```typescript
router.afterEach((to) => {
    if (Application) {
        console.log('[Router] Navegado a:', to.path, '| entityOid:', Application.View.value.entityOid);
    }
});
```

**Propósito**: Debugging
- Imprime cada navegación exitosa con el path y el `entityOid` actualizado
- Solo activo cuando `Application` está inicializado

**Output Ejemplo**:
```
[Router] Navegado a: /products | entityOid: 
[Router] Navegado a: /products/123 | entityOid: 123
[Router] Navegado a: /products/new | entityOid: new
```

---

## Uso Programático

### Navegar desde Application

```typescript
// Application.ts - changeViewToListView
changeViewToListView(entityClass: typeof BaseEntity) {
    const moduleName = entityClass.getModuleName() || entityClass.name;
    const moduleRoute = `/${moduleName.toLowerCase()}`;
    
    this.router?.push(moduleRoute);  // ← Navegación programática
    
    this.View.value = {
        entityClass: entityClass,
        entityObject: null,
        component: entityClass.getListComponent(),
        viewType: ViewTypes.LISTVIEW,
        isValid: false,
        entityOid: ''
    };
}

// Application.ts - changeViewToDetailView
changeViewToDetailView(entity: BaseEntity) {
    const moduleName = entity.constructor.getModuleName() || entity.constructor.name;
    const oid = entity.getUniquePropertyValue() || 'new';
    const detailRoute = `/${moduleName.toLowerCase()}/${oid}`;
    
    this.router?.push(detailRoute);  // ← Navegación programática
    
    this.View.value = {
        entityClass: entity.constructor as typeof BaseEntity,
        entityObject: entity,
        component: entityClass.getDetailComponent(),
        viewType: ViewTypes.DETAILVIEW,
        isValid: entity.isEntityValid(),
        entityOid: String(oid)
    };
}
```

**Flujo Completo**:
```
1. SaveButton.vue hace click
    ↓
2. Application.changeViewToListView(Products)
    ↓
3. Application actualiza View state
    ↓
4. Application.router.push('/products')  ← Navegación programática
    ↓
5. Router.beforeEach detecta cambio
    ↓
6. beforeEach compara URL con Application.View
    ↓
7. Si ya coinciden, no hace nada (evita loop)
    ↓
8. Router renderiza ComponentContainerComponent
    ↓
9. ComponentContainerComponent renderiza Application.View.value.component (DefaultListView)
```

---

## Navegación Manual (usuario cambia URL)

### Escenario: Usuario escribe `/customers/789` en la barra de direcciones

```
1. Browser cambia URL a /customers/789
    ↓
2. Router.beforeEach se dispara
    ↓
3. Extrae params: { module: "customers", oid: "789" }
    ↓
4. Busca módulo "customers" en Application.ModuleList
    ↓
5. Encuentra clase Customer
    ↓
6. Compara con Application.View.value actual
    ↓
7. Detecta que Application.View tiene módulo diferente o OID diferente
    ↓
8. Actualiza Application.View.value:
   - entityClass = Customer
   - entityOid = "789"
   - viewType = ViewTypes.DETAILVIEW
    ↓
9. (FUTURO): Llama Customer.load(789) para cargar datos
    ↓
10. ComponentContainerComponent re-renderiza con nueva vista
    ↓
11. Se muestra formulario de edición de Customer 789
```

---

## Casos de Uso

### 1. Lista de Productos

**URL**: `/products`

**Application.View Result**:
```typescript
{
    entityClass: Products,
    entityObject: null,
    component: DefaultListView,
    viewType: ViewTypes.LISTVIEW,
    entityOid: ""
}
```

**Renderizado**:
```
ComponentContainerComponent
└── DefaultListView
    └── DetailViewTableComponent
        └── <table> con productos
```

---

### 2. Crear Nuevo Producto

**URL**: `/products/new`

**Application.View Result**:
```typescript
{
    entityClass: Products,
    entityObject: new Products(),  // ← Entidad vacía
    component: DefaultDetailView,
    viewType: ViewTypes.DETAILVIEW,
    entityOid: "new"
}
```

**Renderizado**:
```
ComponentContainerComponent
└── DefaultDetailView
    └── Formulario con campos vacíos
```

---

### 3. Editar Producto Existente

**URL**: `/products/123`

**Application.View Result**:
```typescript
{
    entityClass: Products,
    entityObject: product123,  // ← (FUTURO: cargado desde API)
    component: DefaultDetailView,
    viewType: ViewTypes.DETAILVIEW,
    entityOid: "123"
}
```

**Renderizado**:
```
ComponentContainerComponent
└── DefaultDetailView
    └── Formulario con datos de producto 123
```

---

### 4. Redirección desde Home

**URL**: `/`

**Redirección automática**:
```typescript
if (Application.ModuleList.value[0] === Products) {
    // Redirige a /products
}
```

---

## Decoradores Relacionados

### @ModuleName()

```typescript
@ModuleName("productos")
class Products extends BaseEntity {
    // ...
}

// URL generada: /productos (en lugar de /products)
```

**Sin `@ModuleName()`**:
```typescript
class Products extends BaseEntity { }
// URL generada: /products (usa nombre de clase en lowercase)
```

---

## Integración con History API

El router usa `createWebHistory()`:

```typescript
const router: Router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});
```

**Ventajas**:
- URLs limpias sin `#` (ej: `/products` en lugar de `/#/products`)
- Compatible con navegación del navegador (botones atrás/adelante)
- SEO-friendly (URLs interpretables por buscadores)

**Configuración del Servidor Requerida**:
```nginx
# nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Sin esta configuración, navegar directamente a `/products/123` daría 404 porque el servidor no tiene ese archivo físico.

---

## Implementación Futura - Carga desde API

```typescript
// En router beforeEach
if (oid && oid !== 'new') {
    // Cargar entidad desde backend
    try {
        const entity = await moduleClass.load(oid);
        Application.changeViewToDetailView(entity);
    } catch (error) {
        console.error('[Router] Error loading entity:', error);
        Application.ApplicationUIService.pushToast({
            type: ToastType.ERROR,
            title: 'Error',
            message: 'No se pudo cargar la entidad'
        });
        // Redirigir a lista
        next({ name: 'ModuleList', params: { module: moduleName } });
        return;
    }
}
```

---

## Debugging

### Ver ruta actual
```typescript
console.log('Current route:', router.currentRoute.value);
// { path: '/products/123', params: { module: 'products', oid: '123' }, ... }
```

### Ver historial de navegación
```typescript
// Navegar atrás programáticamente
router.back();

// Navegar adelante
router.forward();

// Ir a ruta específica con estado
router.push({ 
    name: 'ModuleDetail', 
    params: { module: 'products', oid: '123' } 
});
```

### Ver módulos disponibles
```typescript
console.log('Available modules:', Application.ModuleList.value.map(m => 
    m.getModuleName() || m.name
));
// ["Products", "Customers", "Orders"]
```

### Testear navegación manual
```typescript
// En consola del navegador
Application.changeViewToListView(Products);
// O directamente:
router.push('/products');
```

### Ver sincronización
```typescript
// Después de navegar
console.log('URL:', router.currentRoute.value.path);
console.log('Application.View.entityOid:', Application.View.value.entityOid);
// Deben coincidir
```

---

## Consideraciones

- ✅ **Sincronización bidireccional**: Cambios en URL actualizan Application, cambios en Application actualizan URL
- ✅ **Prevención de loops**: beforeEach compara estados antes de actualizar
- ⚠️ **Carga desde API pendiente**: Actualmente solo funciona con entidades ya cargadas en memoria
- ⚠️ **Sin lazy loading**: Todas las vistas se cargan con la app (no hay code splitting por módulo)
- ✅ **Case-insensitive**: Nombres de módulos en URL se normalizan a lowercase
- ⚠️ **Sin validación de OID**: No valida que el OID exista en backend antes de navegar

---

## Extensión - Rutas Custom

Si necesitas rutas fuera del patrón `/:module/:oid`:

```typescript
const routes: Array<RouteRecordRaw> = [
    // ... rutas existentes ...
    
    // Ruta custom
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }
    },
    
    // Ruta de login
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: { public: true }
    },
    
    // Catch-all 404
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundView
    }
];

// Guard de autenticación
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next({ name: 'Login' });
    } else {
        next();
    }
});
```

---

## Resumen

| Aspecto | Descripción |
|---------|-------------|
| **Patrón de URLs** | `/:module` (lista), `/:module/:oid` (detalle) |
| **Componente Principal** | `ComponentContainerComponent` (renderiza dinámicamente) |
| **Sincronización** | Bidireccional entre URL y `Application.View` |
| **Guards** | `beforeEach` sincroniza, `afterEach` logea |
| **Inicialización** | `initializeRouterWithApplication()` resuelve dependencia circular |
| **History Mode** | HTML5 History API (URLs limpias sin `#`) |
| **Lazy Loading** | No implementado (todas las vistas se cargan con la app) |
| **Carga de Datos** | Pendiente de implementar (actualmente solo con datos en memoria) |
