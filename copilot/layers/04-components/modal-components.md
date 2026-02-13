# Modal Components Overview - Sistema de Componentes Modales

## 1. Propósito

Los componentes de modal proporcionan ventanas emergentes overlay para diferentes contextos de interacción usuario-sistema. ModalComponent renderiza vistas completas de entidades (ListView, DetailView, LookupView, CustomView) en contexto modal. ConfirmationDialogComponent solicita confirmación explícita para acciones críticas. LoadingPopupComponent indica procesos asíncronos activos bloqueando interacción durante operaciones.

Estos componentes se controlan centralizadamente mediante ApplicationUIService usando Event Bus, permitiendo apertura/cierre desde cualquier parte del código sin dependencias directas. Todos son componentes globales montados en App.vue disponibles simultáneamente en toda la aplicación.

## 2. Alcance

Este documento describe:
- ModalComponent para vistas de entidades en modal (ListView, DetailView, LookupView, CustomView)
- ConfirmationDialogComponent para diálogos de confirmación con 4 tipos visuales (INFO, SUCCESS, WARNING, ERROR)
- LoadingPopupComponent para indicadores de carga con spinner animado
- Control via ApplicationUIService y Event Bus
- Estructura HTML y CSS de cada componente
- Jerarquía de z-index y bloqueo de interacción
- Integración con Application.modal.value, Application.confirmationMenu.value
- Cleanup de event listeners en lifecycle hooks

Los componentes operan globalmente montados en App.vue. No se instancian directamente en vistas individuales. Se controlan exclusivamente via ApplicationUIService methods.

## 3. Definiciones Clave

**ModalComponent**: Componente modal fullscreen que renderiza dinámicamente vistas de entidades (ListView, DetailView, LookupView, CustomView) basándose en Application.modal.value.viewType y Application.modal.value.modalView.

**ConfirmationDialogComponent**: Diálogo modal centrado que solicita confirmación usuario con botones Aceptar/Cancelar, soportando 4 tipos visuales (confMenuType: INFO, SUCCESS, WARNING, ERROR) con iconos y colores diferenciados.

**LoadingPopupComponent**: Popup modal centrado con spinner animado rotatorio indicando operación asíncrona activa, bloqueando interacción hasta completar proceso.

**ApplicationUIService**: Servicio singleton que expone métodos showModal(), closeModal(), openConfirmationMenu(), showLoadingMenu(), hideLoadingMenu() para control centralizado de modales.

**Application.modal.value**: Objeto reactivo almacenando state de ModalComponent (modalView, viewType, isShowing, onCloseFunction, entityClass, etc.).

**Application.confirmationMenu.value**: Objeto reactivo almacenando state de ConfirmationDialog (type, title, message, confirmationAction, acceptButtonText, cancelButtonText).

**confMenuType Enum**: Enumeración con valores INFO (icono i, color azul), SUCCESS (icono check, color verde), WARNING (icono warning, color amarillo), ERROR (icono close, color rojo).

**Event Bus Events**: show-modal, hide-modal, show-confirmation, hide-confirmation, show-loading-menu, hide-loading-menu emitidos por ApplicationUIService y escuchados por componentes modales.

## 4. Descripción Técnica

### ModalComponent

**Archivo:** src/components/Modal/ModalComponent.vue

**Data Source:**
```typescript
{
    modalModule: typeof BaseEntity | null,
    isShowing: boolean
}
```

El componente lee Application.modal.value reactivo conteniendo modalView (clase entidad), viewType (LISTVIEW, DETAILVIEW, LOOKUPVIEW, CUSTOMVIEW), customViewId (para CUSTOMVIEW), onFunction (callback lookup), isActive (visibilidad estado).

**Computed Property modalView:**
```typescript
modalView(): Component | null {
    const viewType = Application.modal.value.viewType;
    const modalModule = this.modalModule;
    
    if (!modalModule) return null;
    
    switch(viewType) {
        case ViewTypes.LISTVIEW:
            return modalModule.getModuleListComponent();
        case ViewTypes.DETAILVIEW:
            return modalModule.getModuleDetailComponent();
        case ViewTypes.DEFAULTVIEW:
            return modalModule.getModuleDefaultComponent();
        case ViewTypes.LOOKUPVIEW:
            return default_lookup_listview;
        case ViewTypes.CUSTOMVIEW:
            const customViewId = Application.modal.value.customViewId;
            return modalModule.getModuleCustomComponents().get(customViewId);
        default:
            return null;
    }
}
```

