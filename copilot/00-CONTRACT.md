# CONTRATO DE DESARROLLO - Framework SaaS Vue

**Versión:** 2.1.0  
**Fecha de Creación:** 10 de Febrero, 2026  
**Última Actualización:** 12 de Febrero, 2026  
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

**MI LÓGICA:** Arquitectura fundamental del framework definida como:
- Arquitectura basada en decoradores TypeScript
- Sistema de metadatos almacenado en prototipos
- Generación automática de interfaces desde entidades
- Patrón Singleton para Application
- Sistema de eventos mediante mitt
- Hooks de ciclo de vida en BaseEntity
- Componentes reactivos generados dinámicamente
- Flujo unidireccional: Entidad → Decoradores → Metadatos → BaseEntity → Application → UI

**Cambio Mayor:** Cualquier modificación que altere arquitectura core, flujo de datos, generación de UI, sistema de estado o persistencia.

**Cambio Menor:** Extensión que no modifica componentes existentes: decoradores adicionales, componentes personalizados, entidades nuevas, estilos, utilidades.

**Documentación Sincronizada:** Estado en el que código y documentación reflejan exactamente la misma realidad técnica.

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

### 6.4 Estructura Documental Obligatoria

Cada archivo MD debe contener:

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
2. Actualizar referencias cruzadas
3. Probar en contexto completo
4. Verificar no ruptura de funcionalidad existente

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

## 8. RÉGIMEN DE REESTRUCTURACIÓN DOCUMENTAL PARA CONSUMO POR IA

### 8.1 Naturaleza de la Reestructuración

Toda reestructuración documental debe ser EXCLUSIVAMENTE estructural y semántica.

Prohibiciones absolutas durante reestructuración:
- Alterar arquitectura descrita
- Reinterpretar reglas establecidas
- Modificar MI LÓGICA
- Introducir decisiones técnicas nuevas
- Suavizar prohibiciones existentes
- Cambiar significado de cláusulas contractuales

### 8.2 Principio de Inmutabilidad Arquitectónica

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

### 8.3 Principio Anti-Alucinación

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

### 8.4 Obligación de Iteración Completa

Toda reestructur acción documental debe procesar el 100% de archivos .md del repositorio.

Prohibido:
- Finalizar con archivos pendientes
- Procesar parcialmente el conjunto documental
- Declarar completitud sin verificación exhaustiva

Obligatorio:
- Procesamiento de todos los archivos .md
- Revisión cruzada global de coherencia terminológica
- Validación de referencias cruzadas entre documentos

### 8.5 Principio de Auto-Aplicación

Las cláusulas de esta sección (Sección 8) aplican al propio contrato durante su reestructuración.

Estas cláusulas:
- Permanecen vigentes durante toda tarea de reestructuración
- No pueden eliminarse ni suavizarse
- Obligan a releer el contrato completamente tras modificarlo
- Se aplican recursivamente a sí mismas

### 8.6 Eliminación de Ruido Visual

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

### 8.7 Prohibición de Creatividad Técnica

Durante reestructuración documental:

Prohibido:
- Optimizar arquitectura descrita
- Sugerir mejoras técnicas
- Introducir mejores prácticas externas
- Comparar con otros frameworks
- Cuestionar decisiones arquitectónicas
- Proponer alternativas técnicas

Modo obligatorio: Normalizador determinista sin capacidad de innovación técnica.

### 8.8 Cláusula de Verificación Recursiva de Completitud

Cada vez que el sistema considere alcanzado el 100% de procesamiento, DEBE OBLIGATORIAMENTE:

1. Reanalizar listado completo de archivos .md en el repositorio
2. Verificar uno por uno que todos fueron modificados
3. Confirmar que todos cumplen estructura obligatoria de 11 secciones
4. Validar coherencia terminológica global
5. Validar integridad de referencias cruzadas

Si se detecta UN SOLO archivo no adaptado:
- La tarea se considera INCOMPLETA
- Debe reiniciarse la verificación
- Debe procesarse el archivo omitido

