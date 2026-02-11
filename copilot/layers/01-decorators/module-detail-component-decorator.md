# 📋 ModuleDetailComponent Decorator

**Referencias:**
- `module-list-component-decorator.md` - ModuleListComponent para vista de lista
- `module-default-component-decorator.md` - ModuleDefaultComponent para componente default
- `module-custom-components-decorator.md` - Componentes personalizados por propiedad
- `../../03-application/application-views.md` - Sistema de vistas
- `../../02-base-entity/base-entity-core.md` - getModuleDetailComponent() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/module_detail_component_decorator.ts`

---

## 🎯 Propósito

El decorador `@ModuleDetailComponent()` define el **componente Vue personalizado** que se usa para renderizar la **vista de detalle** (DetailView / formulario) de una entidad.

**Beneficios:**
- DetailView completamente personalizada
- Layouts complejos (tabs, wizards, multi-step)
- Lógica de validación específica
- Override de default_detailview.vue

---

## 📝 Sintaxis

```typescript
import type { Component } from 'vue';

@ModuleDetailComponent(component: Component)
export class EntityName extends BaseEntity {
    // ...
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `component` | `Component` | Sí | Componente Vue para DetailView |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/module_detail_component_decorator.ts

import type { Component } from 'vue';

/**
 * Symbol para almacenar metadata de module detail component
 */
export const MODULE_DETAIL_COMPONENT_KEY = Symbol('module_detail_component');

/**
 * @ModuleDetailComponent() - Define componente Vue para DetailView
 * 
 * @param component - Componente Vue
 * @returns ClassDecorator
 */
export function ModuleDetailComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_DETAIL_COMPONENT_KEY] = component;
    };
}
```

**Ubicación:** `src/decorations/module_detail_component_decorator.ts` (línea ~1-20)

---

## 🔍 Metadata Storage

### Estructura en Class

```typescript
// Metadata se guarda en la clase (no en prototype)
Product[MODULE_DETAIL_COMPONENT_KEY] = ProductDetailForm;
User[MODULE_DETAIL_COMPONENT_KEY] = UserWizardForm;
Order[MODULE_DETAIL_COMPONENT_KEY] = OrderTabbedForm;
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el componente DetailView del módulo
 * 
 * @returns Componente Vue o undefined
 */
public static getModuleDetailComponent(): Component | undefined {
    return (this as any)[MODULE_DETAIL_COMPONENT_KEY];
}

/**
 * Obtiene el componente DetailView (método de instancia)
 */
public getModuleDetailComponent(): Component | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getModuleDetailComponent();
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~240-260)

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
      <!-- Renderizar componente ListView -->
      <component 
        :is="currentListViewComponent" 
        v-if="isListView"
      />
      
      <!-- Renderizar componente DetailView personalizado -->
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
import { Application } from '@/models/application';
import DefaultListView from '@/views/default_listview.vue';
import DefaultDetailView from '@/views/default_detailview.vue';

const currentDetailViewComponent = computed(() => {
    const entityClass = Application.View.value?.entityClass;
    
    if (!entityClass) {
        return DefaultDetailView;
    }
    
    // Usar custom DetailView si está definido
    const customDetailView = entityClass.getModuleDetailComponent();
    return customDetailView || DefaultDetailView;
});

const currentListViewComponent = computed(() => {
    const entityClass = Application.View.value?.entityClass;
    
    if (!entityClass) {
        return DefaultListView;
    }
    
    const customListView = entityClass.getModuleListComponent();
    return customListView || DefaultListView;
});

const currentEntity = computed(() => {
    return Application.View.value?.entity;
});

const isListView = computed(() => {
    return Application.View.value?.type === ViewType.LIST;
});
</script>
```

---

## 🧪 Ejemplos de Uso

### 1. Tabbed Detail View

```vue
<!-- views/ProductTabbedDetailView.vue -->

