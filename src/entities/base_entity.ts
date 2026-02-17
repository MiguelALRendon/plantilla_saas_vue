import type { Component } from 'vue';

import {
    API_ENDPOINT_KEY,
    API_METHODS_KEY,
    ARRAY_ELEMENT_TYPE_KEY,
    ASYNC_VALIDATION_KEY,
    CSS_COLUMN_CLASS_KEY,
    DEFAULT_PROPERTY_KEY,
    DISABLED_KEY,
    DISPLAY_FORMAT_KEY,
    HELP_TEXT_KEY,
    HIDE_IN_DETAIL_VIEW_KEY,
    HIDE_IN_LIST_VIEW_KEY,
    MODULE_CUSTOM_COMPONENTS_KEY,
    MODULE_DEFAULT_COMPONENT_KEY,
    MODULE_DETAIL_COMPONENT_KEY,
    MODULE_ICON_KEY,
    MODULE_LIST_COMPONENT_KEY,
    MODULE_NAME_KEY,
    MODULE_PERMISSION_KEY,
    PERSISTENT_KEY,
    PERSISTENT_KEY_KEY,
    PRIMARY_PROPERTY_KEY,
    PROPERTY_INDEX_KEY,
    PROPERTY_NAME_KEY,
    PROPERTY_TYPE_KEY,
    READONLY_KEY,
    REQUIRED_KEY,
    STRING_TYPE_KEY,
    TAB_ORDER_KEY,
    UNIQUE_KEY,
    VALIDATION_KEY,
    VIEW_GROUP_KEY,
    VIEW_GROUP_ROW_KEY,
} from '@/decorations';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { StringType } from '@/enums/string_type';
import { ToastType } from '@/enums/ToastType';
import Application from '@/models/application';
import DefaultDetailView from '@/views/default_detailview.vue';
import DefaultListview from '@/views/default_listview.vue';

import type {
    AsyncValidationMetadata,
    DisabledMetadata,
    DisplayFormatValue,
    HttpMethod,
    ReadOnlyMetadata,
    RequiredMetadata,
    ValidationMetadata,
} from '@/decorations';
import type { ViewGroupRow } from '@/enums/view_group_row';

type EntityData = Record<string, unknown>;
type MetadataRecord = Record<PropertyKey, unknown>;
type EntityConstructor<T extends BaseEntity = BaseEntity> = new (data: EntityData) => T;
type ConcreteEntityClass<T extends BaseEntity = BaseEntity> = EntityConstructor<T> & {
    getApiEndpoint(): string | undefined;
    mapFromPersistentKeys(data: EntityData): EntityData;
    getPersistentKeys(): Record<string, string>;
    getPropertyKeyByPersistentKey(persistentKey: string): string | undefined;
    getElementList(filter?: string): Promise<T[]>;
};

function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
        const errorRecord = error as Record<string, unknown>;
        const response = errorRecord.response as Record<string, unknown> | undefined;
        const responseData = response?.data as Record<string, unknown> | undefined;
        const responseMessage = responseData?.message;

        if (typeof responseMessage === 'string' && responseMessage.length > 0) {
            return responseMessage;
        }

        const message = errorRecord.message;
        if (typeof message === 'string' && message.length > 0) {
            return message;
        }
    }

    return 'Error desconocido';
}

/**
 * Abstract base class for all entities in the meta-programming framework
 *
 * Provides decorator-based metadata extraction, automatic CRUD operations,
 * validation, persistence mapping, and lifecycle hooks. All entity classes
 * in the framework must extend this class to inherit framework capabilities.
 */
export abstract class BaseEntity {
    [key: string]: unknown;

    /**
     * @region PROPERTIES
     * Instance properties for entity state management
     */
    /**
     * Indicates whether the entity is currently in a loading state
     * Used by UI components to show loading indicators
     */
    public _isLoading: boolean = false;

    /**
     * Snapshot of the entity's persistent state at load time
     * Used for dirty state detection and change tracking
     */
    public _originalState?: EntityData;

    /**
     * Indicates whether the entity is currently being saved
     * Prevents concurrent save operations
     */
    public _isSaving?: boolean = false;

    /**
     * Unique identifier for entity tracking and runtime object management
     * Optional property used by the framework to track entity instances across views and operations
     */
    public entityObjectId?: string;
    /**
     * @endregion
     */

    /**
     * Creates a new BaseEntity instance
     * Initializes the entity with provided data and captures the original state
     * @param data Initial data to populate the entity properties
     */
    constructor(data: EntityData) {
        Object.assign(this, data);
        this._originalState = structuredClone(this.toPersistentObject());
    }

    /**
     * @region METHODS
     * Instance methods for entity operations and metadata access
     */
    /**
     * Sets the entity to loading state
     * Used to indicate async operations in progress
     */
    public setLoading(): void {
        this._isLoading = true;
    }

    /**
     * Clears the entity loading state
     * Indicates async operations have completed
     */
    public clearLoadingState(): void {
        this._isLoading = false;
    }

    /**
     * Retrieves the current loading state of the entity
     * @returns True if entity is loading, false otherwise
     */
    public getLoadingState(): boolean {
        return this._isLoading;
    }

    /**
     * Determines if this entity represents a null/empty entity
     * @returns False for real entities, true only for EmptyEntity instances
     */
    isNull(): boolean {
        return false;
    }

    /**
     * Converts the entity to a plain JavaScript object
     * @returns Object representation including all properties
     */
    public toObject(): EntityData {
        return this as EntityData;
    }

