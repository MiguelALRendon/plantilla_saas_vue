# ObjectInputComponent

## 1. Propósito

ObjectInputComponent es un componente especializado para seleccionar objetos relacionados mediante modal de lookup implementando relaciones 1:1 entre entidades. Proporciona input readonly mostrando objeto seleccionado formateado con getDefaultPropertyValue, botón de búsqueda que abre modal lookup con lista de objetos disponibles, selección mediante click con callback, y validación específica para required verificando null, undefined y EmptyEntity instances.

## 2. Alcance

**UBICACION:** src/components/Form/ObjectInputComponent.vue

**DEPENDENCIAS TECNICAS:**
- Vue 3 Composition API: Reactividad y v-model
- ApplicationUIService: Método showModalOnFunction para modal lookup
- ViewTypes.LOOKUPVIEW: Tipo de modal para selección
- BaseEntity: Clase base para objetos relacionados
- EmptyEntity: Instancia por defecto cuando no hay selección
- getDefaultPropertyValue: Método para obtener display value del objeto

**ACTIVACION:**
Se genera automáticamente cuando property usa @PropertyName con segundo parámetro siendo clase BaseEntity en lugar de tipo primitivo String/Number/Boolean.

## 3. Definiciones Clave

**modelType prop:**
Clase BaseEntity del objeto relacionado pasada como prop, ejemplo Customer class, usada por ApplicationUIService para determinar qué entidades cargar en modal lookup.

**getDefaultPropertyValue:**
Método de BaseEntity que retorna valor de property marcada con decorador @DefaultProperty, típicamente name o description, usado como display value en input readonly.

**showModalOnFunction:**
Método de ApplicationUIService que recibe modelType class, callback setNewValue, y ViewTypes.LOOKUPVIEW, creando modal con default_lookup_listview renderizando todas las instances disponibles de la entidad.

**EmptyEntity:**
Clase especial que hereda de BaseEntity usada como valor default cuando no hay objeto seleccionado, permite distinguir entre sin selección y null/undefined en validación required.

## 4. Descripción Técnica

**PROPS:**
```typescript
props: {
    entity: Object,                    // Entidad actual BaseEntity
    propertyName: String,              // Nombre de property en entity
    metadata: Object,                  // Metadata extraída por useInputMetadata
    modelValue: Object,                // Objeto relacionado actual BaseEntity
    modelType: Function                // Clase del objeto relacionado Customer
}
```

**DATA:**
```typescript
data() {
    return {
        GGICONS,
        GGCLASS,
        Application,
        ViewTypes,
        isInputValidated: true,
        validationMessages: [] as string[]
    }
}
```

**ESTRUCTURA HTML:**
```html
<div class="TextInput ObjectInput" :class="[
    {disabled: metadata.disabled.value}, 
    {nonvalidated: !isInputValidated}
]">
    <label :for="'id-' + metadata.propertyName" class="label-input">
        {{ metadata.propertyName }}
    </label>
    
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue?.getDefaultPropertyValue()"
        :disabled="metadata.disabled.value"
        readonly="true"
        @input="$emit('update:modelValue', modelValue)" 
    />
    
    <button 
        class="right" 
        @click="Application.ApplicationUIService.showModalOnFunction(
            modelType,          
            setNewValue,        
            ViewTypes.LOOKUPVIEW
        )" 
        :disabled="metadata.disabled.value"
    >
        <span :class="GGCLASS">{{ GGICONS.SEARCH }}</span>
    </button>
    
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

**METODO setNewValue:**
```typescript
setNewValue(newValue: BaseEntity | undefined) {
    this.$emit('update:modelValue', newValue);
}
```

**METODO isValidated:**
```typescript
async isValidated(): Promise<boolean> {
    var validated = true;
    this.validationMessages = [];
    
    /** Nivel 1: Required con verificación EmptyEntity */
    if (this.metadata.required.value && 
        (this.modelValue === null || 
         this.modelValue === undefined || 
         this.modelValue instanceof EmptyEntity)) {
        validated = false;
        this.validationMessages.push(
            this.metadata.requiredMessage.value || 
            `${this.metadata.propertyName} is required.`
        );
    }
    
    /** Nivel 2: Validación síncrona */
    if (!this.metadata.validated.value) {
        validated = false;
        this.validationMessages.push(
            this.metadata.validatedMessage.value || 
            `${this.metadata.propertyName} is not valid.`
        );
    }
    
    /** Nivel 3: Validación asíncrona */
    const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
    if (!isAsyncValid) {
        validated = false;
        const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
        if (asyncMessage) {
            this.validationMessages.push(asyncMessage);
        }
    }
    
    return validated;
}
```

**LIFECYCLE HOOKS:**
```typescript
mounted() {
    Application.eventBus.on('validate-inputs', this.handleValidation);
}

