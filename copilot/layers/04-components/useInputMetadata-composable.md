# 🧩 useInputMetadata Composable

**Referencias:**
- `form-inputs.md` - Overview del sistema de inputs
- `../../02-base-entity/metadata-access.md` - Métodos de acceso a metadatos
- `../../01-decorators/` - Decoradores que genera metadatos

---

## 📍 Ubicación en el Código

**Archivo:** `src/composables/useInputMetadata.ts`

---

## 🎯 Propósito

`useInputMetadata` es el **composable central** del sistema de inputs. Proporciona acceso reactivo a los metadatos de una propiedad de entidad, extrayendo información de los decoradores aplicados.

**Concepto fundamental:**  
> Todos los inputs usan este composable para obtener su configuración (nombre, validaciones, estado disabled, help text, etc.)

---

## 📦 Interfaz del Composable

### InputMetadata Interface

```typescript
export interface InputMetadata {
    propertyName: string;                   // Nombre display de la propiedad
    required: ComputedRef<boolean>;         // Si es requerido
    disabled: ComputedRef<boolean>;         // Si está deshabilitado
    validated: ComputedRef<boolean>;        // Si pasa validación síncrona
    requiredMessage: ComputedRef<string | undefined>;   // Mensaje de required
    validatedMessage: ComputedRef<string | undefined>;  // Mensaje de validación
    helpText: ComputedRef<string | undefined>;          // Texto de ayuda
}
```

---

## 🔧 Firma de la Función

```typescript
export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entityClass` | `typeof BaseEntity` | La clase de la entidad (ej: `Product`) |
| `entity` | `BaseEntity` | La instancia de la entidad |
| `propertyKey` | `string` | Nombre de la propiedad (ej: `'name'`) |

### Retorno

Objeto `InputMetadata` con propiedades reactivas (ComputedRef).

---

## 💻 Implementación Completa

```typescript
import type { BaseEntity } from '@/entities/base_entitiy';
import { computed, type ComputedRef } from 'vue';

export interface InputMetadata {
    propertyName: string;
    required: ComputedRef<boolean>;
    disabled: ComputedRef<boolean>;
    validated: ComputedRef<boolean>;
    requiredMessage: ComputedRef<string | undefined>;
    validatedMessage: ComputedRef<string | undefined>;
    helpText: ComputedRef<string | undefined>;
}

export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata {
    // Nombre display de la propiedad
    const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;

    // Computed refs para reactividad
    const required = computed(() => entity.isRequired(propertyKey));
    const disabled = computed(() => entity.isDisabled(propertyKey));
    const validated = computed(() => entity.isValidation(propertyKey));
    const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
    const validatedMessage = computed(() => entity.validationMessage(propertyKey));
    const helpText = computed(() => entity.getHelpText(propertyKey));

    return {
        propertyName,
        required,
        disabled,
        validated,
        requiredMessage,
        validatedMessage,
        helpText,
    };
}
```

---

## 🎨 Uso en Componentes

### Setup

```typescript
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entitiy';

export default {
    name: 'TextInputComponent',
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
    },
    setup(props) {
        const metadata = useInputMetadata(
            props.entityClass, 
            props.entity, 
            props.propertyKey
        );
        
        return { metadata };
    },
}
```

### Template

```vue
<template>
<div class="TextInput" :class="{ disabled: metadata.disabled.value }">
    <!-- Usar propertyName -->
    <label>{{ metadata.propertyName }}</label>
    
    <!-- Input con disabled -->
    <input 
        type="text" 
        v-model="modelValue"
        :disabled="metadata.disabled.value"
    />
    
    <!-- Help text -->
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
    <!-- Mensajes de validación -->
    <div v-if="!metadata.validated.value || (metadata.required.value && !modelValue)">
        <span>{{ metadata.validatedMessage.value }}</span>
        <span>{{ metadata.requiredMessage.value }}</span>
    </div>
</div>
</template>
```

---

## 🔄 Flujo de Datos

```
Decoradores aplicados en entidad
    ↓
Metadatos almacenados en prototype
    ↓
useInputMetadata() extrae metadatos
    ↓
computed() crea refs reactivos
    ↓
Input usa metadata.*.value
    ↓
Vue detecta cambios automáticamente
```

---

## 📊 Mapeo Decorador → Metadata

