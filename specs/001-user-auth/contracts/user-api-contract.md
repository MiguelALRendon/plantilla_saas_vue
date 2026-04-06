# API Contract: Authentication Service

**Service**: auth_service | **Feature**: 001-user-auth | **Date**: 2026-04-06

## Overview

Contrato de API entre el frontend SaaS Vue y el backend `auth_service` para operaciones de autenticación de usuarios. Este contrato documenta el endpoint de login, estructura de request/response, códigos de error y comportamiento esperado.

---

## Base Configuration

| Property | Value | Source |
|----------|-------|--------|
| **Base URL** | `AppConfiguration.apiBaseUrl` | Configurable vía `.env` (VITE_API_BASE_URL) |
| **Default** | `http://localhost:8000` | Development default |
| **Production** | `https://api.production-domain.com` | Overridden in production .env |
| **Timeout** | `AppConfiguration.apiTimeout` | 30000ms (30 segundos) |
| **Retry Attempts** | `AppConfiguration.apiRetryAttempts` | 3 intentos |

---

## Endpoints

### POST /auth/login

**Purpose**: Autenticar usuario con credenciales (username + password) y obtener tokens JWT.

#### Request

**Method**: `POST`  
**URL**: `{baseURL}/auth/login`  
**Content-Type**: `application/json`  
**Authentication**: None (endpoint público)

**Headers**:
```http
POST /auth/login HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json
```

**Body Schema**:
```typescript
{
  usuario: string;     // Required - Username único del usuario
  contraseña: string;  // Required - Password en texto plano
}
```

**Body Example**:
```json
{
  "usuario": "john_doe",
  "contraseña": "MySecurePassword123"
}
```

**Validation Rules**:
- `usuario`: Non-empty string, max 255 chars
- `contraseña`: Non-empty string, max 255 chars
- Ambos campos son obligatorios (400 si falta alguno)

---

#### Response: Success (200 OK)

**Status Code**: `200 OK`  
**Content-Type**: `application/json`

**Schema**:
```typescript
{
  access_token: string;   // JWT token para autenticación de requests subsecuentes
  refresh_token: string;  // JWT token para renovar access_token cuando expire
  usuario: {
    oid: string;          // UUID del usuario
    usuario: string;      // Username (mismo que en request)
    fkSistema: string;    // UUID del sistema al que pertenece el usuario
    sistema: Sistema;     // Objeto Sistema embebido (de catalogues_service)
    fkEmpleado: string;   // UUID del empleado asociado
    empleado: Empleado;   // Objeto Empleado embebido (de branch_service)
    createdAt: string;    // ISO 8601 timestamp de creación
    updatedAt: string;    // ISO 8601 timestamp de última actualización
    creado_por: string;   // UUID del usuario creador
    editado_por: string;  // UUID del usuario editor
    estatus: string;      // 'A' = Activo, 'I' = Inactivo
  };
}
```

