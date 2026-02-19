# BaseEntity: State and Conversion Methods

## 1. Propósito

El sistema de métodos de estado y conversión gestiona el ciclo de vida de la entidad a través de cuatro capacidades fundamentales: tracking de operaciones asíncronas mediante estados de carga (setLoading, loaded, getLoadingState), conversión bidireccional entre instancia de clase y objetos planos (toObject, toPersistentObject), detección de cambios no guardados mediante comparación con snapshot original (getDirtyState, resetChanges), y validación de nullability para implementar patrón Null Object (isNull). El sistema permite rastrear si entidad está cargando datos desde API (getLoadingState), si está ejecutando operación save (getSaving), si tiene cambios sin guardar que requieren confirmación antes de navegación (getDirtyState), y provee mecanismos de conversión para operaciones CRUD que transforman instancia TypeScript con métodos a objeto plano JSON para HTTP requests. El snapshot _originalState se crea en constructor usando toPersistentObject() (solo propiedades decoradas con @PropertyName) y se actualiza después de save() exitoso. El sistema es crítico para Application.changeView() que previene navegación con cambios sin guardar mediante openConfirmationMenu().

## 2. Alcance

**Responsabilidades cubiertas:**
- setLoading(): Marca entidad como "cargando datos", establece _isLoading = true para mostrar spinners en UI
- loaded(): Marca "carga completada", establece _isLoading = false para ocultar loaders
- getLoadingState(): Retorna boolean indicando si operación de carga está en progreso
- getSaving (getter): Retorna boolean indicando si operación save() está en progreso, establecido automáticamente por CRUD
- toObject(): Convierte instancia completa a Record<string, any> incluyendo TODAS las propiedades (públicas y privadas como _isLoading, _originalState, _isSaving)
- toPersistentObject(): Convierte solo propiedades decoradas con @PropertyName a Record<string, any>, excluye propiedades privadas y temporales
- isNull(): Implementa patrón Null Object, retorna false para BaseEntity, true para EmptyEntity
- getDirtyState(): Compara JSON.stringify(_originalState) vs JSON.stringify(toPersistentObject()), retorna true si hay cambios no guardados
- resetChanges(): Restaura estado original ejecutando Object.assign(this, structuredClone(_originalState)), revierte cambios no guardados
- onBeforeRouteLeave(): Hook de navegación que retorna true por defecto, puede sobreescribirse en subclases

**Límites del alcance:**
- getDirtyState() no detecta cambios en propiedades sin @PropertyName (no están en _originalState)
- Comparación JSON no detecta diferencias en orden de propiedades (consideradas iguales)
- structuredClone() en resetChanges() no clona funciones ni métodos (solo datos)
- isNull() solo verifica si ES EmptyEntity, no valida si propiedades individuales son null/undefined/empty
- getLoadingState() y getSaving son estados independientes (carga de datos vs guardado), no se sincronizan
- toObject() incluye propiedades privadas, NO filtradas automáticamente
- onBeforeRouteLeave() no se usa directamente, Application.changeView() verifica getDirtyState() en su lugar
- _originalState no se actualiza en update(), solo en save() exitoso
- resetChanges() no emite eventos ni notifica a UI, componentes deben detectar cambios manualmente
- No provee historial de cambios (undo/redo), solo snapshot binario original vs actual

## 3. Definiciones Clave

**_isLoading:** Propiedad privada boolean que indica si entidad está cargando datos. Establecida por setLoading() (true) y loaded() (false). Consultada por getLoadingState(). Típicamente usada durante fetch de datos relacionados o inicialización asíncrona. Independiente de _isSaving.

**_isSaving:** Propiedad privada boolean que indica si operación save() está en progreso. Establecida automáticamente por save() al inicio (true) y al completar/fallar (false). Consultada por getter getSaving. Usada para deshabilitar botones UI durante guardado. Independiente de _isLoading.

**_originalState:** Snapshot del estado inicial de entidad creado en constructor mediante structuredClone(toPersistentObject()). Contiene solo propiedades decoradas con @PropertyName. Usado por getDirtyState() como referencia para detectar cambios. Actualizado después de save() exitoso con nuevo estado guardado. Usado por resetChanges() para restaurar estado previo.

**toObject():** Método que retorna this como Record<string, any>. Conversión directa SIN filtrado. Incluye TODAS las propiedades: name, price, _isLoading, _originalState, _isSaving, etc. No incluye métodos (solo propiedades). Usado internamente, NO para API requests.

**toPersistentObject():** Método que retorna Record<string, any> conteniendo SOLO propiedades decoradas con @PropertyName. Filtra propiedades privadas (_isLoading, _originalState, _isSaving) y no decoradas. Usado en constructor para crear _originalState. Usado en getDirtyState() para comparación. Representa "estado de negocio" de entidad.

