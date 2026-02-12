# UniquePropertyKey Decorator

## 1. Propósito

Designar una propiedad específica de entidad como clave única de identificación utilizada para búsqueda y validación de unicidad en colecciones de instancias, permitiendo diferenciar registros mediante propiedad de negocio alternativa al identificador técnico primario.

## 2. Alcance

### 2.1 Responsabilidades

- Marcar propiedad como unique key de negocio para entidad
- Proporcionar método getUniquePropertyKey() para acceso a nombre de propiedad única
- Habilitar búsqueda de instancias por unique key en colecciones
- Facilitar validación de unicidad antes de persistencia
- Permitir diferenciación semántica entre primary key (técnico) y unique key (negocio)
- Soportar casos de uso donde unique key es más significativo que ID numérico

### 2.2 Límites

- No valida unicidad automáticamente (requiere implementación manual)
- No crea índices únicos en base de datos (responsabilidad del backend)
- No previene duplicados en memoria o persistencia automáticamente
- No reemplaza @Primary decorator para identificación técnica interna
- Solo permite un único unique key por entidad (no soporta composite keys)
- No afecta serialización, persistencia ni validación automática

## 3. Definiciones Clave

**UniquePropertyKey**: Nombre de propiedad designada como clave única de negocio, usada para búsqueda y validación de duplicados en colecciones.

**Class Decorator**: @UniquePropertyKey se aplica a nivel de clase (no propiedad), especificando string con nombre de propiedad única.

**Unique Key vs Primary Key**: Primary Key es identificador técnico interno (generalmente ID numérico), Unique Key es identificador de negocio significativo (email, SKU, username).

**UNIQUE_KEY Symbol**: Symbol único usado para almacenar metadata en constructor de clase (no en prototype).

**Uniqueness Validation**: Proceso manual de verificar que valor de unique key no existe en colección antes de insertar o actualizar instancia.

**Business Identifier**: Propiedad única con significado de negocio que usuarios reconocen, diferente de ID técnico generado por sistema.

## 4. Descripción Técnica

### 4.1 Implementación del Decorador

```typescript
export const UNIQUE_KEY = Symbol('unique_property');

export function UniquePropertyKey(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[UNIQUE_KEY] = propertyName;
    };
}
```

Decorador de clase (ClassDecorator) que almacena string con nombre de propiedad única directamente en constructor. A diferencia de property decorators que usan prototype, este almacena en target (constructor function) directamente.

### 4.2 Método de Acceso en BaseEntity

```typescript
public getUniquePropertyKey(): string | undefined {
    return (this.constructor as any)[UNIQUE_KEY];
}
```

Método de instancia que recupera unique key desde constructor. Retorna undefined si no está configurado, indicando que entidad no tiene unique key declarado.

### 4.3 Almacenamiento de Metadata

El metadata se almacena en:
- Ubicación: Constructor[UNIQUE_KEY] (no en prototype)
- Tipo: string (nombre de la propiedad)
- Vida útil: Permanente durante lifecycle de aplicación
- Herencia: Disponible para todas las instancias vía constructor
- Serialización: No incluida en toDictionary() ni persistencia

**Diferencia con Property Decorators**: Property decorators usan prototype[SYMBOL_KEY] = {propertyKey: value}, este decorador usa constructor[SYMBOL_KEY] = propertyName directamente.

## 5. Flujo de Funcionamiento

### 5.1 Fase de Declaración

```
Developer diseña entidad con clave única de negocio
    ↓
Aplica @UniquePropertyKey('propertyName') a clase
    ↓
TypeScript ejecuta decorador al definir clase
    ↓
Decorador almacena 'propertyName' en constructor[UNIQUE_KEY]
    ↓
Metadata disponible para todas las instancias vía getUniquePropertyKey()
```

### 5.2 Fase de Validación de Unicidad

