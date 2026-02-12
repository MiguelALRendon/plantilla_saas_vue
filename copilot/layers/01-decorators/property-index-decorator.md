# PropertyIndex Decorator

## 1. Propósito

Establecer el orden de visualización y procesamiento de propiedades de entidades mediante índices numéricos secuenciales, determinando la secuencia en la que las propiedades se renderizan en interfaces de usuario y se procesan en operaciones de entidad.

## 2. Alcance

### 2.1 Responsabilidades

- Asignar índice numérico explícito a propiedades específicas de entidad
- Permitir ordenamiento personalizado de propiedades independiente del orden de declaración en código
- Garantizar consistencia de ordenamiento en todas las vistas de entidad
- Facilitar modificación de orden de presentación sin alterar estructura de clase
- Proporcionar mecanismo de ordenamiento compatible con otros decoradores de visualización

### 2.2 Límites

- No modifica el orden de propiedades en memoria o almacenamiento
- No afecta la lógica de negocio o procesamiento de datos
- No determina visibilidad de propiedades (requiere decoradores Hide*)
- No controla navegación por teclado (requiere @TabOrder)
- No influye en validación o persistencia de propiedades
- No permite ordenamiento dinámico basado en estado de entidad

## 3. Definiciones Clave

**PropertyIndex**: Índice numérico entero asociado a propiedad que determina su posición relativa en secuencias ordenadas.

**PropertyIndexMap**: Estructura Record<string, number> que mapea nombres de propiedades a sus índices asignados.

**Implicit Index**: Valor Number.MAX_SAFE_INTEGER asignado automáticamente a propiedades sin decorador @PropertyIndex explícito, colocándolas al final de secuencias ordenadas.

**Sorted Keys**: Array de nombres de propiedades ordenado según sus PropertyIndex values, usado por getKeys() para determinar secuencia de presentación.

**Index Collision**: Situación donde múltiples propiedades comparten el mismo índice numérico, resultando en ordenamiento indeterminado entre ellas basado en implementación del motor de ordenamiento JavaScript.

## 4. Descripción Técnica

### 4.1 Implementación del Decorador

```typescript
export const PROPERTY_INDEX_KEY = Symbol('property_index');

export function PropertyIndex(index: number): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[PROPERTY_INDEX_KEY]) {
            proto[PROPERTY_INDEX_KEY] = {};
        }
        proto[PROPERTY_INDEX_KEY][propertyKey] = index;
    };
}
```

El decorador utiliza Symbol único para evitar colisiones de namespace. Almacena metadata en prototype de constructor para permitir herencia de configuración. Implementa inicialización lazy del objeto de índices para minimizar overhead en entidades sin este decorador.

### 4.2 Método de Acceso en BaseEntity

```typescript
public getPropertyIndices(): Record<string, number> {
    const proto = (this.constructor as any).prototype;
    return proto[PROPERTY_INDEX_KEY] || {};
}
```

Método de instancia que recupera mapa completo de índices desde prototype. Retorna objeto vacío cuando no existen índices configurados, evitando errores de nullish access en operaciones de ordenamiento posteriores.

### 4.3 Método getKeys() con Ordenamiento

```typescript
public getKeys(): string[] {
    const columns = (this.constructor as typeof BaseEntity).getProperties();
    const keys = Object.keys(columns);
    const propertyIndices = this.getPropertyIndices();
    
    return keys.sort((a, b) => {
        const indexA = propertyIndices[a] ?? Number.MAX_SAFE_INTEGER;
        const indexB = propertyIndices[b] ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
    });
}
```

Algoritmo de ordenamiento que:
1. Obtiene lista completa de propiedades de entidad
2. Recupera mapa de índices configurados
3. Ordena propiedades comparando índices numéricos
4. Asigna Number.MAX_SAFE_INTEGER a propiedades sin índice, colocándolas al final
5. Mantiene orden declarativo relativo entre propiedades sin índice explícito

### 4.4 Almacenamiento de Metadata

El metadata se almacena en:
- Ubicación: Constructor.prototype[PROPERTY_INDEX_KEY]
- Estructura: Record<string | symbol, number>
- Vida útil: Permanente durante ejecución de aplicación
- Herencia: Compartida entre instancias de misma clase
- Serialización: No incluida en toDictionary() ni persistencia

## 5. Flujo de Funcionamiento

### 5.1 Fase de Declaración

```
Developer escribe clase entidad
    ↓
Aplica @PropertyIndex(n) a propiedades específicas
    ↓
TypeScript ejecuta decoradores en orden de declaración
    ↓
PropertyIndex() crea/actualiza objeto en prototype
    ↓
Almacena {propertyKey: index} en PROPERTY_INDEX_KEY
    ↓
Metadata disponible para todas las instancias
```

