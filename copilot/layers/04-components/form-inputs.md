# Form Inputs Overview - Sistema de Inputs del Framework

## 1. Propósito

El sistema de inputs proporciona componentes Vue reactivos que se generan automáticamente basándose en los metadatos de las entidades. Estos componentes representan la interfaz entre el usuario y los datos del modelo, eliminando la necesidad de escribir formularios HTML manualmente.

El framework selecciona automáticamente el tipo de input apropiado según el tipo de dato TypeScript y los decoradores aplicados a cada propiedad de la entidad. Los decoradores de metadatos controlan el comportamiento, validación, presentación y características específicas de cada input sin requerir configuración adicional en las vistas.

## 2. Alcance

Este documento describe:
- Los 10 componentes de input disponibles (TextInputComponent, NumberInputComponent, BooleanInputComponent, DateInputComponent, EmailInputComponent, PasswordInputComponent, TextAreaComponent, ObjectInputComponent, ArrayInputComponent, ListInputComponent)
- La anatomía común compartida por todos los inputs (props, setup, lifecycle hooks, validación)
- El composable useInputMetadata para extracción de metadatos
- El sistema de validación de 3 niveles (Required, Validación Síncrona, Validación Asíncrona)
- El flujo de datos v-model y actualización reactiva
- La selección automática de inputs en DefaultDetailView
- Los estados visuales CSS (normal, disabled, inválido)
- La integración con decoradores de metadatos

El sistema opera exclusivamente en el contexto de formularios de detalle CRUD. Los inputs se renderizan dinámicamente dentro de DefaultDetailView o vistas personalizadas que manejan instancias de BaseEntity.

## 3. Definiciones Clave

**Input Component**: Componente Vue que renderiza un control de formulario HTML específico (input, select, textarea) con lógica de validación y metadatos integrados.

**useInputMetadata Composable**: Función composable que extrae metadatos reactivos de una propiedad de entidad (propertyName, required, validated, disabled, readonly, helpText) accediendo a los decoradores aplicados.

**modelValue Prop**: Prop del sistema v-model que contiene el valor actual de la propiedad. Se actualiza mediante el evento update:modelValue emitido por el input.

**Sistema de Validación de 3 Niveles**: Proceso de validación progresivo que verifica Required (presencia de valor), Validación Síncrona (reglas locales), y Validación Asíncrona (verificaciones servidor) en orden secuencial.

**validate-inputs Event**: Evento global del Application.eventBus emitido por BaseEntity.validateInputs() que dispara validación simultánea en todos los inputs montados.

**StringType Enum**: Enumeración que define subtipos de String (TEXT, EMAIL, PASSWORD, TEXTAREA) utilizada para seleccionar el componente de input específico para propiedades String.

**Metadata Decorators**: Decoradores TypeScript (@Required, @Validation, @Disabled, @ReadOnly, @HelpText) que definen el comportamiento y características de cada input sin código imperativo.

**isInputValidated State**: Variable reactiva booleana en cada input que indica si la validación actual es exitosa (true) o fallida (false), controlando clases CSS y mensajes.

## 4. Descripción Técnica

### Componentes de Input Disponibles

El framework proporciona 10 componentes de input especializados:

**Inputs Básicos:**
- TextInputComponent: Input de texto plano para String con StringType.TEXT (archivo TextInputComponent.vue)
- NumberInputComponent: Input numérico con botones incrementales +/- (archivo NumberInputComponent.vue)
- BooleanInputComponent: Checkbox para valores booleanos (archivo BooleanInputComponent.vue)
- DateInputComponent: Selector de fecha con calendario para Date (archivo DateInputComponent.vue)

**Inputs Especializados de String:**
- EmailInputComponent: Input de email con validación de formato (archivo EmailInputComponent.vue, StringType.EMAIL)
- PasswordInputComponent: Input de contraseña con ocultamiento visual (archivo PasswordInputComponent.vue, StringType.PASSWORD)
- TextAreaComponent: Área de texto multilinea expansible (archivo TextAreaComponent.vue, StringType.TEXTAREA)

**Inputs Complejos:**
- ObjectInputComponent: Selector de entidad relacionada con modal lookup (archivo ObjectInputComponent.vue, tipo BaseEntity)
- ArrayInputComponent: Lista editable de múltiples valores (archivo ArrayInputComponent.vue, tipo Array)
- ListInputComponent: Selector desplegable de opciones predefinidas (archivo ListInputComponent.vue)

### Anatomía Común de un Input

