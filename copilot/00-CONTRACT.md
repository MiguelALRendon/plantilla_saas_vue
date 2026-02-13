# CONTRATO DE DESARROLLO - Framework SaaS Vue

**Versión:** 2.2.0  
**Fecha de Creación:** 10 de Febrero, 2026  
**Última Actualización:** 13 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE

## 1. Propósito

Establecer principios contractuales vinculantes que regulen el desarrollo, modificación, extensión y documentación del Framework SaaS Vue, garantizando la preservación de su arquitectura fundamental y la coherencia de su implementación.

## 2. Alcance

Este contrato aplica a:
- Toda modificación del código fuente del framework
- Toda extensión de funcionalidad
- Toda documentación técnica asociada
- Toda interacción con el sistema por agentes humanos o artificiales
- Todo proceso de reestructuración documental

## 3. Definiciones Clave

**MI LÓGICA (AXIOMA TÉCNICO INMUTABLE):** Sistema arquitectónico fundamental del framework cuya preservación tiene prioridad absoluta sobre cualquier otra consideración técnica, normativa o práctica.

Declaración Axiomática:

```
AXIOMA A1 [Arquitectura de Capas]:
  ∀ componente ∈ Sistema → componente ∈ {Capa1, Capa2, Capa3, Capa4, Capa5}
  Donde:
    Capa1 = Entidades (Definición)
    Capa2 = Decoradores (Metadatos)
    Capa3 = BaseEntity (Lógica CRUD)
    Capa4 = Application (Orquestador)
    Capa5 = UI Components (Generados)

AXIOMA A2 [Flujo Unidireccional]:
  Entidad → Decoradores → Metadatos → BaseEntity → Application → UI
  ∀ dato: dirección(dato) = unidireccional ∧ ¬∃ bypass(Capa_n)

AXIOMA A3 [Generación desde Metadatos]:
  ∀ UI_Component: lógica_renderizado(UI_Component) = f(Metadatos)
  Donde f(Metadatos) es función pura determinista

AXIOMA A4 [Inmutabilidad Estructural]:
  TypeScript + Decoradores + Vue 3 = Stack Tecnológico Inmutable
  BaseEntity.prototype = Almacenamiento Canónico de Metadatos
```

Criterios de Violación (Cualquiera de estos constituye violación de MI LÓGICA):

| Acción | Viola Axioma | Permitida |
|--------|--------------|-----------||
| Agregar Capa 2.5 entre Decoradores y BaseEntity | A1 | NO |
| UI accede directamente a Entidad sin Application | A2 | NO |
| Componente UI con lógica no derivada de metadatos | A3 | NO |
| Reemplazar decoradores por JSON config | A4 | NO |
| Hacer flujo bidireccional UI → BaseEntity | A2 | NO |
| Cambiar Vue 3 por React | A4 | NO |
| Mover metadatos de prototype a Map externo | A4 | NO |

Supremacía Jerárquica:

```
MI LÓGICA (Axiomas A1-A4)
    ├──> Invalida: Cualquier cláusula contractual contradictoria
    ├──> Invalida: Cualquier optimización que viole axiomas
    ├──> Invalida: Cualquier mejora propuesta que altere estructura
    └──> Prevalece: Sobre conveniencia, performance, modernización
```

Procedimiento de Validación contra MI LÓGICA:

```
PARA TODO cambio propuesto:
  1. Verificar(A1) → ¿Respeta 5 capas? [SÍ/NO]
  2. Verificar(A2) → ¿Mantiene flujo unidireccional? [SÍ/NO]
  3. Verificar(A3) → ¿UI sigue siendo generada desde metadatos? [SÍ/NO]
  4. Verificar(A4) → ¿Preserva stack tecnológico? [SÍ/NO]
  
  SI alguna verificación = NO → RECHAZAR cambio
  SI todas verificaciones = SÍ → Evaluar según Sección 6.2
```

**Cambio Mayor:** Cualquier modificación que altere arquitectura core, flujo de datos, generación de UI, sistema de estado o persistencia.

**Cambio Menor:** Extensión que no modifica componentes existentes: decoradores adicionales, componentes personalizados, entidades nuevas, estilos, utilidades.