```
Usuario intenta guardar nueva instancia
    ↓
Código llama entity.getUniquePropertyKey() para obtener nombre de propiedad única
    ↓
getUniquePropertyKey() retorna 'email' (ejemplo)
    ↓
Código recupera valor: entity[uniqueKey] → 'user@example.com'
    ↓
Busca en colección existente si ese valor ya existe
    ↓
const exists = collection.find(item => item[uniqueKey] === entity[uniqueKey])
    ↓
Si exists, lanzar error de validación: "Email already registered"
    ↓
Si no exists, permitir guardado
```

### 5.3 Fase de Búsqueda por Unique Key

```
Usuario proporciona valor único (ej: email)
    ↓
Código obtiene unique key name: entity.getUniquePropertyKey()
    ↓
Busca en colección por ese valor:
const found = collection.find(item => item[uniqueKey] === searchValue)
    ↓
Si found, retornar instancia
    ↓
Si no found, retornar null o lanzar NotFoundError
```

### 5.4 Ejemplo de Uso Completo

```typescript
@UniquePropertyKey('email')
class User extends BaseEntity {
    id: number;
    email: string;
    name: string;
}

const user = new User({ email: 'john@example.com' });
console.log(user.getUniquePropertyKey()); // 'email'

// Validación de unicidad manual
function validateUniqueness(newUser: User, existingUsers: User[]): boolean {
    const uniqueKey = newUser.getUniquePropertyKey();
    if (!uniqueKey) return true; // Sin unique key, no validar
    
    const uniqueValue = newUser[uniqueKey];
    return !existingUsers.some(user => user[uniqueKey] === uniqueValue);
}

// Búsqueda por unique key
function findByUniqueKey(searchValue: string, users: User[]): User | undefined {
    const uniqueKey = users[0]?.getUniquePropertyKey();
    if (!uniqueKey) return undefined;
    
    return users.find(user => user[uniqueKey] === searchValue);
}
```

## 6. Reglas Obligatorias

### 6.1 Aplicación del Decorador

1. @UniquePropertyKey debe aplicarse a clase, nunca a propiedad individual
2. Parámetro propertyName debe ser string literal con nombre exacto de propiedad
3. Propiedad referenciada debe existir en clase decorada
4. Solo aplicar un @UniquePropertyKey por clase (último prevalece si múltiples)
5. Propiedad única debe tener tipo que soporta comparación de igualdad (string, number)

### 6.2 Selección de Propiedad Única

6. Elegir propiedad con significado de negocio (email, username, SKU, code)
7. Propiedad debe ser obligatoria (@Required) para garantizar unicidad
8. Propiedad debe ser readonly después de creación para evitar colisiones
9. Propiedad no debe cambiar frecuentemente (estable durante vida de entidad)
10. Preferir strings sobre numbers para unique keys de negocio (más legibles)

### 6.3 Validación de Unicidad

11. Implementar validación manual de unicidad en beforeSave() hook
12. Validación debe comparar con colección completa de instancias
13. Considerar case-insensitive comparison para strings (email, username)
14. Backend debe validar unicidad con constraint de base de datos
15. Manejar race conditions en validación con locks o transacciones

### 6.4 Interacción con Otros Decoradores

16. @UniquePropertyKey y @Primary son independientes y complementarios
17. Unique property debe tener @Required si es obligatoria para unicidad
18. Unique property puede tener @Validation para formato específico
19. Unique property puede tener @PersistentKey si se usa en URLs
20. No aplicar @Disabled a unique property (debe ser editable en creación)

### 6.5 Búsqueda y Recuperación

21. Implementar métodos de búsqueda por unique key en Application layer
22. Cache de índice por unique key para performance en colecciones grandes
23. Normalizar valores antes de comparación (toLowerCase() para emails)
24. Retornar undefined/null cuando no encontrado, no lanzar excepción
25. Considerar índices de base de datos para búsquedas rápidas

## 7. Prohibiciones

### 7.1 Prohibiciones de Implementación

1. PROHIBIDO aplicar @UniquePropertyKey a propiedad (es class decorator)
2. PROHIBIDO usar nombres de propiedades inexistentes en decorador
3. PROHIBIDO aplicar múltiples @UniquePropertyKey con expectativa de composite keys
4. PROHIBIDO usar computed properties (getters) como unique key
5. PROHIBIDO usar Symbol o number como nombre de propiedad única

