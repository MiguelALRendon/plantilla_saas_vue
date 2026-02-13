# EmailInputComponent

## 1. Propósito

EmailInputComponent es un componente especializado para recolección de direcciones de correo electrónico que aprovecha la validación nativa HTML5 mediante type="email". Se activa automáticamente cuando una propiedad usa el decorador @StringTypeDef(StringType.EMAIL), optimizando el teclado en dispositivos móviles y aplicando validación de formato nativa del navegador.

## 2. Alcance

**UBICACION:** src/components/Form/EmailInputComponent.vue

**DEPENDENCIAS TECNICAS:**
- Vue 3 Composition API: Reactividad y v-model
- TextInputComponent: Hereda estructura base
- StringType.EMAIL enum: Determina activación
- HTML5 Validation API: checkValidity(), validationMessage
- useInputMetadata composable: Extracción de metadata

**ACTIVACION:**
Se renderiza cuando property tiene decorador @StringTypeDef(StringType.EMAIL). Application.js detecta esta configuración y selecciona EmailInputComponent en lugar de TextInputComponent.

## 3. Definiciones Clave

**type="email":**
Atributo HTML5 que activa validación nativa de formato email, optimiza teclado móvil con teclas @, .com, y aplica pattern regex del navegador.

**Trim automático:**
Eliminación de espacios en blanco al inicio y final del valor en evento blur, previniendo errores de formato.

**Validación tri-nivel:**
Sistema que combina HTML5 nativa, regex custom sincrónica con @Validation, y verificación asíncrona con @AsyncValidation para validación de unicidad vía API.

**Teclado móvil optimizado:**
Interfaz especial en dispositivos móviles que facilita ingreso de emails con acceso rápido a @ y .com.

## 4. Descripción Técnica

**HERENCIA:**
EmailInputComponent extiende la estructura de TextInputComponent, manteniendo todas sus props, computed properties y métodos. La única diferencia técnica es el atributo type="email" en lugar de type="text".

**PROPS:**
```typescript
props: {
    entity: Object,        // Entidad actual BaseEntity
    propertyName: String,  // Nombre de property en entity
    metadata: Object       // Metadata extraída por useInputMetadata
}
```

**ESTRUCTURA HTML:**
```html
<div class="TextInput" :class="cssClass">
    <label>
        <i v-if="!metadata.hideLabel" :class="GGICONS.MAIL"></i>
        {{ displayName }}
        <span v-if="required" class="required">*</span>
    </label>
    
    <input 
        type="email"
        v-model="value"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="[inputClass, { 'nonvalidated': !isValid }]"
        @blur="handleBlur"
    />
    
    <div v-if="metadata.helpText" class="help-text">
        {{ metadata.helpText }}
    </div>
    
    <div class="validation-messages" v-if="!isValid">
        <span v-for="msg in validationMessages" :key="msg">
            {{ msg }}
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
    },
    readonly() {
        return this.metadata.readonly === true;
    },
    isValid() {
        if (!this.entity.validationState) return true;
        return !this.entity.validationState[this.propertyName];
    }
}
```

**METODO handleBlur:**
```typescript
handleBlur() {
    if (typeof this.value === 'string') {
        this.value = this.value.trim();
    }
}
```

**METODO handleValidation:**
```typescript
handleValidation() {
    const metadata = this.metadata;
    const entity = this.entity;
    
    // Nivel 1: Required con trim
    if (metadata.required && !this.value?.trim()) {
        this.isValid = false;
        this.validationMessages.push(metadata.requiredMessage || 'This field is required');
        return;
    }
    
    // Nivel 2: Validación síncrona regex
    if (metadata.validation) {
        const isValid = metadata.validation(entity);
        if (!isValid) {
            this.isValid = false;
            this.validationMessages.push(metadata.validationMessage);
            return;
        }
    }
    
    // Nivel 3: Validación asíncrona API
    if (metadata.asyncValidation) {
        await metadata.asyncValidation(entity);
    }
    
    this.isValid = true;
    this.validationMessages = [];
}
```

## 5. Flujo de Funcionamiento

**PASO 1 - Activación:**
Sistema detecta decorador @StringTypeDef(StringType.EMAIL) en property, Application.js selecciona EmailInputComponent para renderizado.

**PASO 2 - Renderizado:**
Componente recibe entity, propertyName y metadata, renderiza input con type="email", icono GGICONS.MAIL en label, required asterisk si metadata.required es true.

**PASO 3 - Input Usuario:**
Usuario escribe en input, evento @input dispara setter de computed value, emite update:modelValue, actualiza entity[propertyName] directamente, navegador valida formato HTML5 automáticamente.

**PASO 4 - Blur y Trim:**
Usuario sale del input, handleBlur ejecuta trim automático eliminando espacios, actualiza value con string limpio.

