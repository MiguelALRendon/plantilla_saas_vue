<template>
    <div
        class="boolean-input-container"
        :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]"
    >
        <button class="BooleanInput" @click="value = !value" :disabled="metadata.disabled.value">
            <label :for="`id-${metadata.propertyName}`" class="label-input-boolean"
                >{{ metadata.propertyName }}:
            </label>

            <div :class="['input-button', { true: modelValue }]">
                <span :class="GGCLASS" class="icon">{{ displayIcon }}</span>
            </div>
        </button>

        <div class="help-text" v-if="metadata.helpText.value">
            <span>{{ metadata.helpText.value }}</span>
        </div>

        <div class="validation-messages">
            <span v-for="message in validationMessages" :key="message">{{ message }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const isInputValidated = ref(true);
const validationMessages = ref<string[]>([]);

const value = computed<boolean>({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val)
});

const displayIcon = computed<string>(() => (props.modelValue ? GGICONS.CHECK : GGICONS.CANCEL));

async function isValidated(): Promise<boolean> {
    let validated = true;
    validationMessages.value = [];

    if (metadata.required.value && !props.modelValue) {
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
.boolean-input-container {
    width: 100%;
    box-sizing: border-box;
}

.validation-messages {
    color: var(--red);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
    padding-left: var(--spacing-md);
}

.BooleanInput {
    display: flex;
    flex-direction: row;
    margin-block: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-xs);
    cursor: pointer;
    align-items: center;
    border-radius: var(--border-radius);
    transition: var(--transition-slow) var(--timing-ease);
    border: 0 solid transparent;
}
.BooleanInput:hover {
    background-color: var(--bg-gray);
}

.BooleanInput .label-input-boolean {
    color: var(--lavender);
    font-size: var(--font-size-base);
    height: fit-content;
    cursor: pointer;
}

.BooleanInput .input-button {
    margin-left: var(--margin-medium);
}

.BooleanInput .input-button .icon {
    transform: rotate(180deg);
    transition: all var(--transition-slow) var(--timing-ease);
    color: var(--accent-red);
    border-radius: 100%;
}
.BooleanInput .input-button.true .icon {
    transform: rotate(0deg);
    background-color: var(--btn-info);
    color: var(--white);
}

.BooleanInput:focus {
    border: var(--border-width-medium) solid var(--lavender);
}
.BooleanInput:focus .label-input-boolean {
    color: var(--gray-medium);
}

.boolean-input-container.disabled .BooleanInput {
    cursor: not-allowed;
    pointer-events: none;
    background-color: var(--gray-lighter);
}
.boolean-input-container.disabled .BooleanInput label {
    color: var(--gray-light);
}
.boolean-input-container.disabled .BooleanInput span {
    background-color: var(--gray-light);
    color: var(--gray-lighter);
}

.boolean-input-container.nonvalidated .BooleanInput label {
    color: var(--accent-red);
}
</style>
