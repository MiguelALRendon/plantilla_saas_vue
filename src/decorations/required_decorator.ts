export const REQUIRED_KEY = Symbol('required');

export type RequiredCondition = boolean | ((instance: any) => boolean);

export interface RequiredMetadata {
    condition?: RequiredCondition;
    message?: string;
    validation?: RequiredCondition;
}

export function Required(conditionOrValidation: RequiredCondition, message?: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[REQUIRED_KEY]) {
            proto[REQUIRED_KEY] = {};
        }
        
        const metadata: RequiredMetadata = message !== undefined 
            ? { condition: conditionOrValidation, message: message }
            : { validation: conditionOrValidation };
        
        proto[REQUIRED_KEY][propertyKey] = metadata;
    };
}
