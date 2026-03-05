<template>
    <button class="button warning" @click="saveItem">
        <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.CHECK }}</span>
        <span class="btn-label">{{ t('common.validate') }}</span>
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { GetLanguagedText } from '@/helpers/language_helper';
import Application from '@/models/application';

export default {
    name: 'ValidateButtonComponent',

    // #region METHODS
    methods: {
        t(path: string): string {
            return GetLanguagedText(path);
        },
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity) {
                await entity.validateInputs();
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
.button.warning .btn-icon {
    font-size: var(--font-size-lg);
    margin-right: 0.15rem;
}
</style>
