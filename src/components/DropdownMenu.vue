<template>
    <div :class="['dropdown-menu-container', { hidden: !dropDownData.showing }]">
        <div class="dropdown-menu" id="dropdown-element-in-general" :style="dropdownStyle">
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
        },
        dropdownStyle() {
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

            return {
                'max-width': data.width,
                left: `${leftPosition}px`,
                top: `${topPosition}px`
            };
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
    z-index: 888;
    display: flex;
    transition: opacity 0.5s ease;
    display: flex;
    pointer-events: none;
}
.dropdown-menu-container.hidden {
    opacity: 0;
}
.dropdown-menu-container .dropdown-menu {
    background-color: var(--white);
    border-radius: var(--border-radius);
    padding-block-end: 1rem;
    width: 100%;
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
    font-size: 1.1rem;
    display: block;
    margin-bottom: 0.5rem;
    text-align: center;
    margin-top: 0.5rem;
}
</style>
