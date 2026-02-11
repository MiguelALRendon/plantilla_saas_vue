# 🎛️ Application Singleton

**Referencias:**
- `router-integration.md` - Integración con Vue Router
- `event-bus.md` - Sistema de eventos
- `ui-services.md` - Servicios de UI
- `../02-base-entity/crud-operations.md` - CRUD usa Application

---

## 📍 Ubicación en el Código

**Archivo:** `src/models/application.ts`

---

## 🎯 Propósito

**Application** es el **singleton central** que gestiona el estado global de la aplicación, coordina servicios, mantiene referencias a componentes core (router, axios, event bus), y orquesta la navegación y estado de vistas.

**Patrón:** Singleton + Service Locator  
**Responsabilidades:**
- Gestión de estado global
- Registro de módulos (entidades)
- Navegación entre vistas
- Servicios compartidos (axios, router, eventBus)
- Configuración de la aplicación
- Gestión de modales y toasts

---

## 📊 Estructura de Application

### Propiedades Principales

```typescript
export default class Application {
    // Estado de vista actual
    public static View: Ref<View> = ref(new View());
    
    // Lista de módulos registrados
    public static ModuleList: Ref<Array<typeof BaseEntity>> = ref([]);
    
    // Configuración de la app
    public static AppConfiguration: AppConfiguration = new AppConfiguration();
    
    // Router de Vue
    public static router: Router;
    
    // Instancia de Axios
    public static axiosInstance: AxiosInstance;
    
    // Event bus (Mitt)
    public static eventBus: Emitter<any>;
    
    // Modal actual
    public static modal: Ref<Modal | null> = ref(null);
    
    // Contexto UI
    public static uiContext: ApplicationUIContext = new ApplicationUIContext();
    
    // Servicio UI
    public static uiService: ApplicationUIService = new ApplicationUIService();
    
    // Usuario actual (opcional)
    public static currentUser?: User;
}
```

**Ubicación:** `src/models/application.ts` (línea ~15-60)

---

## 🔧 Configuración Inicial

### En main.js

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import mitt from 'mitt';
import Application from './models/application';

// Importar entidades
import { Product } from './entities/products';
import { Customer } from './entities/customer';
import { Order } from './entities/order';

// ========================================
// 1. Configurar Application
// ========================================

// Router
Application.router = router;

// Axios instance
Application.axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Event bus
Application.eventBus = mitt();

// Configuración de la app
Application.AppConfiguration.appName = 'My SaaS App';
Application.AppConfiguration.locale = 'en-US';
Application.AppConfiguration.currency = 'USD';

// ========================================
// 2. Registrar módulos
// ========================================
Application.ModuleList.value.push(Product, Customer, Order);

// ========================================
// 3. Crear app Vue
// ========================================
const app = createApp(App);
app.use(router);
app.mount('#app');
```

**Ubicación:** `src/main.js`

---

## 🎯 Métodos Principales

### 1. ModuleList - Registro de Módulos

#### Propiedad

```typescript
public static ModuleList: Ref<Array<typeof BaseEntity>> = ref([]);
```

#### Descripción

Array reactivo que contiene todas las entidades registradas como módulos. Los módulos registrados aparecen en el menú lateral y están disponibles para navegación.

#### Uso - Registrar Módulos

```typescript
// Definir entidad
@ModuleName('Products')
@ModuleIcon('box')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    name!: string;
}

// Registrar en Application (en src/models/application.ts)
Application.ModuleList.value.push(Product);

// Registrar múltiples módulos
Application.ModuleList.value.push(Product, Customer, Order);

// Ahora:
// - Aparece "Products" en menú lateral
// - Rutas /products (lista) y /products/:oid (detalle) disponibles
// - Application.ModuleList.value incluye Product
```

#### Verificación de Módulos Registrados

```typescript
// Verificar si un módulo está registrado
const isRegistered = Application.ModuleList.value.includes(Product);

// Obtener todos los módulos
const allModules = Application.ModuleList.value;

