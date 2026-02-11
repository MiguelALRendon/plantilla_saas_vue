# 📐 ViewGroup Decorator

**Referencias:**
- `view-group-row-decorator.md` - ViewGroupRow
- `property-index-decorator.md` - PropertyIndex
- `property-name-decorator.md` - PropertyName
- `../04-components/detail-view-table.md` - Tabla de detalles

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/view_group_decorator.ts`

---

## 🎯 Propósito

Organiza propiedades en **grupos lógicos** en la vista de detalle, creando secciones colapsables que agrupan campos relacionados. Mejora la organización visual y UX cuando una entidad tiene muchas propiedades.

Sin ViewGroup: todos los campos aparecen en una lista plana.  
Con ViewGroup: campos organizados en pestañas o secciones temáticas (Info General, Dirección, Contacto, etc.).

---

## 🔑 Símbolo de Metadatos

```typescript
export const VIEW_GROUP_KEY = Symbol('view_group');
```

### Almacenamiento

```typescript
proto[VIEW_GROUP_KEY] = {
    'firstName': 'Personal Information',
    'lastName': 'Personal Information',
    'email': 'Contact',
    'phone': 'Contact',
    'street': 'Address',
    'city': 'Address',
    'zipCode': 'Address'
}
```

---

## 💻 Firma del Decorador

```typescript
function ViewGroup(groupName: string): PropertyDecorator
```

### Tipos

```typescript
export type ViewGroupName = string;
```

---

## 📖 Uso Básico

### Agrupar Campos Relacionados

```typescript
export class Customer extends BaseEntity {
    // Grupo: Información Personal
    @PropertyIndex(1)
    @PropertyName('First Name', String)
    @ViewGroup('Personal Information')
    @Required(true)
    firstName!: string;
    
    @PropertyIndex(2)
    @PropertyName('Last Name', String)
    @ViewGroup('Personal Information')
    @Required(true)
    lastName!: string;
    
    @PropertyIndex(3)
    @PropertyName('Date of Birth', Date)
    @ViewGroup('Personal Information')
    dateOfBirth?: Date;
    
    // Grupo: Contacto
    @PropertyIndex(4)
    @PropertyName('Email', String)
    @ViewGroup('Contact')
    @Required(true)
    email!: string;
    
    @PropertyIndex(5)
    @PropertyName('Phone', String)
    @ViewGroup('Contact')
    phone?: string;
    
    // Grupo: Dirección
    @PropertyIndex(6)
    @PropertyName('Street', String)
    @ViewGroup('Address')
    street?: string;
    
    @PropertyIndex(7)
    @PropertyName('City', String)
    @ViewGroup('Address')
    city?: string;
    
    @PropertyIndex(8)
    @PropertyName('Postal Code', String)
    @ViewGroup('Address')
    postalCode?: string;
}
```

### Resultado en UI

```
╔═══════════════════════════════════════════════════╗
║                    Customer Details               ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  📋 Personal Information  [-]                     ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ First Name:    [John                    ]  │ ║
║  │ Last Name:     [Doe                     ]  │ ║
║  │ Date of Birth: [1990-05-15              ]  │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  📞 Contact  [-]                                  ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ Email: [john.doe@example.com            ]  │ ║
║  │ Phone: [+1-555-123-4567                 ]  │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  🏠 Address  [-]                                  ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ Street:      [123 Main St               ]  │ ║
║  │ City:        [New York                  ]  │ ║
║  │ Postal Code: [10001                     ]  │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos de Instancia

#### `getViewGroup(key: string): string | undefined`
Obtiene el nombre del grupo de una propiedad.

```typescript
// Uso
const customer = new Customer();
customer.getViewGroup('firstName');
// Retorna: "Personal Information"

customer.getViewGroup('email');
// Retorna: "Contact"

// Ubicación en BaseEntity (línea ~280)
public getViewGroup(key: string): string | undefined {
    const viewGroup = (this.constructor as any).prototype[VIEW_GROUP_KEY];
    return viewGroup?.[key];
}
```

#### `getPropertiesByViewGroup(groupName: string): string[]`
Obtiene todas las propiedades de un grupo específico.

```typescript
// Uso
const customer = new Customer();
customer.getPropertiesByViewGroup('Contact');
// Retorna: ['email', 'phone']

customer.getPropertiesByViewGroup('Address');
// Retorna: ['street', 'city', 'postalCode']

// Ubicación en BaseEntity (línea ~295)
public getPropertiesByViewGroup(groupName: string): string[] {
    const viewGroup = (this.constructor as any).prototype[VIEW_GROUP_KEY];
    if (!viewGroup) return [];
    
    return Object.entries(viewGroup)
        .filter(([_, group]) => group === groupName)
        .map(([property]) => property);
}
```

