import type { Component } from 'vue';

/**
 * Symbol key used to store the default-view button list metadata on decorated modules.
 */
export const MODULE_DEFAULT_VIEW_BUTTON_LIST_KEY = Symbol('module_default_view_button_list');

/**
 * Decorator that overrides the action buttons shown when a module is loaded in its
 * default view (DEFAULTVIEW). When present, `setButtonList` will apply `markRaw` to
 * each component provided here instead of falling back to the framework defaults.
 *
 * @param {Component[]} components - Ordered list of button components to render in ActionsComponent
 * @returns {ClassDecorator} A class decorator that attaches button-list metadata
 *
 * @example
 * ```typescript
 * import { DefaultButtonLists } from '@/constants/default_button_lists';
 *
 * @ModuleName('Products')
 * @DefaultViewButtonList(DefaultButtonLists.ListView)
 * export class Product extends BaseEntity { ... }
 * ```
 */
export function DefaultViewButtonList(components: Component[]): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[MODULE_DEFAULT_VIEW_BUTTON_LIST_KEY] = components;
    };
}
