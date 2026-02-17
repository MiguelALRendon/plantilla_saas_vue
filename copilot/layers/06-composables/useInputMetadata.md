# COMPOSABLE useInputMetadata

## 1. Propósito

Este documento describe el composable useInputMetadata de la capa Composables, función central del sistema de inputs que proporciona acceso reactivo a metadatos de propiedades de entidades BaseEntity. Todos los componentes de input del framework (TextInput, NumberInput, BooleanInput, DateInput, EmailInput, PasswordInput, TextAreaInput, ObjectInput, ArrayInput, ListInput) dependen exclusivamente de este composable para obtener configuración automática desde decoradores aplicados a propiedades.

El composable actúa como puente entre metadata almacenada en prototype de clases entidad mediante Reflect.defineMetadata y componentes Vue que requieren acceso reactivo a nombres de propiedad, estados de validación, condiciones disabled, mensajes de error y textos de ayuda.

## 2. Alcance

### Incluye
- Función useInputMetadata firma completa TypeScript
- Interface InputMetadata definiendo estructura retorno
- Implementación completa con 7 propiedades metadata
- Extracción propertyName desde getPropertyNameByKey
- Creación computed refs reactivos para required, disabled, validated, requiredMessage, validatedMessage, helpText
- Mapeo exhaustivo decoradores a propiedades InputMetadata
- Patrón usage en componentes setup y template
- Acceso .value para ComputedRefs
- Ventajas reactividad con computed vs ref
- Ejemplos prácticos Customer entity completa
- Técnicas debugging con watch y onMounted
- Testing unitario composable

### No Incluye
- Implementación interna decoradores (@PropertyName, @Required, @Disabled, @Validation, @HelpText)
- Implementación métodos BaseEntity (getPropertyNameByKey, isRequired, isDisabled, isValidation, requiredMessage, validationMessage, getHelpText)
- Lógica validación asíncrona (@AsyncValidation manejado directamente inputs)
- Composable @ReadOnly metadata (aunque isReadOnly existe, no incluido interface)
- Componentes input específicos implementación
- Sistema eventBus y eventos validate-inputs
- Gestión estado global Application

## 3. Definiciones Clave

**useInputMetadata**: Función composable Vue 3 Composition API recibiendo entityClass (typeof BaseEntity), entity (instancia BaseEntity), propertyKey (string), retornando objeto InputMetadata con refs reactivos a metadatos propiedad.

**InputMetadata**: Interface TypeScript definiendo estructura objeto retornado por useInputMetadata, conteniendo 7 propiedades: 1 string no reactivo (propertyName) + 6 ComputedRefs reactivos (required, disabled, validated, requiredMessage, validatedMessage, helpText).

**propertyName**: String estático (NO ComputedRef) almacenando nombre legible propiedad desde @PropertyName o fallback a propertyKey original si decorador ausente.

**required**: ComputedRef<boolean> reactivo indicando si propiedad requerida según @Required, evaluando condition opcional contra entity actual, recalculando automáticamente cuando entity cambia.

**disabled**: ComputedRef<boolean> reactivo indicando si propiedad deshabilitada según @Disabled, evaluando condition opcional contra entity actual, recalculando automáticamente cuando entity cambia.

**validated**: ComputedRef<boolean> reactivo indicando si propiedad pasa validación síncrona según @Validation, ejecutando condition function contra entity actual, retornando true si pasa, false si falla, recalculando automáticamente cuando entity[propertyKey] cambia.

**requiredMessage**: ComputedRef<string|undefined> reactivo conteniendo mensaje error personalizado desde @Required({ message }), retornando undefined si sin mensaje custom.

**validatedMessage**: ComputedRef<string|undefined> reactivo conteniendo mensaje error personalizado desde @Validation({ message }), retornando undefined si sin mensaje.

**helpText**: ComputedRef<string|undefined> reactivo conteniendo texto ayuda desde @HelpText, retornando undefined si decorador ausente.

**ComputedRef**: Tipo Vue 3 encapsulando valor reactive calculado automáticamente cuando dependencias cambian, accesible mediante .value, lazy evaluation hasta acceso, caching resultado, invalidación automática dependencias.

## 4. Descripción Técnica

### Ubicación Código Fuente

**Archivo:** src/composables/useInputMetadata.ts  
**Líneas:** 1-38 (función completa)  
**Export:** export function useInputMetadata()  
**Export:** export interface InputMetadata

### Firma Función useInputMetadata

```typescript
export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata
```

**Parámetros:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| entityClass | typeof BaseEntity | SÍ | Clase entidad (constructor) para acceder métodos estáticos getPropertyNameByKey |
| entity | BaseEntity | SÍ | Instancia entidad con datos actuales para métodos instancia isRequired, isDisabled, isValidation, etc |
| propertyKey | string | SÍ | Nombre propiedad camelCase a la que pertenece input (ej: 'name', 'unitPrice', 'isActive') |

**Retorno:** InputMetadata

Objeto con estructura definida interface InputMetadata conteniendo 7 propiedades metadata extraídas desde decoradores.

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

