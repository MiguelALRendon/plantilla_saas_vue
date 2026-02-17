import { markRaw, type Component } from 'vue';
import type { ApplicationUIContext } from './application_ui_context';
import type { BaseEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { Toast } from './Toast';
import { ToastType } from '@/enums/ToastType';

/**
 * Servicio centralizado para gestionar operaciones UI comunes.
 * Maneja toasts, modales, confirmaciones, loading screens, sidebar toggle y dark mode.
 * Instanciado únicamente en Application singleton, accesible via Application.ApplicationUIService.
 * § 06-CODE-STYLING-STANDARDS 6.2.1, 6.6.1
 */
export class ApplicationUIService {
    /**
     * @region PROPERTIES
     */
    
    /**
     * Referencia al singleton Application que contiene estado reactivo global.
     */
    private app: ApplicationUIContext;

    /**
     * @endregion
     */

    /**
     * @region METHODS
     */
    
    /**
     * Constructor que inicializa servicio con referencia a Application.
     * @param app Instancia Application singleton con estado reactivo global.
     */
    constructor(app: ApplicationUIContext) {
        this.app = app;
    }

    /**
     * Invierte estado dark mode alternando AppConfiguration.isDarkMode.
     * CSS reacciona mediante computed property binding :root[data-theme="dark"].
     */
    toggleDarkMode = () => {
        this.app.AppConfiguration.value.isDarkMode = !this.app.AppConfiguration.value.isDarkMode;
    };

    /**
     * Emite evento toggle-sidebar para colapsar/expandir sidebar.
     * SideBarComponent escucha evento y actualiza estado local.
     */
    toggleSidebar = () => {
        this.app.eventBus.emit('toggle-sidebar');
    };

    /**
     * Establece sidebar a estado específico (collapsed/expanded).
     * @param state True para expandir sidebar, false para colapsar.
     */
    setSidebar = (state: boolean) => {
        this.app.eventBus.emit('toggle-sidebar', state);
    };

    /**
     * Muestra toast notification agregando instancia Toast a ToastList reactivo.
     * ToastComponent renderiza automáticamente cambios en ToastList.
     * @param message Texto descriptivo mostrado en toast.
     * @param type Tipo visual del toast (SUCCESS, ERROR, WARNING, INFO).
     */
    showToast = (message: string, type: ToastType) => {
        this.app.ToastList.value.push(new Toast(message, type));
    };

    /**
     * Abre modal global estableciendo entityClass y configuración.
     * Modal renderiza componente según viewType (LISTVIEW o DETAILVIEW).
     * @param entity Clase BaseEntity a mostrar en modal (ej: Product).
     * @param viewType Tipo de vista (LISTVIEW para tabla, DETAILVIEW para formulario).
     * @param customViewId Identificador de vista custom opcional.
     */
    showModal = (entity: typeof BaseEntity, viewType: ViewTypes, customViewId?: string) => {
        this.app.modal.value.modalView = entity;
        this.app.modal.value.modalOnCloseFunction = null;
        this.app.modal.value.viewType = viewType;
        this.app.modal.value.customViewId = customViewId;
        this.app.eventBus.emit('show-modal');
    };

    /**
     * Abre modal con callback onClose que se ejecuta al cerrar modal.
     * Usado en ObjectInputComponent para seleccionar entidad relacionada.
     * @param entity Clase BaseEntity a mostrar en modal.
     * @param onCloseFunction Callback ejecutado al cerrar modal con parámetro seleccionado.
     * @param viewType Tipo de vista modal.
     * @param customViewId Identificador de vista custom opcional.
     */
    showModalOnFunction = (
        entity: typeof BaseEntity,
        onCloseFunction: (param: unknown) => void,
        viewType: ViewTypes,
        customViewId?: string
    ): void => {
        this.app.modal.value.modalView = entity;
        this.app.modal.value.modalOnCloseFunction = onCloseFunction;
        this.app.modal.value.viewType = viewType;
        this.app.modal.value.customViewId = customViewId;
        this.app.eventBus.emit('show-modal');
    };

    /**
     * Cierra modal emitiendo evento hide-modal.
     * Espera 150ms para animación CSS antes resetear modalView a null.
     */
    closeModal = () => {
        this.app.eventBus.emit('hide-modal');
        setTimeout(() => {
            this.app.modal.value.modalView = null;
        }, 150);
    };

    /**
     * Cierra modal ejecutando callback modalOnCloseFunction con parámetro.
     * Usado en ObjectInputComponent para pasar entidad seleccionada.
     * @param param Parámetro pasado a callback (usualmente BaseEntity seleccionada).
     */
    closeModalOnFunction = (param: unknown): void => {
        if (this.app.modal.value.modalOnCloseFunction) {
            this.app.modal.value.modalOnCloseFunction(param);
        }
        this.app.eventBus.emit('hide-modal');
        setTimeout((): void => {
            this.app.modal.value.modalView = null;
            this.app.modal.value.modalOnCloseFunction = null;
        }, 150);
    };

    /**
     * Abre dropdown menu posicionándolo relativo a elemento HTML específico.
     * Calcula position_x, position_y desde getBoundingClientRect() del elemento.
     * @param position Elemento HTML referencia para posicionar dropdown.
     * @param title Título mostrado en header del dropdown.
     * @param component Componente Vue a renderizar dentro dropdown.
     * @param width Ancho custom del dropdown (opcional, default desde CSS).
     */
    openDropdownMenu = (position: HTMLElement, title: string, component: Component, width?: string) => {
        const rect = position.getBoundingClientRect();
        this.app.dropdownMenu.value.position_x = `${rect.left}px`;
        this.app.dropdownMenu.value.position_y = `${rect.bottom}px`;
        this.app.dropdownMenu.value.activeElementWidth = `${rect.width}px`;
        this.app.dropdownMenu.value.activeElementHeight = `${rect.height}px`;
        this.app.dropdownMenu.value.title = title;
        this.app.dropdownMenu.value.component = markRaw(component);
        if (width) {
            this.app.dropdownMenu.value.width = width;
        }
        this.app.dropdownMenu.value.showing = true;
    };

    /**
     * Cierra dropdown menu estableciendo showing a false.
     * Espera 500ms para animación CSS antes resetear component y title.
     */
    closeDropdownMenu = () => {
        this.app.dropdownMenu.value.showing = false;
        setTimeout(() => {
            this.app.dropdownMenu.value.component = null;
            this.app.dropdownMenu.value.title = '';
        }, 500);
    };

    /**
     * Abre confirmation menu con tipo, título, mensaje y callback aceptar.
     * Usado en operaciones destructivas requiriendo confirmación usuario.
     * @param type Tipo visual del confirmation (INFO, WARNING, ERROR).
     * @param title Título del diálogo confirmación.
     * @param message Mensaje descriptivo mostrado en diálogo.
     * @param onAccept Callback ejecutado al hacer clic botón aceptar (opcional).
     * @param acceptButtonText Texto botón aceptar (default "Aceptar").
     * @param cancelButtonText Texto botón cancelar (default "Cancelar").
     */
    openConfirmationMenu = (
        type: confMenuType,
        title: string,
        message: string,
        onAccept?: () => void,
        acceptButtonText: string = 'Aceptar',
        cancelButtonText: string = 'Cancelar'
    ) => {
        this.app.confirmationMenu.value = {
            type,
            title,
            message,
            confirmationAction: onAccept,
            acceptButtonText,
            cancelButtonText
        };
        this.app.eventBus.emit('show-confirmation');
    };

    /**
     * Ejecuta confirmationAction callback y cierra confirmation menu.
     * Llamado al hacer clic botón aceptar en diálogo confirmación.
     */
    acceptConfigurationMenu = () => {
        if (this.app.confirmationMenu.value.confirmationAction) {
            this.app.confirmationMenu.value.confirmationAction();
        }

        this.closeConfirmationMenu();
    };

    /**
     * Cierra confirmation menu emitiendo evento hide-confirmation.
     * Espera 500ms para animación CSS antes resetear confirmationMenu a defaults.
     */
    closeConfirmationMenu = () => {
        this.app.eventBus.emit('hide-confirmation');
        setTimeout(() => {
            this.app.confirmationMenu.value = {
                type: confMenuType.INFO,
                title: '',
                message: '',
                confirmationAction: () => {}
            };
        }, 500);
    };

    /**
     * Muestra loading screen full-screen emitiendo evento show-loading.
     * Usado antes de operaciones largas (fetch API, procesamiento batch).
     */
    showLoadingScreen = () => {
        this.app.eventBus.emit('show-loading');
    };

    /**
     * Oculta loading screen emitiendo evento hide-loading.
     * SIEMPRE usar en finally block para garantizar ejecución incluso si error.
     */
    hideLoadingScreen = () => {
        this.app.eventBus.emit('hide-loading');
    };

    /**
     * Muestra loading indicator pequeño (no full-screen).
     * Usado para loading states locales en componentes específicos.
     */
    showLoadingMenu = () => {
        this.app.eventBus.emit('show-loading-menu');
    };

    /**
     * Oculta loading indicator pequeño.
     */
    hideLoadingMenu = () => {
        this.app.eventBus.emit('hide-loading-menu');
    };
    
    /**
     * @endregion
     */
}
