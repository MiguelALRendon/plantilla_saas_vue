# Form Components Directory

## 1. Propósito

El directorio `/src/components/Form` contiene los **Atomic Input Components** del framework, implementando componentes de formulario reutilizables tipo-específicos que renderizan inputs dinámicamente basados en metadata de decoradores de BaseEntity. Cada componente en este directorio es una implementación especializada de input (text, number, boolean, date, email, password, textarea, array, object, list) con validación completa de tres niveles (required, synchronous, asynchronous), integración con `useInputMetadata` composable, y emisión de eventos v-model standard Vue 3. Estos componentes son los **building blocks** que permiten la generación automática de formularios en DefaultDetailView mediante ComponentResolverService.

**Ubicación:** `src/components/Form/`

**Nivel arquitectónico:** Layer 4 - Components Layer (Atomic Level)

**Patrón de diseño:** Type-Specific Input Components + Metadata-Driven Rendering + v-model Pattern

## 2. Alcance

### Responsabilidades

1. **Componentes de Input Tipo-Específicos:**
   - `TextInputComponent.vue` - Input text para propiedades String tipo TEXT
   - `EmailInputComponent.vue` - Input email para propiedades String tipo EMAIL
   - `PasswordInputComponent.vue` - Input password para propiedades String tipo PASSWORD
   - `TextAreaComponent.vue` - Textarea para propiedades String tipo TEXTAREA
   - `NumberInputComponent.vue` - Input number para propiedades Number
   - `DateInputComponent.vue` - Input date para propiedades Date
   - `BooleanInputComponent.vue` - Toggle button para propiedades Boolean
   - `ArrayInputComponent.vue` - Table editable para propiedades Array<T>
   - `ObjectInputComponent.vue` - Nested form para propiedades Object (BaseEntity)
   - `ListInputComponent.vue` - Autocomplete search para relaciones N:1

2. **Componentes de Agrupación:**
   - `FormGroupComponent.vue` - Agrupa inputs en secciones colapsables con header
   - `FormRowTwoItemsComponent.vue` - Layout de 2 inputs en fila horizontal
   - `FormRowThreeItemsComponent.vue` - Layout de 3 inputs en fila horizontal

3. **Integración con Metadata:**
   - Todos los input components invocan `useInputMetadata(entityClass, entity, propertyKey)`
   - Extraen: propertyName, helpText, disabled, required, validated, mask, displayFormat
   - Renderización dinámica de labels, help text, validation messages
   - Aplicación automática de estilos disabled y nonvalidated

4. **Sistema de Validación Completa:**
   - Nivel 1 - Required: Verifican `metadata.required.value` y existencia de valor
   - Nivel 2 - Sync: Verifican `metadata.validated.value` de decorador @Validation
   - Nivel 3 - Async: Ejecutan `await entity.isAsyncValidation(propertyKey)`
   - Método `isValidated(): Promise<boolean>` implementado en todos los inputs
   - Renderización de `validationMessages` array en template

5. **v-model Bidireccional:**
   - Props: `modelValue` (valor actual), `entityClass`, `entity`, `propertyKey`
   - Emit: `update:modelValue` para sincronización bidireccional
   - Computed property `value` con get/set pattern para sintaxis simplificada
   - Compatibilidad con v-model en componentes padres

6. **Barrel Export (index.ts):**
   - Exportación centralizada de todos los componentes
   - Import simplificado: `import { TextInputComponent } from '@/components/Form'`
   - Type definitions para TypeScript autocomplete

### Límites

1. **NO implementan lógica de negocio** - Solo renderizado y validación de UI
2. **NO gestionan persistencia** - BaseEntity.save() ejecuta API calls
3. **NO contienen routing** - Son inputs puros sin navegación
4. **NO deciden qué componente renderizar** - ComponentResolverService selecciona componente según type
5. **NO mantienen estado global** - Estado local limitado a valor del input
6. **NO ejecutan async operations excepto validación** - No API calls directas
7. **NO customiza rendering via props excesivos** - Metadata gobierna presentación
8. **NO son responsables de layout de formulario** - DefaultDetailView orquesta layout

## 3. Definiciones Clave

**Atomic Input Component**: Componente Vue leaf sin children components complejos que renderiza un input específico (text, number, etc.) con v-model, validación y metadata integration, actuando como building block reutilizable en formularios.