**Propiedades Interface:**

| Propiedad | Tipo | Reactivo | Descripción Detallada |
|-----------|------|----------|------------------------|
| propertyName | string | NO | Nombre legible propiedad desde @PropertyName, fallback propertyKey si decorador ausente |
| required | ComputedRef<boolean> | SÍ | Booleano indicando si propiedad requerida según @Required, evalúa condition si existe |
| disabled | ComputedRef<boolean> | SÍ | Booleano indicando si propiedad deshabilitada según @Disabled, evalúa condition si existe |
| validated | ComputedRef<boolean> | SÍ | Booleano indicando si propiedad pasa validación síncrona @Validation condition function |
| requiredMessage | ComputedRef<string / undefined> | SÍ | Mensaje error personalizado @Required({ message }), undefined si ausente |
| validatedMessage | ComputedRef<string / undefined> | SÍ | Mensaje error personalizado @Validation({ message }), undefined si ausente |
| helpText | ComputedRef<string / undefined> | SÍ | Texto ayuda @HelpText, undefined si decorador ausente |

### Implementación Completa Código Fuente

```typescript
import type { BaseEntity } from '@/entities/base_entity';
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
    // Invoca método estático clase accediendo PROPERTY_NAME_KEY metadata
    const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;

    // Crear refs reactivos para cada metadata invocando métodos instancia
    // computed() crea lazy reactive ref recalculando cuando dependencias cambian
    const required = computed(() => entity.isRequired(propertyKey));
    const disabled = computed(() => entity.isDisabled(propertyKey));
    const validated = computed(() => entity.isValidation(propertyKey));
    const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
    const validatedMessage = computed(() => entity.validationMessage(propertyKey));
    const helpText = computed(() => entity.getHelpText(propertyKey));

    // Retornar objeto cumpliendo interface InputMetadata
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

### Extracción propertyName (String Estático)

```typescript
const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;
```

**Proceso:**
1. Invoca entityClass.getPropertyNameByKey(propertyKey) método estático BaseEntity
2. getPropertyNameByKey accede Reflect.getMetadata(PROPERTY_NAME_KEY, prototype, propertyKey)
3. Si decorador @PropertyName aplicado, metadata almacenada retorna nombre legible string
4. Si decorador ausente, getPropertyNameByKey retorna undefined
5. Operador || fallback a propertyKey original si undefined
6. Resultado almacenado variable const string (NO ComputedRef, valor estático clase)

**Razón NO reactivo:**
- propertyName deriva de clase (estático), no instancia (dinámico)
- Decoradores aplicados tiempo definición clase, no cambian runtime
- String directo más eficiente que ComputedRef innecesario

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Nombre del Producto', String)
    name!: string;
    
    price!: number; // Sin @PropertyName
}

const product = new Product({ name: 'Widget', price: 100 });

// Con decorador @PropertyName
const nameMetadata = useInputMetadata(Product, product, 'name');
console.log(nameMetadata.propertyName); // 'Nombre del Producto'

// Sin decorador (fallback)
const priceMetadata = useInputMetadata(Product, product, 'price');
console.log(priceMetadata.propertyName); // 'price'
```

### Extracción required (ComputedRef<boolean>)

```typescript
const required = computed(() => entity.isRequired(propertyKey));
```

**Proceso:**
1. computed() crea ComputedRef Vue 3 con getter function
2. Getter invoca entity.isRequired(propertyKey) método instancia BaseEntity
3. isRequired accede Reflect.getMetadata(REQUIRED_KEY, prototype, propertyKey)
4. Si @Required sin condition: retorna true siempre
5. Si @Required({ condition: (e) => boolean }): evalúa condition(entity) retorna resultado
6. Si decorador ausente: retorna false
7. Vue tracking dependencies: si entity propiedades cambian y condition depende, computed recalcula automáticamente
8. Lazy evaluation: solo ejecuta getter cuando .value accedido
9. Caching: resultado cached hasta dependencias cambian

**Reactividad automática con condition:**

```typescript
export class User extends BaseEntity {
    @Required()
    name!: string; // Siempre required
    
    @Required({ condition: (e) => e.name !== '' })
    email!: string; // Required solo si name no vacío
}

const user = new User({ name: '', email: '' });
const emailMetadata = useInputMetadata(User, user, 'email');

console.log(emailMetadata.required.value); // false (name vacío)

user.name = 'Alice'; // Cambiar propiedad
// Vue detecta cambio entity.name como dependencia computed
console.log(emailMetadata.required.value); // true (reactividad automática)
```

### Extracción disabled (ComputedRef<boolean>)

```typescript
const disabled = computed(() => entity.isDisabled(propertyKey));
```

**Proceso:**
1. computed() crea ComputedRef invocando entity.isDisabled(propertyKey)
2. isDisabled accede DISABLED_KEY metadata decorador @Disabled
3. Si @Disabled sin condition: retorna true siempre
4. Si @Disabled({ condition: (e) => boolean }): evalúa condition(entity) retorna resultado
5. Si decorador ausente: retorna false
6. Reactividad: condition dependencias trackeadas, recalcula cuando entity cambia

