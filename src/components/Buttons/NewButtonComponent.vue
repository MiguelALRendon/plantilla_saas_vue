<template>
    <button class="button info" @click="openNewDetailView">
        <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
        New
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

export default {
    name: 'NewButtonComponent',
    methods: {
        openNewDetailView() {
            const entityClass = Application.View.value.entityClass as
                | (typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity))
                | null;

            if (!entityClass) return;

            Application.changeViewToDetailView(entityClass.createNewInstance());
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS,
            Application
        };
    }
};
</script>

<style scoped>
.button.info span {
    font-size: 1.1rem;
}
</style>
