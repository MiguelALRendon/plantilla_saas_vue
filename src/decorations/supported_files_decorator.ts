/**
 * Symbol key used to store supported file formats metadata on decorated properties.
 */
export const SUPPORTED_FILES_KEY = Symbol('supported_files');

/**
 * Decorator that defines the accepted file formats for a file upload property.
 *
 * @param {string[]} formats - Array of accepted MIME types or file extensions (e.g. ['image/png', '.pdf'])
 * @returns {PropertyDecorator}
 *
 * @example
 * ```typescript
 * export class Document extends BaseEntity {
 *   @PropertyName('Archivo')
 *   @SupportedFiles(['image/png', 'image/jpeg', 'application/pdf'])
 *   @StringTypeDef(StringType.FILE)
 *   archivo: string = '';
 * }
 * ```
 */
export function SupportedFiles(formats: string[]): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[SUPPORTED_FILES_KEY]) {
            proto[SUPPORTED_FILES_KEY] = {};
        }
        proto[SUPPORTED_FILES_KEY][propertyKey] = formats;
    };
}
