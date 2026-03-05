<template>
    <div :class="['dropdown-menu-container', { hidden: !dropDownData.showing }]">
        <div
            id="dropdown-element-in-general"
            class="dropdown-menu"
            :style="dropdownPositionStyle"
        >
            <span class="dropdown-menu-title">{{ dropDownData.title }}</span>
            <component v-if="dropDownData.component" :is="dropDownData.component" v-bind="dropDownData.props ?? {}"></component>
        </div>
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';

export default {
    name: 'DropdownMenuComponent',

    // #region LIFECYCLE
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        window.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('keydown', this.handleKeydown);
    },
    // #endregion

    // #region METHODS
    methods: {
        handleClickOutside(event: MouseEvent) {
            if (this.dropDownData.showing) {
                const dropdown = document.getElementById('dropdown-element-in-general');
                if (!dropdown) return;

                if (!dropdown.contains(event.target as Node)) {
                    Application.ApplicationUIService.closeDropdownMenu();
                }
            }
        },
        handleKeydown(e: KeyboardEvent) {
            if (e.key === 'Escape' && this.dropDownData.showing) {
                Application.ApplicationUIService.closeDropdownMenu();
            }
        },
    },
    // #endregion

    // #region PROPERTIES
    data() {
        return {
            Application,
        };
    },
    // #endregion

    // #region COMPUTED
    computed: {
        dropDownData() {
            return Application.dropdownMenu.value;
        },
        dropdownPositionStyle(): Record<string, string> {
            const data = this.dropDownData;
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
            const isInBottomHalf = posY > canvasHeight / 2;
            const style: Record<string, string> = {
                left: `${leftPosition}px`,
                width: rawWidth,
            };
            if (isInBottomHalf) {
                // rect.top = posY - elementHeight; bottom from viewport bottom = canvasHeight - rect.top
                style.bottom = `${canvasHeight - (posY - elementHeight)}px`;
                style.top = 'auto';
            } else {
                style.top = `${posY}px`;
                style.bottom = 'auto';
            }
            return style;
        },
    },
    // #endregion
};
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
    transition: opacity var(--transition-slow) var(--timing-ease);
    pointer-events: none;
}
.dropdown-menu-container.hidden {
    opacity: 0;
}
.dropdown-menu-container .dropdown-menu {
    background-color: var(--white);
    border-radius: var(--border-radius);
    padding-block-end: var(--spacing-medium);
    height: fit-content;
    pointer-events: all;
    position: absolute;
    box-shadow: var(--shadow-dark);
}

.dropdown-menu-container.hidden .dropdown-menu {
    pointer-events: none;
}

.dropdown-menu-container .dropdown-menu .dropdown-menu-title {
    font-weight: bold;
    font-size: var(--font-size-lg);
    display: block;
    margin-bottom: var(--spacing-small);
    text-align: center;
    margin-top: var(--spacing-small);
}
</style>
