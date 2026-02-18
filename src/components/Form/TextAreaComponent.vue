<template>
    <div class="TextInput" :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]">
        <label :for="`id-${metadata.propertyName}`" class="label-input">{{ metadata.propertyName }}</label>

        <textarea
            :id="`id-${metadata.propertyName}`"
            :name="metadata.propertyName"
            class="main-input"
            placeholder=" "
            :value="modelValue"
            :disabled="metadata.disabled.value"
            @input="handleInput"
        />

        <div class="validation-messages">
            <span v-for="message in validationMessages" :key="message">{{ message }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: ''
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const isInputValidated = ref(true);
const validationMessages = ref<string[]>([]);

function handleInput(event: Event): void {
    emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
}

function isValidated(): boolean {
    let validated = true;
    validationMessages.value = [];
    if (metadata.required.value && (!props.modelValue || props.modelValue.trim() === '')) {
        validated = false;
        validationMessages.value.push(metadata.requiredMessage.value || `${metadata.propertyName} is required.`);
    }
    if (!metadata.validated.value) {
        validated = false;
        validationMessages.value.push(metadata.validatedMessage.value || `${metadata.propertyName} is not valid.`);
    }
    return validated;
}

function saveItem(): void {
    isInputValidated.value = isValidated();
    if (!isInputValidated.value) {
        Application.View.value.isValid = false;
    }
}

onMounted(() => {
    Application.eventBus.on('validate-inputs', saveItem);
});

onBeforeUnmount(() => {
    Application.eventBus.off('validate-inputs', saveItem);
});
</script>

<style scoped>
/* Component-specific styles inherit from global form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>
