# Button Components Overview

## 1. Propósito

Los componentes button proporcionan acciones estándar CRUD para vistas del framework gestionadas automáticamente por Application según contexto vista actual ViewType y persistencia entidad. Incluyen SaveButton guardar entidad, NewButton crear instancia, RefreshButton recargar datos, ValidateButton validar sin guardar, SaveAndNewButton guardar y crear nuevo, SendToDevice placeholder futuro, GenericButton sin acción predefinida. Application.setButtonList() determina qué botones mostrar basado en ViewTypes LISTVIEW muestra New Refresh, DETAILVIEW muestra todos buttons si persistent o subset si non-persistent.

## 2. Alcance

**UBICACION:** src/components/Buttons/

**COMPONENTES BUTTON:**
- SaveButtonComponent.vue: Ejecuta entity.save() guardando persistent entity
- NewButtonComponent.vue: Ejecuta createNewInstance() navegando DetailView nuevo
- RefreshButtonComponent.vue: Ejecuta entity.refresh() recargando desde servidor
- ValidateButtonComponent.vue: Ejecuta entity.validateInputs() validando campos sin save
- SaveAndNewButtonComponent.vue: Ejecuta save() luego createNewInstance() flujo consecutivo
- SendToDeviceButtonComponent.vue: Placeholder sin implementación actual futuro uso
- GenericButtonComponent.vue: Sin funcionalidad predefinida uso manual custom

**ESTILOS CSS:**
button secondary azul acciones principales Save, button info azul claro New, button success-green verde Refresh, button warning amarillo Validate, button accent morado SaveAndNew, button primary azul oscuro SendToDevice, button gris default Generic.

**INTEGRACION:**
Application.ListButtons.value array reactive almacena components markRaw wrapped, ActionsComponent.vue v-for renderiza dinámicamente buttons, setButtonList() ejecuta setTimeout 405ms después changeView actualizando ListButtons según ViewType entityObject.isPersistent().

**ICONOS:**
Google Material Symbols desde constants/ggicons.ts GGICONS.SAVE GGICONS.ADD GGICONS.REFRESH GGICONS.CHECK GGICONS.SAVE2 GGICONS.DEVICES renderizados span con GGCLASS.

## 3. Definiciones Clave

**Application.ListButtons reactive:**
Ref<Component[]> array almacena button components wrapped markRaw() evitando reactividad innecesaria Vue. ActionsComponent itera v-for renderizando component :is dinámicamente. Actualizado setButtonList() según Application.View.value.viewType y entityObject.isPersistent() determinando qué buttons mostrar contexto vista actual.

**setButtonList() lógica:**
Switch ViewTypes.LISTVIEW establece NewButton RefreshButton sin Save Validate no hay entity individual seleccionada. ViewTypes.DETAILVIEW verifica isPersistentEntity si true establece todos buttons New Refresh Validate Save SaveAndNew SendToDevice, si false omite Save SaveAndNew no puede persistir. Default empty array ningún button custom views.

**markRaw() wrapper:**
Vue 3 función previene proxy reactivo components evitando overhead performance unnecessary reactivity tracking. Todos button components wrapped markRaw() antes push ListButtons.value array. Sin markRaw Vue crearía proxies profundos component instances consuming memory triggering watchers innecesarios.

**setTimeout 405ms delay:**
setButtonList() ejecuta setTimeout 405ms después changeView permitiendo animaciones CSS transitions complete antes actualizar buttons. Delay sincroniza UI state evitando flicker visual buttons cambiando mid-transition. Valor 405ms ligeramente mayor 400ms transition durations CSS garantizando completion.

**isPersistent() check:**
BaseEntity método retorna boolean true si entity tiene @Persistent decorator o primary key populated indicating backend persisted record. False si entity in-memory only no guardada API como view models temporary data. Determina si mostrar Save SaveAndNew buttons solo entities pueden persistir backend database.

## 4. Descripción Técnica

**SAVEBUTTON COMPONENT:**
```vue
<template>
    <button class="button secondary" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.SAVE }}</span>
        Save
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'SaveButtonComponent',
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.save();
            }
        }
    },
    data() {
        return { GGCLASS, GGICONS };
    }
}
</script>

<style scoped>
.button.secondary span {
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>
```
**FUNCIONAMIENTO:** Obtiene entity desde Application.View.value.entityObject, verifica isPersistent() true, ejecuta await entity.save() llamando beforeSave() hook validateEntity() getPayload() POST o PUT API endpoint, afterSave() hook actualiza entity state, toast notification success o error displayed.

