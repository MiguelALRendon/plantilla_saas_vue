# Tutoriales - Índice Semántico

**Propósito:** Índice de tutoriales prácticos paso a paso  
**Última Actualización:** 13 de Febrero, 2026  
**ID Base:** TUT

---

## Tutoriales Disponibles (3)

| ID | Archivo | Nivel | Tiempo | Líneas | Descripción |
|---|---|---|---|---|---|
| TUT::01 | [01-basic-crud.md](01-basic-crud.md) | Básico | 30 min | ~350 | CRUD completo paso a paso |
| TUT::02 | [02-validations.md](02-validations.md) | Intermedio | 45 min | ~280 | Sistema de validaciones |
| TUT::03 | [03-relations.md](03-relations.md) | Intermedio | 60 min | ~320 | Relaciones entre entidades |

---

## Tutorial 01: CRUD Básico

**Archivo:** [01-basic-crud.md](01-basic-crud.md)  
**ID:** TUT::01  
**Nivel:** Básico  
**Tiempo Estimado:** 30 minutos

### Contenido

**Secciones Principales:**
- Creación de entidad Product
- Registro en Application
- Operaciones CRUD automáticas
- Validaciones básicas
- Estados de UI

**Decoradores Usados:**
- `@ModuleName`
- `@PropertyName`
- `@PropertyIndex`
- `@Required`
- `@ApiEndpoint`
- `@Persistent`

**Conceptos Enseñados:**
- Herencia de BaseEntity
- Sistema de metadatos
- CRUD automático
- Validación required
- Dirty state detection

**ID de Secciones:**
- `TUT::01::create` - Crear entidad
- `TUT::01::register` - Registrar módulo
- `TUT::01::test` - Probar funcionalidad
- `TUT::01::save` - Implementar save
- `TUT::01::validate` - Validar datos

---

## Tutorial 02: Validaciones

**Archivo:** [02-validations.md](02-validations.md)  
**ID:** TUT::02  
**Nivel:** Intermedio  
**Tiempo Estimado:** 45 minutos

### Contenido

**Secciones Principales:**
- Validación Required
- Validación Síncrona (@Validation)
- Validación Asíncrona (@AsyncValidation)
- Validación Condicional
- Mensajes Custom

**Decoradores Usados:**
- `@Required`
- `@Validation`
- `@AsyncValidation`
- `@HelpText`

**Conceptos Enseñados:**
- Sistema de validación tri-nivel
- Validaciones custom
- Validación contra API
- Mensajes de error
- Callbacks de validación

**ID de Secciones:**
- `TUT::02::required` - Validación required
- `TUT::02::sync` - Validación síncrona
- `TUT::02::async` - Validación asíncrona
- `TUT::02::conditional` - Validación condicional
- `TUT::02::messages` - Mensajes custom

---

## Tutorial 03: Relaciones

**Archivo:** [03-relations.md](03-relations.md)  
**ID:** TUT::03  
**Nivel:** Intermedio  
**Tiempo Estimado:** 60 minutos

### Contenido

**Secciones Principales:**
- Relaciones 1:1 (Objeto)
- Relaciones 1:N (Array)
- Navegación entre entidades
- CRUD de relaciones
- Validaciones de integridad

**Decoradores Usados:**
- `@PropertyName` con BaseEntity
- `@PropertyName` con Array
- `@Required`
- Decoradores estándar

**Conceptos Enseñados:**
- Relaciones entre entidades
- ObjectInputComponent
- ArrayInputComponent
- Navegación entre detalles
- Integridad referencial

**ID de Secciones:**
- `TUT::03::one-to-one` - Relación 1:1
- `TUT::03::one-to-many` - Relación 1:N
- `TUT::03::navigation` - Navegación
- `TUT::03::crud-relations` - CRUD de relaciones
- `TUT::03::integrity` - Integridad referencial

---

## Ruta de Aprendizaje Recomendada

### Día 1: Fundamentos

1. Leer: [../00-CONTRACT.md](../00-CONTRACT.md) - 10 min
2. Leer: [../01-FRAMEWORK-OVERVIEW.md](../01-FRAMEWORK-OVERVIEW.md) - 20 min
3. Leer: [../03-QUICK-START.md](../03-QUICK-START.md) - 15 min
4. **Hacer: Tutorial 01 (CRUD Básico)** - 30 min

**Total:** ~1.5 horas

### Semana 1: Intermedio

1. Leer: [../02-FLOW-ARCHITECTURE.md](../02-FLOW-ARCHITECTURE.md) - 30 min
2. **Hacer: Tutorial 02 (Validaciones)** - 45 min
3. **Hacer: Tutorial 03 (Relaciones)** - 60 min
4. Explorar: [../layers/01-decorators/](../layers/01-decorators/) - 2 horas

