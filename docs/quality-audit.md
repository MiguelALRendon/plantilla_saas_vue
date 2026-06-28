# Auditoría de Calidad — plantilla_saas_vue

**Fecha:** 2026-06-27
**Auditor:** Claude Sonnet 4.6 (lectura exhaustiva de 70+ archivos)
**Alcance:** Todo `src/`, `src/router/`, tests referenciados
**Nota metodológica:** Los patrones intencionales del framework (Active Record en BaseEntity, singleton Application, metadatos en prototipo, acoplamiento UI↔metadata) no se marcan como defectos; se mencionan solo donde generan riesgo operativo real.

---

## SECCIÓN 1: PLAN POR FASES

El plan prioriza seguridad antes de ergonomía, después DRY y SRP, y deja los cambios más invasivos para el final (cuando haya cobertura de tests). Cada fase es atómica: puede mergearse independientemente sin romper el sistema.

### Fase 0 — Limpieza inmediata (Riesgo cero, coste S)

**Justificación:** Archivos marcados explícitamente como "ELIMINAR ANTES DE PRODUCCIÓN" que ya están registrados como módulos activos. Su presencia distorsiona navegación, tests y métricas de cobertura.

| Acción | Archivo | Evidencia |
|--------|---------|-----------|
| Eliminar entidad demo | `src/entities/capitulo.ts` | Comentario cabecera: `⚠️ CLASE DE PRUEBA — ELIMINAR ANTES DE PRODUCCIÓN ⚠️` |
| Eliminar entidad demo | `src/entities/imagen.ts` | Comentario cabecera: `⚠️ CLASE DE PRUEBA — ELIMINAR ANTES DE PRODUCCIÓN ⚠️` |
| Eliminar entidad demo | `src/entities/super.ts` | Comentario cabecera: `⚠️ ENTIDAD DUMMY DE PRUEBA — ELIMINAR ANTES DE PRODUCCIÓN ⚠️` |
| Desregistrar en main.ts | `src/main.ts` líneas con `registerModule(Capitulo/Imagen/Super)` | |
| Eliminar enum huérfano | `src/enums/detail_type.ts` | `DetailTypes` no tiene ningún import en toda la base de código (YAGNI) |
| Renombrar interfaz | `src/models/confirmation_menu.ts` | `interface confirmationMenu` viola PascalCase; renombrar a `ConfirmationMenu` |
| Corregir typo de prop | `src/components/Form/ArrayInputComponent.vue` | prop `requireddMessage` (doble 'd') |
| Reemplazar `.substr()` | `src/models/toast.ts` | `.substr(2, 9)` → `.substring(2, 9)` (deprecated desde ES2021) |

### Fase 1 — Corrección de bugs reales (Riesgo bajo-medio, coste M)

**Justificación:** Fallos silenciosos que no causan crash inmediato pero corrompen estado o abren vectores de error en producción.

| Acción | Archivo | Línea | Detalles |
|--------|---------|-------|----------|
| Corregir ToastList sin `.value` | `src/components/Informative/ToastContainerComponent.vue` | ~23 | `this.Application.ToastList.findIndex(...)` debería ser `this.Application.ToastList.value.findIndex(...)` en contexto Options API; la plantilla auto-unwrap funciona pero el método no |
| Manejo explícito de refresh fallido | `src/models/application_http.ts` | ~124 | El bloque `} catch { }` silencia errores de renovación de token; mínimo loggear con `logger.error` |
| Fail-closed en JWT expirado | `src/models/session_service.ts` | `isTokenExpired()` | Retorna `false` (no expirado) en parse error; debería retornar `true` para proteger rutas |
| Eliminar dead code router | `src/router/index.ts` | `initializeRouterWithApplication()` | Función no-op exportada; condición línea 185 siempre verdadera por fallback en `getModuleDefaultComponent` |
| Reparar watch en useInputMetadata | `src/composables/useInputMetadata.ts` | watch async | El watch debounced observa `required` (computed) en lugar de `entity[propertyKey]`; la validación asíncrona no se dispara al cambiar el valor del campo |

### Fase 2 — Eliminación de duplicación DRY (Riesgo bajo, coste M)

**Justificación:** Valores por defecto de configuración triplicados entre `ApplicationClass`, `app_config_store.ts` y `ui_store.ts`. Un cambio en un sitio no se propaga a los otros.

