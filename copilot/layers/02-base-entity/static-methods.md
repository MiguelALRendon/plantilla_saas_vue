# BaseEntity: Static Methods System

## 1. Propósito

El sistema de métodos estáticos de BaseEntity permite acceder a metadatos y realizar operaciones a nivel de clase sin necesidad de crear instancias. Provee acceso declarativo a configuración de módulos (nombre, icono, permisos definidos por @ModuleName, @ModuleIcon, @ModulePermission), configuración de componentes UI (default, list, detail, custom definidos por @ModuleDefaultComponent, @ModuleListComponent, @ModuleDetailComponent, @ModuleCustomComponents), metadata de propiedades (nombres legibles, tipos, clases CSS definidos por @PropertyName, @CSSColumnClass), mapeo de persistent keys para conversión API (getPersistentKeys, getPersistentKeyByPropertyKey, getPropertyKeyByPersistentKey), factory method para creación de instancias (createNewInstance), y operaciones CRUD estáticas que no requieren instancia previa (getElement, getElementList). Los métodos estáticos operan sobre prototype de clase leyendo metadata escrita por decoradores durante definición de clase. Son fundamentales para Application singleton que consulta getModuleName/getModuleIcon para construir menú lateral, getModuleDefaultComponent/getModuleListComponent/getModuleDetailComponent para navegación entre vistas, getProperties/getPropertyTypes para generación dinámica de formularios, y getElement/getElementList para carga inicial de datos sin instancia existente.

## 2. Alcance

**Responsabilidades cubiertas:**
- getModuleName(): Retorna string de @ModuleName decorator, nombre singular de módulo, usado en menú lateral y títulos
- getModuleIcon(): Retorna string de @ModuleIcon decorator, nombre de icono para display en UI
- getModulePermission(): Retorna string de @ModulePermission decorator, permiso requerido para acceder a módulo
- getModuleDefaultComponent(): Retorna Component de @ModuleDefaultComponent decorator o DefaultListview por defecto
- getModuleListComponent(): Retorna Component de @ModuleListComponent decorator o DefaultListview por defecto
- getModuleDetailComponent(): Retorna Component de @ModuleDetailComponent decorator o DefaultDetailView por defecto
- getModuleCustomComponents(): Retorna Map<string, Component> de @ModuleCustomComponents decorator o null
- getProperties(): Retorna Record<string, string> con propiedades decoradas EXCLUYENDO arrays (propertyKey → readableName)
- getAllPropertiesNonFilter(): Retorna Record<string, string> con TODAS las propiedades decoradas INCLUYENDO arrays
- getPropertyNameByKey(key): Retorna readable name de propiedad específica o undefined
- getPropertyTypes(): Retorna Record<string, any> con tipos (String, Number, Boolean, Object, Array) de todas las propiedades
- getPropertyType(key): Retorna tipo de propiedad específica (String, Number, etc.) o undefined
- getArrayPropertyType(key): Retorna typeof BaseEntity si array contiene entidades, undefined si array de primitivos o no array
- getCSSClasses(): Retorna Record<string, string> con clases CSS definidas por @CSSColumnClass decorator
- createNewInstance(): Factory method que retorna new this({}) para crear instancia vacía
- getPersistentKeys(): Retorna Record<string, string> con mapeo propertyKey → persistentKey de @PersistentKey decorator
- getPersistentKeyByPropertyKey(key): Convierte property key interna a persistent key para API (camelCase → snake_case)
- getPropertyKeyByPersistentKey(persistentKey): Convierte persistent key de API a property key interna (snake_case → camelCase)
- getElement(oid): Método async que ejecuta HTTP GET para obtener entidad individual por ID, retorna instancia con datos mapeados
- getElementList(filter): Método async que ejecuta HTTP GET para obtener array de entidades, retorna array de instancias

**Límites del alcance:**
- Métodos estáticos solo leen metadata de prototype, NO modifican (escritura es responsabilidad de decoradores)
- getProperties() EXCLUYE arrays, getAllPropertiesNonFilter() INCLUYE arrays (comportamiento diferente)
- getArrayPropertyType() solo detecta arrays de BaseEntity, NO arrays de primitivos (string[], number[])
- Componentes retornan DefaultListview/DefaultDetailView si no hay decoradores, NO null (fallback garantizado)
- createNewInstance() pasa objeto vacío {} a constructor, NO inicializa propiedades con valores default custom
- getElement/getElementList requieren @Persistent y @ApiEndpoint, NO funcionan en entidades solo local
- getPersistentKeyByPropertyKey() retorna undefined si NO tiene @PersistentKey, NO usa fallback a nombre original (caller debe manejar)
- getModuleCustomComponents() retorna null si no hay decorator, NO Map vacío (distinción explícita)
- Métodos NO cachean resultados, leen prototype fresh cada vez (puede ser ineficiente en loops)
- getElement/getElementList NO aceptan objetos request complex, solo string filter básico (limitación de API)

## 3. Definiciones Clave

**Static Method:** Método que pertenece a clase (constructor), NO a instancia. Accedido como Product.getModuleName(), NO product.getModuleName(). Opera sobre prototype donde decoradores escribieron metadata. No tiene acceso a this de instancia.

**getModuleName():** Retorna nombre singular del módulo definido en @ModuleName('Product', 'Products'). Primer argumento del decorator. Usado en títulos de vista, menú lateral, navegación. Retorna undefined si entidad no tiene @ModuleName decorator.

**getModuleIcon():** Retorna string con nombre de icono definido en @ModuleIcon('box'). Usado para renderizar icono en menú lateral, botones, headers. Retorna undefined si no tiene decorator. String debe corresponder a icons disponibles en constants/icons.ts.

**getProperties():** Retorna Record<string, string> con mapeo propertyKey → readableName de SOLO propiedades decoradas con @PropertyName EXCLUYENDO arrays. Filtrado porque arrays tienen UI diferente (ArrayInput). Usado para generar formularios de propiedades simples.

**getAllPropertiesNonFilter():** Retorna Record<string, string> con TODAS las propiedades decoradas con @PropertyName SIN filtrar arrays. Usado en toPersistentObject() que necesita serializar TODO. Diferencia crítica con getProperties().

**getPropertyTypes():** Retorna Record<string, any> donde values son constructors (String, Number, Boolean, Object, Array). NO strings ('string', 'number'). Usado para determinar qué tipo de input renderizar (TextInput, NumberInput, CheckboxInput, ObjectInput, ArrayInput).

**getArrayPropertyType(key):** Retorna typeof BaseEntity si propiedad es array decorada con @ArrayElementType(EntityClass). Retorna undefined si array de primitivos o no array. Critical para distinguir OrderItem[] (entity array) de string[] (primitive array). Determina si usar EntityArrayInput o TagsInput.

**createNewInstance():** Factory method estático que ejecuta new this({}). Equivalente a new Product({}) pero permite llamar sin conocer clase concreta. Usado en NewButtonComponent que recibe typeof BaseEntity genérico. Crea instancia vacía con _originalState = {} y isNew() = true.

**getPersistentKeys():** Retorna Record<string, string> con mapeo completo de TODAS las propiedades que tienen @PersistentKey decorator. Ejemplo: {id: 'product_id', name: 'product_name', price: 'product_price'}. Usado internamente por conversión methods.

**getPersistentKeyByPropertyKey(key):** Convierte property key interna (camelCase JavaScript) a persistent key (snake_case API). Ejemplo: 'firstName' → 'first_name'. Retorna undefined si propiedad NO tiene @PersistentKey. Usado en serialización antes de HTTP POST/PUT.

**getPropertyKeyByPersistentKey(persistentKey):** Operación inversa de getPersistentKeyByPropertyKey. Convierte persistent key de API a property key interna. Ejemplo: 'first_name' → 'firstName'. Retorna undefined si no existe mapeo. Usado en deserialización después de HTTP GET.

**getElement(oid):** Método async estático que ejecuta HTTP GET ${apiEndpoint}/${oid} para obtener entidad individual. Recibe response.data, ejecuta mapFromPersistentKeys(), crea new this(mappedData), ejecuta afterGetElement() hook, retorna instancia. Requiere @Persistent y @ApiEndpoint decorators.

**getElementList(filter):** Método async estático que ejecuta HTTP GET ${apiEndpoint}?filter=${filter} para obtener array. Itera sobre response.data, mapea cada item con mapFromPersistentKeys(), crea new this(mappedData) para cada uno, ejecuta afterGetElementList() en primer elemento, retorna array de instancias.

**Component (Type):** Tipo Vue Component importado de 'vue'. Usado como return type de getModuleDefaultComponent, getModuleListComponent, getModuleDetailComponent. Permite pasar componentes a Application.changeView() para renderizar en ComponentContainer.

**typeof BaseEntity:** Metatype que representa constructor de clase que extiende BaseEntity. Usado en firmas de métodos static como getElement<T extends BaseEntity>(this: new (...args: any[]) => T). Permite typing genérico preservando tipo de retorno (Product.getElement() retorna Product, no BaseEntity).

## 4. Descripción Técnica

### Métodos de Metadata de Módulo

#### getModuleName() - Nombre del Módulo

```typescript
public static getModuleName(): string | undefined
```

Retorna nombre singular del módulo definido en @ModuleName decorator.

**Ubicación:** Línea 218

**Ejemplo:**

```typescript
@ModuleName('Product', 'Products')
@ModuleIcon('box')
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
}

const moduleName = Product.getModuleName();
console.log(moduleName); // 'Product'

export class UnDecoratedEntity extends BaseEntity {}
console.log(UnDecoratedEntity.getModuleName()); // undefined
```

**Uso en Application.setViewChanges():**

```typescript
// application.ts - Línea 155
private setViewChanges = (entityClass: typeof BaseEntity, ...) => {
    const moduleName = entityClass.getModuleName() || entityClass.name;
    const moduleNameLower = moduleName.toLowerCase();
    this.router.push({ name: moduleNameLower });
}
```

**Uso en SideBarComponent:**

```vue
<template>
    <div v-for="entityClass in Application.ModuleList.value" :key="entityClass.name">
        <span>{{ entityClass.getModuleName() }}</span>
    </div>
</template>
```

#### getModuleIcon() - Icono del Módulo

```typescript
public static getModuleIcon(): string | undefined
```

Retorna nombre de icono definido en @ModuleIcon decorator.

**Ubicación:** Línea 226

**Ejemplo:**

```typescript
@ModuleName('User', 'Users')
@ModuleIcon('user-circle')
export class User extends BaseEntity {}

const icon = User.getModuleIcon();
console.log(icon); // 'user-circle'
```

**Uso en SideBar con icono:**

```vue
<template>
    <i :class="entityClass.getModuleIcon()"></i>
    {{ entityClass.getModuleName() }}
</template>
```

#### getModulePermission() - Permiso Requerido

```typescript
public static getModulePermission(): string | undefined
```

Retorna string de permiso definido en @ModulePermission decorator.

**Ubicación:** Línea 222

**Ejemplo:**

```typescript
@ModuleName('Invoice', 'Invoices')
@ModulePermission('billing.invoices.view')
export class Invoice extends BaseEntity {}

const permission = Invoice.getModulePermission();
console.log(permission); // 'billing.invoices.view'
```

**Uso en filtrado de módulos:**

```typescript
const availableModules = Application.ModuleList.value.filter(entityClass => {
    const requiredPermission = entityClass.getModulePermission();
    return !requiredPermission || currentUser.hasPermission(requiredPermission);
});
```

### Métodos de Componentes UI

#### getModuleDefaultComponent() - Componente Default

```typescript
public static getModuleDefaultComponent(): Component
```

Retorna componente definido en @ModuleDefaultComponent o DefaultListview.

**Ubicación:** Línea 234

**Ejemplo:**

```typescript
import CustomDashboard from './CustomDashboard.vue';

@ModuleName('Dashboard', 'Dashboards')
@ModuleDefaultComponent(CustomDashboard)
export class Dashboard extends BaseEntity {}

const component = Dashboard.getModuleDefaultComponent();
console.log(component); // CustomDashboard

@ModuleName('Product', 'Products')
export class Product extends BaseEntity {}

const defaultComp = Product.getModuleDefaultComponent();
console.log(defaultComp); // DefaultListview (fallback)
```

**Uso en Application.changeViewToDefaultView():**

```typescript
changeViewToDefaultView = (entityClass: typeof BaseEntity) => {
    this.changeView(
        entityClass, 
        entityClass.getModuleDefaultComponent(),
        ViewTypes.DEFAULTVIEW
    );
}
```

#### getModuleListComponent() - Componente de Lista

```typescript
public static getModuleListComponent(): Component
```

Retorna componente de lista definido o DefaultListview.

**Ubicación:** Línea 230

**Ejemplo:**

```typescript
import ProductGridView from './ProductGridView.vue';

@ModuleName('Product', 'Products')
@ModuleListComponent(ProductGridView)
export class Product extends BaseEntity {}

const listComp = Product.getModuleListComponent();
console.log(listComp); // ProductGridView
```

#### getModuleDetailComponent() - Componente de Detalle

```typescript
public static getModuleDetailComponent(): Component
```

Retorna componente de detalle definido o DefaultDetailView.

**Ubicación:** Línea 238

**Ejemplo:**

```typescript
import ProductFormView from './ProductFormView.vue';

@ModuleName('Product', 'Products')
@ModuleDetailComponent(ProductFormView)
export class Product extends BaseEntity {}

const detailComp = Product.getModuleDetailComponent();
console.log(detailComp); // ProductFormView
```

**Uso en Application.changeViewToDetailView():**

```typescript
changeViewToDetailView = <T extends BaseEntity>(entity: T) => {
    var entityClass = entity.constructor as typeof BaseEntity;
    this.changeView(
        entityClass, 
        entityClass.getModuleDetailComponent(),
        ViewTypes.DETAILVIEW, 
        entity
    );
}
```

#### getModuleCustomComponents() - Componentes Custom

```typescript
public static getModuleCustomComponents(): Map<string, Component> | null
```

Retorna Map de componentes custom o null si no hay.

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
export class Product extends BaseEntity {}

const customComponents = Product.getModuleCustomComponents();
console.log(customComponents);
// Map { 'dashboard' => ProductDashboard, 'analytics' => ProductAnalytics }

const dashboardComp = customComponents?.get('dashboard');

@ModuleName('User', 'Users')
export class User extends BaseEntity {}

console.log(User.getModuleCustomComponents()); // null (no Map vacío)
```

**Uso en navegación custom:**

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
```

### Métodos de Metadata de Propiedades

#### getProperties() - Propiedades NO Array

```typescript
public static getProperties(): Record<string, string>
```

Retorna propiedades decoradas EXCLUYENDO arrays.

**Ubicación:** Línea 137

**Implementación:**

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
// tags NO incluido (es Array)
```

#### getAllPropertiesNonFilter() - TODAS las Propiedades

```typescript
public static getAllPropertiesNonFilter(): Record<string, string>
```

Retorna TODAS las propiedades decoradas SIN filtrar arrays.

**Ubicación:** Línea 130

**Ejemplo:**

```typescript
const allProps = Product.getAllPropertiesNonFilter();
console.log(allProps);
// {
//   name: 'Product Name',
//   tags: 'Tags',    // INCLUIDO
//   price: 'Price',
//   category: 'Category'
// }
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

#### getPropertyNameByKey(key) - Nombre Legible

```typescript
public static getPropertyNameByKey(propertyKey: string): string | undefined
```

Retorna readable name de propiedad específica.

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

**Uso en useInputMetadata:**

```typescript
export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata {
    const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;
    return { label: propertyName, ... };
}
```

#### getPropertyTypes() - Tipos de Propiedades

```typescript
public static getPropertyTypes(): Record<string, any>
```

Retorna mapeo propertyKey → Constructor (String, Number, Boolean, Object, Array).

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

console.log(types.name === String); // true (Constructor, NO 'string')
```

**Uso en generación de inputs:**

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

#### getPropertyType(key) - Tipo de Propiedad Específica

```typescript
public static getPropertyType(propertyKey: string): any | undefined
```

Retorna tipo de propiedad específica.

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

#### getArrayPropertyType(key) - Tipo de Elementos de Array

```typescript
public static getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined
```

Retorna typeof BaseEntity si array contiene entidades, undefined si primitivos.

**Ubicación:** Línea 170

**Implementación:**

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

**Ejemplo:**

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order Items', Array)
    @ArrayElementType(OrderItem)
    items!: OrderItem[];
    
    @PropertyName('Tags', Array)
    tags!: string[];
}

const itemType = Order.getArrayPropertyType('items');
console.log(itemType); // OrderItem (class)

const tagType = Order.getArrayPropertyType('tags');
console.log(tagType); // undefined (primitive array)
```

**Uso en ArrayInputComponent:**

```typescript
const elementType = entityClass.getArrayPropertyType(propertyKey);

if (elementType) {
    // Array de entidades - EntityArrayInput
    renderEntityArrayInput(elementType);
} else {
    // Array de primitivos - TagsInput
    renderPrimitiveArrayInput();
}
```

#### getCSSClasses() - Clases CSS de Layout

```typescript
public static getCSSClasses(): Record<string, string>
```

Retorna mapeo propertyKey → CSS class string definido en @CSSColumnClass.

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

**Uso en formulario responsive:**

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
    return classes[key] || 'col-md-12';
};
</script>
```

### Factory Method

#### createNewInstance() - Crear Instancia Vacía

```typescript
public static createNewInstance<T extends BaseEntity>(
    this: new (data: Record<string, any>) => T
): T
```

Factory method que ejecuta new this({}).

**Ubicación:** Línea 287

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
}

const newProduct = Product.createNewInstance();

console.log(newProduct instanceof Product); // true
console.log(newProduct.name);               // undefined
console.log(newProduct.price);              // undefined
console.log(newProduct._isLoading);         // false
console.log(newProduct._originalState);     // {}
console.log(newProduct.isNew());            // true
```

**Uso en NewButtonComponent:**

```typescript
const createNew = () => {
    const entityClass = Application.View.value.entityClass;
    if (!entityClass) return;
    
    const newEntity = entityClass.createNewInstance();
    Application.changeViewToDetailView(newEntity);
};
```

**Equivalente a:**

```typescript
const product1 = Product.createNewInstance();
const product2 = new Product({});
// Idénticos
```

### Métodos de Persistent Keys

#### getPersistentKeys() - Mapeo Completo

```typescript
public static getPersistentKeys(): Record<string, string>
```

Retorna mapeo completo propertyKey → persistentKey.

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

#### getPersistentKeyByPropertyKey(key) - Convertir a Persistent

```typescript
public static getPersistentKeyByPropertyKey(propertyKey: string): string | undefined
```

Convierte property key interna a persistent key de API.

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
console.log(nameKey); // undefined (no @PersistentKey)
```

**Uso en serialización:**

```typescript
const outputKey = User.getPersistentKeyByPropertyKey('id') || 'id';
// Si tiene @PersistentKey → 'user_id'
// Si no tiene → usar nombre original 'id'
```

#### getPropertyKeyByPersistentKey(persistentKey) - Convertir de Persistent

```typescript
public static getPropertyKeyByPersistentKey(persistentKey: string): string | undefined
```

Convierte persistent key de API a property key interna (inverso).

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
const apiData = { order_number: 'ORD-001', order_total: 500 };
const mapped: Record<string, any> = {};

for (const [persistentKey, value] of Object.entries(apiData)) {
    const propertyKey = Order.getPropertyKeyByPersistentKey(persistentKey);
    mapped[propertyKey || persistentKey] = value;
}

console.log(mapped);
// { orderNumber: 'ORD-001', total: 500 }
```

### Métodos CRUD

#### getElement(oid) - Obtener Entidad Individual

```typescript
public static async getElement<T extends BaseEntity>(
    this: new (data: Record<string, any>) => T, 
    oid: string
): Promise<T>
```

Ejecuta HTTP GET para obtener entidad por ID.

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

```
1. HTTP GET /api/products/5
2. Response: { product_id: 5, product_name: 'Widget' }
3. mapFromPersistentKeys() → { id: 5, name: 'Widget' }
4. new Product({ id: 5, name: 'Widget' })
5. afterGetElement() hook ejecuta
6. Retorna instancia
```

#### getElementList(filter) - Obtener Lista de Entidades

```typescript
public static async getElementList<T extends BaseEntity>(
    this: new (data: Record<string, any>) => T, 
    filter: string = ''
): Promise<T[]>
```

Ejecuta HTTP GET para obtener array de entidades con filtro opcional.

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

const allUsers = await User.getElementList();
console.log(allUsers.length); // 50

const activeUsers = await User.getElementList('status=active');
console.log(activeUsers.length); // 30
```

**Flujo interno:**

```
1. HTTP GET /api/users?filter=status=active
2. Response: [{ user_id: 1, user_name: 'Alice' }, ...]
3. Para cada item:
   - mapFromPersistentKeys()
   - new User(mappedData)
4. afterGetElementList() hook en primer elemento
5. Retorna array de instancias
```

**Uso en DefaultListView:**

```typescript
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

## 5. Flujo de Funcionamiento

### Flujo de Acceso a Module Metadata

```
Application inicializa
        ↓
Application.ModuleList.value contiene [Product, User, Order]
        ↓
SideBarComponent renderiza menú
        ↓
Para cada entityClass en ModuleList:
    ├─ entityClass.getModuleName() → 'Product'
    ├─ entityClass.getModuleIcon() → 'box'
    ├─ entityClass.getModulePermission() → 'products.view'
    └─ Verificar permiso de usuario
        ├─ SI tiene permiso → Renderizar item de menú
        └─ NO tiene permiso → Skip item
        ↓
Usuario hace click en item de menú
        ↓
Application.changeViewToDefaultView(Product)
        ↓
Product.getModuleDefaultComponent() → ProductDashboard
        ↓
Application.changeView(Product, ProductDashboard, DEFAULTVIEW)
        ↓
ComponentContainer renderiza ProductDashboard
```

### Flujo de Generación Dinámica de Formulario

```
DefaultDetailView recibe entityClass: typeof Product  
        ↓
Obtener metadata de propiedades
const properties = Product.getProperties()
const types = Product.getPropertyTypes()
const cssClasses = Product.getCSSClasses()
        ↓
properties = { name: 'Name', price: 'Price' }
types = { name: String, price: Number }
cssClasses = { name: 'col-md-6', price: 'col-md-6' }
        ↓
Para cada key in Object.keys(properties):
    ├─ label = properties[key]
    ├─ type = types[key]
    ├─ cssClass = cssClasses[key]
    └─ Determinar InputComponent
        ├─ type === String → TextInput
        ├─ type === Number → NumberInput
        ├─ type === Boolean → CheckboxInput
        ├─ type === Object → ObjectInput
        └─ type === Array → ArrayInput
            ├─ getArrayPropertyType(key)
            │   ├─ Returns BaseEntity class → EntityArrayInput
            │   └─ Returns undefined → TagsInput
        ↓
Renderizar inputs con:
    <div :class="cssClass">
        <label>{{ label }}</label>
        <input v-model="entity[key]" />
    </div>
```

### Flujo de Conversión Persistent Keys en CRUD

```
Usuario modifica entity y llama save()
        ↓
entity.toObject() → { name: 'Widget', price: 100 }
        ↓
Para cada key in object:
    Product.getPersistentKeyByPropertyKey(key)
    'name' → 'product_name'
    'price' → 'product_price'
        ↓
Objeto mapeado para API
{ product_name: 'Widget', product_price: 100 }
        ↓
HTTP POST /api/products
Body: { product_name: 'Widget', product_price: 100 }
        ↓
Response: { product_id: 1, product_name: 'Widget', product_price: 100 }
        ↓
Para cada persistentKey in response:
    Product.getPropertyKeyByPersistentKey(persistentKey)
    'product_id' → 'id'
    'product_name' → 'name'
    'product_price' → 'price'
        ↓
Objeto mapeado interno
{ id: 1, name: 'Widget', price: 100 }
        ↓
Object.assign(entity, mappedData)
        ↓
entity.id ahora es 1 (asignado por servidor)
```

### Flujo de getElement Completo

```
Usuario click en row de tabla
        ↓
const selectedId = '5'
        ↓
Product.getElement(selectedId) ejecuta
        ↓
Verificar @Persistent y @ApiEndpoint
        ├─ NO tiene → Throw error
        └─ SÍ tiene → Continuar
        ↓
const endpoint = Product.getApiEndpoint() → '/api/products'
        ↓
HTTP GET /api/products/5
        ↓
Response.data: { product_id: 5, product_name: 'Widget', product_price: 100 }
        ↓
Product.mapFromPersistentKeys(response.data)
        ↓
Mapped data: { id: 5, name: 'Widget', price: 100 }
        ↓
const instance = new Product({ id: 5, name: 'Widget', price: 100 })
        ↓
instance.afterGetElement() hook ejecuta (si definido)
        ↓
return instance
        ↓
Application.changeViewToDetailView(instance)
        ↓
DefaultDetailView renderiza entity
```

### Flujo de createNewInstance en New Button

```
Usuario click en "New" button
        ↓
NewButtonComponent.handleClick() ejecuta
        ↓
const entityClass = Application.View.value.entityClass
        ↓
entityClass = Product (typeof BaseEntity)
        ↓
const newEntity = entityClass.createNewInstance()
        ↓
createNewInstance() ejecuta: return new this({})
        ↓
Equivalente a: new Product({})
        ↓
Constructor ejecuta:
    Object.assign(this, {}) → Propiedades quedan undefined
    _originalState = structuredClone(toPersistentObject())
    _originalState = {} (vacío)
        ↓
newEntity creado:
    name: undefined
    price: undefined
    _isLoading: false
    _originalState: {}
        ↓
newEntity.isNew() → true (no tiene ID)
        ↓
Application.changeViewToDetailView(newEntity)
        ↓
Usuario llena formulario
        ↓
entity.save()
        ↓
isNew() === true → HTTP POST (crear nueva)
```

## 6. Reglas Obligatorias

**Regla 1:** Métodos estáticos DEBEN leer metadata de prototype, NO modificar. Modificación es responsabilidad exclusiva de decoradores.

**Regla 2:** getProperties() DEBE excluir propiedades con tipo Array. getAllPropertiesNonFilter() DEBE incluir todas. No confundir ambos métodos.

**Regla 3:** getPropertyTypes() DEBE retornar constructors (String, Number, Boolean, Object, Array), NO strings ('string', 'number'). Comparar con === String, NO === 'string'.

**Regla 4:** getArrayPropertyType() DEBE retornar typeof BaseEntity solo si array tiene @ArrayElementType con clase BaseEntity. Retornar undefined para arrays de primitivos.

**Regla 5:** Componentes (getModuleDefaultComponent, getModuleListComponent, getModuleDetailComponent) DEBEN retornar fallback (DefaultListview/DefaultDetailView) si no hay decorator. NO retornar null.

**Regla 6:** getModuleCustomComponents() DEBE retornar null si no hay decorator. NO retornar Map vacío. Distinción explícita entre "no config" vs "config vacía".

**Regla 7:** createNewInstance() DEBE ejecutar new this({}), NO new this(). Pasar objeto vacío al constructor para mantener contrato.

**Regla 8:** getPersistentKeyByPropertyKey() DEBE retornar undefined si propiedad NO tiene @PersistentKey. Caller debe manejar fallback a nombre original.

**Regla 9:** getElement() y getElementList() DEBEN verificar @Persistent y @ApiEndpoint antes de HTTP request. Throw error si no configurados.

**Regla 10:** getElement() y getElementList() DEBEN ejecutar mapFromPersistentKeys() antes de crear instancia. NO pasar response.data directamente a constructor.

**Regla 11:** Métodos estáticos NO deben cachear resultados. Leer prototype fresh cada vez. Caching debe implementarse en caller si necesario.

**Regla 12:** getPropertyNameByKey() DEBE retornar undefined si property no tiene @PropertyName. NO retornar propertyKey como fallback. Caller decide fallback.

## 7. Prohibiciones

**Prohibido:** Modificar prototype metadata desde métodos estáticos. Solo decoradores escriben metadata, métodos estáticos solo leen.

**Prohibido:** Retornar strings ('string', 'number') desde getPropertyTypes(). Siempre retornar constructors (String, Number).