**Total:** ~6 horas

### Mes 1: Avanzado

1. Leer: [../examples/](../examples/) - 2 horas
2. Explorar: [../layers/02-base-entity/](../layers/02-base-entity/) - 2 horas
3. Explorar: [../layers/03-application/](../layers/03-application/) - 1 hora
4. Práctica: Proyecto propio - Variable

---

## Conceptos por Tutorial

### Conceptos Básicos (Tutorial 01)

- Herencia de BaseEntity
- Decoradores obligatorios
- Registro de módulos
- CRUD automático
- Operador `!` (definite assignment)
- Validación required
- Dirty state

### Conceptos Intermedios (Tutorial 02)

- Validación tri-nivel
- Callbacks de validación
- Validación asíncrona
- Mensajes custom
- EventBus de validación
- Validaciones condicionales

### Conceptos Intermedios (Tutorial 03)

- Relaciones 1:1 y 1:N
- PropertyType con BaseEntity
- ObjectInputComponent
- ArrayInputComponent
- Navegación entre entidades
- Integridad referencial

---

## Decoradores por Tutorial

### Tutorial 01

| Decorador | Uso | Obligatorio |
|---|---|---|
| @ModuleName | Nombre módulo | ✓ |
| @PropertyName | Propiedades | ✓ |
| @PropertyIndex | Orden | Recomendado |
| @Required | Validación | Según necesidad |
| @ApiEndpoint | URL API | Para persistencia |
| @Persistent | Habilitar CRUD | Para persistencia |

### Tutorial 02

| Decorador | Uso | Obligatorio |
|---|---|---|
| @Required | Validación básica | Según necesidad |
| @Validation | Validación síncrona | Según necesidad |
| @AsyncValidation | Validación API | Según necesidad |
| @HelpText | Ayuda usuario | Recomendado |

### Tutorial 03

| Decorador | Uso | Obligatorio |
|---|---|---|
| @PropertyName(typeof BaseEntity) | Relación 1:1 | Para objetos |
| @PropertyName(Array) | Relación 1:N | Para arrays |
| Otros decoradores estándar | Según necesidad | Variable |

---

## Relación con Documentación

### Tutoriales → Contratos

| Tutorial | CORE | FWK | FLOW | QS |
|---|---|---|---|---|
| TUT::01 | ✓ | ✓ | ✓ | ✓ |
| TUT::02 | ✓ | ✓ | ✓ | - |
| TUT::03 | ✓ | ✓ | ✓ | - |

### Tutoriales → Capas

| Tutorial | Decorators | BaseEntity | Application | Components |
|---|---|---|---|---|
| TUT::01 | ✓ | ✓ | ✓ | ✓ |
| TUT::02 | ✓ | ✓ | - | ✓ |
| TUT::03 | ✓ | ✓ | - | ✓ |

---

## Búsqueda por Necesidad

### Para Empezar

Ir a: [01-basic-crud.md](01-basic-crud.md)

### Para Validar Datos

Ir a: [02-validations.md](02-validations.md)

### Para Relacionar Entidades

Ir a: [03-relations.md](03-relations.md)

### Para Ver Ejemplos Completos

Ir a: [../examples/](../examples/)

---

## Prerequis itos por Tutorial

### Tutorial 01

**Conocimientos:**
- TypeScript básico
- Decoradores TypeScript
- Vue 3 básico

**Setup:**
- Proyecto inicializado
- Dependencias instaladas
- Dev server ejecutándose

### Tutorial 02

**Conocimientos:**
- Todo de Tutorial 01
- Callbacks y Promesas
- Async/Await

**Prerrequisitos:**
- Tutorial 01 completado

### Tutorial 03

**Conocimientos:**
- Todo de Tutorial 01 y 02
- Conceptos de BD relacionales
- Navegación entre vistas

**Prerrequisitos:**
- Tutorial 01 y 02 completados

---

## Referencias Cruzadas

### Documentación Relacionada

- **Contratos:** [../00-CONTRACT.md](../00-CONTRACT.md), [../01-FRAMEWORK-OVERVIEW.md](../01-FRAMEWORK-OVERVIEW.md)
- **Quick Start:** [../03-QUICK-START.md](../03-QUICK-START.md)
- **Decoradores:** [../layers/01-decorators/](../layers/01-decorators/)
- **BaseEntity:** [../layers/02-base-entity/](../layers/02-base-entity/)
- **Ejemplos:** [../examples/](../examples/)

### Código Fuente

- **Entidades Tutorial:** `/src/entities/`
- **Application:** `/src/models/application.ts`

---

**Última Actualización:** 13 de Febrero, 2026  
**Total Tutoriales:** 3  
**Mantenimiento:** Actualizar al agregar/modificar tutoriales
