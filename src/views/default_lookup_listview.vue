<template>
    <LookupItemComponent
        v-for="(item, index) in data"
        :key="index"
        :itemFromList="item"
        @click="clickedItrem(item)"
    />
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entity';
import LookupItemComponent from '@/components/Informative/LookupItemComponent.vue';
import Application from '@/models/application';

export default {
    name: 'DefaultLookupListView',
    components: {
        LookupItemComponent
    },

    // #region METHODS
    methods: {
        clickedItrem(item: BaseEntity) {
            Application.ApplicationUIService.closeModalOnFunction(item);
        },
        async loadData(): Promise<void> {
            const modalView = Application.modal.value.modalView;
            if (modalView) {
                // Cast needed: modalView is typeof BaseEntity (abstract); getElementList
                // uses `new this()` internally which TS rejects on abstract constructors.
                // Runtime is always a concrete subclass — pattern mirrors router/index.ts.
                const ConcreteClass = modalView as typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity);
                this.data = await ConcreteClass.getElementList();
            }
        }
    },
    // #endregion

    // #region LIFECYCLE
    async mounted() {
        await this.loadData();
    },
    // #endregion

    // #region PROPERTIES
    data() {
        return {
            data: [] as BaseEntity[]
        };
    }
    // #endregion
};
</script>

<style scoped>
/* Component-specific styles inherit from global table.css and form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>
