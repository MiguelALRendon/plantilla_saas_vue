# ComponentContainerComponent

## 1. Propósito

ComponentContainerComponent es el contenedor principal que orquesta el renderizado dinámico de todas las vistas del framework. Actúa como el componente raíz de la aplicación que:

- Renderiza dinámicamente el componente de vista actual obtenido de `Application.View.value.component`
- Gestiona transiciones visuales entre diferentes vistas mediante pantallas de carga
- Integra componentes de infraestructura fijos (TopBarComponent, ActionsComponent, LoadingScreenComponent)
- Proporciona un contenedor con su propio contexto de scroll para vistas dinámicas

Este componente implementa el patrón Container Component con renderizado dinámico mediante la directiva `:is` de Vue, eliminando la necesidad de definir rutas estáticas para cada vista del sistema.

**Ubicación del código fuente:** `src/components/ComponentContainerComponent.vue`

**Patrón de diseño:** Container Component + Dynamic Component Rendering

## 2. Alcance

### Responsabilidades

1. **Renderizado Dinámico:**
   - Observar cambios en `Application.View.value.component`
   - Actualizar `currentComponent` con el componente de vista a renderizar
   - Utilizar `markRaw()` para optimizar componentes dinámicos
   - Renderizar el componente mediante directiva `:is`

2. **Gestión de Transiciones:**
   - Mostrar LoadingScreenComponent antes de cambiar componente
   - Aplicar delay de 400ms para feedback visual al usuario
   - Ocultar LoadingScreenComponent tras completar transición
   - Garantizar experiencia de usuario fluida

3. **Integración de Componentes de Infraestructura:**
   - Renderizar TopBarComponent con título y breadcrumbs
   - Renderizar ActionsComponent con botones flotantes
   - Renderizar LoadingScreenComponent como overlay
   - Mantener componentes fijos independientes de vista dinámica

4. **Gestión de Scroll:**
   - Proporcionar contenedor con scroll interno independiente
   - Calcular altura máxima restando espacio del TopBar (50px)
   - Aislar scroll de cada vista para mejor UX
   - Aplicar padding y border-radius al contenedor

### Límites

1. **NO renderiza componentes de forma imperativa** - Solo mediante observación reactiva de `Application.View`
2. **NO gestiona lógica de negocio de vistas** - Solo actúa como contenedor sin intervenir en comportamiento de componentes hijos
3. **NO controla navegación** - Delega decisiones de cambio de vista a Application y router
4. **NO almacena estado de vistas** - Es stateless respecto a datos de entidades
5. **NO maneja eventos de componentes hijos** - Los componentes dinámicos son autónomos
6. **NO proporciona estado compartido entre vistas** - Cada vista accede a Application independientemente

## 3. Definiciones Clave

### Conceptos Fundamentales

- **currentComponent:** Referencia al componente Vue que se está renderizando actualmente, marcado con `markRaw()` para evitar seguimiento reactivo profundo de sus propiedades internas.

- **markRaw():** Función de Vue que marca objetos como no reactivos, evitando que Vue haga tracking profundo de propiedades internas. Esencial para optimizar performance con componentes dinámicos que son objetos complejos.

- **Component:** Tipo de TypeScript importado de Vue que representa la definición de un componente Vue (objeto con template, setup, data, methods, etc.).

- **Watcher:** Mecanismo reactivo de Vue mediante función `watch()` que observa cambios en una fuente reactiva y ejecuta callback cuando detecta modificaciones.

- **Dynamic Component Rendering:** Patrón de Vue que permite renderizar componentes determinados en runtime mediante la directiva `:is`, permitiendo cambiar el componente sin modificar el template.

- **ViewContainer:** Elemento div que actúa como contenedor principal flex vertical con altura 100vh para toda la interfaz de usuario.

- **ComponentContainer:** Elemento div con scroll interno que encapsula el componente dinámico, calculando altura máxima para compensar espacio ocupado por TopBar.

### Componentes Relacionados

- **TopBarComponent:** Componente fijo que muestra título del módulo, breadcrumbs y controles globales en la parte superior.

- **ActionsComponent:** Componente flotante que renderiza botones de acción según `Application.ListButtons.value`.

- **LoadingScreenComponent:** Overlay que muestra indicador de carga durante transiciones de vista.

- **Application.View:** Objeto reactivo Ref que contiene propiedades de vista actual (component, viewType, entityClass, title, etc.).

### Constantes y Variables

```typescript
{
    currentComponent: Component | null,  // Componente dinámico actual renderizado
    GGICONS: object,                     // Objeto importado con constantes de iconos
    GGCLASS: string                      // Clase CSS base para iconos gg-icons
}
```

## 4. Descripción Técnica

ComponentContainerComponent utiliza Vue Options API con TypeScript para implementar el contenedor dinámico:

