import {
    PROPERTY_NAME_KEY,
    PROPERTY_TYPE_KEY,
    ARRAY_ELEMENT_TYPE_KEY,
    MASK_KEY,
    CSS_COLUMN_CLASS_KEY,
    DEFAULT_PROPERTY_KEY,
    PRIMARY_PROPERTY_KEY,
    UNIQUE_KEY,
    STRING_TYPE_KEY,
    VIEW_GROUP_KEY,
    VIEW_GROUP_ROW_KEY,
    MODULE_NAME_KEY,
    MODULE_PERMISSION_KEY,
    MODULE_ICON_KEY,
    MODULE_LIST_COMPONENT_KEY,
    MODULE_DETAIL_COMPONENT_KEY,
    MODULE_DEFAULT_COMPONENT_KEY,
    MODULE_CUSTOM_COMPONENTS_KEY,
    REQUIRED_KEY,
    VALIDATION_KEY,
    DISABLED_KEY,
    API_ENDPOINT_KEY,
    READONLY_KEY,
    API_METHODS_KEY,
    HIDE_IN_DETAIL_VIEW_KEY,
    HIDE_IN_LIST_VIEW_KEY,
    PERSISTENT_KEY_KEY,
} from "@/decorations";
import type { RequiredMetadata, ValidationMetadata, DisabledMetadata, ReadOnlyMetadata, HttpMethod } from "@/decorations";
import DefaultDetailView from "@/views/default_detailview.vue";
import type { Component } from 'vue';
import type { MaskSides } from "@/enums/mask_sides";
import { StringType } from "@/enums/string_type";
import type { ViewGroupRow } from "@/enums/view_group_row";
import DefaultListview from "@/views/default_listview.vue";

export abstract class BaseEntity {
    [key: string]: any;
    private _isLoading: boolean = false;

    constructor(data: Record<string, any>) {
        Object.assign(this, data);
    }

    public setLoading(): void {
        this._isLoading = true;
    }

    public loaded(): void {
        this._isLoading = false;
    }

    public getLoadingState(): boolean {
        return this._isLoading;
    }

    public validateElement(): void {
        this.onValidated;
    }

    isNull(): boolean {
        return false;
    }


    public toObject(): Record<string, any> {
        return this as Record<string, any>;
    }

    public getKeys(): string[] {
        const columns = (this.constructor as typeof BaseEntity).getProperties();
        return Object.keys(columns);
    }

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

    public getMask(): Record<string, { mask: string; side: MaskSides }> {
        const proto = (this.constructor as any).prototype;
        return proto[MASK_KEY] || {};
    }

    public getCSSClasses(): Record<string, string> {
        const proto = (this.constructor as any).prototype;
        return proto[CSS_COLUMN_CLASS_KEY] || {};
    }

    public static getAllPropertiesNonFilter(): Record<string, string> {
        const proto = this.prototype as any;
        return proto[PROPERTY_NAME_KEY] || {};
    }

    public static getProperties(): Record<string, string> {
        const proto = this.prototype as any;
        const properties = proto[PROPERTY_NAME_KEY] || {};
        const propertyTypes = this.getPropertyTypes();
        const filtered: Record<string, string> = {};
        
        for (const key of Object.keys(properties)) {
            if (propertyTypes[key] !== Array) {
                filtered[key] = properties[key];
            }
        }
        
        return filtered;
    }

    public static getPropertyTypes(): Record<string, any> {
        const proto = this.prototype as any;
        return proto[PROPERTY_TYPE_KEY] || {};
    }

    public static getPropertyType(propertyKey: string): any | undefined {
        const types = this.getPropertyTypes();
        return types[propertyKey];
    }

    public getPropertyType(propertyKey: string): any | undefined {
        return (this.constructor as typeof BaseEntity).getPropertyType(propertyKey);
    }

    public static getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined {
        const propertyType = this.getPropertyType(propertyKey);
        
        if (propertyType !== Array) {
            return undefined;
        }
        
        const proto = this.prototype as any;
        const arrayTypes = proto[ARRAY_ELEMENT_TYPE_KEY] || {};
        const entityType = arrayTypes[propertyKey];
        
        if (entityType && entityType.prototype instanceof BaseEntity) {
            return entityType;
        }
        
        return undefined;
    }

    public getArrayPropertyType(propertyKey: string): typeof BaseEntity | undefined {
        return (this.constructor as typeof BaseEntity).getArrayPropertyType(propertyKey);
    }

    public static getPropertyName<T extends BaseEntity>(selector: (entity: T) => any): string | undefined {
        const columns = this.getProperties();
        const proxy = new Proxy({}, {
            get(prop) {
                return prop;
            }
        });
        const propertyName = selector(proxy as T) as string;
        return columns[propertyName];
    }