**getDirtyState():** Método que detecta cambios no guardados comparando JSON.stringify(_originalState) vs JSON.stringify(toPersistentObject()). Retorna true si strings difieren (hay cambios), false si son idénticos (sin cambios). Usado por Application.changeView() para prevenir navegación con datos no guardados. Limitado a propiedades en _originalState.

**resetChanges():** Método que revierte cambios no guardados ejecutando Object.assign(this, structuredClone(_originalState)). Restaura valores originales. Después de ejecución, getDirtyState() retorna false. No afecta propiedades no decoradas (no están en _originalState).

**isNull():** Método boolean que implementa patrón Null Object Pattern. Retorna false en BaseEntity (instancia normal), retorna true en EmptyEntity (instancia vacía). Permite código sin verificación null/undefined. NO verifica si propiedades individuales son null, solo si instancia ES EmptyEntity.

**EmptyEntity:** Clase especial que extiende BaseEntity y sobreescribe isNull() para retornar true. Usada como placeholder en lugar de null/undefined. Permite llamar métodos sin errores. Ejemplo: customer: Customer = new EmptyEntity() as Customer.

**Dirty State Pattern:** Patrón de diseño para detectar modificaciones. Consiste en: 1) Crear snapshot al inicio (constructor), 2) Comparar estado actual vs snapshot (getDirtyState), 3) Opción de revertir (resetChanges), 4) Actualizar snapshot después de persistir (save). Implementado con JSON.stringify para comparación.

## 4. Descripción Técnica

### 4.0 Actualización Fase 1 (Estabilización)

BaseEntity adopta dos mejoras de robustez sin cambiar API pública:

1. **Dirty State robusto:** reemplazar comparación por `JSON.stringify` con comparación profunda (`deepEqual`) para evitar falsos positivos por orden de llaves o estructuras anidadas.
2. **Snapshot seguro:** reemplazar `structuredClone` por `deepClone` para mantener comportamiento consistente en diferentes tipos de dato usados por entidades.

Además, los métodos de mapeo de persistencia (`mapToPersistentKeys`, `mapFromPersistentKeys`) deben aplicar transformación automática por metadatos de tipo (`@PropertyName(..., Type)`) consumiendo `Application.ApplicationDataService`.

`transformationSchema` estático por entidad se mantiene como mecanismo **opcional de override**, no como requisito para usuarios finales.

**Contrato de compatibilidad:**
- No se cambia la firma pública de `getDirtyState()` ni `resetChanges()`
- No se altera el almacenamiento canónico de metadatos en `prototype[SYMBOL]`
- Si no existe `transformationSchema`, el mapeo mantiene comportamiento actual
- La transformación automática debe funcionar sin configuración manual en entidades comunes

#### 4.0.1 Transformación Automática de Entidades y Arrays

**Problema resuelto:** Los transformadores `entity` y `arrayOfEntities` de `ApplicationDataService` ahora aceptan constructores abstractos mediante el tipo `AbstractEntityConstructor<T>`, eliminando errores de tipado TypeScript 2352.

**Implementación en `getAutomaticTransformationSchema()`:**

```typescript
// Para propiedades de tipo Array con @ArrayElementType
if (propertyType === Array) {
    const arrayElementType = this.getArrayPropertyType(propertyKey);
    if (arrayElementType) {  // arrayElementType: typeof BaseEntity | undefined
        schema[propertyKey] = Application.ApplicationDataService.transformers.arrayOfEntities(
            arrayElementType  // Sin casteo necesario
        );
    }
}

// Para propiedades de tipo BaseEntity subclass
if (typeof propertyType === 'function' && propertyType.prototype instanceof BaseEntity) {
    schema[propertyKey] = Application.ApplicationDataService.transformers.entity(
        propertyType as typeof BaseEntity  // Casteo a tipo abstracto
    );
}
```

**Type safety garantizado:**
- `AbstractEntityConstructor<T>` acepta tanto `typeof BaseEntity` (abstracto) como `typeof Product` (concreto)
- Transformadores castean internamente a `EntityConstructor<T>` antes de instanciar con `new`
- Eliminación de validación `instanceof` en `entity.toAPI` por incompatibilidad con constructores abstractos
- Conversión type-safe sin usar `as unknown as` o doble casteo

**Ubicación:** `/src/entities/base_entity.ts` líneas 1515-1532 (método `getAutomaticTransformationSchema`)

**Referencia cruzada:** Ver `/copilot/layers/03-application/application-singleton.md` § 4.3.1.1 para detalles de tipos de constructores.

### Métodos de Loading State

#### setLoading() - Marcar Inicio de Carga

```typescript
public setLoading(): void
```

Establece _isLoading = true para indicar que operación de carga está en progreso.

**Ubicación:** Línea 57

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    async loadRelatedData() {
        this.setLoading();
        
        try {
            const response = await fetch('/api/product-details');
            // procesar datos...
        } finally {
            this.loaded();
        }
    }
}

