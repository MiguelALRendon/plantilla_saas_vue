import type { Component } from 'vue';

export const MODULE_CUSTOM_COMPONENTS_KEY = Symbol('module_custom_components');

export function ModuleCustomComponents(components: Map<string, Component>): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_CUSTOM_COMPONENTS_KEY] = components;
    };
}
