<template>
<div :class="'side-bar-item ' + (isActive ? ' active' : '')" @click="setNewView">
    <div class="icon">
        <img :src="module.getModuleIcon()" alt="">
    </div>
    <span class="module-title">{{module.getModuleName()}}</span>
</div>
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entitiy';
import Application from '@/models/application';
import { PropType } from 'vue';

export default {
    name: 'SideBarItemComponent',
    props: {
        module: {
            type: Function as unknown as PropType<typeof BaseEntity>,
            required: true
        }
    },
    computed: {
        isActive(): boolean {
            return Application.activeViewEntity.value?.getModuleName() === (this.module && this.module.getModuleName());
        }
    },
    methods: {
        setNewView() {
            Application.changeView(this.module as typeof BaseEntity);
        }
    },
}
</script>

<style scoped>
.side-bar-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: var(--border-radius);
    transition: 0.4s ease;
}
.side-bar-item:hover {
    background-color: var(--gray-lightest);
    cursor: pointer;
}
.side-bar-item.active {
    background: var(--grad-red-warm);
    margin: 0.25rem;
    box-sizing: border-box;
    color: white;
}

.side-bar-item.active .icon img, .icon img {
    filter: drop-shadow(var(--shadow-white));
}

.side-bar-item .icon{
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
}
.side-bar-item .icon img{
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
}

.active .module-title {
    font-weight: 600;
    color: var(--white);
    font-size: 1.1rem;
}
</style>