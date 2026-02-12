# ModuleListComponent Decorator

## 1. Propósito

El decorador `@ModuleListComponent` define el componente Vue personalizado que renderiza la vista de lista el módulo (ListView / tabla), permitiendo reemplazar completamente el componente default_listview.vue del framework con una implementación custom que se ajuste a las necesidades específicas de visualización del módulo. Este decorador proporciona control total sobre cómo se presenta el conjunto de registros de una entidad, habilitando layouts alternativos más allá del table format estándar cuando la representación tabular no es óptima para el caso de uso específico.

El propósito central es habilitar experiencias de usuario especializadas para visualización de múltiples registros mediante card grids, kanban boards, calendar views, map visualizations, timeline displays, o cualquier layout custom que mejor represente la naturaleza de los datos del dominio. El decorador almacena una referencia al Vue component en metadata de la entity class usando MODULE_LIST_COMPONENT_KEY Symbol, que el Router consulta durante rendering para determinar si existe una ListView personalizada o debe usar default_listview.vue fallback component.

Los casos de uso principales incluyen: catalogues e e-commerce donde products se visualizan mejor en card grid con imágenes prominentes prices y quick actions en lugar de text-dense tabular format con columns estrechos; project management boards donde tasks/issues organizadas en kanban columns por status (Todo/InProgress/Done) proporcionan workflow visibility superior a flat sorted table list; event scheduling calendars donde appointments/meetings/reservations visualizadas en calendar grid con date-based positioning facilitan temporal planning pattern recognition; location-based data warehouses/stores/branches renderizadas en interactive map view con geographic markers clustering properties en lugar de address text list; audit logs activity feeds donde chronological timeline display con visual markers temporal grouping proporciona better narrative flow comprensión temporal relaciones entre events.

Beneficios operacionales: customization completa ListView layout específica needs dominio, user experience optimizada visual representation matches mental models usuarios, reduced cognitive load appropriate layouts minimizean effort comprender datos, improved navigation patterns domain-appropriate interactions (drag-drop kanban, map zoom addressing, calendar date selection) más intuitivas que generic table sorting filtering, reusability component once created reusable across múltiples contexts different entities similar visualization needs. Este decorador complementa ModuleDetailComponent (individual record form) proporcionando control equivalente sobre multiple records display ListView completando control total presentación módulo entire CRUD cycle list creation edit delete flows customizable.

## 2. Alcance

### Responsabilidades

- Definir Vue component custom que reemplaza default_listview.vue para rendering ListView del módulo, proporcionando complete layout markup template script style
- Almacenar component reference en entity class metadata usando MODULE_LIST_COMPONENT_KEY Symbol para lookup O(1) durante router view resolution rendering
- Proporcionar accessor method getModuleListComponent() estático en BaseEntity que retorna component custom o undefined cuando no configurado permitiendo router fallback a default
- Integrarse con Router view resolution mediante computed property currentListViewComponent que consulta entityClass.getModuleListComponent() retornando custom component o DefaultListView fallback seamlessly
- Soportar alternative layouts card grids, kanban boards, calendar views, map displays, timeline feeds, dashboard widgets cualquier Vue component válido acceptable
- Permitir complete control ListView behavior data loading entity iteration actions CRUD operations custom navigation patterns interaction models without limitation
- Habilitar module-specific UI logic filtering sorting pagination search actions custom al dominio que no son generic aplicables todos modules diferentes needs

### Límites

- No reemplaza ModuleDetailComponent decorator; ese controla individual entity form editing DetailView context, ModuleListComponent solo controla ListView múltiples registros list display
- No afecta property-level rendering de inputs; ModuleCustomComponents y ModuleDefaultComponent controlan individual property inputs dentro forms, ListView solo display múltiples entities no individual property editing inline (aunque component custom puede implementar inline editing manualmente si desired)
- No proporciona data loading automático; component custom responsable llamar EntityClass.getElementList() u otro method cargar datos desde API backend explícitamente
- No maneja routing automáticamente; component custom debe usar Application.changeView() manualmente para navigate a DetailView cuando user clicks entity item edit create actions
- No proporciona pagination sorting filtering UI automático; default_listview.vue tiene esos features built-in pero component custom debe implementarlos manualmente si necesarios usando libraries (vue-table, ag-grid) o custom code
- No valida que component proporcionado es Vue component válido; developer responsable asegurar component importado correctamente registered en Vue ecosystem sin runtime errors
- No sincroniza con sidebar navigation; SideBarComponent mantiene entities list rendering independiente, ListView component no afecta sidebar items ModuleName ModuleIcon separate concern decorators

## 3. Definiciones Clave

### MODULE_LIST_COMPONENT_KEY

Symbol único que identifica metadata del module list component almacenada en entity class (no prototype unlike otros decorators). Implementación: `export const MODULE_LIST_COMPONENT_KEY = Symbol('module_list_component')`. Storage: `Product[MODULE_LIST_COMPONENT_KEY] = ProductCardListView`. Este Symbol proporciona collision-free key para metadata storage evitando conflicts con properties o métodos reales entity class protegiendo namespace integrity. Class-level storage (no prototype) porque component definition única per entity type no compartida entre instances.

### getModuleListComponent()

Accessor estático definido en BaseEntity que retorna Vue component custom ListView o undefined si no configurado. Implementación: `public static getModuleListComponent(): Component | undefined { return (this as any)[MODULE_LIST_COMPONENT_KEY]; }`. Ubicación: src/entities/base_entitiy.ts líneas ~260-280. Retorno undefined (no fallback default) permite Router layer decidir fallback a DefaultListView externally separation concerns accessor solo retrieves metadata no decide defaults. Usage: `Product.getModuleListComponent() // → ProductCardListView` retorna component reference para Router rendering.

