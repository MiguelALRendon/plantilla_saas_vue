# 🧩 SideBarItemComponent

**Referencias:**
- `SideBarComponent.md` - Componente Sidebar principal
- `../03-application/application-singleton.md` - Application
- `../02-base-entity/base-entity-core.md` - BaseEntity

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/SideBarItemComponent.vue`

---

## 🎯 Propósito

`SideBarItemComponent` representa un **item individual de módulo** en el sidebar de navegación. Cada item corresponde a una entidad registrada en `Application.ModuleList`.

**Responsabilidades:**
- 🎨 Renderizar icono y nombre del módulo
- 🔄 Detectar si está activo (módulo actual)
- 🖱️ Manejar click para navegar al módulo
- ✨ Aplicar estilos de estado activo/inactivo

---

## 🏗️ Estructura

### Props

```typescript
{
    module: typeof BaseEntity  // Clase de entidad (ej: Products, Customer)
}
```

### Template

```vue
<div :class="'side-bar-item ' + (isActive ? ' active' : '')" 
     @click="setNewView">
    <div class="icon">
        <img :src="module.getModuleIcon()" alt="">
    </div>
    <span class="module-title">{{ module.getModuleName() }}</span>
</div>
```

---

## ⚙️ Funcionamiento

### Computed Property: isActive

```typescript
computed: {
    isActive(): boolean {
        return Application.View.value.entityClass?.getModuleName() === 
               (this.module && this.module.getModuleName());
    }
}
```

**Lógica:**
1. Obtiene el módulo actualmente en `Application.View.value.entityClass`
2. Compara su nombre con el nombre del módulo de este item
3. Retorna `true` si coinciden

**Resultado:**
- Item activo → Clase CSS `.active`
- Item inactivo → Sin clase `.active`

---

## 🖱️ Interacción

### setNewView()

```typescript
methods: {
    setNewView() {
        Application.changeViewToDefaultView(this.module as typeof BaseEntity);
    }
}
```

**Flujo:**
```
1. Usuario hace click en el item
        ↓
2. setNewView() se ejecuta
        ↓
3. Llama a Application.changeViewToDefaultView(module)
        ↓
4. Application cambia la vista al módulo
        ↓
5. isActive se actualiza automáticamente (computed)
        ↓
6. CSS cambia para reflejar estado activo
```

---

## 🎨 Estilos

### Base

```css
.side-bar-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: 0.4s ease;
    cursor: pointer;
}
```

### Hover

```css
.side-bar-item:hover {
    background-color: var(--gray-lightest);
}
```

### Estado Activo

```css
.side-bar-item.active {
    background: var(--grad-red-warm);  /* Gradiente rojo cálido */
    box-sizing: border-box;
    color: white;
    border-radius: 0;
}
```

### Icono

```css
.side-bar-item .icon {
    width: var(--sidebar-min-width);   /* ej: 60px */
    height: var(--sidebar-min-width);
}

.side-bar-item .icon img {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
    filter: drop-shadow(var(--shadow-white));
}
```

### Título Activo

```css
.active .module-title {
    font-weight: 600;
    color: var(--white);
    font-size: 1.1rem;
}
```

---

## 📊 Integración con BaseEntity Metadata

### Obtención de Datos del Módulo

El componente obtiene información directamente de los decoradores de la entidad:

```typescript
// Icono del módulo
module.getModuleIcon()
// → Retorna lo definido en @ModuleIcon(ICONS.PRODUCTS)

// Nombre del módulo
module.getModuleName()
// → Retorna lo definido en @ModuleName('Products')
```

**Ejemplo:**
```typescript
@ModuleName('Products')
@ModuleIcon(ICONS.PRODUCTS)
export class Products extends BaseEntity {
    // ...
}

// En el sidebar item:
// Icono: ICONS.PRODUCTS (ej: '/assets/icons/products.png')
// Título: "Products"
```

---

## 📝 Ejemplo de Uso

### En SideBarComponent

```vue
<SideBarItemComponent
    v-for="module in Application.ModuleList.value"
    :key="module.name"
    :module="module"
/>
```

**Resultado:**
```
┌─────────────────────────┐
│ [🛒] Products          │  ← SideBarItemComponent (active)
│ [👤] Customers          │  ← SideBarItemComponent
│ [📦] Inventory          │  ← SideBarItemComponent
│ [🏪] Stores             │  ← SideBarItemComponent
└─────────────────────────┘
```

---

## 🔄 Reactividad

### Actualización Automática del Estado Activo

```typescript
// Cuando el usuario navega:
Application.changeViewToDefaultView(Customer);

