<template>
    <div class="ClockPicker">
        <div class="clock-display">
            <span
                class="clock-digit"
                :class="{ active: step === 'hour' }"
                @click="step = 'hour'"
            >{{ displayHour }}</span>
            <span class="clock-sep">:</span>
            <span
                class="clock-digit"
                :class="{ active: step === 'minute' }"
                @click="step = 'minute'"
            >{{ displayMinute }}</span>
            <div class="ampm-toggle">
                <button
                    type="button"
                    class="ampm-btn"
                    :class="{ active: isAM }"
                    @click="setAM(true)"
                >AM</button>
                <button
                    type="button"
                    class="ampm-btn"
                    :class="{ active: !isAM }"
                    @click="setAM(false)"
                >PM</button>
            </div>
        </div>

        <div class="clock-face-container">
            <svg
                class="clock-face"
                viewBox="0 0 200 200"
                @mousedown="onMouseDown"
                @mousemove="onMouseMove"
                @mouseup="onMouseUp"
                @touchstart.prevent="onTouchStart"
                @touchmove.prevent="onTouchMove"
                @touchend.prevent="onTouchEnd"
            >
                <!-- Clock face background -->
                <circle cx="100" cy="100" r="95" fill="var(--bg-gray)" stroke="var(--gray-lighter)" stroke-width="1"/>

                <!-- Hand line -->
                <line
                    x1="100" y1="100"
                    :x2="handX" :y2="handY"
                    stroke="var(--sky)" stroke-width="2" stroke-linecap="round"
                />

                <!-- Center dot -->
                <circle cx="100" cy="100" r="3" fill="var(--sky)"/>

                <!-- Hour / minute marks and labels -->
                <g v-for="item in clockItems" :key="item.value">
                    <circle
                        :cx="item.cx" :cy="item.cy" r="14"
                        :fill="item.value === selectedValue ? 'var(--sky)' : 'transparent'"
                        class="clock-item-circle"
                        @click="selectValue(item.value)"
                    />
                    <text
                        :x="item.cx" :y="item.cy"
                        text-anchor="middle"
                        dominant-baseline="central"
                        font-size="11"
                        :fill="item.value === selectedValue ? 'var(--white)' : 'var(--gray-medium)'"
                        class="clock-item-text"
                        @click="selectValue(item.value)"
                    >{{ item.label }}</text>
                </g>

                <!-- Drag handle -->
                <circle
                    :cx="handX" :cy="handY" r="9"
                    fill="var(--sky)"
                    class="clock-handle"
                />
            </svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const emit = defineEmits<{
    (e: 'select', timeStr: string): void;
}>();

type Step = 'hour' | 'minute';

const step = ref<Step>('hour');
const hour12 = ref<number>(12);   // 1-12
const minute = ref<number>(0);    // 0-59 (snaps to 5)
const isAM = ref<boolean>(true);

// ── Display ───────────────────────────────────────────────────────────────────
const displayHour = computed<string>(() => String(hour12.value).padStart(2, '0'));
const displayMinute = computed<string>(() => String(minute.value).padStart(2, '0'));

const selectedValue = computed<number>(() =>
    step.value === 'hour' ? hour12.value : minute.value / 5
);

// ── Clock items ───────────────────────────────────────────────────────────────
interface ClockItem {
    value: number;
    label: string;
    cx: number;
    cy: number;
}

const clockItems = computed<ClockItem[]>(() => {
    if (step.value === 'hour') {
        return Array.from({ length: 12 }, (_, i) => {
            const n = i + 1;
            const angle = (n / 12) * 2 * Math.PI - Math.PI / 2;
            return {
                value: n,
                label: String(n),
                cx: 100 + 72 * Math.cos(angle),
                cy: 100 + 72 * Math.sin(angle),
            };
        });
    } else {
        return Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            return {
                value: i,
                label: String(i * 5).padStart(2, '0'),
                cx: 100 + 72 * Math.cos(angle),
                cy: 100 + 72 * Math.sin(angle),
            };
        });
    }
});

// ── Hand ──────────────────────────────────────────────────────────────────────
const handAngle = computed<number>(() => {
    if (step.value === 'hour') {
        return ((hour12.value % 12) / 12) * 2 * Math.PI - Math.PI / 2;
    } else {
        return ((minute.value / 60)) * 2 * Math.PI - Math.PI / 2;
    }
});

