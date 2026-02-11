# 🧩 ModuleDefaultComponent Decorator

**Referencias:**
- `module-list-component-decorator.md` - ModuleListComponent para vista de lista
- `module-detail-component-decorator.md` - ModuleDetailComponent para vista de detalle
- `module-custom-components-decorator.md` - ModuleCustomComponents para componentes por propiedad
- `../../03-application/application-components.md` - Sistema de componentes
- `../../02-base-entity/base-entity-core.md` - getModuleDefaultComponent() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/module_default_component_decorator.ts`

---

## 🎯 Propósito

El decorador `@ModuleDefaultComponent()` define el **componente Vue por defecto** que se usa para renderizar propiedades de una entidad cuando no hay un componente específico configurado.

**Beneficios:**
- Componente fallback personalizado
- Consistencia visual en módulo
- Simplifica configuración
- Override de componente default global

---

## 📝 Sintaxis

```typescript
import type { Component } from 'vue';

@ModuleDefaultComponent(component: Component)
export class EntityName extends BaseEntity {
    // ...
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `component` | `Component` | Sí | Componente Vue a usar por defecto |

---

## 💾 Implementación

### Código del Decorador

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

**Ubicación:** `src/decorations/module_default_component_decorator.ts` (línea ~1-20)

---

## 🔍 Metadata Storage

### Estructura en Class

```typescript
// Metadata se guarda en la clase (no en prototype)
Product[MODULE_DEFAULT_COMPONENT_KEY] = CustomTextInput;
User[MODULE_DEFAULT_COMPONENT_KEY] = StyledInput;
```

### Acceso desde BaseEntity

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

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~240-260)

---

## 🎨 Impacto en Application

### Component Resolution

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

---

## 🧪 Ejemplos de Uso

### 1. Basic Default Component

```typescript
import { ModuleDefaultComponent } from '@/decorations/module_default_component_decorator';
import { ModuleName } from '@/decorations/module_name_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';
import CustomTextInput from '@/components/Form/CustomTextInput.vue';

@ModuleName('Products')
@ModuleDefaultComponent(CustomTextInput)  // ← Todas las props usan este componente por defecto
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;  // ← Renderiza con CustomTextInput
    
    @PropertyName('SKU', String)
    sku!: string;  // ← Renderiza con CustomTextInput
    
    @PropertyName('Description', String)
    description!: string;  // ← Renderiza con CustomTextInput
}
```

---

### 2. Custom Styled Input

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

const inputId = computed(() => `input-${props.property}`);
const propertyLabel = computed(() => 
    props.entity.constructor.getPropertyName(props.property)
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
</style>
```

```typescript
// Usar StyledTextInput como default
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

---

### 3. Override Default for Specific Property

```typescript
import { ModuleDefaultComponent } from '@/decorations/module_default_component_decorator';
import { ModuleCustomComponents } from '@/decorations/module_custom_components_decorator';
import TextInput from '@/components/Form/TextInput.vue';
import NumberInput from '@/components/Form/NumberInput.vue';
import TextareaInput from '@/components/Form/TextareaInput.vue';

@ModuleName('Product')
@ModuleDefaultComponent(TextInput)  // ← Default para todas las props
@ModuleCustomComponents(new Map([
    ['price', NumberInput],           // ← Override para 'price'
    ['description', TextareaInput]    // ← Override para 'description'
]))
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;  // ← Usa TextInput (default)
    
    @PropertyName('SKU', String)
    sku!: string;  // ← Usa TextInput (default)
    
    @PropertyName('Price', Number)
    price!: number;  // ← Usa NumberInput (custom)
    
    @PropertyName('Description', String)
    description!: string;  // ← Usa TextareaInput (custom)
}
```

---

### 4. Readonly Module

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

```typescript
import ReadonlyDisplay from '@/components/Form/ReadonlyDisplay.vue';

// Módulo de solo lectura (audit logs, reports, etc.)
@ModuleName('Audit Logs')
@ModuleDefaultComponent(ReadonlyDisplay)  // ← Todo readonly
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

---

### 5. Branded Input

```vue
<!-- components/Form/BrandedInput.vue -->

<template>
  <div class="branded-input">
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
const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
}>();
</script>

<style scoped>
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

---

### 6. Dynamic Component Selection

```typescript
// Seleccionar componente default basado en configuración
import TextInput from '@/components/Form/TextInput.vue';
import StyledTextInput from '@/components/Form/StyledTextInput.vue';

const defaultComponent = Application.getConfig('theme') === 'modern' 
    ? StyledTextInput 
    : TextInput;

@ModuleName('Product')
@ModuleDefaultComponent(defaultComponent)
export class Product extends BaseEntity {
    // ...
}
```

---

