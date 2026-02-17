# ActionsComponent

## 1. Propósito

ActionsComponent es una barra de botones flotante posicionada en la parte superior derecha del contenedor de vista, que renderiza dinámicamente botones de acción contextuales según el tipo de vista y características de la entidad activa. El componente:

- Renderiza botones de acción obtenidos de la lista reactiva `Application.ListButtons.value`
- Proporciona posicionamiento sticky que mantiene botones siempre visibles durante scroll
- Ajusta opacidad dinámicamente según posición de scroll (opaco en top, semi-transparente al scrollear)
- Gestiona listener de scroll en ComponentContainer para detectar posición
- Actúa como contenedor de renderizado dinámico sin lógica de negocio propia de botones

ActionsComponent es parte de la infraestructura de UI que facilita acceso constante a acciones críticas (New, Save, Refresh, Validate, etc.) independientemente de la posición del usuario en la vista, mejorando accesibilidad y UX.

**Ubicación del código fuente:** `src/components/ActionsComponent.vue`

**Patrón de diseño:** Dynamic Component Renderer + Sticky Floating Bar

## 2. Alcance

### Responsabilidades

1. **Renderizado Dinámico de Botones:**
   - Iterar sobre `Application.ListButtons.value` mediante `v-for`
   - Renderizar cada componente de botón usando directiva `:is`
   - Mantener orden de botones segun el array de Application.ListButtons
   - Actualizar reactivamente cuando lista de botones cambia

2. **Posicionamiento Sticky:**
   - Aplicar `position: sticky` con `top: 0` para mantener barra fija durante scroll
   - Establecer `z-index: 10` para estar encima de contenido pero debajo de overlays
   - Aplicar `margin-left: auto` para alineación a la derecha del contenedor
   - Mantener posición flotante independiente del contenido de vista

3. **Gestión de Estado de Scroll:**
   - Obtener referencia a `.ComponentContainer` (contenedor padre con scroll)
   - Registrar listener de scroll en `mounted()` para detectar cambios de posición
   - Ejecutar `handleScroll()` en cada evento de scroll
   - Actualizar propiedad `isAtTop` basada en `scrollTop === 0`
   - Aplicar clase CSS `.at-top` condicionalmente

4. **Transiciones Visuales:**
   - Establecer `opacity: 0.3` cuando usuario está scrolleado (no at-top)
   - Establecer `opacity: 1` cuando at-top o en hover
   - Aplicar transición suave de `opacity 0.3s ease` para cambios graduales
   - Proporcionar feedback visual de estado activo/semi-activo

### Límites

1. **NO controla qué botones mostrar** - Decision tomada por `Application.setButtonList()`, ActionsComponent solo renderiza
2. **NO implementa lógica de botones** - Cada botón es componente independiente con su propia lógica
3. **NO emite eventos propios** - Solo renderiza botones que emiten sus propios eventos
4. **NO gestiona estado de botones** - Estados (disabled, loading, etc.) son responsabilidad de cada componente de botón
5. **NO modifica Application.ListButtons** - Solo lee reactivamente, nunca modifica el array
6. **NO proporciona layout responsive** - Mantiene disposición horizontal fija independientemente de viewport

## 3. Definiciones Clave

### Conceptos Fundamentales

- **Sticky Positioning:** Propiedad CSS `position: sticky` que hace que elemento se comporte como relative hasta que el scroll alcanza umbral definido (`top: 0`), entonces se comporta como fixed relativo a su contenedor scrollable.

- **Application.ListButtons:** Ref reactivo de tipo `Ref<Component[]>` que contiene array de componentes Vue a renderizar como botones. Actualizado por `Application.setButtonList()` según contexto de vista.

- **isAtTop:** Propiedad booleana de data que indica si el scroll del ComponentContainer está en posición inicial (`scrollTop === 0`). Controla aplicación de clase CSS `.at-top`.

- **scrollContainer:** Referencia a elemento HTMLElement del `.ComponentContainer` obtenida mediante `this.$el.closest('.ComponentContainer')`. Usado para agregar listener de scroll.

- **handleScroll():** Método que ejecuta en cada evento de scroll, actualizando `isAtTop` basado en `scrollContainer.scrollTop`.

- **Dynamic Component Rendering:** Patrón usando `<component :is="component" />` para renderizar componentes determinados en runtime. `v-for` itera sobre array y renderiza cada componente.

### Estructura del Template

```vue
<div class="floating-actions" :class="{ 'at-top': isAtTop }">
    <component v-for="component in Application.ListButtons" :is="component" />
</div>
```

**Simplicidad:** Template extremadamente simple con un contenedor div y un `v-for` que renderiza componentes dinámicos.

**Binding de Clase:** `:class="{ 'at-top': isAtTop }"` aplica clase `.at-top` cuando scroll está en top, afectando estilos (opacity 1 vs 0.3).

**v-for sin key:** No se especifica `:key` porque componentes son referencias estáticas (markRaw) que cambian por completo, no se actualizan.

### Botones Estándar Renderizados

Según contexto de vista, `Application.ListButtons` puede contener:

1. **NewButtonComponent:** Crear nueva instancia de entidad
2. **RefreshButtonComponent:** Recargar datos de vista actual
3. **ValidateButtonComponent:** Ejecutar validaciones de entidad
4. **SaveButtonComponent:** Guardar cambios de entidad (solo persistent)
5. **SaveAndNewButtonComponent:** Guardar y crear nueva instancia (solo persistent)
6. **SendToDeviceButtonComponent:** Enviar datos a dispositivo externo

