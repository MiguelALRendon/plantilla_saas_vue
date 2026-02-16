/**
 * Symbol key used to store API endpoint metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2.2}
 */
export const API_ENDPOINT_KEY = Symbol('api_endpoint');

/**
 * Decorator that defines the base API endpoint path for an entity class.
 *
 * This decorator stores metadata that the application layer uses to construct
 * the full REST API URL for CRUD operations on the decorated entity.
 *
 * @param {string} path - The base URL path segment for this entity's API endpoint (e.g., '/usuarios', '/productos')
 * @returns {ClassDecorator} A class decorator function that attaches endpoint metadata
 *
 * @example
 * ```typescript
 * @ApiEndpoint('/usuarios')
 * @ModuleName('Usuario')
 * export class Usuario extends BaseEntity {
 *   // Entity properties...
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2}
 * @see {@link 02-FLOW-ARCHITECTURE.md | Architecture Flow §4.1}
 */
export function ApiEndpoint(path: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[API_ENDPOINT_KEY] = path;
    };
}
