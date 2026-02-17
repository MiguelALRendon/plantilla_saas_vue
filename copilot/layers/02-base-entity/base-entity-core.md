# BaseEntity Core

## 1. Propósito

BaseEntity es la clase abstracta base del sistema, definida como el único punto de herencia para todas las entidades de negocio. Proporciona infraestructura completa para gestión de estado, operaciones CRUD, validación multi-nivel, acceso a metadatos de decoradores, hooks de ciclo de vida, transformación de claves para persistencia y integración con el sistema Application. Toda entidad del dominio debe heredar de BaseEntity para obtener automáticamente estas capacidades.

## 2. Alcance

**Responsabilidades cubiertas:**
- Gestión de estado interno (tracking de cambios, snapshot de estado original)
- Operaciones CRUD completas (save, update, delete, getElement, getElementList)
- Validación de tres niveles (required, sincrónica, asincrónica)
- Acceso a metadatos de decoradores aplicados a propiedades y clase
- Hooks de ciclo de vida para todas las operaciones
- Mapeo bidireccional entre claves de entidad y claves persistentes
- Integración con singleton Application para navegación y validación UI
- Conversión entre formatos de objeto (toObject, toPersistentObject)
- Detección de instancias nuevas versus existentes

**Límites del alcance:**
- No implementa lógica HTTP (delegada a métodos CRUD)
- No contiene metadatos de decoradores (los lee vía Reflect)
- No define estructura de propiedades (responsabilidad de subclases)
- No maneja enrutamiento (usa Application como interfaz)

## Contrato de Tipado Estricto (2026-02-16)

- `src/entities/base_entity.ts` no debe usar `any` en firmas, casts ni `catch`.
- El tipado dinámico del sistema de metadatos debe usar `unknown` + `Record<PropertyKey, unknown>`.
- El acceso a propiedades dinámicas de instancia debe tiparse con `Record<string, unknown>`.
- El manejo de errores en CRUD debe usar `unknown` y normalización de mensaje segura.

## 3. Definiciones Clave

**BaseEntity:** Clase abstracta que sirve como superclase única para todas las entidades del sistema. Declarada en `src/entities/base_entity.ts` (líneas 1-962).

**Estado Original (_originalState):** Snapshot inmutable del estado de la entidad en el momento de construcción o tras operación exitosa, utilizado para detección de cambios.

**Dirty State:** Condición donde el estado actual de una entidad difiere de su estado original, detectado mediante comparación JSON entre _originalState y estado actual.

**Persistent Keys:** Sistema de mapeo que traduce nombres de propiedades TypeScript a nombres esperados por API backend, configurado mediante decorator @PersistentKey.

**Primary Property:** Propiedad marcada con @PrimaryProperty que actúa como identificador único de la entidad.

**Default Property:** Propiedad marcada con @DefaultProperty que sirve como representación textual principal de la entidad.

**Unique Property:** Propiedad marcada con @UniquePropertyKey utilizada en construcción de rutas y URLs.

**EmptyEntity:** Clase especial que hereda de BaseEntity y sobrescribe isNull() para retornar true, representando entidades vacías o nulas.

## 4. Descripción Técnica

### 4.1. Estructura de Clase

BaseEntity se declara como clase abstracta exportada con la siguiente configuración:

```typescript
export abstract class BaseEntity {
    [key: string]: any;
    public _isLoading: boolean = false;
    public _originalState?: Record<string, any>;
    public _isSaving?: boolean = false;
    public entityObjectId?: string;
}
```

**Propiedades internas:**
- `[key: string]: any` - Index signature que permite propiedades dinámicas en subclases
- `_isLoading` - Flag booleano que indica si la entidad está cargando datos
- `_originalState` - Record opcional que almacena snapshot del estado para dirty checking
- `_isSaving` - Flag booleano que indica si operación de guardado está en progreso
- `entityObjectId` - String opcional para identificador único del objeto de entidad