    public static getPropertyNameByKey(propertyKey: string): string | undefined {
        const columns = this.getAllPropertiesNonFilter();
        return columns[propertyKey];
    }

    public static getCSSClasses(): Record<string, string> {
        const proto = this.prototype as any;
        return proto[CSS_COLUMN_CLASS_KEY] || {};
    }

    public static getModuleName(): string | undefined {
        return (this as any)[MODULE_NAME_KEY];
    }

    public static getModulePermission(): string | undefined {
        return (this as any)[MODULE_PERMISSION_KEY];
    }

    public static getModuleIcon(): string | undefined {
        return (this as any)[MODULE_ICON_KEY];
    }

    public static getModuleListComponent(): Component {
        return (this as any)[MODULE_LIST_COMPONENT_KEY] || DefaultListview;
    }

    public static getModuleDetailComponent(): Component {
        return (this as any)[MODULE_DETAIL_COMPONENT_KEY] || DefaultDetailView;
    }

    public static getModuleDefaultComponent(): Component {
        return (this as any)[MODULE_DEFAULT_COMPONENT_KEY] || DefaultListview;
    }

    public static getModuleCustomComponents(): Map<string, Component> | null {
        return (this as any)[MODULE_CUSTOM_COMPONENTS_KEY] || null;
    }

    public getDefaultPropertyValue(): any {
        const propertyName = (this.constructor as any)[DEFAULT_PROPERTY_KEY];
        if (!propertyName) {
            return undefined;
        }
        return (this as any)[propertyName];
    }

    public getPrimaryPropertyValue(): any {
        const propertyName = (this.constructor as any)[PRIMARY_PROPERTY_KEY];
        if (!propertyName) {
            return undefined;
        }
        return (this as any)[propertyName];
    }

    public getPrimaryPropertyKey(): string | undefined {
        return (this.constructor as any)[PRIMARY_PROPERTY_KEY];
    }

    public getUniquePropertyValue(): any {
        const propertyName = (this.constructor as any)[UNIQUE_KEY];
        if (!propertyName) {
            return undefined;
        }
        return (this as any)[propertyName];
    }

    public getUniquePropertyKey(): string | undefined {
        return (this.constructor as any)[UNIQUE_KEY];
    }

    public getStringType(): Record<string, StringType> {
        const proto = (this.constructor as any).prototype;
        const stringTypes = proto[STRING_TYPE_KEY] || {};
        const properties = (this.constructor as typeof BaseEntity).getProperties();
        const result: Record<string, StringType> = {};
        
        for (const key of Object.keys(properties)) {
            result[key] = stringTypes[key] ?? StringType.TEXT;
        }
        
        return result;
    }

    public getViewGroups(): Record<string, string> {
        const proto = (this.constructor as any).prototype;
        return proto[VIEW_GROUP_KEY] || {};
    }

    public getViewGroupRows(): Record<string, ViewGroupRow> {
        const proto = (this.constructor as any).prototype;
        return proto[VIEW_GROUP_ROW_KEY] || {};
    }

    public static createNewInstance<T extends BaseEntity>(this: new (data: Record<string, any>) => T): T {
        return new this({});
    }

