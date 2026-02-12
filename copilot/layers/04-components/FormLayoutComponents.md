# Form Layout Components - Componentes de Layout para Formularios

## Sección 1: Propósito

Los componentes de layout para formularios organizan inputs en grupos visuales coherentes y filas multi-columna con diseño responsivo. Proporcionan estructura y organización a formularios generados dinámicamente sin requerir CSS manual.

FormGroupComponent agrupa inputs bajo títulos de sección con bordes visuales distinguidos. FormRowTwoItemsComponent coloca dos inputs lado a lado en layout de dos columnas iguales. FormRowThreeItemsComponent coloca tres inputs en layout de tres columnas iguales. Estos componentes trabajan en conjunto con decoradores @ViewGroup y @ViewGroupRow para producir formularios organizados automáticamente desde metadatos de entidad.

## Sección 2: Alcance

Este documento describe:
- FormGroupComponent para agrupación de secciones con títulos
- FormRowTwoItemsComponent para layout de 2 columnas
- FormRowThreeItemsComponent para layout de 3 columnas
- Estructura HTML y CSS de cada componente
- Integración con decoradores @ViewGroup y @ViewGroupRow
- Generación automática de layout en DefaultDetailView
- Consideraciones de responsive design y anidamiento

Los componentes operan exclusivamente en el contexto de formularios de detalle CRUD. Se renderizan dentro de DefaultDetailView o vistas personalizadas que contienen inputs de entidades BaseEntity.

## Sección 3: Definiciones Clave

**FormGroupComponent**: Componente contenedor que agrupa múltiples inputs bajo un título de sección con borde visual superior y espaciado estandarizado, renderizado como card con sombra.

**FormRowTwoItemsComponent**: Componente layout que aplica CSS Grid de 2 columnas iguales (1fr 1fr) con gap horizontal de 1rem, colocando exactamente 2 inputs lado a lado.

**FormRowThreeItemsComponent**: Componente layout que aplica CSS Grid de 3 columnas iguales (1fr 1fr 1fr) con gap horizontal de 1rem, colocando exactamente 3 inputs en una fila.

**@ViewGroup Decorator**: Decorador de metadatos que asigna una propiedad a un grupo nombrado, agrupando propiedades con mismo nombre de grupo bajo un FormGroupComponent con ese título.

**@ViewGroupRow Decorator**: Decorador de metadatos que define el tipo de fila (SINGLE, TWO, THREE) determinando si la propiedad se renderiza en fila completa, FormRowTwoItems, o FormRowThreeItems.

**ViewGroupRow Enum**: Enumeración con valores SINGLE (fila completa sin row component), TWO (FormRowTwoItems), THREE (FormRowThreeItems) usado por @ViewGroupRowDecorator.

**Slot Content**: Contenido proyectado dentro de los componentes layout mediante <slot></slot>, típicamente inputs individuales o nested layouts.

**CSS Grid Layout**: Sistema CSS Grid con grid-template-columns para columnas responsivas y column-gap para espaciado horizontal entre inputs.

## Sección 4: Descripción Técnica

### FormGroupComponent

**Archivo:** src/components/Form/FormGroupComponent.vue

**Props:**
```typescript
{
    title: string  // Título del grupo (required)
}
```

**Estructura HTML:**
```vue
<template>
<div class="form-group">
    <div class="form-group-header">
        <span>{{ title }}</span>
    </div>

    <div class="form-group-body">
        <div class="form-group-body-container">
            <div class="form-group-body-content">
                <slot></slot>
            </div>
        </div>
    </div>
</div>
</template>
```

El componente renderiza estructura anidada: form-group raíz con fondo blanco y sombra, form-group-header con título bold y borde inferior gris, form-group-body con padding, form-group-body-container con CSS Grid transiciones, form-group-body-content con overflow visible conteniendo slot inputs.

**Estilos CSS:**
```css
.form-group {
    background-color: var(--white);
    border-radius: var(--border-radius);
    margin-block: 1rem;
    box-shadow: var(--shadow-light);
}

.form-group-header {
    font-weight: bold;
    font-size: 1.25rem;
    color: var(--gray-medium);
    padding: 1rem;
    border-bottom: 1px solid var(--gray-lighter);
    height: 30px;
    max-height: 30px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.form-group-body {
    padding-block: 1rem;
    padding-inline: 0.5rem;
}

.form-group-body-container {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 0.3s ease;
}

.form-group-body-content {
    overflow: visible;
}
```

