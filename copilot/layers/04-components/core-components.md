# 🧩 Core Components - Componentes Principales del Framework

**Referencias:**
- `../03-application/application-singleton.md` - Application gestiona componentes
- `../03-application/event-bus.md` - Sistema de eventos
- `buttons-overview.md` - Botones en ActionsComponent
- `views-overview.md` - Vistas renderizadas por ComponentContainer

---

## 📍 Ubicación en el Código

**Carpeta:** `src/components/`  
**Componentes:**
- `ComponentContainerComponent.vue`
- `ActionsComponent.vue`
- `TabControllerComponent.vue`
- `TabComponent.vue`
- `LoadingScreenComponent.vue`
- `DropdownMenu.vue`

---

## 🎯 Propósito

Los **componentes core** forman la estructura principal de la aplicación:
- Layout y contenedores
- Navegación por tabs
- Estados de carga
- Menús contextuales

---

## 📦 1. ComponentContainerComponent

### Descripción
Contenedor principal que renderiza la vista actual junto con TopBar, ActionsComponent y LoadingScreen.

### Archivo
`src/components/ComponentContainerComponent.vue`

### Estructura

```vue
<template>
    <div class="ViewContainer">
        <TopBarComponent />
        <div class="ComponentContainer">
            <ActionsComponent />
            <component v-if="currentComponent" :is="currentComponent" />
        </div>
        <LoadingScreenComponent />
    </div>
</template>
```

### Data
```typescript
{
    currentComponent: Component | null  // Vista actual a renderizar
}
```

### Lifecycle - created()

```typescript
created() {
    // Inicializar con vista actual de Application
    const init = Application.View.value.component;
    if (init) {
        this.currentComponent = markRaw(init);
    }
    
    // Observar cambios en Application.View.value.component
    watch(() => Application.View.value.component, async (newVal) => {
        if (newVal) {
            Application.ApplicationUIService.showLoadingScreen();
            await new Promise(resolve => setTimeout(resolve, 400));  // Delay UX
            this.currentComponent = markRaw(newVal);
            Application.ApplicationUIService.hideLoadingScreen();
        }
    });
}
```

### Flujo de Cambio de Vista

```
1. Application.changeView() ejecuta
        ↓
2. Application.View.value.component actualizado
        ↓
3. Watch en ComponentContainer detecta cambio
        ↓
4. Muestra LoadingScreen (400ms)
        ↓
5. Actualiza currentComponent con markRaw(newComponent)
        ↓
6. Oculta LoadingScreen
        ↓
7. Nueva vista renderizada
```

### Components Utilizados
- `TopBarComponent` - Barra superior con título
- `ActionsComponent` - Botones flotantes de acciones
- `LoadingScreenComponent` - Pantalla de carga en transiciones
- *Componente dinámico:* Vista actual (ListView, DetailView, etc.)

### CSS Layout
```css
.ViewContainer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 100vh;
}

.ComponentContainer {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 50px);  /* Espacio para TopBar */
    overflow: auto;
    background-color: var(--bg-gray);
    border-radius: var(--border-radius);
}
```

### markRaw()
Envuelve componentes en `markRaw()` para evitar que Vue haga el componente reactivo, optimizando performance.

---

## 📦 2. ActionsComponent

### Descripción
Barra flotante sticky que contiene los botones de acción de la vista actual.

### Archivo
`src/components/ActionsComponent.vue`

### Estructura

```vue
<template>
    <div class="floating-actions" :class="{ 'at-top': isAtTop }">
        <component v-for="component in Application.ListButtons" :is="component" />
    </div>
</template>
```

### Data
```typescript
{
    isAtTop: boolean,                    // Si el scroll está en top
    scrollContainer: HTMLElement | null  // Contenedor con scroll
}
```

### Lifecycle Hooks

```typescript
mounted() {
    // Obtener contenedor de scroll
    this.scrollContainer = this.$el.closest('.ComponentContainer');
    
    // Escuchar scroll events
    if (this.scrollContainer) {
        this.scrollContainer.addEventListener('scroll', this.handleScroll);
        this.handleScroll();  // Check inicial
    }
}

beforeUnmount() {
    // Cleanup
    if (this.scrollContainer) {
        this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }
}
```

