<template>
    <div :class="['side-bar-item', { active: isActive, collapsed }]" @click="setNewView">
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
        },
        onSelectModule: {
            type: Function as PropType<(module: typeof BaseEntity) => void>,
            required: false
        },
        collapsed: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    // #region COMPUTED
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
    // #endregion

    // #region METHODS
    methods: {
        setNewView() {
            if (this.onSelectModule) {
                this.onSelectModule(this.module as typeof BaseEntity);
                return;
            }
            Application.changeViewToDefaultView(this.module as typeof BaseEntity);
        }
    }
    // #endregion
};
</script>

<style scoped>
.side-bar-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-small);
    min-height: calc(var(--sidebar-min-width) - 2px);
    padding-inline: var(--spacing-small);
    overflow: hidden;
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
    border-radius: var(--border-radius);
}

.side-bar-item.active .icon img,
.icon img {
    filter: drop-shadow(var(--shadow-white));
}

.side-bar-item .icon {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
    flex-shrink: 0;
}
.side-bar-item .icon img {
    width: var(--sidebar-min-width);
    height: var(--sidebar-min-width);
}

.side-bar-item .module-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.side-bar-item.collapsed {
    justify-content: center;
    align-self: center;
    width: calc(var(--sidebar-width-collapsed) - (var(--spacing-small) * 2));
    height: calc(var(--sidebar-width-collapsed) - (var(--spacing-small) * 2));
    min-height: 0;
    margin: var(--spacing-xxs) 0;
    padding: var(--spacing-xxs);
    border-radius: var(--border-radius);
}

.side-bar-item.collapsed .module-title {
    display: none;
}

.side-bar-item.collapsed .icon,
.side-bar-item.collapsed .icon img {
    width: calc(var(--sidebar-min-width) - 24px);
    height: calc(var(--sidebar-min-width) - 24px);
}

.active .module-title {
    font-weight: 600;
    color: var(--white);
    font-size: var(--font-size-lg);
}
</style>
