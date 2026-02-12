# TabComponent & TabControllerComponent

## 1. Propósito

Sistema de componentes Vue que implementa navegación por tabs (pestañas) para organizar contenido en grupos temáticos dentro de vistas de detalle. TabComponent proporciona el contenedor para contenido de pestaña individual mientras TabControllerComponent gestiona estado activo, navegación entre tabs y renderizado de headers clicables. Principal aplicación: mostrar arrays de entidades relacionadas en formularios de detalle mediante integración con ArrayInputComponent, permitiendo separación visual de múltiples listas asociadas a una entidad padre.

## 2. Alcance

Este documento cubre ambos componentes del sistema de tabs: TabComponent (src/components/TabComponent.vue) y TabControllerComponent (src/components/TabControllerComponent.vue). Incluye estructura de props, template structure, manejo de estado activo mediante índices, sistema de renderizado de headers dinámicos, integración con slots de Vue, hooks de ciclo de vida (mounted), algoritmo de activación/desactivación de tabs, estilos CSS para estados (active/inactive), y uso conjunto con BaseEntity.getArrayKeysOrdered() para generación automática de tabs desde metadata de decoradores. No cubre implementación interna de ArrayInputComponent ni lógica de gestión de arrays en BaseEntity.

## 3. Definiciones Clave

**TabComponent**: Componente contenedor simple que envuelve contenido de una pestaña individual, controlando visibilidad mediante clase CSS .active.

**TabControllerComponent**: Componente controlador que gestiona múltiples TabComponents hijos, renderiza headers clicables y mantiene índice de tab actualmente seleccionado.

**selectedTab**: Data property en TabControllerComponent que almacena índice (number) del tab actualmente visible, iniciando en 0 para primer tab.

**tabElements**: NodeListOf<Element> que almacena referencias DOM a todos los TabComponent montados, utilizada para manipulación directa de clases CSS.

**Tabs Prop**: Array<string> que define nombres para headers de tabs, debe coincidir en longitud y orden con número de TabComponents hijos.

---

## 📦 TabComponent

### Estructura

```vue
<template>
<div class="tab-component">
    <slot></slot>
</div>
</template>
```

**Contenedor simple** que envuelve el contenido de una pestaña.

### Estilos

```css
.tab-component {
    width: 100%;
    height: 100%;
    padding: .5rem;
    border-radius: 0 0 1rem 1rem;
    border: 2px solid var(--sky);
    border-top: none;              /* Sin borde superior (conecta con tab header) */
    box-sizing: border-box;
    background-color: var(--bg-gray);
    display: none;                 /* Oculto por defecto */
}

.tab-component.active {
    display: block;                /* Visible cuando activo */
    overflow: hidden;
}
```

---

## 🎛️ TabControllerComponent

### Props

```typescript
{
    tabs: Array<string>  // Array de nombres de tabs
}
```

### Estructura

```vue
<template>
  <div class="tab-container">
    <!-- Headers de tabs -->
    <div class="tab-container-row">
      <div 
        class="tab" 
        v-for="(tab, index) in tabs" 
        :class="[{active: index == selectedTab}]"
        @click="setActiveTab(index)">
        <span>{{ tab }}</span> 
      </div>
    </div>
    
    <!-- Contenido de tabs -->
    <slot></slot>
  </div>
</template>
```

### Data

```typescript
{
    selectedTab: number              // Índice del tab activo
    tabElements: NodeListOf<Element> | null  // Referencias a elementos TabComponent
}
```

---

## ⚙️ Funcionamiento

### setActiveTab(index)

```typescript
methods: {
    setActiveTab(index: number) {
        // Actualizar índice seleccionado
        this.selectedTab = index;
        
        // Actualizar clases CSS de los tabs
        this.tabElements?.forEach((el, i) => {
            el.classList.remove('active');
            if (i === index) {
                el.classList.add('active');
            }
        });
    }
}
```

**Flujo:**
1. Usuario hace click en un tab header
2. `setActiveTab(index)` se ejecuta
3. Se actualiza `selectedTab`
4. Se remueve clase `.active` de todos los TabComponent
5. Se agrega clase `.active` al TabComponent correspondiente
6. CSS muestra/oculta tabs según clase

---

## 📝 Ejemplo de Uso

### En default_detailview.vue

```vue
<FormGroupComponent title="Listas">
    <TabControllerComponent :tabs="getArrayListsTabs()">
        <TabComponent v-for="(tab) in entity.getArrayKeysOrdered()">
            <ArrayInputComponent 
                :entity="entity"
                :property-key="tab"
                v-model="entity[tab]" 
                :type-value="entityClass.getArrayPropertyType(tab)"
            />
        </TabComponent>
    </TabControllerComponent>
</FormGroupComponent>
```

**Resultado Visual:**
```
┌─────────────────────────────────────┐
│ Listas                              │
├─────────────────────────────────────┤
│ [Items] [Comments] [Attachments]   │ ← Tab headers
├─────────────────────────────────────┤
│                                     │
│ [+ New Item]                        │ ← Tab content (active)
│ ┌─────────────────────────────────┐│
│ │ Item 1 - $100                   ││
│ │ Item 2 - $50                    ││
│ │ Item 3 - $75                    ││
│ └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Estilos del Controller

### Tab Container

```css
.tab-container {
    width: 100%;
    display: flex;
    flex-direction: column;
}
```

### Tab Headers Row

```css
.tab-container-row {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    width: 100%;
}
```

### Individual Tab Header

```css
.tab {
    padding: 0.75rem 1.5rem;
    background-color: var(--white);
    border: 2px solid var(--sky);
    border-bottom: none;
    border-radius: 1rem 1rem 0 0;
    cursor: pointer;
    transition: 0.3s ease;
}

