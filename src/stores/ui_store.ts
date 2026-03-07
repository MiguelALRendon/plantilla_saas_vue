import { defineStore } from 'pinia';
import { ref } from 'vue';

import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { ViewTypes } from '@/enums/view_type';
import type { confirmationMenu } from '@/models/confirmation_menu';
import type { DropdownMenu } from '@/models/dropdown_menu';
import type { Modal } from '@/models/modal';
import type { Toast } from '@/models/toast';

/**
 * Pinia store backing Application UI overlay state:
 * ToastList, modal, dropdownMenu, confirmationMenu.
 */
export const useUiStore = defineStore('ui', () => {
    const toastList = ref<Toast[]>([]);

    const modal = ref<Modal>({
        modalView: null,
        modalOnCloseFunction: null,
        viewType: ViewTypes.LISTVIEW,
    });

    const dropdownMenu = ref<DropdownMenu>({
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
    });

    const confirmationMenu = ref<confirmationMenu>({
        type: confMenuType.INFO,
        title: '',
        message: '',
        confirmationAction: () => {},
    });

    return { toastList, modal, dropdownMenu, confirmationMenu };
});