El computed property determina qué componente Vue renderizar dinámicamente. Para LISTVIEW/DETAILVIEW/DEFAULTVIEW consulta métodos estáticos de modalModule. Para LOOKUPVIEW retorna default_lookup_listview directamente. Para CUSTOMVIEW busca en Map de custom components por customViewId.

**Estructura HTML:**
```vue
<div :class="['modal-background', { closed: !isShowing }]" @click.self="closeModal">
    <div class="modal-structure">
        <div class="modal-head">
            <img :src="modalModule?.getModuleIcon()" class="modal-icon" />
            <h2>{{ modalModule?.getModuleName() }}</h2>
            <button @click="closeModal" class="close-button">
                <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
            </button>
        </div>
        
        <div class="modal-body">
            <component :is="modalView" />
        </div>
        
        <div class="modal-footer">
            <button class="button info fill">Aceptar</button>
            <button @click="closeModal" class="button alert fill">Cerrar</button>
        </div>
    </div>
</div>
```

modal-background overlay fullscreen con event listener @click.self="closeModal" cerrando modal al hacer click fuera. modal-structure card central conteniendo head (icono + título + botón close), body (componente dinámico), footer (2 botones: Aceptar y Cerrar). El :is="modalView" renderiza componente determinado por computed property. CSS: max-width 60vw, max-height calc(60vh + 55px) maintaining responsive dimensions preventing overflow on smaller screens.

**Event Listeners:**
```typescript
mounted() {
    Application.eventBus.on('show-modal', () => {
        this.isShowing = true;
        this.modalModule = Application.modal.value.modalView;
    });
    
    Application.eventBus.on('hide-modal', () => {
        this.isShowing = false;
    });
    
    document.addEventListener('keydown', this.handleEscKey);
},

beforeUnmount() {
    Application.eventBus.off('show-modal');
    Application.eventBus.off('hide-modal');
    document.removeEventListener('keydown', this.handleEscKey);
}
```

Los listeners show-modal y hide-modal controlan isShowing. show-modal también actualiza modalModule. handleEscKey listener document keydown cierra modal al presionar ESC. Cleanup obligatorio en beforeUnmount previniendo memory leaks.

**Método closeModal:**
```typescript
methods: {
    closeModal() {
        Application.ApplicationUIService.closeModal();
    },
    
    handleEscKey(event: KeyboardEvent) {
        if (event.key === 'Escape' && this.isShowing) {
            this.closeModal();
        }
    }
}
```

closeModal delega a ApplicationUIService que emite hide-modal, espera 300ms animación, ejecuta onCloseFunction si existe, limpia Application.modal.value. handleEscKey verifica tecla Escape y estado isShowing antes de cerrar.

**CSS Classes:**
```css
.modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 1;
    transition: opacity 0.25s ease;
}

.modal-background.closed {
    opacity: 0;
    pointer-events: none;
}

.modal-structure {
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    max-width: 60vw;
    max-height: calc(60vh + 55px);
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transform: scale(1);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.modal-background.closed .modal-structure {
    max-width: 0px;
    max-height: 0px;
    transform: scale(0.9);
}
```

Animaciones entrada/salida: opacity transition 250ms background, transform scale transition 300ms cubic-bezier bounce structure. closed class cambia opacity 0 y scale 0.9 para efecto zoom-out. pointer-events: none previene interacción durante animación salida.

### ConfirmationDialogComponent

**Archivo:** src/components/Modal/ConfirmationDialogComponent.vue

**Data Source:**
```typescript
Application.confirmationMenu.value = {
    type: confMenuType,
    title: string,
    message: string,
    confirmationAction?: Function,
    acceptButtonText?: string,
    cancelButtonText?: string
}
```

