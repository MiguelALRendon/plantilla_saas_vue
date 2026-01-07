export const COLUMN_NAME_KEY = Symbol('column_name');

export function Column(name: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[COLUMN_NAME_KEY]) {
            proto[COLUMN_NAME_KEY] = {};
        }
        proto[COLUMN_NAME_KEY][propertyKey] = name;
    };
}