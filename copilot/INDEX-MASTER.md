# INDEX MASTER - Framework SaaS Vue Spec Kit

**Versión:** 1.1.0  
**Generado:** 13 de Febrero, 2026  
**Última Actualización:** 15 de Febrero, 2026  
**Propósito:** Sistema de navegación semántica determinista para localización rápida por IA

## Mapa Jerárquico de Contratos

### Jerarquía Normativa

```
MI LÓGICA (Axiomas A1-A4)
    ↓
CORE: 00-CONTRACT.md (Contrato Principal)
    ↓
ENF: 05-ENFORCEMENT-TECHNICAL-CONTRACT.md (Enforcement)
    ↓
CST: 06-CODE-STYLING-STANDARDS.md (Code Styling)
    ↓
UI: 04-UI-DESIGN-SYSTEM-CONTRACT.md (UI/CSS)
    ↓
FWK: 01-FRAMEWORK-OVERVIEW.md (Descriptivo)
FLOW: 02-FLOW-ARCHITECTURE.md (Descriptivo)
QS: 03-QUICK-START.md (Guía)
```

### Contratos Principales (Layer 0)

| ID | Archivo | Tipo | Propósito | Líneas | Versión | Estado |
|---|---|---|---|---|---|---|
| CORE | 00-CONTRACT.md | Contrato Vinculante | Reglas obligatorias y MI LÓGICA | 950+ | v2.3.0 | ACTIVO |
| FWK | 01-FRAMEWORK-OVERVIEW.md | Documento Descriptivo | Visión general arquitectura | 792 | v1.0.0 | ACTIVO |
| FLOW | 02-FLOW-ARCHITECTURE.md | Documento Descriptivo | Flujos del sistema | 921 | v1.0.0 | ACTIVO |
| QS | 03-QUICK-START.md | Guía Práctica | Tutorial inicio rápido | 564 | v1.0.0 | ACTIVO |
| UI | 04-UI-DESIGN-SYSTEM-CONTRACT.md | Contrato Subordinado | Sistema UI/CSS | 1100+ | v2.0.0 | ACTIVO |
| ENF | 05-ENFORCEMENT-TECHNICAL-CONTRACT.md | Contrato Subordinado | Enforcement técnico | 2280+ | v1.4.0 | ACTIVO |
| CST | 06-CODE-STYLING-STANDARDS.md | Contrato Subordinado | Estándares de code styling | 2450+ | v1.1.0 | ACTIVO |

### Documentación de Capas (Layer 1-6)

| ID | Carpeta | Contenido | README |
|---|---|---|---|
| DEC | layers/01-decorators/ | 31 archivos de decoradores | Sí |
| BE | layers/02-base-entity/ | 9 archivos BaseEntity | Sí |
| APP | layers/03-application/ | 4 archivos Application | Sí |
| COMP | layers/04-components/ | Componentes UI | Pendiente |
| ADV | layers/05-advanced/ | Funcionalidades avanzadas | Pendiente |
| COMPO | layers/06-composables/ | Composables Vue | Pendiente |

### Recursos Adicionales (Layer Auxiliar)

| ID | Carpeta | Contenido | README |
|---|---|---|---|
| TUT | tutorials/ | 3 tutoriales | Sí |
| EX | examples/ | 2 ejemplos | Sí |
| DOC | copilot/ | Documentación raíz | Sí |

---

## Matriz de Relación Cruzada

### Dependencias entre Contratos

| Contrato | Depende De | Regula A | Impacta En |
|---|---|---|---|
| CORE | MI LÓGICA | Todo el framework | FWK, FLOW, QS, UI, ENF |
| ENF | CORE, MI LÓGICA | Procesos de desarrollo | CORE, UI, FWK, FLOW |
| UI | CORE, MI LÓGICA | Sistema visual | COMP, ADV |
| FWK | CORE | - | BE, APP, DEC, COMP |
| FLOW | CORE, FWK | - | BE, APP, DEC, COMP |
| QS | CORE, FWK, FLOW | - | TUT, EX |

### Relación Capas ↔ Contratos

