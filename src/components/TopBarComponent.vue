<template>
    <div class="topbar">
        <div class="top-left-side">
            <button @click="toggleSidebar" :class="'push-side-nav-button' + (!toggled_bar ? ' toggled' : '')">
                <img :src="ICONS.MENU" alt="">
            </button>
            <div class="icon">
                <img :src="icon" alt="">
            </div>
            <span class="topbar-title">{{ title }}</span>
        </div>
        <div class="top-right-side">
            <button @click.stop="openDropdown" :class="'profile_button' + (toggled_profile ? ' toggled' : '')" id="dropdown-profile-button">
                <div class="icon">
                    <img :src="ICONS.AVATAR" alt="">
                </div>
            </button>
            <span>Chango</span>
        </div>
    </div>
</template>

<script lang="ts">
import ICONS from '@/constants/icons';
import Application from '@/models/application';
import listView from '@/views/list.vue';

export default {
    name: 'TopBarComponent',
    methods: {
        toggleSidebar() {
            Application.ApplicationUIService.toggleSidebar();
        },
        logout() {
            console.log('Logout clicked');
        },
        openDropdown() {
            var button: HTMLElement = document.getElementById('dropdown-profile-button')!;
            Application.ApplicationUIService.openDropdownMenu(button, 'Profile', listView);
        }
    },
    computed: {
        title() {
            return Application.View.value.entityClass?.getModuleName() ?? 'Default';
        },
        icon() {
            return Application.View.value.entityClass?.getModuleIcon() ?? '';
        }
    },
    data() {
        return {
            ICONS,
            toggled_profile : false,
            toggled_bar: true,
        }
    },
    mounted() {
        Application.eventBus.on('toggle-sidebar', (state?: boolean | void) => {
            this.toggled_bar = state !== undefined ? state : !this.toggled_bar;
        });
    },
    beforeUnmount() {
        Application.eventBus.off('toggle-sidebar');
    }
}
</script>

<style scoped>
.topbar {
    height: 50px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    z-index: 1;
}
.topbar .push-side-nav-button,
.topbar .profile_button {
    aspect-ratio: 1 / 1;
    height: 100%;
    border: none;
    border-radius: var(--border-radius-circle);
    padding: 0 !important;
}
.topbar .push-side-nav-button:hover,
.topbar .profile_button:hover {
    background-color: var(--overlay-light);
}
.topbar .push-side-nav-button img,
.topbar .profile_button img {
    height: 100%;
    transition: 0.5s ease;
}

.topbar .push-side-nav-button.toggled img,
.topbar .profile_button.toggled img {
    filter: grayscale(100%) brightness(1.3);
}

.topbar .top-left-side {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    font-weight: bold;
}

.topbar .top-right-side {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 10px;
    font-weight: bold;
}

.topbar .icon{
    height: 100%;
}

.topbar .icon img{
    height: 100%;
}

.topbar .topbar-title {
    font-size: 1.25rem;
    color: var(--gray-medium);
}
</style>