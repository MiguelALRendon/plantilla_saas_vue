# AsyncValidation Decorator

## 1. Propósito

El decorator AsyncValidation define validaciones asíncronas que requieren peticiones HTTP a servidor o APIs externas para verificar propiedades de entidades BaseEntity. Ejecuta DESPUÉS de validaciones síncronas (@Required y @Validation), permitiendo validaciones complejas como verificar unicidad de valores en base de datos (username exists, email registered), disponibilidad de recursos (appointment time slot available, product stock sufficient), validaciones de negocio con datos externos (customer credit limit, coupon code validity, tax ID verification), formato/contenido contra servicios externos (email domain allowed, postal code valid for country). Almacena función que retorna `Promise<boolean>` junto con mensaje de error en prototype como metadata accesible a través de isAsyncValidation(key) que ejecuta validation function con instancia completa como parámetro, permitiendo lógica que considera múltiples propiedades. Critical para validateInputs() que ejecuta secuencia Required → Validation → AsyncValidation antes de save(). UI muestra spinner durante validación HTTP, resultado cuando completa (checkmark o error message). Requiere manejo de errores (try-catch), timeout para prevenir esperas indefinidas, debounce en UI para reducir requests, y exclusion de ID actual en validaciones de unicidad al editar.

## 2. Alcance

**Responsabilidades cubiertas:**
- Definir función async que retorna Promise<boolean> para validación de propiedad
- Almacenar validation function y error message como metadata en prototype de clase
- Proveer isAsyncValidation(key) que ejecuta validation function con entity instance como parámetro
- Proveer asyncValidationMessage(key) que retorna error message si validation falla
- Integrar en validateInputs() como tercera capa de validación (después de Required y Validation sync)
- Permitir validaciones que acceden a múltiples propiedades de entity (function recibe instance completa)
- Soportar validaciones condicionales (return true si property undefined o dependencies missing)
- Ejecutar HTTP requests a backend para verificar business rules (uniqueness, availability, credit checks)
- Manejar errores de red/servidor con try-catch, retornando boolean safe (típicamente true en error para NO bloquear)

**Límites del alcope:**
- Decorator NO ejecuta validation automáticamente, caller (validateInputs) debe llamar isAsyncValidation(key)
- NO incluye loading state management (UI component responsable de mostrar spinner)
- NO implementa timeout automáticamente (validation function debe manejar timeout con AbortController)
- NO implementa debounce (UI component debe debounce input changes antes de llamar validation)
- NO cachea resultados (cada llamada a isAsyncValidation ejecuta HTTP request nuevamente)
- Backend DEBE implementar endpoints de validación correspondientes, decorator NO crea backend logic
- Validation function retorna boolean, NO arroja exception en failure (return false para invalid)
- Error handling en isAsyncValidation retorna false si function throw exception, NO propaga error
- AsyncValidation ejecuta solo si Required y Validation sync pasan (validateInputs short-circuits en first failure)
- NO modifica entity state (validation function es read-only, salvo asignaciones explícitas como entity.discount)

## 3. Definiciones Clave

**ASYNC_VALIDATION_KEY Symbol:** Identificador único usado como property key en prototype para almacenar Record de async validations por propiedad. Evita colisiones con propiedades normales. Definido como `export const ASYNC_VALIDATION_KEY = Symbol('async_validation')`.

**AsyncValidationMetadata Interface:** Type definition para metadata almacenada. Structure:

```typescript
export interface AsyncValidationMetadata {
    condition: (instance: any) => Promise<boolean>;
    message?: string;
}
```

**NOTA CRÍTICA:** La propiedad se llama **condition**, NO "validation". Esta es la implementación real del framework.

**Decorator Signature:** `function AsyncValidation(validation: (instance: any) => Promise<boolean>, message: string): PropertyDecorator`. Recibe async function que retorna Promise boolean y error message string.

**Validation Function Pattern:** Async function con signature `(entity: BaseEntity) => Promise<boolean>`. Recibe instancia completa permitiendo acceso a múltiples propiedades. Retorna true si valid, false si invalid. Debe manejar exceptions internamente (try-catch).

**isAsyncValidation(key) Accessor:** Método en BaseEntity que ejecuta validation function. Signature: `async isAsyncValidation(key: string): Promise<boolean>`. Retorna true si NO hay decorator (property no requiere async validation), true si validation pasa, false si validation falla o exception thrown.

