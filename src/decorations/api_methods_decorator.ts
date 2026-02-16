/**
 * Symbol key used to store HTTP methods metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2.2}
 */
export const API_METHODS_KEY = Symbol('api_methods');

/**
 * Type definition for standard HTTP request methods supported by the framework.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Decorator that specifies which HTTP methods are allowed for an entity's API operations.
 * 
 * This decorator restricts the available CRUD operations by defining which HTTP verbs
 * the application layer can use when interacting with the entity's API endpoint.
 * 
 * @param {HttpMethod[]} methods - Array of allowed HTTP methods for this entity
 * @returns {ClassDecorator} A class decorator function that attaches HTTP methods metadata
 * 
 * @example
 * ```typescript
 * @ApiEndpoint('/productos')
 * @ApiMethods(['GET', 'POST', 'PUT']) // No DELETE allowed
 * @ModuleName('Producto')
 * export class Producto extends BaseEntity {
 *   // Read-only entities might use: @ApiMethods(['GET'])
 * }
 * ```
 * 
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2}
 * @see {@link 02-FLOW-ARCHITECTURE.md | Architecture Flow §4.1}
 */
export function ApiMethods(methods: HttpMethod[]): ClassDecorator {
    return function (target: Function) {
        (target as any)[API_METHODS_KEY] = methods;
    };
}
