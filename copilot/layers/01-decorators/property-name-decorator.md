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

## 4. Descripción Técnica

### Implementación del Decorador

```typescript
// src/decorations/property_name_decorator.ts

export const PROPERTY_NAME_KEY = Symbol('property_name');
export const PROPERTY_TYPE_KEY = Symbol('property_type');
export const ARRAY_ELEMENT_TYPE_KEY = Symbol('array_element_type');

export function PropertyName(
    name: string,
    type: PropertyType
): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        const proto = target as any;

        // Almacenar nombre de propiedad
        if (!proto[PROPERTY_NAME_KEY]) {
            proto[PROPERTY_NAME_KEY] = {};
        }
        proto[PROPERTY_NAME_KEY][propertyKey] = name;

        // Almacenar tipo de propiedad
        if (!proto[PROPERTY_NAME_KEY]) {
            proto[PROPERTY_TYPE_KEY] = {};
        }
        proto[PROPERTY_TYPE_KEY][propertyKey] = type;

        // Para arrays, almacenar tipo de elemento
        if (type instanceof ArrayTypeWrapper) {
            if (!proto[ARRAY_ELEMENT_TYPE_KEY]) {
                proto[ARRAY_ELEMENT_TYPE_KEY] = {};
            }
            proto[ARRAY_ELEMENT_TYPE_KEY][propertyKey] = type.elementType;
        }
    };
}
```

La función decoradora recibe dos parámetros: `name` (string para display) y `type` (PropertyType). Retorna PropertyDecorator que almacena ambos valores en metadata del prototype usando Symbols como keys. Para arrays, extrae y almacena el elementType del ArrayTypeWrapper en ARRAY_ELEMENT_TYPE_KEY Symbol.

### Metadata Storage Structure

```typescript
// Estructura en prototype después de aplicar decoradores
Product.prototype[PROPERTY_NAME_KEY] = {
    'id': 'Product ID',
    'name': 'Product Name',
    'price': 'Price',
    'category': 'Category',
    'items': 'Order Items'
};

Product.prototype[PROPERTY_TYPE_KEY] = {
    'id': Number,
    'name':String,
    'price': Number,
    'category': Category,  // Clase BaseEntity
    'items': ArrayTypeWrapper
};

Product.prototype[ARRAY_ELEMENT_TYPE_KEY] = {
    'items': OrderItem  // Tipo de elementos del array
};
```

Los tres maps se almacenan separadamente en prototype usando Symbols únicos. Esto permite O(1) access a nombre, tipo y elementType de cualquier propiedad.

### BaseEntity Accessors

```typescript
// src/entities/base_entitiy.ts

// Método estático
public static getProperties(): Record<string, string> {
    const proto = this.prototype;
    return proto[PROPERTY_NAME_KEY] || {};
}

public static getPropertyType(key: string): PropertyType | undefined {
    const proto = this.prototype;
    const types = proto[PROPERTY_TYPE_KEY] || {};
    return types[key];
}

// Métodos de instancia
public getPropertyName(key: string): string | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getProperties()[key];
}

public getPropertyType(key: string): PropertyType | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getPropertyType(key);
}
```

BaseEntity proporciona accessors estáticos (clase level) e instancia level. Los métodos estáticos acceden directamente a prototype metadata. Los métodos de instancia delegan a métodos estáticos obteniendo constructor.

Ubicación: líneas ~120-180 de `src/entities/base_entitiy.ts`.

---

## 5. Flujo de Funcionamiento

### Proceso de Decoración en Tiempo de Compilación

```
1. TypeScript procesa class definition
        ↓
2. Encuentra decorador @PropertyName('Product Name', String)
        ↓
3. Ejecuta PropertyName() function retornando PropertyDecorator
        ↓
4. Decorator ejecutado con (target, propertyKey)
        ↓
5. Almacena 'Product Name' en proto[PROPERTY_NAME_KEY]['name']
        ↓
6. Almacena String en proto[PROPERTY_TYPE_KEY]['name']
        ↓
7. Si tipo es ArrayTypeWrapper, almacena elementType
        ↓
8. Metadata disponible en runtime
```

### Resolución de Componente de Input en DefaultDetailView

