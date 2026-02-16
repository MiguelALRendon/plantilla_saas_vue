import type { Component } from 'vue';

/**
 * Symbol key used to store default component metadata on decorated modules.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export const MODULE_DEFAULT_COMPONENT_KEY = Symbol('module_default_component');

/**
 * Decorator that specifies the default landing component for an entity module.
 *
 * This decorator defines which Vue component to show when navigating to the entity's
 * base route. If not specified, the framework uses the default list view. Useful for
 * modules that need custom dashboards or alternative entry points.
 *
 * @param {Component} component - The Vue Component to use as the module's default view
 * @returns {ClassDecorator} A class decorator function that attaches default component metadata
 *
 * @example
 * ```typescript
 * import ProductoDashboard from './ProductoDashboard.vue';
 *
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto')
 * @ModuleDefaultComponent(ProductoDashboard)
 * export class Producto extends BaseEntity {
 *   // Shows ProductoDashboard.vue when navigating to /productos
 * }
 * ```
 *
 * @see {@link advanced-module-example.md | Advanced Module Example §3}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export function ModuleDefaultComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[MODULE_DEFAULT_COMPONENT_KEY] = component;
    };
}
