# Vistas Predeterminadas del Framework

## Propósito

Las vistas predeterminadas (`default_listview.vue`, `default_detailview.vue`, `default_lookup_listview.vue`) son componentes dinámicos que renderizan automáticamente interfaces para cualquier entidad del sistema sin necesidad de crear vistas personalizadas. Utilizan el sistema de decoradores y metadata de BaseEntity para generar formularios, tablas y selecciones de manera completamente automática.

---

## 1. DefaultListView - Vista de Listado

### Ubicación
`src/views/default_listview.vue`

### Descripción
Vista predeterminada para mostrar listados de entidades en formato tabla. Es la vista más simple del framework: delega toda la lógica de renderizado a `DetailViewTableComponent`.

### Código Completo
```vue
<template>
<DetailViewTableComponent />
</template>

<script lang="ts">
import DetailViewTableComponent from '@/components/Informative/DetailViewTableComponent.vue';
import { ViewTypes } from '@/enums/view_type';
import Application from '@/models/application';

export default {
    name: 'DefaultListView',
    components: {
        DetailViewTableComponent
    },
    mounted() {
        Application.View.value.viewType = ViewTypes.LISTVIEW;
    }
}
</script>
```

### Funcionalidad

1. **Montaje**:
   - Establece `Application.View.value.viewType = ViewTypes.LISTVIEW`
   - Esto actualiza el estado global de la aplicación para que los botones de acción y componentes sepan qué tipo de vista está activa

2. **Renderizado**:
   - Renderiza `DetailViewTableComponent` que lee `Application.View.value.entityClass` para determinar qué entidad mostrar
   - La tabla se genera dinámicamente basada en los decoradores de la entidad

### Integración con el Sistema

- **Application.View**: Lee `entityClass` para saber qué tipo de entidad listar
- **DetailViewTableComponent**: Componente que hace todo el trabajo pesado de renderizado
- **Router**: Esta vista se asigna automáticamente cuando se navega a una ruta con sufijo `/list`

### Uso Típico

```typescript
// Navegación programática a lista de productos
Application.changeViewToListView(Products);

// Resultado: Renderiza default_listview.vue que muestra tabla con todos los Products
```

### Consideraciones

- ⚠️ **Sin datos**: La vista no maneja la carga de datos, eso lo hace `DetailViewTableComponent`
- ⚠️ **Sin configuración**: No acepta props ni configuración, es 100% dinámica
- ✅ **Simple delegación**: Su único propósito es establecer el viewType y renderizar el componente tabla

---

## 2. DefaultDetailView - Vista de Detalle/Edición

### Ubicación
`src/views/default_detailview.vue`

### Descripción
Vista predeterminada para crear, editar o visualizar una entidad individual. Genera automáticamente un formulario completo con todos los campos de la entidad organizados en grupos, filas y pestañas según los decoradores configurados.

### Arquitectura del Formulario

```
DefaultDetailView
├── <h2> Título (getDefaultPropertyValue)
├── Grupos de Propiedades (ViewGroup)
│   ├── FormGroupComponent "Grupo 1"
│   │   ├── FormRowTwoItemsComponent (ViewGroupRow.PAIR)
│   │   │   ├── Campo A
│   │   │   └── Campo B
│   │   └── FormRowThreeItemsComponent (ViewGroupRow.TRIPLE)
│   │       ├── Campo C
│   │       ├── Campo D
│   │       └── Campo E
│   └── FormGroupComponent "Grupo 2"
│       └── div (ViewGroupRow.SINGLE)
│           └── Campo único
└── FormGroupComponent "Listas"
    └── TabControllerComponent
        ├── TabComponent "Lista 1"
        │   └── ArrayInputComponent
        └── TabComponent "Lista 2"
            └── ArrayInputComponent
```

### Código - Template Principal

