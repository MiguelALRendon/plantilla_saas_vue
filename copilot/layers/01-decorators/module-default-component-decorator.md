# ModuleDefaultComponent Decorator

## 1. Propósito

El decorador `@ModuleDefaultComponent` define el componente Vue por defecto que el sistema utiliza para renderizar TODAS las propiedades de un módulo cuando no existe un componente personalizado específico configurado para esa propiedad. Este decorador permite establecer un fallback personalizado a nivel de módulo que proporciona consistencia visual y funcional en toda la interfaz de entrada de datos del módulo, funcionando como una capa intermedia en la cadena de resolución de componentes del framework.

La precedencia de este decorador es media: tiene menor prioridad que `@ModuleCustomComponents` (que define componentes específicos por propiedad y tiene la máxima prioridad), pero mayor prioridad que los componentes basados en tipos del framework (como TextInput para String, NumberInput para Number, que tienen la mínima prioridad). Esto significa que cuando DetailView necesita renderizar un campo de entrada, primero busca un componente custom para esa propiedad específica; si no lo encuentra, verifica el tipo de dato y busca el componente correspondiente; si no hay match por tipo, recurre al componente default del módulo definido por este decorador; y finalmente, si tampoco existe, usa el fallback global del framework (TextInput).

Los casos de uso principales incluyen: branded inputs que mantienen identidad visual corporativa módulo por módulo con iconos y estilos únicos, aplicación de temas consistentes donde todos los campos de un módulo comparten estilos personalizados (bordes, colores, tipografía), módulos de solo lectura donde todas las propiedades se visualizan sin edición (audit logs, reportes, vistas de análisis), inputs especializados con validación inline y feedback visual inmediato para mejorar experiencia del usuario, y override selectivo de componentes tipo-based del framework cuando se requiere funcionalidad adicional o estilos específicos sin modificar componente por componente. El decorador simplifica la configuración al eliminar la necesidad de especificar el mismo componente repetidamente para cada propiedad individual, centralizando la definición de interfaz de entrada a nivel de módulo.

## 2. Alcance

### Responsabilidades

- Definir el componente Vue default que se aplica a TODAS las propiedades del módulo cuando no existe un custom component específico configurado para la propiedad individual
- Almacenar la referencia al componente en metadata usando el Symbol `MODULE_DEFAULT_COMPONENT_KEY` a nivel de clase para acceso eficiente durante resolución de componentes
- Proporcionar el accessor `getModuleDefaultComponent()` tanto estático como de instancia en BaseEntity para consultar el componente default del módulo desde cualquier contexto
- Integrarse con DetailView en la cadena de resolución de componentes con precedencia media, funcionando como fallback después de ModuleCustomComponents y Type-based pero antes del fallback global
- Servir como fallback personalizado cuando no hay componente custom específico ni match por tipo de dato, garantizando consistencia visual módulo por módulo

### Límites

- No proporciona control a nivel de propiedad individual; para customización granular property-specific se debe usar `@ModuleCustomComponents` que tiene mayor precedencia y permite definir componentes diferentes por propiedad
- No afecta la renderización de ListView; el componente default solo aplica a DetailView para edición de datos en formularios, ListView utiliza su propio sistema de renderización de celdas de tabla
- No realiza validación de datos ni aplica reglas de negocio; el componente es responsable únicamente de UI y entrada, la validación se maneja con `@Validation` y `@AsyncValidation` decorators
- No permite componentes dinámicos en runtime; el componente es estático definido en design-time como metadata inmutable de la clase, no se puede cambiar basado en estado o condiciones durante ejecución
- No controla permisos ni visibilidad de campos; el acceso y autorización se maneja con `@ModulePermission` y otros decorators de seguridad como responsabilidades separadas
- No elimina ni bypasea los componentes Type-based del framework; estos siguen siendo parte de la cadena de resolución como fallback con menor prioridad, respetando el orden de precedencia

## 3. Definiciones Clave

### MODULE_DEFAULT_COMPONENT_KEY

Symbol único que identifica la metadata del componente default del módulo. Se almacena a nivel de clase (no en prototype) como `Product[MODULE_DEFAULT_COMPONENT_KEY] = CustomTextInput`. Este Symbol proporciona el access point para consultar el componente default desde los accessors de BaseEntity y desde el sistema de resolución de componentes en Application/DetailView.

### Component Resolution Chain

Cadena de resolución de componentes con orden de precedencia determinístico cuando DetailView necesita renderizar un campo de entrada:

1. **ModuleCustomComponents** (Highest Priority - Property-Specific): Busca primero si existe un componente custom para la propiedad específica usando `entityClass.getModuleCustomComponents()?.get(propertyName)`. Si existe, lo usa inmediatamente sin continuar la cadena.

2. **Type-based Components** (Middle Priority - Framework Defaults): Si no hay custom component, verifica el tipo de dato de la propiedad con `entityClass.getPropertyType(propertyName)` y busca el componente correspondiente del framework: String → TextInput, Number → NumberInput, Boolean → CheckboxInput, Date → DateInput. Si hay match, lo usa.

3. **ModuleDefaultComponent** (Middle Priority - Module Fallback): Si no hay custom component ni match por tipo, recurre al componente default del módulo usando `entityClass.getModuleDefaultComponent()`. Si existe, lo usa como fallback module-wide.

4. **Global Fallback** (Lowest Priority): Si ninguno de los anteriores existe, usa TextInput como fallback global del framework que garantiza rendering siempre.

### getModuleDefaultComponent()

Accessor estático definido en BaseEntity que retorna el componente default del módulo o `undefined` si no está configurado. Implementación: `return (this as any)[MODULE_DEFAULT_COMPONENT_KEY]`. También existe versión de instancia que delega al método estático: `constructor.getModuleDefaultComponent()`. Permite consultar el componente desde cualquier contexto (clase o instancia) durante la resolución de componentes en DetailView.

### v-model Contract

Contrato estándar de Vue que TODOS los componentes default DEBEN implementar para bidirectional binding: aceptar prop `modelValue` de tipo `any` que recibe el valor actual de la propiedad, y emitir evento `update:modelValue` con el nuevo valor cuando el usuario modifica el input. El framework integra automáticamente estos componentes con `<component :is="component" v-model="entity[propertyName]" />`, por lo que el cumplimiento del contrato v-model es obligatorio para funcionamiento correcto.

