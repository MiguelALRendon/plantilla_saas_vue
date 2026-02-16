<template>
    <div :class="['side-bar-item', { active: isActive }]" @click="setNewView">
        <div class="icon">
            <img :src="moduleIcon" alt="" />
        </div>
        <span class="module-title">{{ moduleName }}</span>
    </div>
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entity';
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
        moduleIcon(): string | undefined {
            return this.module?.getModuleIcon();
        },
        moduleName(): string | undefined {
            return this.module?.getModuleName();
        },
        isActive(): boolean {
            return Application.View.value.entityClass?.getModuleName() === (this.module && this.module.getModuleName());
        }
    },
    methods: {
        setNewView() {
            Application.changeViewToDefaultView(this.module as typeof BaseEntity);
        }
    }
};
</script>

<style scoped>
.side-bar-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: var(--transition-normal) var(--timing-ease);
}
.side-bar-item:hover {
    background-color: var(--gray-lightest);
    cursor: pointer;
}
.side-bar-item.active {
    background: var(--grad-red-warm);
    box-sizing: border-box;
    color: white;
    border-radius: 0;
}

.side-bar-item.active .icon img,
.icon img {
    filter: drop-shadow(var(--shadow-white));
}

.side-bar-item .icon {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
}
.side-bar-item .icon img {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
}

.active .module-title {
    font-weight: 600;
    color: var(--white);
    font-size: var(--font-size-lg);
}
</style>
