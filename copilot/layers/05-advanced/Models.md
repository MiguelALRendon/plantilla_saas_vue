# Models del Framework

## 1. PROPOSITO

Los models definen estructuras de datos TypeScript que representan estado de aplicación mediante interfaces y clases. Incluyen configuración global AppConfiguration, estado vistas View CRUD, estado modal Modal para lookups, menús dropdown DropdownMenu, diálogos confirmación confirmationMenu, notificaciones Toast, contexto UI completo ApplicationUIContext, y utilidades EnumAdapter para conversión enums. La mayoría son interfaces usadas como tipos para propiedades reactivas Ref de Application y ApplicationUIService garantizando type safety y reactividad Vue 3.

## 2. ALCANCE

**UBICACION:** src/models/

**MODELS IMPLEMENTADOS:**
- AppConfiguration.ts: Interface configuración global app
- View.ts: Interface estado vista actual CRUD
- modal.ts: Interface estado modal global lookups
- dropdown_menu.ts: Interface estado menú desplegable
- confirmation_menu.ts: Interface estado diálogo confirmación
- Toast.ts: Class notificación toast individual con ID autogenerado
- application_ui_context.ts: Interface agrupa todos estados UI
- enum_adapter.ts: Class convertir enums TypeScript a key-value pairs

**PROPIEDADES REACTIVAS:**
- Application.View: Ref<View>
- Application.ApplicationUIService.AppConfiguration: Ref<AppConfiguration>
- Application.ApplicationUIService.modal: Ref<Modal>
- Application.ApplicationUIService.dropdownMenu: Ref<DropdownMenu>
- Application.ApplicationUIService.confirmationMenu: Ref<confirmationMenu>
- Application.ApplicationUIService.ToastList: Ref<Toast[]>

**INTEGRACION:**
ApplicationUIService implementa ApplicationUIContext interface, todos models son interfaces excepto Toast y EnumAdapter que son classes necesitando lógica constructor.

## 3. DEFINICIONES CLAVE

**AppConfiguration interface:**
Define configuración global aplicación con propiedades appName appVersion apiBaseUrl apiTimeout environment logLevel authTokenKey sessionTimeout itemsPerPage maxFileSize isDarkMode. Almacenada en ApplicationUIService.AppConfiguration como Ref<AppConfiguration> reactiva. Valores inicializados desde import.meta.env variables entorno Vite, isDarkMode persiste en localStorage resto se pierde al reload.

**View interface:**
Representa estado vista actual CRUD con entityClass typeof BaseEntity clase entidad, entityObject BaseEntity instancia entidad actual, component Component Vue renderizado, viewType ViewTypes tipo vista LISTVIEW DETAILVIEW LOOKUPVIEW, isValid boolean validación, entityOid string ID entidad. Almacenado en Application.View como Ref<View> reactivo, es corazón sistema navegación CRUD framework.

**Modal interface:**
Estado modal global sistema con modalView typeof BaseEntity clase mostrar, modalOnCloseFunction callback recibe entidad seleccionada, viewType ViewTypes tipo vista modal, customViewId string opcional vistas custom no-CRUD. Usado principalmente lookups selección entidades relacionadas ObjectInputComponent. Callback ejecutado al cerrar modal con entidad seleccionada.

**Toast class:**
Única estructura es clase no interface porque necesita generar IDs únicos automáticamente. Propiedades id string generado Math.random().toString(36).substr(2,9), message string texto notificación, type ToastType visual SUCCESS ERROR INFO WARNING. Constructor recibe message y type generando id automáticamente. Instancias almacenadas en ApplicationUIService.ToastList array Ref<Toast[]>.

**EnumAdapter class:**
Clase utilitaria convierte enums TypeScript numéricos a arrays {key value} para componentes selección ListInputComponent. Resuelve problema reverse mapping donde enum ToastType genera {SUCCESS: 0, 0: "SUCCESS"} duplicando keys. Método getKeyValuePairs() filtra con isNaN(Number(key)) retornando solo keys string sin duplicados numéricos.

## 4. DESCRIPCION TECNICA

