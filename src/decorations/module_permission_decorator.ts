/**
 * Symbol key used to store module permission metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export const MODULE_PERMISSION_KEY = Symbol('module_permission');

/**
 * Decorator that specifies the permission identifier required to access an entity module.
 *
 * This decorator integrates with the application's role-based access control (RBAC) system.
 * Users must have the specified permission in their role to view or interact with the module.
 * If not specified, the module is accessible to all authenticated users.
 *
 * @param {string} permission - The permission identifier string (e.g., 'productos.read', 'admin.usuarios')
 * @returns {ClassDecorator} A class decorator function that attaches module permission metadata
 *
 * @example
 * ```typescript
 * @ApiEndpoint('/usuarios')
 * @ModuleName('Usuario')
 * @ModulePermission('admin.usuarios')
 * export class Usuario extends BaseEntity {
 *   // Only users with 'admin.usuarios' permission can access this module
 * }
 *
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto') // No @ModulePermission = accessible to all
 * export class Producto extends BaseEntity {}
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 * @see {@link 02-FLOW-ARCHITECTURE.md | Architecture Flow §5.2}
 */
export function ModulePermission(permission: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_PERMISSION_KEY] = permission;
    };
}