<template>
  <div class="product-detail-view">
    <h2>{{ isNew ? 'Create Product' : 'Edit Product' }}</h2>
    
    <TabControllerComponent v-model="activeTab">
      <TabComponent name="basic" title="Basic Info">
        <div class="form-group">
          <label>Product Name</label>
          <input v-model="entity.name" type="text" />
        </div>
        
        <div class="form-group">
          <label>SKU</label>
          <input v-model="entity.sku" type="text" />
        </div>
        
        <div class="form-group">
          <label>Price</label>
          <input v-model.number="entity.price" type="number" />
        </div>
        
        <div class="form-group">
          <label>Stock</label>
          <input v-model.number="entity.stock" type="number" />
        </div>
      </TabComponent>
      
      <TabComponent name="description" title="Description">
        <div class="form-group">
          <label>Short Description</label>
          <textarea v-model="entity.shortDescription" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <label>Full Description</label>
          <textarea v-model="entity.fullDescription" rows="8"></textarea>
        </div>
        
        <div class="form-group">
          <label>Features (comma-separated)</label>
          <input v-model="entity.features" type="text" />
        </div>
      </TabComponent>
      
      <TabComponent name="images" title="Images">
        <div class="form-group">
          <label>Main Image URL</label>
          <input v-model="entity.mainImageUrl" type="text" />
          <img v-if="entity.mainImageUrl" :src="entity.mainImageUrl" class="preview-image" />
        </div>
        
        <div class="form-group">
          <label>Gallery Images</label>
          <div v-for="(img, index) in entity.galleryImages" :key="index" class="image-row">
            <input v-model="entity.galleryImages[index]" type="text" />
            <button @click="removeImage(index)">Remove</button>
          </div>
          <button @click="addImage">+ Add Image</button>
        </div>
      </TabComponent>
      
      <TabComponent name="seo" title="SEO">
        <div class="form-group">
          <label>Meta Title</label>
          <input v-model="entity.metaTitle" type="text" />
        </div>
        
        <div class="form-group">
          <label>Meta Description</label>
          <textarea v-model="entity.metaDescription" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <label>Keywords</label>
          <input v-model="entity.keywords" type="text" />
        </div>
      </TabComponent>
    </TabControllerComponent>
    
    <div class="actions">
      <button @click="saveEntity" class="btn-primary">Save</button>
      <button @click="cancelEdit" class="btn-secondary">Cancel</button>
      <button v-if="!isNew" @click="deleteEntity" class="btn-danger">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Product from '@/entities/products';
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';
import TabControllerComponent from '@/components/TabControllerComponent.vue';
import TabComponent from '@/components/TabComponent.vue';

interface Props {
    entity: Product;
}

const props = defineProps<Props>();

const activeTab = ref('basic');

const isNew = computed(() => !props.entity.id);

function addImage() {
    if (!props.entity.galleryImages) {
        props.entity.galleryImages = [];
    }
    props.entity.galleryImages.push('');
}

function removeImage(index: number) {
    props.entity.galleryImages.splice(index, 1);
}

async function saveEntity() {
    try {
        await props.entity.save();
        Application.changeView(Product, ViewType.LIST);
    } catch (error) {
        console.error('Save failed:', error);
        alert('Failed to save product');
    }
}

function cancelEdit() {
    Application.changeView(Product, ViewType.LIST);
}

async function deleteEntity() {
    if (confirm('Delete this product?')) {
        await props.entity.delete();
        Application.changeView(Product, ViewType.LIST);
    }
}
</script>

<style scoped>
.product-detail-view {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
}

.preview-image {
    max-width: 200px;
    margin-top: 8px;
    border-radius: 4px;
}

.image-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
}

.btn-primary {
    background: #2563eb;
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}

.btn-secondary {
    background: #6b7280;
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}

.btn-danger {
    background: #dc2626;
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}
</style>
```

```typescript
import { ModuleDetailComponent } from '@/decorations/module_detail_component_decorator';
import ProductTabbedDetailView from '@/views/ProductTabbedDetailView.vue';