```vue
<template>
<h2 class="title">{{ entity.getDefaultPropertyValue() }}</h2>

<div v-for="(group, groupName) in groupedProperties" :key="groupName">
    <FormGroupComponent :title="groupName">
        <template v-for="(chunk, index) in group" :key="index">
            <component 
                :is="getRowComponent(chunk.rowType)" 
                :class="chunk.rowType === 'single' ? 'form-row-single' : ''">
                <div v-for="prop in chunk.properties" :key="prop">
                    <!-- Inputs dinámicos basados en tipo de propiedad -->
                    <NumberInputComponent 
                    v-if="entityClass.getPropertyType(prop) === Number"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <ObjectInputComponent 
                    v-if="isBaseEntityType(prop)"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    :modelType="entityClass.getPropertyType(prop)"
                    v-model="entity[prop]" />

                    <DateInputComponent
                    v-if="entityClass.getPropertyType(prop) === Date"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <BooleanInputComponent
                    v-if="entityClass.getPropertyType(prop) === Boolean"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <ListInputComponent
                    v-if="entityClass.getPropertyType(prop) instanceof EnumAdapter"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    :property-enum-values="entityClass.getPropertyType(prop)"
                    v-model="entity[prop]" />

                    <!-- APARTADO PARA LOS INPUTS EN BASE STRING -->
                    <TextInputComponent 
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.TEXT"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <TextAreaComponent 
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.TEXTAREA"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <EmailInputComponent
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.EMAIL"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <PasswordInputComponent
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.PASSWORD"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />
                </div>
            </component>
        </template>
    </FormGroupComponent>
</div>

<FormGroupComponent title="Listas">
    <TabControllerComponent :tabs="getArrayListsTabs()">
        <TabComponent v-for="(tab) in entity.getArrayKeysOrdered()">
            <ArrayInputComponent 
            :entity="entity"
            :property-key="tab"
            :required="entity.isRequired(tab)"
            :disabled="entity.isDisabled(tab)"
            :validated="entity.isValidation(tab)"
            :requiredd-message="entity.requiredMessage(tab)"
            :validated-message="entity.validationMessage(tab)"
            v-model="entity[tab]" 
            :type-value="entityClass.getArrayPropertyType(tab)"
            />
        </TabComponent>
    </TabControllerComponent>
</FormGroupComponent>
</template>
```

### Código - Script

```vue
<script lang="ts">
import * as FormComponents from '@/components/Form';
import TabControllerComponent from '@/components/TabControllerComponent.vue';
import TabComponent from '@/components/TabComponent.vue';
import Application from '@/models/application';
import { BaseEntity } from '@/entities/base_entitiy';
import { StringType } from '@/enums/string_type';
import { ViewGroupRow } from '@/enums/view_group_row';
import { EnumAdapter } from '@/models/enum_adapter';

export default {
    name: 'DefaultDetailView',
    components: {
        ...FormComponents,
        TabControllerComponent,
        TabComponent
    },
    data() {
        return {
            StringType,
            EnumAdapter,
            BaseEntity,
            entity: Application.View.value.entityObject as BaseEntity,
            entityClass: Application.View.value.entityClass as typeof BaseEntity,
        };
    },
    mounted() {
        // FUTURE: Aquí se implementará la lógica para cargar la entidad desde la API
        // usando Application.View.value.entityOid cuando entityObject sea null
    },
    computed: {
        groupedProperties() {
            const viewGroups = this.entity.getViewGroups();
            const viewGroupRows = this.entity.getViewGroupRows();
            const keys = this.entity.getKeys();
            
            const groups: Record<string, Array<{ rowType: string, properties: string[] }>> = {};
            let currentGroup = 'default';
            
            for (const prop of keys) {
                // Filtrar propiedades ocultas con @HideInDetailView()
                if (this.entity.isHideInDetailView(prop)) {
                    continue;
                }
                
                // Cambiar de grupo si la propiedad tiene @ViewGroup()
                if (viewGroups[prop]) {
                    currentGroup = viewGroups[prop];
                    if (!groups[currentGroup]) {
                        groups[currentGroup] = [];
                    }
                }
                
                if (!groups[currentGroup]) {
                    groups[currentGroup] = [];
                }
                
                // Determinar tipo de fila @ViewGroupRow()
                const rowType = viewGroupRows[prop] || ViewGroupRow.PAIR;
                const lastChunk = groups[currentGroup][groups[currentGroup].length - 1];
                
                // Agrupar propiedades consecutivas del mismo rowType
                if (lastChunk && lastChunk.rowType === rowType) {
                    lastChunk.properties.push(prop);
                } else {
                    groups[currentGroup].push({
                        rowType: rowType,
                        properties: [prop]
                    });
                }
            }
            
            return groups;
        }
    },
    methods: {
        getRowComponent(rowType: string) {
            switch (rowType) {
                case ViewGroupRow.SINGLE:
                    return 'div';
                case ViewGroupRow.PAIR:
                    return FormComponents.FormRowTwoItemsComponent;
                case ViewGroupRow.TRIPLE:
                    return FormComponents.FormRowThreeItemsComponent;
                default:
                    return FormComponents.FormRowTwoItemsComponent;
            }
        },
        isBaseEntityType(prop: string): boolean {
            const propType = this.entityClass.getPropertyType(prop);
            return propType && propType.prototype instanceof BaseEntity;
        },
        getArrayListsTabs(): Array<string> {
            var returnList: Array<string> = [];
            var listTypes = this.entity.getArrayKeysOrdered();
            for (let i = 0; i < listTypes.length; i++) {
                returnList.push(this.entityClass.getPropertyNameByKey(listTypes[i])!);
            }
            return returnList;
        }
    }
}
</script>

<style scoped>
.form-row-single {
    width: 100%;
}
</style>
```

