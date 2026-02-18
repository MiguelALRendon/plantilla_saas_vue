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

<script setup lang="ts">
import { GGCLASS, GGICONS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: 0
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
}>();

const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const isInputValidated = ref(true);
const validationMessages = ref<string[]>([]);
const isFocused = ref(false);

const containerClasses = computed<Record<string, boolean>>(() => ({
    disabled: metadata.disabled.value,
    nonvalidated: !isInputValidated.value
}));

const displayValue = computed<string>(() => {
    if (isFocused.value) {
        return props.modelValue?.toString() || '';
    }

    const format = props.entity.getDisplayFormat(props.propertyKey);

    if (format) {
        return props.entity.getFormattedValue(props.propertyKey);
    }

    return props.modelValue?.toString() || '0';
});

function handleKeyPress(event: KeyboardEvent): void {
    const char = event.key;
    const currentValue = (event.target as HTMLInputElement).value;

    const isNumber = /^\d$/.test(char);
    const isDot = char === '.' && !currentValue.includes('.');
    const isMinus = char === '-' && currentValue.length === 0;

    if (!isNumber && !isDot && !isMinus) {
        event.preventDefault();
    }
}

function handleInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    if (inputValue === '' || inputValue === '-') {
        return;
    }

    const numValue = parseFloat(inputValue);

    if (!isNaN(numValue)) {
        emit('update:modelValue', numValue);
    }
}

function handleFocus(): void {
    isFocused.value = true;
}

function handleBlur(): void {
    isFocused.value = false;
    if (props.modelValue === null || props.modelValue === undefined || isNaN(props.modelValue)) {
        emit('update:modelValue', 0);
    }
}

function incrementValue(): void {
    const newValue = (props.modelValue || 0) + 1;
    emit('update:modelValue', newValue);
}

function decrementValue(): void {
    const newValue = (props.modelValue || 0) - 1;
    emit('update:modelValue', newValue);
}

async function isValidated(): Promise<boolean> {
    let validated = true;
    validationMessages.value = [];

    if (metadata.required.value && (props.modelValue === null || props.modelValue === undefined)) {
        validated = false;
        validationMessages.value.push(metadata.requiredMessage.value || `${metadata.propertyName} is required.`);
    }
    if (!metadata.validated.value) {
        validated = false;
        validationMessages.value.push(metadata.validatedMessage.value || `${metadata.propertyName} is not valid.`);
    }

    const isAsyncValid = await props.entity.isAsyncValidation(props.propertyKey);
    if (!isAsyncValid) {
        validated = false;
        const asyncMessage = props.entity.asyncValidationMessage(props.propertyKey);
        if (asyncMessage) {
            validationMessages.value.push(asyncMessage);
        }
    }

    return validated;
}

async function handleValidation(): Promise<void> {
    isInputValidated.value = await isValidated();
    if (!isInputValidated.value) {
        Application.View.value.isValid = false;
    }
}

onMounted(() => {
    Application.eventBus.on('validate-inputs', handleValidation);
});

onBeforeUnmount(() => {
    Application.eventBus.off('validate-inputs', handleValidation);
});
</script>

<style scoped>
/* Component-specific styles inherit from global form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>
