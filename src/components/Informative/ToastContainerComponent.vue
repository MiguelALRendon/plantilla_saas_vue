<template>
    <div class="toast-container">
        <ToastItemComponent
            v-for="toast in Application.ToastList"
            :key="toast.id"
            :toast="toast"
            @remove="removeToast"
        />
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';
import ToastItemComponent from './ToastItemComponent.vue';

export default {
    name: 'ToastContainerComponent',
    components: { ToastItemComponent },
    methods: {
        removeToast(toastId: string) {
            const index = this.Application.ToastList.findIndex((toast) => toast.id === toastId);
            if (index !== -1) {
                this.Application.ToastList.splice(index, 1);
            }
        }
    },
    data() {
        return {
            Application: Application
        };
    }
};
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
