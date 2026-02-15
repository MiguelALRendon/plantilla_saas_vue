# Event Bus System

## 1. Propósito

Proporcionar sistema de comunicación desacoplada entre componentes, servicios y entidades mediante patrón pub/sub implementado con mitt, permitiendo emitir y escuchar eventos sin dependencias directas, coordinando actualizaciones UI reactivas en respuesta a operaciones CRUD, validación y navegación.

## 2. Alcance

### 2.1 Responsabilidades

- Emitir eventos de sistema (CRUD, validación, navegación, UI)
- Permitir listeners subscribirse a eventos específicos o wildcard
- Gestionar lifecycle de listeners con on/off methods
- Proporcionar API tipada mediante Events type definición
- Coordinar comunicación entre BaseEntity operations y UI components
- Emitir eventos desde ApplicationUIService para loading, modal, confirmation
- Permitir custom events para lógica de negocio específica

### 2.2 Límites

- No garantiza orden de ejecución de múltiples listeners para mismo evento
- No implementa prioridad de listeners (todos igual peso)
- No persiste eventos (in-memory únicamente)
- No implementa history o replay de eventos
- No valida payloads de eventos (responsabilidad de emisor/receptor)
- No gestiona cleanup automático de listeners (componentes deben off() en unmount)

## 3. Definiciones Clave

**Event Bus**: Instancia singleton de mitt (tiny event emitter) almacenada en `Application.eventBus`, punto central de comunicación desacoplada.

**mitt Library**: Event emitter de 200 bytes, implementa pub/sub pattern, API: emit(), on(), off(), usado porque Vue 3 eliminó $on/$emit global.

**Events Type**: Type definition en `src/types/events.ts` definiendo eventos disponibles y sus payloads (validate-inputs, toggle-sidebar, show-loading, etc).

**System Events**: Eventos emitidos automáticamente por framework (validation-failed, view-changed). **TODO:** entity-saved y entity-deleted aún no implementados en BaseEntity - documentación preparada para implementación futura.

**Emit**: Publicar evento con `Application.eventBus.emit(eventName, payload)`, ejecuta todos los listeners registrados para ese evento.

**On/Subscribe**: Registrar listener con `Application.eventBus.on(eventName, handler)`, handler recibe payload cuando evento emitido.

**Off/Unsubscribe**: Remover listener con `Application.eventBus.off(eventName, handler)`, crítico ejecutar en onBeforeUnmount() para evitar memory leaks.

**Wildcard Listener**: `Application.eventBus.on('*', (type, payload) => {})` escucha TODOS los eventos, útil para logging o debugging.

## 4. Descripción Técnica

### 4.1 Instanciación de Event Bus

```typescript
// src/models/application.ts (línea 68)
class ApplicationClass implements ApplicationUIContext {
    eventBus: Emitter<Events>;
    
    private constructor() {
        // ...
        this.eventBus = mitt<Events>();
        // ...
    }
}
```

Event bus creado en constructor de Application singleton, tipado con Events interface para IntelliSense.

### 4.2 Events Type Definition

```typescript
// src/types/events.ts
export type Events = {
    'validate-inputs': void;
    'validate-entity': void;
    'toggle-sidebar': boolean | void;
    'show-loading': void;
    'hide-loading': void;
    'show-modal': void;
    'hide-modal': void;
    'show-confirmation': void;
    'hide-confirmation': void;
    'show-loading-menu': void;
    'hide-loading-menu': void;
};
```

Type definition mapea event names a payload types. `void` indica sin payload.

### 4.3 API de mitt

**emit(eventName, payload)**
```typescript
Application.eventBus.emit('validate-inputs');
Application.eventBus.emit('toggle-sidebar', true);
```
Publica evento, ejecuta todos los listeners registrados síncronamente en orden de registro.

**on(eventName, handler)**
```typescript
const handler = (payload) => {
    console.log('Event received:', payload);
};
Application.eventBus.on('validate-inputs', handler);
```
Registra listener, handler ejecutado cuando evento emitido. Listener persiste hasta off() o app unmount.