**Ejemplo condition dinámica:**

```typescript
export class Order extends BaseEntity {
    @Disabled()
    orderNumber!: string; // Siempre disabled (generado backend)
    
    status!: string;
    
    @Disabled({ condition: (e) => e.status === 'completed' })
    discount!: number; // Disabled solo si status completed
}

const order = new Order({ orderNumber: 'ORD-001', status: 'pending', discount: 0 });
const discountMetadata = useInputMetadata(Order, order, 'discount');

console.log(discountMetadata.disabled.value); // false (status pending)

order.status = 'completed'; // Cambiar status
console.log(discountMetadata.disabled.value); // true (reactividad automática)
```

### Extracción validated (ComputedRef<boolean>)

```typescript
const validated = computed(() => entity.isValidation(propertyKey));
```

**Proceso:**
1. computed() crea ComputedRef invocando entity.isValidation(propertyKey)
2. isValidation accede VALIDATION_KEY metadata decorador @Validation
3. @Validation({ condition: (e) => boolean }) almacena función validadora
4. isValidation ejecuta condition(entity) retorna boolean resultado
5. true si validación pasa, false si falla
6. Reactividad: dependencias condition trackeadas, recalcula cuando entity[propertyKey] o relacionadas cambian
7. Validación síncrona exclusivamente (async manejado inputs directamente)

**Ejemplo validación compleja:**

```typescript
export class Product extends BaseEntity {
    @Validation({
        condition: (e) => e.price > 0,
        message: 'El precio debe ser mayor a 0'
    })
    price!: number;
    
    @Validation({
        condition: (e) => e.stock >= 0 && e.stock <= 10000,
        message: 'Stock debe estar entre 0 y 10000'
    })
    stock!: number;
}

const product = new Product({ price: -10, stock: 5 });
const priceMetadata = useInputMetadata(Product, product, 'price');

console.log(priceMetadata.validated.value); // false (price -10 < 0)

product.price = 100; // Corregir
console.log(priceMetadata.validated.value); // true (reactividad automática)
```

### Extracción requiredMessage (ComputedRef<string|undefined>)

```typescript
const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
```

**Proceso:**
1. computed() invoca entity.requiredMessage(propertyKey) método instancia
2. requiredMessage accede REQUIRED_KEY metadata obteniendo { condition, message }
3. Retorna message string si @Required({ message: 'Texto error' }) definido
4. Retorna undefined si @Required sin message o decorador ausente
5. Reactividad: si metadata dinámica (raro), recalcula

**Uso template:**

```vue
<div v-if="metadata.required.value && !entity[propertyKey]" class="error">
    {{ metadata.requiredMessage.value || 'Este campo es requerido' }}
</div>
```

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

### Extracción validatedMessage (ComputedRef<string|undefined>)

```typescript
const validatedMessage = computed(() => entity.validationMessage(propertyKey));
```

**Proceso:**
1. computed() invoca entity.validationMessage(propertyKey) método instancia
2. validationMessage accede VALIDATION_KEY metadata obteniendo { condition, message }
3. Retorna message string desde @Validation({ message: 'Error' })
4. Retorna undefined si @Validation sin message o decorador ausente
5. Mensaje típicamente mostrado cuando validated.value === false

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

console.log(priceMetadata.validated.value); // false
console.log(priceMetadata.validatedMessage.value); // 'El precio no puede ser negativo'
```

### Extracción helpText (ComputedRef<string|undefined>)

```typescript
const helpText = computed(() => entity.getHelpText(propertyKey));
```

**Proceso:**
1. computed() invoca entity.getHelpText(propertyKey) método instancia
2. getHelpText accede HELP_TEXT_KEY metadata decorador @HelpText
3. Retorna string texto ayuda si @HelpText('...') definido
4. Retorna undefined si decorador ausente
5. Texto ayuda típicamente mostrado debajo input como guía usuario

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @HelpText('Mínimo 4 caracteres, solo letras y números')
    username!: string;
    
    @HelpText('Ejemplo: usuario@dominio.com')
    email!: string;
    
    phone!: string; // Sin @HelpText
}

const user = new User({});

const usernameMetadata = useInputMetadata(User, user, 'username');
console.log(usernameMetadata.helpText.value); 
// 'Mínimo 4 caracteres, solo letras y números'

const phoneMetadata = useInputMetadata(User, user, 'phone');
console.log(phoneMetadata.helpText.value); // undefined
```

### Uso en Componentes Input Setup Pattern

**TextInputComponent.vue:**

