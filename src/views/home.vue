<template>
 <button class="button warning" @click="showModal">Show a Modal</button>
<div v-for="n in 100" :key="n">para pa pi pap</div>
</template>

<script lang="ts">
import Application from '@/models/application';
import { MODULES } from '@/constants/modules';
import { ViewTypes } from '@/enums/view_type';
import { InventoryViewModuleInstance } from '@/view_models/inventory_view';

export default {
    name: 'HomeView',
    methods: {
        showModal() {
            Application.showModal(InventoryViewModuleInstance, ViewTypes.CUSTOMVIEW, 'inputs_source');
        }
    },
    data() {
        return {
            MODULES,
            ViewTypes,
        }
    }
}
</script>