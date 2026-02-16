export const VIEW_GROUP_KEY = Symbol('view_group');

export function ViewGroup(groupName: string): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[VIEW_GROUP_KEY]) {
            proto[VIEW_GROUP_KEY] = {};
        }
        proto[VIEW_GROUP_KEY][propertyKey] = groupName;
    };
}
