# 🔑 BaseEntity - Métodos de Persistencia

**Referencias:**
- `base-entity-core.md` - Conceptos básicos de BaseEntity
- `crud-operations.md` - Operaciones CRUD
- `../../01-decorators/persistent-key-decorator.md` - Decorador @PersistentKey
- `../../03-application/application-singleton.md` - Comunicación con API

---

## 📍 Ubicación en el Código

**Archivo:** `src/entities/base_entitiy.ts` (líneas 512-548)  
**Clase:** `export abstract class BaseEntity`

---

## 🎯 Propósito

Los **métodos de persistencia** gestionan la conversión entre las claves de propiedades internas (camelCase) y las claves persistentes (snake_case, nombres de API, etc.) definidas por el decorador `@PersistentKey`.

**Concepto fundamental:**  
> Tu entidad usa nombres internos (`firstName`, `productName`) pero la API espera otros nombres (`first_name`, `product_name`). Estos métodos transforman automáticamente entre ambos formatos.

---

## 🔧 Métodos Estáticos

### getPersistentKeys()

```typescript
public static getPersistentKeys(): Record<string, string>
```

**Propósito:** Obtiene el mapa completo de claves persistentes definidas por `@PersistentKey()`.

**Retorna:** Objeto donde las keys son nombres de propiedad y los valores son nombres persistentes.

**Ubicación:** Línea 512

**Ejemplo:**

```typescript
@ModuleName('User', 'Users')
export class User extends BaseEntity {
    @PropertyName('First Name', String)
    @PersistentKey('first_name')
    firstName!: string;
    
    @PropertyName('Last Name', String)
    @PersistentKey('last_name')
    lastName!: string;
    
    @PropertyName('Email', String)
    @PersistentKey('email_address')
    email!: string;
}

const persistentKeys = User.getPersistentKeys();
console.log(persistentKeys);
// Salida:
// {
//   firstName: 'first_name',
//   lastName: 'last_name',
//   email: 'email_address'
// }
```

---

### getPersistentKeyByPropertyKey()

```typescript
public static getPersistentKeyByPropertyKey(propertyKey: string): string | undefined
```

**Propósito:** Convierte una clave de propiedad interna a su clave persistente.

**Parámetros:**
- `propertyKey: string` - Nombre de la propiedad interna

**Retorna:** Nombre persistente o `undefined` si no tiene @PersistentKey

**Ubicación:** Línea 516

**Ejemplo:**

```typescript
// Usando la clase User del ejemplo anterior
const persistentKey = User.getPersistentKeyByPropertyKey('firstName');
console.log(persistentKey); // 'first_name'

const emailKey = User.getPersistentKeyByPropertyKey('email');
console.log(emailKey); // 'email_address'

// Si no tiene @PersistentKey
const undefinedKey = User.getPersistentKeyByPropertyKey('someProperty');
console.log(undefinedKey); // undefined
```

---

### getPropertyKeyByPersistentKey()

```typescript
public static getPropertyKeyByPersistentKey(persistentKey: string): string | undefined
```

**Propósito:** Convierte una clave persistente a su nombre de propiedad interno (operación inversa).

**Parámetros:**
- `persistentKey: string` - Nombre persistente (de la API)

**Retorna:** Nombre de propiedad interno o `undefined` si no existe

**Ubicación:** Línea 520

**Ejemplo:**

```typescript
// Recibiendo datos de la API
const apiKey = 'first_name';
const propertyKey = User.getPropertyKeyByPersistentKey(apiKey);
console.log(propertyKey); // 'firstName'

const emailProp = User.getPropertyKeyByPersistentKey('email_address');
console.log(emailProp); // 'email'

// Si no existe
const unknownProp = User.getPropertyKeyByPersistentKey('unknown_field');
console.log(unknownProp); // undefined
```

**Implementación interna:**

```typescript
public static getPropertyKeyByPersistentKey(persistentKey: string): string | undefined {
    const persistentKeys = this.getPersistentKeys();
    for (const [key, value] of Object.entries(persistentKeys)) {
        if (value === persistentKey) {
            return key;
        }
    }
    return undefined;
}
```

---

### mapToPersistentKeys()

```typescript
public static mapToPersistentKeys<T extends BaseEntity>(
    this: new (...args: any[]) => T, 
    data: Record<string, any>
): Record<string, any>
```

**Propósito:** Convierte un objeto completo de formato interno a formato persistente (para enviar a API).

**Parámetros:**
- `data: Record<string, any>` - Objeto con claves internas

**Retorna:** Objeto con claves persistentes

**Ubicación:** Línea 524

