# 🎨 UI Services - ApplicationUIService

**Referencias:**
- `application-singleton.md` - Application Singleton
- `event-bus.md` - Sistema de eventos
- `../../02-FLOW-ARCHITECTURE.md` - Arquitectura de flujos

---

## 📍 Ubicación en el Código

**Archivo:** `src/models/application_ui_service.ts` (líneas 1-136)  
**Clase:** `export class ApplicationUIService`

---

## 🎯 Propósito

`ApplicationUIService` es la **capa de servicios de UI** que proporciona métodos para:

1. **Toasts** - Notificaciones temporales
2. **Modales** - Ventanas emergentes
3. **Confirmaciones** - Diálogos de confirmación
4. **Dropdown Menus** - Menús contextuales
5. **Loading States** - Indicadores de carga
6. **UI Controls** - Sidebar, dark mode, etc.

**Concepto fundamental:**  
> En lugar de que cada componente gestione su propia UI, centralizamos todo en ApplicationUIService que emite eventos mediante el EventBus.

---

## 🏗️ Constructor

```typescript
export class ApplicationUIService {
    private app: ApplicationUIContext;

    constructor(app: ApplicationUIContext) {
        this.app = app;
    }
}
```

**Inicialización:**
```typescript
// En Application constructor
this.ApplicationUIService = new ApplicationUIService(this);
```

**Acceso global:**
```typescript
import Application from '@/models/application';

Application.ApplicationUIService.showToast('Hello!', ToastType.SUCCESS);
```

---

## 🎨 MÉTODOS DE UI CONTROLS

### toggleDarkMode()

```typescript
toggleDarkMode = () => {
    this.app.AppConfiguration.value.isDarkMode = !this.app.AppConfiguration.value.isDarkMode;
}
```

Alterna entre modo claro y oscuro.

**Uso:**
```typescript
Application.ApplicationUIService.toggleDarkMode();
```

**Ubicación en código:** Línea 16

### toggleSidebar()

```typescript
toggleSidebar = () => {
    this.app.eventBus.emit('toggle-sidebar');
}
```

Alterna la visibilidad del sidebar (abierto/cerrado).

**Funcionamiento:**
1. Emite evento `'toggle-sidebar'`
2. `SideBarComponent` escucha el evento
3. El sidebar se abre/cierra con animación

**Uso:**
```typescript
// En un botón hamburguesa
Application.ApplicationUIService.toggleSidebar();
```

**Ubicación en código:** Línea 20

### setSidebar()

```typescript
setSidebar = (state: boolean) => {
    this.app.eventBus.emit('toggle-sidebar', state);
}
```

Establece el estado del sidebar explícitamente.

**Parámetros:**
- `state: boolean` - `true` para abrir, `false` para cerrar

**Uso:**
```typescript
// Forzar sidebar abierto
Application.ApplicationUIService.setSidebar(true);

// Forzar sidebar cerrado
Application.ApplicationUIService.setSidebar(false);
```

**Ubicación en código:** Línea 24

---

## 🔔 MÉTODOS DE TOAST

### showToast()

```typescript
showToast = (message: string, type: ToastType) => {
    this.app.ToastList.value.push(new Toast(message, type));
}
```

Muestra una notificación toast temporal.

**Parámetros:**
- `message: string` - Texto a mostrar
- `type: ToastType` - Tipo de toast (SUCCESS, ERROR, WARNING, INFO)

**Tipos disponibles:**
```typescript
enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}
```

**Uso:**
```typescript
// Toast de éxito
Application.ApplicationUIService.showToast(
    'Guardado con éxito', 
    ToastType.SUCCESS
);

// Toast de error
Application.ApplicationUIService.showToast(
    'Error al procesar', 
    ToastType.ERROR
);

// Toast de advertencia
Application.ApplicationUIService.showToast(
    'Cambios no guardados', 
    ToastType.WARNING
);

// Toast informativo
Application.ApplicationUIService.showToast(
    'Cargando datos...', 
    ToastType.INFO
);
```

**Funcionamiento:**
1. Crea instancia de clase `Toast`
2. La agrega a `Application.ToastList`
3. `ToastContainerComponent` detecta el cambio y renderiza el toast
4. El toast se auto-elimina después de 3-5 segundos

**Ubicación en código:** Línea 28

**Clase Toast:**
```typescript
// src/models/Toast.ts
export class Toast {
    message: string;
    type: ToastType;
    id: string;
    
    constructor(message: string, type: ToastType) {
        this.message = message;
        this.type = type;
        this.id = Date.now().toString();
    }
}
```

---

## 🗨️ MÉTODOS DE MODAL

### showModal()

