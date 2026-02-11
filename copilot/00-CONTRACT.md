# 📜 CONTRATO DE DESARROLLO - Framework SaaS Vue

**Versión:** 1.0.0  
**Fecha de Creación:** 10 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE

---

## ⚖️ TÉRMINOS CONTRACTUALES OBLIGATORIOS

### 1. PRINCIPIO FUNDAMENTAL: RESPETO A LA LÓGICA EXISTENTE

**ARTÍCULO 1.1 - Prioridad Absoluta**

Este framework ha sido diseñado con una arquitectura específica y deliberada. **MI LÓGICA** es la base fundamental y debe ser respetada en todo momento.

```
MI LÓGICA > Cualquier otra consideración
```

**ARTÍCULO 1.2 - Definición de "MI LÓGICA"**

"MI LÓGICA" se refiere a:
- Arquitectura basada en decoradores TypeScript
- Sistema de metadatos almacenado en prototipos
- Generación automática de interfaces desde entidades
- Patrón Singleton para Application
- Sistema de eventos mediante mitt
- Hooks de ciclo de vida en BaseEntity
- Componentes reactivos generados dinámicamente
- Flujo unidireccional: Entidad → Metadatos → UI

---

## 🚫 PROHIBICIONES ESTRICTAS

### 2. MODIFICACIONES SIN AUTORIZACIÓN

**ARTÍCULO 2.1 - Solicitud de Permiso Obligatoria**

Cualquier modificación que cumpla UNO O MÁS de los siguientes criterios **REQUIERE AUTORIZACIÓN EXPLÍCITA**:

#### ❌ Cambios Mayores que Requieren Permiso:

1. **Arquitectura Core**
   - Modificar el sistema de decoradores
   - Cambiar la jerarquía de BaseEntity
   - Alterar el patrón Singleton de Application
   - Modificar el sistema de eventos (eventBus)

2. **Flujo de Datos**
   - Cambiar cómo se almacenan los metadatos
   - Modificar el flujo de validación
   - Alterar el ciclo de vida CRUD
   - Cambiar el sistema de persistencia

3. **Generación de UI**
   - Modificar cómo se generan los componentes
   - Cambiar la lógica de selección de inputs
   - Alterar el sistema de agrupación (ViewGroup)
   - Modificar el binding de datos

4. **Sistema de Estado**
   - Cambiar cómo se detectan cambios (getDirtyState)
   - Modificar el sistema de originalState
   - Alterar la lógica de resetChanges

5. **API y Persistencia**
   - Modificar interceptores de Axios
   - Cambiar el sistema de mapeo de claves
   - Alterar validaciones de persistencia

#### ✅ Cambios Menores Permitidos sin Autorización:

1. **Extensiones**
   - Agregar nuevos decoradores que no modifiquen existentes
   - Crear nuevos componentes personalizados
   - Agregar nuevas entidades
   - Agregar hooks adicionales

2. **Estilos y UI**
   - Modificar CSS
   - Ajustar layouts
   - Agregar animaciones

3. **Utilidades**
   - Agregar funciones helper
   - Crear nuevos enums
   - Agregar constantes

**ARTÍCULO 2.2 - Proceso de Solicitud de Permiso**

Para solicitar permiso:
1. Documentar en detalle el cambio propuesto
2. Explicar POR QUÉ es necesario
3. Demostrar que NO existe alternativa dentro de MI LÓGICA
4. Especificar impacto en el sistema existente
5. Esperar APROBACIÓN EXPLÍCITA antes de proceder

---

## 📝 OBLIGACIÓN DE DOCUMENTACIÓN

### 3. DOCUMENTACIÓN MANDATORIA

**ARTÍCULO 3.1 - Todo Cambio Debe Documentarse**

**SIN EXCEPCIONES**: Cualquier modificación al código debe ir acompañada de documentación actualizada.

#### Tipos de Documentación Requerida:

1. **Cambios a Funcionalidad Existente**
   - Actualizar el archivo MD correspondiente
   - Mantener ejemplos actualizados
   - Actualizar referencias cruzadas

2. **Nueva Funcionalidad**
   - Crear nuevo archivo MD en la carpeta apropiada
   - Seguir la estructura de documentación establecida
   - Agregar referencias cruzadas en archivos relacionados
   - Actualizar índice principal

3. **Nuevos Decoradores**
   - Crear archivo en `layers/01-decorators/`
   - Documentar símbolo de metadatos
   - Documentar función accesora en BaseEntity
   - Agregar ejemplo de uso
   - Especificar referencias

4. **Cambios de Arquitectura**
   - Actualizar `01-FRAMEWORK-OVERVIEW.md`
   - Actualizar `02-FLOW-ARCHITECTURE.md`
   - Documentar migración si aplica

**ARTÍCULO 3.2 - Estructura de Documentación**

Cada archivo MD debe contener:

```markdown
# Título del Componente/Funcionalidad

**Referencias:** [Lista de archivos MD relacionados]

## Descripción
[Qué es y para qué sirve]

## Ubicación en el Código
[Ruta del archivo fuente]

## Uso
[Ejemplos prácticos]

## API / Métodos
[Firma y descripción]

## Relaciones
[Qué otros componentes/decoradores utiliza o llama]

## Notas Importantes
[Consideraciones especiales]
```

