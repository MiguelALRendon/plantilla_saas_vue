# ModuleDetailComponent Decorator

## 1. Propósito

El decorador `@ModuleDetailComponent` define el componente Vue personalizado que reemplaza completamente la vista de detalle (DetailView) estándar del framework para renderizar el formulario de edición y creación de entidades específicas de un módulo. Este decorador proporciona control total sobre la interfaz de edición de datos, permitiendo customización de layout, organización de campos, acciones personalizadas, y flujos de trabajo específicos del módulo sin estar limitado a la estructura y comportamiento del componente default_detailview.vue estándar del framework.

La precedencia de este decorador es absoluta a nivel de vista completa: cuando está definido, el framework renderiza el componente custom en lugar del DetailView estándar, ignorando completamente la renderización automática de campos basada en metadata. Esto contrasta con `@ModuleCustomComponents` y `@ModuleDefaultComponent` que controlan componentes de inputs individuales property-by-property dentro del DetailView estándar; ModuleDetailComponent reemplaza ENTIRE DetailView incluyendo layout, estructura, navegación entre campos, y lógica de presentación, proporcionando granularidad whole-view level versus property-level.

Los casos de uso principales incluyen: tabbed layouts con múltiples secciones organizadas en tabs (Basic Info, Description, Images, SEO) para formularios complejos con muchos campos agrupados por categoría facilitando navegación y reduciendo cognitive load; multi-step wizards con proceso guiado  secuencial (Basic Info → Account Settings → Permissions → Review) para onboarding de usuarios, configuración inicial de sistemas complejos o procesos que requieren validación step-by-step antes de continuar; split-pane layouts con dual panels left-right como formulario de dirección con preview de mapa simultáneo, editor de contenido con vista previa en vivo side-by-side, o configuración con documentation panel; inline editors estilo settings/configuration con key-value pairs en formato lista con edición inmediata sin necesidad de buscar campos en formulario tradicional; dashboard-style views para entidades complejas como órdenes mostrando cards con customer info, shipping details, payment status, timeline de eventos e items table organizados como dashboard comprehensivo. El decorador permite implementar UX específica del dominio que no es posible con formularios genéricos automáticos del framework.

## 2. Alcance

### Responsabilidades

- Definir el componente Vue que renderiza ENTIRE DetailView para el módulo, reemplazando completamente la pantalla de edición/creación de entidades incluyendo layout completo, campos, acciones, y lógica de presentación
- Almacenar la referencia al componente en metadata usando el Symbol `MODULE_DETAIL_COMPONENT_KEY` a nivel de clase para acceso durante resolución de vistas en Router
- Proporcionar el accessor `getModuleDetailComponent()` tanto estático como de instancia en BaseEntity para consultar el componente DetailView del módulo desde Router y Application
- Integrarse con el sistema de routing del framework en la resolución de vistas para renderizar el componente custom DetailView cuando `ViewType.DETAIL` es activo en lugar del default_detailview.vue estándar
- Reemplazar completamente default_detailview.vue con control total sobre estructura del form, posicionamiento de campos, agrupación, tabs, wizards, layouts custom, acciones personalizadas, validación inline específica

### Límites

- No afecta la renderización de ListView; el componente custom solo aplica a DetailView (formulario de edición/creación), ListView usa su propio sistema con `@ModuleListComponent` decorator como responsabilidad separada
- No controla componentes de inputs individuales property-by-property; si se mantiene el DetailView estándar y solo se necesita customizar inputs específicos, usar `@ModuleCustomComponents` o `@ModuleDefaultComponent` que operan a nivel de property-level dentro del form estándar
- No realiza validación automática de datos; el componente custom DetailView es responsable únicamente de UI y presentación, la validación se ejecuta mediante `entity.validate()` llamado explícitamente en save handler
- No proporciona acciones save/cancel automáticas; el componente DetailView custom DEBE implementar manualmente handlers para guardar con `entity.save()`, cancelar navegando con `Application.changeView()`, y delete con `entity.delete()` si aplicable
- No maneja routing automático; el componente DEBE llamar explícitamente `Application.changeView(EntityClass, ViewType.LIST)` para navegar de regreso a ListView después de save/cancel/delete, el framework no navega automáticamente
- No maneja state management ni reactivity automáticamente; el componente es responsable de definir refs, computed properties, y reactive state necesario para tracking de tabs activos, validation errors, wizard steps, loading states, etc.

