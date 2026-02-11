# 🎨 ModuleIcon Decorator

**Referencias:**
- `module-name-decorator.md` - ModuleName define el nombre, ModuleIcon define el icono
- `module-permission-decorator.md` - Permisos del módulo
- `../../03-application/application-singleton.md` - Application.ModuleList usa iconos
- `../../02-FLOW-ARCHITECTURE.md` - Iconos en sidebar

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/module_icon_decorator.ts`  
**Constants:** `src/constants/icons.ts`, `src/constants/ggicons.ts`

---

## 🎯 Propósito

El decorador `@ModuleIcon()` define el **icono visual** que representa un módulo en la interfaz de usuario (sidebar, breadcrumbs, headers, etc.).

**Beneficios:**
- Identificación visual rápida de módulos
- Mejora UX del menú lateral
- Iconografía consistente en toda la app
- Soporta múltiples icon libraries

---

## 📝 Sintaxis

```typescript
@ModuleIcon(icon: string)
export class EntityName extends BaseEntity {
    // ...
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `icon` | `string` | Sí | Nombre del icono (de library configurada) |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/module_icon_decorator.ts

/**
 * Symbol para almacenar metadata de module icon
 */
export const MODULE_ICON_METADATA = Symbol('moduleIcon');

/**
 * @ModuleIcon() - Define el icono del módulo
 * 
 * @param icon - Nombre del icono
 * @returns ClassDecorator
 */
export function ModuleIcon(icon: string): ClassDecorator {
    return function (target: any) {
        // Guardar icono en prototype
        target.prototype[MODULE_ICON_METADATA] = icon;
    };
}
```

**Ubicación:** `src/decorations/module_icon_decorator.ts` (línea ~1-25)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[MODULE_ICON_METADATA] = 'box';
Customer.prototype[MODULE_ICON_METADATA] = 'user';
Order.prototype[MODULE_ICON_METADATA] = 'shopping-cart';
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene el icono del módulo (método estático)
 * 
 * @returns Nombre del icono o 'circle' por defecto
 */
public static getModuleIcon(): string {
    const icon = this.prototype[MODULE_ICON_METADATA];
    return icon || 'circle';  // Default: 'circle'
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~950-960)

---

## 🎨 Impacto en UI

### SideBar con Iconos

```vue
<!-- src/components/SideBarComponent.vue -->

<template>
  <div class="sidebar">
    <div
      v-for="entityClass in Application.ModuleList.value"
      :key="entityClass.name"
      class="sidebar-item"
      :class="{ 'active': isActiveModule(entityClass) }"
      @click="navigateToModule(entityClass)"
    >
      <!-- Icono del módulo -->
      <span class="icon">
        <component :is="getIconComponent(entityClass)" />
      </span>
      
