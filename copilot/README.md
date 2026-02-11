# 📚 Índice Maestro de Documentación - Framework SaaS Vue

**Versión:** 1.0.0  
**Última actualización:** 11 de Febrero, 2026

---

## 🗺️ Navegación Rápida

### 📋 Documentos Fundamentales
1. [Contrato de Desarrollo](00-CONTRACT.md) - **LEER PRIMERO**
2. [Framework Overview](01-FRAMEWORK-OVERVIEW.md)
3. [Arquitectura de Flujos](02-FLOW-ARCHITECTURE.md)
4. [Quick Start](03-QUICK-START.md)

### 🎓 Tutoriales
- [Tutorial 1: CRUD Básico](tutorials/01-basic-crud.md)
- [Tutorial 2: Validaciones](tutorials/02-validations.md)
- [Tutorial 3: Relaciones (Objetos y Arrays)](tutorials/03-relations.md) ⭐ **NUEVO**

### 📦 Ejemplos Completos
- [Módulo Clásico - Inventario](examples/classic-module-example.md)
- [Módulo Avanzado - Órdenes](examples/advanced-module-example.md)

### 🔧 Capas del Sistema

#### Capa 1: Decoradores
- [PropertyName](layers/01-decorators/property-name-decorator.md) ⭐ FUNDAMENTAL
- [Required](layers/01-decorators/required-decorator.md)
- [Validation](layers/01-decorators/validation-decorator.md)
- [AsyncValidation](layers/01-decorators/async-validation-decorator.md)
- [PropertyIndex](layers/01-decorators/property-index-decorator.md)
- [ViewGroup](layers/01-decorators/view-group-decorator.md)
- [StringTypeDef](layers/01-decorators/string-type-decorator.md)
- [DisplayFormat](layers/01-decorators/display-format-decorator.md)
- [HelpText](layers/01-decorators/help-text-decorator.md)
- [CSSColumnClass](layers/01-decorators/css-column-class-decorator.md)
- [Disabled](layers/01-decorators/disabled-decorator.md)
- [ReadOnly](layers/01-decorators/readonly-decorator.md)
- [HideInListView / HideInDetailView](layers/01-decorators/hide-decorators.md)
- [ModuleName](layers/01-decorators/module-name-decorator.md)
- [ModuleIcon](layers/01-decorators/module-icon-decorator.md)
- [ApiEndpoint](layers/01-decorators/api-endpoint-decorator.md)
- [Persistent](layers/01-decorators/persistent-decorator.md)

#### Capa 2: BaseEntity
- [BaseEntity Core](layers/02-base-entity/base-entity-core.md) ⭐ **NUEVO**
- [CRUD Operations](layers/02-base-entity/crud-operations.md)
- [Validation System](layers/02-base-entity/validation-system.md)
- [Lifecycle Hooks](layers/02-base-entity/lifecycle-hooks.md)
- [Metadata Access](layers/02-base-entity/metadata-access.md) ⭐ **NUEVO**

#### Capa 3: Application
- [Application Singleton](layers/03-application/application-singleton.md)
- [Router Integration](layers/03-application/router-integration.md)
- [Event Bus](layers/03-application/event-bus.md)
- [UI Services](layers/03-application/ui-services.md) ⭐ **NUEVO**

#### Capa 4: Components

**Composables:**
- [useInputMetadata](layers/04-components/useInputMetadata-composable.md) ⭐ **NUEVO**

