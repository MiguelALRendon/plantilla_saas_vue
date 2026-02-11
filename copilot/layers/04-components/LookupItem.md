# 🔍 LookupItem Component

**Referencias:**
- `core-components.md` - Componentes core
- `../views/default-lookup-listview.md` - Vista lookup
- `../02-base-entity/base-entity-core.md` - BaseEntity
- `../03-application/ui-services.md` - UI Services

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Informative/LookupItem.vue`

---

## 🎯 Propósito

`LookupItem` representa un **item individual en una lista de lookup** (selección de entidad relacionada). Se utiliza dentro de modales para seleccionar una entidad de una lista.

**Uso Principal:** Selección de relaciones (ej: seleccionar un Customer para un Order).

---

## 🏗️ Estructura

### Props

```typescript
{
    itemFromList: BaseEntity  // Entidad a mostrar
}
```

### Template

```vue
<template>
<div class="lookup-item-card">
    <span>{{ (itemFromList as BaseEntity).getDefaultPropertyValue() }}</span>
</div>
</template>
```

**Simple:** Muestra el valor de la propiedad por defecto de la entidad.

---

## 🎨 Estilos

```css
.lookup-item-card {
    border-radius: var(--border-radius);
    padding: 1rem;
    cursor: pointer;
    background-color: var(--white);
    margin-bottom: 0.75rem;
    transition: 0.5s ease;
    box-shadow: var(--shadow-light);
}

.lookup-item-card:hover {
    filter: brightness(0.94);  /* Darkens slightly on hover */
}
```

**Efectos:**
- Card con sombra
- Cursor pointer (clicable)
- Hover effect (oscurece ligeramente)
- Espaciado entre items

---

## 📊 Integración con BaseEntity

### getDefaultPropertyValue()

```typescript
// En BaseEntity
public getDefaultPropertyValue(): any {
    const propertyName = (this.constructor as any)[DEFAULT_PROPERTY_KEY];
    if (!propertyName) {
        return undefined;
    }
    return (this as any)[propertyName];
}
```

**Ejemplo:**
```typescript
@DefaultProperty('name')
export class Customer extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    name!: string;  // ← Esta es la propiedad por defecto
    
    @PropertyName('Email', String)
    email!: string;
}

// En LookupItem:
// Se muestra: "John Doe" (el valor de name)
```

---

## 📝 Uso en default_lookup_listview.vue

### Vista de Lookup

```vue
<template>
<LookupItem
    v-for="(item, index) in data"
    :key="index"
    :itemFromList="item"
    @click="clickedItem(item)"
/>
</template>

<script>
export default {
    components: { LookupItem },
    methods: {
        clickedItem(item: BaseEntity) {
            // Cerrar modal y enviar item seleccionado
            Application.ApplicationUIService.closeModalOnFunction(item);
        }
    },
    data() {
        // Cargar lista de entidades
        const data = await CustomerList.getElementList();
        return { data };
    }
}
</script>
```

---

## 🔄 Flujo de Selección

```
1. Usuario abre modal de lookup desde ObjectInputComponent
        ↓
2. Modal muestra default_lookup_listview.vue
        ↓
3. Vista renderiza lista de LookupItem
        ↓
4. Usuario hace click en un LookupItem
        ↓
5. Evento click ejecuta clickedItem(item)
        ↓
6. closeModalOnFunction(item) se llama
        ↓
7. Modal se cierra y ejecuta callback
        ↓
8. Callback recibe el item seleccionado
        ↓
9. ObjectInputComponent actualiza su v-model con el item
```

---

## 💡 Ejemplo Completo

### Entidad

```typescript
@ModuleName('Products')
@DefaultProperty('name')
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;  // Default property
    
    @PropertyName('Price', Number)
    price!: number;
}
```

### Lookup List

```typescript
const products = [
    new Product({ id: 1, name: 'Laptop', price: 1299 }),
    new Product({ id: 2, name: 'Mouse', price: 25 }),
    new Product({ id: 3, name: 'Keyboard', price: 89 }),
];
```

### Renderizado

```
┌─────────────────────────────────┐
│ Laptop                          │ ← LookupItem
├─────────────────────────────────┤
│ Mouse                           │ ← LookupItem
├─────────────────────────────────┤
│ Keyboard                        │ ← LookupItem
└─────────────────────────────────┘
```

Al hacer click en "Laptop", se selecciona el producto completo.

---

## 🎨 Personalización

### Mostrar Múltiples Campos

```vue
<template>
<div class="lookup-item-card">
    <div class="lookup-item-main">
        <strong>{{ item.getDefaultPropertyValue() }}</strong>
    </div>
    <div class="lookup-item-secondary">
        ID: {{ item.id }} | Price: ${{ item.price }}
    </div>
</div>
</template>

<style>
.lookup-item-main {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
}

.lookup-item-secondary {
    font-size: 0.9rem;
    color: var(--gray-medium);
}
</style>
```

### Con Icono

```vue
<template>
<div class="lookup-item-card">
    <img :src="item.constructor.getModuleIcon()" class="lookup-icon" />
    <span>{{ item.getDefaultPropertyValue() }}</span>
</div>
</template>

<style>
.lookup-item-card {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.lookup-icon {
    width: 32px;
    height: 32px;
}
</style>
```

---

## 🔗 Componentes Relacionados

- **default_lookup_listview.vue** - Vista que usa LookupItem
- **ObjectInputComponent** - Abre modal de lookup
- **ModalComponent** - Contiene la vista de lookup
- **ApplicationUIService.closeModalOnFunction** - Cierra y retorna selected

---

## ⚠️ Consideraciones

### 1. DefaultProperty Requerido

```typescript
// ❌ Sin @DefaultProperty
export class Customer extends BaseEntity {
    name!: string;
}
// → getDefaultPropertyValue() retorna undefined
// → LookupItem muestra nada

// ✅ Con @DefaultProperty
@DefaultProperty('name')
export class Customer extends BaseEntity {
    name!: string;
}
// → LookupItem muestra el nombre
```

### 2. Click Handler

```vue
<!-- El click debe manejarse en el componente padre, no en LookupItem -->
<LookupItem @click="handleSelection(item)" />
```

LookupItem no maneja el click internamente, es responsabilidad de la vista padre.

---

## 🐛 Debugging

### Ver Valor Mostrado

```javascript
// En LookupItem (Vue DevTools)
itemFromList.getDefaultPropertyValue()  // Ver qué se muestra
```

### Verificar DefaultProperty

```javascript
const propName = Customer.prototype[DEFAULT_PROPERTY_KEY];
console.log('Default property:', propName);
```

---

## 📚 Resumen

`LookupItem` es un **componente de selección**:

- ✅ Muestra propiedad por defecto de entidad
- ✅ Card clicable con hover effect
- ✅ Usado en listas de lookup (modales)
- ✅ Simple y reutilizable
- ✅ Integrado con @DefaultProperty decorator

**Patrón:** Item de lista → Click → Retorna entidad completa al callback.

Simple pero esencial para la selección de relaciones en el framework.