**APPCONFIGURATION INTERFACE:**
```typescript
export interface AppConfiguration {
    appName: string;            // "SaaS Template Vue"
    appVersion: string;         // "1.0.0" semver
    apiBaseUrl: string;         // "https://api.example.com"
    apiTimeout: number;         // 30000 ms timeout requests
    apiRetryAttempts: number;   // 3 intentos retry
    environment: string;        // "development" "production"
    logLevel: string;          // "debug" "info" "warn" "error"
    authTokenKey: string;      // "auth_token" localStorage key
    authRefreshTokenKey: string; // "refresh_token" localStorage key
    sessionTimeout: number;    // 3600000 ms 1 hora
    itemsPerPage: number;      // 20 registros por página
    maxFileSize: number;       // 5242880 bytes 5MB
    isDarkMode: boolean;       // false tema claro default
}
```
**INICIALIZACION:** ApplicationUIService constructor usa import.meta.env.VITE_API_BASE_URL para apiBaseUrl, import.meta.env.MODE para environment, localStorage.getItem('darkMode') === 'true' para isDarkMode permitiendo persistencia tema usuario. Resto propiedades hardcodeadas valores default razonables.

**VIEW INTERFACE:**
```typescript
import { BaseEntity } from "@/entities/base_entitiy";
import { ViewTypes } from "@/enums/view_type";
import { Component } from "vue";

type EntityCtor = typeof BaseEntity;

export interface View {
    entityClass: EntityCtor | null;     // Products class
    entityObject: BaseEntity | null;    // instance new Products()
    component: Component | null;        // DefaultDetailView
    viewType: ViewTypes;               // ViewTypes.DETAILVIEW
    isValid: boolean;                  // true si validaciones pasan
    entityOid: string;                 // "123" ID backend, "new" creación
}
```
**ESTADOS VISTA:** LISTVIEW tiene entityClass populated entityObject null component DefaultListView, DETAILVIEW NEW tiene entityClass entityObject new Entity() entityOid "new", DETAILVIEW EDIT tiene entityClass entityObject loaded entityOid con ID numérico, LOOKUPVIEW usado en modal selection sin cambiar Application.View solo modal.value.viewType.

**MODAL INTERFACE:**
```typescript
import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entitiy';

export interface Modal {
    modalView: typeof BaseEntity | null;              // Customer class lookup
    modalOnCloseFunction: ((param: any) => void) | null; // callback selection
    viewType: ViewTypes;                             // ViewTypes.LOOKUPVIEW
    customViewId?: string;                           // "custom-report-view" opcional
}
```
**FLUJO LOOKUP:** ObjectInputComponent llama ApplicationUIService.openModal pasando component DefaultLookupListView y onFunction callback, service establece modal.value con datos emite show-modal evento, usuario selecciona entidad clickedItem llamando closeModalOnFunction con selected entity, service ejecuta callback pasando entity actualiza ObjectInputComponent modelValue, emite hide-modal resetea modal.value a defaults null.

**DROPDOWNMENU INTERFACE:**
```typescript
import { Component } from "vue";

export interface DropdownMenu {
    showing: boolean;           // true visible
    title: string;             // "Opciones Usuario"
    component: Component | null; // UserMenuComponent renderizado
    width: string;             // "300px"
    position_x: string;        // "150px" left calculado
    position_y: string;        // "200px" top calculado
    activeElementWidth: string;  // "120px" trigger button width
    activeElementHeight: string; // "40px" trigger button height
    canvasWidth: string;       // "1920px" viewport width
    canvasHeight: string;      // "1080px" viewport height
}
```
**POSICIONAMIENTO INTELIGENTE:** DropdownMenu.vue calcula position_x position_y automáticamente obteniendo triggerElement.getBoundingClientRect(), intenta abrir hacia abajo-derecha default, si se sale viewport derecha abre hacia izquierda x = triggerRect.right - menuWidth, si se sale viewport abajo abre hacia arriba y = triggerRect.top - menuHeight, garantiza dropdown siempre visible dentro viewport.

**CONFIRMATIONMENU INTERFACE:**
```typescript
import { confMenuType } from "@/enums/conf_menu_type";

export interface confirmationMenu {
    type: confMenuType;                  // WARNING ERROR INFO SUCCESS
    title: string;                       // "Eliminar producto?"
    message: string;                     // "Esta acción no se puede deshacer"
    confirmationAction?: () => void;     // () => entity.delete() callback
    acceptButtonText?: string;           // "Eliminar" custom default "Aceptar"
    cancelButtonText?: string;           // "Cancelar" custom default "Cancelar"
}
```
**USO:** ApplicationUIService.openConfirmationMenu recibe objeto confirmationMenu estableciendo confirmationMenu.value emitiendo show-confirmation evento, ConfirmationDialogComponent renderiza modal con header color según type mapping confMenuType a backgroundColor, usuario hace clic Aceptar ejecutando confirmationAction callback o Cancelar solo cerrando, closeConfirmationMenu emite hide-confirmation resetea confirmationMenu.value.

