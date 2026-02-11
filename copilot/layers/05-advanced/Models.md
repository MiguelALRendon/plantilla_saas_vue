# Models del Framework

## Propósito

Los models definen las estructuras de datos (interfaces y clases) que representan el estado de la aplicación. Incluyen configuración global, estado de vistas, modales, menús y notificaciones. La mayoría son interfaces TypeScript que se usan como tipos para las propiedades reactivas de `Application` y `ApplicationUIService`.

---

## 1. AppConfiguration - Configuración Global

### Ubicación
`src/models/AppConfiguration.ts`

### Código
```typescript
export interface AppConfiguration {
    appName: string;
    appVersion: string;
    apiBaseUrl: string;
    apiTimeout: number;
    apiRetryAttempts: number;
    environment: string;
    logLevel: string;
    authTokenKey: string;
    authRefreshTokenKey: string;
    sessionTimeout: number;
    itemsPerPage: number;
    maxFileSize: number;
    isDarkMode: boolean;
}
```

### Descripción

Interfaz que define la configuración global de la aplicación. Se almacena en `Application.ApplicationUIService.AppConfiguration` como un `Ref<AppConfiguration>` reactivo.

### Propiedades

| Propiedad | Tipo | Descripción | Valor Típico |
|-----------|------|-------------|--------------|
| **appName** | `string` | Nombre de la aplicación | `"SaaS Template"` |
| **appVersion** | `string` | Versión de la aplicación (semver) | `"1.0.0"` |
| **apiBaseUrl** | `string` | URL base para todas las llamadas API | `"https://api.example.com"` |
| **apiTimeout** | `number` | Timeout en ms para requests HTTP | `30000` (30s) |
| **apiRetryAttempts** | `number` | Intentos de reintento en errores de red | `3` |
| **environment** | `string` | Entorno de ejecución | `"development"`, `"production"` |
| **logLevel** | `string` | Nivel de logging | `"debug"`, `"info"`, `"warn"`, `"error"` |
| **authTokenKey** | `string` | Key para guardar token JWT en localStorage | `"auth_token"` |
| **authRefreshTokenKey** | `string` | Key para guardar refresh token | `"refresh_token"` |
| **sessionTimeout** | `number` | Timeout de sesión en ms | `3600000` (1 hora) |
| **itemsPerPage** | `number` | Items por página en tablas | `20` |
| **maxFileSize** | `number` | Tamaño máximo de archivo en bytes | `5242880` (5MB) |
| **isDarkMode** | `boolean` | Si el tema oscuro está activo | `false` |

### Ejemplo de Uso

```typescript
// Acceder a la configuración
const config = Application.ApplicationUIService.AppConfiguration.value;

console.log('API URL:', config.apiBaseUrl);
console.log('Environment:', config.environment);

// Cambiar dark mode
Application.ApplicationUIService.toggleDarkMode();
// Internamente cambia: AppConfiguration.value.isDarkMode = !isDarkMode

// Usar en llamadas API
axios.get(`${config.apiBaseUrl}/products`, {
    timeout: config.apiTimeout
});

// Validar tamaño de archivo
if (file.size > config.maxFileSize) {
    throw new Error(`Archivo muy grande. Máximo ${config.maxFileSize} bytes`);
}
```

### Inicialización

```typescript
// En application_ui_service.ts inicialización
const AppConfiguration = ref<AppConfiguration>({
    appName: "SaaS Template Vue",
    appVersion: "1.0.0",
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    apiTimeout: 30000,
    apiRetryAttempts: 3,
    environment: import.meta.env.MODE,
    logLevel: "debug",
    authTokenKey: "auth_token",
    authRefreshTokenKey: "refresh_token",
    sessionTimeout: 3600000,
    itemsPerPage: 20,
    maxFileSize: 5242880,
    isDarkMode: localStorage.getItem('darkMode') === 'true'
});
```

### Consideraciones

- ✅ **Reactivo**: Es un `Ref<>`, cambios actualizan la UI automáticamente
- ⚠️ **No persiste**: Los cambios se pierden al recargar (excepto isDarkMode que usa localStorage)
- ✅ **Variables de entorno**: Usa `import.meta.env.*` para configuración por entorno

---

## 2. View - Estado de Vista Actual

### Ubicación
`src/models/View.ts`

### Código
```typescript
import { BaseEntity } from "@/entities/base_entitiy";
import { ViewTypes } from "@/enums/view_type";
import { Component } from "vue";

type EntityCtor = typeof BaseEntity;

export interface View {
    entityClass: EntityCtor | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
    isValid: boolean;
    entityOid: string;
}
```

### Descripción

Interfaz que representa el estado de la vista actual. Se almacena en `Application.View` como un `Ref<View>` reactivo. Es el corazón del sistema de navegación y CRUD del framework.

