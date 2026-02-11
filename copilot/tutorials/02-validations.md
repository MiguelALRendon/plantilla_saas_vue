# Tutorial 2: Sistema de Validaciones

## 1. Propósito

Este tutorial proporciona instrucciones completas para implementar y dominar el sistema de validación de 3 niveles del framework. El desarrollador aprenderá a implementar validaciones Required, síncronas y asíncronas, con mensajes personalizados y lógica condicional.

### Objetivos de Aprendizaje

El desarrollador implementará:
- Validaciones de campos requeridos con decorador @Required
- Validaciones síncronas con decorador @Validation
- Validaciones asíncronas con decorador @AsyncValidation
- Mensajes de error personalizados y descriptivos
- Validaciones condicionales basadas en estado de entidad
- Validación manual vs automática en eventos de guardado

Duración estimada de implementación: 25-30 minutos

## 2. Alcance

### Incluye

- Implementación de validaciones Required básicas y condicionales
- Creación de validaciones síncronas para reglas de negocio
- Implementación de validaciones asíncronas para verificación en servidor
- Configuración de mensajes de error personalizados
- Validaciones cross-field entre múltiples propiedades
- Validación manual mediante métodos programáticos
- Integración con sistema de visualización de errores en UI

### No Incluye

- Validaciones del lado del servidor (backend validation)
- Manejo de errores HTTP de APIs externas
- Validaciones de archivos o uploads
- Validaciones geoespaciales o específicas de dominio complejo
- Integración con librerías de validación terceras (Yup, Zod, etc.)
- Performance optimization para validaciones extremadamente complejas

## 3. Definiciones Clave

### Términos Fundamentales

**Validación Required**: Primer nivel de validación que verifica presencia de valor en propiedad marcada como obligatoria. Se ejecuta antes de cualquier otra validación.

**Validación Síncrona**: Segundo nivel de validación que ejecuta función síncrona para verificar reglas de negocio. Retorna boolean inmediatamente sin operaciones asíncronas.

**Validación Asíncrona**: Tercer nivel de validación que ejecuta función asíncrona (async/await) típicamente para verificación en servidor. Retorna Promise<boolean>.

**Función de Validación**: Función que recibe entidad completa como parámetro y retorna boolean indicando validez (true = válido, false = inválido).

**Mensaje de Validación**: String descriptivo que se muestra al usuario cuando validación falla. Debe ser claro y específico sobre el problema.

**validatedInputs**: Estado booleano por propiedad que indica si la propiedad pasó todas sus validaciones.

**validationMessages**: Array de strings conteniendo todos los mensajes de error activos para una propiedad específica.

**validateInputs()**: Método de BaseEntity que ejecuta todas las validaciones de todas las propiedades en secuencia de 3 niveles.

**Validación Condicional**: Validación que solo se aplica cuando se cumple cierta condición del estado de la entidad.

## 4. Descripción Técnica

### Arquitectura del Sistema de Validación

El framework implementa un sistema de validación de 3 niveles secuenciales donde cada nivel debe pasar antes de ejecutar el siguiente. La validación se almacena como metadata mediante decoradores y se ejecuta en runtime.

### Nivel 1: Validación Required

**Decorador:**
```typescript
@Required(condition: boolean | ((entity: BaseEntity) => boolean), message?: string)
```

**Funcionamiento:**
- Verifica presencia de valor (no null, no undefined, no string vacío)
- Puede ser boolean estático o función que retorna boolean
- Se ejecuta primero, antes de cualquier otra validación
- Si falla, previene ejecución de validaciones subsecuentes

**Metadata Almacenada:**
- `validation_required`: boolean o función
- `validation_required_message`: string de mensaje personalizado

### Nivel 2: Validación Síncrona

**Decorador:**
```typescript
@Validation(validationFn: (entity: BaseEntity) => boolean, message: string)
```

**Funcionamiento:**
- Ejecuta función síncrona que verifica regla de negocio
- Función recibe entidad completa, permitiendo acceso a todas las propiedades
- Retorna boolean inmediatamente (true = válido, false = inválido)
- No debe contener operaciones asíncronas (no await, no Promises)
- Múltiples decoradores @Validation pueden aplicarse a una propiedad