```vue
<template>
    <div class="ViewContainer">
        <TopBarComponent />
        <div class="ComponentContainer">
            <ActionsComponent />
            <component 
                v-if="currentComponent" 
                :is="currentComponent"
            />
        </div>
        <LoadingScreenComponent />
    </div>
</template>

<script lang="ts">
import { Component, markRaw, watch } from 'vue';
import LoadingScreenComponent from './LoadingScreenComponent.vue';
import TopBarComponent from './TopBarComponent.vue';
import Application from '@/models/application';
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import ActionsComponent from './ActionsComponent.vue';

export default {
    name: 'ComponentContainerComponent',
    components: {
        TopBarComponent, LoadingScreenComponent, ActionsComponent
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
                        currentComponent: null as Component | null,
        };
    },
    created() {
        const init = Application.View.value.component;
        if (init) {
            this.currentComponent = markRaw(init);
        }

        watch(() => Application.View.value.component, async (newVal: Component | null) => {
            if (newVal) {
                Application.ApplicationUIService.showLoadingScreen();
                await new Promise(resolve => setTimeout(resolve, 400));
                this.currentComponent = markRaw(newVal);
                Application.ApplicationUIService.hideLoadingScreen();
            }
        });
    }
}
</script>
```

### Estructura del Template

El template define jerarquía de componentes fijos y dinámicos:

1. **ViewContainer (div raíz):**
   - Display flex con dirección columna vertical
   - Altura 100vh con padding lateral y bottom
   - Z-index 1 para posicionamiento de overlays
   - Background color blanco

2. **TopBarComponent:**
   - Componente fijo en parte superior
   - Altura aproximada 50px
   - Independiente de vista dinámica

3. **ComponentContainer (div intermedio):**
   - Contenedor con scroll interno
   - Altura calculada: `calc(100vh - 50px)`
   - Background gris claro con border-radius
   - Padding interno para separación visual

4. **ActionsComponent:**
   - Componente flotante dentro de ComponentContainer
   - Posicionado de forma flotante (position absolute mediante CSS de ActionsComponent)

5. **Component Dinámico:**
   - Renderizado mediante directiva `:is="currentComponent"`
   - Condicional `v-if="currentComponent"` para evitar errores si es null
   - Cambia reactivamente cuando `currentComponent` se actualiza

6. **LoadingScreenComponent:**
   - Overlay posicionado absolutamente sobre ViewContainer
   - Se muestra/oculta mediante estado interno reactivo del componente
   - Visible durante transiciones de vista

### Inicialización en created()

El hook `created()` ejecuta lógica de inicialización:

```typescript
created() {
    // 1. Obtener componente inicial de Application.View
    const init = Application.View.value.component;
    
    // 2. Si existe componente inicial, asignarlo con markRaw()
    if (init) {
        this.currentComponent = markRaw(init);
    }

    // 3. Configurar watcher para cambios posteriores
    watch(() => Application.View.value.component, async (newVal: Component | null) => {
        if (newVal) {
            // 4. Mostrar loading overlay
            Application.ApplicationUIService.showLoadingScreen();
            
            // 5. Delay de 400ms para feedback visual
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // 6. Actualizar currentComponent con markRaw()
            this.currentComponent = markRaw(newVal);
            
            // 7. Ocultar loading overlay
            Application.ApplicationUIService.hideLoadingScreen();
        }
    });
}
```

**Paso 1:** Lee el componente inicial de `Application.View.value.component` para el renderizado inicial.

**Paso 2:** Si existe componente inicial (navegación directa a URL), lo asigna a `currentComponent` con `markRaw()` para optimizar performance.

**Paso 3:** Configura watcher con arrow function `() => Application.View.value.component` como fuente reactiva observada.

**Paso 4:** Cuando detecta cambio, muestra LoadingScreenComponent mediante `showLoadingScreen()` del ApplicationUIService.

**Paso 5:** Espera 400ms mediante `Promise` + `setTimeout` para dar feedback visual al usuario (transición perceptible).

**Paso 6:** Actualiza `currentComponent` con nuevo componente marcado con `markRaw()`, provocando re-renderizado.

**Paso 7:** Oculta LoadingScreenComponent mediante `hideLoadingScreen()` del ApplicationUIService.

### Optimización con markRaw()

La función `markRaw()` es crítica para performance:

```typescript
this.currentComponent = markRaw(newVal);
```

**Problema sin markRaw():** Los componentes Vue son objetos complejos con muchas propiedades internas (template compilado, watchers, lifecycle hooks, etc.). Vue por defecto haría seguimiento reactivo profundo de todas estas propiedades, generando overhead innecesario.

**Solución con markRaw():** Marca el componente como no reactivo, indicando a Vue que NO debe hacer tracking de propiedades internas. Solo se observa la referencia al componente, no sus entrañas.

**Beneficios:**
- Reducción significativa de uso de memoria
- Aceleración del proceso de renderizado
- Prevención de efectos secundarios por seguimiento no necesario

