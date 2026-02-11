# 🔧 BaseEntity - Métodos Estáticos

**Referencias:**
- `base-entity-core.md` - Conceptos básicos de BaseEntity
- `metadata-access.md` - Acceso a metadatos desde instancias
- `../../01-decorators/module-name-decorator.md` - @ModuleName
- `../../01-decorators/module-icon-decorator.md` - @ModuleIcon
- `../../01-decorators/property-name-decorator.md` - @PropertyName

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts`  
**Clase:** `export abstract class BaseEntity`

---

## 🎯 Propósito

Los **métodos estáticos** de BaseEntity permiten acceder a metadatos y realizar operaciones **a nivel de clase** sin necesidad de crear una instancia. Son fundamentales para:

1. **Metadata de módulo** - Obtener nombre, icono, permisos
2. **Metadata de propiedades** - Obtener nombres legibles, tipos
3. **Componentes personalizados** - Obtener vistas custom
4. **Creación de instancias** - Factory method
5. **CRUD estático** - Cargar datos sin instancia previa

**Concepto fundamental:**  
> Los métodos estáticos operan sobre la **clase en sí**, no sobre instancias individuales. Útiles para obtener configuración y metadata antes de crear objetos.

---

## 📦 Métodos de Módulo

### getModuleName()

```typescript
public static getModuleName(): string | undefined
```

**Propósito:** Obtiene el nombre del módulo definido por `@ModuleName()`.

**Retorna:** Nombre del módulo (singular) o `undefined` si no está decorado

**Ubicación:** Línea 218

**Ejemplo:**

```typescript
@ModuleName('Product', 'Products')
@ModuleIcon('box')
export class Product extends BaseEntity {
    // ...
}

const moduleName = Product.getModuleName();
console.log(moduleName); // 'Product'

// Sin @ModuleName
export class MyClass extends BaseEntity {
    // ...
}

console.log(MyClass.getModuleName()); // undefined
```

**Uso en Application:**

```typescript
// application.ts - Línea 155
private setViewChanges = (entityClass: typeof BaseEntity, ...) => {
    const moduleName = entityClass.getModuleName() || entityClass.name;
    const moduleNameLower = moduleName.toLowerCase();
    // Navegar a /${moduleNameLower}
}
```

**Uso en SideBar:**

```typescript
// SideBarComponent.vue
Application.ModuleList.value.forEach(entityClass => {
    const displayName = entityClass.getModuleName();
    // Mostrar en menú lateral
});
```

---

### getModuleIcon()

```typescript
public static getModuleIcon(): string | undefined
```

**Propósito:** Obtiene el icono del módulo definido por `@ModuleIcon()`.

**Retorna:** Nombre del icono o `undefined`

**Ubicación:** Línea 226

**Ejemplo:**

```typescript
@ModuleName('User', 'Users')
@ModuleIcon('user-circle')
export class User extends BaseEntity {
    // ...
}

const icon = User.getModuleIcon();
console.log(icon); // 'user-circle'
```

**Uso en SideBar:**

```vue
<template>
    <div v-for="entityClass in modules" :key="entityClass.name">
        <i :class="entityClass.getModuleIcon()"></i>
        {{ entityClass.getModuleName() }}
    </div>
</template>
```

---

### getModulePermission()

```typescript
public static getModulePermission(): string | undefined
```

**Propósito:** Obtiene el permiso requerido definido por `@ModulePermission()`.

**Retorna:** String de permiso o `undefined`

**Ubicación:** Línea 222

**Ejemplo:**

```typescript
@ModuleName('Invoice', 'Invoices')
@ModulePermission('billing.invoices.view')
export class Invoice extends BaseEntity {
    // ...
}

const permission = Invoice.getModulePermission();
console.log(permission); // 'billing.invoices.view'

