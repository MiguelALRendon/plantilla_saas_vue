/**
 * Symbol key used to store default display property metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.3}
 */
export const DEFAULT_PROPERTY_KEY = Symbol('default_property');

/**
 * Decorator that designates which property serves as the default display representation of an entity.
 *
 * This decorator is critical for relational displays (dropdowns, selections) where the framework
 * needs to show a human-readable representation of an entity. If not specified, the framework
 * uses the primary property or falls back to the first available property.
 *
 * @param {string} propertyName - The name of the property to use as default display (must match an existing property key)
 * @returns {ClassDecorator} A class decorator function that attaches default property metadata
 *
 * @example
 * ```typescript
 * @ApiEndpoint('/usuarios')
 * @ModuleName('Usuario')
 * @DefaultProperty('nombreCompleto') // Show full name in dropdowns
 * export class Usuario extends BaseEntity {
 *   @PropertyName('Usuario')
 *   @PrimaryProperty()
 *   username: string = '';
 *
 *   @PropertyName('Nombre Completo')
 *   nombreCompleto: string = '';
 * }
 * ```
 *
 * @see {@link 03-RELATIONS.md | Relations Tutorial §2.3}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 */
export function DefaultProperty(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[DEFAULT_PROPERTY_KEY] = propertyName;
    };
}
