<template>
    <div ref="cardRef" class="toast-card" :class="setToastClass()">
        <div class="toast" :class="setToastClass()" @mouseenter="pauseDismiss" @mouseleave="resumeDismiss">
            <span>{{ toast.message }}</span>
            <button class="toast-close-button" @click="handleClose">
                <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.CLOSE }}</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { PropType } from 'vue';
import gsap from 'gsap';
import type { Toast } from '@/models/toast';
import { ToastType } from '@/enums/toast_type';
import GGICONS, { GGCLASS } from '@/constants/ggicons';

// #region PROPERTIES
const props = defineProps({
    toast: {
        type: Object as PropType<Toast>,
        required: true,
    },
});

const emit = defineEmits<{ remove: [id: string] }>();

const cardRef = ref<HTMLElement | null>(null);

let dismissTimerId: number | null = null;
let dismissStartAt = 0;
let remainingDismissMs = 5000;
let isDismissing = false;
// #endregion

// #region METHODS
function setToastClass(): string {
    switch (props.toast.type) {
        case ToastType.ERROR:   return 'toast-error';
        case ToastType.SUCCESS: return 'toast-success';
        case ToastType.INFO:    return 'toast-info';
        case ToastType.WARNING: return 'toast-warning';
        default:                return '';
    }
}

function clearDismissTimer(): void {
    if (dismissTimerId !== null) {
        clearTimeout(dismissTimerId);
        dismissTimerId = null;
    }
}

function startDismissTimer(): void {
    clearDismissTimer();
    dismissStartAt = Date.now();
    dismissTimerId = window.setTimeout(() => {
        dismissToast();
    }, remainingDismissMs);
}

function pauseDismiss(): void {
    if (isDismissing || dismissTimerId === null) return;
    const elapsed = Date.now() - dismissStartAt;
    remainingDismissMs = Math.max(remainingDismissMs - elapsed, 0);
    clearDismissTimer();
    gsap.to(cardRef.value, { opacity: 1, duration: 0.15 });
}

function resumeDismiss(): void {
    if (isDismissing || remainingDismissMs <= 0) return;
    startDismissTimer();
    gsap.to(cardRef.value, { opacity: 0.82, duration: 0.3 });
}

function dismissToast(): void {
    if (isDismissing) return;
    isDismissing = true;
    clearDismissTimer();

    gsap.to(cardRef.value, {
        x: '110%',
        opacity: 0,
        scale: 0.94,
        duration: 0.32,
        ease: 'power2.in',
        onComplete: () => emit('remove', props.toast.id),
    });
}

function handleClose(): void {
    dismissToast();
}
// #endregion

// #region LIFECYCLE
onMounted(() => {
    gsap.set(cardRef.value, { x: '110%', opacity: 0, scale: 0.92 });
    gsap.to(cardRef.value, {
        x: 0,
        opacity: 0.82,
        scale: 1,
        duration: 0.48,
        ease: 'back.out(1.4)',
        delay: 0.04,
    });
    startDismissTimer();
});

onBeforeUnmount(() => {
    clearDismissTimer();
});
// #endregion
</script>

<style scoped>
.toast-card {
    position: relative;
    width: 100%;
    min-height: var(--toast-height);
    height: auto;
    border-radius: var(--border-radius);
    padding: var(--spacing-xs);
    box-sizing: border-box;
    background-color: var(--white);
    will-change: transform, opacity;
}

.toast {
    width: 100%;
    min-height: calc(var(--toast-height) - 2 * var(--spacing-xs));
    height: auto;
    border-radius: calc(var(--border-radius) / 1.5);
    display: flex;
    align-items: flex-start;
    padding-block: var(--spacing-xs);
    background-color: var(--overlay-medium);
    box-sizing: border-box;
    padding-inline: var(--spacing-xs);
    justify-content: space-between;
    pointer-events: all;
    gap: var(--spacing-xs);
}

.toast-card.toast-error   { background-color: var(--accent-red); }
.toast-card.toast-success { background-color: var(--green-main); }
.toast-card.toast-info    { background-color: var(--sky); }
.toast-card.toast-warning { background-color: var(--btn-warning); }

.toast span {
    color: var(--white);
    flex: 1;
    line-height: 1.4;
    word-break: break-word;
    align-self: center;
}
</style>
