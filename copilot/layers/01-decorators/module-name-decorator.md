# 📦 ModuleName Decorator

**Referencias:**
- `module-icon-decorator.md` - ModuleIcon
- `module-permission-decorator.md` - ModulePermission
- `property-name-decorator.md` - PropertyName
- `../03-application/router-integration.md` - Rutas automáticas

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/module_name_decorator.ts`

---

## 🎯 Propósito

Define el **nombre del módulo** para una entidad, determinando cómo aparece en el menú lateral, encabezados de vistas, y rutas. Es el decorador de clase más fundamental para registrar una entidad como módulo navegable en la aplicación.

**Importante:** Este es un **decorador de clase**, no de propiedad.

---

## 🔑 Símbolo de Metadatos

```typescript
export const MODULE_NAME_KEY = Symbol('module_name');
```

### Almacenamiento

```typescript
// En el prototype de la clase
proto[MODULE_NAME_KEY] = {
    singular: 'Customer',
    plural: 'Customers'
}
```

---

## 💻 Firma del Decorador

```typescript
function ModuleName(singular: string, plural: string): ClassDecorator
```

### Tipos

```typescript
export interface ModuleNameMetadata {
    singular: string;  // "Product"
    plural: string;    // "Products"
}
```

---

## 📖 Uso Básico

### Decorador de Clase

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { ModuleName } from '@/decorations';

@ModuleName('Customer', 'Customers')
export class Customer extends BaseEntity {
    @PropertyName('Customer Name', String)
    name!: string;
}
```

### Resultado en UI

```
┌─────────────────────────┐
│  ☰ Menu                 │
├─────────────────────────┤
│  📦 Products            │  ← Plural
│  👥 Customers           │  ← Plural (este)
│  📋 Orders              │
└─────────────────────────┘

Cuando abres la lista:
╔═══════════════════════════════════════╗
║         Customers                     ║  ← Plural en header
╠═══════════════════════════════════════╣
║  [+ New Customer]                     ║  ← Singular en botón
╚═══════════════════════════════════════╝

Cuando abres el detalle:
╔═══════════════════════════════════════╗
║         Customer Details              ║  ← Singular en header
╠═══════════════════════════════════════╣
║  Customer Name: [John Doe          ]  ║
╚═══════════════════════════════════════╝
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos Estáticos

#### `getModuleName(): ModuleNameMetadata`
Obtiene nombres singular y plural del módulo.

```typescript
// Uso
@ModuleName('Product', 'Products')
class Product extends BaseEntity {}

Product.getModuleName();
// Retorna: { singular: 'Product', plural: 'Products' }

// Ubicación en BaseEntity (línea ~85)
public static getModuleName(): ModuleNameMetadata {
    const metadata = this.prototype[MODULE_NAME_KEY];
    return metadata || { singular: this.name, plural: `${this.name}s` };
}
```

#### `getModuleNameSingular(): string`
Obtiene solo el nombre singular.

```typescript
// Uso
Product.getModuleNameSingular();
// Retorna: "Product"

// Ubicación en BaseEntity (línea ~95)
public static getModuleNameSingular(): string {
    return this.getModuleName().singular;
}
```

#### `getModuleNamePlural(): string`
Obtiene solo el nombre plural.

```typescript
// Uso
Product.getModuleNamePlural();
// Retorna: "Products"

// Ubicación en BaseEntity (línea ~100)
public static getModuleNamePlural(): string {
    return this.getModuleName().plural;
}
```

---

## 🎨 Impacto en UI

### 1. Menú Lateral (SideBar)

```vue
<template>
  <div class="sidebar">
    <div 
      v-for="module in appModules" 
      :key="module.name"
      class="sidebar-item"
      @click="navigateToModule(module)"
    >
      <span class="icon">{{ module.icon }}</span>
      <span class="name">{{ module.namePlural }}</span>  <!-- ← Plural -->
    </div>
  </div>
</template>

<script>
export default {
    computed: {
        appModules() {
            return Application.ModuleList.value.map(entityClass => ({
                name: entityClass.name,
                nameSingular: entityClass.getModuleNameSingular(),
                namePlural: entityClass.getModuleNamePlural(),  // ← Usado aquí
                icon: entityClass.getModuleIcon()
            }));
        }
    }
}
</script>
```

**Ubicación:** `src/components/SideBarComponent.vue` (línea ~45)

### 2. Encabezado de ListView

```vue
<template>
  <div class="list-view">
    <div class="header">
      <h1>{{ entityClass.getModuleNamePlural() }}</h1>  <!-- "Products" -->
      <button @click="createNew">
        + New {{ entityClass.getModuleNameSingular() }}  <!-- "New Product" -->
      </button>
    </div>
    
    <!-- Lista de registros -->
  </div>