**PASO 5 - Validación al Guardar:**
Usuario intenta guardar, BaseEntity.validateInputs() emite evento validate-inputs vía EventBus, EmailInputComponent.handleValidation() se ejecuta aplicando nivel 1 required, nivel 2 regex custom, nivel 3 async validation API.

**PASO 6 - Actualización UI:**
Si validación falla, isValid se marca false, CSS class nonvalidated se aplica, validationMessages array se llena con mensajes de error.

**PASO 7 - Respuesta Visual:**
input muestra border rojo con .nonvalidated class, validation-messages div renderiza errores, usuario corrige input y repite ciclo.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE usar type="email" en input element, NUNCA type="text".

**REGLA 2:** SIEMPRE ejecutar trim en handleBlur antes de validación.

**REGLA 3:** SIEMPRE validar required ANTES de validaciones custom.

**REGLA 4:** SIEMPRE usar @StringTypeDef(StringType.EMAIL) para activar este componente, NUNCA otro StringType.

**REGLA 5:** SIEMPRE aplicar validaciones en orden: required, síncrona, asíncrona.

**REGLA 6:** SIEMPRE mostrar validationMessages cuando isValid es false.

**REGLA 7:** SIEMPRE incluir icono GGICONS.MAIL en label para identificación visual.

## 7. Prohibiciones

**PROHIBIDO:** Usar StringType.TEXT en properties de email.

**PROHIBIDO:** Omitir validación de formato, confiar solo en HTML5.

**PROHIBIDO:** Validar required sin aplicar trim previamente.

**PROHIBIDO:** Usar espacios en valores de email, permitir entrada sin trim.

**PROHIBIDO:** Renderizar EmailInputComponent manualmente sin decorador @StringTypeDef(StringType.EMAIL), sistema debe activarlo automáticamente.

**PROHIBIDO:** Modificar type="email" a type="text" bajo cualquier circunstancia.

**PROHIBIDO:** Ejecutar validación asíncrona antes de validaciones síncronas.

## 8. Dependencias

**DECORADORES REQUERIDOS:**
- @StringTypeDef: Define StringType.EMAIL para activación
- @PropertyName: Establece display name
- @Required: Marca campo obligatorio
- @Validation: Implementa regex custom
- @AsyncValidation: Verifica unicidad vía API
- @HelpText: Proporciona ayuda contextual

**COMPONENTES RELACIONADOS:**
- TextInputComponent: Componente base heredado
- useInputMetadata composable: Extrae metadata de decoradores

**SERVICIOS:**
- EventBus: Comunica evento validate-inputs
- HTML5 Validation API: Proporciona checkValidity()

## 9. Relaciones

**HEREDA DE:**
TextInputComponent - Estructura base, props, computed properties, métodos comunes.

**ACTIVADO POR:**
@StringTypeDef(StringType.EMAIL) - Decorador que señala uso de email input.

**INTEGRA CON:**
- BaseEntity.validateInputs(): Sistema centralizado de validación
- Application.View.value.isValid: Flag global de estado de formulario
- EventBus: Comunicación de eventos validate-inputs

**FLUJO DE RENDERIZADO:**
Application.js detecta decorador, selecciona EmailInputComponent, pasa entity/propertyName/metadata como props, componente renderiza input type="email".

## 10. Notas de Implementación

**VALIDACION HTML5 NATIVA:**
Formatos válidos: user@example.com, name.surname@domain.co, test_email@test.org
Formatos inválidos: usuario@ (sin dominio), @domain.com (sin usuario), user @domain.com (con espacios), user.domain.com (sin @)

**TECLADO MOVIL:**
En dispositivos móviles type="email" activa teclado especial con @ disponible en primera fila, .com como tecla rápida, punto . accesible fácilmente.

**EJEMPLO ENTITY:**
```typescript
export class User extends BaseEntity {
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true, 'Email is required')
    @AsyncValidation(
        async (entity) => {
            const response = await fetch('/api/users/check-email', {
                method: 'POST',
                body: JSON.stringify({ email: entity.email })
            });
            const data = await response.json();
            return data.available;
        },
        'This email is already registered'
    )
    email!: string;
}
```

**CASOS DE USO:**
1. Login/Registro: @Required + @AsyncValidation para verificar email único
2. Contacto Secundario: @Required(false) para email opcional
3. Email Corporativo: @Validation con regex para validar dominio específico como @company.com

**DIFERENCIAS CON TextInputComponent:**
type="text" vs type="email", sin validación HTML5 vs formato email validado, teclado estándar vs optimizado, sin icono vs icono GGICONS.MAIL, activación String default vs @StringTypeDef(StringType.EMAIL).

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- text-input-component.md: Componente base heredado
- string-type-decorator.md: Decorador que activa componente
- async-validation-decorator.md: Validación asíncrona API
- useInputMetadata-composable.md: Extracción de metadata
- form-inputs.md: Overview de inputs del framework

**UBICACION:** copilot/layers/04-components/email-input-component.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
