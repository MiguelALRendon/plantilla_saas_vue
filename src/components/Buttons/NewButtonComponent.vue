<template>
    <button class="button info" @click="openNewDetailView">
        <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.ADD }}</span>
        <span class="btn-label">New</span>
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

export default {
    name: 'NewButtonComponent',

    // #region METHODS
    methods: {
        openNewDetailView() {
            const entityClass = Application.View.value.entityClass as
                | (typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity))
                | null;

            if (!entityClass) return;

            Application.changeViewToDetailView(entityClass.createNewInstance());
        }
    },
    // #endregion

    // #region PROPERTIES
    data() {
        return {
            GGCLASS,
            GGICONS,
            Application
        };
    }
    // #endregion
};
</script>

<style scoped>
.button.info.btn-icon,
.button.info .btn-icon {
    font-size: var(--font-size-lg);
}
</style>
