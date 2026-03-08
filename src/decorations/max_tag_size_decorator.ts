/**
 * Symbol key used to store maximum individual tag size metadata on decorated properties.
 */
export const MAX_TAG_SIZE_KEY = Symbol('max_tag_size');

/**
 * Decorator that limits the maximum character length of each individual tag.
 *
 * @param {number} n - Maximum characters per tag
 * @returns {PropertyDecorator}
 *
 * @example
 * ```typescript
 * export class Post extends BaseEntity {
 *   @PropertyName('Etiquetas')
 *   @MaxTagSize(20)
 *   @StringTypeDef(StringType.TAGS)
 *   tags: string = '';
 * }
 * ```
 */
export function MaxTagSize(n: number): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[MAX_TAG_SIZE_KEY]) {
            proto[MAX_TAG_SIZE_KEY] = {};
        }
        proto[MAX_TAG_SIZE_KEY][propertyKey] = n;
    };
}