Todos los inputs comparten la siguiente estructura estandarizada:

**Props Requeridas:**
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
        type: [String, Number, Boolean, Date, Object, Array],
        required: true,
    },
}
```

La prop entityClass proporciona acceso a metadatos estáticos de clase. La prop entity es la instancia que contiene los datos actuales. La prop propertyKey identifica la propiedad específica. La prop modelValue contiene el valor v-model actual.

**Setup con useInputMetadata:**
```typescript
import { useInputMetadata } from '@/composables/useInputMetadata';

setup(props) {
    const metadata = useInputMetadata(
        props.entityClass, 
        props.entity, 
        props.propertyKey
    );
    return { metadata };
}
```

El composable retorna refs reactivos:
- metadata.propertyName: Nombre display desde @PropertyName
- metadata.required: Boolean desde @Required
- metadata.requiredMessage: Mensaje personalizado de required
- metadata.validated: Boolean desde @Validation
- metadata.validatedMessage: Mensaje personalizado de validación
- metadata.disabled: Boolean desde @Disabled
- metadata.readonly: Boolean desde @ReadOnly
- metadata.helpText: String desde @HelpText

**Lifecycle Hooks de Validación:**
```typescript
mounted() {
    Application.eventBus.on('validate-inputs', this.handleValidation);
},
beforeUnmount() {
    Application.eventBus.off('validate-inputs', this.handleValidation);
}
```

Al montarse, el input registra listener para el evento validate-inputs. Cuando BaseEntity.validateInputs() se invoca (típicamente antes de guardar), el evento se emite globalmente. Todos los inputs montados ejecutan handleValidation simultáneamente. Si algún input falla validación, se marca Application.View.value.isValid = false bloqueando el guardado.

### Método de Validación Estándar

```typescript
methods: {
    async isValidated(): Promise<boolean> {
        var validated = true;
        this.validationMessages = [];
        
        // NIVEL 1: Validación Required
        if (this.metadata.required.value && !this.modelValue) {
            validated = false;
            this.validationMessages.push(
                this.metadata.requiredMessage.value || 
                `${this.metadata.propertyName} is required.`
            );
        }
        
        // NIVEL 2: Validación Síncrona
        if (!this.metadata.validated.value) {
            validated = false;
            this.validationMessages.push(
                this.metadata.validatedMessage.value || 
                `${this.metadata.propertyName} is not valid.`
            );
        }
        
        // NIVEL 3: Validación Asíncrona
        const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
        if (!isAsyncValid) {
            validated = false;
            const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
            if (asyncMessage) {
                this.validationMessages.push(asyncMessage);
            }
        }
        
        return validated;
    },

    async handleValidation() {
        this.isInputValidated = await this.isValidated();
        if (!this.isInputValidated) {
            Application.View.value.isValid = false;
        }
    }
}
```

La validación es progresiva: Required se verifica primero (presencia de valor), luego Validación Síncrona (reglas locales como rangos o formato), finalmente Validación Asíncrona (consultas servidor como unicidad). Si cualquier nivel falla, el input acumula mensaje de error. El método handleValidation actualiza isInputValidated afectando clases CSS y marca Application.View.value.isValid globalmente.

**Template Común:**
```vue
<template>
<div class="TextInput" :class="{
    disabled: metadata.disabled.value, 
    nonvalidated: !isInputValidated
}">
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>

    <input 
        :id="'id-' + metadata.propertyName" 
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', $event.target.value)" 
    />
    
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">
            {{ message }}
        </span>
    </div>
</div>
</template>
```

El label utiliza metadata.propertyName reactivo. El input recibe :value del modelValue (no v-model interno). El evento @input emite update:modelValue con nuevo valor. v-model del componente padre actualiza entity[propertyKey] automáticamente. Las clases CSS dinámicas disabled y nonvalidated controlan estilos visuales. El help-text muestra guía cuando existe. Los validation-messages renderizan errores acumulados.

### Flujo de Datos v-model

```
Usuario escribe en input
    ↓
@input detecta cambio (evento DOM)
    ↓
$emit('update:modelValue', $event.target.value) - Emitir nuevo valor
    ↓
v-model en componente padre recibe evento
    ↓
entity[propertyKey] = newValue - Actualización directa
    ↓
Vue reactivity detecta cambio en entity
    ↓
Computed properties se actualizan
    ↓
entity.getDirtyState() detecta modificación (propiedad ensuciada)
    ↓
