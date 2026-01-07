import { COLUMN_NAME_KEY } from "@/decorations/column_name_decorator";
import { TABLE_NAME_KEY } from "@/decorations/table_name_decorator";
import { MASK_KEY } from "@/decorations/mask_decorator";
import type { MaskSides } from "@/enums/mask_sides";

export abstract class BaseEntity {
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

    public getMask(): Record<string, { mask: string; side: MaskSides }> {
        const proto = (this.constructor as any).prototype;
        return proto[MASK_KEY] || {};
    }
}