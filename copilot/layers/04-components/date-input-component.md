# DateInputComponent

## 1. Propósito

DateInputComponent es un componente de formulario para selección de fechas mediante picker nativo del navegador, implementando arquitectura de doble input: input visual readonly tipo text mostrando fecha formateada como DD/MM/YYYY para display usuario, e input oculto tipo date con formato YYYY-MM-DD para leveraging picker nativo HTML5. El componente ejecuta computed property formattedDate que parsea modelValue (YYYY-MM-DD ISO string) creando Date object con timezone offset correction (T00:00:00 appended), validando mediante isNaN check, y formateando con padStart para consistencia de dos dígitos. Integra botón con icono de calendario que ejecuta showPicker() API nativa para abrir date picker, method updateDate que captura input events emitiendo update:modelValue con raw ISO string, y sistema completo de validación tri-level (required, sync, async) con mensajes renderizados debajo del input y clases CSS condicionales para disabled y nonvalidated states.

**Ubicación del código fuente:** src/components/Form/DateInputComponent.vue

**Tipo de propiedad:** Date

**Decorador activador:** @PropertyName('Property Name', Date)

**Patrón de diseño:** Dual Input (Display + Hidden Picker) + Native HTML5 API + Formatted Output

## 2. Alcance

### Responsabilidades

1. **Renderizado de Dual Input Architecture:**
   - Renderizar input type="text" con :value="formattedDate" para display visual readonly
   - Renderizar input ref="dateInput" type="date" con :value="modelValue" y class="date-input" (visibility: hidden)
   - Bindear @input="updateDate" a input hidden para capturar selección de fecha
   - Aplicar :disabled binding a ambos inputs desde metadata.disabled.value
   - Renderizar button.right con icono CALENDAR y @click="openCalendar"

2. **Formateo de Fecha para Display:**
   - Computed formattedDate parsea modelValue (YYYY-MM-DD string)
   - Crear Date object con timezone correction: new Date(modelValue + 'T00:00:00')
   - Validar fecha mediante isNaN(date.getTime()), retornar empty string si invalid
   - Extraer day, month, year mediante getDate(), getMonth() + 1, getFullYear()
   - Aplicar String.padStart(2, '0') para two-digit formatting
   - Retornar formatted string: ${day}/${month}/${year}
   - Retornar empty string si modelValue es falsy

3. **Gestión de Picker Nativo:**
   - Method openCalendar() obtiene ref this.$refs.dateInput cast a HTMLInputElement
   - Ejecutar showPicker() API nativa para abrir date picker del navegador
   - Fallback: click directo en input funciona en navegadores antiguos
   - Method updateDate(event: Event) extrae value de event.target cast a HTMLInputElement
   - Emitir update:modelValue con raw YYYY-MM-DD string desde picker
   - Vue reactivity propaga cambio a modelValue, triggering formattedDate recalculation

4. **Sistema de Validación Tri-Level:**
   - Nivel 1 Required: Verificar metadata.required.value && (!modelValue || modelValue.trim() === '')
   - Nivel 2 Sync: Verificar !metadata.validated.value ejecutando entity validation decorators
   - Nivel 3 Async: Ejecutar await entity.isAsyncValidation(propertyKey)
   - Poblar validationMessages array con errores acumulativos de tres niveles
   - Computed isInputValidated evalúa metadata.validated.value && validationMessages.length === 0
   - Renderizar validation-messages div con span por cada mensaje

5. **Integración de Metadata:**
   - Ejecutar useInputMetadata composable con entityClass, entity, propertyKey
   - Extraer propertyName, helpText, disabled, required, validated, requiredMessage, validatedMessage
   - Renderizar label con for="'id-' + metadata.propertyName" mostrando propertyName
   - Renderizar help-text div condicional si metadata.helpText.value existe
   - Aplicar clases disabled y nonvalidated a container basado en metadata

### Límites

