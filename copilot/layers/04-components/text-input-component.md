# TextInputComponent

## 1. Propósito

Componente de input de texto plano para propiedades de tipo String sin subtipo especial definido por @StringTypeDef. Genera automáticamente input HTML type="text" para propiedades String con StringType.TEXT o sin decorador @StringTypeDef. Integra sistema de validación de tres niveles (required, síncrona, asíncrona) mediante useInputMetadata composable. Renderiza label, input, help text y mensajes de validación. Escucha evento validate-inputs del EventBus para ejecutar validaciones globales. Soporta estado disabled mediante metadata y estado visual nonvalidated para errores

## 2. Alcance

Este documento especifica TextInputComponent ubicado en src/components/Form/TextInputComponent.vue. Cubre estructura de props (entityClass, entity, propertyKey, modelValue), template con label, input type="text", help-text y validation-messages, script con setup usando useInputMetadata, data (textInputId, isInputValidated, validationMessages), lifecycle hooks (mounted con eventBus.on, beforeUnmount con eventBus.off), métodos isValidated y handleValidation, sistema de validación de tres niveles, emisión de evento update:modelValue para v-model binding, clases CSS condicionales disabled y nonvalidated. No cubre implementación de otros componentes de input especializados (EmailInputComponent, PasswordInputComponent, TextAreaComponent) que tienen lógica específica diferente.

## 3. Definiciones Clave

**entityClass prop:** Function que retorna typeof BaseEntity, requerido, proporciona acceso a metadatos estáticos de la clase de entidad.

**entity prop:** Object de tipo BaseEntity, requerido, instancia actual de entidad con datos del registro.

**propertyKey prop:** String requerido, nombre de la propiedad de la entidad que este input representa.

**modelValue prop:** String requerido con default vacío, valor actual del input vinculado mediante v-model.

**useInputMetadata composable:** Función que extrae metadatos (propertyName, required, disabled, validated, helpText, requiredMessage, validatedMessage) desde decoradores aplicados a la propiedad.

**isInputValidated data:** Boolean que indica si el input pasó todas las validaciones, controla clase CSS nonvalidated.

**validationMessages data:** Array de strings que almacena mensajes de error de validaciones fallidas.

**handleValidation method:** Método asíncrono invocado por eventBus on validate-inputs, ejecuta isValidated y actualiza Application.View.value.isValid.

**Nivel 1 validación:** Required validation que verifica modelValue no vacío y sin solo espacios mediante trim.

**Nivel 2 validación:** Validación síncrona que evalúa metadata.validated.value desde decorador @Validation.

**Nivel 3 validación:** Validación asíncrona que ejecuta entity.isAsyncValidation y entity.asyncValidationMessage desde decorador @AsyncValidation.

## 4. Descripción Técnica

### Estructura de Props

```typescript
props: {
    entityClass: {
        type: Function as unknown as () => typeof BaseEntity,
        required: true,
    },
    entity: {
        type: Object as () => BaseEntity,
        required: true,
    },
    propertyKey: {
        type: String,
        required: true,
    },
    modelValue: {
        type: String,
        required: true,
        default: '',
    },
}
```

### Template Structure

```vue
<template>
<div class="TextInput" :class="[{disabled: metadata.disabled.value}, {nonvalidated: !isInputValidated}]">
    <label 
    :for="'id-' + metadata.propertyName" 
    class="label-input">{{ metadata.propertyName }}</label>

    <input 
    :id="'id-' + metadata.propertyName" 
    :name="metadata.propertyName" 
    type="text" 
    class="main-input" 
    placeholder=" "
    :value="modelValue"
    :disabled="metadata.disabled.value"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</div>
</template>
```

Elemento raíz div.TextInput con clases condicionales disabled y nonvalidated. Label con for vinculado a id del input. Input type="text" con value vinculado a modelValue prop, @input emite update:modelValue con ($event.target as HTMLInputElement).value. Div help-text renderizado condicionalmente si metadata.helpText.value existe. Div validation-messages itera sobre validationMessages array mostrando cada mensaje de error.

### Setup con Composition API

```typescript
setup(props) {
    const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
    return {
        metadata,
    };
}
```

Ejecuta useInputMetadata composable pasando entityClass, entity y propertyKey. Retorna objeto metadata que expone refs reactivas: propertyName, required, disabled, validated, helpText, requiredMessage, validatedMessage.

### Data Properties

```typescript
data() {
    return {
        textInputId: 'text-input-' + this.propertyKey,
        isInputValidated: true,
        validationMessages: [] as string[],
    }
}
```

textInputId: String generado concatenando text-input con propertyKey. isInputValidated: Boolean iniciando en true, cambia a false si validación falla. validationMessages: Array vacío de strings que almacena mensajes de error.

