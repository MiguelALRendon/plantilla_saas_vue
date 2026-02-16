# TopBarComponent

## 1. Propósito

TopBarComponent es la barra de navegación superior fija de la aplicación que proporciona contexto visual sobre el módulo activo y controles de navegación global. El componente:

- Muestra el título y el icono del módulo actualmente activo obtenidos de `Application.View.value.entityClass`
- Proporciona botón de toggle para mostrar/ocultar el sidebar de navegación lateral
- Ofrece acceso al menú de perfil de usuario mediante dropdown
- Actúa como header persistente visible en todas las vistas de la aplicación

TopBarComponent es un componente de infraestructura que forma parte del layout principal junto con SideBarComponent y ComponentContainerComponent, estableciendo jerarquía visual y contexto de navegación.

**Ubicación del código fuente:** `src/components/TopBarComponent.vue`

**Patrón de diseño:** Header Component + Reactive Context Display

## 2. Alcance

### Responsabilidades

1. **Renderizado de Contexto del Módulo Actual:**
   - Leer `Application.View.value.entityClass` para obtener clase de entidad activa
   - Ejecutar `getModuleName()` de la entidad para obtener título
   - Ejecutar `getModuleIcon()` de la entidad para obtener icono
   - Actualizar reactivamente cuando cambia `Application.View`

2. **Control de Sidebar:**
   - Renderizar botón de toggle con icono de menú
   - Ejecutar `Application.ApplicationUIService.toggleSidebar()` al hacer click
   - Escuchar evento `toggle-sidebar` del eventBus para sincronizar estado visual
   - Actualizar clase CSS `.toggled` del botón según estado del sidebar

3. **Menú de Perfil de Usuario:**
   - Renderizar botón de perfil con avatar de usuario
   - Abrir DropdownMenu al hacer click con `openDropdownMenu()`
   - Proporcionar acceso a configuración de usuario y logout
   - Mantener estado visual del botón (toggled/no toggled)

4. **Layout y Estructura:**
   - Mantener altura fija de 50px para cálculos de layout
   - Aplicar flexbox con `justify-content: space-between` para separación de controles
   - Establecer z-index adecuado para overlays
   - Proporcionar padding y gap para separación visual de elementos

### Límites

1. **NO gestiona lógica de autenticación** - Solo renderiza información de usuario, no maneja login/logout
2. **NO controla navegación entre vistas** - Solo muestra contexto de vista actual sin intervenir en cambios
3. **NO almacena estado de módulos** - Lee reactivamente de Application.View sin cachear información
4. **NO implementa lógica de dropdown** - Delega a DropdownMenu mediante ApplicationUIService
5. **NO maneja responsive layout** - Mantiene diseño fijo independientemente del viewport
6. **NO emite eventos personalizados** - Toda comunicación ocurre mediante ApplicationUIService y eventBus

## 3. Definiciones Clave

### Conceptos Fundamentales

- **TopBar:** Elemento visual horizontal fijo en la parte superior de la aplicación con altura de 50px, presente en todas las vistas.

- **Module Context:** Información del módulo actualmente activo (clase de entidad, título, icono) obtenida de `Application.View.value.entityClass`.

- **Sidebar Toggle:** Acción de mostrar u ocultar el sidebar de navegación lateral mediante `ApplicationUIService.toggleSidebar()`.

- **Dropdown Menu:** Menú desplegable posicionado absolutamente que se abre desde el botón de perfil, renderizado por DropdownMenu component.

- **toggled_bar:** Propiedad de data que refleja estado actual del sidebar (true = abierto, false = cerrado), sincronizada mediante evento `toggle-sidebar`.

- **toggle-sidebar Event:** Evento emitido por `Application.eventBus` cuando se muestra/oculta el sidebar, con payload opcional de tipo `boolean | void`.

### Computed Properties

- **title:** Computed property que retorna `Application.View.value.entityClass?.getModuleName() ?? 'Default'`, proporcionando nombre del módulo actual o fallback.

- **icon:** Computed property que retorna `Application.View.value.entityClass?.getModuleIcon() ?? ''`, proporcionando ruta del icono del módulo actual.

### Estructura del Template

```vue
<div class="topbar">
    <div class="top-left-side">
        <button @click="toggleSidebar" :class="'push-side-nav-button' + (!toggled_bar ? ' toggled' : '')">
            <img :src="ICONS.MENU" alt="">
        </button>
        <div class="icon">
            <img :src="icon" alt="">
        </div>
        <span class="topbar-title">{{ title }}</span>
    </div>
    <div class="top-right-side">
        <button @click.stop="openDropdown" :class="'profile_button' + (toggled_profile ? ' toggled' : '')" id="dropdown-profile-button">
            <div class="icon">
                <img :src="ICONS.AVATAR" alt="">
            </div>
        </button>
        <span>Chango</span>
    </div>
</div>
```

**top-left-side:** Contiene botón de toggle, icono del módulo y título del módulo, dispuestos horizontalmente con gap de 10px.

**top-right-side:** Contiene nombre de usuario ("Chango") y botón de perfil con avatar, dispuestos en fila inversa (reverse).

### Data Properties

```typescript
{
    ICONS: object,              // Objeto importado de @/constants/icons con rutas de imágenes
    toggled_profile: boolean,   // Estado del dropdown de perfil (true = abierto, false = cerrado)
    toggled_bar: boolean        // Estado del sidebar (true = abierto, false = cerrado)
}
```

## 4. Descripción Técnica

TopBarComponent utiliza Vue Options API con TypeScript:

```vue
<script lang="ts">
import ICONS from '@/constants/icons';
import Application from '@/models/application';
import listView from '@/views/list.vue';

export default {
    name: 'TopBarComponent',
    methods: {
        toggleSidebar() {
            Application.ApplicationUIService.toggleSidebar();
        },
        logout() {
            console.log('Logout clicked');
        },
        openDropdown() {
            var button: HTMLElement = document.getElementById('dropdown-profile-button')!;
            Application.ApplicationUIService.openDropdownMenu(button, 'Profile', listView);
        }
    },
    computed: {
        title() {
            return Application.View.value.entityClass?.getModuleName() ?? 'Default';
        },
        icon() {
            return Application.View.value.entityClass?.getModuleIcon() ?? '';
        }
    },
    data() {
        return {
            ICONS,
            toggled_profile : false,
            toggled_bar: true,
        }
    },
    mounted() {
        Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
            this.toggled_bar = state !== undefined ? state : !this.toggled_bar;
        });
    },
    beforeUnmount() {
        Application.eventBus.off('toggle-sidebar');
    }
}
</script>
```

### Método toggleSidebar()

```typescript
toggleSidebar() {
    Application.ApplicationUIService.toggleSidebar();
}
```

Ejecuta `toggleSidebar()` del ApplicationUIService sin parámetros, alternando estado actual del sidebar:

1. ApplicationUIService determina estado actual del sidebar
2. Emite evento `toggle-sidebar` con nuevo estado mediante `Application.eventBus.emit('toggle-sidebar', newState)`
3. SideBarComponent escucha evento y actualiza su visibilidad
4. TopBarComponent escucha evento (ver mounted) y actualiza `toggled_bar`

### Método openDropdown()

```typescript
openDropdown() {
    var button: HTMLElement = document.getElementById('dropdown-profile-button')!;
    Application.ApplicationUIService.openDropdownMenu(button, 'Profile', listView);
}
```

Abre dropdown menu de perfil mediante ApplicationUIService:

1. Obtiene referencia al botón mediante `getElementById('dropdown-profile-button')`
2. Ejecuta `openDropdownMenu(button, 'Profile', listView)` con:
   - **button:** Elemento HTML para posicionar dropdown (usa `getBoundingClientRect()`)
   - **'Profile':** Título del dropdown menu
   - **listView:** Componente Vue a renderizar dentro del dropdown

**Nota:** Uso de `@click.stop` en el template previene propagación del evento, evitando que se cierre inmediatamente el dropdown.

### Computed Property: title

```typescript
computed: {
    title() {
        return Application.View.value.entityClass?.getModuleName() ?? 'Default';
    }
}
```

Reactivamente obtiene nombre del módulo:

1. Accede a `Application.View.value.entityClass` (clase BaseEntity actual)
2. Si existe, ejecuta método estático `getModuleName()` definido por decorador `@ModuleName`
3. Si no existe entityClass o getModuleName(), retorna `'Default'` como fallback
4. Utiliza optional chaining (`?.`) para evitar errores si entityClass es null/undefined

**Reactividad:** Cuando `Application.View.value` cambia, Vue detecta cambio y re-ejecuta computed property, actualizando título en template automáticamente.

### Computed Property: icon

```typescript
computed: {
    icon() {
        return Application.View.value.entityClass?.getModuleIcon() ?? '';
    }
}
```

Reactivamente obtiene icono del módulo:

1. Accede a `Application.View.value.entityClass`
2. Si existe, ejecuta método estático `getModuleIcon()` definido por decorador `@ModuleIcon`
3. Si no existe, retorna string vacío `''`
4. El icono es típicamente una ruta a imagen o emoji

### Lifecycle Hook: mounted()

```typescript
mounted() {
    Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
        this.toggled_bar = state !== undefined ? state : !this.toggled_bar;
    });
}
```

Suscribe listener al evento `toggle-sidebar`:

1. **state?: boolean | void:** Payload opcional del evento:
   - Si es `boolean`: Establece estado explícito (true = abierto, false = cerrado)
   - Si es `undefined/void`: Alterna estado actual (`!this.toggled_bar`)

2. Actualiza `this.toggled_bar` según lógica:
   - `state !== undefined` → Usa estado explícito recibido
   - `state === undefined` → Alterna estado actual

3. Cambio en `toggled_bar` provoca actualización de clase CSS del botón toggle

**Propósito:** Sincronizar estado visual del botón con estado real del sidebar, permitiendo que otras partes de la aplicación controlen sidebar y TopBar refleje el cambio.

### Lifecycle Hook: beforeUnmount()

```typescript
beforeUnmount() {
    Application.eventBus.off('toggle-sidebar');
}
```

Limpia listener del evento `toggle-sidebar` antes de desmontar componente:

**CRÍTICO:** Previene memory leaks eliminando referencias a callbacks que podrían mantener componente en memoria incluso después de desmontado.

**Regla:** Todo listener registrado con `eventBus.on()` DEBE tener correspondiente `eventBus.off()` en beforeUnmount().

### Estilos CSS