#### `getAllViewGroups(): string[]`
Obtiene lista de nombres de todos los grupos (únicos).

```typescript
// Uso
const customer = new Customer();
customer.getAllViewGroups();
// Retorna: ['Personal Information', 'Contact', 'Address']

// Ubicación en BaseEntity (línea ~310)
public getAllViewGroups(): string[] {
    const viewGroup = (this.constructor as any).prototype[VIEW_GROUP_KEY];
    if (!viewGroup) return [];
    
    const groups = Object.values(viewGroup) as string[];
    return [...new Set(groups)];  // Únicos
}
```

---

## 🎨 Impacto en UI

### Vista de Detalle Agrupada

El componente `default_detailview.vue` lee los ViewGroups y genera secciones:

```vue
<template>
  <div class="detail-view">
    <!-- Si hay grupos, mostrar en secciones -->
    <div v-if="hasViewGroups" class="grouped-view">
      <div 
        v-for="groupName in viewGroups" 
        :key="groupName"
        class="view-group"
      >
        <div class="group-header" @click="toggleGroup(groupName)">
          <h3>{{ groupName }}</h3>
          <span class="toggle-icon">{{ isExpanded(groupName) ? '[-]' : '[+]' }}</span>
        </div>
        
        <div v-show="isExpanded(groupName)" class="group-content">
          <div 
            v-for="propertyKey in getPropertiesInGroup(groupName)"
            :key="propertyKey"
            class="form-field"
          >
            <label>{{ entity.getPropertyName(propertyKey) }}</label>
            <component 
              :is="getInputComponent(propertyKey)"
              v-model="entity[propertyKey]"
              :entity="entity"
              :propertyKey="propertyKey"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Si NO hay grupos, mostrar lista plana -->
    <div v-else class="flat-view">
      <div 
        v-for="propertyKey in entity.getProperties()"
        :key="propertyKey"
        class="form-field"
      >
        <!-- Inputs normales -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
    computed: {
        hasViewGroups() {
            return this.entity.getAllViewGroups().length > 0;
        },
        viewGroups() {
            return this.entity.getAllViewGroups();
        }
    },
    methods: {
        getPropertiesInGroup(groupName) {
            return this.entity.getPropertiesByViewGroup(groupName);
        },
        toggleGroup(groupName) {
            this.expandedGroups[groupName] = !this.expandedGroups[groupName];
        },
        isExpanded(groupName) {
            return this.expandedGroups[groupName] !== false;  // Default: expanded
        }
    }
}
</script>
```

**Ubicación:** `src/views/default_detailview.vue` (línea ~120)

---

## 🔗 Decoradores Relacionados

### Combinar con ViewGroupRow

Para organización más compleja (columnas dentro de grupos):

```typescript
export class Employee extends BaseEntity {
    // Grupo: Personal - Fila 1 (2 columnas)
    @PropertyIndex(1)
    @PropertyName('First Name', String)
    @ViewGroup('Personal Information')
    @ViewGroupRow(1)
    @CSSColumnClass('col-md-6')
    firstName!: string;
    
    @PropertyIndex(2)
    @PropertyName('Last Name', String)
    @ViewGroup('Personal Information')
    @ViewGroupRow(1)
    @CSSColumnClass('col-md-6')
    lastName!: string;
    
    // Grupo: Personal - Fila 2 (1 columna completa)
    @PropertyIndex(3)
    @PropertyName('Email', String)
    @ViewGroup('Personal Information')
    @ViewGroupRow(2)
    @CSSColumnClass('col-md-12')
    email!: string;
    
    // Grupo: Employment - Fila 1
    @PropertyIndex(4)
    @PropertyName('Position', String)
    @ViewGroup('Employment')
    @ViewGroupRow(1)
    position!: string;
}
```

### Resultado Visual

```
╔═══════════════════════════════════════════════════════╗
║ 📋 Personal Information  [-]                          ║
║ ┌───────────────────────────────────────────────────┐ ║
║ │ Row 1:                                            │ ║
║ │  [First Name: John    ] [Last Name: Doe        ] │ ║
║ │                                                   │ ║
║ │ Row 2:                                            │ ║
║ │  [Email: john.doe@company.com                  ] │ ║
║ └───────────────────────────────────────────────────┘ ║
║                                                       ║
║ 💼 Employment  [-]                                    ║
║ ┌───────────────────────────────────────────────────┐ ║
║ │ Row 1:                                            │ ║
║ │  [Position: Senior Developer                   ] │ ║
║ └───────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════╝
```

---

## 🧪 Ejemplos Avanzados

### 1. Entidad de Producto con Múltiples Grupos

