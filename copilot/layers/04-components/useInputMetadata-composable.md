# COMPOSABLE useInputMetadata

## 1. Propósito

Este documento describe el composable useInputMetadata, función central del sistema de inputs que proporciona acceso reactivo a los metadatos de propiedades de entidades. Todos los componentes de input (TextInput, NumberInput, BooleanInput, etc.) utilizan este composable para obtener configuración automática de nombres, validaciones, estados disabled, mensajes de error y textos de ayuda extraídos desde decoradores.

El composable actúa como puente entre los metadatos almacenados por decoradores en el prototype de BaseEntity y los componentes Vue que necesitan acceder a esta información de forma reactiva.

## 2. Alcance

### Incluye
- Función useInputMetadata con firma completa
- Interface InputMetadata con 7 propiedades
- Implementación completa del composable
- Mapeo de decoradores a propiedades metadata
- Uso del composable en componentes de input
- Patrón de acceso .value para ComputedRefs
- Ejemplos de implementación en setup y template
- Ventajas de reactividad con computed refs
- Técnicas de debugging

### No Incluye
- Implementación de decoradores individuales
- Métodos de BaseEntity que acceden metadata
- Lógica de validación asíncrona
- Componentes de input específicos (documentados separadamente)
- Sistema de validación completo
- Gestión de eventos eventBus

## 3. Definiciones Clave

**useInputMetadata**: Función composable de Vue 3 que recibe entityClass, entity y propertyKey, retornando objeto InputMetadata con refs reactivos a metadatos de la propiedad.

**InputMetadata**: Interface TypeScript que define estructura del objeto retornado por useInputMetadata, conteniendo 7 propiedades (1 string + 6 ComputedRefs).

**propertyName**: String no reactivo que contiene el nombre legible de la propiedad obtenido desde @PropertyName o propertyKey como fallback.

**required**: ComputedRef<boolean> reactivo indicando si la propiedad es requerida según @Required.

**disabled**: ComputedRef<boolean> reactivo indicando si la propiedad está deshabilitada según @Disabled.

**validated**: ComputedRef<boolean> reactivo indicando si la propiedad pasa validación síncrona según @Validation.

**requiredMessage**: ComputedRef<string|undefined> reactivo conteniendo mensaje error personalizado de @Required.

**validatedMessage**: ComputedRef<string|undefined> reactivo conteniendo mensaje error personalizado de @Validation.

**helpText**: ComputedRef<string|undefined> reactivo conteniendo texto ayuda desde @HelpText.

**ComputedRef**: Tipo Vue 3 que encapsula valor reactivo calculado automáticamente cuando cambian sus dependencias, accesible mediante .value.

## 4. Descripción Técnica

### Firma de la Función

```typescript
export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata
```

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| entityClass | typeof BaseEntity | Clase de la entidad (constructor) para acceder a métodos estáticos de metadata |
| entity | BaseEntity | Instancia de la entidad para acceder a métodos de instancia reactivos |
| propertyKey | string | Nombre de la propiedad en camelCase (ej: 'name', 'unitPrice') |

**Retorno:** InputMetadata

### Interface InputMetadata

```typescript
export interface InputMetadata {
    propertyName: string;
    required: ComputedRef<boolean>;
    disabled: ComputedRef<boolean>;
    validated: ComputedRef<boolean>;
    requiredMessage: ComputedRef<string | undefined>;
    validatedMessage: ComputedRef<string | undefined>;
    helpText: ComputedRef<string | undefined>;
}
```

**Propiedades:**

| Propiedad | Tipo | Reactividad | Descripción |
|-----------|------|-------------|-------------|
| propertyName | string | NO | Nombre legible de la propiedad |
| required | ComputedRef<boolean> | SÍ | Si la propiedad es requerida |
| disabled | ComputedRef<boolean> | SÍ | Si la propiedad está deshabilitada |
| validated | ComputedRef<boolean> | SÍ | Si pasa validación síncrona |
| requiredMessage | ComputedRef<string / undefined> | SÍ | Mensaje error required personalizado |
| validatedMessage | ComputedRef<string / undefined> | SÍ | Mensaje error validation personalizado |
| helpText | ComputedRef<string / undefined> | SÍ | Texto de ayuda |

