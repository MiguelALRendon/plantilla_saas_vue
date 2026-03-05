<template>
    <button class="button secondary" @click="saveItem">
        <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.SAVE }}</span>
        <span class="btn-label">{{ t('common.save') }}</span>
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { GetLanguagedText } from '@/helpers/language_helper';
import Application from '@/models/application';

type GuardableEntity = {
    guardar: () => Promise<void> | void;
};

export default {
    name: 'SaveButtonComponent',

    // #region METHODS
    methods: {
        t(path: string): string {
            return GetLanguagedText(path);
        },
        async saveItem() {
            const entity = Application.View.value.entityObject;
            const guardableEntity = entity as unknown as GuardableEntity | null;

            if (guardableEntity && typeof guardableEntity.guardar === 'function') {
                await guardableEntity.guardar();
                return;
            }

            if (entity && entity.isPersistent()) {
                await entity.save();
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
.button.secondary .btn-icon {
    font-size: var(--font-size-lg);
    margin-right: 0.15rem;
}
</style>