**Ejemplo:**

```typescript
// Objeto con nombres internos
const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 30  // Sin @PersistentKey, se mantiene igual
};

// Convertir a formato API
const apiData = User.mapToPersistentKeys(userData);
console.log(apiData);
// Salida:
// {
//   first_name: 'John',
//   last_name: 'Doe',
//   email_address: 'john@example.com',
//   age: 30
// }
```

**Uso real en save():**

```typescript
// En BaseEntity.save() - Línea 747
const dataToSend = this.mapToPersistentKeys(this.toObject());
const response = await Application.axiosInstance.post(endpoint!, dataToSend);
```

**Implementación interna:**

```typescript
public static mapToPersistentKeys<T extends BaseEntity>(
    this: new (...args: any[]) => T, 
    data: Record<string, any>
): Record<string, any> {
    const persistentKeys = (this as any).getPersistentKeys();
    const mapped: Record<string, any> = {};
    
    for (const [propertyKey, value] of Object.entries(data)) {
        const persistentKey = persistentKeys[propertyKey];
        mapped[persistentKey || propertyKey] = value;
    }
    
    return mapped;
}
```

**Nota:** Si una propiedad NO tiene `@PersistentKey`, se mantiene con su nombre original.

---

### mapFromPersistentKeys()

```typescript
public static mapFromPersistentKeys<T extends BaseEntity>(
    this: new (...args: any[]) => T, 
    data: Record<string, any>
): Record<string, any>
```

**Propósito:** Convierte un objeto de formato persistente (de API) a formato interno.

**Parámetros:**
- `data: Record<string, any>` - Objeto con claves persistentes (respuesta API)

**Retorna:** Objeto con claves internas

**Ubicación:** Línea 532

**Ejemplo:**

```typescript
// Respuesta de la API
const apiResponse = {
    first_name: 'Jane',
    last_name: 'Smith',
    email_address: 'jane@example.com',
    age: 25
};

// Convertir a formato interno
const internalData = User.mapFromPersistentKeys(apiResponse);
console.log(internalData);
// Salida:
// {
//   firstName: 'Jane',
//   lastName: 'Smith',
//   email: 'jane@example.com',
//   age: 25
// }

// Crear instancia con datos convertidos
const user = new User(internalData);
console.log(user.firstName); // 'Jane'
```

**Uso real en getElement():**

```typescript
// En BaseEntity.getElement() - Línea 671
const response = await Application.axiosInstance.get(`${endpoint}/${oid}`);
const mappedData = (this as any).mapFromPersistentKeys(response.data);
const instance = new this(mappedData);
```

**Implementación interna:**

```typescript
public static mapFromPersistentKeys<T extends BaseEntity>(
    this: new (...args: any[]) => T, 
    data: Record<string, any>
): Record<string, any> {
    const mapped: Record<string, any> = {};
    
    for (const [persistentKey, value] of Object.entries(data)) {
        const propertyKey = (this as any).getPropertyKeyByPersistentKey(persistentKey);
        mapped[propertyKey || persistentKey] = value;
    }
    
    return mapped;
}
```

---

## 🔧 Métodos de Instancia

Los siguientes métodos son versiones de instancia que delegan a los métodos estáticos:

### getPersistentKeys() (instancia)

```typescript
public getPersistentKeys(): Record<string, string>
```

**Propósito:** Obtiene las claves persistentes desde una instancia.

**Ubicación:** Línea 540

**Ejemplo:**

```typescript
const user = new User({ firstName: 'John' });
const keys = user.getPersistentKeys();
// Equivalente a: User.getPersistentKeys()
```

---

### getPersistentKeyByPropertyKey() (instancia)

```typescript
public getPersistentKeyByPropertyKey(propertyKey: string): string | undefined
```

**Ubicación:** Línea 544

**Ejemplo:**

```typescript
const user = new User({ firstName: 'John' });
const persistentKey = user.getPersistentKeyByPropertyKey('firstName');
console.log(persistentKey); // 'first_name'
```

---

### getPropertyKeyByPersistentKey() (instancia)

```typescript
public getPropertyKeyByPersistentKey(persistentKey: string): string | undefined
```

**Ubicación:** Línea 548

**Ejemplo:**

```typescript
const user = new User({});
const propertyKey = user.getPropertyKeyByPersistentKey('first_name');
console.log(propertyKey); // 'firstName'
```

---

### mapToPersistentKeys() (instancia)

```typescript
public mapToPersistentKeys(data: Record<string, any>): Record<string, any>
```

**Propósito:** Convierte un objeto a claves persistentes usando la clase de la instancia.

