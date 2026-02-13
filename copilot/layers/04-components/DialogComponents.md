# Dialog Components - Componentes de Diálogo

## 1. Propósito

DialogComponents comprende ConfirmationDialogComponent y LoadingPopupComponent que proporcionan interfaces modales especializadas para confirmaciones usuario y feedback visual de operaciones asíncronas. ConfirmationDialogComponent solicita aprobación explícita acciones críticas (eliminar datos, descartar cambios, operaciones irreversibles) con 4 variantes visuales diferenciadas. LoadingPopupComponent indica procesos activos bloqueando interacción durante peticiones HTTP, cálculos pesados, operaciones que requieren espera usuario.

Ambos componentes operan como overlays fullscreen z-indexed sobre contenido principal, controlados centralizadamente via ApplicationUIService Event Bus. No se instancian directamente, existen como singletons globales montados App.vue disponibles framework-wide.

## 2. Alcance

Este documento describe:
- ConfirmationDialogComponent estructura, estilos, tipos visuales (INFO, SUCCESS, WARNING, ERROR)
- LoadingPopupComponent estructura, spinner animation, timing delays
- Control via ApplicationUIService methods (openConfirmationMenu, acceptConfigurationMenu, closeConfirmationMenu, showLoadingMenu, hideLoadingMenu)
- Integración con Application.confirmationMenu.value state reactivo
- Event Bus listeners y lifecycle hooks cleanup
- Z-index hierarchy posicionamiento relativo otros modales
- Botones condicionales renderizado (Aceptar solo si confirmationAction existe)
- Animations CSS transitions timing delays

Los componentes operan exclusivamente como UI global no reutilizable localmente. No aceptan props, leen state central Application.confirmationMenu.value y showing boolean local.

## 3. Definiciones Clave

**ConfirmationDialogComponent**: Diálogo modal centrado que renderiza título, mensaje, icono coloreado, botones Aceptar/Cancelar para confirmar/abortar acciones críticas. Soporta 4 tipos visuales diferenciados por iconos y colores.

**LoadingPopupComponent**: Popup modal centrado con spinner icono rotatorio animado indicando operación asíncrona activa. Bloquea interacción usuario mediante overlay hasta completar proceso.

**confMenuType Enum**: Enumeración definiendo 4 tipos visuales confirmation dialog: INFO (icono i, azul, informativo), SUCCESS (icono check, verde, completado), WARNING (icono warning, amarillo, precaución), ERROR (icono close, rojo, falla).

**confirmationAction Callback**: Función opcional ejecutada cuando usuario hace click botón Aceptar. Si undefined, botón Aceptar no renderiza mostrando solo botón OK/Cancelar.

**Delay Mínimo Pattern**: Timeout mínimo 400ms aplicado operaciones asíncronas garantizando feedback visual perceptible, evitando flashes imperceptibles sub-400ms que confunden usuario.

**Application.confirmationMenu.value**: Objeto reactivo almacenando state ConfirmationDialog (type, title, message, confirmationAction, acceptButtonText, cancelButtonText).

**showing Boolean**: Data property local LoadingPopupComponent controlando visibilidad popup via clase CSS active toggleando opacity y pointer-events.

**acceptConfigurationMenu Method**: ApplicationUIService method ejecutando confirmationAction callback si existe, luego cerrando dialog vía closeConfirmationMenu().

## 4. Descripción Técnica

### ConfirmationDialogComponent

**Archivo:** src/components/Modal/ConfirmationDialogComponent.vue

**Data:**
```typescript
{
    Application: ApplicationClass,
    isShowing: boolean,
    GGCLASS: string,
    GGICONS: object,
    confMenuType: enum
}
```

isShowing controla visibilidad dialog toggleando clase closed. GGCLASS y GGICONS proporcionan iconos visual. confMenuType enum accesible template para comparaciones type.

**Computed Property dialogInfo:**
```typescript
dialogInfo() {
    return Application.confirmationMenu.value;
}
```

Alias reactivo a Application.confirmationMenu.value simplificando acceso template. Cambios confirmationMenu.value reactivamente actualizan template.