Componente se re-renderiza con nuevo valor modelValue
```

Ejemplo de uso:
```vue
<!-- En DefaultDetailView -->
<TextInputComponent
    :entity-class="entityClass"
    :entity="entity"
    property-key="name"
    v-model="entity.name"
/>

<!-- Internamente en TextInputComponent -->
<input 
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)" 
/>
```

El v-model es bidireccional: cambios en entity actualizan input, cambios en input actualizan entity.

### Selección Automática de Input

En DefaultDetailView, el framework selecciona automáticamente el componente apropiado mediante lógica condicional que inspecciona el tipo TypeScript y decoradores:

```vue
<template v-for="key in entity.getKeys()">
    <!-- Number -->
    <NumberInputComponent 
        v-if="entityClass.getPropertyType(key) === Number"
        :entity-class="entityClass"
        :entity="entity"
        :property-key="key"
        v-model="entity[key]"
    />
    
    <!-- Boolean -->
    <BooleanInputComponent 
        v-else-if="entityClass.getPropertyType(key) === Boolean"
        :entity-class="entityClass"
        :entity="entity"
        :property-key="key"
        v-model="entity[key]"
    />
    
    <!-- Date -->
    <DateInputComponent 
        v-else-if="entityClass.getPropertyType(key) === Date"
        :entity-class="entityClass"
        :entity="entity"
        :property-key="key"
        v-model="entity[key]"
    />
    
    <!-- String con subtipo -->
    <template v-else-if="entityClass.getPropertyType(key) === String">
        <EmailInputComponent 
            v-if="entity.getStringType()[key] === StringType.EMAIL"
            ...
        />
        <PasswordInputComponent 
            v-else-if="entity.getStringType()[key] === StringType.PASSWORD"
            ...
        />
        <TextAreaComponent 
            v-else-if="entity.getStringType()[key] === StringType.TEXTAREA"
            ...
        />
        <TextInputComponent 
            v-else
            ...
        />
    </template>
    
    <!-- Object (BaseEntity) -->
    <ObjectInputComponent 
        v-else-if="entityClass.getPropertyType(key).prototype instanceof BaseEntity"
        ...
    />
    
    <!-- Array -->
    <ArrayInputComponent 
        v-else-if="entityClass.getPropertyType(key) === Array"
        ...
    />
