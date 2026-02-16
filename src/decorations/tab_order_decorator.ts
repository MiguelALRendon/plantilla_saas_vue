export const TAB_ORDER_KEY = Symbol('tab_order');

export function TabOrder(order: number): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[TAB_ORDER_KEY]) {
            proto[TAB_ORDER_KEY] = {};
        }
        proto[TAB_ORDER_KEY][propertyKey] = order;
    };
}