### Lifecycle Hooks

```typescript
mounted() {
    Application.eventBus.on('validate-inputs', this.handleValidation);
},
beforeUnmount() {
    Application.eventBus.off('validate-inputs', this.handleValidation);
}
```

mounted: Registra listener handleValidation para evento validate-inputs del eventBus. beforeUnmount: Remueve listener para prevenir memory leaks.

### Método isValidated

```typescript
async isValidated(): Promise<boolean> {
    var validated = true;
    this.validationMessages = [];
    
    if (this.metadata.required.value && (!this.modelValue || this.modelValue.trim() === '')) {
        validated = false;
        this.validationMessages.push(this.metadata.requiredMessage.value || `${this.metadata.propertyName} is required.`);
    }
    if (!this.metadata.validated.value) {
        validated = false;
        this.validationMessages.push(this.metadata.validatedMessage.value || `${this.metadata.propertyName} is not valid.`);
    }
    
    const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
    if (!isAsyncValid) {
        validated = false;
        const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
        if (asyncMessage) {
            this.validationMessages.push(asyncMessage);
        }
    }
    
    return validated;
}
```

Retorna Promise<boolean> indicando si todas las validaciones pasaron. Inicializa validated en true y limpia validationMessages. Nivel 1: Si metadata.required.value es true y modelValue está vacío o contiene solo espacios (trim === ''), marca validated false y agrega mensaje. Nivel 2: Si metadata.validated.value es false, marca validated false y agrega mensaje. Nivel 3: Ejecuta await entity.isAsyncValidation(propertyKey), si retorna false marca validated false y obtiene mensaje de entity.asyncValidationMessage(propertyKey).

### Método handleValidation

```typescript
async handleValidation() {
    this.isInputValidated = await this.isValidated();
    if (!this.isInputValidated) {
        Application.View.value.isValid = false;
    }
}
```

Ejecuta isValidated y asigna resultado a isInputValidated. Si isInputValidated es false, actualiza Application.View.value.isValid a false para bloquear guardado global.

### Estados CSS

Clase disabled: Aplicada cuando metadata.disabled.value es true. Clase nonvalidated: Aplicada cuando isInputValidated es false después de ejecutar validaciones.

## 5. Flujo de Funcionamiento

### Inicialización del Componente

```
1. Componente monta en default_detailview.vue
        ↓
2. setup() ejecuta useInputMetadata(entityClass, entity, propertyKey)
        ↓
3. useInputMetadata lee decoradores del prototype y retorna metadata refs
        ↓
4. data() inicializa isInputValidated=true, validationMessages=[]
        ↓
5. Template renderiza con label, input, help-text condicional
        ↓
6. mounted() registra Application.eventBus.on('validate-inputs', handleValidation)
```

### Flujo de Input del Usuario

```
1. Usuario escribe en input HTML
        ↓
2. Evento @input dispara
        ↓
3. $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        ↓
4. v-model actualiza entity[propertyKey] en componente padre
        ↓
5. Vue reactivity propaga cambio
        ↓
6. entity.getDirtyState() detecta cambio (originalState !== estado actual)
```

### Flujo de Validación Global

```
1. Usuario click en botón Save o Validate
        ↓
2. Botón ejecuta Application.eventBus.emit('validate-inputs')
        ↓
3. TextInputComponent handleValidation() ejecuta automáticamente
        ↓
4. handleValidation llama await isValidated()
        ↓
5. isValidated ejecuta 3 niveles de validación secuencialmente
        ↓
6. isInputValidated actualizado con resultado
        ↓
7. Si false: Application.View.value.isValid = false
        ↓
8. Clase .nonvalidated agregada al div raíz
        ↓
9. validationMessages renderizados en template
```

### Flujo de Validación por Niveles

```
NIVEL 1: Required
    if (metadata.required.value && (!modelValue || modelValue.trim() === ''))
        ↓ false
    validated = false
    validationMessages.push(metadata.requiredMessage.value)

NIVEL 2: Validación Síncrona
    if (!metadata.validated.value)
        ↓ false
    validated = false
    validationMessages.push(metadata.validatedMessage.value)

NIVEL 3: Validación Asíncrona
    const isAsyncValid = await entity.isAsyncValidation(propertyKey)
    if (!isAsyncValid)
        ↓ false
    validated = false
    asyncMessage = entity.asyncValidationMessage(propertyKey)
    validationMessages.push(asyncMessage)
```

Validaciones se ejecutan siempre en orden: Required → Sync → Async. Si alguna falla, validated se marca false pero continúa ejecutando siguientes validaciones para mostrar todos los errores simultáneamente.

### Flujo de Desmontaje