### Propiedades

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| **entityClass** | `typeof BaseEntity \| null` | Clase de la entidad que se está visualizando/editando | `Products` |
| **entityObject** | `BaseEntity \| null` | Instancia de la entidad actual (para DETAILVIEW) | `new Products({ id: 123 })` |
| **component** | `Component \| null` | Componente Vue a renderizar | `DefaultDetailView` |
| **viewType** | `ViewTypes` | Tipo de vista actual | `ViewTypes.DETAILVIEW` |
| **isValid** | `boolean` | Si la vista/entidad actual es válida | `true` |
| **entityOid** | `string` | ID único de la entidad (para carga desde API) | `"123"`, `"new"` |

### Ciclo de Vida de View

#### 1. Lista de Entidades (LISTVIEW)
```typescript
Application.changeViewToListView(Products);

// Resultado:
Application.View.value = {
    entityClass: Products,
    entityObject: null,  // ← No hay entidad específica
    component: DefaultListView,
    viewType: ViewTypes.LISTVIEW,
    isValid: true,
    entityOid: ""
};
```

#### 2. Crear Nueva Entidad (DETAILVIEW - NEW)
```typescript
const newProduct = new Products();
Application.changeViewToDetailView(newProduct);

// Resultado:
Application.View.value = {
    entityClass: Products,
    entityObject: newProduct,  // ← Entidad nueva vacía
    component: DefaultDetailView,
    viewType: ViewTypes.DETAILVIEW,
    isValid: false,  // ← Campos requeridos vacíos
    entityOid: "new"  // ← Indica modo creación
};
```

#### 3. Editar Entidad Existente (DETAILVIEW - EDIT)
```typescript
const existingProduct = new Products({ 
    id: 123, 
    name: "Laptop", 
    price: 999 
});
Application.changeViewToDetailView(existingProduct);

// Resultado:
Application.View.value = {
    entityClass: Products,
    entityObject: existingProduct,  // ← Entidad cargada
    component: DefaultDetailView,
    viewType: ViewTypes.DETAILVIEW,
    isValid: true,  // ← Entidad válida
    entityOid: "123"  // ← ID para backend
};
```

#### 4. Lookup de Entidad (LOOKUPVIEW)
```typescript
// Al hacer click en ObjectInputComponent lookup button
Application.ApplicationUIService.openModal({
    component: DefaultLookupListView,
    onFunction: (selectedEntity) => { /* ... */ }
});

// Resultado (implícito):
Application.View.value.viewType = ViewTypes.LOOKUPVIEW;
```

### Uso en Componentes

#### DefaultDetailView lee entityClass y entityObject
```vue
<script lang="ts">
export default {
    data() {
        return {
            entity: Application.View.value.entityObject as BaseEntity,
            entityClass: Application.View.value.entityClass as typeof BaseEntity
        };
    }
}
</script>
```

#### ActionsComponent decide qué botones mostrar
```vue
<script setup lang="ts">
const ListButtons = computed(() => {
    const viewType = Application.View.value.viewType;
    
    if (viewType === ViewTypes.LISTVIEW) {
        return [NewButton, RefreshButton];
    } else if (viewType === ViewTypes.DETAILVIEW) {
        return [SaveButton, ValidateButton, SaveAndNewButton];
    }
    
    return [];
});
</script>
```

#### Router guarda entityOid en la URL
```typescript
// Al navegar a /products/123
router.push({
    name: 'entity-detail',
    params: {
        module: 'products',
        oid: '123'  // ← Se guarda en Application.View.value.entityOid
    }
});
```

### Validación (isValid)

```typescript
// ValidateButton actualiza isValid
async handleValidate() {
    const entity = Application.View.value.entityObject;
    
    if (entity) {
        const valid = await entity.validate();
        Application.View.value.isValid = valid;
        
        if (valid) {
            Application.ApplicationUIService.pushToast({
                type: ToastType.SUCCESS,
                title: 'Validación exitosa'
            });
        }
    }
}
```

### Consideraciones

- ✅ **Reactivo**: Cambios en `View` actualizan toda la UI automáticamente
- ⚠️ **entityOid "new"**: Convención para indicar modo creación (sin ID backend)
- ⚠️ **entityObject null**: En LISTVIEW no hay entidad específica cargada
- ✅ **Tipado fuerte**: `entityClass` es `typeof BaseEntity`, permite acceso a métodos estáticos

---

## 3. Modal - Estado de Modal

### Ubicación
`src/models/modal.ts`

### Código
```typescript
import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entitiy';

export interface Modal {
    modalView: typeof BaseEntity | null;
    modalOnCloseFunction: ((param: any) => void) | null;
    viewType: ViewTypes;
    customViewId?: string;
}
```

### Descripción

Interfaz para el estado del modal global del sistema. Se usa principalmente para lookups (selección de entidades relacionadas) pero puede extenderse para modales custom. Se almacena en `Application.ApplicationUIService.modal`.

