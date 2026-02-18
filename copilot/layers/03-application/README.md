# Application - Índice Semántico

## Proposito

Proveer índice de navegación para documentación del singleton Application y su integración con router/UI.

## Ultima Actualizacion

16 de Febrero, 2026

**Propósito:** Índice completo del singleton Application  
**Última Actualización:** 13 de Febrero, 2026  
**ID Base:** APP

---

## Propósito

Proveer índice de navegación para documentación del singleton Application y su integración con router/UI.

## Elementos

- [application-singleton.md](application-singleton.md)
- [router-integration.md](router-integration.md)
- [ui-services.md](ui-services.md)

## Enlaces Estructurados

- [Índice de Capas](../README.md)
- [BaseEntity](../02-base-entity/README.md)
- [Componentes](../04-components/README.md)

## Última Actualización

16 de Febrero, 2026

### Actualización Fase 1 (18 de Febrero, 2026)

- Integración de `ApplicationDataService` como servicio auxiliar de capa 4
- Transformación automática por metadatos habilitada desde BaseEntity usando ApplicationDataService
- Endurecimiento del interceptor HTTP con manejo de estados y retry con backoff

---

## Archivos de Especificación (4)

| ID | Archivo | Tipo | Líneas | Descripción |
|---|---|---|---|---|
| APP::singleton | [application-singleton.md](application-singleton.md) | Especificación | ~250 | Patrón Singleton y estructura core |
| APP::router | [router-integration.md](router-integration.md) | Especificación | ~180 | Integración con Vue Router |
| APP::eventbus | [event-bus.md](event-bus.md) | Especificación | ~140 | Sistema de comunicación global |
| APP::ui-services | [ui-services.md](ui-services.md) | Especificación | ~200 | Servicios de UI (toasts, modales, loading) |

---

## Propiedades Principales

### Estado Global

| ID | Propiedad | Tipo | Descripción |
|---|---|---|---|
| APP::view | `View` | Ref\<ViewType\> | Vista actual (entityClass, entityObject, component, viewType) |
| APP::module-list | `ModuleList` | Ref\<Array\<typeof BaseEntity\>\> | Lista de módulos registrados |
| APP::router | `router` | Router | Instancia de Vue Router |
| APP::axios | `axiosInstance` | AxiosInstance | Cliente HTTP configurado |

### Configuración

| ID | Propiedad | Tipo | Descripción |
|---|---|---|---|
| APP::config | `AppConfiguration` | Object | Configuración global de la aplicación |

### UI Services

| ID | Propiedad | Tipo | Descripción |
|---|---|---|---|
| APP::modal | `modal` | Ref\<Modal\> | Estado del modal global |
| APP::dropdown | `dropdownMenu` | Ref\<DropdownMenu\> | Estado del dropdown menu |
| APP::confirmation | `confirmationMenu` | Ref\<ConfirmationMenu\> | Estado del confirmation menu |
| APP::toast-list | `ToastList` | Ref\<Array\<Toast\>\> | Lista de toasts activos |
| APP::list-buttons | `ListButtons` | Ref\<Array\<Button\>\> | Botones de acción contextuales |

### Servicios

| ID | Propiedad | Tipo | Descripción |
|---|---|---|---|
| APP::ui-service | `ApplicationUIService` | UIService | Servicio de UI centralizado |
| APP::eventbus | `eventBus` | EventBus | Sistema de eventos global (mitt) |

---

## Métodos por Categoría

### Navegación entre Vistas

| ID | Método | Propósito |
|---|---|---|
| APP::change-view | `changeView(entityClass, component, viewType, entity)` | Cambio genérico de vista |
| APP::change-to-list | `changeViewToListView(entityClass)` | Navegar a vista de lista |
| APP::change-to-detail | `changeViewToDetailView(entity)` | Navegar a vista de detalle |
| APP::change-to-default | `changeViewToDefaultView(entityClass)` | Navegar a vista por defecto |

