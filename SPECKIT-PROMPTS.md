# Prompts para GitHub Spec Kit - Framework SaaS Vue

**Versión:** 1.0.0  
**Fecha:** 26 de Febrero, 2026  
**Propósito:** Prompts especializados para migrar documentación /copilot a formato speckit

---

## 🎯 Objetivo General

Convertir toda la documentación contractual y técnica ubicada en `/copilot` al formato GitHub Spec Kit, preservando TODAS las especificaciones, reglas contractuales, y detalles técnicos (exceptuando únicamente las reglas de formato de archivo, las cuales serán reemplazadas por el formato speckit).

**CRÍTICO:** A pesar del cambio de formato, TODAS las especificaciones, reglas de contratos, axiomas de MI LÓGICA, y especificaciones técnicas de cada componente y archivo .ts deben quedar completamente cubiertas en los archivos generados.

---

## 📋 Prompt 1: Constitution

### Comando
```bash
npx @specfy/speckit constitution
```

### Prompt

```
# CONSTITUTION - Framework SaaS Vue

## Contexto
Tengo un framework Vue 3 + TypeScript basado en arquitectura de capas con generación automática de UI desde metadatos. La documentación completa está en /copilot con contratos vinculantes y especificaciones técnicas detalladas.

## Objetivo
Crear el archivo constitution.md que establezca los principios fundamentales del framework, basándote COMPLETAMENTE en la documentación existente sin omitir ninguna regla o especificación.

## Archivos de Referencia Principal

### Contratos Base (PRIORIDAD MÁXIMA)
- `/copilot/00-CONTRACT.md` (938+ líneas)
  * Sección: MI LÓGICA (líneas 27-89) - LOS 4 AXIOMAS SON OBLIGATORIOS
    - AXIOMA A1: Arquitectura de 5 capas (Entidades → Decoradores → BaseEntity → Application → UI)
    - AXIOMA A2: Flujo unidireccional de datos sin bypass
    - AXIOMA A3: Generación de UI como función pura de metadatos
    - AXIOMA A4: Stack tecnológico inmutable (TypeScript + Decoradores + Vue 3)
  * Sección: Criterios de Violación (líneas 55-89)
  * Sección: Principios de Desarrollo (sección 4)
  * Sección: Reglas de Modificación (sección 5)
  * Sección: Stack Tecnológico (sección 6)
  * Sección: Consecuencias de Incumplimiento (sección 13)

- `/copilot/05-ENFORCEMENT-TECHNICAL-CONTRACT.md` (2280+ líneas)
  * Sección: Procesos de Enforcement (todo el documento)
  * Sección: Guías de Resolución de Conflictos
  * Sección: Matriz de Prioridades

- `/copilot/01-FRAMEWORK-OVERVIEW.md` (792 líneas)
  * Sección: Principios de Diseño
  * Sección: Arquitectura General
  * Sección: Ventajas del Framework

### Contratos Técnicos Específicos
- `/copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md` (1100+ líneas)
  * TODO: Principios de diseño visual
  * TODO: Reglas de CSS y componentes
  
- `/copilot/06-CODE-STYLING-STANDARDS.md` (2850+ líneas)
  * TODO: Estándares de código obligatorios
  * TODO: Convenciones de nombres y estructura

### Referencias Complementarias
- `/copilot/INDEX-MASTER.md` - Para entender la jerarquía completa
- `/copilot/EXCEPCIONES.md` - Casos especiales permitidos
- `/copilot/BREAKING-CHANGES.md` - Historial de cambios críticos

## Requisitos Específicos

1. **AXIOMAS INMUTABLES**: Los 4 axiomas de MI LÓGICA deben estar claramente establecidos como principios fundamentales no negociables

2. **JERARQUÍA DE CONTRATOS**: Establecer claramente la jerarquía:
   - MI LÓGICA (máxima prioridad)
   - CORE Contract (00-CONTRACT.md)
   - Enforcement Contract
   - Code Styling Standards
   - UI Design System
   - Documentación descriptiva

3. **STACK TECNOLÓGICO**: Especificar que el stack (TypeScript + Vue 3 + Decoradores) es INMUTABLE

4. **PRINCIPIOS DE DESARROLLO**: Incluir todos los principios de desarrollo listados en 00-CONTRACT.md sección 4

5. **CONSECUENCIAS**: Establecer consecuencias claras del incumplimiento contractual

## Formato Esperado
Seguir el formato constitution.md de speckit, pero asegurando que TODOS los principios y axiomas queden documentados. Si el formato speckit no permite expresar algo crítico, añadir secciones adicionales necesarias.

## Validación
El constitution.md resultante debe permitir a cualquier IA o desarrollador entender:
- Qué NO se puede modificar (axiomas)
- Qué principios rigen el desarrollo
- Qué stack tecnológico es obligatorio
- Qué jerarquía contractual existe
- Qué consecuencias tiene el incumplimiento
```

---

## 📋 Prompt 2: Specify

### Comando
```bash
npx @specfy/speckit specify
```

### Prompt