**Inputs de Formulario:**
- [Form Inputs Overview](layers/04-components/form-inputs.md)
- [TextInputComponent](layers/04-components/text-input-component.md) ⭐ **NUEVO**
- [NumberInputComponent](layers/04-components/number-input-component.md) ⭐ **NUEVO**
- [BooleanInputComponent](layers/04-components/boolean-input-component.md) ⭐ **NUEVO**
- [EmailInputComponent](layers/04-components/email-input-component.md) ⭐ **NUEVO**
- [PasswordInputComponent](layers/04-components/password-input-component.md) ⭐ **NUEVO**
- [DateInputComponent](layers/04-components/date-input-component.md) ⭐ **NUEVO**
- [TextAreaComponent](layers/04-components/textarea-input-component.md) ⭐ **NUEVO**
- [ListInputComponent](layers/04-components/list-input-component.md) ⭐ **NUEVO**
- [ObjectInputComponent](layers/04-components/object-input-component.md) ⭐ **NUEVO**
- [ArrayInputComponent](layers/04-components/array-input-component.md) ⭐ **NUEVO**

**Botones:**
- [Buttons Overview](layers/04-components/buttons-overview.md) ⭐ **NUEVO**

**Modales:**
- [Modal Components](layers/04-components/modal-components.md) ⭐ **NUEVO**

**Informativos:**
- [DetailViewTableComponent](layers/04-components/DetailViewTableComponent.md) ⭐ **NUEVO**

**Layout:**
- [SideBarComponent](layers/04-components/SideBarComponent.md)
- [TopBarComponent](layers/04-components/TopBarComponent.md)

#### Capa 5: Avanzado
- [Custom Components](layers/05-advanced/custom-components.md)
- [Extending BaseEntity](layers/05-advanced/extending-base-entity.md)
- [Creating Decorators](layers/05-advanced/creating-decorators.md)
- [Performance Optimization](layers/05-advanced/performance.md)

---

## 📖 Guía de Lectura Recomendada

### Para Principiantes (Día 1)
1. ✅ [Contrato](00-CONTRACT.md) - 10 min
2. ✅ [Framework Overview](01-FRAMEWORK-OVERVIEW.md) - 20 min
3. ✅ [Quick Start](03-QUICK-START.md) - 15 min
4. ✅ [Tutorial CRUD Básico](tutorials/01-basic-crud.md) - 30 min
5. ✅ [Ejemplo Clásico](examples/classic-module-example.md) - 20 min

**Total: ~1.5 horas**

### Para Desarrollo Intermedio (Semana 1)
1. ✅ [Arquitectura de Flujos](02-FLOW-ARCHITECTURE.md) - 30 min
2. ✅ [Tutorial Validaciones](tutorials/02-validations.md) - 45 min
3. ✅ [Tutorial Relaciones](tutorials/03-relations.md) - 45 min ⭐ **NUEVO**
4. ✅ [Decoradores Principales](layers/01-decorators/) - 2 horas
5. ✅ [BaseEntity Core](layers/02-base-entity/base-entity-core.md) - 45 min
6. ✅ [Componentes de Formulario](layers/04-components/) - 1 hora ⭐ **NUEVO**

**Total: ~6 horas**

### Para Desarrollo Avanzado (Mes 1)
1. ✅ [Ejemplo Avanzado](examples/advanced-module-example.md) - 1 hora
2. ✅ [Custom Components](tutorials/04-custom-components.md) - 1.5 horas
3. ✅ [Patrones Avanzados](tutorials/05-advanced-patterns.md) - 2 horas
4. ✅ [Todos los Decoradores](layers/01-decorators/) - 3 horas
5. ✅ [Extending BaseEntity](layers/05-advanced/extending-base-entity.md) - 1 hora
6. ✅ [Creating Decorators](layers/05-advanced/creating-decorators.md) - 1.5 horas

**Total: ~10 horas**

---

## 🔍 Búsqueda por Tema

### Decoradores

#### Propiedades Básicas
- `@PropertyName` - Define nombre y tipo
- `@PropertyIndex` - Orden de aparición
- `@DefaultProperty` - Identificador por defecto
- `@PrimaryProperty` - Clave primaria

#### Validación
- `@Required` - Campo obligatorio
- `@Validation` - Validación síncrona
- `@AsyncValidation` - Validación asíncrona
- `@Unique` - Valor único

