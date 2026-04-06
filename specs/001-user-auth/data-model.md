# Data Model: User Authentication System

**Feature**: 001-user-auth | **Date**: 2026-04-06 | **Phase**: 1

## Overview

El modelo de datos para autenticación se centra en la entidad **User** que representa un usuario autenticado en el sistema. Esta entidad extiende BaseEntity del framework y utiliza decoradores para definir metadata de UI, validación y comportamiento CRUD.

---

## Entities

### 1. User

**Purpose**: Representar un usuario autenticado con sus credenciales, datos de perfil y relaciones a Sistema y Empleado.

**Persistence**: Semi-persistente
- Credentials (usuario/contraseña) solo se envían a API, NO se almacenan en cliente
- User data (sin password) se serializa y guarda en SessionStorage
- Tokens (access_token, refresh_token) se guardan en SessionStorage con keys separados

**Lifecycle**: Instancia creada en LoginView para capturar credentials → BaseEntity.save() hace POST a /auth/login → onSaved() procesa response y guarda en SessionStorage

#### Properties

| Property | Type | Required | Source | Description |
|----------|------|----------|--------|-------------|
| `usuario` | `string` | ✅ | User input | Username único para login |
| `contraseña` | `string` | ✅ | User input | Password en texto plano (transient, se limpia post-login) |
| `oid` | `string` | ❌ | API response | UUID del usuario en backend |
| `fkSistema` | `string` | ❌ | API response | Foreign key a Sistema en catalogues_service |
| `fkEmpleado` | `string` | ❌ | API response | Foreign key a Empleado en branch_service |
| `createdAt` | `Date` | ❌ | API response | Timestamp de creación del usuario |
| `updatedAt` | `Date` | ❌ | API response | Timestamp de última actualización |
| `creado_por` | `string` | ❌ | API response | UUID del usuario que creó este record |
| `editado_por` | `string` | ❌ | API response | UUID del usuario que editó este record |
| `estatus` | `string` | ❌ | API response | Status del usuario: 'A' (Activo), 'I' (Inactivo) |

#### Embedded Objects (from API response)

| Property | Type | Description |
|----------|------|-------------|
| `sistema` | `Sistema` | Datos completos del sistema embebidos desde catalogues_service |
| `empleado` | `Empleado` | Datos completos del empleado embebidos desde branch_service |

**Note**: `sistema` y `empleado` son objetos complejos cuya estructura es definida por servicios externos. Para efectos de esta implementación, se almacenan "as-is" sin deserialización específica.

#### Authentication Tokens (not entity properties, stored separately)

| Token | Storage Key | Source | Lifespan |
|-------|-------------|--------|----------|
| `access_token` | `AppConfiguration.authTokenKey` | API response | 1 hora |
| `refresh_token` | `AppConfiguration.authRefreshTokenKey` | API response | 30 días |

**Storage Strategy**: Tokens se extraen en `User.onSaved()` y se pasan a `Application.SaveUserData()` donde se almacenan con keys configurables.

#### Decorators Configuration

```typescript
@Module({
  name: 'common.auth.login', // i18n key para título del módulo
  icon: ICONS.LOGIN, // Icono de login (agregar a constants/icons.ts)
  apiEndpoint: '/auth/login',
  apiMethods: ['POST'] // SOLO POST, sin GET/PUT/DELETE
})
@PrimaryProperty('oid') // oid es primary key post-login
@DefaultProperty('usuario') // Display name por defecto
export class User extends BaseEntity {
  
  @PropertyIndex(1)
  @PropertyName('common.auth.username', String)
  @Required(true)
  @HelpText('common.auth.username_help')
  @HideInListView() // Login form only, no se muestra en tablas
  usuario!: string;
  
  @PropertyIndex(2)
  @PropertyName('common.auth.password', String)
  @StringTypeDef(StringType.PASSWORD) // Input type=password para ocultar texto
  @Required(true)
  @HelpText('common.auth.password_help')
  @HideInListView()
  @HideInDetailView() // Nunca mostrar post-login en vistas de edición
  contraseña!: string;
  
  @PropertyIndex(3)
  @PropertyName('common.auth.user_id', String)
  @ReadOnly() // Solo lectura post-login
  @HideInDetailView() // UUID técnico, no relevante para usuario
  oid?: string;
  
  @PropertyIndex(4)
  @PropertyName('common.auth.system_id', String)
  @ReadOnly()
  @HideInDetailView()
  fkSistema?: string;
  
  @PropertyIndex(5)
  @PropertyName('common.auth.employee_id', String)
  @ReadOnly()
  @HideInDetailView()
  fkEmpleado?: string;
  
  @PropertyIndex(6)
  @PropertyName('common.created_at', Date)
  @ReadOnly()
  @DisplayFormat('{value|date:yyyy-MM-dd HH:mm}')
  @HideInDetailView()
  createdAt?: Date;
  
  @PropertyIndex(7)
  @PropertyName('common.updated_at', Date)
  @ReadOnly()
  @DisplayFormat('{value|date:yyyy-MM-dd HH:mm}')
  @HideInDetailView()
  updatedAt?: Date;
  
  @PropertyIndex(8)
  @PropertyName('common.status', String)
  @ReadOnly()
  @HideInDetailView()
  estatus?: string;
  
  // Embedded objects - no decoradores específicos, se serializan automáticamente
  sistema?: any;
  empleado?: any;
}
```

#### Lifecycle Hooks Implementation

```typescript
export class User extends BaseEntity {
  // ... decoradores arriba ...
  
  /**
   * Hook ejecutado ANTES de enviar request a API
   * Puede usarse para validación custom pre-login
   */
  onSaving(): boolean {
    // Validar que usuario y contraseña no estén vacíos
    // (aunque @Required ya valida esto, explícito aquí para claridad)
    if (!this.usuario || !this.contraseña) {
      Application.ApplicationUIService.showToast(
        GetLanguagedText('errors.authentication_failed'),
        ToastType.ERROR
      );
      return false; // Bloquea save()
    }
    return true; // Permite continuar con save()
  }
  
  /**
   * Hook ejecutado DESPUÉS de recibir response exitoso de API
   * Aquí procesamos tokens, limpiamos password, guardamos SessionStorage, redirect
   */
  onSaved(response: any): void {
    console.log('[User.onSaved] Login exitoso, procesando response...');
    
    // 1. EXTRAER datos del response
    const { access_token, refresh_token, usuario } = response;
    
    if (!access_token || !usuario) {
      console.error('[User.onSaved] Response inválido, faltan datos');
      Application.ApplicationUIService.showToast(
        GetLanguagedText('errors.authentication_failed'),
        ToastType.ERROR
      );
      return;
    }
    
    // 2. LIMPIAR contraseña de memoria (CRÍTICO para seguridad)
    this.contraseña = '';
    delete this.contraseña;
    
    // 3. GUARDAR user data + tokens en SessionStorage
    Application.SaveUserData({
      ...usuario, // Spread del objeto usuario del response
      access_token,
      refresh_token
    });
    
    // 4. ACTUALIZAR propiedades de la instancia actual con datos del servidor
    Object.assign(this, usuario);
    
    // 5. REDIRECT a /home
    Application.router?.push('/home').catch(() => {
      console.warn('[User.onSaved] Redirect a /home falló, ruta no existe?');
    });
    
    // 6. TOAST de éxito
    Application.ApplicationUIService.showToast(
      GetLanguagedText('common.auth.login_success'),
      ToastType.SUCCESS
    );
    
    console.log('[User.onSaved] Login completado correctamente');
  }
  
  /**
   * Hook ejecutado en caso de ERROR en save()
   * BaseEntity ya muestra toast de error, aquí podemos agregar lógica adicional
   */
  onSavingError(error: any): void {
    console.error('[User.onSavingError]', error);
    
    // Marcar inputs como inválidos para feedback visual
    this.validateInputs(); // Dispara re-validación que marcará campos en rojo
    
    // Si el error es 401 Unauthorized, mostrar mensaje específico
    if (error?.response?.status === 401) {
      Application.ApplicationUIService.showToast(
        GetLanguagedText('errors.invalid_credentials'),
        ToastType.ERROR
      );
    }
  }
}
```

