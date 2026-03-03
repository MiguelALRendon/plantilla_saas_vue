<template>
    <div class="TextInput SearchInput" :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]">
        <label :for="`id-${metadata.propertyName}`" class="label-input">{{ metadata.propertyName }}</label>

        <input
            :id="`id-${metadata.propertyName}`"
            :name="metadata.propertyName"
            type="text"
            class="main-input"
            placeholder=" "
            :value="modelValue"
            :disabled="metadata.disabled.value"
            :readonly="metadata.readonly.value"
            @input="handleInput"
            @keyup.enter="handleSearch"
        />
        <button class="right" :disabled="metadata.disabled.value || metadata.readonly.value" @click="handleSearch">
            <span :class="[GGCLASS]">{{ GGICONS.SEARCH }}</span>
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
import { GGICONS, GGCLASS } from '@/constants/ggicons';
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
    (e: 'search', value: string): void;
}>();

const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const isInputValidated = ref(true);
const validationMessages = ref<string[]>([]);

function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}

function handleSearch(): void {
    emit('search', props.modelValue.trim());
}

async function isValidated(): Promise<boolean> {
    let validated = true;
    validationMessages.value = [];

    if (metadata.required.value && !props.modelValue.trim()) {
        validated = false;
        validationMessages.value.push(metadata.requiredMessage.value || `${metadata.propertyName} is required.`);
    }

    if (!metadata.validated.value) {
        validated = false;
        validationMessages.value.push(metadata.validatedMessage.value || `${metadata.propertyName} is not valid.`);
    }

    if (validated) {
        const isAsyncValid = await props.entity.isAsyncValidation(props.propertyKey);
        if (!isAsyncValid) {
            validated = false;
            const asyncMessage = props.entity.asyncValidationMessage(props.propertyKey);
            if (asyncMessage) {
                validationMessages.value.push(asyncMessage);
            }
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
.SearchInput .main-input {
    padding-right: var(--spacing-2xl);
}
</style>
