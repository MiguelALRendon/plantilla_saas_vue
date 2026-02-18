# BaseEntity - Índice Semántico

## Proposito

Indexar la documentación funcional y técnica de BaseEntity como motor core del framework.

## Ultima Actualizacion

16 de Febrero, 2026

**Propósito:** Índice completo de especificaciones de BaseEntity  
**Última Actualización:** 13 de Febrero, 2026  
**ID Base:** BE

---

## Propósito

Indexar la documentación funcional y técnica de BaseEntity como motor core del framework.

## Elementos

- [base-entity-core.md](base-entity-core.md)
- [crud-operations.md](crud-operations.md)
- [metadata-access.md](metadata-access.md)

## Enlaces Estructurados

- [Índice de Capas](../README.md)
- [Decoradores](../01-decorators/README.md)
- [Application](../03-application/README.md)

## Última Actualización

16 de Febrero, 2026

### Actualización Fase 1 (18 de Febrero, 2026)

- Dirty state migrado a comparación profunda (`deepEqual`)
- Snapshot de estado migrado a `deepClone`
- Mapeo persistente con transformación automática por metadatos + `transformationSchema` opcional como override

---

## Archivos de Especificación (9)

| ID | Archivo | Tipo | Líneas | Descripción |
|---|---|---|---|---|
| BE::core | [base-entity-core.md](base-entity-core.md) | Especificación | ~350 | Estructura fundamental y arquitectura |
| BE::crud | [crud-operations.md](crud-operations.md) | Especificación | ~280 | Operaciones CRUD completas (save, update, delete, get) |
| BE::validation | [validation-system.md](validation-system.md) | Especificación | ~220 | Sistema de validación tri-nivel |
| BE::lifecycle | [lifecycle-hooks.md](lifecycle-hooks.md) | Especificación | ~180 | Hooks de ciclo de vida (before, on, after) |
| BE::metadata | [metadata-access.md](metadata-access.md) | Especificación | ~160 | Acceso a metadatos de decoradores |
| BE::persistence | [persistence-methods.md](persistence-methods.md) | Especificación | ~200 | Métodos de persistencia y mapeo API |
| BE::state | [state-and-conversion.md](state-and-conversion.md) | Especificación | ~140 | Gestión de estado y conversión |
| BE::static | [static-methods.md](static-methods.md) | Especificación | ~120 | Métodos estáticos de clase |
| BE::additional | [additional-metadata.md](additional-metadata.md) | Especificación | ~100 | Metadata adicional y utilidades |

---

## Métodos por Categoría

### Operaciones CRUD

| ID | Método | Tipo | Propósito | HTTP |
|---|---|---|---|---|
| BE::save | `save()` | Async | Guardar entidad (crear o actualizar) | POST/PUT |
| BE::update | `update()` | Async | Actualizar entidad existente | PUT |
| BE::delete | `delete()` | Async | Eliminar entidad | DELETE |
| BE::get-element | `getElement(id)` | Async Static | Obtener una entidad | GET |
| BE::get-list | `getElementList()` | Async Static | Obtener lista de entidades | GET |
| BE::refresh | `refresh()` | Async | Recargar desde servidor | GET |

**Referencia Completa:** [crud-operations.md](crud-operations.md)

### Sistema de Validación

| ID | Método | Tipo | Propósito |
|---|---|---|---|
| BE::validate-inputs | `validateInputs()` | Async | Validar todos los campos |
| BE::is-required | `isRequired(key)` | Sync | Verificar si campo es required |
| BE::is-validation | `isValidation(key)` | Sync | Evaluar validación síncrona |
| BE::is-async-validation | `isAsyncValidation(key)` | Async | Evaluar validación asíncrona |
| BE::required-message | `requiredMessage(key)` | Sync | Obtener mensaje 'required' |
| BE::validation-message | `validationMessage(key)` | Sync | Obtener mensaje validación |
| BE::async-validation-message | `asyncValidationMessage(key)` | Sync | Obtener mensaje async validation |

**Referencia Completa:** [validation-system.md](validation-system.md)

### Gestión de Estado

