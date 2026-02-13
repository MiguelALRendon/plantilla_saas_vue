# CONTRATO DE ENFORCEMENT TÉCNICO - Framework SaaS Vue

**Versión:** 1.1.0  
**Fecha de Creación:** 13 de Febrero, 2026  
**Última Actualización:** 13 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE

## 1. Propósito

Establecer principios contractuales vinculantes que regulen el enforcement técnico del Framework SaaS Vue en un entorno de desarrollo asistido por IA con revisión manual del arquitecto, garantizando que todo código generado, propuesto o modificado cumpla las reglas establecidas en el ecosistema contractual del framework antes de su integración al repositorio.

Este contrato define los mecanismos obligatorios de autoverificación, validación cruzada, gestión de breaking changes, responsabilidades del arquitecto, registro de excepciones y prohibiciones específicas que aseguran la integridad arquitectónica del framework en ausencia de infraestructura CI/CD corporativa compleja.

## 2. Alcance

Este contrato aplica a:
- Todo código generado por agentes de IA (GitHub Copilot, asistentes conversacionales, generadores automáticos)
- Toda propuesta de modificación presentada para revisión
- Toda extensión de funcionalidad sugerida o implementada
- Todo proceso de revisión manual ejecutado por el arquitecto
- Toda integración de código al repositorio mediante git
- Todo breaking change propuesto o detectado
- Toda excepción a las reglas contractuales
- Toda validación cruzada entre capas del framework

Este contrato NO aplica a:
- Infraestructura CI/CD externa o DevOps corporativo (fuera de alcance del proyecto)
- Validaciones automáticas en tiempo real durante escritura de código (opcional)
- Procesos de deployment o staging (fuera del alcance contractual)
- Testing automatizado (recomendado pero no obligatorio contractualmente)

## 3. Definiciones Clave

**Enforcement Técnico:** Conjunto de mecanismos obligatorios de verificación, validación y auditoría que garantizan el cumplimiento de los contratos del framework antes de la integración de código al repositorio.

**Autoverificación Obligatoria del Modelo (AOM):** Proceso contractualmente exigible mediante el cual un agente de IA debe declarar explícitamente qué cláusulas contractuales cumple su código generado, identificar conflictos potenciales y justificar excepciones antes de presentar su propuesta al arquitecto.

**Validación Cruzada entre Capas (VCC):** Verificación sistemática de coherencia arquitectónica entre las 5 capas del framework: Entidades → Decoradores → BaseEntity → Application → UI.

**Breaking Change:** Cualquier modificación que altere contratos públicos establecidos, comportamientos documentados o arquitectura core del framework, requiriendo actualización de código consumidor existente o documentación contractual.

**Arquitecto:** Autoridad técnica final del proyecto con poder exclusivo de aprobar modificaciones contractuales, resolver conflictos interpretativos, autorizar breaking changes y validar excepciones.

**Excepción Contractual:** Desviación justificada y documentada de una regla establecida en los contratos del framework, sujeta a aprobación explícita del arquitecto y registro formal.

**Conflicto Contractual:** Contradicción detectada entre cláusulas de distintos contratos, requisitos técnicos incompatibles o ambigüedad interpretativa que requiere escalamiento al arquitecto.

**Pre-Commit Verification:** Conjunto de verificaciones obligatorias que deben ejecutarse antes de realizar commit de código al repositorio.

**Coherencia UI ↔ API:** Sincronización entre estructura de datos de interfaz de usuario y contratos de API backend, garantizando que decoradores, metadatos y componentes generados sean consistentes con endpoints REST.

**Coherencia Decoradores ↔ Metadatos:** Consistencia entre decoradores aplicados a entidades y metadatos almacenados en prototipos de clase, asegurando que toda metadata declarada sea accesible.

**Consistencia Naming ↔ Contratos:** Alineación entre convenciones de nombres utilizadas en código y reglas definidas en contratos, incluyendo tanto el formato (camelCase, PascalCase, etc.) como la descriptibilidad total y auto-explicativa, prohibiendo introducción de naming conventions no autorizadas y nombres ambiguos o repetitivos.

**Política de Breaking Changes:** Conjunto normativo de reglas que define qué constituye un breaking change, cómo debe documentarse, proponerse, justificarse y aprobarse.

**Registro de Excepciones:** Documento formal persistente que cataloga todas las excepciones autorizadas a las reglas contractuales, incluyendo justificación, fecha, alcance y responsable.

## 4. Descripción Técnica

### 4.1 Naturaleza del Enforcement en el Framework

El enforcement técnico del Framework SaaS Vue opera en un modelo de **tres fases secuenciales**:

```
┌──────────────────────────────────────────────────────────┐
│ FASE 1: GENERACIÓN POR IA                               │
│ - Agente IA genera código                               │
│ - Agente ejecuta Autoverificación Obligatoria (AOM)     │
│ - Agente declara cumplimiento contractual               │
│ - Agente identifica conflictos potenciales              │
│ - Agente lista excepciones justificadas                 │
└─────────────────────┬────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────┐
│ FASE 2: REVISIÓN MANUAL                                 │
│ - Arquitecto revisa código generado                     │
│ - Arquitecto valida declaración de cumplimiento         │
│ - Arquitecto verifica coherencia con contratos          │
│ - Arquitecto aprueba o rechaza propuesta                │
│ - Arquitecto autoriza excepciones si justificadas       │
└─────────────────────┬────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────┐
│ FASE 3: INTEGRACIÓN AL REPOSITORIO                      │
│ - Código aprobado se integra mediante git commit        │
│ - Pre-Commit Verification se ejecuta                    │
│ - Documentación sincronizada se actualiza               │
│ - Índices de carpetas se actualizan                     │
│ - Referencias cruzadas se validan                       │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Arquitectura del Sistema de Enforcement

El sistema de enforcement opera en capas de verificación progresiva:

**Capa 1 - Enforcement Declarativo:**
- Autoverificación obligatoria del modelo IA antes de entrega
- Declaración explícita de cumplimiento contractual
- Identificación proactiva de conflictos y excepciones

**Capa 2 - Enforcement Manual:**
- Revisión técnica del arquitecto
- Validación de coherencia arquitectónica
- Autorización de excepciones justificadas
- Resolución de conflictos contractuales

**Capa 3 - Enforcement Documental:**
- Sincronización código-documentación
- Actualización de índices de carpetas
- Validación de referencias cruzadas
- Verificación de completitud documental

### 4.3 Contexto de Operación

El framework opera en un entorno caracterizado por:

**Presencia de:**
- Arquitecto humano con autoridad técnica final
- Asistentes de IA generadores de código
- Repositorio Git local/remoto
- Revisión manual de cambios
- Documentación contractual vinculante

**Ausencia de:**
- Infraestructura CI/CD corporativa compleja
- Pipeline automatizado de deployment
- Equipo DevOps externo
- Testing automatizado obligatorio (opcional pero recomendado)
- Validadores sintácticos en tiempo real (opcional)

**Modelo de trabajo:**
- IA genera código bajo supervisión contractual
- Arquitecto revisa y aprueba cambios
- Integración manual mediante git
- Documentación sincronizada manualmente

### 4.4 Jerarquía Normativa de Contratos

```
MI LÓGICA (Axiomas A1-A4 - Autoridad Suprema)
    ↓
00-CONTRACT.md (Contrato Principal)
    ↓
05-ENFORCEMENT-TECHNICAL-CONTRACT.md (Este Contrato)
    ↓
04-UI-DESIGN-SYSTEM-CONTRACT.md (Contrato UI/CSS)
    ↓
01-FRAMEWORK-OVERVIEW.md (Descriptivo)
    ↓
02-FLOW-ARCHITECTURE.md (Descriptivo)
    ↓
