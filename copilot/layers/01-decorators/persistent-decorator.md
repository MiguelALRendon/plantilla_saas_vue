# Persistent Decorator

## 1. Propósito

El decorador Persistent marca clase entity como persistente indicando que datos deben sincronizarse con servidor backend mediante HTTP requests usando axios instance. Este decorador fundamental determina comportamiento CRUD operations save(), delete(), getElementList(), getElement() controlando si ejecutan peticiones HTTP a API REST o operan exclusivamente en memoria local con mock data. Critical para arquitectura data persistence distinguishing entre entities production-ready synchronized con database versus development-only entities usando static data testing demos prototyping sin require backend disponible running. El decorador almacena boolean flag en prototype usando PERSISTENT_METADATA Symbol accesible through isPersistent() accessor static instance methods consulted por CRUD methods antes ejecutar axios requests permitiendo conditional logic: persistent entities hacen POST/PUT/DELETE/GET requests al ApiEndpoint configurado transmitting toDictionary() payload receiving JSON responses constructing entity instances; non-persistent entities bypass networking storing data exclusively client-side memory returning getMockData() static arrays avoiding HTTP overhead eliminating backend dependency development isolation unit testing scenarios. La implementación permite hybrid architectures donde mismo codebase entities puede operate persistent non-persistent modes controlled environment variables feature flags configuration eliminating code duplication maintaining single entity definition adapting runtime behavior context-appropriate data synchronization strategies. Beneficios operacionales: development velocity improved developers work offline mock data no backend setup required iterating UI logic validation flows rapidly testing; production reliability ensured persistent flag true entities sync database correctly maintaining data integrity transactional consistency backend-enforced business rules; testing simplified non-persistent mode facilitates isolated unit tests avoiding network mocking complexity deterministic data returns predictable test outcomes; gradual migration supported entities initially non-persistent converted persistent incrementally as backend endpoints become available reducing risk phased rollouts; environment flexibility same entity code deployed development staging production environments appropriate persistence behavior configuration-driven adaptive deployment contexts different infrastructure availability requirements.

## 2. Alcance

### Responsabilidades

- Definir boolean flag persistent parameter decorator indicating whether entity class debe synchronize backend via HTTP requests o operate locally memory-only mode
- Almacenar persistent flag en entity class prototype usando PERSISTENT_METADATA Symbol efficient O(1) metadata lookup durante CRUD operations execution avoiding property iteration overhead
- Proveer isPersistent() accessor method tanto static level (consulted sin entity instance) como instance level (delegating static method) unified API consistent access pattern
- Integrar con save() method BaseEntity executing conditional logic: if isPersistent() true proceed HTTP POST/PUT request transmitting toDictionary() to ApiEndpoint; if false skip networking storing data local memory calling afterSave() hook immediately
- Integrar con delete() method executing conditional logic: if isPersistent() true execute HTTP DELETE request to ApiEndpoint/{id}; if false skip networking removing data local memory calling afterDelete() hook immediately
- Integrar con getElementList() static method executing conditional logic: if isPersistent() true execute HTTP GET request ApiEndpoint returning entity array from JSON response; if false skip networking returning getMockData() static array local data
- Integrar con getElement() static method executing conditional logic: if isPersistent() true execute HTTP GET request ApiEndpoint/{id} returning single entity from JSON response; if false skip networking searching getMockData() array matching id returning entity or null
- Soportar default value true cuando decorator NO applied: entities assumed persistent unless explicitly marked non-persistent default production-ready behavior requiring explicit opt-out development testing scenarios

### Límites

