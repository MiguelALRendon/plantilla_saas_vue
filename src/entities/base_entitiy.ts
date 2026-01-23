import {
    PROPERTY_NAME_KEY,
    PROPERTY_TYPE_KEY,
    ARRAY_ELEMENT_TYPE_KEY,
    MASK_KEY,
    CSS_COLUMN_CLASS_KEY,
    DEFAULT_PROPERTY_KEY,
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
} from "@/decorations";
import DefaultDetailView from "@/views/default_detailview.vue";
import type { Component } from 'vue';
import type { MaskSides } from "@/enums/mask_sides";
import { StringType } from "@/enums/string_type";
import type { ViewGroupRow } from "@/enums/view_group_row";
import DefaultListview from "@/views/default_listview.vue";

export abstract class BaseEntity {
    [key: string]: any;

    isNull(): boolean {
        return false;
    }
    
    constructor(data: Record<string, any>) {
        Object.assign(this, data);
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
}

export class EmptyEntity extends BaseEntity {
    override isNull(): boolean {
        return true;
    }
}