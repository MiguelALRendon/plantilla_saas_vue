<template>
    <button class="button">{{ t('common.generic') }}</button>
</template>

<script lang="ts">
import { GetLanguagedText } from '@/helpers/language_helper';

export default {
    name: 'GenericButtonComponent',
    methods: {
        t(path: string): string {
            return GetLanguagedText(path);
        }
    }
};
</script>

<style scoped>
/* Component-specific styles inherit from global form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>