1. **NO formatea fecha según locale** - Formato hardcoded a DD/MM/YYYY, no usa Intl.DateTimeFormat
2. **NO valida rango de fechas min/max via HTML** - Validación debe ser via @Validation decorator
3. **NO soporta time selection** - Solo date, no datetime-local o time types
4. **NO previene fechas inválidas en picker** - Picker nativo permite cualquier fecha seleccionable
5. **NO implementa custom calendar UI** - Usa picker nativo que varía por navegador/OS
6. **NO parsea input manual** - Input visual es readonly, no acepta typing directo
7. **NO maneja timezones explícitamente** - Asume fecha local sin timezone info en ISO string
8. **NO implementa date range selection** - Solo single date, no start/end date pair

## 3. Definiciones Clave

**DateInputComponent**: Componente Vue de formulario que renderiza dual input architecture (visual text + hidden date) para selección de fechas mediante picker nativo HTML5 con formateo DD/MM/YYYY y validación completa.

**modelValue**: Prop string required con default empty string conteniendo fecha en formato ISO 8601 (YYYY-MM-DD), sincronizado con v-model del componente mediante eventos update:modelValue.

**formattedDate**: Computed property que parsea modelValue string a Date object, valida mediante isNaN, y retorna formatted string DD/MM/YYYY mediante getDate()/getMonth()/getFullYear() con padStart.

**dateInput ref**: Template ref a input type="date" hidden, utilizado para ejecutar showPicker() API nativa cuando usuario clicks botón calendario.

**openCalendar**: Method que ejecuta (this.$refs.dateInput as HTMLInputElement).showPicker() para triggerear date picker nativo del navegador programáticamente.

**updateDate**: Method que captura input events del hidden date input, extrayendo value (YYYY-MM-DD) y emitiendo update:modelValue con raw string.

**showPicker() API**: HTML5 native method de HTMLInputElement que abre date/time/color picker nativo del navegador, soportado desde Chrome 99+, Edge 99+, Safari 16+.

**Dual Input Pattern**: Arquitectura con input visual readonly para display formateado y input hidden nativo para leveraging picker functionality del navegador.

## 4. Descripción Técnica

DateInputComponent implementa template con TextInput y DateInput classes, aplicando clases condicionales disabled y nonvalidated mediante :class object syntax. El label bindea :for="'id-' + metadata.propertyName" con text interpolation mostrando metadata.propertyName. El primer input type="text" tiene :id="'id-' + metadata.propertyName", :value="formattedDate" computed, readonly attribute, y :disabled binding. El segundo input con ref="dateInput" tiene type="date", :id="'date-id-' + metadata.propertyName", class="date-input" (visibility: hidden en CSS), :value="modelValue" (raw YYYY-MM-DD), @input="updateDate" event handler, y :disabled binding. El button.right renderiza span con GGCLASS y GGICONS.CALENDAR, bindeando @click="openCalendar" y :disabled.

El computed formattedDate ejecuta early return retornando empty string si !this.modelValue. Crea date object: const date = new Date(this.modelValue + 'T00:00:00'), appending T00:00:00 para timezone correction evitando off-by-one day errors con UTC. Ejecuta validation: if (isNaN(date.getTime())) return '', retornando empty si fecha inválida. Extrae components: const day = String(date.getDate()).padStart(2, '0'), const month = String(date.getMonth() + 1).padStart(2, '0') (month es 0-indexed), const year = date.getFullYear(). Retorna template literal: ${day}/${month}/${year}.

El method openCalendar() type-casts ref: (this.$refs.dateInput as HTMLInputElement), ejecutando .showPicker() que triggerera picker nativo. Este method implementa programmatic opening del picker sin requiring user click directo en input hidden. El method updateDate(event: Event) type-casts target: const value = (event.target as HTMLInputElement).value, extrayendo YYYY-MM-DD string, ejecutando this.$emit('update:modelValue', value) para propagación a v-model del padre.