// Verificar si usuario tiene permiso
if (currentUser.hasPermission(permission)) {
    // Mostrar módulo
}
```

**Uso en filtrado de módulos:**

```typescript
const availableModules = Application.ModuleList.value.filter(entityClass => {
    const requiredPermission = entityClass.getModulePermission();
    return !requiredPermission || currentUser.hasPermission(requiredPermission);
});
```

---

## 🎨 Métodos de Componentes

### getModuleDefaultComponent()

```typescript
public static getModuleDefaultComponent(): Component
```

**Propósito:** Obtiene el componente por defecto para el módulo (definido por `@ModuleDefaultComponent()`).

**Retorna:** Componente Vue (por defecto `DefaultListview`)

**Ubicación:** Línea 234

**Ejemplo:**

```typescript
import CustomDashboard from './CustomDashboard.vue';

@ModuleName('Dashboard', 'Dashboards')
@ModuleDefaultComponent(CustomDashboard)
export class Dashboard extends BaseEntity {
    // ...
}

const component = Dashboard.getModuleDefaultComponent();
console.log(component); // CustomDashboard

// Sin @ModuleDefaultComponent
@ModuleName('Product', 'Products')
export class Product extends BaseEntity {
    // ...
}

const defaultComp = Product.getModuleDefaultComponent();
console.log(defaultComp); // DefaultListview (por defecto)
```

**Uso en Application:**

```typescript
changeViewToDefaultView = (entityClass: typeof BaseEntity) => {
    this.changeView(
        entityClass, 
        entityClass.getModuleDefaultComponent(),  // ← Componente por defecto
        ViewTypes.DEFAULTVIEW
    );
}
```

---

### getModuleListComponent()

```typescript
public static getModuleListComponent(): Component
```

**Propósito:** Obtiene el componente de listado para el módulo (definido por `@ModuleListComponent()`).

**Retorna:** Componente Vue (por defecto `DefaultListview`)

**Ubicación:** Línea 230

**Ejemplo:**

```typescript
import ProductGridView from './ProductGridView.vue';

@ModuleName('Product', 'Products')
@ModuleListComponent(ProductGridView)
export class Product extends BaseEntity {
    // ...
}

const listComp = Product.getModuleListComponent();
console.log(listComp); // ProductGridView

// Sin decorador
@ModuleName('User', 'Users')
export class User extends BaseEntity {
    // ...
}

const defaultList = User.getModuleListComponent();
console.log(defaultList); // DefaultListview
```

**Uso en Application:**

```typescript
changeViewToListView = (entityClass: typeof BaseEntity) => {
    this.changeView(
        entityClass, 
        entityClass.getModuleListComponent(),  // ← Vista de lista
        ViewTypes.LISTVIEW, 
        null
    );
}
```

---

### getModuleDetailComponent()

```typescript
public static getModuleDetailComponent(): Component
```

**Propósito:** Obtiene el componente de detalle para el módulo (definido por `@ModuleDetailComponent()`).

**Retorna:** Componente Vue (por defecto `DefaultDetailView`)

**Ubicación:** Línea 238

**Ejemplo:**

```typescript
import ProductFormView from './ProductFormView.vue';

@ModuleName('Product', 'Products')
@ModuleDetailComponent(ProductFormView)
export class Product extends BaseEntity {
    // ...
}

const detailComp = Product.getModuleDetailComponent();
console.log(detailComp); // ProductFormView

// Sin decorador
@ModuleName('Order', 'Orders')
export class Order extends BaseEntity {
    // ...
}

const defaultDetail = Order.getModuleDetailComponent();
console.log(defaultDetail); // DefaultDetailView
```

**Uso en Application:**

```typescript
changeViewToDetailView = <T extends BaseEntity>(entity: T) => {
    var entityClass = entity.constructor as typeof BaseEntity;
    this.changeView(
        entityClass, 
        entityClass.getModuleDetailComponent(),  // ← Vista de detalle
        ViewTypes.DETAILVIEW, 
        entity
    );
}
```

---

### getModuleCustomComponents()

```typescript
public static getModuleCustomComponents(): Map<string, Component> | null
```

**Propósito:** Obtiene el mapa de componentes custom (definido por `@ModuleCustomComponents()`).

**Retorna:** `Map<string, Component>` o `null` si no hay componentes custom

**Ubicación:** Línea 242

**Ejemplo:**

```typescript
import ProductDashboard from './ProductDashboard.vue';
import ProductAnalytics from './ProductAnalytics.vue';

