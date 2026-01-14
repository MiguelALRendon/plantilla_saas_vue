export const PROPERTY_NAME_KEY = Symbol('property_name');

export function PropertyName(name: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[PROPERTY_NAME_KEY]) {
            proto[PROPERTY_NAME_KEY] = {};
        }
        proto[PROPERTY_NAME_KEY][propertyKey] = name;
    };
}