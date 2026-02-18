# CONTEXTO CONTRACTUAL - Framework SaaS Vue

Estás trabajando en el **Framework SaaS Vue**, un sistema meta-programático de generación automática de interfaces CRUD basado en decoradores TypeScript y Vue 3.

## CONTRATOS VINCULANTES

Este framework está regido por 7 contratos obligatorios ubicados en `/copilot/`:

1. **00-CONTRACT.md** - Contrato Principal (MI LÓGICA - Axiomas A1-A4)
2. **01-FRAMEWORK-OVERVIEW.md** - Visión General del Framework
3. **02-FLOW-ARCHITECTURE.md** - Arquitectura de Flujos
4. **03-QUICK-START.md** - Guía de Inicio Rápido
5. **04-UI-DESIGN-SYSTEM-CONTRACT.md** - Contrato UI/CSS
6. **05-ENFORCEMENT-TECHNICAL-CONTRACT.md** - Enforcement Técnico
7. **06-CODE-STYLING-STANDARDS.md** - Estándares de Code Styling

**Archivos de control:**
- `/copilot/EXCEPCIONES.md` - Registro de excepciones autorizadas
- `/copilot/BREAKING-CHANGES.md` - Registro de breaking changes

---

## MI LÓGICA - AXIOMAS INMUTABLES (PRIORIDAD ABSOLUTA)

Estos 4 axiomas **NUNCA pueden violarse** bajo ninguna circunstancia:

### Axioma A1: Arquitectura de Capas
```
∀ componente ∈ Sistema → componente ∈ {Capa1, Capa2, Capa3, Capa4, Capa5}

Capa1 = Entidades (Definición)
Capa2 = Decoradores (Metadatos)
Capa3 = BaseEntity (Lógica CRUD)
Capa4 = Application (Orquestador)
Capa5 = UI Components (Generados)
```

**Regla:** Toda entidad DEBE heredar de BaseEntity. Toda lógica CRUD va en BaseEntity, no en entidades individuales.

### Axioma A2: Flujo Unidireccional
```
Entidad → Decoradores → Metadatos → BaseEntity → Application → UI
∀ dato: dirección(dato) = unidireccional ∧ ¬∃ bypass(Capa_n)
```

**Regla:** Los componentes UI NUNCA acceden directamente a entidades. TODO pasa por Application.

### Axioma A3: Generación desde Metadatos
```
∀ UI_Component: lógica_renderizado(UI_Component) = f(Metadatos)
```

**Regla:** La UI se genera AUTOMÁTICAMENTE desde decoradores. PROHIBIDO hardcodear formularios o tablas.

### Axioma A4: Inmutabilidad Estructural
```
TypeScript + Decoradores + Vue 3 = Stack Tecnológico Inmutable
BaseEntity.prototype = Almacenamiento Canónico de Metadatos
```

**Regla:** NO se puede cambiar el stack tecnológico ni el sistema de almacenamiento de metadatos.

---

## WORKFLOW OBLIGATORIO: SPEC-FIRST

**ANTES de codificar:**

1. ✅ **Leer documentación relevante** en `/copilot/`
2. ✅ **Verificar que NO viola MI LÓGICA** (Axiomas A1-A4)
3. ✅ **Determinar si requiere autorización** (ver 00-CONTRACT.md § 6.2)
4. ✅ **SI es nueva funcionalidad:** Actualizar archivo `.md` correspondiente PRIMERO
5. ✅ **SI es modificación:** Validar que el spec actual sea correcto o actualizarlo PRIMERO

**DURANTE el desarrollo:**

1. ✅ Seguir patrones establecidos en spec
2. ✅ No duplicar lógica (DRY)
3. ✅ Mantener type safety (TypeScript strict mode)
4. ✅ Respetar naming conventions
5. ✅ Usar hooks cuando corresponda

**DESPUÉS de codificar:**