### Propiedades

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| **modalView** | `typeof BaseEntity \| null` | Clase de entidad a mostrar en el modal | `Customer` (para lookup) |
| **modalOnCloseFunction** | `((param: any) => void) \| null` | Callback que recibe la entidad seleccionada | `(entity) => { this.modelValue = entity; }` |
| **viewType** | `ViewTypes` | Tipo de vista a renderizar en el modal | `ViewTypes.LOOKUPVIEW` |
| **customViewId** | `string?` | ID opcional para vistas custom no-CRUD | `"custom-report-view"` |

### Flujo Completo de Lookup Modal

#### 1. ObjectInputComponent abre modal
```typescript
// En ObjectInputComponent.vue
function openLookup() {
    Application.ApplicationUIService.openModal({
        component: DefaultLookupListView,  // Vista a renderizar
        onFunction: (selectedEntity: BaseEntity) => {
            // ← Este callback se guarda en modalOnCloseFunction
            modelValue.value = selectedEntity;
            emit('update:modelValue', selectedEntity);
        }
    });
}
```

#### 2. ApplicationUIService configura modal
```typescript
// En application_ui_service.ts
openModal({ component, onFunction }) {
    this.modal.value = {
        modalView: component,  // ← DefaultLookupListView
        modalOnCloseFunction: onFunction,  // ← Callback guardado
        viewType: ViewTypes.LOOKUPVIEW,
        customViewId: undefined
    };
    
    // Modal se hace visible automáticamente
}
```

#### 3. Usuario selecciona entidad en DefaultLookupListView
```vue
<!-- DefaultLookupListView.vue -->
<template>
    <LookupItem 
        v-for="item in data"
        @click="clickedItem(item)"
    />
</template>

<script>
function clickedItem(item: BaseEntity) {
    // ← Cierra modal y ejecuta callback
    Application.ApplicationUIService.closeModalOnFunction(item);
}
</script>
```

#### 4. ApplicationUIService cierra modal y ejecuta callback
```typescript
// En application_ui_service.ts
closeModalOnFunction(param: any) {
    const callback = this.modal.value.modalOnCloseFunction;
    
    if (callback) {
        callback(param);  // ← Ejecuta: modelValue.value = param;
    }
    
    // Resetea modal
    this.modal.value = {
        modalView: null,
        modalOnCloseFunction: null,
        viewType: ViewTypes.DEFAULTVIEW,
        customViewId: undefined
    };
}
```

#### 5. ObjectInputComponent actualiza con entidad seleccionada
```typescript
// Callback ejecutado:
(selectedEntity: BaseEntity) => {
    modelValue.value = selectedEntity;  // ← Campo actualizado
    emit('update:modelValue', selectedEntity);
}
```

### Ejemplo - Modal Custom (No Lookup)

```typescript
// Abrir modal con vista personalizada
Application.ApplicationUIService.openModal({
    component: CustomReportView,
    onFunction: (reportData) => {
        console.log('Report generated:', reportData);
        downloadReport(reportData);
    }
});

// Estado resultante:
{
    modalView: CustomReportView,
    modalOnCloseFunction: (reportData) => { /* ... */ },
    viewType: ViewTypes.CUSTOMVIEW,
    customViewId: "report-generator"
}
```

### Consideraciones

- ✅ **Callback flexible**: `modalOnCloseFunction` recibe cualquier tipo (any)
- ⚠️ **Solo un modal**: No hay stack de modales, solo uno a la vez
- ✅ **Cierre automático**: `closeModalOnFunction` ejecuta callback y cierra
- ⚠️ **customViewId no usado**: Propiedad definida pero sin implementación actual

---

## 4. DropdownMenu - Estado de Menú Desplegable

### Ubicación
`src/models/dropdown_menu.ts`

### Código
```typescript
import { Component } from "vue";

export interface DropdownMenu {
    showing: boolean;
    title: string;
    component: Component | null;
    width: string;
    position_x: string;
    position_y: string;
    activeElementWidth: string;
    activeElementHeight: string;
    canvasWidth: string;
    canvasHeight: string;
}
```

### Descripción

Interfaz para el estado del componente `DropdownMenu`. Controla posición, dimensiones y visibilidad del menú desplegable dinámico. Se almacena en `Application.ApplicationUIService.dropdownMenu`.

### Propiedades

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| **showing** | `boolean` | Si el dropdown está visible | `true` |
| **title** | `string` | Título mostrado en el header del dropdown | `"Opciones"` |
| **component** | `Component \| null` | Componente Vue a renderizar en el contenido | `UserMenuComponent` |
| **width** | `string` | Ancho del dropdown | `"300px"` |
| **position_x** | `string` | Posición horizontal (left) | `"150px"` |
| **position_y** | `string` | Posición vertical (top) | `"200px"` |
| **activeElementWidth** | `string` | Ancho del elemento que disparó el dropdown | `"120px"` |
| **activeElementHeight** | `string` | Alto del elemento que disparó el dropdown | `"40px"` |
| **canvasWidth** | `string` | Ancho del viewport | `"1920px"` |
| **canvasHeight** | `string` | Alto del viewport | `"1080px"` |