```typescript
showModal = (
    entity: typeof BaseEntity, 
    viewType: ViewTypes, 
    customViewId?: string
) => {
    this.app.modal.value.modalView = entity;
    this.app.modal.value.modalOnCloseFunction = null;
    this.app.modal.value.viewType = viewType;
    this.app.modal.value.customViewId = customViewId;
    this.app.eventBus.emit('show-modal');
}
```

Abre un modal con una entidad.

**Parámetros:**
- `entity: typeof BaseEntity` - Clase de entidad a mostrar
- `viewType: ViewTypes` - Tipo de vista (LISTVIEW, DETAILVIEW)
- `customViewId?: string` - ID de vista custom (opcional)

**Uso:**
```typescript
// Mostrar lista de productos en modal
Application.ApplicationUIService.showModal(
    Product, 
    ViewTypes.LISTVIEW
);

// Mostrar detalle en modal
Application.ApplicationUIService.showModal(
    product.constructor as typeof BaseEntity, 
    ViewTypes.DETAILVIEW
);

// Mostrar vista custom
Application.ApplicationUIService.showModal(
    Product, 
    ViewTypes.CUSTOMVIEW, 
    'dashboard'
);
```

**Ubicación en código:** Línea 32

### showModalOnFunction()

```typescript
showModalOnFunction = (
    entity: typeof BaseEntity, 
    onCloseFunction: (param: any) => void, 
    viewType: ViewTypes, 
    customViewId?: string
) => {
    this.app.modal.value.modalView = entity;
    this.app.modal.value.modalOnCloseFunction = onCloseFunction;
    this.app.modal.value.viewType = viewType;
    this.app.modal.value.customViewId = customViewId;
    this.app.eventBus.emit('show-modal');
}
```

Abre un modal con callback al cerrar.

**Parámetros:**
- `entity: typeof BaseEntity` - Clase de entidad
- `onCloseFunction: (param: any) => void` - Función que se ejecuta al cerrar
- `viewType: ViewTypes` - Tipo de vista
- `customViewId?: string` - ID de vista custom

**Uso típico - Lookup/Selección:**
```typescript
// Abrir modal para seleccionar un producto
Application.ApplicationUIService.showModalOnFunction(
    Product,
    (selectedProduct: Product) => {
        // Callback cuando se selecciona un producto
        console.log('Producto seleccionado:', selectedProduct);
        order.product = selectedProduct;
    },
    ViewTypes.LISTVIEW
);
```

**Ubicación en código:** Línea 40

### closeModal()

```typescript
closeModal = () => {
    this.app.eventBus.emit('hide-modal');
    setTimeout(() => {
        this.app.modal.value.modalView = null;
    }, 150);
}
```

Cierra el modal actual.

**Funcionamiento:**
1. Emite evento `'hide-modal'`
2. Modal se oculta con animación
3. Después de 150ms, limpia los datos del modal

**Uso:**
```typescript
Application.ApplicationUIService.closeModal();
```

**Ubicación en código:** Línea 49

### closeModalOnFunction()

```typescript
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

Cierra el modal ejecutando el callback con un parámetro.

**Parámetros:**
- `param: any` - Parámetro a pasar al callback

**Uso:**
```typescript
// En el componente del modal, cuando se selecciona un item
const handleSelectItem = (item: Product) => {
    Application.ApplicationUIService.closeModalOnFunction(item);
    // Esto ejecutará el callback definido en showModalOnFunction
};
```

**Ubicación en código:** Línea 56

---

## 📋 MÉTODOS DE DROPDOWN MENU

### openDropdownMenu()

```typescript
openDropdownMenu = (
    position: HTMLElement, 
    title: string, 
    component: Component, 
    width?: string
) => {
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

Abre un menú dropdown en una posición específica.

**Parámetros:**
- `position: HTMLElement` - Elemento HTML de referencia para posicionamiento
- `title: string` - Título del dropdown
- `component: Component` - Componente Vue a renderizar dentro
- `width?: string` - Ancho opcional (ej: '300px')

**Uso:**
```typescript
// En un template Vue
<button ref="menuButton" @click="openMenu">Options</button>

// En el script
import OptionsMenuComponent from '@/components/OptionsMenu.vue';

const openMenu = () => {
    const button = menuButton.value; // ref del botón
    
    Application.ApplicationUIService.openDropdownMenu(
        button,
        'Opciones',
        OptionsMenuComponent,
        '250px'
    );
};
```

**Funcionamiento:**
1. Calcula posición del elemento de referencia
2. Posiciona el dropdown justo debajo del elemento
3. Renderiza el componente proporcionado
4. Muestra el dropdown con animación

**Ubicación en código:** Línea 67

### closeDropdownMenu()

```typescript
closeDropdownMenu = () => {
    this.app.dropdownMenu.value.showing = false;
    setTimeout(() => {
        this.app.dropdownMenu.value.component = null;
        this.app.dropdownMenu.value.title = '';
    }, 500);
}
```

Cierra el dropdown menu actual.

**Funcionamiento:**
1. Oculta el dropdown con animación
2. Después de 500ms, limpia el componente

**Uso:**
```typescript
// Llamar desde el componente dentro del dropdown
Application.ApplicationUIService.closeDropdownMenu();
```

**Ubicación en código:** Línea 85

---

## ⚠️ MÉTODOS DE CONFIRMATION MENU

### openConfirmationMenu()

```typescript
openConfirmationMenu = (
    type: confMenuType, 
    title: string, 
    message: string, 
    onAccept?: () => void, 
    acceptButtonText: string = 'Aceptar', 
    cancelButtonText: string = 'Cancelar'
) => {
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

Abre un diálogo de confirmación.

**Parámetros:**
- `type: confMenuType` - Tipo de confirmación (INFO, WARNING, ERROR, SUCCESS)
- `title: string` - Título del diálogo
- `message: string` - Mensaje a mostrar
- `onAccept?: () => void` - Callback al aceptar (opcional)
- `acceptButtonText?: string` - Texto del botón Aceptar (default: 'Aceptar')
- `cancelButtonText?: string` - Texto del botón Cancelar (default: 'Cancelar')

**Tipos disponibles:**
```typescript
enum confMenuType {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success'
}
```

**Uso:**

```typescript
// Confirmación simple
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,
    'Eliminar producto',
    '¿Estás seguro de que quieres eliminar este producto?',
    () => {
        // Se ejecuta si el usuario acepta
        product.delete();
    }
);

