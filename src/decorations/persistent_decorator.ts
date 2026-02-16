/**
 * Symbol key used to store persistence metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2}
 */
export const PERSISTENT_KEY = Symbol('persistent');

/**
 * Decorator that marks an entity class as persistable/serializable.
 *
 * This decorator indicates that the entity's instances can be persisted (saved to backend,
 * cached, or stored locally). Entities marked as persistent are eligible for CRUD operations
 * and state management. Most entities should use this decorator unless they are purely
 * computational or transient data structures.
 *
 * @returns {ClassDecorator} A class decorator function that marks the class as persistent
 *
 * @example
 * ```typescript
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto')
 * @Persistent() // This entity can be saved, updated, deleted
 * export class Producto extends BaseEntity {
 *   // Properties...
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.1}
 */
export function Persistent(): ClassDecorator {
    return function (target: Function) {
        (target as any)[PERSISTENT_KEY] = true;
    };
}