### Implementación Completa

```typescript
import type { BaseEntity } from '@/entities/base_entitiy';
import { computed, type ComputedRef } from 'vue';

export interface InputMetadata {
    propertyName: string;
    required: ComputedRef<boolean>;
    disabled: ComputedRef<boolean>;
    validated: ComputedRef<boolean>;
    requiredMessage: ComputedRef<string | undefined>;
    validatedMessage: ComputedRef<string | undefined>;
    helpText: ComputedRef<string | undefined>;
}

export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata {
    // Obtener nombre legible (estático, no reactivo)
    const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;

    // Crear refs reactivos para cada metadata
    const required = computed(() => entity.isRequired(propertyKey));
    const disabled = computed(() => entity.isDisabled(propertyKey));
    const validated = computed(() => entity.isValidation(propertyKey));
    const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
    const validatedMessage = computed(() => entity.validationMessage(propertyKey));
    const helpText = computed(() => entity.getHelpText(propertyKey));

    return {
        propertyName,
        required,
        disabled,
        validated,
        requiredMessage,
        validatedMessage,
        helpText,
    };
}
```

### Extracción propertyName

```typescript
const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;
```

**Lógica:**
1. Invoca entityClass.getPropertyNameByKey(propertyKey) método estático
2. getPropertyNameByKey accede PROPERTY_NAME_KEY metadata del prototype
3. Si decorador @PropertyName existe, retorna nombre legible definido
4. Si no existe decorador, fallback a propertyKey original
5. Resultado almacenado en string (NO ComputedRef, valor estático clase)

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Nombre del Producto', String)
    name!: string;
    
    price!: number; // Sin @PropertyName
}

// Con decorador
const metadata1 = useInputMetadata(Product, product, 'name');
console.log(metadata1.propertyName); // 'Nombre del Producto'

// Sin decorador (fallback)
const metadata2 = useInputMetadata(Product, product, 'price');
console.log(metadata2.propertyName); // 'price'
```

### Extracción required

```typescript
const required = computed(() => entity.isRequired(propertyKey));
```

**Lógica:**
1. computed() crea ref reactivo que recalcula cuando dependencias cambian
2. Invoca entity.isRequired(propertyKey) método de instancia
3. isRequired verifica REQUIRED_KEY metadata decorador @Required
4. Si tiene condition function, evalúa condición contra entity actual
5. Retorna boolean true/false
6. Si entity cambia y condition depende de otras propiedades, computed recalcula automáticamente

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @Required()
    name!: string;
    
    @Required({ condition: (e) => e.name !== '' })
    email!: string;
}

const user = new User({ name: '', email: '' });
const emailMetadata = useInputMetadata(User, user, 'email');

console.log(emailMetadata.required.value); // false (name vacío)

user.name = 'Alice';
// computed detecta cambio automáticamente
console.log(emailMetadata.required.value); // true (ahora required)
```

### Extracción disabled

```typescript
const disabled = computed(() => entity.isDisabled(propertyKey));
```

**Lógica:**
1. computed() crea ref reactivo
2. Invoca entity.isDisabled(propertyKey) método de instancia
3. isDisabled verifica DISABLED_KEY metadata decorador @Disabled
4. Si tiene condition function, evalúa condición contra entity actual
5. Retorna boolean true/false
6. Reactividad automática si entity o dependencias cambian

**Ejemplo:**

```typescript
export class Order extends BaseEntity {
    @Disabled()
    orderNumber!: string;
    
    status!: string;
    
    @Disabled({ condition: (e) => e.status === 'completed' })
    discount!: number;
}

const order = new Order({ status: 'pending', discount: 0 });
const discountMetadata = useInputMetadata(Order, order, 'discount');

console.log(discountMetadata.disabled.value); // false

order.status = 'completed';
console.log(discountMetadata.disabled.value); // true
```

### Extracción validated

```typescript
const validated = computed(() => entity.isValidation(propertyKey));
```

