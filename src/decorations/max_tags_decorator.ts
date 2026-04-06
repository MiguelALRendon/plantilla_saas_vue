/**
 * Symbol key used to store maximum tag count metadata on decorated properties.
 */
export const MAX_TAGS_KEY = Symbol('max_tags');

/**
 * Decorator that limits the number of tags allowed on a tag input property.
 *
 * @param {number} n - Maximum number of tags permitted
 * @returns {PropertyDecorator}
 *
 * @example
 * ```typescript
 * export class Post extends BaseEntity {
 *   @PropertyName('Etiquetas')
 *   @MaxTags(10)
 *   @StringTypeDef(StringType.TAGS)
 *   tags: string = '';
 * }
 * ```
 */
export function MaxTags(n: number): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[MAX_TAGS_KEY]) {
            proto[MAX_TAGS_KEY] = {};
        }
        proto[MAX_TAGS_KEY][propertyKey] = n;
    };
}