```
# SPECIFY - Framework SaaS Vue

## Contexto
Framework Vue 3 + TypeScript con arquitectura de 5 capas y sistema de decoradores para generación automática de UI. Necesito especificar TODOS los componentes, sistemas y contratos del framework.

## Objetivo
Crear el archivo spec.md con especificaciones técnicas completas de CADA capa, componente, decorador, servicio y contrato del framework, sin omitir ningún detalle técnico.

## Archivos de Referencia por Capa

### CAPA 1: Entidades
- `/copilot/layers/02-base-entity/base-entity-core.md`
  * Estructura de BaseEntity
  * Propiedades protegidas
  * Métodos del ciclo de vida

- `/copilot/layers/02-base-entity/crud-operations.md`
  * save(), load(), delete()
  * Especificaciones de cada operación

- `/copilot/layers/02-base-entity/validation-system.md`
  * Sistema de validación integrado
  * validate(), validateProperty()

- `/copilot/layers/02-base-entity/metadata-access.md`
  * getMetadata(), getPropertyMetadata()
  * Sistema de acceso a metadatos

- `/copilot/layers/02-base-entity/persistence-methods.md`
  * toStorage(), fromStorage()
  * Conversión de datos

- `/copilot/layers/02-base-entity/lifecycle-hooks.md`
  * beforeSave, afterSave, beforeLoad, afterLoad, beforeDelete, afterDelete
  * Especificaciones de cada hook

- `/copilot/layers/02-base-entity/state-and-conversion.md`
  * toJSON(), fromJSON()
  * Gestión de estado

- `/copilot/layers/02-base-entity/static-methods.md`
  * Métodos estáticos de BaseEntity

- `/copilot/layers/02-base-entity/additional-metadata.md`
  * Metadatos adicionales disponibles

### CAPA 2: Decoradores (31 decoradores)
**IMPORTANTE**: Especificar CADA uno de los 31 decoradores con:
- Propósito
- Parámetros exactos
- Comportamiento esperado
- Integración con BaseEntity

Lista completa en `/copilot/layers/01-decorators/`:
1. `api-endpoint-decorator.md` - @ApiEndpoint()
2. `api-methods-decorator.md` - @ApiMethods()
3. `async-validation-decorator.md` - @AsyncValidation()
4. `css-column-class-decorator.md` - @CssColumnClass()
5. `default-property-decorator.md` - @DefaultProperty()
6. `disabled-decorator.md` - @Disabled()
7. `display-format-decorator.md` - @DisplayFormat()
8. `help-text-decorator.md` - @HelpText()
9. `hide-in-detail-view-decorator.md` - @HideInDetailView()
10. `hide-in-list-view-decorator.md` - @HideInListView()
11. `mask-decorator.md` - @Mask()
12. `module-custom-components-decorator.md` - @ModuleCustomComponents()
13. `module-default-component-decorator.md` - @ModuleDefaultComponent()
14. `module-detail-component-decorator.md` - @ModuleDetailComponent()
15. `module-icon-decorator.md` - @ModuleIcon()
16. `module-list-component-decorator.md` - @ModuleListComponent()
17. `module-name-decorator.md` - @ModuleName()
18. `module-permission-decorator.md` - @ModulePermission()
19. `persistent-decorator.md` - @Persistent()
20. `persistent-key-decorator.md` - @PersistentKey()
21. `primary-property-decorator.md` - @PrimaryProperty()
22. `property-index-decorator.md` - @PropertyIndex()
23. `property-name-decorator.md` - @PropertyName()
24. `readonly-decorator.md` - @ReadOnly()
25. `required-decorator.md` - @Required()
26. `string-type-decorator.md` - @StringType()
27. `tab-order-decorator.md` - @TabOrder()
28. `unique-decorator.md` - @Unique()
29. `validation-decorator.md` - @Validation()
30. `view-group-decorator.md` - @ViewGroup()
31. `view-group-row-decorator.md` - @ViewGroupRow()

### CAPA 3: Application (Singleton)
- `/copilot/layers/03-application/application-singleton.md`
  * Estructura del singleton
  * Propiedades y métodos

- `/copilot/layers/03-application/event-bus.md`
  * Sistema de eventos
  * Eventos disponibles

- `/copilot/layers/03-application/router-integration.md`
  * Integración con Vue Router
  * Rutas automáticas

- `/copilot/layers/03-application/ui-services.md`
  * Toast, Dialog, Loading
  * API de cada servicio

### CAPA 4: Componentes UI (35+ componentes)
**IMPORTANTE**: Especificar CADA componente en `/copilot/layers/04-components/`:

#### Componentes Core
1. `ActionsComponent.md` - ActionsComponent
2. `ComponentContainerComponent.md` - ComponentContainerComponent
3. `DropdownMenu.md` - DropdownMenuComponent
4. `LoadingScreenComponent.md` - LoadingScreenComponent
5. `SideBarComponent.md` - SideBarComponent
6. `SideBarItemComponent.md` - SideBarItemComponent
7. `TabComponents.md` - TabComponent, TabControllerComponent
8. `TopBarComponent.md` - TopBarComponent

#### Componentes de Formulario
9. `text-input-component.md` - TextInputComponent
10. `textarea-input-component.md` - TextAreaInputComponent
11. `number-input-component.md` - NumberInputComponent
12. `boolean-input-component.md` - BooleanInputComponent
13. `date-input-component.md` - DateInputComponent
14. `email-input-component.md` - EmailInputComponent
15. `password-input-component.md` - PasswordInputComponent
16. `array-input-component.md` - ArrayInputComponent
17. `object-input-component.md` - ObjectInputComponent
18. `list-input-component.md` - ListInputComponent

#### Componentes de Layout
19. `FormLayoutComponents.md`
20. `DetailViewTableComponent.md`

#### Componentes Informativos
21. `ToastComponents.md`
22. `DialogComponents.md`
23. `modal-components.md`

#### Componentes de Botones
24. `ActionButtonComponents.md`
25. `buttons-overview.md`

#### Otros
26. `LookupItem.md`
27. `useInputMetadata-composable.md`

### CAPA 5: Avanzado
- `/copilot/layers/05-advanced/Enums.md`
- `/copilot/layers/05-advanced/Models.md`
- `/copilot/layers/05-advanced/Router.md`
- `/copilot/layers/05-advanced/Types.md`

### CAPA 6: Composables
- `/copilot/layers/06-composables/useInputMetadata.md`

### Flujos y Arquitectura
- `/copilot/02-FLOW-ARCHITECTURE.md` (921 líneas)
  * Flujo de creación de módulo
  * Flujo de renderizado
  * Flujo de validación
  * Flujo de persistencia
  * Flujo de eventos
  * TODOS los diagramas de flujo

### Contratos Técnicos
- `/copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md`
  * Sistema de CSS
  * Variables CSS obligatorias
  * Clases de utilidad
  * Sistema de colores
  * Tipografía
  * Espaciado

- `/copilot/06-CODE-STYLING-STANDARDS.md`
  * Convenciones de nombres
  * Estructura de archivos
  * Patterns de código
  * Comentarios obligatorios
  * TypeScript strictness

### Guías y Ejemplos
- `/copilot/03-QUICK-START.md` - Guía de inicio rápido
- `/copilot/examples/classic-module-example.md` - Ejemplo módulo clásico
- `/copilot/examples/advanced-module-example.md` - Ejemplo módulo avanzado
- `/copilot/tutorials/01-basic-crud.md` - Tutorial CRUD básico
- `/copilot/tutorials/02-validations.md` - Tutorial validaciones
- `/copilot/tutorials/03-relations.md` - Tutorial relaciones

## Requisitos Específicos

1. **COMPLETITUD**: Cada decorador, componente, método y flujo debe estar especificado

2. **DETALLES TÉCNICOS**: 
   - Interfaces TypeScript exactas
   - Props de componentes Vue
   - Parámetros de funciones
   - Tipos de retorno
   - Excepciones posibles

3. **COMPORTAMIENTO**:
   - Qué hace cada elemento
   - Cómo interactúa con otros
   - Qué metadatos consume/produce
   - Qué eventos emite/escucha

4. **VALIDACIONES**:
   - Reglas de validación de cada decorador
   - Sistema de validación de BaseEntity
   - Validaciones asíncronas

5. **FLUJOS COMPLETOS**:
   - Todos los flows de 02-FLOW-ARCHITECTURE.md
   - Secuencias de interacción
   - Ciclos de vida

## Formato Esperado
Seguir el formato spec.md de speckit, organizando por capas y sistemas. Si es necesario crear múltiples archivos de spec para mantener claridad, hacerlo.

## Validación
El spec.md resultante debe permitir a cualquier IA o desarrollador:
- Implementar cualquier componente desde cero usando solo la spec
- Entender el propósito y uso de cada decorador
- Conocer todos los métodos y propiedades de BaseEntity
- Entender todos los flujos del sistema
- Conocer todas las reglas de UI y CSS
```

