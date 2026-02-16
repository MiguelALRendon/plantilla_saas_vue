# LoadingScreenComponent

## 1. Propósito

LoadingScreenComponent es un overlay de carga que proporciona feedback visual al usuario durante transiciones entre vistas y operaciones asíncronas. El componente:

- Crea overlay semi-transparente con fondo blanco que cubre el área de contenido
- Muestra mensaje "Loading..." centrado durante operaciones de carga
- Controla visibilidad mediante eventos del eventBus de Application (`show-loading`, `hide-loading`)
- Bloquea interacción del usuario con el contenido subyacente cuando está activo
- Proporciona transiciones suaves de fade in/out con duración de 300ms

Este componente actúa como mecanismo de feedback visual crítico que comunica al usuario que la aplicación está procesando una acción, previniendo interacciones no deseadas y mejorando la experiencia de usuario mediante indicación clara de estados de carga.

**Ubicación del código fuente:** `src/components/LoadingScreenComponent.vue`

**Patrón de diseño:** Overlay Component + Event-Driven Visibility

## 2. Alcance

### Responsabilidades

1. **Control de Visibilidad Reactiva:**
   - Escuchar evento `show-loading` del eventBus y establecer `isActive = true`
   - Escuchar evento `hide-loading` del eventBus y establecer `isActive = false`
   - Actualizar clase CSS `.active` basada en estado `isActive`
   - Registrar listeners en `mounted()` y limpiarlos en `beforeUnmount()`

2. **Renderizado de Overlay:**
   - Renderizar contenedor div con clase `.loading-screen`
   - Aplicar clase `.active` condicionalmente mediante `:class="{ active: isActive }"`
   - Mostrar texto "Loading..." centrado en el overlay
   - Cubrir área completa del ComponentContainer (altura, ancho 100%)

3. **Gestión de Interacción:**
   - Establecer `pointer-events: none` cuando overlay está oculto (isActive = false)
   - Establecer `pointer-events: all` cuando overlay está activo (isActive = true)
   - Bloquear clicks, scroll y cualquier interacción con contenido subyacente durante carga
   - Permitir interacción normal cuando overlay está oculto

4. **Transiciones Visuales:**
   - Aplicar transición CSS `opacity 0.3s ease-in-out` para fade in/out suave
   - Iniciar con `opacity: 0` en estado oculto
   - Animar a `opacity: 1` cuando se activa
   - Animar a `opacity: 0` cuando se desactiva

### Límites

1. **NO controla timing de transiciones** - Solo muestra/oculta cuando recibe eventos, no decide cuándo mostrar
2. **NO emite eventos propios** - Solo reacciona a eventos recibidos del eventBus, no comunica su estado
3. **NO almacena estado de operaciones** - Solo mantiene estado booleano de visibilidad, sin context de qué se está cargando
4. **NO proporciona spinner animado** - Solo muestra texto estático "Loading..." sin animación
5. **NO cubre el TopBar** - Posicionado con `top: 50px` para renderizar solo sobre ComponentContainer
6. **NO gestiona múltiples loadings simultáneos** - Estado binario on/off sin conteo de operaciones concurrentes

## 3. Definiciones Clave

### Conceptos Fundamentales

- **Overlay:** Capa visual posicionada absolutamente que cubre contenido subyacente con fondo semi-opaco, renderizada encima del contenido con z-index alto.

- **isActive:** Propiedad booleana de data que controla visibilidad del overlay. `true` muestra overlay con `opacity: 1` y `pointer-events: all`, `false` oculta con `opacity: 0` y `pointer-events: none`.

- **show-loading Event:** Evento emitido por `Application.eventBus` mediante `ApplicationUIService.showLoadingScreen()`, sin payload, indicando que overlay debe mostrarse.

- **hide-loading Event:** Evento emitido por `Application.eventBus` mediante `ApplicationUIService.hideLoadingScreen()`, sin payload, indicando que overlay debe ocultarse.

- **pointer-events:** Propiedad CSS que controla si elemento puede ser target de eventos de mouse. `none` permite que clicks pasen a través, `all` intercepta todos los eventos.

- **Fade Transition:** Transición CSS de propiedad `opacity` con duración de 300ms y función de timing `ease-in-out`, creando efecto de aparición/desaparición gradual.

### Posicionamiento

LoadingScreenComponent usa `position: absolute` dentro de su contenedor padre (ViewContainer de ComponentContainerComponent):

```css
position: absolute;
top: 50px;              /* Debajo del TopBar */
height: calc(100% - 50px);  /* Altura completa menos TopBar */
width: 100%;            /* Ancho completo */
z-index: 99999;         /* Por encima de todo excepto modales */
```

**top: 50px:** Posiciona overlay debajo del TopBar (altura de 50px), cubriendo solo el ComponentContainer.

**height: calc(100% - 50px):** Calcula altura restando espacio del TopBar, asegurando cobertura exacta del área de contenido.

**z-index: 99999:** Valor muy alto garantiza que overlay esté por encima de todo contenido regular, pero típicamente por debajo de modales (z-index ~100000 o superior).

### Estados Visuales