// Confirmación de error (solo informativo, sin callback)
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.ERROR,
    'Error al guardar',
    'No se pudo conectar con el servidor'
);

// Confirmación personalizada
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.INFO,
    'Cambios detectados',
    'Hay cambios sin guardar. ¿Deseas guardar antes de continuar?',
    () => product.save(),
    'Guardar',
    'Descartar'
);
```

**Ubicación en código:** Línea 93

### acceptConfigurationMenu()

```typescript
acceptConfigurationMenu = () => {
    if (this.app.confirmationMenu.value.confirmationAction) {
        this.app.confirmationMenu.value.confirmationAction();
    }

    this.closeConfirmationMenu();
}
```

Ejecuta la acción de aceptar y cierra el menú de confirmación.

**Funcionamiento:**
1. Ejecuta el callback `confirmationAction` si existe
2. Cierra el menú de confirmación

**Ubicación en código:** Línea 101

**Nota:** Este método es llamado internamente por `ConfirmationDialogComponent`.

### closeConfirmationMenu()

```typescript
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

Cierra el menú de confirmación sin ejecutar acción.

**Funcionamiento:**
1. Emite evento `'hide-confirmation'`
2. Oculta con animación
3. Después de 500ms, resetea los valores

**Ubicación en código:** Línea 109

---

## ⏳ MÉTODOS DE LOADING

### showLoadingScreen()

```typescript
showLoadingScreen = () => {
    this.app.eventBus.emit('show-loading');
}
```

Muestra pantalla de carga completa (full screen).

**Uso:**
```typescript
// Mostrar loading durante operación larga
Application.ApplicationUIService.showLoadingScreen();

try {
    await performHeavyOperation();
} finally {
    Application.ApplicationUIService.hideLoadingScreen();
}
```

**Ubicación en código:** Línea 121

### hideLoadingScreen()

```typescript
hideLoadingScreen = () => {
    this.app.eventBus.emit('hide-loading');
}
```

Oculta la pantalla de carga completa.

**Ubicación en código:** Línea 125

### showLoadingMenu()

```typescript
showLoadingMenu = () => {
    this.app.eventBus.emit('show-loading-menu');
}
```

Muestra popup de carga (más pequeño que loading screen).

**Uso:**
```typescript
// Se usa automáticamente en save(), update(), delete()
// Pero también se puede usar manualmente:

Application.ApplicationUIService.showLoadingMenu();

await quickOperation();

Application.ApplicationUIService.hideLoadingMenu();
```

**Diferencia con showLoadingScreen:**
- `showLoadingScreen()` - Full screen, bloquea toda la aplicación
- `showLoadingMenu()` - Popup pequeño, menos intrusivo

**Ubicación en código:** Línea 129

### hideLoadingMenu()

```typescript
hideLoadingMenu = () => {
    this.app.eventBus.emit('hide-loading-menu');
}
```

Oculta el popup de carga.

**Ubicación en código:** Línea 133

---

## 🔄 Flujo de Eventos