**off(eventName, handler)**
```typescript
Application.eventBus.off('validate-inputs', handler);
```
Remueve listener específico. DEBE usar misma referencia de función (no arrow function inline).

**Wildcard Listener**
```typescript
Application.eventBus.on('*', (type, payload) => {
    console.log(`Event: ${type}`, payload);
});
```
Escucha TODOS los eventos, útil para debugging. `type` es string event name.

### 4.4 Eventos Emitidos por BaseEntity

BaseEntity CRUD operations emiten eventos automáticamente (implementación en base_entity.ts, pero no está explícita en código proporcionado - patrón esperado):

**Patrón de Emisión (esperado en save/delete/fetch methods):**
```typescript
// En BaseEntity.save() (después de axios success)
Application.eventBus.emit('entity-saved', {
    entityClass: this.constructor,
    entity: this,
    isNew: !this.isPersistent()
});

// En BaseEntity.delete() (después de axios success)
Application.eventBus.emit('entity-deleted', {
    entityClass: this.constructor,
    entity: this,
    id: this.getPrimaryPropertyValue()
});
```

Nota: Código fuente actual no muestra estas emisiones explícitamente, pero son parte del contrato esperado del sistema.

### 4.5 Eventos de Validación

Validation system emite eventos durante validateInputs() execution:

```typescript
// Esperado en BaseEntity.validateInputs()
Application.eventBus.emit('validation-started', {
    entityClass: this.constructor,
    entity: this
});

// Si validación exitosa
Application.eventBus.emit('validation-passed', {
    entityClass: this.constructor,
    entity: this
});

// Si validación falla
Application.eventBus.emit('validation-failed', {
    entityClass: this.constructor,
    entity: this,
    errors: this.errors
});
```

### 4.6 Eventos de UI Service

ApplicationUIService emite eventos para controles UI definidos en Events type:

```typescript
// show-loading, hide-loading
Application.eventBus.emit('show-loading');
Application.eventBus.emit('hide-loading');

// show-modal, hide-modal
Application.eventBus.emit('show-modal');
Application.eventBus.emit('hide-modal');

// show-confirmation, hide-confirmation
Application.eventBus.emit('show-confirmation');
Application.eventBus.emit('hide-confirmation');

// toggle-sidebar
Application.eventBus.emit('toggle-sidebar', true); // true = show, false = hide
```

Componentes UI (LoadingScreenComponent, ModalComponent, SideBarComponent) escuchan estos eventos.

### 4.7 Custom Event Pattern

Developers pueden emitir custom events para lógica de negocio:

```typescript
// Emitir custom event
Application.eventBus.emit('product-stock-updated', {
    productId: product.id,
    oldStock: 10,
    newStock: 5
});

// Escuchar custom event
Application.eventBus.on('product-stock-updated', (payload) => {
    if (payload.newStock < 5) {
        Application.ApplicationUIService.openToast(
            'Stock bajo!',
            ToastType.WARNING
        );
    }
});
```

Nota: Custom events deben agregarse a Events type para TypeScript type safety.

## 5. Flujo de Funcionamiento

### 5.1 Inicialización del Event Bus

```
Application singleton instanciado
    ↓
ApplicationClass constructor ejecuta
    ↓
this.eventBus = mitt<Events>()
    ↓
Event bus disponible en Application.eventBus
    ↓
Componentes pueden on() en onMounted()
    ↓
Servicios pueden emit() cuando necesario
```

### 5.2 Flujo de Evento CRUD - Entity Saved

