/**
 * Symbol key used to store unique property identifier metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2.3}
 */
export const UNIQUE_KEY = Symbol('unique_property');

/**
 * Decorator that designates which property serves as a unique identifier (alternative to primary key).
 * 
 * This decorator marks a property as having unique values across all entity instances,
 * typically used for business keys like SKU codes, email addresses, or serial numbers.
 * Different from @PrimaryProperty, which defines the technical primary key.
 * 
 * @param {string} propertyName - The name of the property that must have unique values (must match an existing property key)
 * @returns {ClassDecorator} A class decorator function that attaches unique property metadata
 * 
 * @example
 * ```typescript
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto')
 * @PrimaryProperty('id') // Technical primary key
 * @UniquePropertyKey('sku') // Business unique key
 * export class Producto extends BaseEntity {
 *   @PropertyName('ID', Number)
 *   id: number = 0;
 * 
 *   @PropertyName('SKU', String)
 *   sku: string = ''; // Must be unique across all products
 * }
 * ```
 * 
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2}
 * @see {@link 02-VALIDATIONS.md | Validation Tutorial §2.5}
 */
export function UniquePropertyKey(propertyName: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[UNIQUE_KEY] = propertyName;
    };
}
