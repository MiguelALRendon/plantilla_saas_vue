# BaseEntity: Additional Metadata Methods

## 1. Propósito

El sistema de métodos de metadata adicionales complementa metadata-access.md proveyendo acceso a configuraciones específicas de propiedades individuales, formato de display, layout de UI, control de API y visibilidad. Gestiona metadata de propiedades especiales (DefaultProperty, PrimaryProperty, UniquePropertyKey que identifican propiedades clave de entidad), metadata de formato y display (DisplayFormat para conversión de valores a strings presentables, StringType para determinar tipo de input text, HelpText para tooltips y guidance), metadata de UI layout (ViewGroup para agrupación lógica de propiedades, ViewGroupRow para posicionamiento en grid, TabOrder para secuencia de navegación keyboard, getArrayKeysOrdered para ordenamiento de arrays), metadata de API (ApiEndpoint URL, ApiMethods array de HTTP methods permitidos, isApiMethodAllowed para verificación de permisos HTTP), y metadata de visibilidad (HideInDetailView/HideInListView para control condicional de rendering en vistas). Los métodos permiten consultar getDefaultPropertyValue() para display de entidad en listas donde solo cabe un campo, getPrimaryPropertyValue/getUniquePropertyValue para operaciones CRUD (isNew, delete), getFormattedValue(key) para aplicar DisplayFormat automáticamente, isReadOnly(key) con soporte de condiciones dinámicas (función que evalúa estado de entidad), getViewGroups/getViewGroupRows/getTabOrders para construcción automática de formularios con layout complejo, isHideInDetailView/isHideInListView para filtrado de propiedades según contexto de vista. Critical para DefaultDetailView que consume ViewGroup/ViewGroupRow/TabOrder/isHideInDetailView, DefaultListView que usa isHideInListView/getFormattedValue, useInputMetadata composable que integra StringType/HelpText/isReadOnly, y CRUD operations que usan getUniquePropertyValue/isApiMethodAllowed.

## 2. Alcance

**Responsabilidades cubiertas:**
- getDefaultPropertyValue(): Retorna valor de propiedad con @DefaultProperty decorator, usada en displays de lista donde solo cabe un campo representativo
- getPrimaryPropertyValue(): Retorna valor de propiedad con @PrimaryProperty decorator, usada en isNew() para determinar si entidad tiene ID
- getPrimaryPropertyKey(): Retorna nombre de propiedad con @PrimaryProperty decorator, permite acceso dinámico a primary property
- getUniquePropertyValue(): Retorna valor de propiedad marcada con @UniquePropertyKey, usada en delete() y update() como OID (Object ID) para API
- getUniquePropertyKey(): Retorna nombre de propiedad unique, complementa getUniquePropertyValue()
- getStringType(): Retorna Record<string, StringType> con tipos de input para propiedades string (TEXT, EMAIL, PASSWORD, URL, TELEPHONE, TEXTAREA)
- getDisplayFormat(key): Retorna DisplayFormatValue (función o string template) definido en @DisplayFormat decorator para propiedad específica
- getFormattedValue(key): Aplica DisplayFormat a valor de propiedad y retorna string formateado, fallback a toString() si no hay formato
- getHelpText(key): Retorna string de ayuda definido en @HelpText decorator, usado en tooltips y placeholder de inputs
- getViewGroups(): Retorna Record<string, string> con nombre de grupo por propiedad, usado para separar formulario en secciones
- getViewGroupRows(): Retorna Record<string, ViewGroupRow> con posición en grid (TOP_LEFT, TOP_RIGHT, BOTTOM), usado para layout de 2 columnas
- getTabOrders(): Retorna Record<string, number> con índice de tab order, usado para navegación keyboard en formularios
- getArrayKeysOrdered(): Retorna string[] con nombres de propiedades array ordenadas por TabOrder, usado en DefaultDetailView para renderizar arrays al final
- getApiEndpoint(): Retorna string URL definida en @ApiEndpoint decorator, usado en todos los CRUD operations
- isReadOnly(key): Retorna boolean verificando @ReadOnly decorator, soporta condiciones dinámicas (función que evalúa entity state)
- getApiMethods(): Retorna HttpMethod[] o undefined con métodos HTTP permitidos definidos en @ApiMethods decorator
- isApiMethodAllowed(method): Verifica si HTTP method específico está permitido, retorna false si @ApiMethods no incluye method
- isHideInDetailView(key): Retorna boolean verificando @HideInDetailView decorator, usado para filtrar propiedades en formularios
- isHideInListView(key): Retorna boolean verificando @HideInListView decorator, usado para filtrar columnas en tablas

**Límites del alcance:**
- getDefaultPropertyValue() retorna undefined si NO hay @DefaultProperty, caller debe manejar fallback (típicamente getPrimaryPropertyValue)
- getPrimaryPropertyValue() retorna undefined si entidad es nueva sin ID, isNew() usa esto como criterio
- getUniquePropertyValue() puede diferir de getPrimaryPropertyValue() (unique para API vs primary conceptual), delete() usa unique NO primary
- getDisplayFormat() retorna DisplayFormatValue (function | string template), NO ejecuta formato, getFormattedValue() ejecuta
- getFormattedValue() retorna string, NO preserva tipo original (número con formato '$99.99' es string '...', NO number)
- StringType solo aplica a propiedades String, NO verifica tipo, caller debe filtrar propiedades String primero
- ViewGroup NO crea estructura nested automáticamente, caller debe agrupar propiedades manualmente iterando sobre Record
- ViewGroupRow solo define posición (TOP_LEFT, TOP_RIGHT, BOTTOM), NO especifica width (usar @CSSColumnClass para eso)
- TabOrder no fuerza rendering order, solo provee metadata, caller decide si aplicar ordering
- getArrayKeysOrdered() solo ordena arrays, NO incluye propiedades non-array, DefaultDetailView renderiza arrays separado
- isReadOnly() con condition function evalúa en runtime, NO cachea resultado, reevaluar cada vez que state cambia
- isApiMethodAllowed() retorna true si @ApiMethods NO definido (default allow all), NO false
- isHideInDetailView/isHideInListView son independientes (propiedad puede estar visible en list pero hidden en detail)
- Métodos NO validan consistencia entre decorators (puede tener TabOrder sin ViewGroup, puede tener DisplayFormat en propiedad Object)

## 3. Definiciones Clave

**@DefaultProperty:** Decorator que marca propiedad como representante principal de entidad. Típicamente nombre o título. Usado en listas donde solo cabe un campo. getDefaultPropertyValue() retorna su valor. Solo una propiedad por entidad debe tener decorator.

**@PrimaryProperty:** Decorator que marca propiedad como ID principal (identity key). Típicamente autoincremental numérico. Usado por isNew() para determinar si entidad es nueva (primary === undefined). getPrimaryPropertyValue() retorna su valor.

**@UniquePropertyKey:** Decorator de clase (NO propiedad) que define qué propiedad es unique identifier para API. Puede diferir de PrimaryProperty (primary para lógica interna, unique para API). delete() y update() usan unique value como OID en URL. Ejemplo: @UniquePropertyKey('customerId').

