# BaseEntity: Persistence Methods System

## 1. Propósito

El sistema de métodos de persistencia gestiona la conversión bidireccional entre claves de propiedades internas (camelCase, nombres de entidad) y claves persistentes (snake_case, nombres de API) definidas por el decorador @PersistentKey. Permite que la entidad use nombres internos consistentes con convenciones JavaScript (firstName, productName) mientras la API usa convenciones diferentes (first_name, product_name) sin requerir transformación manual en cada operación CRUD. El sistema provee 5 métodos static bidirectionales (getPersistentKeys, getPersistentKeyByPropertyKey, getPropertyKeyByPersistentKey, mapToPersistentKeys, mapFromPersistentKeys) y sus equivalentes de instancia. Además incluye métodos de validación de estado: isPersistent() que verifica si entidad tiene @Persistent decorator, e isNew() que determina si entidad es nueva (sin ID) o existente (con ID del servidor). La conversión automática ocurre en save/update (interno → persistente) y getElement/getElementList (persistente → interno).

## 2. Alcance

**Responsabilidades cubiertas:**
- getPersistentKeys(): Retorna Record<string, string> mapeando propertyKey → persistentKey para todas las propiedades con @PersistentKey
- getPersistentKeyByPropertyKey(key): Convierte propertyKey interna a persistentKey para envío a API
- getPropertyKeyByPersistentKey(persistentKey): Convierte persistentKey de API a propertyKey interna (operación inversa)
- mapToPersistentKeys(data): Convierte objeto completo de formato interno a formato persistente (para POST/PUT)
- mapFromPersistentKeys(data): Convierte objeto de API (formato persistente) a formato interno (para construcción de instancia)
- isPersistent(): Valida si entidad tiene @Persistent decorator y puede hacer operaciones CRUD con servidor
- isNew(): Determina si entidad es nueva (sin PrimaryProperty value) o existente (con ID asignado por servidor)
- Integración automática en save(): mapToPersistentKeys antes de HTTP request
- Integración automática en getElement/getElementList: mapFromPersistentKeys después de HTTP response

**Límites del alcance:**
- No implementa validación de tipos durante conversión (asume datos bien formados)
- No hace transformación profunda de objetos nested (solo nivel top del objeto)
- No cachea resultados de getPersistentKeys (lee prototype fresh cada vez)
- No hace validación de consistencia entre @PersistentKey y nombres reales de API
- No provee rollback si conversión falla parcialmente (conversión es atómica)
- isPersistent() solo verifica decorator, no valida que @ApiEndpoint esté configurado
- isNew() solo verifica @PrimaryProperty, no valida si ID es válido en servidor

## 3. Definiciones Clave

**@PersistentKey decorator:** Decorador aplicado a propiedades para definir nombre alternativo usado en persistencia/API. Escribe en PERSISTENT_KEY metadata en prototype. Ejemplo: `@PersistentKey('first_name')` para propiedad firstName.

**Internal Property Key:** Nombre de propiedad usado internamente en código JavaScript/TypeScript. Típicamente camelCase (firstName, lastName, productName). Usado para acceso directo: entity.firstName.

**Persistent Key:** Nombre de propiedad usado en API/persistencia. Típicamente snake_case o convención específica del backend (first_name, last_name, product_name). Definido en @PersistentKey decorator.

**getPersistentKeys():** Método static que retorna Record<string, string> con mapeo completo propertyKey → persistentKey leyendo PERSISTENT_KEY_KEY del prototype. Usado internamente por otros métodos de conversión.

**mapToPersistentKeys(data):** Convierte objeto completo de formato interno a persistente iterando sobre entries y aplicando getPersistentKeyByPropertyKey. Si propiedad NO tiene @PersistentKey, mantiene nombre original. Usado en save/update antes de HTTP request.

