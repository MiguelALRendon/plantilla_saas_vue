<template>
    <div class="ViewContainer">
        <TopBarComponent 
        :title="title",
        :icon="icon"
        @toggle-sidebar="$emit('toggle-sidebar')" />
        <div class="ComponentContainer">
            <component 
            v-if="currentComponent" :is="currentComponent"
             />
        </div>
        <!-- <LoadingScreenComponent /> -->
    </div>
</template>

<script lang="ts">
import { markRaw } from 'vue';
import LoadingScreenComponent from './LoadingScreenComponent.vue';
import TopBarComponent from './TopBarComponent.vue';
import { Module } from '@/models/module';

export default {
    name: 'ComponentContainerComponent',
    components: {
        TopBarComponent, LoadingScreenComponent
    },
    emits: ['toggle-sidebar'],
    methods: {
        ChangeView(module : Module) {
            this.title = module.nombre;
            this.currentComponent = markRaw(module.type);
            this.icon = module.icon;
        },
    },
    data() {
        return {
            title: '',
            currentComponent: null as any,
            icon: '',
        };
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