# Framework SaaS Vue - Spec Kit Documentation

**Propósito:** Punto de entrada central a la documentación contractual y técnica del framework  
**Versión:** 1.0.0  
**Última Actualización:** 17 de Febrero, 2026  
**Total Documentos:** 50+ archivos  
**ID Base:** DOC

### DECLARACIÓN DE CUMPLIMIENTO CONTRACTUAL

Se declara que toda normalización técnica en este repositorio debe ejecutarse bajo principio SPEC FIRST, manteniendo sincronización bidireccional entre documentación y código conforme a contratos 00-06.

Fecha de declaración operativa: 16 de Febrero, 2026.

---

## Navegación Principal

### Sistema de Índices

| Índice | Propósito | Acceso |
|---|---|---|
| **INDEX-MASTER.md** | Navegación semántica (IA-optimized) | [Ver](INDEX-MASTER.md) |
| **layers/README.md** | Índice de 6 capas arquitectónicas | [Ver](layers/README.md) |
| **examples/README.md** | Índice de 2 ejemplos completos | [Ver](examples/README.md) |
| **tutorials/README.md** | Índice de 3 tutoriales prácticos | [Ver](tutorials/README.md) |
| **01-decorators/README.md** | Índice de 31 decoradores | [Ver](layers/01-decorators/README.md) |
| **02-base-entity/README.md** | Índice de especificaciones BaseEntity | [Ver](layers/02-base-entity/README.md) |
| **03-application/README.md** | Índice de singleton Application | [Ver](layers/03-application/README.md) |

**Recomendación:** Usar [INDEX-MASTER.md](INDEX-MASTER.md) para navegación semántica optimizada para IA

---

## Arquitectura de Documentación

### Jerarquía Contractual

```
MI LÓGICA (4 Axiomas: A1-A4)
    ↓
00-CONTRACT.md (CORE)
    ├─→ 05-ENFORCEMENT-TECHNICAL-CONTRACT.md (ENF)
    │       ↓
    │   06-CODE-STYLING-STANDARDS.md (CST)
    └─→ 04-UI-DESIGN-SYSTEM-CONTRACT.md (UI)
    
01-FRAMEWORK-OVERVIEW.md (FWK)
02-FLOW-ARCHITECTURE.md (FLOW)
03-QUICK-START.md (QS)
```

**Prioridad Absoluta:** MI LÓGICA > 00-CONTRACT.md > Contratos Subordinados

---

## Contratos Principales (7)

### 1. Contrato de Desarrollo (00-CONTRACT.md)

**ID:** CORE  
**Líneas:** 902  
**Estado:** ACTIVO - Obligatorio  
**Versión:** 2.0.0

**Secciones Críticas:**
- **L27-89:** MI LÓGICA - 4 Axiomas Inmutables (`CORE-3.1`)
  - **L34:** A1 - Arquitectura de Capas (`CORE-3.1.A1`)
  - **L42:** A2 - Flujo Unidireccional (`CORE-3.1.A2`)
  - **L56:** A3 - Generación desde Metadatos (`CORE-3.1.A3`)
  - **L72:** A4 - Inmutabilidad Estructural (`CORE-3.1.A4`)
- **L161-167:** Prioridad Absoluta de MI LÓGICA (`CORE-6.1`)
- **L169-181:** Autorización para Cambios Mayores (`CORE-6.2`)
- **L243-304:** Índices de Carpetas Contenedoras (`CORE-6.4`)
- **L536-567:** Formato Documental de 11 Secciones (`CORE-6.7.12`)
- **L621-639:** Indexación Estructural Profunda (`CORE-6.8`)

**Conceptos Definidos:**
- Cambio Mayor vs. Menor
- Documentación Sincronizada
- Índice de Carpeta Obligatorio
- Sistema de IDs estables

**Cuándo Consultar:** Antes de cualquier cambio arquitectónico, al crear documentación nueva, al establecer procesos de desarrollo

### 2. Framework Overview (01-FRAMEWORK-OVERVIEW.md)

**ID:** FWK  
**Líneas:** 791  
**Estado:** ACTIVO  
**Versión:** 1.0.0

**Propósito:** Visión completa del framework, arquitectura de 5 capas, flujos principales

**Secciones Críticas:**
- **L45-130:** Arquitectura 5 Capas (`FWK-4.1`)
- **L135-245:** Sistema de Decoradores (`FWK-4.2`)
- **L250-380:** BaseEntity Core (`FWK-4.3`)
- **L385-480:** Application Singleton (`FWK-4.4`)
- **L485-620:** Componentes UI (`FWK-4.5`)

