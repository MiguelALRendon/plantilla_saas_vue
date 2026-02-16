<template>
    <div class="toast-card" :class="[setToastClass(), { show: showToast }]">
        <div class="toast" :class="setToastClass()" @mouseenter="pauseDismiss" @mouseleave="resumeDismiss">
            <span>{{ toast.message }}</span>
            <button class="toast-close-button" @click="handleClose">
                <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { Toast } from '@/models/Toast';
import { ToastType } from '@/enums/ToastType';
import GGICONS, { GGCLASS } from '@/constants/ggicons';

export default {
    name: 'ToastItemComponent',
    emits: ['remove'],
    props: {
        toast: {
            type: Object as PropType<Toast>,
            required: true
        }
    },
    methods: {
        setToastClass(): string {
            switch (this.toast.type) {
                case ToastType.ERROR:
                    return 'toast-error';
                case ToastType.SUCCESS:
                    return 'toast-success';
                case ToastType.INFO:
                    return 'toast-info';
                case ToastType.WARNING:
                    return 'toast-warning';
                default:
                    return '';
            }
        },
        startDismissTimer() {
            this.clearDismissTimer();
            this.dismissStartAt = Date.now();
            this.dismissTimerId = window.setTimeout(() => {
                this.dismissToast();
            }, this.remainingDismissMs);
        },
        clearDismissTimer() {
            if (this.dismissTimerId !== null) {
                clearTimeout(this.dismissTimerId);
                this.dismissTimerId = null;
            }
        },
        clearRemoveTimer() {
            if (this.removeTimerId !== null) {
                clearTimeout(this.removeTimerId);
                this.removeTimerId = null;
            }
        },
        pauseDismiss() {
            if (this.isDismissing || this.dismissTimerId === null) {
                return;
            }
            const elapsed = Date.now() - this.dismissStartAt;
            this.remainingDismissMs = Math.max(this.remainingDismissMs - elapsed, 0);
            this.clearDismissTimer();
        },
        resumeDismiss() {
            if (this.isDismissing || this.remainingDismissMs <= 0) {
                return;
            }
            this.startDismissTimer();
        },
        dismissToast() {
            if (this.isDismissing) {
                return;
            }
            this.isDismissing = true;
            this.showToast = false;
            this.clearDismissTimer();
            this.clearRemoveTimer();
            this.removeTimerId = window.setTimeout(() => {
                this.$emit('remove', this.toast.id);
            }, 300);
        },
        handleClose() {
            this.dismissToast();
        }
    },
    mounted() {
        setTimeout(() => {
            this.showToast = true;
        }, 50);
        this.startDismissTimer();
    },
    beforeUnmount() {
        this.clearDismissTimer();
        this.clearRemoveTimer();
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            showToast: false,
            dismissTimerId: null as number | null,
            removeTimerId: null as number | null,
            dismissStartAt: 0,
            remainingDismissMs: 5000,
            isDismissing: false
        };
    }
};
</script>

<style scoped>
.toast-card {
    position: relative;
    width: 100%;
    height: 3rem;
    border-radius: var(--border-radius);
    padding: var(--spacing-xs);
    box-sizing: border-box;
    background-color: var(--white);
    transform: var(--transform-translateX-hide);
    transition: var(--transition-normal) var(--timing-bounce);
    opacity: 0.75;
}
.toast-card.show {
    transform: translateX(0%);
}
.toast-card:hover {
    opacity: 1;
}

.toast {
    width: 100%;
    height: 100%;
    border-radius: calc(var(--border-radius) / 1.5);
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    padding-inline: 0.25rem;
    display: flex;
    justify-content: space-between;
    pointer-events: all;
}

.toast-card.toast-error {
    background-color: var(--accent-red);
}
.toast-card.toast-success {
    background-color: var(--green-main);
}
.toast-card.toast-info {
    background-color: var(--sky);
}
.toast-card.toast-warning {
    background-color: var(--btn-warning);
}

.toast span {
    color: var(--white) !important;
    width: 90%;
}
</style>