**Prohibido:** Asumir que getProperties() incluye arrays. Arrays excluidos intencionalmente. Usar getAllPropertiesNonFilter() si necesitas arrays.

**Prohibido:** Retornar null desde getModuleDefaultComponent/getModuleListComponent/getModuleDetailComponent. Siempre retornar fallback.

**Prohibido:** Retornar Map vacío desde getModuleCustomComponents(). Retornar null para indicar ausencia de configuración.

**Prohibido:** Llamar getElement/getElementList en entidades sin @Persistent y @ApiEndpoint. Verificar primero con isPersistent() o isApiMethodAllowed().

**Prohibido:** Pasar response.data directamente a constructor sin mapFromPersistentKeys(). Conversión de persistent keys es obligatoria.

**Prohibido:** Cachear resultado de métodos estáticos en variables static de clase. Prototype puede cambiar en runtime (hot reload).

**Prohibido:** Asumir que createNewInstance() inicializa propiedades con defaults. Solo pasa {} a constructor, propiedades quedan undefined.

**Prohibido:** Comparar getArrayPropertyType() con true/false. Retorna typeof BaseEntity o undefined, verificar con if (elementType) o if (elementType === undefined).

**Prohibido:** Override métodos estáticos en subclases cambiando comportamiento fundamental. Métodos estáticos deben ser consistentes en toda jerarquía BaseEntity.

**Prohibido:** Usar getPersistentKeyByPropertyKey() en loop sin verificar undefined. Siempre aplicar fallback: persistentKey || originalKey.

## 8. Dependencias

**Decoradores de Módulo:**
- @ModuleName: Define nombre singular y plural de módulo
- @ModuleIcon: Define icono para UI
- @ModulePermission: Define permiso requerido para acceso
- @ModuleDefaultComponent: Define componente default view
- @ModuleListComponent: Define componente list view
- @ModuleDetailComponent: Define componente detail view
- @ModuleCustomComponents: Define Map de componentes custom

**Decoradores de Propiedad:**
- @PropertyName: Define nombre legible y tipo de propiedad
- @CSSColumnClass: Define clase CSS para layout
- @ArrayElementType: Define tipo de elementos en array
- @PersistentKey: Define nombre de propiedad en API
- @PrimaryProperty: Identifica propiedad ID para isNew()

**Metadata Keys (Symbols):**
- PROPERTY_NAME_KEY: Almacena metadata @PropertyName
- PROPERTY_TYPE_KEY: Almacena tipos de propiedades
- CSS_COLUMN_CLASS_KEY: Almacena clases CSS
- ARRAY_ELEMENT_TYPE_KEY: Almacena tipos de elementos array
- PERSISTENT_KEY_KEY: Almacena mapeo persistent keys
- MODULE_NAME_KEY: Almacena nombre módulo
- MODULE_ICON_KEY: Almacena icono módulo

**Application Singleton:**
- Application.ModuleList: Usa getModuleName/getModuleIcon para construir menú
- Application.changeView(): Usa getModuleDefaultComponent/getModuleListComponent/getModuleDetailComponent
- Application.changeViewToDefaultView(): Usa getModuleDefaultComponent
- Application.changeViewToDetailView(): Usa getModuleDetailComponent

**Components:**
- DefaultListview: Fallback para getModuleDefaultComponent/getModuleListComponent
- DefaultDetailView: Fallback para getModuleDetailComponent
- SideBarComponent: Usa getModuleName/getModuleIcon
- NewButtonComponent: Usa createNewInstance()
- InputComponents: Usan getPropertyNameByKey/getPropertyType

**HTTP Layer:**
- Application.axiosInstance: Usado por getElement/getElementList
- HTTP GET: Ejecutado por getElement (/${endpoint}/${oid})
- HTTP GET: Ejecutado por getElementList (/${endpoint}?filter=${filter})

**Métodos de Instancia:**
- mapFromPersistentKeys(): Usado internamente por getElement/getElementList
- afterGetElement(): Hook ejecutado después de getElement
- afterGetElementList(): Hook ejecutado después de getElementList

## 9. Relaciones

**Relación con Decoradores (N:1):**
Múltiples decoradores escriben en prototype → Métodos estáticos leen de prototype. Decoradores ejecutan en class definition time, métodos estáticos leen en runtime.

**Relación con Application.ModuleList (1:N):**
Cada entityClass en ModuleList → Application consulta métodos estáticos (getModuleName, getModuleIcon, getModulePermission) para cada uno en loop.

**Relación con SideBarComponent (N:N):**
SideBarComponent itera sobre ModuleList → Para cada entityClass consulta getModuleName/getModuleIcon → Renderiza N items en sidebar.

**Relación con DefaultDetailView (N:N):**
DefaultDetailView recibe entityClass → Consulta getProperties/getPropertyTypes/getCSSClasses → Genera N inputs dinámicos.

**Relación con NewButtonComponent (N:1):**
Multiple instancias de NewButton → Todas usan entityClass.createNewInstance() para crear entidad vacía.

**Relación con CRUD Instance Methods (1:N):**
getElement static → Usa mapFromPersistentKeys instance method. getElementList static → Usa mapFromPersistentKeys instance method. Static methods coordinan con instance methods.

**Relación con HTTP Layer (1:N):**
getElement/getElementList estáticos → Ejecutan múltiples HTTP requests via Application.axiosInstance. Un método puede disparar N requests (retry logic).

**Relación entre getProperties y getAllPropertiesNonFilter (1:1 filtered):**
getAllPropertiesNonFilter retorna TODO → getProperties filtra excluyendo arrays → Relación subset.

**Relación entre getPersistentKeyByPropertyKey y getPropertyKeyByPersistentKey (1:1 bidirectional):**
Operaciones inversas simétricas. getPersistentKeyByPropertyKey(getPropertyKeyByPersistentKey(x)) === x para cualquier x válido.

