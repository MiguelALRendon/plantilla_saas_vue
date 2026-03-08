<template>
    <div
        class="TextInput DateInput HourInput"
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
            :value="modelValue"
            :disabled="metadata.disabled.value"
            :readonly="true"
        />
        <button class="right" type="button" @click="toggleDropdown" :disabled="metadata.disabled.value || metadata.readonly.value">
            <span :class="[GGCLASS]">{{ GGICONS.SCHEDULE }}</span>
        </button>
    </div>

    <Teleport to="body">
        <div
            v-if="dropdownOpen"
            class="input-dropdown-panel"
            :style="dropdownStyle"
            ref="dropdownRef"
        >
            <ClockPickerComponent @select="onTimeSelected" />
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
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import ClockPickerComponent from '@/components/Informative/ClockPickerComponent.vue';

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
const dropdownOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

async function toggleDropdown(): Promise<void> {
    if (dropdownOpen.value) { dropdownOpen.value = false; return; }
    dropdownOpen.value = true;
    await nextTick();
    positionDropdown();
}

function positionDropdown(): void {
    if (!containerRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    dropdownStyle.value = { position: 'fixed', top: `${rect.bottom + 4}px`, left: `${rect.left}px`, zIndex: '9999' };
}

function onTimeSelected(timeStr: string): void {
    emit('update:modelValue', timeStr);
    dropdownOpen.value = false;
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
