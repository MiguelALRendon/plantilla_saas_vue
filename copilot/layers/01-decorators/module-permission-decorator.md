# ModulePermission Decorator

## 1. Propósito

El decorador `@ModulePermission` define el identificador de permiso requerido para acceder a un módulo de entidad, implementando control de acceso basado en roles RBAC (Role-Based Access Control) a nivel de módulo completo filtrando navigation availability based on user permissions. Este decorador proporciona layer seguridad frontend coordinando con backend authorization verificando user credentials antes permitir access module functionality viewing editing creating deleting records ensuring proper authorization enforcement preventing unauthorized access sensitive data restricted features maintaining security compliance regulatory requirements.

El propósito central es establecer permission string identifier (ej. 'products.manage', 'admin', 'users.view') almacenado metadata entity class usando MODULE_PERMISSION_KEY Symbol, proporcionando accessor methods getModulePermission() retornando permission string, hasPermission(user) method verificando if current user tiene permission required access module checking user.permissions array includes required permission returning boolean indicating authorization status allowing components conditionally render UI elements filter sidebar navigation prevent unauthorized navigation routes protecting module access comprehensive permission system.

Los casos de uso principales incluyen: sidebar navigation filtering dynamically showing only modules user has permissions access preventing navigation items appearing unauthorized users cleaner focused UI reducing cognitive load presenting only relevant authorized options; router navigation guards beforeEach hook verificando permission required target module redirecting login access-denied pages users lacking proper authorization preventing direct URL manipulation bypassing frontend protections coordinating backend enforcement; component conditional rendering showing/hiding create edit delete action buttons based permissions fine-grained UI control different users see different capabilities role-appropriate interfaces admin full controls employee limited actions customer read-only views; API request validation frontend checking permission before submitting requests backend reducing unnecessary network traffic improving UX immediate feedback permission denials avoiding silent failures confusing errors delayed responses; security audit trails logging permission checks access attempts denied permissions tracking who accessed what when accountability compliance regulatory requirements demonstrating proper authorization controls implemented effectively.

Beneficios operacionales: security improved unauthorized access prevented sensitive functionality restricted appropriate roles reducing data breach risks compliance violations regulatory penalties, user experience enhanced clean focused interfaces showing only relevant authorized features reducing confusion clutter cognitive load improved task completion efficiency, scalability supported permissions flexible granular role-based hierarchical wildcard patterns accommodating complex organizational structures multiple user types varying access levels easily managed centrally maintained, maintenance simplified permission changes propagate automatically updating UI navigation access controls without code modifications configuration-driven flexible adaptive changing requirements business rules evolving security policies, testing enableable permission scenarios easily tested mocked simulating different user roles verifying proper access control enforcement comprehensive test coverage security-critical functionality validated thoroughly.

## 2. Alcance

### Responsabilidades

- Definir permission string identifier único representando access requirement module nivel class-level metadata single permission per module
- Almacenar permission string en entity class metadata usando MODULE_PERMISSION_KEY Symbol efficient O(1) lookup authorization checks during rendering navigation
- Proporcionar accessor method getModulePermission() estático BaseEntity retornando permission string or undefined if no permission required public modules
- Proporcionar verification method hasPermission(user) estático checking if user.permissions array includes required permission boolean result authorization decision
- Integrarse con SideBarComponent filtering Application.ModuleList displaying only modules user has permission access dynamic sidebar adapting user role
- Integrarse con Router navigation guards beforeEach hook verificando permission redirecting unauthorized users login/access-denied pages preventing direct URL manipulation
- Soportar optional permission undefined caso modules public accessible without authentication open access no restrictions fallback true permission checks

### Límites

- No implementa backend authorization; decorador puramente frontend metadata UI filtering navigation control not security enforcement rely backend validation every API request
- No define permission structure hierarchies wildcards; permission simple string comparison exact match developer responsible implementing hierarchical wildcard logic external permission service if needed
- No gestiona user authentication login logout session management; assumes Application.currentUser already authenticated populated external authentication system responsibility obtaining user credentials
- No sincroniza permissions backend dynamically; permissions loaded user login stored Application.currentUser developer responsible fetching permissions API appropriately timed
- No valida permission existence registry; developer responsible ensuring permission strings referenced decorators exist backend permission definitions avoiding typos mismatches broken authorization
- No proporciona UI permission assignment interfaces; admin panel role management permission editing separate concerns external admin modules configuration tools

## 3. Definiciones Clave

### MODULE_PERMISSION_KEY

Symbol único identifica metadata module permission almacenada entity class (not prototype unlike algunos decorators). Implementación: `export const MODULE_PERMISSION_KEY = Symbol('module_permission')`. Storage: `Product[MODULE_PERMISSION_KEY] = 'products.manage'`. Este Symbol collision-free key metadata storage avoiding conflicts real properties methods namespace protected. Class-level storage (not prototype) porque permission definition única per entity type no shared instances appropriate type-level metadata describing access requirements module category.

### getModulePermission()

Accessor estático BaseEntity retornando permission string required or undefined if no permission configured. Implementación: `public static getModulePermission(): string | undefined { return (this as any)[MODULE_PERMISSION_KEY]; }`. Ubicación: src/entities/base_entity.ts líneas ~200-210. Retorno undefined explicitly nullable indicating public module no permission required allowing components distinguish between configured permissions vs missing decorator public access default. Usage: `Product.getModulePermission() // → 'products.manage'` or `PublicBlog.getModulePermission() // → undefined` checking access requirements.

### hasPermission(user)