**Cuándo Consultar:** Al iniciar desarrollo, para entender arquitectura general, al onboardear nuevos desarrolladores

### 3. Flow Architecture (02-FLOW-ARCHITECTURE.md)

**ID:** FLOW  
**Líneas:** 920  
**Estado:** ACTIVO  
**Versión:** 1.0.0

**Propósito:** Diagramas y flujos detallados de operaciones (CRUD, validación, navegación)

**Secciones Críticas:**
- **L78-189:** Flujo CRUD Completo (`FLOW-5.1`)
- **L192-304:** Flujo de Validación Tri-Nivel (`FLOW-5.2`)
- **L307-420:** Flujo de Navegación entre Vistas (`FLOW-5.3`)
- **L423-567:** Lifecycle Hooks Detallados (`FLOW-5.4`)
- **L570-712:** EventBus y Comunicación (`FLOW-5.5`)

**Cuándo Consultar:** Al implementar CRUD, al diagnosticar bugs de flujo, al personalizar comportamiento de validación/navegación

### 4. Quick Start (03-QUICK-START.md)

**ID:** QS  
**Líneas:** 563  
**Estado:** ACTIVO  
**Versión:** 1.0.0

**Propósito:** Guía paso a paso para iniciar desarrollo (setup, primera entidad, CRUD básico)

**Secciones Críticas:**
- **L35-78:** Setup de Proyecto (`QS-5.1`)
- **L81-167:** Crear Primera Entidad (`QS-5.2`)
- **L170-304:** Registro en Application (`QS-5.3`)
- **L307-420:** Probar CRUD Automático (`QS-5.4`)
- **L423-530:** Personalizar UI Básica (`QS-5.5`)

**Cuándo Consultar:** Al iniciar proyecto nuevo, para verificar setup correcto, como checklist de implementación básica

### 5. UI/Design System Contract (04-UI-DESIGN-SYSTEM-CONTRACT.md)

**ID:** UI  
**Líneas:** 1221  
**Estado:** ACTIVO - Obligatorio para desarrollo UI  
**Versión:** 2.0.0

**Propósito:** Regula sistema UI/CSS, tokens, anti-hardcode, z-index, responsive design

**Secciones Críticas:**
- **L199-233:** Archivos CSS Centralizados Obligatorios (`UI-6.2`)
- **L235-335:** Sistema Universal de Tokens (`UI-6.3`)
- **L337-455:** Política de Tokenización Obligatoria (`UI-6.4`)
  - **L373-387:** Tabla de Valores Prohibidos (`UI-6.4.2`)
  - **L389-405:** Detección de Hardcode con Scripts (`UI-6.4.3`)
- **L473-497:** Sistema Z-Index Contractual (`UI-6.6`)
- **L499-539:** Estrategia Desktop-First Adaptativo (`UI-6.7`)
- **L557-591:** Manejo de Estados Visuales (`UI-6.9`)

**Símbolos Regulados:**
- **Tokens:** `--ui-*`, `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`
- **Z-Index:** 10 niveles (10=base → 100=toast)
- **Breakpoints:** `--bp-mobile` (768px), `--bp-tablet` (1024px), `--bp-desktop` (1440px)

**Prohibiciones:**
- ❌ Hardcode de colores, espaciados, radios, sombras
- ❌ Z-index arbitrarios fuera del sistema contractual
- ❌ Media queries sin usar tokens de breakpoints

**Cuándo Consultar:** Antes de estilizar componentes, al crear CSS nuevo, al modificar layout responsivo

### 6. Enforcement Technical Contract (05-ENFORCEMENT-TECHNICAL-CONTRACT.md)

**ID:** ENF  
**Líneas:** 2267  
**Estado:** ACTIVO - Obligatorio para desarrollo con IA  
**Versión:** 2.0.0

**Propósito:** Regula desarrollo asistido por IA: AOM, VCC, breaking changes, registro de excepciones

**Secciones Críticas:**
- **L134-155:** Diagrama 3 Fases de Enforcement (`ENF-5.1`)
- **L200-284:** Flujo Completo de Enforcement (`ENF-5.2`)
- **L286-322:** Flujo de Autoverificación Obligatoria (AOM) (`ENF-5.3`)
- **L404-485:** Regla AOM Obligatorio (`ENF-6.2`)
  - **L410-467:** Formato Declaración de Cumplimiento (`ENF-6.2.2`)
