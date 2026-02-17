# VISTAS DEL FRAMEWORK

## 1. Propósito

Este documento describe las cuatro vistas principales del framework que renderizan automáticamente representaciones visuales de entidades utilizando metadatos. Las vistas incluyen: default_listview (lista tabular), default_detailview (formulario de detalle), default_lookup_listview (selección modal) y list.vue (vista de testing). Adicionalmente documenta el componente DetailViewTableComponent responsable de renderizar tablas dinámicas.

Los componentes de vista son el punto de entrada principal para la interacción del usuario con las entidades, traduciendo metadatos de decoradores en interfaces funcionales y completas.

## 2. Alcance

### Incluye
- Archivo default_listview.vue y su estructura
- Archivo default_detailview.vue con generación automática de formularios
- Archivo default_lookup_listview.vue para selección de entidades
- Archivo list.vue para testing
- Componente DetailViewTableComponent para tablas dinámicas
- Computed groupedProperties en default_detailview
- Métodos getRowComponent y getArrayListsTabs
- Lógica de selección de inputs según tipo de propiedad
- Integración con FormGroupComponent y FormRowComponents
- Flujos de renderizado ListView y DetailView

### No Incluye
- Componentes de input individuales (TextInput, NumberInput, etc)
- Componentes de layout (FormGroupComponent, FormRowComponents)
- Lógica de navegación y enrutamiento
- Sistema de validación de inputs
- Gestión de estado global Application

## 3. Definiciones Clave

**default_listview.vue**: Vista que renderiza una tabla de registros mediante DetailViewTableComponent. Establece ViewTypes.LISTVIEW al montarse.

**default_detailview.vue**: Vista que genera automáticamente un formulario completo a partir de metadatos de entidad, organizando inputs en grupos según decoradores @ViewGroup y @ViewGroupRow.

**default_lookup_listview.vue**: Vista modal que renderiza LookupItem components para selección de entidades relacionadas.

**list.vue**: Vista de testing con funcionalidad básica de prueba (botón toggleDarkMode).

**DetailViewTableComponent**: Componente de tabla dinámica que genera headers y filas desde getProperties() y renderiza valores según su tipo.

**groupedProperties**: Computed que lee getViewGroups() y getViewGroupRows(), filtra propiedades ocultas y agrupa chunks consecutivos con el mismo rowType.

**getRowComponent**: Método que retorna dinámicamente el componente de fila apropiado según ViewGroupRow (FormRowTwoItemsComponent, FormRowThreeItemsComponent o div).

**openDetailView**: Método que establece entityOid desde getUniquePropertyValue() e invoca changeViewToDetailView() para navegación.

## 4. Descripción Técnica

### default_listview.vue

**Estructura:**

```vue
<template>
    <DetailViewTableComponent />
</template>

<script>
import DetailViewTableComponent from '@/components/DetailViewTableComponent.vue';
import { Application } from '@/libs/application/application';
import { ViewTypes } from '@/enums/view_types';

export default {
    components: {
        DetailViewTableComponent,
    },
    mounted() {
        Application.View.value.viewType = ViewTypes.LISTVIEW;
    },
};
</script>
```

**Comportamiento:**
- Template delega completamente renderizado a DetailViewTableComponent
- mounted() establece Application.View.value.viewType = ViewTypes.LISTVIEW
- DetailViewTableComponent lee entityClass desde Application y genera tabla automáticamente
- Click en fila tabla invoca openDetailView navegando a detail view

**Datos simulados:**
- Actualmente utiliza 50 productos hardcoded para testing
- FUTURE: Implementar carga desde API mediante entityClass.getElementList()

### default_detailview.vue

**Arquitectura completa:**

