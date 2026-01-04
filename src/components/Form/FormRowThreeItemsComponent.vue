<template>
    <div class="form-row-3">
        <slot></slot>
    </div>
</template>

<style scoped>
.form-row-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}
</style>