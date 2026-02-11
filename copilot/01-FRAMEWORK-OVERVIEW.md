# 🎯 Framework Overview - SaaS Vue Meta-Programming Framework

**Referencias:**
- `00-CONTRACT.md` - Contrato de desarrollo
- `02-FLOW-ARCHITECTURE.md` - Arquitectura de flujos
- `03-QUICK-START.md` - Inicio rápido
- `layers/02-base-entity/base-entity-core.md` - BaseEntity
- `layers/03-application/application-singleton.md` - Application

---

## 📘 ¿Qué es este Framework?

**SaaS Vue Meta-Programming Framework** es un sistema de generación automática de interfaces CRUD completas basado en decoradores TypeScript y Vue 3.

### Concepto Central

```
Declaras tus Entidades → El Framework Genera Todo lo Demás
```

### Filosofía

> **"Define una vez, funciona en todas partes"**

No escribes formularios, tablas ni validaciones manualmente. Declaras metadatos mediante decoradores y el sistema genera automáticamente toda la interfaz de usuario.

---

## 🏗️ Arquitectura en 5 Capas

### **Capa 1: Entidades (Declaración)**

Define tus modelos de datos como clases TypeScript:

```typescript
export class Product extends BaseEntity {
    id!: number;
    name!: string;
    price!: number;
}
```

### **Capa 2: Decoradores (Metadatos)**

Enriquece con metadatos declarativos:

```typescript
@ModuleName('Products')
@ApiEndpoint('/api/products')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    @PropertyName('Product Name', String)
    @Required(true)
    @HelpText('Enter the product display name')
    name!: string;
}
```

### **Capa 3: BaseEntity (Motor)**

Proporciona toda la lógica CRUD:

```typescript
// Automáticamente disponible:
await product.save();        // POST o PUT según isNew()
await product.delete();      // DELETE
await Product.getElementList();  // GET lista
await Product.getElement(id);    // GET individual
```

### **Capa 4: Application (Orquestador)**

Singleton global que gestiona:
- Estado de vistas actuales
- Navegación entre módulos
- Modales, toasts, confirmaciones
- Integración con Router
- Event Bus global

```typescript
Application.changeViewToDetailView(product);
Application.ApplicationUIService.showToast('Success!', ToastType.SUCCESS);
```

### **Capa 5: UI Components (Generados)**

Componentes Vue generados dinámicamente:

```vue
<!-- Se genera automáticamente según decoradores -->
<NumberInputComponent v-if="type === Number" />
<TextInputComponent v-if="type === String" />
<DateInputComponent v-if="type === Date" />
```

---

## 🔄 Flujo Completo de Trabajo

### 1️⃣ Definición

```typescript
@ModuleName('Customers')
@ApiEndpoint('/api/customers')
@Persistent()
export class Customer extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @AsyncValidation(async (entity) => {
        return await checkEmailUnique(entity.email);
    }, 'Email already exists')
    email!: string;
}
```

### 2️⃣ Registro

```typescript
// En application.ts
Application.ModuleList.value.push(Customer);
```

### 3️⃣ Navegación Automática

- Sidebar muestra módulo "Customers"
- Click → Navega a `/customers`
- Router carga vista de lista

### 4️⃣ Generación de UI

Sistema lee metadatos:
- `@PropertyName` → Label del input
- `@StringTypeDef(EMAIL)` → Input tipo email
- `@Required` → Validación + asterisco rojo
- `@AsyncValidation` → Validación contra servidor
- `@HelpText` → Texto de ayuda

Genera automáticamente:
```vue
<EmailInputComponent 
    :entity="customer"
    property-key="email"
    :required="true"
    :help-text="'Enter customer email'"
    @async-validation="validateEmailUnique" />
```

### 5️⃣ Interacción del Usuario

```
Usuario escribe email → Validación en tiempo real
Usuario click "Save" → BaseEntity.save()
  ↓
  Valida todos los campos
  ↓
  Ejecuta validaciones asíncronas
  ↓
  POST /api/customers
  ↓
  Actualiza estado interno
  ↓
  Muestra toast de éxito
  ↓
  Navega a lista actualizada
```

---

## 🎯 Ventajas Fundamentales

### ✅ Zero Boilerplate

**Sin Framework:**
```typescript
// 1. Crear formulario HTML
// 2. Crear validaciones
// 3. Manejar submit
// 4. Llamar API
// 5. Manejar errores
// 6. Actualizar UI
// Total: ~200 líneas de código
```

