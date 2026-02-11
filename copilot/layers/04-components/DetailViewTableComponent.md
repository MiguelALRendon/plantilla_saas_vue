# 📊 DetailViewTableComponent - Tabla de Lista

**Referencias:**
- `core-components.md` - Componentes principales
- `../../02-base-entity/metadata-access.md` - Acceso a metadatos
- `../../01-decorators/css-column-class-decorator.md` - Ancho de columnas

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/Informative/DetailViewTableComponent.vue`

---

## 🎯 Propósito

Componente de tabla que muestra **lista de registros** de una entidad con columnas generadas automáticamente desde los metadatos. Usado en `default_listview.vue`.

**Generación automática:**  
- Columnas basadas en `@PropertyName`
- Anchos basados en `@CSSColumnClass`
- Click en fila abre DetailView

---

## 🎨 Template

```vue
<template>
<table>
    <thead>
        <tr>
            <td v-for="(item, key) in Application.View.entityClass?.getProperties()" 
                :class="Application.View.entityClass?.getCSSClasses()[key]">
                {{ item }}
            </td>
        </tr>
    </thead>

    <tbody>
        <tr v-for="item in data" @click="openDetailView(item)">
            <template v-for="column in item.getKeys()">
                <td :class="item.getCSSClasses()[column]" 
                    class="table-row" 
                    v-if="Application.View.entityClass?.getPropertyType(column) !== Array">
                    
                    <!-- Valores no-boolean -->
                    <span v-if="Application.View.entityClass?.getPropertyType(column) !== Boolean">
                        {{ item[column] instanceof BaseEntity ? 
                           item[column].getDefaultPropertyValue() : 
                           item.getFormattedValue(column) }}
                    </span>

                    <!-- Boolean con iconos -->
                    <span v-else-if="Application.View.entityClass?.getPropertyType(column) === Boolean" 
                          :class="GGCLASS + ' ' + (item.toObject()[column] ? 'row-check' : 'row-cancel')" 
                          class="boolean-row">
                        {{ item.toObject()[column] ? GGICONS.CHECK : GGICONS.CANCEL }}
                    </span>
                </td>
            </template>
        </tr>
    </tbody>

    <tfoot>
        <tr></tr>
    </tfoot>
</table>
</template>
```

---

## 🔧 Script

### Methods

#### openDetailView()

```typescript
methods: {
    openDetailView(entity: any) {
        // Setear entityOid antes de cambiar la vista
        const uniqueValue = entity.getUniquePropertyValue();
        if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
            Application.View.value.entityOid = 'new';
        } else {
            Application.View.value.entityOid = String(uniqueValue);
        }
        Application.changeViewToDetailView(entity as BaseEntity);
    }  
}
```

**Flujo:**
1. Obtiene valor único de la entidad (`@UniquePropertyKey`)
2. Actualiza `Application.View.value.entityOid`
3. Navega a DetailView con la entidad

### Data

```typescript
data() {
    const data: Products[] = [];
    
    // Generar 50 productos de prueba
    for (let i = 1; i <= 50; i++) {
        data.push(
            new Products({
                id: i,
                name: `Producto ${i}`,
                description: `Descripción del producto ${i}`,
                stock: Math.floor(Math.random() * 50) + 1,
                Catedral: new Products({...}),  // Objeto anidado
                bolian: i % 2 === 0,
                listaProductos: [...]  // Array
            })
        );
    }
    
    return {
        Application,
        BaseEntity,
        data: data as any as Products[],
        GGICONS,
        GGCLASS
    }
}
```

**Nota:** Actualmente usa datos simulados (hardcoded). En producción, estos vendrían de `getElementList()`.

---

## 🎨 Generación de Columnas

### Header (thead)

```vue
<td v-for="(item, key) in Application.View.entityClass?.getProperties()">
    {{ item }}
</td>
```

**Obtiene:**
- `getProperties()` retorna `{ 'name': 'Product Name', 'price': 'Price', ... }`
- Genera una columna por cada propiedad con `@PropertyName`

**Ejemplo:**
```typescript
@PropertyName('Product Name', String)
name!: string;

@PropertyName('Price', Number)
price!: number;
```

**Resultado:**
```
| Product Name | Price |
```

### Ancho de Columnas

```vue
:class="Application.View.entityClass?.getCSSClasses()[key]"
```

**Activado por:**
```typescript
@CSSColumnClass('table-length-medium')
name!: string;

@CSSColumnClass('table-length-small')
id!: number;
```

**CSS Classes disponibles:**
- `table-length-small` - 10%
- `table-length-short` - 15%
- `table-length-medium` - 25%
- `table-length-long` - 35%
- `table-length-xlarge` - 50%
- `table-length-header` - fit-content

---

## 📊 Renderizado de Celdas

### 1. Arrays (Ocultos)

```vue
v-if="Application.View.entityClass?.getPropertyType(column) !== Array"
```

**Razón:** Arrays no se muestran en tabla, solo en DetailView con tabs.

### 2. BaseEntity (Objetos Anidados)

```vue
{{ item[column] instanceof BaseEntity ? 
   item[column].getDefaultPropertyValue() : 
   item.getFormattedValue(column) }}
```

**Ejemplo:**
```typescript
@DefaultProperty('name')
category!: Category;