### Property Props

Props adicionales que el componente default recibe para proporcionar contexto durante renderización: `:property="propertyName"` (string con el nombre de la propiedad) y `:entity="entityInstance"` (la instancia completa de BaseEntity). Estos props son opcionales pero permiten al componente acceder a metadata adicional como `entity.constructor.getPropertyName(propertyName)` para labels, `entity.getDisplayValue(propertyName)` para formateo, y validadores para feedback visual inline.

### CustomTextInput / StyledTextInput / BrandedInput

Ejemplos de componentes default comúnmente usados: **CustomTextInput** proporciona input básico con estilos personalizados consistentes, margins, padding, bordes y colores específicos del módulo; **StyledTextInput** aplica estilos avanzados con labels en color brand, transiciones smooth en focus, box-shadow y tipografía custom para UI premium; **BrandedInput** integra iconos de marca (logo empresa, iconos específicos del módulo) con el input field para reforzar identidad visual corporativa y contexto del módulo.


## 4. Descripción Técnica

### Implementación del Decorador

```typescript
// src/decorations/module_default_component_decorator.ts

import type { Component } from 'vue';

/**
 * Symbol para almacenar metadata de module default component
 */
export const MODULE_DEFAULT_COMPONENT_KEY = Symbol('module_default_component');

/**
 * @ModuleDefaultComponent() - Define componente Vue por defecto para propiedades
 * 
 * @param component - Componente Vue
 * @returns ClassDecorator
 */
export function ModuleDefaultComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_DEFAULT_COMPONENT_KEY] = component;
    };
}
```

La función decoradora recibe un parámetro `component` de tipo `Component` (tipo de Vue para componentes SFC) y retorna un `ClassDecorator` que se ejecuta cuando TypeScript procesa la clase decorada. La implementación almacena directamente la referencia al componente en la clase target usando el Symbol como key: `(target as any)[MODULE_DEFAULT_COMPONENT_KEY] = component`. No hay conversión ni procesamiento adicional, solo storage directo de la referencia para acceso posterior.

### Metadata Storage

```typescript
// Metadata se guarda en la clase (no en prototype)
Product[MODULE_DEFAULT_COMPONENT_KEY] = CustomTextInput;
User[MODULE_DEFAULT_COMPONENT_KEY] = StyledInput;
Customer[MODULE_DEFAULT_COMPONENT_KEY] = BrandedInput;
```

El componente default se almacena a nivel de clase como propiedad directa usando el Symbol como key. Esta estructura permite que cada entidad tenga su propio componente default independiente de otras entidades. El acceso es O(1) mediante el Symbol key.

### BaseEntity Accessors

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el componente default del módulo
 * 
 * @returns Componente Vue o undefined
 */
public static getModuleDefaultComponent(): Component | undefined {
    return (this as any)[MODULE_DEFAULT_COMPONENT_KEY];
}

/**
 * Obtiene el componente default (método de instancia)
 */
public getModuleDefaultComponent(): Component | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getModuleDefaultComponent();
}
```

BaseEntity proporciona dos accessors: el método estático accede directamente a la metadata de la clase usando el Symbol key y retorna `Component | undefined`; el método de instancia delega al método estático obteniendo el constructor de la instancia y llamando a su método estático. Esto permite consultar el componente tanto desde contexto de clase (`Product.getModuleDefaultComponent()`) como desde instancia (`productInstance.getModuleDefaultComponent()`).

Ubicación: líneas ~240-260 de `src/entities/base_entitiy.ts`.

### DetailView Integration

```typescript
// src/models/application.ts

export class Application {
    /**
     * Determina qué componente usar para una propiedad
     */
    public static getInputComponentForProperty(
        entityClass: typeof BaseEntity,
        propertyName: string
    ): Component {
        // 1. Componente custom por propiedad (mayor prioridad)
        const customComponents = entityClass.getModuleCustomComponents();
        if (customComponents?.has(propertyName)) {
            return customComponents.get(propertyName)!;
        }
        
        // 2. Componente por tipo de dato
        const propertyType = entityClass.getPropertyType(propertyName);
        const componentByType = this.getComponentByType(propertyType);
        if (componentByType) {
            return componentByType;
        }
        
        // 3. Componente default del módulo
        const moduleDefaultComponent = entityClass.getModuleDefaultComponent();
        if (moduleDefaultComponent) {
            return moduleDefaultComponent;
        }
        
        // 4. Componente default global
        return TextInput;  // Fallback final
    }
}
```

DetailView utiliza el método `getInputComponentForProperty` del singleton Application para resolver qué componente renderizar para cada propiedad durante la construcción del formulario. La lógica implementa la cadena de precedencia: primero verifica ModuleCustomComponents usando `getModuleCustomComponents()?.has(propertyName)`, si existe retorna inmediatamente; segundo obtiene el tipo con `getPropertyType(propertyName)` y busca componente por tipo con `getComponentByType(propertyType)` que retorna TextInput para String, NumberInput para Number, CheckboxInput para Boolean, DateInput para Date; tercero consulta el componente default del módulo con `getModuleDefaultComponent()` y lo usa como fallback module-wide si existe; cuarto retorna TextInput como fallback global absoluto que garantiza rendering siempre.

El componente resuelto se renderiza dinámicamente con: `<component :is="resolvedComponent" v-model="entity[propertyName]" :property="propertyName" :entity="entity" />`.

### Ejemplos de Implementación

#### CustomTextInput Component

```vue
<!-- components/Form/CustomTextInput.vue -->

<template>
  <div class="custom-input-container">
    <label :for="inputId" class="custom-label">
      {{ propertyLabel }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="localValue"
      type="text"
      class="custom-input"
      :placeholder="placeholder"
    />
    
    <p v-if="helpText" class="help-text">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const localValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value)
});

const inputId = computed(() => `input-${props.property}`);
const propertyLabel = computed(() => 
    props.entity.constructor.getPropertyName(props.property)
);
const isRequired = computed(() => 
    props.entity.constructor.isRequired(props.property)
);
const helpText = computed(() => 
    props.entity.constructor.getHelpText(props.property)
);
</script>

<style scoped>
.custom-input-container {
    margin-bottom: 20px;
}

.custom-label {
    display: block;
    font-weight: 600;
    color: #2563eb;
    margin-bottom: 8px;
}