**Computed Property dialogIcon:**
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
}
```

Mapea confMenuType a icono GGICONS apropiado. INFO muestra i circular, SUCCESS check mark, WARNING triángulo exclamación, ERROR X close.

**Computed Property iconColorClass:**
```typescript
iconColorClass() {
    const colorMap = {
        [confMenuType.INFO]: 'txtinfo',
        [confMenuType.SUCCESS]: 'txtsuccess',
        [confMenuType.WARNING]: 'txtwarning',
        [confMenuType.ERROR]: 'txterror'
    };
    return colorMap[this.dialogInfo.type];
}
```

Retorna clase CSS color apropiada. txtinfo azul, txtsuccess verde, txtwarning amarillo, txterror rojo. Aplica tanto icono como mensaje texto.

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
                <p :class="iconColorClass">
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

Container overlay fullscreen con card centrada. Header renderiza título bold. Body renderiza icono grande (80px) coloreado + mensaje párrafo mismo color. Footer renderiza botones.

Botón Aceptar condicional v-if="dialogInfo.confirmationAction" solo aparece si hay callback. Para INFO simple sin acción, solo botón Cancelar visible funcionando como OK.

Botones invocan ApplicationUIService methods directamente sin métodos locales intermedios. acceptConfigurationMenu() ejecuta callback cierra dialog. closeConfirmationMenu() solo cierra sin ejecutar callback.

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

Listeners show-confirmation y hide-confirmation controlan isShowing toggleando visibilidad. Cleanup beforeUnmount obligatorio previniendo memory leaks.

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

.confirmation-dialog-container.closed {
    opacity: 0;
    pointer-events: none;
}

.confirmation-dialog-card {
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    min-width: 400px;
    max-width: 600px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
}

.dialog-icon {
    font-size: 80px;
    margin-bottom: 1rem;
}

.txtinfo { color: var(--info-blue); }
.txtsuccess { color: var(--success-green); }
.txtwarning { color: var(--warning-orange); }
.txterror { color: var(--error-red); }
```

Z-index 1500 máxima prioridad posicionando sobre ModalComponent (1000) y LoadingPopup (1100). Background rgba(0, 0, 0, 0.6) más oscuro que modal regular mayor prominencia. Transition opacity 0.3s ease fade-in/fade-out.

Card min-width 400px garantiza layout mínimo, max-width 600px previene expansion excesiva. Padding 1.5rem espaciado interno generoso. Flex column layout vertical stacking header/body/footer.

### LoadingPopupComponent

**Archivo:** src/components/Modal/LoadingPopupComponent.vue

**Data:**
```typescript
{
    showing: boolean,
    GGCLASS: string,
    GGICONS: object,
    Application: ApplicationClass
}
```

showing controla visibilidad popup toggleando clase active. GGCLASS y GGICONS proporcionan icono REFRESH spinner.

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

Estructura minimal: container overlay, card central, spinner con icono REFRESH. No texto, solo animación visual. Simplicidad indica proceso activo sin detalles innecesarios.

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

.loading-popup-component-card {
    background-color: var(--white);
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 400px;
    height: 150px;
    transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    transform: scale(0.01);
}

.loading-popup-component-container.active .loading-popup-component-card {
    transform: scale(1);
}

