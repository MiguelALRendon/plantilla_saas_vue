# LookupItem Component - Item de Selección en Listas Lookup

## 1. Propósito

LookupItem representa un item individual clicable en una lista de lookup (selección de entidad relacionada) dentro de modales. Proporciona representación visual de una entidad BaseEntity mostrando su propiedad por defecto definida con decorador @DefaultProperty, permitiendo al usuario seleccionar la entidad completa mediante click.

El componente se utiliza exclusivamente dentro de default_lookup_listview.vue para renderizar listas de entidades disponibles para selección. Casos de uso típicos incluyen seleccionar Customer para Order, Category para Product, User para Assignment, o cualquier relación donde se necesita elegir una entidad de una lista completa.

## 2. Alcance

Este documento describe:
- La estructura y props de LookupItem component
- Integración con BaseEntity.getDefaultPropertyValue()
- Estilos CSS para card clicable con hover effect
- Flujo completo de selección desde apertura modal hasta callback
- Uso en default_lookup_listview.vue
- Personalización para mostrar múltiples campos o iconos
- Relación con @DefaultProperty decorator
- Integración con ObjectInputComponent y ApplicationUIService

El componente opera exclusivamente en contexto de modales lookup disparados por ObjectInputComponent cuando el usuario necesita seleccionar una entidad relacionada.

## 3. Definiciones Clave

**LookupItem**: Componente Vue que renderiza representación visual clicable de una instancia BaseEntity mostrando su propiedad por defecto, usado en listas de selección modal.

**@DefaultProperty Decorator**: Decorador de metadatos que marca una propiedad de entidad como propiedad display principal, utilizada por getDefaultPropertyValue() para determinar qué mostrar en LookupItem.

**getDefaultPropertyValue()**: Método de BaseEntity que retorna el valor de la propiedad marcada con @DefaultProperty, usado por LookupItem para determinar texto display.

**default_lookup_listview.vue**: Vista estándar que renderiza lista de LookupItem dentro de modal, iterando sobre array de entidades y manejando clicks de selección.

**ApplicationUIService.closeModalOnFunction(item)**: Método que cierra modal activo ejecutando callback onFunction almacenado pasando item seleccionado como argumento.

**ObjectInputComponent**: Input para propiedades BaseEntity que abre modal lookup cuando usuario hace click, permitiendo selección de entidad relacionada.

**Modal Lookup Context**: Contexto donde modal se abre con lista de entidades disponibles, Application.Modal.value almacena estado incluyendo callback onFunction.

**itemFromList Prop**: Prop que recibe instancia BaseEntity a renderizar en LookupItem individual.

## 4. Descripción Técnica

### Estructura del Componente

**Archivo:** src/components/Informative/LookupItemComponent.vue

**Props:**
```typescript
{
    itemFromList: BaseEntity  // Entidad a mostrar (required)
}
```

La prop itemFromList recibe instancia completa de BaseEntity (Customer, Product, etc.) que se renderiza como item seleccionable. El componente no recibe metadata adicional, todo se extrae de la entidad misma.

**Template:**
**Archivo:** src/components/Informative/LookupItemComponent.vue

**Ubicación del código fuente:** src/components/Informative/LookupItemComponent.vue

<template>
<div class="lookup-item-card">
    <span>{{ (itemFromList as BaseEntity).getDefaultPropertyValue() }}</span>
</div>
</template>
```

El template es extremadamente simple: div con clase CSS lookup-item-card conteniendo span que muestra resultado de getDefaultPropertyValue(). El casting (itemFromList as BaseEntity) asegura acceso correcto al método TypeScript.

### Estilos CSS

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
    filter: brightness(0.94);
}
```

**Características visuales:**
- border-radius: esquinas redondeadas consistentes con tema global
- padding: 1rem: espaciado interno generoso para área clicable
- cursor: pointer: indica interactividad al usuario
- background-color: fondo blanco card destacado
- margin-bottom: 0.75rem: separación entre items en lista
- transition: 0.5s ease: animación suave de efectos
- box-shadow: sombra ligera elevando card
- hover filter brightness(0.94): oscurecimiento sutil al hover (94% brillo original)

