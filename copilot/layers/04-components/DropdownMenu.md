# DropdownMenu

## 1. Propósito

DropdownMenu es un menú desplegable posicionable dinámicamente que aparece como overlay en respuesta a clicks en elementos de UI, renderizando componentes Vue arbitrarios como contenido contextual. El componente implementa posicionamiento inteligente que calcula automáticamente la mejor ubicación para evitar salirse de pantalla, ajustando posición horizontal y vertical según dimensiones de ventana y elemento trigger. Proporciona cierre mediante tecla ESC o click fuera del menú, gestionando listeners globales para detección de eventos. Se integra con Application.dropdownMenu.value como fuente reactiva de estado y utiliza ApplicationUIService para control centralizado de apertura/cierre.

**Ubicación del código fuente:** src/components/DropdownMenuComponent.vue

**Patrón de diseño:** Dynamic Component Renderer + Smart Positioning + Global Event Handling

## 2. Alcance

### Responsabilidades

1. **Renderizado de Contenido Dinámico:**
   - Renderizar component dinámico mediante directiva :is desde Application.dropdownMenu.value.component
   - Mostrar título dinámico desde Application.dropdownMenu.value.title
   - Aplicar visibilidad mediante clase hidden basada en dropDownData.showing
   - Utilizar markRaw() para componentes para prevenir proxy reactivo innecesario

2. **Posicionamiento Inteligente:**
   - Calcular posición horizontal intentando centrar respecto a elemento trigger
   - Ajustar leftPosition si dropdown excede canvasWidth por la derecha
   - Ajustar leftPosition si dropdown es negativo (se sale por izquierda)
   - Calcular posición vertical: arriba del trigger si está en mitad inferior de pantalla, abajo si está en mitad superior
   - Generar objeto de estilos dinámicos con max-width, left y top calculados

3. **Gestión de Eventos Globales:**
   - Registrar listener de click en document para detectar click fuera del dropdown
   - Registrar listener de keydown en window para detectar tecla ESC
   - Verificar si click fue dentro o fuera del elemento #dropdown-element-in-general
   - Ejecutar ApplicationUIService.closeDropdownMenu() cuando corresponda
   - Limpiar ambos listeners en beforeUnmount() para prevenir memory leaks

4. **Integración con Application:**
   - Leer estado desde computed dropDownData que retorna Application.dropdownMenu.value
   - Reaccionar a cambios en Application.dropdownMenu.value mediante reactividad Vue
   - No modificar Application.dropdownMenu.value directamente, solo leer
   - Delegar control de estado a ApplicationUIService

### Límites

1. **NO gestiona lógica de contenido** - El componente renderizado tiene su propia lógica
2. **NO valida tipo de componente** - Asume que component es válido Vue component
3. **NO previene apertura múltiple** - ApplicationUIService debe gestionar exclusividad
4. **NO ajusta tamaño del componente hijo** - width es fixed desde Application.dropdownMenu.value.width
5. **NO persiste estado entre aperturas** - component se limpia en cierre con setTimeout
6. **NO renderiza múltiples dropdowns simultáneos** - Solo uno activo a la vez
7. **NO implementa transiciones de entrada personalizadas** - Solo opacity via clase hidden
8. **NO proporciona scroll interno** - Componente hijo debe manejar overflow si necesario

## 3. Definiciones Clave

**DropdownMenu**: Componente Vue de overlay que renderiza contenido dinámico posicionado absolutamente respecto a elemento trigger, con cierre automático via ESC o click outside.

**dropDownData**: Computed property que retorna Application.dropdownMenu.value, conteniendo: showing (boolean), title (string), component (Component | null), width (string), position_x (string), position_y (string), canvasWidth (string), canvasHeight (string), activeElementWidth (string), activeElementHeight (string).

**dropdownStyle**: Computed property que calcula objeto de estilos CSS dinámicos con max-width, left y top, aplicando algoritmo de posicionamiento inteligente para evitar salirse de viewport.

**handleClickOutside**: Method que recibe MouseEvent, verifica si click fue fuera del elemento #dropdown-element-in-general mediante contains(), y ejecuta closeDropdownMenu() si corresponde.

