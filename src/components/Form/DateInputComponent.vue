<template>
<div class="TextInput DateInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input :id="'id-' + propertyName" :name="propertyName" type="text" class="main-input" placeholder=" " disabled="true"/>
    <input :id="'date-id-' + propertyName" :name="propertyName" type="date" class="date-input" />
    <button class="right"><span :class="GGCLASS">{{ GGICONS.CALENDAR }}</span></button>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';

export default {
    name: 'DateInputComponent',
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