.required {
    color: #ef4444;
    margin-left: 4px;
}

.custom-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.custom-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.help-text {
    font-size: 14px;
    color: #6b7280;
    margin-top: 4px;
}
</style>
```

Uso en entidad:

```typescript
import { ModuleDefaultComponent } from '@/decorations/module_default_component_decorator';
import { ModuleName } from '@/decorations/module_name_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';
import CustomTextInput from '@/components/Form/CustomTextInput.vue';

@ModuleName('Products')
@ModuleDefaultComponent(CustomTextInput)
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;  // Renderiza con CustomTextInput
    
    @PropertyName('SKU', String)
    sku!: string;  // Renderiza con CustomTextInput
    
    @PropertyName('Description', String)
    description!: string;  // Renderiza con CustomTextInput
}
```

#### StyledTextInput Component

```vue
<!-- components/Form/StyledTextInput.vue -->

<template>
  <div class="styled-input-container">
    <label :for="inputId" class="styled-label">
      {{ propertyLabel }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="localValue"
      type="text"
      class="styled-input"
      :placeholder="placeholder"
    />
    
    <p v-if="helpText" class="help-text">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const localValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value)
});

const inputId = computed(() => `input-${props.property}`);
const propertyLabel = computed(() => 
    props.entity.constructor.getPropertyName(props.property)
);
const isRequired = computed(() => 
    props.entity.constructor.isRequired(props.property)
);
const helpText = computed(() => 
    props.entity.constructor.getHelpText(props.property)
);
</script>

<style scoped>
.styled-input-container {
    margin-bottom: 20px;
}

.styled-label {
    display: block;
    font-weight: 600;
    color: #2563eb;
    margin-bottom: 8px;
}

.required {
    color: #ef4444;
}

.styled-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.styled-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.help-text {
    font-size: 14px;
    color: #6b7280;
    margin-top: 4px;
}
</style>
```

Uso:

```typescript
import StyledTextInput from '@/components/Form/StyledTextInput.vue';

@ModuleName('Customer')
@ModuleDefaultComponent(StyledTextInput)
export class Customer extends BaseEntity {
    @PropertyName('Full Name', String)
    fullName!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    @PropertyName('Phone', String)
    phone!: string;
}
```

#### BrandedInput Component

```vue
<!-- components/Form/BrandedInput.vue -->

<template>
  <div class="branded-input">
    <label class="branded-label">{{ propertyLabel }}</label>
    
    <div class="input-wrapper">
      <span class="brand-icon">🏢</span>
      <input
        v-model="localValue"
        type="text"
        :placeholder="placeholder"
        class="branded-field"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const localValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value)
});

const propertyLabel = computed(() => 
    props.entity.constructor.getPropertyName(props.property)
);
</script>

<style scoped>
.branded-input {
    margin-bottom: 20px;
}

.branded-label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
}

.input-wrapper {
    display: flex;
    align-items: center;
    border: 2px solid #10b981;
    border-radius: 8px;
    padding: 8px 12px;
    background: white;
}

.brand-icon {
    margin-right: 8px;
    font-size: 20px;
}

.branded-field {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
}
</style>
```

Uso:

```typescript
import BrandedInput from '@/components/Form/BrandedInput.vue';

@ModuleName('Company')
@ModuleDefaultComponent(BrandedInput)
export class Company extends BaseEntity {
    @PropertyName('Company Name', String)
    name!: string;
    
    @PropertyName('Industry', String)
    industry!: string;
}
```

#### ReadonlyDisplay Component

```vue
<!-- components/Form/ReadonlyDisplay.vue -->

<template>
  <div class="readonly-display">
    <label class="readonly-label">
      {{ propertyLabel }}
    </label>
    <div class="readonly-value">
      {{ displayValue }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    modelValue: any;
    property: string;
    entity: BaseEntity;
}>();

const propertyLabel = computed(() => 
    props.entity.constructor.getPropertyName(props.property)
);

const displayValue = computed(() => {
    return props.entity.getDisplayValue(props.property);
});
</script>

<style scoped>
.readonly-display {
    margin-bottom: 16px;
}

.readonly-label {
    display: block;
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
    margin-bottom: 4px;
}

.readonly-value {
    font-size: 16px;
    color: #111827;
    font-weight: 400;
}
</style>
```

Uso en módulo de solo lectura:

```typescript
import ReadonlyDisplay from '@/components/Form/ReadonlyDisplay.vue';

@ModuleName('Audit Logs')
@ModuleDefaultComponent(ReadonlyDisplay)
export class AuditLog extends BaseEntity {
    @PropertyName('Log ID', Number)
    id!: number;
    
    @PropertyName('Action', String)
    action!: string;
    
    @PropertyName('User', String)
    user!: string;
    
    @PropertyName('Timestamp', Date)
    timestamp!: Date;
}
```

#### ValidatedInput Component

```vue
<!-- components/Form/ValidatedInput.vue -->

<template>
  <div class="validated-input">
    <label>{{ propertyLabel }}</label>
    
    <input
      v-model="localValue"
      :class="inputClass"
      @blur="validateField"
    />
    
    <div v-if="isValid" class="success-message">
      ✓ Valid
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const localValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value)
});

const propertyLabel = computed(() => 
    props.entity.constructor.getPropertyName(props.property)
);

const isValid = ref(false);
const errorMessage = ref<string | null>(null);

const inputClass = computed(() => ({
    'input-field': true,
    'input-valid': isValid.value,
    'input-error': !!errorMessage.value
}));

async function validateField() {
    errorMessage.value = await props.entity.validateProperty(props.property);
    isValid.value = !errorMessage.value;
}
</script>

<style scoped>
.validated-input {
    margin-bottom: 20px;
}

.input-field {
    width: 100%;
    padding: 10px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
}

.input-valid {
    border-color: #10b981;
}

.input-error {
    border-color: #ef4444;
}

.success-message {
    color: #10b981;
    font-size: 14px;
    margin-top: 4px;
}

.error-message {
    color: #ef4444;
    font-size: 14px;
    margin-top: 4px;
}
</style>
```

Uso:

```typescript
import ValidatedInput from '@/components/Form/ValidatedInput.vue';

