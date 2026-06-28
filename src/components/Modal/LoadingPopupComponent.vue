<template>
    <div ref="containerRef" class="loading-popup-container" aria-live="polite" aria-label="Procesando">
        <div ref="cardRef" class="loading-popup-card">
            <!-- SVG loader inline — igual que el de la pantalla de carga, más compacto -->
            <svg ref="svgRef" viewBox="0 0 120 24" width="96" height="20" aria-hidden="true">
                <defs>
                    <linearGradient id="lp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stop-color="var(--accent-pink)"/>
                        <stop offset="100%" stop-color="var(--purple-1)"/>
                    </linearGradient>
                    <mask id="lp-mask">
                        <rect ref="maskRef" x="0" y="0" width="0" height="24" fill="white"/>
                    </mask>
                </defs>
                <!-- Base -->
                <line x1="18" y1="12" x2="102" y2="12" stroke="var(--gray-lighter)" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="12"  cy="12" r="6" fill="var(--gray-lighter)"/>
                <circle cx="60"  cy="12" r="6" fill="var(--gray-lighter)"/>
                <circle cx="108" cy="12" r="6" fill="var(--gray-lighter)"/>
                <!-- Capa animada -->
                <g mask="url(#lp-mask)">
                    <line x1="18" y1="12" x2="102" y2="12" stroke="url(#lp-grad)" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="12"  cy="12" r="6" fill="url(#lp-grad)"/>
                    <circle cx="60"  cy="12" r="6" fill="url(#lp-grad)"/>
                    <circle cx="108" cy="12" r="6" fill="url(#lp-grad)"/>
                </g>
            </svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';
import Application from '@/models/application';

// #region PROPERTIES
const containerRef = ref<HTMLElement | null>(null);
const cardRef      = ref<HTMLElement | null>(null);
const maskRef      = ref<SVGRectElement | null>(null);

let loopTween: gsap.core.Tween | null = null;
// #endregion

// #region METHODS
function show(): void {
    const container = containerRef.value;
    const card      = cardRef.value;
    const mask      = maskRef.value;
    if (!container || !card) return;

    gsap.set(container, { display: 'flex', pointerEvents: 'all' });

    // Card: scale-in con bounce
    gsap.fromTo(card,
        { scale: 0.7, opacity: 0 },
        { scale: 1,   opacity: 1, duration: 0.38, ease: 'back.out(2)' }
    );

    // Overlay fade-in
    gsap.fromTo(container,
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' }
    );

    // SVG mask: oscila de 0→120→0 en loop mientras esté visible
    if (mask) {
        gsap.set(mask, { attr: { width: 0 } });
        loopTween = gsap.to(mask, {
            attr: { width: 120 },
            duration: 0.9,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: -1,
            repeatDelay: 0.15,
        });
    }
}

function hide(): void {
    const container = containerRef.value;
    const card      = cardRef.value;
    if (!container || !card) return;

    if (loopTween) {
        loopTween.kill();
        loopTween = null;
    }

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(container, { display: 'none', pointerEvents: 'none' });
            if (maskRef.value) gsap.set(maskRef.value, { attr: { width: 0 } });
        },
    });

    tl.to(card,      { scale: 0.85, opacity: 0, duration: 0.2, ease: 'power2.in' })
      .to(container, { opacity: 0, duration: 0.18, ease: 'power2.in' }, '-=0.1');
}
// #endregion

// #region LIFECYCLE
onMounted(() => {
    gsap.set(containerRef.value, { display: 'none', opacity: 0, pointerEvents: 'none' });

    Application.eventBus.on('show-loading-menu', show);
    Application.eventBus.on('hide-loading-menu', hide);
});

onBeforeUnmount(() => {
    Application.eventBus.off('show-loading-menu', show);
    Application.eventBus.off('hide-loading-menu', hide);
    if (loopTween) loopTween.kill();
});
// #endregion
</script>

<style scoped>
.loading-popup-container {
    position: fixed;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background-color: var(--overlay-dark);
    z-index: var(--z-toast);
    pointer-events: none;
    will-change: opacity;
}

.loading-popup-card {
    background-color: var(--white);
    padding: var(--spacing-2xl) calc(var(--spacing-2xl) * 1.5);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    will-change: transform, opacity;
}
</style>