## 10. Notas de Implementación

### Ejemplo Completo: Uso End-to-End de Métodos Estáticos

```typescript
// ========================================
// 1. Definir Entidad con Metadata Completa
// ========================================

import ProductGridView from './ProductGridView.vue';
import ProductFormView from './ProductFormView.vue';
import ProductDashboard from './ProductDashboard.vue';

@Persistent()
@ApiEndpoint('/api/products')
@ModuleName('Product', 'Products')
@ModuleIcon('box')
@ModulePermission('products.view')
@ModuleDefaultComponent(ProductDashboard)
@ModuleListComponent(ProductGridView)
@ModuleDetailComponent(ProductFormView)
@ModuleCustomComponents(new Map([
    ['analytics', ProductAnalytics]
]))
export class Product extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('ID', Number)
    @PersistentKey('product_id')
    id?: number;
    
    @PropertyName('Product Name', String)
    @CSSColumnClass('col-md-6')
    @PersistentKey('product_name')
    name!: string;
    
    @PropertyName('Price', Number)
    @CSSColumnClass('col-md-3')
    @PersistentKey('product_price')
    price!: number;
    
    @PropertyName('Stock', Number)
    @CSSColumnClass('col-md-3')
    stock!: number;
    
    @PropertyName('Tags', Array)
    tags!: string[];
    
    @PropertyName('Category', Object)
    category!: Category;
}

// ========================================
// 2. Obtener Module Metadata
// ========================================

const moduleName = Product.getModuleName();
console.log(moduleName); // 'Product'

const icon = Product.getModuleIcon();
console.log(icon); // 'box'

const permission = Product.getModulePermission();
console.log(permission); // 'products.view'

// Verificar permiso usuario
if (!currentUser.hasPermission(permission)) {
    console.log('Usuario no tiene acceso');
    return;
}

// ========================================
// 3. Obtener Componentes
// ========================================

const defaultComp = Product.getModuleDefaultComponent();
console.log(defaultComp); // ProductDashboard

const listComp = Product.getModuleListComponent();
console.log(listComp); // ProductGridView

const detailComp = Product.getModuleDetailComponent();
console.log(detailComp); // ProductFormView

const customComponents = Product.getModuleCustomComponents();
const analyticsComp = customComponents?.get('analytics');
console.log(analyticsComp); // ProductAnalytics

// ========================================
// 4. Obtener Property Metadata
// ========================================

// Propiedades NO array (para inputs simples)
const properties = Product.getProperties();
console.log(properties);
// { name: 'Product Name', price: 'Price', stock: 'Stock', category: 'Category' }

// TODAS las propiedades (incluyendo arrays)
const allProperties = Product.getAllPropertiesNonFilter();
console.log(allProperties);
// { name: 'Product Name', price: 'Price', stock: 'Stock', tags: 'Tags', category: 'Category' }

// Nombre legible específico
const nameLabel = Product.getPropertyNameByKey('name');
console.log(nameLabel); // 'Product Name'

// Tipos de propiedades
const types = Product.getPropertyTypes();
console.log(types);
// { name: String, price: Number, stock: Number, tags: Array, category: Object }

const nameType = Product.getPropertyType('name');
console.log(nameType === String); // true

// Tipo de elementos array
const tagsElementType = Product.getArrayPropertyType('tags');
console.log(tagsElementType); // undefined (primitive array)

// CSS classes
const cssClasses = Product.getCSSClasses();
console.log(cssClasses);
// { name: 'col-md-6', price: 'col-md-3', stock: 'col-md-3' }

// ========================================
// 5. Persistent Keys Mapping
// ========================================

const persistentKeys = Product.getPersistentKeys();
console.log(persistentKeys);
// { id: 'product_id', name: 'product_name', price: 'product_price' }

const persistentName = Product.getPersistentKeyByPropertyKey('name');
console.log(persistentName); // 'product_name'

const propertyName = Product.getPropertyKeyByPersistentKey('product_name');
console.log(propertyName); // 'name'

// ========================================
// 6. CRUD Operations
// ========================================

// Crear nueva instancia
const newProduct = Product.createNewInstance();
console.log(newProduct.isNew()); // true

// Cargar entidad individual
const product = await Product.getElement('5');
console.log(product.id); // 5
console.log(product.name); // 'Widget'

// Cargar lista
const allProducts = await Product.getElementList();
console.log(allProducts.length); // 50

const electronicsProducts = await Product.getElementList('category=electronics');
console.log(electronicsProducts.length); // 15

// ========================================
// 7. Generar UI Dinámicamente
// ========================================

// Generar formulario
const formProperties = Product.getProperties();

Object.keys(formProperties).forEach(key => {
    const label = Product.getPropertyNameByKey(key);
    const type = Product.getPropertyType(key);
    const cssClass = Product.getCSSClasses()[key] || 'col-md-12';
    
    console.log(`Renderizar input: ${label} (${type.name}) - ${cssClass}`);
    // Renderizar input: Product Name (String) - col-md-6
    // Renderizar input: Price (Number) - col-md-3
    // Renderizar input: Stock (Number) - col-md-3
    // Renderizar input: Category (Object) - col-md-12
});
```

### Consideración: Diferencia getProperties vs getAllPropertiesNonFilter

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Tags', Array)
    tags!: string[];
    
    @PropertyName('Price', Number)
    price!: number;
}

// getProperties() EXCLUYE arrays
const properties = Product.getProperties();
console.log(Object.keys(properties));
// ['name', 'price']  ← tags NO incluido

// getAllPropertiesNonFilter() INCLUYE arrays
const allProperties = Product.getAllPropertiesNonFilter();
console.log(Object.keys(allProperties));
// ['name', 'tags', 'price']  ← tags incluido

