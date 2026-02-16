# Sistema de Decoradores - Índice Semántico

## Proposito

Centralizar navegación y referencia semántica de los decoradores del framework.

## Ultima Actualizacion

16 de Febrero, 2026

**Propósito:** Índice completo de los 31 decoradores del framework  
**Última Actualización:** 13 de Febrero,  2026  
**ID Base:** DEC

---

## Propósito

Centralizar navegación y referencia semántica de los decoradores del framework.

## Contrato de Tipado Estricto

- Las implementaciones de decoradores en `src/decorations/**/*.ts` no deben usar `any`.
- Para metadatos dinámicos usar `unknown` o `Record<PropertyKey, unknown>`.
- Las firmas de `PropertyDecorator` deben tipar `target` como `object`.
- Constructores genéricos deben tiparse con `unknown[]` en lugar de `any[]`.

## Elementos

- [property-name-decorator.md](property-name-decorator.md)
- [required-decorator.md](required-decorator.md)
- [module-name-decorator.md](module-name-decorator.md)

## Enlaces Estructurados

- [Índice de Capas](../README.md)
- [BaseEntity](../02-base-entity/README.md)
- [Application](../03-application/README.md)

## Última Actualización

16 de Febrero, 2026

---

## Categorización de Decoradores

### Decoradores de Propiedad (11)

| ID | Decorador | Archivo | Descripción | Obligatorio |
|---|---|---|---|---|
| DEC::property-name | @PropertyName | [property-name-decorator.md](property-name-decorator.md) | Define nombre y tipo de propiedad | ✓ SÍ |
| DEC::property-index | @PropertyIndex | [property-index-decorator.md](property-index-decorator.md) | Orden de renderizado en UI | Recomendado |
| DEC::default-property | @DefaultProperty | [default-property-decorator.md](default-property-decorator.md) | Identificador por defecto | Para persistencia |
| DEC::primary-property | @PrimaryProperty | [primary-property-decorator.md](primary-property-decorator.md) | Clave primaria | Para persistencia |
| DEC::unique-property | @UniquePropertyKey | [unique-decorator.md](unique-decorator.md) | Clave única para URLs | Para persistencia |
| DEC::tab-order | @TabOrder | [tab-order-decorator.md](tab-order-decorator.md) | Orden de tabulación | Opcional |
| DEC::css-column | @CSSColumnClass | [css-column-class-decorator.md](css-column-class-decorator.md) | Ancho columna en tabla | Opcional |
| DEC::display-format | @DisplayFormat | [display-format-decorator.md](display-format-decorator.md) | Formato de visualización | Opcional |
| DEC::help-text | @HelpText | [help-text-decorator.md](help-text-decorator.md) | Texto de ayuda usuario | Opcional |
| DEC::mask | @Mask | [mask-decorator.md](mask-decorator.md) | Máscara de entrada | Opcional |
| DEC::string-type | @StringTypeDef | [string-type-decorator.md](string-type-decorator.md) | Subtipo: EMAIL, PASSWORD, etc. | Para strings |

### Decoradores de Validación (3)

| ID | Decorador | Archivo | Descripción | Uso |
|---|---|---|---|---|
| DEC::required | @Required | [required-decorator.md](required-decorator.md) | Campo obligatorio | Validación básica |
| DEC::validation | @Validation | [validation-decorator.md](validation-decorator.md) | Validación síncrona custom | Validación avanzada |
| DEC::async-validation | @AsyncValidation | [async-validation-decorator.md](async-validation-decorator.md) | Validación asíncrona (API) | Validación remota |

### Decoradores de UI/Layout (8)

| ID | Decorador | Archivo | Descripción | Uso |
|---|---|---|---|---|
| DEC::view-group | @ViewGroup | [view-group-decorator.md](view-group-decorator.md) | Agrupación de campos | Organizar formularios |
| DEC::view-group-row | @ViewGroupRowDecorator | [view-group-row-decorator.md](view-group-row-decorator.md) | Layout de filas | Organizar layout |
| DEC::hide-list | @HideInListView | [hide-in-list-view-decorator.md](hide-in-list-view-decorator.md) | Ocultar en tabla | Control visibilidad |
| DEC::hide-detail | @HideInDetailView | [hide-in-detail-view-decorator.md](hide-in-detail-view-decorator.md) | Ocultar en formulario | Control visibilidad |
| DEC::disabled | @Disabled | [disabled-decorator.md](disabled-decorator.md) | Deshabilitar campo | Estado campo |
| DEC::readonly | @ReadOnly | [readonly-decorator.md](readonly-decorator.md) | Solo lectura | Estado campo |
| DEC::module-custom | @ModuleCustomComponents | [module-custom-components-decorator.md](module-custom-components-decorator.md) | Componentes custom | Personalización |
| DEC::unique | @Unique | [unique-decorator.md](unique-decorator.md) | Valor único | Validación unicidad |

