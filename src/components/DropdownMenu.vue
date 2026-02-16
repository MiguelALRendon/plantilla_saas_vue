<template>
    <div :class="['dropdown-menu-container', { hidden: !dropDownData.showing }]">
        <div class="dropdown-menu" id="dropdown-element-in-general">
            <span class="dropdown-menu-title">{{ dropDownData.title }}</span>
            <component v-if="dropDownData.component" :is="dropDownData.component"></component>
        </div>
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';

export default {
    name: 'DropdownMenu',
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        window.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('keydown', this.handleKeydown);
    },
    methods: {
        updateDropdownPosition(): void {
            const dropdown = document.getElementById('dropdown-element-in-general');
            if (!dropdown) return;

            const data = this.dropDownData;

            const posX = parseFloat(data.position_x);
            const posY = parseFloat(data.position_y);
            const dropdownWidth = parseFloat(data.width);
            const canvasWidth = parseFloat(data.canvasWidth);
            const canvasHeight = parseFloat(data.canvasHeight);
            const elementHeight = parseFloat(data.activeElementHeight);

            let leftPosition = posX - dropdownWidth / 2;

            if (leftPosition + dropdownWidth > canvasWidth) {
                leftPosition = posX - dropdownWidth;
            }

            if (leftPosition < 0) {
                leftPosition = posX;
            }

            let topPosition = posY;
            const isInBottomHalf = posY > canvasHeight / 2;

            if (isInBottomHalf) {
                topPosition = posY - elementHeight;
            }

            dropdown.style.setProperty('--dropdown-max-width', data.width);
            dropdown.style.setProperty('--dropdown-left', `${leftPosition}px`);
            dropdown.style.setProperty('--dropdown-top', `${topPosition}px`);
        },
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
        }
    },
    data() {
        return {
            Application
        };
    },
    computed: {
        dropDownData() {
            return Application.dropdownMenu.value;
        }
    },
    watch: {
        dropDownData: {
            handler() {
                this.$nextTick(() => {
                    this.updateDropdownPosition();
                });
            },
            deep: true,
            immediate: true
        }
    }
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
    display: flex;
    pointer-events: none;
}
.dropdown-menu-container.hidden {
    opacity: 0;
}
.dropdown-menu-container .dropdown-menu {
    background-color: var(--white);
    border-radius: var(--border-radius);
    padding-block-end: var(--spacing-medium);
    width: 100%;
    max-width: var(--dropdown-max-width, var(--dropdown-default-width));
    height: fit-content;
    pointer-events: all;
    position: absolute;
    left: var(--dropdown-left, 0);
    top: var(--dropdown-top, 0);
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
