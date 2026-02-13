# Índice Maestro de Documentación - Framework SaaS Vue

**Versión:** 1.0.0  
**Última actualización:** 13 de Febrero, 2026

---

## 1. Propósito

Este documento constituye el índice maestro de la documentación técnica del Framework SaaS Vue. Su función es proporcionar un punto de entrada centralizado para la navegación, búsqueda y referencia de toda la documentación del sistema. Facilita el acceso organizado a documentos fundamentales, tutoriales, guías de implementación, especificaciones de componentes y referencias de API.

El índice opera como mecanismo de localización de información técnica, permitiendo a desarrolladores identificar rápidamente recursos relevantes según contexto de desarrollo, nivel de experiencia o dominio técnico específico.

---

## 2. Alcance

### Cobertura de Documentación

**Versión del Framework:** 1.0.0  
**Documentos totales:** 31+ documentos técnicos (objetivo: 50+ documentos)  
**Última actualización del índice:** 13 de Febrero, 2026

### Áreas Documentadas

- Sistema de decoradores (31 decoradores documentados)
- Arquitectura BaseEntity (5 documentos)
- Sistema Application (4 documentos)
- Componentes de interfaz (16 componentes documentados)
- Tutoriales de implementación (3 tutoriales)
- Ejemplos de referencia (2 implementaciones completas)
- Documentos fundamentales (5 documentos: Contrato, Overview, Arquitectura, Quick Start, UI/CSS Contract)

### Documentación Reciente

- Tutorial Relaciones (objetos y arrays)
- 10 componentes de entrada (Text, Number, Boolean, Email, Password, Date, TextArea, List, Object, Array)
- Buttons Overview
- Modal Components
- DetailViewTableComponent

---

## 3. Definiciones Clave

### Decorador
Función TypeScript que modifica el comportamiento de propiedades de clase, agregando metadatos que definen validaciones, formato de UI, persistencia y comportamiento de API.

### BaseEntity
Clase base abstracta que implementa operaciones CRUD, sistema de validación, gestión de estado y ciclo de vida de entidades. Todas las entidades de dominio heredan de esta clase.

### Application
Singleton que gestiona navegación entre vistas, sistema de eventos, servicios de UI (toasts, modales, loading) e integración con router.

### Módulo
Entidad de dominio registrada en el sistema que representa una funcionalidad de negocio completa, incluyendo su modelo de datos, vistas y operaciones.

### Metadatos
Información estructurada asociada a propiedades y clases mediante decoradores, utilizada por el framework para generar UI, validar datos y gestionar persistencia.

### CRUD Operations
Operaciones básicas de persistencia: Create (POST), Read (GET), Update (PUT), Delete (DELETE), implementadas en BaseEntity mediante métodos `save()`, `getElement()`, `getElementList()`, `update()`, `delete()`.

### Lifecycle Hooks
Métodos callback ejecutados en momentos específicos del ciclo de vida de operaciones CRUD: `beforeSave()`, `onSaving()`, `afterSave()`, `saveFailed()`, `beforeUpdate()`, `onUpdating()`, `afterUpdate()`, `updateFailed()`, `beforeDelete()`, `onDeleting()`, `afterDelete()`, `deleteFailed()`.

### ViewGroup
Agrupación lógica de propiedades para organización de formularios en secciones, definida mediante decorador `@ViewGroup`.

### Persistent Entity
Entidad configurada con decorador `@Persistent` que habilita sincronización automática con backend mediante operaciones HTTP.

---

## 4. Descripción Técnica

### Arquitectura en Capas

El framework implementa arquitectura de 5 capas con responsabilidades claramente definidas:

#### Capa 1: Decoradores
Sistema de metadatos basado en decoradores TypeScript para definición declarativa de comportamiento de propiedades y módulos.

**Decoradores de Propiedades Básicas:**
- [PropertyName](layers/01-decorators/property-name-decorator.md) - Define nombre y tipo de propiedad (FUNDAMENTAL)
- [PropertyIndex](layers/01-decorators/property-index-decorator.md) - Orden de aparición en UI
- [DefaultProperty](layers/01-decorators/default-property-decorator.md) - Identificador por defecto
- [PrimaryProperty](layers/01-decorators/primary-property-decorator.md) - Clave primaria

