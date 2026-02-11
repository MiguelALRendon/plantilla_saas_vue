# 🧬 BaseEntity Core - Motor del Sistema

**Referencias:**
- `crud-operations.md` - Operaciones CRUD
- `validation-system.md` - Sistema de validación
- `lifecycle-hooks.md` - Hooks de ciclo de vida
- `metadata-access.md` - Acceso a metadatos
- `../../01-FRAMEWORK-OVERVIEW.md` - Visión general del framework

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts` (líneas 1-962)  
**Clase:** `export abstract class BaseEntity`

---

## 🎯 Propósito

`BaseEntity` es la **clase madre abstracta** de todas las entidades del sistema. Proporciona:

1. **Gestión de estado** - Tracking de cambios, estado original
2. **CRUD completo** - save(), update(), delete(), getElement(), getElementList()
3. **Validación multi-nivel** - Required, sync, async validations
4. **Acceso a metadatos** - Leer decoradores aplicados
5. **Lifecycle hooks** - beforeSave, afterSave, etc.
6. **Mapeo de claves** - Transformación entidad ↔ API
7. **Utilidades de navegación** - Integración con Application

**Concepto fundamental:** Cada modelo de negocio hereda de BaseEntity y obtiene automáticamente toda esta funcionalidad.

---

## 🏗️ Estructura de la Clase

### Propiedades Internas

```typescript
export abstract class BaseEntity {
    [key: string]: any;                    // Index signature para propiedades dinámicas
    public _isLoading: boolean = false;    // Estado de carga
    public _originalState?: Record<string, any>;  // Estado original para dirty checking
    public _isSaving?: boolean = false;    // Estado de guardado
    public oid?: string;                   // Object ID opcional
}
```

**Explicación:**
- `[key: string]: any` - Permite propiedades dinámicas en las subclases
- `_isLoading` - Controla si la entidad está cargando datos
- `_originalState` - Snapshot del estado inicial para detectar cambios
- `_isSaving` - Indica si una operación de guardado está en progreso
- `oid` - Identificador opcional de objeto

---

## 🔧 Constructor

```typescript
constructor(data: Record<string, any>) {
    Object.assign(this, data);
    this._originalState = structuredClone(this.toPersistentObject());
}
```

**Funcionamiento:**
1. Recibe un objeto de datos
2. Asigna todas las propiedades a la instancia
3. Crea un snapshot del estado inicial en `_originalState`

**Uso:**
```typescript
const product = new Product({
    id: 1,
    name: 'Widget',
    price: 99.99
});
// _originalState = { id: 1, name: 'Widget', price: 99.99 }
```

---

## 📊 Gestión de Estado

### setLoading()

```typescript
public setLoading(): void
```

Marca la entidad como "cargando".

**Uso:**
```typescript
product.setLoading();
// _isLoading = true
```

### loaded()

```typescript
public loaded(): void
```

Marca la entidad como "carga completa".

**Uso:**
```typescript
product.loaded();
// _isLoading = false
```

### getLoadingState()

```typescript
public getLoadingState(): boolean
```

Retorna el estado de carga actual.

**Uso:**
```typescript
if (product.getLoadingState()) {
    // Mostrar spinner
}
```

### isNull()

```typescript
isNull(): boolean
```

Verifica si la entidad es nula. En BaseEntity siempre retorna `false`.  
La clase `EmptyEntity` sobreescribe esto para retornar `true`.

---

## 🔄 Conversión de Datos

### toObject()

```typescript
public toObject(): Record<string, any>
```

Convierte la entidad a un objeto plano JavaScript.

**Uso:**
```typescript
const obj = product.toObject();
// { id: 1, name: 'Widget', price: 99.99, _isLoading: false, ... }
```

### toPersistentObject()

```typescript
public toPersistentObject(): Record<string, any>
```

Convierte la entidad a un objeto que contiene **solo las propiedades con @PropertyName** (excluyendo propiedades internas como `_isLoading`).

**Uso:**
```typescript
const persistentObj = product.toPersistentObject();
// { id: 1, name: 'Widget', price: 99.99 }
// NO incluye: _isLoading, _originalState, etc.
```

**Implementación:**
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

---

## 🔑 Propiedades Especiales

### getDefaultPropertyValue()

```typescript
public getDefaultPropertyValue(): any
```

Retorna el valor de la propiedad marcada con `@DefaultProperty`.

**Uso:**
```typescript
@DefaultProperty('name')
export class Product extends BaseEntity {
    name!: string;
}

product.getDefaultPropertyValue(); // Retorna: 'Widget'
```

### getPrimaryPropertyValue()

```typescript
public getPrimaryPropertyValue(): any
```

Retorna el valor de la propiedad marcada con `@PrimaryProperty` (clave primaria).

**Uso:**
```typescript
@PrimaryProperty('id')
export class Product extends BaseEntity {
    id!: number;
}