@ModuleName('Products')
@ModuleDetailComponent(ProductTabbedDetailView)  // ← Tabs para Basic, Description, Images, SEO
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('SKU', String)
    sku!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    @PropertyName('Stock', Number)
    stock!: number;
    
    shortDescription!: string;
    fullDescription!: string;
    features!: string;
    mainImageUrl!: string;
    galleryImages!: string[];
    metaTitle!: string;
    metaDescription!: string;
    keywords!: string;
}
```

---

### 2. Multi-Step Wizard

```vue
<!-- views/UserWizardDetailView.vue -->

<template>
  <div class="wizard-view">
    <h2>{{ isNew ? 'Create User' : 'Edit User' }}</h2>
    
    <div class="wizard-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step"
        :class="{ active: currentStep === index, completed: currentStep > index }"
      >
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-title">{{ step }}</span>
      </div>
    </div>
    
    <div class="wizard-content">
      <!-- Step 1: Basic Info -->
      <div v-if="currentStep === 0" class="step-content">
        <h3>Basic Information</h3>
        <div class="form-group">
          <label>Full Name</label>
          <input v-model="entity.fullName" type="text" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="entity.email" type="email" />
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input v-model="entity.phone" type="tel" />
        </div>
      </div>
      
      <!-- Step 2: Account Settings -->
      <div v-if="currentStep === 1" class="step-content">
        <h3>Account Settings</h3>
        <div class="form-group">
          <label>Username</label>
          <input v-model="entity.username" type="text" />
        </div>
        <div class="form-group" v-if="isNew">
          <label>Password</label>
          <input v-model="entity.password" type="password" />
        </div>
        <div class="form-group">
          <label>Role</label>
          <select v-model="entity.role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>
      
      <!-- Step 3: Permissions -->
      <div v-if="currentStep === 2" class="step-content">
        <h3>Permissions</h3>
        <div v-for="perm in availablePermissions" :key="perm" class="permission-item">
          <input 
            type="checkbox" 
            :id="perm" 
            v-model="entity.permissions"
            :value="perm"
          />
          <label :for="perm">{{ perm }}</label>
        </div>
      </div>
      
      <!-- Step 4: Review -->
      <div v-if="currentStep === 3" class="step-content">
        <h3>Review</h3>
        <div class="review-section">
          <p><strong>Full Name:</strong> {{ entity.fullName }}</p>
          <p><strong>Email:</strong> {{ entity.email }}</p>
          <p><strong>Phone:</strong> {{ entity.phone }}</p>
          <p><strong>Username:</strong> {{ entity.username }}</p>
          <p><strong>Role:</strong> {{ entity.role }}</p>
          <p><strong>Permissions:</strong> {{ entity.permissions.join(', ') }}</p>
        </div>
      </div>
    </div>
    
    <div class="wizard-actions">
      <button @click="previousStep" :disabled="currentStep === 0">Previous</button>
      <button v-if="currentStep < steps.length - 1" @click="nextStep">Next</button>
      <button v-else @click="saveEntity" class="btn-primary">Save</button>
      <button @click="cancelEdit" class="btn-secondary">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import User from '@/entities/user';
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';

interface Props {
    entity: User;
}

const props = defineProps<Props>();

const currentStep = ref(0);
const steps = ['Basic Info', 'Account', 'Permissions', 'Review'];
const availablePermissions = ['read', 'write', 'delete', 'admin'];

const isNew = computed(() => !props.entity.id);

function nextStep() {
    if (currentStep.value < steps.length - 1) {
        currentStep.value++;
    }
}

function previousStep() {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
}

async function saveEntity() {
    await props.entity.save();
    Application.changeView(User, ViewType.LIST);
}

function cancelEdit() {
    Application.changeView(User, ViewType.LIST);
}
</script>

<style scoped>
.wizard-view {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.wizard-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.step.active .step-number {
    background: #2563eb;
    color: white;
}

.step.completed .step-number {
    background: #10b981;
    color: white;
}

.wizard-content {
    min-height: 300px;
    padding: 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.wizard-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: flex-end;
}
</style>
```

```typescript
import UserWizardDetailView from '@/views/UserWizardDetailView.vue';

@ModuleName('Users')
@ModuleDetailComponent(UserWizardDetailView)  // ← Multi-step wizard
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Full Name', String)
    fullName!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    @PropertyName('Phone', String)
    phone!: string;
    
    @PropertyName('Username', String)
    username!: string;
    
    password!: string;
    role!: string;
    permissions!: string[];
}
```

---

### 3. Split-Pane Layout (Address Form)

```vue
<!-- views/AddressSplitDetailView.vue -->

