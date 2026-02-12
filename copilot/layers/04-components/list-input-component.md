# ListInputComponent

## 1. PROPOSITO

ListInputComponent es un componente dropdown personalizado para seleccionar opciones de una lista predefinida mediante interfaz animada con transición. Permite elegir valores de enums o listas estáticas, formatea automáticamente valores snake_case a Title Case, implementa posicionamiento inteligente abriéndose hacia arriba o abajo según espacio disponible, y se cierra al hacer clic fuera del dropdown. Requiere integración manual con EnumAdapter, no se genera automáticamente desde decoradores.

## 2. ALCANCE

**UBICACION:** src/components/Form/ListInputComponent.vue

**DEPENDENCIAS TECNICAS:**
- Vue 3 Composition API: Reactividad y v-model
- EnumAdapter model: Adaptador para enums y listas getKeyValuePairs
- useInputMetadata composable: Extracción de metadata
- GGICONS constants: Icono ARROW_UP para flecha dropdown
- Click outside handling: document.addEventListener para cerrar dropdown

**ACTIVACION:**
NO se genera automáticamente. Requiere integración manual en vistas custom o DefaultDetailView pasando prop propertyEnumValues con EnumAdapter instance.

## 3. DEFINICIONES CLAVE

**EnumAdapter:**
Clase modelo que envuelve TypeScript enum proporcionando método getKeyValuePairs() retornando array de objetos con key string y value string/number para popular opciones del dropdown.

**parseValue:**
Método que transforma strings snake_case o UPPERCASE a Title Case formato legible: ORDER_CONFIRMED se convierte en Order Confirmed, PENDING en Pending.

**openOptions:**
Método que calcula posición del botón trigger con getBoundingClientRect, determina si hay espacio suficiente abajo 300px threshold, establece fromBottom flag para renderizar dropdown hacia arriba o abajo, y alterna estado droped.

**fromBottom flag:**
Variable booleana que controla dirección de apertura: false dropdown aparece debajo del trigger, true dropdown aparece encima cuando espacio inferior es menor a 300px.

## 4. DESCRIPCION TECNICA

**PROPS:**
```typescript
props: {
    entity: Object,                // Entidad actual BaseEntity
    propertyName: String,          // Nombre de property en entity
    metadata: Object,              // Metadata extraída por useInputMetadata
    propertyEnumValues: Object,    // EnumAdapter instance con opciones
    modelValue: [String, Number]   // Valor seleccionado actual
}
```

**DATA:**
```typescript
data() {
    return {
        GGICONS,
        GGCLASS,
        droped: false,          // Estado dropdown abierto/cerrado
        fromBottom: false,      // Dirección de apertura
        isInputValidated: true,
        validationMessages: [] as string[]
    }
}
```

**ESTRUCTURA HTML:**
```html
<div class="ListInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <button 
        class="list-input-header" 
        @click="openOptions" 
        :id="'id-4-click-on' + metadata.propertyName" 
        :disabled="metadata.disabled.value"
    >
        <div class="list-input-container">
            <div class="label-and-value">
                <label class="label" :class="[{active: actualOption != ''}]">
                    {{ metadata.propertyName }}
                </label>
                <label class="value" :class="[{active: actualOption != ''}]">
                    {{ actualOption }}
                </label>
            </div>
            
            <span class="arrow" :class="[GGCLASS, {active: droped}]">
                {{ GGICONS.ARROW_UP }}
            </span>
        </div>
    </button>
    
    <div class="list-input-body" :class="[
        {enabled: droped}, 
        {'from-bottom': fromBottom}
    ]">
        <div class="list-input-items-wrapper">
            <div 
                class="list-input-item" 
                v-for="value in propertyEnumValues.getKeyValuePairs()" 
                :class="[{selected: modelValue == value.value}]"
                :key="value.key"
                @click="$emit('update:modelValue', value.value); droped = false;"
            >
                <span>{{ parseValue(value.key) }}</span>
            </div>
        </div>
    </div>
    
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">
            {{ message }}
        </span>
    </div>
</div>
```

**METODO parseValue:**
```typescript
parseValue(key: string): string {
    return key
        .toLowerCase()              // PENDING → pending
        .split('_')                 // order_status → [order, status]
        .map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        )  // [Order, Status]
        .join(' ');                 // Order Status
}
```