// En tabla muestra: category.name
```

### 3. Boolean

```vue
<span v-else-if="tipo === Boolean" 
      :class="GGCLASS + ' ' + (valor ? 'row-check' : 'row-cancel')">
    {{ valor ? GGICONS.CHECK : GGICONS.CANCEL }}
</span>
```

**Resultado:**
- `true` → ✓ verde
- `false` → ✗ rojo

### 4. Valores Formateados

```vue
{{ item.getFormattedValue(column) }}
```

**Usa `@DisplayFormat`:**
```typescript
@DisplayFormat((e) => `$${e.price.toFixed(2)}`)
price!: number;

// En tabla: "$99.99"
```

---

## 🖱️ Interacción del Usuario

### Click en Fila

```vue
<tr @click="openDetailView(item)">
```

**Comportamiento:**
1. Usuario hace click en cualquier parte de la fila
2. `openDetailView()` se ejecuta
3. URL actualizado con entityOid
4. Vista cambia a DetailView
5. Formulario se carga con datos de la entidad

### Hover Effect

```css
tbody tr:hover {
    background-color: var(--bg-gray);
}
```

---

## 🎨 Estilos CSS

### Estructura Flex

```css
table {
    width: 100%;
    height: calc(100vh - 50px - 2rem - 2rem - 4.3rem);
    background-color: var(--white);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-light);
    overflow: auto;
}

thead {
    display: block;
    position: sticky;
    top: 0;
    z-index: 1;
}

tbody {
    display: block;
    overflow-y: auto;
    flex: 1;
    scrollbar-gutter: stable;
}
```

**Ventajas:**
- Header sticky (se mantiene visible al scroll)
- Body scrollable independientemente
- Altura adaptativa al viewport

### Rows y Celdas

```css
tr {
    min-height: 3rem;
}

td {
    padding-inline: 1rem;
    padding-block: 0.5rem;
    border-bottom: 1px solid var(--gray-lighter);
    user-select: none;
    width: 100%;
}

tbody tr {
    cursor: pointer;
}
```

### Boolean Icons

```css
.boolean-row {
    font-size: 1.75rem;
}

.row-check {
    color: var(--green-soft);
}

.row-cancel {
    color: var(--accent-red);
}
```

---

## 🎓 Ejemplo Completo

### Definición de Entidad

```typescript
@ModuleName('Products')
@ApiEndpoint('/api/products')
@UniquePropertyKey('id')
@DefaultProperty('name')
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Product Name', String)
    @CSSColumnClass('table-length-medium')
    name!: string;
    
    @PropertyIndex(3)
    @PropertyName('Stock', Number)
    @CSSColumnClass('table-length-small')
    @DisplayFormat((e) => `${e.stock} units`)
    stock!: number;
    
    @PropertyIndex(4)
    @PropertyName('Active', Boolean)
    @CSSColumnClass('table-length-small')
    active!: boolean;
    
    @PropertyIndex(5)
    @PropertyName('Tags', Array)
    tags!: string[];  // NO se muestra en tabla
}
```

### Tabla Generada

```
┌─────┬─────────────────┬─────────┬────────┐
│ ID  │ Product Name    │ Stock   │ Active │
├─────┼─────────────────┼─────────┼────────┤
│ 1   │ Widget          │ 50 units│   ✓    │
│ 2   │ Gadget          │ 25 units│   ✗    │
│ 3   │ Tool            │ 100 units│  ✓    │
└─────┴─────────────────┴─────────┴────────┘
     10%      25%          10%       10%
```

---

## 🔄 Flujo Completo

```
Usuario navega a /products
    ↓
Router llama ListView
    ↓
DetailViewTableComponent se monta
    ↓
data() genera 50 productos simulados
    ↓
Header se genera desde getProperties()
    ↓
Rows se generan iterando data
    ↓
Usuario click en fila #2
    ↓
openDetailView(product2) ejecuta
    ↓
entityOid = "2"
    ↓
Application.changeViewToDetailView(product2)
    ↓
Router navega a /products/2
    ↓
DetailView se renderiza con product2
```

---

## 📝 Limitaciones Actuales

1. **Datos simulados:** Usa 50 productos hardcoded
   - En producción: Debe llamar `Product.getElementList()`
   
2. **No hay paginación:** Muestra todos los registros
   - Considera implementar paginación para > 100 registros
   
3. **No hay filtrado:** No se puede buscar/filtrar
   - Considera agregar input de búsqueda
   
4. **No hay ordenamiento:** Click en header no ordena
   - Considera agregar sorting por columna

5. **Arrays ocultos:** Propiedades Array no se visualizan
   - Diseño intencional (uso en DetailView con tabs)

---

## 🎯 Mejoras Futuras (Fuera del Scope Actual)

- Llamar a `getElementList()` real
- Paginación (10, 25, 50, 100 items)
- Búsqueda global
- Filtros por columna
- Ordenamiento ascendente/descendente
- Selección múltiple con checkboxes
- Acciones en batch (delete selected)
- Export a CSV/Excel
- Columnas configurables (show/hide)

**Nota:** Estas features NO existen actualmente.

---

## 🔗 Referencias

- **ListView:** `views-overview.md`
- **CSS Column Class:** `../../01-decorators/css-column-class-decorator.md`
- **Display Format:** `../../01-decorators/display-format-decorator.md`
- **PropertyName:** `../../01-decorators/property-name-decorator.md`
- **UniquePropertyKey:** `../../01-decorators/unique-decorator.md`

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo (con limitaciones documentadas)
