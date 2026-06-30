import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ConfirmationMenu } from '@/models/confirmation_menu';
import { createDefaultConfirmationMenu } from '@/models/confirmation_menu';
import type { DropdownMenu } from '@/models/dropdown_menu';
import { createDefaultDropdownMenu } from '@/models/dropdown_menu';
import type { Modal } from '@/models/modal';
import { createDefaultModal } from '@/models/modal';
import type { Toast } from '@/models/toast';

/**
 * Pinia store backing Application UI overlay state:
 * ToastList, modal, dropdownMenu, confirmationMenu.
 */
export const useUiStore = defineStore('ui', () => {
    const toastList = ref<Toast[]>([]);
    const modal = ref<Modal>(createDefaultModal());
    const dropdownMenu = ref<DropdownMenu>(createDefaultDropdownMenu());
    const confirmationMenu = ref<ConfirmationMenu>(createDefaultConfirmationMenu());

    // Single source of truth for sidebar open/closed state. Previously App.vue,
    // SideBarComponent.vue and TopBarComponent.vue each held their own local ref
    // kept in sync only by re-broadcasting a 'toggle-sidebar' event — easy to drift
    // (TopBarComponent's local default didn't even match the others' width check).
    const sidebarOpen = ref<boolean>(typeof window !== 'undefined' ? window.innerWidth > 1200 : true);

    /** Sets sidebar state explicitly, or flips it when called with no argument. */
    function setSidebarOpen(state?: boolean): void {
        sidebarOpen.value = state !== undefined ? state : !sidebarOpen.value;
    }

    return { toastList, modal, dropdownMenu, confirmationMenu, sidebarOpen, setSidebarOpen };
});