const product = new Product({ name: 'Widget' });
console.log(product.getLoadingState()); // false

product.setLoading();
console.log(product.getLoadingState()); // true
```

**Uso en componente Vue:**

```vue
<template>
    <div v-if="product.getLoadingState()">
        <LoadingSpinner />
    </div>
    <div v-else>
        {{ product.name }}
    </div>
</template>
```

#### loaded() - Marcar Fin de Carga

```typescript
public loaded(): void
```

Establece _isLoading = false para indicar que carga completó.

**Ubicación:** Línea 61

**Pattern try-finally:**

```typescript
export class Order extends BaseEntity {
    async fetchOrderDetails() {
        this.setLoading();
        
        try {
            const items = await this.fetchItems();
            const customer = await this.fetchCustomer();
        } catch (error) {
            console.error(error);
        } finally {
            this.loaded();  // Siempre ejecuta
        }
    }
}
```

#### getLoadingState() - Consultar Estado de Carga

```typescript
public getLoadingState(): boolean
```

Retorna valor actual de _isLoading.

**Ubicación:** Línea 65

**Uso reactivo en Vue:**

```vue
<script setup>
import { computed } from 'vue';

const isLoading = computed(() => entity.getLoadingState());
</script>

<template>
    <button :disabled="isLoading">
        <span v-if="isLoading">Cargando...</span>
        <span v-else>Cargar Datos</span>
    </button>
</template>
```

#### getSaving - Consultar Estado de Guardado (Getter)

```typescript
public get getSaving(): boolean
```

Retorna valor de _isSaving (establecido automáticamente por save()).

**Ubicación:** Línea 596

**Diferencia entre Loading y Saving:**

| Método | Propósito | Establecido por |
|--------|-----------|-----------------|
| getLoadingState() | Carga de datos | Developer (setLoading/loaded) |
| getSaving | Guardado de datos | Framework (save() interno) |

**Ejemplo:**

```typescript
export class Order extends BaseEntity {
    async initialize() {
        this.setLoading();
        await this.fetchRelatedData();
        this.loaded();
    }
    
    async submitOrder() {
        await this.save();  // _isSaving establecido internamente
    }
}

const order = new Order({...});

// Durante initialize():
console.log(order.getLoadingState()); // true
console.log(order.getSaving);         // false

// Durante submitOrder():
console.log(order.getLoadingState()); // false
console.log(order.getSaving);         // true
```

**Uso en botón guardar:**

```vue
<template>
    <button @click="entity.save()" :disabled="entity.getSaving">
        <span v-if="entity.getSaving">Guardando...</span>
        <span v-else>Guardar</span>
    </button>
</template>
```

### Métodos de Conversión

#### toObject() - Conversión Completa

```typescript
public toObject(): Record<string, any>
```

Retorna this como Record<string, any>. Conversión directa sin filtrado, incluye TODAS las propiedades.

**Ubicación:** Línea 74

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
}

const product = new Product({ name: 'Widget', price: 100 });

const obj = product.toObject();
console.log(obj);
// {
//   name: 'Widget',
//   price: 100,
//   _isLoading: false,
//   _originalState: {...},
//   _isSaving: false,
//   oid: '...'
// }
```

**Nota:** toObject() NO filtra propiedades privadas. Para obtener solo propiedades de negocio, usar toPersistentObject().

#### toPersistentObject() - Conversión Filtrada

```typescript
public toPersistentObject(): Record<string, any>
```

Retorna Record<string, any> con SOLO propiedades decoradas con @PropertyName.

**Ubicación:** Línea 78

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

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('ID', Number)
    id?: number;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    temporaryFlag: boolean = false;  // Sin @PropertyName
}

const user = new User({ 
    id: 1, 
    name: 'Alice', 
    email: 'alice@example.com',
    temporaryFlag: true
});

const persistentObj = user.toPersistentObject();
console.log(persistentObj);
// {
//   id: 1,
//   name: 'Alice',
//   email: 'alice@example.com'
// }
// temporaryFlag, _isLoading, _originalState NO incluidos
```

**Diferencia en output:**

```typescript
const product = new Product({ name: 'Widget', price: 100 });

console.log(Object.keys(product.toObject()));
// ['name', 'price', '_isLoading', '_originalState', '_isSaving', 'oid']

console.log(Object.keys(product.toPersistentObject()));
// ['name', 'price']
```

**Uso en constructor:**

```typescript
constructor(data: Record<string, any>) {
    Object.assign(this, data);
    this._originalState = structuredClone(this.toPersistentObject());
    // Snapshot inicial solo con propiedades de negocio
}
```

### Métodos de Dirty State

#### getDirtyState() - Detectar Cambios No Guardados

```typescript
public getDirtyState(): boolean
```

Compara JSON.stringify(_originalState) vs JSON.stringify(toPersistentObject()). Retorna true si difieren.

**Ubicación:** Línea 878

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

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
}

const product = new Product({ name: 'Widget', price: 100 });
console.log(product.getDirtyState()); // false

product.name = 'Super Widget';
console.log(product.getDirtyState()); // true

product.price = 120;
console.log(product.getDirtyState()); // true

product.resetChanges();
console.log(product.getDirtyState()); // false
```