### 7. Component with Validation Styling

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
    
    <!-- Validation feedback -->
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

---

### 8. Testing ModuleDefaultComponent

```typescript
describe('Product ModuleDefaultComponent', () => {
    it('should have custom default component', () => {
        const defaultComponent = Product.getModuleDefaultComponent();
        expect(defaultComponent).toBe(CustomTextInput);
    });
    
    it('should use module default component when no custom component', () => {
        const component = Application.getInputComponentForProperty(Product, 'name');
        expect(component).toBe(CustomTextInput);
    });
    
    it('should override module default with custom component', () => {
        // Assuming Product has ModuleCustomComponents for 'price'
        const component = Application.getInputComponentForProperty(Product, 'price');
        expect(component).toBe(NumberInput);  // Custom, not default
    });
});
```

---

### 9. Fallback Chain

```typescript
// Orden de resolución de componentes:
// 1. ModuleCustomComponents (property-specific)
// 2. Component by type (String → TextInput, Number → NumberInput)
// 3. ModuleDefaultComponent (module-level)
// 4. Global default (TextInput)

function getInputComponentForProperty(
    entityClass: typeof BaseEntity,
    propertyName: string
): Component {
    // 1. Custom component for property
    const customComponents = entityClass.getModuleCustomComponents();
    if (customComponents?.has(propertyName)) {
        return customComponents.get(propertyName)!;
    }
    
    // 2. Component by data type
    const propertyType = entityClass.getPropertyType(propertyName);
    if (propertyType === String) return TextInput;
    if (propertyType === Number) return NumberInput;
    if (propertyType === Boolean) return CheckboxInput;
    if (propertyType === Date) return DateInput;
    
    // 3. Module default component
    const moduleDefault = entityClass.getModuleDefaultComponent();
    if (moduleDefault) {
        return moduleDefault;
    }
    
    // 4. Global default
    return TextInput;
}
```

---

### 10. Component Library Integration

```typescript
// Usar componentes de librería UI (Element Plus, Vuetify, etc.)
import { ElInput } from 'element-plus';

@ModuleName('Product')
@ModuleDefaultComponent(ElInput)  // ← Usar Element Plus input por defecto
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Description', String)
    description!: string;
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Component Props Compatibility

```typescript
// El componente default DEBE aceptar props estándar:
// - modelValue: any
// - property: string
// - entity: BaseEntity

// ✅ BUENO: Compatible
const MyComponent = defineComponent({
    props: {
        modelValue: { required: true },
        property: { type: String, required: true },
        entity: { type: Object, required: true }
    }
});

// ❌ MALO: Props incompatibles
const IncompatibleComponent = defineComponent({
    props: {
        value: String,  // ← Debería ser 'modelValue'
        name: String    // ← Debería ser 'property'
    }
});
```

### 2. Component Registration

```typescript
// Asegurarse de que el componente esté importado/registrado
import CustomInput from '@/components/Form/CustomInput.vue';

// ✅ BUENO: Componente importado
@ModuleDefaultComponent(CustomInput)
export class Product extends BaseEntity { }

// ❌ MALO: Componente no importado
@ModuleDefaultComponent(UndefinedComponent)  // ← Error
export class Product extends BaseEntity { }
```

### 3. Type Safety

```typescript
// TypeScript verifica que sea un Component válido
import type { Component } from 'vue';
import TextInput from '@/components/Form/TextInput.vue';

const myComponent: Component = TextInput;  // ✓ Type-safe

@ModuleDefaultComponent(myComponent)
export class Product extends BaseEntity { }
```

### 4. Performance

```typescript
// ModuleDefaultComponent se resuelve UNA VEZ por clase
// No hay overhead en cada render

// El componente se cachea internamente
const cachedComponent = Product.getModuleDefaultComponent();
```

### 5. Override caution

```typescript
// ModuleDefaultComponent solo afecta propiedades SIN custom component
// ModuleCustomComponents tiene mayor prioridad

@ModuleDefaultComponent(TextInput)
@ModuleCustomComponents(new Map([
    ['price', NumberInput]  // ← price usa NumberInput, no TextInput
]))
export class Product extends BaseEntity {
    name!: string;   // ← Usa TextInput (default)
    price!: number;  // ← Usa NumberInput (custom, override default)
}
```

---

## 📚 Referencias Adicionales

- `module-custom-components-decorator.md` - Componentes personalizados por propiedad
- `module-list-component-decorator.md` - Componente para ListView
- `module-detail-component-decorator.md` - Componente para DetailView
- `../../03-application/application-components.md` - Sistema de componentes
- `../../02-base-entity/base-entity-core.md` - getModuleDefaultComponent()

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/module_default_component_decorator.ts`  
**Líneas:** ~20
