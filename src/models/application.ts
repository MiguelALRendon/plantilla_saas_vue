import { Component, defineComponent, h, markRaw, ref, Ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { Router } from 'vue-router';

import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import mitt, { Emitter } from 'mitt';

import { useAppConfigStore, useUiStore, useViewStore } from '@/stores';
import { DefaultButtonLists } from '@/constants/default_button_lists';
import GenericButtonComponent from '@/components/Buttons/GenericButtonComponent.vue';
import { BaseEntity } from '@/entities/base_entity';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { Language } from '@/enums/language';
import { ToastType } from '@/enums/toast_type';
import { ViewTypes } from '@/enums/view_type';
import { GetLanguagedText } from '@/helpers/language_helper';

import type { Events } from '@/types/events';
import type { ExtraFunctions } from '@/types/extra_functions';
import type { RetryableAxiosRequestConfig } from '@/types/service.types';

import { AppConfiguration } from './app_configuration';
import { ApplicationDataService } from './application_data_service';
import { ApplicationUIService } from './application_ui_service';
import { confirmationMenu } from './confirmation_menu';
import { DropdownMenu } from './dropdown_menu';
import type { EntityCtor } from './view';
import type { View } from './view';

import type { ApplicationUIContext } from './application_ui_context';
import type { Modal } from './modal';
import type { Toast } from './toast';

/**
 * Main application singleton class that manages UI state, routing, and modals
 * Implements the singleton pattern via getInstance() method
 * Coordinates between entities, views, and components throughout the application lifecycle
 * Serves as the central orchestrator for module navigation, modal management, and event communication
 */
class ApplicationClass implements ApplicationUIContext {
    private static instance: ApplicationClass | null = null;
    private static readonly VIEW_TRANSITION_DELAY_MS = 400;
    private static readonly BUTTON_UPDATE_DELAY_MS = 405;
    private static readonly CONFIG_STORAGE_KEY = 'app_configuration';

    // #region PROPERTIES — Reactive and non-reactive properties of the Application singleton

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
     * Service class for API/entity data transformations
     * Type: ApplicationDataService
     * Provides reusable transformers for date, decimal, boolean and enum values
     */
    ApplicationDataService: ApplicationDataService;
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

    // #endregion

    private constructor() {
        // Initialize with plain refs so this can safely run at module evaluation
        // time (before Pinia is active). _connectPinia() replaces these with
        // Pinia-backed refs once initializeApplication() is called.
        this.AppConfiguration = ref<AppConfiguration>({
            appName: (import.meta.env.VITE_APP_NAME as string) || 'My SaaS Application',
            appVersion: (import.meta.env.VITE_APP_VERSION as string) || '1.0.0',
            apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || 'https://api.my-saas-app.com',
            apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
            apiRetryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
            environment: (import.meta.env.VITE_ENVIRONMENT as string) || 'development',
            logLevel: (import.meta.env.VITE_LOG_LEVEL as string) || 'info',
            authTokenKey: (import.meta.env.VITE_AUTH_TOKEN_KEY as string) || 'auth_token',
            authRefreshTokenKey: (import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY as string) || 'refresh_token',
            sessionTimeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000,
            itemsPerPage: Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 20,
            maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
            isDarkMode: false,
            selectedLanguage: (Number(import.meta.env.VITE_SELECTED_LANGUAGE) as Language) || Language.EN,
            asyncValidationDebounce: Number(import.meta.env.VITE_ASYNC_VALIDATION_DEBOUNCE) || 300,
        });
        this.View = ref<View>({
            entityClass: null,
            entityObject: null,
            component: null,
            viewType: ViewTypes.DEFAULTVIEW,
            isValid: true,
            entityOid: '',
        });
        this.ModuleList = ref<(typeof BaseEntity)[]>([]);
        this.ListButtons = ref<Component[]>([]);
        this.ToastList = ref<Toast[]>([]);
        this.modal = ref<Modal>({
            modalView: null,
            modalOnCloseFunction: null,
            viewType: ViewTypes.LISTVIEW,
        });
        this.dropdownMenu = ref<DropdownMenu>({
            showing: false,
            title: '',
            component: null,
            width: '250px',
            position_x: '0px',
            position_y: '0px',
            canvasWidth: typeof window !== 'undefined' ? `${window.innerWidth}px` : '1024px',
            canvasHeight: typeof window !== 'undefined' ? `${window.innerHeight}px` : '768px',
            activeElementWidth: '0px',
            activeElementHeight: '0px',
        });
        this.confirmationMenu = ref<confirmationMenu>({
            type: confMenuType.INFO,
            title: '',
            message: '',
            confirmationAction: () => {},
        });

        this.eventBus = mitt<Events>();
        this.ApplicationDataService = new ApplicationDataService();
        this.ApplicationUIService = new ApplicationUIService(this);
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
            async (error: AxiosError) => {
                const status = error.response?.status;
                const requestConfig = error.config as RetryableAxiosRequestConfig | undefined;

                if (requestConfig && requestConfig.__retryCount === undefined) {
                    requestConfig.__retryCount = 0;
                }

                if (status === undefined) {
                    // T233: Retry with bounded exponential backoff for offline/transient connectivity errors
                    if (
                        requestConfig &&
                        (requestConfig.__retryCount ?? 0) < this.AppConfiguration.value.apiRetryAttempts
                    ) {
                        requestConfig.__retryCount = (requestConfig.__retryCount ?? 0) + 1;
                        const retryDelay = Math.pow(2, requestConfig.__retryCount) * 1000;
                        this.ApplicationUIService.showToast(
                            ApplicationClass.formatText('errors.connection_retrying', {
                                current: requestConfig.__retryCount,
                                max: this.AppConfiguration.value.apiRetryAttempts
                            }),
                            ToastType.WARNING
                        );
                        await new Promise((resolve) => setTimeout(resolve, retryDelay));
                        return this.axiosInstance.request(requestConfig);
                    }
                    this.ApplicationUIService.showToast(
                        GetLanguagedText('errors.connection_error'),
                        ToastType.ERROR
                    );
                    return Promise.reject(error);
                }

                switch (status) {
                    case 401:
                        localStorage.removeItem(this.AppConfiguration.value.authTokenKey);
                        this.ApplicationUIService.showToast(
                            GetLanguagedText('errors.session_expired'),
                            ToastType.ERROR
                        );

                        if (this.router) {
                            this.router.push('/login').catch(() => {});
                        }
                        break;

                    case 403:
                        this.ApplicationUIService.showToast(
                            GetLanguagedText('errors.no_permissions'),
                            ToastType.ERROR
                        );
                        break;

                    case 404:
                        this.ApplicationUIService.showToast(
                            GetLanguagedText('errors.resource_not_found'),
                            ToastType.WARNING
                        );
                        break;

                    case 422: {
                        const responseData = error.response?.data as Record<string, unknown> | undefined;
                        const validationErrors = responseData?.errors as Record<string, unknown> | undefined;

                        if (validationErrors && Object.keys(validationErrors).length > 0) {
                            const messages = Object.values(validationErrors)
                                .flatMap((item) => (Array.isArray(item) ? item : [item]))
                                .map((item) => String(item))
                                .join(', ');

                            this.ApplicationUIService.showToast(
                                ApplicationClass.formatText('validation.validation_errors', { messages }),
                                ToastType.ERROR
                            );
                        } else {
                            this.ApplicationUIService.showToast(
                                GetLanguagedText('validation.validation_data_error'),
                                ToastType.ERROR
                            );
                        }
                        break;
                    }

                    case 500:
                    case 502:
                    case 503:
                        if (
                            requestConfig &&
                            (requestConfig.__retryCount ?? 0) < this.AppConfiguration.value.apiRetryAttempts
                        ) {
                            requestConfig.__retryCount = (requestConfig.__retryCount ?? 0) + 1;

                            this.ApplicationUIService.showToast(
                                ApplicationClass.formatText('errors.server_retrying', {
                                    current: requestConfig.__retryCount,
                                    max: this.AppConfiguration.value.apiRetryAttempts
                                }),
                                ToastType.WARNING
                            );

                            const delay = Math.pow(2, requestConfig.__retryCount) * 1000;
                            await new Promise((resolve) => setTimeout(resolve, delay));
                            return this.axiosInstance.request(requestConfig);
                        }

                        this.ApplicationUIService.showToast(
                            GetLanguagedText('errors.server_error'),
                            ToastType.ERROR
                        );
                        break;

                    default:
                        this.ApplicationUIService.showToast(
                            ApplicationClass.formatText('errors.unexpected_error_with_status', { status }),
                            ToastType.ERROR
                        );
                }

                return Promise.reject(error);
            }
        );
    }

    private static formatText(path: string, replacements: Record<string, string | number> = {}): string {
        let text = GetLanguagedText(path);
        for (const [key, value] of Object.entries(replacements)) {
            text = text.split(`{${key}}`).join(String(value));
        }
        return text;
    }

    private static wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // #region METHODS — Public and private methods for managing application state and navigation

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
        if (this.View.value.entityObject?.isPersistent() && this.View.value.entityObject.getDirtyState()) {
            this.ApplicationUIService.openConfirmationMenu(
                confMenuType.WARNING,
                GetLanguagedText('common.exit_without_saving'),
                GetLanguagedText('common.unsaved_changes_confirm'),
                () => {
                    this.setViewChanges(entityClass, component, viewType, entity).then(() => {
                        setTimeout(() => this.setButtonList(), ApplicationClass.BUTTON_UPDATE_DELAY_MS);
                    });
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
    private setViewChanges = async (
        entityClass: typeof BaseEntity,
        component: Component,
        viewType: ViewTypes,
        entity: BaseEntity | null = null
    ) => {
        this.ApplicationUIService.showLoadingScreen();
        await ApplicationClass.wait(ApplicationClass.VIEW_TRANSITION_DELAY_MS);
        this.View.value.entityClass = entityClass as unknown as EntityCtor;
        this.View.value.entityObject = entity;
        this.View.value.component = component;
        this.View.value.viewType = viewType;

        if (entity) {
            const uniqueValue = entity.getUniquePropertyValue();
            if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
                this.View.value.entityOid = 'new';
            } else {
                this.View.value.entityOid = String(uniqueValue);
            }
        } else {
            this.View.value.entityOid = '';
        }

        await this.updateRouterFromView(entityClass, entity);
        this.ApplicationUIService.hideLoadingScreen();
    };

    /**
     * Synchronizes Vue Router with current view state
     * Navigates to appropriate route based on entity and view type
     * @param entityClass The entity class being viewed
     * @param entity Optional entity object, determines if navigating to detail or list view
     */
    private updateRouterFromView = async (
        entityClass: typeof BaseEntity,
        entity: BaseEntity | null = null
    ) => {
        if (!this.router) return;

        const isRegisteredModule = this.ModuleList.value.includes(entityClass);
        if (!isRegisteredModule) {
            // Keep internal view state for transient/non-registered entities (e.g., Configuration editor)
            // without forcing URL routes that router guards resolve from ModuleList.
            return;
        }

        const moduleName = entityClass.getModuleName() || entityClass.name;
        const moduleNameLower = moduleName.toLowerCase();

        /** Prevent navigation if we're already at the correct route */
        const currentRoute = this.router.currentRoute.value;

        if (entity) {
            /** Navigate to detailview with entity ID or 'new' */
            const targetPath = `/${moduleNameLower}/${this.View.value.entityOid}`;
            if (currentRoute.path !== targetPath) {
                await this.router
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
                await this.router
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
        }, ApplicationClass.BUTTON_UPDATE_DELAY_MS);
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
        }, ApplicationClass.BUTTON_UPDATE_DELAY_MS);
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
        }, ApplicationClass.BUTTON_UPDATE_DELAY_MS);
    };

    /**
     * Configures the button list based on current view type and entity state
     * Determines which action buttons to display in the top bar
     * Differentiates between persistent and non-persistent entities in detail view
     */
    setButtonList() {
        const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;
        const isPersistentModule = this.View.value.entityClass?.createNewInstance().isPersistent() ?? false;
        let buttonList: Component[];

        switch (this.View.value.viewType) {
            case ViewTypes.LISTVIEW:
                buttonList = isPersistentModule ? DefaultButtonLists.ListView : [];
                break;
            case ViewTypes.DEFAULTVIEW:
                buttonList = isPersistentModule
                    ? (this.View.value.entityClass?.getDefaultViewButtonList() ?? DefaultButtonLists.ListView)
                    : [];
                break;
            case ViewTypes.DETAILVIEW:
                buttonList = isPersistentEntity
                    ? DefaultButtonLists.DetailView
                    : DefaultButtonLists.DetailViewNonPersistent;
                break;
            default:
                buttonList = [];
                break;
        }

        const customButtons = this.getCustomViewButtons(
            this.View.value.entityObject,
            this.View.value.viewType
        );
        buttonList = [...buttonList, ...customButtons];

        this.ListButtons.value = buttonList.map(markRaw);
    }

    /**
     * Builds GenericButton components for custom entity methods decorated with @OnViewFunction.
     * Falls back to a fresh instance from entityClass when no entity object is available (e.g. LISTVIEW).
     */
    private getCustomViewButtons(entity: BaseEntity | null, viewType: ViewTypes): Component[] {
        const resolved: BaseEntity | null =
            entity ?? (this.View.value.entityClass?.createNewInstance() ?? null);

        if (!resolved) {
            return [];
        }

        const customFunctions: ExtraFunctions[] = resolved.getCustomFunctions().filter((item) =>
            item.viewTypes.includes(viewType)
        );

        return customFunctions.map((item) =>
            defineComponent({
                name: `CustomActionButton_${String(item.text).replace(/\s+/g, '_')}`,
                setup() {
                    return () =>
                        h(GenericButtonComponent, {
                            icon: item.icon,
                            text: item.text,
                            onClick: item.fn,
                        });
                },
            })
        );
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
     * Replaces plain-ref properties with Pinia store-backed refs.
     * Must be called after setActivePinia() — i.e., from initializeApplication().
     * Syncs any values already set on the plain refs into the stores before replacing.
     */
    private _connectPinia(): void {
        const appConfigStore = useAppConfigStore();
        const viewStore = useViewStore();
        const uiStore = useUiStore();

        const { config } = storeToRefs(appConfigStore);
        config.value = { ...this.AppConfiguration.value };
        this.AppConfiguration = config as unknown as Ref<AppConfiguration>;

        const { view, moduleList, listButtons } = storeToRefs(viewStore);
        view.value = { ...this.View.value };
        this.View = view as Ref<View>;
        this.ModuleList = moduleList as Ref<(typeof BaseEntity)[]>;
        this.ListButtons = listButtons as Ref<Component[]>;

        const { toastList, modal, dropdownMenu, confirmationMenu } = storeToRefs(uiStore);
        this.ToastList = toastList as Ref<Toast[]>;
        this.modal = modal as Ref<Modal>;
        this.dropdownMenu = dropdownMenu as Ref<DropdownMenu>;
        this.confirmationMenu = confirmationMenu as Ref<confirmationMenu>;
    }

    /**
     * Initializes the application with the provided router instance
     * Canonical bootstrap method name per spec §8.1 Flow
     * @param router Vue Router instance to use for navigation
     */
    initializeApplication(router: Router) {
        this._connectPinia();
        this.initializeRouter(router);
        this.loadConfigurationFromStorage();
        this.validateModuleRuntimeState();
    }

    /**
     * Returns a cloned configuration snapshot suitable for entity mapping/edit flows.
     */
    getConfigurationSnapshot(): AppConfiguration {
        return {
            ...this.AppConfiguration.value,
        };
    }

    /**
     * Applies and persists configuration updates.
     */
    applyConfigurationSnapshot(config: AppConfiguration): void {
        this.AppConfiguration.value = {
            ...config,
        };

        this.axiosInstance.defaults.baseURL = this.AppConfiguration.value.apiBaseUrl;

        localStorage.setItem(
            ApplicationClass.CONFIG_STORAGE_KEY,
            JSON.stringify(this.AppConfiguration.value)
        );
    }

    /**
     * Loads persisted configuration and applies it if shape is valid.
     */
    loadConfigurationFromStorage(): void {
        const rawConfig = localStorage.getItem(ApplicationClass.CONFIG_STORAGE_KEY);

        if (rawConfig === null) {
            localStorage.setItem(
                ApplicationClass.CONFIG_STORAGE_KEY,
                JSON.stringify(this.AppConfiguration.value)
            );
            return;
        }

        try {
            const parsed = JSON.parse(rawConfig) as Partial<AppConfiguration>;

            this.applyConfigurationSnapshot({
                ...this.AppConfiguration.value,
                ...parsed,
                selectedLanguage: Number(parsed.selectedLanguage ?? this.AppConfiguration.value.selectedLanguage) as Language,
                isDarkMode: Boolean(parsed.isDarkMode ?? this.AppConfiguration.value.isDarkMode),
            });
        } catch (error) {
            console.warn('[Application] Invalid stored configuration payload. Falling back to defaults.', error);
        }
    }

    /**
     * Validates registration/runtime assumptions used by router and action bars.
     */
    validateModuleRuntimeState(): void {
        const hasDuplicateNames = this.ModuleList.value.some((module, index, list) => {
            const moduleName = module.getModuleName()?.toLowerCase() ?? module.name.toLowerCase();
            return list.findIndex((m) => (m.getModuleName()?.toLowerCase() ?? m.name.toLowerCase()) === moduleName) !== index;
        });

        if (hasDuplicateNames) {
            console.warn('[Application] Duplicate module names detected. Route resolution may be unstable.');
        }
    }

    /**
     * Registers an entity class as a module in the application.
     *
     * Performs a uniqueness check on `getModuleName()` before pushing to `ModuleList`
     * to prevent route collisions (two modules with the same name would map to the
     * same `:module` route parameter, making one unreachable).
     *
     * @param moduleClass - The entity class to register
     * @returns `true` if the module was registered; `false` if a duplicate was detected (module skipped)
     *
     * @example
     * ```typescript
    * Application.registerModule(HomeEntity);
     * Application.registerModule(ProductEntity);
     * ```
     */
    registerModule(moduleClass: typeof BaseEntity): boolean {
        const incomingName = moduleClass.getModuleName()?.toLowerCase() ?? moduleClass.name.toLowerCase();
        const isDuplicate = this.ModuleList.value.some((existing) => {
            const existingName = existing.getModuleName()?.toLowerCase() ?? existing.name.toLowerCase();
            return existingName === incomingName;
        });

        if (isDuplicate) {
            console.warn(
                `[Application] Duplicate module name detected: "${incomingName}". The module "${moduleClass.name}" was NOT registered to prevent route collision. Ensure each entity has a unique @ModuleName value.`
            );
            return false;
        }

        this.ModuleList.value.push(moduleClass);
        this.validateModuleRuntimeState();
        return true;
    }
    // #endregion

    // #region METHODS OVERRIDES — Reserved for method overrides if ApplicationClass is extended (currently unused)
    // #endregion

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
export default Application;
export { Application };