<template>
  <div class="split-view">
    <div class="left-pane">
      <h3>Address Information</h3>
      
      <div class="form-group">
        <label>Street Address</label>
        <input v-model="entity.street" type="text" />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>City</label>
          <input v-model="entity.city" type="text" />
        </div>
        <div class="form-group">
          <label>State</label>
          <input v-model="entity.state" type="text" />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>ZIP Code</label>
          <input v-model="entity.zipCode" type="text" />
        </div>
        <div class="form-group">
          <label>Country</label>
          <input v-model="entity.country" type="text" />
        </div>
      </div>
      
      <div class="actions">
        <button @click="saveEntity" class="btn-primary">Save</button>
        <button @click="cancelEdit" class="btn-secondary">Cancel</button>
      </div>
    </div>
    
    <div class="right-pane">
      <h3>Map Preview</h3>
      <div ref="mapContainer" class="map-container">
        <!-- Google Maps o Leaflet -->
        <div class="map-placeholder">
          <p>{{ fullAddress }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Address from '@/entities/address';
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';

interface Props {
    entity: Address;
}

const props = defineProps<Props>();

const mapContainer = ref<HTMLElement>();

const fullAddress = computed(() => {
    return `${props.entity.street}, ${props.entity.city}, ${props.entity.state} ${props.entity.zipCode}, ${props.entity.country}`;
});

async function saveEntity() {
    await props.entity.save();
    Application.changeView(Address, ViewType.LIST);
}

function cancelEdit() {
    Application.changeView(Address, ViewType.LIST);
}
</script>

<style scoped>
.split-view {
    display: flex;
    height: calc(100vh - 60px);
}

.left-pane {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.right-pane {
    flex: 1;
    padding: 24px;
    background: #f9fafb;
    border-left: 1px solid #e5e7eb;
}

.map-container {
    height: 400px;
    background: #e5e7eb;
    border-radius: 8px;
}

.map-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
    text-align: center;
}
</style>
```

```typescript
import AddressSplitDetailView from '@/views/AddressSplitDetailView.vue';

@ModuleName('Addresses')
@ModuleDetailComponent(AddressSplitDetailView)  // ← Split-pane con mapa
export class Address extends BaseEntity {
    @PropertyName('Address ID', Number)
    id!: number;
    
    @PropertyName('Street', String)
    street!: string;
    
    @PropertyName('City', String)
    city!: string;
    
    @PropertyName('State', String)
    state!: string;
    
    @PropertyName('ZIP Code', String)
    zipCode!: string;
    
    @PropertyName('Country', String)
    country!: string;
}
```

---

### 4. Inline Editing (Settings)

```vue
<!-- views/SettingsInlineDetailView.vue -->

<template>
  <div class="settings-view">
    <h2>Application Settings</h2>
    
    <div class="settings-section">
      <h3>General</h3>
      
      <div class="setting-item">
        <div class="setting-label">
          <strong>App Name</strong>
          <p>The name displayed in the navigation bar</p>
        </div>
        <input v-model="entity.appName" type="text" />
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <strong>Timezone</strong>
          <p>Default timezone for all dates and times</p>
        </div>
        <select v-model="entity.timezone">
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
        </select>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <strong>Language</strong>
          <p>Default language for the application</p>
        </div>
        <select v-model="entity.language">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>
    </div>
    
    <div class="settings-section">
      <h3>Email</h3>
      
      <div class="setting-item">
        <div class="setting-label">
          <strong>SMTP Server</strong>
          <p>Email server hostname</p>
        </div>
        <input v-model="entity.smtpServer" type="text" />
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <strong>SMTP Port</strong>
          <p>Email server port (usually 587 or 465)</p>
        </div>
        <input v-model.number="entity.smtpPort" type="number" />
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <strong>From Email</strong>
          <p>Default email address for outgoing messages</p>
        </div>
        <input v-model="entity.fromEmail" type="email" />
      </div>
    </div>
    
    <div class="actions">
      <button @click="saveEntity" class="btn-primary">Save Settings</button>
      <button @click="resetSettings" class="btn-secondary">Reset to Defaults</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Settings from '@/entities/settings';

interface Props {
    entity: Settings;
}

const props = defineProps<Props>();

async function saveEntity() {
    await props.entity.save();
    alert('Settings saved successfully');
}

function resetSettings() {
    if (confirm('Reset all settings to default values?')) {
        // Reset logic
    }
}
</script>

<style scoped>
.settings-view {
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
}

.settings-section {
    margin-bottom: 32px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #e5e7eb;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-label {
    flex: 1;
}

.setting-label p {
    margin-top: 4px;
    font-size: 14px;
    color: #6b7280;
}

.setting-item input,
.setting-item select {
    width: 300px;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
}
</style>
```

```typescript
import SettingsInlineDetailView from '@/views/SettingsInlineDetailView.vue';

@ModuleName('Settings')
@ModuleDetailComponent(SettingsInlineDetailView)  // ← Inline settings editor
export class Settings extends BaseEntity {
    @PropertyName('Settings ID', Number)
    id!: number;
    
    @PropertyName('App Name', String)
    appName!: string;
    
    @PropertyName('Timezone', String)
    timezone!: string;
    
    @PropertyName('Language', String)
    language!: string;
    
    smtpServer!: string;
    smtpPort!: number;
    fromEmail!: string;
}
```

---

### 5. Dashboard-Style Detail View

```vue
<!-- views/OrderDashboardDetailView.vue -->

<template>
  <div class="order-dashboard">
    <div class="dashboard-header">
      <h2>Order #{{ entity.orderNumber }}</h2>
      <div class="order-status" :class="entity.status">
        {{ entity.status }}
      </div>
    </div>
    
    <div class="dashboard-grid">
      <!-- Customer Info Card -->
      <div class="dashboard-card">
        <h3>Customer</h3>
        <p><strong>{{ entity.customerName }}</strong></p>
        <p>{{ entity.customerEmail }}</p>
        <p>{{ entity.customerPhone }}</p>
      </div>
      
      <!-- Shipping Info Card -->
      <div class="dashboard-card">
        <h3>Shipping</h3>
        <p>{{ entity.shippingAddress }}</p>
        <p>{{ entity.shippingCity }}, {{ entity.shippingState }}</p>
        <p>{{ entity.shippingZipCode }}</p>
      </div>
      
      <!-- Payment Info Card -->
      <div class="dashboard-card">
        <h3>Payment</h3>
        <p>Method: {{ entity.paymentMethod }}</p>
        <p>Status: {{ entity.paymentStatus }}</p>
        <p class="total">Total: ${{ entity.total }}</p>
      </div>
      
      <!-- Timeline Card -->
      <div class="dashboard-card timeline-card">
        <h3>Order Timeline</h3>
        <div class="timeline">
          <div class="timeline-item">
            <span class="date">{{ formatDate(entity.createdAt) }}</span>
            <span class="event">Order Placed</span>
          </div>
          <div class="timeline-item" v-if="entity.paidAt">
            <span class="date">{{ formatDate(entity.paidAt) }}</span>
            <span class="event">Payment Confirmed</span>
          </div>
          <div class="timeline-item" v-if="entity.shippedAt">
            <span class="date">{{ formatDate(entity.shippedAt) }}</span>
            <span class="event">Shipped</span>
          </div>
        </div>
      </div>
      
      <!-- Items Table -->
      <div class="dashboard-card items-card">
        <h3>Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in entity.items" :key="item.id">
              <td>{{ item.productName }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ item.price }}</td>
              <td>${{ item.quantity * item.price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="actions">
      <button @click="updateStatus" class="btn-primary">Update Status</button>
      <button @click="printOrder" class="btn-secondary">Print</button>
      <button @click="closeOrder">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Order from '@/entities/order';
import { Application } from '@/models/application';
import { ViewType } from '@/enums/view_type';

interface Props {
    entity: Order;
}

const props = defineProps<Props>();

function formatDate(date: Date): string {
    return date.toLocaleDateString();
}

async function updateStatus() {
    // Update logic
}

function printOrder() {
    window.print();
}

function closeOrder() {
    Application.changeView(Order, ViewType.LIST);
}
</script>

<style scoped>
.order-dashboard {
    padding: 24px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.order-status {
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
}

.order-status.pending {
    background: #fef3c7;
    color: #92400e;
}

.order-status.shipped {
    background: #dbeafe;
    color: #1e40af;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.dashboard-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.items-card {
    grid-column: 1 / -1;
}

.total {
    font-size: 20px;
    color: #2563eb;
    font-weight: 700;
}
</style>
```

```typescript
import OrderDashboardDetailView from '@/views/OrderDashboardDetailView.vue';

@ModuleName('Orders')
@ModuleDetailComponent(OrderDashboardDetailView)  // ← Dashboard cards
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Order Number', String)
    orderNumber!: string;
    
    customerName!: string;
    customerEmail!: string;
    customerPhone!: string;
    shippingAddress!: string;
    shippingCity!: string;
    shippingState!: string;
    shippingZipCode!: string;
    paymentMethod!: string;
    paymentStatus!: string;
    total!: number;
    status!: string;
    createdAt!: Date;
    paidAt?: Date;
    shippedAt?: Date;
    items!: any[];
}
```

---

## ⚠️ Consideraciones Importantes

### 1. DetailView MUST Accept Entity Prop

```typescript
// El componente DetailView personalizado recibe entity como prop
interface Props {
    entity: EntityClass;
}

const props = defineProps<Props>();

// Acceder a propiedades del entity
<input v-model="props.entity.name" type="text" />
```

### 2. Save and Cancel Actions

```typescript
// Proveer forma de guardar y cancelar
async function saveEntity() {
    try {
        await props.entity.save();
        Application.changeView(EntityClass, ViewType.LIST);
    } catch (error) {
        console.error('Save failed:', error);
        alert('Failed to save entity');
    }
}

function cancelEdit() {
    Application.changeView(EntityClass, ViewType.LIST);
}
```

### 3. Form Validation

```typescript
// Validar antes de guardar
async function saveEntity() {
    const isValid = await props.entity.validate();
    
    if (!isValid) {
        alert('Please fix validation errors');
        return;
    }
    
    await props.entity.save();
    Application.changeView(EntityClass, ViewType.LIST);
}
```

### 4. Testing ModuleDetailComponent

```typescript
describe('Product ModuleDetailComponent', () => {
    it('should have custom detail component', () => {
        const detailComponent = Product.getModuleDetailComponent();
        expect(detailComponent).toBe(ProductTabbedDetailView);
    });
    
    it('should render tabs instead of default form', () => {
        const product = new Product();
        const wrapper = mount(ProductTabbedDetailView, {
            props: { entity: product }
        });
        
        expect(wrapper.findAll('.tab').length).toBe(4);
    });
});
```

### 5. Performance with Complex Forms

```typescript
// Usar computed para valores derivados
const fullAddress = computed(() => {
    return `${props.entity.street}, ${props.entity.city}`;
});

// Lazy load tabs para mejorar performance
const activeTab = ref('basic');

<TabComponent name="images" v-if="activeTab === 'images'">
    <!-- Solo cargar cuando el tab está activo -->
</TabComponent>
```

---

## 📚 Referencias Adicionales

- `module-list-component-decorator.md` - Componente para ListView
- `module-default-component-decorator.md` - Componente default por propiedad
- `module-custom-components-decorator.md` - Componentes personalizados
- `../../03-application/application-views.md` - Sistema de vistas
- `../../02-base-entity/base-entity-core.md` - getModuleDetailComponent()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/module_detail_component_decorator.ts`  
**Líneas:** ~20
