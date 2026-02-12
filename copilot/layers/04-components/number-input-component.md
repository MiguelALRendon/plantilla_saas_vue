# NumberInputComponent

## 1. PROPOSITO

NumberInputComponent es un componente especializado para entrada de valores numéricos enteros y decimales que incluye botones de incremento y decremento para facilitar ajustes rápidos. Implementa validación en tiempo de escritura mediante handleKeyPress, soporte para números negativos, y formato de visualización opcional mediante @DisplayFormat. Se activa automáticamente para properties de tipo Number.

## 2. ALCANCE

**UBICACION:** src/components/Form/NumberInputComponent.vue

**DEPENDENCIAS TECNICAS:**
- Vue 3 Composition API: Reactividad computed bidireccional
- useInputMetadata composable: Extracción de metadata
- @Validation decorator: Validación de rangos y constraints
- @DisplayFormat decorator: Formateo visual con símbolos de moneda/unidades
- type="text": Control total sobre validación de caracteres

**ACTIVACION:**
Se renderiza automáticamente cuando property es de tipo Number. Application.js detecta PropertyName(name, Number) y selecciona NumberInputComponent.

## 3. DEFINICIONES CLAVE

**handleKeyPress:**
Método que intercepta eventos keydown para permitir solo caracteres numéricos válidos: dígitos 0-9, punto decimal único, signo menos al inicio, backspace, delete, flechas de navegación. Previene ingreso de letras, espacios u otros símbolos.

**incrementValue / decrementValue:**
Métodos para ajustar valor mediante botones +/-. Incrementan o decrementan en 1 unidad por defecto, respetando validaciones de rango mínimo/máximo si existen.

**focusState:**
Variable reactiva que controla cuándo mostrar valor raw editable vs valor formateado. true durante edición muestra número puro, false en blur muestra DisplayFormat aplicado.

**displayValue computed:**
Propiedad computada que retorna valor formateado solo cuando input NO tiene focus. Durante edición retorna valor raw para permitir escritura normal.

