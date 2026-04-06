<template>
    <div
        class="TextInput ColorInput"
        :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]"
        ref="containerRef"
    >
        <label :for="`id-${metadata.propertyName}`" class="label-input">{{ metadata.propertyName }}</label>
        <input
            :id="`id-${metadata.propertyName}`"
            :name="metadata.propertyName"
            type="text"
            class="main-input"
            placeholder=" "
            :value="modelValue || '#ffffff'"
            :disabled="metadata.disabled.value || metadata.readonly.value"
            @blur="onHexBlur"
            @keydown.enter.prevent="onHexBlur"
        />
        <button
            class="right color-swatch-btn"
            type="button"
            :style="{ backgroundColor: modelValue || '#ffffff' }"
            @click="toggleDropdown"
            :disabled="metadata.disabled.value || metadata.readonly.value"
        ></button>
    </div>

    <Teleport to="body">
        <div
            v-if="dropdownOpen"
            class="input-dropdown-panel"
            :style="dropdownStyle"
            ref="dropdownRef"
        >
            <ColorPickerComponent
                :model-value="pendingColor"
                @update:model-value="onPickerUpdate"
            />
            <div class="color-footer">
                <button type="button" class="color-accept-btn" @click="confirmColor">
                    {{ GetLanguagedText('common.accept') }}
                </button>
            </div>
        </div>
    </Teleport>

    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>

    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</template>

<script setup lang="ts">
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import ColorPickerComponent from '@/components/Informative/ColorPickerComponent.vue';
import { GetLanguagedText } from '@/helpers/language_helper';

interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), { modelValue: '#ffffff' });

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const isInputValidated = ref(true);
const validationMessages = ref<string[]>([]);
const dropdownOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});
const pendingColor = ref<string>(props.modelValue || '#ffffff');

async function toggleDropdown(): Promise<void> {
    if (dropdownOpen.value) { dropdownOpen.value = false; return; }
    pendingColor.value = props.modelValue || '#ffffff';
    dropdownOpen.value = true;
    await nextTick();
    positionDropdown();
}

function positionDropdown(): void {
    if (!containerRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    dropdownStyle.value = { position: 'fixed', top: `${rect.bottom + 4}px`, left: `${rect.left}px`, zIndex: '9999' };
}

function onPickerUpdate(hex: string): void {
    pendingColor.value = hex;
}

function confirmColor(): void {
    emit('update:modelValue', pendingColor.value);
    dropdownOpen.value = false;
}

function onHexBlur(e: Event): void {
    const value = (e.target as HTMLInputElement).value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
        emit('update:modelValue', value);
    }
}

function onClickOutside(e: MouseEvent): void {
    const target = e.target as Node;
    if (containerRef.value?.contains(target) || dropdownRef.value?.contains(target)) return;
    dropdownOpen.value = false;
}

async function isValidated(): Promise<boolean> {
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
    document.addEventListener('mousedown', onClickOutside);
});

onBeforeUnmount(() => {
    Application.eventBus.off('validate-inputs', handleValidation);
    document.removeEventListener('mousedown', onClickOutside);
});
</script>

<style scoped>
.TextInput.ColorInput {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex-wrap: nowrap;
}

.TextInput.ColorInput .main-input {
    width: 50%;
    text-align: left;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
    border-radius: 0;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
    font-family: monospace;
    font-size: var(--font-size-sm);
}

.color-swatch-btn {
    width: 50% !important;
    border: var(--border-width-thin) solid var(--sky);
    border-left: none;
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    cursor: pointer;
    transition: border-color var(--transition-normal);
}

.color-swatch-btn:disabled {
    cursor: not-allowed;
    border-color: var(--gray-light);
}

.color-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--spacing-small);
    border-top: 1px solid var(--gray-lighter);
    margin-top: var(--spacing-small);
}

.color-accept-btn {
    background-color: var(--sky);
    color: var(--white);
    border: none;
    border-radius: var(--border-radius);
    padding: var(--spacing-xs) var(--padding-medium);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.color-accept-btn:hover {
    background-color: var(--blue-1);
}
</style>