03-QUICK-START.md (Guía)
```

En caso de conflicto interpretativo, prevalece la jerarquía superior.

### 4.5 Integración con Contratos Existentes

Este contrato **complementa** sin duplicar:

**00-CONTRACT.md:** Define qué es MI LÓGICA y reglas obligatorias. Este contrato define **cómo** verificar cumplimiento.

**04-UI-DESIGN-SYSTEM-CONTRACT.md:** Define sistema de tokens y reglas CSS. Este contrato define **cómo** validar coherencia UI/CSS con contratos.

**01-FRAMEWORK-OVERVIEW.md y 02-FLOW-ARCHITECTURE.md:** Describen arquitectura. Este contrato define **cómo** validar coherencia del código con arquitectura descrita.

**03-QUICK-START.md:** Guía de uso. Este contrato define **cómo** asegurar que las extensiones no rompan Quick Start.

## 5. Flujo de Funcionamiento

### 5.1 Flujo Completo de Enforcement

```
┌────────────────────────────────────────────────────────┐
│ INICIO: Usuario solicita código a IA                  │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│ IA genera código cumpliendo arquitectura              │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│ IA ejecuta Autoverificación Obligatoria (AOM):        │
│ 1. Verifica coherencia con MI LÓGICA (A1-A4)          │
│ 2. Verifica cumplimiento 00-CONTRACT.md               │
│ 3. Verifica cumplimiento contratos específicos        │
│ 4. Identifica conflictos potenciales                  │
│ 5. Detecta posibles excepciones                       │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│ IA genera Declaración de Cumplimiento Contractual:    │
│ - Lista cláusulas cumplidas                           │
│ - Declara excepciones justificadas                    │
│ - Señala conflictos detectados                        │
│ - Propone resolución si aplica                        │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│ IA presenta código + Declaración al arquitecto        │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│ ARQUITECTO revisa:                                     │
│ - Valida código contra contratos                      │
│ - Revisa Declaración de Cumplimiento                  │
│ - Verifica justificaciones de excepciones             │
│ - Evalúa resolución de conflictos propuesta           │
└───────────────────┬────────────────────────────────────┘
                    │
            ┌───────┴───────┐
            │               │
      ¿APROBADO?     ¿RECHAZADO?
            │               │
            │               └──> RECHAZAR: IA corrige y reinicia
            │
┌───────────▼────────────────────────────────────────────┐
│ ARQUITECTO autoriza integración                        │
│ - Aprueba excepciones si justificadas                 │
│ - Registra excepciones en documento formal            │
│ - Resuelve conflictos normativos                      │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│ PRE-COMMIT VERIFICATION:                               │
│ 1. Verificar ausencia de valores hardcoded (CSS)      │
│ 2. Verificar sincronización documentación             │
│ 3. Verificar actualización de índices                 │
│ 4. Verificar referencias cruzadas válidas             │
│ 5. Verificar naming conventions                       │
└───────────────────┬────────────────────────────────────┘
                    │
            ¿PASA VERIFICACIÓN?
                    │
                   SÍ
                    │
┌───────────────────▼────────────────────────────────────┐
│ git commit -m "mensaje descriptivo"                   │
│ - Código integrado al repositorio                     │
│ - Documentación sincronizada                          │
│ - Excepciones registradas formalmente                 │
└────────────────────────────────────────────────────────┘
```

### 5.2 Flujo de Autoverificación Obligatoria del Modelo (AOM)

**Antes de presentar código al arquitecto, la IA DEBE ejecutar:**

```
PASO 1: VERIFICACIÓN AXIOMÁTICA
  ├─> ¿Respeta Capa 1-5 (A1)? [SÍ/NO]
  ├─> ¿Mantiene flujo unidireccional (A2)? [SÍ/NO]
  ├─> ¿UI generada desde metadatos (A3)? [SÍ/NO]
  └─> ¿Preserva stack tecnológico (A4)? [SÍ/NO]
  
  SI alguna = NO → RECHAZAR código y rediseñar

PASO 2: VERIFICACIÓN CONTRACTUAL
  ├─> ¿Requiere autorización explícita (00-CONTRACT 6.2)? [SÍ/NO]
  ├─> ¿Documentación sincronizada (00-CONTRACT 6.3)? [SÍ/NO]
  ├─> ¿Índices actualizados (00-CONTRACT 6.4)? [SÍ/NO]
  ├─> ¿Formato documental cumplido (00-CONTRACT 6.7.12)? [SÍ/NO]
  ├─> ¿Tokens UI/CSS respetados (04-UI-CONTRACT 6.3-6.4)? [SÍ/NO]
  ├─> ¿Naming conventions cumplidas (formato 6.8.1)? [SÍ/NO]
  └─> ¿Nombres con descriptibilidad total sin ambigüedad (6.8.1)? [SÍ/NO]

PASO 3: VALIDACIÓN CRUZADA ENTRE CAPAS
  ├─> ¿Decoradores → Metadatos coherente? [SÍ/NO]
  ├─> ¿Entidad → API coherente? [SÍ/NO]
  ├─> ¿Metadatos → UI coherente? [SÍ/NO]
  └─> ¿BaseEntity → Application coherente? [SÍ/NO]

PASO 4: DETECCIÓN DE BREAKING CHANGES
  ├─> ¿Modifica contratos públicos? [SÍ/NO]
  ├─> ¿Altera comportamiento documentado? [SÍ/NO]
  ├─> ¿Cambia arquitectura core? [SÍ/NO]
  └─> ¿Requiere actualización de código consumidor? [SÍ/NO]
  
  SI alguna = SÍ → Declarar como BREAKING CHANGE

PASO 5: IDENTIFICACIÓN DE EXCEPCIONES
  ├─> ¿Existe desviación de regla contractual? [SÍ/NO]
  ├─> ¿Existe justificación técnica válida? [SÍ/NO]
  └─> ¿Existe alternativa conforme? [SÍ/NO]
  
  SI desviación SIN alternativa → Declarar EXCEPCIÓN con justificación

PASO 6: GENERACIÓN DE DECLARACIÓN DE CUMPLIMIENTO
  └─> Producir documento estructurado con resultados de PASO 1-5
```

### 5.3 Flujo de Validación Cruzada entre Capas (VCC)

**Validación de Coherencia Entidad ↔ Decoradores:**

```
PARA CADA entidad modificada/creada:
  1. Verificar que todo decorador aplicado tenga símbolo definido
  2. Verificar que toda propiedad decorada tenga @PropertyName
  3. Verificar que entidad persistente tenga @ApiEndpoint
  4. Verificar que @PrimaryProperty exista si @Persistent
  5. Verificar que @DefaultProperty exista si @Persistent
```

**Validación de Coherencia Decoradores ↔ Metadatos:**

```
PARA CADA propiedad decorada:
  1. Verificar que metadata sea accesible vía BaseEntity.getProperties()
  2. Verificar que símbolo decorador exista en prototype
  3. Verificar que metadata almacenada coincida con decorador aplicado
  4. Verificar que tipo declarado coincida con PropertyType
```

**Validación de Coherencia Metadatos ↔ UI:**

```
PARA CADA componente generado de formulario:
  1. Verificar que tipo de input corresponda con PropertyType
  2. Verificar que validaciones UI correspondan con decoradores
  3. Verificar que @ViewGroup se refleje en agrupación visual
  4. Verificar que @HideInDetailView se respete
  5. Verificar que @Required genere validación visual
  6. Verificar que @CssColumnClass esté definida en constants.css o sea válida
```

**Validación de Coherencia API ↔ Backend:**

```
PARA CADA entidad persistente:
  1. Verificar que @ApiEndpoint defina URL válida
  2. Verificar que @ApiMethods liste métodos HTTP permitidos
  3. Verificar que @PersistentKey mapee correctamente claves API
  4. Verificar que estructura de datos sea serializable
  5. Verificar que BaseEntity.save() use endpoint correcto
```

### 5.4 Flujo de Gestión de Breaking Changes

**Cuando se detecta un Breaking Change:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. DETECCIÓN: IA o Arquitecto detecta breaking change  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ 2. CLASIFICACIÓN:                                       │
│    - Breaking de Arquitectura Core                      │
│    - Breaking de Contrato Público                       │
│    - Breaking de Comportamiento Documentado             │
│    - Breaking de API/Metadatos                          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ 3. DOCUMENTACIÓN OBLIGATORIA:                          │
│    - Descripción técnica detallada del cambio           │
│    - Justificación de necesidad demostrable             │
│    - Análisis de impacto en código existente            │
│    - Lista de archivos/módulos afectados                │
│    - Estrategia de migración propuesta                  │
│    - Alternativas evaluadas y descartadas               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ 4. REVISIÓN DEL ARQUITECTO:                            │
│    - Evalúa justificación técnica                       │
│    - Valida ausencia de alternativa conforme            │
│    - Revisa impacto en MI LÓGICA                        │
│    - Analiza viabilidad de migración                    │
└──────────────────────┬──────────────────────────────────┘
                       │
               ┌───────┴───────┐
               │               │
         ¿APROBADO?      ¿RECHAZADO?
               │               │
               │               └──> RECHAZAR: Buscar alternativa conforme
               │
┌──────────────▼──────────────────────────────────────────┐
│ 5. AUTORIZACIÓN FORMAL:                                │
│    - Arquitecto documenta aprobación                    │
│    - Se actualiza versión del framework (MAJOR)         │
│    - Se registra en CHANGELOG.md                        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ 6. IMPLEMENTACIÓN:                                     │
│    - Código breaking change se integra                  │
│    - Documentación se actualiza                         │
│    - Guía de migración se publica                       │
│    - Contratos se actualizan si aplica                  │
└─────────────────────────────────────────────────────────┘
```

### 5.5 Flujo de Registro de Excepciones