**Uso en Application.changeView():**

```typescript
// application.ts - Línea 135
changeView = (entityClass: typeof BaseEntity, component: Component, viewType: ViewTypes, entity: BaseEntity | null = null) => {
    if(this.View.value.entityObject && this.View.value.entityObject.getDirtyState()) {
        this.ApplicationUIService.openConfirmationMenu(
            confMenuType.WARNING,
            'Salir sin guardar',
            'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?',
            () => {
                this.setViewChanges(entityClass, component, viewType, entity);
            }
        );
        return;
    }
    this.setViewChanges(entityClass, component, viewType, entity);
}
```

**Pattern de prevención de navegación:**

```typescript
onBeforeRouteLeave((to, from, next) => {
    if (product.getDirtyState()) {
        const confirmLeave = confirm('¿Salir sin guardar cambios?');
        next(confirmLeave);
    } else {
        next();
    }
});
```

**UI indicator:**

```vue
<script setup>
const hasUnsavedChanges = computed(() => product.getDirtyState());
</script>

<template>
    <button :class="{ 'has-changes': hasUnsavedChanges }">
        Guardar
        <span v-if="hasUnsavedChanges">*</span>
    </button>
</template>
```

#### resetChanges() - Revertir Cambios

```typescript
public resetChanges(): void
```

Restaura valores de _originalState usando Object.assign y structuredClone.

**Ubicación:** Línea 887

**Implementación:**

```typescript
public resetChanges(): void {
    if (this._originalState) {
        Object.assign(this, structuredClone(this._originalState));
    }
}
```

**Ejemplo:**

```typescript
const product = new Product({ name: 'Widget', price: 100 });
// _originalState = { name: 'Widget', price: 100 }

product.name = 'Super Widget';
product.price = 150;
console.log(product.getDirtyState()); // true

product.resetChanges();

console.log(product.name);  // 'Widget'
console.log(product.price); // 100
console.log(product.getDirtyState()); // false
```

**Uso en botón cancelar:**

```vue
<script setup>
const product = ref(new Product({ name: 'Widget', price: 100 }));

const cancel = () => {
    product.value.resetChanges();
    Application.ApplicationUIService.showToast('Cambios descartados', ToastType.INFO);
};
</script>

<template>
    <input v-model="product.name" />
    <input v-model="product.price" type="number" />
    
    <button @click="cancel" :disabled="!product.getDirtyState()">
        Cancelar Cambios
    </button>
</template>
```

**Comportamiento después de save():**

```typescript
const product = new Product({ name: 'Widget', price: 100 });

product.price = 120;
console.log(product.getDirtyState()); // true

await product.save();
// _originalState actualizado = { name: 'Widget', price: 120 }

console.log(product.getDirtyState()); // false

product.price = 130;
console.log(product.getDirtyState()); // true

product.resetChanges();
console.log(product.price); // 120 (estado guardado, NO 100 inicial)
```

**Actualización de _originalState en save():**

```typescript
// BaseEntity.save() - Línea 755
const response = await Application.axiosInstance.post(endpoint!, dataToSend);
const mappedData = this.mapFromPersistentKeys(response.data);
Object.assign(this, mappedData);

this._originalState = structuredClone(this.toPersistentObject());
// Snapshot actualizado con nuevo estado guardado
```

### Métodos de Validación

#### isNull() - Patrón Null Object

```typescript
isNull(): boolean
```

Retorna false en BaseEntity, true en EmptyEntity.

**Ubicación:** Línea 69

**Implementación en BaseEntity:**

```typescript
isNull(): boolean {
    return false;
}
```

**Implementación en EmptyEntity:**

```typescript
export class EmptyEntity extends BaseEntity {
    override isNull(): boolean {
        return true;
    }
}
```

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
}

const product = new Product({ name: 'Widget' });
console.log(product.isNull()); // false

const emptyProduct = new EmptyEntity({});
console.log(emptyProduct.isNull()); // true
```

**Pattern de valores por defecto:**

```typescript
export class Order extends BaseEntity {
    @PropertyName('Customer', Object)
    customer: Customer = new EmptyEntity({}) as Customer;
    
    hasValidCustomer(): boolean {
        return !this.customer.isNull();
    }
}

const order = new Order({});
console.log(order.customer.isNull()); // true
console.log(order.hasValidCustomer()); // false
```

**Uso en componente Vue:**

```vue
<template>
    <div v-if="product.isNull()" class="empty-state">
        No hay producto seleccionado
    </div>
    <div v-else>
        {{ product.name }}
    </div>
