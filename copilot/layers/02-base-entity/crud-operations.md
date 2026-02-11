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
- Serialización vía toDictionary() con manejo de relaciones y tipos complejos
- Deserialización vía fromDictionary() con transformación de tipos
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

**toDictionary():** Método de serialización que convierte instancia BaseEntity a objeto plano Record<string, any>, manejando relaciones (extrae solo IDs), arrays (serializa recursivamente) y tipos primitivos.

**fromDictionary():** Método estático de deserialización que construye instancia BaseEntity desde objeto plano, aplicando transformaciones de tipo (ISO strings a Date, etc.).

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
2. Llama validateInputs() que ejecuta validaciones required, sync y async
3. Si validación falla: muestra toast, retorna instancia sin cambios
4. Verifica isPersistent() - lanza error si entity no tiene @Persistent()
5. Obtiene endpoint vía getApiEndpoint()
6. Serializa instancia con toDictionary()
7. Discrimina entre POST (isNew = true) o PUT (isNew = false)
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

**Firma:** `public async update(data?: Partial<this>): Promise<this>`

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~780)

**Implementación:**
```typescript
public async update(data?: Partial<this>): Promise<this> {
    if (data) {
        Object.assign(this, data);
    }
    return this.save();
}
```

Método de conveniencia que opcionalmente merge datos parciales antes de delegar a save(). Permite actualización fluida: `await product.update({ price: 999 })`.

### 4.3. Método delete()

**Firma:** `public async delete(): Promise<boolean>`

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~790)

**Flujo de ejecución:**
1. Ejecuta hook beforeDelete()
2. Obtiene pkValue con getPrimaryPropertyValue()
3. Si pkValue es null/undefined: lanza error "Cannot delete entity without ID"
4. Verifica isPersistent() - lanza error si no es persistente
5. Obtiene endpoint vía getApiEndpoint()
6. Ejecuta DELETE request: `Application.axiosInstance.delete(\`${endpoint}/${pkValue}\`)`
7. Si éxito:
   - Ejecuta hook afterDelete()
   - Muestra toast de éxito
   - Emite evento 'deleted' con { entityClass, entity }
   - Retorna true
8. Si error:
   - Muestra toast con mensaje de error
   - Retorna false

**Diferencia con save/update:** Retorna boolean en lugar de this, ya que entidad eliminada no debe seguir usándose.

### 4.4. Método getElementList()

**Firma:** `public static async getElementList<T extends BaseEntity>(this: new () => T, filters?: Record<string, any>): Promise<T[]>`

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~615)

**Comportamiento:**
- Método estático que ejecuta GET al endpoint base
- Parámetro filters se convierte en query params: `{ active: true }` → `?active=true`
- Response esperado: array de objetos planos
- Cada objeto se transforma en instancia de la entidad: `new this()` + `Object.assign()`
- Emite evento 'list-fetched' con array completo
- Retorna array vacío si hay error (no lanza excepción)

**Uso típico:**
```typescript
const products = await Product.getElementList();
const filtered = await Product.getElementList({ category: 'electronics', active: true });
```

### 4.5. Método getElement()

**Firma:** `public static async getElement<T extends BaseEntity>(this: new () => T, id: any): Promise<T | null>`

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~650)

**Comportamiento:**
- Método estático que ejecuta GET a `${endpoint}/${id}`
- Response esperado: objeto plano con datos de entidad
- Crea instancia con `new this()` + `Object.assign()`
- Emite evento 'element-fetched' con instancia
- Retorna null si error 404 (registro no encontrado)
- Retorna null para otros errores también (no lanza excepción)

**Manejo especial de 404:**
```typescript
if (error.response?.status === 404) {
    Application.showToast('Record not found', 'warning');
} else {
    Application.showToast(error.response?.data?.message || 'Failed to fetch record', 'error');
}
return null;
```

### 4.6. Método toDictionary()

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~520)

**Algoritmo de serialización:**
```typescript
public toDictionary(): Record<string, any> {
    const dict: Record<string, any> = {};
    const properties = this.getProperties();
    
    properties.forEach(key => {
        const value = (this as any)[key];
        
        if (value instanceof BaseEntity) {
            dict[key] = value.getPrimaryPropertyValue();  // Solo ID
        } else if (Array.isArray(value)) {
            dict[key] = value.map(item => 
                item instanceof BaseEntity ? item.toDictionary() : item
            );
        } else if (value instanceof Date) {
            dict[key] = value.toISOString();
        } else {
            dict[key] = value;
        }
    });
    
    return dict;
}
```