### Router currentListViewComponent

Computed property en Router view layer que resuelve qué component renderizar para ListView context: custom component si getModuleListComponent() returns component, DefaultListView fallback si undefined. Implementación: `const currentListViewComponent = computed(() => { const entityClass = Application.View.value?.entityClass; if (!entityClass) return DefaultListView; const customListView = entityClass.getModuleListComponent(); return customListView || DefaultListView; })`. Pattern similar a currentDetailViewComponent pero independiente resolution cada view type tiene own custom component potential separation concerns ListView DetailView independently customizable or using defaults.

### DefaultListView Fallback

Default Vue component proporcionado framework ubicado src/views/default_listview.vue que renderiza generic table layout con columns autogeneradas desde entity properties, sorting filtering pagination built-in features standard CRUD actions. Usado cuando entity class NO tiene @ModuleListComponent decorator configurado. Default adequate para simple entities con properties straightforward tabular representation pero limited customization capabilities generic approach one-size-fits-all no optimized specific domains. Custom component reemplaza DefaultListView completamente no extends override specific parts complete replacement pattern.

### Alternative Layout Patterns

Categoría patterns visualización comunes para ListView custom components: Card Grid (products/images visual catalogs), Kanban Board (tasks/orders status-based workflow columns drag-drop), Calendar View (events/appointments date-based temporal positioning), Map View (locations/branches geographic visualization markers clustering), Timeline View (audit logs/activities chronological narrative feed), Dashboard Widgets (analytics/reports metrics cards charts visualizations). Cada pattern resuelve specific visualization challenge diferent entity domain characteristics. Developer selecciona pattern matching mental model usuarios typical interactions con entity type.

### Entity List Loading Pattern

Pattern común component custom debe implementar para cargar entities desde backend. Implementación típica: `const entities = ref<EntityClass[]>([]); async function loadEntities() { entities.value = await EntityClass.getElementList(); } onMounted(() => { loadEntities(); })`. Component responsable llamar API methods manage loading states errors empty states no automatic framework intervention explícito control loading UX. Refresh pattern después de delete/create actions re-calling loadEntities() update displaywith latest data.

### Navigation Pattern to DetailView

Pattern común component custom implementa para allow user navigate desde ListView a DetailView editing or creating entities. Implementación típica: `function editEntity(entity: EntityClass) { Application.changeView(EntityClass, ViewType.DETAIL, entity); } function createEntity() { Application.changeView(EntityClass, ViewType.DETAIL, new EntityClass()); }`. Application.changeView() method central navigation coordinating router state updates view transitions passing entity instance context. ViewType.LIST vs ViewType.DETAIL enum distingue cuál view rendering. Pattern mandatory proveer user form edit/create entities since ListView solo displays not editor.

## 4. Descripción Técnica

### Implementación del Decorador

```typescript
// src/decorations/module_list_component_decorator.ts

import type { Component } from 'vue';

/**
 * Symbol para almacenar metadata de module list component
 */
export const MODULE_LIST_COMPONENT_KEY = Symbol('module_list_component');

/**
 * @ModuleListComponent() - Define componente Vue para ListView
 * 
 * @param component - Componente Vue custom ListView
 * @returns ClassDecorator
 */
export function ModuleListComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_LIST_COMPONENT_KEY] = component;
    };
}
```

Decorador simple function accepting Component parameter retornando ClassDecorator que ejecuta assignment `(target as any)[MODULE_LIST_COMPONENT_KEY] = component` almacenando component reference en class object directly (no prototype). Type cast `as any` necessary porque TypeScript no reconoce Symbol keys en class type definitions. No validation component validity asumiendo developer imported correctly Vue SFC .vue file default export. Ubicación: src/decorations/module_list_component_decorator.ts líneas ~1-20.

### Metadata Storage

```typescript
// Metadata stored in class (not prototype)
Product[MODULE_LIST_COMPONENT_KEY] = ProductCardListView;
User[MODULE_LIST_COMPONENT_KEY] = UserGridView;
Order[MODULE_LIST_COMPONENT_KEY] = OrderKanbanView;
```

Storage en class object directly (not prototype) porque component definition única per entity type no shared instances. Lookup: `Product[MODULE_LIST_COMPONENT_KEY]` retorna ProductCardListView component reference directly O(1) access efficient. Class-level storage appropriate metadata describing type-level behavior no instance-level data.

### BaseEntity Accessor

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el componente ListView del módulo (método estático)
 * 
 * @returns Componente Vue o undefined
 */
public static getModuleListComponent(): Component | undefined {
    return (this as any)[MODULE_LIST_COMPONENT_KEY];
}

/**
 * Obtiene el componente ListView (método de instancia)
 * Wrapper que delega al método estático
 */
public getModuleListComponent(): Component | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getModuleListComponent();
}
```

Static method accesses class-level metadata `(this as any)[MODULE_LIST_COMPONENT_KEY]` retornando component or undefined. Instance method wrapper delegates to static method via constructor reference allowing call pattern `entity.getModuleListComponent()` or `EntityClass.getModuleListComponent()` both functional convenience. Return type `Component | undefined` explicitly nullable permitting Router layer handle fallback DefaultListView external logic separation concerns. Ubicación: src/entities/base_entitiy.ts líneas ~260-280.

### Router View Resolution Integration

```vue
<!-- src/router/index.ts or App.vue main template -->

