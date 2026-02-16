# Router Integration

## 1. Propósito

Sincronizar estado de navegación entre Vue Router y Application singleton mediante rutas genéricas dinámicas, eliminando necesidad de definir rutas manualmente por módulo, generando automáticamente rutas ListView (/:module) y DetailView (/:module/:oid) para todas las entidades registradas en ModuleList.

## 2. Alcance

### 2.1 Responsabilidades

- Definir rutas genéricas /:module y /:module/:oid para todos los módulos
- Sincronizar router.currentRoute con Application.View state
- Ejecutar beforeEach guard para resolver módulo desde params.module
- Redirigir ruta raíz (/) al primer módulo en ModuleList
- Integrar con Application importado directamente en el módulo router
- Actualizar Application.View cuando URL cambia directamente (navegación browser)
- Renderizar ComponentContainerComponent para todas las rutas de módulos

### 2.2 Límites

- No define rutas estáticas específicas por entidad (rutas genéricas)
- No valida permisos de acceso a rutas (responsabilidad de guards adicionales)
- No gestiona redirects complejos o nested routes
- No implementa lazy loading de módulos (todos registrados en ModuleList)
- No controla history back/forward (Vue Router nativo)
- No persiste estado de navegación (session storage)

### 2.3 Contrato de Tipado Estricto (2026-02-16)

- `src/router/index.ts` no debe usar `any` en casts de clases de módulo.
- Las clases concretas para navegación deben tiparse con `Record<string, unknown>`.
- Las definiciones globales de Vue en `src/env.d.ts` deben evitar `any` y usar `unknown`.

## 3. Definiciones Clave

**Rutas Genéricas**: Rutas con parámetros dinámicos (/:module, /:module/:oid) que funcionan para todas las entidades, eliminando necesidad de rutas por módulo.

**/:module Route**: Ruta ListView genérica (e.g., /products, /customers) donde :module matchea moduleName lowercase.

**/:module/:oid Route**: Ruta DetailView genérica (e.g., /products/42, /customers/new) donde :oid es identificador único o 'new'.

**initializeRouterWithApplication()**: Función legacy sin efectos mantenida por compatibilidad retroactiva.

**beforeEach Guard**: Navigation guard ejecutado antes de cada navegación, resuelve moduleClass desde params.module y actualiza Application.View.

**ComponentContainerComponent**: Componente genérico renderizado por todas las rutas, lee Application.View para determinar qué component renderizar (ListView o DetailView).

**Module Resolution**: Proceso de buscar entityClass en ModuleList.value comparando getModuleName() lowercase con params.module.

**Router-Application Sync**: Sincronización bidireccional donde Application.changeView() actualiza router, y router navigation actualiza Application.View.

## 4. Descripción Técnica

### 4.1 Definición de Rutas Genéricas

```typescript
// src/router/index.ts (líneas 8-33)
const routes: Array<RouteRecordRaw> = [
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
    },
    {
        path: '/:module',
        name: 'ModuleList',
        component: { template: '<component-container-component />' },
        meta: { viewType: 'list' }
    },
    {
        path: '/:module/:oid',
        name: 'ModuleDetail',
        component: { template: '<component-container-component />' },
        meta: { viewType: 'detail' }
    }
];
```

**Ruta Raíz '/'**: Redirect dinámico al primer módulo registrado. Si ModuleList vacío, permanece en '/'.

**ModuleList Route**: /:module renderiza ComponentContainerComponent con meta.viewType = 'list'. Ejemplos: /products, /customers, /orders.

**ModuleDetail Route**: /:module/:oid renderiza ComponentContainerComponent con meta.viewType = 'detail'. Ejemplos: /products/42, /customers/new.

### 4.2 Router Creation

```typescript
// src/router/index.ts (líneas 36-39)
const router: Router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});
```

createWebHistory para URLs limpias sin #hash. BASE_URL desde import.meta.env para subdirectory deployment.

### 4.3 Integración con Application

```typescript
// src/router/index.ts
import Application from '@/models/application';

export function initializeRouterWithApplication(): void {
    // Legacy no-op: Application se importa directamente
}
```

Application se usa por import directo en guards y redirects. `initializeRouterWithApplication()` permanece únicamente para evitar rupturas en imports antiguos.

### 4.4 beforeEach Navigation Guard

