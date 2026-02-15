# Primary Property Decorator

## 1. Propósito

Marcar la propiedad de una entidad que sirve como clave primaria (primary key) o identificador único del registro. El decorador almacena el nombre de la propiedad como metadata a nivel de clase, permitiendo al framework determinar si una entidad es nueva (requiere creación con POST) o existente (requiere actualización con PUT/PATCH) verificando si el valor de la clave primaria es null/undefined versus un valor poblado. Este decorador es fundamental para el ciclo de vida CRUD de las entidades, habilitando la lógica de save() que diferencia entre creación y actualización, el método delete() que construye URLs con el ID correcto, y las validaciones que verifican unicidad e integridad de las entidades.

## 2. Alcance

### Responsabilidades

- Definir el nombre de la propiedad que sirve como clave primaria de la entidad
- Almacenar el nombre de la propiedad en metadata a nivel de clase usando Symbol
- Proveer accessor `getPrimaryPropertyValue()` para obtener el valor de la clave primaria
- Determinar si entidad es nueva (isNew()) verificando si valor es null/undefined
- Integrar con save() para decidir POST vs PUT
- Integrar con delete() para construir URL correcta
- Soportar cualquier tipo de clave primaria (Number, String, UUID, etc.)

### Límites

- NO valida unicidad de valores (responsabilidad del backend)
- NO genera valores de clave primaria automáticamente  
- NO maneja claves compuestas (solo una propiedad)
- NO previene modificación de la clave después de creación
- NO valida que la propiedad exista en la clase

## 3. Definiciones Clave

**PRIMARY_PROPERTY_KEY Symbol:** Identificador único usado como key directo en la clase (NO en prototype) para almacenar el nombre de la propiedad que sirve como clave primaria. Definido como `export const PRIMARY_PROPERTY_KEY = Symbol('primary_property')`.

**Decorator Signature:** `function PrimaryProperty(propertyName: string): ClassDecorator`. Este es un ClassDecorator que recibe el nombre de la propiedad como string parameter y lo almacena en metadata de clase.

**Class-Level Decorator:** Este decorador se aplica a la clase completa (antes de `export class`), NO a propiedades individuales. La sintaxis correcta es `@PrimaryProperty('id')` donde 'id' es el string nombre de la propiedad.

**getPrimaryPropertyValue():** Método de instancia en BaseEntity que retorna el valor actual de la propiedad marcada como clave primaria. Si el valor es null/undefined, la entidad se considera nueva.

**isNew():** Método de BaseEntity que determina si una entidad es nueva verificando si el valor de la clave primaria es null o undefined. Usado por save() para decidir entre POST (nuevo) o PUT (actualización).

**Primary Property Name:** String que identifica cuál propiedad es la clave primaria. Ejemplos: 'id', 'userId', 'productId', 'uuid'. Si no se especifica el decorador, el framework asume 'id' por defecto.

## 4. Descripción Técnica

### 4.1 Implementación del Decorador

**Ubicación:** `src/decorations/primary_property_decorator.ts` líneas 1-20.

```typescript
import { PRIMARY_PROPERTY_KEY } from './decorator_keys';

/**
 * ClassDecorator que marca una propiedad como clave primaria de la entidad.
 * Almacena el nombre de la propiedad en la clase (NO prototype).
 * 
 * @param propertyName - Nombre de la propiedad que sirve como clave primaria
 * @returns ClassDecorator que configura la metadata de clave primaria
 */
export function PrimaryProperty(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[PRIMARY_PROPERTY_KEY] = propertyName;
    };
}
```

**Key Points:**
- Es un **ClassDecorator** (se aplica antes de `export class`)
- Recibe **un parámetro obligatorio:** el nombre de la propiedad (string)
- Almacena en **target directo** (la clase), NO en prototype
- La sintaxis de aplicación es `@PrimaryProperty('id')` antes de la declaración de clase

