<template>
    <button class="button primary" @click="">
        <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.DEVICES }}</span>
        <span class="btn-label">{{ t('common.send_to_device') }}</span>
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { GetLanguagedText } from '@/helpers/language_helper';

export default {
    name: 'SendToDeviceButtonComponent',

    // #region METHODS
    methods: {
        t(path: string): string {
            return GetLanguagedText(path);
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
/* Component-specific styles inherit from global form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>