- **L487-570:** Validación Cruzada entre Capas (VCC) (`ENF-6.4`)
- **L572-751:** Política de Breaking Changes (`ENF-6.5`)
- **L753-841:** Responsabilidad del Arquitecto (`ENF-6.6`)

### 7. Code Styling Standards Contract (06-CODE-STYLING-STANDARDS.md)

**ID:** CST  
**Líneas:** 2864  
**Estado:** ACTIVO - Obligatorio para todo código  
**Versión:** 1.0.0

**Propósito:** Regula formateo, estructura y estilo de código TypeScript/JavaScript/Vue, garantizando consistencia absoluta y prevención de alucinaciones mediante reglas explícitas

**Secciones Críticas:**
- **L80-142:** Reglas de Formateo (`CST-6.1`)
  - **L88-111:** Indentación: 4 espacios obligatorios (`CST-6.1.1`)
  - **L113-145:** Comillas simples por defecto (`CST-6.1.2`)
  - **L147-221:** PROHIBIDO concatenación con +, OBLIGATORIO template literals (`CST-6.1.3`)
  - **L223-255:** Semicolons obligatorios (`CST-6.1.4`)
  - **L327-382:** Trailing commas obligatorias (`CST-6.1.6`)
  - **L384-451:** Spacing en operadores y llaves (`CST-6.1.7`)
- **L453-751:** Estructura de Código (`CST-6.2`)
  - **L455-545:** Import Order jerárquico estricto (`CST-6.2.1`)
  - **L692-869:** Regions obligatorias: PROPERTIES, METHODS, METHODS OVERRIDES (`CST-6.2.4`)
- **L871-1067:** TypeScript Strict (`CST-6.4`)
  - **L873-938:** PROHIBICIÓN ABSOLUTA de 'any' (`CST-6.4.1`)
  - **L940-1006:** Tipos de retorno explícitos obligatorios (`CST-6.4.2`)
  - **L1056-1134:** Enums sin valores explícitos (`CST-6.4.4`)
- **L1169-1407:** Documentación Obligatoria (`CST-6.5`)
  - **L1171-1229:** JSDoc en propiedades de clases (`CST-6.5.1`)
  - **L1231-1339:** JSDoc en métodos: @param, @returns, @throws (`CST-6.5.2`)
- **L1409-1518:** Git Conventions (`CST-6.6`)
  - **L1411-1477:** Commits en inglés con formato estructurado (`CST-6.6.1`)
  - **L1493-1518:** Autorización obligatoria del usuario para commits (`CST-6.6.3`)
- **L1520-1589:** Integración con tsconfig.json (`CST-6.7`)

**Reglas Obligatorias:**
- ✅ Indentación: 4 espacios (no tabs)
- ✅ Template literals para strings con variables
- ✅ Tipado explícito, prohibido 'any'
- ✅ Regions en clases
- ✅ JSDoc obligatorio en propiedades y métodos públicos
- ✅ Commits en inglés solo con autorización

**Prohibiciones:**
- ❌ Concatenación con + en strings dinámicos
- ❌ Uso de tipo 'any'
- ❌ Enums con valores asignados
- ❌ Commits sin autorización del usuario
- ❌ Código sin documentación JSDoc

**Cuándo Consultar:** Antes de escribir código, al generar código con IA, en code reviews, antes de commits
- **L843-900+:** Registro de Excepciones (`ENF-6.7`)

**Procesos Definidos:**
1. **AOM:** Autoverificación Obligatoria del Modelo antes de finalizar
2. **VCC:** Validación Cruzada entre Capas para breaking changes
3. **Breaking Change Detection:** Log de cambios que rompen contratos
4. **Exception Registry:** Registro formal de excepciones contractuales

**Cuándo Consultar:** Antes de usar IA para desarrollo, al hacer cambios mayores, al registrar excepciones

---

## Capas del Framework (6 Capas)

### Capa 1: Decoradores (31 decoradores)

**Índice:** [layers/01-decorators/README.md](layers/01-decorators/README.md)  
**ID Base:** DEC

