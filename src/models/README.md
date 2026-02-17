# Models Directory

## 1. Propósito

El directorio `/src/models` contiene las clases core del **Application Layer** del framework, implementando singletons y modelos de servicio que gestionan estado global, servicios UI, navegación, eventos y configuración de la aplicación SaaS. Este es el tercer nivel (Layer 3) de la arquitectura de 5 capas del framework, proporcionando abstracciones de alto nivel que coordinan interacciones entre entidades, componentes y el router. Los modelos en este directorio son la **fuente de verdad centralizada** para estado de vista actual, módulos registrados, configuración de aplicación, y servicios de UI (modales, toasts, dropdowns).

**Ubicación:** `src/models/`

**Nivel arquitectónico:** Layer 3 - Application Layer

**Patrón de diseño:** Singleton Pattern + Service Layer + Event-Driven Architecture

## 2. Alcance

### Responsabilidades

1. **Gestión de Estado Global de Aplicación:**
   - Clase `Application` como singleton que gestiona ModuleList, View, EventBus y configuración
   - `View` class que encapsula estado de vista actual (entity, viewType, mode)
   - `AppConfiguration` con configuración global (baseURL, theme, locale, features)

2. **Servicios de UI (ApplicationUIService):**
   - Métodos para mostrar/ocultar modales (`showLoadingPopup`, `showSimpleModal`, `showConfirmationDialog`)
   - Métodos para toasts (`showSuccessToast`, `showErrorToast`, `showInfoToast`, `showWarningToast`)
   - Métodos para dropdowns (`toggleDropdown`)
   - Métodos para sidebar (`toggleSidebar`)
   - Coordinación de eventos de UI mediante EventBus

3. **Modelos de Datos de UI:**
   - `Modal` class con configuración de modales (title, acceptCallback, cancelCallback, type)
   - `Toast` class con configuración de toasts (message, type, duration)
   - `ConfirmationMenu` con opciones de diálogos de confirmación
   - `DropdownMenu` con configuración de menús desplegables

4. **Adaptadores y Utilidades:**
   - `EnumAdapter` para convertir enums TypeScript a arrays usables en componentes
   - `ApplicationUIContext` para contexto de renderizado de UI

5. **Event Bus:**
   - Implementación de mitt para comunicación decoupled entre componentes
   - Eventos tipados para modales, toasts, sidebar, dropdowns

### Límites

1. **NO contiene lógica de negocio** - Las entidades (BaseEntity subclasses) residen en `/src/entities`
2. **NO contiene componentes Vue** - Los componentes están en `/src/components`
3. **NO contiene decoradores** - Los decoradores están en `/src/decorations`
4. **NO contiene vistas** - Las vistas están en `/src/views`
5. **NO gestiona routing directamente** - El router está en `/src/router`, Application lo coordina
6. **NO implementa persistencia** - API calls se ejecutan desde BaseEntity methods
7. **NO contiene tipos TypeScript puros** - Los tipos están en `/src/types`
8. **NO contiene enums** - Los enums están en `/src/enums`

## 3. Definiciones Clave

**Application Singleton**: Clase estática que centraliza acceso a ModuleList (Map de entidades registradas), View actual, EventBus (mitt instance), Router (vue-router), y métodos de navegación (changeView, changeViewToDefaultView).

**ApplicationUIService**: Servicio singleton que expone métodos para controlar todos los elementos de UI reactivos del framework (modales, toasts, dropdowns, sidebar), emitiendo eventos mediante EventBus que son escuchados por componentes montados en App.vue.

**View**: Clase que encapsula estado de vista actual con properties: viewType (ViewType enum), entity (typeof BaseEntity o null), mode (ViewMode enum), y metadata adicional para contexto de renderizado.

**ModuleList**: Map<string, typeof BaseEntity> que actúa como registro de todas las entidades navegables del sistema, iterado por SideBarComponent para generar menú de navegación automático.

**EventBus**: Instancia de mitt (tiny event emitter) usada para comunicación decoupled entre Application Layer y Components Layer, emitiendo eventos tipados (show-modal, show-toast, toggle-sidebar, etc.).

**Modal**: Clase de configuración para modales con properties: title (string), message (string), acceptCallback (Function), cancelCallback (Function), type (ConfirmationType), y metadata para customización de botones.

**Toast**: Clase de configuración para toasts con properties: message (string), type (ToastType enum), duration (number en milisegundos), y autoClose (boolean).

**EnumAdapter**: Utilidad estática que convierte enums TypeScript en arrays de objetos { value, label } usables en SelectInputComponent y otros componentes de formulario.