El header usa flexbox con height fijo 30px para consistencia. El border-bottom separa visualmente título de contenido. El body aplica padding vertical 1rem y horizontal 0.5rem. El container usa grid-template-rows para animaciones expand/collapse futuras con transition 0.3s ease.

**Ejemplo de Uso:**
```vue
<FormGroupComponent title="Customer Information">
    <TextInputComponent 
        :entity="customer"
        property-key="name"
        v-model="customer.name" />
    
    <EmailInputComponent 
        :entity="customer"
        property-key="email"
        v-model="customer.email" />
    
    <TextInputComponent 
        :entity="customer"
        property-key="phone"
        v-model="customer.phone" />
</FormGroupComponent>
```

Resultado visual renderizado como card:
```
┌─────────────────────────────────────┐
│ Customer Information                │ ← Header bold con border
├─────────────────────────────────────┤
│ Name:    [___________________]      │ ← Body con inputs
│ Email:   [___________________]      │
│ Phone:   [___________________]      │
└─────────────────────────────────────┘
```

### FormRowTwoItemsComponent

**Archivo:** src/components/Form/FormRowTwoItemsComponent.vue

**Estructura HTML:**
```vue
<template>
    <div class="form-row-2">
        <slot></slot>
    </div>
</template>
```

Componente extremadamente simple que solo aplica clase CSS form-row-2 a div contenedor. No tiene props, no tiene lógica, solo proyecta slot content con layout grid.

**Estilos CSS:**
```css
.form-row-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 1rem;
}
```

El display: grid activa CSS Grid. El grid-template-columns: repeat(2, 1fr) crea 2 columnas de ancho igual dividiendo espacio disponible equitativamente. El column-gap: 1rem añade separación horizontal de 1rem entre columnas. No hay row-gap porque cada FormRow es fila independiente.

**Ejemplo de Uso:**
```vue
<FormGroupComponent title="Address">
    <FormRowTwoItemsComponent>
        <TextInputComponent 
            :entity="address"
            property-key="street"
            v-model="address.street" />
        
        <TextInputComponent 
            :entity="address"
            property-key="city"
            v-model="address.city" />
    </FormRowTwoItemsComponent>
</FormGroupComponent>
```

Resultado visual con 2 inputs lado a lado:
```
┌─────────────────────────────────────┐
│ Address                             │
├─────────────────────────────────────┤
│ Street: [__________] City: [_______]│ ← 2 columnas con gap
└─────────────────────────────────────┘
```

### FormRowThreeItemsComponent

**Archivo:** src/components/Form/FormRowThreeItemsComponent.vue

**Estructura HTML:**
```vue
<template>
    <div class="form-row-3">
        <slot></slot>
    </div>
</template>
```

Idéntico a FormRowTwoItems en simplicidad, solo aplica clase CSS form-row-3 diferente para 3 columnas.

**Estilos CSS:**
```css
.form-row-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 1rem;
}
```

El grid-template-columns: repeat(3, 1fr) crea 3 columnas iguales. Cada input ocupa 1/3 del ancho disponible. El column-gap mantiene separación consistente entre columnas.

**Ejemplo de Uso:**
```vue
<FormGroupComponent title="Date Range">
    <FormRowThreeItemsComponent>
        <NumberInputComponent 
            :entity="filter"
            property-key="year"
            v-model="filter.year" />
        
        <NumberInputComponent 
            :entity="filter"
            property-key="month"
            v-model="filter.month" />
        
        <NumberInputComponent 
            :entity="filter"
            property-key="day"
            v-model="filter.day" />
    </FormRowThreeItemsComponent>
</FormGroupComponent>
```

Resultado visual con 3 inputs compactos:
```
┌─────────────────────────────────────┐
│ Date Range                          │
├─────────────────────────────────────┤
│ Year: [____] Month: [__] Day: [___] │ ← 3 columnas iguales
└─────────────────────────────────────┘
```

### Integración con @ViewGroupRow Decorator

