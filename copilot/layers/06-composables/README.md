# Composables del Framework

## Proposito

Documentar composables de Vue 3 utilizados para encapsular lógica reactiva compartida.

## Ultima Actualizacion

16 de Febrero, 2026

## Propósito
Esta carpeta contiene documentación sobre composables de Vue 3 Composition API utilizados en el Framework SaaS Vue. Los composables son funciones reutilizables que encapsulan lógica reactiva y permiten compartir funcionalidad entre componentes.

## Elementos

### Composables Disponibles

- **[useInputMetadata.md](./useInputMetadata.md)** - Composable para acceder y gestionar metadatos de propiedades de entidades en componentes de formulario, proporcionando acceso reactivo a validaciones, requerimientos y configuración de UI.

## Enlaces Estructurados

- [Índice de Capas](../README.md)
- [Componentes](../04-components/README.md)
- [Framework Overview](../../01-FRAMEWORK-OVERVIEW.md)

## Última Actualización

16 de Febrero, 2026

## Arquitectura de Composables

Los composables del framework siguen los principios de Vue 3 Composition API:

1. **Funciones puras** que retornan refs y computed properties reactivos
2. **Reutilización de lógica** entre múltiples componentes
3. **Separación de concerns** mediante composición funcional
4. **Type safety** mediante TypeScript

## Convenciones

Todos los composables deben:
- Empezar con el prefijo `use` (ej: useInputMetadata, useValidation)
- Retornar objetos con refs y funciones reactivas
- Incluir tipos TypeScript completos
- Documentar parámetros y valores de retorno
- Seguir estructura de 11 secciones en documentación

## Uso Típico

```typescript
import { useInputMetadata } from '@/composables/useInputMetadata';

const {
    metadata,
    isRequired,
    isDisabled,
    validationMessage
} = useInputMetadata(entity, propertyKey);
```

## Referencias

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Framework Overview](../../01-FRAMEWORK-OVERVIEW.md)
- [Components Documentation](../04-components/README.md)

## Última Actualización
16 de Febrero, 2026
