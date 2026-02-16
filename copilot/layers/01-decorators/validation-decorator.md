# Validation Decorator

## 1. Propósito

Aplicar reglas de validación sincrónicas personalizadas a propiedades específicas de entidades, permitiendo verificación inmediata de condiciones de negocio con mensajes de error configurables, ejecutándose después de validación @Required y antes de @AsyncValidation.

## 2. Alcance

### 2.1 Responsabilidades

- Definir condiciones de validación boolean o funciones para propiedades
- Proporcionar mensajes de error personalizados cuando validación falla
- Ejecutar validaciones sincrónicas sin blocking de UI
- Permitir validaciones condicionales basadas en estado de entidad
- Soportar múltiples validaciones por propiedad mediante decoradores apilados
- Integrarse con sistema de validación de BaseEntity para feedback automático en UI

### 2.2 Límites

- No ejecuta validaciones asíncronas (requiere @AsyncValidation)
- No valida unicidad contra base de datos (requiere lógica custom)
- No previene modificación directa de propiedades en código
- No reemplaza validación backend (es solo hint de UI)
- No valida relaciones entre múltiples propiedades (cada decorador valida una propiedad)
- No genera UI de mensajes de error (responsabilidad de componentes)

## 3. Definiciones Clave

**ValidationCondition**: Expresión boolean o función que retorna boolean, evaluada para determinar si valor de propiedad es válido.

**Static Validation**: Condición de validación mediante boolean literal true/false, aunque poco útil (siempre válido o siempre inválido).

**Dynamic Validation**: Condición de validación mediante función que recibe instancia de entidad y retorna boolean, permitiendo validación basada en contexto.

**ValidationMetadata**: Estructura de datos almacenando condition (boolean | function) y message (string) para propiedad específica.

**Validation Message**: String descriptivo del error mostrado en UI cuando validación falla, debe ser claro y orientado al usuario final.

**Synchronous Validation**: Validación que se completa inmediatamente sin operaciones asíncronas, retornando resultado boolean sin Promise.

**Validation Hierarchy**: Orden de ejecución Required → Validation → AsyncValidation, donde cada capa ejecuta solo si anterior pasa.

## 4. Descripción Técnica

### 4.1 Implementación del Decorador

```typescript
export const VALIDATION_KEY = Symbol('validation');

export type ValidationCondition = boolean | ((instance: any) => boolean);

export interface ValidationMetadata {
    condition: ValidationCondition;
    message: string;
}

export function Validation(condition: ValidationCondition, message: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[VALIDATION_KEY]) {
            proto[VALIDATION_KEY] = {};
        }
        
        proto[VALIDATION_KEY][propertyKey] = {
            condition: condition,
            message: message
        };
    };
}
```

Decorador almacena metadata en prototype usando Symbol. Interface ValidationMetadata encapsula condition y message permitiendo extensiones futuras. Type ValidationCondition permite flexibility entre validaciones estáticas y dinámicas.

### 4.2 Métodos de Acceso en BaseEntity

```typescript
public isValidation(propertyKey: string): boolean {
    const proto = (this.constructor as any).prototype;
    const validationRules: Record<string, ValidationMetadata> = proto[VALIDATION_KEY] || {};
    const rule = validationRules[propertyKey];
    
    if (!rule) {
        return true; // Sin validación = válido por defecto
    }
    
    return typeof rule.condition === 'function' 
        ? rule.condition(this) 
        : rule.condition;
}

public validationMessage(propertyKey: string): string | undefined {
    const proto = (this.constructor as any).prototype;
    const validationRules: Record<string, ValidationMetadata> = proto[VALIDATION_KEY] || {};
    const rule = validationRules[propertyKey];
    return rule?.message;
}
```

isValidation() evalúa condición y retorna boolean indicando si valor actual es válido. validationMessage() recupera mensaje de error para mostrar en UI cuando validación falla. Ambos métodos son invocados por sistema de validación de BaseEntity.

### 4.3 Almacenamiento de Metadata

El metadata se almacena en:
- Ubicación: Constructor.prototype[VALIDATION_KEY]
- Estructura: Record<string | symbol, ValidationMetadata>
- Vida útil: Permanente durante lifecycle de aplicación
- Herencia: Compartida entre instancias de clase
- Evaluación: Lazy, solo cuando isValidation() invocado

## 5. Flujo de Funcionamiento

### 5.1 Fase de Declaración - Validación Estática

