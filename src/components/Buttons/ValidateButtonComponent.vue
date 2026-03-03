<template>
    <button class="button warning" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
        <span class="btn-label">Validate</span>
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'ValidateButtonComponent',

    // #region METHODS
    methods: {
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
.button.secondary span {
    font-size: var(--font-size-lg);
    margin-right: 0.15rem;
}
</style>