Ver documentación de cada botón en `ActionButtonComponents.md`.

### Timing de setButtonList()

Application ejecuta `setButtonList()` con delay de 405ms después de cambio de vista:

```typescript
setTimeout(() => {
    this.setButtonList();
}, 405);
```

**Razón:** Sincronización con transición de ComponentContainerComponent (400ms loading) + 5ms buffer para garantizar que componente dinámico está completamente montado antes de configurar botones.

## 4. Descripción Técnica

ActionsComponent utiliza Vue Options API:

```vue
<script lang="ts">
import Application from '@/models/application';

export default {
    name: 'ActionsComponent',
    data() {
        return {
            Application,
            isAtTop: true,
            scrollContainer: null as HTMLElement | null,
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

### Data Properties

```typescript
{
    Application: ApplicationClass,      // Referencia al singleton para acceso a ListButtons
    isAtTop: boolean,                   // Estado de scroll (true = en top, false = scrolled)
    scrollContainer: HTMLElement | null // Referencia al contenedor con scroll
}
```

**Application:** Expuesto en data para que template pueda acceder a `Application.ListButtons` reactivamente.

**isAtTop:** Inicializado como `true` porque al montar vista típicamente scroll está en top. Actualizado por `handleScroll()`.

**scrollContainer:** Inicializado como `null`, poblado en `mounted()` con referencia al `.ComponentContainer`.

### Lifecycle Hook: mounted()

```typescript
mounted() {
    this.scrollContainer = this.$el.closest('.ComponentContainer');
    if (this.scrollContainer) {
        this.scrollContainer.addEventListener('scroll', this.handleScroll);
        this.handleScroll();
    }
}
```

**Paso 1:** Obtiene referencia al contenedor padre con clase `.ComponentContainer` usando `this.$el.closest()`.

`closest()` busca ancestro más cercano que coincida con selector, retornando `HTMLElement` o `null` si no encuentra.

**Paso 2:** Valida que `scrollContainer` existe (no null) para evitar errores en caso de estructura DOM inesperada.

**Paso 3:** Agrega listener de scroll al `scrollContainer` con callback `this.handleScroll`.

Listener se dispara cada vez que usuario hace scroll en ComponentContainer.

**Paso 4:** Ejecuta `handleScroll()` inmediatamente para establecer estado inicial de `isAtTop`.

Garantiza que estilos correctos se aplican desde el inicio (típicamente `isAtTop = true` si scroll en 0).

### Lifecycle Hook: beforeUnmount()

```typescript
beforeUnmount() {
    if (this.scrollContainer) {
        this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }
}
```

Limpia listener de scroll antes de desmontar componente:

**CRÍTICO:** Previene memory leaks eliminando referencias que podrían mantener componente en memoria. Si no se remueve listener, `scrollContainer` mantiene referencia a callback que referencia `this` (componente).

**Validación:** Verifica que `scrollContainer` existe antes de intentar remover listener para evitar errores si no se inicializó correctamente.

### Method: handleScroll()

```typescript
handleScroll() {
    if (this.scrollContainer) {
        this.isAtTop = this.scrollContainer.scrollTop === 0;
    }
}
```

Actualiza estado `isAtTop` basado en posición de scroll:

**scrollTop === 0:** Indica que scroll está en posición inicial (top). Establece `isAtTop = true`.

**scrollTop > 0:** Indica que usuario ha scrolleado hacia abajo. Establece `isAtTop = false`.

**Reactividad:** Vue detecta cambio en `isAtTop` y actualiza binding `:class="{ 'at-top': isAtTop }"`, agregando o removiendo clase `.at-top` del div.

**Performance:** Método muy ligero (solo comparación booleana), ejecuta eficientemente en cada evento de scroll sin impacto perceptible en performance.

### Estilos CSS

```css
.floating-actions {
    position: sticky;
    top: 0;
    right: 0;
    width: auto;
    margin-left: auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    gap: var(--spacing-medium);
    align-items: center;
    background-color: var(--white);
    padding: var(--padding-medium);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    margin-bottom: var(--margin-medium);
    overflow: hidden;
    transition: max-width var(--transition-slow) var(--timing-ease), opacity var(--transition-normal) var(--timing-ease);
    white-space: nowrap;
    opacity: var(--opacity-disabled);
}

.floating-actions.at-top {
    opacity: 1;
}