El method isValidated() implementa async function con three-level validation structure idéntica a otros input components: required check verifica metadata.required.value && (!modelValue || modelValue.trim() === ''), sync validation verifica !metadata.validated.value (ejecutando entity decorators via BaseEntity), async validation ejecuta await entity.isAsyncValidation(propertyKey). Todos los errores se acumulan en validationMessages array con mensajes desde metadata properties o defaults.

## 5. Flujo de Funcionamiento

**Montaje Inicial con Fecha Existente:**
1. Component recibe props: entityClass (Employee), entity (employee instance), propertyKey ('birthDate'), modelValue ('1990-03-15')
2. setup() ejecuta useInputMetadata(Employee, employee, 'birthDate')
3. metadata extraído: { propertyName: 'Birth Date', required: true, disabled: false, validated: true, helpText: 'Must be 18+' }
4. Template renderiza label 'Birth Date'
5. computed formattedDate ejecuta con modelValue: '1990-03-15'
6. Crea date: new Date('1990-03-15T00:00:00')
7. Valida: isNaN(date.getTime()) retorna false
8. Extrae: day='15', month='03', year=1990
9. Retorna: '15/03/1990'
10. Input visual renderiza con value='15/03/1990'
11. Input hidden renderiza con value='1990-03-15'
12. help-text div muestra 'Must be 18+'

**Abrir Picker y Seleccionar Nueva Fecha:**
1. Usuario click en botón con icono calendario
2. Event handler @click="openCalendar" ejecuta
3. openCalendar() obtiene this.$refs.dateInput cast a HTMLInputElement
4. Ejecuta dateInput.showPicker()
5. Navegador abre date picker nativo overlay
6. Usuario navega en picker a December 2025
7. Usuario selecciona día 25
8. Picker establece value de input hidden a '2025-12-25'
9. Input hidden emite input event
10. Event handler @input="updateDate" ejecuta con event
11. updateDate extrae value: '2025-12-25' de event.target
12. Ejecuta this.$emit('update:modelValue', '2025-12-25')
13. Evento bubbles a componente padre
14. Padre actualiza v-model: employee.birthDate = '2025-12-25'
15. Vue reactivity propaga cambio a prop modelValue
16. computed formattedDate recalcula con nuevo modelValue
17. Retorna: '25/12/2025'
18. Input visual re-renderiza mostrando '25/12/2025'

**Validación de Edad Mínima:**
1. Employee tiene @Validation((entity) => calculateAge(entity.birthDate) >= 18, 'Must be 18+')
2. Usuario selecciona fecha futura: '2020-01-01' (5 años)
3. DefaultDetailView ejecuta entity.isValidated()
4. BaseEntity itera properties, llama DateInputComponent.isValidated()
5. isValidated() verifica required: true, modelValue: '2020-01-01' (non-empty)
6. Required check pasa
7. Verifica sync validation: metadata.validated.value
8. BaseEntity ejecutó entity validation decorators
9. calculateAge('2020-01-01') retorna 5
10. 5 >= 18 retorna false
11. metadata.validated.value = false
12. isValidated() agrega 'Must be 18+' a validationMessages
13. Retorna false
14. computed isInputValidated evalúa: false && messages.length (1) → false
15. Template aplica clase nonvalidated a container
16. CSS cambia label color a red
17. validation-messages div renderiza 'Must be 18+'

**Required Validation (Fecha Vacía):**
1. Usuario abre form con nueva entidad: modelValue: ''
2. formattedDate computed ejecuta
3. if (!this.modelValue) retorna ''
4. Input visual muestra placeholder vacío
5. Usuario intenta guardar sin seleccionar fecha
6. isValidated() ejecuta
7. Verifica metadata.required.value: true && modelValue: '' (empty)
8. Condición true, validated = false
9. validationMessages.push('Birth Date is required.')
10. isInputValidated retorna false
11. Template renderiza mensaje de required

**Disabled State:**
1. Entity tiene @Disabled(true) en hireDate property
2. metadata.disabled.value: true
3. Template aplica :disabled="true" a ambos inputs y button
4. Container recibe clase disabled
5. CSS aplica cursor: not-allowed
6. Usuario no puede abrir picker ni interactuar con inputs

