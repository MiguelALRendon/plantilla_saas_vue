import { Module, ModuleClass } from '@/models/module';
import ICONS from '../constants/icons';
import { Products } from '@/entities/products';
import { Component } from 'vue';
import InventoryView from '@/views/inventory.vue';

class InventoryViewModule extends Module<Products> {
    protected module_model_type: ModuleClass<Products> = Products;
    protected module_name: string = 'Inventory';
    protected module_permission: string = 'inventory_permission';
    protected module_icon: string = ICONS.INVENTORY;

    protected module_custom_types_list: Map<string, Component> = new Map<string, Component>([
        ['inputs_source', InventoryView]
    ])
}

export const InventoryViewModuleInstance = new InventoryViewModule();