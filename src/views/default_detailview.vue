<template>

</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entitiy';

export default {
    name: 'DefaultDetailView',
    props : {
        entity : {
            type: Object as () => BaseEntity,
            required: true
        }
    }
}
</script>