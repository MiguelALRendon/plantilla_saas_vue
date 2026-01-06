<template>
 <button class="button warning" @click="showModal">Show a Modal</button>
</template>

<script lang="ts">
import Application from '@/models/application';
import { MODULES } from '@/constants/modules';
import { ViewType } from '@/enums/view_type';
import { InventoryViewModuleInstance } from '@/view_models/inventory_view';

export default {
    name: 'HomeView',
    methods: {
        showModal() {
            Application.showModal(InventoryViewModuleInstance, ViewType.CUSTOMVIEW, 'inputs_source');
        }
    },
    data() {
        return {
            MODULES,
            ViewType,
        }
    }
}
</script>