```typescript
// src/router/index.ts (líneas 47-104)
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
        // Si la navegación viene de cambiar la URL directamente (no desde Application)
        // necesitamos actualizar Application
        const currentModule = Application.View.value.entityClass;
        const currentModuleName = currentModule ? (currentModule.getModuleName() || currentModule.name).toLowerCase() : '';
        const currentOid = Application.View.value.entityOid;
        
        // Solo actualizar Application si la URL es diferente de lo que Application tiene
        if (currentModuleName !== moduleName.toLowerCase() || currentOid !== (oid || '')) {
            if (oid && to.meta.viewType === 'detail') {
                // Vista de detalle - setear entityOid
                Application.View.value.entityOid = oid;
                
                // Si el OID es 'new', crear una nueva instancia
                if (oid === 'new') {
                    const newEntity = moduleClass.createNewInstance();
                    Application.changeViewToDetailView(newEntity);
                } else {
                    // Para OIDs existentes, componente maneja carga
                    console.log('[Router] Preparando detail view para OID:', oid);
                }
                
            } else {
                // Vista de lista
                Application.View.value.entityOid = '';
                
                // Cambiar a list view si no estamos ahí
                if (Application.View.value.viewType !== 'LISTVIEW') {
                    Application.changeViewToListView(moduleClass);
                }
            }
        }
        
        next();
    } else {
        // Módulo no encontrado
        console.warn('[Router] Módulo no encontrado:', moduleName);
        next(false); // Cancelar navegación
    }
});
```

**Module Resolution**: Busca moduleClass en ModuleList.value comparando getModuleName() lowercase.

**Sync Check**: Solo actualiza Application si URL difiere de Application.View state (evita loops).

**DetailView Handling**: Si oid === 'new', crea instancia con createNewInstance() y sincroniza View. Si oid existente, ejecuta `moduleClass.getElement(oid)` y sincroniza View con la entidad cargada.

**ListView Handling**: Limpia entityOid y llama changeViewToListView() si viewType no es LISTVIEW.

**Module Not Found**: Si moduleClass no encontrado, cancela navegación con next(false).

### 4.5 Router Export

```typescript
// src/router/index.ts (líneas 106-113)
export default router;
export { initializeRouterWithApplication };
```

Export default de router para app.use(router) en main.js. Named export de initializeRouterWithApplication se mantiene como legacy no-op.

## 5. Flujo de Funcionamiento

### 5.1 Inicialización del Router en main.js

```
main.js ejecuta
    ↓
import router from '@/router'
    ↓
import Application from '@/models/application'
    ↓
Application.ModuleList.value.push(Products, Orders, Customers)
    ↓
const app = createApp(App)
    ↓
app.use(router)
    ↓
Application.initializeRouter(router)
    → Application.router = router
    → updateRouterFromView() ahora puede usar router.push()
    ↓
app.mount('#app')
    ↓
Router listo, navegación habilitada
```

### 5.2 Navegación Programática via Application.changeView()

```
Usuario click "Products" en SideBar
    ↓
SideBarItem ejecuta:
Application.changeViewToListView(Products)
    ↓
changeView(Products, ListComponent, LISTVIEW, null)
    ↓
setViewChanges() actualiza:
    - View.value.entityClass = Products
    - View.value.entityObject = null
    - View.value.viewType = LISTVIEW
    - View.value.entityOid = ''
    ↓
updateRouterFromView(Products, null)
    ↓
moduleName = 'Products', moduleNameLower = 'products'
    ↓
targetPath = '/products'
    ↓
currentRoute.path !== '/products' → TRUE
    ↓
router.push({ name: 'ModuleList', params: { module: 'products' } })
    ↓
Vue Router navega a /products
    ↓
beforeEach guard ejecuta:
    - params.module = 'products'
    - moduleClass = Products (found en ModuleList)
    - currentModuleName = 'products', currentOid = ''
    - URL match Application state → NO actualiza Application (ya actualizado)
    - next() permite navegación
    ↓
ComponentContainerComponent re-renderiza con Application.View.value
    ↓
Renderiza component = Products.getModuleListComponent()
```

### 5.3 Navegación Directa via Browser URL