---

## Relationships

### User ↔ Sistema

- **Type**: Many-to-One (muchos usuarios pertenecen a un sistema)
- **Foreign Key**: `User.fkSistema` → `Sistema.id`
- **Source**: External service (catalogues_service)
- **Implementation**: Embedded object `User.sistema` contiene datos completos del Sistema
- **Note**: No se hace resolución de FK en frontend, backend ya embebe los datos

### User ↔ Empleado

- **Type**: One-to-One (un usuario corresponde a un empleado)
- **Foreign Key**: `User.fkEmpleado` → `Empleado.id`
- **Source**: External service (branch_service)
- **Implementation**: Embedded object `User.empleado` contiene datos completos del Empleado
- **Note**: No se hace resolución de FK en frontend, backend ya embebe los datos

---

## State Management

### User State Transitions

```
┌─────────────┐
│ Initial     │ usuario='', contraseña=''
│ (LoginView) │ 
└──────┬──────┘
       │ User fills form
       ▼
┌─────────────┐
│ Ready       │ usuario='john', contraseña='pass123'
│ (Form Fill) │
└──────┬──────┘
       │ User clicks "Login"
       │ onSaving() validates
       ▼
┌─────────────┐
│ Saving      │ _isSaving=true, POST /auth/login
│ (API Call)  │
└──────┬──────┘
       │
       ├──> ❌ ERROR ───┐
       │                │
       │                ▼
       │         ┌─────────────┐
       │         │ Error State │ onSavingError() → toast + mark invalid
       │         │             │
       │         └──────┬──────┘
       │                │ User can retry
       │                └────────────────┐
       │                                 │
       ▼                                 │
┌─────────────┐                         │
│ Saved       │ ✅ onSaved() executed    │
│             │ - contraseña cleared    │
│             │ - tokens saved          │
│             │ - redirect to /home     │
└──────┬──────┘                         │
       │                                 │
       ▼                                 ▼
┌─────────────┐                 ┌─────────────┐
│ Authenticated│ SessionStorage  │ Retry Login │
│ (App State)  │ has user data   │             │
└──────────────┘                 └─────────────┘
```

### SessionStorage Structure

```typescript
// Key: 'current_user' (o el que defina Application)
{
  "oid": "uuid-format",
  "usuario": "john_doe",
  "fkSistema": "uuid-format",
  "fkEmpleado": "uuid-format",
  "sistema": { /* embedded object */ },
  "empleado": { /* embedded object */ },
  "createdAt": "2026-04-06T10:30:00Z",
  "updatedAt": "2026-04-06T10:30:00Z",
  "creado_por": "uuid-format",
  "editado_por": "uuid-format",
  "estatus": "A"
  // NOTE: NO incluye contraseña, access_token, refresh_token
}

// Key: authTokenKey (ej: 'auth_token')
"eyJ0eXAiOiJKV1QiLCJhbGc..." // JWT access token

// Key: authRefreshTokenKey (ej: 'refresh_token')
"eyJ0eXAiOiJKV1QiLCJhbGc..." // JWT refresh token
```

---

## Validation Rules

### Client-Side (Decorators)

| Field | Rules | Error Message Key |
|-------|-------|-------------------|
| `usuario` | Required, non-empty string | `validation.required` |
| `contraseña` | Required, non-empty string, min 1 char | `validation.required` |

**Note**: NO se valida complejidad de password en cliente (ej: min 8 chars, uppercase, etc.) porque backend ya lo hace y spec no lo requiere. Keep it simple.

### Server-Side (Backend)

- Username exists in database
- User status = 'A' (Activo)
- Password matches Argon2 hash
- Returns 401 si falla cualquier validación

### UI Validation Feedback