**Tipos confMenuType:**
```typescript
enum confMenuType {
    INFO = 0,    // Icono: INFO, Color: var(--info-blue)
    SUCCESS = 1, // Icono: CHECK, Color: var(--success-green)
    WARNING = 2, // Icono: WARNING, Color: var(--warning-orange)
    ERROR = 3    // Icono: CLOSE, Color: var(--error-red)
}
```

**Computed Properties:**
```typescript
dialogIcon() {
    switch(this.dialogInfo.type) {
        case confMenuType.INFO:
            return GGICONS.INFO;
        case confMenuType.SUCCESS:
            return GGICONS.CHECK;
        case confMenuType.WARNING:
            return GGICONS.WARNING;
        case confMenuType.ERROR:
            return GGICONS.CLOSE;
    }
},

iconColorClass() {
    const map = {
        [confMenuType.INFO]: 'txtinfo',
        [confMenuType.SUCCESS]: 'txtsuccess',
        [confMenuType.WARNING]: 'txtwarning',
        [confMenuType.ERROR]: 'txterror'
    };
    return map[this.dialogInfo.type];
}
```

dialogIcon selecciona icono GGICONS apropiado según type. iconColorClass retorna clase CSS para color del icono y mensaje. messageColorClass análogo para texto mensaje.

**Estructura HTML:**
```vue
<div :class="['confirmation-dialog-container', { closed: !isShowing }]">
    <div class="confirmation-dialog-card">
        <div class="confirmation-dialog-header">
            <h2>{{ dialogInfo.title }}</h2>
        </div>
        
        <div class="confirmation-dialog-body">
            <div class="confirmation-dialog-center">
                <span :class="[GGCLASS, iconColorClass]" class="dialog-icon">
                    {{ dialogIcon }}
                </span>
                <p :class="messageColorClass">
                    {{ dialogInfo.message }}
                </p>
            </div>
        </div>
        
        <div class="confirmation-dialog-footer">
            <button v-if="dialogInfo.confirmationAction" 
                    class="button info fill" 
                    @click="Application.ApplicationUIService.acceptConfigurationMenu()">
                <span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
                {{ dialogInfo.acceptButtonText || 'Aceptar' }}
            </button>
            
            <button class="button alert fill" 
                    @click="Application.ApplicationUIService.closeConfirmationMenu()">
                <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
                {{ dialogInfo.cancelButtonText || 'Cancelar' }}
            </button>
        </div>
    </div>
</div>
```

Botón Aceptar renderiza condicionalmente v-if="dialogInfo.confirmationAction", solo aparece si hay callback definido. Para INFO simple sin acción, solo muestra botón Cancelar/OK. Botones invocan ApplicationUIService methods directamente, no métodos locales.

**Event Listeners:**
```typescript
mounted() {
    Application.eventBus.on('show-confirmation', () => {
        this.isShowing = true;
    });
    
    Application.eventBus.on('hide-confirmation', () => {
        this.isShowing = false;
    });
},

beforeUnmount() {
    Application.eventBus.off('show-confirmation');
    Application.eventBus.off('hide-confirmation');
}
```

**CSS Classes:**
```css
.confirmation-dialog-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1500;
    transition: opacity 0.3s ease;
}

.confirmation-dialog-card {
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    min-width: 400px;
    max-width: 600px;
    padding: 1.5rem;
}

.dialog-icon {
    font-size: 80px;
}

.txtinfo { color: var(--info-blue); }
.txtsuccess { color: var(--success-green); }
.txtwarning { color: var(--warning-orange); }
.txterror { color: var(--error-red); }
```

Z-index 1500 mayor que ModalComponent (1000), permitiendo confirmación sobre modal activo. Background rgba(0, 0, 0, 0.6) más oscuro que modal para mayor prominencia.

### LoadingPopupComponent

**Archivo:** src/components/Modal/LoadingPopupComponent.vue

**Data:**
```typescript
{
    showing: boolean
}
```

**Estructura HTML:**
```vue
<div :class="['loading-popup-component-container', { active: showing }]">
    <div class="loading-popup-component-card">
        <div class="loading-popup-component-spinner">
            <span :class="GGCLASS" class="spin-icon">
                {{ GGICONS.REFRESH }}
            </span>
        </div>
    </div>
</div>
```

