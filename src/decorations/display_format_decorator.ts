/**
 * Symbol key used to store display format metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const DISPLAY_FORMAT_KEY = Symbol('display_format');

/**
 * Type definition for display format functions that transform raw values to display strings.
 */
export type DisplayFormatFunction = (value: any) => string;

/**
 * Type definition for display format values: static template string or dynamic function.
 */
export type DisplayFormatValue = string | DisplayFormatFunction;

/**
 * Decorator that defines how a property value should be formatted for display in UI views.
 * 
 * This decorator enables custom formatting for dates, numbers, currencies, or any value
 * that requires transformation for presentation. Supports both template strings and
 * custom formatter functions.
 * 
 * @param {DisplayFormatValue} format - Template string or function to format the property value
 * @returns {PropertyDecorator} A property decorator function that attaches display format metadata
 * 
 * @example
 * ```typescript
 * export class Producto extends BaseEntity {
 *   @PropertyName('Precio')
 *   @DisplayFormat((val: number) => `$${val.toFixed(2)}`)
 *   precio: number = 0;
 * 
 *   @PropertyName('Fecha Creación')
 *   @DisplayFormat((val: Date) => val.toLocaleDateString('es-MX'))
 *   fechaCreacion: Date = new Date();
 * }
 * ```
 * 
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.4}
 */
export function DisplayFormat(format: DisplayFormatValue): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[DISPLAY_FORMAT_KEY]) {
            proto[DISPLAY_FORMAT_KEY] = {};
        }
        proto[DISPLAY_FORMAT_KEY][propertyKey] = format;
    };
}