```vue
<script setup lang="ts">
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { computed } from 'vue';

const props = defineProps<{
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
}>();

// Extraer metadata reactiva invocando composable
const metadata = useInputMetadata(
    props.entityClass,
    props.entity,
    props.propertyKey
);

// Computed adicional usando metadata
const showRequiredError = computed(() => {
    return metadata.required.value && !props.entity[props.propertyKey];
});
</script>

<template>
    <div class="input-group">
        <label>
            {{ metadata.propertyName }}
            <span v-if="metadata.required.value" class="required">*</span>
        </label>
        
        <input 
            type="text"
            v-model="entity[propertyKey]"
            :disabled="metadata.disabled.value"
            :class="{ 'is-invalid': !metadata.validated.value || showRequiredError }"
        />
        
        <div v-if="showRequiredError" class="error">
            {{ metadata.requiredMessage.value || 'Este campo es requerido' }}
        </div>
        
        <div v-if="!metadata.validated.value" class="error">
            {{ metadata.validatedMessage.value }}
        </div>
        
        <small v-if="metadata.helpText.value" class="help-text">
            {{ metadata.helpText.value }}
        </small>
    </div>
</template>
```

**Acceso .value en Template:**
- Vue 3 unwraps ComputedRefs automáticamente en template
- Sin embargo, mejor práctica usar .value explícitamente para claridad
- metadata.required.value (correcto, obtiene boolean)
- metadata.required (incorrecto en script, obtiene ComputedRef object siempre truthy)

## 5. Flujo de Funcionamiento

### Flujo Completo Desde Decoradores hasta Template

1. **Definición Entidad con Decoradores:**
   - Developer define clase Product extiende BaseEntity
   - Aplica decoradores @PropertyName, @Required, @Validation, @Disabled, @HelpText a propiedades
   - Decoradores ejecutan almacenando metadata Reflect.defineMetadata(KEY, value, prototype, propertyKey)

2. **Creación Instancia Entidad:**
   - const product = new Product({ name: 'Widget', price: 100 })
   - Instancia contiene datos actuales accesibles métodos instancia

3. **Componente Input Recibe Props:**
   - default_detailview pasa :entityClass="Product" :entity="product" :propertyKey="'price'" a NumberInputComponent

4. **Setup() Invoca useInputMetadata:**
   - const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey)

5. **useInputMetadata Ejecuta Extracción:**
   a. **propertyName:** Product.getPropertyNameByKey('price') accede metadata retorna 'Precio Unitario'
   b. **required:** computed(() => product.isRequired('price')) crea ComputedRef invocando isRequired
   c. **disabled:** computed(() => product.isDisabled('price')) crea ComputedRef invocando isDisabled
   d. **validated:** computed(() => product.isValidation('price')) crea ComputedRef invocando isValidation ejecutando condition
   e. **requiredMessage:** computed(() => product.requiredMessage('price')) crea ComputedRef accediendo message
   f. **validatedMessage:** computed(() => product.validationMessage('price')) crea ComputedRef accediendo message
   g. **helpText:** computed(() => product.getHelpText('price')) crea ComputedRef accediendo helpText

6. **Retorno InputMetadata:**
   - useInputMetadata retorna objeto { propertyName, required, disabled, validated, requiredMessage, validatedMessage, helpText }

7. **Setup Expone Metadata:**
   - return { metadata } en setup o defineExpose({ metadata }) en script setup
   - metadata disponible template

8. **Template Renderiza usando Metadata:**
   - <label>{{ metadata.propertyName }}</label> muestra 'Precio Unitario'
   - <input :disabled="metadata.disabled.value"> binding disabled reactivo
   - <span v-if="metadata.required.value">*</span> asterisco condicional required
   - <div v-if="!metadata.validated.value">{{ metadata.validatedMessage.value }}</div> mensaje error validation

9. **Usuario Interactúa Modificando Input:**
   - Usuario escribe nuevo valor input
   - v-model actualiza product.price = nuevoValor
   - Vue reactivity detecta cambio entity

10. **Computed Refs Recalculan Automáticamente:**
    - validated computed depende product.price vía condition((e) => e.price > 0)
    - Vue tracking dependencies detecta product.price cambió
    - computed invalida cache, re-ejecuta getter entity.isValidation('price')
    - Nuevo valor validated.value calculado automáticamente

11. **Template Re-renderiza Automáticamente:**
    - validated.value cambió false → true
    - Vue detecta cambio dependencia template
    - Re-renderiza elementos condicionales v-if="!metadata.validated.value"
    - Mensaje error desaparece si validación pasa ahora

12. **Ciclo Continúa mientras Componente Montado:**
    - Usuario sigue modificando inputs
    - Metadata computed refs actualizan automáticamente
    - Template refleja cambios instantáneamente sin manual intervention

### Mapeo Exhaustivo Decorador → Método BaseEntity → Propiedad InputMetadata

| Decorador | Parámetros | Método BaseEntity Invocado | Propiedad InputMetadata | Tipo Propiedad |
|-----------|------------|----------------------------|-------------------------|----------------|
| @PropertyName('Name', String) | name, type | getPropertyNameByKey(key) | propertyName | string |
| @Required() | - | isRequired(key) | required | ComputedRef<boolean> |
| @Required({ message }) | message | requiredMessage(key) | requiredMessage | ComputedRef<string/undefined> |
| @Required({ condition }) | function | isRequired(key) ejecuta condition | required | ComputedRef<boolean> |
| @Disabled() | - | isDisabled(key) | disabled | ComputedRef<boolean> |
| @Disabled({ condition }) | function | isDisabled(key) ejecuta condition | disabled | ComputedRef<boolean> |
| @Validation({ condition, message }) | functions | isValidation(key) ejecuta condition | validated | ComputedRef<boolean> |
| @Validation({ message }) | message | validationMessage(key) | validatedMessage | ComputedRef<string/undefined> |
| @HelpText('...') | text | getHelpText(key) | helpText | ComputedRef<string/undefined> |

