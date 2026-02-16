<template>
<div class="tab-component">
    <slot></slot>
</div>
</template>

<script lang="ts">
export default {
  name: 'TabComponent',
};
</script>

<style scoped>
    .tab-component{
        width: 100%;
        height: 100%;
        padding: var(--spacing-sm);
        border-radius: 0 0 var(--border-radius) var(--border-radius);
        border: 2px solid var(--sky);
        border-top: none;
        box-sizing: border-box;
        background-color: var(--bg-gray);
        display: none;
    }
    .tab-component.active{
        display: block;
        overflow: hidden;
    }
</style>