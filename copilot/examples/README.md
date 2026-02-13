# Ejemplos - Índice Semántico

**Propósito:** Índice de ejemplos completos de módulos  
**Última Actualización:** 13 de Febrero, 2026  
**ID Base:** EX

---

## Ejemplos Disponibles (2)

| ID | Archivo | Complejidad | Líneas | Descripción |
|---|---|---|---|---|
| EX::classic | [classic-module-example.md](classic-module-example.md) | Intermedia | ~450 | Módulo Inventario (CRUD clásico) |
| EX::advanced | [advanced-module-example.md](advanced-module-example.md) | Avanzada | ~680 | Módulo Órdenes (relaciones, máscaras, validaciones) |

---

## Ejemplo 01: Módulo Clásico (Inventario)

**Archivo:** [classic-module-example.md](classic-module-example.md)  
**ID:** EX::classic  
**Complejidad:** Intermedia  
**Caso de Uso:** Gestión de inventario de productos

### Contenido

**Entidad:** Product

**Propiedades:**
- `id`: number (PrimaryProperty)
- `name`: string (Required, Unique)
- `description`: string
- `price`: number (Required, DisplayFormat: currency)
- `stock`: number (Required, DisplayFormat: quantity)
- `category`: string
- `isActive`: boolean (DefaultProperty: true)

**Decoradores Demostrados (15):**
1. `@ModuleName('Inventario')`
2. `@ModuleIcon('fa-boxes')`
3. `@ApiEndpoint('/api/products')`
4. `@Persistent()`
5. `@PersistentKey(['id'])`
6. `@PrimaryProperty('name')`
7. `@PropertyName('id', 'ID')`
8. `@PropertyName('name', 'Nombre del Producto')`
9. `@PropertyName('description', 'Descripción')`
10. `@PropertyName('price', 'Precio')`
11. `@PropertyName('stock', 'Stock Disponible')`
12. `@PropertyName('category', 'Categoría')`
13. `@PropertyName('isActive', 'Activo')`
14. `@PropertyIndex` (múltiples propiedades)
15. `@Required` (name, price, stock)
16. `@DisplayFormat` (price: currency, stock: quantity)
17. `@DefaultProperty` (isActive: true)
18. `@CssColumnClass` (name: 'col-6', price: 'col-3')

**Conceptos Implementados:**
- CRUD completo automático
- Validaciones básicas (Required)
- Formateo de datos (currency, quantity)
- Valores por defecto
- Layout responsive (CssColumnClass)
- Persistencia con API REST
- Clave primaria compuesta

**ID de Secciones:**
- `EX::classic::entity` - Definición entidad
- `EX::classic::decorators` - Decoradores aplicados
- `EX::classic::crud` - Operaciones CRUD
- `EX::classic::layout` - Layout UI
- `EX::classic::api` - Integración API

**Flujos Implementados:**
1. **Crear Producto:**
   - Usuario: click "Nuevo"
   - Sistema: genera vista detalle vacía
   - Usuario: completa campos required
   - Sistema: valida y guarda via API

2. **Listar Productos:**
   - Sistema: carga desde API
   - Sistema: renderiza ListView
   - Usuario: ve tabla con columnas configuradas

3. **Editar Producto:**
   - Usuario: click en fila
   - Sistema: carga DetailView con datos
   - Usuario: modifica campos
   - Sistema: detecta dirty state
   - Sistema: guarda cambios via API

4. **Eliminar Producto:**
   - Usuario: click botón eliminar
   - Sistema: muestra confirmación
   - Usuario: confirma
   - Sistema: ejecuta DELETE via API

---

## Ejemplo 02: Módulo Avanzado (Órdenes)

**Archivo:** [advanced-module-example.md](advanced-module-example.md)  
**ID:** EX::advanced  
**Complejidad:** Avanzada  
**Caso de Uso:** Sistema de órdenes con relaciones, validaciones complejas y máscaras