```
1. DefaultDetailView itera sobre entity.getEditableProperties()
        ↓
2. Para cada propertyKey, obtiene tipo: entity.getPropertyType(propertyKey)
        ↓
3. Determina componente según PropertyType:
        ↓
   - String → TextInputComponent (o Email/Password/TextArea según StringType)
   - Number → NumberInputComponent
   - Date → DateInputComponent
   - Boolean → BooleanInputComponent
   - BaseEntity class → ObjectInputComponent
   - EnumAdapter → ListInputComponent
   - ArrayTypeWrapper → ArrayInputComponent
        ↓
4. Renderiza: <component :is="resolvedComponent" v-model="entity[propertyKey]" />
        ↓
5. Obtiene label: entity.getPropertyName(propertyKey)
        ↓
6. Renderiza label encima del input
```

---

## 6. Reglas Obligatorias

### Aplicación del Decorador

**OBLIGATORIO 6.1:** El decorador @PropertyName DEBE aplicarse a TODAS las propiedades que se desean mostrar en UI. Propiedades sin decorador NO aparecen en ListView ni DetailView automáticamente.

**OBLIGATORIO 6.2:** El decorador DEBE recibir exactamente 2 parámetros: name (string) y type (PropertyType). Ambos son requeridos, no hay valores default.

**OBLIGATORIO 6.3:** El parámetro `name` DEBE ser string descriptivo user-friendly para display en UI. NO usar nombres técnicos como 'prod_name', usar 'Product Name'.

**OBLIGATORIO 6.4:** El parámetro `type` DEBE coincidir con el tipo TypeScript de la propiedad. Si propiedad es `name!: string`, type debe ser String. Mismatch causa errores de renderización de inputs.

### Tipos de Propiedades

**OBLIGATORIO 6.5:** Para propiedades String con subtipos específicos (email, password, textarea), DEBE usarse decorador @StringType adicional junto con @PropertyName. Solo @PropertyName con String genera TextInput básico.

**OBLIGATORIO 6.6:** Para propiedades array, DEBE usarse ArrayOf(Type) wrapper: `@PropertyName('Items', ArrayOf(OrderItem))`. NO usar Array directamente como type.

**OBLIGATORIO 6.7:** Para relaciones con otras entidades BaseEntity, DEBE pasarse la clase directamente: `@PropertyName('Category', Category)`. NO usar string 'Category'.

**OBLIGATORIO 6.8:** Para enums, DEBE pasarse el enum directamente: `@PropertyName('Status', ProductStatus)`. El framework detecta enums automáticamente.

### Orden de Decoradores

**OBLIGATORIO 6.9:** @PropertyName DEBE aplicarse ANTES de otros decoradores de metadata (@Required, @Validation, @Disabled, etc.). Orden correcto asegura que metadata se merge correctamente.

---

## 7. Prohibiciones

### Anti-Patterns de Uso

**PROHIBIDO 7.1:** NO omitir @PropertyName decorador esperando que el framework infiera nombres automáticamente. Framework NO mira nombres de propiedades TypeScript para display.

**PROHIBIDO 7.2:** NO usar nombres técnicos database-style como 'prod_id', 'cat_name' en parámetro name. DEBE usar nombres user-friendly: 'Product ID', 'Category Name'.

**PROHIBIDO 7.3:** NO usar type='string' (lowercase string literal). DEBE usar String (constructor function). TypeScript type y PropertyType son diferentes conceptos.

**PROHIBIDO 7.4:** NO decorar propiedades privadas (_internalState) o métodos. @PropertyName solo aplica a propiedades públicas de data.

### Anti-Patterns de Tipos

**PROHIBIDO 7.5:** NO usar Array como type directamente: `@PropertyName('Items', Array)`. DEBE usar `ArrayOf(ElementType)`: `@PropertyName('Items',ArrayOf(OrderItem))`.

**PROHIBIDO 7.6:** NO usar Object como type para relaciones: `@PropertyName('Category', Object)`. DEBE usar clase específica: `@PropertyName('Category', Category)`.

**PROHIBIDO 7.7:** NO mezclar tipos TypeScript con PropertyType: `@PropertyName('Age', number)` (lowercase). DEBE ser `@PropertyName('Age', Number)` (uppercase constructor).