**useInputMetadata Composable**: Función composable que retorna objeto reactive con metadata extraída de decoradores de BaseEntity property (propertyName, helpText, disabled, required, validated, mask, displayFormat), consumida por todos los input components.

**Type-Specific Input**: Input component especializado para un tipo de dato específico (String, Number, Boolean, Date, Array, Object) que implementa lógica de renderizado y validación apropiada para ese tipo.

**v-model Pattern**: Patrón Vue 3 de bidireccional data binding mediante props `modelValue` y emit `update:modelValue`, implementado con computed property get/set en todos los inputs.

**Triple Level Validation**: Sistema de validación de tres niveles implementado en method `isValidated()`: 1) Required (valor existe), 2) Synchronous (validación custom sincrónica), 3) Asynchronous (validación async via API).

**ComponentResolverService**: Servicio que decide qué input component renderizar basado en property type y decoradores (e.g., type Boolean → BooleanInputComponent, type String + StringType.EMAIL → EmailInputComponent).

**FormGroupComponent**: Componente wrapper que agrupa múltiples inputs en sección colapsable con header, usado para organizar formularios complejos en secciones temáticas.

**Disabled State**: Estado read-only aplicado cuando `metadata.disabled.value` es true (decorador @Disabled), renderizando input con estilos disabled (cursor: not-allowed, opacity reducida, pointer-events: none).

## 4. Descripción Técnica

El directorio `/src/components/Form` implementa arquitectura de **componentes atómicos especializados por tipo** siguiendo patrón de single responsibility: cada componente renderiza un solo tipo de input con su lógica específica. Todos los componentes comparten estructura base:

**Props standard:**
```typescript
props: {
    entityClass: { type: Function, required: true },  // typeof BaseEntity
    entity: { type: Object, required: true },          // instance de BaseEntity
    propertyKey: { type: String, required: true },     // nombre de la propiedad
    modelValue: { required: true }                     // valor actual del input
}
```

**Setup pattern:**
```typescript
setup(props) {
    const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
    return { metadata };
}
```

**Computed value:**
```typescript
computed: {
    value: {
        get() { return this.modelValue; },
        set(val) { this.$emit('update:modelValue', val); }
    }
}
```

**Template structure:**
```vue
<div class="input-container" :class="{disabled, nonvalidated}">
    <label>{{ metadata.propertyName }}:</label>
    <input v-model="value" :disabled="metadata.disabled.value" />
    <div v-if="metadata.helpText.value" class="help-text">{{ metadata.helpText.value }}</div>
    <div v-if="validationMessages.length" class="validation-messages">
        <span v-for="msg in validationMessages">{{ msg }}</span>
    </div>
</div>
```

**Componentes especializados:**

- **TextInputComponent**: Input text con mask optional (decorador @Mask), display format (decorador @DisplayFormat), y autocomplete integration.
  
- **NumberInputComponent**: Input number con min/max validation, step configuration, y formato numérico (decimales, separadores de miles).

- **BooleanInputComponent**: Button custom con iconos CHECK/CANCEL animados mediante transform rotate, NO checkbox HTML nativo. Required valida true específicamente.

- **DateInputComponent**: Input date con min/max constraints, format configuration (DD/MM/YYYY, MM/DD/YYYY, etc.), y calendar picker integration.

- **ArrayInputComponent**: Table editable donde cada row representa un elemento del array. Soporta arrays de primitivos (string[], number[]) y arrays de objects (BaseEntity[]). Rendering inline de inputs por columna, botones add/delete row.

- **ObjectInputComponent**: Nested form que renderiza recursivamente inputs para todas las properties del objeto child (BaseEntity instance). Usa ComponentResolverService para decidir qué input renderizar por property.

- **ListInputComponent**: Autocomplete/search input para relaciones N:1 (e.g., Product.category). Ejecuta debounced search contra API, renderiza dropdown con resultados, selecciona item.

**FormGroupComponent** implementa:
```vue
<div class="form-group">
    <div class="form-group-header" @click="toggleCollapse">
        <h3>{{ title }}</h3>
        <span class="icon">{{ isCollapsed ? '▼' : '▲' }}</span>
    </div>
    <div v-show="!isCollapsed" class="form-group-body">
        <slot></slot>
    </div>
</div>
```

**FormRowTwoItemsComponent/FormRowThreeItemsComponent** implementan grid layout:
```vue
<div class="form-row-two-items">
    <slot name="item1"></slot>
    <slot name="item2"></slot>
</div>

<style scoped>
.form-row-two-items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
}
</style>
```

