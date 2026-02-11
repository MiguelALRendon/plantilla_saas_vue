# 🔍 Metadata Access - Acceso a Metadatos del Sistema

**Referencias:**
- `base-entity-core.md` - Documentación core de BaseEntity
- `../../01-FRAMEWORK-OVERVIEW.md` - Visión general
- `../../layers/01-decorators/` - Documentación de decoradores

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts`  
**Métodos:** Distribuidos a lo largo de la clase BaseEntity

---

## 🎯 Propósito

Los **métodos de acceso a metadatos** permiten leer la información almacenada por los decoradores en los prototipos de las clases. Esta es la base del sistema meta-programático del framework.

**Concepto fundamental:**  
> Los decoradores **escriben** metadatos → Los métodos de acceso **leen** metadatos → Los componentes **renderizan** basándose en esos metadatos

---

## 📋 Categorías de Métodos

1. **Propiedades** - Información sobre campos de la entidad
2. **Tipos** - Tipos de datos de propiedades
3. **Módulo** - Configuración del módulo
4. **Validación** - Reglas de validación
5. **UI** - Configuración de interfaz de usuario
6. **API** - Configuración de persistencia

---

## 1️⃣ MÉTODOS DE PROPIEDADES

### getAllPropertiesNonFilter() [static]

```typescript
public static getAllPropertiesNonFilter(): Record<string, string>
```

Retorna **todas** las propiedades que tienen `@PropertyName`, incluyendo arrays.

**Retorna:**
```typescript
{
    'id': 'ID',
    'name': 'Product Name',
    'tags': 'Tags',  // Array también incluido
    'price': 'Price'
}
```

**Ubicación en código:** Línea 127
```typescript
public static getAllPropertiesNonFilter(): Record<string, string> {
    const proto = this.prototype as any;
    return proto[PROPERTY_NAME_KEY] || {};
}
```

### getProperties() [static]

```typescript
public static getProperties(): Record<string, string>
```

Retorna propiedades que tienen `@PropertyName` **excluyendo arrays**.

**Retorna:**
```typescript
{
    'id': 'ID',
    'name': 'Product Name',
    'price': 'Price'
    // 'tags' NO incluido (es Array)
}
```

**Ubicación en código:** Línea 132
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

**Por qué se filtran arrays:**  
Los arrays se renderizan de forma especial en la UI (en tabs o secciones expandibles), no como campos normales.

### getKeys()

```typescript
public getKeys(): string[] 
```

Retorna los **nombres de propiedad** (keys) ordenados por `@PropertyIndex`.

**Retorna:**
```typescript
['id', 'name', 'price', 'description']  // Ordenado por PropertyIndex
```

**Ubicación en código:** Línea 90
```typescript
public getKeys(): string[] {
    const columns = (this.constructor as typeof BaseEntity).getProperties();
    const keys = Object.keys(columns);
    const propertyIndices = this.getPropertyIndices();
    
    // Ordenar por PropertyIndex si existe, sino por orden de declaración
    return keys.sort((a, b) => {
        const indexA = propertyIndices[a] ?? Number.MAX_SAFE_INTEGER;
        const indexB = propertyIndices[b] ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
    });
}
```

**Uso típico:**
```typescript
// En un componente de formulario
const keys = entity.getKeys();
keys.forEach(key => {
    // Renderizar input para cada propiedad en orden
});
```

### getArrayKeys()

```typescript
public getArrayKeys(): string[]
```

Retorna solo las propiedades de tipo `Array`.

**Retorna:**
```typescript
['tags', 'images', 'variants']  // Solo arrays
```

**Ubicación en código:** Línea 103
```typescript
public getArrayKeys(): string[] {
    const properties = (this.constructor as typeof BaseEntity).getAllPropertiesNonFilter();
    const propertyTypes = (this.constructor as typeof BaseEntity).getPropertyTypes();
    const arrayKeys: string[] = [];
    
    for (const key of Object.keys(properties)) {
        if (propertyTypes[key] === Array) {
            arrayKeys.push(key);
        }
    }
    
    return arrayKeys;
}
```

**Ejemplo de uso:**

```typescript
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    @PropertyName('Tags', Array)
    tags!: string[];
    
    @PropertyName('Images', Array)
    images!: string[];
}

