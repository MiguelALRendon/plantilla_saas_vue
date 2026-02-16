<template>
    <button class="button accent" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.SAVE2 }}</span>
        Save and New
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

export default {
    name: 'SaveAndNewButtonComponent',
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.save();
                const entityClass = Application.View.value.entityClass as
                    | (typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity))
                    | null;

                if (!entityClass) return;

                Application.changeViewToDetailView(entityClass.createNewInstance());
            }
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS
        };
    }
};
</script>

<style scoped>
.button.accent span {
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>