```vue
<template>
    <div class="detail-view">
        <h2>{{ entity.getDefaultPropertyValue() }}</h2>
        
        <div v-for="group in groupedProperties" :key="group.groupName">
            <FormGroupComponent :title="group.groupName">
                <div v-for="chunk in group.chunks" :key="chunk.index">
                    <component :is="getRowComponent(chunk.rowType)">
                        <div v-for="prop in chunk.properties" :key="prop.key">
                            <!-- Selección dinámica de input -->
                            <NumberInputComponent 
                                v-if="prop.type === 'Number'"
                                :entityClass="entityClass"
                                :entity="entity"
                                :propertyKey="prop.key"
                            />
                            <TextInputComponent 
                                v-else-if="prop.type === 'String' && prop.stringType === StringType.TEXT"
                                :entityClass="entityClass"
                                :entity="entity"
                                :propertyKey="prop.key"
                            />
                            <BooleanInputComponent 
                                v-else-if="prop.type === 'Boolean'"
                                :entityClass="entityClass"
                                :entity="entity"
                                :propertyKey="prop.key"
                            />
                            <DateInputComponent 
                                v-else-if="prop.type === 'String' && prop.stringType === StringType.DATE"
                                :entityClass="entityClass"
                                :entity="entity"
                                :propertyKey="prop.key"
                            />
                            <ObjectInputComponent 
                                v-else-if="prop.type === 'Object'"
                                :entityClass="entityClass"
                                :entity="entity"
                                :propertyKey="prop.key"
                            />
                            <ListInputComponent 
                                v-else-if="prop.type === 'Enum'"
                                :entityClass="entityClass"
                                :entity="entity"
                                :propertyKey="prop.key"
                            />
                        </div>
                    </component>
                </div>
            </FormGroupComponent>
        </div>
        
        <!-- Arrays separados en tabs al final -->
        <FormGroupComponent title="Listas">
            <TabControllerComponent>
                <TabComponent 
                    v-for="arrayKey in getArrayListsTabs()" 
                    :key="arrayKey"
                    :title="entityClass.getPropertyNameByKey(arrayKey)"
                >
                    <ArrayInputComponent 
                        :entityClass="entityClass"
                        :entity="entity"
                        :propertyKey="arrayKey"
                        :type-value="getArrayPropertyType(arrayKey)"
                    />
                </TabComponent>
            </TabControllerComponent>
        </FormGroupComponent>
    </div>
</template>

<script>
import { computed } from 'vue';
import { Application } from '@/libs/application/application';
import FormGroupComponent from '@/components/FormGroupComponent.vue';
import FormRowTwoItemsComponent from '@/components/FormRowTwoItemsComponent.vue';
import FormRowThreeItemsComponent from '@/components/FormRowThreeItemsComponent.vue';
import NumberInputComponent from '@/components/NumberInputComponent.vue';
import TextInputComponent from '@/components/TextInputComponent.vue';
import BooleanInputComponent from '@/components/BooleanInputComponent.vue';
import DateInputComponent from '@/components/DateInputComponent.vue';
import ObjectInputComponent from '@/components/ObjectInputComponent.vue';
import ListInputComponent from '@/components/ListInputComponent.vue';
import ArrayInputComponent from '@/components/ArrayInputComponent.vue';
import TabControllerComponent from '@/components/TabControllerComponent.vue';
import TabComponent from '@/components/TabComponent.vue';
import { StringType } from '@/enums/string_type';
import { ViewGroupRow } from '@/enums/view_group_row';

export default {
    components: {
        FormGroupComponent,
        FormRowTwoItemsComponent,
        FormRowThreeItemsComponent,
        NumberInputComponent,
        TextInputComponent,
        BooleanInputComponent,
        DateInputComponent,
        ObjectInputComponent,
        ListInputComponent,
        ArrayInputComponent,
        TabControllerComponent,
        TabComponent,
    },
    setup() {
        const entity = Application.View.value.entityObject;
        const entityClass = Application.View.value.entityClass;
        
        const groupedProperties = computed(() => {
            const groups = entityClass.getViewGroups();
            const result = [];
            
            for (const groupName in groups) {
                const properties = groups[groupName];
                const chunks = [];
                let currentChunk = [];
                let currentRowType = null;
                
                for (const prop of properties) {
                    // Filtrar propiedades ocultas en DetailView
                    if (prop.hideInDetailView) continue;
                    
                    const rowType = entityClass.getViewGroupRows()[prop.key];
                    
                    // Agrupar consecutivas con mismo rowType
                    if (rowType === currentRowType) {
                        currentChunk.push(prop);
                    } else {
                        if (currentChunk.length > 0) {
                            chunks.push({
                                rowType: currentRowType,
                                properties: currentChunk,
                            });
                        }
                        currentChunk = [prop];
                        currentRowType = rowType;
                    }
                }
                
                // Agregar último chunk
                if (currentChunk.length > 0) {
                    chunks.push({
                        rowType: currentRowType,
                        properties: currentChunk,
                    });
                }
                
                result.push({
                    groupName,
                    chunks,
                });
            }
            
            return result;
        });
        
        const getRowComponent = (rowType) => {
            switch (rowType) {
                case ViewGroupRow.SINGLE:
                    return 'div';
                case ViewGroupRow.PAIR:
                    return FormRowTwoItemsComponent;
                case ViewGroupRow.TRIPLE:
                    return FormRowThreeItemsComponent;
                default:
                    return 'div';
            }
        };
        
        const getArrayListsTabs = () => {
            const arrayKeys = entityClass.getArrayKeysOrdered();
            return arrayKeys.map(key => entityClass.getPropertyNameByKey(key));
        };
        
        return {
            entity,
            entityClass,
            groupedProperties,
            getRowComponent,
            getArrayListsTabs,
            StringType,
        };
    },
    mounted() {
        /**
         * FUTURE: Implementar carga de entidad desde API
         * if (!this.entity && this.entityOid) {
         *     const endpoint = this.entityClass.getApiEndpoint();
         *     axios.get(`${endpoint}/${this.entityOid}`)
         *         .then(response => {
         *             this.entity = new this.entityClass(response.data);
         *         });
         * }
         */
    },
};
</script>
```

