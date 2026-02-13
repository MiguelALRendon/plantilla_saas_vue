# BaseEntity: CRUD Operations

## 1. Propósito

BaseEntity implementa el patrón Active Record proporcionando métodos CRUD completos para interacción automática con backend REST. Toda entidad que hereda BaseEntity obtiene capacidades de persistencia sin necesidad de implementar lógica HTTP, permitiendo operaciones de creación (POST), lectura (GET), actualización (PUT) y eliminación (DELETE) mediante métodos de instancia y estáticos. El sistema integra validación automática pre-persistencia, hooks de ciclo de vida, serialización inteligente de objetos y manejo estandarizado de respuestas.

## 2. Alcance

**Responsabilidades cubiertas:**
- Método save() que discrimina automáticamente entre POST (crear) y PUT (actualizar)
- Método update() como alias de save() con soporte para actualización parcial
- Método delete() para eliminación de registros
- Método estático getElementList() para obtención de colecciones con filtros opcionales
- Método estático getElement() para obtención de registro individual por ID
- Serialización vía toObject() con manejo de relaciones y tipos complejos
- Transformación de tipos en constructor mediante Object.assign()
- Validación automática pre-guardado (required, sync, async)
- Emisión de eventos al eventBus tras operaciones exitosas
- Manejo de errores HTTP con feedback mediante toast

**Límites del alcance:**
- No implementa lógica de autenticación (delegada a Application.axiosInstance)
- No maneja paginación a nivel de entidad (responsabilidad del backend)
- No implementa caché (puede añadirse en capa de aplicación)
- No gestiona transacciones multi-registro (cada operación es atómica)

## 3. Definiciones Clave

**Active Record Pattern:** Patrón de diseño donde objetos de dominio encapsulan tanto datos como comportamiento de persistencia. La entidad misma sabe cómo guardarse, actualizarse y eliminarse.

**toObject():** Método de serialización que convierte instancia BaseEntity a objeto plano Record<string, any>, usado para transmitir datos a la API.

**toPersistentObject():** Método de instancia que serializa entidad a objeto plano usando solo propiedades definidas mediante @PropertyName, preparando datos para envío a API.

**Primary Key Value:** Valor de la propiedad marcada con @PrimaryProperty, utilizado para discriminar between creación (null/undefined) y actualización (valor presente).

**Endpoint:** URL base configurada mediante @ApiEndpoint desde la cual se construyen URLs de operaciones CRUD.

**Application.axiosInstance:** Instancia Axios central del singleton Application, configurada con interceptores de autenticación y headers globales.

**EventBus emission:** Sistema de eventos reactivo que notifica operaciones CRUD exitosas ('saved', 'deleted', 'list-fetched', 'element-fetched') para permitir reactividad cross-componente.

## 4. Descripción Técnica

### 4.1. Método save()

**Firma:** `public async save(): Promise<this>`

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~710)

**Algoritmo de discriminación:**
```typescript
const pkValue = this.getPrimaryPropertyValue();
const isNew = !pkValue;

if (isNew) {
    response = await Application.axiosInstance.post(endpoint, data);
} else {
    response = await Application.axiosInstance.put(`${endpoint}/${pkValue}`, data);
}
```

**Flujo de ejecución:**
1. Ejecuta hook beforeSave()
2. Muestra loading menu con Application.ApplicationUIService.showLoadingMenu()  
3. Llama validateInputs() que ejecuta validaciones required, sync y async
4. Si validación falla: muestra toast, retorna instancia sin cambios
5. Verifica isPersistent() - lanza error si entity no tiene @Persistent()
6. Obtiene endpoint vía getApiEndpoint()
7. Serializa instancia con toObject()
8. Discrimina entre POST (isNew = true) o PUT (isNew = false)
8. Construye URL: POST usa `${endpoint}`, PUT usa `${endpoint}/${pkValue}`
9. Ejecuta request HTTP con Application.axiosInstance
10. Actualiza this con Object.assign(this, response.data)
11. Ejecuta hook afterSave()
12. Muestra toast de éxito
13. Emite evento 'saved' con { entityClass, entity } al eventBus
14. Retorna this actualizado