**ARTÍCULO 3.3 - Sincronización Código-Documentación**

```
Código sin documentación = Código no válido
Documentación sin actualizar = Documentación inválida
```

Todo PR/commit debe incluir:
- Cambios de código
- Documentación correspondiente
- Actualización de referencias

---

## 🏗️ LÓGICA PRINCIPAL DEL FRAMEWORK

### 4. DESCRIPCIÓN DEL SISTEMA

**ARTÍCULO 4.1 - Definición del Framework**

Este es un **Framework Meta-Programático de Generación Automática de Interfaces CRUD** construido sobre Vue 3 + TypeScript.

**Filosofía Core:**
> "Define una vez, funciona en todas partes"

**Principio Fundamental:**
Los metadatos definen comportamiento. No se programa UI manualmente, se declara mediante decoradores.

**ARTÍCULO 4.2 - Capas del Sistema**

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

**Flujo de Información:**
```
Entidad → Decoradores → Metadatos → BaseEntity → Application → UI
```

**ARTÍCULO 4.3 - Flujo Principal de Operación**

Ver documento detallado: `02-FLOW-ARCHITECTURE.md`

Resumen del flujo:
1. **Definición**: Desarrollador crea entidad con decoradores
2. **Registro**: Entidad se agrega a `Application.ModuleList`
3. **Inicialización**: Router y Application se sincronizan
4. **Navegación**: Usuario selecciona módulo en sidebar
5. **Generación**: Sistema lee metadatos y genera UI
6. **Interacción**: Usuario interactúa con formularios generados
7. **Validación**: Sistema valida según decoradores
8. **Persistencia**: BaseEntity maneja CRUD con API
9. **Actualización**: UI reactiva refleja cambios

---

## 🔐 GARANTÍAS DEL SISTEMA

### 5. PRINCIPIOS INMUTABLES

**ARTÍCULO 5.1 - Garantías de Funcionamiento**

Este framework garantiza:

1. **Type Safety**: Todo está tipado con TypeScript
2. **Reactividad**: Vue 3 Composition API + Refs reactivos
3. **Consistencia**: Misma UI para todas las entidades siguiendo decoradores
4. **Extensibilidad**: Componentes custom sin romper generación automática
5. **Persistencia**: Estado sincronizado con backend
6. **Validación**: Multi-nivel (required, sync, async)

**ARTÍCULO 5.2 - Límites del Sistema**

Este framework NO es:
- Un ORM completo (solo cliente)
- Un reemplazo de backend
- Una solución para lógica de negocio compleja en frontend
- Un sistema de autenticación (aunque se puede integrar)

---

## 📋 PROCESO DE DESARROLLO

### 6. WORKFLOW OBLIGATORIO

**ARTÍCULO 6.1 - Antes de Codificar**

1. Leer documentación relevante
2. Verificar si existe funcionalidad similar
3. Determinar si el cambio requiere permiso (Artículo 2.1)
4. Planificar documentación necesaria

**ARTÍCULO 6.2 - Durante el Desarrollo**

1. Seguir patrones establecidos
2. No duplicar lógica (DRY)
3. Mantener type safety
4. Respetar convenciones de nombres
5. Usar hooks cuando corresponda

**ARTÍCULO 6.3 - Después de Codificar**

1. Actualizar/crear documentación
2. Actualizar referencias cruzadas
3. Probar en contexto completo
4. Verificar no romper funcionalidad existente

---

## 🔄 MANTENIMIENTO DE CONTRATO

### 7. ACTUALIZACIONES AL CONTRATO

**ARTÍCULO 7.1 - Versionamiento**

Este contrato sigue versionamiento semántico:
- **Major**: Cambios fundamentales en principios
- **Minor**: Aclaraciones o nuevas reglas
- **Patch**: Correcciones tipográficas

Versión actual: **1.0.0**

**ARTÍCULO 7.2 - Modificaciones al Contrato**

Modificar este contrato requiere:
1. Justificación documentada
2. Revisión de impacto
3. Actualización de todos los documentos afectados
4. Comunicación explícita del cambio

---

## ✅ ACEPTACIÓN

Al trabajar con este framework, se acepta implícitamente:

- [x] Respetar MI LÓGICA como principio fundamental
- [x] Solicitar permiso para cambios mayores
- [x] Documentar TODO cambio realizado
- [x] Mantener sincronía código-documentación
- [x] Seguir los patrones establecidos
- [x] Priorizar consistencia sobre conveniencia personal

---

## 📚 DOCUMENTOS RELACIONADOS

Este contrato hace referencia a:
- `01-FRAMEWORK-OVERVIEW.md` - Visión general del framework
- `02-FLOW-ARCHITECTURE.md` - Arquitectura y flujos del sistema
- Todos los documentos en `layers/` - Especificaciones técnicas por capa

---

**NOTA FINAL**: Este contrato existe para mantener la integridad, consistencia y mantenibilidad del framework. No es una limitación arbitraria, es la protección de una arquitectura bien pensada.

*"Un framework sin principios es código spaghetti con mejor marketing."*

---

**Firma Digital:** Framework SaaS Vue v1.0.0  
**Fecha de Vigencia:** Desde el 10 de Febrero, 2026  
**Estado:** ACTIVO
