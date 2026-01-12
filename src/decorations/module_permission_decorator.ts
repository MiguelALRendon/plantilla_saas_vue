export const MODULE_PERMISSION_KEY = Symbol('module_permission');

export function ModulePermission(permission: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_PERMISSION_KEY] = permission;
    };
}