    /**
     * Converts the entity to persistent object format
     * Only includes properties defined with decorators, excludes internal state
     * @returns Object containing only persistable properties
     */
    public toPersistentObject(): EntityData {
        const result: EntityData = {};
        const allProperties = (this.constructor as typeof BaseEntity).getAllPropertiesNonFilter();
        const propertyKeys = Object.keys(allProperties);

        for (const key of propertyKeys) {
            result[key] = this[key];
        }

        return result;
    }

    /**
     * Retrieves ordered list of property keys for the entity
     * Properties are sorted by PropertyIndex decorator if present
     * @returns Array of property keys in display order
     */
    public getKeys(): string[] {
        const columns = (this.constructor as typeof BaseEntity).getProperties();
        const keys = Object.keys(columns);
        const propertyIndices = this.getPropertyIndices();

        /** Sort by PropertyIndex if exists, otherwise by declaration order */
        return keys.sort((a, b) => {
            const indexA = propertyIndices[a] ?? Number.MAX_SAFE_INTEGER;
            const indexB = propertyIndices[b] ?? Number.MAX_SAFE_INTEGER;
            return indexA - indexB;
        });
    }

    /**
     * Retrieves all property keys that are defined as array types
     * @returns Array of property keys for array-typed properties
     */
    public getArrayKeys(): string[] {
        const properties = (this.constructor as typeof BaseEntity).getAllPropertiesNonFilter();
        const propertyTypes = (this.constructor as typeof BaseEntity).getPropertyTypes();
        const arrayKeys: string[] = [];

        for (const key of Object.keys(properties)) {
            if (propertyTypes[key] === Array) {
                arrayKeys.push(key);
            }
        }

        return arrayKeys;
    }

    /**
     * Retrieves property indices defined by PropertyIndex decorator
     * Used for custom ordering of properties in UI
     * @returns Map of property keys to their display order indices
     */
    public getPropertyIndices(): Record<string, number> {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        return (proto[PROPERTY_INDEX_KEY] as Record<string, number>) || {};
    }

    /**
     * Retrieves CSS classes defined for properties via CssColumnClass decorator
     * @returns Map of property keys to their CSS class names
     */
    public getCSSClasses(): Record<string, string> {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        return (proto[CSS_COLUMN_CLASS_KEY] as Record<string, string>) || {};
    }

    /**
     * Retrieves the type of a specific property
     * @param propertyKey The property key to query
     * @returns The property type (String, Number, Boolean, Array, etc.) or undefined
     */
    public getPropertyType(propertyKey: string): unknown | undefined { // EXC-002: Public metadata API
        return (this.constructor as typeof BaseEntity).getPropertyType(propertyKey);
    }

    /**
     * Retrieves the entity type for array properties
     * @param propertyKey The array property key to query
     * @returns The BaseEntity subclass type for array elements, or undefined if not an entity array
     */
    public getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined {
        return (this.constructor as typeof BaseEntity).getArrayPropertyType(propertyKey);
    }

    /**
     * Retrieves the value of the property marked with DefaultProperty decorator
     * @returns The default display value for this entity
     */
    public getDefaultPropertyValue(): unknown { // EXC-002: Public metadata API
        const constructorMetadata = this.constructor as unknown as MetadataRecord;
        const propertyName = constructorMetadata[DEFAULT_PROPERTY_KEY] as string | undefined; // EXC-001: Symbol index access
        if (!propertyName) {
            return undefined;
        }
        return (this as EntityData)[propertyName];
    }

    /**
     * Retrieves the value of the property marked with PrimaryProperty decorator
     * Typically the database primary key
     * @returns The primary key value
     */
    public getPrimaryPropertyValue(): unknown {
        const constructorMetadata = this.constructor as unknown as MetadataRecord;
        const propertyName = constructorMetadata[PRIMARY_PROPERTY_KEY] as string | undefined;
        if (!propertyName) {
            return undefined;
        }
        return (this as EntityData)[propertyName];
    }

    /**
     * Retrieves the key name of the property marked with PrimaryProperty decorator
     * @returns The property key name or undefined if not defined
     */
    public getPrimaryPropertyKey(): string | undefined {
        const constructorMetadata = this.constructor as unknown as MetadataRecord;
        return constructorMetadata[PRIMARY_PROPERTY_KEY] as string | undefined;
    }

    /**
     * Retrieves the value of the property marked as unique
     * Used for API endpoints and entity identification
     * @returns The unique identifier value
     */
    public getUniquePropertyValue(): unknown {
        const constructorMetadata = this.constructor as unknown as MetadataRecord;
        const propertyName = constructorMetadata[UNIQUE_KEY] as string | undefined;
        if (!propertyName) {
            return undefined;
        }
        return (this as EntityData)[propertyName];
    }

    /**
     * Retrieves the key name of the property marked as unique
     * @returns The unique property key name or undefined if not defined
     */
    public getUniquePropertyKey(): string | undefined {
        const constructorMetadata = this.constructor as unknown as MetadataRecord;
        return constructorMetadata[UNIQUE_KEY] as string | undefined;
    }

    /**
     * Retrieves string types for all properties
     * Maps property keys to StringType enum values (TEXT, EMAIL, PASSWORD, etc.)
     * @returns Map of property keys to their string type definitions
     */
    public getStringType(): Record<string, StringType> {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const stringTypes = (proto[STRING_TYPE_KEY] as Record<string, StringType>) || {};
        const properties = (this.constructor as typeof BaseEntity).getProperties();
        const result: Record<string, StringType> = {};

        for (const key of Object.keys(properties)) {
            result[key] = stringTypes[key] ?? StringType.TEXT;
        }

        return result;
    }

    /**
     * Retrieves view group assignments for properties
     * Used to organize properties into labeled groups in UI
     * @returns Map of property keys to their view group names
     */
    public getViewGroups(): Record<string, string> {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        return (proto[VIEW_GROUP_KEY] as Record<string, string>) || {};
    }