### Lógica de Posicionamiento

`DropdownMenu.vue` calcula automáticamente la mejor posición para evitar que el menú se salga de pantalla:

```typescript
// En DropdownMenu.vue
const calculatePosition = () => {
    const triggerRect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Intentar abrir hacia abajo-derecha (default)
    let x = triggerRect.left;
    let y = triggerRect.bottom;
    
    // Si se sale por la derecha, abrir hacia la izquierda
    if (x + menuWidth > viewportWidth) {
        x = triggerRect.right - menuWidth;
    }
    
    // Si se sale por abajo, abrir hacia arriba
    if (y + menuHeight > viewportHeight) {
        y = triggerRect.top - menuHeight;
    }
    
    Application.ApplicationUIService.dropdownMenu.value = {
        showing: true,
        title: "Opciones",
        component: MenuContent,
        width: `${menuWidth}px`,
        position_x: `${x}px`,
        position_y: `${y}px`,
        activeElementWidth: `${triggerRect.width}px`,
        activeElementHeight: `${triggerRect.height}px`,
        canvasWidth: `${viewportWidth}px`,
        canvasHeight: `${viewportHeight}px`
    };
};
```

### Ejemplo de Uso

```typescript
// Abrir dropdown al hacer click en botón
function openUserMenu(event: MouseEvent) {
    const buttonRect = event.target.getBoundingClientRect();
    
    Application.ApplicationUIService.openDropdownMenu({
        title: "Opciones de Usuario",
        component: UserMenuComponent,
        width: "250px",
        triggerElement: event.target,  // ← Para calcular posición
    });
}

// Estado resultante:
{
    showing: true,
    title: "Opciones de Usuario",
    component: UserMenuComponent,
    width: "250px",
    position_x: "400px",  // ← Calculado automáticamente
    position_y: "150px",  // ← Calculado automáticamente
    activeElementWidth: "120px",
    activeElementHeight: "36px",
    canvasWidth: "1920px",
    canvasHeight: "1080px"
}
```

### Cerrar Dropdown

```typescript
// Cerrar programáticamente
Application.ApplicationUIService.closeDropdownMenu();

// Cierre automático:
// - Click fuera del dropdown
// - Presionar tecla ESC
// - Click en una opción del menú (responsabilidad del componente)
```

### Consideraciones

- ✅ **Posicionamiento inteligente**: Calcula automáticamente para no salirse del viewport
- ✅ **Cierre automático**: ESC y click-outside cierran el dropdown
- ⚠️ **Solo un dropdown**: No hay stack, solo uno abierto a la vez
- ✅ **Dimensiones dinámicas**: Se adapta al tamaño del contenido y pantalla

---

## 5. confirmationMenu - Diálogo de Confirmación

### Ubicación
`src/models/confirmation_menu.ts`

### Código
```typescript
import { confMenuType } from "@/enums/conf_menu_type";

export interface confirmationMenu {
    type: confMenuType;
    title: string;
    message: string;
    confirmationAction?: () => void;
    acceptButtonText?: string;
    cancelButtonText?: string;
}
```

### Descripción

Interfaz para el estado del componente `ConfirmationDialogComponent`. Representa un diálogo modal con botones de confirmar/cancelar. Se almacena en `Application.ApplicationUIService.confirmationMenu`.

### Propiedades

| Propiedad | Tipo | Descripción | Default | Ejemplo |
|-----------|------|-------------|---------|---------|
| **type** | `confMenuType` | Tipo visual (color de header) | - | `confMenuType.WARNING` |
| **title** | `string` | Título del diálogo | - | `"¿Eliminar producto?"` |
| **message** | `string` | Mensaje descriptivo | - | `"Esta acción no se puede deshacer"` |
| **confirmationAction** | `() => void?` | Callback al confirmar | `undefined` | `() => { entity.delete(); }` |
| **acceptButtonText** | `string?` | Texto del botón confirmar | `"Aceptar"` | `"Eliminar"` |
| **cancelButtonText** | `string?` | Texto del botón cancelar | `"Cancelar"` | `"No, mantener"` |

### Flujo de Uso

#### 1. Abrir Diálogo
```typescript
Application.ApplicationUIService.openConfirmationMenu({
    type: confMenuType.WARNING,
    title: '¿Eliminar este producto?',
    message: 'Esta acción no se puede deshacer. El producto será eliminado permanentemente.',
    acceptButtonText: 'Sí, eliminar',
    cancelButtonText: 'No, cancelar',
    confirmationAction: () => {
        // ← Este callback se ejecuta al hacer click en "Sí, eliminar"
        product.delete();
        Application.ApplicationUIService.pushToast({
            type: ToastType.SUCCESS,
            title: 'Producto eliminado'
        });
    }
});
```