```
Usuario escribe /customers/42 en address bar y presiona Enter
    ↓
Vue Router detecta cambio de URL
    ↓
beforeEach guard ejecuta:
    - to.params.module = 'customers'
    - to.params.oid = '42'
    ↓
Busca moduleClass en ModuleList:
const moduleClass = Application.ModuleList.value.find(
    mod => mod.getModuleName().toLowerCase() === 'customers'
)
    → moduleClass = Customers (found)
    ↓
Verifica si Application needs update:
    - currentModuleName = 'products' (estaba en lista de productos)
    - moduleName = 'customers'
    - currentModuleName !== moduleName → TRUE
    ↓
oid = '42', to.meta.viewType = 'detail' → Ruta de detalle
    ↓
Application.View.value.entityOid = '42'
    ↓
oid !== 'new' → No crear instancia, componente carga datos
    ↓
next() permite navegación
    ↓
ComponentContainerComponent detecta Application.View.value change
    ↓
Renderiza component = Customers.getModuleDetailComponent()
    ↓
DetailView monta, lee Application.View.value.entityOid = '42'
    ↓
DetailView ejecuta:
const customer = await Customers.getElement(42)
    ↓
DetailView renderiza formulario con datos de customer
```

### 5.4 Navegación a Nueva Entidad (/module/new)

```
Usuario click "New" button en ListView de Products
    ↓
NewButtonComponent ejecuta:
const newProduct = new Products();
Application.changeViewToDetailView(newProduct);
    ↓
setViewChanges() actualiza View:
    - entityClass = Products
    - entityObject = newProduct (instancia vacía)
    - viewType = DETAILVIEW
    - entityOid = 'new' (uniqueValue es undefined → 'new')
    ↓
updateRouterFromView(Products, newProduct):
    - targetPath = '/products/new'
    - router.push({ name: 'ModuleDetail', params: { module: 'products', oid: 'new' } })
    ↓
Vue Router navega a /products/new
    ↓
beforeEach guard ejecuta:
    - params.module = 'products', params.oid = 'new'
    - moduleClass = Products (found)
    - currentModuleName = 'products', currentOid = 'new'
    - URL match Application state → NO actualiza (ya sincronizado)
    - next()
    ↓
ComponentContainerComponent renderiza DetailView
    ↓
DetailView monta con Application.View.value.entityObject = newProduct
    ↓
FormInputs renderizados vacíos (entity nueva)
```

### 5.5 404 - Módulo No Encontrado

```
Usuario navega a /nonexistent-module
    ↓
beforeEach guard ejecuta:
    - params.module = 'nonexistent-module'
    ↓
Busca moduleClass en ModuleList:
Application.ModuleList.value.find(...)
    → moduleClass = undefined (not found)
    ↓
else branch:
console.warn('[Router] Módulo no encontrado:', 'nonexistent-module');
next(false);
    ↓
next(false) cancela navegación
    ↓
Usuario permanece en ruta anterior
    ↓
Opcional: Mostrar toast "Módulo no encontrado"
```

## 6. Reglas Obligatorias

### 6.1 Inicialización del Router

1. Llamar Application.initializeRouter(router) durante bootstrap ANTES de cualquier changeView()
2. Registrar módulos en ModuleList antes de depender de redirect inicial '/'
3. `initializeRouterWithApplication()` es opcional (legacy no-op)
4. No crear router instances múltiples (singleton)
5. Usar createWebHistory para URLs limpias (no createWebHashHistory excepto legacy)

### 6.2 Definición de Rutas

6. Rutas genéricas /:module y /:module/:oid son inmutables (no agregar rutas por módulo)
7. Todos los módulos comparten mismas rutas, diferenciados por :module param
8. ComponentContainerComponent es componente genérico para todas las rutas de módulos
9. meta.viewType proporciona hint ('list', 'detail') para logging
10. Rutas estáticas (/, /login, /dashboard) OK, pero no conflictuar con módulos

### 6.3 beforeEach Guard

11. Guard DEBE verificar if (!Application) antes de procesar
12. moduleClass resolution OBLIGATORIA con .find() en ModuleList
13. Si moduleClass no encontrado, ejecutar next(false) para cancelar navegación
14. Solo actualizar Application.View si URL difiere de state actual (evitar loops)
15. Para oid === 'new', crear instancia con moduleClass.createNewInstance(); para oid existente, cargar con moduleClass.getElement(oid)

### 6.4 Navegación Programática

16. SIEMPRE usar Application.changeView() methods, NUNCA router.push() directo
17. updateRouterFromView() es método privado, llamado automáticamente
18. Si currentRoute.path === targetPath, NO ejecutar router.push() (evitar warnings)
19. Ignore NavigationDuplicated errors con catch (no crítico)
20. entityOid DEBE sincronizarse con params.oid

### 6.5 ComponentContainerComponent

