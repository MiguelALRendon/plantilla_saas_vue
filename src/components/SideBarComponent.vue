<template>
    <div :class="['sidebar', { toggled }]" @transitionend="onSidebarTransitionEnd">
        <div class="header">
            <img :src="headerLogo" class="header-logo" :class="{ squared: !toggled }" alt="Logo" />
        </div>

        <div ref="bodyRef" class="body">
            <!-- Shared liquid active-indicator — a single real SVG <rect> that glides
                 and squishes between items via GSAP instead of each item popping its
                 own background in/out. "Cuts into" the navbar via the shared gooey
                 filter (#liq-gooey-sm, src/utils/liquid_filter.ts) on its curved edges. -->
            <svg ref="indicatorRef" class="active-indicator" aria-hidden="true">
                <defs>
                    <linearGradient id="sidebar-indicator-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" class="indicator-stop-a" />
                        <stop offset="100%" class="indicator-stop-b" />
                    </linearGradient>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" rx="16" />
            </svg>
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
const indicatorRef = ref<SVGSVGElement | null>(null);
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

/**
 * Glides the shared liquid indicator to the active item's current box.
 * `animate: false` snaps instantly (initial mount, or after a collapse/expand
 * resize where a travel animation would look like a glitch rather than a move).
 */
function moveIndicatorToActive(animate: boolean): void {
    const body = bodyRef.value;
    const indicator = indicatorRef.value;
    if (!body || !indicator) return;

    const activeItem = body.querySelector<HTMLElement>('.side-bar-item.active');
    if (!activeItem) {
        gsap.set(indicator, { opacity: 0 });
        return;
    }

    const itemBox = activeItem.getBoundingClientRect();
    const bodyBox = body.getBoundingClientRect();
    const top = itemBox.top - bodyBox.top + body.scrollTop;
    const left = itemBox.left - bodyBox.left + body.scrollLeft;
    const { width, height } = itemBox;

    gsap.killTweensOf(indicator);

    if (!animate) {
        gsap.set(indicator, { top, left, width, height, opacity: 1, scaleY: 1 });
        return;
    }

    gsap.timeline()
        .to(indicator, { scaleY: 0.7, duration: 0.14, ease: 'power2.out' })
        .to(indicator, { top, left, width, height, opacity: 1, duration: 0.4, ease: 'power3.inOut' }, '<0.02')
        .to(indicator, { scaleY: 1, duration: 0.36, ease: 'elastic.out(1, 0.55)' }, '-=0.16');
}
// #endregion

// #region LIFECYCLE
watch(toggled, async (newVal) => {
    if (newVal) animateItems();
});

// Re-settle the indicator once the sidebar's own max-width transition (EXC-007,
// see .sidebar below) finishes — measuring mid-transition would catch a stale size.
function onSidebarTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === 'max-width') {
        moveIndicatorToActive(true);
    }
}

// Re-locate whenever the active module changes (navigation via sidebar, topbar,
// or a direct URL) — not just on click, so deep links/back-forward stay in sync.
watch(
    () => Application.View.value.entityClass?.getModuleName(),
    async () => {
        await nextTick();
        moveIndicatorToActive(true);
    }
);

onMounted(() => {
    if (toggled.value) animateItems();
    nextTick(() => moveIndicatorToActive(false));
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
    position: relative;
    z-index: 0;
    flex-grow: 1;
    max-height: calc(100vh - var(--sidebar-body-offset));
    overflow-y: auto;
    overflow-x: hidden;
}

/* Shared liquid active-indicator — see template comment. A single real SVG that
   GSAP repositions/resizes to match whichever item is active, instead of each
   item owning its own pop-in pill. z-index: -1 (paired with .body's z-index: 0
   above) keeps it behind the items without escaping the sidebar's own stacking
   context — see the login panel's blob fix for why that pairing matters. */
.active-indicator {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    opacity: 0;
    pointer-events: none;
    overflow: visible;
    will-change: transform, width, height;
}
.active-indicator rect {
    fill: url(#sidebar-indicator-grad);
    filter: url(#liq-gooey-sm);
}
.indicator-stop-a { stop-color: var(--accent-red); }
.indicator-stop-b { stop-color: var(--warm-1); }

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