**Cuando se requiere excepción a regla contractual:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. IDENTIFICACIÓN: IA detecta necesidad de excepción   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ 2. JUSTIFICACIÓN:                                      │
│    - Cláusula contractual que se desvía                 │
│    - Razón técnica demostrable                          │
│    - Ausencia de alternativa conforme                   │
│    - Alcance limitado de la excepción                   │
│    - Impacto en arquitectura (si aplica)                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ 3. REVISIÓN DEL ARQUITECTO:                            │
│    - Valida justificación técnica                       │
│    - Verifica ausencia de alternativa                   │
│    - Evalúa impacto en consistencia arquitectónica      │
└──────────────────────┬──────────────────────────────────┘
                       │
               ┌───────┴───────┐
               │               │
         ¿APROBADO?      ¿RECHAZADO?
               │               │
               │               └──> RECHAZAR: Implementar solución conforme
               │
┌──────────────▼──────────────────────────────────────────┐
│ 4. REGISTRO FORMAL EN /copilot/EXCEPCIONES.md:        │
│    - ID único de excepción                              │
│    - Fecha de autorización                              │
│    - Arquitecto responsable                             │
│    - Cláusula contractual afectada                      │
│    - Justificación técnica                              │
│    - Alcance de la excepción                            │
│    - Archivo(s) donde se aplica                         │
│    - Fecha de revisión futura (si aplica)               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ 5. IMPLEMENTACIÓN:                                     │
│    - Código con excepción se integra                    │
│    - Comentario en código referencia ID de excepción    │
│    - Documentación menciona excepción si relevante      │
└─────────────────────────────────────────────────────────┘
```

## 6. Reglas Obligatorias

### 6.1 Subordinación a Jerarquía Contractual

```
MI LÓGICA > 00-CONTRACT.md > Este Contrato
```

Este contrato es subordinado a MI LÓGICA y al contrato principal `00-CONTRACT.md`. En caso de conflicto interpretativo, prevalece la jerarquía establecida en sección 4.4.

Este contrato regula mecanismos de enforcement sin alterar arquitectura core, sistema de decoradores, BaseEntity, Application ni flujo de datos del framework.

### 6.2 Autoverificación Obligatoria del Modelo (AOM)

**REGLA OBLIGATORIA:**

Todo agente de IA que genere, modifique o extienda código del framework DEBERÁ ejecutar el proceso de Autoverificación Obligatoria del Modelo (AOM) definido en sección 5.2 ANTES de presentar su propuesta al arquitecto.

**Obligaciones de la IA:**

1. **DEBERÁ** verificar cumplimiento de los 4 axiomas de MI LÓGICA (A1-A4)
2. **DEBERÁ** verificar cumplimiento de cláusulas obligatorias de contratos aplicables
3. **DEBERÁ** ejecutar Validación Cruzada entre Capas (VCC)
4. **DEBERÁ** detectar si su cambio constituye Breaking Change
5. **DEBERÁ** identificar excepciones contractuales en su código
6. **DEBERÁ** generar Declaración de Cumplimiento Contractual estructurada

**Formato Obligatorio de Declaración de Cumplimiento Contractual:**

```markdown
## DECLARACIÓN DE CUMPLIMIENTO CONTRACTUAL

### Verificación Axiomática (MI LÓGICA)
- [ ] A1 - Arquitectura de Capas: [SÍ/NO/N/A]
- [ ] A2 - Flujo Unidireccional: [SÍ/NO/N/A]
- [ ] A3 - Generación desde Metadatos: [SÍ/NO/N/A]
- [ ] A4 - Inmutabilidad Estructural: [SÍ/NO/N/A]

### Verificación Contractual
- [ ] 00-CONTRACT 6.2 - Autorización para Cambios Mayores: [SÍ/NO/N/A]
- [ ] 00-CONTRACT 6.3 - Documentación Mandatoria: [SÍ/NO/N/A]
- [ ] 00-CONTRACT 6.4 - Índices de Carpetas: [SÍ/NO/N/A]
- [ ] 00-CONTRACT 6.7.12 - Formato Documental: [SÍ/NO/N/A]
- [ ] 04-UI-CONTRACT 6.3 - Sistema de Tokens: [SÍ/NO/N/A]
- [ ] 04-UI-CONTRACT 6.4 - Política Anti-Hardcode: [SÍ/NO/N/A]

### Validación Cruzada entre Capas
- [ ] Coherencia Entidad ↔ Decoradores: [SÍ/NO/N/A]
- [ ] Coherencia Decoradores ↔ Metadatos: [SÍ/NO/N/A]
- [ ] Coherencia Metadatos ↔ UI: [SÍ/NO/N/A]
- [ ] Coherencia API ↔ Backend: [SÍ/NO/N/A]

### Detección de Breaking Changes
- [ ] Modifica contratos públicos: [SÍ/NO]
- [ ] Altera comportamiento documentado: [SÍ/NO]
- [ ] Cambia arquitectura core: [SÍ/NO]
- [ ] Requiere actualización de código consumidor: [SÍ/NO]

**Clasificación:** [BREAKING CHANGE / CAMBIO COMPATIBLE / CAMBIO MENOR]

### Excepciones Identificadas
[Listar excepciones con justificación o escribir "Ninguna"]

- **Excepción 1:** [Descripción]
  - **Cláusula afectada:** [Referencia contractual]
  - **Justificación:** [Razón técnica demostrable]
  - **Alternativa evaluada:** [Por qué no es viable]

### Conflictos Contractuales Detectados
[Listar conflictos detectados o escribir "Ninguno"]

- **Conflicto 1:** [Descripción]
  - **Contratos en conflicto:** [Referencias]
  - **Propuesta de resolución:** [Sugerencia]

### Archivos Modificados/Creados
- [Lista de archivos con ruta completa]

### Documentación Actualizada
- [Lista de archivos de documentación actualizados/creados]
```

**Consecuencias del Incumplimiento:**

Si la IA NO ejecuta AOM o NO genera Declaración de Cumplimiento Contractual, el arquitecto DEBERÁ RECHAZAR la propuesta sin revisión técnica detallada.

### 6.3 Validación Cruzada entre Capas (VCC)

**REGLA OBLIGATORIA:**

Todo código que modifique o cree entidades, decoradores, componentes UI o lógica de BaseEntity/Application DEBERÁ pasar Validación Cruzada entre Capas (VCC) según especificado en sección 5.3.

**Validaciones Obligatorias:**

#### 6.3.1 Coherencia Entidad ↔ Decoradores

**DEBERÁ verificarse:**
- Toda entidad persistente tiene `@Persistent()`, `@ApiEndpoint()`, `@PrimaryProperty()`, `@DefaultProperty()`
- Toda propiedad visible tiene `@PropertyName()`
- Toda propiedad con orden tiene `@PropertyIndex()`
- Todo decorador aplicado tiene símbolo definido en `/src/decorations`
- Ningún decorador está duplicado en una misma propiedad

#### 6.3.2 Coherencia Decoradores ↔ Metadatos

**DEBERÁ verificarse:**
- Metadata es accesible vía `BaseEntity.getProperties()`
- Símbolo decorador existe en `prototype` de clase
- Metadata almacenada coincide con decorador aplicado
- Tipo declarado en `@PropertyName()` coincide con tipo TypeScript
- Función accesora en BaseEntity existe para cada decorador (ej: `isRequired()`, `getPropertyType()`)

#### 6.3.3 Coherencia Metadatos ↔ UI

**DEBERÁ verificarse:**
- Componente generado corresponde a `PropertyType` (Number → NumberInput, String → TextInput, etc.)
- Validaciones UI reflejan decoradores (`@Required` → campo obligatorio visual)
- `@ViewGroup` se refleja en agrupación visual del formulario
- `@HideInDetailView` / `@HideInListView` se respetan en renderizado
- `@CssColumnClass` referencia clase existente en `constants.css` o válida
- `@DisplayFormat` se aplica en renderizado de valor

#### 6.3.4 Coherencia API ↔ Backend

**DEBERÁ verificarse:**
- `@ApiEndpoint()` define URL válida y documentada
- `@ApiMethods()` lista métodos HTTP soportados por backend
- `@PersistentKey()` mapea correctamente claves de respuesta API
- Estructura de datos es serializable a JSON
- `BaseEntity.save()` usa endpoint y método correcto según `isNew()`

**Registro de Validación:**

Resultado de VCC DEBERÁ incluirse en Declaración de Cumplimiento Contractual (sección 6.2).

### 6.4 Política de Breaking Changes

**REGLA OBLIGATORIA:**

Todo Breaking Change DEBERÁ seguir el proceso obligatorio definido en esta sección.

#### 6.4.1 Definición de Breaking Change

Constituye Breaking Change CUALQUIERA de los siguientes:

**Breaking de Arquitectura Core:**
- Modificación de sistema de capas (Entidad → Decoradores → BaseEntity → Application → UI)
- Alteración de flujo unidireccional de datos
- Cambio de modelo de almacenamiento de metadatos
- Modificación de patrón Singleton de Application
- Cambio de sistema de decoradores

**Breaking de Contrato Público:**
- Modificación de firma de método público de BaseEntity
- Eliminación de método público existente
- Cambio de comportamiento de método público documentado
- Modificación de interfaz de Application
- Cambio de signature de decoradores existentes

**Breaking de Comportamiento Documentado:**
- Alteración de flujo CRUD documentado
- Cambio de sistema de validación multi-nivel
- Modificación de sistema de eventos (EventBus)
- Alteración de hooks de ciclo de vida
- Cambio de lógica de dirty state / originalState

**Breaking de API/Metadatos:**
- Cambio de estructura de metadatos almacenados
- Modificación de símbolos de decoradores existentes
- Alteración de función accesora en BaseEntity
- Cambio de sistema de persistencia
- Modificación de interceptores Axios

**NO constituye Breaking Change:**
- Creación de nuevo decorador sin modificar existentes
- Creación de nueva entidad sin modificar BaseEntity
- Adición de método privado o protegido
- Creación de componente personalizado nuevo
- Extensión de funcionalidad sin modificar comportamiento existente
- Adición de token CSS en `constants.css`
- Corrección de bug que restaura comportamiento documentado
- Mejora de performance sin alterar API pública

#### 6.4.2 Procedimiento Obligatorio para Breaking Changes

**PASO 1 - DETECCIÓN:**

Breaking Change DEBERÁ ser detectado en fase AOM por IA o durante revisión por arquitecto.

**PASO 2 - DOCUMENTACIÓN OBLIGATORIA:**

Breaking Change DEBERÁ documentarse en archivo `/copilot/BREAKING-CHANGES.md` (crear si no existe) con siguiente estructura:

```markdown
## [BREAKING-XXX] - Título del Breaking Change

