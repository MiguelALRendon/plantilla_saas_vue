/**
 * Symbol key used to store help text metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const HELP_TEXT_KEY = Symbol('help_text');

/**
 * Decorator that provides contextual help text displayed below form input fields.
 *
 * This decorator adds instructional or explanatory text that guides users on how to
 * fill out a particular field. The help text appears as a muted message below the
 * input, improving form usability and reducing validation errors.
 *
 * @param {string} text - The help text message to display (supports plain text or HTML)
 * @returns {PropertyDecorator} A property decorator function that attaches help text metadata
 *
 * @example
 * ```typescript
 * export class Usuario extends BaseEntity {
 *   @PropertyName('Email')
 *   @HelpText('Ingrese un correo válido. Se usará para notificaciones del sistema.')
 *   email: string = '';
 *
 *   @PropertyName('Contraseña')
 *   @HelpText('Mínimo 8 caracteres, debe incluir mayúsculas y números')
 *   password: string = '';
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.3}
 */
export function HelpText(text: string): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[HELP_TEXT_KEY]) {
            proto[HELP_TEXT_KEY] = {};
        }
        proto[HELP_TEXT_KEY][propertyKey] = text;
    };
}
