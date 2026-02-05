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
            showing: false,
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
}
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
    z-index: 1500;
}

.loading-popup-component-card {
    background-color: var(--white);
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 400px;
    height: 150px;
}

.spin-icon {
    font-size: 70px;
    font-weight: bold;
    color: var(--green-soft);
    animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>