## 4. Descripción Técnica

El directorio `/src/models` implementa la **capa de aplicación (Layer 3)** que coordina flujo de datos entre Layer 2 (Entities/BaseEntity) y Layer 4 (Components). La clase `Application` es un singleton con properties estáticas: `ModuleList` (Map poblado al boot con todas las entidades CRUD), `View` (objeto reactive con vista actual), `eventBus` (instancia mitt), y `router` (vue-router instance inyectado en main.ts).

`ApplicationUIService` expone métodos que emiten eventos mediante EventBus:
- `showLoadingPopup()` → emite 'toggle-loading-popup' con payload true
- `showSimpleModal(config)` → emite 'show-modal' con payload Modal instance
- `showSuccessToast(message)` → emite 'show-toast' con payload Toast instance de tipo SUCCESS

Los componentes de UI (ModalComponent, ToastContainerComponent, SideBarComponent, DropdownMenuComponent) se subscriben a estos eventos en mounted() lifecycle hook, actualizando su estado reactivo local cuando eventos son emitidos. Esta arquitectura permite que cualquier parte del código (entities, components, views) invoque `Application.ApplicationUIService.showErrorToast('Error message')` sin acoplamiento directo a componentes, promoviendo separation of concerns.

La clase `View` encapsula estado de navegación con métodos estáticos:
- `View.create(entity, viewType, mode)` → crea configuración de vista
- `View.isEqual(view1, view2)` → compara vistas para detectar cambios
- `View.getEntityName(view)` → extrae nombre de entidad desde metadata

`EnumAdapter.toArray(enum)` convierte enums TypeScript `{ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE'}` en `[{value: 'ACTIVE', label: 'Active'}, {value: 'INACTIVE', label: 'Inactive'}]` mediante reflection, proporcionando formato compatible con v-for en componentes de formulario.

Los modelos `Modal`, `Toast`, `ConfirmationMenu`, `DropdownMenu` son **Data Transfer Objects (DTOs)** que encapsulan configuración pasada mediante eventos. Ejemplo: `new Toast('Operation successful', ToastType.SUCCESS, 3000)` contiene toda la data que ToastComponent necesita para renderizar.

## 5. Flujo de Funcionamiento

**Inicialización en main.ts:**
1. `main.ts` importa `Application` singleton
2. Registra entidades: `Application.ModuleList.set('products', ProductEntity)`
3. Inyecta router: `Application.router = router`
4. EventBus ya inicializado por default: `Application.eventBus = mitt()`
5. App.vue monta componentes que se subscriben a EventBus
6. Framework ready para operar

**Navegación entre Módulos:**
1. Usuario click en SideBarItemComponent de 'Products'
2. SideBarItemComponent ejecuta `Application.changeView(ProductEntity, ViewType.LIST)`
3. Application.changeView():
   - Valida entity está en ModuleList
   - Crea View instance: `View.create(ProductEntity, ViewType.LIST, ViewMode.READ)`
   - Actualiza `Application.View = view`
   - Ejecuta `Application.router.push({ name: 'DefaultView' })`
4. Router renderiza DefaultListView
5. DefaultListView lee `Application.View.value` para saber qué entity renderizar
6. ComponentResolverService genera DataTableComponent con Products

**Mostrar Toast de Éxito:**
1. Código ejecuta `Application.ApplicationUIService.showSuccessToast('Product created successfully')`
2. ApplicationUIService.showSuccessToast():
   - Crea `new Toast('Product created successfully', ToastType.SUCCESS, 3000)`
   - Emite `Application.eventBus.emit('show-toast', toast)`
3. ToastContainerComponent (montado en App.vue) escucha 'show-toast'
4. Event listener recibe payload toast
5. ToastContainerComponent.toasts.push(toast)
6. ToastComponent renderiza con message, icono verde, border verde
7. Después de 3000ms, toast auto-desaparece

**Mostrar Modal de Confirmación:**
1. Usuario click en botón delete de ProductEntity
2. DefaultDetailView ejecuta:
   ```ts
   Application.ApplicationUIService.showConfirmationDialog({
       title: 'Delete Product',
       message: 'Are you sure?',
       type: ConfirmationType.WARNING,
       acceptCallback: async () => { await entity.delete(); }
   });
   ```
3. ApplicationUIService.showConfirmationDialog():
   - Crea `new Modal(config)`
   - Emite `Application.eventBus.emit('show-confirmation-dialog', modal)`
