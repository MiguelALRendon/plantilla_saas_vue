<template>
    <div
        class="TextInput DateInput FileUploadInput"
        :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]"
    >
        <label :for="`id-${metadata.propertyName}`" class="label-input">{{ metadata.propertyName }}</label>
        <input
            :id="`id-${metadata.propertyName}`"
            :name="metadata.propertyName"
            type="text"
            class="main-input"
            placeholder=" "
            :value="currentFile?.name ?? ''"
            :disabled="metadata.disabled.value"
            :readonly="true"
        />

        <!-- Preview button — only shown when a file is loaded -->
        <button
            v-if="currentFile"
            type="button"
            class="preview-btn"
            @click="openPreview"
            :disabled="metadata.disabled.value"
        >
            <span :class="[GGCLASS]">{{ GGICONS.VISIBILITY }}</span>
        </button>

        <!-- Upload trigger button -->
        <button
            type="button"
            class="right"
            @click="triggerFileInput"
            :disabled="metadata.disabled.value || metadata.readonly.value"
        >
            <span :class="[GGCLASS]">{{ GGICONS.UPLOAD_FILE }}</span>
        </button>

        <!-- Hidden native file input -->
        <input
            ref="fileInputRef"
            type="file"
            class="hidden-file-input"
            :accept="acceptAttr"
            @change="onFileChange"
        />
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
import { ToastType } from '@/enums/toast_type';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';
import { previewFile } from '@/stores/file_preview_store';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { GetLanguagedText } from '@/helpers/language_helper';

interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), { modelValue: '' });

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const isInputValidated = ref(true);
const validationMessages = ref<string[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const currentFile = ref<File | null>(null);

const acceptAttr = computed<string>(() => {
    const formats = props.entity.getSupportedFiles(props.propertyKey);
    return formats ? formats.join(',') : '';
});

function triggerFileInput(): void {
    fileInputRef.value?.click();
}

function onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxBytes = props.entity.getMaxFileSizeBytes(props.propertyKey);
    if (maxBytes !== undefined && file.size > maxBytes) {
        const maxMb = Math.round(maxBytes / (1024 * 1024));
        Application.ApplicationUIService.showToast(
            `${GetLanguagedText('errors.file_too_large') || 'El archivo excede el tamaño máximo permitido'} (${maxMb} MB).`,
            ToastType.ERROR
        );
        isInputValidated.value = false;
        input.value = '';
        return;
    }

    currentFile.value = file;
    isInputValidated.value = true;
    emit('update:modelValue', file.name);
    Application.ApplicationUIService.showToast(
        GetLanguagedText('common.file_uploaded_successfully') || 'Archivo cargado correctamente.',
        ToastType.SUCCESS
    );
    input.value = '';
}

async function openPreview(): Promise<void> {
    previewFile.value = currentFile.value;
    const { Configuration } = await import('@/entities/configuration');
    Application.ApplicationUIService.showModal(Configuration, ViewTypes.CUSTOMVIEW, 'file-preview');
}

async function isValidated(): Promise<boolean> {
    let validated = true;
    validationMessages.value = [];

    if (metadata.required.value && !currentFile.value) {
        validated = false;
        validationMessages.value.push(metadata.requiredMessage.value || `${metadata.propertyName} is required.`);
    }
    if (!isInputValidated.value) {
        validated = false;
    }

    const isAsyncValid = await props.entity.isAsyncValidation(props.propertyKey);
    if (!isAsyncValid) {
        validated = false;
        const asyncMessage = props.entity.asyncValidationMessage(props.propertyKey);
        if (asyncMessage) validationMessages.value.push(asyncMessage);
    }

    return validated;
}

async function handleValidation(): Promise<void> {
    isInputValidated.value = await isValidated();
    if (!isInputValidated.value) Application.View.value.isValid = false;
}

onMounted(() => {
    Application.eventBus.on('validate-inputs', handleValidation);
});

onBeforeUnmount(() => {
    Application.eventBus.off('validate-inputs', handleValidation);
});
</script>

<style scoped>
.hidden-file-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
}

/* Square middle button — sits between the text input and the upload button */
.preview-btn {
    border-top: var(--border-width-thin) solid var(--sky);
    border-right: var(--border-width-thin) solid var(--sky);
    border-bottom: var(--border-width-thin) solid var(--sky);
    border-radius: 0;
    width: var(--icon-button-width);
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
    font-size: var(--font-size-large);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-gray);
    transition: background-color var(--transition-normal) var(--timing-ease),
                border-color var(--transition-normal) var(--timing-ease),
                color var(--transition-normal) var(--timing-ease);
}
.preview-btn span {
    color: var(--sky);
}
.preview-btn:hover:not(:disabled) {
    background-color: var(--lavender);
    border-color: var(--lavender);
}
.preview-btn:hover:not(:disabled) span {
    color: var(--white);
}
.TextInput:has(.main-input:focus) .preview-btn,
.TextInput:has(button:focus) .preview-btn {
    background-color: var(--lavender);
    border-color: var(--lavender);
}
.TextInput:has(.main-input:focus) .preview-btn span,
.TextInput:has(button:focus) .preview-btn span {
    color: var(--white);
}
.TextInput.disabled .preview-btn {
    border-color: var(--gray-light);
    cursor: not-allowed;
}
.TextInput.disabled .preview-btn span {
    color: var(--gray-light);
}
.TextInput.nonvalidated .preview-btn {
    border-color: var(--accent-red);
}
.TextInput.nonvalidated .preview-btn span {
    color: var(--accent-red);
}
</style>
