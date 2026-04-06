<template>
    <button class="button info" type="button" @click="handleClick">
        <span v-if="iconGlyph" :class="[GGCLASS, 'btn-icon']">{{ iconGlyph }}</span>
        <span>{{ text }}</span>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { GGCLASS, GGICONS } from '@/constants/ggicons';

import type { GGIconKey } from '@/constants/ggicons';

const props = withDefaults(
    defineProps<{
        icon?: GGIconKey;
        text: string;
        onClick?: () => unknown;
    }>(),
    {
        icon: undefined,
        onClick: undefined,
    }
);

const iconGlyph = computed<string>(() => {
    if (!props.icon) {
        return '';
    }

    return GGICONS[props.icon] ?? '';
});

function handleClick(): void {
    props.onClick?.();
}
</script>

<style scoped>
/* Component-specific styles inherit from global form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>