#### 2. ConfirmationDialogComponent Renderiza
```vue
<!-- ConfirmationDialogComponent.vue -->
<template>
    <div class="confirmation-dialog" v-if="menu">
        <div class="header" :style="{ backgroundColor: getHeaderColor }">
            <h3>{{ menu.title }}</h3>
        </div>
        <div class="body">
            <p>{{ menu.message }}</p>
        </div>
        <div class="footer">
            <button @click="handleCancel">
                {{ menu.cancelButtonText || 'Cancelar' }}
            </button>
            <button @click="handleConfirm">
                {{ menu.acceptButtonText || 'Aceptar' }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
const menu = computed(() => Application.ApplicationUIService.confirmationMenu.value);

function handleConfirm() {
    if (menu.value.confirmationAction) {
        menu.value.confirmationAction();  // ← Ejecuta callback
    }
    Application.ApplicationUIService.closeConfirmationMenu();
}

function handleCancel() {
    Application.ApplicationUIService.closeConfirmationMenu();
}
</script>
```

#### 3. Usuario Hace Click en "Sí, eliminar"
```typescript
// Se ejecuta confirmationAction():
product.delete();
Application.ApplicationUIService.pushToast({ /* ... */ });

// Se cierra el diálogo:
Application.ApplicationUIService.closeConfirmationMenu();
```

### Ejemplos por Tipo

#### WARNING - Confirmar acción destructiva
```typescript
Application.ApplicationUIService.openConfirmationMenu({
    type: confMenuType.WARNING,
    title: '¿Descartar cambios?',
    message: 'Tienes cambios sin guardar que se perderán',
    acceptButtonText: 'Descartar',
    cancelButtonText: 'Seguir editando',
    confirmationAction: () => {
        Application.changeViewToListView(entity.constructor);
    }
});
```

#### ERROR - Notificar error grave
```typescript
Application.ApplicationUIService.openConfirmationMenu({
    type: confMenuType.ERROR,
    title: 'Error de conexión',
    message: 'No se pudo conectar con el servidor. ¿Reintentar?',
    acceptButtonText: 'Reintentar',
    cancelButtonText: 'Cancelar',
    confirmationAction: async () => {
        await retryConnection();
    }
});
```

#### INFO - Información que requiere confirmación
```typescript
Application.ApplicationUIService.openConfirmationMenu({
    type: confMenuType.INFO,
    title: 'Actualización disponible',
    message: 'Hay una nueva versión. ¿Actualizar ahora?',
    acceptButtonText: 'Actualizar',
    cancelButtonText: 'Más tarde',
    confirmationAction: () => {
        window.location.reload();
    }
});
```

#### SUCCESS - Confirmar éxito
```typescript
Application.ApplicationUIService.openConfirmationMenu({
    type: confMenuType.SUCCESS,
    title: 'Importación completada',
    message: 'Se importaron 150 productos correctamente',
    acceptButtonText: 'Ver productos',
    cancelButtonText: 'Cerrar',
    confirmationAction: () => {
        Application.changeViewToListView(Products);
    }
});
```

### Consideraciones

- ✅ **Callback opcional**: Si `confirmationAction` es undefined, solo cierra el diálogo
- ✅ **Textos personalizables**: Puedes cambiar "Aceptar"/"Cancelar" por texto contextual
- ⚠️ **Modal bloqueante**: No se puede interactuar con el resto de la UI mientras está abierto
- ✅ **Cierre con ESC**: Presionar ESC cierra el diálogo (equivalente a cancelar)

---

## 6. Toast - Clase de Notificación

### Ubicación
`src/models/Toast.ts`

### Código
```typescript
import { ToastType } from "@/enums/ToastType";

export class Toast {
    id: string;
    message: string;
    type: ToastType;

    constructor(message: string, type: ToastType) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.message = message;
        this.type = type;
    }
}
```

### Descripción

Clase que representa una notificación toast individual. Los toasts se almacenan en `Application.ApplicationUIService.ToastList` como un `Ref<Toast[]>`. Es la ÚNICA estructura que es una clase (no interfaz) porque necesita generar IDs únicos automáticamente.

### Propiedades

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| **id** | `string` | Identificador único generado aleatoriamente | `"x7k3md9w2"` |
| **message** | `string` | Mensaje de la notificación | `"Producto guardado correctamente"` |
| **type** | `ToastType` | Tipo visual (SUCCESS/ERROR/INFO/WARNING) | `ToastType.SUCCESS` |

### Generación de ID

```typescript
this.id = Math.random().toString(36).substr(2, 9);
// Proceso:
// Math.random() → 0.8472615...
// .toString(36) → "0.k3md9w2x7"  (base 36: 0-9, a-z)
// .substr(2, 9) → "k3md9w2x7"     (quita "0.")
```