**Decoradores Existentes NO Incluidos Interface:**

| Decorador | Método BaseEntity Existe | Razón NO Incluido |
|-----------|--------------------------|-------------------|
| @ReadOnly() | isReadOnly(key) | SÍ | No usado inputs actualmente, lógica deshabilitado suficiente @Disabled |
| @AsyncValidation() | isAsyncValidation(key) | SÍ | Validaciones asíncronas manejadas directamente inputs via await, no metadata estándar |
| @Mask() | getMask(key) | SÍ | Máscaras específicas inputs particulares (DateInput, PasswordInput), no universal |
| @DisplayFormat() | getDisplayFormat(key) | SÍ | Formatos usados getFormattedValue displaying valores, no input configuration |
| @PrimaryProperty() | getPrimaryPropertyKey() | SÍ | Metadata entidad nivel class, no propiedad individual input |

## 6. Reglas Obligatorias

1. useInputMetadata DEBE recibir entityClass como typeof BaseEntity (clase constructor), NO instancia
2. useInputMetadata DEBE recibir entity como instancia BaseEntity válida con datos actuales
3. useInputMetadata DEBE recibir propertyKey como string camelCase nombre propiedad existente
4. useInputMetadata DEBE retornar objeto cumpliendo exactamente interface InputMetadata 7 propiedades
5. propertyName DEBE extraerse vía entityClass.getPropertyNameByKey(propertyKey) con fallback propertyKey
6. propertyName DEBE ser string directo NO ComputedRef (valor estático clase)
7. required DEBE crearse computed(() => entity.isRequired(propertyKey)) NO ref()
8. disabled DEBE crearse computed(() => entity.isDisabled(propertyKey)) NO ref()
9. validated DEBE crearse computed(() => entity.isValidation(propertyKey)) NO ref()
10. requiredMessage DEBE crearse computed(() => entity.requiredMessage(propertyKey)) NO ref()
11. validatedMessage DEBE crearse computed(() => entity.validationMessage(propertyKey)) NO ref()
12. helpText DEBE crearse computed(() => entity.getHelpText(propertyKey)) NO ref()
13. Todas propiedades metadata excepto propertyName DEBEN ser ComputedRef para reactividad automática
14. Componentes input DEBEN invocar useInputMetadata en setup() o script setup, NO mounted()
15. Template DEBE acceder ComputedRefs usando .value explícitamente (metadata.required.value)
16. Template DEBE acceder propertyName directo sin .value (metadata.propertyName)
17. Componentes NO DEBEN invocar entity.isRequired() directamente, usar metadata.required.value
18. Componentes NO DEBEN almacenar metadata.required.value en variable const (perder reactividad)
19. Composable NO DEBE incluir lógica validación asíncrona (delegado inputs)
20. Composable NO DEBE modificar entity o entityClass (readonly acceso metadata)

## 7. Prohibiciones

1. NO usar ref() en lugar de computed() para metadata refs (perder auto-update lógica)
2. NO acceder metadata.required sin .value en script setup (obtener ComputedRef object, no boolean)
3. NO almacenar metadata.required.value variable const setup (valor estático, perder reactividad)
4. NO invocar useInputMetadata fuera setup (mounted/onMounted/methods incorrecto timing)
5. NO pasar entity como parámetro entityClass o viceversa (error tipos fatal)
6. NO pasar propertyKey undefined, null o vacío (crash acceso metadata)
7. NO modificar metadata refs directamente (readonly computed refs)
8. NO incluir @ReadOnly en interface InputMetadata actual (aunque isReadOnly exists, no usado)
9. NO incluir @AsyncValidation en composable (validaciones async manejadas inputs vía await)
10. NO hardcodear propertyName ignorando getPropertyNameByKey (perder metadata decorador)
11. NO usar watch(() => entity.isRequired()) en lugar computed (redundante, ineficiente)
12. NO crear computed anidados dentro useInputMetadata (ya son computed, causa warning)
13. NO retornar refs raw ref() en lugar computed (perder lógica getter)
14. NO invocar useInputMetadata múltiples veces mismo propertyKey input (ineficiente duplicación)
15. NO cachear metadata globalmente o singleton (cada input debe invocar independiente)
16. NO asumir metadata.requiredMessage.value siempre string (puede undefined, verificar)
17. NO asumir metadata.validatedMessage.value siempre string (puede undefined, verificar)
18. NO asumir metadata.helpText.value siempre string (puede undefined, verificar)
19. NO extender interface InputMetadata sin actualizar useInputMetadata implementación (inconsistencia)
20. NO usar metadata sin verificar null/undefined template opcional v-if (crash runtime propiedades undefined)

## 8. Dependencias

