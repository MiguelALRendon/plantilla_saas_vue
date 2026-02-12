# Primary Property Decorator

## 1. Propósito

El decorador Primary marca propiedad entity como primary key identificador único registro determinando cual campo valor distingue entity instance other instances database collection. Este decorador fundamental establece property usada determining whether entity NEW pending creation o EXISTING requiring update durante save() operations consulted checking if primary key value exists null undefined indicating new creation versus populated value indicating existing update requirement. Critical para arquitectura entity lifecycle management CRUD operations differentiating create versus update flows determining HTTP method POST new entities versus PUT/PATCH existing entities based primary key presence checking. El decorador almacena property name string en prototype usando PRIMARY_PROPERTY_METADATA Symbol accesible through getPrimaryProperty() accessor queried by save() delete() validation methods determining entity state NEW or EXISTING enabling appropriate operation execution creation updates deletions. La implementación provides uniform consistent mechanism identifying entities regardless specific property name chosen developer flexibility: some entities use 'id' traditional autoincrement integer, others 'userId' 'productId' prefixed naming conventions, UUID-based systems use 'uuid' immutable identifiers, legacy systems integration maintaining existing primary key schemas 'legacyId' compatibility. Default behavior fallback 'id' property assumed primary key when decorator NO applied maintaining backward compatibility existing entities avoiding breaking changes required explicit decoration minimal disruption standard convention following RESTful patterns common database schemas. Beneficios operacionales: determination save NEW versus EXISTING simplified single metadata query avoiding complex conditional logic scattered codebase centralized decision; validation rules automatically applied primary keys Required implicit uniqueness assumptions preventing duplicate key insertion attempts; relationships foreign key references resolving using primary key values joining entities lookups; UI state management detecting dirty entities comparing current primary key value original loaded state tracking modifications; migration flexibility changing primary key property single decorator change propagates system-wide no manual rewrites scattered comparisons checks throughout codebase consistent identifier access patterns.

## 2. Alcance

### Responsabilidades

- Definir nombre property string usado primary key unique identifier entity distinguishing instances collections databases
- Almacenar primary property name en entity class prototype usando PRIMARY_PROPERTY_METADATA Symbol efficient O(1) metadata lookup durante entity state determination CRUD operations
- Proveer getPrimaryProperty() accessor method tanto static level (consulted sin entity instance) como instance level (delegating static method constructor) unified API consistent access patterns
- Integrar con save() method BaseEntity determining NEW versus EXISTING: primary key value null undefined indicates NEW entity POST endpoint creation; populated value indicates EXISTING entity PUT/PATCH endpoint update targeted by key
- Integrar con delete() method using primary key value default persistence key cuando PersistentKey decorator NO configured constructing DELETE URLs identifying target entity removal backend
- Integrar con validation system implicit Required assumption primary keys: framework puede skip Required validation primary keys assuming backend-generated autoincrement sequences UUIDs server-assigned values post-creation
- Proveer default fallback value 'id' cuando decorator NO applied: getPrimaryProperty() retorna 'id' string assuming standard convention RESTful patterns minimizing explicit configuration requirements
- Soportar any property type configured primary key: integer autoincrement ids, UUID strings, custom string identifiers codes SKUs flexibility domains backend technologies database systems

### Límites

- No valida uniqueness primary key values database; backend responsible uniqueness constraints enforcement violations handled API error responses database integrity checks
- No genera primary key values automatically; server backend responsible assigning primary keys autoincrement sequences UUID generation functions entity creation responses
- No convierte valores type coercion formatting; primary key value transmission raw property value original type developer responsible type consistency matching API expectations
- No valida existencia property decorated; if primary property references non-existent property runtime errors occur accessing undefined property developer verifying correctness decoration
- No sincroniza metadata backend; primary key selection frontend decision determining entity identity State management backend unaware which property frontend considers primary coordination implicit API contracts
- No maneja composite multi-field keys; decorator supports single property only complex composite key scenarios require custom save override logic manually determining NEW versus EXISTING state
- No proporciona validation primary key immutability; framework NO prevents changing primary key values post-creation developer responsible ensuring immutability avoiding identity confusion
- No diferencia logical versus physical primary keys; decorator marks single property regardless database implementation may have different physical keys storage optimization indexing

## 3. Definiciones Clave

### PRIMARY_PROPERTY_METADATA Symbol