@ModuleName('Product', 'Products')
@ModuleCustomComponents(new Map([
    ['dashboard', ProductDashboard],
    ['analytics', ProductAnalytics]
]))
export class Product extends BaseEntity {
    // ...
}

const customComponents = Product.getModuleCustomComponents();
console.log(customComponents);
// Map {
//   'dashboard' => ProductDashboard,
//   'analytics' => ProductAnalytics
// }

// Obtener componente específico
const dashboardComp = customComponents?.get('dashboard');

// Sin decorador
@ModuleName('User', 'Users')
export class User extends BaseEntity {
    // ...
}

console.log(User.getModuleCustomComponents()); // null
```

**Uso en navegación:**

```typescript
const navigateToCustomView = (entityClass: typeof BaseEntity, viewId: string) => {
    const customComponents = entityClass.getModuleCustomComponents();
    const component = customComponents?.get(viewId);
    
    if (component) {
        Application.changeView(entityClass, component, ViewTypes.CUSTOMVIEW);
    } else {
        console.error(`Vista custom "${viewId}" no encontrada`);
    }
};

navigateToCustomView(Product, 'dashboard');
```

---

## 📝 Métodos de Propiedades

### getProperties()

```typescript
public static getProperties(): Record<string, string>
```

**Propósito:** Obtiene el mapa de propiedades decoradas con `@PropertyName()`, excluyendo arrays.

**Retorna:** Objeto donde keys son nombres de propiedad y valores son nombres legibles

**Ubicación:** Línea 137

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    @PropertyName('Tags', Array)
    tags!: string[];
    
    @PropertyName('Category', Object)
    category!: Category;
}

const properties = Product.getProperties();
console.log(properties);
// {
//   name: 'Product Name',
//   price: 'Price',
//   category: 'Category'
// }
// ← 'tags' NO se incluye (es Array)
```

**Implementación interna:**

```typescript
public static getProperties(): Record<string, string> {
    const proto = this.prototype as any;
    const properties = proto[PROPERTY_NAME_KEY] || {};
    const propertyTypes = this.getPropertyTypes();
    const filtered: Record<string, string> = {};
    
    for (const key of Object.keys(properties)) {
        if (propertyTypes[key] !== Array) {
            filtered[key] = properties[key];
        }
    }
    
    return filtered;
}
```

**Uso en formularios:**

```typescript
// Generar inputs para todas las propiedades
const properties = Product.getProperties();

Object.keys(properties).forEach(key => {
    const label = properties[key];
    const type = Product.getPropertyType(key);
    
    // Crear input según tipo
    if (type === String) {
        renderTextInput(key, label);
    } else if (type === Number) {
        renderNumberInput(key, label);
    }
});
```

---

### getAllPropertiesNonFilter()

```typescript
public static getAllPropertiesNonFilter(): Record<string, string>
```

**Propósito:** Obtiene TODAS las propiedades decoradas con `@PropertyName()`, incluyendo arrays.

**Retorna:** Objeto completo sin filtrado

**Ubicación:** Línea 130

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Tags', Array)
    tags!: string[];
    
    @PropertyName('Price', Number)
    price!: number;
}

const allProps = Product.getAllPropertiesNonFilter();
console.log(allProps);
// {
//   name: 'Name',
//   tags: 'Tags',    // ← Incluido
//   price: 'Price'
// }

const filteredProps = Product.getProperties();
console.log(filteredProps);
// {
//   name: 'Name',
//   price: 'Price'
// }
// ← 'tags' excluido
```

**Uso en toPersistentObject():**

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

### getPropertyNameByKey()

```typescript
public static getPropertyNameByKey(propertyKey: string): string | undefined
```

**Propósito:** Obtiene el nombre legible de una propiedad dado su key.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad (camelCase)

**Retorna:** Nombre legible definido en `@PropertyName()` o `undefined`

**Ubicación:** Línea 212

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('First Name', String)
    firstName!: string;
    
    @PropertyName('Email Address', String)
    email!: string;
}

const label1 = User.getPropertyNameByKey('firstName');
console.log(label1); // 'First Name'

const label2 = User.getPropertyNameByKey('email');
console.log(label2); // 'Email Address'

const label3 = User.getPropertyNameByKey('nonExistent');
console.log(label3); // undefined
```