**asyncValidationMessage(key) Accessor:** Método en BaseEntity que retorna error message. Signature: `asyncValidationMessage(key: string): string`. Retorna message definido en decorator o fallback 'Async validation failed'.

**Validation Timing:** AsyncValidation ejecuta en validateInputs() DESPUÉS de Required y Validation sync. Orden: 1) Required, 2) Validation sync, 3) AsyncValidation. Si Required o Validation fallan, AsyncValidation NO ejecuta (short-circuit optimization).

**Uniqueness Validation Pattern:** Validación que verifica si valor ya existe en base de datos. DEBE excluir ID actual al editar: `excludeId=${entity.id || ''}`. Backend query: `SELECT COUNT(*) FROM table WHERE column = value AND id != excludeId`.

**Timeout Pattern:** Usar AbortController para cancelar requests largos. Pattern: `const controller = new AbortController(); setTimeout(() => controller.abort(), 5000); fetch(url, { signal: controller.signal })`.

**Debounce Pattern:** UI component debe debounce input changes para reducir requests. Typical: 500ms delay después de último keystroke antes de ejecutar async validation.

**Conditional Validation:** Validation function retorna true early si dependencies missing. Example: `if (!entity.postalCode || !entity.country) return true;` (skip validation si campos requeridos vacíos).

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
// src/decorations/async_validation_decorator.ts
export const ASYNC_VALIDATION_KEY = Symbol('async_validation');

export interface AsyncValidationMetadata {
    condition: (entity: any) => Promise<boolean>;
    message?: string;
}

export function AsyncValidation(
    condition: (entity: any) => Promise<boolean>,
    message?: string
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[ASYNC_VALIDATION_KEY]) {
            proto[ASYNC_VALIDATION_KEY] = {};
        }
        proto[ASYNC_VALIDATION_KEY][propertyKey] = { condition, message };
    };
}
```

**IMPORTANTE:** La interface usa `condition` (NO `validation`) y `message` es opcional.

**Parámetros:**
- `condition: (entity: any) => Promise<boolean>` - Función async que retorna true si válido
- `message?: string` - Mensaje de error opcional

**Uso correcto:**
```typescript
export class Customer extends BaseEntity {
    @AsyncValidation(
        async (entity) => {
            const response = await checkEmailUnique(entity.email);
            return response.available;
        },
        'Email already exists'  // Mensaje opcional
    )
    email!: string;
}
```
        const proto = target.constructor.prototype;
        
        // Inicializar Record si NO existe
        if (!proto[ASYNC_VALIDATION_KEY]) {
            proto[ASYNC_VALIDATION_KEY] = {};
        }
        
        // Almacenar validation function y message
        proto[ASYNC_VALIDATION_KEY][propertyKey] = {
            validation: validation,
            message: message
        };
    };
}
```

### Accessors en BaseEntity

```typescript
// src/entities/base_entitiy.ts - Línea 395
public async isAsyncValidation(key: string): Promise<boolean> {
    const asyncValidationData = (this.constructor as any)
        .prototype[ASYNC_VALIDATION_KEY]?.[key];
    
    // Si NO hay decorator, property es válida por defecto
    if (!asyncValidationData) {
        return true;
    }
    
    try {
        const validation = asyncValidationData.validation;
        const result = await validation(this);  // Pasar instance completa
        return result;
    } catch (error) {
        console.error(`[AsyncValidation] Error validating ${key}:`, error);
        return false;  // Treat exceptions como validation failure
    }
}

// Línea 410
public asyncValidationMessage(key: string): string {
    const asyncValidationData = (this.constructor as any)
        .prototype[ASYNC_VALIDATION_KEY]?.[key];
    
    return asyncValidationData?.message || 'Async validation failed';
}
```

### Integración en validateInputs()

```typescript
// src/entities/base_entitiy.ts - Línea 450
public async validateInputs(): Promise<boolean> {
    const constructor = this.constructor as typeof BaseEntity;
    const properties = constructor.getProperties();
    let isValid = true;
    
    for (const prop of properties) {
        // Capa 1: Required
        if (!this.isRequired(prop)) {
            isValid = false;
            continue;  // Skip siguientes validaciones si Required falla
        }
        
        // Capa 2: Validation (sync)
        if (!this.isValidation(prop)) {
            isValid = false;
            continue;  // Skip async validation si sync falla
        }
        
        // Capa 3: AsyncValidation (async)
        const asyncValid = await this.isAsyncValidation(prop);
        if (!asyncValid) {
            isValid = false;
        }
    }
    
    return isValid;
}
```