**mapFromPersistentKeys(data):** Convierte objeto de API (formato persistente) a formato interno iterando sobre entries y aplicando getPropertyKeyByPersistentKey. Si persistentKey no existe en metadata, mantiene nombre original. Usado en getElement/getElementList después de HTTP response.

**isPersistent():** Método que verifica si entidad tiene @Persistent decorator aplicado. Retorna boolean. Si false, entidad es solo local (no hace HTTP requests). Si true, entidad puede ejecutar operaciones CRUD con servidor. Usado en Application.setButtonList() para determinar qué botones mostrar en UI.

**isNew():** Método que verifica si valor de @PrimaryProperty es undefined/null. Retorna true si nueva (sin ID), false si existente (con ID). Usado en save() para determinar POST (nueva) vs PUT (actualización). Critical para determinar endpoint HTTP correcto.

**Bidirectional Conversion:** Sistema simétrico donde mapToPersistentKeys y mapFromPersistentKeys son operaciones inversas. Para cualquier objeto válido: mapFromPersistentKeys(mapToPersistentKeys(obj)) === obj (idempotencia).

**Fallback to Original Name:** Si propiedad NO tiene @PersistentKey definido, métodos de conversión usan nombre original sin modificar. Permite mixing de propiedades con y sin @PersistentKey en misma entidad.

## 4. Descripción Técnica

### Métodos Static

#### getPersistentKeys() - Static

```typescript
public static getPersistentKeys(): Record<string, string>
```

Retorna mapeo completo propertyKey → persistentKey leyendo PERSISTENT_KEY_KEY del prototype.

**Ubicación:** Línea 512

**Implementación:**

```typescript
public static getPersistentKeys(): Record<string, string> {
    const proto = this.prototype as any;
    return proto[PERSISTENT_KEY_KEY] || {};
}
```

**Ejemplo:**

```typescript
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
// {
//   firstName: 'first_name',
//   lastName: 'last_name',
//   email: 'email_address'
// }
```

#### getPersistentKeyByPropertyKey() - Static

```typescript
public static getPersistentKeyByPropertyKey(propertyKey: string): string | undefined
```

Convierte propertyKey interna a persistentKey para envío a API.

**Ubicación:** Línea 516

**Ejemplo:**

```typescript
const persistentKey = User.getPersistentKeyByPropertyKey('firstName');
console.log(persistentKey); // 'first_name'

const emailKey = User.getPersistentKeyByPropertyKey('email');
console.log(emailKey); // 'email_address'

// Si no tiene @PersistentKey
const undefinedKey = User.getPersistentKeyByPropertyKey('someProperty');
console.log(undefinedKey); // undefined
```

#### getPropertyKeyByPersistentKey() - Static

```typescript
public static getPropertyKeyByPersistentKey(persistentKey: string): string | undefined
```

Convierte persistentKey de API a propertyKey interna (operación inversa).

**Ubicación:** Línea 520

**Implementación:**

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

#### mapToPersistentKeys() - Static

```typescript
public static mapToPersistentKeys<T extends BaseEntity>(
    this: new (...args: any[]) => T, 
    data: Record<string, any>
): Record<string, any>
```

Convierte objeto completo de formato interno a formato persistente para envío a API.

**Ubicación:** Línea 524

**Implementación:**

```typescript
public static mapToPersistentKeys<T extends BaseEntity>(
    this: new (...args: any[]) => T, 
    data: Record<string, any>
): Record<string, any> {
    const persistentKeys = (this as any).getPersistentKeys();
    const mapped: Record<string, any> = {};
    
    for (const [propertyKey, value] of Object.entries(data)) {
        const persistentKey = persistentKeys[propertyKey];
        mapped[persistentKey || propertyKey] = value;  // Fallback to original
    }
    
    return mapped;
}
```

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
// {
//   first_name: 'John',
//   last_name: 'Doe',
//   email_address: 'john@example.com',
//   age: 30
// }
```

**Uso en save():**

```typescript
// En BaseEntity.save() - Línea 747
const dataToSend = this.mapToPersistentKeys(this.toObject());
const response = await Application.axiosInstance.post(endpoint!, dataToSend);
```

#### mapFromPersistentKeys() - Static

```typescript
public static mapFromPersistentKeys<T extends BaseEntity>(
    this: new (...args: any[]) => T, 
    data: Record<string, any>
): Record<string, any>
```

Convierte objeto de formato persistente (de API) a formato interno.

**Ubicación:** Línea 532

**Implementación:**

```typescript
public static mapFromPersistentKeys<T extends BaseEntity>(
    this: new (...args: any[]) => T, 
    data: Record<string, any>
): Record<string, any> {
    const mapped: Record<string, any> = {};
    
    for (const [persistentKey, value] of Object.entries(data)) {
        const propertyKey = (this as any).getPropertyKeyByPersistentKey(persistentKey);
        mapped[propertyKey || persistentKey] = value;  // Fallback to original
    }
    
    return mapped;
}
```

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

**Uso en getElement():**

```typescript
// En BaseEntity.getElement() - Línea 671
const response = await Application.axiosInstance.get(`${endpoint}/${oid}`);
const mappedData = (this as any).mapFromPersistentKeys(response.data);
const instance = new this(mappedData);
```

### Métodos de Instancia

Todos los métodos anteriores tienen versiones de instancia que delegan a versiones static:

#### getPersistentKeys() - Instance

```typescript
public getPersistentKeys(): Record<string, string>
```

**Ubicación:** Línea 540

**Ejemplo:**

```typescript
const user = new User({ firstName: 'John' });
const keys = user.getPersistentKeys();
// Equivalente a: User.getPersistentKeys()
```

#### getPersistentKeyByPropertyKey() - Instance

```typescript
public getPersistentKeyByPropertyKey(propertyKey: string): string | undefined
```

**Ubicación:** Línea 544

#### getPropertyKeyByPersistentKey() - Instance

```typescript
public getPropertyKeyByPersistentKey(persistentKey: string): string | undefined
```

**Ubicación:** Línea 548

#### mapToPersistentKeys() - Instance

```typescript
public mapToPersistentKeys(data: Record<string, any>): Record<string, any>
```

**Ubicación:** Línea 552

#### mapFromPersistentKeys() - Instance

```typescript
public mapFromPersistentKeys(data: Record<string, any>): Record<string, any>
```

**Ubicación:** Línea 556

### Métodos de Validación de Estado

#### isPersistent() - Instance

```typescript
public isPersistent(): boolean
```

Verifica si entidad tiene @Persistent decorator aplicado.

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

#### isNew() - Instance

```typescript
public isNew(): boolean
```

Verifica si entidad es nueva (no tiene ID asignado por API).

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
// base_entity.ts - Línea 744
if (this.isNew()) {
    // POST /api/users
    response = await Application.axiosInstance.post(endpoint!, dataToSend);
} else {
    // PUT /api/users/:id
    response = await Application.axiosInstance.put(`${endpoint}/${uniqueKey}`, dataToSend);
}
```

## 5. Flujo de Funcionamiento

### Flujo de Envío a API (save/update)

```
Usuario llama entity.save()
        ↓
save() llama this.toObject()
        ↓
Obtiene objeto plano con keys internas
{ firstName: 'Alice', lastName: 'Johnson' }
        ↓
save() llama mapToPersistentKeys(object)
        ↓
Para cada key en object:
    - Lee persistentKeys[key]
    - Si existe, usa persistentKey
    - Si no existe, usa key original
        ↓
Retorna objeto con keys persistentes
{ first_name: 'Alice', last_name: 'Johnson' }
        ↓
save() ejecuta HTTP request (POST/PUT)
        ↓
Envía objeto con persistent keys al servidor
```

### Flujo de Recepción desde API (getElement/getElementList)

