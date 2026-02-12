# Toast System Components

## 1. Propósito

Sistema integral de notificaciones toast para proporcionar feedback visual inmediato al usuario mediante mensajes temporales no intrusivos. ToastContainerComponent actúa como contenedor fixed posicionado en esquina superior derecha mientras ToastItemComponent renderiza notificaciones individuales con auto-dismiss timer pausable. Sistema soporta cuatro tipos visuales diferenciados (SUCCESS, ERROR, INFO, WARNING) con gradientes distintivos y gestiona ciclo completo desde apertura hasta remoción del DOM, incluyendo animaciones de entrada/salida y manejo de interacción usuario (pause on hover, cierre manual, cierre con ESC).

## 2. Alcance

Este documento cubre ambos componentes del sistema toast: ToastContainerComponent (src/components/Informative/ToastContainerComponent.vue) y ToastItemComponent (src/components/Informative/ToastItemComponent.vue). Incluye estructura del modelo Toast (id, message, type, duration), integración con Application.ToastList para gestión reactiva de lista global, sistema de auto-dismiss con timers configurables, algoritmo pause/resume basado en mouseenter/mouseleave events, posicionamiento fixed con z-index y pointer-events, manejo de eventos globales (click, keydown), animaciones de fade in/out, métodos de ApplicationUIService (showToast, closeToast), y estilos diferenciados por tipo. No cubre lógica de invocación automática desde BaseEntity CRUD operations.

## 3. Definiciones Clave

**ToastContainerComponent**: Componente contenedor fixed renderizado en App.vue que observa Application.ToastList y genera ToastItemComponent por cada entrada, gestionando remoción cuando toasts emiten evento remove.

**ToastItemComponent**: Componente individual que renderiza mensaje, icono de cierre, aplica estilos por tipo y gestiona auto-dismiss timer con capacidad de pausa.

**Toast Model**: Interface con propiedades id (string UUID), message (string a mostrar), type (ToastType enum), duration (number en milisegundos, default 3000).

**ToastType Enum**: Valores SUCCESS, ERROR, INFO, WARNING que determinan clase CSS y gradiente de background aplicados.

**Auto-Dismiss Timer**: Sistema de setTimeout que dispara remoción automática después de duration especificada, con lógica pause/resume calculando tiempo restante mediante Date.now() timestamps.

---

## 📦 ToastContainerComponent

### Propósito

**Contenedor fixed** que renderiza la lista de toasts activos desde `Application.ToastList`.

### Estructura

```vue
<template>
<div class="toast-container">
    <ToastItemComponent 
        v-for="toast in Application.ToastList" 
        :key="toast.id" 
        :toast="toast" 
        @remove="removeToast"/>
</div>
</template>
```

### Methods

```typescript
methods: {
    removeToast(toastId: string) {
        const index = this.Application.ToastList.findIndex(
            (toast) => toast.id === toastId
        );
        if (index !== -1) {
            this.Application.ToastList.splice(index, 1);
        }
    }
}
```

### Estilos

```css
.toast-container {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9999;
    width: 400px;
    height: 100%;
    padding-top: calc(50px + 0.5rem);  /* Debajo del TopBar */
    padding-right: 1rem;
    display: flex;
    flex-direction: column;           /* Stack vertical */
    gap: 1rem;
    pointer-events: none;             /* No bloquea interacción */
}
```

**Nota:** `pointer-events: none` permite que clicks pasen a través del contenedor, pero cada ToastItem tiene `pointer-events: all`.

---

## 🍞 ToastItemComponent

### Props

```typescript
{
    toast: Toast  // Objeto con información del toast
}
```

### Estructura de Toast

```typescript
interface Toast {
    id: string              // UUID único
    message: string         // Mensaje a mostrar
    type: ToastType         // SUCCESS, ERROR, INFO, WARNING
    duration: number        // Duración en ms (default: 3000)
}
```

### Template

```vue
<template>
<div class="toast-card" :class="[setToastClass(), { show: showToast }]">
    <div class="toast" 
         :class="setToastClass()" 
         @mouseenter="pauseDismiss" 
         @mouseleave="resumeDismiss">
        <span>{{ toast.message }}</span>
        <button class="toast-close-button" @click="handleClose">
            <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
        </button>
    </div>
</div>
</template>
```