const product = new Product({ name: 'Widget', price: 100 });
const arrayKeys = product.getArrayKeys();

console.log(arrayKeys); // ['tags', 'images']
```

**Uso típico en componentes:**

```vue
<template>
    <div v-for="arrayKey in entity.getArrayKeys()" :key="arrayKey">
        <h3>{{ entity.constructor.getPropertyNameByKey(arrayKey) }}</h3>
        <ArrayInputComponent 
            :entity="entity"
            :property-key="arrayKey"
            v-model="entity[arrayKey]" 
        />
    </div>
</template>
```

---

### getTabOrders()

```typescript
public getTabOrders(): Record<string, number>
```

**Propósito:** Obtiene el orden de tabs definido por el decorador `@TabOrder`.

**Retorna:** Objeto con mapeo `propertyKey -> order`

**Ubicación en código:** Línea 399

**Implementación:**

```typescript
public getTabOrders(): Record<string, number> {
    const proto = (this.constructor as any).prototype;
    return proto[TAB_ORDER_KEY] || {};
}
```

**Ejemplo:**

```typescript
@ModuleName('Orders')
export class Order extends BaseEntity {
    @PropertyName('Items', Array)
    @TabOrder(1)
    items!: OrderItem[];
    
    @PropertyName('Payments', Array)
    @TabOrder(3)
    payments!: Payment[];
    
    @PropertyName('Shipments', Array)
    @TabOrder(2)
    shipments!: Shipment[];
}

const order = new Order({});
const tabOrders = order.getTabOrders();

console.log(tabOrders);
// {
//   'items': 1,
//   'payments': 3,
//   'shipments': 2
// }
```

**Uso con getArrayKeysOrdered():**

Este método es interno y se usa principalmente en `getArrayKeysOrdered()` para ordenar correctamente las propiedades array.

---

### getArrayKeysOrdered()

```typescript
public getArrayKeysOrdered(): string[]
```

**Propósito:** Retorna propiedades de tipo Array ordenadas por `@TabOrder`.

**Retorna:** Array de keys ordenado por TabOrder

**Ubicación en código:** Línea 404

**Implementación:**

```typescript
public getArrayKeysOrdered(): string[] {
    const arrayKeys = this.getArrayKeys();
    const tabOrders = this.getTabOrders();
    
    // Ordenar por TabOrder si existe, sino por orden de declaración
    return arrayKeys.sort((a, b) => {
        const orderA = tabOrders[a] ?? Number.MAX_SAFE_INTEGER;
        const orderB = tabOrders[b] ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });
}
```

**Ejemplo completo:**

```typescript
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('Basic Info', String)
    name!: string;
    
    @PropertyName('Images', Array)
    @TabOrder(2)  // ← Segundo tab
    images!: string[];
    
    @PropertyName('Variants', Array)
    @TabOrder(3)  // ← Tercer tab
    variants!: ProductVariant[];
    
    @PropertyName('Reviews', Array)
    @TabOrder(1)  // ← Primer tab
    reviews!: Review[];
}

const product = new Product({ name: 'Widget' });

// Sin orden
console.log(product.getArrayKeys());
// ['images', 'variants', 'reviews'] (orden de declaración)

// Con orden
console.log(product.getArrayKeysOrdered());
// ['reviews', 'images', 'variants'] (ordenado por TabOrder)
```

**Uso en default_detailview.vue:**

```vue
<!-- Línea 84 en src/views/default_detailview.vue -->
<FormGroupComponent title="Listas">
    <TabControllerComponent :tabs="getArrayListsTabs()">
        <TabComponent v-for="(tab) in entity.getArrayKeysOrdered()">
            <ArrayInputComponent 
                :entity="entity"
                :property-key="tab"
                v-model="entity[tab]" 
                :type-value="entityClass.getArrayPropertyType(tab)"
            />
        </TabComponent>
    </TabControllerComponent>
