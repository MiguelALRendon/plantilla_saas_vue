# Application Singleton

## 1. Propósito

Gestionar estado global de aplicación como singleton central que coordina servicios compartidos (router, axios, event bus), mantiene referencias a módulos registrados, orquesta navegación entre vistas mediante Vue Router, y provee contexto UI para componentes accediendo estado reactivo.

## 2. Alcance

### 2.1 Responsabilidades

- Mantener estado global reactivo de vista actual (View)
- Registrar módulos (clases BaseEntity) en ModuleList
- Coordinar navegación entre ListView/DetailView mediante changeView()
- Proveer instancia singleton de axios configurada con interceptores
- Gestionar event bus (mitt) para comunicación entre componentes
- Exponer ApplicationUIService para toasts, modales, confirmaciones
- Mantener AppConfiguration con variables de entorno
- Actualizar lista de botones según viewType actual (setButtonList)
- Sincronizar navegación con Vue Router (initializeRouter)

### 2.2 Límites

- No implementa lógica de negocio de entidades (responsabilidad de BaseEntity)
- No realiza operaciones CRUD directamente (delega a entities)
- No gestiona autenticación ni autorización (solo almacena authTokenKey)
- No renderiza UI (solo provee estado, componentes consumen)
- No valida datos de formularios (responsabilidad de BaseEntity validation)
- No controla ciclo de vida de componentes Vue (framework)

## 3. Definiciones Clave

**Application Singleton**: Instancia única de ApplicationClass, único punto de acceso a servicios globales, implementado con patrón Singleton mediante getInstance().

**View State**: Objeto reactivo `View` conteniendo entityClass, entityObject, component, viewType, entityOid, representando vista activa actual.

**ModuleList**: Array reactivo de clases BaseEntity (`(typeof BaseEntity)[]`) registradas como módulos, usado por SideBar para generar menú navegación.

**ApplicationUIContext**: Interface definiendo propiedades reactivas (View, modal, dropdownMenu, confirmationMenu, ToastList, ListButtons) accesibles desde componentes.

**ApplicationUIService**: Servicio con métodos helper (openToast, openModal, openConfirmationMenu, closeModal) abstraídos de Application para operaciones UI.

**changeView**: Método central navegando entre vistas, actualizando View.value y sincronizando Router, verificando dirtyState antes de permitir navegación.

**setButtonList**: Método actualizando ListButtons según viewType (LISTVIEW → [New, Refresh], DETAILVIEW con persistent → [New, Refresh, Validate, Save, SaveAndNew, SendToDevice]).

**Router Integration**: Sincronización bidireccional entre Application.View y Vue Router mediante updateRouterFromView y router event handlers.

## 4. Descripción Técnica

### 4.1 Estructura de ApplicationClass

```typescript
class ApplicationClass implements ApplicationUIContext {
    AppConfiguration: Ref<AppConfiguration>;
    View: Ref<View>;
    ModuleList: Ref<(typeof BaseEntity)[]>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<confirmationMenu>;
    eventBus: Emitter<Events>;
    ListButtons: Ref<Component[]>;
    axiosInstance: AxiosInstance;
    ToastList: Ref<Toast[]>;
    ApplicationUIService: ApplicationUIService;
    router: Router | null = null;
    private static instance: ApplicationClass | null = null;

    private constructor() { /* inicialización */ }
    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }
}

const Application = ApplicationClass.getInstance();
export default Application;
export { Application };
```

Patrón Singleton con constructor privado, getInstance() retorna única instancia. Export default de instancia singleton (no clase).

### 4.2 Propiedades Reactivas

**AppConfiguration: Ref\<AppConfiguration\>**
- Contenido: appName, appVersion, apiBaseUrl, apiTimeout, apiRetryAttempts, environment, logLevel, authTokenKey, authRefreshTokenKey, sessionTimeout, itemsPerPage, maxFileSize, isDarkMode
- Inicialización: Lee import.meta.env variables con fallbacks
- Uso: `Application.AppConfiguration.value.apiBaseUrl`
- Ubicación: Líneas 43-58

**View: Ref\<View\>**
- Contenido: entityClass, entityObject, component, viewType (ViewTypes enum), isValid, entityOid
- Propósito: Estado de vista activa actual, sincronizado con Router
- Cambios: Via changeView(), changeViewToDefaultView(), changeViewToListView(), changeViewToDetailView()
- Ubicación: Líneas 59-66

**ModuleList: Ref\<(typeof BaseEntity)[]\>**
- Contenido: Array de clases BaseEntity (constructores, no instancias)
- Propósito: Registro de módulos disponibles para navegación
- Modificación: `Application.ModuleList.value.push(Products)` en src/models/application.ts línea 278
- Consumido por: SideBarComponent para generar menú, Router para validación
- Convención de entidad ejemplo: usar la clase `Product` exportada desde `src/entities/product.ts` como fuente única.
- Ubicación: Línea 67

**modal: Ref\<Modal\>**
- Contenido: modalView, modalOnCloseFunction, viewType
- Propósito: Controlar modal activo renderizado por ModalComponent
- API: ApplicationUIService.openModal(), closeModal()
- Ubicación: Líneas 69-73

**dropdownMenu: Ref\<DropdownMenu\>**
- Contenido: showing, title, component, width, position_x, position_y, canvasWidth, canvasHeight, activeElementWidth, activeElementHeight
- Propósito: State de dropdown menus contextuales
- Ubicación: Líneas 74-83

**confirmationMenu: Ref\<confirmationMenu\>**
- Contenido: type (confMenuType enum), title, message, confirmationAction (function)
- Propósito: Diálogos de confirmación (INFO, WARNING, ERROR, SUCCESS)
- API: ApplicationUIService.openConfirmationMenu()
- Ubicación: Líneas 84-89

