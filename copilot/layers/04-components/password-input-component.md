# PasswordInputComponent

## 1. Propósito

PasswordInputComponent es un componente especializado para entrada de contraseñas que incluye funcionalidad de mostrar/ocultar contraseña mediante toggle dinámico entre type="password" y type="text". Se activa automáticamente para properties con decorador @StringTypeDef(StringType.PASSWORD), proporcionando seguridad visual con contraseña oculta por defecto y botón con icono de ojo para alternar visibilidad.

## 2. Alcance

**UBICACION:** src/components/Form/PasswordInputComponent.vue

**DEPENDENCIAS TECNICAS:**
- Vue 3 Composition API: Reactividad y v-model
- TextInputComponent: Hereda estructura base
- StringType.PASSWORD enum: Determina activación
- GGICONS constants: Iconos VISIBILITY y VISIBILITY_OFF
- useInputMetadata composable: Extracción de metadata

**ACTIVACION:**
Se renderiza cuando property tiene decorador @StringTypeDef(StringType.PASSWORD). Application.js detecta esta configuración y selecciona PasswordInputComponent.

## 3. Definiciones Clave

**type toggle:**
Alternancia dinámica entre type="password" que muestra puntos negros ocultando texto y type="text" que muestra caracteres reales, controlada por variable reactiva showPassword.

**showPassword:**
Variable booleana reactiva que controla estado de visibilidad. false por defecto muestra password oculto, true muestra texto plano.

**togglePasswordVisibility:**
Método que invierte valor de showPassword alternando entre estados visible/oculto al hacer clic en botón con icono de ojo.

**Botón de visibilidad:**
Elemento button con clase right posicionado al lado derecho del input, muestra icono VISIBILITY cuando password está oculto, VISIBILITY_OFF cuando está visible.

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
        GGICONS,
        GGCLASS,
        showPassword: false,          // Estado inicial: oculto
        isInputValidated: true,
        validationMessages: [] as string[]
    }
}
```

**ESTRUCTURA HTML:**
```html
<div class="TextInput PasswordInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>
    
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        :type="showPassword ? 'text' : 'password'"
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', $event.target.value)" 
    />
    
    <button 
        class="right" 
        @click="togglePasswordVisibility" 
        :disabled="metadata.disabled.value"
    >
        <span :class="GGCLASS">
            {{ showPassword ? GGICONS.VISIBILITY_OFF : GGICONS.VISIBILITY }}
        </span>
    </button>
    
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
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

**METODO togglePasswordVisibility:**
```typescript
togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
}
```