**Decorador ViewGroupRow:**
```typescript
import { ViewGroupRow } from '@/enums/view_group_row';

@PropertyName('First Name', String)
@ViewGroup('Personal Info')
@ViewGroupRowDecorator(ViewGroupRow.TWO)
firstName!: string;

@PropertyName('Last Name', String)
@ViewGroup('Personal Info')
@ViewGroupRowDecorator(ViewGroupRow.TWO)
lastName!: string;

@PropertyName('Email', String)
@ViewGroup('Personal Info')
@ViewGroupRowDecorator(ViewGroupRow.SINGLE)
email!: string;
```

El decorador @ViewGroupRowDecorator almacena metadata indicando tipo de fila. DefaultDetailView lee metadata y agrupa propiedades consecutivas con mismo ViewGroupRow en mismo FormRowComponent.

**Resultado Automático:**
```
┌─────────────────────────────────────┐
│ Personal Info                       │
├─────────────────────────────────────┤
│ First Name: [_______] Last: [______]│ ← FormRowTwoItems automático
│ Email: [_________________________]  │ ← Fila completa sin row component
└─────────────────────────────────────┘
```

firstName y lastName comparten ViewGroupRow.TWO, se agrupan en FormRowTwoItemsComponent. email tiene ViewGroupRow.SINGLE, se renderiza solo en fila completa sin row component wrapper.

### Generación Automática en DefaultDetailView

DefaultDetailView contiene lógica de agrupación automática:

```typescript
// Lógica simplificada
const groupedProperties = computed(() => {
    const groups = entity.getViewGroups();  // Map<string, string[]>
    const rows = entity.getViewGroupRows();  // Map<string, ViewGroupRow>
    
    return organizeByGroupsAndRows(groups, rows);
});
```

```vue
<FormGroupComponent :title="groupName" v-for="group in groupedProperties">
    <template v-for="(chunk, index) in group">
        <component :is="getRowComponent(chunk.rowType)">
            <div v-for="prop in chunk.properties">
                <!-- Render input component for prop -->
            </div>
        </component>
    </template>
</FormGroupComponent>
```

**Método getRowComponent:**
```typescript
methods: {
    getRowComponent(rowType: string) {
        switch(rowType) {
            case 'two':
                return FormRowTwoItemsComponent;
            case 'three':
                return FormRowThreeItemsComponent;
            default:
                return 'div';  // Fila simple sin row component
        }
    }
}
```

El método retorna dinámicamente el componente apropiado. component :is renderiza dinámicamente FormRowTwoItems, FormRowThreeItems, o div según metadata rowType. Esto elimina necesidad de especificar layout manualmente en templates.

## Sección 5: Flujo de Funcionamiento

1. **Definición de Metadatos en Entidad**: El desarrollador aplica decoradores @ViewGroup y @ViewGroupRowDecorator a propiedades de la clase entidad. @ViewGroup('Personal Info') agrupa firstName y lastName bajo sección "Personal Info". @ViewGroupRowDecorator(ViewGroupRow.TWO) indica que firstName y lastName deben renderizarse en FormRowTwoItems. Los decoradores almacenan información en MetadataKeys de Reflect.

2. **Carga de Entidad en DetailView**: DefaultDetailView recibe entityClass y entity como props desde ModuleRouterView. En setup(), se extraen metadatos con entity.getViewGroups() retornando Map<groupName, propertyKeys[]> y entity.getViewGroupRows() retornando Map<propertyKey, ViewGroupRow>. Estos maps se construyen leyendo metadata de Reflect almacenada por decoradores.

3. **Agrupación de Propiedades**: Un computed property groupedProperties itera sobre getViewGroups() organizando propiedades en estructura anidada groupName -> chunks -> properties. Cada chunk representa una fila con rowType (SINGLE, TWO, THREE) y array de propertyKeys. Propiedades con mismo ViewGroup y ViewGroupRow consecutivo se agrupan en mismo chunk.

4. **Renderizado de FormGroupComponent**: El template itera v-for="group in groupedProperties" renderizando un FormGroupComponent por cada grupo. El prop :title recibe el groupName (ej: "Personal Info"). FormGroupComponent renderiza su estructura HTML con form-group-header mostrando título bold y border-bottom, y form-group-body container para contenido.

