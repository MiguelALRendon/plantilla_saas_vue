# ModuleName Decorator

## 1. Propósito

El decorador `@ModuleName` define los nombres singular y plural del módulo de entidad, determinando cómo se presenta textualmente a través de toda la interfaz de usuario de la aplicación en múltiples contextos de navegación, encabezados, breadcrumbs, botones de acción y mensajes al usuario. Este es el decorador de clase más fundamental del sistema de módulos, transformando una entity class técnica (Product, Customer, Order con nombres de código) en un módulo navegable con etiquetas amigables para usuarios finales (Products/Product, Customers/Customer, Orders/Order) que aparecen consistentemente en todos los componentes UI del framework.

El propósito central es establecer la identidad textual del módulo mediante dos formas gramaticales: singular utilizado en contextos de entidad individual (formulario "Edit Customer", botón "New Product", header "Order Details"), y plural utilizado en contextos de colección múltiples registros (sidebar navigation "Customers", ListView header "Products", breadcrumb "Orders"). El decorador almacena esta metadata usando MODULE_NAME_KEY Symbol en prototype de la entity class, proporcionando accessors getModuleName(), getModuleNameSingular(), getModuleNamePlural() que UI components consultan reactivamente para displaying consistent labeling throughout application maintaining brand identity user comprehension clarity.

Los casos de uso principales incluyen: sidebar navigation menu donde module names plurales aparecen como navigation items clickeables permitiendo usuarios browse available modules quickly scanning visual hierarchy; ListView headers displaying plural form contextualizing que user está viendo list of múltiples entities not single record; DetailView headers displaying singular form when editing creating individual record ("Edit Product" no "Edit Products" confusing); action buttons creation flows "New Customer" singular suggesting single entity creation not batch operation; breadcrumbs navigation trails showing plural form module level ("Home / Customers / John Doe") maintaining hierarchical context; delete confirmation dialogs "Delete this Customer?" singular specific instance; toast notifications success messages "Product saved successfully" singular entity-specific feedback; document title browser tabs "Customers - MyApp" plural module context.

Beneficios operacionales: user experience improved clarity users immediately understand whether viewing list or editing single entity grammatical cues singular/plural natural language patterns familiar intuitive, internationalization support different languages proper singular/plural forms español "Cliente/Clientes" inglés "Customer/Customers" français "Client/Clients" grammatical correctness maintained, brand identity consistent terminology throughout application all developers using same labels no ad-hoc hardcoded strings scattered codebase centralized metadata single source truth, maintenance simplified changing module name one decorator propagates everywhere no search-replace error-prone manual string updates hundreds files, accessibility screen readers read proper labels meaningfully descriptive not technical class names Product → "Products" human-readable improving inclusivity WCAG compliance better experience assistive technology users.

## 2. Alcance

### Responsabilidades

- Definir nombres singular y plural del módulo mediante decorator parameters strings almacenados metadata providing human-readable labels entity class
- Almacenar ModuleNameMetadata object containing singular/plural properties en prototype usando MODULE_NAME_KEY Symbol efficient O(1) lookup during rendering
- Proporcionar accessor methods getModuleName() retornando object complete, getModuleNameSingular() retornando string singular only, getModuleNamePlural() retornando string plural only unified API consistent access patterns
- Integrarse con SideBarComponent rendering navigation menu items displaying plural forms module names users scanning available modules clickable navigation
- Integrarse con DefaultListView/DefaultDetailView headers breadcrumbs action buttons displaying appropriate singular/plural forms contextually correct grammatical usage
- Integrarse con Router generating routes paths URLs potentially using module names readable URL structures user-friendly bookmarkable
- Proporcionar fallback behavior default values cuando decorator no aplicado returning class name technical fallback "Product" class → "Product/Products" simple pluralization avoiding broken UI missing labels

### Límites

- No afecta funcionalidad backend API endpoints; module names puramente UI presentation metadata not transmitted API requests no impact database schemas backend logic
- No genera rutas automáticamente; Router puede usar module names pero routing configuration separate concern ModuleName solo provides labels not routing logic navigation flows
- No valida unicidad nombres; developer responsable ensuring cada module tiene unique distinguishable name conflicts avoided manual verification
- No maneja internacionalización directamente; decorator acepta strings cualquier idioma pero translation switching i18n integration external concern developer implements separately using translation keys if needed
- No sincroniza con ModuleIcon/ModulePermission; esos decorators independent orthogonal concerns naming/iconography/authorization separate metadata coordinated but not coupled directly
- No controla capitalización; developer define exact strings including capitalization style Title Case sentence case lowercase uppercase convention project-specific decorator stores provided strings unchanged

## 3. Definiciones Clave

### MODULE_NAME_KEY

Symbol único que identifica metadata de module name almacenada en prototype de entity class. Implementación: `export const MODULE_NAME_KEY = Symbol('module_name')`. Storage: `Product.prototype[MODULE_NAME_KEY] = { singular: 'Product', plural: 'Products' }`. Este Symbol proporciona collision-free key metadata storage evitando conflicts con properties métodos reales entity protegiendo namespace integrity. Prototype-level storage (all instances share) porque module name type-level metadata no instance-specific data efficiency memory single copy shared.

### ModuleNameMetadata Interface

