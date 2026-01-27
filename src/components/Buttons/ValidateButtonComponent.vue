<template>
    <button class="button warning" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
        Validate
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'ValidateButtonComponent',
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