| Acción | Archivos | Detalles |
|--------|---------|----------|
| Extraer constante `DEFAULT_APP_CONFIG` | `src/models/application.ts` + `src/stores/app_config_store.ts` | Los 16 campos de `AppConfiguration` con sus defaults deben vivir en un único objeto importado por ambos |
| Extraer constante `DEFAULT_UI_STATE` | `src/models/application.ts` + `src/stores/ui_store.ts` | `modal`, `dropdownMenu`, `confirmationMenu` defaults duplicados |
| Usar `setListButtons()` de view_store | `src/models/application.ts` + `src/stores/view_store.ts` | `view_store.ts` define `setListButtons()` pero `ApplicationClass` escribe `this.ListButtons.value` directamente |
| Centralizar `EntityConstructor<T>` | `src/types/entity.types.ts` + `src/decorations/property_name_decorator.ts` | La definición del tipo está duplicada; `property_name_decorator.ts` debe importar desde `@/types/entity.types` |

### Fase 3 — SRP y desacoplamiento de capas (Riesgo medio, coste M-L)

**Requiere tests de cobertura en Fase anterior**. Corrige violaciones de responsabilidad única donde una capa hace trabajo de otra.

| Acción | Archivo | Detalles |
|--------|---------|----------|
| Extraer error UI de entity_repository | `src/entities/entity_repository.ts` | Llama a `Application.ApplicationUIService.openConfirmationMenu()` desde la capa de datos; extraer a callback o usar evento mitt |
| Mover lógica de timeouts mágicos | `src/entities/base_entity.ts` | `setTimeout(resolve, 50)` (x2) y `await new Promise(r => setTimeout(r, 400))` en `validateInputs/save`; nombrar como constantes con justificación en JSDoc |
| Quitar `import Application` de language_helper | `src/helpers/language_helper.ts` | Importa el singleton a nivel de módulo; inyectar la instancia o importar solo la función necesaria para romper el potencial ciclo |
| Migrar sidebar a estado compartido | `src/App.vue` + `src/components/SideBarComponent.vue` | Estado `isOpen` desincronizado entre App.vue y SideBarComponent; centralizar en ui_store |

### Fase 4 — Modernización de componentes (Riesgo medio, coste L)

**Justificación:** Inconsistencia de API entre componentes (Options API vs Composition API) y accesos frágiles a internos de Vue.

| Acción | Archivos | Detalles |
|--------|---------|----------|
| Migrar a `<script setup>` | `src/views/default_detailview.vue`, `src/components/SideBarComponent.vue`, `src/components/TabControllerComponent.vue`, `src/components/Modal/ModalComponent.vue`, `src/components/Informative/ToastContainerComponent.vue`, `src/components/ComponentContainerComponent.vue` | Todos usan Options API; el proyecto declaró Composition API como dirección canónica |
| Eliminar acceso a internos Vue | `src/components/ComponentContainerComponent.vue` | Línea 45: cast a `$.appContext.app`; reemplazar por `getCurrentInstance()` o `provide/inject` |
| Reemplazar `document.querySelector` global | `src/components/ActionsComponent.vue`, `src/components/SideBarComponent.vue`, `src/components/TabControllerComponent.vue` | Usar `ref` de template o `provide/inject` en lugar de selectores DOM globales |
| Mover `useFormRenderer()` a setup | `src/views/default_detailview.vue` | Línea 56: llamada a nivel de módulo, fuera de `setup()`; viola las reglas de composables |
| Mover constante magic number | `src/views/default_listview.vue` | `limit = 999999` → constante nombrada `ALL_RECORDS_LIMIT` con comentario de por qué |
| Corregir hardcoded z-index | `src/components/DataTableComponent.vue` | Línea 298: `z-index: 150` hardcodeado; usar token `var(--z-overlay)` de `src/css/constants.css` |

### Fase 5 — Robustez de validaciones (Riesgo medio, coste M)

**Justificación:** La arquitectura de decoradores permite solo una regla de validación por propiedad; múltiples `@Validation` se sobreescriben silenciosamente.

| Acción | Archivo | Detalles |
|--------|---------|----------|
| Migrar metadata a arrays | `src/decorations/validation_decorator.ts`, `src/decorations/required_decorator.ts`, `src/decorations/async_validation_decorator.ts` | Cambiar el shape de `proto[KEY][propertyKey]` de objeto singular a array; actualizar lectores en `BaseEntity` para iterar y acumular errores |
| Ampliar deepEqual | `src/utils/deep_compare.ts` | Agregar soporte para `Map`, `Set` y detección básica de referencias circulares |
| Añadir runtime config update en logger | `src/utils/logger.ts` | `VITE_LOG_LEVEL` se lee una sola vez en import; exponer `setLogLevel()` para tests/feature flags |