| Capa (ID) | CORE | FWK | FLOW | UI | ENF |
|---|---|---|---|---|---|
| DEC | ✓ | ✓ | ✓ | - | ✓ |
| BE | ✓ | ✓ | ✓ | - | ✓ |
| APP | ✓ | ✓ | ✓ | - | ✓ |
| COMP | ✓ | ✓ | ✓ | ✓ | ✓ |
| ADV | ✓ | ✓ | - | - | ✓ |
| COMPO | ✓ | ✓ | - | - | ✓ |

---

## Índice de Secciones Principales por Contrato

### CORE: 00-CONTRACT.md

| ID | Sección | Tipo | Líneas | Descripción |
|---|---|---|---|---|
| CORE-1 | Propósito | Definición | 8-11 | Establece principios contractuales vinculantes |
| CORE-2 | Alcance | Regla | 13-19 | Define ámbito de aplicación del contrato |
| CORE-3 | Definiciones Clave | Definición | 21-98 | MI LÓGICA y conceptos fundamentales |
| CORE-3.1 | MI LÓGICA | Axioma | 27-89 | 4 axiomas arquitectónicos inmutables (A1-A4) |
| CORE-3.1.A1 | Arquitectura de Capas | Axioma | ~35-42 | 5 capas obligatorias del sistema |
| CORE-3.1.A2 | Flujo Unidireccional | Axioma | ~44-46 | Dirección de datos sin bypass |
| CORE-3.1.A3 | Generación desde Metadatos | Axioma | ~48-50 | UI como función pura de metadatos |
| CORE-3.1.A4 | Inmutabilidad Estructural | Axioma | ~52-54 | Stack tecnológico inmutable |
| CORE-3.2 | Cambio Mayor | Definición | ~92 | Modificación que altera arquitectura core |
| CORE-3.3 | Cambio Menor | Definición | ~94 | Extensión sin modificar existente |
| CORE-4 | Descripción Técnica | Especificación | 100-143 | Naturaleza y arquitectura del framework |
| CORE-4.2 | Arquitectura en Capas | Diagrama | 108-120 | Diagrama visual de 5 capas |
| CORE-5 | Flujo de Funcionamiento | Proceso | 145-157 | Flujo principal de operación |
| CORE-6 | Reglas Obligatorias | Regla | 159-720+ | 11 reglas obligatorias principales |
| CORE-6.1 | Prioridad Absoluta MI LÓGICA | Regla | 161-167 | MI LÓGICA tiene prioridad absoluta |
| CORE-6.2 | Autorización Cambios Mayores | Proceso | 169-181 | Proceso obligatorio de autorización |
| CORE-6.3 | Documentación Mandatoria | Regla | 183-241 | Sincronización código-documentación |
| CORE-6.4 | Índices de Carpetas | Regla | 243-304 | Obligación de mantener README.md |
| CORE-6.4.3 | Contenido Obligatorio Índice | Especificación | 267-283 | Estructura de índices |
| CORE-6.5 | Sincronización Código-Docs | Axioma | 305-308 | Código sin docs = inválido |
| CORE-6.6 | Workflow de Desarrollo | Proceso | 310-392 | **[NUEVO v2.3.0]** Principio Spec-First Design |
| CORE-6.6.1 | Principio Spec-First | Axioma | 312-328 | Spec (.md) es source of truth aspiracional |
| CORE-6.6.2 | Antes de Codificar | Checklist | 330-347 | Diseñar/Validar Spec PRIMERO |
| CORE-6.6.3 | Durante Desarrollo | Checklist | 349-358 | Implementar según spec exacto |
| CORE-6.6.4 | Después de Codificar | Checklist | 360-370 | Validar coherencia Spec ↔ Código |
| CORE-6.6.5 | Tabla Orden Modificación | Tabla | 372-392 | Referencia rápida 5 situaciones |
| CORE-6.7 | Régimen Reestructuración | Prohibición | 394-615 | Reglas para reestructuración documental |
| CORE-6.7.2 | Principio Inmutabilidad | Axioma | 400-414 | Inmutabilidad arquitectónica |
| CORE-6.7.3 | Principio Anti-Alucinación | Prohibición | 416-434 | Prohibición de inferir información |
| CORE-6.7.12 | Formato 11 Secciones | Formato | 570-601 | Plantilla documental obligatoria |
| CORE-6.8 | Sistema UI/CSS | Referencia | 603-612 | Referencia a contrato UI |
| CORE-6.9 | Enforcement Técnico | Referencia | 614-653 | Referencia a contrato enforcement |
| CORE-6.10 | Indexación Estructural | Regla | 655-673 | Indexación profunda obligatoria |
| CORE-7 | Prohibiciones | Prohibición | 675-713 | Prohibiciones arquitectónicas y documentales |
| CORE-8 | Dependencias | Especificación | 715-720 | Dependencias del contrato |
| CORE-9 | Relaciones | Especificación | 722-732 | Relaciones con otros elementos |
| CORE-10 | Notas de Implementación | Guía | 734-837 | Versionamiento y aplicabilidad |
| CORE-11 | Referencias Cruzadas | Índice | 839-900+ | Documentos vinculados |