**Ejemplo de uso correcto:**
```typescript
@PrimaryProperty('id')  // ClassDecorator con parámetro string
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
}
```

### 4.2 Almacenamiento de Metadata

**Storage Location:** Directamente en la clase (Function target), no en prototype.

```typescript
// Después de decorar:
@PrimaryProperty('id')
export class Product extends BaseEntity {
    id!: number;
}

// La metadata queda almacenada así:
Product[PRIMARY_PROPERTY_KEY] === 'id'  // true
```

**Razón del almacenamiento en clase directa:** El decorador almacena en la clase porque la configuración de clave primaria es una decisión de tipo (type-level), no de instancia (instance-level). Todas las instancias de Product usan 'id' como clave primaria.

### 4.3 Lectura de Metadata en BaseEntity

**Ubicación:** `src/entities/base_entity.ts` líneas 200-220.

```typescript
/**
 * Retorna el nombre de la propiedad configurada como clave primaria.
 * Si no hay decorador aplicado, retorna 'id' por defecto.
 */
public getPrimaryProperty(): string {
    const constructor = this.constructor as any;
    return constructor[PRIMARY_PROPERTY_KEY] || 'id';
}

/**
 * Retorna el valor actual de la clave primaria de esta instancia.
 */
public getPrimaryPropertyValue(): any {
    const primaryProperty = this.getPrimaryProperty();
    return (this as any)[primaryProperty];
}
```

**Fallback behavior:** Si el decorador @PrimaryProperty no fue aplicado, retorna 'id' por defecto. Esto mantiene compatibilidad con entidades que no especifican explícitamente su clave primaria.

### 4.4 Uso en CRUD Operations

**save() Method:** Determina si crear (POST) o actualizar (PUT) según valor de primary key.

```typescript
public async save(): Promise<this> {
    const primaryValue = this.getPrimaryPropertyValue();
    
    if (primaryValue === null || primaryValue === undefined) {
        // NEW ENTITY → POST
        return await this.create();
    } else {
        // EXISTING ENTITY → PUT
        return await this.update();
    }
}
```

**Ubicación:** src/entities/base_entity.ts líneas 250-280. El método save() usa getPrimaryPropertyValue() para determinar si la entidad es nueva (sin valor en clave primaria) o existente (con valor en clave primaria), decidiendo así el método HTTP apropiado.

**delete() Method:** Construye URL de eliminación usando primary key.

```typescript
public async delete(): Promise<void> {
    const primaryValue = this.getPrimaryPropertyValue();
    if (!primaryValue) {
        throw new Error('Cannot delete entity without primary key value');
    }
    
    const endpoint = this.getApiEndpoint();
    await Application.axiosInstance.delete(`${endpoint}/${primaryValue}`);
}
```

**Ubicación:** src/entities/base_entity.ts líneas 340-360. El método delete() usa getPrimaryPropertyValue() para construir la URL DELETE específica del recurso.

**refresh() Method:** Recarga entidad desde servidor usando primary key.

```typescript
public async refresh(): Promise<void> {
    const primaryValue = this.getPrimaryPropertyValue();
    if (!primaryValue) {
        throw new Error('Cannot refresh entity with no primary key');
    }
    
    const endpoint = this.getApiEndpoint();
    const response = await Application.axiosInstance.get(
        `${endpoint}/${primaryValue}`
    );
    Object.assign(this, response.data);
}
```

**Ubicación:** src/entities/base_entity.ts líneas 873-880. El método refresh() usa getPrimaryPropertyValue() para recargar los datos actuales del servidor.

## 5. Flujo de Funcionamiento

### 5.1 Decoración en Tiempo de Compilación

```
[Código TypeScript]
@PrimaryProperty('id')
export class Product extends BaseEntity {
    id!: number;
}
         |
         v
[Compiler ejecuta decorator]
         |
         v
[PrimaryProperty('id'): ClassDecorator]
         |
         v
[target = Product (clase)]
         |
         v
[Product[PRIMARY_PROPERTY_KEY] = 'id']
         |
         v
[Metadata almacenada en clase]
```