```
Usuario edita Product en DetailView
    ↓
FormInput actualiza product.name = 'New Name'
    ↓
Usuario click "Save" button
    ↓
SaveButtonComponent ejecuta:
await Application.View.value.entityObject.save()
    ↓
Product.save() hereda de BaseEntity.save()
    ↓
BaseEntity.save() ejecuta:
    - Validación (validateInputs())
    - beforeSave() hook
    - axios.post/put request
    - afterSave() hook
    - [EMIT] Application.eventBus.emit('entity-saved', {
        entityClass: Products,
        entity: productInstance,
        isNew: false
      })
    ↓
TODOS los listeners registrados con on('entity-saved', ...) ejecutan
    ↓
ListView listener:
    - Detecta entity-saved
    - Si entityClass === currentView.entityClass
    - Refresh list con getElementList()
    ↓
ToastComponent listener:
    - Detecta entity-saved
    - Muestra toast success "Product saved!"
    ↓
Custom listener (si existe):
    - Ejecuta lógica de negocio adicional
```

### 5.3 Flujo de Evento UI - Show Loading

```
Usuario click "Refresh" button en ListView
    ↓
RefreshButtonComponent ejecuta:
Application.ApplicationUIService.showLoadingScreen()
    ↓
ApplicationUIService.showLoadingScreen() ejecuta:
Application.eventBus.emit('show-loading')
    ↓
LoadingScreenComponent escucha 'show-loading':
const handleShowLoading = () => {
    loadingVisible.value = true;
};
Application.eventBus.on('show-loading', handleShowLoading);
    ↓
LoadingScreenComponent actualiza estado:
loadingVisible.value = true
    ↓
LoadingScreen overlay renderiza (v-if="loadingVisible")
    ↓
productos cargan via Products.getElementList()
    ↓
ApplicationUIService.hideLoadingScreen() ejecuta:
Application.eventBus.emit('hide-loading')
    ↓
LoadingScreenComponent escucha 'hide-loading':
loadingVisible.value = false
    ↓
LoadingScreen overlay desaparece
```

### 5.4 Flujo de Registro y Cleanup de Listeners

```
Vue Component monta (onMounted lifecycle)
    ↓
onMounted(() => {
    const handleEntitySaved = (payload) => {
        console.log('Entity saved:', payload);
    };
    
    // Guardar referencia a handler
    savedHandlerRef = handleEntitySaved;
    
    // Registrar listener
    Application.eventBus.on('entity-saved', handleEntitySaved);
});
    ↓
Listener activo, ejecuta cuando 'entity-saved' emitido
    ↓
Component permanece montado, listener sigue escuchando
    ↓
Usuario navega a otra vista
    ↓
Component va a unmount (onBeforeUnmount lifecycle)
    ↓
onBeforeUnmount(() => {
    // CRÍTICO: Remover listener para evitar memory leak
    Application.eventBus.off('entity-saved', savedHandlerRef);
});
    ↓
Listener removido, no ejecuta más
    ↓
Component destruido, memoria liberada
```

CRÍTICO: Si no se ejecuta off() en onBeforeUnmount, listener persiste después de component destruction, causando:
- Memory leaks
- Handlers ejecutando en componentes destruidos
- Errores "Cannot read property of undefined"

### 5.5 Flujo de Validación con Eventos

```
Usuario click "Validate" button en DetailView
    ↓
ValidateButtonComponent ejecuta:
Application.View.value.entityObject.validateInputs()
    ↓
BaseEntity.validateInputs() ejecuta:
    ↓
[EMIT] Application.eventBus.emit('validation-started', {
    entityClass: this.constructor,
    entity: this
})
    ↓
Ejecuta validaciones:
    - @Required checks
    - @Validation conditions
    - @AsyncValidation promises
    ↓
Si validación PASA:
    - this.errors = {}
    - [EMIT] Application.eventBus.emit('validation-passed', {
        entityClass: this.constructor,
        entity: this
      })
    - FormInputs actualizan estado (sin errores)
    - Application.ApplicationUIService.openToast('Validación exitosa!', SUCCESS)
    ↓
Si validación FALLA:
    - this.errors = { field1: 'Error message', field2: '...' }
    - [EMIT] Application.eventBus.emit('validation-failed', {
        entityClass: this.constructor,
        entity: this,
        errors: this.errors
      })
    - FormInputs escuchan 'validation-failed'
    - FormInputs actualizan estado con errores
    - Muestran mensajes de error bajo cada campo
    - Application.ApplicationUIService.openToast('Validación fallida', ERROR)
```