Esta verificación debe repetirse hasta que:
- La afirmación "100% procesado" sea objetivamente verdadera
- No exista ningún archivo .md sin procesar
- Todas las referencias cruzadas sean válidas

Prohibido: Declarar finalización basándose en estimación o cálculo aproximado.

### 8.9 Preservación de Validez Contractual

Las cláusulas de reestructuración NO invalidan ningún artículo previo de este contrato.

En caso de conflicto interpretativo:
1. MI LÓGICA tiene prioridad absoluta
2. Artículos 1-7 tienen prioridad sobre Artículo 8
3. Artículo 8 regula CÓMO documentar, no QUÉ documentar

### 8.10 Principio de Proporcionalidad y Prohibición de Reescritura Total Innecesaria

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

### 8.11 Separación Obligatoria entre Detección y Corrección

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

### 8.12 Cláusula de Formato - Estructura Documental Obligatoria

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

- README.md de índices (naturaleza específica de índice documental)
- Archivos de estado temporal (ESTADO-*.md)
- Archivos de auditoría (AUDITORIA-*.md)

**Validación:**

Durante cualquier proceso de reestructuración, auditoría o creación de documentación, el cumplimiento de este formato debe verificarse ANTES de considerar el archivo como completo.

## 9. Dependencias

Este contrato depende de:
- Existencia de documentación en formato Markdown
- Estructura de carpetas establecida en /copilot
- Código fuente del framework en /src
- Versionamiento semántico

## 10. Relaciones

Este contrato regula:
- Documentos técnicos en /copilot
- Código fuente en /src
- Arquitectura del framework

Este contrato es regulado por:
- MI LÓGICA (autoridad suprema)
- Principios de versionamiento semántico

## 11. Notas de Implementación

### 11.1 Versionamiento del Contrato

Este contrato sigue versionamiento semántico:
- **Major:** Cambios fundamentales en principios
- **Minor:** Aclaraciones o nuevas reglas
- **Patch:** Correcciones tipográficas

Versión actual: **2.1.0**

Cambios en versión 2.1.0 (12 de Febrero, 2026):
- Adición de Cláusula 8.12: Formato Documental Obligatorio de 11 Secciones
- Establecimiento de estructura normalizada para toda documentación técnica
- Definición de excepciones al formato (READMEs, archivos de estado/auditoría)

Cambios en versión 2.0.0:
- Reestructuración bajo formato unificado de 11 secciones
- Adición de Sección 8: Régimen de Reestructuración Documental
- Eliminación de elementos decorativos no técnicos
- Normalización de lenguaje técnico

### 11.2 Modificaciones al Contrato

Modificar este contrato requiere:
1. Justificación documentada
2. Revisión de impacto
3. Actualización de todos los documentos afectados
4. Comunicación explícita del cambio
5. Incremento de versión según versionamiento semántico

### 11.3 Aplicabilidad

Al trabajar con este framework, se acepta contractualmente:
- Respetar MI LÓGICA como principio fundamental
- Solicitar permiso para cambios mayores
- Documentar TODO cambio realizado
- Mantener sincronía código-documentación
- Seguir los patrones establecidos
- Priorizar consistencia arquitectónica
- Aplicar las cláusulas de reestructuración documental cuando corresponda

### 11.4 Interpretación

En caso de conflicto interpretativo entre secciones:
1. MI LÓGICA tiene autoridad suprema
2. Propósito y Alcance definen contexto
3. Definiciones Clave establecen terminología vinculante
4. Reglas Obligatorias prevalecen sobre interpretaciones
5. Prohibiciones son absolutas salvo autorización

## 12. Referencias Cruzadas

Documentos vinculados contractualmente:
- [01-FRAMEWORK-OVERVIEW.md](01-FRAMEWORK-OVERVIEW.md) - Visión general del framework
- [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) - Arquitectura y flujos del sistema
- [03-QUICK-START.md](03-QUICK-START.md) - Guía de inicio rápido
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

**Versión:** 2.1.0  
**Fecha de Vigencia:** Desde el 10 de Febrero, 2026  
**Última Actualización:** 12 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE
