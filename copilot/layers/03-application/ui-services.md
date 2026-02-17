# UI Services

## 1. Propósito

Proporcionar servicio centralizado ApplicationUIService abstraído de Application singleton para gestionar operaciones UI comunes (toasts, modales, confirmaciones, loading screens, sidebar toggle, tema oscuro) mediante métodos helper que emiten eventos y actualizan estado reactivo Application.

## 2. Alcance

### 2.1 Responsabilidades

- Mostrar toast notifications con showToast(message, type)
- Gestionar modales con showModal(), showModalOnFunction(), closeModal()
- Controlar confirmation menus con openConfirmationMenu(), acceptConfigurationMenu()
- Gestionar dropdown menus con openDropdownMenu(), closeDropdownMenu()
- Controlar loading screens con showLoadingScreen(), hideLoadingScreen()
- Toggle sidebar con toggleSidebar(), setSidebar(state)
- Toggle dark mode con toggleDarkMode()
- Emitir eventos correspondientes via Application.eventBus

### 2.2 Límites

- No renderiza UI directamente (responsabilidad de componentes)
- No gestiona estado local de componentes UI (solo estado global Application)
- No valida permisos de acceso a modales (responsabilidad de caller)
- No implementa animaciones (CSS en componentes)
- No persiste configuración UI (solo memoria)
- No gestiona múltiples modales simultáneos (uno a la vez)

## 3. Definiciones Clave

**ApplicationUIService**: Clase servicio instanciada en Application constructor, recibe ApplicationUIContext para acceso a propiedades reactivas.

**ApplicationUIContext**: Interface definiendo propiedades reactivas de Application (modal, ToastList, confirmationMenu, dropdownMenu, AppConfiguration, eventBus).

**showToast(message, type)**: Agrega Toast a ToastList.value, ToastComponent renderiza automáticamente, auto-remove después de duration.

**showModal(entity, viewType)**: Actualiza modal.value con entityClass y viewType, emite 'show-modal', ModalComponent escucha y renderiza.

**openConfirmationMenu(type, title, message, onAccept)**: Actualiza confirmationMenu.value con datos, emite 'show-confirmation', ConfirmationMenuComponent renderiza diálogo.

**showLoadingScreen()/hideLoadingScreen()**: Emite 'show-loading'/'hide-loading', LoadingScreenComponent escucha y muestra/oculta overlay.

**toggleSidebar()**: Emite 'toggle-sidebar' sin payload, SideBarComponent invierte estado collapsed.

**toggleDarkMode()**: Invierte AppConfiguration.value.isDarkMode, CSS reacciona con :root[data-theme="dark"].

## 4. Descripción Técnica

### 4.1 Estructura de ApplicationUIService

```typescript
// src/models/application_ui_service.ts (líneas 9-138)
export class ApplicationUIService {
    private app: ApplicationUIContext;

    constructor(app: ApplicationUIContext) {
        this.app = app;
    }

    // Métodos UI...
}
```

Constructor recibe ApplicationUIContext (Application implements interface), guarda referencia en private app property.

### 4.2 Toast Management

**showToast(message: string, type: ToastType)**
```typescript
// Líneas 30-32
showToast = (message: string, type: ToastType) => {
    this.app.ToastList.value.push(new Toast(message, type));
}
```

Agrega instancia Toast a ToastList.value. Toast class (src/models/Toast.ts) contiene: message, type, id, timestamp. ToastComponent reactivamente renderiza nuevos toasts.

**ToastType Enum**
```typescript
// src/enums/ToastType.ts
export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}
```

**Usage**
```typescript
Application.ApplicationUIService.showToast('Product saved!', ToastType.SUCCESS);
Application.ApplicationUIService.showToast('Failed to load', ToastType.ERROR);
Application.ApplicationUIService.showToast('Stock is low', ToastType.WARNING);
Application.ApplicationUIService.showToast('Data loaded', ToastType.INFO);
```

### 4.3 Modal Management

**showModal(entity, viewType, customViewId?)**
```typescript
// Líneas 34-40
showModal = (entity: typeof BaseEntity, viewType: ViewTypes, customViewId?: string) => {
    this.app.modal.value.modalView = entity;
    this.app.modal.value.modalOnCloseFunction = null;
    this.app.modal.value.viewType = viewType;
    this.app.modal.value.customViewId = customViewId;
    this.app.eventBus.emit('show-modal');
}
```

Actualiza modal.value state, emite 'show-modal' event. ModalComponent escucha evento y renderiza modal overlay.

**showModalOnFunction(entity, onCloseFunction, viewType, customViewId?)**
```typescript
// Líneas 42-48
showModalOnFunction = (entity: typeof BaseEntity, onCloseFunction: (param: any) => void, viewType: ViewTypes, customViewId?: string) => {
    this.app.modal.value.modalView = entity;
    this.app.modal.value.modalOnCloseFunction = onCloseFunction;
    this.app.modal.value.viewType = viewType;
    this.app.modal.value.customViewId = customViewId;
    this.app.eventBus.emit('show-modal');
}
```

Similar a showModal pero incluye callback onCloseFunction ejecutado cuando modal cierra.

**closeModal()**
```typescript
// Líneas 50-55
closeModal = () => {
    this.app.eventBus.emit('hide-modal');
    setTimeout(() => {
        this.app.modal.value.modalView = null;
    }, 150);
}
```

Emite 'hide-modal' para animación de cierre, después de 150ms limpia modal.value.modalView.

**closeModalOnFunction(param)**
```typescript
// Líneas 57-65
closeModalOnFunction = (param: any) => {
    if (this.app.modal.value.modalOnCloseFunction) {
        this.app.modal.value.modalOnCloseFunction(param);
    }
    this.app.eventBus.emit('hide-modal');
    setTimeout(() => {
        this.app.modal.value.modalView = null;
        this.app.modal.value.modalOnCloseFunction = null;
    }, 150);
}
```

Ejecuta onCloseFunction callback con param, luego cierra modal.

### 4.4 Dropdown Menu Management

**openDropdownMenu(position, title, component, width?)**
```typescript
// Líneas 67-79
openDropdownMenu = (position: HTMLElement, title: string, component: Component, width?: string) => {
    const rect = position.getBoundingClientRect();
    this.app.dropdownMenu.value.position_x = `${rect.left}px`;
    this.app.dropdownMenu.value.position_y = `${rect.bottom}px`;
    this.app.dropdownMenu.value.activeElementWidth = `${rect.width}px`;
    this.app.dropdownMenu.value.activeElementHeight = `${rect.height}px`;
    this.app.dropdownMenu.value.title = title;
    this.app.dropdownMenu.value.component = markRaw(component);
    if (width) {
        this.app.dropdownMenu.value.width = width;
    }
    this.app.dropdownMenu.value.showing = true;
}
```

Calcula posición relativa a position element usando getBoundingClientRect(), actualiza dropdownMenu.value con posición y component. markRaw() previene Vue reactive wrapping de component.

**closeDropdownMenu()**
```typescript
// Líneas 81-87
closeDropdownMenu = () => {
    this.app.dropdownMenu.value.showing = false;
    setTimeout(() => {
        this.app.dropdownMenu.value.component = null;
        this.app.dropdownMenu.value.title = '';
    }, 500);
}
```

Oculta dropdown inmediatamente (showing = false), limpia component/title después de 500ms (tiempo para animación).

### 4.5 Confirmation Menu Management

**openConfirmationMenu(type, title, message, onAccept?, acceptButtonText, cancelButtonText)**
```typescript
// Líneas 89-99
openConfirmationMenu = (type: confMenuType, title: string, message: string, onAccept?: () => void, acceptButtonText: string = 'Aceptar', cancelButtonText: string = 'Cancelar') => {
    this.app.confirmationMenu.value = {
        type,
        title,
        message,
        confirmationAction: onAccept,
        acceptButtonText,
        cancelButtonText
    };
    this.app.eventBus.emit('show-confirmation');
}
```

Actualiza confirmationMenu.value con todos los parámetros, emite 'show-confirmation'. ConfirmationMenuComponent escucha y renderiza diálogo.

**confMenuType Enum**
```typescript
// src/enums/conf_menu_type.ts
export enum confMenuType {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success'
}
```

**acceptConfigurationMenu()**
```typescript
// Líneas 101-106
acceptConfigurationMenu = () => {
    if (this.app.confirmationMenu.value.confirmationAction) {
        this.app.confirmationMenu.value.confirmationAction();
    }

    this.closeConfirmationMenu();
}
```

Ejecuta confirmationAction callback si exists, luego cierra confirmation menu.

**closeConfirmationMenu()**
```typescript
// Líneas 108-119
closeConfirmationMenu = () => {
    this.app.eventBus.emit('hide-confirmation');
    setTimeout(() => {
        this.app.confirmationMenu.value = {
            type: confMenuType.INFO,
            title: '',
            message: '',
            confirmationAction: () => {}
        };
    }, 500);
}
```

Emite 'hide-confirmation', después de 500ms resetea confirmationMenu.value a valores default.

### 4.6 Loading Screen Management

**showLoadingScreen()**
```typescript
// Líneas 121-123
showLoadingScreen = () => {
    this.app.eventBus.emit('show-loading');
}
```

Emite 'show-loading' event, LoadingScreenComponent escucha y muestra overlay full-screen.