**Regla obligatoria:** Siempre usar `markRaw()` con componentes dinámicos en directiva `:is`.

### Estilos CSS

```css
.ViewContainer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    position: relative;
    z-index: 1;
    padding-bottom: 0.5rem;
    padding-right: 0.5rem;
    box-sizing: border-box;
    background-color: var(--white);
}

.ComponentContainer {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 50px);  /* Resta altura de TopBar */
    overflow: auto;                  /* Scroll interno */
    padding-top: 1rem;
    padding-inline: 1rem;
    padding-bottom: 2rem;
    position: relative;
    background-color: var(--bg-gray);
    border-radius: var(--border-radius);
    box-sizing: border-box;
}
```

**ViewContainer:** Utiliza flexbox columna con altura máxima 100vh para ocupar viewport completo. Position relative necesario para que overlays posicionados absolutamente (LoadingScreen) se posicionen respecto a este contenedor.

**ComponentContainer:** Utiliza `calc(100vh - 50px)` para restar espacio ocupado por TopBar. Overflow auto proporciona scroll vertical cuando contenido excede altura disponible. Background gris claro con border-radius para diferenciación visual del contenido dinámico.

## 5. Flujo de Funcionamiento

### Montaje Inicial de la Aplicación

```
1. Usuario accede a URL (ej: /products)
        ↓
2. Router detecta ruta y ejecuta beforeEach guard
        ↓
3. Guard resuelve moduleClass (Products) desde params.module
        ↓
4. Guard llama Application.changeViewToListView(Products)
        ↓
5. Application actualiza View.value.component = DefaultListView
        ↓
6. Router renderiza ComponentContainerComponent
        ↓
7. ComponentContainerComponent.created() se ejecuta
        ↓
8. Lee Application.View.value.component (DefaultListView)
        ↓
9. Asigna currentComponent = markRaw(DefaultListView)
        ↓
10. Configura watcher para cambios futuros
        ↓
11. Vue renderiza template con <component :is="currentComponent" />
        ↓
12. DefaultListView se monta y ejecuta su lógica
        ↓
13. TopBar, Actions y Loading también se montan
```

### Cambio de Vista Durante Ejecución

```
1. Usuario hace click en item del sidebar (ej: "Configuración")
        ↓
2. SideBarItemComponent.setNewView() ejecuta:
   Application.changeViewToDefaultView(Configuration)
        ↓
3. Application.changeView() actualiza View.value con:
   - component: DefaultComponentView
   - viewType: VIEW_TYPE.DEFAULT_COMPONENT_VIEW
   - entityClass: Configuration
   - title: Configuration.getModuleName()
        ↓
4. Application.updateRouterFromView() llama router.push('/configuration')
        ↓
5. Router navega SIN ejecutar beforeEach (evita loop)
        ↓
6. Watcher en ComponentContainerComponent detecta cambio en:
   Application.View.value.component
        ↓
7. Callback del watcher ejecuta:
   Application.ApplicationUIService.showLoadingScreen()
        ↓
8. LoadingScreenComponent se vuelve visible (overlay)
        ↓
9. await new Promise(setTimeout 400ms)
        ↓
10. this.currentComponent = markRaw(DefaultComponentView)
        ↓
11. Vue detecta cambio en currentComponent
        ↓
12. Vue desmonta componente anterior (DefaultListView)
        ↓
13. Vue monta nuevo componente (DefaultComponentView)
        ↓
14. DefaultComponentView.created() y mounted() se ejecutan
        ↓
15. Application.ApplicationUIService.hideLoadingScreen()
        ↓
16. LoadingScreenComponent se oculta con fade out
```

### Navegación por URL Directa

```
1. Usuario ingresa URL directamente (ej: /products/123)
        ↓
2. Router ejecuta beforeEach guard
        ↓
3. Guard resuelve moduleClass = Products
        ↓
4. Guard verifica params.oid = '123'
        ↓
5. Guard ejecuta Products.fetchInstance(123)
        ↓
6. Guard llama Application.changeViewToDetailView(Products, instance)
        ↓
7. Application actualiza View.value.component = DefaultDetailView
        ↓
8. Router renderiza ComponentContainerComponent (primer render)
        ↓
9. ComponentContainerComponent.created() ejecuta
        ↓
10. Lee Application.View.value.component = DefaultDetailView
        ↓
11. Asigna currentComponent = markRaw(DefaultDetailView)
        ↓
12. NO ejecuta watcher porque es asignación inicial (no cambio)
        ↓
13. Vue renderiza DefaultDetailView con instancia cargada
```

### Transición con Loading Screen