| Decorador | Propiedad en Metadata | Método de BaseEntity |
|-----------|----------------------|---------------------|
| `@PropertyName('Name', String)` | `propertyName` | `getPropertyNameByKey()` |
| `@Required(true, 'Msg')` | `required`, `requiredMessage` | `isRequired()`, `requiredMessage()` |
| `@Disabled(true)` | `disabled` | `isDisabled()` |
| `@Validation(fn, 'Msg')` | `validated`, `validatedMessage` | `isValidation()`, `validationMessage()` |
| `@HelpText('Help')` | `helpText` | `getHelpText()` |
| `@ReadOnly(true)` | *(no incluido actualmente)* | `isReadOnly()` |

**Nota:** `readonly` no está incluido en la interfaz actual del composable, aunque el método existe en BaseEntity.

---

## ⚡ Reactividad

Todas las propiedades del metadata (excepto `propertyName`) son **ComputedRef**, lo que significa:

### ✅ Ventajas

1. **Actualización automática:** Si cambian los metadatos, el input se actualiza
2. **Performance:** Solo recalcula cuando cambian dependencias
3. **Type-safe:** TypeScript detecta errores en tiempo de compilación
4. **Cleanup automático:** Vue maneja la limpieza de watchers

### Acceso al Valor

```typescript
// ✅ Correcto - con .value
if (metadata.required.value) {
    // ...
}

// ❌ Incorrecto - sin .value (retorna ComputedRef)
if (metadata.required) {
    // Esto siempre es truthy (objeto existe)
}
```

---

## 🎓 Ejemplo Completo

### Definición de Entidad

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Customer Name', String)
    @Required(true, 'Name is mandatory')
    @HelpText('Enter the full customer name')
    @Validation((entity) => entity.name.length >= 3, 'Name must be at least 3 characters')
    @Disabled(false)
    name!: string;
}
```

### Uso del Composable

```typescript
const metadata = useInputMetadata(Customer, customerInstance, 'name');

// Acceder a valores
console.log(metadata.propertyName);                 // "Customer Name"
console.log(metadata.required.value);               // true
console.log(metadata.requiredMessage.value);        // "Name is mandatory"
console.log(metadata.helpText.value);               // "Enter the full customer name"
console.log(metadata.validated.value);              // false (si name.length < 3)
console.log(metadata.validatedMessage.value);       // "Name must be at least 3 characters"
console.log(metadata.disabled.value);               // false
```

### En Template

```vue
<template>
<div class="TextInput">
    <label>{{ metadata.propertyName }}</label>
    <!-- Muestra: "Customer Name" -->
    
    <input v-model="customer.name" :disabled="metadata.disabled.value" />
    
    <div class="help-text" v-if="metadata.helpText.value">
        {{ metadata.helpText.value }}
        <!-- Muestra: "Enter the full customer name" -->
    </div>
    
    <div class="errors" v-if="metadata.required.value && !customer.name">
        {{ metadata.requiredMessage.value }}
        <!-- Muestra: "Name is mandatory" -->
    </div>
    
    <div class="errors" v-if="!metadata.validated.value">
        {{ metadata.validatedMessage.value }}
        <!-- Muestra: "Name must be at least 3 characters" -->
    </div>
</div>
</template>
```

---

## 🔍 Debugging

### Inspeccionar Metadata

```typescript
setup(props) {
    const metadata = useInputMetadata(
        props.entityClass, 
        props.entity, 
        props.propertyKey
    );
    
    // Debug en mounted
    onMounted(() => {
        console.log('Property Name:', metadata.propertyName);
        console.log('Required:', metadata.required.value);
        console.log('Disabled:', metadata.disabled.value);
        console.log('Help Text:', metadata.helpText.value);
    });
    
    return { metadata };
}
```

### Watchers para Cambios

```typescript
watch(() => metadata.disabled.value, (newVal, oldVal) => {
    console.log(`Disabled changed from ${oldVal} to ${newVal}`);
});
```

---

## 📝 Notas Importantes

1. **No incluye ReadOnly:** Aunque `entity.isReadOnly()` existe, no está en el composable actual
2. **No incluye AsyncValidation:** Las validaciones asíncronas se manejan directamente en los inputs
3. **PropertyName es string:** No es ComputedRef porque se obtiene de la clase, no de la instancia
4. **Todos los componentes lo usan:** Es la base de todo el sistema de inputs

---

## 🔗 Referencias

- **BaseEntity Methods:** `../../02-base-entity/metadata-access.md`
- **Form Inputs:** `form-inputs.md`
- **Decoradores:** `../../01-decorators/`
- **Vue Computed:** https://vuejs.org/api/reactivity-core.html#computed

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