| ID | Método | Tipo | Propósito |
|---|---|---|---|
| BE::get-dirty-state | `getDirtyState()` | Sync | Detectar cambios sin guardar |
| BE::reset-changes | `resetChanges()` | Sync | Descartar cambios y volver a original |
| BE::is-new | `isNew()` | Sync | Verificar si es instancia nueva |
| BE::to-object | `toObject()` | Sync | Convertir a objeto plano |
| BE::to-persistent-object | `toPersistentObject()` | Sync | Convertir para persistencia |
| BE::get-keys | `getKeys()` | Sync | Obtener claves de propiedades |

**Referencia Completa:** [state-and-conversion.md](state-and-conversion.md)

### Acceso a Metadatos

| ID | Método | Tipo | Propósito |
|---|---|---|---|
| BE::get-properties | `getProperties()` | Static | Obtener mapa {key: name} |
| BE::get-property-type | `getPropertyType(key)` | Static | Obtener tipo (Number, String, etc.) |
| BE::get-property-name | `getPropertyName(key)` | Sync | Obtener nombre de propiedad |
| BE::get-view-groups | `getViewGroups()` | Static | Obtener agrupaciones UI |
| BE::is-disabled | `isDisabled(key)` | Sync | Verificar si está deshabilitado |
| BE::is-readonly | `isReadOnly(key)` | Sync | Verificar si es solo lectura |
| BE::is-hide-in-list | `isHideInListView(key)` | Sync | Verificar si oculto en lista |
| BE::is-hide-in-detail | `isHideInDetailView(key)` | Sync | Verificar si oculto en detalle |
| BE::get-formatted-value | `getFormattedValue(key)` | Sync | Obtener valor formateado |

**Referencia Completa:** [metadata-access.md](metadata-access.md)

### Hooks de Ciclo de Vida

**Save Hooks:**
- `beforeSave()` - Antes de guardar
- `onSaving()` - Durante guardado
- `afterSave()` - Después de guardar (éxito)
- `saveFailed()` - Si falla guardado

**Update Hooks:**
- `beforeUpdate()` - Antes de actualizar
- `onUpdating()` - Durante actualización
- `afterUpdate()` - Después de actualizar (éxito)
- `updateFailed()` - Si falla actualización

**Delete Hooks:**
- `beforeDelete()` - Antes de eliminar
- `onDeleting()` - Durante eliminación
- `afterDelete()` - Después de eliminar (éxito)
- `deleteFailed()` - Si falla eliminación

**Get Hooks:**
- `afterGetElement()` - Después de obtener uno
- `getElementFailed()` - Si falla obtener uno
- `afterGetElementList()` - Después de obtener lista
- `getElementListFailed()` - Si falla obtener lista

**Refresh Hooks:**
- `afterRefresh()` - Después de refrescar
- `refreshFailed()` - Si falla refresh

**Validation Hook:**
- `onValidated()` - Después de validar

**Referencia Completa:** [lifecycle-hooks.md](lifecycle-hooks.md)

---

## Flujos de BaseEntity

### Flujo de Guardado

```
save()
  ├─→ validatePersistenceConfiguration()
  ├─→ validateApiMethod()
  ├─→ validateInputs()
  ├─→ beforeSave()
  ├─→ onSaving()
  ├─→ axios.post() o axios.put()
  ├─→ mapFromPersistentKeys()
  ├─→ Actualizar _originalState
  ├─→ afterSave()
  └─→ Mostrar toast éxito
```

### Flujo de Validación

```
validateInputs()
  ├─→ Application.eventBus.emit('validate-inputs')
  ├─→ Todos los inputs ejecutan isValidated()
  │   ├─→ Nivel 1: isRequired()
  │   ├─→ Nivel 2: isValidation()
  │   └─→ Nivel 3: isAsyncValidation()
  ├─→ await Promise(100ms)
  └─→ return Application.View.value.isValid
```

### Flujo de Dirty State

```
getDirtyState()
  ├─→ JSON.stringify(_originalState)
  ├─→ JSON.stringify(toPersistentObject())
  └─→ Comparar strings → true/false
```

---

## Búsqueda por Necesidad

### Para Crear/Guardar Entidad

1. `save()` - [crud-operations.md](crud-operations.md)
2. `beforeSave()` - [lifecycle-hooks.md](lifecycle-hooks.md)
3. `validateInputs()` - [validation-system.md](validation-system.md)

### Para Validar Datos

1. `validateInputs()` - [validation-system.md](validation-system.md)
2. `isRequired()` - [validation-system.md](validation-system.md)
3. `isValidation()` - [validation-system.md](validation-system.md)
4. `isAsyncValidation()` - [validation-system.md](validation-system.md)