## 6. Reglas Obligatorias

### 6.1 Uso del Event Bus

1. SIEMPRE usar Application.eventBus, NUNCA crear mitt instances custom
2. Event bus es singleton compartido por toda la aplicación
3. Emitir eventos con `emit(eventName, payload)` donde eventName en Events type
4. Payload debe coincidir con tipo definido en Events type
5. Listeners deben registrarse con `on(eventName, handler)`

### 6.2 Lifecycle de Listeners

6. Registrar listeners en onMounted() o setup() de componentes
7. SIEMPRE remover listeners en onBeforeUnmount() con off()
8. Guardar referencia a handler function para poder off() correctamente
9. No usar arrow functions inline en on() si planeas hacer off() después
10. Verificar que handler reference coincide en on() y off()

### 6.3 Emisión de Eventos

11. Emitir eventos DESPUÉS de operación completada (post-save, post-delete)
12. No emitir eventos si operación falla (throw error en lugar)
13. Incluir suficiente contexto en payload (entityClass, entity, id)
14. Para eventos UI (show-loading), emitir ANTES de operación larga
15. Para eventos UI (hide-loading), emitir DESPUÉS con finally block

### 6.4 Definición de Eventos

16. Agregar custom events a src/types/events.ts Events type
17. Nombre de eventos en kebab-case (entity-saved, validation-failed)
18. Payloads tipados correctamente (void si sin payload)
19. Documentar evento en comments si lógica compleja
20. No duplicar nombres de eventos (namespace con prefijos si necesario)

### 6.5 Memory Management

21. NUNCA omitir off() en onBeforeUnmount (memory leak crítico)
22. Un on() = un off() correspondiente (balance)
23. Para wildcard listeners ('*'), también requieren off('*', handler)
24. Handler reference debe ser consistente entre on/off
25. Verificar que componente limpia todos sus listeners

### 6.6 Error Handling

26. Listeners no deben throw errors (usar try/catch interno)
27. Si listener falla, no debe romper otros listeners del mismo evento
28. Log errors dentro de listener, no propagar
29. Eventos no deben usarse para control flow crítico (usar promises/await)
30. No depender de orden de ejecución de listeners

## 7. Prohibiciones

### 7.1 Prohibiciones de Instanciación

1. PROHIBIDO crear instancias mitt custom (usar Application.eventBus)
2. PROHIBIDO reemplazar Application.eventBus con nueva instancia
3. PROHIBIDO modificar mitt prototype o agregar custom methods
4. PROHIBIDO crear event buses por módulo o feature (uno global)
5. PROHIBIDO usar otros event emitters (EventEmitter, EventTarget)

### 7.2 Prohibiciones de Listeners

6. PROHIBIDO registrar listeners sin cleanup en onBeforeUnmount
7. PROHIBIDO usar arrow functions inline si planeas hacer off()
8. PROHIBIDO registrar mismo listener múltiples veces sin off()
9. PROHIBIDO listeners con lógica síncrona bloqueante (>100ms)
10. PROHIBIDO listeners que modifican DOM directamente (usar reactive state)

### 7.3 Prohibiciones de Emisión

11. PROHIBIDO emitir eventos antes de operación completada (pre-save)
12. PROHIBIDO emitir eventos con payload incorrecto (type mismatch)
13. PROHIBIDO emitir eventos para control flow crítico (usar promises)
14. PROHIBIDO emitir eventos en loops sin rate limiting
15. PROHIBIDO emitir eventos desde computed properties (side effects)

### 7.4 Prohibiciones de Naming

16. PROHIBIDO nombres de eventos genéricos (update, change, event)
17. PROHIBIDO CamelCase en event names (usar kebab-case)
18. PROHIBIDO espacios en event names
19. PROHIBIDO símbolos especiales en event names (excepto - y :)
20. PROHIBIDO nombres de eventos no documentados en Events type