### 7.2 Prohibiciones de Validación

6. PROHIBIDO asumir que decorador valida unicidad automáticamente
7. PROHIBIDO confiar solo en validación frontend para unicidad
8. PROHIBIDO omitir validación backend de unique constraints
9. PROHIBIDO permitir null o undefined en unique property
10. PROHIBIDO cambiar unique property sin validación de duplicados

### 7.3 Prohibiciones de Uso

11. PROHIBIDO usar @UniquePropertyKey como reemplazo de @Primary
12. PROHIBIDO usar unique key para determinar isNew() (usar primary key)
13. PROHIBIDO serializar metadata UNIQUE_KEY en APIs públicas
14. PROHIBIDO exponer unique key configuration en UI de usuario final
15. PROHIBIDO usar unique key para relaciones entre entidades (usar primary key)

### 7.4 Prohibiciones de Lógica

16. PROHIBIDO implementar lógica de negocio que asume único decorador garantiza unicidad
17. PROHIBIDO usar unique key para seguridad o autorización
18. PROHIBIDO cambiar unique property después de persistencia sin validación
19. PROHIBIDO usar propiedades mutables frecuentemente como unique keys
20. PROHIBIDO depender de orden de comparación en validación de unicidad

## 8. Dependencias

### 8.1 Dependencias Directas

**Symbol (JavaScript Nativo)**
- Propósito: Crear UNIQUE_KEY único para storage de metadata
- Uso: Almacenar property name en constructor sin colisiones
- Crítico: Sí, sin Symbol podría sobrescribir propiedades de clase

**ClassDecorator (TypeScript)**
- Propósito: Tipado de decorador de clase
- Uso: Garantizar firma correcta de función UniquePropertyKey()
- Crítico: Sí, TypeScript rechazará decorador aplicado a propiedades

**Function Constructor**
- Propósito: Target del class decorator
- Uso: Almacena metadata en constructor (no prototype)
- Crítico: Sí, único lugar para metadata de clase (no instancia)

### 8.2 Dependencias de BaseEntity

**getUniquePropertyKey() Method**
- Propósito: Recuperar nombre de unique property desde constructor
- Retorno: string | undefined
- Crítico: Sí, único método de acceso a metadata

**constructor Property**
- Propósito: Referencia al constructor de clase desde instancia
- Uso: (this.constructor as any)[UNIQUE_KEY]
- Crítico: Sí, necesario para acceder a metadata de clase

### 8.3 Dependencias de Validación Manual

**Lifecycle Hooks (beforeSave)**
- Propósito: Punto de inyección para validación de unicidad
- Uso: Validar unique key antes de persistir
- Crítico: Recomendado, mejor práctica para integridad

**Collection Find Methods**
- Propósito: Buscar duplicados en arrays o Maps
- Métodos: Array.find(), Array.some(), Map.has()
- Crítico: Sí, necesarios para implementar validación

**Comparison Operators**
- Propósito: Comparar valores de unique property
- Operadores: ===, ==, String.toLowerCase()
- Crítico: Sí, fundamentales para detectar duplicados

### 8.4 Dependencias Backend

**Database Unique Constraints**
- Propósito: Garantizar unicidad en persistencia
- Implementación: UNIQUE INDEX en columna de base de datos
- Crítico: Sí, única garantía real de unicidad

**Backend Validation**
- Propósito: Validar unicidad antes de INSERT/UPDATE
- Respuesta: HTTP 409 Conflict si duplicado
- Crítico: Sí, frontend puede bypassearse

### 8.5 Dependencias Opcionales

**@Required Decorator**
- Relación: Unique property debe ser required
- Propósito: Garantizar que unique key siempre tiene valor
- Recomendación: Siempre aplicar a unique property

**@Validation Decorator**
- Relación: Validar formato de unique property
- Ejemplo: Email format, username pattern
- Recomendación: Complementar con validación de formato

