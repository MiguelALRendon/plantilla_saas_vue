# 📋 DropdownMenu

**Referencias:**
- `core-components.md` - Componentes core del framework
- `../03-application/application-singleton.md` - Application
- `../03-application/ui-services.md` - UI Services

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/DropdownMenu.vue`

---

## 🎯 Propósito

`DropdownMenu` es un **menú desplegable posicionable** que aparece en respuesta a clicks en elementos de la UI. Se utiliza para mostrar opciones, formularios pequeños, o contenido contextual.

**Características:**
- 🎯 Posicionamiento dinámico (calcula mejor ubicación)
- 🎨 Renderiza componentes dinámicos
- ⌨️ Cierre con ESC o click fuera
- 📐 Ajuste automático a bordes de pantalla

---

## 🏗️ Estructura

### Template

```vue
<div :class="['dropdown-menu-container', { hidden: !dropDownData.showing }]">
    <div class="dropdown-menu" 
         id="dropdown-element-in-general" 
         :style="dropdownStyle">
        <span class="dropdown-menu-title">{{ dropDownData.title }}</span>
        <component v-if="dropDownData.component" :is="dropDownData.component">
        </component>
    </div>
</div>
```

**Elementos:**
- `dropdown-menu-container`: Overlay de fondo
- `dropdown-menu`: Card del menú
- Título dinámico
- Componente dinámico (contenido)

---

## 📊 Data Structure

### Data Properties

```typescript
{
    Application: ApplicationClass  // Referencia a Application
}
```

### Computed: dropDownData

```typescript
computed: {
    dropDownData() {
        return Application.dropdownMenu.value;
    }
}
```

**Estructura de dropdownMenu:**
```typescript
{
    showing: boolean              // Visible/oculto
    title: string                 // Título del menú
    component: Component | null   // Componente a renderizar
    width: string                 // Ancho (ej: '250px')
    position_x: string            // Posición X (ej: '100px')
    position_y: string            // Posición Y (ej: '200px')
    canvasWidth: string           // Ancho de ventana
    canvasHeight: string          // Alto de ventana
    activeElementWidth: string    // Ancho del elemento trigger
    activeElementHeight: string   // Alto del elemento trigger
}
```

---

## 🎯 Posicionamiento Inteligente

### Computed: dropdownStyle

```typescript
computed: {
    dropdownStyle() {
        const data = this.dropDownData;
        
        const posX = parseFloat(data.position_x);
        const posY = parseFloat(data.position_y);
        const dropdownWidth = parseFloat(data.width);
        const canvasWidth = parseFloat(data.canvasWidth);
        const canvasHeight = parseFloat(data.canvasHeight);
        const elementHeight = parseFloat(data.activeElementHeight);
        
        // PASO 1: Calcular posición horizontal
        let leftPosition = posX - (dropdownWidth / 2);  // Centrado por defecto
        
        // Ajustar si se sale por la derecha
        if (leftPosition + dropdownWidth > canvasWidth) {
            leftPosition = posX - dropdownWidth;  // Alinear a la derecha
        }
        
        // Ajustar si se sale por la izquierda
        if (leftPosition < 0) {
            leftPosition = posX;  // Alinear a la izquierda
        }
        
        // PASO 2: Calcular posición vertical
        let topPosition = posY;
        const isInBottomHalf = posY > (canvasHeight / 2);
        
        if (isInBottomHalf) {
            // Aparecer arriba del elemento
            topPosition = posY - elementHeight;
        }
        
        return {
            'max-width': data.width,
            'left': `${leftPosition}px`,
            'top': `${topPosition}px`
        };
    }
}
```

**Lógica:**
1. Intenta centrar horizontalmente respecto al trigger
2. Si se sale de la ventana, ajusta posición
3. Decide si aparece arriba o abajo según mitad de pantalla

---

## ⌨️ Event Handlers

### handleClickOutside

```typescript
handleClickOutside(event: MouseEvent) {
    if (this.dropDownData.showing) {
        const dropdown = document.getElementById('dropdown-element-in-general');
        if (!dropdown) return;

        // Cerrar si el click fue fuera del dropdown
        if (!dropdown.contains(event.target as Node)) {
            Application.ApplicationUIService.closeDropdownMenu();
        }
    }
}
```

### handleKeydown

```typescript
handleKeydown(e: KeyboardEvent) {
    // Cerrar con tecla ESC
    if (e.key === 'Escape' && this.dropDownData.showing) {
        Application.ApplicationUIService.closeDropdownMenu();
    }
}
```

---

## 🔄 Ciclo de Vida

### Mounted

```typescript
mounted() {
    // Registrar event listeners globales
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('keydown', this.handleKeydown);
}
```

### BeforeUnmount

```typescript
beforeUnmount() {
    // Limpiar event listeners
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('keydown', this.handleKeydown);
}
```

---

## 📝 Uso desde ApplicationUIService

### Abrir Dropdown

```typescript
// Método en ApplicationUIService
openDropdownMenu(
    position: HTMLElement,      // Elemento trigger
    title: string,              // Título del menú
    component: Component,       // Componente a mostrar
    width?: string              // Ancho opcional
) {
    const rect = position.getBoundingClientRect();
    
    this.app.dropdownMenu.value.position_x = `${rect.left}px`;
    this.app.dropdownMenu.value.position_y = `${rect.bottom}px`;
    this.app.dropdownMenu.value.activeElementWidth = `${rect.width}px`;
    this.app.dropdownMenu.value.activeElementHeight = `${rect.height}px`;
    this.app.dropdownMenu.value.title = title;
    this.app.dropdownMenu.value.component = markRaw(component);
    
    if (width) {
        this.app.dropdownMenu.value.width = width;
    }
    
    this.app.dropdownMenu.value.showing = true;
}
```

### Cerrar Dropdown

```typescript
closeDropdownMenu() {
    this.app.dropdownMenu.value.showing = false;
    
    setTimeout(() => {
        this.app.dropdownMenu.value.component = null;
        this.app.dropdownMenu.value.title = '';
    }, 500);  // Esperar animación de cierre
}
```

---

## 💡 Ejemplo de Uso

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
        editItem() { /* ... */ },
        deleteItem() { /* ... */ },
        duplicateItem() { /* ... */ }
    }
}
</script>
```