### 4.2. Constructor

```typescript
constructor(data: Record<string, any>) {
    Object.assign(this, data);
    this._originalState = structuredClone(this.toPersistentObject());
}
```

El constructor recibe un objeto de datos plano, asigna todas sus propiedades a la instancia mediante Object.assign(), y crea un snapshot estructural profundo (structuredClone) del objeto persistente generado, almacenándolo en _originalState para permitir detección posterior de cambios.

### 4.3. Gestión de Estado

**setLoading(): void**  
Establece _isLoading en true.

**clearLoadingState(): void**  
Establece _isLoading en false, indicando que la carga de datos ha finalizado.

**getLoadingState(): boolean**  
Retorna el valor actual de _isLoading.

**isNull(): boolean**  
Retorna false en BaseEntity. EmptyEntity sobrescribe este método para retornar true.

### 4.4. Conversión de Datos

**toObject(): Record<string, any>**  
Convierte la entidad completa a objeto JavaScript plano incluyendo todas las propiedades internas.

**toPersistentObject(): Record<string, any>**  
Convierte la entidad a objeto conteniendo únicamente propiedades marcadas con @PropertyName, excluyendo propiedades internas como _isLoading.

Implementación:
```typescript
public toPersistentObject(): Record<string, any> {
    const result: Record<string, any> = {};
    const allProperties = (this.constructor as typeof BaseEntity).getAllPropertiesNonFilter();
    const propertyKeys = Object.keys(allProperties);
    
    for (const key of propertyKeys) {
        result[key] = this[key];
    }
    
    return result;
}
```

### 4.5. Propiedades Especiales

**getDefaultPropertyValue(): any**  
Retorna el valor de la propiedad marcada con @DefaultProperty.

**getPrimaryPropertyValue(): any**  
Retorna el valor de la propiedad marcada con @PrimaryProperty (clave primaria).

**getPrimaryPropertyKey(): string | undefined**  
Retorna el nombre de la propiedad marcada como primary.

**getUniquePropertyValue(): any**  
Retorna el valor de la propiedad marcada con @UniquePropertyKey (usada en construcción de URLs).

**getUniquePropertyKey(): string | undefined**  
Retorna el nombre de la propiedad única.

### 4.6. Sistema de Claves Persistentes

El sistema @PersistentKey permite mapear nombres de propiedades TypeScript a nomenclaturas diferentes esperadas por API backend.

**getPersistentKeys(): Record<string, string>**  
Retorna objeto completo de mapeo con estructura { propertyKey: 'persistentKey' }.

**getPersistentKeyByPropertyKey(propertyKey: string): string | undefined**  
Obtiene nombre persistente correspondiente a una propiedad TypeScript.

**getPropertyKeyByPersistentKey(persistentKey: string): string | undefined**  
Obtiene nombre de propiedad TypeScript desde nombre persistente de API.

**mapToPersistentKeys(data: Record<string, any>): Record<string, any>**  
Transforma objeto usando nombres TypeScript a nombres persistentes (dirección entidad → API).

**mapFromPersistentKeys(data: Record<string, any>): Record<string, any>**  
Transforma objeto usando nombres persistentes a nombres TypeScript (dirección API → entidad).

Todos estos métodos existen también como métodos estáticos en la clase.

### 4.7. Detección de Cambios

**getDirtyState(): boolean**  
Detecta cambios sin guardar comparando estado actual con _originalState mediante serialización JSON.

Implementación:
```typescript
public getDirtyState(): boolean {
    var snapshotJson = JSON.stringify(this._originalState);
    var actualJson = JSON.stringify(this.toPersistentObject());
    console.log('Snapshot:', snapshotJson);
    console.log('Actual:', actualJson);
    console.log('Dirty State:', snapshotJson !== actualJson);
    return snapshotJson !== actualJson;
}
```

**resetChanges(): void**  
Descarta cambios actuales y restaura estado desde _originalState usando structuredClone y Object.assign.

