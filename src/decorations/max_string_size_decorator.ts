/**
 * Symbol key used to store maximum total string size metadata on decorated properties.
 */
export const MAX_STRING_SIZE_KEY = Symbol('max_string_size');

/**
 * Decorator that limits the total character length of the comma-joined tag string.
 *
 * @param {number} n - Maximum total characters for the full comma-separated string
 * @returns {PropertyDecorator}
 *
 * @example
 * ```typescript
 * export class Post extends BaseEntity {
 *   @PropertyName('Etiquetas')
 *   @MaxStringSize(200)
 *   @StringTypeDef(StringType.TAGS)
 *   tags: string = '';
 * }
 * ```
 */
export function MaxStringSize(n: number): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[MAX_STRING_SIZE_KEY]) {
            proto[MAX_STRING_SIZE_KEY] = {};
        }
        proto[MAX_STRING_SIZE_KEY][propertyKey] = n;
    };
}
