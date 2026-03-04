<template>
    <div class="loading-screen" :class="{ active: isActive }">{{ loadingText }}</div>
</template>

<script lang="ts">
import { Application } from '@/models/application';
import { GetLanguagedText } from '@/helpers/language_helper';

export default {
    name: 'LoadingScreenComponent',

    // #region PROPERTIES
    data() {
        return {
            Application,
            isActive: true,
            manuallyShown: false
        };
    },
    computed: {
        loadingText(): string {
            return GetLanguagedText('common.loading');
        }
    },
    // #endregion

    // #region LIFECYCLE
    mounted() {
        Application.eventBus.on('show-loading', () => {
            this.manuallyShown = true;
            this.isActive = true;
        });
        Application.eventBus.on('hide-loading', () => {
            this.manuallyShown = false;
            this.isActive = false;
        });

        // Auto-hide once all fonts (including icon fonts) have loaded.
        // This prevents a flash of unstyled icon glyphs on first paint.
        document.fonts.ready.then(() => {
            if (!this.manuallyShown) {
                this.isActive = false;
            }
        });
    },
    beforeUnmount() {
        Application.eventBus.off('show-loading');
        Application.eventBus.off('hide-loading');
    }
    // #endregion
};
</script>

<style scoped>
.loading-screen {
    /* T232: position:fixed so the overlay covers the entire viewport regardless of scroll
       or DOM nesting — body-level loading for global API fetches */
    position: fixed;
    inset: 0;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: var(--font-size-large);
    z-index: var(--z-overlay);
    background-color: var(--white);
    color: var(--gray);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-normal) var(--timing-ease-in-out);
}

.loading-screen.active {
    opacity: 1;
    pointer-events: all;
}
</style>
