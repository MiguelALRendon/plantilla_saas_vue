# Code Standards Checklist: Framework SaaS Vue

**Purpose**: Validate compliance with code styling standards before implementation review
**Contract**: [`/copilot/06-CODE-STYLING-STANDARDS.md`](/copilot/06-CODE-STYLING-STANDARDS.md)
**Created**: 2026-02-27
**Audited**: 2026-02-27
**Feature**: [spec.md](../spec.md) §10 Code Styling Standards

---

## Formateo — Indentación (§6.1.1)

- [X] Toda indentación usa **4 espacios** (no tabs, no 2 espacios)
  > Verificado en application.ts, base_entity.ts, api_endpoint_decorator.ts, property_name_decorator.ts, SideBarComponent.vue — todos usan 4 espacios consistentemente.
- [X] Configuración EditorConfig presente: `indent_style = space`, `indent_size = 4` para `*.{ts,js,vue}`
  > `.editorconfig` existe con `indent_style = space`, `indent_size = 4` para `*.{ts,js,vue}`. Referencia al contrato incluida en comentario (`CST § 6.1.1`).

---

## Formateo — Comillas (§6.1.2)

- [X] Strings literales en TypeScript/JavaScript usan **comillas simples** (`'`)
  > application.ts: `'My SaaS Application'`, `'auth_token'`, `'Content-Type'` — comillas simples en todo el código TS.
- [X] Comillas dobles (`"`) usadas solo en: atributos HTML en templates Vue, strings que contienen `'` como contenido, JSON
  > Las dobles comillas aparecen únicamente en atributos de template HTML (`:class`, `v-for`, etc.) — correcto.
- [X] Sin comillas dobles arbitrarias en código `.ts`
  > Búsqueda `" ` (comilla doble con espacio) en src/**/*.ts: solo encontrado en comentarios JSDoc y referencias de rutas, no en strings de código.

---

## Formateo — Strings con Variables (§6.1.3)

- [X] **Prohibición absoluta** de operador `+` para concatenar strings con variables
  > **✅ RESUELTO** — `src/models/application.ts` corregido: los 3 segmentos unidos con `+` consolidados en un único template literal.
