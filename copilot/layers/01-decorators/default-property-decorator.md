# DefaultProperty Decorator

## 1. Propósito

Marcar la propiedad de una entidad que se utilizará como representación textual por defecto de la instancia. Similar al método `__str__` en Python o `toString()` en Java, este decorador designa qué propiedad debe usarse para mostrar la entidad como texto cuando se requiera una representación legible por humanos. El valor de esta propiedad es retornado por el método `getDefaultPropertyValue()` de BaseEntity y es utilizado por componentes UI para mostrar opciones en selects, referencias en relaciones, breadcrumbs y cualquier contexto donde la entidad necesite representación textual concisa.

## 2. Alcance

**Responsabilidades cubiertas:**
- Marcar una propiedad específica como representación textual de la entidad
- Almacenar el nombre de la propiedad como metadata a nivel de clase (no de instancia)
- Proveer accessor `getDefaultPropertyValue()` que retorna el valor de la propiedad marcada
- Soportar uso en componentes de UI para mostrar entidades relacionadas
- Permitir identificación rápida de entidades en logs y debugging

**Límites del alcance:**
- NO establece valores por defecto para propiedades (ese no es su propósito)
- NO asigna valores automáticamente en el constructor
- Solo puede marcarse UNA propiedad por clase (última aplicación del decorador gana)
- NO valida que la propiedad exista o tenga valor
- NO formatea el valor (se retorna tal como está)

## 3. Definiciones Clave

**DEFAULT_PROPERTY_KEY Symbol:** Identificador único usado como property key directo en la clase (NO en prototype) para almacenar el nombre de la propiedad que representa textualmente la entidad. Definido como `export const DEFAULT_PROPERTY_KEY = Symbol('default_property')`.

**Decorator Signature:** `function DefaultProperty(propertyName: string): ClassDecorator`. Recibe el nombre de la propiedad como string, retorna decorator que almacena metadata a nivel de clase.

**Class-Level Decorator:** Este es un ClassDecorator que se aplica a la clase completa, NO a propiedades individuales. Se coloca antes de la declaración de clase, no antes de una propiedad específica.

**getDefaultPropertyValue() Accessor:** Método de instancia en BaseEntity que lee el nombre de la propiedad desde la metadata de clase y retorna el valor de esa propiedad en la instancia actual. Si no hay metadata o la propiedad no tiene valor, retorna undefined.

**Representación Textual:** El valor usado para mostrar la entidad de forma legible. Comúnmente propiedades como 'name', 'title', 'fullName', 'description', etc.

## 4. Descripción Técnica

### 4.1 Implementación del Decorador

**Ubicación:** `src/decorations/default_property_decorator.ts` líneas 1-20.

```typescript
import { DEFAULT_PROPERTY_KEY } from './decorator_keys';

/**
 * ClassDecorator que marca una propiedad como representación textual por defecto
 * de la entidad. El valor de esta propiedad se usa para mostrar la entidad en UI.
 * 
 * @param propertyName - Nombre de la propiedad que representa textualmente la entidad
 * @returns ClassDecorator que configura la metadata de representación textual
 */
export function DefaultProperty(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[DEFAULT_PROPERTY_KEY] = propertyName;
    };
}
```

**Key Points:**
- Es un **ClassDecorator** (se aplica antes de `export class`)
- Recibe **un parámetro obligatorio:** el nombre de la propiedad (string)
- Almacena en **target directo** (la clase), NO en prototype
- La sintaxis de aplicación es `@DefaultProperty('name')` antes de la declaración de clase
- **NO asigna valores por defecto** a propiedades (ese NO es su propósito)

**Ejemplo de uso correcto:**
```typescript
@DefaultProperty('name')  // ClassDecorator que marca 'name' como representación textual
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Description', String)
    description!: string;
}

// Ahora product.getDefaultPropertyValue() retornará this.name
const product = new Product({ id: 1, name: 'Laptop', description: 'Gaming laptop' });
console.log(product.getDefaultPropertyValue());  // 'Laptop'
```

### 4.2 Almacenamiento de Metadata

**Storage Location:** Directamente en la clase (Function target), no en prototype.

```typescript
// Después de decorar:
@DefaultProperty('name')
export class Product extends BaseEntity {
    name!: string;
}

// La metadata queda almacenada así:
Product[DEFAULT_PROPERTY_KEY] === 'name'  // true
```

**Razón del almacenamiento en clase directa:** El decorador almacena en la clase porque la configuración de representación textual es una decisión de tipo (type-level), no de instancia (instance-level). Todas las instancias de Product usan 'name' como representación textual.

### 4.3 Lectura de Metadata en BaseEntity

**Ubicación:** `src/entities/base_entitiy.ts` líneas 232-239.

```typescript
/**
 * Retorna el valor de la propiedad configurada como representación textual.
 * Si no hay decorador aplicado, retorna undefined.
 */
public getDefaultPropertyValue(): any {
    const propertyName = (this.constructor as any)[DEFAULT_PROPERTY_KEY];
    if (!propertyName) {
        return undefined;
    }
    return (this as any)[propertyName];
}
```

**Comportamiento:**
- Lee la metadata DEFAULT_PROPERTY_KEY de la clase
- Extrae el valor de esa propiedad de la instancia actual
- Si no hay decorador aplicado, retorna undefined
- Si la propiedad no tiene valor, retorna undefined también

### 4.4 Uso en Componentes UI

**Select/Dropdown Options:**

```typescript
// FormFieldInputSelectComponent.vue
const options = await Product.getElementList();
// options = [
//   { id: 1, name: 'Laptop', description: '...' },
//   { id: 2, name: 'Mouse', description: '...' }
// ]

// El componente muestra:
<option v-for="product in options" :value="product.id">
    {{ product.getDefaultPropertyValue() }}  <!-- Muestra: 'Laptop', 'Mouse' -->
</option>
```