```
1. Componente se desmonta (cambio de vista)
        ↓
2. beforeUnmount() ejecuta
        ↓
3. Application.eventBus.off('validate-inputs', handleValidation)
        ↓
4. Listener removido, previene memory leak
```

## 6. Reglas Obligatorias

Props entityClass, entity, propertyKey y modelValue son OBLIGATORIOS, componente no funciona sin ellos. modelValue DEBE ser String, otros tipos causan error de tipo TypeScript. propertyKey DEBE corresponder a propiedad existente en entity con decorador @PropertyName, caso contrario useInputMetadata no retorna metadatos. @input DEBE emitir update:modelValue con valor string para v-model binding funcione correctamente. mounted DEBE registrar eventBus listener validate-inputs para validación global funcione. beforeUnmount DEBE remover eventBus listener para prevenir memory leaks y errores de componente desmontado. isValidated DEBE ejecutar los tres niveles de validación en orden Required, Sync, Async sin saltos. handleValidation DEBE actualizar Application.View.value.isValid a false si validación falla para bloquear save global. trim DEBE usarse en validación required para rechazar strings con solo espacios. validationMessages DEBE limpiarse al inicio de isValidated para no acumular mensajes de validaciones anteriores.

## 7. Prohibiciones

NO usar este componente para propiedades con @StringTypeDef, usar componente especializado correspondiente (EmailInputComponent para EMAIL, PasswordInputComponent para PASSWORD, TextAreaComponent para TEXTAREA). NO modificar metadata retornado por useInputMetadata, es read-only reactive ref. NO ejecutar $emit('update:modelValue') sin pasar valor string válido, causa error de tipo. NO registrar múltiples listeners validate-inputs, causa validaciones duplicadas. NO olvidar remover listener en beforeUnmount, causa memory leaks. NO asignar directamente isInputValidated sin ejecutar isValidated, rompe sincronía con estado real de validación. NO ejecutar validación síncrona después de asíncrona, orden estricto Required → Sync → Async. NO usar trim en tipos no-string, solo aplicar en validación required de strings. NO modificar Application.View.value.isValid directamente desde otros métodos que no sean handleValidation. NO agregar lógica de negocio en este componente, validaciones complejas van en decoradores de entidad.

## 8. Dependencias

### Dependencias Directas

**useInputMetadata composable** (src/composables/useInputMetadata.ts): Extrae metadatos de decoradores, retorna refs reactivas propertyName, required, disabled, validated, helpText, requiredMessage, validatedMessage.

**Application singleton** (src/models/application.ts): Proporciona eventBus para comunicación global validate-inputs, View.value.isValid para estado de validación global.

**BaseEntity** (src/entities/base_entitiy.ts): Tipo de entity prop, proporciona métodos isAsyncValidation(propertyKey) y asyncValidationMessage(propertyKey).

### Dependencias de Decoradores

Decorador @PropertyName requerido para metadata.propertyName. Decorador @Required opcional para metadata.required y requiredMessage. Decorador @Validation opcional para metadata.validated y validatedMessage. Decorador @AsyncValidation opcional para entity.isAsyncValidation. Decorador @Disabled opcional para metadata.disabled. Decorador @HelpText opcional para metadata.helpText.

### Dependencias de Sistema

Vue 3 Composition API para setup, refs, reactive. Vue 3 template syntax para v-if, v-for, :class, @input. TypeScript para tipado de props y métodos. CSS custom properties var(--red) para estilos.

## 9. Relaciones

### Componentes Relacionados

**EmailInputComponent**: Componente especializado para StringType.EMAIL con type="email" HTML. **PasswordInputComponent**: Componente especializado para StringType.PASSWORD con type="password". **TextAreaComponent**: Componente especializado para StringType.TEXTAREA con textarea HTML element. **NumberInputComponent**: Componente hermano para propiedades type Number. **DateInputComponent**: Componente hermano para propiedades type Date. **BooleanInputComponent**: Componente hermano para propiedades type Boolean.

### Componentes Consumidores

**default_detailview.vue**: Vista que renderiza TextInputComponent dinámicamente según metadata de entidad. **FormGroupComponent**: Contenedor que agrupa múltiples inputs incluyendo TextInputComponent.

### Integración con BaseEntity

entity.isAsyncValidation(propertyKey): Método que ejecuta validación asíncrona definida en decorador @AsyncValidation. entity.asyncValidationMessage(propertyKey): Método que retorna mensaje de error de validación asíncrona. entity[propertyKey]: Propiedad actualizada mediante v-model binding desde input. entity.getDirtyState(): Detecta cambios comparando estado actual vs originalState.

### Integración con Application