### FWK: 01-FRAMEWORK-OVERVIEW.md

| ID | Sección | Tipo | Líneas | Descripción |
|---|---|---|---|---|
| FWK-1 | Propósito | Definición | 3-7 | Sistema generación automática interfaces CRUD |
| FWK-2 | Alcance | Especificación | 9-20 | Cobertura completa del framework |
| FWK-3 | Definiciones Clave | Definición | 22-43 | Conceptos fundamentales del framework |
| FWK-3.1 | Meta-Programming | Definición | 24 | Programación mediante metadatos declarativos |
| FWK-3.2 | BaseEntity | Definición | 26-27 | Clase base con lógica CRUD |
| FWK-3.3 | Application | Definición | 29-30 | Singleton gestor de estado |
| FWK-3.4 | Decoradores | Definición | 32 | Funciones almacenan metadatos |
| FWK-4 | Descripción Técnica | Especificación | 45-228 | Arquitectura en 5 capas |
| FWK-4.1 | Capa 1: Entidades | Especificación | 49-54 | Definición de modelos |
| FWK-4.2 | Capa 2: Decoradores | Especificación | 58-76 | Enriquecimiento con metadatos |
| FWK-4.3 | Capa 3: BaseEntity | Especificación | 80-91 | Motor CRUD automático |
| FWK-4.4 | Capa 4: Application | Especificación | 95-108 | Orquestador global |
| FWK-4.5 | Capa 5: UI Components | Especificación | 112-118 | Generación dinámica de UI |
| FWK-4.6 | BaseEntity Core | Especificación | 122-132 | Métodos y capacidades BaseEntity |
| FWK-4.7 | Application Singleton | Especificación | 134-153 | Gestión de estado global |
| FWK-4.8 | Sistema Decoradores | Especificación | 157-168 | 35+ decoradores por categoría |
| FWK-4.9 | Componentes UI | Especificación | 172-208 | Componentes de formulario y layout |
| FWK-4.10 | Sistema Metadatos | Especificación | 210-228 | Almacenamiento y recuperación |
| FWK-5 | Flujo de Funcionamiento | Proceso | 230-301 | Flujo completo desde definición |
| FWK-5.1 | Definición | Ejemplo | 232-251 | Ejemplo entidad Customer |
| FWK-5.2 | Registro | Ejemplo | 253-257 | Registro en Application |
| FWK-5.3 | Navegación Automática | Proceso | 259-263 | Sidebar y Router |
| FWK-5.4 | Generación UI | Proceso | 265-283 | Lectura metadatos y renderizado |
| FWK-5.5 | Interacción Usuario | Proceso | 285-301 | Flujo guardado completo |
| FWK-6 | Reglas Obligatorias | Regla | 303-321 | 13 reglas obligatorias |
| FWK-7 | Prohibiciones | Prohibición | 323-340 | 14 prohibiciones absolutas |
| FWK-8 | Dependencias | Especificación | 342-361 | Dependencias externas e internas |
| FWK-9 | Relaciones | Especificación | 363-402 | Relaciones entre componentes |
| FWK-10 | Notas de Implementación | Guía | 404-792 | Curva aprendizaje y métricas |