      <!-- Nombre del módulo -->
      <span class="name">
        {{ entityClass.getModuleNamePlural() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';
import { ViewType } from '@/enums/view_type';
import { useRoute } from 'vue-router';

// Icons
import IconBox from '@/assets/icons/box.vue';
import IconUser from '@/assets/icons/user.vue';
import IconShoppingCart from '@/assets/icons/shopping-cart.vue';
import IconCircle from '@/assets/icons/circle.vue';

const route = useRoute();

function getIconComponent(entityClass: typeof BaseEntity) {
    const iconName = entityClass.getModuleIcon();
    
    // Mapeo de nombre de icono a componente
    const iconMap = {
        'box': IconBox,
        'user': IconUser,
        'shopping-cart': IconShoppingCart,
        'circle': IconCircle
    };
    
    return iconMap[iconName] || iconMap['circle'];
}

function isActiveModule(entityClass: typeof BaseEntity): boolean {
    const currentEntityClass = Application.View.value.entityClass;
    return currentEntityClass === entityClass;
}

function navigateToModule(entityClass: typeof BaseEntity) {
    Application.changeView(entityClass, ViewType.LIST);
}
</script>

<style scoped>
.sidebar-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.sidebar-item:hover {
    background-color: #f3f4f6;
}

.sidebar-item.active {
    background-color: #3b82f6;
    color: white;
}

.icon {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.name {
    font-size: 0.875rem;
    font-weight: 500;
}
</style>
```

**Ubicación:** `src/components/SideBarComponent.vue`

---

### Header con Icono

```vue
<!-- ListView.vue / DetailView.vue -->

<template>
  <div class="view-header">
    <!-- Icono + Título -->
    <div class="title-section">
      <component :is="moduleIcon" class="module-icon" />
      <h1>{{ moduleTitle }}</h1>
    </div>
    
    <!-- Acciones -->
    <div class="actions">
      <button @click="createNew">Create New</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';

const entityClass = computed(() => Application.View.value.entityClass);

const moduleIcon = computed(() => {
    const iconName = entityClass.value.getModuleIcon();
    // ... retornar componente de icono
});

const moduleTitle = computed(() => {
    return entityClass.value.getModuleNamePlural();
});
</script>

<style scoped>
.view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
}

.title-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.module-icon {
    width: 32px;
    height: 32px;
    color: #3b82f6;
}
</style>
```

---

## 🧪 Ejemplos de Uso

### 1. Iconos Básicos

```typescript
import { ModuleIcon } from '@/decorations/module_icon_decorator';
import { ModuleName } from '@/decorations/module_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

@ModuleName('Product', 'Products')
@ModuleIcon('box')
export class Product extends BaseEntity {
    // ...
}

@ModuleName('Customer', 'Customers')
@ModuleIcon('user')
export class Customer extends BaseEntity {
    // ...
}

@ModuleName('Order', 'Orders')
@ModuleIcon('shopping-cart')
export class Order extends BaseEntity {
    // ...
}
```

**Resultado en sidebar:**
```
📦 Products
👤 Customers
🛒 Orders
```

---

### 2. Iconos de Gestión

```typescript
@ModuleName('Category', 'Categories')
@ModuleIcon('tag')
export class Category extends BaseEntity {
    // ...
}

@ModuleName('Brand', 'Brands')
@ModuleIcon('award')
export class Brand extends BaseEntity {
    // ...
}

@ModuleName('Supplier', 'Suppliers')
@ModuleIcon('truck')
export class Supplier extends BaseEntity {
    // ...
}
```

---

### 3. Iconos Financieros

```typescript
@ModuleName('Invoice', 'Invoices')
@ModuleIcon('file-text')
export class Invoice extends BaseEntity {
    // ...
}

@ModuleName('Payment', 'Payments')
@ModuleIcon('credit-card')
export class Payment extends BaseEntity {
    // ...
}

@ModuleName('Report', 'Reports')
@ModuleIcon('bar-chart')
export class Report extends BaseEntity {
    // ...
}
```

---

### 4. Iconos de Usuarios y Permisos

```typescript
@ModuleName('User', 'Users')
@ModuleIcon('user')
export class User extends BaseEntity {
    // ...
}

@ModuleName('Role', 'Roles')
@ModuleIcon('shield')
export class Role extends BaseEntity {
    // ...
}

@ModuleName('Permission', 'Permissions')
@ModuleIcon('lock')
export class Permission extends BaseEntity {
    // ...
}
```

---

### 5. Iconos de Configuración

```typescript
@ModuleName('Setting', 'Settings')
@ModuleIcon('settings')
export class Setting extends BaseEntity {
    // ...
}

@ModuleName('Integration', 'Integrations')
@ModuleIcon('link')
export class Integration extends BaseEntity {
    // ...
}

@ModuleName('Webhook', 'Webhooks')
@ModuleIcon('send')
export class Webhook extends BaseEntity {
    // ...
}
```

---

### 6. Iconos de Inventario

```typescript
@ModuleName('Product', 'Products')
@ModuleIcon('box')
export class Product extends BaseEntity {
    // ...
}

@ModuleName('Warehouse', 'Warehouses')
@ModuleIcon('home')
export class Warehouse extends BaseEntity {
    // ...
}

@ModuleName('Stock Movement', 'Stock Movements')
@ModuleIcon('trending-up')
export class StockMovement extends BaseEntity {
    // ...
}
```

---

### 7. Iconos de Marketing

```typescript
@ModuleName('Campaign', 'Campaigns')
@ModuleIcon('megaphone')
export class Campaign extends BaseEntity {
    // ...
}

@ModuleName('Email Template', 'Email Templates')
@ModuleIcon('mail')
export class EmailTemplate extends BaseEntity {
    // ...
}

@ModuleName('Subscriber', 'Subscribers')
@ModuleIcon('users')
export class Subscriber extends BaseEntity {
    // ...
}
```

---

### 8. Iconos de HR

```typescript
@ModuleName('Employee', 'Employees')
@ModuleIcon('briefcase')
export class Employee extends BaseEntity {
    // ...
}

@ModuleName('Department', 'Departments')
@ModuleIcon('grid')
export class Department extends BaseEntity {
    // ...
}

@ModuleName('Attendance', 'Attendance')
@ModuleIcon('clock')
export class Attendance extends BaseEntity {
    // ...
}
```

---

## 🎨 Icon Libraries Soportadas

### 1. Feather Icons (Default)

```typescript
// Iconos comunes de Feather Icons
@ModuleIcon('box')           // Productos
@ModuleIcon('user')          // Usuarios
@ModuleIcon('users')         // Grupos
@ModuleIcon('shopping-cart') // Carrito/Órdenes
@ModuleIcon('package')       // Paquetes
@ModuleIcon('tag')           // Etiquetas
@ModuleIcon('file-text')     // Documentos
@ModuleIcon('settings')      // Configuración
@ModuleIcon('home')          // Inicio/Dashboard
@ModuleIcon('bar-chart')     // Reportes/Analytics
@ModuleIcon('calendar')      // Calendario/Eventos
@ModuleIcon('mail')          // Email
@ModuleIcon('bell')          // Notificaciones
@ModuleIcon('search')        // Búsqueda
@ModuleIcon('filter')        // Filtros
@ModuleIcon('download')      // Descargas
@ModuleIcon('upload')        // Subidas
@ModuleIcon('trash')         // Eliminar
@ModuleIcon('edit')          // Editar
@ModuleIcon('plus')          // Agregar
```

**Referencia:** [Feather Icons](https://feathericons.com/)

---

### 2. Google Icons

```typescript
// src/constants/ggicons.ts

export const GG_ICONS = {
    'product': 'inventory_2',
    'customer': 'person',
    'order': 'shopping_cart',
    'invoice': 'description',
    'payment': 'payment',
    'report': 'analytics',
    'settings': 'settings',
    'user': 'account_circle'
    // ...
};

// Uso:
@ModuleIcon('inventory_2')    // Google Material Icons
export class Product extends BaseEntity {
    // ...
}
```

**Referencia:** [Google Material Icons](https://fonts.google.com/icons)

---

### 3. Font Awesome

```typescript
// Formato: 'fa-{icon-name}'
@ModuleIcon('fa-box')
@ModuleIcon('fa-user')
@ModuleIcon('fa-shopping-cart')
```

---

### 4. Custom SVG Icons

```typescript
// src/assets/icons/custom-product.vue

<template>
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7v10c0 5.5 3.8 9.7 10 11 6.2-1.3 10-5.5 10-11V7l-10-5z" 
          stroke="currentColor" stroke-width="2"/>
  </svg>
</template>

// Mapeo en SideBarComponent:
const iconMap = {
    'custom-product': () => import('@/assets/icons/custom-product.vue')
};
```

---

## 🔧 Configuración de Icon Library

### Icon Service

```typescript
// src/services/icon_service.ts

import type { Component } from 'vue';

// Importar iconos
import IconBox from '@/assets/icons/box.vue';
import IconUser from '@/assets/icons/user.vue';
import IconShoppingCart from '@/assets/icons/shopping-cart.vue';
// ... más iconos

export class IconService {
    private static iconMap: Record<string, Component> = {
        'box': IconBox,
        'user': IconUser,
        'shopping-cart': IconShoppingCart,
        // ... mapeo completo
    };
    
    /**
     * Obtener componente de icono por nombre
     */
    public static getIcon(name: string): Component {
        return this.iconMap[name] || this.iconMap['circle'];  // Default
    }
    
    /**
     * Registrar icono custom
     */
    public static registerIcon(name: string, component: Component): void {
        this.iconMap[name] = component;
    }
    
    /**
     * Verificar si icono existe
     */
    public static hasIcon(name: string): boolean {
        return name in this.iconMap;
    }
}
```

### Uso en Componentes

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { IconService } from '@/services/icon_service';

const props = defineProps<{
    iconName: string;
}>();

const iconComponent = computed(() => {
    return IconService.getIcon(props.iconName);
});
</script>

<template>
  <component :is="iconComponent" />
</template>
```

---

## ⚠️ Consideraciones Importantes

### 1. Icono por Defecto

```typescript
// Si no se define @ModuleIcon, se usa 'circle' por defecto
export class MyEntity extends BaseEntity {
    // ...
}

MyEntity.getModuleIcon();  // → 'circle'
```

### 2. Nombres Consistentes

```typescript
// ✅ CORRECTO: Usar nombres de icon library
@ModuleIcon('box')           // ✓ Existe en Feather Icons
@ModuleIcon('shopping-cart') // ✓ Existe en Feather Icons

// ❌ INCORRECTO: Nombres inventados
@ModuleIcon('producto')      // ✗ No existe
@ModuleIcon('caja')          // ✗ No existe
```

### 3. Iconos Semánticamente Correctos

```typescript
// ✅ BUENO: Iconos apropiados
@ModuleIcon('user')          // Para usuarios
@ModuleIcon('box')           // Para productos
@ModuleIcon('shopping-cart') // Para órdenes

// ❌ MALO: Iconos inapropiados
@ModuleIcon('trash')         // Para usuarios (confuso)
@ModuleIcon('heart')         // Para facturas (no hace sentido)
```

### 4. Testing Icon Existence

```typescript
// Verificar que icono existe antes de usar
const iconName = Product.getModuleIcon();

if (!IconService.hasIcon(iconName)) {
    console.warn(`Icon '${iconName}' not found, using default`);
}
```

### 5. Performance: Icon Components

```typescript
// ✅ MEJOR: Lazy load icons
const iconMap = {
    'box': () => import('@/assets/icons/box.vue'),
    'user': () => import('@/assets/icons/user.vue')
};

// ❌ PEOR: Importar todos los iconos upfront
import IconBox from '@/assets/icons/box.vue';
import IconUser from '@/assets/icons/user.vue';
// ... 100+ imports
```

---

## 🎨 Iconos Recomendados por Categoría

### E-commerce
- Products: `box`, `package`
- Orders: `shopping-cart`, `shopping-bag`
- Customers: `user`, `users`
- Payments: `credit-card`, `dollar-sign`
- Shipping: `truck`, `send`

### Finanzas
- Invoices: `file-text`, `receipt`
- Payments: `credit-card`, `dollar-sign`
- Reports: `bar-chart`, `pie-chart`
- Taxes: `percent`
- Accounts: `briefcase`

### HR
- Employees: `briefcase`, `user`
- Departments: `grid`, `layers`
- Attendance: `clock`, `calendar`
- Payroll: `dollar-sign`
- Leave: `calendar-x`

### Inventario
- Products: `box`, `package`
- Warehouses: `home`, `database`
- Stock: `trending-up`, `activity`
- Transfers: `arrow-right`
- Adjustments: `edit`, `sliders`

### CRM
- Contacts: `user`, `users`
- Companies: `building`
- Deals: `dollar-sign`, `trending-up`
- Activities: `activity`, `calendar`
- Tasks: `check-square`, `list`

### Marketing
- Campaigns: `megaphone`, `broadcast`
- Emails: `mail`, `send`
- Landing Pages: `layout`
- Analytics: `bar-chart`, `pie-chart`
- Subscribers: `users`, `user-check`

### Configuración
- Settings: `settings`, `sliders`
- Users: `user`, `shield`
- Roles: `shield`, `lock`
- Integrations: `link`, `zap`
- Logs: `file-text`, `list`

---

## 📚 Referencias Adicionales

- `module-name-decorator.md` - ModuleName define nombres, ModuleIcon define icono
- `module-permission-decorator.md` - Permisos del módulo
- `../../03-application/application-singleton.md` - Application.ModuleList usa iconos
- `../../02-FLOW-ARCHITECTURE.md` - Iconos en sidebar y navegación
- [Feather Icons](https://feathericons.com/) - Icon library por defecto
- [Google Material Icons](https://fonts.google.com/icons) - Alternativa
- [Font Awesome](https://fontawesome.com/) - Alternativa

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/module_icon_decorator.ts`  
**Constants:** `src/constants/icons.ts`, `src/constants/ggicons.ts`  
**Líneas:** ~25 (decorator), ~100 (constants)
