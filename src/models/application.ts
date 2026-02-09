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
import type { Toast } from './Toast';
import { ApplicationUIService } from './application_ui_service';
import type { ApplicationUIContext } from './application_ui_context';

class ApplicationClass implements ApplicationUIContext {
    AppConfiguration: Ref<AppConfiguration>;
    View: Ref<View>;
    ModuleList: Ref<(typeof BaseEntity)[]>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<confirmationMenu>;
    eventBus: Emitter<Events>;
    ListButtons: Ref<Component[]>;
    axiosInstance: AxiosInstance;
    ToastList: Ref<Toast[]>;
    ApplicationUIService: ApplicationUIService;
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
        this.ToastList = ref<Toast[]>([]) as Ref<Toast[]>;        
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

        this.ApplicationUIService = new ApplicationUIService(this);
    }

    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }

    changeView = (entityClass: typeof BaseEntity, component: Component, viewType: ViewTypes, entity: BaseEntity | null = null) => {
        console.log(`Changing view to ${viewType} for entity class ${entity }`);
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

}

const Application = ApplicationClass.getInstance();

Application.ModuleList.value.push(Products);
export default Application;
export { Application };