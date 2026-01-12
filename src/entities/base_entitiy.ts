import {
    COLUMN_NAME_KEY,
    TABLE_NAME_KEY,
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
import type { StringType } from "@/enums/string_type";
import type { ViewGroupRow } from "@/enums/view_group_row";

export abstract class BaseEntity {
    [key: string]: any;
    
    constructor(data: Record<string, any>) {
        Object.assign(this, data);
    }

    public toObject(): Record<string, any> {
        return this as Record<string, any>;
    }

    public getKeys(): string[] {
        const columns = (this.constructor as typeof BaseEntity).getColumns();
        return Object.keys(columns);
    }

    public getMask(): Record<string, { mask: string; side: MaskSides }> {
        const proto = (this.constructor as any).prototype;
        return proto[MASK_KEY] || {};
    }

    public getCSSClasses(): Record<string, string> {
        const proto = (this.constructor as any).prototype;
        return proto[CSS_COLUMN_CLASS_KEY] || {};
    }

    public static getTableName(): string | undefined {
        return (this as any)[TABLE_NAME_KEY];
    }

    public static getColumns(): Record<string, string> {
        const proto = this.prototype as any;
        return proto[COLUMN_NAME_KEY] || {};
    }

    public static getColumnName<T extends BaseEntity>(selector: (entity: T) => any): string | undefined {
        const columns = this.getColumns();
        const proxy = new Proxy({}, {
            get(prop) {
                return prop;
            }
        });
        const propertyName = selector(proxy as T) as string;
        return columns[propertyName];
    }

    public static getColumnNameByKey(propertyKey: string): string | undefined {
        const columns = this.getColumns();
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
        return (this as any)[MODULE_LIST_COMPONENT_KEY] || DefaultDetailView;
    }

    public static getModuleDetailComponent(): Component {
        return (this as any)[MODULE_DETAIL_COMPONENT_KEY] || DefaultDetailView;
    }

    public static getModuleDefaultComponent(): Component {
        return (this as any)[MODULE_DEFAULT_COMPONENT_KEY] || DefaultDetailView;
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
        return proto[STRING_TYPE_KEY] || {};
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