**NEWBUTTON COMPONENT:**
```typescript
methods: {
    createNew() {
        const entityClass = Application.View.value.entityClass;
        if (entityClass) {
            const newInstance = entityClass.createNewInstance();
            Application.changeViewToDetailView(newInstance);
        }
    }
}
```
**FUNCIONAMIENTO:** Obtiene entityClass typeof BaseEntity desde View, ejecuta static method createNewInstance() retornando new instance con defaults decorators, llama changeViewToDetailView navegando router /module/new rendering DefaultDetailView formulario vacío, botones actualizados setButtonList() mostrando Save Validate si persistent.

**VALIDATEBUTTON COMPONENT:**
```typescript
methods: {
    async saveItem() {
        const entity = Application.View.value.entityObject;
        if (entity) {
            await entity.validateInputs();
        }
    }
}
```
**FUNCIONAMIENTO:** Ejecuta entity.validateInputs() emitiendo eventBus event 'validate-inputs', todos input components listeners ejecutan validateInput() local checkingRequired unique mask format async validators, actualiza hasError ref styling inputs red border error message display, NO guarda entity solo validation checking.

**REFRESHBUTTON COMPONENT:**
```typescript
methods: {
    async refresh() {
        const entity = Application.View.value.entityObject;
        if (entity) {
            await entity.refresh();
        }
    }
}
```
**FUNCIONAMIENTO:** Ejecuta entity.refresh() GET request API endpoint /module/:id recarga datos servidor, descarta local changes no guardados overwriting entity properties, útil revert cambios accidentales o fetch latest data concurrent edits otros usuarios.

**SAVEANDNEW COMPONENT:**
```typescript
methods: {
    async saveAndNew() {
        const entity = Application.View.value.entityObject;
        if (entity && entity.isPersistent()) {
            await entity.save();
            const newInstance = entity.constructor.createNewInstance();
            Application.changeViewToDetailView(newInstance);
        }
    }
}
```
**FUNCIONAMIENTO:** Guarda entity actual await entity.save(), obtiene constructor casting typeof BaseEntity, ejecuta createNewInstance() nueva instancia vacía, navega changeViewToDetailView rendering formulario nuevo, workflow eficiente crear múltiples records consecutivos sin regresar ListView manualmente.

**SENDTODEVICE PLACEHOLDER:**
```typescript
methods: {
    sendToDevice() {
        console.log('Send to device clicked');
        // TODO: Implementar funcionalidad
    }
}
```
**ESTADO:** Sin implementación funcional actual, placeholder button reservado futuras features sync devices mobile tablets, actualmente renderiza button sin acción real ejecutada.

**GENERICBUTTON COMPONENT:**
Sin funcionalidad predefinida action method, usado manually custom views agregando buttons específicos sin crear dedicated components, props opcionales label icon click handler passed parent component.

**SETBUTTONLIST METHOD:**
```typescript
setButtonList() {
    const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;
    
    switch (this.View.value.viewType) {
        case ViewTypes.LISTVIEW:
            this.ListButtons.value = [
                markRaw(NewButtonComponent),
                markRaw(RefreshButtonComponent)
            ];
            break;
            
        case ViewTypes.DETAILVIEW:
            if (isPersistentEntity) {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SaveButtonComponent),
                    markRaw(SaveAndNewButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            } else {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            }
            break;
            
        default:
            this.ListButtons.value = [];
            break;
    }
}
```
**LOGICA SWITCH:** Case LISTVIEW establece New Refresh sin entity individual no Save Validate. Case DETAILVIEW verifica isPersistentEntity true todos buttons incluye Save SaveAndNew, false omite Save SaveAndNew solo New Refresh Validate SendToDevice. Default empty array custom views no standard buttons.

## 5. Flujo de Funcionamiento

**PASO 1 - ChangeView Trigger setButtonList:**
Usuario hace clic fila tabla ListView ejecutando openDetailView(), Application.changeViewToDetailView actualiza View.value estableciendo entityClass entityObject component viewType, método ejecuta setTimeout(() => setButtonList(), 405) delay permitiendo CSS transitions complete, timer expires ejecuta setButtonList() leyendo viewType isPersistent determinando buttons.

**PASO 2 - SetButtonList Actualiza ListButtons:**
setButtonList() switch viewType case DETAILVIEW, obtiene isPersistentEntity con entityObject?.isPersistent() ?? false optional chaining nullish coalescing default false, verifica isPersistentEntity true estableciendo ListButtons array [New Refresh Validate Save SaveAndNew SendToDevice] wrapped markRaw(), si false omite Save SaveAndNew estableciendo [New Refresh Validate SendToDevice], Application.ListButtons.value updated triggering reactivity.