```
Developer aplica @Validation(true, "Message")
    ↓
TypeScript ejecuta decorador en definición de clase
    ↓
Validation() almacena {condition: true, message: "..."} en prototype
    ↓
Metadata disponible para todas las instancias
```

Validación estática raramente útil, principalmente para testing o stubs.

### 5.2 Fase de Declaración - Validación Dinámica

```
Developer aplica @Validation((entity) => entity.age >= 18, "Must be 18+")
    ↓
Decorador almacena función en metadata
    ↓
{condition: Function, message: "Must be 18+"}
    ↓
Función se evaluará dinámicamente para cada instancia
```

### 5.3 Fase de Validación en Runtime

```
Usuario modifica valor en formulario
    ↓
Component invoca entity.isValidation(propertyKey)
    ↓
isValidation() recupera ValidationMetadata de prototype
    ↓
Si condition es function, ejecuta pasando entity instance
    ↓
Retorna true (válido) o false (inválido)
    ↓
Si false, component invoca entity.validationMessage(propertyKey)
    ↓
Muestra mensaje de error en UI debajo de input
```

### 5.4 Integración con Sistema de Validación

```
Usuario intenta guardar formulario
    ↓
BaseEntity.validate() ejecuta jerarquía de validaciones
    ↓
1. Required validation (isRequired())
    ↓ (si pasa)
2. Validation decorators (isValidation())
    ↓ (si pasa)
3. AsyncValidation decorators (isAsyncValidation())
    ↓
Si alguna validación falla, BaseEntity.validate() retorna error
    ↓
UI muestra mensajes de error, previene save()
```

### 5.5 Ejemplo de Flujo Completo

```typescript
class User extends BaseEntity {
    @Validation(
        (user: User) => user.age >= 18,
        "Must be at least 18 years old"
    )
    age: number;
}

const user = new User({ age: 16 });

// Validación manual
console.log(user.isValidation('age')); // false
console.log(user.validationMessage('age')); // "Must be at least 18 years old"

// En formulario
if (!user.isValidation('age')) {
    const message = user.validationMessage('age');
    showErrorMessage(message); // Muestra en UI
}
```

## 6. Reglas Obligatorias

### 6.1 Aplicación del Decorador

1. @Validation debe aplicarse a property decorator, nunca a clase
2. Condition puede ser boolean o función que retorna boolean
3. Message debe ser string descriptivo orientado al usuario final
4. Función condition debe ser pura (sin side effects)
5. Función condition recibe instancia completa de entidad como parámetro único

### 6.2 Implementación de Condiciones

6. Condiciones dinámicas usar arrow function: (entity) => boolean
7. No usar async functions como condition (usar @AsyncValidation)
8. Condition function no debe modificar estado de entidad
9. Condition function debe completar en <10ms para no bloquear UI
10. Validaciones complejas delegar a métodos privados de entidad

### 6.3 Mensajes de Error

11. Messages deben ser claros y específicos ("Age must be 18+", no "Invalid")
12. Messages escritos en idioma de aplicación (i18n si necesario)
13. Messages no deben incluir nombre de propiedad (UI lo agrega automáticamente)
14. Messages deben sugerir acción correctiva cuando posible
15. Messages consistentes en tono y formato en toda la aplicación

### 6.4 Interacción con Otros Decoradores

16. @Validation ejecuta después de @Required validation
17. @Validation ejecuta antes de @AsyncValidation
18. Múltiples @Validation en misma propiedad: solo último prevalece (no stacking)
19. @Validation compatible con @Mask (Mask formatea, Validation valida)
20. @Validation independiente de @StringTypeDef (ambos aplican)

### 6.5 Performance y Usabilidad

21. Validaciones deben ejecutarse en cada cambio de valor (onChange)
22. Feedback de validación debe ser inmediato (no esperar submit)
23. No ejecutar validaciones costosas en cada keystroke
24. Debounce validaciones si son heavy-weight (>50ms)
25. Mostrar mensajes de error solo después de blur de input (no mientras tipea)

## 7. Prohibiciones

### 7.1 Prohibiciones de Implementación

1. PROHIBIDO usar async functions como ValidationCondition
2. PROHIBIDO modificar estado de entidad dentro de condition function
3. PROHIBIDO hacer network requests en condition function
4. PROHIBIDO usar timers o Date.now() directo en condition
5. PROHIBIDO lanzar excepciones dentro de condition function

### 7.2 Prohibiciones de Uso

