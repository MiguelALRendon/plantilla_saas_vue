export const PERSISTENT_KEY_KEY = Symbol('persistent_key');

export function PersistentKey(persistentKey: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[PERSISTENT_KEY_KEY]) {
            proto[PERSISTENT_KEY_KEY] = {};
        }
        proto[PERSISTENT_KEY_KEY][propertyKey] = persistentKey;
    };
}
