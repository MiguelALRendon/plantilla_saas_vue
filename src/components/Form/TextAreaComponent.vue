<template>
<div class="TextInput">
    <label 
    :for="'id-' + propertyName" 
    class="label-input">{{ propertyName }}</label>

    <textarea 
    :id="'id-' + propertyName" 
    :name="propertyName" 
    class="main-input" 
    placeholder=" "
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" />
</div>
</template>

<script lang="ts">
export default {
    name: 'TextAreaComponent',
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
            textInputId: 'text-area-' + this.propertyName,
        }
    },
}
</script>