Este ID se usa como `:key` en el `v-for` de `ToastContainerComponent` y para identificar qué toast remover cuando se cierra.

### Ejemplo de Uso

```typescript
// Crear y agregar toast manualmente
const toast = new Toast(
    "Producto guardado correctamente",
    ToastType.SUCCESS
);

Application.ApplicationUIService.ToastList.value.push(toast);

// O usar el helper (recomendado):
Application.ApplicationUIService.pushToast({
    type: ToastType.SUCCESS,
    title: "Éxito",
    message: "Producto guardado correctamente",
    duration: 3000
});
```

### Ciclo de Vida de un Toast

#### 1. Creación
```typescript
// En ApplicationUIService.pushToast()
const newToast = new Toast(message, type);
// newToast = { id: "x7k3md9w2", message: "...", type: ToastType.SUCCESS }

this.ToastList.value.push(newToast);
```

#### 2. Renderizado
```vue
<!-- ToastContainerComponent.vue -->
<template>
    <div class="toast-container">
        <ToastItemComponent 
            v-for="toast in Application.ApplicationUIService.ToastList.value"
            :key="toast.id"  <!-- ← ID único como key -->
            :toast="toast"
        />
    </div>
</template>
```

#### 3. Auto-dismiss (3000ms default)
```vue
<!-- ToastItemComponent.vue -->
<script setup lang="ts">
onMounted(() => {
    setTimeout(() => {
        removeToast();  // ← Se auto-elimina después de 3s
    }, 3000);
});

function removeToast() {
    const index = ToastList.value.findIndex(t => t.id === props.toast.id);
    if (index !== -1) {
        ToastList.value.splice(index, 1);
    }
}
</script>
```

#### 4. Cierre manual (click en X)
```vue
<template>
    <div class="toast-item">
        <span>{{ toast.message }}</span>
        <button @click="removeToast">×</button>  <!-- ← Cierre manual -->
    </div>
</template>
```

### Consideraciones

- ✅ **ID automático**: No necesitas generar IDs manualmente, el constructor lo hace
- ⚠️ **Sin título**: La clase `Toast` solo tiene `message`, no `title` (el helper `pushToast` puede recibir `title` pero lo concatena con `message`)
- ✅ **Inmutable**: Una vez creado, un Toast no cambia (no hay setters)
- ⚠️ **Sin duración**: La clase no almacena `duration`, eso lo maneja `ToastItemComponent`

---

## 7. ApplicationUIContext - Contexto UI Completo

### Ubicación
`src/models/application_ui_context.ts`

### Código
```typescript
import type { Ref } from 'vue';
import type { Emitter } from 'mitt';
import type { AppConfiguration } from './AppConfiguration';
import type { Modal } from './modal';
import type { DropdownMenu } from './dropdown_menu';
import type { confirmationMenu } from './confirmation_menu';
import type { Events } from '@/types/events';
import type { Toast } from './Toast';

export interface ApplicationUIContext {
    AppConfiguration: Ref<AppConfiguration>;
    eventBus: Emitter<Events>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<confirmationMenu>;
    ToastList: Ref<Toast[]>;
}
```

### Descripción

Interfaz que agrupa TODOS los estados reactivos de la UI del framework. Se usa como tipo para `ApplicationUIService` que implementa esta interfaz. Es el "contrato" que define qué propiedades debe tener el servicio de UI.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| **AppConfiguration** | `Ref<AppConfiguration>` | Configuración global de la app |
| **eventBus** | `Emitter<Events>` | Event bus para comunicación entre componentes |
| **modal** | `Ref<Modal>` | Estado del modal global (lookups, etc.) |
| **dropdownMenu** | `Ref<DropdownMenu>` | Estado del dropdown menu |
| **confirmationMenu** | `Ref<confirmationMenu>` | Estado del diálogo de confirmación |
| **ToastList** | `Ref<Toast[]>` | Lista de toasts activos |

### Implementación en ApplicationUIService