**@ReadOnly Decorator**
- Relación: Hacer unique property readonly después de creación
- Propósito: Prevenir cambios que causen duplicados
- Patrón: ReadOnly cuando !isNew()

## 9. Relaciones

### 9.1 Decoradores de Identificación

**@Primary**
- Naturaleza: Decorador complementario con propósito diferente
- Diferencia: Primary es ID técnico, UniquePropertyKey es ID de negocio
- Uso conjunto: Primary para isNew(), UniquePropertyKey para búsqueda
- Ejemplo: Primary → id: number, UniquePropertyKey → 'email'
- Ambos pueden coexistir: ID interno + email único

**@PersistentKey**
- Relación: Puede coincidir con unique property
- Diferencia: PersistentKey para URLs API, UniquePropertyKey para búsqueda local
- Ejemplo: Ambos apuntando a 'username' para URL /api/users/:username
- Sincronización: Mantener ambos sincronizados si representan misma propiedad

### 9.2 Decoradores de Validación

**@Required**
- Interacción: Unique property debe ser required
- Justificación: Unicidad sin valor no tiene sentido
- Implementación: @Required() email: string con @UniquePropertyKey('email')

**@Validation**
- Interacción: Validar formato antes de validar unicidad
- Orden: Formato validation → Unicidad validation
- Ejemplo: Email format valid → Email no existe en sistema

**@AsyncValidation**
- Interacción: Validar unicidad contra backend en tiempo real
- Uso: Async validation que consulta API para verificar disponibilidad
- UX: "Email already taken" mientras usuario tipea

### 9.3 Decoradores de Estado

**@ReadOnly**
- Interacción: Hacer unique property readonly después de creación
- Patrón: @ReadOnly((entity) => !entity.isNew())
- Justificación: Cambiar unique key después de creación causa conflictos

**@Disabled**
- Interacción: Similar a ReadOnly pero más restrictivo
- Uso: Disabled permanentemente para campos autogenerados (códigos)

### 9.4 BaseEntity Methods

**getUniquePropertyKey()**
- Retorno: string | undefined
- Uso: Obtener nombre de unique property para validación/búsqueda
- Garantía: Retorna undefined si no configurado (safely)

**isNew()**
- Relación: No usa unique key, usa primary key
- Justificación: Primary es identificador técnico interno
- Independencia: isNew() y unique key validation son independientes

**beforeSave() Hook**
- Uso: Validar unicidad antes de persistir
- Implementación: Buscar duplicados y lanzar error si existen
- Crítico: Mejor práctica para integridad de datos

### 9.5 Application Layer Methods

**findByUniqueKey()**
- Propósito: Buscar instancia por valor de unique property
- Implementación: Método custom en Application singleton
- Ejemplo: Application.findUserByEmail('user@example.com')

**validateUniqueness()**
- Propósito: Validar que unique value no existe
- Implementación: Método helper en Application
- Retorno: boolean o throw ValidationError

### 9.6 Backend y Persistencia

**Database Unique Index**
- Propósito: Garantizar unicidad a nivel de base de datos
- SQL: CREATE UNIQUE INDEX idx_users_email ON users(email)
- MongoDB: db.users.createIndex({ email: 1 }, { unique: true })

**HTTP 409 Conflict**
- Uso: Respuesta backend cuando unique constraint violado
- Manejo: Frontend captura 409 y muestra mensaje apropiado
- Ejemplo: "Email already registered, try logging in"

## 10. Notas de Implementación

### 10.1 Patrones de Uso Comunes

**User Entity con Email Único**
```typescript
@UniquePropertyKey('email')
class User extends BaseEntity {
    @Primary() id: number;
    
    @Required()
    @Validation(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Invalid email')
    email: string;
    
    name: string;
}
```

email es unique key de negocio, id es primary key técnico.

**Product con SKU Único**
```typescript
@UniquePropertyKey('sku')
class Product extends BaseEntity {
    @Primary() id: number;
    
    @Required()
    @ReadOnly((product: Product) => !product.isNew())
    sku: string;
    
    name: string;
    price: number;
}
```