**Reglas de transformación:**
- **BaseEntity:** Extrae solo primary key value (evita serializar objeto completo)
- **Array:** Mapea cada elemento; si es BaseEntity llama recursivamente toDictionary()
- **Date:** Convierte a ISO 8601 string
- **Primitivos:** Se copian directamente

### 4.7. Método fromDictionary()

**Método estático de construcción:**
```typescript
public static fromDictionary<T extends BaseEntity>(
    this: new () => T,
    data: Record<string, any>
): T {
    const entity = new this();
    
    Object.entries(data).forEach(([key, value]) => {
        if (entity.getPropertyType(key) === Date && typeof value === 'string') {
            (entity as any)[key] = new Date(value);
        } else {
            (entity as any)[key] = value;
        }
    });
    
    return entity;
}
```

**Transformación inversa:** Convierte strings ISO a objetos Date cuando el tipo de propiedad lo indica.

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
6. data = toDictionary()
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

### 5.4. Flujo de Serialización (toDictionary)

```
Usuario: entity.toDictionary()
  ↓
1. dict = {}
  ↓
2. properties = getProperties()
  ↓
3. Para cada propiedad:
   valor = this[propiedad]
   ↓
   ¿Es BaseEntity?
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

9. **Instance methods vs static:** save(), update(), delete() son métodos de instancia. getElementList(), getElement(), fromDictionary() son métodos estáticos. NO intercambiar.

10. **toDictionary for persistence:** Datos enviados a API DEBEN usar toDictionary(), no toObject(). toDictionary() excluye propiedades internas y serializa correctamente relaciones.

## 7. Prohibiciones

1. **NO llamar save() dentro de beforeSave():** Genera loop infinito. beforeSave() solo debe modificar propiedades, NO ejecutar persistencia.

2. **NO modificar response.data:** Object.assign(this, response.data) debe recibir datos sin mutación previa. Backend debe enviar estructura correcta.

3. **NO usar toObject() para persistencia:** toObject() incluye propiedades internas (_isLoading, _originalState) que NO deben enviarse a API.

4. **NO asumir éxito sin verificar:** getElement() y getElementList() pueden retornar null o array vacío. SIEMPRE verificar resultado antes de usar.

5. **NO omitir manejo de errores:** Código que llama métodos CRUD NO DEBE asumir éxito. Usar try/catch o verificar retorno.

6. **NO crear instancias manualmente en getElement/getElementList:** Usar constructores de clase (`new this()`) para garantizar correcta inicialización.

7. **NO mutar entity durante toDictionary():** Método DEBE ser operación read-only que retorna nuevo objeto, sin efectos secundarios.

8. **NO ignorar hooks vacíos:** Si subclase NO necesita hook, simplemente omitir sobrescritura. NO llamar super.hook() ya que implementación base está vacía.

9. **NO usar delete() para soft delete sin override:** Si se requiere soft delete, sobrescribir delete() en subclase y preservar hardDelete() llamando super.delete().

10. **NO enviar entity completa en relaciones:** toDictionary() DEBE extraer solo IDs para relaciones BaseEntity. Enviar objeto completo causa payload innecesariamente grande.

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

**Relaciones anidadas:**  
toDictionary() solo maneja un nivel de profundidad para relaciones. Arrays de BaseEntity se serializan recursivamente, pero objetos anidados complejos pueden requerir lógica custom.

**HTTP status codes:**  
Sistema asume convenciones REST estándar: 200/201 para éxito, 404 para not found, 422 para validation, 500 para server error. Ajustar si backend usa códigos diferentes.

**UUID as primary key:**  
Si se usan UUIDs generados en cliente, sobrescribir isNew() para usar flag interno en lugar de verificar nullability de PK.

**Soft delete implementation:**  
Para soft delete (marcar registro como deleted en lugar de eliminarlo), sobrescribir delete():
```typescript
async delete(): Promise<boolean> {
    this.deletedAt = new Date();
    await this.save();
    return true;
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