## 6. Reglas Obligatorias

### 6.1 Timezone Correction en Date Parsing

SIEMPRE append 'T00:00:00' al parsear modelValue a Date object:

```typescript
// ✅ CORRECTO - Evita timezone offset issues
const date = new Date(this.modelValue + 'T00:00:00');

// ❌ INCORRECTO - Puede causar off-by-one day
const date = new Date(this.modelValue);
```

### 6.2 Month Indexing Correction

SIEMPRE agregar 1 a getMonth() para conversion a 1-based:

```typescript
// ✅ CORRECTO
const month = String(date.getMonth() + 1).padStart(2, '0');

// ❌ INCORRECTO - January sería 00
const month = String(date.getMonth()).padStart(2, '0');
```

### 6.3 Two-Digit Padding

SIEMPRE usar padStart(2, '0') para day y month:

```typescript
// ✅ CORRECTO
const day = String(date.getDate()).padStart(2, '0');

// ❌ INCORRECTO - '1' en lugar de '01'
const day = String(date.getDate());
```

### 6.4 Date Validation Check

SIEMPRE validar fecha con isNaN antes de formatear:

```typescript
// ✅ CORRECTO
const date = new Date(this.modelValue + 'T00:00:00');
if (isNaN(date.getTime())) return '';

// ❌ INCORRECTO - Formato sin validación
const day = String(date.getDate()).padStart(2, '0');
```

### 6.5 Readonly en Input Visual

Input visual DEBE ser readonly, NO editable:

```vue
<!-- ✅ CORRECTO -->
<input 
    type="text" 
    :value="formattedDate" 
    readonly
/>

<!-- ❌ INCORRECTO - Permite typing manual -->
<input 
    type="text" 
    v-model="formattedDate"
/>
```

### 6.6 Hidden Input con Class date-input

Input nativo DEBE tener class="date-input" para CSS visibility: hidden:

```vue
<!-- ✅ CORRECTO -->
<input 
    ref="dateInput"
    type="date" 
    class="date-input"
    :value="modelValue"
/>

<!-- ❌ INCORRECTO - Visible en UI -->
<input 
    ref="dateInput"
    type="date"
    :value="modelValue"
/>
```

## 7. Prohibiciones

1. NO usar Date type para modelValue prop - DEBE ser String (YYYY-MM-DD ISO format)
2. NO omitir 'T00:00:00' en Date parsing - Causa timezone offset errors
3. NO formatear fecha con Intl.DateTimeFormat - Usar manual formatting con padStart
4. NO permitir typing directo en input visual - DEBE ser readonly
5. NO usar v-model en input visual - Usar :value="formattedDate" computed
6. NO omitir month + 1 correction - getMonth() retorna 0-indexed value
7. NO usar display: none para hidden input - Usar visibility: hidden para permitir showPicker()
8. NO omitir isNaN validation - Date constructor puede retornar Invalid Date
9. NO implementar custom calendar UI - Usar picker nativo del navegador
10. NO ejecutar showPicker() sin ref - DEBE usar this.$refs.dateInput

## 8. Dependencias

### Dependencias Directas

**useInputMetadata Composable:**
- useInputMetadata(entityClass, entity, propertyKey) - Retorna metadata object
- metadata.propertyName, helpText, disabled, required, validated, requiredMessage, validatedMessage

**BaseEntity:**
- entity.isAsyncValidation(propertyKey) - Async validation execution
- entity.asyncValidationMessage(propertyKey) - Mensaje de async validation

**Vue Core:**
- Props: entityClass, entity, propertyKey, modelValue (String)
- Emit: update:modelValue
- Computed: formattedDate, isInputValidated
- Methods: isValidated() async, openCalendar(), updateDate()
- Template refs: dateInput
- v-model pattern