### 5.2 Lectura de Metadata en Runtime

```
[Instancia de Product]
const product = new Product();
product.save();
         |
         v
[save() llama getPrimaryProperty()]
         |
         v
[lee constructor[PRIMARY_PROPERTY_KEY]]
         |
         v
[retorna 'id' (metadata decorador)]
         |
         v
[save() llama getPrimaryPropertyValue()]
         |
         v
[retorna this['id'] → value]
```

### 5.3 Determinación Entidad NUEVA (sin primary key)

```
[Entity Instance]
const product = new Product();
product.name = 'Laptop';
product.save();
         |
         v
[getPrimaryPropertyValue() → 'id']
         |
         v
[this.id === undefined]
         |
         v
[if (value === null || value === undefined)]
         |
         v
[isNew = TRUE]
         |
         v
[POST /api/products]
         |
         v
[Server retorna: { id: 123, name: 'Laptop' }]
         |
         v
[Object.assign(this, response.data)]
         |
         v
[this.id = 123 → ahora tiene primary key]
```

### 5.4 Determinación Entidad EXISTENTE (con primary key)

```
[Entity Instance]
const product = await Product.getElement(123);
product.name = 'Updated Laptop';
product.save();
         |
         v
[getPrimaryPropertyValue() → 'id']
         |
         v
[this.id === 123]
         |
         v
[if (value !== null && value !== undefined)]
         |
         v
[isNew = FALSE]
         |
         v
[PUT /api/products/123]
         |
         v
[Server actualiza recurso existente]
```

### 5.5 Fallback a 'id' (sin decorador)

```
[Entity sin @PrimaryProperty]
export class SimpleEntity extends BaseEntity {
    id!: number;
}
         |
         v
[getPrimaryProperty() llamado]
         |
         v
[constructor[PRIMARY_PROPERTY_KEY] === undefined]
         |
         v
[return 'id' como fallback]
         |
         v
[Usa 'id' por convención estándar]
```

## 6. Reglas Obligatorias

1. **Parámetro obligatorio:** El decorador DEBE recibir el nombre de la propiedad como string parameter: `@PrimaryProperty('id')`, `@PrimaryProperty('userId')`, etc.

2. **Class-level decoration:** DEBE aplicarse antes de la declaración de clase con `export class`, NO sobre propiedades individuales. Es un ClassDecorator, no PropertyDecorator.

3. **Propiedad debe existir:** El nombre de propiedad pasado al decorador DEBE corresponder a una propiedad real definida en la entidad. Si se especifica `@PrimaryProperty('id')`, la clase debe tener `id!: number`.

4. **Único decorador por clase:** Solo UNA invocación de @PrimaryProperty permitida por entidad. No puede haber múltiples claves primarias.

5. **Valor único:** La propiedad marcada DEBE tener valores únicos que identifiquen inequívocamente cada instancia de la entidad.

6. **Inmutabilidad post-creación:** Una vez asignado por el servidor, el valor de la clave primaria NO debe cambiar. La identidad debe ser permanente.

7. **Server-generated:** Los valores de clave primaria SON asignados por el backend en respuestas POST. El cliente NO debe generar valores manualmente.

8. **Null check crítico:** Antes de delete() o refresh(), DEBE verificarse que getPrimaryPropertyValue() no retorna null/undefined. De lo contrario, lanzar error.

## 7. Prohibiciones

1. **NO usar como PropertyDecorator:** Jamás escribir `@PrimaryProperty('id') id!: number` decorando la propiedad directamente. Es un ClassDecorator que se aplica a la clase.

2. **NO omitir parámetro:** Nunca escribir `@PrimaryProperty()` sin parámetro. El decorador REQUIERE el nombre de la propiedad como string.

