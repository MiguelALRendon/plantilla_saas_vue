import gsap from 'gsap';
import type { Directive } from 'vue';

import { ensureGooFilter } from '@/utils/liquid_filter';

// #region CONSTANTS
/** How far (px) the liquid field extends beyond the button on each side. */
const BLEED = 40;

const STYLE_HOST_ID = 'liq-style-host';
// #endregion

// #region GLOBAL ASSETS
function ensureAssets(): void {
    ensureGooFilter();

    if (!document.getElementById(STYLE_HOST_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_HOST_ID;
        style.textContent = `
.liq-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.liq-wrap.liq-block {
    display: flex;
    width: 100%;
}
.liq-field {
    position: absolute;
    pointer-events: none;
    filter: url(#liq-gooey);
    z-index: 0;
    overflow: visible;
}
.liq-pill, .liq-blob, .liq-shadow {
    position: absolute;
    top: 0;
    left: 0;
}
.liq-pill  { border-radius: 100vmax; }
.liq-blob,
.liq-shadow { border-radius: 50%; }
`;
        document.head.appendChild(style);
    }
}
// #endregion

// #region TYPES
interface LiqState {
    wrapper:      HTMLElement;
    blob:         HTMLElement;
    shadow:       HTMLElement;
    cx:  number;
    cy:  number;
    cx2: number;
    cy2: number;
    onMouseEnter: (e: MouseEvent) => void;
    onMouseMove:  (e: MouseEvent) => void;
    onMouseLeave: () => void;
    onMouseDown:  () => void;
    onMouseUp:    () => void;
    /** Saved inline styles for restore on unmount */
    saved: Record<string, string>;
}
// #endregion

// #region DIRECTIVE
export const vLiquid: Directive = {
    mounted(el: HTMLElement) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        ensureAssets();

        const cs = getComputedStyle(el);

        // Read everything BEFORE DOM mutation.
        const fillColor  = cs.backgroundColor;
        const btnRadius  = cs.borderRadius;
        const rect       = el.getBoundingClientRect();
        const btnW       = rect.width  || parseFloat(cs.width)  || 180;
        const btnH       = rect.height || parseFloat(cs.height) || 36;
        const parentW    = el.parentElement?.getBoundingClientRect().width ?? 0;

        // Margins are often set via CSS class (not inline) — read computed values.
        const marginTop    = cs.marginTop;
        const marginBottom = cs.marginBottom;
        const marginLeft   = cs.marginLeft;
        const marginRight  = cs.marginRight;

        // Blob sizes proportional to HEIGHT so short, wide buttons deform visibly.
        const blobSize   = btnH * 1.5;
        const shadowSize = btnH * 1.9;

        const fieldW = btnW + BLEED * 2;
        const fieldH = btnH + BLEED * 2;

        // top-left positions within .liq-field so that blob center = field center.
        const cx  = (fieldW - blobSize)  / 2;
        const cy  = (fieldH - blobSize)  / 2;
        const cx2 = (fieldW - shadowSize) / 2;
        const cy2 = (fieldH - shadowSize) / 2;

        // ── Build DOM ───────────────────────────────────────────────────────
        const wrapper = document.createElement('div');
        wrapper.className = 'liq-wrap';
        if (parentW > 0 && btnW >= parentW * 0.88) wrapper.classList.add('liq-block');

        const field = document.createElement('div');
        field.className  = 'liq-field';
        field.style.cssText = `top:${-BLEED}px;left:${-BLEED}px;width:${fieldW}px;height:${fieldH}px;`;

        const pill = document.createElement('div');
        pill.className  = 'liq-pill';
        pill.style.cssText = `width:${btnW}px;height:${btnH}px;top:${BLEED}px;left:${BLEED}px;background-color:${fillColor};border-radius:${btnRadius};`;

        const shadow = document.createElement('div');
        shadow.className  = 'liq-shadow';
        shadow.style.cssText = `width:${shadowSize}px;height:${shadowSize}px;background-color:${fillColor};opacity:0;`;

        const blob = document.createElement('div');
        blob.className  = 'liq-blob';
        blob.style.cssText = `width:${blobSize}px;height:${blobSize}px;background-color:${fillColor};opacity:0;`;

        field.append(pill, shadow, blob);
        el.parentNode!.insertBefore(wrapper, el);
        wrapper.append(field, el);

        // Transfer margins from button to wrapper — if margins stay on the button
        // (a row-flex child), the button floats away from the pill that anchors at top:0.
        wrapper.style.marginTop    = marginTop;
        wrapper.style.marginBottom = marginBottom;
        wrapper.style.marginLeft   = marginLeft;
        wrapper.style.marginRight  = marginRight;

        // Save current inline values so unmount can restore them precisely.
        const saved: Record<string, string> = {
            bg:           el.style.backgroundColor,
            border:       el.style.borderColor,
            position:     el.style.position,
            zIndex:       el.style.zIndex,
            marginTop:    el.style.marginTop,
            marginBottom: el.style.marginBottom,
            marginLeft:   el.style.marginLeft,
            marginRight:  el.style.marginRight,
        };

        el.style.backgroundColor = 'transparent';
        el.style.borderColor     = 'transparent';
        el.style.position        = 'relative';
        el.style.zIndex          = '1';
        el.style.marginTop       = '0';
        el.style.marginBottom    = '0';
        el.style.marginLeft      = '0';
        el.style.marginRight     = '0';

        // Initial blob positions.
        gsap.set(blob,   { x: cx,  y: cy  });
        gsap.set(shadow, { x: cx2, y: cy2 });

        const blobX = gsap.quickTo(blob,   'x',       { duration: 0.4,  ease: 'power3.out' });
        const blobY = gsap.quickTo(blob,   'y',       { duration: 0.4,  ease: 'power3.out' });
        const blobO = gsap.quickTo(blob,   'opacity', { duration: 0.2 });
        const shadX = gsap.quickTo(shadow, 'x',       { duration: 0.65, ease: 'power2.out' });
        const shadY = gsap.quickTo(shadow, 'y',       { duration: 0.65, ease: 'power2.out' });
        const shadO = gsap.quickTo(shadow, 'opacity', { duration: 0.3 });

        function toFieldCoords(e: MouseEvent): { tx: number; ty: number; tx2: number; ty2: number } {
            const r  = wrapper.getBoundingClientRect();
            const dx = (e.clientX - r.left  - btnW / 2) * 0.6;
            const dy = (e.clientY - r.top   - btnH / 2) * 0.6;
            return { tx: cx + dx, ty: cy + dy, tx2: cx2 + dx * 0.7, ty2: cy2 + dy * 0.7 };
        }

        const state: LiqState = {
            wrapper, blob, shadow, cx, cy, cx2, cy2, saved,

            onMouseEnter(e: MouseEvent) {
                blobO(1); shadO(0.55);
                const { tx, ty, tx2, ty2 } = toFieldCoords(e);
                blobX(tx); blobY(ty); shadX(tx2); shadY(ty2);
            },
            onMouseMove(e: MouseEvent) {
                const { tx, ty, tx2, ty2 } = toFieldCoords(e);
                blobX(tx); blobY(ty); shadX(tx2); shadY(ty2);
            },
            onMouseLeave() {
                blobX(cx); blobY(cy); blobO(0);
                shadX(cx2); shadY(cy2); shadO(0);
            },
            onMouseDown() {
                gsap.to([blob, shadow], { scale: 1.22, duration: 0.12, ease: 'power2.out' });
            },
            onMouseUp() {
                gsap.to([blob, shadow], { scale: 1, duration: 0.55, ease: 'elastic.out(1,0.45)' });
            },
        };

        wrapper.addEventListener('mouseenter', state.onMouseEnter);
        wrapper.addEventListener('mousemove',  state.onMouseMove);
        wrapper.addEventListener('mouseleave', state.onMouseLeave);
        wrapper.addEventListener('mousedown',  state.onMouseDown);
        wrapper.addEventListener('mouseup',    state.onMouseUp);

        (el as unknown as Record<string, unknown>).__liqState = state;
    },

    unmounted(el: HTMLElement) {
        const state = (el as unknown as Record<string, unknown>).__liqState as LiqState | undefined;
        if (!state) return;

        state.wrapper.removeEventListener('mouseenter', state.onMouseEnter);
        state.wrapper.removeEventListener('mousemove',  state.onMouseMove);
        state.wrapper.removeEventListener('mouseleave', state.onMouseLeave);
        state.wrapper.removeEventListener('mousedown',  state.onMouseDown);
        state.wrapper.removeEventListener('mouseup',    state.onMouseUp);

        gsap.killTweensOf([state.blob, state.shadow]);

        // Restore button inline styles.
        el.style.backgroundColor = state.saved.bg;
        el.style.borderColor     = state.saved.border;
        el.style.position        = state.saved.position;
        el.style.zIndex          = state.saved.zIndex;
        el.style.marginTop       = state.saved.marginTop;
        el.style.marginBottom    = state.saved.marginBottom;
        el.style.marginLeft      = state.saved.marginLeft;
        el.style.marginRight     = state.saved.marginRight;

        const parent = state.wrapper.parentNode;
        if (parent) {
            parent.insertBefore(el, state.wrapper);
            parent.removeChild(state.wrapper);
        }

        delete (el as unknown as Record<string, unknown>).__liqState;
    },
};
// #endregion
