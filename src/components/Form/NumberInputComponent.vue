<template>
<div class="TextInput NumberInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <button class="left" @click="value--">
    <span :class="GGCLASS">{{ GGICONS.REMOVE }}</span>
    </button>

    <input
        type="number"
        class="main-input"
        :value="value"
        @input="value = Number(($event.target as HTMLInputElement).value)"
    />

    <button class="right" @click="value++">
        <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
    </button>
</div>
</template>

<script lang="ts">
import { GGCLASS, GGICONS } from '@/constants/ggicons';

export default {
    name: 'NumberInputComponent',
    props: {
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
        modelValue: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            textInputId: 'text-input-' + this.propertyName,
        }
    },
    computed: {
    value: {
        get(): number {
            return this.modelValue;
        },
        set(val: number) {
            this.$emit('update:modelValue', val);
        }
    }
}
}
</script>