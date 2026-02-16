<template>
<div class="TextInput" :class="containerClasses">
    <label 
    :for="'id-' + metadata.propertyName" 
    class="label-input">{{ metadata.propertyName }}</label>

    <input 
    :id="'id-' + metadata.propertyName" 
    :name="metadata.propertyName" 
    type="text" 
    class="main-input" 
    placeholder=" "
    :value="modelValue"
    :disabled="metadata.disabled.value"
    @input="handleInput" />
    
    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</div>
</template>

<script lang="ts">
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'TextInputComponent',
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
    computed: {
        containerClasses(): Record<string, boolean> {
            return {
                disabled: this.metadata.disabled.value,
                nonvalidated: !this.isInputValidated
            };
        }
    },
    methods: {
        handleInput(event: Event): void {
            const target = event.target as HTMLInputElement;
            this.$emit('update:modelValue', target.value);
        },
        async isValidated(): Promise<boolean> {
            let validated: boolean = true;
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
    },
    data() {
        return {
            textInputId: 'text-input-' + this.propertyKey,
            isInputValidated: true,
            validationMessages: [] as string[],
        }
    },
}
</script>

<style scoped>
/* Component-specific styles inherit from global form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>