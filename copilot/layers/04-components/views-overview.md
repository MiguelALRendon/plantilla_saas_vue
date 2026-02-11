# 👁️ Views Overview - Vistas del Framework

**Referencias:**
- `../02-base-entity/metadata-access.md` - Metadatos usados por vistas
- `form-inputs.md` - Inputs renderizados en DetailView
- `../03-application/application-singleton.md` - Application gestiona vistas

---

## 📍 Ubicación en el Código

**Carpeta:** `src/views/`  
**Vistas:**
- `default_listview.vue`
- `default_detailview.vue`
- `default_lookup_listview.vue`
- `list.vue`

---

## 🎯 Propósito

Las **vistas** son componentes Vue que renderizan las diferentes representaciones de una entidad:
- Lista de registros (ListView)
- Formulario de edición (DetailView)
- Selección en modal (LookupView)

**Generación automática:** Las vistas leen metadatos de la entidad para generar la UI.

---

## 📦 1. default_listview.vue

### Descripción
Vista de lista por defecto que muestra una tabla con todos los registros de una entidad.

### Archivo
`src/views/default_listview.vue`

### Estructura

```vue
<template>
    <DetailViewTableComponent />
</template>
```

### Comportamiento
1. Renderiza `DetailViewTableComponent` que contiene la tabla
2. Establece `ViewType` a `LISTVIEW` en `mounted()`
3. Los datos se generan temporalmente en el componente (hardcoded para testing)

### Components Utilizados
- `DetailViewTableComponent` - Tabla principal con datos

### Notas
- **Datos simulados**: Actualmente genera 50 productos de prueba
- **Sin API**: No hace llamadas reales al backend aún
- **Click en fila**: Abre la vista de detalle del registro

### Uso
```typescript
@ModuleListComponent(DefaultListview)
export class MyEntity extends BaseEntity {
    // ...
}
```

---

## 📦 2. default_detailview.vue

### Descripción
Vista de detalle que genera automáticamente un formulario de edición/creación basado en los metadatos de la entidad.

### Archivo
`src/views/default_detailview.vue`

### Estructura

```vue
<template>
    <h2>{{ entity.getDefaultPropertyValue() }}</h2>
    
    <!-- Propiedades agrupadas -->
    <div v-for="(group, groupName) in groupedProperties">
        <FormGroupComponent :title="groupName">
            <!-- Rows según ViewGroupRow -->
            <component :is="getRowComponent(chunk.rowType)">
                <!-- Inputs según tipo de propiedad -->
                <NumberInputComponent v-if="tipo === Number" />
                <TextInputComponent v-if="tipo === String && stringType === TEXT" />
                <BooleanInputComponent v-if="tipo === Boolean" />
                <!-- etc. -->
            </component>
        </FormGroupComponent>
    </div>
    
    <!-- Arrays en tabs -->
    <FormGroupComponent title="Listas">
        <TabControllerComponent>
            <TabComponent v-for="arrayKey">
                <ArrayInputComponent />
            </TabComponent>
        </TabControllerComponent>
    </FormGroupComponent>
</template>
```

### Lógica de Agrupación

#### groupedProperties (computed)

Agrupa propiedades según decoradores:
1. Lee `@ViewGroup` de cada propiedad
2. Lee `@ViewGroupRow` para determinar disposición (SINGLE, PAIR, TRIPLE)
3. Filtra propiedades con `@HideInDetailView`
4. Agrupa consecutivas del mismo tipo de row

**Resultado:**
```typescript
{
    'Basic Information': [
        { rowType: 'PAIR', properties: ['id', 'name'] },
        { rowType: 'SINGLE', properties: ['description'] }
    ],
    'Pricing': [
        { rowType: 'TRIPLE', properties: ['price', 'cost', 'tax'] }
    ]
}
```

### Selección de Input Component

```typescript
// Número
if (entityClass.getPropertyType(prop) === Number)
    → NumberInputComponent

// Boolean
if (entityClass.getPropertyType(prop) === Boolean)
    → BooleanInputComponent

// Date
if (entityClass.getPropertyType(prop) === Date)
    → DateInputComponent

// BaseEntity (objeto anidado)
if (isBaseEntityType(prop))
    → ObjectInputComponent

// Enum
if (entityClass.getPropertyType(prop) instanceof EnumAdapter)
    → ListInputComponent

// String con tipos específicos
if (tipo === String && stringType === StringType.TEXT)
    → TextInputComponent
if (tipo === String && stringType === StringType.TEXTAREA)
    → TextAreaComponent
if (tipo === String && stringType === StringType.EMAIL)
    → EmailInputComponent
if (tipo === String && stringType === StringType.PASSWORD)
    → PasswordInputComponent
```