Método estático BaseEntity verificando if user tiene permission required access module. Implementación: `public static hasPermission(user: User): boolean { const requiredPermission = this.getModulePermission(); if (!requiredPermission) return true; // Public module return user.permissions?.includes(requiredPermission) || false; }`. Ubicación: src/entities/base_entity.ts líneas ~215-225. Logic: no permission required (undefined) returns true allowing access, permission required checks user.permissions array using includes() method exact string match, missing permissions array safety nullish coalescing false default. Usage: `Product.hasPermission(currentUser) // → true/false` authorization decision boolean.

### Application.currentUser

Reactive ref Vue containing currently authenticated user object including permissions array. Ubicación: src/models/application.ts. Type: `User | null` nullable if not authenticated. User object expected structure: `{ id: number, username: string, role: string, permissions: string[] }` permissions array strings permission identifiers user granted. Application singleton manages authentication state global access current user context components accessor decorators checking permissions coordinated centrally. Updated during login storing user object logout clearing null appropriately.

### SideBarComponent Permission Filtering

Pattern filtering Application.ModuleList before rendering displaying only modules user has permission access. Implementación computed property: `const availableModules = computed(() => { const allModules = Application.ModuleList.value; const currentUser = Application.currentUser; if (!currentUser) return []; return allModules.filter(entityClass => entityClass.hasPermission(currentUser)); });` template iterates availableModules v-for rendering sidebar items dynamically adapting role. Benefits: cleaner sidebar only authorized modules visible, security UI layer preventing navigation unauthorized modules, UX improved users see only relevant options task-focused interface.

### Router Navigation Guards

Router beforeEach hook checking permissions before navigation completing redirecting unauthorized users appropriately. Implementación: `router.beforeEach((to, from, next) => { const entityClass = Application.View.value?.entityClass; if (entityClass) { const requiredPermission = entityClass.getModulePermission(); if (requiredPermission) { const currentUser = Application.currentUser; if (!currentUser) return next('/login'); if (!entityClass.hasPermission(currentUser)) return next('/access-denied'); } } next(); });`. Pattern intercepts navigation checking View.entityClass target module, verifies permission redirecting login if not authenticated access-denied if lacking permission, allows navigation next() if authorized. Ubicación: src/router/index.ts líneas ~40-60.

### Permission String Format Convention

Standard naming convention permission identifiers: lowercase dot-separated hierarchical format `<resource>.<action>` examples 'products.manage', 'users.view', 'orders.edit'. Special identifiers: 'admin' broad administrative access, 'superadmin' root-level unrestricted access, '*' wildcard all permissions universal grant. Benefits: consistent readable memorable, hierarchical structure allows wildcard matching 'products.*' includes 'products.view'/'products.edit'/ 'products.delete' if hierarchical logic implemented, backend coordination frontend permission strings match backend identifiers ensuring consistent authorization decisions across layers.

### Fallback Public Module Behavior

Modules WITHOUT @ModulePermission decorator considerados public accessible without authentication permission requirements. getModulePermission() returns undefined, hasPermission() returns true regardless user status allowing open access. Use case: public-facing content blogs marketing pages product catalogs guest browsing no authentication required. Developer explicitly applies decorator restricted modules omits public intentionally differentiating authorization requirements clear semantic distinction decorated vs undecorated.

## 4. Descripción Técnica

### Implementación del Decorador

```typescript
// src/decorations/module_permission_decorator.ts

/**
 * Symbol para almacenar metadata de module permission
 */
export const MODULE_PERMISSION_KEY = Symbol('module_permission');

/**
 * @ModulePermission() - Define permiso requerido para acceder al módulo
 * 
 * @param permission - Identificador de permiso string
 * @returns ClassDecorator
 */
export function ModulePermission(permission: string): ClassDecorator {
    return function (target: Function) {
        // Almacenar permission en class
        (target as any)[MODULE_PERMISSION_KEY] = permission;
    };
}
```

Decorador simple function accepting single permission string parameter retornando ClassDecorator. Implementation straightforward assignment: `(target as any)[MODULE_PERMISSION_KEY] = permission` storing string directly class object (not prototype). Type cast `as any` necessary TypeScript recognizing Symbol keys. No validation parameter assuming developer provides correct permission identifier matching backend definitions. Ubicación: src/decorations/module_permission_decorator.ts líneas ~1-20.

### Metadata Storage en Class

```typescript
// Metadata stored in class directly (not prototype)
Product[MODULE_PERMISSION_KEY] = 'products.manage';
User[MODULE_PERMISSION_KEY] = 'admin';
Invoice[MODULE_PERMISSION_KEY] = 'invoices.view';
Order[MODULE_PERMISSION_KEY] = 'orders.manage';
```

Storage class-level (not prototype) porque permission definition única per entity type no instance-specific todos entity types tienen same access requirements class metadata appropriate. Lookup: `Product[MODULE_PERMISSION_KEY]` returns 'products.manage' O(1) access efficient. Symbol key prevents collisions namespace protected.

### BaseEntity Accessor Implementation

```typescript
// src/entities/base_entity.ts

/**
 * Obtiene permission requerido del módulo (método estático)
 * 
 * @returns Permission string or undefined
 */
public static getModulePermission(): string | undefined {
    return (this as any)[MODULE_PERMISSION_KEY];
}

/**
 * Verifica si user tiene permission para acceder module (método estático)
 * 
 * @param user - Usuario actual
 * @returns Boolean indicating authorization
 */
public static hasPermission(user: User): boolean {
    const requiredPermission = this.getModulePermission();
    
    // No permission required → public module
    if (!requiredPermission) {
        return true;
    }
    
    // Verify user has permission
    return user.permissions?.includes(requiredPermission) || false;
}

/**
 * hasPermission instance method delegating to static
 */
public hasPermission(user: User): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.hasPermission(user);
}
```