```
Usuario llama Entity.getElement(id)
        ↓
getElement() ejecuta HTTP GET
        ↓
Recibe response.data con persistent keys
{ product_id: 1, product_name: 'Widget', unit_price: 99.99 }
        ↓
getElement() llama mapFromPersistentKeys(response.data)
        ↓
Para cada persistentKey en response:
    - Busca propertyKey correspondiente
    - Si existe, usa propertyKey interna
    - Si no existe, usa persistentKey original
        ↓
Retorna objeto con keys internas
{ id: 1, name: 'Widget', price: 99.99 }
        ↓
getElement() crea instancia new Entity(mappedData)
        ↓
Usuario accede con nombres internos
entity.name // 'Widget'
```

### Flujo de Determinación POST vs PUT

```
Usuario llama entity.save()
        ↓
save() llama this.isNew()
        ↓
isNew() obtiene PrimaryProperty key
        ↓
isNew() verifica valor de this[primaryKey]
        ↓
¿Valor es undefined o null?
    ├─ SÍ → isNew() retorna true
    │        ↓
    │     save() ejecuta POST
    │     Endpoint: /api/entities
    │
    └─ NO → isNew() retorna false
             ↓
          save() ejecuta PUT
          Endpoint: /api/entities/:id
```

### Flujo de Validación de Persistencia en UI

```
Application carga entidad en View
        ↓
Application.setButtonList() ejecuta
        ↓
Obtiene entityObject del View.value
        ↓
Llama entityObject.isPersistent()
        ↓
isPersistent() lee PERSISTENT_KEY decorator
        ↓
¿Entidad está marcada @Persistent?
    ├─ SÍ → Mostrar botones CRUD completos
    │        (Save, Update, Delete, Refresh)
    │
    └─ NO → Mostrar solo botones navegación
             (Refresh, Close)
```

## 6. Reglas Obligatorias

**Regla 1:** mapToPersistentKeys() DEBE aplicarse antes de todo HTTP request (POST/PUT) en save/update. No enviar objeto con keys internas directamente a API.

**Regla 2:** mapFromPersistentKeys() DEBE aplicarse después de todo HTTP response en getElement/getElementList antes de construir instancia.

**Regla 3:** Si propiedad NO tiene @PersistentKey, métodos de conversión DEBEN usar nombre original sin modificar (fallback behavior).

**Regla 4:** isNew() DEBE verificar @PrimaryProperty para determinar si entidad es nueva. No usar otra propiedad arbitraria.

**Regla 5:** save() DEBE usar isNew() para decidir entre POST y PUT. POST para entidades nuevas (isNew() === true), PUT para existentes.

**Regla 6:** isPersistent() DEBE verificar @Persistent decorator. Si false, no ejecutar operaciones HTTP CRUD (solo local).

**Regla 7:** getPropertyKeyByPersistentKey() DEBE retornar undefined si persistentKey no existe en metadata. No lanzar excepción.

**Regla 8:** mapToPersistentKeys() y mapFromPersistentKeys() DEBEN ser operaciones simétricas. Para objeto válido: mapFromPersistentKeys(mapToPersistentKeys(obj)) debe igualar obj.

**Regla 9:** Métodos de instancia DEBEN delegar a versiones static usando this.constructor. No duplicar lógica.

**Regla 10:** getPersistentKeys() DEBE retornar objeto vacío {} si no hay @PersistentKey definidos, no undefined.

**Regla 11:** Conversión DEBE ser shallow (nivel top). No hacer transformación recursiva de objetos nested sin implementación explícita.

**Regla 12:** Nombres de propiedades privadas (prefijo _) NO deben incluirse en conversión (filtradas por toObject()).

## 7. Prohibiciones

**Prohibido:** Enviar objeto con keys internas directamente a API sin mapToPersistentKeys(). Causará incompatibilidad con backend.

**Prohibido:** Construir instancia con response.data sin mapFromPersistentKeys(). Propiedades tendrán nombres incorrectos.

