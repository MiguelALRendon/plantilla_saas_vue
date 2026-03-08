<template>
    <div
        class="TextInput DateInput DateTimeInput"
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
            :value="displayValue"
            :disabled="metadata.disabled.value"
            :readonly="true"
        />
        <button class="right" type="button" @click="toggleDropdown" :disabled="metadata.disabled.value || metadata.readonly.value">
            <span :class="[GGCLASS]">{{ GGICONS.CALENDAR }}</span>
        </button>
    </div>

    <Teleport to="body">
        <div
            v-if="dropdownOpen"
            class="input-dropdown-panel datetime-panel"
            :style="dropdownStyle"
            ref="dropdownRef"
        >
            <div class="datetime-pickers">
                <CalendarForInputComponent
                    :model-value="pendingDate"
                    @select="onDateSelected"
                />
                <div class="datetime-divider"></div>
                <ClockPickerComponent @select="onTimeSelected" />
            </div>
            <div class="datetime-footer">
                <button type="button" class="datetime-accept-btn" @click="confirmSelection">
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
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import CalendarForInputComponent from '@/components/Informative/CalendarForInputComponent.vue';
import ClockPickerComponent from '@/components/Informative/ClockPickerComponent.vue';
import { GetLanguagedText } from '@/helpers/language_helper';

interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue?: string; // YYYY-MM-DDTHH:MM
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

const pendingDate = ref<string>('');
const pendingTime = ref<string>('');

const displayValue = computed<string>(() => {
    if (!props.modelValue) return '';
    const [datePart, timePart] = props.modelValue.split('T');
    if (!datePart) return '';
    const d = new Date(`${datePart}T00:00:00`);
    if (isNaN(d.getTime())) return props.modelValue;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const time = timePart ? ` ${timePart}` : '';
    return `${day}/${month}/${d.getFullYear()}${time}`;
});

async function toggleDropdown(): Promise<void> {
    if (dropdownOpen.value) { dropdownOpen.value = false; return; }
    // Seed pending values from current model
    if (props.modelValue) {
        const [datePart, timePart] = props.modelValue.split('T');
        pendingDate.value = datePart ?? '';
        pendingTime.value = timePart ?? '';
    } else {
        pendingDate.value = '';
        pendingTime.value = '';
    }
    dropdownOpen.value = true;
    await nextTick();
    positionDropdown();
}

function positionDropdown(): void {
    if (!containerRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    dropdownStyle.value = { position: 'fixed', top: `${rect.bottom + 4}px`, left: `${rect.left}px`, zIndex: '9999' };
}

function onDateSelected(dateStr: string): void {
    pendingDate.value = dateStr;
}

function onTimeSelected(timeStr: string): void {
    pendingTime.value = timeStr;
}

function confirmSelection(): void {
    if (!pendingDate.value && !pendingTime.value) {
        dropdownOpen.value = false;
        return;
    }
    const date = pendingDate.value || '';
    const time = pendingTime.value || '00:00';
    emit('update:modelValue', date ? `${date}T${time}` : '');
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

<style scoped>
.datetime-panel {
    min-width: fit-content;
}

.datetime-pickers {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-small);
    align-items: flex-start;
}

.datetime-divider {
    width: 1px;
    background-color: var(--gray-lighter);
    align-self: stretch;
}

.datetime-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--spacing-small);
    border-top: 1px solid var(--gray-lighter);
    margin-top: var(--spacing-small);
}

.datetime-accept-btn {
    background-color: var(--sky);
    color: var(--white);
    border: none;
    border-radius: var(--border-radius);
    padding: var(--spacing-xs) var(--padding-medium);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 600;
    transition: background-color var(--transition-fast);
}

.datetime-accept-btn:hover {
    background-color: var(--blue-1);
}
</style>