---

## 📋 Prompt 3: Plan

### Comando
```bash
npx @specfy/speckit plan
```

### Prompt

```
# PLAN - Framework SaaS Vue

## Contexto
Framework Vue 3 + TypeScript con arquitectura de 5 capas ya implementado y funcional. Necesito documentar el plan de implementación que se siguió y el plan de evolución futura.

## Objetivo
Crear el archivo plan.md que documente:
1. El plan arquitectónico que se siguió para construir el framework actual
2. El plan de evolución y mejoras futuras
3. Fases de implementación y dependencias

## Archivos de Referencia

### Para el Plan Implementado (Retrospectivo)
- `/copilot/01-FRAMEWORK-OVERVIEW.md`
  * Sección: Capas del Sistema (orden de implementación)
  * Sección: Componentes Fundamentales

- `/copilot/02-FLOW-ARCHITECTURE.md`
  * Orden lógico de implementación de flujos
  * Dependencias entre sistemas

- `/copilot/layers/01-decorators/README.md`
  * Estructura de implementación de decoradores
  * Decoradores base vs avanzados

- `/copilot/layers/02-base-entity/README.md`
  * Fases de implementación de BaseEntity
  * Core → CRUD → Validación → Hooks → Avanzado

- `/copilot/layers/03-application/README.md`
  * Implementación del singleton
  * Integración de servicios

- `/copilot/layers/04-components/README.md`
  * Orden de implementación de componentes
  * Componentes base → Inputs → Layouts → Avanzados

### Para el Plan Futuro
- `/copilot/BREAKING-CHANGES.md`
  * Historial de cambios críticos
  * Patrones de evolución

- `/copilot/EXCEPCIONES.md`
  * Limitaciones actuales
  * Áreas de mejora identificadas

- `/copilot/05-ENFORCEMENT-TECHNICAL-CONTRACT.md`
  * Sección: Roadmap de Enforcement
  * Mejoras planificadas

### Ejemplos de Implementación
- `/copilot/examples/classic-module-example.md`
  * Pasos para crear módulo clásico
  
- `/copilot/examples/advanced-module-example.md`
  * Pasos para módulo avanzado

- `/copilot/tutorials/01-basic-crud.md`
- `/copilot/tutorials/02-validations.md`
- `/copilot/tutorials/03-relations.md`

## Estructura del Plan

### FASE 1: Fundamentos (Implementado)
1. **Capa de Decoradores Base**
   - Sistema de reflection de TypeScript
   - Decoradores de clase (@ModuleName, @ApiEndpoint, etc.)
   - Decoradores de propiedad (@PropertyName, @Required, etc.)
   - Almacenamiento de metadatos en BaseEntity.prototype

2. **BaseEntity Core**
   - Clase base abstracta
   - Sistema de metadatos
   - Constructor y propiedades protegidas
   - Métodos de metadata access

3. **Validación Básica**
   - @Required, @Validation
   - validate(), validateProperty()
   - Integración con decoradores

### FASE 2: CRUD y Persistencia (Implementado)
1. **Operaciones CRUD**
   - save() con lógica de insert/update
   - load() con carga desde API
   - delete() con confirmación
   - Integración con @ApiEndpoint

2. **Sistema de Persistencia**
   - toStorage(), fromStorage()
   - @PersistentKey, @Persistent
   - LocalStorage integration

3. **Lifecycle Hooks**
   - beforeSave, afterSave
   - beforeLoad, afterLoad
   - beforeDelete, afterDelete

### FASE 3: Application Layer (Implementado)
1. **Singleton Application**
   - Registro de entidades
   - Diccionario de módulos
   - Router integration

2. **Event Bus**
   - Sistema pub/sub
   - Eventos estándar
   - Listeners

3. **UI Services**
   - Toast service
   - Dialog service
   - Loading service

### FASE 4: Componentes UI Base (Implementado)
1. **Core Components**
   - ComponentContainerComponent
   - LoadingScreenComponent
   - TopBarComponent, SideBarComponent

2. **Input Components Básicos**
   - TextInputComponent
   - NumberInputComponent
   - BooleanInputComponent
   - DateInputComponent

3. **Layout Components**
   - FormLayoutComponents
   - TabComponents
   - DropdownMenu

### FASE 5: Componentes Avanzados (Implementado)
1. **Inputs Complejos**
   - ArrayInputComponent
   - ObjectInputComponent
   - ListInputComponent
   - Lookup components

2. **Modal System**
   - DialogComponents
   - Modal templates
   - Confirmation dialogs

3. **View Components**
   - DetailViewTableComponent
   - List views
   - Dashboard components

### FASE 6: Decoradores Avanzados (Implementado)
1. **UI Decorators**
   - @ViewGroup, @ViewGroupRow
   - @HideInListView, @HideInDetailView
   - @TabOrder, @CssColumnClass

2. **Validation Avanzada**
   - @AsyncValidation
   - @Unique
   - Custom validators

3. **Display Decorators**
   - @DisplayFormat
   - @Mask
   - @HelpText

### FASE 7: Sistema Avanzado (Implementado)
1. **Enums y Types**
   - Sistema de enums
   - Types compartidos
   - Models auxiliares

2. **Router Avanzado**
   - Rutas automáticas
   - Guards de permisos
   - Navegación basada en metadatos

3. **Composables**
   - useInputMetadata
   - Otros composables Vue

## Plan de Evolución Futura

### FASE 8: Optimización (Próximo)
1. **Performance**
   - Lazy loading de componentes
   - Virtual scrolling en listas
   - Optimización de re-renders

2. **Developer Experience**
   - CLI para scaffolding
   - Generador de entidades
   - Hot reload avanzado

3. **Testing**
   - Unit tests para decoradores
   - E2E tests para flujos
   - Testing utilities

### FASE 9: Features Adicionales (Futuro)
1. **Multi-tenancy**
   - Soporte para múltiples tenants
   - Aislamiento de datos
   - Configuración por tenant

2. **i18n**
   - Internacionalización integrada
   - Traducción de metadatos
   - Formatos locales

3. **Theming Avanzado**
   - Multiple themes
   - Theme builder
   - CSS variables dinámicas

### FASE 10: Ecosystem (Futuro Lejano)
1. **Plugins**
   - Sistema de plugins
   - Plugin registry
   - Custom decorators externos

2. **Marketplace**
   - Componentes compartidos
   - Módulos pre-built
   - Templates

## Requisitos Específicos

1. **ORDEN LÓGICO**: El plan debe reflejar dependencias reales
   - No se puede tener UI sin BaseEntity
   - No se puede tener CRUD sin decoradores
   - El orden debe ser implementable

2. **HITOS CLAROS**: Cada fase debe tener:
   - Objetivo claro
   - Entregables específicos
   - Criterios de completitud

3. **DEPENDENCIAS**: Documentar claramente:
   - Qué requiere cada fase
   - Qué bloquea qué
   - Qué se puede paralelizar

4. **RIESGOS**: Identificar:
   - Cambios breaking potenciales
   - Áreas de complejidad
   - Technical debt

## Formato Esperado
Seguir el formato plan.md de speckit, organizando por fases con dependencias claras.

## Validación
El plan.md resultante debe permitir a cualquier IA o desarrollador:
- Entender el orden lógico de construcción del framework
- Identificar dependencias entre sistemas
- Planificar nuevas features siguiendo el mismo patrón
- Conocer el roadmap futuro
```