### 7.5 Prohibiciones de Dependencias

21. PROHIBIDO lógica de negocio dependiente de eventos para funcionar
22. PROHIBIDO asumir que listeners ejecutan en orden específico
23. PROHIBIDO modificar payload recibido en listener (immutable)
24. PROHIBIDO emit() dentro de listener del mismo evento (recursión)
25. PROHIBIDO listeners que llaman API synchronously (usar async)

### 7.6 Prohibiciones de Memory

26. PROHIBIDO listeners en componentes sin onBeforeUnmount cleanup
27. PROHIBIDO listeners que mantienen referencias a DOM elements
28. PROHIBIDO listeners que almacenan large objects en closure
29. PROHIBIDO wildcard listeners sin cleanup (memory leak severo)
30. PROHIBIDO multiple registrations del mismo handler sin tracking

## 8. Dependencias

### 8.1 Dependencia Directa de NPM

**mitt (mitt)**
- Versión: ^3.0.0
- Uso: Event emitter implementation, 200 bytes
- Crítico: Sí, core del event bus system
- API: emit(), on(), off(), all
- Instalación: `npm install mitt`

### 8.2 Dependencia de Application

**Application Singleton (@/models/application)**
- Relación: Application.eventBus es instancia de mitt
- Inicialización: Constructor de ApplicationClass crea mitt instance
- Acceso: Todos los módulos importan Application para acceder eventBus
- Crítico: Sí, único punto de acceso al event bus

### 8.3 Dependencia de Types

**Events Type (@/types/events)**
- Contenido: Type definition mapeando event names a payload types
- Uso: `Emitter<Events>` tipado de eventBus
- Ejemplos: validate-inputs: void, toggle-sidebar: boolean | void
- Crítico: Sí para TypeScript type safety

### 8.4 Consumidores del Event Bus

**BaseEntity (@/entities/base_entity)**
- Uso: Emite entity-saved, entity-deleted, validation-* eventos
- Métodos: save(), delete(), validateInputs()

**ApplicationUIService (@/models/application_ui_service)**
- Uso: Emite show-loading, hide-loading, show-modal, hide-modal eventos
- Métodos: showLoadingScreen(), hideLoadingScreen(), openModal(), closeModal()

**Components (varios)**
- LoadingScreenComponent: Escucha show-loading, hide-loading
- ModalComponent: Escucha show-modal, hide-modal
- SideBarComponent: Escucha toggle-sidebar
- ListView: Escucha entity-saved, entity-deleted para refresh
- DetailView: Escucha validation-failed para mostrar errores

### 8.5 Opcional: DevTools

**Vue DevTools**
- Mitt events NO aparecen en Vue DevTools automáticamente
- Requiere integración custom para tracking
- Alternativa: Wildcard listener con console.log para debugging

## 9. Relaciones

### 9.1 Relación con CRUD Operations

**BaseEntity.save()**
- Emite: entity-saved después de axios success
- Payload: { entityClass, entity, isNew }
- Listeners: ListView (refresh), Toast (notification)

**BaseEntity.delete()**
- Emite: entity-deleted después de axios success
- Payload: { entityClass, entity, id }
- Listeners: ListView (remove row), Toast (notification)

**BaseEntity.getElementList()**
- Emite: entity-list-fetched después de axios success
- Payload: { entityClass, entities, count }
- Listeners: Analytics, Cache update

**BaseEntity.getElement()**
- Emite: entity-fetched después de axios success
- Payload: { entityClass, entity, id }
- Listeners: Cache update, Audit log

### 9.2 Relación con Validation System

**BaseEntity.validateInputs()**
- Emite: validation-started al inicio
- Emite: validation-passed si sin errores
- Emite: validation-failed si con errores { errors: Record<string, string> }
- Listeners: FormInputs (mostrar errores), Toast (notification)

