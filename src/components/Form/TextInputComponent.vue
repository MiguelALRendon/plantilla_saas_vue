<template>
<div class="TextInput" :class="[{disabled: metadata.disabled.value}, {nonvalidated: !isInputValidated}]">
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
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</div>
</template>

<script lang="ts">
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entitiy';

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
        Application.eventBus.on('validate-inputs', this.saveItem);
    },
    beforeUnmount() {
        Application.eventBus.off('validate-inputs', this.saveItem);
    },
    methods: {
        isValidated(): boolean {
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
            return validated;
        },

        saveItem() {
            this.isInputValidated = this.isValidated();
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