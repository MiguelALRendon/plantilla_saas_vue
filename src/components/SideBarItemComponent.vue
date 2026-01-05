<template>
<div :class="'side-bar-item ' + (isActive ? ' active' : '')" @click="setNewView">
    <div class="icon">
        <img :src="module.icon" alt="">
    </div>
    <span>{{module.nombre}}</span>
</div>
</template>

<script lang="ts">
import { Module } from '@/models/module';
import Application from '@/models/application';

export default {
    name: 'SideBarItemComponent',
    props: {
        active: {
            type: Boolean,
            default: false
        },
        module : {
            type: Object as () => Module,
            required: true
        }
    },
    computed: {
        isActive(): boolean {
            return Application.activeView.value?.nombre === (this.module && this.module.nombre);
        }
    },
    methods: {
        setNewView() {
            Application.changeView(this.module as Module);
        }
    },
}
</script>

<style scoped>
.side-bar-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 0.5rem;
    transition: 0.4s ease;
}
.side-bar-item:hover {
    background-color: #f0f0f0;
    cursor: pointer;
}
.side-bar-item.active {
    background: var(--grad-red-warm);
    margin: 0.25rem;
    box-sizing: border-box;
    color: white;
}

.side-bar-item.active .icon img, .icon img {
    filter: drop-shadow(0 2px 2px rgba(255, 255, 255, 0.2));
}

.side-bar-item .icon{
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
}
.side-bar-item .icon img{
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
}
</style>