**Computed groupedProperties:**
1. Lee entityClass.getViewGroups() obteniendo mapa groupName → properties[]
2. Lee entityClass.getViewGroupRows() obteniendo mapa propertyKey → ViewGroupRow
3. Filtra propiedades donde hideInDetailView === true
4. Agrupa propiedades consecutivas con mismo rowType en chunks
5. Retorna array de grupos con estructura { groupName, chunks[] }

**Método getRowComponent:**
- ViewGroupRow.SINGLE → retorna 'div' (fila completa ancho)
- ViewGroupRow.PAIR → retorna FormRowTwoItemsComponent (2 columnas)
- ViewGroupRow.TRIPLE → retorna FormRowThreeItemsComponent (3 columnas)
- default → retorna 'div'

**Selección dinámica de input:**
Cadena if/else-if verificando:
1. prop.type === 'Number' → NumberInputComponent
2. prop.type === 'String' && stringType === StringType.TEXT → TextInputComponent
3. prop.type === 'Boolean' → BooleanInputComponent
4. prop.type === 'String' && stringType === StringType.DATE → DateInputComponent
5. prop.type === 'Object' → ObjectInputComponent
6. prop.type === 'Enum' → ListInputComponent

**Arrays en tabs:**
- getArrayKeysOrdered() obtiene keys de propiedades Array
- Itera generando TabComponent por cada array
- Cada tab contiene ArrayInputComponent con type-value específico

**Data:**
- entity: Application.View.value.entityObject (instancia actual)
- entityClass: Application.View.value.entityClass (clase)

**mounted FUTURE:**
- Si entityObject es null pero entityOid existe, cargar desde API
- Invocar entityClass.getApiEndpoint() + entityOid
- Crear nueva instancia desde response.data

### default_lookup_listview.vue

**Estructura:**

```vue
<template>
    <div class="lookup-list">
        <LookupItem 
            v-for="(item, index) in data" 
            :key="index"
            :itemFromList="item"
            @click="clickedItem(item)"
        />
    </div>
</template>

<script>
import LookupItem from '@/components/Informative/LookupItemComponent.vue';
import { BaseEntity } from '@/entities/base_entity';

export default {
    components: {
        LookupItem,
    },
    data() {
        return {
            data: [] as BaseEntity[],
        };
    },
    methods: {
        clickedItem(item: BaseEntity) {
            // Invocar callback closeModalOnFunction pasando item seleccionado
            this.closeModalOnFunction(item);
        },
    },
    mounted() {
        // Hardcoded 50 productos para testing
        // FUTURE: this.data = await this.entityClass.getElementList();
        this.data = Array.from({ length: 50 }, (_, i) => 
            new Product({ id: i, name: `Product ${i}` })
        );
    },
};
</script>
```

