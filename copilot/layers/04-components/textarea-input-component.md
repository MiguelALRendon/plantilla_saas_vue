# TextAreaComponent

## 1. Propósito

TextAreaComponent es un componente especializado para entrada de texto multilínea mediante elemento textarea nativo HTML, diseñado para recolectar párrafos, descripciones largas y comentarios. Se activa automáticamente cuando una propiedad usa decorador @StringTypeDef(StringType.TEXTAREA), soportando auto-resize según contenido y validación de dos niveles: required y síncrona, sin soporte actual para validación asíncrona.

## 2. Alcance

**UBICACION:** src/components/Form/TextAreaComponent.vue

**DEPENDENCIAS TECNICAS:**
- Vue 3 Composition API: Reactividad y v-model
- TextInputComponent: Hereda estructura base
- StringType.TEXTAREA enum: Determina activación
- useInputMetadata composable: Extracción de metadata
- HTMLTextAreaElement: Casting para manipulación DOM

**ACTIVACION:**
Se renderiza cuando property tiene decorador @StringTypeDef(StringType.TEXTAREA). Application.js detecta esta configuración y selecciona TextAreaComponent.

**LIMITACIONES:**
NO soporta validación asíncrona, NO muestra help text section en template actual.

## 3. Definiciones Clave

**textarea element:**
Elemento HTML nativo para entrada multilínea que permite saltos de línea con Enter, soporta scroll vertical automático cuando contenido excede altura, y preserva formato de texto con espacios y líneas.

**Auto-resize:**
Comportamiento donde altura del textarea se ajusta dinámicamente según cantidad de contenido, expandiéndose verticalmente al agregar líneas y contrayéndose al eliminar.

**Validación de dos niveles:**
Sistema reducido que solo implementa nivel 1 required con trim y nivel 2 validación síncrona, omitiendo nivel 3 validación asíncrona presente en otros input components.

**saveItem method:**
Método con nombre inconsistente que ejecuta validación en lugar de guardar, invocado por evento validate-inputs, debería llamarse handleValidation para consistencia con otros componentes.

## 4. Descripción Técnica

**PROPS:**
```typescript
props: {
    entity: Object,        // Entidad actual BaseEntity
    propertyName: String,  // Nombre de property en entity
    metadata: Object       // Metadata extraída por useInputMetadata
}
```

**DATA:**
```typescript
data() {
    return {
        isInputValidated: true,
        validationMessages: [] as string[]
    }
}
```

**ESTRUCTURA HTML:**
```html
<div class="TextInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <label 
        :for="'id-' + metadata.propertyName" 
        class="label-input"
    >
        {{ metadata.propertyName }}
    </label>

    <textarea 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', $event.target.value)" 
    />
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">
            {{ message }}
        </span>
    </div>
</div>
```

**COMPUTED VALUE:**
```typescript
computed: {
    value: {
        get() {
            return this.entity[this.propertyName];
        },
        set(newValue) {
            this.$emit('update:modelValue', newValue);
        }
    },
    displayName() {
        return this.metadata.displayName || this.propertyName;
    },
    required() {
        return this.metadata.required === true;
    },
    disabled() {
        return this.metadata.disabled === true;
    }
}
```

**METODO isValidated:**
```typescript
isValidated(): boolean {
    var validated = true;
    this.validationMessages = [];
    
    // Nivel 1: Required con trim
    if (this.metadata.required.value && 
        (!this.modelValue || this.modelValue.trim() === '')) {
        validated = false;
        this.validationMessages.push(
            this.metadata.requiredMessage.value || 
            `${this.metadata.propertyName} is required.`
        );
    }
    
    // Nivel 2: Validación síncrona
    if (!this.metadata.validated.value) {
        validated = false;
        this.validationMessages.push(
            this.metadata.validatedMessage.value || 
            `${this.metadata.propertyName} is not valid.`
        );
    }
    
    return validated;
}
```

**METODO saveItem:**
```typescript
saveItem() {
    this.isInputValidated = this.isValidated();
    if (!this.isInputValidated) {
        Application.View.value.isValid = false;
    }
}
```

**LIFECYCLE HOOKS:**
```typescript
mounted() {
    Application.eventBus.on('validate-inputs', this.saveItem);
}

beforeUnmount() {
    Application.eventBus.off('validate-inputs', this.saveItem);
}
```

## 5. Flujo de Funcionamiento

**PASO 1 - Activación:**
Sistema detecta decorador @StringTypeDef(StringType.TEXTAREA) en property, Application.js selecciona TextAreaComponent para renderizado.

**PASO 2 - Renderizado:**
Componente recibe entity, propertyName y metadata, renderiza textarea element con label, aplica class TextInput, inicializa isInputValidated en true.

**PASO 3 - Input Usuario Multilínea:**
Usuario escribe en textarea incluyendo saltos de línea con Enter, evento @input dispara setter de computed value emitiendo update:modelValue, actualiza entity[propertyName] preservando formato y líneas, textarea auto-resize ajusta altura según contenido.

**PASO 4 - Validación al Guardar:**
Usuario intenta guardar, BaseEntity.validateInputs() emite evento validate-inputs vía EventBus, saveItem() método ejecuta invocando isValidated(), nivel 1 verifica required con trim, nivel 2 ejecuta validación síncrona de longitud/formato, NO ejecuta nivel 3 async validation.

**PASO 5 - Actualización UI:**
Si validación falla, isInputValidated se marca false aplicando CSS class nonvalidated, validationMessages div renderiza errores específicos de cada validación fallida, textarea muestra border rojo indicando estado inválido.

