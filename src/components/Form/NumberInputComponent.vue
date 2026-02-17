<template>
    <div class="TextInput NumberInput" :class="containerClasses">
        <label :for="`id-${metadata.propertyName}`" class="label-input">{{ metadata.propertyName }}</label>
        <button class="left" @click="decrementValue" :disabled="metadata.disabled.value">
            <span :class="GGCLASS">{{ GGICONS.REMOVE }}</span>
        </button>

        <input
            type="text"
            class="main-input"
            :value="displayValue"
            :disabled="metadata.disabled.value"
            @keypress="handleKeyPress"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
        />

        <button class="right" @click="incrementValue" :disabled="metadata.disabled.value">
            <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
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
import { GGCLASS, GGICONS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'NumberInputComponent',
    props: {
        entityClass: {
            type: Function as unknown as () => typeof BaseEntity,
            required: true
        },
        entity: {
            type: Object as () => BaseEntity,
            required: true
        },
        propertyKey: {
            type: String,
            required: true
        },
        modelValue: {
            type: Number,
            required: true,
            default: 0
        }
    },
    setup(props) {
        const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
        return {
            metadata
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
            textInputId: `text-input-${this.propertyKey}`,
            isInputValidated: true,
            validationMessages: [] as string[],
            isFocused: false
        };
    },
    methods: {
        handleKeyPress(event: KeyboardEvent) {
            const char = event.key;
            const currentValue = (event.target as HTMLInputElement).value;

            /** Permitir: números, punto decimal, signo menos al inicio */
            const isNumber = /^\d$/.test(char);
            const isDot = char === '.' && !currentValue.includes('.');
            const isMinus = char === '-' && currentValue.length === 0;

            if (!isNumber && !isDot && !isMinus) {
                event.preventDefault();
            }
        },
        handleInput(event: Event) {
            const inputValue = (event.target as HTMLInputElement).value;

            if (inputValue === '' || inputValue === '-') {
                return;
            }

            const numValue = parseFloat(inputValue);

            if (!isNaN(numValue)) {
                this.$emit('update:modelValue', numValue);
            }
        },
        handleFocus() {
            this.isFocused = true;
        },
        handleBlur() {
            this.isFocused = false;
            if (this.modelValue === null || this.modelValue === undefined || isNaN(this.modelValue)) {
                this.$emit('update:modelValue', 0);
            }
        },
        incrementValue() {
            const newValue = (this.modelValue || 0) + 1;
            this.$emit('update:modelValue', newValue);
        },
        decrementValue() {
            const newValue = (this.modelValue || 0) - 1;
            this.$emit('update:modelValue', newValue);
        },
        async isValidated(): Promise<boolean> {
            var validated = true;
            this.validationMessages = [];

            if (this.metadata.required.value && (this.modelValue === null || this.modelValue === undefined)) {
                validated = false;
                this.validationMessages.push(
                    this.metadata.requiredMessage.value || `${this.metadata.propertyName} is required.`
                );
            }
            if (!this.metadata.validated.value) {
                validated = false;
                this.validationMessages.push(
                    this.metadata.validatedMessage.value || `${this.metadata.propertyName} is not valid.`
                );
            }

            /** Validación asíncrona */
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
        }
    },
    computed: {
        containerClasses(): Record<string, boolean> {
            return {
                disabled: this.metadata.disabled.value,
                nonvalidated: !this.isInputValidated
            };
        },
        displayValue(): string {
            if (this.isFocused) {
                return this.modelValue?.toString() || '';
            }

            const format = this.entity.getDisplayFormat(this.propertyKey);

            if (format) {
                return this.entity.getFormattedValue(this.propertyKey);
            }

            return this.modelValue?.toString() || '0';
        }
    }
};
</script>

<style scoped>
/* Component-specific styles inherit from global form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>
