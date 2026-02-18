<template>
    <div
        class="TextInput ObjectInput"
        :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]"
    >
        <label :for="`id-${metadata.propertyName}`" class="label-input">{{ metadata.propertyName }}</label>
        <input
            :id="`id-${metadata.propertyName}`"
            :name="metadata.propertyName"
            type="text"
            class="main-input"
            placeholder=" "
            :value="modelValue?.getDefaultPropertyValue()"
            :disabled="metadata.disabled.value"
            readonly="true"
            @input="emitCurrentValue"
        />
        <button class="right" @click="openModal" :disabled="metadata.disabled.value">
            <span :class="GGCLASS">{{ GGICONS.SEARCH }}</span>
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
import { BaseEntity, EmptyEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import { onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue?: BaseEntity;
    modelType: typeof BaseEntity;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => new EmptyEntity({}) as BaseEntity
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: BaseEntity): void;
}>();

const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const isInputValidated = ref(true);
const validationMessages = ref<string[]>([]);

function setNewValue(newValue: BaseEntity): void {
    emit('update:modelValue', newValue);
}

function emitCurrentValue(): void {
    if (props.modelValue) {
        emit('update:modelValue', props.modelValue);
    }
}

function openModal(): void {
    Application.ApplicationUIService.showModalOnFunction(
        props.modelType,
        (param: unknown) => {
            if (param instanceof BaseEntity) {
                setNewValue(param);
            }
        },
        ViewTypes.LOOKUPVIEW
    );
}

async function isValidated(): Promise<boolean> {
    let validated = true;
    validationMessages.value = [];

    if (
        metadata.required.value &&
        (props.modelValue === null || props.modelValue === undefined || props.modelValue instanceof EmptyEntity)
    ) {
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
