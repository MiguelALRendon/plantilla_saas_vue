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
}