### Funcionalidad Detallada

#### 1. Inicialización (data)
```typescript
entity: Application.View.value.entityObject as BaseEntity
entityClass: Application.View.value.entityClass as typeof BaseEntity
```
- Lee la entidad y su clase desde el estado global `Application.View`
- Si `entityObject` es null y existe `entityOid`, debería cargarse desde API (implementación futura)

#### 2. Agrupación Dinámica (computed: groupedProperties)

**Proceso**:
1. Lee `entity.getKeys()` - obtiene todas las propiedades de la entidad
2. Para cada propiedad:
   - ❌ Si tiene `@HideInDetailView()` → salta la propiedad
   - 📁 Si tiene `@ViewGroup("Nombre")` → cambia al grupo "Nombre"
   - 📏 Lee `@ViewGroupRow()` (SINGLE/PAIR/TRIPLE) para determinar disposición
   - 🔗 Agrupa propiedades consecutivas con mismo rowType

**Resultado**: Objeto con esta estructura:
```typescript
{
  "Información General": [
    { rowType: "PAIR", properties: ["name", "email"] },
    { rowType: "TRIPLE", properties: ["city", "state", "zip"] }
  ],
  "Detalles": [
    { rowType: "SINGLE", properties: ["description"] }
  ]
}
```

#### 3. Renderizado de Inputs (template)

**Lógica de selección de componente**:
```
┌─ getPropertyType() ─────────────────┐
│                                      │
├─ Number → NumberInputComponent      │
├─ Boolean → BooleanInputComponent    │
├─ Date → DateInputComponent          │
├─ BaseEntity → ObjectInputComponent  │
├─ EnumAdapter → ListInputComponent   │
└─ String ────┬─ TEXT → TextInput     │
              ├─ TEXTAREA → TextArea  │
              ├─ EMAIL → EmailInput   │
              └─ PASSWORD → PasswordInput
```

**Cada input recibe**:
- `:entity-class` - Clase de la entidad para obtener metadata
- `:entity` - Instancia actual de la entidad
- `:property-key` - Nombre de la propiedad
- `v-model="entity[prop]"` - Two-way binding

#### 4. Sección de Arrays (template - parte inferior)

```vue
<FormGroupComponent title="Listas">
    <TabControllerComponent :tabs="getArrayListsTabs()">
        <TabComponent v-for="(tab) in entity.getArrayKeysOrdered()">
            <ArrayInputComponent />
        </TabComponent>
    </TabControllerComponent>
</FormGroupComponent>
```