**Estado Oculto (isActive = false):**
```css
opacity: 0;
pointer-events: none;
```
- Completamente invisible pero aún en DOM
- No intercepta eventos de mouse
- Transición de fade out de 300ms

**Estado Activo (isActive = true):**
```css
opacity: 1;
pointer-events: all;
```
- Completamente visible con fondo blanco
- Bloquea todas las interacciones con contenido subyacente
- Transición de fade in de 300ms

### Template Structure

```vue
<div class="loading-screen" :class="{ active: isActive }">
    Loading...
</div>
```

**Simplicidad:** Template minimalista con un solo div contenedor y texto estático.

**Binding de Clase:** Directiva `:class="{ active: isActive }"` aplica clase `.active` condicionalmente cuando `isActive` es `true`.

**Contenido:** Texto "Loading..." centrado mediante flexbox (`justify-content: center`, `align-items: center`).

## 4. Descripción Técnica

LoadingScreenComponent utiliza Vue Options API:

```vue
<script lang="ts">
import { Application } from '@/models/application';

export default {
    name: 'LoadingScreenComponent',
    data() {
        return {
            Application,
            isActive: false
        }
    },
    mounted() {
        Application.eventBus.on('show-loading', () => {
            this.isActive = true;
        });
        Application.eventBus.on('hide-loading', () => {
            this.isActive = false;
        });
    },
    beforeUnmount() {
        Application.eventBus.off('show-loading');
        Application.eventBus.off('hide-loading');
    }
}
</script>
```

### Data Properties

```typescript
{
    Application: ApplicationClass,  // Referencia al singleton (no se usa en template actualmente)
    isActive: boolean               // Estado de visibilidad del overlay (false por defecto)
}
```

**Application:** Referencia al singleton importado, expuesto en data aunque no se usa directamente en template. Permite acceso desde DevTools para debugging.

**isActive:** Inicializado como `false` para que overlay esté oculto al montar componente. Cambia a `true`/`false` mediante listeners de eventBus.

### Lifecycle Hook: mounted()

```typescript
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;
    });
    Application.eventBus.on('hide-loading', () => {
        this.isActive = false;
    });
}
```

Registra dos listeners en el eventBus al montar componente:

**Listener 1: show-loading**
- Callback: Arrow function que establece `this.isActive = true`
- Efecto: Vue detecta cambio en `isActive` y actualiza binding `:class`, agregando clase `.active`
- Resultado: CSS aplica `opacity: 1` y `pointer-events: all`, mostrando overlay

**Listener 2: hide-loading**
- Callback: Arrow function que establece `this.isActive = false`
- Efecto: Vue detecta cambio en `isActive` y actualiza binding `:class`, removiendo clase `.active`
- Resultado: CSS aplica `opacity: 0` y `pointer-events: none`, ocultando overlay

**Uso de Arrow Functions:** Preservan contexto de `this` para acceso a propiedades de data del componente.

### Lifecycle Hook: beforeUnmount()

```typescript
beforeUnmount() {
    Application.eventBus.off('show-loading');
    Application.eventBus.off('hide-loading');
}
```

Limpia listeners del eventBus antes de desmontar componente:

**CRÍTICO:** Previene memory leaks eliminando referencias a callbacks que podrían mantener componente en memoria incluso después de desmontado.

**eventBus.off():** Remueve todos los listeners para evento especificado. Si no se pasan callbacks específicos, remueve todos los listeners de ese tipo de evento.

**Regla obligatoria:** Todo listener registrado con `eventBus.on()` DEBE tener correspondiente `eventBus.off()` en `beforeUnmount()`.

### Estilos CSS

```css
.loading-screen {
    position: absolute;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    height: calc(100% - 50px);
    width: 100%;
    font-size: 1.5rem;
    top: 50px;
    z-index: 99999;
    background-color: var(--white);
    color: var(--gray);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-in-out;
}

.loading-screen.active {
    opacity: 1;
    pointer-events: all;
}
```

**Análisis por Propiedad:**

- **position: absolute:** Posiciona overlay relativo a su contenedor posicionado más cercano (ViewContainer)
- **display: flex:** Habilita flexbox para centrado del contenido
- **justify-content: center / align-items: center:** Centra texto "Loading..." horizontal y verticalmente
- **box-sizing: border-box:** Incluye padding y border en cálculo de dimensiones
- **height / width:** Cubre área completa del ComponentContainer (100% ancho, altura menos TopBar)
- **font-size: 1.5rem:** Tamaño de fuente grande (24px típicamente) para texto de carga visible
- **top: 50px:** Offset vertical para posicionar debajo del TopBar
- **z-index: 99999:** Valor extremadamente alto para estar encima de todo contenido
- **background-color: var(--white):** Fondo blanco sólido que oculta contenido subyacente
- **color: var(--gray):** Color gris para texto "Loading..."
- **opacity: 0:** Estado inicial invisible
- **pointer-events: none:** Estado inicial sin interceptar eventos
- **transition:** Transición suave de 300ms en cambios de opacity

**Clase .active:**
- **opacity: 1:** Hace visible el overlay
- **pointer-events: all:** Intercepta todos los eventos de mouse, bloqueando interacción con contenido subyacente

