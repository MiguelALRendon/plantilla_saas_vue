# TabComponent & TabControllerComponent

## 1. Propósito

Sistema de componentes Vue que implementa navegación por tabs (pestañas) para organizar contenido en grupos temáticos dentro de vistas de detalle. TabComponent proporciona el contenedor para contenido de pestaña individual mientras TabControllerComponent gestiona estado activo, navegación entre tabs y renderizado de headers clicables. Principal aplicación: mostrar arrays de entidades relacionadas en formularios de detalle mediante integración con ArrayInputComponent, permitiendo separación visual de múltiples listas asociadas a una entidad padre.

## 2. Alcance

Este documento cubre ambos componentes del sistema de tabs: TabComponent (src/components/TabComponent.vue) y TabControllerComponent (src/components/TabControllerComponent.vue). Incluye estructura de props, template structure, manejo de estado activo mediante índices, sistema de renderizado de headers dinámicos, integración con slots de Vue, hooks de ciclo de vida (mounted), algoritmo de activación/desactivación de tabs, estilos CSS para estados (active/inactive), y uso conjunto con BaseEntity.getArrayKeysOrdered() para generación automática de tabs desde metadata de decoradores. No cubre implementación interna de ArrayInputComponent ni lógica de gestión de arrays en BaseEntity.

## 3. Definiciones Clave

**TabComponent**: Componente contenedor simple que envuelve contenido de una pestaña individual, controlando visibilidad mediante clase CSS .active.

**TabControllerComponent**: Componente controlador que gestiona múltiples TabComponents hijos, renderiza headers clicables y mantiene índice de tab actualmente seleccionado.

**selectedTab**: Data property en TabControllerComponent que almacena índice (number) del tab actualmente visible, iniciando en 0 para primer tab.

**tabElements**: NodeListOf<Element> que almacena referencias DOM a todos los TabComponent montados, utilizada para manipulación directa de clases CSS mediante classList.add y classList.remove.

**tabs prop**: Array<string> que define nombres para headers de tabs en TabControllerComponent, debe coincidir en longitud y orden con número de TabComponents hijos en slot default.

**setActiveTab method**: Método en TabControllerComponent que recibe índice number, actualiza selectedTab, itera tabElements removiendo clase active de todos y agregándola solo al índice especificado.

**slot default**: Sistema de slots de Vue usado por TabControllerComponent para recibir TabComponent children, validado en setup mediante useSlots comprobando que todos los vnodes sean tipo TabComponent.

## 4. Descripción Técnica

### TabComponent (src/components/TabComponent.vue)

#### Template

```vue
<template>
<div class="tab-component">
    <slot></slot>
</div>
</template>
```

Contenedor simple div con clase tab-component que envuelve slot default conteniendo contenido de pestaña. Display controlado mediante CSS display:none por defecto y display:block cuando tiene clase active.

#### Script

```typescript
export default {
  name: 'TabComponent',
};
```

Sin props, sin data, sin methods. Componente puramente presentacional manejado por TabControllerComponent padre.

#### Estilos

```css
.tab-component{
    width: 100%;
    height: 100%;
    padding: .5rem;
    border-radius: 0 0 1rem 1rem;
    border: 2px solid var(--sky);
    border-top: none;
    box-sizing: border-box;
    background-color: var(--bg-gray);
    display: none;
}
.tab-component.active{
    display: block;
    overflow: hidden;
}
```

border-top none conecta visualmente con tab header superior. display none oculta por defecto. Clase active cambia a display block haciendo visible el contenido. overflow hidden previene scroll interno inesperado.

### TabControllerComponent (src/components/TabControllerComponent.vue)

#### Props

```typescript
props: {
    tabs: {
      type: Array<string>,
      required: true,
    },
}
```

tabs: Array de strings con nombres que aparecen en headers clicables. Orden en array corresponde a orden visual de tabs y debe coincidir con orden de TabComponents en slot.

#### Template