**PASO 3 - ActionsComponent Reactivo Renderiza:**
ActionsComponent v-for itera Application.ListButtons.value array, cada iteration renderiza component :is="button" :key="index" dinámicamente, Vue monta button components ejecutando lifecycle hooks onMounted data() methods, buttons aparecen floating-actions container bottom-right viewport styled CSS variables colors icons, transition smooth fade-in animation.

**PASO 4 - Usuario Hace Clic SaveButton:**
Usuario hace clic Save button triggering @click="saveItem", método saveItem() obtiene entity = Application.View.value.entityObject, verifica if entity && entity.isPersistent() true, ejecuta await entity.save() async operation, entity.save() ejecuta beforeSave() validateEntity() getPayload() construyendo request body, POST nuevo o PUT existente API endpoint, afterSave() actualiza entity state properties, toast notification success verde displayed.

**PASO 5 - Validate Sin Guardar:**
Usuario hace clic Validate button mientras edita form campos, @click="saveItem" ejecuta entity.validateInputs(), método emite Application.eventBus.emit('validate-inputs') event, todos input components listeners TextInputComponent EmailInputComponent NumberInputComponent reciben event ejecutando validateInput() local, inputs check required unique mask format async validators, errors display red border message, entity NO guardada solo validation UI feedback.

**PASO 6 - SaveAndNew Workflow:**
Usuario completa formulario hace clic SaveAndNew button, await entity.save() ejecuta saving record backend, success response recibida obtiene constructor entity.constructor typeof BaseEntity, ejecuta createNewInstance() nueva instancia vacía defaults, Application.changeViewToDetailView(newInstance) navega router /module/new rendering nuevo formulario, permite crear múltiples records consecutivos sin regresar ListView cada vez, workflow eficiente data entry.

**PASO 7 - Refresh Descarta Cambios:**
Usuario edita campos form accidentally cambia valores incorrectos, hace clic Refresh button ejecutando entity.refresh(), método GET request API endpoint /module/:id fetching latest data servidor, descarta local changes no guardados overwriting entity properties fresh data, inputs re-render con valores originales, útil revert mistakes sin recargar página entera.

**PASO 8 - NewButton Desde ListView:**
Usuario en ListView tabla records hace clic New button floating actions, createNew() obtiene entityClass desde View.value.entityClass, ejecuta createNewInstance() static method retornando new entity vacía, changeViewToDetailView navega /module/new router push, setButtonList() ejecuta delay establishing buttons Save Validate si persistent, DefaultDetailView renderiza formulario inputs vacíos ready data entry.

**PASO 9 - ListView Solo New Refresh:**
Usuario navega ListView tabla products, Application.changeViewToListView establece viewType LISTVIEW, setButtonList() ejecuta switch case LISTVIEW, establece ListButtons [NewButton RefreshButton] markRaw wrapped, ActionsComponent renderiza solo dos buttons, no Save Validate no entity individual selected table, New creates nuevo Refresh reloads table data refreshing API call.

**PASO 10 - Non-Persistent Entity Buttons:**
Entity class sin @Persistent decorator view model temporary, Application.changeViewToDetailView establece viewType DETAILVIEW, setButtonList() verifica isPersistentEntity = false, switch case DETAILVIEW else branch establece ListButtons omitting Save SaveAndNew [New Refresh Validate SendToDevice], buttons Save SaveAndNew hidden no puede persistir backend, usuario puede validate crear new discard changes no save API.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE ejecutar setButtonList() con setTimeout 405ms delay después changeView permitiendo CSS transitions complete evitando visual flicker.

**REGLA 2:** SIEMPRE wrap button components con markRaw() antes push ListButtons.value array evitando proxy reactivo unnecessary Vue overhead.

**REGLA 3:** SIEMPRE verificar entity.isPersistent() antes ejecutar save() saveAndNew() methods evitando errors non-persistent entities.

**REGLA 4:** SIEMPRE obtener entity desde Application.View.value.entityObject NUNCA local state desync con Application singleton.

**REGLA 5:** SIEMPRE usar switch case ViewTypes.LISTVIEW DETAILVIEW default en setButtonList() garantizando buttons correctos cada view type.

**REGLA 6:** SIEMPRE importar GGICONS GGCLASS desde constants/ggicons.ts NUNCA hardcodear icon names strings.

**REGLA 7:** SIEMPRE verificar entityClass not null antes ejecutar createNewInstance() evitando TypeError undefined.

## 7. Prohibiciones