- No valida existencia ApiEndpoint decorator combinado; persistent entities MUST have ApiEndpoint configurado developer responsible ensuring decorator pairing correctness avoiding runtime errors undefined URLs
- No provee mock data automáticamente; non-persistent entities DEBE override getMockData() static method returning array entity instances developer responsible implementing mock data generation logic
- No maneja axios instance configuration; Application.axiosInstance debe estar configurado externally con base URL headers interceptors timeout persistent decorator usa existing axios instance sin modificar configuración
- No implementa retry logic error handling advanced; failed HTTP requests caught logged retornan false or empty arrays developer responsible implementing custom retry logic circuit breakers error recovery strategies if needed
- No sincroniza metadata backend; persistent flag es frontend-only metadata NO transmitted API requests backend unaware persistence mode frontend decision decorator controlling client-side behavior exclusively
- No valida backend responses structure; HTTP responses assumed conform expected JSON format compatible entity constructor updateFromDictionary() methods developer responsible ensuring API contracts match entity schema definitions
- No proporciona caching mechanism; every getElementList() getElement() call persistent mode hace fresh HTTP request network overhead repeated calls developer responsible implementing caching layer if needed
- No controla permissions authorization; isPersistent() retorna boolean based metadata does NOT check user permissions authorization handled separately ModulePermission decorator backend API access control orthogonal concerns

## 3. Definiciones Clave

### PERSISTENT_METADATA Symbol

Identificador único usado property key prototype almacenar persistent flag boolean. Implementación: `export const PERSISTENT_METADATA = Symbol('persistent')`. Storage: `Product.prototype[PERSISTENT_METADATA] = true`. Symbol provides collision-free key metadata storage evitando conflicts real properties methods entity protecting namespace integrity. Prototype-level storage (all instances share) porque persistence mode es type-level configuration NO instance-specific data: entire entity class es persistent or non-persistent uniformly all instances behave identically persistence behavior.

### Persistent Flag Type

Boolean value indicating whether entity synchronizes backend. Values: `true` entity hace HTTP requests CRUD operations transmitting data API persisting database, `false` entity operates memory-only mode skipping HTTP requests using mock data local storage. Type: `boolean`. Default: `true` cuando decorator not applied entities assumed persistent requiring explicit `@Persistent(false)` opt-out non-persistent behavior.

### Decorator Signature

Function signature: `function Persistent(persistent: boolean = true): ClassDecorator`. Parameter: `persistent` boolean flag indicating persistence mode default value `true` making decorator parameter optional allows `@Persistent()` shorthand equivalent `@Persistent(true)`. Retorna ClassDecorator function applying metadata entity class prototype.

### isPersistent() Accessor

Método estático BaseEntity retornando boolean indicating entity persistence mode. Implementación: `public static isPersistent(): boolean { const persistent = this.prototype[PERSISTENT_METADATA]; return persistent !== false; }`. Ubicación: src/entities/base_entitiy.ts líneas ~1000-1020. Default behavior: retorna `true` if metadata undefined (decorator not applied) ensuring entities persistent by default unless explicitly configured non-persistent. También existe instance method: `public isPersistent(): boolean { const constructor = this.constructor as typeof BaseEntity; return constructor.isPersistent(); }` delegating static method enabling same query instance or class level consistently.

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
export const PERSISTENT_METADATA = Symbol('persistent');

export function Persistent(persistent: boolean = true): ClassDecorator {
    return function (target: any) {
        target.prototype[PERSISTENT_METADATA] = persistent;
    };
}
```

Ubicación: src/decorations/persistent_decorator.ts líneas ~1-10. Decorator almacena boolean flag prototype de entity class using Symbol key collision-free metadata storage. Parameter persistent defaults `true` making explicit `@Persistent()` equivalent `@Persistent(true)` simplifying common case persistent entities requiring explicit `@Persistent(false)` non-persistent opt-out.

### Accessor Methods en BaseEntity

```typescript
public static isPersistent(): boolean {
    const persistent = this.prototype[PERSISTENT_METADATA];
    return persistent !== false;
}