**TOAST CLASS:**
```typescript
import { ToastType } from "@/enums/ToastType";

export class Toast {
    id: string;          // "x7k3md9w2" autogenerado único
    message: string;     // "Producto guardado correctamente"
    type: ToastType;     // ToastType.SUCCESS

    constructor(message: string, type: ToastType) {
        this.id = Math.random().toString(36).substr(2, 9);  // Random ID
        this.message = message;
        this.type = type;
    }
}
```
**GENERACION ID:** Math.random() genera 0.8472615, toString(36) convierte base36 "0.k3md9w2x7" usando 0-9 a-z, substr(2,9) extrae "k3md9w2x7" removiendo "0.", ID usado como :key en v-for ToastContainerComponent y identificar toast remover al cerrar. Única clase models porque necesita lógica constructor generar ID, resto interfaces sin lógica.

**APPLICATIONUICONTEXT INTERFACE:**
```typescript
import type { Ref } from 'vue';
import type { Emitter } from 'mitt';
import type { AppConfiguration } from './AppConfiguration';
import type { Modal } from './modal';
import type { DropdownMenu } from './dropdown_menu';
import type { confirmationMenu } from './confirmation_menu';
import type { Events } from '@/types/events';
import type { Toast } from './Toast';

export interface ApplicationUIContext {
    AppConfiguration: Ref<AppConfiguration>;
    eventBus: Emitter<Events>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<confirmationMenu>;
    ToastList: Ref<Toast[]>;
}
```
**PROPOSITO:** Agrupa TODOS estados reactivos UI framework sirviendo como tipo para ApplicationUIService que implementa interface. Define contrato exacto propiedades debe tener service permitiendo TypeScript validar implementación completa, sirve como documentación estructura service, facilita crear mocks testing implementando ApplicationUIContext.

**ENUMADAPTER CLASS:**
```typescript
export class EnumAdapter {
    private enumRef: any;  // any porque acepta cualquier enum

    constructor(enumRef: any) {
        this.enumRef = enumRef;
    }

    getKeyValuePairs(): { key: string; value: number }[] {
        return Object.keys(this.enumRef)
            .filter(key => isNaN(Number(key)))  // Filtrar "0" "1" "2" etc
            .map(key => ({
                key: key,                       // "SUCCESS" "ERROR" etc
                value: this.enumRef[key]       // 0, 1, etc
            }));
    }
}
```
**PROBLEMA REVERSE MAPPING:** Enum numérico ToastType {SUCCESS: 0, ERROR: 1} genera runtime {SUCCESS: 0, ERROR: 1, 0: "SUCCESS", 1: "ERROR"} duplicando keys, Object.keys retorna ["0", "1", "SUCCESS", "ERROR"] con duplicados. SOLUCION: isNaN(Number(key)) filtra keys numéricas "0" "1" retornando solo ["SUCCESS", "ERROR"], map genera [{key: "SUCCESS", value: 0}, {key: "ERROR", value: 1}] limpio para ListInputComponent dropdown options.

## 5. FLUJO DE FUNCIONAMIENTO

**PASO 1 - Inicializar AppConfiguration:**
ApplicationUIService constructor ejecuta creando ref<AppConfiguration> inicializando valores, lee import.meta.env.VITE_API_BASE_URL estableciendo apiBaseUrl, lee import.meta.env.MODE estableciendo environment development o production, lee localStorage.getItem('darkMode') estableciendo isDarkMode booleano, resto propiedades hardcodeadas defaults razonables, AppConfiguration reactivo changes propagate UI automáticamente.

**PASO 2 - Cambiar Vista a ListView:**
Usuario navega /products, router ejecuta Application.changeViewToListView(Products), método establece Application.View.value con entityClass Products entityObject null component DefaultListView viewType ViewTypes.LISTVIEW isValid true entityOid empty, ActionsComponent computed ListButtons reacciona renderizando NewButton RefreshButton según viewType, DefaultListView renderiza tabla registros llamando Products.all() fetching API.