### Integración con ApplicationUIService

LoadingScreenComponent NO importa ApplicationUIService directamente. La comunicación ocurre mediante eventBus:

```typescript
// En ApplicationUIService
showLoadingScreen() {
    this.app.eventBus.emit('show-loading');
}

hideLoadingScreen() {
    this.app.eventBus.emit('hide-loading');
}
```

Otras partes del código ejecutan:
```typescript
Application.ApplicationUIService.showLoadingScreen();  // Emite 'show-loading'
Application.ApplicationUIService.hideLoadingScreen();  // Emite 'hide-loading'
```

LoadingScreenComponent escucha estos eventos y reacciona actualizando `isActive`.

## 5. Flujo de Funcionamiento

### Montaje Inicial del Componente

```
1. ComponentContainerComponent se monta y renderiza LoadingScreenComponent
        ↓
2. LoadingScreenComponent.created() se ejecuta (ninguna lógica)
        ↓
3. Template se renderiza inicialmente:
   - <div class="loading-screen"> (sin clase .active)
   - Estilos aplicados: opacity: 0, pointer-events: none
   - Overlay invisible en DOM
        ↓
4. LoadingScreenComponent.mounted() se ejecuta
        ↓
5. Registra listener: Application.eventBus.on('show-loading', callback)
        ↓
6. Registra listener: Application.eventBus.on('hide-loading', callback)
        ↓
7. Componente queda listo, overlay invisible, esperando eventos
```

### Transición de Vista con Loading Screen

```
1. Usuario hace acción que dispara cambio de vista (ej: click en sidebar)
        ↓
2. Application.changeViewToListView(Products) ejecuta
        ↓
3. Application actualiza View.value.component
        ↓
4. Watcher en ComponentContainerComponent detecta cambio
        ↓
5. Watcher ejecuta: Application.ApplicationUIService.showLoadingScreen()
        ↓
6. ApplicationUIService.showLoadingScreen() ejecuta:
   Application.eventBus.emit('show-loading')
        ↓
7. EventBus propaga evento 'show-loading' a todos los listeners
        ↓
8. LoadingScreenComponent recibe evento
        ↓
9. Callback ejecuta: this.isActive = true
        ↓
10. Vue detecta cambio en this.isActive (data property reactiva)
        ↓
11. Vue actualiza DOM, evaluando :class="{ active: isActive }"
        ↓
12. Clase .active se agrega al div: <div class="loading-screen active">
        ↓
13. Navegador aplica estilos .active:
    - opacity cambia de 0 a 1
    - pointer-events cambia de none a all
    - Transición CSS anima cambio durante 300ms
        ↓
14. Usuario ve overlay aparecer con fade in
        ↓
15. [Espera 400ms en ComponentContainerComponent]
        ↓
16. ComponentContainerComponent actualiza currentComponent con markRaw()
        ↓
17. Vue desmonta componente anterior y monta nuevo componente
        ↓
18. ComponentContainerComponent ejecuta:
    Application.ApplicationUIService.hideLoadingScreen()
        ↓
19. ApplicationUIService.hideLoadingScreen() ejecuta:
    Application.eventBus.emit('hide-loading')
        ↓
20. LoadingScreenComponent recibe evento 'hide-loading'
        ↓
21. Callback ejecuta: this.isActive = false
        ↓
22. Vue detecta cambio en this.isActive
        ↓
23. Vue actualiza DOM, removiendo clase .active
        ↓
24. Navegador aplica estilos base:
    - opacity cambia de 1 a 0
    - pointer-events cambia de all a none
    - Transición CSS anima cambio durante 300ms
        ↓
25. Usuario ve overlay desaparecer con fade out
        ↓
26. Nueva vista completamente funcional e interactiva
```

### Operación Asíncrona con Loading Manual

```
1. Código de usuario ejecuta operación asíncrona
        ↓
2. Código ejecuta: Application.ApplicationUIService.showLoadingScreen()
        ↓
3. LoadingScreenComponent recibe 'show-loading' y muestra overlay
        ↓
4. Usuario ve overlay con fade in
        ↓
5. Operación asíncrona (fetch, timeout, etc.) se ejecuta
        ↓
6. Operación completa o falla
        ↓
7. Bloque finally ejecuta:
   Application.ApplicationUIService.hideLoadingScreen()
        ↓
8. LoadingScreenComponent recibe 'hide-loading' y oculta overlay
        ↓
9. Usuario ve overlay con fade out
        ↓
10. UI restaurada a estado interactivo
```

### Desmontaje y Cleanup

```
1. Aplicación navega fuera de vista principal (ej: logout)
        ↓
2. Vue inicia desmontaje de ComponentContainerComponent
        ↓
3. Vue inicia desmontaje de LoadingScreenComponent (hijo)
        ↓
4. beforeUnmount() hook se ejecuta
        ↓
5. Ejecuta Application.eventBus.off('show-loading')
        ↓
6. EventBus elimina referencia al listener de show-loading
        ↓
7. Ejecuta Application.eventBus.off('hide-loading')
        ↓
8. EventBus elimina referencia al listener de hide-loading
        ↓
9. Listeners quedan disponibles para garbage collection
        ↓
10. Componente se desmonta completamente sin memory leaks
```