**getUniquePropertyValue() vs getPrimaryPropertyValue():** Primary es ID conceptual interno (number autoincremental), Unique es ID usado en API requests (puede ser string como 'CUST-001'). delete() usa unique (DELETE /api/customers/CUST-001), isNew() usa primary (verificar si number es undefined).

**DisplayFormatValue:** Type union `((value: any) => string) | string`. Si función: ejecuta con valor y retorna string formateado. Si string: template con placeholder {value} reemplazado por valor actual. Usado por @DisplayFormat decorator. getDisplayFormat() retorna type, getFormattedValue() ejecuta conversión.

**StringType Enum:** Valores: TEXT, EMAIL, PASSWORD, URL, TELEPHONE, TEXTAREA. Define qué tipo de input HTML renderizar para propiedad string. StringType.EMAIL → `<input type="email">`, StringType.PASSWORD → `<input type="password">`, StringType.TEXTAREA → `<textarea>`.

**ViewGroup:** String que agrupa propiedades lógicamente. Ejemplo: 'Personal Information', 'Work Information', 'Address'. DefaultDetailView renderiza sección/panel separado por grupo. getViewGroups() retorna Record<propertyKey, groupName>.

**ViewGroupRow Enum:** Posiciones: TOP_LEFT, TOP_RIGHT, BOTTOM. Define posición en layout de 2 columnas. TOP_LEFT y TOP_RIGHT renderizan en mismo row con 2 columnas, BOTTOM renderiza en row completo full-width. Usado dentro de ViewGroup.

**TabOrder:** Número que define secuencia de navegación keyboard (tab key). Menor número = foco primero. Usado para ordenar inputs en formulario. getTabOrders() retorna Record<propertyKey, orderNumber>. getArrayKeysOrdered() usa TabOrder para ordenar arrays.

**@ReadOnly Decorator:** Marca propiedad como read-only. Puede ser incondicional @ReadOnly() o condicional @ReadOnly({ condition: (entity) => entity.status === 'locked' }). isReadOnly(key) evalúa condición en runtime retornando boolean. Inputs renderizan con readonly attribute.

**@ApiMethods Decorator:** Define HTTP methods permitidos como array. Ejemplo: @ApiMethods(['GET', 'POST', 'PUT']). Si no definido, TODOS los methods permitidos. getApiMethods() retorna array o undefined. isApiMethodAllowed(method) verifica si method específico permitido.

**OID (Object ID):** Object Identifier usado en URLs de API. Obtenido con getUniquePropertyValue(). Puede ser number (5) o string ('CUST-001'). Usado en delete (DELETE /api/entities/{oid}), update (PUT /api/entities/{oid}), getElement (GET /api/entities/{oid}).

**getFormattedValue(key) Pattern:** Serie de transformaciones: 1) Obtener value de this[key], 2) Obtener format de getDisplayFormat(key), 3) Si NO format → value.toString(), 4) Si format es función → format(value), 5) Si format es string → replace '{value}' con value. Aplicación automática de DisplayFormat.

**isReadOnly Condition Function:** Signature `(entity: BaseEntity) => boolean`. Recibe instancia completa de entity, puede acceder a cualquier propiedad para decidir read-only. Ejemplo: `(entity) => entity.status === 'paid' || entity.locked === true`. Evalúa en runtime cada vez que isReadOnly() llamado.

## 4. Descripción Técnica

### Métodos de Propiedades Especiales

#### getDefaultPropertyValue() - Valor Representativo

```typescript
public getDefaultPropertyValue(): any
```

Retorna valor de propiedad con @DefaultProperty decorator.

**Ubicación:** Línea 232

**Ejemplo:**

```typescript
@ModuleName('Product', 'Products')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id?: number;
    
    @PropertyName('Name', String)
    @DefaultProperty()
    name!: string;
    
    @PropertyName('SKU', String)
    sku!: string;
}

const product = new Product({ id: 1, name: 'Widget', sku: 'WDG-001' });

const defaultValue = product.getDefaultPropertyValue();
console.log(defaultValue); // 'Widget'

console.log(`Product: ${product.getDefaultPropertyValue()}`);
// Output: "Product: Widget"
```

**Uso en DefaultListView:**

```vue
<template>
    <tr v-for="entity in entities" :key="entity.id">
        <td>{{ entity.getDefaultPropertyValue() }}</td>
    </tr>
</template>
```

#### getPrimaryPropertyValue() - ID Principal

```typescript
public getPrimaryPropertyValue(): any
```

Retorna valor de propiedad con @PrimaryProperty decorator.

**Ubicación:** Línea 240

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('User ID', Number)
    id?: number;
    
    @PropertyName('Username', String)
    username!: string;
}

const user = new User({ id: 42, username: 'alice' });

const primaryValue = user.getPrimaryPropertyValue();
console.log(primaryValue); // 42

if (user.getPrimaryPropertyValue() === undefined) {
    console.log('Nueva entidad sin ID');
}
```

**Uso en isNew():**

```typescript
public isNew(): boolean {
    return this.getPrimaryPropertyValue() === undefined || 
           this.getPrimaryPropertyValue() === null;
}
```

#### getPrimaryPropertyKey() - Nombre de Primary Property

```typescript
public getPrimaryPropertyKey(): string | undefined
```

Retorna nombre de propiedad con @PrimaryProperty decorator.

**Ubicación:** Línea 248

**Ejemplo:**

```typescript
export class Order extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Order ID', Number)
    orderId?: number;
    
    @PropertyName('Order Number', String)
    orderNumber!: string;
}

const order = new Order({ orderId: 100, orderNumber: 'ORD-100' });

const primaryKey = order.getPrimaryPropertyKey();
console.log(primaryKey); // 'orderId'

const primaryValue = order[primaryKey!];
console.log(primaryValue); // 100
```

#### getUniquePropertyValue() - OID para API

```typescript
public getUniquePropertyValue(): any
```

Retorna valor de propiedad marcada con @UniquePropertyKey.

**Ubicación:** Línea 252

**Ejemplo con diferencia Primary vs Unique:**

```typescript
@UniquePropertyKey('invoiceNumber')
export class Invoice extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('ID', Number)
    id?: number;
    
    @PropertyName('Invoice Number', String)
    invoiceNumber!: string;
}

const invoice = new Invoice({ id: 5, invoiceNumber: 'INV-2024-001' });

console.log(invoice.getPrimaryPropertyValue());  // 5 (ID interno)
console.log(invoice.getUniquePropertyValue());  // 'INV-2024-001' (OID para API)