**Manejo de errores:**
```typescript
catch (error: any) {
    Application.showToast(error.response?.data?.message || 'Save failed', 'error');
    throw error;
}
```

### 4.2. Método update()

**Firma:** `public async update(): Promise<this>`

**Ubicación:** `src/entities/base_entitiy.ts` (líneas 767-830)

**IMPORTANTE:** Este método NO es un alias de save(). Tiene su propia implementación completa.

**Algoritmo completo:**

1. **Validaciones previas:**
   - Verifica `validatePersistenceConfiguration()` - retorna `this` si falla
   - Verifica `validateApiMethod('PUT')` - retorna `this` si PUT no permitido
   - Verifica que NO sea nueva (`isNew()`) - muestra error y retorna `this` si es nueva

2. **Preparación:**
   - Establece `_isSaving = true`
   - Ejecuta hook `beforeUpdate()`

3. **Ejecución:**
   - Ejecuta hook `onUpdating()`
   - Obtiene endpoint vía `getApiEndpoint()`
   - Obtiene unique key con `getUniquePropertyValue()`
   - Mapea datos con `mapToPersistentKeys(this.toObject())`
   - Ejecuta PUT request: `Application.axiosInstance.put(\`${endpoint}/${uniqueKey}\`, dataToSend)`

4. **Actualización de estado (si éxito):**
   - Mapea datos de respuesta con `mapFromPersistentKeys(response.data)`
   - Actualiza instancia con `Object.assign(this, mappedData)`
   - Actualiza `_originalState` con snapshot del estado actual
   - Establece `_isSaving = false`
   - Ejecuta hook `afterUpdate()`

5. **Manejo de errores (catch):**
   - Establece `_isSaving = false`
   - Ejecuta hook `updateFailed()`
   - Muestra confirmation menu con error
   - Lanza excepción

6. **Retorno:** `this` (la instancia actualizada)

**Diferencia clave con save():**
- `save()` decide entre POST o PUT según `isNew()`
- `update()` SIEMPRE usa PUT y falla si la entidad es nueva

### 4.3. Método delete()

**Firma:** `public async delete(): Promise<void>`

**Ubicación:** `src/entities/base_entitiy.ts` (líneas 833-870)

**Retorno:** `void` (sin valor de retorno)

**Flujo de ejecución:**
1. Verifica `validatePersistenceConfiguration()` - retorna `void` si falla
2. Verifica `validateApiMethod('DELETE')` - retorna `void` si DELETE no permitido
3. Verifica que NO sea nueva (`isNew()`) - muestra error y retorna `void` si es nueva
4. Ejecuta hook `beforeDelete()`
5. Ejecuta hook `onDeleting()`
6. Obtiene endpoint y unique key
7. Ejecuta DELETE request: `Application.axiosInstance.delete(\`${endpoint}/${uniqueKey}\`)`
8. Si éxito:
   - Ejecuta hook `afterDelete()`
   - Retorna `void`
9. Si error:
   - Ejecuta hook `deleteFailed()`
   - Muestra confirmation menu con error
   - Lanza excepción

**IMPORTANTE:** Este método retorna `void`, NO retorna boolean ni `this`.

### 4.4. Método getElementList()

**Firma:** `public static async getElementList<T extends BaseEntity>(this: new (data: Record<string, any>) => T, filter: string = ''): Promise<T[]>`

**Ubicación:** `src/entities/base_entitiy.ts` (líneas 698-725)

**Parámetros correctos:**
- Constructor signature: `new (data: Record<string, any>) => T` - Constructor que recibe data
- `filter: string = ''` - String de filtro (NO es `Record<string, any>`)