**Referencia:** [application-singleton.md](application-singleton.md), [router-integration.md](router-integration.md)

**Flujo:**
```
Usuario selecciona módulo
  ↓
changeViewToDefaultView(entityClass)
  ↓
Verificar dirty state
  ↓
setViewChanges(entityClass, component, viewType, entity)
  ↓
router.push({ name: 'ModuleList', params: { module } })
  ↓
ComponentContainerComponent renderiza componente
```

### Integración con Router

| ID | Método | Propósito |
|---|---|---|
| APP::init-router | `initializeRouter(router)` | Vincular router con Application |
| APP::navigate | `navigateToModule(moduleName)` | Navegar a módulo por nombre |

**Referencia:** [router-integration.md](router-integration.md)

### Servicios de UI

| ID | Método | Propósito |
|---|---|---|
| APP::show-toast | `ApplicationUIService.showToast(message, type)` | Mostrar notificación toast |
| APP::show-modal | `ApplicationUIService.showModal(...)` | Abrir modal |
| APP::show-loading| `ApplicationUIService.showLoadingMenu()` | Mostrar loading |
| APP::hide-loading | `ApplicationUIService.hideLoadingMenu()` | Ocultar loading |
| APP::open-confirmation | `ApplicationUIService.openConfirmationMenu(...)` | Abrir menú confirmación |
| APP::close-confirmation | `ApplicationUIService.closeConfirmationMenu()` | Cerrar menú confirmación |

**Referencia:** [ui-services.md](ui-services.md)

### Sistema de Eventos

| ID | Método | Propósito |
|---|---|---|
| APP::emit | `eventBus.emit(event, payload)` | Emitir evento global |
| APP::on | `eventBus.on(event, handler)` | Escuchar evento |
| APP::off | `eventBus.off(event, handler)` | Remover listener |

**Referencia:** [event-bus.md](event-bus.md)

**Eventos Predefinidos:**
- `validate-inputs` - Disparar validación global
- `show-modal` / `hide-modal` - Control modal
- `show-confirmation` / `hide-confirmation` - Control confirmation
- `show-loading` / `hide-loading` - Control loading
- `toggle-sidebar` - Toggle sidebar

---

## Patrón Singleton

### Características

1. **Instancia Única:** Solo una instancia de Application existe
2. **Estado Global:** Comparte estado entre todos los componentes
3. **Acceso Global:** Importable desde cualquier parte

**Código:**
```typescript
// Instanciación única
const Application = new ApplicationClass();

// Uso en componentes
import Application from '@/models/application';
Application.changeViewToListView(Product);
```

**Referencia:** [application-singleton.md](application-singleton.md)

### Responsabilidades

- **Gestión de Estado:** View, ModuleList, modal, toasts
- **Navegación:** changeView methods + router integration
- **Comunicación:** EventBus global
- **UI Services:** Toasts, modales, loading, confirmaciones
- **HTTP Client:** axiosInstance configurado
- **Registro de Módulos:** ModuleList

---

## Flujos de Application

### Flujo de Inicialización

```
main.js ejecuta
  ↓
Application se inicializa (Singleton)
  ├─→ AppConfiguration cargada
  ├─→ View ref creado
  ├─→ ModuleList ref creado
  ├─→ EventBus (mitt) creado
  ├─→ Axios instance configurado
  └─→ ApplicationUIService instanciado
  ↓
Entidades se registran
  ├─→ Application.ModuleList.value.push(Product, Customer, ...)
  ↓
Router se vincula
  ├─→ initializeRouterWithApplication(Application)
  ├─→ Application.initializeRouter(router)
  ↓
Vue App se monta
  ├─→ App.vue renderizado
  └─→ SideBar muestra módulos registrados
```

**Referencia:** [application-singleton.md](application-singleton.md), [router-integration.md](router-integration.md)

### Flujo de Cambio de Vista