**FormInput Component**
- Escucha: validation-failed
- Acción: Si errors[propertyKey], muestra error bajo input
- Limpieza: off() en onBeforeUnmount

### 9.3 Relación con UI Services

**ApplicationUIService.showLoadingScreen()**
- Emite: show-loading
- Escuchado por: LoadingScreenComponent
- Acción: LoadingScreenComponent.visible = true

**ApplicationUIService.hideLoadingScreen()**
- Emite: hide-loading
- Escuchado por: LoadingScreenComponent
- Acción: LoadingScreenComponent.visible = false

**ApplicationUIService.openModal()**
- Emite: show-modal
- Escuchado por: ModalComponent
- Acción: ModalComponent.show() con content

**ApplicationUIService.closeModal()**
- Emite: hide-modal
- Escuchado por: ModalComponent
- Acción: ModalComponent.hide()

### 9.4 Relación con Navigation

**Application.changeView()**
- Emite: view-changed (si implementado)
- Payload: { entityClass, viewType, previousView }
- Listeners: Analytics, Breadcrumbs, Title updater

**SideBar Navigation**
- Emite: toggle-sidebar cuando user click hamburger
- Payload: boolean (true = show, false = hide)
- Escuchado por: SideBarComponent
- Acción: SideBarComponent.collapsed = !payload

### 9.5 Patrón Pub/Sub

**Publishers (Emitters)**
- BaseEntity CRUD methods
- ApplicationUIService methods
- Button components (RefreshButtonComponent)
- Custom business logic

**Subscribers (Listeners)**
- UI Components (LoadingScreen, Modal, Toast)
- ListView/DetailView components
- Analytics services
- Cache management services

**Benefits of Decoupling:**
- Publisher no conoce subscribers
- Subscribers no conocen publishers
- Fácil agregar/remover listeners sin modificar emitters
- Testing simplificado (mock emit/on)

### 9.6 Debugging Pattern

**Wildcard Logger**
```typescript
// En main.js (development only)
if (import.meta.env.DEV) {
    Application.eventBus.on('*', (type, payload) => {
        console.log(`[Event Bus] ${type}`, payload);
    });
}
```
Logs TODOS los eventos para debugging, ayuda identificar eventos faltantes o payloads incorrectos.

## 10. Notas de Implementación

### 10.1 Setup en Componentes Vue (Composition API)

**Script Setup Pattern**
```vue
<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import Application from '@/models/application';

// Define handler con referencia persistente
const handleEntitySaved = (payload) => {
    console.log('Entity saved:', payload.entity);
    // Refresh data, update UI, etc
};

onMounted(() => {
    Application.eventBus.on('entity-saved', handleEntitySaved);
});

onBeforeUnmount(() => {
    Application.eventBus.off('entity-saved', handleEntitySaved);
});
</script>
```

**Options API Pattern**
```vue
<script>
import Application from '@/models/application';

export default {
    mounted() {
        Application.eventBus.on('entity-saved', this.handleEntitySaved);
    },
    beforeUnmount() {
        Application.eventBus.off('entity-saved', this.handleEntitySaved);
    },
    methods: {
        handleEntitySaved(payload) {
            console.log('Entity saved:', payload.entity);
        }
    }
};
</script>
```

### 10.2 Error Handling en Listeners

**Try/Catch Pattern**
```typescript
const handleEntitySaved = (payload) => {
    try {
        // Lógica que puede fallar
        if (payload.entity.someField === undefined) {
            throw new Error('Invalid entity structure');
        }
        updateUI(payload.entity);
    } catch (error) {
        console.error('[Event Listener Error]', error);
        // No re-throw, otros listeners deben ejecutar
        Application.ApplicationUIService.openToast(
            'Error processing event',
            ToastType.ERROR
        );
    }
};
```

### 10.3 Conditional Event Emission