**Metadata Almacenada:**
- `validation_function`: Array de funciones de validación
- `validation_message`: Array de strings de mensajes

**Casos de Uso:**
- Validación de rangos numéricos
- Validación de formato con regex
- Validación de longitud de string
- Validación cross-field entre propiedades
- Validación de reglas de negocio complejas

### Nivel 3: Validación Asíncrona

**Decorador:**
```typescript
@AsyncValidation(
    asyncFn: (entity: BaseEntity) => Promise<boolean>, 
    message: string
)
```

**Funcionamiento:**
- Ejecuta función asíncrona que típicamente llama a API
- Función recibe entidad completa
- Retorna Promise que resuelve a boolean
- Se ejecuta después de validaciones Required y síncronas
- Puede contener operaciones de red, consultas a DB, etc.

**Metadata Almacenada:**
- `async_validation_function`: Array de funciones asíncronas
- `async_validation_message`: Array de strings de mensajes

**Casos de Uso:**
- Verificación de unicidad en base de datos
- Validación de códigos/IDs existentes en sistema externo
- Verificación de disponibilidad de recursos
- Validación de credenciales o permisos

### Flujo de Ejecución de Validaciones

```
Trigger (Save o validateInputs())
    ↓
Para cada propiedad en orden de PropertyIndex:
    ↓
    1. Ejecutar isRequired()
       ├─ Si Required configurado:
       │  ├─ Evaluar condición (boolean o función)
       │  ├─ Verificar presencia de valor
       │  └─ Retornar boolean
       ├─ Si falla: agregar mensaje, marcar inválido, DETENER
       └─ Si pasa o no configurado: continuar
    ↓
    2. Ejecutar isValidation()
       ├─ Para cada @Validation en la propiedad:
       │  ├─ Ejecutar función síncrona con entidad
       │  ├─ Capturar retorno boolean
       │  └─ Si false: agregar mensaje
       └─ Si alguna falla: marcar inválido, continuar a async
    ↓
    3. Ejecutar isAsyncValidation()
       ├─ Para cada @AsyncValidation en la propiedad:
       │  ├─ Await ejecución de función asíncrona
       │  ├─ Capturar retorno Promise<boolean>
       │  └─ Si false: agregar mensaje
       └─ Si alguna falla: marcar inválido
    ↓
Consolidar resultados de todas las propiedades
    ↓
Retornar boolean general (true si todas válidas)
```

### Sistema de Mensajes de Error

**Almacenamiento:**
```typescript
// En BaseEntity
validationMessages: Map<string, string[]> = new Map();
```

**Gestión:**
- Cada propiedad mantiene array de mensajes activos
- Mensajes se agregan cuando validación falla
- Mensajes se limpian al inicio de nueva validación
- UI lee mensajes y los renderiza bajo los inputs

**Acceso:**
```typescript
entity.validationMessage('propertyName'); // Retorna primer mensaje
entity.validationMessages.get('propertyName'); // Retorna array completo
```

## 5. Flujo de Funcionamiento

### Flujo Completo de Validación al Guardar

```
Usuario completa formulario
    ↓
Click botón "Save"
    ↓
entity.save() ejecuta
    ↓
Llamada a validateInputs()
    ↓
Emite evento 'validate-inputs' via mitt event bus
    ↓
Todos los componentes de input escuchan evento
    ↓
Cada input ejecuta su método isValidated():
    │
    ├─ Leer metadata de decoradores
    ├─ Ejecutar secuencia de 3 niveles
    ├─ Actualizar estado validationMessages
    ├─ Actualizar estado validatedInputs
    └─ Emitir evento de actualización al componente
    ↓
Componentes input re-renderizan con clases CSS según válido/inválido
    ↓
Mensajes de error aparecen bajo inputs inválidos
    ↓
validateInputs() retorna boolean consolidado
    ↓
¿Todas las propiedades válidas?
    │
    ├─ SÍ → Continúa con save()
    │       ├─ Serialización
    │       ├─ HTTP Request
    │       └─ Navegación
    │
    └─ NO → Detiene save()
            ├─ Application.View.value.isValid = false
            ├─ Toast opcional de error
            └─ Usuario ve errores en formulario
```