**METODO openOptions:**
```typescript
openOptions() {
    const rect = document
        .getElementById('id-4-click-on' + this.metadata.propertyName)
        ?.getBoundingClientRect();
    
    if (rect) {
        this.fromBottom = (window.innerHeight - rect.bottom) < 300;
    }
    
    this.droped = !this.droped;
}
```

**METODO handleClickOutside:**
```typescript
handleClickOutside(event: MouseEvent) {
    if(this.droped) {
        const dropdown = this.$el;
        if (!dropdown) return;

        if (!dropdown.contains(event.target as Node)) {
            this.droped = false;
        }
    }
}
```

**COMPUTED actualOption:**
```typescript
computed: {
    actualOption(): String | number {
        var value = this.propertyEnumValues.getKeyValuePairs().find(
            (pair) => pair.value === this.modelValue
        )?.key || '';
        
        return this.parseValue(value);
    }
}
```

**LIFECYCLE HOOKS:**
```typescript
mounted() {
    document.addEventListener('click', this.handleClickOutside);
    Application.eventBus.on('validate-inputs', this.handleValidation);
}

beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    Application.eventBus.off('validate-inputs', this.handleValidation);
}
```

## 5. FLUJO DE FUNCIONAMIENTO

**PASO 1 - Integración Manual:**
Desarrollador crea EnumAdapter instance en vista custom con new EnumAdapter(OrderStatus), pasa adapter como prop propertyEnumValues a ListInputComponent junto con entity, propertyName y v-model.

**PASO 2 - Renderizado Cerrado:**
Componente renderiza botón header mostrando label flotante y actualOption computed displayeando valor actual formateado, flecha ARROW_UP rotada 180 grados apuntando abajo, dropdown body oculto con grid-template-rows: 0fr.

**PASO 3 - Click en Trigger:**
Usuario hace clic en botón header, openOptions ejecuta obteniendo rect con getBoundingClientRect, calcula espacio disponible comparando window.innerHeight - rect.bottom contra threshold 300px, establece fromBottom true si espacio insuficiente abajo o false si hay espacio, alterna droped a true.

**PASO 4 - Apertura Dropdown:**
CSS class enabled se aplica expandiendo dropdown con grid-template-rows: 1fr, flecha rota a 0 grados apuntando arriba, renderiza opciones iterando propertyEnumValues.getKeyValuePairs() mostrando parseValue de cada key, option seleccionado actual muestra class selected resaltado.

**PASO 5 - Selección Usuario:**
Usuario hace clic en una opción, evento @click emite update:modelValue con value.value actualizando entity[propertyName], droped se marca false cerrando dropdown, actualOption computed se recalcula mostrando nuevo valor formateado en header.

**PASO 6 - Click Fuera:**
Usuario hace clic fuera del dropdown, handleClickOutside detecta event.target fuera de this.$el, droped se marca false cerrando dropdown automáticamente.

**PASO 7 - Validación al Guardar:**
Usuario intenta guardar, BaseEntity.validateInputs() emite evento validate-inputs, handleValidation ejecuta validando required verificando modelValue no vacío, validación síncrona ejecuta metadata.validated, validación asíncrona ejecuta isAsyncValidation si definida.

## 6. REGLAS OBLIGATORIAS

**REGLA 1:** SIEMPRE crear EnumAdapter instance antes de usar ListInputComponent, pasar como prop propertyEnumValues.

**REGLA 2:** SIEMPRE formatear display values con parseValue transformando snake_case a Title Case.

**REGLA 3:** SIEMPRE calcular fromBottom para posicionamiento inteligente antes de abrir dropdown.

**REGLA 4:** SIEMPRE registrar handleClickOutside en document para cerrar dropdown al click externo.

**REGLA 5:** SIEMPRE emitir update:modelValue y cerrar dropdown droped=false al seleccionar opción.

**REGLA 6:** SIEMPRE resaltar opción seleccionada actual con CSS class selected.

** REGLA 7:** SIEMPRE validar que valor seleccionado existe en enum con Object.values.includes.

## 7. PROHIBICIONES

**PROHIBIDO:** Usar listas hardcodeadas sin EnumAdapter perdiendo type safety.

**PROHIBIDO:** Omitir validación de valores permitidos contra enum original.

**PROHIBIDO:** Crear dropdown sin cálculo de posicionamiento permitiendo overflow fuera de viewport.

**PROHIBIDO:** No registrar removeEventListener en beforeUnmount causando memory leaks.

**PROHIBIDO:** Permitir selección cuando dropdown está disabled.

