import type { Component } from 'vue';

/**
 * Symbol key used to store detail component metadata on decorated modules.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export const MODULE_DETAIL_COMPONENT_KEY = Symbol('module_detail_component');

/**
 * Decorator that specifies a custom Vue component for the entity's detail/edit view.
 *
 * This decorator replaces the default auto-generated form with a custom Vue component.
 * Use this when the default detail view is insufficient for complex editing requirements
 * or when a specialized UI layout is needed.
 *
 * @param {Component} component - The Vue Component to use for the detail/edit view
 * @returns {ClassDecorator} A class decorator function that attaches detail component metadata
 *
 * @example
 * ```typescript
 * import CustomProductoForm from './CustomProductoForm.vue';
 *
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto')
 * @ModuleDetailComponent(CustomProductoForm)
 * export class Producto extends BaseEntity {
 *   // Uses CustomProductoForm.vue instead of default detail view
 * }
 * ```
 *
 * @see {@link advanced-module-example.md | Advanced Module Example §3}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export function ModuleDetailComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_DETAIL_COMPONENT_KEY] = component;
    };
}
