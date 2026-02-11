# 📋 ModuleListComponent Decorator

**Referencias:**
- `module-detail-component-decorator.md` - ModuleDetailComponent para vista de detalle
- `module-default-component-decorator.md` - ModuleDefaultComponent para componente default
- `module-custom-components-decorator.md` - Componentes personalizados por propiedad
- `../../03-application/application-views.md` - Sistema de vistas
- `../../02-base-entity/base-entity-core.md` - getModuleListComponent() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/module_list_component_decorator.ts`

---

## 🎯 Propósito

El decorador `@ModuleListComponent()` define el **componente Vue personalizado** que se usa para renderizar la **vista de lista** (ListView / tabla) de una entidad.

**Beneficios:**
- ListView completamente personalizada
- Layouts alternativos (cards, grid, kanban)
- Lógica de UI específica del módulo
- Override de default_listview.vue

---

## 📝 Sintaxis

```typescript
import type { Component } from 'vue';

@ModuleListComponent(component: Component)
export class EntityName extends BaseEntity {
    // ...
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `component` | `Component` | Sí | Componente Vue para ListView |

---

## 💾 Implementación

### Código del Decorador

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
 * @param component - Componente Vue
 * @returns ClassDecorator
 */
export function ModuleListComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_LIST_COMPONENT_KEY] = component;
    };
}
```

**Ubicación:** `src/decorations/module_list_component_decorator.ts` (línea ~1-20)

---

## 🔍 Metadata Storage

### Estructura en Class

```typescript
// Metadata se guarda en la clase (no en prototype)
Product[MODULE_LIST_COMPONENT_KEY] = ProductListView;
User[MODULE_LIST_COMPONENT_KEY] = UserGridView;
Order[MODULE_LIST_COMPONENT_KEY] = OrderKanbanView;
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el componente ListView del módulo
 * 
 * @returns Componente Vue o undefined
 */
public static getModuleListComponent(): Component | undefined {
    return (this as any)[MODULE_LIST_COMPONENT_KEY];
}

/**
 * Obtiene el componente ListView (método de instancia)
 */
public getModuleListComponent(): Component | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getModuleListComponent();
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~260-280)

---

## 🎨 Impacto en Application

### Router View Resolution

```vue
<!-- src/router/index.ts -->

<template>
  <div class="app-container">
    <TopBarComponent />
    <SideBarComponent />
    
    <main class="main-content">
      <!-- Renderizar componente ListView personalizado -->
      <component 
        :is="currentListViewComponent" 
        v-if="isListView"
      />
      
      <!-- Renderizar componente DetailView personalizado -->
      <component 
        :is="currentDetailViewComponent" 
        v-else
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Application } from '@/models/application';
import DefaultListView from '@/views/default_listview.vue';
import DefaultDetailView from '@/views/default_detailview.vue';

const currentListViewComponent = computed(() => {
    const entityClass = Application.View.value?.entityClass;
    
    if (!entityClass) {
        return DefaultListView;
    }
    
    // Usar custom ListView si está definido
    const customListView = entityClass.getModuleListComponent();
    return customListView || DefaultListView;
});

const currentDetailViewComponent = computed(() => {
    const entityClass = Application.View.value?.entityClass;
    
    if (!entityClass) {
        return DefaultDetailView;
    }
    
    const customDetailView = entityClass.getModuleDetailComponent();
    return customDetailView || DefaultDetailView;
});

const isListView = computed(() => {
    return Application.View.value?.type === ViewType.LIST;
});
</script>
```

---

## 🧪 Ejemplos de Uso

### 1. Card Grid Layout

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
        await loadProducts();
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
import { ModuleListComponent } from '@/decorations/module_list_component_decorator';
import ProductCardListView from '@/views/ProductCardListView.vue';

@ModuleName('Products')
@ModuleListComponent(ProductCardListView)  // ← Card grid en lugar de tabla
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

---

### 2. Kanban Board

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
import { ref, computed, onMounted } from 'vue';
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
@ModuleListComponent(OrderKanbanView)  // ← Kanban board
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

---

### 3. Timeline View