```typescript
// src/models/application_ui_service.ts
import { ref } from 'vue';
import mitt from 'mitt';
import type { ApplicationUIContext } from './application_ui_context';
import type { Events } from '@/types/events';

export class ApplicationUIService implements ApplicationUIContext {
    AppConfiguration: Ref<AppConfiguration>;
    eventBus: Emitter<Events>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<confirmationMenu>;
    ToastList: Ref<Toast[]>;

    constructor() {
        this.AppConfiguration = ref<AppConfiguration>({
            appName: "SaaS Template",
            // ... más configuración
        });
        
        this.eventBus = mitt<Events>();
        
        this.modal = ref<Modal>({
            modalView: null,
            modalOnCloseFunction: null,
            viewType: ViewTypes.DEFAULTVIEW
        });
        
        this.dropdownMenu = ref<DropdownMenu>({
            showing: false,
            title: "",
            component: null,
            width: "300px",
            position_x: "0px",
            position_y: "0px",
            activeElementWidth: "0px",
            activeElementHeight: "0px",
            canvasWidth: "0px",
            canvasHeight: "0px"
        });
        
        this.confirmationMenu = ref<confirmationMenu>({
            type: confMenuType.INFO,
            title: "",
            message: "",
            confirmationAction: undefined,
            acceptButtonText: "Aceptar",
            cancelButtonText: "Cancelar"
        });
        
        this.ToastList = ref<Toast[]>([]);
    }
    
    // Métodos adicionales...
    pushToast(options: { type: ToastType; title: string; message: string; duration?: number }) { /* ... */ }
    openModal(options: { component: Component; onFunction: Function }) { /* ... */ }
    closeModalOnFunction(param: any) { /* ... */ }
    // etc...
}
```

### Ventajas de Usar una Interfaz Container

1. **Contrato claro**: Define exactamente qué propiedades debe tener ApplicationUIService
2. **Tipado fuerte**: TypeScript valida que todas las propiedades estén implementadas
3. **Documentación**: La interfaz sirve como documentación de la estructura del servicio
4. **Testing**: Facilita crear mocks que implementen ApplicationUIContext

### Ejemplo de Mock para Testing

```typescript
// En tests
const mockUIContext: ApplicationUIContext = {
    AppConfiguration: ref<AppConfiguration>({
        appName: "Test App",
        // ... configuración mínima
    }),
    eventBus: mitt<Events>(),
    modal: ref<Modal>({
        modalView: null,
        modalOnCloseFunction: null,
        viewType: ViewTypes.DEFAULTVIEW
    }),
    dropdownMenu: ref<DropdownMenu>({ /* ... */ }),
    confirmationMenu: ref<confirmationMenu>({ /* ... */ }),
    ToastList: ref<Toast[]>([])
};

// Inyectar en componente para testing
provide('ApplicationUIService', mockUIContext);
```

### Consideraciones

- ✅ **Solo tipado**: Esta interfaz NO tiene implementación, solo define la estructura
- ✅ **Reactivo**: Todos los estados son `Ref<>` excepto `eventBus` (que ya es reactivo por diseño)
- ✅ **Centralizado**: Agrupa todo el estado UI en un solo lugar conceptual
- ⚠️ **No hay setters**: Los métodos de ApplicationUIService (pushToast, openModal, etc.) no están en esta interfaz

---

## 8. EnumAdapter - Adaptador de Enums

### Ubicación
`src/models/enum_adapter.ts`

### Código
```typescript
export class EnumAdapter {
    private enumRef: any;

    constructor(enumRef: any) {
        this.enumRef = enumRef;
    }

    getKeyValuePairs(): { key: string; value: number }[] {
        return Object.keys(this.enumRef)
            .filter(key => isNaN(Number(key)))  // ← Filtrar keys numéricas
            .map(key => ({
                key: key,
                value: this.enumRef[key]
            }));
    }
}
```

### Descripción

Clase utilitaria para convertir enums de TypeScript en arrays de `{ key, value }` que pueden usarse en componentes de selección como `ListInputComponent`. Resuelve el problema de que los enums numéricos de TypeScript tienen "reverse mapping".

### Problema que Resuelve: Reverse Mapping de Enums

```typescript
enum ToastType {
    SUCCESS,  // = 0
    ERROR,    // = 1
    INFO,     // = 2
    WARNING   // = 3
}

// TypeScript genera esto en runtime:
ToastType = {
    SUCCESS: 0,
    ERROR: 1,
    INFO: 2,
    WARNING: 3,
    0: "SUCCESS",  // ← Reverse mapping
    1: "ERROR",
    2: "INFO",
    3: "WARNING"
}

// Object.keys(ToastType) retorna:
// ["0", "1", "2", "3", "SUCCESS", "ERROR", "INFO", "WARNING"]
// ← Duplicados! No queremos los numéricos
```

### Solución: Filtrar con isNaN

```typescript
const adapter = new EnumAdapter(ToastType);
const pairs = adapter.getKeyValuePairs();

// Resultado:
[
    { key: "SUCCESS", value: 0 },
    { key: "ERROR", value: 1 },
    { key: "INFO", value: 2 },
    { key: "WARNING", value: 3 }
]
// ✅ Solo las keys string, sin duplicados
```

### Uso en Entidades

```typescript
// products.ts
import { EnumAdapter } from '@/models/enum_adapter';
import { ToastType } from '@/enums/ToastType';

class Product extends BaseEntity {
    @PropertyName("Tipo de Toast")
    @PropertyType(new EnumAdapter(ToastType))  // ← Decorator con adapter
    toastType: ToastType = ToastType.INFO;
}
```

### Uso en ListInputComponent

