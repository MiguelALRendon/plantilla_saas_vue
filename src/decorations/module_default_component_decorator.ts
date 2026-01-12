import type { Component } from 'vue';

export const MODULE_DEFAULT_COMPONENT_KEY = Symbol('module_default_component');

export function ModuleDefaultComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_DEFAULT_COMPONENT_KEY] = component;
    };
}