## 3. Definiciones Clave

### MODULE_DETAIL_COMPONENT_KEY

Symbol único que identifica la metadata del componente DetailView custom del módulo. Se almacena a nivel de clase (no en prototype) como `Product[MODULE_DETAIL_COMPONENT_KEY] = ProductTabbedDetailView`. Este Symbol proporciona el access point para consultar el componente DetailView desde los accessors de BaseEntity y desde el sistema de Router view resolution en Application que determina qué componente renderizar cuando la ruta activa requiere DetailView.

### getModuleDetailComponent()

Accessor estático definido en BaseEntity que retorna el componente DetailView custom del módulo o `undefined` si no está configurado y debe usar default_detailview.vue. Implementación: `return (this as any)[MODULE_DETAIL_COMPONENT_KEY]`. También existe versión de instancia que delega al método estático: `constructor.getModuleDetailComponent()`. Permite consultar el componente desde cualquier contexto durante la resolución de vistas en Router para determinar si renderizar custom DetailView o default DetailView del framework.

Ubicación: líneas ~240-260 de `src/entities/base_entitiy.ts`.

### Entity Prop Requirement

Contrato obligatorio que TODOS los componentes DetailView custom DEBEN cumplir: aceptar prop `entity` de tipo specific entity class (Product, User, Order, etc.) que recibe la instancia de BaseEntity activa para edición o creación. El componente accede a propiedades del entity con `props.entity.name`, `props.entity.price`, etc., y modifica valores directamente mediante v-model: `<input v-model="props.entity.name" />`. El framework pasa la entidad activa vía `:entity="currentEntity"` donde currentEntity es la instancia que se está editando (existing record) o nueva instancia vacía (create new record). El componente distingue entre edit/create mode consultando `!props.entity.id` para saber si es nuevo.

### Application.changeView()

Método del singleton Application para navegar entre vistas cambiando la vista activa de la aplicación. Signatura: `Application.changeView(EntityClass: typeof BaseEntity, viewType: ViewType, entity?: BaseEntity)`. Parámetros: EntityClass es la clase de entidad (Product, User), viewType es ViewType.LIST o ViewType.DETAIL, entity opcional es la instancia específica para DetailView. Uso en DetailView custom: después de save exitoso llamar `Application.changeView(Product, ViewType.LIST)` para navegar a ListView, después de cancel llamar igual para volver sin guardar, después de delete navegar a ListView después de confirmación. Este método actualiza `Application.View.value` reactive property que dispara re-render del Router component.

### ViewType Enum

Enumeración que define los tipos de vista disponibles en el framework. Valores: `ViewType.LIST` para ListView (tabla de registros del módulo), `ViewType.DETAIL` para DetailView (formulario de edición/creación single record). El Router usa ViewType para determinar qué componente renderizar: si es LIST renderiza ModuleListComponent custom o default_listview.vue, si es DETAIL renderiza ModuleDetailComponent custom o default_detailview.vue. El ViewType activo se almacena en `Application.View.value.type` y se consulta en computed properties del Router para rendering condicional: `v-if="isListView"` donde `isListView = computed(() => Application.View.value?.type === ViewType.LIST)`.

### default_detailview.vue vs Custom DetailView

El framework proporciona `default_detailview.vue` como componente estándar que renderiza automáticamente formularios basados en metadata de decorators: itera sobre `entity.getEditableProperties()` para obtener lista de propiedades visibles, para cada propiedad determina el componente de input usando resolución chain (ModuleCustomComponents → Type-based → ModuleDefaultComponent → TextInput fallback), renderiza dinámicamente con `<component :is="resolvedComponent" v-model="entity[propertyName]" />`, proporciona botones Save/Cancel automáticos con handlers estándar, aplica estilos genéricos form layout vertical. ModuleDetailComponent custom REEMPLAZA completamente este componente permitiendo layout custom, agrupación de campos, tabs, wizards, validación inline específica, acciones adicionales, y cualquier lógica de presentación no soportada por el formulario automático genérico.

