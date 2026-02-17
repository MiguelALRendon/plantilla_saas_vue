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

## 4. Descripción Técnica

### ToastContainerComponent

**Archivo:** src/components/Informative/ToastContainerComponent.vue

**Data:**
```typescript
{
    Application: ApplicationClass
}
```

Application singleton proporciona acceso a `Application.ToastList` reactive array con toasts activos.

**Template:**
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

Itera sobre Application.ToastList renderizando ToastItemComponent por cada toast. Key binding con toast.id asegura correct reconciliation durante add/remove. Event listener @remove ejecuta removeToast method.

**Methods:**
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

removeToast busca toast por ID y lo remueve del array con splice. Esto dispara re-render reactivo removiendo ToastItemComponent del DOM.

**Estilos:**
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
    flex-direction: column;
    gap: 1rem;
    pointer-events: none;  /* No bloquea interacción */
}
```

Posicionamiento fixed en esquina superior derecha con z-index 9999 sobre todo el contenido. pointer-events: none permite clicks pasen a través del contenedor; cada ToastItemComponent tiene pointer-events: all restaurando interactividad.

### ToastItemComponent

**Archivo:** src/components/Informative/ToastItemComponent.vue

**Props:**
```typescript
{
    toast: Toast  // Objeto con id, message, type, duration
}
```

**Data:**
```typescript
{
    showToast: boolean,              // Control de animación fade
    timer: number | null,            // setTimeout ID para auto-dismiss
    pausedAt: number | null,         // Timestamp cuando se pausó
    remainingTime: number,           // Tiempo restante en ms
    GGCLASS: string,                 // Clase CSS para iconos
    GGICONS: object                  // Objeto con iconos
}
```

showToast controla clase CSS 'show' para animación de entrada. timer almacena ID del setTimeout para cancelación. pausedAt y remainingTime gestionan pause/resume logic.

**Lifecycle Hooks:**
```typescript
mounted() {
    this.remainingTime = this.toast.duration;
    this.startDismissTimer();
    setTimeout(() => {
        this.showToast = true;
    }, 10);
}

beforeUnmount() {
    if (this.timer) {
        clearTimeout(this.timer);
    }
}
```

mounted inicia timer y activa animación de entrada después de 10ms. beforeUnmount limpia timer para evitar memory leaks.

**Methods:**
```typescript
startDismissTimer() {
    this.timer = setTimeout(() => {
        this.handleClose();
    }, this.remainingTime);
}

pauseDismiss() {
    if (this.timer) {
        clearTimeout(this.timer);
        this.pausedAt = Date.now();
    }
}

resumeDismiss() {
    if (this.pausedAt) {
        const elapsed = Date.now() - this.pausedAt;
        this.remainingTime -= elapsed;
        this.pausedAt = null;
        this.startDismissTimer();
    }
}