**Breadcrumbs:**

```typescript
// Navigation.vue
const currentEntity = await Product.getElement(productId);
const breadcrumb = `${currentEntity.getDefaultPropertyValue()}`;  
// breadcrumb = 'Laptop'
```

**Referencias en Relaciones:**

```typescript
// Order.vue - Mostrando productos relacionados
@DefaultProperty('name')
export class Product extends BaseEntity {
    name!: string;
}

const products = order.products;  // Array de Product instances
products.forEach(product => {
    console.log(product.getDefaultPropertyValue());  // Imprime el nombre de cada producto
});
```

### 4.5 Diferencia con Otros Conceptos

**NO es lo mismo que Default Values:**

```typescript
// INCORRECTO - DefaultProperty NO asigna valores por defecto
@DefaultProperty('active')  // ❌ Esto NO asigna 'active' como valor inicial
status!: string;

// Para asignar valores iniciales, simplemente use:
status: string = 'active';  // ✅ Correcto

// DefaultProperty marca CUÁL PROPIEDAD USAR para representar la entidad:
@DefaultProperty('name')  // ✅ Correcto - marca que 'name' representa la entidad
export class Product extends BaseEntity {
    name!: string;  // Esta es la propiedad que se usará como texto representativo
}
```

## 5. Flujo de Funcionamiento

### 5.1 Decoración en Tiempo de Compilación

```
[Código TypeScript]
@DefaultProperty('name')
export class Product extends BaseEntity {
    name!: string;
}
         |
         v
[Compiler ejecuta decorator]
         |
         v
[DefaultProperty('name'): ClassDecorator]
         |
         v
[target = Product (clase)]
         |
         v
[Product[DEFAULT_PROPERTY_KEY] = 'name']
         |
         v
[Metadata almacenada en clase]
```

### 5.2 Lectura en Runtime - Componente UI

```
[Componente necesita mostrar entidad]
const product = await Product.getElement(123);
// product = { id: 123, name: 'Laptop', description: 'Gaming laptop' }
         |
         v
[Componente llama getDefaultPropertyValue()]
         |
         v
[getDefaultPropertyValue() lee metadata]
const propertyName = Product[DEFAULT_PROPERTY_KEY];  // 'name'
         |
         v
[Extrae valor de esa propiedad]
return this['name'];  // this.name
         |
         v
[Retorna 'Laptop']
         |
         v
[UI muestra "Laptop" como texto representativo]
```

### 5.3 Uso en Select/Dropdown

```
[Formulario con campo de productos relacionados]
const products = await Product.getElementList();
// products = [
//   { id: 1, name: 'Laptop', ... },
//   { id: 2, name: 'Mouse', ... },
//   { id: 3, name: 'Keyboard', ... }
// ]
         |
         v
[Componente itera para generar options]
<option v-for="product in products" :value="product.id">
    {{ product.getDefaultPropertyValue() }}
</option>
         |
         v
[Cada producto retorna su 'name']
product1.getDefaultPropertyValue() → 'Laptop'
product2.getDefaultPropertyValue() → 'Mouse'
product3.getDefaultPropertyValue() → 'Keyboard'
         |
         v
[UI renderiza:]
<option value="1">Laptop</option>
<option value="2">Mouse</option>
<option value="3">Keyboard</option>
```

### 5.4 Fallback cuando NO hay decorador

```
[Entidad SIN @DefaultProperty]
export class SimpleEntity extends BaseEntity {
    name!: string;
}
         |
         v
[getDefaultPropertyValue() llamado]
         |
         v
[constructor[DEFAULT_PROPERTY_KEY] === undefined]
         |
         v
[return undefined]
         |
         v
[UI debe manejar caso sin representación textual]
// Puede usar id, toString(), o mensaje "Sin nombre"
```

## 6. Reglas Obligatorias

1. **Parámetro obligatorio:** El decorador DEBE recibir el nombre de la propiedad como string parameter: `@DefaultProperty('name')`, `@DefaultProperty('title')`, etc.

2. **Class-level decoration:** DEBE aplicarse antes de la declaración de clase con `export class`, NO sobre propiedades individuales. Es un ClassDecorator, no PropertyDecorator.

3. **Propiedad debe existir:** El nombre de propiedad pasado al decorador DEBE corresponder a una propiedad real definida en la entidad. Si se especifica `@DefaultProperty('name')`, la clase debe tener `name!: string`.

4. **Único decorador por clase:** Solo UNA invocación de @DefaultProperty permitida por entidad. Si necesita combinar múltiples propiedades, implemente método custom.

5. **Propiedad debe tener valor legible:** La propiedad marcada debería contener valores que sean legibles por humanos (generalmente strings). Evite usar propiedades numéricas o booleanas.

6. **NO es para default values:** Este decorador NO asigna valores por defecto a propiedades. Solo marca cuál propiedad usar como representación textual.

7. **Verificar en UI:** Componentes que usan getDefaultPropertyValue() DEBEN manejar caso cuando retorna undefined (entidad sin decorador o propiedad sin valor).

8. **Propiedad importante:** La propiedad marcada debe ser significativa para usuarios (name, title, description), no propiedades técnicas (id, createdAt, internalCode).

## 7. Prohibiciones

1. **NO usar como PropertyDecorator:** Jamás escribir `@DefaultProperty('name') name!: string` decorando la propiedad directamente. Es un ClassDecorator que se aplica a la clase.