<template>
  <div class="app-container">
    <TopBarComponent />
    <SideBarComponent />
    
    <main class="main-content">
      <!-- Render custom ListView si disponible, DefaultListView fallback -->
      <component 
        :is="currentListViewComponent" 
        v-if="isListView"
      />
      
      <!-- Render custom DetailView si disponible, DefaultDetailView fallback -->
      <component 
        :is="currentDetailViewComponent" 
        :entity="currentEntity"
        v-else
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';
import DefaultListView from '@/views/default_listview.vue';
import DefaultDetailView from '@/views/default_detailview.vue';
import { ViewType } from '@/enums/view_type';

/**
 * Computed property resuelve ListView component: custom o default
 */
const currentListViewComponent = computed(() => {
    const entityClass = Application.View.value?.entityClass;
    
    if (!entityClass) {
        return DefaultListView;
    }
    
    // Obtener custom ListView si configurado
    const customListView = entityClass.getModuleListComponent();
    
    // Retornar custom o fallback default
    return customListView || DefaultListView;
});

/**
 * Computed property resuelve DetailView component: custom o default
 */
const currentDetailViewComponent = computed(() => {
    const entityClass = Application.View.value?.entityClass;
    
    if (!entityClass) {
        return DefaultDetailView;
    }
    
    const customDetailView = entityClass.getModuleDetailComponent();
    return customDetailView || DefaultDetailView;
});

/**
 * Determina si vista actual es ListView o DetailView
 */
const isListView = computed(() => {
    return Application.View.value?.type === ViewType.LIST;
});

/**
 * Entity instance actual para DetailView prop binding
 */
const currentEntity = computed(() => {
    return Application.View.value?.entity;
});
</script>
```

Router component framework heart application rendering orchestrating view transitions. Template conditional rendering `v-if="isListView"` determina mostrar currentListViewComponent o currentDetailViewComponent basado en Application.View.value.type enum. Computed property currentListViewComponent ejecuta resolution logic: obtiene entityClass desde Application.View reactive ref, calls getModuleListComponent() checking custom component existence, retorna custom component si defined o DefaultListView fallback si undefined. Dynamic component `<component :is="currentListViewComponent" />` Vue feature permite render component basado en computed reference variable value reactivity auto-updates cuando Application.View changes.

### Card Grid Layout Example

```vue
<!-- views/ProductCardListView.vue -->

<template>
  <div class="product-card-list">
    <h2>{{ moduleName }}</h2>
    
    <div class="card-grid">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="product-card"
        @click="editProduct(product)"
      >
        <img :src="product.imageUrl" alt="Product" class="card-image" />
        <div class="card-content">
          <h3 class="card-title">{{ product.name }}</h3>
          <p class="card-price">${{ product.price }}</p>
          <p class="card-stock">Stock: {{ product.stock }}</p>
        </div>
        <div class="card-actions">
          <button @click.stop="editProduct(product)">Edit</button>
          <button @click.stop="deleteProduct(product)">Delete</button>
        </div>
      </div>
    </div>
    
    <button @click="createProduct" class="create-button">
      + Add Product
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Product from '@/entities/products';
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';

const products = ref<Product[]>([]);
const moduleName = Product.getModuleName();

async function loadProducts() {
    products.value = await Product.getElementList();
}

function editProduct(product: Product) {
    Application.changeView(Product, ViewType.DETAIL, product);
}

async function deleteProduct(product: Product) {
    if (confirm('Delete this product?')) {
        await product.delete();
        await loadProducts(); // Refresh list
    }
}

function createProduct() {
    Application.changeView(Product, ViewType.DETAIL, new Product());
}

onMounted(() => {
    loadProducts();
});
</script>

<style scoped>
.product-card-list {
    padding: 20px;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.product-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: transform 0.2s;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
}

.card-content {
    padding: 16px;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
}

.card-price {
    font-size: 20px;
    color: #2563eb;
    font-weight: 700;
}

.card-stock {
    font-size: 14px;
    color: #6b7280;
}

.card-actions {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
}
</style>
```

```typescript
// Entity decorator usage
import { ModuleListComponent } from '@/decorations/module_list_component_decorator';
import ProductCardListView from '@/views/ProductCardListView.vue';

@ModuleName('Products')
@ModuleListComponent(ProductCardListView)  // Card grid instead of table
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    @PropertyName('Stock', Number)
    stock!: number;
    
    @PropertyName('Image URL', String)
    imageUrl!: string;
}
```

Card Grid pattern ideal para products catalogs images-heavy content donde visual presentation importante. Template usa CSS Grid `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))` responsive auto-wrapping columns adapting screen size naturally. Card component muestra image prominente top, product details (name/price/stock) middle, actions buttons (Edit/Delete) bottom. Click handler `@click="editProduct"` entire card clickable navigating to DetailView, `@click.stop` buttons prevent event bubbling allowing delete action without triggering card click. Script setup Composition API pattern: reactive `products` ref array, `loadProducts()` async function calling `Product.getElementList()` API, `onMounted()` lifecycle hook trigger initial load, `editProduct/createProduct` navigation via Application.changeView(), `deleteProduct` confirmation dialog await delete refresh list. CSS hover effects `transform: translateY(-4px)` visual feedback user interaction clarity. (~150 lines code complete Vue SFC preserved)

### Kanban Board Example

```vue
<!-- views/OrderKanbanView.vue -->