**Decoradores de Validación:**
- [Required](layers/01-decorators/required-decorator.md) - Campo obligatorio
- [Validation](layers/01-decorators/validation-decorator.md) - Validación síncrona
- [AsyncValidation](layers/01-decorators/async-validation-decorator.md) - Validación asíncrona
- [Unique](layers/01-decorators/unique-decorator.md) - Valor único

**Decoradores de UI y Layout:**
- [ViewGroup](layers/01-decorators/view-group-decorator.md) - Agrupación de campos
- [ViewGroupRowDecorator](layers/01-decorators/view-group-row-decorator.md) - Layout de filas
- [HelpText](layers/01-decorators/help-text-decorator.md) - Texto de ayuda
- [DisplayFormat](layers/01-decorators/display-format-decorator.md) - Formato de display
- [CSSColumnClass](layers/01-decorators/css-column-class-decorator.md) - Ancho de columna
- [HideInListView / HideInDetailView](layers/01-decorators/hide-decorators.md) - Visibilidad condicional
- [TabOrder](layers/01-decorators/tab-order-decorator.md) - Orden de tabulación

**Decoradores de Estado:**
- [Disabled](layers/01-decorators/disabled-decorator.md) - Deshabilitar campo
- [ReadOnly](layers/01-decorators/readonly-decorator.md) - Solo lectura

**Decoradores de Tipos Específicos:**
- [StringTypeDef](layers/01-decorators/string-type-decorator.md) - Subtipo de string (EMAIL, PASSWORD, TEXTAREA)
- [ArrayOf](layers/01-decorators/array-of-decorator.md) - Arrays tipados
- [Mask](layers/01-decorators/mask-decorator.md) - Máscara de entrada

**Decoradores de Módulo:**
- [ModuleName](layers/01-decorators/module-name-decorator.md) - Nombre del módulo
- [ModuleIcon](layers/01-decorators/module-icon-decorator.md) - Icono
- [ModulePermission](layers/01-decorators/module-permission-decorator.md) - Permisos
- [ModuleListComponent](layers/01-decorators/module-list-component-decorator.md) - Vista lista custom
- [ModuleDetailComponent](layers/01-decorators/module-detail-component-decorator.md) - Vista detalle custom
- [ModuleDefaultComponent](layers/01-decorators/module-default-component-decorator.md) - Vista por defecto

**Decoradores de API y Persistencia:**
- [ApiEndpoint](layers/01-decorators/api-endpoint-decorator.md) - Endpoint de API
- [ApiMethods](layers/01-decorators/api-methods-decorator.md) - Métodos HTTP permitidos
- [Persistent](layers/01-decorators/persistent-decorator.md) - Habilitar persistencia
- [PersistentKey](layers/01-decorators/persistent-key-decorator.md) - Mapeo de claves

#### Capa 2: BaseEntity
Clase base abstracta que implementa lógica de entidades de dominio.

- [BaseEntity Core](layers/02-base-entity/base-entity-core.md) - Estructura fundamental
- [CRUD Operations](layers/02-base-entity/crud-operations.md) - Operaciones de persistencia
- [Validation System](layers/02-base-entity/validation-system.md) - Sistema de validación
- [Lifecycle Hooks](layers/02-base-entity/lifecycle-hooks.md) - Hooks de ciclo de vida
- [Metadata Access](layers/02-base-entity/metadata-access.md) - Acceso a metadatos

**Métodos CRUD:**
- `save()` - Guardar (POST/PUT)
- `update()` - Actualizar (PUT)
- `delete()` - Eliminar (DELETE)
- `getElementList()` - Obtener lista (GET)
- `getElement()` - Obtener uno (GET)

**Métodos de Validación:**
- `validateInputs()` - Validar todos los campos
- `isRequired()` - Verificar si campo es required
- `isValidation()` - Evaluar validación
- `isAsyncValidation()` - Evaluar async validation

**Métodos de Estado:**
- `getDirtyState()` - Verificar cambios sin guardar
- `resetChanges()` - Descartar cambios
- `isNew()` - Verificar si es nueva instancia

#### Capa 3: Application
Singleton de gestión global de aplicación.

