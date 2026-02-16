# ReadOnly Decorator

## 1. Propósito

Deshabilitar la edición de propiedades específicas en interfaces de usuario generadas automáticamente, permitiendo visualización de valores sin posibilidad de modificación mediante controles de formulario, garantizando integridad de datos calculados, derivados o protegidos.

## 2. Alcance

### 2.1 Responsabilidades

- Marcar propiedades como no editables en componentes de UI generados
- Soportar condiciones estáticas (boolean) y dinámicas (function) para readonly
- Proporcionar método isReadOnly() para consulta de estado en runtime
- Permitir readonly condicional basado en estado de entidad
- Mantener valores de propiedades readonly en toDictionary() y persistencia
- Renderizar campos readonly con estilos visuales diferenciados

### 2.2 Límites

- No impide modificación programática directa de propiedades (entity.prop = value sigue funcionando)
- No valida intentos de modificación en código, solo afecta UI
- No excluye propiedades readonly de requests HTTP (diferente de @Disabled)
- No protege propiedades en APIs REST backend
- No reemplaza validación de permisos o autorización
- No oculta propiedades, solo deshabilita edición (diferente de @HideInDetailView)

## 3. Definiciones Clave

**ReadOnly Condition**: Expresión boolean o función que determina si propiedad es editable, evaluada en runtime para cada instancia de entidad.

**Static ReadOnly**: Configuración readonly fija mediante boolean literal true, aplicable a todas las instancias de entidad sin excepción.

**Dynamic ReadOnly**: Configuración readonly mediante función que recibe instancia de entidad y retorna boolean, permitiendo readonly condicional basado en estado.

**ReadOnlyMetadata**: Estructura de datos que almacena configuración readonly de propiedad, conteniendo condition (boolean | function) y accesible mediante Symbol-based metadata storage.

**Visual Readonly State**: Representación en UI de campo readonly mediante atributos HTML disabled/readonly, estilos CSS diferenciados y prevención de eventos de modificación.

**Readonly vs Disabled**: ReadOnly permite incluir valor en toDictionary() y persistencia, Disabled excluye valor de requests backend.

## 4. Descripción Técnica

### 4.1 Implementación del Decorador

```typescript
export const READONLY_KEY = Symbol('readonly');

export type ReadOnlyCondition = boolean | ((instance: any) => boolean);

export interface ReadOnlyMetadata {
    condition: ReadOnlyCondition;
}

export function ReadOnly(condition: ReadOnlyCondition = true): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[READONLY_KEY]) {
            proto[READONLY_KEY] = {};
        }
        
        proto[READONLY_KEY][propertyKey] = {
            condition: condition
        };
    };
}
```

El decorador acepta parámetro opcional condition que defaults a true para casos simples. Almacena metadata en prototype usando Symbol único para evitar colisiones. Interface ReadOnlyMetadata encapsula condition permitiendo extensiones futuras sin breaking changes.

### 4.2 Método de Acceso en BaseEntity

```typescript
public isReadOnly(propertyKey: string): boolean {
    const proto = (this.constructor as any).prototype;
    const readOnlyFields: Record<string, ReadOnlyMetadata> = proto[READONLY_KEY] || {};
    const metadata = readOnlyFields[propertyKey];
    
    if (!metadata) {
        return false;
    }
    
    return typeof metadata.condition === 'function' 
        ? metadata.condition(this) 
        : metadata.condition;
}
```

Método de instancia que:
1. Recupera metadata de readonly desde prototype
2. Retorna false para propiedades sin decorador (editable por defecto)
3. Evalúa functions pasando this context para condiciones dinámicas
4. Retorna boolean directo para condiciones estáticas
5. Permite llamadas frecuentes sin overhead significativo

### 4.3 Almacenamiento de Metadata

El metadata se almacena en:
- Ubicación: Constructor.prototype[READONLY_KEY]
- Estructura: Record<string | symbol, ReadOnlyMetadata>
- Vida útil: Permanente durante lifecycle de aplicación
- Herencia: Compartida entre todas las instancias de clase
- Evaluación: Lazy, solo cuando isReadOnly() es invocado

## 5. Flujo de Funcionamiento