**Example**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ZjcxMjg2Yi0wMDAwLTExZWItYWRjMS0wMjQyYWMxMjAwMDIiLCJleHAiOjE3MTQ5OTk5OTl9.abcdef123456",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ZjcxMjg2Yi0wMDAwLTExZWItYWRjMS0wMjQyYWMxMjAwMDIiLCJleHAiOjE3MTc1OTk5OTl9.fedcba654321",
  "usuario": {
    "oid": "5f71286b-0000-11eb-adc1-0242ac120002",
    "usuario": "john_doe",
    "fkSistema": "a1b2c3d4-0000-11eb-adc1-0242ac120002",
    "sistema": {
      "id": "a1b2c3d4-0000-11eb-adc1-0242ac120002",
      "nombre": "Sistema Principal",
      "codigo": "SYS001",
      "estatus": "A"
    },
    "fkEmpleado": "e5f6g7h8-0000-11eb-adc1-0242ac120002",
    "empleado": {
      "id": "e5f6g7h8-0000-11eb-adc1-0242ac120002",
      "nombre": "John",
      "apellido": "Doe",
      "email": "john.doe@company.com",
      "puesto": "Desarrollador",
      "estatus": "A"
    },
    "createdAt": "2026-01-15T08:30:00.000Z",
    "updatedAt": "2026-04-06T10:15:00.000Z",
    "creado_por": "system-admin-uuid",
    "editado_por": "system-admin-uuid",
    "estatus": "A"
  }
}
```

**Token Details**:

| Token | Expiration | Purpose | Storage |
|-------|------------|---------|---------|
| `access_token` | 1 hora | Autorizar requests a API | SessionStorage (`authTokenKey`) |
| `refresh_token` | 30 días | Renovar access_token cuando expire | SessionStorage (`authRefreshTokenKey`) |

**JWT Claims (Decoded)**:
```json
{
  "sub": "5f71286b-0000-11eb-adc1-0242ac120002",  // Usuario OID
  "exp": 1714999999,  // Expiration timestamp (Unix epoch)
  "iat": 1714996399,  // Issued at timestamp
  "type": "access"    // Token type (access vs refresh)
}
```

**Field Notes**:
- `sistema` y `empleado` son objetos complejos cuya estructura puede variar según implementación de servicios externos
- Frontend NO debe asumir estructura fija de estos objetos, tratarlos como opaque data
- `contraseña` NUNCA está presente en response (omitida por seguridad)
- Todos los UUIDs siguen formato RFC 4122

---

#### Response: Error (4xx, 5xx)

##### 400 Bad Request

**Cause**: Request inválido (campos faltantes, formato incorrecto)

**Schema**:
```typescript
{
  message: string;      // Descripción human-readable del error
  details?: string[];   // Array opcional de detalles específicos
}
```

**Example**:
```json
{
  "message": "Validation failed",
  "details": [
    "Field 'usuario' is required",
    "Field 'contraseña' is required"
  ]
}
```

---

##### 401 Unauthorized

**Cause**: Credenciales inválidas (usuario no existe, password incorrecto, usuario inactivo)

**Schema**:
```typescript
{
  message: string;      // Mensaje genérico de error de autenticación
}
```

**Example**:
```json
{
  "message": "Invalid credentials"
}
```

**Security Note**: Backend NO debe indicar si el problema es usuario inexistente vs password incorrecto (para evitar user enumeration attacks). Siempre retorna mensaje genérico "Invalid credentials".

**Status Triggers**:
- Usuario no existe en DB
- Password no coincide con hash Argon2
- Usuario con `estatus = 'I'` (Inactivo)

---

##### 500 Internal Server Error

**Cause**: Error inesperado en servidor (DB connection lost, service timeout, etc.)

**Schema**:
```typescript
{
  message: string;      // Mensaje genérico de error
  error?: string;       // Código de error técnico (opcional, solo en dev)
}
```

**Example**:
```json
{
  "message": "Internal server error occurred",
  "error": "DATABASE_CONNECTION_TIMEOUT"
}
```

---

##### 503 Service Unavailable

**Cause**: Servicio temporalmente no disponible (mantenimiento, sobrecarga)

**Schema**:
```typescript
{
  message: string;
  retry_after?: number; // Segundos hasta que servicio esté disponible
}
```

**Example**:
```json
{
  "message": "Service temporarily unavailable",
  "retry_after": 60
}
```

---

## Authentication Flow

### Sequence Diagram

```
┌─────────┐          ┌──────────────┐          ┌──────────────┐          ┌─────────────┐
│ User    │          │ LoginView    │          │ User Entity  │          │ auth_service│
│ (Browser)│          │ (Vue)        │          │ (BaseEntity) │          │ (Backend)   │
└────┬────┘          └──────┬───────┘          └──────┬───────┘          └──────┬──────┘
     │                      │                          │                         │
     │  1. Fill form       │                          │                         │
     │─────────────────────>│                          │                         │
     │                      │                          │                         │
     │  2. Click "Login"   │                          │                         │
     │─────────────────────>│                          │                         │
     │                      │  3. user.save()         │                         │
     │                      │─────────────────────────>│                         │
     │                      │                          │  4. POST /auth/login   │
     │                      │                          │────────────────────────>│
     │                      │                          │                         │
     │                      │                          │  5. Validate credentials│
     │                      │                          │  6. Query DB           │
     │                      │                          │  7. Check status=A     │
     │                      │                          │  8. Generate JWT tokens│
     │                      │                          │  9. Embed sistema/empleado
     │                      │                          │                         │
     │                      │                          │  10. 200 OK + response │
     │                      │                          │<────────────────────────│
     │                      │  11. onSaved(response)  │                         │
     │                      │<─────────────────────────│                         │
     │                      │  12. Extract tokens     │                         │
     │                      │  13. Clear password     │                         │
     │                      │  14. SaveUserData()     │                         │
     │                      │  15. SessionStorage.set │                         │
     │                      │  16. router.push('/home')│                         │
     │                      │  17. Toast success      │                         │
     │                      │                          │                         │
     │  18. Redirect /home │                          │                         │
     │<─────────────────────│                          │                         │
     │                      │                          │                         │