**Lógica:**
1. computed() crea ref reactivo
2. Invoca entity.isValidation(propertyKey) método de instancia
3. isValidation verifica VALIDATION_KEY metadata decorador @Validation
4. Ejecuta condition function pasando entity actual
5. Retorna true si pasa validación, false si falla
6. Reactividad automática cuando entity[propertyKey] o dependencias cambian

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @Validation({
        condition: (e) => e.price > 0,
        message: 'El precio debe ser mayor a 0'
    })
    price!: number;
}

const product = new Product({ price: -10 });
const priceMetadata = useInputMetadata(Product, product, 'price');

console.log(priceMetadata.validated.value); // false

product.price = 100;
console.log(priceMetadata.validated.value); // true
```

### Extracción requiredMessage

```typescript
const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
```

**Lógica:**
1. computed() crea ref reactivo
2. Invoca entity.requiredMessage(propertyKey) método de instancia
3. requiredMessage accede REQUIRED_KEY metadata
4. Retorna message string si existe en decorador @Required({ message })
5. Retorna undefined si no hay mensaje personalizado
6. Reactividad automática si metadata cambia

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @Required({ message: 'El nombre es obligatorio' })
    name!: string;
    
    @Required() // Sin mensaje custom
    email!: string;
}

const user = new User({});

const nameMetadata = useInputMetadata(User, user, 'name');
console.log(nameMetadata.requiredMessage.value); // 'El nombre es obligatorio'

const emailMetadata = useInputMetadata(User, user, 'email');
console.log(emailMetadata.requiredMessage.value); // undefined
```

### Extracción validatedMessage

```typescript
const validatedMessage = computed(() => entity.validationMessage(propertyKey));
```

**Lógica:**
1. computed() crea ref reactivo
2. Invoca entity.validationMessage(propertyKey) método de instancia
3. validationMessage accede VALIDATION_KEY metadata
4. Retorna message string definido en @Validation({ message })
5. Retorna undefined si no hay mensaje
6. Reactividad automática si metadata cambia

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @Validation({
        condition: (e) => e.price >= 0,
        message: 'El precio no puede ser negativo'
    })
    price!: number;
}

const product = new Product({ price: -50 });
const priceMetadata = useInputMetadata(Product, product, 'price');

console.log(priceMetadata.validatedMessage.value); 
// 'El precio no puede ser negativo'
```

### Extracción helpText

```typescript
const helpText = computed(() => entity.getHelpText(propertyKey));
```

**Lógica:**
1. computed() crea ref reactivo
2. Invoca entity.getHelpText(propertyKey) método de instancia
3. getHelpText accede HELP_TEXT_KEY metadata decorador @HelpText
4. Retorna string texto ayuda si existe
5. Retorna undefined si no hay @HelpText
6. Reactividad automática si metadata cambia

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @HelpText('Mínimo 4 caracteres, solo letras y números')
    username!: string;
    
    phone!: string; // Sin @HelpText
}

const user = new User({});

const usernameMetadata = useInputMetadata(User, user, 'username');
console.log(usernameMetadata.helpText.value); 
// 'Mínimo 4 caracteres, solo letras y números'

const phoneMetadata = useInputMetadata(User, user, 'phone');
console.log(phoneMetadata.helpText.value); // undefined
```

### Uso en Componentes de Input

**Setup Pattern:**

```typescript
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entitiy';

const props = defineProps<{
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
}>();

// Extraer metadata reactiva
const metadata = useInputMetadata(
    props.entityClass,
    props.entity,
    props.propertyKey
);

// metadata ahora disponible en template
return { metadata };
```

**Template Usage:**

```vue
<template>
    <div class="input-group">
        <!-- Nombre legible -->
        <label>
            {{ metadata.propertyName }}
            <span v-if="metadata.required.value" class="required">*</span>
        </label>
        
        <!-- Input con binding disabled -->
        <input 
            v-model="entity[propertyKey]"
            :disabled="metadata.disabled.value"
            :class="{ 'is-invalid': !metadata.validated.value }"
        />
        
        <!-- Mensaje error required -->
        <div v-if="metadata.required.value && !entity[propertyKey]" class="error">
            {{ metadata.requiredMessage.value || 'Este campo es requerido' }}
        </div>
        
        <!-- Mensaje error validation -->
        <div v-if="!metadata.validated.value" class="error">
            {{ metadata.validatedMessage.value }}
        </div>
        
        <!-- Texto ayuda -->
        <small v-if="metadata.helpText.value" class="help-text">
            {{ metadata.helpText.value }}
        </small>
    </div>
</template>
```