### 5.1 Fase de Declaración - Readonly Estático

```
Developer aplica @ReadOnly() o @ReadOnly(true)
    ↓
TypeScript ejecuta decorador en tiempo de definición de clase
    ↓
ReadOnly() crea objeto en prototype[READONLY_KEY]
    ↓
Almacena {propertyKey: {condition: true}}
    ↓
Metadata disponible para todas las instancias futuras
```

### 5.2 Fase de Declaración - Readonly Dinámico

```
Developer aplica @ReadOnly((entity) => entity.status === 'PUBLISHED')
    ↓
Decorador almacena función en metadata
    ↓
{propertyKey: {condition: (entity) => boolean}}
    ↓
Función se evaluará dinámicamente por cada instancia
```

### 5.3 Fase de Renderizado en UI

```
FormInput component necesita renderizar propiedad
    ↓
Llama entity.isReadOnly(propertyKey)
    ↓
isReadOnly() recupera metadata de prototype
    ↓
Si condition es function, ejecuta pasando entity instance
    ↓
Retorna boolean indicando si es readonly
    ↓
FormInput aplica atributo readonly o disabled a input HTML
    ↓
Input se renderiza visualmente deshabilitado
    ↓
Eventos de modificación son prevenidos en navegador
```

### 5.4 Fase de Persistencia

```
Entity.save() invocado
    ↓
Entity.toDictionary() genera payload
    ↓
Propiedades readonly SE INCLUYEN en payload
    ↓
Request HTTP contiene valores readonly
    ↓
Backend recibe y puede validar/ignorar según lógica server
```

Diferencia con @Disabled: Disabled excluye valores de payload, ReadOnly los incluye.

## 6. Reglas Obligatorias

### 6.1 Aplicación del Decorador

1. @ReadOnly debe aplicarse solo a property decorators, nunca a clases
2. Condition puede ser boolean literal o función que retorna boolean
3. Función condition debe ser pura (sin side effects)
4. Función condition recibe instancia completa de entidad como parámetro
5. Default value de condition es true si se omite parámetro

### 6.2 Implementación de Condiciones

6. Condiciones estáticas usar boolean: @ReadOnly(true)
7. Condiciones dinámicas usar arrow function: @ReadOnly((e) => e.isLocked)
8. No usar async functions como condition (debe retornar boolean inmediato)
9. Condition function no debe modificar estado de entidad
10. Condition function debe completar en <10ms para no bloquear UI

### 6.3 Interacción con Otros Decoradores

11. @ReadOnly no afecta @Required validation
12. @ReadOnly no excluye propiedad de toDictionary()
13. @ReadOnly y @Disabled pueden coexistir, Disabled toma precedencia
14. @ReadOnly no afecta @HideInListView o @HideInDetailView
15. Propiedad readonly aún ejecuta @Validation decorators cuando valor cambia programáticamente

### 6.4 Comportamiento en UI

16. FormInput debe renderizar readonly field con estilos diferenciados
17. Readonly field puede ser selectable para copy-paste de valor
18. Readonly field no emite eventos de change o input
19. Readonly field muestra valor formateado según @DisplayFormat
20. Readonly field en formulario nuevo puede permitir edición si condition lo permite

### 6.5 Persistencia y Backend

21. Propiedades readonly se incluyen en POST y PUT requests
22. Backend debe implementar validación de campos readonly si necesario
23. @ReadOnly es hint de UI, no garantía de seguridad backend
24. Valores readonly pueden cambiar programáticamente antes de save()
25. isReadOnly() debe consultarse en cada render para capturar cambios de condición

## 7. Prohibiciones

### 7.1 Prohibiciones de Implementación

1. PROHIBIDO usar @ReadOnly para seguridad backend (es solo UI hint)
2. PROHIBIDO asumir que propiedad readonly no puede cambiar programáticamente
3. PROHIBIDO usar condition functions con side effects
4. PROHIBIDO hacer network requests dentro de condition function
5. PROHIBIDO usar condition que depende de variables globales mutables

### 7.2 Prohibiciones de Uso