// Iterar módulos
Application.ModuleList.value.forEach(moduleClass => {
    console.log(moduleClass.getModuleName());
});
```

**Ubicación:** `src/models/application.ts` (línea ~63)

**Nota Importante:** Los módulos se agregan directamente al array usando `.push()`. El framework lee este array para generar el menú lateral automáticamente.

---

### 2. changeView() - Cambiar Vista

#### Firma

```typescript
public static changeView(
    entityClass: typeof BaseEntity,
    viewType: ViewType,
    entityId?: any
): void
```

#### Descripción

Cambia la vista actual a una vista específica de una entidad (lista o detalle).

#### Parámetros

- `entityClass`: Clase de la entidad (Product, Customer, etc.)
- `viewType`: Tipo de vista (`ViewType.LIST` o `ViewType.DETAIL`)
- `entityId`: ID del registro (solo para DetailView)

#### Uso

```typescript
// Ir a lista de productos
Application.changeView(Product, ViewType.LIST);
// → Navega a /products (ListView)

// Ir a detalle de producto ID 42
Application.changeView(Product, ViewType.DETAIL, 42);
// → Navega a /products/42 (DetailView)
// → Carga Product.getElement(42)

// Crear nuevo producto
Application.changeView(Product, ViewType.DETAIL);
// → Navega a /products/new (DetailView)
// → Crea new Product()
```

#### Flujo Interno

```
1. changeView(Product, DETAIL, 42)
        ↓
2. Actualiza Application.View:
   - View.entityClass = Product
   - View.viewType = DETAIL
   - View.entity = null (temporalmente)
        ↓
3. Router.push('/products/42')
        ↓
4. DetailView component monta
        ↓
5. DetailView lee Application.View
        ↓
6. DetailView carga entity:
   - entity = await Product.getElement(42)
   - Application.View.entity = entity
        ↓
7. Renderiza formulario con datos cargados
```

#### Código Interno

```typescript
public static changeView(
    entityClass: typeof BaseEntity,
    viewType: ViewType,
    entityId?: any
): void {
    // Actualizar estado de View
    this.View.value = new View();
    this.View.value.entityClass = entityClass;
    this.View.value.viewType = viewType;
    
    // Construir ruta
    const moduleName = entityClass.getModuleName().plural.toLowerCase();
    let path = `/${moduleName}`;
    
    if (viewType === ViewType.DETAIL) {
        path += entityId ? `/${entityId}` : '/new';
    }
    
    // Navegar
    this.router.push(path);
}
```

**Ubicación:** `src/models/application.ts` (línea ~110)

---

### 3. changeViewToListView() - Cambiar a Lista

#### Firma

```typescript
public static changeViewToListView(entityClass: typeof BaseEntity): void
```

#### Descripción

Atajo para cambiar a ListView de una entidad.

#### Uso

```typescript
Application.changeViewToListView(Product);
// Equivalente a:
// Application.changeView(Product, ViewType.LIST);

// → Navega a /products
// → ListView muestra todos los productos
```

**Ubicación:** `src/models/application.ts` (línea ~145)

---

### 4. changeViewToDetailView() - Cambiar a Detalle

#### Firma

```typescript
public static changeViewToDetailView(
    entityClass: typeof BaseEntity,
    entityId?: any
): void
```

#### Descripción

Atajo para cambiar a DetailView de una entidad.

#### Uso

```typescript
// Ver/editar existente
Application.changeViewToDetailView(Product, 42);
// Equivalente a:
// Application.changeView(Product, ViewType.DETAIL, 42);

// Crear nuevo
Application.changeViewToDetailView(Product);
// Equivalente a:
// Application.changeView(Product, ViewType.DETAIL);
```

**Ubicación:** `src/models/application.ts` (línea ~150)

---

### 5. showToast() - Mostrar Notificación

#### Firma

```typescript
public static showToast(
    message: string,
    type: ToastType = ToastType.INFO,
    duration: number = 3000
): void
```

#### Descripción

Muestra una notificación toast al usuario.

#### Parámetros

- `message`: Texto del mensaje
- `type`: Tipo (`success`, `error`, `warning`, `info`)
- `duration`: Duración en ms (default: 3000)

#### Uso

```typescript
// Success
Application.showToast('Product saved successfully!', ToastType.SUCCESS);

// Error
Application.showToast('Failed to save product', ToastType.ERROR);

// Warning
Application.showToast('Stock is low', ToastType.WARNING);