### Methods

```typescript
handleScroll() {
    if (this.scrollContainer) {
        this.isAtTop = this.scrollContainer.scrollTop === 0;
    }
}
```

### Comportamiento Visual

1. **En top (scrollTop === 0):**
   - Opacity: 1 (completamente visible)
   - Botones claramente visibles

2. **Al hacer scroll:**
   - Opacity: 0.3 (semi-transparente)
   - Menos intrusivo

3. **Al hacer hover:**
   - Opacity: 1 (visible)
   - Fácil acceso a botones

### CSS Classes
```css
.floating-actions {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    gap: 1rem;
    background-color: var(--white);
    padding: .75rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    opacity: 0.3;
    transition: opacity 0.3s ease;
}

.floating-actions.at-top {
    opacity: 1;
}

.floating-actions:hover {
    opacity: 1;
}
```

### Botones Renderizados
Lee de `Application.ListButtons` que es configurado por `Application.setButtonList()`:
- **ListView:** New, Refresh
- **DetailView (persistente):** New, Refresh, Validate, Save, Save and New, Send to Device
- **DetailView (no persistente):** New, Refresh, Validate, Send to Device

**Ref:** Ver [buttons-overview.md](buttons-overview.md)

---

## 📦 3. TabControllerComponent

### Descripción
Controlador de navegación por tabs. Muestra pestañas clickeables y gestiona cuál está activa.

### Archivo
`src/components/TabControllerComponent.vue`

### Estructura

```vue
<template>
    <div class="tab-container">
        <!-- Headers de tabs -->
        <div class="tab-container-row">
            <div class="tab" 
                v-for="(tab, index) in tabs" 
                :class="{ active: index == selectedTab }"
                @click="setActiveTab(index)">
                <span>{{ tab }}</span>
            </div>
        </div>
        
        <!-- Contenido de tabs (TabComponents) -->
        <slot></slot>
    </div>
</template>
```

### Props
```typescript
{
    tabs: Array<string>  // Nombres de los tabs (requerido)
}
```

### Data
```typescript
{
    selectedTab: number,                      // Index del tab activo (default: 0)
    tabElements: NodeListOf<Element> | null   // Referencias a TabComponents
}
```

### Methods

```typescript
setActiveTab(index: number) {
    this.selectedTab = index;
    
    // Actualizar clases CSS de TabComponents
    this.tabElements?.forEach((el, i) => {
        el.classList.remove('active');
        if (i === index) {
            el.classList.add('active');
        }
    });
}
```

### Setup (Validación)

```typescript
setup() {
    const slots = useSlots();
    
    const isValid = computed(() => {
        const nodes = slots.default?.();
        if (!nodes) return true;
        
        // Validar que todos los hijos sean TabComponent
        return nodes.every(vnode => vnode.type === TabComponent);
    });
    
    return { isValid };
}
```

### Mounted

```typescript
mounted() {
    // Obtener referencias a TabComponents
    this.tabElements = document.querySelectorAll('.tab-component');
    
    // Activar primer tab
    this.setActiveTab(0);
}
```

### Uso

```vue
<TabControllerComponent :tabs="['Tab 1', 'Tab 2', 'Tab 3']">
    <TabComponent>
        <!-- Contenido tab 1 -->
    </TabComponent>
    <TabComponent>
        <!-- Contenido tab 2 -->
    </TabComponent>
    <TabComponent>
        <!-- Contenido tab 3 -->
    </TabComponent>
</TabControllerComponent>
```

### Ejemplo Real en DetailView

```vue
<TabControllerComponent :tabs="entity.getArrayKeysOrdered()">
    <TabComponent v-for="arrayKey in entity.getArrayKeysOrdered()">
        <ArrayInputComponent 
            :property-key="arrayKey"
            :type-value="entityClass.getArrayPropertyType(arrayKey)" 
        />
    </TabComponent>
</TabControllerComponent>
```