### Integración en save()

```typescript
// src/entities/base_entitiy.ts - Línea 710
public async save(): Promise<this> {
    // Ejecutar validaciones (incluye async)
    const isValid = await this.validateInputs();
    
    if (!isValid) {
        console.warn('Validation failed, cannot save');
        return this;  // NO ejecutar HTTP save request
    }
    
    // Continuar con CRUD save logic...
    const endpoint = (this.constructor as typeof BaseEntity).getApiEndpoint();
    const isNew = !this.getPrimaryPropertyValue();
    
    const response = await Application.axiosInstance[isNew ? 'post' : 'put'](
        isNew ? endpoint : `${endpoint}/${this.getUniquePropertyValue()}`,
        this.toDictionary()
    );
    
    Object.assign(this, response.data);
    return this;
}
```

### Ejemplo Completo: Verificar Unicidad de Email

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { 
    PropertyName, 
    Required, 
    StringType, 
    AsyncValidation, 
    PrimaryProperty 
} from '@/decorations';
import Application from '@/models/application';

@ModuleName('User', 'Users')
@ApiEndpoint('/api/users')
@Persistent()
export class User extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('User ID', Number)
    id?: number;
    
    @PropertyName('Username', String)
    @Required(true)
    @AsyncValidation(
        async (entity) => {
            try {
                const response = await Application.axiosInstance.get(
                    '/api/users/check-username',
                    {
                        params: {
                            username: entity.username,
                            excludeId: entity.id || ''  // Excluir ID actual al editar
                        }
                    }
                );
                return response.data.available;
            } catch (error) {
                console.error('Username check failed:', error);
                return true;  // Permitir en error de red
            }
        },
        'Username already taken'
    )
    username!: string;
    
    @PropertyName('Email', String)
    @StringType(StringType.EMAIL)
    @Required(true)
    @AsyncValidation(
        async (entity) => {
            try {
                const response = await Application.axiosInstance.get(
                    '/api/users/check-email',
                    {
                        params: {
                            email: entity.email,
                            excludeId: entity.id || ''
                        }
                    }
                );
                return response.data.available;
            } catch (error) {
                console.error('Email check failed:', error);
                return true;
            }
        },
        'Email already registered'
    )
    email!: string;
}

// Uso:
const user = new User({ username: 'john_doe', email: 'john@example.com' });

// Validar antes de guardar
const isValid = await user.validateInputs();
// 1) Required check: username ✓, email ✓
// 2) Validation sync: N/A
// 3) AsyncValidation:
//    - GET /api/users/check-username?username=john_doe&excludeId=
//    - GET /api/users/check-email?email=john@example.com&excludeId=

if (isValid) {
    await user.save();  // POST /api/users
} else {
    console.log('Validation errors:');
    console.log(user.asyncValidationMessage('username'));
    console.log(user.asyncValidationMessage('email'));
}
```

### Ejemplo Completo: Validar Disponibilidad de Recursos

```typescript
@ModuleName('Appointment', 'Appointments')
@ApiEndpoint('/api/appointments')
@Persistent()
export class Appointment extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Appointment ID', Number)
    id?: number;
    
    @PropertyName('Date Time', Date)
    @Required(true)
    dateTime!: Date;
    
    @PropertyName('Doctor', Doctor)
    @Required(true)
    doctor!: Doctor;
    
    @PropertyName('Duration (minutes)', Number)
    @Required(true)
    @Validation((e) => e.duration > 0 && e.duration <= 480, 'Duration between 1-480 minutes')
    @AsyncValidation(
        async (entity) => {
            // Skip si dependencies missing
            if (!entity.dateTime || !entity.doctor || !entity.duration) {
                return true;
            }
            
            try {
                const response = await Application.axiosInstance.post(
                    '/api/appointments/check-availability',
                    {
                        dateTime: entity.dateTime.toISOString(),
                        doctorId: entity.doctor.id,
                        duration: entity.duration,
                        excludeAppointmentId: entity.id || null
                    }
                );
                
                return response.data.available;
            } catch (error) {
                console.error('Availability check failed:', error);
                return false;  // Block save en error (preferir seguridad)
            }
        },
        'Time slot not available for selected doctor'
    )
    duration!: number;
}

// Uso:
const appointment = new Appointment({
    dateTime: new Date('2024-03-15T14:00:00'),
    doctor: doctorInstance,
    duration: 30
});