### Selección de Row Component

```typescript
getRowComponent(rowType: string) {
    switch (rowType) {
        case ViewGroupRow.SINGLE:
            return 'div';  // Ocupar toda la fila
        case ViewGroupRow.PAIR:
            return FormRowTwoItemsComponent;  // 2 inputs por fila
        case ViewGroupRow.TRIPLE:
            return FormRowThreeItemsComponent;  // 3 inputs por fila
        default:
            return FormRowTwoItemsComponent;
    }
}
```

### Arrays en Tabs

Arrays se muestran en tabs separados dentro de un `TabController`:

```vue
<TabControllerComponent :tabs="getArrayListsTabs()">
    <TabComponent v-for="arrayKey in entity.getArrayKeysOrdered()">
        <ArrayInputComponent 
            :property-key="arrayKey"
            :type-value="entityClass.getArrayPropertyType(arrayKey)" 
        />
    </TabComponent>
</TabControllerComponent>
```

### Data
```typescript
{
    entity: BaseEntity,           // Instancia actual
    entityClass: typeof BaseEntity, // Clase de la entidad
    StringType,                    // Enum de tipos de string
    EnumAdapter,                   // Adaptador de enums
}
```

### Mounted Hook
```typescript
mounted() {
    // FUTURE: Aquí se implementará la lógica para cargar la entidad desde la API
    // usando Application.View.value.entityOid cuando entityObject sea null
}
```

### Components Utilizados
- `FormGroupComponent` - Agrupa secciones del formulario
- `FormRowTwoItemsComponent` - Fila con 2 inputs
- `FormRowThreeItemsComponent` - Fila con 3 inputs
- `TabControllerComponent` - Controlador de tabs
- `TabComponent` - Tab individual
- Todos los inputs de `@/components/Form`

### Uso
```typescript
@ModuleDetailComponent(DefaultDetailView)
export class MyEntity extends BaseEntity {
    // ...
}
```

---

## 📦 3. default_lookup_listview.vue

### Descripción
Vista de lista simplificada para seleccionar items en un modal (tipo "lookup" o búsqueda).

### Archivo
`src/views/default_lookup_listview.vue`

### Estructura

```vue
<template>
    <LookupItem
        v-for="item in data"
        :itemFromList="item"
        @click="clickedItem(item)"
    />
</template>
```

### Comportamiento
1. Renderiza lista de `LookupItem` clickeables
2. Al hacer click en un item, llama a `closeModalOnFunction(item)`
3. El modal se cierra y retorna el item seleccionado

### Methods
```typescript
clickedItem(item: BaseEntity) {
    Application.ApplicationUIService.closeModalOnFunction(item);
}
```

### Data
```typescript
{
    data: BaseEntity[]  // Lista de items (hardcoded con 50 productos de prueba)
}
```

### Components Utilizados
- `LookupItem` - Item clickeable de la lista

### Uso Típico

```typescript
// Abrir modal de lookup
Application.ApplicationUIService.showModal(
    ProductEntity,
    ViewTypes.LOOKUPVIEW
);

// Modal muestra default_lookup_listview con productos
// Usuario selecciona → closeModalOnFunction(selectedProduct)
// Modal se cierra y retorna el producto selectedProduct
```

### Notas
- **Datos simulados**: Genera 50 productos hardcoded
- **Sin búsqueda**: No tiene filtrado ni búsqueda aún
- **Modal exclusivo**: Solo se usa en modales, no como vista principal

---

## 📦 4. list.vue

### Descripción
Vista de ejemplo básica usada para testing/demostración.

### Archivo
`src/views/list.vue`

### Estructura

```vue
<template>
    <div class="container">
        <button @click="Application.ApplicationUIService.toggleDarkMode()">
            Cambiar Tema
        </button>
    </div>
</template>
```

### Comportamiento
- Muestra un botón para cambiar entre modo claro/oscuro
- Vista de demostración, no se usa en producción

### Uso
Vista de testing, no se asigna a entidades.

---

## 🔧 DetailViewTableComponent

### Descripción
Componente de tabla utilizado por `default_listview.vue` para renderizar la lista de registros.

### Archivo
`src/components/Informative/DetailViewTableComponent.vue`

### Estructura

```vue
<template>
<table>
    <thead>
        <tr>
            <td v-for="(propertyName, key) in entityClass.getProperties()">
                {{ propertyName }}
            </td>
        </tr>
    </thead>
    
    <tbody>
        <tr v-for="item in data" @click="openDetailView(item)">
            <td v-for="column in item.getKeys()">
                <!-- Objeto relacionado -->
                <span v-if="item[column] instanceof BaseEntity">
                    {{ item[column].getDefaultPropertyValue() }}
                </span>
                
                <!-- Boolean con iconos -->
                <span v-else-if="tipo === Boolean" class="boolean-row">
                    {{ item[column] ? CHECK : CANCEL }}
                </span>
                
                <!-- Valor formateado -->
                <span v-else>
                    {{ item.getFormattedValue(column) }}
                </span>
            </td>
        </tr>
    </tbody>
</table>
</template>
```