### Contenido

**Entidad:** Order

**Propiedades:**
- `id`: number (PrimaryProperty)
- `orderNumber`: string (Required, Unique, Mask, Readonly)
- `customer`: Customer (Required, BaseEntity)
- `orderDate`: Date (Required, DefaultProperty: now)
- `items`: OrderItem[] (Required, Array de BaseEntity)
- `total`: number (Readonly, DisplayFormat: currency)
- `status`: OrderStatus (Required, Enum)
- `notes`: string (StringType: textarea)
- `isUrgent`: boolean (DefaultProperty: false)

**Decoradores Demostrados (25+):**
1. `@ModuleName('Órdenes de Compra')`
2. `@ModuleIcon('fa-shopping-cart')`
3. `@ApiEndpoint('/api/orders')`
4. `@ApiMethods(['GET', 'POST', 'PUT'])`
5. `@Persistent()`
6. `@PersistentKey(['id'])`
7. `@PrimaryProperty('orderNumber')`
8. `@PropertyName` (todas las propiedades)
9. `@PropertyIndex` (ordenamiento UI)
10. `@Required` (orderNumber, customer, orderDate, items, status)
11. `@Unique('orderNumber')`
12. `@Readonly` (orderNumber, total)
13. `@Disabled` (total, según estado)
14. `@DisplayFormat` (total: currency, orderDate: date)
15. `@DefaultProperty` (orderDate: now, isUrgent: false)
16. `@Mask` (orderNumber: 'ORD-####-####')
17. `@StringType` (notes: textarea)
18. `@Validation` (validación de items mínimo)
19. `@AsyncValidation` (verificar disponibilidad stock)
20. `@HelpText` (tooltips para campos complejos)
21. `@ViewGroup` (agrupación lógica: datos orden, items, totales)
22. `@TabOrder` (orden de foco)
23. `@HideInListView` (notes, items)
24. `@HideInDetailView` (ninguno)
25. `@CssColumnClass` (layout responsive)

**Conceptos Avanzados:**
- Relaciones 1:1 (customer: Customer)
- Relaciones 1:N (items: OrderItem[])
- Validación asíncrona (stock disponible)
- Validación compleja (items mínimo, totales)
- Máscaras custom (orderNumber)
- Campos calculados (total readonly)
- Enums personalizados (OrderStatus)
- ViewGroups para organización
- StringType avanzado (textarea)
- Campos condicionales (Disabled según estado)
- TabOrder para UX
- HideInListView para performance

**ID de Secciones:**
- `EX::advanced::entity` - Definición entidad Order
- `EX::advanced::relations` - Customer + OrderItem
- `EX::advanced::validations` - Validaciones síncronas/asíncronas
- `EX::advanced::masking` - Máscaras orderNumber
- `EX::advanced::calculations` - Cálculo total
- `EX::advanced::ui` - ViewGroups, TabOrder, Layout
- `EX::advanced::api` - Integración API REST

**Entidades Relacionadas:**

```typescript
// Customer (relación 1:1)
class Customer extends BaseEntity {
  @PropertyName('id', 'ID')
  id!: number;
  
  @PropertyName('name', 'Nombre')
  @Required()
  name!: string;
  
  @PropertyName('email', 'Email')
  @Required()
  @Validation((value) => /^[^@]+@[^@]+\.[^@]+$/.test(value))
  email!: string;
}

// OrderItem (relación 1:N)
class OrderItem extends BaseEntity {
  @PropertyName('product', 'Producto')
  @Required()
  product!: Product;
  
  @PropertyName('quantity', 'Cantidad')
  @Required()
  quantity!: number;
  
  @PropertyName('subtotal', 'Subtotal')
  @Readonly()
  @DisplayFormat((value) => `$${value.toFixed(2)}`)
  subtotal!: number;
}
```

**Flujos Avanzados:**

