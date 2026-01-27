<template>
    <button class="button accent">
        <span :class="GGCLASS">{{ GGICONS.SAVE2 }}</span>
        Save and New
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';

export default {
    name: 'SaveAndNewButtonComponent',
    data() {
        return {
            GGCLASS,
            GGICONS,
        };
    }
}
</script>

<style scoped>
.button.accent span{
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>