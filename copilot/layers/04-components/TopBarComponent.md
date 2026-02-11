# 🎯 TopBarComponent

**Categoría:** Core Components (Layout & Navigation)  
**Archivo:** `src/components/TopBarComponent.vue`

**Referencias:**
- `SideBarComponent.md` - Sidebar que se togglea desde TopBar
- `DropdownMenu.md` - Dropdown menu abierto desde perfil
- `../03-application/application-ui-service.md` - Servicios de UI
- `../03-application/application-views.md` - Sistema de vistas

---

## 📋 Descripción

`TopBarComponent` es la **barra de navegación superior** de la aplicación. Muestra el título y el ícono del módulo actual, provee el botón de toggle para el sidebar, y muestra el menú de perfil de usuario.

---

## 🎯 Utilidad

- **Navegación principal**: Header visible en todas las vistas
- **Control de sidebar**: Toggle del sidebar lateral
- **Información de contexto**: Muestra módulo actual con ícono y título
- **Perfil de usuario**: Acceso rápido al menú de perfil

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

## 🔍 Computed Properties

### `title`

**Tipo:** `string`  
**Descripción:** Obtiene el nombre del módulo actual desde `Application.View.value.entityClass?.getModuleName()`  
**Default:** `'Default'` si no hay módulo activo

```typescript
computed: {
    title() {
        return Application.View.value.entityClass?.getModuleName() ?? 'Default';
    }
}
```

**Fuente:** `src/components/TopBarComponent.vue` (línea ~43-45)

---

### `icon`

**Tipo:** `string`  
**Descripción:** Obtiene el ícono del módulo actual desde `Application.View.value.entityClass?.getModuleIcon()`  
**Default:** `''` si no hay ícono definido

```typescript
computed: {
    icon() {
        return Application.View.value.entityClass?.getModuleIcon() ?? '';
    }
}
```

**Fuente:** `src/components/TopBarComponent.vue` (línea ~46-48)

---

## 🛠️ Methods

### `toggleSidebar()`

**Descripción:** Toggle del sidebar usando `ApplicationUIService`

```typescript
methods: {
    toggleSidebar() {
        Application.ApplicationUIService.toggleSidebar();
    }
}
```

**Fuente:** `src/components/TopBarComponent.vue` (línea ~28-30)

---

### `openDropdown()`

**Descripción:** Abre el dropdown menu de perfil usando `ApplicationUIService`

```typescript
methods: {
    openDropdown() {
        var button: HTMLElement = document.getElementById('dropdown-profile-button')!;
        Application.ApplicationUIService.openDropdownMenu(button, 'Profile', listView);
    }
}
```

**Fuente:** `src/components/TopBarComponent.vue` (línea ~34-37)

---

## 📡 Lifecycle & EventBus

### `mounted()`

Escucha el evento `'toggle-sidebar'` del EventBus de Application para sincronizar el estado del botón toggle.

```typescript
mounted() {
    Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
        this.toggled_bar = state !== undefined ? state : !this.toggled_bar;
    });
}
```

**Fuente:** `src/components/TopBarComponent.vue` (línea ~57-60)

---

### `beforeUnmount()`

Limpia el listener del evento `'toggle-sidebar'`.

```typescript
beforeUnmount() {
    Application.eventBus.off('toggle-sidebar');
}
```

**Fuente:** `src/components/TopBarComponent.vue` (línea ~61-63)

---

## 📊 Data Properties

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `ICONS` | `object` | `import ICONS` | Objeto con constantes de íconos |
| `toggled_profile` | `boolean` | `false` | Estado del dropdown de perfil |
| `toggled_bar` | `boolean` | `true` | Estado del sidebar (abierto/cerrado) |

---

## 🧪 Ejemplos de Uso

### 1. Uso Básico en App.vue

```vue
<template>
  <div class="app-container">
    <TopBarComponent />
    <div class="app-content">
      <SideBarComponent />
      <main class="main-view">
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

.app-content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.main-view {
    flex: 1;
    overflow-y: auto;
}
</style>
```

---

### 2. Interacción con Application.View

Cuando se cambia de vista/módulo, el TopBar se actualiza automáticamente:

```typescript
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';
import Product from '@/entities/products';

// Cambiar a vista de productos
Application.changeView(Product, ViewType.LIST);

// TopBar ahora muestra:
// - title: "Products" (desde @ModuleName('Products'))
// - icon: product_icon (desde @ModuleIcon('product_icon'))
```

