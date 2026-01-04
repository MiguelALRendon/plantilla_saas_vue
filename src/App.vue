<template>
  <div class="app-container">
    <SideBarComponent 
    :toggled="toggled"
    @changeViewSignal="handleChangeView"
     />
    <ComponentContainerComponent 
    ref="componentContainer"
    @toggle-sidebar="handleToggleSidebar" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ComponentContainerComponent from './components/ComponentContainerComponent.vue';
import SideBarComponent from './components/SideBarComponent.vue';
import type { Module } from './models/module';
import { MODULES } from './constants/modules';

const toggled = ref(true);

onMounted(() => {
  handleChangeView(MODULES[0]);
});

const componentContainer = ref<InstanceType<typeof ComponentContainerComponent> | null>(null);

const handleToggleSidebar = () => {
  toggled.value = !toggled.value;
};

const handleChangeView = (module: Module) => {
  componentContainer.value?.ChangeView(module);
};
</script>

<style scoped>
  .app-container {
    display: flex;
    flex-direction: row;
    max-height: 100vh;
    height: 100vh;
  }
</style>