### Tabbed Layouts with TabControllerComponent

Pattern de UI usando componentes TabControllerComponent y TabComponent (framework components) para organizar formularios complejos en múltiples pestañas. Estructura: `<TabControllerComponent v-model="activeTab">` wrapper que maneja estado del tab activo, múltiples `<TabComponent name="basic" title="Basic Info">` children con contenido de cada tab, activeTab reactive ref determina qué tab se muestra. Uso típico: productos con tabs Basic Info (name, SK, price), Description (short/full description, features), Images (main image, gallery), SEO (meta title, meta description, keywords). Beneficios: reduce cognitive load mostrando subset de campos por vez, agrupa campos relacionados lógicamente, mejora navegación en formularios con 10+ campos.

### Multi-Step Wizards

Pattern de UI para guided sequential process dividiendo formulario complejo en multiple steps con navegación linear forward/backward. Implementación: array de step titles `['Basic Info', 'Account', 'Permissions', 'Review']`, reactive ref `currentStep = ref(0)` tracking paso activo, renderizado condicional `v-if="currentStep === 0"` para mostrar contenido del paso actual, botones Previous/Next con handlers que incrementan/decrementan currentStep con validación, botón Save en último step que ejecuta `entity.save()`. Uso típico: onboarding de usuarios con info personal → account settings → permissions → review final, configuración de sistemas complejos con 4-5 steps requeridos antes de activación, procesos que requieren validación step-level antes de permitir avanzar al siguiente.

### Split-Pane Layouts

Pattern de UI con dual panels left-right mostrando contenido relacionado side-by-side. Implementación: CSS flex/grid con dos divs `.left-pane` y `.right-pane`, left-pane contiene formulario con inputs editables, right-pane contiene preview/context/visualization sincronizada con left. Uso típico: formulario de dirección con Google Maps preview del lado derecho mostrando ubicación mientras usuario escribe, editor de contenido markdown/HTML con preview rendered del lado derecho en tiempo real, configuración con documentation panel explicando cada setting mientras usuario edita valores. Beneficios: contexto visual inmediato sin necesidad de cambiar views, validación visual instantánea de input (dirección en mapa confirma que es correcta), mejora UX proporcionando información adicional sin cluttering form.

### Inline Editors (Settings Style)

Pattern de UI para key-value pair editing con configuración/settings presentados como lista vertical de items editables inline sin formulario tradicional. Estructura: cada setting es un div horizontal con label/description del lado izquierdo y input/select del lado derecho, sin necesidad de buscar campo en formulario scroll, cambios se guardan con botón Save global al final. Uso típico: application settings (app name, timezone, language, theme), SMTP configuration (server, port, credentials), feature flags (enable/disable features boolean toggles), preferences con muchas opciones key-value. Beneficios: scanning rápido de todas las opciones disponibles, edición directa sin clutter de formulario tradicional, descripción help text integrada con cada setting para contexto inmediato.

### Dashboard-Style Views

Pattern de UI para visualización comprehensiva de entidad compleja usando cards layout estilo dashboard con múltiples secciones informativas. Implementación: CSS grid `display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` para responsive cards layout, múltiples divs `.dashboard-card` cada uno mostrando subset de información (customer info, shipping details, payment status, timeline, items table), minimal editing inline con focus en visualización. Uso típico: órdenes de ecommerce con customer card, shipping card, payment card, timeline de eventos, tabla de items, todos visibles simultáneamente; projects dashboard con team members card, milestones timeline, budget chart, tasks table organized como dashboard; user profiles con personal info card, activity timeline, permissions list, statistics cards. Beneficios: visualización holística de entidad compleja sin tabs ni scrolling extensivo, información related agrupada visualmente en cards, layout responsive que se adapta a screen size.

## 4. Descripción Técnica

### Implementación del Decorador

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