### 5.2 Fase de Acceso a Metadata

```
Código llama entity.getKeys()
    ↓
getKeys() invoca entity.getPropertyIndices()
    ↓
getPropertyIndices() lee prototype[PROPERTY_INDEX_KEY]
    ↓
Retorna Record<string, number> con índices configurados
    ↓
getKeys() ejecuta sort() comparando índices
    ↓
Propiedades sin índice reciben MAX_SAFE_INTEGER
    ↓
Retorna array ordenado de nombres de propiedades
```

### 5.3 Fase de Renderizado en UI

```
Componente necesita ordenar propiedades
    ↓
Llama entity.getKeys() para obtener secuencia ordenada
    ↓
Itera sobre keys en orden devuelto
    ↓
Para cada key, renderiza FormInput correspondiente
    ↓
Resultado: formulario con campos en orden especificado
```

### 5.4 Ejemplo de Ordenamiento

Dada esta entidad:
```typescript
class User extends BaseEntity {
    @PropertyIndex(3) email: string;
    @PropertyIndex(1) firstName: string;
    @PropertyIndex(2) lastName: string;
    phone: string; // Sin índice
}
```

Secuencia resultante de getKeys():
1. firstName (index: 1)
2. lastName (index: 2)
3. email (index: 3)
4. phone (index: MAX_SAFE_INTEGER, orden declarativo)

## 6. Reglas Obligatorias

### 6.1 Aplicación del Decorador

1. @PropertyIndex debe aplicarse a propiedades de clase, nunca a clase completa
2. Índice debe ser número entero positivo mayor o igual a cero
3. No aplicar @PropertyIndex a propiedades calculadas (getters)
4. No aplicar a propiedades privadas no renderizadas en UI
5. Índices pueden tener gaps (1, 3, 7 es válido)

### 6.2 Gestión de Índices

6. Usar secuencias incrementales (0, 1, 2...) para claridad de mantenimiento
7. Evitar colisiones de índices (múltiples propiedades con mismo valor)
8. Documentar razón de índices no secuenciales si se usan
9. Si se reordena propiedad, actualizar su índice explícitamente
10. Mantener coherencia de índices en clases heredadas

### 6.3 Interacción con Otros Decoradores

11. @PropertyIndex y @TabOrder son independientes, configurar ambos para formularios
12. Propiedades con @HideInListView siguen requiriendo @PropertyIndex si se muestran en DetailView
13. @Disabled y @ReadOnly no afectan ordenamiento ni son afectados
14. @ViewGroup no invalida @PropertyIndex, ordenar dentro de grupos
15. Propiedad con @PropertyIndex(0) siempre aparece primera independiente de otros decoradores

### 6.4 BaseEntity y Herencia

16. getPropertyIndices() retorna solo índices de propiedades de entidad actual
17. Clases hijas pueden sobrescribir índices de clase padre
18. getKeys() siempre retorna array ordenado, nunca null o undefined
19. Invocar getKeys() múltiples veces retorna mismo orden (idempotente)
20. PropertyIndex no afecta JSON.stringify() ni Object.keys() nativos

## 7. Prohibiciones

### 7.1 Prohibiciones de Implementación

1. PROHIBIDO usar índices negativos
2. PROHIBIDO usar números decimales como índices (1.5 es inválido)
3. PROHIBIDO usar Infinity o NaN como índices
4. PROHIBIDO usar strings como índices (decorador requiere number)
5. PROHIBIDO aplicar múltiples @PropertyIndex al mismo propertyKey

### 7.2 Prohibiciones de Uso

6. PROHIBIDO asumir que getKeys() retorna orden alfabético
7. PROHIBIDO modificar directamente prototype[PROPERTY_INDEX_KEY]
8. PROHIBIDO depender de orden declarativo sin @PropertyIndex explícito
9. PROHIBIDO usar PropertyIndex para controlar orden de validación
10. PROHIBIDO usar PropertyIndex para determinar orden de persistencia en API

### 7.3 Prohibiciones de Lógica

11. PROHIBIDO implementar lógica de negocio basada en valores de índice
12. PROHIBIDO usar índice como identificador de propiedad
13. PROHIBIDO exponer valores de índice en UI de usuario final
14. PROHIBIDO serializar PropertyIndex metadata en requests HTTP
15. PROHIBIDO usar PropertyIndex para determinar prioridad de campos requeridos

## 8. Dependencias

### 8.1 Dependencias Directas

