<template>
    <div
        v-spark
        :class="['side-bar-item', { active: isActive, collapsed }]"
        @click="setNewView"
        @mouseenter="onHoverIn"
        @mouseleave="onHoverOut"
    >
        <div class="icon">
            <img ref="iconRef" :src="moduleIcon" alt="" />
        </div>
        <span class="module-title">{{ moduleName }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
import gsap from 'gsap';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

// #region PROPERTIES
const props = defineProps({
    module: {
        type: Function as unknown as PropType<typeof BaseEntity>,
        required: true,
    },
    onSelectModule: {
        type: Function as PropType<(module: typeof BaseEntity) => void>,
        required: false,
        default: undefined,
    },
    collapsed: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const iconRef = ref<HTMLImageElement | null>(null);
// #endregion

// #region COMPUTED
const moduleIcon = computed<string | undefined>(() => props.module?.getModuleIcon());
const moduleName = computed<string | undefined>(() => props.module?.getModuleName());
const isActive = computed<boolean>(() =>
    Application.View.value.entityClass?.getModuleName() === props.module?.getModuleName()
);
// #endregion

// #region METHODS
function setNewView(): void {
    if (props.onSelectModule) {
        props.onSelectModule(props.module as typeof BaseEntity);
        return;
    }
    Application.changeViewToDefaultView(props.module as typeof BaseEntity);
}

function onHoverIn(): void {
    const el = iconRef.value;
    if (!el) return;
    gsap.to(el, { scale: 1.22, rotation: -8, duration: 0.28, ease: 'back.out(2.5)' });
}

function onHoverOut(): void {
    const el = iconRef.value;
    if (!el) return;
    gsap.to(el, { scale: 1, rotation: 0, duration: 0.32, ease: 'power2.out' });
}
// #endregion
</script>

<style scoped>
.side-bar-item {
    position: relative;
    z-index: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-small);
    min-height: calc(var(--sidebar-min-width) - 2px);
    padding-inline: var(--spacing-small);
    overflow: hidden;
    transition: var(--transition-normal) var(--timing-ease);
}
.side-bar-item:hover {
    cursor: pointer;
}
/* Scoped to :not(.active) — the active item's own background is the shared
   liquid indicator (SideBarComponent.vue, z-index: -1 behind this item); a flat
   hover fill here would paint over it (z-index: 0) and hide it completely. */
.side-bar-item:hover:not(.active) {
    background-color: var(--gray-lightest);
}
.side-bar-item.active {
    box-sizing: border-box;
    color: white;
    border-radius: var(--border-radius);
}
/* The colored pill itself now lives in SideBarComponent.vue as a single shared
   SVG (`.active-indicator`) that glides + squishes between items via GSAP —
   see that component for the rationale. This item only owns its text/icon state. */

.side-bar-item.active .icon img,
.icon img {
    filter: drop-shadow(var(--shadow-white));
}

.side-bar-item .icon {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
    flex-shrink: 0;
    /* EXC-007-style: width/height are layout-triggering, but justified here —
       a single small icon box, transitioned only on the infrequent collapse/expand
       toggle, so it shrinks smoothly instead of snapping to its collapsed size. */
    transition: width var(--transition-slow) var(--timing-bounce),
                height var(--transition-slow) var(--timing-bounce);
}
.side-bar-item .icon img {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
    transition: width var(--transition-slow) var(--timing-bounce),
                height var(--transition-slow) var(--timing-bounce);
}

.side-bar-item .module-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 12rem;
    opacity: 1;
    margin-left: 0;
    transition: max-width var(--transition-slow) var(--timing-ease),
                opacity var(--transition-quick) var(--timing-ease),
                margin-left var(--transition-slow) var(--timing-ease);
}

.side-bar-item.collapsed {
    justify-content: center;
    align-self: center;
    width: calc(var(--sidebar-width-collapsed) - (var(--spacing-small) * 2));
    height: calc(var(--sidebar-width-collapsed) - (var(--spacing-small) * 2));
    min-height: 0;
    margin: var(--spacing-xxs) 0;
    padding: var(--spacing-xxs);
    border-radius: var(--border-radius);
    transition: width var(--transition-slow) var(--timing-bounce),
                height var(--transition-slow) var(--timing-bounce),
                margin var(--transition-slow) var(--timing-ease),
                padding var(--transition-slow) var(--timing-ease);
}

/* Was `display:none` — not animatable, which is exactly what made the label
   "vanish abruptly" on collapse. Collapsing the box instead lets it transition. */
.side-bar-item.collapsed .module-title {
    max-width: 0;
    opacity: 0;
    margin-left: calc(-1 * var(--spacing-small));
}

.side-bar-item.collapsed .icon,
.side-bar-item.collapsed .icon img {
    width: calc(var(--sidebar-min-width) - 24px);
    height: calc(var(--sidebar-min-width) - 24px);
}

.active .module-title {
    font-weight: 600;
    color: var(--white);
    font-size: var(--font-size-lg);
}
</style>