**PROHIBIDO 7.8:** NO usar tipos genéricos complejos como PropertyType: `@PropertyName('Data', Map<string, number>)`. Framework solo soporta tipos básicos, entidades, enums y arrays.

### Anti-Patterns de Metadata

**PROHIBIDO 7.9:** NO modificar metadata manualmente después de decoración: `Product.prototype[PROPERTY_NAME_KEY]['name'] = 'NewName'`. Metadata es read-only después de class definition.

**PROHIBIDO 7.10:** NO intentar acceder a Symbol keys sin importar Symbol: `proto['property_name']`. DEBE importar Symbol: `import { PROPERTY_NAME_KEY } from '@/decorations'`.

---

## 8. Dependencias

### Decoradores del Framework

- `@StringType`: Define subtipo de String (TEXT, EMAIL, PASSWORD, TEXTAREA). Requerido para strings no-plain-text. Ubicación: `src/decorations/string_type_decorator.ts`.
- `@Required`: Marca propiedad como obligatoria. Frecuentemente usado junto con @PropertyName. Ubicación: `src/decorations/required_decorator.ts`.
- `@PrimaryProperty`: Marca propiedad primaria para display en relaciones. Comúnmente aplicado donde @PropertyName está presente. Ubicación: `src/decorations/primary_property_decorator.ts`.

### Helpers y Types

- `ArrayOf()`: Function helper para crear ArrayTypeWrapper. Signatura: `ArrayOf<T>(type: new (...args: any[]) => T): ArrayTypeWrapper<T>`. Ubicación: `src/decorations/property_name_decorator.ts`.
- `PropertyType`: Type union de tipos válidos. Definición: `type PropertyType = typeof String | typeof Number | typeof Date | typeof Boolean | (new (...args: any[]) => BaseEntity) | EnumAdapter | ArrayTypeWrapper`. Ubicación: `src/decorations/property_name_decorator.ts`.

### BaseEntity Methods

- `getProperties()`: Static method retornando Record<string, string> con map de propertyKey → display name. Usado por DefaultDetailView y ListView para iterar sobre propiedades visibles.
- `getPropertyType(key)`: Retorna PropertyType de propiedad específica. Usado por resolución de componentes de input.
- `getPropertyName(key)`: Instance method retornando display name de propiedad. Usado por componentes de input para labels.

### Componentes de Input

Los siguientes componentes consumen metadata de @PropertyName para renderización automática:

- `TextInputComponent`: Para String con StringType.TEXT o sin StringType
- `NumberInputComponent`: Para Number
- `DateInputComponent`: Para Date
- `BooleanInputComponent`: Para Boolean
- `EmailInputComponent`: Para String con StringType.EMAIL
- `PasswordInputComponent`: Para String con StringType.PASSWORD
- `TextAreaComponent`: Para String con StringType.TEXTAREA
- `ObjectInputComponent`: Para BaseEntity classes
- `ListInputComponent`: Para Enums
- `ArrayInputComponent`: Para Arrays con ArrayOf()

Ubicación: `src/components/Form/`

---

## 9. Relaciones

### Relación con @ModuleDefaultComponent

@ModuleDefaultComponent define componente de input DEFAULT para TODAS las propiedades de una entity, mientras @PropertyName define el TIPO de cada propiedad individual. Trabajan juntos: @PropertyName determina tipo (String, Number, Date) que normalmente resuelve a componente específico (TextInput, NumberInput, DateInput), pero @ModuleDefaultComponent OVERRIDE ese comportamiento forzando UN componente para todas las propiedades. Si ambos están presentes, @ModuleDefaultComponent tiene precedencia reemplazando resolución automática basada en PropertyType de @PropertyName. Uso típico: @PropertyName define tipos correctos para todas las propiedades, @ModuleDefaultComponent fuerza que todas usen mismo input custom (ej: MoneyInputComponent para todo).

### Relación con @ModuleCustomComponents