**PASO 3 - Crear Nueva Entidad:**
Usuario hace clic NewButton ejecutando handleNew(), crea instancia newProduct = new Products() con defaults vacíos, llama Application.changeViewToDetailView(newProduct), método establece View.value con entityClass Products entityObject newProduct component DefaultDetailView viewType DETAILVIEW isValid false entityOid "new", router navega /products/new, DefaultDetailView renderiza formulario inputs vacíos, ActionsComponent renderiza SaveButton ValidateButton.

**PASO 4 - Abrir Modal Lookup:**
Usuario hace clic ObjectInputComponent botón lookup seleccionar Customer relación, ejecuta openLookup() llamando ApplicationUIService.openModal({component: DefaultLookupListView, onFunction: callback}), service establece modal.value con modalView DefaultLookupListView modalOnCloseFunction callback almacenado viewType LOOKUPVIEW, emite show-modal evento, modal wrapper listener establece isModalVisible true renderizando LookupListView dentro modal backdrop, usuario ve tabla customers seleccionables.

**PASO 5 - Seleccionar Entidad Modal:**
Usuario hace clic fila customer tabla lookup, LookupItem ejecuta clickedItem(customer) llamando ApplicationUIService.closeModalOnFunction(customer), service obtiene callback desde modal.value.modalOnCloseFunction ejecutando callback(customer), callback en ObjectInputComponent actualiza modelValue.value = customer emitiendo update:modelValue, service emite hide-modal evento modal wrapper cierra, service resetea modal.value a defaults modalView null, ObjectInputComponent muestra customer.name en input readonly.

**PASO 6 - Mostrar Toast Notificación:**
Usuario hace clic SaveButton iniciando save operation, código ejecuta ApplicationUIService.pushToast({type: ToastType.SUCCESS, title: "Éxito", message: "Guardado", duration: 3000}), service crea newToast = new Toast(message, type) generando ID automático, pushea newToast a ToastList.value array, ToastContainerComponent v-for reactivo renderiza ToastItemComponent con :key="toast.id", ToastItemComponent mounted setTimeout 3000ms llamando removeToast(), timeout completa splice toast desde ToastList array desapareciendo UI con transition.

**PASO 7 - Abrir Confirmation Dialog:**
Usuario hace clic DeleteButton acción destructiva, código llama ApplicationUIService.openConfirmationMenu({type: confMenuType.WARNING, title: "Eliminar?", message: "No se puede deshacer", confirmationAction: () => entity.delete()}), service establece confirmationMenu.value con datos callback, emite show-confirmation evento, ConfirmationDialogComponent listener establece isVisible true renderizando modal header amarillo WARNING, usuario hace clic Aceptar ejecutando handleConfirm llamando confirmationAction() con entity.delete(), service emite hide-confirmation cierra modal.

**PASO 8 - Posicionar Dropdown Menu:**
Usuario hace clic botón opciones trigger dropdown, código llama ApplicationUIService.openDropdownMenu recibiendo triggerElement event.target, service calcula const triggerRect = triggerElement.getBoundingClientRect() obteniendo x y width height, calcula posición inicial x = triggerRect.left y = triggerRect.bottom intentando abrir abajo-derecha, verifica if (x + menuWidth > window.innerWidth) ajustando x = triggerRect.right - menuWidth abriendo izquierda, verifica if (y + menuHeight > window.innerHeight) ajustando y = triggerRect.top - menuHeight abriendo arriba, establece dropdownMenu.value con position_x position_y calculadas showing true, DropdownMenu.vue renderiza posición absolute correcta visible dentro viewport.

**PASO 9 - Validar Vista Actual:**
Usuario hace clic ValidateButton iniciando validation, ejecuta Application.eventBus.emit('validate-inputs') notificando todos input components, cada input ejecuta validateInput() actualizando hasError ref según metadata validations, ValidateButton espera nextTick() permitiendo DOM update, emite validate-entity evento para cross-field validations custom, obtiene entity = Application.View.value.entityObject llamando await entity.validate() ejecutando getPropertyValidations(), actualiza Application.View.value.isValid = result true o false, SaveButton reacciona computed isDisabled habilitando/deshabilitando según isValid state.

**PASO 10 - Convertir Enum con EnumAdapter:**
Decorador @PropertyType recibe new EnumAdapter(Priority) almacenando metadata, DefaultDetailView itera properties obteniendo propertyType metadata detectando EnumAdapter instance, renderiza ListInputComponent pasando :property-enum-values="adapter", ListInputComponent computed enumOptions ejecuta adapter.getKeyValuePairs() filtrando reverse mapping, retorna [{key: "LOW", value: 0}, {key: "MEDIUM", value: 1}, {key: "HIGH", value: 2}], v-for option renderiza dropdown options value numérico label string, usuario selecciona option actualizando v-model modelValue con value numérico 0 1 2 matching enum Priority values.