### FLOW: 02-FLOW-ARCHITECTURE.md

| ID | Sección | Tipo | Líneas | Descripción |
|---|---|---|---|---|
| FLOW-1 | Propósito | Definición | 3-6 | Define arquitectura de flujos |
| FLOW-2 | Alcance | Especificación | 8-21 | Cobertura de flujos del sistema |
| FLOW-3 | Definiciones Clave | Definición | 23-38 | Conceptos de flujos |
| FLOW-4 | Descripción Técnica | Especificación | 40-121 | Arquitectura general con diagrama |
| FLOW-4.1 | Diagrama de Capas | Diagrama | 45-121 | Diagrama visual completo |
| FLOW-5 | Flujo de Funcionamiento | Proceso | 123-817 | 10 flujos principales detallados |
| FLOW-5.1 | Flujo Principal | Proceso | 125-179 | De Entidad a UI |
| FLOW-5.1.1 | Fase Inicialización | Proceso | 127-151 | Inicialización aplicación |
| FLOW-5.2 | Flujo Navegación | Proceso | 181-256 | Usuario selecciona módulo |
| FLOW-5.3 | Flujo ListView | Código | 258-330 | Visualización tabla |
| FLOW-5.4 | Flujo DetailView | Código | 332-448 | Formularios edición |
| FLOW-5.5 | Flujo Validación | Proceso | 450-565 | Validación multi-nivel |
| FLOW-5.6 | Flujo Persistencia | Código | 567-680 | Guardado en API |
| FLOW-5.7 | Flujo Estado | Proceso | 682-726 | Detección cambios (dirty state) |
| FLOW-5.8 | Flujo Componentes Custom | Ejemplo | 728-756 | Uso de @ModuleDefaultComponent |
| FLOW-5.9 | Flujo Interceptores HTTP | Código | 758-793 | Request/Response interceptors |
| FLOW-5.10 | Flujo EventBus | Ejemplo | 795-817 | Emisión y escucha eventos |
| FLOW-6 | Reglas Obligatorias | Regla | 819-835 | 10 reglas de flujos |
| FLOW-7 | Prohibiciones | Prohibición | 837-849 | 10 prohibiciones de flujos |
| FLOW-8 | Dependencias | Especificación | 851-875 | Dependencias de flujos |
| FLOW-9 | Relaciones | Especificación | 877-895 | Relaciones entre flujos |
| FLOW-10 | Notas de Implementación | Guía | 897-921 | Debugging y optimizaciones |

### QS: 03-QUICK-START.md

| ID | Sección | Tipo | Líneas | Descripción |
|---|---|---|---|---|
| QS-1 | Propósito | Definición | 3-5 | Guía práctica 10-15 minutos |
| QS-2 | Alcance | Especificación | 7-21 | Creación entidad CRUD completa |
| QS-3 | Definiciones Clave | Definición | 23-41 | Conceptos de inicio rápido |
| QS-4 | Descripción Técnica | Especificación | 43-105 | Prerrequisitos y estructura |
| QS-4.4 | Código Completo Customer | Ejemplo | 107-164 | Entidad Customer completa |
| QS-5 | Flujo de Funcionamiento | Proceso | 166-408 | 6 pasos principales |
| QS-5.1 | Paso 1: Crear Archivo | Proceso | 168-173 | Crear customer.ts |
| QS-5.2 | Paso 2: Registrar Módulo | Proceso | 175-181 | Registro en Application |
| QS-5.3 | Paso 3: Ver Resultado | Proceso | 183-217 | Verificación UI generada |
| QS-5.4 | Paso 4: Probar CRUD | Proceso | 219-273 | Testing funcionalidad |
| QS-5.5 | Paso 5: Validación Custom | Ejemplo | 275-299 | Agregar @Validation |
| QS-5.6 | Paso 6: ViewGroup | Ejemplo | 301-336 | Agrupar campos |
| QS-6 | Reglas Obligatorias | Regla | 410-425 | 12 reglas obligatorias |
| QS-7 | Prohibiciones | Prohibición | 427-439 | 10 prohibiciones |
| QS-8 | Dependencias | Especificación | 441-459 | Dependencias del tutorial |
| QS-9 | Relaciones | Especificación | 461-490 | Relaciones con otros componentes |
| QS-10 | Notas de Implementación | Guía | 492-558 | Solución problemas y tips |
| QS-11 | Referencias Cruzadas | Índice | 560-564 | Documentos relacionados |