.spin-icon {
    font-size: 120px;
    font-weight: bold;
    color: var(--success-green);
    animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

Z-index 1100 entre ModalComponent (1000) y ConfirmationDialog (1500). Estadoinactive: pointer-events none, opacity 0 invisible sin bloquear interacción. Estado active: pointer-events all bloquea clicks, opacity 1 visible.

Card animación entrada: transform scale(0.01) → scale(1) bounce effect 300ms cubic-bezier. Card transform scale inicial extremadamente pequeño creates dramatic zoom-in effect.

Spinner animation: @keyframes spin 360deg rotation 1.5s infinite loop. Cubic-bezier(0.68, -0.55, 0.265, 1.55) bounce timing function creates elastic rotation effect. Font-size 120px prominente, color verde success indicating active process.

### Uso PatternDelay Mínimo

**BaseEntity.save() ejemplo:**
```typescript
public async save(): Promise<this> {
    // Validaciones...
    
    Application.ApplicationUIService.showLoadingMenu();
    await new Promise(resolve => setTimeout(resolve, 400)); // Delay mínimo
    
    try {
        const response = await axios.post(endpoint, this.toJson());
        Application.ApplicationUIService.hideLoadingMenu();
        Application.ApplicationUIService.showToast('Saved successfully', ToastType.SUCCESS);
        return this;
    } catch (error) {
        Application.ApplicationUIService.hideLoadingMenu();
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Save Failed',
            'Could not save entity'
        );
        throw error;
    }
}
```

Timeout 400ms después showLoadingMenu() garantiza spinner visible tiempo mínimo. Operaciones rápidas <400ms aún muestran loading briefly improving perceived responsiveness. Sin delay, operaciones instantáneas causan flash imperceptible confundiendo usuario.

Finally block alternativa usa hideLoadingMenu() garantizando cleanup si success o error.

## 5. Flujo de Funcionamiento

1. **Apertura Confirmation Dialog**: Código invoca Application.ApplicationUIService.openConfirmationMenu(confMenuType.WARNING, 'Delete Item', 'Confirm deletion?', deleteCallback, 'Delete', 'Cancel'). ApplicationUIService actualiza Application.confirmationMenu.value con type = WARNING, title, message, confirmationAction = deleteCallback, button texts. Emite evento show-confirmation via eventBus.

2. **Renderizado Confirmation Dialog**: ConfirmationDialogComponent listener recibe show-confirmation, ejecuta isShowing = true removiendo clase closed. CSS transition opacity 0 → 1 en 300ms fade-in. Computed dialogInfo retorna confirmationMenu.value. Computed dialogIcon retorna GGICONS.WARNING. Computed iconColorClass retorna 'txtwarning'. Template renderiza título, icon amarillo 80px triángulo, mensaje amarillo, botones Aceptar y Cancelar.

3. **Usuario Revisa Dialog**: Usuario lee título "Delete Item" y mensaje "Confirm deletion?" visualizando icono warning amarillo indicando precaución. Evalúa acción decidiendo proceder o abortar. Botón Aceptar visible porque confirmationAction existe. Textos botones personalizados "Delete" y "Cancel" más específicos que defaults.

4. **Usuario Hace Click Aceptar**: Usuario hace click botón Aceptar. @click ejecuta Application.ApplicationUIService.acceptConfigurationMenu() directamente. ApplicationUIService verifica Application.confirmationMenu.value.confirmationAction exists (true). Ejecuta confirmationAction() callback (deleteCallback) síncronamente. Invoca closeConfirmationMenu() emitiendo hide-confirmation event. ConfirmationDialog ejecuta isShowing = false añadiendo clase closed, opacity 1 → 0 fade-out 300ms.

5. **Usuario Hace Click Cancelar Alternativo**: Usuario hace click botón Cancelar. @click ejecuta Application.ApplicationUIService.closeConfirmationMenu() directamente. Service emite hide-confirmation sin ejecutar confirmationAction. ConfirmationDialog ejecuta isShowing = false fade-out. Acción cancelada, deleteCallback nunca ejecuta, item no se elimina.

6. **Mostrar Loading Operación**: BaseEntity.save() invoca Application.ApplicationUIService.showLoadingMenu() antes axios request. Service emite show-loading-menu event. LoadingPopupComponent listener recibe evento, ejecuta showing = true añadiendo clase active. CSS transitions: opacity 0 → 1, transform scale(0.01) → scale(1) card zoom-in bounce 300ms. pointer-events: all bloquea interacción usuario. @keyframes spin animation inicia rotación icono REFRESH 120px verde infinita 1.5s loops.

7. **Delay Mínimo Garantía**: BaseEntity.save() ejecuta await new Promise(resolve => setTimeout(resolve, 400)) delay 400ms artificial después showLoadingMenu(). Garantiza loading visible mínimo 400ms aunque axios.post() complete instantáneamente. Mejora UX dando sensación proceso meaningful ejecutado evitando flash imperceptible confuso.

8. **Completar Operación Exitosamente**: axios.post() completa successfully retornando response. BaseEntity.save() invoca Application.ApplicationUIService.hideLoadingMenu(). Service emite hide-loading-menu event. LoadingPopupComponent listener ejecuta showing = false removiendo clase active. CSS transitions: opacity 1 → 0, transform scale(1) → scale(0.01) card zoom-out 300ms. pointer-events: none libera interacción. Spinner desaparece, usuario recupera control UI. Toast SUCCESS "Saved successfully" aparece notificando completion.

9. **Completar Operación con Error**: axios.post() lanza exception catch block captura error. BaseEntity.save() catch block invoca Application.ApplicationUIService.hideLoadingMenu() garantizando cleanup. hideLoadingMenu() emite hide-loading-menu fade-out loading. ApplicationUIService.openConfirmationMenu(confMenuType.ERROR, 'Save Failed', 'Could not save entity') abre error dialog. ConfirmationDialog renderiza icono close rojo, mensaje rojo, solo botón OK (no confirmationAction). Usuario acknowledges error haciendo click OK.

10. **Cleanup Dialog al Desmontar**: Si App.vue hot-reload desarrollo o navegación router desmonta ConfirmationDialog, beforeUnmount() hook ejecuta. Application.eventBus.off('show-confirmation') y Application.eventBus.off('hide-confirmation') remueven listeners registrados. Previene memory leaks acumulando listeners duplicados. LoadingPopup análogo limpia show-loading-menu y hide-loading-menu listeners. Proper cleanup esencial estabilidad long-running app development.

## 6. Reglas Obligatorias

1. **ConfirmationDialog botón Aceptar DEBE renderizarse solo si confirmationAction existe**: v-if="dialogInfo.confirmationAction" en botón Aceptar es obligatorio. Dialog INFO sin callback debe mostrar solo botón OK/Cancelar. Renderizar botón Aceptar sin callback causa click sin efecto confundiendo usuario.

2. **LoadingPopup DEBE incluir delay mínimo 400ms operaciones asíncronas**: Código invocando showLoadingMenu() DEBE ejecutar await new Promise(resolve => setTimeout(resolve, 400)) después showLoadingMenu() antes operación real. Garantiza feedback visual perceptible mínimo 400ms. Omitir delay causa flashes imperceptibles <100ms molestos.

3. **hideLoadingMenu DEBE invocarse en finally o catch blocks**: Todo showLoadingMenu() DEBE tener hideLoadingMenu() correspondiente finally {} o catch {}. Omitir en error path causa loading permanente bloqueando UI indefinidamente. Usuario no puede recuperar interacción sin refresh página.

4. **Todos event listeners DEBEN limpiarse beforeUnmount**: eventBus.on() DEBE tener eventBus.off() correspondiente beforeUnmount(). Omitir cleanup causa memory leaks acumulando listeners duplicados hot-reload desarrollo. Múltiples listeners duplicados causan comportamiento impredecible.

5. **Botones dialog DEBEN invocar ApplicationUIService methods directamente**: @click="Application.ApplicationUIService.acceptConfigurationMenu()" patrón obligatorio. No crear métodos locales intermedios wrapping service calls. Directness simplifica debugging y garantiza service logic centralizado ejecuta.

6. **Z-index hierarchy DEBE respetarse inmutable**: ConfirmationDialog (1500) > LoadingPopup (1100). No modificar z-index inline via :style. Valores son constantes framework-wide. Modificar rompe jerarquía causando overlaps incorrectos dialog bajo loading.

7. **confMenuType DEBE usarse para todos dialogs confirmación**: No crear custom dialog types omitiendo enum. Usar INFO, SUCCESS, WARNING, ERROR únicamente. Consistency visual UX framework-wide requiere adherencia strict 4 tipos definidos.

## 7. Prohibiciones

1. **NUNCA omitir hideLoadingMenu en catch blocks**: Todo try { showLoadingMenu(); ... } DEBE tener catch { hideLoadingMenu(); } o finally { hideLoadingMenu(); }. Omitir causa loading overlay permanente bloqueando UI. Usuario queda stuck sin manera cerrar loading salvo refresh forzado navegador.

2. **NUNCA ejecutar código síncrono bloqueante en confirmationAction**: Callback confirmationAction ejecuta main thread síncronamente. No ejecutar loops largos, operaciones CPU-intensive sin async/await. Causa UI freeze durante callback. Para operaciones pesadas, usar async callback con showLoadingMenu() dentro.

3. **NUNCA modificar Application.confirmationMenu.value manualmente**: No ejecutar Application.confirmationMenu.value = { ... } desde código externo. SIEMPRE usar ApplicationUIService.openConfirmationMenu(). Service maneja state updates, event emission, validation correctamente consistentemente.

4. **NUNCA usar v-if togglear visibilidad dialogs**: ConfirmationDialog y LoadingPopup usan clase closed con opacity transitions, no v-if. v-if desmonta/remonta component quebrando animations, event listeners. Usar isShowing/showing boolean con closed/active class aplicando opacity 0 pointer-events none.

5. **NUNCA instanciar dialogs localmente vistas**: No crear <ConfirmationDialogComponent /> o <LoadingPopupComponent /> en templates individuales. Son globales singleton App.vue. Instanciación local causa múltiples instances conflictivas state inconsistente events duplicados.

6. **NUNCA asumir confirmationAction callback es async aware**: Aunque callback puede ser async function, acceptConfigurationMenu() NO espera Promise returned. Si callback retorna Promise, dialogs cierra inmediatamente sin esperar. Para operaciones async, usar showLoadingMenu() dentro callback explícitamente.

7. **NUNCA modificar duración animations sin actualizar timeouts**: Si cambia .confirmation-dialog-container { transition: 0.5s; }, ApplicationUIService closeConfirmationMenu() timeout DEBE actualizarse matchear. Mismatches causan state limpieza prematura antes animación complete o delays innecesarios.

## 8. Dependencias

**Dependencias Directas:**
- @/constants/application.ts: Application singleton exporta confirmationMenu.value, eventBus para state management y eventos
- @/services/ui_services.ts: ApplicationUIService implementa openConfirmationMenu(), acceptConfigurationMenu(), closeConfirmationMenu(), showLoadingMenu(), hideLoadingMenu()
- @/enums/conf_menu_type.ts: confMenuType enum (INFO, SUCCESS, WARNING, ERROR) define tipos visuales dialog
- @/constants/ggicons.ts: GGICONS objeto con iconos (INFO, CHECK, WARNING, CLOSE, REFRESH) para visual indicators
- Vue 3 Reactivity: ref, computed properties, reactive Application objects

**Dependencias CSS:**
- @/css/constants.css: Variables --white, --border-radius, --shadow-dark, --info-blue, --success-green, --warning-orange, --error-red
- @/css/main.css: Estilos globales buttons (.button.info, .button.alert), transitions, pointer-events

**Dependencias Lifecycle:**
- Event Bus: eventBus.on() mounted(), eventBus.off() beforeUnmount() event-driven architecture

## 9. Relaciones

**Utilizado por:**
- BaseEntity CRUD Methods: save(), delete(), load() invocan showLoadingMenu()/hideLoadingMenu() durante async operations. openConfirmationMenu() ERROR al fallar operaciones.
- DeleteButton: Abre confirmationMenu WARNING antes eliminar confirmación usuario. Si acepta, ejecuta entity.delete() con loadingMenu.
- Application.changeView: Abre confirmationMenu WARNING si entity.getDirtyState() true (cambios sin guardar) antes cambiar vista discard changes.
- Cualquier código: Framework-wide cualquier componente puede invocar ApplicationUIService dialogs globally disponible.

**Sincroniza con:**
- ApplicationUIService: Service actualiza Application.confirmationMenu.value, emite eventos show-confirmation, hide-confirmation, show-loading-menu, hide-loading-menu. Components escuchan eventos reactivamente.
- Event Bus: ApplicationUIService emite, ConfirmationDialog/LoadingPopup escuchan, architecture event-driven desacoplado.

**Interactúa con:**
- ToastComponent: Después operations complete con success, toast SUCCESS notifica usuario. Después error, confirmationMenu ERROR + toast opcional combined feedback.
  
**Bloquea interacción:**
- Toda UI: ConfirmationDialog z-index 1500 overlay bloquea clicks, requiere decisión usuario. LoadingPopup pointer-events: all bloquea interacción durante operaciones. Usuarios no pueden interactuar hasta dialog resolve o loading complete.

## 10. Notas de Implementación

### Confirmation Dialog Async Callback con Loading

```typescript
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.WARNING,
    'Delete All Items',
    'This will permanently delete all selected items. Continue?',
    async () => {
        // Async callback con loading interno
        Application.ApplicationUIService.showLoadingMenu();
        
        try {
            await Promise.all(selectedItems.map(item => item.delete()));
            Application.ApplicationUIService.hideLoadingMenu();
            Application.ApplicationUIService.showToast('All items deleted', ToastType.SUCCESS);
        } catch (error) {
            Application.ApplicationUIService.hideLoadingMenu();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Deletion Failed',
                'Some items could not be deleted.'
            );
        }
    },
    'Delete All',
    'Cancel'
);
```

Callback async invoca showLoadingMenu() internamente mostrando loading durante delete operations. hideLoadingMenu() en try/catch garantiza cleanup. Error muestra nested confirmationMenu ERROR sobre warning original.

### INFO Dialog Simple Sin Acción

```typescript
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.INFO,
    'Feature Coming Soon',
    'This feature will be available in version 2.0.',
    undefined,  // Sin confirmationAction
    'OK'  // Solo un botón
);
```

confirmationAction = undefined causa v-if botón Aceptar false rendering solo "OK" button functioning como Cancelar close. INFO azul indicando mensaje informativo no-crítico sin acción requerida.

### Loading con Retry Logic

```typescript
async function saveWithRetry(entity: BaseEntity, retries: number = 3): Promise<void> {
    Application.ApplicationUIService.showLoadingMenu();
    await new Promise(resolve => setTimeout(resolve, 400));
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await entity.save();
            Application.ApplicationUIService.hideLoadingMenu();
            Application.ApplicationUIService.showToast('Saved successfully', ToastType.SUCCESS);
            return;
        } catch (error) {
            if (attempt === retries) {
                // Último intento falló
                Application.ApplicationUIService.hideLoadingMenu();
                Application.ApplicationUIService.openConfirmationMenu(
                    confMenuType.ERROR,
                    'Save Failed',
                    `Failed after ${retries} attempts. Retry again?`,
                    () => saveWithRetry(entity, retries),  // Callback recursive retry
                    'Retry',
                    'Cancel'
                );
                return;
            }
            // Retry silencioso sin cerrar loading
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}
```

Retry logic mantiene loading visible durante intentos múltiples. Solo hideLoadingMenu() al success final o después retries exhausted. Error dialog ofrece retry manual via callback recursive.

### Custom Icon Colors Extended

Si necesitas color custom (no recomendado):

```vue
<!-- En template ConfirmationDialogComponent -->
<span :class="[GGCLASS, iconColorClass, customColorClass]" class="dialog-icon">

<script>
computed: {
    customColorClass() {
        if (this.dialogInfo.customColor) {
            return this.dialogInfo.customColor;
        }
        return '';
    }
}
</script>

<style scoped>
.txt-custom-purple { color: #9333ea; }
</style>
```

Requiere extender Application.confirmationMenu.value interface añadiendo customColor?: string. No recomendado, breaks framework consistency.

### Debugging Dialog State

```javascript
// Ver confirmation state actual
console.log('Confirmation:', Application.confirmationMenu.value);

// Ver loading state actual
const loadingComponent = app.$children.find(c => c.$options.name === 'LoadingPopupComponent');
console.log('Loading showing:', loadingComponent?.showing);

// Forzar cierre dialog/loading emergency
Application.eventBus.emit('hide-confirmation');
Application.eventBus.emit('hide-loading-menu');

// Simular confirmation INFO test
Application.ApplicationUIService.openConfirmationMenu(
    confMenuType.INFO,
    'Test Dialog',
    'This is a test message.',
    () => console.log('Confirmed!')
);
```

### Testing Confirmation Callbacks

```typescript
import { mount } from '@vue/test-utils';
import ConfirmationDialogComponent from '@/components/Modal/ConfirmationDialogComponent.vue';
import { Application } from '@/constants/application';
import { confMenuType } from '@/enums/conf_menu_type';

describe('ConfirmationDialogComponent', () => {
    it('should execute confirmationAction on Accept click', async () => {
        const mockCallback = jest.fn();
        const wrapper = mount(ConfirmationDialogComponent);
        
        Application.confirmationMenu.value = {
            type: confMenuType.INFO,
            title: 'Test',
            message: 'Test message',
            confirmationAction: mockCallback
        };
        wrapper.vm.isShowing = true;
        await wrapper.vm.$nextTick();
        
        const acceptButton = wrapper.find('.button.info');
        await acceptButton.trigger('click');
        
        expect(mockCallback).toHaveBeenCalled();
    });
    
    it('should not render Accept button if no confirmationAction', async () => {
        const wrapper = mount(ConfirmationDialogComponent);
        
        Application.confirmationMenu.value = {
            type: confMenuType.INFO,
            title: 'Info',
            message: 'Message',
            confirmationAction: undefined
        };
        await wrapper.vm.$nextTick();
        
        const acceptButton = wrapper.find('.button.info');
        expect(acceptButton.exists()).toBe(false);
    });
});
```

## 11. Referencias Cruzadas

**Documentos Relacionados:**
- [modal-components.md](modal-components.md): Documentación sistema modales completo incluyendo ModalComponent
- [core-components.md](core-components.md): Componentes core framework estructura general
- [ToastComponents.md](ToastComponents.md): Toast notifications complementarias dialogs feedback
- ../../03-application/ui-services.md: ApplicationUIService methods completos documentación
- ../../03-application/event-bus.md: Event Bus architecture eventos framework
- ../../03-application/application-state.md: Application.confirmationMenu.value structure
- ../../05-advanced/Enums.md: confMenuType enum definición completa valores
- ../../02-base-entity/crud-operations.md: BaseEntity save() delete() invocan dialogs loading
- ../buttons/SaveButton.md: SaveButton workflow validation dialogs
- ../buttons/DeleteButton.md: DeleteButton confirmation workflow antes delete