### Flujo de Validación Manual

```
Desarrollador llama entity.validateInputs()
    ↓
Ejecución secuencial de validaciones
    ↓
Retorna Promise<boolean>
    ↓
Desarrollador maneja resultado:
    │
    ├─ true → Acción personalizada
    └─ false → Manejo personalizado de errores
```

### Flujo de Validación Condicional

```
@Required((entity) => entity.type === 'VIP')
    ↓
Al validar:
    ├─ Evaluar función con entidad actual
    ├─ Función retorna boolean
    └─ Si true: aplicar validación Required
        Si false: skip validación Required
```

## 6. Reglas Obligatorias

### Reglas de Decorador @Required

1. @Required DEBE aplicarse solo a propiedades con tipo no opcional (!).
2. Si @Required recibe función, la función DEBE retornar boolean.
3. Si @Required recibe función, la función NO DEBE ser asíncrona.
4. El mensaje personalizado en @Required es opcional pero recomendado.
5. @Required NO puede aplicarse múltiples veces a la misma propiedad.

### Reglas de Decorador @Validation

1. @Validation DEBE recibir función que retorna boolean.
2. La función de validación NO DEBE ser asíncrona (no async, no await).
3. La función de validación DEBE ser pura (sin side effects).
4. El mensaje de validación es obligatorio en @Validation.
5. Múltiples @Validation pueden aplicarse a la misma propiedad.
6. La función recibe entidad completa, NO solo el valor de la propiedad.

### Reglas de Decorador @AsyncValidation

1. @AsyncValidation DEBE recibir función async que retorna Promise<boolean>.
2. La función asíncrona DEBE manejar errores internamente (try/catch).
3. La función asíncrona NO DEBE lanzar excepciones sin capturar.
4. El mensaje de validación es obligatorio en @AsyncValidation.
5. Múltiples @AsyncValidation pueden aplicarse a la misma propiedad.
6. La función DEBE tener timeout implícito o explícito para evitar bloqueos.

### Reglas de Orden de Ejecución

1. Las validaciones DEBEN ejecutarse en orden: Required → Validation → AsyncValidation.
2. Si Required falla, validaciones Validation y AsyncValidation NO se ejecutan.
3. Si Validation falla, AsyncValidation SÍ se ejecuta (no bloquea).
4. Múltiples decoradores del mismo tipo se ejecutan en orden de declaración.

### Reglas de Mensajes

1. Los mensajes DEBEN ser descriptivos y específicos del problema.
2. Los mensajes NO DEBEN contener jerga técnica incomprensible para usuarios.
3. Los mensajes DEBEN indicar qué espera el sistema, no solo qué está mal.
4. Los mensajes NO DEBEN exceder 100 caracteres para mantener UI limpia.

## 7. Prohibiciones

### Prohibiciones de Implementación

1. NO usar funciones asíncronas en @Validation. Usar @AsyncValidation en su lugar.
2. NO modificar directamente validationMessages Map. Usar métodos de BaseEntity.
3. NO llamar a APIs externas en @Validation síncrona.
4. NO usar @Required con propiedades opcionales (?). Resultado: inconsistencia de tipos.
5. NO omitir mensajes de error en decoradores. Los mensajes son obligatorios excepto en @Required.
6. NO crear validaciones con side effects (modificar estado, escribir logs excesivos).

### Prohibiciones de Lógica

1. NO crear validaciones circulares (A valida B, B valida A).
2. NO crear validaciones extremadamente costosas computacionalmente en @Validation síncrona.
3. NO asumir que AsyncValidation siempre completa. Implementar timeouts.
4. NO validar misma regla en múltiples decoradores duplicados.
5. NO confiar únicamente en validaciones frontend. Backend DEBE validar también.

### Prohibiciones de UX

1. NO mostrar más de 3 mensajes de error por campo simultáneamente.
2. NO usar mensajes genéricos como "Error" o "Invalid".
3. NO validar mientras usuario está escribiendo (excepto en casos específicos con debounce).
4. NO bloquear UI durante validaciones assíncronas sin indicador visual.

## 8. Dependencias

