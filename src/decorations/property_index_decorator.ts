export const PROPERTY_INDEX_KEY = Symbol('property_index');

export function PropertyIndex(index: number): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[PROPERTY_INDEX_KEY]) {
            proto[PROPERTY_INDEX_KEY] = {};
        }
        proto[PROPERTY_INDEX_KEY][propertyKey] = index;
    };
}