<template>
  <div class="kanban-board">
    <h2>Orders Kanban</h2>
    
    <div class="kanban-columns">
      <div 
        v-for="status in statuses" 
        :key="status"
        class="kanban-column"
      >
        <h3 class="column-title">{{ status }}</h3>
        <div class="column-content">
          <div 
            v-for="order in getOrdersByStatus(status)" 
            :key="order.id"
            class="kanban-card"
            draggable="true"
            @dragstart="handleDragStart(order)"
            @dragover.prevent
            @drop="handleDrop(order, status)"
          >
            <h4>Order #{{ order.orderNumber }}</h4>
            <p>{{ order.customerName }}</p>
            <p class="order-total">${{ order.total }}</p>
            <button @click="viewOrder(order)">View Details</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Order from '@/entities/order';
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';

const orders = ref<Order[]>([]);
const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const draggedOrder = ref<Order | null>(null);

async function loadOrders() {
    orders.value = await Order.getElementList();
}

function getOrdersByStatus(status: string): Order[] {
    return orders.value.filter(order => order.status === status);
}

function handleDragStart(order: Order) {
    draggedOrder.value = order;
}

async function handleDrop(targetOrder: Order, newStatus: string) {
    if (!draggedOrder.value) return;
    
    draggedOrder.value.status = newStatus;
    await draggedOrder.value.save();
    await loadOrders();
    
    draggedOrder.value = null;
}

function viewOrder(order: Order) {
    Application.changeView(Order, ViewType.DETAIL, order);
}

onMounted(() => {
    loadOrders();
});
</script>

<style scoped>
.kanban-board {
    padding: 20px;
}

.kanban-columns {
    display: flex;
    gap: 20px;
    overflow-x: auto;
}

.kanban-column {
    flex: 1;
    min-width: 300px;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 16px;
}

.column-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
}

