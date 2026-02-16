/**
 * Symbol key used to store synchronous validation metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const VALIDATION_KEY = Symbol('validation');

/**
 * Type definition for validation conditions: static boolean or dynamic function.
 */
export type ValidationCondition<T = unknown> = boolean | ((instance: T) => boolean);

/**
 * Metadata structure for synchronous property validation.
 */
export interface ValidationMetadata {
    /** The validation condition that must evaluate to true for the property to be valid */
    condition: ValidationCondition;
    /** The error message to display when validation fails */
    message: string;
}

/**
 * Decorator that adds synchronous validation logic to an entity property.
 *
 * This decorator enables custom validation rules beyond basic required checks.
 * The validation runs synchronously during entity save operations. For async validations
 * (e.g., checking uniqueness via API), use @AsyncValidation instead.
 *
 * @param {ValidationCondition} condition - Boolean or function returning boolean; must evaluate to true for valid state
 * @param {string} message - Error message displayed when validation fails
 * @returns {PropertyDecorator} A property decorator function that attaches validation metadata
 *
 * @example
 * ```typescript
 * export class Producto extends BaseEntity {
 *   @PropertyName('Precio', Number)
 *   @Validation(
 *     (p: Producto) => p.precio > 0,
 *     'El precio debe ser mayor a cero'
 *   )
 *   precio: number = 0;
 *
 *   @PropertyName('Descuento', Number)
 *   @Validation(
 *     (p: Producto) => p.descuento >= 0 && p.descuento <= 100,
 *     'El descuento debe estar entre 0 y 100'
 *   )
 *   descuento: number = 0;
 * }
 * ```
 *
 * @see {@link 02-VALIDATIONS.md | Validation Tutorial §2.2}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 */
export function Validation<T = unknown>(condition: ValidationCondition<T>, message: string): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
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
