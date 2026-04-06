# Research: User Authentication System

**Feature**: 001-user-auth | **Date**: 2026-04-06 | **Phase**: 0

## Resumen Ejecutivo

Investigación técnica sobre implementación de autenticación en framework SaaS Vue meta-programming. Decisiones clave: (1) Usar SessionStorage para tokens por session-scope requerido, (2) onSaved() hook de BaseEntity para post-login logic sin romper abstracción, (3) Router beforeEach guard para protección global de rutas, (4) Reutilizar form rendering system existente para LoginView sin custom logic, (5) Segregar i18n keys en common.json verificando duplicados primero.

## 1. Token Storage Strategy

### Decision
**Usar SessionStorage para almacenar `access_token`, `refresh_token`, y `usuario` object serializado**

### Rationale
- **Session Scope**: SessionStorage se limita a la lifetime del tab/ventana, alineado con requirement de sesión única por browser (spec FR-010, FR-011)
- **Security**: Tokens expiran al cerrar browser, reduciendo ventana de exposición vs localStorage persistente
- **Framework Pattern**: Application.AppConfiguration ya usa localStorage para preferencias pero SessionStorage para datos de sesión es mejor práctica
- **Multi-tab Behavior**: SessionStorage es compartido entre tabs del mismo origen, permitiendo login en un tab = autenticado en todos (spec edge case mencionado)

### Alternatives Considered
- **localStorage**: Rechazado - Persistencia indefinida incrementa riesgo de robo de tokens. Spec indica "session timeout" como concern, no "remember me"
- **Cookies httpOnly**: Rechazado - Requiere backend configurado para SameSite/Secure, framework ya usa axios sin cookie handling
- **In-memory solo (reactive ref)**: Rechazado - Pierde sesión en refresh de página, violando spec SC-005 "User session persists across browser refreshes"
- **IndexedDB**: Rechazado - Overkill para key-value simple, add complejidad sin beneficio

### Implementation Notes
```typescript
// Application.ts - SaveUserData()
const userDataKey = 'current_user';
sessionStorage.setItem(userDataKey, JSON.stringify({
  ...user.toPersistentObject(),
  // Excluir contraseña ya limpiada en User.onSaved()
}));
sessionStorage.setItem(
  this.AppConfiguration.value.authTokenKey, 
  access_token
);
sessionStorage.setItem(
  this.AppConfiguration.value.authRefreshTokenKey, 
  refresh_token
);
```

---

## 2. BaseEntity Lifecycle Hook for Post-Authentication

### Decision
**Usar `onSaved()` hook de User entity para ejecutar lógica post-login (limpiar password, guardar datos, redirect a /home)**

### Rationale
- **Framework Contract**: BaseEntity.save() → triggers `onSaving()` (pre), `onSaved()` (post) (ver copilot/layers/02-base-entity/02-lifecycle-hooks.md)
- **Separation of Concerns**: Login API call = save operation, post-processing = lifecycle hook. No mezclar en LoginView
- **Consistency**: Otras entidades usan afterSave/onSaved para side effects (ej: Product podría disparar webhook post-save)
- **No Breaking Changes**: onSaved() es override permitido, no modifica BaseEntity core (spec Technical Constraints)

### Alternatives Considered
- **LoginView maneja todo**: Rechazado - Viola MI LÓGICA A3 (UI sin business logic no derivada de metadata). Duplicate logic si hay otro entry point a login
- **beforeSave() instead**: Rechazado - beforeSave es para validación pre-flight, no side effects post-success. API response aún no disponible aquí
- **Custom login() method en User**: Rechazado - Rompe abstracción CRUD de BaseEntity. save() YA hace POST, solo necesitamos post-processing

### Implementation Notes
```typescript
// src/entities/user.ts
export class User extends BaseEntity {
  // ... decoradores ...
  
  onSaved(response: any): void {
    // 1. Limpiar contraseña de memoria
    this.contraseña = '';
    
    // 2. Extraer tokens de response
    const { access_token, refresh_token, usuario } = response;
    
    // 3. Guardar en SessionStorage via Application
    Application.SaveUserData({ ...usuario, access_token, refresh_token });
    
    // 4. Redirect a /home
    Application.router?.push('/home');
    
    // 5. Toast de éxito
    Application.ApplicationUIService.showToast(
      GetLanguagedText('common.login_success'),
      ToastType.SUCCESS
    );
  }
  
  onSaving(): boolean {
    // Opcional: validación custom pre-login si necesario
    return true; // permite continuar save
  }
}
```

---

## 3. Vue Router Authentication Guards

### Decision
**Implementar global `beforeEach` guard en router/index.ts + meta field `requiresAuth: false` para /login route**

### Rationale
- **Global Protection**: beforeEach se ejecuta en TODA navegación, garantizando no bypass (spec FR-012 "redirect si no hay user data")
- **Explicit Opt-Out**: Routes que NO requieren auth (ej: /login) usan meta `requiresAuth: false`, todas las demás default = true
- **Framework Pattern**: router/index.ts ya tiene beforeEach para dirty state guard (línea 50-70), same pattern aquí
- **Timing**: Guard ejecuta antes de renderizar componente, cumple spec SC-002 "<500ms redirect"