</template>
```

**Ubicación:** `src/views/default_listview.vue` (línea ~25)

### 3. Encabezado de DetailView

```vue
<template>
  <div class="detail-view">
    <div class="header">
      <h1>
        {{ isNewRecord ? 'New' : 'Edit' }} 
        {{ entityClass.getModuleNameSingular() }}  <!-- "New Customer" -->
      </h1>
    </div>
    
    <!-- Formulario -->
  </div>
</template>
```

**Ubicación:** `src/views/default_detailview.vue` (línea ~18)

### 4. Breadcrumbs

```vue
<template>
  <nav class="breadcrumbs">
    <span>Home</span>
    <span>/</span>
    <span>{{ entityClass.getModuleNamePlural() }}</span>  <!-- "Customers" -->
    <span v-if="isDetailView">
      <span>/</span>
      <span>{{ isNewRecord ? 'New' : entity.getPrimaryPropertyValue() }}</span>
    </span>
  </nav>
</template>
```

### 5. Títulos de Página (Document Title)

```typescript
// En router
router.beforeEach((to, from, next) => {
    if (to.meta.entityClass) {
        const entityClass = to.meta.entityClass;
        document.title = `${entityClass.getModuleNamePlural()} - MyApp`;
    }
    next();
});
```

**Ubicación:** `src/router/index.ts` (línea ~40)

---

## 🔗 Decoradores Relacionados

### Stack Completo de Módulo

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { 
    ModuleName, 
    ModuleIcon, 
    ModulePermission,
    ApiEndpoint,
    Persistent
} from '@/decorations';

@ModuleName('Invoice', 'Invoices')           // ← Nombres
@ModuleIcon('receipt')                       // ← Icono en menú
@ModulePermission('invoices', 'view')        // ← Permisos
@ApiEndpoint('/api/invoices')                // ← Endpoint de API
@Persistent(true, 'id')                      // ← Persistencia en backend
export class Invoice extends BaseEntity {
    @PropertyName('Invoice Number', String)
    invoiceNumber!: string;
}
```

---

## 🧪 Ejemplos Avanzados

### 1. Nombres con Artículos

```typescript
// Para idiomas con artículos
@ModuleName('el Cliente', 'los Clientes')  // Español
export class Customer extends BaseEntity {}

// Uso en template:
// "Ver {nameSingular}" → "Ver el Cliente"
// "{namePlural} activos" → "los Clientes activos"
```

### 2. Nombres Técnicos vs Display

```typescript
// Clase: PurchaseOrder (técnico)
// Display: Orden de Compra (usuario)

@ModuleName('Orden de Compra', 'Órdenes de Compra')
export class PurchaseOrder extends BaseEntity {
    // ...
}

// La clase sigue siendo "PurchaseOrder" en código
// Pero el usuario ve "Orden de Compra"
```

### 3. Plurales Irregulares

```typescript
// Inglés
@ModuleName('Person', 'People')  // No "Persons"
export class Person extends BaseEntity {}

@ModuleName('Child', 'Children')  // No "Childs"
export class Child extends BaseEntity {}

// Español
@ModuleName('País', 'Países')
export class Country extends BaseEntity {}

@ModuleName('Acción', 'Acciones')
export class Action extends BaseEntity {}
```

### 4. Nombres Descriptivos vs Cortos

```typescript
// Descriptivo para el usuario
@ModuleName('Customer Payment Record', 'Customer Payment Records')
export class Payment extends BaseEntity {}

// El usuario ve "Customer Payment Records" en menú
// Pero la clase es "Payment" (corto para desarrollo)
```

### 5. Nombres con Emojis (Opcional)

```typescript
@ModuleName('📦 Product', '📦 Products')
@ModuleIcon('box')  // Icono de respaldo
export class Product extends BaseEntity {}

// Menú muestra: 📦 Products
```

---

## ⚠️ Consideraciones Importantes

### 1. Obligatorio para Módulos Navegables

Si quieres que una entidad aparezca en el menú, **DEBE** tener `@ModuleName`:

```typescript
// ✅ Aparece en menú
@ModuleName('Product', 'Products')
export class Product extends BaseEntity {}

// ❌ NO aparece en menú
export class InvoiceItem extends BaseEntity {}  // Sin @ModuleName
```

### 2. Singular y Plural Deben Ser Diferentes

Usar el mismo valor causa confusión:

```typescript
// ❌ MAL
@ModuleName('Data', 'Data')  // ¿Uno o varios?

// ✅ BIEN
@ModuleName('Data Entry', 'Data Entries')
// o
@ModuleName('Data Record', 'Data Records')
```

### 3. Capitalización Consistente

Mantén capitalización consistente con tu idioma:

```typescript
// Inglés: Title Case
@ModuleName('Purchase Order', 'Purchase Orders')

// Español: Oración normal
@ModuleName('Orden de compra', 'Órdenes de compra')
```