TypeScript interface defining structure module name metadata object. Implementación: `export interface ModuleNameMetadata { singular: string; plural: string; }`. Properties: singular string forma singular entity name ("Product", "Customer", "Order"), plural string forma plural module name ("Products", "Customers", "Orders"). Simple object structure two properties easy serialize deserialize type-safe TypeScript ensures correctness compile-time. Usado return type getModuleName() accessor consistently typed across codebase.

### getModuleName()

Accessor estático BaseEntity retornando ModuleNameMetadata object complete con singular/plural properties. Implementación: `public static getModuleName(): ModuleNameMetadata { const metadata = this.prototype[MODULE_NAME_KEY]; return metadata || { singular: this.name, plural: `${this.name}s` }; }`. Ubicación: src/entities/base_entitiy.ts líneas ~85-90. Fallback behavior: if decorator NO aplicado, returns class name como singular ("Product") y agrega 's' simple pluralization ("Products") default acceptable English pero incorrect irregular plurals (Person→Persons should be People) prompting developer apply decorator explicitly proper forms. Usage: `Product.getModuleName() // → { singular: 'Product', plural: 'Products' }`.

### getModuleNameSingular()

Accessor estático convenience method retornando solo string singular extrayendo de getModuleName() result. Implementación: `public static getModuleNameSingular(): string { return this.getModuleName().singular; }`. Ubicación: src/entities/base_entitiy.ts líneas ~95-97. Simplifies common pattern needing only singular form avoiding object destructuring boilerplate `Product.getModuleNameSingular() // → 'Product'` clean concise API. Used extensively DetailView headers action buttons contexts displaying individual entity singular form grammatically correct.

### getModuleNamePlural()

Accessor estático convenience method retornando solo string plural extrayendo de getModuleName() result. Implementación: `public static getModuleNamePlural(): string { return this.getModuleName().plural; }`. Ubicación: src/entities/base_entitiy.ts líneas ~100-102. Simplifies pattern needing only plural form `Product.getModuleNamePlural() // → 'Products'` clean expressive. Used extensively SideBarComponent navigation items, ListView headers, breadcrumbs contexts displaying collection múltiples entities plural form grammatically correct natural language patterns.

### SideBarComponent Integration

Componente UI principal que consume module name metadata para renderizar navigation menu items displaying plural forms. Implementación: itera Application.ModuleList.value array registered entity classes, para cada entityClass extrae `entityClass.getModuleNamePlural()` string, renderiza sidebar-item div con icon + name text clickeable navigation. Template pattern: `<div v-for="entityClass in Application.ModuleList.value" class="sidebar-item" @click="navigateToModule(entityClass)"><span class="icon">{{ entityClass.getModuleIcon() }}</span><span class="name">{{ entityClass.getModuleNamePlural() }}</span></div>`. Ubicación: src/components/SideBarComponent.vue líneas ~45-60. Dependencia ModuleName decorator critical sidebar wouldn't know what text display modules requiring decorator applied all user-facing modules mandatory.

### DefaultListView/DefaultDetailView Integration

Framework default view components consuming module name metadata headers. DefaultListView header: `<h1>{{ entityClass.getModuleNamePlural() }}</h1>` displaying plural form list context ("Products"). Create button: `<button @click="createNew">+ New {{ entityClass.getModuleNameSingular() }}</button>` singular form creation action. DefaultDetailView header: `<h1>{{ isNewRecord ? 'New' : 'Edit' }} {{ entityClass.getModuleNameSingular() }}</h1>` singular form individual record editing. Ubicación: src/views/default_listview.vue líneas ~25-40, src/views/default_detailview.vue líneas ~18-30. Pattern consistent across framework ensuring grammatical correctness singular/plural usage contextually appropriate user comprehension natural flow.

### Fallback Default Behavior

Cuando entity class NO tiene @ModuleName decorator aplicado, getModuleName() retorna fallback default: `{ singular: this.name, plural: ${this.name}s }` using class name técnico simple 's' pluralization. Example: `class Product extends BaseEntity {}` (no decorator) → getModuleName() returns `{ singular: 'Product', plural: 'Products' }` acceptable English. Limitations: irregular plurals incorrect (Person → Persons should People, Child → Childs should Children), non-English languages broken (País → Paíss should Países), technical class names exposed users (PurchaseOrder → PurchaseOrders instead "Purchase Order/Orders" readable). Fallback exists preventing broken UI NPM errors но developer SHOULD apply decorator explicitly proper forms all user-facing modules production quality UX.

## 4. Descripción Técnica

### Implementación del Decorador

```typescript
// src/decorations/module_name_decorator.ts

/**
 * Symbol para almacenar metadata de module name
 */
export const MODULE_NAME_KEY = Symbol('module_name');

/**
 * Interface defining module name metadata structure
 */
export interface ModuleNameMetadata {
    singular: string;  // "Product"
    plural: string;    // "Products"
}

/**
 * @ModuleName() - Define nombres singular y plural del módulo
 * 
 * @param singular - Nombre singular del módulo
 * @param plural - Nombre plural del módulo
 * @returns ClassDecorator
 */
export function ModuleName(singular: string, plural: string): ClassDecorator {
    return function <T extends Function>(target: T) {
        const proto = target.prototype;
        
        // Almacenar metadata en prototype
        proto[MODULE_NAME_KEY] = {
            singular: singular,
            plural: plural
        };
        
        return target;
    };
}
```

