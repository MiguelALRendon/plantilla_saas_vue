# Required Decorator

## 1. Propósito

Marcar una propiedad de entidad como obligatoria, habilitando validación automática de campo requerido en la interfaz de usuario. Permite definir condiciones estáticas o dinámicas para determinar cuándo una propiedad es obligatoria.

## 2. Alcance

Este decorador aplica a:
- Propiedades de clases que heredan de BaseEntity
- Validación obligatoria incondicional (always required)
- Validación obligatoria condicional (basada en función)
- Validación del primer nivel en jerarquía de validaciones
- Integración con componentes de formulario generados automáticamente

## 3. Definiciones Clave

**REQUIRED_KEY:** Símbolo utilizado para almacenar metadata de propiedades requeridas en el prototipo de clase.

**RequiredCondition:** Tipo que puede ser boolean o función que retorna boolean evaluando la instancia de entidad.

**RequiredMetadata:** Interfaz que define estructura de metadata para validación required. Contiene condition o validation (según si tiene mensaje), y message opcional.

Ubicación en código: src/decorations/required_decorator.ts

Símbolo de metadatos:
```typescript
export const REQUIRED_KEY = Symbol('required');
```

Almacenamiento en prototipo:
```typescript
proto[REQUIRED_KEY] = {
    'email': { 
        condition: true,
        message: 'Email is required'
    },
    'weight': {
        validation: (entity) => entity.type === 'physical',
        message: 'Weight required for physical products'
    }
}
```

## 4. Descripción Técnica

### Firma del Decorador

```typescript
function Required(
    conditionOrValidation: boolean | ((instance: any) => boolean),
    message?: string
): PropertyDecorator
```

### Tipos

```typescript
export type RequiredCondition = boolean | ((instance: any) => boolean);

export interface RequiredMetadata {
    condition?: RequiredCondition;
    message?: string;
    validation?: RequiredCondition;
}
```

### Implementación

```typescript
export function Required(
    conditionOrValidation: RequiredCondition, 
    message?: string
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        if (!proto[REQUIRED_KEY]) {
            proto[REQUIRED_KEY] = {};
        }
        
        const metadata: RequiredMetadata = message !== undefined 
            ? { condition: conditionOrValidation, message: message }
            : { validation: conditionOrValidation };
        
        proto[REQUIRED_KEY][propertyKey] = metadata;
    };
}
```

### Métodos Accesores en BaseEntity

#### isRequired(key: string): boolean
Verifica si una propiedad es requerida evaluando condición estática o función dinám ica.

```typescript
public isRequired(key: string): boolean {
    const required = (this.constructor as any).prototype[REQUIRED_KEY]?.[key];
    if (!required) return false;
    
    const condition = required.condition ?? required.validation;
    if (typeof condition === 'function') {
        return condition(this);
    }
    return Boolean(condition);
}
```

Ubicación: src/entities/base_entitiy.ts (línea aproximada 350)

#### requiredMessage(key: string): string
Obtiene mensaje de validación required personalizado o mensaje por defecto.

```typescript
public requiredMessage(key: string): string {
    const required = (this.constructor as any).prototype[REQUIRED_KEY]?.[key];
    return required?.message || 'Field is required';
}
```

Ubicación: src/entities/base_entitiy.ts (línea aproximada 365)

### Ejemplos de Uso

Required incondicional:
```typescript
export class Customer extends BaseEntity {
    @PropertyName('Name', String)
    @Required(true)
    name!: string;
    
    @PropertyName('Email', String)
    @Required(true)
    email!: string;
}
```

Required con mensaje personalizado:
```typescript
export class Product extends BaseEntity {
    @PropertyName('SKU', String)
    @Required(true, 'Product SKU is mandatory')
    sku!: string;
}
```

Required condicional:
```typescript
export class Product extends BaseEntity {
    @PropertyName('Type', ProductType)
    type!: ProductType;
    
    @PropertyName('Weight', Number)
    @Required((entity) => entity.type === 'physical')
    weight?: number;
    
    @PropertyName('Download Link', String)
    @Required((entity) => entity.type === 'digital')
    downloadLink?: string;
}
```

Required con múltiples condiciones:
```typescript
export class Order extends BaseEntity {
    @PropertyName('Status', OrderStatus)
    status!: OrderStatus;
    
    @PropertyName('Payment Method', String)
    paymentMethod?: string;
    
    @PropertyName('Credit Card', String)
    @Required((entity) => {
        return entity.status === 'paid' && 
               entity.paymentMethod === 'credit_card';
    }, 'Credit card required for paid orders')
    creditCard?: string;
}
```

