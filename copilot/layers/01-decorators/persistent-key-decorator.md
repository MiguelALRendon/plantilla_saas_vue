# PersistentKey Decorator

## 1. Propósito

El decorador PersistentKey especifica qué propiedad usar como identificador único para operaciones de persistencia con backend API, determinando qué campo valor se incluye en URLs endpoints individuales entity requests. Este decorador establece property usada construir request paths PUT/PATCH/DELETE specific entities y GET by id lookups siendo append al ApiEndpoint base URL formando complete endpoint path. Critical para arquitecturas donde entity primary key NO es necessarily property usada URLs API example cuando datos source usa integer autoincrement id primary key pero API endpoints prefieren slug field string-based human-readable URLs SEO-friendly UUIDs immutable identifiers evitando exponer internal integer ids security reasons. El decorador almacena property name string en prototype usando PERSISTENT_KEY_METADATA Symbol accesible through getPersistentKey() accessor queried por save() delete() getElement() methods antes construir HTTP request URLs permitiendo customization URL building strategy independent primary key definition database representation. La implementación resuelve tension between: internal application entity identification using primary keys performance optimization integer comparisons in-memory filtering; external API communication using different identifier types strings UUIDs slugs codes maintaining flexibility backwards compatibility without coupling entity schema database schema API contract allowing each layer use appropriate identifier type concern separation. Beneficios operacionales: URL flexibility APIs pueden designed human-readable slugs customer codes product SKUs inventory numbers flexible naming conventions independent database autoincrement ids; security improved internal database ids NOT exposed external URLs reducing information leakage attack surfaces preventing enumeration attacks; migration support legacy systems gradual refactoring changing identifier schemes without rewriting entire entity schema codebase one decorator change propaga URLs globally; versioning API endpoints requiring different identifier types across versions same entity code adapted decorator parameter switching identifier field context-appropriate backward compatible integration; immutability support UUIDs hashes immutable identifiers preferred primary keys concurrency control distributed systems while maintaining numeric primary keys internal optimization performance indexing requirements.

## 2. Alcance

### Responsabilidades

- Definir nombre property string usado unique identifier URL construction API persistence endpoints PUT/DELETE/GET operations building request paths
- Almacenar persistent key property name en entity class prototype usando PERSISTENT_KEY_METADATA Symbol efficient O(1) metadata lookup durante URL formatting HTTP request preparation
- Proveer getPersistentKey() accessor method tanto static level (queried sin entity instance) como instance level (delegating static method constructor) unified API consistent access pattern
- Integrar con save() method BaseEntity determining whether new entity creation POST request base endpoint or existing entity update PUT endpoint/{persistentKeyValue} URL constructed using persistent key value
- Integrar con delete() method constructing DELETE request URLs ApiEndpoint/{persistentKeyValue} appending persistent key value base endpoint path complete URL targeting specific entity deletion
- Integrar con getElement() static method constructing GET request URLs ApiEndpoint/{id} parameter appending persistent key value retrieving single entity backend matching identifier
- Proveer default fallback primary key cuando PersistentKey NO configured: getPersistentKey() retorna getPrimaryProperty() ensuring backward compatibility primary key usada URLs unless explicitly overridden persistent key decorator applied
- Soportar any property type string number UUID allowing flexible identifier types appropriate domain requirements API design constraints backend implementation technology choices

### Límites

- No valida uniqueness persistent key values database; backend responsible ensuring identifiers unique enforcing constraints violations handled API error responses
- No convierte valores automatically formatting; persistent key value transmission raw property value developer responsible ensuring value appropriate API expectations string encoding URL-safe characters
- No valida existencia property decorated; if persistent key references non-existent property runtime errors occur accessing undefined property developer responsible verifying property exists decorated correctly
- No sincroniza backend metadata; persistent key selection frontend-only decision determining URL construction strategy backend unaware which property frontend uses identifier coordination API contract implicit
- No maneja composite keys multi-field identifiers; decorator supports single property only complex composite key scenarios require custom URL building logic override save delete getElement methods manual URL construction
- No valida property type constraints; any property type can be persistent key string number UUID object developer responsible ensuring type compatible URL path segments serializable HTTP transmission
- No proporciona URL encoding; special characters property values NOT automatically encoded developer responsible encoding values URL-safe format before HTTP transmission preventing malformed URLs errors