### Fase 6 — I18n exhaustivo y CSS tokens (Riesgo bajo, coste S-M)

| Acción | Archivo | Detalles |
|--------|---------|----------|
| Internacionalizar strings hardcodeados | `src/views/HomeView.vue` | `'Día del año'`, `'Semana'`, `'Días restantes'` → claves `custom.*` en los catálogos de idioma |
| Revisar catálogos `common.*`/`navigation.*` | `src/languages/` | Asegurar que las claves usadas en todos los archivos existen en todos los idiomas (EN/ES/JP) |

---

## SECCIÓN 2: CLASIFICACIÓN DE ARCHIVOS

### Leyenda
- **NÚCLEO/GLOBAL** — Infraestructura del framework; nunca eliminar, cambios requieren máximo cuidado.
- **APP** — Lógica de la aplicación concreta; puede modificarse sin tocar el framework.
- **DEMO/DUMMY** — Solo para pruebas de desarrollo; ELIMINAR antes de producción.

| Archivo | Clasificación | Justificación |
|---------|--------------|---------------|
| `src/types/decorator.types.ts` | NÚCLEO/GLOBAL | Re-exporta tipos de decoradores usados en todo el sistema |
| `src/types/entity.types.ts` | NÚCLEO/GLOBAL | Contratos de tipo para entidades y prototipos decorados |
| `src/types/service.types.ts` | NÚCLEO/GLOBAL | Tipos de queries y respuestas HTTP del framework |
| `src/types/ui.types.ts` | NÚCLEO/GLOBAL | Interfaces de estado UI consumidas por ApplicationUIService |
| `src/types/events.ts` | NÚCLEO/GLOBAL | Mapa de eventos del event bus (mitt) |
| `src/enums/detail_type.ts` | NÚCLEO/GLOBAL | Enum `DetailTypes` — **candidato a eliminar** (sin usos detectados) |
| `src/enums/language.ts` | NÚCLEO/GLOBAL | Enum `Language` usado por i18n y AppConfiguration |
| `src/utils/logger.ts` | NÚCLEO/GLOBAL | Único punto autorizado de `console.*` |
| `src/utils/deep_compare.ts` | NÚCLEO/GLOBAL | `deepEqual` / `deepClone` usado por BaseEntity |
| `src/utils/mask.ts` | NÚCLEO/GLOBAL | Motor de máscaras para inputs de formulario |
| `src/utils/string_inputs.ts` | NÚCLEO/GLOBAL | Formateadores y validadores de strings puros |
| `src/helpers/language_helper.ts` | NÚCLEO/GLOBAL | `GetLanguagedText` — punto de entrada i18n |
| `src/validators/common_validators.ts` | NÚCLEO/GLOBAL | Catálogo de validadores síncronos y asíncronos |
| `src/constants/default_button_lists.ts` | NÚCLEO/GLOBAL | Listas de botones por tipo de vista |
| `src/constants/ggicons.ts` | NÚCLEO/GLOBAL | Catálogo de iconos Material Symbols |
| `src/constants/icons.ts` | APP | Mapeo a assets PNG específicos de la aplicación |
| `src/decorations/module_decorator.ts` | NÚCLEO/GLOBAL | Decoradores de clase `@Module` y sus partes |
| `src/decorations/property_name_decorator.ts` | NÚCLEO/GLOBAL | `@PropertyName`, `@ArrayOf` — metadatos de serialización |
| `src/decorations/validation_decorator.ts` | NÚCLEO/GLOBAL | `@Validation` — regla de validación síncrona |
| `src/decorations/async_validation_decorator.ts` | NÚCLEO/GLOBAL | `@AsyncValidation` — regla de validación asíncrona |
| `src/decorations/required_decorator.ts` | NÚCLEO/GLOBAL | `@Required` — campo obligatorio |
| `src/decorations/on_view_function_decorator.ts` | NÚCLEO/GLOBAL | `@OnViewFunction` — acciones en toolbar de vista |
| `src/entities/entity_http_utils.ts` | NÚCLEO/GLOBAL | `joinUrl`, `getErrorMessage` — helpers HTTP de bajo nivel |
| `src/entities/entity_repository.ts` | NÚCLEO/GLOBAL | Capa de acceso a datos; BaseEntity delega aquí |
| `src/entities/base_entity.ts` | NÚCLEO/GLOBAL | Motor central del framework; clases entiedad extienden esto |
| `src/entities/configuration.ts` | APP | Entidad de configuración de la aplicación concreta |
| `src/entities/home.ts` | APP | Entidad vacía que monta HomeView |
| `src/entities/user.ts` | APP | Entidad de autenticación de la aplicación concreta |
| `src/entities/capitulo.ts` | **DEMO/DUMMY** | Comentario explícito de eliminación; registrada en main.ts |
| `src/entities/imagen.ts` | **DEMO/DUMMY** | Comentario explícito de eliminación; registrada en main.ts |
| `src/entities/super.ts` | **DEMO/DUMMY** | Cubre todos los tipos de input para pruebas visuales |
| `src/main.ts` | APP | Punto de entrada; registra módulos de la aplicación |
| `src/models/app_configuration.ts` | NÚCLEO/GLOBAL | Interfaz `AppConfiguration` (16 campos) |
| `src/models/application_http.ts` | NÚCLEO/GLOBAL | Interceptores HTTP (retry, refresh, CSRF, errores) |
| `src/models/session_service.ts` | NÚCLEO/GLOBAL | Gestión de sesión JWT y tokens |
| `src/models/application.ts` | NÚCLEO/GLOBAL | Singleton `ApplicationClass` — orquestador central |
| `src/models/application_data_service.ts` | NÚCLEO/GLOBAL | Transformaciones API↔dominio |
| `src/models/application_ui_service.ts` | NÚCLEO/GLOBAL | Operaciones UI (toasts, modales, loading) |
| `src/models/application_ui_context.ts` | NÚCLEO/GLOBAL | Type alias `ApplicationUIContext` |
| `src/models/modal.ts` | NÚCLEO/GLOBAL | Interfaz `Modal` |
| `src/models/toast.ts` | NÚCLEO/GLOBAL | Clase `Toast` con generación de ID |
| `src/models/view.ts` | NÚCLEO/GLOBAL | Interfaz `View` y tipo `EntityCtor` |
| `src/models/confirmation_menu.ts` | NÚCLEO/GLOBAL | Interfaz `confirmationMenu` (naming incorrecto → `ConfirmationMenu`) |
| `src/models/enum_adapter.ts` | NÚCLEO/GLOBAL | `EnumAdapter` — conversión enum a pares clave-valor |
| `src/models/input_registry.ts` | NÚCLEO/GLOBAL | `InputRegistry` — mapa propType+stringType → componente Vue |
| `src/stores/index.ts` | NÚCLEO/GLOBAL | Barrel de stores (falta `file_preview_store`) |
| `src/stores/app_config_store.ts` | NÚCLEO/GLOBAL | Backing Pinia de AppConfiguration |
| `src/stores/ui_store.ts` | NÚCLEO/GLOBAL | Backing Pinia del estado UI |
| `src/stores/view_store.ts` | NÚCLEO/GLOBAL | Backing Pinia del estado de vista |
| `src/stores/file_preview_store.ts` | NÚCLEO/GLOBAL | Store de previsualización de archivos (no exportado en index.ts) |
| `src/composables/useCancellableLoader.ts` | NÚCLEO/GLOBAL | AbortController wrapper para requests cancelables |
| `src/composables/useInputMetadata.ts` | NÚCLEO/GLOBAL | Lee metadata de decoradores para componentes de formulario |
| `src/composables/useTableCore.ts` | NÚCLEO/GLOBAL | Lógica compartida de tabla (sort, filter, paginación, drag) |
| `src/composables/useFormRenderer.ts` | NÚCLEO/GLOBAL | Resuelve componente de input desde metadata |
| `src/router/index.ts` | NÚCLEO/GLOBAL | Router + guards de autenticación, permisos y dirty-state |
| `src/App.vue` | APP | Componente raíz; dark mode, lang attribute, layout principal |
| `src/views/LoginView.vue` | APP | Vista de login |
| `src/views/HomeView.vue` | APP | Vista de inicio con estadísticas de fecha |
| `src/views/default_listview.vue` | NÚCLEO/GLOBAL | Vista de lista genérica generada por metadatos |
| `src/views/default_detailview.vue` | NÚCLEO/GLOBAL | Vista de detalle/formulario genérico generado por metadatos |
| `src/views/list.vue` | APP | Menú desplegable de usuario (logout + configuración) — naming confuso |
| `src/components/ActionsComponent.vue` | NÚCLEO/GLOBAL | Barra de acciones (botones de vista) |
| `src/components/DataTableComponent.vue` | NÚCLEO/GLOBAL | Tabla de datos con sort, resize, paginación |
| `src/components/SideBarComponent.vue` | NÚCLEO/GLOBAL | Sidebar de navegación por módulos |
| `src/components/TabControllerComponent.vue` | NÚCLEO/GLOBAL | Controlador de tabs en formularios |
| `src/components/Modal/ModalComponent.vue` | NÚCLEO/GLOBAL | Contenedor de modales |
| `src/components/Informative/ToastContainerComponent.vue` | NÚCLEO/GLOBAL | Contenedor de notificaciones toast |
| `src/components/ComponentContainerComponent.vue` | NÚCLEO/GLOBAL | Contenedor que resuelve y monta componentes dinámicos |
| `src/components/Form/EnumInputComponent.vue` | NÚCLEO/GLOBAL | Input de selección para enums |
| `src/components/Form/FileUploadInputComponent.vue` | NÚCLEO/GLOBAL | Input de carga de archivos |
| `src/components/Form/ArrayInputComponent.vue` | NÚCLEO/GLOBAL | Input para arrays de entidades |

