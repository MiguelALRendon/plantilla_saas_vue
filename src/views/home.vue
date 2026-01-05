<template>
 <button class="button warning" @click="showModal">Show a Modal</button>
</template>

<script>
import Application from '@/models/application';
import { MODULES } from '@/constants/modules';

export default {
    name: 'HomeView',
    methods: {
        showModal() {
            Application.showModal(MODULES[1]);
        }
    },
    data() {
        return {
            MODULES
        }
    }
}
</script>