### Características

1. **Headers dinámicos**: Lee `getProperties()` de la entidad
2. **CSS Classes**: Aplica `getCSSClasses()[column]` a cada celda
3. **Filtrado de arrays**: No muestra columnas de tipo Array
4. **Objetos relacionados**: Muestra `getDefaultPropertyValue()` de objetos BaseEntity
5. **Booleanos**: Renderiza ✓ o ✗ con iconos
6. **Formato**: Usa `getFormattedValue()` para formatear valores
7. **Click handler**: Abre DetailView al hacer click en fila

### Methods

```typescript
openDetailView(entity: BaseEntity) {
    // Establecer OID para routing
    const uniqueValue = entity.getUniquePropertyValue();
    if (uniqueValue) {
        Application.View.value.entityOid = String(uniqueValue);
    } else {
        Application.View.value.entityOid = 'new';
    }
    
    Application.changeViewToDetailView(entity);
}
```

### Data
```typescript
{
    data: Products[]  // 50 productos de prueba hardcoded
}
```

### CSS
- **Responsive**: Usa flexbox para columnas
- **Sticky header**: El header permanece fijo al hacer scroll
- **Hover**: Filas tienen efecto hover
- **Column widths**: Lee decorador `@CSSColumnClass` para anchos

### CSS Classes (table.css)

```css
.table-length-small { width: 80px; }
.table-length-short { width: 120px; }
.table-length-medium { width: 200px; }
.table-length-large { width: 300px; }
```

---

## 🎨 Flujo de Renderizado

### ListView

```
1. Application.changeViewToListView(EntityClass)
        ↓
2. Router → /:module
        ↓
3. ComponentContainer renderiza default_listview.vue
        ↓
4. default_listview renderiza DetailViewTableComponent
        ↓
5. Tabla lee EntityClass.getProperties()
        ↓
6. Genera headers y rows
        ↓
7. Click en row → openDetailView()
```

### DetailView

```
1. Application.changeViewToDetailView(entity)
        ↓
2. Router → /:module/:oid
        ↓
3. ComponentContainer renderiza default_detailview.vue
        ↓
4. groupedProperties computed ejecuta
        ↓
5. Lee @ViewGroup, @ViewGroupRow, @HideInDetailView
        ↓
6. Genera estructura de grupos y rows
        ↓
7. Para cada propiedad, determina tipo de input
        ↓
8. Renderiza inputs con metadatos
        ↓
9. Arrays se renderizan en tabs al final
```

---

## 📝 Notas Importantes

1. **Datos temporales**: Todas las vistas usan datos hardcoded (50 productos) para testing
2. **Sin API real**: No hay llamadas a backend aún, todo es simulado
3. **Metadatos son clave**: Las vistas leen decoradores para generar UI
4. **Configurables**: Se pueden crear vistas custom y asignarlas con decoradores:
   ```typescript
   @ModuleListComponent(MyCustomListView)
   @ModuleDetailComponent(MyCustomDetailView)
   ```
5. **Responsive**: Todas las vistas usan CSS responsive
6. **Filtrado automático**: DetailView filtra propiedades con `@HideInDetailView`
7. **Arrays separados**: Arrays siempre se muestran en tabs al final del formulario

---

## 🔮 Funcionalidades Futuras (FUTURE)

### En default_detailview.vue (línea ~131)

```typescript
mounted() {
    // FUTURE: Implementar carga de entidad desde API
    // if (!this.entity && Application.View.value.entityOid) {
    //     this.loadEntityFromAPI(Application.View.value.entityOid);
    // }
}

// async loadEntityFromAPI(oid: string) {
//     try {
//         const response = await Application.axiosInstance.get(
//             `${this.entityClass.getApiEndpoint()}/${oid}`
//         );
//         this.entity = new this.entityClass(response.data);
//         Application.View.value.entityObject = this.entity;
//     } catch (error) {
//         console.error('Error loading entity:', error);
//     }
// }
```

### En DetailViewTableComponent

- Reemplazar datos hardcoded por llamada a `EntityClass.getElementList()`
- Implementar paginación
- Implementar filtrado y búsqueda
- Implementar ordenamiento por columna

---

**Total de Vistas:** 4  
**Vista principal de lista:** default_listview.vue  
**Vista principal de detalle:** default_detailview.vue  
**Última actualización:** 11 de Febrero, 2026