public isPersistent(): boolean {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.isPersistent();
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~1000-1020. Static method consulta prototype metadata retornando boolean. Default `true` cuando metadata missing ensures entities persistent unless explicitly configured otherwise. Instance method delegates static method providing unified API query persistence mode instance or class level interchangeably.

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
        console.log('[BaseEntity] Not persistent, saving locally');
        this.afterSave();
        return true;
    }
    
    const endpoint = constructor.getApiEndpoint();
    const primaryKey = constructor.getPrimaryProperty();
    const isNew = !this[primaryKey];
    
    try {
        let response;
        
        if (isNew) {
            response = await Application.axiosInstance.post(
                endpoint,
                this.toDictionary()
            );
        } else {
            response = await Application.axiosInstance.put(
                `${endpoint}/${this[primaryKey]}`,
                this.toDictionary()
            );
        }
        
        this.updateFromDictionary(response.data);
        this.afterSave();
        
        Application.eventBus.emit('entity-saved', {
            entityClass: constructor,
            entity: this,
            isNew: isNew
        });
        
        return true;
    } catch (error) {
        console.error('[BaseEntity] Save failed:', error);
        return false;
    }
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~250-330. Método save() verifica isPersistent() antes intentar HTTP request. Non-persistent entities skip networking llamando afterSave() hook immediately retornando `true` success simulation. Persistent entities proceed POST request nuevo entity or PUT request existing entity transmitting toDictionary() payload receiving JSON response updating entity state emit events.

### Integración con delete() Method