### Dependencias de Código

**Obligatorias:**
- `BaseEntity` de `@/entities/base_entitiy` - Métodos de validación
- `@Required` de `@/decorations` - Decorador Required
- `@Validation` de `@/decorations` - Decorador Validation síncrona
- `@AsyncValidation` de `@/decorations` - Decorador Validation asíncrona
- `Application` de `@/models/application` - Axios instance para llamadas API

**Opcionales:**
- Expresiones regulares para validación de formato
- Librerías de utilidades de validación personalizadas

### Dependencias de Framework

- Reflect Metadata API - Almacenamiento y lectura de metadata de decoradores
- Vue 3 Reactivity System - Actualización de UI basada en estado de validación
- Mitt Event Bus - Comunicación entre BaseEntity y componentes de input

### API Externa

Para validaciones asíncronas, se requiere:
- Endpoint de verificación de unicidad (ej: `/api/users/check-email`)
- Endpoint de verificación de existencia (ej: `/api/products/check-code`)
- Timeouts configurados en Axios instance

## 9. Relaciones

### Relaciones con Otros Tutoriales

**Tutorial 01 (CRUD Básico)**: Este tutorial extiende las validaciones básicas del Tutorial 01 con:
- Validaciones asíncronas que no se cubrieron en Tutorial 01
- Validaciones condicionales más complejas
- Validaciones cross-field elaboradas

**Tutorial 03 (Relaciones)**: Las validaciones de este tutorial aplican también a:
- Objetos anidados validación de propiedades del objeto relacionado
- Arrays: validación de longitud mínima/máxima
- Lookups: validación de existencia de entidad relacionada

### Relaciones con Capas del Framework

**Capa de Decoradores (01-decorators/):**
- required-decorator.md - Especificación completa de @Required
- validation-decorator.md - Especificación de @Validation
- async-validation-decorator.md - Especificación de @AsyncValidation

**Capa de Base Entity (02-base-entity/):**
- validation-system.md - Implementación interna del sistema
- crud-operations.md - Integración de validación en save()

**Capa de Componentes (04-components/):**
- TextInputComponent - Renderizado de mensajes de validación
- NumberInputComponent - Estados de validación visual
- Todos los inputs implementan manejo de validación

## 10. Notas de Implementación

### Requisitos Previos

**Tutorial previo completado:**
- Tutorial 01-basic-crud.md debe estar completo
- Entidad Book debe estar funcionando
- Comprensión de decoradores básicos

**Conocimientos necesarios:**
- Decoradores TypeScript
- Async/await y Promises de JavaScript
- Expresiones regulares básicas (regex)

### Ejemplo 1: Formulario de Registro de Usuario

**Entidad User con Validaciones Completas:**

```typescript
import { BaseEntity } from './base_entitiy';
import {
    PropertyName,
    PropertyIndex,
    Required,
    Validation,
    AsyncValidation,
    StringTypeDef,
    ModuleName,
    ApiEndpoint,
    Persistent
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import Application from '@/models/application';

@ModuleName('User', 'Users')
@ApiEndpoint('/api/users')
@Persistent(true, 'id')
export class User extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    id?: number;
    
    @PropertyIndex(2)
    @PropertyName('Username', String)
    @Required(true, 'Username is required')
    @Validation(
        (entity) => entity.username.length >= 3,
        'Username must be at least 3 characters'
    )
    @AsyncValidation(
        async (entity) => {
            const response = await Application.axiosInstance.get(
                `/api/users/check-username?username=${entity.username}`
            );
            return response.data.available;
        },
        'Username already taken'
    )
    username!: string;
    
    @PropertyIndex(3)
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true, 'Email is required')
    @AsyncValidation(
        async (entity) => {
            const response = await Application.axiosInstance.get(
                `/api/users/check-email?email=${entity.email}`
            );
            return response.data.available;
        },
        'Email already registered'
    )
    email!: string;
    
    @PropertyIndex(4)
    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true, 'Password is required')
    @Validation(
        (entity) => entity.password.length >= 8,
        'Password must be at least 8 characters'
    )
    @Validation(
        (entity) => /[A-Z]/.test(entity.password),
        'Password must contain at least one uppercase letter'
    )
    @Validation(
        (entity) => /[0-9]/.test(entity.password),
        'Password must contain at least one number'
    )
    password!: string;
    
    @PropertyIndex(5)
    @PropertyName('Age', Number)
    @Required(true)
    @Validation(
        (entity) => entity.age >= 18,
        'You must be at least 18 years old'
    )
    age!: number;
}
```