**Symbol (JavaScript Nativo)**
- Propósito: Crear PROPERTY_INDEX_KEY único para evitar colisiones de namespace
- Uso: Almacenar metadata en prototype sin interferir con propiedades de entidad
- Crítico: Sí, sin Symbol el sistema podría sobrescribir propiedades de entidad

**PropertyDecorator (TypeScript)**
- Propósito: Tipado de decorador de propiedad
- Uso: Garantizar firma correcta de función decoradora
- Crítico: Sí, TypeScript rechazará decorador sin este tipo

**BaseEntity.prototype**
- Propósito: Almacenamiento de metadata compartida entre instancias
- Uso: Ubicación de Record<string, number> con índices
- Crítico: Sí, sin prototype cada instancia requeriría configuración individual

### 8.2 Dependencias de BaseEntity

**BaseEntity.getProperties()**
- Propósito: Obtener lista completa de propiedades de entidad
- Uso: Fuente de keys para ordenamiento en getKeys()
- Crítico: Sí, sin propiedades no hay qué ordenar

**Array.prototype.sort()**
- Propósito: Algoritmo de ordenamiento de propiedades
- Uso: Comparación de índices numéricos para determinar secuencia
- Crítico: Sí, sort() es mecanismo de ordenamiento principal

**Number.MAX_SAFE_INTEGER**
- Propósito: Valor sentinel para propiedades sin índice explícito
- Uso: Colocar propiedades no decoradas al final de secuencia
- Crítico: Sí, garantiza que propiedades decoradas siempre preceden a no decoradas

### 8.3 Dependencias Opcionales

**@TabOrder**
- Propósito: Ordenamiento de navegación por teclado
- Relación: Independiente de PropertyIndex, puede tener valores diferentes
- Recomendación: Mantener ambos sincronizados para coherencia UX

**@ViewGroup**
- Propósito: Agrupación de propiedades en secciones visuales
- Relación: PropertyIndex ordena dentro de grupos, no entre grupos
- Recomendación: Aplicar índices secuenciales dentro de cada grupo

## 9. Relaciones

### 9.1 Decoradores de Ordenamiento

**@TabOrder**
- Naturaleza: Decoradores hermanos con propósitos diferentes
- Diferencia: TabOrder controla navegación por Tab, PropertyIndex controla visualización
- Interacción: Ninguna, son completamente independientes
- Escenario: Formulario puede tener orden visual diferente de orden de navegación
- Recomendación: Sincronizar ambos para evitar confusión de usuario

### 9.2 Decoradores de Visibilidad

**@HideInListView**
- Interacción: Propiedad oculta en ListView aún requiere @PropertyIndex para DetailView
- Comportamiento: getKeys() incluye propiedades ocultas en su ordenamiento
- Filtrado: Componente ListView filtra propiedades ocultas después de ordenamiento
- Ejemplo: Email con PropertyIndex(5) y HideInListView aparece quinta en DetailView

**@HideInDetailView**
- Interacción: Propiedad oculta en DetailView aún requiere @PropertyIndex para ListView
- Comportamiento: Similar a HideInListView pero invertido
- Ejemplo: CreatedAt con PropertyIndex(10) y HideInDetailView aparece décimo en ListView

### 9.3 BaseEntity Methods

**getKeys()**
- Relación: Consumidor principal de PropertyIndex metadata
- Uso: Retorna propiedades ordenadas por índices
- Garantía: Siempre respeta @PropertyIndex antes de orden declarativo

**getArrayKeys()**
- Relación: No consume PropertyIndex, usa orden propio
- Diferencia: Filtra solo propiedades Array y no las ordena por índice
- Justificación: Arrays tienen ordenamiento funcional específico en UIInputArray

**getArrayKeysOrdered()**
- Relación: Similar a getKeys() pero solo para propiedades Array
- Decorador usado: @TabOrder (no PropertyIndex)
- Razón: Arrays necesitan navegación consistente pero visualización funcional

### 9.4 Componentes de UI

**FormLayoutComponent**
- Uso: Consume getKeys() para determinar secuencia de FormInputs
- Algoritmo: Itera keys en orden, renderiza input para cada key
- Respeto: Total, no reordena ni filtra keys devueltos

**DetailViewTableComponent**
- Uso: Consume getKeys() para determinar filas de tabla
- Filtrado: Aplica HideInDetailView después de obtener keys ordenados
- Resultado: Tabla con propiedades visibles en orden especificado

**ListViewComponent**
- Uso: Similar a DetailView pero aplica HideInListView
- Paginación: No afecta ordenamiento, opera sobre conjunto ya ordenado