**Comportamiento:**
- v-for renderiza LookupItem por cada elemento en data
- @click="clickedItem(item)" invoca método con item seleccionado
- clickedItem ejecuta closeModalOnFunction(item) cerrando modal y retornando selección
- data hardcoded 50 productos para testing
- FUTURE: Cargar data = await entityClass.getElementList()

**Uso típico:**
- Application.showModal(ProductEntity, ViewTypes.LOOKUPVIEW)
- Usuario selecciona producto en lista
- Modal cierra y retorna producto seleccionado a ObjectInputComponent

### list.vue (Testing)

**Estructura:**

```vue
<template>
    <div>
        <button @click="toggleDarkMode">Toggle Dark Mode</button>
    </div>
</template>

<script>
export default {
    methods: {
        toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
        },
    },
};
</script>
```

**Propósito:**
- Vista de testing básica
- No utilizada en producción
- Demuestra funcionalidad simple (toggleDarkMode)

### DetailViewTableComponent

**Template:**

```vue
<template>
    <table class="entity-table">
        <thead>
            <tr>
                <td v-for="propertyName in entityClass.getProperties()" :key="propertyName">
                    {{ propertyName }}
                </td>
            </tr>
        </thead>
        <tbody>
            <tr 
                v-for="item in data" 
                :key="item.getUniquePropertyValue()"
                @click="openDetailView(item)"
            >
                <td 
                    v-for="key in entityClass.getKeys()" 
                    :key="key"
                    :class="entityClass.getCSSClasses(key)"
                >
                    <span v-if="item[key] instanceof BaseEntity">
                        {{ item[key].getDefaultPropertyValue() }}
                    </span>
                    <span v-else-if="typeof item[key] === 'boolean'">
                        <i v-if="item[key]" :class="GGICONS.CHECK"></i>
                        <i v-else :class="GGICONS.CANCEL"></i>
                    </span>
                    <span v-else>
                        {{ entityClass.getFormattedValue(key, item[key]) }}
                    </span>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import { Application } from '@/libs/application/application';
import { BaseEntity } from '@/entities/base_entity';
import { GGICONS } from '@/constants/ggicons';
import { Product } from '@/entities/product';

export default {
    data() {
        return {
            entityClass: Application.View.value.entityClass,
            data: [] as BaseEntity[],
            GGICONS,
        };
    },
    methods: {
        openDetailView(item: BaseEntity) {
            const entityOid = item.getUniquePropertyValue();
            Application.View.value.entityOid = entityOid;
            Application.changeViewToDetailView();
        },
    },
    mounted() {
        // Hardcoded 50 productos para testing
        this.data = Array.from({ length: 50 }, (_, i) => 
            new Product({ id: i, name: `Product ${i}`, price: i * 10 })
        );
        // FUTURE: this.data = await this.entityClass.getElementList();
    },
};
</script>

<style>
/* Importado desde @/css/table.css */
.entity-table {
    width: 100%;
    border-collapse: collapse;
}

.entity-table thead {
    position: sticky;
    top: 0;
    background-color: white;
}

.entity-table tbody tr:hover {
    background-color: var(--hover-color);
    cursor: pointer;
}

.length-small { width: 80px; }
.length-short { width: 120px; }
.length-medium { width: 200px; }
.length-large { width: 300px; }
</style>
```

**Características:**

**Headers dinámicos:**
- thead utiliza entityClass.getProperties() obteniendo array de property names
- v-for genera td por cada propertyName

**Filas dinámicas:**
- tbody v-for itera data (array de entidades)
- Cada tr tiene @click="openDetailView(item)" para navegación
- :key="item.getUniquePropertyValue()" identifica único

**Renderizado de valores:**
1. Si item[key] instanceof BaseEntity → muestra item[key].getDefaultPropertyValue()
2. Si typeof item[key] === 'boolean' → muestra icono CHECK o CANCEL
3. Else → muestra entityClass.getFormattedValue(key, item[key])