@ModuleName('User')
@ModuleDefaultComponent(ValidatedInput)
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Validation((value) => {
        if (value.length < 3) return 'Too short';
        return null;
    })
    username!: string;
}
```

#### Override Default for Specific Property

```typescript
import { ModuleDefaultComponent } from '@/decorations/module_default_component_decorator';
import { ModuleCustomComponents } from '@/decorations/module_custom_components_decorator';
import TextInput from '@/components/Form/TextInput.vue';
import NumberInput from '@/components/Form/NumberInput.vue';
import TextareaInput from '@/components/Form/TextareaInput.vue';

@ModuleName('Product')
@ModuleDefaultComponent(TextInput)
@ModuleCustomComponents({
    price: NumberInput,
    description: TextareaInput
})
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;  // Usa TextInput (default)
    
    @PropertyName('SKU', String)
    sku!: string;  // Usa TextInput (default)
    
    @PropertyName('Price', Number)
    price!: number;  // Usa NumberInput (custom override)
    
    @PropertyName('Description', String)
    description!: string;  // Usa TextareaInput (custom override)
}
```

## 5. Flujo de Funcionamiento

**Fase 1: Decoración (Design-Time)**

Cuando TypeScript procesa la clase decorada con `@ModuleDefaultComponent(component)`, el decorador se ejecuta inmediatamente. El decorador almacena la referencia al componente Vue en la metadata de la clase usando el Symbol `MODULE_DEFAULT_COMPONENT_KEY`: `(target as any)[MODULE_DEFAULT_COMPONENT_KEY] = component`. Esta metadata es inmutable y estática durante toda la vida de la aplicación, no se modifica en runtime.

**Fase 2: Carga de Entity Class**

Cuando la aplicación carga la clase de entidad (durante import o registro de módulos), BaseEntity proporciona los métodos accessor `getModuleDefaultComponent()` estático e de instancia que consultan la metadata almacenada. Estos métodos están disponibles para cualquier código que necesite consultar el componente default del módulo, especialmente el sistema de resolución de componentes en Application.

**Fase 3: Renderizado de DetailView**

Cuando DetailView necesita renderizar el formulario de edición de una instancia de entidad, itera sobre cada propiedad editable obtenida con `entity.getEditableProperties()`. Para cada propiedad, DetailView llama a `Application.getInputComponentForProperty(entityClass, propertyName)` para determinar qué componente Vue usar para renderizar el campo de entrada.

**Fase 4: Component Resolution con Precedencia**

El método `getInputComponentForProperty` ejecuta la cadena de resolución de componentes con precedencia determinística:

1. Verifica si existe componente custom para la propiedad específica: `customComponents = entityClass.getModuleCustomComponents(); if (customComponents?.has(propertyName)) return customComponents.get(propertyName)` - Si existe, retorna inmediatamente con highest priority.

2. Si no hay custom component, obtiene el tipo de la propiedad: `propertyType = entityClass.getPropertyType(propertyName); componentByType = getComponentByType(propertyType)` que retorna TextInput para String, NumberInput para Number, CheckboxInput para Boolean, DateInput para Date. Si hay match, retorna el componente type-based con middle priority.

3. Si no hay match por tipo, consulta el componente default del módulo: `moduleDefaultComponent = entityClass.getModuleDefaultComponent(); if (moduleDefaultComponent) return moduleDefaultComponent` - Este es el fallback module-wide con middle-low priority.

4. Si tampoco existe module default component, retorna `TextInput` como fallback global absoluto que garantiza rendering siempre.

**Fase 5: Rendering con Componente Resuelto**

DetailView renderiza el campo usando el componente resuelto: `<component :is="resolvedComponent" v-model="entity[propertyName]" :property="propertyName" :entity="entity" />`. El componente recibe el valor actual vía v-model (prop `modelValue`), el nombre de la propiedad (prop `property`), y la instancia completa de la entidad (prop `entity`) para acceder a metadata adicional. El v-model establece bidirectional binding: el componente emite `update:modelValue` cuando el usuario modifica el input, DetailView actualiza `entity[propertyName]` automáticamente.

## 6. Reglas Obligatorias

1. **Custom components MUST accept v-model contract**: Todos los componentes default definidos con este decorador DEBEN implementar el contrato v-model estándar de Vue: aceptar prop `modelValue` de tipo `any` y emitir evento `update:modelValue` con el nuevo valor. El framework integra estos componentes con `<component v-model="entity[propertyName]" />`, por lo que el cumplimiento del contrato es obligatorio para bidirectional binding correcto.

2. **Componentes default aplican module-wide a TODAS las propiedades sin custom component**: El componente default se usa para TODAS las propiedades del módulo que no tienen un custom component específico configurado con `@ModuleCustomComponents` ni match por tipo de dato. Es un fallback que afecta todas las propiedades sin configuración más específica, proporcionando consistencia visual módulo por módulo.

3. **Precedencia DEBE respetarse - chain determinístico**: El orden de resolución de componentes es estricto y NO debe bypassearse: 1) ModuleCustomComponents (highest - property-specific), 2) Type-based components (middle - framework defaults), 3) ModuleDefaultComponent (middle-low - module fallback), 4) Global fallback TextInput (lowest - always rendering). Respetar este orden garantiza comportamiento predecible y permite override selectivo sin conflictos.

4. **Component registration es obligatorio - MUST importar componente**: El componente Vue DEBE estar correctamente importado y disponible antes de usarlo en el decorador. Si se pasa un componente undefined o no registrado, causará error en runtime durante rendering. TypeScript verifica el tipo `Component`, pero no puede verificar que el import sea correcto.

5. **Lazy loading recomendado para large components**: Componentes complejos o grandes (custom WYSIWYG editors, advanced inputs con libraries externas) DEBEN usar `defineAsyncComponent(() => import('@/components/Form/LargeComponent.vue'))` para optimización de performance. Esto evita incluir componentes pesados en el bundle inicial, cargándolos solo cuando el módulo se renderiza.

6. **Testing DEBE verificar getModuleDefaultComponent y resolution chain**: Los tests unitarios DEBEN verificar: `Product.getModuleDefaultComponent()` retorna el componente esperado, `Application.getInputComponentForProperty(Product, 'propertyName')` resuelve correctamente según la cadena de precedencia (custom > type-based > module-default > global), y el rendering del componente con props correctos funciona.

## 7. Prohibiciones

1. **NO usar para customización property-specific - usar ModuleCustomComponents**: El componente default aplica a TODAS las propiedades del módulo sin distinción. Si se necesita un componente diferente para una propiedad específica, NO se debe modificar el componente default ni agregar lógica condicional interna; en su lugar, usar `@ModuleCustomComponents` que define componentes por propiedad con granularidad fina y mayor precedencia.

2. **NO afecta ListView - solo DetailView**: El componente default solo se usa en DetailView para edición de datos en formularios de entrada. NO afecta la renderización de ListView que usa su propio sistema de renderización de celdas de tabla con `getListViewProperties()` y componentes específicos de tabla. Son contextos separados con responsabilidades diferentes.

3. **NO realizar validación dentro del componente - usar decorators**: El componente NO debe implementar lógica de validación de negocio ni reglas de datos; esta responsabilidad corresponde a `@Validation` y `@AsyncValidation` decorators que definen validadores reutilizables. El componente solo renderiza UI y maneja entrada del usuario, delegando validación al sistema centralizado del framework.

4. **NO componentes dinámicos en runtime - estáticos design-time**: El componente default es metadata estática definida en design-time cuando se procesa el decorador. NO se puede cambiar basado en estado de aplicación, condiciones runtime ni props. Si se requiere comportamiento condicional, implementar la lógica dentro del componente usando computed properties o slots, NO intentar cambiar el componente default dinámicamente.

5. **NO control de permisos dentro del componente - usar ModulePermission**: El componente NO debe verificar permisos de usuario ni controlar acceso a campos. Esta responsabilidad corresponde a `@ModulePermission` decorator y al sistema de autorización del framework que oculta/deshabilita campos según permisos antes del rendering. Separación clara de responsabilidades: componente renderiza UI, framework controla acceso.

6. **NO eliminar Type-based fallback - respetar precedencia chain**: El componente default NO debe intentar bypassear ni eliminar los componentes Type-based del framework (TextInput para String, NumberInput para Number, etc.). Estos son parte integral de la cadena de resolución como fallback con menor prioridad. El orden de precedencia DEBE respetarse: custom > type-based > module-default > global. No romper esta cadena.

## 8. Dependencias e Integraciones

### BaseEntity

Importa el Symbol `MODULE_DEFAULT_COMPONENT_KEY` y proporciona los métodos accessor `getModuleDefaultComponent()` tanto estático como de instancia para consultar el componente default del módulo desde cualquier contexto. El método estático retorna directamente `(this as any)[MODULE_DEFAULT_COMPONENT_KEY]` - Component | undefined. El método de instancia delega al estático: `return (this.constructor as typeof BaseEntity).getModuleDefaultComponent()`. Estos accessors son la interface pública para consultar la metadata almacenada por el decorador. Ubicación: `src/entities/base_entitiy.ts` líneas ~240-260.

### Vue Component

El decorador recibe y almacena referencias de tipo `Component` de Vue, que puede ser un componente SFC importado directamente (`import TextInput from '@/components/Form/TextInput.vue'`) o un async component creado con `defineAsyncComponent(() => import())` para lazy loading. TypeScript verifica que el parámetro sea de tipo `Component`, proporcionando type safety en compile time. El framework Vue renderiza estos componentes dinámicamente con `<component :is="resolvedComponent" />`.

### DetailView

DetailView es el consumidor principal del componente default. Durante la construcción del formulario de edición, DetailView llama a `Application.getInputComponentForProperty(entityClass, propertyName)` para cada propiedad editable. El sistema de resolución consulta el componente default del módulo usando `entityClass.getModuleDefaultComponent()` cuando no hay custom component ni match por tipo. Luego renderiza: `<component :is="resolvedComponent" v-model="entity[propertyName]" :property="propertyName" :entity="entity" />` pasando los props necesarios para que el componente acceda a metadata y valor actual.

### ModuleCustomComponents

Decorador relacionado que define componentes custom por propiedad específica con highest priority en la cadena de resolución. ModuleCustomComponents tiene precedencia sobre ModuleDefaultComponent: si existe un custom component para una propiedad, ese se usa ignorando el module default. La coordinación es automática en `getInputComponentForProperty`: primero verifica `customComponents?.has(propertyName)`, si existe retorna custom component inmediatamente; si no existe, continúa la cadena consultando type-based y luego module default. Permiten coexistir: algunas propiedades usan custom components (override highest priority), otras usan module default (fallback module-wide).

### Type-based Components

El framework proporciona componentes basados en tipo de dato como fallback: String → TextInput, Number → NumberInput, Boolean → CheckboxInput, Date → DateInput, etc. ModuleDefaultComponent tiene precedencia dependiendo del orden de resolución: el código primero verifica custom component (highest), luego type-based component (middle), luego module default component (middle-low), finalmente global fallback (lowest). La precedencia exacta puede variar según implementación de `getInputComponentForProperty`: si se consulta type-based ANTES de module default, entonces type-based tiene mayor prioridad; si se consulta DESPUÉS, module default override type-based. Según el código de ejemplo, type-based se consulta ANTES de module default, dándole mayor prioridad a types que a module default.

### PropertyName

Decorador complementario que define el display name de propiedades y su tipo de dato. ModuleDefaultComponent trabaja sobre propiedades definidas con `@PropertyName` y otros decorators de metadata. Los componentes default acceden a esta metadata usando `entity.constructor.getPropertyName(propertyName)` para renderizar labels, `entity.constructor.getPropertyType(propertyName)` para determinar tipo, y otros accessors para metadata adicional como `isRequired`, `getHelpText`, `getValidators`. Relación simbiótica: PropertyName define las propiedades, ModuleDefaultComponent define cómo renderizarlas.

### defineAsyncComponent

Pattern de Vue para lazy loading de componentes que permite optimizar performance cargando componentes grandes solo cuando se necesitan. Para componentes default complejos se recomienda: `const LargeComponent = defineAsyncComponent(() => import('@/components/Form/LargeComponent.vue')); @ModuleDefaultComponent(LargeComponent)`. Esto reduce el initial bundle size cargando el componente solo cuando se renderiza DetailView del módulo. Especialmente útil para custom editors (WYSIWYG, markdown, code editors) que incluyen libraries externas pesadas.

### Application Singleton

El singleton Application proporciona el método `getInputComponentForProperty(entityClass, propertyName)` que implementa la lógica de resolución de componentes con la cadena de precedencia completa. Este método es el punto central de integración: consulta ModuleCustomComponents, Type-based components, ModuleDefaultComponent y Global fallback en orden, retornando el primer match encontrado. DetailView y otros componentes del framework usan este método para determinar qué componente renderizar, delegando la lógica de precedencia de manera centraliza y consistente.

## 9. Relaciones con Otros Elementos

### Con @ModuleCustomComponents

**Precedencia y Override**: ModuleCustomComponents tiene highest priority en la cadena de resolución de componentes, funcionando como override property-specific sobre ModuleDefaultComponent que es module-wide fallback. Cuando `getInputComponentForProperty` ejecuta, primero verifica `customComponents?.has(propertyName)` - si existe custom component para la propiedad específica, lo retorna inmediatamente sin consultar module default. Si NO existe custom component, continúa la cadena consultando type-based y luego module default. Esto significa que ModuleCustomComponents override ModuleDefaultComponent de manera selectiva: solo las propiedades con custom component configurado usan ese componente específico, el resto usa el module default.

**Coordinación y Coexistencia**: Ambos decorators pueden coexistir en la misma entidad sin conflictos: `@ModuleDefaultComponent(TextInput) @ModuleCustomComponents({price: NumberInput, description: TextareaInput})` - las propiedades `price` y `description` usan custom components (override highest priority), todas las demás propiedades sin custom component usan TextInput (module default fallback). Esta combinación permite granularidad fina: definir un componente default para consistencia module-wide, y overrides selectivos para propiedades que requieren componentes especializados.

### Con Type-based Components

**Precedencia en Chain**: Según la implementación de `getInputComponentForProperty` del código de ejemplo, Type-based components tienen mayor prioridad que ModuleDefaultComponent. El método primero verifica custom component (highest), luego consulta `componentByType = getComponentByType(propertyType)` que retorna TextInput para String, NumberInput para Number, CheckboxInput para Boolean, DateInput para Date; si hay match type-based, lo retorna. Solo si NO hay match por tipo, consulta `moduleDefaultComponent = getModuleDefaultComponent()`. Esto significa que Type-based components override ModuleDefaultComponent cuando hay match por tipo.

**Fallback Chain**: ModuleDefaultComponent funciona como fallback para propiedades cuyos tipos NO tienen un componente específico en el sistema Type-based. Por ejemplo, si hay un tipo personalizado `CustomType` sin componente registrado en `getComponentByType`, el sistema recurre a module default component como fallback antes del global TextInput. Esto proporciona flexibilidad: tipos comunes usan componentes framework (String → TextInput), tipos sin match usan module default, y finalmente global fallback garantiza rendering siempre.

### Con @ModuleDetailComponent

**Alcance Diferente**: ModuleDetailComponent reemplaza ENTIRE DetailView con un componente Vue custom que renderiza toda la interfaz de edición/visualización de la entidad, incluyendo layout, acciones, y todos los campos. ModuleDefaultComponent solo afecta componentes de inputs individuales para campos de entrada específicos dentro del DetailView estándar. Son diferentes niveles de granularidad: ModuleDetailComponent es view-level (entire screen), ModuleDefaultComponent es property-level (individual inputs dentro del form).

**Elección de Approach**: Si se usa `@ModuleDetailComponent` para reemplazar completamente DetailView, entonces `@ModuleDefaultComponent` NO tiene efecto porque el DetailView estándar no se renderiza - el custom DetailView es responsable de decidir qué componentes usar para cada campo internamente. La elección entre ambos depende del nivel de customización requerido: ModuleDetailComponent para control total de la vista (layout custom, tabs, secciones especiales), ModuleDefaultComponent para mantener DetailView estándar pero customizar inputs individuales (branded inputs, themed styling).

### Con @PropertyName

**Base y Foundation**: PropertyName es el decorador fundamental que define las propiedades de la entidad con su display name y tipo de dato: `@PropertyName('Product Name', String)`. ModuleDefaultComponent trabaja sobre estas propiedades definidas, proporcionando el componente UI para renderizarlas en formularios. La relación es simbiótica y secuencial: primero PropertyName define QUÉ propiedades existen y su metadata básica, luego ModuleDefaultComponent define CÓMO renderizarlas (qué componente usar para entrada). Sin PropertyName no hay propiedades que renderizar; sin ModuleDefaultComponent se usa fallback chain (type-based o global).

**Context Awareness**: Los componentes default acceden a la metadata definida por PropertyName durante rendering para mejorar UX: `entity.constructor.getPropertyName(propertyName)` obtiene el display name para labels, `entity.constructor.getPropertyType(propertyName)` obtiene el tipo para validación type-aware, `entity.constructor.isRequired(propertyName)` para mostrar indicador de requerido, etc. Esto permite que los componentes default sean genéricos y reutilizables, adaptándose a cualquier propiedad consultando su metadata en runtime.

### Con @ModuleListComponent

**Independence y Scope Separado**: ModuleListComponent define el componente Vue para renderizar ListView (tabla con listado de registros del módulo). ModuleDefaultComponent define componentes para DetailView (formulario de edición/creación). Son contextos completamente independientes con responsabilidades separadas: ListView renderiza celdas de tabla en modo lectura mostrando múltiples registros, DetailView renderiza inputs de formulario en modo edición/creación mostrando un registro. NO hay overlap ni conflicto: un módulo puede tener `@ModuleListComponent(CustomTable) @ModuleDefaultComponent(BrandedInput)` - CustomTable renderiza ListView, BrandedInput renderiza campos individuales en DetailView.

### Con defineAsyncComponent

**Lazy Loading Pattern**: defineAsyncComponent es un pattern de Vue que permite crear componentes async que se cargan solo cuando se renderizan, reduciendo initial bundle size. Para componentes default complejos se recomienda usarlo: `const LargeEditor = defineAsyncComponent(() => import('@/components/Form/LargeEditor.vue')); @ModuleDefaultComponent(LargeEditor)`. El framework maneja automáticamente el async loading mostrando un loading state mientras descarga el chunk del componente. Esto es especialmente útil para custom editors (WYSIWYG, markdown, code editors, file uploaders) que incluyen libraries externas pesadas, evitando incluirlos en el bundle inicial y cargándolos solo cuando el usuario abre DetailView del módulo.

**Integration Transparente**: Los async components creados con defineAsyncComponent son type-compatible con el tipo `Component` del decorador, por lo que la integración es transparente. El decorador no necesita saber si el componente es sync o async, simplemente lo almacena. Vue maneja el async loading durante rendering. La experiencia del usuario es smooth con loading states automáticos mientras se descarga el componente la primera vez, y luego se cachea para renders posteriores sin delay.

### Con v-model Contract

**Mandatory Compliance**: Todos los componentes default DEBEN implementar el contrato v-model de Vue: prop `modelValue` para recibir el valor actual, evento `update:modelValue` para emitir cambios. El framework integra estos componentes con `<component v-model="entity[propertyName]" />` estableciendo bidirectional binding automático. Si un componente NO implementa v-model correctamente, el binding no funciona: cambios del usuario no se propagan a la entidad, o cambios en la entidad no se reflejan en el input. Por eso el cumplimiento del contrato es obligatorio y debe verificarse en testing.

**Standard Pattern**: El v-model contract es el pattern estándar de Vue para inputs y componentes de formulario, por lo que todos los componentes de UI libraries (Element Plus, Vuetify, Quasar, etc.) ya lo implementan correctamente. Esto facilita integración: `import { ElInput } from 'element-plus'; @ModuleDefaultComponent(ElInput)` funciona inmediatamente porque ElInput cumple el contrato v-model. Para componentes custom se recomienda seguir el pattern estándar:

```typescript
const props = defineProps<{ modelValue: any }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: any): void }>();
const localValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
```

## 10. Notas de Implementación

1. **Component Resolution Order Precedencia Chain**: La cadena de resolución de componentes tiene precedencia determinística que DEBE seguirse estrictamente. Tabla de precedencia:

| Priority | Source | Method | Example | Override Behavior |
|----------|--------|--------|---------|-------------------|
| 1. Highest | ModuleCustomComponents | `customComponents?.has(propertyName)` | `@ModuleCustomComponents({price: NumberInput})` | Property-specific override, ignora defaults |
| 2. Middle | Type-based Components | `getComponentByType(propertyType)` | String → TextInput, Number → NumberInput | Framework defaults por tipo de dato |
| 3. Middle-Low | ModuleDefaultComponent | `getModuleDefaultComponent()` | `@ModuleDefaultComponent(BrandedInput)` | Module-wide fallback cuando no hay custom ni type |
| 4. Lowest | Global Fallback | `return TextInput` | TextInput siempre | Garantiza rendering, nunca return undefined |

Este orden garantiza comportamiento predecible: custom components tienen prioridad máxima para casos específicos, type-based components proveen sensible defaults para tipos comunes, module default component proporciona consistencia module-wide, y global fallback garantiza rendering siempre sin errores.

2. **v-model Contract Enforcement**: TODOS los componentes default DEBEN implementar correctamente el contrato v-model de Vue para bidirectional binding funcional. El componente DEBE aceptar prop `modelValue: any` que recibe el valor actual de `entity[propertyName]`, y DEBE emitir evento `update:modelValue` con el nuevo valor cuando el usuario modifica el input. Verificar compliance en testing: renderizar componente con valor inicial, simular cambio de usuario (input event, click, etc.), verificar que emit `update:modelValue` se llama con el nuevo valor correcto. Sin cumplimiento correcto del contrato, el binding no funciona y los cambios del usuario no se guardan en la entidad.

3. **Property Props Opcional Enhancement**: Los componentes default reciben props adicionales para contexto: `:property="propertyName"` (string) y `:entity="entityInstance"` (BaseEntity). Estos props son opcionales pero permiten al componente acceder a metadata adicional para mejorar UX: `entity.constructor.getPropertyName(propertyName)` para labels human-readable, `entity.constructor.isRequired(propertyName)` para mostrar indicador asterisco, `entity.constructor.getHelpText(propertyName)` para tooltip o help text debajo del input, `entity.getDisplayValue(propertyName)` para formateo en readonly mode, `entity.validateProperty(propertyName)` para validación inline con feedback visual. No es obligatorio usar estos props, pero enriquecen la experiencia del usuario con información contextual sin código adicional en cada uso del componente.

4. **Component Registration y Import Verification**: El componente Vue DEBE estar correctamente importado antes de usarlo en el decorador. TypeScript verifica el tipo `Component` en compile time, pero NO puede verificar que el import sea válido ni que el componente exista en runtime. Error común: olvidar importar el componente (`@ModuleDefaultComponent(UndefinedComponent)`) causa error en runtime durante rendering con mensaje "Failed to resolve component". Siempre verificar el import statement en la parte superior del archivo de entidad: `import CustomInput from '@/components/Form/CustomInput.vue'`. En tests, verificar que `Product.getModuleDefaultComponent()` retorna un object (el componente), no `undefined`.

5. **Lazy Loading Performance Optimization**: Componentes default complejos o grandes DEBEN usar `defineAsyncComponent` para lazy loading y optimización de bundle size. Pattern recomendado:

```typescript
import { defineAsyncComponent } from 'vue';