5. **Selección de Row Component**: Dentro de cada FormGroupComponent, se itera sobre chunks del grupo con v-for="(chunk, index) in group". Para cada chunk, se invoca getRowComponent(chunk.rowType) retornando FormRowTwoItemsComponent, FormRowThreeItemsComponent, o 'div'. El componente se renderiza dinámicamente con <component :is="getRowComponent(chunk.rowType)">. Si rowType es TWO, se renderiza FormRowTwoItems con CSS grid 2 columnas.

6. **Proyección de Inputs en Row**: Dentro del row component seleccionado, se itera sobre chunk.properties con v-for="prop in chunk.properties". Para cada propertyKey, se selecciona el input component apropiado (NumberInput, TextInput, etc.) basándose en entityClass.getPropertyType(prop). El input recibe props entityClass, entity, propertyKey, v-model. Los inputs se proyectan como slot content del row component aplicando layout grid automático.

7. **Aplicación de CSS Grid**: El row component (FormRowTwoItems o FormRowThreeItems) aplica display: grid y grid-template-columns a sus hijos (inputs proyectados). Los inputs se distribuyen automáticamente en columnas iguales con column-gap separación. Los navegadores calculan ancho de cada columna dividiendo espacio disponible entre número de columnas (2 o 3). No se requiere CSS adicional en inputs.

8. **Renderizado Visual de Card**: FormGroupComponent aplica background-color: white, border-radius, box-shadow creando apariencia de card. El form-group-header con padding 1rem y border-bottom gris separa título de contenido. El form-group-body con padding 1rem proporciona espaciado interno. Múltiples FormGroupComponent se apilan verticalmente con margin-block: 1rem creando separación entre secciones.

9. **Interacción Usuario con Inputs**: El usuario interactúa con inputs dentro de las filas multi-columna. Los inputs funcionan normalmente con v-model y validación independiente del layout. El layout solo afecta posicionamiento visual, no funcionalidad. Inputs en FormRowTwo mantienen separación con column-gap 1rem evitando superposición.

10. **Responsive Design (Futuro)**: Media queries CSS pueden convertir rows multi-columna a columna única en mobile. @media (max-width: 768px) { .form-row-2, .form-row-3 { grid-template-columns: 1fr; } } cambia layout a columna única apilando inputs verticalmente. FormGroupComponent mantiene estructura card pero inputs se reorganizan automáticamente sin cambiar lógica component.

## Sección 6: Reglas Obligatorias

1. **FormGroupComponent DEBE recibir prop title**: El prop title es required y DEBE ser string no vacío. El título se renderiza en form-group-header visible al usuario. No omitir title prop, resultaría en header vacío sin contexto visual.

2. **FormRowTwoItems DEBE contener exactamente 2 inputs hijos**: El grid de 2 columnas está diseñado para 2 inputs. Colocar menos de 2 inputs causa ancho excesivo (cada input ocupa 50% ancho aunque solo hay 1). Colocar más de 2 inputs causa wrap inesperado o desbordamiento. Planificar agrupación para pares de inputs.

3. **FormRowThreeItems DEBE contener exactamente 3 inputs hijos**: Análogo a FormRowTwo, el grid de 3 columnas requiere 3 inputs para distribución visual correcta. Usar solo para tríos de inputs relacionados (día/mes/año, largo/ancho/alto, etc.). No usar para 2 o 4 inputs.

4. **NO anidar FormRow dentro de otro FormRow**: FormRowTwoItems y FormRowThreeItems NO DEBEN anidarse recursivamente. La estructura correcta es FormGroup > FormRow > Inputs. No FormGroup > FormRow > FormRow > Inputs. El anidamiento causa layout grid incorrecto y estilos conflictivos.

5. **Inputs dentro de FormRow DEBEN ser hijos directos**: Los inputs DEBEN proyectarse directamente en slot de FormRow sin wrappers div intermedios salvo necesidad absoluta. Wrappers adicionales interfieren con grid layout. El CSS grid asume hijos directos son grid items.

6. **FormGroupComponent DEBE usarse para agrupar secciones lógicas**: No usar FormGroupComponent para inputs individuales sin agrupación semántica. El overhead de card con header solo justifica cuando hay múltiples inputs relacionados bajo título común. Agrupar por categoría lógica (Personal Info, Contact Details, etc.).

