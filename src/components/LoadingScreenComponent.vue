<template>
    <Teleport to="body">
        <div ref="screenRef" class="loading-screen" aria-live="polite" aria-label="Cargando aplicación">

            <div class="loading-content">
                <!-- Logo de marca (desde AppConfiguration) -->
                <img
                    v-if="logoSrc"
                    ref="logoRef"
                    :src="logoSrc"
                    :alt="appName"
                    class="loading-logo"
                />
                <div v-else ref="logoRef" class="loading-logo-placeholder" aria-hidden="true">
                    <svg viewBox="0 0 48 48" width="80" height="80" fill="none">
                        <rect width="48" height="48" rx="12" fill="url(#pl-grad)"/>
                        <defs>
                            <linearGradient id="pl-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="var(--accent-pink)"/>
                                <stop offset="100%" stop-color="var(--purple-1)"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <span ref="nameRef" class="loading-app-name" aria-hidden="true">{{ appName }}</span>

                <!-- SVG loader: 3 puntos que se llenan de izq a der, una sola vez -->
                <div ref="loaderRef" class="loading-svg-wrapper" aria-hidden="true">
                    <svg viewBox="0 0 120 24" width="120" height="24">
                        <defs>
                            <linearGradient id="ls-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%"   stop-color="var(--accent-pink)"/>
                                <stop offset="100%" stop-color="var(--purple-1)"/>
                            </linearGradient>
                            <mask id="ls-mask">
                                <rect ref="maskRectRef" class="ls-mask-rect" x="0" y="0" width="0" height="24" fill="white"/>
                            </mask>
                        </defs>
                        <!-- Base gris -->
                        <line x1="18" y1="12" x2="102" y2="12" stroke="var(--gray-lighter)" stroke-width="1.5" stroke-linecap="round"/>
                        <circle cx="12"  cy="12" r="6" fill="var(--gray-lighter)"/>
                        <circle cx="60"  cy="12" r="6" fill="var(--gray-lighter)"/>
                        <circle cx="108" cy="12" r="6" fill="var(--gray-lighter)"/>
                        <!-- Capa de color revelada por la mask animada via GSAP -->
                        <g mask="url(#ls-mask)">
                            <line x1="18" y1="12" x2="102" y2="12" stroke="url(#ls-grad)" stroke-width="1.5" stroke-linecap="round"/>
                            <circle cx="12"  cy="12" r="6" fill="url(#ls-grad)"/>
                            <circle cx="60"  cy="12" r="6" fill="url(#ls-grad)"/>
                            <circle cx="108" cy="12" r="6" fill="url(#ls-grad)"/>
                        </g>
                    </svg>
                </div>
            </div>

        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';
import Application from '@/models/application';

// #region PROPERTIES
const screenRef   = ref<HTMLElement | null>(null);
const logoRef     = ref<HTMLElement | null>(null);
const nameRef     = ref<HTMLElement | null>(null);
const loaderRef   = ref<HTMLElement | null>(null);
const maskRectRef = ref<SVGRectElement | null>(null);

const logoSrc = Application.AppConfiguration.value.squared_app_logo_image || '';
const appName = Application.AppConfiguration.value.appName || '';

let manuallyShown = false;
let entranceTl: gsap.core.Timeline | null = null;
// #endregion

// #region METHODS
function show(): void {
    manuallyShown = true;
    const el = screenRef.value;
    if (!el) return;
    gsap.set(el, { display: 'flex', pointerEvents: 'all' });
    playEntrance();
}

function hide(): void {
    manuallyShown = false;
    playExit();
}

function playEntrance(): void {
    const el      = screenRef.value;
    const logo    = logoRef.value;
    const name    = nameRef.value;
    const loader  = loaderRef.value;
    const mask    = maskRectRef.value;
    if (!el) return;

    if (entranceTl) entranceTl.kill();

    entranceTl = gsap.timeline();

    // Overlay fade in
    entranceTl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' });

    // Logo: escala desde abajo con elastic
    if (logo) {
        entranceTl.fromTo(logo,
            { scale: 0.4, opacity: 0, y: 12 },
            { scale: 1,   opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.8)' },
            '-=0.05'
        );
    }

    // Nombre: slide up suave
    if (name) {
        entranceTl.fromTo(name,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
            '-=0.2'
        );
    }

    // Loader wrapper: fade
    if (loader) {
        entranceTl.fromTo(loader,
            { opacity: 0 },
            { opacity: 1, duration: 0.25, ease: 'power1.out' },
            '-=0.1'
        );
    }

    // SVG mask: revela los puntos de izq a der
    if (mask) {
        entranceTl.fromTo(mask,
            { attr: { width: 0 } },
            { attr: { width: 120 }, duration: 0.9, ease: 'power2.inOut' },
            '-=0.1'
        );
    }
}

function playExit(): void {
    const el = screenRef.value;
    if (!el) return;

    gsap.to(el, {
        clipPath: 'circle(0% at 50% 50%)',
        opacity: 0,
        duration: 0.45,
        ease: 'power3.in',
        onComplete: () => {
            gsap.set(el, {
                display: 'none',
                clipPath: 'circle(150% at 50% 50%)',
                opacity: 1,
                pointerEvents: 'none',
            });
            // Reset mask para la próxima vez que se muestre
            if (maskRectRef.value) {
                gsap.set(maskRectRef.value, { attr: { width: 0 } });
            }
        },
    });
}
// #endregion

// #region LIFECYCLE
onMounted(() => {
    // Montado visible (estado inicial = active como en el componente original)
    const el = screenRef.value;
    if (el) {
        gsap.set(el, {
            display: 'flex',
            pointerEvents: 'all',
            clipPath: 'circle(150% at 50% 50%)',
        });
    }

    playEntrance();

    Application.eventBus.on('show-loading', show);
    Application.eventBus.on('hide-loading', hide);

    document.fonts.ready.then(() => {
        if (!manuallyShown) {
            playExit();
        }
    });
});

onBeforeUnmount(() => {
    Application.eventBus.off('show-loading', show);
    Application.eventBus.off('hide-loading', hide);
    if (entranceTl) entranceTl.kill();
});
// #endregion
</script>

<style scoped>
.loading-screen {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--white);
    z-index: var(--z-toast);
    will-change: opacity, clip-path;
}

.loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-large);
}

.loading-logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: var(--border-radius);
    filter: drop-shadow(var(--shadow-dark));
    will-change: transform, opacity;
}

.loading-logo-placeholder {
    will-change: transform, opacity;
}

.loading-app-name {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--gray-medium);
    letter-spacing: 0.01em;
    will-change: opacity, transform;
}

.loading-svg-wrapper {
    will-change: opacity;
}
</style>