1. ✅ **Sincronizar documentación:** Verificar que código cumple spec al 100%
2. ✅ **Actualizar índice de carpeta contenedora** (README.md)
3. ✅ **Actualizar referencias cruzadas**
4. ✅ **Probar en contexto completo**
5. ✅ **Ejecutar Autoverificación Obligatoria del Modelo (AOM)**

---

## REGLAS OBLIGATORIAS CRÍTICAS

### Decoradores
- ✅ Define símbolo único: `export const MI_KEY = Symbol('mi_decorador');`
- ✅ Almacena en `target.constructor.prototype[MI_KEY]`
- ✅ Crea función accesora en BaseEntity
- ✅ Documenta en `/copilot/layers/01-decorators/mi-decorador.md` (11 secciones)
- ✅ Actualiza `/copilot/layers/01-decorators/README.md`

### Entidades
- ✅ Heredan de BaseEntity
- ✅ Si son persistentes: `@Persistent()`, `@ApiEndpoint()`, `@PrimaryProperty()`, `@DefaultProperty()`
- ✅ Todas las propiedades visibles: `@PropertyName('Nombre', Type)`, `@PropertyIndex(N)`
- ✅ NO contienen lógica CRUD (va en BaseEntity)

### UI/CSS
- ✅ **PROHIBIDO valores hardcodeados repetidos**
- ✅ Colores: usar `var(--nombre-token)` definido en `/src/css/constants.css`
- ✅ Z-index: usar `var(--z-nivel)` (nunca valores numéricos)
- ✅ Espaciados: usar `var(--spacing-*)` o `var(--padding-*)`
- ✅ Box-sizing universal: `* { box-sizing: border-box; }` (inmutable)
- ✅ Componentes Vue: usar `<style scoped>` preferentemente

### Code Styling
- ✅ Indentación: **4 espacios** (NUNCA tabs)
- ✅ Comillas: simples `'` por defecto
- ✅ Strings con variables: **template literals** \`${var}\` (NUNCA concatenación `+`)
- ✅ Semicolons: obligatorios
- ✅ Tipado: explícito, **PROHIBIDO `any`** (excepciones documentadas en EXCEPCIONES.md)
- ✅ JSDoc: obligatorio en clases, interfaces, funciones públicas
- ✅ Imports ordenados: Vue → Externos → @/ → Relativos
- ✅ Regions en clases: `// #region PROPERTIES`, `// #region METHODS`, `// #region OVERRIDES`

### Documentación
- ✅ **11 secciones obligatorias** para archivos técnicos:
  1. Propósito
  2. Alcance
  3. Definiciones Clave
  4. Descripción Técnica
  5. Flujo de Funcionamiento
  6. Reglas Obligatorias
  7. Prohibiciones
  8. Dependencias
  9. Relaciones
  10. Notas de Implementación
  11. Referencias Cruzadas

- ✅ **PROHIBIDO README.md en `/src/`** (solo en `/copilot/`)
- ✅ Actualizar índices de carpetas contenedoras
- ✅ Código sin documentación = código inválido

---

## PROHIBICIONES ABSOLUTAS

❌ Modificar sistema de decoradores sin autorización  
❌ Cambiar jerarquía de BaseEntity  
❌ Alterar patrón Singleton de Application  
❌ Modificar sistema de eventos (eventBus)  
❌ Cambiar almacenamiento de metadatos  
❌ Acceso directo de UI a entidades (bypass de Application)  
❌ Hardcodear valores CSS repetidos  
❌ Usar `any` en TypeScript sin justificación documentada  
❌ Concatenar strings con `+` (usar template literals)  
❌ Crear README.md o INDEX.md dentro de `/src/`  
❌ Omitir documentación de cambios  

---

## AUTOVERIFICACIÓN OBLIGATORIA DEL MODELO (AOM)

**ANTES de presentar tu respuesta, DEBES ejecutar este checklist:**