**Acceso .value:**
- En script setup: metadata.required.value, metadata.disabled.value, etc.
- En template: Vue unwraps automáticamente, usar metadata.required.value explícitamente
- Acceso correcto: metadata.required.value (obtiene boolean)
- Acceso incorrecto: metadata.required (obtiene ComputedRef object, siempre truthy)

## 5. Flujo de Funcionamiento

### Flujo Completo

1. Decoradores aplicados a clase entidad almacenan metadata en prototype vía Reflect.defineMetadata
2. entityClass creado extendiendo BaseEntity con decoradores aplicados
3. entity instancia creada desde entityClass con datos iniciales
4. Componente input recibe props entityClass, entity, propertyKey
5. setup() invoca useInputMetadata(entityClass, entity, propertyKey)
6. useInputMetadata ejecuta:
   a. Extrae propertyName desde entityClass.getPropertyNameByKey(propertyKey)
   b. Crea computed(() => entity.isRequired(propertyKey)) → required ComputedRef
   c. Crea computed(() => entity.isDisabled(propertyKey)) → disabled ComputedRef
   d. Crea computed(() => entity.isValidation(propertyKey)) → validated ComputedRef
   e. Crea computed(() => entity.requiredMessage(propertyKey)) → requiredMessage ComputedRef
   f. Crea computed(() => entity.validationMessage(propertyKey)) → validatedMessage ComputedRef
   g. Crea computed(() => entity.getHelpText(propertyKey)) → helpText ComputedRef
7. Retorna objeto InputMetadata con todas propiedades
8. setup retorna { metadata } exponiendo a template
9. Template accede metadata.propertyName directamente (string)
10. Template accede metadata.required.value, .disabled.value, etc (ComputedRefs)
11. Usuario modifica entity[propertyKey] escribiendo en input
12. Vue reactivity detecta cambio en entity
13. Computed refs con dependencias de entity recalculan automáticamente
14. Template re-renderiza mostrando nuevos valores metadata actualizados
15. Ciclo continúa mientras componente montado

### Mapeo Decorador → Metadata

| Decorador | Método BaseEntity | Propiedad InputMetadata | Tipo |
|-----------|-------------------|-------------------------|------|
| @PropertyName('Name', String) | getPropertyNameByKey | propertyName | string |
| @Required() | isRequired | required | ComputedRef<boolean> |
| @Required() | requiredMessage | requiredMessage | ComputedRef<string/undefined> |
| @Disabled() | isDisabled | disabled | ComputedRef<boolean> |
| @Validation({...}) | isValidation | validated | ComputedRef<boolean> |
| @Validation({...}) | validationMessage | validatedMessage | ComputedRef<string/undefined> |
| @HelpText('...') | getHelpText | helpText | ComputedRef<string/undefined> |

**Decoradores NO incluidos:**
- @ReadOnly: Aunque entity.isReadOnly() existe, NO incluido en InputMetadata interface
- @AsyncValidation: Validaciones asíncronas manejadas directamente en inputs, no via composable
- @Mask: Máscaras aplicadas en inputs específicos, no metadata general
- @DisplayFormat: Formatos aplicados en getFormattedValue, no metadata input

### Reactividad con ComputedRef

**Ventajas:**

1. **Actualización automática**: Si entity cambia y condition en @Required/@Disabled depende de otras propiedades, computed recalcula sin manual intervention.

2. **Performance**: Computed solo recalcula cuando cambian dependencias específicas, no re-ejecuta todo innecesariamente.

3. **Type-safe**: TypeScript detecta errores compilación si accedes .value incorrectamente.

4. **Cleanup automático**: Vue maneja cleanup de watchers internos computed cuando componente desmonta, sin memory leaks.

**Ejemplo reactividad automática:**

