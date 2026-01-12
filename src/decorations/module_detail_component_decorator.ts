import type { Component } from 'vue';

export const MODULE_DETAIL_COMPONENT_KEY = Symbol('module_detail_component');

export function ModuleDetailComponent(component: Component): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_DETAIL_COMPONENT_KEY] = component;
    };
}