La función decoradora recibe un parámetro `component` de tipo `Component` (tipo de Vue para componentes SFC) y retorna un `ClassDecorator` que se ejecuta cuando TypeScript procesa la clase decorada. La implementación almacena directamente la referencia al componente en la clase target usando el Symbol como key: `(target as any)[MODULE_DETAIL_COMPONENT_KEY] = component`. No hay conversión ni procesamiento adicional, solo storage directo de la referencia para acceso posterior durante view resolution.

Ubicación: `src/decorations/module_detail_component_decorator.ts` líneas ~1-20

### Metadata Storage

```typescript
// Metadata se guarda en la clase (no en prototype)
Product[MODULE_DETAIL_COMPONENT_KEY] = ProductTabbedDetailView;
User[MODULE_DETAIL_COMPONENT_KEY] = UserWizardForm;
Order[MODULE_DETAIL_COMPONENT_KEY] = OrderDashboardDetailView;
```

El componente DetailView se almacena a nivel de clase como propiedad directa usando el Symbol como key. Esta estructura permite que cada entidad tenga su propio componente DetailView independiente de otras entidades. El acceso es O(1) mediante el Symbol key.

### BaseEntity Accessors

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

BaseEntity proporciona dos accessors: el método estático accede directamente a la metadata de la clase usando el Symbol key y retorna `Component | undefined`; el método de instancia delega al método estático obteniendo el constructor de la instancia y llamando a su método estático. Esto permite consultar el componente tanto desde contexto de clase (`Product.getModuleDetailComponent()`) como desde instancia (`productInstance.getModuleDetailComponent()`).

Ubicación: líneas ~240-260 de `src/entities/base_entitiy.ts`.

### Router View Resolution Integration

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

El Router component del framework usa computed properties para determinar qué componente renderizar basado en la vista activa almacenada en `Application.View.value`. Para DetailView: obtiene la entityClass activa, consulta `entityClass.getModuleDetailComponent()` para verificar si hay componente custom, si existe lo retorna, si no retorna `DefaultDetailView` como fallback. El rendering es dinámico con `<component :is="currentDetailViewComponent" />` que Vue resuelve al componente actual, pasando `:entity="currentEntity"` prop con la instancia de BaseEntity activa para edición o creación. El conditional `v-else` renderiza DetailView cuando `isListView` es false (ViewType.DETAIL activo).

[Continuaré debido a límite de caracteres...]
      
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

## 5. Flujo de Funcionamiento

### Proceso de Resolución de DetailView

```
1. Usuario navega a DetailView
        ↓
2. Application.changeView(Product, ViewType.DETAIL, entityInstance) ejecutado
        ↓
3. Router computed property `currentDetailViewComponent` evaluado
        ↓
4. Router llama Product.getModuleDetailComponent()
        ↓
5. ¿Existe componente custom?
        ↓ SI
   Renderiza custom component
        ↓
6. Pasa entity instance como prop: <component :entity="currentEntity" />
        ↓
7. Componente custom mounted, tiene acceso a props.entity
        ↓
8. Usuario edita campos (v-model="props.entity.propertyName")
        ↓
9. Usuario click botón Save
        ↓
10. await props.entity.save() ejecutado
        ↓
11. Application.changeView(Product, ViewType.LIST) navega a ListView
```

### Flujo Sin Custom Component

```
        ↓ NO (paso 5)
   Renderiza default_detailview.vue
        ↓
   Itera sobre entity.getEditableProperties()
        ↓
   Resuelve componente de input por propiedad
        ↓
   Renderiza formulario automático vertical
```

---

## 6. Reglas Obligatorias

### Arquitectura y Estructura

**OBLIGATORIO 6.1:** El componente DetailView custom DEBE aceptar prop `entity` de tipo specific entity class (Product, User, Order, etc.). Sin esta prop, el componente no puede acceder a los datos de la instancia actual.

**OBLIGATORIO 6.2:** El decorador DEBE aplicarse a nivel de clase DESPUÉS de otros decoradores de módulo. Orden correcto: `@ModuleName` → `@ModuleIcon` (opcional) → `@ModuleListComponent` (opcional) → `@ModuleDetailComponent` → definición de clase.