Identificador único usado property key prototype almacenar primary property name string. Implementación: `export const PRIMARY_PROPERTY_METADATA = Symbol('primaryProperty')`. Storage: `Product.prototype[PRIMARY_PROPERTY_METADATA] = 'id'`. Symbol provides collision-free key metadata storage evitando conflicts real properties methods entity protecting namespace integrity preventing accidental overwrites. Prototype-level storage (all instances share) porque primary property es type-level configuration NO instance-specific data: entire entity class usa same property primary key uniformly all instances identity comparisons persistence operations.

### Primary Property Name

String value indicating cual property serves primary key unique identifier distinguishing entity instances. Values: property name existing decorated entity common 'id', custom 'userId', 'productId', 'uuid', 'legacyId' any unique identifier field. Type: `string`. Default: 'id' cuando decorator NO configured fallback standard convention RESTful patterns common database schemas autoincrement integer ids minimizing explicit configuration.

### Decorator Signature

Function signature: `function Primary(): PropertyDecorator`. Parameters: none decorator applied property directly marking primary key candidate extracting property name automatically decoration context. Retorna PropertyDecorator function applying metadata entity property storing property name prototype accessed later identity determination CRUD operations.

### getPrimaryProperty() Accessor

Método estático BaseEntity retornando property name string usado primar y key unique identifier or default 'id' when NO configured. Implementación: `public static getPrimaryProperty(): string { const primaryProperty = this.prototype[PRIMARY_PROPERTY_METADATA]; return primaryProperty || 'id'; }`. Ubicación: src/entities/base_entitiy.ts líneas ~1080-1090. Fallback behavior: retorna 'id' when primary property metadata missing ensuring backward compatibility maintaining standard convention. También existe instance method: `public getPrimaryProperty(): string { const constructor = this.constructor as typeof BaseEntity; return constructor.getPrimaryProperty(); }` delegating static method enabling same query instance or class level consistently.

### getPrimaryValue() Accessor

Método instancia BaseEntity retornando actual value primary key property current entity instance. Implementación: `public getPrimaryValue(): any { const primaryProperty = this.getPrimaryProperty(); return this[primaryProperty]; }`. Ubicación: src/entities/base_entitiy.ts líneas ~1095-1100. Usage: determining entity state NEW (value null undefined) versus EXISTING (value populated) enabling appropriate CRUD operation selection save() method conditional logic.

## 4. Descripción Técnica

### Implementación del Decorator

```typescript
export const PRIMARY_PROPERTY_METADATA = Symbol('primaryProperty');

export function Primary(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        target.constructor.prototype[PRIMARY_PROPERTY_METADATA] = propertyKey;
    };
}
```

Ubicación: src/decorations/primary_property_decorator.ts líneas ~1-10. Decorator almacena property name prototype entity class using Symbol key collision-free metadata storage extracting propertyKey automatically decoration context parameter.

### Accessor Methods en BaseEntity

```typescript
public static getPrimaryProperty(): string {
    const primaryProperty = this.prototype[PRIMARY_PROPERTY_METADATA];
    return primaryProperty || 'id';
}

public getPrimaryProperty(): string {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getPrimaryProperty();
}

public getPrimaryValue(): any {
    const primaryProperty = this.getPrimaryProperty();
    return this[primaryProperty];
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~1080-1100. Accessors proporcionan consistent API querying primary property name obtaining actual value entity instance fallback 'id' default maintaining standard convention backward compatibility.

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
    const primaryValue = this.getPrimaryValue();
    const isNew = !primaryValue;
    
    try {
        let response;
        
        if (isNew) {
            response = await Application.axiosInstance.post(
                endpoint,
                this.toDictionary()
            );
        } else {
            response = await Application.axiosInstance.put(
                `${endpoint}/${primaryValue}`,
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

Ubicación: src/entities/base_entitiy.ts líneas ~250-330. Método save() usa getPrimaryValue() determining entity state isNew checking primary key value existence null undefined indicates NEW entity POST endpoint creation; populated value indicates EXISTING entity PUT endpoint update HTTP method selection based primary value check.

### Integración con delete() Method

```typescript
public async delete(): Promise<void> {
    this.beforeDelete();
    
    const constructor = this.constructor as typeof BaseEntity;
    
    if (!constructor.isPersistent()) {
        this.afterDelete();
        return;
    }
    
    const endpoint = constructor.getApiEndpoint();
    const primaryValue = this.getPrimaryValue();
    
    try {
        await Application.axiosInstance.delete(`${endpoint}/${primaryValue}`);
        
        this.afterDelete();
        
        return true;
    } catch (error) {
        console.error('[BaseEntity] Delete failed:', error);
        return false;
    }
}
```

Ubicación: src/entities/base_entitiy.ts líneas ~340-380. Método delete() usa getPrimaryValue() default persistence key when PersistentKey decorator NO configured constructing DELETE URLs appending primary value base endpoint targeting specific entity removal.

## 5. Flujo de Funcionamiento

### Flujo Determination NEW Entity

```
[Entity Instance] --> save() called
         |
         v