### 4.8. Verificación de Nueva Instancia

**isNew(): boolean**  
Determina si instancia es nueva (sin persistir) verificando si la propiedad primary es undefined o null.

```typescript
public isNew(): boolean {
    return this.getPrimaryPropertyValue() === undefined || 
           this.getPrimaryPropertyValue() === null;
}
```

### 4.9. Validaciones de Configuración

**validateModuleConfiguration(): boolean**  
Valida presencia de decoradores obligatorios: @ModuleName, @ModuleIcon, @DefaultProperty, @PrimaryProperty. Retorna true si configuración es válida, false y muestra diálogo de error si falta algún decorador.

**validatePersistenceConfiguration(): boolean**  
Extiende validateModuleConfiguration() añadiendo verificación de @UniquePropertyKey, @ApiEndpoint y @ApiMethods.

**validateApiMethod(method: HttpMethod): boolean**  
Verifica si método HTTP específico está permitido según configuración @ApiMethods. Muestra error si método no está autorizado.

### 4.10. Persistencia

**isPersistent(): boolean**  
Verifica si la entidad tiene decorador @Persistent() aplicado.

**get getSaving(): boolean**  
Getter que retorna estado de _isSaving.

### 4.11. Lifecycle Hooks

BaseEntity provee métodos vacíos que subclases pueden sobrescribir:

**Save hooks:** beforeSave(), onSaving(), afterSave(), saveFailed()  
**Update hooks:** beforeUpdate(), onUpdating(), afterUpdate(), updateFailed()  
**Delete hooks:** beforeDelete(), onDeleting(), afterDelete(), deleteFailed()  
**Get hooks:** afterGetElement(), getElementFailed(), afterGetElementList(), getElementListFailed()  
**Refresh hooks:** afterRefresh(), refreshFailed()  
**Validation hooks:** onValidated()

Documentación detallada en `lifecycle-hooks.md`.

### 4.12. Integración con Application

**validateInputs(): Promise<boolean>**  
Valida todos los inputs del formulario actual siguiendo este flujo:

```typescript
public async validateInputs(): Promise<boolean> {
    Application.View.value.isValid = true;
    Application.ApplicationUIService.showLoadingMenu();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    Application.eventBus.emit('validate-inputs');
    
    const keys = this.getKeys();
    const asyncValidationPromises = keys.map(key => this.isAsyncValidation(key));
    await Promise.all(asyncValidationPromises);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    this.onValidated();
    Application.ApplicationUIService.hideLoadingMenu();
    
    return Application.View.value.isValid;
}
```

Proceso: establece View.isValid en true, muestra loading, emite evento 'validate-inputs' al eventBus para que componentes ejecuten validación, espera validaciones asíncronas, ejecuta hook onValidated(), oculta loading, retorna estado de validación.

### 4.13. Método Estático de Creación

**static createNewInstance<T extends BaseEntity>(): T**  
Crea nueva instancia vacía de la entidad. Sintaxis: `Product.createNewInstance()` equivalente a `new Product({})`.

### 4.14. EmptyEntity

```typescript
export class EmptyEntity extends BaseEntity {
    override isNull(): boolean {
        return true;
    }
}
```

Clase especial que representa entidad nula o vacía, sobrescribiendo isNull() para retornar true.

### 4.15. Métodos de Acceso a Metadatos

Los siguientes métodos proveen acceso a metadatos de decoradores (documentación completa en `metadata-access.md`):

**Propiedades:** getKeys(), getArrayKeys(), getPropertyIndices(), getCSSClasses()  
**Módulo:** getModuleName(), getModulePermission(), getModuleIcon(), getModuleListComponent(), getModuleDetailComponent(), getModuleDefaultComponent(), getModuleCustomComponents()  
**Tipos:** getPropertyType(), getArrayPropertyType()  
**Validaciones:** isRequired(), requiredMessage(), isValidation(), validationMessage(), isAsyncValidation(), asyncValidationMessage(), isDisabled(), isReadOnly()  
**UI:** getViewGroups(), getViewGroupRows(), getStringType(), getDisplayFormat(), getFormattedValue(), getHelpText(), getTabOrders(), isHideInDetailView(), isHideInListView()  
**API:** getApiEndpoint(), getApiMethods(), isApiMethodAllowed()