**Análisis:**
- Username: Required + validación síncrona de longitud + validación asíncrona de unicidad
- Email: Required + validación asíncrona de unicidad (StringTypeDef valida formato automáticamente)
- Password: Required + 3 validaciones síncronas de complejidad
- Age: Required + validación síncrona de valor mínimo

### Ejemplo 2: Producto con Validaciones de Negocio

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent(true, 'id')
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('SKU', String)
    @Required(true)
    @Validation(
        (entity) => /^[A-Z]{3}-\d{4}$/.test(entity.sku),
        'SKU must follow format: ABC-1234'
    )
    @AsyncValidation(
        async (entity) => {
            if (entity.isNew()) {
                const response = await Application.axiosInstance.get(
                    `/api/products/check-sku?sku=${entity.sku}`
                );
                return response.data.isUnique;
            }
            return true; // Skip validación si está editando
        },
        'SKU already exists'
    )
    sku!: string;
    
    @PropertyIndex(2)
    @PropertyName('Price', Number)
    @Required(true)
    @Validation(
        (entity) => entity.price > 0,
        'Price must be greater than 0'
    )
    @Validation(
        (entity) => entity.price < 1000000,
        'Price seems too high, please verify'
    )
    price!: number;
    
    @PropertyIndex(3)
    @PropertyName('Discount', Number)
    @Validation(
        (entity) => {
            if (!entity.discount) return true; // Opcional
            return entity.discount >= 0 && entity.discount <= 100;
        },
        'Discount must be between 0 and 100'
    )
    @Validation(
        (entity) => {
            if (!entity.discount) return true;
            const finalPrice = entity.price * (1 - entity.discount / 100);
            return finalPrice > 0;
        },
        'Final price after discount cannot be 0 or negative'
    )
    discount?: number;
}
```

**Análisis:**
- SKU: Required + validación de formato + validación asíncrona condicional (solo en nuevos)
- Price: Required + 2 validaciones síncronas de rango
- Discount: 2 validaciones síncronas con lógica condicional (permite null/undefined)

### Ejemplo 3: Orden con Validación Condicional

```typescript
@ModuleName('Order', 'Orders')
export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Type', String)
    @Required(true)
    type!: 'DOMESTIC' | 'INTERNATIONAL';
    
    @PropertyIndex(2)
    @PropertyName('ZIP Code', String)
    @Required(
        (entity) => entity.type === 'DOMESTIC', 
        'ZIP code required for domestic orders'
    )
    zipCode?: string;
    
    @PropertyIndex(3)
    @PropertyName('Country', String)
    @Required(
        (entity) => entity.type === 'INTERNATIONAL', 
        'Country required for international orders'
    )
    country?: string;
}
```

**Análisis:**
- Type: Siempre requerido
- ZIP Code: Required condicional (solo si type === 'DOMESTIC')
- Country: Required condicional (solo si type === 'INTERNATIONAL')

### Ejemplo 4: Validación Cross-Field (Rango de Fechas)

```typescript
export class DateRange extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Start Date', Date)
    @Required(true)
    startDate!: Date;
    
    @PropertyIndex(2)
    @PropertyName('End Date', Date)
    @Required(true)
    @Validation(
        (entity) => entity.endDate > entity.startDate,
        'End date must be after start date'
    )
    endDate!: Date;
}
```

**Análisis:**
- Start Date: Required simple
- End Date: Required + validación síncrona que compara con otra propiedad

### Ejemplo 5: Validación Asíncrona con Debounce

```typescript
// Función helper con debounce
let debounceTimer: NodeJS.Timeout | null = null;

async function checkWithDebounce(
    value: string, 
    checkFunction: (val: string) => Promise<boolean>
): Promise<boolean> {
    return new Promise((resolve) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(async () => {
            const result = await checkFunction(value);
            resolve(result);
        }, 500); // 500ms después del último cambio
    });
}