## 5. Flujo de Funcionamiento

Secuencia de validación required:

1. Usuario modifica valor en input component
2. v-model actualiza entity[propertyKey]
3. Input component detecta cambio mediante watch o input event
4. Component ejecuta método isValidated()
5. Método isValidated() llama a entity.isRequired(propertyKey)
6. BaseEntity.isRequired() evalúa metadata REQUIRED_KEY para la propiedad
7. Si condition es función, se ejecuta con instancia entity actual
8. Si condition es boolean, se retorna directamente
9. Si campo es required y valor está vacío:
   - isInputValidated = false
   - validationMessages.push(requiredMessage)
   - Clase CSS 'non-validated' se aplica al contenedor
   - Mensaje de error se muestra en UI
10. Si campo es required y valor tiene contenido:
    - Validación required pasa
    - Continúa a siguiente nivel: Validation (sync)
11. Si campo no es required, validación pasa automáticamente

### Impacto Visual en UI

Asterisco rojo en label cuando required:
```vue
<label>
  {{ metadata.propertyName }}
  <span v-if="metadata.required.value" class="required">*</span>
</label>
```

Mensaje de validación cuando falla:
```
Product Name *
[                    ]
Error: Product SKU is mandatory
```

## 6. Reglas Obligatorias

1. El decorador debe recibir al menos el parámetro conditionOrValidation
2. Si se proporciona mensaje, metadata usa propiedad 'condition'
3. Si no se proporciona mensaje, metadata usa propiedad 'validation'
4. Las funciones condicionales deben ser síncronas y retornar boolean
5. Required es el primer nivel de validación, se ejecuta antes que Validation y AsyncValidation
6. Los componentes de input deben verificar metadata.required mediante useInputMetadata
7. El asterisco (*) debe mostrarse en label cuando metadata.required.value es true

## 7. Prohibiciones

1. NO usar funciones asíncronas (async/await) en condición required
2. NO modificar estado de entity dentro de función de condición
3. NO confundir required con validación de formato (required solo verifica existencia de valor)
4. NO asumir que valores falsy (0, false, '') no son válidos si tienen significado semántico
5. NO omitir verificación de undefined/null en funciones condicionales que acceden a propiedades
6. NO usar Required para validar formato de datos (usar @Validation o @StringTypeDef)
7. NO crear condiciones required que dependan de llamadas HTTP o operaciones asíncronas

## 8. Dependencias

### Decoradores Relacionados
- PropertyName: Define propiedad base que puede ser marcada required
- Validation: Validación de segundo nivel que se ejecuta después de required
- AsyncValidation: Validación de tercer nivel para verificaciones asíncronas
- StringTypeDef: Proporciona validación de formato específico para strings (EMAIL, PASSWORD, etc.)

### Clases y Módulos
- BaseEntity: Contiene métodos isRequired() y requiredMessage()
- Application: Proporciona View.value.isValid para validación global
- useInputMetadata composable: Expone metadata.required y metadata.requiredMessage a componentes

### Componentes
- TextInputComponent: Implementa validación required
- NumberInputComponent: Implementa validación required
- EmailInputComponent: Implementa valid ación required
- Todos los form input components: Heredan lógica de validación required

Ubicación de lógica de validación: src/components/Form/TextInputComponent.vue (línea aproximada 70)

## 9. Relaciones

### Jerarquía de Validación

Required es nivel 1 en jerarquía de tres niveles:
```
Nivel 1: Required (campo no vacío)
    ↓
Nivel 2: Validation (validación síncrona custom)
    ↓
Nivel 3: AsyncValidation (validación asíncrona con servidor)
```

### Decoradores Usados Frecuentemente Juntos

```typescript
@PropertyIndex(1)
@PropertyName('Email', String)
@Required(true)
@StringTypeDef(StringType.EMAIL)
@Validation((entity) => entity.email.includes('@'), 'Invalid email format')
@AsyncValidation(async (entity) => await checkEmailUnique(entity.email), 'Email already exists')
email!: string;
```

### Integración con Sistema de Eventos

Application.eventBus.emit('validate-inputs') desencadena validación en todos los inputs, incluyendo verificación required.

EntityPágina completa alcanzada. Método validateInputs() en BaseEntity orquesta validación required global antes de operaciones save/update.

