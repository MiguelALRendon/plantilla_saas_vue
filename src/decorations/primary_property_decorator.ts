export const PRIMARY_PROPERTY_KEY = Symbol('primary_property');

export function PrimaryProperty(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[PRIMARY_PROPERTY_KEY] = propertyName;
    };
}
