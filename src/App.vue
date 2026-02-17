<template>
    <div class="app-container" :class="containerClass">
        <SideBarComponent />
        <ComponentContainerComponent />
        <ToastContainerComponent />
        <ModalComponent />
        <DropdownMenuComponent />
        <ConfirmationDialogComponent />
        <LoadingPopupComponent />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ComponentContainerComponent from './components/ComponentContainerComponent.vue';
import SideBarComponent from './components/SideBarComponent.vue';
import ModalComponent from './components/Modal/ModalComponent.vue';
import DropdownMenuComponent from './components/DropdownMenuComponent.vue';
import ConfirmationDialogComponent from './components/Modal/ConfirmationDialogComponent.vue';
import LoadingPopupComponent from './components/Modal/LoadingPopupComponent.vue';
import Application from './models/application';
import ToastContainerComponent from './components/Informative/ToastContainerComponent.vue';

const containerClass = computed<string>(() => {
    return Application.AppConfiguration.value.isDarkMode ? 'dark-mode' : '';
});
</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: row;
    max-height: 100vh;
    height: 100vh;
}
</style>