El efecto hover proporciona feedback visual inmediato indicando item clicable. La transición suaviza cambio de brillo evitando flash abrupto.

### Integración con BaseEntity.getDefaultPropertyValue()

**Método en BaseEntity:**
```typescript
public getDefaultPropertyValue(): any {
    const propertyName = (this.constructor as any)[DEFAULT_PROPERTY_KEY];
    if (!propertyName) {
        return undefined;
    }
    return (this as any)[propertyName];
}
```

El método accede a metadata almacenada por @DefaultProperty decorator. El DEFAULT_PROPERTY_KEY es Symbol único donde se almacena string con nombre de propiedad por defecto (ej: 'name', 'title', 'code'). Si no existe @DefaultProperty, retorna undefined causando que LookupItem muestre texto vacío.

**Ejemplo de Entidad con @DefaultProperty:**
```typescript
@ModuleName('Customers')
@DefaultProperty('name')
export class Customer extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Customer Name', String)
    name!: string;  // ← Esta es la propiedad por defecto
    
    @PropertyName('Email', String)
    email!: string;
}

// Instancia:
const customer = new Customer({ id: 1, name: 'John Doe', email: 'john@example.com' });

// En LookupItem:
customer.getDefaultPropertyValue()  // Retorna: "John Doe"
```

El @DefaultProperty('name') marca name como propiedad display. LookupItem muestra "John Doe", no "1" ni "john@example.com". Sin @DefaultProperty, getDefaultPropertyValue() retorna undefined y LookupItem renderizaría span vacío.

### Uso en default_lookup_listview.vue

**Vista de Lookup Completa:**
```vue
<template>
<div class="lookup-list-container">
    <LookupItem
        v-for="(item, index) in data"
        :key="index"
        :itemFromList="item"
        @click="clickedItem(item)"
    />
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LookupItem from '@/components/Informative/LookupItemComponent.vue';
import { Application } from '@/constants/application';
import type { BaseEntity } from '@/entities/base_entity';

export default defineComponent({
    name: 'default_lookup_listview',
    components: { LookupItem },
    methods: {
        clickedItem(item: BaseEntity) {
            Application.ApplicationUIService.closeModalOnFunction(item);
        }
    },
    async data() {
        // Cargar lista de entidades desde ModuleList
        const entityClass = Application.Modal.value.entityClass;
        const data = await entityClass.getElementList();
        return { data };
    }
});
</script>
```

**Flujo de Datos:**
1. default_lookup_listview carga array de entidades con entityClass.getElementList()
2. v-for itera sobre data renderizando LookupItem por cada entidad
3. :itemFromList pasa entidad individual a LookupItem
4. @click registra handler clickedItem en componente padre
5. Usuario hace click en LookupItem emitiendo evento click
6. clickedItem(item) ejecuta con entidad seleccionada
7. closeModalOnFunction(item) cierra modal y ejecuta callback pasando item

El @click se registra en componente padre (default_lookup_listview), no en LookupItem. LookupItem es elemento HTML nativo que emite click DOM event, no custom Vue event.

## 5. Flujo de Funcionamiento

1. **Apertura de Modal desde ObjectInput**: Usuario interactúa con ObjectInputComponent haciendo click en input de entidad relacionada. ObjectInputComponent detecta click ejecutando método openLookupModal(). El método invoca Application.ApplicationUIService.openModal() pasando entityClass de la propiedad relacionada, component: default_lookup_listview, y onFunction callback que recibirá entidad seleccionada. Application.Modal.value se actualiza con state incluyendo entityClass y callback.

2. **Carga de Entidades en Lookup View**: ModalComponent renderiza default_lookup_listview dentro del modal. En el lifecycle hook data() de default_lookup_listview, se extrae entityClass desde Application.Modal.value.entityClass. Se invoca await entityClass.getElementList() ejecutando petición HTTP al backend para obtener array completo de entidades disponibles. El array se retorna y Vue hace reactive data property accesible en template.

3. **Renderizado de Lista de LookupItems**: El template de default_lookup_listview ejecuta v-for="(item, index) in data" iterando sobre array de entidades cargadas. Para cada entidad, se renderiza un LookupItem component pasando :itemFromList="item" vinculando entidad individual. Se registra listener @click="clickedItem(item)" en elemento div root de LookupItem. Vue renderiza múltiples LookupItem verticalmente con margin-bottom separación automática.

4. **Extracción de Valor Display en LookupItem**: Cada LookupItem en su template ejecuta itemFromList.getDefaultPropertyValue() durante renderizado. El método accede a metadata DEFAULT_PROPERTY_KEY leyendo nombre de propiedad marcada con @DefaultProperty. Si existe, retorna valor de esa propiedad (ej: customer.name = "John Doe"). Si no existe @DefaultProperty, retorna undefined renderizando span vacío. El valor se muestra como texto dentro del span del template.

5. **Interacción Usuario Hover**: Usuario mueve mouse sobre LookupItem cards. El cursor cambia a pointer indicando elemento clicable. La pseudo-clase CSS :hover se activa aplicando filter: brightness(0.94) oscureciendo card a 94% brillo. La transition: 0.5s ease suaviza cambio de brillo creando animación sutil. Al salir del hover, el brillo retorna a 100% con misma transición suave.

6. **Click de Usuario en Item**: Usuario hace click en uno de los LookupItem cards. El evento DOM click nativo se dispara en el div.lookup-item-card. El listener @click="clickedItem(item)" registrado en default_lookup_listview captura evento. Vue ejecuta método clickedItem(item) pasando entidad completa correspondiente al item clicado. El método tiene acceso a instancia BaseEntity completa, no solo valor display.

7. **Cierre de Modal con Callback**: El método clickedItem ejecuta Application.ApplicationUIService.closeModalOnFunction(item) pasando entidad seleccionada como argumento. El método internamente ejecuta callback almacenado en Application.Modal.value.onFunction(item). El callback fue definido originalmente en ObjectInputComponent cuando abrió el modal. El callback recibe entidad seleccionada y actualiza v-model del input asignando entity[propertyKey] = selectedItem.

8. **Actualización de Input con Entidad Seleccionada**: El callback en ObjectInputComponent ejecuta this.$emit('update:modelValue', item) propagando entidad seleccionada al v-model. El componente padre (DefaultDetailView) recibe evento y actualiza entity[propertyKey] = item asignando entidad completa a propiedad de relación. Vue reactivity detecta cambio y re-renderiza ObjectInputComponent mostrando ahora item.getDefaultPropertyValue() en lugar de placeholder vacío.

9. **Persistencia de Relación**: Cuando usuario guarda la entidad principal haciendo click en SaveButton, entity.save() serializa entidad incluyendo propiedades de relación. Si la propiedad relacionada contiene instancia BaseEntity completa, el método toJson() extrae solo el id de la entidad relacionada antes de enviar al backend. El servidor recibe relación como foreign key ID, no entidad nested completa. Al recargar, BaseEntity.load() rehidrata relación cargando entidad relacionada por ID.

10. **Limpieza de Modal**: Después de closeModalOnFunction(), ModalComponent detecta cambio en Application.Modal.value.isActive = false. El componente ejecuta transición de salida fade-out opacity 0 durante 300ms. Luego el v-if="Application.Modal.value.isActive" oculta modal completamente. La instancia de default_lookup_listview se desmonta liberando data array de entidades. LookupItem components se destruyen y eventos se limpian automáticamente por Vue.

## 6. Reglas Obligatorias