.tab:hover {
    background-color: var(--gray-lightest);
}

.tab.active {
    background-color: var(--bg-gray);
    font-weight: 600;
    color: var(--primary);
}
```

---

## 🔄 Ciclo de Vida

### Setup (Composition API)

```typescript
setup() {
    const slots = useSlots()

    const isValid = computed(() => {
        const nodes = slots.default?.()
        
        if (!nodes) return false
        
        // Validar que todos los hijos sean TabComponent
        return nodes.every(node => 
            node.type && 
            (node.type as any).name === 'TabComponent'
        )
    })

    if (!isValid.value) {
        console.warn('[TabController] All children must be TabComponent')
    }

    return { isValid }
}
```

**Validación:** Solo acepta `TabComponent` como hijos directos.

### Mounted

```typescript
mounted() {
    // Obtener referencias a todos los TabComponent
    this.tabElements = this.$el.querySelectorAll('.tab-component');
    
    // Activar el primer tab por defecto
    this.setActiveTab(0);
}
```

---

## 🎯 Integración con BaseEntity

### getArrayKeysOrdered()

```typescript
// En BaseEntity
public getArrayKeysOrdered(): string[] {
    const arrayKeys = this.getArrayKeys();
    const propertyIndices = this.getPropertyIndices();
    
    return arrayKeys.sort((a, b) => {
        const indexA = propertyIndices[a] ?? Number.MAX_SAFE_INTEGER;
        const indexB = propertyIndices[b] ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
    });
}
```

**Efecto:** Tabs se ordenan según `@PropertyIndex()` decorador.

---

## 📊 Ejemplo Completo

### Definición de Entidad

```typescript
@ModuleName('Orders')
export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Customer', String)
    customer!: string;
    
    @PropertyIndex(10)
    @PropertyName('Items', Array)
    @ArrayOf(OrderItem)
    items!: OrderItem[];
    
    @PropertyIndex(11)
    @PropertyName('Comments', Array)
    @ArrayOf(Comment)
    comments!: Comment[];
}
```

### Renderizado Automático

```vue
<!-- En default_detailview.vue -->
<TabControllerComponent :tabs="['Items', 'Comments']">
    <TabComponent>
        <!-- Contenido de Items -->
        <ArrayInputComponent :entity="order" property-key="items" ... />
    </TabComponent>
    <TabComponent>
        <!-- Contenido de Comments -->
        <ArrayInputComponent :entity="order" property-key="comments" ... />
    </TabComponent>
</TabControllerComponent>
```

---

## 💡 Características Avanzadas

### Tab Dinámico

```vue
<TabControllerComponent :tabs="dynamicTabs">
    <TabComponent v-for="tab in dynamicTabs" :key="tab">
        <!-- Contenido dinámico -->
    </TabComponent>
</TabControllerComponent>

<script>
computed: {
    dynamicTabs() {
        // Tabs condicionales
        const tabs = ['General'];
        if (this.entity.hasItems) tabs.push('Items');
        if (this.entity.hasComments) tabs.push('Comments');
        return tabs;
    }
}
</script>
```

---

## ⚠️ Consideraciones

### 1. Número de Tabs vs TabComponents

```typescript
// ❌ INCORRECTO: Número diferente
<TabControllerComponent :tabs="['Tab1', 'Tab2']">
    <TabComponent>Content 1</TabComponent>
    <!-- Falta Tab 2 -->
</TabControllerComponent>

// ✅ CORRECTO: Mismo número
<TabControllerComponent :tabs="['Tab1', 'Tab2']">
    <TabComponent>Content 1</TabComponent>
    <TabComponent>Content 2</TabComponent>
</TabControllerComponent>
```

### 2. Orden de Tabs

El orden de `tabs` prop debe coincidir con el orden de `TabComponent` hijos:
- `tabs[0]` → Primer `TabComponent`
- `tabs[1]` → Segundo `TabComponent`, etc.

### 3. Contenido Activo

Solo un `TabComponent` tiene clase `.active` a la vez → Solo uno visible.

---

## 🔗 Componentes Relacionados

- **ArrayInputComponent** - Contenido típico de tabs
- **FormGroupComponent** - Contenedor padre común
- **default_detailview.vue** - Vista que utiliza tabs

---

## 🎨 Personalización

### Estilos Custom de Tabs

```css
/* Tab headers con iconos */
.tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tab-icon {
    width: 20px;
    height: 20px;
}

/* Tab activo con borde inferior */
.tab.active {
    border-bottom: 3px solid var(--primary);
}
```

### Tab con Badge

```vue
<div class="tab" @click="setActiveTab(index)">
    <span>{{ tab }}</span>
    <span class="badge" v-if="hasNotifications(index)">5</span>
</div>

<style>
.badge {
    background: red;
    color: white;
    border-radius: 50%;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
}
</style>
```

---

## 🐛 Debugging

### Ver Tab Activo

```javascript
// En Vue DevTools
selectedTab: 0  // Índice del tab activo
```

### Ver TabComponents

```javascript
const tabs = document.querySelectorAll('.tab-component');
tabs.forEach((tab, i) => {
    console.log(`Tab ${i}: ${tab.classList.contains('active') ? 'Active' : 'Inactive'}`);
});
```

---

## 📚 Resumen

Sistema de **tabs para organizar contenido**:

**TabComponent:**
- ✅ Contenedor simple para contenido de tab
- ✅ Visible solo cuando tiene clase `.active`
- ✅ Estilos conectados con tab header

**TabControllerComponent:**
- ✅ Gestor de múltiples tabs
- ✅ Headers clicables
- ✅ Cambia tab activo dinámicamente
- ✅ Validación de hijos (solo TabComponent)
- ✅ Primer tab activo por defecto

**Uso Principal:** Arrays de relaciones en vistas de detalle.
