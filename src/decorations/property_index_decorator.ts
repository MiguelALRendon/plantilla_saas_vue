/**
 * Symbol key used to store property display order metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.4}
 */
export const PROPERTY_INDEX_KEY = Symbol('property_index');

/**
 * Decorator that controls the display order of properties in auto-generated UI views.
 *
 * This decorator assigns an explicit sort index to a property, determining its position
 * in forms, tables, and other views. Lower index values appear first. If not specified,
 * properties appear in their class declaration order. Useful for reordering without
 * restructuring the class definition.
 *
 * @param {number} index - The sort order index (0-based, lower numbers appear first)
 * @returns {PropertyDecorator} A property decorator function that attaches property index metadata
 *
 * @example
 * ```typescript
 * export class Producto extends BaseEntity {
 *   @PropertyName('Nombre')
 *   @PropertyIndex(0) // Show first
 *   nombre: string = '';
 *
 *   @PropertyName('Precio')
 *   @PropertyIndex(2)
 *   precio: number = 0;
 *
 *   @PropertyName('Código')
 *   @PropertyIndex(1) // Show second, even though declared last
 *   codigo: string = '';
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.4}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.6}
 */
export function PropertyIndex(index: number): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[PROPERTY_INDEX_KEY]) {
            proto[PROPERTY_INDEX_KEY] = {};
        }
        proto[PROPERTY_INDEX_KEY][propertyKey] = index;
    };
}