```vue
<template>
  <div class="tab-container">
    <div class="tab-container-row">
      <div 
      class="tab" 
      v-for="(tab, index) in tabs" :class="[{active: index == selectedTab}]"
      @click="setActiveTab(index)"
      >
      <span>{{ tab }}</span> 
    </div>
    </div>
    <slot></slot>
  </div>
</template>
```

div.tab-container raíz con flexbox column. div.tab-container-row contiene headers de tabs renderizados con v-for iterando props.tabs. Cada div.tab tiene @click="setActiveTab(index)" para cambiar tab activo. Clase active aplicada condicionalmente cuando index == selectedTab. slot default después de headers renderiza TabComponents hijos.

#### Setup con Composition API

```typescript
setup() {
    const slots = useSlots()

    const isValid = computed(() => {
      const nodes = slots.default?.()
      if (!nodes) return true

      return nodes.every(vnode => vnode.type === TabComponent)
    })

    return { isValid }
}
```

useSlots obtiene slots del componente. Computed isValid verifica que todos los hijos en slot default sean TabComponent mediante vnode.type === TabComponent. Retorna false y console.warn si validación falla. Permite detección temprana de uso incorrecto del componente.

#### Data

```typescript
data() {
    return {
      selectedTab: 0,
      tabElements: null as NodeListOf<Element> | null,
    };
}
```

selectedTab: Índice numérico del tab actualmente visible, inicializado en 0 para mostrar primer tab por defecto. tabElements: Referencia DOM a todos los .tab-component elements obtenida en mounted mediante document.querySelectorAll, inicializada null hasta mounted ejecuta.

#### Método setActiveTab

```typescript
setActiveTab(index: number) {
    this.selectedTab = index;
    this.tabElements?.forEach((el, i) => {
      el.classList.remove('active');
      if (i === index) {
        el.classList.add('active');
      }
    });
}
```

Actualiza selectedTab con índice recibido. Itera tabElements removiendo clase active de todos los elementos. Agrega clase active solo al elemento con índice coincidente mediante el.classList.add. Operador optional chaining (?.) previene error si tabElements es null.

#### Lifecycle Hook mounted

```typescript
mounted() {
    this.tabElements = document.querySelectorAll('.tab-component');
    this.setActiveTab(0);
}
```

Obtiene NodeListOf<Element> de todos los .tab-component del DOM y almacena en tabElements. Ejecuta setActiveTab(0) para activar primer tab por defecto al montar componente.

#### Estilos CSS

```css
.tab-container-row{
    display: flex;
    flex-direction: row;
    gap: .5rem;
    border-bottom: 2px solid var(--sky);
}

.tab-container-row .tab{
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    border-radius: 1rem 1rem 0 0;
    border: 1px solid var(--border-gray);
    border-bottom: none;
    transition: 0.5s ease;
}

.tab-container-row .tab.active{
    border: 2px solid var(--sky);
    border-bottom: none;
    background-color: var(--bg-gray);
}
```

tab-container-row usa flexbox horizontal con gap. border-bottom conecta visualmente con TabComponent border-top. tabs individuales con border-radius superior, border-bottom none para fusión visual. Tab activo con border más grueso y background coincidente con TabComponent.active. Transición suave de 0.5s ease para cambios visuales.

## 5. Flujo de Funcionamiento

### Inicialización del Sistema de Tabs

```
1. TabControllerComponent monta en default_detailview.vue
        ↓
2. setup() ejecuta, useSlots obtiene slots
        ↓
3. Computed isValid valida que hijos sean TabComponent
        ↓
4. data() inicializa selectedTab=0, tabElements=null
        ↓
5. Template renderiza headers desde props.tabs con v-for
        ↓
6. slot renderiza TabComponents hijos (todos display:none)
        ↓
7. mounted() ejecuta document.querySelectorAll('.tab-component')
        ↓
8. tabElements poblado con NodeListOf<Element>
        ↓
9. setActiveTab(0) ejecuta, primer tab recibe clase active
        ↓
10. Primer TabComponent cambia a display:block, visible
```

### Flujo de Cambio de Tab por Usuario