## 3. Definiciones Clave

### PERSISTENT_KEY_METADATA Symbol

Identificador único usado property key prototype almacenar persistent key property name string. Implementación: `export const PERSISTENT_KEY_METADATA = Symbol('persistentKey')`. Storage: `Product.prototype[PERSISTENT_KEY_METADATA] = 'slug'`. Symbol provides collision-free key metadata storage evitando conflicts real properties methods entity protecting namespace integrity. Prototype-level storage (all instances share) porque persistent key property es type-level configuration NO instance-specific data: entire entity class usa same property identifier uniformly all persistence operations.

### Persistent Key Property Name

String value indicating cual property usar identifier API URLs persistence operations. Values: property name existing decorated entity 'slug', 'uuid', 'sku', 'customerCode' cualquier string-valued property. Type: `string`. Default: retorna getPrimaryProperty() cuando decorator NO configured fallback primary key ensuring backward compatibility preventing breaking changes existing codebases.

### Decorator Signature

Function signature: `function PersistentKey(): PropertyDecorator`. Parameters: none decorator applied property directly marking persistent key candidate. Retorna PropertyDecorator function applying metadata entity property storing property name prototype referenced later URL construction.

### getPersistentKey() Accessor

Método estático BaseEntity retornando property name string usado identifier URLs or undefined when NO configured. Implementación: `public static getPersistentKey(): string { const persistentKey = this.prototype[PERSISTENT_KEY_METADATA]; return persistentKey || this.getPrimaryProperty(); }`. Ubicación: src/entities/base_entitiy.ts líneas ~1040-1060. Fallback behavior: retorna primary property cuando persistent key metadata missing backward compatibility maintaining existing behavior. También existe instance method: `public getPersistentKey(): string { const constructor = this.constructor as typeof BaseEntity; return constructor.getPersistentKey(); }` delegating static method enabling same query instance or class level interchangeably.

###get PersistentKeyValue() Accessor

Método instancia BaseEntity retornando actual value persistent key property current entity instance. Implementación: `public getPersistentKeyValue(): any { const persistentKey = this.getPersistentKey(); return this[persistentKey]; }`. Ubicación: src/entities/base_entitiy.ts líneas ~1065-1070. Usage: obtaining identifier value appending URLs HTTP requests construction. Example: product.getPersistentKeyValue() retorna 'laptop-dell-xps-13' if slug persistent key contains slug string value.

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
export const PERSISTENT_KEY_METADATA = Symbol('persistentKey');

export function PersistentKey(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        target.constructor.prototype[PERSISTENT_KEY_METADATA] = propertyKey;
    };
}
```

Ubicación: src/decorations/persistent_key_decorator.ts líneas ~1-10. Decorator almacena property name prototype de entity class using Symbol key collision-free metadata storage. No parameters decorator applied property directly extracting property name automatically context.

### Accessor Methods en BaseEntity

```typescript
public static getPersistentKey(): string {
    const persistentKey = this.prototype[PERSISTENT_KEY_METADATA];
    return persistentKey || this.getPrimaryProperty();
}

public getPersistentKey(): string {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getPersistentKey();
}

