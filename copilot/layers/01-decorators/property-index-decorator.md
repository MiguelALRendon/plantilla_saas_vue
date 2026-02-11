# 🔢 PropertyIndex Decorator

**Referencias:**
- `property-name-decorator.md` - PropertyName
- `view-group-decorator.md` - ViewGroup
- `view-group-row-decorator.md` - ViewGroupRow
- `../04-components/detail-view-table.md` - Orden de renderizado

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/property_index_decorator.ts`

---

## 🎯 Propósito

Define el **orden de aparición** de las propiedades en:
- Formularios de detalle
- Columnas de tablas de lista
- Iteraciones sobre propiedades

Sin PropertyIndex, las propiedades aparecen en orden alfabético o indefinido.  
Con PropertyIndex, controlas exactamen el orden de presentación.

---

## 🔑 Símbolo de Metadatos

```typescript
export const PROPERTY_INDEX_KEY = Symbol('property_index');
```

### Almacenamiento

```typescript
proto[PROPERTY_INDEX_KEY] = {
    'id': 1,
    'firstName': 2,
    'lastName': 3,
    'email': 4,
    'phone': 5
}
```

---

## 💻 Firma del Decorador

```typescript
function PropertyIndex(index: number): PropertyDecorator
```

### Tipos

```typescript
export type PropertyIndexValue = number;  // 1, 2, 3, ...
```

---

## 📖 Uso Básico

### Orden Simple

```typescript
export class Customer extends BaseEntity {
    @PropertyIndex(1)  // ← Aparece primero
    @PropertyName('Customer ID', Number)
    id!: number;
    
    @PropertyIndex(2)  // ← Aparece segundo
    @PropertyName('First Name', String)
    firstName!: string;
    
    @PropertyIndex(3)  // ← Aparece tercero
    @PropertyName('Last Name', String)
    lastName!: string;
    
    @PropertyIndex(4)  // ← Aparece cuarto
    @PropertyName('Email', String)
    email!: string;
}
```

### Resultado en Formulario

```
╔═══════════════════════════════════════╗
║        Customer Details               ║
╠═══════════════════════════════════════╣
║  Customer ID: [1                  ]   ║  ← Index 1
║  First Name:  [John               ]   ║  ← Index 2
║  Last Name:   [Doe                ]   ║  ← Index 3
║  Email:       [john@example.com   ]   ║  ← Index 4
╚═══════════════════════════════════════╝
```

### Resultado en Tabla (Lista)

```
╔═══════════════════════════════════════════════════╗
║                    Customers                      ║
╠═══════════════╦════════════╦═══════════╦═════════╣
║ Customer ID   │ First Name │ Last Name │ Email   ║
║    (Index 1)  │  (Index 2) │ (Index 3) │(Index 4)║
╠═══════════════╬════════════╬═══════════╬═════════╣
║      1        │    John    │    Doe    │ john... ║
║      2        │    Jane    │   Smith   │ jane... ║
╚═══════════════╩════════════╩═══════════╩═════════╝
```

---

## 🔍 Funciones Accesoras en BaseEntity

### Métodos de Instancia

#### `getProperties(): string[]`
Retorna array de nombres de propiedades **ordenado por PropertyIndex**.

```typescript
// Uso
const customer = new Customer();
customer.getProperties();
// Retorna: ['id', 'firstName', 'lastName', 'email']
// ↑ Ordenado por PropertyIndex (1, 2, 3, 4)

// Si no hubiera PropertyIndex:
// Retorna: ['email', 'firstName', 'id', 'lastName']  ← Orden alfabético

// Ubicación en BaseEntity (línea ~145)
public getProperties(): string[] {
    const propertyNames = (this.constructor as any).prototype[PROPERTY_NAME_KEY];
    if (!propertyNames) return [];
    
    const properties = Object.keys(propertyNames);
    
    // Obtener índices
    const propertyIndices = (this.constructor as any).prototype[PROPERTY_INDEX_KEY];
    
    if (!propertyIndices) {
        return properties;  // Sin orden, retornar como está
    }
    
    // Ordenar por índice
    return properties.sort((a, b) => {
        const indexA = propertyIndices[a] ?? 9999;
        const indexB = propertyIndices[b] ?? 9999;
        return indexA - indexB;
    });
}
```

#### `getPropertyIndex(key: string): number | undefined`
Obtiene el índice de una propiedad específica.

```typescript
// Uso
customer.getPropertyIndex('firstName');
// Retorna: 2

customer.getPropertyIndex('email');
// Retorna: 4

customer.getPropertyIndex('unknownProp');
// Retorna: undefined

