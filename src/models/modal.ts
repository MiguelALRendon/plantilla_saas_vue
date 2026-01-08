import { ViewTypes } from '@/enums/view_type';
import type { Module } from './module';

export interface Modal {
    modalView: Module<any> | null;
    modalOnCloseFunction: (() => void) | null;
    viewType : ViewTypes;
    customViewId?: string;
}
