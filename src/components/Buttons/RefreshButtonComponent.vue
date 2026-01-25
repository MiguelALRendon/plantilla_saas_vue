<template>
    <button class="button success">
        <span :class="GGCLASS">{{ GGICONS.REFRESH }}</span>
        Refresh
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';

export default {
    name: 'RefreshButtonComponent',
    data() {
        return {
            GGCLASS,
            GGICONS,
        };
    }
}
</script>

<style scoped>
.button.success span{
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>