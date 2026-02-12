# SideBarComponent

## 1. Propósito

SideBarComponent es la barra lateral de navegación principal del framework que renderiza dinámicamente todos los módulos registrados en Application.ModuleList, proporcionando navegación entre módulos mediante items clicables. El componente implementa funcionalidad de expansión/colapso controlada por EventBus, sincronizando estado visual con TopBarComponent y manteniendo persistencia durante toda la sesión de usuario. Actúa como interface única de acceso a todos los módulos CRUD del sistema, generando automáticamente items de navegación desde metadata de decoradores ModuleName y ModuleIcon de cada entidad registrada.

**Ubicación del código fuente:** src/components/SideBarComponent.vue

**Patrón de diseño:** Collapsible Navigation Sidebar + EventBus Subscription

## 2. Alcance

### Responsabilidades

1. **Renderizado Dinámico de Módulos:**
   - Iterar sobre Application.ModuleList.values() mediante v-for
   - Renderizar SideBarItemComponent por cada módulo registrado
   - Actualizar reactivamente cuando ModuleList cambia
   - Mantener orden de módulos según inserción en Map

2. **Gestión de Estado de Expansión:**
   - Mantener data property toggled (boolean) para estado expandido/colapsado
   - Aplicar clase CSS toggled condicionalmente para transiciones
   - Inicializar en estado expandido (toggled: true por default)
   - Sincronizar estado con eventos de EventBus

3. **Integración con EventBus:**
   - Subscribirse a evento toggle-sidebar en mounted()
   - Procesar payload del evento: boolean para estado forzado, void para toggle
   - Actualizar toggled según payload recibido
   - Limpiar subscription en beforeUnmount() para prevenir memory leaks

4. **Estructura de Layout:**
   - Proporcionar tres secciones: header (logo/título), body (módulos), footer (acciones/info)
   - Aplicar scroll vertical en body cuando número de módulos excede altura disponible
   - Mantener posicionamiento fijo durante navegación entre vistas
   - Proporcionar ancho consistente: 68px colapsado, 250px expandido

### Límites

1. **NO gestiona lógica de navegación** - SideBarItemComponent ejecuta Application.changeView() al click
2. **NO registra módulos** - Application.ModuleList debe poblarse externamente en configuración
3. **NO valida permisos de módulos** - Renderiza todos los módulos registrados sin filtrado
4. **NO mantiene estado de módulo activo** - Application.View.value.viewType gestiona vista actual
5. **NO emite eventos propios** - Solo escucha eventos de EventBus, no produce
6. **NO acepta props** - Estado completamente gestionado por Application singleton
7. **NO contiene lógica de autenticación** - Módulos visibles independiente de usuario logueado
8. **NO customiza renderizado de items** - SideBarItemComponent tiene presentación fija

## 3. Definiciones Clave

**SideBarComponent**: Componente Vue de clase core layout que proporciona navegación persistente lateral mediante lista de módulos registrados en Application.ModuleList.

**toggled**: Data property booleana que controla estado de expansión del sidebar, aplicando clase CSS toggled para transiciones animadas entre estados colapsado (68px) y expandido (250px).

**toggle-sidebar**: Evento de EventBus que recibe payload opcional (boolean | void) para controlar estado del sidebar, emitido típicamente por TopBarComponent al click en botón de toggle.

**Application.ModuleList**: Map<string, typeof BaseEntity> que almacena todas las entidades registradas como módulos navegables, iterada por SideBarComponent para generar lista de SideBarItemComponent.

**SideBarItemComponent**: Componente hijo que renderiza representación individual de módulo con icono y nombre, ejecutando Application.changeView() al click para navegación.

**EventBus Subscription**: Patrón de escucha de eventos mediante Application.eventBus.on() en mounted() con obligatoria limpieza mediante .off() en beforeUnmount() para prevenir memory leaks.

**Collapsible Sidebar**: Patrón de UI que permite expandir/colapsar panel lateral para maximizar espacio de contenido, aplicando transiciones CSS suaves y ocultación progresiva de texto.

## 4. Descripción Técnica

SideBarComponent implementa arquitectura de componente stateful que mantiene data property toggled para controlar expansión/colapso mediante clase CSS condicional. El template estructura sidebar en tres secciones verticales: header (actualmente placeholder, reservado para logo/título), body (contenedor scrollable de SideBarItemComponent generados dinámicamente), y footer (actualmente placeholder, reservado para acciones usuario). El body utiliza v-for iterando sobre Application.ModuleList.values() para renderizar SideBarItemComponent por cada módulo, pasando module como prop.