## 6. REGLAS OBLIGATORIAS

**REGLA 1:** SIEMPRE usar interfaces para structures data sin lógica, classes solo cuando necesario constructor o métodos como Toast EnumAdapter.

**REGLA 2:** SIEMPRE almacenar estados UI en Ref<> permitiendo reactividad Vue 3, NUNCA usar variables plain perdiendo reactivity.

**REGLA 3:** SIEMPRE establecer entityOid = "new" para entidades nuevas sin ID backend permitiendo detectar modo creación.

**REGLA 4:** SIEMPRE ejecutar modalOnCloseFunction callback antes resetear modal.value a null evitando perder referencia callback.

**REGLA 5:** SIEMPRE generar Toast ID automáticamente con Math.random().toString(36) garantizando uniqueness para :key v-for.

**REGLA 6:** SIEMPRE usar EnumAdapter.getKeyValuePairs() para enums numéricos en dropdowns, NUNCA Object.keys directo con reverse mapping duplicados.

**REGLA 7:** SIEMPRE calcular dropdownMenu position_x position_y verificando viewport boundaries evitando menú cortado fuera pantalla.

## 7. PROHIBICIONES

**PROHIBIDO:** Mutar properties AppConfiguration directamente sin considerar persistencia, solo isDarkMode persiste localStorage resto volatile.

**PROHIBIDO:** Establecer View.entityObject a instancia entity sin actualizar entityClass typeof correspondiente causando type mismatch.

**PROHIBIDO:** Almacenar lógica business en models interfaces, son pure data structures sin métodos excepto classes Toast EnumAdapter.

**PROHIBIDO:** Olvidar resetear modal.value dropdownMenu.value confirmationMenu.value a defaults después cerrar causando state leak próxima apertura.

**PROHIBIDO:** Crear Toast instances manualmente sin usar ApplicationUIService.pushToast helper perdiendo toast lifecycle management auto-dismiss.

**PROHIBIDO:** Usar Object.keys directamente en enums numéricos sin filtrar isNaN generando duplicate options dropdown.

**PROHIBIDO:** Cambiar View.viewType sin cambiar View.component correspondiente causando renderizado componente incorrecto para vista.

## 8. DEPENDENCIAS

**LIBRERIAS EXTERNAS:**
- vue: Ref computed reactive para reactividad
- mitt: Emitter<Events> type para eventBus typings

**ENUMS:**
- ViewTypes: LISTVIEW DETAILVIEW LOOKUPVIEW para View.viewType
- confMenuType: INFO SUCCESS WARNING ERROR para confirmationMenu.type
- ToastType: SUCCESS ERROR INFO WARNING para Toast.type

**ENTITIES:**
- BaseEntity: typeof BaseEntity para View.entityClass y Modal.modalView
- Entidades concretas: Products Customer Task implementando BaseEntity

**COMPONENTES QUE CONSUMEN:**
- DefaultDetailView: Lee View.entityObject entityClass
- DefaultListView: Lee View.entityClass
- ActionsComponent: Lee View.viewType decidiendo botones
- ConfirmationDialogComponent: Lee confirmationMenu.value renderizando modal
- ToastContainerComponent: Lee ToastList.value array v-for rendering
- DropdownMenu.vue: Lee dropdownMenu.value posicionando menú
- ListInputComponent: Recibe EnumAdapter.getKeyValuePairs() dropdown options

## 9. RELACIONES

**VIEW Y NAVIGATION:**
Application.View.value conecta router con UI, router params module oid establecen entityClass entityOid, Application.changeViewToDetailView actualiza View triggering reactivity, ActionsComponent DefaultDetailView DefaultListView todos leen View properties rendering condicionalmente, View.isValid controla SaveButton disabled state.

**MODAL Y OBJECTINPUTCOMPONENT:**
ObjectInputComponent openLookup establece modal.value.modalOnCloseFunction callback, Usuario selección ejecuta closeModalOnFunction pasando selected entity, callback actualiza ObjectInputComponent modelValue, separación estado modal evento show-modal permite modal wrapper renderizar component correcto props apropiadas.