**Ubicación:** Línea 552

**Ejemplo:**

```typescript
const user = new User({ firstName: 'John', lastName: 'Doe' });

const internalData = { firstName: 'Jane', age: 30 };
const apiData = user.mapToPersistentKeys(internalData);

console.log(apiData);
// { first_name: 'Jane', age: 30 }
```

---

### mapFromPersistentKeys() (instancia)

```typescript
public mapFromPersistentKeys(data: Record<string, any>): Record<string, any>
```

**Propósito:** Convierte un objeto de API a claves internas usando la clase de la instancia.

**Ubicación:** Línea 556

**Ejemplo:**

```typescript
const user = new User({});

const apiData = { first_name: 'Bob', email_address: 'bob@example.com' };
const internalData = user.mapFromPersistentKeys(apiData);

console.log(internalData);
// { firstName: 'Bob', email: 'bob@example.com' }
```

---

## 🎯 Flujo Completo: Entidad → API → Entidad

### 1. Enviar a API (save/update)

```typescript
// Paso 1: Entidad con datos internos
const user = new User({
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com'
});

// Paso 2: Convertir a objeto plano
const internalObject = user.toObject();
// { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com' }

// Paso 3: Mapear a claves persistentes
const apiPayload = user.mapToPersistentKeys(internalObject);
// { first_name: 'Alice', last_name: 'Johnson', email_address: 'alice@example.com' }

// Paso 4: Enviar a API
await Application.axiosInstance.post('/api/users', apiPayload);
```

**Esto ocurre automáticamente en `save()` y `update()`.**

---

### 2. Recibir de API (getElement/getElementList)

```typescript
// Paso 1: Respuesta de la API
const apiResponse = {
    id: 1,
    first_name: 'Bob',
    last_name: 'Smith',
    email_address: 'bob@example.com',
    created_at: '2024-01-01'
};

// Paso 2: Mapear a claves internas
const internalData = User.mapFromPersistentKeys(apiResponse);
// { id: 1, firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', created_at: '2024-01-01' }

// Paso 3: Crear instancia
const user = new User(internalData);

// Paso 4: Usar con nombres internos
console.log(user.firstName); // 'Bob'
console.log(user.email);     // 'bob@example.com'
```

**Esto ocurre automáticamente en `getElement()` y `getElementList()`.**

---

## 🔍 Validación de Persistencia

### isPersistent()

```typescript
public isPersistent(): boolean
```

**Propósito:** Verifica si la entidad tiene el decorador `@Persistent()`.

**Retorna:** `true` si la entidad puede persistirse en BD, `false` si es solo local.

**Ubicación:** Línea 591

**Ejemplo:**

```typescript
@Persistent()
@ModuleName('User', 'Users')
export class User extends BaseEntity {
    // ...
}

@ModuleName('ViewModel', 'ViewModels')  // Sin @Persistent
export class ViewModel extends BaseEntity {
    // ...
}

const user = new User({});
console.log(user.isPersistent()); // true

const viewModel = new ViewModel({});
console.log(viewModel.isPersistent()); // false
```

**Uso en Application.setButtonList():**

```typescript
// application.ts - Línea 221
setButtonList() {
    const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;
    
    if (isPersistentEntity) {
        // Mostrar botones Save, Update, Delete
        this.ListButtons.value = [markRaw(SaveButtonComponent), ...];
    } else {
        // Solo mostrar botones de navegación
        this.ListButtons.value = [markRaw(RefreshButtonComponent)];
    }
}
```

---

### isNew()

```typescript
public isNew(): boolean
```

**Propósito:** Verifica si la entidad es nueva (no tiene ID asignado por la API).

**Retorna:** `true` si no tiene valor en la propiedad marcada con `@PrimaryProperty`

**Ubicación:** Línea 599

**Ejemplo:**

```typescript
export class User extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('ID', Number)
    id?: number;
    
    @PropertyName('Name', String)
    name!: string;
}

// Entidad nueva (sin ID)
const newUser = new User({ name: 'Alice' });
console.log(newUser.isNew()); // true

// Entidad existente (con ID)
const existingUser = new User({ id: 5, name: 'Bob' });
console.log(existingUser.isNew()); // false
```

**Uso en save():**

```typescript
// base_entitiy.ts - Línea 744
if (this.isNew()) {
    // POST /api/users
    response = await Application.axiosInstance.post(endpoint!, dataToSend);
} else {
    // PUT /api/users/:id
    response = await Application.axiosInstance.put(`${endpoint}/${uniqueKey}`, dataToSend);
}
```

