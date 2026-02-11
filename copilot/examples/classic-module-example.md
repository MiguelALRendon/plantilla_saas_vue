# 📦 Ejemplo de Módulo Clásico - Sistema de Inventario

**Referencias:**
- `../01-FRAMEWORK-OVERVIEW.md` - Overview del framework
- `../03-QUICK-START.md` - Quick start
- `../layers/01-decorators/` - Decoradores
- `advanced-module-example.md` - Ejemplo avanzado

---

## 🎯 Objetivo del Ejemplo

Crear un sistema de inventario básico con:
- ✅ **Products** (Productos)
- ✅ **Categories** (Categorías)
- ✅ **Suppliers** (Proveedores)
- ✅ Relaciones entre entidades
- ✅ Validaciones básicas
- ✅ CRUD completo

**Complejidad:** Básica/Intermedia  
**Decoradores utilizados:** 15 de 35+  
**Tiempo de implementación:** 45 minutos

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────┐
│  Category   │───┐
└─────────────┘   │
                  │ Many-to-One
┌─────────────┐   │
│  Product    │◄──┘
│             │
│             │◄──┐ Many-to-One
└─────────────┘   │
                  │
┌─────────────┐   │
│  Supplier   │───┘
└─────────────────┘
```

---

## 📝 Entidad 1: Category (Categoría)

### Archivo: `src/entities/category.ts`

```typescript
import { BaseEntity } from './base_entitiy';
import {
    PropertyName,
    PropertyIndex,
    ModuleName,
    ModuleIcon,
    Required,
    ApiEndpoint,
    ApiMethods,
    Persistent,
    PrimaryProperty,
    DefaultProperty,
    UniquePropertyKey,
    CSSColumnClass,
    HelpText,
    ViewGroup
} from '@/decorations';
import ICONS from '@/constants/icons';

@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('Categories')
@ModuleIcon(ICONS.FOLDER)
@ApiEndpoint('/api/categories')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
export class Category extends BaseEntity {
    
    @ViewGroup('Basic Information')
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @HideInDetailView()
    id!: number;
    
    @ViewGroup('Basic Information')
    @PropertyIndex(2)
    @PropertyName('Category Name', String)
    @CSSColumnClass('table-length-medium')
    @Required(true)
    @HelpText('Name of the product category')
    name!: string;
    
    @ViewGroup('Basic Information')
    @PropertyIndex(3)
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)
    @HelpText('Detailed description of the category')
    description?: string;
    
    @ViewGroup('Status')
    @PropertyIndex(4)
    @PropertyName('Active', Boolean)
    @HelpText('Is this category currently active?')
    active!: boolean;
}
```

### Decoradores Utilizados

| Decorador | Propósito | Efecto |
|-----------|-----------|--------|
| `@DefaultProperty` | Propiedad identificadora | Muestra "Electronics" en lugar de "[Object]" |
| `@PrimaryProperty` | Clave primaria | Identifica registro único |
| `@UniquePropertyKey` | Clave para URLs | `/categories/1` |
| `@ModuleName` | Nombre en sidebar | "Categories" |
| `@ModuleIcon` | Icono visual | 📁 |
| `@ApiEndpoint` | URL base de API | `/api/categories` |
| `@ApiMethods` | Métodos HTTP permitidos | GET, POST, PUT, DELETE |
| `@Persistent` | Habilita guardado | Permite save/update/delete |
| `@ViewGroup` | Agrupa campos | Sección "Basic Information" |
| `@PropertyIndex` | Orden de campos | 1, 2, 3, 4 |
| `@PropertyName` | Nombre y tipo | "Category Name", String |
| `@Required` | Campo obligatorio | Asterisco rojo + validación |
| `@CSSColumnClass` | Ancho de columna | Columna pequeña/mediana |
| `@HelpText` | Ayuda al usuario | Texto debajo del input |
| `@HideInDetailView` | Ocultar en formulario | ID no editable |
| `@StringTypeDef` | Tipo específico | Textarea en lugar de input |

---

## 📝 Entidad 2: Supplier (Proveedor)

### Archivo: `src/entities/supplier.ts`

```typescript
import { BaseEntity } from './base_entitiy';
import {
    PropertyName,
    PropertyIndex,
    ModuleName,
    ModuleIcon,
    Required,
    ApiEndpoint,
    ApiMethods,
    Persistent,
    PrimaryProperty,
    DefaultProperty,
    UniquePropertyKey,
    CSSColumnClass,
    HelpText,
    ViewGroup,
    StringTypeDef,
    Validation
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import ICONS from '@/constants/icons';

@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('Suppliers')
@ModuleIcon(ICONS.TRUCK)
@ApiEndpoint('/api/suppliers')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
export class Supplier extends BaseEntity {
    
    @ViewGroup('Basic Information')
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @HideInDetailView()
    id!: number;
    
    @ViewGroup('Basic Information')
    @PropertyIndex(2)
    @PropertyName('Company Name', String)
    @CSSColumnClass('table-length-medium')
    @Required(true)
    @HelpText('Legal name of the supplier company')
    name!: string;
    
    @ViewGroup('Contact Information')
    @PropertyIndex(3)
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @Validation(
        (entity) => {
            if (!entity.email) return true;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email);
        },
        'Invalid email format'
    )
    @HelpText('Primary contact email')
    email!: string;
    
    @ViewGroup('Contact Information')
    @PropertyIndex(4)
    @PropertyName('Phone', String)
    @CSSColumnClass('table-length-short')
    @Validation(
        (entity) => {
            if (!entity.phone) return true;
            return /^\d{10}$/.test(entity.phone);
        },
        'Phone must be 10 digits'
    )
    @HelpText('10-digit phone number')
    phone?: string;
    
    @ViewGroup('Contact Information')
    @PropertyIndex(5)
    @PropertyName('Address', String)
    @StringTypeDef(StringType.TEXTAREA)
    @HelpText('Complete mailing address')
    address?: string;
    
    @ViewGroup('Status')
    @PropertyIndex(6)
    @PropertyName('Active', Boolean)
    active!: boolean;
}
```

### Validaciones Implementadas

```typescript
// Email: Formato válido
@Validation(
    (entity) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email),
    'Invalid email format'
)

