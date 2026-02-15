# Entidades del Sistema

## Propósito
Esta carpeta contiene todas las clases de entidades del Framework SaaS Vue. Las entidades son clases que heredan de BaseEntity y representan los modelos de datos del sistema, decoradas con metadatos que permiten la generación automática de interfaces CRUD.

## Elementos

### Entidades Base

- **[base_entity.ts](./base_entity.ts)** - Clase base abstracta que proporciona toda la lógica CRUD, validación, gestión de estado y acceso a metadatos. Toda entidad del sistema debe heredar de esta clase.

### Entidades del Sistema

- **[products.ts](./products.ts)** - Entidad de ejemplo que representa productos del sistema, demostrando uso completo de decoradores, validaciones y relaciones.

## Convenciones

Todas las entidades deben:
- Heredar de BaseEntity
- Usar decoradores para definir metadatos (@PropertyName, @Required, etc.)
- Incluir decoradores de módulo (@ModuleName, @ApiEndpoint, @Persistent)
- Definir claves primarias con @PrimaryProperty
- Definir propiedades por defecto con @DefaultProperty
- Usar el operador definite assignment (!) en todas las propiedades

## Referencias

- [BaseEntity Documentation](../../copilot/layers/02-base-entity/README.md)
- [Decorators Documentation](../../copilot/layers/01-decorators/README.md)
- [Quick Start Guide](../../copilot/03-QUICK-START.md)

## Última Actualización
15 de Febrero, 2026