El componente implementa Lifecycle Hook mounted() que registra listener en EventBus para evento toggle-sidebar, ejecutando callback que procesa payload opcional: si payload es boolean, establece toggled a ese valor; si payload es void, invierte toggled. El Lifecycle Hook beforeUnmount() limpia listener mediante Application.eventBus.off('toggle-sidebar') para prevenir memory leaks por subscripciones huérfanas.

Los estilos CSS implementan transiciones animadas basadas en clase toggled: max-width transiciona de 68px (colapsado) a 250px (expandido) con ease 0.5s, opacity de span transiciona de 0 (invisible) a 1 (visible) con delay 0.2s para sincronizar con expansión, header transiciona padding y opacity para aparecer solo cuando expandido. El body aplica overflow-y: auto con max-height: calc(100vh - 160px) para scroll vertical cuando lista de módulos excede espacio disponible.

La integración con Application singleton proporciona reactividad automática: cambios en Application.ModuleList se reflejan inmediatamente en renderizado de sidebar mediante sistema de reactividad de Vue 3. El componente no mantiene estado de módulo activo, delegando esa responsabilidad a Application.View.value que gestiona vista actual.

## 5. Flujo de Funcionamiento

**Inicialización en App.vue:**
1. App.vue monta SideBarComponent en layout principal
2. Componente renderiza con toggled: true (expandido por default)
3. mounted() ejecuta y registra listener para toggle-sidebar en EventBus
4. v-for itera Application.ModuleList.values()
5. Por cada módulo, renderiza SideBarItemComponent con prop module
6. Items muestran icono y nombre obtenidos de decoradores ModuleName/ModuleIcon
7. CSS aplica max-width: 250px y opacity: 1 en spans por clase toggled

**Toggle desde TopBarComponent:**
1. Usuario click en botón toggle en TopBarComponent
2. TopBarComponent ejecuta Application.ApplicationUIService.toggleSidebar()
3. ApplicationUIService emite evento toggle-sidebar via EventBus sin payload (void)
4. Listener en SideBarComponent recibe evento con payload void
5. Callback ejecuta: this.toggled = !this.toggled (invierte estado)
6. Vue reactividad actualiza clase toggled en template
7. CSS transiciona max-width a 68px, opacity de text a 0, padding de header a 0
8. Animación se completa en 0.5s, sidebar queda colapsado
9. Usuario ve solo iconos de módulos, nombres ocultos

**Toggle Programático con Estado Forzado:**
1. Código ejecuta Application.ApplicationUIService.toggleSidebar(false)
2. EventBus emite toggle-sidebar con payload boolean false
3. Listener en SideBarComponent recibe evento con payload false
4. Callback ejecuta: this.toggled = false (establece estado explícito)
5. Vue reactividad aplica clase condicional
6. CSS transiciona a estado colapsado

**Navegación a Módulo:**
1. Usuario click en SideBarItemComponent de módulo Products
2. SideBarItemComponent ejecuta Application.changeView(Products, ViewType.LIST)
3. Application actualiza View.value y ejecuta router navigation
4. Router renderiza DefaultListView para Products
5. SideBarComponent permanece montado y visible durante transición
6. Estado toggled se mantiene sin cambios durante navegación

**Desmontaje del Componente:**
1. Componente entra en fase de unmount (navegación fuera de layout principal)
2. beforeUnmount() ejecuta
3. Application.eventBus.off('toggle-sidebar') limpia listener
4. Subscription es removida de EventBus
5. Componente se desmonta sin memory leaks

## 6. Reglas Obligatorias

### 6.1 Gestión de EventBus Obligatoria

SIEMPRE limpiar listeners en beforeUnmount():

```typescript
beforeUnmount() {
    Application.eventBus.off('toggle-sidebar');
}
```

Subscription sin limpieza causa memory leaks y handlers duplicados en re-montajes.

### 6.2 Iteración sobre ModuleList

SIEMPRE usar Application.ModuleList.values() en v-for, NO ModuleList.entries() o keys():

```vue
<SideBarItemComponent 
    v-for="module in Application.ModuleList.values()" 
    :module="module"
/>
```