**Prohibido:** Modificar objeto retornado por getPersistentKeys(). Es referencia a prototype metadata, modificación afectaría todas las instancias.

**Prohibido:** Usar isNew() en entidades sin @PrimaryProperty decorator. Causará comportamiento undefined.

**Prohibido:** Ejecutar save/update en entidades con isPersistent() === False. No tienen configuración para persistencia.

**Prohibido:** Asumir que todos los campos tienen @PersistentKey. Siempre verificar undefined y aplicar fallback a nombre original.

**Prohibido:** Hacer conversión manual de keys en código de aplicación. Usar métodos de persistencia provistos por framework.

**Prohibido:** Cachear resultado de getPersistentKeys() en variables static. Debe leer prototype fresh cada vez.

**Prohibido:** Override isNew() sin verificar @PrimaryProperty. Rompe contrato con save().

**Prohibido:** Usar mapToPersistentKeys() para propósitos distintos a preparación de payload API. No es serializer genérico.

**Prohibido:** Aplicar mapFromPersistentKeys() dos veces sobre mismo objeto. Causará pérdida de datos si keys colisionan.

**Prohibido:** Definir @PersistentKey con valores que colisionen entre sí (dos propiedades con mismo persistentKey). Causará ambigüedad en mapFromPersistentKeys().

## 8. Dependencias

**Decoradores:**
- @PersistentKey: Define nombre persistente para propiedad
- @Persistent: Marca entidad como persistible en servidor
- @PrimaryProperty: Define propiedad ID usada por isNew()

**Metadata Keys:**
- PERSISTENT_KEY_KEY: Symbol para almacenar mapeo persistentKey en prototype
- PERSISTENT_KEY: Symbol para flag @Persistent decorator
- PRIMARY_PROPERTY_KEY: Symbol para identificar propiedad primary

**BaseEntity Core:**
- toObject(): Convierte entity a objeto plano antes de mapToPersistentKeys()
- getPrimaryPropertyKey(): Obtiene key de @PrimaryProperty para isNew()
- getPrimaryPropertyValue(): Obtiene valor de @PrimaryProperty para isNew()

**CRUD Operations:**
- save(): Usa mapToPersistentKeys() antes de POST/PUT
- update(): Usa mapToPersistentKeys() antes de PUT
- getElement(): Usa mapFromPersistentKeys() después de GET
- getElementList(): Usa mapFromPersistentKeys() después de GET

**Application Singleton:**
- Application.axiosInstance: Para ejecutar HTTP requests con datos convertidos
- Application.setButtonList(): Usa isPersistent() para configurar botones UI

**HTTP Methods:**
- POST: Para entidades nuevas (isNew() === true)
- PUT: Para entidades existentes (isNew() === false)
- GET: Para obtener datos que requieren mapFromPersistentKeys()

## 9. Relaciones

**Relación con @PersistentKey Decorator (N:1):**
Múltiples propiedades pueden tener @PersistentKey → Todos son leídos por getPersistentKeys() en un solo mapeo.

**Relación con CRUD Operations (1:N):**
Métodos de persistencia son usados por múltiples operaciones CRUD (save, update, getElement, getElementList, delete).

**Relación con Application.setButtonList() (N:1):**
isPersistent() determina qué botones mostrar en UI. Múltiples views consultan este método.

**Relación con BaseEntity.toObject() (1:1):**
mapToPersistentKeys() siempre recibe output de toObject() en flujo save(). Relación secuencial obligatoria.

**Relación con HTTP Layer (1:N):**
Datos convertidos son usados en múltiples tipos de HTTP requests (POST, PUT, GET).

**Relación con Validation System (1:1):**
isNew() determina si validatePersistenceConfiguration() debe ejecutarse antes de save().

**Relación con Constructor (N:1):**
mapFromPersistentKeys() provee datos que son pasados a constructor de BaseEntity para crear instancias.

