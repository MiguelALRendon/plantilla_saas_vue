import { Module, ModuleClass } from '@/models/module';
import ICONS from '../constants/icons';
import { Products } from '@/entities/products';
import { Component } from 'vue';
import Inventory from '@/views/inventory.vue';

class HomeViewModule extends Module<Products> {
    protected module_model_type: ModuleClass<any> = Products;
    protected module_name: string = 'Home';
    protected module_permission: string = 'home_permission';
    protected module_icon: string = ICONS.HOME;

    protected module_default_type: Component = Inventory;
}

export const HomeViewModuleInstance = new HomeViewModule();