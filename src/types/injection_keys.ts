import type { InjectionKey, Ref } from 'vue';

/**
 * Provides the scrollable `.ComponentContainer` element down to descendants
 * (e.g. ActionsComponent's scroll-position tracking) without relying on a
 * global `document.querySelector`, which could match the wrong element if
 * `ComponentContainerComponent` were ever instantiated more than once.
 */
export const COMPONENT_CONTAINER_EL_KEY: InjectionKey<Ref<HTMLElement | null>> = Symbol('componentContainerEl');