**Con Framework:**
```typescript
@PropertyName('Name', String)
@Required(true)
name!: string;
// Total: 3 líneas de código
// Resultado: Formulario completo funcional
```

### ✅ Type Safety Total

- TypeScript end-to-end
- Decoradores tipados
- Inferencia de tipos automática
- Errores en tiempo de compilación

### ✅ Consistencia Garantizada

- Todas las entidades siguen el mismo patrón
- UI consistente en toda la aplicación
- Validaciones uniformes
- Mensajes de error estandarizados

### ✅ DRY (Don't Repeat Yourself)

- Defines una propiedad una vez
- Funciona en: lista, detalle, formularios, validaciones, API

### ✅ Extensible sin Romper

```typescript
// Puedes usar componentes custom
@ModuleDetailComponent(CustomProductForm)

// O dejar que se genere automáticamente
// (sin decorador)
```

---

## 🧩 Componentes Principales

### **BaseEntity** (src/entities/base_entitiy.ts)

Clase base abstracta. Toda entidad debe heredar de ella.

**Proporciona:**
- Métodos CRUD (save, update, delete, getElementList, getElement)
- Sistema de validación (validateInputs, isRequired, isValidation)
- Gestión de estado (getDirtyState, resetChanges, isNew)
- Hooks de ciclo de vida (beforeSave, afterSave, onSaving, etc.)
- Acceso a metadatos (getProperties, getPropertyType, etc.)
- Sistema de persistencia (mapeo de claves API)

### **Application** (src/models/application.ts)

Singleton global (único en toda la app).

**Gestiona:**
- `View`: Vista actual (entityClass, entityObject, component, viewType)
- `ModuleList`: Lista de entidades registradas (módulos)
- `AppConfiguration`: Configuración global de la app
- `modal`, `dropdownMenu`, `confirmationMenu`: UI global
- `eventBus`: Comunicación entre componentes
- `axiosInstance`: Cliente HTTP configurado
- `ToastList`: Notificaciones toast
- `ListButtons`: Botones de acción contextuales
- `router`: Vue Router integrado

### **Decoradores** (src/decorations/*.ts)

Sistema de 35+ decoradores para metadatos:

**Categorías:**
- **Propiedad**: Define nombre, tipo, orden
- **Validación**: Required, Validation, AsyncValidation
- **UI**: ViewGroup, HelpText, HideInListView/DetailView
- **Estado**: Disabled, ReadOnly
- **Módulo**: ModuleName, ModuleIcon
- **API**: ApiEndpoint, ApiMethods, Persistent
- **Componentes**: ModuleListComponent, ModuleDetailComponent

### **Componentes UI** (src/components/)

**Formularios** (Form/):
- TextInputComponent
- NumberInputComponent
- DateInputComponent
- BooleanInputComponent
- EmailInputComponent
- PasswordInputComponent
- TextAreaComponent
- ObjectInputComponent
- ListInputComponent
- ArrayInputComponent

**Informativos** (Informative/):
- DetailViewTableComponent
- ToastContainerComponent
- FormGroupComponent

**Modales** (Modal/):
- ModalComponent
- ConfirmationDialogComponent
- LoadingPopupComponent

**Botones** (Buttons/):
- NewButtonComponent
- SaveButtonComponent
- RefreshButtonComponent
- ValidateButtonComponent
- SaveAndNewButtonComponent

**Layout**:
- SideBarComponent
- TopBarComponent
- ComponentContainerComponent

---

## 🔍 Sistema de Metadatos

### ¿Cómo Funciona?

Los decoradores almacenan información en el prototipo de la clase:

```typescript
@PropertyName('Email', String)
email!: string;

// Internamente hace:
proto[PROPERTY_NAME_KEY]['email'] = 'Email';
proto[PROPERTY_TYPE_KEY]['email'] = String;
```

### Recuperación de Metadatos

```typescript
// En BaseEntity
public static getProperties(): Record<string, string> {
    return proto[PROPERTY_NAME_KEY] || {};
}

public static getPropertyType(key: string): PropertyType {
    return proto[PROPERTY_TYPE_KEY]?.[key];
}

// Uso:
Product.getProperties(); // { id: 'ID', name: 'Name', price: 'Price' }
Product.getPropertyType('price'); // Number
```

### Metadatos por Instancia

```typescript
product.isRequired('name'); // true/false
product.isDisabled('price'); // true/false según condición
product.getFormattedValue('stock'); // Aplica @DisplayFormat
```