```typescript
export class User extends BaseEntity {
    @Required({ condition: (e) => e.age >= 18 })
    driverLicense!: string;
    
    age!: number;
}

const user = new User({ age: 16, driverLicense: '' });
const licenseMetadata = useInputMetadata(User, user, 'driverLicense');

console.log(licenseMetadata.required.value); // false (16 < 18)

user.age = 20;
// computed detecta cambio automáticamente
console.log(licenseMetadata.required.value); // true (20 >= 18)
```

## 6. Reglas Obligatorias

1. useInputMetadata DEBE recibir entityClass como typeof BaseEntity (clase, no instancia)
2. useInputMetadata DEBE recibir entity como instancia BaseEntity
3. useInputMetadata DEBE recibir propertyKey como string camelCase
4. useInputMetadata DEBE retornar objeto cumpliendo interface InputMetadata exacta
5. propertyName DEBE extraerse desde getPropertyNameByKey con fallback a propertyKey
6. propertyName DEBE ser string directo, NO ComputedRef
7. Todas metadata excepto propertyName DEBEN ser ComputedRef
8. required DEBE invocar entity.isRequired dentro computed
9. disabled DEBE invocar entity.isDisabled dentro computed
10. validated DEBE invocar entity.isValidation dentro computed
11. requiredMessage DEBE invocar entity.requiredMessage dentro computed
12. validatedMessage DEBE invocar entity.validationMessage dentro computed
13. helpText DEBE invocar entity.getHelpText dentro computed
14. Componentes input DEBEN invocar useInputMetadata en setup
15. Template DEBE acceder ComputedRefs usando .value explícitamente
16. Template DEBE usar metadata.propertyName sin .value (es string)
17. Componentes NO DEBEN almacenar metadata valores estáticamente (perder reactividad)
18. Componentes NO DEBEN invocar entity.isRequired directamente (usar metadata.required.value)
19. Composable NO DEBE incluir lógica validación asíncrona
20. Composable NO DEBE manejar eventos eventBus

## 7. Prohibiciones

1. NO crear metadata refs con ref() en lugar de computed() (perder auto-update)
2. NO acceder metadata.required sin .value en script (obtener object, no boolean)
3. NO almacenar metadata.required.value en variable setup (perder reactividad)
4. NO invocar useInputMetadata en mounted/onMounted (debe ser setup)
5. NO pasar entity como entityClass o viceversa (error tipos)
6. NO pasar propertyKey undefined o null (crash decoradores)
7. NO modificar metadata refs directamente (readonly computeds)
8. NO incluir @ReadOnly en interface actual (aunque exists, no usado)
9. NO incluir @AsyncValidation en composable (manejado inputs)
10. NO hardcodear propertyName ignorando getPropertyNameByKey
11. NO usar watch(() => entity.isRequired()) en lugar de computed (redundante)
12. NO crear computed anidados dentro useInputMetadata (ya son computed)
13. NO retornar refs raw con ref() en lugar de computed (perder logic)
14. NO invocar useInputMetadata múltiples veces mismo propertyKey (ineficiente)
15. NO cachear metadata globalmente (cada input debe invocar)
16. NO asumir metadata.requiredMessage.value siempre tiene valor (puede undefined)
17. NO asumir metadata.validatedMessage.value siempre tiene valor (puede undefined)
18. NO asumir metadata.helpText.value siempre tiene valor (puede undefined)
19. NO usar metadata sin verificar null/undefined en template
20. NO extender interface InputMetadata sin actualizar composable implementación

## 8. Dependencias

### Vue 3
- computed (función crear ComputedRefs reactivos)
- ComputedRef (tipo TypeScript refs computados)
- Composition API (setup pattern)

### BaseEntity
- getPropertyNameByKey (método estático)
- isRequired (método instancia)
- isDisabled (método instancia)
- isValidation (método instancia)
- requiredMessage (método instancia)
- validationMessage (método instancia)
- getHelpText (método instancia)

### Decoradores
- @PropertyName (almacena nombre legible)
- @Required (almacena condición y mensaje)
- @Disabled (almacena condición)
- @Validation (almacena condición y mensaje)
- @HelpText (almacena texto ayuda)

### TypeScript
- typeof BaseEntity (tipo clase)
- Interface InputMetadata (estructura retorno)
- Type safety propiedades