**CSS classes:**
- :class="entityClass.getCSSClasses(key)" aplica clases columna desde @CSSColumnClass
- Clases disponibles: length-small (80px), length-short (120px), length-medium (200px), length-large (300px)

**Método openDetailView:**
1. Obtiene entityOid = item.getUniquePropertyValue()
2. Establece Application.View.value.entityOid = entityOid
3. Invoca Application.changeViewToDetailView() navegando a detail view

**Datos simulados:**
- Hardcoded 50 productos para testing
- FUTURE: Reemplazar por this.data = await entityClass.getElementList()

**Filtrado automático:**
- Arrays no se muestran en tabla (filtrados por getProperties)
- Propiedades con @HideInListView filtradas automáticamente

**Objetos relacionados:**
- Si propiedad es BaseEntity, muestra getDefaultPropertyValue() de objeto relacionado

## 5. Flujo de Funcionamiento

### Flujo ListView Completo

1. Usuario navega a módulo (ej: /products)
2. Application.changeViewToListView() invocado
3. Router carga ComponentContainer con parámetro :module
4. ComponentContainer renderiza default_listview.vue
5. default_listview mounted() establece ViewTypes.LISTVIEW
6. default_listview renderiza DetailViewTableComponent
7. DetailViewTableComponent lee entityClass desde Application.View.value
8. DetailViewTableComponent.mounted() genera data hardcoded (FUTURE: getElementList())
9. Template genera headers desde entityClass.getProperties()
10. Template genera rows desde data array
11. Usuario visualiza tabla con todas las entidades
12. Usuario click en fila
13. openDetailView(item) invocado
14. entityOid establecido desde item.getUniquePropertyValue()
15. Application.changeViewToDetailView() navegando a detail view

### Flujo DetailView Completo

1. Usuario navega a /products/123 o click fila ListView
2. Application.changeViewToDetailView() invocado
3. Router carga ComponentContainer con :module/:oid
4. ComponentContainer renderiza default_detailview.vue
5. default_detailview.setup() lee entity y entityClass desde Application.View.value
6. Computed groupedProperties ejecuta:
   a. Lee entityClass.getViewGroups() obteniendo grupos
   b. Lee entityClass.getViewGroupRows() obteniendo rowTypes
   c. Filtra propiedades hideInDetailView === true
   d. Agrupa propiedades consecutivas mismo rowType en chunks
   e. Retorna estructura { groupName, chunks[] }
7. Template itera groupedProperties renderizando:
   a. FormGroupComponent por cada grupo con título groupName
   b. component :is getRowComponent(chunk.rowType) seleccionando FormRowTwo/Three/div
   c. Dentro de cada row, inputs dinámicos según tipo propiedad
8. Selección input ejecuta cadena if/else-if:
   a. Verifica prop.type (Number, String, Boolean, Object, Enum)
   b. Verifica prop.stringType si es String (TEXT, DATE, EMAIL, etc)
   c. Renderiza componente apropiado (NumberInput, TextInput, etc)
9. Cada input recibe props entityClass, entity, propertyKey
10. Al final del formulario, arrays renderizados en tabs:
    a. getArrayKeysOrdered() obtiene array properties
    b. TabController con TabComponent por cada array
    c. Cada tab contiene ArrayInputComponent
11. Usuario interactúa con inputs modificando entity[propertyKey]
12. Cambios reflejados inmediatamente (Vue reactivity)
13. Usuario guarda o cancela cambios

### Flujo Lookup Selection

1. ObjectInputComponent usuario click "Seleccionar"
2. Application.showModal(RelatedEntityClass, ViewTypes.LOOKUPVIEW, callback)
3. Modal renderiza default_lookup_listview.vue
4. default_lookup_listview.mounted() carga data (hardcoded o API)
5. Template renderiza LookupItem v-for data
6. Usuario visualiza lista items
7. Usuario click en LookupItem específico
8. clickedItem(item) invocado
9. closeModalOnFunction(item) ejecuta callback
10. Modal cierra con animación
11. ObjectInputComponent recibe item seleccionado
12. ObjectInputComponent actualiza v-model con item

## 6. Reglas Obligatorias