6. PROHIBIDO usar @Validation para validar unicidad (usar lógica custom o @AsyncValidation)
7. PROHIBIDO depender de @Validation para seguridad backend
8. PROHIBIDO aplicar @Validation a propiedades computed (getters)
9. PROHIBIDO usar condition que depende de variables globales mutables
10. PROHIBIDO usar @Validation como reemplazo de @Required

### 7.3 Prohibiciones de Mensajes

11. PROHIBIDO usar mensajes técnicos en lugar de user-friendly
12. PROHIBIDO exponer detalles de implementación en mensajes
13. PROHIBIDO usar mensajes genéricos ("Error", "Invalid")
14. PROHIBIDO incluir stack traces o códigos de error en mensajes
15. PROHIBIDO usar idiomas mixtos en mensajes (mantener consistencia)

### 7.4 Prohibiciones de Lógica

16. PROHIBIDO implementar lógica de negocio compleja en condition functions
17. PROHIBIDO usar Validation para efectos secundarios
18. PROHIBIDO asumir orden de ejecución entre múltiples propiedades con Validation
19. PROHIBIDO usar Validation para logging o analytics
20. PROHIBIDO serializar ValidationMetadata en APIs públicas

## 8. Dependencias

### 8.1 Dependencias Directas

**Symbol (JavaScript Nativo)**
- Propósito: Crear VALIDATION_KEY único para storage
- Uso: Almacenar ValidationMetadata sin colisiones
- Crítico: Sí, sin Symbol podría sobrescribir propiedades

**PropertyDecorator (TypeScript)**
- Propósito: Tipado de decorador de propiedad
- Uso: Garantizar firma correcta de función Validation()
- Crítico: Sí, TypeScript rechazará decorador incorrecto

**BaseEntity.prototype**
- Propósito: Almacenamiento de metadata compartida
- Uso: Contiene Record<string, ValidationMetadata>
- Crítico: Sí, instancias acceden a metadata vía prototype

### 8.2 Dependencias de BaseEntity

**isValidation() Method**
- Propósito: Evaluar condición de validación
- Retorno: boolean (true = válido, false = inválido)
- Crítico: Sí, motor de validación principal

**validationMessage() Method**
- Propósito: Recuperar mensaje de error
- Retorno: string | undefined
- Crítico: Sí, necesario para UI feedback

**validate() Method**
- Propósito: Ejecutar jerarquía completa de validaciones
- Orden: Required → Validation → AsyncValidation
- Crítico: Sí, punto de entrada para validación completa

### 8.3 Dependencias de UI Components

**FormInput Components**
- Propósito: Invocar isValidation() y mostrar errores
- Timing: onChange, onBlur, onSubmit
- Crítico: Sí, sin UI Validation no tiene efecto visible

**Error Message Display**
- Propósito: Renderizar validationMessage() debajo de input
- Estilo: Texto rojo, icono de error, resaltado de input
- Crítico: Sí, feedback visual esencial para UX

### 8.4 Dependencias Opcionales

**@Required Decorator**
- Relación: Ejecuta antes de @Validation en jerarquía
- Lógica: Si required falla, Validation no ejecuta
- Patrón: @Required asegura presencia, @Validation asegura formato/reglas

**@AsyncValidation Decorator**
- Relación: Ejecuta después de @Validation en jerarquía
- Lógica: Si Validation falla, AsyncValidation no ejecuta
- Patrón: Validation para reglas síncronas, AsyncValidation para backend checks

**@Mask Decorator**
- Relación: Mask formatea input, Validation valida valor formateado
- Orden: Usuario tipea → Mask formatea → Validation valida
- Compatibilidad: Totalmente compatible

## 9. Relaciones

### 9.1 Jerarquía de Validación

**@Required**
- Orden: Primera validación en jerarquía
- Propósito: Asegurar que valor existe
- Relación: Si Required falla, Validation no ejecuta
- Ejemplo: Required verifica campo no vacío, Validation verifica formato

**@AsyncValidation**
- Orden: Última validación en jerarquía
- Propósito: Validaciones que requieren backend (unicidad, existencia)
- Relación: Si Validation falla, AsyncValidation no ejecuta
- Ejemplo: Validation verifica formato email, AsyncValidation verifica email no registrado

### 9.2 Decoradores de Formato

**@Mask**
- Interacción: Mask formatea primero, luego Validation valida
- Flujo: Input → Mask → Validation → Display
- Ejemplo: Mask de teléfono (555) 555-5555, Validation verifica 10 dígitos

**@StringTypeDef**
- Interacción: StringType determina input type, Validation agrega reglas
- Ejemplo: EMAIL type con Validation de dominio específico
- Independencia: Ambos aplican sin interferencia