```
Usuario click sidebar item
  ↓
Application.changeViewToDefaultView(entityClass)
  ├─→ Verificar getDirtyState()
  │   ├─→ Si hay cambios: Mostrar confirmación
  │   │   └─→ Usuario cancela: ABORT
  │   └─→ Si no hay cambios o usuario acepta: Continuar
  ├─→ setViewChanges()
  │   ├─→ View.value.entityClass = entityClass
  │   ├─→ View.value.component = entityClass.getModuleDefaultComponent()
  │   ├─→ View.value.viewType = ViewTypes.DEFAULTVIEW
  │   └─→ View.value.entityObject = null
  └─→ router.push({ name: 'ModuleList', params: { module } })
```

**Referencia:** [router-integration.md](router-integration.md)

---

## Búsqueda por Necesidad

### Para Navegar

1. `changeViewToListView()` - [application-singleton.md](application-singleton.md)
2. `changeViewToDetailView()` - [application-singleton.md](application-singleton.md)
3. `initializeRouter()` - [router-integration.md](router-integration.md)

### Para Mostrar UI

1. `showToast()` - [ui-services.md](ui-services.md)
2. `showLoadingMenu()` - [ui-services.md](ui-services.md)
3. `openConfirmationMenu()` - [ui-services.md](ui-services.md)

### Para Comunicar Componentes

1. `eventBus.emit()` - [event-bus.md](event-bus.md)
2. `eventBus.on()` - [event-bus.md](event-bus.md)
3. `eventBus.off()` - [event-bus.md](event-bus.md)

### Para Integrar HTTP

1. `axiosInstance` - [application-singleton.md](application-singleton.md)
2. Interceptors - [application-singleton.md](application-singleton.md)

---

## Relación con BaseEntity

Application proporciona servicios a BaseEntity:

| Servicio Application | Uso en BaseEntity |
|---|---|
| `axiosInstance` | CRUD operations (save, update, delete, get) |
| `ApplicationUIService.showToast()` | Notificaciones de éxito/error |
| `ApplicationUIService.showLoadingMenu()` | Loading durante operaciones |
| `ApplicationUIService.openConfirmationMenu()` | Confirmaciones y errores |
| `eventBus.emit('validate-inputs')` | Validación global |

**Referencia:** [ui-services.md](ui-services.md), [event-bus.md](event-bus.md)

---

## Relación con Componentes UI

Componentes Vue consumen Application:

| Componente | Uso de Application |
|---|---|
| ComponentContainerComponent | `Application.View.value.component` |
| SideBarComponent | `Application.ModuleList.value` |
| DetailViewTableComponent | `Application.View.value.entityClass` |
| Form Inputs | `Application.eventBus.on('validate-inputs')` |
| SaveButtonComponent | `Application.axiosInstance` |

---

## Relación con Contratos

### Contrato Principal (CORE)

- **CORE-3.1.A2:** Application mantiene flujo unidireccional
- **CORE-4.4:** Application es capa 4 de arquitectura
- **CORE-6.2:** Cambios a Application requieren autorización

### Framework Overview (FWK)

- **FWK-4.7:** Especificación completa de Application
- **FWK-5.2:** Navegación automática

### Flow Architecture (FLOW)

- **FLOW-5.2:** Flujo de navegación detallado
- **FLOW-5.9:** Flujo de interceptores HTTP
- **FLOW-5.10:** Flujo de EventBus

---

## Referencias Cruzadas

### Documentación Relacionada

- **BaseEntity:** [../02-base-entity/README.md](../02-base-entity/README.md) - Consume servicios de Application
- **Componentes:** [../04-components/README.md](../04-components/) - Consumen Application.View
- **Tutorial CRUD:** [../../tutorials/01-basic-crud.md](../../tutorials/01-basic-crud.md) - Registro de módulos

### Código Fuente

- **Implementación:** `/src/models/application.ts`
- **Tipos:** `/src/types/`
- **Router:** `/src/router/index.ts`

---

**Última Actualización:** 13 de Febrero, 2026  
**Total Especificaciones:** 4  
**Mantenimiento:** Actualizar al modificar Application