```vue
<!-- ListInputComponent.vue -->
<template>
    <label>{{ getPropertyNameByKey(propertyKey) }}</label>
    <select v-model="modelValue">
        <option 
            v-for="item in enumOptions" 
            :key="item.value"
            :value="item.value">
            {{ item.key }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { EnumAdapter } from '@/models/enum_adapter';

const props = defineProps<{
    propertyEnumValues: EnumAdapter;  // ← Recibe el adapter
}>();

const enumOptions = computed(() => {
    return props.propertyEnumValues.getKeyValuePairs();
    // Retorna: [{ key: "SUCCESS", value: 0 }, ...]
});
</script>
```

### Renderizado Resultante

```html
<select v-model="modelValue">
    <option value="0">SUCCESS</option>
    <option value="1">ERROR</option>
    <option value="2">INFO</option>
    <option value="3">WARNING</option>
</select>
```

### Ejemplo Completo

```typescript
// 1. Definir enum
enum Priority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

// 2. Usar en entidad
class Task extends BaseEntity {
    @PropertyName("Prioridad")
    @PropertyType(new EnumAdapter(Priority))
    priority: Priority = Priority.MEDIUM;
}

// 3. En DefaultDetailView, se renderiza automáticamente:
<ListInputComponent
    :entity="task"
    :property-key="'priority'"
    :property-enum-values="new EnumAdapter(Priority)"
    v-model="task.priority"
/>

// 4. Usuario ve dropdown:
// ┌─────────────────┐
// │ Prioridad:      │
// │ [MEDIUM      ▼] │ ← Selector con opciones
// └─────────────────┘

// 5. Al abrir el dropdown:
// ┌─────────────────┐
// │ Prioridad:      │
// │ ┌─────────────┐ │
// │ │ LOW         │ │
// │ │ MEDIUM  ✓   │ │ ← Seleccionado
// │ │ HIGH        │ │
// │ │ URGENT      │ │
// │ └─────────────┘ │
// └─────────────────┘
```

### Consideraciones

- ✅ **Soluciona reverse mapping**: Filtra correctamente enums numéricos
- ⚠️ **Solo enums numéricos**: No funciona con string enums (tampoco los necesita, no tienen reverse mapping)
- ✅ **Tipado débil**: Usa `any` porque debe aceptar cualquier enum
- ⚠️ **Sin nombres legibles**: Muestra "SUCCESS" en lugar de "Éxito" (podría extenderse con un mapa de traducciones)

### String Enums (No Necesitan Adapter)

```typescript
// String enums NO tienen reverse mapping
enum ViewGroupRow {
    SINGLE = 'single',
    PAIR = 'pair',
    TRIPLE = 'triple'
}

// Object.keys(ViewGroupRow) retorna:
// ["SINGLE", "PAIR", "TRIPLE"]  ← Sin duplicados, no necesita adapter

ViewGroupRow = {
    SINGLE: "single",
    PAIR: "pair",
    TRIPLE: "triple"
    // ← No hay reverse mapping "single": "SINGLE"
}
```

---

## Resumen de Models

| Model | Tipo | Propósito | Usado en |
|-------|------|-----------|----------|
| **AppConfiguration** | Interface | Configuración global de la app | `ApplicationUIService.AppConfiguration` |
| **View** | Interface | Estado de la vista actual (CRUD) | `Application.View` |
| **Modal** | Interface | Estado del modal global (lookups) | `ApplicationUIService.modal` |
| **DropdownMenu** | Interface | Estado del menú desplegable | `ApplicationUIService.dropdownMenu` |
| **confirmationMenu** | Interface | Estado del diálogo de confirmación | `ApplicationUIService.confirmationMenu` |
| **Toast** | Class | Notificación toast individual | `ApplicationUIService.ToastList[]` |
| **ApplicationUIContext** | Interface | Agrupa todos los estados UI | Tipo de `ApplicationUIService` |
| **EnumAdapter** | Class | Convertir enums a key-value pairs | `@PropertyType(new EnumAdapter(Enum))` |

---

## Debugging

### Ver estado de View actual
```typescript
console.log('Current view:', Application.View.value);
// { entityClass: Products, entityObject: {...}, viewType: 2, ... }
```

### Ver configuración
```typescript
console.log('Config:', Application.ApplicationUIService.AppConfiguration.value);
```

### Ver toasts activos
```typescript
console.log('Toasts:', Application.ApplicationUIService.ToastList.value);
```

### Ver modal state
```typescript
console.log('Modal:', Application.ApplicationUIService.modal.value);
```

### Ver enum pairs
```typescript
const adapter = new EnumAdapter(ToastType);
console.log('Enum pairs:', adapter.getKeyValuePairs());
// [{ key: "SUCCESS", value: 0 }, ...]
```

### Ver dropdown state
```typescript
console.log('Dropdown:', Application.ApplicationUIService.dropdownMenu.value);
```