---

## 📋 Prompt 4: Tasks

### Comando
```bash
npx @specfy/speckit tasks
```

### Prompt

```
# TASKS - Framework SaaS Vue

## Contexto
Framework Vue 3 + TypeScript implementado con arquitectura de 5 capas. Necesito descomponer cada componente y sistema en tareas técnicas específicas e implementables.

## Objetivo
Crear el archivo tasks.md que contenga tareas técnicas granulares para implementar/mantener CADA elemento del framework, desde decoradores hasta componentes UI, organizadas por capa y prioridad.

## Archivos de Referencia

### Para Generar Tareas de Decoradores
Cada uno de los 31 archivos en `/copilot/layers/01-decorators/` debe generar tareas tipo:

**Ejemplo de estructura de tareas para un decorador:**
```
Decorador: @Required
- [ ] TASK-DEC-001: Crear función de decorador @Required
- [ ] TASK-DEC-002: Implementar almacenamiento en metadata 'required'
- [ ] TASK-DEC-003: Integrar con validation system
- [ ] TASK-DEC-004: Añadir tests unitarios
- [ ] TASK-DEC-005: Documentar uso y ejemplos
```

**Generar tareas similares para:**
1. @ApiEndpoint() - api-endpoint-decorator.md
2. @ApiMethods() - api-methods-decorator.md
3. @AsyncValidation() - async-validation-decorator.md
4. @CssColumnClass() - css-column-class-decorator.md
5. @DefaultProperty() - default-property-decorator.md
6. @Disabled() - disabled-decorator.md
7. @DisplayFormat() - display-format-decorator.md
8. @HelpText() - help-text-decorator.md
9. @HideInDetailView() - hide-in-detail-view-decorator.md
10. @HideInListView() - hide-in-list-view-decorator.md
11. @Mask() - mask-decorator.md
12. @ModuleCustomComponents() - module-custom-components-decorator.md
13. @ModuleDefaultComponent() - module-default-component-decorator.md
14. @ModuleDetailComponent() - module-detail-component-decorator.md
15. @ModuleIcon() - module-icon-decorator.md
16. @ModuleListComponent() - module-list-component-decorator.md
17. @ModuleName() - module-name-decorator.md
18. @ModulePermission() - module-permission-decorator.md
19. @Persistent() - persistent-decorator.md
20. @PersistentKey() - persistent-key-decorator.md
21. @PrimaryProperty() - primary-property-decorator.md
22. @PropertyIndex() - property-index-decorator.md
23. @PropertyName() - property-name-decorator.md
24. @ReadOnly() - readonly-decorator.md
25. @Required() - required-decorator.md
26. @StringType() - string-type-decorator.md
27. @TabOrder() - tab-order-decorator.md
28. @Unique() - unique-decorator.md
29. @Validation() - validation-decorator.md
30. @ViewGroup() - view-group-decorator.md
31. @ViewGroupRow() - view-group-row-decorator.md

### Para Generar Tareas de BaseEntity
Basarse en `/copilot/layers/02-base-entity/`:

**De base-entity-core.md:**
- [ ] TASK-BE-001: Crear clase abstracta BaseEntity
- [ ] TASK-BE-002: Implementar constructor con datos parciales
- [ ] TASK-BE-003: Declarar propiedades protegidas (_id, _created_at, etc.)
- [ ] TASK-BE-004: Implementar typescript reflection setup

**De crud-operations.md:**
- [ ] TASK-BE-010: Implementar método save()
- [ ] TASK-BE-011: Implementar lógica insert/update en save()
- [ ] TASK-BE-012: Implementar método load()
- [ ] TASK-BE-013: Implementar método delete()
- [ ] TASK-BE-014: Integrar con @ApiEndpoint metadata

**De validation-system.md:**
- [ ] TASK-BE-020: Implementar validate()
- [ ] TASK-BE-021: Implementar validateProperty()
- [ ] TASK-BE-022: Integrar con @Required decorator
- [ ] TASK-BE-023: Integrar con @Validation decorator
- [ ] TASK-BE-024: Implementar async validation support

**De metadata-access.md:**
- [ ] TASK-BE-030: Implementar getMetadata()
- [ ] TASK-BE-031: Implementar getPropertyMetadata()
- [ ] TASK-BE-032: Implementar hasMetadata()
- [ ] TASK-BE-033: Implementar metadata caching

**De persistence-methods.md:**
- [ ] TASK-BE-040: Implementar toStorage()
- [ ] TASK-BE-041: Implementar fromStorage()
- [ ] TASK-BE-042: Implementar serialización selectiva (@Persistent)
- [ ] TASK-BE-043: Integrar con LocalStorage

**De lifecycle-hooks.md:**
- [ ] TASK-BE-050: Implementar beforeSave hook
- [ ] TASK-BE-051: Implementar afterSave hook
- [ ] TASK-BE-052: Implementar beforeLoad hook
- [ ] TASK-BE-053: Implementar afterLoad hook
- [ ] TASK-BE-054: Implementar beforeDelete hook
- [ ] TASK-BE-055: Implementar afterDelete hook

**De state-and-conversion.md:**
- [ ] TASK-BE-060: Implementar toJSON()
- [ ] TASK-BE-061: Implementar fromJSON()
- [ ] TASK-BE-062: Implementar clone()

**De static-methods.md:**
- [ ] TASK-BE-070: Implementar métodos estáticos
- [ ] TASK-BE-071: Implementar factory methods

### Para Generar Tareas de Application
Basarse en `/copilot/layers/03-application/`:

**De application-singleton.md:**
- [ ] TASK-APP-001: Crear clase singleton Application
- [ ] TASK-APP-002: Implementar registro de entidades
- [ ] TASK-APP-003: Implementar diccionario de módulos
- [ ] TASK-APP-004: Implementar getModuleByName()

**De event-bus.md:**
- [ ] TASK-APP-010: Implementar EventBus
- [ ] TASK-APP-011: Implementar on(), emit(), off()
- [ ] TASK-APP-012: Definir eventos estándar
- [ ] TASK-APP-013: Documentar API de eventos

**De router-integration.md:**
- [ ] TASK-APP-020: Integrar con Vue Router
- [ ] TASK-APP-021: Generar rutas automáticas
- [ ] TASK-APP-022: Implementar navigation guards
- [ ] TASK-APP-023: Implementar @ModulePermission routing

**De ui-services.md:**
- [ ] TASK-APP-030: Implementar Toast service
- [ ] TASK-APP-031: Implementar Dialog service
- [ ] TASK-APP-032: Implementar Loading service
- [ ] TASK-APP-033: Integrar servicios con Application

### Para Generar Tareas de Componentes
Basarse en `/copilot/layers/04-components/` - Cada componente genera tareas:

**Para cada Input Component:**
- [ ] TASK-COMP-XXX-1: Crear componente Vue con TypeScript
- [ ] TASK-COMP-XXX-2: Definir props interface
- [ ] TASK-COMP-XXX-3: Implementar v-model binding
- [ ] TASK-COMP-XXX-4: Integrar con metadata system
- [ ] TASK-COMP-XXX-5: Implementar validación visual
- [ ] TASK-COMP-XXX-6: Añadir soporte para @Disabled, @ReadOnly
- [ ] TASK-COMP-XXX-7: Implementar @HelpText display
- [ ] TASK-COMP-XXX-8: Aplicar CSS según UI Design System
- [ ] TASK-COMP-XXX-9: Añadir tests de componente

**Generar para:**
1. TextInputComponent (text-input-component.md)
2. TextAreaInputComponent (textarea-input-component.md)
3. NumberInputComponent (number-input-component.md)
4. BooleanInputComponent (boolean-input-component.md)
5. DateInputComponent (date-input-component.md)
6. EmailInputComponent (email-input-component.md)
7. PasswordInputComponent (password-input-component.md)
8. ArrayInputComponent (array-input-component.md)
9. ObjectInputComponent (object-input-component.md)
10. ListInputComponent (list-input-component.md)

**Para Core Components:**
11. ActionsComponent (ActionsComponent.md)
12. ComponentContainerComponent (ComponentContainerComponent.md)
13. DropdownMenuComponent (DropdownMenu.md)
14. LoadingScreenComponent (LoadingScreenComponent.md)
15. SideBarComponent (SideBarComponent.md)
16. SideBarItemComponent (SideBarItemComponent.md)
17. TabComponent (TabComponents.md)
18. TabControllerComponent (TabComponents.md)
19. TopBarComponent (TopBarComponent.md)

**Para Layout/Modal Components:**
20. FormLayoutComponents (FormLayoutComponents.md)
21. DetailViewTableComponent (DetailViewTableComponent.md)
22. ToastComponents (ToastComponents.md)
23. DialogComponents (DialogComponents.md)
24. Modal Components (modal-components.md)
25. Action Buttons (ActionButtonComponents.md)

### Para Generar Tareas de Sistema Avanzado
Basarse en `/copilot/layers/05-advanced/`:

**De Enums.md:**
- [ ] TASK-ADV-001: Crear sistema de enums
- [ ] TASK-ADV-002: Implementar enum registration
- [ ] TASK-ADV-003: Integrar con inputs

**De Models.md:**
- [ ] TASK-ADV-010: Documentar models auxiliares
- [ ] TASK-ADV-011: Crear interfaces compartidas

**De Router.md:**
- [ ] TASK-ADV-020: Configurar Vue Router
- [ ] TASK-ADV-021: Implementar rutas automáticas
- [ ] TASK-ADV-022: Implementar guards

**De Types.md:**
- [ ] TASK-ADV-030: Definir types TypeScript compartidos
- [ ] TASK-ADV-031: Crear utility types

### Para Generar Tareas de Composables
Basarse en `/copilot/layers/06-composables/`:

**De useInputMetadata.md:**
- [ ] TASK-COMP-001: Crear composable useInputMetadata
- [ ] TASK-COMP-002: Implementar metadata extraction
- [ ] TASK-COMP-003: Implementar reactive metadata
- [ ] TASK-COMP-004: Documentar uso

### Para Generar Tareas de UI/CSS
Basarse en `/copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md`:

- [ ] TASK-CSS-001: Definir variables CSS globales
- [ ] TASK-CSS-002: Crear sistema de colores
- [ ] TASK-CSS-003: Implementar tipografía
- [ ] TASK-CSS-004: Crear utility classes
- [ ] TASK-CSS-005: Implementar responsive breakpoints
- [ ] TASK-CSS-006: Crear form styling
- [ ] TASK-CSS-007: Crear table styling
- [ ] TASK-CSS-008: Documentar CSS patterns

### Para Generar Tareas de Code Standards
Basarse en `/copilot/06-CODE-STYLING-STANDARDS.md`:

- [ ] TASK-STD-001: Configurar ESLint
- [ ] TASK-STD-002: Configurar Prettier
- [ ] TASK-STD-003: Crear template de archivos
- [ ] TASK-STD-004: Documentar naming conventions
- [ ] TASK-STD-005: Crear guía de comentarios

### Para Generar Tareas de Enforcement
Basarse en `/copilot/05-ENFORCEMENT-TECHNICAL-CONTRACT.md`:

- [ ] TASK-ENF-001: Crear checklists de code review
- [ ] TASK-ENF-002: Implementar pre-commit hooks
- [ ] TASK-ENF-003: Configurar CI/CD validations
- [ ] TASK-ENF-004: Crear automated tests
- [ ] TASK-ENF-005: Documentar proceso de enforcement

## Estructura de Identificadores de Tareas

```
TASK-{CAPA}-{NUMERO}: Descripción