---

## SECCIÓN 3: AUDITORÍA POR PIEZA

### `src/enums/detail_type.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `DetailTypes { NEW, EDIT }` — ningún import en toda la base de código | YAGNI | Medio | Eliminar el archivo; si se necesita en el futuro, regenerar | Bajo (sin uso) | No |

---

### `src/utils/logger.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `VITE_LOG_LEVEL` leído en import-time; no hay forma de cambiar nivel en runtime | OCP | Bajo | Exponer `setLogLevel(level: LogLevel): void` para usar en tests y feature flags | Bajo | No |

---

### `src/utils/deep_compare.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `deepClone`/`deepEqual` no manejan `Map`, `Set` ni referencias circulares | ISP | Bajo | Agregar ramas para `Map`, `Set` con `instanceof`; circular-refs con `WeakSet` de visitados | Bajo (casos de uso actuales no los usan) | Sí (unit test primero) |

---

### `src/helpers/language_helper.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `import Application` a nivel de módulo crea vector de dependencia circular (helper → Application → validators → helper) | DIP | Medio | Recibir `getCurrentLanguage: () => Language` como parámetro en `GetLanguagedText` o hacer lazy import | Medio (refactor de firma pública) | Sí |

---

### `src/validators/common_validators.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `AsyncValidators.unique(endpoint)` usa `Application.axiosInstance` implícito; no testeable en aislamiento | DIP | Bajo | Inyectar `axiosInstance` como parámetro opcional con fallback a `Application.axiosInstance` | Bajo | Sí (unit) |