**Uso en componentes de input:**

```vue
<script setup>
const props = defineProps<{
    entityClass: typeof BaseEntity;
    propertyKey: string;
}>();

const label = computed(() => 
    props.entityClass.getPropertyNameByKey(props.propertyKey) || props.propertyKey
);
</script>

<template>
    <label>{{ label }}</label>
    <input v-model="entity[propertyKey]" />
</template>
```

**Uso en useInputMetadata:**

```typescript
// src/composables/useInputMetadata.ts
export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata {
    const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;
    // ...
}
```

---

### getPropertyTypes()

```typescript
public static getPropertyTypes(): Record<string, any>
```

**Propósito:** Obtiene el mapa de tipos de todas las propiedades.

**Retorna:** Objeto donde keys son nombres de propiedad y valores son sus tipos

**Ubicación:** Línea 149

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    @PropertyName('Active', Boolean)
    active!: boolean;
    
    @PropertyName('Category', Object)
    category!: Category;
    
    @PropertyName('Tags', Array)
    tags!: string[];
}

const types = Product.getPropertyTypes();
console.log(types);
// {
//   name: String,
//   price: Number,
//   active: Boolean,
//   category: Object,
//   tags: Array
// }
```

**Uso en generación dinámica de inputs:**

```typescript
const types = Product.getPropertyTypes();

Object.keys(types).forEach(key => {
    const type = types[key];
    
    switch (type) {
        case String:
            renderTextInput(key);
            break;
        case Number:
            renderNumberInput(key);
            break;
        case Boolean:
            renderCheckbox(key);
            break;
        case Object:
            renderObjectSelector(key);
            break;
        case Array:
            renderArrayInput(key);
            break;
    }
});
```

---

### getPropertyType()

```typescript
public static getPropertyType(propertyKey: string): any | undefined
```

**Propósito:** Obtiene el tipo de una propiedad específica.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad

**Retorna:** Tipo (String, Number, Boolean, Object, Array) o `undefined`

**Ubicación:** Línea 157

**Ejemplo:**

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order Number', String)
    orderNumber!: string;
    
    @PropertyName('Total', Number)
    total!: number;
    
    @PropertyName('Items', Array)
    items!: OrderItem[];
}

console.log(Order.getPropertyType('orderNumber')); // String
console.log(Order.getPropertyType('total'));       // Number
console.log(Order.getPropertyType('items'));       // Array
console.log(Order.getPropertyType('unknown'));     // undefined
```

**Uso en validación:**

```typescript
const validateProperty = (entityClass: typeof BaseEntity, key: string, value: any) => {
    const expectedType = entityClass.getPropertyType(key);
    
    if (expectedType === Number && typeof value !== 'number') {
        throw new Error(`Propiedad ${key} debe ser Number`);
    }
    
    if (expectedType === String && typeof value !== 'string') {
        throw new Error(`Propiedad ${key} debe ser String`);
    }
};
```

---

### getArrayPropertyType()

```typescript
public static getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined
```

**Propósito:** Obtiene el tipo de elementos de un array de entidades.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad array

**Retorna:** Clase BaseEntity de los elementos o `undefined` si no es array de entidades

**Ubicación:** Línea 170

**Ejemplo:**

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order Items', Array)
    @ArrayElementType(OrderItem)
    items!: OrderItem[];
    
    @PropertyName('Tags', Array)
    tags!: string[];  // Array de strings, no entidades
}

// Array de entidades
const itemType = Order.getArrayPropertyType('items');
console.log(itemType); // OrderItem (clase)

// Array de primitivos
const tagType = Order.getArrayPropertyType('tags');
console.log(tagType); // undefined