### UI: 04-UI-DESIGN-SYSTEM-CONTRACT.md

| ID | Sección | Tipo | Líneas | Descripción |
|---|---|---|---|---|
| UI-1 | Propósito | Definición | 9-12 | Reglas UI/CSS vinculantes |
| UI-2 | Alcance | Especificación | 14-32 | Ámbito del contrato UI |
| UI-3 | Definiciones Clave | Definición | 34-106 | Conceptos del sistema UI |
| UI-3.1 | Sistema de Tokens | Definición | 36-38 | Variables CSS centralizadas |
| UI-3.2 | constants.css | Definición | 40-42 | Fuente única de verdad visual |
| UI-3.3 | Política Anti-Hardcode | Definición | 48-50 | Prohibición valores literales |
| UI-3.4 | Desktop-First Adaptativo | Definición | 52-54 | Estrategia de diseño |
| UI-4 | Descripción Técnica | Especificación | 108-151 | Arquitectura CSS 3 capas |
| UI-4.2 | Organización Archivos | Especificación | 118-126 | Estructura obligatoria CSS |
| UI-5 | Flujo de Funcionamiento | Proceso | 153-186 | 3 flujos principales |
| UI-6 | Reglas Obligatorias | Regla | 188-619 | 12 reglas UI/CSS |
| UI-6.1 | Subordinación MI LÓGICA | Regla | 190-197 | Jerarquía contractual |
| UI-6.2 | Archivos CSS Centralizados | Regla | 199-233 | Obligatoriedad constants.css |
| UI-6.3 | Sistema Universal Tokens | Especificación | 235-335 | Lista obligatoria tokens |
| UI-6.4 | Política Tokenización | Proceso | 337-455 | Procedimiento anti-hardcode |
| UI-6.4.1 | Principio Tokenización | Proceso | 339-371 | Flujo obligatorio |
| UI-6.4.2 | Valores Prohibidos | Tabla | 373-387 | Tabla de prohibiciones |
| UI-6.4.3 | Detección Hardcode | Script | 389-405 | Scripts pre-commit |
| UI-6.5 | Sistema Layout Flexbox | Regla | 457-471 | Box-sizing y flex |
| UI-6.6 | Z-Index Contractual | Regla | 473-497 | Jerarquía z-index |
| UI-6.7 | Desktop-First Adaptativo | Regla | 499-539 | Breakpoints obligatorios |
| UI-6.8 | Identidad Visual | Prohibición | 541-555 | Centralización obligatoria |
| UI-6.9 | Estados Visuales | Regla | 557-591 | Manejo por clases |
| UI-6.10 | Optimización Performance | Regla | 593-619 | Animaciones y selectores |
| UI-7 | Prohibiciones | Prohibición | 621-680 | 5 categorías prohibiciones |
| UI-8 | Dependencias | Especificación | 682-699 | Dependencias del contrato UI |
| UI-9 | Relaciones | Especificación | 701-746 | Relaciones con arquitectura |
| UI-10 | Notas de Implementación | Guía | 748-875 | Versionamiento y ejemplos |
| UI-11 | Referencias Cruzadas | Índice | 877-894 | Documentos vinculados |

### ENF: 05-ENFORCEMENT-TECHNICAL-CONTRACT.md

