<template>
    <div class="app-container" :class="Application.AppConfiguration.value.isDarkMode ? 'dark-mode' : ''">
        <SideBarComponent />
        <ComponentContainerComponent />
        <ToastContainerComponent />
        <ModalComponent />
        <DropdownMenu />
        <ConfirmationDialogComponent />
        <LoadingPopupComponent />
    </div>
</template>

<script setup lang="ts">
import ComponentContainerComponent from './components/ComponentContainerComponent.vue';
import SideBarComponent from './components/SideBarComponent.vue';
import ModalComponent from './components/Modal/ModalComponent.vue';
import DropdownMenu from './components/DropdownMenu.vue';
import ConfirmationDialogComponent from './components/Modal/ConfirmationDialogComponent.vue';
import LoadingPopupComponent from './components/Modal/LoadingPopupComponent.vue';
import Application from './models/application';
import ToastContainerComponent from './components/Informative/ToastContainerComponent.vue';
</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: row;
    max-height: 100vh;
    height: 100vh;
}
</style>