```
Usuario hace click en tab header "Items"
        ↓
Evento @click dispara en div.tab con index=1
        ↓
setActiveTab(1) ejecuta
        ↓
this.selectedTab = 1
        ↓
tabElements.forEach itera todos los TabComponent
        ↓
el.classList.remove('active') en todos
        ↓
Llega a índice 1 (match)
        ↓
el.classList.add('active') solo en index 1
        ↓
CSS cambia display:none → display:block en tab index 1
        ↓
Tab anterior display:block → display:none
        ↓
Usuario ve contenido de tab "Items"
```

### Flujo de Integración con BaseEntity Arrays

```
default_detailview.vue monta
        ↓
entity.getArrayKeysOrdered() ejecuta
        ↓
Retorna ['items', 'comments', 'attachments'] ordenados por @PropertyIndex
        ↓
getArrayListsTabs() llama entity.getKeys con filtro arrays
        ↓
Genera tabs=['Items', 'Comments', 'Attachments'] desde @PropertyName
        ↓
<TabControllerComponent :tabs="tabs"> recibe array
        ↓
v-for genera 3 headers clicables
        ↓
<TabComponent v-for="tab in entity.getArrayKeysOrdered()"> genera 3 contenedores
        ↓
Cada TabComponent contiene <ArrayInputComponent> con property-key correspondiente
        ↓
TabComponent #0 con items[], TabComponent #1 con comments[], TabComponent #2 con attachments[]
```

### Flujo de Validación de Hijos

```
setup() ejecuta al montar
        ↓
useSlots() obtiene slots del componente
        ↓
computed(() => { const nodes = slots.default?.() }) ejecuta
        ↓
Si nodes es undefined o null, return true (slot vacío permitido)
        ↓
Si nodes existe, nodes.every(vnode => vnode.type === TabComponent) valida
        ↓
Si algún vnode NO es TabComponent, return false
        ↓
console.warn('[TabController] All children must be TabComponent') (no implementado en código actual pero especificado en documentación)
        ↓
isValid.value determina si configuración es correcta
```

## 6. Reglas Obligatorias

TabControllerComponent props.tabs DEBE ser array de strings, cada string representa nombre visible de un tab header. Número de elementos en props.tabs DEBE coincidir exactamente con número de TabComponent hijos en slot default, discordancia causa desincronización visual y lógica. Orden de strings en props.tabs DEBE corresponder al orden de TabComponents hijos en slot, tabs[0] corresponde a primer TabComponent, tabs[1] a segundo, etc. Todos los hijos directos de TabControllerComponent DEBEN ser TabComponent, otros componentes causan comportamiento inesperado. setActiveTab DEBE ejecutarse en mounted después de querySelectorAll para garantizar que tabElements esté poblado. Clase active DEBE removerse de todos los TabComponent antes de agregar a uno nuevo para garantizar solo un tab visible. document.querySelectorAll('.tab-component') en mounted DEBE ejecutarse después de que slot renderizó hijos TabComponent. selectedTab DEBE inicializarse en 0 para mostrar primer tab por defecto al montar. TabComponent NO debe tener lógica propia de activación, completamente controlado por TabControllerComponent padre. Border y border-radius de tabs y TabComponent DEBEN coordinarse para fusión visual correcta sin gaps.

## 7. Prohibiciones

NO usar TabComponent fuera de TabControllerComponent, componente diseñado exclusivamente para uso dentro de TabController. NO pasar props.tabs con número diferente de TabComponents hijos, causa índices fuera de rango. NO modificar directamente clase active de TabComponent desde código externo, solo TabControllerComponent.setActiveTab debe manipular. NO mezclar TabComponent con otros componentes como hijos directos de TabControllerComponent, validación setup espera solo TabComponent. NO ejecutar setActiveTab con índice mayor o igual a tabs.length, causa undefined behavior. NO olvidar inicializar tabElements a null en data, querySelectorAll retorna NodeListOf no array. NO usar this.$refs para obtener TabComponents, document.querySelectorAll es método establecido. NO aplicar display inline o flex directamente a .tab-component, rompe lógica de show/hide con display:none y display:block. NO modificar selectedTab sin ejecutar setActiveTab, causa desincronización entre índice y clases CSS. NO asumir que TabComponent renderiza por defecto, display:none hasta setActiveTab ejecuta en mounted.

