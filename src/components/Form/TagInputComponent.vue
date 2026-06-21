<template>
    <div
        class="TagInput"
        :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]"
    >
        <label class="tag-label">{{ metadata.propertyName }}</label>

        <!-- Chips + input siempre visible inline -->
        <div class="tag-chips-container" @click="focusInput">
            <span
                v-for="(tag, index) in tags"
                :key="index"
                class="tag-chip"
            >
                <span class="tag-chip-label">{{ tag }}</span>
                <button
                    type="button"
                    class="tag-chip-remove"
                    :disabled="metadata.disabled.value || metadata.readonly.value"
                    @click.stop="removeTag(index)"
                >
                    <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
                </button>
            </span>

            <input
                ref="tagInputRef"
                class="tag-inline-input"
                type="text"
                :value="inputValue"
                :placeholder="tags.length === 0 ? 'Escribe etiquetas separadas por comas…' : ''"
                :disabled="metadata.disabled.value || metadata.readonly.value"
                @keydown.enter.prevent="commitCurrent"
                @keydown.backspace="onBackspace"
                @input="inputValue = ($event.target as HTMLInputElement).value"
                @paste.prevent="onPaste"
            />
        </div>
    </div>

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
import { ToastType } from '@/enums/toast_type';
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

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
const inputValue = ref('');
const tagInputRef = ref<HTMLInputElement | null>(null);

/** Split the comma-separated modelValue into an array of non-empty trimmed tags */
const tags = computed<string[]>(() => {
    if (!props.modelValue || props.modelValue.trim() === '') return [];
    return props.modelValue.split(',').map(t => t.trim()).filter(t => t.length > 0);
});

function emitTags(newTags: string[]): void {
    emit('update:modelValue', newTags.join(','));
}

// ── Per-tag validation helpers ────────────────────────────────────────────

function validateTagSize(tag: string): boolean {
    const max = props.entity.getMaxTagSize?.(props.propertyKey);
    if (max !== undefined && tag.length > max) {
        Application.ApplicationUIService.showToast(
            `"${tag}" excede el tamaño máximo por etiqueta (${max} caracteres).`,
            ToastType.ERROR
        );
        return false;
    }
    return true;
}

function validateTagCount(count: number): boolean {
    const maxTags = props.entity.getMaxTags?.(props.propertyKey);
    if (maxTags !== undefined && count > maxTags) {
        Application.ApplicationUIService.showToast(
            `Se alcanzó el límite máximo de etiquetas (${maxTags}).`,
            ToastType.ERROR
        );
        return false;
    }
    return true;
}

function validateTotalSize(joined: string): boolean {
    const max = props.entity.getMaxStringSize?.(props.propertyKey);
    if (max !== undefined && joined.length > max) {
        Application.ApplicationUIService.showToast(
            `El total de etiquetas supera el tamaño máximo permitido (${max} caracteres).`,
            ToastType.ERROR
        );
        return false;
    }
    return true;
}

// ── Adding new chips ──────────────────────────────────────────────────────

function focusInput(): void {
    tagInputRef.value?.focus();
}

function commitCurrent(): void {
    const raw = inputValue.value.trim();
    inputValue.value = '';
    if (!raw) return;
    const candidates = raw.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const current = [...tags.value];
    for (const candidate of candidates) {
        if (!validateTagSize(candidate)) continue;
        if (!validateTagCount(current.length + 1)) break;
        current.push(candidate);
        if (!validateTotalSize(current.join(','))) { current.pop(); break; }
    }
    emitTags(current);
}

function onBackspace(): void {
    if (inputValue.value === '' && tags.value.length > 0) {
        removeTag(tags.value.length - 1);
    }
}

function onPaste(e: ClipboardEvent): void {
    const text = e.clipboardData?.getData('text') ?? '';
    if (!text) return;
    const candidates = text.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const current = [...tags.value];
    for (const candidate of candidates) {
        if (!validateTagSize(candidate)) continue;
        if (!validateTagCount(current.length + 1)) break;
        current.push(candidate);
        if (!validateTotalSize(current.join(','))) { current.pop(); break; }
    }
    emitTags(current);
    inputValue.value = '';
}

// ── Removal ───────────────────────────────────────────────────────────────

function removeTag(index: number): void {
    const updated = [...tags.value];
    updated.splice(index, 1);
    emitTags(updated);
}

// ── Validation ────────────────────────────────────────────────────────────

async function isValidated(): Promise<boolean> {
    let validated = true;
    validationMessages.value = [];

    if (metadata.required.value && tags.value.length === 0) {
        validated = false;
        validationMessages.value.push(metadata.requiredMessage.value || `${metadata.propertyName} es requerido.`);
    }
    if (!metadata.validated.value) {
        validated = false;
        validationMessages.value.push(metadata.validatedMessage.value || `${metadata.propertyName} no es válido.`);
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
/* ── Wrapper ─────────────────────────────────────────────────────────────── */
.TagInput {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--margin-medium);
}

/* ── Label ───────────────────────────────────────────────────────────────── */
.tag-label {
    font-size: var(--font-size-small);
    color: var(--blue-1);
    font-family: 'Inter', sans-serif;
}

/* ── Chips container ─────────────────────────────────────────────────────── */
.tag-chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-small);
    align-items: center;
    padding: var(--spacing-small);
    min-height: 2.5rem;
    border: var(--border-width-thin) solid var(--sky);
    border-radius: var(--border-radius);
    background-color: var(--bg-gray);
}

.TagInput.disabled .tag-chips-container {
    border-color: var(--gray-light);
    cursor: not-allowed;
}

.TagInput.nonvalidated .tag-chips-container {
    border-color: var(--accent-red);
}

/* ── Individual chip ─────────────────────────────────────────────────────── */
.tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    border-radius: 12px;
    border: var(--border-width-thin) solid var(--sky);
    background: var(--bg-gray);
    font-size: var(--font-size-small);
    white-space: nowrap;
    color: var(--blue-1);
}

.tag-chip-label {
    user-select: none;
}

/* ── Remove button — sin cambios de estilo por estado ───────────────────── */
.tag-chip-remove {
    display: inline-flex;
    align-items: center;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: var(--gray-dark, #6b7280);
}

.tag-chip-remove span {
    font-size: 16px;
}

/* ── Inline input dentro del chips container ────────────────────────────── */
.tag-inline-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--font-size-small);
    font-family: 'Inter', sans-serif;
    color: var(--gray-medium);
    min-width: 140px;
    flex: 1;
}
</style>