Decorador function accepting two string parameters singular/plural retornando ClassDecorator. Implementation simple: accesses target.prototype, creates ModuleNameMetadata object con properties provided, stores usando MODULE_NAME_KEY Symbol collision-free key. No validation parameters assuming developer provides correct strings. Return target maintaining class reference chainability allowing multiple decorators stacked. Ubicación: src/decorations/module_name_decorator.ts líneas ~10-35.

### Metadata Storage en Prototype

```typescript
// Metadata stored in prototype (all instances share)
Product.prototype[MODULE_NAME_KEY] = { singular: 'Product', plural: 'Products' };
Customer.prototype[MODULE_NAME_KEY] = { singular: 'Customer', plural: 'Customers' };
Order.prototype[MODULE_NAME_KEY] = { singular: 'Order', plural: 'Orders' };
```

Storage prototype-level (not class directly) porque metadata type-level no instance-specific todos instances heredan mismo module name efficiency single copy memory shared. Lookup: `Product.prototype[MODULE_NAME_KEY]` returns object O(1) access efficient. Symbol key prevents collisions property names real entity properties methods namespace protected.

### BaseEntity Accessors Implementation

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene metadata completa de module name (método estático)
 * 
 * @returns ModuleNameMetadata object con singular y plural
 */
public static getModuleName(): ModuleNameMetadata {
    const metadata = this.prototype[MODULE_NAME_KEY];
    
    // Fallback: usar class name si no hay decorator
    return metadata || {
        singular: this.name,
        plural: `${this.name}s`
    };
}

/**
 * Obtiene solo nombre singular del módulo (método estático)
 * 
 * @returns String singular form
 */
public static getModuleNameSingular(): string {
    return this.getModuleName().singular;
}

/**
 * Obtiene solo nombre plural del módulo (método estático)
 * 
 * @returns String plural form
 */
public static getModuleNamePlural(): string {
    return this.getModuleName().plural;
}
```

Three static accessor methods BaseEntity: getModuleName() returns complete object, getModuleNameSingular()/getModuleNamePlural() convenience extractors returning specific strings. Fallback logic getModuleName() handles missing decorator gracefully returning sensible default avoiding errors but prompting developer apply decorator properly. Ubicación: src/entities/base_entitiy.ts líneas ~85-102. All entity classes inherit accessors automatically BaseEntity inheritance unified API consistent.

### SideBarComponent Usage Example

```vue
<!-- src/components/SideBarComponent.vue -->

<template>
  <div class="sidebar">
    <div 
      v-for="entityClass in Application.ModuleList.value" 
      :key="entityClass.name"
      class="sidebar-item"
      :class="{ 'active': isActiveModule(entityClass) }"
      @click="navigateToModule(entityClass)"
    >
      <span class="icon">
        <component :is="getIconComponent(entityClass)" />
      </span>
      
      <span class="name">
        {{ entityClass.getModuleNamePlural() }}  <!-- Plural form -->
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';
import { IconService } from '@/services/icon_service';

function getIconComponent(entityClass: typeof BaseEntity) {
    const iconName = entityClass.getModuleIcon();
    return IconService.getIcon(iconName);
}

function isActiveModule(entityClass: typeof BaseEntity): boolean {
    return Application.View.value.entityClass === entityClass;
}

function navigateToModule(entityClass: typeof BaseEntity) {
    Application.changeView(entityClass, ViewType.LIST);
}
</script>
```

SideBarComponent itera Application.ModuleList displaying each module navigation item. Calls `entityClass.getModuleNamePlural()` obtaining plural form text displayed user. Icon integration getIconComponent using ModuleIcon decorator coordination. Click handler navigateToModule triggers Application.changeView routing ListView. Active state highlighting isActiveModule comparing Application.View current entity class CSS class applied sidebar-item visual feedback. Ubicación: src/components/SideBarComponent.vue ~70 líneas complete component preserved.

### DefaultListView Header Example

```vue
<!-- src/views/default_listview.vue -->

<template>
  <div class="list-view">
    <div class="header">
      <h1>{{ entityClass.getModuleNamePlural() }}</h1>  <!-- "Products" -->
      
      <button @click="createNew" class="create-button">
        + New {{ entityClass.getModuleNameSingular() }}  <!-- "New Product" -->
      </button>
    </div>
    
    <div class="list-content">
      <!-- Tabla o grid de registros -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';
import { ViewType } from '@/enums/view_type';

const entityClass = computed(() => Application.View.value?.entityClass);

function createNew() {
    const NewEntity = new entityClass.value();
    Application.changeView(entityClass.value, ViewType.DETAIL, NewEntity);
}
</script>
```

DefaultListView header usa plural form `getModuleNamePlural()` contextualizing list múltiples entities ("Products" list header). Create button usa singular form `getModuleNameSingular()` action creating single entity ("New Product" button label) grammatically correct natural language. Ubicación: src/views/default_listview.vue líneas ~25-50.

### DefaultDetailView Header Example

```vue
<!-- src/views/default_detailview.vue -->

<template>
  <div class="detail-view">
    <div class="header">
      <h1>
        {{ isNewRecord ? 'New' : 'Edit' }} 
        {{ entityClass.getModuleNameSingular() }}  <!-- "New Customer" or "Edit Customer" -->
      </h1>
    </div>
    
    <div class="form-content">
      <!-- Formulario de campos -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';

