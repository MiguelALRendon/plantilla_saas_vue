# 🔄 LoadingScreenComponent

**Referencias:**
- `core-components.md` - Componentes core del framework
- `ComponentContainerComponent.md` - Contenedor principal
- `../03-application/application-singleton.md` - Application
- `../03-application/event-bus.md` - Event Bus

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/LoadingScreenComponent.vue`

---

## 🎯 Propósito

`LoadingScreenComponent` es un **overlay de carga full-screen** que se muestra durante las transiciones entre vistas. Proporciona feedback visual al usuario mientras se carga y renderiza una nueva vista.

**Características:**
- 📺 Overlay fullscreen con fondo semi-transparente
- ⚡ Control mediante eventBus
- 🎭 Transiciones suaves (fade in/out)
- 🚫 Bloquea interacción durante carga

---

## 🏗️ Estructura

### Template

```vue
<div class="loading-screen" :class="{ active: isActive }">
    Loading...
</div>
```

**Estados:**
- `isActive: false` → Oculto (opacity: 0, pointer-events: none)
- `isActive: true` → Visible (opacity: 1, pointer-events: all)

---

## ⚙️ Funcionamiento

### Data Properties

```typescript
{
    Application: ApplicationClass,    // Referencia a Application
    isActive: boolean                  // Estado de visibilidad
}
```

### Eventos del Event Bus

#### show-loading

Muestra el overlay de carga:

```typescript
Application.eventBus.on('show-loading', () => {
    this.isActive = true;
});
```

#### hide-loading

Oculta el overlay de carga:

```typescript
Application.eventBus.on('hide-loading', () => {
    this.isActive = false;
});
```

---

## 🔄 Ciclo de Vida

### Mounted

```typescript
mounted() {
    // Registrar listeners del event bus
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;
    });
    
    Application.eventBus.on('hide-loading', () => {
        this.isActive = false;
    });
}
```

### BeforeUnmount

```typescript
beforeUnmount() {
    // Limpiar listeners para evitar memory leaks
    Application.eventBus.off('show-loading');
    Application.eventBus.off('hide-loading');
}
```

**Importante:** Siempre limpiar los event listeners para evitar fugas de memoria.

---

## 🎨 Estilos

### Base

```css
.loading-screen {
    position: absolute;              /* Relativo al ComponentContainer */
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100% - 50px);      /* Altura menos TopBar */
    width: 100%;
    font-size: 1.5rem;
    top: 50px;                      /* Debajo del TopBar */
    z-index: 99999;                 /* Por encima de todo */
    background-color: var(--white);
    color: var(--gray);
    opacity: 0;                     /* Invisible por defecto */
    pointer-events: none;           /* No intercepta clicks */
    transition: opacity 0.3s ease-in-out;
}
```

### Estado Activo

```css
.loading-screen.active {
    opacity: 1;                     /* Visible */
    pointer-events: all;            /* Bloquea interacción */
}
```

---

## 📊 Uso en el Framework

### Desde Application UI Service

```typescript
// Mostrar loading
Application.ApplicationUIService.showLoadingScreen();

// Ocultar loading
Application.ApplicationUIService.hideLoadingScreen();
```

### En ComponentContainerComponent

```typescript
watch(() => Application.View.value.component, async (newVal) => {
    if (newVal) {
        // Mostrar loading antes de cambiar vista
        Application.ApplicationUIService.showLoadingScreen();
        
        // Esperar transición
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Actualizar componente
        this.currentComponent = markRaw(newVal);
        
        // Ocultar loading
        Application.ApplicationUIService.hideLoadingScreen();
    }
});
```

---

## 🔄 Flujo de Transición de Vista

```
1. Usuario hace click para cambiar vista
        ↓
2. Application.changeView() se ejecuta
        ↓
3. Application.ApplicationUIService.showLoadingScreen()
   └─→ Emite 'show-loading' en eventBus
        ↓
4. LoadingScreenComponent recibe evento
   └─→ isActive = true
   └─→ Overlay se hace visible (fade in)
        ↓
5. Sistema espera 400ms (transición suave)
        ↓
6. ComponentContainerComponent actualiza vista
        ↓
7. Application.ApplicationUIService.hideLoadingScreen()
   └─→ Emite 'hide-loading' en eventBus
        ↓
8. LoadingScreenComponent recibe evento
   └─→ isActive = false
   └─→ Overlay se oculta (fade out)