Application.eventBus.on('validate-inputs', handler): Registra listener para validación global. Application.eventBus.off('validate-inputs', handler): Remueve listener. Application.eventBus.emit('validate-inputs'): Emitido por SaveButtonComponent y ValidateButtonComponent. Application.View.value.isValid: Flag booleano que bloquea save si false.

## 10. Notas de Implementación

### Ejemplo Completo de Uso

Definición en entidad:
```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required(true, 'Product name is required')
    @HelpText('Enter the display name for this product')
    @Validation(
        (entity) => entity.name.length >= 3 && entity.name.length <= 100,
        'Name must be between 3 and 100 characters'
    )
    name!: string;
}
```

Uso en default_detailview.vue (generado automáticamente):
```vue
<TextInputComponent
    :entity-class="Product"
    :entity="product"
    property-key="name"
    v-model="product.name"
/>
```

Resultado HTML renderizado:
```html
<div class="TextInput">
    <label for="id-Product Name" class="label-input">Product Name</label>
    <input 
        id="id-Product Name"
        name="Product Name"
        type="text"
        class="main-input"
        placeholder=" "
        value="Widget"
    />
    <div class="help-text">
        <span>Enter the display name for this product</span>
    </div>
    <div class="validation-messages"></div>
</div>
```

### Casos de Uso Típicos

Caso 1 - Nombre de usuario:
```typescript
@PropertyName('Username', String)
@Required(true)
@Validation((e) => /^[a-zA-Z0-9_]+$/.test(e.username), 'Only letters, numbers and underscore')
username!: string;
```

Caso 2 - Código de producto con validación asíncrona unicidad:
```typescript
@PropertyName('SKU', String)
@Required(true)
@Validation((e) => /^[A-Z]{3}-\d{4}$/.test(e.sku), 'Format: ABC-1234')
@AsyncValidation(async (e) => await checkSKUUnique(e.sku), 'SKU already exists')
sku!: string;
```

Caso 3 - Descripción corta con límite de caracteres:
```typescript
@PropertyName('Short Description', String)
@HelpText('Max 255 characters')
@Validation((e) => e.shortDesc.length <= 255, 'Too long')
shortDesc!: string;
```

### Notas Técnicas Importantes

Validación required usa trim para rechazar strings con solo espacios, evitando "   " como valor válido. Event listener cleanup en beforeUnmount es crítico para prevenir memory leaks cuando componente se desmonta. Validación asíncrona siempre ejecuta después de required y sync validation, no se omite si anteriores fallan. isInputValidated controla clase CSS nonvalidated que aplica estilos de error visuales. metadata.helpText solo renderiza div help-text si valor existe, evitando divs vacíos. Emisión update:modelValue con ($event.target as HTMLInputElement).value requiere type assertion para TypeScript. textInputId generado con prefijo text-input evita colisiones de id con otros componentes. modelValue default '' previene undefined como valor inicial del input.

### Eventos Emitidos

update:modelValue: Emitido en @input del input HTML, parámetro es nuevo valor string, usado por v-model binding del padre para actualizar entity[propertyKey].

### Personalización y Alternativas

Para emails usar EmailInputComponent con type="email" HTML y validación formato email automática. Para contraseñas usar PasswordInputComponent con type="password" y texto oculto. Para texto multilinea usar TextAreaComponent con textarea element y rows configurables. TextInputComponent solo para texto plano sin formato especial, default para String sin @StringTypeDef.

## 11. Referencias Cruzadas

Documentos relacionados: form-inputs.md (overview de todos los componentes de formulario), useInputMetadata-composable.md (composable que extrae metadata), ../../02-base-entity/validation-system.md (sistema completo de validación de BaseEntity), ../../01-decorators/required-decorator.md (decorador @Required), ../../01-decorators/validation-decorator.md (decorador @Validation), ../../01-decorators/async-validation-decorator.md (decorador @AsyncValidation), ../../01-decorators/help-text-decorator.md (decorador @HelpText), ../../01-decorators/disabled-decorator.md (decorador @Disabled), ../../01-decorators/property-name-decorator.md (decorador @PropertyName obligatorio), ../../03-application/event-bus.md (sistema de eventos global).

Archivos de código fuente: src/components/Form/TextInputComponent.vue (implementación del componente), src/composables/useInputMetadata.ts (composable de extracción de metadata), src/models/application.ts (Application singleton con eventBus y View), src/entities/base_entitiy.ts (métodos isAsyncValidation y asyncValidationMessage).

Componentes relacionados: email-input-component.md (input especializado para emails), password-input-component.md (input especializado para passwords), textarea-input-component.md (input especializado para texto multilinea), number-input-component.md (input para números), date-input-component.md (input para fechas), boolean-input-component.md (input para booleanos).

Versión: 1.0.0
Última actualización: 12 de Febrero, 2026