**Categorías:**
- **Propiedad (11):** PropertyName, PropertyIndex, PrimaryProperty, DefaultProperty, etc.
- **Validación (3):** Required, Validation, AsyncValidation
- **UI/Layout (8):** ViewGroup, DisplayFormat, CSSColumnClass, HelpText, TabOrder, etc.
- **Módulo (8):** ModuleName, ModuleIcon, ApiEndpoint, Persistent, etc.
- **API (4):** ApiEndpoint, ApiMethods, Persistent, PersistentKey

**Decoradores Obligatorios por Escenario:**
- **Entidad básica:** `@ModuleName`, `@PropertyName`, `@PropertyIndex`
- **Con persistencia:** + `@ApiEndpoint`, `@Persistent`, `@PersistentKey`
- **Con validación:** + `@Required`, `@Validation`, `@AsyncValidation`

**Búsqueda Rápida:**
- **Definir propiedades:** `@PropertyName` (`DEC::property-name`)
- **Validar datos:** `@Required`, `@Validation`, `@AsyncValidation`
- **Personalizar UI:** `@ViewGroup`, `@DisplayFormat`, `@HelpText`
- **Integrar API:** `@ApiEndpoint`, `@Persistent`

### Capa 2: BaseEntity (9 especificaciones)

**Índice:** [layers/02-base-entity/README.md](layers/02-base-entity/README.md)  
**ID Base:** BE

**Especificaciones:**
1. **base-entity-core.md** - Estructura fundamental (`BE::core`)
2. **crud-operations.md** - Métodos CRUD (`BE::crud`)
3. **validation-system.md** - Sistema de validación (`BE::validation`)
4. **lifecycle-hooks.md** - Hooks de ciclo de vida (`BE::hooks`)
5. **metadata-access.md** - Acceso a metadatos (`BE::metadata`)
6. **dirty-state.md** - Detección de cambios (`BE::dirty-state`)
7. **ui-services.md** - Servicios de UI (toasts, modals) (`BE::ui-services`)
8. **api-http.md** - Integración HTTP (`BE::http`)
9. **advanced-crud.md** - CRUD avanzado (relaciones) (`BE::advanced-crud`)

**Métodos Principales (40+):**
- **CRUD:** `save`, `update`, `delete`, `getElement`, `getElementList`
- **Validación:** `validateInputs`, `isRequired`, `isValidation`, `isAsyncValidation`
- **Estado:** `getDirtyState`, `resetChanges`, `isNew`
- **Metadatos:** `getProperties`, `getPropertyType`, `getViewGroups`

**Lifecycle Hooks (23):**
- **Save:** `beforeSave`, `onSaving`, `afterSave`, `saveFailed`
- **Update:** `beforeUpdate`, `onUpdating`, `afterUpdate`, `updateFailed`
- **Delete:** `beforeDelete`, `onDeleting`, `afterDelete`, `deleteFailed`
- **Load:** `beforeLoad`, `onLoading`, `afterLoad`, `loadFailed`

### Capa 3: Application (4 especificaciones)

**Índice:** [layers/03-application/README.md](layers/03-application/README.md)  
**ID Base:** APP

**Especificaciones:**
1. **application-singleton.md** - Singleton central (`APP::singleton`)
2. **router-integration.md** - Integración Vue Router (`APP::router`)
3. **event-bus.md** - Sistema de eventos (Mitt) (`APP::eventbus`)
4. **ui-services.md** - Servicios UI globales (`APP::ui-services`)

**Propiedades Principales:**
- `View`: Vista actual (LOADING, HOME, LIST_VIEW, DETAIL_VIEW, DEFAULT_VIEW)
- `ModuleList`: Lista de módulos registrados (BaseEntity[])
- `router`: Instancia de Vue Router
- `axiosInstance`: Cliente HTTP configurado
- `eventBus`: Instancia de Mitt para eventos

**Métodos de Navegación:**
- `changeView(view)` - Cambiar vista arbitraria
- `changeViewToListView(module)` - Ir a lista
- `changeViewToDetailView(module, element?)` - Ir a detalle
- `changeViewToDefaultView(module)` - Ir a vista por defecto

**Métodos de UI Services:**
- `showToast(message, type, duration)` - Notificación toast
- `showModal(component, props)` - Abrir modal
- `openConfirmationMenu(message, onConfirm)` - Menú de confirmación
- `showLoadingMenu(show)` - Toggle loading global

### Capa 4: Components (16+ componentes)

**Ubicación:**`/src/components/`  
**Subdirectorios:** `Form/`, `Buttons/`, `Modal/`, `Informative/`

