<template>
<div class="TextInput ObjectInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input :id="'id-' + propertyName" :name="propertyName" type="text" class="main-input" placeholder=" " />
    <button class="right"><span :class="GGCLASS">{{ GGICONS.SEARCH }}</span></button>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';

export default {
    name: 'ObjectInputComponent',
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