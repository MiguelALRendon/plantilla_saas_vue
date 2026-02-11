# 🪟 Modal Components Overview

**Referencias:**
- `../03-application/ui-services.md` - ApplicationUIService gestiona modales
- `../03-application/event-bus.md` - Sistema de eventos para modales

---

## 📍 Ubicación en el Código

**Carpeta:** `src/components/Modal/`  
**Componentes:**
- `ModalComponent.vue`
- `ConfirmationDialogComponent.vue`
- `LoadingPopupComponent.vue`

---

## 🎯 Propósito

Los **componentes de modal** proporcionan ventanas emergentes para diferentes contextos:
- Mostrar entidades en modo modal
- Confirmar acciones
- Indicar procesos en ejecución

**Controlados por:** ApplicationUIService mediante Event Bus

---

## 📦 1. ModalComponent

### Descripción
Modal principal para mostrar vistas de entidades (ListView, DetailView, LookupView, CustomView) en una ventana emergente.

### Archivo
`src/components/Modal/ModalComponent.vue`

### Estructura

```vue
<div class="modal-background">
    <div class="modal-structure">
        <div class="modal-head">
            <!-- Icono + Título del módulo -->
            <!-- Botón cerrar -->
        </div>
        <div class="modal-body">
            <!-- Componente dinámico según viewType -->
        </div>
        <div class="modal-footer">
            <!-- Botones Aceptar/Cerrar -->
        </div>
    </div>
</div>
```

### Props
Ninguno (lee de `Application.modal.value`)

### Data
```typescript
{
    modalModule: typeof BaseEntity | null,  // Clase de entidad
    isShowing: boolean                       // Estado de visibilidad
}
```

### Computed
```typescript
modalView(): Component | null {
    // Determina qué componente renderizar según viewType:
    // - ViewTypes.LISTVIEW → getModuleListComponent()
    // - ViewTypes.DETAILVIEW → getModuleDetailComponent()
    // - ViewTypes.DEFAULTVIEW → getModuleDefaultComponent()
    // - ViewTypes.LOOKUPVIEW → default_lookup_listview.vue
    // - ViewTypes.CUSTOMVIEW → getModuleCustomComponents().get(customViewId)
}
```

### Events Escuchados
- `show-modal` - Muestra el modal (isShowing = true)
- `hide-modal` - Oculta el modal (isShowing = false)

### Interacción con Teclado
- **ESC** - Cierra el modal

### Métodos
```typescript
closeModal() {
    Application.ApplicationUIService.closeModal();
}
```

### Animaciones
- **Entrada:** Transición opacity + scale (cubic-bezier)
- **Salida:** Transición reversa
- **Duración:** 250ms background, 300ms modal

### CSS Classes
- `.modal-background` - Overlay fullscreen
- `.modal-structure` - Contenedor del modal
- `.closed` - Estado oculto

### Z-Index
`1000`

---

## 📦 2. ConfirmationDialogComponent

### Descripción
Diálogo de confirmación para acciones del usuario con soporte para 4 tipos de mensajes.

### Archivo
`src/components/Modal/ConfirmationDialogComponent.vue`

### Tipos de Confirmación

```typescript
enum confMenuType {
    INFO,    // Icono: INFO, Color: azul
    SUCCESS, // Icono: CHECK, Color: verde
    WARNING, // Icono: WARNING, Color: amarillo
    ERROR    // Icono: CLOSE, Color: rojo
}
```

### Props
Ninguno (lee de `Application.confirmationMenu.value`)

### Data Source
```typescript
{
    type: confMenuType,          // Tipo de diálogo
    title: string,               // Título del diálogo
    message: string,             // Mensaje descriptivo
    confirmationAction?: Function, // Acción al aceptar (opcional)
    acceptButtonText?: string,   // Texto botón aceptar (default: 'Aceptar')
    cancelButtonText?: string    // Texto botón cancelar (default: 'Cancelar')
}
```

### Flujo de Uso

**Abrir diálogo:**
```typescript
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,
    'Salir sin guardar',
    '¿Estás seguro de que quieres salir sin guardar?',
    () => { /* acción de confirmación */ },
    'Sí, salir',
    'Cancelar'
);
```

**Aceptar:**
```typescript
Application.ApplicationUIService.acceptConfigurationMenu();
// Ejecuta confirmationAction y cierra el diálogo
```

**Cancelar:**
```typescript
Application.ApplicationUIService.closeConfirmationMenu();
// Solo cierra el diálogo sin ejecutar confirmationAction
```

### Estructura

```vue
<div class="confirmation-dialog-container">
    <div class="confirmation-dialog-card">
        <div class="confirmation-dialog-header">
            <h2>{{ title }}</h2>
        </div>
        <div class="confirmation-dialog-body">
            <span class="dialog-icon">{{ icono según tipo }}</span>
            <p>{{ message }}</p>
        </div>
        <div class="confirmation-dialog-footer">
            <button v-if="confirmationAction">Aceptar</button>
            <button>Cancelar</button>
        </div>
    </div>
</div>
```

### Events Escuchados
- `show-confirmation` - Muestra el diálogo
- `hide-confirmation` - Oculta el diálogo

### CSS Classes Condicionales
- `.txtinfo` - Color azul (INFO)
- `.txtsuccess` - Color verde (SUCCESS)
- `.txtwarning` - Color amarillo (WARNING)
- `.txterror` - Color rojo (ERROR)

