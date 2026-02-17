# AUDITORÍA DE CUMPLIMIENTO CONTRACTUAL (00-06)

**Fecha:** 17 de Febrero, 2026  
**Ámbito:** Spec Kit + Código fuente (`/copilot`, `/src`)  
**Criterio de severidad aplicado por instrucción:** Toda ruptura mínima = **CRÍTICO**

---

## Metodología aplicada

1. Lectura completa de contratos: `00`, `01`, `02`, `03`, `04`, `05`, `06`.
2. Verificación estructural de documentación y de índices obligatorios.
3. Escaneo automático de código/documentación para rupturas trazables por archivo.
4. Clasificación de todo desvío como **CRÍTICO**.

---

## Addendum de Normalización (Sesión 17-Feb-2026)

Bloques corregidos en esta sesión de normalización SPEC FIRST:

- Enlaces cruzados corregidos en specs de `01-decorators`, `04-components`, `06-composables` y `tutorials`.
- Registro de excepciones sincronizado con marcadores `EXC-*` y categorías legacy activas en `EXCEPCIONES.md`.
- Índice de entidades normalizado (`products.ts` → `product.ts`) y README reestructurado a formato de 11 secciones.

Este addendum no reemplaza el inventario histórico original de hallazgos; documenta su estado de remediación parcial/total en la sesión actual.

---

## Hallazgos CRÍTICOS (consolidado)

### C-001 — Referencias cruzadas documentales rotas
- **Cláusulas afectadas:** `00-CONTRACT.md` §6.3, §6.4.6, §7.2; `05-ENFORCEMENT-TECHNICAL-CONTRACT.md` §6.7.1 (documentación), §7.5.
- **Evidencia:** Se detectaron **82 enlaces `.md` rotos** en el Spec Kit.
- **Impacto:** Ruptura directa de integridad documental y trazabilidad contractual.

### C-002 — Uso extensivo de `!important` sin registro de excepción
- **Cláusulas afectadas:** `04-UI-DESIGN-SYSTEM-CONTRACT.md` §6.10, §6.13.5, §7.4; `05-ENFORCEMENT-TECHNICAL-CONTRACT.md` §6.6, §7.4.
- **Evidencia:** **39 ocurrencias** detectadas en CSS/Vue (`src/css/*.css`, componentes en `src/components/**`).
- **Impacto:** Violación de performance/especificidad y de régimen de excepciones.

### C-003 — Excepciones en código (`EXC-*`) sin registro activo consistente
- **Cláusulas afectadas:** `05-ENFORCEMENT-TECHNICAL-CONTRACT.md` §6.6.2, §6.6.5, §7.4.
- **Evidencia:**
  - `src/entities/base_entity.ts` contiene **6 marcadores `EXC-*`**.
  - `copilot/EXCEPCIONES.md` declara **0 excepciones activas** y no tiene entradas activas efectivas (solo plantillas/comentarios).
- **Impacto:** El sistema de excepciones queda contractualmente inválido.

### C-004 — Lógica implícita en templates Vue
- **Cláusulas afectadas:** `06-CODE-STYLING-STANDARDS.md` §6.3.1.2.
- **Evidencia:** **9 archivos** con patrones prohibidos (`mustache ternary` y/o llamadas inline en eventos).
- **Impacto:** Ruptura de separación presentación/lógica exigida por contrato.

### C-005 — Tipado explícito incompleto en declaraciones de variables
- **Cláusulas afectadas:** `06-CODE-STYLING-STANDARDS.md` §6.4.2, §7.3.
- **Evidencia:** **271 declaraciones** sin tipo explícito en **47 archivos**.
- **Impacto:** Incumplimiento masivo del estándar de tipado explícito total.

### C-006 — Estructura de `#region` obligatoria incompleta en clases
- **Cláusulas afectadas:** `06-CODE-STYLING-STANDARDS.md` §6.2.4, §7.2.
- **Evidencia:** **4 clases** sin las regiones obligatorias (`PROPERTIES`, `METHODS`, `METHODS OVERRIDES`).
- **Impacto:** Violación de estructura contractual obligatoria.

### C-007 — Inconsistencia interna de versionado en contratos base
- **Cláusulas afectadas:** Integridad documental de `00`/`05`/`06` (coherencia normativa).
- **Evidencia:**
  - `00-CONTRACT.md`: cabecera `2.3.0` vs bloques internos/validez `2.2.0`.
  - `05-ENFORCEMENT-TECHNICAL-CONTRACT.md`: cabecera `1.4.0` vs sección de versionado `1.2.0` y cierre `1.1.0`.
  - `06-CODE-STYLING-STANDARDS.md`: cabecera `1.2.0` vs cierre `1.0.0`.
- **Impacto:** Ambigüedad normativa crítica sobre versión vigente.

### C-008 — Índice de entidades desincronizado con código real
- **Cláusulas afectadas:** `00-CONTRACT.md` §6.3, §6.4.6, §7.2.
- **Evidencia:** `src/entities/README.md` lista `products.ts`, pero en carpeta existe `product.ts`.
- **Impacto:** Índice no refleja estado real de artefactos.