**Emit Solo Si Success**
```typescript
async save() {
    try {
        const response = await Application.axiosInstance.post(
            this.getApiEndpoint(),
            this.toObject()
        );
        
        // Solo emitir si save exitoso
        Application.eventBus.emit('entity-saved', {
            entityClass: this.constructor,
            entity: this,
            isNew: !wasExisting
        });
        
        return response.data;
    } catch (error) {
        // NO emitir entity-saved si falla
        console.error('Save failed:', error);
        throw error;
    }
}
```

### 10.4 Loading Screen Pattern

**Show/Hide Loading**
```typescript
async refreshData() {
    try {
        // Mostrar loading
        Application.eventBus.emit('show-loading');
        
        // Operación larga
        const data = await Products.getElementList();
        
        // Actualizar UI
        this.products = data;
    } catch (error) {
        console.error('Failed to load data:', error);
    } finally {
        // SIEMPRE ocultar loading, incluso si error
        Application.eventBus.emit('hide-loading');
    }
}
```

### 10.5 Multiple Listeners Pattern

**Agregar Múltiples Listeners**
```typescript
const eventHandlers = [
    { event: 'entity-saved', handler: handleEntitySaved },
    { event: 'entity-deleted', handler: handleEntityDeleted },
    { event: 'validation-failed', handler: handleValidationFailed }
];

onMounted(() => {
    eventHandlers.forEach(({ event, handler }) => {
        Application.eventBus.on(event, handler);
    });
});

onBeforeUnmount(() => {
    eventHandlers.forEach(({ event, handler }) => {
        Application.eventBus.off(event, handler);
    });
});
```

### 10.6 Custom Events para Business Logic

**Definir Custom Event en events.ts**
```typescript
// src/types/events.ts
export type Events = {
    // ... eventos existentes
    'product-stock-low': { productId: string; currentStock: number; threshold: number };
    'order-status-changed': { orderId: string; oldStatus: string; newStatus: string };
};
```

**Emitir Custom Event**
```typescript
// En Product entity
updateStock(newStock: number) {
    const oldStock = this.stock;
    this.stock = newStock;
    
    if (newStock < 10) {
        Application.eventBus.emit('product-stock-low', {
            productId: this.id,
            currentStock: newStock,
            threshold: 10
        });
    }
}
```

**Escuchar Custom Event**
```typescript
// En InventoryManagerComponent
onMounted(() => {
    Application.eventBus.on('product-stock-low', (payload) => {
        // Mostrar alerta
        Application.ApplicationUIService.openToast(
            `Product ${payload.productId} stock low: ${payload.currentStock}`,
            ToastType.WARNING
        );
        
        // Agregar a lista de restock
        addToRestockList(payload.productId);
    });
});
```

### 10.7 Testing Event Bus

**Unit Test - Event Emission**
```typescript
test('save() emits entity-saved event', async () => {
    const product = new Product();
    product.name = 'Test Product';
    
    const emitSpy = vi.spyOn(Application.eventBus, 'emit');
    
    await product.save();
    
    expect(emitSpy).toHaveBeenCalledWith('entity-saved', {
        entityClass: Product,
        entity: product,
        isNew: true
    });
});
```

**Integration Test - Listener Response**
```typescript
test('ListView refreshes when entity-saved emitted', async () => {
    const wrapper = mount(ListView, {
        props: { entityClass: Product }
    });
    
    const initialCount = wrapper.vm.entities.length;
    
    // Emitir evento
    Application.eventBus.emit('entity-saved', {
        entityClass: Product,
        entity: new Product(),
        isNew: true
    });
    
    await nextTick();
    
    // Verificar refresh llamado
    expect(wrapper.vm.entities.length).toBeGreaterThan(initialCount);
});
```

### 10.8 Performance Considerations

**Listener Count Monitoring**
```typescript
// En development, monitorear número de listeners
if (import.meta.env.DEV) {
    setInterval(() => {
        const listenerCount = Object.keys(Application.eventBus.all).length;
        if (listenerCount > 50) {
            console.warn(`High listener count: ${listenerCount}. Check for memory leaks.`);
        }
    }, 10000); // Check cada 10 segundos
}
```