1. default_listview DEBE establecer ViewTypes.LISTVIEW en mounted
2. default_listview DEBE delegar renderizado completo a DetailViewTableComponent
3. default_detailview DEBE usar computed groupedProperties leyendo getViewGroups y getViewGroupRows
4. default_detailview DEBE filtrar propiedades hideInDetailView === true
5. default_detailview DEBE agrupar propiedades consecutivas mismo rowType en chunks
6. default_detailview DEBE usar getRowComponent para selección dinámica row component
7. default_detailview DEBE usar cadena if/else-if para selección dinámica input component según tipo
8. default_detailview DEBE renderizar arrays en tabs separados al final usando TabController
9. default_lookup_listview DEBE renderizar LookupItem por cada elemento
10. default_lookup_listview DEBE invocar closeModalOnFunction en clickedItem
11. DetailViewTableComponent DEBE generar headers desde getProperties
12. DetailViewTableComponent DEBE generar rows desde data array
13. DetailViewTableComponent DEBE usar @click openDetailView en cada fila
14. DetailViewTableComponent DEBE verificar instanceof BaseEntity para objetos relacionados
15. DetailViewTableComponent DEBE mostrar iconos CHECK/CANCEL para booleanos
16. DetailViewTableComponent DEBE usar getFormattedValue para valores primitivos
17. DetailViewTableComponent DEBE aplicar getCSSClasses para clases columna
18. DetailViewTableComponent DEBE usar getUniquePropertyValue como key único
19. openDetailView DEBE establecer entityOid antes de invocar changeViewToDetailView
20. Todas las vistas DEBEN leer entityClass y entity desde Application.View.value

## 7. Prohibiciones

1. NO renderizar arrays en DetailViewTableComponent (filtrados automáticamente)
2. NO mostrar propiedades @HideInListView en tabla
3. NO mostrar propiedades @HideInDetailView en formulario
4. NO cargar entidades directamente sin usar Application.View.value
5. NO establecer viewType manualmente excepto en mounted de vistas
6. NO ignorar hideInDetailView en computed groupedProperties
7. NO agrupar propiedades con diferente rowType en mismo chunk
8. NO usar componentes de input incorrectos para tipo de propiedad
9. NO omitir verificación instanceof BaseEntity en tabla
10. NO mostrar valor crudo objeto relacionado sin getDefaultPropertyValue
11. NO olvidar closeModalOnFunction en default_lookup_listview
12. NO hardcodear nombres de propiedades en templates (usar metadatos)
13. NO generar formularios manualmente sin usar groupedProperties
14. NO omitir getRowComponent para selección dinámica de rows
15. NO renderizar tabs arrays si no existen array properties
16. NO usar selectores CSS específicos de entidad (tables deben ser genéricas)
17. NO establecer entityOid sin invocar changeViewToDetailView después
18. NO modificar Application.View.value fuera de métodos Application
19. NO duplicar lógica de renderizado entre vistas (usar components)
20. NO omitir key único en v-for loops (usar getUniquePropertyValue)
21. NO usar expresiones condicionales complejas (ternarios encadenados) en template; moverlas a computed/methods

## 8. Dependencias

### Componentes
- DetailViewTableComponent (tabla dinámica)
- FormGroupComponent (agrupación visual)
- FormRowTwoItemsComponent (2 columnas)
- FormRowThreeItemsComponent (3 columnas)
- LookupItem (item seleccionable)
- TabControllerComponent (gestión tabs)
- TabComponent (tab individual)
- Todos los input components (TextInput, NumberInput, etc)

### Servicios
- Application singleton (View, changeViewToListView, changeViewToDetailView, showModal)

### Enums
- ViewTypes (LISTVIEW, DETAILVIEW, LOOKUPVIEW)
- StringType (TEXT, DATE, EMAIL, etc)
- ViewGroupRow (SINGLE, PAIR, TRIPLE)

### Entidades
- BaseEntity (clase base, métodos metadata)
- Cualquier entidad específica (Product, Customer, etc)

### Constantes
- GGICONS (iconos CHECK, CANCEL, etc)

### CSS
- @/css/table.css (estilos tabla)
- @/css/form.css (estilos formulario)

## 9. Relaciones

