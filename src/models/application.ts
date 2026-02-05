import { Component, markRaw, ref, Ref } from 'vue';
import axios, { AxiosInstance } from 'axios';
import type { Modal } from './modal';
import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entitiy';
import { Products } from '@/entities/products';
import { AppConfiguration } from './AppConfiguration';
import { DropdownMenu } from './dropdown_menu';
import { confirmationMenu } from './confirmation_menu';
import { confMenuType } from '@/enums/conf_menu_type';
import mitt, { Emitter } from 'mitt';
import type { Events } from '@/types/events';
import { View } from './View';
import {
    NewButtonComponent,
    RefreshButtonComponent,
    SaveButtonComponent,
    SaveAndNewButtonComponent,
    SendToDeviceButtonComponent,
    ValidateButtonComponent
} from '@/components/Buttons';

class ApplicationClass {
    AppConfiguration: Ref<AppConfiguration>;
    View: Ref<View>;
    ModuleList: Ref<(typeof BaseEntity)[]>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<confirmationMenu>;
    eventBus: Emitter<Events>;
    ListButtons: Ref<Component[]>;
    axiosInstance: AxiosInstance;
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
        this.View = ref<View>({
            entityClass: null,
            entityObject: null,
            component: null,
            viewType: ViewTypes.DEFAULTVIEW,
            isValid: true
        }) as Ref<View>;
        this.ModuleList = ref<(typeof BaseEntity)[]>([]) as Ref<(typeof BaseEntity)[]>;
        this.eventBus = mitt<Events>();
        this.modal = ref<Modal>({
            modalView: null,
            modalOnCloseFunction: null,
            viewType: ViewTypes.LISTVIEW
        }) as Ref<Modal>;
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
        this.ListButtons = ref<Component[]>([]) as Ref<Component[]>;
        
        this.axiosInstance = axios.create({
            baseURL: this.AppConfiguration.value.apiBaseUrl,
            timeout: this.AppConfiguration.value.apiTimeout,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem(this.AppConfiguration.value.authTokenKey);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem(this.AppConfiguration.value.authTokenKey);
                }
                return Promise.reject(error);
            }
        );
    }

    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }

    toggleDarkMode = () => {
        this.AppConfiguration.value.isDarkMode = !this.AppConfiguration.value.isDarkMode;
    }

    toggleSidebar = () => {
        this.eventBus.emit('toggle-sidebar');
    }

    setSidebar = (state: boolean) => {
        this.eventBus.emit('toggle-sidebar', state);
    }

    changeView = (entityClass: typeof BaseEntity, component: Component, viewType: ViewTypes, entity: BaseEntity | null = null) => {
        this.View.value.entityClass = entityClass;
        this.View.value.entityObject = entity;
        this.View.value.component = component;
        this.View.value.viewType = viewType;
    }

    changeViewToDefaultView = (entityClass: typeof BaseEntity) => {
        this.changeView(entityClass, entityClass.getModuleDefaultComponent(), ViewTypes.DEFAULTVIEW);
        setTimeout(() => {
            this.setButtonList();
        }, 405);
    }

    changeViewToListView = (entityClass: typeof BaseEntity) => {
        this.changeView(entityClass, entityClass.getModuleListComponent(), ViewTypes.LISTVIEW);
        setTimeout(() => {
            this.setButtonList();
        }, 405);
    }

    changeViewToDetailView = <T extends BaseEntity>(entity: T) => {
        var entityClass = entity.constructor as typeof BaseEntity;
        this.changeView(entityClass, entityClass.getModuleDetailComponent(), ViewTypes.DETAILVIEW, entity);
        setTimeout(() => {
            this.setButtonList();
        }, 405);
    }

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

    showModal = (entity: typeof BaseEntity, viewType: ViewTypes, customViewId?: string) => {
        this.modal.value.modalView = entity;
        this.modal.value.modalOnCloseFunction = null;
        this.modal.value.viewType = viewType;
        this.modal.value.customViewId = customViewId;
        this.eventBus.emit('show-modal');
    }

    showModalOnFunction = (entity: typeof BaseEntity, onCloseFunction: (param : any) => void, viewType: ViewTypes, customViewId?: string) => {
        this.modal.value.modalView = entity;
        this.modal.value.modalOnCloseFunction = onCloseFunction;
        this.modal.value.viewType = viewType;
        this.modal.value.customViewId = customViewId;
        this.eventBus.emit('show-modal');
    }

    closeModal = () => {
        this.eventBus.emit('hide-modal');
        setTimeout(() => {
            this.modal.value.modalView = null;
        }, 150);
    }

    closeModalOnFunction = (param : any) => {
        if (this.modal.value.modalOnCloseFunction) {
            this.modal.value.modalOnCloseFunction(param);
        }
        this.eventBus.emit('hide-modal');
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

    openConfirmationMenu = (type: confMenuType, title: string, message: string, onAccept?: () => void, acceptButtonText: string = 'Aceptar', cancelButtonText: string = 'Cancelar') => {
        this.confirmationMenu.value = {
            type,
            title,
            message,
            confirmationAction: onAccept,
            acceptButtonText,
            cancelButtonText
        };
        this.eventBus.emit('show-confirmation');
    }

    acceptConfigurationMenu = () => {
        if(this.confirmationMenu.value.confirmationAction)
            this.confirmationMenu.value.confirmationAction();

        this.closeConfirmationMenu();
    }

    closeConfirmationMenu = () => {
        this.eventBus.emit('hide-confirmation');
        setTimeout(() => {
            this.confirmationMenu.value = {
                type: confMenuType.INFO,
                title: '',
                message: '',
                confirmationAction: () => {}
            };
        }, 500);
    }

    showLoadingScreen = () => {
        this.eventBus.emit('show-loading');
    }

    hideLoadingScreen = () => {
        this.eventBus.emit('hide-loading');
    }

    showLoadingMenu = () => {
        this.eventBus.emit('show-loading-menu');
    }
    hideLoadingMenu = () => {
        this.eventBus.emit('hide-loading-menu');
    }
}

const Application = ApplicationClass.getInstance();

Application.ModuleList.value.push(Products);
export default Application;
export { Application };