**OBLIGATORIO 6.3:** El componente custom DEBE importar tipos TypeScript necesarios: `import type { EntityClass } from '@/entities/EntityClass'` para typing de prop entity.

### Interacción con Datos

**OBLIGATORIO 6.4:** El componente DEBE modificar entity properties directamente usando v-model: `<input v-model="props.entity.propertyName" />`. NO crear copias locales de datos excepto para computaciones derivadas.

**OBLIGATORIO 6.5:** El componente DEBE llamar explícitamente `await props.entity.save()` en save handler. El framework NO ejecuta save automáticamente.

**OBLIGATORIO 6.6:** El componente DEBE manejar errores de save con try/catch mostrando feedback al usuario mediante toasts o mensajes inline cuando `entity.save()` falla.

### Navegación y Lifecycle

**OBLIGATORIO 6.7:** El componente DEBE navegar explícitamente después de save/cancel/delete usando `Application.changeView(EntityClass, ViewType.LIST)`. El framework NO navega automáticamente.

**OBLIGATORIO 6.8:** El componente DEBE proveer botón Cancel que navega a ListView SIN guardar cambios: `Application.changeView(EntityClass, ViewType.LIST)`.

**OBLIGATORIO 6.9:** El componente DEBE distinguir entre edit/create mode consultando `!props.entity.id` cuando sea necesario mostrar UI diferente para creating vs editing.

### Validación

**OBLIGATORIO 6.10:** El componente DEBE ejecutar validación antes de save llamando `await props.entity.validateInputs()` o confiando en validación automática durante `entity.save()`.

**OBLIGATORIO 6.11:** El componente DEBE mostrar errores de validación al usuario accediendo a `entity.validationErrors` y renderizando mensajes junto a campos inválidos.

---

## 7. Prohibiciones

### Anti-Patterns de Props

**PROHIBIDO 7.1:** NO aceptar entity como múltiples props individuales (`name`, `price`, `description`). DEBE recibir entity instance completa como single prop `entity`.

**PROHIBIDO 7.2:** NO mutar la prop entity reemplazándola completamente (`props.entity = newEntity`). SOLO modificar properties individuales (`props.entity.name = 'New Name'`).

**PROHIBIDO 7.3:** NO crear copias deep de entity (`const copy = JSON.parse(JSON.stringify(props.entity))`). Trabajar directamente con entity instance para mantener reactivity.

### Anti-Patterns de Persistencia

**PROHIBIDO 7.4:** NO ejecutar save sin validación previa. DEBE validar datos antes de guardar para prevenir datos inválidos en backend.

**PROHIBIDO 7.5:** NO ignorar errores de save silenciosamente. DEBE mostrar feedback al usuario cuando save falla con mensaje descriptivo del error.

**PROHIBIDO 7.6:** NO guardar automáticamente en onChange sin confirmación del usuario. El usuario DEBE ejecutar acción explícita (click botón Save) para persistir cambios.

### Anti-Patterns de Navegación

**PROHIBIDO 7.7:** NO usar Vue Router directamente (`router.push()`). DEBE usar `Application.changeView()` que mantiene state sincronizado con Application singleton.

**PROHIBIDO 7.8:** NO navegar antes de completar save asíncrono. DEBE await `entity.save()` antes de llamar `Application.changeView()` para asegurar persistencia completa.

**PROHIBIDO 7.9:** NO mantener usuario en DetailView después de save exitoso sin razón. DEBE navegar automáticamente a ListView después de save success salvo casos específicos (save and continue editing).

### Anti-Patterns de UI

**PROHIBIDO 7.10:** NO usar decoradores de metadata (@ViewGroup, @ViewGroupRow, @TabOrder) esperando que se apliquen automáticamente. Estos decoradores solo funcionan en default_detailview.vue; custom components DEBEN implementar layout manualmente.

**PROHIBIDO 7.11:** NO renderizar todos los tabs/steps simultáneously con display:none. DEBE usar v-if para lazy loading de contenido pesado (imágenes, charts) optimizando performance.

**PROHIBIDO 7.12:** NO hardcodear labels de campos en el template. DEBE usar `entity.getPropertyName('propertyKey')` para obtener labels dinámicos desde metadata manteniendo consistencia con decoradores @PropertyName.

