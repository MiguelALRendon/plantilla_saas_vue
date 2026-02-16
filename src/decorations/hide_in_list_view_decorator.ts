/**
 * Symbol key used to store hide-in-list-view metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.4}
 */
export const HIDE_IN_LIST_VIEW_KEY = Symbol('hide_in_list_view');

/**
 * Decorator that excludes a property from being displayed in list/table views.
 *
 * This decorator prevents the property from appearing as a column in the auto-generated
 * data table. Useful for lengthy text fields, sensitive data, or properties only relevant
 * in detail views.
 *
 * @returns {PropertyDecorator} A property decorator function that marks the property as hidden in list views
 *
 * @example
 * ```typescript
 * export class Producto extends BaseEntity {
 *   @PropertyName('Descripción Completa')
 *   @HideInListView() // Too long for table column
 *   descripcion: string = '';
 *
 *   @PropertyName('Notas Internas')
 *   @HideInListView() // Only show in detail view
 *   notasInternas: string = '';
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.4}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.5}
 */
export function HideInListView(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[HIDE_IN_LIST_VIEW_KEY]) {
            proto[HIDE_IN_LIST_VIEW_KEY] = {};
        }

        proto[HIDE_IN_LIST_VIEW_KEY][propertyKey] = true;
    };
}