## 5. Flujo de Funcionamiento

### 5.1. Flujo de Instanciación

```
1. Constructor recibe data: Record<string, any>
2. Object.assign(this, data) asigna propiedades
3. toPersistentObject() genera objeto con propiedades @PropertyName
4. structuredClone() crea copia profunda
5. Copia se almacena en _originalState
6. Instancia lista para uso
```

### 5.2. Flujo de Detección de Cambios

```
1. Usuario modifica propiedad de entidad
2. getDirtyState() ejecuta:
   a. Serializa _originalState a JSON
   b. Ejecuta toPersistentObject() en estado actual
   c. Serializa resultado a JSON
   d. Compara strings JSON
3. Retorna true si difieren, false si son idénticos
```

### 5.3. Flujo de Validación de Inputs

```
1. validateInputs() llamado (típicamente antes de save)
2. Application.View.value.isValid = true
3. Mostrar loading screen
4. Emitir evento 'validate-inputs' a eventBus
5. Componentes de input ejecutan validaciones síncronas
6. Recopilar promises de validaciones asíncronas
7. await Promise.all() de validaciones asíncronas
8. Ejecutar hook onValidated()
9. Ocultar loading screen
10. Retornar Application.View.value.isValid
```

### 5.4. Flujo de Mapeo de Claves

**Entidad → API (envío):**
```
1. Preparar datos de entidad
2. mapToPersistentKeys(data) ejecuta:
   a. Obtener mapeo de claves persistentes
   b. Para cada propiedad en data:
      - Si existe mapeo, usar clave persistente
      - Si no existe mapeo, mantener clave original
3. Objeto resultante listo para envío HTTP
```

**API → Entidad (recepción):**
```
1. Recibir respuesta de API
2. mapFromPersistentKeys(data) ejecuta:
   a. Obtener mapeo inverso
   b. Para cada clave en data:
      - Si existe mapeo inverso, usar clave TypeScript
      - Si no existe mapeo, mantener clave original
3. Objeto resultante listo para asignación a entidad
```

## 6. Reglas Obligatorias

1. **Herencia única:** Toda entidad del dominio DEBE heredar directamente de BaseEntity. No se permite herencia de clases intermedias distintas de BaseEntity.

2. **Decoradores mínimos:** Toda subclase de BaseEntity DEBE declarar @ModuleName, @ModuleIcon, @DefaultProperty y @PrimaryProperty antes de usar operaciones CRUD.

3. **Persistencia:** Toda entidad que requiera operaciones CRUD DEBE declarar @Persistent(), @UniquePropertyKey, @ApiEndpoint y @ApiMethods.

4. **Constructor:** Subclases que sobrescriban constructor DEBEN llamar super(data) como primera línea.

5. **Hooks vacíos:** Si se sobrescribe un lifecycle hook, la implementación puede omitir la llamada a super.método() ya que la implementación base está vacía.

6. **Preservación de _originalState:** Código externo NO DEBE modificar directamente _originalState. Solo BaseEntity gestiona esta propiedad.

7. **Métodos estáticos:** Métodos estáticos de acceso a metadatos DEBEN usarse con contexto de clase (Product.getModuleName()), no con instancia.

8. **Validación antes de persistencia:** save(), update() y delete() DEBEN ejecutar validatePersistenceConfiguration() antes de realizar operación HTTP.

9. **Formato de datos:** toPersistentObject() DEBE usarse para generar datos enviados a API. toObject() NO DEBE usarse para persistencia.