1. **Entidad DEBE tener @DefaultProperty definido**: Toda entidad BaseEntity usada en lookup DEBE tener decorador @DefaultProperty aplicado a una propiedad. Sin @DefaultProperty, getDefaultPropertyValue() retorna undefined y LookupItem renderiza vacío sin indicación visual. Aplicar @DefaultProperty a propiedad más representativa de la entidad.

2. **itemFromList DEBE ser instancia completa BaseEntity**: La prop itemFromList DEBE recibir instancia completa de entidad con todos los datos cargados. No pasar objetos plain JavaScript. No pasar solo ID o valor display. LookupItem y callback necesitan acceso a entidad completa para funcionar correctamente.

3. **@click DEBE manejarse en componente padre**: LookupItem NO DEBE implementar lógica de click internamente. El @click listener DEBE registrarse en default_lookup_listview o vista lookup personalizada. Esto permite componente reutilizable con comportamiento configurable. LookupItem solo renderiza, no decide qué hacer al click.

4. **closeModalOnFunction DEBE recibir entidad completa**: Al invocar Application.ApplicationUIService.closeModalOnFunction(item), DEBE pasarse instancia completa BaseEntity seleccionada. No pasar item.id ni item.getDefaultPropertyValue(). El callback del input necesita entidad completa para asignar a v-model correctamente.

5. **LookupItem DEBE usarse dentro de modal**: LookupItem está diseñado para modales lookup, no para listas generales. No usar LookupItem en vistas de lista principales (usar default_listview.vue). No usar fuera de contexto de selección de entidad relacionada. Limitar uso a modales disparados por ObjectInputComponent.

6. **Estilos CSS NO DEBEN modificarse inline**: Los estilos CSS de LookupItem están diseñados para cohesión visual con framework. No aplicar :style="{ ... }" modificando padding, margin, o transition inline. Si necesitas estilos diferentes, crear componente lookup personalizado extendiendo LookupItem.

7. **Tipado estricto en computed**: `defaultPropertyValue` DEBE usar tipo explícito no-`any` (por ejemplo `unknown` o uniones concretas), conforme al contrato de estilo.

7. **getDefaultPropertyValue() DEBE retornar valor displayable**: La propiedad marcada con @DefaultProperty DEBE ser String, Number, o tipo convertible a string legible. No marcar propiedades Object, Array, o BaseEntity como DefaultProperty. El valor se renderiza directamente como texto sin transformación.

## 7. Prohibiciones

1. **NUNCA implementar lógica click dentro de LookupItem**: No añadir métodos methods: { handleClick() { ... } } dentro de LookupItemComponent.vue. No emitir custom event @click desde LookupItem. El componente DEBE ser presentacional puro. Toda lógica de selección DEBE residir en vista lookup padre.

2. **NUNCA usar LookupItem sin @DefaultProperty en entidad**: No usar LookupItem para renderizar entidades sin @DefaultProperty decorator. El componente fallaría sin feedback útil. Si entidad no puede tener DefaultProperty, crear componente lookup personalizado con lógica display diferente.

3. **NUNCA modificar itemFromList prop dentro del componente**: LookupItem DEBE ser read-only respecto a itemFromList. No ejecutar itemFromList[property] = value. No invocar métodos mutadores de entidad. LookupItem solo lee y muestra, nunca modifica.

4. **NUNCA anidar componentes interactivos dentro de LookupItem**: No colocar buttons, inputs, o componentes clicables dentro del template de LookupItem. El card completo es área clicable. Nested interactivity causa problemas de event bubbling y UX confusa. Mantener LookupItem como single-clickable card.

5. **NUNCA usar LookupItem para entidades no relacionadas**: No usar LookupItem para mostrar información de la entidad actual o datos no seleccionables. LookupItem es específicamente para selección de entidad relacionada desde lista. No reusar para otros propósitos display.

6. **NUNCA omitir key en v-for de LookupItem**: Al iterar LookupItem con v-for, SIEMPRE incluir :key binding único. Usar index es aceptable si array no se reordena. Preferir entity.id si disponible. Sin key, Vue puede renderizar incorrectamente después de cambios en data array.