```typescript
export class Product extends BaseEntity {
    // Grupo: Información Básica
    @PropertyIndex(1)
    @PropertyName('Product Name', String)
    @ViewGroup('Basic Information')
    @Required(true)
    name!: string;
    
    @PropertyIndex(2)
    @PropertyName('SKU', String)
    @ViewGroup('Basic Information')
    @Required(true)
    sku!: string;
    
    @PropertyIndex(3)
    @PropertyName('Description', String)
    @ViewGroup('Basic Information')
    @StringTypeDef(StringType.TEXTAREA)
    description?: string;
    
    // Grupo: Pricing
    @PropertyIndex(4)
    @PropertyName('Base Price', Number)
    @ViewGroup('Pricing')
    @Required(true)
    basePrice!: number;
    
    @PropertyIndex(5)
    @PropertyName('Sale Price', Number)
    @ViewGroup('Pricing')
    salePrice?: number;
    
    @PropertyIndex(6)
    @PropertyName('Tax Rate', Number)
    @ViewGroup('Pricing')
    taxRate?: number;
    
    // Grupo: Inventory
    @PropertyIndex(7)
    @PropertyName('Current Stock', Number)
    @ViewGroup('Inventory')
    @ReadOnly(true)
    currentStock!: number;
    
    @PropertyIndex(8)
    @PropertyName('Minimum Stock', Number)
    @ViewGroup('Inventory')
    minimumStock!: number;
    
    @PropertyIndex(9)
    @PropertyName('Warehouse Location', String)
    @ViewGroup('Inventory')
    warehouseLocation?: string;
    
    // Grupo: Supplier Information
    @PropertyIndex(10)
    @PropertyName('Supplier', Supplier)
    @ViewGroup('Supplier Information')
    supplier?: Supplier;
    
    @PropertyIndex(11)
    @PropertyName('Supplier Code', String)
    @ViewGroup('Supplier Information')
    supplierCode?: string;
    
    // Grupo: Metadata
    @PropertyIndex(12)
    @PropertyName('Created At', Date)
    @ViewGroup('Metadata')
    @ReadOnly(true)
    createdAt!: Date;
    
    @PropertyIndex(13)
    @PropertyName('Updated At', Date)
    @ViewGroup('Metadata')
    @ReadOnly(true)
    updatedAt!: Date;
}
```

### 2. Grupos Condicionales (Mostrar Según Rol)

```typescript
export class User extends BaseEntity {
    // Visible para todos
    @PropertyName('Full Name', String)
    @ViewGroup('Profile')
    fullName!: string;
    
    // Solo visible para administradores
    @PropertyName('Role', String)
    @ViewGroup('Security')  // Este grupo se oculta si no admin
    role!: string;
    
    @PropertyName('Permissions', Array)
    @ArrayOf(String)
    @ViewGroup('Security')
    permissions!: string[];
}

// En el componente:
computed: {
    visibleGroups() {
        const allGroups = this.entity.getAllViewGroups();
        
        // Filtrar grupos según permisos
        return allGroups.filter(group => {
            if (group === 'Security') {
                return this.currentUser.isAdmin;
            }
            return true;
        });
    }
}
```

### 3. Grupos Anidados (Pestañas dentro de Secciones)

```typescript
export class Invoice extends BaseEntity {
    // Pestaña: General → Sección: Basic Info
    @PropertyName('Invoice Number', String)
    @ViewGroup('General > Basic Info')
    invoiceNumber!: string;
    
    // Pestaña: General → Sección: Dates
    @PropertyName('Issue Date', Date)
    @ViewGroup('General > Dates')
    issueDate!: Date;
    
    // Pestaña: Customer → Sección: Contact
    @PropertyName('Customer Name', String)
    @ViewGroup('Customer > Contact')
    customerName!: string;
    
    // Pestaña: Items
    @PropertyName('Line Items', Array)
    @ArrayOf(InvoiceItem)
    @ViewGroup('Items')
    items!: InvoiceItem[];
}

// El componente puede parsear ">" para crear pestañas anidadas
```

### 4. Grupos con Iconos y Colores

```typescript
// Extender metadata con configuración visual
export const VIEW_GROUP_CONFIG_KEY = Symbol('view_group_config');

function ViewGroupWithStyle(
    groupName: string, 
    icon: string, 
    color: string
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        // Registrar grupo normal
        if (!proto[VIEW_GROUP_KEY]) {
            proto[VIEW_GROUP_KEY] = {};
        }
        proto[VIEW_GROUP_KEY][propertyKey] = groupName;
        
        // Registrar configuración visual
        if (!proto[VIEW_GROUP_CONFIG_KEY]) {
            proto[VIEW_GROUP_CONFIG_KEY] = {};
        }
        proto[VIEW_GROUP_CONFIG_KEY][groupName] = { icon, color };
    };
}

// Uso
export class Customer extends BaseEntity {
    @PropertyName('First Name', String)
    @ViewGroupWithStyle('Personal', '👤', '#3498db')
    firstName!: string;
    
    @PropertyName('Email', String)
    @ViewGroupWithStyle('Contact', '📧', '#2ecc71')
    email!: string;
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Orden de Propiedades Dentro de Grupos

El orden dentro de un grupo se define con `@PropertyIndex`:

```typescript
@PropertyIndex(1)  // Aparece primero
@ViewGroup('Address')
street!: string;