4. ConfirmationDialogComponent escucha evento
5. Component actualiza isVisible = true, config = modal
6. Renderiza modal con botones Accept/Cancel
7. Si Accept: ejecuta modal.acceptCallback(), emite 'close'
8. Si Cancel: ejecuta modal.cancelCallback(), emite 'close'

**Convertir Enum para Select:**
1. TextInputComponent necesita renderizar StringType enum en select
2. Component ejecuta: `EnumAdapter.toArray(StringType)`
3. EnumAdapter:
   - Itera `Object.keys(StringType)` → ['TEXT', 'EMAIL', 'PASSWORD', 'TEXTAREA']
   - Transforma a `[{value: 'TEXT', label: 'Text'}, ...]`
   - Retorna array
4. Component usa array en v-for con v-model

**Toggle Sidebar:**
1. Usuario click en hamburger button en TopBarComponent
2. TopBarComponent ejecuta `Application.ApplicationUIService.toggleSidebar()`
3. ApplicationUIService.toggleSidebar():
   - Emite `Application.eventBus.emit('toggle-sidebar')` sin payload
4. SideBarComponent escucha 'toggle-sidebar'
5. Event listener ejecuta `this.toggled = !this.toggled`
6. CSS transiciona max-width de 68px a 250px
7. Sidebar se expande/colapsa con animación

## 6. Reglas Obligatorias

### 6.1 Application como Singleton Inmutable

NUNCA instanciar `Application` con `new Application()`. SIEMPRE usar clase estática:

```typescript
// ✅ CORRECTO
Application.changeView(ProductEntity, ViewType.LIST);
Application.ApplicationUIService.showSuccessToast('Success');

// ❌ INCORRECTO - Violación de singleton
const app = new Application();
app.changeView(...);
```

### 6.2 Registro de Módulos en Main.ts

TODOS los módulos navegables DEBEN registrarse en `Application.ModuleList` en `main.ts`:

```typescript
// ✅ CORRECTO - main.ts
import ProductEntity from '@/entities/ProductEntity';
Application.ModuleList.set('products', ProductEntity);

// ❌ INCORRECTO - Registro en componente
// SideBarComponent.vue
mounted() {
    Application.ModuleList.set('products', ProductEntity); // NO
}
```

### 6.3 Uso de EventBus para UI

SIEMPRE usar `ApplicationUIService` para controlar UI, NO emitir eventos directamente:

```typescript
// ✅ CORRECTO
Application.ApplicationUIService.showErrorToast('Error occurred');

// ❌ INCORRECTO - Emisión directa
Application.eventBus.emit('show-toast', { message: 'Error', type: 'ERROR' });
```

### 6.4 View como Fuente de Verdad

SIEMPRE leer vista actual desde `Application.View.value`, NO mantener estado local:

```vue
<!-- ✅ CORRECTO -->
<script setup>
const currentView = computed(() => Application.View.value);
</script>

<!-- ❌ INCORRECTO - Estado duplicado -->
<script setup>
const currentEntity = ref(ProductEntity); // NO
</script>
```

### 6.5 EnumAdapter para Conversión

SIEMPRE usar `EnumAdapter.toArray()` para convertir enums, NO mappeo manual:

```typescript
// ✅ CORRECTO
const options = EnumAdapter.toArray(UserStatus);

// ❌ INCORRECTO - Mappeo manual
const options = Object.keys(UserStatus).map(key => ({
    value: key,
    label: key.toLowerCase()
}));
```

### 6.6 Limpieza de Event Listeners

Componentes que subscriben a EventBus DEBEN limpiar subscriptions en beforeUnmount():

```typescript
// ✅ CORRECTO
export default {
    mounted() {
        Application.eventBus.on('show-modal', this.handleModal);
    },
    beforeUnmount() {
        Application.eventBus.off('show-modal', this.handleModal);
    }
}

// ❌ INCORRECTO - Sin limpieza, causa memory leaks
mounted() {
    Application.eventBus.on('show-modal', this.handleModal);
}
```

## 7. Prohibiciones

1. NO instanciar Application con `new` - Es clase estática singleton
2. NO modificar ModuleList desde componentes - Solo en main.ts durante bootstrap
3. NO emitir eventos de EventBus directamente - Usar ApplicationUIService methods
4. NO duplicar estado de View en componentes - Application.View es fuente de verdad
5. NO crear múltiples EventBus instances - Application.eventBus es singleton compartido
6. NO modificar Application.View directamente - Usar Application.changeView() method
7. NO pasar Application instance via props - Acceder estáticamente desde cualquier lugar
8. NO crear custom event names - Usar nombres contractuales (show-modal, show-toast, etc.)
9. NO usar enums sin EnumAdapter en components - Convertir primero a array compatible
10. NO olvidar limpiar EventBus subscriptions - Causa memory leaks en re-montajes