**handleKeydown**: Method que recibe KeyboardEvent, verifica si tecla presionada fue Escape y dropDownData.showing es true, ejecutando closeDropdownMenu().

**Smart Positioning Algorithm**: Lógica que calcula posición óptima: centrado horizontal con ajustes para evitar overflow, posición vertical arriba del trigger si está en mitad inferior de pantalla, abajo si está en superior.

**markRaw()**: Función de Vue 3 que previene que objeto sea convertido en proxy reactivo, requerida para componentes dinámicos almacenados en reactive state para prevenir warnings y overhead.

## 4. Descripción Técnica

DropdownMenu implementa template con estructura de dos divs anidados: dropdown-menu-container (overlay full-screen con pointer-events: none para no bloquear fondo) y dropdown-menu (card posicionado absolutamente con pointer-events: all para interceptar clicks). El container aplica clase hidden condicionalmente basada en !dropDownData.showing para transición de opacity. El menu card contiene span con título dinámico y component tag con :is directive bindeado a dropDownData.component.

El computed dropDownData retorna Application.dropdownMenu.value, estableciendo reactive dependency que causa re-render cuando Application actualiza dropdownMenu. El computed dropdownStyle ejecuta algoritmo de posicionamiento: parsea values de position_x, position_y, width, canvasWidth, canvasHeight y activeElementHeight desde dropDownData, calcula leftPosition inicial como posX - (dropdownWidth / 2) para centrado, ajusta si leftPosition + dropdownWidth > canvasWidth (alinea derecha), ajusta si leftPosition < 0 (alinea izquierda), calcula topPosition como posY por default, verifica si posY > canvasHeight / 2 para determinar isInBottomHalf, si true ajusta topPosition como posY - elementHeight (aparece arriba), retorna objeto con max-width, left y top.

Los methods handleClickOutside y handleKeydown implementan lógica de cierre: handleClickOutside obtiene referencia a #dropdown-element-in-general, verifica si event.target está contenido usando contains(), si no está contenido ejecuta ApplicationUIService.closeDropdownMenu(); handleKeydown verifica si e.key === 'Escape' y dropDownData.showing, ejecutando closeDropdownMenu().

El lifecycle hook mounted() registra listeners: document.addEventListener('click', this.handleClickOutside) y window.addEventListener('keydown', this.handleKeydown). El hook beforeUnmount() limpia: document.removeEventListener('click', this.handleClickOutside) y window.removeEventListener('keydown', this.handleKeydown).

ApplicationUIService.openDropdownMenu() recibe position (HTMLElement), title (string), component (Component) y opcional width (string), ejecuta getBoundingClientRect() en position para obtener dimensiones y posición, establece values en Application.dropdownMenu.value, usa markRaw(component) para prevenir proxy reactive, establece showing: true. ApplicationUIService.closeDropdownMenu() establece showing: false, ejecuta setTimeout de 500ms para limpiar component y title permitiendo animación de salida.

## 5. Flujo de Funcionamiento

**Apertura del Dropdown:**
1. Usuario click en botón con ref en componente padre
2. Componente padre ejecuta Application.ApplicationUIService.openDropdownMenu(this.$refs.button, 'Title', Component, '300px')
3. ApplicationUIService ejecuta getBoundingClientRect() en button para obtener rect
4. Establece Application.dropdownMenu.value.position_x = rect.left + 'px'
5. Establece Application.dropdownMenu.value.position_y = rect.bottom + 'px'
6. Establece Application.dropdownMenu.value.activeElementWidth = rect.width + 'px'
7. Establece Application.dropdownMenu.value.activeElementHeight = rect.height + 'px'
8. Establece Application.dropdownMenu.value.canvasWidth = window.innerWidth + 'px'
9. Establece Application.dropdownMenu.value.canvasHeight = window.innerHeight + 'px'
10. Establece Application.dropdownMenu.value.title = 'Title'
11. Establece Application.dropdownMenu.value.component = markRaw(Component)
12. Establece Application.dropdownMenu.value.width = '300px'
13. Establece Application.dropdownMenu.value.showing = true
14. DropdownMenu computed dropDownData detecta cambio vía reactividad
15. Template remueve clase hidden de dropdown-menu-container
16. Transition de opacity ejecuta 0 to 1 en 0.5s
17. Computed dropdownStyle recalcula posición con nuevos values
18. Template aplica estilos dinámicos a dropdown-menu
19. Component tag renderiza Component mediante :is directive
20. Dropdown aparece posicionado correctamente

