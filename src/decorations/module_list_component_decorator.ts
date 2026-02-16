import type { Component } from 'vue';

/**
 * Symbol key used to store list component metadata on decorated modules.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export const MODULE_LIST_COMPONENT_KEY = Symbol('module_list_component');

/**
 * Decorator that specifies a custom Vue component for the entity's list/table view.
 *
 * This decorator replaces the default auto-generated data table with a custom Vue component.
 * Use this when you need custom list layouts, card views, kanban boards, or any specialized
 * presentation beyond the standard table format.
 *
 * @param {Component} component - The Vue Component to use for the list view
 * @returns {ClassDecorator} A class decorator function that attaches list component metadata
 *
 * @example
 * ```typescript
 * import ProductoCardGrid from './ProductoCardGrid.vue';
 *
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto')
 * @ModuleListComponent(ProductoCardGrid)
 * export class Producto extends BaseEntity {
 *   // Uses ProductoCardGrid.vue instead of default table view
 * }
 * ```
 *
 * @see {@link advanced-module-example.md | Advanced Module Example §3}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export function ModuleListComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_LIST_COMPONENT_KEY] = component;
    };
}