7. **NUNCA assumir que getDefaultPropertyValue() es truthy**: El valor retornado puede ser undefined, null, empty string, o 0. LookupItem DEBE manejar casos donde valor es falsy sin crashear. No depender de valor existente para renderizado condicional. Mostrar string vacío es comportamiento aceptable para entidades sin DefaultProperty.

## 8. Dependencias

**Dependencias Directas:**
- @/entities/base_entity.ts: BaseEntity clase base proporciona método getDefaultPropertyValue() invocado en template de LookupItem para extraer valor display
- @/decorations/default_property_decorator.ts: @DefaultProperty decorator almacena metadata DEFAULT_PROPERTY_KEY indicando qué propiedad usar para display
- Vue 3 Reactivity: Reactive rendering del valor display cuando itemFromList cambia

**Dependencias de Vistas:**
- @/views/default_lookup_listview.vue: Vista que renderiza LookupItem en v-for iterando sobre array de entidades, maneja click de selección
- @/components/Modal/ModalComponent.vue: Modal wrapper que contiene default_lookup_listview proporcionando contexto visual

**Dependencias de Servicios:**
- @/constants/application.ts: Application.ApplicationUIService proporciona closeModalOnFunction() para cerrar modal con callback, Application.Modal.value almacena state modal
- @/services/ui_services.ts: ApplicationUIService implementa lógica apertura/cierre de modales, manejo callbacks onFunction

**Dependencias de Inputs:**
- @/components/Form/ObjectInputComponent.vue: ObjectInputComponent dispara apertura de modal lookup donde LookupItem se renderiza, define callback que recibe entidad seleccionada

**Dependencias de CSS:**
- @/css/constants.css: Variables CSS var(--white), var(--border-radius), var(--shadow-light) para estilos consistentes
- @/css/main.css: Estilos globales de cursor, transitions, filter properties

## 9. Relaciones

**Utilizado por:**
- default_lookup_listview.vue: Renderiza múltiples LookupItem en v-for creando lista seleccionable de entidades. Cada LookupItem representa un item disponible para selección.
- Vistas Lookup Personalizadas: CustomLookupView puede usar LookupItem para renderizado consistente con vistas estándar, solo cambiando lógica filtering o sorting.

**Depende de:**
- BaseEntity.getDefaultPropertyValue(): LookupItem invoca método para determinar qué texto mostrar. Sin este método, componente no podría extraer valor display.
- @DefaultProperty Decorator: Decorator define qué propiedad usar para display. Sin decorator, getDefaultPropertyValue() retorna undefined.

**Sincroniza con:**
- ObjectInputComponent: Cuando usuario selecciona LookupItem, ObjectInputComponent recibe entidad vía callback y actualiza su v-model. El display del ObjectInputComponent cambia de vacío a mostrar entidad seleccionada.
- Application.Modal.value: LookupItem se renderiza dentro de modal cuyo state se almacena en Application.Modal.value. Cuando se selecciona item, modal se cierra actualizando Modal.value.isActive.

**Interactúa con:**
- ApplicationUIService.closeModalOnFunction(): Vista lookup invoca método cuando LookupItem es clicado, pasando entidad seleccionada. Método cierra modal ejecutando callback almacenado.

**Se distingue de:**
- DetailViewTableComponent Row: DetailViewTableComponent renderiza filas de tabla navegables en vistas de lista principal. LookupItem renderiza cards clicables para selección en modales. Ambos muestran entidades pero con propósitos diferentes.

**Complementa:**
- ModalComponent: LookupItem proporciona contenido item individual dentro de modal que ModalComponent envuelve visualmente con backdrop y bordes.

## 10. Notas de Implementación

### Personalizar LookupItem para Mostrar Múltiples Campos

Si necesitas mostrar más que solo DefaultProperty:

```vue
<!-- CustomLookupItem.vue -->
<template>
<div class="lookup-item-card">
    <div class="lookup-item-main">
        <strong>{{ itemFromList.getDefaultPropertyValue() }}</strong>
    </div>
    <div class="lookup-item-secondary">
        ID: {{ itemFromList.id }} | Created: {{ formatDate(itemFromList.createdAt) }}
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { BaseEntity } from '@/entities/base_entity';

export default defineComponent({
    name: 'CustomLookupItem',
    props: {
        itemFromList: {
            type: Object as () => BaseEntity,
            required: true,
        },
    },
    methods: {
        formatDate(date: Date): string {
            return new Intl.DateTimeFormat('en-US').format(date);
        }
    }
});
</script>

<style scoped>
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

Usa CustomLookupItem en lugar de LookupItem estándar en tu lookup view personalizada.

### Añadir Icono a LookupItem

Para mostrar icono del módulo junto al texto:

```vue
<template>
<div class="lookup-item-card">
    <img :src="getModuleIcon()" class="lookup-icon" />
    <span>{{ itemFromList.getDefaultPropertyValue() }}</span>
</div>
</template>

<script lang="ts">
export default {
    props: {
        itemFromList: {
            type: Object as () => BaseEntity,
            required: true,
        },
    },
    methods: {
        getModuleIcon(): string {
            return (this.itemFromList.constructor as any).getModuleIcon?.() || '';
        }
    }
}
</script>

<style scoped>
.lookup-item-card {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.lookup-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
}
</style>
```

Requiere que la entidad tenga método estático getModuleIcon() definido o decorador @ModuleIcon.

### Crear Vista Lookup con Búsqueda

Para añadir search box filtrando LookupItems:

```vue
<!-- CustomLookupView.vue -->
<template>
<div class="lookup-view">
    <input 
        v-model="searchQuery"
        placeholder="Search..."
        class="lookup-search"
    />
    
    <div class="lookup-list">
        <LookupItem
            v-for="(item, index) in filteredData"
            :key="item.id"
            :itemFromList="item"
            @click="clickedItem(item)"
        />
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import LookupItem from '@/components/Informative/LookupItemComponent.vue';
import { Application } from '@/constants/application';

export default defineComponent({
    components: { LookupItem },
    setup() {
        const searchQuery = ref('');
        const data = ref([]);
        
        const filteredData = computed(() => {
            if (!searchQuery.value) return data.value;
            
            const query = searchQuery.value.toLowerCase();
            return data.value.filter(item => {
                const displayValue = item.getDefaultPropertyValue()?.toString().toLowerCase();
                return displayValue?.includes(query);
            });
        });
        
        return { searchQuery, data, filteredData };
    },
    methods: {
        clickedItem(item) {
            Application.ApplicationUIService.closeModalOnFunction(item);
        }
    },
    async mounted() {
        const entityClass = Application.Modal.value.entityClass;
        this.data = await entityClass.getElementList();
    }
});
</script>
```

El computed property filteredData filtra basándose en searchQuery. LookupItem itera sobre filteredData en lugar de data completo.

### Debugging Valor Display Vacío

Si LookupItem renderiza vacío:

```javascript
// En Vue DevTools, selecciona LookupItem y ejecuta:
this.itemFromList.getDefaultPropertyValue()  // ¿Retorna valor?

// Verifica que @DefaultProperty existe:
const propName = (this.itemFromList.constructor as any)[DEFAULT_PROPERTY_KEY];
console.log('Default property:', propName);  // ¿Retorna string como "name"?

// Verifica valor de la propiedad:
console.log('Property value:', this.itemFromList[propName]);  // ¿Undefined?

