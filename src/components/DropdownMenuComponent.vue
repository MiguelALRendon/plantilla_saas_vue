<template>
    <div :class="['dropdown-menu-container', { hidden: !dropDownData.showing }]">
        <div
            id="dropdown-element-in-general"
            ref="dropdownRef"
            class="dropdown-menu"
            :style="dropdownPositionStyle"
        >
            <div class="dropdown-menu-goo" :style="gooAnchorStyle">
                <div class="dropdown-menu-tail" :style="tailStyle"></div>
                <div class="dropdown-menu-body"></div>
            </div>
            <div class="dropdown-menu-content">
                <span class="dropdown-menu-title">{{ dropDownData.title }}</span>
                <component v-if="dropDownData.component" :is="dropDownData.component" v-bind="dropDownData.props ?? {}"></component>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import gsap from 'gsap';

import Application from '@/models/application';

// #region STATE
const dropdownRef = ref<HTMLElement | null>(null);

/** Reactive dropdown state owned by `Application.ApplicationUIService`. */
const dropDownData = computed(() => Application.dropdownMenu.value);

/** True when the menu is anchored below the trigger, false when it falls above it. */
const opensDownward = computed(() => {
    const posY = parseFloat(dropDownData.value.position_y);
    const canvasHeight = parseFloat(dropDownData.value.canvasHeight);
    return !(posY > canvasHeight / 2);
});
// #endregion

