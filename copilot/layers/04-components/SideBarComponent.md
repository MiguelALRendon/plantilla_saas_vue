# 🎯 SideBarComponent

**Categoría:** Core Components (Layout & Navigation)  
**Archivo:** `src/components/SideBarComponent.vue`

**Referencias:**
- `TopBarComponent.md` - TopBar que controla toggle del sidebar
- `SideBarItemComponent.md` - Item individual de módulo en sidebar
- `../03-application/application-ui-service.md` - Servicios de UI
- `../03-application/application.md` - Application.ModuleList

---

## 📋 Descripción

`SideBarComponent` es la **barra lateral de navegación** que muestra todos los módulos registrados en la aplicación. Se expande y contrae con animación, mostrando/ocultando los nombres de los módulos.

---

## 🎯 Utilidad

- **Navegación entre módulos**: Lista todos los módulos disponibles
- **UI colapsable**: Expande/colapsa para maximizar espacio de contenido
- **Integración con Application**: Render automático de módulos registrados
- **Persistente**: Siempre visible (excepto cuando está colapsado)

---

## 📦 Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| *(Ninguna)* | - | - | - | Este componente no recibe props |

---

## 📤 Events

| Evento | Payload | Descripción |
|--------|---------|-------------|
| *(Ninguno)* | - | Este componente no emite eventos propios |

---

## 🎰 Slots

| Slot | Descripción |
|------|-------------|
| *(Ninguno)* | Este componente no tiene slots |

---

## 📊 Data Properties

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `Application` | `object` | `import Application` | Instancia de Application |
| `toggled` | `boolean` | `true` | Estado del sidebar (expandido/colapsado) |

---

## 📡 Lifecycle & EventBus

### `mounted()`

Escucha el evento `'toggle-sidebar'` del EventBus para sincronizar el estado de expansión/colapso.

```typescript
mounted() {
    Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
        this.toggled = state !== undefined ? state : !this.toggled;
    });
}
```

**Fuente:** `src/components/SideBarComponent.vue` (línea ~35-38)

---

### `beforeUnmount()`

Limpia el listener del evento.

```typescript
beforeUnmount() {
    Application.eventBus.off('toggle-sidebar');
}
```

**Fuente:** `src/components/SideBarComponent.vue` (línea ~39-41)

---

## 🏗️ Estructura del Template

```vue
<template>
    <div :class="['sidebar', { toggled }]">
        <div class="header">
            Header
        </div>

        <div class="body">
            <SideBarItemComponent 
                v-for="module in Application.ModuleList.values()" 
                :module="module"
            />
        </div>

        <div class="footer">
            footer
        </div>
    </div>
</template>
```

**Fuente:** `src/components/SideBarComponent.vue` (línea ~1-18)

### Secciones:

1. **Header**: Espacio para logo o título (actualmente placeholder)
2. **Body**: Lista de `SideBarItemComponent` por cada módulo en `Application.ModuleList`
3. **Footer**: Espacio para acciones o info adicional (actualmente placeholder)

---

## 🧪 Ejemplos de Uso

### 1. Uso Básico en App.vue

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

---

### 2. Registrar Módulos en Application

Los módulos mostrados en el sidebar deben estar registrados en `Application.ModuleList`:

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

El sidebar itera sobre `Application.ModuleList.values()` y renderiza un `SideBarItemComponent` por cada módulo.

---

### 3. Control de Toggle desde TopBar

```vue
<!-- TopBarComponent.vue -->
<template>
    <button @click="toggleSidebar">
        Toggle Sidebar
    </button>
</template>

<script lang="ts">
import { Application } from '@/models/application';

export default {
    methods: {
        toggleSidebar() {
            Application.ApplicationUIService.toggleSidebar();
        }
    }
}
</script>
```

Esto emite el evento `'toggle-sidebar'` que el `SideBarComponent` escucha y actualiza `this.toggled`.

---

### 4. Control Programático del Estado

```typescript
import { Application } from '@/models/application';

// Colapsar sidebar
Application.ApplicationUIService.toggleSidebar(false);

// Expandir sidebar
Application.ApplicationUIService.toggleSidebar(true);

// Toggle (alternar)
Application.ApplicationUIService.toggleSidebar();
```

---

### 5. Sidebar Item con Click Handler

Cada item del sidebar usa `SideBarItemComponent` que maneja el click para cambiar de módulo:

```vue
<!-- SideBarItemComponent.vue -->
<template>
    <div class="sidebar-item" @click="navigateToModule">
        <img :src="module.getModuleIcon()" alt="" />
        <span>{{ module.getModuleName() }}</span>
    </div>
</template>

<script lang="ts">
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';

export default {
    props: {
        module: {
            type: Function,  // EntityClass
            required: true
        }
    },
    methods: {
        navigateToModule() {
            Application.changeView(this.module, ViewType.LIST);
        }
    }
}
</script>
```

---

## 🎨 Estilos Importantes

### Animación de Expansión

```css
.sidebar {
    display: flex;
    flex-direction: column;
    max-width: 68px;  /* Colapsado */
    width: 100%;
    transition: 0.5s ease;
    overflow: hidden;
}

.sidebar.toggled {
    max-width: 250px;  /* Expandido */
}
```

**Fuente:** `src/components/SideBarComponent.vue` (línea ~45-56)

Transición suave de 0.5s entre los estados.

---

### Fade de Texto

```css
.sidebar span {
    opacity: 0;  /* Oculto cuando colapsado */
    font-weight: 500;
    transition: opacity 0.3s ease 0.2s;  /* Delay para sincronizar con expansión */
}

.sidebar.toggled span {
    opacity: 1;  /* Visible cuando expandido */
}
```

**Fuente:** `src/components/SideBarComponent.vue` (línea ~57-62)

El texto aparece con delay de 0.2s después de que el sidebar se expande.

---

### Header Responsive

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

**Fuente:** `src/components/SideBarComponent.vue` (línea ~64-76)

El header solo es visible cuando el sidebar está expandido.

---

### Body Scrollable

```css
.sidebar .body {
    flex-grow: 1;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    overflow-x: hidden;
}
```

**Fuente:** `src/components/SideBarComponent.vue` (línea ~78-83)

El body tiene scroll vertical si hay muchos módulos.

---

## ⚠️ Consideraciones Importantes

### 1. Módulos Dinámicos

El sidebar renderiza automáticamente todos los módulos en `Application.ModuleList`. Para agregar un nuevo módulo:

```typescript
// 1. Crear entidad
@ModuleName('Inventory')
@ModuleIcon('📦')
export class Inventory extends BaseEntity {
    // ...
}

// 2. Registrar en Application.ModuleList
Application.ModuleList.set('inventory', Inventory);

// 3. Sidebar lo muestra automáticamente
```

---

### 2. EventBus Memory Leaks

**CRÍTICO**: Siempre limpiar event listeners en `beforeUnmount()`:

```typescript
beforeUnmount() {
    Application.eventBus.off('toggle-sidebar');
}
```

---

### 3. Z-Index Layering

```css
.sidebar {
    position: relative;
    z-index: 100;  /* Encima de content (z-index: 1) pero debajo de modals (z-index: 1000) */
    background-color: var(--white);
}
```

El sidebar debe estar encima del contenido pero debajo de modales y dropdowns.

---

### 4. Responsive Design

Para pantallas pequeñas, considerar un sidebar colapsable por defecto o un drawer modal:

```css
@media (max-width: 768px) {
    .sidebar {
        position: absolute;
        left: -250px;  /* Fuera de pantalla */
        transition: left 0.3s ease;
    }
    
    .sidebar.toggled {
        left: 0;  /* Slide in */
    }
}
```

---

### 5. Header y Footer Customization

Actualmente el header y footer son placeholders. Para customizarlos:

```vue
<template>
    <div :class="['sidebar', { toggled }]">
        <div class="header">
            <img src="@/assets/logo.png" alt="Logo" class="logo" />
            <h2>My App</h2>
        </div>

        <div class="body">
            <SideBarItemComponent 
                v-for="module in Application.ModuleList.values()" 
                :module="module"
            />
        </div>

        <div class="footer">
            <button @click="logout" class="logout-button">
                Logout
            </button>
        </div>
    </div>
</template>
```

---

## 🔗 Referencias Adicionales

- `TopBarComponent.md` - Controla toggle del sidebar
- `SideBarItemComponent.md` - Item individual de módulo
- `../03-application/application-ui-service.md` - toggleSidebar()
- `../03-application/application.md` - ModuleList
- `../01-decorators/module-name-decorator.md` - @ModuleName()
- `../01-decorators/module-icon-decorator.md` - @ModuleIcon()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/components/SideBarComponent.vue`  
**Líneas:** 107
