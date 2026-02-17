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
    name: 'SaveButtonComponent',
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.save();
            }
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS
        };
    }
};
</script>

<style scoped>
.button.secondary span {
    font-size: var(--font-size-lg);
    margin-right: 0.15rem;
}
</style>