// Inspecciona entidad completa:
console.log('Full entity:', JSON.stringify(this.itemFromList));
```

Si propName es undefined, la entidad no tiene @DefaultProperty decorator. Añádelo a la clase.

Si propName existe pero valor es undefined, la entidad se cargó sin esa propiedad. Verifica backend response.

### Añadir Loading State a Vista Lookup

Para mostrar skeleton mientras cargan entidades:

```vue
<template>
<div class="lookup-view">
    <div v-if="isLoading" class="lookup-loading">
        <div class="skeleton-item" v-for="n in 5" :key="n"></div>
    </div>
    
    <div v-else>
        <LookupItem
            v-for="(item, index) in data"
            :key="item.id"
            :itemFromList="item"
            @click="clickedItem(item)"
        />
    </div>
</div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            isLoading: true,
            data: []
        };
    },
    async mounted() {
        this.isLoading = true;
        const entityClass = Application.Modal.value.entityClass;
        this.data = await entityClass.getElementList();
        this.isLoading = false;
    }
}
</script>

<style scoped>
.skeleton-item {
    height: 60px;
    background: var(--grad-skeleton);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: var(--border-radius);
    margin-bottom: 0.75rem;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
</style>
```

Mientras isLoading = true, renderiza skeleton items. Al completar carga, muestra LookupItems reales.

### Implementar Paginación en Lookup

Para listas grandes, añadir paginación:

```vue
<template>
<div class="lookup-view">
    <LookupItem
        v-for="(item, index) in paginatedData"
        :key="item.id"
        :itemFromList="item"
        @click="clickedItem(item)"
    />
    
    <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
</div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            data: [],
            currentPage: 1,
            itemsPerPage: 10
        };
    },
    computed: {
        paginatedData() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.data.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.data.length / this.itemsPerPage);
        }
    },
    methods: {
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        }
    }
}
</script>
```

paginatedData muestra solo items de página actual. Buttons navegan entre páginas actualizando currentPage.

### Testing de LookupItem

Pruebas unitarias para LookupItem:

```typescript
import { mount } from '@vue/test-utils';
import LookupItem from '@/components/Informative/LookupItemComponent.vue';
import { Customer } from '@/entities/customer';

describe('LookupItem', () => {
    it('should display default property value', () => {
        const customer = new Customer({ id: 1, name: 'John Doe' });
        const wrapper = mount(LookupItem, {
            props: {
                itemFromList: customer,
            },
        });
        
        expect(wrapper.text()).toContain('John Doe');
    });
    
    it('should emit click event when clicked', async () => {
        const customer = new Customer({ id: 1, name: 'John Doe' });
        const wrapper = mount(LookupItem, {
            props: {
                itemFromList: customer,
            },
        });
        
        await wrapper.find('.lookup-item-card').trigger('click');
        
        // Verificar que evento DOM click se emitió
        // (Listener @click se registra en componente padre, no en LookupItem)
    });
    
    it('should handle undefined default property gracefully', () => {
        const customer = new Customer({ id: 1 });  // Sin name
        const wrapper = mount(LookupItem, {
            props: {
                itemFromList: customer,
            },
        });
        
        // No debe crashear, debe renderizar vacío o undefined
        expect(wrapper.find('.lookup-item-card').exists()).toBe(true);
    });
});
```

## 11. Referencias Cruzadas

**Documentos Relacionados:**
- [core-components.md](core-components.md): Documentación componentes core del framework incluyendo estructura general
- [views-overview.md](views-overview.md): Vista que utiliza LookupItem para renderizar listas lookup en modales
- [object-input-component.md](object-input-component.md): Input que dispara apertura de modal lookup renderizando LookupItems
- [modal-components.md](modal-components.md): ModalComponent que envuelve vista lookup conteniendo LookupItems
- ../02-base-entity/base-entity-core.md: Método getDefaultPropertyValue() invocado por LookupItem para extraer display value
- ../01-decorators/default-property-decorator.md: Decorador @DefaultProperty que define qué propiedad mostrar en LookupItem
- ../03-application/ui-services.md: ApplicationUIService.closeModalOnFunction() para cerrar modal al seleccionar LookupItem
- ../03-application/application-singleton.md: Application.Modal.value state que almacena contexto modal incluyendo entityClass y callback