---

### `src/decorations/property_name_decorator.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `EntityConstructor<T>` definido localmente — duplica el tipo del mismo nombre en `src/types/entity.types.ts` | DRY | Bajo | Importar desde `@/types/entity.types` y eliminar la definición local | Bajo | No |

---

### `src/decorations/validation_decorator.ts`, `required_decorator.ts`, `async_validation_decorator.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Múltiples `@Validation` (o `@Required`, `@AsyncValidation`) en la misma propiedad se sobreescriben silenciosamente — el último gana, los anteriores desaparecen | LSP (rompe la expectativa del contrato del decorador) | Alto | Cambiar `proto[KEY][propertyKey] = rule` por `proto[KEY][propertyKey] = [...(proto[KEY][propertyKey] ?? []), rule]`; actualizar lectores en `BaseEntity` para iterar el array | Alto (cambio de shape de metadatos) | Sí (unit antes) |

---

### `src/entities/entity_repository.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Llama a `Application.ApplicationUIService.openConfirmationMenu()` desde la capa de datos — mezcla acceso a datos con UI | SRP | Medio | Emitir un evento mitt `'data-error'` y que `Application` o el componente escuchen y abran el modal | Medio | Sí |
| 2 | Verifica `PERSISTENT_KEY` en cada función en lugar de un guard único | DRY | Bajo | Extraer un helper `assertPersistent(entityClass)` que lance o retorne early | Bajo | No |

---

