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
    width: 400px;
    height: 100%;
    padding-top: calc(50px + 0.5rem);
    padding-right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    pointer-events: none;
}
</style>