**Documentación Sincronizada:** Estado en el que código y documentación reflejan exactamente la misma realidad técnica.

**Índice de Carpeta:** Archivo README.md o INDEX.md ubicado en carpetas contenedoras que lista y describe todos los elementos técnicos de esa carpeta, mantiene referencias actualizadas y facilita navegación documental.

## 4. Descripción Técnica

### 4.1 Naturaleza del Framework

Framework Meta-Programático de Generación Automática de Interfaces CRUD construido sobre Vue 3 + TypeScript.

Principio operativo: Los metadatos definen comportamiento. La UI no se programa manualmente, se declara mediante decoradores.

### 4.2 Arquitectura en Capas

```
┌─────────────────────────────────────────┐
│  CAPA 5: UI Components (Generados)     │  ← Vista
├─────────────────────────────────────────┤
│  CAPA 4: Application (Singleton)       │  ← Controlador
├─────────────────────────────────────────┤
│  CAPA 3: BaseEntity (Lógica CRUD)      │  ← Modelo + Lógica
├─────────────────────────────────────────┤
│  CAPA 2: Decoradores (Metadatos)       │  ← Configuración
├─────────────────────────────────────────┤
│  CAPA 1: Entidades (Definición)        │  ← Declaración
└─────────────────────────────────────────┘
```

### 4.3 Garantías del Sistema

El framework garantiza:
- Type Safety completo mediante TypeScript
- Reactividad nativa vía Vue 3 Composition API
- Consistencia de UI generada desde metadatos
- Extensibilidad controlada sin degradación arquitectónica
- Persistencia sincronizada con backend
- Validación multi-nivel: required, sincrónica, asincrónica

### 4.4 Límites del Sistema

El framework NO es:
- Un ORM completo (solo cliente)
- Un reemplazo de backend
- Una solución para lógica de negocio compleja en frontend
- Un sistema de autenticación

## 5. Flujo de Funcionamiento

Flujo principal de operación:

1. **Definición:** Desarrollador crea entidad con decoradores
2. **Registro:** Entidad se agrega a Application.ModuleList
3. **Inicialización:** Router y Application se sincronizan
4. **Navegación:** Usuario selecciona módulo en sidebar
5. **Generación:** Sistema lee metadatos y genera UI
6. **Interacción:** Usuario interactúa con formularios generados
7. **Validación:** Sistema valida según decoradores
8. **Persistencia:** BaseEntity maneja CRUD con API
9. **Actualización:** UI reactiva refleja cambios

## 6. Reglas Obligatorias

### 6.1 Prioridad Absoluta de MI LÓGICA

```
MI LÓGICA > Cualquier otra consideración
```

MI LÓGICA debe respetarse en todo momento. No puede ser reinterpretada, simplificada ni optimizada sin autorización explícita.

### 6.2 Autorización para Cambios Mayores

Cambios mayores REQUIEREN AUTORIZACIÓN EXPLÍCITA antes de implementación.

Proceso de solicitud obligatorio:
1. Documentar en detalle el cambio propuesto
2. Explicar necesidad demostrable
3. Demostrar ausencia de alternativa dentro de MI LÓGICA
4. Especificar impacto en sistema existente
5. Esperar aprobación explícita

### 6.3 Documentación Mandatoria

Cualquier modificación al código DEBE ir acompañada de documentación actualizada. SIN EXCEPCIONES.

Tipos de documentación requerida:

**Cambios a funcionalidad existente:**
- Actualizar archivo MD correspondiente
- Mantener ejemplos actualizados
- Actualizar referencias cruzadas

**Nueva funcionalidad:**
- Crear archivo MD en carpeta apropiada
- Seguir estructura establecida
- Agregar referencias cruzadas
- Actualizar índice principal

**Nuevos decoradores:**
- Crear archivo en layers/01-decorators/
- Documentar símbolo de metadatos
- Documentar función accesora en BaseEntity
- Agregar ejemplo de uso
- Especificar referencias

