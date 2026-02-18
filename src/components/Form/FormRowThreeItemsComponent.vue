<template>
    <div class="form-row-3">
        <slot></slot>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.form-row-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: var(--spacing-lg);
}
</style>
