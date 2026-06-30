import gsap from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import type { Directive } from 'vue';

gsap.registerPlugin(Physics2DPlugin);

// #region CONSTANTS
const HOST_ID = 'spark-host';
const SHARD_COUNT = 8;
const SHARD_SHAPE = 'M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z';
// #endregion

// #region GLOBAL ASSETS
/** Single full-viewport SVG overlay that hosts every spark burst (idempotent). */
function ensureHost(): SVGSVGElement {
    const existing = document.getElementById(HOST_ID) as SVGSVGElement | null;
    if (existing) {
        return existing;
    }

    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
    host.id = HOST_ID;
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;overflow:visible;z-index:var(--z-tooltip);';
    host.innerHTML = `<defs><symbol id="spark-shard" viewBox="0 0 10 10"><path d="${SHARD_SHAPE}"/></symbol></defs>`;
    document.body.appendChild(host);
    return host;
}

function readSparkDuration(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--spark-duration');
    return parseFloat(raw) || 0.55;
}

function readSparkSize(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--spark-particle-size');
    return parseFloat(raw) || 14;
}
// #endregion

// #region BURST
/** Spawns a short-lived burst of SVG shards at (clientX, clientY), tinted with the element's own color. */
function burst(el: HTMLElement, clientX: number, clientY: number): void {
    const host = ensureHost();
    const color = getComputedStyle(el).color;
    const size = readSparkSize();
    const duration = readSparkDuration();

    for (let i = 0; i < SHARD_COUNT; i++) {
        const shard = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        shard.setAttribute('href', '#spark-shard');
        shard.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#spark-shard');
        shard.setAttribute('width', String(size));
        shard.setAttribute('height', String(size));
        shard.style.fill = color;
        host.appendChild(shard);

        gsap.set(shard, { x: clientX - size / 2, y: clientY - size / 2, scale: 0.4, opacity: 1, transformOrigin: '50% 50%' });
        gsap.to(shard, {
            physics2D: {
                velocity: gsap.utils.random(90, 200),
                angle: gsap.utils.random(0, 360),
                gravity: 380,
            },
            scale: 0,
            opacity: 0,
            duration,
            ease: 'power2.out',
            onComplete: () => shard.remove(),
        });
    }
}
// #endregion

// #region DIRECTIVE
/** `v-spark` — emits a burst of SVG "chispas" from the click point. Sibling to `v-liquid`. */
export const vSpark: Directive = {
    mounted(el: HTMLElement) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const onClick = (event: MouseEvent): void => {
            burst(el, event.clientX, event.clientY);
        };

        el.addEventListener('click', onClick);
        (el as unknown as Record<string, unknown>).__sparkHandler = onClick;
    },

    unmounted(el: HTMLElement) {
        const handler = (el as unknown as Record<string, unknown>).__sparkHandler as ((event: MouseEvent) => void) | undefined;
        if (!handler) {
            return;
        }

        el.removeEventListener('click', handler);
        delete (el as unknown as Record<string, unknown>).__sparkHandler;
    },
};
// #endregion