Three methods: getModulePermission() retrieves permission string, hasPermission(user) static verifies authorization, instance method delegates static via constructor reference allowing `entity.hasPermission(user)` pattern convenience. Logic: undefined permission returns true (public), defined permission checks user.permissions array includes() exact match nullish coalescing false if array missing. Ubicación: src/entities/base_entity.ts líneas ~200-240.

### SideBarComponent Filtering Implementation

```vue
<!-- src/components/SideBarComponent.vue -->

<template>
  <div class="sidebar">
    <div 
      v-for="entityClass in availableModules" 
      :key="entityClass.name"
      class="sidebar-item"
      :class="{ 'active': isActiveModule(entityClass) }"
      @click="navigateToModule(entityClass)"
    >
      <span class="icon">
        <component :is="getIconComponent(entityClass)" />
      </span>
      
      <span class="name">
        {{ entityClass.getModuleName() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';

/**
 * Filtered module list - only modules user has permission
 */
const availableModules = computed(() => {
    const allModules = Application.ModuleList.value;
    const currentUser = Application.currentUser;
    
    // Not authenticated → no modules visible
    if (!currentUser) {
        return [];
    }
    
    // Filter by permission
    return allModules.filter(entityClass => {
        return entityClass.hasPermission(currentUser);
    });
});

function isActiveModule(entityClass: typeof BaseEntity): boolean {
    return Application.View.value.entityClass === entityClass;
}

function navigateToModule(entityClass: typeof BaseEntity) {
    Application.changeView(entityClass, ViewType.LIST);
}
</script>
```

SideBarComponent computed property availableModules filters Application.ModuleList before rendering. Not authenticated returns empty array hiding all modules requiring login. Authenticated filters allModules checking hasPermission(currentUser) cada class retaining only authorized modules. Template v-for iterates filtered list rendering only authorized sidebar items dynamic adaptation user role clean focused UI. Ubicación: src/components/SideBarComponent.vue líneas ~30-80.

### Router Navigation Guard Implementation

```typescript
// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';
import { Application } from '@/models/application';

const router = createRouter({
    history: createWebHistory(),
    routes: []  // Dynamic routes
});

/**
 * Navigation guard checking permissions
 */
router.beforeEach((to, from, next) => {
    const entityClass = Application.View.value?.entityClass;
    
    if (entityClass) {
        const requiredPermission = entityClass.getModulePermission();
        
        if (requiredPermission) {
            const currentUser = Application.currentUser;
            
            // Not authenticated → redirect login
            if (!currentUser) {
                return next('/login');
            }
            
            // No permission → redirect access denied
            if (!entityClass.hasPermission(currentUser)) {
                return next('/access-denied');
            }
        }
    }
    
    // Authorized or public → allow navigation
    next();
});

export default router;
```

Router guard intercepts every navigation attempt beforeEach hook executing before route completes. Obtains entityClass from Application.View target module, retrieves requiredPermission checking if defined, verifies currentUser authenticated exists, calls hasPermission() verification, redirects appropriately: not authenticated → '/login', lacking permission → '/access-denied', authorized → next() allows navigation completing. Pattern prevents direct URL manipulation users typing `/products` URL bypassing sidebar navigation attempting access unauthorized modules router enforces permissions comprehensively. Ubicación: src/router/index.ts líneas ~40-70.

### Component Conditional Rendering Example

```vue
<!-- Product ListView component -->

<template>
  <div class="product-list">
    <h2>Products</h2>
    
    <!-- Create button - only if permission -->
    <button 
      v-if="canCreate"
      @click="createProduct"
      class="create-button"
    >
      + New Product
    </button>
    
    <table class="product-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Price</th>
          <th v-if="canEdit || canDelete">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.id }}</td>
          <td>{{ product.name }}</td>
          <td>${{ product.price }}</td>
          <td v-if="canEdit || canDelete">
            <button v-if="canEdit" @click="editProduct(product)">Edit</button>
            <button v-if="canDelete" @click="deleteProduct(product)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Application } from '@/models/application';
import Product from '@/entities/products';

const products = ref<Product[]>([]);
const currentUser = computed(() => Application.currentUser);

const canCreate = computed(() => {
    if (!currentUser.value) return false;
    return Product.hasPermission(currentUser.value);
});

const canEdit = computed(() => {
    if (!currentUser.value) return false;
    return Product.hasPermission(currentUser.value);
});

const canDelete = computed(() => {
    if (!currentUser.value) return false;
    // Could check different permission for delete if needed
    return Product.hasPermission(currentUser.value);
});

async function loadProducts() {
    products.value = await Product.getElementList();
}

function createProduct() {
    if (canCreate.value) {
        Application.changeView(Product, ViewType.DETAIL, new Product());
    }
}

function editProduct(product: Product) {
    if (canEdit.value) {
        Application.changeView(Product, ViewType.DETAIL, product);
    }
}

async function deleteProduct(product: Product) {
    if (!canDelete.value) return;
    
    if (confirm('Delete this product?')) {
        await product.delete();
        await loadProducts();
    }
}

onMounted(() => {
    loadProducts();
});
</script>
```

Component computed properties canCreate/canEdit/canDelete check hasPermission() retornando booleans. Template v-if directives conditionally render buttons actions showing/hiding UI elements based permissions. User admin sees all buttons, manager sees edit/create no delete, employee read-only no buttons, fine-grained control UI adaptation role-appropriate interfaces. Pattern reusable across components consistent authorization checks maintainable testable. (~120 líneas code example complete preserved)