### Decoradores de Módulo (8)

| ID | Decorador | Archivo | Descripción | Obligatorio |
|---|---|---|---|---|
| DEC::module-name | @ModuleName | [module-name-decorator.md](module-name-decorator.md) | Nombre del módulo | ✓ SÍ |
| DEC::module-icon | @ModuleIcon | [module-icon-decorator.md](module-icon-decorator.md) | Icono del módulo | Recomendado |
| DEC::module-permission | @ModulePermission | [module-permission-decorator.md](module-permission-decorator.md) | Permisos requeridos | Seguridad |
| DEC::module-list | @ModuleListComponent | [module-list-component-decorator.md](module-list-component-decorator.md) | Vista lista custom | Personalización |
| DEC::module-detail | @ModuleDetailComponent | [module-detail-component-decorator.md](module-detail-component-decorator.md) | Vista detalle custom | Personalización |
| DEC::module-default | @ModuleDefaultComponent | [module-default-component-decorator.md](module-default-component-decorator.md) | Vista por defecto custom | Personalización |
| DEC::persistent-key | @PersistentKey | [persistent-key-decorator.md](persistent-key-decorator.md) | Mapeo claves API | Para persistencia |
| DEC::default-property-dec | @DefaultProperty | [default-property-decorator.md](default-property-decorator.md) | Propiedad identificadora | Para módulo |

### Decoradores de API/Persistencia (4)

| ID | Decorador | Archivo | Descripción | Obligatorio |
|---|---|---|---|---|
| DEC::api-endpoint | @ApiEndpoint | [api-endpoint-decorator.md](api-endpoint-decorator.md) | URL endpoint API | ✓ Para persistencia |
| DEC::api-methods | @ApiMethods | [api-methods-decorator.md](api-methods-decorator.md) | Métodos HTTP permitidos | ✓ Para persistencia |
| DEC::persistent | @Persistent | [persistent-decorator.md](persistent-decorator.md) | Habilitar persistencia | ✓ Para CRUD API |
| DEC::persistent-key | @PersistentKey | [persistent-key-decorator.md](persistent-key-decorator.md) | Mapeo server↔client keys | Cuando difieren |

---

## Decoradores Obligatorios por Escenario

### Entidad Básica (Sin Persistencia)

```typescript
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Name', String)
    @Required(true)
    name!: string;
}
```

**Decoradores mínimos:**
- `@ModuleName` (clase)
- `@PropertyName` (propiedades)

### Entidad Persistente (Con API)

```typescript
@ModuleName('Products')
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
@PrimaryProperty('id')
@DefaultProperty('name')
@UniquePropertyKey('id')
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Name', String)
    @Required(true)
    name!: string;
}
```

**Decoradores obligatorios:**
- `@ModuleName` (clase)
- `@ApiEndpoint` (clase)
- `@ApiMethods` (clase)
- `@Persistent()` (clase)
- `@PrimaryProperty` (clase)
- `@DefaultProperty` (clase)
- `@UniquePropertyKey` (clase)
- `@PropertyName` (propiedades)

---

## Búsqueda por Función

### Para Definir Estructura

- `@PropertyName` - Define nombre y tipo (**FUNDAMENTAL**)
- `@PropertyIndex` - Define orden de campos
- `@ModuleName` - Define nombre de módulo

### Para Validar

- `@Required` - Campo obligatorio
- `@Validation` - Validación custom síncrona
- `@AsyncValidation` - Validación remota asíncrona
- `@Unique` - Valor único

### Para Organizar UI

- `@ViewGroup` - Agrupar campos en secciones
- `@ViewGroupRowDecorator` - Layout en filas
- `@HelpText` - Texto de ayuda
- `@DisplayFormat` - Formato de visualización
- `@HideInListView` / `@HideInDetailView` - Control visibilidad

### Para Controlar Estado

- `@Disabled` - Deshabilitar condicional
- `@ReadOnly` - Solo lectura
- `@Mask` - Máscara de entrada

### Para Integrar con API

- `@ApiEndpoint` - URL del endpoint
- `@ApiMethods` - Métodos HTTP permitidos
- `@Persistent` - Habilitar persistencia
- `@PersistentKey` - Mapeo de claves

### Para Personalizar Componentes

- `@ModuleListComponent` - Vista lista custom
- `@ModuleDetailComponent` - Vista detalle custom
- `@ModuleDefaultComponent` - Vista defecto custom
- `@ModuleCustomComponents` - Componentes custom

---

## Símbolos de Metadatos