- `getArrayKeysOrdered()` - obtiene propiedades tipo Array ordenadas por `@PropertyIndex()`
- `getArrayListsTabs()` - convierte keys a nombres legibles con `@PropertyName()`
- Cada array se renderiza en su propia pestaña con `ArrayInputComponent`

### Decoradores Utilizados

| Decorador | Uso en DefaultDetailView |
|-----------|--------------------------|
| `@HideInDetailView()` | Oculta la propiedad del formulario |
| `@ViewGroup("nombre")` | Agrupa propiedades bajo un título |
| `@ViewGroupRow(SINGLE/PAIR/TRIPLE)` | Define cuántos campos por fila |
| `@PropertyName("Nombre")` | Define etiqueta del campo |
| `@DefaultProperty()` | Se usa para el título `<h2>` |
| `@StringType(EMAIL/PASSWORD/etc)` | Determina tipo de input para strings |
| `@PropertyIndex(n)` | Ordena las propiedades en el formulario |

### Ejemplo de Uso

```typescript
// Entidad configurada con decoradores
class User extends BaseEntity {
    @PropertyName("ID")
    @HideInDetailView()
    id: number = 0;

    @PropertyName("Nombre Completo")
    @ViewGroup("Información Personal")
    @ViewGroupRow(ViewGroupRow.SINGLE)
    @DefaultProperty()
    fullName: string = "";

    @PropertyName("Email")
    @StringType(StringType.EMAIL)
    @ViewGroup("Información Personal")
    @ViewGroupRow(ViewGroupRow.PAIR)
    email: string = "";

    @PropertyName("Teléfono")
    @ViewGroupRow(ViewGroupRow.PAIR)
    phone: string = "";

    @PropertyName("Biografía")
    @StringType(StringType.TEXTAREA)
    @ViewGroup("Detalles")
    @ViewGroupRow(ViewGroupRow.SINGLE)
    bio: string = "";

    @PropertyName("Pedidos")
    orders: Order[] = [];
}

// Navegación a edición
const user = new User({ id: 123, fullName: "Juan Pérez" });
Application.changeViewToDetailView(user);
```

**Resultado visual**:
```
┌─────────────────────────────────────┐
│  Juan Pérez                         │ ← Título con @DefaultProperty
└─────────────────────────────────────┘

┌─ Información Personal ──────────────┐
│ [Nombre Completo: Juan Pérez]       │ ← SINGLE (ancho completo)
│                                     │
│ [Email: juan@example.com] [Teléfono: 555-1234] │ ← PAIR (2 columnas)
└─────────────────────────────────────┘

┌─ Detalles ──────────────────────────┐
│ [Biografía:                    ]    │ ← SINGLE con TEXTAREA
│ [                              ]    │
└─────────────────────────────────────┘

┌─ Listas ────────────────────────────┐
│ ┌─ Pedidos ───────────────────────┐ │
│ │ [ArrayInputComponent con tabla] │ │ ← Pestaña con array
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Integración con Application

```typescript
// Antes de navegar a DefaultDetailView
Application.View.value = {
    viewType: ViewTypes.DETAILVIEW,
    entityClass: User,              // ← DefaultDetailView lee esto
    entityObject: userInstance,     // ← DefaultDetailView lee esto
    entityOid: "123",              // ← (futuro) Para cargar desde API
    component: DefaultDetailView
};
```

### Consideraciones

- ⚠️ **Sin validación automática**: Los inputs validan individualmente, pero el guardado lo maneja `SaveButton`
- ⚠️ **Sin carga de API**: Actualmente requiere `entityObject` poblado, la carga por `entityOid` está marcada como FUTURE
- ⚠️ **Orden de propiedades**: Si no usas `@PropertyIndex()`, el orden es el de declaración en la clase
- ✅ **Completamente reactivo**: Cambios en `entity[prop]` se reflejan inmediatamente gracias a `v-model`
- ✅ **Reutilizable**: Funciona con cualquier entidad que herede de `BaseEntity`

### Debug

```typescript
// Ver cómo se agruparon las propiedades
console.log(this.groupedProperties);