(Additional examples: Role-based permissions mapping, hierarchical permission logic wildcards, permission guard composables, API request validation, dynamic permission assignment - todos preservados archivo original ~200-300 líneas comprehensive usage patterns detailed implementations)

## 5. Flujo de Funcionamiento

**Fase 1: Decoración (Design-Time)**

Developer aplica `@ModulePermission('products.manage')` decorator a entity class Product durante TypeScript development. Compiler procesa decorator execution immediately: decorator function recibe permission string parameter, accesses target class reference (not prototype), executes assignment `(target as any)[MODULE_PERMISSION_KEY] = 'products.manage'` storing permission directly class object metadata. Metadata immutable después decoración persists application lifetime no runtime modifications. Multiple entities decorated independently each storing own unique permission requirements isolated per class security policy defined declaratively code-level configuration.

**Fase 2: Application Initialization y User Authentication**

Application starts main.ts loading entity classes importing modules. Entity classes registered Application.ModuleList: `Application.ModuleList.value.push(Product, Customer, Order)` array populated all registered modules. User authenticates login flow username/password credentials submitted backend API. Backend validates credentials returning user object including permissions array: `{ id: 1, username: 'john', role: 'manager', permissions: ['products.manage', 'orders.view', 'inventory.read'] }`. Application.currentUser populated reactive ref: `Application.currentUser = userFromAPI` storing authenticated user globally accessible. Permission metadata remains inactive until authorization checks executed rendering time on-demand evaluation lazy initialization.

**Fase 3: Sidebar Rendering con Permission Filtering**

SideBarComponent mounts when application loads after authentication. Computed property availableModules executes: obtains Application.ModuleList.value all registered entity classes, obtains Application.currentUser authenticated user, filters list: `allModules.filter(entityClass => entityClass.hasPermission(currentUser))`. For each  entityClass iteration: calls Product.hasPermission(currentUser), internally calls Product.getModulePermission() retrieving 'products.manage' string, checks `currentUser.permissions.includes('products.manage')` array includes method exact match, currentUser.permissions contains 'products.manage' returns true Product retained filtered list, Customer requires 'users.manage' not in permissions array returns false Customer excluded filtered list. Filtered availableModules contains only authorized modules [Product, Order] excluding unauthorized. Template v-for iterates filtered list rendering only authorized sidebar items. User sees sidebar "Products" "Orders" pero not "Customers" lacking permission clean focused interface.

**Fase 4: User Attempts Navigation Unauthorized Module**

User types "/customers" URL browser address bar attempting direct navigation bypassing sidebar trying access unauthorized module. Router guard beforeEach executes: obtains Application.View.value.entityClass target Customer class, calls Customer.getModulePermission() retrieving 'users.manage' required permission, calls Customer.hasPermission(currentUser) checking authorization, currentUser.permissions ['products.manage', 'orders.view'] does NOT include 'users.manage' returns false denied, guard executes `next('/access-denied')` redirecting access denied page. User sees "Access Denied - You need 'users.manage' permission" message prevented accessing unauthorized module router enforcement protecting direct URL manipulation browser navigation attempts sidebar filtering bypassed security layer comprehensive.

**Fase 5: Component Conditional Rendering Based Permission**

User navigates Product ListView authorized module hasPermission returned true. Component mounts template renders ProductListView. Computed property canCreate executes: `Product.hasPermission(currentUser)` checks authorization, currentUser.permissions includes 'products.manage' returns true authorized. Template evaluates `v-if="canCreate"` directive condition true button rendered visible "+ New Product" action available. User role manager full permissions sees button. Employee user different permissions ['orders.view', 'inventory.read'] lacking 'products.manage' canCreate returns false button hidden v-if condition false not rendered DOM invisible. Same component adapts diferentes users showing/hiding UI elements based individual permissions fine-grained control role-appropriate interfaces UX customized authorization enforced presentation layer.

**Fase 6: API Request Validation Before Submission**

User clicks "+ New Product" button canCreate true authorized. Handler executes createProduct() function internal logic verifies permission again defensive programming: `if (!Product.hasPermission(currentUser)) throw Error('Unauthorized')` double-checking authorization before proceeding. Permission verified navigates DetailView: `Application.changeView(Product, ViewType.DETAIL, new Product())` rendering form fields. User fills name price fields clicks Save button. Save handler executes entity.save() method BaseEntity implementation checks permission: `const requiredPermission = this.constructor.getModulePermission(); if (requiredPermission && !this.constructor.hasPermission(Application.currentUser)) throw new Error('Permission denied')` verification before API request submitted. Permission verified constructs API request axios.post including header `X-Required-Permission: products.manage` backend receives validates permission server-side authorizing request proceeding save database returning success. Frontend permission check reduces unnecessary network traffic improving UX immediate feedback, backend validation true security enforcement preventing unauthorized API calls bypassing frontend checks comprehensive security both layers coordinated.

## 6. Reglas Obligatorias

1. **Backend validation REQUIRED NOT optional**: Frontend permission checks ModulePermission decorator SideBarComponent filtering Router guards component conditionals являются UI/UX optimizations NOT security enforcement. Backend API MUST validate permissions every request independently trusting frontend checks insufficient attackers bypass frontend code manipulating requests directly curl Postman browser devtools. Pattern MUST implement middleware backend: `app.post('/api/products', requirePermission('products.manage'), handler)` verifying user credentials session tokens authorization headers checking permissions database role assignments before executing business logic. Frontend decoration provides better UX but security depends backend enforcement mandatory critical cannot compromise trust boundary.

