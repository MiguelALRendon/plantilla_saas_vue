/**
 * Symbol key used to store module name metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export const MODULE_NAME_KEY = Symbol('module_name');

/**
 * Decorator that defines the human-readable display name for an entity module.
 * 
 * This decorator is **MANDATORY** for all entities. It specifies the name shown in
 * navigation menus, page titles, breadcrumbs, and throughout the UI. Should be
 * a user-friendly singular noun in the application's language.
 * 
 * @param {string} name - The display name for the module (e.g., 'Usuario', 'Producto', 'Categoría')
 * @returns {ClassDecorator} A class decorator function that attaches module name metadata
 * 
 * @example
 * ```typescript
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto') // Required!
 * @ModuleIcon(Icons.PRODUCT)
 * export class Producto extends BaseEntity {
 *   // Module will appear as "Producto" in the UI
 * }
 * ```
 * 
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 * @see {@link 03-QUICK-START.md | Quick Start §2.1}
 */
export function ModuleName(name: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_NAME_KEY] = name;
    };
}