.floating-actions:hover {
    opacity: 1;
}
```

**Análisis por Propiedad:**

- **position: sticky + top: 0:** Comportamiento sticky que hace que barra permanezca visible al hacer scroll
- **right: 0 + margin-left: auto:** Alineación a la derecha del contenedor
- **z-index: 10:** Por encima de contenido (z-index 0) pero debajo de overlays (99999+)
- **display: flex + flex-direction: row:** Botones dispuestos horizontalmente en fila
- **gap: var(--spacing-medium):** Separación entre botones definida por token
- **align-items: center:** Alineación vertical centrada de botones
- **background-color: var(--white):** Fondo blanco sólido para contraste con contenido
- **padding: var(--padding-medium):** Padding interno tokenizado
- **border-radius + box-shadow:** Apariencia de tarjeta elevada
- **margin-bottom: var(--margin-medium):** Separación inferior tokenizada
- **overflow: hidden:** Previene que contenido exceda bordes con border-radius
- **transition:** Transiciones suaves en max-width y opacity usando tokens de duración y timing
- **white-space: nowrap:** Previene wrap de contenido de botones
- **opacity: var(--opacity-disabled):** Estado semi-transparente por defecto cuando scrolled

**Clase .at-top:**
- **opacity: 1:** Estado completamente opaco cuando scroll está en top

**Selector :hover:**
- **opacity: 1:** Estado completamente opaco al pasar mouse, incluso si scrolled

**Estrategia de Opacidad:**
- En top: Opaco (opacity 1) para indicar estado activo
- Scrolled: Semi-transparente (opacity 0.3) para reducir distracción visual
- Hover: Opaco (opacity 1) para facilitar interacción incluso cuando scrolled

## 5. Flujo de Funcionamiento

### Montaje Inicial del Componente

```
1. ComponentContainerComponent renderiza ActionsComponent
        ↓
2. ActionsComponent.created() ejecuta (sin lógica)
        ↓
3. Data properties se inicializan:
   - Application = referencia al singleton
   - isAtTop = true
   - scrollContainer = null
        ↓
4. Template se renderiza inicial:
   - <div class="floating-actions at-top">
   - v-for itera Application.ListButtons.value (puede estar vacío inicialmente)
   - Botones se renderizan dinámicamente
        ↓
5. ActionsComponent.mounted() ejecuta
        ↓
6. Ejecuta: this.$el.closest('.ComponentContainer')
   → Obtiene referencia al ComponentContainer
        ↓
7. Valida scrollContainer !== null
        ↓
8. Agrega listener: scrollContainer.addEventListener('scroll', handleScroll)
        ↓
9. Ejecuta handleScroll() por primera vez
   → Establece isAtTop basado en scrollTop actual (típicamente 0 → true)
        ↓
10. Componente queda listo, esperando cambios en ListButtons y eventos de scroll
```

### Cambio de Vista con Actualización de Botones

```
1. Usuario navega a vista de lista de productos
   Application.changeViewToListView(Products)
        ↓
2. Application actualiza View.value con nueva vista
        ↓
3. ComponentContainerComponent detecta cambio y actualiza componente dinámico
        ↓
4. setTimeout de 405ms inicia en Application.changeView()
        ↓
5. [Transición de loading 400ms ocurre]
        ↓
6. Application.setButtonList() ejecuta (después de 405ms)
        ↓
7. setButtonList() determina botones según viewType:
   ViewType.LISTVIEW → [New, Refresh]
        ↓
8. Application.ListButtons.value = [
       markRaw(NewButtonComponent),
       markRaw(RefreshButtonComponent)
   ]
        ↓
9. Vue detecta cambio en Application.ListButtons (reactivo)
        ↓
10. v-for en ActionsComponent se re-evalúa
        ↓
11. Vue desmonta botones anteriores (si existían)
        ↓
12. Vue monta nuevos botones (NewButton, RefreshButton)
        ↓
13. Cada botón ejecuta su mounted() y registra listeners
        ↓
14. Botones visibles y funcionales en barra flotante
```

### Evento de Scroll y Actualización de Opacidad

```
1. Usuario hace scroll hacia abajo en ComponentContainer
        ↓
2. Navegador dispara evento 'scroll' en scrollContainer
        ↓
3. Listener ejecuta: this.handleScroll()
        ↓
4. handleScroll() lee scrollContainer.scrollTop
   → Valor > 0 (usuario scrolleó)
        ↓
5. Ejecuta: this.isAtTop = false
        ↓
6. Vue detecta cambio en isAtTop (data property reactiva)
        ↓
7. Vue re-evalúa :class="{ 'at-top': isAtTop }"
   → isAtTop = false → clase .at-top NO se aplica
        ↓
8. Navegador aplica estilos base:
   opacity: 0.3 (semi-transparente)
        ↓
9. Transición CSS anima cambio durante 300ms
        ↓
10. Usuario ve barra volverse semi-transparente
        ↓
11. [Usuario hace hover sobre barra]
        ↓
12. Selector :hover aplica opacity: 1
        ↓
13. Barra se vuelve opaca temporalmente para facilitar interacción
        ↓
14. [Usuario saca mouse de barra]
        ↓
15. opacity vuelve a 0.3
```

### Scroll de Regreso al Top

```
1. Usuario hace scroll hacia arriba hasta el top
        ↓
2. scrollTop alcanza valor 0
        ↓
3. Evento 'scroll' dispara handleScroll()
        ↓
4. scrollContainer.scrollTop === 0 → true
        ↓
5. Ejecuta: this.isAtTop = true
        ↓
6. Vue actualiza clase: <div class="floating-actions at-top">
        ↓
7. CSS aplica: opacity: 1
        ↓
8. Transición anima cambio durante 300ms
        ↓
9. Barra completamente opaca indica estado activo
```

### Desmontaje y Cleanup

```
1. Usuario navega fuera de vista principal
        ↓
2. ComponentContainerComponent inicia desmontaje
        ↓
3. ActionsComponent inicia desmontaje
        ↓
4. beforeUnmount() hook ejecuta
        ↓
5. Valida: scrollContainer !== null
        ↓
6. Ejecuta: scrollContainer.removeEventListener('scroll', handleScroll)
        ↓
7. Navegador elimina referencia al listener
        ↓