**PROHIBIDO:** Omitir markRaw() wrapper button components causando Vue crear proxies reactivos unnecessary overhead memory leaks.

**PROHIBIDO:** Llamar setButtonList() sin setTimeout delay causando buttons update mid-CSS-transition visual glitches flicker.

**PROHIBIDO:** Ejecutar save() non-persistent entities ignorando isPersistent() check causing errors backend API.

**PROHIBIDO:** Almacenar entity reference local component state sin obtener desde Application.View desync con singleton state global.

**PROHIBIDO:** Modificar Application.ListButtons.value directamente fuera setButtonList() method violating single responsibility principle.

**PROHIBIDO:** Crear button components sin importar Application singleton causando undefined errors runtime.

**PROHIBIDO:** Hardcodear button visibility logic component templates, usar setButtonList() centralized logic Application.

## 8. Dependencias

**MODELS:**
- Application: Singleton con View.value ListButtons.value router eventBus setButtonList() changeViewToListView changeViewToDetailView methods
- BaseEntity: isPersistent() save() refresh() validateInputs() createNewInstance() isNew() methods

**ENUMS:**
- ViewTypes: LISTVIEW DETAILVIEW CUSTOMVIEW para switch case setButtonList()

**CONSTANTS:**
- ggicons.ts: GGICONS object con SAVE ADD REFRESH CHECK SAVE2 DEVICES icon names, GGCLASS string Google Material Symbols clase CSS

**COMPONENTES:**
- ActionsComponent: Renderiza dinámicamente ListButtons array v-for component :is

**CSS:**
- main.css: button secondary info success-green warning accent primary classes colors styling

**DECORADORES:**
- @Persistent: Determina isPersistent() retorno true false entity persistible backend

## 9. Relaciones

**BUTTONS Y APPLICATION VIEW:**
Buttons leen Application.View.value.entityObject accediendo entity actual executing actions save refresh validate, View.value.entityClass usado NewButton createNewInstance() method, View.value.viewType determina setButtonList() switch case deciding qué buttons mostrar, cambios View actualizados changeView methods triggering setButtonList() updating buttons reactively.

**SETBUTTONLIST Y PERSISTENCIA:**
isPersistent() boolean determina if Save SaveAndNew incluidos ListButtons, true permite persist backend mostrando save buttons, false omite save buttons entity in-memory only view model, decorator @Persistent en entity class establece metadata leída isPersistent() runtime checking primary key existence.

**ACTIONSCOMPONENT DYNAMIC RENDERING:**
ActionsComponent no hardcodea button list, itera Application.ListButtons.value v-for rendering component :is dinámicamente, markRaw wrapped components evitan proxy overhead, :key="index" garantiza Vue tracked items re-rendering correctly, cambios ListButtons trigger v-for reactivity mounting unmounting buttons smooth transitions.

**SAVEANDNEW WORKFLOW ENCADENADO:**
SaveAndNew encadena dos operations save() luego createNewInstance() changeViewToDetailView, primera operation persiste entity actual backend POST PUT, segunda operation crea nueva instancia vacía navigates DetailView nuevo formulario, permite data entry consecutivo múltiples records sin manual navigation ListView, común scenarios bulk input forms.

**VALIDATEBUTTON Y EVENTBUS:**
Validate button emite 'validate-inputs' event Application.eventBus, no ejecuta validation directa, delega input components listeners executing validateInput() local, pattern desacoplado permite inputs independiente validation logic, centraliza triggering broadcast event todos inputs simultáneamente, UI feedback red borders error messages displayed cada input failed validation.

**MARKRAW PERFORMANCE OPTIMIZATION:**
markRaw() Vue 3 function previene reactive proxy creation components, buttons son static instances no necesitan reactivity tracking internal changes, wrapping markRaw reduces memory footprint eliminates watchers unnecessary, ListButtons.value array sí reactivo pero items array no reactivos markRaw wrapped, balance performance reactivity donde necesario.

## 10. Notas de Implementación

**EJEMPLO CREAR BUTTON CUSTOM:**
```vue
<template>
    <button class="button info" @click="customAction">
        <span :class="GGCLASS">{{ GGICONS.EXPORT }}</span>
        Export
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'ExportButtonComponent',
    methods: {
        async customAction() {
            const entity = Application.View.value.entityObject;
            if (entity) {
                const data = entity.toJSON();
                const blob = new Blob([JSON.stringify(data, null, 2)], { 
                    type: 'application/json' 
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${entity.constructor.name}_${entity.id}.json`;
                a.click();
            }
        }
    },
    data() {
        return { GGCLASS, GGICONS };
    }
}
</script>