### `src/entities/base_entity.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `setTimeout(resolve, 50)` aparece dos veces en `validateInputs()` sin nombre ni comentario; `await new Promise(r => setTimeout(r, 400))` en `save()` | Mantenibilidad | Medio | Extraer como constantes nombradas: `VALIDATION_DEBOUNCE_MS = 50`, `SAVE_VALIDATION_SETTLE_MS = 400`; agregar JSDoc explicando por qué son necesarios (event loop flush, animación) | Bajo | No |
| 2 | El index signature `[key: string]: string \| number \| boolean \| Date \| BaseEntity \| BaseEntity[] \| object \| null \| undefined` amplía tanto los tipos permitidos que erosiona el tipado estricto de subclases | LSP | Bajo | Documentar la restricción; considerar tipo nominal más estrecho en una iteración futura | Bajo | No |
| 3 | `getAutomaticTransformationSchema()` mezcla lógica de generación de esquema con lectura de metadatos en un único método largo | SRP | Bajo | Separar en métodos privados: `_buildDateTransformer`, `_buildEntityTransformer`, etc. | Bajo | No |

---

### `src/entities/configuration.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `guardar()` con `@OnViewFunction` muta directamente `this._originalState = deepClone(...)` — elude el sistema de dirty-state del framework | LSP | Medio | Usar el hook `afterSave()` o `afterUpdate()` para que `BaseEntity` maneje la limpieza del estado | Medio | Sí |

---

### `src/entities/capitulo.ts`, `imagen.ts`, `super.ts`

Todos clasificados como **DEMO/DUMMY** — ver Fase 0. Eliminar junto con sus registros en `src/main.ts`.

---

### `src/main.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Registra tres entidades demo como módulos activos; `User` no se registra como módulo (correcto, es solo auth) | OCP | Alto | Eliminar `registerModule(Capitulo)`, `registerModule(Imagen)`, `registerModule(Super)` tras Fase 0 | Bajo | No |

---

### `src/models/application_http.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Línea ~124: `} catch { }` — bloque catch vacío en el retry de refresh de token; los errores de renovación se tragan silenciosamente | Robustez | Alto | Mínimo `logger.error('Token refresh failed', error)` y posiblemente redirigir a login cuando el refresh falla | Bajo | No |

---

### `src/models/session_service.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `isTokenExpired()` retorna `false` (no expirado) cuando el parseo del JWT falla — comportamiento fail-open | Seguridad | Crítico | Retornar `true` (sí expirado) en caso de error de parseo; un token malformado no debe ser tratado como válido | Bajo | Sí (unit) |

---

### `src/models/toast.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `Math.random().toString(36).substr(2, 9)` — `.substr` está deprecado desde ES2021 | Mantenibilidad | Bajo | Cambiar a `.substring(2, 11)` | Bajo | No |

---

### `src/models/confirmation_menu.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `interface confirmationMenu` — nombre en camelCase viola la convención PascalCase del proyecto (`.claude/rules/style.md`) | Estilo | Bajo | Renombrar a `ConfirmationMenu`; actualizar todos los usos (application.ts, ui_store.ts, ui.types.ts) | Bajo | No |

---

### `src/stores/app_config_store.ts`, `ui_store.ts`, `view_store.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Valores por defecto de `AppConfiguration` duplicados entre `app_config_store.ts` y el constructor de `ApplicationClass` | DRY | Medio | Extraer `DEFAULT_APP_CONFIG` como constante en `src/models/app_configuration.ts` e importarla en ambos lugares | Bajo | No |
| 2 | `ui_store.ts` duplica los defaults de `modal`, `dropdownMenu`, `confirmationMenu` ya declarados en `ApplicationClass` | DRY | Medio | Extraer `DEFAULT_UI_STATE` y compartirlo | Bajo | No |
| 3 | `view_store.ts` define `setListButtons(buttons)` pero `ApplicationClass.setButtonList()` escribe `this.ListButtons.value` directamente en lugar de llamar al action del store | DRY / Coherencia | Bajo | Reemplazar asignación directa por llamada a `setListButtons(...)` | Bajo | No |
| 4 | `file_preview_store.ts` no está exportado en `src/stores/index.ts`; los consumidores importan directamente el archivo | ISP | Bajo | Añadir `export { useFilePreviewStore } from './file_preview_store'` al barrel | Bajo | No |

---

### `src/composables/useInputMetadata.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | El `watch` debounciado para validación asíncrona observa `required` (computed derivado de metadata) en lugar de `entity[propertyKey]`; la validación no se ejecuta al cambiar el valor del campo | Bug | Alto | Cambiar `watch(() => required.value, ...)` a `watch(() => (entity as Record<string, unknown>)[propertyKey], ...)` | Medio | Sí (unit) |