Todos los métodos de UI Service funcionan mediante el patrón **Event Bus**:

```
ApplicationUIService
        ↓ (emite evento)
    EventBus (mitt)
        ↓ (propaga)
Componentes UI (escuchan)
        ↓
    Renderizan/Actúan
```

**Ejemplo completo:**

```typescript
// 1. Service emite evento
Application.ApplicationUIService.showToast('Success!', ToastType.SUCCESS);

// 2. Internamente:
this.app.ToastList.value.push(new Toast('Success!', ToastType.SUCCESS));

// 3. ToastContainerComponent detecta el cambio en ToastList
// (Vue reactivity)

// 4. Renderiza el toast
<ToastItemComponent 
    v-for="toast in Application.ToastList.value"
    :toast="toast" />

// 5. Después de 3s, ToastItemComponent se auto-elimina
```

---

## 📦 Modelo de Datos

### Modal

```typescript
// src/models/modal.ts
export interface Modal {
    modalView: typeof BaseEntity | null;
    modalOnCloseFunction: ((param: any) => void) | null;
    viewType: ViewTypes;
    customViewId?: string;
}
```

### DropdownMenu

```typescript
// src/models/dropdown_menu.ts
export interface DropdownMenu {
    showing: boolean;
    title: string;
    component: Component | null;
    width: string;
    position_x: string;
    position_y: string;
    canvasWidth: string;
    canvasHeight: string;
    activeElementWidth: string;
    activeElementHeight: string;
}
```

### ConfirmationMenu

```typescript
// src/models/confirmation_menu.ts
export interface confirmationMenu {
    type: confMenuType;
    title: string;
    message: string;
    confirmationAction?: () => void;
    acceptButtonText?: string;
    cancelButtonText?: string;
}
```

### Toast

```typescript
// src/models/Toast.ts
export class Toast {
    message: string;
    type: ToastType;
    id: string;
    
    constructor(message: string, type: ToastType) {
        this.message = message;
        this.type = type;
        this.id = Date.now().toString();
    }
}
```

---

## 🎓 Ejemplos Prácticos

### Ejemplo 1: Flujo de Guardado con UI

```typescript
export class Product extends BaseEntity {
    override async save(): Promise<this> {
        // 1. Mostrar loading
        Application.ApplicationUIService.showLoadingMenu();
        
        try {
            // 2. Guardar
            await super.save();
            
            // 3. Ocultar loading (ya lo hace BaseEntity)
            // 4. Mostrar toast de éxito (ya lo hace BaseEntity)
            
        } catch (error) {
            // 5. Ocultar loading
            Application.ApplicationUIService.hideLoadingMenu();
            
            // 6. Mostrar error
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error',
                error.message
            );
        }
        
        return this;
    }
}
```

### Ejemplo 2: Confirmación antes de Eliminar

```typescript
const deleteProduct = (product: Product) => {
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.WARNING,
        'Eliminar Producto',
        `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`,
        async () => {
            try {
                await product.delete();
                Application.ApplicationUIService.showToast(
                    'Producto eliminado correctamente',
                    ToastType.SUCCESS
                );
                Application.changeViewToListView(Product);
            } catch (error) {
                // El error ya se maneja en BaseEntity.delete()
            }
        },
        'Eliminar',
        'Cancelar'
    );
};
```

### Ejemplo 3: Modal de Selección (Lookup)

```typescript
// En un formulario de Order
const selectProduct = () => {
    Application.ApplicationUIService.showModalOnFunction(
        Product,
        (selectedProduct: Product) => {
            // Callback al seleccionar producto
            order.product = selectedProduct;
            order.productId = selectedProduct.id;
            
            Application.ApplicationUIService.showToast(
                `Producto "${selectedProduct.name}" seleccionado`,
                ToastType.INFO
            );
        },
        ViewTypes.LISTVIEW
    );
};
```

### Ejemplo 4: Dropdown Menu Contextual

```vue
<template>
    <button ref="optionsButton" @click="showOptions">
        ⋮ Opciones
    </button>
</template>

<script setup>
import { ref } from 'vue';
import Application from '@/models/application';
import ProductOptionsMenu from './ProductOptionsMenu.vue';

const optionsButton = ref<HTMLElement>();

const showOptions = () => {
    Application.ApplicationUIService.openDropdownMenu(
        optionsButton.value!,
        'Opciones del Producto',
        ProductOptionsMenu,
        '200px'
    );
};
</script>
```

---

## 🔗 Referencias

- **Application Singleton:** `application-singleton.md`
- **Event Bus:** `event-bus.md`
- **Arquitectura:** `../../02-FLOW-ARCHITECTURE.md`
- **Componentes UI:** `../../layers/04-components/`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