beforeUnmount() {
    Application.eventBus.off('validate-inputs', this.handleValidation);
}
```

## 5. Flujo de Funcionamiento

**PASO 1 - Activación Automática:**
Sistema detecta @PropertyName('Customer', Customer) donde segundo parámetro es clase BaseEntity no String/Number/Boolean, Application.js selecciona ObjectInputComponent para renderizado, pasa modelType=Customer class como prop.

**PASO 2 - Renderizado Inicial:**
Componente renderiza input readonly mostrando modelValue?.getDefaultPropertyValue() como valor display, si modelValue es EmptyEntity o null muestra vacío, botón search con icono GGICONS.SEARCH posicionado a la derecha.

**PASO 3 - Click en Botón Búsqueda:**
Usuario hace clic en botón search, showModalOnFunction ejecuta recibiendo modelType Customer class, callback setNewValue, y ViewTypes.LOOKUPVIEW, ApplicationUIService crea modal instanciando default_lookup_listview component.

**PASO 4 - Renderizado Modal:**
Modal lookup se abre mostrando tabla con todas las Customer instances disponibles cargadas desde API o Application.ModuleList, columnas configuradas según metadata de Customer entity, cada fila clickeable con evento de selección.

**PASO 5 - Selección Usuario:**
Usuario hace clic en fila de Customer específico John Doe, modal ejecuta callback setNewValue pasando customerJohn instance, setNewValue emite update:modelValue con customerJohn, v-model actualiza entity.customer = customerJohn, modal se cierra automáticamente.

**PASO 6 - Actualización Display:**
Input readonly re-renderiza con customerJohn.getDefaultPropertyValue() mostrando John Doe name property, isInputValidated se marca true si required estaba activo, validationMessages se limpia.

**PASO 7 - Validación al Guardar:**
Usuario intenta guardar, BaseEntity.validateInputs() emite evento validate-inputs, isValidated() ejecuta verificando nivel 1 required chequeando modelValue no es null/undefined/EmptyEntity, nivel 2 ejecuta validación síncrona como entity.customer.active === true, nivel 3 ejecuta validación asíncrona verificando crédito disponible vía API.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE usar @DefaultProperty en entity relacionada para definir display value en input.

**REGLA 2:** SIEMPRE validar required verificando null, undefined Y EmptyEntity instance.

**REGLA 3:** SIEMPRE registrar entidad relacionada en Application.ModuleList para que aparezca en modal lookup.

**REGLA 4:** SIEMPRE usar input readonly=true, NUNCA permitir edición directa del text.

**REGLA 5:** SIEMPRE pasar modelType class como prop para que modal sepa qué entidades cargar.

**REGLA 6:** SIEMPRE emitir update:modelValue desde setNewValue callback al recibir selección.

**REGLA 7:** SIEMPRE usar @PropertyName con segundo parámetro clase BaseEntity para activar ObjectInputComponent.

## 7. Prohibiciones

**PROHIBIDO:** Omitir @DefaultProperty en entity relacionada causando display value undefined.

**PROHIBIDO:** Usar String para relaciones almacenando solo ID sin objeto completo.

**PROHIBIDO:** Permitir edición directa del input removiendo readonly attribute.

**PROHIBIDO:** Olvidar registrar entidad en ModuleList causando modal lookup vacío.

**PROHIBIDO:** Validar required solo contra null/undefined sin verificar EmptyEntity.

**PROHIBIDO:** Crear objetos nuevos desde modal, solo seleccionar existentes.

**PROHIBIDO:** Mostrar múltiples properties en display value, limitado a getDefaultPropertyValue único.

## 8. Dependencias

**DECORADORES REQUERIDOS:**
- @PropertyName: Define nombre y tipo BaseEntity class
- @DefaultProperty: Marca property para display value
- @Required: Marca campo obligatorio
- @Validation: Valida propiedades del objeto relacionado
- @AsyncValidation: Verifica condiciones vía API
- @UniquePropertyKey: Define primary key para entidad relacionada

**SERVICIOS:**
- ApplicationUIService: Proporciona showModalOnFunction
- EventBus: Comunica evento validate-inputs
- Application.ModuleList: Registro de entidades disponibles

**COMPONENTES RELACIONADOS:**
- default_lookup_listview: Modal para selección de objetos
- useInputMetadata composable: Extrae metadata de decoradores

## 9. Relaciones

**ACTIVADO POR:**
@PropertyName(name, BaseEntityClass) - Segundo parámetro clase activa ObjectInputComponent.

**INTEGRA CON:**
- ApplicationUIService.showModalOnFunction(): Crea modal lookup
- BaseEntity.getDefaultPropertyValue(): Obtiene display value
- Application.View.value.isValid: Flag global de estado de formulario
- EventBus: Comunicación de eventos validate-inputs
- default_lookup_listview: Modal para selección

**FLUJO DE RENDERIZADO:**
Application.js detecta PropertyName con BaseEntity class, selecciona ObjectInputComponent, pasa entity/propertyName/metadata/modelValue/modelType como props, componente renderiza input readonly con botón search.

## 10. Notas de Implementación

**EJEMPLO ENTITIES:**
```typescript
@DefaultProperty('name')
@UniquePropertyKey('id')
@ModuleName('Customers')
@ModuleIcon(ICONS.USERS)
@ApiEndpoint('/api/customers')
@Persistent()
export class Customer extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Customer Name', String)
    @Required(true)
    name!: string;
    
    @PropertyIndex(3)
    @PropertyName('Active', Boolean)
    active!: boolean;
}