// No es array
const otherType = Order.getArrayPropertyType('orderNumber');
console.log(otherType); // undefined
```

**Implementación interna:**

```typescript
public static getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined {
    const propertyType = this.getPropertyType(propertyKey);
    
    if (propertyType !== Array) {
        return undefined;
    }
    
    const proto = this.prototype as any;
    const arrayTypes = proto[ARRAY_ELEMENT_TYPE_KEY] || {};
    const entityType = arrayTypes[propertyKey];
    
    if (entityType && entityType.prototype instanceof BaseEntity) {
        return entityType;
    }
    
    return undefined;
}
```

**Uso en ArrayInputComponent:**

```typescript
// Detectar si es array de entidades
const elementType = entityClass.getArrayPropertyType(propertyKey);

if (elementType) {
    // Es array de entidades - mostrar lista con lookup
    renderEntityArrayInput(elementType);
} else {
    // Es array de primitivos - mostrar input de tags
    renderPrimitiveArrayInput();
}
```

---

### getCSSClasses()

```typescript
public static getCSSClasses(): Record<string, string>
```

**Propósito:** Obtiene el mapa de clases CSS definidas por `@CSSColumnClass()`.

**Retorna:** Objeto con clases CSS por propiedad

**Ubicación:** Línea 214

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    @CSSColumnClass('col-md-6')
    name!: string;
    
    @PropertyName('Description', String)
    @CSSColumnClass('col-md-12')
    description!: string;
    
    @PropertyName('Price', Number)
    @CSSColumnClass('col-md-3')
    price!: number;
}

const cssClasses = Product.getCSSClasses();
console.log(cssClasses);
// {
//   name: 'col-md-6',
//   description: 'col-md-12',
//   price: 'col-md-3'
// }
```

**Uso en layout de formulario:**

```vue
<template>
    <div class="row">
        <div 
            v-for="key in propertyKeys" 
            :key="key"
            :class="getCSSClass(key)"
        >
            <InputComponent :property-key="key" />
        </div>
    </div>
</template>

<script setup>
const getCSSClass = (key: string) => {
    const classes = entityClass.getCSSClasses();
    return classes[key] || 'col-md-12'; // Default full width
};
</script>
```

---

## 🏭 Factory Method

### createNewInstance()

```typescript
public static createNewInstance<T extends BaseEntity>(
    this: new (data: Record<string, any>) => T
): T
```

**Propósito:** Crea una nueva instancia vacía de la entidad (factory method).

**Retorna:** Nueva instancia con objeto vacío

**Ubicación:** Línea 287

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
}

// Crear instancia vacía
const newProduct = Product.createNewInstance();

console.log(newProduct instanceof Product); // true
console.log(newProduct.name);               // undefined
console.log(newProduct.price);              // undefined
console.log(newProduct._isLoading);         // false
console.log(newProduct._originalState);     // {}
```

**Uso en New Button:**

```typescript
// NewButtonComponent.vue
const createNew = () => {
    const entityClass = Application.View.value.entityClass;
    if (!entityClass) return;
    
    const newEntity = entityClass.createNewInstance();
    Application.changeViewToDetailView(newEntity);
};
```

**Diferencia con constructor:**

```typescript
// Usando constructor (requiere datos)
const product1 = new Product({ name: 'Widget', price: 100 });

// Usando factory (instancia vacía)
const product2 = Product.createNewInstance();

// Equivalente a:
const product3 = new Product({});
```

---

## 🔑 Métodos de Mapeo de PersistentKeys

### getPersistentKeys()

```typescript
public static getPersistentKeys(): Record<string, string>
```

**Propósito:** Obtiene el mapeo completo de propiedades internas a claves persistentes (API keys).

**Retorna:** Objeto con mapeo `propertyKey -> persistentKey`

**Ubicación:** Línea ~476

**Ejemplo:**

```typescript
@Persistent()
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    @PersistentKey('product_id')
    id?: number;
    
    @PropertyName('Name', String)
    @PersistentKey('product_name')
    name!: string;
    
    @PropertyName('Price', Number)
    @PersistentKey('product_price')
    price!: number;
}