### CSS
```css
.tab-container-row {
    display: flex;
    gap: .5rem;
    border-bottom: 2px solid var(--sky);
}

.tab {
    padding: 0.5rem 1.5rem;cursor: pointer;
    border-radius: 1rem 1rem 0 0;
    border: 1px solid var(--border-gray);
    border-bottom: none;
    transition: 0.5s ease;
}

.tab.active {
    border: 2px solid var(--sky);
    background-color: var(--bg-gray);
}
```

---

## 📦 4. TabComponent

### Descripción
Contenedor de contenido para un tab individual. Solo visible cuando está activo.

### Archivo
`src/components/TabComponent.vue`

### Estructura

```vue
<template>
    <div class="tab-component">
        <slot></slot>
    </div>
</template>
```

### Props
Ninguno

### Comportamiento
- Por defecto: `display: none`
- Con clase `.active`: `display: block`
- TabControllerComponent agrega/remueve clase `.active`

### CSS
```css
.tab-component {
    width: 100%;
    height: 100%;
    padding: .5rem;
    border-radius: 0 0 1rem 1rem;
    border: 2px solid var(--sky);
    border-top: none;
    background-color: var(--bg-gray);
    display: none;  /* Oculto por defecto */
}

.tab-component.active {
    display: block;  /* Visible cuando activo */
}
```

---

## 📦 5. LoadingScreenComponent

### Descripción
Pantalla de carga fullscreen que se muestra durante transiciones de vistas.

### Archivo
`src/components/LoadingScreenComponent.vue`

### Estructura

```vue
<template>
    <div class="loading-screen" :class="{ active: isActive }">
        Loading...
    </div>
</template>
```

### Data
```typescript
{
    isActive: boolean  // Estado de visibilidad
}
```

### Events Escuchados
- `show-loading` - Muestra pantalla de carga
- `hide-loading` - Oculta pantalla de carga

### Lifecycle Hooks

```typescript
mounted() {
    Application.eventBus.on('show-loading', () => {
        this.isActive = true;
    });
    Application.eventBus.on('hide-loading', () => {
        this.isActive = false;
    });
}

beforeUnmount() {
    Application.eventBus.off('show-loading');
    Application.eventBus.off('hide-loading');
}
```

### Uso

```typescript
// Mostrar
Application.ApplicationUIService.showLoadingScreen();

// Ocultar
Application.ApplicationUIService.hideLoadingScreen();
```

### CSS
```css
.loading-screen {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100% - 50px);
    width: 100%;
    font-size: 1.5rem;
    top: 50px;
    z-index: 99999;
    background-color: var(--white);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-in-out;
}

.loading-screen.active {
    opacity: 1;
    pointer-events: all;
}
```

### Z-Index
`99999` (máxima prioridad, cubre todo)

### Uso Típico en ComponentContainer

```typescript
watch(() => Application.View.value.component, async (newVal) => {
    if (newVal) {
        Application.ApplicationUIService.showLoadingScreen();
        await new Promise(resolve => setTimeout(resolve, 400));
        this.currentComponent = markRaw(newVal);
        Application.ApplicationUIService.hideLoadingScreen();
    }
});
```

---

## 📦 6. DropdownMenu

### Descripción
Menú contextual dropdown posicionado dinámicamente que puede renderizar cualquier componente.

### Archivo
`src/components/DropdownMenu.vue`

### Estructura

```vue
<template>
    <div :class="['dropdown-menu-container', { hidden: !dropDownData.showing }]">
        <div class="dropdown-menu" :style="dropdownStyle">
            <span class="dropdown-menu-title">{{ dropDownData.title }}</span>
            <component v-if="dropDownData.component" :is="dropDownData.component" />
        </div>
    </div>
</template>
```

### Data Source
Lee de `Application.dropdownMenu.value`:

```typescript
{
    showing: boolean,
    title: string,
    component: Component | null,
    width: string,              // e.g., '250px'
    position_x: string,         // e.g., '100px'
    position_y: string,         // e.g., '200px'
    canvasWidth: string,        // window.innerWidth
    canvasHeight: string,       // window.innerHeight
    activeElementWidth: string,
    activeElementHeight: string
}
```

### Computed: dropdownStyle

Calcula posición inteligente del dropdown:

```typescript
dropdownStyle() {
    const posX = parseFloat(data.position_x);
    const posY = parseFloat(data.position_y);
    const dropdownWidth = parseFloat(data.width);
    const canvasWidth = parseFloat(data.canvasWidth);
    const canvasHeight = parseFloat(data.canvasHeight);
    const elementHeight = parseFloat(data.activeElementHeight);
    
    // Centrar horizontalmente respecto a posX
    let leftPosition = posX - (dropdownWidth / 2);
    
    // Si se sale por derecha, alinear a la derecha del cursor
    if (leftPosition + dropdownWidth > canvasWidth) {
        leftPosition = posX - dropdownWidth;
    }
    
    // Si se sale por izquierda, alinear a la izquierda del cursor
    if (leftPosition < 0) {
        leftPosition = posX;
    }
    
    // Determinar si está en mitad inferior de pantalla
    const isInBottomHalf = posY > (canvasHeight / 2);
    let topPosition = posY;
    
    // Si está en mitad inferior, mostrar arriba del elemento
    if (isInBottomHalf) {
        topPosition = posY - elementHeight;
    }
    
    return {
        'max-width': data.width,
        'left': `${leftPosition}px`,
        'top': `${topPosition}px`
    };
}
```

### Event Handlers

```typescript
mounted() {
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('keydown', this.handleKeydown);
}

handleClickOutside(event: MouseEvent) {
    if (this.dropDownData.showing) {
        const dropdown = document.getElementById('dropdown-element-in-general');
        if (!dropdown?.contains(event.target as Node)) {
            Application.ApplicationUIService.closeDropdownMenu();
        }
    }
}

handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.dropDownData.showing) {
        Application.ApplicationUIService.closeDropdownMenu();
    }
}
```

### Uso

```typescript
// Abrir dropdown
Application.ApplicationUIService.openDropdownMenu(
    event,              // MouseEvent con posición
    'Menu Title',
    MyCustomComponent,  // Componente a renderizar
    '300px'            // Ancho opcional
);

// Cerrar
Application.ApplicationUIService.closeDropdownMenu();
```

### Características
1. **Posicionamiento inteligente**: Evita salirse del viewport
2. **Click outside**: Cierra al hacer click fuera
3. **ESC key**: Cierra con tecla Escape
4. **Componente dinámico**: Puede renderizar cualquier Vue component
5. **Responsive**: Se adapta a mitad superior/inferior de pantalla

### CSS
```css
.dropdown-menu-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 888;
    pointer-events: none;
    transition: opacity 0.5s ease;
}

.dropdown-menu-container.hidden {
    opacity: 0;
}

.dropdown-menu {
    position: absolute;
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    padding: 1rem;
    pointer-events: all;
}
```

### Z-Index
`888` (debajo de modales pero sobre contenido normal)

---

## 🎯 Interacción Entre Componentes

### Flujo de Navegación Completo

```
1. Usuario click en Sidebar Item
        ↓
2. Application.changeView()
        ↓
3. Application.View.value.component actualizado
        ↓
4. ComponentContainer watch detecta cambio
        ↓
5. LoadingScreen muestra (400ms)
        ↓
6. currentComponent actualizado
        ↓
7. LoadingScreen oculta
        ↓
8. Nueva vista renderizada
        ↓
9. ActionsComponent actualiza botones
        ↓
10. TabController inicializa tabs (si aplica)
```

---

## 📝 Notas Importantes

1. **markRaw()**: ComponentContainer usa `markRaw()` para optimizar performance en componentes dinámicos
2. **Delay de 400ms**: Todas las transiciones tienen delay mínimo para mejor UX
3. **Event cleanup**: Todos los componentes limpian listeners en `beforeUnmount()`
4. **Z-Index hierarchy**: LoadingScreen (99999) > Modal (1500) > Dropdown (888) > Actions (10)
5. **Sticky positioning**: ActionsComponent es sticky y cambia opacity según scroll
6. **Tab validation**: TabController valida que todos sus hijos sean TabComponent
7. **Smart positioning**: DropdownMenu ajusta posición para no salirse del viewport
8. **Keyboard support**: Dropdown cierra con ESC, Modal cierra con ESC

---

**Total de Componentes:** 6  
**Última actualización:** 11 de Febrero, 2026