    /**
     * Retrieves view group row configurations for properties
     * Defines which row in the view group each property belongs to
     * @returns Map of property keys to their ViewGroupRow configurations
     */
    public getViewGroupRows(): Record<string, ViewGroupRow> {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        return (proto[VIEW_GROUP_ROW_KEY] as Record<string, ViewGroupRow>) || {};
    }

    /**
     * Determines if a specific property is required
     * Evaluates Required decorator condition (function or boolean)
     * @param propertyKey The property key to check
     * @returns True if property is required, false otherwise
     */
    public isRequired(propertyKey: string): boolean {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const requiredFields = (proto[REQUIRED_KEY] as Record<string, RequiredMetadata>) ?? {};
        const metadata = requiredFields[propertyKey];

        if (!metadata) {
            return false;
        }

        let value = metadata.validation !== undefined ? metadata.validation : metadata.condition;

        if (value === undefined) {
            return false;
        }

        return typeof value === 'function' ? value(this) : value;
    }

    /**
     * Retrieves the validation message for a required property
     * @param propertyKey The property key to query
     * @returns Custom validation message or undefined
     */
    public requiredMessage(propertyKey: string): string | undefined {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const requiredFields = (proto[REQUIRED_KEY] as Record<string, RequiredMetadata>) ?? {};
        const metadata = requiredFields[propertyKey];
        return metadata?.message;
    }

    /**
     * Validates a property against its Validation decorator condition
     * @param propertyKey The property key to validate
     * @returns True if validation passes, false otherwise
     */
    public isValidation(propertyKey: string): boolean {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const validationRules = (proto[VALIDATION_KEY] as Record<string, ValidationMetadata>) ?? {};
        const rule = validationRules[propertyKey];

        if (!rule) {
            return true;
        }

        return typeof rule.condition === 'function' ? rule.condition(this) : rule.condition;
    }

    /**
     * Retrieves the validation error message for a property
     * @param propertyKey The property key to query
     * @returns Validation error message or undefined
     */
    public validationMessage(propertyKey: string): string | undefined {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const validationRules = (proto[VALIDATION_KEY] as Record<string, ValidationMetadata>) ?? {};
        const rule = validationRules[propertyKey];
        return rule?.message;
    }

    /**
     * Determines if a property should be disabled in UI
     * Evaluates Disabled decorator condition (function or boolean)
     * @param propertyKey The property key to check
     * @returns True if property should be disabled, false otherwise
     */
    public isDisabled(propertyKey: string): boolean {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const disabledFields = (proto[DISABLED_KEY] as Record<string, DisabledMetadata>) ?? {};
        const metadata = disabledFields[propertyKey];

        if (!metadata) {
            return false;
        }

        return typeof metadata.condition === 'function' ? metadata.condition(this) : metadata.condition;
    }

    /**
     * Executes asynchronous validation for a property
     * Used for server-side validations or complex async checks
     * @param propertyKey The property key to validate
     * @returns Promise resolving to true if valid, false if invalid
     */
    public async isAsyncValidation(propertyKey: string): Promise<boolean> {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const asyncValidationRules = (proto[ASYNC_VALIDATION_KEY] as Record<string, AsyncValidationMetadata>) ?? {};
        const rule = asyncValidationRules[propertyKey];

        if (!rule) {
            return true;
        }

        try {
            return await rule.condition(this);
        } catch (error) {
            console.error(`Error in async validation for ${propertyKey}:`, error);
            return false;
        }
    }

    /**
     * Retrieves the async validation error message for a property
     * @param propertyKey The property key to query
     * @returns Async validation error message or undefined
     */
    public asyncValidationMessage(propertyKey: string): string | undefined {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const asyncValidationRules = (proto[ASYNC_VALIDATION_KEY] as Record<string, AsyncValidationMetadata>) ?? {};
        const rule = asyncValidationRules[propertyKey];
        return rule?.message;
    }

    /**
     * Retrieves the display format configuration for a property
     * @param propertyKey The property key to query
     * @returns Display format function or template string, or undefined
     */
    public getDisplayFormat(propertyKey: string): DisplayFormatValue | undefined {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const displayFormats = (proto[DISPLAY_FORMAT_KEY] as Record<string, DisplayFormatValue>) ?? {};
        return displayFormats[propertyKey];
    }

    /**
     * Retrieves the formatted display value for a property
     * Applies DisplayFormat decorator if present
     * @param propertyKey The property key to format
     * @returns Formatted string representation of the property value
     */
    public getFormattedValue(propertyKey: string): string {
        const value = (this as EntityData)[propertyKey];
        const format = this.getDisplayFormat(propertyKey);

        if (!format) {
            return value?.toString() ?? '';
        }

        if (typeof format === 'function') {
            return format(value);
        }

        /** If format is string, replace {value} with current value */
        return format.replace('{value}', value?.toString() ?? '');
    }

    /**
     * Retrieves the help text for a property
     * Defined by HelpText decorator, displayed as tooltips or hints in UI
     * @param propertyKey The property key to query
     * @returns Help text string or undefined
     */
    public getHelpText(propertyKey: string): string | undefined {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const helpTexts = (proto[HELP_TEXT_KEY] as Record<string, string>) ?? {};
        return helpTexts[propertyKey];
    }

    /**
     * Retrieves tab order indices for all properties
     * Used for keyboard navigation and tab order in forms
     * @returns Map of property keys to their tab order indices
     */
    public getTabOrders(): Record<string, number> {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        return (proto[TAB_ORDER_KEY] as Record<string, number>) || {};
    }