// Ver metadata de una propiedad
console.log(this.entityClass.getPropertyType('email'));
console.log(this.entity.getStringType());
console.log(this.entity.getViewGroups());
```

---

## 3. DefaultLookupListView - Vista de Selección Lookup

### Ubicación
`src/views/default_lookup_listview.vue`

### Descripción
Vista predeterminada para seleccionar una entidad desde un modal lookup. Muestra una lista de items clickeables que al seleccionarse cierran el modal y retornan la entidad elegida al campo `ObjectInputComponent` que originó el lookup.

### Código Completo

```vue
<template>
<LookupItem
    v-for="(item, index) in data"
    :key="index"
    :itemFromList="item"
    @click="clickedItrem(item)"
/>
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entitiy';
import { Products } from '@/entities/products';
import LookupItem from '@/components/Informative/LookupItem.vue';
import Application from '@/models/application';

export default {
    name: "DefaultLookupListView",
    components: {
        LookupItem
    },
    methods: {
        clickedItrem(item: BaseEntity) {
            Application.ApplicationUIService.closeModalOnFunction(item);
        }
    },
    data() {
        const data : BaseEntity[] = [];
        // MOCK DATA - En producción esto debería ser una llamada API
        for (let i = 1; i <= 50; i++) {
            data.push(
                new Products({
                    id: i,
                    name: `Producto ${i}Sss`,
                    description: `Descripción del producto asdf fasdfasdfasdf ta sdf sd fasdf   asdfasdfasdf asdfasfafsdf ${i}`,
                    price: Math.floor(Math.random() * 100) + 1,
                    stock: Math.floor(Math.random() * 50) + 1,
                    product: new Products({
                        id: i + 100,
                        name: `Inner Producto ${i}`,
                        description: `Inner Descripción del producto ${i}`,
                        price: Math.floor(Math.random() * 100) + 1,
                        stock: Math.floor(Math.random() * 50) + 1,
                    })
                })
            );
        }
        
        return {
            BaseEntity,
            data
        }
    },
};
</script>
```

### Funcionalidad

#### 1. Data (Carga de Entidades)
```typescript
data() {
    const data : BaseEntity[] = [];
    // MOCK DATA - Por ahora genera 50 productos ficticios
    for (let i = 1; i <= 50; i++) {
        data.push(new Products({ ... }));
    }
    return { BaseEntity, data }
}
```
**⚠️ Implementación futura**: Debería llamar a la API basándose en `Application.View.value.entityClass`

#### 2. Renderizado de Items
```vue
<LookupItem
    v-for="(item, index) in data"
    :itemFromList="item"  // ← Pasa la entidad completa
    @click="clickedItrem(item)"  // ← Maneja la selección
/>
```
- Cada `LookupItem` muestra `item.getDefaultPropertyValue()` como texto principal
- Los items son clickeables (card completa es el botón)

#### 3. Selección (clickedItrem)
```typescript
clickedItrem(item: BaseEntity) {
    Application.ApplicationUIService.closeModalOnFunction(item);
}
```

**Flujo completo**:
1. Usuario hace click en un `LookupItem`
2. Se dispara `clickedItrem(item)` con la entidad seleccionada
3. `closeModalOnFunction(item)` hace 3 cosas:
   - Ejecuta el callback que se pasó al abrir el modal (devuelve `item`)
   - Cierra el modal lookup
   - El callback en `ObjectInputComponent` recibe `item` y actualiza el `v-model`

### Flujo de Integración Lookup

```
[ObjectInputComponent]
          │
          │ 1. Usuario click en botón lookup
          ▼
    Application.ApplicationUIService.openModal({
        component: DefaultLookupListView,  // ← Esta vista
        onFunction: (selectedEntity) => {
            this.modelValue = selectedEntity;  // ← Actualiza el objeto
        }
    })
          │
          │ 2. Modal se abre con DefaultLookupListView
          ▼
[DefaultLookupListView renders]
          │
          │ 3. Usuario click en un LookupItem
          ▼
    clickedItrem(item: Products)
          │
          │ 4. Cierra modal y ejecuta callback
          ▼
    closeModalOnFunction(item)
          │
          │ 5. Ejecuta onFunction(item)
          ▼
