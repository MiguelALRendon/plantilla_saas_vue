import { Component, markRaw, ref, Ref } from 'vue';
import type { Router } from 'vue-router';

import axios, { AxiosInstance } from 'axios';
import mitt, { Emitter } from 'mitt';

import {
    NewButtonComponent,
    RefreshButtonComponent,
    SaveAndNewButtonComponent,
    SaveButtonComponent,
    SendToDeviceButtonComponent,
    ValidateButtonComponent
} from '@/components/Buttons';
import { BaseEntity } from '@/entities/base_entity';
import { Product } from '@/entities/product.ts';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { ViewTypes } from '@/enums/view_type';

import type { Events } from '@/types/events';

import { AppConfiguration } from './AppConfiguration';
import { ApplicationUIService } from './application_ui_service';
import { confirmationMenu } from './confirmation_menu';
import { DropdownMenu } from './dropdown_menu';
import { View } from './View';

import type { ApplicationUIContext } from './application_ui_context';
import type { Modal } from './modal';
import type { Toast } from './Toast';

/**
 * Main application singleton class that manages UI state, routing, and modals
 * Implements the singleton pattern via getInstance() method
 * Coordinates between entities, views, and components throughout the application lifecycle
 * Serves as the central orchestrator for module navigation, modal management, and event communication
 */
class ApplicationClass implements ApplicationUIContext {
    private static instance: ApplicationClass | null = null;

    /**
     * @region PROPERTIES
     * Reactive and non-reactive properties of the Application singleton
     */
    /**
     * Application configuration object containing environment variables and settings
     * Type: Ref<AppConfiguration>
     * Used throughout the application to access API endpoints, timeouts, and environment-specific settings
     */
    AppConfiguration: Ref<AppConfiguration>;
    /**
     * Current view state containing entity class, object, component, and view type
     * Type: Ref<View>
     * Tracks the active module view and synchronizes with router state for navigation
     */
    View: Ref<View>;
    /**
     * Array of registered entity classes available in the application
     * Type: Ref<(typeof BaseEntity)[]>
     * Contains all module entities that can be navigated to and managed in the UI
     */
    ModuleList: Ref<(typeof BaseEntity)[]>;
    /**
     * Modal dialog configuration object for displaying overlay views
     * Type: Ref<Modal>
     * Controls the display of modal windows with custom components and close callbacks
     */
    modal: Ref<Modal>;
    /**
     * Dropdown menu configuration for positioning and displaying contextual menus
     * Type: Ref<DropdownMenu>
     * Manages position, size, and content of dropdown menus triggered by user actions
     */
    dropdownMenu: Ref<DropdownMenu>;
    /**
     * Confirmation dialog configuration for user action verification
     * Type: Ref<confirmationMenu>
     * Displays confirmation prompts with type, title, message, and callback action
     */
    confirmationMenu: Ref<confirmationMenu>;
    /**
     * Global event bus for cross-component communication
     * Type: Emitter<Events>
     * Enables components to emit and listen to typed events without direct coupling
     */
    eventBus: Emitter<Events>;
    /**
     * Array of button components displayed in the top bar based on current view
     * Type: Ref<Component[]>
     * Dynamically populated by setButtonList() according to view type and entity state
     */
    ListButtons: Ref<Component[]>;
    /**
     * Configured Axios instance for making HTTP API requests
     * Type: AxiosInstance
     * Includes interceptors for authentication tokens and error handling
     */
    axiosInstance: AxiosInstance;
    /**
     * Array of active toast notifications displayed to the user
     * Type: Ref<Toast[]>
     * Managed by ApplicationUIService to show temporary feedback messages
     */
    ToastList: Ref<Toast[]>;
    /**
     * Service class for managing UI interactions and user feedback
     * Type: ApplicationUIService
     * Provides methods for showing toasts, modals, and confirmation dialogs
     */
    ApplicationUIService: ApplicationUIService;
    /**
     * Vue Router instance for programmatic navigation
     * Type: Router | null
     * Initialized by initializeRouter() and used to synchronize view changes with URL routes
     */
    router: Router | null = null;
    /**
     * @endregion
     */

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
            isValid: true,
            entityOid: ''
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
                'Content-Type': 'application/json'
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

    /**
     * @region METHODS
     * Public and private methods for managing application state and navigation
     */
    /**
     * Changes the current application view to display a different entity and component
     * Checks for unsaved changes and prompts user confirmation if necessary
     * @param entityClass The entity class to navigate to
     * @param component The Vue component to render for this view
     * @param viewType The type of view (LISTVIEW, DETAILVIEW, DEFAULTVIEW)
     * @param entity Optional entity object to display in detail view
     */
    changeView = (
        entityClass: typeof BaseEntity,
        component: Component,
        viewType: ViewTypes,
        entity: BaseEntity | null = null
    ) => {
        if (this.View.value.entityObject && this.View.value.entityObject.getDirtyState()) {
            this.ApplicationUIService.openConfirmationMenu(
                confMenuType.WARNING,
                'Salir sin guardar',
                'Tienes cambios sin guardar. Â¿EstÃ¡s seguro de que quieres salir sin guardar?',
                () => {
                    this.setViewChanges(entityClass, component, viewType, entity);
                }
            );
            return;
        }
        this.setViewChanges(entityClass, component, viewType, entity);
    };