**Cambios de arquitectura:**
- Actualizar 01-FRAMEWORK-OVERVIEW.md
- Actualizar 02-FLOW-ARCHITECTURE.md
- Documentar migración si aplica

**Mantenimiento de índices:**
- Actualizar README.md o INDEX.md de la carpeta contenedora
- Agregar entrada para nuevo elemento creado
- Mantener orden consistente (alfabético o por categoría)
- Incluir descripción breve del elemento
- Verificar integridad de referencias

### 6.4 Índices de Carpetas Contenedoras

#### 6.4.1 Propósito de los Índices

Cada carpeta contenedora de elementos técnicos (decoradores, componentes, entidades, enums, etc.) DEBE mantener un archivo de índice que liste todos sus elementos.

Propósito:
- Facilitar descubrimiento de elementos disponibles
- Mantener catálogo actualizado de funcionalidades
- Proporcionar punto de entrada para navegación documental
- Validar completitud de cobertura documental

#### 6.4.2 Ubicación Obligatoria

Índices DEBEN existir en:
- `/copilot/layers/01-decorators/README.md` o `INDEX.md`
- `/copilot/layers/02-base-entity/README.md` o `INDEX.md`
- `/copilot/layers/03-application/README.md` o `INDEX.md`
- `/copilot/layers/04-components/README.md` o `INDEX.md`
- `/copilot/layers/05-advanced/README.md` o `INDEX.md`
- `/copilot/layers/06-composables/README.md` o `INDEX.md`
- `/copilot/tutorials/README.md` o `INDEX.md`
- `/copilot/examples/README.md` o `INDEX.md`
- `/src/entities/README.md` o `INDEX.md` (opcional pero recomendado)
- `/src/decorations/README.md` o `INDEX.md` (opcional pero recomendado)
- `/src/components/Form/README.md` o `INDEX.md` (opcional pero recomendado)

#### 6.4.3 Contenido Obligatorio del Índice

Cada índice DEBE contener:

1. **Título descriptivo** de la carpeta
2. **Descripción breve** del propósito de los elementos contenidos
3. **Lista completa** de elementos con:
   - Nombre del elemento
   - Enlace al archivo (código o documentación)
   - Descripción breve de una línea
   - Estado (si aplica: estable, experimental, deprecated)
4. **Organización consistente** (alfabética, por categoría o por propósito)
5. **Fecha de última actualización**

#### 6.4.4 Formato Sugerido

```markdown
# [Nombre de la Carpeta]

## Propósito
Breve descripción de qué contiene esta carpeta.

## Elementos

### [Categoría si aplica]

- **[ElementoNombre]** ([enlace](./archivo.md)) - Descripción breve de una línea.
- **[OtroElemento]** ([enlace](./otro.md)) - Descripción breve.

## Última Actualización
[Fecha]
```

#### 6.4.5 Momento de Actualización

Los índices DEBEN actualizarse:
- Al crear nuevo elemento en la carpeta
- Al eliminar elemento existente
- Al renombrar elemento
- Al cambiar propósito significativo de elemento
- Durante procesos de reestructuración documental

#### 6.4.6 Verificación de Integridad

Antes de considerar completada cualquier modificación:
1. Verificar que todos los archivos en carpeta estén listados en índice
2. Verificar que todos los enlaces en índice sean válidos
3. Confirmar que descripciones sean actuales y precisas
4. Validar orden consistente de listado

### 6.5 Estructura Documental Obligatoria

Cada archivo MD de documentación técnica debe contener:

```
# Título

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
```

### 6.5 Sincronización Código-Documentación

```
Código sin documentación = Código no válido
Documentación sin actualizar = Documentación inválida
```

### 6.6 Workflow de Desarrollo

**Antes de codificar:**
1. Leer documentación relevante
2. Verificar existencia de funcionalidad similar
3. Determinar si requiere autorización
4. Planificar documentación necesaria

**Durante el desarrollo:**
1. Seguir patrones establecidos
2. No duplicar lógica (DRY)
3. Mantener type safety
4. Respetar convenciones de nombres
5. Usar hooks cuando corresponda