**Composables:**
- `useInputMetadata.ts` - Extrae metadatos de decoradores

**Inputs de Formulario (10):**
- TextInputComponent, NumberInputComponent, BooleanInputComponent
- EmailInputComponent, PasswordInputComponent, DateInputComponent
- TextAreaComponent, ListInputComponent
- ObjectInputComponent, ArrayInputComponent

**Botones (5+):**
- AddButton, SaveButton, DeleteButton, EditButton, CancelButton

**Modales (3+):**
- ConfirmationModal, LoadingModal, CustomModal

**Informativos (3+):**
- DetailViewTableComponent, ToastComponent, ErrorComponent

### Capa 5: Advanced (9 especificaciones)

**Subdirectorios:** `/src/enums/`, `/src/models/`, `/src/router/`, `/src/types/`

**Especificaciones:**
1. **Enums.md** - Enumeraciones del sistema (View, ViewType, APIMethod)
2. **Models.md** - Modelos del framework (ModuleMetadata, PropertyMetadata)
3. **Router.md** - Sistema de enrutamiento Vue Router
4. **Types.md** - Tipos TypeScript del framework

### Capa 6: Composables (1+ composables)

**Ubicación:** `/src/composables/`

**Composables:**
- `useInputMetadata.ts` - Composable de metadatos (`COMP::input-metadata`)

---

## Recursos de Aprendizaje

### Tutoriales (3)

**Índice Completo:** [tutorials/README.md](tutorials/README.md)

| ID | Archivo | Nivel | Tiempo | Descripción |
|---|---|---|---|---|
| TUT::01 | [01-basic-crud.md](tutorials/01-basic-crud.md) | Básico | 30 min | CRUD completo paso a paso |
| TUT::02 | [02-validations.md](tutorials/02-validations.md) | Intermedio | 45 min | Sistema de validaciones tri-nivel |
| TUT::03 | [03-relations.md](tutorials/03-relations.md) | Intermedio | 60 min | Relaciones 1:1 y 1:N entre entidades |

**Ruta de Aprendizaje Recomendada:**
1. **Día 1:** Leer CORE + FWK + QS (45 min) → Hacer TUT::01 (30 min)
2. **Semana 1:** Leer FLOW (30 min) → Hacer TUT::02 + TUT::03 (1.75 hrs) → Explorar decoradores (2 hrs)
3. **Mes 1:** Estudiar ejemplos (3 hrs) → Explorar BaseEntity y Application (3 hrs)

### Ejemplos (2)

**Índice Completo:** [examples/README.md](examples/README.md)

| ID | Archivo | Complejidad | Descripción |
|---|---|---|---|
| EX::classic | [classic-module-example.md](examples/classic-module-example.md) | Intermedia | Módulo Inventario (CRUD clásico, 18 decoradores) |
| EX::advanced | [advanced-module-example.md](examples/advanced-module-example.md) | Avanzada | Módulo Órdenes (relaciones, validaciones async, máscaras, 25+ decoradores) |

**Diferencias Clave:**
- **Classic:** CRUD simple, validaciones básicas (Required), formateo básico (DisplayFormat), sin relaciones
- **Advanced:** CRUD con relaciones (1:1 Customer, 1:N OrderItems), validaciones async (stock), máscaras (orderNumber), campos calculados (total), ViewGroups

---

## Búsqueda por Necesidad

### Empezar Desarrollo

1. Leer: [03-QUICK-START.md](03-QUICK-START.md) - 15 min
2. Hacer: [tutorials/01-basic-crud.md](tutorials/01-basic-crud.md) - 30 min
3. Estudiar: [examples/classic-module-example.md](examples/classic-module-example.md) - 1 hr

### Crear Entidad Simple

**Decoradores Obligatorios:**
- `@ModuleName` → [layers/01-decorators/module-name-decorator.md](layers/01-decorators/module-name-decorator.md)
- `@PropertyName` → [layers/01-decorators/property-name-decorator.md](layers/01-decorators/property-name-decorator.md)
- `@PropertyIndex` → [layers/01-decorators/property-index-decorator.md](layers/01-decorators/property-index-decorator.md)

**Decoradores Recomendados:**
- `@Required` → [layers/01-decorators/required-decorator.md](layers/01-decorators/required-decorator.md)
- `@PropertyPrimaryKey` → [layers/01-decorators/primary-property-decorator.md](layers/01-decorators/primary-property-decorator.md)