Donde:
- DEC: Decoradores (001-999)
- BE: BaseEntity (001-999)
- APP: Application (001-999)
- COMP-TEXT: TextInputComponent
- COMP-NUM: NumberInputComponent
- COMP-BOOL: BooleanInputComponent
- COMP-DATE: DateInputComponent
- COMP-EMAIL: EmailInputComponent
- COMP-PASS: PasswordInputComponent
- COMP-ARR: ArrayInputComponent
- COMP-OBJ: ObjectInputComponent
- COMP-LIST: ListInputComponent
- COMP-CORE: Core components
- COMP-LAY: Layout components
- ADV: Advanced features
- CSS: CSS/UI tasks
- STD: Standards tasks
- ENF: Enforcement tasks
```

## Requisitos Específicos

1. **ATOMICIDAD**: Cada tarea debe ser una unidad implementable individualmente

2. **TRAZABILIDAD**: Cada tarea debe referenciar:
   - Archivo de documentación origen
   - Dependencias con otras tareas
   - Criterios de aceptación

3. **PRIORIZACIÓN**: Marcar:
   - Tareas críticas (bloqueantes)
   - Tareas de dependencia
   - Tareas opcionales/futuras

4. **ESTADO**: Indicar:
   - [ ] Por hacer
   - [x] Implementado (si ya existe en el código actual)
   - [~] En progreso
   - [!] Bloqueado

## Formato Esperado
Seguir el formato tasks.md de speckit, organizando por capas y con dependencias claras.

## Validación
El tasks.md resultante debe permitir a cualquier IA o desarrollador:
- Saber exactamente qué implementar y en qué orden
- Identificar dependencias entre tareas
- Trackear progreso de implementación
- Usar como checklist de code review
```