// Info (default)
Application.showToast('Loading data...');
```

#### Código Interno

```typescript
public static showToast(
    message: string,
    type: ToastType = ToastType.INFO,
    duration: number = 3000
): void {
    const toast: Toast = {
        id: Date.now(),
        message: message,
        type: type,
        duration: duration,
        visible: true
    };
    
    // Agregar a lista de toasts
    this.uiContext.toasts.push(toast);
    
    // Auto-ocultar después de duration
    setTimeout(() => {
        toast.visible = false;
        
        // Remover después de animación (300ms)
        setTimeout(() => {
            const index = this.uiContext.toasts.indexOf(toast);
            if (index > -1) {
                this.uiContext.toasts.splice(index, 1);
            }
        }, 300);
    }, duration);
}
```

**Ubicación:** `src/models/application.ts` (línea ~170)

---

### 6. showModal() - Mostrar Modal

#### Firma

```typescript
public static showModal(modal: Modal): void
```

#### Descripción

Muestra un modal (diálogo) al usuario.

#### Uso

```typescript
// Modal de confirmación
Application.showModal({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this product?',
    type: 'warning',
    buttons: [
        {
            label: 'Cancel',
            action: () => Application.closeModal()
        },
        {
            label: 'Delete',
            action: async () => {
                await product.delete();
                Application.closeModal();
            },
            primary: true
        }
    ]
});

// Modal con componente custom
Application.showModal({
    title: 'Product Details',
    component: ProductDetailComponent,
    props: { productId: 42 },
    width: '800px'
});
```

#### Código Interno

```typescript
public static showModal(modal: Modal): void {
    this.modal.value = modal;
}

public static closeModal(): void {
    this.modal.value = null;
}
```

**Ubicación:** `src/models/application.ts` (línea ~210)

---

### 7. setButtonList() - Actualizar Lista de Botones

#### Firma

```typescript
setButtonList(): void
```

#### Descripción

Actualiza `Application.ListButtons` según el `viewType` actual y si la entidad es persistente. Este método determina qué botones de acción se muestran en la barra de herramientas superior.

#### Ubicación

`src/models/application.ts` (línea 233)

#### Comportamiento

```
LISTVIEW:
    → [New, Refresh]

DETAILVIEW + Persistent:
    → [New, Refresh, Validate, Save, SaveAndNew, SendToDevice]

DETAILVIEW + Non-Persistent:
    → [New, Refresh, Validate, SendToDevice]

Default:
    → []
```

#### Uso

```typescript
// Llamado automáticamente por changeView()
Application.changeViewToListView(Product);
// → setButtonList() ejecuta
// → ListButtons.value = [NewButtonComponent, RefreshButtonComponent]

Application.changeViewToDetailView(Order, 42);
// → setButtonList() ejecuta  
// → Si Order.isPersistent() === true:
//   ListButtons.value = [New, Refresh, Validate, Save, SaveAndNew, SendToDevice]
```

#### Código Interno

```typescript
setButtonList() {
    const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;
    
    switch (this.View.value.viewType) {
        case ViewTypes.LISTVIEW:
            this.ListButtons.value = [
                markRaw(NewButtonComponent),
                markRaw(RefreshButtonComponent)
            ];
            break;
            
        case ViewTypes.DETAILVIEW:
            if (isPersistentEntity) {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SaveButtonComponent),
                    markRaw(SaveAndNewButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            } else {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            }
            break;
            
        default:
            this.ListButtons.value = [];
    }
}
```

#### Uso en TopBar

```vue
<!-- TopBarComponent.vue -->
<template>
    <div class="top-bar">
        <h1>{{ Application.View.value.moduleName }}</h1>
        
        <div class="button-list">
            <component
                v-for="(button, index) in Application.ListButtons.value"
                :key="index"
                :is="button"
            />
        </div>
    </div>
</template>
```

#### Ejemplo de Entidad No Persistente

```typescript
@ModuleName('Report', 'Reports')
// Sin @Persistent() ni @ApiEndpoint()
export class Report extends BaseEntity {
    @PropertyName('Report Type', String)
    type!: string;
    
    @PropertyName('Date Range', String)
    dateRange!: string;
    