---

### `src/composables/useTableCore.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `DEFAULT_COL_WIDTH = 250` y `MIN_COL_WIDTH = 50` son constantes a nivel de módulo sin JSDoc; no queda claro si son configurables por consumidor | Mantenibilidad | Bajo | Moverlas como parámetros opcionales del composable o exportarlas con documentación | Bajo | No |
| 2 | Registra event listeners globales (`document.addEventListener`) en `startResize`; `cleanup()` debe llamarse en `onBeforeUnmount` pero esto no se aplica por contrato — si el componente no llama `cleanup()`, los listeners quedan colgados | SRP / Robustez | Medio | Llamar `onBeforeUnmount(cleanup)` dentro del composable; el consumidor no debería tener que recordarlo | Bajo | No |

---

### `src/composables/useFormRenderer.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `DATE_TIME_LOCAL_SUFFIX = 'T00:00:00'` hardcodeado en `setModelValue`; asume UTC midnight sin zona horaria | Mantenibilidad | Bajo | Documentar la asunción en JSDoc; si se requiere soporte multi-zona, extraer a configuración | Bajo | No |

---

### `src/router/index.ts`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `initializeRouterWithApplication()` exportada como función no-op — dead code | Mantenibilidad | Bajo | Eliminar la función y sus importaciones | Bajo | No |
| 2 | Línea ~185: `if (defaultComponent)` siempre es `true` porque `getModuleDefaultComponent()` retorna `DefaultListview` como fallback — rama `else` inalcanzable | Lógica | Bajo | Eliminar la condición o documentar explícitamente que el fallback garantiza que siempre hay componente | Bajo | No |
| 3 | `routerLoader = useCancellableLoader()` invocado a nivel de módulo — composable llamado fuera de contexto Vue (no hay instancia activa) | Regla de composables | Medio | Mover la creación del loader dentro del factory de router o del guard | Bajo | No |

---

### `src/App.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `isOpen` del sidebar declarado localmente en App.vue y también en `SideBarComponent.vue` — posible desincronización | SRP | Bajo | Centralizar en `ui_store` con `ref` compartido | Bajo | No |

---

### `src/views/HomeView.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Strings `'Día del año'`, `'Semana'`, `'Días restantes'` hardcodeados en español — no usan `GetLanguagedText` | I18n | Medio | Añadir claves `custom.home.day_of_year`, `custom.home.week`, `custom.home.remaining_days` en los catálogos y reemplazar las cadenas | Bajo | No |

---

### `src/views/default_listview.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `limit = 999999` como número mágico para "todos los registros" | Mantenibilidad | Bajo | Extraer como constante `ALL_RECORDS_LIMIT = 999_999` con comentario explicativo de por qué se usa en lugar de un flag booleano | Bajo | No |

---

### `src/views/default_detailview.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Usa Options API (`export default {}`) mientras el resto del proyecto usa `<script setup lang="ts">` | Consistencia | Medio | Migrar a `<script setup>`; requiere mover `_renderer`, `groupedProperties` y los watchers a Composition API | Medio | Sí (E2E) |
| 2 | `_renderer = useFormRenderer()` en línea 56 llamado a nivel de módulo (fuera de `setup()`) | Regla de composables | Medio | Mover dentro de `setup()` o `onMounted` | Bajo | No |
| 3 | Bloque de comentario "FUTURE: async loadEntityFromAPI" (líneas ~141-151) — dead code comentado | Mantenibilidad | Bajo | Eliminar o convertir en issue de GitHub | Bajo | No |

---

### `src/components/ActionsComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `document.querySelector('.ComponentContainer')` — selector DOM global que puede coincidir con elementos de otros componentes | Robustez | Medio | Usar `ref` de template o `provide/inject` para obtener la referencia al contenedor padre | Bajo | No |

---

### `src/components/DataTableComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Línea ~298: `.dt-loading-overlay { z-index: 150 }` — valor hardcodeado viola la regla de CSS tokens | CSS | Bajo | Reemplazar por `z-index: var(--z-overlay)` definido en `src/css/constants.css` | Bajo | No |
| 2 | `isServerMode = props.totalCount !== undefined` calculado en `setup()` — no es reactivo; si `totalCount` cambia de `undefined` a número después del mount, `isServerMode` no se actualiza | Reactividad | Bajo | Cambiar a `const isServerMode = computed(() => props.totalCount !== undefined)` | Bajo | No |

---

