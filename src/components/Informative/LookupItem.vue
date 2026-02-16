<template>
    <div class="lookup-item-card">
        <span>{{ defaultPropertyValue }}</span>
    </div>
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'DefaultLookupListView',
    props: {
        itemFromList: {
            type: Object as () => BaseEntity,
            required: true
        }
    },
    computed: {
        defaultPropertyValue(): any {
            return (this.itemFromList as BaseEntity).getDefaultPropertyValue();
        }
    }
};
</script>

<style scoped>
.lookup-item-card {
    border-radius: var(--border-radius);
    padding: 1rem;
    cursor: pointer;
    background-color: var(--white);
    margin-bottom: 0.75rem;
    transition: 0.5s ease;
    box-shadow: var(--shadow-light);
}
.lookup-item-card:hover {
    filter: brightness(0.94);
}
</style>