### 9.3 Decoradores de Metadata

**@PropertyName**
- Relación: PropertyName usado en mensaje de error UI
- Patrón: "{{PropertyName}}: {{ValidationMessage}}"
- Ejemplo: "Email Address: Invalid email format"

**@HelpText**
- Relación: HelpText muestra requisitos, ValidationMessage muestra errores
- UX: HelpText preventivo, ValidationMessage reactivo
- Ejemplo: HelpText "Min 8 characters", ValidationMessage "Password too short"

### 9.4 BaseEntity Methods

**isValidation(propertyKey)**
- Propósito: Evaluar si valor actual es válido
- Uso: Invocado por FormInput onChange/onBlur
- Retorno: boolean

**validationMessage(propertyKey)**
- Propósito: Obtener mensaje de error para display
- Uso: Invocado cuando isValidation() retorna false
- Retorno: string | undefined

**validate()**
- Propósito: Validación completa de entidad
- Proceso: Itera propiedades, ejecuta Required → Validation → AsyncValidation
- Retorno: ValidationResult con errores por propiedad

### 9.5 Componentes de UI

**FormInput Component**
- Consumo: Llama isValidation(key) en cada cambio de valor
- Display: Muestra validationMessage(key) si inválido
- Estilo: Borde rojo, texto error, icono

**DetailView Component**
- Validación: Invoca entity.validate() antes de save()
- Prevención: No permite save() si validaciones fallan
- Feedback: Muestra todos los errores simultáneamente

### 9.6 Patrones de Validación Comunes

**Range Validation**
- Patrón: @Validation((e) => e.value >= min && e.value <= max, "...")
- Uso: Edad, cantidad, precio
- Ejemplo: Age between 18 and 100

**Pattern Validation**
- Patrón: @Validation((e) => /regex/.test(e.value), "...")
- Uso: Email, teléfono, código postal
- Ejemplo: Email format, phone format

**Conditional Validation**
- Patrón: @Validation((e) => e.condition ? e.value != null : true, "...")
- Uso: Campos requeridos condicionalmente
- Ejemplo: Si "Other" seleccionado, campo adicional requerido

**Cross-Property Validation**
- Limitación: @Validation valida una propiedad, no múltiples
- Workaround: Validar en beforeSave() o método custom
- Ejemplo: endDate > startDate requiere lógica custom

## 10. Notas de Implementación

### 10.1 Patrones de Uso Comunes

**Validación de Rango Numérico**
```typescript
class Product extends BaseEntity {
    @Validation(
        (product: Product) => product.price > 0,
        "Price must be greater than zero"
    )
    price: number;
    
    @Validation(
        (product: Product) => product.stock >= 0,
        "Stock cannot be negative"
    )
    stock: number;
}
```

**Validación de Formato de Email**
```typescript
class User extends BaseEntity {
    @Validation(
        (user: User) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email),
        "Invalid email format"
    )
    email: string;
}
```

**Validación de Longitud de String**
```typescript
class Account extends BaseEntity {
    @Validation(
        (account: Account) => account.password.length >= 8,
        "Password must be at least 8 characters"
    )
    @Validation(
        (account: Account) => account.password.length <= 128,
        "Password too long (max 128 characters)"
    )
    password: string;
}
```

Nota: Solo última @Validation prevalece debido a sobrescritura. Para múltiples validaciones, usar condition compuesta:

```typescript
@Validation(
    (account: Account) => {
        const len = account.password.length;
        return len >= 8 && len <= 128;
    },
    "Password must be between 8 and 128 characters"
)
password: string;
```

**Validación Condicional**
```typescript
class ContactForm extends BaseEntity {
    contactMethod: 'email' | 'phone';
    
    @Validation(
        (form: ContactForm) => {
            if (form.contactMethod === 'email') {
                return form.email != null && form.email.length > 0;
            }
            return true; // No requerido si no es email
        },
        "Email required when contact method is email"
    )
    email: string;
    
    @Validation(
        (form: ContactForm) => {
            if (form.contactMethod === 'phone') {
                return form.phone != null && form.phone.length > 0;
            }
            return true;
        },
        "Phone required when contact method is phone"
    )
    phone: string;
}
```

### 10.2 Validaciones Complejas

