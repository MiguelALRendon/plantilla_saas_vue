<template>
    <div class="container">
        <button class="button" @click="toggleTheme()">{{ t('common.change_theme') }}</button>
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';
import { GetLanguagedText } from '@/helpers/language_helper';
export default {
    name: 'ConfigurationListComponent',

    // #region METHODS
    methods: {
        toggleTheme(): void {
            Application.ApplicationUIService.toggleDarkMode();
        },
        t(path: string): string {
            return GetLanguagedText(path);
        }
    },
    // #endregion

    // #region PROPERTIES
    data() {
        return {
            Application
        };
    }
    // #endregion
};
</script>

<style scoped>
.container {
    width: 100%;
    padding: var(--spacing-lg);
    box-sizing: border-box;
}
.button {
    width: 100%;
}
</style>