```vue
<!-- views/AuditLogTimelineView.vue -->

<template>
  <div class="timeline-view">
    <h2>Audit Log Timeline</h2>
    
    <div class="timeline">
      <div 
        v-for="log in sortedLogs" 
        :key="log.id"
        class="timeline-item"
      >
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h3>{{ log.action }}</h3>
            <span class="timeline-date">{{ formatDate(log.timestamp) }}</span>
          </div>
          <p class="timeline-user">By: {{ log.user }}</p>
          <p class="timeline-details">{{ log.details }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AuditLog from '@/entities/audit_log';

const logs = ref<AuditLog[]>([]);

const sortedLogs = computed(() => {
    return [...logs.value].sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
    );
});

async function loadLogs() {
    logs.value = await AuditLog.getElementList();
}

function formatDate(date: Date): string {
    return date.toLocaleString();
}

onMounted(() => {
    loadLogs();
});
</script>

<style scoped>
.timeline-view {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.timeline {
    position: relative;
    padding-left: 40px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e5e7eb;
}

.timeline-item {
    position: relative;
    margin-bottom: 24px;
}

.timeline-marker {
    position: absolute;
    left: -28px;
    top: 6px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #2563eb;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #2563eb;
}

.timeline-content {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.timeline-date {
    font-size: 14px;
    color: #6b7280;
}

.timeline-user {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
}

.timeline-details {
    font-size: 16px;
}
</style>
```

```typescript
import AuditLogTimelineView from '@/views/AuditLogTimelineView.vue';

@ModuleName('Audit Logs')
@ModuleListComponent(AuditLogTimelineView)  // ← Timeline view
export class AuditLog extends BaseEntity {
    @PropertyName('Log ID', Number)
    id!: number;
    
    @PropertyName('Action', String)
    action!: string;
    
    @PropertyName('User', String)
    user!: string;
    
    @PropertyName('Timestamp', Date)
    timestamp!: Date;
    
    @PropertyName('Details', String)
    details!: string;
}
```

---

### 4. Map View (Locations)

```vue
<!-- views/LocationMapView.vue -->

<template>
  <div class="map-view">
    <h2>Locations Map</h2>
    
    <div ref="mapContainer" class="map-container"></div>
    
    <div class="location-list">
      <div 
        v-for="location in locations" 
        :key="location.id"
        class="location-item"
        @click="selectLocation(location)"
      >
        <h3>{{ location.name }}</h3>
        <p>{{ location.address }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Location from '@/entities/location';
// import { GoogleMapsAPI } from '@/services/maps';

const locations = ref<Location[]>([]);
const mapContainer = ref<HTMLElement>();

async function loadLocations() {
    locations.value = await Location.getElementList();
    renderMap();
}

function renderMap() {
    // Integración con Google Maps, Leaflet, etc.
    // ...
}

function selectLocation(location: Location) {
    // Centrar mapa en location
    // ...
}

onMounted(() => {
    loadLocations();
});
</script>

<style scoped>
.map-view {
    display: flex;
    height: calc(100vh - 60px);
}

.map-container {
    flex: 2;
    background: #e5e7eb;
}

.location-list {
    flex: 1;
    overflow-y: auto;
    border-left: 1px solid #e5e7eb;
    padding: 16px;
}

.location-item {
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 8px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.location-item:hover {
    background: #f9fafb;
}
</style>
```

```typescript
import LocationMapView from '@/views/LocationMapView.vue';

@ModuleName('Locations')
@ModuleListComponent(LocationMapView)  // ← Map view
export class Location extends BaseEntity {
    @PropertyName('Location ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Address', String)
    address!: string;
    
    @PropertyName('Latitude', Number)
    latitude!: number;
    
    @PropertyName('Longitude', Number)
    longitude!: number;
}
```

---

### 5. Calendar View (Events)