</template>
```

**Nota:** isNull() NO verifica si propiedades individuales son null/undefined/empty:

```typescript
const product = new Product({ name: '', price: 0 });
console.log(product.isNull()); // false (es Product, aunque vacío)

const empty = new EmptyEntity({});
console.log(empty.isNull()); // true (es EmptyEntity)
```

#### onBeforeRouteLeave() - Hook de Navegación

```typescript
public onBeforeRouteLeave(): boolean
```

Retorna true por defecto. Puede sobreescribirse para lógica custom.

**Ubicación:** Línea 874

**Implementación por defecto:**

```typescript
public onBeforeRouteLeave(): boolean {
    return true;
}
```

**Uso override:**

```typescript
export class SpecialProduct extends BaseEntity {
    override onBeforeRouteLeave(): boolean {
        if (this.price < 0) {
            alert('Precio no puede ser negativo');
            return false;
        }
        return true;
    }
}
```

**Nota:** Application.changeView() NO usa onBeforeRouteLeave() directamente, verifica getDirtyState() en su lugar.

## 5. Flujo de Funcionamiento

### Flujo de Estado de Carga

```
Usuario llama método async (loadData)
        ↓
Código llama entity.setLoading()
        ↓
_isLoading = true
        ↓
getLoadingState() retorna true
        ↓
UI muestra spinner/loader
        ↓
Operación async ejecuta (fetch, timeout, etc.)
        ↓
finally block ejecuta entity.loaded()
        ↓
_isLoading = false
        ↓
getLoadingState() retorna false
        ↓
UI oculta spinner/loader
```

### Flujo de Dirty State Detection

```
Constructor ejecuta
        ↓
Object.assign(this, data)
        ↓
_originalState = structuredClone(toPersistentObject())
Snapshot inicial = { name: 'Widget', price: 100 }
        ↓
getDirtyState() retorna false (sin cambios)
        ↓
Usuario modifica propiedad
entity.name = 'Super Widget'
        ↓
getDirtyState() ejecuta
        ↓
Serializa _originalState
snapshotJson = '{"name":"Widget","price":100}'
        ↓
Serializa estado actual
actualJson = '{"name":"Super Widget","price":100}'
        ↓
Compara strings
snapshotJson !== actualJson → true
        ↓
getDirtyState() retorna true (hay cambios)
        ↓
UI muestra indicador * unsaved changes
```

### Flujo de Reset Changes

```
Usuario tiene cambios: entity.name = 'New Name'
        ↓
getDirtyState() → true
        ↓
Usuario hace click en "Cancelar"
        ↓
entity.resetChanges() ejecuta
        ↓
Verifica if (_originalState exists)
        ↓
Clona snapshot
clonedState = structuredClone(_originalState)
        ↓
Asigna propiedades originales
Object.assign(this, clonedState)
        ↓
entity.name restaurado a valor original
        ↓
getDirtyState() → false
        ↓
UI oculta indicador unsaved changes
```

### Flujo de Prevención de Navegación

```
Usuario hace click en botón de navegación
        ↓
Application.changeView() ejecuta
        ↓
Obtiene entityObject del View.value
        ↓
Verifica entityObject.getDirtyState()
        ↓
¿getDirtyState() retorna true?
    ├─ NO → Ejecutar navegación directamente
    │       setViewChanges(...)
    │
    └─ SÍ → Mostrar confirmación
            openConfirmationMenu(
                WARNING,
                'Salir sin guardar',
                '¿Seguro?',
                onConfirm: setViewChanges(...)
            )
            ↓
        Usuario elige opción
            ├─ Confirmar → Ejecutar navegación
            │              (cambios se pierden)
            │
            └─ Cancelar → No navegar
                          (permanecer en vista)
```

### Flujo de Actualización Post-Save

```
Usuario modifica entity y llama save()
        ↓
save() ejecuta HTTP request (POST/PUT)
        ↓
Response exitoso recibido
        ↓
mapFromPersistentKeys(response.data)
        ↓
Object.assign(this, mappedData)
Propiedades actualizadas con data de servidor
        ↓
_originalState = structuredClone(toPersistentObject())
Snapshot actualizado con NUEVO estado guardado
        ↓
getDirtyState() → false
        ↓
Usuario hace nuevos cambios
        ↓
getDirtyState() → true
        ↓
resetChanges() restaura al estado guardado
(NO al estado inicial pre-save)
```

### Flujo de Conversión toObject vs toPersistentObject

```
Entity con propiedades:
- name (decorated @PropertyName)
- price (decorated @PropertyName)
- _isLoading (private, no decorated)
- temporaryFlag (no decorated)
        ↓
entity.toObject() ejecuta
        ↓
Retorna this as Record<string, any>
{ name, price, _isLoading, _originalState, temporaryFlag }
        ↓
entity.toPersistentObject() ejecuta
        ↓