product.getPrimaryPropertyValue(); // Retorna: 123
```

### getPrimaryPropertyKey()

```typescript
public getPrimaryPropertyKey(): string | undefined
```

Retorna el **nombre** de la propiedad marcada como primary.

**Uso:**
```typescript
product.getPrimaryPropertyKey(); // Retorna: 'id'
```

### getUniquePropertyValue()

```typescript
public getUniquePropertyValue(): any
```

Retorna el valor de la propiedad marcada con `@UniquePropertyKey` (usado en URLs).

**Uso:**
```typescript
@UniquePropertyKey('id')
export class Product extends BaseEntity {
    id!: number;
}

product.getUniquePropertyValue(); // Retorna: 123
// Se usa en: router.push('/products/123')
```

### getUniquePropertyKey()

```typescript
public getUniquePropertyKey(): string | undefined
```

Retorna el nombre de la propiedad única.

---

## 🗝️ Sistema de Claves Persistentes

### Concepto

El sistema de `@PersistentKey` permite mapear nombres de propiedades de la entidad a nombres diferentes en la API.

**Ejemplo:**
```typescript
@PersistentKey('product_id', 'id')  // API usa 'product_id', entidad usa 'id'
export class Product extends BaseEntity {
    id!: number;
}
```

### getPersistentKeys()

```typescript
public getPersistentKeys(): Record<string, string>
```

Retorna el mapeo completo: `{ propertyKey: 'persistentKey' }`

### getPersistentKeyByPropertyKey()

```typescript
public getPersistentKeyByPropertyKey(propertyKey: string): string | undefined
```

Obtiene el nombre persistente de una propiedad.

**Uso:**
```typescript
product.getPersistentKeyByPropertyKey('id'); // 'product_id'
```

### getPropertyKeyByPersistentKey()

```typescript
public getPropertyKeyByPersistentKey(persistentKey: string): string | undefined
```

Obtiene el nombre de propiedad desde el nombre persistente.

**Uso:**
```typescript
product.getPropertyKeyByPersistentKey('product_id'); // 'id'
```

### mapToPersistentKeys()

```typescript
public mapToPersistentKeys(data: Record<string, any>): Record<string, any>
```

Transforma un objeto usando nombres de propiedad a nombres persistentes (para enviar a API).

**Uso:**
```typescript
const entityData = { id: 123, name: 'Widget' };
const apiData = product.mapToPersistentKeys(entityData);
// { product_id: 123, name: 'Widget' }
```

### mapFromPersistentKeys()

```typescript
public mapFromPersistentKeys(data: Record<string, any>): Record<string, any>
```

Transforma un objeto usando nombres persistentes a nombres de propiedad (al recibir de API).

**Uso:**
```typescript
const apiData = { product_id: 123, name: 'Widget' };
const entityData = product.mapFromPersistentKeys(apiData);
// { id: 123, name: 'Widget' }
```

### Métodos Estáticos

Las mismas funciones existen como métodos estáticos:
```typescript
Product.getPersistentKeys()
Product.mapToPersistentKeys(data)
Product.mapFromPersistentKeys(data)
```

---

## 🔍 Detección de Cambios (Dirty State)

### getDirtyState()

```typescript
public getDirtyState(): boolean
```

Detecta si la entidad tiene cambios sin guardar comparando el estado actual con `_originalState`.

**Implementación:**
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

**Uso:**
```typescript
product.name = 'Modified Name';

if (product.getDirtyState()) {
    console.log('Hay cambios sin guardar');
}
```

**Cuándo se usa:**
- Antes de navegar a otra vista (confirmación de salir sin guardar)
- Para habilitar/deshabilitar botón "Save"
- Para advertir al usuario

### resetChanges()

```typescript
public resetChanges(): void
```

Descarta todos los cambios y restaura el estado original.

**Implementación:**
```typescript
public resetChanges(): void {
    if (this._originalState) {
        Object.assign(this, structuredClone(this._originalState));
    }
}
```

**Uso:**
```typescript
product.name = 'Modified';
product.resetChanges();
console.log(product.name); // Vuelve al valor original
```

---

## 🆕 Verificación de Nueva Instancia

### isNew()

```typescript
public isNew(): boolean
```

Determina si es una instancia nueva (sin guardar) verificando si la propiedad primaria es `undefined` o `null`.

**Implementación:**
```typescript
public isNew(): boolean {
    return this.getPrimaryPropertyValue() === undefined || 
           this.getPrimaryPropertyValue() === null;
}
```

**Uso:**
```typescript
const newProduct = new Product({});
newProduct.isNew(); // true