**CONFIRMATIONMENU Y ACCIONES DESTRUCTIVAS:**
Botones destructivos Delete Discard llaman openConfirmationMenu pasando confirmationAction callback, type confMenuType.WARNING renderiza header amarillo alert visual, usuario Aceptar ejecuta callback acción destructiva, Cancelar solo cierra sin ejecutar, pattern garantiza confirmación explícita usuario acciones irreversibles.

**TOAST Y OPERACIONES ASYNC:**
SaveButton fetch API muestra loading emite show-loading, success pushToast tipo SUCCESS message positivo, error pushToast tipo ERROR message descriptivo, finally emite hide-loading, ToastItemComponent auto-dismiss 3000ms splice desde ToastList, múltiples toasts simultáneos apilados verticalmente cada ID único :key.

**ENUMADAPTER Y LISTINPUTCOMPONENT:**
Decorador @PropertyType(new EnumAdapter(Priority)) almacena metadata, DefaultDetailView detecta EnumAdapter instance pasando a ListInputComponent, component llama getKeyValuePairs() obteniendo cleaned array [{key value}], v-for option renderiza dropdown, selección actualiza entity property con value numérico matching enum, pattern permite cualquier enum TypeScript en UI sin hardcode options.

**APPLICATIONUICONTEXT Y SERVICE:**
ApplicationUIContext define contrato typings ApplicationUIService debe implementar, service constructor inicializa todas propiedades Ref matching interface structure, métodos service como pushToast openModal manipulan estas propiedades triggering reactivity, interface permite testing mocks implementing ApplicationUIContext inyectando componentes.

## 10. NOTAS DE IMPLEMENTACION

**EJEMPLO APPCONFIGURATION USAGE:**
```typescript
// Acceder configuración
const config = Application.ApplicationUIService.AppConfiguration.value;

console.log('API URL:', config.apiBaseUrl);
console.log('Environment:', config.environment);
console.log('Items per page:', config.itemsPerPage);

// Usar en axios
axios.get(`${config.apiBaseUrl}/products`, {
    timeout: config.apiTimeout,  // 30000ms
    headers: {
        'Authorization': `Bearer ${localStorage.getItem(config.authTokenKey)}`
    }
});

// Validar file size
if (file.size > config.maxFileSize) {
    throw new Error(`Archivo muy grande. Máximo ${config.maxFileSize} bytes`);
}

// Toggle dark mode
Application.ApplicationUIService.toggleDarkMode();
// Internamente: AppConfiguration.value.isDarkMode = !isDarkMode;
// localStorage.setItem('darkMode', isDarkMode.toString());
```

**EJEMPLO VIEW STATES:**
```typescript
// ListView state
Application.changeViewToListView(Products);
// Application.View.value = {
//     entityClass: Products,
//     entityObject: null,
//     component: DefaultListView,
//     viewType: ViewTypes.LISTVIEW,
//     isValid: true,
//     entityOid: ""
// };

// DetailView NEW state
const newProduct = new Products();
Application.changeViewToDetailView(newProduct);
// Application.View.value = {
//     entityClass: Products,
//     entityObject: newProduct,
//     component: DefaultDetailView,
//     viewType: ViewTypes.DETAILVIEW,
//     isValid: false,  // Required fields empty
//     entityOid: "new"
// };

// DetailView EDIT state
const existingProduct = new Products({ id: 123, name: "Laptop" });
Application.changeViewToDetailView(existingProduct);
// Application.View.value = {
//     entityClass: Products,
//     entityObject: existingProduct,
//     component: DefaultDetailView,
//     viewType: ViewTypes.DETAILVIEW,
//     isValid: true,
//     entityOid: "123"
// };

// ActionsComponent lee viewType
const ListButtons = computed(() => {
    if (Application.View.value.viewType === ViewTypes.LISTVIEW) {
        return [NewButton, RefreshButton];
    } else if (Application.View.value.viewType === ViewTypes.DETAILVIEW) {
        return [SaveButton, ValidateButton];
    }
    return [];
});
```

