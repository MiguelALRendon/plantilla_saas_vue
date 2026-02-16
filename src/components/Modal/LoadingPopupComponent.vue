<template>
    <div class="loading-popup-component-container" :class="{ active: showing }">
        <div class="loading-popup-component-card">
            <div class="loading-popup-component-spinner">
                <span :class="GGCLASS" class="spin-icon">{{ GGICONS.REFRESH }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'LoadingPopupComponent',
    data() {
        return {
            GGCLASS,
            GGICONS,
            Application,
            showing: false
        };
    },
    mounted() {
        Application.eventBus.on('show-loading-menu', () => {
            console.log('show-loading-menu event received');
            this.showing = true;
        });
        Application.eventBus.on('hide-loading-menu', () => {
            this.showing = false;
        });
    },
    beforeUnmount() {
        Application.eventBus.off('show-loading-menu');
        Application.eventBus.off('hide-loading-menu');
    }
};
</script>

<style scoped>
.loading-popup-component-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--overlay-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
    pointer-events: none;
    opacity: 0;
    transition: var(--transition-normal) var(--timing-ease);
}

.loading-popup-component-container.active {
    pointer-events: all;
    opacity: 1;
}

.loading-popup-component-card {
    background-color: var(--white);
    padding: var(--spacing-2xl);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 400px;
    height: 150px;
    transition: var(--transition-normal) var(--timing-bounce);
    transform: var(--transform-scale-min);
}
.loading-popup-component-container.active .loading-popup-component-card {
    transform: var(--transform-scale-full);
}

.spin-icon {
    font-size: 120px;
    font-weight: bold;
    color: var(--green-soft);
    animation: spin var(--animation-spin-duration) var(--timing-bounce) infinite;
}

@keyframes spin {
    0% {
        transform: var(--transform-rotate-0);
    }
    100% {
        transform: var(--transform-rotate-360);
    }
}
</style>