---

## 🌐 Integración con API

### Configuración

```typescript
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
@PersistentKey('product_id', 'id') // Server key → Client key
```

### Operaciones Automáticas

```typescript
// GET /api/products
const products = await Product.getElementList();

// GET /api/products/123
const product = await Product.getElement(123);

// POST /api/products
const newProduct = new Product({ name: 'Widget' });
await newProduct.save();

// PUT /api/products/123
product.name = 'Updated';
await product.save(); // Detecta que no es nuevo, hace PUT

// DELETE /api/products/123
await product.delete();
```

### Interceptores Axios

```typescript
// Request interceptor
- Agrega: Authorization: Bearer <token>
- Lee token de localStorage automáticamente

// Response interceptor
- Error 401 → Logout automático
- Manejo de errores centralizado
```

---

## 🎨 Sistema de Vistas

### ViewTypes

```typescript
enum ViewTypes {
    LISTVIEW = 'LISTVIEW',      // Tabla de registros
    DETAILVIEW = 'DETAILVIEW',  // Formulario de edición
    DEFAULTVIEW = 'DEFAULTVIEW' // Vista por defecto del módulo
}
```

### Navegación entre Vistas

```typescript
// Lista de productos
Application.changeViewToListView(Product);

// Editar producto
Application.changeViewToDetailView(product);

// Vista por defecto (puede ser custom)
Application.changeViewToDefaultView(Product);
```

### Cambio de Vista con Confirmación

```typescript
// Si hay cambios sin guardar:
product.name = 'Modified';
Application.changeViewToListView(Product);
// → Muestra: "¿Salir sin guardar?"
```

---

## 🎭 Sistema de Eventos

### Event Bus Global

```typescript
// Emitir eventos
Application.eventBus.emit('validate-inputs');
Application.eventBus.emit('show-modal');
Application.eventBus.emit('toggle-sidebar');

// Escuchar eventos
Application.eventBus.on('validate-inputs', handleValidation);

// Limpiar listeners
Application.eventBus.off('validate-inputs', handleValidation);
```

### Eventos Disponibles

- `validate-inputs`: Dispara validación de todos los inputs
- `show-modal` / `hide-modal`: Control de modales
- `show-confirmation` / `hide-confirmation`: Menús de confirmación
- `show-loading` / `hide-loading`: Loading screens
- `show-loading-menu` / `hide-loading-menu`: Loading popups
- `toggle-sidebar`: Toggle del sidebar

---

## 🔐 Sistema de Validación

### Tres Niveles

#### 1. Validación Required
```typescript
@Required(true)
name!: string;

// Valida: valor no vacío
```

#### 2. Validación Síncrona
```typescript
@Validation((entity) => entity.stock > 0, 'Stock must be positive')
stock!: number;

// Valida: condición custom instantánea
```

#### 3. Validación Asíncrona
```typescript
@AsyncValidation(async (entity) => {
    const response = await checkAvailability(entity.sku);
    return response.available;
}, 'SKU not available')
sku!: string;

// Valida: llamada a API/servidor
```

### Validación Condicional

```typescript
@Required(entity => entity.type === 'physical')
weight?: number;

// Required solo si type es 'physical'
```

---

## 🚀 Ciclo de Vida de Entidades

### Hooks Disponibles

```typescript
class Product extends BaseEntity {
    // SAVE
    beforeSave() { /* Se ejecuta antes de guardar */ }
    onSaving() { /* Durante el proceso de guardado */ }
    afterSave() { /* Después de guardar exitosamente */ }
    saveFailed() { /* Si falla el guardado */ }
    
    // UPDATE
    beforeUpdate() { }
    onUpdating() { }
    afterUpdate() { }
    updateFailed() { }
    
    // DELETE
    beforeDelete() { }
    onDeleting() { }
    afterDelete() { }
    deleteFailed() { }
    
    // GET
    afterGetElement() { }
    getElementFailed() { }
    afterGetElementList() { }
    getElementListFailed() { }
    
    // REFRESH
    afterRefresh() { }
    refreshFailed() { }
    
    // VALIDATION
    onValidated() { }
}
```

### Ejemplo de Uso

```typescript
class Order extends BaseEntity {
    @PropertyName('Total', Number)
    total!: number;
    
    @PropertyName('Items', ArrayOf(OrderItem))
    items!: OrderItem[];
    
    override beforeSave() {
        // Calcular total antes de guardar
        this.total = this.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
    }
    
    override afterSave() {
        // Notificar al sistema de inventario
        notifyInventorySystem(this);
    }
}
```