---

## 🎨 Tipos de Toast

### setToastClass()

```typescript
methods: {
    setToastClass(): string {
        switch (this.toast.type) {
            case ToastType.ERROR:
                return 'toast-error';
            case ToastType.SUCCESS:
                return 'toast-success';
            case ToastType.INFO:
                return 'toast-info';
            case ToastType.WARNING:
                return 'toast-warning';
            default:
                return '';
        }
    }
}
```

### Estilos por Tipo

```css
.toast-success {
    background: linear-gradient(135deg, #81C784, #66BB6A);
    color: white;
}

.toast-error {
    background: linear-gradient(135deg, #E57373, #EF5350);
    color: white;
}

.toast-info {
    background: linear-gradient(135deg, #64B5F6, #42A5F5);
    color: white;
}

.toast-warning {
    background: linear-gradient(135deg, #FFB74D, #FFA726);
    color: white;
}
```

---

## ⏱️ Sistema de Auto-Dismiss

### Data Properties

```typescript
{
    showToast: boolean                  // Visible/oculto (para animación)
    isDismissing: boolean               // Si está en proceso de cierre
    dismissTimerId: number | null       // ID del timer de dismiss
    removeTimerId: number | null        // ID del timer de remoción
    dismissStartAt: number              // Timestamp de inicio del timer
    remainingDismissMs: number          // Tiempo restante (para pause/resume)
}
```

### startDismissTimer()

```typescript
startDismissTimer() {
    this.clearDismissTimer();
    this.dismissStartAt = Date.now();
    
    this.dismissTimerId = window.setTimeout(() => {
        this.dismissToast();
    }, this.remainingDismissMs);
}
```

### pauseDismiss()

```typescript
pauseDismiss() {
    if (this.isDismissing || this.dismissTimerId === null) {
        return;
    }
    
    // Calcular tiempo transcurrido
    const elapsed = Date.now() - this.dismissStartAt;
    
    // Actualizar tiempo restante
    this.remainingDismissMs = Math.max(
        this.remainingDismissMs - elapsed, 
        0
    );
    
    // Cancelar timer
    this.clearDismissTimer();
}
```

### resumeDismiss()

```typescript
resumeDismiss() {
    if (this.isDismissing || this.remainingDismissMs <= 0) {
        return;
    }
    
    // Reiniciar timer con tiempo restante
    this.startDismissTimer();
}
```

### dismissToast()

```typescript
dismissToast() {
    if (this.isDismissing) {
        return;
    }
    
    this.isDismissing = true;
    this.showToast = false;           // Trigger fade-out animation
    
    this.clearDismissTimer();
    this.clearRemoveTimer();
    
    // Esperar animación antes de remover
    this.removeTimerId = window.setTimeout(() => {
        this.$emit('remove', this.toast.id);
    }, 300);
}
```

---

## 🔄 Ciclo de Vida

### Mounted

```typescript
mounted() {
    // Mostrar toast con pequeño delay (animación de entrada)
    setTimeout(() => {
        this.showToast = true;
    }, 50);
    
    // Iniciar timer de auto-dismiss
    this.startDismissTimer();
}
```

### BeforeUnmount

```typescript
beforeUnmount() {
    // Limpiar todos los timers
    this.clearDismissTimer();
    this.clearRemoveTimer();
}
```

---

## 📊 Flujo Completo

```
1. Código llama showToast()
        ↓
2. Toast se agrega a Application.ToastList
        ↓
3. ToastContainer detecta nuevo toast (reactividad)
        ↓
4. ToastItem se monta
        ↓
5. Después de 50ms, showToast = true (fade in)
        ↓
6. Auto-dismiss timer inicia (ej: 3000ms)
        ↓
7. Usuario mueve mouse sobre toast
        └─→ pauseDismiss() - Timer se pausa
        ↓
8. Usuario saca mouse del toast
        └─→ resumeDismiss() - Timer continúa
        ↓
9. Timer expira o usuario hace click en X
        └─→ dismissToast()
        ↓
10. showToast = false (fade out, 300ms)
        ↓
11. Evento 'remove' se emite
        ↓
12. ToastContainer remueve toast de Application.ToastList
        ↓
13. Vue desmonta ToastItem
```

