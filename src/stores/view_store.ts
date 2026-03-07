import { defineStore } from 'pinia';
import { markRaw, ref } from 'vue';
import type { Component } from 'vue';

import type { BaseEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';
import type { View } from '@/models/view';

/**
 * Pinia store backing Application.View, Application.ModuleList, and Application.ListButtons.
 * Exposes current navigation state as inspectable Pinia state in Vue DevTools.
 */
export const useViewStore = defineStore('view', () => {
    const view = ref<View>({
        entityClass: null,
        entityObject: null,
        component: null,
        viewType: ViewTypes.DEFAULTVIEW,
        isValid: true,
        entityOid: '',
    });

    const moduleList = ref<(typeof BaseEntity)[]>([]);

    const listButtons = ref<Component[]>([]);

    function setListButtons(buttons: Component[]): void {
        listButtons.value = buttons.map(markRaw);
    }

    return { view, moduleList, listButtons, setListButtons };
});
