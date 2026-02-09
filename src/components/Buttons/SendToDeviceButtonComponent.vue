<template>
    <button class="button primary" @click="">
        <span :class="GGCLASS">{{ GGICONS.DEVICES }}</span>
        Send to Device
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';

export default {
    name: 'NewButtonComponent',
    methods: {

    },
    data() {
        return {
            GGCLASS,
            GGICONS,
        };
    }
}
</script>