**Tutorial:** [tutorials/01-basic-crud.md](tutorials/01-basic-crud.md) → `TUT::01::create`

### Validar Datos

**Validación Básica (Required):**
- Decorador: `@Required` → [layers/01-decorators/required-decorator.md](layers/01-decorators/required-decorator.md)

**Validación Síncrona (Custom):**
- Decorador: `@Validation` → [layers/01-decorators/validation-decorator.md](layers/01-decorators/validation-decorator.md)
- Tutorial: [tutorials/02-validations.md](tutorials/02-validations.md) → `TUT::02::sync`

**Validación Asíncrona (API):**
- Decorador: `@AsyncValidation` → [layers/01-decorators/async-validation-decorator.md](layers/01-decorators/async-validation-decorator.md)
- Tutorial: [tutorials/02-validations.md](tutorials/02-validations.md) → `TUT::02::async`
- Ejemplo: [examples/advanced-module-example.md](examples/advanced-module-example.md) → `EX::advanced::validations`

### Relacionar Entidades

**Relación 1:1 (Objeto):**
- Decorador: `@PropertyName(typeof BaseEntity)` → [layers/01-decorators/property-name-decorator.md](layers/01-decorators/property-name-decorator.md)
- Tutorial: [tutorials/03-relations.md](tutorials/03-relations.md) → `TUT::03::one-to-one`
- Ejemplo: [examples/advanced-module-example.md](examples/advanced-module-example.md) → `EX::advanced::relations` (Customer)

**Relación 1:N (Array):**
- Decorador: `@PropertyName(Array)` → [layers/01-decorators/property-name-decorator.md](layers/01-decorators/property-name-decorator.md)
- Tutorial: [tutorials/03-relations.md](tutorials/03-relations.md) → `TUT::03::one-to-many`
- Ejemplo: [examples/advanced-module-example.md](examples/advanced-module-example.md) → `EX::advanced::relations` (OrderItems)

### Personalizar UI

**Agrupar Campos (ViewGroups):**
- Decorador: `@ViewGroup` → [layers/01-decorators/view-group-decorator.md](layers/01-decorators/view-group-decorator.md)
- Ejemplo: [examples/advanced-module-example.md](examples/advanced-module-example.md) → `EX::advanced::ui`

**Formatear Display:**
- Decorador: `@DisplayFormat` → [layers/01-decorators/display-format-decorator.md](layers/01-decorators/display-format-decorator.md)
- Uso: Currency, Date, Percentage

**Ayuda al Usuario:**
- Decorador: `@HelpText` → [layers/01-decorators/help-text-decorator.md](layers/01-decorators/help-text-decorator.md)

**Layout Responsive:**
- Decorador: `@CssColumnClass` → [layers/01-decorators/css-column-class-decorator.md](layers/01-decorators/css-column-class-decorator.md)
- Contrato: [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md) → `UI-6.7` (Mobile- First)

### Integrar API REST

**Configurar Endpoint:**
- Decorador: `@ApiEndpoint` → [layers/01-decorators/api-endpoint-decorator.md](layers/01-decorators/api-endpoint-decorator.md)
- Ejemplo: `@ApiEndpoint('/api/products')`

**Habilitar Persistencia:**
- Decorador: `@Persistent` → [layers/01-decorators/persistent-decorator.md](layers/01-decorators/persistent-decorator.md)
- Decorador: `@PersistentKey` → [layers/01-decorators/persistent-key-decorator.md](layers/01-decorators/persistent-key-decorator.md)

**Usar Métodos CRUD:**
- Métodos: [layers/02-base-entity/crud-operations.md](layers/02-base-entity/crud-operations.md) → `BE::crud`
- `save()`, `update()`, `delete()`, `getElement()`, `getElementList()`

### Diagnosticar Errores

**Ver Flujos Completos:**
- CRUD: [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) → `FLOW-5.1`
- Validación: [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) → `FLOW-5.2`
- Navegación: [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) → `FLOW-5.3`

**Lifecycle Hooks:**
- Spec: [layers/02-base-entity/lifecycle-hooks.md](layers/02-base-entity/lifecycle-hooks.md) → `BE::hooks`
- Flujo: [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) → `FLOW-5.4`

**EventBus:**
- Spec: [layers/03-application/event-bus.md](layers/03-application/event-bus.md) → `APP::eventbus`
- Flujo: [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) → `FLOW-5.5`

### Cumplir Contratos