Ubicación: src/entities/base_entitiy.ts (línea aproximada 630)

## 10. Notas de Implementación

### Valores Falsy y Validación

Required valida usando comparación de vacío, no valores falsy. Esto significa:
- Número 0 es válido si required
- Boolean false es válido si required
- String vacío '' NO es válido si required
- null/undefined NO son válidos si required

Para permitir 0 o false como valores válidos required:
```typescript
@Validation((entity) => entity.quantity !== undefined && entity.quantity !== null)
quantity!: number;
```

### Required Condicional y Reactividad

Las condiciones required se reevalúan en tiempo real cuando propiedades relacionadas cambian:

```typescript
@PropertyName('Type', String)
type!: string;

@Required((entity) => entity.type === 'premium')
premium_feature?: string;
```

Cuando type cambia a 'premium':
- Automáticamente premium_feature se vuelve required
- Asterisco (*) aparece en label
- Validación se activa
- Si el campo está vacío, muestra mensaje de error

### Validación de Listas y Arrays

```typescript
export class Order extends BaseEntity {
    @PropertyName('Items', ArrayOf(OrderItem))
    @Validation((entity) => entity.items && entity.items.length >= 1, 'Order must have at least one item')
    items!: Array<OrderItem>;
}
```

Nota: Required para arrays verifica que array exista y tenga longitud > 0. Para validaciones más específicas de contenido de array, usar @Validation.

### Orden de Decoradores

El orden de decoradores en código fuente no afecta funcionalidad, pero por convención se recomienda:

```typescript
@PropertyIndex(1)
@ViewGroup('Info')
@PropertyName('Name', String)
@Required(true)
@HelpText('Enter name')
name!: string;
```

### Casos de Uso Comunes

Formularios de registro:
```typescript
@Required(true) @PropertyName('Username', String) username!: string;
@Required(true) @StringTypeDef(StringType.EMAIL) email!: string;
@Required(true) @StringTypeDef(StringType.PASSWORD) password!: string;
```

Direcciones opcionales con campos internos required:
```typescript
@PropertyName('Has Shipping Address', Boolean) hasShippingAddress!: boolean;
@Required((e) => e.hasShippingAddress) shippingStreet?: string;
@Required((e) => e.hasShippingAddress) shippingCity?: string;
@Required((e) => e.hasShippingAddress) shippingZip?: string;
```

Formularios de pago condicionales:
```typescript
@Required(true) @PropertyName('Payment Method', PaymentMethod) paymentMethod!: PaymentMethod;
@Required((e) => e.paymentMethod === 'credit_card') cardNumber?: string;
@Required((e) => e.paymentMethod === 'credit_card') cardCVV?: string;
```

### Required Basado en Permisos

```typescript
export class Document extends BaseEntity {
    @PropertyName('Approver', User)
    @Required((entity) => {
        return Application.currentUser?.hasPermission('documents.approve');
    }, 'Approver required for users with approval permissions')
    approver?: User;
}
```

### Validación de Rangos con Required

```typescript
export class Product extends BaseEntity {
    @PropertyName('Min Stock', Number)
    @Required(true)
    minStock!: number;
    
    @PropertyName('Max Stock', Number)
    @Required((entity) => entity.minStock > 0)
    @Validation((entity) => {
        if (entity.maxStock !== undefined) {
            return entity.maxStock > entity.minStock;
        }
        return true;
    }, 'Max stock must be greater than min stock')
    maxStock?: number;
}
```

## 11. Referencias Cruzadas

Documentos relacionados:
- [property-name-decorator.md](property-name-decorator.md) - Decorador PropertyName
- [validation-decorator.md](validation-decorator.md) - Validación síncrona nivel 2
- [async-validation-decorator.md](async-validation-decorator.md) - Validación asíncrona nivel 3
- [../02-base-entity/validation-system.md](../02-base-entity/validation-system.md) - Sistema completo de validación
- [../04-components/form-inputs.md](../04-components/form-inputs.md) - Componentes de formulario
- [../../tutorials/02-validations.md](../../tutorials/02-validations.md) - Tutorial de validaciones

Archivos de código fuente:
- src/decorations/required_decorator.ts - Implementación del decorador
- src/entities/base_entitiy.ts - Métodos isRequired() y requiredMessage()
- src/composables/useInputMetadata.ts - Exposición de metadata required
- src/components/Form/TextInputComponent.vue - Implementación de validación en inputs

Versión: 1.0.0
Última actualización: 11 de Febrero, 2026
