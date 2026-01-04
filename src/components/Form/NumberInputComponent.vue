<template>
<div class="TextInput NumberInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <button class="left">-</button>
    <input :id="'id-' + propertyName" :name="propertyName" type="number" placeholder=" " />
    <button class="right">+</button>
</div>
</template>

<script lang="ts">
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
            textInputId: 'text-input-' + this.propertyName,
        }
    },
}
</script>