7. **Respetar orden visual definido por @PropertyIndex**: Cuando DefaultDetailView renderiza inputs automáticamente, el orden DEBE respetar @PropertyIndex de propiedades. Los inputs en FormRow DEBEN ordenarse según índice creciente. No reordenar manualmente inputs dentro de rows generados automáticamente.

## Sección 7: Prohibiciones

1. **NUNCA usar FormRowTwoItems para un solo input**: No envolver un input solitario en FormRowTwoItems. El input ocuparía 50% del ancho disponible dejando espacio vacío. Renderizar input directamente dentro de FormGroupComponent sin row component. ViewGroupRow.SINGLE para fila completa.

2. **NUNCA omitir FormGroupComponent cuando hay múltiples grupos**: No renderizar inputs de múltiples grupos sin FormGroupComponent separándolos. Sin FormGroup, no hay separación visual ni títulos identificando secciones. Siempre usar FormGroupComponent cuando @ViewGroup define múltiples grupos.

3. **NUNCA aplicar estilos width o flex directamente a FormRow**: No sobrescribir estilos grid con width: 100% o display: flex en FormRow. Los componentes dependen de CSS Grid específico para funcionar correctamente. Modificar estilos causa layout roto. Aplicar estilos personalizados a inputs hijos, no al row container.

4. **NUNCA usar FormRow fuera de contexto de formulario**: FormRowTwoItems y FormRowThreeItems están diseñados para inputs de formulario dentro de FormGroup. No usar para layout general de componentes no-formulario. Existen componentes layout genéricos para ese propósito. Limitar uso a formularios CRUD.

5. **NUNCA mezclar inputs y FormGroup dentro de mismo FormRow**: Un FormRow DEBE contener solo inputs como hijos directos. No colocar FormGroupComponent dentro de FormRow. La jerarquía correcta es FormGroup > FormRow > Inputs, nunca FormRow > FormGroup. El nesting incorrecto rompe semántica y estilos.

6. **NUNCA modificar grid-template-columns de FormRow inline**: No usar :style="{ gridTemplateColumns: '... }" para modificar columnas dinámicamente. Los componentes definen layout fijo de 2 o 3 columnas. Si necesitas layout diferente, crear nuevo componente FormRowCustomComponent con grid-template-columns personalizado. No modificar componentes existentes inline.

7. **NUNCA ignorar ViewGroupRow metadata en renderizado manual**: Cuando se crean vistas personalizadas que ignoran DefaultDetailView, NO ignorar @ViewGroupRowDecorator metadata. Leer metadata con entity.getViewGroupRows() y respetar layout especificado. Los decoradores son fuente de verdad para layout, no decisiones arbitrarias en templates.

## Sección 8: Dependencias

**Dependencias Directas:**
- Vue 3 Composition API: defineComponent, slots para proyección contenido en FormGroupComponent y FormRow components
- CSS Variables: var(--white), var(--gray-medium), var(--gray-lighter), var(--border-radius), var(--shadow-light) para estilos consistentes con tema global
- @/enums/view_group_row.ts: ViewGroupRow enum (SINGLE, TWO, THREE) define tipos de fila posibles

**Dependencias de Decoradores:**
- @/decorations/view_group_decorator.ts: @ViewGroup decorator almacena groupName en metadata, leído por entity.getViewGroups()
- @/decorations/view_group_row_decorator.ts: @ViewGroupRowDecorator almacena ViewGroupRow en metadata, leído por entity.getViewGroupRows()

**Dependencias de Vistas:**
- @/views/default_detailview.vue: DefaultDetailView contiene lógica de agrupación automática y renderizado de FormGroup con FormRow
- @/components/Form/: Todos los input components (TextInput, NumberInput, etc.) se proyectan como slot content en FormRow

**Dependencias de Entidad:**
- @/entities/base_entitiy.ts: BaseEntity proporciona métodos getViewGroups() y getViewGroupRows() que leen metadata para organizar layout

## Sección 9: Relaciones

**Utilizado por:**
- DefaultDetailView: Renderiza FormGroupComponent para cada grupo único definido por @ViewGroup. Renderiza FormRowTwoItems o FormRowThreeItems según @ViewGroupRowDecorator metadata. Pasa inputs como slot content.
- Vistas Personalizadas: CustomModuleDetailView puede usar FormGroup y FormRow manualmente para layout consistente con vistas generadas.

