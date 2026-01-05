<template>
    <div class="topbar">
        <div class="top-left-side">
            <button @click="toggleSidebar" :class="'push-side-nav-button' + (!toggled_bar ? ' toggled' : '')">
                <img :src="ICONS.MENU" alt="">
            </button>
            <div class="icon">
                <img :src="icon" alt="">
            </div>
            <span>{{ title }}</span>
        </div>
        <div class="top-right-side">
            <button :class="'profile_button' + (toggled_profile ? ' toggled' : '')">
                <div class="icon">
                    <img :src="ICONS.AVATAR" alt="">
                </div>
            </button>
            Chango
        </div>
    </div>
</template>

<script>
import ICONS from '@/constants/icons';
import Application from '@/models/application';

export default {
    name: 'TopBarComponent',
    methods: {
        toggleSidebar() {
            Application.toggleSidebar();
        },
        logout() {
            console.log('Logout clicked');
        }
    },
    computed: {
        toggled_bar() {
            return Application.sidebarToggled.value;
        },
        title() {
            return Application.activeView.value?.nombre ?? 'Default';
        },
        icon() {
            return Application.activeView.value?.icon ?? '';
        }
    },
    data() {
        return {
            ICONS,
            toggled_profile : false,
        }
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
    border-radius: 100%;
    padding: 0 !important;
}
.topbar .push-side-nav-button:hover,
.topbar .profile_button:hover {
    background-color: rgba(0, 0, 0, 0.05);
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
</style>