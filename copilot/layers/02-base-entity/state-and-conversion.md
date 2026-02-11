# 🔄 BaseEntity - Métodos de Estado y Conversión

**Referencias:**
- `base-entity-core.md` - Conceptos básicos de BaseEntity
- `crud-operations.md` - Uso de métodos de conversión en CRUD
- `lifecycle-hooks.md` - Hooks de ciclo de vida

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts`  
**Clase:** `export abstract class BaseEntity`

---

## 🎯 Propósito

Los **métodos de estado y conversión** gestionan:

1. **Estados de carga** - Tracking de operaciones asíncronas
2. **Conversión de objetos** - Entidad ↔ Object plano
3. **Dirty state** - Detección de cambios sin guardar
4. **Validación de estado** - Verificación de nullability

**Concepto fundamental:**  
> Estos métodos permiten rastrear el estado de la entidad (cargando, guardando, modificada) y convertir entre la instancia de clase y objetos planos para operaciones de API.

---

## 📊 Métodos de Estado de Carga

### setLoading()

```typescript
public setLoading(): void
```

**Propósito:** Marca la entidad como "cargando datos".

**Ubicación:** Línea 57

**Comportamiento:**
- Establece `_isLoading = true`
- Usado antes de operaciones asíncronas
- Permite mostrar spinners/loaders en UI

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
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

**Uso en componentes Vue:**

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

---

### loaded()

```typescript
public loaded(): void
```

**Propósito:** Marca la entidad como "carga completada".

**Ubicación:** Línea 61

**Comportamiento:**
- Establece `_isLoading = false`
- Debe llamarse después de operaciones asíncronas
- Permite ocultar loaders en UI

**Ejemplo:**

```typescript
const product = new Product({ id: 1 });

// Iniciar carga
product.setLoading();
console.log(product.getLoadingState()); // true

// Completar carga
product.loaded();
console.log(product.getLoadingState()); // false
```

**Patrón try-finally:**

```typescript
export class Order extends BaseEntity {
    async fetchOrderDetails() {
        this.setLoading();
        
        try {
            const items = await this.fetchItems();
            const customer = await this.fetchCustomer();
            // ...
        } catch (error) {
            console.error(error);
        } finally {
            this.loaded();  // ← Siempre se ejecuta
        }
    }
}
```

---

### getLoadingState()

```typescript
public getLoadingState(): boolean
```

**Propósito:** Obtiene el estado actual de carga.

**Retorna:** `true` si está cargando, `false` si no.

**Ubicación:** Línea 65

**Ejemplo:**

```typescript
const user = new User({ name: 'Alice' });

if (user.getLoadingState()) {
    console.log('Cargando...');
} else {
    console.log('Listo');
}
```

**Uso reactivo en Vue:**

```vue
<script setup>
import { computed } from 'vue';

const isLoading = computed(() => entity.getLoadingState());
</script>

<template>
    <button :disabled="isLoading">
        <span v-if="isLoading">Guardando...</span>
        <span v-else>Guardar</span>
    </button>
</template>
```

---

### getSaving (getter)

```typescript
public get getSaving(): boolean
```

**Propósito:** Obtiene el estado actual de guardado de la entidad.

**Retorna:** `true` si está guardando (operación save() en curso), `false` si no.

**Ubicación:** Línea 596

**Comportamiento:**
- Retorna el valor de `_isSaving ?? false`
- Se establece en `true` al inicio de operaciones save()
- Se establece en `false` al completar o fallar save()
- Útil para deshabilitar botones durante guardado

**Ejemplo:**

```typescript
const product = new Product({ name: 'Widget', price: 100 });

console.log(product.getSaving); // false

// Durante save():
product.save(); // _isSaving se establece a true internamente

// Después de completar:
// _isSaving se establece a false
```

**Uso en componentes Vue:**

```vue
<script setup>
import { computed } from 'vue';

const isSaving = computed(() => entity.getSaving);
</script>

<template>
    <button @click="entity.save()" :disabled="isSaving">
        <span v-if="isSaving">Guardando...</span>
        <span v-else>Guardar</span>
    </button>
