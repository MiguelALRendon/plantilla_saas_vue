<template>
    <div class="toast-container">
        <ToastItemComponent
            v-for="toast in toastList"
            :key="toast.id"
            :toast="toast"
            @remove="removeToast"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';
import ToastItemComponent from './ToastItemComponent.vue';

// #region COMPUTED
const toastList = computed(() => Application.ToastList.value);
// #endregion

// #region METHODS
function removeToast(toastId: string): void {
    const index = Application.ToastList.value.findIndex((toast) => toast.id === toastId);
    if (index !== -1) {
        Application.ToastList.value.splice(index, 1);
    }
}
// #endregion
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 0;
    right: 0;
    z-index: var(--z-toast);
    width: var(--toast-container-width);
    height: 100%;
    padding-top: calc(var(--topbar-height) + var(--padding-small));
    padding-right: var(--padding-large);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    pointer-events: none;
}
</style>