**Después de codificar:**
1. Actualizar/crear documentación
2. Actualizar índice de carpeta contenedora
3. Actualizar referencias cruzadas
4. Probar en contexto completo
5. Verificar no ruptura de funcionalidad existente
6. Validar integridad de índices afectados

### 6.7 RÉGIMEN DE REESTRUCTURACIÓN DOCUMENTAL PARA CONSUMO POR IA

#### 6.7.1 Naturaleza de la Reestructuración

Toda reestructuración documental debe ser EXCLUSIVAMENTE estructural y semántica.

Prohibiciones absolutas durante reestructuración:
- Alterar arquitectura descrita
- Reinterpretar reglas establecidas
- Modificar MI LÓGICA
- Introducir decisiones técnicas nuevas
- Suavizar prohibiciones existentes
- Cambiar significado de cláusulas contractuales

#### 6.7.2 Principio de Inmutabilidad Arquitectónica

Se declaran EXPLÍCITAMENTE INMUTABLES:
- Arquitectura: Entidad → Decoradores → Metadatos → BaseEntity → Application → UI
- Flujo de datos unidireccional
- Sistema de capas definido
- Principios de MI LÓGICA

Jerarquía normativa OBLIGATORIA:

```
MI LÓGICA
    ↓
Contrato Original
    ↓
Cláusulas de Reestructuración
```

Ninguna cláusula de reestructuración puede invalidar MI LÓGICA ni el contrato original.

#### 6.7.3 Principio Anti-Alucinación

Durante cualquier proceso de reestructuración:

Prohibido:
- Inferir información no escrita explícitamente
- Completar vacíos con suposiciones
- Asumir intención no declarada
- Expandir conceptos más allá de lo documentado
- Agregar ejemplos no existentes
- Interpretar ambigüedad con creatividad

Obligatorio:
- Ante ambigüedad: mejorar redacción preservando significado exacto
- Ante vacío: mantener vacío o señalarlo explícitamente
- Ante contradicción: señalarla sin resolverla

#### 6.7.4 Obligación de Iteración Completa

Toda reestructur acción documental debe procesar el 100% de archivos .md del repositorio.

Prohibido:
- Finalizar con archivos pendientes
- Procesar parcialmente el conjunto documental
- Declarar completitud sin verificación exhaustiva

Obligatorio:
- Procesamiento de todos los archivos .md
- Revisión cruzada global de coherencia terminológica
- Validación de referencias cruzadas entre documentos

#### 6.7.5 Principio de Auto-Aplicación

Las cláusulas de esta subsección (Subsección 6.7) aplican al propio contrato durante su reestructuración.

Estas cláusulas:
- Permanecen vigentes durante toda tarea de reestructuración
- No pueden eliminarse ni suavizarse
- Obligan a releer el contrato completamente tras modificarlo
- Se aplican recursivamente a sí mismas

#### 6.7.6 Eliminación de Ruido Visual

Durante reestructuración documental:

Obligatorio eliminar:
- Emojis decorativos
- Adornos visuales no técnicos
- Lenguaje coloquial
- Metáforas no técnicas
- Expresiones estilísticas innecesarias

Obligatorio preservar:
- Lenguaje técnico preciso
- Terminología establecida
- Ejemplos de código
- Diagramas técnicos
- Referencias estructuradas

#### 6.7.7 Prohibición de Creatividad Técnica

Durante reestructuración documental:

Prohibido:
- Optimizar arquitectura descrita
- Sugerir mejoras técnicas
- Introducir mejores prácticas externas
- Comparar con otros frameworks
- Cuestionar decisiones arquitectónicas
- Proponer alternativas técnicas

Modo obligatorio: Normalizador determinista sin capacidad de innovación técnica.

#### 6.7.8 Cláusula de Verificación Recursiva de Completitud

Cada vez que el sistema considere alcanzado el 100% de procesamiento, DEBE OBLIGATORIAMENTE:

1. Reanalizar listado completo de archivos .md en el repositorio
2. Verificar uno por uno que todos fueron modificados
3. Confirmar que todos cumplen estructura obligatoria de 11 secciones (excepto índices)
4. Validar coherencia terminológica global
5. Validar integridad de referencias cruzadas
6. Verificar actualización de índices de carpetas contenedoras
7. Confirmar que índices listan todos los elementos de sus carpetas