**Fecha:** [Fecha de detección]  
**Versión del Framework:** [Versión actual]  
**Propuesto por:** [IA/Arquitecto]  
**Estado:** [PROPUESTO/APROBADO/RECHAZADO/IMPLEMENTADO]

### Descripción Técnica
[Descripción detallada del cambio propuesto]

### Clasificación
- [ ] Breaking de Arquitectura Core
- [ ] Breaking de Contrato Público
- [ ] Breaking de Comportamiento Documentado
- [ ] Breaking de API/Metadatos

### Justificación
[Necesidad demostrable del cambio]

### Análisis de Impacto
**Archivos Afectados:**
- [Lista de archivos que requieren modificación]

**Módulos Impactados:**
- [Lista de módulos/componentes que dejan de funcionar]

**Código Consumidor:**
- [Estimación de código de usuario afectado]

### Alternativas Evaluadas
1. **Alternativa 1:** [Descripción]
   - **Por qué no es viable:** [Razón]

2. **Alternativa 2:** [Descripción]
   - **Por qué no es viable:** [Razón]

### Estrategia de Migración
[Pasos que debe seguir usuario para migrar código existente]

```typescript
// ANTES
[Código antiguo]

// DESPUÉS
[Código nuevo]
```

### Versionamiento
**Versión actual:** [ej: 1.5.2]  
**Versión después del breaking change:** [ej: 2.0.0]

### Contratos Afectados
- [Lista de contratos que requieren actualización]

### Decisión del Arquitecto
**Fecha de Revisión:** [Fecha]  
**Decisión:** [APROBADO/RECHAZADO]  
**Comentarios:** [Comentarios del arquitecto]
```

**PASO 3 - REVISIÓN DEL ARQUITECTO:**

Arquitecto DEBERÁ revisar documentación del Breaking Change y:
- Validar justificación técnica
- Verificar ausencia de alternativa conforme a contratos
- Evaluar impacto en MI LÓGICA
- Analizar viabilidad de estrategia de migración
- Decidir: APROBAR o RECHAZAR

**PASO 4 - AUTORIZACIÓN FORMAL:**

Si APROBADO:
- Arquitecto documenta aprobación en `/copilot/BREAKING-CHANGES.md`
- Se actualiza estado a APROBADO
- Se incrementa versión MAJOR del framework (X.0.0)
- Se crea entrada en CHANGELOG.md (crear si no existe)

**PASO 5 - IMPLEMENTACIÓN:**

- Código del breaking change se implementa
- Documentación se actualiza en todos los contratos afectados
- Guía de migración se publica en `/copilot/tutorials/`
- Referencias cruzadas se actualizan
- Estado en `/copilot/BREAKING-CHANGES.md` se actualiza a IMPLEMENTADO

#### 6.4.3 Prohibición de Breaking Changes Silenciosos

**PROHIBIDO ABSOLUTAMENTE:**

- Implementar breaking change sin documentación en `/copilot/BREAKING-CHANGES.md`
- Implementar breaking change sin aprobación del arquitecto
- Ocultar breaking change clasificándolo como "mejora"
- Implementar breaking change sin actualizar versionamiento MAJOR
- Breaking change sin estrategia de migración documentada

**Consecuencia:**

Todo breaking change no documentado o no autorizado DEBERÁ ser revertido inmediatamente mediante `git revert` sin excepciones.

### 6.5 Responsabilidad del Arquitecto

**REGLA OBLIGATORIA:**

El arquitecto es la **autoridad técnica final** del framework con poder exclusivo e indelegable para:

#### 6.5.1 Decisiones de Autoridad Exclusiva

**El arquitecto tiene poder EXCLUSIVO para:**

1. **Aprobar o rechazar cambios mayores** según `00-CONTRACT.md` sección 6.2
2. **Autorizar breaking changes** siguiendo proceso de sección 6.4
3. **Resolver conflictos contractuales** cuando exista ambigüedad o contradicción entre cláusulas
4. **Aprobar excepciones contractuales** justificadas técnicamente según sección 6.6
5. **Modificar contratos base** (`00-CONTRACT.md`, `04-UI-DESIGN-SYSTEM-CONTRACT.md`, `05-ENFORCEMENT-TECHNICAL-CONTRACT.md`)
6. **Modificar MI LÓGICA** (solo el arquitecto puede autorizar cambios a Axiomas A1-A4)
7. **Interpretar ambigüedades normativas** en contratos cuando exista duda interpretativa
8. **Revocar excepciones autorizadas** si se detecta degradación arquitectónica
9. **Actualizar política de enforcement** modificando este contrato
10. **Rechazar código de IA** sin necesidad de justificación exhaustiva

#### 6.5.2 Decisiones NO Delegables a IA

**La IA NO PUEDE:**

- Modificar contratos base sin solicitud explícita del arquitecto mientras se trabaje en dichos archivos
- Alterar MI LÓGICA bajo ninguna circunstancia salvo instrucción explícita
- Aprobar sus propias excepciones contractuales
- Resolver conflictos normativos de forma definitiva (solo proponer resolución)
- Modificar breaking changes autorizados sin nueva aprobación
- Revocar excepciones registradas
- Reinterpretar cláusulas contractuales por conveniencia

#### 6.5.3 Obligaciones del Arquitecto

**El arquitecto DEBERÁ:**

1. **Revisar toda Declaración de Cumplimiento Contractual** generada por IA
2. **Validar coherencia arquitectónica** de código propuesto antes de aprobación
3. **Documentar decisiones de aprobación/rechazo** en comentarios de review o archivo de decisiones
4. **Registrar excepciones autorizadas** en `/copilot/EXCEPCIONES.md`
5. **Actualizar contratos** cuando autorice breaking changes que los afecten
6. **Mantener coherencia jerárquica** MI LÓGICA > 00-CONTRACT.md > demás contratos
7. **Revisar periódicamente excepciones** registradas (recomendación: trimestral)
8. **Validar Pre-Commit Verification** antes de git commit (puede delegar ejecución pero no validación)

#### 6.5.4 Facultades de Rechazo

**El arquitecto PUEDE rechazar código propuesto por IA si:**

- Declaración de Cumplimiento Contractual es incompleta o incorrecta
- Código viola MI LÓGICA, aun si IA declara cumplimiento
- Justificación de excepción es insuficiente
- Breaking change no tiene alternativa conforme demostrada
- Documentación no está sincronizada con código
- Índices de carpetas no están actualizados
- Referencias cruzadas están rotas
- Naming conventions no se respetan
- Código introduce deuda técnica innecesaria
- Arquitecto detecta riesgo de degradación arquitectónica

**El arquitecto NO REQUIERE justificar rechazo exhaustivamente.** Pero SI DEBE indicar la razón general del rechazo.

#### 6.5.5 Delegación Limitada

**El arquitecto PUEDE delegar:**

- Ejecución de Pre-Commit Verification (scripts automáticos)
- Validación sintáctica de código (linters)
- Testing automatizado (si existe)
- Revisión de documentación (asistente IA)

**El arquitecto NO PUEDE delegar:**

- Decisión final de aprobación/rechazo de cambios mayores
- Autorización de breaking changes
- Aprobación de excepciones contractuales
- Modificación de contratos base
- Resolución de conflictos normativos

### 6.6 Registro de Excepciones

**REGLA OBLIGATORIA:**

Toda excepción a reglas contractuales DEBERÁ registrarse formalmente en `/copilot/EXCEPCIONES.md` (crear si no existe).

#### 6.6.1 Definición de Excepción Contractual

Constituye Excepción Contractual:

- Desviación justificada de cláusula obligatoria de cualquier contrato
- Uso de valor hardcoded CSS con justificación técnica válida
- Omisión de documentación sincronizada en caso excepcional documentado
- Violación de naming convention con razón demostrable
- Uso de `!important` en CSS con justificación
- Introducción de dependencia externa sin alternativa viable
- Modificación de lógica core con justificación de bug crítico

#### 6.6.2 Procedimiento de Registro

**PASO 1 - IDENTIFICACIÓN:**

IA identifica necesidad de excepción durante AOM o arquitecto durante revisión.

**PASO 2 - JUSTIFICACIÓN:**

Se documenta:
- Cláusula contractual que se desvía (referencia exacta)
- Razón técnica demostrable
- Ausencia de alternativa conforme
- Alcance limitado de la excepción
- Impacto en arquitectura (si aplica)

**PASO 3 - APROBACIÓN DEL ARQUITECTO:**

Arquitecto evalúa y decide: APROBAR o RECHAZAR.

**PASO 4 - REGISTRO FORMAL:**

Si APROBADO, se registra en `/copilot/EXCEPCIONES.md`:

```markdown
## [EXC-XXX] - Título de la Excepción

