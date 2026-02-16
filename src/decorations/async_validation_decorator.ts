/**
 * Symbol key used to store asynchronous validation metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const ASYNC_VALIDATION_KEY = Symbol('async_validation');

/**
 * Metadata structure for asynchronous property validation.
 */
export interface AsyncValidationMetadata {
    /** Async function that returns true if validation passes, false otherwise */
    condition: (entity: any) => Promise<boolean>;
    /** Optional custom error message shown when validation fails */
    message?: string;
}

/**
 * Decorator that adds asynchronous validation logic to an entity property.
 *
 * This decorator enables server-side or complex validation rules that require
 * async operations (e.g., checking uniqueness via API, validating external resources).
 * The validation runs during entity save operations.
 *
 * @param {(entity: any) => Promise<boolean>} condition - Async validation function receiving the full entity instance
 * @param {string} [message] - Optional custom error message for validation failures
 * @returns {PropertyDecorator} A property decorator function that attaches async validation metadata
 *
 * @example
 * ```typescript
 * export class Usuario extends BaseEntity {
 *   @PropertyName('Email')
 *   @AsyncValidation(
 *     async (u: Usuario) => {
 *       const exists = await checkEmailExists(u.email);
 *       return !exists;
 *     },
 *     'El email ya está registrado'
 *   )
 *   email: string = '';
 * }
 * ```
 *
 * @see {@link 02-VALIDATIONS.md | Validation Tutorial §3}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 */
export function AsyncValidation(condition: (entity: any) => Promise<boolean>, message?: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[ASYNC_VALIDATION_KEY]) {
            proto[ASYNC_VALIDATION_KEY] = {};
        }
        proto[ASYNC_VALIDATION_KEY][propertyKey] = { condition, message };
    };
}