**Cierre por Click Outside:**
1. Usuario click en área fuera del dropdown
2. Listener de click en document ejecuta handleClickOutside con MouseEvent
3. Method verifica dropDownData.showing es true
4. Obtiene referencia a #dropdown-element-in-general
5. Ejecuta contains(event.target) que retorna false
6. Ejecuta Application.ApplicationUIService.closeDropdownMenu()
7. ApplicationUIService establece Application.dropdownMenu.value.showing = false
8. Computed dropDownData detecta cambio
9. Template aplica clase hidden
10. Transition de opacity ejecuta 1 to 0 en 0.5s
11. setTimeout de 500ms ejecuta callback
12. Callback limpia component = null y title = ''
13. Dropdown desaparece completamente

**Cierre por Tecla ESC:**
1. Usuario presiona tecla Escape
2. Listener de keydown en window ejecuta handleKeydown con KeyboardEvent
3. Method verifica e.key === 'Escape' y dropDownData.showing es true
4. Ejecuta Application.ApplicationUIService.closeDropdownMenu()
5. Flujo continúa como cierre por click outside desde paso 7

**Ajuste de Posicionamiento cuando se Sale de Pantalla:**
1. ApplicationUIService establece position_x muy a la derecha (ej: 1800px)
2. Computed dropdownStyle calcula leftPosition = 1800 - (300/2) = 1650px
3. Verifica 1650 + 300 > 1920 (canvasWidth) es true
4. Ajusta leftPosition = 1800 - 300 = 1500px
5. Retorna styles con left: '1500px'
6. Dropdown aparece alineado a la derecha del trigger, no centrado

## 6. Reglas Obligatorias

### 6.1 Uso de markRaw() para Componentes

SIEMPRE usar markRaw() al establecer component en Application.dropdownMenu.value:

```typescript
// ✅ CORRECTO
this.app.dropdownMenu.value.component = markRaw(component);

// ❌ INCORRECTO - Genera warnings y overhead
this.app.dropdownMenu.value.component = component;
```

### 6.2 Limpieza de Listeners Obligatoria

SIEMPRE limpiar event listeners en beforeUnmount():

```typescript
beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('keydown', this.handleKeydown);
}
```

### 6.3 ID Único del Dropdown

El elemento dropdown DEBE tener id="dropdown-element-in-general" para handleClickOutside:

```vue
<div class="dropdown-menu" id="dropdown-element-in-general">
```

### 6.4 Computed dropDownData

SIEMPRE retornar Application.dropdownMenu.value directamente, NO copiar:

```typescript
computed: {
    dropDownData() {
        return Application.dropdownMenu.value;  // ✅ Referencia reactiva
        // NO: return { ...Application.dropdownMenu.value }  // ❌ Pierde reactividad
    }
}
```

### 6.5 Delay en Limpieza de Component

Limpieza de component DEBE usar setTimeout de 500ms para permitir animación de salida:

```typescript
closeDropdownMenu() {
    this.app.dropdownMenu.value.showing = false;
    setTimeout(() => {
        this.app.dropdownMenu.value.component = null;
        this.app.dropdownMenu.value.title = '';
    }, 500);
}
```

### 6.6 Z-Index Hierarchy

Container DEBE usar token de z-index contractual:

```css
.dropdown-menu-container {
    z-index: var(--z-overlay);
}
```

### 6.7 Posicionamiento por clases

El componente DEBE evitar `:style` inline en template y script. El posicionamiento dinámico se resuelve mediante clases semánticas (`dropdown-pos-left|center|right`, `dropdown-pos-top|bottom`) y clases de ancho (`dropdown-width-sm|md|lg|xl`) calculadas en computed properties.

### 6.8 Tokenización obligatoria de estilos visuales

Todas las propiedades visuales del dropdown (`transition`, `padding`, `font-size`, `margin`, `max-width fallback`) DEBEN usar tokens de `constants.css`. No se permiten valores literales repetibles.

### 6.9 Fallbacks CSS con tokens