**Decoradores:**
- @PropertyName('Name', Date) - Activador del component
- @Required(boolean, message) - Validación de fecha required
- @Disabled(boolean) - Deshabilitar componente
- @HelpText(string) - Texto de ayuda
- @Validation(fn, message) - Validación sincrónica (edad, rangos)
- @AsyncValidation(fn, message) - Validación asíncrona

### Dependencias de HTML5 APIs

- HTMLInputElement.showPicker() - API nativa para abrir picker
- input type="date" - Date picker nativo del navegador
- Date constructor - Parsing de ISO string
- Date.prototype.getDate(), getMonth(), getFullYear() - Extraer components
- isNaN() - Validación de fecha

### Dependencias de CSS

- Variables: --lavender, --bg-gray, --accent-red, --gray-light
- Classes: TextInput, DateInput, label-input, main-input, date-input, help-text, validation-messages
- visibility: hidden para input type="date"

### Dependencias de Iconos

- GGICONS.CALENDAR - Icono de calendario para botón
- GGCLASS - Clase CSS para iconos Google

## 9. Relaciones

**Componentes Relacionados:**

DateInputComponent ← DefaultDetailView (renderiza en formulario)
DateInputComponent → useInputMetadata (obtiene metadata)
DateInputComponent → BaseEntity (ejecuta validaciones)
DateInputComponent ↔ TextInputComponent (estructura similar de input)

**Flujo de Comunicación:**

User click botón calendario → openCalendar() → showPicker() → Native picker opens → User selects date → input event → updateDate() → emit update:modelValue → Parent updates v-model → Vue reactivity → modelValue prop updates → formattedDate recalculates → Visual input re-renders

DefaultDetailView calls entity.isValidated() → BaseEntity iterates properties → DateInputComponent.isValidated() → validates required/sync/async → returns boolean → BaseEntity aggregates

**Documentos Relacionados:**

- [text-input-component.md](text-input-component.md) - Input de texto base similar
- [number-input-component.md](number-input-component.md) - Input numérico con validaciones
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadata
- form-inputs.md - Overview de sistema de inputs
- validation-decorator.md - Decorador @Validation para rangos de fechas
- required-decorator.md - Decorador @Required
- disabled-decorator.md - Decorador @Disabled
- 02-validations.md - Tutorial de sistema de validaciones

**Casos de Uso Típicos:**

- Fecha de nacimiento con validación de edad mínima
- Fecha de contratación (hire date)
- Rangos de fechas (start/end dates)
- Fechas de vencimiento (expiration dates)
- Fechas de reservas futuras
- Fechas históricas pasadas

## 10. Notas de Implementación

### Definición Básica

```typescript
@PropertyName('Birth Date', Date)
birthDate!: string;  // Tipo string, NO Date
```

### Fecha Required

```typescript
@PropertyName('Birth Date', Date)
@Required(true, 'Birth date is required')
birthDate!: string;
```

### Validación de Edad Mínima

```typescript
@PropertyName('Birth Date', Date)
@Required(true)
@HelpText('Must be at least 18 years old')
@Validation(
    (entity) => {
        if (!entity.birthDate) return false;
        const birthDate = new Date(entity.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    },
    'Employee must be at least 18 years old'
)
birthDate!: string;
```

### Rango de Fechas

```typescript
@PropertyName('Start Date', Date)
@Required(true)
startDate!: string;

@PropertyName('End Date', Date)
@Required(true)
@Validation(
    (entity) => {
        const start = new Date(entity.startDate);
        const end = new Date(entity.endDate);
        return end >= start;
    },
    'End date must be after start date'
)
endDate!: string;
```

### Fecha Futura

```typescript
@PropertyName('Reservation Date', Date)
@Required(true)
@Validation(
    (entity) => new Date(entity.reservationDate) > new Date(),
    'Reservation must be in the future'
)
reservationDate!: string;
```

### Fecha Pasada

```typescript
@PropertyName('Hire Date', Date)
@Required(true)
@Validation(
    (entity) => new Date(entity.hireDate) <= new Date(),
    'Hire date cannot be in the future'
)
hireDate!: string;
```

