# Documentación de Capas del Framework

**Propósito:** Índice semántico de documentación por capa arquitectónica  
**Última Actualización:** 13 de Febrero, 2026

---

## Estructura de Capas

El framework implementa arquitectura de 5 capas con documentación específica para cada una.

```
layers/
├── 01-decorators/     → Sistema de metadatos declarativos
├── 02-base-entity/    → Motor CRUD y gestión de estado
├── 03-application/    → Orquestador global singleton
├── 04-components/     → Componentes UI generados
├── 05-advanced/       → Funcionalidades avanzadas
└── 06-composables/    → Composables Vue reutilizables
```

---

## Capa 01: Decoradores

**Carpeta:** [01-decorators/](01-decorators/)  
**Archivos:** 31 documentos  
**ID:** DEC

**Categorías:**
- Decoradores de Propiedad (11)
- Decoradores de Validación (3)
- Decoradores de UI (8)
- Decoradores de Módulo (8)
- Decoradores de API/Persistencia (4)

**Ver índice completo:** [01-decorators/README.md](01-decorators/README.md)

### Decoradores Fundamentales

| ID | Decorador | Tipo | Descripción |
|---|---|---|---|
| DEC::property-name | @PropertyName | Propiedad | Define nombre y tipo (OBLIGATORIO) |
| DEC::required | @Required | Validación | Marca campo como obligatorio |
| DEC::module-name | @ModuleName | Módulo | Nombre visible del módulo |
| DEC::api-endpoint | @ApiEndpoint | API | URL endpoint de API |
| DEC::persistent | @Persistent | API | Habilita persistencia automática |

---

## Capa 02: BaseEntity

**Carpeta:** [02-base-entity/](02-base-entity/)  
**Archivos:** 9 documentos  
**ID:** BE

**Especificaciones:**
- Arquitectura Core
- Operaciones CRUD
- Sistema de Validación
- Hooks de Ciclo de Vida
- Acceso a Metadatos
- Métodos de Persistencia
- Gestión de Estado
- Métodos Estáticos
- Metadata Adicional

**Ver índice completo:** [02-base-entity/README.md](02-base-entity/README.md)

### Métodos Críticos

| ID | Método | Tipo | Descripción |
|---|---|---|---|
| BE::save | save() | CRUD | Guardar entidad (POST/PUT) |
| BE::validate-inputs | validateInputs() | Validación | Validar todos los campos |
| BE::get-dirty-state | getDirtyState() | Estado | Detectar cambios sin guardar |
| BE::after-save | afterSave() | Hook | Callback post-guardado |

---

## Capa 03: Application

**Carpeta:** [03-application/](03-application/)  
**Archivos:** 4 documentos  
**ID:** APP

**Especificaciones:**
- Patrón Singleton
- Integración con Router
- Sistema EventBus
- Servicios de UI

**Ver índice completo:** [03-application/README.md](03-application/README.md)

### Servicios Principales

| ID | Servicio | Tipo | Descripción |
|---|---|---|---|
| APP::singleton | Application | Singleton | Instancia única global |
| APP::view | View | Estado | Vista actual del sistema |
| APP::event-bus | EventBus | Eventos | Sistema de comunicación global |
| APP::ui-services | UIServices | UI | Toasts, modales, loading |

---

## Capa 04: Components

**Carpeta:** [04-components/](04-components/)  
**Archivos:** Variable  
**ID:** COMP

**Categorías:**
- Inputs de Formulario (10+)
- Componentes Informativos
- Componentes de Modal
- Componentes de Layout
- Botones de Acción

**Documentación:** En desarrollo

### Inputs Principales

| Componente | Tipo | Uso |
|---|---|---|
| TextInputComponent | String | Input texto genérico |
| NumberInputComponent | Number | Input numérico |
| DateInputComponent | Date | Selector de fechas |
| BooleanInputComponent | Boolean | Checkbox |
| ObjectInputComponent | BaseEntity | Relación a objeto |
| ArrayInputComponent | Array | Lista de elementos |

---

## Capa 05: Advanced

**Carpeta:** [05-advanced/](05-advanced/)  
**Archivos:** Variable  
**ID:** ADV