// #region COMPUTED — POSITIONING
const dropdownPositionStyle = computed<Record<string, string>>(() => {
    const data = dropDownData.value;
    const posX = parseFloat(data.position_x);
    const posY = parseFloat(data.position_y);
    const canvasWidth = parseFloat(data.canvasWidth);
    const canvasHeight = parseFloat(data.canvasHeight);
    const elementHeight = parseFloat(data.activeElementHeight);
    const rawWidth = data.width ?? '250px';

    // Resolve width to pixels by temporarily mounting a div
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;width:${rawWidth}`;
    document.body.appendChild(probe);
    const dropdownWidth = probe.getBoundingClientRect().width || parseFloat(rawWidth) || 250;
    document.body.removeChild(probe);

    // Horizontal: center on trigger, clamp right, clamp left
    let leftPosition = posX - dropdownWidth / 2;
    if (leftPosition + dropdownWidth > canvasWidth) {
        leftPosition = posX - dropdownWidth;
    }
    if (leftPosition < 0) {
        leftPosition = posX;
    }

    // Vertical: below if trigger in top half, above if in bottom half.
    // posY = rect.bottom. For "above", pin the dropdown's bottom edge to rect.top
    // using `bottom` (distance from viewport bottom) so dropdown height is irrelevant.
    const style: Record<string, string> = {
        left: `${leftPosition}px`,
        width: rawWidth,
    };
    if (opensDownward.value) {
        style.top = `${posY}px`;
        style.bottom = 'auto';
    } else {
        // rect.top = posY - elementHeight; bottom from viewport bottom = canvasHeight - rect.top
        style.bottom = `${canvasHeight - (posY - elementHeight)}px`;
        style.top = 'auto';
    }
    return style;
});

/** Horizontal offset (px, relative to the dropdown's own left edge) where the
 * trigger element is centered — used to anchor the goo tail and the GSAP
 * transform-origin so the menu visually "grows" out of the trigger. Clamped
 * to stay within the dropdown body's own width, since horizontal clamping in
 * `dropdownPositionStyle` can shift the body away from the trigger's center. */
const anchorOffsetX = computed<number>(() => {
    const data = dropDownData.value;
    const posX = parseFloat(data.position_x);
    const activeWidth = parseFloat(data.activeElementWidth);
    const triggerCenterX = posX + activeWidth / 2;
    const leftPosition = parseFloat(dropdownPositionStyle.value.left);
    const dropdownWidth = parseFloat(dropdownPositionStyle.value.width);
    const rawOffset = triggerCenterX - leftPosition;
    return Math.min(Math.max(16, rawOffset), dropdownWidth - 16);
});

/** Positions the goo layer's tail at the trigger's horizontal center, flush
 * with whichever edge (top/bottom) faces the trigger. */
const tailStyle = computed<Record<string, string>>(() => {
    const base: Record<string, string> = {
        left: `${anchorOffsetX.value}px`,
    };
    if (opensDownward.value) {
        base.top = '-1.1rem';
    } else {
        base.bottom = '-1.1rem';
    }
    return base;
});

/** transform-origin for the GSAP grow-from-anchor animation: horizontally at
 * the trigger's center, vertically at whichever edge faces the trigger. */
const gooAnchorStyle = computed<Record<string, string>>(() => ({
    transformOrigin: `${anchorOffsetX.value}px ${opensDownward.value ? '0%' : '100%'}`,
}));
// #endregion

// #region GSAP — OPEN/CLOSE ANIMATION
let openTween: gsap.core.Tween | null = null;

function playOpenAnimation(): void {
    const el = dropdownRef.value;
    if (!el) return;

    const originY = opensDownward.value ? '0%' : '100%';
    openTween?.kill();
    openTween = gsap.fromTo(
        el,
        {
            opacity: 0,
            scale: 0.3,
            transformOrigin: `${anchorOffsetX.value}px ${originY}`,
        },
        {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
        }
    );
}

function playCloseAnimation(): void {
    const el = dropdownRef.value;
    if (!el) return;

    openTween?.kill();
    openTween = gsap.to(el, {
        opacity: 0,
        scale: 0.3,
        duration: 0.3,
        ease: 'power2.in',
    });
}

watch(
    () => dropDownData.value.showing,
    (showing) => {
        nextTick(() => {
            if (showing) {
                playOpenAnimation();
            } else {
                playCloseAnimation();
            }
        });
    }
);
// #endregion

// #region LIFECYCLE — CLICK OUTSIDE / ESCAPE
function handleClickOutside(event: MouseEvent): void {
    if (dropDownData.value.showing) {
        const dropdown = document.getElementById('dropdown-element-in-general');
        if (!dropdown) return;

        if (!dropdown.contains(event.target as Node)) {
            Application.ApplicationUIService.closeDropdownMenu();
        }
    }
}

function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && dropDownData.value.showing) {
        Application.ApplicationUIService.closeDropdownMenu();
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('keydown', handleKeydown);
    openTween?.kill();
});
// #endregion
</script>

<style scoped>
.dropdown-menu-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-overlay);
    display: flex;
    pointer-events: none;
}

.dropdown-menu-container .dropdown-menu {
    height: fit-content;
    pointer-events: all;
    position: absolute;
}

.dropdown-menu-container.hidden .dropdown-menu {
    pointer-events: none;
}

/* Goo layer — two blurred/contrasted shapes (tail + body) that the shared
   gooey filter fuses into a single organic "speech balloon" silhouette
   pointing at the trigger. Sits behind the crisp content layer so the blur
   never touches text/icons (same split used by v-liquid and .label-input). */
.dropdown-menu-goo {
    position: absolute;
    inset: 0;
    z-index: 0;
    filter: url(#liq-gooey-sm);
}

.dropdown-menu-body {
    position: absolute;
    inset: 0;
    border-radius: var(--border-radius);
    background-color: var(--white);
    box-shadow: var(--shadow-dark);
}

.dropdown-menu-tail {
    position: absolute;
    width: 1.8rem;
    height: 1.8rem;
    margin-left: -0.9rem;
    border-radius: 50%;
    background-color: var(--white);
}

.dropdown-menu-content {
    position: relative;
    z-index: 1;
    padding-block-end: var(--spacing-medium);
}

.dropdown-menu-content .dropdown-menu-title {
    font-weight: bold;
    font-size: var(--font-size-lg);
    display: block;
    margin-bottom: var(--spacing-small);
    text-align: center;
    margin-top: var(--spacing-small);
}
</style>
