/**
 * Symbol key used to store module icon metadata on decorated classes.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export const MODULE_ICON_KEY = Symbol('module_icon');

/**
 * Decorator that assigns an icon identifier to an entity module for UI navigation.
 *
 * This decorator specifies which icon to display in the sidebar navigation, breadcrumbs,
 * and module headers. The icon string should match an entry in the framework's icon
 * constants (e.g., from @/constants/icons.ts or @/constants/ggicons.ts).
 *
 * @param {string} icon - The icon identifier string (e.g., 'product', 'user', 'settings')
 * @returns {ClassDecorator} A class decorator function that attaches module icon metadata
 *
 * @example
 * ```typescript
 * import { Icons } from '@/constants/icons';
 *
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto')
 * @ModuleIcon(Icons.PRODUCT)
 * export class Producto extends BaseEntity {
 *   // Sidebar will show the product icon for this module
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 * @see {@link 03-QUICK-START.md | Quick Start §2.2}
 */
export function ModuleIcon(icon: string): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[MODULE_ICON_KEY] = icon;
    };
}