**ListButtons: Ref\<Component[]\>**
- Contenido: Array de componentes Vue (NewButtonComponent, RefreshButtonComponent, etc)
- Propósito: Botones renderizados en TopBar según viewType
- Actualización: setButtonList() método (líneas 233-259)
- Ubicación: Línea 90

**ToastList: Ref\<Toast[]\>**
- Contenido: Array de toasts { id, message, type, duration, visible }
- Propósito: Notificaciones temporales renderizadas por ToastComponent
- API: ApplicationUIService.openToast()
- Ubicación: Línea 91

### 4.3 Servicios No Reactivos

**axiosInstance: AxiosInstance**
- Configuración: baseURL desde AppConfiguration, timeout 30000ms, Content-Type: application/json
- Interceptores Request: Agrega Authorization: Bearer {token} desde localStorage
- Interceptores Response: Si 401 unauthorized, remueve token de localStorage
- Uso: `await Application.axiosInstance.post('/api/endpoint', data)`
- Ubicación: Líneas 92-119

**eventBus: Emitter\<Events\>**
- Implementación: mitt library
- Propósito: Comunicación desacoplada entre componentes
- Uso: `Application.eventBus.emit('entity-saved', entity)`, `Application.eventBus.on('entity-saved', handler)`
- Ubicación: Línea 68

**ApplicationUIService: ApplicationUIService**
- Propósito: Métodos helper para operaciones UI (openToast, openModal, openConfirmationMenu, closeModal)
- Instancia: Creada en constructor con referencia a ApplicationClass
- Uso: `Application.ApplicationUIService.openToast('Message', ToastType.SUCCESS)`
- Ubicación: Línea 121

### 4.3.1 Extensión Fase 1: ApplicationDataService

Application incorpora un servicio auxiliar para transformación de datos sin alterar el patrón Singleton ni el rol de orquestación de la capa 4.

**Reglas obligatorias de esta extensión:**
- Debe instanciarse dentro del constructor de ApplicationClass
- Debe ser consumido por BaseEntity vía Application (sin bypass desde UI)
- Solo encapsula transformaciones y utilidades de datos (no lógica CRUD)
- Debe exponer transformadores predefinidos `date`, `decimal`, `boolean`, `enum`
- Debe habilitar transformación automática por metadatos sin configuración manual obligatoria en cada entidad
- Debe permitir override opcional por entidad vía `transformationSchema` cuando exista caso especial

### 4.3.2 Extensión Fase 1: Manejo HTTP robusto

El interceptor de `axiosInstance` debe cubrir al menos estados 401, 403, 404, 422, 500, 502, 503 y error de red, manteniendo feedback visual por `ApplicationUIService`.

**Reglas obligatorias de retry:**
- Retry sólo para 500/502/503
- Usar contador de reintentos en `config` de Axios
- Aplicar backoff exponencial
- Respetar `AppConfiguration.apiRetryAttempts`
- Al agotar reintentos, retornar `Promise.reject(error)`

**router: Router | null**
- Inicialización: null en constructor, asignado con initializeRouter(router)
- Propósito: Referencia a Vue Router para navegación programática
- Uso: updateRouterFromView() método usa router.push()
- Ubicación: Línea 40

### 4.4 Métodos Principales

**changeView(entityClass, component, viewType, entity)**
- Verificación: Si View.entityObject tiene dirtyState, muestra confirmación antes de cambiar
- Delegación: Llama setViewChanges() si confirmado o sin cambios
- Ubicación: Líneas 126-138

**setViewChanges(entityClass, component, viewType, entity)**
- Actualización: Asigna View.entityClass, entityObject, component, viewType
- EntityOid: Si entity con uniqueValue, asigna String(uniqueValue), else 'new' o ''
- Router Sync: Llama updateRouterFromView()
- Ubicación: Líneas 140-161

**updateRouterFromView(entityClass, entity)**
- Guard: Si !router, retorna sin acción
- Module Name: Obtiene moduleName lowercase desde entityClass.getModuleName()
- Navegación DetailView: router.push({ name: 'ModuleDetail', params: { module: moduleNameLower, oid: entityOid } })
- Navegación ListView: router.push({ name: 'ModuleList', params: { module: moduleNameLower } })
- Prevención Duplicada: Verifica currentRoute.path !== targetPath antes de push
- Error Handling: Ignora NavigationDuplicated errors
- Ubicación: Líneas 163-198

**changeViewToDefaultView(entityClass)**
- Componente: entityClass.getModuleDefaultComponent()
- ViewType: ViewTypes.DEFAULTVIEW
- Button Update: setTimeout(() => setButtonList(), 405) después de cambio
- Ubicación: Líneas 200-205

**changeViewToListView(entityClass)**
- Componente: entityClass.getModuleListComponent()
- ViewType: ViewTypes.LISTVIEW, entity: null
- Button Update: setTimeout(() => setButtonList(), 405)
- Uso típico: Navegar a lista después de save
- Ubicación: Líneas 207-212

**changeViewToDetailView<T extends BaseEntity>(entity: T)**
- Entity Class: Obtiene entityClass desde entity.constructor as typeof BaseEntity
- Componente: entityClass.getModuleDetailComponent()
- ViewType: ViewTypes.DETAILVIEW
- Button Update: setTimeout(() => setButtonList(), 405)
- Uso típico: Navegar a detalle desde lista
- Ubicación: Líneas 214-220

**setButtonList()**
- Actualiza ListButtons según viewType Y estado de persistencia de la entidad
- Determina isPersistent: `View.entityClass?.isPersistent() ?? false`
- Lógica de asignación de botones:
  - LISTVIEW: `[NewButtonComponent, RefreshButtonComponent]`
  - DETAILVIEW + isPersistent: `[New, Refresh, Validate, Save, SaveAndNew, SendToDevice]`
  - DETAILVIEW + !isPersistent: `[New, Refresh, Validate, SendToDevice]` (sin Save/SaveAndNew)
  - Otros viewTypes: `[]` (array vacío)