public getPersistentKeyValue(): any {
    const persistentKey = this.getPersistentKey();
    return this[persistentKey];
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~1040-1070. Accessors proporcionan consistent API querying persistent key property name obtaining actual value from entity instance. Fallback primary key when decorator NO applied maintaining backward compatibility transparent integration.

### Integración con save() Method

```typescript
public async save(): Promise<boolean> {
    this.beforeSave();
    
    const isValid = await this.validateInputs();
    if (!isValid) {
        return false;
    }
    
    const constructor = this.constructor as typeof BaseEntity;
    
    if (!constructor.isPersistent()) {
        this.afterSave();
        return true;
    }
    
    const endpoint = constructor.getApiEndpoint();
    const persistentKey = this.getPersistentKeyValue();
    const isNew = !persistentKey;
    
    try {
        let response;
        
        if (isNew) {
            response = await Application.axiosInstance.post(
                endpoint,
                this.toDictionary()
            );
        } else {
            response = await Application.axiosInstance.put(
                `${endpoint}/${persistentKey}`,
                this.toDictionary()
            );
        }
        
        this.updateFromDictionary(response.data);
        this.afterSave();
        
        return true;
    } catch (error) {
        console.error('[BaseEntity] Save failed:', error);
        return false;
    }
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~250-330. Método save() usa getPersistentKeyValue() obtener identifier value appending PUT request URL when updating existing entity. NEW entities determined by absence persistent key value null undefined indicating POST request base endpoint creation. EXISTING entities have persistent key value appended endpoint forming complete URL targeted update.

### Integración con delete() Method

```typescript
public async delete(): Promise<boolean> {
    this.beforeDelete();
    
    const constructor = this.constructor as typeof BaseEntity;
    
    if (!constructor.isPersistent()) {
        this.afterDelete();
        return true;
    }
    
    const endpoint = constructor.getApiEndpoint();
    const persistentKeyValue = this.getPersistentKeyValue();
    
    try {
        await Application.axiosInstance.delete(`${endpoint}/${persistentKeyValue}`);
        
        this.afterDelete();
        
        return true;
    } catch (error) {
        console.error('[BaseEntity] Delete failed:', error);
        return false;
    }
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~340-380. Método delete() usa getPersistentKeyValue() construir DELETE request URL appending identifier value base endpoint targeting specific entity deletion backend removal.

### Integración con getElement() Static Method

```typescript
public static async getElement(id: any): Promise<BaseEntity | null> {
    if (!this.isPersistent()) {
        const mockData = this.getMockData();
        const persistentKey = this.getPersistentKey();
        
        return mockData.find(entity => entity[persistentKey] === id) || null;
    }
    
    const endpoint = this.getApiEndpoint();
    
    try {
        const response = await Application.axiosInstance.get(`${endpoint}/${id}`);
        
        const entity = new this();
        entity.updateFromDictionary(response.data);
        
        return entity;
    } catch (error) {
        console.error('[BaseEntity] getElement failed:', error);
        return null;
    }
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~440-480. Método getElement() usa id parameter appending GET request URL constructing ApiEndpoint/{id} path retrieving single entity matching identifier backend response JSON single entity deserialized instance returned caller.

## 5. Flujo de Funcionamiento

### Flujo URL Construction save() Existing Entity

```
[Entity Instance] --> save() called
         |
         v
[validateInputs() executed]
         |
         v
[isPersistent() returns true]
         |
         v
[getPersistentKeyValue() called]
         |
         v
[Value exists: NOT new entity]
         |
         v
[getApiEndpoint() returns base URL]
         |
         v
[Construct PUT URL: endpoint + "/" + keyValue]
         |
         v
[Example: "/api/products" + "/" + "laptop-dell-xps-13"]
         |
         v
[Final URL: "/api/products/laptop-dell-xps-13"]
         |
         v
[axios.put(url, toDictionary())]
```

### Flujo URL Construction delete()

```
[Entity Instance] --> delete() called
         |
         v
[isPersistent() returns true]
         |
         v
[getPersistentKeyValue() called]
         |
         v
[Value: "laptop-dell-xps-13"]
         |
         v
[getApiEndpoint() returns "/api/products"]
         |
         v
[Construct DELETE URL: endpoint + "/" + keyValue]
         |
         v
[Final URL: "/api/products/laptop-dell-xps-13"]
         |
         v
[axios.delete(url)]
```

### Flujo URL Construction getElement()

```
[Entity Class] --> getElement(id) called
         |
         v
[id parameter: "laptop-dell-xps-13"]
         |
         v
[isPersistent() returns true]
         |
         v
[getApiEndpoint() returns "/api/products"]
         |
         v
[Construct GET URL: endpoint + "/" + id]
         |
         v
[Final URL: "/api/products/laptop-dell-xps-13"]
         |
         v
[axios.get(url)]
         |
         v
[JSON response deserialized to entity]
```

## 6. Reglas Obligatorias

1. PersistentKey property DEBE tener valor único across entity instances avoiding identifier collisions URL conflicts backend routing errors
2. Decorator DEBE aplicarse property level NO class level porque identifies specific property field usado identifier URL construction
3. PersistentKey property value DEBE ser URL-safe avoiding special characters requiring encoding spaces slashes question marks proper HTTP paths
4. PersistentKey value DEBE permanecer immutable post-creation avoiding URL changes broken links references invalidated paths
5. Backend API endpoints DEBEN accept persistent key values URL path parameters routing matching returning appropriate entities
6. Multiple diferentes properties decorated PersistentKey dentro same entity NO permitido; single property exclusively persistent key avoiding ambiguity confusion
7. getPersistentKeyValue() retorno DEBE checked null undefined before URL construction preventing malformed URLs missing segments runtime errors
8. Persistent entities sin PersistentKey decorator DEBEN usar primary key fallback default behavior ensuring backward compatibility existing entities unchanged

## 7. Prohibiciones

1. NO usar mutable properties como persistent key; identifiers DEBEN ser immutable post-creation avoiding URL instability broken references
2. NO decorar multiple properties PersistentKey; single property exclusively identifier avoiding ambiguity conflicts URL construction decision
3. NO cambiar persistent key valor existing entity; identifier immutability fundamental URL stability referential integrity persistence operations
4. NO asumir persistent key value unique validated; backend responsible uniqueness constraints enforcement persistent key decorator solo defines property NO validates values
5. NO usar composite multi-field keys; decorator supports single property only complex keys require custom URL building override methods manual construction
6. NO usar special characters sin URL encoding; persistent key values DEBE URL-safe preventing malformed HTTP paths requests failures
7. NO exponer sensitive data persistent key valores; URLs logged cached visible users avoiding PII security risks exposure attacks
8. NO usar persistent key values filtering sorting frontend operations; primary key appropriate efficient in-memory manipulations persistent key URL purposes exclusively

## 8. Dependencias

### Decoradores Relacionados

**ApiEndpoint (REQUERIDO):** Define base URL endpoint API requests. PersistentKey value appended ApiEndpoint forming complete URLs individual entity operations. Sin ApiEndpoint persistent URLs cannot constructed causing runtime errors.

**Persistent (REQUERIDO indirectamente):** Habilita HTTP persistence operations. PersistentKey meaningless non-persistent entities operating memory-only mode no HTTP URLs constructed never used.

**Primary (RELACIONADO):** Define primary key entity internal identification. PersistentKey diferente purpose: Primary internal entity identity, PersistentKey external API URLs identifier potentially different properties serving different concerns.

### Framework Dependencies

**BaseEntity CRUD Methods (REQUERIDO):** save() delete() getElement() methods implement URL construction logic consultando getPersistentKeyValue() accessor appending identifiers request paths. Decorator depends estos methods using metadata constructing HTTP URLs appropriate endpoints.

**Application.axiosInstance (REQUERIDO):** Axios instance executes HTTP requests URLs constructed using persistent key values. API endpoints backend routing must accept identifiers URL path parameters matching returning appropriate entities.

## 9. Relaciones

### Relación con Primary Decorator

Primary decorator y PersistentKey decorator serve different purposes potentially same property different properties: Primary defines internal entity unique identifier in-memory filtering comparisons primary key database representation; PersistentKey defines external API URL identifier HTTP request path construction. Coordination pattern: Primary internal concern, PersistentKey external concern separation allowing each layer use appropriate identifier type. Default behavior: PersistentKey NO configured falls back primary key single identifier scenario avoiding duplication configuration.

### Relación con ApiEndpoint

ApiEndpoint decorator y PersistentKey decorator trabajan conjuntamente URL construction: ApiEndpoint provides base path segment, PersistentKey value appended completing individual entity URLs. Pattern: `@ApiEndpoint('/api/products')` base, `@PersistentKey()` decorates slug property, URL constructed `/api/products/laptop-dell-xps-13` combining base path slug value targeted requests.

### Relación con CRUD Operations

CRUD methods save() delete() getElement() implement URL construction logic consultando getPersistentKeyValue() accessor. Operations verifica isPersistent() executing HTTP requests when true using persistent key values appending URLs. Non-persistent entities skip networking persistent key unused CRUD operations memory-only mock data mode.

### Relación con Validation System

Validation system @Required @Validation @AsyncValidation NOT automatically enforce persistent key uniqueness; decorator defines property NO validates values. Backend responsible uniqueness constraints violations. Developer may implement @Unique decorator persistent key property ensuring client-side uniqueness checking pre-save validation preventing duplicate identifiers submission.

## 10. Notas de Implementación

### Uso Común Persistent Key Slug

```typescript
import { PersistentKey } from '@/decorations/persistent_key_decorator';
import { ApiEndpoint } from '@/decorations/api_endpoint_decorator';
import { ModuleName } from '@/decorations/module_name_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Slug', String)
    @PersistentKey()
    slug!: string;
    
    @PropertyName('Product Name', String)
    name!: string;
}
```

Slug persistent key configuration: decorator applied slug property marking identifier URLs instead integer id. URLs constructed /api/products/laptop-dell-xps-13 human-readable SEO-friendly avoiding integer id exposure.

### Uso UUID Persistent Key

```typescript
@ModuleName('User', 'Users')
@ApiEndpoint('/api/users')
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('UUID', String)
    @PersistentKey()
    uuid!: string;
    
    @PropertyName('Username', String)
    username!: string;
}
```

UUID persistent key configuration: UUIDs immutable unique identifiers preferred security distributed systems avoiding sequential id enumeration attacks predictable URLs.

### Default Fallback Primary Key

```typescript
@ModuleName('Customer', 'Customers')
@ApiEndpoint('/api/customers')
export class Customer extends BaseEntity {
    @PropertyName('Customer ID', Number)
    @Primary()
    id!: number;
    