</template>
```

**Diferencia entre getLoadingState() y getSaving:**

| Método | Propósito | Cuándo se usa |
|--------|-----------|---------------|
| `getLoadingState()` | Estado de carga de datos | Fetch/refresh de datos |
| `getSaving` | Estado de guardado | Durante save()/update() |

**Ejemplo combinado:**

```typescript
export class Order extends BaseEntity {
    async initialize() {
        this.setLoading();
        await this.fetchRelatedData();
        this.loaded();
    }
    
    async submitOrder() {
        // save() internamente maneja _isSaving
        await this.save();
    }
}

const order = new Order({...});

// Cargando datos
console.log(order.getLoadingState()); // true
console.log(order.getSaving);         // false

// Guardando cambios
console.log(order.getLoadingState()); // false
console.log(order.getSaving);         // true
```

---

### isNull()

```typescript
isNull(): boolean
```

**Propósito:** Verifica si la instancia representa una entidad nula o vacía (patrón Null Object).

**Retorna:** `false` para entidades normales, `true` para `EmptyEntity`.

**Ubicación:** Línea 69

**Comportamiento:**
- `BaseEntity.isNull()` siempre retorna `false`
- `EmptyEntity.isNull()` override retorna `true`
- Útil para validar resultados sin usar `null` o `undefined`

**Implementación:**

```typescript
// En BaseEntity
isNull(): boolean {
    return false;
}

// En EmptyEntity (línea 959)
export class EmptyEntity extends BaseEntity {
    override isNull(): boolean {
        return true;
    }
}
```

**Patrón Null Object:**

```typescript
function findProduct(id: number): BaseEntity {
    const found = products.find(p => p.id === id);
    
    // Retornar EmptyEntity en lugar de null
    return found || new EmptyEntity({});
}

// Uso sin verificar null
const product = findProduct(999);

if (product.isNull()) {
    console.log('Producto no encontrado');
} else {
    console.log('Producto:', product.getDefaultPropertyValue());
}
```

**Ventajas del patrón:**

✅ No necesitas verificar `if (product !== null)`  
✅ Puedes llamar métodos sin errores  
✅ Código más limpio y seguro

**Ejemplo con operaciones seguras:**

```typescript
// Sin isNull() (inseguro)
const product = getProduct(id);
if (product !== null) {
    console.log(product.name);
} else {
    console.log('No encontrado');
}

// Con isNull() (seguro)
const product = getProduct(id);
if (!product.isNull()) {
    console.log(product.name);
} else {
    console.log('No encontrado');
}
```

**Uso en componentes Vue:**

```vue
<template>
    <div v-if="!product.isNull()">
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
    </div>
    <div v-else>
        <p>Producto no encontrado</p>
    </div>
</template>
```

**Nota:** `isNull()` NO verifica si las propiedades individuales son nulas o vacías, solo verifica si la entidad en sí es una `EmptyEntity`.

```typescript
const product = new Product({ name: '', price: 0 });
console.log(product.isNull()); // false (es un Product válido, aunque vacío)

const empty = new EmptyEntity({});
console.log(empty.isNull()); // true (es EmptyEntity)
```

---

## 🔄 Métodos de Conversión

### toObject()

```typescript
public toObject(): Record<string, any>
```

**Propósito:** Convierte la instancia de BaseEntity a un objeto plano de JavaScript.

**Retorna:** Objeto con todas las propiedades de la entidad

**Ubicación:** Línea 74

**Comportamiento:**
- Retorna `this` como `Record<string, any>`
- Incluye TODAS las propiedades públicas (incluso `_isLoading`, `_originalState`, etc.)
- Es una conversión directa sin filtrado

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    calculateTax(): number {
        return this.price * 0.16;
    }
}

const product = new Product({ name: 'Widget', price: 100 });

const obj = product.toObject();
console.log(obj);
// {
//   name: 'Widget',
//   price: 100,
//   _isLoading: false,
//   _originalState: {...},
//   _isSaving: false
// }

console.log(typeof obj.calculateTax); // undefined (métodos no se incluyen)
```

**Nota:** `toObject()` NO filtra propiedades privadas. Para obtener solo propiedades de negocio, usa `toPersistentObject()`.