Si se detecta UN SOLO archivo no adaptado:
- La tarea se considera INCOMPLETA
- Debe reiniciarse la verificación
- Debe procesarse el archivo omitido

Esta verificación debe repetirse hasta que:
- La afirmación "100% procesado" sea objetivamente verdadera
- No exista ningún archivo .md sin procesar
- Todas las referencias cruzadas sean válidas

Prohibido: Declarar finalización basándose en estimación o cálculo aproximado.

#### 6.7.9 Preservación de Validez Contractual

Las cláusulas de reestructuración NO invalidan ningún artículo previo de este contrato.

En caso de conflicto interpretativo:
1. MI LÓGICA tiene prioridad absoluta
2. Artículos 1-7 tienen prioridad sobre Artículo 6.7
3. Artículo 6.7 regula CÓMO documentar, no QUÉ documentar

#### 6.7.10 Principio de Proporcionalidad y Prohibición de Reescritura Total Innecesaria

Durante cualquier proceso de reestructuración documental, las modificaciones deben ser estrictamente proporcionales al objetivo estructural definido.

Prohibido:
- Reemplazar completamente un archivo cuando la adaptación pueda realizarse mediante transformación estructural incremental.
- Reescribir contenido íntegro por razones de eficiencia.
- Sustituir redacción válida que ya cumple con MI LÓGICA y el contrato.
- Introducir variaciones estilísticas innecesarias.

Obligatorio:
- Preservar el contenido original siempre que no contradiga la estructura obligatoria.
- Aplicar cambios mínimos necesarios para cumplir el formato unificado.
- Mantener redacción original cuando sea técnicamente válida y coherente.

La reestructuración no constituye autorización para recreación del contenido.

#### 6.7.11 Separación Obligatoria entre Detección y Corrección

Durante procesos de auditoría, verificación o análisis documental:

Prohibido:
- Corregir inconsistencias en el mismo paso en que se detectan.
- Modificar archivos sin registro previo de la inconsistencia.
- Ejecutar cambios correctivos sin validación explícita cuando el proceso esté bajo supervisión humana.

Obligatorio:
- Registrar toda inconsistencia detectada en un archivo persistente de control antes de realizar cualquier modificación.
- Describir objetivamente la inconsistencia.
- Especificar cláusula contractual afectada, si aplica.
- Esperar autorización explícita para proceder con la corrección cuando el flujo de trabajo lo requiera.

La detección y la corrección constituyen fases distintas y no intercambiables del proceso documental.

#### 6.7.12 Cláusula de Formato - Estructura Documental Obligatoria

Todo archivo de documentación técnica del framework DEBE cumplir obligatoriamente con la siguiente estructura de 11 secciones:

```markdown
# TÍTULO

## 1. Propósito
## 2. Alcance
## 3. Definiciones Clave
## 4. Descripción Técnica
## 5. Flujo de Funcionamiento
## 6. Reglas Obligatorias
## 7. Prohibiciones
## 8. Dependencias
## 9. Relaciones
## 10. Notas de Implementación
## 11. Referencias Cruzadas
```

**Obligaciones de formato:**

1. **Orden inmutable:** Las 11 secciones deben aparecer exactamente en el orden establecido, sin omisiones ni reordenamientos.

2. **Presencia obligatoria:** Ninguna sección puede omitirse. Si una sección no aplica al contenido específico, debe incluirse igualmente con una nota explicativa breve (ejemplo: "No aplica" o "Sin dependencias externas").

3. **Numeración exacta:** Las secciones deben numerarse del 1 al 11 sin excepción.

4. **Título H2:** Cada sección debe usar formato de encabezado nivel 2 (`## N. Nombre`).

5. **Contenido proporcional:** Cada sección debe contener información sustantiva relacionada con su propósito. Prohibido usar secciones vacías o con contenido genérico no específico al documento.

**Alcance de aplicación:**

- Archivos en `/copilot/layers/`
- Documentos de arquitectura (`01-FRAMEWORK-OVERVIEW.md`, `02-FLOW-ARCHITECTURE.md`)
- Documentación de tutoriales en `/copilot/tutorials/`
- Ejemplos en `/copilot/examples/`
- Este contrato (`00-CONTRACT.md`)

**Excepciones:**

- README.md o INDEX.md de carpetas contenedoras (naturaleza específica de índice documental)
- Archivos de estado temporal (ESTADO-*.md)
- Archivos de auditoría (AUDITORIA-*.md)
- Archivos de índices estructurales (INDICE-*.md)

**Validación:**

Durante cualquier proceso de reestructuración, auditoría o creación de documentación, el cumplimiento de este formato debe verificarse ANTES de considerar el archivo como completo.

### 6.8 Sistema UI/CSS

El sistema de interfaz de usuario y hojas de estilo CSS del framework se rige obligatoriamente por el contrato [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md).

Toda modificación, extensión o creación de estilos visuales debe cumplir las reglas establecidas en dicho contrato subordinado.

El contrato UI/CSS es subordinado a MI LÓGICA y al presente contrato, pero vinculante en materia de diseño visual, tokens de diseño, sistema de layout, responsividad y optimización CSS.

### 6.8.1 Especificacion de cambios

Todo cambio realizado sobre un componente que contenga estilos debera ser sometido a la evaluacion de las reglas contractuales del contrato [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md) y en la respuesta final de la realizacion de latarea se tiene que abordar un apartado dedicado al estado de la UI, con sugerencias de cambios basados en los requerimientos contractuales o en su respectivo caso, simplemente mencionar que el componente cumple con todas las reglas.

### 6.9 Enforcement Técnico

El enforcement técnico del framework se rige obligatoriamente por el contrato [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md).

Todo código generado por agentes de IA, toda modificación propuesta y toda integración al repositorio debe cumplir los mecanismos de verificación establecidos en dicho contrato subordinado.

El contrato de enforcement es subordinado a MI LÓGICA y al presente contrato, pero vinculante en materia de autoverificación obligatoria del modelo, validación cruzada entre capas, gestión de breaking changes, responsabilidad del arquitecto, registro de excepciones y pre-commit verification.

Las obligaciones principales del enforcement técnico incluyen:

**Autoverificación Obligatoria del Modelo (AOM):**
- Todo agente de IA DEBERÁ ejecutar proceso de autoverificación antes de presentar código
- Verificación de cumplimiento de MI LÓGICA (Axiomas A1-A4)
- Generación de Declaración de Cumplimiento Contractual estructurada
- Identificación proactiva de conflictos y excepciones

**Validación Cruzada entre Capas (VCC):**
- Coherencia Entidad ↔ Decoradores
- Coherencia Decoradores ↔ Metadatos
- Coherencia Metadatos ↔ UI
- Coherencia API ↔ Backend

**Política de Breaking Changes:**
- Todo breaking change DEBERÁ seguir proceso obligatorio
- Documentación en `/copilot/BREAKING-CHANGES.md`
- Aprobación explícita del arquitecto
- Versionamiento MAJOR obligatorio

**Registro de Excepciones:**
- Toda excepción DEBERÁ registrarse en `/copilot/EXCEPCIONES.md`
- Aprobación explícita del arquitecto
- Marcado en código con comentario `// EXC-XXX`

**Responsabilidad del Arquitecto:**
- El arquitecto es la autoridad técnica final
- Solo el arquitecto puede modificar contratos base
- Solo el arquitecto puede autorizar excepciones y breaking changes
- La IA no puede modificar contratos salvo instrucción explícita

### 6.10 – Cláusula de Indexación Estructural Profunda

### 6.10.1 Naturaleza Obligatoria

Todo documento del Spec Kit debe ser completamente indexable a nivel estructural interno.

La indexación no se limita al archivo como unidad, sino que debe incluir cada nivel jerárquico declarado explícitamente en su estructura.

---

### 6.10.2 Alcance de la Indexación

La indexación estructural profunda incluye obligatoriamente:

1. Secciones numeradas principales (ej. 1, 2, 3…).
2. Subcláusulas jerárquicas (ej. 6.7, 6.7.2, 6.7.2.a).
3. Encabezados secundarios no numerados.
4. Firmas de funciones documentadas.
5. Interfaces y tipos declarados.
6. Propiedades documentadas.
7. Símbolos exportados.
8. Métodos públicos relevantes.
9. Reglas obligatorias y prohibiciones.
10. Dependencias explícitas.
11. Relaciones jerárquicas.
12. Referencias cruzadas declaradas.

Queda prohibido indexar únicamente el documento raíz omitiendo su estructura interna.

---

### 6.10.3 Profundidad Jerárquica

Cuando un documento posea estructura numerada jerárquica, el índice deberá reflejarla íntegramente sin simplificación.

Ejemplo válido:

- 6  
- 6.7  
- 6.7.2  
- 6.7.2.a  

Cada nivel constituye una unidad indexable independiente.

No se permite agrupar niveles en forma resumida.

---

### 6.10.4 Indexación de Elementos Técnicos

Cuando un documento contenga:

- Código fuente
- Firmas de funciones
- Interfaces
- Tipos
- Enumeraciones
- Métodos públicos
- Constantes exportadas

Cada elemento técnicamente declarable debe poder recibir una referencia estructural dentro del sistema de índices.

No se permite indexar únicamente la sección contenedora ignorando los elementos definidos en ella.

---

### 6.10.5 Identificador Subestructural

Cada elemento interno deberá poder ser referenciado mediante un identificador derivado del ID del documento.

Formato obligatorio:

ID-DOC::SECCION  
ID-DOC::6.8.2  
ID-DOC::fn:isRequired  
ID-DOC::prop:REQUIRED_KEY  
ID-DOC::type:RequiredMetadata  

La notación debe ser determinista y reproducible.

---

### 6.10.6 Separación del Formato de Índices

Los documentos cuyo propósito sea exclusivamente indexación estructural:

- No están obligados a cumplir la plantilla estándar de 11 secciones.
- Deben cumplir la presente cláusula.
- Deben mantener coherencia con la numeración real del documento origen.
- No pueden modificar, reinterpretar ni renombrar secciones.

---

### 6.10.7 Prohibiciones

Está estrictamente prohibido:

1. Simplificar jerarquías numeradas.
2. Reescribir encabezados para normalizarlos.
3. Fusionar subcláusulas.
4. Omitir funciones documentadas.
5. Omitir propiedades relevantes.
6. Inventar estructura inexistente.
7. Reordenar numeración original.
8. Interpretar semánticamente lo que no esté explícito.

---

### 6.10.8 Verificación de Completitud

El sistema de índices deberá garantizar:

- Correspondencia 1:1 entre estructura real y estructura indexada.
- Cobertura total de niveles jerárquicos.
- Trazabilidad entre documento e índice.
- Declaración explícita de completitud verificable.

## 7. Prohibiciones

### 7.1 Prohibiciones Arquitectónicas

Prohibido sin autorización explícita:
- Modificar sistema de decoradores
- Cambiar jerarquía de BaseEntity
- Alterar patrón Singleton de Application
- Modificar sistema de eventos (eventBus)
- Cambiar almacenamiento de metadatos
- Modificar flujo de validación
- Alterar ciclo de vida CRUD
- Cambiar sistema de persistencia
- Modificar generación de componentes
- Cambiar lógica de selección de inputs
- Alterar sistema de agrupación (ViewGroup)
- Modificar binding de datos
- Cambiar detección de cambios (getDirtyState)
- Modificar sistema de originalState
- Alterar lógica de resetChanges
- Modificar interceptores de Axios
- Cambiar sistema de mapeo de claves
- Alterar validaciones de persistencia

### 7.2 Prohibiciones Documentales

Prohibido absolutamente:
- Código sin documentación sincronizada
- Documentación sin actualizar tras cambios
- Referencias cruzadas rotas o inexistentes
- Omisión de estructura documental obligatoria
- Índices de carpetas desactualizados u omitidos
- Crear/eliminar elementos sin actualizar índice de carpeta contenedora
- Enlaces rotos en índices