**EJEMPLO MODAL LOOKUP FLOW:**
```typescript
// 1. ObjectInputComponent abre lookup
function openLookup() {
    Application.ApplicationUIService.openModal({
        component: DefaultLookupListView,
        onFunction: (selectedCustomer: Customer) => {
            modelValue.value = selectedCustomer;
            emit('update:modelValue', selectedCustomer);
        }
    });
}

// 2. Service configura modal
openModal({ component, onFunction }) {
    this.modal.value = {
        modalView: component,
        modalOnCloseFunction: onFunction,
        viewType: ViewTypes.LOOKUPVIEW
    };
    this.eventBus.emit('show-modal');
}

// 3. Usuario selecciona entidad
function clickedItem(customer: Customer) {
    Application.ApplicationUIService.closeModalOnFunction(customer);
}

// 4. Service ejecuta callback y cierra
closeModalOnFunction(param: any) {
    const callback = this.modal.value.modalOnCloseFunction;
    if (callback) {
        callback(param);  // Actualiza ObjectInputComponent
    }
    this.eventBus.emit('hide-modal');
    this.modal.value = {
        modalView: null,
        modalOnCloseFunction: null,
        viewType: ViewTypes.DEFAULTVIEW
    };
}
```

**EJEMPLO CONFIRMATION DIALOG:**
```typescript
// Confirmar eliminación
Application.ApplicationUIService.openConfirmationMenu({
    type: confMenuType.WARNING,
    title: 'Eliminar producto?',
    message: 'Esta acción no se puede deshacer',
    acceptButtonText: 'Sí, eliminar',
    cancelButtonText: 'No, cancelar',
    confirmationAction: async () => {
        Application.eventBus.emit('show-loading');
        
        try {
            await product.delete();
            
            Application.ApplicationUIService.pushToast({
                type: ToastType.SUCCESS,
                title: 'Producto eliminado'
            });
            
            Application.changeViewToListView(Products);
        } catch (error) {
            Application.ApplicationUIService.pushToast({
                type: ToastType.ERROR,
                title: 'Error al eliminar',
                message: error.message
            });
        } finally {
            Application.eventBus.emit('hide-loading');
        }
    }
});

// ConfirmationDialog renderiza
<div class="confirmation-dialog">
    <div class="header" :style="{ backgroundColor: getHeaderColor }">
        <h3>{{ menu.title }}</h3>
    </div>
    <div class="body">
        <p>{{ menu.message }}</p>
    </div>
    <div class="footer">
        <button @click="handleCancel">{{ cancelButtonText }}</button>
        <button @click="handleConfirm">{{ acceptButtonText }}</button>
    </div>
</div>
```

**EJEMPLO TOAST LIFECYCLE:**
```typescript
// Crear toast
Application.ApplicationUIService.pushToast({
    type: ToastType.SUCCESS,
    title: 'Guardado exitoso',
    message: 'El producto se guardó correctamente',
    duration: 3000
});

// Internamente pushToast:
const newToast = new Toast(
    `${title}: ${message}`,  // Concatena title + message
    type
);
// newToast = { id: "x7k3md9w2", message: "...", type: ToastType.SUCCESS }

this.ToastList.value.push(newToast);

// ToastContainerComponent renderiza
<ToastItemComponent 
    v-for="toast in ToastList.value"
    :key="toast.id"
    :toast="toast"
/>

// ToastItemComponent auto-dismiss
onMounted(() => {
    setTimeout(() => {
        const index = ToastList.value.findIndex(t => t.id === props.toast.id);
        if (index !== -1) {
            ToastList.value.splice(index, 1);
        }
    }, 3000);
});
```

**EJEMPLO ENUMADAPTER:**
```typescript
// Definir enum
enum Priority {
    LOW,      // 0
    MEDIUM,   // 1
    HIGH,     // 2
    URGENT    // 3
}

// Problema reverse mapping
console.log(Object.keys(Priority));
// ["0", "1", "2", "3", "LOW", "MEDIUM", "HIGH", "URGENT"]
// ← Duplicados! No queremos "0" "1" "2" "3"

// Solución EnumAdapter
const adapter = new EnumAdapter(Priority);
const pairs = adapter.getKeyValuePairs();
console.log(pairs);
// [
//     { key: "LOW", value: 0 },
//     { key: "MEDIUM", value: 1 },
//     { key: "HIGH", value: 2 },
//     { key: "URGENT", value: 3 }
// ]

// Usar en entidad
class Task extends BaseEntity {
    @PropertyName("Prioridad")
    @PropertyType(new EnumAdapter(Priority))
    priority: Priority = Priority.MEDIUM;
}

// DefaultDetailView renderiza
<ListInputComponent
    :property-enum-values="new EnumAdapter(Priority)"
    v-model="task.priority"
/>

// ListInputComponent
const enumOptions = computed(() => {
    return props.propertyEnumValues.getKeyValuePairs();
});

<select v-model="modelValue">
    <option 
        v-for="item in enumOptions" 
        :key="item.value"
        :value="item.value">
        {{ item.key }}
    </option>
</select>

// Renderiza:
// <option value="0">LOW</option>
// <option value="1">MEDIUM</option>
// <option value="2">HIGH</option>
// <option value="3">URGENT</option>
```

