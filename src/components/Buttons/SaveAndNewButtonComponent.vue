<template>
    <button class="button accent" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.SAVE2 }}</span>
        <span class="btn-label">Save and New</span>
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

export default {
    name: 'SaveAndNewButtonComponent',

    // #region METHODS
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.save();
                const entityClass = Application.View.value.entityClass as
                    | (typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity))
                    | null;

                if (!entityClass) return;

                Application.changeViewToDetailView(entityClass.createNewInstance());
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
.button.accent span {
    font-size: var(--font-size-lg);
    margin-right: 0.15rem;
}
</style>
