# 🔄 Flow Architecture - Arquitectura de Flujos del Sistema

**Referencias:**
- `00-CONTRACT.md` - Contrato de desarrollo
- `01-FRAMEWORK-OVERVIEW.md` - Visión general
- `layers/02-base-entity/base-entity-core.md` - BaseEntity
- `layers/03-application/application-singleton.md` - Application
- `layers/03-application/router-integration.md` - Vue Router

---

## 📐 Arquitectura General del Sistema

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (Browser)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              CAPA 5: UI Components (Vue)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ListView     │  │ DetailView   │  │ Form Inputs  │     │
│  │ (Table)      │  │ (Forms)      │  │ (Generated)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         CAPA 4: Application Singleton (Orquestador)         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • View Management                                   │    │
│  │ • Router Integration                                │    │
│  │ • Event Bus (mitt)                                  │    │
│  │ • UI Services (Modal, Toast, Confirmation)          │    │
│  │ • Module Registry                                   │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│            CAPA 3: BaseEntity (Motor CRUD)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • CRUD Operations (save, update, delete, get)       │    │
│  │ • Validation Engine (3 levels)                      │    │
│  │ • State Management (dirty state, original state)    │    │
│  │ • Lifecycle Hooks                                   │    │
│  │ • Metadata Access                                   │    │
│  │ • API Integration (axios)                           │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│        CAPA 2: Decorators (Metadata Storage)                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Stores metadata in class prototypes using Symbols   │    │
│  │ • Property metadata (name, type, order)             │    │
│  │ • Validation rules (required, sync, async)          │    │
│  │ • UI configuration (groups, CSS, hide/show)         │    │
│  │ • Module configuration (name, icon, permissions)    │    │
│  │ • API configuration (endpoint, methods, keys)       │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│          CAPA 1: Entity Definitions (TypeScript)            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  class Product extends BaseEntity {                 │    │
│  │      @PropertyName('Name', String)                  │    │
│  │      @Required(true)                                │    │
│  │      name!: string;                                 │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌊 Flujo Principal: De Entidad a UI

### Fase 1: Inicialización de la Aplicación

```
┌─────────────────────────────────────────────────────┐
│ 1. main.js ejecuta                                  │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 2. Application se inicializa (Singleton)            │
│    - AppConfiguration cargada                       │
│    - View ref creado                                │
│    - ModuleList ref creado                          │
│    - EventBus (mitt) creado                         │
│    - Axios instance configurado                     │
│    - ApplicationUIService instanciado               │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 3. Entidades se registran                           │
│    Application.ModuleList.value.push(Products)      │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 4. Router se inicializa                             │
│    - initializeRouterWithApplication(Application)   │
│    - Application.initializeRouter(router)           │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 5. Vue App se monta                                 │
│    - App.vue renderizado                            │
│    - SideBar muestra módulos registrados            │
└─────────────────────────────────────────────────────┘
```

**Código:**
```typescript
// main.js
import Application from '@/models/application'
import router, { initializeRouterWithApplication } from '@/router'

// Vincular router con Application
initializeRouterWithApplication(Application)
Application.initializeRouter(router)

const app = createApp(App)
app.use(router)
app.mount('#app')

// Navegación inicial al primer módulo
if (Application.ModuleList.value.length > 0) {
    const firstModule = Application.ModuleList.value[0]
    Application.changeViewToDefaultView(firstModule)
}
```

---

## 🎯 Flujo de Navegación: Usuario Selecciona Módulo

### Flujo Completo

```
Usuario click en Sidebar Item "Products"
    │
    ├─→ SideBarItemComponent.handleClick()
    │
    ├─→ Application.changeViewToDefaultView(Products)
    │       │
    │       ├─→ Verifica si hay cambios sin guardar
    │       │   └─→ Si hay cambios: Muestra confirmación
    │       │       └─→ Usuario cancela: ABORT
    │       │       └─→ Usuario acepta: Continúa
    │       │
    │       ├─→ Application.setViewChanges()
    │       │       ├─→ View.value.entityClass = Products
    │       │       ├─→ View.value.component = Products.getModuleDefaultComponent()
    │       │       ├─→ View.value.viewType = ViewTypes.DEFAULTVIEW
    │       │       └─→ View.value.entityObject = null
    │       │
    │       └─→ Navega con Router
    │               └─→ router.push({ name: 'ModuleList', params: { module: 'products' }})
    │
    └─→ Router Guard (beforeEach) ejecuta
            │
            ├─→ Valida que módulo existe
            │
            ├─→ Si URL != Application.View: Sincroniza
            │
            └─→ next() → Renderiza componente
```

**Código en SideBarItemComponent:**
```typescript
methods: {
    handleClick() {
        Application.changeViewToDefaultView(this.module);
    }
}
```

**Código en Application:**
```typescript
changeView = (entityClass, component, viewType, entity = null) => {
    // PASO 1: Verificar cambios sin guardar
    if (this.View.value.entityObject?.getDirtyState()) {
        this.ApplicationUIService.openConfirmationMenu(
            confMenuType.WARNING,
            'Salir sin guardar',
            '¿Estás seguro de que quieres salir sin guardar?',
            () => this.setViewChanges(entityClass, component, viewType, entity)
        );
        return;
    }
    
    // PASO 2: Aplicar cambios
    this.setViewChanges(entityClass, component, viewType, entity);
}

private setViewChanges = (entityClass, component, viewType, entity) => {
    this.View.value.entityClass = entityClass;
    this.View.value.component = component;
    this.View.value.viewType = viewType;
    this.View.value.entityObject = entity;
    
    // PASO 3: Navegar con router
    if (this.router) {
        const moduleName = entityClass.getModuleName() || entityClass.name;
        this.router.push({
            name: 'ModuleList',
            params: { module: moduleName.toLowerCase() }
        });
    }
}
```

---

## 📋 Flujo de Visualización: ListView (Tabla)

### Secuencia de Renderizado

```
1. Router activa ruta /products
    │
    └─→ ComponentContainerComponent renderiza
            │
            └─→ <component :is="Application.View.value.component" />
                    │
                    └─→ DefaultListView.vue (o custom)
                            │
                            ├─→ mounted() { Application.View.value.viewType = LISTVIEW }
                            │
                            └─→ Renderiza DetailViewTableComponent
                                    │
                                    ├─→ Lee Application.View.value.entityClass
                                    │   (Products)
                                    │
                                    ├─→ Obtiene metadatos:
                                    │   - Products.getProperties() → { id, name, price, ... }
                                    │   - Products.getCSSClasses() → { id: 'table-length-small', ... }
                                    │
                                    ├─→ Carga datos (hardcoded o API)
                                    │   - const data = await Products.getElementList()
                                    │
                                    └─→ Genera tabla:
                                        <thead>
                                            <td v-for="prop in properties">{{ prop }}</td>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in data">
                                                <td v-for="column in item.getKeys()">
                                                    {{ item.getFormattedValue(column) }}
                                                </td>
                                            </tr>
                                        </tbody>
```

**Código en DetailViewTableComponent:**
```vue
<template>
  <table>
    <thead>
      <tr>
        <td v-for="(name, key) in entityClass?.getProperties()" 
            :class="entityClass?.getCSSClasses()[key]">
          {{ name }}
        </td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data" @click="openDetailView(item)">
        <template v-for="column in item.getKeys()">
          <td v-if="!item.isHideInListView(column)">
            {{ item.getFormattedValue(column) }}
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  data() {
    return {
      entityClass: Application.View.value.entityClass,
      data: [] // Se cargaría de API
    }
  },
  methods: {
    openDetailView(entity) {
      Application.View.value.entityOid = entity.getUniquePropertyValue();
      Application.changeViewToDetailView(entity);
    }
  }
}
</script>
```

---

## 📝 Flujo de Edición: DetailView (Formulario)

### Usuario Crea Nuevo Registro

```
1. Usuario click en botón "New"
    │
    ├─→ NewButtonComponent.createNew()
    │
    ├─→ const newEntity = Products.createNewInstance()
    │       │
    │       └─→ return new Products({})  // Vacío, isNew() = true
    │
    ├─→ Application.changeViewToDetailView(newEntity)
    │       │
    │       ├─→ View.value.entityClass = Products
    │       ├─→ View.value.entityObject = newEntity
    │       ├─→ View.value.viewType = DETAILVIEW
    │       ├─→ View.value.component = Products.getModuleDetailComponent()
    │       └─→ Router.push('/products/new')
    │
    └─→ DefaultDetailView.vue renderiza
            │
            ├─→ mounted() { this.entity = Application.View.value.entityObject }
            │
            ├─→ Obtiene metadatos para cada propiedad:
            │   - entity.getKeys() → ['id', 'name', 'price', ...]
            │   - entity.getPropertyType(key)
            │   - entity.getViewGroups()
            │   - entity.isRequired(key)
            │   - etc.
            │
            └─→ Genera formulario dinámico:
                │
                ├─→ Para cada propiedad:
                │   │
                │   ├─→ Si type === Number:
                │   │   └─→ <NumberInputComponent />
                │   │
                │   ├─→ Si type === String:
                │   │   ├─→ StringType.TEXT → <TextInputComponent />
                │   │   ├─→ StringType.EMAIL → <EmailInputComponent />
                │   │   ├─→ StringType.PASSWORD → <PasswordInputComponent />
                │   │   └─→ StringType.TEXTAREA → <TextAreaComponent />
                │   │
                │   ├─→ Si type === Date:
                │   │   └─→ <DateInputComponent />
                │   │
                │   ├─→ Si type === Boolean:
                │   │   └─→ <BooleanInputComponent />
                │   │
                │   ├─→ Si type instanceof BaseEntity:
                │   │   └─→ <ObjectInputComponent />
                │   │
                │   └─→ Si type === Array:
                │       └─→ <ArrayInputComponent />
                │
                └─→ Cada input recibe:
                    - :entity="entity"
                    - :entity-class="entityClass"
                    - :property-key="key"
                    - v-model="entity[key]"
```

### Usuario Edita Registro Existente

```
1. Usuario click en fila de tabla
    │
    ├─→ DetailViewTableComponent.openDetailView(entity)
    │
    ├─→ Application.View.value.entityOid = entity.getUniquePropertyValue()
    │
    ├─→ Application.changeViewToDetailView(entity)
    │       │
    │       └─→ Router.push('/products/123')
    │
    └─→ DefaultDetailView.vue renderiza (igual que crear)
            │
            └─→ Pero entity ya tiene datos:
                entity.name = 'Widget'
                entity.price = 99.99
                entity._originalState = { name: 'Widget', price: 99.99 }
```

---

## ✅ Flujo de Validación: Multi-Nivel

### Validación en Tiempo Real (Por Input)

```
Usuario escribe en input
    │
    ├─→ @input="$emit('update:modelValue', value)"
    │
    ├─→ v-model actualiza entity[propertyKey]
    │
    └─→ Input component escucha cambios (watch)
            │
            ├─→ NIVEL 1: Validación Required
            │   │
            │   ├─→ if (metadata.required.value && !value)
            │   │   └─→ validationMessages.push('Field is required')
            │   │
            │   └─→ isInputValidated = false
            │
            ├─→ NIVEL 2: Validación Síncrona
            │   │
            │   ├─→ if (!metadata.validated.value)
            │   │   └─→ Evalúa: entity.isValidation(propertyKey)
            │   │       └─→ const meta = VALIDATION_KEY[propertyKey]
            │   │           └─→ condition(entity) → true/false
            │   │
            │   └─→ Si false: validationMessages.push(message)
            │
            └─→ NIVEL 3: Validación Asíncrona
                │
                ├─→ const isAsyncValid = await entity.isAsyncValidation(key)
                │       │
                │       └─→ const meta = ASYNC_VALIDATION_KEY[key]
                │           └─→ await meta.validation(entity) → true/false
                │
                └─→ Si false: validationMessages.push(asyncMessage)
```

**Código en TextInputComponent:**
```typescript
methods: {
    async isValidated(): Promise<boolean> {
        let validated = true;
        this.validationMessages = [];
        
        // Nivel 1: Required
        if (this.metadata.required.value && !this.modelValue) {
            validated = false;
            this.validationMessages.push(
                this.metadata.requiredMessage.value || 'Field is required'
            );
        }
        
        // Nivel 2: Sync Validation
        if (!this.metadata.validated.value) {
            validated = false;
            this.validationMessages.push(this.metadata.validatedMessage.value);
        }
        
        // Nivel 3: Async Validation
        const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
        if (!isAsyncValid) {
            validated = false;
            this.validationMessages.push(
                this.entity.asyncValidationMessage(this.propertyKey)
            );
        }
        
        return validated;
    }
}
```

### Validación Global (Botón "Validate" o "Save")

```
Usuario click "Save"
    │
    ├─→ SaveButtonComponent.saveItem()
    │
    ├─→ await entity.save()
    │       │
    │       ├─→ PASO 1: Validaciones de persistencia
    │       │   │
    │       │   ├─→ validatePersistenceConfiguration()
    │       │   │   └─→ if (!entity.isPersistent())
    │       │   │       └─→ Error: "Entity not configured for persistence"
    │       │   │
    │       │   └─→ validateApiMethod(isNew() ? 'POST' : 'PUT')
    │       │       └─→ if (!allowedMethods.includes(method))
    │       │           └─→ Error: "Method not allowed"
    │       │
    │       ├─→ PASO 2: Validación de inputs
    │       │   │
    │       │   └─→ await entity.validateInputs()
    │       │           │
    │       │           ├─→ Application.eventBus.emit('validate-inputs')
    │       │           │       │
    │       │           │       └─→ Todos los inputs escuchan y ejecutan isValidated()
    │       │           │
    │       │           ├─→ await new Promise(100ms) // Espera respuestas
    │       │           │
    │       │           └─→ if (!Application.View.value.isValid)
    │       │               └─→ return false
    │       │
    │       ├─→ PASO 3: Si todo válido, procede con guardado
    │       │
    │       └─→ (Ver flujo de guardado abajo)
```

---

## 💾 Flujo de Persistencia: Guardado en API

### save() - Operación Completa

```
await entity.save()
    │
    ├─→ 1. VALIDACIONES PREVIAS
    │   ├─→ validatePersistenceConfiguration()
    │   ├─→ validateApiMethod()
    │   └─→ await validateInputs()
    │
    ├─→ 2. PREPARACIÓN
    │   ├─→ this._isSaving = true
    │   ├─→ this.beforeSave() // Hook
    │   └─→ Application.ApplicationUIService.showLoadingMenu()
    │
    ├─→ 3. EJECUCIÓN
    │   │
    │   ├─→ this.onSaving() // Hook
    │   │
    │   ├─→ const endpoint = this.getApiEndpoint() // '/api/products'
    │   │
    │   ├─→ const dataToSend = this.mapToPersistentKeys(this.toObject())
    │   │   │
    │   │   └─→ Si tiene @PersistentKey('product_id', 'id'):
    │   │       { id: 123 } → { product_id: 123 }
    │   │
    │   ├─→ Si isNew():
    │   │   └─→ response = await axios.post(endpoint, dataToSend)
    │   │
    │   └─→ Si NO isNew():
    │       └─→ const uniqueKey = this.getUniquePropertyValue()
    │           └─→ response = await axios.put(`${endpoint}/${uniqueKey}`, dataToSend)
    │
    ├─→ 4. ACTUALIZACIÓN DE ESTADO
    │   │
    │   ├─→ const mappedData = this.mapFromPersistentKeys(response.data)
    │   │   │
    │   │   └─→ { product_id: 123 } → { id: 123 }
    │   │
    │   ├─→ Object.assign(this, mappedData)
    │   │
    │   └─→ this._originalState = structuredClone(this.toPersistentObject())
    │
    ├─→ 5. FINALIZACIÓN EXITOSA
    │   │
    │   ├─→ this._isSaving = false
    │   ├─→ this.afterSave() // Hook
    │   ├─→ Application.ApplicationUIService.hideLoadingMenu()
    │   └─→ Application.ApplicationUIService.showToast('Guardado con éxito', SUCCESS)
    │
    └─→ 6. MANEJO DE ERRORES (catch)
        │
        ├─→ this._isSaving = false
        ├─→ this.saveFailed() // Hook
        ├─→ Application.ApplicationUIService.hideLoadingMenu()
        └─→ Application.ApplicationUIService.openConfirmationMenu(ERROR, ...)
```

**Código:**
```typescript
public async save(): Promise<this> {
    // Validaciones
    if (!this.validatePersistenceConfiguration()) return this;
    if (!this.validateApiMethod(this.isNew() ? 'POST' : 'PUT')) return this;
    if (!await this.validateInputs()) return this;
    
    // Preparación
    this._isSaving = true;
    this.beforeSave();
    Application.ApplicationUIService.showLoadingMenu();
    
    try {
        // Ejecución
        this.onSaving();
        const endpoint = this.getApiEndpoint();
        const dataToSend = this.mapToPersistentKeys(this.toObject());
        
        let response;
        if (this.isNew()) {
            response = await Application.axiosInstance.post(endpoint!, dataToSend);
        } else {
            const uniqueKey = this.getUniquePropertyValue();
            response = await Application.axiosInstance.put(`${endpoint}/${uniqueKey}`, dataToSend);
        }
        
        // Actualizar estado
        const mappedData = this.mapFromPersistentKeys(response.data);
        Object.assign(this, mappedData);
        this._originalState = structuredClone(this.toPersistentObject());
        
        // Finalizar
        this._isSaving = false;
        this.afterSave();
        Application.ApplicationUIService.hideLoadingMenu();
        Application.ApplicationUIService.showToast('Guardado con éxito', ToastType.SUCCESS);
        return this;
    } catch (error: any) {
        // Error
        this._isSaving = false;
        this.saveFailed();
        Application.ApplicationUIService.hideLoadingMenu();
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Error al guardar',
            error.response?.data?.message || error.message
        );
        throw error;
    }
}
```

---

## 🔄 Flujo de Estado: Detección de Cambios

### getDirtyState() - ¿Hay cambios sin guardar?

```
Usuario modifica campo
    │
    ├─→ v-model actualiza entity[propertyKey]
    │
    └─→ entity.name = 'Modified' (ejemplo)
            │
            └─→ PERO entity._originalState.name = 'Original'

Usuario intenta salir
    │
    ├─→ Application.changeView(...)
    │
    ├─→ Verifica: entity.getDirtyState()
    │       │
    │       ├─→ const snapshotJson = JSON.stringify(this._originalState)
    │       │   // "{"name":"Original","price":99.99}"
    │       │
    │       ├─→ const actualJson = JSON.stringify(this.toPersistentObject())
    │       │   // "{"name":"Modified","price":99.99}"
    │       │
    │       └─→ return snapshotJson !== actualJson
    │           └─→ true (HAY CAMBIOS)
    │
    └─→ Muestra confirmación: "¿Salir sin guardar?"
            │
            ├─→ Usuario cancela: ABORT (se queda en formulario)
            │
            └─→ Usuario acepta: 
                └─→ entity.resetChanges() (opcional)
                    └─→ Object.assign(this, structuredClone(this._originalState))
                    └─→ Cambios se descartan, vuelve a estado original
```

---

## 🎨 Flujo de Componentes Personalizados

### Uso de @ModuleDefaultComponent

```
@ModuleDefaultComponent(CustomDashboard)
@ModuleName('Products')
export class Products extends BaseEntity { ... }

Usuario selecciona "Products" en sidebar
    │
    ├─→ Application.changeViewToDefaultView(Products)
    │
    ├─→ const component = Products.getModuleDefaultComponent()
    │       │
    │       └─→ return (this as any)[MODULE_DEFAULT_COMPONENT_KEY] || DefaultListview
    │           └─→ Retorna CustomDashboard
    │
    ├─→ View.value.component = CustomDashboard
    │
    └─→ ComponentContainerComponent renderiza
            │
            └─→ <component :is="CustomDashboard" />
                    │
                    └─→ TU COMPONENTE CUSTOM se renderiza
                        (en lugar del DefaultListview generado)
```

---

## 🌐 Flujo de Intercepción HTTP

### Request Interceptor

```
entity.save() llama axios.post('/api/products', data)
    │
    ├─→ Axios Request Interceptor se ejecuta ANTES de enviar
    │       │
    │       ├─→ const token = localStorage.getItem('auth_token')
    │       │
    │       ├─→ if (token)
    │       │   └─→ config.headers.Authorization = `Bearer ${token}`
    │       │
    │       └─→ return config (modificado)
    │
    └─→ Request se envía con header Authorization
```

### Response Interceptor

```
Servidor responde
    │
    ├─→ Axios Response Interceptor se ejecuta DESPUÉS de recibir
    │       │
    │       ├─→ if (response.status === 200)
    │       │   └─→ return response (éxito)
    │       │
    │       └─→ if (error.response.status === 401)
    │           ├─→ localStorage.removeItem('auth_token')
    │           └─→ // FUTURO: redirect to login
    │
    └─→ Response llega a entity.save()
```

---

## 🔔 Flujo de Eventos (EventBus)

### Emisión y Escucha

```
Componente A emite evento
    │
    ├─→ Application.eventBus.emit('validate-inputs')
    │
    └─→ Mitt propaga evento a todos los listeners registrados
            │
            ├─→ TextInputComponent escucha
            │   └─→ mounted() { Application.eventBus.on('validate-inputs', this.handleValidation) }
            │       └─→ this.handleValidation() ejecuta
            │
            ├─→ NumberInputComponent escucha
            │   └─→ (igual)
            │
            └─→ ... todos los inputs ejecutan su validación
```

### Limpieza de Listeners

```
Componente se desmonta
    │
    └─→ beforeUnmount() {
            Application.eventBus.off('validate-inputs', this.handleValidation)
        }
            │
            └─→ Evita memory leaks
```

---

## 📚 Referencias

- `00-CONTRACT.md` - Contrato obligatorio
- `01-FRAMEWORK-OVERVIEW.md` - Visión general
- `layers/02-base-entity/` - Métodos de BaseEntity
- `layers/03-application/` - Application y servicios
- `layers/04-components/` - Componentes UI
- `tutorials/01-basic-crud.md` - Tutorial CRUD
- `examples/classic-module-example.md` - Ejemplo completo

---

**Última actualización:** 10 de Febrero, 2026  
**Versión:** 1.0.0