    /**
     * Retrieves array property keys sorted by tab order
     * @returns Ordered array of array property keys
     */
    public getArrayKeysOrdered(): string[] {
        const arrayKeys = this.getArrayKeys();
        const tabOrders = this.getTabOrders();

        /** Ordenar por TabOrder si existe, sino por orden de declaración */
        return arrayKeys.sort((a, b) => {
            const orderA = tabOrders[a] ?? Number.MAX_SAFE_INTEGER;
            const orderB = tabOrders[b] ?? Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
        });
    }

    /**
     * Retrieves the API endpoint for this entity
     * Defined by ApiEndpoint decorator
     * @returns API endpoint URL or undefined
     */
    public getApiEndpoint(): string | undefined {
        return (this.constructor as typeof BaseEntity).getApiEndpoint();
    }

    /**
     * Determines if a property is read-only
     * Evaluates ReadOnly decorator condition (function or boolean)
     * @param propertyKey The property key to check
     * @returns True if property is read-only, false otherwise
     */
    public isReadOnly(propertyKey: string): boolean {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const readOnlyFields = (proto[READONLY_KEY] as Record<string, ReadOnlyMetadata>) ?? {};
        const metadata = readOnlyFields[propertyKey];

        if (!metadata) {
            return false;
        }

        return typeof metadata.condition === 'function' ? metadata.condition(this) : metadata.condition;
    }

    /**
     * Retrieves the allowed HTTP methods for this entity's API
     * Defined by ApiMethods decorator
     * @returns Array of allowed HTTP methods or undefined if all allowed
     */
    public getApiMethods(): HttpMethod[] | undefined {
        return (this.constructor as typeof BaseEntity).getApiMethods();
    }

    /**
     * Checks if a specific HTTP method is allowed for this entity
     * @param method The HTTP method to check (GET, POST, PUT, DELETE)
     * @returns True if method is allowed, false otherwise
     */
    public isApiMethodAllowed(method: HttpMethod): boolean {
        return (this.constructor as typeof BaseEntity).isApiMethodAllowed(method);
    }

    /**
     * Determines if a property should be hidden in detail view
     * @param propertyKey The property key to check
     * @returns True if property should be hidden in detail view
     */
    public isHideInDetailView(propertyKey: string): boolean {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const hideFields = (proto[HIDE_IN_DETAIL_VIEW_KEY] as Record<string, boolean>) ?? {};
        return hideFields[propertyKey] === true;
    }

    /**
     * Determines if a property should be hidden in list view
     * @param propertyKey The property key to check
     * @returns True if property should be hidden in list view
     */
    public isHideInListView(propertyKey: string): boolean {
        const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
        const hideFields = (proto[HIDE_IN_LIST_VIEW_KEY] as Record<string, boolean>) ?? {};
        return hideFields[propertyKey] === true;
    }

    /**
     * Retrieves the mapping of property keys to persistent storage keys
     * Used for mapping between API and internal property names
     * @returns Map of property keys to persistent key names
     */
    public getPersistentKeys(): Record<string, string> {
        return (this.constructor as typeof BaseEntity).getPersistentKeys();
    }

    /**
     * Retrieves the persistent storage key for a property
     * @param propertyKey The property key to look up
     * @returns The persistent key name or undefined
     */
    public getPersistentKeyByPropertyKey(propertyKey: string): string | undefined {
        return (this.constructor as typeof BaseEntity).getPersistentKeyByPropertyKey(propertyKey);
    }

    /**
     * Retrieves the property key for a given persistent storage key
     * @param persistentKey The persistent key to look up
     * @returns The property key name or undefined
     */
    public getPropertyKeyByPersistentKey(persistentKey: string): string | undefined {
        return (this.constructor as typeof BaseEntity).getPropertyKeyByPersistentKey(persistentKey);
    }

    /**
     * Maps entity data to persistent storage key format
     * Converts internal property keys to API/database keys
     * @param data Entity data with internal property keys
     * @returns Data object with persistent keys
     */
    public mapToPersistentKeys(data: EntityData): EntityData {
        return (this.constructor as typeof BaseEntity).mapToPersistentKeys(data);
    }

    /**
     * Maps data from persistent storage key format to entity properties
     * Converts API/database keys to internal property keys
     * @param data Data with persistent keys
     * @returns Data object with internal property keys
     */
    public mapFromPersistentKeys(data: EntityData): EntityData {
        return (this.constructor as typeof BaseEntity).mapFromPersistentKeys(data);
    }

    /**
     * Validates that the module has all required decorator configurations
     * Checks for ModuleName, ModuleIcon, DefaultProperty, and PrimaryProperty
     * @returns True if configuration is valid, false otherwise (shows error dialog)
     */
    public validateModuleConfiguration(): boolean {
        const errors: string[] = [];
        const entityClass = this.constructor as typeof BaseEntity;

        if (!entityClass.getModuleName()) {
            errors.push('El módulo no tiene definido @ModuleName');
        }

        if (!entityClass.getModuleIcon()) {
            errors.push('El módulo no tiene definido @ModuleIcon');
        }

        const constructorMetadata = this.constructor as unknown as MetadataRecord;

        if (!constructorMetadata[DEFAULT_PROPERTY_KEY]) {
            errors.push('El módulo no tiene definido @DefaultProperty');
        }

        if (!this.getPrimaryPropertyKey()) {
            errors.push('El módulo no tiene definido @PrimaryProperty');
        }

        if (errors.length > 0) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error de configuración del módulo',
                errors.join('\n'),
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return false;
        }