```css
.topbar {
    height: 50px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    z-index: 1;
}

.topbar .push-side-nav-button,
.topbar .profile_button {
    aspect-ratio: 1 / 1;
    height: 100%;
    border: none;
    border-radius: var(--border-radius-circle);
    padding: 0 !important;
}

.topbar .push-side-nav-button:hover,
.topbar .profile_button:hover {
    background-color: var(--overlay-light);
}

.topbar .push-side-nav-button img,
.topbar .profile_button img {
    height: 100%;
    transition: 0.5s ease;
}

.topbar .push-side-nav-button.toggled img,
.topbar .profile_button.toggled img {
    filter: grayscale(100%) brightness(1.3);
}

.topbar .top-left-side {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    font-weight: bold;
}

.topbar .top-right-side {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 10px;
    font-weight: bold;
}

.topbar .icon {
    height: 100%;
}

.topbar .icon img {
    height: 100%;
}

.topbar .topbar-title {
    font-size: 1.25rem;
    color: var(--gray-medium);
}
```

**Altura fija:** 50px altura constante, utilizada por ComponentContainerComponent para calcular `max-height: calc(100vh - 50px)`.

**Flexbox:** `justify-content: space-between` separa lados izquierdo y derecho, maximizando espacio entre controles.

**Z-index:** Valor 1 posiciona TopBar encima de contenido pero debajo de modales (z-index ~1000) y dropdowns (z-index variable).

**Botones circulares:** `aspect-ratio: 1 / 1` con `border-radius-circle` crea botones perfectamente redondos.

**Estado toggled:** Cuando botón tiene clase `.toggled`, aplica filtro `grayscale(100%) brightness(1.3)` al icono para feedback visual.

**Transición:** `transition: 0.5s ease` en imágenes suaviza cambios de filtro.

## 5. Flujo de Funcionamiento

### Montaje Inicial del Componente

```
1. App.vue se monta y renderiza layout principal
        ↓
2. TopBarComponent se monta como componente fijo
        ↓
3. mounted() hook se ejecuta
        ↓
4. Registra listener para evento 'toggle-sidebar' en Application.eventBus
        ↓
5. Inicializa data properties:
   - ICONS con rutas de imágenes
   - toggled_profile = false
   - toggled_bar = true
        ↓
6. Vue evalúa computed properties:
   - title ejecuta getModuleName() de entityClass actual
   - icon ejecuta getModuleIcon() de entityClass actual
        ↓
7. Template renderiza con valores calculados
        ↓
8. Componente queda listo y reactivo
```

### Cambio de Vista/Módulo

```
1. Usuario navega a diferente módulo (ej: click en sidebar)
        ↓
2. Application.changeView(NewEntityClass, viewType) ejecuta
        ↓
3. Application.View.value se actualiza con nueva entityClass
        ↓
4. Vue detecta cambio en Application.View.value (es reactivo)
        ↓
5. Computed property title se re-evalúa:
   - Ejecuta NewEntityClass.getModuleName()
   - Retorna nuevo nombre
        ↓
6. Computed property icon se re-evalúa:
   - Ejecuta NewEntityClass.getModuleIcon()
   - Retorna nueva ruta de icono
        ↓
7. Vue actualiza DOM con nuevos valores:
   - Actualiza texto del span con nuevo título
   - Actualiza src del img con nuevo icono
        ↓
8. Usuario ve contexto actualizado en TopBar
```

### Toggle del Sidebar

```
1. Usuario hace click en botón de toggle
        ↓
2. @click handler ejecuta toggleSidebar() method
        ↓
3. Application.ApplicationUIService.toggleSidebar() se ejecuta
        ↓
4. ApplicationUIService determina nuevo estado (invierte estado actual)
        ↓
5. ApplicationUIService emite evento:
   Application.eventBus.emit('toggle-sidebar', newState)
        ↓
6. Múltiples componentes reciben evento:
   - SideBarComponent actualiza su visibilidad
   - TopBarComponent ejecuta su listener
        ↓
7. Listener en TopBarComponent ejecuta:
   this.toggled_bar = newState
        ↓
8. Vue detecta cambio en toggled_bar
        ↓
9. Expresión de clase se re-evalúa:
   :class="'push-side-nav-button' + (!toggled_bar ? ' toggled' : '')"
        ↓
10. Si toggled_bar === false:
    - Agrega clase 'toggled' al botón
    - Aplica filtro grayscale al icono
    Si toggled_bar === true:
    - No agrega clase 'toggled'
    - Icono mantiene color original
        ↓
11. Usuario ve feedback visual del estado del sidebar
```

### Apertura de Dropdown Menu

```
1. Usuario hace click en botón de perfil
        ↓
2. @click.stop handler ejecuta openDropdown() method
   (.stop previene propagación del evento)
        ↓
3. openDropdown() obtiene referencia al botón:
   var button = document.getElementById('dropdown-profile-button')
        ↓
4. Ejecuta ApplicationUIService.openDropdownMenu():
   ApplicationUIService.openDropdownMenu(button, 'Profile', listView)
        ↓
5. ApplicationUIService calcula posición del dropdown:
   - Ejecuta button.getBoundingClientRect()
   - Determina coordenadas X, Y para posicionamiento
        ↓
6. ApplicationUIService actualiza Application.dropdownMenu.value:
   {
       visible: true,
       title: 'Profile',
       component: listView,
       position: { x, y },
       width: defaultWidth
   }
        ↓
7. DropdownMenu component detecta cambio reactivo
        ↓
8. DropdownMenu se posiciona y renderiza listView
        ↓
9. Usuario ve dropdown menu de perfil desplegado
```

### Desmontaje y Cleanup

```
1. Aplicación navega fuera de vista principal (ej: logout)
        ↓
2. Vue inicia desmontaje de TopBarComponent
        ↓
3. beforeUnmount() hook se ejecuta
        ↓
4. Ejecuta Application.eventBus.off('toggle-sidebar')
        ↓
5. EventBus elimina referencia al listener
        ↓
6. Listener queda disponible para garbage collection
        ↓
7. Componente se desmonta completamente sin memory leaks
```

