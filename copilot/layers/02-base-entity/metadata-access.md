# BaseEntity: Metadata Access System

## 1. Propósito

El sistema de acceso a metadatos provee 46 métodos para leer información almacenada por decoradores en prototipos de clases. Constituye la base del sistema meta-programático del framework, permitiendo que componentes UI se auto-configuren leyendo metadatos en tiempo de ejecución. El flujo es: decoradores escriben metadatos en prototype → métodos de acceso leen metadatos → componentes renderizan basándose en esos metadatos. Los métodos se agrupan en 6 categorías: Propiedades (información sobre campos), Tipos (tipos de datos), Módulo (configuración módulo), Validación (reglas validación), UI (configuración interfaz), y API (configuración persistencia). Todos los métodos son inmutables (solo lectura), thread-safe (acceso concurrente seguro), y performantes (lookup O(1) en prototype).

## 2. Alcance

**Responsabilidades cubiertas:**
- Métodos de Propiedades (10): getAllPropertiesNonFilter, getProperties, getKeys, getArrayKeys, getTabOrders, getArrayKeysOrdered, getFormattedValue, getPropertyIndices, getCSSClasses, getPropertyName/ByKey
- Métodos de Tipos (5): getPropertyTypes, getPropertyType (static/instance), getArrayPropertyType (static/instance)
- Métodos de Módulo (7): getModuleName, getModulePermission, getModuleIcon, getModuleListComponent, getModuleDetailComponent, getModuleDefaultComponent, getCustomComponents
- Métodos de Validación (9): isRequired, requiredMessage, isValidation, validationMessage, isAsyncValidation, asyncValidationMessage, isDisabled, isReadOnly, getHelpText
- Métodos de UI (10): getViewGroups, getViewGroupRows, getStringType, getDisplayFormat, getFormattedValue, getHelpText, getTabOrders, isHideInDetailView, isHideInListView, getMask
- Métodos de API (6): getApiEndpoint, getApiMethods, isApiMethodAllowed (static/instance para cada uno)

**Límites del alcance:**
- No modifican metadatos (solo lectura, inmutable después de decoración)
- No validan consistencia de metadatos (asumen decoradores bien aplicados)
- No cachean resultados (cada llamada hace lookup fresco en prototype)
- No proveen fallback defaults (retornan undefined si metadata no existe)
- No hacen transformación de datos (retornan valores exactos almacenados)
- No implementan queries complejas (solo acceso directo por propertyKey)

## 3. Definiciones Clave

**Metadata Keys:** Constantes symbol o string usadas como claves en prototype para almacenar metadatos. Ejemplos: PROPERTY_NAME_KEY, PROPERTY_TYPE_KEY, REQUIRED_KEY. Cada decorador escribe en su key específico.

**Prototype Lookup:** Patrón de acceso donde método lee `(this.constructor as any).prototype[METADATA_KEY]` para obtener objeto con metadatos. JavaScript permite agregar propiedades arbitrarias a prototype.

**Static vs Instance:** Métodos static reciben propertyKey como parámetro y operan sobre `this.prototype`. Métodos instance usan `this.constructor.prototype` para acceder a metadatos de la clase actual. Ambos retornan los mismos datos.

**getAllPropertiesNonFilter():** Retorna Record<string, string> con todas las propiedades que tienen @PropertyName, incluyendo arrays. Usado internamente para iteración completa sin filtros.

**getProperties():** Retorna Record<string, string> con propiedades @PropertyName excluyendo arrays. Es versión filtrada de getAllPropertiesNonFilter. Usado para renderizar fields no-array.

**getKeys():** Retorna string[] con claves de propiedades no-array ordenadas por @PropertyIndex. Orden determinístico para renderizado de formularios. Arrays excluidos porque tienen renderizado separado.

**getArrayKeys():** Retorna string[] con claves de propiedades tipo Array. Sin orden específico. Complementario a getKeys() para obtener propiedades array.

**getArrayKeysOrdered():** Retorna string[] con claves array ordenadas por @TabOrder. Usado para renderizar tabs de arrays en orden correcto en DetailView.

**getPropertyTypes():** Retorna Record<string, Constructor> mapeando propertyKey a su Constructor (Number, String, Boolean, Date, Array, EntityClass). Usado para type checking y rendering logic.

**getArrayPropertyType(key):** Para propertyKey de tipo Array, retorna clase BaseEntity del elemento (ejemplo: Tag para tags: Tag[]). Retorna undefined si no es array o no tiene @ArrayOf.

**getViewGroups():** Retorna Record<string, string> mapeando propertyKey a nombre de grupo visual. Usado por FormGroupComponent para agrupar campos relacionados en UI.

**getDisplayFormat(key):** Retorna string template (ejemplo: `${value} USD`) o función formatter para propiedad. Usado por getFormattedValue() para formatear valores en UI.

**isApiMethodAllowed(method):** Valida si método HTTP (GET, POST, PUT, DELETE) está permitido en @ApiMethods de la entidad. Retorna boolean. Usado en save/update/delete para validar antes de request.

## 4. Descripción Técnica

### Arquitectura de Prototype Metadata Storage

Todos los decoradores escriben metadatos en el prototype de la clase usando claves específicas. Los métodos de acceso implementan lookup pattern consistente:

```typescript
// Pattern básico para todos los métodos
public static getMetadata(): Record<string, any> {
    const proto = this.prototype as any;
    return proto[METADATA_KEY] || {};  // Retorna {} si no existe
}
```

Este patrón garantiza:
- O(1) lookup performance (acceso directo a property)
- Thread-safety (solo lectura, prototype inmutable)
- Herencia correcta (JavaScript prototype chain)

### Categoría 1: Métodos de Propiedades

#### getAllPropertiesNonFilter() - Static

```typescript
public static getAllPropertiesNonFilter(): Record<string, string>
```

Retorna todas las propiedades con @PropertyName, incluyendo arrays.

**Ubicación:** Línea 127

**Implementación:**

```typescript
public static getAllPropertiesNonFilter(): Record<string, string> {
    const proto = this.prototype as any;
    return proto[PROPERTY_NAME_KEY] || {};
}
```

**Retorna:**
```typescript
{
    'id': 'ID',
    'name': 'Product Name',
    'tags': 'Tags',  // Array INCLUIDO
    'price': 'Price'
}
```

#### getProperties() - Static

```typescript
public static getProperties(): Record<string, string>
```

Retorna propiedades con @PropertyName excluyendo arrays.

**Ubicación:** Línea 132

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

**Retorna:**
```typescript
{
    'id': 'ID',
    'name': 'Product Name',
    'price': 'Price'
    // 'tags' EXCLUIDO (es Array)
}
```

#### getKeys() - Instance

```typescript
public getKeys(): string[]
```

Retorna array de propertyKeys no-array ordenadas por @PropertyIndex.

**Ubicación:** Línea 147

**Implementación:**

```typescript
public getKeys(): string[] {
    const properties = (this.constructor as typeof BaseEntity).getProperties();
    const indices = this.getPropertyIndices();
    
    const keys = Object.keys(properties);
    
    // Ordenar por PropertyIndex
    return keys.sort((a, b) => {
        const indexA = indices[a] ?? Number.MAX_SAFE_INTEGER;
        const indexB = indices[b] ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
    });
}
```

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyIndex(2)
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyIndex(3)
    @PropertyName('Price', Number)
    price!: number;
}

const product = new Product({});
console.log(product.getKeys());
// ['id', 'name', 'price'] (ordenado por PropertyIndex)
```

**Uso en vistas:**

```vue
<template>
    <!-- Renderizar todos los campos en orden -->
    <div v-for="key in entity.getKeys()" :key="key">
        <DynamicInputComponent
            :entity="entity"
            :property-key="key"
            v-model="entity[key]"
        />
    </div>
</template>
```

#### getArrayKeys() - Instance

```typescript
public getArrayKeys(): string[]
```

Retorna array de propertyKeys que son tipo Array. Sin orden específico.

**Ubicación:** Línea 159

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Tags', Array)
    @ArrayOf(Tag)
    tags!: Tag[];
    
    @PropertyName('Images', Array)
   @ArrayOf(String)
    images!: string[];
}

const product = new Product({});
console.log(product.getArrayKeys());
// ['tags', 'images']
```

#### getArrayKeysOrdered() - Instance

```typescript
public getArrayKeysOrdered(): string[]
```

Retorna propertyKeys de tipo Array ordenadas por @TabOrder.

**Ubicación:** Línea 404

**Implementación:**

```typescript
public getArrayKeysOrdered(): string[] {
    const arrayKeys = this.getArrayKeys();
    const tabOrders = this.getTabOrders();
    
    return arrayKeys.sort((a, b) => {
        const orderA = tabOrders[a] ?? Number.MAX_SAFE_INTEGER;
        const orderB = tabOrders[b] ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });
}
```

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Images', Array)
    @TabOrder(2)
    images!: string[];
    
    @PropertyName('Reviews', Array)
    @TabOrder(1)
    reviews!: Review[];
    
    @PropertyName('Variants', Array)
    @TabOrder(3)
    variants!: ProductVariant[];
}

const product = new Product({});
console.log(product.getArrayKeysOrdered());
// ['reviews', 'images', 'variants'] (ordenado por TabOrder)
```

**Uso en DetailView:**

```vue
<template>
    <TabControllerComponent :tabs="getArrayListsTabs()">
        <TabComponent v-for="tab in entity.getArrayKeysOrdered()">
            <ArrayInputComponent 
                :entity="entity"
                :property-key="tab"
                v-model="entity[tab]" 
            />
        </TabComponent>
    </TabControllerComponent>
</template>
```

#### getPropertyIndices() - Instance

```typescript
public getPropertyIndices(): Record<string, number>
```

Retorna mapeo propertyKey → @PropertyIndex.

**Ubicación:** Línea 385

**Retorna:**
```typescript
{
    'id': 1,
    'name': 2,
    'price': 3
}
```

#### getCSSClasses() - Instance

```typescript
public getCSSClasses(): Record<string, string>
```

Retorna mapeo propertyKey → clase CSS definida en @CssColumnClass.

**Ubicación:** Línea 393

**Ejemplo:**

```typescript
@CssColumnClass('col-md-6')
name!: string;

@CssColumnClass('col-md-3')
price!: number;

entity.getCSSClasses();
// { name: 'col-md-6', price: 'col-md-3' }
```

#### getPropertyName() - Static

```typescript
public static getPropertyName(): string | undefined
```

Retorna el property name del campo marcado con @DefaultProperty.

**Ubicación:** Línea 216

**Ejemplo:**

```typescript
@DefaultProperty('name')
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;
}

Product.getPropertyName(); // 'name'
```

#### getPropertyNameByKey() - Static

```typescript
public static getPropertyNameByKey(key: string): string
```

Retorna el nombre legible (display name) de una propiedad por su key.

**Ubicación:** Línea 220

**Ejemplo:**

```typescript
@PropertyName('Product Name', String)
name!: string;

Product.getPropertyNameByKey('name'); // 'Product Name'
```

### Categoría 2: Métodos de Tipos

#### getPropertyTypes() - Static

```typescript
public static getPropertyTypes(): Record<string, Constructor>
```

Retorna mapeo propertyKey → Constructor (Number, String, Boolean, Date, Array, EntityClass).

**Ubicación:** Línea 184

**Retorna:**
```typescript
{
    'id': Number,
    'name': String,
    'price': Number,
    'createdAt': Date,
    'tags': Array,
    'category': Category  // EntityClass
}
```

#### getPropertyType() - Static

```typescript
public static getPropertyType(propertyKey: string): Constructor | undefined
```

Retorna el Constructor de una propiedad específica.

**Ubicación:** Línea 188

**Ejemplo:**

```typescript
Product.getPropertyType('price'); // Number
Product.getPropertyType('name'); // String
Product.getPropertyType('tags'); // Array
```

#### getPropertyType() - Instance

```typescript
public getPropertyType(propertyKey: string): Constructor | undefined
```

Versión de instancia. Delega a versión static.

**Ubicación:** Línea 192

#### getArrayPropertyType() - Static

```typescript
public static getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined
```

Para propiedad tipo Array, retorna la clase del elemento (definida en @ArrayOf).

**Ubicación:** Línea 161

**Ejemplo:**

```typescript
@PropertyName('Tags', Array)
@ArrayOf(Tag)
tags!: Tag[];

Product.getArrayPropertyType('tags'); // Tag (la clase)
Product.getArrayPropertyType('name'); // undefined (no es array)
```

#### getArrayPropertyType() - Instance

```typescript
public getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined
```

Versión de instancia.

**Ubicación:** Línea 179

### Categoría 3: Métodos de Módulo

#### getModuleName() - Static

```typescript
public static getModuleName(): string | undefined
```

Retorna nombre del módulo definido en @ModuleName.

**Ubicación:** Línea 204

**Ejemplo:**

```typescript
@ModuleName('Products')
export class Product extends BaseEntity {}

Product.getModuleName(); // 'Products'
```

#### getModulePermission() - Static

```typescript
public static getModulePermission(): string | undefined
```

Retorna permiso requerido definido en @ModulePermission.

**Ubicación:** Línea 208

**Ejemplo:**

```typescript
@ModulePermission('admin.products')
export class Product extends BaseEntity {}

Product.getModulePermission(); // 'admin.products'
```

#### getModuleIcon() - Static

```typescript
public static getModuleIcon(): string | undefined
```

Retorna icono del módulo definido en @ModuleIcon.

**Ubicación:** Línea 212

**Ejemplo:**

```typescript
@ModuleIcon(ICONS.BOX)
export class Product extends BaseEntity {}

Product.getModuleIcon(); // 'mdi-box'
```

#### getModuleListComponent() - Static

```typescript
public static getModuleListComponent(): Component
```

Retorna componente Vue custom para vista de lista (definido en @ModuleListComponent) o default_listview si no existe.

**Ubicación:** Línea 224

#### getModuleDetailComponent() - Static

```typescript
public static getModuleDetailComponent(): Component
```

Retorna componente Vue custom para vista de detalle (definido en @ModuleDetailComponent) o default_detailview si no existe.

**Ubicación:** Línea 232

#### getModuleDefaultComponent() - Static

```typescript
public static getModuleDefaultComponent(): Component
```

Retorna componente Vue definido en @ModuleDefaultComponent para determinar si vista inicial es List o Detail.

**Ubicación:** Línea 240

#### getCustomComponents() - Static

```typescript
public static getCustomComponents(): Record<string, Component>
```

Retorna mapeo de componentes custom definidos en @ModuleCustomComponents.

**Ubicación:** Línea 248

**Ejemplo:**

```typescript
@ModuleCustomComponents({
    'reports': ReportsView,
    'analytics': AnalyticsView
})
export class Product extends BaseEntity {}

Product.getCustomComponents();
// { reports: ReportsView, analytics: AnalyticsView }
```

### Categoría 4: Métodos de Validación

#### isRequired() - Instance

```typescript
public isRequired(propertyKey: string): boolean
```

Retorna true si propiedad tiene @Required(true).

**Ubicación:** Línea 275

**Ejemplo:**

```typescript
@Required(true)
name!: string;

entity.isRequired('name'); // true
```

#### requiredMessage() - Instance

```typescript
public requiredMessage(propertyKey: string): string
```

Retorna mensaje de error para campo requerido.

**Ubicación:** Línea 285

**Ejemplo:**

```typescript
entity.requiredMessage('name'); // "Name is required"
```

#### isValidation() - Instance

```typescript
public isValidation(propertyKey: string): boolean
```

Ejecuta función de validación síncrona definida en @Validation.

**Ubicación:** Línea 360

#### validationMessage() - Instance

```typescript
public validationMessage(propertyKey: string): string
```

Retorna mensaje de error de validación síncrona.

**Ubicación:** Línea 375

#### isAsyncValidation() - Instance

```typescript
public isAsyncValidation(propertyKey: string): Promise<boolean>
```

Ejecuta función de validación asíncrona definida en @AsyncValidation.

**Ubicación:** Línea 395

#### asyncValidationMessage() - Instance

```typescript
public asyncValidationMessage(propertyKey: string): string
```

Retorna mensaje de error de validación asíncrona.

**Ubicación:** Línea 410

#### isDisabled() - Instance

```typescript
public isDisabled(propertyKey: string): boolean
```

Retorna true si propiedad tiene @Disabled(true).

**Ubicación:** Línea 289

#### isReadOnly() - Instance

```typescript
public isReadOnly(propertyKey: string): boolean
```

Retorna true si propiedad tiene @ReadOnly(true).

**Ubicación:** Línea 297

#### getHelpText() - Instance

```typescript
public getHelpText(propertyKey: string): string | undefined
```

Retorna texto de ayuda definido en @HelpText.

**Ubicación:** Línea 345

**Ejemplo:**

```typescript
@HelpText('Enter product name (max 100 chars)')
name!: string;

entity.getHelpText('name');
// 'Enter product name (max 100 chars)'
```

### Categoría 5: Métodos de UI

#### getViewGroups() - Instance

```typescript
public getViewGroups(): Record<string, string>
```

Retorna mapeo propertyKey → nombre de grupo visual (definido en @ViewGroup).

**Ubicación:** Línea 273

**Retorna:**
```typescript
{
    'name': 'Basic Info',
    'price': 'Basic Info',
    'description': 'Details'
}
```

#### getViewGroupRows() - Instance

```typescript
public getViewGroupRows(): Record<string, ViewGroupRow>
```

Retorna mapeo propertyKey → configuración de fila (definido en @ViewGroupRowDecorator).

**Ubicación:** Línea 281

**Retorna:**
```typescript
{
    'name': ViewGroupRow.TWO_ITEMS,
    'price': ViewGroupRow.TWO_ITEMS,
    'description': ViewGroupRow.FULL_WIDTH
}
```

#### getStringType() - Instance

```typescript
public getStringType(): Record<string, StringType>
```

Retorna mapeo propertyKey → StringType para propiedades string (definido en @StringTypeDef).

**Ubicación:** Línea 261

**Retorna:**
```typescript
{
    'name': StringType.TEXT,
    'email': StringType.EMAIL,
    'password': StringType.PASSWORD,
    'description': StringType.TEXTAREA
}
```

#### getDisplayFormat() - Instance

```typescript
public getDisplayFormat(propertyKey: string): DisplayFormatValue | undefined
```

Retorna formato de display definido en @DisplayFormat (string template o función formatter).

**Ubicación:** Línea 352

**Ejemplo:**

```typescript
@DisplayFormat('${value} USD')
price!: number;

entity.getDisplayFormat('price'); // '${value} USD'
```

#### getFormattedValue() - Instance

```typescript
public getFormattedValue(propertyKey: string): string
```

Retorna valor de propiedad aplicando su @DisplayFormat.

**Ubicación:** Línea 377

**Implementación:**

```typescript
public getFormattedValue(propertyKey: string): string {
    const value = (this as any)[propertyKey];
    const format = this.getDisplayFormat(propertyKey);
    
    if (!format) {
        return value?.toString() ?? '';
    }
    
    if (typeof format === 'function') {
        return format(value, this);
    }
    
    // String template: '${value} USD'
    return format.replace('${value}', value?.toString() ?? '');
}
```

**Ejemplo:**

```typescript
@DisplayFormat('${value} USD')
price!: number;

entity.price = 99.99;
entity.getFormattedValue('price'); // '99.99 USD'
```

#### getMask() - Instance

```typescript
public getMask(propertyKey: string): string | undefined
```

Retorna máscara de input definida en @Mask.

**Ubicación:** Línea 340

**Ejemplo:**

```typescript
@Mask('(###) ###-####')
phone!: string;

entity.getMask('phone'); // '(###) ###-####'
```

#### getTabOrders() - Instance

```typescript
public getTabOrders(): Record<string, number>
```

Retorna mapeo propertyKey → orden de tab (definido en @TabOrder).

**Ubicación:** Línea 399

**Retorna:**
```typescript
{
    'items': 1,
    'payments': 3,
    'shipments': 2
}
```

#### isHideInDetailView() - Instance

```typescript
public isHideInDetailView(propertyKey: string): boolean
```

Retorna true si propiedad tiene @HideInDetailView().

**Ubicación:** Línea 305

#### isHideInListView() - Instance

```typescript
public isHideInListView(propertyKey: string): boolean
```

Retorna true si propiedad tiene @HideInListView().

**Ubicación:** Línea 313

### Categoría 6: Métodos de API

#### getApiEndpoint() - Static

```typescript
public static getApiEndpoint(): string | undefined
```

Retorna endpoint API definido en @ApiEndpoint.

**Ubicación:** Línea 256

**Ejemplo:**

```typescript
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {}

Product.getApiEndpoint(); // '/api/products'
```

#### getApiEndpoint() - Instance

```typescript
public getApiEndpoint(): string | undefined
```

Versión de instancia.

**Ubicación:** Línea 257

#### getApiMethods() - Static

```typescript
public static getApiMethods(): HttpMethod[] | undefined
```

Retorna array de métodos HTTP permitidos definidos en @ApiMethods.

**Ubicación:** Línea 252

**Ejemplo:**

```typescript
@ApiMethods(['GET', 'POST', 'PUT'])
export class Product extends BaseEntity {}

Product.getApiMethods(); // ['GET', 'POST', 'PUT']
```

#### getApiMethods() - Instance

```typescript
public getApiMethods(): HttpMethod[] | undefined
```

Versión de instancia.

**Ubicación:** Línea 253

#### isApiMethodAllowed() - Static

```typescript
public static isApiMethodAllowed(method: HttpMethod): boolean
```

Valida si método HTTP específico está permitido en @ApiMethods.

**Ubicación:** Línea 254

**Ejemplo:**

```typescript
@ApiMethods(['GET', 'POST'])
export class Product extends BaseEntity {}

Product.isApiMethodAllowed('POST'); // true
Product.isApiMethodAllowed('DELETE'); // false
```

#### isApiMethodAllowed() - Instance

```typescript
public isApiMethodAllowed(method: HttpMethod): boolean
```

Versión de instancia.

**Ubicación:** Línea 255

## 5. Flujo de Funcionamiento

### Flujo de Lectura de Metadatos

```
Decorador aplica en clase
        ↓
Escribe metadata en prototype[METADATA_KEY]
        ↓
Método de acceso invocado
        ↓
Lee prototype[METADATA_KEY]
        ↓
Retorna valor o undefined
```

### Flujo de Renderizado de Formulario

```
Component necesita renderizar entidad
        ↓
Llama entity.getKeys()
        ↓
getKeys() lee PROPERTY_NAME_KEY y PROPERTY_INDEX_KEY
        ↓
Ordena keys por PropertyIndex
        ↓
Retorna array ordenado
        ↓
Component itera sobre keys
        ↓
Para cada key, llama getPropertyType(key)
        ↓
Selecciona input component apropiado
        ↓
Renderiza field con metadata de validación/UI
```

### Flujo de Validación de API Method

```
Usuario llama entity.save()
        ↓
save() determina método HTTP (POST o PUT)
        ↓
save() llama validateApiMethod(method)
        ↓
validateApiMethod() llama isApiMethodAllowed(method)
        ↓
isApiMethodAllowed() lee API_METHODS_KEY
        ↓
Verifica si method está en array
        ↓
Retorna true/false
        ↓
Si false, save() aborta con error
```

### Flujo de Formateo de Valor

```
Component necesita mostrar valor formateado
        ↓
Llama entity.getFormattedValue('price')
        ↓
getFormattedValue() llama getDisplayFormat('price')
        ↓
getDisplayFormat() lee DISPLAY_FORMAT_KEY
        ↓
Si es función, ejecuta format(value, entity)
        ↓
Si es string template, reemplaza ${value}
        ↓
Retorna string formateado
        ↓
Component muestra en UI
```

## 6. Reglas Obligatorias

**Regla 1:** Métodos de acceso DEBEN ser read-only. NUNCA modificar metadata retornada ni prototype.

**Regla 2:** Métodos DEBEN retornar undefined (no null) si metadata no existe. Null significa valor explícitamente definido como null.

**Regla 3:** Métodos static DEBEN operar sobre this.prototype. Métodos instance DEBEN operar sobre this.constructor.prototype. No mezclar.

**Regla 4:** getProperties() DEBE excluir arrays. getAllPropertiesNonFilter() DEBE incluir arrays. Esta distinción es arquitectural.

**Regla 5:** getKeys() DEBE retornar array ordenado por @PropertyIndex. Orden no definido si PropertyIndex falta para algunas propiedades.

**Regla 6:** getArrayKeysOrdered() DEBE retornar array ordenado por @TabOrder. Sin TabOrder, mantener orden de declaración.

**Regla 7:** getPropertyType() DEBE retornar Constructor exacto, no string ni nombre. Retornar Number, no "Number".

**Regla 8:** getArrayPropertyType() DEBE retornar clase BaseEntity del elemento, no Array constructor. Para tags: Tag[], retornar Tag, no Array.

**Regla 9:** isApiMethodAllowed() DEBE validar contra @ApiMethods antes de permitir HTTP request. No asumir todos los métodos permitidos.

**Regla 10:** getFormattedValue() DEBE aplicar @DisplayFormat si existe. NO aplicar formato default si DisplayFormat no definido.

**Regla 11:** Métodos que retornan Record<string, T> DEBEN retornar {} (objeto vacío) si no hay metadata, no undefined.

**Regla 12:** Métodos que retornan array DEBEN retornar [] (array vacío) si no hay metadata, no undefined.

## 7. Prohibiciones

**Prohibido:** Modificar valores retornados por métodos de acceso. Son read-only.

**Prohibido:** Escribir en prototype desde métodos de acceso. Solo decoradores escriben metadata.

**Prohibido:** Cachear resultados de métodos de acceso. Cada llamada debe hacer lookup fresco en prototype.

**Prohibido:** Hacer fallback a valores default si metadata no existe (excepto casos explícitos como getStringType que retorna StringType.TEXT).

**Prohibido:** Lanzar excepciones si metadata no existe. Retornar undefined o valor vacío apropiado.

**Prohibido:** Hacer transformación o procesamiento de datos más allá de lectura simple. Métodos son getters puros.

**Prohibido:** Llamar métodos static desde instancia usando this.constructor sin type casting correcto.

**Prohibido:** Asumir que todos los decoradores están aplicados. Siempre verificar undefined antes de usar valor.

**Prohibido:** Usar getProperties() cuando necesitas arrays. Usar getAllPropertiesNonFilter() o combinar getProperties() + getArrayKeys().

**Prohibido:** Usar getKeys() para arrays. Usar getArrayKeys() o getArrayKeysOrdered().

**Prohibido:** Comparar tipo con string. Usar === con Constructor: `type === Number`, no `type === 'Number'`.

**Prohibido:** Hacer override de métodos de acceso en subclases sin llamar super. Rompería flujo de lectura de metadata.

## 8. Dependencias

**Metadata Keys (Constants):**
- PROPERTY_NAME_KEY: Para nombres de propiedades
- PROPERTY_TYPE_KEY: Para tipos de propiedades
- PROPERTY_INDEX_KEY: Para orden de propiedades
- ARRAY_ELEMENT_TYPE_KEY: Para tipos de elementos array
- TAB_ORDER_KEY: Para orden de tabs
- VIEW_GROUP_KEY: Para grupos visuales
- VIEW_GROUP_ROW_KEY: Para configuración de filas
- STRING_TYPE_KEY: Para tipos de string
- DISPLAY_FORMAT_KEY: Para formatos de display
- HELP_TEXT_KEY: Para textos de ayuda
- MASK_KEY: Para máscaras de input
- REQUIRED_KEY: Para campos requeridos
- VALIDATION_KEY: Para validaciones síncronas
- ASYNC_VALIDATION_KEY: Para validaciones asíncronas
- DISABLED_KEY: Para campos deshabilitados
- READONLY_KEY: Para campos read-only
- HIDE_IN_DETAIL_VIEW_KEY: Para ocultar en DetailView
- HIDE_IN_LIST_VIEW_KEY: Para ocultar en ListView
- CSS_COLUMN_CLASS_KEY: Para clases CSS
- API_ENDPOINT_KEY: Para endpoint API
- API_METHODS_KEY: Para métodos HTTP permitidos
- MODULE_NAME_KEY: Para nombre de módulo
- MODULE_ICON_KEY: Para icono de módulo
- MODULE_PERMISSION_KEY: Para permisos de módulo
- DEFAULT_PROPERTY_KEY: Para propiedad default
- MODULE_LIST_COMPONENT_KEY: Para componente de lista custom
- MODULE_DETAIL_COMPONENT_KEY: Para componente de detalle custom
- MODULE_DEFAULT_COMPONENT_KEY: Para componente default
- MODULE_CUSTOM_COMPONENTS_KEY: Para componentes custom adicionales

**TypeScript:**
- Record<K, V>: Para mapeos key-value
- Constructor: Type alias para new(...args: any[]) => any
- typeof BaseEntity: Para referencias a clases entity
- Component: Type de Vue para componentes

**JavaScript Prototype Chain:**
- this.prototype: Acceso a prototype en métodos static
- this.constructor.prototype: Acceso a prototype en métodos instance
- Prototype lookup automático por JavaScript runtime

**Decoradores:**
- Todos los decoradores del sistema que escriben metadata
- Cada decorador documenta qué metadata key usa

## 9. Relaciones

**Relación con Decoradores (N:1):**
Múltiples decoradores escriben metadata → Cada método de acceso lee metadata de decorador específico. Relación de lectura unidireccional.

**Relación con Components (1:N):**
Métodos de acceso son consumidos por múltiples componentes UI (FormGroupComponent, DynamicInputComponent, TabControllerComponent, etc) para auto-configuración.

**Relación con CRUD Operations (N:1):**
save/update/delete usan métodos de validación (isApiMethodAllowed, validatePersistenceConfiguration) antes de ejecutar HTTP requests.

**Relación con Validation System (N:1):**
validateInputs() usa métodos isRequired, isValidation, isAsyncValidation para ejecutar validaciones configuradas por decoradores.

**Relación con Views (1:N):**
default_listview y default_detailview usan extensivamente métodos de acceso para renderizar automáticamente entidades sin código custom.

**Relación con Application Singleton (N:1):**
Application.router usa getModuleName, getModuleIcon para construir rutas y menús dinámicamente.

**Relación con BaseEntity Core (1:1):**
Métodos de acceso son parte integral de BaseEntity, no pueden funcionar independientemente. Dependen de prototype configurado por decoradores.

## 10. Notas de Implementación

### Ejemplo Completo de Uso

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

// Crear instancia
const product = new Product({ 
    id: 1, 
    name: 'Widget', 
    price: 99.99,
    tags: [new Tag({ name: 'electronics' })]
});

// === MÉTODOS DE PROPIEDADES ===
console.log(product.getKeys());
// ['id', 'name', 'price'] (ordenado por PropertyIndex)

console.log(product.getArrayKeys());
// ['tags']

console.log(product.getArrayKeysOrdered());
// ['tags'] (si hubiera múltiples, ordenados por TabOrder)

console.log(Product.getAllPropertiesNonFilter());
// { id: 'ID', name: 'Name', price: 'Price', tags: 'Tags' }

console.log(Product.getProperties());
// { id: 'ID', name: 'Name', price: 'Price' } (sin tags)

// === MÉTODOS DE TIPOS ===
console.log(product.getPropertyType('price')); // Number
console.log(product.getPropertyType('name')); // String
console.log(product.getArrayPropertyType('tags')); // Tag (la clase)

console.log(Product.getPropertyTypes());
// { id: Number, name: String, price: Number, tags: Array }

// === MÉTODOS DE MÓDULO ===
console.log(Product.getModuleName()); // 'Products'
console.log(Product.getModuleIcon()); // icono configurado
console.log(Product.getApiEndpoint()); // '/api/products'
console.log(Product.getApiMethods()); // ['GET', 'POST', 'PUT']

// === MÉTODOS DE VALIDACIÓN ===
console.log(product.isRequired('name')); // true
console.log(product.isRequired('price')); // false
console.log(product.getHelpText('name')); // 'Enter product name'

// === MÉTODOS DE UI ===
console.log(product.getViewGroups());
// { name: 'Basic Info', price: 'Basic Info' }

console.log(product.getFormattedValue('price')); // '$99.99'
console.log(product.isHideInDetailView('id')); // true
console.log(product.isHideInListView('id')); // false

// === MÉTODOS DE API ===
console.log(Product.isApiMethodAllowed('POST')); // true
console.log(Product.isApiMethodAllowed('DELETE')); // false
```

### Patrón de Uso en Components

```vue
<template>
    <FormGroupComponent 
        v-for="(group, groupName) in groupedFields" 
        :key="groupName"
        :title="groupName"
    >
        <DynamicInputComponent
            v-for="key in group"
            :key="key"
            :entity="entity"
            :property-key="key"
            :property-name="entity.constructor.getPropertyNameByKey(key)"
            :property-type="entity.getPropertyType(key)"
            :required="entity.isRequired(key)"
            :disabled="entity.isDisabled(key)"
            :readonly="entity.isReadOnly(key)"
            :help-text="entity.getHelpText(key)"
            :mask="entity.getMask(key)"
            :css-class="entity.getCSSClasses()[key]"
            v-model="entity[key]"
        />
    </FormGroupComponent>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['entity']);

const groupedFields = computed(() => {
    const keys = props.entity.getKeys();
    const groups = props.entity.getViewGroups();
    const result = {};
    
    for (const key of keys) {
        const groupName = groups[key] || 'Default';
        if (!result[groupName]) {
            result[groupName] = [];
        }
        result[groupName].push(key);
    }
    
    return result;
});
</script>
```

### Performance Considerations

```typescript
// ❌ MALO: Llamar en loop
for (let i = 0; i < 1000; i++) {
    const keys = entity.getKeys(); // 1000 prototype lookups
}

// ✅ BUENO: Cachear fuera de loop
const keys = entity.getKeys(); // 1 prototype lookup
for (let i = 0; i < 1000; i++) {
    // Usar keys
}

// ❌ MALO: Múltiples llamadas en computed
const computed = computed(() => {
    const keys = entity.getKeys();
    const types = entity.getPropertyTypes();
    const groups = entity.getViewGroups();
    // ...
});

// ✅ BUENO: Una sola llamada en computed, destructure
const computed = computed(() => {
    const { keys, types, groups } = {
        keys: entity.getKeys(),
        types: entity.getPropertyTypes(),
        groups: entity.getViewGroups()
    };
    // ...
});
```

### Patrón de Herencia

```typescript
class BaseAuditEntity extends BaseEntity {
    @PropertyName('Created At', Date)
    @ReadOnly(true)
    createdAt!: Date;
}

class Product extends BaseAuditEntity {
    @PropertyName('Name', String)
    name!: string;
}

// Herencia funciona automáticamente
const product = new Product({});
console.log(product.getKeys());
// ['createdAt', 'name'] (incluye campo de BaseAuditEntity)

console.log(product.isReadOnly('createdAt')); // true (heredado)
```

### Nota sobre getMask() - Método Sin Implementar

**Estado:** El decorador `@Mask` existe y está documentado en [../01-decorators/mask-decorator.md](../01-decorators/mask-decorator.md), pero BaseEntity NO tiene método accessor `getMask(propertyKey: string)` implementado.

**Inconsistencia detectada:**
- Otros decoradores similares como `@HelpText`, `@DisplayFormat`, `@CSSColumnClass` tienen métodos de acceso correspondientes: `getHelpText()`, `getDisplayFormat()`, `getCSSClasses()`
- El decorador `@Mask` almacena metadatos en `MASK_KEY` Symbol pero no hay método público para leerlos desde BaseEntity

**Workaround actual:**
Los componentes UI probablemente leen directamente del prototipo:
```typescript
// Acceso directo (bypass de patrón establecido)
const proto = (entity.constructor as any).prototype;
const mask = proto[MASK_KEY]?.[propertyKey];
```

**Implementación recomendada:**
```typescript
// En BaseEntity (NO IMPLEMENTADO ACTUALMENTE)
public getMask(propertyKey: string): string | undefined {
    const proto = (this.constructor as any).prototype;
    return proto[MASK_KEY]?.[propertyKey];
}
```

**Ubicación esperada:** Debería agregarse en BaseEntity alrededor de línea 345, junto con otros métodos de UI como `getHelpText()`.

## 11. Referencias Cruzadas

**Documentos relacionados:**
- base-entity-core.md: Núcleo de BaseEntity con arquitectura general
- crud-operations.md: Uso de métodos API (getApiEndpoint, isApiMethodAllowed)
- validation-system.md: Uso de métodos de validación (isRequired, isValidation, etc)
- ../01-decorators/: Documentación de cada decorador que escribe metadata
- ../../02-FLOW-ARCHITECTURE.md: Flujos donde se usan métodos de acceso
- ../04-components/views-overview.md: Componentes que consumen metadata

**Archivos fuente:**
- src/entities/base_entity.ts: Implementación de todos los métodos de acceso
- src/views/default_listview.vue: Uso de getKeys, getPropertyTypes para renderizado
- src/views/default_detailview.vue: Uso de getArrayKeysOrdered, getViewGroups para tabs
- src/components/Form/DynamicInputComponent.vue: Uso de getPropertyType para selección de input

**Líneas relevantes en código:**
- Línea 127-220: Métodos de Propiedades
- Línea 184-192: Métodos de Tipos
- Línea 204-248: Métodos de Módulo
- Línea 275-410: Métodos de Validación y UI
- Línea 252-257: Métodos de API

**Última actualización:** 11 de Febrero, 2026