8. Listener y callback quedan disponibles para garbage collection
        ↓
9. Componente se desmonta sin memory leaks
```

## 6. Reglas Obligatorias

### Regla 1: Cleanup de Scroll Listener Obligatorio
El listener de scroll DEBE removerse en `beforeUnmount()` para prevenir memory leaks.

```typescript
// ✅ CORRECTO
mounted() {
    this.scrollContainer.addEventListener('scroll', this.handleScroll);
}
beforeUnmount() {
    this.scrollContainer.removeEventListener('scroll', this.handleScroll);
}

// ❌ INCORRECTO - Memory leak
mounted() {
    this.scrollContainer.addEventListener('scroll', this.handleScroll);
}
// Sin beforeUnmount()
```

### Regla 2: Validación de scrollContainer Obligatoria
DEBE validarse que `scrollContainer` no sea `null` antes de agregar listener o acceder a propiedades.

```typescript
// ✅ CORRECTO
if (this.scrollContainer) {
    this.scrollContainer.addEventListener('scroll', this.handleScroll);
}

// ❌ INCORRECTO - Puede lanzar error si closest() retorna null
this.scrollContainer.addEventListener('scroll', this.handleScroll);
```

### Regla 3: markRaw() Obligatorio en Application.ListButtons
Los componentes agregados a `Application.ListButtons` DEBEN envolverse con `markRaw()` para optimizar performance.

```typescript
// ✅ CORRECTO
Application.ListButtons.value = [
    markRaw(NewButtonComponent),
    markRaw(RefreshButtonComponent)
];

// ❌ INCORRECTO - Performance degradada
Application.ListButtons.value = [
    NewButtonComponent,
    RefreshButtonComponent
];
```

### Regla 4: Position Sticky con top: 0
ActionsComponent DEBE usar `position: sticky` con `top: 0` para comportamiento flotante correcto.

```css
/* ✅ CORRECTO */
.floating-actions {
    position: sticky;
    top: 0;
}

/* ❌ INCORRECTO - No flotante */
.floating-actions {
    position: relative;
}

/* ❌ INCORRECTO - Fixed rompería scroll */
.floating-actions {
    position: fixed;
    top: 0;
}
```

### Regla 5: Z-Index con Token
Z-index DEBE declararse con token del sistema (`var(--z-base)`) para mantener consistencia de capas.

```css
/* ✅ CORRECTO */
.floating-actions {
    z-index: var(--z-base);
}

/* ❌ INCORRECTO - Cubriría overlays críticos */
.floating-actions {
    z-index: 99999;
}

/* ❌ INCORRECTO - Contenido podría cubrir botones */
.floating-actions {
    z-index: var(--z-toast);
}
```

### Regla 6: Inicialización de isAtTop en true
`isAtTop` DEBE inicializarse como `true` porque scroll típicamente está en top al montar vista.

```typescript
// ✅ CORRECTO
data() {
    return {
        isAtTop: true
    }
}

// ❌ INCORRECTO - Estado inicial incorrecto
data() {
    return {
        isAtTop: false
    }
}
```

### Regla 7: v-for Directo sin Wrapper
El `v-for` DEBE aplicarse directamente a `<component>`, no a un wrapper div para cada botón.

```vue
<!-- ✅ CORRECTO -->
<div class="floating-actions">
    <component v-for="component in Application.ListButtons" :is="component" />
</div>

<!-- ❌ INCORRECTO - Wrapper innecesario -->
<div class="floating-actions">
    <div v-for="component in Application.ListButtons">
        <component :is="component" />
    </div>
</div>
```

### Regla 8: Transición Solo en opacity y valores tokenizados
La transición de opacity DEBE aplicarse para cambios suaves, NO aplicar transiciones a todas las propiedades.

```css
/* ✅ CORRECTO */
.floating-actions {
    transition: max-width var(--transition-slow) var(--timing-ease), opacity var(--transition-normal) var(--timing-ease);
}

/* ❌ INCORRECTO - Transiciona propiedades no cambiantes */
.floating-actions {
    transition: all 0.3s ease;
}
```

## 7. Prohibiciones

### Prohibición 1: NO Modificar Application.ListButtons Directamente
ActionsComponent NO DEBE modificar `Application.ListButtons`. Solo debe leer reactivamente.

```typescript
// ❌ PROHIBIDO
methods: {
    addButton() {
        Application.ListButtons.value.push(SomeButton);  // ❌
    }
}

// ✅ CORRECTO - Solo lectura en template
<component v-for="component in Application.ListButtons" :is="component" />
```

### Prohibición 2: NO Implementar Lógica de Botones
ActionsComponent NO DEBE implementar lógica de acciones de botones. Cada botón gestiona su propia lógica.

```typescript
// ❌ PROHIBIDO
methods: {
    handleSave() {
        // Lógica de guardar  ❌
    }
}

// ✅ CORRECTO - Botones implementan su propia lógica
// (en SaveButtonComponent.vue)
methods: {
    handleClick() {
        // Lógica de guardar
    }
}
```

### Prohibición 3: NO Emitir Eventos Propios
ActionsComponent NO DEBE emitir eventos mediante `$emit()`. Los botones individuales emiten sus propios eventos.

```typescript
// ❌ PROHIBIDO
methods: {
    notifyAction() {
        this.$emit('action-performed');  // ❌
    }
}