2. **Permission strings MUST match backend definitions exactly**: Frontend decorator values `@ModulePermission('products.manage')` MUST correspond exactly backend permission identifiers same string literals case-sensitive matching. Mismatch causes authorization failures: frontend 'products.manage' backend 'product.manage' (singular typo) divergence results denied access confusing errors users legitimately authorized. Developer responsible maintaining consistency: centralize permission constants shared file `export const PERMISSIONS = { PRODUCTS_MANAGE: 'products.manage' }` imported both frontend backend eliminating magic strings reducing typos, documentation permission registry listing all valid identifiers descriptions, testing integration tests verifying frontend permission strings recognized backend validation endpoints ensuring alignment.

3. **Handle unauthenticated scenarios gracefully**: Components MUST handle Application.currentUser null case when not authenticated properly rendering appropriate UI messages redirects. Pattern check nullish: `if (!currentUser.value) return false` canCreate canEdit computeds returning false hiding actions, `if (!currentUser) return []` availableModules returning empty array hiding all modules, Router guard `if (!currentUser) return next('/login')` redirecting authentication page. Avoid assuming currentUser always exists risk runtime errors accessing undefined properties `.permissions` causing crashes broken UI poor UX. Defensive programming nullish coalescing optional chaining safeguard unauthenticated edge cases graceful degradation login prompts.

4. **Permission format conventions consistency maintained**: Adopt consistent naming format project-wide: lowercase dot-separated hierarchical `<resource>.<action>` format 'products.manage', 'users.view', 'orders.edit' readable memorable predictable. Special keywords: 'admin' broad administrative, 'superadmin' root unrestricted, '*' wildcard universal. Avoid inconsistent formats mixed cases underscores hyphens: 'PRODUCTS_MANAGE' uppercase underscores, 'edit-users' hyphens arbitrary, 'Admin' mixed case inconsistent confusing error-prone. Document conventions style guide team alignment code reviews enforce consistency linting rules custom ESLint plugins automated checks preventing deviations divergence ensuring uniformity clarity maintainability.

5. **Test permission scenarios comprehensively**: Unit tests MUST verify getModulePermission() returns expected strings: `expect(Product.getModulePermission()).toBe('products.manage')` metadata correctness. hasPermission() logic tested mocked users: user with permission returns true, user without returns false, superadmin wildcard '*' returns true always, unauthenticated null returns false appropriately, public modules no decorator returns true. Component tests mount SideBarComponent mocking Application.currentUser verifying filtered availableModules correctness only authorized visible, Router guard tests attempting navigation unauthorized modules verifying redirects '/access-denied' properly enforced. Integration tests end-to-end flows login navigate different users roles verifying UI adapts correctly permissions respected throughout application comprehensive coverage security-critical functionality validated thoroughly preventing vulnerabilities regressions.

6. **Document permission requirements clearly**: Each decorated module SHOULD comment explaining permission purpose who typically authorized: `@ModulePermission('products.manage') // Required: Product Managers, Admins export class Product`. Documentation помо developers understanding authorization model, centralized permission registry spreadsheet listing all identifiers descriptions roles typically granted useful reference onboarding, README security section explaining RBAC implementation permission format conventions testing procedures comprehensive knowledge sharing team alignment reducing confusion errors improving security posture compliance audits demonstrating proper access control documented established enforced consistently.

## 7. Prohibiciones

1. **NO confiar únicamente frontend permission checks security**: Frontend ModulePermission decorator SideBarComponent filtering Router guards component conditional rendering являются UI/UX improvements NOT security enforcement. Attackers bypass frontend entirely curl Postman direct API requests manipulating JavaScript devtools modifying Application.currentUser permissions frontend tampering trivial. Backend API validation MANDATORY every request verificando permissions independently session tokens database role lookups authorization headers never trusting frontend claims. Pattern prohibido: frontend permission check считать sufficient security backend assumes frontend validated exposing endpoints without verification catastrophic vulnerability unauthorized access sensitive data CRUD operations unrestricted exploitation. Always enforce backend double-checking defense-in-depth trust boundary respected frontend convenience backend security enforcement.

2. **NO hardcodear permission strings scattered templates components**: Centralizar permission identifiers constants file single source truth: `export const PERMISSIONS = { PRODUCTS_MANAGE: 'products.manage' }` imported modules decorators accessed `@ModulePermission(PERMISSIONS.PRODUCTS_MANAGE)` avoiding magic string literals `@ModulePermission('products.manage')` scattered hundreds decorators components error-prone typos inconsistencies. Benefits: refactoring easier changing permission identifier one place propagates automatically, typos compile-time errors autocomplete IDE support reducing runtime bugs, searchability grep finding usages centralized constants trivial scanning magic strings difficult, consistency guaranteed all references pull same constant no divergence drift variations. Pattern required scalable maintainable permission management avoiding technical debt fragmentation scattered literals nightmare maintenance.

3. **NO asumir permissions array always populated exists**: User object permissions property optional nullable situations: user just authenticated permissions not yet loaded API async delay, user object incomplete missing permissions field backend response structure changed breaking contract, legacy users migrated system lacking permissions temporarily transition period, edge case errors fetching permissions network failure timeout incomplete data. Code MUST defensively check: `user.permissions?.includes(permission)` optional chaining nullish coalescing `|| false` fallback, `if (!user.permissions) return false` explicit null checks before array operations preventing runtime errors `.includes undefined` causing crashes TypeError broken UI poor UX confused users. Defensive programming safeguards edge cases graceful degradation fault tolerance resilience unpredictable conditions.