**Comportamiento:**
- Método estático que ejecuta GET al endpoint base
- El parámetro `filter` es un string simple, no un objeto
- Response esperado: array de objetos planos
- Cada objeto se transforma creando instancia: `new this(data)`
- Retorna array vacío si hay error

**Uso correcto:**
```typescript
const products = await Product.getElementList();
const filtered = await Product.getElementList('?active=true');
```

### 4.5. Método getElement()

**Firma:** `public static async getElement<T extends BaseEntity>(this: new (data: Record<string, any>) => T, oid: string): Promise<T>`

**Ubicación:** `src/entities/base_entitiy.ts` (líneas 669-696)

**Parámetros correctos:**
- Constructor signature: `new (data: Record<string, any>) => T` - Constructor que recibe data
- `oid: string` - ID del elemento (string, NO `any`)

**Retorno:** `Promise<T>` - NO retorna `null`, lanza excepción en caso de error

**Comportamiento:**
- Método estático que ejecuta GET a `${endpoint}/${oid}`
- Response esperado: objeto plano con datos de entidad
- Crea instancia con `new this(data)` pasando data al constructor
- Muestra confirmation menu con error si falla
- Lanza excepción en caso de error

**Uso correcto:**
```typescript
try {
    const product = await Product.getElement('123');
    // product es instancia de Product
} catch (error) {
    // Manejar error
}
```

### 4.6. Método toObject()

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~74)

**Algoritmo de serialización:**
```typescript
public toObject(): Record<string, any> {
    const properties = this.getProperties();
    const obj: Record<string, any> = {};
    
    properties.forEach((propertyName) => {
        obj[propertyName] = (this as any)[propertyName];
    });
    
    return obj;
}
```

**Comportamiento:**
- Itera sobre todas las propiedades obtenidas por getProperties()
- Copia cada propiedad al objeto resultante
- Retorna un objeto plano Record<string, any>
- No hace transformaciones especiales de tipos
- El backend es responsable de parsear correctamente los valores

### 4.7. Método refresh()

**Firma:** `public async refresh(filter: string = ''): Promise<this[]>`

**Ubicación:** `src/entities/base_entitiy.ts` (líneas 872-881)

**Parámetros:**
- `filter: string = ''` - Filtro opcional para query (igual que getElementList)

**Retorno:** `Promise<this[]>` - Array de instancias actualizadas de la misma clase

**Comportamiento:**
- Método de instancia (no estático) que recarga lista completa de entidades del mismo tipo
- Ejecuta internamente `getElementList(filter)` usando el constructor de la entidad
- Llama hook `afterRefresh()` en caso de éxito  
- Llama hook `refreshFailed()` en caso de error
- Útil para recargar datos tras operaciones CRUD de otras entidades

**Flujo de ejecución:**
1. Ejecuta `(this.constructor as typeof BaseEntity).getElementList(filter)`
2. Si éxito: Llama `this.afterRefresh()` y retorna array de entidades
3. Si error: Llama `this.refreshFailed()` y lanza excepción

**Implementación:**
```typescript
public async refresh(filter: string = ''): Promise<this[]> {
    try {
        const data = await (this.constructor as typeof BaseEntity).getElementList(filter);
        this.afterRefresh();
        return data;
    } catch (error) {
        this.refreshFailed();
        throw error;
    }
}
```

**Uso correcto:**
```typescript
const product = new Product({ id: 1 });
const allProducts = await product.refresh(); // Recarga lista completa
const filtered = await product.refresh('?category=electronics'); // Con filtro
```

**Caso de uso típico:**
```typescript
// Después de crear una entidad, recargar la lista
await newProduct.save();
const updatedList = await newProduct.refresh();
```

## 5. Flujo de Funcionamiento

### 5.1. Flujo Completo de save()