// ✅ CORRECTO - Sin emisión de eventos
// Botones individuales emiten según necesiten
```

### Prohibición 4: NO Agregar v-key en v-for
NO agregar `:key` en el `v-for` de componentes porque se reemplazan completamente, no se actualizan.

```vue
<!-- ❌ PROHIBIDO - Key innecesario -->
<component 
    v-for="(component, index) in Application.ListButtons" 
    :key="index" 
    :is="component" 
/>

<!-- ✅ CORRECTO - Sin key -->
<component 
    v-for="component in Application.ListButtons" 
    :is="component" 
/>
```

### Prohibición 5: NO Modificar scrollTop Programáticamente
ActionsComponent NO DEBE modificar `scrollTop` del container. Solo debe observar su valor.

```typescript
// ❌ PROHIBIDO
methods: {
    scrollToTop() {
        this.scrollContainer.scrollTop = 0;  // ❌
    }
}

// ✅ CORRECTO - Solo lectura
methods: {
    handleScroll() {
        this.isAtTop = this.scrollContainer.scrollTop === 0;  // ✅
    }
}
```

### Prohibición 6: NO Usar getElementById para scrollContainer
NO usar `getElementById()` para obtener scrollContainer. DEBE usarse `closest()` para búsqueda contextual.

```typescript
// ❌ PROHIBIDO - Rígido y frágil
mounted() {
    this.scrollContainer = document.getElementById('component-container');  // ❌
}

// ✅ CORRECTO - Búsqueda contextual
mounted() {
    this.scrollContainer = this.$el.closest('.ComponentContainer');  // ✅
}
```

### Prohibición 7: NO Renderizar Contenido Adicional
ActionsComponent NO DEBE renderizar contenido adicional aparte de los botones dinámicos.

```vue
<!-- ❌ PROHIBIDO - Contenido adicional -->
<div class="floating-actions">
    <h3>Actions</h3>  <!-- ❌ -->
    <component v-for="component in Application.ListButtons" :is="component" />
</div>

<!-- ✅ CORRECTO - Solo botones -->
<div class="floating-actions">
    <component v-for="component in Application.ListButtons" :is="component" />
</div>
```

### Prohibición 8: NO Aplicar Estilos Inline a Botones
NO aplicar estilos inline o clases a los componentes de botones renderizados.

```vue
<!-- ❌ PROHIBIDO -->
<component 
    v-for="component in Application.ListButtons" 
    :is="component"
    style="margin: 10px"  <!-- ❌ -->
    class="custom-button"  <!-- ❌ -->
/>

<!-- ✅ CORRECTO - Botones gestionan sus propios estilos -->
<component 
    v-for="component in Application.ListButtons" 
    :is="component"
/>
```

## 8. Dependencias

### Dependencias de Application

```typescript
import Application from '@/models/application';
```

ActionsComponent depende de una parte específica de Application:

**Application.ListButtons:** Ref reactivo de tipo `Ref<Component[]>` que contiene array de componentes de botones a renderizar. Actualizado por `Application.setButtonList()` según contexto de vista.

**NO depende de:**
- Application.View (indirectamente relacionado pero no accedido directamente)
- Application.eventBus
- Application.ApplicationUIService

### Dependencias de Componentes de Botones

ActionsComponent puede renderizar los siguientes componentes de botones (importados y registrados en `Application.setButtonList()`):

```typescript
// En Application.setButtonList()
import NewButtonComponent from '@/components/Buttons/NewButtonComponent.vue';
import RefreshButtonComponent from '@/components/Buttons/RefreshButtonComponent.vue';
import ValidateButtonComponent from '@/components/Buttons/ValidateButtonComponent.vue';
import SaveButtonComponent from '@/components/Buttons/SaveButtonComponent.vue';
import SaveAndNewButtonComponent from '@/components/Buttons/SaveAndNewButtonComponent.vue';
import SendToDeviceButtonComponent from '@/components/Buttons/SendToDeviceButtonComponent.vue';
```

**Relación:** ActionsComponent NO importa estos componentes directamente. Application los importa, los envuelve con `markRaw()`, y los asigna a `ListButtons.value`. ActionsComponent los renderiza dinámicamente.

### Dependencias de CSS Variables

```css
background-color: var(--white);        /* Color de fondo de la barra */
border-radius: var(--border-radius);   /* Border radius de la tarjeta */
box-shadow: var(--shadow-light);       /* Sombra de elevación */
```

Estas variables deben definirse en `src/css/constants.css` o archivo de variables globales.

### Dependencias de DOM

ActionsComponent depende de la estructura DOM específica:

```
<div class="ViewContainer">
    <div class="ComponentContainer">  ← DEBE existir con esta clase
        <ActionsComponent />           ← Se posiciona sticky relativo a ComponentContainer
    </div>
</div>
```

**ComponentContainer:** DEBE existir como ancestro con clase `.ComponentContainer` para que `closest()` funcione correctamente.

**Scroll en ComponentContainer:** ComponentContainer DEBE tener `overflow: auto` para generar eventos de scroll observados por ActionsComponent.

### Dependencias Implícitas

1. **ComponentContainerComponent:** Aunque no importado, ActionsComponent depende de ser renderizado dentro de ComponentContainer como hijo para posicionamiento correcto.

2. **Application.setButtonList():** Aunque no llamado directamente, ActionsComponent depende de que este método actualice `ListButtons` según contexto de vista.

3. **markRaw de Vue:** Depende de que Application use `markRaw()` al asignar componentes a ListButtons para performance óptimo.

## 9. Relaciones

### Relación con Application (1:1 Reactiva)

ActionsComponent tiene relación 1:1 reactiva con Application mediante ListButtons:

```
ActionsComponent (1) ──► (1) Application.ListButtons
                              ↓
                         [Component[]]