4. **NO implementar custom permission logic scattered duplicate code**: Avoid reinventing authorization checks components templates custom implementations verifying permissions scattered inconsistently diverging logic bugs vulnerabilities. Centralize utilizing hasPermission() accessor method BaseEntity unified API consistent behavior tested validated thoroughly single implementation. If custom logic needed hierarchical wildcard permissions implement BaseEntity level extending hasPermission() algorithm benefiting all modules components automatically reusable maintainable single source truth modifications propagate everywhere. Pattern prohibido: cada component implements own logic `user.permissions.includes(permission)` duplicate copies scattered drift versioning different implementations contradictory decisions breaking inconsistencies technical debt maintenance nightmare. Centralization mandatory DRY principle scalability consistency security critical cannot compromise authorization logic integrity.

5. **NO exponer admin functionality public modules omitting decorator**: Sensitive administrative functionality user management system configuration security settings módulos MUST have @ModulePermission decorator explicitly applied restricting access authorized roles admin superadmin. Omitting decorator leaves module public accessible unauthorized users catastrophic security vulnerability exposing privileged operations unrestricted. Pattern prohibido: `export class SystemSettings extends BaseEntity` sin decorator accessible anyone, `export class Users extends BaseEntity` managing accounts passwords roles publicly visible exploitable. Always decorator administrative modules: `@ModulePermission('admin') export class SystemSettings`, `@ModulePermission('superadmin') export class SecurityConfiguration` restricting appropriately. Audit modules review missing decorators security reviews penetration testing identifying unprotected sensitive endpoints remediating immediately priority critical vulnerabilities.

6. **NO mezclar authorization levels same module confusion**: Module SHOULD have single consistent permission level NOT multiple different checks scattered actions creating confusion inconsistent behavior. Bad pattern: Product module decorated 'products.view' read-only pero Create button checks 'products.manage' edit permission delete action checks 'admin' permission different authorization levels same module confusing users actions available inconsistent contradictory expected behaviors unclear. Good pattern: Product module decorated appropriate permission 'products.manage' all CRUD operations requiring same level consistent authorization expectations clear predictable, separate modules different permission levels ProductViewer (products.view read-only), ProductManagement (products.manage CRUD), ProductAdmin (products.delete危険 operations) distinct modules clear boundaries authorization levels explicit separation concerns understandable maintainable.

## 8. Dependencias

### BaseEntity
Import MODULE_PERMISSION_KEY Symbol y proporciona getModulePermission() hasPermission(user) accessor methods estáticos verificando authorization. Ubicación src/entities/base_entity.ts líneas ~200-240. All entity classes inherit accessors automatically BaseEntity base class unified API consistent dependency foundational framework architecture authorization system integrated core.

### Application Singleton
Application.currentUser reactive ref containing authenticated user object including permissions array. Application.ModuleList reactive ref containing registered entity classes filtered by permissions SideBarComponent. Ubicación src/models/application.ts. Dependency critical centralized state management authentication context global access permissions verificación coordinated Application singleton state source truth authorization decisions.

### SideBarComponent
Principal UI consumer permission filtering. Ubicación src/components/SideBarComponent.vue. Computed property availableModules filters Application.ModuleList calling hasPermission(currentUser) cada entityClass retaining only authorized displaying sidebar items dynamically adapting role. Dependency SideBarComponent depends ModulePermission metadata filtering removing unauthorized modules clean focused navigation.

### Router Navigation Guards
Router beforeEach hook ubicación src/router/index.ts checks permissions before navigation completing redirecting unauthorized users '/login' '/access-denied' appropriately. Dependency Router depends getModulePermission() hasPermission() accessors checking target module authorization preventing direct URL manipulation bypassing sidebar navigation comprehensive security layer.

### User Entity Class
User entity expected structure: `{ id: number, username: string, role: string, permissions: string[] }` permissions array strings permission identifiers. Application.currentUser stores User instance type dependency ModulePermission expects User object standard interface permissions property accessible. Developer responsibility defining User entity structure compatible requirements permissions array populated authentication backend API returning proper structure.

### Authentication System External
External authentication system (login/logout flows, session management, token handling) responsibility populating Application.currentUser authenticated user object including permissions array. ModulePermission assumes currentUser already authenticated permissions loaded external system coordination. Integration pattern: login success stores user Application.currentUser triggering reactivity updates, logout clears Application.currentUser null resetting state navigation adapting unauthenticated scenario appropriately.

### Backend Authorization API
Backend API endpoints MUST validate permissions independently every request checking session tokens user credentials database role assignments permissions lookups. Frontend ModulePermission provides permission string X-Required-Permission header API middleware verifies authorization server-side. Integration critical security enforcement backend validation mandatory frontend decoration improves UX reducing unnecessary requests immediate feedback но true security depends backend cannot bypass.

### Permission Service Optional
Optional external permission service handling hierarchical wildcards complex authorization logic (ej. 'admin.*' includes 'admin.users' 'admin.settings'). If implemented, hasPermission() method BaseEntity pueden integrate calling PermissionService.check(user, permission) delegating complex logic external service. Not framework built-in developer responsibility implementing if needed project-specific requirements varying complexity levels.

## 9. Relaciones

### Con ModuleName / ModuleIcon Decorators
**Complementary Module Identity**: ModuleName define labels text, ModuleIcon define visual icon, ModulePermission define access authorization. Together complete module identity: SideBarComponent filtered permissions displaysa authorized modules icon + name combined presentation visual + textual + authorization integrated. Decorators independent orthogonal concerns applied separately entities mixable different combinations some modules named+icon+permission, others named only public, flexibility granular control module configuration desired.