10. **Detección de instancia nueva:** Lógica que distingue creación de actualización DEBE usar isNew(), no verificar propiedades manualmente.

## 7. Prohibiciones

1. **NO heredar de múltiples clases:** TypeScript no soporta herencia múltiple. BaseEntity NO DEBE ser combinada con otras superclases.

2. **NO modificar propiedades internas:** Propiedades con prefijo _ (_isLoading, _originalState, _isSaving) NO DEBEN ser modificadas fuera de BaseEntity excepto mediante métodos provistos.

3. **NO crear instancias de BaseEntity directamente:** BaseEntity es abstracta. NO DEBE instanciarse directamente (new BaseEntity() es error de compilación).

4. **NO omitir validación de configuración:** Operaciones CRUD NO DEBEN ejecutarse sin primero validar configuración de decoradores.

5. **NO usar JSON.parse en _originalState:** Manipulación de _originalState NO DEBE hacerse directamente. Usar resetChanges() para restaurar estado.

6. **NO sobrescribir métodos de metadatos:** Métodos como getKeys(), getPrimaryPropertyKey(), etc. NO DEBEN ser sobrescritos en subclases. Estos leen metadatos de decoradores.

7. **NO usar toObject() para persistencia:** Método toObject() incluye propiedades internas y NO DEBE usarse para enviar datos a API.

8. **NO confundir Default y Primary:** @DefaultProperty es para display, @PrimaryProperty es identificador. NO son intercambiables.

9. **NO emitir 'validate-inputs' manualmente:** Evento 'validate-inputs' SOLO DEBE emitirse mediante validateInputs(). Emisión manual puede causar inconsistencias.

10. **NO asumir presencia de entityObjectId:** Propiedad entityObjectId es opcional y NO DEBE asumirse presente sin verificación.

## 8. Dependencias

**Internas:**
- `Application` (singleton) - Navegación, eventBus, UIService, View state
- `EmptyEntity` (clase) - Entidad especial para representar null
- Decorators - Sistema completo de decoradores para metadatos
- `confMenuType` - Enum para tipos de menús de confirmación

**Externas:**
- TypeScript Reflect API - Lectura de metadatos de decoradores
- `structuredClone()` - Clonado profundo de objetos (API nativa)
- `JSON.stringify()` / `JSON.parse()` - Serialización para comparación

**Archivos:**
- `src/entities/base_entity.ts` - Definición de BaseEntity
- `src/decorations/` - Todos los decoradores aplicables
- `src/models/Application.ts` - Singleton Application

## 9. Relaciones

**Superclase de:**
- Todas las entidades del dominio (Product, User, Order, etc.)
- EmptyEntity (caso especial)

**Colabora con:**
- Application - Para navegación entre vistas, validación UI y servicios UI
- EventBus - Para emisión de eventos de validación
- Decorators - Para lectura de metadatos de configuración

**Utilizado por:**
- Componentes de formulario - Para validación y acceso a metadatos
- Componentes de tabla - Para obtención de datos y configuración de columnas
- Application - Para operaciones de navegación y gestión de vista actual
- Router - Para construcción de URLs con unique property

**Extiende funcionalidad de:**
- Ninguna (es la clase base del sistema)

**Proporciona base para:**
- Sistema CRUD completo (documentado en `crud-operations.md`)
- Sistema de validación (documentado en `validation-system.md`)
- Sistema de hooks (documentado en `lifecycle-hooks.md`)
- Sistema de metadatos (documentado en `metadata-access.md`)

## 10. Notas de Implementación

**Uso de structuredClone:**  
structuredClone() es API nativa moderna. Si se requiere compatibilidad con entornos antiguos, considerar polyfill o alternativa como deep cloning manual.

**Performance de getDirtyState:**  
Método serializa objetos completos a JSON en cada llamada. Para entidades grandes con detección frecuente, considerar estrategia de dirty flags por propiedad.

