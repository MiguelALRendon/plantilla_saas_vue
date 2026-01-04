import { Module } from '@/models/module';
import HomeView from '../views/home.vue';
import InventoryView from '../views/inventory.vue';
import StoreView from '../views/store.vue';
import ICONS from './icons';

export const MODULES: Module[] = [
    {
        nombre: 'Home',
        permiso_clave: 'home',
        type: HomeView,
        icon: ICONS.HOME
    },
    {
        nombre: 'Inventory',
        permiso_clave: 'inventory',
        type: InventoryView,
        icon: ICONS.INVENTORY
    },
    {
        nombre: 'Store',
        permiso_clave: 'store',
        type: StoreView,
        icon: ICONS.STORE
    }
];