6. PROHIBIDO aplicar @ReadOnly a propiedades private no expuestas en UI
7. PROHIBIDO usar @ReadOnly en lugar de @Disabled cuando se quiere excluir de payload
8. PROHIBIDO combinar @ReadOnly(false) con lógica de validación que asume readonly true
9. PROHIBIDO usar @ReadOnly para ocultar propiedades (usar @HideInDetailView)
10. PROHIBIDO depender de isReadOnly() para control de acceso o autorización

### 7.3 Prohibiciones de Lógica

11. PROHIBIDO implementar business logic que asume readonly significa immutable
12. PROHIBIDO usar valores de readonly en cálculos de lógica de negocio
13. PROHIBIDO serializar metadata de readonly en APIs públicas
14. PROHIBIDO exponer condition functions en JSON responses
15. PROHIBIDO usar @ReadOnly como reemplazo de validación de permisos RBAC

### 7.4 Prohibiciones de Condiciones

16. PROHIBIDO usar condition que siempre retorna false (usar no decorador)
17. PROHIBIDO usar condition con lógica compleja de >5 operaciones
18. PROHIBIDO usar condition que accede a propiedades no inicializadas
19. PROHIBIDO usar condition que depende de timing o Date.now() directo
20. PROHIBIDO usar condition que puede lanzar excepciones

## 8. Dependencias

### 8.1 Dependencias Directas

**Symbol (JavaScript Nativo)**
- Propósito: Crear READONLY_KEY único para storage de metadata
- Uso: Almacenar ReadOnlyMetadata en prototype sin colisiones
- Crítico: Sí, sin Symbol podría sobrescribir propiedades de entidad

**TypeScript PropertyDecorator**
- Propósito: Tipado de decorador de propiedad
- Uso: Garantizar firma correcta de función ReadOnly()
- Crítico: Sí, TypeScript rechazará decorador sin tipo correcto

**BaseEntity.prototype**
- Propósito: Ubicación de almacenamiento de metadata compartida
- Uso: Contiene Record<string, ReadOnlyMetadata> accesible por instancias
- Crítico: Sí, instancias necesitan acceder a metadata de clase

### 8.2 Dependencias de BaseEntity

**isReadOnly() Method**
- Propósito: Accessor method para consultar estado readonly de propiedad
- Uso: Invocado por FormInput components durante renderizado
- Crítico: Sí, sin este método UI no puede determinar readonly state

**toDictionary() Method**
- Interacción: Propiedades readonly SE INCLUYEN en diccionario
- Diferencia: Contrasta con @Disabled que excluye propiedades
- Crítico: No, pero importante para consistencia de persistencia

### 8.3 Dependencias de UI Components

**FormInput Components**
- Propósito: Renderizar inputs con estado readonly apropiado
- Uso: Invocan entity.isReadOnly(key) para cada propiedad
- Crítico: Sí, sin componentes readonly decorator no tiene efecto visible

**HTML Input Attributes**
- readonly attribute: Para inputs de texto, textarea
- disabled attribute: Para selects, checkboxes, radios
- Uso: Prevenir edición en navegador según tipo de input
- Crítico: Sí, mecanismo de enforcement en navegador

### 8.4 Dependencias Opcionales

**@Disabled Decorator**
- Relación: Decorador hermano con propósito similar pero comportamiento diferente
- Diferencia: Disabled excluye de payload, ReadOnly incluye
- Interacción: Si ambos presentes, Disabled toma precedencia
- Recomendación: Usar solo uno de los dos en misma propiedad

**@DisplayFormat Decorator**
- Relación: Formateo de valor visualizado en campo readonly
- Uso: Readonly fields muestran valor formateado
- Ejemplo: Campo readonly de moneda muestra $1,234.56 según DisplayFormat

**CSS Styling**
- Clases CSS: .readonly-field, input[readonly], input:disabled
- Propósito: Indicación visual de estado readonly
- Recomendación: Aplicar estilos consistentes para mejorar UX

## 9. Relaciones

### 9.1 Decoradores de Estado de UI

**@Disabled**
- Naturaleza: Decorador hermano con propósito similar
- Diferencia Clave: Disabled excluye propiedad de toDictionary(), ReadOnly la incluye
- Interacción: Si ambos aplicados, Disabled prevalece en comportamiento
- Escenario: ReadOnly para campos calculados que backend necesita, Disabled para campos UI-only
- Recomendación: Nunca aplicar ambos a misma propiedad, usar Disabled si se quiere excluir de payload