### Con Application.ModuleList Registration
**Prerequisite Filtering Source**: ModuleList MUST populated registered entity classes antes SideBarComponent filtering executing. Registration sequence main.ts pushes classes array establishing available modules, SideBarComponent filters based permissions displaying subset authorized modules only. Registration establishes "what modules exist", ModulePermission establishes "who accesses which modules", separate concerns coordinated timing order dependencies clear Application setup modules registered filtering applied rendering phase.

### Con Router y View System
**Integration Navigation Guards**: Router depends ModulePermission checking target module authorization before navigation completing. Application.View.value.entityClass identifies target module, Router guard calls getModulePermission() hasPermission() verification redirecting unauthorized appropriately. Coordination essential preventing direct URL manipulation users typing paths bypassing sidebar navigation Router enforces permissions comprehensively frontend security layer supplementing UI filtering.

### Con DefaultListView / DefaultDetailView Components
**Conditional Action Rendering**: Default views SHOULD integrate permission checks conditional rendering action buttons Create/Edit/Delete based authorization. Pattern computed properties canCreate/canEdit/canDelete checking hasPermission(currentUser) v-if directives hiding/showing buttons role-appropriate UI. Custom views (ModuleListComponent/ModuleDetailComponent decorators) similarly integrate permission checks matching framework patterns conventions maintaining consistency user expectations familiar behaviors preserved custom implementations.

### Con CRUD Operations BaseEntity Methods
**Optional Pre-Request Validation**: save() delete() BaseEntity methods PUEDEN integrate permission checks defensively verifying authorization before API requests submitted reducing unnecessary network traffic improving UX immediate feedback: `const requiredPermission = this.constructor.getModulePermission(); if (requiredPermission && !this.constructor.hasPermission(Application.currentUser)) throw Error('Permission denied')` validation pattern. Optional frontend convenience backend validation MANDATORY true security enforcement frontend checks supplement not replace.

### Con Property-Level Decorators ReadOnly/Disabled
**Different Scopes Granularity**: ModulePermission module-level authorization entire entity access, ReadOnly/Disabled property-level rendering control individual fields UI restrictions. No overlap responsibilities distinct concerns coordination: module permission gates access viewing editing module altogether, property decorators control field-level interactions WITHIN authorized module fine-grained UI control different users different field access permissions potentially although ModulePermission simpler coarser granularity typically sufficient most scenarios.

### Con Testing Framework Mocks
**Essential Test Doubles**: Permission testing requires mocking Application.currentUser различные scenarios different user roles permissions arrays simulating authorized unauthorized unauthenticated cases comprehensively. Test utilities provide helper functions creating mock users: `createMockUser({ permissions: ['products.manage'] })` reusable test doubles, mounting components `mount(SideBarComponent, { global: { provide: { currentUser: mockUser } } })` dependency injection mocked context, assertions verifying hasPermission() returns expected booleans sidebar filtered correctly Router redirects appropriately  comprehensive test coverage security-critical functionality validated.

## 10. Notas de Implementación

1. **Backend security paramount frontend convenience**: Reiterate critical importance backend API validation every request independent frontend permission checks. Frontend ModulePermission decorator improves UX reduces unnecessary network requests immediate feedback BUT attackers bypass frontend entirely direct API calls manipulating requests devtools. Backend MUST implement middleware checking session tokens database lookups authorization headers independently never trusting frontend claims. Pattern backend middleware: `function requirePermission(permission) { return (req, res, next) => { const user = req.session.user; if (!user || !user.permissions.includes(permission)) return res.status(403).json({error:'Forbidden'}); next(); }; }` every endpoint protected mandatory cannot skip assume frontend validated.

2. **Hierarchical permissions optional enhancement**: Basic implementation exact string matching но complex applications may benefit hierarchical permissions wildcards: 'admin.*' grants 'admin.users' 'admin.settings' 'admin.logs' automatically, 'products.*' grants 'products.view' 'products.edit' 'products.delete' comprehensive category-level permissions simplifying role management. Implementation requires extending hasPermission() logic parsing permission strings checking wildcards patterns recursively parent levels. External permission service library handles complexity recommendation mature solutions tested proven reducing bugs security vulnerabilities reinventing complex authorization logic error-prone risky.

3. **Permission caching performance optimization**: Repeated permission checks hasPermission() calls filtering sidebar every render puede optimize caching: Application stores `_permissionsCache = new Set(currentUser.permissions)` Set data structure O(1) lookup efficient, hasPermission() checks `_permissionsCache.has(permission)` instead array includes() faster large permission arrays, invalidate cache currentUser updates login/logout session changes refresh cache appropriately. Trade-off memory footprint small Set additional overhead vs CPU repeated array iterations performance improvement significant large applications complex permission matrices many modules frequent checks rendering cycles optimization worthwhile production deployments.

4. **Dynamic permission loading async considerations**: Permissions may load asynchronously after authentication complete API fetch delays network latency. UI DEBE handle loading states: `const permissionsLoading = ref(true)` reactive state, display loading spinner placeholder sidebar empty state temporary "Loading..." message, wait permissions loaded before filtering rendering avoiding flash unfiltered content incorrect UI States, error handling fetch failures retry mechanisms fallback graceful degradation informing users permission loading failed retry prompts. Pattern: `async function loadPermissions() { try { const response = await axios.get('/api/user/permissions'); Application.currentUser.permissions = response.data; } catch(err) { console.error('Failed loading permissions', err); } finally { permissionsLoading.value = false; } }` robust async handling.

