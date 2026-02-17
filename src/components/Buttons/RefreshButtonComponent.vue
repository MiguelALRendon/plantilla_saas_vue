<template>
    <button class="button success-green" @click="refreshList">
        <span :class="GGCLASS">{{ GGICONS.REFRESH }}</span>
        Refresh
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'RefreshButtonComponent',
    methods: {
        async refreshList() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.refresh();
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
.button.success-green span {
    font-size: var(--font-size-lg);
    margin-right: 0.15rem;
}
</style>