[ObjectInputComponent]
    this.modelValue = item  // ← Campo actualizado
```

### Uso Típico

```vue
<!-- En un formulario con relación -->
<ObjectInputComponent 
    :entity-class="Order"
    :entity="order"
    :property-key="'customer'"
    :modelType="Customer"
    v-model="order.customer"
/>

<!-- Al hacer click en el botón lookup: -->
1. Se abre modal con DefaultLookupListView
2. DefaultLookupListView muestra lista de Customers
3. Usuario selecciona "Juan Pérez"
4. Modal se cierra
5. order.customer = customerSeleccionado
6. ObjectInputComponent muestra "Juan Pérez"
```

### Consideraciones

- ⚠️ **Datos mock**: Actualmente usa datos ficticios de `Products`, debería cargar dinámicamente según `entityClass`
- ⚠️ **Sin búsqueda**: No tiene filtro o buscador (podría agregarse con `SearchInputComponent`)
- ⚠️ **Sin paginación**: Carga todos los registros de una vez (50 en el mock)
- ✅ **Diseño simple**: Solo renderiza items, el `LookupItem` maneja el styling
- ✅ **Callback automático**: La integración con `ObjectInputComponent` es transparente

### Implementación Futura (API)

```typescript
// Cómo DEBERÍA funcionar con API real
async mounted() {
    const entityClass = Application.View.value.entityClass;
    const endpoint = entityClass.getApiEndpoint();
    
    try {
        const response = await Application.axiosInstance.get(endpoint);
        this.data = response.data.map((item: any) => new entityClass(item));
    } catch (error) {
        console.error('Error loading lookup data:', error);
    }
}
```

### Debug

```typescript
// Ver qué entidad se está buscando
console.log(Application.View.value.entityClass);

// Ver datos cargados
console.log(this.data);

// Ver qué se seleccionó
clickedItrem(item: BaseEntity) {
    console.log('Selected:', item.toObject());
    Application.ApplicationUIService.closeModalOnFunction(item);
}
```

---

## 4. ListView - Vista de Prueba

### Ubicación
`src/views/list.vue`

### Descripción
Vista de ejemplo/prueba simple que solo contiene un botón para cambiar el tema de la aplicación. No forma parte del sistema de vistas predeterminadas del framework, es solo para testing del `ApplicationUIService`.

### Código Completo

```vue
<template>
    <div class="container">
        <button class="button" @click="Application.ApplicationUIService.toggleDarkMode()">
            Cambiar Tema
        </button>
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';
export default {
    name: 'ListView',
    data() {
        return {
            Application,
        }
    },
}
</script>

<style scoped>
.container {
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
}
.button {
    width: 100%;
}
</style>
```

### Funcionalidad

- **Botón "Cambiar Tema"**: Llama a `Application.ApplicationUIService.toggleDarkMode()`
- **Propósito**: Vista de testeo para verificar que el sistema de temas funciona correctamente
- **No es parte del framework**: No se usa en producción, solo para desarrollo

### Uso

```typescript
// Para probar esta vista manualmente
Application.router?.push('/list');
```

---

## Resumen de Vistas

| Vista | Propósito | Cuándo se Usa | Componentes Clave |
|-------|-----------|---------------|-------------------|
| **DefaultListView** | Mostrar tabla de entidades | `Application.changeViewToListView(EntityClass)` | DetailViewTableComponent |
| **DefaultDetailView** | Crear/Editar entidad individual | `Application.changeViewToDetailView(entity)` | Todos los FormComponents, TabController, FormGroups |
| **DefaultLookupListView** | Seleccionar entidad en modal | `ObjectInputComponent` abre modal lookup | LookupItem |
| **ListView** | Pruebas de UI | Testing manual | Ninguno (solo botón) |

---

## Flujo Completo de Navegación

### Escenario: Usuario edita un pedido con cliente relacionado

```
1. Usuario ve lista de pedidos
   DefaultListView
   └── DetailViewTableComponent
       └── Muestra tabla con pedidos

