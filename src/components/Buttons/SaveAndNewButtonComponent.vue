<template>
    <button class="button accent" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.SAVE2 }}</span>
        Save and New
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'SaveAndNewButtonComponent',
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.save();
                Application.changeViewToDetailView((Application.View.value.entityClass! as any).createNewInstance());
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
.button.accent span {
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>