Los anchos y offsets por clase DEBEN usar tokens de `constants.css` (por ejemplo `--dropdown-default-width`, `--spacing-*`) y no valores literales hardcodeados.

## 7. Prohibiciones

1. NO modificar Application.dropdownMenu.value desde DropdownMenu component - Solo ApplicationUIService lo gestiona
2. NO renderizar múltiples instancias de DropdownMenu - Solo una en App.vue
3. NO aplicar position: fixed al dropdown-menu - Usar absolute con posicionamiento dinámico
4. NO usar v-if en lugar de clase hidden - Destruye component durante transición
5. NO registrar listeners en window para click outside - Usar document.addEventListener
6. NO olvidar stopPropagation() en elemento trigger - Primer click cierra dropdown inmediatamente
7. NO aplicar pointer-events: all al container - Debe ser none para no bloquear fondo
8. NO usar transiciones CSS en left/top - Solo opacity para performance
9. NO almacenar estado en data del componente - Application.dropdownMenu.value es fuente única
10. NO validar contenido del componente hijo - Es responsabilidad del componente hijo
11. NO usar `:style="..."` ni `element.style.setProperty(...)` para posicionamiento del dropdown

## 8. Dependencias

### Dependencias Directas

**Application Singleton:**
- Application.dropdownMenu.value - Reactive state con showing, title, component, width, positions
- Application.ApplicationUIService.openDropdownMenu() - Abrir dropdown con parámetros
- Application.ApplicationUIService.closeDropdownMenu() - Cerrar dropdown y limpiar state

**Vue Core:**
- markRaw() - Prevenir proxy reactivo en componentes dinámicos
- Composition API: computed, mounted, beforeUnmount, data
- Directivas: :is, :class, v-if

**DOM APIs:**
- document.addEventListener('click') - Detectar click outside
- window.addEventListener('keydown') - Detectar tecla ESC
- document.getElementById() - Obtener referencia a dropdown
- Element.contains() - Verificar si click fue dentro/fuera
- event.target - Obtener elemento clicked
- getBoundingClientRect() - Obtener dimensiones y posición de trigger

### Dependencias de CSS

- Variables: --white, --border-radius, --shadow-dark, --gray-dark, --gray-lighter
- Transiciones: opacity 0.5s ease
- Positioning: absolute, fixed
- Z-index: token contractual (`var(--z-overlay)`)

### Dependencias Implícitas

- Componentes pasados como content deben ser válidos Vue components
- ApplicationUIService debe gestionar exclusividad (un dropdown a la vez)
- Trigger elements deben tener dimensiones medibles para getBoundingClientRect()

## 9. Relaciones

**Componentes Relacionados:**

DropdownMenu ← ApplicationUIService (control de apertura/cierre)
DropdownMenu → Dynamic Component (renderiza componente arbitrario)
DropdownMenu ← Trigger Components (botones, links que abren dropdown)

**Flujo de Comunicación:**

Trigger Component → click event → ApplicationUIService.openDropdownMenu() → Application.dropdownMenu.value → DropdownMenu.computed → reactivity → render

DropdownMenu.handleClickOutside → ApplicationUIService.closeDropdownMenu() → Application.dropdownMenu.value.showing = false → DropdownMenu.computed → hide

**Documentos Relacionados:**

- application-singleton.md - Application.dropdownMenu.value estructura
- ui-services.md - ApplicationUIService.openDropdownMenu() y closeDropdownMenu()
- core-components.md - Visión general de componentes core
- modal-components.md - Comparación con modales (z-index, blocking)

**Casos de Uso Típicos:**

- Menús contextuales en filas de tabla
- Filtros desplegables en listviews
- Formularios rápidos inline
- Selector de opciones con custom UI
- Menús de acciones en botones

## 10. Notas de Implementación

### Uso desde Componente Padre

```vue
<template>
    <button ref="optionsButton" @click="showOptions">
        Options ▼
    </button>
</template>

<script>
import Application from '@/models/application';
import OptionsMenuComponent from '@/components/OptionsMenuComponent.vue';

export default {
    methods: {
        showOptions() {
            Application.ApplicationUIService.openDropdownMenu(
                this.$refs.optionsButton,
                'Options',
                OptionsMenuComponent,
                '200px'
            );
        }
    }
}
</script>
```