## 9. Relaciones

### Con BaseEntity
- Invoca getPropertyNameByKey obteniendo nombre legible
- Invoca isRequired verificando requerido
- Invoca isDisabled verificando deshabilitado
- Invoca isValidation verificando validación síncrona
- Invoca requiredMessage obteniendo mensaje error required
- Invoca validationMessage obteniendo mensaje error validation
- Invoca getHelpText obteniendo texto ayuda

### Con Componentes Input
- TextInputComponent invoca useInputMetadata en setup
- NumberInputComponent invoca useInputMetadata en setup
- BooleanInputComponent invoca useInputMetadata en setup
- DateInputComponent invoca useInputMetadata en setup
- EmailInputComponent invoca useInputMetadata en setup
- PasswordInputComponent invoca useInputMetadata en setup
- TextAreaInputComponent invoca useInputMetadata en setup
- ObjectInputComponent invoca useInputMetadata en setup
- ArrayInputComponent invoca useInputMetadata en setup
- ListInputComponent invoca useInputMetadata en setup
- Todos inputs dependen completamente este composable

### Con Decoradores
- @PropertyName proporciona propertyName metadata
- @Required proporciona required y requiredMessage metadata
- @Disabled proporciona disabled metadata
- @Validation proporciona validated y validatedMessage metadata
- @HelpText proporciona helpText metadata

### Con Sistema Validación
- validated indica si pasa validación síncrona
- validatedMessage proporciona feedback error validation
- requiredMessage proporciona feedback error required
- NO incluye validación asíncrona (manejada inputs)

## 10. Notas de Implementación

### Ejemplo Completo Customer Entity

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Nombre del Cliente', String)
    @Required({ message: 'El nombre es obligatorio' })
    @HelpText('Ingrese el nombre completo del cliente')
    @Validation({
        condition: (e) => e.name.length >= 3,
        message: 'El nombre debe tener al menos 3 caracteres'
    })
    name!: string;
    
    @PropertyName('Email', String)
    @Required({ message: 'El email es obligatorio' })
    @HelpText('Ejemplo: usuario@dominio.com')
    @Validation({
        condition: (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email),
        message: 'Email inválido'
    })
    email!: string;
    
    @PropertyName('Edad', Number)
    @Disabled({ condition: (e) => e.isPremium })
    @HelpText('Edad del cliente en años')
    age!: number;
    
    isPremium!: boolean;
}

const customer = new Customer({ name: 'Jo', email: 'invalid', age: 25, isPremium: false });

const nameMetadata = useInputMetadata(Customer, customer, 'name');
// propertyName: 'Nombre del Cliente'
// required.value: true
// requiredMessage.value: 'El nombre es obligatorio'
// validated.value: false (length < 3)
// validatedMessage.value: 'El nombre debe tener al menos 3 caracteres'
// helpText.value: 'Ingrese el nombre completo del cliente'
// disabled.value: false

const emailMetadata = useInputMetadata(Customer, customer, 'email');
// propertyName: 'Email'
// required.value: true
// validated.value: false (regex no pasa)
// validatedMessage.value: 'Email inválido'

const ageMetadata = useInputMetadata(Customer, customer, 'age');
// propertyName: 'Edad'
// disabled.value: false (isPremium false)
customer.isPremium = true;
// disabled.value: true (reactividad automática)
```

### Debugging Metadata

```typescript
import { onMounted } from 'vue';

export default {
    setup(props) {
        const metadata = useInputMetadata(
            props.entityClass,
            props.entity,
            props.propertyKey
        );
        
        onMounted(() => {
            console.log('Property Name:', metadata.propertyName);
            console.log('Required:', metadata.required.value);
            console.log('Disabled:', metadata.disabled.value);
            console.log('Validated:', metadata.validated.value);
            console.log('Help Text:', metadata.helpText.value);
        });
        
        return { metadata };
    },
};
```

### Watch Cambios Metadata

```typescript
import { watch } from 'vue';

