<template>
<div class="TextInput DateInput" :class="[{disabled: metadata.disabled.value}, {nonvalidated: !isInputValidated}]">
    <label :for="'id-' + metadata.propertyName" class="label-input">{{ metadata.propertyName }}</label>
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" " 
        :value="formattedDate"
        :disabled="metadata.disabled.value"
        readonly />
    <input 
        ref="dateInput"
        :id="'date-id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="date" 
        class="date-input"
        :value="modelValue"
        :disabled="metadata.disabled.value"
        @input="updateDate" />
    <button class="right" @click="openCalendar" :disabled="metadata.disabled.value">
        <span :class="GGCLASS">{{ GGICONS.CALENDAR }}</span>
    </button>
</div>

<div class="help-text" v-if="metadata.helpText.value">
    <span>{{ metadata.helpText.value }}</span>
</div>

<div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'DateInputComponent',
    props: {
        entityClass: {
            type: Function as unknown as () => typeof BaseEntity,
            required: true,
        },
        entity: {
            type: Object as () => BaseEntity,
            required: true,
        },
        propertyKey: {
            type: String,
            required: true,
        },
        modelValue: {
            type: String,
            required: true,
            default: '',
        },
    },
    setup(props) {
        const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
        return {
            metadata,
        };
    },
    mounted() {
        Application.eventBus.on('validate-inputs', this.handleValidation);
    },
    beforeUnmount() {
        Application.eventBus.off('validate-inputs', this.handleValidation);
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            textInputId: 'text-input-' + this.propertyKey,
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
        async isValidated(): Promise<boolean> {
            var validated = true;
            this.validationMessages = [];
            
            if (this.metadata.required.value && (!this.modelValue || this.modelValue.trim() === '')) {
                validated = false;
                this.validationMessages.push(this.metadata.requiredMessage.value || `${this.metadata.propertyName} is required.`);
            }
            if (!this.metadata.validated.value) {
                validated = false;
                this.validationMessages.push(this.metadata.validatedMessage.value || `${this.metadata.propertyName} is not valid.`);
            }
            
            // Validación asíncrona
            const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
            if (!isAsyncValid) {
                validated = false;
                const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
                if (asyncMessage) {
                    this.validationMessages.push(asyncMessage);
                }
            }
            
            return validated;
        },
        async handleValidation() {
            this.isInputValidated = await this.isValidated();
            if (!this.isInputValidated) {
                Application.View.value.isValid = false;
            }
        },
    }
}
</script>