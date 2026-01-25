<template>
    <button class="button secondary">
        <span :class="GGCLASS">{{ GGICONS.SAVE }}</span>
        Save
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';

export default {
    name: 'NewButtonComponent',
    data() {
        return {
            GGCLASS,
            GGICONS,
        };
    }
}
</script>

<style scoped>
.button.secondary span{
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>