**Contiene:**
- Form Input Components: FormRowTwoItems y FormRowThreeItems contienen inputs proyectados (TextInput, NumberInput, BooleanInput, etc.) como slot content aplicando layout grid.

**Sincroniza con:**
- @ViewGroup Decorator: FormGroupComponent title se pobla desde groupName definido por @ViewGroup en entidad. Cambiar @ViewGroup('Title') actualiza título renderizado automáticamente.
- @ViewGroupRow Decorator: ViewGroupRow.TWO causa renderizado de FormRowTwoItems, ViewGroupRow.THREE causa FormRowThreeItems. Cambiar decorator actualiza layout automáticamente.

**Complementa:**
- Form Input Components: Los layout components solo organizan inputs, no modifican funcionalidad. Inputs mantienen validación, v-model, metadatos independiente del layout que los contiene.

**Se distingue de:**
- Tab Components: FormGroupComponent organiza secciones en single view lineal. TabComponent organiza secciones en views separadas con navegación. FormGroup visible todo simultáneamente, Tabs ocultan contenido inactivo.

## Sección 10: Notas de Implementación

### Crear FormGroup Manualmente en Vista Personalizada

Si no usas DefaultDetailView automático:

```vue
<template>
<FormGroupComponent title="Product Details">
    <!-- Fila completa -->
    <TextInputComponent 
        :entity="product"
        property-key="name"
        v-model="product.name" />
    
    <!-- Fila con 2 items -->
    <FormRowTwoItemsComponent>
        <NumberInputComponent 
            :entity="product"
            property-key="price"
            v-model="product.price" />
        
        <NumberInputComponent 
            :entity="product"
            property-key="stock"
            v-model="product.stock" />
    </FormRowTwoItemsComponent>
    
    <!-- Fila con 3 items -->
    <FormRowThreeItemsComponent>
        <NumberInputComponent 
            :entity="product"
            property-key="length"
            v-model="product.length" />
        
        <NumberInputComponent 
            :entity="product"
            property-key="width"
            v-model="product.width" />
        
        <NumberInputComponent 
            :entity="product"
            property-key="height"
            v-model="product.height" />
    </FormRowThreeItemsComponent>
</FormGroupComponent>
</template>

<script lang="ts">
import FormGroupComponent from '@/components/Form/FormGroupComponent.vue';
import FormRowTwoItemsComponent from '@/components/Form/FormRowTwoItemsComponent.vue';
import FormRowThreeItemsComponent from '@/components/Form/FormRowThreeItemsComponent.vue';
import NumberInputComponent from '@/components/Form/NumberInputComponent.vue';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';

export default {
    components: {
        FormGroupComponent,
        FormRowTwoItemsComponent,
        FormRowThreeItemsComponent,
        NumberInputComponent,
        TextInputComponent,
    },
};
</script>
```

### Añadir Media Query Responsive

Para convertir rows multi-columna a columna única en móvil:

```css
/* En archivo CSS global o scoped */
@media (max-width: 768px) {
    .form-row-2,
    .form-row-3 {
        grid-template-columns: 1fr !important;
    }
}
```

En pantallas menores a 768px, ambos FormRow se convierten a single column apilando inputs verticalmente. El !important sobrescribe estilos originales. Los inputs mantienen orden pero ocupan ancho completo.

### Crear FormRowCustomComponent con 4 Columnas

Si necesitas layout de 4 columnas:

```vue
<!-- FormRowFourItemsComponent.vue -->
<template>
    <div class="form-row-4">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FormRowFourItemsComponent',
});
</script>

<style scoped>
.form-row-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    column-gap: 1rem;
}

@media (max-width: 768px) {
    .form-row-4 {
        grid-template-columns: repeat(2, 1fr);  /* 2x2 grid en móvil */
    }
}

@media (max-width: 480px) {
    .form-row-4 {
        grid-template-columns: 1fr;  /* 1 columna en móvil pequeño */
    }
}
</style>
```

Define nuevo enum ViewGroupRow.FOUR en view_group_row.ts. Extiende getRowComponent() en DefaultDetailView para retornar FormRowFourItems cuando rowType === 'four'.