### Vue 3 Composition API
- computed (función crear ComputedRefs reactivos lazy evaluated cached)
- ComputedRef (tipo TypeScript refs computados readonly)
- Composition API setup pattern exportación

### BaseEntity Métodos Estáticos
- getPropertyNameByKey(propertyKey: string): string | undefined (acceso PROPERTY_NAME_KEY metadata clase)

### BaseEntity Métodos Instancia
- isRequired(propertyKey: string): boolean (verifica REQUIRED_KEY ejecuta condition)
- isDisabled(propertyKey: string): boolean (verifica DISABLED_KEY ejecuta condition)
- isValidation(propertyKey: string): boolean (verifica VALIDATION_KEY ejecuta condition retorna resultado)
- requiredMessage(propertyKey: string): string | undefined (accede REQUIRED_KEY retorna message)
- validationMessage(propertyKey: string): string | undefined (accede VALIDATION_KEY retorna message)
- getHelpText(propertyKey: string): string | undefined (accede HELP_TEXT_KEY retorna text)

### Decoradores Metadatos
- @PropertyName (almacena PROPERTY_NAME_KEY metadata nombre legible y tipo)
- @Required (almacena REQUIRED_KEY metadata { condition, message })
- @Disabled (almacena DISABLED_KEY metadata { condition })
- @Validation (almacena VALIDATION_KEY metadata { condition, message })
- @HelpText (almacena HELP_TEXT_KEY metadata texto ayuda)

### Reflect Metadata
- Reflect.getMetadata() invocado indirectamente vía métodos BaseEntity accediendo prototype metadata almacenada decoradores

### TypeScript
- typeof BaseEntity (tipo clase constructor)
- Interface InputMetadata (estructura retorno tipada)
- Type safety genérico parámetros y retorno

## 9. Relaciones

### Con BaseEntity
- useInputMetadata invoca getPropertyNameByKey obteniendo nombre legible propiedad
- useInputMetadata invoca isRequired dentro computed verificando requerido evaluando condition
- useInputMetadata invoca isDisabled dentro computed verificando deshabilitado evaluando condition
- useInputMetadata invoca isValidation dentro computed verificando validación ejecutando condition
- useInputMetadata invoca requiredMessage dentro computed accediendo mensaje error required
- useInputMetadata invoca validationMessage dentro computed accediendo mensaje error validation
- useInputMetadata invoca getHelpText dentro computed accediendo texto ayuda
- Todos métodos BaseEntity acceden Reflect.getMetadata interno obteniendo valores metadata decoradores

### Con Componentes Input (Dependientes Totales)
- TextInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- NumberInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- BooleanInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- DateInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- EmailInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- PasswordInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- TextAreaInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- ObjectInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- ArrayInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- ListInputComponent invoca useInputMetadata setup obteniendo metadata reactiva
- TODOS inputs framework dependen exclusivamente useInputMetadata configuración automática

### Con Decoradores
- @PropertyName proporciona metadata propiedad propertyName vía getPropertyNameByKey
- @Required proporciona metadata propiedades required y requiredMessage vía isRequired y requiredMessage
- @Disabled proporciona metadata propiedad disabled vía isDisabled
- @Validation proporciona metadata propiedades validated y validatedMessage vía isValidation y validationMessage
- @HelpText proporciona metadata propiedad helpText vía getHelpText
- Decoradores almacenan metadata tiempo definición clase, composable extrae runtime

### Con Sistema Validación
- validated indica si propiedad pasa validación síncrona @Validation condition
- validatedMessage proporciona feedback error usuario cuando validated.value === false
- requiredMessage proporciona feedback error usuario cuando required.value === true y valor vacío
- Validación asíncrona @AsyncValidation NO incluida composable, manejada directamente inputs vía await entity.isAsyncValidation()

### Con Vue Reactivity System
- computed() crea ComputedRef tracked dependencies entity propiedades
- Cuando entity[propertyKey] cambia, Vue invalida computed cache
- Computed re-ejecuta getter invocando entity.isValidation(propertyKey)
- Template detecta cambio ComputedRef.value, re-renderiza automáticamente
- Cleanup automático: Vue desmonta componente, computed watchers eliminados garbage collected

## 10. Notas de Implementación

### Ejemplo Completo Customer Entity con Todos Decoradores

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
    
    @PropertyName('Correo Electrónico', String)
    @Required({ message: 'El email es obligatorio' })
    @HelpText('Ejemplo: usuario@dominio.com')
    @Validation({
        condition: (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email),
        message: 'Formato de email inválido'
    })
    email!: string;
    
    @PropertyName('Edad', Number)
    @Disabled({ condition: (e) => e.isPremium })
    @HelpText('Edad del cliente en años completos')
    @Validation({
        condition: (e) => e.age >= 18 && e.age <= 100,
        message: 'La edad debe estar entre 18 y 100 años'
    })
    age!: number;
    
    @PropertyName('Cliente Premium', Boolean)
    isPremium!: boolean;
}

const customer = new Customer({ 
    name: 'Jo', 
    email: 'invalid-email', 
    age: 25, 
    isPremium: false 
});