const isValid = await appointment.validateInputs();
// POST /api/appointments/check-availability
// {
//   dateTime: "2024-03-15T14:00:00.000Z",
//   doctorId: 5,
//   duration: 30,
//   excludeAppointmentId: null
// }
// Response: { available: false } → isValid = false
```

## 5. Flujo de Funcionamiento

### Flujo Completo de Async Validation

```
Usuario completa input y hace blur
        ↓
Input component detecta blur event
        ↓
Debounce timer expira (500ms sin cambios)
        ↓
Component llama entity.isAsyncValidation(propertyKey)
        ↓
Component setea isValidating = true
UI muestra spinner en input
        ↓
isAsyncValidation(key) ejecuta
        ↓
Obtener metadata de prototype
const data = proto[ASYNC_VALIDATION_KEY]?.[key]
        ↓
¿Metadata existe?
    ├─ NO → return true (property no requiere async validation)
    └─ SÍ → Continuar
        ↓
Ejecutar validation function dentro de try-catch
const validation = data.validation
const result = await validation(this)
        ↓
Validation function ejecuta
        ↓
Construir HTTP request
await Application.axiosInstance.get('/api/check-username', {
    params: { username: entity.username, excludeId: entity.id }
})
        ↓
HTTP request enviado a backend
GET /api/check-username?username=john_doe&excludeId=5
        ↓
Backend procesa:
    - Query database: SELECT COUNT(*) FROM users WHERE username = 'john_doe' AND id != 5
    - Count > 0 → username taken → available: false
    - Count = 0 → username available → available: true
        ↓
Backend retorna response
{ available: false }
        ↓
Validation function retorna boolean
return response.data.available  // false
        ↓
isAsyncValidation retorna false
        ↓
Component recibe resultado
isValidating = false
UI oculta spinner
        ↓
Component verifica resultado
if (!result) {
    const message = entity.asyncValidationMessage(propertyKey)
    validationMessages.push(message)
    // 'Username already taken'
    isValid = false
    UI muestra X rojo y error message
}
        ↓
Usuario ve feedback visual
Input con borde rojo, mensaje "Username already taken"
```

### Flujo de validateInputs() con Async

```
Usuario llama save()
await entity.save()
        ↓
save() llama validateInputs()
const isValid = await this.validateInputs()
        ↓
validateInputs() itera sobre properties
const properties = constructor.getProperties()
// ['id', 'username', 'email']
        ↓
Para cada property:
    ↓ (username)
    Capa 1: Required check
    const requiredValid = this.isRequired('username')
    username !== undefined && username !== '' → true
        ↓
    Capa 2: Validation sync
    (no @Validation en username, skip)
        ↓
    Capa 3: AsyncValidation
    const asyncValid = await this.isAsyncValidation('username')
        ↓
        Ejecutar validation function
        await Application.axiosInstance.get('/api/check-username', ...)
        ↓
        Backend retorna { available: false }
        ↓
        return false
    asyncValid = false
    isValid = false  (marker global validation failed)
        ↓
    Continuar con siguiente property
    ↓ (email)
    Capa 1: Required check
    email !== undefined && email !== '' → true
        ↓
    Capa 2: Validation sync
    (no @Validation, skip)
        ↓
    Capa 3: AsyncValidation
    await this.isAsyncValidation('email')
        ↓
        Ejecutar validation function
        await Application.axiosInstance.get('/api/check-email', ...)
        ↓
        Backend retorna { available: true }
        ↓
        return true
    asyncValid = true
        ↓
Loop completo
        ↓
validateInputs() retorna isValid
return false  (porque username falló)
        ↓
save() verifica resultado
if (!isValid) {
    console.warn('Validation failed')
    return this  // NO ejecutar HTTP save request
}
```

### Flujo con Exception Handling

```
Usuario llama validateInputs()
        ↓
Ejecutar isAsyncValidation('email')
        ↓
Validation function ejecuta dentro de try-catch
try {
    const response = await Application.axiosInstance.get('/api/check-email', ...)
}
        ↓
Network error ocurre (servidor down, timeout, etc)
        ↓
Axios throw exception
AxiosError: Network Error
        ↓
catch block en validation function
catch (error) {
    console.error('Email check failed:', error)
    return true  // Permitir en error (fail-open strategy)
}
        ↓
Validation function retorna true
        ↓
isAsyncValidation retorna true
        ↓
Property considerada válida por network error
Usuario puede continuar con save()
```

### Flujo con Timeout Pattern

```
Validation function con AbortController
        ↓
