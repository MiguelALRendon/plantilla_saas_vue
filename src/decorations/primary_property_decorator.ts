/**
 * Symbol key used to store primary property metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.3}
 */
export const PRIMARY_PROPERTY_KEY = Symbol('primary_property');

/**
 * Decorator that designates which property serves as the unique identifier for an entity.
 *
 * This decorator marks a property (typically 'id' or a unique code) as the primary key.
 * The primary property is used for record identification, routing parameters, and ensuring
 * entity uniqueness in collections. If not explicitly set, the framework looks for an 'id'
 * property by default.
 *
 * @param {string} propertyName - The name of the property to use as primary key (must match an existing property key)
 * @returns {ClassDecorator} A class decorator function that attaches primary property metadata
 *
 * @example
 * ```typescript
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto')
 * @PrimaryProperty('codigo') // Use 'codigo' instead of 'id' as primary key
 * export class Producto extends BaseEntity {
 *   @PropertyName('Código')
 *   codigo: string = '';
 *
 *   @PropertyName('Nombre')
 *   nombre: string = '';
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.2}
 */
export function PrimaryProperty(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[PRIMARY_PROPERTY_KEY] = propertyName;
    };
}