El archivo `index.ts` exporta todos los componentes:
```typescript
export { default as TextInputComponent } from './TextInputComponent.vue';
export { default as NumberInputComponent } from './NumberInputComponent.vue';
// ... todos los componentes
```

## 5. Flujo de Funcionamiento

**Renderizado Automático en DefaultDetailView:**
1. DefaultDetailView recibe `Application.View.value` con entity = ProductEntity
2. DefaultDetailView itera `entity.metadata.properties` (obtenido de decoradores)
3. Por cada property: `{ propertyKey: 'name', type: String, stringType: TEXT }`
4. Ejecuta `ComponentResolverService.resolveInputComponent(property)`
5. ComponentResolverService:
   - Verifica `type === String` && `stringType === TEXT`
   - Retorna `TextInputComponent`
6. DefaultDetailView renderiza dinámicamente:
   ```vue
   <component 
       :is="TextInputComponent"
       :entityClass="ProductEntity"
       :entity="productInstance"
       :propertyKey="'name'"
       v-model="productInstance.name"
   />
   ```
7. TextInputComponent:
   - Setup ejecuta `useInputMetadata(ProductEntity, productInstance, 'name')`
   - Metadata retorna { propertyName: 'Product Name', required: true, ... }
   - Template renderiza label con 'Product Name:'
   - Input bindea v-model con computed value
8. Usuario escribe "iPhone 15"
9. Input emite `update:modelValue('iPhone 15')`
10. v-model updates `productInstance.name = 'iPhone 15'`
11. Vue reactivity propaga cambio

**Validación en Save:**
1. Usuario click en "Save" button en DefaultDetailView
2. DefaultDetailView ejecuta `await entity.isValidated()`
3. BaseEntity.isValidated() itera todas las properties
4. Por cada property con input component renderizado, ejecuta `inputComponent.isValidated()`
5. TextInputComponent.isValidated():
   ```typescript
   async isValidated(): Promise<boolean> {
       let validated = true;
       this.validationMessages = [];
       
       // Level 1: Required
       if (this.metadata.required.value && !this.modelValue) {
           validated = false;
           this.validationMessages.push(this.metadata.requiredMessage.value);
       }
       
       // Level 2: Sync
       if (!this.metadata.validated.value) {
           validated = false;
           this.validationMessages.push(this.metadata.validatedMessage.value);
       }
       
       // Level 3: Async
       const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
       if (!isAsyncValid) {
           validated = false;
           this.validationMessages.push(this.entity.asyncValidationMessage(this.propertyKey));
       }
       
       return validated;
   }
   ```
6. Si validación falla, validationMessages se llena
7. Template renderiza validation-messages div con spans rojos
8. Computed isInputValidated retorna false
9. Clase nonvalidated se aplica a container
10. Usuario ve feedback visual de error

**FormGroup Collapse:**
1. DefaultDetailView usa FormGroupComponent para agrupar inputs:
   ```vue
   <FormGroupComponent title="Basic Information">
       <TextInputComponent propertyKey="name" ... />
       <TextAreaComponent propertyKey="description" ... />
   </FormGroupComponent>
   <FormGroupComponent title="Pricing">
       <NumberInputComponent propertyKey="price" ... />
       <NumberInputComponent propertyKey="cost" ... />
   </FormGroupComponent>
   ```
2. Form primero renderiza con grupos expandidos (isCollapsed: false)
3. Usuario click en header de "Pricing"
4. @click="toggleCollapse" ejecuta
5. isCollapsed = !isCollapsed → true
6. v-show="!isCollapsed" oculta form-group-body
7. CSS aplica transition para animación suave
8. Solo "Basic Information" visible

**Array Input Editing:**
1. ProductEntity tiene `tags: string[]` decorado con @PropertyName('Tags', Array)
2. ComponentResolverService resuelve ArrayInputComponent
3. ArrayInputComponent renderiza:
   ```
   ┌─────────────────────────────┐
   │ Tags:                       │
   │ ┌───────────────┬─────────┐ │
   │ │ Value         │ Actions │ │
   │ ├───────────────┼─────────┤ │
   │ │ <input "tag1">│  [🗑️]  │ │
   │ │ <input "tag2">│  [🗑️]  │ │
   │ │ <input "tag3">│  [🗑️]  │ │
   │ └───────────────┴─────────┘ │
   │ [+ Add Tag]                 │
   └─────────────────────────────┘
   ```