### Z-Index
`1500` (por encima de ModalComponent)

### Animaciones
- **Entrada/Salida:** Opacity transition (0.3s ease)

---

## 📦 3. LoadingPopupComponent

### Descripción
Popup de carga con spinner animado, mostrado durante operaciones asíncronas (save, delete, getElementList, etc.).

### Archivo
`src/components/Modal/LoadingPopupComponent.vue`

### Estructura

```vue
<div class="loading-popup-component-container" :class="{ active: showing }">
    <div class="loading-popup-component-card">
        <div class="loading-popup-component-spinner">
            <span class="spin-icon">{{ GGICONS.REFRESH }}</span>
        </div>
    </div>
</div>
```

### Props
Ninguno

### Data
```typescript
{
    showing: boolean  // Estado de visibilidad
}
```

### Events Escuchados
- `show-loading-menu` - Muestra el loading
- `hide-loading-menu` - Oculta el loading

### Flujo de Uso

**Mostrar:**
```typescript
Application.ApplicationUIService.showLoadingMenu();
// Emite evento 'show-loading-menu'
```

**Ocultar:**
```typescript
Application.ApplicationUIService.hideLoadingMenu();
// Emite evento 'hide-loading-menu'
```

### Uso Típico en CRUD

```typescript
public async save(): Promise<this> {
    // ...validaciones...
    
    Application.ApplicationUIService.showLoadingMenu();
    await new Promise(resolve => setTimeout(resolve, 400)); // Delay mínimo
    
    try {
        const response = await Application.axiosInstance.post(endpoint, data);
        // ...procesar respuesta...
        Application.ApplicationUIService.hideLoadingMenu();
        Application.ApplicationUIService.showToast('Guardado con exito.', ToastType.SUCCESS);
    } catch (error) {
        Application.ApplicationUIService.hideLoadingMenu();
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR, 
            'Error', 
            'No se pudo guardar'
        );
    }
}
```

### Animación del Spinner
```css
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```
- **Duración:** 1.5s
- **Timing:** cubic-bezier(0.68, -0.55, 0.265, 1.55)
- **Infinite:** Loop continuo

### Z-Index
`1100` (entre ModalComponent y ConfirmationDialog)

### CSS Classes
- `.loading-popup-component-container` - Overlay fullscreen
- `.active` - Estado visible
- `.spin-icon` - Icono del spinner (120px, verde)

### Delay Mínimo
Todas las operaciones que usan loading tienen un delay mínimo de **400ms** antes de mostrar el resultado para mejorar UX y evitar flashes.

---

## 🔗 Integración con ApplicationUIService

### showModal()

```typescript
showModal(modalView: typeof BaseEntity, viewType: ViewTypes) {
    Application.modal.value.modalView = modalView;
    Application.modal.value.viewType = viewType;
    Application.eventBus.emit('show-modal');
}
```

### closeModal()

```typescript
closeModal() {
    Application.eventBus.emit('hide-modal');
    setTimeout(() => {
        Application.modal.value.modalView = null;
        if (Application.modal.value.modalOnCloseFunction) {
            Application.modal.value.modalOnCloseFunction();
            Application.modal.value.modalOnCloseFunction = null;
        }
    }, 300); // Espera a que termine animación
}
```

### openConfirmationMenu()

```typescript
openConfirmationMenu(
    type: confMenuType,
    title: string,
    message: string,
    confirmationAction?: Function,
    acceptButtonText?: string,
    cancelButtonText?: string
) {
    Application.confirmationMenu.value = {
        type,
        title,
        message,
        confirmationAction,
        acceptButtonText,
        cancelButtonText
    };
    Application.eventBus.emit('show-confirmation');
}
```

### acceptConfigurationMenu()

```typescript
acceptConfigurationMenu() {
    if (Application.confirmationMenu.value.confirmationAction) {
        Application.confirmationMenu.value.confirmationAction();
    }
    this.closeConfirmationMenu();
}
```

### closeConfirmationMenu()

```typescript
closeConfirmationMenu() {
    Application.eventBus.emit('hide-confirmation');
}
```

### showLoadingMenu()

```typescript
showLoadingMenu() {
    Application.eventBus.emit('show-loading-menu');
}
```

### hideLoadingMenu()

```typescript
hideLoadingMenu() {
    Application.eventBus.emit('hide-loading-menu');
}
```

---

## 🎨 Jerarquía de Z-Index

```
LoadingPopup (1100)
    ↓
Modal (1000)
    ↓
ConfirmationDialog (1500) ← Máxima prioridad
```

**Razón:** ConfirmationDialog debe aparecer sobre todo, incluyendo modales abiertos.

---

## 📝 Notas Importantes

1. **Event-driven**: Todos los modales se controlan mediante Event Bus
2. **No bloquean ejecución**: Son componentes visuales, la lógica continúa
3. **Animaciones suaves**: Transiciones para mejorar UX
4. **Accesibilidad**: ModalComponent responde a tecla ESC
5. **Clean up**: Todos los listeners se eliminan en `beforeUnmount()`
6. **Delay mínimo**: LoadingPopup garantiza mínimo 400msde feedback visual
7. **Tipos de confirmación**: 4 variantes visuales (INFO, SUCCESS, WARNING, ERROR)
8. **Botones condicionales**: Si no hay confirmationAction, no se muestra botón "Aceptar"

---

**Total de Componentes:** 3  
**Última actualización:** 11 de Febrero, 2026
