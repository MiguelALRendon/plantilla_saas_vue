export const MODULE_NAME_KEY = Symbol('module_name');

export function ModuleName(name: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_NAME_KEY] = name;
    };
}
