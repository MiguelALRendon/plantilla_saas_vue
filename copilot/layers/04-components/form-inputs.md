# 📝 Form Inputs Overview - Sistema de Inputs del Framework

**Referencias:**
- [text-input-component.md](text-input-component.md) - TextInputComponent
- [number-input-component.md](number-input-component.md) - NumberInputComponent
- [boolean-input-component.md](boolean-input-component.md) - BooleanInputComponent
- [object-input-component.md](object-input-component.md) - ObjectInputComponent
- [array-input-component.md](array-input-component.md) - ArrayInputComponent
- [email-input-component.md](email-input-component.md) - EmailInputComponent
- [password-input-component.md](password-input-component.md) - PasswordInputComponent
- [date-input-component.md](date-input-component.md) - DateInputComponent
- [textarea-input-component.md](textarea-input-component.md) - TextAreaComponent
- [list-input-component.md](list-input-component.md) - ListInputComponent
- [useInputMetadata-composable.md](useInputMetadata-composable.md) - Composable de metadatos
- `../../02-base-entity/metadata-access.md` - Acceso a metadatos
- `../../01-decorators/` - Decoradores que controlan los inputs

---

## 📍 Ubicación en el Código

**Carpeta:** `src/components/Form/`  
**Composable:** `src/composables/useInputMetadata.ts`

---

## 🎯 Propósito

El **sistema de inputs** proporciona componentes Vue reactivos que se generan automáticamente basándose en los metadatos de las entidades. Son la interfaz entre el usuario y los datos del modelo.

**Concepto fundamental:**  
> No escribes formularios manualmente. Los decoradores definen el comportamiento y el framework genera el input apropiado.

---

## 📦 Componentes de Input Disponibles

### Inputs Básicos

1. **TextInputComponent** - Input de texto plano
   - Archivo: `TextInputComponent.vue`
   - Para: Propiedades de tipo `String` con `StringType.TEXT`

2. **NumberInputComponent** - Input numérico con botones +/-
   - Archivo: `NumberInputComponent.vue`
   - Para: Propiedades de tipo `Number`

3. **BooleanInputComponent** - Checkbox
   - Archivo: `BooleanInputComponent.vue`
   - Para: Propiedades de tipo `Boolean`

4. **DateInputComponent** - Selector de fecha
   - Archivo: `DateInputComponent.vue`
   - Para: Propiedades de tipo `Date`

### Inputs Especializados de String

5. **EmailInputComponent** - Input de email con validación
   - Archivo: `EmailInputComponent.vue`
   - Para: `String` con `@StringTypeDef(StringType.EMAIL)`

6. **PasswordInputComponent** - Input de contraseña
   - Archivo: `PasswordInputComponent.vue`
   - Para: `String` con `@StringTypeDef(StringType.PASSWORD)`

7. **TextAreaComponent** - Área de texto multilinea
   - Archivo: `TextAreaComponent.vue`
   - Para: `String` con `@StringTypeDef(StringType.TEXTAREA)`

### Inputs Complejos

8. **ObjectInputComponent** - Input para objetos anidados
   - Archivo: `ObjectInputComponent.vue`
   - Para: Propiedades de tipo `BaseEntity`

9. **ArrayInputComponent** - Input para arrays
   - Archivo: `ArrayInputComponent.vue`
   - Para: Propiedades de tipo `Array`

10. **ListInputComponent** - Selector de lista
    - Archivo: `ListInputComponent.vue`
    - Para: Propiedades con opciones predefinidas

---

## 🧩 Anatomía Común de un Input

Todos los inputs siguen la misma estructura:

### Props

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

**Explicación:**
- `entityClass` - La clase de la entidad (ej: Product)
- `entity` - La instancia de la entidad
- `propertyKey` - El nombre de la propiedad (ej: 'name')
- `modelValue` - El valor actual (v-model)

### Setup (Composable)

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

**El composable `useInputMetadata` retorna:**
```typescript
{
    propertyName: Ref<string>,        // Nombre display
    required: Ref<boolean>,           // Si es requerido
    requiredMessage: Ref<string>,     // Mensaje de required
    validated: Ref<boolean>,          // Si pasa validación
    validatedMessage: Ref<string>,    // Mensaje de validación
    disabled: Ref<boolean>,           // Si está deshabilitado
    readonly: Ref<boolean>,           // Si es solo lectura
    helpText: Ref<string>             // Texto de ayuda
}
```

