export const NOT_REQUIRES_LOGIN_KEY: unique symbol = Symbol('not_requires_login');

export function NotRequiresLogin(): ClassDecorator {
    return function (target: Function): void {
        (target as unknown as Record<PropertyKey, unknown>)[NOT_REQUIRES_LOGIN_KEY] = true;
    };
}