**Index signature [key: string]: any:**  
Necesario para permitir propiedades dinámicas pero reduce seguridad de tipos. Subclases deben declarar propiedades explícitamente con tipos específicos.

**Validación asíncrona en validateInputs:**  
Método espera todas las validaciones asíncronas en paralelo. Si una validación depende de otra, este comportamiento puede causar problemas.

**Hook onValidated:**  
onValidated() se ejecuta después de todas las validaciones pero NO recibe parámetro indicando si validación fue exitosa. Implementaciones deben consultar Application.View.value.isValid.

**EmptyEntity vs null:**  
Usar EmptyEntity en lugar de null para representar ausencia de entidad permite usar métodos de BaseEntity sin verificaciones de nullability.

**Logs en getDirtyState:**  
Método incluye console.log para debugging. En producción considerar remover o condicionar a flag de desarrollo.

**Métodos estáticos y this:**  
Métodos estáticos usan `this: new (data: Record<string, any>) => T` para tipado correcto al heredar. Sintaxis avanzada de TypeScript.

**mapToPersistentKeys y arrays:**  
Métodos de mapeo funcionan en nivel superficial. Si entidad contiene arrays de objetos anidados que también requieren mapeo, debe implementarse lógica adicional.

**Timeout de 50ms en validateInputs:**  
Delays de 50ms permiten que DOM se actualice y eventos se propaguen. Ajustar según comportamiento observado en producción.

## 11. Referencias Cruzadas

**Documentación relacionada:**
- [crud-operations.md](crud-operations.md) - Implementación de save(), update(), delete(), getElement(), getElementList()
- [validation-system.md](validation-system.md) - Sistema de validación de tres niveles
- [lifecycle-hooks.md](lifecycle-hooks.md) - Hooks de ciclo de vida completos
- [metadata-access.md](metadata-access.md) - Métodos de acceso a metadatos de decoradores
- [persistence-methods.md](persistence-methods.md) - Métodos relacionados con persistencia
- [state-and-conversion.md](state-and-conversion.md) - Gestión de estado y conversión de objetos
- [static-methods.md](static-methods.md) - Métodos estáticos de BaseEntity
- [additional-metadata.md](additional-metadata.md) - Metadatos adicionales

**Decoradores aplicables:**
- [../01-decorators/module-name-decorator.md](../01-decorators/module-name-decorator.md) - @ModuleName
- [../01-decorators/module-icon-decorator.md](../01-decorators/module-icon-decorator.md) - @ModuleIcon
- [../01-decorators/default-property-decorator.md](../01-decorators/default-property-decorator.md) - @DefaultProperty
- [../01-decorators/primary-property-decorator.md](../01-decorators/primary-property-decorator.md) - @PrimaryProperty
- [../01-decorators/persistent-decorator.md](../01-decorators/persistent-decorator.md) - @Persistent
- [../01-decorators/persistent-key-decorator.md](../01-decorators/persistent-key-decorator.md) - @PersistentKey
- [../01-decorators/unique-decorator.md](../01-decorators/unique-decorator.md) - @UniquePropertyKey
- [../01-decorators/api-endpoint-decorator.md](../01-decorators/api-endpoint-decorator.md) - @ApiEndpoint
- [../01-decorators/api-methods-decorator.md](../01-decorators/api-methods-decorator.md) - @ApiMethods
- [../01-decorators/property-name-decorator.md](../01-decorators/property-name-decorator.md) - @PropertyName

**Sistemas relacionados:**
- [../03-application/application-singleton.md](../03-application/application-singleton.md) - Singleton Application
- [../03-application/event-bus.md](../03-application/event-bus.md) - Sistema de eventos
- [../../01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md) - Visión general del framework

**Ejemplos de uso:**
- [../../examples/classic-module-example.md](../../examples/classic-module-example.md) - Ejemplo de entidad completa
- [../../examples/advanced-module-example.md](../../examples/advanced-module-example.md) - Uso avanzado