## 8. Dependencias

### Dependencias Externas

**mitt (Event Emitter):**
- `Application.eventBus = mitt()` - Instancia de event emitter
- Eventos tipados para comunicación decoupled
- Patrón publish-subscribe sin acoplamiento

**vue-router:**
- `Application.router` - Instancia de VueRouter inyectada en main.ts
- `router.push({ name, params })` - Navegación programática
- Sincronización de estado View con rutas

### Dependencias Internas

**BaseEntity:**
- `ModuleList` almacena subclasses de BaseEntity
- `View.entity` referencia a typeof BaseEntity
- Decoradores de entidades (@ModuleName, @ModuleIcon) consultados

**Enums:**
- `ViewType` - LIST, DETAIL, CUSTOM para tipo de vista
- `ViewMode` - CREATE, UPDATE, READ para modo de vista
- `ToastType` - SUCCESS, ERROR, INFO, WARNING para tipos de toast
- `ConfirmationType` - INFO, SUCCESS, WARNING, ERROR para tipos de confirmación

**Components (Consumers):**
- ModalComponent, LoadingPopupComponent, ConfirmationDialogComponent
- ToastContainerComponent, ToastComponent
- SideBarComponent, SideBarItemComponent
- DropdownMenuComponent
- DefaultListView, DefaultDetailView

### Dependencias de Vue

- `reactive()`, `ref()`, `computed()` para reactividad de View
- `inject()` para proveer Application context a componentes
- Component lifecycle hooks (mounted, beforeUnmount) en consumers

## 9. Relaciones

**Componentes que Consumen Models:**

Application → DefaultListView (lee View.value para entity actual)
Application → DefaultDetailView (lee View.value para entity y mode)
Application → SideBarComponent (itera ModuleList.values())
Application → ComponentResolverService (usa View para resolver componentes)

ApplicationUIService → ModalComponent (emite eventos, component escucha)
ApplicationUIService → ToastContainerComponent (emite eventos, component escucha)
ApplicationUIService → SideBarComponent (emite toggle-sidebar, component escucha)
ApplicationUIService → DropdownMenuComponent (emite toggle-dropdown, component escucha)

**Flujo de Eventos:**

ApplicationUIService.showModal() → EventBus.emit('show-modal') → ModalComponent.listener → actualiza isVisible

**Documentos Relacionados (Copilot):**

- `copilot/03-application/application-singleton.md` - Especificación completa de Application
- `copilot/03-application/ui-services.md` - Especificación de ApplicationUIService
- `copilot/03-application/event-bus.md` - Sistema de eventos mitt
- `copilot/05-advanced/Types.md` - View, ViewType, ViewMode, Toast, Modal types
- `copilot/02-base-entity/base-entity.md` - BaseEntity y ModuleList

## 10. Notas de Implementación

### Estructura de Archivos

```
src/models/
├── application.ts                 # Application singleton, ModuleList, View, EventBus
├── application_ui_service.ts      # ApplicationUIService con métodos de UI
├── application_ui_context.ts      # Contexto de renderizado de UI
├── View.ts                        # Clase View, ViewMode, ViewType
├── Modal.ts                       # Clase Modal para configuración de modales
├── Toast.ts                       # Clase Toast para configuración de toasts
├── confirmation_menu.ts           # ConfirmationMenu para diálogos
├── dropdown_menu.ts               # DropdownMenu para menús desplegables
├── enum_adapter.ts                # EnumAdapter.toArray() utility
└── AppConfiguration.ts            # Configuración global de aplicación
```

### Registro de Módulos (main.ts)

```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { Application } from '@/models/application';

// Importar entidades
import ProductEntity from '@/entities/ProductEntity';
import UserEntity from '@/entities/UserEntity';
import OrderEntity from '@/entities/OrderEntity';

// Registrar módulos navegables
Application.ModuleList.set('products', ProductEntity);
Application.ModuleList.set('users', UserEntity);
Application.ModuleList.set('orders', OrderEntity);

// Inyectar router
Application.router = router;

// Crear y montar app
const app = createApp(App);
app.use(router);
app.mount('#app');
```

### Uso de ApplicationUIService