### 6.3 Data Property toggled

SIEMPRE mantener toggled como boolean puro, NO string o number:

```typescript
data() {
    return {
        toggled: true  // boolean, NOT 'true' o 1
    };
}
```

### 6.4 Payload del Evento Opcional

Callback de toggle-sidebar DEBE procesar payload opcional correctamente:

```typescript
Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
    this.toggled = state !== undefined ? state : !this.toggled;
});
```

### 6.5 Sin Props

SideBarComponent NO acepta props, toda configuración via Application singleton.

### 6.6 Estructura de Template Fija

Header, body, footer DEBEN mantenerse en orden y estructura:

```vue
<div :class="['sidebar', { toggled }]">
    <div class="header">...</div>
    <div class="body">...</div>
    <div class="footer">...</div>
</div>
```

## 7. Prohibiciones

1. NO modificar Application.ModuleList desde SideBarComponent - Solo lectura reactiva
2. NO ejecutar Application.changeView() directamente - SideBarItemComponent lo maneja
3. NO emitir eventos propios para comunicación con padre - EventBus es canal único
4. NO aplicar estilos inline via :style para toggled - Usar clase CSS condicional
5. NO mantener estado de módulo activo en data - Application.View.value es fuente de verdad
6. NO renderizar módulos condicionalmente por permisos - Filtrado debe ser externo
7. NO usar v-show para toggle - Usar clase CSS con transiciones para performance
8. NO hardcodear lista de módulos - Siempre iterar desde Application.ModuleList
9. NO almacenar referencia a EventBus en data - Usar Application.eventBus directamente
10. NO modificar toggled desde template - Solo desde callback de EventBus

## 8. Dependencias

### Dependencias Directas

**Application Singleton:**
- Application.ModuleList.values() - Iterable de módulos registrados
- Application.eventBus.on() - Subscription a eventos de toggle
- Application.eventBus.off() - Limpieza de subscriptions

**SideBarItemComponent:**
- Renderizado por v-for, recibe prop module
- Ejecuta navegación al click

**TopBarComponent:**
- Emite eventos toggle-sidebar via ApplicationUIService

**ApplicationUIService:**
- toggleSidebar(state?: boolean) - Emite evento toggle-sidebar

### Dependencias de Vue

- Composition API: data(), mounted(), beforeUnmount()
- Directivas: v-for, :class
- Reactividad: Actualizaciones automáticas desde Application.ModuleList

### Dependencias de CSS

- Variables CSS: --white, --bg-gray, --sky
- Transiciones: ease, opacity, max-width
- Clases condicionales: toggled

### Dependencias de Decoradores

- ModuleName - Nombre mostrado en SideBarItemComponent
- ModuleIcon - Icono renderizado en SideBarItemComponent

## 9. Relaciones

**Componentes Relacionados:**

SideBarComponent → SideBarItemComponent (padre-hijo, renderiza N items)
SideBarComponent ← TopBarComponent (comunicación via EventBus)
SideBarComponent ← ApplicationUIService (control de estado via eventos)
SideBarItemComponent → Application (ejecuta changeView() al click)

**Flujo de Comunicación:**

TopBarComponent → ApplicationUIService.toggleSidebar() → EventBus.emit('toggle-sidebar') → SideBarComponent.listener → actualiza toggled → Vue reactividad → actualiza DOM

SideBarComponent.v-for → Application.ModuleList.values() → N SideBarItemComponent → click → Application.changeView() → Router → DefaultListView

**Documentos Relacionados:**

- SideBarItemComponent.md - Componente hijo para items individuales
- TopBarComponent.md - Componente que controla toggle del sidebar
- application-singleton.md - Application.ModuleList y changeView()
- ui-services.md - ApplicationUIService.toggleSidebar()
- event-bus.md - Sistema de eventos mitt
- module-name-decorator.md - Decorador @ModuleName para nombres
- module-icon-decorator.md - Decorador @ModuleIcon para iconos

## 10. Notas de Implementación

### Integración en App.vue

Layout típico con SideBarComponent:

```vue
<template>
  <div class="app-container">
    <TopBarComponent />
    <div class="app-layout">
      <SideBarComponent />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBarComponent from '@/components/TopBarComponent.vue';
import SideBarComponent from '@/components/SideBarComponent.vue';
</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.app-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.main-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}
</style>
```