---

## 📋 Ejemplo Completo: CRUD con Persistencia

```typescript
// ========================================
// 1. Definir Entidad con PersistentKeys
// ========================================

@Persistent()
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    @PrimaryProperty()
    @PropertyName('ID', Number)
    @PersistentKey('product_id')
    id?: number;
    
    @PropertyName('Product Name', String)
    @PersistentKey('product_name')
    name!: string;
    
    @PropertyName('Price', Number)
    @PersistentKey('unit_price')
    price!: number;
    
    @PropertyName('Stock', Number)
    @PersistentKey('stock_quantity')
    stock!: number;
}

// ========================================
// 2. Crear y Guardar (POST)
// ========================================

const newProduct = new Product({
    name: 'Widget',
    price: 99.99,
    stock: 100
});

console.log(newProduct.isNew()); // true

// Al guardar:
await newProduct.save();

// Internamente:
// 1. this.toObject() → { name: 'Widget', price: 99.99, stock: 100 }
// 2. mapToPersistentKeys() → { product_name: 'Widget', unit_price: 99.99, stock_quantity: 100 }
// 3. POST /api/products with { product_name: ..., unit_price: ..., stock_quantity: ... }
// 4. Response: { product_id: 1, product_name: 'Widget', ... }
// 5. mapFromPersistentKeys() → { id: 1, name: 'Widget', ... }
// 6. Object.assign(this, mappedData)

// Ahora:
console.log(newProduct.id);      // 1
console.log(newProduct.isNew()); // false

// ========================================
// 3. Obtener de API (GET)
// ========================================

const product = await Product.getElement('1');

// Internamente:
// 1. GET /api/products/1
// 2. Response: { product_id: 1, product_name: 'Widget', unit_price: 99.99, stock_quantity: 100 }
// 3. mapFromPersistentKeys() → { id: 1, name: 'Widget', price: 99.99, stock: 100 }
// 4. new Product({ id: 1, name: 'Widget', ... })

console.log(product.name);  // 'Widget'
console.log(product.price); // 99.99

// ========================================
// 4. Actualizar (PUT)
// ========================================

product.price = 89.99;
await product.save(); // Detecta que NO es nuevo, hace PUT

// Internamente:
// 1. isNew() → false
// 2. mapToPersistentKeys() → { product_id: 1, product_name: 'Widget', unit_price: 89.99, ... }
// 3. PUT /api/products/1 with { unit_price: 89.99, ... }

// ========================================
// 5. Eliminar (DELETE)
// ========================================

await product.delete();

// Internamente:
// 1. DELETE /api/products/1
```

---

## ⚠️ Consideraciones Importantes

### 1. @PersistentKey es Opcional

Si NO usas `@PersistentKey`, los nombres de propiedades se envían tal cual a la API:

```typescript
export class User extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;  // Se enviará como "name" (sin @PersistentKey)
}

const user = new User({ name: 'Alice' });
await user.save();
// POST /api/users
// Body: { name: 'Alice' }
```

### 2. Conversión Automática en CRUD

**NO necesitas llamar manualmente a `mapToPersistentKeys()` o `mapFromPersistentKeys()`.**

Los métodos CRUD (`save()`, `update()`, `getElement()`, `getElementList()`) los usan automáticamente.

### 3. Propiedades Sin @PersistentKey

Si una propiedad no tiene `@PersistentKey`, se mantiene con su nombre original:

```typescript
export class User extends BaseEntity {
    @PersistentKey('first_name')
    firstName!: string;
    
    age!: number;  // Sin @PersistentKey
}

const data = { firstName: 'John', age: 30 };
const mapped = User.mapToPersistentKeys(data);
// { first_name: 'John', age: 30 }  ← 'age' se mantiene igual
```

### 4. Casos con Propiedades Privadas

Las propiedades que empiezan con `_` no se incluyen en `toObject()`:

```typescript
export class User extends BaseEntity {
    name!: string;
    _isLoading: boolean = false;  // Propiedad privada
}

const user = new User({ name: 'Alice' });
const obj = user.toObject();
// { name: 'Alice' }  ← _isLoading NO se incluye
```

---

## 🔗 Referencias

- **@PersistentKey Decorator:** `../../01-decorators/persistent-key-decorator.md`
- **@Persistent Decorator:** `../../01-decorators/persistent-decorator.md`
- **CRUD Operations:** `crud-operations.md`
- **API Integration:** `../../03-application/application-singleton.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Archivo fuente:** `src/entities/base_entitiy.ts` (líneas 512-600)  
**Estado:** ✅ Completo