</template>
```

El tipo base se determina con getPropertyType() desde metadatos Reflect. Para String, se consulta getStringType() que retorna el StringType del decorador @StringTypeDef. Para Object, se verifica herencia de BaseEntity con instanceof. Esta lógica elimina la necesidad de declarar inputs manualmente.

### Sistema de Validación de 3 Niveles

**Nivel 1: Validación Required**
```typescript
if (this.metadata.required.value && !this.modelValue) {
    validated = false;
    this.validationMessages.push(this.metadata.requiredMessage.value);
}
```

Activado por decorador:
```typescript
@Required(true, 'Name is required')
name!: string;
```

Verifica presencia de valor. Campos required no pueden quedar vacíos. El mensaje personalizado se muestra si existe, caso contrario mensaje genérico.

**Nivel 2: Validación Síncrona**
```typescript
if (!this.metadata.validated.value) {
    validated = false;
    this.validationMessages.push(this.metadata.validatedMessage.value);
}
```

Activado por decorador:
```typescript
@Validation((entity) => entity.price > 0, 'Price must be positive')
price!: number;
```

Ejecuta función lambda sincrónica que recibe la entidad completa. Reglas como rangos numéricos, longitud de string, formato de fecha. Se evalúa localmente sin peticiones red.

**Nivel 3: Validación Asíncrona**
```typescript
const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
if (!isAsyncValid) {
    validated = false;
    const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
    this.validationMessages.push(asyncMessage);
}
```

Activado por decorador:
```typescript
@AsyncValidation(
    async (entity) => {
        return await checkEmailUnique(entity.email);
    },
    'Email already exists'
)
email!: string;
```

Ejecuta función asíncrona que puede realizar fetch al servidor. Casos como unicidad de email, disponibilidad de username, validación de códigos externos. Se ejecuta solo si niveles anteriores pasan para optimizar tráfico.

### Estados Visuales CSS

**Estado Normal:**
```css
.TextInput {
    /* Apariencia estándar */
}
```

**Estado Disabled:**
```css
.TextInput.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
```

Activado por decorador:
```typescript
@Disabled(true)
// o
@Disabled((entity) => entity.isLocked)
```

El input se renderiza pero no acepta entrada. Útil para campos calculados o cuando estado de entidad lo requiere.

**Estado Inválido:**
```css
.TextInput.nonvalidated {
    border-color: red;
}
```

Activado cuando isInputValidated = false después de ejecutar handleValidation(). Retroalimentación visual de errores de validación.

## 5. Flujo de Funcionamiento

1. **Inicialización del Input**: Al renderizarse DefaultDetailView, se itera sobre entity.getKeys() obteniendo todas las propiedades decoradas. Para cada propertyKey, se selecciona automáticamente el componente de input apropiado (NumberInputComponent, TextInputComponent, etc.) basándose en entityClass.getPropertyType(key) y decoradores StringType si aplica. El input se monta con props entityClass, entity, propertyKey y v-model="entity[propertyKey]".

2. **Extracción de Metadatos**: En el hook setup() del input, se invoca useInputMetadata(entityClass, entity, propertyKey) que retorna refs reactivos. El composable accede a metadatos almacenados por decoradores: entityClass.getPropertyNameByKey() para nombre display, entity.isRequired() para bandera required, entity.isDisabled() para bandera disabled, entity.getHelpText() para texto ayuda, etc. Estos refs se conectan al template mediante metadata.propertyName, metadata.required.value, etc.

3. **Registro de Listener de Validación**: En el hook mounted(), el input ejecuta Application.eventBus.on('validate-inputs', this.handleValidation) registrándose como listener del evento global de validación. Cada input montado escucha independientemente el mismo evento. En beforeUnmount(), se limpia el listener con eventBus.off() previniendo memory leaks.

4. **Entrada de Usuario**: El usuario escribe, selecciona o modifica el valor en el elemento HTML (input, select, checkbox). El evento DOM @input se dispara con $event.target.value conteniendo el nuevo valor. El input emite evento Vue $emit('update:modelValue', $event.target.value) propagando el valor al padre.

5. **Actualización v-model**: El componente padre (DefaultDetailView) con v-model="entity[propertyKey]" recibe el evento update:modelValue. Vue automáticamente ejecuta entity[propertyKey] = newValue actualizando la instancia directamente. La reactividad de Vue detecta el cambio y actualiza computed properties dependientes. El método entity.getDirtyState() registra propertyKey como propiedad modificada marcando la entidad como dirty.

6. **Disparo de Validación Global**: El usuario hace click en SaveButton. SaveButton invoca entity.validateInputs() que determina si la entidad es persistente o transitoria. Si es persistente persistente, emite Application.eventBus.emit('validate-inputs') disparando validación global. Si no es persistente, valida propiedades localmente sin inputs.

7. **Ejecución de Validación en Input**: Todos los inputs montados reciben el evento validate-inputs simultáneamente. Cada input ejecuta handleValidation() que a su vez invoca await this.isValidated(). El método isValidated() ejecuta los 3 niveles secuencialmente: Required (verificar presencia valor), Validación Síncrona (evaluar función lambda local), Validación Asíncrona (ejecutar fetch remoto). Cada nivel que falla agrega mensaje a validationMessages array y marca validated = false.

8. **Actualización de Estado Visual**: Al completarse isValidated(), se actualiza this.isInputValidated con resultado booleano. Si isInputValidated = false, se ejecuta Application.View.value.isValid = false marcando la vista como inválida globalmente. La clase CSS :class="{ nonvalidated: !isInputValidated }" añade o remueve clase nonvalidated automáticamente. El input aplica border-color: red y renderiza validationMessages en template mostrando errores específicos.

9. **Prevención o Continuación de Guardado**: SaveButton después de emitir validate-inputs consulta Application.View.value.isValid. Si isValid = false, SaveButton aborta el guardado y muestra toast de error sin ejecutar entity.save(). Si isValid = true (todos los inputs válidos), SaveButton ejecuta entity.save() persistiendo datos al backend. La entidad envía petición HTTP al endpoint decorado con @ApiEndpoint.

10. **Limpieza al Desmontar**: Si el usuario navega a otra vista o cierra el formulario, el input ejecuta beforeUnmount(). El hook llama Application.eventBus.off('validate-inputs', this.handleValidation) removiendo el listener. Esto previene que inputs desmontados respondan a eventos futuros y libera memoria. Vue completa el desmontaje del componente y libera recursos reactivos.

## 6. Reglas Obligatorias

1. **Todos los inputs DEBEN usar v-model**: El binding v-model es obligatorio para sincronización bidireccional. Nunca usar :value y @input separados en componente padre sin v-model. El input interno DEBE usar :value="modelValue" y @emit('update:modelValue', newValue) para mantener contrato v-model.

2. **Todos los inputs DEBEN invocar useInputMetadata en setup()**: El composable useInputMetadata es la única fuente de metadatos. No acceder directamente a entity.metadata ni entityClass sin composable. Los refs retornados (metadata.propertyName, metadata.required, etc.) DEBEN usarse en lugar de valores hardcodeados.

3. **Todos los inputs DEBEN registrar listener validate-inputs en mounted()**: El listener Application.eventBus.on('validate-inputs', this.handleValidation) DEBE registrarse en mounted(). El listener DEBE limpiarse en beforeUnmount() con eventBus.off(). Fallar en registrar el listener resulta en validación no ejecutada antes de guardar.

4. **Todos los inputs DEBEN implementar isValidated() con 3 niveles**: El método isValidated() DEBE ejecutar Required, Validación Síncrona, y Validación Asíncrona en orden. El método DEBE retornar Promise<boolean>. El método DEBE acumular mensajes en validationMessages array. El método DEBE marcar Application.View.value.isValid = false si falla.

5. **Todos los inputs DEBEN emitir update:modelValue en cada cambio**: El evento @input del elemento HTML DEBE disparar $emit('update:modelValue', newValue) inmediatamente. No debouncing ni throttling salvo casos excepcionales documentados. El valor emitido DEBE ser el valor exacto del input sin transformaciones no declaradas.

6. **Props entityClass, entity, propertyKey, modelValue son obligatorias**: Todos los inputs DEBEN definir estas 4 props como required: true. Ninguna prop puede omitirse. El tipo de entityClass DEBE ser Function as unknown as () => typeof BaseEntity. El tipo de entity DEBE ser Object as () => BaseEntity.

7. **Todos los inputs DEBEN renderizar validation-messages cuando isInputValidated = false**: El template DEBE incluir div validation-messages que itera validationMessages array. Los mensajes DEBEN ser visibles cuando isInputValidated = false. Los mensajes DEBEN ocultarse cuando isInputValidated = true para evitar clutter.

## 7. Prohibiciones

1. **NUNCA modificar entity directamente en métodos del input**: Los inputs solo DEBEN leer de entity para metadatos. La única escritura permitida es vía v-model automático. No ejecutar entity[propertyKey] = value manualmente dentro del input. No invocar entity.save() ni entity.delete() desde inputs.

2. **NUNCA hardcodear nombres de propiedades o labels**: No usar strings literales como "Name", "Email" en labels. SIEMPRE usar metadata.propertyName que lee desde @PropertyName decorator. No asumir nombres de propiedades, siempre usar propertyKey prop dinámico.

3. **NUNCA implementar validación personalizada omitiendo los 3 niveles**: No crear métodos de validación alternativos que bypass Required, Validación Síncrona o Validación Asíncrona. No omitir niveles "porque no se necesitan". Todos los niveles DEBEN ejecutarse en isValidated().

4. **NUNCA usar v-model interno en elemento HTML del input**: El elemento HTML (input, select) DEBE usar :value="modelValue" binding unidireccional y @input emit. No usar v-model="modelValue" dentro del template del input. v-model SOLO se usa en el componente padre.

5. **NUNCA ignorar metadata.disabled o metadata.readonly**: Si metadata.disabled.value = true, el input DEBE añadir :disabled="metadata.disabled.value" al elemento HTML. Si metadata.readonly.value = true, el input DEBE prevenir edición. No permitir entrada cuando disabled/readonly está activo.

6. **NUNCA registrar múltiples listeners del mismo evento**: Un input DEBE registrar exactamente UN listener validate-inputs en mounted(). No registrar listeners duplicados en otros lifecycle hooks. No registrar listeners condicionales que puedan quedar sin limpiar.

7. **NUNCA asumir que modelValue tiene valor**: El modelValue puede ser undefined, null, o empty string inicialmente. El input DEBE manejar casos donde modelValue es falsy. La validación Required DEBE ejecutarse incluso si modelValue está vacío. No crashear con TypeError al acceder propiedades de modelValue null.

## 8. Dependencias

**Dependencias Directas:**
- @/entities/base_entity.ts: BaseEntity clase base proporciona métodos isRequired(), isValidation(), isAsyncValidation(), isDisabled(), isReadOnly(), getHelpText(), validateInputs() que los inputs invocan vía entity prop
- @/composables/useInputMetadata.ts: Composable que extrae metadatos reactivos de entityClass y entity retornando refs propertyName, required, validated, disabled, readonly, helpText
- @/constants/application.ts: Application singleton exporta eventBus para eventos validate-inputs, View.value.isValid para estado global
- @/enums/string_type.ts: StringType enum (TEXT, EMAIL, PASSWORD, TEXTAREA) usado para seleccionar input especializado de String
- Vue 3 Reactivity API: ref, computed, watch para reactividad de metadatos y valores

**Dependencias de Decoradores:**
- @/decorations/required_decorator.ts: @Required marca propiedades requeridas, metadata.required leído por inputs
- @/decorations/validation_decorator.ts: @Validation define reglas síncronas, metadata.validated controla nivel 2
- @/decorations/async_validation_decorator.ts: @AsyncValidation define reglas asíncronas, entity.isAsyncValidation ejecuta nivel 3
- @/decorations/disabled_decorator.ts: @Disabled marca campos disabled, metadata.disabled controla habilitación
- @/decorations/readonly_decorator.ts: @ReadOnly marca campos readonly, metadata.readonly previene edición
- @/decorations/property_name_decorator.ts: @PropertyName define label, metadata.propertyName renderiza display
- @/decorations/help_text_decorator.ts: @HelpText define ayuda, metadata.helpText renderiza guía
- @/decorations/string_type_decorator.ts: @StringTypeDef define subtipo String, entity.getStringType() retorna mapa

**Dependencias de Vistas:**
- @/views/default_detailview.vue: DefaultDetailView renderiza inputs dinámicamente, contiene lógica selección automática componente
- @/components/Form/FormGroupComponent.vue: FormGroupComponent agrupa inputs bajo títulos secciones
- @/components/Form/FormRowTwoItemsComponent.vue: FormRowTwoItemsComponent layout de 2 columnas
- @/components/Form/FormRowThreeItemsComponent.vue: FormRowThreeItemsComponent layout de 3 columnas

**Dependencias de Botones:**
- @/components/Buttons/SaveButton.vue: SaveButton dispara validateInputs() antes de guardar, consulta Application.View.value.isValid
- @/components/Buttons/ValidateButton.vue: ValidateButton dispara validación manual sin guardar

## 9. Relaciones

**Sincroniza con:**
- BaseEntity: Los inputs leen metadatos de entity y entityClass continuamente vía composable reactivo. entity.validateInputs() dispara validación global de inputs. entity.getDirtyState() rastrea propiedades modificadas por inputs.

**Utilizado por:**
- DefaultDetailView: Renderiza inputs automáticamente iterando entity.getKeys() y seleccionando componente apropiado según tipo. Pasa props entityClass, entity, propertyKey, v-model a cada input.
- CustomModuleDetailView: Vistas personalizadas pueden usar inputs manualmente especificando explícitamente cada componente y propertyKey.

**Interactúa con:**
- Application.eventBus: Los inputs escuchan evento validate-inputs para disparar validación. Evento emitido por entity.validateInputs() invocado desde SaveButton.
- Application.View: Los inputs escriben Application.View.value.isValid = false cuando validación falla. SaveButton lee isValid para decidir si proceder con guardado.

**Consume metadatos de:**
- Todos los decoradores de metadatos (@Required, @Validation, @AsyncValidation, @Disabled, @ReadOnly, @PropertyName, @HelpText, @StringTypeDef) almacenan información en MetadataKeys. useInputMetadata accede vía Reflect.getMetadata() y métodos estáticos de BaseEntity.

**Complementa:**
- FormGroupComponent: Los inputs se renderizan dentro de FormGroupComponent para agrupar secciones. FormGroup no conoce estructura interna de inputs.
- FormRowTwoItemsComponent / FormRowThreeItemsComponent: Los inputs se colocan en rows para layout responsivo multi-columna. Rows solo aplican CSS grid.

**Sustituye:**
- Formularios HTML tradicionales: Elimina necesidad de escribir <form>, <label>, <input> manualmente con validación JavaScript. Los inputs se generan automáticamente desde metadatos de clase.

## 10. Notas de Implementación

### Crear un Nuevo Tipo de Input Personalizado

Si necesitas un input especializado no cubierto por los 10 componentes existentes:

```vue
<!-- CustomPhoneInputComponent.vue -->
<template>
<div class="CustomPhoneInput" :class="{
    disabled: metadata.disabled.value,
    nonvalidated: !isInputValidated
}">
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>

    <input 
        type="tel"
        :id="'id-' + metadata.propertyName" 
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="(123) 456-7890"
    />
    
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">
            {{ message }}
        </span>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useInputMetadata } from '@/composables/useInputMetadata';