---

## 📋 Prompt 5: Implement

### Comando
```bash
npx @specfy/speckit implement
```

### Prompt

```
# IMPLEMENT - Framework SaaS Vue

## Contexto
Framework Vue 3 + TypeScript con arquitectura de 5 capas YA IMPLEMENTADO. Necesito documentar la implementación actual detalladamente para que sirva de referencia de cómo se implementó cada pieza, con ejemplos de código reales.

## Objetivo
Crear el archivo implement.md que documente la implementación REAL y ACTUAL de cada componente del framework, con snippets de código, patrones utilizados, y decisiones de diseño tomadas.

## IMPORTANTE
Este prompt es diferente a los anteriores. Aquí NO estamos especificando QUÉ hacer, sino documentando QUÉ SE HIZO y CÓMO SE HIZO en el código existente.

## Archivos de Referencia Técnica

### Documentación de Implementación en /copilot
Todos los archivos en `/copilot/layers/` contienen ejemplos e implementaciones:

#### Capa 1: Decoradores
Cada archivo en `/copilot/layers/01-decorators/` contiene:
- Firma TypeScript del decorador
- Implementación técnica
- Ejemplos de uso
- Integración con metadata system

**Documentar implementación de:**
1. Sistema de decoradores base (TypeScript reflection)
2. Almacenamiento en BaseEntity.prototype
3. Cada uno de los 31 decoradores con código real
4. Patrones de decoradores de clase vs propiedad
5. Composición de múltiples decoradores

#### Capa 2: BaseEntity
Archivos en `/copilot/layers/02-base-entity/`:

**De base-entity-core.md:**
- Implementación de clase abstracta
- Sistema de propiedades protegidas
- Constructor con Partial<T>
- Type safety patterns

**De crud-operations.md:**
- Implementación de save() con lógica completa
- Implementación de load() con fetch
- Implementación de delete() con confirmación
- Manejo de errores
- HTTP client integration

**De validation-system.md:**
- Implementación de validate()
- Implementación de validateProperty()
- Integración con decoradores @Required, @Validation
- Manejo de validaciones asíncronas
- Sistema de mensajes de error

**De metadata-access.md:**
- Implementación de getMetadata()
- Implementación de getPropertyMetadata()
- Acceso al prototype chain
- Caching de metadata

**De persistence-methods.md:**
- Implementación de toStorage()
- Implementación de fromStorage()
- Filtrado con @Persistent decorator
- LocalStorage integration

**De lifecycle-hooks.md:**
- Implementación de cada hook
- Patrón de invocación
- Uso de async/await
- Ejemplos de uso en clases concretas

#### Capa 3: Application
Archivos en `/copilot/layers/03-application/`:

**De application-singleton.md:**
- Implementación del singleton pattern
- Sistema de registro de entidades
- Diccionario de módulos
- Type-safe access methods

**De event-bus.md:**
- Implementación de EventBus
- Pattern observer
- Type-safe events
- Cleanup de listeners

**De router-integration.md:**
- Setup de Vue Router
- Generación dinámica de rutas
- Guards implementation
- Navigation helpers

**De ui-services.md:**
- Implementación Toast service
- Implementación Dialog service
- Implementación Loading service
- API reactiva con Vue 3

#### Capa 4: Componentes UI
Archivos en `/copilot/layers/04-components/`:

**Para cada componente, documentar:**
- Setup de componente Vue 3 con <script setup lang="ts">
- Interface de Props
- v-model implementation (defineModel o props/emit)
- Uso de useInputMetadata composable
- Integración con metadata decorators
- Manejo de validación visual
- CSS classes aplicadas
- Responsive behavior
- Accessibility features

**Documentar implementación de:**
1. TextInputComponent con @Mask, @DisplayFormat
2. NumberInputComponent con validación numérica
3. BooleanInputComponent con switch/checkbox
4. DateInputComponent con date picker
5. ArrayInputComponent con add/remove items
6. ObjectInputComponent con nested form
7. ListInputComponent con lookup
8. ActionsComponent con action buttons
9. ComponentContainerComponent con dynamic components
10. DropdownMenuComponent con positioning
11. LoadingScreenComponent con spinner overlay
12. SideBarComponent con navigation
13. TabControllerComponent con reactive tabs
14. TopBarComponent con user menu
15. DetailViewTableComponent con @ViewGroup
16. ToastComponents con positioning y timeout
17. DialogComponents con confirmation logic
18. Modal system con z-index management

#### Capa 5: Avanzado
Archivos en `/copilot/layers/05-advanced/`:

**Documentar:**
- Sistema de Enums (enum registration y display)
- Models auxiliares (interfaces compartidas)
- Router configuration (rutas automáticas)
- Types system (utility types TypeScript)

#### Capa 6: Composables
Archivos en `/copilot/layers/06-composables/`:

**De useInputMetadata.md:**
- Implementación completa del composable
- Uso de computed properties
- Reactive metadata extraction
- Integration con decoradores
- Type inference

### Código Fuente Real

**CRÍTICO**: Debes inspeccionar el código fuente real en:

- `/src/decorations/` - Implementación real de decoradores
- `/src/models/BaseEntity.ts` - Implementación real de BaseEntity (o archivo equivalente)
- `/src/mixins/Application.ts` - Implementación real de Application (o archivo equivalente)
- `/src/components/` - Implementación real de componentes UI
- `/src/composables/useInputMetadata.ts` - Implementación real del composable
- `/src/router/index.ts` - Configuración real del router
- `/src/types/` - Types TypeScript reales
- `/src/enums/` - Enums implementados
- `/src/css/` - Implementación CSS real

### Ejemplos de Uso Real
- `/copilot/examples/classic-module-example.md` - Código completo de módulo
- `/copilot/examples/advanced-module-example.md` - Ejemplo avanzado
- `/copilot/tutorials/01-basic-crud.md` - Tutorial paso a paso
- `/copilot/tutorials/02-validations.md` - Ejemplos de validación
- `/copilot/tutorials/03-relations.md` - Ejemplos de relaciones

### Contratos de Implementación
- `/copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md` - CSS implementado
- `/copilot/06-CODE-STYLING-STANDARDS.md` - Patterns aplicados

## Requisitos Específicos

1. **CÓDIGO REAL**: Incluir snippets de código REALES del proyecto, no ejemplos inventados

2. **DECISIONES DE DISEÑO**: Documentar:
   - Por qué se eligió cierto patrón
   - Trade-offs considerados
   - Alternativas descartadas
   - Problemas encontrados y soluciones

3. **PATRONES TÉCNICOS**:
   - TypeScript patterns (generics, decorators, reflection)
   - Vue 3 patterns (Composition API, reactivity)
   - Architectural patterns (singleton, observer, factory)
   - CSS patterns (utility classes, variables)

4. **INTEGRACIÓN**: Documentar cómo se integran:
   - Decoradores → Metadata → BaseEntity
   - Metadata → Componentes UI
   - BaseEntity → Application → Router
   - Events → Components
   - Validation → UI feedback

5. **HERRAMIENTAS**:
   - Vite configuration
   - TypeScript configuration (tsconfig.json)
   - ESLint & Prettier setup
   - Build process
   - Development workflow

6. **ESTRUCTURA DE ARCHIVOS**:
   - Organización de carpetas
   - Naming conventions aplicadas
   - Barrel exports (index.ts)
   - Module resolution

## Preguntas a Resolver en la Documentación

Para cada componente principal, responder:

1. **¿Cómo se implementó?**
   - Snippet de código
   - Interfaces TypeScript
   - Estructura del archivo

2. **¿Qué tecnología/patrón se usó?**
   - Patrón de diseño
   - APIs de Vue/TypeScript utilizadas
   - Librerías de terceros (si aplica)

3. **¿Cómo se integra con el resto?**
   - Dependencias
   - Consumers
   - Flujo de datos

4. **¿Qué problemas resolvió?**
   - Desafíos técnicos
   - Soluciones implementadas
   - Workarounds necesarios

5. **¿Qué se puede mejorar?**
   - Technical debt identificado
   - Limitaciones actuales
   - Mejoras planificadas

## Formato Esperado

Organizar por capas, siguiendo esta estructura para cada elemento:

```markdown
### [Nombre del Componente/Sistema]