## 6. Reglas Obligatorias

### Regla 1: Cleanup de Event Listeners
Todo listener registrado con `eventBus.on()` DEBE tener correspondiente `eventBus.off()` en `beforeUnmount()` para prevenir memory leaks.

```typescript
// ✅ CORRECTO
mounted() {
    Application.eventBus.on('toggle-sidebar', this.handleToggle);
}
beforeUnmount() {
    Application.eventBus.off('toggle-sidebar');
}

// ❌ INCORRECTO - Memory leak
mounted() {
    Application.eventBus.on('toggle-sidebar', this.handleToggle);
}
// Sin beforeUnmount()
```

### Regla 2: Altura Fija de 50px
La altura del TopBar DEBE mantenerse en 50px para que ComponentContainerComponent calcule correctamente `max-height: calc(100vh - 50px)`. Modificar esta altura rompe el layout.

```css
/* ✅ CORRECTO */
.topbar {
    height: 50px;
}

/* ❌ INCORRECTO */
.topbar {
    height: 60px;  /* Rompe cálculo de ComponentContainer */
}
```

### Regla 3: ID del Botón de Dropdown
El botón de perfil DEBE mantener ID `dropdown-profile-button` porque `openDropdown()` depende de este ID para obtener referencia al elemento.

```vue
<!-- ✅ CORRECTO -->
<button id="dropdown-profile-button" @click.stop="openDropdown">

<!-- ❌ INCORRECTO -->
<button id="profile-btn" @click.stop="openDropdown">  <!-- openDropdown() fallará -->
```

### Regla 4: Stop Event Propagation en Dropdown
El click handler del botón de dropdown DEBE usar `.stop` modifier para prevenir propagación del evento, evitando cierre inmediato del dropdown.

```vue
<!-- ✅ CORRECTO -->
<button @click.stop="openDropdown">

<!-- ❌ INCORRECTO -->
<button @click="openDropdown">  <!-- Dropdown se cierra inmediatamente -->
```

### Regla 5: Fallback para title e icon
Los computed properties `title` e `icon` DEBEN proporcionar valores fallback con nullish coalescing (`??`) para evitar renderizado de undefined/null.

```typescript
// ✅ CORRECTO
computed: {
    title() {
        return Application.View.value.entityClass?.getModuleName() ?? 'Default';
    },
    icon() {
        return Application.View.value.entityClass?.getModuleIcon() ?? '';
    }
}

// ❌ INCORRECTO - Puede renderizar "undefined"
computed: {
    title() {
        return Application.View.value.entityClass?.getModuleName();
    }
}
```

### Regla 6: Optional Chaining para entityClass
Acceso a `Application.View.value.entityClass` DEBE usar optional chaining (`?.`) porque entityClass puede ser null en vistas sin entidad asociada (ej: vista de home/dashboard).

```typescript
// ✅ CORRECTO
Application.View.value.entityClass?.getModuleName()

// ❌ INCORRECTO - Puede lanzar error
Application.View.value.entityClass.getModuleName()
```

### Regla 7: Clase CSS Toggled Condicional
La clase `.toggled` DEBE aplicarse cuando `toggled_bar` es `false` (sidebar cerrado), no cuando es `true`, para reflejar correctamente el estado. Además, no se debe usar concatenación con `+` para construir clases.

```vue
<!-- ✅ CORRECTO - toggled cuando sidebar cerrado -->
:class="['push-side-nav-button', { toggled: !toggled_bar }]"

<!-- ❌ INCORRECTO - toggled cuando sidebar abierto -->
:class="['push-side-nav-button', { toggled: toggled_bar }]"
```

### Regla 8: Z-Index Relativo Tokenizado
TopBar DEBE mantener capa baja con token (`var(--z-base)`) para estar debajo de modales y dropdowns, pero encima de contenido sin capa.

```css
/* ✅ CORRECTO */
.topbar {
    z-index: var(--z-base);
}

/* ❌ INCORRECTO */
.topbar {
    z-index: 9999;  /* TopBar cubriría modales y dropdowns */
}
```

## 7. Prohibiciones

### Prohibición 1: NO Modificar Application.View Directamente
TopBarComponent NO DEBE modificar `Application.View` ni ninguna de sus propiedades. Solo debe leer reactivamente. Modificaciones son responsabilidad exclusiva de Application.

```typescript
// ❌ PROHIBIDO
computed: {
    title() {
        Application.View.value.title = "New Title";  // ❌
        return Application.View.value.entityClass?.getModuleName() ?? 'Default';
    }
}

// ✅ PERMITIDO - Solo lectura
computed: {
    title() {
        return Application.View.value.entityClass?.getModuleName() ?? 'Default';
    }
}
```

### Prohibición 2: NO Implementar Lógica de Autenticación
NO implementar lógica de login/logout directamente en TopBarComponent. El método `logout()` actualmente solo hace `console.log` y debe delegarse a un servicio de autenticación.

```typescript
// ❌ PROHIBIDO
methods: {
    logout() {
        localStorage.removeItem('token');
        this.$router.push('/login');
        Application.clearUser();
    }
}

// ✅ CORRECTO - Delegar a servicio
methods: {
    logout() {
        AuthService.logout();  // Servicio maneja toda la lógica
    }
}
```