---

### toPersistentObject()

```typescript
public toPersistentObject(): Record<string, any>
```

**Propósito:** Convierte la entidad a un objeto plano conteniendo **SOLO** las propiedades decoradas con `@PropertyName`.

**Retorna:** Objeto filtrado con propiedades de negocio

**Ubicación:** Línea 78

**Comportamiento:**
1. Obtiene todas las propiedades decoradas con `@PropertyName`
2. Filtra y retorna solo esas propiedades
3. Excluye `_isLoading`, `_originalState`, `_isSaving`, etc.

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('ID', Number)
    id?: number;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    // Sin @PropertyName (no se incluye)
    temporaryFlag: boolean = false;
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
// ← temporaryFlag, _isLoading, _originalState NO se incluyen
```

**Implementación interna:**

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

**Uso en constructor:**

```typescript
constructor(data: Record<string, any>) {
    Object.assign(this, data);
    this._originalState = structuredClone(this.toPersistentObject());
}
```

El snapshot inicial se crea con `toPersistentObject()` para capturar solo propiedades de negocio.

**Diferencia con toObject():**

```typescript
const product = new Product({ name: 'Widget', price: 100 });

// toObject() incluye TODO
console.log(Object.keys(product.toObject()));
// ['name', 'price', '_isLoading', '_originalState', '_isSaving', 'oid']

// toPersistentObject() solo propiedades decoradas
console.log(Object.keys(product.toPersistentObject()));
// ['name', 'price']
```

---

## 🧩 Métodos de Validación de Estado

### isNull()

```typescript
isNull(): boolean
```

**Propósito:** Verifica si la entidad es nula/vacía (patrón Null Object).

**Retorna:** `false` por defecto, `true` en `EmptyEntity`

**Ubicación:** Línea 69

**Comportamiento:**
- Por defecto retorna `false`
- Sobreescrito en `EmptyEntity` para retornar `true`
- Permite implementar patrón Null Object

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    // ...
}

const product = new Product({ name: 'Widget' });
console.log(product.isNull()); // false

// EmptyEntity (clase especial)
export class EmptyEntity extends BaseEntity {
    override isNull(): boolean {
        return true;
    }
}

const emptyProduct = new EmptyEntity({});
console.log(emptyProduct.isNull()); // true
```

**Uso en composables/componentes:**

```typescript
// En un composable para ObjectInput
const isEmptySelection = computed(() => {
    return entity.value.relatedEntity?.isNull() ?? true;
});
```

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

**Caso de uso: Valores por defecto**

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

---

## 🔍 Métodos de Dirty State (Cambios Sin Guardar)

### getDirtyState()

```typescript
public getDirtyState(): boolean
```

**Propósito:** Detecta si la entidad tiene cambios sin guardar comparando el estado actual con `_originalState`.

**Retorna:** `true` si hay cambios, `false` si no hay cambios

**Ubicación:** Línea 878

**Comportamiento:**
1. Serializa `_originalState` a JSON
2. Serializa estado actual (`toPersistentObject()`) a JSON
3. Compara ambos strings
4. Retorna `true` si son diferentes

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
}

// Estado inicial
const product = new Product({ name: 'Widget', price: 100 });
console.log(product.getDirtyState()); // false

// Modificar propiedad
product.name = 'Super Widget';
console.log(product.getDirtyState()); // true

// Modificar otra propiedad
product.price = 120;
console.log(product.getDirtyState()); // true

// Resetear cambios
product.resetChanges();
console.log(product.getDirtyState()); // false
```

**Implementación interna:**

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

**Casos de uso:**

```typescript
// 1. Prevenir navegación con cambios sin guardar
onBeforeRouteLeave((to, from, next) => {
    if (product.getDirtyState()) {
        const confirmLeave = confirm('¿Salir sin guardar cambios?');
        next(confirmLeave);
    } else {
        next();
    }
});

// 2. Mostrar indicador visual
const hasUnsavedChanges = computed(() => product.getDirtyState());
```

```vue
<template>
    <button :class="{ 'has-changes': hasUnsavedChanges }">
        Guardar
        <span v-if="hasUnsavedChanges">*</span>
    </button>
