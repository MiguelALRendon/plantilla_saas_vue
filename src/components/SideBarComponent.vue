<template>
    <div :class="['sidebar', { toggled }]">
        <div class="header">
            Header
        </div>

        <div class="body">
        <SideBarItemComponent 
        v-for="module in Application.ModuleList.values()" 
        :module="module"
        />
        </div>

        <div class="footer">
            footer
        </div>
    </div>
</template>

<script lang="ts">
import SideBarItemComponent from './SideBarItemComponent.vue';
import Application from '@/models/application';

export default {
    name: 'SideBarComponent',
    components: {
        SideBarItemComponent
    },
    data() {
        return {
            Application,
            toggled: true,
        }
    },
    mounted() {
        Application.eventBus.on('toggle-sidebar', (state?: boolean) => {
            this.toggled = state !== undefined ? state : !this.toggled;
        });
    },
    beforeUnmount() {
        Application.eventBus.off('toggle-sidebar');
    }
}
</script>

<style>
.sidebar {
    display: flex;
    flex-direction: column;
    max-width: 68px;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    transition: 0.5s ease;
    position: relative;
    z-index: 100;
    background-color: var(--white);
    overflow: hidden;
}
.sidebar span{
    opacity: 0;
    font-weight: 500;
    transition: opacity 0.3s ease 0.2s;
}
.sidebar.toggled {
    max-width: 250px;
}
.sidebar.toggled span{
    opacity: 1;
}

.sidebar .header {
    height: 50px;
    opacity: 0;
    max-height: 90px;
    padding: 0;
    overflow: hidden;
    border-bottom: 1px solid var(--border-gray);
    transition: 0.5s ease;
}
.sidebar.toggled .header {
    height: 100%;
    opacity: 1;
    padding: 1rem;
} 

.sidebar .body {
    flex-grow: 1;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    overflow-x: hidden;
}

.sidebar .footer {
    height: 0%;
    opacity: 0;
    max-height: 70px;
    padding: 1rem;
    overflow: hidden;
    transition: 0.5s ease;
    border-top: 1px solid var(--border-gray);
}
.sidebar.toggled .footer {
    height: 100%;
    opacity: 1;
}
</style>