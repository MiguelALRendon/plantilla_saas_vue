# 🔍 BaseEntity - Métodos de Metadata Adicionales

**Referencias:**
- `base-entity-core.md` - Conceptos básicos de BaseEntity
- `metadata-access.md` - Métodos principales de metadata
- `static-methods.md` - Métodos estáticos de metadata
- `../../01-decorators/` - Todos los decoradores

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts`  
**Clase:** `export abstract class BaseEntity`

---

## 🎯 Propósito

Este documento cubre métodos de metadata de BaseEntity que complementan los ya documentados en `metadata-access.md`. Incluye:

1. **Metadata de propiedades individuales** - Default, Primary, Unique
2. **Metadata de formato y display** - DisplayFormat, StringType
3. **Metadata de UI** - ViewGroup, ViewGroupRow, TabOrder
4. **Metadata de API** - ApiEndpoint, ApiMethods, ReadOnly
5. **Metadata de visibilidad** - HideInDetailView, HideInListView
6. **Utilidades de ordenamiento** - getArrayKeysOrdered

---

## 🔑 Métodos de Propiedades Especiales

### getDefaultPropertyValue()

```typescript
public getDefaultPropertyValue(): any
```

**Propósito:** Obtiene el valor de la propiedad marcada con `@DefaultProperty()`.

**Retorna:** Valor de la propiedad default o `undefined`

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

// Usado en displays donde solo se muestra un campo
console.log(`Product: ${product.getDefaultPropertyValue()}`);
// Output: "Product: Widget"
```

**Uso en DefaultListView:**

```typescript
// Mostrar valor por defecto en lista
const displayValue = entity.getDefaultPropertyValue();
```

---

### getPrimaryPropertyValue()

```typescript
public getPrimaryPropertyValue(): any
```

**Propósito:** Obtiene el valor de la propiedad marcada con `@PrimaryProperty()`.

**Retorna:** Valor de la primary property o `undefined`

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

// Verificar si es entidad nueva
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

---

### getPrimaryPropertyKey()

```typescript
public getPrimaryPropertyKey(): string | undefined
```

**Propósito:** Obtiene el nombre de la propiedad marcada con `@PrimaryProperty()`.

**Retorna:** Nombre de la propiedad o `undefined`

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

// Acceder dinámicamente a primary value
const primaryValue = order[primaryKey!];
console.log(primaryValue); // 100
```

---

### getUniquePropertyValue()

```typescript
public getUniquePropertyValue(): any
```

**Propósito:** Obtiene el valor de la propiedad marcada con `@UniquePropertyKey()`. Esta es la clave única usada en APIs (OID - Object ID).

**Retorna:** Valor de la unique property o `undefined`

**Ubicación:** Línea 252

**Ejemplo:**

```typescript
@ModuleName('Customer', 'Customers')
@UniquePropertyKey('customerId')
export class Customer extends BaseEntity {
    @PropertyName('Customer ID', String)
    customerId?: string;
    
    @PropertyName('Name', String)
    name!: string;
}

const customer = new Customer({ customerId: 'CUST-001', name: 'Acme Corp' });

const uniqueValue = customer.getUniquePropertyValue();
console.log(uniqueValue); // 'CUST-001'
```

**Uso en delete():**

```typescript
// base_entitiy.ts - Línea 821
const uniqueKey = this.getUniquePropertyValue();
await Application.axiosInstance.delete(`${endpoint}/${uniqueKey}`);
```

**Diferencia con getPrimaryPropertyValue():**

- **Primary:** Propiedad conceptual (ID interno)
- **Unique:** Clave única para API/BD (puede ser diferente)

```typescript
export class Invoice extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('ID', Number)
    id?: number;  // Primary (autoincremental interno)
    
    @PropertyName('Invoice Number', String)
    @UniquePropertyKey('invoiceNumber')
    invoiceNumber!: string;  // Unique (INV-2024-001)
}

const invoice = new Invoice({ id: 5, invoiceNumber: 'INV-2024-001' });

console.log(invoice.getPrimaryPropertyValue());  // 5
console.log(invoice.getUniquePropertyValue());  // 'INV-2024-001'