</template>
```

---

### resetChanges()

```typescript
public resetChanges(): void
```

**Propósito:** Revierte todos los cambios no guardados restaurando el estado original.

**Ubicación:** Línea 887

**Comportamiento:**
1. Copia `_originalState` (structuredClone)
2. Asigna todas las propiedades originales a la instancia
3. Elimina cambios no guardados

**Ejemplo:**

```typescript
const product = new Product({ name: 'Widget', price: 100 });

// _originalState = { name: 'Widget', price: 100 }

// Hacer cambios
product.name = 'Super Widget';
product.price = 150;
console.log(product.getDirtyState()); // true

// Revertir cambios
product.resetChanges();

console.log(product.name);  // 'Widget' (valor original)
console.log(product.price); // 100 (valor original)
console.log(product.getDirtyState()); // false
```

**Implementación interna:**

```typescript
public resetChanges(): void {
    if (this._originalState) {
        Object.assign(this, structuredClone(this._originalState));
    }
}
```

**Uso en botón de cancelar:**

```vue
<script setup>
import { ref } from 'vue';

const product = ref(new Product({ name: 'Widget', price: 100 }));

const cancel = () => {
    product.value.resetChanges();
    Application.ApplicationUIService.showToast('Cambios descartados', ToastType.INFO);
};
</script>

<template>
    <div>
        <input v-model="product.name" />
        <input v-model="product.price" type="number" />
        
        <button @click="cancel" :disabled="!product.getDirtyState()">
            Cancelar Cambios
        </button>
    </div>
</template>
```

**Efecto después de save():**

```typescript
const product = new Product({ name: 'Widget', price: 100 });

// Modificar
product.price = 120;
console.log(product.getDirtyState()); // true

// Guardar
await product.save();

// Después de guardar exitosamente:
// _originalState se actualiza con el nuevo estado
console.log(product.getDirtyState()); // false

// Si ahora haces cambios:
product.price = 130;
console.log(product.getDirtyState()); // true

// resetChanges() restaura al estado guardado (120, no 100)
product.resetChanges();
console.log(product.price); // 120
```

**Actualización de `_originalState` en save():**

```typescript
// En BaseEntity.save() - Línea 755
const response = await Application.axiosInstance.post(endpoint!, dataToSend);
const mappedData = this.mapFromPersistentKeys(response.data);
Object.assign(this, mappedData);

// ← Actualizar snapshot con nuevo estado
this._originalState = structuredClone(this.toPersistentObject());
```

---

### onBeforeRouteLeave()

```typescript
public onBeforeRouteLeave(): boolean
```

**Propósito:** Hook de navegación para prevenir salida con cambios sin guardar.

**Retorna:** `true` para permitir navegación, `false` para bloquearla

**Ubicación:** Línea 874

**Comportamiento:**
- Por defecto retorna `true` (permitir navegación)
- Puede sobreescribirse en subclases
- Usado por `Application.changeView()` internamente

**Ejemplo por defecto:**

```typescript
export class Product extends BaseEntity {
    // ...
}

const product = new Product({ name: 'Widget' });
console.log(product.onBeforeRouteLeave()); // true (siempre permite)
```

**Uso real en Application:**

```typescript
// Application.changeView() usa getDirtyState() en lugar de onBeforeRouteLeave()
changeView = (entityClass, component, viewType, entity) => {
    if(this.View.value.entityObject && this.View.value.entityObject.getDirtyState()) {
        // Mostrar confirmación si hay cambios sin guardar
        this.ApplicationUIService.openConfirmationMenu(...);
        return;
    }
    this.setViewChanges(entityClass, component, viewType, entity);
}
```

**Sobreescribir para lógica custom:**

```typescript
export class SpecialProduct extends BaseEntity {
    override onBeforeRouteLeave(): boolean {
        // Lógica custom de validación
        if (this.price < 0) {
            alert('Precio no puede ser negativo');
            return false; // Bloquear navegación
        }
        return true; // Permitir navegación
    }
}
```

---

## 📋 Ejemplo Completo: Flujo de Estado

```typescript
// ========================================
// 1. Crear entidad con estado inicial
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