// En la entidad
@AsyncValidation(
    async (entity) => await checkWithDebounce(
        entity.email,
        async (email) => {
            const response = await Application.axiosInstance.get(
                `/api/check-email?email=${email}`
            );
            return response.data.isUnique;
        }
    ),
    'Email already exists'
)
email!: string;
```

**Análisis:**
- Implementa debounce para evitar múltiples llamadas durante escritura
- Mejora UX esperando 500ms desde último cambio antes de validar

### Ejemplo 6: Validación Manual Programática

```typescript
// En un método de la entidad o en lógica del componente
const validateManually = async () => {
    const user = new User({ username: 'test', email: 'test@example.com' });
    
    // Validación manual completa
    const isValid = await user.validateInputs();
    
    if (isValid) {
        console.log('All validations passed!');
    } else {
        console.log('Validation errors:');
        user.validationMessages.forEach((messages, property) => {
            console.log(`${property}: ${messages.join(', ')}`);
        });
    }
};

// Validación de campo específico
const validateField = async (entity: BaseEntity, fieldName: string) => {
    const isReq = entity.isRequired(fieldName);
    const isSyncValid = entity.isValidation(fieldName);
    const isAsyncValid = await entity.isAsyncValidation(fieldName);
    
    return isReq && isSyncValid && isAsyncValid;
};
```

### Ejemplo 7: Validación de Tarjeta de Crédito

```typescript
export class CreditCard extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Card Number', String)
    @Required(true)
    @Validation(
        (entity) => /^\d{16}$/.test(entity.cardNumber),
        'Card number must be 16 digits'
    )
    @Validation(
        (entity) => {
            // Algoritmo de Luhn
            let sum = 0;
            let isEven = false;
            for (let i = entity.cardNumber.length - 1; i >= 0; i--) {
                let digit = parseInt(entity.cardNumber[i]);
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                isEven = !isEven;
            }
            return sum % 10 === 0;
        },
        'Invalid card number'
    )
    cardNumber!: string;
    
    @PropertyIndex(2)
    @PropertyName('Expiry Date', String)
    @Required(true)
    @Validation(
        (entity) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(entity.expiryDate),
        'Format must be MM/YY'
    )
    @Validation(
        (entity) => {
            const [month, year] = entity.expiryDate.split('/').map(Number);
            const expiry = new Date(2000 + year, month);
            const now = new Date();
            return expiry > now;
        },
        'Card has expired'
    )
    expiryDate!: string;
    
    @PropertyIndex(3)
    @PropertyName('CVV', String)
    @Required(true)
    @Validation(
        (entity) => /^\d{3}$/.test(entity.cvv),
        'CVV must be 3 digits'
    )
    cvv!: string;
}
```

**Análisis:**
- Card Number: Required + validación de formato + algoritmo de Luhn
- Expiry Date: Required + validación de formato + validación de no vencida
- CVV: Required + validación de 3 dígitos

### Mejores Prácticas

**Validaciones Síncronas (DO):**

```typescript
// ✓ Mensajes claros y específicos
@Required(true, 'Please enter the product name')

// ✓ Validar en frontend Y backend
@Validation((e) => e.price > 0, 'Invalid price')

// ✓ Combinar validaciones en orden lógico
@Required(true)  // Primero: tiene valor?
@Validation((e) => e.email.includes('@'))  // Segundo: formato válido?
@AsyncValidation(async (e) => await checkUnique(e.email))  // Tercero: único?

// ✓ Validaciones complejas en métodos separados
@Validation((entity) => entity.validateComplexRule(), 'Error')
// Método en la clase:
private validateComplexRule(): boolean {
    // Lógica compleja aquí
    return result;
}
```

**Validaciones Asíncronas (DO):**

```typescript
// ✓ Usar AsyncValidation solo cuando necesario
@AsyncValidation(async (e) => await checkUnique(e.email), 'Email taken')