// 1. Application.View.value.entityClass cambia a Customer
// 2. Todos los SideBarItemComponent re-evalúan isActive
// 3. El item de Customer se vuelve activo
// 4. El item anterior pierde el estado activo
```

**Ventaja:** No necesita gestión manual de estado, Vue lo maneja automáticamente.

---

## 🎯 Navegación

### Flujo Completo

```
┌──────────────────────────────────────┐
│ Usuario ve sidebar                   │
├──────────────────────────────────────┤
│ [🛒] Products (activo)              │
│ [👤] Customers                       │
│ [📦] Inventory                       │
└──────────────────────────────────────┘
                ↓ Click en Customers
┌──────────────────────────────────────┐
│ SideBarItemComponent.setNewView()    │
├──────────────────────────────────────┤
│ Application.changeViewToDefaultView(│
│     Customer                         │
│ )                                    │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│ Application.View actualizado         │
├──────────────────────────────────────┤
│ entityClass: Customer                │
│ component: DefaultListView           │
│ viewType: DEFAULTVIEW                │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│ Router actualiza URL                 │
├──────────────────────────────────────┤
│ De: /products                        │
│ A:  /customers                       │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│ UI actualizada                       │
├──────────────────────────────────────┤
│ [🛒] Products                        │
│ [👤] Customers (activo)             │
│ [📦] Inventory                       │
└──────────────────────────────────────┘
```

---

## 💡 Características Especiales

### 1. Drop Shadow en Iconos

```css
.side-bar-item.active .icon img, .icon img {
    filter: drop-shadow(var(--shadow-white));
}
```

**Efecto:** Sombra blanca que hace que los iconos resalten sobre el fondo.

### 2. Gradiente en Estado Activo

```css
.side-bar-item.active {
    background: var(--grad-red-warm);
}
```

**Visual:** Gradiente suave en lugar de color plano, mejor UX.

### 3. Transición Suave

```css
transition: 0.4s ease;
```

**Efecto:** Cambios de estado (hover, active) con animación suave.

---

## ⚠️ Consideraciones

### 1. Prop Validation

```typescript
props: {
    module: {
        type: Function as unknown as PropType<typeof BaseEntity>,
        required: true
    }
}
```

**Importante:** TypeScript requiere `as unknown as PropType<>` para clases.

### 2. Reactivity en isActive

```typescript
computed: {
    isActive(): boolean {
        // Se re-evalúa automáticamente si:
        // - Application.View.value.entityClass cambia
        // - this.module cambia
        return Application.View.value.entityClass?.getModuleName() === 
               this.module.getModuleName();
    }
}
```

### 3. Iconos

Los iconos deben estar en `src/assets/icons/` o ser URLs absolutas.

---

## 🔗 Componentes Relacionados

- **SideBarComponent** - Contiene múltiples SideBarItemComponent
- **Application.ModuleList** - Array de módulos a renderizar
- **Application.View** - Estado de vista actual (para isActive)

---

## 🎨 Personalización

### Cambiar Estilos del Item Activo

```css
/* En tu archivo CSS personalizado */
.side-bar-item.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-left: 4px solid var(--accent);
}
```

### Agregar Badge de Notificación

```vue
<div class="side-bar-item" @click="setNewView">
    <div class="icon">
        <img :src="module.getModuleIcon()" alt="">
        <span class="badge" v-if="hasNotifications">3</span>
    </div>
    <span class="module-title">{{ module.getModuleName() }}</span>
</div>

<style>
.badge {
    position: absolute;
    top: 0;
    right: 0;
    background: red;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 0.75rem;
}
</style>
```

---

## 🐛 Debugging

### Ver Props

```javascript
// En Vue DevTools, seleccionar SideBarItemComponent
props: {
    module: Products  // Ver clase de entidad
}
```

### Ver Estado Activo

```javascript
// En computed properties
isActive: true  // or false
```

### Simular Click

```javascript
const item = document.querySelector('.side-bar-item');
item.click();
```

---

## 📚 Resumen

`SideBarItemComponent` es un **item de navegación individual**:

- ✅ Representa un módulo en el sidebar
- ✅ Detecta automáticamente si está activo
- ✅ Navega al módulo al hacer click
- ✅ Obtiene icono y nombre de decoradores
- ✅ Estilos dinámicos según estado
- ✅ Integración reactiva con Application.View

Simple pero esencial para la navegación del framework.