.column-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.kanban-card {
    background: white;
    border-radius: 6px;
    padding: 16px;
    cursor: move;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.kanban-card:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.order-total {
    font-size: 20px;
    color: #2563eb;
    font-weight: 700;
    margin: 8px 0;
}
</style>
```

```typescript
import OrderKanbanView from '@/views/OrderKanbanView.vue';

@ModuleName('Orders')
@ModuleListComponent(OrderKanbanView)  // Kanban board workflow
export class Order extends BaseEntity {
    @PropertyName('Order Number', String)
    orderNumber!: string;
    
    @PropertyName('Customer Name', String)
    customerName!: string;
    
    @PropertyName('Total', Number)
    total!: number;
    
    @PropertyName('Status', String)
    status!: string;
}
```

Kanban Board pattern ideal para workflow management tasks/orders status-based visualization. Template usa flexbox columns `display: flex` cada column representando status category (Pending/Processing/Shipped/Delivered). Cards draggable HTML5 Drag Drop API `draggable="true"` `@dragstart` `@dragover.prevent` `@drop` handlers. Script: `getOrdersByStatus()` filter helper computed filtering orders array by status property grouping cards appropriate column dynamically, `draggedOrder` ref tracking currently dragged card state, `handleDragStart()` captures order being dragged, `handleDrop()` updates order.status property calls `save()` persist backend refreshes list triggering re-render columns reflected new status, drag interaction pattern allows users move orders between statuses visually intuitively workflow progression. Style horizontal scrolling `overflow-x: auto` accommodating wide boards multiple columns responsive mobile devices. (~180 líneas code complete Vue SFC preserved)

(Demás examples: Timeline View, Map View, Calendar View patterns preservados en archivo original estructuras similares ~100-150 líneas cada uno implementando different visualization patterns appropriate entity types audit logs/locations/events respectively)

## 5. Flujo de Funcionamiento

**Fase 1: Decoración (Design-Time)**

Developer aplica `@ModuleListComponent(CustomViewComponent)` decorator a entity class durante TypeScript processing. Decorador función ejecuta inmediatamente assignment `(target as any)[MODULE_LIST_COMPONENT_KEY] = CustomViewComponent` almacenando Vue component reference en class object metadata. Component import statement `import CustomViewComponent from '@/views/CustomViewComponent.vue'` precede decorator usage ensuring component available. Metadata immutable después decoración no modifica runtime static configuration. TypeScript compiler procesa decorator antes application runs metadata disponible inmediatamente app initialization.

**Fase 2: Application Initialization**

Durante app startup main.ts, entity classes registranse en Application.ModuleList vía `Application.registerModule(EntityClass)` calls. Registration NO procesa ListView components immediately metadata permanece inerte until Router needs render ListView. Sidebar construye usando ModuleName/ModuleIcon decorators independientemente de ModuleListComponent no impact sidebar item display. User ve sidebar modules available clicking module name triggers navigation initiating view resolution phase.

**Fase 3: ListView Navigation Trigger**

User clicks símbolo sidebar item ejecutando `Application.changeView(EntityClass, ViewType.LIST)` updating Application.View reactive ref value. Navigation handler establece `Application.View.value = { entityClass: EntityClass, type: ViewType.LIST, entity: null }` object describing target view context. Vue reactivity system detects Application.View change propagating updates to all dependents computed properties watching View ref including Router currentListViewComponent computed property triggering re-evaluation component resolution logic determining which Vue component render para ListView.

**Fase 4: Router Component Resolution**

Router template computed property `currentListViewComponent` ejecuta: obtiene `entityClass` desde Application.View.value (EntityClass user clicked), calls `entityClass.getModuleListComponent()` accessor retrieving MODULE_LIST_COMPONENT_KEY Symbol metadata, metadata returns Vue component reference ProductCardListView si configured o undefined if not decorated. Ternary fallback `customListView || DefaultListView` determina final component: custom component si exists, DefaultListView framework default otherwise. Computed property returns component reference asignándose dynamic component binding.

**Fase 5: Dynamic Component Rendering**

Vue framework procesa template dynamic component `<component :is="currentListViewComponent" />` with `:is` attribute binding receiving component reference returned by computed property. Vue mounts appropriate component type (custom ProductCardListView or DefaultListView) triggering component lifecycle onCreate setup script executing. Custom component onMounted hook executes `loadProducts()` function calling `Product.getElementList()` API fetching entity list from backend populating reactive `products` array. Template reactivity system re-renders v-for loop iterating products array displaying cards/kanban/calendar appropriately. User sees custom ListView rendered with data loaded interactive actions available (click edit, delete, create transitions).

**Fase 6: User Interactions and Navigation**

User interacts with ListView custom component: clicking card triggers `editProduct(product)` handler executing `Application.changeView(Product, ViewType.DETAIL, product)` updating Application.View type to DETAIL passing entity instance. Router detects View change switching rendering from currentListViewComponent to currentDetailViewComponent (using ModuleDetailComponent decorator or DefaultDetailView fallback) displaying entity form editing. After save/cancel user returns ListView vía Application.changeView(Product, ViewType.LIST) refreshing cycle repeats. Delete action `deleteProduct` calls `product.delete()` awaits completion then `loadProducts()` refresh updating ListView immediately reflecting deletion. Create button navigates DetailView with new empty entity instance `new Product()` allowing user populate fields save creating new record subsequently visible ListView after return.

## 6. Reglas Obligatorias

1. **Component MUST implement data loading logic**: Custom ListView component responsible explicitly loading entities calling `EntityClass.getElementList()` or similar API method populating reactive array used template v-for iteration. Framework NO auto-loads data component must manage loading programmatically. Pattern: `const entities = ref<EntityClass[]>([]); async function loadEntities() { entities.value = await EntityClass.getElementList(); } onMounted(() => { loadEntities(); })`. Omitting data loading results empty ListView no records displayed error understanding.

2. **Component MUST provide navigation to DetailView**: ListView debe proveer user mechanism navigate DetailView editing existing entities or creating new ones. Usar `Application.changeView(EntityClass, ViewType.DETAIL, entity)` para edit passing instance, `Application.changeView(EntityClass, ViewType.DETAIL, new EntityClass())` para create passing empty new. Without navigation pattern user trapped ListView unable edit/create records breaking standard CRUD flow expectation. Implement via click handlers buttons actions menu context appropriate UI element.

3. **Component MUST handle entity deletion gracefully**: Si component allows delete actions MUST: show confirmation dialog `confirm('Delete?')` user safeguard accidental deletions, call `entity.delete()` await completion API request, refresh entity list calling loadEntities() afterwards update display removed entity, handle errors API failures network issues user-friendly error messages não silent failures. Pattern: `async function deleteEntity(entity) { if (!confirm('Delete?')) return; try { await entity.delete(); await loadEntities(); } catch(err) { alert('Delete failed'); } }` robust handling.

4. **Responsive design REQUIRED for mobile support**: ListView component CSS MUST adapt small screens mobile devices tablets ensuring usability across viewport sizes. Use CSS media queries `@media (max-width: 768px)` adjust layouts stack columns reduce grid items single column modify font sizes paddings touch-friendly targets. Card grids typically `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))` responsive auto-wrapping suitable. Kanban boards horizontal scroll `overflow-x: auto` mobile swipe interactions. Test component multiple screen sizes verify functionality not degraded mobile.

5. **Performance considerations large datasets**: If entity lists potentially large (100+ records), component DEBE consider performance optimization strategies: virtualización lazy rendering only visible items using libraries (@vueuse/core useVirtualList, vue-virtual-scroller), pagination loading subset records time with prev/next controls reducing initial payload, infinite scroll loading additional records user scrolls approaching list end progressive loading UX, search/filter local filtering large lists client-side or server-side API query params reducing displayed subset. Test component realistic data volumes ensure acceptable performance no lag freezing rendering thousands items simultaneously.

6. **Consistent Module Identity ModuleIcon/ModuleName**: Component SHOULD display module name/icon consistently maintaining identity coherence across application. Access `EntityClass.getModuleName()` accessor header titles breadcrumbs contextual labels, `EntityClass.getModuleIcon()` resolver icon visual consistency sidebar headers. Example: `<h2><ModuleIconComponent :iconName="Product.getModuleIcon()" /> {{ Product.getModuleNamePlural() }}</h2>` header maintaining branding. Omitting module identity labels confusing users especially applications multiple similar modules distinguishing critical.

## 7. Prohibiciones

1. **NO reemplazar ModuleDetailComponent o confundir responsabilidades**: ModuleListComponent controla SOLO ListView múltiples records display, NO DetailView individual entity form editing. DetailView uses ModuleDetailComponent decorator separate concern. Attempting render detail form inside ListView custom component violates separation concerns creates maintenance complexity data flow confusion. Cada decorator tiene scope específico: ModuleListComponent → ListView many records, ModuleDetailComponent → DetailView single entity form. Respect boundaries keep components focused single responsibility maintainability clarity.

2. **NO omitir data loading esperando automático**: Custom ListView component NO auto-loads entity data; developer responsible implementing loading logic explicitly calling API methods. Framework solo renderiza component, component must fetch display data. Omitir `getElementList()` call results empty ListView sin data confusing frustrating users. Always implement loading pattern component setup lifecycle hooks ensuring data available rendering. Assumption automatic loading incorrect causes runtime issues missing data displays.

3. **NO hardcodear entity data en component sin API calls**: Component NO debe contener mock static entity data arrays hardcoded valores test purposes shipped production. Always fetch real data backend via EntityClass.getElementList() authentic dynamic reflecting actual database state. Hardcoded data outdated incorrect misleading users causing data integrity issues. Test data acceptable development pero MUST replaced real API calls production deployments configuration environment variables distinguish contexts appropriately.

4. **NO modificar entity state sin validation save**: When updating entity properties (ej kanban drag-drop cambiando status), component MUST call `entity.save()` persist changes backend. Modifying local property `entity.status = newValue` without saving causes state inconsistency frontend backend diverging. Always pattern: modify property → call save → handle result → refresh list reflecting persisted changes. Validation optional depending business rules pero save mandatory ensure changes persist beyond session memory volatility.

5. **NO asumir usuarios experienced avanzado sin onboarding**: Custom ListView layouts (kanban, calendar, map) pueden ser unfamiliar users expecting traditional table format. Provide visual cues instructions tooltips helping users understand interaction patterns: drag-drop icons indicators kanban cards draggable, calendar date-picking helpers highlighting today current month navigation arrows, map zoom controls legends explaining markers clusters. Empty states instructional text when no data guiding users create first entity. Avoid assuming users intuitive understanding custom visualizations accessibility UX critical success adoption.

6. **NO violar responsive design ignorando small screens**: Component CSS NO debe asumir large desktop screens fijos layouts breaking small viewports. Always test mobile devices tablets ensuring layouts adapt gracefully stacking wrapping scrolling appropriate. Fixed widths `width: 1200px` prohibited cause horizontal overflow pequeñas pantallas. Prefer relative units percentages `%` flexbox grid responsive patterns auto-adapting disponible screen space. Mobile-first approach designing small expanding large safer ensures mobile usability not afterthought retrofit difficult.

## 8. Dependencias e Integraciones

### BaseEntity
Import MODULE_LIST_COMPONENT_KEY Symbol y proporciona getModuleListComponent() accessor estático retornando component reference or undefined. Ubicación src/entities/base_entitiy.ts líneas ~260-280. Accessor punto acceso único UI components query ListView metadata sin acceder Symbol directamente encapsulation protecting namespace symbol private contract framework.

### Vue Component Type
Import `import type { Component } from 'vue'` TypeScript type annotation decorator parameter ensuring type-safety component references. Custom ListView components MUST be valid Vue SFCs .vue files default-exported defineComponent configuration making them renderable Vue dynamic `<component :is>` binding. Framework expects standard Vue component contracts props emits lifecycle hooks compatible Vue ecosystem.

### Application Singleton
Application.View reactive ref central state management view context tracking entityClass type entity instance current. Application.changeView() method navigation API updating View triggering router transitions. Custom ListView components depend on Application para navigation coordination `Application.changeView(EntityClass, ViewType.DETAIL, entity)` standard pattern consistent behavior across application. ModuleList registration inicialización dependencia application startup sequence.

### Router View Resolution
Router layer (App.vue or router/index.ts) orquesta rendering evaluating computed property currentListViewComponent consulta getModuleListComponent() fallback DefaultListView. Dynamic component `<component :is>` binding Vue core feature enabling resolution. Template conditional `v-if="isListView"` switching ListView DetailView based on View.value.type enum ViewType.LIST / ViewType.DETAIL coordination state management clear separation view contexts.

### ViewType Enum
Enum defining  view types constants: `export enum ViewType { LIST = 'list', DETAIL = 'detail' }`. Used Application.View.value.type discriminate current view context Router conditional rendering. Application.changeView(entityClass, ViewType.LIST) establece ListView mode, ViewType.DETAIL establece DetailView mode. Simple enum pero foundational coordinating entire view system navigation flow typed safe preventing string typos magic values.

### DefaultListView Fallback Component
Framework-provided Vue component src/views/default_listview.vue rendering generic table layout autogenerated columns entity properties. Used when entity NO has @ModuleListComponent decorator configured. Custom ListView components complete replacement DefaultListView no inheritance extension override specific parts. Developers copy patterns DefaultListView code learning reference implementing custom versions useful starting point understanding expected behaviors CRUD actions pagination sorting típicos.

### EntityClass.getElementList() API Method
BaseEntity static method fetches entity list from backend API. Signature: `static async getElementList(): Promise<EntityClass[]>`. Internally calls configured API endpoint retrieves JSON array deserializes entity instances. Custom ListView components responsible calling method populating data arrays onMounted lifecycle or refresh triggers. Standard pattern universal todos entities inheriting BaseEntity consistent API contract simplifying component implementations reusability patterns.

### ModuleDetailComponent Decorator
Complementary decorator defining custom DetailView form single entity. Independent decorators ListView DetailView orthogonal concerns separate components. Entities pueden tener uno, ambos, o ninguno custom components mixing defaults customs freely per view type. Coordination Application.changeView navigation transitioning between ListView DetailView contexts users edit create entities round-trip flow complete CRUD cycle coverage.

### ModuleName / ModuleIcon Decorators
ModuleName define text labels modules ModuleIcon define visual icons. Custom ListView components SHOULD use accessors `EntityClass.getModuleName()` `EntityClass.getModuleIcon()` displaying module identity headers titles maintaining branding consistency coherence sidebar navigation view content aligned UX quality perception professionalism identity clear users know context always.

## 9. Relaciones con Otros Elementos

### Con DefaultListView
**Relación Reemplazo Completo**: ModuleListComponent cuando configured reemplaza completamente DefaultListView component no inheritance extension override. DefaultListView serve fallback cuando entity NO tiene decorator no custom component defined. Developers pueden reference DefaultListView code template example patterns CRUD actions típicos pagination sorting filtering understanding expected behaviors helpful designing custom components matching capabilities if needed pero architecturally independent components not parent-child relationship class inheritance.

### Con ModuleDetailComponent
**Complementary Orthogonal Decorators**: ModuleDetailComponent controla DetailView single entity form, ModuleListComponent controla ListView múltiples records display. Ambos decorators independent aplicables separately entities pueden tener custom ListView default DetailView vice versa mixing freely. Coordination vía Application.changeView() navigation flow: ListView → user clicks entity → DetailView edit → user saves → return ListView refresh cycle. Ambos decorators optional using framework defaults adequate simple entities requiring uniquely customization specific modules domains complex visualization needs.

### Con Application.ModuleList
**Entity Registration Independence**: ModuleList contains registered entity classes populated Application.registerModule() calls app initialization. Registration NO procesa ListView components immediately metadata storage lazy resolution differs. SideBarComponent iterates ModuleList rendering navigation items using ModuleName/ModuleIcon decorators independent ModuleListComponent. Clicking sidebar item triggers Application.changeView() establishing View.value context Router resolves ListView component decorated or default. Module registration precedes view rendering establishing available entities navigation targets.

### Con Router y View System
**Integration Point Critical**: Router template computed properties currentListViewComponent/currentDetailViewComponent drive entire view rendering orchestration. Application.View reactive ref state source truth current context (entityClass, type, entity) coordinating navigation. Router consults getModuleListComponent() accessor resolving component render dynamic `<component :is>` binding Vue mounting appropriate component type. ListView components oblivious router internals só depend Application.changeView() API navigation triggering router state updates propagating reactivity updates. Clean separation concerns component code portable testable independently router coupling minimizada API contract surface.

### Con CRUD Operations and BaseEntity Methods
**Dependency Indirect através API Calls**: Custom ListView components call BaseEntity methods data operations: `EntityClass.getElementList()` fetch entities, `entity.save()` persist updates, `entity.delete()` remove records, `entity.validate()` if implementing inline editing validation. Components NO inherit BaseEntity (entities do, components separate Vue  SFCs) но access entity methods through imported entity class references instance methods. CRUD operations invoked user interactions component handlers translating UI actions backend API calls coordinating via BaseEntity abstract layer encapsulation persistence logic reusability consistency.

### Con ModuleCustomComponents y Property Decorators
**Orthogonal Concerns Scope Different**: ModuleCustomComponents decorator controla property-level input components dentro forms individual property rendering. ModuleListComponent controla view-level  ListView entire múltiple records display layout structure. No overlap responsibilities ModuleCustomComponents affects DetailView property inputs, ModuleListComponent affects ListView entity list visualization. Custom ListView puede mostrar property values pero typically read-only display not input editing (aunque component puede implementar inline editing manually using ModuleCustomComponents coordination if desired complexity accepting trade-off).

### Con Sidebar y SideBarComponent
**Navigation Independence Related**: SideBarComponent usa ModuleName/ModuleIcon decorators rendering navigation menu items independent ModuleListComponent decorator. Sidebar rendering NO consulta getModuleListComponent() metadata irrelevant navigation display. User clicks sidebar item ejecuta Application.changeView() triggering router resolution loading ListView component decorated custom or default. Sidebar provides starting point navigation, ModuleListComponent defines destination ListView render user arrives. Clean separation navigation UI (sidebar) content display UI (ListView) concerns maintainability modularity architectural clarity.

## 10. Notas de Implementación

1. **Data loading pattern standardization critical**: Custom ListView components should adopt consistent pattern loading entities reducing learning curve developers maintenance burden. Standard pattern: `const entities = ref<EntityClass[]>([]); async function loadEntities() { entities.value = await EntityClass.getElementList(); } onMounted(() => { loadEntities(); })`. Variation: `const { data: entities, loading, error } = useAsyncData(() => EntityClass.getElementList())` using composables if preferred abstraction consistent project conventions importante maintaining code consistency readability onboarding.

2. **Empty states and loading states UX essential**: Custom components ДОЛЖНЫ handle empty data scenarios gracefully displaying helpful messages guiding users create first entity nicht leaving blank white screen confusing. Empty state example: `<div v-if="entities.length === 0" class="empty-state"><p>No products yet.</p><button @click="createEntity">Create First Product</button></div>`. Loading state während data fetching: `<div v-if="loading" class="loading">Loading...</div>` spinner animation indicating progress avoiding perceived frozen unresponsive UI negative experience.

3. **Error handling API failures user-friendly**: Network issues backend errors API failures inevitable; custom components MUST handle gracefully displaying error messages allowing retry not crashing silently failing confusing users. Pattern: `try { entities.value = await EntityClass.getElementList(); } catch(err) { error.value = 'Failed to load data. Please try again.'; }` displaying error template `<div v-if="error" class="error">{{ error }} <button @click="loadEntities">Retry</button></div>` providing actionable recovery path retry mechanism user empowered resolve improving resilience robustness production reliability.

4. **Alternative layouts appropriate domain matching mental models**: Select layout pattern matching entity nature user mental model interaction expectations. Products visual catalogs prefer card grids prominent images prices. Workflow entities status progression prefer kanban boards columns transitions drag-drop. Temporal entities events appointments prefer calendar views date-based positioning navigation. Geographic entities locations branches warehouses prefer map views markers clustering zoom navigation. Activity entities audit logs feeds prefer timeline views chronological narrative vertical flow temporal relationships. Mismatch patterns confusion (kanban for products nonsensical, calendar for non-temporal confusing) reducing UX quality clarity cognitive load inappropriate visualization ஜ்choice important.

5. **Responsive design mobile-first approach recommended**: Designing ListView components starting small screens scaling up larger safer ensuring mobile usability foundational. Mobile constraints forcing prioritization essential information interactions touch-friendly targets adequately spaced preventing mis-taps fat-finger issues. Media queries expanding layouts desktop `@media (min-width: 768px)` progressive enhancement adding columns features space available. Testing real devices simulators chrome devtools device toolbar verifying touch interactions gestures swipes scrolling performance not just visual layout rendering mobile critical significant user base accessing applications smartphones tablets responsive non-negotiable modern web.

6. **Performance optimization caching lazy loading**: Large entity lists (100+ records) performance bottleneck rendering hundreds DOM nodes simultaneously expensive cause lag freezing jank. Optimization strategies: virtual scrolling libraries (@vueuse/core useVirtualList) rendering only visible items viewport culling off-screen reducing DOM nodes dramatically 1000 entities rendering ~20 visible items O(N) → O(viewport) performance improvement substantial. Pagination server-side limiting query results subset time `getElementList({ page: 1, perPage: 20 })` reducing payload network latency bandwidth client memory footprint control. Infinite scroll progressive loading UX pattern Twitter Facebook feeds `@scroll` event detecting bottom triggering next page load seamless experience user perception fast continuous.

7. **Accessibility considerations keyboard navigation screen readers**: ListView components ikke purely visual; accessibility WCAG compliance important inclusive design users disabilities assistive technology. Keyboard navigation: elements focusable tab-index semantic HTML buttons links navegable tab key enter activating actions mouse-free interaction. Screen readers: semantic HTML `<button>` `<a>` not `<div @click>` proper labels `aria-label` describing actions context-free meaningful image alt texts descriptive not decorative empty. Color alone не używany convey information status colors accompanied text icons redundant cues colorblind users visual impairments perceiving meaning accessibility audit testing tools axe WAVE verifying compliance critical professional quality inclusive UX.

8. **Testing strategy component unit integration visual regression**: Vitest or Jest unit tests verifying data loading logic functions methods behavior isolated `expect(loadEntities).toBeCalled()` `expect(entities.value).toHaveLength(5)` assertions mocked API responses. Component testing @vue/test-utils mounting components simulating user interactions click events verifying DOM updates state changes `wrapper.find('.card').trigger('click')` `expect(Application.changeView).toHaveBeenCalled()` integration behavior. Visual regression Storybook Percy Chromatic screenshot comparisons baseline images detecting unintended style changes layout shifts CSS regressions automatically CI pipeline confidence refactoring preventing visual bugs production user-facing quality consistency maintained testing comprehensive coverage reduces bugs increases confidence deployments.

9. **Code reuse patterns composables utilities**: Custom ListView components frequently share logic data loading error handling pagination filtering composables abstractions DRY principles reducing duplication maintenance improving consistency. Example: `composables/useEntityList.ts` composable encapsulating loading logic returning reactive state `const { entities, loading, error, loadEntities } = useEntityList(EntityClass)` reusable multiple ListView components projects standardization utility functions formatters currency dates `formatPrice(product.price)` `formatDate(event.date)` centralized utilities folder imported components consistent formatting presentation across application maintainability single source truth modifications.

10. **Documentation component usage integration examples**: Custom ListView components benefit documentation README inline comments explaining usage patterns integration entity decorators expected behaviors props emits API surface. Example: comments describing loading lifecycle navigation patterns CRUD actions responsive breakpoints browser support. README screenshots GIFs demonstrating component action visual reference understanding functionality developers onboarding new team members maintenance future comprehension facilitating knowledge transfer reducing questions support burden documentation investment upfront savings long-term maintenance productivity collaboration quality.

## 11. Referencias Cruzadas

- [module-detail-component-decorator](./module-detail-component-decorator.md): Decorador ModuleDetailComponent define custom DetailView form single entity complementary ListView custom separate concerns CRUD complete coverage
- [module-default-component-decorator](./module-default-component-decorator.md): Decorador ModuleDefaultComponent property-level default input rendering different scope view-level ListView
- [module-custom-components-decorator](./module-custom-components-decorator.md): Decorador ModuleCustomComponents property-level custom input components DetailView forms different scope ListView display bulk records
- [module-name-decorator](./module-name-decorator.md): Decorador ModuleName define text labels modules custom ListView components SHOULD display module names headers maintaining identity consistency
- [module-icon-decorator](./module-icon-decorator.md): Decorador ModuleIcon define visual icons modules custom ListView components SHOULD display icons headers visual identity consistency branding
- [application-views](../../03-application/application-views.md): Application singleton View reactive ref state management coordination changeView() navigation API central integration point
- [router-integration](../../03-application/router-integration.md): Router view resolution computed properties currentListViewComponent dynamic component rendering orchestration view transitions
- [base-entity-core](../../02-base-entity/base-entity-core.md): BaseEntity getModuleListComponent() accessor líneas ~260-280 metadata retrieval getElementList() API method data loading save() delete() CRUD operations
- [default-listview](../../04-components/default-listview.md): DefaultListView framework fallback component generic table layout reference example patterns behaviors expected ListView implementations
- [view-type-enum](../../05-advanced/enums.md): ViewType enum constants LIST DETAIL discriminating view contexts Application.View.value.type Router conditional rendering coordination

**Ubicación código fuente**: `src/decorations/module_list_component_decorator.ts` (~20 líneas)  
**Símbolos y exports**: `MODULE_LIST_COMPONENT_KEY` Symbol, `ModuleListComponent` function ClassDecorator, `getModuleListComponent()` accessor BaseEntity  
**Example component locations**: `src/views/ProductCardListView.vue`, `src/views/OrderKanbanView.vue`, `src/views/EventCalendarView.vue` custom implementations patterns reference