### C-009 — Índice recomendado de `src/components/Form` ausente (tratado CRÍTICO por instrucción)
- **Cláusulas afectadas:** `00-CONTRACT.md` §6.4.2 (opcional/recomendado; clasificado crítico por instrucción estricta).
- **Evidencia:** No existe `src/components/Form/README.md` ni `src/components/Form/INDEX.md`.
- **Impacto:** Falta de punto documental en carpeta técnica relevante.

---

## Inventario completo de fallas detectadas (100%)

> Fuente: escaneo automatizado consolidado en `copilot/audit_raw.txt`.

### A) Enlaces `.md` rotos (82)

- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/00-CONTRACT.md -> ./archivo.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/00-CONTRACT.md -> ./otro.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/hide-in-detail-view-decorator.md -> ../../02-base-entity/base-entity-core.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/hide-in-detail-view-decorator.md -> ../../02-base-entity/metadata-access.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/hide-in-detail-view-decorator.md -> ../../02-base-entity/static-methods.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/hide-in-list-view-decorator.md -> ../../02-base-entity/base-entity-core.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/hide-in-list-view-decorator.md -> ../../02-base-entity/metadata-access.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/hide-in-list-view-decorator.md -> ../../02-base-entity/static-methods.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/mask-decorator.md -> ../../02-base-entity/base-entity-core.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/mask-decorator.md -> ../../02-base-entity/metadata-access.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-custom-components-decorator.md -> ../../02-base-entity/base-entity-core.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-custom-components-decorator.md -> ../../02-base-entity/base-entity-core.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-custom-components-decorator.md -> ../../02-base-entity/metadata-access.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-detail-component-decorator.md -> ../../02-base-entity/base-entity-core.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-detail-component-decorator.md -> ../../02-base-entity/metadata-accessors.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-detail-component-decorator.md -> ../../03-application/application-singleton.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-detail-component-decorator.md -> ../../03-application/router-integration.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-detail-component-decorator.md -> ../../03-application/ui-services.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-detail-component-decorator.md -> ../../04-components/TabControllerComponent.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-detail-component-decorator.md -> ../../04-components/text-input-component.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-detail-component-decorator.md -> ../../04-components/default-detail-view.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-icon-decorator.md -> ../04-components/sidebar-component.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-icon-decorator.md -> ../03-application/icon-service.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-icon-decorator.md -> ../02-FLOW-ARCHITECTURE.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-list-component-decorator.md -> ../../03-application/application-views.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-list-component-decorator.md -> ../../03-application/router-integration.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-list-component-decorator.md -> ../../02-base-entity/base-entity-core.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-list-component-decorator.md -> ../../04-components/default-listview.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-list-component-decorator.md -> ../../05-advanced/enums.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-permission-decorator.md -> ../04-components/sidebar-component.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-permission-decorator.md -> ../04-components/default-listview.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-permission-decorator.md -> ../04-components/default-detailview.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/module-permission-decorator.md -> ../02-FLOW-ARCHITECTURE.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../02-base-entity/base-entity-core.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../02-base-entity/metadata-accessors.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../04-components/text-input-component.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../04-components/number-input-component.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../04-components/object-input-component.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../04-components/array-input-component.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../04-components/list-input-component.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../04-components/default-detail-view.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/01-decorators/property-name-decorator.md -> ../../04-components/default-list-view.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/02-base-entity/metadata-access.md -> ../../AUDITORIA-INCONSISTENCIAS.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ActionButtonComponents.md -> default_detailview.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ActionButtonComponents.md -> default_listview.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ActionButtonComponents.md -> ../05-advanced/ViewType.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/array-input-component.md -> DefaultViews.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/array-input-component.md -> DefaultViews.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/SideBarItemComponent.md -> ../02-base-entity/entity-metadata-system.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ToastComponents.md -> LoadingPopupComponent.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ToastComponents.md -> ConfirmationDialogComponent.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ToastComponents.md -> ../../03-application/application-singleton.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ToastComponents.md -> ../../03-application/ui-services.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ToastComponents.md -> ../../02-base-entity/crud-operations.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ToastComponents.md -> ../../02-base-entity/validation-system.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/ToastComponents.md -> ../../05-advanced/Enums.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/useInputMetadata-composable.md -> ../../02-base-entity/metadata-access.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/useInputMetadata-composable.md -> ../../02-base-entity/validation-system.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/useInputMetadata-composable.md -> ../../01-decorators/property-name-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/useInputMetadata-composable.md -> ../../01-decorators/required-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/useInputMetadata-composable.md -> ../../01-decorators/disabled-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/useInputMetadata-composable.md -> ../../01-decorators/validation-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/useInputMetadata-composable.md -> ../../01-decorators/help-text-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> TabComponent.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> ../../02-base-entity/metadata-access.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> ../../02-base-entity/view-groups.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> ../../03-application/view-management.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> ../../03-application/navigation.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> ../../01-decorators/view-group-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> ../../01-decorators/view-group-row-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> ../../01-decorators/hide-in-list-view-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/04-components/views-overview.md -> ../../01-decorators/hide-in-detail-view-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/06-composables/useInputMetadata.md -> ../../02-base-entity/metadata-access.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/06-composables/useInputMetadata.md -> ../../02-base-entity/validation-system.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/06-composables/useInputMetadata.md -> ../../01-decorators/property-name-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/06-composables/useInputMetadata.md -> ../../01-decorators/required-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/06-composables/useInputMetadata.md -> ../../01-decorators/disabled-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/06-composables/useInputMetadata.md -> ../../01-decorators/validation-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/layers/06-composables/useInputMetadata.md -> ../../01-decorators/help-text-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/tutorials/01-basic-crud.md -> ../layers/02-base-entity/serialization.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/tutorials/03-relations.md -> ../layers/01-decorators/unique-property-key-decorator.md
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/copilot/tutorials/03-relations.md -> ../layers/02-base-entity/serialization.md