import { Application } from '@/constants/application';
import type { BaseEntity } from '@/entities/base_entity';

export default defineComponent({
    name: 'CustomPhoneInputComponent',
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
        },
    },
    emits: ['update:modelValue'],
    setup(props) {
        const metadata = useInputMetadata(
            props.entityClass,
            props.entity,
            props.propertyKey
        );
        return { metadata };
    },
    data() {
        return {
            isInputValidated: true,
            validationMessages: [] as string[],
        };
    },
    mounted() {
        Application.eventBus.on('validate-inputs', this.handleValidation);
    },
    beforeUnmount() {
        Application.eventBus.off('validate-inputs', this.handleValidation);
    },
    methods: {
        async isValidated(): Promise<boolean> {
            var validated = true;
            this.validationMessages = [];
            
            // NIVEL 1: Required
            if (this.metadata.required.value && !this.modelValue) {
                validated = false;
                this.validationMessages.push(
                    this.metadata.requiredMessage.value || 
                    `${this.metadata.propertyName} is required.`
                );
            }
            
            // NIVEL 2: Validación Síncrona
            if (!this.metadata.validated.value) {
                validated = false;
                this.validationMessages.push(
                    this.metadata.validatedMessage.value || 
                    `${this.metadata.propertyName} is not valid.`
                );
            }
            
            // NIVEL 3: Validación Asíncrona
            const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
            if (!isAsyncValid) {
                validated = false;
                const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
                if (asyncMessage) {
                    this.validationMessages.push(asyncMessage);
                }
            }
            
            return validated;
        },

        async handleValidation() {
            this.isInputValidated = await this.isValidated();
            if (!this.isInputValidated) {
                Application.View.value.isValid = false;
            }
        }
    }
});
</script>

