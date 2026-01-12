import type { Component } from 'vue';

export const MODULE_LIST_COMPONENT_KEY = Symbol('module_list_component');

export function ModuleListComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_LIST_COMPONENT_KEY] = component;
    };
}