const order = new Order({
    orderNumber: 'ORD-001',
    total: 500,
    status: 'pending'
});

// Estado inicial:
console.log(order.getLoadingState()); // false
console.log(order.getDirtyState());   // false
console.log(order._originalState);    // { orderNumber: 'ORD-001', total: 500, status: 'pending' }

// ========================================
// 2. Cargar datos adicionales
// ========================================

order.setLoading();
console.log(order.getLoadingState()); // true

// Simular fetch...
await new Promise(resolve => setTimeout(resolve, 1000));

order.loaded();
console.log(order.getLoadingState()); // false

// ========================================
// 3. Modificar datos (dirty state)
// ========================================

order.total = 600;
order.status = 'processing';

console.log(order.getDirtyState()); // true

// Ver conversiones:
console.log(order.toObject());
// { orderNumber: 'ORD-001', total: 600, status: 'processing', _isLoading: false, _originalState: {...}, ... }

console.log(order.toPersistentObject());
// { orderNumber: 'ORD-001', total: 600, status: 'processing' }

// ========================================
// 4. Cancelar cambios
// ========================================

order.resetChanges();

console.log(order.total);            // 500 (valor original)
console.log(order.status);           // 'pending' (valor original)
console.log(order.getDirtyState());  // false

// ========================================
// 5. Guardar cambios
// ========================================

order.total = 700;
order.status = 'completed';

await order.save();

// Después de save():
console.log(order.getDirtyState()); // false (snapshot actualizado)
console.log(order._originalState);  // { orderNumber: 'ORD-001', total: 700, status: 'completed' }

// ========================================
// 6. Prevenir navegación con cambios
// ========================================

order.total = 800;

// Intentar cambiar vista
Application.changeView(Product, ProductListView, ViewTypes.LISTVIEW);

// → Muestra diálogo: "Tienes cambios sin guardar. ¿Estás seguro?"
```

---

## ⚠️ Consideraciones Importantes

### 1. _originalState Usa toPersistentObject()

El snapshot inicial se crea con `toPersistentObject()`, NO con `toObject()`:

```typescript
constructor(data: Record<string, any>) {
    Object.assign(this, data);
    this._originalState = structuredClone(this.toPersistentObject());
    // ← Solo captura propiedades decoradas
}
```

**Consecuencia:** Cambios en propiedades NO decoradas no se detectan como dirty:

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    temporaryFlag: boolean = false;  // Sin @PropertyName
}

const product = new Product({ name: 'Widget' });

product.temporaryFlag = true;
console.log(product.getDirtyState()); // false (temporaryFlag no está en _originalState)

product.name = 'New Name';
console.log(product.getDirtyState()); // true (name sí está en _originalState)
```

### 2. getDirtyState() Usa Comparación por JSON

La comparación se hace convirtiendo a JSON:

```typescript
JSON.stringify(this._originalState) !== JSON.stringify(this.toPersistentObject())
```

**Limitaciones:**
- Objetos con propiedades en diferente orden se consideran iguales
- Valores `undefined` vs ausentes se tratan diferente
- No detecta cambios en métodos o funciones

### 3. resetChanges() Usa structuredClone()

```typescript
Object.assign(this, structuredClone(this._originalState));
```

**Ventajas:**
- Clonación profunda de objetos anidados
- Previene referencias compartidas

**Limitación:**
- No clona funciones ni métodos

### 4. isNull() Solo Para Patrón Null Object

`isNull()` NO verifica si las propiedades son nulas/vacías, solo si la entidad ES una `EmptyEntity`:

```typescript
const product = new Product({ name: '', price: 0 });
console.log(product.isNull()); // false (aunque name esté vacío)

const emptyProduct = new EmptyEntity({});
console.log(emptyProduct.isNull()); // true
```

---

## 🔗 Referencias

- **Constructor:** `base-entity-core.md`
- **CRUD Operations:** `crud-operations.md`
- **Lifecycle Hooks:** `lifecycle-hooks.md`
- **Application Navigation:** `../../03-application/application-singleton.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Archivo fuente:** `src/entities/base_entitiy.ts` (líneas 57-887)  
**Estado:** ✅ Completo
