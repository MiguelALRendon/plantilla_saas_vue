import { TABLE_NAME_KEY } from "@/decorations/table_name_decorator";

export abstract class BaseEntity {
    constructor(data: Record<string, any>) {
        Object.assign(this, data);
    }

    public toObject() {
        return { ...this };
    }

    public static get tableName(): string | undefined {
        return (this as any)[TABLE_NAME_KEY];
    }
}