import { markRaw, type Component } from 'vue';
import type { ApplicationUIContext } from './application_ui_context';
import type { BaseEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';
import { confMenuType } from '@/enums/conf_menu_type';
import { Toast } from './Toast';
import { ToastType } from '@/enums/ToastType';

export class ApplicationUIService {
    private app: ApplicationUIContext;

    constructor(app: ApplicationUIContext) {
        this.app = app;
    }

    toggleDarkMode = () => {
        this.app.AppConfiguration.value.isDarkMode = !this.app.AppConfiguration.value.isDarkMode;
    }

    toggleSidebar = () => {
        this.app.eventBus.emit('toggle-sidebar');
    }

    setSidebar = (state: boolean) => {
        this.app.eventBus.emit('toggle-sidebar', state);
    }

    showToast = (message: string, type: ToastType) => {
        this.app.ToastList.value.push(new Toast(message, type));
    }

    showModal = (entity: typeof BaseEntity, viewType: ViewTypes, customViewId?: string) => {
        this.app.modal.value.modalView = entity;
        this.app.modal.value.modalOnCloseFunction = null;
        this.app.modal.value.viewType = viewType;
        this.app.modal.value.customViewId = customViewId;
        this.app.eventBus.emit('show-modal');
    }

    showModalOnFunction = (entity: typeof BaseEntity, onCloseFunction: (param: any) => void, viewType: ViewTypes, customViewId?: string) => {
        this.app.modal.value.modalView = entity;
        this.app.modal.value.modalOnCloseFunction = onCloseFunction;
        this.app.modal.value.viewType = viewType;
        this.app.modal.value.customViewId = customViewId;
        this.app.eventBus.emit('show-modal');
    }

    closeModal = () => {
        this.app.eventBus.emit('hide-modal');
        setTimeout(() => {
            this.app.modal.value.modalView = null;
        }, 150);
    }

    closeModalOnFunction = (param: any) => {
        if (this.app.modal.value.modalOnCloseFunction) {
            this.app.modal.value.modalOnCloseFunction(param);
        }
        this.app.eventBus.emit('hide-modal');
        setTimeout(() => {
            this.app.modal.value.modalView = null;
            this.app.modal.value.modalOnCloseFunction = null;
        }, 150);
    }

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
    }

    closeDropdownMenu = () => {
        this.app.dropdownMenu.value.showing = false;
        setTimeout(() => {
            this.app.dropdownMenu.value.component = null;
            this.app.dropdownMenu.value.title = '';
        }, 500);
    }

    openConfirmationMenu = (type: confMenuType, title: string, message: string, onAccept?: () => void, acceptButtonText: string = 'Aceptar', cancelButtonText: string = 'Cancelar') => {
        this.app.confirmationMenu.value = {
            type,
            title,
            message,
            confirmationAction: onAccept,
            acceptButtonText,
            cancelButtonText
        };
        this.app.eventBus.emit('show-confirmation');
    }

    acceptConfigurationMenu = () => {
        if (this.app.confirmationMenu.value.confirmationAction) {
            this.app.confirmationMenu.value.confirmationAction();
        }

        this.closeConfirmationMenu();
    }

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
    }

    showLoadingScreen = () => {
        this.app.eventBus.emit('show-loading');
    }

    hideLoadingScreen = () => {
        this.app.eventBus.emit('hide-loading');
    }

    showLoadingMenu = () => {
        this.app.eventBus.emit('show-loading-menu');
    }

    hideLoadingMenu = () => {
        this.app.eventBus.emit('hide-loading-menu');
    }
}