21. Componente lee Application.View.value para determinar qué renderizar
22. Watch Application.View.value cambios para re-render reactivo
23. No cachear component references (usar markRaw si necesario)
24. Renderiza component dinámicamente con <component :is="component" />
25. Maneja casos de entityClass null (fallback a mensaje "No module selected")

### 6.6 Module Name Mapping

26. moduleName SIEMPRE lowercase en URL (getModuleName().toLowerCase())
27. Comparison case-insensitive (toLowerCase() en ambos lados)
28. Fallback a class.name si getModuleName() retorna null
29. No permitir espacios en moduleName (usar - para palabras compuestas)
30. moduleName único por módulo (no duplicados en ModuleList)

## 7. Prohibiciones

### 7.1 Prohibiciones de Definición de Rutas

1. PROHIBIDO agregar rutas específicas por módulo (/:products, /:customers)
2. PROHIBIDO nested routes dentro de rutas de módulos
3. PROHIBIDO modificar routes array después de createRouter()
4. PROHIBIDO rutas con matcheo ambiguo (/:foo, /:bar)
5. PROHIBIDO rutas estáticas que conflictúen con módulos (e.g., /products estático cuando Products existe)

### 7.2 Prohibiciones de Navegación

6. PROHIBIDO router.push() directo desde componentes (usar Application.changeView)
7. PROHIBIDO router.replace() sin actualizar Application.View
8. PROHIBIDO navegación sin verificar si módulo existe en ModuleList
9. PROHIBIDO back/forward manipulation sin sincronizar Application
10. PROHIBIDO múltiples router.push() síncronos (causa warnings)

### 7.3 Prohibiciones de beforeEach Guard

11. PROHIBIDO lógica asíncrona bloqueante en beforeEach (usar async guards)
12. PROHIBIDO modificar to.params directamente (inmutable)
13. PROHIBIDO next() sin argumentos cuando cancelando (usar next(false))
14. PROHIBIDO múltiples next() calls en misma ejecución (error)
15. PROHIBIDO actualizar Application.View sin verificar cambio necesario (loops)

### 7.4 Prohibiciones de Sincronización

16. PROHIBIDO updateRouterFromView() manual (llamado automáticamente)
17. PROHIBIDO modificar Application.View sin correspondiente router.push()
18. PROHIBIDO router.push() sin correspondiente Application.View update
19. PROHIBIDO asumir que router.push() es síncrono (usar await si critico)
20. PROHIBIDO ignorar router errors (puede causar estado inconsistente)

### 7.5 Prohibiciones de Params

21. PROHIBIDO params.module con uppercase (siempre lowercase)
22. PROHIBIDO params.oid con espacios o caracteres especiales
23. PROHIBIDO asumir params.oid es número (puede ser 'new' o string)
24. PROHIBIDO modificar params en guards después de navigation
25. PROHIBIDO params custom (:foo) fuera de :module y :oid

### 7.6 Prohibiciones de ComponentContainerComponent

26. PROHIBIDO renderizar componentes específicos directamente (usar Application.View)
27. PROHIBIDO cachear component references sin invalidation
28. PROHIBIDO asunciones sobre entityObject (puede ser null)
29. PROHIBIDO lógica de negocio en ComponentContainer (solo renderizado)
30. PROHIBIDO estilos específicos de módulo en ComponentContainer (scope a módulo)

## 8. Dependencias

### 8.1 Dependencia Directa de Vue Router

**vue-router (vue-router)**
- Versión: ^4.0.0
- API: createRouter, createWebHistory, RouteRecordRaw, Router, beforeEach
- Crítico: Sí, core del routing system
- Guards: beforeEach para module resolution

### 8.2 Dependencia de Application

**Application Singleton (@/models/application)**
- Relación: Router sincroniza con Application.View state
- Métodos usados: changeViewToListView(), changeViewToDetailView(), initializeRouter()
- Propiedades: View.value.entityClass, View.value.entityOid, ModuleList.value
- Crítico: Sí, source of truth para navegación

### 8.3 Dependencia de BaseEntity

**BaseEntity (@/entities/base_entity)**
- Métodos usados: getModuleName(), createNewInstance()
- Type: typeof BaseEntity en ModuleList.value
- Crítico: Sí, module resolution depende de getModuleName()

### 8.4 Dependencia de Componentes

**ComponentContainerComponent (@/components/ComponentContainerComponent)**
- Renderizado: Todas las rutas /:module y /:module/:oid
- Consumo: Lee Application.View.value.component y renderiza
- Crítico: Sí, sin este componente rutas no renderizarían nada