| ID | Sección | Tipo | Líneas | Descripción |
|---|---|---|---|---|
| ENF-1 | Propósito | Definición | 9-14 | Enforcement en desarrollo con IA |
| ENF-2 | Alcance | Especificación | 16-32 | Ámbito del enforcement |
| ENF-3 | Definiciones Clave | Definición | 34-130 | Conceptos de enforcement |
| ENF-3.1 | Enforcement Técnico | Definición | 36-38 | Mecanismos de verificación |
| ENF-3.2 | AOM | Definición | 40-42 | Autoverificación Obligatoria Modelo |
| ENF-3.3 | VCC | Definición | 44-46 | Validación Cruzada Capas |
| ENF-3.4 | Breaking Change | Definición | 48-50 | Modificación contractual |
| ENF-3.5 | Arquitecto | Definición | 52-54 | Autoridad técnica final |
| ENF-3.6 | Excepción Contractual | Definición | 56-58 | Desviación justificada |
| ENF-4 | Descripción Técnica | Especificación | 132-196 | Arquitectura 3 fases |
| ENF-4.1 | Naturaleza Enforcement | Diagrama | 134-155 | Diagrama 3 fases |
| ENF-4.4 | Jerarquía Normativa | Especificación | 178-191 | Jerarquía contratos |
| ENF-5 | Flujo de Funcionamiento | Proceso | 198-392 | 5 flujos principales |
| ENF-5.1 | Flujo Completo | Diagrama | 200-284 | Flujo END-TO-END |
| ENF-5.2 | Flujo AOM | Proceso | 286-322 | Autoverificación detallada |
| ENF-5.3 | Flujo VCC | Proceso | 324-350 | Validación cruzada capas |
| ENF-5.4 | Flujo Breaking Changes | Proceso | 352-382 | Gestión breaking changes |
| ENF-5.5 | Flujo Excepciones | Proceso | 384-392 | Registro de excepciones |
| ENF-6 | Reglas Obligatorias | Regla | 394-1850+ | **[ACTUALIZADO v1.3.0]** 9 reglas enforcement |
| ENF-6.1 | Subordinación | Regla | 396-402 | Jerarquía contractual |
| ENF-6.2 | AOM Obligatorio | Regla | 404-485 | Autoverificación mandatoria |
| ENF-6.2.1 | Formato Declaración | Formato | 410-467 | Template declaración cumplimiento |
| ENF-6.3 | VCC Obligatorio | Regla | 487-570 | Validación cruzada capas |
| ENF-6.4 | Política Breaking Changes | Regla | 572-751 | Gestión breaking changes |
| ENF-6.4.1 | Definición Breaking | Definición | 576-639 | Qué constituye breaking |
| ENF-6.4.2 | Procedimiento | Proceso | 641-738 | 5 pasos obligatorios |
| ENF-6.4.3 | Prohibición Silenciosos | Prohibición | 740-751 | Breaking changes ocultos |
| ENF-6.5 | Responsabilidad Arquitecto | Regla | 753-841 | Facultades y obligaciones |
| ENF-6.6 | Registro Excepciones | Regla | 843-970+ | Procedimiento excepciones |
| ENF-6.7 | Pre-Commit Verification | Regla | ~975-1034 | Checklist obligatorio pre-commit |
| ENF-6.7.1 | Checklist Obligatoria | Checklist | ~979-1015 | Verificaciones obligatorias |
| ENF-6.8 | Coherencia Naming | Regla | ~1036-1357 | Naming conventions y descriptibilidad |
| ENF-6.8.1 | Naming Autorizadas | Especificación | ~1044-1176 | Convenciones por tipo + descriptibilidad |
| ENF-6.8.2 | Prohibición No Autorizado | Prohibición | ~1178-1194 | Naming no autorizadas |
| ENF-6.8.3 | Autorización Nueva | Proceso | ~1196-1202 | Proceso autorización convención |
| ENF-6.8.4 | Unicidad Core | Regla | ~1204-1355 | Unicidad nombres en core arquitectónico |
| **ENF-6.9** | **Orden Modificación Spec-First** | **Regla** | **~1359-1850+** | **[NUEVO v1.3.0]** Principio Spec-First Design |
| ENF-6.9.1 | Principio Fundamental | Axioma | ~1361-1403 | Spec (.md) es source of truth aspiracional |
| ENF-6.9.2 | Workflow Nueva Funcionalidad | Proceso | ~1405-1452 | Spec PRIMERO → Código DESPUÉS |
| ENF-6.9.3 | Workflow Anomalías | Proceso | ~1454-1598 | Clasificación Tipo A/B + workflows |
| ENF-6.9.3.A | Tipo A: Error de Spec | Proceso | ~1464-1526 | Corregir .md PRIMERO, después .ts |
| ENF-6.9.3.B | Tipo B: Error de Código | Proceso | ~1528-1570 | Validar .md, corregir .ts según spec |
| ENF-6.9.4 | Workflow Bug Fixes | Proceso | ~1600-1650 | Clasificar origen + aplicar workflow |
| ENF-6.9.5 | Workflow Refactoring | Proceso | ~1652-1706 | Validar spec → Refactorizar código |
| ENF-6.9.6 | Tabla Clasificación Universal | Tabla | ~1708-1746 | Matriz de decisión para toda modificación |
| ENF-6.9.7 | Validaciones Pre-Modificación | Checklist | ~1748-1772 | Checklist obligatorio antes de modificar |
| ENF-6.9.8 | Consecuencias Incumplimiento | Sanciones | ~1774-1802 | Violaciones y proceso de corrección |
| ENF-6.9.9 | Integración con AOM/VCC | Especificación | ~1804-1848 | Relación con otros procesos contractuales |