## 8. Dependencias

Este contrato depende de:
- Existencia de documentación en formato Markdown
- Estructura de carpetas establecida en /copilot
- Código fuente del framework en /src
- Versionamiento semántico

## 9. Relaciones

Este contrato regula:
- Documentos técnicos en /copilot
- Código fuente en /src
- Arquitectura del framework

Este contrato es regulado por:
- MI LÓGICA (autoridad suprema)
- Principios de versionamiento semántico

## 10. Notas de Implementación

### 10.1 Versionamiento del Contrato

Este contrato sigue versionamiento semántico:
- **Major:** Cambios fundamentales en principios
- **Minor:** Aclaraciones o nuevas reglas
- **Patch:** Correcciones tipográficas

Versión actual: **2.2.0**

Cambios en versión 2.2.0 (13 de Febrero, 2026):
- Adición de Cláusula 6.4: Índices de Carpetas Contenedoras
- Establecimiento de obligación de mantener archivos README.md o INDEX.md en carpetas contenedoras
- Definición de estructura, contenido y momento de actualización de índices
- Integración de mantenimiento de índices en workflow de desarrollo (sección 6.6)
- Adición de verificación de índices en cláusula de completitud (6.7.8)
- Actualización de prohibiciones documentales (7.2) para incluir índices
- Adición de "Índice de Carpeta" en Definiciones Clave (sección 3)

Cambios en versión 2.1.0 (12 de Febrero, 2026):
- Adición de Cláusula 6.7.12: Formato Documental Obligatorio de 11 Secciones
- Establecimiento de estructura normalizada para toda documentación técnica
- Definición de excepciones al formato (READMEs, archivos de estado/auditoría)

Cambios en versión 2.0.0:
- Reestructuración bajo formato unificado de 11 secciones
- Adición de Subsección 6.7: Régimen de Reestructuración Documental
- Eliminación de elementos decorativos no técnicos
- Normalización de lenguaje técnico

### 10.2 Modificaciones al Contrato

Modificar este contrato requiere:
1. Justificación documentada
2. Revisión de impacto
3. Actualización de todos los documentos afectados
4. Comunicación explícita del cambio
5. Incremento de versión según versionamiento semántico

### 10.3 Aplicabilidad

Al trabajar con este framework, se acepta contractualmente:
- Respetar MI LÓGICA como principio fundamental
- Solicitar permiso para cambios mayores
- Documentar TODO cambio realizado
- Mantener sincronía código-documentación
- Seguir los patrones establecidos
- Priorizar consistencia arquitectónica
- Aplicar las cláusulas de reestructuración documental cuando corresponda

### 10.4 Interpretación

En caso de conflicto interpretativo entre secciones:
1. MI LÓGICA tiene autoridad suprema
2. Propósito y Alcance definen contexto
3. Definiciones Clave establecen terminología vinculante
4. Reglas Obligatorias prevalecen sobre interpretaciones
5. Prohibiciones son absolutas salvo autorización

## 11. Referencias Cruzadas

Documentos vinculados contractualmente:
- [01-FRAMEWORK-OVERVIEW.md](01-FRAMEWORK-OVERVIEW.md) - Visión general del framework
- [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) - Arquitectura y flujos del sistema
- [03-QUICK-START.md](03-QUICK-START.md) - Guía de inicio rápido
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md) - Contrato de sistema de diseño UI/CSS
- [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) - Contrato de enforcement técnico
- [README.md](README.md) - Índice principal de documentación
- layers/01-decorators/ - Especificaciones de decoradores
- layers/02-base-entity/ - Especificación de BaseEntity
- layers/03-application/ - Especificación de Application
- layers/04-components/ - Especificación de componentes
- layers/05-advanced/ - Funcionalidades avanzadas
- layers/06-composables/ - Composables del sistema

---

**VALIDEZ CONTRACTUAL**

Este contrato mantiene integridad, consistencia y mantenibilidad del framework. Constituye protección de arquitectura deliberada.

**Versión:** 2.2.0  
**Fecha de Vigencia:** Desde el 10 de Febrero, 2026  
**Última Actualización:** 13 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE
