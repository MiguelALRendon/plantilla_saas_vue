<template>
    <button class="button info" @click="openNewDetailView">
        <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
        New
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'NewButtonComponent',
    methods: {
        openNewDetailView() {
            Application.changeViewToDetailView((Application.View.value.entityClass! as any).createNewInstance());
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS,
            Application
        };
    }
};
</script>

<style scoped>
.button.info span {
    font-size: 1.1rem;
}
</style>
