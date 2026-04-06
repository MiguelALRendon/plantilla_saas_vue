# Implementation Plan: User Authentication System

**Branch**: `001-user-auth` | **Date**: 2026-04-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-user-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implementar un sistema de autenticación completo que incluye: (1) Entidad User con decoradores del framework para login vía API auth_service, (2) LoginView.vue con formulario auto-generado desde metadatos, (3) Guards de autenticación en App.vue y router para proteger rutas, (4) Funciones SaveUserData() y CurrentUser() en Application para gestión de sesión en SessionStorage, (5) Botón de logout en dropdown de configuraciones. El sistema sigue la arquitectura de 5 capas del framework (Entity → Decorators → BaseEntity → Application → UI) con UI generada automáticamente desde metadatos, integración i18n completa, y almacenamiento de tokens (access_token y refresh_token) en SessionStorage. La lógica de refresh automático se marca como deuda técnica para fase posterior.

## Technical Context

**Language/Version**: TypeScript 5.x + Vue 3.3+ (Composition API)  
**Primary Dependencies**: Vue 3, Vue Router, Pinia (stores), Axios, mitt (EventBus), TypeScript Decorators (experimentalDecorators)  
**Storage**: SessionStorage (user data + authentication tokens), no database on frontend  
**Testing**: Manual testing (no automated test suite configured)  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Single-page web application (SPA) con arquitectura meta-programming basada en decoradores  
**Performance Goals**: <500ms redirect al login, <100ms feedback de validación, <5s autenticación completa  
**Constraints**: Debe respetar arquitectura de 5 capas inmutables (MI LÓGICA), UI 100% generada desde metadatos, sin modificar BaseEntity core  
**Scale/Scope**: Aplicación SaaS multi-tenant con ~50+ módulos potenciales, soporte 3 idiomas (EN/ES/JP), sesión única por browser

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### MI LÓGICA Verification (4 AXIOMS - NON-NEGOTIABLE)

- [x] **A1 [5-Layer Architecture]**: ✅ El feature respeta las 5 capas: (1) User entity en src/entities/, (2) Decoradores @PropertyName/@Required/etc., (3) User extends BaseEntity para CRUD, (4) Application.SaveUserData/CurrentUser + router guards, (5) LoginView.vue con formulario auto-generado
- [x] **A2 [Unidirectional Flow]**: ✅ Flujo unidireccional: User entity → decoradores → metadata en prototype → BaseEntity.save() → Application guards → LoginView renderiza desde metadata. LoginView no accede directamente a User sin pasar por Application
- [x] **A3 [Metadata-Driven UI]**: ✅ LoginView usa el form rendering system del framework que lee decoradores (@PropertyName, @Required, @StringTypeDef) para generar inputs automáticamente. Sin lógica de UI hard-coded
- [x] **A4 [Tech Stack Immutability]**: ✅ Usa TypeScript + Vue 3 + Decoradores exclusivamente. Metadata sigue en BaseEntity.prototype, sin JSON config externo ni cambio de framework

**CRITICAL**: ✅ TODOS los axiomas verificados = SÍ. Feature aprobado para continuar.

### Core Principles Verification

- [x] **SPEC-FIRST**: ✅ Documentación (spec.md, plan.md) completada ANTES de implementación
- [x] **Documentation Sync**: ✅ Planificado: actualizar copilot/examples/ con ejemplo de autenticación tras implementación
- [x] **Architectural Authorization**: ❌ N/A - No altera arquitectura core, solo agrega nueva entidad y vista siguiendo patrones existentes
- [x] **Contract Hierarchy**: ✅ Revisados: 00-CONTRACT.md (MI LÓGICA), 01-FRAMEWORK-OVERVIEW.md (BaseEntity/Application), 02-FLOW-ARCHITECTURE.md (router guards), 04-UI-DESIGN-SYSTEM.md (form inputs), 06-CODE-STYLING-STANDARDS.md (naming conventions)
- [x] **Folder Indexes**: ✅ No requiere actualización (no se crean carpetas nuevas en src/, solo archivos individuales)
- [x] **11-Section Structure**: ❌ N/A - No se crea nueva documentación de contrato, solo artifacts de feature (research.md, data-model.md, quickstart.md)
- [x] **NO /src/ Documentation**: ✅ Confirmado - NO se creará README.md ni INDEX.md en src/. Toda documentación va en /specs/001-user-auth/ y /copilot/

### Breaking Change Assessment