handleClose() {
    this.showToast = false;
    setTimeout(() => {
        this.$emit('remove', this.toast.id);
    }, 300);  // Espera animación fade-out
}
```

pauseDismiss cancela timer y guarda timestamp. resumeDismiss calcula tiempo transcurrido, actualiza remainingTime y reinicia timer. handleClose dispara animación de salida, espera 300ms para completar transición, luego emite evento remove.

**Computed Property:**
```typescript
computed: {
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

Mapea ToastType a clase CSS correspondiente para coloring diferenciado.

---

## 5. Flujo de Funcionamiento

### Flujo de Creación y Display de Toast

```
1. Código ejecuta Application.ApplicationUIService.showToast('Message', ToastType.SUCCESS)
        ↓
2. ApplicationUIService crea Toast object: { id: uuid(), message: 'Message', type: SUCCESS, duration: 3000 }
        ↓
3. ApplicationUIService push toast a Application.ToastList
        ↓
4. ToastContainerComponent (siempre mounted en App.vue) detecta cambio reactivo en ToastList
        ↓
5. v-for renderiza nuevo ToastItemComponent con :toast="newToast"
        ↓
6. ToastItemComponent mounted hook ejecutado
        ↓
7. remainingTime = 3000, startDismissTimer() llamado
        ↓
8. setTimeout(handleClose, 3000) iniciado
        ↓
9. showToast = true después de 10ms → animación fade-in CSS activada
        ↓
10. Toast visible, timer corriendo
```

### Flujo de Auto-Dismiss

```
        ↓ (continuación desde paso 10)
11. 3000ms transcurren sin interacción
        ↓
12. setTimeout callback ejecutado → handleClose() llamado
        ↓
13. showToast = false → animación fade-out CSS activada
        ↓
14. setTimeout 300ms espera finalización de animación
        ↓
15. $emit('remove', toast.id) emitido
        ↓
16. ToastContainerComponent.removeToast(toastId) ejecutado
        ↓
17. Application.ToastList.splice(index, 1) remueve toast del array
        ↓
18. Vue reactivity dispara re-render, ToastItemComponent unmounted
```

### Flujo de Pause/Resume con Mouse Hover

```
        ↓ (desde paso 10, usuario mueve mouse sobre toast)
11a. mouseenter event dispara pauseDismiss()
        ↓
12a. clearTimeout(timer) cancela auto-dismiss
        ↓
13a. pausedAt = Date.now() guarda timestamp actual
        ↓
14a. Timer pausado, toast permanece visible
        ↓
(usuario mueve mouse fuera del toast)
15a. mouseleave event dispara resumeDismiss()
        ↓
16a. elapsed = Date.now() - pausedAt calcula tiempo pausado
        ↓
17a. remainingTime -= elapsed actualiza tiempo restante
        ↓
18a. startDismissTimer() reinicia timer con remainingTime actualizado
        ↓
19a. Timer continúa con tiempo restante correcto
```

### Flujo de Cierre Manual con Click

```
(desde paso 10, usuario click botón X)
11b. @click="handleClose" ejecutado
        ↓
12b. showToast = false → animación fade-out
        ↓
13b. setTimeout 300ms espera animación
        ↓
14b. $emit('remove', toast.id)
        ↓
15b. ToastContainerComponent remueve toast de lista
```

---

## 6. Reglas Obligatorias

### Arquitectura del Sistema

**OBLIGATORIO 6.1:** ToastContainerComponent DEBE estar montado permanentemente en App.vue al mismo nivel que TopBarComponent y SideBarComponent. NO se debe montar/desmontar dinámicamente.

**OBLIGATORIO 6.2:** Toast objects DEBEN tener id único (UUID). Duplicates causan key conflicts en v-for rendering.

**OBLIGATORIO 6.3:** Application.ToastList DEBE ser reactive array (ref o reactive). Changes deben disparar re-renders en ToastContainerComponent.

### Interacción y UX

**OBLIGATORIO 6.4:** ToastItemComponent DEBE pausar auto-dismiss timer en mouseenter y resumir en mouseleave. NO ignorar interacción del usuario.

**OBLIGATORIO 6.5:** Cierre manual con botón X DEBE ejecutar misma animación fade-out que auto-dismiss. NO remover inmediatamente sin transición.

**OBLIGATORIO 6.6:** beforeUnmount hook DEBE ejecutar clearTimeout(timer) para cleanup de timers. Memory leaks si no se cancela.

### Duración y Timing

**OBLIGATORIO 6.7:** Default duration DEBE ser 3000ms (3 segundos). Durations menores a 2000ms no dan tiempo suficiente para leer mensaje.

**OBLIGATORIO 6.8:** Animación fade-out DEBE durar 300ms. setTimeout antes de emit('remove') DEBE coincidir con duration de CSS transition.

**OBLIGATORIO 6.9:** Pause/resume logic DEBE calcular elapsed time correctamente. NO reiniciar timer con duration original ignorando tiempo transcurrido.

**OBLIGATORIO 6.10:** El contenedor toast DEBE usar token de capa (`var(--z-toast)`) para `z-index`; quedan prohibidos valores numéricos literales.

**OBLIGATORIO 6.11:** Los estilos de ToastItem (`opacity`, `background-color`, `padding`, `height`, `transform`) DEBEN consumir tokens de `constants.css`; quedan prohibidos valores literales `rgba(...)`, `rem` o porcentajes repetibles.

**OBLIGATORIO 6.12:** El estado visual de entrada/salida DEBE usar transformaciones tokenizadas (`--transform-*`) y transiciones tokenizadas (`--transition-*`, `--timing-*`).

---

## 7. Prohibiciones

### Anti-Patterns de Lifecycle

**PROHIBIDO 7.1:** NO montar ToastContainerComponent condicionalmente con v-if. DEBE estar siempre montado para evitar pérdida de toasts.

**PROHIBIDO 7.2:** NO olvidar clearTimeout en beforeUnmount. Memory leaks acumulan timers huérfanos.

**PROHIBIDO 7.3:** NO remover toast del Application.ToastList inmediatamente después de handleClose. DEBE esperar animación fade-out (300ms) antes de remoción.

### Anti-Patterns de Timing

**PROHIBIDO 7.4:** NO crear múltiples timers simultáneos. Solo un timer activo por ToastItemComponent; pausar/resumir debe cancelar y recrear single timer.

**PROHIBIDO 7.5:** NO usar duration menor a 1500ms. Mensajes importantes pueden no ser leídos por usuarios.

**PROHIBIDO 7.6:** NO hardcodear delay de animación inconsistente. Delay de setTimeout antes de emit('remove') DEBE coincidir exactamente con CSS transition duration.

### Anti-Patterns de UX

**PROHIBIDO 7.7:** NO bloquear interacción con contenido debajo del toast-container. DEBE usar pointer-events: none en contenedor y pointer-events: all solo en toast items.

**PROHIBIDO 7.8:** NO apilar toasts horizontal. DEBE usar flex-direction: column con gap vertical para stacking limpio.

**PROHIBIDO 7.9:** NO mostrar múltiples toasts del mismo mensaje simultáneamente. ApplicationUIService debe deduplicar si se llama showToast con mismo message dentro de time window.

### Anti-Patterns de Estado

**PROHIBIDO 7.10:** NO mutar props.toast directamente. Toast object es immutable; cambios deben hacerse en Application.ToastList nivel.

**PROHIBIDO 7.11:** NO compartir timers entre múltiples ToastItemComponents. Cada componente gestiona su propio timer independientemente.

---

## 8. Dependencias

### Application Singleton

- `Application.ToastList`: Reactive array (ref<Toast[]>) conteniendo toasts activos. Ubicación: src/models/application.ts línea ~45.
- `Application.ApplicationUIService`: Servicio para gestión de UI con métodos showToast() y closeToast(). Ubicación: src/models/application.ts línea ~180.

### ApplicationUIService Methods

- `showToast(message: string, type: ToastType, duration?: number)`: Crea y agrega toast a ToastList. Default duration 3000ms.
- `closeToast(toastId: string)`: Remueve toast específico de ToastList por ID.

### ToastType Enum

```typescript
enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning'
}
```

Ubicación: src/enums/toast_type.ts. Define tipos visuales de toast con valores string para className mapping.

### UUID Generation

Toast IDs se generan con uuid library o similar: `import { v4 as uuid } from 'uuid'` o implementación custom. ID único evita key conflicts en v-for.

### CSS Classes y Variables

- `--toast-success-gradient`: Gradiente verde para SUCCESS toasts
- `--toast-error-gradient`: Gradiente rojo para ERROR toasts
- `--toast-info-gradient`: Gradiente azul para INFO toasts
- `--toast-warning-gradient`: Gradiente amarillo para WARNING toasts
- `--shadow-medium`: Box-shadow para elevation
- CSS transitions con duration 300ms para fade in/out

Ubicación: src/css/main.css o component-scoped styles

### Icons (GGICONS)

- `GGICONS.CLOSE`: Icono X para botón de cierre. Importado de src/constants/ggicons.ts.

---

## 9. Relaciones

### Relación con BaseEntity CRUD Operations

BaseEntity métodos save(), delete(), y validation errors automáticamente invocan Application.ApplicationUIService.showToast() para feedback usuario. save() exitoso muestra SUCCESS toast "Saved successfully", save() fallido muestra ERROR toast con mensaje de error, delete() exitoso muestra SUCCESS toast "Deleted successfully", validation errors muestran ERROR toast con detalles. Esta integración automática significa que developer NO necesita llamar showToast() manualmente en operation handlers; el framework gestiona feedback automáticamente. Toasts proporcionan confirmación visual inmediata de operaciones asíncronas.

### Relación con LoadingPopupComponent

LoadingPopupComponent y ToastSystem trabajan juntos para feedback completo: LoadingPopup muestra durante operación asíncrona en progreso (blocking overlay con spinner), Toast muestra después de operación completa indicando success/failure (non-blocking notification). Flujo típico: user click Save → LoadingPopup shown → await entity.save() executing → LoadingPopup hidden → Toast shown (SUCCESS o ERROR). LoadingPopup es feedback instantáneo "working...", Toast es feedback final "done". Ambos usan z-index diferenciado: LoadingPopup z-index 10000 (máximo, bloquea TODO), ToastContainer z-index 9999 (alto pero debajo de LoadingPopup).

### Relación con ConfirmationDialogComponent

ConfirmationDialog y Toast tienen roles complementarios: ConfirmationDialog solicita aprobación ANTES de acción crítica (blocking modal, user must respond), Toast proporciona feedback DESPUÉS de acción completada (non-blocking notification, auto-dismiss). Ejemplo: delete flow → ConfirmationDialog "¿Está seguro?" → user click Aceptar → LoadingPopup shown → delete executing → LoadingPopup hidden → Toast "Deleted successfully" shown. Toast NUNCA debe usarse para solicitar confirmación; ese es el rol de ConfirmationDialog. Toast es unidireccional app→user, ConfirmationDialog es bidireccional user↔app.

### Relación con EventBus

Application.eventBus puede disparar toasts mediante eventos custom. Pattern: component o service emite evento 'show-notification' con payload { message, type }, listener global (puede estar en App.vue setup o Application initialization) ejecuta showToast(). Esto permite desacoplar código de dominio de UI logic. Sin embargo, usar ApplicationUIService.showToast() directamente es más simple y directo para mayoría de casos; EventBus approach útil solo cuando múltiples listeners necesitan reaccionar al mismo evento además de mostrar toast.

### Relación con App.vue Root Component

ToastContainerComponent DEBE montarse en App.vue como sibling de ContentComponent:

```vue
<template>
  <div id="app">
    <TopBarComponent />
    <SideBarComponent />
    <ContentComponent />
    <ToastContainerComponent />
    <LoadingPopupComponent />
    <ConfirmationDialogComponent />
  </div>
</template>
```

Esta ubicación asegura que ToastContainer esté siempre presente independientemente de navigation/routing changes. Si se monta en component específico dentro de ContentComponent, toasts se perderían durante navigation. Fixed positioning con z-index alto coloca toasts visualmente sobre todo el contenido aunque estructuralmente sean siblings.

---

## 10. Notas de Implementación

### Normalización Contractual (2026-02-17)

- `ToastItemComponent` debe evitar `!important` en estilos de texto y resolver prioridad por selectores.
- Los estados visuales del toast se mantienen por clases (`toast-success`, `toast-error`, etc.) y tokens de diseño.

### Optimización de Performance con Muchos Toasts

Si aplicación genera many toasts simultáneamente (10+ en ráfaga), considerar limitar cantidad máxima visible. Pattern: Application.ToastList.slice(0, 5) muestra solo los 5 más recientes, older toasts automáticamente removidos. Alternative: implementar queue system donde solo 3-5 toasts se muestran simultáneamente, resto en queue esperando. Demasiados toasts apilados causan clutter visual y degradan UX; toasts deben ser sparse y significativos, no información log continuous.

### Accesibilidad (a11y) Considerations

Para usuarios con screen readers, toasts deben anunciarse. Pattern: agregar `role="alert"` y `aria-live="polite"` al toast-item div. aria-live="polite" anuncia mensaje cuando speech completa current utterance, "assertive" interrumpe inmediatamente (solo para ERROR críticos). aria-atomic="true" asegura que mensaje completo se anuncia. Para toasts auto-dismiss, asegurar sufficient duration (mínimo 3000ms) para que users con disabilities puedan percibir notificación.

### Testing de Toast System

Unit tests deben verificar: showToast() agrega toast a Application.ToastList correctamente, ToastItemComponent monta con props.toast data, timer inicia automáticamente en mounted, pauseDismiss/resume Timer calcula elapsed correctamente, handleClose emite 'remove' event, ToastContainerComponent remueve toast de lista en removeToast(). Usar vitest fake timers: `vi.useFakeTimers()` permite avanzar tiempo artificialmente con `vi.advanceTimersByTime(3000)` verificando auto-dismiss sin esperar real time. Mock Application.ToastList con reactive([]) para isolation.

### Customización de Estilos por Tipo

Cada ToastType tiene gradiente específico definido en CSS. Para customizar colores: override CSS variables en theme o component styles. Example:

```css
.toast-success {
    background: var(--grad-toast-success);
}

.toast-error {
    background: var(--grad-toast-error);
}
```

Mantener contrast ratio mínimo 4.5:1 entre background y texto para legibility según WCAG AA standards. Usar herramientas como WebAIM Contrast Checker para validation.

### Handling de Toasts Durante Navigation

Toasts persisten across navigation porque ToastContainerComponent está montado en App.vue fuera del router-view. Esto es deseable para feedback de operaciones completadas justamente antes de navigation (save → navigate to ListView → toast muestra en nueva vista confirmando save). Si se desea clear toasts en specific navigation event, agregar router.beforeEach guard que ejecuta `Application.ToastList.splice(0, Application.ToastList.length)` clearing array. Sin embargo, generalmente NO clearing is better UX.

### Integración con Undo/Redo System

Para operaciones que soportan undo (soft delete, bulk updates), toast puede incluir botón "Undo" inline. Pattern: toast message "3 items deleted" + button "Undo" que ejecuta revert operation. Esto requiere extender Toast model con optional `undoCallback?: () => void` y renderizar button condicionalmente en template si callback exists. Duration para toasts con undo debe ser mayor (5000-7000ms) dando tiempo suficiente para click undo antes de auto-dismiss.

---

## 11. Referencias Cruzadas

### Componentes Relacionados

- [modal-components.md](modal-components.md): Popup de loading mostrado durante operaciones asíncronas, complementa feedback de toasts.
- [DialogComponents.md](DialogComponents.md): Dialog modal para confirmaciones pre-action, trabaja en secuencia con toast post-action feedback.

### Application y Services

- [../03-application/application-singleton.md](../03-application/application-singleton.md): Documentación de Application.ToastList y Application.ApplicationUIService.
- [../03-application/ui-services.md](../03-application/ui-services.md): Detalles de showToast() y closeToast() methods en ApplicationUIService.

### BaseEntity Integration

- [../02-base-entity/crud-operations.md](../02-base-entity/crud-operations.md): Cómo save() y delete() automáticamente invocan showToast() para feedback.
- [../02-base-entity/validation-system.md](../02-base-entity/validation-system.md): Cómo validation errors disparan ERROR toasts.

### Enums y Constants

- [../05-advanced/Enums.md](../05-advanced/Enums.md): Documentación de ToastType enum con valores SUCCESS, ERROR, INFO, WARNING.

### Styling

- [../../../src/css/main.css](../../../src/css/main.css): CSS variables para toast gradients, shadows, y transitions.

### Guías de Uso

- [../../tutorials/01-basic-crud.md](../../tutorials/01-basic-crud.md): Tutorial mostrando feedback de toasts en operaciones CRUD básicas.
- [../../examples/advanced-module-example.md](../../examples/advanced-module-example.md): Ejemplos de uso de toasts en módulos completos.

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

## Tipos de Toast

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
    background: var(--grad-toast-success-alt);
    color: white;
}

.toast-error {
    background: var(--grad-toast-error-alt);
    color: white;
}

.toast-info {
    background: var(--grad-toast-info);
    color: white;
}

.toast-warning {
    background: var(--grad-toast-warning);
    color: white;
}
```

---

## Sistema de Auto-Dismiss

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

## Ciclo de Vida

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

## Flujo Completo

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

## Animaciones

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

## Uso desde el Código

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

## Características Avanzadas

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

## Consideraciones

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

## Integración con App.vue

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

## Resumen

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