export default {
    setup(props) {
        const metadata = useInputMetadata(
            props.entityClass,
            props.entity,
            props.propertyKey
        );
        
        watch(() => metadata.disabled.value, (newVal, oldVal) => {
            console.log(`disabled cambió: ${oldVal} → ${newVal}`);
        });
        
        watch(() => metadata.required.value, (newVal, oldVal) => {
            console.log(`required cambió: ${oldVal} → ${newVal}`);
        });
        
        return { metadata };
    },
};
```

### Extending Interface (NO RECOMENDADO)

Si necesitas metadata adicional, extiende interface:

```typescript
export interface ExtendedInputMetadata extends InputMetadata {
    readOnly: ComputedRef<boolean>;
    placeholder: ComputedRef<string | undefined>;
}

export function useExtendedInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): ExtendedInputMetadata {
    const baseMetadata = useInputMetadata(entityClass, entity, propertyKey);
    
    const readOnly = computed(() => entity.isReadOnly(propertyKey));
    const placeholder = computed(() => entity.getPlaceholder(propertyKey));
    
    return {
        ...baseMetadata,
        readOnly,
        placeholder,
    };
}
```

NO recomendado porque rompe consistencia. Mejor crear composable separado.

### Custom Messages Fallback

```vue
<template>
    <div v-if="showError" class="error">
        {{ errorMessage }}
    </div>
</template>

<script setup>
const showError = computed(() => {
    return (metadata.required.value && !entity[propertyKey]) ||
           !metadata.validated.value;
});

const errorMessage = computed(() => {
    if (metadata.required.value && !entity[propertyKey]) {
        return metadata.requiredMessage.value || 'Este campo es requerido';
    }
    if (!metadata.validated.value) {
        return metadata.validatedMessage.value || 'Valor inválido';
    }
    return '';
});
</script>
```

### Testing Composable

```typescript
import { describe, it, expect } from 'vitest';
import { useInputMetadata } from '@/composables/useInputMetadata';
import { Customer } from '@/entities/customer';

describe('useInputMetadata', () => {
    it('extrae propertyName correctamente', () => {
        const customer = new Customer();
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.propertyName).toBe('Nombre del Cliente');
    });
    
    it('retorna required reactivo', () => {
        const customer = new Customer({ name: '' });
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.required.value).toBe(true);
    });
    
    it('actualiza validated cuando cambia entity', () => {
        const customer = new Customer({ name: 'Jo' });
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.validated.value).toBe(false); // < 3 chars
        
        customer.name = 'John';
        expect(metadata.validated.value).toBe(true); // >= 3 chars
    });
    
    it('retorna undefined para propiedades sin decoradores', () => {
        const customer = new Customer();
        const metadata = useInputMetadata(Customer, customer, 'unknownProp');
        
        expect(metadata.propertyName).toBe('unknownProp');
        expect(metadata.requiredMessage.value).toBeUndefined();
        expect(metadata.helpText.value).toBeUndefined();
    });
});
```

## 11. Referencias Cruzadas

### Documentación Relacionada
- [../../02-base-entity/metadata-access.md](../../02-base-entity/metadata-access.md) - Métodos metadata BaseEntity
- [../../02-base-entity/validation-system.md](../../02-base-entity/validation-system.md) - Sistema validación
- [form-inputs.md](form-inputs.md) - Componentes input que usan composable
- [../../01-decorators/property-name-decorator.md](../../01-decorators/property-name-decorator.md) - @PropertyName
- [../../01-decorators/required-decorator.md](../../01-decorators/required-decorator.md) - @Required
- [../../01-decorators/disabled-decorator.md](../../01-decorators/disabled-decorator.md) - @Disabled
- [../../01-decorators/validation-decorator.md](../../01-decorators/validation-decorator.md) - @Validation
- [../../01-decorators/help-text-decorator.md](../../01-decorators/help-text-decorator.md) - @HelpText

### Código Fuente
- src/composables/useInputMetadata.ts (implementación composable)
- src/entities/base_entitiy.ts (métodos metadata)
- src/components/Form/*.vue (todos inputs usan composable)

### Vue 3 Documentation
- Composition API computed: https://vuejs.org/api/reactivity-core.html#computed
- ComputedRef types: https://vuejs.org/api/reactivity-core.html#computedref