### Abrir el Dropdown

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
                this.$refs.optionsButton,    // Elemento trigger
                'Options',                    // Título
                OptionsMenuComponent,         // Componente
                '200px'                       // Ancho
            );
        }
    }
}
</script>
```

---

## 🎨 Estilos

### Container

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
    pointer-events: none;       /* No bloquea interacción de fondo */
}

.dropdown-menu-container.hidden {
    opacity: 0;
}
```

### Menu Card

```css
.dropdown-menu {
    position: absolute;          /* Posicionado por dropdownStyle */
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    padding: 1rem;
    min-width: 150px;
    max-width: 400px;
    z-index: 889;
    pointer-events: all;        /* Intercepta clicks */
}
```

### Title

```css
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

---

## 🎯 Casos de Uso

### 1. Menú de Opciones

```typescript
// Menú contextual en una fila de tabla
Application.ApplicationUIService.openDropdownMenu(
    event.target,
    'Row Options',
    RowOptionsComponent
);
```

### 2. Filtros

```typescript
// Dropdown de filtros
Application.ApplicationUIService.openDropdownMenu(
    filterButton,
    'Filters',
    FilterFormComponent,
    '300px'
);
```

### 3. Mini Formulario

```typescript
// Formulario rápido en dropdown
Application.ApplicationUIService.openDropdownMenu(
    addButton,
    'Quick Add',
    QuickAddFormComponent,
    '350px'
);
```

---

## ⚠️ Consideraciones

### 1. Z-Index

```css
z-index: 888;  /* Container */
z-index: 889;  /* Menu */
```

**Jerarquía:**
- Contenido normal: z-index < 888
- Dropdown: 888-889
- Modales: 1000+
- Loading popup: 1100
- Confirmation: 1500

### 2. Click Outside

```typescript
// El primer click que abre el dropdown no debe cerrarlo
// Se maneja con event.stopPropagation() en el trigger
```

### 3. markRaw()

```typescript
// ✅ SIEMPRE usar markRaw() con componentes
this.app.dropdownMenu.value.component = markRaw(component);

// ❌ NO hacer
this.app.dropdownMenu.value.component = component;
```

---

## 🔗 Integración con App.vue

### Registro en App.vue

```vue
<template>
    <div id="app">
        <!-- Otros componentes -->
        <DropdownMenu />   <!-- Registrado globalmente -->
    </div>
</template>
```

---

## 🐛 Debugging

### Ver Estado del Dropdown

```javascript
console.log('Dropdown data:', Application.dropdownMenu.value);
```

### Ver Posición Calculada

```javascript
const menu = document.getElementById('dropdown-element-in-general');
console.log('Position:', menu.style.left, menu.style.top);
console.log('Size:', menu.style.maxWidth);
```

### Simular Apertura

```javascript
Application.ApplicationUIService.openDropdownMenu(
    document.querySelector('button'),
    'Test',
    { template: '<div>Test Content</div>' }
);
```

---

## 📚 Resumen

`DropdownMenu` es un **menú desplegable inteligente**:

- ✅ Posicionamiento automático (evita salir de pantalla)
- ✅ Componentes dinámicos como contenido
- ✅ Cierre con ESC o click fuera
- ✅ Control centralizado vía ApplicationUIService
- ✅ Z-index correcto en jerarquía visual
- ✅ Transiciones suaves
- ✅ Fácil de usar desde cualquier componente

Ideal para menús contextuales, filtros, y formularios rápidos.