---

## Sistema de IDs Estables

### Convención de IDs

Formato: `{CONTRATO}-{SECCION}[.{SUBSECCION}]*`

Ejemplos:
- `CORE-3.1`: MI LÓGICA (Sección 3.1 del contrato principal)
- `CORE-3.1.A1`: Axioma A1 (Arquitectura de Capas)
- `FWK-4.3`: Capa 3 BaseEntity
- `UI-6.4.2`: Tabla de valores prohibidos
- `ENF-6.2.1`: Formato de declaración AOM

### IDs por Capa Documental

**Decoradores (DEC):**
- `DEC::required`: Decorador @Required
- `DEC::property-name`: Decorador @PropertyName
- `DEC::api-endpoint`: Decorador @ApiEndpoint

**BaseEntity (BE):**
- `BE::save`: Método save()
- `BE::validate-inputs`: Método validateInputs()
- `BE::get-dirty-state`: Método getDirtyState()

**Application (APP):**
- `APP::singleton`: Patrón Singleton
- `APP::view`: Objeto View
- `APP::event-bus`: Sistema EventBus

**Tutorials (TUT):**
- `TUT::01`: Tutorial básico CRUD
- `TUT::02`: Tutorial validaciones
- `TUT::03`: Tutorial relaciones

**Examples (EX):**
- `EX::classic`: Ejemplo clásico
- `EX::advanced`: Ejemplo avanzado

---

## Búsqueda Rápida por Concepto

### Conceptos Arquitectónicos

| Concepto | ID Principal | IDs Relacionados | Archivos |
|---|---|---|---|
| MI LÓGICA | CORE-3.1 | CORE-3.1.A1, CORE-3.1.A2, CORE-3.1.A3, CORE-3.1.A4 | 00-CONTRACT.md |
| Arquitectura 5 Capas | CORE-3.1.A1, FWK-4 | FLOW-4.1 | 00-CONTRACT.md, 01-FRAMEWORK-OVERVIEW.md |
| Flujo Unidireccional | CORE-3.1.A2 | FLOW-5.1 | 00-CONTRACT.md, 02-FLOW-ARCHITECTURE.md |
| Generación UI | CORE-3.1.A3 | FWK-4.5, FLOW-5.3, FLOW-5.4 | Todos |
| BaseEntity | FWK-3.2, FWK-4.6 | BE::*, FLOW-5.6 | 01-FRAMEWORK-OVERVIEW.md, layers/02-base-entity/ |
| Application | FWK-3.3, FWK-4.7 | APP::*, FLOW-5.2 | 01-FRAMEWORK-OVERVIEW.md, layers/03-application/ |
| Decoradores | FWK-3.4, FWK-4.8 | DEC::*, FLOW-5.4 | 01-FRAMEWORK-OVERVIEW.md, layers/01-decorators/ |
| Sistema Tokens UI | UI-3.1, UI-6.3 | UI-6.4 | 04-UI-DESIGN-SYSTEM-CONTRACT.md |
| Enforcement | ENF-3.1 | ENF-5.1, ENF-6 | 05-ENFORCEMENT-TECHNICAL-CONTRACT.md |

