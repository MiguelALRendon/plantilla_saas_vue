# Entidades del Sistema

## 1. Propósito

Esta carpeta contiene las entidades de dominio del Framework SaaS Vue. Las entidades heredan de `BaseEntity` y concentran metadata declarativa para generación automática de vistas CRUD.

## 2. Alcance

Incluye:
- Clase base de entidades.
- Entidades concretas de ejemplo y referencia.
- Integración con decoradores de metadata.

## 3. Responsabilidades

- Modelar datos del dominio.
- Exponer metadata consumida por componentes y vistas.
- Mantener contrato de herencia con `BaseEntity`.

## 4. Inventario de Archivos

- **[base_entity.ts](./base_entity.ts)** - Clase base abstracta con lógica CRUD, validación, estado y metadata.
- **[product.ts](./product.ts)** - Entidad de ejemplo de productos con decoradores y validaciones.

## 5. Convenciones Obligatorias

Todas las entidades deben:
- Heredar de `BaseEntity`.
- Usar decoradores para metadata (`@PropertyName`, `@Required`, etc.).
- Incluir decoradores de módulo (`@ModuleName`, `@ApiEndpoint`, `@Persistent`).
- Definir clave primaria con `@PrimaryProperty`.
- Declarar defaults con `@DefaultProperty` cuando aplique.

## 6. Reglas de Implementación

- Mantener tipado explícito en propiedades y métodos públicos.
- Evitar lógica de UI dentro de entidades.
- Centralizar comportamiento transversal en `base_entity.ts`.

## 7. Integración con Framework

Las entidades alimentan:
- Resolución de formularios dinámicos.
- Vistas de listado/detalle.
- Flujo de validación y persistencia.

## 8. Validación y Calidad

- Verificar coherencia metadata ↔ decoradores.
- Confirmar compatibilidad con contratos `00-06`.
- Revisar sincronización con specs en `/copilot/layers/`.

## 9. Mantenimiento

- Actualizar este README cuando cambie inventario de entidades.
- Registrar excepciones en `copilot/EXCEPCIONES.md` si aplica.
- Registrar cambios disruptivos en `copilot/BREAKING-CHANGES.md` si aplica.

## 10. Referencias

- [BaseEntity Documentation](../../copilot/layers/02-base-entity/README.md)
- [Decorators Documentation](../../copilot/layers/01-decorators/README.md)
- [Quick Start Guide](../../copilot/03-QUICK-START.md)

## 11. Control de Cambios

- **Última actualización:** 17 de Febrero, 2026
- **Estado:** Activo