---

## 🎨 Animaciones

### Fade In/Out

```css
.toast-card {
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    pointer-events: all;
}

.toast-card.show {
    opacity: 1;
    transform: translateX(0);
}
```

**Efecto:** Toast aparece deslizándose desde la derecha con bounce.

---

## 📝 Uso desde el Código

### ApplicationUIService

```typescript
// Método en ApplicationUIService
showToast(message: string, type: ToastType) {
    this.app.ToastList.value.push(new Toast(message, type));
}
```

### Desde Cualquier Componente

```typescript
import Application from '@/models/application';
import { ToastType } from '@/enums/ToastType';

// Success
Application.ApplicationUIService.showToast(
    'Product saved successfully!',
    ToastType.SUCCESS
);

// Error
Application.ApplicationUIService.showToast(
    'Failed to save product',
    ToastType.ERROR
);

// Info
Application.ApplicationUIService.showToast(
    'Loading data...',
    ToastType.INFO
);

// Warning
Application.ApplicationUIService.showToast(
    'Some fields are missing',
    ToastType.WARNING
);
```

---

## 💡 Características Avanzadas

### Duración Personalizada

```typescript
// En Toast.ts (constructor)
constructor(message: string, type: ToastType, duration: number = 3000) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.message = message;
    this.type = type;
    this.duration = duration;
}

// Uso
const customToast = new Toast('Long message', ToastType.INFO, 5000);
Application.ToastList.value.push(customToast);
```

### Pause on Hover

```vue
<div @mouseenter="pauseDismiss" @mouseleave="resumeDismiss">
    <!-- El toast no desaparece mientras el mouse esté encima -->
</div>
```

**UX Benefit:** El usuario puede leer mensajes largos sin prisa.

---

## ⚠️ Consideraciones

### 1. Z-Index

```css
z-index: 9999;
```

Los toasts están **por encima de todo** excepto modales de confirmación (z-index: 1500).

### 2. Memory Leaks

```typescript
beforeUnmount() {
    // ✅ CRÍTICO: Limpiar timers
    this.clearDismissTimer();
    this.clearRemoveTimer();
}
```

Sin limpieza, los timers continúan ejecutándose después de desmontar.

### 3. Límite de Toasts

No hay límite implementado. Para evitar spam:

```typescript
// Limitar a 5 toasts simultáneos
if (Application.ToastList.value.length >= 5) {
    Application.ToastList.value.shift();  // Remover el más antiguo
}
Application.ToastList.value.push(newToast);
```

---

## 🔗 Integración con App.vue

```vue
<template>
    <div id="app">
        <!-- Otros componentes -->
        <ToastContainerComponent />  <!-- En la raíz -->
    </div>
</template>
```

---

## 🐛 Debugging

### Ver Toasts Actuales

```javascript
console.log('Active toasts:', Application.ToastList.value);
```

### Ver Tiempo Restante

```javascript
// En ToastItemComponent (en Vue DevTools)
remainingDismissMs: 1500  // ms restantes
```

### Simular Toast

```javascript
Application.ApplicationUIService.showToast('Test message', ToastType.SUCCESS);
```

---

## 📚 Resumen

Sistema de **notificaciones toast**:

**ToastContainerComponent:**
- ✅ Contenedor fixed en esquina superior derecha
- ✅ Stack vertical de toasts
- ✅ Gestiona remoción de toasts

**ToastItemComponent:**
- ✅ Toast individual con mensaje y tipo
- ✅ Auto-dismiss con timer
- ✅ Pause on hover
- ✅ Botón de cierre manual
- ✅ Animaciones de entrada/salida
- ✅ 4 tipos visuales (SUCCESS, ERROR, INFO, WARNING)

**Usado automáticamente por el framework** para feedback de operaciones CRUD.