### Helper Function para Edad

```typescript
function calculateAge(birthDateString: string): number {
    if (!birthDateString) return 0;
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Uso:
@Validation(
    (entity) => calculateAge(entity.birthDate) >= 18,
    'Must be 18 or older'
)
birthDate!: string;
```

### CSS Crítico

```css
.date-input {
    visibility: hidden;
    position: absolute;
    width: 0;
    height: 0;
}

.TextInput.DateInput {
    position: relative;
}

.TextInput.DateInput .right {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
}
```

### Debugging

```typescript
// Verificar formato de fecha
console.log('Raw value:', this.modelValue);
console.log('Formatted:', this.formattedDate);

// Verificar parsing
const date = new Date(this.modelValue + 'T00:00:00');
console.log('Parsed date:', date);
console.log('Is valid:', !isNaN(date.getTime()));

// Verificar validación
const isValid = await this.isValidated();
console.log('Is valid:', isValid);
console.log('Validation messages:', this.validationMessages);
```

### Browser Compatibility

showPicker() API soportado en:
- Chrome 99+ (Marzo 2022)
- Edge 99+ (Marzo 2022)
- Safari 16+ (Septiembre 2022)
- Firefox: Not supported (usar click en input hidden)

Fallback para navegadores antiguos:

```typescript
openCalendar() {
    const input = this.$refs.dateInput as HTMLInputElement;
    if ('showPicker' in input) {
        input.showPicker();
    } else {
        input.click();  // Fallback
    }
}
```

## 11. Referencias Cruzadas

**Form Inputs:**
- [form-inputs.md](form-inputs.md) - Overview del sistema de inputs
- [text-input-component.md](text-input-component.md) - Input de texto base
- [number-input-component.md](number-input-component.md) - Input numérico
- [boolean-input-component.md](boolean-input-component.md) - Input booleano

**Composables:**
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadata

**Decoradores:**
- [property-name-decorator.md](../01-decorators/property-name-decorator.md) - @PropertyName con tipo Date
- [required-decorator.md](../01-decorators/required-decorator.md) - @Required decorator
- [validation-decorator.md](../01-decorators/validation-decorator.md) - @Validation para rangos
- [help-text-decorator.md](../01-decorators/help-text-decorator.md) - @HelpText decorator
- [disabled-decorator.md](../01-decorators/disabled-decorator.md) - @Disabled decorator

**Tutoriales:**
- [02-validations.md](../../tutorials/02-validations.md) - Tutorial de sistema de validaciones

**Arquitectura:**
- [02-FLOW-ARCHITECTURE.md](../../02-FLOW-ARCHITECTURE.md) - Flujo de renderizado de formularios
- [01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md) - Visión general del framework

**Ubicación del código fuente:** src/components/Form/DateInputComponent.vue

---

## Template

```vue
<template>
<div class="TextInput DateInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <!-- Label -->
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>
    
    <!-- Input visual (readonly, muestra formato DD/MM/YYYY) -->
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" " 
        :value="formattedDate"  <!-- ← Fecha formateada -->
        :disabled="metadata.disabled.value"
        readonly  <!-- ← Solo lectura -->
    />
    
    <!-- Input oculto (date picker nativo) -->
    <input 
        ref="dateInput"
        :id="'date-id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="date"  <!-- ← Picker nativo -->
        class="date-input"  <!-- ← Oculto con CSS -->
        :value="modelValue"  <!-- ← Formato YYYY-MM-DD -->
        :disabled="metadata.disabled.value"
        @input="updateDate" 
    />
    
    <!-- Botón que abre el calendario -->
    <button 
        class="right" 
        @click="openCalendar" 
        :disabled="metadata.disabled.value"
    >
        <span :class="GGCLASS">{{ GGICONS.CALENDAR }}</span>
    </button>
</div>

<!-- Help text -->
<div class="help-text" v-if="metadata.helpText.value">
    <span>{{ metadata.helpText.value }}</span>
</div>

<!-- Validation messages -->
<div class="validation-messages">
    <span v-for="message in validationMessages" :key="message">
        {{ message }}
    </span>
</div>
</template>
```