**hideLoadingScreen()**
```typescript
// Líneas 125-127
hideLoadingScreen = () => {
    this.app.eventBus.emit('hide-loading');
}
```

Emite 'hide-loading' event, LoadingScreenComponent oculta overlay.

**showLoadingMenu() / hideLoadingMenu()**
```typescript
// Líneas 129-135
showLoadingMenu = () => {
    this.app.eventBus.emit('show-loading-menu');
}

hideLoadingMenu = () => {
    this.app.eventBus.emit('hide-loading-menu');
}
```

Similar a loading screen pero para loading indicator más pequeño (menu-specific).

### 4.7 Sidebar and Theme Management

**toggleSidebar()**
```typescript
// Líneas 19-21
toggleSidebar = () => {
    this.app.eventBus.emit('toggle-sidebar');
}
```

Emite 'toggle-sidebar' sin payload, SideBarComponent invierte collapsed state.

**setSidebar(state: boolean)**
```typescript
// Líneas 23-25
setSidebar = (state: boolean) => {
    this.app.eventBus.emit('toggle-sidebar', state);
}
```

Emite 'toggle-sidebar' con payload boolean (true = mostrar, false = ocultar), SideBarComponent aplica state explícito.

**toggleDarkMode()**
```typescript
// Líneas 16-18
toggleDarkMode = () => {
    this.app.AppConfiguration.value.isDarkMode = !this.app.AppConfiguration.value.isDarkMode;
}
```

Invierte AppConfiguration.value.isDarkMode. CSS reacciona mediante computed property binding :root[data-theme="dark"].

**JSDOC + REGIONS OBLIGATORIOS:** Archivo application_ui_service.ts DEBE cumplir estándares §06-CODE-STYLING-STANDARDS:

1. **JSDoc Obligatorio (§6.2.1):** Clase ApplicationUIService y TODOS sus métodos públicos (14+) DEBEN tener JSDoc descriptivo completo. Para métodos incluir @param con tipo y descripción, @returns cuando aplique. Ejemplo:
```typescript
/**
 * Servicio centralizado gestionar operaciones UI comunes (toasts, modales, confirmaciones, loading screens).
 * Instanciado únicamente en Application singleton, accesible via Application.ApplicationUIService.
 */
export class ApplicationUIService implements ApplicationUIContext {
    /**
     * Muestra toast notification agregando instancia a ToastList reactivo
     * @param {string} message - Mensaje a mostrar en toast
     * @param {ToastType} type - Tipo de toast (SUCCESS, ERROR, WARNING, INFO)
     */
    showToast = (message: string, type: ToastType): void => { ... }
    
    /**
     * Abre modal global estableciendo component y configuración
     * @param {Component} component - Componente Vue a renderizar en modal
     */
    showModal = (component: Component): void => { ... }
}
```

2. **Regions Obligatorias (§6.6.1):** Clase DEBE estructurarse con @region PROPERTIES y @region METHODS:
```typescript
export class ApplicationUIService {
    /**
     * @region PROPERTIES
     */
    private app: Application;
    AppConfiguration: Ref<AppConfiguration>;
    modal: Ref<Modal>;
    // ... demás propiedades
    /**
     * @endregion
     */
    
    /**
     * @region METHODS
     */
    constructor(app: Application) { ... }
    toggleDarkMode = () => { ... }
    showToast = (message: string, type: ToastType): void => { ... }
    // ... demás métodos
    /**
     * @endregion
     */
}
```

Esto garantiza mantenibilidad, documentación auto-generada y cumplimiento contractual estricto.

## 5. Flujo de Funcionamiento

### 5.1 Flujo de Toast Notification

```
Usuario click "Save" button
    ↓
SaveButtonComponent ejecuta:
await entity.save()
    ↓
Si success:
Application.ApplicationUIService.showToast('Product saved!', ToastType.SUCCESS)
    ↓
showToast() ejecuta:
this.app.ToastList.value.push(new Toast('Product saved!', ToastType.SUCCESS))
    ↓
ToastList.value cambio detectado por ToastComponent (watch)
    ↓
ToastComponent renderiza nuevo toast en lista
    ↓
Toast class tiene duration default (3000ms)
    ↓
setTimeout(() => { toast.visible = false }, 3000)
    ↓
CSS transition fade-out (300ms)
    ↓
setTimeout(() => { ToastList.splice(index, 1) }, 300)
    ↓
Toast removido de ToastList
    ↓
ToastComponent deja de renderizar toast
```

### 5.2 Flujo de Modal