2. **NO omitir parámetro:** Nunca escribir `@DefaultProperty()` sin parámetro. El decorador REQUIERE el nombre de la propiedad como string.

3. **NO decorar múltiples propiedades:** No puede haber más de una representación textual por entidad. Si necesita combinar campos, implemente getter custom.

4. **NO confundir con asignación de valores:** Este decorador NO asigna valores. No espere que `@DefaultProperty('active')` asigne 'active' a ninguna propiedad.

5. **NO usar propiedades no-string:** Aunque técnicamente posible, evite marcar propiedades numéricas (`id`), booleanas (`isActive`), o fechas (`createdAt`) como representación textual.

6. **NO asumir siempre tiene valor:** La propiedad marcada puede estar vacía (undefined, null, ''). getDefaultPropertyValue() retornará ese valor vacío sin validar.

7. **NO usar para formateo:** El decorador retorna el valor crudo sin formatear. Si necesita formato (`formatCurrency(price)`), hágalo en el componente UI.

8. **NO cambiar metadata en runtime:** Una vez decorada la clase, no modificar `constructor[DEFAULT_PROPERTY_KEY]`. La metadata es inmutable post-decoración.

## 8. Dependencias

### 8.1 Decoradores Relacionados

**PropertyName (FUNDAMENTAL):**  
La propiedad especificada en @DefaultProperty DEBE estar decorada con @PropertyName para que esté registrada en metadata del framework.

**ModuleName (COMÚN):**  
Generalmente aplicado en conjunto con @DefaultProperty ya que las entidades modulares necesitan representación textual para UI.

### 8.2 Framework Dependencies

**BaseEntity.getDefaultPropertyValue():**  
Método que lee la metadata DEFAULT_PROPERTY_KEY y extrae el valor de la propiedad marcada.

**decorator_keys.ts:**  
Define DEFAULT_PROPERTY_KEY Symbol usado para almacenar metadata.

**Componentes UI:**  
FormFieldInputSelectComponent, RelationDisplay y otros componentes usan getDefaultPropertyValue() para mostrar entidades.

## 9. Relaciones

### 9.1 Con Componentes UI

Los componentes de formulario y visualización usan getDefaultPropertyValue() para renderizar entidades de forma legible:

```typescript
// FormFieldInputSelectComponent.vue
<template>
  <select v-model="selectedId">
    <option v-for="entity in entities" :key="entity.id" :value="entity.id">
      {{ entity.getDefaultPropertyValue() || entity.id }}
    </option>
  </select>
</template>
```

### 9.2 Con PropertyName

Relación 1:1 - La propiedad especificada en @DefaultProperty debe estar registrada vía @PropertyName:

```typescript
@DefaultProperty('name')  // Marca 'name' como representación textual
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('Name', String)  // REQUERIDO - registra la propiedad
    name!: string;
}
```

### 9.3 Con Relaciones entre Entidades

Cuando una entidad referencia otra vía relación 1:N o N:N, @DefaultProperty permite mostrar la entidad relacionada de forma legible:

```typescript
@DefaultProperty('name')
export class Category extends BaseEntity {
    name!: string;
}

export class Product extends BaseEntity {
    category!: Category;
}

// En UI:
const product = await Product.getElement(1);
console.log(product.category.getDefaultPropertyValue());  // Muestra nombre de categoría
```

### 9.4 Con Búsqueda y Filtros

Los componentes de búsqueda pueden buscar sobre la propiedad marcada como default para filtrado intuitivo.

## 10. Notas de Implementación

### 10.1 Caso Común - Entidad con 'name'

```typescript
@DefaultProperty('name')
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Description', String)
    description!: string;
}

// Uso:
const product = new Product({ id: 1, name: 'Laptop', description: 'Gaming laptop' });
console.log(product.getDefaultPropertyValue());  // 'Laptop'

// En select/dropdown UI muestra "Laptop"
```

### 10.2 Caso Alternativo -title'

```typescript
@DefaultProperty('title')
@ModuleName('Articles')
export class Article extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Title', String)
    title!: string;
    
    @PropertyName('Content', String)
    content!: string;
}

// Uso:
const article = new Article({ id: 1, title: 'Introduction to Vue', content: '...' });
console.log(article.getDefaultPropertyValue());   // 'Introduction to Vue'
```

### 10.3 Sin Decorador - Fallback Behavior

```typescript
// Entidad SIN @DefaultProperty
@ModuleName('Users')
export class User extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Username', String)
    username!: string;
}

// Uso:
const user = new User({ id: 1, username: 'john_doe' });
console.log(user.getDefaultPropertyValue());  // undefined

// El componente UI debe manejar:
const display = user.getDefaultPropertyValue() || user.id || 'Sin nombre';
// display = 1 (usa id como fallback)
```

### 10.4 Propiedad Compuesta - Alternativa

Si necesita combinar múltiples campos, implemente getter custom en lugar de @DefaultProperty:

```typescript
@ModuleName('Users')
export class User extends BaseEntity {
    @PropertyName('First Name', String)
    firstName!: string;
    
    @PropertyName('Last Name', String)
    lastName!: string;
    
    // Custom getter para representación textual
    public getDisplayName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}

// Uso en componentes:
const user = new User({ firstName: 'John', lastName: 'Doe' });
console.log(user.getDisplayName());  // 'John Doe'

// Nota: getDisplayName() es custom, NO getDefaultPropertyValue()
// Si quiere usar getDefaultPropertyValue(), marque una propiedad con @DefaultProperty
```

### 10.5 Caso Real - Categories y Products