## 4. DESCRIPCION TECNICA

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
        focusState: false,  // true cuando input tiene focus
        internalValue: 0    // Valor interno para control
    }
}
```

**ESTRUCTURA HTML:**
```html
<div class="NumberInput" :class="cssClass">
    <label>
        {{ displayName }}
        <span v-if="required" class="required">*</span>
    </label>
    
    <div class="input-wrapper">
        <button 
            class="left" 
            @click="decrementValue"
            :disabled="disabled"
        >
            -
        </button>
        
        <input 
            type="text"
            v-model="value"
            @keydown="handleKeyPress"
            @focus="focusState = true"
            @blur="handleBlur"
            :disabled="disabled"
            :readonly="readonly"
            :class="{ 'nonvalidated': !isValid }"
        />
        
        <button 
            class="right" 
            @click="incrementValue"
            :disabled="disabled"
        >
            +
        </button>
    </div>
    
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
            if (this.focusState) {
                return this.entity[this.propertyName];
            }
            return this.displayValue;
        },
        set(newValue) {
            const numValue = parseFloat(newValue);
            if (!isNaN(numValue)) {
                this.$emit('update:modelValue', numValue);
            }
        }
    },
    displayValue() {
        const rawValue = this.entity[this.propertyName];
        if (this.metadata.displayFormat && !this.focusState) {
            return this.metadata.displayFormat(this.entity);
        }
        return rawValue;
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

**METODO handleKeyPress:**
```typescript
handleKeyPress(event) {
    const key = event.key;
    const currentValue = event.target.value;
    const cursorPosition = event.target.selectionStart;
    
    // Permitir teclas de navegación y edición
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(key)) return;
    
    // Permitir dígitos
    if (/^\d$/.test(key)) return;
    
    // Permitir punto decimal único
    if (key === '.' && !currentValue.includes('.')) return;
    
    // Permitir signo menos solo al inicio
    if (key === '-' && cursorPosition === 0 && !currentValue.includes('-')) return;
    
    // Bloquear cualquier otra tecla
    event.preventDefault();
}
```

**METODO incrementValue:**
```typescript
incrementValue() {
    if (this.disabled || this.readonly) return;
    
    const current = parseFloat(this.entity[this.propertyName]) || 0;
    const newValue = current + 1;
    
    this.value = newValue;
}
```

**METODO decrementValue:**
```typescript
decrementValue() {
    if (this.disabled || this.readonly) return;
    
    const current = parseFloat(this.entity[this.propertyName]) || 0;
    const newValue = current - 1;
    
    this.value = newValue;
}
```

**METODO handleBlur:**
```typescript
handleBlur() {
    this.focusState = false;
    
    // Si valor está vacío, asignar 0
    if (this.value === '' || this.value === null || this.value === undefined) {
        this.value = 0;
    }
}
```

## 5. FLUJO DE FUNCIONAMIENTO

**PASO 1 - Activación:**
Sistema detecta PropertyName(name, Number) en entity, Application.js selecciona NumberInputComponent para renderizado.

**PASO 2 - Renderizado:**
Componente recibe entity, propertyName y metadata, renderiza input type="text" con botones - y + a los lados, aplica DisplayFormat si definido en metadata.

**PASO 3 - Focus del Usuario:**
Usuario hace clic en input, focusState se marca true, displayValue computed retorna valor raw sin formato permitiendo edición normal.

**PASO 4 - Escritura con Validación:**
Usuario presiona tecla, handleKeyPress intercepta evento, valida si tecla es dígito/punto/menos/navegación, permite tecla válida o previene tecla inválida con event.preventDefault().

**PASO 5 - Click en Botones +/-:**
Usuario hace clic en botón, incrementValue o decrementValue ejecuta, obtiene valor actual con parseFloat, suma/resta 1 unidad, actualiza value computed disparando setter, emite update:modelValue.

**PASO 6 - Blur y Formato:**
Usuario sale del input, handleBlur ejecuta marcando focusState false, si valor es null/undefined/empty asigna 0 por defecto, displayValue computed ahora retorna con DisplayFormat aplicado mostrando símbolos de moneda/unidades.

**PASO 7 - Validación al Guardar:**
Usuario intenta guardar, BaseEntity.validateInputs() emite evento validate-inputs, NumberInputComponent.handleValidation() ejecuta, verifica required con valor > 0 o !== null, aplica @Validation para rangos mínimo/máximo, actualiza isValid y validationMessages.

## 6. REGLAS OBLIGATORIAS

**REGLA 1:** SIEMPRE usar type="text" en input, NUNCA type="number" para tener control total de caracteres.

**REGLA 2:** SIEMPRE implementar handleKeyPress para validar entrada en tiempo real.

**REGLA 3:** SIEMPRE asignar 0 como default cuando valor es null/undefined en blur.

**REGLA 4:** SIEMPRE aplicar DisplayFormat solo cuando focusState es false, NUNCA durante edición.

**REGLA 5:** SIEMPRE permitir signo menos solo en posición 0 del input.

**REGLA 6:** SIEMPRE permitir solo un punto decimal en todo el número.

**REGLA 7:** SIEMPRE deshabilitar botones +/- cuando disabled o readonly están activos.

## 7. PROHIBICIONES

**PROHIBIDO:** Usar type="number" que permite rueda de mouse y flechas no controladas.

**PROHIBIDO:** Permitir ingreso de letras, espacios u otros caracteres no numéricos.

**PROHIBIDO:** Permitir múltiples puntos decimales en un mismo número.

**PROHIBIDO:** Permitir signo menos en medio o final del número.

**PROHIBIDO:** Mostrar DisplayFormat durante edición del input con focus.

**PROHIBIDO:** Omitir validación de teclas en handleKeyPress confiando solo en type.

**PROHIBIDO:** Modificar valor mediante botones +/- cuando input está disabled o readonly.

## 8. DEPENDENCIAS

**DECORADORES REQUERIDOS:**
- @PropertyName: Define nombre y tipo Number
- @Required: Marca campo obligatorio
- @Validation: Implementa validación de rangos
- @DisplayFormat: Define formato de visualización con símbolos
- @HelpText: Proporciona ayuda contextual

**COMPONENTES RELACIONADOS:**
- useInputMetadata composable: Extrae metadata de decoradores
- BaseEntity: Proporciona validationState

**SERVICIOS:**
- EventBus: Comunicación de evento validate-inputs

## 9. RELACIONES

**ACTIVADO POR:**
@PropertyName(name, Number) - Decorador que señala uso de number input.

**INTEGRA CON:**
- BaseEntity.validateInputs(): Sistema centralizado de validación
- Application.View.value.isValid: Flag global de estado de formulario
- EventBus: Comunicación de eventos validate-inputs

**FLUJO DE RENDERIZADO:**
Application.js detecta tipo Number, selecciona NumberInputComponent, pasa entity/propertyName/metadata como props, componente renderiza input con botones incremento/decremento.

## 10. NOTAS DE IMPLEMENTACION

**EJEMPLO ENTITY:**
```typescript
export class Product extends BaseEntity {
    @PropertyName('Price (USD)', Number)
    @Required(true)
    @Validation((e) => e.price >= 0, 'Price must be positive')
    @DisplayFormat((e) => `$${e.price.toFixed(2)}`)
    @HelpText('Product price in USD')
    price!: number;
    
    @PropertyName('Stock Quantity', Number)
    @Required(true)
    @Validation((e) => e.stock >= 0 && Number.isInteger(e.stock), 'Must be positive integer')
    stock!: number;
    
    @PropertyName('Discount %', Number)
    @Validation((e) => e.discount >= 0 && e.discount <= 100, 'Between 0 and 100')
    @DisplayFormat((e) => `${e.discount}%`)
    discount!: number;
    
    @PropertyName('Temperature (°C)', Number)
    @DisplayFormat((e) => `${e.temperature}°C`)
    temperature!: number;  // Permite valores negativos
}
```

**COMPORTAMIENTOS POR CASO:**
1. Price: Usuario escribe 99.99 durante edición input muestra 99.99, al hacer blur input muestra $99.99
2. Stock: Click en + incrementa de 1 en 1, click en - decrementa de 1 en 1, usuario puede escribir directamente
3. Discount: Validación verifica rango 0-100, DisplayFormat añade símbolo % al final
4. Temperature: Permite valores negativos como -15, DisplayFormat añade °C al final

**LAYOUT VISUAL:**
```
┌──────────────────────────────┐
│  Label                       │
├──┬──────────────────────┬────┤
│- │  [Input]            │ + │
└──┴──────────────────────┴────┘
```

**CSS CLASSES:**
- .NumberInput: Estilo específico de número
- .left: Botón decrementar
- .right: Botón incrementar
- .disabled: Estado deshabilitado
- .nonvalidated: Estado inválido

**COMPATIBILIDAD DECIMALES:**
Válidos: 123, -456, 12.5, -0.99
Inválidos: .5 (debe iniciar con 0), abc (bloqueado por keypress), 12..5 (solo un punto), - 5 (sin espacios)

**EVENTOS EMITIDOS:**
```typescript
$emit('update:modelValue', newValue: number)
```
Se emite cuando usuario escribe y hace blur, o cuando hace clic en botón + o -.

## 11. REFERENCIAS CRUZADAS

**DOCUMENTOS RELACIONADOS:**
- display-format-decorator.md: Decorator para formato visual
- validation-decorator.md: Decorator para validar rangos
- useInputMetadata-composable.md: Extracción de metadata
- form-inputs.md: Overview de inputs del framework

**UBICACION:** copilot/layers/04-components/number-input-component.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