```
Usuario click en row de tabla (quiere ver detalles en modal)
    ↓
ListViewComponent ejecuta:
Application.ApplicationUIService.showModal(
    Products,
    ViewTypes.DETAILVIEW
)
    ↓
showModal() actualiza:
    - modal.value.modalView = Products
    - modal.value.viewType = ViewTypes.DETAILVIEW
    - modal.value.modalOnCloseFunction = null
    ↓
showModal() emite:
Application.eventBus.emit('show-modal')
    ↓
ModalComponent escucha 'show-modal':
const handleShowModal = () => {
    modalVisible.value = true;
};
Application.eventBus.on('show-modal', handleShowModal);
    ↓
ModalComponent actualiza estado:
modalVisible.value = true
    ↓
ModalComponent renderiza:
<div v-if="modalVisible" class="modal-overlay">
    <component :is="modal.value.modalView.getModuleDetailComponent()" />
</div>
    ↓
Usuario interactúa con modal, luego click "Close"
    ↓
ModalComponent ejecuta:
Application.ApplicationUIService.closeModal()
    ↓
closeModal() emite:
Application.eventBus.emit('hide-modal')
    ↓
ModalComponent escucha 'hide-modal':
modalVisible.value = false
    ↓
CSS transition fade-out (150ms)
    ↓
setTimeout(() => { modal.value.modalView = null }, 150)
    ↓
Modal limpiado y removido del DOM
```

### 5.3 Flujo de Confirmation Menu (Dirty State)

```
Usuario edita product.name en DetailView
    ↓
FormInput actualiza product.name = 'New Name'
    ↓
product.dirtyState = true
    ↓
Usuario intenta navegar a Orders (click en SideBar)
    ↓
Application.changeView() detecta dirtyState:
if (View.entityObject?.getDirtyState()) { ... }
    ↓
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,
    'Salir sin guardar',
    'Tienes cambios sin guardar. ¿Estás seguro?',
    () => { setViewChanges(...) }  // confirmationAction
)
    ↓
openConfirmationMenu() actualiza:
    - confirmationMenu.value.type = WARNING
    - confirmationMenu.value.title = 'Salir sin guardar'
    - confirmationMenu.value.message = '...'
    - confirmationMenu.value.confirmationAction = callback
    ↓
openConfirmationMenu() emite:
Application.eventBus.emit('show-confirmation')
    ↓
ConfirmationMenuComponent escucha 'show-confirmation':
confirmationVisible.value = true
    ↓
ConfirmationMenuComponent renderiza diálogo con botones [Cancelar, Aceptar]
    ↓
OPCIÓN A: Usuario click "Cancelar"
    → ConfirmationMenuComponent ejecuta:
      Application.ApplicationUIService.closeConfirmationMenu()
    → Emite 'hide-confirmation'
    → confirmationVisible.value = false
    → Permanece en DetailView de Products

OPCIÓN B: Usuario click "Aceptar"
    → ConfirmationMenuComponent ejecuta:
      Application.ApplicationUIService.acceptConfigurationMenu()
    → Ejecuta confirmationAction callback:
      setViewChanges(Orders, ...) // Navega a Orders
    → Luego closeConfirmationMenu()
    → Cambios en product descartados
    → Navega a Orders ListView
```

### 5.4 Flujo de Loading Screen

```
Usuario click "Refresh" button en ListView
    ↓
RefreshButtonComponent ejecuta:
Application.ApplicationUIService.showLoadingScreen()
    ↓
showLoadingScreen() emite:
Application.eventBus.emit('show-loading')
    ↓
LoadingScreenComponent escucha 'show-loading':
loadingVisible.value = true
    ↓
LoadingScreenComponent renderiza:
<div v-if="loadingVisible" class="loading-overlay">
    <div class="spinner"></div>
    <p>Loading...</p>
</div>
    ↓
RefreshButtonComponent ejecuta operación larga:
try {
    const products = await Products.getElementList();
    updateListView(products);
} finally {
    Application.ApplicationUIService.hideLoadingScreen();
}
    ↓
hideLoadingScreen() emite:
Application.eventBus.emit('hide-loading')
    ↓
LoadingScreenComponent escucha 'hide-loading':
loadingVisible.value = false
    ↓
LoadingScreenComponent oculta overlay con fade transition
```

### 5.5 Flujo de Toggle Dark Mode

```
Usuario click "Dark Mode" toggle en TopBar
    ↓
DarkModeButtonComponent ejecuta:
Application.ApplicationUIService.toggleDarkMode()
    ↓
toggleDarkMode() ejecuta:
AppConfiguration.value.isDarkMode = !AppConfiguration.value.isDarkMode
    ↓
Si antes era false, ahora true (activar dark mode)
    ↓
App.vue tiene computed:
const theme = computed(() => 
    Application.AppConfiguration.value.isDarkMode ? 'dark' : 'light'
)
    ↓
Template binding:
<div :data-theme="theme">
    ↓
HTML actualizado:
<div data-theme="dark">
    ↓
CSS reacciona:
:root[data-theme="dark"] {
    --background-color: var(--bg-dark);
    --text-color: var(--white);
    ...
}
    ↓
Todo el UI re-renderiza con colores dark
```