---

## Arquitectura de Doble Input

### Input Visual (Display)
```vue
<input 
    type="text" 
    :value="formattedDate"  <!-- "25/12/2025" -->
    readonly
/>
```
- **Propósito:** Mostrar fecha al usuario en formato legible
- **Características:** Solo lectura, no editable directamente

### Input Oculto (Picker)
```vue
<input 
    ref="dateInput"
    type="date"
    :value="modelValue"  <!-- "2025-12-25" -->
    @input="updateDate"
    class="date-input"  <!-- visibility: hidden -->
/>
```
- **Propósito:** Abrir picker nativo del navegador
- **Características:** Oculto con CSS, formato ISO 8601

### Flujo de Interacción

```
Usuario click en botón 📅
    ↓
openCalendar() ejecuta
    ↓
this.$refs.dateInput.showPicker()
    ↓
Picker nativo se abre
    ↓
Usuario selecciona fecha
    ↓
@input="updateDate" ejecuta
    ↓
$emit('update:modelValue', 'YYYY-MM-DD')
    ↓
v-model actualiza entity.birthDate
    ↓
formattedDate computed se recalcula
    ↓
Input visual muestra "DD/MM/YYYY"
```

---

## Computed Property: formattedDate

```typescript
computed: {
    formattedDate(): string {
        if (!this.modelValue) return '';
        
        // Crear fecha desde string YYYY-MM-DD
        const date = new Date(this.modelValue + 'T00:00:00');
        
        // Validar fecha
        if (isNaN(date.getTime())) return '';
        
        // Formatear a DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }
}
```

**Ejemplos:**
```typescript
modelValue: '2025-12-25' → formattedDate: '25/12/2025'
modelValue: '2024-01-01' → formattedDate: '01/01/2024'
modelValue: ''           → formattedDate: ''
modelValue: 'invalid'    → formattedDate: ''
```

---

## Métodos Principales

### updateDate()

```typescript
methods: {
    updateDate(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.$emit('update:modelValue', value);
    }
}
```

**Flujo:**
1. Usuario selecciona fecha en picker
2. Input hidden dispara @input
3. updateDate() extrae valor (YYYY-MM-DD)
4. Emite update:modelValue
5. v-model actualiza entity

### openCalendar()

```typescript
openCalendar() {
    (this.$refs.dateInput as HTMLInputElement).showPicker();
}
```

**API Nativa:**
- `showPicker()` - Método HTML5 que abre el date picker
- **Soporte:** Chrome 99+, Edge 99+, Safari 16+
- **Fallback:** Click directo en input funciona en navegadores antiguos

---

## Sistema de Validación (3 Niveles)

### Nivel 1: Required

```typescript
if (this.metadata.required.value && 
    (!this.modelValue || this.modelValue.trim() === '')) {
    validated = false;
    this.validationMessages.push(
        this.metadata.requiredMessage.value || 
        `${this.metadata.propertyName} is required.`
    );
}
```

### Nivel 2: Validación Síncrona

```typescript
if (!this.metadata.validated.value) {
    validated = false;
    this.validationMessages.push(
        this.metadata.validatedMessage.value || 
        `${this.metadata.propertyName} is not valid.`
    );
}
```

**Ejemplo: Validar edad mínima**
```typescript
@Validation(
    (entity) => {
        if (!entity.birthDate) return true;
        const date = new Date(entity.birthDate);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age >= 18;
    },
    'Must be at least 18 years old'
)
birthDate!: string;
```

### Nivel 3: Validación Asíncrona

```typescript
const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
if (!isAsyncValid) {
    validated = false;
    const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
    if (asyncMessage) {
        this.validationMessages.push(asyncMessage);
    }
}
```

---

## Ejemplo Completo

