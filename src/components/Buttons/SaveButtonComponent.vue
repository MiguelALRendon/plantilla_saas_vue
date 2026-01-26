<template>
    <button class="button secondary" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.SAVE }}</span>
        Save
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'NewButtonComponent',
    methods: {
        saveItem() {
            Application.eventBus.emit('validate-inputs')
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS,
        };
    }
}
</script>

<style scoped>
.button.secondary span{
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>