const entityClass = computed(() => Application.View.value?.entityClass);
const entity = computed(() => Application.View.value?.entity);
const isNewRecord = computed(() => !entity.value?.id);
</script>
```

DetailView header usa singular form `getModuleNameSingular()` porque editing/creating individual single entity ("Edit Customer", "New Product") contextually appropriate singular grammatical correctness. isNewRecord computed determines "New" vs "Edit" prefix based entity.id existence. Ubicación: src/views/default_detailview.vue líneas ~18-40.

### Breadcrumbs Navigation Example

```vue
<!-- Breadcrumbs component -->

<template>
  <nav class="breadcrumbs">
    <span class="breadcrumb-item">Home</span>
    <span class="separator">/</span>
    
    <span class="breadcrumb-item">
      {{ entityClass.getModuleNamePlural() }}  <!-- "Customers" -->
    </span>
    
    <span v-if="isDetailView">
      <span class="separator">/</span>
      <span class="breadcrumb-item">
        {{ isNewRecord ? 'New' : entity.getPrimaryPropertyValue() }}
      </span>
    </span>
  </nav>
</template>
```

Breadcrumbs trail usa plural form module level ("Home / Customers") because referencing module category collection level no single entity. DetailView adds specific entity identifier (primary property value or "New") third level trail. Hierarchical context maintained grammatical forms appropriate each level.

(Additional examples de uso: Document title, confirmation dialogs, toast notifications, error messages - todos preservados archivo original ~80-120 líneas examples detailed comprehensive usage patterns)

## 5. Flujo de Funcionamiento

**Fase 1: Decoración (Design-Time)**

Developer aplica `@ModuleName('Customer', 'Customers')` decorator a entity class durante TypeScript development. Compiler procesa decorator execution: decorator function recibe singular/plural parameters strings, accesses target.prototype reference, creates ModuleNameMetadata object `{ singular: 'Customer', plural: 'Customers' }`, stores object prototype[MODULE_NAME_KEY] Symbol key collision-free safe. Metadata immutable después decoración persiste toda application lifecycle no runtime modifications. Multiple entities pueden decorated independently cada one storing own unique names metadata isolated per class prototype separation concerns.

**Fase 2: Application Initialization y Module Registration**

Durante app startup main.ts, entity classes importadas: `import { Customer} from '@/entities/customer'`. Application.ts registers modules: `Application.ModuleList.value.push(Customer, Product, Order)` array contains all registered entity class references. Framework NO procesa module names immediately registration solo almacena class references array. Metadata permanece inerte prototypes until UI components need display names on-demand lazy resolution avoiding upfront processing overhead unnecessary cuando sidebar not yet rendered user hasn't navigated any views.

**Fase 3: Sidebar Rendering (First Display)**

SideBarComponent mounts when application loads. Template executes v-for loop iterating `Application.ModuleList.value` array registered entity classes. For each entityClass iteration: template expression `{{ entityClass.getModuleNamePlural() }}` evaluates calling static accessor method, getModuleNamePlural() internally calls getModuleName() retrieving prototype[MODULE_NAME_KEY] metadata returning ModuleNameMetadata object, extracts plural property string ("Customers"), Vue renders string text span.name element, complete sidebar item rendered icon + name clickeable user. Process repeats cada entity class ModuleList resulting complete navigation menu populated proper labels meaningful user-readable text no technical class names exposed.

**Fase 4: User Navigation Trigger**

User clicks sidebar item Customer module. Click handler executes `@click="navigateToModule(entityClass)"` passing Customer class reference. Handler runs `Application.changeView(Customer, ViewType.LIST)` updating Application.View reactive ref `{ entityClass: Customer, type: ViewType.LIST, entity: null }`. Vue reactivity detects Application.View change propagating updates todos computed properties watching View including Router currentListViewComponent determining which view component render. Active state sidebar updates isActiveModule re-evaluates comparing Application.View.entityClass con cada sidebar item entityClass highlighting Customer item CSS class 'active' visual feedback current module selected.

**Fase 5: ListView Rendering con Module Name**

Router renders currentListViewComponent resolving DefaultListView mounting component. Template evaluates header: `<h1>{{ entityClass.getModuleNamePlural() }}</h1>` where entityClass computed returns Application.View.value.entityClass (Customer class reference). Expression calls Customer.getModuleNamePlural() retrieving 'Customers' plural form string. Vue renders "Customers" h1 element header displayed user. Create button renders: `<button>+ New {{ entityClass.getModuleNameSingular() }}</button>` calling Customer.getModuleNameSingular() retrieving 'Customer' singular form. Button displays "+ New Customer" grammatically correct action label. User sees ListView header "Customers", button "New Customer", breadcrumb "Home / Customers" all leveraging ModuleName metadata consistent labeling.

**Fase 6: DetailView Navigation y Singular Form Usage**

User clicks "+ New Customer" button. Handler executes `Application.changeView(Customer, ViewType.DETAIL, new Customer())` updating Application.View type DETAIL passing new empty instance. Router switches currentDetailViewComponent rendering DefaultDetailView. Template header evaluates: `<h1>{{ isNewRecord ? 'New' : 'Edit' }} {{ entityClass.getModuleNameSingular() }}</h1>`. isNewRecord computed checks entity.id undefined returning true "New" path. Expression calls Customer.getModuleNameSingular() retrieving 'Customer' singular. Header renders "New Customer" h1 element. User fills form clicks Save. After save success, toast notification displays `"Customer saved successfully"` using singular form entity-specific feedback. User returns ListView via breadcrumb click cycling back plural form context.

## 6. Reglas Obligatorias

1. **ModuleName MUST be defined for all user-facing modules**: Cualquier entity class que aparece sidebar navigation menu MUST tener @ModuleName decorator aplicado explicitly. Framework fallback exists technical class names pero production quality applications require proper human-readable labels UX clarity professionalism. Pattern: `@ModuleName('Product', 'Products') export class Product extends BaseEntity {}` mandatory user-facing entities. Exception: internal utility classes NO renderizadas UI (BaseEntity abstract, helpers) pueden omitir decorator sin issue.

2. **Singular and plural forms MUST be grammatically distinct**: Usar mismo valor ambos parameters causa confusión users cannot distinguish context ("Data" / "Data" ambiguous). MUST provide different forms proper grammatical correctness: "Data Entry" / "Data Entries", "Data Record" / "Data Records". Evitar lazy same-string both parameters violates principle clear communication grammatical natural language patterns users expect familiar intuitive.

3. **Handle irregular plurals correctly non-English languages**: Simple 's' añadido plural NO suficiente muchos casos languages complex rules. Inglés irregular: "Person" / "People" NOT "Persons", "Child" / "Children" NOT "Childs", "Foot" / "Feet" NOT "Foots". Español tildes: "Acción" / "Acciones", "País" / "Países". Developer MUST research correct forms consulting grammar dictionaries native speakers ensuring accuracy avoiding embarrassing obvious errors production hurting brand credibility professionalism perception quality.

4. **Maintain capitalización consistency project-wide**: Select capitalization style stick consistently across todos modules. Inglés Title Case typical: "Purchase Order" / "Purchase Orders" each word capitalized professional formal. Español sentence case normal: "Orden de compra" / "Órdenes de compra" only first word capitalized natural conversational. Consistency important visual coherence brand identity avoiding mixed styles (some Title Case others lowercase) appearing amateurish unpolished confusion users inconsistent presentation standards unclear.

5. **Ensure unique module names avoid duplicates**: Cada module debe have distinguishable unique name preventing confusion navigation collisions. Duplicates prohibited: Customer entity decorated "User" / "Users", Employee entity also decorated "User" / "Users" collision sidebar shows two items identical text impossible distinguish which module. Developer responsible manual verification auditing module names ensuring uniqueness clear differentiation "Customer" vs "Employee", "Product" vs "Product Catalog" distinct meanings purposes clarity navigation understanding.

6. **Keep names concise readable avoid excessive length**: Module names appear constrained spaces sidebar navigation menu limited horizontal width. Extremely long names overflow wrapping breaking layout readability poor: "Customer Relationship Management Record" excesivo sidebar cramped. Prefer concise alternatives: "CRM Record", "Customer Record", "Client" shorter better preserving clarity while respecting space constraints. Balance precision brevity names short enough fit comfortably long enough meaningful self-descriptive context sufficient understanding fast scanning navigation.

## 7. Prohibiciones

1. **NO usar emojis en module names**: Aunque tempting añadir emojis visual flair (`@ModuleName('📦 Product', '📦 Products')`), PROHIBIDO because: inconsistent rendering across browsers/platforms/OSs variation appearance confusing unpredictable, screen readers poor support describing emojis vaguely accessibility WCAG violations, copy/paste errors Unicode characters similar pero different code points subtle bugs hard debug, professional presentation most business applications conservative formal avoiding playful decorative elements inappropriate contexts serious enterprise software. Use ModuleIcon decorator proper iconography visual representation separated text labels clean professional.

2. **NO hardcodear module names inline templates scattered**: Centralizar names via decorator single source truth evitando hardcoded strings `<h1>Products</h1>` scattered hundreds components templates creating maintenance nightmare. Pattern obligatorio usar accessor: `<h1>{{ entityClass.getModuleNamePlural() }}</h1>` dynamic references metadata. Benefits: changing name one place decorator propagates automatically everywhere no search-replace hundreds files error-prone manual updates missing instances, consistency guaranteed all references pull same metadata single authoritative source no divergence drift typos variations different developers, refactoring easier renaming module trivial decorator change versus hunting scattered string literals entire codebase riesgo missing instances.

3. **NO asumir pluralización automática suficiente**: Fallback default `${this.name}s` simple 's' añadido INSUFICIENTE many languages irregular plurals. Developer NO debe rely fallback production confiar decorator explicit proper forms. Fallback exists safety net preventing errors development pero NOT substitute proper grammatical forms production quality. Always apply decorator explicitly researching correct forms especialmente non-English languages complex grammatical rules pluralization gender agreements accents tildes requiring native speaker knowledge linguistic expertise ensuring correctness avoiding obvious errors embarrassing mistakes hurting brand perception quality professionalism credibility users notice errors judge quality poorly.

4. **NO mezclar idiomas dentro single name inconsistency**: Module name debe ser entirely one language no mixing Spanglish Franglais combining words different languages confusing unprofessional appearing careless low-quality incompetent inconsistent sloppy. Incorrect: "Customer Registro", "Orden Order", "Usuario User" mixed. Correct: fully Spanish "Registro de Cliente" / "Registros de Clientes" or fully English "Customer Record" / "Customer Records" consistent language choice throughout. If multilingual application support needed, use i18n translation keys decorator values potentially translatable strings not hardcoded mixed-language hybrids unacceptable production violating language purity consistency standards professional communications established conventions properly maintained systems.

5. **NO crear nombres ambiguos confusing overlapping meanings**: Module names debe claramente distinguish different entities avoiding vague generic ambiguous labels overlapping semantic territories confusing users which module select context unclear purpose meaning uncertain. Bad examples: "Data" vague what kind data?, "Records" generic all modules have records distinction lacking, "Items" meaningless everything item contextless. Good examples: "Products" clear physical goods catalog, "Customers" clear client contacts people, "Invoices" clear billing documents financial transactions. Specificity important clarity disambiguation semantic precision terminología domain-appropriate meaningful contextually relevant self-descriptive labels requiring minimal cognitive load users immediately understand purpose entity type module represents cognitive ease usability improved.

6. **NO omitir decorator confiando fallback technical class names**: Fallback default using class name técnico `Product` → ` Product` / `Products` exists preventing crashes errors pero NOT excuse laziness skipping decorator proper labels. Production quality applications REQUIRE decorator explicitly aplicado all user-facing modules professional polished UX clarity user comprehension brand identity. Technical class names often inappropriate user display: PurchaseOrder unfriendly no spaces, APIKeyRegistration acronym confusing abbreviations unclear, InventoryAdjustmentLineItem verboso technical jargon frightening non-technical users. Apply decorator translating technical names readable friendly labels: "Purchase Order" / "Purchase Orders", "API Key" / "API Keys", "Inventory Adjustment" / "Inventory Adjustments" simple clear understandable users various technical literacy levels inclusive accessible broad audience.

## 8. Dependencias e Integraciones

### BaseEntity
Import MODULE_NAME_KEY Symbol y proporciona getModuleName() /getModuleNameSingular()/getModuleNamePlural() accessors estáticos retornando metadata strings fallback default behavior. Ubicación src/entities/base_entitiy.ts líneas ~85-102. Todos entity classes inherit accessors automatically BaseEntity base class unified API consistent dependency foundational framework architecture inherited capabilities.

### Application.ModuleList
Reactive ref Vue array containing registered entity class references. Ubicación src/models/application.ts. Population during app initialization `Application.ModuleList.value.push(Customer, Product)` registration sequence. SideBarComponent iterates ModuleList displaying each registered module using getModuleNamePlural() accessor navigation menu items. Registration establishes available modules application-wide visible users navigation accessible functionality coordinated Application singleton central state management.

### SideBarComponent
Principal UI consumer module name metadata. Ubicación src/components/SideBarComponent.vue. Itera Application.ModuleList calling getModuleNamePlural() cada entityClass rendering sidebar-item navigation menu displaying plural forms clickeable items user interaction navigation triggers. Dependency critical SideBarComponent wouldn't know text display modules requiring ModuleName decorator mandatory user-facing modules avoiding broken sidebar empty labels technical class names unreadable users poor UX.

### DefaultListView / DefaultDetailView
Framework default view components consuming module name metadata headers buttons actions. DefaultListView usa getModuleNamePlural() header list context Create button usa getModuleNameSingular() action label. DefaultDetailView usa getModuleNameSingular() header form editing single entity context. Ubicación src/views/default_listview.vue líneas ~25-50, src/views/default_detailview.vue líneas ~18-40. Pattern consistent grammatical correctness contextually appropriate forms natural language clarity user comprehension improved UX familiar patterns.

### Router Integration (Optional)
Router potentially usa module names generating URL paths readable bookmarkable SEO-friendly routes `/customers` `/products` deriving from getModuleNamePlural() lowercase URL-safe format. Implementation optional project-specific configuration Router accessing entityClass metadata constructing paths dynamically. Ubicación src/router/index.ts integration pattern coordination ModuleName providing source data routing decisions URL generation.

### ModuleIcon / ModulePermission Decorators
Related decorators independent orthogonal concerns. ModuleIcon define visual icon SideBarComponent displays icon + name together coordinated presentation. ModulePermission define authorization access control sidebar filtering permitted modules only. Decorators NO depend cada other directly but work together complete module identity (name + icon + permissions) coordinated whole integrated UX sidebar display navigation access control combined functionality seamless experience.

### ViewType Enum
Enum defining view types constants: `export enum ViewType { LIST = 'list', DETAIL = 'detail' }`. Used Application.View.value.type discriminating current view context determining which name form usar: LIST context getModuleNamePlural(), DETAIL context getModuleNameSingular() grammatical correspondence view type name form appropriate matching semantics types clear separation concerns.

### Document Title / Breadcrumbs / Toast Notifications
Additional UI elements consuming module name metadata. Document title browser tab `document.title = ${entityClass.getModuleNamePlural()} - MyApp` displaying current module context SEO browser history bookmarks. Breadcrumbs navigation trail showing module level plural form hierarchical context. Toast notifications success/error messages using singular form entity-specific feedback "Product saved successfully" clear meaningful user confirmation feedback loops notifications informative contextual appropriate.

## 9. Relaciones con Otros Elementos

### Con ModuleIcon Decorator
**Relación Complementaria Visual Identity**: ModuleName defines text labels, ModuleIcon defines visual icon companion. Together complete module identity: SideBarComponent renders `<icon />{{ name }}` combining both metadatas integrated presentation visual + textual identity coherent brand recognition. Sin ModuleName module tendría icon sin label (confusing ambiguous), sin ModuleIcon tendría label sin visual distinction generic circle placeholder (functional pero less polished professional). Best practice aplicar AMBOS decorators all user-facing entities complete identity clear recognizable distinguishable.

### Con ModulePermission Decorator
**Independent Orthogonal Authorization**: ModulePermission controla access authorization CRUD capabilities role-based filtering, ModuleName controla presentation labels text. No dependencia funcional directa: permissions pueden hide modules sidebar checking `hasPermission()` filtering ModuleList before iteration rendering only permitted modules accessible user role, pero hiding complete item including name wholesale filter. Name NO cambia based permissions (user limited permisos ve mismo name que admin consistency recognition patterns identity preserved). Coordination filtering using name display consistent remaining modules visible authorized.

### Con Application.ModuleList Registration
**Prerequisite Array Population**: ModuleList MUST contain entity classes antes SideBarComponent itera rendering menu. Registration sequence main.ts/application.ts pushes classes array establishing registered modules available. ModuleName decorator metadata remains inactive until referenced sidebar iteration accessors called on-demand. Registration establishes "what modules exist", ModuleName establishes "how modules named displayed", separate concerns coordinated timing sequence initialization rendering phase order dependencies clear Application setup before UI rendering.

### Con DefaultListView / DefaultDetailView Components
**Primary Consumers Header Display**: Default views main consumers after SideBarComponent using names headers contextualizing current view. ListView plural form collection context, DetailView singular form individual entity context grammatical correspondence view type context semantics matched appropriately. Custom views (ModuleListComponent/ModuleDetailComponent decorators) SHOULD also usar module name accessors maintaining consistency custom implementations matching framework patterns conventions expectations users familiar behaviors preserved custom extensions respecting established conventions.

### Con Router y URL Generation
**Optional Integration Readable Routes**: Router PUEDE usar module names generating URL paths `/customers/123` deriving from `getModuleNamePlural().toLowerCase()` readable bookmarkable SEO-friendly URLs. Implementation optional configuration-dependent projects may prefer technical IDs `/entity/customer/123` or custom slugs `/shop/products` independent module names. If integrated, Router depends ModuleName providing source data routing decisions coordinate URL structure module identity matching paths names aligned clarity consistency browsing experience URLs meaningful memorable bookmarkable sharable distributed usable directly understandable context.

### Con PropertyName Decorator
**Different Scopes Module vs Property**: ModuleName class-level decorator entire module identity, PropertyName property-level decorator individual fields labels. No overlap responsibilities clear separation: ModuleName "Products" module category, PropertyName "Product Name" individual field dentro  form. Both contribute complete labeling hierarchy: module level "(viewing Products list)" context, property level "(editing Product Name field)" detail. Coordination hierarchical labeling complete system labels todas levels presentation user interface context clarity understanding improved structured hierarchy familiar patterns usable intuitive.

### Con Internationalization (i18n) Systems
**External Integration Translation Keys**: ModuleName decorator acepta strings potentially translation keys i18n systems: `@ModuleName('modules.product.singular', 'modules.product.plural')` keys not literal text. UI components pueden translate keys: `{{ $t(entityClass.getModuleNamePlural()) }}` if i18n configured integration pattern. Framework NO provides i18n built-in developer responsibility implement translation system external libraries (vue-i18n) coordinate decorator values keys lookups translations runtime language switching dynamic multilingual support internationalization requirements project-specific implementation patterns varying projects configurations flexible extensible architecture allowing external integrations seamless coordination.

## 10. Notas de Implementación

1. **Fallback default acceptable development NOT production**: getModuleName() returns `{ singular: this.name, plural: '${this.name}s' }` if decorator missing safety net preventing errors development testing pero NOT substitute proper decorator production. Always apply decorator explicitly especially user-facing modules production deployments professional quality. Fallback useful durante development WIP entities not yet fully configured avoiding crashes allowing iterative development gradual decorator application refinement process.

2. **Internationalization strategy translation keys recommended**: For multilingual applications, consider using translation keys decorator values instead literal strings: `@ModuleName('modules.product.singular', 'modules.product.plural')` keys referencing translation files JSON locale-specific. UI components translate keys runtime: `{{ $t(entityClass.getModuleNameSingular()) }}` accessing current locale strings. Benefits: centralized translations single files easier manage translators, language switching dynamic reactive Vue i18n propagates changes automatically, consistency terminology guaranteed translations coordinated not scattered hardcoded strings duplicated translated separately risking inconsistencies divergence drift.

3. **Testing strategy verify correctness accessors**: Unit tests should verify getModuleName() returns expected metadata: `describe('Product ModuleName', () => { it('should have correct names', () => { const names = Product.getModuleName(); expect(names.singular).toBe('Product'); expect(names.plural).toBe('Products'); }); });`. Component tests mount SideBarComponent verify rendering: `const wrapper = mount(SideBarComponent); expect(wrapper.text()).toContain('Products');` integration testing ensuring names display correctly UI compiled templates render expected output visual regression tests screenshots comparing baseline detecting unintended changes layout presentation.

4. **Naming conventions best practices research grammar**: Research correct plural forms especially non-English languages irregular plurals English Person/People Child/Children. Español consult RAE grammar rules tildes accentuation País/Países Acción/Acciones. Français liaison agreements le Client/les Clients. Português gender agreements o Produto/os Produtos. Native speaker consultation recommended avoiding obvious errors embarrassing mistakes hurting brand perception quality credibility professionalism users notice grammatical errors judge negatively quality polish attention detail care.

5. **Capitalization style selection consistency enforcement**: Select capitalization style project-wide enforce consistently: Title Case ("Purchase Order") professional formal English typical business applications, Sentence case ("Purchase order") conversational casual modern startups consumer apps, lowercase ("purchase order") minimalist tech-forward controversial readability issues longer phrases. Document style guide team alignment code reviews checking consistency PR approvals linting rules custom ESLint plugins enforcing conventions automatically preventing drift divergence ensuring coherence visual presentation brand identity professional polished.

6. **Module name length sidebar layout considerations**: Sidebar typically constrained ~200px width limited horizontal space. Long names overflow wrapping multi-line occupying excessive vertical space breaking layout alignment. Test sidebar real dimensions various screen sizes ensuring names fit comfortably without overflow: "Customer Relationship Management Record" 47 chars wraps 200px width illegible cramped. Abbreviations acronyms acceptable: "CRM Record" 10 chars fits beautifully readable clear. Balance brevity precision names short enough fit layout long enough meaningful self-descriptive context understandable scanning quickly navigation.

7. **Unique names verification auditing preventing duplicates**: Manually audit module names preventing duplicates collisions: export const MODULE_NAMES = { CUSTOMER: { singular: 'Customer', plural: 'Customers' }, PRODUCT: { singular: 'Product', plural: 'Products' } } centralized constants file reference ensuring uniqueness easily visible scannable alphabetically organized preventing accidental duplicates developers different teams working독립립ly without coordination risking collisions conflicts confusing users sidebar ambiguous items indistinguishable identical labels impossibly disambiguate which module target navigation.

8. **Dynamic formatting helpers locale-aware plurality**: Create helper functions formatting dynamically: `export function formatModuleName(entityClass: typeof BaseEntity, count: number): string { const { singular, plural } = entityClass.getModuleName(); return count === 1 ? singular : plural; }` usage `formatModuleName(Product, 5) // "Products"`, `formatModuleName(Product, 1) // "Product"` grammatically correct dynamic messages "5 Products selected" vs "1 Product selected" natural language proper grammar numbers quantities pluralization rules applied correctly automatically reducing boilerplate template logic centralized reusable utility maintainability improved consistency guaranteed.