### Para Detectar Cambios

1. `getDirtyState()` - [state-and-conversion.md](state-and-conversion.md)
2. `resetChanges()` - [state-and-conversion.md](state-and-conversion.md)
3. `_originalState` - [base-entity-core.md](base-entity-core.md)

### Para Leer Metadatos

1. `getProperties()` - [metadata-access.md](metadata-access.md)
2. `getPropertyType()` - [metadata-access.md](metadata-access.md)
3. `getViewGroups()` - [metadata-access.md](metadata-access.md)

### Para Integrar con API

1. `save()` - [crud-operations.md](crud-operations.md)
2. `mapToPersistentKeys()` - [persistence-methods.md](persistence-methods.md)
3. `mapFromPersistentKeys()` - [persistence-methods.md](persistence-methods.md)

---

## Propiedades Internas Críticas

| Propiedad | Tipo | Propósito | Visibilidad |
|---|---|---|---|
| `_originalState` | Object | Estado original para dirty detection | Protected |
| `_isSaving` | Boolean | Flag de guardado en progreso | Protected |
| `_isUpdating` | Boolean | Flag de actualización en progreso | Protected |
| `_isDeleting` | Boolean | Flag de eliminación en progreso | Protected |

**Referencia:** [base-entity-core.md](base-entity-core.md)

---

## Relación con Decoradores

BaseEntity lee metadatos almacenados por decoradores:

| Decorador | Método Lector en BaseEntity |
|---|---|
| @PropertyName | `getProperties()`, `getPropertyType()` |
| @Required | `isRequired()`, `requiredMessage()` |
| @Validation | `isValidation()`, `validationMessage()` |
| @AsyncValidation | `isAsyncValidation()`, `asyncValidationMessage()` |
| @ViewGroup | `getViewGroups()` |
| @Disabled | `isDisabled()` |
| @ReadOnly | `isReadOnly()` |
| @HideInListView | `isHideInListView()` |
| @HideInDetailView | `isHideInDetailView()` |
| @DisplayFormat | `getFormattedValue()` |

**Referencia:** [metadata-access.md](metadata-access.md)

---

## Relación con Application

BaseEntity consume servicios de Application:

| Servicio Application | Uso en BaseEntity |
|---|---|
| `axiosInstance` | Operaciones HTTP (save, update, delete, get) |
| `ApplicationUIService.showToast()` | Notificaciones de éxito |
| `ApplicationUIService.showLoadingMenu()` | Loading durante operaciones |
| `ApplicationUIService.openConfirmationMenu()` | Errores y confirmaciones |
| `eventBus.emit('validate-inputs')` | Disparar validación global |

**Referencia:** [crud-operations.md](crud-operations.md), [validation-system.md](validation-system.md)

---

## Relación con Contratos

### Contrato Principal (CORE)

- **CORE-3.1.A3:** BaseEntity genera UI desde metadatos
- **CORE-4.3:** BaseEntity es capa 3 de arquitectura
- **CORE-6.2:** Cambios a BaseEntity requieren autorización

### Framework Overview (FWK)

- **FWK-4.6:** Especificación completa de BaseEntity
- **FWK-5.5:** Flujo de interacción del usuario con BaseEntity

### Flow Architecture (FLOW)

- **FLOW-5.6:** Flujo de persistencia detallado
- **FLOW-5.5:** Flujo de validación detallado

---

## Referencias Cruzadas

### Documentación Relacionada

- **Decoradores:** [../01-decorators/README.md](../01-decorators/README.md) - Sistema de metadatos
- **Application:** [../03-application/README.md](../03-application/README.md) - Orquestador global
- **Tutorial CRUD:** [../../tutorials/01-basic-crud.md](../../tutorials/01-basic-crud.md) - Uso práctico
- **Tutorial Validations:** [../../tutorials/02-validations.md](../../tutorials/02-validations.md) - Validaciones avanzadas

### Código Fuente

- **Implementación:** `/src/entities/base_entity.ts`
- **Tipos:** `/src/types/property_type.ts`

---

**Última Actualización:** 13 de Febrero, 2026  
**Total Especificaciones:** 9  
**Mantenimiento:** Actualizar al modificar BaseEntity
