<template>
    <div :class="['sidebar', { toggled }]">
        <div class="header">
            <img :src="headerLogo" class="header-logo" :class="{ squared: !toggled }" alt="Logo" />
        </div>

        <div class="body">
            <SideBarItemComponent
                v-for="module in Application.ModuleList.values()"
                :module="module"
                :collapsed="!toggled"
                :on-select-module="onSelectModule"
            />
        </div>

        <div class="footer">
            <span class="app-title">{{ appName }}</span>
            <span class="copyright">&copy; galurensoft</span>
            <span class="version">v{{ appVersion }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import SideBarItemComponent from './SideBarItemComponent.vue';
import Application from '@/models/application';
import ICONS from '@/constants/icons';
import { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'SideBarComponent',
    components: {
        SideBarItemComponent
    },

    // #region PROPERTIES
    data() {
        return {
            Application,
            ICONS,
            toggled: typeof window !== 'undefined' ? window.innerWidth > 1200 : true
        };
    },
    // #endregion

    // #region COMPUTED
    computed: {
        appName(): string {
            return Application.AppConfiguration.value.appName;
        },
        appVersion(): string {
            return Application.AppConfiguration.value.appVersion;
        },
        headerLogo(): string {
            return this.toggled
                ? ICONS.SYSTEM_NAME
                : (Application.AppConfiguration.value.squared_app_logo_image || ICONS.SQUARED_APP_LOGO);
        }
    },
    methods: {
        onSelectModule(moduleClass: typeof BaseEntity): void {
            Application.changeViewToDefaultView(moduleClass);
        }
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
    flex-shrink: 0; /* never yield space to the content container — sidebar width is structural */
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
    opacity: 1;
    max-height: var(--sidebar-header-max-height);
    padding: var(--spacing-small);
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

.sidebar .header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
}

.sidebar .header .header-logo {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.sidebar .header .header-logo.squared {
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    object-fit: contain;
    border-radius: var(--border-radius);
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

.sidebar .footer {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
}

.sidebar .footer .copyright,
.sidebar .footer .version {
    font-size: var(--font-size-xs);
    color: var(--gray);
    white-space: nowrap;
}

.sidebar .footer .app-title {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--gray-medium);
    margin-bottom: var(--spacing-xxs);
}

/* Desktop standard (1201px–1400px): sidebar slightly reduced to free horizontal space.
   1400px corresponds to --breakpoint-xl in the design system.
   var() is unsupported in @media per CSS spec — raw value required. */
@media (max-width: 1400px) {
    .sidebar.toggled {
        max-width: 200px; /* 250px → 200px — preserves full label visibility but gains 50px */
    }
}

/* Floating sidebar — shown as fixed overlay below 1200px.
   Sidebar leaves flex flow so ComponentContainer always fills full width.
   Uses transform (not max-width) for smooth slide-in/out animation.
   1200px corresponds to --breakpoint-lg in the design system;
   var() is unsupported in @media per CSS spec — raw value required. */
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