4. Usuario escribe "tag4" y presiona Add Tag
5. ArrayInputComponent.addItem():
   - `this.value.push('')` agrega string vacío
   - Nueva row renderiza con input vacío
6. Usuario escribe "electronics" en input
7. Input emite update:modelValue
8. ArrayInputComponent actualiza array element
9. v-model propaga: `productInstance.tags = ['tag1', 'tag2', 'tag3', 'electronics']`

**Object Input Nesting:**
1. OrderEntity tiene `customer: Customer` donde Customer extends BaseEntity
2. ComponentResolverService resuelve ObjectInputComponent
3. ObjectInputComponent:
   - Itera `Customer.metadata.properties`
   - Por cada property, renderiza input component correspondiente
   - Crea nested form:
   ```vue
   <div class="object-input">
       <h4>Customer</h4>
       <TextInputComponent propertyKey="name" :entity="customer" ... />
       <EmailInputComponent propertyKey="email" :entity="customer" ... />
       <NumberInputComponent propertyKey="age" :entity="customer" ... />
   </div>
   ```
4. Cambios en nested inputs actualizan `orderInstance.customer` properties
5. Validación se ejecuta recursivamente en save

## 6. Reglas Obligatorias

### 6.1 Uso de useInputMetadata

TODOS los input components DEBEN invocar `useInputMetadata` en setup:

```typescript
// ✅ CORRECTO
setup(props) {
    const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
    return { metadata };
}

// ❌ INCORRECTO - No usar metadata
setup(props) {
    return {};
}
```

### 6.2 Implementación de isValidated()

TODOS los input components DEBEN implementar method `isValidated(): Promise<boolean>` con triple level validation:

```typescript
// ✅ CORRECTO
async isValidated(): Promise<boolean> {
    let validated = true;
    this.validationMessages = [];
    
    // Required validation
    // Sync validation  
    // Async validation
    
    return validated;
}

// ❌ INCORRECTO - Sin validación async
isValidated(): boolean {
    return this.metadata.required.value && !!this.modelValue;
}
```

### 6.3 v-model Pattern con Computed

SIEMPRE usar computed property `value` con get/set para v-model, NO emitir directamente en @input:

```vue
<!-- ✅ CORRECTO -->
<input v-model="value" />

<script>
computed: {
    value: {
        get() { return this.modelValue; },
        set(val) { this.$emit('update:modelValue', val); }
    }
}
</script>

<!-- ❌ INCORRECTO - Emit directo -->
<input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
```

### 6.4 Props Standard

TODOS los input components DEBEN declarar props: entityClass, entity, propertyKey, modelValue:

```typescript
// ✅ CORRECTO
props: {
    entityClass: { type: Function, required: true },
    entity: { type: Object, required: true },
    propertyKey: { type: String, required: true },
    modelValue: { required: true }
}

// ❌ INCORRECTO - Props faltantes
props: {
    value: { required: true }
}
```

### 6.5 Renderizado Condicional de Help Text

SIEMPRE verificar existencia de helpText antes de renderizar:

```vue
<!-- ✅ CORRECTO -->
<div v-if="metadata.helpText.value" class="help-text">
    {{ metadata.helpText.value }}
</div>

<!-- ❌ INCORRECTO - Siempre renderiza -->
<div class="help-text">{{ metadata.helpText.value }}</div>
```

### 6.6 Aplicación de Clases Disabled y Nonvalidated

SIEMPRE aplicar clases condicionales disabled y nonvalidated a container:

```vue
<!-- ✅ CORRECTO -->
<div class="input-container" :class="{ disabled: metadata.disabled.value, nonvalidated: !isInputValidated }">

<!-- ❌ INCORRECTO - Sin clases -->
<div class="input-container">
```

### 6.7 Tokens CSS Obligatorios

