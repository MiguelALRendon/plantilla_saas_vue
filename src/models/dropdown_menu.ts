import { Component } from 'vue';

export interface DropdownMenu {
    showing: boolean;
    title: string;
    component: Component | null;
    width: string;
    position_x: string;
    position_y: string;
    activeElementWidth: string;
    activeElementHeight: string;
    canvasWidth: string;
    canvasHeight: string;
    props?: Record<string, unknown>;
}

/**
 * Builds a fresh closed-dropdown default state.
 * Shared by `ApplicationClass`'s pre-Pinia bootstrap ref and `useUiStore`.
 */
export function createDefaultDropdownMenu(): DropdownMenu {
    return {
        showing: false,
        title: '',
        component: null,
        width: '250px',
        position_x: '0px',
        position_y: '0px',
        canvasWidth: typeof window !== 'undefined' ? `${window.innerWidth}px` : '1024px',
        canvasHeight: typeof window !== 'undefined' ? `${window.innerHeight}px` : '768px',
        activeElementWidth: '0px',
        activeElementHeight: '0px',
    };
}