<style scoped>
.CustomPhoneInput {
    /* Tus estilos personalizados */
}
</style>
```

Luego integra en DefaultDetailView:
```vue
<CustomPhoneInputComponent
    v-else-if="entity.getStringType()[key] === StringType.PHONE"
    :entity-class="entityClass"
    :entity="entity"
    :property-key="key"
    v-model="entity[key]"
/>
```

Define enum personalizado:
```typescript
export enum StringType {
    TEXT = 'text',
    EMAIL = 'email',
    PASSWORD = 'password',
    TEXTAREA = 'textarea',
    PHONE = 'phone',  // Nuevo
}
```

### Validación Condicional Basada en Otros Campos

Usa @Validation con función lambda que accede a toda la entidad:

```typescript
@ModuleName('Orders')
export class Order extends BaseEntity {
    @PropertyName('Order Type', String)
    orderType!: 'standard' | 'express';
    
    @PropertyName('Express Fee', Number)
    @Validation(
        (entity) => {
            if (entity.orderType === 'express') {
                return entity.expressFee > 0;
            }
            return true;  // No validar si no es express
        },
        'Express orders require express fee'
    )
    expressFee!: number;
}
```

### Debugging Validación de Input

Para verificar por qué un input no valida correctamente:

```javascript
// En Vue DevTools, selecciona el input y ejecuta:
await this.isValidated()  // Retorna true/false