```typescript
public async delete(): Promise<boolean> {
    this.beforeDelete();
    
    const constructor = this.constructor as typeof BaseEntity;
    
    if (!constructor.isPersistent()) {
        console.log('[BaseEntity] Not persistent, deleting locally');
        this.afterDelete();
        return true;
    }
    
    const endpoint = constructor.getApiEndpoint();
    const primaryKey = constructor.getPrimaryProperty();
    const id = this[primaryKey];
    
    try {
        await Application.axiosInstance.delete(`${endpoint}/${id}`);
        
        this.afterDelete();
        
        Application.eventBus.emit('entity-deleted', {
            entityClass: constructor,
            entity: this,
            id: id
        });
        
        return true;
    } catch (error) {
        console.error('[BaseEntity] Delete failed:', error);
        return false;
    }
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~340-380. Método delete() verifica isPersistent() antes intentar HTTP request. Non-persistent entities skip networking llamando afterDelete() hook immediately. Persistent entities proceed DELETE request ApiEndpoint/{id} removing entity server-side emit events success.

### Integración con getElementList() Static Method

```typescript
public static async getElementList(): Promise<BaseEntity[]> {
    if (!this.isPersistent()) {
        console.log('[BaseEntity] Not persistent, returning mock data');
        return this.getMockData();
    }
    
    const endpoint = this.getApiEndpoint();
    
    try {
        const response = await Application.axiosInstance.get(endpoint);
        
        const entities = response.data.map((data: any) => {
            const entity = new this();
            entity.updateFromDictionary(data);
            return entity;
        });
        
        Application.eventBus.emit('entity-list-fetched', {
            entityClass: this,
            entities: entities,
            count: entities.length
        });
        
        return entities;
    } catch (error) {
        console.error('[BaseEntity] getElementList failed:', error);
        return [];
    }
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~390-430. Método getElementList() verifica isPersistent() antes HTTP request. Non-persistent entities retorna getMockData() static array avoiding networking. Persistent entities execute GET request ApiEndpoint receiving JSON array constructing entity instances updateFromDictionary() emit events return populated array.

### Integración con getElement() Static Method

```typescript
public static async getElement(id: any): Promise<BaseEntity | null> {
    if (!this.isPersistent()) {
        const mockData = this.getMockData();
        const primaryKey = this.getPrimaryProperty();
        
        return mockData.find(entity => entity[primaryKey] === id) || null;
    }
    
    const endpoint = this.getApiEndpoint();
    
    try {
        const response = await Application.axiosInstance.get(`${endpoint}/${id}`);
        
        const entity = new this();
        entity.updateFromDictionary(response.data);
        
        Application.eventBus.emit('entity-fetched', {
            entityClass: this,
            entity: entity,
            id: id
        });
        
        return entity;
    } catch (error) {
        console.error('[BaseEntity] getElement failed:', error);
        return null;
    }
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~440-480. Método getElement() verifica isPersistent() antes HTTP request. Non-persistent entities busca getMockData() array matching id primary key retornando entity or null. Persistent entities execute GET request ApiEndpoint/{id} receiving JSON single entity constructing instance emit event return entity or null error handling.

## 5. Flujo de Funcionamiento

### Flujo Persistent Entity save()

```
[Entity Instance] --> save() called
         |
         v
[beforeSave() hook executed]
         |
         v
[validateInputs() executed]
         |
         v
[isPersistent()? check]
         |
         +---> true: Persistent Entity
         |          |
         |          v
         |     [getApiEndpoint()]
         |          |
         |          v
         |     [Determine NEW or EXISTING]
         |          |
         |          +---> NEW: POST request
         |          |          |
         |          |          v
         |          |     [axios.post(endpoint, toDictionary())]
         |          |          |
         |          |          v
         |          |     [updateFromDictionary(response.data)]
         |          |
         |          +---> EXISTING: PUT request
         |                     |
         |                     v
         |                [axios.put(endpoint/id, toDictionary())]
         |                     |
         |                     v
         |                [updateFromDictionary(response.data)]
         |
         +---> false: Non-Persistent Entity
                    |
                    v
               [Skip HTTP, save locally]
                    |
                    v
               [afterSave() hook]
                    |
                    v
               [return true]
```

### Flujo Persistent Entity getElementList()

```
[Entity Class] --> getElementList() called
         |
         v
[isPersistent()? check]
         |
         +---> true: Persistent Entity
         |          |
         |          v
         |     [getApiEndpoint()]
         |          |
         |          v
         |     [axios.get(endpoint)]
         |          |
         |          v
         |     [response.data.map(data => new Entity(data))]
         |          |
         |          v
         |     [emit 'entity-list-fetched' event]
         |          |
         |          v
         |     [return entities array]
         |
         +---> false: Non-Persistent Entity
                    |
                    v
               [getMockData() called]
                    |
                    v
               [return mock entities array]
```

### Flujo Non-Persistent Entity Operations

```
[Non-Persistent Entity] --> CRUD operation called
         |
         v
[isPersistent() returns false]
         |
         v
[Skip HTTP networking]
         |
         v
[Execute local-only logic]
         |
         +---> save(): afterSave() hook, return true
         +---> delete(): afterDelete() hook, return true
         +---> getElementList(): return getMockData()
         +---> getElement(): search getMockData() by id
```

## 6. Reglas Obligatorias

1. Persistent entities DEBEN tener ApiEndpoint decorator definido proporcionando URL base para HTTP requests evitando undefined endpoint errors runtime failures
2. Non-persistent entities DEBEN implementar getMockData() static method retornando array entity instances proporcionando data source getElementList() getElement() operations avoiding empty returns
3. isPersistent() check DEBE ejecutarse antes cualquier HTTP request CRUD operations asegurando non-persistent entities skip networking consistently behavior contract enforced
4. Persistent flag default value DEBE ser true ensuring entities persistent unless explicitly configured non-persistent production-ready default safe assumptions
5. Decorator DEBE aplicarse class level NO property level porque persistence mode es entity-wide configuration affecting entire entity behavior uniformly all instances
6. getMockData() implementation DEBE retornar new instances cada llamada avoiding shared mutable state contamination between calls immutable data guarantees
7. Persistent entities HTTP errors DEBEN handled gracefully retornando boolean false or empty arrays logging errors NOT throwing exceptions maintaining API contract caller expectations
8. Non-persistent entities save() delete() DEBEN call lifecycle hooks afterSave() afterDelete() maintaining consistency persistent non-persistent behavior hook execution guaranteed

## 7. Prohibiciones

1. NO modificar persistent flag runtime después decoration time; metadata debe permanecer immutable post-definition avoiding dynamic behavior changes unpredictable state
2. NO asumir ApiEndpoint existe cuando isPersistent() true; developer responsable validar decorator pairing correctness framework NO enforce decorator dependencies automatically
3. NO usar persistent decorator controlar authorization access control; ModulePermission decorator backend API security handle authorization persistence orthogonal concern different responsibility
4. NO implementar HTTP requests manualmente dentro CRUD methods bypassing isPersistent() check; decorator contract DEBE respetado uniform behavior consistency
5. NO compartir mutable state entre getMockData() calls; cada invocación DEBE retornar fresh independent instances avoiding side effects data contamination
6. NO throw exceptions cuando HTTP request fails; CRUD methods DEBE retornar boolean false or empty arrays maintaining API contract graceful degradation
7. NO sincronizar persistent flag backend metadata; es frontend-only configuration NOT transmitted API requests backend unaware persistence mode
8. NO usar persistent decorator habilitar caching; implementar caching layer separately orthogonal concern override getElementList() if needed custom caching logic

## 8. Dependencias

### Decoradores Relacionados

**ApiEndpoint (REQUERIDO para Persistent true):** Define URL base endpoint para HTTP requests. Persistent entities hacen POST/PUT/DELETE/GET requests ApiEndpoint proporcionado. Sin ApiEndpoint persistent entities fallan runtime undefined URL errors.

**ApiMethods (OPCIONAL):** Restringe métodos HTTP permitidos. Coordina con Persistent verificando allowed methods antes ejecutar requests.

**PersistentKey (OPCIONAL):** Define primary key propiedad usada construir URLs individuales entity requests PUT/DELETE GET by id complementando ApiEndpoint base URL.

### Framework Dependencies

**Application.axiosInstance (REQUERIDO):** Axios instance configurada singleton Application usado ejecutar HTTP requests. Persistent decorator assumes axiosInstance available configured base URL headers interceptors timeout. Sin axios configured persistent operations fail runtime.

**BaseEntity CRUD Methods (REQUERIDO):** save() delete() getElementList() getElement() methods implement conditional logic based isPersistent() check. Decorator depends estos methods consultando metadata executing appropriate persistent non-persistent behavior.

**Event Bus (OPCIONAL):** Application.eventBus usado emit events entity-saved entity-deleted entity-list-fetched entity-fetched coordinating UI updates reactive state management. Non-persistent entities puede skip event emission or emit locally without backend coordination.

## 9. Relaciones

### Relación con ApiEndpoint

Persistent decorator y ApiEndpoint decorator trabajan conjuntamente: Persistent determina IF hacer HTTP requests, ApiEndpoint determina WHERE hacer requests. Coordination pattern: `@Persistent()` habilita networking, `@ApiEndpoint('/api/products')` especifica target URL. Persistent entities sin ApiEndpoint fail runtime when attempting HTTP requests undefined URL errors.

### Relación con CRUD Operations BaseEntity

CRUD methods save() delete() getElementList() getElement() implementan conditional logic consultando isPersistent() metadata. Persistent mode branches execute axios HTTP requests transmitting receiving JSON data. Non-persistent mode branches skip networking execute local-only logic mock data returns lifecycle hooks llamados. Decorator influencia behavior CRUD methods indirectamente through metadata query pattern.

### Relación con Lifecycle Hooks

afterSave() afterDelete() hooks ejecutados tanto persistent como non-persistent entities maintaining consistency behavior pattern. Persistent entities llaman hooks AFTER successful HTTP request completion. Non-persistent entities llaman hooks immediately AFTER skipping networking. Hook execution guaranteed ambos modes allowing developer implement consistent side effects reactive updates regardless persistence mode.

### Relación con Validation System

Validation system @Required @Validation @AsyncValidation ejecuta ANTES isPersistent() check save() method. Validaciones ocurren identically persistent non-persistent entities ensuring data integrity client-side validation rules enforced uniformly. Failed validation short-circuits save() retornando false before networking attempted. Persistent non-persistent entities share identical validation flow only differing post-validation persistence mechanism.

## 10. Notas de Implementación

### Uso Común Entity Persistente

```typescript
import { Persistent } from '@/decorations/persistent_decorator';
import { ApiEndpoint } from '@/decorations/api_endpoint_decorator';
import { ModuleName } from '@/decorations/module_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    id!: number;
    name!: string;
    price!: number;
}
```

Persistent entity configuration: decorator applied explicitly habilita HTTP synchronization CRUD operations communicate backend API endpoints. ApiEndpoint requerido proporciona base URL requests.

### Uso Entity No Persistente Mock Data

```typescript
@ModuleName('MockProduct', 'Mock Products')
@Persistent(false)
export class MockProduct extends BaseEntity {
    id!: number;
    name!: string;
    