```

---

## 🎭 Transiciones

### Fade In/Out

```css
transition: opacity 0.3s ease-in-out;
```

**Duración:** 300ms

**Efecto:**
- Aparición suave al mostrar
- Desvanecimiento suave al ocultar

---

## 💡 Variantes de Loading

### LoadingScreenComponent vs LoadingPopupComponent

| Aspecto | LoadingScreenComponent | LoadingPopupComponent |
|---------|----------------------|---------------------|
| **Uso** | Transiciones de vista | Operaciones async |
| **Posición** | Absolute dentro de container | Fixed fullscreen |
| **Eventos** | `show-loading`, `hide-loading` | `show-loading-menu`, `hide-loading-menu` |
| **Visual** | Texto "Loading..." | Spinner animado |
| **Z-Index** | 99999 | 1100 |

---

## 📝 Ejemplo de Uso

### Operación Manual

```typescript
// Ejemplo: Carga manual de datos
async function loadData() {
    try {
        // Mostrar loading
        Application.ApplicationUIService.showLoadingScreen();
        
        // Cargar datos (simulado)
        await fetch('/api/data');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } finally {
        // Siempre ocultar loading (even si hay error)
        Application.ApplicationUIService.hideLoadingScreen();
    }
}
```

### Uso Automático

```typescript
// El framework maneja automáticamente el loading
// en cambios de vista
Application.changeViewToListView(Products);
// ↓ showLoadingScreen() se llama automáticamente
// ↓ hideLoadingScreen() se llama cuando termine
```

---

## 🎯 Posicionamiento

### Área de Cobertura

```
┌─────────────────────────────────────┐
│ ViewContainer                       │
│ ┌─────────────────────────────────┐ │ ← TopBar (50px)
│ │ TopBarComponent                 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ████████████████████████████████│ │ ← LoadingScreenComponent
│ │ ████████████████████████████████│ │   (cubre ComponentContainer)
│ │ ████████ Loading... ████████████│ │
│ │ ████████████████████████████████│ │
│ │ ████████████████████████████████│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Nota:** No cubre el TopBar, solo el ComponentContainer.

---

## ⚠️ Consideraciones

### 1. Limpieza de Event Listeners

```typescript
beforeUnmount() {
    // ✅ CRÍTICO: Limpiar event listeners
    Application.eventBus.off('show-loading');
    Application.eventBus.off('hide-loading');
}
```

**Sin limpieza:** Memory leaks y comportamiento inesperado.

### 2. Z-Index Alto

```css
z-index: 99999;
```

**Razón:** Debe estar por encima de todo el contenido pero por debajo de modales (1000+).

### 3. Pointer Events

```css
pointer-events: none;  /* Cuando oculto */
pointer-events: all;   /* Cuando activo */
```

**Razón:** Cuando activo, bloquea toda interacción. Cuando oculto, no interfiere con clicks.

---

## 🔗 Integración con Otros Componentes

### ComponentContainerComponent

Contiene el LoadingScreenComponent:

```vue
<template>
    <div class="ViewContainer">
        <TopBarComponent />
        <div class="ComponentContainer">
            <ActionsComponent />
            <component :is="currentComponent" />
        </div>
        <LoadingScreenComponent />  <!-- Overlay aquí -->
    </div>
</template>
```

### ApplicationUIService

Proporciona métodos de control:

```typescript
showLoadingScreen() {
    this.app.eventBus.emit('show-loading');
}

hideLoadingScreen() {
    this.app.eventBus.emit('hide-loading');
}
```

---

## 🎨 Personalización

### Cambiar Texto

```vue
<div class="loading-screen" :class="{ active: isActive }">
    {{ loadingText }}  <!-- Texto dinámico -->
</div>

<script>
data() {
    return {
        isActive: false,
        loadingText: 'Loading...'  // Personalizable
    };
}
</script>
```

### Agregar Spinner

```vue
<div class="loading-screen" :class="{ active: isActive }">
    <div class="spinner"></div>
    <span>Loading...</span>
</div>

<style>
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--gray-lighter);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
```

---

## 🐛 Debugging

### Ver Estado

```javascript
// En la consola del navegador
const loading = document.querySelector('.loading-screen');
console.log('Is active:', loading.classList.contains('active'));
```

### Monitorear Eventos

```javascript
Application.eventBus.on('show-loading', () => {
    console.log('[Loading] Showing...');
});

Application.eventBus.on('hide-loading', () => {
    console.log('[Loading] Hiding...');
});
```

---

## 📚 Resumen

`LoadingScreenComponent` es el **feedback visual** durante transiciones:

- ✅ Overlay fullscreen con fade transitions
- ✅ Control mediante event bus (desacoplado)
- ✅ Bloquea interacción durante carga
- ✅ Limpieza automática de event listeners
- ✅ Integrado en ComponentContainerComponent
- ✅ Z-index alto para estar sobre contenido

Usado automáticamente en cambios de vista, no requiere configuración manual.
