export const PERSISTENT_KEY = Symbol('persistent');

export function Persistent(): ClassDecorator {
    return function (target: Function) {
        (target as any)[PERSISTENT_KEY] = true;
    };
}