const persistentKeys = Product.getPersistentKeys();
console.log(persistentKeys);
// {
//   id: 'product_id',
//   name: 'product_name',
//   price: 'product_price'
// }
```

**Usado en:** `toDictionary()`, `toPersistentObject()`, mapeo de respuestas API

---

### getPersistentKeyByPropertyKey()

```typescript
public static getPersistentKeyByPropertyKey(propertyKey: string): string | undefined
```

**Propósito:** Obtiene la clave persistente (API key) asociada a una propiedad interna.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad interna (camelCase)

**Retorna:** Clave persistente o `undefined` si no tiene `@PersistentKey`

**Ubicación:** Línea ~474

**Ejemplo:**

```typescript
@Persistent()
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    @PersistentKey('user_id')
    id?: number;
    
    @PropertyName('Email', String)
    @PersistentKey('email_address')
    email!: string;
    
    @PropertyName('Name', String)
    name!: string;  // Sin @PersistentKey
}

const idKey = User.getPersistentKeyByPropertyKey('id');
console.log(idKey); // 'user_id'

const emailKey = User.getPersistentKeyByPropertyKey('email');
console.log(emailKey); // 'email_address'

const nameKey = User.getPersistentKeyByPropertyKey('name');
console.log(nameKey); // undefined
```

**Uso en serialización:**

```typescript
public toDictionary(): Record<string, any> {
    const result: Record<string, any> = {};
    const keys = this.getKeys();
    
    for (const key of keys) {
        const persistentKey = (this.constructor as typeof BaseEntity)
            .getPersistentKeyByPropertyKey(key);
        
        const outputKey = persistentKey || key;
        result[outputKey] = this[key];
    }
    
    return result;
}
```

---

### getPropertyKeyByPersistentKey()

```typescript
public static getPropertyKeyByPersistentKey(persistentKey: string): string | undefined
```

**Propósito:** Obtiene la propiedad interna asociada a una clave persistente (inverso de `getPersistentKeyByPropertyKey`).

**Parámetros:**
- `persistentKey: string` - Clave persistente de la API (snake_case)

**Retorna:** Property key interna o `undefined` si no encuentra

**Ubicación:** Línea ~479

**Ejemplo:**

```typescript
@Persistent()
export class Order extends BaseEntity {
    @PropertyName('Order Number', String)
    @PersistentKey('order_number')
    orderNumber!: string;
    
    @PropertyName('Total', Number)
    @PersistentKey('order_total')
    total!: number;
}

const prop1 = Order.getPropertyKeyByPersistentKey('order_number');
console.log(prop1); // 'orderNumber'

const prop2 = Order.getPropertyKeyByPersistentKey('order_total');
console.log(prop2); // 'total'

const prop3 = Order.getPropertyKeyByPersistentKey('unknown_key');
console.log(prop3); // undefined
```

**Uso en deserialización:**

```typescript
async function mapFromPersistentKeys(apiData: Record<string, any>) {
    const mapped: Record<string, any> = {};
    
    for (const [persistentKey, value] of Object.entries(apiData)) {
        const propertyKey = Order.getPropertyKeyByPersistentKey(persistentKey);
        
        if (propertyKey) {
            mapped[propertyKey] = value;
        } else {
            // Usar clave original si no hay mapeo
            mapped[persistentKey] = value;
        }
    }
    
    return new Order(mapped);
}

// API retorna: { order_number: 'ORD-001', order_total: 500 }
// Se mapea a: { orderNumber: 'ORD-001', total: 500 }
```

**Flujo de mapeo bidireccional:**

```
┌─────────────────────┐
│  Objeto Interno     │  propertyKey: 'orderNumber'
│  (TypeScript/Vue)   │  ↓ getPersistentKeyByPropertyKey('orderNumber')
└─────────────────────┘  ↓
          ↓              persistentKey: 'order_number'
          ↓              
┌─────────────────────┐
│  toDictionary()     │  Serializar para API
│  Enviar a API       │  → { order_number: 'ORD-001' }
└─────────────────────┘
          ↓
          ↓ API Response: { order_number: 'ORD-002', order_total: 600 }
          ↓
