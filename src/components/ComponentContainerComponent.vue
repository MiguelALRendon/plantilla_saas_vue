<template>
    <div class="ViewContainer">
        <TopBarComponent />
        <div class="ComponentContainer">
            <div class="floating-actions">
                holi
            </div>
            <component 
            v-if="currentComponent" :is="currentComponent"
             />
        </div>
        <LoadingScreenComponent />
    </div>
</template>

<script lang="ts">
import { Component, markRaw, watch } from 'vue';
import LoadingScreenComponent from './LoadingScreenComponent.vue';
import TopBarComponent from './TopBarComponent.vue';
import Application from '@/models/application';
import GGICONS, { GGCLASS } from '@/constants/ggicons';

export default {
    name: 'ComponentContainerComponent',
    components: {
        TopBarComponent, LoadingScreenComponent
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            currentComponent: null as any,
        };
    },
    created() {
        const init = Application.activeViewComponent.value;
        if (init) {
            this.currentComponent = markRaw(init);
        }

        watch(Application.activeViewComponent, async (newVal: Component | null) => {
            if (newVal) {
                Application.showLoadingScreen();
                await new Promise(resolve => setTimeout(resolve, 400));
                this.currentComponent = markRaw(newVal);
                Application.hideLoadingScreen();
            }
        });
    }
}
</script>

<style scoped>
.ViewContainer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    position: relative;
    z-index: 1;
    padding-bottom: 0.5rem;
    padding-right: 0.5rem;
    box-sizing: border-box;
    background-color: var(--white);
}
.ComponentContainer {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 50px);
    overflow: auto;
    padding-top: 1rem;
    padding-inline: 1rem;
    padding-bottom: 2rem;
    position: relative;
    background-color: var(--bg-gray);
    border-radius: var(--border-radius);
    box-sizing: border-box;
}

.floating-actions {
    position: sticky;
    top: 0;
    right: 0;
    width: auto;
    margin-left: auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    background-color: var(--white);
    padding: .75rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    margin-bottom: 1rem;
    cursor: pointer;
    overflow: hidden;
    transition: max-width 0.5s ease;
    white-space: nowrap;
}
</style>