### 9.5 Validación y Persistencia

**Validation System**
- Relación: Ninguna, validación no depende de orden de propiedades
- Independencia: Validaciones ejecutan en orden de definición, no de PropertyIndex
- Advertencia: No usar PropertyIndex para controlar secuencia de validaciones

**toDictionary()**
- Relación: Ninguna, serialización no respeta PropertyIndex
- Comportamiento: Object.keys() nativo, orden indeterminado en JSON
- Implicación: API backend no recibe propiedades en orden de PropertyIndex

## 10. Notas de Implementación

### 10.1 Patrones de Uso Comunes

**Ordenamiento de Campos de Formulario**
```typescript
class ContactForm extends BaseEntity {
    @PropertyIndex(0) @Required() firstName: string;
    @PropertyIndex(1) @Required() lastName: string;
    @PropertyIndex(2) @Validation(...) email: string;
    @PropertyIndex(3) phone: string;
    @PropertyIndex(4) address: string;
}
```

Resultado: Formulario con firstName → lastName → email → phone → address en ese orden visual exacto. Sin @PropertyIndex, orden dependería de implementación del motor JavaScript.

**Reordenamiento sin Modificar Declaración**
```typescript
class Product extends BaseEntity {
    id: number;
    name: string;
    @PropertyIndex(0) price: number; // Destacar precio al inicio
    category: string;
    stock: number;
}
```

Price aparece primero visualmente aunque esté tercero en código. Resto de propiedades siguen orden declarativo.

**Índices con Gaps para Extensibilidad**
```typescript
class User extends BaseEntity {
    @PropertyIndex(10) username: string;
    @PropertyIndex(20) email: string;
    @PropertyIndex(30) role: string;
}
```

Gaps de 10 permiten insertar propiedades futuras (ej: @PropertyIndex(15) displayName) sin renumerar todos los índices existentes.

### 10.2 Casos de Comportamiento Especial

**Colisión de Índices**
```typescript
class Entity extends BaseEntity {
    @PropertyIndex(1) propA: string;
    @PropertyIndex(1) propB: string; // Mismo índice
    @PropertyIndex(2) propC: string;
}
```

Resultado: propA y propB tendrán orden indeterminado entre sí (depende de Array.sort() de JavaScript), pero ambos precederán a propC. Evitar este patrón.

**Propiedades sin Índice**
```typescript
class Mixed extends BaseEntity {
    @PropertyIndex(0) first: string;
    middle: string; // Sin índice
    @PropertyIndex(1) last: string;
}
```

Resultado: first → last → middle. Propiedades sin índice siempre aparecen al final independiente de declaración.

**Herencia de Índices**
```typescript
class Parent extends BaseEntity {
    @PropertyIndex(0) parentProp: string;
}

class Child extends Parent {
    @PropertyIndex(1) childProp: string;
}
```

Comportamiento: Cada clase mantiene su propio PropertyIndex metadata. getKeys() en Child considera solo propiedades declaradas en Child, no hereda índices de Parent.

### 10.3 Performance y Optimización

**Complejidad de Ordenamiento**
- Tiempo: O(n log n) donde n = número de propiedades
- Espacio: O(n) para array temporal de keys
- Impacto: Negligible incluso con 100+ propiedades por entidad

**Cache de getKeys()**
No implementado actualmente. getKeys() reordena en cada invocación. Para entidades con 50+ propiedades invocadas frecuentemente, considerar:
```typescript
private _cachedKeys?: string[];
public getKeys(): string[] {
    if (!this._cachedKeys) {
        this._cachedKeys = this._computeSortedKeys();
    }
    return this._cachedKeys;
}
```

**Minimizar Uso de PropertyIndex**
Solo aplicar a entidades con formularios complejos. Entidades simples de 3-5 propiedades raramente requieren ordenamiento explícito.

### 10.4 Debugging y Diagnóstico

**Inspeccionar Índices en Runtime**
```typescript
const user = new User();
const indices = user.getPropertyIndices();
console.log('PropertyIndex map:', indices);
// Output: { firstName: 1, lastName: 2, email: 3 }

const orderedKeys = user.getKeys();
console.log('Ordered keys:', orderedKeys);
// Output: ['firstName', 'lastName', 'email', 'phone']
```

**Detectar Índices Faltantes**
```typescript
const allKeys = Object.keys(User.getProperties());
const indexedKeys = Object.keys(user.getPropertyIndices());
const missingIndices = allKeys.filter(k => !indexedKeys.includes(k));
console.log('Properties without @PropertyIndex:', missingIndices);
```

