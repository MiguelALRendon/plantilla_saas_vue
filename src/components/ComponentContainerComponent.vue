<template>
    <div class="ViewContainer">
        <TopBarComponent />
        <div class="ComponentContainer">
            <ActionsComponent />
            <component v-if="currentComponent" :is="currentComponent" />
        </div>
        <LoadingScreenComponent />
    </div>
</template>

<script lang="ts">
import { Component, markRaw, watch } from 'vue';
import LoadingScreenComponent from './LoadingScreenComponent.vue';
import TopBarComponent from './TopBarComponent.vue';
import Application from '@/models/application';
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import ActionsComponent from './ActionsComponent.vue';

export default {
    name: 'ComponentContainerComponent',
    components: {
        TopBarComponent,
        LoadingScreenComponent,
        ActionsComponent
    },

    // #region PROPERTIES
    data() {
        return {
            GGICONS,
            GGCLASS,
            currentComponent: null as Component | null
        };
    },
    // #endregion

    // #region METHODS
    methods: {
        registerModuleCustomComponents() {
            const moduleClass = Application.View.value.entityClass;
            const customComponents = moduleClass?.getModuleCustomComponents();

            if (!customComponents || customComponents.size === 0) {
                return;
            }

            const app = (this as unknown as { $: { appContext: { app: { component: (name: string, component?: Component) => unknown } } } }).$.appContext.app;

            for (const [name, component] of customComponents.entries()) {
                if (!app.component(name)) {
                    app.component(name, markRaw(component));
                }
            }
        }
    },
    // #endregion

    // #region LIFECYCLE
    created() {
        const init = Application.View.value.component;
        if (init) {
            this.registerModuleCustomComponents();
            this.currentComponent = markRaw(init);
        }

        watch(
            () => Application.View.value.component,
            async (newVal: Component | null) => {
                if (newVal) {
                    Application.ApplicationUIService.showLoadingScreen();
                    await new Promise((resolve) => setTimeout(resolve, 400));
                    this.registerModuleCustomComponents();
                    this.currentComponent = markRaw(newVal);
                    // Wait for all fonts (including icon fonts) to be ready before
                    // hiding the loading screen so glyphs render correctly on reveal.
                    await document.fonts.ready;
                    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                    Application.ApplicationUIService.hideLoadingScreen();
                }
            }
        );
    }
    // #endregion
};
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