## 6. Reglas Obligatorias

### Regla 1: Cleanup de Event Listeners Obligatorio
Todo listener registrado con `eventBus.on()` DEBE tener correspondiente `eventBus.off()` en `beforeUnmount()` para prevenir memory leaks.

```typescript
// ✅ CORRECTO
mounted() {
    Application.eventBus.on('show-loading', this.handleShow);
    Application.eventBus.on('hide-loading', this.handleHide);
}
beforeUnmount() {
    Application.eventBus.off('show-loading');
    Application.eventBus.off('hide-loading');
}

// ❌ INCORRECTO - Memory leak
mounted() {
    Application.eventBus.on('show-loading', this.handleShow);
}
// Sin beforeUnmount()
```

### Regla 2: Inicialización de isActive en false
La propiedad `isActive` DEBE inicializarse como `false` para que overlay esté oculto al montar componente.

```typescript
// ✅ CORRECTO
data() {
    return {
        isActive: false
    }
}

// ❌ INCORRECTO - Overlay visible al inicio
data() {
    return {
        isActive: true
    }
}
```

### Regla 3: Posicionamiento con top: 50px
El overlay DEBE posicionarse con `top: 50px` para renderizar debajo del TopBar sin cubrirlo.

```css
/* ✅ CORRECTO */
.loading-screen {
    top: 50px;
    height: calc(100% - 50px);
}

/* ❌ INCORRECTO - Cubre TopBar */
.loading-screen {
    top: 0;
    height: 100%;
}
```

### Regla 4: Z-Index con Token de Overlay
Z-index DEBE usar token de overlay (`var(--z-overlay)`) para mantener consistencia con la jerarquía de capas del sistema.

```css
/* ✅ CORRECTO */
.loading-screen {
    z-index: var(--z-overlay);
}

/* ❌ INCORRECTO - Podría cubrir modales */
.loading-screen {
    z-index: 999999;
}
```

### Regla 5: Transición Solo en opacity
La transición CSS DEBE aplicarse solo a propiedad `opacity`, no a `pointer-events` (pointer-events no es animable).

```css
/* ✅ CORRECTO */
.loading-screen {
    transition: opacity 0.3s ease-in-out;
}

/* ❌ INCORRECTO - pointer-events no es animable */
.loading-screen {
    transition: all 0.3s ease-in-out;  /* Innecesariamente amplio */
}
```

### Regla 6: Pointer Events Controlado por Clase .active
`pointer-events` DEBE establecerse mediante clase `.active`, no modificado directamente en código JavaScript.

```css
/* ✅ CORRECTO - Control mediante CSS */
.loading-screen {
    pointer-events: none;
}
.loading-screen.active {
    pointer-events: all;
}
```

```typescript
// ❌ INCORRECTO - Manipulación directa del DOM
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;
        this.$el.style.pointerEvents = 'all';  // ❌
    });
}
```

### Regla 7: Background Color Opaco
El overlay DEBE tener background color opaco (no transparente) para ocultar completamente contenido subyacente y reducir distracción.

```css
/* ✅ CORRECTO */
.loading-screen {
    background-color: var(--white);  /* Opaco */
}

/* ❌ INCORRECTO - Contenido visible debajo */
.loading-screen {
    background-color: rgba(255, 255, 255, 0.5);  /* Semi-transparente */
}
```

### Regla 8: Box-Sizing Border-Box
DEBE usar `box-sizing: border-box` para cálculos correctos de dimensiones incluyendo padding y border.

```css
/* ✅ CORRECTO */
.loading-screen {
    box-sizing: border-box;
    height: calc(100% - 50px);
}

/* ❌ INCORRECTO - Dimensiones incorrectas */
.loading-screen {
    /* Sin box-sizing especificado */
    height: calc(100% - 50px);
}
```

## 7. Prohibiciones

### Prohibición 1: NO Modificar isActive Directamente Excepto en Listeners
La propiedad `isActive` NO DEBE modificarse directamente en métodos del componente. Solo debe modificarse en callbacks de listeners de eventBus.

```typescript
// ❌ PROHIBIDO
methods: {
    showOverlay() {
        this.isActive = true;  // ❌
    }
}

// ✅ CORRECTO - Solo en listeners
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;  // ✅
    });
}
```

### Prohibición 2: NO Emitir Eventos Propios
LoadingScreenComponent NO DEBE emitir eventos mediante `$emit()` ni eventos personalizados al eventBus. Solo debe reaccionar a eventos recibidos.

```typescript
// ❌ PROHIBIDO
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;
        Application.eventBus.emit('loading-shown');  // ❌
    });
}

// ✅ CORRECTO - Solo reacciona, no emite
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;  // ✅
    });
}
```

### Prohibición 3: NO Agregar Props al Componente
LoadingScreenComponent NO DEBE aceptar props. Todo control debe realizarse mediante eventos del eventBus.

```typescript
// ❌ PROHIBIDO
export default {
    props: {
        visible: Boolean  // ❌
    }
}

// ✅ CORRECTO - Sin props
export default {
    data() {
        return {
            isActive: false  // ✅ Estado interno controlado por eventos
        }
    }
}
```