getAllPropertiesNonFilter() obtiene decorated keys
['name', 'price']
        ↓
Itera sobre decorated keys
result = { name: this.name, price: this.price }
        ↓
Retorna result
{ name, price }
```

## 6. Reglas Obligatorias

**Regla 1:** setLoading() y loaded() DEBEN llamarse en pares. Usar try-finally para garantizar que loaded() ejecuta incluso si hay error.

**Regla 2:** _originalState DEBE crearse en constructor usando structuredClone(toPersistentObject()), NO toObject(). Solo capturar propiedades de negocio.

**Regla 3:** getDirtyState() DEBE comparar _originalState con toPersistentObject(), NO con toObject(). Propiedades privadas no participan en dirty detection.

**Regla 4:** resetChanges() DEBE verificar existencia de _originalState antes de Object.assign. Usar structuredClone para evitar referencias compartidas.

**Regla 5:** Application.changeView() DEBE verificar getDirtyState() antes de navegación. Si true, mostrar openConfirmationMenu() con warning.

**Regla 6:** save() exitoso DEBE actualizar _originalState con structuredClone(toPersistentObject()). Snapshot debe reflejar estado guardado actual, no inicial.

**Regla 7:** toPersistentObject() DEBE iterar solo sobre propiedades decoradas con @PropertyName obtenidas de getAllPropertiesNonFilter(). No incluir propiedades no decoradas.

**Regla 8:** isNull() en BaseEntity DEBE retornar false siempre. Solo EmptyEntity override retorna true. No cambiar comportamiento default.

**Regla 9:** getSaving y getLoadingState() son estados independientes. NO compartir _isSaving y _isLoading. Cada uno tiene propósito diferente (guardado vs carga).

**Regla 10:** Propiedades sin @PropertyName NO participan en dirty state detection. Cambios en propiedades no decoradas no disparan getDirtyState() = true.

**Regla 11:** getDirtyState() usa JSON.stringify para comparación. Orden de propiedades NO importa. undefined vs ausente SÍ son diferentes.

**Regla 12:** onBeforeRouteLeave() por defecto retorna true (permite navegación). Override solo para lógica de validación custom, NO para dirty state (usar getDirtyState()).

## 7. Prohibiciones

**Prohibido:** Llamar setLoading() sin el correspondiente loaded(). Causará loading state permanente en UI.

**Prohibido:** Usar toObject() para crear _originalState. toObject() incluye propiedades privadas que no deben participar en dirty detection.

**Prohibido:** Modificar _originalState directamente. Solo actualizar mediante save() exitoso o constructor. Modificación manual rompe dirty state detection.

**Prohibido:** Comparar getDirtyState() con propiedades no decoradas. Cambios en temporaryFlag, _customData, etc. NO son detectados como dirty.

**Prohibido:** Ignorar getDirtyState() en navegación. Application.changeView() DEBE verificar antes de permitir cambio de vista.

**Prohibido:** Usar Object.assign sin structuredClone en resetChanges(). Causará referencias compartidas entre _originalState y propiedades actuales.

**Prohibido:** Asumir que isNull() verifica propiedades vacías. isNull() solo verifica si instancia ES EmptyEntity, no valida name === '' o price === 0.

**Prohibido:** Cachear resultado de getDirtyState(). Debe recalcularse cada vez porque estado cambia con modificaciones de propiedades.

**Prohibido:** Llamar resetChanges() si _originalState es undefined. Verificar existencia primero con if (_originalState).

**Prohibido:** Override isNull() en entidades normales para retornar true. Rompe contrato de Null Object Pattern. Solo EmptyEntity debe retornar true.

**Prohibido:** Sincronizar manualmente _isSaving. Es establecido automáticamente por save() interno. Developer no debe modificar directamente.

**Prohibido:** Asumir que toPersistentObject() incluye todas las propiedades. Solo incluye decoradas con @PropertyName.

## 8. Dependencias

**Constructor de BaseEntity:**
- toPersistentObject(): Para crear _originalState inicial
- structuredClone(): Para clonar snapshot sin referencias compartidas
- Object.assign(): Para asignar data inicial a instancia

**CRUD Operations:**
- save(): Actualiza _originalState después de HTTP response exitoso
- Establece _isSaving = true al inicio, false al completar
- Usa toPersistentObject() para obtener data a persistir

**Application Singleton:**
- Application.changeView(): Verifica getDirtyState() antes de navegación
- Application.ApplicationUIService.openConfirmationMenu(): Muestra diálogo si hay cambios sin guardar
- Application.ApplicationUIService.showToast(): Notifica usuario después de resetChanges()

**Decoradores:**
- @PropertyName: Define qué propiedades se incluyen en toPersistentObject()
- Meta-programación: getAllPropertiesNonFilter() obtiene lista de propiedades decoradas

**Metadata System:**
- getAllPropertiesNonFilter(): Retorna Record<string, PropertyMetadata> con propiedades decoradas
- Usado por toPersistentObject() para filtrar propiedades

**Browser APIs:**
- JSON.stringify(): Para comparación de objetos en getDirtyState()
- structuredClone(): Para clonación profunda en constructor y resetChanges()

**Vue Reactivity (Indirect):**
- computed(): Para crear referencias reactivas a getLoadingState(), getSaving, getDirtyState()
- v-if/v-show: Para renderizado condicional basado en estados

## 9. Relaciones

**Relación con CRUD Operations (1:N):**
save() usa: toPersistentObject() para obtener data, actualiza _originalState después de éxito, establece _isSaving durante ejecución.

**Relación con Application.changeView() (N:1):**
Multiple vistas verifican getDirtyState() antes de navegación. Application controla flujo con openConfirmationMenu().

**Relación con Constructor (1:1):**
Constructor crea _originalState inicial usando toPersistentObject(). Snapshot establece baseline para dirty detection.

**Relación con Metadata System (1:N):**
toPersistentObject() consulta getAllPropertiesNonFilter() una vez por conversión. Multiple conversiones leen misma metadata de prototype.

**Relación con UI Components (N:N):**
Multiple componentes Vue observan getLoadingState(), getSaving, getDirtyState() mediante computed(). Multiple entities pueden estar en UI simultáneamente.

**Relación con EmptyEntity (1:1 inheritance):**
EmptyEntity extiende BaseEntity y override isNull() para retornar true. Implementa Null Object Pattern.

**Relación con resetChanges() y getDirtyState() (1:1 bidirectional):**
resetChanges() restaura estado que causa getDirtyState() = false. getDirtyState() detecta cambios que resetChanges() puede revertir.

## 10. Notas de Implementación

### Ejemplo Completo: Flujo de Estado End-to-End

```typescript
// ========================================
// 1. Definir Entidad
// ========================================

