/**
 * Symbol key used to store required validation metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const REQUIRED_KEY = Symbol('required');

/**
 * Type definition for required conditions: static boolean or dynamic function.
 */
export type RequiredCondition = boolean | ((instance: any) => boolean);

/**
 * Metadata structure for required property validation.
 */
export interface RequiredMetadata {
    /** The condition determining whether the property is required */
    condition?: RequiredCondition;
    /** Optional custom error message for validation failures */
    message?: string;
    /** Alternative validation function for complex requirements */
    validation?: RequiredCondition;
}

/**
 * Decorator that marks a property as required for entity validation.
 *
 * This decorator enforces that a property must have a non-empty value before saving.
 * Supports both static requirements (always required) and dynamic requirements
 * (conditional based on entity state). Can provide custom validation messages.
 *
 * @param {RequiredCondition} conditionOrValidation - Boolean/function for requirement, or custom validation function
 * @param {string} [message] - Optional custom error message shown when validation fails
 * @returns {PropertyDecorator} A property decorator function that attaches required validation metadata
 *
 * @example
 * ```typescript
 * export class Usuario extends BaseEntity {
 *   @PropertyName('Nombre', String)
 *   @Required(true, 'El nombre es obligatorio') // Always required with custom message
 *   nombre: string = '';
 *
 *   @PropertyName('Email', String)
 *   @Required(true) // Always required, default message
 *   email: string = '';
 *
 *   @PropertyName('Teléfono Móvil', String)
 *   @Required((u: Usuario) => u.notificarSMS === true, 'Teléfono requerido para SMS')
 *   telefonoMovil: string = ''; // Required only if SMS notifications enabled
 * }
 * ```
 *
 * @see {@link 02-VALIDATIONS.md | Validation Tutorial §2}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 */
export function Required(conditionOrValidation: RequiredCondition, message?: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[REQUIRED_KEY]) {
            proto[REQUIRED_KEY] = {};
        }

        const metadata: RequiredMetadata =
            message !== undefined
                ? { condition: conditionOrValidation, message: message }
                : { validation: conditionOrValidation };

        proto[REQUIRED_KEY][propertyKey] = metadata;
    };
}