    @PropertyName('Customer Name', String)
    name!: string;
}
```

Primary key fallback: NO PersistentKey decorator applied getPersistentKey() retorna primary property 'id' default behavior backward compatible URLs /api/customers/42 using integer id.

### Custom Code Persistent Key

```typescript
@ModuleName('Order', 'Orders')
@ApiEndpoint('/api/orders')
export class Order extends BaseEntity {
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyName('Order Code', String)
    @PersistentKey()
    orderCode!: string;
    
    @PropertyName('Total', Number)
    total!: number;
}
```

Order code persistent key: business-friendly identifiers like ORD-2024-001234 human-readable meaningful URLs customer service references avoiding exposing internal database ids.

### URL Encoding Special Characters

```typescript
const product = new Product();
product.slug = 'laptop with spaces';

await product.save();
```

Developer responsibility: URL encoding necessary special characters spaces slashes etc. Persistent key decorator NO automatic encoding values. Call encodeURIComponent() before save if needed proper HTTP paths avoiding malformed URLs.

### Comparison Primary vs PersistentKey

| Aspecto | @Primary | @PersistentKey |
|---------|----------|---------------|
| Purpose | Internal entity identity | External API URLs |
| Default | 'id' property | Falls back Primary |
| Usage | In-memory filtering comparisons | HTTP request URL construction |
| Visibility | Internal application logic | Exposed HTTP URLs logs |
| Mutability | Typically immutable | Must be immutable |
| Type | Usually numeric | String UUID slug code |

## 11. Referencias Cruzadas

**primary-property-decorator.md:** Define primary key entity internal identification. PersistentKey diferente purpose serving external API URLs potentially different property primary key separation concerns.

**api-endpoint-decorator.md:** Define base URL endpoint API requests. PersistentKey value appended forming complete URLs individual entity operations coordination URL construction complete paths.

**persistent-decorator.md:** Habilita HTTP persistence operations. PersistentKey usado only persistent entities constructing URLs HTTP requests non-persistent entities skip networking persistent key unused.

**unique-decorator.md:** Validates uniqueness property values. Developer may apply @Unique persistent key property ensuring client-side uniqueness checking preventing duplicate identifiers submission backend violations.

**crud-operations.md (BaseEntity layer):** Documenta save() delete() getElement() implementation details URL construction logic using getPersistentKeyValue() accessor appending identifiers HTTP request paths.

**01-basic-crud.md (Tutorials):** Tutorial demonstrating CRUD operations including persistent key configuration URL construction patterns backend integration examples.