// Phone: 10 dígitos
@Validation(
    (entity) => /^\d{10}$/.test(entity.phone),
    'Phone must be 10 digits'
)
```

---

## 📝 Entidad 3: Product (Producto)

### Archivo: `src/entities/product.ts`

```typescript
import { BaseEntity } from './base_entitiy';
import { Category } from './category';
import { Supplier } from './supplier';
import {
    PropertyName,
    PropertyIndex,
    ModuleName,
    ModuleIcon,
    Required,
    ApiEndpoint,
    ApiMethods,
    Persistent,
    PrimaryProperty,
    DefaultProperty,
    UniquePropertyKey,
    CSSColumnClass,
    HelpText,
    ViewGroup,
    StringTypeDef,
    Validation,
    DisplayFormat,
    HideInDetailView
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import ICONS from '@/constants/icons';

@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('Products')
@ModuleIcon(ICONS.PRODUCTS)
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
export class Product extends BaseEntity {
    
    @ViewGroup('Basic Information')
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @HideInDetailView()
    id!: number;
    
    @ViewGroup('Basic Information')
    @PropertyIndex(2)
    @PropertyName('Product Name', String)
    @CSSColumnClass('table-length-medium')
    @Required(true)
    @HelpText('Commercial name of the product')
    name!: string;
    
    @ViewGroup('Basic Information')
    @PropertyIndex(3)
    @PropertyName('SKU', String)
    @CSSColumnClass('table-length-short')
    @Required(true)
    @Validation(
        (entity) => {
            if (!entity.sku) return true;
            return /^[A-Z]{3}-\d{6}$/.test(entity.sku);
        },
        'SKU format: ABC-123456'
    )
    @HelpText('Format: ABC-123456')
    sku!: string;
    
    @ViewGroup('Basic Information')
    @PropertyIndex(4)
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)
    @HelpText('Detailed product description')
    description?: string;
    
    @ViewGroup('Classification')
    @PropertyIndex(5)
    @PropertyName('Category', Category)
    @Required(true)
    @HelpText('Product category')
    category!: Category;
    
    @ViewGroup('Classification')
    @PropertyIndex(6)
    @PropertyName('Supplier', Supplier)
    @Required(true)
    @HelpText('Primary supplier')
    supplier!: Supplier;
    
    @ViewGroup('Pricing')
    @PropertyIndex(7)
    @PropertyName('Cost', Number)
    @CSSColumnClass('table-length-short')
    @Required(true)
    @Validation(
        (entity) => entity.cost > 0,
        'Cost must be greater than 0'
    )
    @DisplayFormat('${value} USD')
    @HelpText('Purchase cost')
    cost!: number;
    
    @ViewGroup('Pricing')
    @PropertyIndex(8)
    @PropertyName('Price', Number)
    @CSSColumnClass('table-length-short')
    @Required(true)
    @Validation(
        (entity) => entity.price > entity.cost,
        'Price must be greater than cost'
    )
    @DisplayFormat('${value} USD')
    @HelpText('Sale price')
    price!: number;
    
    @ViewGroup('Inventory')
    @PropertyIndex(9)
    @PropertyName('Stock', Number)
    @CSSColumnClass('table-length-short')
    @Required(true)
    @Validation(
        (entity) => entity.stock >= 0,
        'Stock cannot be negative'
    )
    @DisplayFormat('{value} units')
    @HelpText('Available quantity')
    stock!: number;
    
    @ViewGroup('Inventory')
    @PropertyIndex(10)
    @PropertyName('Min Stock', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @Validation(
        (entity) => entity.minStock >= 0,
        'Min stock cannot be negative'
    )
    @HelpText('Reorder point')
    minStock!: number;
    
    @ViewGroup('Status')
    @PropertyIndex(11)
    @PropertyName('Active', Boolean)
    @HelpText('Is product available for sale?')
    active!: boolean;
    
    // Lifecycle hook: Calcular margen de ganancia
    override beforeSave() {
        // Lógica custom antes de guardar
        console.log('Margin:', ((this.price - this.cost) / this.cost * 100).toFixed(2) + '%');
    }
}
```

### Validaciones Cruzadas

```typescript
// Precio debe ser mayor que costo
@Validation(
    (entity) => entity.price > entity.cost,
    'Price must be greater than cost'
)
price!: number;

// SKU con formato específico
@Validation(
    (entity) => /^[A-Z]{3}-\d{6}$/.test(entity.sku),
    'SKU format: ABC-123456'
)
sku!: string;
```

---

## 🔌 Registrar Módulos

### Archivo: `src/models/application.ts`

```typescript
// Al final del archivo, antes de export default

import { Category } from '@/entities/category';
import { Supplier } from '@/entities/supplier';
import { Product } from '@/entities/product';

// Registrar módulos
Application.ModuleList.value.push(
    Category,
    Supplier,
    Product
);

export default Application;
```

---

## 🎨 Resultado en UI

### Sidebar

```
┌─────────────────────┐
│  📁 Categories      │
│  🚚 Suppliers       │
│  📦 Products        │
└─────────────────────┘
```

### ListView - Products

```
┌────────────────────────────────────────────────────────────┐
│ ID │ Product Name    │ SKU        │ Price     │ Stock     │
├────┼─────────────────┼────────────┼───────────┼───────────┤
│ 1  │ Laptop Pro 15   │ LAP-123456 │ $999 USD  │ 45 units  │
│ 2  │ Mouse Wireless  │ MOU-789012 │ $29 USD   │ 120 units │
│ 3  │ Keyboard Mech   │ KEY-345678 │ $89 USD   │ 67 units  │
└────┴─────────────────┴────────────┴───────────┴───────────┘
```

### DetailView - Product (Nuevo)

```
═══════════════════════════════════════════
BASIC INFORMATION
───────────────────────────────────────────
Product Name *           [                    ]
                         Commercial name of the product

SKU *                    [                    ]
                         Format: ABC-123456

Description              ╔════════════════════╗
                         ║                    ║
                         ║                    ║
                         ╚════════════════════╝
                         Detailed product description

═══════════════════════════════════════════
CLASSIFICATION
───────────────────────────────────────────
Category *               [ Select category ▼ ]
                         Product category

Supplier *               [ Select supplier ▼ ]
                         Primary supplier

═══════════════════════════════════════════
PRICING
───────────────────────────────────────────
Cost *                   [                    ]
                         Purchase cost

Price *                  [                    ]
                         Sale price

═══════════════════════════════════════════
INVENTORY
───────────────────────────────────────────
Stock *                  [                    ]
                         Available quantity

Min Stock *              [                    ]
                         Reorder point

═══════════════════════════════════════════
STATUS
───────────────────────────────────────────
Active                   [ ✓ ]
                         Is product available for sale?

═══════════════════════════════════════════
[Validate]  [Save]  [Save & New]  [New]
```

---

## 🔄 Flujo de Trabajo Completo

### 1. Crear Categoría

```typescript
const category = new Category({
    id: 1,
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    active: true
});

await category.save();
// POST /api/categories
```

### 2. Crear Proveedor

```typescript
const supplier = new Supplier({
    id: 1,
    name: 'TechCorp Inc',
    email: 'sales@techcorp.com',
    phone: '5551234567',
    address: '123 Tech Street, Silicon Valley, CA',
    active: true
});

await supplier.save();
// POST /api/suppliers
```

### 3. Crear Producto

```typescript
const product = new Product({
    id: 1,
    name: 'Laptop Pro 15',
    sku: 'LAP-123456',
    description: 'Professional laptop with 15" display',
    category: category,       // ← Relación
    supplier: supplier,       // ← Relación
    cost: 700,
    price: 999,
    stock: 45,
    minStock: 10,
    active: true
});

await product.save();
// POST /api/products
```

### 4. Validaciones Automáticas

```typescript
// ❌ Falla: Price <= Cost
const product = new Product({
    cost: 999,
    price: 500  // Menor que cost
});
await product.save();
// Error: "Price must be greater than cost"

// ❌ Falla: SKU inválido
const product2 = new Product({
    sku: 'invalid'  // No sigue formato ABC-123456
});
// Error: "SKU format: ABC-123456"

// ❌ Falla: Stock negativo
const product3 = new Product({
    stock: -5
});
// Error: "Stock cannot be negative"
```

---

## 📊 Estadísticas del Ejemplo

### Código Escrito

- **Category:** ~50 líneas
- **Supplier:** ~70 líneas  
- **Product:** ~140 líneas  
- **Registro:** ~5 líneas  
- **Total:** ~265 líneas

### Funcionalidad Generada

- **3 módulos** completos en sidebar
- **3 listviews** con tablas funcionales
- **3 detailviews** con formularios completos
- **15+ inputs** generados automáticamente
- **8 validaciones** activas
- **3 endpoints** de API configurados
- **CRUD completo** para 3 entidades
- **Relaciones** entre entidades funcionales

### Ratio de Productividad

```
Código equivalente manual: ~3500 líneas
Código escrito: 265 líneas
Ratio: 13:1 (13x más productivo)
```

---

## 🎓 Lecciones Aprendidas

### 1. Orden de Creación

Siempre crea entidades en orden de dependencias:
```
1. Category (sin dependencias)
2. Supplier (sin dependencias)
3. Product (depende de Category y Supplier)
```

### 2. Validaciones Cruzadas

Usa el objeto `entity` completo:
```typescript
@Validation(
    (entity) => entity.price > entity.cost,  // ← Acceso a otra propiedad
    'Price must exceed cost'
)
```

### 3. ViewGroups Mejoran UX

Agrupa campos relacionados:
```typescript
@ViewGroup('Pricing')  // Costo y precio juntos
@ViewGroup('Inventory')  // Stock y min stock juntos
```

### 4. HelpText es Esencial

Siempre agrega ayuda contextual:
```typescript
@HelpText('Format: ABC-123456')
@HelpText('Reorder point')
```

---

## 🚀 Próximos Pasos

Para convertir esto en un sistema completo:

### 1. Agregar Backend

```typescript
// Node.js + Express ejemplo
app.post('/api/products', async (req, res) => {
    const product = await db.products.create(req.body);
    res.json(product);
});
```

### 2. Agregar Más Relaciones

```typescript
@PropertyName('Related Products', ArrayOf(Product))
relatedProducts!: Array<Product>;
```

### 3. Agregar Validación Asíncrona

```typescript
@AsyncValidation(
    async (entity) => {
        const exists = await checkSkuExists(entity.sku);
        return !exists;
    },
    'SKU already exists'
)
sku!: string;
```

### 4. Agregar Vistas Custom

```typescript
@ModuleDefaultComponent(ProductDashboard)
export class Product extends BaseEntity { ... }
```

---

## 📚 Referencias

- `../03-QUICK-START.md` - Tutorial inicial
- `advanced-module-example.md` - Ejemplo avanzado
- `../layers/01-decorators/` - Referencia de decoradores
- `../tutorials/03-relations.md` - Tutorial de relaciones

---

**Última actualización:** 10 de Febrero, 2026  
**Complejidad:** Básica/Intermedia