Estructura minimal: container overlay, card central, spinner con icono REFRESH. No hay texto, solo animación visual. El icono REFRESH rota infinitamente con @keyframes spin.

**Event Listeners:**
```typescript
mounted() {
    Application.eventBus.on('show-loading-menu', () => {
        this.showing = true;
    });
    
    Application.eventBus.on('hide-loading-menu', () => {
        this.showing = false;
    });
},

beforeUnmount() {
    Application.eventBus.off('show-loading-menu');
    Application.eventBus.off('hide-loading-menu');
}
```

**CSS Classes y Animación:**
```css
.loading-popup-component-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
    pointer-events: none;
    opacity: 0;
    transition: 0.3s ease;
}

.loading-popup-component-container.active {
    pointer-events: all;
    opacity: 1;
}

.spin-icon {
    font-size: 120px;
    color: var(--success-green);
    animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

Z-index 1100 entre ModalComponent (1000) y ConfirmationDialog (1500). Animation spin 1.5s infinite con cubic-bezier bounce effect. Font-size 120px para spinner prominente. Color verde success indicando proceso activo.

**Delay Mínimo Pattern:**
```typescript
// Uso típico en BaseEntity.save()
Application.ApplicationUIService.showLoadingMenu();
await new Promise(resolve => setTimeout(resolve, 400)); // Delay mínimo

try {
    const response = await axios.post(endpoint, data);
    Application.ApplicationUIService.hideLoadingMenu();
} catch (error) {
    Application.ApplicationUIService.hideLoadingMenu();
}
```

Delay mínimo 400ms garantiza feedback visual perceptible evitando flashes imperceptibles en operaciones rápidas. Mejora UX dando sensación de trabajo realizado.

### Integración ApplicationUIService

**showModal:**
```typescript
showModal(modalView: typeof BaseEntity, viewType: ViewTypes) {
    Application.modal.value.modalView = modalView;
    Application.modal.value.viewType = viewType;
    Application.eventBus.emit('show-modal');
}
```

**closeModal:**
```typescript
closeModal() {
    Application.eventBus.emit('hide-modal');
    setTimeout(() => {
        Application.modal.value.modalView = null;
        if (Application.modal.value.modalOnCloseFunction) {
            Application.modal.value.modalOnCloseFunction();
            Application.modal.value.modalOnCloseFunction = null;
        }
    }, 300);
}
```

Timeout 300ms espera animación close antes limpiar state y ejecutar callback. Previene visual glitch de contenido desapareciendo antes de animación completar.

**openConfirmationMenu:**
```typescript
openConfirmationMenu(
    type: confMenuType,
    title: string,
    message: string,
    confirmationAction?: Function,
    acceptButtonText?: string,
    cancelButtonText?: string
) {
    Application.confirmationMenu.value = {
        type, title, message, confirmationAction,
        acceptButtonText, cancelButtonText
    };
    Application.eventBus.emit('show-confirmation');
}
```

**acceptConfigurationMenu:**
```typescript
acceptConfigurationMenu() {
    if (Application.confirmationMenu.value.confirmationAction) {
        Application.confirmationMenu.value.confirmationAction();
    }
    this.closeConfirmationMenu();
}
```

Ejecuta confirmationAction si existe, luego cierra diálogo. Si action es undefined (INFO simple), solo cierra.

**showLoadingMenu / hideLoadingMenu:**
```typescript
showLoadingMenu() {
    Application.eventBus.emit('show-loading-menu');
}

