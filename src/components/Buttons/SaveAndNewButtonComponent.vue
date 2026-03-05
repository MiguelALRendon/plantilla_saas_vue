<template>
    <button class="button accent" @click="saveItem">
        <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.SAVE2 }}</span>
        <span class="btn-label">{{ t('common.save_and_new') }}</span>
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import { GetLanguagedText } from '@/helpers/language_helper';
import Application from '@/models/application';

export default {
    name: 'SaveAndNewButtonComponent',

    // #region METHODS
    methods: {
        t(path: string): string {
            return GetLanguagedText(path);
        },
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                try {
                    await entity.save();
                    const entityClass = Application.View.value.entityClass as
                        | (typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity))
                        | null;

                    if (!entityClass) return;

                    Application.changeViewToDetailView(entityClass.createNewInstance());
                } catch {
                    return;
                }
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
.button.accent .btn-icon {
    font-size: var(--font-size-lg);
    margin-right: 0.15rem;
}
</style>