### Con Base Entity
- Lee getViewGroups obteniendo mapa grupos
- Lee getViewGroupRows obteniendo mapa rowTypes
- Lee getProperties generando headers tabla
- Lee getKeys obteniendo array property keys
- Invoca getDefaultPropertyValue mostrando objetos relacionados
- Invoca getUniquePropertyValue obteniendo key único
- Invoca getFormattedValue formateando valores
- Invoca getCSSClasses aplicando estilos columna
- Invoca getArrayKeysOrdered obteniendo arrays
- Invoca getPropertyNameByKey obteniendo nombres legibles

### Con Form Components
- default_detailview usa FormGroupComponent para agrupación visual
- default_detailview usa FormRowTwoItemsComponent para 2 columnas
- default_detailview usa FormRowThreeItemsComponent para 3 columnas
- default_detailview usa todos input components dinámicamente
- default_lookup_listview usa LookupItem para selección

### Con Application Singleton
- Todas vistas leen entityClass desde Application.View.value
- Todas vistas leen entity desde Application.View.value.entityObject
- default_listview establece viewType = ViewTypes.LISTVIEW
- DetailViewTableComponent invoca Application.changeViewToDetailView
- default_lookup_listview invoca closeModalOnFunction

### Con Router
- default_listview renderizada en ruta /:module
- default_detailview renderizada en ruta /:module/:oid
- ComponentContainer selecciona vista según ruta

## 10. Notas de Implementación

### Crear FormGroup Manual en Vista Personalizada

```vue
<template>
    <FormGroupComponent title="Información Básica">
        <FormRowTwoItemsComponent>
            <TextInputComponent 
                :entityClass="Product"
                :entity="product"
                propertyKey="name"
            />
            <NumberInputComponent 
                :entityClass="Product"
                :entity="product"
                propertyKey="price"
            />
        </FormRowTwoItemsComponent>
    </FormGroupComponent>
</template>
```

### Responsive Layout con Media Queries

```css
/* En FormRowTwoItemsComponent.vue */
.form-row-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 1rem;
}

@media (max-width: 768px) {
    .form-row-2 {
        grid-template-columns: 1fr; /* Una columna en móvil */
    }
}
```

### FormRowFourItems Custom (4 columnas)

```vue
<template>
    <div class="form-row-4">
        <slot></slot>
    </div>
</template>

<style scoped>
.form-row-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    column-gap: 1rem;
}
</style>
```

### Collapse/Expand FormGroup

```vue
<template>
    <FormGroupComponent 
        :title="group.groupName"
        :is-collapsed="collapsedGroups[group.groupName]"
        @toggle="toggleGroup(group.groupName)"
    >
        <div v-for="chunk in group.chunks" :key="chunk.index">
            <!-- inputs -->
        </div>
    </FormGroupComponent>
</template>

<script>
export default {
    data() {
        return {
            collapsedGroups: {
                'Información Básica': false,
                'Detalles Avanzados': true,
            },
        };
    },
    methods: {
        toggleGroup(groupName) {
            this.collapsedGroups[groupName] = !this.collapsedGroups[groupName];
        },
    },
};
</script>
```

### Debugging Layout groupedProperties

```javascript
mounted() {
    console.log('groupedProperties:', this.groupedProperties);
    // Verificar estructura:
    // [
    //   {
    //     groupName: 'Información Básica',
    //     chunks: [
    //       { rowType: ViewGroupRow.PAIR, properties: [...] },
    //       { rowType: ViewGroupRow.SINGLE, properties: [...] },
    //     ]
    //   }
    // ]
}
```

### Vista Lookup con Búsqueda

```vue
<template>
    <div>
        <input v-model="searchQuery" placeholder="Buscar..." />
        <LookupItem 
            v-for="item in filteredData" 
            :key="item.id"
            :itemFromList="item"
            @click="clickedItem(item)"
        />
    </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
    setup() {
        const searchQuery = ref('');
        const data = ref([]);
        
        const filteredData = computed(() => {
            if (!searchQuery.value) return data.value;
            return data.value.filter(item => 
                item.getDefaultPropertyValue()
                    .toLowerCase()
                    .includes(searchQuery.value.toLowerCase())
            );
        });
        
        return { searchQuery, filteredData };
    },
};
</script>
```

### Testing Vistas

