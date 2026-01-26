<template>
<div class="TextInput PasswordInput" :class="[{disabled: disabled}, {nonvalidated: !isInputValidated}]">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        :type="showPassword ? 'text' : 'password'" 
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <button class="right" @click="togglePasswordVisibility" :disabled="disabled">
        <span :class="GGCLASS">{{ showPassword ? GGICONS.VISIBILITY_OFF : GGICONS.VISIBILITY }}</span>
    </button>
</div>
<div class="validation-messages">
    <span v-for="message in validationMessages" :key="message">{{ message }}</span>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'PasswordInputComponent',
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
    data() {
        return {
            GGICONS,
            GGCLASS,
            textInputId: 'text-input-' + this.propertyName,
            showPassword: false,
            isInputValidated: true,
            validationMessages: [] as string[],
        }
    },
    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
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
    }
}
</script>