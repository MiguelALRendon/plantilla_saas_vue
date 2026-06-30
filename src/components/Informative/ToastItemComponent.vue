<template>
    <div ref="cardRef" class="toast-card" :class="setToastClass()" @mouseenter="pauseDismiss" @mouseleave="resumeDismiss">
        <svg class="toast-blob" viewBox="0 0 64 64" aria-hidden="true">
            <defs>
                <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" :stop-color="accentStart"/>
                    <stop offset="100%" :stop-color="accentEnd"/>
                </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="26" :fill="`url(#${gradientId})`"/>
        </svg>

        <span ref="iconRef" class="toast-icon" :class="[GGCLASS, 'btn-icon']">{{ iconGlyph }}</span>

        <span class="toast-message">{{ toast.message }}</span>

        <button v-spark class="toast-close-button" @click="handleClose">
            <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.CLOSE }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
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
const iconRef = ref<HTMLElement | null>(null);

const gradientId = `toast-blob-grad-${props.toast.id}`;

let dismissTimerId: number | null = null;
let dismissStartAt = 0;
let remainingDismissMs = 5000;
let isDismissing = false;
// #endregion

// #region COMPUTED
const iconGlyph = computed((): string => {
    switch (props.toast.type) {
        case ToastType.ERROR:   return GGICONS.ERROR_OUTLINE;
        case ToastType.SUCCESS: return GGICONS.CHECK_CIRCLE;
        case ToastType.WARNING: return GGICONS.WARNING_AMBER;
        case ToastType.INFO:
        default:                return GGICONS.INFO;
    }
});

const accentStart = computed((): string => {
    switch (props.toast.type) {
        case ToastType.ERROR:   return 'var(--toast-accent-error)';
        case ToastType.SUCCESS: return 'var(--toast-accent-success)';
        case ToastType.WARNING: return 'var(--toast-accent-warning)';
        case ToastType.INFO:
        default:                return 'var(--toast-accent-info)';
    }
});

const accentEnd = computed((): string => 'var(--login-aurora-violet)');
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
    gsap.to(cardRef.value, { opacity: 0.94, duration: 0.3 });
}

function dismissToast(): void {
    if (isDismissing) return;
    isDismissing = true;
    clearDismissTimer();

    gsap.to(cardRef.value, {
        clipPath: 'circle(0% at 12% 50%)',
        opacity: 0,
        scale: 0.92,
        duration: 0.38,
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
    gsap.set(cardRef.value, {
        clipPath: 'circle(0% at 12% 50%)',
        opacity: 0,
        scale: 0.96,
    });
    gsap.set(iconRef.value, { scale: 0, rotate: -45 });

    const tl = gsap.timeline({ delay: 0.04 });
    tl.to(cardRef.value, {
        clipPath: 'circle(140% at 12% 50%)',
        opacity: 0.94,
        scale: 1,
        duration: 0.55,
        ease: 'power3.out',
    });
    tl.to(iconRef.value, {
        scale: 1,
        rotate: 0,
        duration: 0.4,
        ease: 'back.out(2.2)',
    }, '-=0.32');

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
    border-radius: 1.4rem 0.6rem 1.4rem 0.6rem;
    padding: var(--spacing-md);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background-color: var(--toast-card-bg);
    backdrop-filter: blur(14px);
    border: 1px solid var(--toast-card-border);
    box-shadow: var(--shadow-toast-card);
    overflow: hidden;
    pointer-events: all;
    will-change: transform, opacity, clip-path;
}

.toast-card.toast-error   { border-color: color-mix(in srgb, var(--toast-accent-error) 45%, var(--toast-card-border)); }
.toast-card.toast-success { border-color: color-mix(in srgb, var(--toast-accent-success) 45%, var(--toast-card-border)); }
.toast-card.toast-info    { border-color: color-mix(in srgb, var(--toast-accent-info) 45%, var(--toast-card-border)); }
.toast-card.toast-warning { border-color: color-mix(in srgb, var(--toast-accent-warning) 45%, var(--toast-card-border)); }

.toast-blob {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.16;
    filter: url(#liq-gooey-sm);
    pointer-events: none;
}

.toast-icon {
    position: relative;
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: var(--border-radius-circle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--toast-text-bright);
    will-change: transform;
}

.toast-card.toast-error   .toast-icon { background: linear-gradient(135deg, var(--toast-accent-error) 0%, var(--login-aurora-violet) 100%); }
.toast-card.toast-success .toast-icon { background: linear-gradient(135deg, var(--toast-accent-success) 0%, var(--login-aurora-violet) 100%); }
.toast-card.toast-info    .toast-icon { background: linear-gradient(135deg, var(--toast-accent-info) 0%, var(--login-aurora-violet) 100%); }
.toast-card.toast-warning .toast-icon { background: linear-gradient(135deg, var(--toast-accent-warning) 0%, var(--login-aurora-violet) 100%); }

.toast-message {
    position: relative;
    flex: 1;
    color: var(--toast-text-bright);
    line-height: 1.4;
    word-break: break-word;
    font-size: var(--font-size-sm);
}

.toast-close-button {
    position: relative;
    flex-shrink: 0;
    color: var(--toast-text-bright);
    opacity: 0.7;
    transition: opacity var(--transition-fast) var(--timing-ease);
}

.toast-close-button:hover {
    opacity: 1;
}
</style>
