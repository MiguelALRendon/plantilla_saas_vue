<template>
    <div
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
    background-color: var(--gray-lightest);
    cursor: pointer;
}
.side-bar-item.active {
    background: var(--grad-red-warm);
    box-sizing: border-box;
    color: white;
    border-radius: var(--border-radius);
}

.side-bar-item.active .icon img,
.icon img {
    filter: drop-shadow(var(--shadow-white));
}

.side-bar-item .icon {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
    flex-shrink: 0;
}
.side-bar-item .icon img {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
}

.side-bar-item .module-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
}

.side-bar-item.collapsed .module-title {
    display: none;
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
