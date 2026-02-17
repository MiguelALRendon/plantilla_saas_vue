<template>
    <div class="lookup-item-card">
        <span>{{ defaultPropertyValue }}</span>
    </div>
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'LookupItemComponent',
    props: {
        itemFromList: {
            type: Object as () => BaseEntity,
            required: true,
        },
    },
    computed: {
        defaultPropertyValue(): unknown {
            return (this.itemFromList as BaseEntity).getDefaultPropertyValue();
        },
    },
};
</script>

<style scoped>
.lookup-item-card {
    border-radius: var(--border-radius);
    padding: var(--spacing-medium);
    cursor: pointer;
    background-color: var(--white);
    margin-bottom: var(--spacing-md);
    transition: var(--transition-slow) var(--timing-ease);
    box-shadow: var(--shadow-light);
}
.lookup-item-card:hover {
    filter: brightness(0.94);
}
</style>
