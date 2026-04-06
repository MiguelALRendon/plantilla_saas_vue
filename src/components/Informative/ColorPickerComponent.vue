<template>
    <div class="ColorPicker">
        <!-- HSL Wheel (canvas) -->
        <div class="color-wheel-container">
            <canvas
                ref="wheelCanvas"
                class="color-wheel"
                :width="WHEEL_SIZE"
                :height="WHEEL_SIZE"
                @mousedown="onWheelMouseDown"
                @mousemove="onWheelMouseMove"
                @mouseup="stopDrag"
                @mouseleave="stopDrag"
                @touchstart.prevent="onWheelTouchStart"
                @touchmove.prevent="onWheelTouchMove"
                @touchend.prevent="stopDrag"
            ></canvas>
            <!-- Selection dot -->
            <div
                class="color-dot"
                :style="{ left: `${dotX}px`, top: `${dotY}px` }"
            ></div>
        </div>

        <!-- Brightness slider -->
        <div class="slider-row">
            <label class="slider-label">L</label>
            <input
                type="range"
                class="brightness-slider"
                min="10" max="90" step="1"
                :value="lightness"
                @input="onLightnessInput"
                :style="{ background: sliderBg }"
            />
        </div>

        <!-- Color values -->
        <div class="color-values">
            <div class="color-value-row">
                <span class="color-value-label">HEX</span>
                <span class="color-value-text">{{ hexValue }}</span>
                <button type="button" class="copy-btn" @click="copy(hexValue)">
                    <span :class="[GGCLASS]">{{ GGICONS.CONTENT_COPY }}</span>
                </button>
            </div>
            <div class="color-value-row">
                <span class="color-value-label">RGB</span>
                <span class="color-value-text">{{ rgbValue }}</span>
                <button type="button" class="copy-btn" @click="copy(rgbValue)">
                    <span :class="[GGCLASS]">{{ GGICONS.CONTENT_COPY }}</span>
                </button>
            </div>
            <div class="color-value-row">
                <span class="color-value-label">HSL</span>
                <span class="color-value-text">{{ hslValue }}</span>
                <button type="button" class="copy-btn" @click="copy(hslValue)">
                    <span :class="[GGCLASS]">{{ GGICONS.CONTENT_COPY }}</span>
                </button>
            </div>
        </div>

        <!-- Color preview bar -->
        <div class="color-preview-bar" :style="{ backgroundColor: hexValue }"></div>
    </div>
</template>

<script setup lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { computed, onMounted, ref, watch } from 'vue';

interface Props {
    modelValue?: string; // hex color e.g. #ffffff
}

const props = withDefaults(defineProps<Props>(), { modelValue: '#ffffff' });

const emit = defineEmits<{
    (e: 'update:modelValue', hex: string): void;
}>();

const WHEEL_SIZE = 200;
const CENTER = WHEEL_SIZE / 2;
const RING_INNER = 0;
const RING_OUTER = CENTER - 4;

const wheelCanvas = ref<HTMLCanvasElement | null>(null);

// HSL state
const hue = ref<number>(0);          // 0–360
const saturation = ref<number>(100); // 0–100
const lightness = ref<number>(50);   // 10–90

// Dot position (pixel offset within canvas container)
const dotX = ref<number>(CENTER);
const dotY = ref<number>(CENTER - RING_OUTER);

const dragging = ref(false);

// ── Color math ────────────────────────────────────────────────────────────────
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function toHex(r: number, g: number, b: number): string {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const hexValue = computed<string>(() => {
    const [r, g, b] = hslToRgb(hue.value, saturation.value, lightness.value);
    return toHex(r, g, b);
});

const rgbValue = computed<string>(() => {
    const [r, g, b] = hslToRgb(hue.value, saturation.value, lightness.value);
    return `rgb(${r}, ${g}, ${b})`;
});

const hslValue = computed<string>(() =>
    `hsl(${Math.round(hue.value)}, ${Math.round(saturation.value)}%, ${Math.round(lightness.value)}%)`
);

const sliderBg = computed<string>(() =>
    `linear-gradient(to right, hsl(${hue.value}, ${saturation.value}%, 10%), hsl(${hue.value}, ${saturation.value}%, 50%), hsl(${hue.value}, ${saturation.value}%, 90%))`
);

// ── Initialize from prop ──────────────────────────────────────────────────────
function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToCanvasPos(h: number, s: number): { x: number; y: number } {
    const angle = (h / 360) * 2 * Math.PI - Math.PI / 2;
    const r = (s / 100) * RING_OUTER;
    return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
}

function initFromProp(): void {
    if (props.modelValue && /^#[0-9a-fA-F]{6}$/.test(props.modelValue)) {
        const { h, s, l } = hexToHsl(props.modelValue);
        hue.value = h;
        saturation.value = s;
        lightness.value = Math.min(90, Math.max(10, l));
        const pos = hslToCanvasPos(h, s);
        dotX.value = pos.x;
        dotY.value = pos.y;
    }
}

// ── Draw wheel ────────────────────────────────────────────────────────────────
function drawWheel(): void {
    const canvas = wheelCanvas.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    // Draw HSL wheel as conic gradient approximation using angle segments
    const segments = 360;
    for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * 2 * Math.PI - Math.PI / 2;
        const angle2 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
        const h = i;

        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER);
        ctx.arc(CENTER, CENTER, RING_OUTER, angle1, angle2);
        ctx.closePath();

        const grad = ctx.createRadialGradient(CENTER, CENTER, RING_INNER, CENTER, CENTER, RING_OUTER);
        grad.addColorStop(0, `hsl(${h}, 0%, ${lightness.value}%)`);
        grad.addColorStop(1, `hsl(${h}, 100%, ${lightness.value}%)`);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    // White fade to indicate center = no saturation
    const centerGrad = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, RING_OUTER * 0.2);
    centerGrad.addColorStop(0, `hsla(0, 0%, ${lightness.value}%, 1)`);
    centerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RING_OUTER * 0.2, 0, 2 * Math.PI);
    ctx.fill();
}