3. **NO decorar múltiples propiedades:** No puede haber más de una clave primaria por entidad. Si necesita claves compuestas, implemente lógica personalizada.

4. **NO asignar valores client-side:** No generar UUIDs, IDs secuenciales o cualquier valor de clave primaria en el cliente. El servidor es responsable.

5. **NO cambiar primary property después de save:** Una vez que save() asigna el valor desde el servidor, NO modificar `this[primaryProperty]`. La identidad es permanente.

6. **NO usar tipos mutables:** La propiedad debe ser de tipo inmutable (number, string), nunca objetos o arrays que puedan cambiar su referencia.

7. **NO asumir 'id' sin verificar:** Si no aplica @PrimaryProperty, el fallback es 'id', pero asegúrese de que esa propiedad existe en la entidad.

8. **NO exponer primary keys secuenciales:** Evite usar IDs predictibles en APIs públicas; prefiera UUIDs o slugs para evitar ataques de enumeración.

## 8. Dependencias

### 8.1 Decoradores Relacionados

**PersistentKey (OPCIONAL):**  
Especifica una propiedad diferente para construir URLs de API. Por ejemplo, si @PrimaryProperty('id') marca 'id' como clave interna pero @PersistentKey('uuid') usa 'uuid' para URLs REST, las operaciones CRUD usarán /api/products/{uuid} en lugar de /api/products/{id}.

**Unique (RELACIONADO):**  
Valida unicidad de propiedades. Aunque las claves primarias son únicas por definición, @Unique puede aplicarse para validación client-side antes de enviar al servidor.

**Required (RELACIONADO):**  
Valida campos requeridos. Generalmente NO se aplica @Required a claves primarias porque son asignadas por el servidor, no ingresadas por el usuario.

### 8.2 Framework Dependencies

**BaseEntity CRUD Methods:**  
save(), delete(), refresh() dependen de getPrimaryPropertyValue() para determinar estado de entidad y construir URLs.

**Application.axiosInstance:**  
Usado en CRUD operations para requests HTTP POST/PUT/DELETE con URLs que incluyen primary key value.

**decorator_keys.ts:**  
Define PRIMARY_PROPERTY_KEY Symbol usado para almacenar metadata.

## 9. Relaciones

### 9.1 Con PersistentKey

Ambos decoradores identifican propiedades, pero con propósitos diferentes:

- **PrimaryProperty:** Identidad interna de entidad (state management, comparaciones, isNew check)
- **PersistentKey:** Construcción de URLs para API REST (puede ser diferente propiedad)

**Ejemplo:**
```typescript
@PrimaryProperty('id')          // Identidad interna: this.id
@PersistentKey('productCode')   // URLs usan: /api/products/{productCode}
export class Product extends BaseEntity {
    id!: number;
    productCode!: string;
}
```

### 9.2 Con CRUD Operations

**save():** Llama getPrimaryPropertyValue(). Si retorna null/undefined → POST (nuevo). Si tiene valor → PUT (actualización).

**delete():** Usa getPrimaryPropertyValue() como default para construir URL DELETE. Si PersistentKey configurado, usa ese valor instead.

**refresh():** Recarga entidad desde servidor usando getPrimaryPropertyValue() para construir URL GET.

### 9.3 Con Sistema de Validación

El sistema de validación típicamente NO valida claves primarias con @Required porque son server-generated. Sin embargo, desarrollador puede forzar validación si necesita primary keys client-generated en flujos específicos.

### 9.4 Con Identity Determination

getPrimaryPropertyValue() es fundamental para:
- Determinar si entidad es nueva o existente
- Comparar entidades (misma clave = misma entidad)
- Detectar cambios (dirty state)
- Gestionar caché de entidades en Application

## 10. Notas de Implementación

### 10.1 Caso Común: Default 'id'