### Prohibición 3: NO Cachear Valores de entityClass
NO almacenar en data propiedades que repliquen `title` o `icon`. DEBE usarse computed properties para garantizar sincronización con Application.View.

```typescript
// ❌ PROHIBIDO
data() {
    return {
        currentTitle: '',
        currentIcon: ''
    }
},
mounted() {
    this.currentTitle = Application.View.value.entityClass?.getModuleName();  // ❌
}

// ✅ CORRECTO - Computed properties reactivas
computed: {
    title() {
        return Application.View.value.entityClass?.getModuleName() ?? 'Default';
    }
}
```

### Prohibición 4: NO Renderizar Múltiples TopBars
NO renderizar más de una instancia de TopBarComponent en la aplicación. Debe existir exactamente UNA en el layout principal.

```vue
<!-- ❌ PROHIBIDO -->
<template>
    <div class="app">
        <TopBarComponent />  <!-- Instancia 1 -->
        <div class="content">
            <TopBarComponent />  <!-- Instancia 2 - PROHIBIDO -->
        </div>
    </div>
</template>

<!-- ✅ CORRECTO -->
<template>
    <div class="app">
        <TopBarComponent />  <!-- Una sola instancia -->
        <div class="content">...</div>
    </div>
</template>
```

### Prohibición 5: NO Usar getElementById en Otros Métodos
NO extender el patrón de `getElementById()` a otros métodos. Este patrón solo es aceptable en `openDropdown()` por razones de compatibilidad, pero NO debe proliferarse.

```typescript
// ❌ PROHIBIDO
methods: {
    highlightTitle() {
        const title = document.getElementById('topbar-title');  // ❌
        title.style.color = 'red';
    }
}

// ✅ CORRECTO - Usar $refs
<span ref="topbarTitle" class="topbar-title">{{ title }}</span>

methods: {
    highlightTitle() {
        this.$refs.topbarTitle.style.color = 'red';  // ✅
    }
}
```

### Prohibición 6: NO Emitir Eventos Personalizados
TopBarComponent NO DEBE emitir eventos mediante `$emit()`. Toda comunicación debe realizarse mediante `Application.ApplicationUIService` o `Application.eventBus`.

```typescript
// ❌ PROHIBIDO
methods: {
    toggleSidebar() {
        this.$emit('sidebar-toggle');  // ❌
    }
}

// ✅ CORRECTO - Usar ApplicationUIService
methods: {
    toggleSidebar() {
        Application.ApplicationUIService.toggleSidebar();  // ✅
    }
}
```

### Prohibición 7: NO Modificar toggled_bar Directamente Excepto en Listener
La propiedad `toggled_bar` NO DEBE modificarse directamente en ningún método excepto el listener de `toggle-sidebar`. Cambios deben originarse en ApplicationUIService.

```typescript
// ❌ PROHIBIDO
methods: {
    toggleSidebar() {
        this.toggled_bar = !this.toggled_bar;  // ❌
        Application.ApplicationUIService.toggleSidebar();
    }
}

// ✅ CORRECTO - Solo en listener
mounted() {
    Application.eventBus.on('toggle-sidebar', (state) => {
        this.toggled_bar = state !== undefined ? state : !this.toggled_bar;  // ✅
    });
}
```

### Prohibición 8: NO Hardcodear Nombre de Usuario
El texto "Chango" en el template es placeholder. NO debe hardcodearse permanentemente. DEBE reemplazarse con propiedad reactiva de usuario autenticado.

```vue
<!-- ❌ ACTUAL (temporal) -->
<span>Chango</span>

<!-- ✅ DEBE MEJORARSE -->
<span>{{ currentUser?.name ?? 'Usuario' }}</span>
```

## 8. Dependencias

### Dependencias de Constantes

```typescript
import ICONS from '@/constants/icons';
```

**ICONS:** Objeto con rutas a archivos de imagen para iconos de UI. TopBarComponent utiliza:
- `ICONS.MENU` - Icono de menú hamburguesa para botón de toggle
- `ICONS.AVATAR` - Icono de avatar de usuario para botón de perfil

Debe definirse en `src/constants/icons.ts` con rutas válidas a assets.

### Dependencias de Application

```typescript
import Application from '@/models/application';
```

TopBarComponent depende de múltiples partes de Application:

1. **Application.View.value:** Ref reactivo con información de vista actual:
   - `Application.View.value.entityClass` - Clase BaseEntity del módulo activo
   - Utilizado por computed properties `title` e `icon`

2. **Application.ApplicationUIService.toggleSidebar():** Método para alternar visibilidad del sidebar. Emite evento `toggle-sidebar` al ejecutarse.

3. **Application.ApplicationUIService.openDropdownMenu():** Método para abrir dropdown menu con:
   - **button:** HTMLElement para posicionamiento
   - **title:** String título del dropdown
   - **component:** Componente Vue a renderizar

4. **Application.eventBus:** Instancia de mitt para pub/sub:
   - `eventBus.on('toggle-sidebar', callback)` - Suscribe listener
   - `eventBus.off('toggle-sidebar')` - Desuscribe listener

### Dependencias de Componentes

```typescript
import listView from '@/views/list.vue';
```

**listView:** Componente Vue renderizado dentro del dropdown menu de perfil. Utilizado como tercer parámetro en `openDropdownMenu()`.

**Relación:** TopBarComponent importa pero no renderiza directamente listView. Lo pasa a ApplicationUIService que lo asigna a `Application.dropdownMenu.value.component` para que DropdownMenu lo renderice.

### Dependencias de Decoradores