// Ver metadatos:
this.metadata.required.value
this.metadata.validated.value
this.metadata.requiredMessage.value
this.metadata.validatedMessage.value

// Ver estado validación asíncrona:
await this.entity.isAsyncValidation(this.propertyKey)
this.entity.asyncValidationMessage(this.propertyKey)

// Forzar validación manual:
this.handleValidation()

// Ver estado global:
Application.View.value.isValid
```

### Personalizar Mensajes de Validación Dinámicamente

Los decoradores aceptan funciones para mensajes dinámicos:

```typescript
@Required(
    (entity) => entity.customerType === 'business',
    (entity) => `Business customers must provide ${entity.documentType}`
)
businessDocument!: string;
```

### Input para Tipos Personalizados No BaseEntity

Para tipos complejos que no heredan BaseEntity, usa ObjectInputComponent con adaptador:

```typescript
export class Address {
    street!: string;
    city!: string;
    zipCode!: string;
}

// En entidad:
@PropertyName('Shipping Address', Address)
shippingAddress!: Address;

// ObjectInputComponent detectará que no es BaseEntity y renderizará campos nested
```

### Optimizar Validación Asíncrona con Debouncing

Para evitar llamadas excesivas al servidor en inputs de búsqueda:

```typescript
// En el input personalizado
import { debounce } from 'lodash-es';