// Extraer metadata name
const nameMetadata = useInputMetadata(Customer, customer, 'name');
console.log(nameMetadata.propertyName);        // 'Nombre del Cliente'
console.log(nameMetadata.required.value);      // true
console.log(nameMetadata.requiredMessage.value); // 'El nombre es obligatorio'
console.log(nameMetadata.validated.value);     // false (length 2 < 3)
console.log(nameMetadata.validatedMessage.value); // 'El nombre debe tener al menos 3 caracteres'
console.log(nameMetadata.helpText.value);      // 'Ingrese el nombre completo del cliente'
console.log(nameMetadata.disabled.value);      // false

// Extraer metadata email
const emailMetadata = useInputMetadata(Customer, customer, 'email');
console.log(emailMetadata.validated.value);    // false (regex no pasa)
console.log(emailMetadata.validatedMessage.value); // 'Formato de email inválido'

// Extraer metadata age
const ageMetadata = useInputMetadata(Customer, customer, 'age');
console.log(ageMetadata.disabled.value);       // false (isPremium false)
console.log(ageMetadata.validated.value);      // true (25 entre 18-100)

// Cambiar isPremium trigger reactividad disabled
customer.isPremium = true;
console.log(ageMetadata.disabled.value);       // true (reactividad automática)

// Corregir name trigger reactividad validated
customer.name = 'John Doe';
console.log(nameMetadata.validated.value);     // true (length >= 3)
```

### Debugging Metadata con onMounted Console

```typescript
import { onMounted } from 'vue';
import { useInputMetadata } from '@/composables/useInputMetadata';

export default {
    setup(props) {
        const metadata = useInputMetadata(
            props.entityClass,
            props.entity,
            props.propertyKey
        );
        
        onMounted(() => {
            console.group(`Metadata Debug: ${props.propertyKey}`);
            console.log('Property Name:', metadata.propertyName);
            console.log('Required:', metadata.required.value);
            console.log('Disabled:', metadata.disabled.value);
            console.log('Validated:', metadata.validated.value);
            console.log('Required Message:', metadata.requiredMessage.value);
            console.log('Validated Message:', metadata.validatedMessage.value);
            console.log('Help Text:', metadata.helpText.value);
            console.groupEnd();
        });
        
        return { metadata };
    },
};
```

### Watch Cambios Metadata Detectar Reactividad

```typescript
import { watch } from 'vue';

export default {
    setup(props) {
        const metadata = useInputMetadata(
            props.entityClass,
            props.entity,
            props.propertyKey
        );
        
        // Watch disabled cambios
        watch(() => metadata.disabled.value, (newVal, oldVal) => {
            console.log(`${props.propertyKey} disabled: ${oldVal} → ${newVal}`);
        });
        
        // Watch required cambios
        watch(() => metadata.required.value, (newVal, oldVal) => {
            console.log(`${props.propertyKey} required: ${oldVal} → ${newVal}`);
        });
        
        // Watch validated cambios
        watch(() => metadata.validated.value, (newVal, oldVal) => {
            console.log(`${props.propertyKey} validated: ${oldVal} → ${newVal}`);
        });
        
        return { metadata };
    },
};
```

### Custom Messages Fallback Template Idiomático

```vue
<template>
    <div class="input-wrapper">
        <label>{{ metadata.propertyName }}</label>
        <input v-model="entity[propertyKey]" :disabled="metadata.disabled.value" />
        
        <!-- Mensaje error condicional con fallback -->
        <div v-if="showError" class="error-message">
            {{ errorMessage }}
        </div>
        
        <!-- Texto ayuda optional -->
        <small v-if="metadata.helpText.value" class="help-text">
            {{ metadata.helpText.value }}
        </small>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const showError = computed(() => {
    const isEmpty = !entity[propertyKey];
    const isRequired = metadata.required.value;
    const isInvalid = !metadata.validated.value;
    
    return (isRequired && isEmpty) || isInvalid;
});

const errorMessage = computed(() => {
    const isEmpty = !entity[propertyKey];
    const isRequired = metadata.required.value;
    
    if (isRequired && isEmpty) {
        return metadata.requiredMessage.value || 'Este campo es requerido';
    }
    if (!metadata.validated.value) {
        return metadata.validatedMessage.value || 'Valor inválido';
    }
    return '';
});
</script>
```

### Testing Unitario Composable useInputMetadata

```typescript
import { describe, it, expect } from 'vitest';
import { useInputMetadata } from '@/composables/useInputMetadata';
import { Customer } from '@/entities/customer';