```typescript
// SIN @PrimaryProperty decorador
@ModuleName('Products')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;  // getPrimaryProperty() retorna 'id' por defecto
    
    @PropertyName('Name', String)
    name!: string;
}

// Comportamiento:
const product = new Product();
console.log(product.getPrimaryProperty());  // 'id' (fallback)
console.log(product.getPrimaryPropertyValue());  // undefined (sin valor aún)
```

### 10.2 Caso Personalizado: Custom Primary Property

```typescript
@PrimaryProperty('userId')  // ClassDecorator con parámetro
@ModuleName('Users')
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    userId!: number;  // Esta es la clave primaria
    
    @PropertyName('Username', String)
    username!: string;
}

// Comportamiento:
const user = new User();
console.log(user.getPrimaryProperty());  // 'userId' (configurado)
console.log(user.getPrimaryPropertyValue());  // undefined inicialmente
```

### 10.3 Caso UUID: String Primary Key

```typescript
@PrimaryProperty('uuid')
@ModuleName('Orders')
export class Order extends BaseEntity {
    @PropertyName('UUID', String)
    uuid!: string;  // UUID generado por servidor
    
    @PropertyName('Order Number', String)
    orderNumber!: string;
}

// Después de save():
await order.save();
console.log(order.getPrimaryPropertyValue());  
// '550e8400-e29b-41d4-a716-446655440000'
```

### 10.4 Determinación de Estado (isNew)

```typescript
@PrimaryProperty('id')
@ModuleName('Products')
export class Product extends BaseEntity {
    id!: number;
    name!: string;
}

// Entidad NUEVA (sin primary key):
const newProduct = new Product();
newProduct.name = 'Laptop';
console.log(newProduct.getPrimaryPropertyValue());  // undefined
if (!newProduct.getPrimaryPropertyValue()) {
    console.log('Entidad NUEVA → usará POST');
}
await newProduct.save();  // POST /api/products

// Después de save, servidor asigna ID:
console.log(newProduct.getPrimaryPropertyValue());  // 123 (asignado por servidor)

// Actualización (con primary key):
newProduct.name = 'Gaming Laptop';
console.log(newProduct.getPrimaryPropertyValue());  // 123 (ya tiene valor)
if (newProduct.getPrimaryPropertyValue()) {
    console.log('Entidad EXISTENTE → usará PUT');
}
await newProduct.save();  // PUT /api/products/123
```

### 10.5 Comparación @PrimaryProperty vs @PersistentKey

| Aspecto | @PrimaryProperty | @PersistentKey |
|---------|------------------|----------------|
| **Tipo** | ClassDecorator | ClassDecorator |
| **Propósito** | Identidad interna entidad | URLs API REST |
| **Default** | 'id' si no configurado | Usa PrimaryProperty si no configurado |
| **Usado por** | save() para isNew check | CRUD para construir URLs |
| **Puede diferir** | Sí, pueden ser propiedades diferentes | Sí, independiente de Primary |
| **Ejemplo** | id (identity interno) | productCode (identity externo) |

## 11. Referencias Cruzadas

**persistent-key-decorator.md:**  
Documenta @PersistentKey que define propiedad usada en URLs API. Diferencia con @PrimaryProperty explicada en sección 9.1.

**api-endpoint-decorator.md:**  
Define base URL de endpoint. Primary/Persistent key values se appenán a este base para formar URLs completas como `/api/products/{id}`.

**crud-operations.md (BaseEntity layer):**  
Documenta implementación detallada de save(), delete(), refresh() y cómo usan getPrimaryPropertyValue() para determinar estado y construir requests.

**unique-decorator.md:**  
Valida unicidad de propiedades. Aplicable a primary keys si necesita validación client-side, aunque unicidad es garantizada por base de datos.

**01-basic-crud.md (Tutorials):**  
Tutorial mostrando flujo completo de creación y actualización, donde primary key determina si entidad es nueva o existente.

**03-relations.md (Tutorials):**  
Muestra cómo primary/foreign keys funcionan en relaciones entre entidades (1:1, 1:N, N:N).