## 6. Reglas Obligatorias

### 6.1 Instanciación y Acceso

1. ApplicationUIService instanciado EN Application constructor
2. SIEMPRE acceder via Application.ApplicationUIService (no crear instancias)
3. Constructor recibe ApplicationUIContext (Application implements interface)
4. Private app property guarda referencia a Application context
5. Métodos usan this.app para acceder propiedades reactivas

### 6.2 Toast Management

6. Usar ToastType enum para type parameter (SUCCESS, ERROR, WARNING, INFO)
7. Toast auto-remove después de duration (default 3000ms en Toast class)
8. No remover toasts manualmente (Toast class maneja lifecycle)
9. showToast() agrega a ToastList, no reemplaza
10. ToastComponent renderiza múltiples toasts simultáneos (stack)

### 6.3 Modal Management

11. Solo un modal activo a la vez (new modal reemplaza anterior)
12. Usar showModal() para modales simples sin callback
13. Usar showModalOnFunction() para modales con callback on close
14. closeModal() delay 150ms para animación fade-out CSS
15. closeModalOnFunction() ejecuta callback ANTES de cerrar

### 6.4 Confirmation Menu

16. Usar confMenuType enum (INFO, WARNING, ERROR, SUCCESS)
17. confirmationAction callback OPCIONAL (puede ser undefined)
18. acceptConfigurationMenu() DEBE verificar if (confirmationAction) antes de ejecutar
19. acceptButtonText y cancelButtonText default ('Aceptar', 'Cancelar')
20. closeConfirmationMenu() delay 500ms para animación

### 6.5 Loading Screens

21. SIEMPRE usar try/finally para garantizar hideLoadingScreen()
22. showLoadingScreen() antes de operación larga
23. hideLoadingScreen() en finally block (ejecuta incluso si error)
24. showLoadingMenu() para loading indicators pequeños (no full-screen)
25. No anidar múltiples loading screens (conflicto visual)

### 6.6 Event Emission

26. Todos los métodos que emiten eventos DEBEN usar Application.eventBus
27. Event names deben coincidir con Events type definition
28. Componentes UI escuchan eventos con on() en onMounted()
29. Componentes DEBEN off() en onBeforeUnmount() (memory leak prevention)
30. Delays (setTimeout) necesarios para animaciones CSS sync

### 6.7 JSDoc + Regions

31. SIEMPRE incluir JSDoc completo en clase ApplicationUIService y TODOS métodos públicos (14+) según §06-CODE-STYLING-STANDARDS 6.2.1. Usar @param y @returns cuando corresponda
32. SIEMPRE estructurar application_ui_service.ts con @region PROPERTIES y @region METHODS según §06-CODE-STYLING-STANDARDS 6.6.1. Permite colapsado IDE y navegación rápida
33. Toast.ts DEBE incluir JSDoc en propiedades públicas (id, message, type) y constructor con @param

## 7. Prohibiciones

### 7.1 Prohibiciones de Instanciación

1. PROHIBIDO `new ApplicationUIService()` manual (instanciado en Application)
2. PROHIBIDO múltiples instancias de ApplicationUIService
3. PROHIBIDO modificar ApplicationUIService.prototype
4. PROHIBIDO extender ApplicationUIService con herencia
5. PROHIBIDO acceder this.app fuera de ApplicationUIService methods

### 7.2 Prohibiciones de Toasts

6. PROHIBIDO remover toasts manualmente de ToastList (auto-remove)
7. PROHIBIDO modificar Toast instance después de push a ToastList
8. PROHIBIDO showToast() sin ToastType (no default)
9. PROHIBIDO toast messages vacíos (message = '')
10. PROHIBIDO más de 5 toasts simultáneos (UX pobre)

### 7.3 Prohibiciones de Modales

11. PROHIBIDO mostrar múltiples modales simultáneamente
12. PROHIBIDO closeModal() sin delay (animación se corta)
13. PROHIBIDO modificar modal.value directamente (usar showModal/closeModal)
14. PROHIBIDO modales anidados (modal dentro de modal)
15. PROHIBIDO showModal() sin entityClass válido

### 7.4 Prohibiciones de Confirmation Menus

16. PROHIBIDO openConfirmationMenu() sin title o message
17. PROHIBIDO confirmationAction con lógica síncrona bloqueante (>100ms)
18. PROHIBIDO acceptConfigurationMenu() sin verificar if (confirmationAction)
19. PROHIBIDO modificar confirmationMenu.value durante animación
20. PROHIBIDO confirmation menus para operaciones reversibles (usar toasts)