- [x] ¿Introduce breaking changes? **NO** - Agrega funcionalidad nueva sin modificar APIs existentes. Application.SaveUserData/CurrentUser son nuevas, no reemplazan nada
- [x] ¿Requiere excepciones contractuales? **NO** - Cumple 100% con contratos de framework. LoginView sigue patrón de otras vistas, User sigue patrón de otras entidades

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── user-api-contract.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── entities/
│   ├── base_entity.ts         # [EXISTING] - Core framework class
│   ├── user.ts                # [NEW] - User entity con decoradores
│   ├── configuration.ts       # [EXISTING]
│   ├── home.ts                # [EXISTING]
│   └── product.ts             # [EXISTING]
│
├── models/
│   ├── application.ts         # [MODIFIED] - Add SaveUserData(), CurrentUser()
│   ├── app_configuration.ts   # [EXISTING] - Contains authTokenKey, authRefreshTokenKey
│   └── ...
│
├── views/
│   ├── LoginView.vue          # [NEW] - Vista de login con formulario
│   ├── HomeView.vue           # [EXISTING] - Landing page post-login
│   ├── default_listview.vue   # [EXISTING]
│   └── default_detailview.vue # [EXISTING]
│
├── router/
│   └── index.ts               # [MODIFIED] - Add /login route, auth guards
│
├── components/
│   ├── TopBarComponent.vue    # [MODIFIED] - Add logout button in dropdown
│   ├── Form/                  # [EXISTING] - Form input components (auto-genera formularios)
│   └── ...
│
├── languages/
│   ├── common.json            # [MODIFIED] - Add i18n keys: login, logout, username
│   ├── errors.json            # [EXISTING] - May add authentication_error
│   └── custom.json            # [EXISTING] - Ya tiene "password"
│
├── App.vue                    # [MODIFIED] - Add authentication guard on mount
├── main.ts                    # [EXISTING] - Application initialization
└── ...