TODOS los valores CSS DEBEN usar tokens de constants.css (04-UI-CONTRACT §6.4). Valores numéricos directos (1rem, 0.5s, #FF0000) están PROHIBIDOS. SIEMPRE usar var(--token-name).

## 7. Prohibiciones

1. NO emitir eventos personalizados - Solo `update:modelValue` para v-model
2. NO modificar `entity` prop directamente - Emitir update:modelValue y dejar v-model sincronizar
3. NO ejecutar API calls directamente - BaseEntity methods manejan persistencia
4. NO duplicar metadata en data - useInputMetadata retorna reactive refs
5. NO renderizar sin metadata - Todos los inputs requieren metadata de decoradores
6. NO usar v-model directamente en template con modelValue - Usar computed value
7. NO omitir async validation - isValidated() DEBE incluir await entity.isAsyncValidation()
8. NO hardcodear labels/nombres - Usar metadata.propertyName de decorador @PropertyName
9. NO aplicar disabled solo a input - Container también debe recibir clase disabled
10. NO crear custom validation logic sin decoradores - Usar @Required, @Validation, @AsyncValidation
11. NO hardcodear valores CSS - SIEMPRE usar tokens de constants.css (var(--spacing-md), var(--color-primary), etc.)

## 8. Dependencias

### Dependencias Directas

**useInputMetadata Composable:**
- `src/composables/useInputMetadata.ts`
- Retorna metadata reactive: propertyName, helpText, disabled, required, validated, mask, displayFormat
- Consultado por todos los input components en setup()

**BaseEntity:**
- `entity.isAsyncValidation(propertyKey)` - Ejecuta async validation
- `entity.asyncValidationMessage(propertyKey)` - Obtiene mensaje de async validation
- `entity.metadata.properties` - Iterable de properties con decoradores

**Decoradores Consumidos:**
- @PropertyName(name, type) - Nombre display y tipo de property
- @Required(required, message) - Si property es requerida
- @Disabled(disabled) - Si input debe ser readonly
- @HelpText(text) - Texto de ayuda mostrado debajo del input
- @Validation(fn, message) - Validación sincrónica custom
- @AsyncValidation(fn, message) - Validación asíncrona custom
- @Mask(pattern) - Máscara de input (e.g., phone, credit card)
- @DisplayFormat(format) - Formato de display (e.g., currency, percentage)

**Constants.css:**
- Todos los componentes usan tokens CSS de `src/css/constants.css`
- Variables de spacing, colores, transitions, borders, typography

### Dependencias de Vue

- `defineComponent()`, `computed()`, `ref()`, `reactive()` de Vue 3
- Props system: modelValue, entityClass, entity, propertyKey
- Emit system: update:modelValue
- Template directives: v-model, v-if, v-for, :class

### Dependencias Externas

**GGICONS (Google Icons):**
- Iconos usados en BooleanInputComponent (CHECK, CANCEL)
- Iconos en ArrayInputComponent (ADD, DELETE)
- Import desde `src/constants/ggicons.ts`

## 9. Relaciones

**Componentes Padres:**

DefaultDetailView → TextInputComponent, NumberInputComponent, etc.
ObjectInputComponent → TextInputComponent (nested inputs)
FormGroupComponent → TextInputComponent, NumberInputComponent (grouped inputs)

**Servicios Relacionados:**

ComponentResolverService → Selecciona qué input component renderizar según type
useInputMetadata composable → Provee metadata a todos los inputs

**Documentos Relacionados (Copilot):**

- `copilot/layers/04-components/form-inputs.md` - Overview de sistema de form inputs
- `copilot/layers/04-components/text-input-component.md` - Spec de TextInputComponent
- `copilot/layers/04-components/number-input-component.md` - Spec de NumberInputComponent
- `copilot/layers/04-components/boolean-input-component.md` - Spec de BooleanInputComponent
- `copilot/layers/04-components/array-input-component.md` - Spec de ArrayInputComponent
- `copilot/layers/04-components/object-input-component.md` - Spec de ObjectInputComponent
- `copilot/layers/06-composables/useInputMetadata.md` - Spec del composable de metadata

**Flujo de Datos:**

Decorators → useInputMetadata → Metadata → Input Components → v-model → Entity → BaseEntity.save() → API

## 10. Notas de Implementación

### Estructura de Archivos

```
src/components/Form/
├── index.ts                          # Barrel export de todos los componentes
├── TextInputComponent.vue            # Input text (String TEXT)
├── EmailInputComponent.vue           # Input email (String EMAIL)
├── PasswordInputComponent.vue        # Input password (String PASSWORD)
├── TextAreaComponent.vue             # Textarea (String TEXTAREA)
├── NumberInputComponent.vue          # Input number (Number)
├── DateInputComponent.vue            # Input date (Date)
├── BooleanInputComponent.vue         # Toggle button (Boolean)
├── ArrayInputComponent.vue           # Table editable (Array<T>)
├── ObjectInputComponent.vue          # Nested form (Object/BaseEntity)
├── ListInputComponent.vue            # Autocomplete (Relation N:1)
├── FormGroupComponent.vue            # Wrapper colapsable de inputs
├── FormRowTwoItemsComponent.vue      # Layout 2 items en fila
└── FormRowThreeItemsComponent.vue    # Layout 3 items en fila
```

### Import de Components

```typescript
// Via barrel export (RECOMENDADO)
import { 
    TextInputComponent,
    NumberInputComponent,
    BooleanInputComponent 
} from '@/components/Form';

// Import directo (alternativa)
import TextInputComponent from '@/components/Form/TextInputComponent.vue';
```

### Uso en DefaultDetailView

```vue
<template>
    <div class="detail-view">
        <FormGroupComponent title="Basic Information">
            <TextInputComponent 
                :entityClass="ProductEntity"
                :entity="productInstance"
                :propertyKey="'name'"
                v-model="productInstance.name"
            />
            <TextAreaComponent 
                :entityClass="ProductEntity"
                :entity="productInstance"
                :propertyKey="'description'"
                v-model="productInstance.description"
            />
        </FormGroupComponent>
        
        <FormGroupComponent title="Pricing">
            <FormRowTwoItemsComponent>
                <template #item1>
                    <NumberInputComponent 
                        :entityClass="ProductEntity"
                        :entity="productInstance"
                        :propertyKey="'price'"
                        v-model="productInstance.price"
                    />
                </template>
                <template #item2>
                    <NumberInputComponent 
                        :entityClass="ProductEntity"
                        :entity="productInstance"
                        :propertyKey="'cost'"
                        v-model="productInstance.cost"
                    />
                </template>
            </FormRowTwoItemsComponent>
        </FormGroupComponent>
        
        <BooleanInputComponent 
            :entityClass="ProductEntity"
            :entity="productInstance"
            :propertyKey="'isActive'"
            v-model="productInstance.isActive"
        />
    </div>
</template>
```

### Custom Validation Example

```typescript
// Entity con decoradores de validación
export class User extends BaseEntity {
    @PropertyName('Email', String)
    @Required(true, 'Email is required')
    @Validation(
        (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        'Email format is invalid'
    )
    @AsyncValidation(
        async (value: string) => {
            const response = await fetch(`/api/users/check-email?email=${value}`);
            const data = await response.json();
            return !data.exists;
        },
        'Email is already registered'
    )
    email!: string;
}
```

EmailInputComponent ejecutará las 3 validaciones en isValidated() automáticamente.

## 11. Referencias Cruzadas

**Contratos:**
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](../../../copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md) - §6.4 Política Anti-Hardcode
- [00-CONTRACT.md](../../../copilot/00-CONTRACT.md) - §5 Components Layer Requirements

