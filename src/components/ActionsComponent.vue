<template>
    <div class="floating-actions" :class="{ 'at-top': isAtTop }">
        <component v-for="component in Application.ListButtons" :is="component" :key="String(component)" />
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

import Application from '@/models/application';

const isAtTop: Ref<boolean> = ref(true);
const scrollContainer: Ref<HTMLElement | null> = ref(null);

function handleScroll(): void {
    if (scrollContainer.value) {
        isAtTop.value = scrollContainer.value.scrollTop === 0;
    }
}

onMounted((): void => {
    scrollContainer.value = document.querySelector('.ComponentContainer');

    if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', handleScroll);
        handleScroll();
    }
});

onBeforeUnmount((): void => {
    if (scrollContainer.value) {
        scrollContainer.value.removeEventListener('scroll', handleScroll);
    }
});
</script>

<style scoped>
.floating-actions {
    position: sticky;
    top: 0;
    right: 0;
    width: auto;
    margin-left: auto;
    z-index: var(--z-base);
    display: flex;
    flex-direction: row;
    gap: var(--spacing-medium);
    align-items: center;
    background-color: var(--white);
    padding: var(--padding-medium);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    margin-bottom: var(--margin-medium);
    overflow: hidden;
    transition:
        max-width var(--transition-slow) var(--timing-ease),
        opacity var(--transition-normal) var(--timing-ease);
    white-space: nowrap;
    opacity: var(--opacity-disabled);
}
.floating-actions.at-top {
    opacity: 1;
}
.floating-actions:hover {
    opacity: 1;
}
</style>