```
Usuario: entity.save()
  ↓
1. beforeSave() hook ejecuta
  ↓
2. validateInputs() ejecuta:
   - Verificar required
   - Ejecutar validaciones síncronas
   - await validaciones asíncronas
  ↓
3. ¿Validación exitosa?
   NO → Mostrar toast error → Retornar this sin cambios
   SÍ → Continuar
  ↓
4. ¿isPersistent() = true?
   NO → Lanzar Error
   SÍ → Continuar
  ↓
5. endpoint = getApiEndpoint()
  ↓
6. data = toObject()
  ↓
7. pkValue = getPrimaryPropertyValue()
  ↓
8. ¿pkValue exists?
   NO → POST a endpoint
   SÍ → PUT a endpoint/pkValue
  ↓
9.  Request HTTP ejecuta
  ↓
10. Response recibida
  ↓
11. Object.assign(this, response.data)
  ↓
12. afterSave() hook ejecuta
  ↓
13. Toast de éxito muestra
  ↓
14. eventBus.emit('saved', { entityClass, entity })
  ↓
15. return this
```

### 5.2. Flujo de delete()

```
Usuario: entity.delete()
  ↓
1. beforeDelete() hook ejecuta
  ↓
2. pkValue = getPrimaryPropertyValue()
  ↓
3. ¿pkValue exists?
   NO → Lanzar Error
   SÍ → Continuar
  ↓
4. ¿isPersistent() = true?
   NO → Lanzar Error
   SÍ → Continuar
  ↓
5. endpoint = getApiEndpoint()
  ↓
6. DELETE a endpoint/pkValue ejecuta
  ↓
7. ¿Éxito?
   SÍ → afterDelete() hook → Toast éxito → Emit 'deleted' → return true
   NO → Toast error → return false
```

### 5.3. Flujo de getElementList()

```
Usuario: Product.getElementList(filters)
  ↓
1. endpoint = getApiEndpoint()
  ↓
2. GET a endpoint con params=filters ejecuta
  ↓
3. Response: array de objetos
  ↓
4. Mapear cada objeto:
   entity = new Product()
   Object.assign(entity, objeto)
  ↓
5. Array de instancias creado
  ↓
6. eventBus.emit('list-fetched', { entityClass, entities })
  ↓
7. return array de instancias
```

### 5.4. Flujo de Serialización (toObject)

```
Usuario: entity.toObject()
  ↓
1. obj = {}
  ↓
2. properties = getProperties()
  ↓
3. Para cada propiedad:
   obj[propertyName] = this[propertyName]
  ↓
4. Retornar obj
     SÍ → dict[propiedad] = valor.getPrimaryPropertyValue()
   ¿Es Array?
     SÍ → dict[propiedad] = valor.map(...)
   ¿Es Date?
     SÍ → dict[propiedad] = valor.toISOString()
   Otro?
     → dict[propiedad] = valor
  ↓
4. return dict
```

## 6. Reglas Obligatorias

1. **Validación pre-guardado:** save() DEBE ejecutar validateInputs() antes de realizar request HTTP. Esta validación NO DEBE omitirse.

2. **Persistencia obligatoria:** Entidades que usen save(), update() o delete() DEBEN tener decorator @Persistent(). Código DEBE lanzar error si isPersistent() retorna false.

3. **Response completa:** Backend DEBE retornar objeto completo tras POST/PUT incluyendo ID y campos autogenerados. Frontend actualiza instancia con Object.assign(this, response.data).

4. **Endpoint configuration:** Entidad persistente DEBE declarar @ApiEndpoint('ruta'). getApiEndpoint() DEBE retornar string no-nulo.

5. **Primary key requirement:** delete() DEBE verificar que getPrimaryPropertyValue() no sea null/undefined antes de ejecutar request.

6. **Hook execution order:** Hooks DEBEN ejecutarse en orden: before* → operación → after*. No alterar orden.

7. **Event emission:** Operaciones exitosas DEBEN emitir eventos al eventBus: 'saved', 'deleted', 'list-fetched', 'element-fetched'.

