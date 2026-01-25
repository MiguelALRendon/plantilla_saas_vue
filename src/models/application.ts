import { Component, markRaw, ref, Ref } from 'vue';
import type { Modal } from './modal';
import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entitiy';
import { Products } from '@/entities/products';
import { AppConfiguration } from './AppConfiguration';
import { DropdownMenu } from './dropdown_menu';
import { confirmationMenu } from './confirmation_menu';
import { confMenuType } from '@/enums/conf_menu_type';

class ApplicationClass {
    AppConfiguration: Ref<AppConfiguration>;
    ModuleList: Ref<(typeof BaseEntity)[]>;
    activeViewEntity: Ref<typeof BaseEntity | null>;
    activeViewComponent: Ref<Component | null>;
    activeViewComponentProps: Ref<BaseEntity | null>;
    sidebarToggled: Ref<boolean>;
    isScreenLoading: Ref<boolean>;
    isShowingModal: Ref<boolean>;
    isShowingConfirmationMenu: Ref<boolean>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<confirmationMenu>;
    private static instance: ApplicationClass | null = null;

    private constructor() {
        this.AppConfiguration = ref<AppConfiguration>({
            appName: import.meta.env.VITE_APP_NAME || 'My SaaS Application',
            appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.my-saas-app.com',
            apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
            apiRetryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
            environment: import.meta.env.VITE_ENVIRONMENT || 'development',
            logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
            authTokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
            authRefreshTokenKey: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'refresh_token',
            sessionTimeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000,
            itemsPerPage: Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 20,
            maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
            isDarkMode: false
        }) as Ref<AppConfiguration>;
        this.ModuleList = ref<(typeof BaseEntity)[]>([]) as Ref<(typeof BaseEntity)[]>;
        this.activeViewEntity = ref<typeof BaseEntity | null>(null) as Ref<typeof BaseEntity | null>;
        this.activeViewComponent = ref<Component | null>(null) as Ref<Component | null>;
        this.sidebarToggled = ref<boolean>(true);
        this.isScreenLoading = ref<boolean>(false);
        this.isShowingModal = ref<boolean>(false);
        this.isShowingConfirmationMenu = ref<boolean>(false);
        this.modal = ref<Modal>({
            modalView: null,
            modalOnCloseFunction: null,
            viewType: ViewTypes.LISTVIEW
        }) as Ref<Modal>;
        this.activeViewComponentProps = ref<BaseEntity | null>(null) as Ref<BaseEntity | null>;
        this.dropdownMenu = ref<DropdownMenu>({
            showing: false,
            title: '',
            component: null,
            width: '250px',
            position_x: '0px',
            position_y: '0px',
            canvasWidth: `${window.innerWidth}px`,
            canvasHeight: `${window.innerHeight}px`,
            activeElementWidth: '0px',
            activeElementHeight: '0px'
        }) as Ref<DropdownMenu>;
        this.confirmationMenu = ref<confirmationMenu>({
            type: confMenuType.INFO,
            title: '',
            message: '',
            confirmationAction: () => {}
        }) as Ref<confirmationMenu>;
    }

    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }

    toggleDarkMode = () => {
        this.AppConfiguration.value.isDarkMode = !this.AppConfiguration.value.isDarkMode;
    }

    changeView = (entity: typeof BaseEntity) => {
        this.activeViewEntity.value = entity;
        this.activeViewComponent.value = entity.getModuleDefaultComponent();
    }

    changeViewToDetailView = (entity: BaseEntity) => {
        if (this.activeViewEntity.value) {
            this.activeViewComponentProps.value = entity;
            this.activeViewComponent.value = this.activeViewEntity.value.getModuleDetailComponent();
        }
    }

    toggleSidebar = () => {
        this.sidebarToggled.value = !this.sidebarToggled.value;
    }

    setSidebar = (state: boolean) => {
        this.sidebarToggled.value = state;
    }

    showLoadingScreen = () => {
        this.isScreenLoading.value = true;
    }

    hideLoadingScreen = () => {
        this.isScreenLoading.value = false;
    }

    showModal = (entity: typeof BaseEntity, viewType: ViewTypes, customViewId?: string) => {
        this.modal.value.modalView = entity;
        this.modal.value.modalOnCloseFunction = null;
        this.modal.value.viewType = viewType;
        this.modal.value.customViewId = customViewId;
        this.isShowingModal.value = true;
    }

    closeModal = () => {
        this.isShowingModal.value = false;
        setTimeout(() => {
            this.modal.value.modalView = null;
        }, 150);
    }

    showModalOnFunction = (entity: typeof BaseEntity, onCloseFunction: (param : any) => void, viewType: ViewTypes, customViewId?: string) => {
        this.modal.value.modalView = entity;
        this.modal.value.modalOnCloseFunction = onCloseFunction;
        this.modal.value.viewType = viewType;
        this.modal.value.customViewId = customViewId;
        this.isShowingModal.value = true;
    }

    closeModalOnFunction = (param : any) => {
        if (this.modal.value.modalOnCloseFunction) {
            this.modal.value.modalOnCloseFunction(param);
        }
        this.isShowingModal.value = false;
        setTimeout(() => {
            this.modal.value.modalView = null;
            this.modal.value.modalOnCloseFunction = null;
        }, 150);
    }

    openDropdownMenu = (position: HTMLElement, title: string, component: Component, width?: string) => {
        const rect = position.getBoundingClientRect();
        this.dropdownMenu.value.position_x = `${rect.left}px`;
        this.dropdownMenu.value.position_y = `${rect.bottom}px`;
        this.dropdownMenu.value.activeElementWidth = `${rect.width}px`;
        this.dropdownMenu.value.activeElementHeight = `${rect.height}px`;
        this.dropdownMenu.value.title = title;
        this.dropdownMenu.value.component = markRaw(component);
        if (width) {
            this.dropdownMenu.value.width = width;
        }
        this.dropdownMenu.value.showing = true;
    }

    closeDropdownMenu = () => {
        this.dropdownMenu.value.showing = false;
        setTimeout(() => {
            this.dropdownMenu.value.component = null;
            this.dropdownMenu.value.title = '';
        }, 500);
    }

    openConfirmationMenu = (type: confMenuType, title: string, message: string, onAccept: () => void) => {
        this.confirmationMenu.value = {
            type,
            title,
            message,
            confirmationAction: onAccept
        };
        this.isShowingConfirmationMenu.value = true;
    }

    closeConfirmationMenu = () => {
        this.isShowingConfirmationMenu.value = false;
        setTimeout(() => {
            this.confirmationMenu.value = {
                type: confMenuType.INFO,
                title: '',
                message: '',
                confirmationAction: () => {}
            };
        }, 500);
    }

    acceptConfigurationMenu = () => {
        this.confirmationMenu.value.confirmationAction();
        this.closeConfirmationMenu();
    }
}

const Application = ApplicationClass.getInstance();

Application.ModuleList.value.push(Products);
export default Application;
export { Application };