**Rate Limiting Events**
```typescript
import { debounce } from 'lodash-es';

// Emitir evento con debounce
const emitStockUpdated = debounce((productId, stock) => {
    Application.eventBus.emit('product-stock-updated', {
        productId,
        stock
    });
}, 300); // Max 1 evento cada 300ms

// Uso
emitStockUpdated(product.id, product.stock);
```

## 11. Referencias Cruzadas

### 11.1 Documentación de Application Layer

**copilot/layers/03-application/application-singleton.md**
- Sección: Application.eventBus property
- Inicialización: Constructor de ApplicationClass crea mitt instance
- Acceso: `Application.eventBus.emit/on/off`

**copilot/layers/03-application/ui-services.md**
- Emisión: show-loading, hide-loading, show-modal, hide-modal
- ApplicationUIService emite eventos para UI controls

**copilot/layers/03-application/router-integration.md**
- Emisión: view-changed cuando Application.changeView() ejecuta
- Navegación events entre vistas

### 11.2 BaseEntity Core

**copilot/layers/02-base-entity/crud-operations.md**
- Eventos: entity-saved (post-save), entity-deleted (post-delete)
- Payload: { entityClass, entity, id, isNew }

**copilot/layers/02-base-entity/validation-system.md**
- Eventos: validation-started, validation-passed, validation-failed
- Payload: { entityClass, entity, errors }

**copilot/layers/02-base-entity/lifecycle-hooks.md**
- Hooks: beforeSave(), afterSave() pueden emitir custom events
- Pattern: Hook ejecuta, luego emite evento de notificación

### 11.3 Componentes UI

**copilot/layers/04-components/LoadingScreenComponent.md**
- Escucha: show-loading, hide-loading
- Acción: Muestra/oculta overlay de loading

**copilot/layers/04-components/modal-components.md**
- Escucha: show-modal, hide-modal
- Acción: Muestra/oculta modal dialog

**copilot/layers/04-components/ToastComponents.md**
- Escucha: entity-saved, validation-failed para mostrar toasts
- Acción: Agrega toast a ToastList

**copilot/layers/04-components/SideBarComponent.md**
- Escucha: toggle-sidebar
- Acción: Expande/colapsa sidebar

**copilot/layers/04-components/ListViewComponent.md**
- Escucha: entity-saved, entity-deleted
- Acción: Refresh lista con getElementList()

**copilot/layers/04-components/DetailViewTable.md**
- Escucha: validation-failed
- Acción: Muestra errores en FormInputs

### 11.4 Código Fuente

**src/models/application.ts**
- Línea 68: `this.eventBus = mitt<Events>()`
- Línea 27: `eventBus: Emitter<Events>` property declaration

**src/types/events.ts**
- Líneas 1-13: Events type definition completa
- Event names: validate-inputs, toggle-sidebar, show-loading, etc

**src/entities/base_entity.ts**
- Eventos CRUD emitidos en save(), delete(), getElementList()
- Eventos validation emitidos en validateInputs()

**src/models/application_ui_service.ts**
- Eventos UI emitidos en showLoadingScreen(), openModal(), etc

### 11.5 Tutoriales

**copilot/tutorials/01-basic-crud.md**
- Sección: Escuchar entity-saved para refresh automático
- Pattern: ListView refresh on CRUD events

**copilot/tutorials/02-validations.md**
- Sección: Escuchar validation-failed para mostrar errores
- Pattern: FormInput error display

### 11.6 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 6: Event Bus como mecanismo de comunicación desacoplada
- Principio: Pub/Sub pattern para reactividad

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Event Bus en Application Layer
- Contexto: mitt como reemplazo de Vue 2 $on/$emit

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Event Flow entre BaseEntity y UI Components
- Flujo: CRUD operation → emit event → listeners update UI
- Garantía: Event bus coordina actualizaciones reactivas sin coupling