8. **Error handling:** Operaciones CRUD DEBEN capturar excepciones, mostrar toast de error y manejar gracefully (retornar valor por defecto o lanzar error según método).

9. **Instance methods vs static:** save(), update(), delete() son métodos de instancia. getElementList(), getElement() son métodos estáticos. NO intercambiar.

10. **toObject for persistence:** Datos enviados a API usan toObject() para serializar la entidad a objeto plano antes de transmitir por HTTP.

## 7. Prohibiciones

1. **NO llamar save() dentro de beforeSave():** Genera loop infinito. beforeSave() solo debe modificar propiedades, NO ejecutar persistencia.

2. **NO modificar response.data:** Object.assign(this, response.data) debe recibir datos sin mutación previa. Backend debe enviar estructura correcta.

3. **NO asumir éxito sin verificar:** getElement() y getElementList() pueden retornar null o array vacío. SIEMPRE verificar resultado antes de usar.

4. **NO omitir manejo de errores:** Código que llama métodos CRUD NO DEBE asumir éxito. Usar try/catch o verificar retorno.

5. **NO crear instancias manualmente en getElement/getElementList:** Usar constructores de clase (`new this()`) para garantizar correcta inicialización.

6. **NO mutar entity durante toObject():** Método DEBE ser operación read-only que retorna nuevo objeto, sin efectos secundarios.

7. **NO ignorar hooks vacíos:** Si subclase NO necesita hook, simplemente omitir sobrescritura. NO llamar super.hook() ya que implementación base está vacía.

8. **NO usar delete() para soft delete sin override:** Si se requiere soft delete, sobrescribir delete() en subclase y preservar hardDelete() llamando super.delete().

## 8. Dependencias

**Internas:**
- Application.axiosInstance - Cliente HTTP central con interceptores de autenticación
- Application.ApplicationUIService.showToast() - Sistema de notificaciones toast
- Application.eventBus - Sistema de eventos reactivo
- Métodos de BaseEntity:
  - validateInputs() - Validación completa pre-guardado
  - isPersistent() - Verificación de @Persistent decorator
  - getPrimaryPropertyValue() - Obtención de valor de clave primaria
  - getApiEndpoint() - Obtención de endpoint configurado
  - getProperties() - Lista de propiedades a serializar
  - Lifecycle hooks: beforeSave(), afterSave(), beforeDelete(), afterDelete(), etc.

**Externas:**
- Axios library - Requests HTTP (GET, POST, PUT, DELETE)
- JavaScript Promise API - Operaciones asíncronas
- JSON serialization - Comparaciones y transporte de datos

**Decorators requeridos:**
- @Persistent() - Habilita persistencia en entidad
- @ApiEndpoint(url) - Configura URL base de API
- @PrimaryProperty(key) - Define clave primaria
- @ApiMethods(array) - [Opcional] Restringe métodos HTTP permitidos

## 9. Relaciones

**Consume:**
- BaseEntity core methods (getPropertyType, getPrimaryPropertyValue, etc.)
- Validation system (validateInputs, validaciones required/sync/async)
- Lifecycle hooks system (before*, after*, *Failed hooks)

**Utilizado por:**
- Componentes de formulario - Ejecutan save() y update() desde UI
- Componentes de tabla/lista - Ejecutan getElementList() para poblar datos
- Componentes de detalle - Ejecutan getElement() para cargar registro específico
- Botones de acción - Ejecutan delete() para eliminación

**Integra con:**
- Application.axiosInstance - Ejecución de requests HTTP
- Application.eventBus - Emisión de eventos tras operaciones
- Application. ApplicationUIService - Feedback visual mediante toasts

**Extiende funcionalidad de:**
- Active Record pattern - Implementación completa del patrón
- REST API client - Mapeo automático de operaciones a verbos HTTP

## 10. Notas de Implementación