</FormGroupComponent>
```

**Comparación de métodos:**

| Método | Retorna | Ordenado | Uso |
|--------|---------|----------|-----|
| `getKeys()` | Props no-array | Sí (`@PropertyIndex`) | Renderizar fields normales |
| `getArrayKeys()` | Props array | No | Obtener lista de arrays |
| `getArrayKeysOrdered()` | Props array | Sí (`@TabOrder`) | Renderizar tabs de arrays |

**Ejemplo sin @TabOrder:**

Si no se define `@TabOrder`, se mantiene el orden de declaración:

```typescript
export class Product extends BaseEntity {
    @PropertyName('Tags', Array)
    tags!: string[];
    
    @PropertyName('Images', Array)
    images!: string[];
}

// Sin TabOrder:
product.getArrayKeysOrdered(); // ['tags', 'images'] (orden original)
```

---

### getFormattedValue()

```typescript
public getFormattedValue(propertyKey: string): string
```

**Propósito:** Obtiene el valor de una propiedad formateado según `@DisplayFormat`.

**Parámetros:**
- `propertyKey: string` - Clave de la propiedad

**Retorna:** Valor formateado como string

**Ubicación en código:** Línea 377

**Implementación:**

```typescript
public getFormattedValue(propertyKey: string): string {
    const value = (this as any)[propertyKey];
    const format = this.getDisplayFormat(propertyKey);
    
    if (!format) {
        return value?.toString() ?? '';
    }
    
    if (typeof format === 'function') {
        return format(value);
    }
    
    // Si es string, reemplazar {value} con el valor actual
    return format.replace('{value}', value?.toString() ?? '');
}
```

**Ejemplo con formato de string:**

```typescript
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    @DisplayFormat('${value} USD')
    price!: number;
    
    @PropertyName('Discount', Number)
    @DisplayFormat('{value}%')
    discount!: number;
}

const product = new Product({ 
    name: 'Widget', 
    price: 100,
    discount: 15
});

console.log(product.getFormattedValue('price'));    // '$100 USD'
console.log(product.getFormattedValue('discount')); // '15%'
console.log(product.getFormattedValue('name'));     // 'Widget' (sin formato)
```

**Ejemplo con formato de función:**

```typescript
@ModuleName('Orders')
export class Order extends BaseEntity {
    @PropertyName('Total', Number)
    @DisplayFormat((value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    })
    total!: number;
    
    @PropertyName('Created At', Date)
    @DisplayFormat((value: Date) => {
        return value ? value.toLocaleDateString('es-MX') : 'N/A';
    })
    createdAt!: Date;
}

const order = new Order({ 
    total: 1500.50,
    createdAt: new Date('2026-02-11')
});

console.log(order.getFormattedValue('total'));
// '$1,500.50 MXN'

console.log(order.getFormattedValue('createdAt'));
// '11/02/2026'
```

**Uso en tablas:**

```vue
<template>
    <table>
        <tr v-for="entity in entities" :key="entity.id">
            <td v-for="key in entity.getKeys()" :key="key">
                {{ entity.getFormattedValue(key) }}
            </td>
        </tr>
    </table>
</template>
```

**Comportamiento sin @DisplayFormat:**

Si la propiedad NO tiene `@DisplayFormat`, retorna el valor con `.toString()`:

```typescript
product.price = 100;
console.log(product.getFormattedValue('price')); // '100'

