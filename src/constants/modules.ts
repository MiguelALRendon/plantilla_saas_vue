import { Module } from '@/models/module';
import { InventoryViewModuleInstance } from '@/view_models/inventory_view';
import { HomeViewModuleInstance } from '@/view_models/home_view';

export const MODULES: Module<any>[] = [
    HomeViewModuleInstance,
    InventoryViewModuleInstance,
];