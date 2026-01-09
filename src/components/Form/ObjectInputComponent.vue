<template>
<div class="TextInput ObjectInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
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
        modelValue: {
            type: String,
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
}
</script>