**POST vs PUT discrimination:**  
save() usa isNew() internamente (verifica si getPrimaryPropertyValue() es null/undefined). Si backend usa UUIDs generados en cliente, registros nuevos tendrán ID antes de save(), rompiendo discriminación. Considerar usar flag _isNew o sobrescribir isNew().

**Batch operations:**  
Métodos actuales son individuales. Para operaciones batch (crear/actualizar/eliminar múltiples), usar Promise.all():
```typescript
await Promise.all(entities.map(e => e.save()));
```
Considerar implementar métodos estáticos saveBatch(), deleteBatch() para APIs que soporten batch endpoints.

**Pagination:**  
getElementList() no implementa paginación a nivel de BaseEntity. Implementar en Application o wrapper service:
```typescript
class ProductService {
    static async getPage(page: number, pageSize: number) {
        return Product.getElementList({ page, pageSize });
    }
}
```

**Cache invalidation:**  
Sistema no incluye caché. Si se implementa caché de lectura, invalidar en hooks afterSave() y afterDelete().

**Optimistic updates:**  
Sistema es pesimista (espera confirmación del servidor). Para UI optimista, actualizar inmediatamente y revertir si falla:
```typescript
const originalValue = entity.price;
entity.price = newPrice;
try {
    await entity.save();
} catch {
    entity.price = originalValue;
}
```

**Serialización de objetos complejos:**  
toObject() serializa todas las propiedades tal cual están. Si una propiedad es un objeto complejo o una instancia de BaseEntity, se transmitirá el objeto completo al backend.

**HTTP status codes:**  
Sistema asume convenciones REST estándar: 200/201 para éxito, 404 para not found, 422 para validation, 500 para server error. Ajustar si backend usa códigos diferentes.

**UUID as primary key:**  
Si se usan UUIDs generados en cliente, sobrescribir isNew() para usar flag interno en lugar de verificar nullability de PK.

**Soft delete implementation:**  
Para soft delete (marcar registro como deleted en lugar de eliminarlo), sobrescribir delete():
```typescript
async delete(): Promise<void> {
    this.deletedAt = new Date();
    await this.save();
}
```
Preservar hardDelete() que llama super.delete() para eliminación física.

**Transaction support:**  
Sistema no soporta transacciones. Operaciones múltiples no son atómicas. Para transacciones, implementar endpoint batch en backend o usar servicio de coordinación en frontend.

## 11. Referencias Cruzadas

**Documentación relacionada:**
- [base-entity-core.md](base-entity-core.md) - Arquitectura y métodos core de BaseEntity
- [validation-system.md](validation-system.md) - Sistema de validación pre-guardado
- [lifecycle-hooks.md](lifecycle-hooks.md) - before*, after*, *Failed hooks
- [metadata-access.md](metadata-access.md) - Acceso a metadatos de decoradores
- [persistence-methods.md](persistence-methods.md) - Métodos adicionales de persistencia
- [state-and-conversion.md](state-and-conversion.md) - Gestión de estado y conversión

**Decorators requeridos:**
- [../01-decorators/persistent-decorator.md](../01-decorators/persistent-decorator.md) - @Persistent
- [../01-decorators/api-endpoint-decorator.md](../01-decorators/api-endpoint-decorator.md) - @ApiEndpoint
- [../01-decorators/api-methods-decorator.md](../01-decorators/api-methods-decorator.md) - @ApiMethods
- [../01-decorators/primary-property-decorator.md](../01-decorators/primary-property-decorator.md) - @PrimaryProperty

**Sistemas relacionados:**
- [../03-application/application-singleton.md](../03-application/application-singleton.md) - Application singleton
- [../03-application/event-bus.md](../03-application/event-bus.md) - Sistema de eventos

**Tutoriales:**
- [../../tutorials/01-basic-crud.md](../../tutorials/01-basic-crud.md) - Tutorial CRUD básico completo
