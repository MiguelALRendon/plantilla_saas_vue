export const DEFAULT_PROPERTY_KEY = Symbol('default_property');

export function DefaultProperty(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[DEFAULT_PROPERTY_KEY] = propertyName;
    };
}
