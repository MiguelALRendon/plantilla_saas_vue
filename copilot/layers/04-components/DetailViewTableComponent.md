# DetailViewTableComponent

## 1. Propósito

DetailViewTableComponent es un componente de tabla que renderiza lista de registros de una entidad con columnas generadas automáticamente desde metadatos mediante sistema de decoradores. Proporciona visualización tabular con header sticky, body scrollable, click en fila para abrir DetailView, formateo de valores según DisplayFormat, y renderizado especial para boolean con iconos check/cancel. Usado por default_listview.vue para mostrar colecciones de entidades.

## 2. Alcance

**UBICACION:** src/components/Informative/DetailViewTableComponent.vue

**DEPENDENCIAS TECNICAS:**
- Application.View.entityClass: Acceso a metadata de entity
- BaseEntity methods: getKeys, getCSSClasses, getFormattedValue, getDefaultPropertyValue
- getProperties: Obtiene labels de columnas desde @PropertyName
- getCSSClasses: Obtiene anchos de columnas desde @CSSColumnClass
- GGICONS: Iconos CHECK y CANCEL para booleansgetUniquePropertyValue: Identifica registro único para navegación
- Router integration: changeViewToDetailView para navegación

**ACTIVACION:**
Se usa en default_listview.vue como componente principal para renderizar lista de registros. Recibe data array de entities como prop.

## 3. Definiciones Clave

**Header sticky:**
Thead con position sticky top 0 z-index 1 que permanece fijo visible durante scroll vertical del tbody, permitiendo ver siempre nombres de columnas.

**Column auto-generation:**
Sistema que itera getProperties() method de entityClass generando td headers dinámicamente, uno por cada property con decorador @PropertyName, manteniendo orden de @PropertyIndex.

**CSSColumnClass classes:**
CSS classes que controlan ancho de columnas: table-length-small 10%, table-length-short 15%, table-length-medium 25%, table-length-long 35%, table-length-xlarge 50%, table-length-header fit-content.

**openDetailView method:**
Método que recibe entity del click de fila, obtiene uniqueValue con getUniquePropertyValue, actualiza Application.View.value.entityOid, ejecuta changeViewToDetailView navegando a detalle.

## 4. Descripción Técnica

**TEMPLATE ESTRUCTURA:**
```html
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
                    
                    <span v-if="Application.View.entityClass?.getPropertyType(column) !== Boolean">
                        {{ item[column] instanceof BaseEntity ? 
                           item[column].getDefaultPropertyValue() : 
                           item.getFormattedValue(column) }}
                    </span>

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
```

**METODO openDetailView:**
```typescript
openDetailView(entity: BaseEntity) {
    const uniqueValue = entity.getUniquePropertyValue();
    if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
        Application.View.value.entityOid = 'new';
    } else {
        Application.View.value.entityOid = String(uniqueValue);
    }
    Application.changeViewToDetailView(entity as BaseEntity);
}
```

**DATA:**
```typescript
data() {
    return {
        Application,
        BaseEntity,
        data: [] as BaseEntity[],
        GGICONS,
        GGCLASS
    }
}

async mounted() {
    const entityClass = Application.View.value.entityClass;
    if (!entityClass) return;
    this.data = await entityClass.getElementList('');
}
```

**CSS ESTRUCTURA:**
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

tbody tr:hover {
    background-color: var(--bg-gray);
}

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

## 5. Flujo de Funcionamiento

**PASO 1 - Navegación ListView:**
Usuario navega a ruta /products, Router llama ListView component, ListView renderiza DetailViewTableComponent pasando data prop con entities array.

**PASO 2 - Generación Header:**
Thead itera Application.View.entityClass.getProperties() obteniendo diccionario con key property name y value display label desde @PropertyName, genera td por cada property, aplica CSS class desde getCSSClasses usando @CSSColumnClass decorator.

**PASO 3 - Renderizado Rows:**
Tbody itera data array de entities, cada entity genera tr con @click="openDetailView", itera item.getKeys() obteniendo properties, valida getPropertyType excluyendo Array types de renderizado tabla.

**PASO 4 - Formateo Celdas:**
Por cada td verifica tipo property: si Array skip rendering, si BaseEntity muestra getDefaultPropertyValue del objeto relacionado, si Boolean renderiza icon check verde o cancel rojo con GGICONS, si otro tipo ejecuta getFormattedValue aplicando @DisplayFormat decorator.

**PASO 5 - Click Fila:**
Usuario hace clic en cualquier td de row, evento @click dispara openDetailView recibiendo entity instance, método obtiene uniqueValue con getUniquePropertyValue desde @UniquePropertyKey, actualiza Application.View.value.entityOid como string del unique value.

**PASO 6 - Navegación Detalle:**
openDetailView ejecuta Application.changeViewToDetailView pasando entity, sistema actualiza router navegando a /products/2, view cambia a DetailView, formulario se carga con datos de entity seleccionada.

**PASO 7 - Scroll y Sticky:**
Usuario hace scroll vertical en tbody, header thead permanece sticky visible con position top 0, body scroll independiente mantiene usabilidad viendo columnas siempre, hover effect aplica background gris en row bajo cursor.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE generar columnas desde getProperties iterando metadata, NUNCA hardcodear columnas.

**REGLA 2:** SIEMPRE aplicar CSS classes desde getCSSClasses respetando @CSSColumnClass decorator.

**REGLA 3:** SIEMPRE excluir properties tipo Array de renderizado tabla, mostrar solo en DetailView.