    public static getMockData(): MockProduct[] {
        return [
            Object.assign(new MockProduct(), { id: 1, name: 'Mock Product 1' }),
            Object.assign(new MockProduct(), { id: 2, name: 'Mock Product 2' }),
            Object.assign(new MockProduct(), { id: 3, name: 'Mock Product 3' })
        ];
    }
}
```

Non-persistent entity configuration: `@Persistent(false)` disables HTTP networking CRUD operations use getMockData() static method returning mock entity array. ApiEndpoint NO requerido non-persistent entities skip networking entirely.

### Configuration Environment-Based Persistence

```typescript
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent(USE_BACKEND)
export class Product extends BaseEntity {
    id!: number;
    name!: string;
    
    public static getMockData(): Product[] {
        return [
            Object.assign(new Product(), { id: 1, name: 'Laptop', price: 1299 }),
            Object.assign(new Product(), { id: 2, name: 'Mouse', price: 99 })
        ];
    }
}
```

Environment-driven persistence: same entity code adapts behavior based environment variable configuration. Development mode uses mock data avoiding backend dependency. Production mode enables backend synchronization. `.env.development`: `VITE_USE_BACKEND=false`. `.env.production`: `VITE_USE_BACKEND=true`.

### Override CRUD Methods Custom Logic

```typescript
@ModuleName('Product', 'Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    id!: number;
    name!: string;
    price!: number;
    
    public override async save(): Promise<boolean> {
        if (this.price < 0) {
            this.errors['price'] = 'Price cannot be negative';
            return false;
        }
        
        return await super.save();
    }
}
```

Custom validation save override: entity-specific business rules implementadas before calling super.save() executing standard persistent HTTP request logic. Validation failures short-circuit save retornando false without networking.

### Testing Non-Persistent Mode

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { Product } from '@/entities/product';
import { PERSISTENT_METADATA } from '@/decorations/persistent_decorator';

describe('Product Entity', () => {
    beforeEach(() => {
        Product.prototype[PERSISTENT_METADATA] = false;
    });
    
    it('should save product locally', async () => {
        const product = new Product();
        product.name = 'Test Product';
        product.price = 99;
        
        const saved = await product.save();
        
        expect(saved).toBe(true);
    });
});
```