@ModuleName('Order', 'Orders')
export class Order extends BaseEntity {
    @PropertyName('Order Number', String)
    orderNumber!: string;
    
    @PropertyName('Total', Number)
    total!: number;
    
    @PropertyName('Status', String)
    status!: string;
}

// ========================================
// 2. Crear Instancia - Estado Inicial
// ========================================

const order = new Order({
    orderNumber: 'ORD-001',
    total: 500,
    status: 'pending'
});

// Constructor ejecuta:
// Object.assign(this, data)
// _originalState = structuredClone(toPersistentObject())
// _originalState = { orderNumber: 'ORD-001', total: 500, status: 'pending' }

console.log(order.getLoadingState()); // false
console.log(order.getDirtyState());   // false
console.log(order._originalState);    
// { orderNumber: 'ORD-001', total: 500, status: 'pending' }

// ========================================
// 3. Cargar Datos Adicionales
// ========================================

order.setLoading();
console.log(order.getLoadingState()); // true

await new Promise(resolve => setTimeout(resolve, 1000));

order.loaded();
console.log(order.getLoadingState()); // false

// ========================================
// 4. Modificar Datos (Dirty State)
// ========================================

order.total = 600;
order.status = 'processing';

console.log(order.getDirtyState()); // true

// Ver conversiones:
console.log(order.toObject());
// { orderNumber: 'ORD-001', total: 600, status: 'processing', 
//   _isLoading: false, _originalState: {...}, _isSaving: false, oid: '...' }

console.log(order.toPersistentObject());
// { orderNumber: 'ORD-001', total: 600, status: 'processing' }

// ========================================
// 5. Cancelar Cambios
// ========================================

order.resetChanges();

console.log(order.total);            // 500 (valor original)
console.log(order.status);           // 'pending' (valor original)
console.log(order.getDirtyState());  // false

// ========================================
// 6. Guardar Cambios
// ========================================

order.total = 700;
order.status = 'completed';

await order.save();

// save() ejecuta:
// 1. Validación
// 2. HTTP request (POST/PUT)
// 3. Object.assign(this, response.data)
// 4. _originalState = structuredClone(toPersistentObject())

console.log(order.getDirtyState()); // false (snapshot actualizado)
console.log(order._originalState);  
// { orderNumber: 'ORD-001', total: 700, status: 'completed' }

// ========================================
// 7. Prevenir Navegación con Cambios
// ========================================

order.total = 800;

// Intentar cambiar vista
Application.changeView(Product, ProductListView, ViewTypes.LISTVIEW);

// Application.changeView() ejecuta:
// if (entityObject.getDirtyState()) {
//     openConfirmationMenu(WARNING, '¿Salir sin guardar?')
// }

// → Muestra diálogo con opciones Confirmar/Cancelar
```

### Consideración: Propiedades No Decoradas No Participan en Dirty State

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    temporaryFlag: boolean = false;  // Sin @PropertyName
}

const product = new Product({ name: 'Widget' });

// _originalState = { name: 'Widget' }
// temporaryFlag NO está en snapshot

product.temporaryFlag = true;
console.log(product.getDirtyState()); 
// false (temporaryFlag no participa)

product.name = 'New Name';
console.log(product.getDirtyState()); 
// true (name SÍ participa)
```