9. **Code reuse constants file centralization optional**: Consider centralizing module names constants file avoiding string literals scattered: `export const MODULE_NAMES = { PRODUCT: { singular: 'Product', plural: 'Products' }, CUSTOMER: { singular: 'Customer', plural: 'Customers' } }; @ModuleName(MODULE_NAMES.PRODUCT.singular, MODULE_NAMES.PRODUCT.plural)` benefits single source truth easily audited searchable refactorable, trade-offs additional indirection complexity imports extra file maintenance overhead potentially unnecessary simple projects few modules. Decision project-size dependent scalability needs team preferences conventions established architectures preferred patterns.

10. **Accessibility screen readers semantic HTML labels**: Module names read aloud screen readers assistive technology users visually impaired. Ensure names meaningful descriptive context-free understandable without visual cues: "Products" clear standalone, "Items" vague ambiguous meaningless without context visual reference. Semantic HTML proper labels aria-attributes buttons links `<button aria-label="Create new product">+ New Product</button>` redundant descriptive accessible keyboard navigation screen reader users WCAG AA compliance accessibility guidelines professional inclusive design users disabilities accommodated equally supported UX equitable access fundamental human right legal requirement regulations ADA Section 508 WCAG standards.

## 11. Referencias Cruzadas

- [module-icon-decorator](./module-icon-decorator.md): Decorador ModuleIcon define visual icon complementary ModuleName text labels combined SideBarComponent rendering icon + name together complete module identity
- [module-permission-decorator](./module-permission-decorator.md): Decorador ModulePermission define authorization access control independent filtering sidebar ModuleList permitted modules only displaying accessible entities coordinated
- [property-name-decorator](./property-name-decorator.md): Decorador PropertyName property-level labels individual fields different scope ModuleName module-level class labels hierarchical labeling complete system
- [application-singleton](../03-application/application-singleton.md): Application.ModuleList reactive ref registration pattern populating entity classes SideBarComponent iteration source data coordination state management
- [sidebar-component](../04-components/sidebar-component.md): SideBarComponent principal consumer navigation menu rendering plural forms module names primary integration point UI display critical dependency
- [default-listview](../04-components/default-listview.md): DefaultListView component usando getModuleNamePlural() header plural form collection context Create button getModuleNameSingular() action singular grammatical correctness
- [default-detailview](../04-components/default-detailview.md): DefaultDetailView component usando getModuleNameSingular() header singular form individual entity editing context grammatical correspondence
- [router-integration](../03-application/router-integration.md): Router optional integration using module names URL generation readable routes `/customers` deriving from accessor lowercase format coordination
- [flow-architecture](../02-FLOW-ARCHITECTURE.md): Architecture documentation navigation flows sidebar module selection Application.changeView() view transitions coordinated system-wide patterns
- [base-entity-core](../02-base-entity/base-entity-core.md): BaseEntity implementation getModuleName() getModuleNameSingular() getModuleNamePlural() accessors líneas ~85-102 metadata retrieval fallback behavior inheritance pattern

**Ubicación código fuente**: `src/decorations/module_name_decorator.ts` (~35 líneas)  
**Símbolos y exports**: `MODULE_NAME_KEY` Symbol, `ModuleNameMetadata` interface, `ModuleName` function ClassDecorator, `getModuleName()` `getModuleNameSingular()` `getModuleNamePlural()` accessors BaseEntity  
**BaseEntity accessors líneas**: ~85-102 implementation location code reference