### Lifecycle Hooks

```typescript
mounted() {
    Application.eventBus.on('validate-inputs', this.handleValidation);
},
beforeUnmount() {
    Application.eventBus.off('validate-inputs', this.handleValidation);
}
```

**Funcionamiento:**
1. Al montarse, el input escucha el evento `'validate-inputs'`
2. Cuando BaseEntity llama `validateInputs()`, se emite el evento
3. Todos los inputs ejecutan su validación
4. Si alguno falla, marca `Application.View.value.isValid = false`

### Método de Validación

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

### Template Común

```vue
<template>
<div class="TextInput" :class="{
    disabled: metadata.disabled.value, 
    nonvalidated: !isInputValidated
}">
    <!-- Label -->
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>

    <!-- Input element -->
    <input 
        :id="'id-' + metadata.propertyName" 
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="$emit('update:modelValue', $event.target.value)" 
    />
    
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
</div>
</template>
```

---

## 🔄 Flujo de Datos (v-model)

```
Usuario escribe en input
    ↓
@input emite 'update:modelValue'
    ↓
v-model actualiza entity[propertyKey]
    ↓
Vue reactivity detecta cambio
    ↓
Componente se re-renderiza con nuevo valor
    ↓
entity.getDirtyState() detecta cambio
```

**Código:**
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

---

## ✅ Sistema de Validación (3 Niveles)

### Nivel 1: Required

```typescript
if (this.metadata.required.value && !this.modelValue) {
    validated = false;
    this.validationMessages.push(this.metadata.requiredMessage.value);
}
```

**Activado por:**
```typescript
@Required(true, 'Name is required')
name!: string;
```

### Nivel 2: Validación Síncrona

```typescript
if (!this.metadata.validated.value) {
    validated = false;
    this.validationMessages.push(this.metadata.validatedMessage.value);
}
```

**Activado por:**
```typescript
@Validation((entity) => entity.price > 0, 'Price must be positive')
price!: number;
```

### Nivel 3: Validación Asíncrona

```typescript
const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
if (!isAsyncValid) {
    validated = false;
    const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
    this.validationMessages.push(asyncMessage);
}
```

**Activado por:**
```typescript
@AsyncValidation(
    async (entity) => {
        return await checkEmailUnique(entity.email);
    },
    'Email already exists'
)
email!: string;
```

---

## 🎨 Estados Visuales

Cada input tiene estados CSS:

### Normal
```css
.TextInput {
    /* Estado normal */
}
```

### Disabled
```css
.TextInput.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
```

**Activado por:**
```typescript
@Disabled(true)
// o
@Disabled((entity) => entity.isLocked)
```

### Inválido
```css
.TextInput.nonvalidated {
    border-color: red;
}
```

**Activado cuando:** `isInputValidated = false`

---

## 🧪 Composable: useInputMetadata

**Archivo:** `src/composables/useInputMetadata.ts`

```typescript
import { computed } from 'vue';
import type { BaseEntity } from '@/entities/base_entitiy';

export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
) {
    return {
        propertyName: computed(() => 
            entityClass.getPropertyNameByKey(propertyKey) || propertyKey
        ),
        required: computed(() => 
            entity.isRequired(propertyKey)
        ),
        requiredMessage: computed(() => 
            entity.requiredMessage(propertyKey) || ''
        ),
        validated: computed(() => 
            entity.isValidation(propertyKey)
        ),
        validatedMessage: computed(() => 
            entity.validationMessage(propertyKey) || ''
        ),
        disabled: computed(() => 
            entity.isDisabled(propertyKey)
        ),
        readonly: computed(() => 
            entity.isReadOnly(propertyKey)
        ),
        helpText: computed(() => 
            entity.getHelpText(propertyKey) || ''
        )
    };
}
```

**Ventajas:**
- ✅ Reactividad automática
- ✅ Reutilizable en todos los inputs
- ✅ Type-safe
- ✅ Actualización automática cuando cambian metadatos

---

## 🔀 Selección Automática de Input

En `DefaultDetailView`, el framework selecciona automáticamente el input basándose en el tipo:

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

---

## 📋 Componentes de Agrupación

### FormGroupComponent

Agrupa inputs bajo un título de sección.

