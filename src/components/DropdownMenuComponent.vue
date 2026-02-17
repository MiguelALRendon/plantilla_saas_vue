<template>
    <div :class="['dropdown-menu-container', { hidden: !dropDownData.showing }]">
        <div
            id="dropdown-element-in-general"
            :class="['dropdown-menu', dropdownHorizontalClass, dropdownVerticalClass, dropdownWidthClass]"
        >
            <span class="dropdown-menu-title">{{ dropDownData.title }}</span>
            <component v-if="dropDownData.component" :is="dropDownData.component"></component>
        </div>
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';

export default {
    name: 'DropdownMenuComponent',
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        window.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('keydown', this.handleKeydown);
    },
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
    data() {
        return {
            Application,
        };
    },
    computed: {
        dropDownData() {
            return Application.dropdownMenu.value;
        },
        dropdownHorizontalClass(): string {
            const data = this.dropDownData;
            const posX = parseFloat(data.position_x);
            const dropdownWidth = parseFloat(data.width);
            const canvasWidth = parseFloat(data.canvasWidth);

            const centeredLeft = posX - dropdownWidth / 2;

            if (centeredLeft + dropdownWidth > canvasWidth) {
                return 'dropdown-pos-right';
            }

            if (centeredLeft < 0) {
                return 'dropdown-pos-left';
            }

            return 'dropdown-pos-center';
        },
        dropdownVerticalClass(): string {
            const data = this.dropDownData;
            const posY = parseFloat(data.position_y);
            const canvasHeight = parseFloat(data.canvasHeight);

            return posY > canvasHeight / 2 ? 'dropdown-pos-top' : 'dropdown-pos-bottom';
        },
        dropdownWidthClass(): string {
            const width = parseFloat(this.dropDownData.width);

            if (width <= 200) {
                return 'dropdown-width-sm';
            }

            if (width <= 280) {
                return 'dropdown-width-md';
            }

            if (width <= 360) {
                return 'dropdown-width-lg';
            }

            return 'dropdown-width-xl';
        },
    },
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
    width: 100%;
    max-width: var(--dropdown-default-width);
    height: fit-content;
    pointer-events: all;
    position: absolute;
    box-shadow: var(--shadow-dark);
}

.dropdown-menu.dropdown-pos-left {
    left: var(--spacing-small);
}

.dropdown-menu.dropdown-pos-center {
    left: 50%;
    transform: translateX(-50%);
}

.dropdown-menu.dropdown-pos-right {
    right: var(--spacing-small);
}

.dropdown-menu.dropdown-pos-top {
    top: var(--spacing-small);
}

.dropdown-menu.dropdown-pos-bottom {
    bottom: var(--spacing-small);
}

.dropdown-menu.dropdown-width-sm {
    max-width: var(--table-width-medium);
}

.dropdown-menu.dropdown-width-md {
    max-width: var(--dropdown-default-width);
}

.dropdown-menu.dropdown-width-lg {
    max-width: var(--table-width-large);
}

.dropdown-menu.dropdown-width-xl {
    max-width: var(--table-width-extra-large);
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