[getPrimaryValue() called]
         |
         v
[Primary property: 'id']
         |
         v
[Access: this.id]
         |
         v
[Value: undefined | null]
         |
         v
[isNew = true]
         |
         v
[POST endpoint creation]
         |
         v
[Server assigns primary key]
         |
         v
[updateFromDictionary assigns id]
```

### Flujo Determination EXISTING Entity

```
[Entity Instance] --> save() called
         |
         v
[getPrimaryValue() called]
         |
         v
[Primary property: 'id']
         |
         v
[Access: this.id]
         |
         v
[Value: 42 (populated)]
         |
         v
[isNew = false]
         |
         v
[PUT endpoint/42 update]
```

### Flujo Default Fallback 'id'

```
[Entity Class] --> getPrimaryProperty() called
         |
         v
[Check PRIMARY_PROPERTY_METADATA]
         |
         v
[Metadata: undefined (NO decorator)]
         |
         v
[Fallback: return 'id']
         |
         v
[Standard convention maintained]
```

## 6. Reglas Obligatorias

1. Primary property DEBE tener valor único across entity instances avoiding identifier collisions identity confusion duplicate records
2. Decorator DEBE aplicarse property level NO class level porque identifies specific property field usado primary key entity identification
3. Primary property value DEBE permanecer immutable post-creation avoiding identity confusion referential integrity violations broken relationships
4. Multiple different properties decorated Primary within same entity NO permitido; single property exclusively primary key avoiding ambiguity conflicts
5. Backend API DEBE assign primary key values creation responses entity lifecycle NEW to EXISTING transition server-generated identifiers autoincrement UUIDs
6. getPrimaryValue() return DEBE checked null undefined determining entity state isNew conditional logic save() operations accurate NEW versus EXISTING differentiation
7. Primary property DEBE excluded toDictionary() when creating NEW entities avoiding client-side primary key assignment conflicts server generation sequences
8. Validation system MAY skip Required validation primary keys assuming server-assigned values backend responsibility generation uniqueness enforcement

## 7. Prohibiciones

1. NO cambiar primary property value existing entity; identifier immutability fundamental referential integrity relationships foreign keys avoiding confusion
2. NO decorar multiple properties Primary; single property exclusively primary key avoiding ambiguity conflicts identity determination decision logic
3. NO asumir primary property value unique validated; backend responsible uniqueness constraints enforcement database integrity checks violations handling
4. NO usar mutable properties como primary key; identifiers DEBEN immutable post-creation avoiding identity instability confusion tracking
5. NO usar composite multi-field keys single Primary decorator; complex composite scenarios require custom save logic override determining NEW versus EXISTING manually
6. NO generar primary key values client-side; server backend responsible assignment autoincrement sequences UUID functions avoiding collisions conflicts
7. NO usar primary property storing business data; primary keys infrastructure identity only NOT domain information semantic meaning business logic
8. NO usar sequential predictable primary keys public APIs; security exposure enumeration attacks predictable URLs preferring UUIDs slugs alternatives

## 8. Dependencias

### Decoradores Relacionados

**PersistentKey (OPCIONAL):** Define different property API URLs compared primary key internal identity. Primary internal concern, PersistentKey external API concern potentially different properties serving different purposes separation.

**Unique (RELACIONADO):** Validates uniqueness property values. Primary keys inherently unique by definition but @Unique puede applied enforcing client-side uniqueness checks pre-save validation preventing backend violations.

**Required (RELACIONADO):** Validates required fields. Primary keys typically NOT decorated @Required assuming server-generated values autoincrement UUIDs backend assignment post-creation responses.

### Framework Dependencies

**BaseEntity CRUD Methods (REQUERIDO):** save() delete() methods implement conditional logic consultando getPrimaryValue() accessor determining entity state isNew selecting appropriate HTTP methods POST versus PUT/PATCH operations.

**Validation System (OPCIONAL):** Validation may skip Required checks primary keys assuming backend-generated values server responsibility assignment uniqueness enforcement database constraints.

## 9. Relaciones

### Relación con PersistentKey

Primary decorator y PersistentKey decorator may decorar same property or different properties serving different purposes: Primary internal entity identity in-memory filtering state management; PersistentKey external API URLs HTTP request paths. Default behavior: PersistentKey NO configured falls back primary property single identifier scenario avoiding duplication coordination.

### Relación con CRUD Operations

CRUD methods save() delete() implement conditional logic consultando getPrimaryValue() accessor. save() determina isNew checking primary value null undefined selecting POST creation versus PUT update HTTP methods. delete() uses primary value default persistence key constructing DELETE URLs when PersistentKey NO configured.

### Relación con Validation System

Validation system @Required @Validation typically skips primary keys assuming server-generated values backend assignment post-creation responses. Developer may explicitly decorate @Required primary keys enforcing client-side assignment validation specific scenarios custom workflows requiring explicit identifiers submission.

### Relación con Identity Determination

Primary property fundamental entity identity comparison tracking modifications detecting dirty state. UI state management compares original loaded primary value current value detecting changes determining save necessity unsaved modifications warnings.

## 10. Notas de Implementación

### Uso Común Primary Default 'id'

```typescript
import { ModuleName } from '@/decorations/module_name_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Product', 'Products')
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
}
```

Default primary key: NO Primary decorator applied getPrimaryProperty() retorna 'id' fallback standard convention minimizing explicit configuration backward compatible.

### Uso Custom Primary Property

```typescript
@ModuleName('User', 'Users')
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    @Primary()
    userId!: number;
    
    @PropertyName('Username', String)
    username!: string;
}
```

Custom primary key configuration: decorator applied userId property marking primary key instead default 'id' supporting naming conventions prefixed identifiers legacy schemas.

### UUID Primary Key

```typescript
@ModuleName('Order', 'Orders')
export class Order extends BaseEntity {
    @PropertyName('Order UUID', String)
    @Primary()
    uuid!: string;
    