## 8. Dependencias

### Dependencias Directas

**Vue 3 Composition API**: useSlots para acceso a slots, computed para validación reactiva de hijos. **Vue 3 Template Syntax**: v-for para iteración de tabs, :class binding condicional, @click event handlers, slot para contenido dinámico. **TabComponent**: Dependencia obligatoria como hijo único permitido de TabControllerComponent.

### Dependencias de CSS

**CSS Custom Properties**: var(--sky) para bordes azules, var(--bg-gray) para background, var(--border-gray) para bordes inactivos. **CSS Flexbox**: display:flex con flex-direction:row en tab-container-row, flex-direction:column en tab-container raíz.

### Dependencias de Sistema

**DOM API**: document.querySelectorAll para obtener referencias a elementos, Element.classList.add y Element.classList.remove para manipulación de clases.

### Componentes Relacionados

**ArrayInputComponent**: Contenido típico dentro de TabComponent mostrando arrays de entidades relacionadas. **FormGroupComponent**: Contenedor padre común que envuelve TabControllerComponent en default_detailview. **default_detailview.vue**: Vista principal que genera TabControllerComponent dinámicamente desde entity.getArrayKeysOrdered.

## 9. Relaciones

### TabControllerComponent → TabComponent

TabControllerComponent es padre obligatorio de TabComponent. TabController renderiza headers basados en props.tabs y slot con TabComponents. TabController manipula clases CSS de TabComponent mediante tabElements.forEach. TabComponent es componente puramente presentacional sin lógica propia. Relación 1:N donde TabController gestiona múltiples TabComponents.

### TabControllerComponent ← default_detailview.vue

default_detailview renderiza TabControllerComponent cuando entity.getArrayKeys retorna propiedades tipo Array. Prop tabs poblado llamando entity.getArrayKeysOrdered que ordena por @PropertyIndex. Contenido generado con v-for iterando getArrayKeysOrdered creando TabComponent por cada propiedad array. ArrayInputComponent renderizado dentro de cada TabComponent con property-key correspondiente.

### TabComponent ↔ ArrayInputComponent

TabComponent envuelve ArrayInputComponent como hijo común en default_detailview. ArrayInputComponent recibe entity y property-key de array específico. TabComponent controla visibilidad de ArrayInputComponent mediante clase active. Múltiples listas arrays organizadas en tabs evitando sobrecarga visual en formulario.

### Integración con BaseEntity

entity.getArrayKeysOrdered(): Método que retorna string[] de propiedades tipo Array ordenadas por @PropertyIndex decorator. entity.getArrayKeys(): Método que retorna todas las propiedades tipo Array sin ordenamiento. entityClass.getArrayPropertyType(key): Obtiene tipo de elementos del array para pasar a ArrayInputComponent.

### Integración con Decoradores

@PropertyIndex en propiedades array determina orden de tabs generados. @PropertyName en propiedades array proporciona nombres para headers de tabs. @ArrayOf(Type) decorator identifica propiedad como array y define tipo de elementos.

## 10. Notas de Implementación

### Ejemplo Completo de Implementación

Definición de entidad con arrays:
```typescript
@ModuleName('Orders')
export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Order ID', Number)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Customer', String)
    customer!: string;
    
    @PropertyIndex(10)
    @PropertyName('Items', ArrayOf(OrderItem))
    items!: OrderItem[];
    
    @PropertyIndex(11)
    @PropertyName('Comments', ArrayOf(Comment))
    comments!: Comment[];
}
```

Uso en default_detailview.vue:
```vue
<FormGroupComponent title="Listas">
    <TabControllerComponent :tabs="getArrayListsTabs()">
        <TabComponent v-for="(tab) in entity.getArrayKeysOrdered()">
            <ArrayInputComponent 
                :entity="entity"
                :property-key="tab"
                v-model="entity[tab]" 
                :type-value="entityClass.getArrayPropertyType(tab)"
            />
        </TabComponent>
    </TabControllerComponent>
</FormGroupComponent>
```