```
[Estado: Vista A visible]
        ↓
Application.View.value.component cambia a Vista B
        ↓
Watcher detecta cambio
        ↓
[T+0ms] showLoadingScreen() ejecuta
        ↓
LoadingScreenComponent emite evento 'show-loading'
        ↓
LoadingScreenComponent.isVisible = true
        ↓
Overlay se vuelve visible con fade in
        ↓
[T+400ms] setTimeout completa
        ↓
currentComponent = markRaw(Vista B)
        ↓
Vue desmonta Vista A
        ↓
Vue monta Vista B
        ↓
hideLoadingScreen() ejecuta
        ↓
LoadingScreenComponent emite evento 'hide-loading'
        ↓
LoadingScreenComponent.isVisible = false
        ↓
Overlay se oculta con fade out
        ↓
[Estado: Vista B visible]
```

## 6. Reglas Obligatorias

### Regla 1: markRaw() en Componentes Dinámicos
Todo componente asignado a `currentComponent` DEBE pasar por `markRaw()` para optimizar performance. Nunca asignar componente directamente sin esta función.

```typescript
// ❌ INCORRECTO
this.currentComponent = newComponent;

// ✅ CORRECTO
this.currentComponent = markRaw(newComponent);
```

### Regla 2: Watcher Observa Solo Application.View.component
El watcher DEBE observar únicamente `Application.View.value.component`, no otras propiedades de View. Cambios en `viewType`, `entityClass` o `title` NO deben disparar cambio de componente.

```typescript
// ✅ CORRECTO
watch(() => Application.View.value.component, callback);

// ❌ INCORRECTO - Observa objeto completo
watch(() => Application.View.value, callback);
```

### Regla 3: Delay de 400ms es Obligatorio
El delay de 400ms durante transiciones es obligatorio para feedback visual. NO eliminar ni reducir significativamente este tiempo.

```typescript
// ✅ CORRECTO
await new Promise(resolve => setTimeout(resolve, 400));

// ❌ INCORRECTO - Sin delay
this.currentComponent = markRaw(newVal);

// ❌ INCORRECTO - Delay insuficiente
await new Promise(resolve => setTimeout(resolve, 50));
```

### Regla 4: Inicialización en created()
La lógica de inicialización y configuración del watcher DEBE ejecutarse en el hook `created()`, no en `mounted()` ni en `setup()`.

### Regla 5: Validación de currentComponent en Template
El template DEBE verificar que `currentComponent` existe antes de renderizar mediante `v-if`:

```vue
<!-- ✅ CORRECTO -->
<component v-if="currentComponent" :is="currentComponent" />

<!-- ❌ INCORRECTO - Sin validación -->
<component :is="currentComponent" />
```

### Regla 6: Loading Screen Antes y Después
Toda transición DEBE mostrar LoadingScreen antes de cambiar componente y ocultarlo después. NO omitir ninguna de estas llamadas.

```typescript
// ✅ CORRECTO
Application.ApplicationUIService.showLoadingScreen();
await new Promise(resolve => setTimeout(resolve, 400));
this.currentComponent = markRaw(newVal);
Application.ApplicationUIService.hideLoadingScreen();

// ❌ INCORRECTO - Sin loading
this.currentComponent = markRaw(newVal);
```

### Regla 7: Componentes Fijos Fuera de Condicionales
TopBarComponent, ActionsComponent y LoadingScreenComponent DEBEN renderizarse incondicionalmente. NO aplicar `v-if` a estos componentes de infraestructura.

### Regla 8: Cálculo de Altura con calc()
La altura máxima de ComponentContainer DEBE calcularse con `calc(100vh - 50px)` para compensar altura del TopBar. NO usar altura fija.

```css
/* ✅ CORRECTO */
max-height: calc(100vh - 50px);

/* ❌ INCORRECTO */
max-height: 90vh;
max-height: 900px;
```

### Regla 9: Z-Index Tokenizado
El contenedor raíz DEBE usar token de capa para `z-index` (`var(--z-base)`) y NO valores numéricos literales.

## 7. Prohibiciones

### Prohibición 1: NO Modificar Application.View Directamente
ComponentContainerComponent NO DEBE modificar `Application.View` directamente. Solo observa cambios y reacciona. Toda modificación de View debe realizarse mediante métodos de Application (`changeView()`, `changeViewToListView()`, etc.).

```typescript
// ❌ PROHIBIDO
Application.View.value.component = SomeComponent;
Application.View.value.title = "New Title";

// ✅ PERMITIDO - Solo lectura
const component = Application.View.value.component;
```

### Prohibición 2: NO Usar Watcher Síncrono
NO usar watcher sin await en callback. El delay de 400ms DEBE ser esperado con await para garantizar orden correcto de operaciones.

```typescript
// ❌ PROHIBIDO
watch(() => Application.View.value.component, (newVal) => {
    Application.ApplicationUIService.showLoadingScreen();
    setTimeout(() => {
        this.currentComponent = markRaw(newVal);
        Application.ApplicationUIService.hideLoadingScreen();
    }, 400);
});

// ✅ CORRECTO - Uso de async/await
watch(() => Application.View.value.component, async (newVal) => {
    Application.ApplicationUIService.showLoadingScreen();
    await new Promise(resolve => setTimeout(resolve, 400));
    this.currentComponent = markRaw(newVal);
    Application.ApplicationUIService.hideLoadingScreen();
});
```