### 7.5 Prohibiciones de Loading Screens

21. PROHIBIDO showLoadingScreen() sin correspondiente hideLoadingScreen()
22. PROHIBIDO hideLoadingScreen() sin try/finally
23. PROHIBIDO loading screens para operaciones <500ms (flicker visual)
24. PROHIBIDO múltiples showLoadingScreen() sin hide entre medio
25. PROHIBIDO loading screens sin feedback al usuario (mensaje "Loading...")

### 7.6 Prohibiciones de Event Emission

26. PROHIBIDO emitir eventos no definidos en Events type
27. PROHIBIDO emitir eventos con payload incorrecto
28. PROHIBIDO emitir eventos desde computed properties (side effects)
29. PROHIBIDO emitir eventos desde render functions
30. PROHIBIDO asumir orden de ejecución de listeners (async)

## 8. Dependencias

### 8.1 Dependencia de Application

**Application Singleton (@/models/application)**
- Relación: ApplicationUIService instanciado en Application constructor
- Acceso: Application.ApplicationUIService
- Constructor: `new ApplicationUIService(this)` donde this = ApplicationClass
- Crítico: Sí, ApplicationUIService requiere ApplicationUIContext

### 8.2 Dependencia de ApplicationUIContext

**ApplicationUIContext Interface (@/models/application_ui_context)**
- Contenido: Interface definiendo propiedades reactivas (modal, ToastList, confirmationMenu, dropdownMenu, AppConfiguration, eventBus)
- Implementado por: ApplicationClass
- Constructor param: `constructor(app: ApplicationUIContext)`
- Crítico: Sí, tipado de this.app

### 8.3 Dependencia de Models

**Modal (@/models/modal)**
- Propiedades: modalView, modalOnCloseFunction, viewType, customViewId
- Uso: this.app.modal.value actualizado por showModal()

**Toast (@/models/Toast)**
- Constructor: `new Toast(message: string, type: ToastType)`
- Propiedades: message, type, id, timestamp, duration
- Uso: Agregado a ToastList.value

**DropdownMenu (@/models/dropdown_menu)**
- Propiedades: showing, title, component, width, position_x, position_y, canvasWidth, canvasHeight, activeElementWidth, activeElementHeight
- Uso: Actualizado por openDropdownMenu()

**confirmationMenu (@/models/confirmation_menu)**
- Propiedades: type, title, message, confirmationAction, acceptButtonText, cancelButtonText
- Uso: Actualizado por openConfirmationMenu()

### 8.4 Dependencia de Enums

**ToastType (@/enums/ToastType)**
- Valores: SUCCESS, ERROR, WARNING, INFO
- Uso: Parameter type en showToast()

**confMenuType (@/enums/conf_menu_type)**
- Valores: INFO, WARNING, ERROR, SUCCESS
- Uso: Parameter type en openConfirmationMenu()

**ViewTypes (@/enums/view_type)**
- Valores: LISTVIEW, DETAILVIEW, DEFAULTVIEW
- Uso: Parameter viewType en showModal()

### 8.5 Dependencia de Componentes UI

**ToastComponent (@/components/ToastComponent)**
- Escucha: ToastList.value cambios
- Renderiza: Stack de toasts basado en ToastList

**ModalComponent (@/components/ModalComponent)**
- Escucha: 'show-modal', 'hide-modal' eventos
- Renderiza: Modal overlay con component dinámico

**ConfirmationMenuComponent (@/components/ConfirmationMenuComponent)**
- Escucha: 'show-confirmation', 'hide-confirmation' eventos
- Renderiza: Diálogo confirmación con botones

**LoadingScreenComponent (@/components/LoadingScreenComponent)**
- Escucha: 'show-loading', 'hide-loading' eventos
- Renderiza: Full-screen loading overlay

**SideBarComponent (@/components/SideBarComponent)**
- Escucha: 'toggle-sidebar' evento
- Acción: Invierte collapsed state

### 8.6 Dependencia de Event Bus

**mitt (mitt)**
- API: emit(), on(), off()
- Acceso: this.app.eventBus
- Eventos: show-modal, hide-modal, show-confirmation, hide-confirmation, show-loading, hide-loading, toggle-sidebar

## 9. Relaciones

### 9.1 Relación con Application

**Instanciación**
```typescript
// Application constructor (línea 121)
this.ApplicationUIService = new ApplicationUIService(this);
```

ApplicationUIService recibe Application instance como context.

**Acceso**
```typescript
Application.ApplicationUIService.showToast('Message', ToastType.SUCCESS);
```