    // No es persistente → no puede save/delete
    override isPersistent(): boolean {
        return false;
    }
}

// Al abrir DetailView de Report:
Application.changeViewToDetailView(Report);
// → setButtonList() detecta isPersistent() === false
// → Botones: [New, Refresh, Validate, SendToDevice]
// → NO incluye: Save, SaveAndNew (porque no puede guardar)
```

---

## 🎯 Propiedades Reactivas

### View (Ref\<View\>)

Estado de la vista actual:

```typescript
Application.View.value = {
    entityClass: Product,      // Entidad actual
    viewType: ViewType.DETAIL, // DETAIL o LIST
    entity: productInstance,   // Instancia cargada (o null)
    isLoading: false,          // Cargando datos?
    errors: []                 // Errores de carga
}
```

**Uso en componentes:**

```vue
<template>
  <div>
    <h1>{{ Application.View.value.entityClass.getModuleNameSingular() }}</h1>
    
    <div v-if="Application.View.value.isLoading">Loading...</div>
    
    <component :is="getCurrentViewComponent()" />
  </div>
</template>

<script setup>
import Application from '@/models/application';
import { computed } from 'vue';

const getCurrentViewComponent = computed(() => {
    const viewType = Application.View.value.viewType;
    return viewType === ViewType.LIST ? 'ListView' : 'DetailView';
});
</script>
```

---

### ModuleList (Ref<Array<typeof BaseEntity>>)

Lista de módulos registrados:

```typescript
Application.ModuleList.value = [
    Product,
    Customer,
    Order,
    // ...
]
```

**Uso en SideBar:**

```vue
<template>
  <div class="sidebar">
    <div
      v-for="entityClass in Application.ModuleList.value"
      :key="entityClass.name"
      class="sidebar-item"
      @click="navigateToModule(entityClass)"
    >
      <span class="icon">{{ entityClass.getModuleIcon() }}</span>
      <span class="name">{{ entityClass.getModuleNamePlural() }}</span>
    </div>
  </div>
</template>

<script setup>
import Application from '@/models/application';
import { ViewType } from '@/enums/view_type';

function navigateToModule(entityClass) {
    Application.changeView(entityClass, ViewType.LIST);
}
</script>
```

**Ubicación:** `src/components/SideBarComponent.vue`

---

## 🔌 Integración con Axios

### axiosInstance (AxiosInstance)

**Propósito:** Instancia configurada de Axios para realizar peticiones HTTP a la API.

**Tipo:** `AxiosInstance`

**Ubicación:** `src/models/application.ts` (línea 91)

#### Configuración Inicial

```typescript
// Constructor de Application
this.axiosInstance = axios.create({
    baseURL: this.AppConfiguration.value.apiBaseUrl,
    timeout: this.AppConfiguration.value.apiTimeout,
    headers: {
        'Content-Type': 'application/json',
    }
});
```

#### Interceptores Preconfigurados

**Request Interceptor (línea 98):**
- Añade automáticamente token de autenticación desde localStorage
- Header: `Authorization: Bearer <token>`

```typescript
this.axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(
            this.AppConfiguration.value.authTokenKey
        );
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```

**Response Interceptor (línea 108):**
- Maneja errores 401 (Unauthorized)
- Elimina token inválido del localStorage

```typescript
this.axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Sesión expirada → limpiar token
            localStorage.removeItem(
                this.AppConfiguration.value.authTokenKey
            );
        }
        return Promise.reject(error);
    }
);
```

#### Uso en BaseEntity

```typescript
// BaseEntity.save() usa axiosInstance
public async save(): Promise<this> {
    const endpoint = this.getApiEndpoint();
    const method = this.id ? 'PUT' : 'POST';
    const url = this.id ? `${endpoint}/${this.id}` : endpoint;
    
    try {
        const response = await Application.axiosInstance.request({
            method,
            url,
            data: this.toDictionary()
        });
        
        // Actualizar entidad con respuesta
        Object.assign(this, response.data);
        
        return this;
    } catch (error) {
        // Manejar error
        console.error(error);
        throw error;
    }
}
```

#### Uso Directo en Código Custom

```typescript
// Petición GET
const response = await Application.axiosInstance.get('/api/products');
console.log(response.data);  // Array de productos