// Ubicación en BaseEntity (línea ~170)
public getPropertyIndex(key: string): number | undefined {
    const propertyIndices = (this.constructor as any).prototype[PROPERTY_INDEX_KEY];
    return propertyIndices?.[key];
}
```

---

## 🎨 Impacto en UI

### 1. Orden de Inputs en DetailView

```vue
<template>
  <div class="detail-view">
    <div 
      v-for="propertyKey in entity.getProperties()"  
      :key="propertyKey"
      class="form-field"
    >
      <!-- ↑ getProperties() retorna propiedades ordenadas por PropertyIndex -->
      
      <label>{{ entity.getPropertyName(propertyKey) }}</label>
      <component 
        :is="getInputComponent(propertyKey)"
        v-model="entity[propertyKey]"
      />
    </div>
  </div>
</template>
```

**Ubicación:** `src/views/default_detailview.vue` (línea ~140)

### 2. Orden de Columnas en ListView

```vue
<template>
  <table class="list-table">
    <thead>
      <tr>
        <th 
          v-for="propertyKey in entityClass.prototype.getProperties()"
          :key="propertyKey"
        >
          <!-- ↑ Columnas ordenadas por PropertyIndex -->
          {{ entityClass.prototype.getPropertyName(propertyKey) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entity in entities" :key="entity.id">
        <td 
          v-for="propertyKey in entity.getProperties()"
          :key="propertyKey"
        >
          {{ entity[propertyKey] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

**Ubicación:** `src/views/default_listview.vue` (línea ~85)

---

## 🔗 Decoradores Relacionados

### Combinar con ViewGroup

PropertyIndex define orden **dentro de cada grupo**:

```typescript
export class Employee extends BaseEntity {
    // Grupo: Personal (orden interno: 1, 2, 3)
    @PropertyIndex(1)  // ← Primero en grupo "Personal"
    @PropertyName('First Name', String)
    @ViewGroup('Personal')
    firstName!: string;
    
    @PropertyIndex(2)  // ← Segundo en grupo "Personal"
    @PropertyName('Last Name', String)
    @ViewGroup('Personal')
    lastName!: string;
    
    @PropertyIndex(3)  // ← Tercero en grupo "Personal"
    @PropertyName('Date of Birth', Date)
    @ViewGroup('Personal')
    dateOfBirth?: Date;
    
    // Grupo: Contact (orden interno: 4, 5)
    @PropertyIndex(4)  // ← Primero en grupo "Contact"
    @PropertyName('Email', String)
    @ViewGroup('Contact')
    email!: string;
    
    @PropertyIndex(5)  // ← Segundo en grupo "Contact"
    @PropertyName('Phone', String)
    @ViewGroup('Contact')
    phone?: string;
}
```

**Resultado:**

```
╔═══════════════════════════════════════╗
║ 📋 Personal  [-]                      ║
║ ┌───────────────────────────────────┐ ║
║ │ First Name:     [John          ]  │ ║  ← Index 1
║ │ Last Name:      [Doe           ]  │ ║  ← Index 2
║ │ Date of Birth:  [1990-05-15    ]  │ ║  ← Index 3
║ └───────────────────────────────────┘ ║
║                                       ║
║ 📞 Contact  [-]                       ║
║ ┌───────────────────────────────────┐ ║
║ │ Email: [john.doe@example.com   ]  │ ║  ← Index 4
║ │ Phone: [+1-555-123-4567        ]  │ ║  ← Index 5
║ └───────────────────────────────────┘ ║
╚═══════════════════════════════════════╝
```

### Combinar con ViewGroupRow

PropertyIndex + ViewGroupRow + CSSColumnClass = Layout completo:

```typescript
export class Product extends BaseEntity {
    // Fila 1, columna izquierda (índice 1)
    @PropertyIndex(1)
    @ViewGroup('Basic Info')
    @ViewGroupRow(1)
    @CSSColumnClass('col-md-6')
    @PropertyName('Product Name', String)
    name!: string;
    
    // Fila 1, columna derecha (índice 2)
    @PropertyIndex(2)
    @ViewGroup('Basic Info')
    @ViewGroupRow(1)
    @CSSColumnClass('col-md-6')
    @PropertyName('SKU', String)
    sku!: string;
    
    // Fila 2, ancho completo (índice 3)
    @PropertyIndex(3)
    @ViewGroup('Basic Info')
    @ViewGroupRow(2)
    @CSSColumnClass('col-md-12')
    @PropertyName('Description', String)
    description?: string;
}
```

**Resultado:**

```
╔═══════════════════════════════════════════════════╗
║ Basic Info  [-]                                   ║
║ ┌───────────────────────────────────────────────┐ ║
║ │ Fila 1:                                       │ ║
║ │  [Product Name: Laptop  ] [SKU: LAP-001   ]  │ ║
║ │       ↑ Index 1               ↑ Index 2       │ ║
║ │                                               │ ║
║ │ Fila 2:                                       │ ║
║ │  [Description: High-performance laptop...  ] │ ║
║ │       ↑ Index 3                               │ ║
║ └───────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════╝
```

---

## 🧪 Ejemplos Avanzados

### 1. Saltos en Numeración (Reservar Espacios)

```typescript
export class Invoice extends BaseEntity {
    @PropertyIndex(10)  // ← Salto para insertar propiedades después
    @PropertyName('Invoice Number', String)
    invoiceNumber!: string;
    
    @PropertyIndex(20)
    @PropertyName('Customer', Customer)
    customer!: Customer;
    
    @PropertyIndex(30)
    @PropertyName('Issue Date', Date)
    issueDate!: Date;
    
    // Más adelante puedo agregar entre 10 y 20:
    @PropertyIndex(15)  // ← Insertado después
    @PropertyName('Invoice Type', String)
    invoiceType?: string;
}

// Orden final: 10, 15, 20, 30
// invoiceNumber, invoiceType, customer, issueDate
```

### 2. Índices Negativos (Propiedades al Final)

```typescript
export class User extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Username', String)
    username!: string;
    
    @PropertyIndex(2)
    @PropertyName('Email', String)
    email!: string;
    
    // Metadatos al final (índices altos)
    @PropertyIndex(9990)
    @PropertyName('Created At', Date)
    @ReadOnly(true)
    createdAt!: Date;
    
    @PropertyIndex(9991)
    @PropertyName('Updated At', Date)
    @ReadOnly(true)
    updatedAt!: Date;
}

// Orden: username, email, ..., createdAt, updatedAt
```

### 3. Propiedades Sin Índice (van al final)

```typescript
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyIndex(2)
    @PropertyName('Price', Number)
    price!: number;
    
    // Sin PropertyIndex → va al final
    @PropertyName('Internal Notes', String)
    internalNotes?: string;
}

// Orden: name (1), price (2), internalNotes (sin índice → al final)
```

### 4. Orden Dinámico Según Contexto

```typescript
export class Document extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Document ID', Number)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Title', String)
    title!: string;
    
    // Override getProperties() para orden dinámico
    getProperties(): string[] {
        const baseProperties = super.getProperties();
        
        // Si es administrador, mostrar propiedades técnicas primero
        if (Application.currentUser?.isAdmin) {
            return ['id', ...baseProperties.filter(p => p !== 'id')];
        }
        
        // Si es usuario regular, ocultar ID
        return baseProperties.filter(p => p !== 'id');
    }
}
```

### 5. Re-ordenar Programáticamente

```typescript
export class CustomEntity extends BaseEntity {
    // Cambiar orden en runtime
    static setPropertyOrder(newOrder: string[]) {
        const indices: Record<string, number> = {};
        
        newOrder.forEach((propKey, index) => {
            indices[propKey] = index + 1;
        });
        
        this.prototype[PROPERTY_INDEX_KEY] = indices;
    }
}

// Uso:
CustomEntity.setPropertyOrder(['name', 'email', 'phone', 'id']);
// Ahora getProperties() retorna en ese orden
```

---

## ⚠️ Consideraciones Importantes

### 1. Índices Únicos (Recomendado)

Evita duplicar índices:

```typescript
// ❌ MAL: Índices duplicados
@PropertyIndex(1)
name!: string;

@PropertyIndex(1)  // ← Duplicado
email!: string;

// Resultado: Orden indefinido entre name y email

// ✅ BIEN: Índices únicos
@PropertyIndex(1)
name!: string;

@PropertyIndex(2)
email!: string;
```

### 2. Empezar en 1, no en 0

Convención: empezar en 1 facilita lectura:

```typescript
// ✅ RECOMENDADO
@PropertyIndex(1)  // Inicio en 1
@PropertyIndex(2)
@PropertyIndex(3)

// ⚠️ Funciona pero confuso
@PropertyIndex(0)  // Inicio en 0
@PropertyIndex(1)
@PropertyIndex(2)
```

### 3. Espaciar Índices para Inserciones Futuras

```typescript
// ❌ Compacto (difícil insertar después)
@PropertyIndex(1)
@PropertyIndex(2)
@PropertyIndex(3)

// ✅ Espaciado (fácil insertar)
@PropertyIndex(10)
@PropertyIndex(20)
@PropertyIndex(30)

// Ahora puedo insertar:
@PropertyIndex(15)  // Entre 10 y 20
@PropertyIndex(25)  // Entre 20 y 30
```

### 4. Propiedades Heredadas

Las propiedades de clases padre mantienen su índice:

```typescript
class BaseUser extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Email', String)
    email!: string;
}

class Customer extends BaseUser {
    @PropertyIndex(3)  // ← Continúa numeración
    @PropertyName('Company', String)
    company!: string;
}

// Orden en Customer: id (1), email (2), company (3)
```

### 5. Performance No Afectado

PropertyIndex no impacta performance, solo organiza metadata.

---

## 🔧 Implementación Interna

### Código del Decorador

```typescript
export function PropertyIndex(index: number): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        
        if (!proto[PROPERTY_INDEX_KEY]) {
            proto[PROPERTY_INDEX_KEY] = {};
        }
        
        proto[PROPERTY_INDEX_KEY][propertyKey] = index;
    };
}
```

**Ubicación:** `src/decorations/property_index_decorator.ts` (línea ~10)

### Lectura y Ordenamiento

```typescript
// En BaseEntity.getProperties()
public getProperties(): string[] {
    const propertyNames = (this.constructor as any).prototype[PROPERTY_NAME_KEY];
    if (!propertyNames) return [];
    
    const properties = Object.keys(propertyNames);
    const propertyIndices = (this.constructor as any).prototype[PROPERTY_INDEX_KEY];
    
    if (!propertyIndices) {
        return properties;  // Sin orden
    }
    
    // Ordenar por índice
    return properties.sort((a, b) => {
        const indexA = propertyIndices[a] ?? 9999;  // Sin índice → al final
        const indexB = propertyIndices[b] ?? 9999;
        return indexA - indexB;
    });
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~145)

---

## 📊 Flujo de Renderizado

```
1. Component necesita renderizar propiedades
        ↓
2. Llama entity.getProperties()
        ↓
3. BaseEntity.getProperties() ejecuta:
   a. Obtiene PROPERTY_NAME_KEY → lista de propiedades
   b. Obtiene PROPERTY_INDEX_KEY → índices de ordenamiento
        ↓
4. Si hay índices:
   a. Ordena propiedades por índice (sort por valor numérico)
   b. Propiedades sin índice → al final (índice 9999)
        ↓
5. Retorna array ordenado: ['id', 'name', 'email', ...]
        ↓
6. Component itera sobre array en ese orden
        ↓
7. Renderiza inputs/columnas en orden correcto
```

---

## 🎓 Mejores Prácticas

### 1. Usar Constantes para Índices

```typescript
// constants/property-indices.ts
export const PROPERTY_INDICES = {
    ID: 1,
    NAME: 10,
    DESCRIPTION: 20,
    CATEGORY: 30,
    PRICE: 40,
    STOCK: 50,
    CREATED_AT: 9990,
    UPDATED_AT: 9991
} as const;

// entities/product.ts
import { PROPERTY_INDICES } from '@/constants/property-indices';

export class Product extends BaseEntity {
    @PropertyIndex(PROPERTY_INDICES.ID)
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyIndex(PROPERTY_INDICES.NAME)
    @PropertyName('Product Name', String)
    name!: string;
    
    // ...
}
```

### 2. Esquema de Numeración por Grupos

```typescript
// 1-999:    Propiedades principales
// 1000-1999: Relaciones
// 2000-2999: Campos calculados
// 9000-9999: Metadatos (createdAt, updatedAt, etc.)

@PropertyIndex(1)
id!: number;

@PropertyIndex(10)
name!: string;

@PropertyIndex(1000)  // Relaciones
customer!: Customer;

@PropertyIndex(2000)  // Calculados
totalAmount!: number;

@PropertyIndex(9000)  // Metadatos
createdAt!: Date;
```

### 3. Documentar Orden en Comentarios

```typescript
export class Order extends BaseEntity {
    // [1-10] Identificación
    @PropertyIndex(1)
    id!: number;
    
    @PropertyIndex(2)
    orderNumber!: string;
    
    // [11-20] Cliente
    @PropertyIndex(11)
    customer!: Customer;
    
    @PropertyIndex(12)
    shippingAddress!: Address;
    
    // [21-30] Items
    @PropertyIndex(21)
    items!: OrderItem[];
    
    // [31-40] Totales
    @PropertyIndex(31)
    subtotal!: number;
    
    @PropertyIndex(32)
    tax!: number;
    
    @PropertyIndex(33)
    total!: number;
}
```

---

## 📚 Referencias Adicionales

- `property-name-decorator.md` - Definir propiedades
- `view-group-decorator.md` - Agrupar propiedades
- `view-group-row-decorator.md` - Organizar en filas
- `css-column-class-decorator.md` - Layout responsive
- `../02-base-entity/metadata-access.md` - Acceso a metadatos
- `../../02-FLOW-ARCHITECTURE.md` - Flujo de renderizado

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/property_index_decorator.ts`
