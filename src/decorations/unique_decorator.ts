export const UNIQUE_KEY = Symbol('unique_property');

export function UniquePropertyKey(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[UNIQUE_KEY] = propertyName;
    };
}
