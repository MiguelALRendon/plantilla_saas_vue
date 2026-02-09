export const ASYNC_VALIDATION_KEY = Symbol('async_validation');

export interface AsyncValidationMetadata {
    condition: (entity: any) => Promise<boolean>;
    message?: string;
}

export function AsyncValidation(
    condition: (entity: any) => Promise<boolean>,
    message?: string
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[ASYNC_VALIDATION_KEY]) {
            proto[ASYNC_VALIDATION_KEY] = {};
        }
        proto[ASYNC_VALIDATION_KEY][propertyKey] = { condition, message };
    };
}