### Alternatives Considered
- **Per-route guards**: Rechazado - Fácil olvidar agregar a nueva ruta, inseguro por defecto
- **App.vue onMounted check**: Rechazado - Solo verifica en initial load, no en navegación SPA entre rutas
- **@NotRequiresLogin decorator en entity**: Rechazado - Decoradores son para metadata de entidad, no routing. Login no es entidad persistente
- **Middleware pattern con composition**: Rechazado - Overkill, Vue Router ya provee mechanism perfecto

### Implementation Notes
```typescript
// router/index.ts - Agregar route
const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  // ... existing routes ...
];

// Agregar guard ANTES del dirty state guard existente
router.beforeEach(async (to, from, next) => {
  const currentUser = Application.CurrentUser();
  const requiresAuth = to.meta.requiresAuth !== false; // default true
  
  if (requiresAuth && !currentUser) {
    // Usuario no autenticado intentando acceder ruta protegida
    next('/login');
    return;
  }
  
  if (to.path === '/login' && currentUser) {
    // Usuario YA autenticado intentando ir a login
    next('/home');
    return;
  }
  
  next(); // Permitir navegación
});
```

---

## 4. Form Rendering from Metadata for Login

### Decision
**Usar el sistema existente de form rendering (ComponentContainerComponent → default_detailview.vue → Form inputs) instanciando User entity en LoginView con solo username/password decorados**

### Rationale
- **Zero Custom UI Logic**: LoginView solo crea `new User()`, llama `user.save()` en submit. Form se genera automáticamente desde decoradores (MI LÓGICA A3)
- **Consistency**: Mismo UX que resto de formularios en app (Product, Configuration, etc.)
- **Validation Automática**: @Required, @StringTypeDef(EMAIL) ya proveen validación client-side sin código adicional
- **i18n Automático**: @PropertyName('common.username', String) → GetLanguagedText() automático en form inputs

### Alternatives Considered
- **Custom login form HTML**: Rechazado - Viola MI LÓGICA A3 (UI debe derivar de metadata). Duplicate validation/i18n logic
- **Modal en vez de view**: Rechazado - Spec requiere "redirect to login view", no modal overlay. Full-page login = mejor UX para auth
- **Composition function useLoginForm**: Rechazado - Agrega capa innecesaria, BaseEntity ya maneja form state

### Implementation Notes
```typescript
// LoginView.vue
<script setup lang="ts">
import { ref } from 'vue';
import { User } from '@/entities/user';
import Application from '@/models/application';

const loginUser = ref(new User({ usuario: '', contraseña: '' }));

async function handleLogin() {
  try {
    await loginUser.value.save(); // Dispara onSaved() → redirect /home
  } catch (error) {
    // Error ya manejado por BaseEntity con toast
  }
}
</script>

<template>
  <div class="login-container">
    <!-- Formulario se genera automáticamente desde decoradores de User -->
    <ComponentContainerComponent 
      :entity="loginUser" 
      @submit="handleLogin"
    />
  </div>
</template>
```

**Decoradores mínimos en User** para login form:
```typescript
@PropertyName('common.username', String)
@Required(true)
@HelpText('common.username_help')
usuario!: string;

@PropertyName('common.password', String)
@StringTypeDef(StringType.PASSWORD) // Input type=password
@Required(true)
contraseña!: string;
```

---

## 5. i18n Key Management Strategy

### Decision
**Verificar keys existentes en common.json, errors.json, custom.json ANTES de crear nuevas. Agregar keys de autenticación en common.json bajo nueva sección "auth"**

### Rationale
- **Avoid Duplication**: Spec FR-021 indica obligatorio verificar primero. Ya existe `password` en custom.json, `home` en common.json, `session_expired` en errors.json
- **Centralized Common Keys**: common.json es para strings compartidos cross-app (save, cancel, etc.). Auth es feature core, pertenece ahí
- **Namespace Consistency**: Usar prefijo `auth.` para agrupar (ej: `auth.username`, `auth.login`, `auth.logout`) siguiendo pattern de `framework.configuration.*`
- **Error Separation**: Errores de auth van en errors.json (ej: `authentication_failed`, `invalid_credentials`)

### Alternatives Considered
- **Nueva i18n file auth.json**: Rechazado - Framework solo tiene common/errors/custom/navigation. Agregar 4to file = breaking pattern
- **Todo en custom.json**: Rechazado - custom.json es para domain-specific (products, etc.). Auth es framework-level feature
- **Sin namespace (flat keys)**: Rechazado - Difícil search/maintain. `login` colisiona potencialmente con "login button" vs "login page"

### Implementation Plan