TopBarComponent depende indirectamente de decoradores aplicados a clases BaseEntity:

1. **@ModuleName:** Decorador que define método estático `getModuleName()` en entityClass. TopBarComponent ejecuta este método en computed property `title`.

2. **@ModuleIcon:** Decorador que define método estático `getModuleIcon()` en entityClass. TopBarComponent ejecuta este método en computed property `icon`.

**Regla:** Toda clase BaseEntity utilizada en `Application.View.value.entityClass` DEBE tener decoradores `@ModuleName` y `@ModuleIcon` para que TopBarComponent funcione correctamente.

### Dependencias de CSS Variables

```css
var(--border-radius-circle)  /* Border radius para botones circulares */
var(--overlay-light)         /* Color de hover de botones */
var(--gray-medium)           /* Color de texto del título */
```

Estas variables deben definirse en `src/css/constants.css` o archivo de variables globales.

### Dependencias Implícitas

1. **SideBarComponent:** Aunque no importado, TopBarComponent interactúa con SideBarComponent mediante evento `toggle-sidebar`. Ambos escuchan el mismo evento para sincronizarse.

2. **DropdownMenu:** No importado directamente, pero TopBarComponent dispara su renderizado mediante `Application.ApplicationUIService.openDropdownMenu()`.

3. **ComponentContainerComponent:** Depende de la altura de 50px del TopBar para calcular `max-height: calc(100vh - 50px)`. Cambio en altura de TopBar rompe layout de ComponentContainer.

## 9. Relaciones

### Relación con Application (1:1 Reactiva)

TopBarComponent tiene relación 1:1 reactiva con Application singleton:

```
TopBarComponent (1) ──► (1) Application
                        │
                        ├── View.value.entityClass (lectura)
                        ├── ApplicationUIService.toggleSidebar() (ejecución)
                        ├── ApplicationUIService.openDropdownMenu() (ejecución)
                        └── eventBus (pub/sub)
```

- **Dirección de flujo:** Bidireccional
  - TopBar → Application: Ejecuta métodos (toggleSidebar, openDropdownMenu)
  - Application → TopBar: Cambios en View.value disparan re-evaluación de computed properties
- **Tipo de relación:** Observer (computed properties) + Consumer (ApplicationUIService)
- **Acoplamiento:** Alto - TopBar depende completamente de Application

### Relación con SideBarComponent (N:1 Indirecta)

TopBarComponent y SideBarComponent comparten evento `toggle-sidebar`:

```
TopBarComponent (1) ──┐
                      ├──► Application.eventBus.on('toggle-sidebar')
SideBarComponent (1) ─┘
```

- **Dirección de flujo:** Bidireccional mediante eventBus
  - TopBar dispara toggle → SideBar reacciona (cambia visibilidad)
  - Sidebar se cierra por clic fuera → TopBar reacciona (actualiza botón)
- **Tipo de relación:** Pub/Sub mediante eventBus
- **Acoplamiento:** Bajo - Ambos componentes desconocen existencia del otro, solo comparten evento

### Relación con DropdownMenu (1:1 Indirecta)

TopBarComponent dispara renderizado de DropdownMenu mediante ApplicationUIService:

```
TopBarComponent (1) ──► ApplicationUIService.openDropdownMenu()
                                    ↓
                        Application.dropdownMenu.value actualizado
                                    ↓
                        DropdownMenu (1) detecta cambio y renderiza
```

- **Dirección de flujo:** Unidireccional TopBar → DropdownMenu
- **Tipo de relación:** Command (TopBar ordena, DropdownMenu ejecuta)
- **Acoplamiento:** Nulo - TopBar no conoce a DropdownMenu, comunican mediante Application

### Relación con BaseEntity Classes (N:1 Dinámica)

TopBarComponent lee dinámicamente información de cualquier clase BaseEntity activa:

```
TopBarComponent (1) ──► (N) BaseEntity Classes
                        │
                        ├── Products.getModuleName()
                        ├── Products.getModuleIcon()
                        ├── Users.getModuleName()
                        ├── Users.getModuleIcon()
                        └── ...
```

- **Dirección de flujo:** Unidireccional TopBar → EntityClass
- **Tipo de relación:** Reflection (TopBar ejecuta métodos estáticos de clase activa)
- **Acoplamiento:** Bajo - TopBar solo requiere interfaz `getModuleName()` y `getModuleIcon()`

### Relación con ComponentContainerComponent (1:1 Layout)

TopBarComponent y ComponentContainerComponent tienen relación de layout:

```
App Layout
    ├── TopBarComponent (altura: 50px)
    └── ComponentContainerComponent (altura: calc(100vh - 50px))
```

- **Dirección de flujo:** Implícita mediante layout CSS
- **Tipo de relación:** Sibling components con dependencia de dimensiones
- **Acoplamiento:** Medio - ComponentContainer depende de altura fija de TopBar (50px)

### Diagrama de Relaciones Completo

