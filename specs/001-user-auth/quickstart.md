# Quick Start: User Authentication System

**Feature**: 001-user-auth | **Date**: 2026-04-06 | **Audience**: Desarrolladores

## Propósito

Guía rápida de 5 minutos para implementar y usar el sistema de autenticación en el framework SaaS Vue. Cubre: configuración inicial, creación de usuario de prueba, uso del login, y verificación de auth guards.

---

## Prerequisitos

- ✅ Node.js 18+ y npm instalados
- ✅ Proyecto clonado y dependencias instaladas (`npm install`)
- ✅ Backend auth_service corriendo en `http://localhost:8000` (o URL configurada)
- ✅ Usuario de prueba creado en backend DB con `estatus='A'`

---

## Paso 1: Configuración de Environment (.env)

Crear/editar `.env` en raíz del proyecto:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Auth Configuration
VITE_AUTH_TOKEN_KEY=auth_token
VITE_AUTH_REFRESH_TOKEN_KEY=refresh_token
VITE_SESSION_TIMEOUT=3600000

# App Configuration
VITE_APP_NAME="Mi SaaS App"
VITE_SELECTED_LANGUAGE=1
```

**Nota**: Cambiar `VITE_API_BASE_URL` a URL de producción cuando deploys.

---

## Paso 2: Verificar User Entity Creada

Archivo: `src/entities/user.ts`

```typescript
import { BaseEntity } from './base_entity';
import { 
  Module, PropertyName, Required, StringTypeDef, 
  PrimaryProperty, HideInDetailView, HideInListView 
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import ICONS from '@/constants/icons';

@Module({
  name: 'common.auth.login',
  icon: ICONS.LOGIN,
  apiEndpoint: '/auth/login',
  apiMethods: ['POST']
})
@PrimaryProperty('oid')
export class User extends BaseEntity {
  @PropertyName('common.auth.username', String)
  @Required(true)
  @HideInListView()
  usuario!: string;

  @PropertyName('common.auth.password', String)
  @StringTypeDef(StringType.PASSWORD)
  @Required(true)
  @HideInListView()
  @HideInDetailView()
  contraseña!: string;

  // ... resto de propiedades (oid, fkSistema, etc.) ...

  onSaved(response: any): void {
    // Lógica post-login aquí
    const { access_token, refresh_token, usuario } = response;
    this.contraseña = '';
    Application.SaveUserData({ ...usuario, access_token, refresh_token });
    Application.router?.push('/home');
    Application.ApplicationUIService.showToast(
      GetLanguagedText('common.auth.login_success'),
      ToastType.SUCCESS
    );
  }
}
```

**Verificar**: Archivo existe y sigue estructura de arriba.

---

## Paso 3: Agregar i18n Keys

Editar `src/languages/common.json`:

```json
{
  "auth": {
    "username": { "en": "Username", "es": "Usuario", "jp": "ユーザー名" },
    "password": { "en": "Password", "es": "Contraseña", "jp": "パスワード" },
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

Editar `src/languages/errors.json`:

```json
{
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

---

## Paso 4: Crear LoginView.vue

Archivo: `src/views/LoginView.vue`

```vue
<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">{{ GetLanguagedText('common.auth.login') }}</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Username Input -->
        <div class="form-group">
          <label>{{ GetLanguagedText('common.auth.username') }}</label>
          <input 
            v-model="loginUser.usuario"
            type="text"
            :class="{ 'invalid': showError && !loginUser.usuario }"
            required
          />
        </div>
        
        <!-- Password Input -->
        <div class="form-group">
          <label>{{ GetLanguagedText('common.auth.password') }}</label>
          <input 
            v-model="loginUser.contraseña"
            type="password"
            :class="{ 'invalid': showError && !loginUser.contraseña }"
            required
          />
        </div>
        
        <!-- Submit Button -->
        <button 
          type="submit" 
          class="btn-login"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">{{ GetLanguagedText('common.auth.login') }}</span>
          <span v-else>{{ GetLanguagedText('common.loading') }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { User } from '@/entities/user';
import Application from '@/models/application';
import { GetLanguagedText } from '@/helpers/language_helper';

const loginUser = ref(new User({ usuario: '', contraseña: '' }));
const isLoading = ref(false);
const showError = ref(false);

async function handleLogin() {
  showError.value = false;
  isLoading.value = true;
  
  try {
    await loginUser.value.save();
    // onSaved() se ejecuta automáticamente → redirect a /home
  } catch (error) {
    showError.value = true;
    // Error ya manejado por onSavingError()
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--background-secondary);
}

.login-card {
  background: var(--background-primary);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--shadow-medium);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input.invalid {
  border-color: var(--color-error);
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-login:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

**Nota**: Esta es una versión simplificada. El framework puede auto-generar el form desde decoradores de User si prefieres.

---

## Paso 5: Agregar Application.SaveUserData() y CurrentUser()

Editar `src/models/application.ts`:

```typescript
// Agregar dentro de la clase ApplicationClass:

/**
 * Guarda datos de usuario autenticado en SessionStorage
 * @param userData Objeto user + tokens del API response
 */
public SaveUserData(userData: any): void {
  const { access_token, refresh_token, ...userWithoutTokens } = userData;
  
  // Guardar user data
  sessionStorage.setItem('current_user', JSON.stringify(userWithoutTokens));
  
  // Guardar tokens por separado
  sessionStorage.setItem(
    this.AppConfiguration.value.authTokenKey,
    access_token || ''
  );
  sessionStorage.setItem(
    this.AppConfiguration.value.authRefreshTokenKey,
    refresh_token || ''
  );
  
  console.log('[Application.SaveUserData] Usuario guardado en SessionStorage');
}

/**
 * Obtiene usuario actual desde SessionStorage
 * @returns User instance o null si no hay sesión
 */
public CurrentUser(): User | null {
  const userJson = sessionStorage.getItem('current_user');
  if (!userJson) return null;
  
  try {
    const userData = JSON.parse(userJson);
    return new User(userData);
  } catch (error) {
    console.error('[Application.CurrentUser] Error parseando user data:', error);
    sessionStorage.removeItem('current_user'); // Limpiar data corrupta
    return null;
  }
}

/**
 * Cierra sesión del usuario actual
 */
public Logout(): void {
  // Limpiar SessionStorage
  sessionStorage.removeItem('current_user');
  sessionStorage.removeItem(this.AppConfiguration.value.authTokenKey);
  sessionStorage.removeItem(this.AppConfiguration.value.authRefreshTokenKey);
  
  // Limpiar view
  this.View.value.entityObject = null;
  this.View.value.entityClass = null;
  
  // Toast
  this.ApplicationUIService.showToast(
    GetLanguagedText('common.auth.logout_success'),
    ToastType.SUCCESS
  );
  
  // Redirect
  this.router?.push('/login');
}
```

---

## Paso 6: Agregar Router Guards

Editar `src/router/index.ts`:

```typescript
// 1. Agregar route de login
const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    // meta.requiresAuth es true por defecto (si no se especifica)
  },
  // ... otras rutas ...
];

// 2. Agregar auth guard ANTES del dirty state guard existente
router.beforeEach(async (to, from, next) => {
  const currentUser = Application.CurrentUser();
  const requiresAuth = to.meta.requiresAuth !== false; // Default true
  
  // Redirect a login si ruta protegida y no hay usuario
  if (requiresAuth && !currentUser) {
    console.log('[Auth Guard] No hay usuario, redirect a /login');
    next('/login');
    return;
  }
  
  // Redirect a home si ya autenticado intenta ir a login
  if (to.path === '/login' && currentUser) {
    console.log('[Auth Guard] Usuario ya autenticado, redirect a /home');
    next('/home');
    return;
  }
  
  next(); // Permitir navegación
});

// 3. Dirty state guard existente va DESPUÉS del auth guard
router.beforeEach(async (to, _from, next) => {
  // ... existing dirty state logic ...
});
```

---

## Paso 7: Agregar Logout Button en TopBar

Editar `src/components/TopBarComponent.vue`:

```typescript
// En la sección del dropdown menu, agregar:
<button @click="handleLogout" class="dropdown-item logout-button">
  <i class="icon-logout"></i>
  <span>{{ GetLanguagedText('common.auth.logout') }}</span>
</button>

// En <script setup>:
function handleLogout() {
  Application.Logout();
  Application.ApplicationUIService.closeDropdown(); // Cerrar dropdown
}
```

---

## Paso 8: Modificar App.vue para Auth Check

Editar `src/App.vue`:

```typescript
// En onMounted, agregar check de autenticación:
onMounted(() => {
  Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
    sidebarOpen.value = state !== undefined ? !!state : !sidebarOpen.value;
  });
  
  // AUTH CHECK: Verificar si hay usuario en SessionStorage
  const currentUser = Application.CurrentUser();
  const currentPath = Application.router?.currentRoute.value.path;
  
  if (!currentUser && currentPath !== '/login') {
    console.log('[App.vue] No hay usuario, redirigiendo a login');
    Application.router?.push('/login');
  } else if (currentUser && currentPath === '/') {
    // Usuario autenticado en raíz, redirect a home
    Application.router?.push('/home');
  }
});
```

---

## Uso: Flujo Completo

### 1. Iniciar Application

```bash
npm run dev
```

Navegar a `http://localhost:5173`

### 2. Primer Acceso (No Authenticated)

- App.vue detecta no hay SessionStorage → redirect a `/login`
- LoginView se renderiza con formulario vacío
- Router guard permite acceder a `/login` (meta.requiresAuth=false)

### 3. Login Exitoso

- Usuario ingresa `usuario: "john_doe"` y `contraseña: "password123"`
- Click "Login" → `loginUser.save()` → POST `/auth/login`
- Backend retorna 200 OK con tokens + user data
- `User.onSaved()` ejecuta:
  1. Limpia contraseña de memoria
  2. Llama `Application.SaveUserData()` → guarda en SessionStorage
  3. Redirect a `/home`
  4. Toast "Login successful"
- Usuario ve HomeView

### 4. Navegación Con Sesión Activa

- Usuario navega a `/products` (u otra ruta)
- Router guard detecta `CurrentUser() !== null` → permite navegación
- Axios interceptor agrega `Authorization: Bearer {access_token}` a requests API

### 5. Refresh de Página

- Usuario presiona F5 en cualquier ruta
- App.vue onMounted ejecuta
- `CurrentUser()` lee SessionStorage → retorna User instance
- No redirect a login, sesión persiste

### 6. Logout

- Usuario abre dropdown en TopBar
- Click "Cerrar Sesión"
- `Application.Logout()` ejecuta:
  1. Limpia SessionStorage (user + tokens)
  2. Redirect a `/login`
  3. Toast "Logged out successfully"
- Usuario ve LoginView de nuevo

### 7. Session Expired (Future: Access Token Expires)

- Usuario usa app por 1+ hora
- access_token expira
- Próximo API call retorna 401
- Axios interceptor detecta 401 → llama `Application.Logout()` → redirect `/login`
- Toast "Session expired"

---

## Debug & Troubleshooting

### Ver SessionStorage en Browser

```javascript
// Abrir DevTools Console (F12)
console.log('User:', sessionStorage.getItem('current_user'));
console.log('Token:', sessionStorage.getItem('auth_token'));
console.log('Refresh:', sessionStorage.getItem('refresh_token'));
```

### Ver Logs de Auth Flow

```javascript
// Todos los console.log() en User.ts y Application.ts tienen prefix:
// [User.onSaved], [Application.SaveUserData], [Auth Guard], etc.
// Filtrar en DevTools Console por estos prefixes
```

### Probar Login Manualmente (curl)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"john_doe","contraseña":"password123"}'
```

Verificar response tiene estructura esperada.

### Limpiar SessionStorage Manualmente

```javascript
// DevTools Console
sessionStorage.clear();
location.reload();
```

---

## Testing Checklist

- [ ] Login con credenciales válidas → redirect a /home ✅
- [ ] Login con password incorrecto → toast error, inputs inválidos ✅
- [ ] Login con usuario inexistente → toast error ✅
- [ ] Refresh F5 con sesión activa → persiste sesión ✅
- [ ] Navegar a ruta protegida sin sesión → redirect a /login ✅
- [ ] Navegar a /login con sesión activa → redirect a /home ✅
- [ ] Logout → limpia SessionStorage, redirect a /login ✅
- [ ] Multi-language: cambiar idioma → labels del form cambian ✅
- [ ] API timeout → toast error después de 30s ✅
- [ ] Backend down → toast error, no crash app ✅

---

## Próximos Pasos

1. **Implementar Token Refresh** (TD-001): Agregar endpoint `/auth/refresh` y lógica automática cuando access_token expire
2. **Agregar HomeView Content**: Personalizar HomeView con dashboard, welcome message, etc.
3. **RBAC (Role-Based Access Control)**: Extender User con roles/permisos
4. **Audit Log**: Registrar logins en backend para auditoría
5. **2FA (Two-Factor Auth)**: Agregar segundo factor opcional

---

## Recursos Adicionales

- [data-model.md](./data-model.md) - Estructura completa de User entity
- [contracts/user-api-contract.md](./contracts/user-api-contract.md) - API contract detallado
- [research.md](./research.md) - Decisiones técnicas y alternativas consideradas
- [copilot/01-FRAMEWORK-OVERVIEW.md](../../copilot/01-FRAMEWORK-OVERVIEW.md) - Arquitectura del framework
- [copilot/02-FLOW-ARCHITECTURE.md](../../copilot/02-FLOW-ARCHITECTURE.md) - Flujos del sistema

---

## Phase 1 Quick Start: Complete ✅

Guía completa para implementar y usar autenticación en <15 minutos.

**Next Phase**: Phase 2 - Tasks (ejecutar `/speckit.tasks` para generar tasks.md)