describe('useInputMetadata', () => {
    it('extrae propertyName correctamente con decorador', () => {
        const customer = new Customer();
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.propertyName).toBe('Nombre del Cliente');
    });
    
    it('fallback propertyKey si sin decorador @PropertyName', () => {
        const customer = new Customer();
        const metadata = useInputMetadata(Customer, customer, 'unknownProp');
        
        expect(metadata.propertyName).toBe('unknownProp');
    });
    
    it('retorna required reactivo true si decorador @Required', () => {
        const customer = new Customer({ name: '' });
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.required.value).toBe(true);
    });
    
    it('validated reactivo false si condition falla', () => {
        const customer = new Customer({ name: 'Jo' }); // < 3 chars
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.validated.value).toBe(false);
    });
    
    it('validated reactivo true si condition pasa', () => {
        const customer = new Customer({ name: 'John Doe' }); // >= 3 chars
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.validated.value).toBe(true);
    });
    
    it('reactividad automática validated cuando entity cambia', () => {
        const customer = new Customer({ name: 'Jo' });
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.validated.value).toBe(false); // Initial < 3
        
        customer.name = 'John'; // Change entity
        expect(metadata.validated.value).toBe(true); // Reactivity triggered
    });
    
    it('reactividad automática disabled cuando entity cambia', () => {
        const customer = new Customer({ age: 25, isPremium: false });
        const metadata = useInputMetadata(Customer, customer, 'age');
        
        expect(metadata.disabled.value).toBe(false); // Initial isPremium false
        
        customer.isPremium = true; // Change entity
        expect(metadata.disabled.value).toBe(true); // Reactivity triggered
    });
    
    it('retorna requiredMessage si definido en decorador', () => {
        const customer = new Customer();
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.requiredMessage.value).toBe('El nombre es obligatorio');
    });
    
    it('retorna validatedMessage si definido en decorador', () => {
        const customer = new Customer({ name: 'Jo' });
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.validatedMessage.value).toBe('El nombre debe tener al menos 3 caracteres');
    });
    
    it('retorna helpText si decorador @HelpText', () => {
        const customer = new Customer();
        const metadata = useInputMetadata(Customer, customer, 'name');
        
        expect(metadata.helpText.value).toBe('Ingrese el nombre completo del cliente');
    });
    
    it('retorna undefined para metadata sin decoradores', () => {
        const customer = new Customer();
        const metadata = useInputMetadata(Customer, customer, 'unknownProp');
        
        expect(metadata.requiredMessage.value).toBeUndefined();
        expect(metadata.validatedMessage.value).toBeUndefined();
        expect(metadata.helpText.value).toBeUndefined();
    });
});
```

### Extending Interface (NO RECOMENDADO - Rompe Consistencia)

Si proyecto necesita metadata adicional NO incluida interface estándar:

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
    // Obtener metadata base
    const baseMetadata = useInputMetadata(entityClass, entity, propertyKey);
    
    // Agregar metadata adicional
    const readOnly = computed(() => entity.isReadOnly(propertyKey));
    const placeholder = computed(() => entity.getPlaceholder(propertyKey));
    
    // Combinar base + extended
    return {
        ...baseMetadata,
        readOnly,
        placeholder,
    };
}
```

NO recomendado porque:
- Rompe consistencia interface InputMetadata estándar framework
- Crea fragmentación componentes usando extended vs standard
- Mejor solución: crear composable separado useReadOnlyMetadata() o usar @Disabled

## 11. Referencias Cruzadas

### Documentación Relacionada Layers
- [../02-base-entity/metadata-access.md](../02-base-entity/metadata-access.md) - Métodos BaseEntity acceso metadata (getPropertyNameByKey, isRequired, isDisabled, isValidation, requiredMessage, validationMessage, getHelpText)
- [../02-base-entity/validation-system.md](../02-base-entity/validation-system.md) - Sistema validación completo entidades
- [../04-components/form-inputs.md](../04-components/form-inputs.md) - 10 componentes input framework usando useInputMetadata
- [../01-decorators/property-name-decorator.md](../01-decorators/property-name-decorator.md) - @PropertyName almacena nombre legible
- [../01-decorators/required-decorator.md](../01-decorators/required-decorator.md) - @Required almacena condición y mensaje error
- [../01-decorators/disabled-decorator.md](../01-decorators/disabled-decorator.md) - @Disabled almacena condición deshabilitado
- [../01-decorators/validation-decorator.md](../01-decorators/validation-decorator.md) - @Validation almacena condition y mensaje error
- [../01-decorators/help-text-decorator.md](../01-decorators/help-text-decorator.md) - @HelpText almacena texto ayuda

### Código Fuente Ubicación
- src/composables/useInputMetadata.ts (líneas 1-38 implementación completa composable + interface)
- src/entities/base_entity.ts (métodos metadata estáticos e instancia invocados composable)
- src/components/Form/TextInputComponent.vue (ejemplo uso composable setup)
- src/components/Form/NumberInputComponent.vue (ejemplo uso composable setup)
- src/components/Form/BooleanInputComponent.vue (ejemplo uso composable setup)
- Todos componentes src/components/Form/*.vue invocan useInputMetadata

### Vue 3 Documentation Oficial
- Composition API computed: https://vuejs.org/api/reactivity-core.html#computed
- ComputedRef TypeScript types: https://vuejs.org/api/reactivity-core.html#computedref
- Reactivity Fundamentals: https://vuejs.org/guide/essentials/reactivity-fundamentals.html
- TypeScript with Composition API: https://vuejs.org/guide/typescript/composition-api.html
