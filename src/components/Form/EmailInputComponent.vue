<template>
<div class="TextInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }} <span :class="GGCLASS" class="icon">{{ GGICONS.MAIL }}</span></label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        type="email" 
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
export default {
    name: 'EmailInputComponent',
    props: {
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
        modelValue: {
            type: String,
            required: true,
            default: '',
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