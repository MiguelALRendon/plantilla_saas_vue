/**
 * Symbol key used to store hide-in-detail-view metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.4}
 */
export const HIDE_IN_DETAIL_VIEW_KEY = Symbol('hide_in_detail_view');

/**
 * Decorator that excludes a property from being displayed in detail/edit views (forms).
 *
 * This decorator prevents the property from appearing in the auto-generated form UI.
 * Commonly used for internal metadata fields, foreign keys that shouldn't be directly
 * edited, or properties only relevant in list views.
 *
 * @returns {PropertyDecorator} A property decorator function that marks the property as hidden in detail views
 *
 * @example
 * ```typescript
 * export class Producto extends BaseEntity {
 *   @PropertyName('ID')
 *   @HideInDetailView() // Don't show ID in edit forms
 *   id: number = 0;
 *
 *   @PropertyName('Marca ID')
 *   @HideInDetailView() // Hide foreign key, show relation instead
 *   marcaId: number = 0;
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.4}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.5}
 */
export function HideInDetailView(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[HIDE_IN_DETAIL_VIEW_KEY]) {
            proto[HIDE_IN_DETAIL_VIEW_KEY] = {};
        }

        proto[HIDE_IN_DETAIL_VIEW_KEY][propertyKey] = true;
    };
}