**Antes de Cambios Arquitectónicos:**
- Leer: [00-CONTRACT.md](00-CONTRACT.md) → `CORE-6.2` (Autorización Cambios Mayores)
- Leer: [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) → `ENF-6.5` (Política Breaking Changes)

**Antes de Estilizar UI:**
- Leer: [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md) → `UI-6.4` (Política Anti-Hardcode)
- Verificar: Tabla de Valores Prohibidos (`UI-6.4.2`)

**Antes de Finalizar Desarrollo con IA:**
- Ejecutar: AOM (Autoverificación Obligatoria del Modelo) → `ENF-6.2`
- Formato: [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) → `ENF-6.2.2` (Declaración de Cumplimiento)

---

## Convenciones del Sistema de Índices

### Sistema de IDs Estables

**Formato:** `{CONTRATO}-{SECCION}[.{SUBSECCION}]*`

**Ejemplos:**
- `CORE-3.1.A1` = Contrato 00 → Sección 3.1 → Axioma A1
- `FWK-4.2` = Framework Overview → Sección 4.2 (Decoradores)
- `FLOW-5.1` = Flow Architecture → Sección 5.1 (Flujo CRUD)
- `UI-6.4.2` = UI Contract → Sección 6.4.2 (Tabla Valores Prohibidos)

**IDs por Elemento:**
- `DEC::property-name` = Decorador PropertyName
- `BE::save` = Método save de BaseEntity
- `APP::singleton` = Application Singleton
- `TUT::01` = Tutorial 01
- `EX::classic` = Ejemplo Clásico

### Categorización por Tipo

- **Regla:** Prohibición o exigencia ("NO hacer X", "DEBE hacer Y")
- **Proceso:** Secuencia de pasos o flujo
- **Definición:** Concepto, clase, interfaz
- **Flujo:** Diagrama o secuencia temporal
- **Prohibición:** Restricción técnica explícita

---

## Reglas de Mantenimiento

### Actualización de Índices

**OBLIGATORIO** (según `CORE-6.4`):
- Actualizar índice maestro al agregar/modificar documentación
- Actualizar índices de carpeta al agregar/modificar archivos en carpeta
- Mantener líneas exactas sincronizadas con archivos fuente
- Revisar referencias cruzadas entre índices

**Proceso:**
1. Modificar archivo fuente
2. Actualizar `README.md` de carpeta correspondiente
3. Actualizar `INDEX-MASTER.md` si es cambio significativo
4. Actualizar este `README.md` principal si es documento contractual o capa nueva

### Creación de Documentación Nueva

**Template para Decoradores:**
- Usar template de 11 secciones (según `CORE-6.7.12`)
- Ubicar en `/copilot/layers/01-decorators/`
- Actualizar `layers/01-decorators/README.md`

**Template para Especificaciones:**
- Usar template de 11 secciones
- Ubicar en carpeta de capa correspondiente
- Actualizar README de carpeta

**Template para Tutoriales:**
- Formato paso a paso con secciones numeradas
- Ubicar en `/copilot/tutorials/`
- Actualizar `tutorials/README.md`

---

## Stack Tecnológico

**Frontend:**
- **Vue 3** - Framework reactivo
- **TypeScript** - Sistema de tipos y decoradores
- **Vite** - Build tool

**Comunicación:**
- **Axios** - Cliente HTTP para API REST

**Utilidades:**
- **Mitt** - Event Bus para comunicación desacoplada

**Routing:**
- **Vue Router** - Sistema de enrutamiento SPA

---

## Estado de Documentación

**Completado (50+ documentos):**
- ✓ 6 Contratos principales
- ✓ 31 Decoradores (100%)
- ✓ 9 Especificaciones BaseEntity
- ✓ 4 Especificaciones Application
- ✓ 16+ Componentes UI
- ✓ 3 Tutoriales prácticos
- ✓ 2 Ejemplos completos
- ✓ 7 Índices semánticos

**Planificado (Futuro):**
- ⏳ Troubleshooting guide
- ⏳ Migration guide (upgrades)
- ⏳ API reference expandida
- ⏳ Ejemplos interactivos
- ⏳ Video tutoriales

---

**Última Actualización:** 13 de Febrero, 2026  
**Versión del Framework:** 1.0.0  
**Versión de Documentación:** 2.0.0  
**Total Archivos:** 50+  
**Mantenimiento:** Actualizar al agregar/modificar documentación