**EJEMPLO DROPDOWN POSITIONING:**
```typescript
// Usuario hace click botón
function openUserMenu(event: MouseEvent) {
    const button = event.target as HTMLElement;
    const buttonRect = button.getBoundingClientRect();
    
    // Dimensiones
    const menuWidth = 250;
    const menuHeight = 300;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Posición inicial (abajo-derecha)
    let x = buttonRect.left;
    let y = buttonRect.bottom;
    
    // Ajustar si se sale derecha
    if (x + menuWidth > viewportWidth) {
        x = buttonRect.right - menuWidth;  // Alinear derecha
    }
    
    // Ajustar si se sale abajo
    if (y + menuHeight > viewportHeight) {
        y = buttonRect.top - menuHeight;  // Abrir arriba
    }
    
    Application.ApplicationUIService.dropdownMenu.value = {
        showing: true,
        title: "Opciones Usuario",
        component: UserMenuComponent,
        width: `${menuWidth}px`,
        position_x: `${x}px`,
        position_y: `${y}px`,
        activeElementWidth: `${buttonRect.width}px`,
        activeElementHeight: `${buttonRect.height}px`,
        canvasWidth: `${viewportWidth}px`,
        canvasHeight: `${viewportHeight}px`
    };
}
```

**DEBUGGING MODELS:**
```typescript
// Ver View actual
console.log('View:', Application.View.value);
// { entityClass: Products, entityObject: {...}, viewType: 2, ... }

// Ver configuración
console.log('Config:', Application.ApplicationUIService.AppConfiguration.value);

// Ver toasts activos
console.log('Toasts:', Application.ApplicationUIService.ToastList.value);
// [{ id: "x7k3md9w2", message: "...", type: 0 }]

// Ver modal state
console.log('Modal:', Application.ApplicationUIService.modal.value);

// Ver enum pairs
const adapter = new EnumAdapter(Priority);
console.log('Enum pairs:', adapter.getKeyValuePairs());
// [{ key: "LOW", value: 0 }, ...]

// Testear toast ID generation
for (let i = 0; i < 5; i++) {
    const toast = new Toast("Test", ToastType.INFO);
    console.log('Toast ID:', toast.id);
}
// x7k3md9w2
// p4n8kj2ls
// m9v2xc7qw
// ... (todos diferentes)
```

**LIMITACIONES ACTUALES:**
EnumAdapter usa any type perdiendo type safety porque debe aceptar cualquier enum, podría mejorarse con TypeScript generics pero complica decoradores. Toast class no almacena duration property, ToastItemComponent hardcodea 3000ms timeout, podría agregarse duration a constructor. Modal.customViewId definido pero no usado actualmente, reservado vistas custom futuras. DropdownMenu no soporta stack múltiples dropdowns simultáneos, solo uno abierto vez, cerrar anterior antes abrir nuevo.

## 11. REFERENCIAS CRUZADAS

**DOCUMENTOS RELACIONADOS:**
- application-singleton.md: Application.View singleton y changeViewToListView changeViewToDetailView métodos
- application-ui-service.md: ApplicationUIService implementando ApplicationUIContext con métodos pushToast openModal openConfirmationMenu
- DefaultDetailView.md: Componente lee View.entityObject entityClass renderizando formulario
- DefaultListView.md: Componente lee View.entityClass renderizando tabla
- ActionsComponent.md: Componente lee View.viewType decidiendo botones renderizar
- ObjectInputComponent.md: Componente usa Modal openModal lookup selection
- ConfirmationDialogComponent.md: Componente lee confirmationMenu.value renderizando dialog
- ToastComponents.md: ToastContainerComponent y ToastItemComponent renderizando Toast instances
- DropdownMenu.md: Componente lee dropdownMenu.value posicionando menú
- ListInputComponent.md: Componente usa EnumAdapter.getKeyValuePairs() dropdown options
- Enums.md: ViewTypes confMenuType ToastType usados en models
- router.md: Vue Router integración con View.entityOid params navegación

**UBICACION:** copilot/layers/05-advanced/Models.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