// Petición POST
const newProduct = await Application.axiosInstance.post('/api/products', {
    product_name: 'Widget',
    product_price: 19.99
});

// Petición PUT
const updated = await Application.axiosInstance.put('/api/products/42', {
    product_name: 'Updated Widget'
});

// Petición DELETE
await Application.axiosInstance.delete('/api/products/42');
```

#### Modificar Configuración en Runtime

```typescript
// Cambiar baseURL
Application.axiosInstance.defaults.baseURL = 'https://api.newserver.com';

// Cambiar timeout
Application.axiosInstance.defaults.timeout = 30000;  // 30 segundos

// Añadir header global
Application.axiosInstance.defaults.headers.common['X-Custom-Header'] = 'value';

// Remover header
delete Application.axiosInstance.defaults.headers.common['X-Custom-Header'];
```

#### Interceptores Adicionales

```typescript
// Request interceptor custom (agregar timestamp)
Application.axiosInstance.interceptors.request.use((config) => {
    config.headers['X-Request-Time'] = new Date().toISOString();
    return config;
});

// Response interceptor custom (logging)
Application.axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(`[API ERROR] ${error.config.method?.toUpperCase()} ${error.config.url}`, error);
        return Promise.reject(error);
    }
);
```

---

### Configurar Interceptors (Ejemplo Avanzado)

```typescript
// En main.js, después de crear axiosInstance

// Request interceptor (agregar auth token)
Application.axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor (manejar errores globales)
Application.axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized → redirigir a login
            Application.showToast('Session expired, please login', 'error');
            Application.router.push('/login');
        } else if (error.response?.status === 500) {
            // Server error
            Application.showToast('Server error, please try again later', 'error');
        }
        return Promise.reject(error);
    }
);
```

---

## 🔌 Integración con Event Bus

### Emitir Eventos

```typescript
// BaseEntity.save() emite evento
Application.eventBus.emit('entity-saved', {
    entityClass: this.constructor,
    entity: this
});
```

### Escuchar Eventos

```typescript
// En componente Vue
import { onMounted, onUnmounted } from 'vue';
import Application from '@/models/application';

onMounted(() => {
    // Escuchar evento 'entity-saved'
    Application.eventBus.on('entity-saved', handleEntitySaved);
});

onUnmounted(() => {
    // Limpiar listener
    Application.eventBus.off('entity-saved', handleEntitySaved);
});

function handleEntitySaved(payload) {
    console.log('Entity saved:', payload.entityClass.name, payload.entity);
    
    // Actualizar lista si es necesario
    if (payload.entityClass === Product) {
        refreshProductList();
    }
}
```

### Eventos del Sistema

```typescript
// Eventos emitidos automáticamente por BaseEntity:
'entity-saved'          // Después de save()
'entity-deleted'        // Después de delete()
'validation-failed'     // Si validateInputs() falla
'validation-passed'     // Si validateInputs() pasa
'entity-list-fetched'   // Después de getElementList()
'entity-fetched'        // Después de getElement()
```

---

## 🎨 AppConfiguration

### Configuración de la Aplicación

```typescript
export class AppConfiguration {
    // Nombre de la app
    appName: string = 'My SaaS App';
    
    // Idioma
    locale: string = 'en-US';
    
    // Moneda
    currency: string = 'USD';
    
    // Zona horaria
    timezone: string = 'UTC';
    
    // Formato de fecha
    dateFormat: string = 'MM/DD/YYYY';
    
    // Tema
    theme: 'light' | 'dark' = 'light';
    
    // Features habilitadas
    features: {
        multiLanguage: boolean;
        darkMode: boolean;
        notifications: boolean;
    } = {
        multiLanguage: false,
        darkMode: true,
        notifications: true
    };
}
```

**Uso:**

```typescript
// Configurar en main.js
Application.AppConfiguration.appName = 'Inventory Management System';
Application.AppConfiguration.locale = 'es-ES';
Application.AppConfiguration.currency = 'EUR';
Application.AppConfiguration.theme = 'dark';

// Usar en componentes
const appName = Application.AppConfiguration.appName;
const locale = Application.AppConfiguration.locale;
```

---

## 🧪 Ejemplos de Uso

### 1. Navegación Programática

```typescript
// Desde cualquier lugar de la app