```javascript
import { mount } from '@vue/test-utils';
import default_detailview from '@/views/default_detailview.vue';
import { Product } from '@/entities/products';

describe('default_detailview', () => {
    it('renderiza FormGroups desde getViewGroups', () => {
        const product = new Product({});
        Application.View.value.entityObject = product;
        Application.View.value.entityClass = Product;
        
        const wrapper = mount(default_detailview);
        const groups = wrapper.findAllComponents(FormGroupComponent);
        
        expect(groups.length).toBeGreaterThan(0);
    });
    
    it('renderiza inputs dinámicamente según tipo', () => {
        const wrapper = mount(default_detailview);
        
        expect(wrapper.findComponent(NumberInputComponent).exists()).toBe(true);
        expect(wrapper.findComponent(TextInputComponent).exists()).toBe(true);
    });
});
```

### FUTURE: Cargar Entidad desde API en DetailView

```javascript
/**
 * FUTURE: Load entity from API when entityOid is present but entityObject is null
 * @description When navigating to detail view via route params, this would load the entity data
 */
async mounted() {
    const entityOid = this.$route.params.oid;
    if (!this.entity && entityOid) {
        const endpoint = this.entityClass.getApiEndpoint();
        try {
            const response = await axios.get(`${endpoint}/${entityOid}`);
            this.entity = new this.entityClass(response.data);
            Application.View.value.entityObject = this.entity;
        } catch (error) {
            console.error('Error cargando entidad:', error);
        }
    }
}
```

### FUTURE: DetailViewTableComponent con Paginación

```vue
<template>
    <div>
        <table class="entity-table">
            <!-- tabla actual -->
        </table>
        <div class="pagination">
            <button @click="previousPage" :disabled="currentPage === 1">
                Anterior
            </button>
            <span>Página {{ currentPage }} de {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">
                Siguiente
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            currentPage: 1,
            itemsPerPage: 20,
            totalItems: 0,
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalItems / this.itemsPerPage);
        },
        paginatedData() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.data.slice(start, end);
        },
    },
    methods: {
        previousPage() {
            if (this.currentPage > 1) this.currentPage--;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
    },
};
</script>
```

## 11. Referencias Cruzadas

### Documentación Relacionada
- [DetailViewTableComponent.md](DetailViewTableComponent.md) - Componente tabla dinámica
- [form-inputs.md](form-inputs.md) - Sistema completo inputs
- [FormLayoutComponents.md](FormLayoutComponents.md) - FormGroup y FormRow components
- [LookupItem.md](LookupItem.md) - Item seleccionable lookup
- [TabComponents.md](TabComponents.md) - Sistema tabs
- [../02-base-entity/metadata-access.md](../02-base-entity/metadata-access.md) - Métodos metadata BaseEntity
- [../02-base-entity/base-entity-core.md](../02-base-entity/base-entity-core.md) - Sistema ViewGroup y ViewGroupRow
- [../03-application/application-singleton.md](../03-application/application-singleton.md) - Gestión vistas Application
- [../03-application/router-integration.md](../03-application/router-integration.md) - changeViewToListView y changeViewToDetailView
- [../01-decorators/view-group-decorator.md](../01-decorators/view-group-decorator.md) - @ViewGroup
- [../01-decorators/view-group-row-decorator.md](../01-decorators/view-group-row-decorator.md) - @ViewGroupRow
- [../01-decorators/hide-in-list-view-decorator.md](../01-decorators/hide-in-list-view-decorator.md) - @HideInListView
- [../01-decorators/hide-in-detail-view-decorator.md](../01-decorators/hide-in-detail-view-decorator.md) - @HideInDetailView

### Código Fuente
- src/views/default_listview.vue
- src/views/default_detailview.vue
- src/views/default_lookup_listview.vue
- src/views/list.vue
- src/components/DetailViewTableComponent.vue

### Enums Relacionados
- src/enums/view_types.ts (ViewTypes.LISTVIEW, DETAILVIEW, LOOKUPVIEW)
- src/enums/string_type.ts (StringType.TEXT, DATE, EMAIL, etc)
- src/enums/view_group_row.ts (ViewGroupRow.SINGLE, PAIR, TRIPLE)