---

## 8. Dependencias

### Decoradores del Framework

- `@ModuleName`: Define nombre del módulo. DEBE aplicarse antes de @ModuleDetailComponent para identificación correcta del módulo en Router.
- `@ModuleIcon`: Define icono del módulo. Opcional pero recomendado para consistencia visual en SideBar y TopBar.
- `@PropertyName`: Define nombres de propiedades para labels. ComponenteDetailView puede acceder via `entity.getPropertyName(key)` para labels dinámicos.

### Componentes Vue

- `BaseEntity`: Clase base de la entity que contiene métodos `save()`, `delete()`, `validateInputs()`, accessors de metadata.
- `TabControllerComponent`: Componente del framework para UI de tabs. Ubicación: `src/components/TabControllerComponent.vue`. Usado en tabbed layouts custom.
- `TabComponent`: Componente hijo de TabController para contenido de cada tab. Ubicación: `src/components/TabComponent.vue`.

### Application Singleton

- `Application.changeView()`: Método para navegación entre vistas. Signatura: `changeView(EntityClass, ViewType, entity?)`.
- `Application.View.value`: Reactive property con vista activa. Estructura: `{ entityClass, type, entity }`.
- `Application.ApplicationUIService.showToast()`: Método para mostrar notificaciones toast. Usado para feedback de save/delete success/error.

### Tipos y Enums

- `ViewType`: Enum con valores `LIST` y `DETAIL`. Importar: `import { ViewType } from '@/enums/view_type'`.
- `Component`: Tipo TypeScript de Vue para componentes SFC. Importar: `import type { Component } from 'vue'`.

### Metadata Symbols

- `MODULE_DETAIL_COMPONENT_KEY`: Symbol para almacenar componente DetailView en metadata de clase. Definido en `src/decorations/module_detail_component_decorator.ts`.

---

## 9. Relaciones

### Relación con @ModuleListComponent

`@ModuleListComponent` define el componente custom para ListView (tabla de registros del módulo), mientras `@ModuleDetailComponent` define el componente custom para DetailView (formulario de edición/creación). Son decoradores complementarios independientes: ambos pueden coexistir en la misma entity class con custom ListView y custom DetailView, o uno solo puede estar presente usando default para el otro. No tienen dependencia directa entre ellos; el Router resuelve cada uno independientemente según el ViewType activo. Típicamente módulos complejos personalizan ambas vistas para UX coherente.

### Relación con @ModuleDefaultComponent

`@ModuleDefaultComponent` define el componente de input default para TODAS las propiedades de una entity DENTRO del default_detailview.vue estándar (property-level customization), mientras `@ModuleDetailComponent` reemplaza COMPLETAMENTE el DetailView incluyendo layout y estructura (whole-view customization). Son mutuamente exclusivos en scope: si se usa @ModuleDetailComponent, el decorador @ModuleDefaultComponent NO aplica porque default_detailview.vue no se renderiza; el custom DetailView es responsable de renderizar inputs manualmente. Usar @ModuleDefaultComponent cuando se desea mantener formulario automático estándar pero cambiar componente de input para todas las propiedades; usar @ModuleDetailComponent cuando se necesita control total sobre layout y estructura del formulario.

### Relación con @ModuleCustomComponents

`@ModuleCustomComponents` define componentes de input personalizados para propiedades ESPECÍFICAS DENTRO del default_detailview.vue estándar (selective property-level customization), mientras `@ModuleDetailComponent` reemplaza COMPLETAMENTE el DetailView (whole-view customization). Si se usa @ModuleDetailComponent, el decorador @ModuleCustomComponents NO aplica porque default_detailview.vue no se renderiza; el custom DetailView debe importar y usar componentes de input manualmente si se desean componentes personalizados. Usar @ModuleCustomComponents cuando se desea formulario automático estándar con inputs custom para algunas propiedades (ej: `price` usa PriceInputComponent custom pero otras propiedades usan inputs default); usar @ModuleDetailComponent cuando se necesita layout custom completo donde los inputs se posicionan manualmente según diseño específico.