methods: {
    handleValidation: debounce(async function() {
        this.isInputValidated = await this.isValidated();
        if (!this.isInputValidated) {
            Application.View.value.isValid = false;
        }
    }, 300),  // 300ms delay
}
```

Nota: Solo aplicar debouncing en validación manual, no en validate-inputs global antes de guardar.

### Integrar Input con ViewGroup y ViewGroupRow

Para controlar layout automático:

```typescript
@ModuleName('Customers')
export class Customer extends BaseEntity {
    @PropertyName('First Name', String)
    @ViewGroup('Personal Information')
    @ViewGroupRowDecorator(ViewGroupRow.TWO)
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @ViewGroup('Personal Information')
    @ViewGroupRowDecorator(ViewGroupRow.TWO)
    lastName!: string;
    
    @PropertyName('Email', String)
    @ViewGroup('Contact')
    @StringTypeDef(StringType.EMAIL)
    email!: string;
}
```

DefaultDetailView agrupa automáticamente firstName y lastName en FormRowTwoItemsComponent bajo FormGroupComponent con título "Personal Information".

### Testing de Inputs

Pruebas unitarias para inputs personalizados:

```typescript
import { mount } from '@vue/test-utils';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';
import { Customer } from '@/entities/customer';

describe('TextInputComponent', () => {
    it('should emit update:modelValue on input', async () => {
        const customer = new Customer({ name: 'John' });
        const wrapper = mount(TextInputComponent, {
            props: {
                entityClass: Customer,
                entity: customer,
                propertyKey: 'name',
                modelValue: 'John',
            },
        });
        
        const input = wrapper.find('input');
        await input.setValue('Jane');
        
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Jane']);
    });
    
    it('should fail validation if required and empty', async () => {
        const customer = new Customer({ name: '' });
        const wrapper = mount(TextInputComponent, {
            props: {
                entityClass: Customer,
                entity: customer,
                propertyKey: 'name',
                modelValue: '',
            },
        });
        
        const result = await wrapper.vm.isValidated();
        expect(result).toBe(false);
        expect(wrapper.vm.validationMessages.length).toBeGreaterThan(0);
    });
});
```

## 11. Referencias Cruzadas

**Documentos Relacionados:**
- [text-input-component.md](text-input-component.md): Documentación detallada TextInputComponent para String básico
- [number-input-component.md](number-input-component.md): Documentación NumberInputComponent con botones incrementales
- [boolean-input-component.md](boolean-input-component.md): Documentación BooleanInputComponent checkbox
- [date-input-component.md](date-input-component.md): Documentación DateInputComponent selector fecha
- [email-input-component.md](email-input-component.md): Documentación EmailInputComponent con validación formato
- [password-input-component.md](password-input-component.md): Documentación PasswordInputComponent ocultamiento visual
- [textarea-input-component.md](textarea-input-component.md): Documentación TextAreaComponent multilinea
- [object-input-component.md](object-input-component.md): Documentación ObjectInputComponent relaciones BaseEntity
- [array-input-component.md](array-input-component.md): Documentación ArrayInputComponent listas editables
- [list-input-component.md](list-input-component.md): Documentación ListInputComponent selector opciones
- [useInputMetadata-composable.md](useInputMetadata-composable.md): Documentación composable extracción metadatos
- [FormLayoutComponents.md](FormLayoutComponents.md): Documentación FormGroup, FormRowTwo, FormRowThree
- ../../02-base-entity/metadata-access.md: Métodos BaseEntity para acceso metadatos (isRequired, isValidation, isDisabled)
- ../../01-decorators/required_decorator.md: Decorador @Required para campos obligatorios
- ../../01-decorators/validation_decorator.md: Decorador @Validation para reglas síncronas
- ../../01-decorators/async_validation_decorator.md: Decorador @AsyncValidation para reglas asíncronas
- ../../01-decorators/property_name_decorator.md: Decorador @PropertyName para labels display
- ../../01-decorators/help_text_decorator.md: Decorador @HelpText para textos ayuda
- ../../01-decorators/disabled_decorator.md: Decorador @Disabled para deshabilitar campos
- ../../01-decorators/readonly_decorator.md: Decorador @ReadOnly para campos solo lectura
- ../../01-decorators/string_type_decorator.md: Decorador @StringTypeDef para subtipos String
- ../../03-application/ui-services.md: Application.eventBus y Application.View.value para estado global
- ../views/default-detailview.md: Vista que renderiza inputs automáticamente
- ../buttons/SaveButton.md: Botón que dispara validateInputs() antes guardar
