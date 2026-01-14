<template>
<div class="lookup-item-card">
<span>{{ (itemFromList as BaseEntity).getDefaultPropertyValue() }}</span>
</div>
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entitiy';

    export default {
        name: "DefaultLookupListView",
        props: {
            itemFromList: {
                type: BaseEntity,
                required: true
            }
        }
    };
</script>

<style scoped>
.lookup-item-card {
    border-radius: 1rem;
    padding: 1rem;
    cursor: pointer;
    background-color: var(--white);
    margin-bottom: .75rem;
    transition: 0.5s ease;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05)
}
.lookup-item-card:hover {
    filter: brightness(0.94);
}
</style>