### 9.2 Relación con Event Bus

**Event Emission Pattern**
```typescript
showModal(...) {
    // 1. Actualizar state
    this.app.modal.value = {...};
    
    // 2. Emitir evento
    this.app.eventBus.emit('show-modal');
}
```

State update seguido de event emission, componentes escuchan y reaccionan.

### 9.3 Relación con Toast System

**Toast Creation**
```typescript
showToast(message, type) {
    this.app.ToastList.value.push(new Toast(message, type));
}
```

Toast class maneja lifecycle (auto-remove después de duration).

**ToastComponent Consumption**
```vue
<div v-for="toast in Application.ToastList.value" :key="toast.id">
    <div :class="`toast toast-${toast.type}`">
        {{ toast.message }}
    </div>
</div>
```

### 9.4 Relación con Modal System

**Modal Flow**
```typescript
// Service
showModal(Products, ViewTypes.DETAILVIEW)
    → modal.value.modalView = Products
    → emit('show-modal')

// Component
<div v-if="modalVisible">
    <component :is="modal.value.modalView.getModuleDetailComponent()" />
</div>
```

### 9.5 Relación con Confirmation System

**Confirmation with Callback**
```typescript
openConfirmationMenu(
    confMenuType.WARNING,
    'Delete Product',
    'Are you sure?',
    async () => {
        await product.delete();
        Application.changeViewToListView(Products);
    }
)
```

Callback ejecutado only si usuario acepta.

### 9.6 Relación con Loading System

**Try/Finally Pattern**
```typescript
async refreshData() {
    try {
        Application.ApplicationUIService.showLoadingScreen();
        const data = await fetchData();
        updateUI(data);
    } finally {
        Application.ApplicationUIService.hideLoadingScreen();
    }
}
```

Finally garantiza hide incluso si error.

## 10. Notas de Implementación

### 10.1 Toast with Auto-Remove

```typescript
// Toast class (src/models/Toast.ts)
export class Toast {
    id: number;
    message: string;
    type: ToastType;
    timestamp: number;
    duration: number;
    
    constructor(message: string, type: ToastType, duration: number = 3000) {
        this.id = Date.now() + Math.random();
        this.message = message;
        this.type = type;
        this.timestamp = Date.now();
        this.duration = duration;
        
        // Auto-remove después de duration
        setTimeout(() => {
            const index = Application.ToastList.value.findIndex(t => t.id === this.id);
            if (index > -1) {
                Application.ToastList.value.splice(index, 1);
            }
        }, duration);
    }
}
```

### 10.2 Modal with onCloseFunction Pattern

```typescript
// Ejemplo: Selector de producto en modal
selectProduct() {
    Application.ApplicationUIService.showModalOnFunction(
        Products,
        (selectedProduct) => {
            // Callback ejecutado cuando modal cierra con resultado
            this.order.productId = selectedProduct.id;
            this.order.productName = selectedProduct.name;
        },
        ViewTypes.LISTVIEW
    );
}

// En ListView dentro del modal, usuario click en producto
selectRow(product) {
    Application.ApplicationUIService.closeModalOnFunction(product);
    // closeModalOnFunction ejecuta callback pasando product
}
```

### 10.3 Confirmation Menu with Dirty State

```typescript
// En Application.changeView()
changeView(entityClass, component, viewType, entity) {
    if (this.View.value.entityObject?.getDirtyState()) {
        this.ApplicationUIService.openConfirmationMenu(
            confMenuType.WARNING,
            'Unsaved Changes',
            'You have unsaved changes. Discard them?',
            () => {
                // Usuario confirmó, continuar navegación
                this.setViewChanges(entityClass, component, viewType, entity);
            },
            'Discard',
            'Cancel'
        );
        return; // No continua navegación hasta confirmación
    }
    
    // Sin cambios, navegar directamente
    this.setViewChanges(entityClass, component, viewType, entity);
}
```

### 10.4 Dropdown Menu Positioning

```typescript
// Ejemplo: Dropdown actions en ListView row
openActionsDropdown(event: MouseEvent) {
    const buttonElement = event.target as HTMLElement;
    
    Application.ApplicationUIService.openDropdownMenu(
        buttonElement,
        'Actions',
        ActionsMenuComponent,
        '200px'
    );
}

// ActionsMenuComponent renderiza opciones
<ul class="actions-menu">
    <li @click="edit">Edit</li>
    <li @click="duplicate">Duplicate</li>
    <li @click="delete">Delete</li>
</ul>
```

### 10.5 Loading Screen with Error Handling

