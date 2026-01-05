<template>
  <div class="app-container">
    <SideBarComponent />
    <ComponentContainerComponent />
    <ModalComponent />
  </div>
</template>

<script setup lang="ts">
import ComponentContainerComponent from './components/ComponentContainerComponent.vue';
import SideBarComponent from './components/SideBarComponent.vue';
import ModalComponent from './components/Modal/ModalComponent.vue';
</script>

<style scoped>
  .app-container {
    display: flex;
    flex-direction: row;
    max-height: 100vh;
    height: 100vh;
  }
</style>