```vue
<FormGroupComponent title="Basic Information">
    <TextInputComponent ... />
    <NumberInputComponent ... />
</FormGroupComponent>
```

**Activado por:**
```typescript
@ViewGroup('Basic Information')
name!: string;

@ViewGroup('Basic Information')
price!: number;
```

### FormRowTwoItemsComponent

Coloca dos inputs lado a lado.

**Activado por:**
```typescript
@ViewGroupRowDecorator(ViewGroupRow.TWO_ITEMS)
firstName!: string;

@ViewGroupRowDecorator(ViewGroupRow.TWO_ITEMS)
lastName!: string;
```

### FormRowThreeItemsComponent

Coloca tres inputs lado a lado.

**Activado por:**
```typescript
@ViewGroupRowDecorator(ViewGroupRow.THREE_ITEMS)
day!: number;

@ViewGroupRowDecorator(ViewGroupRow.THREE_ITEMS)
month!: number;

@ViewGroupRowDecorator(ViewGroupRow.THREE_ITEMS)
year!: number;
```

---

## 🎓 Ejemplo Completo

### Definición de Entidad

```typescript
@ModuleName('Customers')
export class Customer extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    @HideInDetailView()
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Full Name', String)
    @ViewGroup('Personal Information')
    @Required(true, 'Name is mandatory')
    @HelpText('Enter customer full name')
    name!: string;
    
    @PropertyIndex(3)
    @PropertyName('Email', String)
    @ViewGroup('Contact')
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @AsyncValidation(
        async (entity) => await checkEmailUnique(entity.email),
        'Email already registered'
    )
    email!: string;
    
    @PropertyIndex(4)
    @PropertyName('Age', Number)
    @ViewGroup('Personal Information')
    @Validation((entity) => entity.age >= 18, 'Must be 18 or older')
    age!: number;
    
    @PropertyIndex(5)
    @PropertyName('Active', Boolean)
    active!: boolean;
}
```

### Inputs Generados Automáticamente

```vue
<!-- ID: Oculto (HideInDetailView) -->

<!-- Name: TextInputComponent -->
<div class="TextInput">
    <label>Full Name</label>
    <input type="text" v-model="customer.name" />
    <div class="help-text">Enter customer full name</div>
    <div class="validation-messages" v-if="!isValid">
        <span>Name is mandatory</span>
    </div>
</div>

<!-- Email: EmailInputComponent -->
<div class="EmailInput">
    <label>Email</label>
    <input type="email" v-model="customer.email" />
    <div class="validation-messages" v-if="!isValid">
        <span>Email already registered</span>
    </div>
</div>

<!-- Age: NumberInputComponent -->
<div class="NumberInput">
    <label>Age</label>
    <button @click="decrement">-</button>
    <input type="number" v-model="customer.age" />
    <button @click="increment">+</button>
    <div class="validation-messages" v-if="!isValid">
        <span>Must be 18 or older</span>
    </div>
</div>

<!-- Active: BooleanInputComponent -->
<div class="BooleanInput">
    <label>
        <input type="checkbox" v-model="customer.active" />
        Active
    </label>
</div>
```

---

## 📊 Lista Completa de Componentes

| Componente | Tipo | StringType | Archivo |
|------------|------|------------|---------|
| TextInputComponent | String | TEXT | TextInputComponent.vue |
| EmailInputComponent | String | EMAIL | EmailInputComponent.vue |
| PasswordInputComponent | String | PASSWORD | PasswordInputComponent.vue |
| TextAreaComponent | String | TEXTAREA | TextAreaComponent.vue |
| NumberInputComponent | Number | - | NumberInputComponent.vue |
| BooleanInputComponent | Boolean | - | BooleanInputComponent.vue |
| DateInputComponent | Date | - | DateInputComponent.vue |
| ObjectInputComponent | BaseEntity | - | ObjectInputComponent.vue |
| ArrayInputComponent | Array | - | ArrayInputComponent.vue |
| ListInputComponent | Enum/Options | - | ListInputComponent.vue |

---

## 🔗 Referencias

- **Componentes Individuales:** Ver archivos específicos en esta carpeta
- **Metadata Access:** `../../02-base-entity/metadata-access.md`
- **Decoradores:** `../../01-decorators/`
- **Default Detail View:** `../../layers/04-components/default-detail-view.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