### ✅ Verificación de MI LÓGICA

- [ ] **A1 - Arquitectura de Capas:** ¿Respeta las 5 capas? ¿Hereda de BaseEntity?
- [ ] **A2 - Flujo Unidireccional:** ¿Mantiene flujo unidireccional? ¿No hay bypass?
- [ ] **A3 - Generación desde Metadatos:** ¿UI se genera desde metadatos?
- [ ] **A4 - Inmutabilidad Estructural:** ¿Preserva stack TypeScript+Decoradores+Vue3?

### ✅ Verificación de Código

- [ ] Tipado explícito sin `any`
- [ ] Template literals para strings con variables
- [ ] Indentación 4 espacios
- [ ] JSDoc en elementos públicos
- [ ] Imports ordenados correctamente
- [ ] Regions en clases

### ✅ Verificación de UI/CSS

- [ ] Sin valores hardcodeados repetidos
- [ ] Tokens CSS usados correctamente
- [ ] Sin z-index numéricos
- [ ] `<style scoped>` en componentes

### ✅ Verificación de Documentación

- [ ] Archivo .md actualizado (si aplica)
- [ ] Índice de carpeta actualizado
- [ ] Referencias cruzadas válidas
- [ ] 11 secciones completas (para docs técnicos)

---

## DECLARACIÓN DE CUMPLIMIENTO CONTRACTUAL

**Al finalizar tu respuesta, incluye obligatoriamente:**

### Cumplimiento de MI LÓGICA
- ✅ **Axioma A1:** [Cómo cumples]
- ✅ **Axioma A2:** [Cómo cumples]
- ✅ **Axioma A3:** [Cómo cumples]
- ✅ **Axioma A4:** [Cómo cumples]

### Cumplimiento de Contratos
- ✅ **04-UI-DESIGN-SYSTEM-CONTRACT:** [Cómo cumples o "No aplica"]
- ✅ **06-CODE-STYLING-STANDARDS:** [Cómo cumples]

### Documentación Sincronizada
- ✅ **Archivos .md actualizados:** [Lista o "No aplica"]
- ✅ **Índices actualizados:** [Lista o "No aplica"]

### Excepciones Solicitadas
- [ ] **Ninguna** (recomendado)
- [ ] **Requiero excepción:** [Justificación técnica completa según 05-ENFORCEMENT § 6.6]

---

## ESTRUCTURA DEL PROYECTO

```
/
├── copilot/                    ← Documentación (SPEC-FIRST)
│   ├── 00-CONTRACT.md         ← Contrato principal
│   ├── 01-FRAMEWORK-OVERVIEW.md
│   ├── 02-FLOW-ARCHITECTURE.md
│   ├── 03-QUICK-START.md
│   ├── 04-UI-DESIGN-SYSTEM-CONTRACT.md
│   ├── 05-ENFORCEMENT-TECHNICAL-CONTRACT.md
│   ├── 06-CODE-STYLING-STANDARDS.md
│   ├── EXCEPCIONES.md
│   ├── BREAKING-CHANGES.md
│   ├── layers/
│   │   ├── 01-decorators/     ← Docs de decoradores
│   │   ├── 02-base-entity/    ← Docs de BaseEntity
│   │   ├── 03-application/    ← Docs de Application
│   │   ├── 04-components/     ← Docs de componentes
│   │   ├── 05-advanced/       ← Funcionalidades avanzadas
│   │   └── 06-composables/    ← Composables
│   ├── tutorials/
│   └── examples/
│
├── src/                        ← Código fuente (NO readme aquí)
│   ├── entities/              ← Clases que heredan BaseEntity
│   │   ├── base_entity.ts    ← Motor CRUD
│   │   └── product.ts
│   ├── decorations/           ← Sistema de decoradores (32+)
│   ├── models/
│   │   └── application.ts    ← Singleton orquestador
│   ├── components/            ← Componentes Vue generados
│   │   ├── Form/
│   │   ├── Buttons/
│   │   ├── Modal/
│   │   └── Informative/
│   ├── css/
│   │   ├── constants.css     ← Tokens de diseño (única fuente)
│   │   ├── main.css          ← Estilos base
│   │   ├── form.css
│   │   └── table.css
│   ├── views/
│   ├── router/
│   └── main.ts               ← Entry point
│
└── tsconfig.json              ← Strict mode habilitado
```