const handX = computed<number>(() => 100 + 72 * Math.cos(handAngle.value));
const handY = computed<number>(() => 100 + 72 * Math.sin(handAngle.value));

// ── Drag state ────────────────────────────────────────────────────────────────
const dragging = ref(false);

function angleToValue(cx: number, cy: number, svgEl: SVGSVGElement): void {
    const rect = svgEl.getBoundingClientRect();
    const scale = 200 / rect.width;
    const px = (cx - rect.left) * scale;
    const py = (cy - rect.top) * scale;
    const angle = Math.atan2(py - 100, px - 100) + Math.PI / 2;
    const normalized = angle < 0 ? angle + 2 * Math.PI : angle;

    if (step.value === 'hour') {
        let h = Math.round((normalized / (2 * Math.PI)) * 12);
        if (h === 0) h = 12;
        hour12.value = h;
    } else {
        let m = Math.round((normalized / (2 * Math.PI)) * 12) * 5;
        if (m >= 60) m = 0;
        minute.value = m;
    }
}

function onMouseDown(e: MouseEvent): void {
    dragging.value = true;
    angleToValue(e.clientX, e.clientY, e.currentTarget as SVGSVGElement);
}

function onMouseMove(e: MouseEvent): void {
    if (!dragging.value) return;
    angleToValue(e.clientX, e.clientY, e.currentTarget as SVGSVGElement);
}

function onMouseUp(_e: MouseEvent): void {
    if (!dragging.value) return;
    dragging.value = false;
    advanceStep();
}

function onTouchStart(e: TouchEvent): void {
    dragging.value = true;
    const t = e.touches[0];
    angleToValue(t.clientX, t.clientY, e.currentTarget as SVGSVGElement);
}

function onTouchMove(e: TouchEvent): void {
    if (!dragging.value) return;
    const t = e.touches[0];
    angleToValue(t.clientX, t.clientY, e.currentTarget as SVGSVGElement);
}

function onTouchEnd(_e: TouchEvent): void {
    if (!dragging.value) return;
    dragging.value = false;
    advanceStep();
}

function selectValue(v: number): void {
    if (step.value === 'hour') {
        hour12.value = v;
    } else {
        minute.value = v * 5;
    }
    advanceStep();
}

function advanceStep(): void {
    if (step.value === 'hour') {
        step.value = 'minute';
    } else {
        // Emit final value
        const h24 = isAM.value
            ? (hour12.value === 12 ? 0 : hour12.value)
            : (hour12.value === 12 ? 12 : hour12.value + 12);
        const timeStr = `${String(h24).padStart(2, '0')}:${String(minute.value).padStart(2, '0')}`;
        emit('select', timeStr);
    }
}

function setAM(am: boolean): void {
    isAM.value = am;
}
</script>

<style scoped>
.ClockPicker {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-small);
    padding: var(--spacing-small);
    background: var(--white);
    border-radius: var(--border-radius);
    min-width: 220px;
}

.clock-display {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: var(--bg-gray);
    border-radius: var(--border-radius);
    padding: var(--spacing-xs) var(--padding-small);
    width: 100%;
    justify-content: center;
}

.clock-digit {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--gray-medium);
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background-color var(--transition-fast);
}

.clock-digit.active {
    background-color: var(--sky);
    color: var(--white);
}

.clock-sep {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--gray-light);
}

.ampm-toggle {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-left: var(--spacing-xs);
}

.ampm-btn {
    font-size: var(--font-size-xs);
    padding: 2px 4px;
    background: var(--gray-lighter);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: var(--gray-medium);
    transition: background-color var(--transition-fast);
}

.ampm-btn.active {
    background-color: var(--sky);
    color: var(--white);
}

.clock-face-container {
    width: 180px;
    height: 180px;
}

.clock-face {
    width: 100%;
    height: 100%;
    user-select: none;
    cursor: pointer;
}

.clock-item-circle {
    cursor: pointer;
    transition: fill var(--transition-fast);
}

.clock-item-circle:hover {
    fill: var(--gray-lighter);
}

.clock-item-text {
    cursor: pointer;
    pointer-events: none;
    font-family: var(--font-family-base);
}

.clock-handle {
    cursor: pointer;
}
</style>