// Razón: Arrays tienen UI diferente (ArrayInput vs TextInput/NumberInput)
// getProperties() para formularios simples
// getAllPropertiesNonFilter() para serialización completa
```

### Consideración: Types Son Constructors, NO Strings

```typescript
const types = Product.getPropertyTypes();

// CORRECTO
if (types.name === String) {
    renderTextInput();
}

if (types.price === Number) {
    renderNumberInput();
}

// INCORRECTO
if (types.name === 'string') {  // ❌ Siempre false
    renderTextInput();
}

if (typeof types.name === 'string') {  // ❌ Siempre false
    renderTextInput();
}

// Ver tipo constructor
console.log(types.name);      // [Function: String]
console.log(typeof types.name); // 'function'
console.log(types.name.name);  // 'String'
```

### Consideración: createNewInstance() No Inicializa Defaults

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name: string = 'Default Name';  // Default value
    
    @PropertyName('Stock', Number)
    stock: number = 0;  // Default value
}

const product1 = new Product({});
console.log(product1.name);  // 'Default Name' (constructor inicializa)
console.log(product1.stock); // 0

const product2 = Product.createNewInstance();
console.log(product2.name);  // 'Default Name' (mismo comportamiento)
console.log(product2.stock); // 0

// Ambos ejecutan constructor, defaults se aplican
```

### Consideración: getElement/getElementList Requieren Configuración

```typescript
@ModuleName('ViewModel', 'ViewModels')  // Sin @Persistent ni @ApiEndpoint
export class ViewModel extends BaseEntity {
    @PropertyName('Data', String)
    data!: string;
}

// Intentar cargar
try {
    await ViewModel.getElement('1');
} catch (error) {
    console.error(error);
    // Error: ApiEndpoint no definido para ViewModel
}

// Solución: Agregar decoradores
@Persistent()
@ApiEndpoint('/api/viewmodels')
@ModuleName('ViewModel', 'ViewModels')
export class ViewModel extends BaseEntity {
    // ...
}

// Ahora funciona
const viewModel = await ViewModel.getElement('1');
```

### Pattern: Generar Menu Lateral Dinámico

```typescript
// sidebar.ts
const generateMenu = () => {
    const menuItems: MenuItem[] = [];
    
    for (const entityClass of Application.ModuleList.value) {
        const permission = entityClass.getModulePermission();
        
        // Verificar permiso
        if (permission && !currentUser.hasPermission(permission)) {
            continue;
        }
        
        const name = entityClass.getModuleName() || entityClass.name;
        const icon = entityClass.getModuleIcon() || 'default-icon';
        
        menuItems.push({
            label: name,
            icon: icon,
            onClick: () => {
                Application.changeViewToDefaultView(entityClass);
            }
        });
    }
    
    return menuItems;
};
```

### Pattern: Debugging Persistent Keys Mismatch

```typescript
const product = new Product({
    name: 'Widget',
    price: 100
});

// Ver que se enviará a API
const toSend = product.toObject();
console.log('Internal:', toSend);
// { name: 'Widget', price: 100 }

// Ver mapeo de persistent keys
const persistentKeys = Product.getPersistentKeys();
console.log('Persistent Keys:', persistentKeys);
// { name: 'product_name', price: 'product_price' }

// Ver conversión específica
const namePersistent = Product.getPersistentKeyByPropertyKey('name');
console.log('name maps to:', namePersistent);
// 'product_name'

// Simular conversión completa
const mapped: Record<string, any> = {};
for (const [key, value] of Object.entries(toSend)) {
    const persistentKey = Product.getPersistentKeyByPropertyKey(key) || key;
    mapped[persistentKey] = value;
}

console.log('API Payload:', mapped);
// { product_name: 'Widget', product_price: 100 }
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- base-entity-core.md: Arquitectura general de BaseEntity
- metadata-access.md: Versiones de instancia de métodos estáticos
- crud-operations.md: Uso de getElement/getElementList en operaciones CRUD
- ../01-decorators/module-name-decorator.md: @ModuleName decorator
- ../01-decorators/module-icon-decorator.md: @ModuleIcon decorator
- ../01-decorators/property-name-decorator.md: @PropertyName decorator
- ../01-decorators/persistent-key-decorator.md: @PersistentKey decorator
- ../03-application/application-singleton.md: Uso de métodos estáticos en Application

**Archivos fuente:**
- src/entities/base_entitiy.ts: Implementación de todos los métodos estáticos (líneas 130-287, 474-686)
- src/application/application.ts: Uso de métodos estáticos en navegación (líneas 135-221)
- src/components/SideBarComponent.vue: Uso de getModuleName/getModuleIcon
- src/components/Buttons/NewButtonComponent.vue: Uso de createNewInstance()
- src/views/default_listview.vue: Uso de getElementList()
- src/views/default_detailview.vue: Uso de getProperties/getPropertyTypes

**Líneas relevantes en código:**
- Línea 130: getAllPropertiesNonFilter()
- Línea 137: getProperties()
- Línea 149: getPropertyTypes()
- Línea 157: getPropertyType()
- Línea 170: getArrayPropertyType()
- Línea 212: getPropertyNameByKey()
- Línea 214: getCSSClasses()
- Línea 218: getModuleName()
- Línea 222: getModulePermission()
- Línea 226: getModuleIcon()
- Línea 230: getModuleListComponent()
- Línea 234: getModuleDefaultComponent()
- Línea 238: getModuleDetailComponent()
- Línea 242: getModuleCustomComponents()
- Línea 287: createNewInstance()
- Línea ~474: getPersistentKeyByPropertyKey()
- Línea ~476: getPersistentKeys()
- Línea ~479: getPropertyKeyByPersistentKey()
- Línea 657: getElement()
- Línea 686: getElementList()

**Última actualización:** 11 de Febrero, 2026