Test configuration: prototype metadata overridden forcing non-persistent mode tests avoiding HTTP mocking complexity deterministic behavior isolated unit testing.

### Comparison Persistent vs Non-Persistent

| Aspecto | @Persistent(true) | @Persistent(false) |
|---------|-------------------|-------------------|
| save() | POST/PUT HTTP request | Solo guarda en memoria |
| delete() | DELETE HTTP request | Solo elimina de memoria |
| getElementList() | GET HTTP request | Retorna mock data |
| getElement() | GET HTTP request | Busca en mock data |
| Requiere @ApiEndpoint | Sí | No |
| Uso típico | Producción con backend | Desarrollo, testing, demos |

## 11. Referencias Cruzadas

**api-endpoint-decorator.md:** Define URL base endpoint HTTP requests persistent entities. Persistent decorator requiere ApiEndpoint configured providing target URL networking operations.

**api-methods-decorator.md:** Define allowed HTTP methods entity class. Coordina with Persistent checking method permissions before executing requests.

**persistent-key-decorator.md:** Define primary key property entity used construct URLs individual entity requests PUT DELETE GET by id. Complements ApiEndpoint base URL PersistentKey value appended forming complete endpoint URLs.

**crud-operations.md (BaseEntity layer):** Documenta save() delete() getElementList() getElement() implementation details including isPersistent() conditional logic persistence mode branching HTTP request execution mock data returns.

**application-singleton.md (Application layer):** Documenta Application.axiosInstance configuration axios instance used persistent entities HTTP requests base URL headers interceptors timeout settings affecting networking behavior.

**01-basic-crud.md (Tutorials):** Tutorial demonstrating persistent entities CRUD operations end-to-end flows including decoration configuration HTTP request behavior backend integration patterns.