### Prohibición 4: NO Usar setTimeout para Ocultar Automáticamente
NO implementar lógica de timeout que oculte automáticamente el overlay. El control debe ser explícito mediante `hide-loading` event.

```typescript
// ❌ PROHIBIDO
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;
        setTimeout(() => {
            this.isActive = false;  // ❌ Ocultado automático
        }, 3000);
    });
}

// ✅ CORRECTO - Esperar evento explícito
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;  // ✅
    });
    Application.eventBus.on('hide-loading', () => {
        this.isActive = false;  // ✅
    });
}
```

### Prohibición 5: NO Renderizar Contenido Dinámico
El contenido del overlay NO DEBE ser dinámico (mensajes personalizados, progreso, etc.). Debe mantenerse como texto estático "Loading...".

```vue
<!-- ❌ PROHIBIDO -->
<div class="loading-screen" :class="{ active: isActive }">
    {{ loadingMessage }}  <!-- ❌ Contenido dinámico -->
</div>

<!-- ✅ CORRECTO -->
<div class="loading-screen" :class="{ active: isActive }">
    Loading...  <!-- ✅ Contenido estático -->
</div>
```

### Prohibición 6: NO Modificar Z-Index Dinámicamente
Z-index DEBE ser constante definido en CSS, NO modificado dinámicamente mediante JavaScript.

```typescript
// ❌ PROHIBIDO
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;
        this.$el.style.zIndex = '100000';  // ❌
    });
}

// ✅ CORRECTO - Z-index estático en CSS
```

```css
.loading-screen {
    z-index: 99999;  /* ✅ Constante */
}
```

### Prohibición 7: NO Mantener Contador de Operaciones
NO implementar lógica de conteo para múltiples operaciones de loading simultáneas. El componente debe ser binario (visible/oculto).

```typescript
// ❌ PROHIBIDO
data() {
    return {
        loadingCount: 0  // ❌
    }
},
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.loadingCount++;  // ❌
        this.isActive = this.loadingCount > 0;
    });
}

// ✅ CORRECTO - Estado binario simple
data() {
    return {
        isActive: false  // ✅
    }
},
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;  // ✅
    });
}
```

### Prohibición 8: NO Cubrir el TopBar
El overlay NO DEBE cubrir el TopBar. Debe posicionarse con `top: 50px` para renderizar solo sobre ComponentContainer.

```css
/* ❌ PROHIBIDO - Cubre TopBar */
.loading-screen {
    top: 0;
    height: 100%;
}

/* ✅ CORRECTO - Solo sobre ComponentContainer */
.loading-screen {
    top: 50px;
    height: calc(100% - 50px);
}
```

## 8. Dependencias

### Dependencias de Application

```typescript
import { Application } from '@/models/application';
```

LoadingScreenComponent depende de una parte específica de Application:

**Application.eventBus:** Instancia de mitt para pub/sub:
- `eventBus.on('show-loading', callback)` - Suscribe listener para mostrar overlay
- `eventBus.on('hide-loading', callback)` - Suscribe listener para ocultar overlay
- `eventBus.off('show-loading')` - Desuscribe listener de show-loading en cleanup
- `eventBus.off('hide-loading')` - Desuscribe listener de hide-loading en cleanup

**NO depende de:**
- Application.View
- Application.ModuleList
- Application.ApplicationUIService (indirectamente conectado mediante eventBus)

### Dependencias de CSS Variables

```css
background-color: var(--white);  /* Color de fondo del overlay */
color: var(--gray);              /* Color del texto "Loading..." */
```

Estas variables ya están definidas en `src/css/constants.css` como parte del design system tokenizado del framework. Usar directamente sin redefinición local.

### Dependencias Implícitas

1. **ApplicationUIService:** Aunque no importado directamente, LoadingScreenComponent depende implícitamente de ApplicationUIService para emitir eventos `show-loading` y `hide-loading` mediante:
   - `ApplicationUIService.showLoadingScreen()` → emite 'show-loading'
   - `ApplicationUIService.hideLoadingScreen()` → emite 'hide-loading'

2. **ComponentContainerComponent:** Depende de LoadingScreenComponent para feedback visual durante transiciones. ComponentContainerComponent ejecuta showLoadingScreen/hideLoadingScreen en su watcher.

3. **mitt EventBus:** Depende de la implementación de mitt (eventBus de Application) para mecanismo pub/sub. Compatibilidad con API de mitt (on, off, emit).

### Jerarquía de Renderizado

LoadingScreenComponent se renderiza dentro de ComponentContainerComponent:

```vue
<!-- ComponentContainerComponent.vue -->
<div class="ViewContainer">
    <TopBarComponent />
    <div class="ComponentContainer">
        <ActionsComponent />
        <component :is="currentComponent" />
    </div>
    <LoadingScreenComponent />  <!-- Hijo de ViewContainer -->
</div>
```

**Relación:** LoadingScreenComponent es hermano de TopBarComponent y ComponentContainer, todos hijos de ViewContainer.

**Posicionamiento:** `position: absolute` dentro de ViewContainer (que tiene `position: relative`).