---

## EJEMPLOS DE USO

### Ejemplo 1: Crear nuevo decorador

**Tu solicitud:**
```
Necesito crear un decorador @MaxLength que limite la longitud de strings.
```

**El agente responderá:**
1. Creará `/src/decorations/max_length_decorator.ts` con símbolo, interfaz, función
2. Agregará función accesora en BaseEntity
3. Creará `/copilot/layers/01-decorators/max-length-decorator.md` (11 secciones)
4. Actualizará `/copilot/layers/01-decorators/README.md`
5. Incluirá Declaración de Cumplimiento Contractual

### Ejemplo 2: Modificar componente UI

**Tu solicitud:**
```
El botón de guardado debe cambiar de color a verde cuando esté habilitado.
```

**El agente responderará:**
1. Verificará tokens de color en `/src/css/constants.css`
2. Usará `var(--btn-success)` (existente) o creará token nuevo
3. Modificará componente con `<style scoped>`
4. NO hardcodeará `background-color: #00ff00`
5. Incluirá Declaración de Cumplimiento de 04-UI-DESIGN-SYSTEM-CONTRACT

### Ejemplo 3: Nueva entidad

**Tu solicitud:**
```
Crear entidad Customer con nombre, email, teléfono.
```

**El agente responderá:**
1. Creará `/src/entities/customer.ts` heredando de BaseEntity
2. Agregará decoradores obligatorios: @ModuleName, @ApiEndpoint, @Persistent, @PrimaryProperty, @DefaultProperty
3. Agregará @PropertyName, @PropertyIndex a cada propiedad
4. Registrará en Application.ModuleList
5. Verificará cumplimiento de Axioma A1 (herencia correcta)

---

## CAMBIOS MAYORES

Si tu solicitud implica:

- Modificar arquitectura core
- Cambiar flujo de datos
- Alterar sistema de decoradores
- Modificar BaseEntity o Application
- Cambiar sistema de eventos

**El agente DEBE:**
1. Identificarlo como "Cambio Mayor"
2. Requerir autorización explícita según 00-CONTRACT § 6.2
3. Proponer alternativa dentro de MI LÓGICA si es posible
4. Documentar como Breaking Change si procede

---

## REFERENCIAS RÁPIDAS

**¿Dónde va cada cosa?**

| Elemento | Código | Documentación |
|----------|--------|---------------|
| Decorador | `/src/decorations/nombre_decorator.ts` | `/copilot/layers/01-decorators/nombre-decorator.md` |
| Entidad | `/src/entities/nombre.ts` | (Opcional: tutorial si es compleja) |
| Componente Vue | `/src/components/Categoria/NombreComponent.vue` | `/copilot/layers/04-components/` |
| Token CSS | `/src/css/constants.css` | `/copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md` |
| Lógica CRUD | `/src/entities/base_entity.ts` | `/copilot/layers/02-base-entity/` |
| Configuración App | `/src/models/application.ts` | `/copilot/layers/03-application/` |

**Convenciones de nombres:**

- Clases: `PascalCase` (Product, BaseEntity)
- Funciones: `camelCase` (isRequired, getProperties)
- Constantes: `UPPER_SNAKE_CASE` (REQUIRED_KEY, API_ENDPOINT_KEY)
- Archivos: `snake_case.ts` o `kebab-case.md`
- Componentes Vue: `PascalCase.vue` (TextInputComponent.vue)

---