- markRaw: Marca componentes como non-reactive para optimizar performance
- **Nota importante:** Los botones Save, SaveAndNew solo aparecen si la entidad tiene `@Persistent()` configurado
- Ubicación: Líneas 222-259

**initializeRouter(router: Router)**
- Asignación: this.router = router
- Timing: Llamado en main.js después de crear router
- Necesario: Para updateRouterFromView() funcionamiento
- Ubicación: Líneas 261-263

### 4.5 Inicialización en main.js

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Application from './models/application';
import { Products } from './entities/products';

// Inicializar router en Application
Application.initializeRouter(router);

// Registrar módulos
Application.ModuleList.value.push(Products);

// Crear app Vue
const app = createApp(App);
app.use(router);
app.mount('#app');
```

Orden crítico: initializeRouter() antes de cualquier changeView().

La navegación inicial de módulo debe resolverse por el redirect del router (`/` → `/:module`).
No se debe forzar `Application.changeViewToDefaultView()` desde bootstrap en `main.ts`.

## 5. Flujo de Funcionamiento

### 5.1 Inicialización de Aplicación

```
main.js ejecuta
    ↓
import Application (singleton ya instanciado)
    ↓
Application constructor privado crea refs reactivos:
    - AppConfiguration (lee import.meta.env)
    - View (estado inicial vacío)
    - ModuleList (array vacío)
    - modal, dropdownMenu, confirmationMenu (estados iniciales)
    - ListButtons (array vacío)
    - ToastList (array vacío)
    - axiosInstance (configurado con baseURL, interceptores)
    - eventBus (mitt instancia)
    - ApplicationUIService (recibe this como contexto)
    ↓
main.js llama Application.initializeRouter(router)
    ↓
Application.router = router (ahora disponible)
    ↓
main.js registra módulos:
Application.ModuleList.value.push(Products)
    ↓
createApp(App).use(router).mount('#app')
    ↓
App.vue monta, SideBar lee ModuleList, TopBar lee ListButtons
    ↓
Router initial route carga (e.g., '/')
    ↓
Application listo para changeView()
```

### 5.2 Navegación a ListView

```
Usuario click en "Products" en SideBar
    ↓
SideBarItem ejecuta:
Application.changeViewToListView(Products)
    ↓
changeView(Products, Products.getModuleListComponent(), LISTVIEW, null)
    ↓
Verifica View.entityObject?.getDirtyState() → false (no hay entity)
    ↓
setViewChanges(Products, ListComponent, LISTVIEW, null)
    ↓
Application.View.value actualizado:
    - entityClass = Products
    - entityObject = null
    - component = ListComponent
    - viewType = LISTVIEW
    - entityOid = ''
    ↓
updateRouterFromView(Products, null)
    ↓
moduleName = 'Products', moduleNameLower = 'products'
    ↓
currentRoute.path !== '/products' → TRUE
    ↓
router.push({ name: 'ModuleList', params: { module: 'products' } })
    ↓
Router navega a /products
    ↓
ComponentContainerComponent detecta route change, renderiza ListComponent
    ↓
setTimeout(() => setButtonList(), 405)
    ↓
setButtonList() ejecuta:
    - viewType = LISTVIEW
    - ListButtons.value = [NewButtonComponent, RefreshButtonComponent]
    ↓
TopBar reactivamente actualiza botones
    ↓
ListView carga Products.search(), renderiza tabla
```

### 5.3 Navegación a DetailView desde Lista

```
Usuario click en row de producto ID 42
    ↓
ListViewComponent obtiene entity:
const product = Application.View.value.entityClass.getKeys()[rowIndex]
O bien: const product = await Products.getElement(42)
    ↓
Application.changeViewToDetailView(product)
    ↓
entityClass = product.constructor as typeof BaseEntity (= Products)
    ↓
changeView(Products, Products.getModuleDetailComponent(), DETAILVIEW, product)
    ↓
Verifica View.entityObject?.getDirtyState() → false (navegando desde lista)
    ↓
setViewChanges(Products, DetailComponent, DETAILVIEW, product)
    ↓
Application.View.value actualizado:
    - entityClass = Products
    - entityObject = product (instancia cargada)
    - component = DetailComponent
    - viewType = DETAILVIEW
    - entityOid = String(product.getUniquePropertyValue()) → '42'
    ↓
updateRouterFromView(Products, product)
    ↓
moduleName = 'products', entityOid = '42'
    ↓
targetPath = '/products/42'
    ↓
currentRoute.path !== '/products/42' → TRUE
    ↓
router.push({ name: 'ModuleDetail', params: { module: 'products', oid: '42' } })
    ↓
Router navega a /products/42
    ↓
ComponentContainerComponent renderiza DetailComponent con Application.View.value.entityObject
    ↓
setTimeout(() => setButtonList(), 405)
    ↓
setButtonList() ejecuta:
    - viewType = DETAILVIEW
    - isPersistent = product.isPersistent() → TRUE (Products tiene @Persistent)
    - ListButtons.value = [New, Refresh, Validate, Save, SaveAndNew, SendToDevice]
    ↓
TopBar actualiza botones
    ↓
DetailView renderiza formulario con datos de product
```

### 5.4 Navegación con Unsaved Changes

```
Usuario edita product.name en DetailView
    ↓
FormInput actualiza product.name = 'New Name'
    ↓
product state: dirtyKeys = ['name'], dirtyState = true
    ↓
Usuario click en "Orders" en SideBar (intenta navegar)
    ↓
Application.changeViewToListView(Orders)
    ↓
changeView(Orders, ..., LISTVIEW, null)
    ↓
Verifica View.entityObject?.getDirtyState() → TRUE (hay cambios)
    ↓
ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,
    'Salir sin guardar',
    'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?',
    confirmAction: () => { setViewChanges(...) }
)
    ↓
confirmationMenu.value actualizado con datos
    ↓
ConfirmationMenuComponent renderiza diálogo
    ↓
OPCIÓN A: Usuario click "Cancelar"
    → ConfirmationMenuComponent emits close
    → confirmationMenu.value = null
    → Permanece en DetailView de Products
    
OPCIÓN B: Usuario click "Salir sin guardar"
    → confirmAction() ejecuta
    → setViewChanges(Orders, ..., LISTVIEW, null)
    → Navega a Orders ListView
    → Cambios en product descartados (no se guardaron)
```

### 5.5 Flujo de Toast Notification

```
Usuario click "Save" en DetailView
    ↓
SaveButtonComponent ejecuta:
await Application.View.value.entityObject.save()
    ↓
Product.save() llama BaseEntity.save()
    ↓
Si success:
    Application.ApplicationUIService.openToast('Product saved!', ToastType.SUCCESS)
        ↓
    openToast() crea objeto Toast:
        { id: Date.now(), message: '...', type: SUCCESS, duration: 3000, visible: true }
        ↓
    Application.ToastList.value.push(toast)
        ↓
    ToastComponent (watching ToastList) renderiza toast
        ↓
    setTimeout(() => { toast.visible = false }, 3000)
        ↓
    Animación fade out (300ms via CSS)
        ↓
    setTimeout(() => { ToastList.splice(index, 1) }, 300)
        ↓
    Toast removido de ToastList
        ↓
    ToastComponent reactivamente deja de renderizarlo
```

## 6. Reglas Obligatorias

### 6.1 Singleton Pattern

1. Application es singleton, única instancia por aplicación
2. NUNCA instanciar con `new Application()` (constructor privado)
3. Importar como: `import Application from '@/models/application'`
4. Application ya es instancia, no `Application.getInstance()`
5. Compartir instancia entre todos los componentes y entidades

### 6.2 Registro de Módulos

6. Registrar módulos DESPUÉS de initializeRouter() en main.js
7. Usar ModuleList.value.push(EntityClass), no crear instancias
8. Solo registrar clases BaseEntity con @ModuleName decorator
9. Módulos registrados automáticamente aparecen en SideBar
10. No remover módulos después de registro (ModuleList es append-only)

### 6.3 Navegación entre Vistas

11. Usar changeView() o métodos helper (changeViewToListView, changeViewToDetailView)
12. NUNCA modificar Application.View.value directamente (bypass confirmación dirty state)
13. Siempre pasar entityClass (constructor), no instancia para lista
14. Para DetailView, pasar entity instance cargada con datos
15. Si entity es null en DetailView, se crea nueva instancia

### 6.4 Router Integration

16. Llamar initializeRouter(router) en main.js ANTES de cualquier changeView()
17. No ejecutar router.push() manualmente desde componentes (usar changeView)
18. updateRouterFromView() es método privado, no llamar directamente
19. Rutas deben coincidir con moduleName lowercase (/products, /orders)
20. EntityOid debe ser unique property value o 'new' para nueva entidad

### 6.5 Button List Management

21. No modificar ListButtons directamente, solo via setButtonList()
22. setButtonList() se llama automáticamente después de changeView()
23. setTimeout de 405ms necesario para sincronización con transiciones CSS
24. markRaw() obligatorio para componentes en ListButtons (evita proxy reactivity)
25. Botones Save/SaveAndNew solo aparecen si entity.isPersistent() === true

### 6.6 Reactive State

26. Todas las propiedades reactivas son Ref<T>, acceder con .value
27. No reemplazar refs completos (Application.View = ...), modificar .value
28. axiosInstance, eventBus, router, ApplicationUIService NO son reactivos
29. Para actualizar AppConfiguration: `Application.AppConfiguration.value.appName = '...'`
30. ToastList se modifica con push/splice, no reassignment

### 6.7 Event Bus Usage

31. Emitir eventos con `Application.eventBus.emit('event-name', payload)`
32. Escuchar eventos con `Application.eventBus.on('event-name', handler)`
33. Remover listeners en onBeforeUnmount: `Application.eventBus.off('event-name', handler)`
34. No crear event bus custom, usar Application.eventBus compartido
35. Events tipados en @/types/events.ts

### 6.8 Documentación y JSDoc

36. SIEMPRE documentar propiedades públicas con JSDoc multi-línea `/** ... */`
37. PROHIBIDO usar comentarios de una línea `//` excepto dentro de JSDoc
38. Regiones `#region` deben documentarse con JSDoc siguiendo § 06-CODE-STYLING-STANDARDS 6.6
39. Métodos públicos deben tener JSDoc con @param, @returns, @throws
40. Referencias a contratos o excepciones deben documentarse inline con `/** § 06-... */` o `/** EXC-XXX ... */`

## 7. Prohibiciones

### 7.1 Prohibiciones de Instanciación

1. PROHIBIDO `new ApplicationClass()` (constructor privado, TypeScript error)
2. PROHIBIDO crear múltiples instancias de Application
3. PROHIBIDO extender ApplicationClass con herencia
4. PROHIBIDO modificar ApplicationClass.instance directamente
5. PROHIBIDO reassignar Application import (const, inmutable)

### 7.2 Prohibiciones de Estado

6. PROHIBIDO modificar View, modal, ModuleList sin métodos oficiales
7. PROHIBIDO `Application.View = ref(...)` (reemplazar ref)
8. PROHIBIDO modificar View.value sin changeView() (bypass dirty check)
9. PROHIBIDO modificar ListButtons fuera de setButtonList()
10. PROHIBIDO modificar ToastList excepto en ApplicationUIService

### 7.3 Prohibiciones de Navegación

11. PROHIBIDO router.push() directo desde componentes (usar changeView)
12. PROHIBIDO navegar sin verificar dirty state
13. PROHIBIDO changeView() antes de initializeRouter()
14. PROHIBIDO pasar entity instance como entityClass parameter
15. PROHIBIDO modificar entityOid sin actualizar router

### 7.4 Prohibiciones de Axios

16. PROHIBIDO modificar axiosInstance.defaults después de inicialización
17. PROHIBIDO crear instancias axios custom (usar Application.axiosInstance)
18. PROHIBIDO modificar interceptores después de constructor
19. PROHIBIDO eludir Authorization header en requests autenticados
20. PROHIBIDO manejar 401 errors manualmente (interceptor response maneja)

### 7.5 Prohibiciones de Event Bus

21. PROHIBIDO crear mitt instances custom por componente
22. PROHIBIDO emitir eventos sin payload cuando esperado
23. PROHIBIDO listeners sin cleanup en onBeforeUnmount (memory leaks)
24. PROHIBIDO modificar Application.eventBus asignando nuevo mitt()
25. PROHIBIDO event names no documentados en types/events.ts

### 7.6 Prohibiciones de UI Context

26. PROHIBIDO mostrar modales sin ApplicationUIService
27. PROHIBIDO manipular modal.value directamente (usar openModal/closeModal)
28. PROHIBIDO crear toasts custom fuera de ApplicationUIService
29. PROHIBIDO modificar confirmationMenu sin openConfirmationMenu()
30. PROHIBIDO dropdownMenu updates fuera de DropdownMenuComponent

## 8. Dependencias

### 8.1 Dependencias Directas de NPM

**Vue 3 (vue)**
- Uso: ref, Ref, Component, markRaw, reactive
- Crítico: Sí, sistema de reactividad fundamental
- Versión: ^3.0.0

**Axios (axios)**
- Uso: axios.create(), AxiosInstance, interceptores
- Crítico: Sí, todas las comunicaciones HTTP
- Configuración: baseURL, timeout, headers, interceptores

**Mitt (mitt)**
- Uso: Emitter<Events>, Event bus para comunicación desacoplada
- Crítico: Sí, eventos entity-saved, entity-deleted, etc
- Alternativa: Vue 3 elimina $on/$emit, mitt es reemplazo oficial

**Vue Router (vue-router)**
- Uso: Router, navegación programática, sincronización con View
- Crítico: Sí, navegación entre vistas
- Integración: initializeRouter(), updateRouterFromView()

### 8.2 Dependencias de Modelos Internos

**AppConfiguration (@/models/AppConfiguration)**
- Contenido: Interface/type para configuración de aplicación
- Propiedades: appName, apiBaseUrl, authTokenKey, etc
- Inicialización: Lee import.meta.env en constructor

**View (@/models/View)**
- Contenido: Interface con entityClass, entityObject, component, viewType, isValid, entityOid
- Uso: Estado de vista actual, sincronizado con Router

**Modal (@/models/modal)**
- Contenido: Interface con modalView, modalOnCloseFunction, viewType
- Uso: Estado de modal activo

**DropdownMenu (@/models/dropdown_menu)**
- Contenido: Interface con showing, title, component, position, dimensions
- Uso: Estado de dropdowns contextuales

**confirmationMenu (@/models/confirmation_menu)**
- Contenido: Interface con type, title, message, confirmationAction
- Uso: Diálogos de confirmación

**Toast (@/models/Toast)**
- Contenido: Interface con id, message, type, duration, visible
- Uso: Notificaciones temporales

**ApplicationUIService (@/models/application_ui_service)**
- Dependencia: Recibe ApplicationUIContext en constructor
- Métodos: openToast, openModal, closeModal, openConfirmationMenu
- Crítico: Sí, abstrae lógica de UI

**ApplicationUIContext (@/models/application_ui_context)**
- Contenido: Interface con todas las propiedades reactivas de Application
- Implementado por: ApplicationClass
- Necesario: Para tipado de ApplicationUIService

### 8.3 Dependencias de Entidades

**BaseEntity (@/entities/base_entity)**
- Relación: Application gestiona instancias de BaseEntity subclasses
- Métodos usados: getModuleName(), getModuleDefaultComponent(), getModuleListComponent(), getModuleDetailComponent(), isPersistent(), getUniquePropertyValue(), getDirtyState()
- Crítico: Sí, ModuleList contiene tipos BaseEntity

**Entities Específicas (Products, Orders, etc)**
- Relación: Registradas en ModuleList
- Uso: `Application.ModuleList.value.push(Products)`
- Patrón: Clases decoradas con @ModuleName, @ModuleIcon, @Persistent

### 8.4 Dependencias de Enums

**ViewTypes (@/enums/view_type)**
- Valores: DEFAULTVIEW, LISTVIEW, DETAILVIEW
- Uso: Application.View.value.viewType = ViewTypes.LISTVIEW

**confMenuType (@/enums/conf_menu_type)**
- Valores: INFO, WARNING, ERROR, SUCCESS
- Uso: ApplicationUIService.openConfirmationMenu(confMenuType.WARNING, ...)

### 8.5 Dependencias de Componentes

**Button Components (@/components/Buttons)**
- Componentes: NewButtonComponent, RefreshButtonComponent, SaveButtonComponent, SaveAndNewButtonComponent, ValidateButtonComponent, SendToDeviceButtonComponent
- Uso: Agregados a ListButtons según viewType
- Renderizado: TopBarComponent itera ListButtons

**ComponentContainerComponent**
- Relación: Consume Application.View para renderizar component actual
- Reactivity: Watch Application.View.value cambios

**SideBarComponent**
- Relación: Lee Application.ModuleList para generar menú
- Navegación: Click ejecuta Application.changeViewToListView(module)

**TopBarComponent**
- Relación: Renderiza Application.ListButtons
- Reactivity: Watch ListButtons.value cambios

### 8.6 Dependencias de Types

**Events (@/types/events)**
- Contenido: Type definitions para event bus payloads
- Ejemplos: entity-saved, entity-deleted, entity-fetched
- Uso: `Emitter<Events>` tipado de eventBus

## 9. Relaciones

### 9.1 Relación con Vue Router

**Sincronización Bidireccional**
- Application.changeView() → router.push()
- Router navigation → ComponentContainer lee Application.View
- Patrón: Application es source of truth, router refleja state

**Route Params Mapping**
- ModuleList: /products → params.module = 'products'
- ModuleDetail: /products/42 → params.module = 'products', params.oid = '42'
- ModuleDetail new: /products/new → params.oid = 'new'

**initializeRouter() Integration**
```typescript
// main.js
import router from './router';
Application.initializeRouter(router);
```
Necesario para updateRouterFromView() funcionamiento.

### 9.2 Relación con Event Bus

**Event Emitters**
- BaseEntity.save(): `eventBus.emit('entity-saved', this)`
- BaseEntity.delete(): `eventBus.emit('entity-deleted', { class: this.constructor, oid: this.oid })`
- BaseEntity.getElement(): `eventBus.emit('entity-fetched', entity)`

**Event Listeners**
- ListView: Escucha 'entity-saved', 'entity-deleted' para refresh automático
- DetailView: Escucha 'entity-saved' para actualizar dirtyState
- ToastComponent: Escucha eventos para mostrar notificaciones

**Patrón Pub/Sub**
- Comunicación desacoplada entre components sin props/emits directo
- Permite múltiples listeners para mismo evento

### 9.3 Relación con BaseEntity

**ModuleList Registration**
```typescript
// application.ts
Application.ModuleList.value.push(Products);
```
BaseEntity subclasses registradas como módulos.

**Metadata Consumption**
- getModuleName(): Nombre para rutas y título
- getModuleIcon(): Icono para SideBar
- getModuleDefaultComponent(): Componente para DEFAULTVIEW
- getModuleListComponent(): Componente para LISTVIEW
- getModuleDetailComponent(): Componente para DETAILVIEW

**State Management**
- Application.View.value.entityObject: Instancia actual de BaseEntity
- isPersistent(): Determina botones en setButtonList()
- getDirtyState(): Verificado antes de changeView()

### 9.4 Relación con ApplicationUIService

**Service Delegation**
- Application no implementa lógica de toasts/modals directamente
- ApplicationUIService recibe ApplicationUIContext en constructor
- Métodos abstraídos: openToast(), openModal(), closeModal(), openConfirmationMenu()

**Consumo desde Components**
```typescript
// SaveButtonComponent.vue
await entity.save();
Application.ApplicationUIService.openToast('Saved!', ToastType.SUCCESS);
```

**Patrón Service Locator**
- Application expone ApplicationUIService
- Componentes acceden via Application.ApplicationUIService

### 9.5 Relación con AppConfiguration

**Environment Variables Loading**
```typescript
// Constructor
this.AppConfiguration = ref<AppConfiguration>({
    appName: import.meta.env.VITE_APP_NAME || 'My SaaS Application',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api...',
    // ...
});
```

**Axios Configuration**
```typescript
this.axiosInstance = axios.create({
    baseURL: this.AppConfiguration.value.apiBaseUrl,
    timeout: this.AppConfiguration.value.apiTimeout,
    // ...
});
```

**Token Management**
```typescript
const token = localStorage.getItem(this.AppConfiguration.value.authTokenKey);
```

### 9.6 Relación con Components

**ComponentContainerComponent**
- Renderiza: `<component :is="Application.View.value.component" />`
- Watch: Application.View.value cambios para re-render

**TopBarComponent**
- Itera: `<component v-for="button in Application.ListButtons.value" :is="button" />`
- Reactivo: Actualiza cuando setButtonList() modifica ListButtons

**SideBarComponent**
- Itera: `Application.ModuleList.value` para generar SideBarItems
- Click: Ejecuta `Application.changeViewToListView(module)`

**ToastComponent**
- Itera: `Application.ToastList.value` para renderizar toasts
- Watch: ToastList cambios para mostrar nuevos toasts

**ModalComponent**
- Renderiza: `Application.modal.value` si no null
- Close: Ejecuta `Application.ApplicationUIService.closeModal()`

## 10. Notas de Implementación

### 10.1 Patrón Singleton Implementation

**Constructor Privado**
```typescript
private constructor() {
    // Inicialización de refs, axiosInstance, eventBus, etc
}
```
Previene instanciación directa con `new ApplicationClass()`.

**getInstance() Static Method**
```typescript
private static instance: ApplicationClass | null = null;

static getInstance() {
    if (!this.instance) this.instance = new ApplicationClass();
    return this.instance;
}
```
Lazy initialization, crea instancia solo si no existe.

**Export de Instancia**
```typescript
const Application = ApplicationClass.getInstance();
export default Application;
export { Application };
```
Export default de instancia (no clase), componentes importan singleton directamente.

### 10.2 Router Synchronization Pattern