### Definición de Entidad

 ```typescript
import { BaseEntity } from './base_entity';
import {
    PropertyName,
    PropertyIndex,
    Required,
    Validation,
    HelpText,
    ViewGroup
} from '@/decorations';

export class Employee extends BaseEntity {
    @ViewGroup('Personal Information')
    @PropertyIndex(1)
    @PropertyName('Birth Date', Date)  // ← Genera DateInputComponent
    @Required(true, 'Birth date is required')
    @HelpText('Must be at least 18 years old')
    @Validation(
        (entity) => {
            if (!entity.birthDate) return false;
            const birthDate = new Date(entity.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return age - 1 >= 18;
            }
            return age >= 18;
        },
        'Employee must be at least 18 years old'
    )
    birthDate!: string;
    
    @ViewGroup('Employment')
    @PropertyIndex(2)
    @PropertyName('Hire Date', Date)
    @Required(true)
    @Validation(
        (entity) => {
            if (!entity.hireDate) return false;
            const hireDate = new Date(entity.hireDate);
            const today = new Date();
            return hireDate <= today;
        },
        'Hire date cannot be in the future'
    )
    hireDate!: string;
}
```

### UI Generada

```
┌─────────────────────────────────────┐
│ Personal Information                │
│ ┌─────────────────────────────────┐ │
│ │ Birth Date                      │ │
│ │ ┌─────────────────────────┬───┐│ │
│ │ │ 15/03/1990              │📅 ││ │
│ │ └─────────────────────────┴───┘│ │
│ │ Must be at least 18 years old  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Employment                          │
│ ┌─────────────────────────────────┐ │
│ │ Hire Date                       │ │
│ │ ┌─────────────────────────┬───┐│ │
│ │ │ 01/01/2025              │📅 ││ │
│ │ └─────────────────────────┴───┘│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Buenas Prácticas

### ✅ DO:

```typescript
// Validar rango de fechas
@Validation(
    (entity) => {
        const start = new Date(entity.startDate);
        const end = new Date(entity.endDate);
        return end >= start;
    },
    'End date must be after start date'
)
endDate!: string;

// Validar edad mínima
@Validation(
    (entity) => {
        const age = calculateAge(entity.birthDate);
        return age >= 18;
    },
    'Must be 18 or older'
)
birthDate!: string;

// Usar help text descriptivo
@HelpText('Select the date when the contract starts')
startDate!: string;
```

### ❌ DON'T:

```typescript
// No usar String para fechas
@PropertyName('Birth Date', String)  // ❌ Incorrecto
birthDate!: string;

// Usar Date:
@PropertyName('Birth Date', Date)  // ✅ Correcto
birthDate!: string;

// No omitir validación de rangos
@PropertyName('End Date', Date)  // ❌ Sin validación
endDate!: string;
```

---

## Casos de Uso Comunes

### 1. Fecha de Nacimiento

```typescript
@PropertyName('Birth Date', Date)
@Required(true)
@Validation(
    (entity) => calculateAge(entity.birthDate) >= 18,
    'Must be at least 18 years old'
)
birthDate!: string;
```

### 2. Rango de Fechas

```typescript
@PropertyName('Start Date', Date)
@Required(true)
startDate!: string;

@PropertyName('End Date', Date)
@Required(true)
@Validation(
    (entity) => new Date(entity.endDate) >= new Date(entity.startDate),
    'End date must be after start date'
)
endDate!: string;
```

### 3. Fecha Futura (Reservas)

```typescript
@PropertyName('Reservation Date', Date)
@Required(true)
@Validation(
    (entity) => new Date(entity.reservationDate) > new Date(),
    'Reservation must be in the future'
)
reservationDate!: string;
```

---

## Referencias

- **TextInputComponent:** [text-input-component.md](text-input-component.md)
- **Validation Decorator:** `../01-decorators/validation-decorator.md`
- **useInputMetadata:** [useInputMetadata-composable.md](useInputMetadata-composable.md)
- **Tutorial Validaciones:** `../../tutorials/02-validations.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (basado en código actual)