Crear controller y timeout
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)
        ↓
Ejecutar fetch con signal
const response = await fetch('/api/check-document', {
    signal: controller.signal,
    method: 'POST',
    body: JSON.stringify({ documentNumber: entity.documentNumber })
})
        ↓
Caso A: Response llega antes de 5s
    ↓
    clearTimeout(timeout)  // Cancelar abort
    ↓
    return (await response.json()).valid
    ↓
    Validation completa normalmente

Caso B: Response NO llega en 5s
    ↓
    setTimeout ejecuta después de 5000ms
    ↓
    controller.abort() llamado
    ↓
    Fetch throw AbortError
    ↓
    catch block detecta error
    catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Validation timeout')
            return true  // Fail-open: permitir en timeout
        }
        throw error
    }
    ↓
    return true (validation pass por timeout)
```

## 6. Reglas Obligatorias

**Regla 1:** Validation function DEBE retornar Promise<boolean>. NO retornar boolean sync ni otro type.

**Regla 2:** AsyncValidation ejecuta DESPUÉS de Required y Validation sync. validateInputs() respeta orden estricto.

**Regla 3:** Validation function DEBE manejar exceptions con try-catch. NO permitir exceptions sin catch propagarse.

**Regla 4:** Uniqueness validations DEBEN excluir ID actual. URL params: `excludeId=${entity.id || ''}`.

**Regla 5:** Validation function con dependencies DEBE return true early si dependencies missing. Example: `if (!entity.prop1 || !entity.prop2) return true;`.

**Regla 6:** Backend DEBE implementar endpoints de validación correspondientes. Frontend decorator inútil sin backend support.

**Regla 7:** UI component DEBE debounce input changes antes de llamar async validation. Typical delay: 500ms.

**Regla 8:** Timeout DEBE implementarse en validation function con AbortController. NO permitir requests indefinidos.

**Regla 9:** isAsyncValidation() catch block retorna false. Exception tratado como validation failure.

**Regla 10:** Validation function recibe instance completa. Puede acceder a TODAS las propiedades de entity.

## 7. Prohibiciones

**Prohibido:** Retornar boolean sync desde validation function. DEBE retornar Promise<boolean> usando async/await.

**Prohibido:** Ejecutar async validation sin Required y Validation sync pasando primero. validateInputs() short-circuits.

**Prohibido:** Omitir try-catch en validation function. Network errors deben manejarse, NO propagarse.

**Prohibido:** Validar uniqueness sin excluir ID actual. Editar entity siempre fallaría (entity.id === entity.id).

**Prohibido:** Ejecutar async validation en cada keystroke sin debounce. Sobrecarga servidor con requests innecesarios.

**Prohibido:** Asumir que backend siempre disponible. Manejar network errors con fail-open (return true) o fail-closed (return false) según criticidad.

**Prohibido:** Usar async validation para validaciones que pueden ser síncronas. Regex, range checks, format validation deben usar @Validation.

**Prohibido:** Cachear resultados de async validation. Cada llamada debe re-fetch para garantizar datos actuales.

**Prohibido:** Modificar entity state dentro de validation function salvo casos específicos (discount calculation). Validation debe ser read-only.

**Prohibido:** Depender exclusivamente de validación frontend. Backend DEBE re-validar todas las rules antes de persistir.

## 8. Dependencias

**Decoradores Relacionados:**
- @Required: Primera capa de validación, ejecuta antes de AsyncValidation
- @Validation: Segunda capa (sync), ejecuta antes de AsyncValidation
- @PropertyName: Define nombre de propiedad usado en error messages
- @StringType: Define tipo de input (EMAIL, URL) para validaciones específicas
- @PrimaryProperty: Define ID usado en excludeId params para uniqueness validation

**BaseEntity Methods:**
- validateInputs(): Ejecuta sequence Required → Validation → AsyncValidation
- isAsyncValidation(key): Ejecuta validation function y retorna boolean
- asyncValidationMessage(key): Retorna error message de validation failure
- save(): Llama validateInputs() antes de HTTP save request
- isRequired(key): Primera validación ejecutada en validateInputs()
- isValidation(key): Segunda validación ejecutada en validateInputs()

**Application Singleton:**
- Application.axiosInstance: Cliente HTTP usado para hacer validation requests a backend
- Application.ApplicationUIService: Puede usarse para mostrar toasts de validación

**HTTP Libraries:**
- axios: Usado en validation functions para GET/POST requests
- fetch API: Alternativa a axios, soporta AbortController para timeout

**Backend Endpoints:**
- /api/users/check-username: Verifica disponibilidad de username
- /api/users/check-email: Verifica disponibilidad de email
- /api/products/check-sku: Verifica unicidad de SKU
- /api/appointments/check-availability: Verifica disponibilidad de time slot
- Otros endpoints custom según business rules

## 9. Relaciones

**Relación con validateInputs() (secuencial 1:N):**
validateInputs() llama isAsyncValidation() para CADA property con @AsyncValidation decorator. Orden secuencial: property 1 async validation → property 2 async validation → property N async validation.

**Relación con @Required (secuencial prerequisite):**
@Required ejecuta ANTES de @AsyncValidation en validateInputs(). Si Required falla, AsyncValidation NO ejecuta (short-circuit).

**Relación con @Validation (secuencial prerequisite):**
@Validation sync ejecuta ANTES de @AsyncValidation. Si Validation falla, AsyncValidation NO ejecuta.

**Relación con save() (prerequisite 1:1):**
save() llama validateInputs() UNA VEZ antes de HTTP request. Si validateInputs() retorna false (incluye async validation failures), save() NO ejecuta POST/PUT.

**Relación con Backend Endpoints (N:1 coordinated):**
Múltiples validation functions pueden llamar MISMO endpoint con diferentes params. Example: check-username y check-email pueden usar MISMO `/api/check-unique` endpoint con param `field`.

**Relación con UI Components (1:1 per property):**
Cada input component con property que tiene @AsyncValidation debe manejar loading state (spinner), debounce, y error display.

**Relación con AbortController (optional 1:1):**
Validation function puede crear ONE AbortController por invocation para timeout management.

## 10. Notas de Implementación

### Ejemplo 1: Stack Completo de Validación en Property

```typescript
@PropertyName('Username', String)
@Required(true)  // Nivel 1: Campo obligatorio
@Validation(
    (entity) => /^[a-zA-Z0-9_]{3,20}$/.test(entity.username),
    'Username: 3-20 chars, alphanumeric and underscore only'
)  // Nivel 2: Formato válido (sync)
@AsyncValidation(
    async (entity) => {
        try {
            const response = await Application.axiosInstance.get(
                '/api/users/check-username',
                { params: { username: entity.username, excludeId: entity.id || '' } }
            );
            return response.data.available;
        } catch (error) {
            console.error('Username check failed:', error);
            return true;  // Fail-open en network error
        }
    },
    'Username already taken'
)  // Nivel 3: Disponibilidad (async)
username!: string;

