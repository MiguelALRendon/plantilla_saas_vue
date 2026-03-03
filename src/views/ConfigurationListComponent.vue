<template>
    <div class="container">
        <button class="button" @click="toggleTheme()">Cambiar Tema</button>
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';
export default {
    name: 'ConfigurationListComponent',

    // #region METHODS
    methods: {
        toggleTheme(): void {
            Application.ApplicationUIService.toggleDarkMode();
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