SKU es código único de producto, readonly después de creación, id es primary técnico.

**Username Único Case-Insensitive**
```typescript
@UniquePropertyKey('username')
class Account extends BaseEntity {
    @Primary() id: number;
    
    @Required()
    @Validation(val => /^[a-zA-Z0-9_]{3,20}$/.test(val), 'Invalid username')
    username: string;
    
    async beforeSave() {
        // Normalizar username a lowercase
        this.username = this.username.toLowerCase();
        
        // Validar unicidad
        const uniqueKey = this.getUniquePropertyKey();
        if (uniqueKey) {
            const exists = await Application.checkUsernameExists(this.username);
            if (exists) {
                throw new Error(`Username ${this.username} already exists`);
            }
        }
    }
}
```

### 10.2 Validación de Unicidad Manual

**Validación en beforeSave() Hook**
```typescript
class User extends BaseEntity {
    async beforeSave() {
        const uniqueKey = this.getUniquePropertyKey();
        if (!uniqueKey) return;
        
        const uniqueValue = this[uniqueKey];
        const existingUsers = await User.getElementList();
        
        // Filtrar self si es update (no nuevo)
        const duplicates = existingUsers.filter(user => 
            user[uniqueKey] === uniqueValue && user.getPrimaryValue() !== this.getPrimaryValue()
        );
        
        if (duplicates.length > 0) {
            throw new Error(`${uniqueKey} '${uniqueValue}' already exists`);
        }
    }
}
```

**Validación Async con Backend**
```typescript
@UniquePropertyKey('email')
class User extends BaseEntity {
    @AsyncValidation(async (user: User) => {
        const uniqueKey = user.getUniquePropertyKey();
        if (!uniqueKey) return { valid: true };
        
        const response = await Application.axiosInstance.get(
            `/api/users/check-email?email=${user.email}`
        );
        
        return {
            valid: !response.data.exists,
            message: 'Email already registered'
        };
    })
    email: string;
}
```

### 10.3 Búsqueda por Unique Key

**Método Helper en Application**
```typescript
class Application {
    static async findByUniqueKey<T extends BaseEntity>(
        EntityClass: new (...args: any[]) => T,
        uniqueValue: string
    ): Promise<T | undefined> {
        const instance = new EntityClass({});
        const uniqueKey = instance.getUniquePropertyKey();
        
        if (!uniqueKey) {
            throw new Error(`${EntityClass.name} has no unique property key`);
        }
        
        const allInstances = await EntityClass.getElementList();
        return allInstances.find(item => item[uniqueKey] === uniqueValue);
    }
}

// Uso
const user = await Application.findByUniqueKey(User, 'john@example.com');
```

**Cache de Índice para Performance**
```typescript
class Application {
    private static uniqueIndexCache = new Map<string, Map<any, BaseEntity>>();
    
    static buildUniqueIndex<T extends BaseEntity>(
        EntityClass: new (...args: any[]) => T,
        instances: T[]
    ): void {
        const tempInstance = new EntityClass({});
        const uniqueKey = tempInstance.getUniquePropertyKey();
        
        if (!uniqueKey) return;
        
        const index = new Map<any, T>();
        for (const instance of instances) {
            const uniqueValue = instance[uniqueKey];
            if (uniqueValue !== undefined) {
                index.set(uniqueValue, instance);
            }
        }
        
        this.uniqueIndexCache.set(EntityClass.name, index);
    }
    
    static findByUniqueKeyCached<T extends BaseEntity>(
        EntityClass: new (...args: any[]) => T,
        uniqueValue: any
    ): T | undefined {
        const index = this.uniqueIndexCache.get(EntityClass.name);
        return index?.get(uniqueValue) as T | undefined;
    }
}
```

### 10.4 Backend Implementation