```

- **Dirección de flujo:** Unidireccional desde Application hacia ActionsComponent
- **Tipo de relación:** Observer reactivo - ActionsComponent lee, no modifica
- **Acoplamiento:** Medio - ActionsComponent depende de estructura de ListButtons pero no de lógica de botones
- **Sincronización:** Automática mediante reactividad de Vue

### Relación con Componentes de Botones (1:N Dinámica)

ActionsComponent renderiza dinámicamente N componentes de botones:

```
ActionsComponent (1) ──► (N) Button Components
                         │
                         ├── NewButtonComponent
                         ├── RefreshButtonComponent
                         ├── SaveButtonComponent
                         └── ...
```

- **Dirección de flujo:** Unidireccional ActionsComponent → Botones (renderizado)
- **Tipo de relación:** Container-Child mediante renderizado dinámico
- **Acoplamiento:** Nulo - ActionsComponent no conoce detalles de botones
- **Ciclo de vida:** Botones se montan/desmontan cuando cambia ListButtons

### Relación con ComponentContainerComponent (1:1 Layout + Coordinación)

ActionsComponent tiene relación de layout con ComponentContainerComponent:

```
ComponentContainerComponent (1)
    └── ComponentContainer (div con scroll)
            ├── ActionsComponent (1) ← Sticky positioned
            └── Componente dinámico de vista
```

- **Dirección de flujo:** Bidireccional (layout + eventos de scroll)
- **Tipo de relación:** Parent-Child (layout) + Event Source (scroll events)
- **Acoplamiento:** Medio - ActionsComponent depende de clase .ComponentContainer
- **Scroll:** ComponentContainer genera eventos de scroll observados por ActionsComponent

### Relación con Application.setButtonList() (1:1 Indirecta)

ActionsComponent depende indirectamente de `Application.setButtonList()`:

```
Application.changeView() (1)
        ↓
Application.setButtonList() (ejecuta después de 405ms)
        ↓
Application.ListButtons.value actualizado
        ↓
ActionsComponent (1) detecta cambio y re-renderiza
```

- **Dirección de flujo:** Unidireccional Application → ActionsComponent
- **Tipo de relación:** Command mediante cambio de estado reactivo
- **Acoplamiento:** Bajo - Desacoplados mediante estado reactivo
- **Timing:** setButtonList() espera 405ms para sincronizar con transición de vista

### Diagrama de Relaciones Completo

```
┌──────────────────────────────────────────────────────────┐
│       ComponentContainerComponent                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ComponentContainer (div, overflow: auto)          │  │
│  │                                                    │  │
│  │  ┌────────────────────────────────────────────┐   │  │
│  │  │  ActionsComponent                          │   │  │
│  │  │  (position: sticky, top: 0)                │   │  │
│  │  │                                            │   │  │
│  │  │  ┌────────────────────────────────────┐   │   │  │
│  │  │  │ v-for component in ListButtons     │   │   │  │
│  │  │  │  ├─ NewButton                      │   │   │  │
│  │  │  │  ├─ RefreshButton                  │   │   │  │
│  │  │  │  └─ SaveButton                     │   │   │  │
│  │  │  └────────────────────────────────────┘   │   │  │
│  │  │                                            │   │  │
│  │  │  scrollContainer ref ──┐                  │   │  │
│  │  │  isAtTop: boolean      │                  │   │  │
│  │  └────────────────────────┼──────────────────┘   │  │
│  │                            │ addEventListener     │  │
│  │                            │ 'scroll'             │  │
│  │  ┌─────────────────────────┘                     │  │
│  │  │  Componente dinámico de vista                │  │
│  │  │  (contenido scrollable)                      │  │
│  │  └────────────────────────────────────────────  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                            ↑
                            │ lee reactivamente
                            │
            ┌───────────────┴──────────────┐
            │      Application             │
            │                              │
            │  ListButtons.value ────────┐ │
            │  Ref<Component[]>          │ │
            └────────────────────────────┼─┘
                                         │
                                         │ actualizado por
                                         ↓
                            ┌──────────────────────────┐
                            │ Application.setButtonList()│
                            │                          │
                            │ - Determina botones      │
                            │   según viewType         │
                            │ - Envuelve con markRaw() │
                            │ - Asigna a ListButtons   │
                            │ - Delay: 405ms           │
                            └──────────────────────────┘
