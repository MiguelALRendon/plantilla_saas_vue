# 🗨️ Dialog Components

**Referencias:**
- `modal-components.md` - Sistema de modales
- `../03-application/ui-services.md` - UI Services
- `../03-application/event-bus.md` - Event Bus

---

## 📍 Ubicación en el Código

**Archivos:**
- `src/components/Modal/ConfirmationDialogComponent.vue` - Diálogo de confirmación
- `src/components/Modal/LoadingPopupComponent.vue` - Popup de carga

---

## 🎯 Propósito

Componentes de **diálogos modales** para confirmaciones y indicadores de carga durante operaciones asíncronas.

---

## ✅ ConfirmationDialogComponent

### Propósito

**Diálogo modal de confirmación** para acciones críticas (eliminar, descartar cambios, etc.). Requiere que el usuario confirme o cancele explícitamente.

### Estructura

```vue
<template>
<div :class="['confirmation-dialog-container', { closed: !isShowing }]">
    <div class="confirmation-dialog-card">
        <div class="confirmation-dialog-header">
            <h2>{{ dialogInfo.title }}</h2>
        </div>
        
        <div class="confirmation-dialog-body">
            <div class="confirmation-dialog-center">
                <!-- Icono según tipo -->
                <span :class="[GGCLASS, iconColorClass]" class="dialog-icon">
                    {{ dialogIcon }}
                </span>
                
                <!-- Mensaje -->
                <p :class="messageColorClass">
                    {{ dialogInfo.message }}
                </p>
            </div>
        </div>
        
        <div class="confirmation-dialog-footer">
            <!-- Botón Aceptar (solo si hay action) -->
            <button v-if="dialogInfo.confirmationAction" 
                    class="button info fill" 
                    @click="Application.ApplicationUIService.acceptConfigurationMenu()">
                <span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
                {{ dialogInfo.acceptButtonText || 'Aceptar' }}
            </button>
            
            <!-- Botón Cancelar -->
            <button class="button alert fill" 
                    @click="Application.ApplicationUIService.closeConfirmationMenu()">
                <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
                {{ dialogInfo.cancelButtonText || 'Cancelar' }}
            </button>
        </div>
    </div>
</div>
</template>
```

---

## 📊 Tipos de Confirmación

### confMenuType Enum

```typescript
enum confMenuType {
    INFO,
    SUCCESS,
    WARNING,
    ERROR
}
```

### Iconos por Tipo

```typescript
computed: {
    dialogIcon() {
        switch(this.dialogInfo.type) {
            case confMenuType.INFO:
                return GGICONS.INFO;      // ℹ️
            case confMenuType.SUCCESS:
                return GGICONS.CHECK;     // ✓
            case confMenuType.WARNING:
                return GGICONS.WARNING;   // ⚠️
            case confMenuType.ERROR:
                return GGICONS.CLOSE;     // ✕
        }
    }
}
```

### Colores por Tipo

```css
.txtinfo { color: var(--info-blue); }
.txtsuccess { color: var(--success-green); }
.txtwarning { color: var(--warning-orange); }
.txterror { color: var(--error-red); }
```

---

## 🎨 Estilos

### Container (Overlay)

```css
.confirmation-dialog-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1500;                        /* Por encima de todo */
    background-color: var(--overlay-dark); /* Semi-transparente */
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 0.3s ease;
}

.confirmation-dialog-container.closed {
    opacity: 0;
    pointer-events: none;
}
```

### Card

```css
.confirmation-dialog-card {
    display: flex;
    flex-direction: column;
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    min-width: 400px;
    max-width: 600px;
    padding: 1.5rem;
}
```

---

## 🔄 Ciclo de Vida

### Data

```typescript
{
    Application: ApplicationClass,
    isShowing: boolean,              // Visible/oculto
    GGCLASS: string,                 // Clase de iconos
    GGICONS: object,                 // Constantes de iconos
    confMenuType: enum               // Enum de tipos
}
```

### Mounted

```typescript
mounted() {
    Application.eventBus.on('show-confirmation', () => {
        this.isShowing = true;
    });
    
    Application.eventBus.on('hide-confirmation', () => {
        this.isShowing = false;
    });
}
```

### BeforeUnmount

```typescript
beforeUnmount() {
    Application.eventBus.off('show-confirmation');
    Application.eventBus.off('hide-confirmation');
}
```

---

## 📝 Uso desde ApplicationUIService

### openConfirmationMenu()