**@Required**
- Interacción: Campo readonly puede ser required si tiene default value
- Validación: Required validation ejecuta incluso si campo es readonly
- Escenario: Propiedad readonly con valor calculado que debe estar presente
- Ejemplo: createdAt readonly pero required en nuevo registro

### 9.2 Decoradores de Visualización

**@HideInDetailView**
- Diferencia: HideInDetailView oculta completamente, ReadOnly solo deshabilita edición
- Uso conjunto: No tiene sentido (si está oculto, readonly es irrelevante)
- Alternativa: Usar HideInDetailView en lugar de ReadOnly si no se debe ver

**@HideInListView**
- Interacción: Compatible, campo puede ser readonly en DetailView y oculto en ListView
- Caso de uso: createdAt oculto en tabla pero readonly visible en formulario

**@DisplayFormat**
- Interacción: Readonly fields usan DisplayFormat para presentación
- Comportamiento: Valor formateado se muestra en input readonly
- Ejemplo: Readonly price field muestra $1,234.56 según DisplayFormat currency

### 9.3 Decoradores de Metadata

**@PropertyName**
- Relación: Label de campo readonly usa PropertyName
- Presentación: "Created At" label para readonly createdAt field

**@HelpText**
- Relación: Readonly field puede mostrar HelpText explicativo
- Ejemplo: "This field is calculated automatically" como HelpText

### 9.4 BaseEntity Methods

**isReadOnly(propertyKey)**
- Relación: Único punto de acceso a ReadOnly metadata
- Implementación: Evalúa condition (boolean o function)
- Garantía: Siempre retorna boolean, nunca null o undefined

**toDictionary()**
- Relación: Incluye propiedades readonly en payload
- Diferencia: Contrasta con Disabled que las excluye
- Justificación: Backend puede validar valores calculados

**save()**
- Relación: Propiedades readonly se envían en POST/PUT
- Backend: Debe validar valores readonly si son críticos
- Seguridad: @ReadOnly no es mecanismo de seguridad

### 9.5 Componentes de UI

**FormInput Component**
- Consumo: Llama entity.isReadOnly(key) en cada render
- Aplicación: Agrega atributo readonly/disabled a HTML input
- Estilo: Aplica clases CSS readonly para indicación visual

**DetailViewTable Component**
- Comportamiento: Muestra campos readonly como texto plano o input disabled
- Estilo: Diferenciación visual entre campos editables y readonly

**ListViewComponent**
- Relación: No consulta isReadOnly (ListView no permite edición inline por default)
- Excepción: Si inline editing implementado, debe respetar isReadOnly

## 10. Notas de Implementación

### 10.1 Patrones de Uso Comunes

**Readonly Estático - Campos Calculados**
```typescript
class Order extends BaseEntity {
    @ReadOnly() @PropertyName("Order ID") 
    id: number;
    
    @ReadOnly() @PropertyName("Created At")
    createdAt: Date = new Date();
    
    @ReadOnly() @PropertyName("Total Price")
    get totalPrice(): number {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }
}
```

Campos id, createdAt y totalPrice son siempre readonly. Usuario ve valores pero no puede modificarlos en formulario.

**Readonly Condicional - Basado en Estado**
```typescript
class Document extends BaseEntity {
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    
    @ReadOnly((doc: Document) => doc.status === 'PUBLISHED')
    @PropertyName("Title")
    title: string;
    
    @ReadOnly((doc: Document) => doc.status !== 'DRAFT')
    @PropertyName("Content")
    content: string;
}
```

Title editable solo si document es DRAFT. Content editable solo en DRAFT. Formulario dinámicamente habilita/deshabilita campos según estado.

**Readonly Condicional - Basado en Permisos**
```typescript
class User extends BaseEntity {
    @ReadOnly((user: User) => !Application.currentUser.hasPermission('EDIT_ROLES'))
    @PropertyName("Role")
    role: string;
    
    @ReadOnly((user: User) => user.id !== Application.currentUser.id)
    @PropertyName("Email")
    email: string;
}
```