```

## 10. Notas de Implementación

### Nota 1: Timing de 405ms y Sincronización

Application ejecuta `setButtonList()` con delay de 405ms:

```typescript
setTimeout(() => {
    this.setButtonList();
}, 405);
```

**Razón:** Sincronización con transición de ComponentContainerComponent:
- 0ms: Cambio de vista inicia
- 0-400ms: LoadingScreen visible, transición de componente ocurre
- 400ms: Nuevo componente montado
- 405ms: setButtonList() ejecuta, botones apropiados se configuran

**Beneficio:** Garantiza que botones no cambien visualmente durante transición de loading, mejorando UX.

### Nota 2: Ausencia de :key en v-for

El `v-for` no especifica `:key`:

```vue
<component v-for="component in Application.ListButtons" :is="component" />
```

**Razón:** Los componentes son referencias estáticas envueltas con `markRaw()`. Cuando `ListButtons` cambia, todo el array se reemplaza completamente, no se actualizan componentes individuales.

**Vue behavior:** Sin `:key`, Vue reemplaza componentes en orden, desmontando antiguos y montando nuevos. Comportamiento deseado en este caso.

**Alternativa con key:** Si se agregara key, debería ser index basado (no recomendado) o referencia al componente (complejo e innecesario).

### Nota 3: Opacidad y UX

La estrategia de opacidad mejora UX:

```css
opacity: 0.3;  /* Scrolled */
.at-top { opacity: 1; }  /* At top */
:hover { opacity: 1; }  /* Hover */
```

**Beneficios:**
- **At top:** Opaco indica estado activo, llama atención a botones
- **Scrolled:** Semi-transparente reduce distracción mientras usuario lee contenido
- **Hover:** Opaco facilita interacción incluso cuando scrolled

**Alternativa sin opacidad:** Mantener opacity 1 siempre, pero puede ser visualmente distractivo.

### Nota 4: Z-Index Strategy

Z-index de 10 está calibrado para jerarquía visual:

```
0-9:     Contenido regular (texto, imágenes)
10:      ActionsComponent (botones flotantes)
11-99:   Otros elementos flotantes (tooltips, dropdowns pequeños)
100-999: Dropdowns grandes, popovers
1000+:   Modales, overlays full-screen
```

ActionsComponent con z-index: 10 está justo encima de contenido pero permite overlays más críticos estar encima.

### Nota 5: Performance de handleScroll()

`handleScroll()` ejecuta en cada evento de scroll, pero es extremadamente ligero:

```typescript
handleScroll() {
    if (this.scrollContainer) {
        this.isAtTop = this.scrollContainer.scrollTop === 0;
    }
}
```

**Operaciones:** Solo una comparación booleana.

**Performance:** Negligible, no requiere throttling o debouncing para uso normal.

**Mejora potencial:** Si la aplicación tiene performance issues severos con scroll, considerar throttling:

```typescript
import { throttle } from 'lodash-es';

mounted() {
    const throttledScroll = throttle(this.handleScroll, 100);
    this.scrollContainer.addEventListener('scroll', throttledScroll);
}
```

### Nota 6: Testing y Mocking

Para testing de ActionsComponent:

```typescript
import { mount } from '@vue/test-utils';
import ActionsComponent from '@/components/ActionsComponent.vue';
import Application from '@/models/application';
import { markRaw } from 'vue';

describe('ActionsComponent', () => {
    beforeEach(() => {
        Application.ListButtons.value = [];
    });
    
    it('renderiza botones de ListButtons', () => {
        const MockButton = { template: '<button>Mock</button>' };
        Application.ListButtons.value = [markRaw(MockButton)];
        
        const wrapper = mount(ActionsComponent);
        expect(wrapper.text()).toContain('Mock');
    });
    
    it('actualiza isAtTop al hacer scroll', async () => {
        const wrapper = mount(ActionsComponent, {
            attachTo: document.body
        });
        
        const mockContainer = document.createElement('div');
        mockContainer.className = 'ComponentContainer';
        mockContainer.scrollTop = 100;
        wrapper.vm.scrollContainer = mockContainer;
        
        wrapper.vm.handleScroll();
        await wrapper.vm.$nextTick();
        
        expect(wrapper.vm.isAtTop).toBe(false);
    });
    
    it('limpia listener en beforeUnmount', () => {
        const removeListenerSpy = vi.fn();
        const wrapper = mount(ActionsComponent);
        wrapper.vm.scrollContainer = {
            removeEventListener: removeListenerSpy
        };
        
        wrapper.unmount();
        
        expect(removeListenerSpy).toHaveBeenCalledWith('scroll', wrapper.vm.handleScroll);
    });
});
```

### Nota 7: Alternativa con Composition API

Si se migra a Composition API (script setup):

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Application from '@/models/application';

const isAtTop = ref(true);
const scrollContainer = ref<HTMLElement | null>(null);

const handleScroll = () => {
    if (scrollContainer.value) {
        isAtTop.value = scrollContainer.value.scrollTop === 0;
    }
};

onMounted(() => {
    const el = document.querySelector('.ComponentContainer') as HTMLElement;
    scrollContainer.value = el;
    
    if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', handleScroll);
        handleScroll();
    }
});

onBeforeUnmount(() => {
    if (scrollContainer.value) {
        scrollContainer.value.removeEventListener('scroll', handleScroll);
    }
});
</script>
```

**Nota:** En Composition API con script setup, `this.$el` no está disponible, por lo que se usa `document.querySelector()` directamente.

### Nota 8: Extensibilidad con Botones Personalizados

Para agregar botón personalizado:

```typescript
// 1. Crear componente de botón
// CustomButtonComponent.vue
export default {
    name: 'CustomButtonComponent',
    template: '<button @click="handleClick" class="custom-btn">Custom</button>',
    methods: {
        handleClick() {
            console.log('Custom action executed');
            Application.eventBus.emit('custom-action');
        }
    }
}

// 2. Registrar en Application.setButtonList()
import { markRaw } from 'vue';
import CustomButtonComponent from '@/components/Buttons/CustomButtonComponent.vue';

// En Application.setButtonList(), agregar caso personalizado:
if (someCondition) {
    this.ListButtons.value.push(markRaw(CustomButtonComponent));
}
```