**Fecha de Autorización:** [Fecha]  
**Arquitecto Responsable:** [Nombre]  
**Estado:** [ACTIVA/REVOCADA]

### Cláusula Afectada
**Contrato:** [Referencia: ej. 04-UI-CONTRACT.md]  
**Sección:** [ej. 6.4.2 - Política Anti-Hardcode]  
**Cláusula:** [Texto literal de la cláusula]

### Descripción de la Excepción
[Descripción técnica de qué regla se está violando y cómo]

### Justificación Técnica
[Razón demostrable de por qué es necesaria la excepción]

### Alternativas Evaluadas
1. **Alternativa 1:** [Descripción]
   - **Por qué no es viable:** [Razón]

### Alcance de la Excepción
**Archivos Afectados:**
- [Lista de archivos donde se aplica la excepción]

**Líneas de Código:**
- [Referencia específica a líneas donde aplica]

### Impacto Arquitectónico
[Análisis de impacto en coherencia del framework]

### Código con Excepción
```typescript
// EXC-XXX: [Razón breve]
[Código que viola regla]
```

### Fecha de Revisión Futura
[Fecha recomendada para revisar si excepción sigue siendo necesaria]

### Decisión del Arquitecto
**Decisión:** APROBADA  
**Comentarios:** [Comentarios adicionales del arquitecto]
```

**PASO 5 - MARCADO EN CÓDIGO:**

En el archivo donde se aplica la excepción, se DEBERÁ incluir comentario:

```typescript
// EXC-XXX: [Razón breve] - Ver /copilot/EXCEPCIONES.md
[Código con excepción]
```

O en CSS:

```css
/* EXC-XXX: [Razón breve] - Ver /copilot/EXCEPCIONES.md */
.unique-component {
    margin-top: 37px; /* Alinea con navbar de tercero */
}
```

#### 6.6.3 Revisión Periódica de Excepciones

**RECOMENDACIÓN (no obligatorio):**

Arquitecto DEBERÍA revisar excepciones registradas periódicamente (sugerencia: trimestral) para:

- Verificar si excepción sigue siendo necesaria
- Evaluar si existe ahora alternativa conforme
- Revocar excepciones obsoletas
- Detectar acumulación de excepciones que indique necesidad de cambio contractual

#### 6.6.4 Revocación de Excepciones

**PROCESO:**

Si arquitecto decide revocar excepción:

1. Actualizar estado en `/copilot/EXCEPCIONES.md` a REVOCADA
2. Documentar razón de revocación
3. Implementar solución conforme a contratos
4. Eliminar comentario `// EXC-XXX` del código
5. Actualizar referencias cruzadas

#### 6.6.5 Prohibición de Excepciones No Registradas

**PROHIBIDO ABSOLUTAMENTE:**

- Aplicar excepción sin registro en `/copilot/EXCEPCIONES.md`
- Aplicar excepción sin aprobación del arquitecto
- Omitir comentario `// EXC-XXX` en código con excepción
- Excepción sin justificación técnica demostrable
- Excepción sin evaluación de alternativas

### 6.7 Pre-Commit Verification

**REGLA OBLIGATORIA:**

Antes de ejecutar `git commit`, DEBERÁ ejecutarse Pre-Commit Verification según checklist de esta sección.

#### 6.7.1 Checklist Obligatoria

**VERIFICACIONES OBLIGATORIAS:**

```markdown
## PRE-COMMIT VERIFICATION CHECKLIST

### Verificación de MI LÓGICA
- [ ] No se modificó arquitectura de 5 capas
- [ ] No se rompió flujo unidireccional de datos
- [ ] UI sigue generándose desde metadatos
- [ ] Stack tecnológico (TypeScript + Decoradores + Vue 3) intacto

### Verificación de Código
- [ ] Sin valores CSS hardcoded no justificados
- [ ] Sin z-index numéricos arbitrarios
- [ ] Naming conventions respetadas (formato + descriptibilidad total según 6.8.1)
- [ ] Nombres auto-explicativos sin ambigüedad
- [ ] Sin duplicación de lógica
- [ ] Type safety preservado
- [ ] Sin errores de compilación TypeScript

### Verificación de Documentación
- [ ] Documentación sincronizada con código modificado
- [ ] Archivos nuevos tienen documentación correspondiente
- [ ] Índices de carpetas actualizados
- [ ] Referencias cruzadas válidas
- [ ] Formato de 11 secciones cumplido (si aplica)

### Verificación de Excepciones
- [ ] Excepciones registradas en /copilot/EXCEPCIONES.md
- [ ] Comentarios EXC-XXX presentes en código con excepciones
- [ ] Justificaciones documentadas

### Verificación de Breaking Changes
- [ ] Breaking changes documentados en /copilot/BREAKING-CHANGES.md
- [ ] Breaking changes aprobados por arquitecto
- [ ] Versionamiento MAJOR actualizado si aplica
- [ ] Guía de migración publicada si aplica

### Verificación de Declaración de Cumplimiento
- [ ] Declaración de Cumplimiento Contractual generada
- [ ] Todas las verificaciones marcadas correctamente
- [ ] Excepciones listadas con justificación
- [ ] Conflictos identificados (si existen)
```

#### 6.7.2 Ejecución de Verificación

**Responsable:** Arquitecto o script automatizado supervisado por arquitecto.

**Momento:** Inmediatamente antes de `git commit`.

**Consecuencia de fallo:** Si alguna verificación falla, commit DEBERÁ rechazarse hasta corrección.

#### 6.7.3 Herramientas de Verificación Automatizada (Opcional)

**Recomendado pero NO obligatorio:**

- Linter CSS que rechace colores hex no tokenizados
- Script que verifique índices actualizados
- Script que detecte referencias cruzadas rotas
- TypeScript compiler en modo strict
- Git pre-commit hook que ejecute checklist

**Nota:** Estas herramientas son auxiliares. Autoridad final es el arquitecto.

### 6.8 Coherencia de Naming Conventions y Descriptibilidad

**REGLA OBLIGATORIA:**

No se PODRÁ introducir naming conventions no autorizadas. Toda convención nueva DEBERÁ documentarse contractualmente.

Todo nombre DEBERÁ cumplir con descriptibilidad total y auto-explicativa según reglas de 6.8.1.

#### 6.8.1 Naming Conventions Autorizadas

**Decoradores:**

- PascalCase con descripción: `@PropertyName`, `@RequiredValidation`, `@ApiEndpoint`
- Símbolos en SCREAMING_SNAKE_CASE: `REQUIRED_KEY`, `PROPERTY_NAME_KEY`

**Entidades:**

- PascalCase singular: `Product`, `Customer`, `Order`
- Archivo en snake_case: `product.ts`, `customer.ts`

**Componentes Vue:**

- PascalCase con sufijo `Component`: `TextInputComponent`, `NumberInputComponent`
- Archivo coincide con clase: `TextInputComponent.vue`

