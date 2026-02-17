# Router del Framework

## 1. Propósito

El router maneja navegación entre módulos y vistas del framework sincronizándose automáticamente con estado Application.View bidireccional. Utiliza Vue Router con rutas dinámicas pattern :module y :module/:oid mapeando a entidades BaseEntity y sus vistas lista/detalle. Resuelve dependencia circular con Application mediante lazy initialization initializeRouterWithApplication() permitiendo ambos sistemas referenciar mutuamente. Garantiza URLs limpias HTML5 History API sin hash, logging navegación, detección cambios prevención loops, y redirección automática home al primer módulo.

## 2. Alcance

**UBICACION:** src/router/index.ts

**RUTAS DEFINIDAS:**
- / Home: Redirige automáticamente primer módulo ModuleList
- /:module ModuleList: Vista lista entidad tabla registros
- /:module/:oid ModuleDetail: Vista detalle formulario creación new o edición ID numérico

**PARAMETROS URL:**
- module: Nombre módulo lowercase matching @ModuleName o class.name
- oid: Object ID siendo "new" modo creación o ID numérico edición

**COMPONENTE PRINCIPAL:**
ComponentContainerComponent renderiza dinámicamente Application.View.value.component siendo DefaultListView para lista o DefaultDetailView para detalle.

**NAVIGATION GUARDS:**
- beforeEach: Sincroniza URL params con Application.View detectando cambios actualizando entityClass entityObject viewType entityOid
- afterEach: Logging debugging navegación exitosa con path y entityOid

**INTEGRACION:**
Application.ModuleList array entidades registradas, Application.changeViewToListView changeViewToDetailView métodos navegación programática, router.push() actualiza URL browser history.

## 3. Definiciones Clave

**Esquema URLs:**
Pattern :module representa nombre entidad lowercase como products customers orders, :module/:oid agrega object ID siendo "new" string para creación o ID numérico string "123" para edición. Ejemplos /products lista, /products/new crear, /products/123 editar. URLs limpias sin hash usando createWebHistory() HTML5 History API.

**Sincronización bidireccional:**
Cambios URL browser address bar actualiza Application.View mediante beforeEach guard, cambios Application.View mediante changeViewToListView changeViewToDetailView actualiza URL con router.push(). Comparación estados previene loops infinitos checking currentModuleName currentOid contra URL params antes actualizar.

**Lazy initialization:**
initializeRouterWithApplication(app) función inyecta referencia Application singleton en router después ambos inicializados. Resuelve dependencia circular donde router/index.ts necesita Application.ModuleList y Application necesita router.push() para navegación. Variable global Application inicializada null luego poblada main.ts después createApp() y app.use(router).

**ModuleList lookup:**
beforeEach busca moduleClass en Application.ModuleList.value.find() comparando moduleName lowercase con mod.getModuleName() o mod.name lowercase. Si encuentra clase ejecuta changeViewToListView o changeViewToDetailView según params.oid presente. Si no encuentra imprime warning permite navegación evitando app crash.

**EntityOid convenciones:**
String "new" indica modo creación executeando moduleClass.createNewInstance() generando entidad vacía, string numérico "123" indica edición requiriendo carga desde API future implementation, string vacío "" para ListView sin entidad específica. Application.View.value.entityOid almacena valor sincronizado con URL oid parameter.

## 4. Descripción Técnica

**RUTAS ARRAY:**
```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        redirect: () => {
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
**HOME REDIRECT:** Función redirect ejecuta al navegar / verificando Application.ModuleList.value no vacío, obtiene firstModule [0] extrae moduleName con getModuleName() decorator o name fallback, retorna template string `/${moduleName.toLowerCase()}` ejemplo "/products". Si ModuleList vacío retorna "/" permaneciendo home sin redirect.

**MODULELIST ROUTE:** Path /:module captura cualquier segment después / como param module, component inline template renderiza ComponentContainerComponent tag, meta viewType list usado logging identification. ComponentContainerComponent lee Application.View.value.component renderizando DefaultListView con DetailViewTableComponent tabla.

**MODULEDETAIL ROUTE:** Path /:module/:oid captura dos segments module y oid, component inline template ComponentContainerComponent igual ModuleList, meta viewType detail identifica vista detalle. Oid "new" renderiza formulario vacío, oid numérico "123" renderiza formulario con datos entity loaded API future.

**ROUTER INITIALIZATION:**
```typescript
let Application: any = null;

export function initializeRouterWithApplication(app: any) {
    Application = app;
}

const router: Router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});
```
**VARIABLE GLOBAL:** Application declarada null scope module permitiendo access beforeEach afterEach guards. initializeRouterWithApplication recibe app singleton actualizando Application = app después createApp() en main.ts. createRouter usa createWebHistory con BASE_URL env variable generando URLs clean sin hash.

**BEFOREEACH GUARD:**
```typescript
router.beforeEach((to, _from, next) => {
    if (!Application) {
        next();
        return;
    }

    const moduleName = to.params.module as string;
    const oid = to.params.oid as string;

    const moduleClass = Application.ModuleList.value.find((mod: typeof BaseEntity) => {
        const modName = mod.getModuleName() || mod.name;
        return modName.toLowerCase() === moduleName?.toLowerCase();
    });

    if (moduleClass) {
        const currentModule = Application.View.value.entityClass;
        const currentModuleName = currentModule ? 
            (currentModule.getModuleName() || currentModule.name).toLowerCase() : '';
        const currentOid = Application.View.value.entityOid;
        
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
**VALIDACION APPLICATION:** Primero verifica if (!Application) permitiendo navegación sin sync si singleton no inicializado evitando errors startup. Extrae moduleName y oid desde to.params casting string.

**BUSQUEDA MODULO:** find() itera Application.ModuleList comparando mod.getModuleName() o mod.name lowercase con moduleName lowercase. getModuleName() retorna valor @ModuleName decorator o undefined usando name fallback. Match encontrado almacena moduleClass typeof BaseEntity.

**DETECCION CAMBIOS:** Obtiene currentModule currentModuleName currentOid desde Application.View.value actual, compara con moduleName y oid params URL. Solo actualiza if diferentes previniendo loop infinito donde changeView trigger router.push trigger beforeEach trigger changeView recursivamente.

**SYNC DETAIL VIEW:** Si oid presente y meta.viewType detail establece entityOid, verifica oid === "new" ejecutando createNewInstance() y changeViewToDetailView con newEntity, else imprime log "Preparando detail view" futuro implementación API load.

**SYNC LIST VIEW:** Si oid ausente establece entityOid empty string, verifica viewType no LISTVIEW ya ejecutando changeViewToListView con moduleClass evitando call redundante.

**ERROR HANDLING:** Si moduleClass no encontrado imprime console.warn "Módulo no encontrado" permite navegación next() sin crash app, útil development URL changes o typos.

**AFTEREACH GUARD:**
```typescript
router.afterEach((to) => {
    if (Application) {
        console.log('[Router] Navegado a:', to.path, '| entityOid:', Application.View.value.entityOid);
    }
});
```
**LOGGING DEBUG:** Imprime cada navegación exitosa mostrando to.path URL y entityOid actualizado. Solo ejecuta if Application inicializado. Output ejemplo "[Router] Navegado a: /products/123 | entityOid: 123".

## 5. Flujo de Funcionamiento

**PASO 1 - Inicializar Router Main:**
main.ts ejecuta const app = createApp(App) creando Vue app instance, ejecuta app.use(router) montando router plugin, ejecuta Application.initializeApplication(router) pasando router reference a singleton, ejecuta initializeRouterWithApplication(Application) inyectando Application reference en router module global variable, ejecuta app.mount('#app') renderizando app, ambos sistemas Application y router ahora referencian mutuamente resolviendo circular dependency.

**PASO 2 - Navegación Home Redirect:**
Usuario navega browser / ruta home, router ejecuta redirect function verificando Application.ModuleList.value length mayor 0, obtiene firstModule = ModuleList[0] ejemplo Products class, extrae moduleName con getModuleName() retornando "productos" o name fallback "Products", retorna `/${moduleName.toLowerCase()}` generando "/productos" o "/products", router navega automáticamente ModuleList route triggering beforeEach.

**PASO 3 - Navegación ListView Programática:**
Usuario hace clic NewButton ejecutando handleNew(), código llama Application.changeViewToListView(Products), método actualiza Application.View.value estableciendo entityClass Products entityObject null component DefaultListView viewType LISTVIEW entityOid empty, método ejecuta router.push(`/${moduleName.toLowerCase()}`) ejemplo "/products" actualizando browser URL, router beforeEach detecta navegación URL pero compara con Application.View detectando ya sincronizado no re-ejecuta changeView evitando loop, ComponentContainerComponent reacciona Application.View.component change renderizando DefaultListView.

**PASO 4 - Navegación DetailView NEW Programática:**
Usuario hace clic NewButton en ListView, código crea newProduct = new Products() vacía, llama Application.changeViewToDetailView(newProduct), método actualiza View.value estableciendo entityClass Products entityObject newProduct component DefaultDetailView viewType DETAILVIEW entityOid "new", método ejecuta router.push("/products/new") actualizando URL, beforeEach ejecuta encuentra moduleClass Products detecta oid "new" meta.viewType detail, ejecuta createNewInstance() redundante pero inmutability safe, ejecuta changeViewToDetailView triggering re-render, DefaultDetailView renderiza formulario vacío campos default values.

**PASO 5 - Navegación Manual URL Browser:**
Usuario escribe browser address bar "/customers/789" presiona Enter, browser actualiza window.location triggering router navigation, beforeEach extrae params {module: "customers", oid: "789"}, busca moduleClass en ModuleList encontrando Customer class, compara con Application.View detectando diferente module o oid, establece Application.View.value.entityOid = "789", verifica oid !== "new" imprimiendo log "Preparando detail view para OID: 789", futuro implementation ejecutará await Customer.load(789) cargar datos API, Application.changeViewToDetailView no ejecutado aquí solo entityOid set, ComponentContainerComponent detecta entityClass change rendering DefaultDetailView con entity.

**PASO 6 - Prevención Loop Bidireccional:**
Usuario hace clic SaveButton después edit ejecutando Application.changeViewToListView(Products), método actualiza View.value y ejecuta router.push("/products"), router beforeEach trigger recibe to.params {module: "products"}, obtiene currentModule Products currentModuleName "products" currentOid empty, compara moduleName === currentModuleName lowercase y currentOid === oid empty ambos matching, detecta no cambio skip actualización Application.View ejecuta next() permitiendo navegación sin re-render, evita loop infinito donde changeView push beforeEach changeView recursively indefinitely.

**PASO 7 - Module Not Found Graceful:**
Usuario navega URL typo "/prodcts" misspelling, beforeEach extrae moduleName "prodcts", busca ModuleList.find() no encuentra match retorna undefined, verifica if (!moduleClass) ejecutando console.warn "[Router] Módulo no encontrado: prodcts", ejecuta next() permitiendo navegación sin crash app, ComponentContainerComponent renderiza Application.View.component actual sin cambio, útil development permite continuar debugging sin reload app.

**PASO 8 - Logging AfterEach Navigation:**
Cada navegación exitosa afterEach dispara, verifica Application inicializado, imprime console.log "[Router] Navegado a: /products/123 | entityOid: 123" mostrando path actualizado y entityOid sincronizado, facilita debugging verificar sync correcto URL Application.View state matching.

**PASO 9 - History Browser Buttons:**
Usuario hace clic browser back button, browser pops history stack navegando previous URL ejemplo /products, router beforeEach detecta URL change extrae params module "products" sin oid, compara con Application.View detectando cambio de DetailView con oid a ListView sin oid, ejecuta changeViewToListView actualizando View.value rendering DefaultListView tabla, forward button comportamiento simétrico pushing history adelante.

**PASO 10 - ModuleName Decorator Custom URL:**
Entity class usa @ModuleName("productos") decorator customizando URL, changeViewToDetailView ejecuta getModuleName() retornando "productos" en lugar class name "Products", router.push genera "/productos/123" URL lowercase, beforeEach busca ModuleList comparing "productos" lowercase con getModuleName() lowercase find match, sincroniza Application.View correctamente con clase Products entity instance, permite URLs español inglés otros idiomas independiente class name TypeScript.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE ejecutar initializeRouterWithApplication(Application) después createApp() y app.use(router) antes app.mount() resolviendo circular dependency.

**REGLA 2:** SIEMPRE usar Application.changeViewToListView changeViewToDetailView para navegación programática, NUNCA router.push() directamente sin actualizar View.value causando desync.

**REGLA 3:** SIEMPRE comparar currentModuleName currentOid con URL params before actualizar Application.View previniendo loop infinito bidireccional.

**REGLA 4:** SIEMPRE verificar if (!Application) en beforeEach permitiendo navegación sin crash si singleton no inicializado startup timing.

**REGLA 5:** SIEMPRE usar getModuleName() o name fallback para moduleClass lookup case-insensitive lowercase comparison matching URLs.

**REGLA 6:** SIEMPRE establecer entityOid = "new" string para creación, numeric string "123" para edición, empty string "" para ListView sin entity.

**REGLA 7:** SIEMPRE usar createWebHistory() HTML5 mode, NUNCA createWebHashHistory() generando URLs con hash # ugly non-SEO.

**REGLA 8:** SIEMPRE documentar bloques de lógica compleja usando JSDoc `/** ... */` siguiendo § 06-CODE-STYLING-STANDARDS 6.6. PROHIBIDO comentarios de una línea `//` excepto en contextos JSDoc internos. Guardrails beforeEach afterEach deben documentarse con JSDoc block explicando propósito y comportamiento.

## 7. Prohibiciones

**PROHIBIDO:** Llamar router.push() directamente sin actualizar Application.View.value antes causando desync UI state URL.

**PROHIBIDO:** Mutar Application.View.value properties individualmente dentro beforeEach, usar changeViewToListView changeViewToDetailView métodos atomic updates.

**PROHIBIDO:** Comparar module names case-sensitive causando mismatch "Products" !== "products" no encontrando moduleClass.

**PROHIBIDO:** Omitir next() callback en beforeEach causando navegación hang freeze router sin renderizar component.

**PROHIBIDO:** Hardcodear rutas custom dentro /:module pattern conflicting dynamic routes, agregar custom routes separate entries routes array.

**PROHIBIDO:** Asumir moduleClass siempre encontrado, verificar undefined before acceder métodos evitando TypeError crash.

**PROHIBIDO:** Usar router.replace() en changeView methods perdiendo history navigation stack, usar router.push() permitiendo back button.

## 8. Dependencias

**LIBRERIAS EXTERNAS:**
- vue-router: createRouter createWebHistory RouteRecordRaw Router types

**MODELS:**
- Application: Singleton con ModuleList View router properties
- View interface: entityClass entityObject component viewType entityOid properties
- BaseEntity: typeof BaseEntity para entityClass moduleClass types

**ENUMS:**
- ViewTypes: LISTVIEW DETAILVIEW LOOKUPVIEW para View.viewType property

**COMPONENTES:**
- ComponentContainerComponent: Renderiza dinámicamente Application.View.component
- DefaultListView: Component ListView rendering DetailViewTableComponent
- DefaultDetailView: Component DetailView rendering formulario dinámico

**DECORADORES:**
- @ModuleName: Define custom module name para URLs en lugar class name

**METODOS APPLICATION:**
- Application.changeViewToListView: Actualiza View.value ejecuta router.push list
- Application.changeViewToDetailView: Actualiza View.value ejecuta router.push detail
- Application.initializeApplication: Recibe router reference almacena Application.router

## 9. Relaciones

**ROUTER Y APPLICATION CIRCULAR:**
Router necesita Application.ModuleList para buscar moduleClass y Application.View para comparar sync, Application necesita router.push() para navegación programática actualizar URL. Circular dependency resuelto con lazy initialization router variable global Application null inicializado luego poblado initializeRouterWithApplication() después ambos creados main.ts.

**BEFOREEACH Y CHANGEVIEW BIDIRECTIONAL:**
beforeEach detecta URL change ejecuta changeViewToListView actualizando View.value, changeViewToListView actualiza View.value ejecuta router.push() triggering beforeEach. Loop prevenido comparando currentModuleName currentOid con params solo ejecutando changeView si different, garantiza sincronización sin recursión infinita.

**MODULELIST Y ROUTING:**
Application.ModuleList.value array almacena todas entity classes Products Customer Order registradas, beforeEach itera find() comparando moduleName URL con getModuleName() class.name, match encontrado determina entityClass para View.value establishing context entire CRUD UI rendering components inputs validations based entity metadata.

**ENTITYOID Y MODO CRUD:**
entityOid string "new" indica creación ejecutando createNewInstance() rendering formulario vacío SaveButton disabled hasta valid, entityOid numeric "123" indica edición future loading await Entity.load(123) API rendering formulario populated SaveButton enabled si valid, entityOid empty "" indica ListView sin entity specific all records tabla pagination.

**COMPONENTCONTAINERCOMPONENT DYNAMIC RENDERING:**
Router routes no hardcodean DefaultListView DefaultDetailView components, usan ComponentContainerComponent inline template leyendo Application.View.component reactivo. changeViewToListView establece component = entityClass.getListComponent() retornando DefaultListView, changeViewToDetailView establece component = entityClass.getDetailComponent() retornando DefaultDetailView, permite custom components por entity overriding getListComponent() getDetailComponent() métodos.

**META VIEWTYPE IDENTIFICATION:**
routes array meta {viewType: 'list'} y {viewType: 'detail'} identify route type usado beforeEach conditional logic. meta.viewType detail verifica oid presente ejecuta createNewInstance detail flow, meta.viewType list ejecuta changeViewToListView flow, facilita guards adicionales authentication permission checks basados route type.

## 10. Notas de Implementación

**EJEMPLO MAIN.TS INITIALIZATION:**
```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import Application from '@/models/application';
import router, { initializeRouterWithApplication } from '@/router';

// 1. Crear Vue app
const app = createApp(App);

// 2. Montar router plugin
app.use(router);

// 3. Inicializar Application con router
Application.initializeApplication(router);

// 4. Inyectar Application en router
initializeRouterWithApplication(Application);

// 5. Montar app DOM
app.mount('#app');
```

**EJEMPLO NAVEGACION PROGRAMATICA:**
```typescript
// Application.ts - changeViewToListView
changeViewToListView(entityClass: typeof BaseEntity) {
    const moduleName = entityClass.getModuleName() || entityClass.name;
    const moduleRoute = `/${moduleName.toLowerCase()}`;
    
    // Actualizar router URL
    this.router?.push(moduleRoute);
    
    // Actualizar View state
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
    
    // Actualizar router URL
    this.router?.push(detailRoute);
    
    // Actualizar View state
    this.View.value = {
        entityClass: entity.constructor as typeof BaseEntity,
        entityObject: entity,
        component: (entity.constructor as typeof BaseEntity).getDetailComponent(),
        viewType: ViewTypes.DETAILVIEW,
        isValid: entity.isEntityValid(),
        entityOid: String(oid)
    };
}

// Uso desde component
Application.changeViewToListView(Products);
// URL: /products
// View: { entityClass: Products, entityObject: null, ... }

const newProduct = new Products();
Application.changeViewToDetailView(newProduct);
// URL: /products/new
// View: { entityClass: Products, entityObject: newProduct, entityOid: "new", ... }
```

**EJEMPLO NAVEGACION MANUAL URL:**
```typescript
// Usuario escribe browser: /customers/789
// beforeEach dispara:

to.params = { module: "customers", oid: "789" }

// Buscar module
const moduleClass = Application.ModuleList.value.find(mod => {
    const modName = mod.getModuleName() || mod.name;
    return modName.toLowerCase() === "customers";
});
// moduleClass = Customer

// Comparar estado actual
const currentModuleName = "products";  // Application.View estaba en Products
const currentOid = "";

// Detecta cambio: "products" !== "customers"
// Actualiza:
Application.View.value.entityOid = "789";

// Futuro: cargar entity
const customer = await Customer.load(789);
Application.changeViewToDetailView(customer);

// ComponentContainerComponent renderiza DefaultDetailView con customer
```

**EJEMPLO MODULE NOT FOUND:**
```typescript
// Usuario navega /typomodule
// beforeEach:

const moduleClass = Application.ModuleList.value.find(mod =>
    (mod.getModuleName() || mod.name).toLowerCase() === "typomodule"
);
// moduleClass = undefined

if (!moduleClass) {
    console.warn('[Router] Módulo no encontrado: typomodule');
    next();  // Permite navegación sin crash
    return;
}

// Application.View permanece sin cambios
// UI muestra vista anterior
```

**EJEMPLO PREVENCION LOOP:**
```typescript
// Estado actual:
Application.View.value = {
    entityClass: Products,
    entityOid: "123",
    // ...
};
// URL: /products/123

// Usuario hace clic SaveButton ejecuta:
Application.changeViewToListView(Products);

// changeViewToListView actualiza View y ejecuta:
router.push('/products');

// beforeEach detecta navegación:
to.params = { module: "products" }

// Extrae estado actual:
const currentModuleName = "products";  // Products.name.toLowerCase()
const currentOid = "123";

// Compara con URL target:
const moduleName = "products";
const oid = "";  // undefined

// Detecta cambio: currentOid "123" !== oid ""
// Ejecuta changeViewToListView actualizando to ListView

// AHORA, changeViewToListView ejecuta router.push('/products') OTRA VEZ
// beforeEach dispara NUEVAMENTE:

to.params = { module: "products" }
currentModuleName = "products"  // Ya actualizado ListView
currentOid = ""  // Ya actualizado ListView

// Compara:
// "products" === "products" ✓
// "" === "" ✓

// NO ejecuta changeView
next();  // Solo permite navegación sin re-actualizar

// Loop prevenido!
```

**EJEMPLO MODULENAME DECORATOR:**
```typescript
// Entity con decorator custom
@ModuleName("productos")
class Products extends BaseEntity {
    // ...
}

// Application.changeViewToListView(Products)
const moduleName = Products.getModuleName();  // "productos"
const moduleRoute = `/productos`;  // URL lowercase
router.push('/productos');

// beforeEach busca:
Application.ModuleList.value.find(mod => {
    const modName = mod.getModuleName();  // "productos"
    return modName.toLowerCase() === "productos";  // Match!
});

// URLs generadas:
// /productos        → ListView
// /productos/new    → Create
// /productos/123    → Edit
```

**EJEMPLO FUTURE API LOADING:**
```typescript
// router beforeEach - implementación futura
if (oid && oid !== 'new') {
    try {
        // Mostrar loading
        Application.eventBus.emit('show-loading');
        
        // Cargar entidad desde backend
        const entity = await moduleClass.load(oid);
        
        // Actualizar vista con entidad cargada
        Application.changeViewToDetailView(entity);
        
    } catch (error) {
        console.error('[Router] Error loading entity:', error);
        
        // Mostrar toast error
        Application.ApplicationUIService.pushToast({
            type: ToastType.ERROR,
            title: 'Error',
            message: 'No se pudo cargar la entidad'
        });
        
        // Redirigir a lista
        next({ name: 'ModuleList', params: { module: moduleName } });
        return;
        
    } finally {
        Application.eventBus.emit('hide-loading');
    }
}

next();
```

**EJEMPLO CUSTOM ROUTES EXTENSION:**
```typescript
const routes: Array<RouteRecordRaw> = [
    // ... rutas existentes ...
    
    // Dashboard custom
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }
    },
    
    // Login public
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: { public: true }
    },
    
    // 404 catch-all
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundView
    }
];

// Guard autenticación adicional
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next({ name: 'Login' });
        return;
    }
    
    // ... sync logic existente ...
    
    next();
});
```

**DEBUGGING ROUTER:**
```typescript
// Ver ruta actual
console.log('Current route:', router.currentRoute.value);
// { path: "/products/123", params: { module: "products", oid: "123" }, ... }

// Ver params
console.log('Module:', router.currentRoute.value.params.module);
console.log('OID:', router.currentRoute.value.params.oid);

// Ver módulos disponibles
console.log('Modules:', Application.ModuleList.value.map(m => 
    m.getModuleName() || m.name
));
// ["Products", "Customers", "Orders"]

// Navegar programáticamente
router.push({ name: 'ModuleDetail', params: { module: 'products', oid: '123' } });

// History navigation
router.back();   // Botón back browser
router.forward(); // Botón forward browser

// Verificar sincronización
console.log('URL:', router.currentRoute.value.path);
console.log('View entityOid:', Application.View.value.entityOid);
console.log('View entityClass:', Application.View.value.entityClass?.name);
// Deben coincidir!
```

**LIMITACIONES ACTUALES:**
Carga API no implementada, oid numérico no ejecuta await Entity.load(oid) solo imprime log "Preparando detail view", entity debe pre-loaded memory o created new. No lazy loading modules, todas vistas DefaultListView DefaultDetailView cargadas app bundle inicial sin code splitting. No validación OID existencia backend antes navegar, usuario puede escribir /products/999999 non-existent renderizando formulario vacío. Server configuration requerida nginx try_files $uri /index.html rewriting URLs evitando 404 HTML5 History Mode.

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- application-singleton.md: Application.ModuleList Application.View Application.router properties métodos changeViewToListView changeViewToDetailView
- ComponentContainerComponent.md: Componente lee Application.View.component renderizando dinámicamente DefaultListView DefaultDetailView
- DefaultListView.md: Componente renderizado /:module lista con DetailViewTableComponent
- DefaultDetailView.md: Componente renderizado /:module/:oid formulario con inputs dinámicos
- module-name-decorator.md: Decorador @ModuleName customiza URLs módulos
- View interface: src/models/View.ts entityClass entityObject viewType entityOid properties
- BaseEntity.md: getModuleName() getListComponent() getDetailComponent() createNewInstance() métodos

**UBICACION:** copilot/layers/05-advanced/Router.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