<style scoped>
.button.info span {
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>
```

**REGISTRAR BUTTON CUSTOM SETBUTTONLIST:**
```typescript
import ExportButtonComponent from '@/components/Buttons/ExportButtonComponent.vue';

setButtonList() {
    const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;
    
    switch (this.View.value.viewType) {
        case ViewTypes.DETAILVIEW:
            if (isPersistentEntity) {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SaveButtonComponent),
                    markRaw(SaveAndNewButtonComponent),
                    markRaw(ExportButtonComponent),  // Custom button
                    markRaw(SendToDeviceButtonComponent)
                ];
            }
            break;
    }
}
```

**MATRIZ DISPONIBILIDAD BUTTONS:**
```
ListView + Persistent:
  New ✓
  Refresh ✓
  Validate ✗ (no formulario)
  Save ✗ (no entity individual)
  SaveAndNew ✗ (no entity individual)
  SendToDevice ✗ (DetailView only)

DetailView + Persistent:
  New ✓
  Refresh ✓
  Validate ✓
  Save ✓
  SaveAndNew ✓
  SendToDevice ✓

DetailView + Non-Persistent:
  New ✓
  Refresh ✓
  Validate ✓
  Save ✗ (no persistible)
  SaveAndNew ✗ (no persistible)
  SendToDevice ✓
```

**EJEMPLO DEBUGGING BUTTONS:**
```typescript
// Ver buttons actuales
console.log('Current buttons:', Application.ListButtons.value);
// [NewButtonComponent, RefreshButtonComponent, ...]

// Ver entity persistence
console.log('Is persistent:', Application.View.value.entityObject?.isPersistent());

// Ver viewType
console.log('View type:', Application.View.value.viewType);
// ViewTypes.DETAILVIEW

// Testear setButtonList manually
Application.setButtonList();
console.log('Updated buttons:', Application.ListButtons.value.length);

// Verificar markRaw wrapped
console.log('Is raw:', Vue.isReactive(Application.ListButtons.value[0]));
// false si markRaw wrapped correctamente
```

**CSS VARIANTS COMPLETOS:**
```css
.button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: 0.3s ease;
}

.button.secondary {
    background-color: var(--btn-secondary);  /* Azul */
    color: var(--white);
}

.button.info {
    background-color: var(--btn-info);  /* Azul claro */
    color: var(--white);
}

.button.success-green {
    background-color: var(--green-soft);  /* Verde */
    color: var(--white);
}

.button.warning {
    background-color: var(--btn-warning);  /* Amarillo */
    color: var(--dark);
}

.button.accent {
    background-color: var(--accent);  /* Morado */
    color: var(--white);
}

.button.primary {
    background-color: var(--btn-primary);  /* Azul oscuro */
    color: var(--white);
}

.button span {
    font-size: 1.1rem;
}

.button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.button:active {
    transform: translateY(0);
}
```

**TIMING DELAY EXPLICACION:**
setTimeout 405ms delay crítico timing coordinación:
- CSS transitions duran 400ms definidas main.css
- setButtonList() espera 405ms garantizando transitions complete
- Premature button update mid-transition causa visual glitches
- Extra 5ms safety margin compensating browser timing inconsistencies
- Reduce delay 300ms buttons apareceríani mid-fade producing flicker
- Aumentar delay 600ms buttons aparecen demasiado tarde user perceives lag

**LIMITACIONES ACTUALES:**
SendToDevice button placeholder sin funcionalidad real, no ejecuta sync devices mobile tablets, futuro implementation requiere backend API endpoints device management. GenericButton sin props system, custom buttons necesitan dedicated components no reusable generic con props label icon action. No keyboard shortcuts buttons, accessibility requiere tab navigation enter key press simulating click events.

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- ActionsComponent.md: Componente renderiza buttons dinámicamente v-for ListButtons array
- application-singleton.md: Application.View Application.ListButtons setButtonList() changeViewToListView changeViewToDetailView methods
- base-entity-core.md: isPersistent() save() refresh() validateInputs() createNewInstance() methods ejecutados buttons
- event-bus.md: eventBus.emit('validate-inputs') usado ValidateButton triggering input validation
- DefaultDetailView.md: Componente renderiza formulario con ActionsComponent buttons floating
- DefaultListView.md: Componente renderiza tabla con ActionsComponent buttons New Refresh
- Enums.md: ViewTypes.LISTVIEW DETAILVIEW usado switch setButtonList()
- persistent-decorator.md: Decorador @Persistent determina isPersistent() check Save buttons visibility

**UBICACION:** copilot/layers/04-components/buttons-overview.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