// APIs usan invoiceNumber (unique), no id (primary)
await invoice.delete();
// DELETE /api/invoices/INV-2024-001 (no /api/invoices/5)
```

---

### getUniquePropertyKey()

```typescript
public getUniquePropertyKey(): string | undefined
```

**Propósito:** Obtiene el nombre de la propiedad marcada como única.

**Retorna:** Nombre de la propiedad o `undefined`

**Ubicación:** Línea 260

**Ejemplo:**

```typescript
const uniqueKey = customer.getUniquePropertyKey();
console.log(uniqueKey); // 'customerId'
```

---

## 🎨 Métodos de Display y Formato

### getStringType()

```typescript
public getStringType(): Record<string, StringType>
```

**Propósito:** Obtiene el mapa de `@StringType()` de todas las propiedades de texto.

**Retorna:** Objeto con StringType por propiedad (default: `StringType.TEXT`)

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

// Usar para renderizar input correcto
Object.keys(stringTypes).forEach(key => {
    const type = stringTypes[key];
    
    switch (type) {
        case StringType.EMAIL:
            renderEmailInput(key);
            break;
        case StringType.PASSWORD:
            renderPasswordInput(key);
            break;
        case StringType.TEXTAREA:
            renderTextArea(key);
            break;
        // ...
    }
});
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
</script>

<template>
    <input :type="inputType" v-model="entity[propertyKey]" />
</template>
```

---

### getDisplayFormat()

```typescript
public getDisplayFormat(propertyKey: string): DisplayFormatValue | undefined
```

**Propósito:** Obtiene el formato de display definido por `@DisplayFormat()`.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad

**Retorna:** Función o string de formato, o `undefined`

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
console.log(priceFormat);  // function

const stockFormat = product.getDisplayFormat('stock');
console.log(stockFormat);  // '{value} units'
```

---

### getFormattedValue()

```typescript
public getFormattedValue(propertyKey: string): string
```

**Propósito:** Aplica el formato de `@DisplayFormat()` al valor de la propiedad.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad

**Retorna:** Valor formateado como string

**Ubicación:** Línea 377

**Ejemplo:**

```typescript
const product = new Product({ price: 99.99, stock: 50, discount: 0.15 });

// Con @DisplayFormat function
console.log(product.getFormattedValue('price'));
// '$99.99'

// Con @DisplayFormat string template
console.log(product.getFormattedValue('stock'));
// '50 units'

// Con @DisplayFormat function
console.log(product.getFormattedValue('discount'));
// '15%'

// Sin @DisplayFormat
console.log(product.getFormattedValue('name'));
// 'Widget' (valor original)
```

**Uso en DefaultListView:**

```vue
<template>
    <tr v-for="entity in entities" :key="entity.getUniquePropertyValue()">
        <td v-for="key in keys" :key="key">
            {{ entity.getFormattedValue(key) }}
        </td>
    </tr>
</template>
```

**Implementación interna:**

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

---

### getHelpText()

```typescript
public getHelpText(propertyKey: string): string | undefined
```

**Propósito:** Obtiene el texto de ayuda definido por `@HelpText()`.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad

**Retorna:** Texto de ayuda o `undefined`

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

**Uso ya documentado en useInputMetadata composable.**

---

## 📋 Métodos de UI Layout

### getViewGroups()

```typescript
public getViewGroups(): Record<string, string>
```

**Propósito:** Obtiene el mapa de grupos de vista definidos por `@ViewGroup()`.

**Retorna:** Objeto con nombres de grupo por propiedad

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

// Agrupar propiedades para renderizado
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
```

---

### getViewGroupRows()

```typescript
public getViewGroupRows(): Record<string, ViewGroupRow>
```

**Propósito:** Obtiene el mapa de posiciones de fila definidas por `@ViewGroupRow()`.

**Retorna:** Objeto con `ViewGroupRow` por propiedad

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

**Uso en layout de formulario:**

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
```

---

### getTabOrders()

```typescript
public getTabOrders(): Record<string, number>
```

**Propósito:** Obtiene el mapa de orden de tabulación definido por `@TabOrder()`.

**Retorna:** Objeto con índice de tab order por propiedad

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

// Ordenar propiedades por tab order
const keys = Object.keys(tabOrders).sort((a, b) => {
    return tabOrders[a] - tabOrders[b];
});

console.log(keys);
// ['username', 'email', 'password']
```

**Uso en renderizado de formulario:**

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

---

### getArrayKeysOrdered()

```typescript
public getArrayKeysOrdered(): string[]
```

**Propósito:** Obtiene las propiedades de tipo Array ordenadas por `@TabOrder()`.

**Retorna:** Array de nombres de propiedades array ordenadas

**Ubicación:** Línea 404

**Ejemplo:**

```typescript
export class Order extends BaseEntity {
    @PropertyName('Order Items', Array)
    @ArrayElementType(OrderItem)
    @TabOrder(2)
    items!: OrderItem[];
    
    @PropertyName('Shipping Addresses', Array)
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
    <!-- Primero renderizar propiedades normales -->
    <div v-for="key in entity.getKeys()" :key="key">
        <InputComponent :property-key="key" />
    </div>
    
    <!-- Luego renderizar arrays ordenados -->
    <div v-for="key in entity.getArrayKeysOrdered()" :key="key">
        <ArrayInputComponent :property-key="key" />
    </div>
</template>
```

**Implementación interna:**

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

---

## 🌐 Métodos de API y Visibilidad

### getApiEndpoint()

```typescript
public getApiEndpoint(): string | undefined
```

**Propósito:** Obtiene el endpoint de API definido por `@ApiEndpoint()`.

**Retorna:** URL del endpoint o `undefined`

**Ubicación:** Línea 420 (método de instancia), Línea 416 (método estático)

**Ejemplo:**

```typescript
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    // ...
}

const product = new Product({});
console.log(product.getApiEndpoint());  // '/api/products'

// También disponible como método estático
console.log(Product.getApiEndpoint());  // '/api/products'
```

**Uso en CRUD:**

```typescript
// save() - Línea 744
const endpoint = this.getApiEndpoint();
const response = await Application.axiosInstance.post(endpoint!, dataToSend);
```

---

### isReadOnly()

```typescript
public isReadOnly(propertyKey: string): boolean
```

**Propósito:** Verifica si una propiedad tiene `@ReadOnly()`.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad

**Retorna:** `true` si es read-only, `false` si no

**Ubicación:** Línea 424

**Ejemplo:**

```typescript
export class Invoice extends BaseEntity {
    @PropertyName('Invoice Number', String)
    @ReadOnly()
    invoiceNumber!: string;
    
    @PropertyName('Status', String)
    @ReadOnly({ condition: (entity) => entity.status === 'paid' })
    status!: string;
    
    @PropertyName('Notes', String)
    notes!: string;
}

const invoice = new Invoice({ invoiceNumber: 'INV-001', status: 'pending', notes: '' });

console.log(invoice.isReadOnly('invoiceNumber')); // true
console.log(invoice.isReadOnly('status'));        // false (status no es 'paid')
console.log(invoice.isReadOnly('notes'));         // false

// Cambiar estado
invoice.status = 'paid';
console.log(invoice.isReadOnly('status'));        // true (ahora es read-only)
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

---

### getApiMethods()

```typescript
public getApiMethods(): HttpMethod[] | undefined
// static getApiMethods(): HttpMethod[] | undefined
```

**Propósito:** Obtiene los métodos HTTP permitidos definidos por `@ApiMethods()`.

**Retorna:** Array de métodos HTTP o `undefined` (si undefined, todos están permitidos)

**Ubicación:** Línea 440 (estático), Línea 444 (instancia)

**Ejemplo:**

```typescript
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT'])  // DELETE no permitido
export class Product extends BaseEntity {
    // ...
}

const product = new Product({});
const methods = product.getApiMethods();
console.log(methods); // ['GET', 'POST', 'PUT']
```

---

### isApiMethodAllowed()

```typescript
public isApiMethodAllowed(method: HttpMethod): boolean
// static isApiMethodAllowed(method: HttpMethod): boolean
```

**Propósito:** Verifica si un método HTTP específico está permitido.

**Parámetros:**
- `method: HttpMethod` - Método HTTP a verificar ('GET', 'POST', 'PUT', 'DELETE')

**Retorna:** `true` si está permitido, `false` si no

**Ubicación:** Línea 452 (estático), Línea 456 (instancia)

**Ejemplo:**

```typescript
@ApiMethods(['GET', 'POST', 'PUT'])
export class Product extends BaseEntity {
    // ...
}

const product = new Product({});

console.log(product.isApiMethodAllowed('GET'));    // true
console.log(product.isApiMethodAllowed('POST'));   // true
console.log(product.isApiMethodAllowed('PUT'));    // true
console.log(product.isApiMethodAllowed('DELETE')); // false
```

**Uso en delete():**

```typescript
// base_entitiy.ts - Línea 808
if (!this.validateApiMethod('DELETE')) {
    return;
}
```

---

### isHideInDetailView()

```typescript
public isHideInDetailView(propertyKey: string): boolean
```

**Propósito:** Verifica si una propiedad debe ocultarse en vista de detalle (`@HideInDetailView()`).

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad

**Retorna:** `true` si debe ocultarse, `false` si debe mostrarse

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

---

### isHideInListView()

```typescript
public isHideInListView(propertyKey: string): boolean
```

**Propósito:** Verifica si una propiedad debe ocultarse en vista de lista (`@HideInListView()`).

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad

**Retorna:** `true` si debe ocultarse en lista, `false` si debe mostrarse

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

---

## 📋 Ejemplo Completo: Metadata Avanzada

```typescript
// ========================================
// 1. Definir Entidad con Metadata Completa
// ========================================

@ModuleName('Order', 'Orders')
@ApiEndpoint('/api/orders')
@ApiMethods(['GET', 'POST', 'PUT'])  // Sin DELETE
export class Order extends BaseEntity {
    // Primary y Unique
    @PrimaryProperty()
    @UniquePropertyKey('orderId')
    @PropertyName('Order ID', Number)
    @HideInDetailView()
    orderId?: number;
    
    // Default property
    @DefaultProperty()
    @PropertyName('Order Number', String)
    @ViewGroup('Order Information')
    @ViewGroupRow(ViewGroupRow.TOP_LEFT)
    @TabOrder(1)
    @ReadOnly()
    orderNumber!: string;
    
    // Display format
    @PropertyName('Total', Number)
    @DisplayFormat((value) => `$${value.toFixed(2)}`)
    @ViewGroup('Order Information')
    @ViewGroupRow(ViewGroupRow.TOP_RIGHT)
    @TabOrder(2)
    total!: number;
    
    // StringType
    @PropertyName('Customer Email', String)
    @StringType(StringType.EMAIL)
    @ViewGroup('Customer Information')
    @ViewGroupRow(ViewGroupRow.TOP_LEFT)
    @TabOrder(3)
    @HelpText('Email para notificaciones')
    customerEmail!: string;
    
    // Conditional read-only
    @PropertyName('Status', String)
    @ViewGroup('Order Information')
    @ViewGroupRow(ViewGroupRow.BOTTOM)
    @ReadOnly({ condition: (entity) => entity.status === 'completed' })
    @TabOrder(4)
    status!: string;
    
    // Hidden in list
    @PropertyName('Notes', String)
    @StringType(StringType.TEXTAREA)
    @ViewGroup('Additional Information')
    @HideInListView()
    @TabOrder(5)
    notes!: string;
    
    // Arrays ordenados
    @PropertyName('Items', Array)
    @ArrayElementType(OrderItem)
    @TabOrder(10)
    items!: OrderItem[];
    
    @PropertyName('Attachments', Array)
    @TabOrder(11)
    attachments!: string[];
}

// ========================================
// 2. Usar Metadata
// ========================================

const order = new Order({
    orderId: 100,
    orderNumber: 'ORD-2024-100',
    total: 500,
    customerEmail: 'customer@example.com',
    status: 'pending',
    notes: 'Urgent order',
    items: [],
    attachments: []
});

// Primary y Unique
console.log(order.getPrimaryPropertyValue());  // 100
console.log(order.getUniquePropertyValue());   // 100
console.log(order.getDefaultPropertyValue());  // 'ORD-2024-100'

// Display format
console.log(order.getFormattedValue('total')); // '$500.00'

// String types
const stringTypes = order.getStringType();
console.log(stringTypes.customerEmail);        // StringType.EMAIL

// View groups
const groups = order.getViewGroups();
console.log(groups.orderNumber);               // 'Order Information'
console.log(groups.customerEmail);             // 'Customer Information'

// View group rows
const rows = order.getViewGroupRows();
console.log(rows.orderNumber);                 // ViewGroupRow.TOP_LEFT
console.log(rows.total);                       // ViewGroupRow.TOP_RIGHT

// Tab orders
const tabOrders = order.getTabOrders();
console.log(tabOrders.orderNumber);            // 1
console.log(tabOrders.total);                  // 2

// Arrays ordenados
const arrayKeys = order.getArrayKeysOrdered();
console.log(arrayKeys);                        // ['items', 'attachments']

// Read-only
console.log(order.isReadOnly('orderNumber'));  // true
console.log(order.isReadOnly('status'));       // false

order.status = 'completed';
console.log(order.isReadOnly('status'));       // true (ahora es read-only)

// API methods
console.log(order.isApiMethodAllowed('GET'));    // true
console.log(order.isApiMethodAllowed('DELETE')); // false

// Visibilidad
console.log(order.isHideInDetailView('orderId')); // true
console.log(order.isHideInListView('notes'));     // true
```

---

## 🔗 Referencias

- **Base Entity Core:** `base-entity-core.md`
- **Metadata Access:** `metadata-access.md`
- **Static Methods:** `static-methods.md`
- **All Decorators:** `../../01-decorators/`
- **useInputMetadata:** `../../06-composables/useInputMetadata.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Archivo fuente:** `src/entities/base_entitiy.ts`  
**Estado:** ✅ Completo