const LargeEditor = defineAsyncComponent(() => 
    import('@/components/Form/RichTextEditor.vue')
);

@ModuleDefaultComponent(LargeEditor)
export class Article extends BaseEntity { }
```

Beneficios: el código del componente (y sus dependencies como libraries externas de WYSIWYG editors, markdown parsers, code highlighters) NO se incluye en el bundle inicial de la aplicación. El chunk se descarga solo cuando el usuario abre DetailView del módulo, reduciendo tiempo de carga inicial. Vue muestra loading state automático mientras descarga. Después del primer render, el componente se cachea y renders posteriores son instantáneos. Especialmente crítico para custom editors pesados (TinyMCE, Quill, Monaco, etc.).

6. **Testing Verification Coverage**: Los tests unitarios DEBEN verificar múltiples aspectos del componente default. Test 1: `Product.getModuleDefaultComponent()` retorna el componente esperado (verificar identity con `toBe` o type con `expect(component).toBeDefined()`). Test 2: `Application.getInputComponentForProperty(Product, 'name')` resuelve correctamente según precedencia chain (si NO hay custom component ni type match especial, debe retornar module default). Test 3: Rendering del componente con props correctos funciona (`mount(resolvedComponent, { props: { modelValue: 'test', property: 'name', entity: productInstance } })` renderiza sin errores). Test 4: v-model contract funciona (simular input change, verificar emit `update:modelValue` con valor correcto). Cobertura completa garantiza correctness del componente default y su integración con el framework.

7. **CustomTextInput Example - Basic Branded Input**: Ejemplo de componente default básico con branding module-specific. Características: label con color brand (#2563eb) y font-weight 600, input con border 2px, border-radius 8px, padding 12px, transiciones smooth en focus (border-color change + box-shadow), help text opcional debajo del input en color gray (#6b7280), indicador required asterisco rojo para campos requeridos consulta `entity.constructor.isRequired(propertyName)`. Uso típico: módulos que requieren consistencia visual básica sin complejidad, branded inputs con colores corporativos, forms estándar con estilo custom pero funcionalidad normal.

8. **StyledTextInput Example - Advanced Styling**: Variación avanzada de CustomTextInput con estilos premium. Diferencias: labels con color brand más fuerte, font más grande, estados focus más prominentes con box-shadow grande rgba (0 0 0 4px), transiciones más smooth (0.3s ease), spacing más generoso (margins), tipografía custom (font-family diferente), estados hover adicionales. Uso típico: aplicaciones premium o SaaS products que requieren UI polished y profesional, módulos importantes (dashboard, configuración, perfil usuario) donde UX es crítica, temas modernos con design system comprehensive.

9. **BrandedInput Example - Icon Integration**: Componente con integración de iconos brand en el input field. Implementación: wrapper flex con align-items center, span con icono emoji o SVG (brand-icon con margin-right 8px), input field sin border interno (border en wrapper), styling del wrapper con border color brand específico (#10b981 green), background white. Uso típico: módulos de empresas o compañías donde el brand es importante visualmente, inputs con identidad corporativa fuerte (company name, industry, logo upload), aplicaciones multi-tenant donde cada tenant tiene branding diferente (iconos configurables por tenant).

10. **ReadonlyDisplay Example - View-Only Modules**: Componente para módulos de solo lectura sin edición. Diferencias: NO renderiza input, solo display div con valor formateado usando `entity.getDisplayValue(propertyName)` para aplicar `@DisplayFormat` decorator, label pequeño en gray (#6b7280) con font-size 12px y font-weight 500, valor en color oscuro (#111827) con font-size 16px normal. Uso típico: audit logs donde registros son immutable y solo se visualizan, reports y analytics donde datos son read-only, historiales de transacciones, archive modules, detail views donde ciertos campos son readonly por permisos pero otros son editables (combinar con `@ModuleCustomComponents` para mix de readonly y editable fields).

11. **ValidatedInput Example - Inline Validation Feedback**: Componente con validación inline y feedback visual inmediato. Features: input con clases dinámicas según estado (input-valid border green, input-error border red), blur event dispara `validateProperty(propertyName)` del entity, success message "✓ Valid" en green (#10b981) cuando válido, error message con texto descriptivo del error en red (#ef4444) cuando inválido, transiciones smooth entre estados. Uso típico: forms donde feedback inmediato mejora UX (registration, login, checkout), campos críticos (email, username, credit card) donde errores tempranos evitan frustración, aplicaciones donde validación server es costosa y validación client reduce calls.

## 11. Referencias Cruzadas

- **module-custom-components-decorator**: Decorador relacionado que define componentes custom por propiedad específica con highest priority en chain de resolución. ModuleCustomComponents override ModuleDefaultComponent de manera selectiva property-by-property. Coordinación: primero se consulta custom component, si no existe se usa module default. Ver sección de precedencia y override.

- **module-list-component-decorator**: Decorador para definir componente custom que renderiza ListView (tabla de listado de registros). ModuleDefaultComponent solo afecta DetailView, no ListView. Son contextos independientes y separados. ListView renderiza celdas de tabla en modo lectura, DetailView renderiza inputs en modo edición.

- **module-detail-component-decorator**: Decorador que reemplaza ENTIRE DetailView con componente Vue custom para control total de la vista. Si se usa ModuleDetailComponent, entonces ModuleDefaultComponent NO tiene efecto porque DetailView estándar no se renderiza. Elección de alcance: ModuleDetailComponent para view-level customization completa, ModuleDefaultComponent para property-level inputs customization manteniendo DetailView estándar.

- **property-name-decorator**: Decorador fundamental que define propiedades de entidad con display name y tipo. ModuleDefaultComponent trabaja sobre propiedades definidas con PropertyName, proporcionando el componente UI para renderizarlas. Relación simbiótica: PropertyName define QUÉ propiedades existen, ModuleDefaultComponent define CÓMO renderizarlas. Componentes default acceden a metadata PropertyName para labels, types, required indicator, etc.

- **base-entity-core**: Documentación del núcleo de BaseEntity incluyendo implementación de accessors `getModuleDefaultComponent()` estático e de instancia en líneas ~240-260. Estos métodos consultan la metadata almacenada por el decorador usando el Symbol MODULE_DEFAULT_COMPONENT_KEY y retornan Component | undefined. Ver detalles de implementación y uso desde contexto de clase vs instancia.

- **application-components**: Documentación del sistema de componentes de Application incluyendo el método `getInputComponentForProperty(entityClass, propertyName)` que implementa la lógica completa de resolución de componentes con cadena de precedencia. Ver detalles de cómo se consultan ModuleCustomComponents, Type-based components, ModuleDefaultComponent y Global fallback en orden determinístico.

- **Ubicación del código fuente**: `src/decorations/module_default_component_decorator.ts` (aproximadamente 20 líneas de código). Contiene la implementación del decorador ClassDecorator, export del Symbol MODULE_DEFAULT_COMPONENT_KEY, y JSDoc comments explicativos. Archivo pequeño y simple, toda la lógica de resolución está en Application.getInputComponentForProperty y BaseEntity accessors.

- **Símbolos y exports principales**: `MODULE_DEFAULT_COMPONENT_KEY` (Symbol para metadata storage), `ModuleDefaultComponent` (función decoradora ClassDecorator que recibe Component parameter), `getModuleDefaultComponent()` (accessor estático de BaseEntity que retorna Component | undefined), `getModuleDefaultComponent()` (accessor de instancia de BaseEntity que delega al método estático del constructor). Estos son los elementos públicos de la API del decorador.