---

### 3. Personalizar Módulo con Decoradores

```typescript
import { ModuleName } from '@/decorations/module_name_decorator';
import { ModuleIcon } from '@/decorations/module_icon_decorator';
import { BaseEntity } from '@/entities/base_entitiy';

@ModuleName('Inventory')  // ← TopBar muestra "Inventory"
@ModuleIcon('📦')         // ← TopBar muestra 📦
export class InventoryItem extends BaseEntity {
    // ...
}
```

---

### 4. Toggle Sidebar Programáticamente

```typescript
import { Application } from '@/models/application';

// Cerrar sidebar
Application.ApplicationUIService.toggleSidebar(false);

// Abrir sidebar
Application.ApplicationUIService.toggleSidebar(true);

// Toggle (alternar estado)
Application.ApplicationUIService.toggleSidebar();
```

El evento se propaga al TopBar y actualiza el estado visual del botón.

---

### 5. Escuchar Evento toggle-sidebar en Otro Componente

```vue
<script lang="ts">
import { Application } from '@/models/application';

export default {
    name: 'OtherComponent',
    data() {
        return {
            sidebarOpen: true
        }
    },
    mounted() {
        Application.eventBus.on('toggle-sidebar', (state?: boolean) => {
            this.sidebarOpen = state ?? !this.sidebarOpen;
            console.log('Sidebar is now:', this.sidebarOpen ? 'open' : 'closed');
        });
    },
    beforeUnmount() {
        Application.eventBus.off('toggle-sidebar');
    }
}
</script>
```

---

## 🎨 Estilos Importantes

### Toggle Button States

```css
.topbar .push-side-nav-button,
.topbar .profile_button {
    aspect-ratio: 1 / 1;
    height: 100%;
    border: none;
    border-radius: var(--border-radius-circle);
}

.topbar .push-side-nav-button.toggled img,
.topbar .profile_button.toggled img {
    filter: grayscale(100%) brightness(1.3);
}
```

**Fuente:** `src/components/TopBarComponent.vue` (línea ~81-98)

Cuando el botón tiene clase `.toggled`, el ícono se vuelve gris claro.

---

### Layout Flexbox

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
```

**Fuente:** `src/components/TopBarComponent.vue` (línea ~71-78)

Flexbox con `space-between` para separar los lados izquierdo y derecho.

---

## ⚠️ Consideraciones Importantes

### 1. Dependencia de Application.View

El TopBar depende completamente de `Application.View.value` para mostrar título e ícono. Si `View.value` es `null`, muestra `'Default'`.

```typescript
// Asegurar que View esté inicializado
if (!Application.View.value) {
    console.warn('Application.View is not initialized');
}
```

---

### 2. EventBus Cleanup

**CRÍTICO**: Siempre hacer cleanup de event listeners en `beforeUnmount()` para evitar memory leaks.

```typescript
beforeUnmount() {
    Application.eventBus.off('toggle-sidebar');
}
```

---

### 3. Dropdown Menu Button ID

El método `openDropdown()` depende del ID `'dropdown-profile-button'` en el DOM. No cambiar este ID sin actualizar el método.

```vue
<button 
    @click.stop="openDropdown" 
    id="dropdown-profile-button"  <!-- ← ID crítico -->
    class="profile_button"
>
```

---

### 4. Z-Index para Overlay

TopBar tiene `z-index: 1` para estar encima del contenido pero debajo de modales y dropdowns.

```css
.topbar {
    position: relative;
    z-index: 1;  /* Debajo de modals (z-index: 1000) pero encima de content */
}
```

---

### 5. Responsive Design

Considerar breakpoints para móvil:

```css
@media (max-width: 768px) {
    .topbar span {
        display: none;  /* Ocultar texto en móvil */
    }
    
    .topbar .icon {
        width: 40px;  /* Reducir tamaño de íconos */
    }
}
```

---

## 🔗 Referencias Adicionales

- `SideBarComponent.md` - Componente del sidebar lateral
- `DropdownMenu.md` - Componente de dropdown menu
- `../03-application/application-ui-service.md` - Servicios de UI
- `../03-application/application-views.md` - Sistema de vistas
- `../01-decorators/module-name-decorator.md` - @ModuleName()
- `../01-decorators/module-icon-decorator.md` - @ModuleIcon()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/components/TopBarComponent.vue`  
**Líneas:** 129
