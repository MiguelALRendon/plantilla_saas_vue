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

    // #region PROPERTIES
    data() {
        return {
            Application,
            toggled: typeof window !== 'undefined' ? window.innerWidth > 1200 : true
        };
    },
    // #endregion

    // #region LIFECYCLE
    mounted() {
        Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
            this.toggled = state !== undefined ? state : !this.toggled;
        });
        // Sync TopBarComponent with initial state derived from viewport width
        Application.eventBus.emit('toggle-sidebar', this.toggled);
    },
    beforeUnmount() {
        Application.eventBus.off('toggle-sidebar');
    }
    // #endregion
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
    transition: max-width var(--transition-slow) var(--timing-ease); /* EXC-007: max-width — layout-trigger justified for structural sidebar collapse */
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
    transition: opacity var(--transition-slow) var(--timing-ease),
                max-height var(--transition-slow) var(--timing-ease),
                padding var(--transition-slow) var(--timing-ease);
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
    transition: opacity var(--transition-slow) var(--timing-ease),
                max-height var(--transition-slow) var(--timing-ease);
    border-top: var(--border-width-thin) solid var(--border-gray);
}
.sidebar.toggled .footer {
    height: 100%;
    opacity: 1;
}

/* Floating sidebar — shown as fixed overlay below 1200px.
   Sidebar leaves flex flow so ComponentContainer always fills full width.
   Uses transform (not max-width) for smooth slide-in/out animation.
   1200px raw value corresponds to --breakpoint-laptop threshold design intent;
   var() is unsupported in @media per CSS spec. */
@media (max-width: 1200px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        max-width: var(--sidebar-width-expanded);
        z-index: var(--z-overlay);
        transform: translateX(-105%); /* fully off-screen left */
        transition: transform var(--transition-slow) var(--timing-ease),
                    box-shadow var(--transition-slow) var(--timing-ease);
    }
    .sidebar.toggled {
        transform: translateX(0); /* slide in */
        box-shadow: var(--shadow-dark);
        max-width: var(--sidebar-width-expanded);
    }
    /* Always show text labels when sidebar is a floating drawer */
    .sidebar span {
        opacity: 0;
    }
    .sidebar.toggled span {
        opacity: 1;
    }
}
</style>
