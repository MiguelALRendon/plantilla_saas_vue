<template>
<div class="TextInput" :class="[{disabled: disabled}, {nonvalidated: !isInputValidated}]">
    <label 
    :for="'id-' + propertyName" 
    class="label-input">{{ propertyName }}</label>

    <textarea 
    :id="'id-' + propertyName" 
    :name="propertyName" 
    class="main-input" 
    placeholder=" "
    :value="modelValue"
    :disabled="disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" />
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</div>
</template>

<script lang="ts">
import Application from '@/models/application';

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
        },
        required: {
            type: Boolean,
            required: false,
            default: false,
        },
        requireddMessage: {
            type: String,
            required: false,
            default: '',
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        validated: {
            type: Boolean,
            required: false,
            default: true,
        },
        validatedMessage: {
            type: String,
            required: false,
            default: '',
        },
    },
    mounted() {
        Application.eventBus.on('validate-inputs', this.saveItem);
    },
    beforeUnmount() {
        Application.eventBus.off('validate-inputs', this.saveItem);
    },
    methods: {
        isValidated(): boolean {
            var validated = true;
            this.validationMessages = [];
            if (this.required && (!this.modelValue || this.modelValue.trim() === '')) {
                validated = false;
                this.validationMessages.push(this.requireddMessage || `${this.propertyName} is required.`);
            }
            if (!this.validated) {
                validated = false;
                this.validationMessages.push(this.validatedMessage || `${this.propertyName} is not valid.`);
            }
            return validated;
        },
        saveItem() {
            this.isInputValidated = this.isValidated();
        },
    },
    data() {
        return {
            textInputId: 'text-area-' + this.propertyName,
            isInputValidated: true,
            validationMessages: [] as string[],
        }
    },
}
</script>