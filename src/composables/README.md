# Composables Directory

## 1. Propósito

Contiene composables Vue 3 que encapsulan lógica reutilizable con estado reactivo. Actualmente solo contiene `useInputMetadata.ts`, el composable fundamental que extrae metadata de decoradores de BaseEntity para uso en input components.

## 2. Alcance

### Responsabilidades
- `useInputMetadata.ts` - Composable que retorna metadata reactiva de una property de entity (propertyName, helpText, disabled, required, validated, mask, displayFormat)

### Límites
- NO contiene lógica de negocio
- NO ejecuta API calls
- NO modifica entity state - Solo lee metadata

## 3. Definiciones Clave

**Composable**: Función que usa Composition API de Vue 3 para encapsular y reutilizar lógica stateful.  
**useInputMetadata**: Función que recibe (entityClass, entity, propertyKey) y retorna objeto reactive con metadata extraída de decoradores.  
**Reactive Metadata**: Computed refs que actualizan automáticamente cuando decoradores cambian (ej: @Disabled reactivo).

## 4. Descripción Técnica

`useInputMetadata(entityClass, entity, propertyKey)` ejecuta reflection sobre decoradores aplicados a property, retornando objeto con:
- `propertyName`: computed(() => getPropertyName(entityClass, propertyKey))
- `helpText`: computed(() => getHelpText(entityClass, propertyKey))
- `disabled`: computed(() => isDisabled(entityClass, entity, propertyKey))
- `required`: computed(() => isRequired(entityClass, propertyKey))
- `validated`: computed(() => isValidated(entity, propertyKey))
- `mask`: computed(() => getMask(entityClass, propertyKey))
- `displayFormat`: computed(() => getDisplayFormat(entityClass, propertyKey))
- `requiredMessage`, `validatedMessage`: Mensajes custom de validación

Todos retornados como computed para reactividad automática.

## 5. Flujo de Funcionamiento

1. TextInputComponent invoca `const metadata = useInputMetadata(ProductEntity, product, 'name')`
2. useInputMetadata ejecuta reflection:
   - Lee @PropertyName('Product Name', String) → propertyName.value = 'Product Name'
   - Lee @Required(true, 'Name required') → required.value = true, requiredMessage.value = 'Name required'
   - Lee @HelpText('Enter...') → helpText.value = 'Enter...'
   - Lee @Disabled(() => false) → disabled.value = false
3. Component usa metadata en template:
   ```vue
   <label>{{ metadata.propertyName }}:</label>
   <input :disabled="metadata.disabled.value" />
   <div v-if="metadata.helpText.value">{{ metadata.helpText.value }}</div>
   ```
4. Si decorador @Disabled cambia (reactive decorator) → metadata.disabled actualiza → input re-renderiza

## 6. Reglas Obligatorias

- TODOS los input components DEBEN usar useInputMetadata
- SIEMPRE retornar metadata como reactive refs/computed
- SIEMPRE verificar nullability de valores opcionales (helpText, mask)
- NUNCA mutar values retornados - Son read-only

## 7. Prohibiciones

1. NO modificar entity desde useInputMetadata - Solo lectura
2. NO ejecutar side effects en composable - Solo computations
3. NO ignorar reactividad - todos los values deben ser computed
4. NO crear múltiples instances del composable para misma property

## 8. Dependencias

- Vue 3 - computed(), ref(), reactive()
- Decoradores - @PropertyName, @Required, @Disabled, @HelpText, @Validation, @Mask, @DisplayFormat
- BaseEntity - entity.metadata.properties reflection

## 9. Relaciones

Input Components → useInputMetadata → Decorators  
TextInputComponent, NumberInputComponent, BooleanInputComponent, etc. → todos usan useInputMetadata

Documentos: `copilot/layers/06-composables/useInputMetadata.md`

## 10. Notas de Implementación

```typescript
// useInputMetadata.ts
import { computed } from 'vue';
import type { BaseEntity } from '@/entities/base';

export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
) {
    return {
        propertyName: computed(() => getPropertyName(entityClass, propertyKey)),
        helpText: computed(() => getHelpText(entityClass, propertyKey)),
        disabled: computed(() => isDisabled(entityClass, entity, propertyKey)),
        required: computed(() => isRequired(entityClass, propertyKey)),
        validated: computed(() => isValidated(entity, propertyKey)),
        mask: computed(() => getMask(entityClass, propertyKey)),
        displayFormat: computed(() => getDisplayFormat(entityClass, propertyKey)),
        requiredMessage: computed(() => getRequiredMessage(entityClass, propertyKey)),
        validatedMessage: computed(() => getValidatedMessage(entityClass, propertyKey))
    };
}
```

Uso en componente:
```typescript
import { useInputMetadata } from '@/composables/useInputMetadata';

export default {
    props: ['entityClass', 'entity', 'propertyKey'],
    setup(props) {
        const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
        return { metadata };
    }
}
```

## 11. Referencias Cruzadas

- [useInputMetadata.md](../../../copilot/layers/06-composables/useInputMetadata.md)
- [property-name-decorator.md](../../../copilot/layers/01-decorators/property-name-decorator.md)
- [form-inputs.md](../../../copilot/layers/04-components/form-inputs.md)
- Input Components: src/components/Form/
