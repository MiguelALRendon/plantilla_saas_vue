import type { Component } from 'vue';

/**
 * Symbol key used to store custom Vue components metadata on decorated modules.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export const MODULE_CUSTOM_COMPONENTS_KEY = Symbol('module_custom_components');

/**
 * Decorator that registers custom Vue components for specific entity properties.
 *
 * This decorator allows replacing default auto-generated input components with
 * custom Vue components for individual properties. The Map keys are property names,
 * and values are the corresponding Vue Component definitions.
 *
 * @param {Map<string, Component>} components - Map of property names to custom Vue Component instances
 * @returns {ClassDecorator} A class decorator function that attaches custom components metadata
 *
 * @example
 * ```typescript
 * import CustomColorPicker from './CustomColorPicker.vue';
 * import RichTextEditor from './RichTextEditor.vue';
 *
 * @ApiEndpoint('/productos')
 * @ModuleName('Producto')
 * @ModuleCustomComponents(new Map([
 *   ['color', CustomColorPicker],
 *   ['descripcionHTML', RichTextEditor]
 * ]))
 * export class Producto extends BaseEntity {
 *   @PropertyName('Color')
 *   color: string = '';
 * }
 * ```
 *
 * @see {@link advanced-module-example.md | Advanced Module Example §4}
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.3}
 */
export function ModuleCustomComponents(components: Map<string, Component>): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[MODULE_CUSTOM_COMPONENTS_KEY] = components;
    };
}
