import type { ViewGroupRow } from '@/enums/view_group_row';

export const VIEW_GROUP_ROW_KEY = Symbol('view_group_row');

export function ViewGroupRowDecorator(rowType: ViewGroupRow): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[VIEW_GROUP_ROW_KEY]) {
            proto[VIEW_GROUP_ROW_KEY] = {};
        }
        proto[VIEW_GROUP_ROW_KEY][propertyKey] = rowType;
    };
}