**Contenido:**
- Enums del sistema
- Models del framework
- Router avanzado
- Types TypeScript

**Documentación:** En desarrollo

---

## Capa 06: Composables

**Carpeta:** [06-composables/](06-composables/)  
**Archivos:** Variable  
**ID:** COMPO

**Contenido:**
- Composables Vue 3
- Hooks reutilizables
- Lógica compartida

**Documentación:** En desarrollo

---

## Navegación por Concepto

### Para Crear Entidades

1. [01-decorators/property-name-decorator.md](01-decorators/property-name-decorator.md)
2. [01-decorators/required-decorator.md](01-decorators/required-decorator.md)
3. [01-decorators/module-name-decorator.md](01-decorators/module-name-decorator.md)
4. [02-base-entity/base-entity-core.md](02-base-entity/base-entity-core.md)

### Para Validar Datos

1. [01-decorators/required-decorator.md](01-decorators/required-decorator.md)
2. [01-decorators/validation-decorator.md](01-decorators/validation-decorator.md)
3. [01-decorators/async-validation-decorator.md](01-decorators/async-validation-decorator.md)
4. [02-base-entity/validation-system.md](02-base-entity/validation-system.md)

### Para Persistir Datos

1. [01-decorators/api-endpoint-decorator.md](01-decorators/api-endpoint-decorator.md)
2. [01-decorators/persistent-decorator.md](01-decorators/persistent-decorator.md)
3. [02-base-entity/crud-operations.md](02-base-entity/crud-operations.md)
4. [02-base-entity/persistence-methods.md](02-base-entity/persistence-methods.md)

### Para Personalizar UI

1. [01-decorators/view-group-decorator.md](01-decorators/view-group-decorator.md)
2. [01-decorators/help-text-decorator.md](01-decorators/help-text-decorator.md)
3. [01-decorators/module-detail-component-decorator.md](01-decorators/module-detail-component-decorator.md)

---

## Dependencias entre Capas

```
Capa 1 (Decoradores)
    ↓
Capa 2 (BaseEntity) ← lee metadatos de decoradores
    ↓
Capa 3 (Application) ← orquesta BaseEntity
    ↓
Capa 4 (Components) ← consume Application y metadatos
    ↓
Capa 5 (Advanced) ← extiende funcionalidad
```

---

## Relación con Contratos

| Capa | CORE | FWK | FLOW | UI | ENF |
|---|---|---|---|---|---|
| **Decoradores** | ✓ | ✓ | ✓ | - | ✓ |
| **BaseEntity** | ✓ | ✓ | ✓ | - | ✓ |
| **Application** | ✓ | ✓ | ✓ | - | ✓ |
| **Components** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Advanced** | ✓ | ✓ | - | - | ✓ |
| **Composables** | ✓ | ✓ | - | - | ✓ |

**Referencias:**
- **CORE:** [../00-CONTRACT.md](../00-CONTRACT.md)
- **FWK:** [../01-FRAMEWORK-OVERVIEW.md](../01-FRAMEWORK-OVERVIEW.md)
- **FLOW:** [../02-FLOW-ARCHITECTURE.md](../02-FLOW-ARCHITECTURE.md)
- **UI:** [../04-UI-DESIGN-SYSTEM-CONTRACT.md](../04-UI-DESIGN-SYSTEM-CONTRACT.md)
- **ENF:** [../05-ENFORCEMENT-TECHNICAL-CONTRACT.md](../05-ENFORCEMENT-TECHNICAL-CONTRACT.md)

---

## Índices de Carpetas

Cada carpeta de capa contiene su propio README.md con índice detallado:

- [01-decorators/README.md](01-decorators/README.md) - 31 decoradores indexados
- [02-base-entity/README.md](02-base-entity/README.md) - 9 especificaciones indexadas
- [03-application/README.md](03-application/README.md) - 4 especificaciones indexadas
- 04-components/README.md - Pendiente
- 05-advanced/README.md - Pendiente
- 06-composables/README.md - Pendiente

---

**Última Actualización:** 13 de Febrero, 2026  
**Mantenimiento:** Actualizar al agregar/modificar/eliminar archivos en capas