## 9. Relaciones

### Relación con Application (1:1 Reactiva mediante EventBus)

LoadingScreenComponent tiene relación 1:1 reactiva con Application mediante eventBus:

```
LoadingScreenComponent (1) ──► (1) Application.eventBus
                                   │
                                   ├── on('show-loading', callback)
                                   ├── on('hide-loading', callback)
                                   ├── off('show-loading')
                                   └── off('hide-loading')
```

- **Dirección de flujo:** Unidireccional desde eventBus hacia LoadingScreenComponent
- **Tipo de relación:** Pub/Sub mediante listeners de eventos
- **Acoplamiento:** Bajo - LoadingScreenComponent solo conoce nombres de eventos, no quién los emite
- **Sincronización:** Asíncrona mediante eventos emitidos por eventBus

### Relación con ApplicationUIService (1:1 Indirecta)

LoadingScreenComponent tiene relación indirecta con ApplicationUIService:

```
LoadingScreenComponent (1) ◄── Application.eventBus ◄── (1) ApplicationUIService
                                   'show-loading'            showLoadingScreen()
                                   'hide-loading'            hideLoadingScreen()
```

- **Dirección de flujo:** Unidireccional desde ApplicationUIService hacia LoadingScreenComponent
- **Tipo de relación:** Command mediante eventos (ApplicationUIService ordena, LoadingScreenComponent ejecuta)
- **Acoplamiento:** Nulo - Ambos desconocen existencia del otro, comunican mediante eventBus
- **Patrón:** Desacoplamiento mediante Event Bus pattern

### Relación con ComponentContainerComponent (1:1 Layout + Coordinación)

LoadingScreenComponent y ComponentContainerComponent tienen relación dual:

**Relación de Layout:**
```
ComponentContainerComponent (ViewContainer) (1)
    ├── TopBarComponent
    ├── ComponentContainer (div)
    └── LoadingScreenComponent (1) ← Hijo posicionado absolutamente
```

**Relación de Coordinación:**
```
ComponentContainerComponent (1) ──► ApplicationUIService.showLoadingScreen()
                                          ↓
                                    eventBus.emit('show-loading')
                                          ↓
                                    LoadingScreenComponent (1) recibe y muestra
```

- **Dirección de flujo:** Unidireccional ComponentContainer → LoadingScreen (mediante eventos)
- **Tipo de relación:** Parent-Child (layout) + Command (coordinación de transiciones)
- **Acoplamiento:** Medio - LoadingScreen depende de dimensiones de ViewContainer para posicionamiento
- **Propósito:** ComponentContainer orquesta transiciones usando LoadingScreen para feedback visual

### Relación con Operaciones Asíncronas (N:1 Evento)

Cualquier parte del código puede disparar show/hide de LoadingScreenComponent:

```
[Operación Asíncrona 1] ──┐
[Operación Asíncrona 2] ──┤
[Operación Asíncrona 3] ──┼──► ApplicationUIService
                          │           ↓
                          │     eventBus.emit()
                          │           ↓
                          └──► LoadingScreenComponent (1)
```

- **Dirección de flujo:** N operaciones → 1 LoadingScreenComponent
- **Tipo de relación:** Muchos-a-Uno mediante eventos compartidos
- **Coordinación:** Primera operación muestra, última operación oculta (sin conteo automático)
- **Limitación:** No maneja correctamente loading de múltiples operaciones concurrentes

### Diagrama de Relaciones Completo

```
┌──────────────────────────────────────────────────────────┐
│         ComponentContainerComponent                      │
│              (ViewContainer)                             │
│                                                          │
│  ┌────────────────┐  ┌───────────────────────────────┐  │
│  │ TopBarComponent│  │  ComponentContainer (div)     │  │
│  │  (50px altura) │  │                               │  │
│  └────────────────┘  │  ┌─────────────────────────┐  │  │
│                      │  │ ActionsComponent        │  │  │
│  ┌─────────────────────────────────────────────┐  │  │  │
│  │ LoadingScreenComponent                      │  │  │  │
│  │  (position: absolute, top: 50px)            │  │  │  │
│  │  ┌───────────────────────────────────────┐  │  │  │  │
│  │  │  isActive: boolean                    │  │  │  │  │
│  │  │  - Escucha 'show-loading'             │  │  │  │  │
│  │  │  - Escucha 'hide-loading'             │  │  │  │  │
│  │  └───────────────────────────────────────┘  │  │  │  │
│  └────────────┬────────────────────────────────┘  │  │  │
│               │ escucha eventos                   │  │  │
│               ↓                                   │  │  │
│  ┌──────────────────────────────────────────────────────┤
│  │          Application.eventBus                 │  │  │
│  │  emit('show-loading')                         │  │  │
│  │  emit('hide-loading')                         │  │  │
│  └────────────┬──────────────────────────────────┘  │  │
│               │ emite eventos                       │  │
│               ↑                                     │  │
│  ┌────────────┴────────────────────────────────────────┤
│  │    ApplicationUIService                        │  │
│  │  - showLoadingScreen()                         │  │
│  │  - hideLoadingScreen()                         │  │
│  └────────────┬──────────────────────────────────┘  │  │
│               │ llama desde                         │  │
│               ↑                                     │  │
│  ┌────────────┴────────────────────────────────────────┤
│  │  Watcher: Application.View.component           │  │
│  │  Operaciones asíncronas                        │  │
│  │  CRUD operations                               │  │
│  │  Cambios de vista                              │  │
│  └─────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────┘
```