hideLoadingMenu() {
    Application.eventBus.emit('hide-loading-menu');
}
```

## 5. Flujo de Funcionamiento

1. **Apertura de Modal**: Código invoca Application.ApplicationUIService.showModal(entityClass, ViewTypes.DETAILVIEW). ApplicationUIService actualiza Application.modal.value con modalView = entityClass, viewType = DETAILVIEW. Emite evento show-modal via eventBus. ModalComponent listener recibe evento, ejecuta isShowing = true, actualiza modalModule = Application.modal.value.modalView.

2. **Animación Entrada Modal**: ModalComponent template reactivo detecta isShowing = true, remueve clase closed. CSS transitions activan: opacity 0 → 1 en 250ms, transform scale(0.9) → scale(1) en 300ms cubic-bezier bounce. modal-background se vuelve visible con fade-in, modal-structure hace zoom-in con bounce effect.

3. **Renderizado Dinámico Vista**: Computed property modalView evalúa Application.modal.value.viewType. Si DETAILVIEW, ejecuta modalModule.getModuleDetailComponent() retornando componente Vue (default_detailview o custom). Template <component :is="modalView" /> renderiza componente dinámicamente dentro de modal-body. El componente renderizado lee Application.View.value para entity data.

4. **Interacción Usuario en Modal**: Usuario interactúa con vista renderizada (edita campos, navega lista, selecciona lookup item). Los inputs modifican entity reactivamente con v-model. Si usuario termina, hace click Close button en modal-footer o presiona ESC key. handleEscKey listener document keydown detecta Escape, verifica isShowing = true, invoca closeModal().

5. **Cierre de Modal con Callback**: closeModal() invoca Application.ApplicationUIService.closeModal(). Service emite hide-modal event. ModalComponent listener ejecuta isShowing = false añadiendo clase closed. Animación salida: opacity 1 → 0, scale(1) → scale(0.9). setTimeout 300ms espera animación. Al expirar, limpia Application.modal.value.modalView = null. Si modalOnCloseFunction existe, ejecuta callback y lo limpia.

6. **Apertura Confirmation Dialog**: Código invoca Application.ApplicationUIService.openConfirmationMenu(confMenuType.WARNING, 'Delete?', 'Confirm deletion', deleteCallback). Service actualiza Application.confirmationMenu.value con type, title, message, confirmationAction. Emite show-confirmation event. ConfirmationDialogComponent listener ejecuta isShowing = true removiendo closed class.

7. **Renderizado Confirmation Dialog**: Template evalúa computed dialogIcon retornando GGICONS.WARNING. iconColorClass retorna 'txtwarning' aplicando color amarillo. Renderiza header con title, body con icono + mensaje amarillo, footer con dos botones. Botón Aceptar visible porque confirmationAction existe. Z-index 1500 posiciona sobre modal activo si existe.

8. **Usuario Acepta Confirmación**: Usuario hace click botón Aceptar. @click ejecuta Application.ApplicationUIService.acceptConfigurationMenu(). Método verifica Application.confirmationMenu.value.confirmationAction existe. Ejecuta confirmationAction() callback (deleteCallback). Invoca closeConfirmationMenu() emitiendo hide-confirmation. ConfirmationDialog ejecuta isShowing = false, fade-out opacity transition 300ms.

9. **Mostrar Loading durante Operación**: BaseEntity.save() invoca Application.ApplicationUIService.showLoadingMenu() antes axios.post(). Service emite show-loading-menu. LoadingPopupComponent ejecuta showing = true añadiendo active class. CSS transition opacity 0 → 1, pointer-events all bloquea interacción. @keyframes spin inicia rotación infinita icono REFRESH 120px verde. Usuario ve spinner indicando proceso activo.

10. **Ocultar Loading al Completar**: axios.post() completa exitosamente. BaseEntity.save() invoca Application.ApplicationUIService.hideLoadingMenu(). Service emite hide-loading-menu. LoadingPopupComponent ejecuta showing = false removiendo active class. Opacity transition 1 → 0, pointer-events none. Spinner desaparece con fade-out, usuario recupera interacción. Si hay error, catch block igualmente invoca hideLoadingMenu() garantizando cleanup.

## 6. Reglas Obligatorias

1. **Todos los modales DEBEN montarse en App.vue globalmente**: ModalComponent, ConfirmationDialogComponent, LoadingPopupComponent DEBEN existir como hijos directos de App.vue. No instanciar en vistas individuales. Un solo instance global por tipo opera para toda aplicación.

2. **Todos los modales DEBEN controlarse via ApplicationUIService**: No manipular Application.modal.value ni Application.confirmationMenu.value directamente. SIEMPRE usar showModal(), closeModal(), openConfirmationMenu(), showLoadingMenu(), hideLoadingMenu(). Service centraliza lógica incluyendo delays, callbacks, cleanup.

3. **Todos los event listeners DEBEN limpiarse en beforeUnmount**: Los listeners eventBus.on() DEBEN tener eventBus.off() correspondiente en beforeUnmount(). Document.addEventListener DEBE tener removeEventListener. Fallar causa memory leaks acumulando listeners duplicados en hot-reload desarrollo.

4. **closeModal DEBE esperar 300ms antes ejecutar callback**: setTimeout 300ms es obligatorio en closeModal() antes limpiar state y ejecutar onCloseFunction. Esto garantiza animación CSS complete antes contenido desaparecer. Sincronización timing animación imperativa para UX coherente.

5. **LoadingPopup DEBE incluir delay mínimo 400ms**: Operaciones asíncronas DEBEN incluir await new Promise(resolve => setTimeout(resolve, 400)) después showLoadingMenu() antes petición real. Delay garantiza feedback visual perceptible evitando flashes imperceptibles sub-400ms que confunden usuario.

6. **ConfirmationDialog botón Aceptar DEBE renderizarse condicionalmente**: v-if="dialogInfo.confirmationAction" en botón Aceptar es obligatorio. Para diálogos INFO sin acción, botón no debe aparecer. Solo mostrar Aceptar si hay callback definido ejecutable.

7. **Z-index hierarchy DEBE respetarse**: ConfirmationDialog (1500) > LoadingPopup (1100) > ModalComponent (1000). Confirmation debe estar sobre todo. Modificar z-index rompe jerarquía causando overlaps incorrectos. Z-index son valores establecidos framework-wide.

## 7. Prohibiciones

1. **NUNCA instanciar modales localmente en vistas**: No crear <ModalComponent /> en templates de vistas individuales. Los modales son globales App.vue. Instanciación local causa múltiples instances conflictivas con state inconsistente.

2. **NUNCA manipular Application.modal.value directamente**: No ejecutar Application.modal.value.modalView = entity desde código externo. SIEMPRE usar ApplicationUIService.showModal(). Service maneja state updates, event emission, validación correctamente.

3. **NUNCA omitir hideLoadingMenu() en catch blocks**: Todo showLoadingMenu() DEBE tener hideLoadingMenu() correspondiente en finally o catch. Omitir en error path causa loading permanente bloqueando UI indefinidamente. Usuario no puede recuperar interacción.

4. **NUNCA usar v-if para ocultar modales, usar clases CSS**: Los modales usan opacity transitions y pointer-events none, no v-if toggling. v-if desmonta/remonta component quebrando animaciones y event listeners. Usar isShowing boolean con clase closed aplicando opacity 0.

5. **NUNCA modificar z-index de modales inline**: No aplicar :style="{ zIndex: newValue }" a modales. Z-index son constantes framework (1000, 1100, 1500). Modificar causa overlaps impredecibles. Si necesitas modal sobre confirmación, revisar diseño workflow.

6. **NUNCA ejecutar código síncrono pesado en confirmationAction**: El callback confirmationAction ejecuta en main thread bloqueante. No ejecutar loops largos, operaciones síncronas pesadas. Para operaciones asíncronas, usar async/await con showLoadingMenu() dentro callback.

7. **NUNCA asumir que modal persiste después closeModal**: Después closeModal(), Application.modal.value.modalView se limpia a null. No intentar acceder componente renderizado, datos temporales modal, o state después cierre. Modal state es transitorio destruído al cerrar.

## 8. Dependencias

**Dependencias Directas:**
- @/constants/application.ts: Application singleton exporta modal.value, confirmationMenu.value, eventBus para state management y eventos
- @/services/ui_services.ts: ApplicationUIService implementa showModal(), closeModal(), openConfirmationMenu(), acceptConfigurationMenu(), showLoadingMenu(), hideLoadingMenu()
- @/enums/view_type.ts: ViewTypes enum (LISTVIEW, DETAILVIEW, LOOKUPVIEW, CUSTOMVIEW) define tipos vistas modales
- @/enums/conf_menu_type.ts: confMenuType enum (INFO, SUCCESS, WARNING, ERROR) define tipos confirmation dialog
- @/constants/ggicons.ts: GGICONS objeto con iconos (INFO, CHECK, WARNING, CLOSE, REFRESH) para UI visual
- @/views/default_lookup_listview.vue: Vista default para LOOKUPVIEW renderizada en modal para selección entidad
- @/entities/base_entitiy.ts: BaseEntity proporciona getModuleName(), getModuleIcon(), getModuleListComponent(), getModuleDetailComponent() para metadata modal
- Vue 3 Reactivity: computed properties, reactive Application objects, component :is dynamic rendering

**Dependencias de CSS:**
- @/css/constants.css: Variables --white, --border-radius, --shadow-dark, --shadow-light, --info-blue, --success-green, --warning-orange, --error-red
- @/css/main.css: Estilos globales buttons (.button.info, .button.alert), transitions, animations

**Dependencias de Lifecycle:**
- Event Bus: eventBus.on() en mounted(), eventBus.off() en beforeUnmount() para event-driven architecture
- Document Events: document.addEventListener('keydown') en ModalComponent para ESC key handling

## 9. Relaciones

**Utilizado por:**
- Todas las vistas y componentes: Cualquier código puede invocar ApplicationUIService methods para mostrar modales. DefaultListView, DefaultDetailView, SaveButton, DeleteButton, ObjectInputComponent todos usan modales.

**Renderiza dinámicamente:**
- Vistas de Entidades: ModalComponent renderiza default_listview, default_detailview, default_lookup_listview, o custom views según viewType. El componente específico se determina runtime.

**Sincroniza con:**
- ApplicationUIService: Service actualiza Application.modal.value y Application.confirmationMenu.value. Componentes modales leen state reactivo y responden a eventos emitidos por service.
- Event Bus: ApplicationUIService emite eventos (show-modal, hide-modal, show-confirmation, hide-confirmation, show-loading-menu, hide-loading-menu). Componentes modales escuchan eventos ejecutando state changes.

**Interactúa con:**
- ObjectInputComponent: Abre ModalComponent con LOOKUPVIEW para selección entidad. Modal cierra pasando entidad seleccionada via onFunction callback.
- SaveButton: Invoca showLoadingMenu() antes entity.save(), hideLoadingMenu() después completar. Muestra confirmationMenu ERROR si falla guardado.
- DeleteButton: Abre confirmationMenu WARNING antes confirmar eliminación. Si usuario acepta, ejecuta entity.delete() con loadingMenu.

**Bloquea interacción:**
- Toda UI: Mientras modal activo, overlay rgba background bloquea clicks elementos subyacentes. LoadingPopup pointer-events: all previene interacción durante operaciones. ConfirmationDialog requiere decisión usuario antes continuar.

## 10. Notas de Implementación

### Abrir Modal con Vista Personalizada

```typescript
// Abrir modal con custom detail view de Products
Application.ApplicationUIService.showModal(Products, ViewTypes.CUSTOMVIEW);
Application.modal.value.customViewId = 'custom-product-editor';