- [Application Singleton](layers/03-application/application-singleton.md) - Singleton central
- [Router Integration](layers/03-application/router-integration.md) - Integración con router
- [Event Bus](layers/03-application/event-bus.md) - Sistema de eventos
- [UI Services](layers/03-application/ui-services.md) - Servicios de interfaz

**Métodos de Navegación:**
- `changeView()` - Cambiar vista
- `changeViewToListView()` - Ir a lista
- `changeViewToDetailView()` - Ir a detalle
- `changeViewToDefaultView()` - Ir a vista por defecto

**Métodos de UI Services:**
- `showToast()` - Mostrar notificación
- `showModal()` - Abrir modal
- `openConfirmationMenu()` - Menú de confirmación
- `showLoadingMenu()` - Mostrar loading

#### Capa 4: Components
Componentes Vue para interfaz de usuario.

**Composables:**
- [useInputMetadata](layers/04-components/useInputMetadata-composable.md) - Composable de metadatos

**Inputs de Formulario:**
- [Form Inputs Overview](layers/04-components/form-inputs.md) - Visión general
- [TextInputComponent](layers/04-components/text-input-component.md) - Input texto
- [NumberInputComponent](layers/04-components/number-input-component.md) - Input numérico
- [BooleanInputComponent](layers/04-components/boolean-input-component.md) - Input booleano
- [EmailInputComponent](layers/04-components/email-input-component.md) - Input email
- [PasswordInputComponent](layers/04-components/password-input-component.md) - Input password
- [DateInputComponent](layers/04-components/date-input-component.md) - Input fecha
- [TextAreaComponent](layers/04-components/textarea-input-component.md) - TextArea
- [ListInputComponent](layers/04-components/list-input-component.md) - Input lista
- [ObjectInputComponent](layers/04-components/object-input-component.md) - Input objeto
- [ArrayInputComponent](layers/04-components/array-input-component.md) - Input array

**Botones:**
- [Buttons Overview](layers/04-components/buttons-overview.md) - Visión general de botones

**Modales:**
- [Modal Components](layers/04-components/modal-components.md) - Componentes de modal

**Informativos:**
- [DetailViewTableComponent](layers/04-components/DetailViewTableComponent.md) - Tabla de detalle

**Layout:**
- [SideBarComponent](layers/04-components/SideBarComponent.md) - Barra lateral
- [TopBarComponent](layers/04-components/TopBarComponent.md) - Barra superior

#### Capa 5: Avanzado
Extensiones y personalización del framework.

- [Custom Components](layers/05-advanced/custom-components.md) - Componentes personalizados
- [Extending BaseEntity](layers/05-advanced/extending-base-entity.md) - Extensión de BaseEntity
- [Creating Decorators](layers/05-advanced/creating-decorators.md) - Creación de decoradores
- [Performance Optimization](layers/05-advanced/performance.md) - Optimización de rendimiento

---

## 5. Flujo de Funcionamiento

### Rutas de Aprendizaje por Nivel

#### Nivel Básico (Día 1)
Tiempo estimado: 1.5 horas

1. [Contrato de Desarrollo](00-CONTRACT.md) - 10 minutos - Lectura obligatoria prioritaria
2. [Framework Overview](01-FRAMEWORK-OVERVIEW.md) - 20 minutos
3. [Quick Start](03-QUICK-START.md) - 15 minutos
4. [Contrato UI/Design System](04-UI-DESIGN-SYSTEM-CONTRACT.md) - 15 minutos - Lectura obligatoria para desarrollo UI
5. [Contrato de Enforcement Técnico](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) - 20 minutos - Lectura obligatoria para desarrollo con IA
6. [Tutorial CRUD Básico](tutorials/01-basic-crud.md) - 30 minutos
7. [Ejemplo Clásico - Inventario](examples/classic-module-example.md) - 20 minutos

#### Nivel Intermedio (Semana 1)
Tiempo estimado: 6 horas

1. [Arquitectura de Flujos](02-FLOW-ARCHITECTURE.md) - 30 minutos
2. [Tutorial Validaciones](tutorials/02-validations.md) - 45 minutos
3. [Tutorial Relaciones](tutorials/03-relations.md) - 45 minutos
4. [Decoradores Principales](layers/01-decorators/) - 2 horas
5. [BaseEntity Core](layers/02-base-entity/base-entity-core.md) - 45 minutos
6. [Componentes de Formulario](layers/04-components/) - 1 hora

