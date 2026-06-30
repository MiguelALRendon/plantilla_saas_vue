<template>
    <div v-if="Application.ListButtons.value.length > 0" class="floating-actions" :class="{ 'at-top': isAtTop }">
        <component
            v-for="(component, index) in Application.ListButtons.value"
            :is="component"
            :key="`${String(component)}-${index}`"
        />
    </div>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

import Application from '@/models/application';
import { COMPONENT_CONTAINER_EL_KEY } from '@/types/injection_keys';

// #region PROPERTIES
const isAtTop: Ref<boolean> = ref(true);
// Provided by ComponentContainerComponent — avoids a global `document.querySelector`
// that could match the wrong element if that component were ever instantiated twice.
const scrollContainer = inject(COMPONENT_CONTAINER_EL_KEY, ref(null));
// #endregion

// #region METHODS
function handleScroll(): void {
    if (scrollContainer.value) {
        isAtTop.value = scrollContainer.value.scrollTop === 0;
    }
}
// #endregion

// #region LIFECYCLE
onMounted((): void => {
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
// #endregion
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