watch(() => lightness.value, drawWheel);

// ── Drag interactions ─────────────────────────────────────────────────────────
function canvasCoords(clientX: number, clientY: number): { x: number; y: number } {
    const rect = wheelCanvas.value!.getBoundingClientRect();
    const scale = WHEEL_SIZE / rect.width;
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
}

function applyCoords(x: number, y: number): void {
    const dx = x - CENTER;
    const dy = y - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, RING_OUTER);
    const angle = Math.atan2(dy, dx);

    hue.value = ((angle + Math.PI / 2) / (2 * Math.PI)) * 360;
    if (hue.value < 0) hue.value += 360;
    saturation.value = (clampedDist / RING_OUTER) * 100;

    dotX.value = CENTER + clampedDist * Math.cos(angle);
    dotY.value = CENTER + clampedDist * Math.sin(angle);

    emit('update:modelValue', hexValue.value);
}

function onWheelMouseDown(e: MouseEvent): void {
    dragging.value = true;
    const { x, y } = canvasCoords(e.clientX, e.clientY);
    applyCoords(x, y);
}

function onWheelMouseMove(e: MouseEvent): void {
    if (!dragging.value) return;
    const { x, y } = canvasCoords(e.clientX, e.clientY);
    applyCoords(x, y);
}

function onWheelTouchStart(e: TouchEvent): void {
    dragging.value = true;
    const t = e.touches[0];
    const { x, y } = canvasCoords(t.clientX, t.clientY);
    applyCoords(x, y);
}

function onWheelTouchMove(e: TouchEvent): void {
    if (!dragging.value) return;
    const t = e.touches[0];
    const { x, y } = canvasCoords(t.clientX, t.clientY);
    applyCoords(x, y);
}

function stopDrag(): void {
    dragging.value = false;
}

function onLightnessInput(e: Event): void {
    lightness.value = Number((e.target as HTMLInputElement).value);
    emit('update:modelValue', hexValue.value);
}

async function copy(text: string): Promise<void> {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
    }
}

onMounted(() => {
    initFromProp();
    drawWheel();
});
</script>

<style scoped>
.ColorPicker {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-small);
    padding: var(--spacing-small);
    background: var(--white);
    border-radius: var(--border-radius);
    min-width: 220px;
}

.color-wheel-container {
    position: relative;
    width: 200px;
    height: 200px;
    cursor: crosshair;
}

.color-wheel {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    display: block;
}

.color-dot {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid var(--white);
    box-shadow: 0 0 3px rgba(0,0,0,0.5);
    background: transparent;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.slider-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    width: 100%;
}

.slider-label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--gray-medium);
    min-width: 14px;
}

.brightness-slider {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    appearance: none;
    outline: none;
    border: none;
    cursor: pointer;
}

.brightness-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--white);
    border: 2px solid var(--gray-light);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    cursor: pointer;
}

.color-values {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.color-value-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-xs);
    background: var(--bg-gray);
    border-radius: 4px;
    padding: 2px 6px;
}

.color-value-label {
    font-weight: 700;
    color: var(--gray-light);
    min-width: 28px;
}

.color-value-text {
    flex: 1;
    color: var(--gray-medium);
    font-family: monospace;
    font-size: 0.7rem;
}

.copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    color: var(--gray-light);
    transition: color var(--transition-fast);
}

.copy-btn:hover {
    color: var(--sky);
}

.copy-btn span {
    font-size: 0.9rem;
}

.color-preview-bar {
    width: 100%;
    height: 20px;
    border-radius: var(--border-radius);
    border: 1px solid var(--gray-lighter);
    transition: background-color var(--transition-fast);
}
</style>
