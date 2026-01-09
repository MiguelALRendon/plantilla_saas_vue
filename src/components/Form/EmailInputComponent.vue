<template>
<div class="TextInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
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
            required: true
        }
    },
    data() {
        return {
            textInputId: 'text-input-' + this.propertyName,
        }
    },
}
</script>