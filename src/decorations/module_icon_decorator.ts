export const MODULE_ICON_KEY = Symbol('module_icon');

export function ModuleIcon(icon: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_ICON_KEY] = icon;
    };
}