```vue
<!-- views/EventCalendarView.vue -->

<template>
  <div class="calendar-view">
    <h2>Events Calendar</h2>
    
    <div class="calendar-header">
      <button @click="previousMonth">←</button>
      <h3>{{ monthName }} {{ year }}</h3>
      <button @click="nextMonth">→</button>
    </div>
    
    <div class="calendar-grid">
      <div v-for="day in daysOfWeek" :key="day" class="calendar-day-header">
        {{ day }}
      </div>
      
      <div 
        v-for="date in calendarDates" 
        :key="date.toString()"
        class="calendar-date"
        :class="{ 'other-month': !isCurrentMonth(date) }"
      >
        <span class="date-number">{{ date.getDate() }}</span>
        <div class="date-events">
          <div 
            v-for="event in getEventsForDate(date)" 
            :key="event.id"
            class="event-marker"
            @click="viewEvent(event)"
          >
            {{ event.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Event from '@/entities/event';

const events = ref<Event[]>([]);
const currentDate = ref(new Date());

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthName = computed(() => {
    return currentDate.value.toLocaleString('default', { month: 'long' });
});

const year = computed(() => {
    return currentDate.value.getFullYear();
});

const calendarDates = computed(() => {
    // Generar array de fechas del calendario
    // ...
    return [];
});

function isCurrentMonth(date: Date): boolean {
    return date.getMonth() === currentDate.value.getMonth();
}

function getEventsForDate(date: Date): Event[] {
    return events.value.filter(event => 
        event.eventDate.toDateString() === date.toDateString()
    );
}

function previousMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
}

function nextMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
}

async function loadEvents() {
    events.value = await Event.getElementList();
}

onMounted(() => {
    loadEvents();
});
</script>

<style scoped>
.calendar-view {
    padding: 20px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
}

.calendar-day-header {
    text-align: center;
    font-weight: 600;
    padding: 8px;
    background: #f3f4f6;
}

.calendar-date {
    min-height: 100px;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
}

.calendar-date.other-month {
    opacity: 0.4;
}

.date-number {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
}

.event-marker {
    background: #2563eb;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 4px;
    cursor: pointer;
}
</style>
```

```typescript
import EventCalendarView from '@/views/EventCalendarView.vue';

@ModuleName('Events')
@ModuleListComponent(EventCalendarView)  // ← Calendar view
export class Event extends BaseEntity {
    @PropertyName('Event ID', Number)
    id!: number;
    
    @PropertyName('Event Name', String)
    name!: string;
    
    @PropertyName('Event Date', Date)
    eventDate!: Date;
    
    @PropertyName('Description', String)
    description!: string;
}
```

---

## ⚠️ Consideraciones Importantes

### 1. ListView MUST Load Data

```typescript
// El componente ListView personalizado DEBE cargar datos
async function loadData() {
    entities.value = await EntityClass.getElementList();
}

onMounted(() => {
    loadData();
});
```

### 2. Navigation to DetailView

```typescript
// Proveer forma de navegar a DetailView
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';

function editEntity(entity: BaseEntity) {
    Application.changeView(EntityClass, ViewType.DETAIL, entity);
}

function createEntity() {
    Application.changeView(EntityClass, ViewType.DETAIL, new EntityClass());
}
```

### 3. Responsive Design

```typescript
// ListView debe ser responsive
<style scoped>
@media (max-width: 768px) {
    .card-grid {
        grid-template-columns: 1fr;  /* Stack en móvil */
    }
}
</style>
```

### 4. Performance with Large Lists

```typescript
// Considerar virtualización para listas grandes
import { useVirtualList } from '@vueuse/core';

const { list, containerProps, wrapperProps } = useVirtualList(
    entities,
    { itemHeight: 100 }
);
```

### 5. Testing ModuleListComponent

```typescript
describe('Product ModuleListComponent', () => {
    it('should have custom list component', () => {
        const listComponent = Product.getModuleListComponent();
        expect(listComponent).toBe(ProductCardListView);
    });
    
    it('should render cards instead of table', async () => {
        const wrapper = mount(ProductCardListView);
        await wrapper.vm.loadProducts();
        
        expect(wrapper.findAll('.product-card').length).toBeGreaterThan(0);
        expect(wrapper.find('table').exists()).toBe(false);
    });
});
```

---

## 📚 Referencias Adicionales

- `module-detail-component-decorator.md` - Componente para DetailView
- `module-default-component-decorator.md` - Componente default por propiedad
- `module-custom-components-decorator.md` - Componentes personalizados
- `../../03-application/application-views.md` - Sistema de vistas
- `../../02-base-entity/base-entity-core.md` - getModuleListComponent()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/module_list_component_decorator.ts`  
**Líneas:** ~20