### Prohibición 3: NO Gestionar Rutas Manualmente
NO implementar lógica de router.push() ni navegación dentro de este componente. La navegación es responsabilidad exclusiva de Application.

### Prohibición 4: NO Almacenar Estado de Vistas
NO almacenar en data propiedades relacionadas con estado de entidades, listados o formularios. ComponentContainerComponent es stateless respecto a datos de negocio.

```typescript
// ❌ PROHIBIDO
data() {
    return {
        currentComponent: null,
        entityList: [],           // ❌
        selectedEntity: null,     // ❌
        formData: {}              // ❌
    };
}

// ✅ CORRECTO
data() {
    return {
        currentComponent: null,
        GGICONS,
        GGCLASS
    };
}
```

### Prohibición 5: NO Interceptar Eventos de Componentes Hijos
NO usar `@event` o listeners para interceptar eventos emitidos por el componente dinámico. Los componentes renderizados deben comunicarse exclusivamente mediante Application.eventBus.

```vue
<!-- ❌ PROHIBIDO -->
<component :is="currentComponent" @save="handleSave" />

<!-- ✅ CORRECTO -->
<component :is="currentComponent" />
```

### Prohibición 6: NO Aplicar Estilos al Componente Dinámico
NO aplicar clases CSS ni estilos inline al elemento `<component>`. El componente dinámico debe gestionar sus propios estilos.

```vue
<!-- ❌ PROHIBIDO -->
<component :is="currentComponent" class="custom-styles" style="padding: 20px" />

<!-- ✅ CORRECTO -->
<component :is="currentComponent" />
```

### Prohibición 7: NO Renderizar Múltiples Componentes Dinámicos
NO intentar renderizar más de un componente dinámico simultáneamente. Solo UN componente debe renderizarse mediante `:is` en cualquier momento.

```vue
<!-- ❌ PROHIBIDO -->
<component v-if="currentComponent" :is="currentComponent" />
<component v-if="secondaryComponent" :is="secondaryComponent" />

<!-- ✅ CORRECTO -->
<component v-if="currentComponent" :is="currentComponent" />
```

### Prohibición 8: NO Modificar Timing de Transiciones
NO modificar el delay de 400ms ni implementar delays diferentes para diferentes tipos de vista. El timing debe ser consistente para toda la aplicación.

## 8. Dependencias

### Dependencias Directas de Vue

```typescript
import { Component, markRaw, watch } from 'vue';
```

1. **Component:** Tipo de TypeScript que representa definición de componente Vue. Utilizado para tipar propiedades que almacenan referencias a componentes.

2. **markRaw:** Función que marca objeto como no reactivo, evitando seguimiento profundo de propiedades. Crítica para optimizar componentes dinámicos.

3. **watch:** Función que crea watcher reactivo para observar cambios en fuentes reactivas y ejecutar callbacks. Utilizada para detectar cambios en `Application.View.value.component`.

### Dependencias de Componentes

```typescript
import LoadingScreenComponent from './LoadingScreenComponent.vue';
import TopBarComponent from './TopBarComponent.vue';
import ActionsComponent from './ActionsComponent.vue';
```

1. **LoadingScreenComponent:** Overlay de carga mostrado durante transiciones de vista. Importado y registrado para renderizado fijo en template.

2. **TopBarComponent:** Barra superior que muestra título, breadcrumbs y controles globales. Componente fijo renderizado en parte superior del ViewContainer.

3. **ActionsComponent:** Componente flotante que renderiza botones de acción según `Application.ListButtons.value`. Posicionado de forma flotante dentro del ComponentContainer.

### Dependencias de Application

```typescript
import Application from '@/models/application';
```

**Application:** Singleton que gestiona estado global de la aplicación. ComponentContainerComponent depende de:

- `Application.View.value.component` - Componente de vista actual a renderizar
- `Application.ApplicationUIService.showLoadingScreen()` - Método para mostrar overlay de carga
- `Application.ApplicationUIService.hideLoadingScreen()` - Método para ocultar overlay de carga

### Dependencias de Constantes

```typescript
import GGICONS, { GGCLASS } from '@/constants/ggicons';
```

**GGICONS:** Objeto con constantes de iconos de biblioteca gg-icons. Expuesto en data para uso en template (aunque actualmente no se utiliza directamente en ComponentContainerComponent).

**GGCLASS:** Clase CSS base para iconos gg-icons. Expuesta en data para uso en template.

### Dependencias de CSS

ComponentContainerComponent depende de variables CSS definidas en archivos globales:

```css
var(--white)          /* Color de fondo de ViewContainer */
var(--bg-gray)        /* Color de fondo de ComponentContainer */
var(--border-radius)  /* Border radius de ComponentContainer */
```

Estas variables deben estar definidas en `src/css/constants.css` o archivo de variables globales.

### Dependencias Implícitas

1. **Router de Vue:** Aunque no importado directamente, ComponentContainerComponent es el componente renderizado por rutas genéricas definidas en router (`/:module` y `/:module/:oid`).

2. **Componentes Dinámicos:** Depende indirectamente de todos los componentes que pueden ser asignados a `Application.View.value.component`:
   - DefaultListView
   - DefaultDetailView
   - DefaultComponentView
   - Componentes personalizados de módulos

## 9. Relaciones

### Relación con Application (1:1 Reactiva)

ComponentContainerComponent tiene relación 1:1 reactiva con el singleton Application:

```
ComponentContainerComponent (1) ←→ (1) Application
                                ↓
                          View.value.component
```

- **Dirección de flujo:** Unidireccional desde Application hacia ComponentContainerComponent
- **Tipo de relación:** Observador reactivo mediante watcher
- **Acoplamiento:** Alto - ComponentContainerComponent depende completamente de Application.View
- **Sincronización:** Automática mediante reactividad de Vue

Cuando Application actualiza `View.value.component`, el watcher en ComponentContainerComponent detecta el cambio y actualiza `currentComponent`, provocando re-renderizado.

### Relación con Componentes de Infraestructura (1:3 Composición)

ComponentContainerComponent compone tres componentes fijos:

```
ComponentContainerComponent (1) ──► (1) TopBarComponent
                            ├──► (1) ActionsComponent
                            └──► (1) LoadingScreenComponent
```

- **Dirección de flujo:** Unidireccional desde padre hacia hijos
- **Tipo de relación:** Composición estática (siempre presentes)
- **Acoplamiento:** Bajo - Componentes hijos son autónomos
- **Comunicación:** Sin comunicación directa - Hijos acceden a Application independientemente

### Relación con Componente Dinámico (1:1 Dinámica)

ComponentContainerComponent renderiza un componente dinámico a la vez:

```
ComponentContainerComponent (1) ──► (1) Component Dinámico
                                    (DefaultListView | DefaultDetailView | etc.)
```

- **Dirección de flujo:** Unidireccional mediante directiva `:is`
- **Tipo de relación:** Renderizado dinámico (cambia en runtime)
- **Acoplamiento:** Nulo - ComponentContainerComponent no conoce detalles del componente renderizado
- **Ciclo de vida:** Componente dinámico se desmonta completamente al cambiar por otro

### Relación con Router (1:1 Indirecta)

ComponentContainerComponent es renderizado por rutas genéricas del router:

```
Router (1) ──► (1) ComponentContainerComponent
    ↓
/:module
/:module/:oid
```

- **Dirección de flujo:** Unidireccional desde Router
- **Tipo de relación:** Renderizado estático en todas las rutas de módulos
- **Acoplamiento:** Bajo - Router solo renderiza, sin pasar props ni escuchar eventos
- **Registro:** ComponentContainerComponent es el único componente que router necesita conocer

### Relación con ApplicationUIService (1:1 Utilidad)

ComponentContainerComponent utiliza ApplicationUIService para transiciones:

```
ComponentContainerComponent (1) ──► (1) ApplicationUIService
                                    ↓
                        showLoadingScreen()
                        hideLoadingScreen()
```

- **Dirección de flujo:** Unidireccional mediante llamadas a métodos
- **Tipo de relación:** Cliente-Servicio
- **Acoplamiento:** Medio - Depende de dos métodos específicos del servicio
- **Propósito:** Coordinar transiciones visuales durante cambio de componentes

### Diagrama de Relaciones Completo

```
┌──────────────────────────────────────────────────────────┐
│                      Router                              │
│                   (/:module, /:module/:oid)              │
└────────────────────┬─────────────────────────────────────┘
                     │ renderiza
                     ↓
     ┌───────────────────────────────────────────┐
     │   ComponentContainerComponent             │
     │                                           │
     │   - currentComponent: Component | null    │
     │   - watcher observando Application.View   │
     └───┬────────┬────────┬─────────────┬───────┘
         │        │        │             │
         │        │        │             │ utiliza
         │        │        │             ↓
         │        │        │    ┌─────────────────────────┐
         │        │        │    │ ApplicationUIService    │
         │        │        │    │ - showLoadingScreen()   │
         │        │        │    │ - hideLoadingScreen()   │
         │        │        │    └─────────────────────────┘
         │        │        │
         │ renderiza (fijos)
         ↓        ↓        ↓
    ┌────────┬─────────┬──────────────┐
    │ TopBar │ Actions │ LoadingScreen│
    └────────┴─────────┴──────────────┘
         │
         │ renderiza (dinámico)
         ↓
    ┌────────────────────────────────┐
    │    Component Dinámico          │
    │  (DefaultListView |            │
    │   DefaultDetailView |          │
    │   DefaultComponentView)        │
    └────────┬───────────────────────┘
             │
             │ observa
             ↓
    ┌────────────────────────────────┐
    │     Application (Singleton)    │
    │                                │
    │   View.value.component ───────┐│
    │   View.value.viewType         ││
    │   View.value.entityClass      ││
    │   View.value.title            ││
    └────────────────────────────────┘
```