**Archivo**: `src/path/to/file.ts`
**Documentación**: `/copilot/layers/XX/file.md`

#### Implementación

```typescript
// Código real del proyecto
```

#### Decisiones de Diseño
- Por qué se hizo así
- Alternativas consideradas

#### Integración
- Cómo se usa desde otros componentes
- Qué metadata consume/produce

#### Ejemplos de Uso
```typescript
// Ejemplos reales de uso en el proyecto
```

#### Notas Técnicas
- Detalles de implementación
- Gotchas/caveats
- Performance considerations
```

## Validación

El implement.md resultante debe permitir a cualquier IA o desarrollador:
- Entender CÓMO está implementado cada componente actualmente
- Ver código real y funcionando
- Conocer decisiones de diseño y trade-offs
- Identificar patrones reutilizables
- Mantener o extender el código existente siguiendo los mismos patrones
```

---

## 📊 Matriz de Cobertura

Esta tabla asegura que toda la documentación en /copilot está mapeada a un comando de speckit:

| Archivo en /copilot | constitution | specify | plan | tasks | implement |
|---|---|---|---|---|---|
| 00-CONTRACT.md | ✅ Axiomas | ✅ Reglas | ✅ Base | ✅ Setup | ✅ Contracts |
| 01-FRAMEWORK-OVERVIEW.md | ✅ Principios | ✅ Overview | ✅ Fases | - | ✅ Patterns |
| 02-FLOW-ARCHITECTURE.md | - | ✅ Flows | ✅ Order | - | ✅ Flow impl |
| 03-QUICK-START.md | - | ✅ Ejemplos | ✅ Tutorial | - | ✅ Ejemplos |
| 04-UI-DESIGN-SYSTEM-CONTRACT.md | ✅ UI Rules | ✅ CSS Spec | ✅ CSS Phase | ✅ CSS Tasks | ✅ CSS Code |
| 05-ENFORCEMENT-TECHNICAL-CONTRACT.md | ✅ Enforcement | ✅ Process | ✅ Roadmap | ✅ ENF Tasks | ✅ CI/CD |
| 06-CODE-STYLING-STANDARDS.md | ✅ Standards | ✅ Conventions | - | ✅ STD Tasks | ✅ Templates |
| BREAKING-CHANGES.md | - | - | ✅ History | - | ✅ Migrations |
| EXCEPCIONES.md | ✅ Exceptions | - | ✅ Limitations | - | ✅ Workarounds |
| INDEX-MASTER.md | ✅ Hierarchy | ✅ All | ✅ Structure | ✅ All | ✅ All |
| layers/01-decorators/* (31 files) | - | ✅ Each one | ✅ Decorators | ✅ Each one | ✅ Each one |
| layers/02-base-entity/* (9 files) | - | ✅ Each one | ✅ BaseEntity | ✅ Each one | ✅ Each one |
| layers/03-application/* (4 files) | - | ✅ Each one | ✅ App Layer | ✅ Each one | ✅ Each one |
| layers/04-components/* (35+ files) | - | ✅ Each one | ✅ UI Phase | ✅ Each one | ✅ Each one |
| layers/05-advanced/* (4 files) | - | ✅ Each one | ✅ Advanced | ✅ Each one | ✅ Each one |
| layers/06-composables/* (2 files) | - | ✅ Each one | ✅ Composables | ✅ Each one | ✅ Each one |
| examples/* (2 files) | - | ✅ Use cases | ✅ Examples | - | ✅ Real code |
| tutorials/* (3 files) | - | ✅ Workflows | ✅ Learning | - | ✅ Step by step |

**Totales:**
- 7 archivos de contratos principales
- 96+ archivos en /layers (31+9+4+35+4+2)
- 5 archivos de ejemplos/tutoriales
- **Total: ~108 archivos documentados**

---

## 🎯 Instrucciones de Uso

### Paso 1: Constitution
```bash
npx @specfy/speckit constitution
# Copiar Prompt 1 cuando se solicite
```

### Paso 2: Specify
```bash
npx @specfy/speckit specify
# Copiar Prompt 2 cuando se solicite
```

### Paso 3: Plan
```bash
npx @specfy/speckit plan
# Copiar Prompt 3 cuando se solicite
```

### Paso 4: Tasks
```bash
npx @specfy/speckit tasks
# Copiar Prompt 4 cuando se solicite
```

### Paso 5: Implement
```bash
npx @specfy/speckit implement
# Copiar Prompt 5 cuando se solicite
# IMPORTANTE: Este debe inspeccionar el código fuente real en /src
```

---

## ✅ Checklist de Validación

Después de generar cada archivo de speckit, verificar:

### Constitution.md
- [ ] Los 4 axiomas de MI LÓGICA están presentes
- [ ] La jerarquía de contratos está clara
- [ ] El stack tecnológico está definido como inmutable
- [ ] Las consecuencias de incumplimiento están documentadas

### Spec.md
- [ ] Los 31 decoradores están especificados
- [ ] BaseEntity con todos sus métodos está especificado
- [ ] Application singleton está especificado
- [ ] Los 35+ componentes UI están especificados
- [ ] Todos los flujos de 02-FLOW-ARCHITECTURE.md están documentados

### Plan.md
- [ ] Las 7 fases de implementación están definidas
- [ ] Las dependencias entre fases están claras
- [ ] El roadmap futuro está presente
- [ ] Los hitos son medibles

### Tasks.md
- [ ] Hay tareas para cada decorador (31)
- [ ] Hay tareas para cada sección de BaseEntity (~60)
- [ ] Hay tareas para Application (~25)
- [ ] Hay tareas para cada componente UI (~200+)
- [ ] Todas las tareas tienen ID único

### Implement.md
- [ ] Incluye código real de /src
- [ ] Documenta decisiones de diseño
- [ ] Explica patrones utilizados
- [ ] Tiene ejemplos de uso reales
- [ ] Documenta integraciones

---

## 📝 Notas Finales

1. **Preservación Total**: El objetivo principal es que NINGUNA especificación, regla o detalle técnico se pierda en la conversión a formato speckit.

2. **Formato Flexible**: Si el formato estándar de speckit no permite expresar algo crítico de la documentación original, añadir secciones personalizadas.

3. **Código Real**: El prompt de `implement` DEBE inspeccionar el código fuente real en `/src`, no solo basarse en la documentación.

4. **Iteración**: Es probable que se requieran múltiples iteraciones para cubrir todo. Validar después de cada comando.

5. **Referencias Cruzadas**: Los archivos generados deben referenciarse entre sí (constitution → spec → plan → tasks → implement).

---

**Fin del documento**