// validateInputs() ejecuta en orden:
// 1. isRequired('username') → ¿vacío? → NO bloquear
// 2. isValidation('username') → ¿formato correcto? → NO bloquear
// 3. isAsyncValidation('username') → ¿disponible? → SI bloquear si taken
```

### Ejemplo 2: Validación Condicional (Multi-Property)

```typescript
@ModuleName('Order', 'Orders')
export class Order extends BaseEntity {
    @PropertyName('Country', String)
    @Required(true)
    country!: string;
    
    @PropertyName('Postal Code', String)
    @Required(true)
    @AsyncValidation(
        async (entity) => {
            // Skip validation si country NO definido
            if (!entity.postalCode || !entity.country) {
                return true;
            }
            
            try {
                const response = await Application.axiosInstance.post(
                    '/api/validate-postal-code',
                    {
                        postalCode: entity.postalCode,
                        country: entity.country
                    },
                    { timeout: 5000 }
                );
                return response.data.valid;
            } catch (error) {
                console.error('Postal code validation failed:', error);
                return true;  // Fail-open
            }
        },
        'Invalid postal code for selected country'
    )
    postalCode!: string;
}

// Uso:
const order = new Order({ country: 'US', postalCode: '12345' });
await order.validateInputs();
// POST /api/validate-postal-code
// { postalCode: "12345", country: "US" }

