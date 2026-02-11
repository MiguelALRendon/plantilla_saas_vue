# 🔔 Event Bus System

**Referencias:**
- `application-singleton.md` - Application.eventBus
- `router-integration.md` - Eventos de navegación
- `../02-base-entity/crud-operations.md` - CRUD emite eventos
- `../02-base-entity/validation-system.md` - Validación emite eventos
- `../02-base-entity/lifecycle-hooks.md` - Hooks pueden emitir eventos

---

## 📍 Ubicación en el Código

**Tecnología:** Mitt (Tiny Event Emitter)  
**Configuración:** `src/main.js`  
**Acceso:** `Application.eventBus`

---

## 🎯 Propósito

El **Event Bus** permite comunicación desacoplada entre componentes, servicios y entidades usando el patrón pub/sub (publish/subscribe).

**Beneficios:**
- Comunicación sin dependencias directas
- Componentes no necesitan conocer unos a otros
- Eventos del sistema automáticos (CRUD, validación)
- Custom events para lógica de negocio

**Librería:** [Mitt](https://github.com/developit/mitt) - Event emitter de 200 bytes

---

## 🏗️ Configuración

### Setup en main.js

```javascript
// src/main.js

import { createApp } from 'vue';
import mitt from 'mitt';
import Application from './models/application';

// ========================================
// Crear event bus
// ========================================
const eventBus = mitt();

// Asignar a Application
Application.eventBus = eventBus;

// ========================================
// Opcional: Logging de todos los eventos
// ========================================
if (import.meta.env.DEV) {
    eventBus.on('*', (type, event) => {
        console.log(`[Event] ${type}`, event);
    });
}

// Crear app...
const app = createApp(App);
app.mount('#app');
```

**Ubicación:** `src/main.js` (línea ~15-25)

---

## 📡 API de Mitt

### Emitir Evento

```typescript
Application.eventBus.emit(eventName: string, payload: any): void
```

### Escuchar Evento

```typescript
Application.eventBus.on(eventName: string, handler: (payload: any) => void): void
```

### Remover Listener

```typescript
Application.eventBus.off(eventName: string, handler: Function): void
```

### Escuchar Todos los Eventos

```typescript
Application.eventBus.on('*', (type: string, payload: any) => void): void
```

---

## 🎪 Eventos del Sistema

### Eventos CRUD (BaseEntity)

Automáticamente emitidos por BaseEntity:

#### 1. entity-saved

Emitido después de `save()` exitoso (crear o actualizar)

```typescript
// BaseEntity.save() emite:
Application.eventBus.emit('entity-saved', {
    entityClass: this.constructor,
    entity: this,
    isNew: wasNew  // true si era create, false si era update
});
```

**Payload:**
```typescript
{
    entityClass: typeof BaseEntity,  // Product, Customer, etc.
    entity: BaseEntity,              // Instancia guardada
    isNew: boolean                   // true = create, false = update
}
```

**Escuchar:**
```typescript
Application.eventBus.on('entity-saved', (payload) => {
    console.log(`${payload.entityClass.name} saved:`, payload.entity);
    
    if (payload.isNew) {
        console.log('New entity created');
    } else {
        console.log('Entity updated');
    }
});
```

**Ubicación en código:** `src/entities/base_entitiy.ts` (línea ~280)

---

#### 2. entity-deleted

Emitido después de `delete()` exitoso

```typescript
// BaseEntity.delete() emite:
Application.eventBus.emit('entity-deleted', {
    entityClass: this.constructor,
    entity: this,
    id: this[primaryKey]
});
```

**Payload:**
```typescript
{
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    id: any
}
```

**Escuchar:**
```typescript
Application.eventBus.on('entity-deleted', (payload) => {
    console.log(`${payload.entityClass.name} deleted:`, payload.id);
    
    // Actualizar lista si está visible
    if (currentView.entityClass === payload.entityClass) {
        refreshList();
    }
});
```

**Ubicación en código:** `src/entities/base_entitiy.ts` (línea ~350)

---

#### 3. entity-list-fetched

Emitido después de `getElementList()` exitoso

```typescript
// BaseEntity.getElementList() emite:
Application.eventBus.emit('entity-list-fetched', {
    entityClass: this,
    entities: elements,
    count: elements.length
});
```

**Payload:**
```typescript
{
    entityClass: typeof BaseEntity,
    entities: BaseEntity[],
    count: number
}
```

**Escuchar:**
```typescript
Application.eventBus.on('entity-list-fetched', (payload) => {
    console.log(`Loaded ${payload.count} ${payload.entityClass.name} entities`);
});
```

**Ubicación en código:** `src/entities/base_entitiy.ts` (línea ~410)

---

#### 4. entity-fetched

Emitido después de `getElement(id)` exitoso

```typescript
// BaseEntity.getElement() emite:
Application.eventBus.emit('entity-fetched', {
    entityClass: this,
    entity: element,
    id: id
});
```

**Payload:**
```typescript
{
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    id: any
}
```

**Escuchar:**
```typescript
Application.eventBus.on('entity-fetched', (payload) => {
    console.log(`Loaded ${payload.entityClass.name} ID ${payload.id}`);
});
```

**Ubicación en código:** `src/entities/base_entitiy.ts` (línea ~470)

---

### Eventos de Validación

#### 5. validation-started

Emitido cuando comienza validación

```typescript
// BaseEntity.validateInputs() emite:
Application.eventBus.emit('validation-started', {
    entityClass: this.constructor,
    entity: this
});
```

**Payload:**
```typescript
{
    entityClass: typeof BaseEntity,
    entity: BaseEntity
}
```

**Ubicación en código:** `src/entities/base_entitiy.ts` (línea ~520)

---

#### 6. validation-passed

Emitido cuando validación pasa sin errores

```typescript
// BaseEntity.validateInputs() emite:
Application.eventBus.emit('validation-passed', {
    entityClass: this.constructor,
    entity: this
});
```

**Payload:**
```typescript
{
    entityClass: typeof BaseEntity,
    entity: BaseEntity
}
```

**Ubicación en código:** `src/entities/base_entitiy.ts` (línea ~580)

---

#### 7. validation-failed

Emitido cuando validación falla (tiene errores)

```typescript
// BaseEntity.validateInputs() emite:
Application.eventBus.emit('validation-failed', {
    entityClass: this.constructor,
    entity: this,
    errors: this.errors  // { propertyName: errorMessage, ... }
});
```

**Payload:**
```typescript
{
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    errors: Record<string, string>
}
```

**Escuchar:**
```typescript
Application.eventBus.on('validation-failed', (payload) => {
    console.error('Validation failed:', payload.errors);
    
    // Mostrar errores al usuario
    Object.entries(payload.errors).forEach(([prop, error]) => {
        console.error(`${prop}: ${error}`);
    });
});
```

**Ubicación en código:** `src/entities/base_entitiy.ts` (línea ~600)

---

### Eventos de Navegación

#### 8. view-changed

Emitido cuando cambia la vista actual

```typescript
// Application.changeView() emite:
Application.eventBus.emit('view-changed', {
    entityClass: entityClass,
    viewType: viewType,
    previousView: previousView
});
```

**Payload:**
```typescript
{
    entityClass: typeof BaseEntity,
    viewType: ViewType,
    previousView: {
        entityClass: typeof BaseEntity,
        viewType: ViewType
    }
}
```

**Ubicación en código:** `src/models/application.ts` (línea ~120)

---

### Eventos de UI System

Eventos emitidos por ApplicationUIService para controlar elementos de interfaz:

#### 9. show-loading

Emitido para mostrar pantalla de carga completa

```typescript
// ApplicationUIService.showLoadingScreen() emite:
Application.eventBus.emit('show-loading');
```

**Payload:** `void`

**Escuchado por:** `LoadingScreenComponent`

**Ubicación:** `src/models/application_ui_service.ts` (línea 120)

---

#### 10. hide-loading

Emitido para ocultar pantalla de carga completa

```typescript
// ApplicationUIService.hideLoadingScreen() emite:
Application.eventBus.emit('hide-loading');
```

**Payload:** `void`

**Escuchado por:** `LoadingScreenComponent`

**Ubicación:** `src/models/application_ui_service.ts` (línea 124)

---

#### 11. show-modal

Emitido para mostrar modal con entidad

```typescript
// ApplicationUIService.showModal() / showModalOnFunction() emite:
Application.eventBus.emit('show-modal');
```

**Payload:** `void`

**Escuchado por:** `ModalComponent`

**Ubicación:** `src/models/application_ui_service.ts` (línea 44)

---

#### 12. hide-modal

Emitido para ocultar modal

```typescript
// ApplicationUIService.closeModal() / closeModalOnFunction() emite:
Application.eventBus.emit('hide-modal');
```

**Payload:** `void`

**Escuchado por:** `ModalComponent`

**Ubicación:** `src/models/application_ui_service.ts` (línea 51)

---

#### 13. show-confirmation

Emitido para mostrar diálogo de confirmación

```typescript
// ApplicationUIService.openConfirmationMenu() emite:
Application.eventBus.emit('show-confirmation');
```

**Payload:** `void`

**Escuchado por:** `ConfirmationDialogComponent`

**Ubicación:** `src/models/application_ui_service.ts` (línea 97)

---

#### 14. hide-confirmation

Emitido para ocultar diálogo de confirmación

```typescript
// ApplicationUIService.closeConfirmationMenu() emite:
Application.eventBus.emit('hide-confirmation');
```

**Payload:** `void`

**Escuchado por:** `ConfirmationDialogComponent`

**Ubicación:** `src/models/application_ui_service.ts` (línea 109)

---

#### 15. show-loading-menu

Emitido para mostrar loading popup para operaciones asíncronas

```typescript
// ApplicationUIService.showLoadingMenu() emite:
Application.eventBus.emit('show-loading-menu');
```

**Payload:** `void`

**Escuchado por:** `LoadingPopupComponent`

**Uso:** Operaciones rápidas como validaciones o guardado

**Ubicación:** `src/models/application_ui_service.ts` (línea 128)

---

#### 16. hide-loading-menu

Emitido para ocultar loading popup

```typescript
// ApplicationUIService.hideLoadingMenu() emite:
Application.eventBus.emit('hide-loading-menu');
```

**Payload:** `void`

**Escuchado por:** `LoadingPopupComponent`

**Ubicación:** `src/models/application_ui_service.ts` (línea 132)

---

## 🧩 Uso en Componentes Vue

### Escuchar Eventos en Component

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Application from '@/models/application';

// ========================================
// Event handlers
// ========================================

function handleEntitySaved(payload: any) {
    console.log('Entity saved:', payload);
    
    // Actualizar lista si es del mismo tipo
    if (payload.entityClass === Product) {
        refreshProductList();
    }
}

function handleEntityDeleted(payload: any) {
    console.log('Entity deleted:', payload);
    refreshProductList();
}

// ========================================
// Lifecycle
// ========================================

onMounted(() => {
    // Registrar listeners
    Application.eventBus.on('entity-saved', handleEntitySaved);
    Application.eventBus.on('entity-deleted', handleEntityDeleted);
});

onUnmounted(() => {
    // ⚠️ IMPORTANTE: Limpiar listeners
    Application.eventBus.off('entity-saved', handleEntitySaved);
    Application.eventBus.off('entity-deleted', handleEntityDeleted);
});
</script>
```

**⚠️ CRÍTICO:** Siempre limpiar listeners en `onUnmounted()` para evitar memory leaks.

---

### Emitir Custom Events

```vue
<script setup lang="ts">
import Application from '@/models/application';

function handleStockUpdate(productId: number, newStock: number) {
    // Emitir evento custom
    Application.eventBus.emit('stock-updated', {
        productId: productId,
        newStock: newStock,
        timestamp: new Date()
    });
}

function handlePriceChange(productId: number, newPrice: number) {
    Application.eventBus.emit('price-changed', {
        productId: productId,
        newPrice: newPrice,
        timestamp: new Date()
    });
}
</script>
```

---

### Escuchar Todos los Eventos (Debug)

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Application from '@/models/application';

function handleAllEvents(type: string, payload: any) {
    console.log(`[Event: ${type}]`, payload);
}

onMounted(() => {
    // Escuchar TODOS los eventos
    Application.eventBus.on('*', handleAllEvents);
});

onUnmounted(() => {
    Application.eventBus.off('*', handleAllEvents);
});
</script>
```

---

## 🧪 Ejemplos de Uso

### 1. Actualizar Lista Después de Guardar

```vue
<!-- ProductListView.vue -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Product } from '@/entities/products';
import Application from '@/models/application';

const products = ref<Product[]>([]);

async function loadProducts() {
    products.value = await Product.getElementList();
}

function handleEntitySaved(payload: any) {
    // Solo actualizar si es Product
    if (payload.entityClass === Product) {
        loadProducts();  // Recargar lista
    }
}

function handleEntityDeleted(payload: any) {
    if (payload.entityClass === Product) {
        loadProducts();  // Recargar lista
    }
}

onMounted(() => {
    loadProducts();
    
    // Escuchar cambios en productos
    Application.eventBus.on('entity-saved', handleEntitySaved);
    Application.eventBus.on('entity-deleted', handleEntityDeleted);
});

onUnmounted(() => {
    Application.eventBus.off('entity-saved', handleEntitySaved);
    Application.eventBus.off('entity-deleted', handleEntityDeleted);
});
</script>
```

---

### 2. Notificaciones de Validación

```vue
<!-- FormComponent.vue -->

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Application from '@/models/application';

function handleValidationFailed(payload: any) {
    // Mostrar toast con errores
    const errorCount = Object.keys(payload.errors).length;
    
    Application.showToast(
        `Validation failed: ${errorCount} error(s)`,
        'error',
        5000
    );
    
    // Log errores individuales
    Object.entries(payload.errors).forEach(([prop, error]) => {
        console.error(`${prop}: ${error}`);
    });
}

function handleValidationPassed(payload: any) {
    Application.showToast('Validation passed!', 'success', 2000);
}

onMounted(() => {
    Application.eventBus.on('validation-failed', handleValidationFailed);
    Application.eventBus.on('validation-passed', handleValidationPassed);
});

onUnmounted(() => {
    Application.eventBus.off('validation-failed', handleValidationFailed);
    Application.eventBus.off('validation-passed', handleValidationPassed);
});
</script>
```

---

### 3. Sincronización entre Componentes

```vue
<!-- StockMonitor.vue -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Application from '@/models/application';

const lowStockProducts = ref<number[]>([]);

function handleStockUpdated(payload: any) {
    const { productId, newStock } = payload;
    
    if (newStock < 10) {
        // Agregar a lista de bajo stock
        if (!lowStockProducts.value.includes(productId)) {
            lowStockProducts.value.push(productId);
        }
        
        // Mostrar alerta
        Application.showToast(
            `Low stock alert: Product ${productId}`,
            'warning',
            5000
        );
    } else {
        // Remover de lista de bajo stock
        const index = lowStockProducts.value.indexOf(productId);
        if (index > -1) {
            lowStockProducts.value.splice(index, 1);
        }
    }
}

onMounted(() => {
    Application.eventBus.on('stock-updated', handleStockUpdated);
});

onUnmounted(() => {
    Application.eventBus.off('stock-updated', handleStockUpdated);
});
</script>
```

---

### 4. Analytics Tracking

```typescript
// src/services/analytics.ts

import Application from '@/models/application';

export class AnalyticsService {
    static init() {
        // Track all CRUD operations
        Application.eventBus.on('entity-saved', this.trackSave);
        Application.eventBus.on('entity-deleted', this.trackDelete);
        Application.eventBus.on('entity-list-fetched', this.trackListView);
        Application.eventBus.on('entity-fetched', this.trackDetailView);
    }
    
    static trackSave(payload: any) {
        console.log('[Analytics] Entity saved:', {
            type: payload.entityClass.name,
            isNew: payload.isNew,
            timestamp: new Date()
        });
        
        // Enviar a analytics backend
        // gtag('event', 'entity_save', {...});
    }
    
    static trackDelete(payload: any) {
        console.log('[Analytics] Entity deleted:', {
            type: payload.entityClass.name,
            id: payload.id,
            timestamp: new Date()
        });
    }
    
    static trackListView(payload: any) {
        console.log('[Analytics] List viewed:', {
            type: payload.entityClass.name,
            count: payload.count,
            timestamp: new Date()
        });
    }
    
    static trackDetailView(payload: any) {
        console.log('[Analytics] Detail viewed:', {
            type: payload.entityClass.name,
            id: payload.id,
            timestamp: new Date()
        });
    }
}

// Inicializar en main.js
// AnalyticsService.init();
```

---

### 5. Cache Invalidation

```typescript
// src/services/cache.ts

import Application from '@/models/application';

export class CacheService {
    private static cache: Map<string, any> = new Map();
    
    static init() {
        // Invalidar cache cuando se guardan/borran entidades
        Application.eventBus.on('entity-saved', this.invalidateEntityCache);
        Application.eventBus.on('entity-deleted', this.invalidateEntityCache);
    }
    
    static getCacheKey(entityClass: typeof BaseEntity, id?: any): string {
        const name = entityClass.name;
        return id ? `${name}:${id}` : `${name}:list`;
    }
    
    static get(key: string): any {
        return this.cache.get(key);
    }
    
    static set(key: string, value: any, ttl: number = 60000): void {
        this.cache.set(key, value);
        
        // Auto-expire después de ttl
        setTimeout(() => {
            this.cache.delete(key);
        }, ttl);
    }
    
    static invalidateEntityCache(payload: any) {
        const entityClass = payload.entityClass;
        
        // Invalida lista
        const listKey = CacheService.getCacheKey(entityClass);
        CacheService.cache.delete(listKey);
        
        // Invalidar detalle si existe ID
        if (payload.entity) {
            const primaryKey = entityClass.getPrimaryProperty();
            const id = payload.entity[primaryKey];
            const detailKey = CacheService.getCacheKey(entityClass, id);
            CacheService.cache.delete(detailKey);
        }
        
        console.log('[Cache] Invalidated:', entityClass.name);
    }
}

// Inicializar en main.js
// CacheService.init();
```

---

### 6. WebSocket Sync

```typescript
// src/services/websocket.ts

import Application from '@/models/application';

export class WebSocketService {
    private static ws: WebSocket | null = null;
    
    static connect(url: string) {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
            console.log('[WebSocket] Connected');
            this.setupEventListeners();
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerEvent(data);
        };
    }
    
    static setupEventListeners() {
        // Enviar eventos locales al servidor
        Application.eventBus.on('entity-saved', (payload) => {
            this.sendToServer('entity-saved', payload);
        });
        
        Application.eventBus.on('entity-deleted', (payload) => {
            this.sendToServer('entity-deleted', payload);
        });
    }
    
    static sendToServer(type: string, payload: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: type,
                payload: payload,
                timestamp: new Date()
            }));
        }
    }
    
    static handleServerEvent(data: any) {
        // Recibir eventos del servidor y emitirlos localmente
        console.log('[WebSocket] Received:', data.type);
        
        // Emitir evento con sufijo :remote para distinguir
        Application.eventBus.emit(`${data.type}:remote`, data.payload);
    }
}

// Inicializar en main.js
// WebSocketService.connect('ws://localhost:3000');
```

---

## ⚠️ Consideraciones Importantes

### 1. Siempre Limpiar Listeners

```typescript
// ✅ CORRECTO: Cleanup
onMounted(() => {
    Application.eventBus.on('my-event', handler);
});

onUnmounted(() => {
    Application.eventBus.off('my-event', handler);  // ← Importante
});

// ❌ INCORRECTO: No cleanup (memory leak)
onMounted(() => {
    Application.eventBus.on('my-event', handler);
});
// ← Falta cleanup
```

### 2. Usar Funciones Nombradas

```typescript
// ✅ CORRECTO: Función nombrada (se puede remover)
function handler(payload) {
    console.log(payload);
}

Application.eventBus.on('event', handler);
Application.eventBus.off('event', handler);  // ✓ Funciona

// ❌ INCORRECTO: Arrow function inline (no se puede remover)
Application.eventBus.on('event', (payload) => {
    console.log(payload);
});

Application.eventBus.off('event', ???);  // ← No hay referencia
```

### 3. Event Names Consistentes

```typescript
// ✅ CORRECTO: Usar constantes
const EVENT_PRODUCT_SAVED = 'product-saved';
Application.eventBus.emit(EVENT_PRODUCT_SAVED, payload);
Application.eventBus.on(EVENT_PRODUCT_SAVED, handler);

// ❌ INCORRECTO: Strings hardcodeados (typos)
Application.eventBus.emit('product-saved', payload);
Application.eventBus.on('product-save', handler);  // ← Typo
```

### 4. Payload Type Safety

```typescript
// ✅ CORRECTO: Tipos para payloads
interface EntitySavedPayload {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    isNew: boolean;
}

Application.eventBus.on('entity-saved', (payload: EntitySavedPayload) => {
    // payload tiene tipos
    console.log(payload.isNew);
});
```

### 5. Evitar Ciclos de Eventos

```typescript
// ❌ PELIGRO: Ciclo infinito
Application.eventBus.on('entity-saved', (payload) => {
    // Guardar otra entidad...
    anotherEntity.save();  // ← Emite 'entity-saved' otra vez
    // → Ciclo infinito
});

// ✅ MEJOR: Verificar antes de actuar
Application.eventBus.on('entity-saved', (payload) => {
    if (payload.entityClass === Product) {
        // Solo para productos...
    }
});
```

---

## 📚 Referencias Adicionales

- `application-singleton.md` - Application.eventBus configuración
- `../02-base-entity/crud-operations.md` - save(), delete() emiten eventos
- `../02-base-entity/validation-system.md` - validateInputs() emite eventos
- `../02-base-entity/lifecycle-hooks.md` - Hooks pueden emitir custom events
- `../../02-FLOW-ARCHITECTURE.md` - Event flow diagrams
- [Mitt Documentation](https://github.com/developit/mitt)

---

**Última actualización:** 10 de Febrero, 2026  
**Librería:** Mitt 3.0.1  
**Archivo config:** `src/main.js` (línea ~15-25)  
**Archivo acceso:** `src/models/application.ts`