const existingProduct = new Product({ id: 123 });
existingProduct.isNew(); // false
```

**Impacto:**
- Determina si `save()` hace POST (nuevo) o PUT (actualizar)
- Controla qué botones mostrar en UI

---

## ✅ Validaciones de Configuración

### validateModuleConfiguration()

```typescript
public validateModuleConfiguration(): boolean
```

Valida que el módulo tenga la configuración básica necesaria:
- `@ModuleName`
- `@ModuleIcon`
- `@DefaultProperty`
- `@PrimaryProperty`

**Implementación:**
```typescript
public validateModuleConfiguration(): boolean {
    const errors: string[] = [];
    const entityClass = this.constructor as typeof BaseEntity;
    
    if (!entityClass.getModuleName()) {
        errors.push('El módulo no tiene definido @ModuleName');
    }
    
    if (!entityClass.getModuleIcon()) {
        errors.push('El módulo no tiene definido @ModuleIcon');
    }
    
    if (!(this.constructor as any)[DEFAULT_PROPERTY_KEY]) {
        errors.push('El módulo no tiene definido @DefaultProperty');
    }
    
    if (!this.getPrimaryPropertyKey()) {
        errors.push('El módulo no tiene definido @PrimaryProperty');
    }
    
    if (errors.length > 0) {
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Error de configuración del módulo',
            errors.join('\n')
        );
        return false;
    }
    
    return true;
}
```

**Uso:**
- Se llama automáticamente antes de operaciones CRUD
- Evita errores en tiempo de ejecución

### validatePersistenceConfiguration()

```typescript
public validatePersistenceConfiguration(): boolean
```

Valida configuración para persistencia:
- Todas las validaciones de `validateModuleConfiguration()`
- `@UniquePropertyKey`
- `@ApiEndpoint`
- `@ApiMethods`

**Uso:**
- Se llama antes de `save()`, `update()`, `delete()`

### validateApiMethod()

```typescript
public validateApiMethod(method: HttpMethod): boolean
```

Verifica si un método HTTP está permitido por `@ApiMethods`.

**Uso:**
```typescript
@ApiMethods(['GET', 'POST'])
export class Product extends BaseEntity {}

product.validateApiMethod('POST'); // true
product.validateApiMethod('DELETE'); // false → muestra error
```

---

## 🔢 Persistencia

### isPersistent()

```typescript
public isPersistent(): boolean
```

Verifica si la entidad tiene el decorador `@Persistent()`.

**Uso:**
```typescript
@Persistent()
export class Product extends BaseEntity {}