    public isRequired(propertyKey: string): boolean {
        const proto = (this.constructor as any).prototype;
        const requiredFields: Record<string, RequiredMetadata> = proto[REQUIRED_KEY] || {};
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

    public requiredMessage(propertyKey: string): string | undefined {
        const proto = (this.constructor as any).prototype;
        const requiredFields: Record<string, RequiredMetadata> = proto[REQUIRED_KEY] || {};
        const metadata = requiredFields[propertyKey];
        return metadata?.message;
    }

    public isValidation(propertyKey: string): boolean {
        const proto = (this.constructor as any).prototype;
        const validationRules: Record<string, ValidationMetadata> = proto[VALIDATION_KEY] || {};
        const rule = validationRules[propertyKey];
        
        if (!rule) {
            return true;
        }
        
        return typeof rule.condition === 'function' ? rule.condition(this) : rule.condition;
    }

    public validationMessage(propertyKey: string): string | undefined {
        const proto = (this.constructor as any).prototype;
        const validationRules: Record<string, ValidationMetadata> = proto[VALIDATION_KEY] || {};
        const rule = validationRules[propertyKey];
        return rule?.message;
    }

    public isDisabled(propertyKey: string): boolean {
        const proto = (this.constructor as any).prototype;
        const disabledFields: Record<string, DisabledMetadata> = proto[DISABLED_KEY] || {};
        const metadata = disabledFields[propertyKey];
        
        if (!metadata) {
            return false;
        }
        
        return typeof metadata.condition === 'function' ? metadata.condition(this) : metadata.condition;
    }

    public static getApiEndpoint(): string | undefined {
        return (this as any)[API_ENDPOINT_KEY];
    }

    public getApiEndpoint(): string | undefined {
        return (this.constructor as typeof BaseEntity).getApiEndpoint();
    }

    public isReadOnly(propertyKey: string): boolean {
        const proto = (this.constructor as any).prototype;
        const readOnlyFields: Record<string, ReadOnlyMetadata> = proto[READONLY_KEY] || {};
        const metadata = readOnlyFields[propertyKey];
        
        if (!metadata) {
            return false;
        }
        
        return typeof metadata.condition === 'function' ? metadata.condition(this) : metadata.condition;
    }

    public static getApiMethods(): HttpMethod[] | undefined {
        return (this as any)[API_METHODS_KEY];
    }

    public getApiMethods(): HttpMethod[] | undefined {
        return (this.constructor as typeof BaseEntity).getApiMethods();
    }

    public static isApiMethodAllowed(method: HttpMethod): boolean {
        const allowedMethods = this.getApiMethods();
        if (!allowedMethods) {
            return true; // Si no se especifica, se permiten todos
        }
        return allowedMethods.includes(method);
    }

    public isApiMethodAllowed(method: HttpMethod): boolean {
        return (this.constructor as typeof BaseEntity).isApiMethodAllowed(method);
    }

    public isHideInDetailView(propertyKey: string): boolean {
        const proto = (this.constructor as any).prototype;
        const hideFields: Record<string, boolean> = proto[HIDE_IN_DETAIL_VIEW_KEY] || {};
        return hideFields[propertyKey] === true;
    }

    public isHideInListView(propertyKey: string): boolean {
        const proto = (this.constructor as any).prototype;
        const hideFields: Record<string, boolean> = proto[HIDE_IN_LIST_VIEW_KEY] || {};
        return hideFields[propertyKey] === true;
    }

    // Métodos para PersistentKey
    public static getPersistentKeys(): Record<string, string> {
        const proto = this.prototype as any;
        return proto[PERSISTENT_KEY_KEY] || {};
    }

    public static getPersistentKeyByPropertyKey(propertyKey: string): string | undefined {
        const persistentKeys = this.getPersistentKeys();
        return persistentKeys[propertyKey];
    }

    public static getPropertyKeyByPersistentKey(persistentKey: string): string | undefined {
        const persistentKeys = this.getPersistentKeys();
        for (const [key, value] of Object.entries(persistentKeys)) {
            if (value === persistentKey) {
                return key;
            }
        }
        return undefined;
    }

    public static mapToPersistentKeys<T extends BaseEntity>(this: new (...args: any[]) => T, data: Record<string, any>): Record<string, any> {
        const persistentKeys = (this as any).getPersistentKeys();
        const mapped: Record<string, any> = {};
        
        for (const [propertyKey, value] of Object.entries(data)) {
            const persistentKey = persistentKeys[propertyKey];
            mapped[persistentKey || propertyKey] = value;
        }
        
        return mapped;
    }

    public static mapFromPersistentKeys<T extends BaseEntity>(this: new (...args: any[]) => T, data: Record<string, any>): Record<string, any> {
        const mapped: Record<string, any> = {};
        
        for (const [persistentKey, value] of Object.entries(data)) {
            const propertyKey = (this as any).getPropertyKeyByPersistentKey(persistentKey);
            mapped[propertyKey || persistentKey] = value;
        }
        
        return mapped;
    }

    public getPersistentKeys(): Record<string, string> {
        return (this.constructor as typeof BaseEntity).getPersistentKeys();
    }

    public getPersistentKeyByPropertyKey(propertyKey: string): string | undefined {
        return (this.constructor as typeof BaseEntity).getPersistentKeyByPropertyKey(propertyKey);
    }

    public getPropertyKeyByPersistentKey(persistentKey: string): string | undefined {
        return (this.constructor as typeof BaseEntity).getPropertyKeyByPersistentKey(persistentKey);
    }

    public mapToPersistentKeys(data: Record<string, any>): Record<string, any> {
        return (this.constructor as any).mapToPersistentKeys(data);
    }

    public mapFromPersistentKeys(data: Record<string, any>): Record<string, any> {
        return (this.constructor as any).mapFromPersistentKeys(data);
    }

    protected onValidated?() : void;
}

export class EmptyEntity extends BaseEntity {
    override isNull(): boolean {
        return true;
    }
}