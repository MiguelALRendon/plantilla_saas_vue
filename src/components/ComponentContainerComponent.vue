<template>
    <div class="ViewContainer">
        <TopBarComponent />
        <div ref="containerRef" class="ComponentContainer">
            <ActionsComponent />
            <component v-if="currentComponent" :is="currentComponent" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, markRaw, provide, ref, watch, type Component } from 'vue';
import TopBarComponent from './TopBarComponent.vue';
import Application from '@/models/application';
import ActionsComponent from './ActionsComponent.vue';
import { COMPONENT_CONTAINER_EL_KEY } from '@/types/injection_keys';

// #region PROPERTIES
const currentComponent = ref<Component | null>(null);
const containerRef = ref<HTMLElement | null>(null);

// Shares the scroll container with descendants (e.g. ActionsComponent) via
// provide/inject instead of a global `document.querySelector('.ComponentContainer')`,
// which could match the wrong element if this component were ever instantiated twice.
provide(COMPONENT_CONTAINER_EL_KEY, containerRef);
// #endregion

// #region METHODS
function registerModuleCustomComponents(): void {
    const moduleClass = Application.View.value.entityClass;
    const customComponents = moduleClass?.getModuleCustomComponents();

    if (!customComponents || customComponents.size === 0) {
        return;
    }

    const app = getCurrentInstance()?.appContext.app;
    if (!app) {
        return;
    }

    for (const [name, component] of customComponents.entries()) {
        if (!app.component(name)) {
            app.component(name, markRaw(component));
        }
    }
}
// #endregion

// #region LIFECYCLE
const initialComponent = Application.View.value.component;
if (initialComponent) {
    registerModuleCustomComponents();
    currentComponent.value = markRaw(initialComponent);
}

watch(
    () => Application.View.value.component,
    async (newVal: Component | null) => {
        if (newVal) {
            registerModuleCustomComponents();
            currentComponent.value = markRaw(newVal);
            await document.fonts.ready;
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        }
    }
);
// #endregion
</script>

<style scoped>
.ViewContainer {
    display: flex;
    flex-direction: column;
    flex: 1;       /* absorb all remaining row space after the sidebar takes its share */
    min-width: 0;  /* allow shrinking below intrinsic content width inside flex row */
    height: 100%;
    max-height: 100vh;
    position: relative;
    z-index: var(--z-base);
    padding-bottom: var(--padding-small);
    padding-inline: var(--padding-small);
    box-sizing: border-box;
    background-color: var(--white);
}
.ComponentContainer {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - var(--topbar-height));
    overflow: auto;
    padding-top: var(--padding-large);
    padding-inline: var(--padding-large);
    padding-bottom: var(--spacing-2xl);
    position: relative;
    background-color: var(--bg-gray);
    border-radius: var(--border-radius);
    box-sizing: border-box;
}

/* Mobile (var(--breakpoint-mobile) = 768px — raw value required: var() unsupported in @media per CSS spec) */
@media (max-width: 768px) {
    .ViewContainer {
        padding-bottom: 0;
        padding-right: 0;
    }
    .ComponentContainer {
        padding-top: var(--padding-medium);
        padding-inline: var(--padding-small);
        padding-bottom: var(--spacing-xl);
        border-radius: 0;
    }
}
</style>