**SQL Unique Constraint**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- O como constraint explícito
ALTER TABLE users 
ADD CONSTRAINT unique_email UNIQUE (email);
```

**MongoDB Unique Index**
```javascript
db.users.createIndex(
    { email: 1 }, 
    { 
        unique: true,
        name: 'unique_email_index'
    }
);
```

**API Endpoint para Validación**
```typescript
// Backend Express.js
app.get('/api/users/check-email', async (req, res) => {
    const { email } = req.query;
    const exists = await User.findOne({ email });
    res.json({ exists: !!exists });
});

// Frontend consumo
const checkEmailAvailable = async (email: string): Promise<boolean> => {
    const response = await Application.axiosInstance.get(
        `/api/users/check-email?email=${email}`
    );
    return !response.data.exists;
};
```

### 10.5 Testing y Validación

**Unit Test de Unique Key**
```typescript
test('getUniquePropertyKey returns configured property name', () => {
    @UniquePropertyKey('email')
    class TestEntity extends BaseEntity {
        email: string;
    }
    
    const entity = new TestEntity({});
    expect(entity.getUniquePropertyKey()).toBe('email');
});

test('getUniquePropertyKey returns undefined when not configured', () => {
    class NoUniqueEntity extends BaseEntity {
        id: number;
    }
    
    const entity = new NoUniqueEntity({});
    expect(entity.getUniquePropertyKey()).toBeUndefined();
});
```

**Integration Test de Unicidad**
```typescript
test('should prevent duplicate unique keys', async () => {
    @UniquePropertyKey('email')
    class User extends BaseEntity {
        email: string;
        
        async beforeSave() {
            // Validación de unicidad simple
            const all = await User.getElementList();
            const duplicate = all.find(u => u.email === this.email);
            if (duplicate && duplicate.id !== this.id) {
                throw new Error('Email already exists');
            }
        }
    }
    
    const user1 = new User({ email: 'test@example.com' });
    await user1.save();
    
    const user2 = new User({ email: 'test@example.com' });
    await expect(user2.save()).rejects.toThrow('Email already exists');
});
```

### 10.6 Debugging y Diagnóstico

**Inspeccionar Unique Property Key**
```typescript
const user = new User();
const uniqueKey = user.getUniquePropertyKey();
console.log('Unique property:', uniqueKey); // 'email'

if (uniqueKey) {
    const uniqueValue = user[uniqueKey];
    console.log('Unique value:', uniqueValue); // 'user@example.com'
}
```

**Verificar Duplicados Manualment**
```typescript
function findDuplicates(entities: BaseEntity[]): Map<any, BaseEntity[]> {
    const uniqueKey = entities[0]?.getUniquePropertyKey();
    if (!uniqueKey) return new Map();
    
    const groups = new Map<any, BaseEntity[]>();
    for (const entity of entities) {
        const value = entity[uniqueKey];
        if (!groups.has(value)) {
            groups.set(value, []);
        }
        groups.get(value)!.push(entity);
    }
    
    // Filtrar solo grupos con duplicados
    const duplicates = new Map<any, BaseEntity[]>();
    for (const [value, group] of groups) {
        if (group.length > 1) {
            duplicates.set(value, group);
        }
    }
    
    return duplicates;
}

const users = await User.getElementList();
const duplicates = findDuplicates(users);
if (duplicates.size > 0) {
    console.error('Found duplicate unique keys:', duplicates);
}
```

### 10.7 Migraciones y Refactoring

**Agregar Unique Key a Entidad Existente**
1. Identificar propiedad de negocio única (email, code, SKU)
2. Aplicar @UniquePropertyKey('propertyName') a clase
3. Implementar validación en beforeSave() hook
4. Crear índice único en base de datos
5. Migrar datos existentes eliminando duplicados
6. Testear creación/actualización con validación

**Cambiar Unique Property**
```typescript
// Antes
@UniquePropertyKey('username')
class User extends BaseEntity {
    username: string;
    email: string;
}