**Validar Secuencia Continua**
```typescript
const indices = Object.values(user.getPropertyIndices()).sort();
const hasGaps = indices.some((val, i, arr) => i > 0 && val !== arr[i-1] + 1);
if (hasGaps) console.warn('PropertyIndex sequence has gaps');
```

### 10.5 Migraciones y Refactoring

**Agregar PropertyIndex a Entidad Existente**
1. Identificar orden actual de propiedades en UI
2. Aplicar @PropertyIndex siguiendo ese orden (evitar cambios abruptos)
3. Testear formularios afectados
4. Documentar razón del ordenamiento específico

**Cambiar Orden de Propiedad**
1. Modificar solo el valor numérico del @PropertyIndex
2. No mover declaración de propiedad en clase
3. Verificar que nuevo orden no rompe lógica de formulario
4. Actualizar tests que asuman orden específico

**Remover PropertyIndex**
1. Eliminar decorador @PropertyIndex
2. Verificar que orden declarativo es aceptable
3. Documentar que ahora se depende de orden de código
4. Considerar impacto en formularios generados

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Acceso a Metadata de Ordenamiento
- Contenido: Descripción detallada de getPropertyIndices() y getKeys()
- Relevancia: Implementación técnica de acceso a PropertyIndex metadata

**copilot/layers/01-decorators/tab-order-decorator.md**
- Relación: Decorador hermano para ordenamiento de navegación
- Diferencia: TabOrder controla Tab key, PropertyIndex controla Visual Order
- Uso conjunto: Mantener ambos sincronizados para coherencia UX

**copilot/layers/01-decorators/view-group-decorator.md**
- Relación: Agrupación de propiedades en secciones visuales
- Interacción: PropertyIndex ordena dentro de grupos, ViewGroup crea grupos
- Patrón: Usar índices secuenciales dentro de cada ViewGroup

**copilot/layers/01-decorators/hide-in-list-view-decorator.md**
**copilot/layers/01-decorators/hide-in-detail-view-decorator.md**
- Relación: Filtrado de propiedades después de ordenamiento
- Flujo: getKeys() ordena → Componente filtra ocultos → Renderizado
- Implicación: Propiedades ocultas aún necesitan PropertyIndex para otras vistas

### 11.2 Componentes de UI

**copilot/layers/04-components/FormLayoutComponent.md**
- Consumo: Usa getKeys() para determinar secuencia de FormInputs
- Respeto: Total del orden devuelto, no reordena
- Customización: ModuleCustomComponents pueden anular FormLayoutComponent completo

**copilot/layers/04-components/DetailViewTableComponent.md**
- Consumo: Usa getKeys() para generar filas de tabla
- Filtrado: Aplica HideInDetailView después de ordenamiento
- Presentación: Tabla vertical con propiedades en orden PropertyIndex

**copilot/layers/04-components/ListViewComponent.md**
- Consumo: Usa getKeys() para columnas de tabla
- Filtrado: Aplica HideInListView después de ordenamiento
- Presentación: Tabla horizontal con columnas en orden PropertyIndex

### 11.3 Código Fuente

**src/decorations/property_index_decorator.ts**
- Líneas: 1-12
- Contenido: Implementación completa del decorador
- Symbol: PROPERTY_INDEX_KEY exportado para uso en BaseEntity

**src/entities/base_entity.ts**
- Líneas 95-100: Algoritmo de ordenamiento en getKeys()
- Líneas 118-121: Método getPropertyIndices()
- Dependencias: Importa PROPERTY_INDEX_KEY desde decorator file

### 11.4 Tutoriales y Ejemplos

**copilot/tutorials/01-basic-crud.md**
- Sección: Configuración Avanzada de Propiedades
- Ejemplo: Uso de @PropertyIndex para ordenar formulario de Usuario
- Código: Entidad User con firstName, lastName, email ordenados

**copilot/examples/advanced-module-example.md**
- Sección: Optimización de Formularios Complejos
- Patrón: Uso de PropertyIndex con gaps para escalabilidad
- Técnica: Reordenamiento de Product con price al inicio

### 11.5 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 4.2: Arquitectura en Capas
- Principio: Metadata define comportamiento, PropertyIndex es metadata de presentación
- Sección 8.1: Decoradores como única fuente de configuración

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Sistema de Decoradores
- Contexto: PropertyIndex dentro del ecosistema de decoradores de metadatos
- Flujo: Entity → Decorators → Metadata → UI

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Generación de Interfaces
- Flujo: getKeys() → Component iteration → FormInput rendering
- Garantía: Orden de PropertyIndex respetado en toda la cadena de renderizado