    @PropertyName('Order Number', String)
    orderNumber!: string;
}
```

UUID primary key: immutable identifiers preferred distributed systems security avoiding sequential predictable ids enumeration attacks.

### Determining Entity State

```typescript
const product = new Product();
product.name = 'Laptop';

console.log(product.getPrimaryValue());  // undefined
console.log(!product.getPrimaryValue());  // true (isNew)

await product.save();  // POST /api/products

console.log(product.getPrimaryValue());  // 42 (server-assigned)
product.name = 'Updated Laptop';

await product.save();  // PUT /api/products/42
```

Entity state determination: primary value null undefined indicates NEW entity POST creation; populated value indicates EXISTING entity PUT update HTTP method selection based primary value check.

### Comparison Primary vs PersistentKey

| Aspecto | @Primary | @PersistentKey |
|---------|----------|---------------|
| Purpose | Internal entity identity | External API URLs |
| Default | 'id' property | Falls back Primary |
| Usage | State determination isNew check | HTTP URL construction |
| Visibility | Internal application logic | Exposed HTTP URLs logs |
| Immutability | Must be immutable | Must be immutable |
| Type | Usually numeric autoincrement | String UUID slug code |

## 11. Referencias Cruzadas

**persistent-key-decorator.md:** Define different property API URLs compared primary key. Primary internal concern, PersistentKey external concern potentially different properties serving different purposes separation concerns coordination patterns.

**api-endpoint-decorator.md:** Define base URL endpoint API requests. Primary value appended URLs when PersistentKey NO configured constructing complete paths targeted operations.

**crud-operations.md (BaseEntity layer):** Documenta save() delete() implementation details conditional logic using getPrimaryValue() accessor determining entity state isNew selecting appropriate HTTP methods operations.

**unique-decorator.md:** Validates uniqueness property values. Primary keys inherently unique definition @Unique may applied enforcing client-side uniqueness checks validation.

**01-basic-crud.md (Tutorials):** Tutorial demonstrating CRUD operations primary key determining entity lifecycle NEW creation versus EXISTING update flows patterns.