┌─────────────────────┐  persistentKey: 'order_number'
│  Respuesta API      │  ↓ getPropertyKeyByPersistentKey('order_number')
│  (snake_case)       │  ↓ 
└─────────────────────┘  propertyKey: 'orderNumber'
          ↓
          ↓
┌─────────────────────┐
│  mapFromPersistent  │  Deserializar desde API
│  Objeto Interno     │  → { orderNumber: 'ORD-002', total: 600 }
└─────────────────────┘
```

---

## 🌐 Métodos CRUD Estáticos

### getElement()

```typescript
public static async getElement<T extends BaseEntity>(
    this: new (data: Record<string, any>) => T, 
    oid: string
): Promise<T>
```

**Propósito:** Obtiene una entidad individual de la API por su ID único.

**Parámetros:**
- `oid: string` - ID único de la entidad

**Retorna:** Promise con instancia de la entidad

**Ubicación:** Línea 657

**Ejemplo:**

```typescript
@Persistent()
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('ID', Number)
    id?: number;
    
    @PropertyName('Name', String)
    name!: string;
}

// Cargar producto con ID 5
try {
    const product = await Product.getElement('5');
    
    console.log(product instanceof Product); // true
    console.log(product.id);                 // 5
    console.log(product.name);               // 'Widget'
} catch (error) {
    console.error('Error al cargar:', error);
}
```

**Flujo interno:**

```typescript
// 1. GET /api/products/5
// 2. Response: { product_id: 5, product_name: 'Widget', ... }
// 3. mapFromPersistentKeys() → { id: 5, name: 'Widget', ... }
// 4. new Product({ id: 5, name: 'Widget' })
// 5. afterGetElement() hook
```

**Manejo de errores:**

```typescript
try {
    const product = await Product.getElement('999');
} catch (error) {
    // Error automáticamente mostrado en diálogo de confirmación
    // getElementFailed() hook ejecutado
}
```

---

### getElementList()

```typescript
public static async getElementList<T extends BaseEntity>(
    this: new (data: Record<string, any>) => T, 
    filter: string = ''
): Promise<T[]>
```

**Propósito:** Obtiene una lista de entidades de la API con filtro opcional.

**Parámetros:**
- `filter: string` - Query param para filtrado (opcional)

**Retorna:** Promise con array de instancias

**Ubicación:** Línea 686

**Ejemplo:**

```typescript
@Persistent()
@ApiEndpoint('/api/users')
export class User extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Status', String)
    status!: string;
}

// Obtener todos los usuarios
const allUsers = await User.getElementList();
console.log(allUsers.length); // 50

// Obtener con filtro
const activeUsers = await User.getElementList('status=active');
console.log(activeUsers.length); // 30
```

**Flujo interno:**

```typescript
// 1. GET /api/users?filter=status=active
// 2. Response: [{ user_id: 1, user_name: 'Alice', ... }, ...]
// 3. Para cada item: mapFromPersistentKeys() → objeto interno
// 4. new User(mappedData) para cada item
// 5. afterGetElementList() hook en primer elemento
```

**Uso en DefaultListView:**

```typescript
// default_listview.vue
const loadData = async () => {
    const entityClass = Application.View.value.entityClass;
    if (!entityClass) return;
    
    try {
        const entities = await entityClass.getElementList();
        displayedEntities.value = entities;
    } catch (error) {
        console.error('Error al cargar lista:', error);
    }
};
```

---

## ⚡ Métodos Estáticos vs Instancia

Muchos métodos tienen versiones estáticas y de instancia:

| Método Estático | Método de Instancia | Diferencia |
|----------------|---------------------|------------|
| `Product.getProperties()` | `product.getKeys()` | Estático retorna mapa completo, instancia retorna keys ordenadas |
| `Product.getPropertyType('name')` | `product.getPropertyType('name')` | Ambos retornan lo mismo, instancia delega a estático |
| `Product.getArrayPropertyType('items')` | `product.getArrayPropertyType('items')` | Instancia delega a estático |
| `Product.createNewInstance()` | `new Product({})` | Factory vs constructor directo |
| `Product.getElement('5')` | `product.refresh()` | Estático carga nuevo, instancia recarga existente |

**Cuándo usar estático:**
- Cuando NO tienes una instancia
- Para obtener metadata de la clase
- Para cargar datos de la API
- En Application, componentes globales

**Cuándo usar instancia:**
- Cuando YA tienes un objeto
- Para acceder a datos específicos de ese objeto
- En formularios, vistas de detalle

---

## 📋 Ejemplo Completo: Uso de Métodos Estáticos

```typescript
// ========================================
// 1. Metadata del Módulo
// ========================================