// Después (cambiar a email como unique)
@UniquePropertyKey('email')
class User extends BaseEntity {
    username: string; // Ya no unique
    email: string; // Ahora unique
}
```

Requiere:
- Actualizar decorador
- Migrar índice de base de datos
- Actualizar validaciones
- Modificar endpoints de búsqueda

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Acceso a Metadata de Clase
- Contenido: Implementación de getUniquePropertyKey()
- Relevancia: Único método de acceso a unique key metadata

**copilot/layers/01-decorators/primary-property-decorator.md**
- Relación: Decorador complementario para identificación técnica
- Diferencia: Primary para isNew(), UniquePropertyKey para búsqueda de negocio
- Uso conjunto: Ambos en misma entidad con propósitos diferentes

**copilot/layers/01-decorators/persistent-key-decorator.md**
- Relación: Puede coincidir con unique property para URLs API
- Patrón: Ambos apuntando a misma propiedad (email, username, code)
- Decisión: Sincronizar cuando propiedad única se usa en URLs

**copilot/layers/01-decorators/required-decorator.md**
- Interacción: Unique property debe ser required
- Justificación: Unicidad requiere valor obligatorio
- Patrón: @Required() + unique property

**copilot/layers/01-decorators/validation-decorator.md**
- Interacción: Validar formato antes de unicidad
- Orden: Formato → Unicidad
- Ejemplo: Email format → Email no existe

**copilot/layers/01-decorators/async-validation-decorator.md**
- Interacción: Validación async de unicidad contra backend
- Uso: Feedback en tiempo real de disponibilidad
- UX: "Username already taken" mientras tipea

**copilot/layers/01-decorators/readonly-decorator.md**
- Interacción: Hacer unique key readonly después de creación
- Patrón: @ReadOnly((e) => !e.isNew()) en unique property
- Justificación: Prevenir cambios que causen duplicados

### 11.2 BaseEntity Core

**copilot/layers/02-base-entity/base-entity-core.md**
- Sección: Constructor y Metadata de Clase
- Relevancia: Almacenamiento de unique key en constructor

**copilot/layers/02-base-entity/validation-system.md**
- Sección: beforeSave() Lifecycle Hook
- Uso: Punto de inyección para validación de unicidad
- Patrón: Validar unique key en beforeSave

**copilot/layers/02-base-entity/crud-operations.md**
- Relación: save() invoca beforeSave() donde se valida unicidad
- Flujo: save() → beforeSave() → validate uniqueness → persist

### 11.3 Application Layer

**copilot/layers/03-application/application-singleton.md**
- Métodos: findByUniqueKey(), validateUniqueness()
- Propósito: Utilidades de búsqueda y validación centralizadas
- Patrón: Application como punto central de consultas

### 11.4 Código Fuente

**src/decorations/unique_decorator.ts**
- Líneas: 1-8
- Contenido: Implementación completa del decorador
- Exports: UNIQUE_KEY, UniquePropertyKey

**src/entities/base_entity.ts**
- Líneas 260-262: Método getUniquePropertyKey()
- Dependencias: Importa UNIQUE_KEY desde decorator

### 11.5 Tutoriales y Ejemplos

**copilot/tutorials/01-basic-crud.md**
- Sección: Propiedades Únicas y Validación
- Ejemplo: User con email único
- Patrón: Unique key + Required + Validation

**copilot/tutorials/02-validations.md**
- Sección: Validación de Unicidad
- Implementación: beforeSave() hook con validación manual
- Patrón: Búsqueda de duplicados en colección

**copilot/examples/advanced-module-example.md**
- Sección: Claves Únicas de Negocio
- Ejemplo: Product con SKU único
- Patrón: Unique key + ReadOnly después de creación

### 11.6 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 4.2: Metadata de Clase vs Propiedad
- Principio: Class decorators almacenan en constructor
- Diferencia: UniquePropertyKey usa constructor, otros usan prototype

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Sistema de Identificadores
- Contexto: Primary (técnico) vs UniquePropertyKey (negocio)
- Flujo: Metadata → Validation → Persistence

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Validación de Datos
- Flujo: beforeSave() → unique validation → backend validation
- Garantía: Unicidad validada en múltiples capas