2. Usuario hace click en un pedido
   event: openDetailView(pedido)
   └── Application.changeViewToDetailView(pedido)
       └── Router.push('/orders/123')
           └── Renderiza DefaultDetailView

3. DefaultDetailView renderiza formulario
   <h2>Pedido #123</h2>
   ├── [Fecha: 2024-01-15]
   ├── [Cliente: (vacío)]  ← ObjectInputComponent
   └── [Total: $250.00]

4. Usuario click en botón lookup de Cliente
   ObjectInputComponent
   └── Application.ApplicationUIService.openModal({
       component: DefaultLookupListView,
       onFunction: (cliente) => { pedido.cliente = cliente }
   })

5. DefaultLookupListView muestra clientes
   <LookupItem>Juan Pérez</LookupItem>
   <LookupItem>María García</LookupItem>
   <LookupItem>Carlos López</LookupItem>

6. Usuario selecciona "María García"
   clickedItrem(mariaGarcia)
   └── closeModalOnFunction(mariaGarcia)
       ├── Ejecuta onFunction(mariaGarcia)
       │   └── pedido.cliente = mariaGarcia
       └── Cierra modal

7. DefaultDetailView actualiza
   <h2>Pedido #123</h2>
   ├── [Fecha: 2024-01-15]
   ├── [Cliente: María García]  ← Actualizado
   └── [Total: $250.00]

8. Usuario hace click en SaveButton
   SaveButton
   └── entity.save()
       └── POST /api/orders/123
           └── { fecha: "2024-01-15", clienteId: 456, total: 250 }

9. Después de guardado exitoso
   Application.changeViewToListView(Order)
   └── Router.push('/orders/list')
       └── Renderiza DefaultListView
           └── Tabla actualizada con cambios
```

---

## Preguntas Frecuentes

### ¿Por qué DefaultListView es tan simple?
Porque toda la lógica está en `DetailViewTableComponent`. La vista solo establece el `viewType` para que los botones de acción sepan qué operaciones mostrar (New, Refresh para LISTVIEW).

### ¿Cómo personalizo el orden de los campos en DefaultDetailView?
Usa el decorador `@PropertyIndex(n)` en tu entidad:
```typescript
@PropertyIndex(1)
name: string = "";

@PropertyIndex(2)
email: string = "";
```

### ¿Puedo crear mi propia vista custom en lugar de usar las default?
Sí, puedes usar `@ModuleDetailComponent(CustomDetailView)` en tu entidad para reemplazar DefaultDetailView por tu componente personalizado.

### ¿Cómo oculto un campo solo en detalle pero lo muestro en lista?
```typescript
@HideInDetailView()
@PropertyName("ID")
id: number = 0;
```
El campo aparecerá en la tabla de DefaultListView pero no en el formulario de DefaultDetailView.

### ¿Por qué DefaultLookupListView tiene datos mock de Products?
Es un placeholder. En una implementación real, debería leer `Application.View.value.entityClass` y hacer una llamada API para cargar las entidades del tipo correcto.

---

## Depuración

### Ver estado de Application.View
```typescript
console.log('View State:', Application.View.value);
// {
//   viewType: "DETAILVIEW",
//   entityClass: Products,
//   entityObject: Products { id: 123, ... },
//   entityOid: "123",
//   component: DefaultDetailView
// }
```

### Ver propiedades agrupadas en DefaultDetailView
```typescript
// En DefaultDetailView, dentro de mounted()
console.log('Grouped Properties:', this.groupedProperties);
```

### Ver qué input se renderiza para cada propiedad
```typescript
// En DefaultDetailView template, agregar:
<div v-for="prop in chunk.properties" :key="prop">
    {{ prop }}: {{ entityClass.getPropertyType(prop)?.name }}
    <!-- Muestra: "email: String" -->
</div>
```

### Verificar callback de lookup
```typescript
// En ObjectInputComponent al abrir modal
Application.ApplicationUIService.openModal({
    component: DefaultLookupListView,
    onFunction: (entity) => {
        console.log('Lookup selected:', entity.toObject());
        this.modelValue = entity;
    }
});
```