### 8.5 Dependencia de Enums

**ViewTypes (@/enums/view_type)**
- Valores: LISTVIEW, DETAILVIEW, DEFAULTVIEW
- Uso: meta.viewType en route definition, Application.View.value.viewType
- Crítico: Sí, determina tipo de vista

## 9. Relaciones

### 9.1 Relación con Application Singleton

**Sincronización Bidireccional**
- Application.changeView() → updateRouterFromView() → router.push()
- Router navigation → beforeEach guard → Application.View update

**initializeRouter() Integration**
```typescript
// main.js
Application.initializeRouter(router);
// Ahora Application.router disponible para updateRouterFromView()
```

**initializeRouterWithApplication() Integration**
```typescript
// main.js
initializeRouterWithApplication(Application);
// Ahora beforeEach guard puede acceder Application
```

### 9.2 Relación con ModuleList

**Module Resolution**
```typescript
const moduleClass = Application.ModuleList.value.find(
    mod => mod.getModuleName().toLowerCase() === moduleName.toLowerCase()
);
```

ModuleList es fuente de verdad para módulos disponibles. Solo módulos registrados son navegables.

**Home Redirect**
```typescript
redirect: () => {
    if (Application.ModuleList.value.length > 0) {
        const firstModule = Application.ModuleList.value[0];
        return `/${firstModule.getModuleName().toLowerCase()}`;
    }
    return '/';
}
```

Ruta raíz redirige al primer módulo registrado.

### 9.3 Relación con ComponentContainerComponent

**Dynamic Component Rendering**
```vue
<!-- ComponentContainerComponent.vue -->
<component :is="Application.View.value.component" />
```

ComponentContainerComponent lee Application.View y renderiza component correspondiente (ListView o DetailView).

**Reactivity**
```typescript
watch(() => Application.View.value, () => {
    // Re-render cuando View cambia
});
```

### 9.4 Relación con ListView/DetailView

**ListView desde URL**
- URL: /products
- beforeEach: Resuelve Products, llama changeViewToListView(Products)
- Application.View.component = Products.getModuleListComponent()
- ComponentContainer renderiza ListView

**DetailView desde URL**
- URL: /products/42
- beforeEach: Resuelve Products, setea entityOid = '42'
- Application.View.component = Products.getModuleDetailComponent()
- ComponentContainer renderiza DetailView
- DetailView carga entity con getElement(42)

### 9.5 Relación con Navegación Browser

**Back Button**
- Usuario presiona browser back
- Router history change detectado
- beforeEach ejecuta con to = previous URL
- Application.View actualizado a previous state
- ComponentContainer re-renderiza previous component

**Address Bar Navigation**
- Usuario escribe URL directamente
- beforeEach ejecuta con to = nueva URL
- Module resolution y Application update
- ComponentContainer renderiza

**URL Copy/Paste**
- Usuario comparte /products/42
- Otro usuario abre URL
- beforeEach resuelve Products y oid=42
- DetailView carga y renderiza producto

## 10. Notas de Implementación

### 10.1 Setup Completo en main.js

```typescript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router, { initializeRouterWithApplication } from './router';
import Application from './models/application';
import { Products } from './entities/products';
import { Customers } from './entities/customers';
import { Orders } from './entities/orders';

// 1. Registrar módulos PRIMERO
Application.ModuleList.value.push(Products, Customers, Orders);

// 2. Inicializar router con Application
initializeRouterWithApplication(Application);

// 3. Crear app y usar router
const app = createApp(App);
app.use(router);

// 4. Inicializar Application con router
Application.initializeRouter(router);

// 5. Montar app
app.mount('#app');
```

Orden crítico garantiza sincronización correcta.

### 10.2 ComponentContainerComponent Implementation

```vue
<template>
    <div class="component-container">
        <component 
            v-if="Application.View.value.component"
            :is="Application.View.value.component"
        />
        <div v-else class="no-module">
            <p>No module selected</p>
        </div>
    </div>
</template>

<script setup>
import { watch } from 'vue';
import Application from '@/models/application';

// Watch para logging (opcional)
watch(() => Application.View.value.component, (newComponent) => {
    console.log('[ComponentContainer] Rendering:', newComponent?.name);
});
</script>
```

### 10.3 Testing Router Integration

**Unit Test - Module Resolution**
```typescript
test('beforeEach resolves module from params', async () => {
    Application.ModuleList.value = [Products];
    
    await router.push('/products');
    
    expect(Application.View.value.entityClass).toBe(Products);
    expect(Application.View.value.viewType).toBe(ViewTypes.LISTVIEW);
});
```