### `src/components/SideBarComponent.vue`, `TabControllerComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `document.querySelectorAll('.tab-component')` — selector global; en páginas con múltiples instancias de `TabControllerComponent` el resultado sería incorrecto | Robustez | Medio | Usar `ref` en el template y limitar el query al nodo raíz del componente (`this.$el.querySelectorAll`) | Bajo | No |
| 2 | Ambos usan Options API — inconsistente con la dirección del proyecto | Consistencia | Bajo | Migrar a `<script setup>` en Fase 4 | Bajo | No |

---

### `src/components/Modal/ModalComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Comentario ESLint disable para efecto secundario en computed: `this.modalModule = modal.modalView` | Calidad | Bajo | Mover la asignación a un `watch` en lugar de un computed | Bajo | No |
| 2 | El botón "Accept" en el footer del modal no tiene handler de acción | Bug | Medio | Conectar a un evento o eliminar si la aceptación siempre viene del contenido del modal | Bajo | No |

---

### `src/components/Informative/ToastContainerComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `this.Application.ToastList.findIndex(...)` en método Options API — `ToastList` es `Ref<Toast[]>`; `.findIndex` se llama sobre el `Ref` wrapper, no sobre el array; el template funciona por auto-unwrap pero el método en JS no auto-unwrap | Bug | Alto | Cambiar a `this.Application.ToastList.value.findIndex(...)` | Bajo | Sí (unit) |

---

### `src/components/ComponentContainerComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Línea ~45: acceso a internals de Vue vía cast `(this as unknown as { $: { appContext: { app: { component: ... } } } }).$...` — extremadamente frágil, rompe con cualquier cambio de internos de Vue | Robustez / LSP | Alto | Reemplazar por `getCurrentInstance()?.appContext.app.component(...)` o registrar los componentes de forma diferente a través de `app.component()` en `main.ts` | Medio | Sí (E2E) |

---

### `src/components/Form/EnumInputComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `document.getElementById(\`id-4-click-on${metadata.propertyName}\`)` — acceso imperativo al DOM por ID construido dinámicamente | Robustez | Bajo | Usar `ref` de template o emit evento para activar el dropdown desde el padre | Bajo | No |

---

### `src/components/Form/ArrayInputComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | Prop `requireddMessage` — typo con doble 'd'; rompe la interfaz del componente para consumidores externos | Estilo / API | Bajo | Renombrar a `requiredMessage`; buscar todos los usos y corregirlos | Bajo | No |
| 2 | No usa `useInputMetadata` a diferencia de todos los demás inputs de formulario — inconsistencia que puede llevar a omitir metadatos disponibles (helpText, disabled, etc.) | Consistencia | Medio | Integrar `useInputMetadata(props.entityClass, props.entity, props.propertyKey)` | Bajo | No |

---

### `src/components/Form/FileUploadInputComponent.vue`

| # | Olor / Issue | Principio SOLID | Severidad | Fix propuesto | Riesgo | Tests previos |
|---|---|---|---|---|---|---|
| 1 | `previewFile.value = currentFile.value` asignado antes de llamar a `openModal()` — efecto secundario en el estado compartido antes de que la UI confirme la acción | SRP | Bajo | Asignar `previewFile` dentro del callback de apertura del modal o tras confirmación | Bajo | No |

---

## Resumen ejecutivo de severidades

| Severidad | Cantidad | Ejemplos representativos |
|-----------|----------|--------------------------|
| Crítico | 1 | `isTokenExpired()` fail-open (sessionService) |
| Alto | 5 | Decoradores @Validation sobreescriben (`validation_decorator`), catch vacío en refresh token (`application_http`), watch incorrecto en useInputMetadata, `ToastList` sin `.value`, acceso a internos Vue en ComponentContainer |
| Medio | 10 | SRP en entity_repository, Options API en default_detailview, selector DOM global en ActionsComponent/TabControllerComponent, useFormRenderer fuera de setup, sidebar desincronizado, mutation directa en configuration.ts, módulos demo activos en main.ts, lenguaje_helper circular, ArrayInputComponent sin useInputMetadata, botón modal sin handler |
| Bajo | ~25 | Typos, constantes mágicas, DRY duplications, dead code, naming violations, CSS hardcoded, substr deprecated, YAGNI enum |

**Prioridad de acción:** Fase 0 + Fase 1 son no-negociables antes de poner en producción (entidades demo activas, fail-open de seguridad, bug de ToastList, catch vacío). El resto puede planificarse en sprints.