// Ir a lista de productos
Application.changeViewToListView(Product);

// Ir a crear nuevo producto
Application.changeViewToDetailView(Product);

// Ir a editar producto 42
Application.changeViewToDetailView(Product, 42);

// Ir a lista de clientes
Application.changeViewToListView(Customer);
```

### 2. Notificaciones

```typescript
// Success
await product.save();
Application.showToast('Product saved!', ToastType.SUCCESS);

// Error
try {
    await product.save();
} catch (error) {
    Application.showToast('Save failed: ' + error.message, ToastType.ERROR);
}

// Warning
if (product.stock < 10) {
    Application.showToast('Low stock alert', ToastType.WARNING);
}

// Info
Application.showToast('Loading products...', ToastType.INFO, 5000);
```

### 3. Confirmación con Modal

```typescript
async function deleteProduct(product: Product) {
    Application.showModal({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${product.name}"?`,
        type: 'warning',
        buttons: [
            {
                label: 'Cancel',
                action: () => Application.closeModal()
            },
            {
                label: 'Delete',
                action: async () => {
                    const deleted = await product.delete();
                    
                    if (deleted) {
                        Application.closeModal();
                        Application.changeViewToListView(Product);
                    }
                },
                primary: true,
                dangerous: true
            }
        ]
    });
}
```

### 4. Event Bus para Comunicación

```typescript
// Componente A: Emite evento
Application.eventBus.emit('stock-updated', {
    productId: 42,
    newStock: 150
});

// Componente B: Escucha evento
Application.eventBus.on('stock-updated', (payload) => {
    console.log(`Product ${payload.productId} stock: ${payload.newStock}`);
    refreshProductList();
});
```

### 5. Axios con Auth

```typescript
// Configurar header global
Application.axiosInstance.defaults.headers.common['Authorization'] = 
    `Bearer ${userToken}`;

// Hacer request
const response = await Application.axiosInstance.get('/api/protected-resource');

// Request con headers custom
const response = await Application.axiosInstance.post(
    '/api/orders',
    orderData,
    {
        headers: {
            'X-Custom-Header': 'value'
        }
    }
);
```

---

## ⚠️ Consideraciones Importantes

### 1. Application es Singleton

```typescript
// ✅ CORRECTO: Usar como singleton
Application.showToast('Hello');

// ❌ INCORRECTO: No instanciar
const app = new Application();  // ← No hacer esto
```

### 2. Configurar Antes de Crear App Vue

```typescript
// ✅ CORRECTO: Orden correcto
Application.initializeRouter(router);
Application.axiosInstance = axios.create({...});
Application.ModuleList.value.push(Product);

const app = createApp(App);
app.use(router);
app.mount('#app');

// ❌ INCORRECTO: Configurar después de mount
const app = createApp(App);
app.mount('#app');

Application.ModuleList.value.push(Product);  // ← Demasiado tarde (el menú ya se renderizó)
```

### 3. ModuleList es Reactivo

```typescript
// En componentes Vue, usar .value
Application.ModuleList.value.forEach(entityClass => {
    console.log(entityClass.name);
});

// En código no reactivo, también usar .value
const moduleCount = Application.ModuleList.value.length;
```

### 4. Event Bus Requiere Cleanup

```typescript
// ✅ CORRECTO: Limpiar listeners
onMounted(() => {
    Application.eventBus.on('my-event', handler);
});

onUnmounted(() => {
    Application.eventBus.off('my-event', handler);  // ← Importante
});

// ❌ INCORRECTO: No limpiar (memory leak)
onMounted(() => {
    Application.eventBus.on('my-event', handler);
});
// ← Falta cleanup
```

---

## 📚 Referencias Adicionales

- `router-integration.md` - Rutas automáticas
- `event-bus.md` - Sistema de eventos completo
- `ui-services.md` - Servicios de UI (toasts, modals)
- `../02-base-entity/crud-operations.md` - BaseEntity usa Application
- `../../02-FLOW-ARCHITECTURE.md` - Arquitectura completa
- `../../tutorials/01-basic-crud.md` - Uso de Application en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/models/application.ts`  
**Líneas totales:** ~280
