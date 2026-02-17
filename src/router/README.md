# Router Directory

## 1. Propósito

Contiene la configuración de vue-router que define las rutas de navegación de la aplicación SaaS. Implementa routing dinámico donde la mayoría de vistas se renderizan mediante una ruta única `/view` que lee `Application.View.value` para decidir qué componente mostrar (DefaultListView o DefaultDetailView).

## 2. Alcance

### Responsabilidades
- `index.ts` - Configuración de vue-router con definición de rutas, guards de navegación y export de router instance

**Rutas típicas:**
- `/` - Home/Dashboard
- `/view` - Ruta dinámica que renderiza DefaultListView o DefaultDetailView según Application.View
- `/login` - Autenticación (si implementada)

### Límites
- NO contiene lógica de negocio - Solo routing
- NO decide qué vista renderizar - Application.View.value lo hace
- NO valida permisos - Guards pueden implementarlo pero no es core

## 3. Definiciones Clave

**Dynamic Routing**: Patrón donde una ruta genérica `/view` renderiza diferentes componentes según estado de Application.View, evitando rutas hardcoded por cada entity.

**Application.View**: Objeto reactivo que contiene: `{ entity: typeof BaseEntity, viewType: ViewType, mode: ViewMode }`, usado por DefaultView para decidir qué renderizar.

**Navigation Guards**: beforeEach/afterEach hooks para ejecutar lógica antes/después de navegación (autenticación, logging, etc.).

**Router Instance Injection**: `Application.router = router` en main.ts permite que Application.changeView() ejecute navegación programática.

## 4. Descripción Técnica

`index.ts` crea router con createRouter():
```typescript
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomeView.vue')
    },
    {
        path: '/view',
        name: 'DefaultView',
        component: () => import('@/views/default_listview.vue'),  // o detailview
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
```

`main.ts` inyecta router en Application:
```typescript
import router from '@/router';
import { Application } from '@/models/application';

Application.router = router;

const app = createApp(App);
app.use(router);
```

Application.changeView() ejecuta:
```typescript
changeView(entity, viewType, mode) {
    Application.View = new View(entity, viewType, mode);
    Application.router.push({ name: 'DefaultView' });
}
```

DefaultListView/DefaultDetailView lee Application.View para renderizar entity correcta.

## 5. Flujo de Funcionamiento

**Navegación a Lista de Productos:**
1. Usuario click en SideBarItemComponent "Products"
2. SideBarItemComponent ejecuta `Application.changeView(ProductEntity, ViewType.LIST)`
3. Application.changeView():
   - Actualiza `Application.View = { entity: ProductEntity, viewType: ViewType.LIST, mode: null }`
   - Ejecuta `Application.router.push({ name: 'DefaultView' })`
4. Router navega a `/view`
5. DefaultListView mounted, lee `Application.View.value`
6. Renderiza DataTableComponent con ProductEntity

**Navegación a Detalle de Producto:**
1. Usuario click en row de tabla
2. DefaultListView ejecuta `Application.changeView(ProductEntity, ViewType.DETAIL, ViewMode.UPDATE, productInstance)`
3. Application.View actualizado
4. Router navega (mismo path `/view`)
5. DefaultDetailView mounted, lee Application.View
6. Renderiza formulario con ProductEntity properties

## 6. Reglas Obligatorias

- SIEMPRE inyectar router en Application en main.ts
- SIEMPRE usar Application.changeView() para navegación, NO router.push() directo desde componentes
- SIEMPRE lazy-load components con  `() => import()`
- SIEMPRE usar history mode (createWebHistory), NO hash mode
- Navigation guards DEBEN ser async cuando ejecutan checks de autenticación

## 7. Prohibiciones

1. NO crear rutas por cada entity - usar ruta dinámica `/view`
2. NO ejecutar router.push() desde componentes - usar Application.changeView()
3. NO hardcodear parámetros de ruta - usar Application.View
4. NO usar hash mode en producción
5. NO olvidar inyectar router en Application

## 8. Dependencias

- vue-router - createRouter, createWebHistory, RouteRecordRaw
- Application - Inyectado con router instance
- Views - default_listview.vue, default_detailview.vue

## 9. Relaciones

Application.changeView() → Router. push() → DefaultView rendered → lee Application.View  
SideBarItemComponent → Application.changeView() → Router  
main.ts → router instance → Application.router

Documentos: `copilot/02-FLOW-ARCHITECTURE.md`

## 10. Notas de Implementación

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomeView.vue')
    },
    {
        path: '/view',
        name: 'DefaultView',
        component: () => import('@/views/default_listview.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue')
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Navigation guard example
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next({ name: 'Login' });
    } else {
        next();
    }
});

export default router;
```

```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { Application } from '@/models/application';

// Inyectar router en Application
Application.router = router;

const app = createApp(App);
app.use(router);
app.mount('#app');
```

Navegación programática:
```typescript
// ❌ NO HACER: Router.push directo
this.$router.push({ name: 'DefaultView', params: { entity: 'Products' } });

// ✅ CORRECTO: Application.changeView
Application.changeView(ProductEntity, ViewType.LIST);
```

## 11. Referencias Cruzadas

- [02-FLOW-ARCHITECTURE.md](../../../copilot/02-FLOW-ARCHITECTURE.md) - Flujo de navegación
- [application-singleton.md](../../../copilot/layers/03-application/application-singleton.md) - Application.changeView()
- [views-overview.md](../../../copilot/layers/04-components/views-overview.md) - DefaultListView/DefaultDetailView
- Vue Router Docs: https://router.vuejs.org/
