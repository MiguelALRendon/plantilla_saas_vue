<template>
    <div class="ViewContainer">
        <TopBarComponent />
        <div class="ComponentContainer">
            <component 
            v-if="currentComponent" :is="currentComponent"
             />
        </div>
        <LoadingScreenComponent />
    </div>
</template>

<script lang="ts">
import { markRaw, watch } from 'vue';
import LoadingScreenComponent from './LoadingScreenComponent.vue';
import TopBarComponent from './TopBarComponent.vue';
import { Module } from '@/models/module';
import Application from '@/models/application';

export default {
    name: 'ComponentContainerComponent',
    components: {
        TopBarComponent, LoadingScreenComponent
    },
    data() {
        return {
            currentComponent: null as any,
        };
    },
    created() {
        const init = Application.activeView.value;
        if (init) {
            this.currentComponent = markRaw(init.moduleDefaultType);
        }

        watch(Application.activeView, async (newVal: Module<any> | null) => {
            if (newVal) {
                Application.showLoadingScreen();
                await new Promise(resolve => setTimeout(resolve, 400));
                this.currentComponent = markRaw(newVal.moduleDefaultType);
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
    background-color: #f5f5f5;
    border-radius: 1rem;
    box-sizing: border-box;
}
</style>