```typescript
// Automático via framework:
// 1. Campo con @Required muestra asterisco rojo si vacío
// 2. Input se marca con borde rojo si validation falla
// 3. Help text aparece debajo del input con mensaje de error
// 4. Submit button disabled hasta que validateInputs() === true
```

---

## Security Considerations

### Password Handling

- ✅ Password se envía en texto plano PERO solo sobre HTTPS
- ✅ Password se limpia de memoria inmediatamente post-login en `onSaved()`
- ✅ Password NUNCA se almacena en SessionStorage ni localStorage
- ✅ Password input usa `type="password"` via `@StringTypeDef(StringType.PASSWORD)`
- ✅ Password NO se muestra en ninguna vista post-login via `@HideInDetailView()`

### Token Security

- ✅ Tokens almacenados en SessionStorage (mejor que localStorage para session scope)
- ✅ SessionStorage se limpia automáticamente al cerrar tab/ventana
- ⚠️ SessionStorage es JavaScript-accessible (vulnerable a XSS), PERO:
  - Framework no usa innerHTML ni eval
  - Vue sanitiza templates automáticamente
  - Dependencies auditadas para vulnerabilidades
- ⚠️ Tokens no tienen httpOnly flag (porque SessionStorage no lo soporta)
  - Tradeoff aceptado por arquitectura SPA sin SSR
  - Mitigado por session timeout y refresh token rotation

### Data Exposure

- ✅ Embedded objects (`sistema`, `empleado`) pueden contener datos sensibles, PERO:
  - Backend solo incluye datos que el usuario tiene permiso de ver
  - Frontend asume backend ya hizo authorization check
  - SessionStorage es scope per-origin, otros sites no pueden acceder

---

## Edge Cases

### 1. Login Response Malformed

**Scenario**: API response no contiene `access_token` o `usuario`  
**Handling**: `onSaved()` valida presencia y muestra error toast, NO guarda en SessionStorage, NO redirect

### 2. SessionStorage Full

**Scenario**: Quota exceeded al intentar `sessionStorage.setItem()`  
**Handling**: Try-catch en `Application.SaveUserData()`, mostrar toast indicando problema de storage, logout forzado

### 3. Usuario Ya Autenticado

**Scenario**: Usuario con SessionStorage válido navega manualmente a `/login`  
**Handling**: Router guard detecta `CurrentUser() !== null` y redirect automático a `/home`

### 4. Session Expired Durante Uso

**Scenario**: access_token expira mientras usuario usa la app  
**Handling**: 
- Axios interceptor detecta 401 en API calls subsecuentes
- Inter ceptor muestra toast `errors.session_expired`
- Interceptor llama `Application.Logout()` → limpia SessionStorage → redirect `/login`
- **Technical Debt TD-001**: Refresh automático con refresh_token NO implementado en esta fase

### 5. Concurrent Tabs

**Scenario**: Usuario hace login en Tab A, Tab B también está abierto  
**Handling**: SessionStorage es compartido → Tab B detecta cambio con `storage` event listener (si implementado) o en próxima navegación ve `CurrentUser()` válido. **Nota**: Logout en Tab A también afecta Tab B.

---

## Migration & Compatibility

**No aplica** - Esta es feature nueva, no hay migration de schema existente.

**Backward Compatibility**: N/A - Primera versión de autenticación.

**Forward Compatibility**: 
- Si se agrega 2FA en futuro, `User` puede extenderse con nuevos campos opcionales (`twoFactorEnabled`, `twoFactorCode`)
- Si se agrega OAuth, puede crearse `UserOAuth extends BaseEntity` separado sin modificar `User`

---

## Phase 1 Data Model: Complete

**Entities Defined**: 1 (User)  
**Relationships**: 2 (User-Sistema, User-Empleado, ambas external embedded)  
**State Transitions**: Documented  
**Validation Rules**: Client + Server defined  
**Security**: Addressed  
**Edge Cases**: 5 identified & handled  

**Next**: contracts/user-api-contract.md