**METODO isValidated:**
```typescript
isValidated(): boolean {
    var validated = true;
    this.validationMessages = [];
    
    /** Nivel 1: Required con trim */
    if (this.metadata.required.value && 
        (!this.modelValue || this.modelValue.trim() === '')) {
        validated = false;
        this.validationMessages.push(
            this.metadata.requiredMessage.value || 
            `${this.metadata.propertyName} is required.`
        );
    }
    
    /** Nivel 2: Validación síncrona */
    if (!this.metadata.validated.value) {
        validated = false;
        this.validationMessages.push(
            this.metadata.validatedMessage.value || 
            `${this.metadata.propertyName} is not valid.`
        );
    }
    
    /** Nivel 3: Validación asíncrona */
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

## 5. Flujo de Funcionamiento

**PASO 1 - Activación:**
Sistema detecta decorador @StringTypeDef(StringType.PASSWORD) en property, Application.js selecciona PasswordInputComponent para renderizado.

**PASO 2 - Renderizado Inicial:**
Componente recibe entity, propertyName y metadata, showPassword inicializa en false, input renderiza con type="password" mostrando puntos negros, botón muestra icono VISIBILITY indicando que password está oculto.

**PASO 3 - Input Usuario:**
Usuario escribe en input, caracteres aparecen momentáneamente y se convierten en puntos negros, evento @input dispara setter de computed value, emite update:modelValue, actualiza entity[propertyName] directamente.

**PASO 4 - Click en Botón Toggle:**
Usuario hace clic en botón con icono de ojo, togglePasswordVisibility ejecuta invirtiendo showPassword a true, binding dinámico :type cambia de "password" a "text", input ahora muestra caracteres reales, icono cambia de VISIBILITY a VISIBILITY_OFF.

**PASO 5 - Segundo Click Toggle:**
Usuario hace clic nuevamente en botón, showPassword vuelve a false, type regresa a "password", caracteres se ocultan nuevamente mostrando puntos, icono vuelve a VISIBILITY.

**PASO 6 - Validación al Guardar:**
Usuario intenta guardar, BaseEntity.validateInputs() emite evento validate-inputs, isValidated() ejecuta aplicando nivel 1 required con trim, nivel 2 validación síncrona de complejidad regex, nivel 3 validación asíncrona verificando password comprometido en API.

**PASO 7 - Actualización UI:**
Si validación falla, isInputValidated se marca false, CSS class nonvalidated se aplica al input, validationMessages div renderiza errores específicos de cada nivel fallido.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE inicializar showPassword en false para ocultar password por defecto.

**REGLA 2:** SIEMPRE usar binding dinámico :type="showPassword ? 'text' : 'password'", NUNCA hardcodear type.

**REGLA 3:** SIEMPRE alternar icono entre VISIBILITY y VISIBILITY_OFF según estado showPassword.

**REGLA 4:** SIEMPRE usar @StringTypeDef(StringType.PASSWORD) para activar este componente, NUNCA StringType.TEXT.

**REGLA 5:** SIEMPRE validar complejidad de password con regex uppercase, lowercase, digits, special chars.

**REGLA 6:** SIEMPRE deshabilitar botón toggle cuando input está disabled.

**REGLA 7:** SIEMPRE validar required con trim eliminando espacios en blanco.

## 7. Prohibiciones

**PROHIBIDO:** Usar StringType.TEXT para properties de password exponiendo texto por defecto.

**PROHIBIDO:** Inicializar showPassword en true mostrando password visible al cargar.

**PROHIBIDO:** Omitir validación de complejidad confiando solo en required.

**PROHIBIDO:** Permitir espacios en valores de password sin trim.

**PROHIBIDO:** Usar type="text" fijo sin toggle de visibilidad.

**PROHIBIDO:** Permitir click en botón toggle cuando input está disabled.

**PROHIBIDO:** Guardar passwords en texto plano en servidor, SIEMPRE hashear con bcrypt/argon2.

## 8. Dependencias

**DECORADORES REQUERIDOS:**
- @StringTypeDef: Define StringType.PASSWORD para activación
- @PropertyName: Establece display name
- @Required: Marca campo obligatorio
- @Validation: Implementa regex de complejidad
- @AsyncValidation: Verifica password comprometido vía API
- @HelpText: Proporciona ayuda contextual

**COMPONENTES RELACIONADOS:**
- TextInputComponent: Componente base heredado
- useInputMetadata composable: Extrae metadata de decoradores

**SERVICIOS:**
- EventBus: Comunica evento validate-inputs
- GGICONS: Proporciona iconos VISIBILITY y VISIBILITY_OFF

## 9. Relaciones

**HEREDA DE:**
TextInputComponent - Estructura base, props, computed properties, métodos comunes.

**ACTIVADO POR:**
@StringTypeDef(StringType.PASSWORD) - Decorador que señala uso de password input.

**INTEGRA CON:**
- BaseEntity.validateInputs(): Sistema centralizado de validación
- Application.View.value.isValid: Flag global de estado de formulario
- EventBus: Comunicación de eventos validate-inputs

**FLUJO DE RENDERIZADO:**
Application.js detecta decorador, selecciona PasswordInputComponent, pasa entity/propertyName/metadata como props, componente renderiza input type="password" con botón toggle.

## 10. Notas de Implementación

**EJEMPLO ENTITY:**
```typescript
export class User extends BaseEntity {
    @ViewGroup('Credentials')
    @PropertyIndex(1)
    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true, 'Password is required')
    @HelpText('Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number')
    @Validation(
        (entity) => {
            const pwd = entity.password;
            if (!pwd) return false;
            return pwd.length >= 8 && 
                   /[A-Z]/.test(pwd) && 
                   /[a-z]/.test(pwd) && 
                   /[0-9]/.test(pwd);
        },
        'Password does not meet complexity requirements'
    )
    password!: string;
    
    @ViewGroup('Credentials')
    @PropertyIndex(2)
    @PropertyName('Confirm Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true, 'Please confirm your password')
    @Validation(
        (entity) => entity.confirmPassword === entity.password,
        'Passwords do not match'
    )
    confirmPassword!: string;
}
```

**CASOS DE USO:**
1. Registro Usuario: @Required + @Validation complejidad 12+ chars + @AsyncValidation verificar no comprometido
2. Cambio Password: @Required + @AsyncValidation verificar current password correcto + @Validation new password diferente de current
3. PIN Numérico: @StringTypeDef(PASSWORD) + @Validation regex 4-6 dígitos

**VALIDACION COMPLEJIDAD:**
Regex típico: pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd)
Válido: MyP@ssw0rd, Secure123!, Admin#2024
Inválido: password (sin uppercase/digits), 12345678 (sin letras), Password (sin digits/special)

**LAYOUT VISUAL:**
Estado oculto: [Password] [••••••••][icono ojo]
Estado visible: [Password] [myPassword123][icono ojo tachado]

**CONSIDERACIONES SEGURIDAD:**
Cliente: Ocultar por defecto, validar complejidad, NO guardar en localStorage, toggle visibilidad solo UX no seguridad
Servidor: Hashear bcrypt/argon2, salt única, NUNCA retornar password en API, rate limiting login endpoints

**DIFERENCIAS CON TextInputComponent:**
type="text" vs type="password"/toggle, siempre visible vs oculto por defecto, sin botón vs botón toggle, sin icono vs icono VISIBILITY, autocomplete sí vs depende navegador, activación String default vs @StringTypeDef(PASSWORD)

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- text-input-component.md: Componente base heredado
- string-type-decorator.md: Decorador que activa componente
- validation-decorator.md: Validación de complejidad
- async-validation-decorator.md: Validación asíncrona API
- useInputMetadata-composable.md: Extracción de metadata

**UBICACION:** copilot/layers/04-components/password-input-component.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