**updateRouterFromView() Implementation**
```typescript
private updateRouterFromView = (entityClass: typeof BaseEntity, entity: BaseEntity | null = null) => {
    if (!this.router) return;
    
    const moduleName = entityClass.getModuleName() || entityClass.name;
    const moduleNameLower = moduleName.toLowerCase();
    const currentRoute = this.router.currentRoute.value;
    
    if (entity) {
        const targetPath = `/${moduleNameLower}/${this.View.value.entityOid}`;
        if (currentRoute.path !== targetPath) {
            this.router.push({ 
                name: 'ModuleDetail', 
                params: { module: moduleNameLower, oid: this.View.value.entityOid } 
            }).catch((err: any) => {
                if (err.name !== 'NavigationDuplicated') {
                    console.error('[Application] Error al navegar:', err);
                }
            });
        }
    } else {
        const targetPath = `/${moduleNameLower}`;
        if (currentRoute.path !== targetPath) {
            this.router.push({ name: 'ModuleList', params: { module: moduleNameLower } }).catch((err: any) => {
                if (err.name !== 'NavigationDuplicated') {
                    console.error('[Application] Error al navegar:', err);
                }
            });
        }
    }
}
```

**Key Features:**
- Guard: Si !router, retorna silenciosamente
- Path Check: Previene navegación duplicada (currentRoute.path !== targetPath)
- Error Handling: Ignora NavigationDuplicated (Vue Router warning común)
- Module Name: Obtiene de getModuleName() con fallback a class name
- EntityOid: Usa View.value.entityOid (ya calculado en setViewChanges)

### 10.3 Dirty State Confirmation Flow

**changeView() with Dirty Check**
```typescript
changeView = (entityClass: typeof BaseEntity, component: Component, viewType: ViewTypes, entity: BaseEntity | null = null) => {
    if(this.View.value.entityObject && this.View.value.entityObject.getDirtyState()) {
        this.ApplicationUIService.openConfirmationMenu(
            confMenuType.WARNING,
            'Salir sin guardar',
            'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?',
            () => {
                this.setViewChanges(entityClass, component, viewType, entity);
            }
        );
        return;
    }
    this.setViewChanges(entityClass, component, viewType, entity);
}
```

**Confirmation Menu Structure**
```typescript
this.ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,    // type
    'Salir sin guardar',     // title
    '¿Estás seguro...?',     // message
    () => { /* confirm */ }  // confirmationAction
);
```

**User Experience:**
1. Usuario edita campo en DetailView → entity.dirtyState = true
2. Usuario intenta navegar → getDirtyState() = true
3. Confirmation menu aparece con opciones [Cancelar, Salir sin guardar]
4. Si Cancel → Permanece en vista actual
5. Si Confirm → confirmationAction() ejecuta setViewChanges()

### 10.4 Button List Update Pattern

**setButtonList() Logic**
```typescript
setButtonList() {
    const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;
    
    switch (this.View.value.viewType) {
        case ViewTypes.LISTVIEW:
            this.ListButtons.value = [
                markRaw(NewButtonComponent),
                markRaw(RefreshButtonComponent)
            ];
            break;
        case ViewTypes.DETAILVIEW:
            if (isPersistentEntity) {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SaveButtonComponent),
                    markRaw(SaveAndNewButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            } else {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            }
            break;
        default:
            this.ListButtons.value = [];
    }
}
```

**markRaw() Usage:**
- Vue 3 proxy wraps objects para reactividad
- Components en arrays reactivos causan warnings
- markRaw() marca componente como non-reactive (safe)
- Still reactive en array (ListButtons.value), pero component itself no reactivo

**setTimeout Pattern:**
```typescript
changeViewToListView = (entityClass: typeof BaseEntity) => {
    this.changeView(entityClass, entityClass.getModuleListComponent(), ViewTypes.LISTVIEW, null);
    setTimeout(() => {
        this.setButtonList();
    }, 405);
}
```
405ms delay sincroniza con CSS transitions (típicamente 400ms).

### 10.5 Axios Interceptor Setup

**Request Interceptor**
```typescript
this.axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(this.AppConfiguration.value.authTokenKey);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```
Agrega Authorization header automáticamente si token exists.

**Response Interceptor**
```typescript
this.axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(this.AppConfiguration.value.authTokenKey);
        }
        return Promise.reject(error);
    }
);
```
Si 401 Unauthorized, remueve token (auto-logout).

**Usage en BaseEntity:**
```typescript
async save() {
    const payload = this.toObject();
    const response = await Application.axiosInstance.post(this.getApiEndpoint(), payload);
    return response.data;
}
```
No necesita configurar headers manualmente.

### 10.6 Module Registration Best Practices

**Registration en application.ts (End of File)**
```typescript
const Application = ApplicationClass.getInstance();

// Registrar módulos aquí
Application.ModuleList.value.push(Products);

export default Application;
export { Application };
```

**MEJOR: Registration en main.js**
```typescript
import Application from './models/application';
import { Products } from './entities/products';
import { Orders } from './entities/orders';
import { Customers } from './entities/customers';

// Registrar DESPUÉS de initializeRouter
Application.initializeRouter(router);

Application.ModuleList.value.push(
    Products,
    Orders,
    Customers
);
```
Centraliza registro en punto de entrada.

**Module Requirements:**
- Clase debe extender BaseEntity
- Debe tener @ModuleName('Name') decorator
- Opcional: @ModuleIcon, @Persistent, @ApiEndpoint
- getModuleDefaultComponent(), getModuleListComponent(), getModuleDetailComponent() deben retornar componentes válidos

### 10.7 Event Bus Integration

**Emitting Events en BaseEntity:**
```typescript
async save() {
    // ... save logic
    Application.eventBus.emit('entity-saved', this);
    return this;
}
```

**Listening en Components:**
```vue
<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import Application from '@/models/application';

const handleEntitySaved = (entity) => {
    console.log('Entity saved:', entity);
    // Refresh list, show toast, etc
};

onMounted(() => {
    Application.eventBus.on('entity-saved', handleEntitySaved);
});

onBeforeUnmount(() => {
    Application.eventBus.off('entity-saved', handleEntitySaved);
});
</script>
```

