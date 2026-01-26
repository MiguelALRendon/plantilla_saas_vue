<template>
<div class="TextInput DateInput" :class="[{disabled: disabled}, {nonvalidated: !isInputValidated}]">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" " 
        :value="formattedDate"
        :disabled="disabled"
        readonly />
    <input 
        ref="dateInput"
        :id="'date-id-' + propertyName" 
        :name="propertyName" 
        type="date" 
        class="date-input"
        :value="modelValue"
        :disabled="disabled"
        @input="updateDate" />
    <button class="right" @click="openCalendar" :disabled="disabled">
        <span :class="GGCLASS">{{ GGICONS.CALENDAR }}</span>
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
    name: 'DateInputComponent',
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
            isInputValidated: true,
            validationMessages: [] as string[],
        }
    },
    computed: {
        formattedDate(): string {
            if (!this.modelValue) return '';
            
            const date = new Date(this.modelValue + 'T00:00:00');
            
            if (isNaN(date.getTime())) return '';
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        }
    },
    methods: {
        updateDate(event: Event) {
            const value = (event.target as HTMLInputElement).value;
            this.$emit('update:modelValue', value);
        },
        openCalendar() {
            (this.$refs.dateInput as HTMLInputElement).showPicker();
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