### Registro de Módulos

Módulos mostrados en sidebar deben registrarse en Application.ModuleList:

```typescript
// src/models/application.ts

import Product from '@/entities/products';
import User from '@/entities/user';
import Order from '@/entities/order';

class Application {
    static ModuleList = new Map<string, typeof BaseEntity>([
        ['products', Product],
        ['users', User],
        ['orders', Order]
    ]);
}
```

### Control Programático

```typescript
import { Application } from '@/models/application';

// Colapsar sidebar
Application.ApplicationUIService.toggleSidebar(false);

// Expandir sidebar
Application.ApplicationUIService.toggleSidebar(true);

// Toggle (alternar)
Application.ApplicationUIService.toggleSidebar();
```

### Customización de Header y Footer

Actualmente placeholders, customizar según necesidades:

```vue
<div class="header">
    <img src="@/assets/logo.png" alt="Logo" class="logo" />
    <h2>My App</h2>
</div>

<div class="footer">
    <button @click="logout" class="logout-button">
        Logout
    </button>
</div>
```

### Responsive Design

Para pantallas pequeñas, considerar sidebar absolute con slide-in:

```css
@media (max-width: 768px) {
    .sidebar {
        position: absolute;
        left: -250px;
        transition: left 0.3s ease;
        z-index: 200;
    }
    
    .sidebar.toggled {
        left: 0;
    }
}
```

### Estilos Críticos

**Transición de Expansión:**

```css
.sidebar {
    display: flex;
    flex-direction: column;
    max-width: 68px;
    width: 100%;
    transition: 0.5s ease;
    overflow: hidden;
}

.sidebar.toggled {
    max-width: 250px;
}
```

**Fade de Texto con Delay:**

```css
.sidebar span {
    opacity: 0;
    font-weight: 500;
    transition: opacity 0.3s ease 0.2s;
}

.sidebar.toggled span {
    opacity: 1;
}
```

**Header Responsive:**

```css
.sidebar .header {
    height: 50px;
    opacity: 0;
    max-height: 90px;
    padding: 0;
    overflow: hidden;
    transition: 0.5s ease;
}

.sidebar.toggled .header {
    height: 100%;
    opacity: 1;
    padding: 1rem;
}
```

**Body Scrollable:**

```css
.sidebar .body {
    flex-grow: 1;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    overflow-x: hidden;
}
```

### Z-Index Layering

```css
.sidebar {
    position: relative;
    z-index: 100;
    background-color: var(--white);
}
```

Sidebar debe estar encima de content (z-index: 1) pero debajo de modales (z-index: 1000).

### Agregar Nuevo Módulo

```typescript
// 1. Crear entidad con decoradores
@ModuleName('Inventory')
@ModuleIcon('📦')
export class Inventory extends BaseEntity {
    // propiedades...
}

// 2. Registrar en Application.ModuleList
Application.ModuleList.set('inventory', Inventory);

// 3. Sidebar renderiza automáticamente nuevo item
```

## 11. Referencias Cruzadas

**Componentes:**
- [SideBarItemComponent](SideBarItemComponent.md) - Item individual de módulo en sidebar
- [TopBarComponent](TopBarComponent.md) - Controla toggle del sidebar
- [ComponentContainerComponent](ComponentContainerComponent.md) - Contenedor principal de vistas

**Application Layer:**
- [application-singleton.md](../03-application/application-singleton.md) - Application.ModuleList y changeView()
- [ui-services.md](../03-application/ui-services.md) - ApplicationUIService.toggleSidebar()
- [event-bus.md](../03-application/event-bus.md) - Sistema de eventos mitt

**Decoradores:**
- [module-name-decorator.md](../01-decorators/module-name-decorator.md) - @ModuleName para nombres de módulos
- [module-icon-decorator.md](../01-decorators/module-icon-decorator.md) - @ModuleIcon para iconos de módulos

**Enums:**
- ViewTypes - Tipos de vistas para navigación (LISTVIEW, DETAILVIEW, etc.)

**Arquitectura:**
- [02-FLOW-ARCHITECTURE.md](../../02-FLOW-ARCHITECTURE.md) - Flujo de navegación y renderizado de UI
- [01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md) - Visión general de componentes core

**Ubicación del código fuente:** src/components/SideBarComponent.vue  
**Líneas de código:** 107
