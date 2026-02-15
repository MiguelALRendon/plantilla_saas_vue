# Persistent Decorator

## 1. Propósito

El decorador `@Persistent` habilita el sistema de persistencia de una entidad, permitiendo que las operaciones CRUD (save, update, delete, getElement, getElementList) realicen peticiones HTTP al backend para sincronizar datos con la base de datos a través de la API REST definida por `@ApiEndpoint`.

## 2. Alcance

### Responsabilidades

- Marcar una entidad como persistente habilitando operaciones HTTP
- Almacenar metadata usando PERSISTENT_KEY Symbol en la clase
- Activar validación de endpoint antes de operaciones CRUD
- Integrarse con BaseEntity CRUD methods para decidir si ejecutar HTTP requests

### Límites

- No define el endpoint de API (eso es responsabilidad de @ApiEndpoint)
- No configura métodos HTTP permitidos (eso es @ApiMethods)
- No afecta validaciones ni metadatos de propiedades
- No controla formato de datos transmitidos

## 3. Definiciones Clave

**PERSISTENT_KEY**: Symbol único que identifica la metadata de persistencia almacenada en la clase. Implementación: `export const PERSISTENT_KEY = Symbol('persistent')`.

**Persistent Entity**: Entidad que tiene el decorador `@Persistent()` aplicado, indicando que sincroniza con backend vía HTTP.

**Non-Persistent Entity**: Entidad sin el decorador `@Persistent()`,operate solo en memoria sin hacer HTTP requests.

## 4. Descripción Técnica

### Implementación del Decorador

**Archivo:** `src/decorations/persistent_decorator.ts`

```typescript
export const PERSISTENT_KEY = Symbol('persistent');

export function Persistent(): ClassDecorator {
    return function (target: Function) {
        (target as any)[PERSISTENT_KEY] = true;
    };
}
```

**Parámetros:** Ninguno - el decorador NO acepta parámetros

**Retorno:** `ClassDecorator` - Función que modifica la clase target estableciendo `PERSISTENT_KEY` a `true`

**Comportamiento:** Almacena el booleano `true` directamente en el Symbol PERSISTENT_KEY en el objeto de clase. No acepta parámetros para deshabilitarlo; si una entidad no debe ser persistente, simplemente no se aplica el decorador.

### Metadata Storage

```typescript
// El decorador almacena:
(Product as any)[PERSISTENT_KEY] = true;
(Customer as any)[PERSISTENT_KEY] = true;

// Entidades sin decorador NO tienen la marca:
// MockEntity no tiene (MockEntity as any)[PERSISTENT_KEY]
```

### Verificación en BaseEntity

Los métodos CRUD de BaseEntity verifican la presencia de este decorador antes de ejecutar HTTP requests:

```typescript
// Patrón típico en métodos CRUD:
const isPersistent = (this.constructor as any)[PERSISTENT_KEY];
if (!isPersistent) {
    // No hacer HTTP request, usar datos locales/mock
    return;
}

// Continuar con HTTP request...
```

No existe método accessor público como existe para otros decoradores. La verificación es interna a BaseEntity.

### Uso Típico

```typescript
import { BaseEntity } from '@/entities/base_entity';
import { ModuleName, ApiEndpoint, Persistent } from '@/decorations';

@ModuleName('Products')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    // ... propiedades
}

// Entidad no persistente (sin decorador):
@ModuleName('MockData')
export class MockEntity extends BaseEntity {
    // No tendrá @Persistent, solo operará en memoria
}
```

## 5. Flujo de Funcionamiento

1. **Definición**: Desarrollador aplica `@Persistent()` a la clase Product
2. **Almacenamiento**: Decorador establece `Product[PERSISTENT_KEY] = true`
3. **Operación CRUD**: Usuario llama `product.save()`
4. **Verificación**: `save()` verifica `(this.constructor as any)[PERSISTENT_KEY]`
5. **HTTP Request**: Si `true`, ejecuta POST/PUT a endpoint definido por @ApiEnd point
6. **Skip HTTP**: Si no tiene el decorador, skip HTTP request u opera en modo mock

## 6. Reglas Obligatorias

1. **@Persistent DEBE usarse sin parámetros**: Sintaxis correcta es `@Persistent()`, NO `@Persistent(true)` ni `@Persistent(false)`

2. **@Persistent REQUIERE @ApiEndpoint**: Entidad persistente sin endpoint causará error runtime al intentar HTTP request a URL undefined

3. **Entidades en ModuleList user-facing DEBEN ser persistentes**: Módulos accesibles desde UI generalmente requieren persistencia para operaciones CRUD funcionales

4. **No aplicar a entidades puramente locales**: Entities solo para cálculos en memoria o mock data no deben tener @Persistent