```
┌──────────────────────────────────────────────────────┐
│                    App.vue                           │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │         TopBarComponent                     │    │
│  │  - title (computed)                         │    │
│  │  - icon (computed)                          │    │
│  │  - toggleSidebar()                          │    │
│  │  - openDropdown()                           │    │
│  └───┬─────────────┬──────────────┬────────────┘    │
│      │             │              │                  │
│      │ lee         │ ejecuta      │ escucha evento   │
│      ↓             ↓              ↓                  │
│  ┌─────────────────────────────────────────────┐    │
│  │          Application (Singleton)            │    │
│  │                                             │    │
│  │  View.value.entityClass ────────────┐      │    │
│  │  ApplicationUIService   │           │      │    │
│  │  eventBus               │           │      │    │
│  └─────┬───────────┬───────┴───────────┼──────┘    │
│        │           │                   │            │
│        │ emite     │ actualiza         │ ejecuta    │
│        ↓           ↓                   ↓            │
│  ┌─────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │ Sidebar │  │ DropdownMenu│  │  EntityClass │    │
│  │ Component  │  Component  │  │ (Products,   │    │
│  │ (escucha  │  (renderiza)│  │  Users, etc) │    │
│  │  evento)  │             │  │              │    │
│  └─────────┘  └─────────────┘  └──────────────┘    │
└──────────────────────────────────────────────────────┘
```

## 10. Notas de Implementación

### Nota 1: Hardcoded Username "Chango"

Actualmente el nombre de usuario está hardcodeado como "Chango" en el template:

```vue
<span>Chango</span>
```

**Mejora recomendada:** Reemplazar con propiedad reactiva de usuario autenticado:

```typescript
computed: {
    currentUser() {
        return Application.User?.name ?? 'Usuario';
    }
}
```

```vue
<span>{{ currentUser }}</span>
```

### Nota 2: Método logout() Sin Implementar

El método `logout()` actualmente solo hace `console.log('Logout clicked')` sin lógica real:

```typescript
logout() {
    console.log('Logout clicked');
}
```

**Implementación recomendada:**

```typescript
async logout() {
    try {
        await AuthService.logout();  // Llamar servicio de autenticación
        localStorage.removeItem('authToken');
        Application.clearUser();
        this.$router.push('/login');
    } catch (error) {
        Application.ApplicationUIService.showToast('Error al cerrar sesión', 'ERROR');
    }
}
```

### Nota 3: EventBus Listener con Arrow Function vs Named Function

El listener de `toggle-sidebar` usa arrow function inline:

```typescript
Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
    this.toggled_bar = state !== undefined ? state : !this.toggled_bar;
});
```

**Alternativa con named method (mejor para testing):**

```typescript
methods: {
    handleSidebarToggle(state?: boolean | void) {
        this.toggled_bar = state !== undefined ? state : !this.toggled_bar;
    }
},
mounted() {
    Application.eventBus.on('toggle-sidebar', this.handleSidebarToggle);
},
beforeUnmount() {
    Application.eventBus.off('toggle-sidebar', this.handleSidebarToggle);
}
```

Named methods son más fáciles de testear y debuggear.

### Nota 4: Responsive Design

TopBar no implementa responsive design. En pantallas pequeñas, todos los elementos mantienen tamaño completo, potencialmente causando overflow.

**Mejora recomendada para móviles:**

```css
@media (max-width: 768px) {
    .topbar .topbar-title {
        font-size: 1rem;  /* Reducir tamaño de fuente */
    }
    
    .topbar .top-right-side span {
        display: none;  /* Ocultar nombre de usuario */
    }
    
    .topbar .icon {
        height: 80%;  /* Reducir tamaño de iconos */
    }
}
```

### Nota 5: Accesibilidad (a11y)

Los botones carecen de `aria-label` para lectores de pantalla:

```vue
<!-- Actual -->
<button @click="toggleSidebar">
    <img :src="ICONS.MENU" alt="">
</button>

<!-- Mejorado -->
<button @click="toggleSidebar" aria-label="Toggle sidebar navigation">
    <img :src="ICONS.MENU" alt="Menu icon">
</button>
```

**También agregar estados ARIA:**

```vue
<button 
    @click="toggleSidebar" 
    aria-label="Toggle sidebar navigation"
    :aria-expanded="toggled_bar"
>
```

### Nota 6: Performance de Computed Properties

Las computed properties `title` e `icon` ejecutan métodos estáticos en cada re-evaluación:

```typescript
computed: {
    title() {
        return Application.View.value.entityClass?.getModuleName() ?? 'Default';
    }
}
```

Vue cachea resultados de computed properties automáticamente, solo re-evaluando cuando dependencias cambian (en este caso, `Application.View.value`). NO es necesaria optimización adicional.

### Nota 7: Testing y Mocking

Para testing de TopBarComponent:

```typescript
import { mount } from '@vue/test-utils';
import TopBarComponent from '@/components/TopBarComponent.vue';
import Application from '@/models/application';

describe('TopBarComponent', () => {
    beforeEach(() => {
        // Mock Application.View
        Application.View.value = {
            entityClass: {
                getModuleName: () => 'Test Module',
                getModuleIcon: () => '/test-icon.png'
            }
        };
    });
    
    it('muestra título del módulo', () => {
        const wrapper = mount(TopBarComponent);
        expect(wrapper.text()).toContain('Test Module');
    });
    
    it('ejecuta toggleSidebar al hacer click', async () => {
        const mockToggle = vi.spyOn(Application.ApplicationUIService, 'toggleSidebar');
        const wrapper = mount(TopBarComponent);
        
        await wrapper.find('.push-side-nav-button').trigger('click');
        expect(mockToggle).toHaveBeenCalled();
    });
});
```

### Nota 8: Alternativa con Composition API

Si se migra a Composition API (script setup):

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import ICONS from '@/constants/icons';
import Application from '@/models/application';
import listView from '@/views/list.vue';

const toggled_profile = ref(false);
const toggled_bar = ref(true);

const title = computed(() => 
    Application.View.value.entityClass?.getModuleName() ?? 'Default'
);

