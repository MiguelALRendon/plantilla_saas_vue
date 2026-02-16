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
    gap: 1rem;
    align-items: center;
    background-color: var(--white);
    padding: 0.75rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    margin-bottom: 1rem;
    overflow: hidden;
    transition:
        max-width 0.5s ease,
        opacity 0.3s ease;
    white-space: nowrap;
    opacity: 0.3;
}
.floating-actions.at-top {
    opacity: 1;
}
.floating-actions:hover {
    opacity: 1;
}
</style>