product.price = undefined;
console.log(product.getFormattedValue('price')); // ''
```

---

### getArrayKeysOrdered()

```typescript
public getArrayKeysOrdered(): string[]
```

Retorna propiedades de tipo Array ordenadas por `@TabOrder`.

**Retorna:**
```typescript
['images', 'tags', 'variants']  // Ordenado por TabOrder
```

**Ubicación en código:** Línea 416
```typescript
public getArrayKeysOrdered(): string[] {
    const arrayKeys = this.getArrayKeys();
    const tabOrders = this.getTabOrders();
    
    // Ordenar por TabOrder si existe, sino por orden de declaración
    return arrayKeys.sort((a, b) => {
        const orderA = tabOrders[a] ?? Number.MAX_SAFE_INTEGER;
        const orderB = tabOrders[b] ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });
}
```

**Uso típico:**
```typescript
// Renderizar tabs en orden específico
const arrayKeys = entity.getArrayKeysOrdered();
arrayKeys.forEach((key, index) => {
    // Crear tab para cada array
});
```

### getPropertyIndices()

```typescript
public getPropertyIndices(): Record<string, number>
```

Retorna el mapeo de propiedades a su `@PropertyIndex`.

**Retorna:**
```typescript
{
    'id': 1,
    'name': 2,
    'price': 3,
    'description': 4
}
```

**Ubicación en código:** Línea 117

### getCSSClasses()

```typescript
public getCSSClasses(): Record<string, string>
```

Retorna las clases CSS definidas con `@CSSColumnClass`.

**Retorna:**
```typescript
{
    'id': 'table-length-small',
    'name': 'table-length-medium',
    'description': 'table-length-large'
}
```

**Ubicación en código:** Línea 122  
**Método estático:** Línea 199

**Uso típico:**
```typescript
// En componente de tabla
<td :class="entity.getCSSClasses()[key]">
    {{ entity[key] }}
</td>
```

### getPropertyName() [static]

```typescript
public static getPropertyName<T extends BaseEntity>(
    selector: (entity: T) => any
): string | undefined
```

Obtiene el nombre display de una propiedad usando un selector tipado (type-safe).

**Uso:**
```typescript
// Forma type-safe de obtener nombre de propiedad
const displayName = Product.getPropertyName((p) => p.name);
// Retorna: 'Product Name'
```

**Ubicación en código:** Línea 185
```typescript
public static getPropertyName<T extends BaseEntity>(selector: (entity: T) => any): string | undefined {
    const columns = this.getProperties();
    const proxy = new Proxy({}, {
        get(prop) {
            return prop;
        }
    });
    const propertyName = selector(proxy as T) as string;
    return columns[propertyName];
}
```

### getPropertyNameByKey() [static]

```typescript
public static getPropertyNameByKey(propertyKey: string): string | undefined
```

Obtiene el nombre display de una propiedad por su key.

**Uso:**
```typescript
Product.getPropertyNameByKey('name'); // 'Product Name'
```

**Ubicación en código:** Línea 194

---

## 2️⃣ MÉTODOS DE TIPOS

### getPropertyTypes() [static]

```typescript
public static getPropertyTypes(): Record<string, any>
```

Retorna el mapeo de propiedades a sus tipos.

**Retorna:**
```typescript
{
    'id': Number,
    'name': String,
    'price': Number,
    'active': Boolean,
    'createdAt': Date,
    'tags': Array
}
```

**Ubicación en código:** Línea 147

### getPropertyType() [static]

```typescript
public static getPropertyType(propertyKey: string): any | undefined
```

Obtiene el tipo de una propiedad específica.

**Uso:**
```typescript
Product.getPropertyType('price'); // Number
Product.getPropertyType('name');  // String
```

**Ubicación en código:** Línea 152

### getPropertyType() [instance]

```typescript
public getPropertyType(propertyKey: string): any | undefined
```

Versión de instancia del método.

**Uso:**
```typescript
product.getPropertyType('price'); // Number
```

**Ubicación en código:** Línea 157

### getArrayPropertyType() [static]

```typescript
public static getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined
```

Obtiene el tipo de elementos dentro de un array (debe ser BaseEntity).

**Retorna:** La clase del elemento o `undefined` si no es array o no es BaseEntity.

**Uso:**
```typescript
@PropertyName('Tags', Array)
@ArrayOf(Tag)  // Tag extends BaseEntity
tags!: Tag[];

Product.getArrayPropertyType('tags'); // Tag (la clase)
Product.getArrayPropertyType('name'); // undefined (no es array)
```

**Ubicación en código:** Línea 161
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

### getArrayPropertyType() [instance]

```typescript
public getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined
```

Versión de instancia del método.

**Ubicación en código:** Línea 179

---

## 3️⃣ MÉTODOS DE MÓDULO

### getModuleName() [static]

```typescript
public static getModuleName(): string | undefined
```

Retorna el nombre del módulo definido en `@ModuleName`.

**Uso:**
```typescript
@ModuleName('Products')
export class Product extends BaseEntity {}

