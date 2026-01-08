import { COLUMN_NAME_KEY } from "@/decorations/column_name_decorator";
import { TABLE_NAME_KEY } from "@/decorations/table_name_decorator";
import { MASK_KEY } from "@/decorations/mask_decorator";
import { CSS_COLUMN_CLASS_KEY } from "@/decorations/css_column_class_decorator";
import { DEFAULT_PROPERTY_KEY } from "@/decorations/default_property_decorator";
import { STRING_TYPE_KEY } from "@/decorations/string_type_decorator";
import type { MaskSides } from "@/enums/mask_sides";
import type { StringType } from "@/enums/string_type";

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
}