5. **Role-based permission mapping centralized**: Many applications use roles (admin, manager, employee) mapping to permission sets centrally defined: `const rolePermissions = { admin: ['*'], manager: ['products.*', 'orders.*'], employee: ['orders.view', 'inventory.read'] }` mapping object, user.role determines permissions assigned login `user.permissions = rolePermissions[user.role]` automatic assignment simplifying management, changes role permissions propagate automatically users role affected single source truth configuration maintainability scalability. Alternative: permissions stored database fetched per-user granular individual overrides exceptions role-based defaults hybrid approach flexibility control both levels coarse role fine individual adjustments best practice mature systems.

6. **Permission audit logging accountability compliance**: Security best practice log permission checks access attempts denied permissions tracking accountability compliance regulatory requirements demonstrating proper authorization controls: `function hasPermission(user, permission) { const result = user.permissions.includes(permission); logPermissionCheck({ userId: user.id, permission, result, timestamp: new Date() }); return result; }` logging wrapper, audit trail stored database analytics queries identifying suspicious patterns frequent denials unauthorized attempts investigation, dashboards reporting permission usage trends access patterns visibility monitoring security posture alerting anomalies potential breaches. GDPR HIPAA compliance requirements often mandate audit trails access sensitive data permissions logging essential legal regulatory adherence cannot neglect production systems.

7. **Testing permission matrix comprehensive coverage**: Create permission matrix spreadsheet listing all modules (rows) all roles (columns) checkmarks indicating authorized combinations comprehensive test cases: Product module admin✓ manager✓ employee✗ customer✗, Users module admin✓ manager✗ employee✗ customer✗ systematically covering all scenarios. Automated tests iterate matrix verifying each combination hasPermission() returns expected boolean, integration tests login different roles attempting access different modules verifying UI adapts Router guards redirect correctly comprehensive coverage eliminating blind spots edge cases missed assumptions bugs vulnerabilities prevented proactive testing security-critical functionality validated exhaustively confidence deployment production releasing users.

8. **Migration strategy existing applications**: Adding ModulePermission existing application requires careful migration: audit existing modules identify sensitive administrative modules requiring permissions immediately priority, apply decorators incrementally starting high-risk admin modules, test thoroughly each batch deployment avoiding breaking changes, communicate users roles permissions assigned expectations clear transparency, train administrators permission management role assignment procedures proper usage, monitor errors permission denials adjust tuning configuration based real usage feedback iterative refinement rolling deployment minimizing disruption gradual adoption smooth transition avoiding big-bang risky overwhelming changes.

9. **Internationalization permission

 messages user-facing**: Permission denied messages access denied pages user-facing text SHOULD internationalized translated: "You need 'products.manage' permission" → "Necesitas permiso 'products.manage'" español, using i18n libraries vue-i18n translation keys `$t('errors.permissionDenied', { permission })` parameterized messages flexible, permission identifiers technical backend strings но display names user-friendly labels "Product Management" instead 'products.manage' cryptic improving UX clarity users understanding requirements access, documentation wiki describing each permission purpose who contacts requesting access procedures self-service transparency empowerment reducing support burden helpdesk tickets.

10. **Performance lazy evaluation sidebar rendering**: Filtering availableModules computed property executes every sidebar render potentially expensive large module lists complex permission checks. Optimization strategies: memoization caching filtered results invalidating currentUser permissions change avoiding redundant filtering, lazy rendering virtualization displaying only visible sidebar items viewport scrolling progressive loading reducing initial DOM nodes, debouncing search filtering input delays avoiding excessive computation typing intermediate states, Web Workers offloading heavy permission logic background thread freeing main UI thread responsive smooth interactions especially mobile devices low-end hardware performance-sensitive contexts optimization critical scalability hundreds modules thousands users concurrent usage production scale requirements demanding.

## 11. Referencias Cruzadas

- [module-name-decorator](./module-name-decorator.md): Decorador ModuleName define labels text modules complementary ModulePermission authorization combined sidebar rendering filtered navigation
- [module-icon-decorator](./module-icon-decorator.md): Decorador ModuleIcon define visual icon complementary ModulePermission permission-filtered modules icon + name + authorization complete identity
- [application-singleton](../03-application/application-singleton.md): Application.currentUser reactive ref authenticated user permissions array Application.ModuleList filtered authorization coordination state management
- [sidebar-component](../04-components/SideBarComponent.md): SideBarComponent principal consumer permission filtering availableModules computed property dynamic navigation adapting role
- [router-integration](../03-application/router-integration.md): Router navigation guards beforeEach hook checking permissions redirecting unauthorized '/login' '/access-denied' comprehensive security layer
- [base-entity-core](../02-base-entity/base-entity-core.md): BaseEntity getModulePermission() hasPermission(user) accessors líneas ~200-240 authorization methods inheritance pattern
- [views-overview](../04-components/views-overview.md): DefaultListView component conditional rendering Create button permission checks canCreate computed property
- [views-overview](../04-components/views-overview.md): DefaultDetailView component conditional actions Edit/Delete permission checks role-appropriate UI
- [property-name-decorator](./property-name-decorator.md): PropertyName property-level labels different scope ModulePermission module-level authorization distinct concerns
- [flow-architecture](../../02-FLOW-ARCHITECTURE.md): Architecture documentation navigation flows sidebar module selection Application.changeView() Router guards permission integration system-wide patterns

**Ubicación código fuente**: `src/decorations/module_permission_decorator.ts` (~20 líneas)  
**Símbolos y exports**: `MODULE_PERMISSION_KEY` Symbol, `ModulePermission` function ClassDecorator, `getModulePermission()` `hasPermission(user)` accessors BaseEntity  
**BaseEntity accessors líneas**: ~200-240 implementation location authorization methods code reference  
**Router guard líneas**: src/router/index.ts ~40-70 beforeEach permission verification navigation guards