@PropertyIndex(2)  // Aparece segundo
@ViewGroup('Address')
city!: string;

@PropertyIndex(3)  // Aparece tercero
@ViewGroup('Address')
postalCode!: string;
```

### 2. Propiedades Sin Grupo

Las propiedades sin `@ViewGroup` aparecen en una sección "sin agrupar" al final:

```typescript
@PropertyName('ID', Number)
id!: number;  // Sin grupo → va al final

@PropertyName('Name', String)
@ViewGroup('Info')
name!: string;  // Con grupo → va en sección "Info"
```

### 3. Nombres de Grupos Consistentes

Usa constantes para evitar typos:

```typescript
// ❌ MAL: Typos en nombres
@ViewGroup('Addres')  // ← Typo
street!: string;

@ViewGroup('Address')
city!: string;

// ✅ BIEN: Usar constantes
export const VIEW_GROUPS = {
    ADDRESS: 'Address',
    CONTACT: 'Contact',
    PERSONAL: 'Personal Information'
} as const;

@ViewGroup(VIEW_GROUPS.ADDRESS)
street!: string;

@ViewGroup(VIEW_GROUPS.ADDRESS)
city!: string;
```

### 4. Grupos Vacíos

Si un grupo no tiene propiedades, no se muestra:

```typescript
// Solo tiene grupo "Address"
export class Location extends BaseEntity {
    @PropertyName('Street', String)
    @ViewGroup('Address')
    street!: string;
}

// getAllViewGroups() retorna ["Address"]
// No hay grupos vacíos
```

### 5. Estado de Expansión Persistente

Guardar estado de grupos colapsados/expandidos:

```typescript
// En componente
data() {
    return {
        expandedGroups: this.loadExpandedState()
    }
},
methods: {
    toggleGroup(groupName) {
        this.expandedGroups[groupName] = !this.expandedGroups[groupName];
        this.saveExpandedState();
    },
    saveExpandedState() {
        localStorage.setItem(
            `view-groups-${this.entity.constructor.name}`,
            JSON.stringify(this.expandedGroups)
        );
    },
    loadExpandedState() {
        const saved = localStorage.getItem(
            `view-groups-${this.entity.constructor.name}`
        );
        return saved ? JSON.parse(saved) : {};
    }
}
```

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function ViewGroup(groupName: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        if (!proto[VIEW_GROUP_KEY]) {
            proto[VIEW_GROUP_KEY] = {};
        }
        
        proto[VIEW_GROUP_KEY][propertyKey] = groupName;
    };
}
```

**Ubicación:** `src/decorations/view_group_decorator.ts` (línea ~10)

---

## 📊 Flujo de Renderizado

```
1. Usuario abre vista de detalle (DetailView)
        ↓
2. Componente obtiene entity.getAllViewGroups()
        ↓
3. Si hay grupos:
        ↓
4. Para cada grupo:
    a. Crear sección con header (grupo name + toggle)
    b. Obtener propiedades: entity.getPropertiesByViewGroup(group)
    c. Ordenar propiedades por PropertyIndex
    d. Renderizar inputs para cada propiedad
        ↓
5. Si NO hay grupos:
        ↓
6. Renderizar lista plana con todas las propiedades
```

---

## 🎓 Patrones de Uso

### 1. Grupos por Función
```typescript
ViewGroup('Contact Information')
ViewGroup('Shipping Address')
ViewGroup('Billing Address')
ViewGroup('Payment Details')
```

### 2. Grupos por Visibilidad/Permisos
```typescript
ViewGroup('Public Profile')
ViewGroup('Private Information')
ViewGroup('Admin Only')
```

### 3. Grupos por Etapa de Proceso
```typescript
ViewGroup('Step 1: Basic Information')
ViewGroup('Step 2: Additional Details')
ViewGroup('Step 3: Confirmation')
```

### 4. Grupos por Categoría
```typescript
ViewGroup('Product Specifications')
ViewGroup('Pricing')
ViewGroup('Inventory')
ViewGroup('Media & Assets')
```

---

## 📚 Referencias Adicionales

- `view-group-row-decorator.md` - Organizar dentro de grupos
- `css-column-class-decorator.md` - Layout de columnas
- `property-index-decorator.md` - Orden de propiedades
- `../04-components/detail-view-table.md` - Renderizado
- `../../02-FLOW-ARCHITECTURE.md` - Arquitectura de vistas

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/view_group_decorator.ts`
