export const VALIDATION_KEY = Symbol('validation');

export type ValidationCondition = boolean | ((instance: any) => boolean);

export interface ValidationMetadata {
    condition: ValidationCondition;
    message: string;
}

export function Validation(condition: ValidationCondition, message: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[VALIDATION_KEY]) {
            proto[VALIDATION_KEY] = {};
        }
        
        proto[VALIDATION_KEY][propertyKey] = {
            condition: condition,
            message: message
        };
    };
}