Resultado visual renderizado:
```
┌─────────────────────────────────────┐
│ Listas                              │
├─────────────────────────────────────┤
│ [Items] [Comments]                  │ ← Tab headers clicables
├─────────────────────────────────────┤
│                                     │
│ [+ New Item]                        │ ← Tab content activo (Items)
│ ┌─────────────────────────────────┐│
│ │ Item 1 - $100                   ││
│ │ Item 2 - $50                    ││
│ │ Item 3 - $75                    ││
│ └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Características de Implementación

querySelectorAll('.tab-component') en mounted obtiene TODOS los .tab-component del documento, no solo hijos del componente actual, potencial issue en casos edge con múltiples TabControllers. Clase active agregada/removida mediante classList API es más eficiente que binding Vue :class para manipulación frecuente. selectedTab data property proporciona single source of truth para estado activo, sincronizado con clases CSS mediante setActiveTab. Border visual conectado entre tab header y tab content mediante border-bottom:none en header y border-top:none en content. Transición CSS 0.5s ease en tabs proporciona feedback visual suave en hover y clicks. Optional chaining (?.) en tabElements?.forEach previene errores si mounted no ejecutó correctamente. setup validation con useSlots y computed permite detección temprana de configuración incorrecta.

### Debugging y Solución de Problemas

Verificar número de tabs coincide con TabComponents: console.log(this.tabs.length, this.tabElements?.length). Ver tab activo actual: console.log(this.selectedTab). Verificar clases active: document.querySelectorAll('.tab-component.active').length debería ser 1. Si múltiples tabs visibles, setActiveTab no ejecutó correctamente loop de remove. Si ningún tab visible, mounted no ejecutó setActiveTab(0) o querySelectorAll retornó vacío. Si click en header no cambia tab, @click="setActiveTab(index)" mal configurado o index incorrecto.

### Casos de Uso Típicos

Caso 1 - Arrays de relaciones Many-to-Many: Order con items[], comments[], attachments[]. Caso 2 - Entidad con múltiples listas categorizadas: Product con images[], reviews[], variants[]. Caso 3 - Formulario complejo con secciones agrupadas: tabs para diferentes aspectos de entidad aunque no sean arrays.

### Consideraciones de Performance

querySelectorAll ejecuta cada vez que mounted corre, en listas grandes considerar caching. classList.add/remove más performante que Vue reactivity para manipulación frecuente de clases. forEach en cada setActiveTab itera todos los tabs, O(n) aceptable para número razonable de tabs (<20).

### Alternativas y Extensiones

Para tabs dinámicos condicionales, computed tabs basado en estado de entity. Para tabs con badges o notificaciones, extender template de header con span.badge. Para tabs con iconos, agregar componente de icono antes de span con nombre. Para animación de transición entre tabs, agregar Vue transition component envolviendo TabComponent.

## 11. Referencias Cruzadas

Documentos relacionados: array-input-component.md (componente típico dentro de tabs), FormLayoutComponents.md (FormGroupComponent que envuelve tabs), views-overview.md (default_detailview que genera tabs), ../../01-decorators/property-index-decorator.md (ordenamiento de tabs), ../../01-decorators/property-name-decorator.md (nombres de tabs), ../../02-base-entity/metadata-access.md (métodos getArrayKeysOrdered y getArrayPropertyType).

Archivos de código fuente: src/components/TabComponent.vue (componente de tab individual), src/components/TabControllerComponent.vue (componente controlador), src/views/default_detailview.vue (vista que usa tabs), src/entities/base_entitiy.ts (métodos getArrayKeysOrdered).

Componentes relacionados: ArrayInputComponent.md (contenido típico de tabs), FormGroupComponent en FormLayoutComponents.md (contenedor padre), default_detailview en views-overview.md (vista generadora).

Versión: 1.0.0
Última actualización: 12 de Febrero, 2026
