/**
 * Symbol key used to store persistent key mapping metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2.3}
 */
export const PERSISTENT_KEY_KEY = Symbol('persistent_key');

/**
 * Decorator that maps a property to a different field name in the persistence layer.
 *
 * This decorator allows the entity property name to differ from the backend/database
 * field name. Useful when the API uses different naming conventions (e.g., snake_case
 * in backend, camelCase in frontend) or when you want more descriptive property names
 * in the TypeScript code.
 *
 * @param {string} persistentKey - The actual field name used in the backend/database
 * @returns {PropertyDecorator} A property decorator function that attaches persistent key mapping metadata
 *
 * @example
 * ```typescript
 * export class Usuario extends BaseEntity {
 *   @PropertyName('Nombre Completo')
 *   @PersistentKey('full_name') // Backend expects 'full_name', not 'nombreCompleto'
 *   nombreCompleto: string = '';
 *
 *   @PropertyName('Fecha Creación')
 *   @PersistentKey('created_at')
 *   fechaCreacion: Date = new Date();
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.2}
 * @see {@link 02-FLOW-ARCHITECTURE.md | Architecture Flow §4.2}
 */
export function PersistentKey(persistentKey: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[PERSISTENT_KEY_KEY]) {
            proto[PERSISTENT_KEY_KEY] = {};
        }
        proto[PERSISTENT_KEY_KEY][propertyKey] = persistentKey;
    };
}