```typescript
@DefaultProperty('name')
@ModuleName('Categories')
export class Category extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
}

@DefaultProperty('name')
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Category', Object)
    category!: Category;
}

// En formulario de producto:
<template>
  <div class="product-form">
    <input v-model="product.name" placeholder="Product name" />
    
    <select v-model="product.categoryId">
      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
        {{ cat.getDefaultPropertyValue() }}  <!-- Muestra nombre de categoría -->
      </option>
    </select>
  </div>
</template>

<script>
const categories = await Category.getElementList();
// UI muestra: "Electronics", "Books", "Clothing", etc.
</script>
```

### 10.6 Manejo de Valores Vacíos

```typescript
@DefaultProperty('name')
@ModuleName('Products')
export class Product extends BaseEntity {
    name!: string;
}

// Producto sin nombre:
const product = new Product({ id: 1 });  // name es undefined
console.log(product.getDefaultPropertyValue());  // undefined

// Componente UI debe manejar:
const displayText = product.getDefaultPropertyValue() || 
                    `Product #${product.id}` || 
                    'Unnamed';
// displayText = 'Product #1'
```

## 11. Referencias Cruzadas

**property-name-decorator.md:**  
La propiedad especificada en @DefaultProperty DEBE estar decorada con @PropertyName. Relación 1:1 explicada en sección 9.2.

**module-name-decorator.md:**  
Entidades modulares típicamente usan @DefaultProperty para definir cómo se muestran en UI. Generalmente aplicados juntos.

**primary-property-decorator.md:**  
Diferencia: @PrimaryProperty marca identidad única, @DefaultProperty marca representación legible. Distintos propósitos.

**../02-base-entity/base-entity-core.md:**  
Documenta implementación de getDefaultPropertyValue() método (líneas 232-239 de base_entitiy.ts).

**../04-components/form-field-input-select.md:**  
Componente que usa getDefaultPropertyValue() para renderizar options de select/dropdown.

**03-relations.md (Tutorials):**  
Tutorial que muestra cómo @DefaultProperty mejora visualización de entidades relacionadas en formularios.

**01-basic-crud.md (Tutorials):**  
Tutorial básico donde se aplica @DefaultProperty para mejorar usabilidad de listas y formularios.


        ↓
Decorator function ejecuta en tiempo de clase
        ↓
Verificar si metadata object existe
if (!target[DEFAULT_PROPERTY_METADATA])
        ↓
Crear metadata object si no existe
target[DEFAULT_PROPERTY_METADATA] = {}
        ↓
Almacenar default value en metadata map
target[DEFAULT_PROPERTY_METADATA]['status'] = 'active'
        ↓
Metadata permanece en prototype
Todas las instancias acceden mismo default
```

### Flujo de Constructor (Application de Defaults)

```
Usuario crea nueva instancia
const product = new Product({ name: 'Widget' })
        ↓
Constructor BaseEntity ejecuta
constructor(data?: Partial<T>)
        ↓
PASO 1: Aplicar defaults
this.applyDefaults()
        ↓
applyDefaults() obtiene properties
const properties = this.constructor.getProperties()
properties = ['id', 'name', 'status', 'stock']
        ↓
Iterar cada propiedad
properties.forEach(prop => {...})
        ↓
Para cada prop, verificar si está vacía
if (this[prop] === undefined || this[prop] === null)
        ↓
Propiedad 'id': this.id === undefined
        ↓ (true - está vacía)
Obtener default value
defaultValue = this.getDefaultValue('id')
        ↓
getDefaultValue() busca en metadata
const defaultMetadata = constructor.prototype[DEFAULT_PROPERTY_METADATA]
defaultValue = defaultMetadata['id']  // undefined (sin default)
        ↓
No hay default, siguiente property
        ↓
Propiedad 'name': this.name === undefined
        ↓ (true - está vacía)
defaultValue = this.getDefaultValue('name')  // undefined (sin default)
        ↓
Propiedad 'status': this.status === undefined
        ↓ (true - está vacía)
defaultValue = this.getDefaultValue('status')
defaultValue = 'active'  ← Default encontrado
        ↓
Asignar default a propiedad
this.status = 'active'
        ↓
Propiedad 'stock': this.stock === undefined
        ↓ (true - está vacía)
defaultValue = this.getDefaultValue('stock')
defaultValue = 0
        ↓
Asignar default
this.stock = 0
        ↓
PASO 2: Sobrescribir con data
if (data) Object.assign(this, data)
        ↓
data = { name: 'Widget' }
Object.assign(this, data)
        ↓
this.name = 'Widget'  ← Sobrescribe undefined
this.status = 'active'  ← Mantiene default (no en data)
this.stock = 0  ← Mantiene default (no en data)
        ↓
PASO 3: Inicializar errors
this.errors = {}
        ↓
Instance completa
product.name = 'Widget'
product.status = 'active' (de default)
product.stock = 0 (de default)
```

### Flujo de Function Default (Dynamic)

```
Developer define propiedad con function default
@DefaultProperty(() => new Date())
createdAt!: Date
        ↓
Decorator almacena FUNCTION en metadata
target[DEFAULT_PROPERTY_METADATA]['createdAt'] = () => new Date()
        ↓
Usuario crea nueva instancia
const order = new Order()
        ↓
Constructor ejecuta applyDefaults()
        ↓
applyDefaults() verifica propiedad 'createdAt'
this.createdAt === undefined
        ↓ (true - está vacía)
Obtener default value
defaultValue = this.getDefaultValue('createdAt')
        ↓
getDefaultValue() detecta que es function
if (typeof defaultValue === 'function')
        ↓ (true)
Ejecutar function con this binding
return defaultValue.call(this)
        ↓
Function ejecuta: new Date()
        ↓
Retorna Date object con timestamp actual
return Date {2025-02-10T10:30:00.000Z}
        ↓
Asignar resultado a propiedad
this.createdAt = Date {2025-02-10T10:30:00.000Z}
        ↓
Siguiente instancia ejecuta NUEVA función
const order2 = new Order()
        ↓
Function ejecuta NUEVAMENTE
() => new Date()
        ↓
Retorna NUEVA fecha (diferente timestamp)
return Date {2025-02-10T10:30:05.000Z}
        ↓
Cada instancia tiene valor único
order.createdAt !== order2.createdAt
```

### Flujo de Override (Explicit Value en Constructor)

```
Usuario crea instancia con valor explícito
const product = new Product({ status: 'inactive', name: 'Widget' })
        ↓
Constructor ejecuta applyDefaults()
        ↓
applyDefaults() verifica 'status'
this.status === undefined
        ↓ (true - todavía no asignado)
Asignar default
this.status = 'active'
        ↓
Object.assign(this, data)
data = { status: 'inactive', name: 'Widget' }
        ↓
Sobrescribir con valores de data
this.status = 'inactive'  ← Sobrescribe 'active'
this.name = 'Widget'
        ↓
Valor explícito gana sobre default
product.status = 'inactive' (NO 'active')
```

### Flujo de Function Context (this binding)

```
Developer define computed default
@DefaultProperty(function(this: Product) {
    return this.type === 'digital' ? 9999 : 0;
})
stock!: number
        ↓
Usuario crea instancia con type
const product = new Product({ type: 'digital' })
        ↓
Constructor ejecuta applyDefaults()
        ↓
PERO property 'stock' verificada DESPUÉS de type assigned?
NO - applyDefaults() ejecuta ANTES de Object.assign
        ↓
PROBLEMA: this.type es undefined cuando function ejecuta
        ↓
SOLUCIÓN: Evaluar después de Object.assign manualmente
O usar lifecycle hook afterConstruct si existe
O asegurar orden de evaluación de properties
```

## 6. Reglas Obligatorias

**Regla 1:** SIEMPRE usar function para array/object defaults. `@DefaultProperty(() => [])` NO `@DefaultProperty([])`. Arrays/objects literales causan shared reference cross-instances.

**Regla 2:** Default values DEBEN ser del mismo tipo que propiedad decorada. `@PropertyName('Count', Number) @DefaultProperty('zero')` causa type error.

**Regla 3:** Function defaults NO reciben parámetros. Usar this binding para access a instance properties: `function(this: Entity) { return this.otherProp; }`.

**Regla 4:** applyDefaults() solo asigna a properties undefined o null. Si property ya tiene valor, default NO se aplica (incluye valores falsy como 0, false, '').

**Regla 5:** Explicit values en constructor parameter sobrescriben defaults. `new Product({status:'custom'})` ignora default 'active'.

**Regla 6:** Defaults NO satisfacen @Required validation. Usuario puede clear valor post-construction: `product.status = null` es válido hasta save().

**Regla 7:** Function defaults ejecutan EN CADA instantiation. Evitar operaciones costosas en defaults (DB queries, heavy computation).

**Regla 8:** Arrow functions en defaults NO tienen this binding. Usar regular function: `function(this: Entity) {...}` NO `() => {...}` si this es necesario.

**Regla 9:** getDefaultValue() retorna undefined si NO hay default metadata. Verificar `if (defaultValue !== undefined)` antes de usar.

**Regla 10:** Defaults aplicados en constructor antes de lifecycle hooks. Si hook modifica property, sobreescribe default.

## 7. Prohibiciones

**Prohibido:** Usar array/object literal como default sin function wrapper. `@DefaultProperty([])` causa shared references, SIEMPRE `@DefaultProperty(() => [])`.

**Prohibido:** Asumir que default satisface @Required. DefaultProperty asigna valor inicial, Required valida en save(). Usuario puede clear valor después.

**Prohibido:** Usar arrow functions si necesitas this context. `@DefaultProperty(() => this.id)` devuelve undefined, usar `function(this: Entity) { return this.id; }`.

**Prohibido:** Ejecutar operaciones costosas en function defaults. Function ejecuta EN CADA new constructor, NO cachear resultado.

**Prohibido:** Depender de orden de evaluación de properties en computed defaults. applyDefaults() itera properties en orden arbitrario, this.otherProp puede ser undefined.

**Prohibido:** Modificar metadata en runtime. `target[DEFAULT_PROPERTY_METADATA]['prop'] = newValue` después de decoration time causa inconsistencias.

**Prohibido:** Retornar undefined de function default intencionalmente. getDefaultValue() interpreta undefined como "sin default", NO como "default es undefined".

**Prohibido:** Usar valores mutables compartidos. `const shared = []; @DefaultProperty(shared)` causa mismo problema que literal.

**Prohibido:** Asumir que default se re-aplica después de clear valor. applyDefaults() ejecuta solo en constructor, NO en save() ni después de modificaciones.

**Prohibido:** Usar defaults como validation. DefaultProperty es inicialización, Validation es verificación. Separar concerns claramente.

## 8. Dependencias

**Decoradores Relacionados:**
- @PropertyName: Define tipo de propiedad, default debe coincidir con tipo
- @Required: Valida presencia en save(), complementario a DefaultProperty que asigna valor inicial
- @PrimaryProperty: Puede usar DefaultProperty para auto-generated IDs (UUID, autoincrement simulado)
- @Validation: Ejecuta DESPUÉS de defaults aplicados, valida valor default si existe

**BaseEntity Methods:**
- constructor(): Invoca applyDefaults() como primer paso
- applyDefaults(): Método que itera properties y asigna defaults
- getDefaultValue(): Accessor que obtiene default value para propiedad específica
- getProperties(): Retorna array de property keys para iterar en applyDefaults()

**BaseEntity Prototype:**
- DEFAULT_PROPERTY_METADATA: Symbol key donde metadata map es almacenada
- Prototype chain: Subclases heredan defaults de parent classes (si parent también usa decorator)

**Constructor Data Parameter:**
- Object.assign(this, data): Sobrescribe defaults con valores explícitos del caller
- Precedencia: Explicit values > Default values > undefined

**Type System:**
- PropertyName type parameter: Default value debe ser compatible con tipo declarado
- TypeScript validation: Type mismatch causa compile-time error si strict mode

## 9. Relaciones

**Relación con @Required (Complementaria):**
DefaultProperty proporciona valor inicial válido que puede satisfacer Required en momento de construction, pero NO previene clear posterior. Required valida EN save(), DefaultProperty asigna EN construction.

**Relación con @PropertyName (1:1):**
Cada @DefaultProperty debe estar en propiedad decorada con @PropertyName. Type declarado en PropertyName debe coincidir con tipo de default value.

**Relación con constructor (N:1):**
Múltiples properties con defaults, todos aplicados en único constructor invocation mediante single applyDefaults() call.

**Relación con applyDefaults() (1:N):**
Un applyDefaults() call aplica defaults de múltiples properties iterando sobre getProperties() result.

**Relación con Object.assign (Secuencial):**
applyDefaults() ejecuta PRIMERO, Object.assign SEGUNDO. Defaults asignados por applyDefaults() pueden ser sobrescritos por Object.assign(data).

**Relación con @PrimaryProperty (Opcional):**
PrimaryProperty puede usar DefaultProperty para auto-generated IDs: `@PrimaryProperty() @DefaultProperty(() => uuidv4()) id!: string`.

**Relación con Validation decorators (Temporal):**
Defaults aplicados ANTES de constructor complete, validaciones ejecutan DESPUÉS en save(). Valor default puede ser validado o fallar validation si no cumple reglas.

**Relación con getProperties() (Dependency):**
applyDefaults() depende de getProperties() para obtener lista de properties a verificar. Si property NO está en getProperties(), default NO se aplica.

## 10. Notas de Implementación

### Ejemplo 1: UUID Auto-Generation

```typescript
import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from '@/entities/base_entitiy';
import { PropertyName, PrimaryProperty, DefaultProperty } from '@/decorations';

export class User extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('User ID', String)
    @DefaultProperty(() => uuidv4())  // ← UUID único por instancia
    id!: string;
    
    @PropertyName('Username', String)
    @Required()
    username!: string;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())
    createdAt!: Date;
}

// Uso:
const user1 = new User({ username: 'john_doe' });
console.log(user1.id);  // '550e8400-e29b-41d4-a716-446655440000'

const user2 = new User({ username: 'jane_doe' });
console.log(user2.id);  // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' (diferente)

await user1.save();  // POST /api/users con ID pre-generado
```

### Ejemplo 2: Enum Defaults

```typescript
enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

enum Priority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high'
}

export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id?: number;
    
    @PropertyName('Status', String)
    @DefaultProperty(OrderStatus.PENDING)  // ← Enum default
    status!: OrderStatus;
    
    @PropertyName('Priority', String)
    @DefaultProperty(Priority.NORMAL)  // ← Enum default
    priority!: Priority;
}

// Uso:
const order = new Order();
console.log(order.status);    // 'pending'
console.log(order.priority);  // 'normal'

// Override:
const urgentOrder = new Order({ priority: Priority.HIGH });
console.log(urgentOrder.priority);  // 'high'
```

### Ejemplo 3: Computed Defaults (Context-Aware)

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice Number', String)
    @DefaultProperty(function(this: Invoice) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000);
        return `INV-${year}${month}-${random}`;
    })
    invoiceNumber!: string;
    
    @PropertyName('Issue Date', Date)
    @DefaultProperty(() => new Date())
    issueDate!: Date;
    
    @PropertyName('Due Date', Date)
    @DefaultProperty(function() {
        // Due date: 30 días desde hoy
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        return dueDate;
    })
    dueDate!: Date;
    
    @PropertyName('Status', String)
    @DefaultProperty('draft')
    status!: string;
}

// Uso:
const invoice = new Invoice();
console.log(invoice.invoiceNumber);  // 'INV-202502-4567'
console.log(invoice.issueDate);      // 2025-02-10T10:30:00.000Z
console.log(invoice.dueDate);        // 2025-03-12T10:30:00.000Z (30 días después)
console.log(invoice.status);         // 'draft'
```

### Ejemplo 4: Array/Object Defaults (Correct Pattern)

```typescript
interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export class Customer extends BaseEntity {
    @PropertyName('Customer ID', Number)
    id?: number;
    
    @PropertyName('Full Name', String)
    @Required()
    fullName!: string;
    
    @PropertyName('Tags', Array)
    @DefaultProperty(() => [])  // ← Function wrapper para array    tags!: string[];
    
    @PropertyName('Billing Address', Object)
    @DefaultProperty((): Address => ({  // ← Function wrapper para object
        street: '',
        city: '',
        state: '',
        zipCode: ''
    }))
    billingAddress!: Address;
    
    @PropertyName('Preferences', Object)
    @DefaultProperty(() => ({
        newsletter: true,
        notifications: true,
        theme: 'light'
    }))
    preferences!: Record<string, any>;
}

// Uso correcto:
const customer1 = new Customer({ fullName: 'John Doe' });
const customer2 = new Customer({ fullName: 'Jane Doe' });

customer1.tags.push('vip');
console.log(customer1.tags);  // ['vip']
console.log(customer2.tags);  // [] ← Independiente

customer1.billingAddress.city = 'New York';
console.log(customer2.billingAddress.city);  // '' ← Independiente
```

### Ejemplo 5: Timestamp Defaults con Usuario Actual

```typescript
import { Application } from '@/types/application';

export class AuditLog extends BaseEntity {
    @PropertyName('Log ID', Number)
    id?: number;
    
    @PropertyName('Action', String)
    @Required()
    action!: string;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())
    createdAt!: Date;
    
    @PropertyName('Updated At', Date)
    @DefaultProperty(() => new Date())
    updatedAt!: Date;
    
    @PropertyName('Created By', String)
    @DefaultProperty(() => {
        // Obtener usuario actual de Application singleton
        return Application.currentUser?.username || 'system';
    })
    createdBy!: string;
}

// Uso:
const log = new AuditLog({ action: 'user.login' });
console.log(log.createdBy);  // 'john_doe' (usuario autenticado actual)
console.log(log.createdAt);  // 2025-02-10T10:30:00.000Z
```

### Ejemplo 6: Orden de Aplicación y Override

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id?: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Status', String)
    @DefaultProperty('draft')
    status!: string;
    
    @PropertyName('Stock', Number)
    @DefaultProperty(0)
    stock!: number;
    
    @PropertyName('Created At', Date)
    @DefaultProperty(() => new Date())
    createdAt!: Date;
}

// CASO 1: Sin data - Todos los defaults aplicados
const product1 = new Product();
console.log(product1.status);     // 'draft' (default)
console.log(product1.stock);      // 0 (default)
console.log(product1.createdAt);  // Date actual (default)

// CASO 2: Override parcial - Algunos defaults, algunos explícitos
const product2 = new Product({ 
    name: 'Laptop',
    status: 'active'  // ← Sobrescribe default 'draft'
});
console.log(product2.status);     // 'active' (explícito gana)
console.log(product2.stock);      // 0 (default mantiene)
console.log(product2.createdAt);  // Date actual (default mantiene)

// CASO 3: Override completo - Todos explícitos
const product3 = new Product({
    name: 'Mouse',
    status: 'inactive',
    stock: 100,
    createdAt: new Date('2020-01-01')
});
console.log(product3.status);     // 'inactive' (explícito)
console.log(product3.stock);      // 100 (explícito)
console.log(product3.createdAt);  // 2020-01-01 (explícito)

// CASO 4: Clear valor después de construction
const product4 = new Product();
console.log(product4.status);  // 'draft' (default)
product4.status = '';  // ← Usuario clear valor
console.log(product4.status);  // '' (default NO se re-aplica)
```

### Consideración 1: Shared Reference Problem (CRITICAL)

```typescript
// PROBLEMA CRÍTICO: Arrays/Objects Literales

// INCORRECTO ❌
export class ShoppingCart extends BaseEntity {
    @DefaultProperty([])  // ← Literal array sin function
    items!: any[];
    
    @DefaultProperty({})  // ← Literal object sin function
    metadata!: Record<string, any>;
}

const cart1 = new ShoppingCart();
const cart2 = new ShoppingCart();

cart1.items.push('item1');
console.log(cart1.items);  // ['item1']
console.log(cart2.items);  // ['item1'] ← BUG: Compartido entre instancias!

cart1.metadata.userId = 'user-123';
console.log(cart1.metadata);  // {userId: 'user-123'}
console.log(cart2.metadata);  // {userId: 'user-123'} ← BUG: Compartido!

// CORRECTO ✅
export class ShoppingCart extends BaseEntity {
    @DefaultProperty(() => [])  // ← Function retorna nuevo array
    items!: any[];
    
    @DefaultProperty(() => ({}))  // ← Function retorna nuevo object
    metadata!: Record<string, any>;
}

const cart3 = new ShoppingCart();
const cart4 = new ShoppingCart();

cart3.items.push('item1');
console.log(cart3.items);  // ['item1']
console.log(cart4.items);  // [] ← Correcto: Independiente

cart3.metadata.userId = 'user-123';
console.log(cart3.metadata);  // {userId: 'user-123'}
console.log(cart4.metadata);  // {} ← Correcto: Independiente
```

### Consideración 2: Defaults NO Satisfacen @Required

```typescript
export class Product extends BaseEntity {
    @PropertyName('Status', String)
    @Required()  // ← Valida en save()
    @DefaultProperty('active')  // ← Asigna en constructor
    status!: string;
}

// Constructor asigna default correctamente
const product = new Product();
console.log(product.status);  // 'active' ← Default aplicado

// Usuario puede clear valor después
product.status = '';  // ← Permitido (aún no valida)

// Validación ejecuta en save()
await product.save();
// ERROR: ValidationError: 'Status' is required
// ← @Required detecta que status está vacío

// DefaultProperty solo asigna valor INICIAL
// NO previene modificación posterior
// Required valida ANTES de persistir
```

### Consideración 3: Function Context y this Binding

```typescript
export class Product extends BaseEntity {
    @PropertyName('Type', String)
    type!: 'physical' | 'digital';
    
    // INCORRECTO ❌: Arrow function NO tiene this binding
    @DefaultProperty(() => {
        // this === undefined aquí
        return this.type === 'digital' ? 9999 : 0;  // ← ERROR
    })
    stock1!: number;
    
    // CORRECTO ✅: Regular function tiene this binding
    @DefaultProperty(function(this: Product) {
        // this refiere a instancia Product
        return this.type === 'digital' ? 9999 : 0;  // ← OK
    })
    stock2!: number;
}

// Uso:
const physical = new Product({ type: 'physical' });
console.log(physical.stock1);  // NaN o error (this.type undefined)
console.log(physical.stock2);  // 0 (funcionó correctamente)

const digital = new Product({ type: 'digital' });
console.log(digital.stock2);   // 9999 (funcionó correctamente)
```

### Consideración 4: Orden de Ejecución en Constructor

```typescript
// BaseEntity constructor sequence:
constructor(data?: Partial<T>) {
    // PASO 1: Aplicar defaults
    this.applyDefaults();
    // En este punto: this.status = 'active' (default)
    
    // PASO 2: Sobrescribir con data
    if (data) {
        Object.assign(this, data);
    }
    // Si data.status existe: this.status = data.status (override)
    
    // PASO 3: Inicializar errors
    this.errors = {};
}

// Implicación: Defaults aplicados PRIMERO, data parameter gana SIEMPRE

const product1 = new Product();
// Resultado: status = 'active' (default, sin data)

const product2 = new Product({ status: 'custom' });
// Flujo interno:
// 1. applyDefaults() → this.status = 'active'
// 2. Object.assign() → this.status = 'custom' (sobrescribe)
// Resultado: status = 'custom'
```

### Pattern: Computed Defaults que Dependen de Otras Properties

```typescript
// PROBLEMA: Order indeterminístico de properties en applyDefaults()
export class Product extends BaseEntity {
    @PropertyName('Type', String)
    @DefaultProperty('physical')
    type!: 'physical' | 'digital';
    
    @PropertyName('Stock', Number)
    @DefaultProperty(function(this: Product) {
        // RIESGO: this.type puede ser undefined si 'stock' evalúa primero que 'type'
        return this.type === 'digital' ? 9999 : 0;
    })
    stock!: number;
}

// SOLUCIÓN 1: Pasar valor en constructor explícitamente
const physical = new Product({ type: 'physical', stock: 0 });

// SOLUCIÓN 2: Usar lifecycle hook afterConstruct (si existe)
// O evaluar en getter en lugar de default

// SOLUCIÓN 3: Proveer valor sensato que funcione sin context
@DefaultProperty(0)  // ← Default simple que funciona siempre
stock!: number;

// Luego calcular en método de instancia si necesario
public calculateDefaultStock(): number {
    return this.type === 'digital' ? 9999 : 0;
}
```

### Pattern: Auto-Generated Sequential IDs (Simulación)

```typescript
// Pattern para IDs secuenciales client-side (NO recomendado para producción)
let productIdCounter = 1;

export class Product extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Product ID', Number)
    @DefaultProperty(() => productIdCounter++)  // ← Incrementar global counter
    id?: number;
    
    @PropertyName('Product Name', String)
    name!: string;
}

// Uso:
const product1 = new Product({ name: 'Widget' });
console.log(product1.id);  // 1

const product2 = new Product({ name: 'Gadget' });
console.log(product2.id);  // 2

const product3 = new Product({ name: 'Tool' });
console.log(product3.id);  // 3

// ADVERTENCIA: IDs client-side pueden colisionar con IDs server-side
// Preferir UUID o dejar que backend genere IDs
```

### Pattern: Conditional Defaults Basados en Ambiente

```typescript
export class Feature extends BaseEntity {
    @PropertyName('Feature ID', String)
    id?: string;
    
    @PropertyName('Is Enabled', Boolean)
    @DefaultProperty(() => {
        // Habilitar features solo en development
        return process.env.NODE_ENV === 'development';
    })
    isEnabled!: boolean;
    
    @PropertyName('Debug Mode', Boolean)
    @DefaultProperty(() => {
        return process.env.NODE_ENV !== 'production';
    })
    debugMode!: boolean;
}

// En development:
const feature = new Feature();
console.log(feature.isEnabled);  // true
console.log(feature.debugMode);  // true

// En production:
console.log(feature.isEnabled);  // false
console.log(feature.debugMode);  // false
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- required-decorator.md: @Required valida en save(), @DefaultProperty asigna en construction - Complementarios
- validation-decorator.md: Validaciones ejecutan DESPUÉS de defaults aplicados
- primary-property-decorator.md: @PrimaryProperty puede combinar con @DefaultProperty para auto-generated IDs
- property-name-decorator.md: Tipo declarado en @PropertyName debe coincidir con tipo de default value
- persistent-decorator.md: Defaults aplicados ANTES de persistencia inicial
- ../02-base-entity/base-entity-core.md: Constructor invoca applyDefaults(), implementación de getDefaultValue()
- ../02-base-entity/validation-system.md: Validaciones ejecutan post-construction en save()
- ../../02-FLOW-ARCHITECTURE.md: Flujo Entity construction → Defaults → Data assignment → Validation

**Archivos fuente:**
- src/decorations/default_property_decorator.ts: Implementación del decorator (línea 5-30), Symbol DEFAULT_PROPERTY_METADATA
- src/entities/base_entitiy.ts: Constructor (línea 50-65), applyDefaults() método (línea 1680-1710), getDefaultValue() estático e instancia (línea 1630-1680)

**Líneas relevantes en código:**
- Línea 5 (default_property_decorator.ts): Definición de DEFAULT_PROPERTY_METADATA Symbol
- Línea 10 (default_property_decorator.ts): Función DefaultProperty que almacena metadata
- Línea 50 (base_entitiy.ts): Constructor que invoca applyDefaults() como primer paso
- Línea 1680 (base_entitiy.ts): applyDefaults() itera properties y asigna defaults
- Línea 1630 (base_entitiy.ts): getDefaultValue() accessor que maneja static values y functions

**Última actualización:** 11 de Febrero, 2026