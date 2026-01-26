<template>
<div class="boolean-input-container" :class="[{disabled: disabled}, {nonvalidated: !isInputValidated}]">
    <button class="BooleanInput" @click="value = !value" :disabled="disabled">
        <label 
        :for="'id-' + propertyName" 
        class="label-input-boolean">{{ propertyName }}: </label>

        <div :class="['input-button', { true: modelValue }]">
            <span :class="GGCLASS" class="icon">{{ modelValue ? GGICONS.CHECK : GGICONS.CANCEL }}</span>
        </div>
    </button>
    
    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'BooleanInputComponent',
    props: {
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
        modelValue: {
            type: Boolean,
            required: true,
            default: false,
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
            isInputValidated: true,
            validationMessages: [] as string[],
        }
    },
    methods: {
        isValidated(): boolean {
            var validated = true;
            this.validationMessages = [];
            if (this.required && !this.modelValue) {
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
    computed: {
        value: {
            get(): boolean {
                return this.modelValue;
            },
            set(val: boolean) {
                this.$emit('update:modelValue', val);
            }
        }
    }
}
</script>

<style scoped>
.boolean-input-container {
    width: 100%;
    box-sizing: border-box;
}

.validation-messages {
    color: var(--red);
    font-size: 0.875rem;
    margin-top: 0.25rem;
    padding-left: 0.75rem;
}

.BooleanInput {
    display: flex;
    flex-direction: row;
    margin-block: .5rem;
    padding: 0.5rem .25rem;
    cursor: pointer;
    align-items: center;
    border-radius: 1rem;
    transition: 0.5s ease;
    border: 0px solid transparent;
}
.BooleanInput:hover {
    background-color: var(--bg-gray);
}

.BooleanInput .label-input-boolean {
    color: var(--lavender);
    font-size: 1rem;
    height: fit-content;
    cursor: pointer;
}

.BooleanInput .input-button {
    margin-left: 1rem;
}

.BooleanInput .input-button .icon {
    transform: rotate(180deg);
    transition: 0.5s ease;
    color: var(--accent-red);
    border-radius: 100%;
}
.BooleanInput .input-button.true .icon {
    transform: rotate(0deg);
    background-color: var(--btn-info);
    color: var(--white);
}

.BooleanInput:focus{border: 2px solid var(--lavender);}
.BooleanInput:focus .label-input-boolean {
    color: var(--gray-medium);
}

.boolean-input-container.disabled .BooleanInput {
    cursor: not-allowed;
    pointer-events: none;
    background-color: var(--gray-lighter);
}
.boolean-input-container.disabled .BooleanInput label {
    color: var(--gray-light) !important;
}
.boolean-input-container.disabled .BooleanInput span { 
    background-color: var(--gray-light) !important; 
    color: var(--gray-lighter) !important;
}

.boolean-input-container.nonvalidated .BooleanInput label {
    color: var(--accent-red) !important;
}
</style>