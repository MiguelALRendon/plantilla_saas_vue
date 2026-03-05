<template>
    <div class="app-container">
        <SideBarComponent />
        <!-- Sidebar backdrop overlay — only interactive at ≤1200px when sidebar is open.
             Clicking it closes the floating sidebar without triggering content below. -->
        <div
            class="sidebar-overlay"
            :class="{ visible: sidebarOpen }"
            @click="closeSidebar"
        />
        <ComponentContainerComponent />
        <ToastContainerComponent />
        <ModalComponent />
        <DropdownMenuComponent />
        <ConfirmationDialogComponent />
        <LoadingPopupComponent />
        <!-- T232: LoadingScreenComponent at app-root level for full-viewport body coverage -->
        <LoadingScreenComponent />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue';

import ComponentContainerComponent from './components/ComponentContainerComponent.vue';
import SideBarComponent from './components/SideBarComponent.vue';
import ModalComponent from './components/Modal/ModalComponent.vue';
import DropdownMenuComponent from './components/DropdownMenuComponent.vue';
import ConfirmationDialogComponent from './components/Modal/ConfirmationDialogComponent.vue';
import LoadingPopupComponent from './components/Modal/LoadingPopupComponent.vue';
import LoadingScreenComponent from './components/LoadingScreenComponent.vue';
import Application from './models/application';
import ToastContainerComponent from './components/Informative/ToastContainerComponent.vue';

// #region PROPERTIES
// T231: dark mode applied to document.documentElement so CSS tokens cascade globally
// (modals, toasts, dropdowns outside .app-container also inherit dark-mode tokens)
watchEffect(() => {
    document.documentElement.classList.toggle(
        'dark-mode',
        Application.AppConfiguration.value.isDarkMode
    );
});

// Track sidebar open/closed state to control overlay visibility.
// Initialized to match SideBarComponent initial state (open only at > 1200px).
const sidebarOpen = ref(typeof window !== 'undefined' ? window.innerWidth > 1200 : true);
// #endregion

// #region METHODS
function closeSidebar(): void {
    Application.ApplicationUIService.setSidebar(false);
}
// #endregion

// #region LIFECYCLE
onMounted(() => {
    Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
        sidebarOpen.value = state !== undefined ? !!state : !sidebarOpen.value;
    });
});

onBeforeUnmount(() => {
    Application.eventBus.off('toggle-sidebar');
});
// #endregion
</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: row;
    max-height: 100vh;
    height: 100vh;
}

/* Sidebar backdrop — covers content area to let user dismiss the floating sidebar.
   Hidden by default; only active below 1200px via .visible class + media query.
   z-index: 499 — just below the sidebar's --z-overlay (500) but above all content. */
.sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background-color: var(--overlay-dark);
    z-index: 499;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-slow) var(--timing-ease);
    box-sizing: border-box;
}

/* 1200px matches the sidebar floating breakpoint in SideBarComponent.vue */
@media (max-width: 1200px) {
    .sidebar-overlay {
        display: block;
    }
    .sidebar-overlay.visible {
        opacity: 1;
        pointer-events: auto;
    }
}
</style>
