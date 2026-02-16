/**
 * Symbol key used to store CSS column class metadata on decorated properties.
 * @see {@link 04-UI-DESIGN-SYSTEM-CONTRACT.md | UI Design System §6.13}
 */
export const CSS_COLUMN_CLASS_KEY = Symbol('css_column_class');

/**
 * Decorator that applies custom CSS classes to table columns in list views.
 *
 * This decorator allows fine-grained control over column presentation by attaching
 * CSS classes that modify width, alignment, or styling of specific columns in
 * auto-generated data tables.
 *
 * @param {string} cssClass - The CSS class name to apply to the column (e.g., 'col-narrow', 'col-wide', 'text-right')
 * @returns {PropertyDecorator} A property decorator function that attaches CSS class metadata
 *
 * @example
 * ```typescript
 * export class Producto extends BaseEntity {
 *   @PropertyName('Código')
 *   @CSSColumnClass('col-narrow text-center')
 *   codigo: string = '';
 *
 *   @PropertyName('Precio')
 *   @CSSColumnClass('col-medium text-right')
 *   precio: number = 0;
 * }
 * ```
 *
 * @see {@link 04-UI-DESIGN-SYSTEM-CONTRACT.md | UI Design System §6.13}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.4}
 */
export function CSSColumnClass(cssClass: string): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[CSS_COLUMN_CLASS_KEY]) {
            proto[CSS_COLUMN_CLASS_KEY] = {};
        }
        proto[CSS_COLUMN_CLASS_KEY][propertyKey] = cssClass;
    };
}