Product.getModuleName(); // 'Products'
```

**Ubicación en código:** Línea 204

### getModulePermission() [static]

```typescript
public static getModulePermission(): string | undefined
```

Retorna el permiso requerido definido en `@ModulePermission`.

**Uso:**
```typescript
@ModulePermission('admin.products')
export class Product extends BaseEntity {}

Product.getModulePermission(); // 'admin.products'
```

**Ubicación en código:** Línea 208

### getModuleIcon() [static]

```typescript
public static getModuleIcon(): string | undefined
```

Retorna el icono del módulo definido en `@ModuleIcon`.

**Uso:**
```typescript
@ModuleIcon(ICONS.BOX)
export class Product extends BaseEntity {}

Product.getModuleIcon(); // 'mdi-box'
```

**Ubicación en código:** Línea 212

### getModuleListComponent() [static]

```typescript
public static getModuleListComponent(): Component
```

Retorna el componente custom para vista de lista o `DefaultListview` por defecto.

**Retorna:** Vue Component

**Ubicación en código:** Línea 216
```typescript
public static getModuleListComponent(): Component {
    return (this as any)[MODULE_LIST_COMPONENT_KEY] || DefaultListview;
}
```

### getModuleDetailComponent() [static]

```typescript
public static getModuleDetailComponent(): Component
```

Retorna el componente custom para vista de detalle o `DefaultDetailView` por defecto.

**Ubicación en código:** Línea 220

### getModuleDefaultComponent() [static]

```typescript
public static getModuleDefaultComponent(): Component
```

Retorna el componente default cuando se navega al módulo, o `DefaultListview` por defecto.

**Ubicación en código:** Línea 224

### getModuleCustomComponents() [static]

```typescript
public static getModuleCustomComponents(): Map<string, Component> | null
```

Retorna el mapa de componentes custom definidos con `@ModuleCustomComponents`.

**Retorna:**
```typescript
Map {
    'dashboard' => DashboardComponent,
    'analytics' => AnalyticsComponent
} 
// o null si no hay custom components
```

**Ubicación en código:** Línea 228

---

## 4️⃣ MÉTODOS DE VALIDACIÓN

### isRequired()

```typescript
public isRequired(propertyKey: string): boolean
```

Verifica si una propiedad es requerida según `@Required`.

**Implementación con soporte de funciones:**
```typescript
public isRequired(propertyKey: string): boolean {
    const proto = (this.constructor as any).prototype;
    const requiredFields: Record<string, RequiredMetadata> = proto[REQUIRED_KEY] || {};
    const metadata = requiredFields[propertyKey];
    
    if (!metadata) {
        return false;
    }
    
    let value = metadata.validation !== undefined ? metadata.validation : metadata.condition;
    
    if (value === undefined) {
        return false;
    }
    
    return typeof value === 'function' ? value(this) : value;
}
```

**Uso:**
```typescript
@Required(true)
name!: string;

entity.isRequired('name'); // true

// Required condicional
@Required((entity) => entity.type === 'PRODUCT')
description!: string;

entity.type = 'PRODUCT';
entity.isRequired('description'); // true

entity.type = 'SERVICE';
entity.isRequired('description'); // false
```

**Ubicación en código:** Línea 286

### requiredMessage()

```typescript
public requiredMessage(propertyKey: string): string | undefined
```

Retorna el mensaje de error para campo requerido.

**Uso:**
```typescript
@Required(true, 'El nombre es obligatorio')
name!: string;

entity.requiredMessage('name'); // 'El nombre es obligatorio'
```

**Ubicación en código:** Línea 304

### isValidation()

```typescript
public isValidation(propertyKey: string): boolean
```

Ejecuta la validación síncrona definida en `@Validation`.

**Retorna:** `true` si válido, `false` si inválido.

**Uso:**
```typescript
@Validation((entity) => entity.price > 0, 'Price must be positive')
price!: number;

entity.price = 10;
entity.isValidation('price'); // true

entity.price = -5;
entity.isValidation('price'); // false
```

**Ubicación en código:** Línea 312
```typescript
public isValidation(propertyKey: string): boolean {
    const proto = (this.constructor as any).prototype;
    const validationRules: Record<string, ValidationMetadata> = proto[VALIDATION_KEY] || {};
    const rule = validationRules[propertyKey];
    
    if (!rule) {
        return true;  // Si no hay regla, es válido
    }
    
    return typeof rule.condition === 'function' ? rule.condition(this) : rule.condition;
}
```

### validationMessage()

```typescript
public validationMessage(propertyKey: string): string | undefined
```

Retorna el mensaje de error de validación.

**Ubicación en código:** Línea 324

### isAsyncValidation()

```typescript
public async isAsyncValidation(propertyKey: string): Promise<boolean>
```

Ejecuta la validación asíncrona definida en `@AsyncValidation`.

**Retorna:** Promise que resuelve a `true` si válido, `false` si inválido.

**Uso:**
```typescript
@AsyncValidation(
    async (entity) => {
        const response = await checkEmailUnique(entity.email);
        return response.isUnique;
    },
    'Email already exists'
)
email!: string;

await entity.isAsyncValidation('email'); // true o false
```

**Ubicación en código:** Línea 330
```typescript
public async isAsyncValidation(propertyKey: string): Promise<boolean> {
    const proto = (this.constructor as any).prototype;
    const asyncValidationRules: Record<string, AsyncValidationMetadata> = proto[ASYNC_VALIDATION_KEY] || {};
    const rule = asyncValidationRules[propertyKey];
    
    if (!rule) {
        return true;
    }
    
    try {
        return await rule.condition(this);
    } catch (error) {
        console.error(`Error in async validation for ${propertyKey}:`, error);
        return false;
    }
}
```

### asyncValidationMessage()

```typescript
public asyncValidationMessage(propertyKey: string): string | undefined
```

Retorna el mensaje de error de validación asíncrona.

**Ubicación en código:** Línea 346

### isDisabled()

```typescript
public isDisabled(propertyKey: string): boolean
```

Verifica si una propiedad está deshabilitada según `@Disabled`.

**Uso:**
```typescript
@Disabled((entity) => entity.isLocked)
name!: string;

entity.isLocked = true;
entity.isDisabled('name'); // true
```

**Ubicación en código:** Línea 333
```typescript
public isDisabled(propertyKey: string): boolean {
    const proto = (this.constructor as any).prototype;
    const disabledFields: Record<string, DisabledMetadata> = proto[DISABLED_KEY] || {};
    const metadata = disabledFields[propertyKey];
    
    if (!metadata) {
        return false;
    }
    
    return typeof metadata.condition === 'function' ? metadata.condition(this) : metadata.condition;
}
```

### isReadOnly()

```typescript
public isReadOnly(propertyKey: string): boolean
```

Verifica si una propiedad es de solo lectura según `@ReadOnly`.

**Ubicación en código:** Línea 438

---

## 5️⃣ MÉTODOS DE UI

### getViewGroups()

```typescript
public getViewGroups(): Record<string, string>
```

Retorna el mapeo de propiedades a grupos de vista (`@ViewGroup`).

**Retorna:**
```typescript
{
    'name': 'Basic Information',
    'price': 'Basic Information',
    'description': 'Details',
    'stock': 'Inventory'
}
```

**Ubicación en código:** Línea 276

**Uso típico:**
```typescript
const groups = entity.getViewGroups();
const uniqueGroups = [...new Set(Object.values(groups))];
// ['Basic Information', 'Details', 'Inventory']

uniqueGroups.forEach(groupName => {
    // Renderizar sección para cada grupo
});
```

### getViewGroupRows()

```typescript
public getViewGroupRows(): Record<string, ViewGroupRow>
```

Retorna el mapeo de propiedades a su configuración de fila (`@ViewGroupRowDecorator`).

**Retorna:**
```typescript
{
    'name': ViewGroupRow.TWO_ITEMS,
    'price': ViewGroupRow.TWO_ITEMS,
    'description': ViewGroupRow.FULL_WIDTH
}
```

**Ubicación en código:** Línea 281

### getStringType()

```typescript
public getStringType(): Record<string, StringType>
```

Retorna el tipo de string para cada propiedad string (`@StringTypeDef`).

**Retorna:**
```typescript
{
    'name': StringType.TEXT,
    'email': StringType.EMAIL,
    'password': StringType.PASSWORD,
    'description': StringType.TEXTAREA
}
```

**Ubicación en código:** Línea 261
```typescript
public getStringType(): Record<string, StringType> {
    const proto = (this.constructor as any).prototype;
    const stringTypes = proto[STRING_TYPE_KEY] || {};
    const properties = (this.constructor as typeof BaseEntity).getProperties();
    const result: Record<string, StringType> = {};
    
    for (const key of Object.keys(properties)) {
        result[key] = stringTypes[key] ?? StringType.TEXT;  // Default: TEXT
    }
    
    return result;
}
```

### getDisplayFormat()

```typescript
public getDisplayFormat(propertyKey: string): DisplayFormatValue | undefined
```

Retorna el formato de display definido en `@DisplayFormat`.

**Retorna:** String template o función formatter.

**Uso:**
```typescript
@DisplayFormat('${value} USD')
price!: number;

entity.getDisplayFormat('price'); // '${value} USD'

// O con función
@DisplayFormat((value) => `$${value.toFixed(2)}`)
price!: number;

entity.getDisplayFormat('price'); // función
```

**Ubicación en código:** Línea 352

### getFormattedValue()

```typescript
public getFormattedValue(propertyKey: string): string
```

Retorna el valor de una propiedad aplicando su `@DisplayFormat`.

**Uso:**
```typescript
@DisplayFormat('${value} USD')
price!: number;

entity.price = 99.99;
entity.getFormattedValue('price'); // '99.99 USD'
```

**Ubicación en código:** Línea 357
```typescript
public getFormattedValue(propertyKey: string): string {
    const value = (this as any)[propertyKey];
    const format = this.getDisplayFormat(propertyKey);
    
    if (!format) {
        return value?.toString() ?? '';
    }
    
    if (typeof format === 'function') {
        return format(value);
    }
    
    // Si es string, reemplazar {value} con el valor actual
    return format.replace('{value}', value?.toString() ?? '');
}
```

### getHelpText()

```typescript
public getHelpText(propertyKey: string): string | undefined
```

Retorna el texto de ayuda definido en `@HelpText`.

**Uso:**
```typescript
@HelpText('Enter the product display name')
name!: string;

entity.getHelpText('name'); // 'Enter the product display name'
```

**Ubicación en código:** Línea 375

### getTabOrders()

```typescript
public getTabOrders(): Record<string, number>
```

Retorna el orden de tabs definido en `@TabOrder`.

**Retorna:**
```typescript
{
    'images': 1,
    'tags': 2,
    'variants': 3
}
```

**Ubicación en código:** Línea 380

### isHideInDetailView()

```typescript
public isHideInDetailView(propertyKey: string): boolean
```

Verifica si una propiedad debe ocultarse en vista de detalle (`@HideInDetailView`).

**Ubicación en código:** Línea 453

### isHideInListView()

```typescript
public isHideInListView(propertyKey: string): boolean
```

Verifica si una propiedad debe ocultarse en vista de lista (`@HideInListView`).

**Ubicación en código:** Línea 458

---

## 6️⃣ MÉTODOS DE API

### getApiEndpoint() [static]

```typescript
public static getApiEndpoint(): string | undefined
```

Retorna el endpoint de API definido en `@ApiEndpoint`.

**Uso:**
```typescript
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {}

Product.getApiEndpoint(); // '/api/products'
```

**Ubicación en código:** Línea 430

### getApiEndpoint() [instance]

```typescript
public getApiEndpoint(): string | undefined
```

Versión de instancia del método.

**Ubicación en código:** Línea 434

### getApiMethods() [static]

```typescript
public static getApiMethods(): HttpMethod[] | undefined
```

Retorna los métodos HTTP permitidos definidos en `@ApiMethods`.

**Retorna:**
```typescript
['GET', 'POST', 'PUT', 'DELETE']
```

**Ubicación en código:** Línea 448

### getApiMethods() [instance]

```typescript
public getApiMethods(): HttpMethod[] | undefined
```

Versión de instancia del método.

**Ubicación en código:** Línea 452

### isApiMethodAllowed() [static]

```typescript
public static isApiMethodAllowed(method: HttpMethod): boolean
```

Verifica si un método HTTP específico está permitido.

**Uso:**
```typescript
@ApiMethods(['GET', 'POST'])
export class Product extends BaseEntity {}

Product.isApiMethodAllowed('GET');    // true
Product.isApiMethodAllowed('DELETE'); // false
```

**Ubicación en código:** Línea 456
```typescript
public static isApiMethodAllowed(method: HttpMethod): boolean {
    const allowedMethods = this.getApiMethods();
    if (!allowedMethods) {
        return true; // Si no se especifica, se permiten todos
    }
    return allowedMethods.includes(method);
}
```

### isApiMethodAllowed() [instance]

```typescript
public isApiMethodAllowed(method: HttpMethod): boolean
```

Versión de instancia del método.

**Ubicación en código:** Línea 464

---

## 📊 Resumen de Métodos por Categoría

### Propiedades (10 métodos)
- getAllPropertiesNonFilter()
- getProperties()
- getKeys()
- getArrayKeys()
- getArrayKeysOrdered()
- getPropertyIndices()
- getCSSClasses()
- getPropertyName()
- getPropertyNameByKey()

### Tipos (5 métodos)
- getPropertyTypes()
- getPropertyType() [static + instance]
- getArrayPropertyType() [static + instance]

### Módulo (7 métodos)
- getModuleName()
- getModulePermission()
- getModuleIcon()
- getModuleListComponent()
- getModuleDetailComponent()
- getModuleDefaultComponent()
- getModuleCustomComponents()

### Validación (8 métodos)
- isRequired()
- requiredMessage()
- isValidation()
- validationMessage()
- isAsyncValidation()
- asyncValidationMessage()
- isDisabled()
- isReadOnly()

### UI (10 métodos)
- getViewGroups()
- getViewGroupRows()
- getStringType()
- getDisplayFormat()
- getFormattedValue()
- getHelpText()
- getTabOrders()
- isHideInDetailView()
- isHideInListView()

### API (6 métodos)
- getApiEndpoint() [static + instance]
- getApiMethods() [static + instance]
- isApiMethodAllowed() [static + instance]

**Total: 46 métodos de acceso a metadatos**

---

## 🎓 Ejemplo Completo de Uso

```typescript
@ModuleName('Products')
@ModuleIcon(ICONS.BOX)
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT'])
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    @HideInDetailView()
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Name', String)
    @ViewGroup('Basic Info')
    @Required(true)
    @HelpText('Enter product name')
    name!: string;
    
    @PropertyIndex(3)
    @PropertyName('Price', Number)
    @ViewGroup('Basic Info')
    @DisplayFormat((val) => `$${val.toFixed(2)}`)
    price!: number;
    
    @PropertyIndex(4)
    @PropertyName('Tags', Array)
    @ArrayOf(Tag)
    @TabOrder(1)
    tags!: Tag[];
}

// Usar métodos de acceso
const product = new Product({ id: 1, name: 'Widget', price: 99.99 });

// Propiedades
console.log(product.getKeys()); // ['id', 'name', 'price']
console.log(product.getArrayKeys()); // ['tags']

// Módulo
console.log(Product.getModuleName()); // 'Products'
console.log(Product.getApiEndpoint()); // '/api/products'

// Validación
console.log(product.isRequired('name')); // true
console.log(product.getHelpText('name')); // 'Enter product name'

// UI
console.log(product.getViewGroups()); // { name: 'Basic Info', price: 'Basic Info' }
console.log(product.getFormattedValue('price')); // '$99.99'
console.log(product.isHideInDetailView('id')); // true

// Tipos
console.log(product.getPropertyType('price')); // Number
console.log(product.getArrayPropertyType('tags')); // Tag
```

---

## 🔗 Referencias

- **BaseEntity Core:** `base-entity-core.md`
- **Decoradores:** `../../layers/01-decorators/`
- **CRUD Operations:** `crud-operations.md`
- **Validation System:** `validation-system.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