export class Order extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('Order Number', String)
    @Required(true)
    orderNumber!: string;
    
    @PropertyIndex(2)
    @PropertyName('Customer', Customer)
    @Required(true, 'Customer is required')
    @HelpText('Select the customer for this order')
    @Validation(
        (entity) => {
            if (!entity.customer || entity.customer instanceof EmptyEntity) return false;
            return entity.customer.active === true;
        },
        'Customer must be active'
    )
    @AsyncValidation(
        async (entity) => {
            if (!entity.customer || entity.customer instanceof EmptyEntity) return true;
            const response = await fetch(`/api/customers/${entity.customer.id}/credit`);
            const { hasCredit } = await response.json();
            return hasCredit;
        },
        'Customer has no available credit'
    )
    customer!: Customer;
}
```

**CASOS DE USO:**
1. Order → Customer: @Required + @Validation customer.active + @AsyncValidation crédito disponible
2. Employee → Department: @Required + @Validation department.isActive verificando departamento activo
3. Product → Category: @Required(false) relación opcional sin validaciones adicionales

**LAYOUT VISUAL:**
Estado sin selección: [Customer] [_______________][icono lupa]
Estado con selección: [Customer] [John Doe________][icono lupa]
Click en lupa: Modal lookup se abre con tabla completa de customers

**MODAL LOOKUP:**
Header con Search input y botón X cerrar
Tabla con columnas ID/Name/Active/Email según metadata Customer
Filas clickeables con hover effect
Click en fila John Doe: callback ejecuta, modal cierra, input actualiza

**VALIDACION ESPECIAL OBJETOS:**
null: NO válido
undefined: NO válido
EmptyEntity instance: NO válido valor default
Customer instance con id válido: Válido checkmark
Validación síncrona: entity.customer.active debe ser true
Validación asíncrona: API verifica crédito disponible

**DIFERENCIAS CON OTROS INPUTS:**
TextInput: editable vs readonly aquí, String type vs BaseEntity type
ArrayInputComponent: relación 1:N vs 1:1 aquí, múltiples objetos vs uno solo
ListInputComponent: enum values vs objetos completos, dropdown vs modal

**LIMITACIONES ACTUALES:**
1. NO hay filtros/paginación en modal: Muestra todos los registros causando performance issues con > 100 items
2. NO se puede crear objeto nuevo desde modal: Usuario debe ir a módulo Customer, crear, volver a Order
3. Display value limitado: Solo una property vía getDefaultPropertyValue, no múltiples campos como John Doe email

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- array-input-component.md: Componente para relaciones 1:N múltiples objetos
- property-name-decorator.md: Decorador que define tipo y activa componente
- default-property-decorator.md: Define property para display value
- ui-services.md: ApplicationUIService con showModalOnFunction
- base-entity-core.md: BaseEntity y EmptyEntity clases

**UBICACION:** copilot/layers/04-components/object-input-component.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