Role readonly si usuario actual no tiene permiso EDIT_ROLES. Email readonly si se edita otro usuario distinto del actual.

### 10.2 Casos de Comportamiento Especial

**Readonly en Nuevo Registro vs Existente**
```typescript
class Invoice extends BaseEntity {
    @ReadOnly((inv: Invoice) => !inv.isNew())
    invoiceNumber: string;
}

// Nuevo registro
const newInvoice = new Invoice({});
console.log(newInvoice.isReadOnly('invoiceNumber')); // false (editable)

// Registro guardado
newInvoice.invoiceNumber = 'INV-2024-001';
await newInvoice.save();
console.log(newInvoice.isReadOnly('invoiceNumber')); // true (readonly)
```

Permite editar invoiceNumber al crear factura, pero lo protege después de guardado.

**Readonly Temporal Durante Procesamiento**
```typescript
class Task extends BaseEntity {
    isProcessing: boolean = false;
    
    @ReadOnly((task: Task) => task.isProcessing)
    assignedTo: string;
    
    async executeTask() {
        this.isProcessing = true;
        // assignedTo se vuelve readonly durante ejecución
        await this.performWork();
        this.isProcessing = false;
        // assignedTo vuelve a ser editable
    }
}
```

Campo dinámicamente se hace readonly mientras tarea está en progreso.

**ReadOnly con DefaultProperty**
```typescript
class AuditLog extends BaseEntity {
    @ReadOnly()
    @DefaultProperty(() => new Date())
    timestamp: Date;
    
    @ReadOnly()
    @DefaultProperty(() => Application.currentUser.email)
    user: string;
}
```

Campos se inicializan automáticamente con defaults y son readonly. Usuario ve valores pero no puede modificarlos.

### 10.3 Performance y Optimización

**Evaluación de Condition Functions**
```typescript
// MAL: Lógica compleja en condition
@ReadOnly((entity: Entity) => {
    const permissions = Application.getAllPermissions();
    const user = Application.currentUser;
    const role = user.getRoleDetails();
    return !role.permissions.includes('EDIT');
})
property: string;

// BIEN: Lógica simple delegada a Application
@ReadOnly((entity: Entity) => !Application.canEdit('Entity'))
property: string;
```

Condition functions se evalúan en cada render. Mantener lógica simple y delegar complejidad a servicios optimizados.

**Caching de Estado Readonly**
Para formularios complejos con 50+ propiedades readonly condicionales:
```typescript
private _readonlyCache: Map<string, boolean> = new Map();

public isReadOnly(propertyKey: string): boolean {
    if (this._readonlyCache.has(propertyKey)) {
        return this._readonlyCache.get(propertyKey)!;
    }
    
    const result = this._evaluateReadOnly(propertyKey);
    this._readonlyCache.set(propertyKey, result);
    return result;
}

public invalidateReadonlyCache() {
    this._readonlyCache.clear();
}
```

Invalidar cache cuando estado de entidad cambia de forma significativa (ej: status cambia).

### 10.4 Debugging y Diagnóstico

**Inspeccionar Estado Readonly**
```typescript
const entity = new MyEntity({ status: 'PUBLISHED' });

// Ver todas las propiedades readonly
const readonlyFields: string[] = [];
for (const key of entity.getKeys()) {
    if (entity.isReadOnly(key)) {
        readonlyFields.push(key);
    }
}
console.log('Readonly fields:', readonlyFields);
```

**Debuggear Condition Function**
```typescript
@ReadOnly((entity: MyEntity) => {
    const result = entity.status === 'PUBLISHED';
    console.log(`ReadOnly condition for status=${entity.status}: ${result}`);
    return result;
})
title: string;
```

**Testear Readonly Dinámico**
```typescript
test('title should be readonly when published', () => {
    const doc = new Document({ status: 'DRAFT' });
    expect(doc.isReadOnly('title')).toBe(false);
    
    doc.status = 'PUBLISHED';
    expect(doc.isReadOnly('title')).toBe(true);
});
```

### 10.5 Integración con UI Components