        return true;
    }

    /**
     * Validates all input fields and executes async validations
     * Triggers validation event for all form inputs
     * @returns Promise resolving to true if all validations pass, false otherwise
     */
    public async validateInputs(): Promise<boolean> {
        Application.View.value.isValid = true;
        Application.ApplicationUIService.showLoadingMenu();

        /** Esperar un tick para que el loading se muestre */
        await new Promise((resolve) => setTimeout(resolve, 50));

        /** Emitir evento para que los inputs validen */
        Application.eventBus.emit('validate-inputs');

        /** Esperar a que todas las validaciones asíncronas realmente terminen */
        const keys = this.getKeys();
        const asyncValidationPromises = keys.map((key) => this.isAsyncValidation(key));
        await Promise.all(asyncValidationPromises);

        /** Esperar un momento adicional para que los inputs procesen los resultados */
        await new Promise((resolve) => setTimeout(resolve, 50));

        this.onValidated();
        Application.ApplicationUIService.hideLoadingMenu();

        return Application.View.value.isValid;
    }

    /**
     * Determines if this entity class is marked as persistent
     * @returns True if entity has Persistent decorator
     */
    public isPersistent(): boolean {
        const constructorMetadata = this.constructor as unknown as MetadataRecord;
        return !!constructorMetadata[PERSISTENT_KEY];
    }

    /**
     * Retrieves the current saving state of the entity
     * @returns True if entity is being saved, false otherwise
     */
    public get getSaving(): boolean {
        return this._isSaving ?? false;
    }

    /**
     * Determines if this entity is new (not yet persisted)
     * @returns True if primary key is undefined or null
     */
    public isNew(): boolean {
        return this.getPrimaryPropertyValue() === undefined || this.getPrimaryPropertyValue() === null;
    }

    /**
     * Validates that the entity has all required configurations for persistence
     * Extends module validation to check UniqueProperty, ApiEndpoint, and ApiMethods
     * @returns True if persistence configuration is valid, false otherwise (shows error dialog)
     */
    public validatePersistenceConfiguration(): boolean {
        if (!this.validateModuleConfiguration()) {
            return false;
        }

        const errors: string[] = [];

        if (!this.getUniquePropertyKey()) {
            errors.push('La entidad no tiene definido @UniquePropertyKey');
        }

        if (!this.getApiEndpoint()) {
            errors.push('La entidad no tiene definido @ApiEndpoint');
        }

        if (!this.getApiMethods()) {
            errors.push('La entidad no tiene definido @ApiMethods');
        }

        if (errors.length > 0) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error de configuración de persistencia',
                errors.join('\\n'),
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return false;
        }

        return true;
    }

    /**
     * Validates that a specific HTTP method is allowed for this entity
     * @param method The HTTP method to validate
     * @returns True if method is allowed, false otherwise (shows error dialog)
     */
    public validateApiMethod(method: HttpMethod): boolean {
        if (!this.isApiMethodAllowed(method)) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Método no permitido',
                `El método ${method} no está permitido en esta entidad`,
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return false;
        }
        return true;
    }

    /**
     * Saves the entity to the database via API
     * Creates new entity with POST or updates existing with PUT based on isNew()
     * Executes validation, lifecycle hooks, and updates original state on success
     * @returns Promise resolving to this entity with updated data from server
     * @throws Error if persistence configuration invalid, validation fails, or API request fails
     */
    public async save(): Promise<this> {
        if (!this.validatePersistenceConfiguration()) {
            return this;
        }

        if (!this.validateApiMethod(this.isNew() ? 'POST' : 'PUT')) {
            return this;
        }

        if (!(await this.validateInputs())) {
            return this;
        }

        this._isSaving = true;
        this.beforeSave();
        Application.ApplicationUIService.showLoadingMenu();
        await new Promise((resolve) => setTimeout(resolve, 400));

        try {
            this.onSaving();
            const endpoint = this.getApiEndpoint();
            const dataToSend = this.mapToPersistentKeys(this.toObject());

            let response;
            if (this.isNew()) {
                response = await Application.axiosInstance.post(endpoint!, dataToSend);
            } else {
                const uniqueKey = this.getUniquePropertyValue();
                response = await Application.axiosInstance.put(`${endpoint}/${uniqueKey}`, dataToSend);
            }

            const mappedData = this.mapFromPersistentKeys(response.data);
            Object.assign(this, mappedData);
            this._originalState = structuredClone(this.toPersistentObject());
            this._isSaving = false;
            this.afterSave();
            Application.ApplicationUIService.hideLoadingMenu();
            Application.ApplicationUIService.showToast('Guardado con éxito.', ToastType.SUCCESS);
            return this;
        } catch (error: unknown) {
            this._isSaving = false;
            Application.ApplicationUIService.hideLoadingMenu();
            this.saveFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al guardar',
                getErrorMessage(error),
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }

    /**
     * Updates an existing entity in the database via PUT request
     * Requires primary key to be present (not new entity)
     * Executes lifecycle hooks and updates original state on success
     * @returns Promise resolving to this entity with updated data from server
     * @throws Error if persistence configuration invalid, entity is new, or API request fails
     */
    public async update(): Promise<this> {
        if (!this.validatePersistenceConfiguration()) {
            return this;
        }

        if (!this.validateApiMethod('PUT')) {
            return this;
        }

        if (this.isNew()) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al actualizar',
                'No se puede actualizar un elemento que no ha sido guardado',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return this;
        }

        this._isSaving = true;
        this.beforeUpdate();

        try {
            this.onUpdating();
            const endpoint = this.getApiEndpoint();
            const uniqueKey = this.getUniquePropertyValue();
            const dataToSend = this.mapToPersistentKeys(this.toObject());

            const response = await Application.axiosInstance.put(`${endpoint}/${uniqueKey}`, dataToSend);
            const mappedData = this.mapFromPersistentKeys(response.data);
            Object.assign(this, mappedData);
            this._originalState = structuredClone(this.toPersistentObject());
            this._isSaving = false;
            this.afterUpdate();
            return this;
        } catch (error: unknown) {
            this._isSaving = false;
            this.updateFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al actualizar',
                getErrorMessage(error),
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }

    /**
     * Deletes the entity from the database via DELETE request
     * Requires primary key to be present (not new entity)
     * Executes lifecycle hooks on success or failure
     * @returns Promise resolving when deletion completes
     * @throws Error if persistence configuration invalid, entity is new, or API request fails
     */
    public async delete(): Promise<void> {
        if (!this.validatePersistenceConfiguration()) {
            return;
        }

        if (!this.validateApiMethod('DELETE')) {
            return;
        }

        if (this.isNew()) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al eliminar',
                'No se puede eliminar un elemento que no ha sido guardado',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return;
        }

        this.beforeDelete();

        try {
            this.onDeleting();
            const endpoint = this.getApiEndpoint();
            const uniqueKey = this.getUniquePropertyValue();

            await Application.axiosInstance.delete(`${endpoint}/${uniqueKey}`);
            this.afterDelete();
        } catch (error: unknown) {
            this.deleteFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al eliminar',
                getErrorMessage(error),
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }

    /**
     * Refreshes the entity list from the server
     * @param filter Optional filter string to apply to the query
     * @returns Promise resolving to array of entity instances
     * @throws Error if API request fails
     */
    public async refresh(filter: string = ''): Promise<this[]> {
        try {
            const entityClass = this.constructor as unknown as ConcreteEntityClass<this>;
            const instances = await entityClass.getElementList(filter);
            this.afterRefresh();
            return instances;
        } catch (error) {
            this.refreshFailed();
            throw error;
        }
    }

    /**
     * Lifecycle hook called before route navigation leaves this entity
     * Can be overridden to implement custom navigation guards
     * @returns True to allow navigation, false to prevent
     */
    public onBeforeRouteLeave(): boolean {
        return true;
    }

    /**
     * Determines if the entity has unsaved changes
     * Compares current state with original state captured at load time
     * @returns True if entity has been modified since load
     */
    public getDirtyState(): boolean {
        const snapshotJson: string = JSON.stringify(this._originalState);
        const actualJson: string = JSON.stringify(this.toPersistentObject());
        console.log('Snapshot:', snapshotJson);
        console.log('Actual:', actualJson);
        console.log('Dirty State:', snapshotJson !== actualJson);
        return snapshotJson !== actualJson;
    }

    /**
     * Resets all entity properties to their original state
    * Reverts all unsaved changes made since entity was loaded
     */
    public resetChanges(): void {
        if (this._originalState) {
            Object.assign(this, structuredClone(this._originalState));
        }
    }

    /**
     * Lifecycle hook called before save operation begins
     * Override to implement custom pre-save logic
     */
    public beforeSave(): void {}

    /**
     * Lifecycle hook called during save operation after validation
     * Override to implement custom save processing
     */
    public onSaving(): void {}

    /**
     * Lifecycle hook called after save operation succeeds
     * Override to implement custom post-save logic
     */
    public afterSave(): void {}

    /**
     * Lifecycle hook called when save operation fails
     * Override to implement custom error handling
     */
    public saveFailed(): void {}

    /**
     * Lifecycle hook called before update operation begins
     * Override to implement custom pre-update logic
     */
    public beforeUpdate(): void {}

    /**
     * Lifecycle hook called during update operation
     * Override to implement custom update processing
     */
    public onUpdating(): void {}

    /**
     * Lifecycle hook called after update operation succeeds
     * Override to implement custom post-update logic
     */
    public afterUpdate(): void {}

    /**
     * Lifecycle hook called when update operation fails
     * Override to implement custom error handling
     */
    public updateFailed(): void {}

    /**
     * Lifecycle hook called before delete operation begins
     * Override to implement custom pre-delete logic
     */
    public beforeDelete(): void {}

    /**
     * Lifecycle hook called during delete operation
     * Override to implement custom delete processing
     */
    public onDeleting(): void {}

    /**
     * Lifecycle hook called after delete operation succeeds
     * Override to implement custom post-delete logic
     */
    public afterDelete(): void {}

    /**
     * Lifecycle hook called when delete operation fails
     * Override to implement custom error handling
     */
    public deleteFailed(): void {}

    /**
     * Lifecycle hook called after getElement operation succeeds
     * Override to implement custom post-load logic for single entity
     */
    public afterGetElement(): void {}

    /**
     * Lifecycle hook called when getElement operation fails
     * Override to implement custom error handling
     */
    public getElementFailed(): void {}

    /**
     * Lifecycle hook called after getElementList operation succeeds
     * Override to implement custom post-load logic for entity list
     */
    public afterGetElementList(): void {}

    /**
     * Lifecycle hook called when getElementList operation fails
     * Override to implement custom error handling
     */
    public getElementListFailed(): void {}

    /**
     * Lifecycle hook called after refresh operation succeeds
     * Override to implement custom post-refresh logic
     */
    public afterRefresh(): void {}

    /**
     * Lifecycle hook called when refresh operation fails
     * Override to implement custom error handling
     */
    public refreshFailed(): void {}

    /**
     * Lifecycle hook called after all validations complete
     * Override to implement custom post-validation logic
     */
    public onValidated(): void {}
    // #endregion

    // #region METHODS OVERRIDES
    /** No override methods in BaseEntity */
    // #endregion

    /**
     * Retrieves all properties without filtering out array types
     * @returns Map of all property keys to their display names
     */
    public static getAllPropertiesNonFilter(): Record<string, string> {
        const proto = this.prototype as unknown as MetadataRecord;
        return (proto[PROPERTY_NAME_KEY] as Record<string, string>) || {};
    }

    /**
     * Retrieves all non-array properties
     * Filters out properties that are defined as Array type
     * @returns Map of scalar property keys to their display names
     */
    public static getProperties(): Record<string, string> {
        const proto = this.prototype as unknown as MetadataRecord;
        const properties = (proto[PROPERTY_NAME_KEY] as Record<string, string>) || {};
        const propertyTypes = this.getPropertyTypes();
        const filtered: Record<string, string> = {};

        for (const key of Object.keys(properties)) {
            if (propertyTypes[key] !== Array) {
                filtered[key] = properties[key];
            }
        }

        return filtered;
    }

    /**
     * Retrieves the type mapping for all properties
     * @returns Map of property keys to their TypeScript type constructors
     */
    public static getPropertyTypes(): Record<string, unknown> { // EXC-002: Public metadata API
        const proto = this.prototype as unknown as MetadataRecord; // EXC-001: Symbol index access
        return (proto[PROPERTY_TYPE_KEY] as Record<string, unknown>) || {};
    }

    /**
     * Retrieves the type of a specific property
     * @param propertyKey The property key to query
     * @returns The property type constructor or undefined
     */
    public static getPropertyType(propertyKey: string): unknown | undefined { // EXC-002: Public metadata API
        const types = this.getPropertyTypes();
        return types[propertyKey];
    }

    /**
     * Retrieves the entity type for array properties
     * @param propertyKey The array property key to query
     * @returns The BaseEntity subclass for array elements, or undefined
     */
    public static getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined {
        const propertyType = this.getPropertyType(propertyKey);

        if (propertyType !== Array) {
            return undefined;
        }

        const proto = this.prototype as unknown as MetadataRecord;
        const arrayTypes = (proto[ARRAY_ELEMENT_TYPE_KEY] as Record<string, unknown>) || {};
        const entityType = arrayTypes[propertyKey] as typeof BaseEntity | undefined;

        if (entityType && entityType.prototype instanceof BaseEntity) {
            return entityType;
        }

        return undefined;
    }

    /**
     * Retrieves the display name for a property using selector function
     * Type-safe way to get property display name
     * @param selector Function that selects the property from entity instance
     * @returns The display name of the property or undefined
     */
    public static getPropertyName<T extends BaseEntity>(selector: (entity: T) => unknown): string | undefined {
        const columns = this.getProperties();
        const proxy = new Proxy(
            {},
            {
                get(prop) {
                    return prop;
                }
            }
        );
        const propertyName = selector(proxy as T) as string;
        return columns[propertyName];
    }

    /**
     * Retrieves the display name for a property by its key
     * @param propertyKey The property key to look up
     * @returns The display name or undefined if not found
     */
    public static getPropertyNameByKey(propertyKey: string): string | undefined {
        const columns = this.getAllPropertiesNonFilter();
        return columns[propertyKey];
    }

    /**
     * Retrieves CSS classes defined for all properties
     * @returns Map of property keys to their CSS class names
     */
    public static getCSSClasses(): Record<string, string> {
        const proto = this.prototype as unknown as MetadataRecord;
        return (proto[CSS_COLUMN_CLASS_KEY] as Record<string, string>) || {};
    }

    /**
     * Retrieves the module name defined by ModuleName decorator
     * @returns The module name or undefined
     */
    public static getModuleName(): string | undefined {
        const metadata = this as unknown as MetadataRecord;
        return metadata[MODULE_NAME_KEY] as string | undefined;
    }

    /**
     * Retrieves the module permission defined by ModulePermission decorator
     * @returns The permission identifier or undefined
     */
    public static getModulePermission(): string | undefined {
        const metadata = this as unknown as MetadataRecord;
        return metadata[MODULE_PERMISSION_KEY] as string | undefined;
    }

    /**
     * Retrieves the module icon defined by ModuleIcon decorator
     * @returns The icon identifier or undefined
     */
    public static getModuleIcon(): string | undefined {
        const metadata = this as unknown as MetadataRecord;
        return metadata[MODULE_ICON_KEY] as string | undefined;
    }

    /**
     * Retrieves the custom list view component for this module
     * @returns Vue component for list view, defaults to DefaultListview
     */
    public static getModuleListComponent(): Component {
        const metadata = this as unknown as MetadataRecord;
        return (metadata[MODULE_LIST_COMPONENT_KEY] as Component) || DefaultListview;
    }

    /**
     * Retrieves the custom detail view component for this module
     * @returns Vue component for detail view, defaults to DefaultDetailView
     */
    public static getModuleDetailComponent(): Component {
        const metadata = this as unknown as MetadataRecord;
        return (metadata[MODULE_DETAIL_COMPONENT_KEY] as Component) || DefaultDetailView;
    }

    /**
     * Retrieves the default component for this module
     * Used when no specific view is requested
     * @returns Vue component for default view, defaults to DefaultListview
     */
    public static getModuleDefaultComponent(): Component {
        const metadata = this as unknown as MetadataRecord;
        return (metadata[MODULE_DEFAULT_COMPONENT_KEY] as Component) || DefaultListview;
    }

    /**
     * Retrieves the map of custom components for this module
     * @returns Map of component names to Vue components, or null if none defined
     */
    public static getModuleCustomComponents(): Map<string, Component> | null {
        const metadata = this as unknown as MetadataRecord;
        return (metadata[MODULE_CUSTOM_COMPONENTS_KEY] as Map<string, Component>) || null;
    }

    /**
     * Creates a new instance of this entity with empty data
     * @returns New entity instance
     */
    public static createNewInstance<T extends BaseEntity>(this: new (data: EntityData) => T): T {
        return new this({});
    }

    /**
     * Retrieves the API endpoint defined by ApiEndpoint decorator
     * @returns API endpoint URL or undefined
     */
    public static getApiEndpoint(): string | undefined {
        const metadata = this as unknown as MetadataRecord;
        return metadata[API_ENDPOINT_KEY] as string | undefined;
    }

    /**
     * Retrieves the allowed HTTP methods defined by ApiMethods decorator
     * @returns Array of allowed HTTP methods or undefined if all allowed
     */
    public static getApiMethods(): HttpMethod[] | undefined {
        const metadata = this as unknown as MetadataRecord;
        return metadata[API_METHODS_KEY] as HttpMethod[] | undefined;
    }

    /**
     * Checks if a specific HTTP method is allowed for this entity
     * @param method The HTTP method to check
     * @returns True if method is allowed, false otherwise
     */
    public static isApiMethodAllowed(method: HttpMethod): boolean {
        const allowedMethods = this.getApiMethods();
        if (!allowedMethods) {
            return true; // If not specified, all methods are allowed
        }
        return allowedMethods.includes(method);
    }

    /**
     * Retrieves the mapping of property keys to persistent storage keys
     * @returns Map of property keys to persistent key names
     */
    public static getPersistentKeys(): Record<string, string> {
        const proto = this.prototype as unknown as MetadataRecord;
        return (proto[PERSISTENT_KEY_KEY] as Record<string, string>) || {};
    }

    /**
     * Retrieves the persistent storage key for a property
     * @param propertyKey The property key to look up
     * @returns The persistent key name or undefined
     */
    public static getPersistentKeyByPropertyKey(propertyKey: string): string | undefined {
        const persistentKeys = this.getPersistentKeys();
        return persistentKeys[propertyKey];
    }

    /**
     * Retrieves the property key for a given persistent storage key
     * @param persistentKey The persistent key to look up
     * @returns The property key name or undefined
     */
    public static getPropertyKeyByPersistentKey(persistentKey: string): string | undefined {
        const persistentKeys = this.getPersistentKeys();
        for (const [key, value] of Object.entries(persistentKeys)) {
            if (value === persistentKey) {
                return key;
            }
        }
        return undefined;
    }

    /**
     * Maps entity data to persistent storage key format
     * Converts internal property keys to API/database keys
     * @param data Entity data with internal property keys
     * @returns Data object with persistent keys
     */
    public static mapToPersistentKeys(
        this: typeof BaseEntity,
        data: EntityData
    ): EntityData {
        const persistentKeys = this.getPersistentKeys();
        const mapped: EntityData = {};

        for (const [propertyKey, value] of Object.entries(data)) {
            const persistentKey = persistentKeys[propertyKey];
            mapped[persistentKey || propertyKey] = value;
        }

        return mapped;
    }

    /**
     * Maps data from persistent storage key format to entity properties
     * Converts API/database keys to internal property keys
     * @param data Data with persistent keys
     * @returns Data object with internal property keys
     */
    public static mapFromPersistentKeys(
        this: typeof BaseEntity,
        data: EntityData
    ): EntityData {
        const mapped: EntityData = {};

        for (const [persistentKey, value] of Object.entries(data)) {
            const propertyKey = this.getPropertyKeyByPersistentKey(persistentKey);
            mapped[propertyKey || persistentKey] = value;
        }

        return mapped;
    }

    /**
     * Retrieves a single entity from the API by its unique identifier
     * Executes afterGetElement lifecycle hook on success
     * @param entityObjectId The unique identifier of the entity to retrieve
     * @returns Promise resolving to entity instance
     * @throws Error if ApiEndpoint not defined or API request fails
     */
    public static async getElement<T extends BaseEntity>(
        this: ConcreteEntityClass<T>,
        entityObjectId: string
    ): Promise<T> {
        const endpoint = this.getApiEndpoint();

        if (!endpoint) {
            throw new Error('ApiEndpoint no definido');
        }

        try {
            const response = await Application.axiosInstance.get(`${endpoint}/${entityObjectId}`);
            const mappedData = this.mapFromPersistentKeys(response.data as EntityData);
            const instance = new this(mappedData);
            instance.afterGetElement();
            return instance;
        } catch (error: unknown) {
            const tempInstance = new this({});
            tempInstance.getElementFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al obtener elemento',
                getErrorMessage(error),
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }

    /**
     * Retrieves a list of entities from the API
     * Executes afterGetElementList lifecycle hook on first entity if present
     * @param filter Optional filter string to apply to the query
     * @returns Promise resolving to array of entity instances
     * @throws Error if ApiEndpoint not defined or API request fails
     */
    public static async getElementList<T extends BaseEntity>(
        this: ConcreteEntityClass<T>,
        filter: string = ''
    ): Promise<T[]> {
        const endpoint = this.getApiEndpoint();

        if (!endpoint) {
            throw new Error('ApiEndpoint no definido');
        }

        try {
            const response = await Application.axiosInstance.get(endpoint, { params: { filter } });
            const instances = (response.data as unknown[]).map((item: unknown) => {
                const mappedData = this.mapFromPersistentKeys(item as EntityData);
                return new this(mappedData);
            });
            if (instances.length > 0) {
                instances[0].afterGetElementList();
            }
            return instances;
        } catch (error: unknown) {
            const tempInstance = new this({});
            tempInstance.getElementListFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al obtener lista',
                getErrorMessage(error),
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }
}

/**
 * Empty entity implementation representing null entity pattern
 * Returns true for isNull() to indicate non-existence
 */
export class EmptyEntity extends BaseEntity {
    /**
     * Indicates this is an empty/null entity
     * @returns Always returns true
     */
    override isNull(): boolean {
        return true;
    }
}