@ModuleName('Product', 'Products')
@ModuleIcon('box')
@ModulePermission('products.view')
@ModuleListComponent(ProductGridView)
@ModuleDetailComponent(ProductFormView)
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
}

// Obtener metadata
const moduleName = Product.getModuleName();     // 'Product'
const icon = Product.getModuleIcon();           // 'box'
const permission = Product.getModulePermission(); // 'products.view'

// Obtener componentes
const listComp = Product.getModuleListComponent();     // ProductGridView
const detailComp = Product.getModuleDetailComponent(); // ProductFormView

// ========================================
// 2. Metadata de Propiedades
// ========================================

const properties = Product.getProperties();
// { name: 'Name', price: 'Price' }

const nameLabel = Product.getPropertyNameByKey('name');
// 'Name'

const types = Product.getPropertyTypes();
// { name: String, price: Number }

const nameType = Product.getPropertyType('name');
// String

// ========================================
// 3. Crear Instancia Nueva
// ========================================

const newProduct = Product.createNewInstance();
console.log(newProduct.name); // undefined

// ========================================
// 4. Cargar Datos de API
// ========================================

// Cargar uno
const product = await Product.getElement('5');
console.log(product.name); // 'Widget'

// Cargar lista
const products = await Product.getElementList('category=electronics');
console.log(products.length); // 25

// ========================================
// 5. Generar UI Dinámicamente
// ========================================

// Menú lateral
Application.ModuleList.value.forEach(entityClass => {
    const name = entityClass.getModuleName();
    const icon = entityClass.getModuleIcon();
    
    addMenuItem(name, icon);
});

// Formulario dinámico
const properties = Product.getProperties();
Object.keys(properties).forEach(key => {
    const label = Product.getPropertyNameByKey(key);
    const type = Product.getPropertyType(key);
    
    renderInput(key, label, type);
});
```

---

## ⚠️ Consideraciones Importantes

### 1. Métodos Estáticos Requieren Decoradores

Si una entidad NO tiene decoradores, los métodos estáticos retornan `undefined` o valores por defecto:

```typescript
export class UnDecoratedEntity extends BaseEntity {
    name!: string;
}

console.log(UnDecoratedEntity.getModuleName());   // undefined
console.log(UnDecoratedEntity.getProperties());   // {}
console.log(UnDecoratedEntity.getPropertyTypes()); // {}
```

### 2. createNewInstance() vs new Class({})

Son equivalentes:

```typescript
const product1 = Product.createNewInstance();
const product2 = new Product({});

// Ambos son iguales
```

### 3. getElement() y getElementList() Requieren @Persistent

```typescript
@ModuleName('ViewModel', 'ViewModels')  // Sin @Persistent ni @ApiEndpoint
export class ViewModel extends BaseEntity {
    // ...
}

await ViewModel.getElement('1');
// ❌ Error: ApiEndpoint no definido
```

### 4. Tipos en getPropertyTypes() Son Constructores

```typescript
const types = Product.getPropertyTypes();

console.log(types.name === String);  // true
console.log(types.price === Number); // true

// NO son strings
console.log(types.name === 'string'); // false
```

---

## 🔗 Referencias

- **Module Decorators:** `../../01-decorators/module-name-decorator.md`, `module-icon-decorator.md`, etc.
- **Property Decorators:** `../../01-decorators/property-name-decorator.md`
- **CRUD Operations:** `crud-operations.md`
- **Application Integration:** `../../03-application/application-singleton.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Archivo fuente:** `src/entities/base_entitiy.ts`  
**Estado:** ✅ Completo