1. **Crear Orden:**
   - Usuario: click "Nuevo"
   - Sistema: genera máscara orderNumber automática
   - Usuario: selecciona customer (ObjectInputComponent)
   - Usuario: agrega items (ArrayInputComponent)
   - Sistema: ejecuta AsyncValidation (verifica stock)
   - Sistema: calcula total automáticamente
   - Sistema: valida items mínimo
   - Usuario: guarda
   - Sistema: persiste via POST

2. **Editar Orden:**
   - Usuario: click en orden
   - Sistema: carga DetailView con relaciones
   - Sistema: deshabilita orderNumber (Readonly)
   - Usuario: modifica items
   - Sistema: recalcula total
   - Sistema: re-valida stock (AsyncValidation)
   - Sistema: marca dirty state
   - Usuario: guarda
   - Sistema: persiste via PUT

3. **Validación Asíncrona (Stock):**
   - Usuario: agrega/modifica item
   - Sistema: dispara AsyncValidation
   - Sistema: hace petición GET a `/api/products/{id}/stock`
   - API: retorna stock disponible
   - Sistema: compara quantity solicitada vs stock
   - Sistema: muestra error si insuficiente
   - Sistema: bloquea save hasta resolver

4. **Cálculo Automático Total:**
   - Usuario: modifica quantity en item
   - Sistema: recalcula subtotal del item
   - Sistema: suma todos los subtotals
   - Sistema: actualiza propiedad total (readonly)
   - Sistema: re-renderiza UI

---

## Comparación de Ejemplos

### Por Complejidad

| Aspecto | Classic | Advanced |
|---|---|---|
| **Propiedades** | 7 | 9 |
| **Decoradores** | ~18 | ~25 |
| **Relaciones** | 0 | 2 (1:1 + 1:N) |
| **Validaciones** | Required solamente | Required + Sync + Async |
| **Máscaras** | 0 | 1 (orderNumber) |
| **Campos Calculados** | 0 | 1 (total) |
| **ViewGroups** | 0 | 3 (orden, items, totales) |
| **Complejidad** | Intermedia | Avanzada |

### Por Caso de Uso

**Classic (Inventario):**
- ✓ CRUD simple
- ✓ Validaciones básicas
- ✓ Formateo datos
- ✓ Layout responsive
- ✗ No relaciones
- ✗ No validaciones async
- ✗ No máscaras

**Advanced (Órdenes):**
- ✓ CRUD complejo
- ✓ Validaciones multi-nivel
- ✓ Relaciones 1:1 y 1:N
- ✓ Máscaras custom
- ✓ Campos calculados
- ✓ Validación asíncrona
- ✓ ViewGroups

---

## Decoradores por Ejemplo

### Classic Module

| Categoría | Decoradores |
|---|---|
| **Módulo** | ModuleName, ModuleIcon, ApiEndpoint, Persistent, PersistentKey |
| **Propiedad** | PropertyName, PropertyIndex, PrimaryProperty |
| **Validación** | Required |
| **UI/Layout** | DisplayFormat, CssColumnClass, DefaultProperty |
| **Total** | ~18 decoradores |

### Advanced Module

| Categoría | Decoradores |
|---|---|
| **Módulo** | ModuleName, ModuleIcon, ApiEndpoint, ApiMethods, Persistent, PersistentKey |
| **Propiedad** | PropertyName, PropertyIndex, PrimaryProperty |
| **Validación** | Required, Unique, Validation, AsyncValidation |
| **UI/Layout** | DisplayFormat, CssColumnClass, DefaultProperty, ViewGroup, TabOrder, HideInListView, StringType, HelpText |
| **Estado** | Readonly, Disabled, Mask |
| **Total** | ~25+ decoradores |

---

## Relación con Documentación

### Ejemplos → Contratos

| Ejemplo | CORE | FWK | FLOW | QS | UI | ENFC |
|---|---|---|---|---|---|---|
| Classic | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Advanced | ✓ | ✓ | ✓ | - | ✓ | ✓ |