// Products debe tener custom view registrada:
@ModuleCustomComponents(new Map([
    ['custom-product-editor', CustomProductEditorComponent]
]))
export class Products extends BaseEntity { }
```

### Confirmation Dialog con Operación Asíncrona

```typescript
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,
    'Delete Selected Items',
    'This will delete 15 items permanently. Continue?',
    async () => {
        // Callback asíncrono con loading
        Application.ApplicationUIService.showLoadingMenu();
        
        try {
            await Promise.all(selectedItems.map(item => item.delete()));
            Application.ApplicationUIService.hideLoadingMenu();
            Application.ApplicationUIService.showToast('Items deleted', ToastType.SUCCESS);
        } catch (error) {
            Application.ApplicationUIService.hideLoadingMenu();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Delete Failed',
                'Some items could not be deleted.'
            );
        }
    },
    'Delete All',
    'Cancel'
);
```

### Lookup Modal con Filtrado

```typescript
// Abrir lookup para seleccionar Customer con filtro activo
Application.ApplicationUIService.openModalOnFunction(
    Customer,
    ViewTypes.LOOKUPVIEW,
    (selectedCustomer: Customer) => {
        // Callback recibe customer seleccionado
        this.order.customer = selectedCustomer;
        this.$emit('update:modelValue', this.order);
    }
);

