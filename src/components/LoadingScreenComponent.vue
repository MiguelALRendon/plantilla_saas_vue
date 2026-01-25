<template>
    <div class="loading-screen" :class="{ active: isActive }">
        Loading...
    </div>
</template>

<script lang="ts">
import { Application } from '@/models/application';

export default {
    name: 'LoadingScreenComponent',
    data() {
        return {
            Application,
            isActive: false
        }
    },
    mounted() {
        Application.eventBus.on('show-loading', () => {
            this.isActive = true;
        });
        Application.eventBus.on('hide-loading', () => {
            this.isActive = false;
        });
    },
    beforeUnmount() {
        Application.eventBus.off('show-loading');
        Application.eventBus.off('hide-loading');
    }
}
</script>

<style scoped>
    .loading-screen {
        position: absolute;
        display: flex;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        height: calc(100% - 50px);
        width: 100%;
        font-size: 1.5rem;
        top: 50px;
        z-index: 99999;
        background-color: var(--white);
        color: var(--gray);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease-in-out;
    }

    .loading-screen.active {
        opacity: 1;
        pointer-events: all;
    }
</style>