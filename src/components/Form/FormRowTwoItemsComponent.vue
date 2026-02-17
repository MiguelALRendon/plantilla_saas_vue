<template>
    <div class="form-row-2">
        <slot></slot>
    </div>
</template>

<style scoped>
.form-row-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: var(--spacing-lg);
}
</style>