### Consideración: getDirtyState() Usa JSON Comparison

```typescript
const product1 = new Product({ name: 'Widget', price: 100 });
const product2 = new Product({ price: 100, name: 'Widget' });

// Orden diferente, pero JSON.stringify produce mismo resultado
console.log(product1.getDirtyState()); // false
console.log(product2.getDirtyState()); // false

// Comparación:
JSON.stringify({ name: 'Widget', price: 100 })
JSON.stringify({ price: 100, name: 'Widget' })
// Ambos producen: '{"name":"Widget","price":100}'
```

**Limitación con undefined:**

```typescript
const obj1 = { name: 'Widget', price: undefined };
const obj2 = { name: 'Widget' };

JSON.stringify(obj1); // '{"name":"Widget"}'
JSON.stringify(obj2); // '{"name":"Widget"}'
// Indistinguibles en JSON (undefined se omite)
```

### Consideración: structuredClone en resetChanges()

```typescript
// Ventaja: Clonación profunda
const order = new Order({
    orderNumber: 'ORD-001',
    details: { items: [1, 2, 3] }
});

order.details.items.push(4);
order.resetChanges();

console.log(order.details.items); 
// [1, 2, 3] (restaurado sin referencia compartida)
```

**Limitación: No clona funciones:**

```typescript
const entity = new CustomEntity({
    name: 'Test',
    callback: () => console.log('Hello')
});

entity.resetChanges();
console.log(entity.callback); 
// undefined (funciones no se clonan)
```

### Pattern: Debugging Dirty State

```typescript
const product = new Product({ name: 'Widget', price: 100 });

// 1. Ver snapshot original
console.log('Original State:', product._originalState);
// { name: 'Widget', price: 100 }

// 2. Modificar
product.price = 150;

// 3. Ver estado actual persistente
console.log('Current Persistent:', product.toPersistentObject());
// { name: 'Widget', price: 150 }

// 4. Ver serialización JSON
console.log('Snapshot JSON:', JSON.stringify(product._originalState));
// '{"name":"Widget","price":100}'

console.log('Actual JSON:', JSON.stringify(product.toPersistentObject()));
// '{"name":"Widget","price":150}'

// 5. Ver resultado de comparación
console.log('Is Dirty:', product.getDirtyState());
// true
```

### Pattern: Componente Vue con Estados Combinados

```vue
<script setup>
import { ref, computed } from 'vue';

const order = ref(new Order({ orderNumber: 'ORD-001', total: 500 }));

const isLoading = computed(() => order.value.getLoadingState());
const isSaving = computed(() => order.value.getSaving);
const hasChanges = computed(() => order.value.getDirtyState());
const canSave = computed(() => hasChanges.value && !isSaving.value);

const loadData = async () => {
    order.value.setLoading();
    try {
        // fetch data...
    } finally {
        order.value.loaded();
    }
};

const save = async () => {
    await order.value.save();
};

const cancel = () => {
    order.value.resetChanges();
};
</script>

<template>
    <div>
        <div v-if="isLoading">
            <LoadingSpinner />
        </div>
        
        <form v-else @submit.prevent="save">
            <input v-model="order.total" type="number" />
            
            <button type="submit" :disabled="!canSave">
                <span v-if="isSaving">Guardando...</span>
                <span v-else>Guardar</span>
                <span v-if="hasChanges">*</span>
            </button>
            
            <button type="button" @click="cancel" :disabled="!hasChanges">
                Cancelar
            </button>
        </form>
    </div>
</template>
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- base-entity-core.md: Constructor que crea _originalState inicial
- crud-operations.md: save() actualiza _originalState después de éxito
- lifecycle-hooks.md: Hooks ejecutan después de actualización de _originalState
- metadata-access.md: getAllPropertiesNonFilter() usado por toPersistentObject()
- persistence-methods.md: mapToPersistentKeys() usa toObject() internamente

**Archivos fuente:**
- src/entities/base_entity.ts: Implementación de todos los métodos de estado (líneas 57-887)
- src/application/application.ts: Uso de getDirtyState() en changeView() (línea 135)
- src/entities/base_entity.ts: EmptyEntity class (línea 959)

**Líneas relevantes en código:**
- Línea 57: setLoading()
- Línea 61: loaded()
- Línea 65: getLoadingState()
- Línea 596: getSaving getter
- Línea 74: toObject()
- Línea 78: toPersistentObject()
- Línea 69: isNull()
- Línea 878: getDirtyState()
- Línea 887: resetChanges()
- Línea 874: onBeforeRouteLeave()
- Línea 959: EmptyEntity class

**Última actualización:** 11 de Febrero, 2026