ActionsComponent renderizará automáticamente el botón personalizado sin modificaciones.

### Nota 9: Accesibilidad (a11y)

Para mejorar accesibilidad:

```vue
<div 
    class="floating-actions" 
    :class="{ 'at-top': isAtTop }"
    role="toolbar"
    aria-label="Actions toolbar"
>
    <component v-for="component in Application.ListButtons" :is="component" />
</div>
```

- **role="toolbar":** Indica a lectores de pantalla que es barra de herramientas
- **aria-label:** Proporciona descripción textual para usuarios de lector de pantalla

Cada botón individual debe tener sus propios `aria-label` y roles apropiados.

### Nota 10: Responsive Design Futuro

Actualmente ActionsComponent no es responsive. Para pantallas pequeñas, considerar:

```css
@media (max-width: 768px) {
    .floating-actions {
        flex-direction: column;  /* Botones verticales */
        gap: 0.5rem;
        width: auto;
        max-width: 150px;
    }
    
    .floating-actions button {
        width: 100%;  /* Botones ocupan ancho completo */
        font-size: 0.875rem;  /* Texto más pequeño */
    }
}
```

O implementar drawer colapsable para móviles:

```vue
<div class="floating-actions" :class="{ collapsed: isMobile && !expanded }">
    <button class="toggle-btn" @click="expanded = !expanded" v-if="isMobile">
        Actions
    </button>
    <component v-if="!isMobile || expanded" v-for="component in Application.ListButtons" :is="component" />
</div>
```

## 11. Referencias Cruzadas

### Documentos Relacionados en Copilot

- **[ComponentContainerComponent.md](ComponentContainerComponent.md):** Documenta el contenedor principal que renderiza ActionsComponent como hijo y proporciona contexto de scroll.

- **[ActionButtonComponents.md](ActionButtonComponents.md):** Documenta los componentes de botones individuales (New, Save, Refresh, etc.) renderizados por ActionsComponent.

- **[buttons-overview.md](buttons-overview.md):** Proporciona visión general del sistema de botones del framework, incluyendo patrón de renderizado dinámico.

- **[core-components.md](core-components.md):** Documenta los componentes core del framework, incluyendo ActionsComponent como parte de infraestructura de UI.

- **[../03-application/application-singleton.md](../03-application/application-singleton.md):** Documenta Application.ListButtons y Application.setButtonList() que controlan qué botones se muestran.

### Archivos de Código Relacionados

- **`src/components/ActionsComponent.vue`:** Archivo fuente implementando el componente documentado.

- **`src/models/application.ts`:** Implementación del singleton Application con `ListButtons` y método `setButtonList()`.

- **`src/components/ComponentContainerComponent.vue`:** Componente padre que renderiza ActionsComponent y proporciona `.ComponentContainer` para scroll.

- **`src/components/Buttons/NewButtonComponent.vue`:** Botón de creación de nueva entidad.

- **`src/components/Buttons/SaveButtonComponent.vue`:** Botón de guardado de entidad.

- **`src/components/Buttons/RefreshButtonComponent.vue`:** Botón de recarga de datos.

- **`src/components/Buttons/ValidateButtonComponent.vue`:** Botón de validación de entidad.

- **`src/components/Buttons/SaveAndNewButtonComponent.vue`:** Botón de guardar y crear nueva.

- **`src/components/Buttons/SendToDeviceButtonComponent.vue`:** Botón de envío a dispositivo.

### Flujos de Integración

ActionsComponent participa en los siguientes flujos documentados:

1. **Flujo de Cambio de Vista:** Documentado en [../03-application/application-singleton.md](../03-application/application-singleton.md). Cuando vista cambia, Application.setButtonList() actualiza ListButtons, ActionsComponent re-renderiza botones.

2. **Flujo de Renderizado Dinámico:** Documentado en [ComponentContainerComponent.md](ComponentContainerComponent.md). ActionsComponent renderizado como hijo de ComponentContainer con botones apropiados para vista.

3. **Flujo de Acciones de Botones:** Documentado en [ActionButtonComponents.md](ActionButtonComponents.md). Usuario hace click en botón → Botón ejecuta lógica → Emite eventos o ejecuta métodos de Application.

4. **Flujo de Scroll:** ComponentContainer genera eventos de scroll → ActionsComponent escucha → Actualiza isAtTop → Aplica estilos de opacidad apropiados.

### Propiedades y Métodos Relacionados

- **Application.ListButtons:** Ref reactivo con array de componentes de botones renderizados por ActionsComponent.

- **Application.setButtonList():** Método que actualiza `ListButtons` según `View.value.viewType` y características de entidad.

- **Application.View.value.viewType:** Enum (LISTVIEW, DETAILVIEW, etc.) que determina qué botones mostrar.

- **markRaw():** Función de Vue utilizada por Application para optimizar componentes en ListButtons.

### Conceptos Relacionados

- **Sticky Positioning:** Documentado en [CSS Tricks - position: sticky](https://css-tricks.com/position-sticky-2/).

- **Dynamic Component Rendering:** Patrón de Vue documentado en [Vue.js docs - Dynamic Components](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components).

- **markRaw API:** Función de Vue documentada en [Vue.js API - markRaw](https://vuejs.org/api/reactivity-advanced.html#markraw).