**Event Types (types/events.ts):**
```typescript
export interface Events {
    'entity-saved': BaseEntity;
    'entity-deleted': { class: typeof BaseEntity, oid: any };
    'entity-fetched': BaseEntity;
    'validation-error': { entity: BaseEntity, errors: Record<string, string> };
}
```

### 10.8 Testing Application Singleton

**Unit Test - Singleton Pattern:**
```typescript
test('Application is singleton', () => {
    const app1 = Application;
    const app2 = Application;
    expect(app1).toBe(app2); // Same instance
});
```

**Unit Test - changeView:**
```typescript
test('changeView updates View state', () => {
    Application.changeView(Products, ListComponent, ViewTypes.LISTVIEW);
    expect(Application.View.value.entityClass).toBe(Products);
    expect(Application.View.value.viewType).toBe(ViewTypes.LISTVIEW);
});
```

**Integration Test - Router Sync:**
```typescript
test('changeView synchronizes router', async () => {
    Application.initializeRouter(router);
    Application.changeViewToListView(Products);
    
    await nextTick();
    expect(router.currentRoute.value.path).toBe('/products');
});
```

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada de Application Layer

**copilot/layers/03-application/event-bus.md**
- Relación: Application.eventBus implementación con mitt
- Contenido: Event types, emit/on patterns, cleanup

**copilot/layers/03-application/router-integration.md**
- Relación: Application.initializeRouter(), updateRouterFromView()
- Contenido: Route configuration, navigation guards, params mapping

**copilot/layers/03-application/ui-services.md**
- Relación: Application.ApplicationUIService implementación
- Contenido: openToast, openModal, openConfirmationMenu methods

### 11.2 BaseEntity Core

**copilot/layers/02-base-entity/base-entity-core.md**
- Métodos consumidos: getModuleName(), isPersistent(), getUniquePropertyValue()
- Application gestiona instancias BaseEntity en View.entityObject

**copilot/layers/02-base-entity/crud-operations.md**
- Sección: save(), delete() emitiendo eventos via Application.eventBus
- Application.axiosInstance usado para requests HTTP

**copilot/layers/02-base-entity/lifecycle-hooks.md**
- Hooks: beforeSave(), afterSave() pueden acceder Application para navigation
- Application.changeViewToListView() llamado después de save

**copilot/layers/02-base-entity/metadata-access.md**
- getModuleDefaultComponent(), getModuleListComponent(), getModuleDetailComponent()
- Application usa estos métodos en changeView para determinar component

### 11.3 Decoradores

**copilot/layers/01-decorators/module-name-decorator.md**
- Application.ModuleList requiere @ModuleName en entities
- getModuleName() usado para rutas y títulos

**copilot/layers/01-decorators/module-icon-decorator.md**
- SideBar usa getModuleIcon() para mostrar iconos
- Application no consume directamente, pero ModuleList modules deben tenerlo

**copilot/layers/01-decorators/persistent-decorator.md**
- isPersistent() determina botones en setButtonList()
- Persistent entities muestran Save/SaveAndNew

**copilot/layers/01-decorators/api-endpoint-decorator.md**
- Application.axiosInstance usa getApiEndpoint() para construir URLs
- CRUD operations en BaseEntity

### 11.4 Componentes

**copilot/layers/04-components/ComponentContainerComponent.md**
- Renderiza: `<component :is="Application.View.value.component" />`
- Consume Application.View para determinar qué renderizar

**copilot/layers/04-components/TopBarComponent.md**
- Itera: Application.ListButtons.value
- Renderiza botones determinados por setButtonList()

**copilot/layers/04-components/SideBarComponent.md**
- Itera: Application.ModuleList.value
- Genera SideBarItems con navigation handlers

**copilot/layers/04-components/ToastComponents.md**
- Lee: Application.ToastList.value
- Renderiza notificaciones agregadas por ApplicationUIService

**copilot/layers/04-components/modal-components.md**
- Lee: Application.modal.value
- Renderiza modal si no null

### 11.5 Buttons

**copilot/layers/04-components/ActionButtonComponents.md**
- Componentes: NewButtonComponent, SaveButtonComponent, RefreshButtonComponent
- Agregados a Application.ListButtons por setButtonList()

**copilot/layers/04-components/buttons-overview.md**
- Descripción de todos los botones usados en TopBar
- ListButtons contiene subset basado en viewType

### 11.6 Código Fuente

**src/models/application.ts**
- Líneas 1-279: Implementación completa ApplicationClass
- Líneas 27-125: Constructor con inicialización
- Líneas 126-220: Métodos de navegación (changeView, setViewChanges, updateRouterFromView)
- Líneas 222-259: setButtonList()
- Líneas 261-263: initializeRouter()

**src/models/application_ui_service.ts**
- ApplicationUIService class
- Métodos helper para toasts, modals, confirmations

**src/models/application_ui_context.ts**
- ApplicationUIContext interface
- Definición de propiedades reactivas

**src/models/View.ts**
- View interface/type
- entityClass, entityObject, component, viewType, isValid, entityOid

**src/router/index.ts**
- Router configuration
- initializeRouterWithApplication() función

### 11.7 Tutoriales

**copilot/tutorials/01-basic-crud.md**
- Sección: Usar Application.changeViewToListView(), changeViewToDetailView()
- Ejemplo: Navegación después de save

**copilot/tutorials/02-validations.md**
- Sección: Application.ApplicationUIService.openToast() para validation errors
- Patrón: Mostrar mensajes de validación

### 11.8 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 5: Application como orquestador central
- Sección 8: Singleton pattern requirements

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Application Layer como Service Locator
- Contexto: Application coordina Router, Axios, EventBus

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Navigation Flow con Application.changeView()
- Flujo: User action → Application.changeView → Router.push → Component render
- Garantía: Application es source of truth para estado de vista
