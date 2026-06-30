<template>
    <div ref="rootRef" class="tab-container">
        <div class="tab-container-row">
            <div
                class="tab"
                v-for="(tab, index) in tabs"
                :key="index"
                :class="[{ active: index == selectedTab }]"
                @click="setActiveTab(index)"
            >
                <span>{{ tab }}</span>
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

// #region PROPERTIES
defineProps({
    tabs: {
        type: Array<string>,
        required: true
    }
});

const rootRef = ref<HTMLElement | null>(null);
const selectedTab = ref(0);
// #endregion

// #region METHODS
function setActiveTab(index: number): void {
    selectedTab.value = index;
    // Scoped to this component's own root — avoids matching `.tab-component`
    // elements belonging to a different TabControllerComponent instance on the page.
    const tabElements = rootRef.value?.querySelectorAll('.tab-component');
    tabElements?.forEach((el, i) => {
        el.classList.remove('active');
        if (i === index) {
            el.classList.add('active');
        }
    });
}
// #endregion

// #region LIFECYCLE
onMounted(() => {
    setActiveTab(0);
});
// #endregion
</script>

<style scoped>
.tab-container {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    box-sizing: border-box;
}

.tab-container-row {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-sm);
    border-bottom: var(--border-width-medium) solid var(--sky);
}

.tab-container-row .tab {
    padding: var(--spacing-sm) var(--spacing-xl);
    cursor: pointer;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    border: var(--border-width-thin) solid var(--border-gray);
    border-bottom: none;
    transition: border-color var(--transition-slow) var(--timing-bounce),
                background-color var(--transition-slow) var(--timing-bounce),
                transform var(--transition-fast) var(--timing-ease);
}

.tab-container-row .tab:active {
    transform: scale(0.96);
}

.tab-container-row .tab.active {
    border: var(--border-width-medium) solid var(--sky);
    border-bottom: none;
    background-color: var(--bg-gray);
}
</style>