@ModuleCustomComponents define componentes de input ESPECÍFICOS property-by-property, mientras @PropertyName define tipo general de cada propiedad. Trabajan juntos: @PropertyName establece PropertyType baseline (String, Number, Category), @ModuleCustomComponents SELECTIVE override para propiedades específicas. Si propiedad tiene custom component en @ModuleCustomComponents, eso  tiene precedencia sobre resolución automática por PropertyType; si propiedad NO tiene custom component, usa resolución automática basada en PropertyType de @PropertyName. Ejemplo: todas las propiedades usan tipos normales (String → TextInput) EXCEPTO 'price' que usa PriceInputComponent custom definido en @ModuleCustomComponents.

### Relación con DefaultDetailView

DefaultDetailView es el consumidor principal de metadata de @PropertyName para rendering automático de formularios. Proceso: DefaultDetailView itera sobre `entity.getEditableProperties()` obteniendo lista de propertyKeys, para cada key llama `entity.getPropertyType(key)` obteniendo PropertyType de @PropertyName, resuelve componente input basándose en PropertyType (chain: ModuleCustomComponents → Type-based → ModuleDefaultComponent → fallback TextInput), llama `entity.getPropertyName(key)` para label, renderiza `<component :is="resolvedComponent" :label="propertyName" v-model="entity[key]" />`. Sin @PropertyName, DefaultDetailView NO puede determinar qué componente usar ni qué label mostrar, resultando en propiedad invisible o error de renderización.

### Relación con ListView (DefaultListView)

DefaultListView usa metadata de @PropertyName para renderizar columnas de tabla automáticamente. Proceso: ListView obtiene todas las propiedades con `EntityClass.getProperties()` retornando map de @PropertyName, para cada propiedad crea columna de tabla con header siendo display name de @PropertyName, renderiza valores con `entity.getFormattedValue(key)` o `entity[key].toString()`, ordena alfabéticamente por propertyKey o usa @PropertyIndex si está presente. PropertyType de @PropertyName NO afecta ListView directamente (solo afecta DetailView input selection), pero display name sí se usa para column headers. Sin @PropertyName, propiedad NO aparece en tabla de ListView.

### Relación con Validation Decorators (@Required, @Validation)

@Required y @Validation son decoradores independientes de @PropertyName que definen reglas de validación, mientras @PropertyName solo define display info y tipo. Trabajan en paralelo sin interferencia: @PropertyName determina QUÉ componente renderizar y label a mostrar, @Required/@Validation determinan CÓMO validar el valor del input. Los componentes de input consultan ambas metadata sources independientemente: `entity.getPropertyName(key)` para label, `entity.isRequired(key)` para asterisco required, `entity.validate(key, value)` para validación. Típicamente se aplican juntos: `@PropertyName('Email', String)` + `@StringType(StringTypes.EMAIL)` + `@Required()` + `@Validation(emailRegex)` para input de email completo.

---

## 10. Notas de Implementación

### Performance de Metadata Access

Metadata storage usando Symbols en prototype proporciona O(1) constant-time access. Sin embargo, DefaultDetailView itera sobre TODAS las propiedades en cada render. Para entities con 50+ propiedades, considerar usar `@HideInDetailView()` para propiedades que no necesitan mostrarse, reduciendo iterations. Access pattern eficiente: llamar `EntityClass.getProperties()` UNA VEZ en setup/computed y cachear resultado, NO llamar `entity.getPropertyName(key)` repetidamente en loop sin memoization.

### Type Safety con PropertyType

TypeScript NO verifica que PropertyType coincida con tipo real de propiedad en tiempo de compilación. Es responsabilidad del developer asegurar match correcto. Mismatch común: `name!: string` con `@PropertyName('Name', Number)` compila sin errores pero causa runtime errors al intentar renderizar NumberInputComponent para string value. Best practice: inmediatamente después de escribir tipo TypeScript de propiedad, aplicar @PropertyName con PropertyType matching; realizar code review específico verificando consistency entre tipos.

### ArrayOf() Helper Pattern

`ArrayOf(Type)` es syntax sugar que crea ArrayTypeWrapper encapsulando elementType. Alternativa interna: `new ArrayTypeWrapper(OrderItem)`, pero ArrayOf() proporciona syntax más limpia. ArrayTypeWrapper almacena solo la referencia a clase/type del elemento; NO crea instancias ni valida que array contenga elementos de ese tipo en runtime. ArrayInputComponent usa elementType para: determinar qué input component renderizar para cada elemento del array, obtener getDefaultPropertyValue() de elementos agregados, aplicar validación property-by-property en elementos.

### Enums Handling Automático

El framework detecta enums automáticamente sin necesidad de wrapper especial: cuando PropertyType es enum (typeof returned by TypeScript para enum), framework genera ListInputComponent con options siendo enum values. Enum keys se usan como display labels a menos que enum use string values descriptivos: `enum Status { ACTIVE = 'Active', INACTIVE = 'Inactive' }` muestra 'Active'/'Inactive'; `enum Status { ACTIVE, INACTIVE }` muestra 'ACTIVE'/'INACTIVE' (keys). Para custom labels diferentes de enum values, crear computed property en entity retornando formatted label.

### Custom Display Names en Runtime

Aunque @PropertyName define display name estático en decorador, puede overridearse en runtime para i18n o customization dinámica modificando metadata map directamente: `Product.prototype[PROPERTY_NAME_KEY]['name'] = translations[currentLocale].productName`. Sin embargo, esto es anti-pattern; mejor approach es usar computed property en component: `const nameLabel = computed(() => i18n.t('product.name'))` y pasar como prop a input component. Metadata decorators diseñados para valores estáticos defined at class definition time.

### Relaciones Bidirectionales Type Challenge

Para relaciones bidirectionales (Order has Customer, Customer has Orders array), ambas clases necesitan referenced before definition complete, causando circular dependency issues. Pattern: usar lazy evaluation en one side: `@PropertyName('Orders', ArrayOf(() => Order))` donde ArrayOf acepta function retornando type en lugar de type directo. Framework evalúa function solo cuando necesita type info, después de ambas clases están defined. Sin lazy eval, `Customer` references `Order` antes de Order class exists, causando ReferenceError.

---

## 11. Referencias Cruzadas

### Decoradores Relacionados

- [string-type-decorator.md](string-type-decorator.md): Define subtipo de String (EMAIL, PASSWORD, TEXTAREA) para correct input component selection.
- [required-decorator.md](required-decorator.md): Marca propiedad como obligatoria, frecuentemente usado junto con @PropertyName.
- [primary-property-decorator.md](primary-property-decorator.md): Define propiedad primaria para display en ObjectInputComponent lookups.
- [hide-in-detail-view-decorator.md](hide-in-detail-view-decorator.md): Oculta propiedad de DetailView aunque tenga @PropertyName.
- [hide-in-list-view-decorator.md](hide-in-list-view-decorator.md): Oculta propiedad de ListView aunque tenga @PropertyName.

### Base Entity y Metadata

- [../../02-base-entity/base-entity-core.md](../../02-base-entity/base-entity-core.md): Documentación de accessors `getProperties()`, `getPropertyType()`, `getPropertyName()`.
- [../../02-base-entity/metadata-accessors.md](../../02-base-entity/metadata-accessors.md): Todos los métodos de metadata access en BaseEntity.

### Componentes de Input

- [../../04-components/text-input-component.md](../../04-components/text-input-component.md): Input para PropertyType String.
- [../../04-components/number-input-component.md](../../04-components/number-input-component.md): Input para PropertyType Number.
- [../../04-components/object-input-component.md](../../04-components/object-input-component.md): Input para PropertyType BaseEntity classes.
- [../../04-components/array-input-component.md](../../04-components/array-input-component.md): Input para PropertyType ArrayOf().
- [../../04-components/list-input-component.md](../../04-components/list-input-component.md): Input para PropertyType Enums.

### Views y Resolución de Componentes

- [../../04-components/default-detail-view.md](../../04-components/default-detail-view.md): DetailView que consume @PropertyName metadata para rendering automático.
- [../../04-components/default-list-view.md](../../04-components/default-list-view.md): ListView que usa @PropertyName para column headers.

### Tutoriales

- [../../tutorials/01-basic-crud.md](../../tutorials/01-basic-crud.md): Tutorial básico mostrando uso de @PropertyName en entity simple.
- [../../tutorials/03-relations.md](../../tutorials/03-relations.md): Tutorial de relaciones usando @PropertyName con BaseEntity types y ArrayOf().

---

##Símbolo de Metadatos

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

## Firma del Decorador

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

## Uso Básico

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

## Funciones Accesoras en BaseEntity

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