---

## 📦 Estructura del Proyecto

```
plantilla_saas_vue/
├── src/
│   ├── entities/          # Tus modelos de datos
│   │   ├── base_entitiy.ts
│   │   ├── products.ts
│   │   └── managers/      # (Futuro) Lógica backend
│   │
│   ├── decorations/       # Sistema de decoradores
│   │   ├── index.ts
│   │   ├── property_name_decorator.ts
│   │   ├── required_decorator.ts
│   │   └── ... (35+ decoradores)
│   │
│   ├── models/            # Modelos del framework
│   │   ├── application.ts
│   │   ├── View.ts
│   │   ├── modal.ts
│   │   └── ...
│   │
│   ├── components/        # Componentes UI
│   │   ├── Form/
│   │   ├── Buttons/
│   │   ├── Informative/
│   │   ├── Modal/
│   │   └── ...
│   │
│   ├── views/            # Vistas generadas
│   │   ├── default_listview.vue
│   │   └── default_detailview.vue
│   │
│   ├── router/           # Vue Router
│   ├── enums/            # Enumeraciones
│   ├── types/            # Tipos TypeScript
│   ├── css/              # Estilos globales
│   └── constants/        # Constantes (iconos, etc)
│
└── copilot/              # 📚 ESTA DOCUMENTACIÓN
    ├── 00-CONTRACT.md
    ├── 01-FRAMEWORK-OVERVIEW.md
    ├── 02-FLOW-ARCHITECTURE.md
    ├── layers/
    ├── tutorials/
    └── examples/
```

---

## 🎓 Curva de Aprendizaje

### Nivel 1: Básico (30 minutos)
- Entender concepto de decoradores
- Crear entidad simple
- CRUD básico

### Nivel 2: Intermedio (2 horas)
- Validaciones
- Relaciones entre entidades
- Personalizar UI con decoradores

### Nivel 3: Avanzado (1 día)
- Componentes custom
- Hooks de ciclo de vida
- Validaciones asíncronas complejas

### Nivel 4: Experto (1 semana)
- Crear decoradores propios
- Extender BaseEntity
- Arquitectura completa de aplicación

---

## 🔮 Casos de Uso Ideales

### ✅ Perfecto Para:
- Aplicaciones CRUD intensivas
- Sistemas de administración
- Backoffice de SaaS
- CRM, ERP internos
- Dashboards de gestión
- Aplicaciones con muchas entidades similares

### ⚠️ No Ideal Para:
- Landing pages
- Sitios de contenido estático
- Aplicaciones con UI muy custom sin patrones
- Juegos
- Aplicaciones de tiempo real extremo

---

## 📊 Métricas de Productividad

### Comparativa

**Desarrollo tradicional:**
- Entidad con 5 campos CRUD completo: ~4 horas
- Agregar validación a 10 campos: ~2 horas
- Cambiar tipo de input: Modificar múltiples archivos

**Con este framework:**
- Entidad con 5 campos CRUD completo: ~15 minutos
- Agregar validación a 10 campos: ~10 líneas de código
- Cambiar tipo de input: Modificar 1 decorador

### ROI (Return on Investment)

```
Inversión inicial: 2-3 días aprendiendo framework
Retorno: 60-70% reducción en tiempo de desarrollo CRUD
Break-even: ~5 entidades creadas
```

---

## 🎯 Próximos Pasos

1. **Leer**: `02-FLOW-ARCHITECTURE.md` para entender flujos
2. **Seguir**: `03-QUICK-START.md` para crear tu primera entidad
3. **Explorar**: `tutorials/` para aprender patrones
4. **Profundizar**: `layers/` para detalles técnicos

---

## 📚 Referencias Completas

- `00-CONTRACT.md` - Contrato obligatorio de desarrollo
- `02-FLOW-ARCHITECTURE.md` - Arquitectura detallada
- `03-QUICK-START.md` - Tutorial de inicio rápido
- `layers/01-decorators/` - Documentación de cada decorador
- `layers/02-base-entity/` - Especificación de BaseEntity
- `layers/03-application/` - Especificación de Application
- `layers/04-components/` - Componentes UI
- `layers/05-advanced/` - Patrones avanzados
- `tutorials/` - Guías paso a paso
- `examples/` - Ejemplos completos de módulos

---

**Última actualización:** 10 de Febrero, 2026  
**Versión del Framework:** 1.0.0