## 10. Notas de Implementación

### Nota 1: Contenido Estático vs Spinner Animado

Actualmente LoadingScreenComponent muestra solo texto "Loading..." sin animación. Para aplicaciones con cargas largas, considerar agregar spinner:

```vue
<div class="loading-screen" :class="{ active: isActive }">
    <div class="spinner"></div>
    <span>Loading...</span>
</div>
```

```css
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--gray-lighter);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

### Nota 2: Diferencia con LoadingPopupComponent

El framework puede tener dos componentes de loading diferentes:

**LoadingScreenComponent:**
- Uso: Transiciones de vista en ComponentContainer
- Posición: Absolute dentro de ViewContainer
- Eventos: `show-loading`, `hide-loading`
- Alcance: Solo área de ComponentContainer (no cubre TopBar)

**LoadingPopupComponent (si existe):**
- Uso: Operaciones asíncronas específicas (guardar, eliminar, etc.)
- Posición: Fixed fullscreen
- Eventos: `show-loading-menu`, `hide-loading-menu`
- Alcance: Full viewport incluyendo TopBar

**NO confundir:** Son componentes separados con propósitos distintos.

### Nota 3: Memory Leaks y Event Listeners

El patrón de cleanup es crítico:

```typescript
// ✅ CORRECTO - Previene memory leaks
beforeUnmount() {
    Application.eventBus.off('show-loading');
    Application.eventBus.off('hide-loading');
}
```

**Sin cleanup:** Si componente se monta/desmonta múltiples veces (ej: navegación entre layouts diferentes), cada montaje crea nuevos listeners sin eliminar los anteriores, causando:
- Memory leaks (callbacks en memoria)
- Listeners duplicados (callback ejecutado múltiples veces)
- Performance degradada

### Nota 4: Timing de Transiciones

La transición CSS de 300ms está calibrada con delay de 400ms en ComponentContainerComponent:

```
showLoadingScreen() → 0ms: Loading aparece
                 → 300ms: Loading completamente visible (fade in completo)
                 → 400ms: Cambio de componente ocurre
hideLoadingScreen() → 400ms: Loading empieza a desaparecer
                 → 700ms: Loading completamente oculto (fade out completo)
```

**Total visibilidad:** ~700ms proporciona feedback visual adecuado sin ser molesto.

### Nota 5: Z-Index Strategy de la Aplicación

Estrategia de z-index recomendada:

```
0-9:     Contenido regular
10-99:   Sidebar, TopBar (z-index: 1)
100-999: Dropdowns, tooltips
1000-99999: Loading screens (z-index: 99999)
100000+: Modales full-screen, alerts críticos
```

LoadingScreenComponent con z-index: 99999 está en rango correcto para overlays de carga.

### Nota 6: Testing y Mocking

Para testing de LoadingScreenComponent:

```typescript
import { mount } from '@vue/test-utils';
import LoadingScreenComponent from '@/components/LoadingScreenComponent.vue';
import { Application } from '@/models/application';

describe('LoadingScreenComponent', () => {
    it('muestra overlay al recibir show-loading', async () => {
        const wrapper = mount(LoadingScreenComponent);
        expect(wrapper.classes()).not.toContain('active');
        
        Application.eventBus.emit('show-loading');
        await wrapper.vm.$nextTick();
        
        expect(wrapper.classes()).toContain('active');
    });
    
    it('oculta overlay al recibir hide-loading', async () => {
        const wrapper = mount(LoadingScreenComponent);
        wrapper.vm.isActive = true;
        await wrapper.vm.$nextTick();
        
        Application.eventBus.emit('hide-loading');
        await wrapper.vm.$nextTick();
        
        expect(wrapper.vm.isActive).toBe(false);
    });
    
    it('limpia listeners en beforeUnmount', () => {
        const offSpy = vi.spyOn(Application.eventBus, 'off');
        const wrapper = mount(LoadingScreenComponent);
        
        wrapper.unmount();
        
        expect(offSpy).toHaveBeenCalledWith('show-loading');
        expect(offSpy).toHaveBeenCalledWith('hide-loading');
    });
});
```

### Nota 7: Alternativa con Composition API

Si se migra a Composition API (script setup):

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Application } from '@/models/application';

const isActive = ref(false);

const handleShowLoading = () => {
    isActive.value = true;
};

const handleHideLoading = () => {
    isActive.value = false;
};

onMounted(() => {
    Application.eventBus.on('show-loading', handleShowLoading);
    Application.eventBus.on('hide-loading', handleHideLoading);
});

onBeforeUnmount(() => {
    Application.eventBus.off('show-loading', handleShowLoading);
    Application.eventBus.off('hide-loading', handleHideLoading);
});
</script>
```

**Ventaja:** Named functions facilitan cleanup preciso pasando mismas referencias a off().