**PROHIBIDO:** Modificar modelValue directamente sin emitir update:modelValue.

**PROHIBIDO:** Omitir parseValue mostrando valores raw UPPERCASE o snake_case en UI.

## 8. DEPENDENCIAS

**DECORADORES REQUERIDOS:**
- @PropertyName: Establece display name
- @Required: Marca campo obligatorio
- @Validation: Valida valor contra enum values
- @HelpText: Proporciona ayuda contextual

**MODELOS RELACIONADOS:**
- EnumAdapter: Proporciona método getKeyValuePairs
- useInputMetadata composable: Extrae metadata de decoradores

**SERVICIOS:**
- EventBus: Comunica evento validate-inputs
- document: Registra click outside handler

## 9. RELACIONES

**INTEGRA CON:**
- EnumAdapter.getKeyValuePairs(): Proporciona opciones para dropdown
- BaseEntity.validateInputs(): Sistema centralizado de validación
- Application.View.value.isValid: Flag global de estado de formulario
- EventBus: Comunicación de eventos validate-inputs

**FLUJO DE INTEGRACION:**
Desarrollador define enum OrderStatus, crea adapter en vista, pasa a ListInputComponent como prop, componente renderiza dropdown, usuario selecciona valor, entity property se actualiza vía v-model.

## 10. NOTAS DE IMPLEMENTACION

**EJEMPLO ENUM Y ENTITY:**
```typescript
enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Order Number', String)
    @Required(true)
    orderNumber!: string;
    
    @PropertyIndex(2)
    @PropertyName('Status', String)
    @Required(true, 'Status is required')
    @HelpText('Select the current order status')
    @Validation(
        (entity) => Object.values(OrderStatus).includes(entity.status),
        'Invalid status'
    )
    status!: string;
}
```

**USO EN VISTA:**
```vue
<template>
<div>
    <TextInputComponent
        :entity="order"
        property-name="orderNumber"
        v-model="order.orderNumber"
    />
    
    <ListInputComponent
        :entity="order"
        property-name="status"
        :property-enum-values="statusEnumAdapter"
        v-model="order.status"
    />
</div>
</template>

<script>
import { EnumAdapter } from '@/models/enum_adapter';
import { OrderStatus } from '@/enums/order_status';

export default {
    data() {
        return {
            statusEnumAdapter: new EnumAdapter(OrderStatus)
        };
    }
}
</script>
```

**CASOS DE USO:**
1. Estado Pedido: enum OrderStatus con DRAFT/SUBMITTED/APPROVED/REJECTED + @Required + adapter
2. Prioridad: enum Priority con LOW=1/MEDIUM=2/HIGH=3/URGENT=4 usando Number values
3. Categoría: enum ProductCategory con ELECTRONICS/CLOTHING/FOOD/BOOKS + validación

**PARSEVALUE EJEMPLOS:**
PENDING → Pending, ORDER_CONFIRMED → Order Confirmed, IN_PROGRESS → In Progress, user_role → User Role

**POSICIONAMIENTO:**
Espacio disponible arriba > 300px y abajo < 300px: fromBottom=true dropdown arriba
Espacio disponible abajo >= 300px: fromBottom=false dropdown abajo
Threshold 300px basado en altura típica de dropdown con scroll

**ANIMACIONES CSS:**
Flecha rotate 180deg cerrado a 0deg abierto transition 0.3s ease
Label flotante sube con active class transition 0.5s ease
Dropdown expansion grid-template-rows 0fr a 1fr transition 0.3s ease

**LAYOUT VISUAL ESTADOS:**
Cerrado: [Status] [Confirmed] [flecha abajo]
Abierto: [Status] [Confirmed] [flecha arriba] con lista expandida debajo mostrando Pending/Confirmed con checkmark/Processing/Shipped/Delivered/Cancelled

**LIMITACIONES ACTUALES:**
1. NO se genera automáticamente: Requiere integración manual en cada vista
2. Posicionamiento en scrollables: Puede fallar si dropdown está en contenedor con scroll
3. Sin búsqueda/filtrado: UX sufre con listas > 20 items requiriendo scroll manual

## 11. REFERENCIAS CRUZADAS

**DOCUMENTOS RELACIONADOS:**
- enum-adapter.md: Clase modelo que proporciona getKeyValuePairs
- validation-decorator.md: Validación de valores contra enum
- useInputMetadata-composable.md: Extracción de metadata

**UBICACION:** copilot/layers/04-components/list-input-component.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
