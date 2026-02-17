<template>
    <div :class="['sidebar', { toggled }]">
        <div class="header">Header</div>

        <div class="body">
            <SideBarItemComponent v-for="module in Application.ModuleList.values()" :module="module" />
        </div>

        <div class="footer">footer</div>
    </div>
</template>

<script lang="ts">
import SideBarItemComponent from './SideBarItemComponent.vue';
import Application from '@/models/application';

export default {
    name: 'SideBarComponent',
    components: {
        SideBarItemComponent
    },
    data() {
        return {
            Application,
            toggled: true
        };
    },
    mounted() {
        Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
            this.toggled = state !== undefined ? state : !this.toggled;
        });
    },
    beforeUnmount() {
        Application.eventBus.off('toggle-sidebar');
    }
};
</script>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    max-width: var(--sidebar-width-collapsed);
    width: 100%;
    height: 100%;
    max-height: 100vh;
    transition: var(--transition-slow) var(--timing-ease);
    position: relative;
    z-index: var(--z-dropdown);
    background-color: var(--white);
    overflow: hidden;
}
.sidebar span {
    opacity: 0;
    font-weight: 500;
    transition: opacity var(--transition-normal) var(--timing-ease) var(--transition-fast);
}
.sidebar.toggled {
    max-width: var(--sidebar-width-expanded);
}
.sidebar.toggled span {
    opacity: 1;
}

.sidebar .header {
    height: var(--topbar-height);
    opacity: 0;
    max-height: var(--sidebar-header-max-height);
    padding: 0;
    overflow: hidden;
    border-bottom: var(--border-width-thin) solid var(--border-gray);
    transition: var(--transition-slow) var(--timing-ease);
}
.sidebar.toggled .header {
    height: 100%;
    opacity: 1;
    padding: var(--spacing-lg);
}

.sidebar .body {
    flex-grow: 1;
    max-height: calc(100vh - var(--sidebar-body-offset));
    overflow-y: auto;
    overflow-x: hidden;
}

.sidebar .footer {
    height: 0%;
    opacity: 0;
    max-height: var(--sidebar-footer-max-height);
    padding: var(--spacing-lg);
    overflow: hidden;
    transition: var(--transition-slow) var(--timing-ease);
    border-top: var(--border-width-thin) solid var(--border-gray);
}
.sidebar.toggled .footer {
    height: 100%;
    opacity: 1;
}
</style>
