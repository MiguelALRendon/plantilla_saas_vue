# Code Standards Checklist: Framework SaaS Vue

**Purpose**: Validate compliance with code styling standards before implementation review
**Contract**: [`/copilot/06-CODE-STYLING-STANDARDS.md`](/copilot/06-CODE-STYLING-STANDARDS.md)
**Created**: 2026-02-27
**Feature**: [spec.md](../spec.md) §10 Code Styling Standards

---

## Formateo — Indentación (§6.1.1)

- [ ] Toda indentación usa **4 espacios** (no tabs, no 2 espacios)
- [ ] Configuración EditorConfig presente: `indent_style = space`, `indent_size = 4` para `*.{ts,js,vue}`

---

## Formateo — Comillas (§6.1.2)

- [ ] Strings literales en TypeScript/JavaScript usan **comillas simples** (`'`)
- [ ] Comillas dobles (`"`) usadas solo en: atributos HTML en templates Vue, strings que contienen `'` como contenido, JSON
- [ ] Sin comillas dobles arbitrarias en código `.ts`

---

## Formateo — Strings con Variables (§6.1.3)

- [ ] **Prohibición absoluta** de operador `+` para concatenar strings con variables
- [ ] Todo string con variables usa **template literals** (backticks `` ` ``)
- [ ] Sin mezcla de concatenación y template literals en el mismo string

---

## Formateo — Semicolons (§6.1.4)

- [ ] Punto y coma (`;`) presente al final de toda declaración y expresión que lo requiera
- [ ] Sin semicolons después de cierre de clases `}`, funciones `}`, o interfaces `}`

---

## Formateo — Parámetros y Line Length (§6.1.5)

- [ ] Funciones con más de 3 parámetros tienen cada parámetro en línea separada
- [ ] Llamadas a funciones con múltiples argumentos complejos separados en líneas individuales
- [ ] Un decorador por línea (sin `@Deco1 @Deco2` en la misma línea)
- [ ] Objetos con muchas propiedades separados en líneas individuales

---

## Formateo — Trailing Commas (§6.1.6)

- [ ] Arrays multilinea tienen trailing comma en el último elemento
- [ ] Objetos multilinea tienen trailing comma en la última propiedad
- [ ] Listas de parámetros multilinea tienen trailing comma en el último parámetro
- [ ] Imports multilinea tienen trailing comma en el último import

---

## Formateo — Spacing (§6.1.7)

- [ ] Espacios alrededor de operadores aritméticos, lógicos y de comparación
- [ ] Espacio después de comas en listas
- [ ] Espacio después de dos puntos en objetos (`{ key: value }`)
- [ ] Espacio antes y después de llaves en objetos inline
- [ ] Espacio después de palabras clave: `if (`, `for (`, `while (`, `function (`
- [ ] Sin espacios dentro de `<>` en tipos genéricos

---

## Estructura — Import Order (§6.2.1)

- [ ] Imports organizados en orden: **1) Vue framework → 2) libs externas → 3) aliased (`@/`) → 4) relativos**
- [ ] Grupos de imports separados por línea en blanco
- [ ] Dentro de cada grupo, imports multilinea en orden **alfabético**
- [ ] Imports de `type` al final de su grupo respectivo
- [ ] Imports aliased multilinea con trailing comma

---

## Estructura — Archivos TypeScript (§6.2.2)

- [ ] Orden interno de archivos: imports → interfaces/types locales → enums locales → constantes locales → clase(s)

---

## Estructura — Variables (§6.2.3)

- [ ] Variables dentro de funciones definidas en **orden de flujo lógico de uso**
- [ ] Variables de configuración agrupadas al inicio del bloque
- [ ] Variables relacionadas agrupadas visualmente

---

## Estructura — Regions en Clases (§6.2.4)

- [ ] Toda clase tiene las 3 regions obligatorias marcadas: `// #region PROPERTIES`, `// #region METHODS`, `// #region METHODS OVERRIDES`
- [ ] Cada region cierra con `// #endregion`
- [ ] Propiedades de instancia están dentro de `PROPERTIES`
- [ ] Métodos propios de la clase están dentro de `METHODS`
- [ ] Métodos que sobreescriben clase padre están dentro de `METHODS OVERRIDES`
- [ ] Componentes Vue con `<script>` tienen regiones equivalentes aplicadas

---

## TypeScript Strict (§6.4)

- [ ] Sin uso de tipo `any` en ningún archivo (`.ts` o `.vue`)
- [ ] Toda variable tiene tipo explícito declarado (`const name: string = ...`)
- [ ] Todo método/función tiene tipo de retorno declarado
- [ ] Enums sin valores numéricos explícitos salvo que sean intencionalmente distintos de 0,1,2...
- [ ] `interface` usado sobre `type` para describir shapes de objetos
- [ ] `tsconfig.json` mantiene: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`

---

## Documentación JSDoc (§6.5)

- [ ] Toda **propiedad pública** tiene comentario JSDoc (`/** ... */`) encima
- [ ] Todo **método público** tiene comentario JSDoc con descripción, `@param` y `@returns`
- [ ] Constructores de clases tienen descripción JSDoc
- [ ] Sin comentarios `//` single-line para documentar elementos públicos (solo `/** */`)

---

## Git — Commits (§6.6)

- [ ] Mensajes de commit escritos en **inglés**
- [ ] Formato estructurado: `type(scope): description` (ej: `feat(entities): add Customer decorator`)
- [ ] Commits realizados solo con **autorización explícita del usuario**
- [ ] Sin commits automatizados sin aprobación

---

## Naming Conventions (referencia §6.9 + 05-ENFORCEMENT §6.8)

- [ ] Clases: `PascalCase` (`BaseEntity`, `ApplicationClass`)
- [ ] Métodos y propiedades de instancia: `camelCase` (`getModuleName()`, `_isLoading`)
- [ ] Constantes de módulo: `UPPER_SNAKE_CASE` (`MODULE_NAME_KEY`, `API_ENDPOINT_KEY`)
- [ ] Archivos: `snake_case` para `.ts` y `.vue` (`base_entity.ts`, `TextInputComponent.vue`)
- [ ] Enums y sus miembros: `PascalCase` para nombre del enum, `UPPER_CASE` para los valores
- [ ] Sin nombres ambiguos, abreviados o no auto-descriptivos
- [ ] Sin introducción de naming conventions no autorizadas

---

## Cobertura de Auditoría

| Área | Regla Clave | Estado |
|------|-------------|--------|
| Indentación 4 espacios | §6.1.1 | - |
| Comillas simples | §6.1.2 | - |
| Template literals (sin `+`) | §6.1.3 | - |
| Semicolons presentes | §6.1.4 | - |
| Trailing commas multilinea | §6.1.6 | - |
| Import order jerárquico | §6.2.1 | - |
| Regions en todas las clases | §6.2.4 | - |
| Sin `any` en ningún archivo | §6.4.1 | - |
| JSDoc en propiedades/métodos públicos | §6.5 | - |
| Commits en inglés con autorización | §6.6 | - |
| Naming conventions correctas | §6.9 | - |
