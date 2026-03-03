<template>
    <button class="button success-green" @click="refreshList">
        <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.REFRESH }}</span>
        <span class="btn-label">Refresh</span>
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'RefreshButtonComponent',

    // #region METHODS
    methods: {
        async refreshList() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.refresh();
            }
        }
    },
    // #endregion

    // #region PROPERTIES
    data() {
        return {
            GGCLASS,
            GGICONS
        };
    }
    // #endregion
};
</script>

<style scoped>
.button.success-green .btn-icon {
    font-size: var(--font-size-lg);
    margin-right: 0.15rem;
}
</style>