**Validación con Método Helper**
```typescript
class CreditCard extends BaseEntity {
    cardNumber: string;
    
    @Validation(
        (card: CreditCard) => card.isValidLuhn(),
        "Invalid card number (Luhn check failed)"
    )
    cardNumber: string;
    
    private isValidLuhn(): boolean {
        // Algoritmo Luhn para validar número de tarjeta
        const digits = this.cardNumber.replace(/\D/g, '');
        let sum = 0;
        let isEven = false;
        
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }
}
```

**Validación de Fecha con Comparación**
```typescript
class Booking extends BaseEntity {
    startDate: Date;
    endDate: Date;
    
    @Validation(
        (booking: Booking) => {
            if (!booking.startDate || !booking.endDate) return true;
            return booking.endDate > booking.startDate;
        },
        "End date must be after start date"
    )
    endDate: Date;
    
    @Validation(
        (booking: Booking) => {
            if (!booking.startDate) return true;
            return booking.startDate >= new Date();
        },
        "Start date cannot be in the past"
    )
    startDate: Date;
}
```

### 10.3 Implementación en Componentes

**FormInput con Validación**
```vue
<template>
    <div class="form-field">
        <label>{{ label }}</label>
        <input
            v-model="value"
            @blur="validateField"
            :class="{ 'error': hasError }"
        />
        <span v-if="hasError" class="error-message">
            {{ errorMessage }}
        </span>
    </div>
</template>

<script>
export default {
    props: ['entity', 'propertyKey'],
    data() {
        return {
            hasError: false,
            errorMessage: ''
        };
    },
    computed: {
        value: {
            get() {
                return this.entity[this.propertyKey];
            },
            set(newValue) {
                this.entity[this.propertyKey] = newValue;
                this.validateField();
            }
        },
        label() {
            return this.entity.getPropertyName(this.propertyKey);
        }
    },
    methods: {
        validateField() {
            const isValid = this.entity.isValidation(this.propertyKey);
            this.hasError = !isValid;
            
            if (!isValid) {
                this.errorMessage = this.entity.validationMessage(this.propertyKey);
            } else {
                this.errorMessage = '';
            }
        }
    }
};
</script>

<style>
.form-field input.error {
    border-color: var(--error-primary);
}

.error-message {
    color: var(--error-primary);
    font-size: 0.875rem;
    margin-top: 4px;
}
</style>
```

**Validación Completa en Submit**
```typescript
// DetailView.vue
async handleSubmit() {
    // Validar todos los campos
    const validationResult = await this.entity.validate();
    
    if (!validationResult.isValid) {
        // Mostrar errores
        for (const [propertyKey, error] of Object.entries(validationResult.errors)) {
            this.showFieldError(propertyKey, error);
        }
        return;
    }
    
    // Guardar si válido
    try {
        await this.entity.save();
        this.showSuccessMessage('Saved successfully');
    } catch (error) {
        this.showErrorMessage(error.message);
    }
}
```

### 10.4 Testing de Validaciones

**Unit Test de Validation**
```typescript
describe('User validation', () => {
    test('validates email format', () => {
        const user = new User({ email: 'invalid-email' });
        expect(user.isValidation('email')).toBe(false);
        expect(user.validationMessage('email')).toBe('Invalid email format');
        
        user.email = 'valid@example.com';
        expect(user.isValidation('email')).toBe(true);
    });
    
    test('validates age range', () => {
        const user = new User({ age: 16 });
        expect(user.isValidation('age')).toBe(false);
        expect(user.validationMessage('age')).toBe('Must be at least 18 years old');
        
        user.age = 25;
        expect(user.isValidation('age')).toBe(true);
    });
});
```

**Integration Test de Validación**
```typescript
test('prevents save when validation fails', async () => {
    const user = new User({
        email: 'invalid',
        age: 16
    });
    
    const result = await user.validate();
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('email');
    expect(result.errors).toHaveProperty('age');
    
    // Intentar guardar debe fallar
    await expect(user.save()).rejects.toThrow('Validation failed');
});
```

### 10.5 Debugging y Diagnóstico

**Inspeccionar Validaciones**
```typescript
const user = new User();

// Ver si propiedad tiene validación
const isValid = user.isValidation('email');
console.log('Email valid:', isValid);

// Ver mensaje de error
if (!isValid) {
    const message = user.validationMessage('email');
    console.log('Error:', message);
}

// Validar entidad completa
const result = await user.validate();
console.log('Validation result:', result);
// { isValid: false, errors: { email: "...", age: "..." } }
```

**Logging de Validaciones**
```typescript
class DebugEntity extends BaseEntity {
    isValidation(propertyKey: string): boolean {
        const result = super.isValidation(propertyKey);
        console.log(`Validation for ${propertyKey}:`, result);
        if (!result) {
            console.log(`  Message: ${this.validationMessage(propertyKey)}`);
        }
        return result;
    }
}
```

