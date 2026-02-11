# PropertyName Decorator

## 1. Propósito

Definir el nombre visual y el tipo de una propiedad de entidad. Es el decorador fundamental y obligatorio para que una propiedad sea reconocida por el sistema de metadatos.

## 2. Alcance

Este decorador aplica a:
- Propiedades de clases que heredan de BaseEntity
- Tipos primitivos: String, Number, Date, Boolean
- Tipos complejos: Enumeraciones, entidades relacionadas, arrays tipados
- Generación automática de componentes UI
- Sistema de acceso a metadatos en tiempo de ejecución

## 3. Definiciones Clave

**PropertyType:** Tipo definible para una propiedad. Puede ser String, Number, Date, Boolean, clase de entidad que herede BaseEntity, EnumAdapter o ArrayTypeWrapper.

**PROPERTY_NAME_KEY:** Símbolo utilizado para almacenar mapa de nombres visuales de propiedades en el prototipo de clase.

**PROPERTY_TYPE_KEY:** Símbolo utilizado para almacenar mapa de tipos de propiedades en el prototipo de clase.

**ARRAY_ELEMENT_TYPE_KEY:** Símbolo utilizado para almacenar tipo de elementos en propiedades de tipo array.

**ArrayTypeWrapper:** Clase contenedora que encapsula el tipo de elementos de un array.

**EnumAdapter:** Adaptador para enumeraciones que permite su uso como PropertyType.

Ubicación en código: src/decorations/property_name_decorator.ts

---

## 🔑 Símbolo de Metadatos

```typescript
export const PROPERTY_NAME_KEY = Symbol('property_name');
export const PROPERTY_TYPE_KEY = Symbol('property_type');
export const ARRAY_ELEMENT_TYPE_KEY = Symbol('array_element_type');
```

### Almacenamiento

Los metadatos se guardan en el prototipo de la clase:

```typescript
proto[PROPERTY_NAME_KEY] = {
    'propertyKey': 'Display Name',
    'email': 'Email Address',
    'price': 'Unit Price'
}

proto[PROPERTY_TYPE_KEY] = {
    'propertyKey': String,
    'email': String,
    'price': Number
}

// Para arrays:
proto[ARRAY_ELEMENT_TYPE_KEY] = {
    'items': Product  // Tipo de elementos del array
}
```

---

## 💻 Firma del Decorador

```typescript
function PropertyName(
    name: string,           // Nombre para mostrar en UI
    type: PropertyType      // Tipo de la propiedad
): PropertyDecorator

// PropertyType puede ser:
type PropertyType = 
    | typeof String
    | typeof Number
    | typeof Date
    | typeof Boolean
    | (new (...args: any[]) => BaseEntity)  // Clase de entidad
    | EnumAdapter                            // Enum adaptado
    | ArrayTypeWrapper                       // ArrayOf(Type)
```

---

## 📖 Uso Básico

### Tipos Primitivos

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Price', Number)
    price!: number;
    
    @PropertyName('Release Date', Date)
    releaseDate!: Date;
    
    @PropertyName('In Stock', Boolean)
    inStock!: boolean;
}
```

### Enums

```typescript
enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DISCONTINUED = 'discontinued'
}

export class Product extends BaseEntity {
    @PropertyName('Status', ProductStatus)
    status!: ProductStatus;
}
// Genera automáticamente: Select/Dropdown con opciones del enum
```

### Relaciones (BaseEntity)

```typescript
import { Category } from './category';

export class Product extends BaseEntity {
    @PropertyName('Category', Category)
    category!: Category;
}
// Genera automáticamente: ObjectInputComponent (select de categorías)
```

### Arrays

```typescript
import { ArrayOf } from '@/decorations';

export class Order extends BaseEntity {
    @PropertyName('Items', ArrayOf(OrderItem))
    items!: Array<OrderItem>;
}
// Genera automáticamente: ArrayInputComponent con tabla y botones Add/Remove
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos Estáticos (Clase)

#### `getProperties()`
Obtiene mapa de propiedades → nombres.

```typescript
// Uso
const properties = Product.getProperties();
// Retorna:
// {
//     name: 'Product Name',
//     price: 'Price',
//     releaseDate: 'Release Date',
//     inStock: 'In Stock'
// }

// Ubicación en BaseEntity
public static getProperties(): Record<string, string> {
    const proto = this.prototype;
    return proto[PROPERTY_NAME_KEY] || {};
}
```

#### `getPropertyType(key: string)`
Obtiene el tipo de una propiedad específica.

```typescript
// Uso
const type = Product.getPropertyType('price');
// Retorna: Number

const type2 = Product.getPropertyType('category');
// Retorna: Category (constructor de clase)

// Ubicación en BaseEntity
public static getPropertyType(key: string): PropertyType {
    const proto = this.prototype;
    return proto[PROPERTY_TYPE_KEY]?.[key];
}
```

#### `getArrayPropertyType(key: string)`
Obtiene el tipo de elementos de un array.

```typescript
// Uso
const itemType = Order.getArrayPropertyType('items');
// Retorna: OrderItem (constructor)

// Ubicación en BaseEntity
public static getArrayPropertyType(key: string): new (...args: any[]) => BaseEntity {
    const proto = this.prototype;
    return proto[ARRAY_ELEMENT_TYPE_KEY]?.[key];
}
```

#### `getAllPropertiesNonFilter()`
Obtiene todas las propiedades sin filtrar.

```typescript
// Uso
const allProps = Product.getAllPropertiesNonFilter();
// Retorna todas las propiedades incluyendo ocultas

// Ubicación en BaseEntity (línea ~175)
public static getAllPropertiesNonFilter(): Record<string, string> {
    const proto = this.prototype;
    return proto[PROPERTY_NAME_KEY] || {};
}
```

### Métodos de Instancia

#### `getKeys()`
Obtiene claves de propiedades ordenadas.

```typescript
// Uso
const product = new Product({ name: 'Widget', price: 99 });
const keys = product.getKeys();
// Retorna: ['name', 'price', 'releaseDate', 'inStock']
// (Ordenado según @PropertyIndex)

// Ubicación en BaseEntity (línea ~90)
public getKeys(): string[] {
    const columns = (this.constructor as typeof BaseEntity).getProperties();
    const keys = Object.keys(columns);
    const propertyIndices = this.getPropertyIndices();
    
    return keys.sort((a, b) => {
        const indexA = propertyIndices[a] ?? Number.MAX_SAFE_INTEGER;
        const indexB = propertyIndices[b] ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
    });
}
```

---

## 🎨 Impacto en UI

### En ListView (Tabla)

```vue
<thead>
  <tr>
    <!-- Genera columnas basadas en PropertyName -->
    <td v-for="(displayName, key) in Product.getProperties()">
      {{ displayName }}
    </td>
  </tr>
</thead>
<!-- Resultado: -->
<!-- <td>Product Name</td> -->
<!-- <td>Price</td> -->
<!-- <td>Release Date</td> -->
```

### En DetailView (Formulario)

```vue
<label :for="'id-' + metadata.propertyName">
  {{ metadata.propertyName }}
</label>
<input :id="'id-' + metadata.propertyName" ... />

<!-- Si propertyName = 'Product Name': -->
<!-- <label for="id-name">Product Name</label> -->
```

### Selección de Componente

El **tipo** define qué componente se genera:

```typescript
// String → TextInputComponent
@PropertyName('Name', String)
name!: string;

// Number → NumberInputComponent
@PropertyName('Price', Number)
price!: number;

// Date → DateInputComponent
@PropertyName('Date', Date)
date!: Date;

// Boolean → BooleanInputComponent
@PropertyName('Active', Boolean)
active!: boolean;

// Enum → ListInputComponent (select)
@PropertyName('Status', MyEnum)
status!: MyEnum;

// BaseEntity → ObjectInputComponent (select de entidades)
@PropertyName('Category', Category)
category!: Category;

// Array → ArrayInputComponent (tabla con add/remove)
@PropertyName('Items', ArrayOf(Item))
items!: Array<Item>;
```

**Ubicación lógica:** `src/views/default_detailview.vue` (línea ~40-90)

---

## 🔗 Decoradores Relacionados

### Usados Frecuentemente Juntos

```typescript
@PropertyIndex(1)                    // Orden
@ViewGroup('Basic Info')             // Agrupación
@PropertyName('Product Name', String) // ← Este decorador
@Required(true)                      // Validación required
@HelpText('Enter product name')      // Ayuda
@CSSColumnClass('table-length-medium') // Ancho de columna
name!: string;
```

### Dependencias

- **PropertyIndex** - Define orden de aparición
- **StringTypeDef** - Si tipo es String, define subtipo (EMAIL, PASSWORD, etc.)
- **HideInListView** / **HideInDetailView** - Oculta en vistas específicas

---

## ⚠️ Consideraciones Importantes

### 1. Es Obligatorio

Sin `@PropertyName`, la propiedad **no será procesada** por el sistema:

```typescript
// ❌ INCORRECTO - No aparecerá en UI
export class Product extends BaseEntity {
    name!: string;  // Sin decorador
}

// ✅ CORRECTO
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
}
```

### 2. Tipo Debe Coincidir

```typescript
// ❌ INCORRECTO - Tipo no coincide
@PropertyName('Price', String)  // Dice String
price!: number;                 // Pero es number

// ✅ CORRECTO
@PropertyName('Price', Number)
price!: number;
```

### 3. Arrays Requieren ArrayOf()

```typescript
// ❌ INCORRECTO
@PropertyName('Items', Array)  // Array sin tipo
items!: Array<OrderItem>;

// ✅ CORRECTO
@PropertyName('Items', ArrayOf(OrderItem))
items!: Array<OrderItem>;
```

### 4. Clases de Entidad Deben Heredar BaseEntity

```typescript
// ❌ INCORRECTO
class Category {  // No hereda BaseEntity
    name: string;
}

@PropertyName('Category', Category)
category!: Category;

// ✅ CORRECTO
class Category extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
}

@PropertyName('Category', Category)
category!: Category;
```

---

## 🧪 Ejemplos Avanzados

### Relaciones Múltiples

```typescript
export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Customer', Customer)
    @Required(true)
    customer!: Customer;
    
    @PropertyIndex(2)
    @PropertyName('Shipping Address', Address)
    shippingAddress!: Address;
    
    @PropertyIndex(3)
    @PropertyName('Billing Address', Address)
    billingAddress!: Address;
}
```

### Arrays Anidados

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Line Items', ArrayOf(LineItem))
    lineItems!: Array<LineItem>;
}

export class LineItem extends BaseEntity {
    @PropertyName('Product', Product)
    product!: Product;
    
    @PropertyName('Add-ons', ArrayOf(Addon))
    addons!: Array<Addon>;
}
```

### Enums Personalizados

```typescript
enum Priority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4
}

export class Task extends BaseEntity {
    @PropertyName('Priority Level', Priority)
    priority!: Priority;
}
// Genera select con: Low, Medium, High, Critical
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function PropertyName(name: string, type: PropertyType): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        // Inicializar objeto de metadatos si no existe
        if (!proto[PROPERTY_NAME_KEY]) {
            proto[PROPERTY_NAME_KEY] = {};
        }
        proto[PROPERTY_NAME_KEY][propertyKey] = name;
        
        if (!proto[PROPERTY_TYPE_KEY]) {
            proto[PROPERTY_TYPE_KEY] = {};
        }
        
        // Detectar si es ArrayTypeWrapper
        if (type instanceof ArrayTypeWrapper) {
            proto[PROPERTY_TYPE_KEY][propertyKey] = Array;
            
            if (!proto[ARRAY_ELEMENT_TYPE_KEY]) {
                proto[ARRAY_ELEMENT_TYPE_KEY] = {};
            }
            proto[ARRAY_ELEMENT_TYPE_KEY][propertyKey] = type.elementType;
        } else {
            // Si es enum, envolver en EnumAdapter
            const isEnum = typeof type === 'object' && !type.prototype;
            proto[PROPERTY_TYPE_KEY][propertyKey] = isEnum ? new EnumAdapter(type) : type;
        }
    };
}
```

### ArrayOf Helper

```typescript
class ArrayTypeWrapper {
    constructor(public elementType: new (...args: any[]) => BaseEntity) {}
}

export function ArrayOf<T extends BaseEntity>(
    elementType: new (...args: any[]) => T
): ArrayTypeWrapper {
    return new ArrayTypeWrapper(elementType);
}
```

---

## 📊 Flujo de Datos

```
1. Decorador se aplica en tiempo de definición de clase
   @PropertyName('Name', String)
   name!: string;
        ↓
2. Metadatos se guardan en prototipo
   proto[PROPERTY_NAME_KEY]['name'] = 'Name'
   proto[PROPERTY_TYPE_KEY]['name'] = String
        ↓
3. BaseEntity proporciona accesores
   Product.getProperties() → { name: 'Name', ... }
   Product.getPropertyType('name') → String
        ↓
4. UI lee metadatos y genera componentes
   if (type === String) → <TextInputComponent />
        ↓
5. Componente usa propertyName para label
   <label>{{ metadata.propertyName }}</label>
```

---

## 🎓 Casos de Uso Comunes

### 1. CRUD Básico
```typescript
@PropertyName('ID', Number)
id!: number;

@PropertyName('Name', String)
name!: string;
```

### 2. Relaciones
```typescript
@PropertyName('Parent Category', Category)
parentCategory?: Category;
```

### 3. Listas Dinámicas
```typescript
@PropertyName('Tags', ArrayOf(Tag))
tags!: Array<Tag>;
```

### 4. Campos Computados (Solo Lectura)
```typescript
@PropertyName('Full Name', String)
@ReadOnly(true)
get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
}
```

---

## 📚 Referencias Adicionales

- `property-index-decorator.md` - Orden de propiedades
- `string-type-decorator.md` - Subtipos de String
- `../02-base-entity/metadata-access.md` - Acceso a metadatos
- `../04-components/form-inputs.md` - Componentes generados

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/property_name_decorator.ts`
