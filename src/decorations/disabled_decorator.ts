export const DISABLED_KEY = Symbol('disabled');

export type DisabledCondition = boolean | ((instance: any) => boolean);

export interface DisabledMetadata {
    condition: DisabledCondition;
}

export function Disabled(condition: DisabledCondition): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[DISABLED_KEY]) {
            proto[DISABLED_KEY] = {};
        }
        
        proto[DISABLED_KEY][propertyKey] = {
            condition: condition
        };
    };
}
