<template>
    <div class="form-group">
        <div class="form-group-header">
            <span>{{ props.title }}</span>
        </div>

        <div class="form-group-body">
            <div class="form-group-body-container">
                <div class="form-group-body-content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    title: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
});
</script>

<style scoped>
.form-group {
    background-color: var(--white);
    border-radius: var(--border-radius);
    margin-block: var(--margin-medium);
    box-shadow: var(--shadow-light);
}

.form-group-header {
    font-weight: bold;
    font-size: var(--font-size-xl);
    color: var(--gray-medium);
    padding: var(--padding-large);
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
    height: var(--form-group-header-height);
    max-height: var(--form-group-header-height);
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.form-group-body {
    padding-block: var(--padding-large);
    padding-inline: var(--padding-small);
}

.form-group-body-container {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows var(--transition-normal) var(--timing-ease);
}

.form-group-body-content {
    overflow: visible;
}

.colapse-group-btn {
    height: 100%;
}
.colapse-group-btn span {
    height: fit-content;
    transform: rotate(180deg);
    height: 100%;
    transition: transform var(--transition-normal) var(--timing-ease);
    font-size: 2rem;
    width: 2rem;
}
</style>