const order2 = new Order({ postalCode: '12345' });  // Sin country
await order2.validateInputs();
// AsyncValidation NO ejecuta HTTP request (return true early)
```

### Ejemplo 3: Timeout con AbortController

```typescript
@PropertyName('Document Number', String)
@Required(true)
@AsyncValidation(
    async (entity) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
            const response = await fetch('/api/validate-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    documentNumber: entity.documentNumber,
                    documentType: entity.documentType
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                return false;
            }
            
            const data = await response.json();
            return data.valid;
        } catch (error: any) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.warn('[AsyncValidation] Timeout after 5s');
                return true;  // Permitir en timeout
            }
            
            console.error('[AsyncValidation] Fetch error:', error);
            return false;  // Fail-closed en otros errors
        }
    },
    'Document number validation failed or timeout'
)
documentNumber!: string;
```

### Ejemplo 4: UI Component con Debounce y Loading State

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { BaseEntity } from '@/entities/base_entitiy';

const props = defineProps<{
    entity: BaseEntity;
    propertyKey: string;
}>();

const modelValue = computed({
    get: () => props.entity[props.propertyKey],
    set: (value) => {
        props.entity[props.propertyKey] = value;
    }
});

const isValidating = ref(false);
const hasValidated = ref(false);
const isValid = ref(true);
const validationMessage = ref('');
const debounceTimer = ref<number | null>(null);

const validateAsync = async () => {
    isValidating.value = true;
    hasValidated.value = false;
    
    const result = await props.entity.isAsyncValidation(props.propertyKey);
    
    isValidating.value = false;
    hasValidated.value = true;
    isValid.value = result;
    
    if (!result) {
        validationMessage.value = props.entity.asyncValidationMessage(props.propertyKey);
    } else {
        validationMessage.value = '';
    }
};

// Debounce: ejecutar validation 500ms después de último cambio
watch(modelValue, () => {
    if (debounceTimer.value !== null) {
        clearTimeout(debounceTimer.value);
    }
    
    hasValidated.value = false;
    
    debounceTimer.value = setTimeout(async () => {
        await validateAsync();
    }, 500) as unknown as number;
});

const handleBlur = async () => {
    // Cancelar debounce y validar inmediatamente en blur
    if (debounceTimer.value !== null) {
        clearTimeout(debounceTimer.value);
    }
    await validateAsync();
};
</script>

<template>
    <div class="async-input-wrapper" :class="{ 
        validating: isValidating, 
        valid: hasValidated && isValid,
        invalid: hasValidated && !isValid
    }">
        <label>{{ entity.getPropertyNameByKey(propertyKey) }}</label>
        
        <div class="input-container">
            <input 
                v-model="modelValue"
                @blur="handleBlur"
                :disabled="isValidating"
            />
            
            <span v-if="isValidating" class="spinner">
                <i class="icon-spinner spinning"></i>
            </span>
            
            <span v-else-if="hasValidated && isValid" class="checkmark">
                <i class="icon-check text-green"></i>
            </span>
            
            <span v-else-if="hasValidated && !isValid" class="error-icon">
                <i class="icon-x text-red"></i>
            </span>
        </div>
        
        <div v-if="validationMessage" class="error-message">
            {{ validationMessage }}
        </div>
    </div>
</template>

<style scoped>
.async-input-wrapper.validating input {
    opacity: 0.6;
    pointer-events: none;
}

.spinner .icon-spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.error-message {
    color: red;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}
</style>
```

### Ejemplo 5: Validación con Side Effects (Discount Calculation)

```typescript
@PropertyName('Coupon Code', String)
@AsyncValidation(
    async (entity) => {
        // Skip si no hay coupon code
        if (!entity.couponCode || entity.couponCode.trim() === '') {
            entity.discount = 0;
            return true;
        }
        
        try {
            const response = await Application.axiosInstance.post(
                '/api/coupons/validate',
                {
                    code: entity.couponCode,
                    customerId: entity.customer?.id,
                    orderTotal: entity.subtotal,
                    orderDate: new Date().toISOString()
                },
                { timeout: 3000 }
            );
            
            if (response.data.valid) {
                // Side effect: actualizar discount en entity
                entity.discount = response.data.discountAmount;
                entity.total = entity.subtotal - entity.discount;
                return true;
            } else {
                entity.discount = 0;
                entity.total = entity.subtotal;
                return false;
            }
        } catch (error) {
            console.error('Coupon validation failed:', error);
            entity.discount = 0;
            return false;  // Fail-closed: coupon inválido en error
        }
    },
    'Invalid or expired coupon code'
)
couponCode?: string;

// Uso:
const order = new Order({ 
    subtotal: 100, 
    couponCode: 'SAVE20' 
});

const isValid = await order.validateInputs();
// POST /api/coupons/validate
// Response: { valid: true, discountAmount: 20 }
// Side effect: order.discount = 20, order.total = 80
```

### Ejemplo 6: Backend Endpoint Pattern (Express.js)