### 4. Nombres Únicos

Evita duplicar nombres entre módulos:

```typescript
// ❌ CONFLICTO
@ModuleName('User', 'Users')
export class Customer extends BaseEntity {}

@ModuleName('User', 'Users')  // ← Mismo nombre
export class Employee extends BaseEntity {}

// ✅ CORRECTO
@ModuleName('Customer', 'Customers')
export class Customer extends BaseEntity {}

@ModuleName('Employee', 'Employees')
export class Employee extends BaseEntity {}
```

### 5. Nombres Cortos para Menú

Si el nombre es muy largo, puede romper el layout del menú:

```typescript
// ❌ Demasiado largo
@ModuleName(
    'Customer Relationship Management Record',
    'Customer Relationship Management Records'
)

// ✅ Mejor
@ModuleName('CRM Record', 'CRM Records')
// o
@ModuleName('Customer Record', 'Customer Records')
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function ModuleName(singular: string, plural: string): ClassDecorator {
    return function <T extends Function>(target: T) {
        const proto = target.prototype;
        
        proto[MODULE_NAME_KEY] = {
            singular: singular,
            plural: plural
        };
        
        return target;
    };
}
```

**Ubicación:** `src/decorations/module_name_decorator.ts` (línea ~10)

### Registro en Application

```typescript
// En Application.ts (final del archivo)
import { Products } from '@/entities/products';
import { Customer } from '@/entities/customer';

const Application = ApplicationClass.getInstance();

// Agregar módulos directamente al array
Application.ModuleList.value.push(Products, Customer);

// El framework verifica automáticamente que cada módulo tenga @ModuleName
// al renderizar el menú lateral
export default Application;
```

**Ubicación:** `src/models/application.ts` (línea ~279)

**Nota:** Los módulos se agregan directamente usando `.push()`. El decorador `@ModuleName` es requerido para que el módulo aparezca correctamente en el menú.

---

## 📊 Flujo de Registro y Uso

```
1. Aplicación inicia → main.js y application.ts
        ↓
2. application.ts agrega entidades a ModuleList
   Application.ModuleList.value.push(Customer)
        ↓
3. Customer tiene @ModuleName?
        ↓ (sí)
4. SideBarComponent lee ModuleList
        ↓
5. Para cada módulo:
    - Obtiene getModuleName() → "Customers"
    - Obtiene getModuleIcon() → "users"
    - Crea item en menú
        ↓
8. Usuario hace click → Router navega a /customers
        ↓
9. ListView muestra getModuleNamePlural() en header → "Customers"
        ↓
10. Usuario hace click "New" → DetailView
        ↓
11. DetailView muestra "New {getModuleNameSingular()}" → "New Customer"
```

---

## 🎓 Mejores Prácticas

### 1. Definir Constantes

```typescript
// constants/module-names.ts
export const MODULE_NAMES = {
    CUSTOMER: {
        singular: 'Customer',
        plural: 'Customers'
    },
    PRODUCT: {
        singular: 'Product',
        plural: 'Products'
    },
    ORDER: {
        singular: 'Order',
        plural: 'Orders'
    }
} as const;

// entities/customer.ts
import { MODULE_NAMES } from '@/constants/module-names';

@ModuleName(
    MODULE_NAMES.CUSTOMER.singular,
    MODULE_NAMES.CUSTOMER.plural
)
export class Customer extends BaseEntity {}
```

### 2. Internacionalización (i18n)

```typescript
// Para soporte multi-idioma
import { useI18n } from 'vue-i18n';

// En lugar de hardcodear:
@ModuleName('Product', 'Products')

// Usar claves de traducción:
@ModuleName('modules.product.singular', 'modules.product.plural')

// Y en componentes, traducir:
computed: {
    displayName() {
        const { singular, plural } = this.entityClass.getModuleName();
        return this.$t(plural);  // Traduce la clave
    }
}
```

### 3. Formateo Dinámico

```typescript
// Crear helper para formatear
export function formatModuleName(
    entityClass: typeof BaseEntity,
    count: number
): string {
    const { singular, plural } = entityClass.getModuleName();
    return count === 1 ? singular : plural;
}

// Uso:
formatModuleName(Product, 1);   // "Product"
formatModuleName(Product, 5);   // "Products"
formatModuleName(Product, 0);   // "Products"
```

---

## 📚 Referencias Adicionales

- `module-icon-decorator.md` - Iconos de módulos
- `module-permission-decorator.md` - Permisos de módulos
- `../03-application/router-integration.md` - Rutas automáticas
- `../03-application/application-singleton.md` - Registro de módulos
- `../04-components/sidebar-component.md` - Menú de navegación
- `../../02-FLOW-ARCHITECTURE.md` - Flujo de navegación

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/module_name_decorator.ts`