```typescript
// En cualquier componente, entity method, o servicio
import { Application } from '@/models/application';

// Mostrar toast de éxito
Application.ApplicationUIService.showSuccessToast('Operation completed successfully');

// Mostrar toast de error
Application.ApplicationUIService.showErrorToast('An error occurred');

// Mostrar loading popup
Application.ApplicationUIService.showLoadingPopup();
// ... operación async ...
Application.ApplicationUIService.hideLoadingPopup();

// Mostrar modal simple
Application.ApplicationUIService.showSimpleModal({
    title: 'Information',
    message: 'This is an informational message.',
    acceptCallback: () => console.log('OK clicked')
});

// Mostrar confirmation dialog
Application.ApplicationUIService.showConfirmationDialog({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    type: ConfirmationType.WARNING,
    acceptCallback: async () => {
        await entity.delete();
        Application.ApplicationUIService.showSuccessToast('Item deleted');
    },
    cancelCallback: () => {
        Application.ApplicationUIService.showInfoToast('Deletion cancelled');
    }
});
```

### Navegación Programática

```typescript
import { Application } from '@/models/application';
import { ViewType, ViewMode } from '@/enums/ViewType';
import ProductEntity from '@/entities/ProductEntity';

// Navegar a lista de productos
Application.changeView(ProductEntity, ViewType.LIST);

// Navegar a detalle de producto (modo lectura)
Application.changeView(ProductEntity, ViewType.DETAIL, ViewMode.READ, productInstance);

// Navegar a creación de producto
Application.changeView(ProductEntity, ViewType.DETAIL, ViewMode.CREATE);

// Navegar a edición de producto
Application.changeView(ProductEntity, ViewType.DETAIL, ViewMode.UPDATE, productInstance);

// Navegar a vista por defecto del módulo actual
Application.changeViewToDefaultView();
```

### Subscription a EventBus

```typescript
// Component que consume eventos de UI
export default {
    data() {
        return {
            isModalVisible: false,
            modalConfig: null
        };
    },
    mounted() {
        Application.eventBus.on('show-modal', this.handleShowModal);
    },
    beforeUnmount() {
        Application.eventBus.off('show-modal', this.handleShowModal);
    },
    methods: {
        handleShowModal(config: Modal) {
            this.modalConfig = config;
            this.isModalVisible = true;
        }
    }
};
```

### Uso de EnumAdapter

```typescript
import { EnumAdapter } from '@/models/enum_adapter';
import { UserStatus } from '@/enums/UserStatus';

// En script setup de componente
const statusOptions = EnumAdapter.toArray(UserStatus);
// Resultado: [
//   { value: 'ACTIVE', label: 'Active' },
//   { value: 'INACTIVE', label: 'Inactive' },
//   { value: 'PENDING', label: 'Pending' }
// ]
```

## 11. Referencias Cruzadas

**Contratos:**
- [00-CONTRACT.md](../../copilot/00-CONTRACT.md) - §4 Application Layer Requirements
- [01-FRAMEWORK-OVERVIEW.md](../../copilot/01-FRAMEWORK-OVERVIEW.md) - Arquitectura de 5 capas
- [02-FLOW-ARCHITECTURE.md](../../copilot/02-FLOW-ARCHITECTURE.md) - Flujo de navegación y eventos

**Capa de Aplicación (Copilot):**
- [application-singleton.md](../../copilot/layers/03-application/application-singleton.md) - Especificación completa de Application
- [ui-services.md](../../copilot/layers/03-application/ui-services.md) - ApplicationUIService en detalle
- [event-bus.md](../../copilot/layers/03-application/event-bus.md) - Sistema de eventos mitt

**Componentes Relacionados:**
- [modal-components.md](../../copilot/layers/04-components/modal-components.md) - ModalComponent, LoadingPopupComponent, ConfirmationDialogComponent
- [ToastComponents.md](../../copilot/layers/04-components/ToastComponents.md) - ToastContainerComponent, ToastComponent
- [SideBarComponent.md](../../copilot/layers/04-components/SideBarComponent.md) - Sidebar de navegación
- [views-overview.md](../../copilot/layers/04-components/views-overview.md) - DefaultListView, DefaultDetailView

**Tipos y Enums:**
- [Types.md](../../copilot/layers/05-advanced/Types.md) - View, Modal, Toast, ViewType, ViewMode, ToastType

**Entidades:**
- [base-entity.md](../../copilot/layers/02-base-entity/base-entity.md) - BaseEntity y ModuleList

**Ubicación del código:** `src/models/`  
**Archivos:** 10 archivos TypeScript  
**Nivel de importancia:** CRÍTICO - Core del framework