```typescript
// Backend: /api/users/check-username endpoint
router.get('/api/users/check-username', async (req, res) => {
    const { username, excludeId } = req.query;
    
    // Validar params
    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }
    
    try {
        // Query database excluyendo ID actual
        const query = excludeId 
            ? { username, _id: { $ne: excludeId } }
            : { username };
        
        const count = await User.countDocuments(query);
        
        // available: true si count === 0 (username NO existe)
        res.json({ available: count === 0 });
    } catch (error) {
        console.error('Check username error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Frontend validation function hace:
// GET /api/users/check-username?username=john_doe&excludeId=5
// Response: { available: false } (username exists)
```

### Consideración: Fail-Open vs Fail-Closed Strategy

```typescript
// Fail-Open: Permitir en error (menor seguridad, mejor UX)
@AsyncValidation(
    async (entity) => {
        try {
            const response = await checkAvailability(entity.value);
            return response.available;
        } catch (error) {
            console.error('Validation failed:', error);
            return true;  // Permitir continuar en network error
        }
    },
    'Resource not available'
)

// Fail-Closed: Bloquear en error (mayor seguridad, peor UX)
@AsyncValidation(
    async (entity) => {
        try {
            const response = await checkCreditLimit(entity.amount);
            return response.approved;
        } catch (error) {
            console.error('Credit check failed:', error);
            return false;  // Bloquear en network error (más seguro)
        }
    },
    'Credit check failed'
)
```

### Pattern: Validación con Custom Error Message Dinámico

```typescript
@PropertyName('Quantity', Number)
@Required(true)
@Validation((e) => e.quantity > 0, 'Quantity must be positive')
@AsyncValidation(
    async (entity) => {
        if (!entity.product || !entity.quantity) {
            return true;
        }
        
        try {
            const response = await Application.axiosInstance.get(
                `/api/products/${entity.product.id}/check-stock`,
                { params: { quantity: entity.quantity } }
            );
            
            if (!response.data.available) {
                // Custom dynamic message basado en stock disponible
                const availableStock = response.data.availableStock;
                entity._customAsyncMessage = 
                    `Only ${availableStock} units available (requested ${entity.quantity})`;
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Stock check failed:', error);
            return true;
        }
    },
    'Insufficient stock'
)
quantity!: number;

// Override asyncValidationMessage para usar custom message
public override asyncValidationMessage(key: string): string {
    if (key === 'quantity' && this._customAsyncMessage) {
        const message = this._customAsyncMessage;
        delete this._customAsyncMessage;  // Clear después de uso
        return message;
    }
    return super.asyncValidationMessage(key);
}
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- required-decorator.md: Primera capa de validación antes de AsyncValidation
- validation-decorator.md: Segunda capa de validación sync antes de AsyncValidation
- property-name-decorator.md: Define nombres usados en error messages
- ../02-base-entity/validation-system.md: Sistema completo de validaciones
- ../02-base-entity/crud-operations.md: save() llama validateInputs() con async validation
- ../03-application/application-singleton.md: Application.axiosInstance usado en validation functions
- ../../tutorials/02-validations.md: Tutorial de validaciones incluye async patterns
- ../../02-FLOW-ARCHITECTURE.md: Flujo de validación en arquitectura

**Archivos fuente:**
- src/decorations/async_validation_decorator.ts: Implementación del decorator (línea 5), ASYNC_VALIDATION_KEY Symbol, AsyncValidationMetadata interface, AsyncValidation function
- src/entities/base_entitiy.ts: isAsyncValidation() método (línea 395), asyncValidationMessage() método (línea 410), validateInputs() integration (línea 450), save() integration (línea 710)
- src/components/Form/TextInputComponent.vue: UI implementation con debounce y loading state
- src/views/default_detailview.vue: Vista donde se ejecutan validaciones async

**Líneas relevantes en código:**
- Línea 5 (async_validation_decorator.ts): Definición de ASYNC_VALIDATION_KEY Symbol, AsyncValidationMetadata interface, función AsyncValidation con storage en prototype
- Línea 395 (base_entitiy.ts): isAsyncValidation() ejecuta validation function con try-catch, retorna boolean
- Línea 410 (base_entitiy.ts): asyncValidationMessage() retorna error message o fallback
- Línea 450 (base_entitiy.ts): validateInputs() ejecuta sequence Required → Validation → AsyncValidation
- Línea 710 (base_entitiy.ts): save() llama validateInputs(), bloquea save si validation falla

**Última actualización:** 11 de Febrero, 2026