**REGLA 4:** SIEMPRE renderizar BaseEntity properties con getDefaultPropertyValue mostrando display value del objeto.

**REGLA 5:** SIEMPRE renderizar Boolean con icons check/cancel usando GGICONS constants, NUNCA texto true/false.

**REGLA 6:** SIEMPRE aplicar formateo con getFormattedValue respetando @DisplayFormat decorator.

**REGLA 7:** SIEMPRE hacer rows clickeable con @click navegando a DetailView con openDetailView method.

**REGLA 8:** SIEMPRE declarar `z-index` del header sticky con token (`var(--z-base)`), no con números literales.

**REGLA 9:** SIEMPRE construir clases dinámicas con arrays/objetos de Vue en `:class`; NUNCA usar concatenación con `+`.

**REGLA 10:** SIEMPRE tokenizar medidas visuales repetibles de tabla (`height`, `padding`, `min-height`, `font-size`, `margins`) usando `constants.css`; solo se permiten literales si son excepciones únicas documentadas.

**REGLA 11:** SIEMPRE extraer lógica compleja de templates (ternarios con instanceof, operador typeof, verificaciones de tipos) a computed properties o methods; NUNCA ejecutar código implícito en interpolaciones `{{ }}` (§06-CODE-STYLING 6.3.1.2).

## 7. Prohibiciones

**PROHIBIDO:** Hardcodear nombres de columnas ignorando metadata system.

**PROHIBIDO:** Renderizar properties tipo Array en tabla causando overflow y UX pobre.

**PROHIBIDO:** Mostrar Boolean como texto true/false en lugar de icons visuales.

**PROHIBIDO:** Omitir getFormattedValue saltando aplicación de @DisplayFormat decorator.

**PROHIBIDO:** Permitir edición inline en celdas, tabla es read-only navigation only.

**PROHIBIDO:** Remover position sticky de thead perdiendo usabilidad in scroll.

**PROHIBIDO:** Omitir hover effect en rows reduciendo feedback visual de clickeabilidad.

**PROHIBIDO:** Ejecutar lógica compleja en templates (`instanceof`, `typeof`, ternarios complejos con verificaciones de tipos) en lugar de métodos/computed (§6.3.1.2).

## 8. Dependencias

**DECORADORES REQUERIDOS:**
- @PropertyName: Define display label de columnas
- @PropertyIndex: Establece orden de columnas
- @CSSColumnClass: Define ancho de columnas
- @DisplayFormat: Formatea valores displayed
- @DefaultProperty: Define display value para objetos relacionados
- @UniquePropertyKey: Identifica registro único para navegación

**METODOS BaseEntity:**
- getKeys: Lista properties de entity
- getCSSClasses: Obtiene CSS classes por property
- getFormattedValue: Aplica DisplayFormat
- getDefaultPropertyValue: Obtiene default display
- getUniquePropertyValue: Obtiene unique identifier
- getPropertyType: Determina tipo de property

**SERVICIOS:**
- Application.View.entityClass: Acceso a metadata
- Application.changeViewToDetailView: Navegación
- Router: Actualiza URL con entityOid

## 9. Relaciones

**USADO POR:**
default_listview.vue - Vista principal de listado de módulos.

**INTEGRA CON:**
- Application.View.entityClass: Obtiene metadata para generación automática
- BaseEntity instances: Renderiza data de entities
- Router: Navega a DetailView al hacer click
- openDetailView method: Maneja transición a vista detalle

**FLUJO DE NAVEGACION:**
usuario click fila → openDetailView ejecuta → entityOid actualizado → changeViewToDetailView → router navega → DetailView renderiza.

## 10. Notas de Implementación

**EJEMPLO ENTITY:**
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

**TABLA GENERADA:**
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

**RENDERIZADO TIPOS:**
Arrays: v-if excluye Array type, NO renderizado en tabla, solo DetailView tabs
BaseEntity: Muestra object.getDefaultPropertyValue() como string display Customer.name
Boolean: Renderiza icon check verde si true, cancel rojo si false con GGICONS
DisplayFormat: Aplica formato custom como price $99.99 o stock 50 units

**LIMITACIONES ACTUALES:**
1. Sin paginación: Muestra todos registros sin límite, problemas performance > 100 items
2. Sin filtrado: NO hay input búsqueda ni filtros por columna
3. Sin ordenamiento: Click header NO ordena columnas ascendente/descendente
4. Arrays ocultos: Properties Array invisible por diseño para uso solo DetailView

**REGLA OPERATIVA:**
La fuente de datos de tabla DEBE provenir de `entityClass.getElementList('')` (flujo CRUD real), no de arrays mock locales.

**ESTRUCTURA FLEX:**
Table usa flex column para header sticky y body scrollable independiente, thead display block sticky top 0, tbody display block overflow-y auto flex 1, adaptable viewport height con calc formula.

**FLUJO COMPLETO:**
Usuario /products → ListView → DetailViewTableComponent monta → loadData() ejecuta getElementList('') → header desde getProperties → rows desde data iteration → usuario click row 2 → openDetailView(product2) → entityOid = "2" → changeViewToDetailView → router /products/2 → DetailView renderiza.

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- views-overview.md: Vistas ListView y DetailView
- css-column-class-decorator.md: Ancho de columnas
- display-format-decorator.md: Formateo de valores
- property-name-decorator.md: Labels de columnas
- unique-decorator.md: UniquePropertyKey para navegación
- default-property-decorator.md: Display value objetos

**UBICACION:** copilot/layers/04-components/DetailViewTableComponent.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