### Relación con metadata decorators (@ViewGroup, @ViewGroupRow)

`@ViewGroup` y `@ViewGroupRow` son decoradores que controlan agrupación y layout de campos DENTRO del default_detailview.vue estándar (FormGroupComponent, FormRowTwoItems rendering automático), mientras `@ModuleDetailComponent` reemplaza default_detailview.vue completamente. Si se usa @ModuleDetailComponent, los decoradores @ViewGroup y @ViewGroupRow NO aplican automáticamente; el custom DetailView es responsable de implementar agrupación y layout manualmente si se desea organización visual similar. El custom component puede leer metadata de @ViewGroup via `entity.getViewGroup(key)` y @ViewGroupRow via `entity.getViewGroupRow(key)` para replicar lógica de agrupación programáticamente, pero el rendering automático de FormGroupComponent del default view no está disponible; debe implementarse manualmente.

### Relación con Router y Application

El Router es el consumidor principal del decorador: durante rendering del DetailView, el Router ejecuta computed property `currentDetailViewComponent` que call `entityClass.getModuleDetailComponent()` para obtener custom component o fallback a default_detailview.vue. Application.changeView() es el entry point de navegación que user code (custom DetailView save/cancel handlers) llama para trigger navigation updates; changeView actualiza `Application.View.value` reactive property que causa re-evaluation de computed properties del Router. El flujo completo es: custom DetailView click Save → `Application.changeView(EntityClass, ViewType.LIST)` → `Application.View.value` updated → Router computed re-evaluated → Router renderiza ListView.

---

## 10. Notas de Implementación

### Performance Optimization con Lazy Loading

Para componentes DetailView con tabs o wizards conteniendo contenido pesado (imágenes, charts, tablas grandes), usar v-if lazy loading en lugar de v-show para evitar renderizar todos los tabs/steps del DOM simultáneamente. Pattern: `<TabComponent name="images" v-if="activeTab === 'images'">` solo renderiza contenido cuando tab está activo. Esto reduce initial render time significativamente para formularios complejos con 5+ tabs cada uno con múltiples imágenes o visualizaciones. Considerar usar Suspense para async components en tabs lazy loaded mostrando skeleton/spinner mientras se cargan.

### Validación Inline Específica del Dominio

Custom DetailViews son ideales para implementar validación inline específica del dominio que no es posible con decoradores @Validation genéricos. Ejemplos: mostrar warning cuando price está debajo del cost indicando pérdida potencial, validar que fecha de envío no sea anterior a fecha de orden mostrando error inmediatamente, calcular y mostrar profit margin en tiempo real mientras usuario edita cost/price, validar formato de address con API externa mostrando sugerencias de autocompletado. Implementar usando watchers sobre props.entity properties ejecutando lógica de validación custom y actualizando reactive error messages.

### State Management para UI Complejo

Custom DetailViews con UI complejo (tabs, wizards, modals, accordions) requieren state management local usando Vue reactive refs. Pattern recomendado: `const activeTab = ref('basic')`, `const currentStep = ref(0)`, `const isUploading = ref(false)`, `const validationErrors = reactive({})`. Este state es local al componente y NO debe persistirse en entity instance; es state UI temporal que se resetea cuando componente desmonta. Evitar polluting entity instance con UI state (NO hacer `props.entity._activeTab = 'basic'`); mantener separation clara entre entity data state y UI state.

### Reutilización de Inputs del Framework

Custom DetailViews pueden reutilizar componentes de input del framework (TextInputComponent, NumberInputComponent, ObjectInputComponent) importándolos y usándolos manualmente en lugar de reimplementar inputs desde cero. Pattern: `import TextInputComponent from '@/components/Form/TextInputComponent.vue'`, luego `<TextInputComponent :entity="props.entity" :entityClass="ProductClass" propertyKey="name" v-model="props.entity.name" />`. Esto mantiene consistencia visual y funcional con default views (same validation, help text, disabled logic) mientras permite layout custom. Útil para custom layouts que solo reorganizan campos existentes sin cambiar comportamiento de inputs individuales.