## 10. Notas de Implementación

### Nota 1: Registro Global del Componente

ComponentContainerComponent debe registrarse globalmente en `main.js` para ser utilizado por el router:

```typescript
// main.js
import ComponentContainerComponent from '@/components/ComponentContainerComponent.vue';

const app = createApp(App);
app.component('component-container-component', ComponentContainerComponent);
```

Esto permite usar el componente como string en definición de rutas sin importarlo en cada ruta.

### Nota 2: Timing de 400ms y Percepción del Usuario

El delay de 400ms está calibrado para la percepción humana:

- **<200ms:** Cambio tan rápido que puede no ser percibido, confundiendo al usuario
- **200-500ms:** Rango óptimo para feedback visual claro pero no molesto
- **>500ms:** Delay perceptible que puede frustrar al usuario

400ms proporciona balance entre claridad visual y velocidad percibida.

### Nota 3: markRaw() y Component Caching

Vue internamente cachea componentes renderizados. Al usar `markRaw()`, se previene que Vue intente hacer caching reactivo del componente en sí, pero Vue aún puede cachear instancias renderizadas cuando es apropiado.

### Nota 4: Desmontaje Automático de Componentes

Cuando `currentComponent` cambia, Vue automáticamente:
1. Ejecuta hooks `beforeUnmount` y `unmounted` del componente anterior
2. Limpia watchers, computed properties y event listeners del componente anterior
3. Ejecuta hooks `created` y `mounted` del nuevo componente

NO es necesaria limpieza manual.

### Nota 5: Alternativa a markRaw(): shallowRef

Una alternativa a `markRaw()` es usar `shallowRef()` para `currentComponent`:

```typescript
import { shallowRef } from 'vue';

// En setup()
const currentComponent = shallowRef(null);
```

`shallowRef()` solo hace tracking de `.value`, no de propiedades internas del objeto asignado. Produce efecto similar a `markRaw()`, pero con API más concisa.

Sin embargo, dado que ComponentContainerComponent usa Options API (no Composition API), `markRaw()` es la solución apropiada.

### Nota 6: Scroll Position y Transiciones

El scroll de ComponentContainer NO se resetea automáticamente al cambiar de vista. Si se desea resetear scroll position en cada cambio de vista, agregar en watcher:

```typescript
watch(() => Application.View.value.component, async (newVal) => {
    if (newVal) {
        Application.ApplicationUIService.showLoadingScreen();
        await new Promise(resolve => setTimeout(resolve, 400));
        this.currentComponent = markRaw(newVal);
        
        // Resetear scroll a top
        const container = this.$el.querySelector('.ComponentContainer');
        if (container) container.scrollTop = 0;
        
        Application.ApplicationUIService.hideLoadingScreen();
    }
});
```

### Nota 7: Manejo de Errores en Componentes Dinámicos

Si un componente dinámico lanza error durante renderizado, Vue mostrará error en consola pero NO crasheará toda la aplicación. Para manejo centralizado de errores, considerar:

```typescript
// main.js
app.config.errorHandler = (err, instance, info) => {
    console.error('Error en componente:', err);
    Application.ApplicationUIService.showToast('Error al cargar vista', 'ERROR');
    Application.changeViewToDefaultView(Home); // Fallback a vista segura
};
```

### Nota 8: Performance con Muchas Transiciones

Si la aplicación requiere cambios de vista muy frecuentes (ej: navegación rápida entre listados), considerar reducir delay de 400ms a 200ms, o implementar debouncing para evitar transiciones redundantes:

```typescript
let transitionTimeout = null;

watch(() => Application.View.value.component, async (newVal) => {
    if (newVal) {
        // Cancelar transición pendiente si hay una nueva
        if (transitionTimeout) clearTimeout(transitionTimeout);
        
        Application.ApplicationUIService.showLoadingScreen();
        
        transitionTimeout = setTimeout(async () => {
            this.currentComponent = markRaw(newVal);
            Application.ApplicationUIService.hideLoadingScreen();
            transitionTimeout = null;
        }, 400);
    }
});
```

### Nota 9: Testing y Mocking

Para testing de componentes que dependen de ComponentContainerComponent:

```typescript
// test/ComponentContainerComponent.spec.ts
import { mount } from '@vue/test-utils';
import ComponentContainerComponent from '@/components/ComponentContainerComponent.vue';
import Application from '@/models/application';

describe('ComponentContainerComponent', () => {
    it('renderiza componente inicial', () => {
        const MockComponent = { template: '<div>Mock</div>' };
        Application.View.value.component = MockComponent;
        
        const wrapper = mount(ComponentContainerComponent);
        expect(wrapper.text()).toContain('Mock');
    });
    
    it('actualiza componente al cambiar Application.View', async () => {
        const wrapper = mount(ComponentContainerComponent);
        const NewComponent = { template: '<div>New</div>' };
        
        Application.View.value.component = NewComponent;
        await wrapper.vm.$nextTick();
        
        expect(wrapper.text()).toContain('New');
    });
});
```

### Nota 10: Compatibilidad con Composition API

Si se migra a Composition API (script setup), la implementación equivalente sería:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { markRaw } from 'vue';
import Application from '@/models/application';
// ... otros imports

const currentComponent = ref<Component | null>(null);

// Inicialización
const init = Application.View.value.component;
if (init) {
    currentComponent.value = markRaw(init);
}

// Watcher
watch(() => Application.View.value.component, async (newVal) => {
    if (newVal) {
        Application.ApplicationUIService.showLoadingScreen();
        await new Promise(resolve => setTimeout(resolve, 400));
        currentComponent.value = markRaw(newVal);
        Application.ApplicationUIService.hideLoadingScreen();
    }
});
</script>
```

Esta versión es más concisa pero funcionalmente idéntica a la implementación con Options API.

## 11. Referencias Cruzadas

### Documentos Relacionados en Copilot

- **[core-components.md](core-components.md):** Documenta los componentes core del framework, incluyendo ComponentContainerComponent como componente central de renderizado.

- **[../03-application/application-singleton.md](../03-application/application-singleton.md):** Documenta el singleton Application y su propiedad `View` observada por ComponentContainerComponent.

- **[views-overview.md](views-overview.md):** Explica el sistema de vistas (DefaultListView, DefaultDetailView, DefaultComponentView) que son renderizadas por ComponentContainerComponent.

- **[LoadingScreenComponent.md](LoadingScreenComponent.md):** Documenta el componente de pantalla de carga utilizado durante transiciones de vista.

- **[TopBarComponent.md](TopBarComponent.md):** Documenta la barra superior renderizada como componente fijo en ViewContainer.

- **[ActionsComponent.md](ActionsComponent.md):** Documenta el componente flotante de botones de acción renderizado dentro de ComponentContainer.

- **[../03-application/router-integration.md](../03-application/router-integration.md):** Documenta cómo el router utiliza rutas genéricas que renderizan ComponentContainerComponent.

- **[../03-application/ui-services.md](../03-application/ui-services.md):** Documenta ApplicationUIService con métodos `showLoadingScreen()` y `hideLoadingScreen()` utilizados en transiciones.

### Archivos de Código Relacionados

- **`src/components/ComponentContainerComponent.vue`:** Archivo fuente implementando el componente documentado.

- **`src/models/application.ts`:** Implementación del singleton Application con propiedad `View` observada.

- **`src/router/index.ts`:** Configuración de rutas genéricas que renderizan ComponentContainerComponent.

- **`src/main.js`:** Archivo donde ComponentContainerComponent se registra globalmente.

- **`src/views/DefaultListView.vue`:** Componente de vista de lista renderizado dinámicamente.

- **`src/views/DefaultDetailView.vue`:** Componente de vista de detalle renderizado dinámicamente.

- **`src/views/DefaultComponentView.vue`:** Componente de vista genérica renderizado dinámicamente.

### Conceptos Relacionados

- **Dynamic Component Rendering:** Patrón de Vue documentado en [Vue.js documentation - Dynamic Components](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components).

- **markRaw API:** Función de Vue documentada en [Vue.js API - markRaw](https://vuejs.org/api/reactivity-advanced.html#markraw).

- **watch API:** Función de Vue documentada en [Vue.js API - watch](https://vuejs.org/api/reactivity-core.html#watch).

- **Container Component Pattern:** Patrón de diseño explicado en [React documentation - Presentational and Container Components](https://react.dev/reference/react/Component#alternatives) (aplicable también a Vue).

### Flujos de Integración

ComponentContainerComponent participa en los siguientes flujos documentados:

1. **Flujo de Navegación por Sidebar:** Documentado en [SideBarComponent.md](SideBarComponent.md) y [SideBarItemComponent.md](SideBarItemComponent.md).

2. **Flujo de Cambio de Vista:** Documentado en [../03-application/application-singleton.md](../03-application/application-singleton.md) sección "Flujo de changeView".

3. **Flujo de Router Guard:** Documentado en [../03-application/router-integration.md](../03-application/router-integration.md) sección "beforeEach Guard".

4. **Flujo de Loading Transitions:** Documentado en [LoadingScreenComponent.md](LoadingScreenComponent.md) y [../03-application/ui-services.md](../03-application/ui-services.md).