// Aplicar filtro antes abrir modal:
Application.View.value.filter = { country: 'USA', active: true };
```

### Loading Menu con Retry Logic

```typescript
async function saveWithRetry(entity: BaseEntity, maxRetries: number = 3) {
    Application.ApplicationUIService.showLoadingMenu();
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await entity.save();
            Application.ApplicationUIService.hideLoadingMenu();
            Application.ApplicationUIService.showToast('Saved successfully', ToastType.SUCCESS);
            return;
        } catch (error) {
            if (attempt === maxRetries) {
                Application.ApplicationUIService.hideLoadingMenu();
                Application.ApplicationUIService.openConfirmationMenu(
                    confMenuType.ERROR,
                    'Save Failed',
                    `Failed after ${maxRetries} attempts. Try again?`,
                    () => saveWithRetry(entity, maxRetries)
                );
                return;
            }
            // Retry automático sin cerrar loading
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}
```

### Custom Modal Animation Duration

Si necesitas cambiar duración animación (no recomendado):

```css
/* En styles scoped del componente wrapper */
.modal-background {
    transition: opacity 0.5s ease !important; /* Default: 0.25s */
}

.modal-structure {
    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) !important; /* Default: 0.3s */
}
```

Importante: Modificar duración requiere actualizar setTimeout en closeModal() para matchear nueva duración.

### Debugging Modal State

```javascript
// Ver state actual de modales
console.log('Modal state:', Application.modal.value);
console.log('Confirmation state:', Application.confirmationMenu.value);