// ✓ Implementar timeouts
@AsyncValidation(
    async (entity) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000); // 5 seg timeout
        
        try {
            const response = await Application.axiosInstance.get(
                `/api/check-email?email=${entity.email}`,
                { signal: controller.signal }
            );
            return response.data.isUnique;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Validation timed out');
                return false;
            }
            throw error;
        }
    },
    'Email validation failed'
)
```

**Prohibiciones (DON'T):**

```typescript
// ✗ NO poner lógica compleja directamente en decorador
@Validation((entity) => {
    // 50 líneas de código...
    // Difícil de mantener y testear
}, 'Error')

// ✗ NO duplicar validaciones
@Required(true)
@Validation((e) => e.name !== '', 'Required') // Redundante

// ✗ NO async en @Validation
@Validation(async (e) => await someApiCall(), 'Error') // INCORRECTO

// ✗ NO validaciones lentas sin timeout
@AsyncValidation(async (e) => {
    // Puede demorar 30 segundos... MAL
    return await extremelySlowApi(e.value);
})
```

### Visualización de Errores en UI

**CSS para Estados de Validación:**

```css
.TextInput {
    border: 1px solid #ccc;
    transition: border-color 0.3s ease;
}

.TextInput.nonvalidated {
    border-color: #dc3545;
    background-color: #fff5f5;
}

.validation-messages {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    min-height: 1.2rem; /* Evita saltos de layout */
}

.validation-messages span {
    display: block;
    margin-bottom: 0.25rem;
}
```

**Template de Componente Input:**

```vue
<template>
    <div class="TextInput" :class="{ nonvalidated: !isInputValidated }">
        <label>{{ metadata.propertyName }}</label>
        <input v-model="modelValue" @blur="validate" />
        
        <!-- Mensajes de error -->
        <div class="validation-messages" v-if="validationMessages.length > 0">
            <span 
                v-for="(message, index) in validationMessages" 
                :key="index"
            >
                {{ message }}
            </span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            validationMessages: [],
            isInputValidated: true
        };
    },
    methods: {
        async validate() {
            this.validationMessages = [];
            this.isInputValidated = true;
            
            // Ejecutar validaciones
            const isReq = this.entity.isRequired(this.propertyName);
            const isSync = this.entity.isValidation(this.propertyName);
            const isAsync = await this.entity.isAsyncValidation(this.propertyName);
            
            if (!isReq || !isSync || !isAsync) {
                this.isInputValidated = false;
                this.validationMessages = this.entity.validationMessages.get(this.propertyName) || [];
            }
        }
    }
};
</script>
```

## 11. Referencias Cruzadas

### Documentación del Framework

**Guías Fundamentales:**
- [../01-FRAMEWORK-OVERVIEW.md](../01-FRAMEWORK-OVERVIEW.md) - Conceptos arquitectónicos del framework
- [../02-FLOW-ARCHITECTURE.md](../02-FLOW-ARCHITECTURE.md) - Flujos de datos y validación

**Capas de Decoradores:**
- [../layers/01-decorators/required-decorator.md](../layers/01-decorators/required-decorator.md) - Especificación completa @Required
- [../layers/01-decorators/validation-decorator.md](../layers/01-decorators/validation-decorator.md) - Especificación @Validation
- [../layers/01-decorators/async-validation-decorator.md](../layers/01-decorators/async-validation-decorator.md) - Especificación @AsyncValidation

**Capa de Base Entity:**
- [../layers/02-base-entity/validation-system.md](../layers/02-base-entity/validation-system.md) - Sistema interno de validación
- [../layers/02-base-entity/crud-operations.md](../layers/02-base-entity/crud-operations.md) - Integración de validación en CRUD

### Tutoriales Relacionados

**Tutorial Previo:**
- [01-basic-crud.md](01-basic-crud.md) - Fundamentos de CRUD y validaciones básicas

**Tutorial Siguiente:**
- [03-relations.md](03-relations.md) - Validaciones en relaciones entre entidades

### Enlaces Externos

**Tecnologías Relacionadas:**
- Reflect Metadata: https://github.com/rbuckton/reflect-metadata
- JavaScript RegEx: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
- Async/Await: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

### Fecha y Versión

Última actualización: 11 de Febrero, 2026  
Versión del documento: 2.0.0  
Estado: Completo