### Testing de Custom DetailViews

Custom DetailViews requieren unit tests verificando: component accepts entity prop correctamente, v-model bindings actualizan entity properties, save handler llama entity.save() y navigation, cancel handler navega sin guardar, validation errors se muestran correctamente. Usar vitest/jest con @vue/test-utils mounting component con mock entity instance: `const wrapper = mount(CustomDetailView, { props: { entity: mockProduct } })`. Verificar `wrapper.emitted()` para eventos, `mockProduct.save` para llamadas a métodos, `Application.changeView` para navegación (mock Application singleton). Tests aseguran que custom view mantiene contrato esperado por el framework.

### Acceso a Metadata de Decoradores

Aunque custom DetailViews no usan rendering automático, pueden acceder a metadata de decoradores para decisiones dinámicas. Ejemplos: `entity.getPropertyName('price')` para labels consistentes con @PropertyName, `entity.isRequired('email')` para marcar campos required visually, `entity.getHelpText('password')` para mostrar help text custom, `entity.isDisabled('id')` para deshabilitar inputs según @Disabled. Esto mantiene single source of truth en decoradores evitando duplicación de metadata en template del custom component. Access pattern: todos los metadata accessors están disponibles en BaseEntity como métodos de instancia.

---

## 11. Referencias Cruzadas

### Decoradores Relacionados

- [module-list-component-decorator.md](module-list-component-decorator.md): Componente custom para ListView complementando DetailView customization.
- [module-default-component-decorator.md](module-default-component-decorator.md): Componente default de input para customization property-level alternativa a whole-view customization.
- [module-custom-components-decorator.md](module-custom-components-decorator.md): Componentes custom selectivos para propiedades específicas dentro de default DetailView.
- [module-name-decorator.md](module-name-decorator.md): Nombre del módulo requerido para identificación en Router.
- [module-icon-decorator.md](module-icon-decorator.md): Icono del módulo para UI elements opcional pero recomendado.

### Base Entity y Metadata

- [../../02-base-entity/base-entity-core.md](../../02-base-entity/base-entity-core.md): Documentación de `getModuleDetailComponent()` accessor y otros métodos de BaseEntity used by framework.
- [../../02-base-entity/metadata-accessors.md](../../02-base-entity/metadata-accessors.md): Todos los accessors de metadata disponibles para custom components (`getPropertyName`, `isRequired`, `getHelpText`, etc.).

### Application y Routing

- [../../03-application/application-singleton.md](../../03-application/application-singleton.md): Documentación de `Application.changeView()` y `Application.View.value` reactive property.
- [../../03-application/router-integration.md](../../03-application/router-integration.md): Sistema de resolución de vistas en Router y computed properties para component selection.
- [../../03-application/ui-services.md](../../03-application/ui-services.md): `ApplicationUIService.showToast()` para notifications y feedback user.

### Componentes del Framework

- [../../04-components/TabControllerComponent.md](../../04-components/TabControllerComponent.md): Componente de tabs usado en tabbed layout custom DetailViews.
- [../../04-components/text-input-component.md](../../04-components/text-input-component.md): Input component reutilizable en custom DetailViews para consistency.
- [../../04-components/default-detail-view.md](../../04-components/default-detail-view.md): DetailView estándar que @ModuleDetailComponent reemplaza; útil para contrasting features.

### Tutoriales y Ejemplos

- [../../tutorials/01-basic-crud.md](../../tutorials/01-basic-crud.md): CRUD básico usando default DetailView como baseline antes de customization.
- [../../examples/advanced-module-example.md](../../examples/advanced-module-example.md): Ejemplo completo de módulo con custom DetailView tabbed layout.

---

## Consideraciones Importantes

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

## Referencias Adicionales

- `module-list-component-decorator.md` - Componente para ListView
- `module-default-component-decorator.md` - Componente default por propiedad
- `module-custom-components-decorator.md` - Componentes personalizados
- `../../03-application/application-views.md` - Sistema de vistas
- `../../02-base-entity/base-entity-core.md` - getModuleDetailComponent()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/module_detail_component_decorator.ts`  
**Líneas:** ~20
