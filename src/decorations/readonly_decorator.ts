export const READONLY_KEY = Symbol('readonly');

export type ReadOnlyCondition = boolean | ((instance: any) => boolean);

export interface ReadOnlyMetadata {
    condition: ReadOnlyCondition;
}

export function ReadOnly(condition: ReadOnlyCondition = true): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[READONLY_KEY]) {
            proto[READONLY_KEY] = {};
        }
        
        proto[READONLY_KEY][propertyKey] = {
            condition: condition
        };
    };
}