```

### Error Flow

```
┌─────────┐          ┌──────────────┐          ┌──────────────┐          ┌─────────────┐
│ User    │          │ LoginView    │          │ User Entity  │          │ auth_service│
└────┬────┘          └──────┬───────┘          └──────┬───────┘          └──────┬──────┘
     │                      │                          │                         │
     │  1. Wrong password  │                          │                         │
     │─────────────────────>│                          │                         │
     │                      │  2. user.save()         │                         │
     │                      │─────────────────────────>│                         │
     │                      │                          │  3. POST /auth/login   │
     │                      │                          │────────────────────────>│
     │                      │                          │                         │
     │                      │                          │  4. Validate fails     │
     │                      │                          │  5. 401 Unauthorized   │
     │                      │                          │<────────────────────────│
     │                      │  6. onSavingError(err)  │                         │
     │                      │<─────────────────────────│                         │
     │                      │  7. Toast error message │                         │
     │                      │  8. Mark inputs invalid │                         │
     │                      │                          │                         │
     │  9. See error toast │                          │                         │
     │<─────────────────────│                          │                         │
     │  10. Retry allowed  │                          │                         │
     │                      │                          │                         │
```

---

## Security Specifications

### Password Transmission

- ✅ **HTTPS Required**: Backend MUST enforce HTTPS in production
- ✅ **Plaintext Acceptable Over TLS**: Password sent as plaintext JSON is secure over HTTPS
- ❌ **NO Client-Side Hashing**: Backend expects plaintext, client-side hashing would break Argon2 verification

### Password Storage (Backend)

- ✅ **Argon2 Hashing**: Backend uses Argon2id algorithm (winner of Password Hashing Competition)
- ✅ **Salt Per User**: Each password hash has unique salt
- ✅ **Hash Never Returned**: `contraseña` field omitted from ALL responses

### Token Security

#### Access Token

- **Algorithm**: HMAC-SHA256 (HS256) JWT
- **Expiration**: 1 hour (3600 seconds)
- **Claims**: `sub` (user OID), `exp` (expiration), `iat` (issued at), `type: 'access'`
- **Signature Key**: Server secret (not shared with client)
- **Validation**: Client does NOT validate JWT, only stores and passes it. Backend validates on each request

#### Refresh Token

- **Algorithm**: HMAC-SHA256 (HS256) JWT
- **Expiration**: 30 days (2592000 seconds)
- **Claims**: Similar to access token but with `type: 'refresh'`
- **Usage**: NOT IMPLEMENTED in Phase 1 (Technical Debt TD-001)
  - Future: Client will POST to `/auth/refresh` with refresh_token to get new access_token
  - Current: Client must re-login when access_token expires

### Rate Limiting (Backend)

- **Limit**: 5 login attempts per IP per 15 minutes
- **Response**: 429 Too Many Requests with `Retry-After` header
- **Frontend Handling**: Show error toast, disable login button for N seconds

---

## Client-Side Integration

### Axios Configuration

```typescript
// User.ts - BaseEntity.save() automáticamente usa Application.axiosInstance
// No custom axios config needed, ya configurado en Application initialization