    /**
     * Applies view changes by updating View state and router
     * Called after confirmation dialog or directly if no unsaved changes exist
     * @param entityClass The entity class to navigate to
     * @param component The Vue component to render
     * @param viewType The type of view to display
     * @param entity Optional entity object for detail view
     */
    private setViewChanges = (
        entityClass: typeof BaseEntity,
        component: Component,
        viewType: ViewTypes,
        entity: BaseEntity | null = null
    ) => {
        this.View.value.entityClass = entityClass;
        this.View.value.entityObject = entity;
        this.View.value.component = component;
        this.View.value.viewType = viewType;

        if (entity) {
            const uniqueValue = entity.getUniquePropertyValue();
            console.log('[Application] Unique value for entity:', uniqueValue);
            if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
                this.View.value.entityOid = 'new';
            } else {
                this.View.value.entityOid = String(uniqueValue);
            }
        } else {
            this.View.value.entityOid = '';
        }

        this.updateRouterFromView(entityClass, entity);
    };

    /**
     * Synchronizes Vue Router with current view state
     * Navigates to appropriate route based on entity and view type
     * @param entityClass The entity class being viewed
     * @param entity Optional entity object, determines if navigating to detail or list view
     */
    private updateRouterFromView = (entityClass: typeof BaseEntity, entity: BaseEntity | null = null) => {
        if (!this.router) return;

        const moduleName = entityClass.getModuleName() || entityClass.name;
        const moduleNameLower = moduleName.toLowerCase();

        /** Prevent navigation if we're already at the correct route */
        const currentRoute = this.router.currentRoute.value;

        if (entity) {
            /** Navigate to detailview with entity ID or 'new' */
            const targetPath = `/${moduleNameLower}/${this.View.value.entityOid}`;
            if (currentRoute.path !== targetPath) {
                this.router
                    .push({
                        name: 'ModuleDetail',
                        params: {
                            module: moduleNameLower,
                            oid: this.View.value.entityOid
                        }
                    })
                    .catch((err: unknown): void => {
                        /** Ignore duplicated navigation errors */
                        if (err instanceof Error && err.name !== 'NavigationDuplicated') {
                            console.error('[Application] Error al navegar:', err);
                        }
                    });
            }
        } else {
            /** Navigate to listview */
            const targetPath = `/${moduleNameLower}`;
            if (currentRoute.path !== targetPath) {
                this.router
                    .push({
                        name: 'ModuleList',
                        params: { module: moduleNameLower }
                    })
                    .catch((err: unknown): void => {
                        if (err instanceof Error && err.name !== 'NavigationDuplicated') {
                            console.error('[Application] Error al navegar:', err);
                        }
                    });
            }
        }
    };

    /**
     * Navigates to the default view for a given entity class
     * Updates button list after view transition
     * @param entityClass The entity class whose default view to display
     */
    changeViewToDefaultView = (entityClass: typeof BaseEntity) => {
        this.changeView(entityClass, entityClass.getModuleDefaultComponent(), ViewTypes.DEFAULTVIEW);
        setTimeout(() => {
            this.setButtonList();
        }, 405);
    };

    /**
     * Navigates to the list view for a given entity class
     * Updates button list after view transition
     * @param entityClass The entity class whose list view to display
     */
    changeViewToListView = (entityClass: typeof BaseEntity) => {
        this.changeView(entityClass, entityClass.getModuleListComponent(), ViewTypes.LISTVIEW, null);
        setTimeout(() => {
            this.setButtonList();
        }, 405);
    };

    /**
     * Navigates to the detail view for a specific entity instance
     * Updates button list after view transition
     * @param entity The entity instance to display in detail view
     */
    changeViewToDetailView = <T extends BaseEntity>(entity: T): void => {
        const entityClass: typeof BaseEntity = entity.constructor as typeof BaseEntity;
        this.changeView(entityClass, entityClass.getModuleDetailComponent(), ViewTypes.DETAILVIEW, entity);
        setTimeout((): void => {
            this.setButtonList();
        }, 405);
    };

    /**
     * Configures the button list based on current view type and entity state
     * Determines which action buttons to display in the top bar
     * Differentiates between persistent and non-persistent entities in detail view
     */
    setButtonList() {
        const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;

        switch (this.View.value.viewType) {
            case ViewTypes.LISTVIEW:
                this.ListButtons.value = [markRaw(NewButtonComponent), markRaw(RefreshButtonComponent)];
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

    /**
     * Initializes the router instance for the application
     * Must be called during application bootstrap to enable routing functionality
     * @param router Vue Router instance to use for navigation
     */
    initializeRouter(router: Router) {
        this.router = router;
    }
    /**
     * @endregion
     */

    /**
     * @region METHODS OVERRIDES
     * Reserved for method overrides if ApplicationClass is extended (currently unused)
     */
    /**
     * @endregion
     */

    /**
     * Returns the singleton instance of ApplicationClass
     * Creates a new instance if one does not exist
     * @returns The singleton ApplicationClass instance
     */
    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }
}

const Application = ApplicationClass.getInstance();

Application.ModuleList.value.push(Product);
export default Application;
export { Application };