await invoice.delete();
// DELETE /api/invoices/INV-2024-001 (usa unique, NO id)
```

**Uso en delete():**

```typescript
// base_entity.ts - Línea 821
const uniqueKey = this.getUniquePropertyValue();
await Application.axiosInstance.delete(`${endpoint}/${uniqueKey}`);
```

#### getUniquePropertyKey() - Nombre de Unique Property

```typescript
public getUniquePropertyKey(): string | undefined
```

Retorna nombre de propiedad unique.

**Ubicación:** Línea 260

**Ejemplo:**

```typescript
const uniqueKey = customer.getUniquePropertyKey();
console.log(uniqueKey); // 'customerId'
```

### Métodos de Display y Formato

#### getStringType() - Tipos de Input String

```typescript
public getStringType(): Record<string, StringType>
```

Retorna mapeo propertyKey → StringType para propiedades string.

**Ubicación:** Línea 264

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @StringType(StringType.TEXT)
    username!: string;
    
    @PropertyName('Email', String)
    @StringType(StringType.EMAIL)
    email!: string;
    
    @PropertyName('Password', String)
    @StringType(StringType.PASSWORD)
    password!: string;
    
    @PropertyName('Website', String)
    @StringType(StringType.URL)
    website!: string;
    
    @PropertyName('Phone', String)
    @StringType(StringType.TELEPHONE)
    phone!: string;
    
    @PropertyName('Notes', String)
    @StringType(StringType.TEXTAREA)
    notes!: string;
}

const user = new User({});
const stringTypes = user.getStringType();

console.log(stringTypes);
// {
//   username: StringType.TEXT,
//   email: StringType.EMAIL,
//   password: StringType.PASSWORD,
//   website: StringType.URL,
//   phone: StringType.TELEPHONE,
//   notes: StringType.TEXTAREA
// }
```

**Uso en TextInputComponent:**

```vue
<script setup>
const stringTypes = entity.getStringType();
const stringType = stringTypes[propertyKey] || StringType.TEXT;

const inputType = computed(() => {
    switch (stringType) {
        case StringType.EMAIL: return 'email';
        case StringType.PASSWORD: return 'password';
        case StringType.URL: return 'url';
        case StringType.TELEPHONE: return 'tel';
        default: return 'text';
    }
});

const isTextarea = computed(() => stringType === StringType.TEXTAREA);
</script>

<template>
    <textarea v-if="isTextarea" v-model="entity[propertyKey]" />
    <input v-else :type="inputType" v-model="entity[propertyKey]" />
</template>
```

#### getDisplayFormat(key) - Obtener Formato

```typescript
public getDisplayFormat(propertyKey: string): DisplayFormatValue | undefined
```

Retorna función o string template de @DisplayFormat.

**Ubicación:** Línea 371

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Price', Number)
    @DisplayFormat((value) => `$${value.toFixed(2)}`)
    price!: number;
    
    @PropertyName('Stock', Number)
    @DisplayFormat('{value} units')
    stock!: number;
    
    @PropertyName('Discount', Number)
    @DisplayFormat((value) => `${(value * 100).toFixed(0)}%`)
    discount!: number;
}

const product = new Product({ price: 99.99, stock: 50, discount: 0.15 });

const priceFormat = product.getDisplayFormat('price');
console.log(typeof priceFormat);  // 'function'

const stockFormat = product.getDisplayFormat('stock');
console.log(stockFormat);  // '{value} units'
```

#### getFormattedValue(key) - Aplicar Formato

```typescript
public getFormattedValue(propertyKey: string): string
```

Aplica DisplayFormat y retorna string formateado.

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
        return format(value);
    }
    
    // String template: reemplazar {value}
    return format.replace('{value}', value?.toString() ?? '');
}
```

**Ejemplo:**

```typescript
const product = new Product({ price: 99.99, stock: 50, discount: 0.15 });

console.log(product.getFormattedValue('price'));
// '$99.99' (función ejecutada)

console.log(product.getFormattedValue('stock'));
// '50 units' (template string aplicado)

console.log(product.getFormattedValue('discount'));
// '15%' (función ejecutada)

console.log(product.getFormattedValue('name'));
// 'Widget' (sin formato, toString())
```

**Uso en DefaultListView:**

```vue
<template>
    <tr v-for="entity in entities" :key="entity.id">
        <td v-for="key in visibleKeys" :key="key">
            {{ entity.getFormattedValue(key) }}
        </td>
    </tr>
</template>
```

#### getHelpText(key) - Texto de Ayuda

```typescript
public getHelpText(propertyKey: string): string | undefined
```

Retorna texto de ayuda definido en @HelpText.

**Ubicación:** Línea 393

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('Password', String)
    @HelpText('Mínimo 8 caracteres, incluir mayúsculas y números')
    password!: string;
    
    @PropertyName('Email', String)
    @HelpText('Usaremos este email para notificaciones')
    email!: string;
}

const user = new User({});

console.log(user.getHelpText('password'));
// 'Mínimo 8 caracteres, incluir mayúsculas y números'

console.log(user.getHelpText('email'));
// 'Usaremos este email para notificaciones'
```

**Uso en useInputMetadata:**

```typescript
export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata {
    const helpText = entity.getHelpText(propertyKey);
    return { helpText, ... };
}
```

### Métodos de UI Layout

#### getViewGroups() - Grupos Lógicos

```typescript
public getViewGroups(): Record<string, string>
```

Retorna mapeo propertyKey → groupName.

**Ubicación:** Línea 277

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @ViewGroup('Personal Information')
    username!: string;
    
    @PropertyName('Email', String)
    @ViewGroup('Personal Information')
    email!: string;
    
    @PropertyName('Company', String)
    @ViewGroup('Work Information')
    company!: string;
    
    @PropertyName('Job Title', String)
    @ViewGroup('Work Information')
    jobTitle!: string;
}

const user = new User({});
const groups = user.getViewGroups();

console.log(groups);
// {
//   username: 'Personal Information',
//   email: 'Personal Information',
//   company: 'Work Information',
//   jobTitle: 'Work Information'
// }

// Agrupar propiedades dinámicamente
const groupedProperties: Record<string, string[]> = {};
Object.entries(groups).forEach(([key, group]) => {
    if (!groupedProperties[group]) {
        groupedProperties[group] = [];
    }
    groupedProperties[group].push(key);
});

console.log(groupedProperties);
// {
//   'Personal Information': ['username', 'email'],
//   'Work Information': ['company', 'jobTitle']
// }
```

**Uso en DefaultDetailView:**

```vue
<template>
    <div v-for="(properties, groupName) in groupedProperties" :key="groupName">
        <h3>{{ groupName }}</h3>
        <div v-for="key in properties" :key="key">
            <InputComponent :property-key="key" />
        </div>
    </div>
</template>

<script setup>
const groups = entity.getViewGroups();
const groupedProperties = computed(() => {
    const result: Record<string, string[]> = {};
    Object.entries(groups).forEach(([key, group]) => {
        if (!result[group]) result[group] = [];
        result[group].push(key);
    });
    return result;
});
</script>
```

#### getViewGroupRows() - Posiciones en Grid

```typescript
public getViewGroupRows(): Record<string, ViewGroupRow>
```

Retorna mapeo propertyKey → ViewGroupRow (TOP_LEFT, TOP_RIGHT, BOTTOM).

**Ubicación:** Línea 282

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    @ViewGroup('Basic Info')
    @ViewGroupRow(ViewGroupRow.TOP_LEFT)
    name!: string;
    
    @PropertyName('SKU', String)
    @ViewGroup('Basic Info')
    @ViewGroupRow(ViewGroupRow.TOP_RIGHT)
    sku!: string;
    
    @PropertyName('Description', String)
    @ViewGroup('Basic Info')
    @ViewGroupRow(ViewGroupRow.BOTTOM)
    description!: string;
    
    @PropertyName('Price', Number)
    @ViewGroup('Pricing')
    @ViewGroupRow(ViewGroupRow.TOP_LEFT)
    price!: number;
    
    @PropertyName('Cost', Number)
    @ViewGroup('Pricing')
    @ViewGroupRow(ViewGroupRow.TOP_RIGHT)
    cost!: number;
}

const product = new Product({});
const rows = product.getViewGroupRows();

console.log(rows);
// {
//   name: ViewGroupRow.TOP_LEFT,
//   sku: ViewGroupRow.TOP_RIGHT,
//   description: ViewGroupRow.BOTTOM,
//   price: ViewGroupRow.TOP_LEFT,
//   cost: ViewGroupRow.TOP_RIGHT
// }
```

**Uso en layout 2 columnas:**

```vue
<template>
    <div v-for="(properties, groupName) in groupedProperties" :key="groupName">
        <h3>{{ groupName }}</h3>
        
        <div class="row">
            <div class="col-md-6">
                <div v-for="key in getPropertiesForRow(groupName, ViewGroupRow.TOP_LEFT)" :key="key">
                    <InputComponent :property-key="key" />
                </div>
            </div>
            <div class="col-md-6">
                <div v-for="key in getPropertiesForRow(groupName, ViewGroupRow.TOP_RIGHT)" :key="key">
                    <InputComponent :property-key="key" />
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div v-for="key in getPropertiesForRow(groupName, ViewGroupRow.BOTTOM)" :key="key">
                    <InputComponent :property-key="key" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const rows = entity.getViewGroupRows();
const groups = entity.getViewGroups();

const getPropertiesForRow = (groupName: string, row: ViewGroupRow) => {
    return Object.keys(rows).filter(key => 
        groups[key] === groupName && rows[key] === row
    );
};
</script>
```

#### getTabOrders() - Orden de Navegación

```typescript
public getTabOrders(): Record<string, number>
```

Retorna mapeo propertyKey → tabOrderNumber.

**Ubicación:** Línea 399

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('Email', String)
    @TabOrder(2)
    email!: string;
    
    @PropertyName('Username', String)
    @TabOrder(1)
    username!: string;
    
    @PropertyName('Password', String)
    @TabOrder(3)
    password!: string;
}

const user = new User({});
const tabOrders = user.getTabOrders();

console.log(tabOrders);
// { email: 2, username: 1, password: 3 }

const orderedKeys = Object.keys(tabOrders).sort((a, b) => {
    return tabOrders[a] - tabOrders[b];
});

console.log(orderedKeys);
// ['username', 'email', 'password']
```

**Uso en formulario ordenado:**

```vue
<script setup>
const tabOrders = entity.getTabOrders();
const orderedKeys = Object.keys(tabOrders).sort((a, b) => tabOrders[a] - tabOrders[b]);
</script>

<template>
    <div v-for="key in orderedKeys" :key="key">
        <InputComponent :property-key="key" :tabindex="tabOrders[key]" />
    </div>
</template>
```

#### getArrayKeysOrdered() - Arrays Ordenados

```typescript
public getArrayKeysOrdered(): string[]
```

Retorna propiedades array ordenadas por TabOrder.

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
export class Order extends BaseEntity {
    @PropertyName('Items', Array)
    @ArrayElementType(OrderItem)
    @TabOrder(2)
    items!: OrderItem[];
    
    @PropertyName('Addresses', Array)
    @ArrayElementType(Address)
    @TabOrder(1)
    addresses!: Address[];
    
    @PropertyName('Notes', Array)
    @TabOrder(3)
    notes!: string[];
}

const order = new Order({ items: [], addresses: [], notes: [] });

const orderedArrayKeys = order.getArrayKeysOrdered();
console.log(orderedArrayKeys);
// ['addresses', 'items', 'notes']  ← Ordenado por TabOrder
```

**Uso en DefaultDetailView:**

```vue
<template>
    <!-- Primero propiedades normales -->
    <div v-for="key in entity.getKeys()" :key="key">
        <InputComponent :property-key="key" />
    </div>
    
    <!-- Luego arrays ordenados -->
    <div v-for="key in entity.getArrayKeysOrdered()" :key="key">
        <ArrayInputComponent :property-key="key" />
    </div>
</template>
```

### Métodos de API y Control

#### getApiEndpoint() - URL de API

```typescript
public getApiEndpoint(): string | undefined
// static getApiEndpoint(): string | undefined
```

Retorna URL definida en @ApiEndpoint decorator.

**Ubicación:** Línea 420 (instancia), Línea 416 (static)

**Ejemplo:**

```typescript
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {}

const product = new Product({});
console.log(product.getApiEndpoint());  // '/api/products'

console.log(Product.getApiEndpoint());  // '/api/products'
```

**Uso en CRUD:**

```typescript
// save() - Línea 744
const endpoint = this.getApiEndpoint();
const response = await Application.axiosInstance.post(endpoint!, dataToSend);
```

#### isReadOnly(key) - Verificar Read-Only

```typescript
public isReadOnly(propertyKey: string): boolean
```

Verifica si propiedad tiene @ReadOnly decorator con soporte de condiciones dinámicas.

**Ubicación:** Línea 424

**Ejemplo incondicional:**

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice Number', String)
    @ReadOnly()
    invoiceNumber!: string;
}

const invoice = new Invoice({ invoiceNumber: 'INV-001' });
console.log(invoice.isReadOnly('invoiceNumber')); // true (siempre)
```

**Ejemplo condicional:**

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Status', String)
    @ReadOnly({ condition: (entity) => entity.status === 'paid' })
    status!: string;
    
    @PropertyName('Amount', Number)
    @ReadOnly({ condition: (entity) => entity.status === 'paid' || entity.locked })
    amount!: number;
}

const invoice = new Invoice({ status: 'pending', amount: 500, locked: false });

console.log(invoice.isReadOnly('status'));  // false (pending !== 'paid')
console.log(invoice.isReadOnly('amount'));  // false (no paid ni locked)

invoice.status = 'paid';
console.log(invoice.isReadOnly('status'));  // true (ahora es 'paid')
console.log(invoice.isReadOnly('amount'));  // true (paid ahora)

invoice.status = 'cancelled';
invoice.locked = true;
console.log(invoice.isReadOnly('status'));  // false (no paid)
console.log(invoice.isReadOnly('amount'));  // true (locked es true)
```

**Uso en inputs:**

```vue
<template>
    <input 
        v-model="entity[propertyKey]"
        :readonly="entity.isReadOnly(propertyKey)"
    />
</template>
```

#### getApiMethods() - Métodos HTTP Permitidos

```typescript
public getApiMethods(): HttpMethod[] | undefined
// static getApiMethods(): HttpMethod[] | undefined
```

Retorna array de métodos HTTP permitidos o undefined (todos permitidos).

**Ubicación:** Línea 440 (static), Línea 444 (instancia)

**Ejemplo:**

```typescript
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT'])
export class Product extends BaseEntity {}

const product = new Product({});
const methods = product.getApiMethods();
console.log(methods); // ['GET', 'POST', 'PUT']  ← DELETE NO permitido
```

#### isApiMethodAllowed(method) - Verificar Método

```typescript
public isApiMethodAllowed(method: HttpMethod): boolean
// static isApiMethodAllowed(method: HttpMethod): boolean
```

Verifica si método HTTP específico está permitido.

**Ubicación:** Línea 452 (static), Línea 456 (instancia)

**Ejemplo:**

```typescript
@ApiMethods(['GET', 'POST', 'PUT'])
export class Product extends BaseEntity {}

const product = new Product({});

console.log(product.isApiMethodAllowed('GET'));    // true
console.log(product.isApiMethodAllowed('POST'));   // true
console.log(product.isApiMethodAllowed('PUT'));    // true
console.log(product.isApiMethodAllowed('DELETE')); // false
```

**Uso en delete():**

```typescript
// base_entity.ts - Línea 808
if (!this.validateApiMethod('DELETE')) {
    return;  // No ejecutar DELETE si no permitido
}
```

### Métodos de Visibilidad

#### isHideInDetailView(key) - Ocultar en Detalle

```typescript
public isHideInDetailView(propertyKey: string): boolean
```

Verifica si propiedad debe ocultarse en vista de detalle.

**Ubicación:** Línea 460

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PropertyName('ID', Number)
    @HideInDetailView()
    id?: number;
    
    @PropertyName('Username', String)
    username!: string;
    
    @PropertyName('Created At', String)
    @HideInDetailView()
    createdAt!: string;
}

const user = new User({ id: 5, username: 'alice', createdAt: '2024-01-01' });

console.log(user.isHideInDetailView('id'));        // true
console.log(user.isHideInDetailView('username'));  // false
console.log(user.isHideInDetailView('createdAt')); // true
```

**Uso en DefaultDetailView:**

```vue
<template>
    <div v-for="key in entity.getKeys()" :key="key">
        <InputComponent 
            v-if="!entity.isHideInDetailView(key)"
            :property-key="key" 
        />
    </div>
</template>
```

#### isHideInListView(key) - Ocultar en Lista

```typescript
public isHideInListView(propertyKey: string): boolean
```

Verifica si propiedad debe ocultarse en vista de lista.

**Ubicación:** Línea 466

**Ejemplo:**

```typescript
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id?: number;
    
    @PropertyName('Name', String)
    name!: string;
    
    @PropertyName('Description', String)
    @HideInListView()
    description!: string;
    
    @PropertyName('Internal Notes', String)
    @HideInListView()
    internalNotes!: string;
}

const product = new Product({ 
    id: 1, 
    name: 'Widget', 
    description: 'Long description...',
    internalNotes: 'Internal info'
});

console.log(product.isHideInListView('id'));            // false
console.log(product.isHideInListView('name'));          // false
console.log(product.isHideInListView('description'));   // true
console.log(product.isHideInListView('internalNotes')); // true
```

**Uso en DefaultListView:**

```vue
<template>
    <table>
        <thead>
            <tr>
                <th v-for="key in visibleKeys" :key="key">
                    {{ entityClass.getPropertyNameByKey(key) }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="entity in entities" :key="entity.id">
                <td v-for="key in visibleKeys" :key="key">
                    {{ entity.getFormattedValue(key) }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
const visibleKeys = computed(() => {
    return entity.getKeys().filter(key => !entity.isHideInListView(key));
});
</script>
```

## 5. Flujo de Funcionamiento

### Flujo de Formatted Value Display

```
DefaultListView renderiza tabla
        ↓
Para cada entity en entities:
    Para cada key en visibleKeys:
        entity.getFormattedValue(key) ejecuta
        ↓
    Obtener value de entity[key]
    value = 99.99 (price)
        ↓
    Obtener format de getDisplayFormat('price')
    format = (value) => `$${value.toFixed(2)}`
        ↓
    ¿format existe?
        ├─ NO → return value.toString()
        └─ SÍ → ¿Es función?
                ├─ SÍ → return format(value)
                │       return '$99.99'
                └─ NO (es string template) →
                        return format.replace('{value}', value.toString())
                        '{value} units' → '99 units'
        ↓
    Retornar string formateado
    '$99.99'
        ↓
    Renderizar en <td>
```

### Flujo de ViewGroup Layout Construction

```
DefaultDetailView inicializa
        ↓
const groups = entity.getViewGroups()
// { username: 'Personal', email: 'Personal', company: 'Work', jobTitle: 'Work' }
        ↓
const rows = entity.getViewGroupRows()
// { username: TOP_LEFT, email: TOP_RIGHT, company: TOP_LEFT, jobTitle: TOP_RIGHT }
        ↓
Construir estructura agrupada:
groupedProperties = {}
        ↓
Para cada (key, group) in Object.entries(groups):
    if (!groupedProperties[group]) {
        groupedProperties[group] = {}
    }
    
    const row = rows[key]
    if (!groupedProperties[group][row]) {
        groupedProperties[group][row] = []
    }
    
    groupedProperties[group][row].push(key)
        ↓
Resultado:
{
    'Personal': {
        TOP_LEFT: ['username'],
        TOP_RIGHT: ['email']
    },
    'Work': {
        TOP_LEFT: ['company'],
        TOP_RIGHT: ['jobTitle']
    }
}
        ↓
Renderizar por grupo:
    Para cada group in groupedProperties:
        Renderizar <h3>{{ group }}</h3>
        Renderizar row con TOP_LEFT y TOP_RIGHT en 2 columnas
        Renderizar row con BOTTOM en 1 columna full-width
```

### Flujo de Conditional Read-Only Evaluation

```
Usuario intenta editar input
        ↓
Input component verifica readonly attribute
:readonly="entity.isReadOnly(propertyKey)"
        ↓
entity.isReadOnly('status') ejecuta
        ↓
Obtener decorator metadata
decorator = @ReadOnly({ condition: (entity) => entity.status === 'paid' })
        ↓
¿Tiene condition function?
    ├─ NO → return true (incondicional read-only)
    └─ SÍ → Ejecutar condition(entity)
            condition ejecuta con entity actual:
            entity.status === 'paid'
            'pending' === 'paid' → false
        ↓
return false
        ↓
Input renderiza como editable
```

### Flujo de API Method Validation

```
Usuario llama entity.delete()
        ↓
delete() ejecuta this.validateApiMethod('DELETE')
        ↓
validateApiMethod('DELETE') ejecuta
        ↓
const allowed = this.isApiMethodAllowed('DELETE')
        ↓
isApiMethodAllowed('DELETE') ejecuta
        ↓
const methods = this.getApiMethods()
// ['GET', 'POST', 'PUT']  (desde @ApiMethods decorator)
        ↓
¿methods es undefined?
    ├─ SÍ → return true (sin decorator = todos permitidos)
    └─ NO → methods.includes('DELETE')
            ['GET', 'POST', 'PUT'].includes('DELETE')
            false
        ↓
return false
        ↓
validateApiMethod verifica resultado:
if (!allowed) {
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.ERROR,
        'Método DELETE no permitido'
    );
    return false;
}
        ↓
delete() no ejecuta HTTP request
```

### Flujo de Visibility Filtering

```
DefaultListView inicializa
        ↓
const allKeys = entity.getKeys()
// ['id', 'name', 'description', 'price', 'internalNotes']
        ↓
Filtrar keys visibles:
const visibleKeys = allKeys.filter(key => !entity.isHideInListView(key))
        ↓
Para cada key:
    entity.isHideInListView('id') → false
    entity.isHideInListView('name') → false
    entity.isHideInListView('description') → true (filtrado)
    entity.isHideInListView('price') → false
    entity.isHideInListView('internalNotes') → true (filtrado)
        ↓
visibleKeys = ['id', 'name', 'price']
        ↓
Renderizar solo columnas visibles:
<th v-for="key in visibleKeys">
    <!-- Solo 'id', 'name', 'price' -->
```

## 6. Reglas Obligatorias

**Regla 1:** getDefaultPropertyValue() DEBE usarse solo cuando hay @DefaultProperty decorator definido. Verificar resultado undefined antes de usar.

**Regla 2:** getUniquePropertyValue() DEBE usarse en delete() y update() para construir URL. NO usar getPrimaryPropertyValue() para URLs de API.

**Regla 3:** getFormattedValue() DEBE aplicarse en vistas de display (lista, detail read-only). NO aplicar en inputs editables (usar value original).

**Regla 4:** StringType DEBE consultarse solo para propiedades con tipo String. NO verificar StringType en propiedades Number/Boolean/Object/Array.

**Regla 5:** isReadOnly() con condition function DEBE reevaluarse cada vez que estado de entity cambia. NO cachear resultado.

**Regla 6:** ViewGroupRows DEBE usarse dentro de ViewGroups. Propiedades sin @ViewGroup NO deben consultar ViewGroupRow.

**Regla 7:** getArrayKeysOrdered() DEBE usarse para renderizar arrays. NO mezclar con getKeys() que retorna propiedades no-array.

**Regla 8:** isApiMethodAllowed() DEBE verificarse antes de ejecutar HTTP request. Si retorna false, NO ejecutar request.

**Regla 9:** isHideInDetailView() y isHideInListView() son independientes. Verificar decorator específico para cada vista, NO asumir que uno implica el otro.

**Regla 10:** getDisplayFormat() retorna type (function | string). getFormattedValue() ejecuta conversión. NO ejecutar format manualmente, usar getFormattedValue().

**Regla 11:** getTabOrders() define orden sugerido, NO fuerza rendering. Caller DEBE ordenar keys manualmente usando sort().

**Regla 12:** Multiple propiedades pueden tener mismo ViewGroupRow (múltiples TOP_LEFT en mismo grupo). Caller debe manejar rendering de múltiples items en misma posición.

## 7. Prohibiciones

**Prohibido:** Usar getDefaultPropertyValue() en operaciones CRUD. Default property es para display, NO para lógica de negocio. Usar getPrimaryPropertyValue() o getUniquePropertyValue().

**Prohibido:** Mezclar getPrimaryPropertyValue() y getUniquePropertyValue() en URLs de API. Siempre usar unique para delete()/update() endpoints.

**Prohibido:** Aplicar getFormattedValue() a inputs editables. Value formateado es string ('$99.99'), NO number (99.99). Input necesita value original para v-model.

**Prohibido:** Cachear resultado de isReadOnly() con condition function. Entity state puede cambiar, reevaluar cada render.

**Prohibido:** Asumir que StringType está definido para todas las propiedades string. Verificar undefined y aplicar fallback a StringType.TEXT.

**Prohibido:** Asumir que todas las propiedades tienen ViewGroup. Propiedades sin @ViewGroup deben renderizarse en sección default separada.

**Prohibido:** Usar getArrayKeysOrdered() para propiedades no-array. Método solo filtra arrays, propiedades normales deben usar getKeys().

**Prohibido:** Ejecutar HTTP request sin verificar isApiMethodAllowed(). Puede causar 405 Method Not Allowed error del servidor.

**Prohibido:** Asumir que isHideInDetailView() === !isHideInListView(). Son independientes, propiedad puede estar hidden en ambos o visible en ambos.

**Prohibido:** Modificar resultado de getFormattedValue() manualmente. Si formato no es correcto, arreglar @DisplayFormat decorator, NO post-procesar string.

**Prohibido:** Override métodos de metadata en subclases cambiando comportamiento fundamental. Metadata debe leer prototype consistentemente.

**Prohibido:** Asumir que TabOrder está definido para todas las propiedades. Propiedades sin @TabOrder tienen undefined, usar Number.MAX_SAFE_INTEGER como fallback en sort.

## 8. Dependencias

**Decoradores Especiales:**
- @DefaultProperty: Define propiedad representativa para display
- @PrimaryProperty: Define ID principal de entity
- @UniquePropertyKey: Define propiedad OID para URLs de API

**Decoradores de Display:**
- @DisplayFormat: Define función o template para formatear valores
- @StringType: Define tipo de input HTML para strings
- @HelpText: Define texto de ayuda para inputs

**Decoradores de Layout:**
- @ViewGroup: Define grupo lógico de propiedades
- @ViewGroupRow: Define posición en grid (TOP_LEFT, TOP_RIGHT, BOTTOM)
- @TabOrder: Define orden de navegación keyboard

**Decoradores de API:**
- @ApiEndpoint: Define URL base para CRUD operations
- @ApiMethods: Define array de HTTP methods permitidos
- @ReadOnly: Define propiedad como read-only con condición opcional

**Decoradores de Visibilidad:**
- @HideInDetailView: Oculta propiedad en vista de detalle
- @HideInListView: Oculta propiedad en vista de lista

**CRUD Operations:**
- save(): Usa getApiEndpoint() y isApiMethodAllowed('POST'/'PUT')
- delete(): Usa getUniquePropertyValue() y isApiMethodAllowed('DELETE')
- isNew(): Usa getPrimaryPropertyValue() para verificar si === undefined

**UI Components:**
- DefaultDetailView: Usa getViewGroups/getViewGroupRows/getTabOrders/isHideInDetailView
- DefaultListView: Usa getFormattedValue/isHideInListView
- TextInputComponent: Usa getStringType/getHelpText/isReadOnly
- useInputMetadata: Integra getHelpText/isReadOnly/getStringType

**Metadata Access Methods:**
- getKeys(): Usado por isHideInDetailView/isHideInListView para filtrar
- getArrayKeys(): Usado por getArrayKeysOrdered() para obtener arrays

**Application Singleton:**
- Application.ApplicationUIService: Muestra error cuando isApiMethodAllowed() retorna false

## 9. Relaciones

**Relación con CRUD Operations (N:1):**
Multiple CRUD methods (save, update, delete, isNew) consultan metadata methods (getUniquePropertyValue, getPrimaryPropertyValue, getApiEndpoint, isApiMethodAllowed).

**Relación con DefaultDetailView (1:N):**
DefaultDetailView consulta múltiples metadata methods una vez por render: getViewGroups, getViewGroupRows, getTabOrders, isHideInDetailView, isReadOnly, getStringType, getHelpText.

**Relación con DefaultListView (1:N):**
DefaultListView consulta getFormattedValue N veces (una por celda), isHideInListView M veces (una por columna).

**Relación con useInputMetadata (N:1):**
Múltiples input components usan useInputMetadata → useInputMetadata consulta getHelpText, isReadOnly, getStringType una vez por input.

**Relación entre getDisplayFormat y getFormattedValue (1:1 secuencial):**
getFormattedValue llama getDisplayFormat internamente → getDisplayFormat retorna format → getFormattedValue ejecuta format.

**Relación entre getViewGroups y getViewGroupRows (1:1 paired):**
ViewGroupRows solo tiene sentido dentro de ViewGroups. Ambos deben consultarse juntos para construir layout 2D.

**Relación entre getPrimaryPropertyValue y getUniquePropertyValue (1:1 conceptual, valores pueden diferir):**
Ambos son identifiers, pero primary para lógica interna (isNew), unique para API (delete). Pueden apuntar a propiedades diferentes.

**Relación con isReadOnly condition function (N:1 runtime):**
Multiple propiedades pueden tener conditions → Todas evalúan contra misma instancia entity → Entity state cambia → Reevaluar todas las conditions.

## 10. Notas de Implementación

### Ejemplo Completo: Metadata Completa End-to-End

```typescript
// ========================================
// 1. Definir Entidad con Metadata Completa
// ========================================

import ProductDashboard from './ProductDashboard.vue';

@Persistent()
@ApiEndpoint('/api/orders')
@ApiMethods(['GET', 'POST', 'PUT'])
@ModuleName('Order', 'Orders')
@UniquePropertyKey('orderId')
export class Order extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('Order ID', Number)
    @HideInDetailView()
    orderId?: number;
    
    @DefaultProperty()
    @PropertyName('Order Number', String)
    @ViewGroup('Order Information')
    @ViewGroupRow(ViewGroupRow.TOP_LEFT)
    @TabOrder(1)
    @ReadOnly()
    orderNumber!: string;
    
    @PropertyName('Total', Number)
    @DisplayFormat((value) => `$${value.toFixed(2)}`)
    @ViewGroup('Order Information')
    @ViewGroupRow(ViewGroupRow.TOP_RIGHT)
    @TabOrder(2)
    total!: number;
    
    @PropertyName('Customer Email', String)
    @StringType(StringType.EMAIL)
    @ViewGroup('Customer Information')
    @ViewGroupRow(ViewGroupRow.TOP_LEFT)
    @TabOrder(3)
    @HelpText('Email para notificaciones')
    customerEmail!: string;
    
    @PropertyName('Status', String)
    @ViewGroup('Order Information')
    @ViewGroupRow(ViewGroupRow.BOTTOM)
    @ReadOnly({ condition: (entity) => entity.status === 'completed' })
    @TabOrder(4)
    status!: string;
    
    @PropertyName('Notes', String)
    @StringType(StringType.TEXTAREA)
    @ViewGroup('Additional Information')
    @HideInListView()
    @TabOrder(5)
    notes!: string;
    
    @PropertyName('Items', Array)
    @ArrayElementType(OrderItem)
    @TabOrder(10)
    items!: OrderItem[];
}

// ========================================
// 2. Crear Instancia y Consultar Metadata
// ========================================

const order = new Order({
    orderId: 100,
    orderNumber: 'ORD-2024-100',
    total: 500,
    customerEmail: 'customer@example.com',
    status: 'pending',
    notes: 'Urgent order',
    items: []
});

// Propiedades especiales
console.log(order.getPrimaryPropertyValue());  // 100
console.log(order.getUniquePropertyValue());   // 100
console.log(order.getDefaultPropertyValue());  // 'ORD-2024-100'

// Display format
console.log(order.getFormattedValue('total')); 
// '$500.00'

// String types
const stringTypes = order.getStringType();
console.log(stringTypes.customerEmail);        
// StringType.EMAIL

console.log(stringTypes.notes);                
// StringType.TEXTAREA

// Help text
console.log(order.getHelpText('customerEmail'));
// 'Email para notificaciones'

// View groups
const groups = order.getViewGroups();
console.log(groups);
// {
//   orderNumber: 'Order Information',
//   total: 'Order Information',
//   customerEmail: 'Customer Information',
//   status: 'Order Information',
//   notes: 'Additional Information'
// }

// View group rows
const rows = order.getViewGroupRows();
console.log(rows);
// {
//   orderNumber: ViewGroupRow.TOP_LEFT,
//   total: ViewGroupRow.TOP_RIGHT,
//   customerEmail: ViewGroupRow.TOP_LEFT,
//   status: ViewGroupRow.BOTTOM
// }

// Tab orders
const tabOrders = order.getTabOrders();
console.log(tabOrders);
// { orderNumber: 1, total: 2, customerEmail: 3, status: 4, notes: 5, items: 10 }

// Arrays ordenados
const arrayKeys = order.getArrayKeysOrdered();
console.log(arrayKeys);
// ['items']

// Read-only
console.log(order.isReadOnly('orderNumber'));  
// true (incondicional)

console.log(order.isReadOnly('status'));       
// false (status !== 'completed')

order.status = 'completed';
console.log(order.isReadOnly('status'));       
// true (ahora es read-only condicional)

// API methods
console.log(order.isApiMethodAllowed('GET'));    
// true

console.log(order.isApiMethodAllowed('DELETE')); 
// false (no en @ApiMethods)

// Visibilidad
console.log(order.isHideInDetailView('orderId')); 
// true

console.log(order.isHideInListView('notes'));     
// true

// ========================================
// 3. Usar en DefaultDetailView
// ========================================

const renderDetailView = () => {
    const groups = order.getViewGroups();
    const rows = order.getViewGroupRows();
    const tabOrders = order.getTabOrders();
    
    // Agrupar propiedades
    const groupedProps: Record<string, Record<ViewGroupRow, string[]>> = {};
    
    Object.entries(groups).forEach(([key, group]) => {
        if (!groupedProps[group]) {
            groupedProps[group] = {
                [ViewGroupRow.TOP_LEFT]: [],
                [ViewGroupRow.TOP_RIGHT]: [],
                [ViewGroupRow.BOTTOM]: []
            };
        }
        
        const row = rows[key] || ViewGroupRow.BOTTOM;
        groupedProps[group][row].push(key);
    });
    
    // Renderizar
    for (const [groupName, rowData] of Object.entries(groupedProps)) {
        console.log(`Group: ${groupName}`);
        
        console.log('  Row (2 cols):');
        console.log('    Left:', rowData[ViewGroupRow.TOP_LEFT]);
        console.log('    Right:', rowData[ViewGroupRow.TOP_RIGHT]);
        
        console.log('  Row (full):');
        console.log('    Bottom:', rowData[ViewGroupRow.BOTTOM]);
    }
};

renderDetailView();
// Output:
// Group: Order Information
//   Row (2 cols):
//     Left: ['orderNumber']
//     Right: ['total']
//   Row (full):
//     Bottom: ['status']
// Group: Customer Information
//   Row (2 cols):
//     Left: ['customerEmail']
//     Right: []
//   Row (full):
//     Bottom: []
// Group: Additional Information
//   Row (2 cols):
//     Left: []
//     Right: []
//   Row (full):
//     Bottom: ['notes']
```

### Consideración: Diferencia Primary vs Unique en CRUD

```typescript
@UniquePropertyKey('invoiceNumber')
export class Invoice extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('ID', Number)
    id?: number;  // ID interno autoincremental
    
    @PropertyName('Invoice Number', String)
    invoiceNumber!: string;  // ID público 'INV-2024-001'
}

const invoice = new Invoice({ 
    id: 5, 
    invoiceNumber: 'INV-2024-001' 
});

// isNew() usa PRIMARY
console.log(invoice.isNew());
// false (id !== undefined)

// delete() usa UNIQUE
await invoice.delete();
// DELETE /api/invoices/INV-2024-001
// (usa invoiceNumber, NO id)

// getElement usa UNIQUE
const loaded = await Invoice.getElement('INV-2024-001');
// GET /api/invoices/INV-2024-001
```

### Consideración: DisplayFormat Function vs String Template

```typescript
export class Product extends BaseEntity {
    // Formato con función (máxima flexibilidad)
    @PropertyName('Price', Number)
    @DisplayFormat((value) => {
        if (value === 0) return 'Free';
        if (value < 0) return `($${Math.abs(value).toFixed(2)})`;
        return `$${value.toFixed(2)}`;
    })
    price!: number;
    
    // Formato con string template (simple)
    @PropertyName('Stock', Number)
    @DisplayFormat('{value} units available')
    stock!: number;
}

const product = new Product({ price: -10, stock: 50 });

console.log(product.getFormattedValue('price'));
// '($10.00)' (función evalúa value < 0)

console.log(product.getFormattedValue('stock'));
// '50 units available' (template sustituye {value})
```

### Consideración: StringType y Renderizado de Inputs

```typescript
const stringTypes = entity.getStringType();

const renderInput = (key: string) => {
    const type = stringTypes[key] || StringType.TEXT;
    
    switch (type) {
        case StringType.EMAIL:
            return `<input type="email" />`;
        
        case StringType.PASSWORD:
            return `<input type="password" />`;
        
        case StringType.URL:
            return `<input type="url" />`;
        
        case StringType.TELEPHONE:
            return `<input type="tel" />`;
        
        case StringType.TEXTAREA:
            return `<textarea></textarea>`;
        
        case StringType.TEXT:
        default:
            return `<input type="text" />`;
    }
};
```

### Pattern: Construcción Dinámica de Layout con ViewGroups

```vue
<script setup>
const entity = ref(new Order({...}));

const groups = entity.value.getViewGroups();
const rows = entity.value.getViewGroupRows();

// Agrupar dinámicamente
const layoutStructure = computed(() => {
    const result: Record<string, { topLeft: string[], topRight: string[], bottom: string[] }> = {};
    
    Object.entries(groups).forEach(([key, group]) => {
        if (!result[group]) {
            result[group] = { topLeft: [], topRight: [], bottom: [] };
        }
        
        const row = rows[key];
        if (row === ViewGroupRow.TOP_LEFT) {
            result[group].topLeft.push(key);
        } else if (row === ViewGroupRow.TOP_RIGHT) {
            result[group].topRight.push(key);
        } else {
            result[group].bottom.push(key);
        }
    });
    
    return result;
});
</script>

<template>
    <div v-for="(layout, groupName) in layoutStructure" :key="groupName" class="view-group">
        <h3>{{ groupName }}</h3>
        
        <div class="row">
            <div class="col-md-6">
                <InputComponent 
                    v-for="key in layout.topLeft" 
                    :key="key"
                    :property-key="key"
                />
            </div>
            <div class="col-md-6">
                <InputComponent 
                    v-for="key in layout.topRight" 
                    :key="key"
                    :property-key="key"
                />
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <InputComponent 
                    v-for="key in layout.bottom" 
                    :key="key"
                    :property-key="key"
                />
            </div>
        </div>
    </div>
</template>
```

### Pattern: Reactive Read-Only con Condition Function

```vue
<script setup>
const entity = ref(new Invoice({ status: 'pending', amount: 500 }));

// Reactividad: cuando entity.status cambia, isReadOnly reevalúa
const isAmountReadOnly = computed(() => entity.value.isReadOnly('amount'));

const changeStatus = (newStatus: string) => {
    entity.value.status = newStatus;
    // isAmountReadOnly automáticamente actualiza debido a computed()
};
</script>

<template>
    <input 
        v-model="entity.amount" 
        :readonly="isAmountReadOnly"
        :class="{ 'readonly-input': isAmountReadOnly }"
    />
    
    <select v-model="entity.status" @change="changeStatus(entity.status)">
        <option>pending</option>
        <option>paid</option>
        <option>cancelled</option>
    </select>
</template>
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- base-entity-core.md: Arquitectura general de BaseEntity
- metadata-access.md: Métodos principales de metadata (getProperties, getKeys, etc.)
- static-methods.md: Versiones estáticas de métodos (getPropertyNameByKey, etc.)
- crud-operations.md: Uso de getUniquePropertyValue en delete/update, isApiMethodAllowed en save/delete
- state-and-conversion.md: isNew() usa getPrimaryPropertyValue()
- ../01-decorators/default-property-decorator.md: @DefaultProperty
- ../01-decorators/primary-property-decorator.md: @PrimaryProperty
- ../01-decorators/display-format-decorator.md: @DisplayFormat
- ../01-decorators/string-type-decorator.md: @StringType
- ../01-decorators/view-group-decorator.md: @ViewGroup
- ../01-decorators/view-group-row-decorator.md: @ViewGroupRow
- ../01-decorators/tab-order-decorator.md: @TabOrder
- ../01-decorators/readonly-decorator.md: @ReadOnly
- ../01-decorators/api-methods-decorator.md: @ApiMethods
- ../01-decorators/hide-in-detail-view-decorator.md: @HideInDetailView
- ../01-decorators/hide-in-list-view-decorator.md: @HideInListView
- ../06-composables/useInputMetadata.md: Integración de metadata en inputs

**Archivos fuente:**
- src/entities/base_entity.ts: Implementación de todos los métodos (líneas 232-466)
- src/views/default_listview.vue: Uso de getFormattedValue/isHideInListView
- src/views/default_detailview.vue: Uso de getViewGroups/getViewGroupRows/getTabOrders/isHideInDetailView
- src/composables/useInputMetadata.ts: Uso de getStringType/getHelpText/isReadOnly
- src/components/Form/TextInputComponent.vue: Uso de StringType para determinar input type

**Líneas relevantes en código:**
- Línea 232: getDefaultPropertyValue()
- Línea 240: getPrimaryPropertyValue()
- Línea 248: getPrimaryPropertyKey()
- Línea 252: getUniquePropertyValue()
- Línea 260: getUniquePropertyKey()
- Línea 264: getStringType()
- Línea 371: getDisplayFormat()
- Línea 377: getFormattedValue()
- Línea 393: getHelpText()
- Línea 277: getViewGroups()
- Línea 282: getViewGroupRows()
- Línea 399: getTabOrders()
- Línea 404: getArrayKeysOrdered()
- Línea 416: getApiEndpoint() (static)
- Línea 420: getApiEndpoint() (instancia)
- Línea 424: isReadOnly()
- Línea 440: getApiMethods() (static)
- Línea 444: getApiMethods() (instancia)
- Línea 452: isApiMethodAllowed() (static)
- Línea 456: isApiMethodAllowed() (instancia)
- Línea 460: isHideInDetailView()
- Línea 466: isHideInListView()

**Última actualización:** 11 de Febrero, 2026