**Keys a agregar en `common.json`**:
```json
{
  // ... existing keys ...
  "auth": {
    "username": { "en": "Username", "es": "Usuario", "jp": "ユーザー名" },
    "login": { "en": "Login", "es": "Iniciar Sesión", "jp": "ログイン" },
    "logout": { "en": "Logout", "es": "Cerrar Sesión", "jp": "ログアウト" },
    "login_success": { 
      "en": "Login successful", 
      "es": "Inicio de sesión exitoso", 
      "jp": "ログイン成功" 
    },
    "logout_success": { 
      "en": "Logged out successfully", 
      "es": "Sesión cerrada exitosamente", 
      "jp": "ログアウト成功" 
    }
  }
}
```

**Keys a agregar en `errors.json`**:
```json
{
  // ... existing keys ...
  "authentication_failed": {
    "en": "Authentication failed. Please check your credentials.",
    "es": "Autenticación fallida. Verifique sus credenciales.",
    "jp": "認証に失敗しました。認証情報を確認してください。"
  },
  "invalid_credentials": {
    "en": "Invalid username or password.",
    "es": "Usuario o contraseña inválidos.",
    "jp": "ユーザー名またはパスワードが無効です。"
  }
}
```

**Keys existentes a reutilizar**:
- `common.home` → para redirect label
- `custom.products.fields.password` → Reutilizar SOLO si se usa en decorador como `@PropertyName('custom.products.fields.password', String)` - ALTERNATIVA: crear `common.auth.password` para mejor namespace
- `errors.session_expired` → Ya existe para manejo de sesión expirada

---

## 6. Logout Implementation Pattern

### Decision
**Agregar método `Application.Logout()` que limpia SessionStorage y redirect a /login, llamado desde nuevo botón en TopBar dropdown**

### Rationale
- **Centralized Logic**: Logout puede necesitarse desde múltiples lugares (TopBar, timeout, error 401), mejor tenerlo en Application singleton
- **Complete Cleanup**: Limpiar `current_user`, `access_token`, `refresh_token` juntos evita partial state
- **UI Consistency**: TopBar dropdown ya existe con botones de configuración (ver TopBarComponent.vue línea 45 localStorage.removeItem), agregar logout ahí es natural

### Alternatives Considered
- **Método en User entity**: Rechazado - User.logout() implica instance method, pero logout es app-level action sin entity específico
- **Composition function**: Rechazado - Logout es simple, no requiere reactivity ni shared state complex
- **Event Bus**: Rechazado - Direct method call es más claro y traceable que event indirection

### Implementation Notes
```typescript
// Application.ts
public Logout(): void {
  // 1. Limpiar SessionStorage
  sessionStorage.removeItem('current_user');
  sessionStorage.removeItem(this.AppConfiguration.value.authTokenKey);
  sessionStorage.removeItem(this.AppConfiguration.value.authRefreshTokenKey);
  
  // 2. Limpiar View actual
  this.View.value.entityObject = null;
  this.View.value.entityClass = null;
  
  // 3. Toast de confirmación
  this.ApplicationUIService.showToast(
    GetLanguagedText('common.auth.logout_success'),
    ToastType.SUCCESS
  );
  
  // 4. Redirect a login
  this.router?.push('/login');
}
```

```vue
<!-- TopBarComponent.vue - Agregar en dropdown -->
<button @click="handleLogout" class="dropdown-item">
  <span>{{ GetLanguagedText('common.auth.logout') }}</span>
</button>

<script setup lang="ts">
function handleLogout() {
  Application.Logout();
  // Cerrar dropdown
  Application.ApplicationUIService.closeDropdown();
}
</script>
```

---

## 7. HomeView.vue Creation

### Decision
**Crear HomeView.vue como vista landing post-login, registrando Home entity (ya existe en src/entities/home.ts) correctamente en Application.ModuleList**

### Rationale
- **Explicit Landing Page**: Spec clarification indica redirect a `/home` específicamente, no "primer módulo"
- **Entity Already Exists**: src/entities/home.ts presente pero posiblemente no registrado o sin vista asociada
- **Consistency**: HomeView sigue mismo pattern que ConfigurationListComponent.vue (entidad solo para UI, sin persistencia)

### Implementation Notes
```typescript
// main.ts - Asegurar Home está registrado
import { Home } from '@/entities/home';
Application.ModuleList.value.push(Home);

// router/index.ts - Agregar route si no existe
{
  path: '/home',
  name: 'Home',
  component: () => import('@/views/HomeView.vue')
}
```

```vue
<!-- HomeView.vue - Si necesita crearse -->
<script setup lang="ts">
import { ref } from 'vue';
import { Home } from '@/entities/home';
import Application from '@/models/application';

const homeInstance = ref(new Home({}));
// Home podría mostrar dashboard, welcome message, etc.
</script>

<template>
  <div class="home-view">
    <h1>{{ GetLanguagedText('common.home') }}</h1>
    <!-- Contenido de página principal -->
  </div>
</template>
```

---

## Phase 0 Completion

**Status**: ✅ Complete  
**Unknowns Resolved**: 7/7  
**Next Phase**: Phase 1 - Design (data-model.md, contracts/, quickstart.md)

Todas las decisiones técnicas están claramente definidas con rationale y alternatives considered. No quedan "NEEDS CLARIFICATION" bloqueantes para implementación.