**FormInput Rendering**
```typescript
// FormInput.vue
<template>
    <input
        v-if="isReadOnly"
        :value="formattedValue"
        readonly
        class="readonly-field"
    />
    <input
        v-else
        v-model="value"
        class="editable-field"
    />
</template>

<script>
export default {
    computed: {
        isReadOnly() {
            return this.entity.isReadOnly(this.propertyKey);
        }
    }
}
</script>
```

**Estilos CSS Recomendados**
```css
.readonly-field {
    background-color: var(--gray-bg);
    cursor: not-allowed;
    border: 1px solid var(--gray-border);
    color: var(--gray-text);
}

input[readonly], input:disabled {
    opacity: 0.7;
}
```

### 10.6 Migraciones y Refactoring

**Agregar ReadOnly a Campo Existente**
1. Identificar campos que no deben ser editables
2. Aplicar @ReadOnly() para casos estáticos
3. Implementar condition function para casos dinámicos
4. Testear que formularios respetan readonly state
5. Verificar que backend valida valores readonly si son críticos

**Convertir Disabled a ReadOnly**
Cuando se necesita incluir valor en payload:
```typescript
// Antes
@Disabled() computedField: string;

// Después
@ReadOnly() computedField: string;
```

Verificar que backend procesa el valor incluido en payload.

**Migrar Readonly de UI a Backend**
ReadOnly de UI no es suficiente para seguridad. Backend debe validar:
```typescript
// Backend validation
if (existingRecord.status === 'PUBLISHED' && updates.title !== existingRecord.title) {
    throw new Error('Cannot modify title of published document');
}
```

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Estado de Propiedades
- Contenido: Implementación detallada de isReadOnly()
- Relevancia: Mecanismo de acceso a ReadOnly metadata

**copilot/layers/01-decorators/disabled-decorator.md**
- Relación: Decorador hermano con comportamiento similar
- Diferencia Clave: Disabled excluye de payload, ReadOnly incluye
- Guía: Cuándo usar Disabled vs ReadOnly

**copilot/layers/01-decorators/required-decorator.md**
- Interacción: Campos readonly pueden ser required
- Validación: Required validation ejecuta en campos readonly
- Caso: Campos calculados required pero no editables

**copilot/layers/01-decorators/hide-in-detail-view-decorator.md**
- Alternativa: HideInDetailView vs ReadOnly
- Diferencia: Hide oculta completamente, ReadOnly muestra pero deshabilita
- Decisión: Usar Hide si usuario no debe ver el campo

### 11.2 Componentes de UI

**copilot/layers/04-components/FormInput.md**
- Consumo: Llama entity.isReadOnly(key) para determinar renderizado
- Implementación: Aplica atributo readonly o disabled según tipo de input
- Estilo: Clases CSS para diferenciación visual

**copilot/layers/04-components/DetailViewTable.md**
- Presentación: Campos readonly como texto plano o input disabled
- Layout: Diferenciación visual entre editables y readonly

### 11.3 Código Fuente

**src/decorations/readonly_decorator.ts**
- Líneas: 1-21
- Contenido: Implementación completa del decorador
- Exports: READONLY_KEY, ReadOnlyCondition, ReadOnlyMetadata, ReadOnly

**src/entities/base_entity.ts**
- Líneas 424-437: Método isReadOnly()
- Dependencias: Importa READONLY_KEY y ReadOnlyMetadata

### 11.4 Tutoriales y Ejemplos

**copilot/tutorials/01-basic-crud.md**
- Sección: Propiedades Calculadas y Readonly
- Ejemplo: Campo id y createdAt readonly
- Patrón: Readonly estático para metadata de registro

**copilot/examples/advanced-module-example.md**
- Sección: Readonly Condicional y Estado
- Patrón: Readonly basado en status de documento
- Técnica: Deshabilitar edición de documentos publicados

### 11.5 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 4.2: Arquitectura de Metadata
- Principio: Decoradores definen comportamiento de UI
- Sección 8.1: ReadOnly como metadata de presentación

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Sistema de Decoradores de Estado
- Contexto: ReadOnly dentro del ecosistema de decoradores
- Flujo: Metadata → BaseEntity → UI Components

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Generación de Formularios
- Flujo: isReadOnly() → FormInput → HTML rendering
- Garantía: Estado readonly respetado en toda la cadena UI
