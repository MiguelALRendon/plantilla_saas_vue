<template>
    <div class="floating-actions" :class="{ 'at-top': isAtTop }">
        <component v-for="component in Application.ListButtons" :is="component" />
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';

export default {
    name: 'ActionsComponent',
    data() {
        return {
            Application,
            isAtTop: true,
            scrollContainer: null as HTMLElement | null
        };
    },
    mounted() {
        this.scrollContainer = this.$el.closest('.ComponentContainer');
        if (this.scrollContainer) {
            this.scrollContainer.addEventListener('scroll', this.handleScroll);
            this.handleScroll();
        }
    },
    beforeUnmount() {
        if (this.scrollContainer) {
            this.scrollContainer.removeEventListener('scroll', this.handleScroll);
        }
    },
    methods: {
        handleScroll() {
            if (this.scrollContainer) {
                this.isAtTop = this.scrollContainer.scrollTop === 0;
            }
        }
    }
};
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
