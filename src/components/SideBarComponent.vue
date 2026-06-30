<template>
    <div :class="['sidebar', { toggled }]">
        <div class="header">
            <img :src="headerLogo" class="header-logo" :class="{ squared: !toggled }" alt="Logo" />
        </div>

        <div ref="bodyRef" class="body">
            <SideBarItemComponent
                v-for="module in moduleList"
                :key="module.name"
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

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import gsap from 'gsap';
import SideBarItemComponent from './SideBarItemComponent.vue';
import Application from '@/models/application';
import ICONS from '@/constants/icons';
import { BaseEntity } from '@/entities/base_entity';

// #region PROPERTIES
const bodyRef = ref<HTMLElement | null>(null);
// Single source of truth — read directly from Application, no local ref kept
// in sync via events (see ui_store.ts sidebarOpen).
const toggled = computed(() => Application.sidebarOpen.value);
// #endregion

// #region COMPUTED
const moduleList = computed(() => Application.ModuleList.value);
const appName = computed(() => Application.AppConfiguration.value.appName);
const appVersion = computed(() => Application.AppConfiguration.value.appVersion);
const headerLogo = computed(() =>
    toggled.value
        ? ICONS.SYSTEM_NAME
        : (Application.AppConfiguration.value.squared_app_logo_image || ICONS.SQUARED_APP_LOGO)
);
// #endregion

// #region METHODS
function onSelectModule(moduleClass: typeof BaseEntity): void {
    Application.changeViewToDefaultView(moduleClass);
}

async function animateItems(): Promise<void> {
    await nextTick();
    const body = bodyRef.value;
    if (!body) return;
    const items = body.querySelectorAll('.side-bar-item');
    if (items.length === 0) return;
    gsap.fromTo(
        items,
        { x: -10, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.045, ease: 'power2.out', clearProps: 'x,opacity' }
    );
}
// #endregion

// #region LIFECYCLE
watch(toggled, (newVal) => {
    if (newVal) animateItems();
});

onMounted(() => {
    if (toggled.value) animateItems();
});
// #endregion
</script>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    max-width: var(--sidebar-width-collapsed);
    width: 100%;
    height: 100%;
    max-height: 100vh;
    flex-shrink: 0;
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

@media (max-width: 1400px) {
    .sidebar.toggled {
        max-width: 200px;
    }
}

@media (max-width: 1200px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        max-width: var(--sidebar-width-expanded);
        z-index: var(--z-overlay);
        transform: translateX(-105%);
        transition: transform var(--transition-slow) var(--timing-ease),
                    box-shadow var(--transition-slow) var(--timing-ease);
    }
    .sidebar.toggled {
        transform: translateX(0);
        box-shadow: var(--shadow-dark);
        max-width: var(--sidebar-width-expanded);
    }
    .sidebar span {
        opacity: 0;
    }
    .sidebar.toggled span {
        opacity: 1;
    }
}
</style>