### 10.6 Migraciones y Refactoring

**Agregar Validación a Campo Existente**
```typescript
// Antes
class User extends BaseEntity {
    email: string;
}

// Después
class User extends BaseEntity {
    @Validation(
        (user: User) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email),
        "Invalid email format"
    )
    email: string;
}
```

Testing después de agregar validación:
1. Testear que valores válidos siguen pasando
2. Testear que valores inválidos ahora fallan
3. Verificar mensaje de error es claro
4. Actualizar tests existentes si asumían validación laxa

**Cambiar Condición de Validación**
```typescript
// Antes - Solo longitud mínima
@Validation(
    (user: User) => user.password.length >= 8,
    "Password must be at least 8 characters"
)
password: string;

// Después - Agregar complejidad
@Validation(
    (user: User) => {
        const pwd = user.password;
        return pwd.length >= 8 &&
               /[A-Z]/.test(pwd) &&
               /[0-9]/.test(pwd);
    },
    "Password must be 8+ characters with uppercase and number"
)
password: string;
```

Migración: Actualizar contraseñas existentes que no cumplan nueva regla.

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada

**copilot/layers/02-base-entity/validation-system.md**
- Sección: Sistema de Validación Completo
- Contenido: Jerarquía Required → Validation → AsyncValidation
- Métodos: isValidation(), validationMessage(), validate()

**copilot/layers/01-decorators/required-decorator.md**
- Relación: Primera validación en jerarquía
- Diferencia: Required verifica presencia, Validation verifica reglas
- Orden: Required ejecuta antes de Validation

**copilot/layers/01-decorators/async-validation-decorator.md**
- Relación: Última validación en jerarquía
- Diferencia: AsyncValidation para checks asíncronos, Validation para síncronos
- Orden: Validation ejecuta antes de AsyncValidation

**copilot/layers/01-decorators/mask-decorator.md**
- Interacción: Mask formatea, Validation valida valor formateado
- Compatibilidad: Totalmente compatible
- Ejemplo: Mask de teléfono + Validation de 10 dígitos

**copilot/layers/01-decorators/string-type-decorator.md**
- Interacción: StringType determina input, Validation agrega reglas
- Independencia: Ambos aplican sin interferencia
- Ejemplo: EMAIL type + Validation de dominio específico

### 11.2 BaseEntity Core

**copilot/layers/02-base-entity/base-entity-core.md**
- Métodos: isValidation(), validationMessage()
- Almacenamiento: prototype[VALIDATION_KEY]

**copilot/layers/02-base-entity/lifecycle-hooks.md**
- Hook: beforeSave()
- Uso: Ejecutar validaciones adicionales complejas
- Patrón: Decorators para validaciones simples, beforeSave para complejas

### 11.3 Componentes de UI

**copilot/layers/04-components/FormInput.md**
- Consumo: Llama isValidation() onChange/onBlur
- Display: Muestra validationMessage() en error
- Estilo: Borde rojo, texto error

**copilot/layers/04-components/DetailViewTable.md**
- Validación: Invoca validate() antes de save()
- Feedback: Muestra todos los errores simultáneamente

### 11.4 Código Fuente

**src/decorations/validation_decorator.ts**
- Líneas: 1-25
- Exports: VALIDATION_KEY, ValidationCondition, ValidationMetadata, Validation

**src/entities/base_entity.ts**
- Líneas 315-337: Métodos isValidation() y validationMessage()
- Dependencias: Importa VALIDATION_KEY, ValidationMetadata

### 11.5 Tutoriales y Ejemplos

**copilot/tutorials/02-validations.md**
- Tema: Sistema de Validaciones Completo
- Ejemplos: Email, age, password validations
- Patrones: Range, format, conditional validations

**copilot/examples/advanced-module-example.md**
- Sección: Validaciones Complejas
- Patrón: Validation con métodos helper
- Técnica: Cross-property validation en beforeSave

### 11.6 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 4.2: Sistema de Validación
- Principio: Validación declarativa mediante decoradores
- Jerarquía: Required → Validation → AsyncValidation

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Validación Automática
- Flujo: Decorators → Metadata → BaseEntity → UI feedback
- Garantía: Validaciones ejecutan antes de persistencia

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Flujo de Validación
- Diagrama: User input → Validation → Error display / Save
- Capas: Frontend validation → Backend validation (ambas necesarias)