#### UI y Layout
- `@ViewGroup` - Agrupación de campos
- `@ViewGroupRowDecorator` - Layout de filas
- `@HelpText` - Texto de ayuda
- `@DisplayFormat` - Formato de display
- `@CSSColumnClass` - Ancho de columna
- `@HideInListView` - Ocultar en lista
- `@HideInDetailView` - Ocultar en detalle
- `@TabOrder` - Orden de tabs

#### Estado
- `@Disabled` - Deshabilitar campo
- `@ReadOnly` - Solo lectura

#### Tipos Específicos
- `@StringTypeDef` - Subtipo de string (EMAIL, PASSWORD, TEXTAREA)
- `@ArrayOf` - Arrays tipados
- `@Mask` - Máscara de entrada

#### Módulo
- `@ModuleName` - Nombre del módulo
- `@ModuleIcon` - Icono
- `@ModulePermission` - Permisos
- `@ModuleListComponent` - Vista lista custom
- `@ModuleDetailComponent` - Vista detalle custom
- `@ModuleDefaultComponent` - Vista por defecto

#### API y Persistencia
- `@ApiEndpoint` - Endpoint de API
- `@ApiMethods` - Métodos HTTP permitidos
- `@Persistent` - Habilitar persistencia
- `@PersistentKey` - Mapeo de claves

### BaseEntity

#### CRUD
- `save()` - Guardar (POST/PUT)
- `update()` - Actualizar (PUT)
- `delete()` - Eliminar (DELETE)
- `getElementList()` - Obtener lista (GET)
- `getElement()` - Obtener uno (GET)

#### Validación
- `validateInputs()` - Validar todos los campos
- `isRequired()` - Verificar si campo es required
- `isValidation()` - Evaluar validación
- `isAsyncValidation()` - Evaluar async validation

#### Estado
- `getDirtyState()` - Verificar cambios sin guardar
- `resetChanges()` - Descartar cambios
- `isNew()` - Verificar si es nueva instancia

#### Hooks
- `beforeSave()`, `onSaving()`, `afterSave()`, `saveFailed()`
- `beforeUpdate()`, `onUpdating()`, `afterUpdate()`, `updateFailed()`
- `beforeDelete()`, `onDeleting()`, `afterDelete()`, `deleteFailed()`

### Application

#### Navegación
- `changeView()` - Cambiar vista
- `changeViewToListView()` - Ir a lista
- `changeViewToDetailView()` - Ir a detalle
- `changeViewToDefaultView()` - Ir a vista por defecto

#### UI Services
- `showToast()` - Mostrar notificación
- `showModal()` - Abrir modal
- `openConfirmationMenu()` - Menú de confirmación
- `showLoadingMenu()` - Mostrar loading

### Components

#### Inputs de Formulario
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

#### Informativos
- DetailViewTableComponent
- FormGroupComponent
- ToastContainerComponent

---

## 🏷️ Etiquetas y Categorías

### Por Complejidad

**Básico** ⭐
- Quick Start
- Tutorial CRUD Básico
- Ejemplo Clásico
- PropertyName, Required, PropertyIndex

**Intermedio** ⭐⭐
- Validaciones
- Relaciones entre entidades
- ViewGroup, StringTypeDef
- BaseEntity métodos

**Avanzado** ⭐⭐⭐
- Validaciones Asíncronas
- Componentes Custom
- Extending BaseEntity
- Creating Decorators
- Ejemplo Avanzado

### Por Tipo de Tarea

**Setup Inicial**
- Framework Overview
- Quick Start
- Registrar módulos

**Crear Entidades**
- PropertyName
- Required
- PropertyIndex
- Tutorial CRUD

**Validar Datos**
- Required
- Validation
- AsyncValidation
- Tutorial Validaciones

**Personalizar UI**
- ViewGroup
- DisplayFormat
- HelpText
- Custom Components