copilot/
├── examples/
│   └── authentication-example.md  # [NEW] - Ejemplo de cómo usar User entity
└── ...
```

**Structure Decision**: Proyecto Vue 3 SPA estándar (Option 1: Single project). Todo el código está en `src/` sin separación backend/frontend porque este es solo el cliente web. El backend (auth_service) ya existe externamente. La estructura sigue el patrón existente del framework: entities para modelos, views para vistas Vue, models para singletons/services, router para navegación, components para UI reutilizable.

## Complexity Tracking

> **VACÍO - No hay violaciones de Constitution que requieran justificación**

El feature de autenticación cumple 100% con MI LÓGICA y todos los principios del framework. No se requieren excepciones ni violaciones justificadas.

---

## Phase 0: Research - ? COMPLETADO

**Archivo Generado**: [research.md](research.md)

**Decisiones T�cnicas Documentadas**: 7
1. Token Storage Strategy ? SessionStorage para user data + tokens
2. BaseEntity Lifecycle Hook ? onSaved() para post-login logic
3. Router Authentication Guards ? beforeEach global con meta.requiresAuth
4. Form Rendering from Metadata ? Reutilizar sistema existente del framework
5. i18n Key Management ? Verificar duplicados, agregar en common.json
6. Logout Implementation ? Application.Logout() method
7. HomeView Creation ? Landing page post-login en /home

**Unknowns Resueltos**: 7/7  
**Status**: ? Sin NEEDS CLARIFICATION pendientes

---

## Phase 1: Design - ? COMPLETADO

### Artifacts Generados

| Artifact | Ruta | L�neas | Descripci�n |
|----------|------|--------|-------------|
| **Data Model** | [data-model.md](data-model.md) | ~500 | User entity completa con decoradores, lifecycle hooks, state transitions, validation |
| **API Contract** | [contracts/user-api-contract.md](contracts/user-api-contract.md) | ~550 | POST /auth/login, request/response schemas, error codes, seguridad |
| **Quick Start** | [quickstart.md](quickstart.md) | ~600 | Gu�a de 8 pasos para implementar autenticaci�n en <15 minutos |

### Data Model Summary

- **Entities**: 1 (User)
- **Properties**: 11 (usuario, contrase�a, oid, fkSistema, fkEmpleado, createdAt, updatedAt, creado_por, editado_por, estatus, + embedded objects)
- **Decorators Configurados**: 8 tipos (@Module, @PropertyName, @Required, @StringTypeDef, @PrimaryProperty, @HideInDetailView, @HideInListView, @ReadOnly)
- **Lifecycle Hooks**: 3 (onSaving, onSaved, onSavingError)
- **Relationships**: 2 (User-Sistema external, User-Empleado external, ambas embedded)
- **Security Features**: 5 (password clearing, token storage, SessionStorage scope, httpOnly alternative considered, XSS mitigation)

### API Contract Summary

- **Endpoints Documentados**: 1 (POST /auth/login)
- **Response Codes**: 5 (200, 400, 401, 500, 503)
- **Test Cases**: 5 (login exitoso, credenciales inv�lidas, usuario inactivo, campos faltantes, server error)
- **Token Types**: 2 (access_token 1h, refresh_token 30d)

### Agent Context Updated

- ? Copilot context actualizado con: TypeScript 5.x, Vue 3.3+, Decorators, SessionStorage
- ?? Archivo modificado: `.github/agents/copilot-instructions.md`

---

## Phase 1: Constitution Re-Check ?

**Re-validation Post-Design**: Todos los axiomas y principios siguen cumplidos tras generar artifacts de dise�o.

### MI L�GICA Verification (Post-Design)

- [x] **A1 [5-Layer Architecture]**: ? Design confirma: User (Capa 1) ? Decoradores (Capa 2) ? BaseEntity.save() (Capa 3) ? Application.SaveUserData/guards (Capa 4) ? LoginView.vue (Capa 5). Sin capas intermedias agregadas
- [x] **A2 [Unidirectional Flow]**: ? Data model documenta flujo: Entity ? Metadata ? BaseEntity ? Application ? UI. LoginView no bypasea capas
- [x] **A3 [Metadata-Driven UI]**: ? Quick start muestra form generation desde decoradores. LoginView puede ser simplificada o auto-generada desde User decorators
- [x] **A4 [Tech Stack]**: ? Todos los artifacts usan TypeScript + Vue 3 + Decorators. SessionStorage es browser API nativo, no reemplazo de stack

**Conclusion**: ? MI L�GICA intacta tras dise�o. Feature alineado con axiomas.

### Quality Gates

- [x] **Data Model Complete**: User entity fully specified con todos los campos, decoradores, validations, lifecycle hooks
- [x] **API Contract Clear**: POST /auth/login documentado con request/response schemas, error cases, security specs
- [x] **Integration Points Identified**: Application.SaveUserData/CurrentUser/Logout, router guards, axios interceptors, SessionStorage
- [x] **Security Addressed**: Password handling, token storage, XSS mitigation, rate limiting considerations
- [x] **Edge Cases Covered**: SessionStorage full, malformed response, concurrent tabs, session expiration, usuario ya autenticado

**Verdict**: ? READY FOR IMPLEMENTATION (Phase 2: Tasks)

---

## Implementation Readiness Checklist

| Category | Status | Notes |
|----------|--------|-------|
| **Specification** | ? | spec.md complete con 4 user stories, 21 functional requirements, 7 success criteria |
| **Clarifications** | ? | 3 clarificaciones integradas: redirect /home, refresh_token storage, logout en dropdown |
| **Research** | ? | 7 decisiones t�cnicas documentadas con rationale y alternatives |
| **Data Model** | ? | User entity completa con decoradores, lifecycle, validations |  
| **API Contract** | ? | POST /auth/login fully documented |
| **Quick Start** | ? | 8-step guide para desarrolladores |
| **Constitution** | ? | Mi L�GICA verified pre y post-design |
| **Agent Context** | ? | Copilot instructions updated |
| **i18n Keys** | ?? | Pending: agregar keys en common.json y errors.json seg�n lista en research.md |
| **Breaking Changes** | ? | None - Feature agrega funcionalidad sin modificar APIs existentes |

**Overall Readiness**: 90% (solo falta agregar i18n keys antes de comenzar implementaci�n)

---

## Next Steps

### Immediate (Before Implementation)

1. **Agregar i18n Keys**:
   - Editar `src/languages/common.json` ? agregar secci�n `"auth": {...}` con keys: username, password, login, logout, login_success, logout_success
   - Editar `src/languages/errors.json` ? agregar keys: authentication_failed, invalid_credentials
   - Verificar NO duplicar keys existentes (password ya existe en custom.json)

2. **Crear Icon de Login** (opcional):
   - Agregar `LOGIN: '...'` en `src/constants/icons.ts`
   - O reutilizar icon existente (ej: `ICONS.HOME`)

### Phase 2: Tasks Generation

```bash
/speckit.tasks
```

Este command generar� `tasks.md` con lista de tareas ordenadas por dependencias para implementar el feature.

### Phase 3: Implementation

Seguir `quickstart.md` y `tasks.md` para implementar paso a paso:
1. User entity (src/entities/user.ts)
2. Application methods (SaveUserData, CurrentUser, Logout)
3. Router guards
4. LoginView.vue
5. TopBar logout button
6. App.vue auth check
7. i18n keys
8. Testing manual

### Phase 4: Post-Implementation

1. **Documentation Update**: Agregar `copilot/examples/authentication-example.md` con ejemplo de uso
2. **Testing**: Ejecutar checklist de testing en quickstart.md
3. **Code Review**: Verificar cumplimiento de 06-CODE-STYLING-STANDARDS.md
4. **Merge**: PR a master tras review completo

---

## Planning Summary

| Metric | Value |
|--------|-------|
| **Feature Branch** | `001-user-auth` |
| **Spec Quality** | ? PASS (checklist completo) |
| **Planning Duration** | ~2 horas (incluye research profunda) |
| **Artifacts Generated** | 5 files (plan.md, research.md, data-model.md, user-api-contract.md, quickstart.md) |
| **Total Documentation** | ~2800 l�neas |
| **Constitution Compliance** | 100% (todos los axiomas y principios cumplidos) |
| **Technical Debt Identified** | 1 (TD-001: automatic token refresh deferred) |
| **Implementation Estimate** | 2-3 days (1 dev, incluye c�digo + testing manual) |

**Planning Status**: ? COMPLETADO  
**Ready for Tasks Generation**: ? S�  
**Blocking Issues**: ? NINGUNO  

---

*Plan generado por `/speckit.plan` command - 2026-04-06*

