<template>
<div class="TextInput NumberInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <button class="left"><span :class="GGCLASS">{{ GGICONS.REMOVE }}</span></button>
    <input :id="'id-' + propertyName" :name="propertyName" type="number" class="main-input" placeholder=" " />
    <button class="right"><span :class="GGCLASS">{{ GGICONS.ADD }}</span></button>
</div>
</template>

<script lang="ts">
import { GGCLASS, GGICONS } from '@/constants/ggicons';

export default {
    name: 'TextInputComponent',
    props: {
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
    },
    emits: ['update:modelValue'],
    watch: {
        modelValue(newValue) {
            this.$emit('update:modelValue', newValue);
        }
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            textInputId: 'text-input-' + this.propertyName,
        }
    },
}
</script>