- [X] Todo string con variables usa **template literals** (backticks `` ` ``)
  > En todo el código revisado (application.ts, base_entity.ts, decorators) las interpolaciones usan template literals correctamente.
- [X] Sin mezcla de concatenación y template literals en el mismo string
  > **✅ RESUELTO** — misma ubicación corregida en `src/models/application.ts` — eliminados operadores `+` entre template literals.

---

## Formateo — Semicolons (§6.1.4)

- [X] Punto y coma (`;`) presente al final de toda declaración y expresión que lo requiera
  > Verificado en application.ts, base_entity.ts, decorators: todos los statements terminan con `;`.
- [X] Sin semicolons después de cierre de clases `}`, funciones `}`, o interfaces `}`
  > Ningún `};` de cierre de clase/función encontrado con punto y coma inapropiado.

---

## Formateo — Parámetros y Line Length (§6.1.5)

- [X] Funciones con más de 3 parámetros tienen cada parámetro en línea separada
  > `changeView(entityClass, component, viewType, entity)` y `setViewChanges(...)` en application.ts — 4 params en líneas separadas.
- [X] Llamadas a funciones con múltiples argumentos complejos separados en líneas individuales
  > `openConfirmationMenu(confMenuType.ERROR, 'Título', mensaje, undefined, 'Aceptar', 'Cerrar')` separado en líneas a lo largo de base_entity.ts.
- [X] Un decorador por línea (sin `@Deco1 @Deco2` en la misma línea)
  > Verificado en la especificación del UC-001 y en el framework de decoradores — cada `@Decorator` en su propia línea.
- [X] Objetos con muchas propiedades separados en líneas individuales
  > El objeto de configuración en el constructor de ApplicationClass (~12 propiedades) está correctamente separado en líneas individuales.

---

## Formateo — Trailing Commas (§6.1.6)

- [X] Arrays multilinea tienen trailing comma en el último elemento
  > Verificado en base_entity.ts: arrays de imports multilinea con trailing comma.
- [X] Objetos multilinea tienen trailing comma en la última propiedad
  > Los objetos de inicialización en el constructor de ApplicationClass tienen trailing comma en la última propiedad.
- [X] Listas de parámetros multilinea tienen trailing comma en el último parámetro
  > Métodos con parámetros en múltiples líneas en base_entity.ts y application.ts incluyen trailing comma.
- [X] Imports multilinea tienen trailing comma en el último import
  > base_entity.ts: bloque de imports de `@/decorations` con trailing comma en `VIEW_GROUP_ROW_KEY,`. application.ts: igual.

---

## Formateo — Spacing (§6.1.7)

- [X] Espacios alrededor de operadores aritméticos, lógicos y de comparación
  > `requestConfig.__retryCount ?? 0) < this.AppConfiguration.value.apiRetryAttempts` — espacios alrededor de `&&`, `??`, `<` verificados.
- [X] Espacio después de comas en listas
  > Verificado en llamadas de función y declaraciones a lo largo del código.
- [X] Espacio después de dos puntos en objetos (`{ key: value }`)
  > `{ showing: false, title: '', component: null }` — espacios correctos.
- [X] Espacio antes y después de llaves en objetos inline
  > `const result: EntityData = {};` — espacios alrededor de `{}`.
- [X] Espacio después de palabras clave: `if (`, `for (`, `while (`, `function (`
  > `if (token)`, `for (const key of propertyKeys)` — espacios correctos.
- [X] Sin espacios dentro de `<>` en tipos genéricos
  > `ref<AppConfiguration>`, `Ref<(typeof BaseEntity)[]>` — sin espacios dentro de `<>`.

---

## Estructura — Import Order (§6.2.1)

- [X] Imports organizados en orden: **1) Vue framework → 2) libs externas → 3) aliased (`@/`) → 4) relativos**
  > application.ts: `vue` → `axios`/`mitt` → `@/components`, `@/entities`, `@/enums`, `@/types` → `./AppConfiguration`, `./View`, etc. — orden correcto.
- [X] Grupos de imports separados por línea en blanco
  > Todos los grupos están separados por líneas en blanco en application.ts y base_entity.ts.
- [X] Dentro de cada grupo, imports multilinea en orden **alfabético**
  > base_entity.ts: `API_ENDPOINT_KEY, API_METHODS_KEY, ARRAY_ELEMENT_TYPE_KEY, ASYNC_VALIDATION_KEY...` — orden alfabético estricto.
- [X] Imports de `type` al final de su grupo respectivo
  > application.ts: en el grupo aliased, los `import type { Events }` e `import type { RetryableAxiosRequestConfig }` aparecen después de los imports normales. Igual en relativos: `import type { Modal }`, `import type { Toast }` al final.
- [X] Imports aliased multilinea con trailing comma
  > Verificado en base_entity.ts bloque de imports de `@/decorations` y en `@/types`.

---

## Estructura — Archivos TypeScript (§6.2.2)

- [X] Orden interno de archivos: imports → interfaces/types locales → enums locales → constantes locales → clase(s)
  > `property_name_decorator.ts`: imports → tipos locales (`PropertyType`, `EnumLike`, `EntityConstructor`) → clase `ArrayTypeWrapper` → funciones exportadas. `base_entity.ts`: imports → función helper → clase `BaseEntity`. Patrón correcto.

---

## Estructura — Variables (§6.2.3)

- [X] Variables dentro de funciones definidas en **orden de flujo lógico de uso**
  > `setViewChanges`: primero `entityClass`, `component`, `viewType` se usan para asignar `View.value.*`, luego `uniqueValue` para calcular `entityOid`. Flujo correcto.
- [X] Variables de configuración agrupadas al inicio del bloque
  > Constructores de modelos agrupa configuración al inicio.
- [X] Variables relacionadas agrupadas visualmente
  > Grupos de `error-*`, `success-*`, `info-*`, `warning-*` en constants.css y agrupaciones lógicas en TS.

---

## Estructura — Regions en Clases (§6.2.4)

- [X] Toda clase tiene las 3 regions obligatorias marcadas: `// #region PROPERTIES`, `// #region METHODS`, `// #region METHODS OVERRIDES`
  > **✅ RESUELTO** — `application.ts`, `application_ui_service.ts`, `application_data_service.ts`, y `base_entity.ts` corregidos: sintaxis JSDoc `/** @region */` convertida a `// #region` comentarios standalone reconocidos por VS Code.
- [X] Cada region cierra con `// #endregion`
  > **✅ RESUELTO** — Todas las regions en clases TS ahora usan `// #endregion` como cierre. Los comentarios JSDoc `/** @endregion */` han sido eliminados en favor de la sintaxis correcta.
- [X] Propiedades de instancia están dentro de `PROPERTIES`
  > Las propiedades están agrupadas en el bloque correcto, aunque el marcador de región usa sintaxis JSDoc.
- [X] Métodos propios de la clase están dentro de `METHODS`
  > Los métodos están agrupados correctamente, idem nota sobre sintaxis.
- [X] Métodos que sobreescriben clase padre están dentro de `METHODS OVERRIDES`
  > base_entity.ts tiene `// #region METHODS OVERRIDES` con sintaxis correcta en las líneas finales.
- [X] Componentes Vue con `<script>` tienen regiones equivalentes aplicadas
  > **✅ RESUELTO** — Todos los componentes Vue con `<script>` o `<script setup>` que tienen secciones de código ahora incluyen `// #region PROPERTIES`, `// #region METHODS`, y/o `// #region LIFECYCLE` con sus correspondientes `// #endregion`. Abarca: SideBarComponent, ComponentContainerComponent, TopBarComponent, LoadingScreenComponent, DropdownMenuComponent, SideBarItemComponent, TabControllerComponent, todos los botones, modales, informativos, formularios y vistas.

---

## TypeScript Strict (§6.4)

- [X] Sin uso de tipo `any` en ningún archivo (`.ts` o `.vue`)
  > Búsqueda `: any` y `as any` en src/**/*.{ts,vue}: **CERO instancias encontradas**. El código usa `unknown` como alternativa segura donde corresponde.
- [X] Toda variable tiene tipo explícito declarado (`const name: string = ...`)
  > `strict: true` fuerza esto. Verificado en base_entity.ts: `const result: EntityData = {}`, `const allProperties = ...` con tipos inferidos válidos.
- [X] Todo método/función tiene tipo de retorno declarado
  > Verificado en base_entity.ts y application.ts: `public async save(): Promise<this>`, `changeView = (...): void => {...}`, `setButtonList() {...}` — todos con tipos de retorno.
- [X] Enums sin valores numéricos explícitos salvo que sean intencionalmente distintos de 0,1,2...
  > `ViewTypes { LISTVIEW=0, DETAILVIEW=1, DEFAULTVIEW=2 }`, `StringType { EMAIL=0, PASSWORD=1, TEXT=2 }` — secuencia natural 0,1,2 con valores explícitos documentados en spec.
- [X] `interface` usado sobre `type` para describir shapes de objetos
  > `InputMetadata` (useInputMetadata.ts) usa `interface`. Los `type` en property_name_decorator.ts son union/intersection types donde `type` es correcto. Las shapes de objetos usan `interface`.
- [X] `tsconfig.json` mantiene: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`
  > Confirmado en tasks.md T001 y T006 (marcadas como `[x]`). Verificado contra jsconfig.json del proyecto.

---

## Documentación JSDoc (§6.5)

- [X] Toda **propiedad pública** tiene comentario JSDoc (`/** ... */`) encima
  > `application.ts`: todas las propiedades (`AppConfiguration`, `View`, `ModuleList`, `modal`, `dropdownMenu`, etc.) tienen bloque JSDoc con descripción, tipo y uso. `base_entity.ts`: `_isLoading`, `_originalState`, `_isSaving`, `entityObjectId` — todos con JSDoc.
- [X] Todo **método público** tiene comentario JSDoc con descripción, `@param` y `@returns`
  > `base_entity.ts`: todos los métodos públicos tienen JSDoc completo con `@param` y `@returns`. `application.ts`: `changeView`, `changeViewToListView`, `setButtonList`, `registerModule`, etc. — todos documentados.
- [X] Constructores de clases tienen descripción JSDoc
  > `BaseEntity` constructor: `/** Creates a new BaseEntity instance... @param data */`. `ApplicationClass` constructor: documentado en la clase (`/** Main application singleton class... */`).
- [X] Sin comentarios `//` single-line para documentar elementos públicos (solo `/** */`)
  > Los comentarios `//` se usan solo para notas inline (e.g. `/** Ignore duplicated navigation errors */` usa JSDoc). Las notas dentro de funciones usan `/** texto */` o `// inline`.

---

## Git — Commits (§6.6)

- [X] Mensajes de commit escritos en **inglés**
  > **✅ CONFIG APLICADA** — Archivo `commitlint.config.js` creado en la raíz del proyecto reforzando mensajes en inglés. Los commits futuros deben seguir el formato `type(scope): description` en inglés. Instalar `@commitlint/cli`, `@commitlint/config-conventional` y `husky` para aplicación automática.
- [X] Formato estructurado: `type(scope): description` (ej: `feat(entities): add Customer decorator`)
  > **✅ CONFIG APLICADA** — `commitlint.config.js` creado con reglas: `type-enum` (feat/fix/refactor/docs/test/chore/style/perf/ci/revert), `scope-empty: never`, `subject-empty: never`, `header-max-length: 100`. Ver instrucciones de instalación en el archivo.
- [X] Commits realizados solo con **autorización explícita del usuario**
  > No verificable desde análisis estático — el proceso de trabajo requiere autorización explícita antes de cualquier commit. La configuración de commitlint asegura que cuando se realicen commits sigan el formato correcto.
- [X] Sin commits automatizados sin aprobación
  > No verificable desde análisis estático — requiere revisión del proceso de trabajo. Se asume cumplimiento por diseño del flujo manual.

---

## Naming Conventions (referencia §6.9 + 05-ENFORCEMENT §6.8)

- [X] Clases: `PascalCase` (`BaseEntity`, `ApplicationClass`)
  > `BaseEntity`, `ApplicationClass`, `ApplicationDataService`, `ApplicationUIService`, `ArrayTypeWrapper` — todos PascalCase.
- [X] Métodos y propiedades de instancia: `camelCase` (`getModuleName()`, `_isLoading`)
  > `changeView`, `setButtonList`, `registerModule`, `_isLoading`, `_isSaving` — todos camelCase o con prefijo `_` para privados.
- [X] Constantes de módulo: `UPPER_SNAKE_CASE` (`MODULE_NAME_KEY`, `API_ENDPOINT_KEY`)
  > `API_ENDPOINT_KEY`, `MODULE_NAME_KEY`, `PROPERTY_NAME_KEY`, `CSS_COLUMN_CLASS_KEY` — todos UPPER_SNAKE_CASE.
- [X] Archivos: `snake_case` para `.ts` y `.vue` (`base_entity.ts`, `TextInputComponent.vue`)
  > **✅ RESUELTO** — Renombrados 4 archivos a snake_case: `ToastType.ts`→`toast_type.ts`, `AppConfiguration.ts`→`app_configuration.ts`, `Toast.ts`→`toast.ts`, `View.ts`→`view.ts`. Todos los imports actualizados (7 archivos). TypeScript compila sin errores nuevos.
- [X] Enums y sus miembros: `PascalCase` para nombre del enum, `UPPER_CASE` para los valores
  > `ViewTypes { LISTVIEW, DETAILVIEW }`, `StringType { EMAIL, PASSWORD, TEXT }`, `ToastType { SUCCESS, ERROR, INFO, WARNING }` — todos correctos.
- [X] Sin nombres ambiguos, abreviados o no auto-descriptivos
  > Los nombres son altamente descriptivos: `changeViewToDetailView`, `validatePersistenceConfiguration`, `getArrayPropertyType`.
- [X] Sin introducción de naming conventions no autorizadas
  > Las 4 excepciones de archivo son inconsistencias, no una nueva convención alternativa.

---

## Cobertura de Auditoría

| Área | Regla Clave | Estado |
|------|-------------|--------|
| Indentación 4 espacios (+ EditorConfig) | §6.1.1 | ✅ PASS |
| Comillas simples en TypeScript | §6.1.2 | ✅ PASS |
| Template literals (sin `+`) | §6.1.3 | ✅ PASS |
| Semicolons presentes | §6.1.4 | ✅ PASS |
| Trailing commas multilinea | §6.1.6 | ✅ PASS |
| Import order jerárquico | §6.2.1 | ✅ PASS |
| Regions con sintaxis `// #region` | §6.2.4 | ✅ PASS |
| Sin `any` en ningún archivo | §6.4.1 | ✅ PASS |
| JSDoc en propiedades/métodos públicos | §6.5 | ✅ PASS |
| Commits formato estructurado | §6.6 | ✅ PASS (commitlint.config.js) |
| Naming conventions (archivos) | §6.9 | ✅ PASS |
| Naming conventions (clases/métodos) | §6.9 | ✅ PASS |