#### Nivel Avanzado (Mes 1)
Tiempo estimado: 10 horas

1. [Ejemplo Avanzado - Órdenes](examples/advanced-module-example.md) - 1 hora
2. [Custom Components](tutorials/04-custom-components.md) - 1.5 horas
3. [Patrones Avanzados](tutorials/05-advanced-patterns.md) - 2 horas
4. [Todos los Decoradores](layers/01-decorators/) - 3 horas
5. [Extending BaseEntity](layers/05-advanced/extending-base-entity.md) - 1 hora
6. [Creating Decorators](layers/05-advanced/creating-decorators.md) - 1.5 horas

### Flujos de Trabajo por Tipo de Tarea

#### Setup Inicial
- [Framework Overview](01-FRAMEWORK-OVERVIEW.md)
- [Quick Start](03-QUICK-START.md)
- Registrar módulos en Application

#### Crear Entidades
- [PropertyName](layers/01-decorators/property-name-decorator.md)
- [Required](layers/01-decorators/required-decorator.md)
- [PropertyIndex](layers/01-decorators/property-index-decorator.md)
- [Tutorial CRUD](tutorials/01-basic-crud.md)

#### Validar Datos
- [Required](layers/01-decorators/required-decorator.md)
- [Validation](layers/01-decorators/validation-decorator.md)
- [AsyncValidation](layers/01-decorators/async-validation-decorator.md)
- [Tutorial Validaciones](tutorials/02-validations.md)

#### Personalizar UI
- [ViewGroup](layers/01-decorators/view-group-decorator.md)
- [DisplayFormat](layers/01-decorators/display-format-decorator.md)
- [HelpText](layers/01-decorators/help-text-decorator.md)
- [Custom Components](layers/05-advanced/custom-components.md)

#### Integrar API
- [ApiEndpoint](layers/01-decorators/api-endpoint-decorator.md)
- [Persistent](layers/01-decorators/persistent-decorator.md)
- [CRUD Operations](layers/02-base-entity/crud-operations.md)

#### Optimizar
- [Performance Optimization](layers/05-advanced/performance.md)
- Best Practices (múltiples documentos)

---

## 6. Reglas Obligatorias

### Creación de Nuevo Decorador

1. Crear archivo en directorio `layers/01-decorators/`
2. Seguir template estructurado:
   ```markdown
   # Nombre del Decorador
   **Referencias:** [archivos relacionados]
   ## Ubicación en el Código
   ## Propósito
   ## Símbolo de Metadatos
   ## Firma del Decorador
   ## Uso Básico
   ## Funciones Accesoras en BaseEntity
   ## Impacto en UI
   ## Consideraciones Importantes
   ## Ejemplos Avanzados
   ```
3. Actualizar este índice maestro
4. Actualizar referencias cruzadas en documentos relacionados

### Reporte de Errores en Documentación

1. Identificar archivo y sección específica
2. Describir error detectado con precisión técnica
3. Proponer corrección fundamentada
4. Actualizar documentación según contrato

### Requisito Contractual

Por contrato de desarrollo, todo cambio en código debe documentarse. La documentación no es opcional sino parte integral del proceso de desarrollo.

---

## 7. Prohibiciones

### Prohibiciones Absolutas

- NO modificar arquitectura sin documentar cambios
- NO implementar features sin actualizar documentación
- NO omitir actualización de índice maestro
- NO crear decoradores sin seguir template
- NO alterar metadatos sin verificar impacto en UI
- NO realizar cambios en BaseEntity sin probar lifecycle hooks
- NO modificar Application singleton sin considerar efectos globales
- NO crear componentes custom sin documentar interfaz
- NO implementar validaciones asíncronas sin gestión de errores
- NO alterar referencias cruzadas sin verificar consistencia

---

## 8. Dependencias

### Stack Tecnológico

