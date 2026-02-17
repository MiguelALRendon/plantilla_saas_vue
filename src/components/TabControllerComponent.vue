<template>
    <div class="tab-container">
        <div class="tab-container-row">
            <div
                class="tab"
                v-for="(tab, index) in tabs"
                :class="[{ active: index == selectedTab }]"
                @click="setActiveTab(index)"
            >
                <span>{{ tab }}</span>
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { computed, useSlots } from 'vue';
import TabComponent from '@/components/TabComponent.vue';

export default {
    name: 'TabControllerComponent',
    props: {
        tabs: {
            type: Array<string>,
            required: true
        }
    },
    methods: {
        setActiveTab(index: number) {
            this.selectedTab = index;
            this.tabElements?.forEach((el, i) => {
                el.classList.remove('active');
                if (i === index) {
                    el.classList.add('active');
                }
            });
        }
    },
    data() {
        return {
            selectedTab: 0,
            tabElements: null as NodeListOf<Element> | null
        };
    },
    setup() {
        const slots = useSlots();

        const isValid = computed(() => {
            const nodes = slots.default?.();
            if (!nodes) return true;

            return nodes.every((vnode) => vnode.type === TabComponent);
        });

        return { isValid };
    },
    mounted() {
        this.tabElements = document.querySelectorAll('.tab-component');
        this.setActiveTab(0);
    }
};
</script>

<style scoped>
.tab-container-row {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-sm);
    border-bottom: var(--border-width-medium) solid var(--sky);
}

.tab-container-row .tab {
    padding: var(--spacing-sm) var(--spacing-xl);
    cursor: pointer;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    border: var(--border-width-thin) solid var(--border-gray);
    border-bottom: none;
    transition: var(--transition-slow) var(--timing-ease);
}

.tab-container-row .tab.active {
    border: var(--border-width-medium) solid var(--sky);
    border-bottom: none;
    background-color: var(--bg-gray);
}
</style>