**Integration Test - Navigation**
```typescript
test('navigating to /products/42 loads DetailView', async () => {
    Application.ModuleList.value = [Products];
    
    await router.push('/products/42');
    
    expect(router.currentRoute.value.path).toBe('/products/42');
    expect(Application.View.value.entityOid).toBe('42');
});
```

### 10.4 Debugging Router Issues

**Log Navigation**
```typescript
router.beforeEach((to, from, next) => {
    console.log('[Router] Navigating:', from.path, '→', to.path);
    // ... resto del guard
    next();
});
```

**Log Module Resolution**
```typescript
const moduleClass = Application.ModuleList.value.find(...);
if (moduleClass) {
    console.log('[Router] Module resolved:', moduleClass.name);
} else {
    console.error('[Router] Module not found:', moduleName);
}
```

### 10.5 BaseEntity Hook: onBeforeRouteLeave()

**Ubicación en código:** `src/entities/base_entity.ts` (líneas 883-885)

**Propósito:** Hook de integración con Vue Router guards para detectar navegación fuera de vista de detalle con cambios sin guardar.

**Firma:**
```typescript
public onBeforeRouteLeave(): boolean
```

**Retorno:** 
- `true` - Hay cambios sin guardar (dirty state)
- `false` - No hay cambios, navegación permitida

**Implementación:**
```typescript
public onBeforeRouteLeave(): boolean {
    return this.getDirtyState();
}
```

**Uso en componentes de detalle:**
```typescript
// En default_detailview.vue o componente custom de detalle
import { onBeforeRouteLeave } from 'vue-router';

// Setup hook
onBeforeRouteLeave((to, from) => {
    const entity = Application.View.value.entityObject;
    if (entity && entity.onBeforeRouteLeave()) {
        // Hay cambios sin guardar
        const answer = window.confirm('¿Descartar cambios sin guardar?');
        if (!answer) return false; // Bloquear navegación
    }
    return true; // Permitir navegación
});
```

**Integración con Application:**
El método `Application.changeView()` ya verifica dirty state internamente:
```typescript
changeView = (entityClass, component, viewType, entity = null) => {
    if (this.View.value.entityObject?.getDirtyState()) {
        // Muestra confirmación antes de navegar
        this.ApplicationUIService.openConfirmationMenu(...);
        return;
    }
    // Continúa con navegación
}
```

**Nota:** Este hook permite implementar guards personalizados en componentes que necesiten control fino sobre navegación. No es necesario implementarlo en componentes que usan `Application.changeView()` ya que esta verificación está integrada.

## 11. Referencias Cruzadas

### 11.1 Application Layer

**copilot/layers/03-application/application-singleton.md**
- Métodos: initializeRouter(), changeView(), updateRouterFromView()
- Propiedades: router, View, ModuleList
- Sincronización: Router push/pop sincroniza con Application.View

**copilot/layers/03-application/event-bus.md**
- Evento: view-changed (si implementado)
- Emisión: Application.changeView() puede emitir evento

### 11.2 BaseEntity Core

**copilot/layers/02-base-entity/metadata-access.md**
- Método: getModuleName() usado para module resolution
- Método: createNewInstance() usado para /module/new routes

### 11.3 Decoradores

**copilot/layers/01-decorators/module-name-decorator.md**
- getModuleName() determina :module param en URL
- ModuleName debe ser lowercase-compatible

### 11.4 Componentes

**copilot/layers/04-components/ComponentContainerComponent.md**
- Renderizado: Todas las rutas /:module y /:module/:oid
- Consumo: Application.View.value.component

**copilot/layers/04-components/SideBarComponent.md**
- Navegación: Click ejecuta Application.changeViewToListView()
- Sincroniza: Router refleja cambio

### 11.5 Código Fuente

**src/router/index.ts**
- Líneas 1-113: Implementación completa
- Líneas 8-33: Route definitions
- Líneas 47-104: beforeEach guard

**src/models/application.ts**
- Líneas 163-198: updateRouterFromView() implementation
- Línea 261-263: initializeRouter() method

### 11.6 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 7: Router integration con Application
- Principio: Router refleja Application state

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Router genérico con rutas dinámicas
- Contexto: Eliminación de rutas manuales

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Navigation Flow con Router
- Flujo: User action → Application.changeView → Router.push → beforeEach → ComponentContainer render
