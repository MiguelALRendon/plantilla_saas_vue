import type { Module } from './module';

export interface Modal {
    modalView: Module | null;
    modalOnCloseFunction: (() => void) | null;
}