**Integrar API**
- ApiEndpoint
- Persistent
- CRUD Operations

**Optimizar**
- Performance
- Best Practices

---

## 📊 Estado de Documentación

### Completado ✅
- [x] Contrato
- [x] Framework Overview
- [x] Arquitectura de Flujos
- [x] Quick Start
- [x] PropertyName Decorator
- [x] Required Decorator
- [x] Validation Decorator
- [x] Todos los decoradores (31/31)
- [x] Ejemplo Clásico
- [x] Ejemplo Avanzado
- [x] BaseEntity Core
- [x] Metadata Access
- [x] UI Services
- [x] Form Inputs Overview
- [x] **Tutorial Validaciones**
- [x] **Tutorial Relaciones** ⭐ NUEVO
- [x] CRUD Operations
- [x] Validation System
- [x] Lifecycle Hooks
- [x] Application Singleton
- [x] Router Integration
- [x] Event Bus
- [x] Tutorial 01: CRUD Básico
- [x] **useInputMetadata Composable** ⭐ NUEVO
- [x] **TextInputComponent** ⭐ NUEVO
- [x] **NumberInputComponent** ⭐ NUEVO
- [x] **BooleanInputComponent** ⭐ NUEVO
- [x] **EmailInputComponent** ⭐ NUEVO
- [x] **PasswordInputComponent** ⭐ NUEVO
- [x] **DateInputComponent** ⭐ NUEVO
- [x] **TextAreaComponent** ⭐ NUEVO
- [x] **ListInputComponent** ⭐ NUEVO
- [x] **ObjectInputComponent** ⭐ NUEVO
- [x] **ArrayInputComponent** ⭐ NUEVO
- [x] **Buttons Overview** ⭐ NUEVO
- [x] **Modal Components** ⭐ NUEVO
- [x] **DetailViewTableComponent** ⭐ NUEVO
- [x] Índice Maestro

### En Progreso 🔄
- [ ] Tutorial 4: Componentes Custom
- [ ] Tutorial 5: Patrones Avanzados
- [ ] Sección avanzada completa (Custom Components, Extending BaseEntity, Creating Decorators, Performance)
- [ ] Ejemplos interactivos
- [ ] Troubleshooting guide
- [ ] Migration guide
- [ ] API reference completa

---

## 🤝 Contribuir a la Documentación

### Agregar Nuevo Decorador

1. Crear archivo en `layers/01-decorators/`
2. Seguir template:
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
3. Actualizar este índice
4. Actualizar referencias cruzadas

### Reportar Errores

Si encuentras errores en la documentación:
1. Nota el archivo y sección
2. Describe el error
3. Propón corrección
4. Actualiza la documentación

**Recuerda:** Por contrato, todo cambio debe documentarse.

---

## 🔗 Enlaces Externos

### Tecnologías Utilizadas
- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- [Mitt](https://github.com/developit/mitt)

### Recursos Adicionales
- Vue 3 Composition API
- TypeScript Decorators
- REST API Design
- SaaS Architecture

---

## 📞 Soporte

Para preguntas sobre:
- **Uso básico:** Quick Start + Tutoriales
- **Decoradores:** layers/01-decorators/
- **BaseEntity:** layers/02-base-entity/
- **Errores:** Troubleshooting (pendiente)
- **Contribuir:** Contrato + este índice

---

**Nota:** Esta documentación está en constante evolución. Consulta la fecha de última actualización de cada archivo.
8+ (objetivo: 50+)  
**Recientes:** Tutorial Relaciones, 10 Input Components (Text, Number, Boolean, Email, Password, Date, TextArea, List, Object, Array)

**Última actualización:** 11 de Febrero, 2026  
**Versión del Framework:** 1.0.0  
**Documentos totales:** 30+ (objetivo: 50+)  
**Recientes:** Tutorial Relaciones, Input Components, Buttons, Modals, DetailViewTable