// Axios interceptor (ya existe en Application.ts) agrega auth token a requests:
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(AppConfiguration.value.authTokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios interceptor maneja 401 (token expired):
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired, logout y redirect
      Application.Logout();
    }
    return Promise.reject(error);
  }
);
```

### Error Handling

```typescript
// User.ts
onSavingError(error: any): void {
  console.error('[User.onSavingError]', error);
  
  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  
  let errorKey = 'errors.authentication_failed'; // Default
  
  if (status === 401) {
    errorKey = 'errors.invalid_credentials';
  } else if (status === 400) {
    errorKey = 'errors.validation_error';
  } else if (status === 500) {
    errorKey = 'errors.server_error';
  } else if (status === 503) {
    errorKey = 'errors.service_unavailable';
  }
  
  Application.ApplicationUIService.showToast(
    GetLanguagedText(errorKey),
    ToastType.ERROR
  );
  
  // Mark inputs invalid for visual feedback
  this.validateInputs();
}
```

---

## Testing Contract

### Manual Test Cases

#### TC-001: Login Exitoso

**Preconditions**: Usuario válido en DB con `estatus='A'`, password correcto

**Steps**:
1. Navegar a `/login`
2. Ingresar `usuario: "john_doe"` y `contraseña: "MySecurePassword123"`
3. Click "Login"

**Expected**:
- Status: 200 OK
- Response incluye `access_token`, `refresh_token`, `usuario` object
- Frontend guarda tokens en SessionStorage
- Frontend redirect a `/home`
- Toast "Login successful" aparece

#### TC-002: Credenciales Inválidas

**Preconditions**: Usuario válido pero password incorrecto

**Steps**:
1. Navegar a `/login`
2. Ingresar `usuario: "john_doe"` y `contraseña: "WrongPassword"`
3. Click "Login"

**Expected**:
- Status: 401 Unauthorized
- Response: `{"message": "Invalid credentials"}`
- Inputs marcados como inválidos (borde rojo)
- Toast "Invalid username or password" aparece
- Usuario puede reintentar

#### TC-003: Usuario Inactivo

**Preconditions**: Usuario en DB con `estatus='I'`

**Steps**:
1. Navegar a `/login`
2. Ingresar credentials de usuario inactivo
3. Click "Login"

**Expected**:
- Status: 401 Unauthorized
- Response: `{"message": "Invalid credentials"}`
- Mismo comportamiento que password incorrecto (no revelar que usuario existe pero está inactivo)

#### TC-004: Campos Faltantes

**Preconditions**: N/A

**Steps**:
1. Navegar a `/login`
2. Dejar `usuario` o `contraseña` vacíos
3. Click "Login" (si button enabled) o intentar submit

**Expected**:
- Frontend validation bloquea submit (button disabled)
- Si bypassed (ej: curl), backend retorna 400 Bad Request
- Toast "Validation error" aparece

#### TC-005: Server Error

**Preconditions**: Backend tiene problema (ej: DB down)

**Steps**:
1. Navegar a `/login`
2. Ingresar credentials válidas
3. Click "Login"

**Expected**:
- Status: 500 Internal Server Error
- Toast "Server error occurred" aparece
- Usuario puede reintentar
- No crash en frontend

---

## Versioning & Compatibility

**API Version**: v1 (implícito en `/auth` path, no version suffix)

**Backward Compatibility**: N/A - Primera implementación

**Breaking Changes**: Si estructura de `usuario` object cambia en futuro, considerar:
- Agregar `/v2/auth/login` con nueva estructura
- O usar feature flags para gradual rollout
- O versioning por header (`API-Version: 2`)

**Deprecation Policy**: Si se depreca este endpoint:
- Notificar 6 meses antes via API response header `Deprecation: date="2026-10-06"`
- Proveer migration guide en docs
- Mantener soporte por 12 meses post-deprecation notice

---

## Phase 1 API Contract: Complete

**Endpoints Documented**: 1 (POST /auth/login)  
**Response Codes Covered**: 200, 400, 401, 500, 503  
**Security Specifications**: Password handling, token security, rate limiting  
**Test Cases**: 5 manual TCs defined  

**Next**: quickstart.md