## 7. Prohibiciones

1. **NUNCA pasar parámetros al decorador**: `@Persistent()` NO acepta parámetros. Código como `@Persistent(true)` o `@Persistent(false)` causará error de compilación TypeScript

2. **NUNCA usar @Persistent sin @ApiEndpoint**: Esto causará runtime errors cuando BaseEntity intente construir URLs para HTTP requests

3. **NUNCA asumir que todas las entidades son persistentes**: Verificar presencia del decorador antes de asumir comportamiento de persistencia

4. **NUNCA modificar PERSISTENT_KEY directamente**: No ejecutar `(Product as any)[PERSISTENT_KEY] = false` para deshabilitarlo. Si una entidad no debe ser persistente, no aplicar el decorador

## 8. Dependencias

**Dependencias Directas:**
- `src/decorations/persistent_decorator.ts`: Exporta PERSISTENT_KEY Symbol y función Persistent
- `src/entities/base_entity.ts`: Verifica PERSISTENT_KEY en métodos CRUD
- TypeScript Decorators: Requiere experimentalDecorators enabled en tsconfig.json

**Dependencias de Runtime:**
- Symbol API de JavaScript
- @ApiEndpoint decorador: Requerido para definir URL de HTTP requests
- Axios: Para ejecutar HTTP requests

## 9. Relaciones

**Utilizado por:**
- BaseEntity CRUD methods: save(), update(), delete(), getElement(), getElementList()
- Validation logic: Algunas validaciones solo aplican a persistent entities

**Debe usarse con:**
- `@ApiEndpoint`: Define URL base para HTTP requests
- `@ModuleName`: Identifica módulo en UI
- Opcionalmente `@ApiMethods`: Especifica métodos HTTP permitidos

**No relacionado directamente con:**
- Decoradores de propiedades (@PropertyName, @Required, etc.)
- @ModuleIcon, @ModulePermission: Son ortogonales

## 10. Notas de Implementación

### Ejemplo Completo

```typescript
import { BaseEntity } from '@/entities/base_entity';
import {
    ModuleName,
    ModuleIcon,
    ApiEndpoint,
    Persistent,
    PropertyName,
    PropertyIndex,
    Required
} from '@/decorations';

@ModuleName('Products')
@ModuleIcon('inventory')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    id?: number;

    @PropertyIndex(2)
    @PropertyName('Name', String)
    @Required()
    name!: string;
}
```

### Entidad No Persistente (Mock)

```typescript
@ModuleName('MockData')
export class MockEntity extends BaseEntity {
    // Sin @Persistent - No hará HTTP requests
    // Sin @ApiEndpoint - No necesita URL
    
    @PropertyName('Value', String)
    value!: string;
    
    // Puede tener método estático para mock data:
    static getMockData(): MockEntity[] {
        return [
            Object.assign(new MockEntity(), { value: 'Test 1' }),
            Object.assign(new MockEntity(), { value: 'Test 2' })
        ];
    }
}
```

### Debug y Verificación

```typescript
// Verificar si entidad es persistente:
const isPersistent = !!(Product as any)[PERSISTENT_KEY];
console.log('Is persistent:', isPersistent); // → true

const isNonPersistent = !!(MockEntity as any)[PERSISTENT_KEY];
console.log('Is persistent:', isNonPersistent); // → false (undefined)
```

### Patrones Comunes

**Entidad típica de producción:**
```typescript
@ModuleName('Customers')
@ApiEndpoint('/api/customers')
@Persistent()
export class Customer extends BaseEntity { /* ... */ }
```

**Entidad de desarrollo/testing:**
```typescript
@ModuleName('TestData')
// Sin @ApiEndpoint ni @Persistent
export class TestEntity extends BaseEntity { /* ... */ }
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- [api-endpoint-decorator.md](api-endpoint-decorator.md): Define URL para HTTP requests
- [api-methods-decorator.md](api-methods-decorator.md): Limita métodos HTTP permitidos
- [module-name-decorator.md](module-name-decorator.md): Identifica módulo en UI
- ../../02-base-entity/crud-operations.md: Métodos que verifican @Persistent
- ../../02-base-entity/base-entity-core.md: Arquitectura BaseEntity

**Archivos de código:**
- `src/decorations/persistent_decorator.ts`: Implementación del decorador
- `src/entities/base_entity.ts`: Métodos CRUD que verifican persistencia

**Ejemplos relacionados:**
- [../../examples/classic-module-example.md](../../examples/classic-module-example.md): Uso estándar de @Persistent
- [../../examples/advanced-module-example.md](../../examples/advanced-module-example.md): Módulos complejos persistentes
- [../../tutorials/01-basic-crud.md](../../tutorials/01-basic-crud.md): Tutorial básico usando @Persistent