### Procesos Clave

| Proceso | ID Principal | Tipo | Ubicación |
|---|---|---|---|
| Autoverificación IA | ENF-6.2 | Proceso Obligatorio | 05-ENFORCEMENT-TECHNICAL-CONTRACT.md, líneas 404-485 |
| Validación Cruzada | ENF-6.3 | Proceso Obligatorio | 05-ENFORCEMENT-TECHNICAL-CONTRACT.md, líneas 487-570 |
| Breaking Changes | ENF-6.4 | Proceso Obligatorio | 05-ENFORCEMENT-TECHNICAL-CONTRACT.md, líneas 572-751 |
| Tokenización CSS | UI-6.4 | Proceso Obligatorio | 04-UI-DESIGN-SYSTEM-CONTRACT.md, líneas 337-455 |
| Flujo CRUD Completo | FLOW-5.6 | Proceso Descriptivo | 02-FLOW-ARCHITECTURE.md, líneas 567-680 |
| Inicialización App | FLOW-5.1.1 | Proceso Descriptivo | 02-FLOW-ARCHITECTURE.md, líneas 127-151 |
| Quick Start | QS-5 | Guía Práctica | 03-QUICK-START.md, líneas 166-408 |

### Reglas Críticas

| Regla | ID | Tipo | Contrato |
|---|---|---|---|
| Prioridad MI LÓGICA | CORE-6.1 | Axiomática | 00-CONTRACT.md |
| Autorización Cambios | CORE-6.2 | Obligatoria | 00-CONTRACT.md |
| Documentación Mandatoria | CORE-6.3 | Obligatoria | 00-CONTRACT.md |
| Índices Carpetas | CORE-6.4 | Obligatoria | 00-CONTRACT.md |
| Formato 11 Secciones | CORE-6.7.12 | Obligatoria | 00-CONTRACT.md |
| Anti-Hardcode CSS | UI-6.4 | Obligatoria | 04-UI-DESIGN-SYSTEM-CONTRACT.md |
| AOM Obligatorio | ENF-6.2 | Obligatoria | 05-ENFORCEMENT-TECHNICAL-CONTRACT.md |

### Prohibiciones Críticas

| Prohibición | ID | Descripción | Contrato |
|---|---|---|---|
| Modificar MI LÓGICA | CORE-6.1 | Sin autorización explícita | 00-CONTRACT.md |
| Breaking Changes Silenciosos | ENF-6.4.3 | Sin documentación y aprobación | 05-ENFORCEMENT-TECHNICAL-CONTRACT.md |
| Valores Hardcoded | UI-6.4.2 | Colores, espaciados, etc. sin tokens | 04-UI-DESIGN-SYSTEM-CONTRACT.md |
| Código sin Docs | CORE-6.3 | Código sin documentación sincronizada | 00-CONTRACT.md |

---

## Uso de Este Índice

### Para IA: Localizar Información

1. **Buscar concepto en "Búsqueda Rápida por Concepto"**
2. **Obtener ID estable del concepto**
3. **Consultar "Índice de Secciones Principales" para líneas exactas**
4. **Leer contexto completo en archivo fuente**
5. **Consultar IDs relacionados para contexto adicional**

### Para IA: Validar Cumplimiento

1. **Consultar "Reglas Críticas" para validaciones obligatorias**
2. **Consultar "Prohibiciones Críticas" para restricciones**
3. **Ver "Matriz de Relación Cruzada" para dependencias**
4. **Seguir proceso ENF-6.2 (AOM) para autoverificación**

### Para Arquitecto: Navegación Rápida

1. **Usar "Mapa Jerárquico" para visión general**
2. **Consultar "Dependencias entre Contratos" para impactos**
3. **Ver "Índice de Secciones Principales" para acceso directo**

---

**Última Actualización:** 13 de Febrero, 2026  
**Mantenimiento:** Este índice debe actualizarse cuando se modifiquen contratos base