**PASO 6 - Corrección Usuario:**
Usuario edita contenido corrigiendo errores, próxima validación re-evalúa con isValidated(), si pasa isInputValidated vuelve a true, CSS nonvalidated se remueve, validationMessages se limpia.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE usar elemento textarea, NUNCA input type="text" para contenido multilínea.

**REGLA 2:** SIEMPRE validar required con trim eliminando espacios en blanco antes de verificar.

**REGLA 3:** SIEMPRE limitar longitud máxima con @Validation para prevenir contenido excesivo.

**REGLA 4:** SIEMPRE usar @StringTypeDef(StringType.TEXTAREA) para activar componente, NUNCA StringType.TEXT.

**REGLA 5:** SIEMPRE casting a HTMLTextAreaElement cuando manipulando elemento DOM.

**REGLA 6:** SIEMPRE registrar y desregistrar evento validate-inputs en mounted/beforeUnmount.

**REGLA 7:** SIEMPRE mostrar validationMessages cuando isInputValidated es false.

## 7. Prohibiciones

**PROHIBIDO:** Usar TextAreaComponent para textos cortos de una línea, usar TextInputComponent.

**PROHIBIDO:** Omitir validación de longitud máxima permitiendo contenido ilimitado.

**PROHIBIDO:** Usar @AsyncValidation con TextAreaComponent, no está soportado actualmente.

**PROHIBIDO:** Confiar en isValidated() para ejecutar validación asíncrona, método es síncrono.

**PROHIBIDO:** Usar StringType.TEXT en properties que requieren multilínea.

**PROHIBIDO:** Omitir trim en validación required permitiendo solo espacios/líneas vacías.

**PROHIBIDO:** Modificar método isValidated() a async sin actualizar toda la cadena de validación.

## 8. Dependencias

**DECORADORES REQUERIDOS:**
- @StringTypeDef: Define StringType.TEXTAREA para activación
- @PropertyName: Establece display name
- @Required: Marca campo obligatorio
- @Validation: Implementa validación longitud y formato
- @HelpText: NO se muestra actualmente por limitación template

**COMPONENTES RELACIONADOS:**
- TextInputComponent: Componente base heredado
- useInputMetadata composable: Extrae metadata de decoradores

**SERVICIOS:**
- EventBus: Comunica evento validate-inputs
- Application.View.value.isValid: Flag global validación formulario

## 9. Relaciones

**HEREDA DE:**
TextInputComponent - Estructura base conceptual, usa textarea en lugar de input.

**ACTIVADO POR:**
@StringTypeDef(StringType.TEXTAREA) - Decorador que señala uso de textarea.

**INTEGRA CON:**
- BaseEntity.validateInputs(): Sistema centralizado de validación
- Application.View.value.isValid: Flag global de estado de formulario
- EventBus: Comunicación de eventos validate-inputs

**FLUJO DE RENDERIZADO:**
Application.js detecta decorador, selecciona TextAreaComponent, pasa entity/propertyName/metadata como props, componente renderiza textarea element.

## 10. Notas de Implementación

**EJEMPLO ENTITY:**
```typescript
export class Product extends BaseEntity {
    @ViewGroup('Basic Information')
    @PropertyIndex(1)
    @PropertyName('Product Name', String)
    @Required(true)
    name!: string;
    
    @ViewGroup('Details')
    @PropertyIndex(2)
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Required(true, 'Description is required')
    @Validation(
        (entity) => entity.description.length >= 20,
        'Description must be at least 20 characters'
    )
    @Validation(
        (entity) => entity.description.length <= 500,
        'Description must be 500 characters or less'
    )
    description!: string;
    
    @ViewGroup('Details')
    @PropertyIndex(3)
    @PropertyName('Additional Notes', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Required(false)
    notes?: string;
}
```

**CASOS DE USO:**
1. Descripción Producto: @Required + @Validation longitud 50-1000 chars + validar no contiene HTML tags
2. Comentarios: @Required(false) para textarea opcional sin validaciones adicionales
3. Dirección Postal: @Required + @Validation verificar mínimo 2 líneas separadas por salto
4. Términos Condiciones: @Disabled(true) para textarea solo lectura con contenido predefinido

**VALIDACIONES COMUNES:**
Longitud rango: entity.description.length >= 20 && entity.description.length <= 500
Sin HTML: !/<[^>]*>/g.test(entity.description)
Mínimo líneas: entity.address.split('\n').length >= 2

**LAYOUT VISUAL:**
```
┌─────────────────────────────────────┐
│ Description                         │
│ ┌─────────────────────────────────┐ │
│ │ This is a product description   │ │
│ │ that spans multiple lines.      │ │
│ │ It supports paragraphs and      │ │
│ │ line breaks.                    │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**CSS CLASSES:**
.TextInput - Estilo base
.TextInput.disabled - Opacity 0.6 cursor not-allowed
.TextInput.nonvalidated - Border rojo para estado inválido

**LIMITACIONES ACTUALES:**
1. NO soporta validación asíncrona: @AsyncValidation no funciona porque isValidated() no es async
2. NO muestra help text: Sección help-text omitida en template actual
3. Método mal nombrado: saveItem debería ser handleValidation para consistencia

**DIFERENCIAS CON TextInputComponent:**
Elemento input vs textarea, sin multilínea vs multilínea sí, help text sí vs no omitido, validación async sí vs no, auto-resize no aplica vs sí, chars counter no vs no, activación String default vs @StringTypeDef(TEXTAREA)

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- text-input-component.md: Componente base input de línea única
- string-type-decorator.md: Decorador que activa componente
- validation-decorator.md: Validación de longitud y formato
- useInputMetadata-composable.md: Extracción de metadata

**UBICACION:** copilot/layers/04-components/textarea-input-component.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