**Composables:**

- camelCase con prefijo `use`: `useInputMetadata`, `useValidation`
- Archivo coincide: `useInputMetadata.ts`

**Constantes:**

- SCREAMING_SNAKE_CASE: `API_BASE_URL`, `DEFAULT_TIMEOUT`
- Archivo en snake_case: `icons.ts`, `constants.ts`

**Métodos/Funciones:**

- camelCase descriptivo: `getPropertyType()`, `validateInputs()`, `isRequired()`

**Variables locales:**

- camelCase: `localValue`, `isDirty`, `originalState`

**Tokens CSS:**

- kebab-case con prefijo de categoría: `--color-primary`, `--spacing-medium`, `--z-modal`

**Archivos MD:**

- UPPERCASE para contratos: `00-CONTRACT.md`, `04-UI-DESIGN-SYSTEM-CONTRACT.md`
- kebab-case para guías: `quick-start.md`, `basic-crud.md`
- UPPERCASE para archivos especiales: `README.md`, `EXCEPCIONES.md`, `BREAKING-CHANGES.md`

---

**NOTA OBLIGATORIA - DESCRIPTIBILIDAD TOTAL:**

**REGLA FUNDAMENTAL:** Todo nombre (variable, método, función, decorador, clase, constante) DEBE ser completamente descriptivo y auto-explicativo, determinando de forma TOTAL su función, propósito o contenido.

**OBLIGATORIO:**

- **Descriptibilidad completa:** El nombre debe explicar POR SÍ SOLO qué hace, qué contiene o qué representa sin necesidad de contexto adicional
- **Sin ambigüedad:** No se PODRÁ usar nombres que puedan interpretarse de múltiples formas o que no sean claros en su propósito
- **Sin repetitividad:** Nombres deben ser únicos y distinguibles de otros existentes en el mismo contexto o módulo
- **Auto-documentación:** El código debe ser entendible leyendo únicamente los nombres, sin depender de comentarios

**EJEMPLOS VÁLIDOS:**

```typescript
// CORRECTO - Descriptibilidad total
calculateTotalPriceWithTax()
getUserAuthenticationToken()
isCustomerEmailVerified
productInventoryQuantity
validateRequiredFieldsBeforeSave()
```

**EJEMPLOS INVÁLIDOS:**

```typescript
// INCORRECTO - Nombres simples/ambiguos
process()              // ¿Procesar qué?
data                   // ¿Qué datos?
check()                // ¿Verificar qué?
temp                   // ¿Temporal de qué?
value                  // ¿Valor de qué?
handler                // ¿Maneja qué?
item                   // ¿Item de qué tipo?
getData()              // ¿Qué datos obtiene?
isValid                // ¿Qué valida?
count                  // ¿Cuenta de qué?
```

**EXCEPCIONES LIMITADAS:**

Variables de ciclo en contexto inmediato donde el propósito es evidente por convención universal:

```typescript
// PERMITIDO - Contexto inmediato evidente
for (let i = 0; i < length; i++) { ... }
array.map((item, idx) => ...)
```

**NO PERMITIDO incluso en contexto:**

```typescript
// PROHIBIDO - Ambiguo incluso con contexto
const result = fetch()     // ¿Resultado de qué fetch?
let temp = value          // ¿Temporal para qué?
const data = response     // ¿Qué parte del response?
```

**VALIDACIÓN OBLIGATORIA:**

Antes de nombrar cualquier elemento, verificar:

1. ¿El nombre explica completamente su función SIN leer código circundante? [SÍ/NO]
2. ¿Existe ambigüedad sobre qué hace o contiene? [SÍ/NO]
3. ¿Se puede confundir con otro elemento similar en el módulo? [SÍ/NO]
4. ¿Requiere comentario para entenderse? [SÍ/NO]

SI alguna respuesta es desfavorable → RENOMBRAR con descriptibilidad total.

**PREFERENCIA DE LONGITUD:**

Preferir nombres largos y explícitos sobre nombres cortos y ambiguos:

- `customerEmailVerificationStatus` > `emailStatus` > `status`
- `calculateTotalPriceIncludingTaxAndDiscount()` > `calcTotal()` > `calc()`
- `isUserAuthenticatedAndAuthorized` > `isAuth` > `auth`

**La claridad SIEMPRE prevalece sobre la brevedad.**

---

#### 6.8.2 Prohibición de Naming No Autorizado

**PROHIBIDO:**

- Introducir camelCase en tokens CSS (`colorPrimary` en lugar de `--color-primary`)
- Usar snake_case en componentes Vue
- Usar kebab-case en clases TypeScript
- Abreviaturas no estándar (`btn` permitido, `cstmr` prohibido)
- Nombres genéricos ambiguos (`data`, `info`, `handler`, `temp`, `value`, `item`, `result` sin contexto descriptivo completo)
- Nombres simples que no explican su función total (`process()`, `check()`, `isValid`, `count`)
- Nombres que requieren comentarios para entenderse
- Nombres repetitivos o confundibles con otros elementos del mismo contexto
- Preferir brevedad sobre claridad

#### 6.8.3 Proceso de Autorización de Nueva Convención

Si se requiere naming convention no listada en 6.8.1:

1. IA identifica necesidad y propone convención
2. IA justifica necesidad técnica
3. Arquitecto evalúa consistencia con convenciones existentes
4. Si APROBADO, arquitecto actualiza sección 6.8.1 de este contrato
5. Nueva convención se aplica consistentemente en código futuro

## 7. Prohibiciones

### 7.1 Prohibiciones Arquitectónicas

**PROHIBIDO sin autorización explícita del arquitecto:**

- Modificar sistema de enforcement definido en este contrato
- Omitir Autoverificación Obligatoria del Modelo (AOM)
- Saltarse Validación Cruzada entre Capas (VCC)
- Implementar breaking change sin proceso de sección 6.4
- Aplicar excepción sin registro formal
- Modificar contratos base sin estar trabajando explícitamente en ellos
- Introducir naming conventions no autorizadas
- Usar nombres ambiguos o no descriptivos que violen 6.8.1
- Saltarse Pre-Commit Verification

### 7.2 Prohibiciones de IA

**La IA NO PODRÁ:**

- Modificar contratos sin solicitud explícita del arquitecto mientras se trabaje en dichos archivos
- Aprobar sus propias excepciones contractuales
- Resolver conflictos normativos de forma definitiva
- Omitir Declaración de Cumplimiento Contractual
- Declarar cumplimiento falso por optimización
- Ocultar breaking changes clasificándolos como "mejoras"
- Reinterpretar cláusulas contractuales por conveniencia
- Implementar código rechazado sin corrección
- Modificar MI LÓGICA bajo ninguna circunstancia salvo instrucción explícita del arquitecto

### 7.3 Prohibiciones de Breaking Changes

**PROHIBIDO ABSOLUTAMENTE:**

- Breaking change sin documentación en `/copilot/BREAKING-CHANGES.md`
- Breaking change sin aprobación del arquitecto
- Breaking change sin estrategia de migración
- Breaking change sin actualizar versionamiento MAJOR
- Ocultar breaking change como "refactor"
- Breaking change sin analizar alternativas conformes
- Implementar breaking change rechazado

### 7.4 Prohibiciones de Excepciones

**PROHIBIDO ABSOLUTAMENTE:**

- Excepción sin registro en `/copilot/EXCEPCIONES.md`
- Excepción sin aprobación del arquitecto
- Excepción sin justificación técnica demostrable
- Excepción sin comentario `// EXC-XXX` en código
- Excepción sin evaluación de alternativas
- Excepción genérica que afecte múltiples subsistemas sin análisis de impacto

### 7.5 Prohibiciones Documentales

**PROHIBIDO ABSOLUTAMENTE:**

- Código sin Declaración de Cumplimiento Contractual si modificó capas core
- Omitir actualización de índices de carpetas
- Referencias cruzadas rotas sin corrección
- Documentación desincronizada con código
- Breaking change sin actualizar contratos afectados
- Excepción sin documentación en registro formal

### 7.6 Prohibiciones de Validación

**PROHIBIDO ABSOLUTAMENTE:**

- Commit sin pasar Pre-Commit Verification
- Validación Cruzada entre Capas (VCC) incompleta
- Declarar coherencia UI ↔ API sin verificar endpoints
- Declarar coherencia Decoradores ↔ Metadatos sin verificar símbolos
- Omitir verificación de MI LÓGICA en cambios arquitectónicos

## 8. Dependencias

Este contrato depende de:

**Contratos del Framework:**
- **00-CONTRACT.md:** Contrato principal que define MI LÓGICA, reglas obligatorias y workflow
- **04-UI-DESIGN-SYSTEM-CONTRACT.md:** Contrato UI/CSS que define sistema de tokens y reglas visuales
- **01-FRAMEWORK-OVERVIEW.md:** Descripción de arquitectura de 5 capas que debe validarse
- **02-FLOW-ARCHITECTURE.md:** Flujos que deben preservarse en modificaciones
- **03-QUICK-START.md:** Guía que NO debe romperse con cambios

**Componentes del Framework:**
- **BaseEntity:** Métodos públicos que constituyen contratos públicos
- **Application (Singleton):** Interfaz que debe preservarse
- **Sistema de Decoradores:** Símbolos y funciones accesorias que constituyen API pública
- **Componentes UI:** Generados desde metadatos, coherencia debe validarse
- **Sistema de Metadatos:** Almacenamiento en prototipos que debe verificarse

**Herramientas Externas:**
- **Git:** Sistema de control de versiones donde se aplica Pre-Commit Verification
- **TypeScript Compiler:** Validación de type safety
- **Vue 3:** Framework UI que debe preservarse según Axioma A4

Este contrato es independiente de:
- Infraestructura CI/CD (fuera de alcance)
- Backend/API REST (solo valida coherencia de contratos)
- Testing automatizado (recomendado pero no requerido contractualmente)
- Linters externos (auxiliares, no obligatorios)

## 9. Relaciones

### 9.1 Relación con Contrato Principal

Este contrato es **subordinado** a `00-CONTRACT.md` y extiende:

- **Sección 6.2 (Autorización para Cambios Mayores):** Este contrato define proceso de validación previo a solicitud de autorización
- **Sección 6.3 (Documentación Mandatoria):** Este contrato define mecanismo de verificación de sincronización
- **Sección 6.4 (Índices de Carpetas):** Este contrato incluye verificación de actualización de índices en Pre-Commit
- **Sección 6.7 (Reestructuración Documental):** Este contrato NO regula reestructuración (preservada en 00-CONTRACT)
- **Sección 7 (Prohibiciones):** Este contrato añade prohibiciones específicas de enforcement

### 9.2 Relación con Contrato UI/CSS

Este contrato es **complementario** a `04-UI-DESIGN-SYSTEM-CONTRACT.md`:

- **04-UI-CONTRACT no define enforcement:** Solo define REGLAS. Este contrato define CÓMO verificar cumplimiento.
- **Tokenización obligatoria (04-UI 6.4):** Este contrato define verificación en Pre-Commit.
- **Política Anti-Hardcode (04-UI 6.4.2):** Este contrato define detección automatizada y manual.
- **Excepciones CSS (04-UI 6.4.4):** Este contrato define registro formal de excepciones.

**NO duplica:** Este contrato NO redefine qué es un token ni cómo crear uno (eso es 04-UI-CONTRACT). Solo define cómo VERIFICAR que se usen.

### 9.3 Relación con Arquitectura del Framework

**Enforcement aplica a:**
- Entidades: Valida coherencia Entidad ↔ Decoradores
- Decoradores: Valida coherencia Decoradores ↔ Metadatos
- BaseEntity: Valida que métodos públicos no sufran breaking changes
- Application: Valida que interfaz pública se preserve
- UI Components: Valida coherencia Metadatos ↔ UI

**Enforcement NO modifica:**
- Arquitectura de 5 capas (preservada)
- Sistema de decoradores (solo valida)
- Lógica de BaseEntity (solo valida API pública)
- Generación de UI (solo valida coherencia)

### 9.4 Relación con Documentación

**Este contrato regula enforcement de:**
- Sincronización código-documentación
- Actualización de índices de carpetas
- Validación de referencias cruzadas
- Formato de 11 secciones (definido en 00-CONTRACT, verificado aquí)

**Este contrato introduce documentos nuevos:**
- `/copilot/EXCEPCIONES.md` - Registro de excepciones
- `/copilot/BREAKING-CHANGES.md` - Registro de breaking changes
- Declaración de Cumplimiento Contractual (no persiste, se genera por request)

### 9.5 Relación con Workflow de Desarrollo

**Este contrato extiende workflow de 00-CONTRACT 6.6 agregando:**

```
WORKFLOW ORIGINAL (00-CONTRACT 6.6):
1. Antes: Leer docs, verificar existencia, determinar autorización, planificar docs
2. Durante: Seguir patrones, no duplicar, type safety, naming, hooks
3. Después: Documentar, índices, referencias, probar, validar

EXTENSIÓN (Este Contrato):
1. Antes: + Verificar contratos aplicables
2. Durante: + Ejecutar AOM continuamente
3. Después: + Generar Declaración de Cumplimiento, Pre-Commit Verification
```

## 10. Notas de Implementación

### 10.1 Versionamiento del Contrato

Este contrato sigue versionamiento semántico:

- **Major:** Cambios fundamentales en sistema de enforcement o autoridad del arquitecto
- **Minor:** Nuevas verificaciones, extensiones de proceso, aclaraciones
- **Patch:** Correcciones tipográficas, actualización de ejemplos

**Versión actual:** 1.1.0

**Cambios en versión 1.1.0 (13 de Febrero, 2026):**
- **Extensión de Naming Conventions:** Agregada Nota Obligatoria de Descriptibilidad Total en 6.8.1
- Establecimiento de regla fundamental: nombres deben ser completamente descriptivos y auto-explicativos
- Prohibición explícita de nombres ambiguos, genéricos o repetitivos
- Validación obligatoria de 4 criterios antes de nombrar elementos
- Preferencia contractual de claridad sobre brevedad
- Actualización de prohibiciones en 6.8.2 para incluir violaciones de descriptibilidad
- Actualización de verificaciones AOM y Pre-Commit para incluir descriptibilidad
- Actualización de ejemplo de Declaración de Cumplimiento Contractual

**Cambios en versión 1.0.0 (13 de Febrero, 2026):**
- Creación inicial del Contrato de Enforcement Técnico
- Definición de Autoverificación Obligatoria del Modelo (AOM)
- Establecimiento de Validación Cruzada entre Capas (VCC)
- Formalización de Política de Breaking Changes
- Definición de Responsabilidad del Arquitecto
- Sistema de Registro de Excepciones
- Pre-Commit Verification Checklist
- Prohibiciones específicas de enforcement
- Coherencia de Naming Conventions (formato)

### 10.2 Adaptación al Entorno

Este contrato está diseñado para entorno con:

- **Desarrollo asistido por IA** (GitHub Copilot, Claude, ChatGPT, etc.)
- **Revisión manual del arquitecto** (sin CI/CD automático complejo)
- **Repositorio Git local/remoto** (GitHub, GitLab, Bitbucket, etc.)
- **Documentación contractual vinculante** (Markdown en `/copilot/`)

**NO asume:**
- Pipeline CI/CD corporativo
- Equipo DevOps externo
- Testing automatizado obligatorio
- Validadores en tiempo real

### 10.3 Implementación Progresiva

Si este contrato se introduce en proyecto existente:

**FASE 1 - Auditoría (Semana 1):**
- Revisar código existente contra contratos
- Identificar violaciones, excepciones implícitas, breaking changes no documentados
- Generar auditoría en `/copilot/AUDITORIA-ENFORCEMENT.md`

**FASE 2 - Registro (Semana 2):**
- Crear `/copilot/EXCEPCIONES.md` y registrar excepciones detectadas
- Crear `/copilot/BREAKING-CHANGES.md` si aplica
- Documentar estado actual del framework

**FASE 3 - Enforcement Progresivo (Semana 3+):**
- Aplicar AOM solo a código nuevo
- Pre-Commit Verification obligatoria para commits futuros
- Refactorización gradual de código legacy (opcional)

### 10.4 Archivo de Excepciones - Estructura

Crear `/copilot/EXCEPCIONES.md`:

```markdown
# REGISTRO DE EXCEPCIONES CONTRACTUALES

**Última Actualización:** [Fecha]  
**Total de Excepciones Activas:** [Número]  
**Total de Excepciones Revocadas:** [Número]

## Índice de Excepciones

- [EXC-001](#exc-001) - [Título]
- [EXC-002](#exc-002) - [Título]

---

## [EXC-001] - [Título de la Excepción]

[Contenido según formato de sección 6.6.2]

---

## Excepciones Revocadas

### [EXC-XXX] - [Título]

**Estado:** REVOCADA  
**Fecha de Revocación:** [Fecha]  
**Razón de Revocación:** [Descripción]

---

**VALIDEZ CONTRACTUAL**

Este registro mantiene trazabilidad de excepciones autorizadas.  
Autoridad final: Arquitecto del proyecto.
```

### 10.5 Archivo de Breaking Changes - Estructura

Crear `/copilot/BREAKING-CHANGES.md`:

```markdown
# REGISTRO DE BREAKING CHANGES

**Última Actualización:** [Fecha]  
**Total de Breaking Changes Implementados:** [Número]  
**Total de Breaking Changes Propuestos:** [Número]

## Índice de Breaking Changes

- [BREAKING-001](#breaking-001) - [Título] - [IMPLEMENTADO]
- [BREAKING-002](#breaking-002) - [Título] - [PROPUESTO]

---

## [BREAKING-001] - [Título del Breaking Change]

[Contenido según formato de sección 6.4.2]

---

**VALIDEZ CONTRACTUAL**

Este registro mantiene historial de breaking changes del framework.  
Autoridad final: Arquitecto del proyecto.
```

### 10.6 Plantilla de Declaración de Cumplimiento Contractual

Para facilitar generación por IA, usar plantilla de sección 6.2.

La IA DEBERÁ copiar plantilla, completar todos los campos y presentarla junto con código propuesto.

### 10.7 Scripts de Verificación (Opcionales)

**Ejemplo de script Pre-Commit Hook (bash):**

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Ejecutando Pre-Commit Verification..."

# Verificar que no haya colores hex hardcoded en CSS
if grep -rE "#[0-9a-fA-F]{3,6}" src/css/*.css 2>/dev/null | grep -v "constants.css"; then
    echo "❌ ERROR: Colores hex hardcoded detectados en CSS"
    echo "Regla: 04-UI-CONTRACT 6.4.2 - Política Anti-Hardcode"
    exit 1
fi

# Verificar TypeScript compila
if ! npm run type-check; then
    echo "❌ ERROR: TypeScript no compila"
    exit 1
fi

echo "✅ Pre-Commit Verification completa"
exit 0
```

**Nota:** Scripts son auxiliares. Arquitecto tiene autoridad final.

### 10.8 Ejemplo de Autoverificación Obligatoria del Modelo

**Ejemplo de salida esperada de IA:**

```markdown
## DECLARACIÓN DE CUMPLIMIENTO CONTRACTUAL

### Verificación Axiomática (MI LÓGICA)
- [x] A1 - Arquitectura de Capas: SÍ (código respeta 5 capas)
- [x] A2 - Flujo Unidireccional: SÍ (no se introduce flujo bidireccional)
- [x] A3 - Generación desde Metadatos: SÍ (UI generada desde decoradores)
- [x] A4 - Inmutabilidad Estructural: SÍ (stack tecnológico intacto)

### Verificación Contractual
- [x] 00-CONTRACT 6.2 - Autorización para Cambios Mayores: N/A (cambio menor)
- [x] 00-CONTRACT 6.3 - Documentación Mandatoria: SÍ (creado customer.md)
- [x] 00-CONTRACT 6.4 - Índices de Carpetas: SÍ (actualizado /src/entities/README.md)
- [x] 00-CONTRACT 6.7.12 - Formato Documental: SÍ (11 secciones cumplidas)
- [x] 05-ENFORCEMENT 6.8.1 - Naming Conventions: SÍ (formato y descriptibilidad cumplidos)
- [x] 05-ENFORCEMENT 6.8.1 - Descriptibilidad Total: SÍ (nombres auto-explicativos sin ambigüedad)
- [x] 04-UI-CONTRACT 6.3 - Sistema de Tokens: N/A (no modifica CSS)
- [x] 04-UI-CONTRACT 6.4 - Política Anti-Hardcode: N/A (no modifica CSS)

### Validación Cruzada entre Capas
- [x] Coherencia Entidad ↔ Decoradores: SÍ (Customer tiene @Persistent, @ApiEndpoint, etc.)
- [x] Coherencia Decoradores ↔ Metadatos: SÍ (verificado con BaseEntity.getProperties())
- [x] Coherencia Metadatos ↔ UI: SÍ (formulario generará inputs correctos)
- [x] Coherencia API ↔ Backend: SÍ (@ApiEndpoint apunta a /api/customers documentado)

### Detección de Breaking Changes
- [ ] Modifica contratos públicos: NO
- [ ] Altera comportamiento documentado: NO
- [ ] Cambia arquitectura core: NO
- [ ] Requiere actualización de código consumidor: NO

**Clasificación:** CAMBIO MENOR

### Excepciones Identificadas
Ninguna

### Conflictos Contractuales Detectados
Ninguno

### Archivos Modificados/Creados
- `/src/entities/customer.ts` (nueva entidad)
- `/copilot/layers/02-base-entity/customer.md` (documentación nueva)
- `/src/entities/README.md` (índice actualizado)

### Documentación Actualizada
- `/copilot/layers/02-base-entity/customer.md` (creada)
- `/src/entities/README.md` (actualizada)
```

### 10.9 Aplicabilidad

Al trabajar con este framework bajo enforcement técnico, se acepta contractualmente:

- Ejecutar Autoverificación Obligatoria del Modelo (AOM) antes de presentar código
- Generar Declaración de Cumplimiento Contractual estructurada
- Ejecutar Validación Cruzada entre Capas (VCC)
- Seguir proceso obligatorio de Breaking Changes
- Registrar excepciones formalmente en `/copilot/EXCEPCIONES.md`
- Ejecutar Pre-Commit Verification antes de commit
- Respetar naming conventions con descriptibilidad total (6.8.1)
- Usar nombres auto-explicativos sin ambigüedad ni repetitividad
- Respetar autoridad final del arquitecto
- No modificar contratos sin autorización explícita del arquitecto
- Documentar sincronizadamente todo cambio
- Mantener coherencia con MI LÓGICA en todo momento

### 10.10 Reconocimiento en Contrato Principal

Según sección 11 de este contrato, el `00-CONTRACT.md` debe actualizarse para incluir:

**Nueva cláusula sugerida en sección 6 o nueva sección 9:**

```markdown
### 6.X Enforcement Técnico

El enforcement técnico del framework se rige obligatoriamente por el contrato `05-ENFORCEMENT-TECHNICAL-CONTRACT.md`.

Todo código generado por agentes de IA, toda modificación propuesta y toda integración al repositorio debe cumplir los mecanismos de verificación establecidos en dicho contrato subordinado.

El contrato de enforcement es subordinado a MI LÓGICA y al presente contrato, pero vinculante en materia de autoverificación, validación cruzada, gestión de breaking changes, registro de excepciones y pre-commit verification.
```

**Actualización en sección 11 (Referencias Cruzadas):**

Agregar:
```markdown
- [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) - Contrato de enforcement técnico
```

## 11. Referencias Cruzadas

Documentos vinculados contractualmente:

**Contratos del Framework:**
- [00-CONTRACT.md](00-CONTRACT.md) - Contrato principal (autoridad superior)
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md) - Contrato UI/CSS complementario
- [01-FRAMEWORK-OVERVIEW.md](01-FRAMEWORK-OVERVIEW.md) - Visión general del framework
- [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) - Arquitectura y flujos
- [03-QUICK-START.md](03-QUICK-START.md) - Guía de inicio rápido

**Documentos Generados por Este Contrato:**
- [EXCEPCIONES.md](EXCEPCIONES.md) - Registro de excepciones contractuales (crear si no existe)
- [BREAKING-CHANGES.md](BREAKING-CHANGES.md) - Registro de breaking changes (crear si no existe)

**Capas del Framework:**
- layers/01-decorators/ - Especificaciones de decoradores
- layers/02-base-entity/ - Especificación de BaseEntity
- layers/03-application/ - Especificación de Application
- layers/04-components/ - Especificación de componentes
- layers/05-advanced/ - Funcionalidades avanzadas
- layers/06-composables/ - Composables del sistema

**Código Fuente:**
- /src/entities/base_entitiy.ts - BaseEntity (contratos públicos)
- /src/models/application.ts - Application (interfaz pública)
- /src/decorations/ - Sistema de decoradores
- /src/css/constants.css - Sistema de tokens UI/CSS

**Documentos que deben actualizarse:**
- `00-CONTRACT.md` - Debe agregar cláusula reconociendo este contrato
- Índice de `/copilot/` - Debe listar este nuevo contrato

---

**VALIDEZ CONTRACTUAL**

Este contrato mantiene integridad arquitectónica del framework mediante enforcement técnico en entorno de desarrollo asistido por IA con revisión manual del arquitecto. Constituye protección de MI LÓGICA, garantía de coherencia contractual y mecanismo de calidad técnica.

Este contrato es subordinado a MI LÓGICA y al contrato principal `00-CONTRACT.md`. No modifica arquitectura core del framework.

**Versión:** 1.1.0  
**Fecha de Vigencia:** Desde el 13 de Febrero, 2026  
**Última Actualización:** 13 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE  
**Subordinado a:** MI LÓGICA y 00-CONTRACT.md  
**Complementario a:** 04-UI-DESIGN-SYSTEM-CONTRACT.md

---

**Autoridad Final:** Arquitecto del Framework SaaS Vue