## 10. Notas de Implementación

### Ejemplo Completo: CRUD con Persistencia

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

### Mixing Propiedades Con y Sin @PersistentKey

```typescript
export class User extends BaseEntity {
    @PersistentKey('first_name')
    firstName!: string;  // Convertirá a first_name
    
    age!: number;  // Sin @PersistentKey, se mantiene como 'age'
    
    @PersistentKey('email_addr')
    email!: string;  // Convertirá a email_addr
}

const data = { firstName: 'John', age: 30, email: 'john@example.com' };
const mapped = User.mapToPersistentKeys(data);
console.log(mapped);
// { first_name: 'John', age: 30, email_addr: 'john@example.com' }
//   ↑ convertido    ↑ original    ↑ convertido
```

### Consideración: Propiedades Privadas

```typescript
export class User extends BaseEntity {
    @PersistentKey('user_name')
    name!: string;
    
    _isLoading: boolean = false;  // Prop privada (prefijo _)
    _tempData: any = null;
}

const user = new User({ name: 'Alice' });
user._isLoading = true;

// toObject() filtra propiedades privadas
const obj = user.toObject();
console.log(obj);
// { name: 'Alice' }  // _isLoading y _tempData NO incluidos

// Por lo tanto mapToPersistentKeys tampoco las incluye
const apiData = user.mapToPersistentKeys(obj);
console.log(apiData);
// { user_name: 'Alice' }
```

### Consideración: @PersistentKey Opcional

```typescript
// Si NO usas @PersistentKey, nombres se envían tal cual
export class SimpleUser extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;  // NO @PersistentKey
    
    @PropertyName('Email', String)
    email!: string;  // NO @PersistentKey
}

const user = new SimpleUser({ name: 'Alice', email: 'alice@example.com' });
await user.save();

// Enviará:
// POST /api/users
// Body: { name: 'Alice', email: 'alice@example.com' }
// (sin conversión)
```

### Pattern: Debugging Conversión

```typescript
const user = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
});

// Ver mapeo definido
console.log('Persistent Keys:', User.getPersistentKeys());
// { firstName: 'first_name', lastName: 'last_name', email: 'email_address' }

// Ver conversión específica
console.log('firstName maps to:', User.getPersistentKeyByPropertyKey('firstName'));
// 'first_name'

// Ver objeto que se enviará
const internalData = user.toObject();
console.log('Internal:', internalData);
// { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }

const apiData = User.mapToPersistentKeys(internalData);
console.log('API:', apiData);
// { first_name: 'John', last_name: 'Doe', email_address: 'john@example.com' }

// Verificar simetría
const backToInternal = User.mapFromPersistentKeys(aData);
console.log('Back to Internal:', backToInternal);
// { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
// (debe ser idéntico a internalData)
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- ../01-decorators/persistent-key-decorator.md: Definición de @PersistentKey decorator
- ../01-decorators/persistent-decorator.md: Definición de @Persistent decorator
- crud-operations.md: Uso de métodos de persistencia en save/update/getElement/getElementList
- state-and-conversion.md: toObject() usado antes de mapToPersistentKeys()
- base-entity-core.md: Arquitectura general de BaseEntity

**Archivos fuente:**
- src/entities/base_entity.ts: Implementación de métodos de persistencia (líneas 512-600)
- src/decorations/persistent_key_decorator.ts: Decorador @PersistentKey
- src/decorations/persistent_decorator.ts: Decorador @Persistent  
- src/application/application.ts: Uso de isPersistent() en setButtonList() (línea 221)

**Líneas relevantes en código:**
- Línea 512-556: Métodos de conversión static e instance
- Línea 591: isPersistent() implementation
- Línea 599: isNew() implementation
- Línea 747: Uso de mapToPersistentKeys() en save()
- Línea 671: Uso de mapFromPersistentKeys() en getElement()

**Última actualización:** 11 de Febrero, 2026