product.isPersistent(); // true
```

### getSaving

```typescript
public get getSaving(): boolean
```

Getter que retorna si la entidad está en proceso de guardado.

**Uso:**
```typescript
if (product.getSaving) {
    // Deshabilitar botón Save
}
```

---

## 🎣 Lifecycle Hooks (Resumen)

BaseEntity proporciona hooks vacíos que las subclases pueden sobreescribir:

### Save Hooks
```typescript
public beforeSave(): void {}
public onSaving(): void {}
public afterSave(): void {}
public saveFailed(): void {}
```

### Update Hooks
```typescript
public beforeUpdate(): void {}
public onUpdating(): void {}
public afterUpdate(): void {}
public updateFailed(): void {}
```

### Delete Hooks
```typescript
public beforeDelete(): void {}
public onDeleting(): void {}
public afterDelete(): void {}
public deleteFailed(): void {}
```

### Get Hooks
```typescript
public afterGetElement(): void {}
public getElementFailed(): void {}
public afterGetElementList(): void {}
public getElementListFailed(): void {}
```

### Refresh Hooks
```typescript
public afterRefresh(): void {}
public refreshFailed(): void {}
```

### Validation Hooks
```typescript
public onValidated(): void {}
```

**Ver documentación completa en:** `lifecycle-hooks.md`

---

## 🌐 Integración con Application

### validateInputs()

```typescript
public async validateInputs(): Promise<boolean>
```

Valida todos los inputs del formulario actual.

**Implementación:**
```typescript
public async validateInputs(): Promise<boolean> {
    Application.View.value.isValid = true;
    Application.ApplicationUIService.showLoadingMenu();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Emitir evento para que los inputs validen
    Application.eventBus.emit('validate-inputs');
    
    // Esperar validaciones asíncronas
    const keys = this.getKeys();
    const asyncValidationPromises = keys.map(key => this.isAsyncValidation(key));
    await Promise.all(asyncValidationPromises);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    this.onValidated();
    Application.ApplicationUIService.hideLoadingMenu();
    
    return Application.View.value.isValid;
}
```

**Funcionamiento:**
1. Muestra loading
2. Emite evento `'validate-inputs'` al eventBus
3. Todos los componentes de input escuchan y ejecutan su validación
4. Espera validaciones asíncronas
5. Retorna si todos los campos son válidos

---

## 🚀 Método Estático: createNewInstance()

```typescript
public static createNewInstance<T extends BaseEntity>(
    this: new (data: Record<string, any>) => T
): T
```

Crea una nueva instancia vacía de la entidad.

**Uso:**
```typescript
const newProduct = Product.createNewInstance();
// Equivalente a: new Product({})
```

**Dónde se usa:**
- Botón "New" en interfaz
- Crear registros programáticamente

---

## 🛡️ EmptyEntity

```typescript
export class EmptyEntity extends BaseEntity {
    override isNull(): boolean {
        return true;
    }
}
```

Clase especial que representa una entidad nula/vacía. Sobreescribe `isNull()` para retornar `true`.

**Uso:**
```typescript
const emptyEntity = new EmptyEntity({});
emptyEntity.isNull(); // true
```

---

## 📚 Métodos Relacionados con Metadatos

Los siguientes métodos están documentados en detalle en `metadata-access.md`:

### Propiedades
- `getKeys()` - Obtener todas las propiedades ordenadas
- `getArrayKeys()` - Obtener propiedades de tipo Array
- `getPropertyIndices()` - Obtener índices de propiedades
- `getCSSClasses()` - Obtener clases CSS de columnas

### Módulo
- `getModuleName()` [static]
- `getModulePermission()` [static]
- `getModuleIcon()` [static]
- `getModuleListComponent()` [static]
- `getModuleDetailComponent()` [static]
- `getModuleDefaultComponent()` [static]
- `getModuleCustomComponents()` [static]

### Tipos
- `getPropertyType()` - Tipo de una propiedad
- `getArrayPropertyType()` - Tipo de elementos en array

### Validaciones
- `isRequired()` - Verificar si campo es requerido
- `requiredMessage()` - Mensaje de campo requerido
- `isValidation()` - Ejecutar validación síncrona
- `validationMessage()` - Mensaje de validación
- `isAsyncValidation()` - Ejecutar validación asíncrona
- `asyncValidationMessage()` - Mensaje de validación asíncrona
- `isDisabled()` - Verificar si campo está deshabilitado
- `isReadOnly()` - Verificar si campo es solo lectura

### UI
- `getViewGroups()` - Obtener grupos de vista
- `getViewGroupRows()` - Obtener filas de grupos
- `getStringType()` - Obtener tipo de string (EMAIL, PASSWORD, etc.)
- `getDisplayFormat()` - Obtener formato de display
- `getFormattedValue()` - Obtener valor formateado
- `getHelpText()` - Obtener texto de ayuda
- `getTabOrders()` - Obtener orden de tabs
- `isHideInDetailView()` - Verificar si ocultar en detalle
- `isHideInListView()` - Verificar si ocultar en lista

### API
- `getApiEndpoint()` - Obtener endpoint de API
- `getApiMethods()` - Obtener métodos HTTP permitidos
- `isApiMethodAllowed()` - Verificar si método está permitido

---

## 🎓 Ejemplos de Uso

### Ejemplo 1: Entidad Completa

```typescript
@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('Products')
@ModuleIcon(ICONS.BOX)
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Name', String)
    @Required(true)
    name!: string;
    
    @PropertyIndex(3)
    @PropertyName('Price', Number)
    price!: number;
}
```

### Ejemplo 2: Usar BaseEntity

```typescript
// Crear instancia
const product = new Product({ id: 1, name: 'Widget', price: 99.99 });

// Verificar estado
console.log(product.isNew()); // false
console.log(product.getPrimaryPropertyValue()); // 1
console.log(product.getDefaultPropertyValue()); // 'Widget'

// Modificar
product.price = 149.99;

// Detectar cambios
console.log(product.getDirtyState()); // true

// Guardar
await product.save(); // PUT /api/products/1

// Estado se actualiza
console.log(product.getDirtyState()); // false
```

### Ejemplo 3: Lifecycle Hooks

```typescript
export class Product extends BaseEntity {
    override beforeSave(): void {
        console.log('Preparando para guardar...');
        // Normalizar datos antes de guardar
        this.name = this.name.trim().toUpperCase();
    }
    
    override afterSave(): void {
        console.log('Guardado completado!');
        // Navegar a lista
        Application.changeViewToListView(Product);
    }
    
    override saveFailed(): void {
        console.error('Error al guardar');
        // Lógica adicional de error
    }
}
```

---

## 🔗 Referencias

- **CRUD Operations:** `crud-operations.md`
- **Validation System:** `validation-system.md`
- **Lifecycle Hooks:** `lifecycle-hooks.md`
- **Metadata Access:** `metadata-access.md`
- **Decoradores:** `../01-decorators/`
- **Application:** `../03-application/application-singleton.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
