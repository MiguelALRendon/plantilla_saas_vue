/**
 * Symbol key used to store max file size metadata on decorated properties.
 */
export const MAX_SIZE_FILES_KEY = Symbol('max_size_files');

/**
 * Decorator that defines the maximum allowed file size in megabytes for a file upload property.
 *
 * @param {number} size - Maximum file size in megabytes (e.g. 5 for 5 MB)
 * @returns {PropertyDecorator}
 *
 * @example
 * ```typescript
 * export class Document extends BaseEntity {
 *   @PropertyName('Archivo')
 *   @MaxSizeFiles(10)
 *   @StringTypeDef(StringType.FILE)
 *   archivo: string = '';
 * }
 * ```
 */
export function MaxSizeFiles(size: number): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[MAX_SIZE_FILES_KEY]) {
            proto[MAX_SIZE_FILES_KEY] = {};
        }
        proto[MAX_SIZE_FILES_KEY][propertyKey] = size;
    };
}