**Componentes (Copilot):**
- [form-inputs.md](../../../copilot/layers/04-components/form-inputs.md) - Overview del sistema de inputs
- [text-input-component.md](../../../copilot/layers/04-components/text-input-component.md) - TextInputComponent spec
- [boolean-input-component.md](../../../copilot/layers/04-components/boolean-input-component.md) - BooleanInputComponent spec
- [views-overview.md](../../../copilot/layers/04-components/views-overview.md) - DefaultDetailView que usa estos inputs

**Composables:**
- [useInputMetadata.md](../../../copilot/layers/06-composables/useInputMetadata.md) - Composable de metadata

**Decoradores:**
- [property-name-decorator.md](../../../copilot/layers/01-decorators/property-name-decorator.md) - @PropertyName
- [required-decorator.md](../../../copilot/layers/01-decorators/required-decorator.md) - @Required
- [validation-decorator.md](../../../copilot/layers/01-decorators/validation-decorator.md) - @Validation
- [async-validation-decorator.md](../../../copilot/layers/01-decorators/async-validation-decorator.md) - @AsyncValidation
- [disabled-decorator.md](../../../copilot/layers/01-decorators/disabled-decorator.md) - @Disabled
- [help-text-decorator.md](../../../copilot/layers/01-decorators/help-text-decorator.md) - @HelpText

**Entidades:**
- [base-entity.md](../../../copilot/layers/02-base-entity/base-entity.md) - BaseEntity validation methods

**Ubicación del código:** `src/components/Form/`  
**Archivos:** 14 archivos Vue + 1 index.ts  
**Nivel de importancia:** CRÍTICO - Atomic building blocks del framework