const icon = computed(() => 
    Application.View.value.entityClass?.getModuleIcon() ?? ''
);

const toggleSidebar = () => {
    Application.ApplicationUIService.toggleSidebar();
};

const openDropdown = () => {
    const button = document.getElementById('dropdown-profile-button');
    if (button) {
        Application.ApplicationUIService.openDropdownMenu(button, 'Profile', listView);
    }
};

const handleSidebarToggle = (state?: boolean | void) => {
    toggled_bar.value = state !== undefined ? state : !toggled_bar.value;
};

onMounted(() => {
    Application.eventBus.on('toggle-sidebar', handleSidebarToggle);
});

onBeforeUnmount(() => {
    Application.eventBus.off('toggle-sidebar', handleSidebarToggle);
});
</script>
```

Esta versión es más concisa y permite mejor tree-shaking.

### Nota 9: Z-Index Strategy

La aplicación debe mantener consistente z-index strategy:

```
0-9:     Contenido regular (default)
10-99:   Headers, sidebars, navigation (TopBar = 1)
100-999: Dropdowns, tooltips (DropdownMenu ~500)
1000+:   Modales, overlays full-screen (Modal ~1000, LoadingScreen ~1001)
```

TopBar con z-index: 1 está en rango correcto para headers.

### Nota 10: Icon Assets Management

Actualmente `ICONS.MENU` y `ICONS.AVATAR` son rutas a imágenes. Considerar alternativas:

**Opción 1: SVG Icons:**
```typescript
// constants/icons.ts
export default {
    MENU: require('@/assets/icons/menu.svg'),
    AVATAR: require('@/assets/icons/avatar.svg')
};
```

**Opción 2: Icon Font (gg-icons):**
```vue
<i class="gg-menu"></i>
<i class="gg-avatar"></i>
```

**Opción 3: Icon Component Library:**
```vue
<Icon name="menu" />
<Icon name="avatar" />
```

SVG icons ofrecen mejor escalabilidad y control de estilo.

## 11. Referencias Cruzadas

### Documentos Relacionados en Copilot

- **[SideBarComponent.md](SideBarComponent.md):** Documenta el sidebar de navegación lateral que se muestra/oculta mediante el botón de toggle de TopBar. Ambos componentes sincronizados mediante evento `toggle-sidebar`.

- **[DropdownMenu.md](DropdownMenu.md):** Documenta el dropdown menu posicionado absolutamente que TopBar dispara mediante `openDropdownMenu()` desde botón de perfil.

- **[ComponentContainerComponent.md](ComponentContainerComponent.md):** Documenta el contenedor principal que calcula su altura en función de la altura del TopBar (50px). Relación de layout crítica.

- **[../03-application/application-singleton.md](../03-application/application-singleton.md):** Documenta el singleton Application con propiedad `View.value` leída por TopBar para obtener entityClass actual.

- **[../03-application/ui-services.md](../03-application/ui-services.md):** Documenta ApplicationUIService con métodos `toggleSidebar()` y `openDropdownMenu()` ejecutados por TopBar.

- **[../03-application/event-bus.md](../03-application/event-bus.md):** Documenta el sistema de eventos mitt con evento `toggle-sidebar` utilizado para sincronizar TopBar y SideBar.

- **[../01-decorators/module-name-decorator.md](../01-decorators/module-name-decorator.md):** Documenta decorador `@ModuleName` que define `getModuleName()` ejecutado por TopBar.

- **[../01-decorators/module-icon-decorator.md](../01-decorators/module-icon-decorator.md):** Documenta decorador `@ModuleIcon` que define `getModuleIcon()` ejecutado por TopBar.

### Archivos de Código Relacionados

- **`src/components/TopBarComponent.vue`:** Archivo fuente implementando el componente documentado.

- **`src/constants/icons.ts`:** Definición del objeto ICONS con rutas a assets de iconos (MENU, AVATAR, etc.).

- **`src/models/application.ts`:** Implementación del singleton Application con View, ApplicationUIService y eventBus.

- **`src/components/SideBarComponent.vue`:** Componente de sidebar que escucha mismo evento `toggle-sidebar`.

- **`src/components/DropdownMenu.vue`:** Componente de dropdown renderizado cuando TopBar ejecuta `openDropdownMenu()`.

- **`src/views/list.vue`:** Componente listView pasado como contenido del dropdown de perfil.

### Flujos de Integración

TopBarComponent participa en los siguientes flujos documentados:

1. **Flujo de Cambio de Vista:** Documentado en [../03-application/application-singleton.md](../03-application/application-singleton.md). TopBar actualiza título e icono cuando `Application.View` cambia.

2. **Flujo de Toggle Sidebar:** Documentado en [SideBarComponent.md](SideBarComponent.md) y [../03-application/ui-services.md](../03-application/ui-services.md). TopBar dispara toggle, ApplicationUIService emite evento, Sidebar y TopBar reaccionan.

3. **Flujo de Dropdown Menu:** Documentado en [DropdownMenu.md](DropdownMenu.md) y [../03-application/ui-services.md](../03-application/ui-services.md). TopBar dispara apertura, ApplicationUIService actualiza Application.dropdownMenu, DropdownMenu renderiza.

4. **Flujo de Metadata de Módulo:** Documentado en [../01-decorators/module-name-decorator.md](../01-decorators/module-name-decorator.md) y [../01-decorators/module-icon-decorator.md](../01-decorators/module-icon-decorator.md). Decoradores definen métodos ejecutados por TopBar para obtener título e icono.