### Aplicar Collapse/Expand a FormGroup

Para hacer FormGroup colapsable:

```vue
<!-- FormGroupComponent.vue modificado -->
<template>
<div class="form-group">
    <div class="form-group-header" @click="toggleCollapse">
        <span>{{ title }}</span>
        <span class="collapse-icon">{{ isCollapsed ? '▼' : '▲' }}</span>
    </div>

    <div class="form-group-body" v-show="!isCollapsed">
        <div class="form-group-body-container">
            <div class="form-group-body-content">
                <slot></slot>
            </div>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'FormGroupComponent',
    props: {
        title: {
            type: String,
            required: true,
        },
        initiallyCollapsed: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const isCollapsed = ref(props.initiallyCollapsed);
        
        const toggleCollapse = () => {
            isCollapsed.value = !isCollapsed.value;
        };
        
        return { isCollapsed, toggleCollapse };
    },
});
</script>

<style scoped>
.form-group-header {
    cursor: pointer;
    user-select: none;
}

.collapse-icon {
    margin-left: auto;
}

.form-group-body {
    transition: all 0.3s ease;
}
</style>
```

Añadir @click="toggleCollapse" al header y v-show="!isCollapsed" al body. Estado isCollapsed controla visibilidad. Transition suaviza animación.

### Agregar Icono al Título de FormGroup

Para mostrar icono junto al título:

```vue
<FormGroupComponent title="Customer Information">
    <template #icon>
        <img src="@/assets/icons/customer.svg" class="group-icon" />
    </template>
    
    <!-- Inputs aquí -->
</FormGroupComponent>
```

Modificar FormGroupComponent para aceptar named slot "icon":

```vue
<div class="form-group-header">
    <slot name="icon"></slot>
    <span>{{ title }}</span>
</div>
```

Añadir CSS:
```css
.group-icon {
    width: 24px;
    height: 24px;
    margin-right: 0.5rem;
}
```

### Debugging Layout Issues

Si FormRow no renderiza correctamente:

```javascript
// En Vue DevTools, inspecciona el FormRow component
$el.style.gridTemplateColumns  // Verifica que sea "1fr 1fr" para FormRowTwo

// Cuenta hijos directos del FormRow
$el.children.length  // Debe ser 2 para FormRowTwo, 3 para FormRowThree

// Verifica que hijos sean inputs, no wrappers
Array.from($el.children).forEach(child => {
    console.log(child.tagName, child.className);
});

// Si grid no aplica, verifica que CSS se cargó
getComputedStyle($el).display  // Debe ser "grid"
```

Si gaps no aparecen:
```javascript
getComputedStyle($el).columnGap  // Debe ser "16px" (1rem)
```

### Integrar con ViewGroup Dinámico

Para cambiar groupName dinámicamente en runtime:

```typescript
// NO ES POSIBLE cambiar decoradores en runtime
// Los decoradores se aplican en tiempo de compilación

// Alternativa: Usar custom view con FormGroup manual
<FormGroupComponent :title="dynamicGroupName">
    <!-- Inputs -->
</FormGroupComponent>

computed: {
    dynamicGroupName() {
        return this.entity.status === 'active' 
            ? 'Active Customer Details'
            : 'Inactive Customer Details';
    }
}
```

Los decoradores @ViewGroup son estáticos. Para títulos dinámicos, renderizar FormGroup manualmente en vista personalizada con :title computed property.

## Sección 11: Referencias Cruzadas

**Documentos Relacionados:**
- [form-inputs.md](form-inputs.md): Componentes de inputs que se proyectan en FormRow como slot content
- [core-components.md](core-components.md): Componentes core del framework incluyendo structure general
- ../views/default-detailview.md: Vista que utiliza FormGroup y FormRow automáticamente para renderizar formularios
- ../../02-base-entity/base-entity-core.md: Métodos getViewGroups() y getViewGroupRows() que retornan metadata para layout
- ../../01-decorators/view_group_decorator.md: Decorador @ViewGroup que define agrupación de secciones
- ../../01-decorators/view_group_row_decorator.md: Decorador @ViewGroupRowDecorator que define tipo de fila (TWO, THREE)
- ../../05-advanced/Enums.md: ViewGroupRow enum con valores SINGLE, TWO, THREE