```typescript
async loadData() {
    try {
        Application.ApplicationUIService.showLoadingScreen();
        
        const products = await Products.getElementList();
        this.products = products;
        
        Application.ApplicationUIService.showToast(
            'Data loaded successfully',
            ToastType.SUCCESS
        );
    } catch (error) {
        console.error('Failed to load data:', error);
        
        Application.ApplicationUIService.showToast(
            'Failed to load data',
            ToastType.ERROR
        );
    } finally {
        // CRÍTICO: Siempre ocultar loading, incluso si error
        Application.ApplicationUIService.hideLoadingScreen();
    }
}
```

### 10.6 Dark Mode with CSS Variables

```vue
<!-- App.vue -->
<template>
    <div :data-theme="theme">
        <TopBarComponent />
        <SideBarComponent />
        <ComponentContainerComponent />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Application from '@/models/application';

const theme = computed(() => 
    Application.AppConfiguration.value.isDarkMode ? 'dark' : 'light'
);
</script>

<style>
:root {
    --background-color: var(--white);
    --text-color: var(--black);
}

[data-theme="dark"] {
    --background-color: var(--bg-dark);
    --text-color: var(--white);
}

body {
    background-color: var(--background-color);
    color: var(--text-color);
}
</style>
```

### 10.7 Testing ApplicationUIService

**Unit Test - showToast**
```typescript
test('showToast adds toast to ToastList', () => {
    const initialCount = Application.ToastList.value.length;
    
    Application.ApplicationUIService.showToast('Test message', ToastType.SUCCESS);
    
    expect(Application.ToastList.value.length).toBe(initialCount + 1);
    expect(Application.ToastList.value[initialCount].message).toBe('Test message');
    expect(Application.ToastList.value[initialCount].type).toBe(ToastType.SUCCESS);
});
```

**Integration Test - Modal**
```typescript
test('showModal emits show-modal event', () => {
    const emitSpy = vi.spyOn(Application.eventBus, 'emit');
    
    Application.ApplicationUIService.showModal(Products, ViewTypes.DETAILVIEW);
    
    expect(emitSpy).toHaveBeenCalledWith('show-modal');
    expect(Application.modal.value.modalView).toBe(Products);
});
```

## 11. Referencias Cruzadas

### 11.1 Application Layer

**copilot/layers/03-application/application-singleton.md**
- Instanciación: ApplicationUIService creado en Application constructor
- Acceso: Application.ApplicationUIService
- Línea: 121 (this.ApplicationUIService = new ApplicationUIService(this))

**copilot/layers/03-application/event-bus.md**
- Eventos emitidos: show-modal, hide-modal, show-confirmation, hide-confirmation, show-loading, hide-loading, toggle-sidebar
- Patrón: ApplicationUIService emite, componentes escuchan

### 11.2 Componentes UI

**copilot/layers/04-components/ToastComponents.md**
- Escucha: ToastList.value cambios
- Renderiza: Toasts agregados por showToast()

**copilot/layers/04-components/modal-components.md**
- Escucha: 'show-modal', 'hide-modal' eventos
- Renderiza: Modal basado en modal.value

**copilot/layers/04-components/LoadingScreenComponent.md**
- Escucha: 'show-loading', 'hide-loading' eventos
- Renderiza: Full-screen overlay

**copilot/layers/04-components/SideBarComponent.md**
- Escucha: 'toggle-sidebar' evento
- Acción: Expande/colapsa sidebar

### 11.3 Models y Types

**src/models/application_ui_service.ts**
- Líneas 1-138: Implementación completa ApplicationUIService

**src/models/application_ui_context.ts**
- Interface: ApplicationUIContext definiendo propiedades reactivas

**src/models/Toast.ts**
- Class: Toast con auto-remove logic

**src/models/modal.ts**
- Interface: Modal con modalView, viewType, onCloseFunction

**src/models/confirmation_menu.ts**
- Interface: confirmationMenu con type, title, message, confirmationAction

**src/models/dropdown_menu.ts**
- Interface: DropdownMenu con positioning properties

### 11.4 Enums

**src/enums/ToastType.ts**
- Values: SUCCESS, ERROR, WARNING, INFO

**src/enums/conf_menu_type.ts**
- Values: INFO, WARNING, ERROR, SUCCESS

**src/enums/view_type.ts**
- Values: LISTVIEW, DETAILVIEW, DEFAULTVIEW

### 11.5 Types

**src/types/events.ts**
- Event definitions: show-modal, hide-modal, show-confirmation, hide-confirmation, show-loading, hide-loading, toggle-sidebar

### 11.6 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 9: ApplicationUIService como abstracción de UI operations
- Principio: Centralizar lógica UI en servicio compartido

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Application Layer con UIService
- Contexto: Toasts, modales, confirmaciones coordinados

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: UI Service Event Flow
- Flujo: Service emit event → Component listen → UI update