// Verificar event listeners registrados
Application.eventBus._events['show-modal'];  // Array de listeners

// Forzar cierre todos modales
Application.ApplicationUIService.closeModal();
Application.ApplicationUIService.closeConfirmationMenu();
Application.ApplicationUIService.hideLoadingMenu();

// Simular apertura modal programáticamente
Application.ApplicationUIService.showModal(Products, ViewTypes.LISTVIEW);
```

### Testing Modal Components

```typescript
import { mount } from '@vue/test-utils';
import ModalComponent from '@/components/Modal/ModalComponent.vue';
import { Application } from '@/constants/application';

describe('ModalComponent', () => {
    it('should show modal on show-modal event', async () => {
        const wrapper = mount(ModalComponent);
        
        Application.modal.value.modalView = Products;
        Application.eventBus.emit('show-modal');
        
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.isShowing).toBe(true);
        expect(wrapper.find('.modal-background').classes()).not.toContain('closed');
    });
    
    it('should close modal on ESC key', async () => {
        const wrapper = mount(ModalComponent);
        wrapper.vm.isShowing = true;
        
        const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escEvent);
        
        await wrapper.vm.$nextTick();
        // Verificar que closeModal fue invocado
    });
});
```

## 11. Referencias Cruzadas

**Documentos Relacionados:**
- [DialogComponents.md](DialogComponents.md): Documentación detallada ConfirmationDialog y LoadingPopup components
- [core-components.md](core-components.md): Componentes core framework incluyendo estructura general
- ../../03-application/ui-services.md: ApplicationUIService methods completos (showModal, closeModal, openConfirmationMenu, etc.)
- ../../03-application/event-bus.md: Event Bus architecture y eventos disponibles framework
- ../../03-application/application-state.md: Application.modal.value y Application.confirmationMenu.value state structures
- ../../05-advanced/Enums.md: ViewTypes enum y confMenuType enum definiciones completas
- ../views/default-listview.md: Vista renderizada en modal para LISTVIEW
- ../views/default-detailview.md: Vista renderizada en modal para DETAILVIEW
- ../views/default-lookup-listview.md: Vista renderizada en modal para LOOKUPVIEW
- [LookupItem.md](LookupItem.md): Componente item individual dentro lookup modal
- [object-input-component.md](object-input-component.md): Input que dispara apertura lookup modal
- [ToastComponents.md](ToastComponents.md): Sistema toast notifications complementario a modales