### Componente de Contenido

```vue
<!-- OptionsMenuComponent.vue -->
<template>
    <div class="options-menu">
        <button @click="editItem">Edit</button>
        <button @click="deleteItem">Delete</button>
        <button @click="duplicateItem">Duplicate</button>
    </div>
</template>

<script>
export default {
    name: 'OptionsMenuComponent',
    methods: {
        editItem() { /* lógica */ },
        deleteItem() { /* lógica */ },
        duplicateItem() { /* lógica */ }
    }
}
</script>
```

### Prevenir Cierre en Primer Click

El trigger debe usar stopPropagation() para evitar que primer click cierre dropdown:

```vue
<button @click.stop="showDropdown">...</button>
```

### Z-Index Hierarchy

```
Contenido normal: z-index < 888
DropdownMenu container: var(--z-overlay)
DropdownMenu card: hereda stacking context del container
Modal overlay: 1000
Modal content: 1001
LoadingScreen: 1100
Confirmation: 1500
```

### Estilos Críticos

```css
.dropdown-menu-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 888;
    display: flex;
    transition: opacity 0.5s ease;
    pointer-events: none;
}

.dropdown-menu-container.hidden {
    opacity: 0;
}

.dropdown-menu {
    position: absolute;
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    padding: 1rem;
    min-width: var(--table-width-medium);
    max-width: var(--table-width-extra-large);
    z-index: 889;
    pointer-events: all;
}

.dropdown-menu.dropdown-pos-left {
    left: var(--spacing-small);
}

.dropdown-menu.dropdown-pos-center {
    left: 50%;
    transform: translateX(-50%);
}

.dropdown-menu.dropdown-pos-right {
    right: var(--spacing-small);
}

.dropdown-menu.dropdown-pos-top {
    top: var(--spacing-small);
}

.dropdown-menu.dropdown-pos-bottom {
    bottom: var(--spacing-small);
}

.dropdown-menu-title {
    display: block;
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--gray-dark);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--gray-lighter);
}
```

### Debugging

```javascript
// Ver estado del dropdown
console.log('Dropdown data:', Application.dropdownMenu.value);

// Ver posición calculada
const menu = document.getElementById('dropdown-element-in-general');
console.log('Position:', menu.style.left, menu.style.top);
console.log('Size:', menu.style.maxWidth);

// Simular apertura
Application.ApplicationUIService.openDropdownMenu(
    document.querySelector('button'),
    'Test',
    { template: '<div>Test Content</div>' }
);
```

### Casos de Uso

**Menú de Opciones en Tabla:**

```typescript
Application.ApplicationUIService.openDropdownMenu(
    event.target,
    'Row Options',
    RowOptionsComponent
);
```

**Dropdown de Filtros:**

```typescript
Application.ApplicationUIService.openDropdownMenu(
    filterButton,
    'Filters',
    FilterFormComponent,
    '300px'
);
```

**Mini Formulario:**

```typescript
Application.ApplicationUIService.openDropdownMenu(
    addButton,
    'Quick Add',
    QuickAddFormComponent,
    '350px'
);
```

## 11. Referencias Cruzadas

**Application Layer:**
- [application-singleton.md](../03-application/application-singleton.md) - Application.dropdownMenu.value estructura
- [ui-services.md](../03-application/ui-services.md) - ApplicationUIService.openDropdownMenu() y closeDropdownMenu()

**Componentes Relacionados:**
- [core-components.md](core-components.md) - Visión general de componentes core del framework
- [modal-components.md](modal-components.md) - Comparación con sistema de modales
- [LoadingScreenComponent.md](LoadingScreenComponent.md) - Z-index hierarchy
- [ToastComponents.md](ToastComponents.md) - Notificaciones no-blocking

**Arquitectura:**
- [02-FLOW-ARCHITECTURE.md](../../02-FLOW-ARCHITECTURE.md) - Flujo de UI y gestión de overlay components
- [01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md) - Application singleton pattern

**Vue Documentation:**
- Dynamic Components con :is directive
- markRaw() API para prevenir reactive proxy
- Event handling: addEventListener y removeEventListener

**Ubicación del código fuente:** src/components/DropdownMenuComponent.vue