### Nota 8: Accesibilidad (a11y)

Para mejorar accesibilidad:

```vue
<div 
    class="loading-screen" 
    :class="{ active: isActive }"
    role="alert"
    aria-live="assertive"
    :aria-busy="isActive"
>
    <span aria-label="Loading content">Loading...</span>
</div>
```

- **role="alert":** Indica a lectores de pantalla que es notificación importante
- **aria-live="assertive":** Lectores anuncian cambios inmediatamente
- **aria-busy:** Estado que indica carga en progreso

### Nota 9: Performance con Múltiples Show/Hide Rápidos

Si múltiples operaciones llaman showLoadingScreen/hideLoadingScreen rápidamente:

```typescript
showLoadingScreen()  // isActive = true
hideLoadingScreen()  // isActive = false (50ms después)
showLoadingScreen()  // isActive = true (inmediatamente)
```

Vue maneja estos cambios eficientemente mediante su sistema de reactividad, batching updates en el mismo tick. Sin embargo, para operaciones muy rápidas, considerar debouncing:

```typescript
// En ApplicationUIService
private loadingDebounce: any = null;

showLoadingScreen() {
    clearTimeout(this.loadingDebounce);
    this.app.eventBus.emit('show-loading');
}

hideLoadingScreen() {
    clearTimeout(this.loadingDebounce);
    this.loadingDebounce = setTimeout(() => {
        this.app.eventBus.emit('hide-loading');
    }, 100);  // 100ms delay para evitar flicker
}
```

### Nota 10: Contenido Personalizado (Extensión Futura)

Si se requiere contenido personalizado en futuro:

```vue
<div class="loading-screen" :class="{ active: isActive }">
    <slot>
        Loading...  <!-- Default si no hay slot -->
    </slot>
</div>
```

Permite personalización desde ComponentContainerComponent:

```vue
<LoadingScreenComponent>
    <div class="custom-loading">
        <img src="/spinner.gif" alt="Loading" />
        <p>Please wait...</p>
    </div>
</LoadingScreenComponent>
```

**Nota:** LoadingScreenComponent no incluye slots en su implementación.

## 11. Referencias Cruzadas

### Documentos Relacionados en Copilot

- **[ComponentContainerComponent.md](ComponentContainerComponent.md):** Documenta el contenedor principal que renderiza LoadingScreenComponent como hijo y orquesta su visibilidad durante transiciones de vista.

- **[core-components.md](core-components.md):** Documenta los componentes core del framework, incluyendo LoadingScreenComponent como componente de infraestructura.

- **[../03-application/application-singleton.md](../03-application/application-singleton.md):** Documenta el singleton Application con eventBus utilizado por LoadingScreenComponent para escuchar eventos.

- **[../03-application/event-bus.md](../03-application/event-bus.md):** Documenta el sistema de eventos mitt con eventos `show-loading` y `hide-loading` utilizados por LoadingScreenComponent.

- **[../03-application/ui-services.md](../03-application/ui-services.md):** Documenta ApplicationUIService con métodos `showLoadingScreen()` y `hideLoadingScreen()` que emiten eventos escuchados por LoadingScreenComponent.

### Archivos de Código Relacionados

- **`src/components/LoadingScreenComponent.vue`:** Archivo fuente implementando el componente documentado.

- **`src/models/application.ts`:** Implementación del singleton Application con eventBus utilizado para pub/sub.

- **`src/components/ComponentContainerComponent.vue`:** Componente padre que renderiza LoadingScreenComponent y ejecuta showLoadingScreen/hideLoadingScreen durante transiciones.

- **`src/css/constants.css`:** Definición de variables CSS utilizadas por LoadingScreenComponent (--white, --gray).

### Flujos de Integración

LoadingScreenComponent participa en los siguientes flujos documentados:

1. **Flujo de Transición de Vista:** Documentado en [ComponentContainerComponent.md](ComponentContainerComponent.md). LoadingScreen muestra overlay durante cambio de componente dinámico.

2. **Flujo de Event Bus:** Documentado en [../03-application/event-bus.md](../03-application/event-bus.md). LoadingScreen suscribe listeners a eventos show-loading y hide-loading.

3. **Flujo de UI Services:** Documentado en [../03-application/ui-services.md](../03-application/ui-services.md). ApplicationUIService emite eventos que LoadingScreen escucha.

### Eventos Relacionados

- **show-loading:** Emitido por `ApplicationUIService.showLoadingScreen()`, escuchado por LoadingScreenComponent para mostrar overlay.

- **hide-loading:** Emitido por `ApplicationUIService.hideLoadingScreen()`, escuchado por LoadingScreenComponent para ocultar overlay.

### Componentes Relacionados

- **LoadingPopupComponent (si existe):** Componente similar pero para operaciones específicas con eventos `show-loading-menu` y `hide-loading-menu`, posicionamiento fixed fullscreen.

- **TopBarComponent:** Componente hermano en layout, LoadingScreen posicionado debajo del TopBar con `top: 50px`.

- **ActionsComponent:** Componente renderizado dentro de ComponentContainer, cubierto por LoadingScreen cuando está activo.