### Ejemplos → Capas

| Ejemplo | Decorators | BaseEntity | Application | Components | Advanced |
|---|---|---|---|---|---|
| Classic | ✓ | ✓ | ✓ | ✓ | - |
| Advanced | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓ |

### Ejemplos → Tutoriales

| Ejemplo | TUT::01 | TUT::02 | TUT::03 |
|---|---|---|---|
| Classic | ✓✓ | ✓ | - |
| Advanced | ✓ | ✓✓ | ✓✓ |

---

## Búsqueda por Concepto

### CRUD Básico

Ir a: [classic-module-example.md](classic-module-example.md)

### Relaciones entre Entidades

Ir a: [advanced-module-example.md](advanced-module-example.md) → `EX::advanced::relations`

### Validaciones Asíncronas

Ir a: [advanced-module-example.md](advanced-module-example.md) → `EX::advanced::validations`

### Máscaras de Input

Ir a: [advanced-module-example.md](advanced-module-example.md) → `EX::advanced::masking`

### Campos Calculados

Ir a: [advanced-module-example.md](advanced-module-example.md) → `EX::advanced::calculations`

### ViewGroups y Organización UI

Ir a: [advanced-module-example.md](advanced-module-example.md) → `EX::advanced::ui`

---

## Uso Recomendado

### Para Aprender CRUD

1. **Leer contratos básicos** (45 min):
   - [../00-CONTRACT.md](../00-CONTRACT.md)
   - [../03-QUICK-START.md](../03-QUICK-START.md)

2. **Hacer Tutorial 01** (30 min):
   - [../tutorials/01-basic-crud.md](../tutorials/01-basic-crud.md)

3. **Estudiar Classic Example** (1 hora):
   - Leer código completo
   - Probar en proyecto local
   - Modificar propiedades

### Para Aprender Relaciones

1. **Hacer Tutorial 03** (60 min):
   - [../tutorials/03-relations.md](../tutorials/03-relations.md)

2. **Estudiar Advanced Example** (2 horas):
   - Enfocarse en `EX::advanced::relations`
   - Entender Customer (1:1)
   - Entender OrderItem[] (1:N)
   - Probar navegación entre entidades

### Para Aprender Validaciones Avanzadas

1. **Hacer Tutorial 02** (45 min):
   - [../tutorials/02-validations.md](../tutorials/02-validations.md)

2. **Estudiar Advanced Example** (1.5 horas):
   - Enfocarse en `EX::advanced::validations`
   - Entender AsyncValidation para stock
   - Implementar validación custom propia

---

## Código Fuente

### Classic Module

**Ubicación:** `/src/entities/Product.ts`

**Dependencias:**
- BaseEntity
- Decoradores de `/src/decorations/`
- Application para HTTP

### Advanced Module

**Ubicación:** `/src/entities/Order.ts`, `/src/entities/Customer.ts`, `/src/entities/OrderItem.ts`

**Dependencias:**
- BaseEntity
- Multiple decorators (25+)
- Application para HTTP
- ObjectInputComponent
- ArrayInputComponent

---

## Referencias Cruzadas

### Documentación Relacionada

- **Tutoriales:** [../tutorials/](../tutorials/)
- **Decoradores:** [../layers/01-decorators/](../layers/01-decorators/)
- **BaseEntity:** [../layers/02-base-entity/](../layers/02-base-entity/)
- **Application:** [../layers/03-application/](../layers/03-application/)
- **Contratos:** [../00-CONTRACT.md](../00-CONTRACT.md), [../04-UI-DESIGN-SYSTEM-CONTRACT.md](../04-UI-DESIGN-SYSTEM-CONTRACT.md)

---

**Última Actualización:** 13 de Febrero, 2026  
**Total Ejemplos:** 2  
**Mantenimiento:** Actualizar al agregar/modificar ejemplos