### Símbolos de Propiedad

| Decorador | Símbolo | Ubicación en Prototipo |
|---|---|---|
| @PropertyName | `PROPERTY_NAME_KEY` | `proto[Symbol]` |
| @PropertyIndex | `PROPERTY_INDEX_KEY` | `proto[Symbol]` |
| @Required | `REQUIRED_KEY` | `proto[Symbol]` |
| @Validation | `VALIDATION_KEY` | `proto[Symbol]` |
| @AsyncValidation | `ASYNC_VALIDATION_KEY` | `proto[Symbol]` |
| @ViewGroup | `VIEW_GROUP_KEY` | `proto[Symbol]` |
| @Disabled | `DISABLED_KEY` | `proto[Symbol]` |
| @ReadOnly | `READONLY_KEY` | `proto[Symbol]` |

### Símbolos de Clase

| Decorador | Símbolo | Ubicación |
|---|---|---|
| @ModuleName | `MODULE_NAME_KEY` | `target` |
| @ApiEndpoint | `API_ENDPOINT_KEY` | `target` |
| @Persistent | `PERSISTENT_KEY` | `target` |

---

## Funciones Accesoras en BaseEntity

Cada decorador tiene métodos accesores en BaseEntity:

| Decorador | Método Estático | Método de Instancia |
|---|---|---|
| @PropertyName | `getProperties()` | `getPropertyName(key)` |
| @PropertyIndex | `getPropertyIndexes()` | - |
| @Required | - | `isRequired(key)` |
| @Validation | - | `isValidation(key)` |
| @AsyncValidation | - | `isAsyncValidation(key)` |
| @ViewGroup | `getViewGroups()` | - |
| @Disabled | - | `isDisabled(key)` |
| @ReadOnly | - | `isReadOnly(key)` |

---

## Dependencias entre Decoradores

### Dependencias Fuertes

- `@Persistent` requiere `@ApiEndpoint`
- `@ApiEndpoint` requiere `@Persistent`
- `@PersistentKey` requiere `@Persistent`
- Persistencia requiere `@PrimaryProperty`, `@DefaultProperty`, `@UniquePropertyKey`

### Dependencias Recomendadas

- `@Required` se beneficia de `@HelpText`
- `@Validation` se usa con `@Required`
- `@ViewGroup` se usa con multiple `@PropertyName`

---

## Impacto en UI

### Renderizado de Inputs

| Decorador | Impacto en Input |
|---|---|
| @PropertyName | Determina tipo de input (Number, String, Date, Boolean, Object, Array) |
| @StringTypeDef | Cambia a EmailInput, PasswordInput o TextArea |
| @Required | Agrega asterisco rojo y validación |
| @HelpText | Muestra texto debajo del input |
| @Disabled | Input deshabilitado (gris) |
| @ReadOnly | Input sin edición |
| @Mask | Aplica máscara durante escritura |

### Organización de Formularios

| Decorador | Impacto en Layout |
|---|---|
| @ViewGroup | Agrupa campos en secciones colapsables |
| @ViewGroupRowDecorator | Organiza campos en filas |
| @PropertyIndex | Define orden vertical de campos |
| @TabOrder | Define orden de tabulación |

### Visibilidad

| Decorador | Impacto |
|---|---|
| @HideInListView | No aparece en tabla |
| @HideInDetailView | No aparece en formulario |

---

## Relación con Contratos

### Contrato Principal (CORE)

Todos los decoradores están sujetos a:
- **CORE-6.2:** Cambios mayores requieren autorización
- **CORE-6.3:** Documentación mandatoria
- **CORE-6.4:** Actualización de índices

### Contrato UI (UI)

Decoradores de UI deben cumplir:
- **UI-6.3:** Sistema de tokens CSS
- **UI-6.4:** Anti-hardcode

### Contrato Enforcement (ENF)

Nuevos decoradores deben:
- **ENF-6.3:** Pasar VCC (Validación Cruzada Capas)
- **ENF-6.2:** Incluirse en AOM

---

## Referencias Cruzadas

### Documentación Relacionada

- **BaseEntity:** [../02-base-entity/metadata-access.md](../02-base-entity/metadata-access.md) - Lectura de metadatos
- **Framework Overview:** [../../01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md) - Sección 4.8
- **Tutorials:** [../../tutorials/](../../tutorials/) - Ejemplos de uso

### Código Fuente

- **Implementación:** `/src/decorations/`
- **Símbolos:** `/src/decorations/index.ts`
- **BaseEntity:** `/src/entities/base_entity.ts`

---

**Última Actualización:** 13 de Febrero, 2026  
**Total Decoradores Documentados:** 31  
**Mantenimiento:** Actualizar al crear/modificar decoradores