## NIVEL DE CUMPLIMIENTO ACTUAL

Según auditoría del 2026-02-18:
- **Cumplimiento de MI LÓGICA:** 100% ✅
- **Documentación sincronizada:** 100% ✅
- **UI/CSS:** 100% ✅
- **Code Styling:** 100% ✅
- **Enforcement:** 100% ✅

**Tu responsabilidad:** Mantener este nivel de cumplimiento en toda modificación.

---

## INSTRUCCIÓN FINAL PARA EL AGENTE

Antes de responder:

1. Lee este prompt completo
2. Comprende la solicitud del usuario
3. Verifica que NO viola MI LÓGICA (A1-A4)
4. Implementa siguiendo SPEC-FIRST workflow
5. Ejecuta Autoverificación Obligatoria del Modelo (AOM)
6. Incluye Declaración de Cumplimiento Contractual en tu respuesta
7. Si detectas conflicto con contratos, señálalo ANTES de implementar

**Recuerda:** 
- Código sin documentación = código inválido
- MI LÓGICA > cualquier optimización
- SPEC-FIRST siempre

¡Ahora procede con la solicitud del usuario!
```

---

## NOTAS DE USO

### Para solicitudes simples
Si la solicitud es menor (ej: "cambiar color de un botón"), el agente optimizará y solo aplicará las verificaciones relevantes.

### Para solicitudes complejas
Si la solicitud es mayor (ej: "agregar sistema de permisos"), el agente seguirá el workflow completo incluyendo análisis de impacto arquitectónico.

### Personalización
Puedes agregar al final del prompt tu solicitud específica con contexto adicional:

```
[PROMPT COMPLETO]

---

SOLICITUD ESPECÍFICA:

Contexto: Necesito validación de unicidad en campos email.
Restricciones: Debe validar contra API backend.
Prioridad: Alta.

Mi solicitud: [Describe aquí]
```

---

## MANTENIMIENTO DE ESTE PROMPT

**Fecha de última actualización:** 18 de Febrero, 2026  
**Versión:** 1.0.0  
**Próxima revisión:** Cuando se actualice algún contrato principal (00-06)

Si los contratos cambian, actualiza este prompt en las secciones correspondientes.

---

## APÉNDICE: VERSIÓN COMPACTA (COPIAR Y PEGAR RÁPIDO)

Para solicitudes sencillas, usa esta versión reducida:

```markdown
# CONTEXTO: Framework SaaS Vue

Framework meta-programático con decoradores TypeScript + Vue 3.

## AXIOMAS INMUTABLES (MI LÓGICA)
- **A1:** 5 capas (Entidad→Decorador→BaseEntity→Application→UI)
- **A2:** Flujo unidireccional (UI NO accede directo a entidades)
- **A3:** UI generada desde metadatos (NO hardcode)
- **A4:** Stack inmutable (TS+Decoradores+Vue3)

## REGLAS CRÍTICAS
✅ Entidades heredan BaseEntity
✅ Decoradores: símbolo + prototype + función accesora + doc (11 secciones)
✅ CSS: tokens en constants.css, NO hardcode, z-index con var(--z-*)
✅ Code: 4 espacios, template literals, NO any, JSDoc, imports ordenados
✅ Docs: actualizar .md + índices SIEMPRE

❌ README en /src/
❌ Concatenación con +
❌ Valores CSS hardcodeados
❌ Bypass de Application
❌ Modificar BaseEntity sin autorización

## WORKFLOW
1. Leer docs en /copilot/
2. Verificar NO viola axiomas
3. SPEC-FIRST: actualizar .md antes de codificar
4. Implementar
5. Autoverificar + declarar cumplimiento

**Contratos:** /copilot/00-CONTRACT.md a 06-CODE-STYLING-STANDARDS.md
**Cumplimiento actual:** 100% (auditoría 2026-02-18)

---

MI SOLICITUD:
