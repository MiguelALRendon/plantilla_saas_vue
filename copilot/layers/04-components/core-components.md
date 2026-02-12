# Core Components del Framework

## 1. PROPOSITO

Los componentes core forman estructura principal aplicación proporcionando layout contenedores, navegación tabs, estados carga, menús contextuales. Incluyen ComponentContainerComponent renderiza vista actual dinámicamente con TopBar ActionsComponent LoadingScreen, ActionsComponent barra flotante sticky botones acción, TabControllerComponent y TabComponent sistema navegación pestañas clickeables, LoadingScreenComponent pantalla carga fullscreen transiciones vistas, DropdownMenu menú contextual posicionado inteligentemente viewport boundaries. Garantizan arquitectura modular reactiva framework Vue 3 con Application singleton coordinando estado global UI patterns consistentes.

## 2. ALCANCE

**UBICACION:** src/components/

**COMPONENTES CORE:**
- ComponentContainerComponent.vue: Contenedor principal renderiza vista actual Application.View.component dinámicamente con watch markRaw
- ActionsComponent.vue: Barra flotante sticky renderiza botones Application.ListButtons scroll opacity handling
- TabControllerComponent.vue: Controlador pestañas headers clickeables setActiveTab index management slot validation
- TabComponent.vue: Contenedor contenido tab individual display none active class CSS
- LoadingScreenComponent.vue: Pantalla carga fullscreen opacity transition show-loading hide-loading events
- DropdownMenu.vue: Menú contextual dropdown posicionamiento inteligente smart position click outside ESC key

**RENDERIZADO DINAMICO:**
ComponentContainerComponent usa component :is="currentComponent" renderizando DefaultListView DefaultDetailView custom views según Application.View.value.component reactive property.

**INTEGRATION:**
Application.View.value.component determina vista renderizada, Application.ListButtons.value array buttons ActionsComponent, Application.eventBus emite show-loading hide-loading controla LoadingScreen, Application.dropdownMenu.value estado dropdown showing position component.

## 3. DEFINICIONES CLAVE

**ComponentContainerComponent layout:**
Contenedor principal estructura ViewContainer flex column con TopBarComponent fixed top, ComponentContainer main content area max-height calc(100vh - 50px) overflow auto, ActionsComponent floating sticky buttons, component :is dinámico renderiza vista actual, LoadingScreenComponent absolute overlay. Watch Application.View.value.component detecta cambios ejecutando transition sequence showLoadingScreen delay 400ms updateComponent hideLoadingScreen.

**ActionsComponent sticky behavior:**
Barra flotante position sticky top 0 z-index 10, handleScroll event listener detecta scrollTop === 0 estableciendo isAtTop boolean true, class at-top CSS opacity 1 fully visible, scrolled opacity 0.3 semi-transparent menos intrusivo, hover opacity 1 easy access buttons. Renderiza Application.ListButtons.value array v-for component :is button components configured setButtonList() según ViewType entityPersistence.

**TabController tabs navigation:**
Props tabs array strings nombres pestañas renderizados v-for div.tab headers clickeables, selectedTab number index tab activo default 0, setActiveTab(index) método actualiza selectedTab itera tabElements NodeList agregando removing class active CSS display block none, slot validation computed verifica todos children vnode.type === TabComponent previniendo invalid markup, mounted querySelectorAll('.tab-component') obtiene references activating first tab.

**LoadingScreen fullscreen overlay:**
Position absolute top 50px below TopBar height 100% width 100% z-index 99999 highest priority covering all content, opacity 0 pointer-events none hidden default, class active CSS opacity 1 pointer-events all visible blocking interaction, transition opacity 0.3s ease-in-out smooth fade animation. EventBus listeners show-loading hide-loading events emitted ApplicationUIService showLoadingScreen() hideLoadingScreen() methods controlling visibility state.

**DropdownMenu smart positioning:**
Computed dropdownStyle calcula position left top evitando viewport overflow, centrar horizontalmente leftPosition = posX - (dropdownWidth / 2), ajustar derecha if leftPosition + dropdownWidth mayor canvasWidth, ajustar izquierda if leftPosition menor 0, determinar mitad pantalla isInBottomHalf = posY mayor canvasHeight / 2, mostrar arriba elemento if isInBottomHalf topPosition -= elementHeight, return style object max-width left top CSS inline properties. HandleClickOutside listener closes dropdown click fuera element, handleKeydown listener closes Escape key pressed.

## 4. DESCRIPCION TECNICA

**COMPONENTCONTAINER STRUCTURE:**
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

<script lang="ts">
export default {
    data() {
        return {
            currentComponent: null as Component | null
        };
    },
    created() {
        const init = Application.View.value.component;
        if (init) {
            this.currentComponent = markRaw(init);
        }
        
        watch(() => Application.View.value.component, async (newVal) => {
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
**FUNCIONAMIENTO:** Created hook inicializa currentComponent desde Application.View current state markRaw wrapping evitando Vue reactive proxy overhead, watch Application.View.component detecta changes triggering transition sequence loading screen display 400ms delay component update markRaw wrapped loading screen hide, setTimeout delay UX smooth transition visual feedback user operation in progress, component :is Vue 3 dynamic component rendering actualizado reactive currentComponent ref.

**ACTIONSCOMPONENT SCROLL HANDLING:**
```vue
<template>
    <div class="floating-actions" :class="{ 'at-top': isAtTop }">
        <component 
            v-for="(component, index) in Application.ListButtons.value" 
            :key="index"
            :is="component" 
        />
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            isAtTop: false,
            scrollContainer: null as HTMLElement | null
        };
    },
    mounted() {
        this.scrollContainer = this.$el.closest('.ComponentContainer');
        if (this.scrollContainer) {
            this.scrollContainer.addEventListener('scroll', this.handleScroll);
            this.handleScroll();
        }
    },
    beforeUnmount() {
        if (this.scrollContainer) {
            this.scrollContainer.removeEventListener('scroll', this.handleScroll);
        }
    },
    methods: {
        handleScroll() {
            if (this.scrollContainer) {
                this.isAtTop = this.scrollContainer.scrollTop === 0;
            }
        }
    }
}
</script>
```
**FUNCIONAMIENTO:** Mounted hook busca closest ComponentContainer parent element obteniendo scrollContainer reference, addEventListener scroll handleScroll method monitoring scroll position, handleScroll verifica scrollTop === 0 estableciendo isAtTop true triggering at-top CSS class opacity 1 fully visible, scrolled isAtTop false class removed opacity 0.3 semi-transparent, beforeUnmount cleanup removeEventListener preventing memory leaks, v-for Application.ListButtons.value renders button components dynamically configured Application.setButtonList().

**TABCONTROLLER VALIDATION:**
```typescript
setup() {
    const slots = useSlots();
    
    const isValid = computed(() => {
        const nodes = slots.default?.();
        if (!nodes) return true;
        
        return nodes.every(vnode => vnode.type === TabComponent);
    });
    
    return { isValid };
}

mounted() {
    this.tabElements = document.querySelectorAll('.tab-component');
    this.setActiveTab(0);
}

methods: {
    setActiveTab(index: number) {
        this.selectedTab = index;
        
        this.tabElements?.forEach((el, i) => {
            el.classList.remove('active');
            if (i === index) {
                el.classList.add('active');
            }
        });
    }
}
```
**FUNCIONAMIENTO:** Setup composables useSlots obtiene slot references, computed isValid verifica nodes.every vnode.type === TabComponent validating all children correct type preventing incorrect usage runtime errors, mounted querySelectorAll obtiene all TabComponent elements DOM storing tabElements NodeList reference, setActiveTab initial call activates first tab index 0, setActiveTab method actualiza selectedTab property itera tabElements forEach removing active class all adding active class target index, CSS display none block controls visibility single tab time.

**LOADINGSCREEN EVENTS:**
```vue
<template>
    <div class="loading-screen" :class="{ active: isActive }">
        Loading...
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            isActive: false
        };
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
**FUNCIONAMIENTO:** Data isActive boolean controla visibility state default false, mounted registers eventBus listeners show-loading hide-loading events emitted ApplicationUIService methods, listener callbacks actualiza isActive true false triggering active CSS class binding, class active establece opacity 1 pointer-events all making overlay visible blocking user interaction, beforeUnmount cleanup eventBus.off removing listeners preventing memory leaks component unmount.

**DROPDOWNMENU POSITIONING:**
```typescript
computed: {
    dropdownStyle() {
        const data = Application.ApplicationUIService.dropdownMenu.value;
        const posX = parseFloat(data.position_x);
        const posY = parseFloat(data.position_y);
        const dropdownWidth = parseFloat(data.width);
        const canvasWidth = parseFloat(data.canvasWidth);
        const canvasHeight = parseFloat(data.canvasHeight);
        const elementHeight = parseFloat(data.activeElementHeight);
        
        let leftPosition = posX - (dropdownWidth / 2);
        
        if (leftPosition + dropdownWidth > canvasWidth) {
            leftPosition = posX - dropdownWidth;
        }
        
        if (leftPosition < 0) {
            leftPosition = posX;
        }
        
        const isInBottomHalf = posY > (canvasHeight / 2);
        let topPosition = posY;
        
        if (isInBottomHalf) {
            topPosition = posY - elementHeight;
        }
        
        return {
            'max-width': data.width,
            'left': `${leftPosition}px`,
            'top': `${topPosition}px`
        };
    }
}

methods: {
    handleClickOutside(event: MouseEvent) {
        if (this.dropDownData.showing) {
            const dropdown = document.getElementById('dropdown-element-in-general');
            if (!dropdown?.contains(event.target as Node)) {
                Application.ApplicationUIService.closeDropdownMenu();
            }
        }
    },
    
    handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && this.dropDownData.showing) {
            Application.ApplicationUIService.closeDropdownMenu();
        }
    }
}
```
**FUNCIONAMIENTO:** Computed dropdownStyle calcula position CSS properties evitando overflow viewport, centerPosition horizontal posX minus half dropdownWidth, ajustar rightOverflow leftPosition plus width mayor canvas width estableciendo leftPosition posX minus full width aligning right edge cursor, ajustar leftOverflow leftPosition menor 0 estableciendo posX aligning left edge cursor, isInBottomHalf checks if cursor lower half screen, if true topPosition adjust upwards minus elementHeight showing dropdown above trigger element, return object inline styles max-width left top pixels. HandleClickOutside mounted document listener verifies click target not contains dropdown element calling closeDropdownMenu, handleKeydown window listener checks Escape key pressed calling closeDropdownMenu closing dropdown keyboard shortcut.

## 5. FLUJO DE FUNCIONAMIENTO

**PASO 1 - Inicializar ComponentContainer:**
App.vue monta ComponentContainerComponent ejecutando created hook, obtiene init component desde Application.View.value.component inicializado Application.initializeApplication(), verifica if init not null wrapping markRaw() estableciendo this.currentComponent avoiding Vue reactive proxies, watch Application.View.component registered detectando future changes triggering transition sequence, renderiza template structure TopBar ActionsComponent component :is ActionsComponent LoadingScreen hierarchy layout.

**PASO 2 - ChangeView Trigger Transition:**
Usuario hace clic SideBarItem ejecutando navigation action, Application.changeViewToListView actualiza Application.View.value.component = DefaultListView markRaw wrapped, watch ComponentContainer detecta newVal change executing async callback, ejecuta Application.ApplicationUIService.showLoadingScreen() emitiendo eventBus show-loading event, LoadingScreen listener establece isActive true clase active CSS opacity 1 fullscreen overlay visible, await setTimeout 400ms delay smooth UX transition visual feedback.

**PASO 3 - Update Component Renderizado:**
setTimeout completes 400ms elapsed, ejecuta this.currentComponent = markRaw(newVal) actualizando component ref triggering Vue re-render, component :is Vue directive detects currentComponent change unmounting old component mounting new component lifecycle hooks, DefaultListView mounted hook ejecuta fetching data calling entityClass.all() populating table, ApplicationUIService.hideLoadingScreen() emite hide-loading event, LoadingScreen listener establece isActive false removing active class opacity 0 transition fade out invisible.

**PASO 4 - ActionsComponent Renderiza Buttons:**
ActionsComponent mounted hook ejecuta buscando closest('.ComponentContainer') obteniendo scrollContainer reference, addEventListener scroll handleScroll monitoring scroll events, handleScroll inicial call checks scrollTop === 0 establishing isAtTop true, v-for Application.ListButtons.value itera button components NewButton RefreshButton configured setButtonList() según ViewType, renderiza buttons floating-actions container class at-top CSS opacity 1 fully visible no scroll yet, buttons ready click handlers executing entity actions save validate refresh new.

**PASO 5 - Scroll Opacity Change:**
Usuario scrolls down ComponentContainer main content area, scroll event fires handleScroll callback executing this.scrollContainer.scrollTop obtain current position, verifica scrollTop !== 0 not at top anymore estableciendo isAtTop false removing at-top CSS class, CSS transition opacity 0.3s ease triggers opacity change 1 to 0.3 semi-transparent less intrusive, botones siguen visible pero discretos no bloqueando visual content, usuario hover floating-actions CSS :hover opacity 1 temporarily fully visible easy access buttons, scroll top isAtTop true clase agregada opacity 1 restored.

**PASO 6 - TabController Initialize Tabs:**
DefaultDetailView renderiza TabControllerComponent pasando props :tabs="entity.getArrayKeysOrdered()" array strings tab names, TabController created execute setup composables useSlots validation verifying children TabComponents, mounted querySelectorAll('.tab-component') obteniendo NodeList references all Tab components children, ejecuta setActiveTab(0) initial activation first tab index 0, setActiveTab itera tabElements forEach removing active class all elements adding active class element index 0, tab-component CSS display block first tab display none rest tabs hidden, headers.tab-container-row renderiza v-for tabs array clickables.

**PASO 7 - Tab Click Navigation:**
Usuario hace clic segundo tab header div.tab @click="setActiveTab(1)" handler trigger, setActiveTab(1) method ejecuta updating this.selectedTab = 1 property state, itera tabElements NodeList forEach iteration index, remueve active class all elements el.classList.remove('active') hiding all tabs, verifica if i === 1 matching target index adding active class el.classList.add('active'), CSS display block second tab visible display none first tab hidden, visual transition smooth border-radius border color change active tab styling highlight selection.

**PASO 8 - Dropdown Open Event:**
Usuario hace click button trigger dropdown menu, código ejecuta ApplicationUIService.openDropdownMenu(event, title, MenuComponent, width), service calcula position desde event.clientX clientY obteniendo trigger element getBoundingClientRect(), establece dropdownMenu.value {showing: true, title, component, position_x, position_y, width, canvasWidth window.innerWidth, canvasHeight window.innerHeight, activeElementWidth height}, DropdownMenu computed dropdownStyle recalcula ejecutando smart positioning logic avoiding viewport overflow, renderiza component :is="dropDownData.component" dynamic menu content container posición absolute left top calculados.

**PASO 9 - Dropdown Click Outside:**
Usuario hace click fuera dropdown area quiere cerrar menu, document click event fires handleClickOutside listener executing, obtiene dropdown element document.getElementById('dropdown-element-in-general'), verifica if !dropdown.contains(event.target) click outside element not child, ejecuta ApplicationUIService.closeDropdownMenu() estableciendo dropdownMenu.value.showing = false, DropdownMenu :class binding adds hidden class CSS opacity 0 transition fade out invisible, pointer-events none no blocking interaction content below.

**PASO 10 - Escape Key Close:**
Usuario presiona Escape key keyboard shortcut cerrar dropdown, window keydown event fires handleKeydown listener executing, verifica if e.key === 'Escape' && dropDownData.showing menu open, ejecuta ApplicationUIService.closeDropdownMenu() mismo close logic click outside, hidden class added opacity 0 transition smooth close animation, pattern consistente close modals dropdowns any overlay ESC key universal close shortcut accessibility keyboard navigation users.

## 6. REGLAS OBLIGATORIAS

**REGLA 1:** SIEMPRE wrap components con markRaw() en ComponentContainer currentComponent evitando Vue reactive proxy overhead performance optimization.

**REGLA 2:** SIEMPRE ejecutar setTimeout 400ms delay ComponentContainer watch antes updateComponent permitiendo LoadingScreen display smooth transition UX.

**REGLA 3:** SIEMPRE cleanup eventBus listeners beforeUnmount hook LoadingScreen ActionsComponent evitando memory leaks component unmounted.

**REGLA 4:** SIEMPRE verificar TabController children validation setup ensuring all slots TabComponent type previniendo invalid markup runtime errors.

**REGLA 5:** SIEMPRE establecer z-index hierarchy LoadingScreen 99999 highest Dropdown 888 mid ActionsComponent 10 low evitando visual conflicts stacking.

**REGLA 6:** SIEMPRE handle click outside Escape key DropdownMenu proporcionando consistent close patterns user expectations accessibility.

**REGLA 7:** SIEMPRE removeEventListener scrollContainer beforeUnmount ActionsComponent preventing memory leaks avoiding multiple handlers registered.

## 7. PROHIBICIONES

**PROHIBIDO:** Omitir markRaw() wrapper dynamic components ComponentContainer causando Vue create reactive proxies unnecessary overhead memory consumption.

**PROHIBIDO:** Actualizar currentComponent sin showLoadingScreen hideLoadingScreen sequence causing abrupt jarring transitions poor UX visual glitches.

**PROHIBIDO:** Olvidar removeEventListener cleanup beforeUnmount hooks causing memory leaks event handlers accumulate component mount unmount cycles.

**PROHIBIDO:** Modificar Application.ListButtons.value directamente ActionsComponent template, usar Application.setButtonList() centralized management method.

**PROHIBIDO:** Hardcodear tab components hierachy TabController sin slot validation, usar setup useSlots validation ensuring correct structure runtime.

**PROHIBIDO:** Ignorar click outside Escape key handlers DropdownMenu causing dropdown stuck open no close mechanism frustrating user experience.

**PROHIBIDO:** Usar position fixed ActionsComponent, usar position sticky allowing scroll behavior opacity transitions at-top detection.

## 8. DEPENDENCIAS

**MODELS:**
- Application: Singleton con View.value ListButtons.value eventBus ApplicationUIService dropdownMenu properties methods changeViewToListView changeViewToDetailView setButtonList
- ApplicationUIService: showLoadingScreen hideLoadingScreen openDropdownMenu closeDropdownMenu methods managing UI states

**COMPONENTS:**
- TopBarComponent: Rendered ComponentContainer fixed top showing module title
- DefaultListView: Dynamic component rendered ComponentContainer currentComponent
- DefaultDetailView: Dynamic component rendered ComponentContainer currentComponent
- Button components: NewButton SaveButton RefreshButton ValidateButton rendered ActionsComponent v-for ListButtons

**ENUMS:**
- ViewTypes: LISTVIEW DETAILVIEW determining setButtonList button configuration

**VUE COMPOSABLES:**
- useSlots: TabController validation accessing slot children vnodes
- watch: ComponentContainer monitoring Application.View.component changes
- markRaw: Performance optimization preventing Vue reactive proxies dynamic components

**CSS VARIABLES:**
- --white --bg-gray --sky --border-gray colors backgrounds borders
- --border-radius --shadow-light --shadow-dark styling effects
- --btn-secondary --btn-info button colors variants

## 9. RELACIONES

**COMPONENTCONTAINER Y APPLICATION VIEW:**
ComponentContainer watch Application.View.value.component reactive property detecting changes executing transition sequence, Application.changeViewToListView changeViewToDetailView methods update View.component triggering watch callback, markRaw wrapper prevents Vue reactive tracking dynamic component instances optimizing performance memory, currentComponent ref updated triggers component :is Vue directive re-render mounting new component unmounting previous lifecycle hooks executed.

**ACTIONSCOMPONENT Y LISTBUTTONS:**
ActionsComponent v-for itera Application.ListButtons.value array rendering button components dynamically, Application.setButtonList() method updates ListButtons según ViewType entityPersistence determinando which buttons show hide, markRaw wrapped buttons no reactive proxies reducing memory overhead, scroll handling opacity changes at-top class semi-transparent scrolled fully visible top hover providing visual feedback scroll position less intrusive buttons content scrolled.

**TABCONTROLLER Y TABCOMPONENT HIERARCHY:**
TabController parent slot children TabComponent required structure, setup validation useSlots verifies all vnodes type TabComponent preventing invalid children runtime warnings, querySelectorAll tabElements NodeList references managing active state CSS classes, setActiveTab method itera NodeList adding removing active class controlling display block none single tab visible time, headers v-for tabs array string names clickable @click handlers index parameter setActiveTab method call synchronized selection.

**LOADINGSCREEN Y EVENTBUS:**
LoadingScreen componentmounted registers eventBus listeners show-loading hide-loading events, ApplicationUIService showLoadingScreen hideLoadingScreen methods emit events controlling visibility state, ComponentContainer watch callback calls showLoadingScreen before delay hideLoadingScreen after update executing transition sequence smooth UX, z-index 99999 highest priority covering all content blocking interaction during loading states, beforeUnmount eventBus.off cleanup prevent memory leaks component lifecycle management.

**DROPDOWNMENU SMART POSITIONING:**
Computed dropdownStyle reads Application.ApplicationUIService.dropdownMenu.value reactive state position width canvas dimensions, calcula left top CSS properties avoiding viewport overflow centerPosition horizontal adjustment overflow detection right left boundaries, isInBottomHalf determines vertical position above below trigger element preventing cut-off lower screen area, handleClickOutside document listener closes dropdown click outside element boundary, handleKeydown window listener closes Escape key universal keyboard shortcut consistent pattern modals overlays.

**MARKRAW PERFORMANCE PATTERN:**
ComponentContainer TabController ActionsComponent use markRaw() wrapping component instances preventing Vue create reactive proxies deep tracking, dynamic components rendered component :is directive no need reactivity internal component state only mount unmount operations, reduces memory footprint eliminates unnecessary watchers computed dependencies overhead, ListButtons array itself reactive Ref but items array markRaw wrapped balance reactivity where needed performance where unnecessary.

## 10. NOTAS DE IMPLEMENTACION

**EJEMPLO COMPONENTCONTAINER USAGE:**
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

<script lang="ts">
import { markRaw, watch } from 'vue';
import Application from '@/models/application';

export default {
    data() {
        return {
            currentComponent: null
        };
    },
    created() {
        const init = Application.View.value.component;
        if (init) {
            this.currentComponent = markRaw(init);
        }
        
        watch(() => Application.View.value.component, async (newVal) => {
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

<style scoped>
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
    max-height: calc(100vh - 50px);
    overflow: auto;
    background-color: var(--bg-gray);
    border-radius: var(--border-radius);
}
</style>
```

**EJEMPLO ACTIONSCOMPONENT SCROLL:**
```typescript
// ActionsComponent scroll handling
data() {
    return {
        isAtTop: false,
        scrollContainer: null
    };
},

mounted() {
    this.scrollContainer = this.$el.closest('.ComponentContainer');
    if (this.scrollContainer) {
        this.scrollContainer.addEventListener('scroll', this.handleScroll);
        this.handleScroll();
    }
},

beforeUnmount() {
    if (this.scrollContainer) {
        this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }
},

methods: {
    handleScroll() {
        if (this.scrollContainer) {
            this.isAtTop = this.scrollContainer.scrollTop === 0;
        }
    }
}

// CSS
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

**EJEMPLO TABCONTROLLER VALIDATION:**
```vue
<template>
    <div class="tab-container">
        <div class="tab-container-row">
            <div class="tab" 
                v-for="(tab, index) in tabs" 
                :key="index"
                :class="{ active: index == selectedTab }"
                @click="setActiveTab(index)">
                <span>{{ tab }}</span>
            </div>
        </div>
        
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { computed, useSlots } from 'vue';
import TabComponent from './TabComponent.vue';

export default {
    props: {
        tabs: {
            type: Array,
            required: true
        }
    },
    
    setup() {
        const slots = useSlots();
        
        const isValid = computed(() => {
            const nodes = slots.default?.();
            if (!nodes) return true;
            
            return nodes.every(vnode => vnode.type === TabComponent);
        });
        
        return { isValid };
    },
    
    data() {
        return {
            selectedTab: 0,
            tabElements: null
        };
    },
    
    mounted() {
        this.tabElements = document.querySelectorAll('.tab-component');
        this.setActiveTab(0);
    },
    
    methods: {
        setActiveTab(index) {
            this.selectedTab = index;
            
            this.tabElements?.forEach((el, i) => {
                el.classList.remove('active');
                if (i === index) {
                    el.classList.add('active');
                }
            });
        }
    }
}
</script>
```

**EJEMPLO USAGE TABCONTROLLER:**
```vue
<TabControllerComponent :tabs="['General', 'Details', 'Relations']">
    <TabComponent>
        <h3>General Information</h3>
        <TextInputComponent property-key="name" />
        <TextInputComponent property-key="description" />
    </TabComponent>
    
    <TabComponent>
        <h3>Detailed Information</h3>
        <NumberInputComponent property-key="price" />
        <DateInputComponent property-key="createdAt" />
    </TabComponent>
    
    <TabComponent>
        <h3>Relations</h3>
        <ArrayInputComponent property-key="orders" />
        <ObjectInputComponent property-key="customer" />
    </TabComponent>
</TabControllerComponent>
```

**EJEMPLO DROPDOWNMENU POSITIONING:**
```typescript
// DropdownMenu computed positioning
computed: {
    dropdownStyle() {
        const data = Application.ApplicationUIService.dropdownMenu.value;
        const posX = parseFloat(data.position_x);
        const posY = parseFloat(data.position_y);
        const dropdownWidth = parseFloat(data.width);
        const canvasWidth = parseFloat(data.canvasWidth);
        const canvasHeight = parseFloat(data.canvasHeight);
        const elementHeight = parseFloat(data.activeElementHeight);
        
        // Center horizontally
        let leftPosition = posX - (dropdownWidth / 2);
        
        // Adjust if overflow right
        if (leftPosition + dropdownWidth > canvasWidth) {
            leftPosition = posX - dropdownWidth;
        }
        
        // Adjust if overflow left
        if (leftPosition < 0) {
            leftPosition = posX;
        }
        
        // Determine vertical position
        const isInBottomHalf = posY > (canvasHeight / 2);
        let topPosition = posY;
        
        if (isInBottomHalf) {
            topPosition = posY - elementHeight;
        }
        
        return {
            'max-width': data.width,
            'left': `${leftPosition}px`,
            'top': `${topPosition}px`
        };
    }
}

// Usage openDropdownMenu
function openUserMenu(event) {
    Application.ApplicationUIService.openDropdownMenu(
        event,
        'User Options',
        UserMenuComponent,
        '250px'
    );
}

// Close handlers
handleClickOutside(event) {
    if (this.dropDownData.showing) {
        const dropdown = document.getElementById('dropdown-element-in-general');
        if (!dropdown?.contains(event.target)) {
            Application.ApplicationUIService.closeDropdownMenu();
        }
    }
}

handleKeydown(e) {
    if (e.key === 'Escape' && this.dropDownData.showing) {
        Application.ApplicationUIService.closeDropdownMenu();
    }
}
```

**Z-INDEX HIERARCHY:**
```css
/* Z-index priority levels */
.loading-screen {
    z-index: 99999;  /* Highest - blocks everything */
}

.modal {
    z-index: 1500;   /* High - modal dialogs */
}

.dropdown-menu-container {
    z-index: 888;    /* Medium - contextual menus */
}

.floating-actions {
    z-index: 10;     /* Low - sticky buttons */
}
```

**DEBUGGING CORE COMPONENTS:**
```typescript
// Ver component actual renderizado
console.log('Current component:', Application.View.value.component?.name);

// Ver buttons actuales
console.log('Buttons:', Application.ListButtons.value.map(b => b.name));

// Ver scroll position
const container = document.querySelector('.ComponentContainer');
console.log('Scroll top:', container?.scrollTop);

// Ver dropdown state
console.log('Dropdown:', Application.ApplicationUIService.dropdownMenu.value);

// Testear loading screen
Application.ApplicationUIService.showLoadingScreen();
setTimeout(() => {
    Application.ApplicationUIService.hideLoadingScreen();
}, 2000);

// Verificar tab active index
const tabController = this.$refs.tabController;
console.log('Active tab:', tabController.selectedTab);
```

**LIMITACIONES ACTUALES:**
ComponentContainer delay 400ms hardcoded no configurable, podría agregar prop delay customizable different transition speeds. ActionsComponent scroll detection solo verifica scrollTop === 0, no gradual opacity based scroll distance implementing progressive transparency. TabController no keyboard navigation arrows left right tab switching, solo mouse click headers accessibility limitation. DropdownMenu positioning calcula client-side JavaScript, no CSS solution limiting SSR compatibility. LoadingScreen no progress indicator spinner, solo text "Loading..." generic feedback sin visual animation.

## 11. REFERENCIAS CRUZADAS

**DOCUMENTOS RELACIONADOS:**
- ActionsComponent.md: Detalle completo barra flotante buttons scroll behavior
- LoadingScreenComponent.md: Documentación específica loading screen states transitions
- TabComponents.md: Sistema tabs controller component hierarchy navegación
- DropdownMenu.md: Menú contextual positioning smart boundaries click outside
- TopBarComponent.md: Barra superior título módulo rendered ComponentContainer
- buttons-overview.md: Buttons rendered ActionsComponent ListButtons array
- application-singleton.md: Application.View Application.ListButtons properties changeView methods
- event-bus.md: EventBus show-loading hide-loading events emitted consumed
- DefaultListView.md: Vista renderizada dinámicamente ComponentContainer currentComponent
- DefaultDetailView.md: Vista formulario renderizada ComponentContainer con tabs arrays

**UBICACION:** copilot/layers/04-components/core-components.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
