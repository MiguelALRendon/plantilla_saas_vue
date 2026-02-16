import { StringType } from '@/enums/string_type';

/**
 * Symbol key used to store string type metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const STRING_TYPE_KEY = Symbol('string_type');

/**
 * Decorator that specifies the input type for string properties in forms.
 *
 * This decorator controls which HTML input type is rendered for a string property,
 * enabling specialized inputs like email fields, password fields, or URLs with
 * appropriate browser validation and keyboard layouts.
 *
 * @param {StringType} stringType - The string type enum value (e.g., StringType.EMAIL, StringType.PASSWORD, StringType.URL)
 * @returns {PropertyDecorator} A property decorator function that attaches string type metadata
 *
 * @example
 * ```typescript
 * import { StringType } from '@/enums/string_type';
 *
 * export class Usuario extends BaseEntity {
 *   @PropertyName('Email', String)
 *   @StringTypeDef(StringType.EMAIL)
 *   email: string = '';
 *
 *   @PropertyName('Contraseña', String)
 *   @StringTypeDef(StringType.PASSWORD)
 *   password: string = '';
 *
 *   @PropertyName('Sitio Web', String)
 *   @StringTypeDef(StringType.URL)
 *   sitioWeb: string = '';
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.4}
 */
export function StringTypeDef(stringType: StringType): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[STRING_TYPE_KEY]) {
            proto[STRING_TYPE_KEY] = {};
        }
        proto[STRING_TYPE_KEY][propertyKey] = stringType;
    };
}