**Framework Frontend:**
- [Vue 3](https://vuejs.org/) - Framework reactivo principal
- [TypeScript](https://www.typescriptlang.org/) - Sistema de tipos

**Build Tool:**
- [Vite](https://vitejs.dev/) - Build tool y dev server

**Comunicación HTTP:**
- [Axios](https://axios-http.com/) - Cliente HTTP

**Event Bus:**
- [Mitt](https://github.com/developit/mitt) - Event emitter

### Recursos Adicionales

- Vue 3 Composition API - API de composición de Vue
- TypeScript Decorators - Sistema de decoradores
- REST API Design - Patrones de diseño de API
- SaaS Architecture - Arquitectura de aplicaciones SaaS

---

## 9. Relaciones

### Clasificación por Complejidad

#### Básico
- [Quick Start](03-QUICK-START.md)
- [Tutorial CRUD Básico](tutorials/01-basic-crud.md)
- [Ejemplo Clásico](examples/classic-module-example.md)
- Decoradores: PropertyName, Required, PropertyIndex

#### Intermedio
- [Tutorial Validaciones](tutorials/02-validations.md)
- [Tutorial Relaciones](tutorials/03-relations.md)
- Decoradores: ViewGroup, StringTypeDef
- Métodos de BaseEntity

#### Avanzado
- [Validaciones Asíncronas](layers/01-decorators/async-validation-decorator.md)
- [Componentes Custom](layers/05-advanced/custom-components.md)
- [Extending BaseEntity](layers/05-advanced/extending-base-entity.md)
- [Creating Decorators](layers/05-advanced/creating-decorators.md)
- [Ejemplo Avanzado](examples/advanced-module-example.md)

### Búsqueda por Componente del Framework

#### Sistema de Decoradores

**Propiedades Básicas:**
- `@PropertyName` - Define nombre y tipo
- `@PropertyIndex` - Orden de aparición
- `@DefaultProperty` - Identificador por defecto
- `@PrimaryProperty` - Clave primaria

**Validación:**
- `@Required` - Campo obligatorio
- `@Validation` - Validación síncrona
- `@AsyncValidation` - Validación asíncrona
- `@Unique` - Valor único

**UI y Layout:**
- `@ViewGroup` - Agrupación de campos
- `@ViewGroupRowDecorator` - Layout de filas
- `@HelpText` - Texto de ayuda
- `@DisplayFormat` - Formato de display
- `@CSSColumnClass` - Ancho de columna
- `@HideInListView` - Ocultar en lista
- `@HideInDetailView` - Ocultar en detalle
- `@TabOrder` - Orden de tabs

**Estado:**
- `@Disabled` - Deshabilitar campo
- `@ReadOnly` - Solo lectura

**Tipos Específicos:**
- `@StringTypeDef` - Subtipo de string (EMAIL, PASSWORD, TEXTAREA)
- `@ArrayOf` - Arrays tipados
- `@Mask` - Máscara de entrada

**Módulo:**
- `@ModuleName` - Nombre del módulo
- `@ModuleIcon` - Icono
- `@ModulePermission` - Permisos
- `@ModuleListComponent` - Vista lista custom
- `@ModuleDetailComponent` - Vista detalle custom
- `@ModuleDefaultComponent` - Vista por defecto

**API y Persistencia:**
- `@ApiEndpoint` - Endpoint de API
- `@ApiMethods` - Métodos HTTP permitidos
- `@Persistent` - Habilitar persistencia
- `@PersistentKey` - Mapeo de claves

#### Sistema de Componentes

**Inputs de Formulario:**
- TextInputComponent
- NumberInputComponent
- DateInputComponent
- BooleanInputComponent
- EmailInputComponent
- PasswordInputComponent
- TextAreaComponent
- ObjectInputComponent
- ListInputComponent
- ArrayInputComponent

**Componentes Informativos:**
- DetailViewTableComponent
- FormGroupComponent
- ToastContainerComponent

---

## 10. Notas de Implementación

### Estado de Documentación

#### Documentación Completada

- Contrato de Desarrollo
- Framework Overview
- Arquitectura de Flujos
- Quick Start
- Sistema completo de decoradores (31/31)
- Ejemplos: Clásico y Avanzado
- BaseEntity: Core, Metadata Access, UI Services, CRUD Operations, Validation System, Lifecycle Hooks
- Application: Singleton, Router Integration, Event Bus
- Tutorial 01: CRUD Básico
- Tutorial 02: Validaciones
- Tutorial 03: Relaciones
- Composable: useInputMetadata
- 10 Componentes de Input: Text, Number, Boolean, Email, Password, Date, TextArea, List, Object, Array
- Buttons Overview
- Modal Components
- DetailViewTableComponent
- Índice Maestro

#### Documentación en Progreso

- Tutorial 4: Componentes Custom
- Tutorial 5: Patrones Avanzados
- Sección de nivel avanzado: Custom Components, Extending BaseEntity, Creating Decorators, Performance
- Ejemplos interactivos
- Troubleshooting guide
- Migration guide
- API reference completa

### Canales de Soporte

**Uso básico:**
- [Quick Start](03-QUICK-START.md)
- Tutoriales 01-03

**Decoradores:**
- Directorio `layers/01-decorators/`

**BaseEntity:**
- Directorio `layers/02-base-entity/`

**Errores:**
- Troubleshooting guide (en desarrollo)

**Contribución:**
- [Contrato](00-CONTRACT.md)
- Este índice maestro

---

## 11. Referencias Cruzadas

### Documentos Fundamentales

**Lectura obligatoria prioritaria:**
1. [Contrato de Desarrollo](00-CONTRACT.md)
2. [Framework Overview](01-FRAMEWORK-OVERVIEW.md)
3. [Arquitectura de Flujos](02-FLOW-ARCHITECTURE.md)
4. [Quick Start](03-QUICK-START.md)
5. [Contrato UI/Design System](04-UI-DESIGN-SYSTEM-CONTRACT.md)
6. [Contrato de Enforcement Técnico](05-ENFORCEMENT-TECHNICAL-CONTRACT.md)

### Tutoriales de Implementación

- [Tutorial 1: CRUD Básico](tutorials/01-basic-crud.md)
- [Tutorial 2: Validaciones](tutorials/02-validations.md)
- [Tutorial 3: Relaciones - Objetos y Arrays](tutorials/03-relations.md)

### Ejemplos de Referencia

- [Módulo Clásico - Inventario](examples/classic-module-example.md)
- [Módulo Avanzado - Órdenes](examples/advanced-module-example.md)

### Capas del Sistema

**Capa 1 - Decoradores:** Directorio `layers/01-decorators/` (31 decoradores documentados)

**Capa 2 - BaseEntity:**
- [BaseEntity Core](layers/02-base-entity/base-entity-core.md)
- [CRUD Operations](layers/02-base-entity/crud-operations.md)
- [Validation System](layers/02-base-entity/validation-system.md)
- [Lifecycle Hooks](layers/02-base-entity/lifecycle-hooks.md)
- [Metadata Access](layers/02-base-entity/metadata-access.md)

**Capa 3 - Application:**
- [Application Singleton](layers/03-application/application-singleton.md)
- [Router Integration](layers/03-application/router-integration.md)
- [Event Bus](layers/03-application/event-bus.md)
- [UI Services](layers/03-application/ui-services.md)

**Capa 4 - Components:**
- Composables: [useInputMetadata](layers/04-components/useInputMetadata-composable.md)
- Inputs: [Form Inputs Overview](layers/04-components/form-inputs.md), 10 componentes específicos
- Botones: [Buttons Overview](layers/04-components/buttons-overview.md)
- Modales: [Modal Components](layers/04-components/modal-components.md)
- Informativos: [DetailViewTableComponent](layers/04-components/DetailViewTableComponent.md)
- Layout: [SideBarComponent](layers/04-components/SideBarComponent.md), [TopBarComponent](layers/04-components/TopBarComponent.md)

**Capa 5 - Avanzado:**
- [Custom Components](layers/05-advanced/custom-components.md)
- [Extending BaseEntity](layers/05-advanced/extending-base-entity.md)
- [Creating Decorators](layers/05-advanced/creating-decorators.md)
- [Performance Optimization](layers/05-advanced/performance.md)

---

**Nota Técnica:** Esta documentación está en evolución continua. Verificar fecha de última actualización de cada documento antes de implementar funcionalidades basadas en documentación específica.