```typescript
openConfirmationMenu(
    type: confMenuType,
    title: string,
    message: string,
    onAccept?: () => void,
    acceptButtonText: string = 'Aceptar',
    cancelButtonText: string = 'Cancelar'
) {
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

### acceptConfigurationMenu()

```typescript
acceptConfigurationMenu() {
    if (this.app.confirmationMenu.value.confirmationAction) {
        this.app.confirmationMenu.value.confirmationAction();
    }
    
    this.closeConfirmationMenu();
}
```

---

## 💡 Ejemplos de Uso

### Confirmar Eliminación

```typescript
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,
    'Delete Product',
    'Are you sure you want to delete this product? This action cannot be undone.',
    async () => {
        // Acción al confirmar
        await product.delete();
        Application.ApplicationUIService.showToast(
            'Product deleted',
            ToastType.SUCCESS
        );
    },
    'Delete',
    'Cancel'
);
```

### Descartar Cambios

```typescript
// En Application.changeView()
if (this.View.value.entityObject?.getDirtyState()) {
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.WARNING,
        'Unsaved Changes',
        'You have unsaved changes. Discard them?',
        () => {
            // Usuario confirmó descartar
            this.setViewChanges(entityClass, component, viewType, entity);
        }
    );
    return;  // No cambiar vista todavía
}
```

### Información Simple

```typescript
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.INFO,
    'Notice',
    'This feature is coming soon!',
    undefined,  // Sin acción (solo botón OK)
    'OK'
);
```

---

## 🔄 LoadingPopupComponent

### Propósito

**Popup de carga** con spinner animado para operaciones largas (llamadas API, procesamiento, etc.).

### Estructura

```vue
<template>
<div class="loading-popup-component-container" :class="{ active: showing }">
    <div class="loading-popup-component-card">
        <div class="loading-popup-component-spinner">
            <span :class="GGCLASS" class="spin-icon">
                {{ GGICONS.REFRESH }}
            </span>
        </div>
    </div>
</div>
</template>
```

---

## 🎨 Estilos de Loading

### Container

```css
.loading-popup-component-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--overlay-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
    pointer-events: none;
    opacity: 0;
    transition: 0.3s ease;
}

.loading-popup-component-container.active {
    pointer-events: all;
    opacity: 1;
}
```

### Card

```css
.loading-popup-component-card {
    background-color: var(--white);
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 400px;
    height: 150px;
    transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    transform: scale(0.01);
}

.loading-popup-component-container.active .loading-popup-component-card {
    transform: scale(1);  /* Bounce in effect */
}
```

### Spinner Animation

```css
.spin-icon {
    font-size: 120px;
    font-weight: bold;
    color: var(--green-soft);
    animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

## 📊 Uso del Loading Popup

### Data

```typescript
{
    showing: boolean,
    GGCLASS: string,
    GGICONS: object,
    Application: ApplicationClass
}
```

### Event Handlers

```typescript
mounted() {
    Application.eventBus.on('show-loading-menu', () => {
        this.showing = true;
    });
    
    Application.eventBus.on('hide-loading-menu', () => {
        this.showing = false;
    });
}

beforeUnmount() {
    Application.eventBus.off('show-loading-menu');
    Application.eventBus.off('hide-loading-menu');
}
```

---

## 💡 Ejemplo de Uso - Loading

```typescript
async function longOperation() {
    try {
        // Mostrar loading
        Application.ApplicationUIService.showLoadingMenu();
        
        // Operación larga
        await fetch('/api/heavy-operation');
        await processData();
        
    } finally {
        // Ocultar loading (siempre)
        Application.ApplicationUIService.hideLoadingMenu();
    }
}
```

---

## ⚠️ Consideraciones

### 1. Z-Index Hierarchy

```
1500: ConfirmationDialog (máxima prioridad)
1100: LoadingPopup
1000: Modal regular
999:  Dropdown
888:  Dropdown container
```

### 2. Bloqueo de Interacción

Ambos componentes usan `pointer-events: all` cuando activos → **bloquean toda interacción**.

### 3. Event Cleanup

```typescript
// ✅ SIEMPRE limpiar en beforeUnmount
Application.eventBus.off('show-confirmation');
Application.eventBus.off('hide-confirmation');
```

---

## 🔗 Integración con App.vue

```vue
<template>
    <div id="app">
        <RouterView />
        <ConfirmationDialogComponent />
        <LoadingPopupComponent />
        <ToastContainerComponent />
    </div>
</template>
```

**Orden:** Confirmación debe estar después de Loading para tener z-index mayor.

---

## 🐛 Debugging

### Ver Estado de Confirmación

```javascript
console.log('Confirmation data:', Application.confirmationMenu.value);
```

### Ver Loading

```javascript
// En LoadingPopupComponent (Vue DevTools)
showing: true  // or false
```

### Simular Confirmación

```javascript
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.INFO,
    'Test',
    'Test message',
    () => console.log('Confirmed!')
);
```

---

## 📚 Resumen

**ConfirmationDialogComponent:**
- ✅ Modal de confirmación para acciones críticas
- ✅ 4 tipos visuales (INFO, SUCCESS, WARNING, ERROR)
- ✅ Textos de botones personalizables
- ✅ Callback opcional al confirmar
- ✅ Z-index máximo (1500)

**LoadingPopupComponent:**
- ✅ Popup de carga con spinner animado
- ✅ Bloquea interacción durante operaciones
- ✅ Animación de bounce in/out
- ✅ Control via event bus

Ambos son **globales** y se controlan via `ApplicationUIService`.