### B) Ocurrencias `!important` (39)

- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:253
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:254
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:255
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:257
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:258
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:259
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:260
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:261
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:262
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:263
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:264
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:266
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:267
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:268
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:269
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:270
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/constants.css:272
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:94
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:105
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:124
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:125
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:129
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:147
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:165
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:166
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:170
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:173
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:177
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:179
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:180
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:184
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:185
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:188
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/form.css:191
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/main.css:4
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/main.css:21
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/main.css:59
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/main.css:69
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/css/main.css:89

### C) Lógica implícita en templates (9)

- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/TabControllerComponent.vue -> inline-event-call
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/EmailInputComponent.vue -> inline-event-call
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/ObjectInputComponent.vue -> inline-event-call
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/PasswordInputComponent.vue -> inline-event-call
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/TextAreaComponent.vue -> inline-event-call
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Informative/DetailViewTableComponent.vue -> mustache-ternary,inline-event-call
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Modal/ConfirmationDialogComponent.vue -> mustache-ternary,inline-event-call
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/views/default_lookup_listview.vue -> inline-event-call
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/views/list.vue -> inline-event-call

### D) Clases sin regiones obligatorias (4)

- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/property_name_decorator.ts
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/models/application_ui_service.ts
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/models/enum_adapter.ts
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/models/Toast.ts

### E) Declaraciones sin tipado explícito (271 en 47 archivos)

> Lista completa por archivo (conteo):

- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/App.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Buttons/NewButtonComponent.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Buttons/RefreshButtonComponent.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Buttons/SaveAndNewButtonComponent.vue -> 2
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Buttons/SaveButtonComponent.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Buttons/ValidateButtonComponent.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/ComponentContainerComponent.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/DropdownMenuComponent.vue -> 10
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/ArrayInputComponent.vue -> 5
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/BooleanInputComponent.vue -> 4
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/DateInputComponent.vue -> 9
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/EmailInputComponent.vue -> 4
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/ListInputComponent.vue -> 7
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/NumberInputComponent.vue -> 14
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/ObjectInputComponent.vue -> 3
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/PasswordInputComponent.vue -> 4
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/TextAreaComponent.vue -> 2
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Form/TextInputComponent.vue -> 4
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Informative/DetailViewTableComponent.vue -> 3
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Informative/ToastContainerComponent.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Informative/ToastItemComponent.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/Modal/ModalComponent.vue -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/components/TabControllerComponent.vue -> 3
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/composables/useInputMetadata.ts -> 7
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/async_validation_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/css_column_class_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/disabled_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/display_format_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/help_text_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/hide_in_detail_view_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/hide_in_list_view_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/mask_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/persistent_key_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/property_index_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/property_name_decorator.ts -> 2
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/readonly_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/required_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/string_type_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/tab_order_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/validation_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/view_group_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/decorations/view_group_row_decorator.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/entities/base_entity.ts -> 128
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/models/application.ts -> 9
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/models/application_ui_service.ts -> 1
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/router/index.ts -> 10
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/views/default_detailview.vue -> 14

### F) Marcadores `EXC-*` en código (6)

- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/entities/base_entity.ts:250
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/entities/base_entity.ts:267
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/entities/base_entity.ts:269
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/entities/base_entity.ts:1197
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/entities/base_entity.ts:1198
- C:/Users/Pablninn18/Documents/herramientas/SaaS Project/plantilla_saas_vue/src/entities/base_entity.ts:1207

---

## Verificaciones ejecutadas sin hallazgo (informativo)

- Estructura documental `## 1..11` en archivos auditables: **sin faltantes numéricos**.
- Índices obligatorios en `/copilot/layers/*`, `/copilot/tutorials`, `/copilot/examples`: **presentes** y con cobertura de archivos `.md` por carpeta.
- `vue-tsc --noEmit`: ejecución completada sin error de compilación en el estado actual.

---

## Conclusión

El repositorio presenta **incumplimientos críticos múltiples** contra los contratos `00` a `06`, con fallas especialmente severas en integridad documental (enlaces rotos), enforcement de excepciones y disciplina de code-styling/plantillas.  
La severidad aplicada es **CRÍTICA en todos los casos** por requerimiento explícito.
